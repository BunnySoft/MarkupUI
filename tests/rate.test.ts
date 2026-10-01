import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRate, Rate, registerRate } from "../src/components/rate/index.js"
import { createRadioGroup } from "../src/components/native-radio.js"
import type { RateController, RateOptions } from "../src/components/rate/index.js"
import { ViewElement } from "../src/core/index.js"

const helpers: RateController[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "quality", options: RateOptions = {}) {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "rate.html"), "utf8"), "text/html")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const root = document.getElementById(id) as HTMLFieldSetElement
  const helper = createRate(root, options); helpers.push(helper)
  return { root, helper, clear: root.querySelector<HTMLButtonElement>("[data-rate-clear]")!,
    output: root.querySelector<HTMLElement>("[data-rate-output]")!,
    input: (value: string) => [...root.querySelectorAll<HTMLInputElement>("input[data-radio]")].find(input => input.value === value)!,
    form: document.getElementById("review") as HTMLFormElement }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("native bounded rating choices", () => {
  it("preserves original controls, labels, stars, defaults and listeners", () => {
    const { root, helper, input } = fixture()
    helper.disconnect()
    const three = input("3"), label = three.labels![0], star = label!.querySelector(".m-rate__glyph")
    three.checked = false; input("4").checked = true
    const before = root.querySelectorAll("input").length, changed = vi.fn()
    input("2").addEventListener("change", changed)
    const enhanced = createRate(root); helpers.push(enhanced)
    expect(enhanced.value).toBe(4)
    expect(input("3")).toBe(three)
    expect(three.labels![0]).toBe(label)
    expect(label!.querySelector(".m-rate__glyph")).toBe(star)
    expect(three.defaultChecked).toBe(true)
    expect(root.querySelectorAll("input")).toHaveLength(before)
    input("2").click()
    expect(changed).toHaveBeenCalledTimes(1)
    expect(root.hasAttribute("role")).toBe(false)
    expect(root.querySelectorAll("[aria-checked],[aria-pressed],[tabindex]")).toHaveLength(0)
  })
  it("reuses Radio ownership, including cross-module duplicates", async () => {
    const { root, helper } = fixture()
    expect(() => createRate(root)).toThrow("owner")
    expect(() => createRadioGroup(root)).toThrow("owner")
    const other = await import("../src/components/rate/rate.js" + "?ownership-copy")
    expect(other.createRate).not.toBe(createRate)
    expect(() => other.createRate(root)).toThrow("owner")
    helper.disconnect()
    helpers.push(other.createRate(root))
  })
  it("does not register the legacy m-rating name", () => {
    const before = customElements.get("m-rating")
    fixture()
    expect(customElements.get("m-rating")).toBe(before)
  })
  it.each([0, -1, 2.5, Infinity, NaN])("rejects invalid count %j without rendering choices", count => {
    const { root, helper } = fixture()
    helper.disconnect()
    const before = root.innerHTML
    expect(() => createRate(root, { count })).toThrow()
    expect(root.innerHTML).toBe(before)
  })
  it("supports an authored count above ten only when all actual native choices exist", () => {
    const { root, helper, input } = fixture()
    helper.disconnect()
    expect(() => createRate(root, { count: 11 })).toThrow("ascending")
    const three = input("3"), choices = root.querySelector(".m-rate__choices")!
    for (let score = 6; score <= 11; score++) {
      const label = document.createElement("label"), radio = document.createElement("input")
      radio.type = "radio"; radio.name = "quality"; radio.value = String(score); radio.setAttribute("data-radio", "")
      label.append(radio, `${score} of 11`); choices.append(label)
    }
    const enhanced = createRate(root, { count: 11 }); helpers.push(enhanced)
    expect(enhanced.count).toBe(11); expect(input("3")).toBe(three)
    enhanced.setValue(11); expect(enhanced.value).toBe(11)
    expect(enhanced.defaultValue).toBe(3)
  })
  it("shares reversible readonly policy but rejects a fictitious native readonly attribute", () => {
    const { root, helper, input } = fixture()
    helper.disconnect()
    input("1").disabled = true
    const enhanced = createRate(root, { readonly: true }); helpers.push(enhanced)
    expect(input("3").disabled).toBe(true)
    expect(root.getAttribute("aria-readonly")).toBe("true")
    expect(enhanced.clear()).toBe(false)
    enhanced.configure({ readonly: false })
    expect(input("3").disabled).toBe(false)
    expect(input("1").disabled).toBe(true)
    enhanced.disconnect()
    root.setAttribute("readonly", "")
    expect(() => createRate(root)).toThrow("readonly")
    root.removeAttribute("readonly")
    input("3").setAttribute("readonly", "")
    expect(() => createRate(root)).toThrow("readonly")
    input("3").removeAttribute("readonly")
    expect(() => createRate(root, { unknown: true } as RateOptions)).toThrow("Unsupported")
  })
  it("requires complete ascending canonical choices and meaningful native labels", () => {
    const { root, helper, input } = fixture()
    helper.disconnect()
    input("2").value = "2.0"
    expect(() => createRate(root)).toThrow("ascending")
    root.querySelector<HTMLInputElement>('input[value="2.0"]')!.value = "2"
    const three = input("3"); three.parentElement!.replaceWith(three)
    expect(() => createRate(root)).toThrow("label")
  })
  it("requires hidden decorative glyphs, not interactive or naming content", () => {
    const { root, helper } = fixture()
    helper.disconnect()
    root.querySelector(".m-rate__glyph")!.removeAttribute("aria-hidden")
    expect(() => createRate(root)).toThrow("aria-hidden")
  })
})

describe("half values, zero/null and native events", () => {
  it("distinguishes no rating from an explicit zero native choice", () => {
    const { helper, form, output, input } = fixture()
    helper.setValue(null)
    expect(helper.value).toBeNull()
    expect(output.textContent).toBe("Not rated")
    expect(new FormData(form).has("quality")).toBe(false)
    expect(input("1").validity.valueMissing).toBe(true)
    helper.setValue(0)
    expect(helper.value).toBe(0)
    expect(new FormData(form).getAll("quality")).toEqual(["0"])
    expect(input("1").validity.valueMissing).toBe(false)
    expect(output.textContent).toBe("0 / 5")
  })
  it("provides actual labelled native half-step choices", () => {
    const { helper, input, form } = fixture("detail", { count: 3, allowHalf: true })
    expect(helper.value).toBe(1.5)
    input("2.5").labels![0]!.click()
    expect(helper.value).toBe(2.5)
    expect(new FormData(form).get("detail")).toBe("2.5")
    expect(input("2.5").type).toBe("radio")
    expect(input("2.5").labels![0]!.textContent).toContain("2.5 of 3")
  })
  it.each([-1, 6, 1.5, "3", NaN, Infinity])("rejects unknown integer score %j without clamping", score => {
    const { helper } = fixture()
    expect(() => helper.setValue(score as number)).toThrow()
    expect(helper.value).toBe(3)
  })
  it("requires an authored zero option rather than fabricating one", () => {
    const { helper, root } = fixture("detail", { count: 3, allowHalf: true })
    const count = root.querySelectorAll("input").length
    expect(() => helper.setValue(0)).toThrow()
    expect(root.querySelectorAll("input")).toHaveLength(count)
    helper.setValue(null)
    expect(helper.value).toBeNull()
  })
  it("does not toggle a selected star off and uses only Radio's existing aggregate", async () => {
    const { root, helper, input } = fixture()
    const native = vi.fn(), aggregate = vi.fn(), duplicate = vi.fn()
    input("4").addEventListener("change", native)
    root.addEventListener("m:radio-group-change", aggregate)
    root.addEventListener("m:rate-change", duplicate)
    input("4").labels![0]!.click(); await flush()
    input("4").click(); await flush()
    expect(helper.value).toBe(4)
    expect(native).toHaveBeenCalledTimes(1)
    expect(aggregate).toHaveBeenCalledTimes(1)
    expect(duplicate).not.toHaveBeenCalled()
  })
  it("keeps programmatic updates/refresh and numeric readout formatting silent and safe", () => {
    const { root, helper, output, input } = fixture("quality", { formatValue: value => `<${value ?? "none"}>` })
    const changed = vi.fn()
    root.addEventListener("change", changed); root.addEventListener("m:radio-group-change", changed)
    helper.setValue(4); helper.refresh()
    expect(output.textContent).toBe("<4>")
    expect(output.children).toHaveLength(0)
    expect(output.hasAttribute("aria-live")).toBe(false)
    expect(input("3").defaultChecked).toBe(true)
    expect(changed).not.toHaveBeenCalled()
  })
})

describe("clear and readonly/disabled policy", () => {
  it("clears through an explicit button, without synthetic radio input/change or group duplicates", async () => {
    const { root, helper, clear, input, form } = fixture()
    const native = vi.fn(), group = vi.fn(), cleared = vi.fn()
    root.addEventListener("input", native); root.addEventListener("change", native)
    root.addEventListener("m:radio-group-change", group)
    root.addEventListener("m:rate-clear", cleared)
    clear.focus(); clear.click(); await flush()
    expect(helper.value).toBeNull()
    expect(document.activeElement).toBe(input("3"))
    expect(clear.hidden).toBe(true)
    expect(native).not.toHaveBeenCalled()
    expect(group).not.toHaveBeenCalled()
    expect(cleared).toHaveBeenCalledTimes(1)
    expect(new FormData(form).has("quality")).toBe(false)
    expect(helper.clear()).toBe(false)
  })
  it("clears zero as a real selected rating, not a falsy no-op", () => {
    const { helper } = fixture()
    helper.setValue(0)
    expect(helper.clear()).toBe(true)
    expect(helper.value).toBeNull()
  })
  it("honors late clear cancellation and never submits the form", async () => {
    const { helper, root, clear, form } = fixture()
    const submit = vi.fn(); form.addEventListener("submit", submit)
    root.addEventListener("click", event => event.preventDefault(), { once: true })
    clear.click(); await flush()
    expect(helper.value).toBe(3)
    expect(submit).not.toHaveBeenCalled()
  })
  it("uses actual static readonly markup with no hidden submitted score", () => {
    const { form } = fixture()
    const readonly = document.getElementById("readonly-score")!
    expect(readonly.querySelectorAll("input,button,[role=radio],[tabindex]")).toHaveLength(0)
    expect(readonly.textContent).toContain("3.5 out of 5")
    expect(new FormData(form).has("readonly-score")).toBe(false)
  })
  it("keeps disabled selected radio state but excludes its native submission", () => {
    const { helper, form, input, clear } = fixture("locked-rate", { count: 3 })
    expect(helper.value).toBe(2)
    expect(new FormData(form).has("locked-score")).toBe(false)
    expect(helper.clear()).toBe(false)
    expect(clear.disabled).toBe(true)
    expect(input("2").disabled).toBe(false)
    helper.setValue(3)
    expect(helper.value).toBe(3)
    expect(new FormData(form).has("locked-score")).toBe(false)
  })
})

describe("Radio boundary/reset/lifetime reuse", () => {
  it("rejects outside native peers without renaming or overriding their browser behavior", async () => {
    const { helper, root, form, input } = fixture()
    const peer = document.createElement("input"); peer.type = "radio"; peer.name = "quality"; peer.value = "outside"
    const label = document.createElement("label"); label.append(peer, "Outside"); form.append(label)
    await flush()
    expect(helper.error).toContain("out-of-scope")
    expect(() => helper.setValue(4)).toThrow("out-of-scope")
    peer.click()
    expect(peer.checked).toBe(true)
    expect(input("3").checked).toBe(false)
    label.remove(); helper.refresh()
    expect(helper.value).toBeNull()
    expect(root.getAttribute("role")).toBeNull()
  })
  it("preserves native checked defaults and cancellation without user change events", async () => {
    const { root, helper, form, input } = fixture()
    const changed = vi.fn(); root.addEventListener("m:radio-group-change", changed)
    helper.setValue(4)
    form.reset(); await flush()
    expect(helper.value).toBe(3)
    input("3").defaultChecked = false; input("2").defaultChecked = true
    helper.setValue(5)
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush()
    expect(helper.value).toBe(5)
    form.reset(); await flush()
    expect(helper.value).toBe(2)
    expect(changed).not.toHaveBeenCalled()
  })
  it("follows common external native form ownership and changed IDs", async () => {
    const { helper, root, form } = fixture()
    const other = document.createElement("form"); other.id = "other"; document.body.append(other)
    for (const input of root.querySelectorAll("input")) input.setAttribute("form", other.id)
    helper.refresh(); helper.setValue(4)
    // jsdom's explicit-form radio reset limitation is covered by real Chromium acceptance.
    other.id = "renamed"
    for (const input of root.querySelectorAll("input")) input.setAttribute("form", other.id)
    helper.refresh(); other.reset(); await flush()
    expect(helper.value).toBe(3)
    expect(new FormData(form).has("quality")).toBe(false)
    expect(new FormData(other).get("quality")).toBe("3")
  })
  it("reports late invalid numeric keys without creating missing controls", async () => {
    const { root, helper, input } = fixture()
    const errors = vi.fn(); root.addEventListener("m:rate-error", errors)
    input("2").value = "9"; await flush()
    expect(errors).toHaveBeenCalledTimes(1)
    expect(() => helper.refresh()).toThrow("ascending")
    root.querySelector<HTMLInputElement>('input[value="9"]')!.value = "2"; helper.refresh()
    expect(helper.error).toBeNull()
  })
  it("restores only owned UI attributes and leaves edited native values/defaults intact", async () => {
    const { helper, clear, output, input } = fixture()
    helper.setValue(4)
    clear.disabled = true; output.hidden = true
    await flush()
    helper.disconnect()
    expect(clear.disabled).toBe(true)
    expect(clear.hidden).toBe(true)
    expect(output.hidden).toBe(true)
    expect(input("4").checked).toBe(true)
    expect(input("3").defaultChecked).toBe(true)
    expect(() => helper.setValue(3)).toThrow("disconnected")
  })
  it("disposes removed roots and cancels pending radio notifications", async () => {
    const { root, helper, input } = fixture()
    const changed = vi.fn(); root.addEventListener("m:radio-group-change", changed)
    input("4").click(); root.remove(); await flush()
    expect(helper.connected).toBe(false)
    expect(changed).not.toHaveBeenCalled()
  })
})

describe("canonical Rate ViewElement", () => {
  it("exports canonical own-tag ViewElement and registers m-rate", () => {
    expect(Rate.tag).toBe("m-rate")
    expect(customElements.get(Rate.tag)).toBe(Rate)
    expect(ViewElement.prototype.isPrototypeOf(Rate.prototype)).toBe(true)
    expect(customElements.get("m-rate")).toBe(Rate)
    expect(Rate.observedAttributes).toEqual([
      "value",
      "default-value",
      "count",
      "allow-half",
      "disabled",
      "readonly",
      "clearable",
      "size",
      "name",
      "form",
      "label",
    ])
    const define = vi.fn()
    expect(() => registerRate({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerRate()).not.toThrow()
  })

  it("handles typed properties, default values and validates inputs", () => {
    const element = document.createElement("m-rate") as Rate
    expect(element.value).toBe(0)
    expect(element.count).toBe(5)
    expect(element.allowHalf).toBe(false)
    expect(element.disabled).toBe(false)
    expect(element.readonly).toBe(false)
    expect(element.clearable).toBe(false)
    expect(element.size).toBe("medium")

    // value
    element.value = 4
    expect(element.value).toBe(4)
    expect(element.getAttribute("value")).toBe("4")
    expect(() => { element.value = NaN }).toThrow(RangeError)
    expect(() => { element.value = -1 }).toThrow(RangeError)

    // count
    element.count = 8
    expect(element.count).toBe(8)
    expect(element.getAttribute("count")).toBe("8")
    expect(() => { element.count = 0 }).toThrow(RangeError)
    expect(() => { element.count = -5 }).toThrow(RangeError)

    // allowHalf
    element.allowHalf = true
    expect(element.allowHalf).toBe(true)
    expect(element.hasAttribute("allow-half")).toBe(true)
    element.allowHalf = false
    expect(element.allowHalf).toBe(false)
    expect(element.hasAttribute("allow-half")).toBe(false)

    // disabled
    element.disabled = true
    expect(element.disabled).toBe(true)
    expect(element.hasAttribute("disabled")).toBe(true)
    element.disabled = false
    expect(element.disabled).toBe(false)
    expect(element.hasAttribute("disabled")).toBe(false)

    // readonly
    element.readonly = true
    expect(element.readonly).toBe(true)
    expect(element.hasAttribute("readonly")).toBe(true)
    element.readonly = false
    expect(element.readonly).toBe(false)
    expect(element.hasAttribute("readonly")).toBe(false)

    // clearable
    element.clearable = true
    expect(element.clearable).toBe(true)
    expect(element.hasAttribute("clearable")).toBe(true)
    element.clearable = false
    expect(element.clearable).toBe(false)
    expect(element.hasAttribute("clearable")).toBe(false)

    // size
    element.size = "small"
    expect(element.size).toBe("small")
    expect(element.getAttribute("size")).toBe("small")
    element.size = "large"
    expect(element.size).toBe("large")
    expect(element.getAttribute("size")).toBe("large")
    expect(() => { Reflect.set(element, "size", "huge") }).toThrow(RangeError)
  })

  it("renders choices with one native semantic owner and commits native interaction once", async () => {
    const element = document.createElement("m-rate") as Rate
    element.value = 3
    document.body.append(element)
    expect(element.native.classList.contains("m-rate")).toBe(true)
    expect(element.native.getAttribute("data-rate-cumulative")).toBe("")
    expect(element.native.getAttribute("data-size")).toBe("medium")
    expect(element.hasAttribute("role")).toBe(false)
    expect(element.native.hasAttribute("role")).toBe(false)
    expect(element.native.querySelector("legend")!.textContent).toBe("Rating")

    const inputs = element.querySelectorAll<HTMLInputElement>("input[type='radio']")
    expect(inputs).toHaveLength(6)
    expect(inputs[3]!.checked).toBe(true)
    expect(inputs[3]!.value).toBe("3")

    const changeSpy = vi.fn()
    element.addEventListener("m:change", changeSpy)

    inputs[5]!.click()
    await flush()
    expect(changeSpy).toHaveBeenCalledOnce()
    expect(changeSpy.mock.calls[0]![0].detail).toEqual({ value: 5 })
    expect(element.value).toBe(5)
    expect(inputs[5]!.checked).toBe(true)
  })

  it("supports clearable action via clear() and clicking active choice without conflating zero and null", async () => {
    const element = document.createElement("m-rate") as Rate
    element.clearable = true
    element.value = 3
    document.body.append(element)

    const clearBtn = element.querySelector<HTMLButtonElement>("[data-rate-clear]")
    expect(clearBtn).not.toBeNull()
    expect(clearBtn!.hidden).toBe(false)

    const changeSpy = vi.fn()
    element.addEventListener("m:change", changeSpy)

    element.clear()
    expect(element.value).toBeNull()
    expect(changeSpy).toHaveBeenCalledOnce()
    expect(changeSpy.mock.calls[0]![0].detail).toEqual({ value: null })
    expect(clearBtn!.hidden).toBe(true)

    const inputs = element.querySelectorAll<HTMLInputElement>("input[type='radio']")
    expect([...inputs].every(input => !input.checked)).toBe(true)

    inputs[2]!.click()
    await flush()
    expect(element.value).toBe(2)
    expect(changeSpy).toHaveBeenCalledTimes(2)

    const choice2 = inputs[2]!.closest(".m-rate__choice") as HTMLElement
    choice2.click()
    await flush()
    expect(element.value).toBeNull()
    expect(changeSpy).toHaveBeenCalledTimes(3)
    expect(changeSpy.mock.calls[2]![0].detail).toEqual({ value: null })
  })

  it("supports half-step rating choices with allowHalf", () => {
    const element = document.createElement("m-rate") as Rate
    element.allowHalf = true
    element.count = 3
    element.value = 1.5
    document.body.append(element)

    const inputs = element.querySelectorAll<HTMLInputElement>("input[type='radio']")
    expect(inputs).toHaveLength(7)

    const checked = element.querySelector<HTMLInputElement>("input:checked")
    expect(checked?.value).toBe("1.5")

    const halfGlyphs = element.querySelectorAll(".m-rate__glyph[data-half]")
    expect(halfGlyphs).toHaveLength(3)
  })

  it("blocks user changes when disabled or readonly", () => {
    const element = document.createElement("m-rate") as Rate
    element.value = 2
    element.disabled = true
    document.body.append(element)

    expect(element.native.disabled).toBe(true)
    const inputs = element.querySelectorAll<HTMLInputElement>("input[type='radio']")
    expect(inputs[0]!.matches(":disabled")).toBe(true)
    expect(inputs[0]!.disabled).toBe(false)

    const changeSpy = vi.fn()
    element.addEventListener("m:change", changeSpy)

    inputs[3]!.click()
    expect(changeSpy).not.toHaveBeenCalled()

    element.clear()
    expect(changeSpy).not.toHaveBeenCalled()
    expect(element.value).toBe(2)

    element.disabled = false
    element.readonly = true
    expect(element.native.getAttribute("aria-readonly")).toBe("true")
    expect(inputs[0]!.disabled).toBe(true)

    element.clear()
    expect(changeSpy).not.toHaveBeenCalled()
  })

  describe("Rate single-owner defaults, schema and lifetime", () => {
    function generated(value?: number | null) {
      const form = document.createElement("form"), rate = new Rate()
      rate.name = "score"
      if (value !== undefined) rate.value = value
      form.append(rate); document.body.append(form)
      const input = (score: number) => rate.native.querySelector<HTMLInputElement>(`input[value="${score}"]`)!
      return { rate, form, input }
    }

    it("retains the generated initial zero as a real native default rather than an empty score", async () => {
      const { rate, form, input } = generated()
      expect(rate.value).toBe(0); expect(rate.defaultValue).toBe(0)
      expect(input(0).checked).toBe(true); expect(input(0).defaultChecked).toBe(true)
      expect(new FormData(form).get("score")).toBe("0")
      rate.value = null
      expect(new FormData(form).has("score")).toBe(false)
      expect(rate.defaultValue).toBe(0)
      form.reset(); await flush()
      expect(rate.value).toBe(0)
    })

    it("separates initialization, silent live writes, changed native defaults and reset cancellation", async () => {
      const { rate, form, input } = generated(3)
      const changes = vi.fn(); rate.addEventListener("m:change", changes)
      expect(rate.defaultValue).toBe(3)
      rate.value = 4
      expect(input(3).defaultChecked).toBe(true)
      rate.defaultValue = 2
      expect(rate.value).toBe(4); expect(rate.defaultValue).toBe(2)
      form.addEventListener("reset", event => event.preventDefault(), { once: true })
      form.reset(); await flush(); expect(rate.value).toBe(4)
      form.reset(); await flush(); expect(rate.value).toBe(2)
      input(2).defaultChecked = false; input(1).defaultChecked = true
      rate.refresh()
      expect(rate.defaultValue).toBe(1)
      rate.setValue(5); form.reset(); await flush()
      expect(rate.value).toBe(1); expect(changes).not.toHaveBeenCalled()
    })

    it("supports an explicit null default independently of its initial live value", async () => {
      const rate = new Rate(), form = document.createElement("form")
      rate.value = 3; rate.defaultValue = null
      form.append(rate); document.body.append(form)
      expect(rate.value).toBe(3); expect(rate.defaultValue).toBeNull()
      form.reset(); await flush(); expect(rate.value).toBeNull()
      const parent = rate.parentElement!
      rate.remove(); parent.append(rate); await flush()
      expect(rate.value).toBeNull(); expect(rate.defaultValue).toBeNull()
    })

    it("retains surviving native choices, decorations, listeners and focus across valid live schema changes", async () => {
      const { rate, input } = generated(3), three = input(3), label = three.labels![0]!
      const glyph = label.querySelector(".m-rate__glyph"), listener = vi.fn()
      three.addEventListener("change", listener)
      const decoration = document.createElement("span"); decoration.textContent = "Author decoration"; label.append(decoration)
      three.focus()
      rate.count = 6
      rate.allowHalf = true
      expect(input(3)).toBe(three); expect(three.labels![0]).toBe(label)
      expect(label.querySelector(".m-rate__glyph")).toBe(glyph); expect(decoration.parentElement).toBe(label)
      expect(document.activeElement).toBe(three)
      expect(three.defaultChecked).toBe(true)
      rate.value = 2.5
      expect(() => { rate.allowHalf = false }).toThrow()
      expect(rate.allowHalf).toBe(true); expect(rate.value).toBe(2.5)
      expect(() => { rate.count = 2 }).toThrow()
      expect(rate.count).toBe(6); expect(rate.defaultValue).toBe(3)
      rate.value = 3; rate.allowHalf = false; rate.count = 4
      expect(input(3)).toBe(three); expect(rate.native.querySelectorAll("input")).toHaveLength(5)
      expect(document.activeElement).toBe(three)
      input(2).click(); three.click(); await flush()
      expect(listener).toHaveBeenCalledOnce()
    })

    it("preserves the public count range above ten, including half choices and detached schema validation", () => {
      const { rate, input } = generated(3), three = input(3)
      rate.count = 11; rate.allowHalf = true; rate.value = 10.5
      expect(rate.native.querySelectorAll("input")).toHaveLength(23)
      expect(rate.value).toBe(10.5); expect(input(3)).toBe(three); expect(rate.defaultValue).toBe(3)
      rate.remove()
      expect(() => { rate.count = 10 }).toThrow()
      expect(rate.count).toBe(11)
      expect(() => { rate.allowHalf = false }).toThrow()
      expect(rate.allowHalf).toBe(true)
    })

    it("adopts authored controls and defaults without imposing generated zero or host semantics", async () => {
      const { root, helper, input } = fixture()
      helper.disconnect()
      const host = new Rate(), form = root.parentElement!
      const three = input("3"), label = three.labels![0]!, glyph = label.querySelector(".m-rate__glyph")
      root.setAttribute("aria-label", "Author rating")
      host.append(root); form.append(host)
      expect(host.native).toBe(root); expect(host.value).toBe(3); expect(host.defaultValue).toBe(3)
      expect(input("3")).toBe(three); expect(three.labels![0]).toBe(label)
      expect(label.querySelector(".m-rate__glyph")).toBe(glyph)
      expect(root.getAttribute("aria-label")).toBe("Author rating")
      expect(root.querySelectorAll("input")).toHaveLength(6)
      expect(() => createRate(root)).toThrow("owner")
      expect(() => createRadioGroup(root)).toThrow("owner")
      host.value = null; host.remove(); form.append(host); await flush()
      expect(host.value).toBeNull(); expect(host.defaultValue).toBe(3)
    })

    it("preserves checkedness, defaults and nodes through reconnect while canceling pending actions and notifications", async () => {
      const { rate, form, input } = generated(3), native = rate.native, three = input(3)
      rate.clearable = true
      const changes = vi.fn(); rate.addEventListener("m:change", changes)
      input(4).click()
      rate.remove(); form.append(rate); await flush()
      expect(changes).not.toHaveBeenCalled(); expect(rate.value).toBe(4)
      expect(rate.native).toBe(native); expect(input(3)).toBe(three); expect(rate.defaultValue).toBe(3)
      rate.native.querySelector<HTMLButtonElement>("[data-rate-clear]")!.click()
      rate.remove(); form.append(rate); await flush()
      expect(rate.value).toBe(4); expect(changes).not.toHaveBeenCalled()
      input(5).click(); await flush()
      expect(changes).toHaveBeenCalledOnce()
      rate.remove(); rate.value = null; rate.defaultValue = 2; form.append(rate); await flush()
      expect(rate.value).toBeNull(); expect(rate.defaultValue).toBe(2)
    })

    it("shares selected-choice clear with the native entry, honors late cancellation and never clears a first activation", async () => {
      const { root, helper, input } = fixture()
      helper.configure({ clearable: true })
      const changed = vi.fn(), cleared = vi.fn(), native = vi.fn()
      root.addEventListener("m:change", changed); root.addEventListener("m:rate-clear", cleared)
      root.addEventListener("change", native)
      input("4").labels![0]!.click(); await flush()
      expect(helper.value).toBe(4); expect(cleared).not.toHaveBeenCalled()
      root.addEventListener("click", event => event.preventDefault(), { once: true })
      input("4").labels![0]!.click(); await flush(); expect(helper.value).toBe(4)
      input("4").labels![0]!.click(); await flush()
      expect(helper.value).toBeNull(); expect(cleared).toHaveBeenCalledOnce()
      expect(changed).toHaveBeenCalledTimes(2); expect(native).toHaveBeenCalledOnce()
    })

    it("retains clear controls and author listeners while changing clearable presentation", async () => {
      const { rate } = generated(3)
      rate.clearable = true
      const button = rate.native.querySelector<HTMLButtonElement>("[data-rate-clear]")!, click = vi.fn()
      button.addEventListener("click", click)
      rate.clearable = false
      expect(button.isConnected).toBe(true); expect(button.hidden).toBe(true)
      rate.clearable = true; expect(button.hidden).toBe(false)
      button.click(); await flush()
      expect(click).toHaveBeenCalledOnce(); expect(rate.value).toBeNull()
    })

    it("keeps native fieldset disables and reversible readonly distinct from per-input author disables", async () => {
      const { rate, form, input } = generated(3)
      input(1).disabled = true; await flush()
      rate.disabled = true
      expect(input(3).disabled).toBe(false); expect(input(3).matches(":disabled")).toBe(true)
      expect(new FormData(form).has("score")).toBe(false)
      rate.disabled = false; rate.readonly = true
      expect(input(3).disabled).toBe(true)
      expect(new FormData(form).has("score")).toBe(false); expect(rate.clear()).toBe(false)
      rate.value = 4; rate.readonly = false
      expect(input(1).disabled).toBe(true); expect(input(4).disabled).toBe(false)
      expect(new FormData(form).get("score")).toBe("4")
    })

    it("honors disabled ancestor fieldsets and author ARIA without making a focusable proxy", async () => {
      const outer = document.createElement("fieldset"), legend = document.createElement("legend"), rate = new Rate()
      legend.textContent = "Outer"; outer.append(legend, rate); document.body.append(outer)
      rate.value = 3; rate.clearable = true
      outer.disabled = true; await flush()
      expect(rate.clear()).toBe(false)
      expect(rate.native.querySelector<HTMLButtonElement>("[data-rate-clear]")!.disabled).toBe(true)
      outer.disabled = false; await flush()
      rate.native.setAttribute("aria-disabled", "true"); await flush()
      expect(rate.clear()).toBe(false)
      rate.remove(); outer.append(rate); await flush()
      expect(rate.native.getAttribute("aria-disabled")).toBe("true")
      expect(rate.querySelectorAll("[tabindex],[aria-checked],[role=radio],[role=radiogroup]")).toHaveLength(0)
    })

    it("maps explicit names/external form association and preserves external labels and native focus", async () => {
      const { rate, form, input } = generated(3), other = document.createElement("form")
      other.id = "external-rate-form"; document.body.append(other)
      rate.setAttribute("form", other.id)
      rate.name = "external-score"
      expect(rate.form).toBe(other)
      expect(new FormData(form).has("score")).toBe(false)
      expect(new FormData(other).get("external-score")).toBe("3")
      const three = input(3), label = document.createElement("label"), click = vi.fn()
      three.id = "externally-labelled-score"; label.htmlFor = three.id; label.textContent = "External score label"
      label.addEventListener("click", click); document.body.append(label)
      rate.focus(); expect(document.activeElement).toBe(three)
      rate.blur(); expect(document.activeElement).not.toBe(three)
      label.click(); await flush()
      expect(click).toHaveBeenCalledOnce(); expect(three.labels).toContain(label)
      rate.label = "Updated rating"; expect(rate.native.querySelector("legend")!.textContent).toBe("Updated rating")
      rate.remove(); form.append(rate); await flush()
      expect(rate.form).toBe(other); expect(three.labels).toContain(label)
    })

    it("retains later application association/default/ARIA edits through lifecycle cleanup", async () => {
      const { rate, form, input } = generated(3), other = document.createElement("form")
      other.id = "late-rate-form"; document.body.append(other)
      for (const control of rate.native.querySelectorAll("input")) {
        control.name = "late-score"; control.setAttribute("form", other.id)
      }
      rate.native.setAttribute("aria-label", "Application name"); input(3).defaultChecked = false; input(2).defaultChecked = true
      await flush(); rate.refresh()
      expect(rate.form).toBe(other); expect(rate.name).toBe("late-score")
      rate.remove(); form.append(rate); await flush()
      expect(rate.form).toBe(other); expect(input(3).name).toBe("late-score")
      expect(rate.name).toBe("late-score")
      expect(rate.defaultValue).toBe(2); expect(rate.native.getAttribute("aria-label")).toBe("Application name")
    })

    it("enhances late authored clear/readout nodes without replacing them or their listeners", async () => {
      const { rate } = generated(3), button = document.createElement("button"), output = document.createElement("span")
      button.type = "button"; button.setAttribute("data-rate-clear", ""); button.textContent = "Author clear"
      output.setAttribute("data-rate-output", ""); output.textContent = "Author readout"
      const clicks = vi.fn(); button.addEventListener("click", clicks)
      rate.native.append(output, button); await flush()
      expect(output.textContent).toBe("3 / 5")
      button.click(); await flush()
      expect(rate.value).toBeNull(); expect(clicks).toHaveBeenCalledOnce()
      rate.remove()
      expect(output.textContent).toBe("Author readout")
    })

    it("replays pre-upgrade own properties into the same owner and supports early native access", () => {
      const rate = new Rate()
      const native = rate.native
      expect(rate.value).toBe(0); expect(rate.defaultValue).toBe(0)
      Object.defineProperty(rate, "value", { configurable: true, value: 2.5 })
      Object.defineProperty(rate, "allowHalf", { configurable: true, value: true })
      Object.defineProperty(rate, "defaultValue", { configurable: true, value: 1.5 })
      document.body.append(rate)
      expect(Object.hasOwn(rate, "value")).toBe(false)
      expect(rate.native).toBe(native); expect(rate.value).toBe(2.5); expect(rate.defaultValue).toBe(1.5)
    })

    it("reports formatting errors and releases the native owner after initialization fails", () => {
      const { root, helper } = fixture()
      helper.disconnect()
      expect(() => createRate(root, { formatValue: () => { throw new Error("format failed") } })).toThrow("format failed")
      const restored = createRate(root); helpers.push(restored)
      const errors = vi.fn(); root.addEventListener("m:rate-error", errors)
      expect(() => restored.configure({ formatValue: () => { throw new Error("live format failed") } })).toThrow("live format failed")
      expect(restored.error).toBe("live format failed")
      restored.configure({ formatValue: value => String(value) })
      expect(restored.error).toBeNull()
    })
  })
})
