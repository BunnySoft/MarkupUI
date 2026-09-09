import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRate } from "../src/components/rate/index.js"
import { createRadioGroup } from "../src/components/radio/index.js"
import type { RateController, RateOptions } from "../src/components/rate/index.js"

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
    const three = input("3"), label = three.labels![0], star = label!.querySelector(".mui-rate__glyph")
    three.checked = false; input("4").checked = true
    const before = root.querySelectorAll("input").length, changed = vi.fn()
    input("2").addEventListener("change", changed)
    const enhanced = createRate(root); helpers.push(enhanced)
    expect(enhanced.value).toBe(4)
    expect(input("3")).toBe(three)
    expect(three.labels![0]).toBe(label)
    expect(label!.querySelector(".mui-rate__glyph")).toBe(star)
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
    vi.resetModules()
    const other = await import("../src/components/rate/index.js")
    expect(() => other.createRate(root)).toThrow("owner")
    helper.disconnect()
    helpers.push(other.createRate(root))
  })
  it("does not register the legacy mui-rating name", () => {
    const before = customElements.get("mui-rating")
    fixture()
    expect(customElements.get("mui-rating")).toBe(before)
  })
  it.each([0, 11, -1, 2.5, Infinity, NaN])("rejects unbounded/invalid count %j without rendering choices", count => {
    const { root, helper } = fixture()
    helper.disconnect()
    const before = root.innerHTML
    expect(() => createRate(root, { count })).toThrow()
    expect(root.innerHTML).toBe(before)
  })
  it("rejects readonly and unknown option APIs rather than faking radio readonly", () => {
    const { root, helper, input } = fixture()
    helper.disconnect()
    expect(() => createRate(root, { readonly: true } as RateOptions)).toThrow("readonly")
    input("3").setAttribute("readonly", "")
    expect(() => createRate(root)).toThrow("readonly")
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
    root.querySelector(".mui-rate__glyph")!.removeAttribute("aria-hidden")
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
    root.addEventListener("mui:radio-group-change", aggregate)
    root.addEventListener("mui:rate-change", duplicate)
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
    root.addEventListener("change", changed); root.addEventListener("mui:radio-group-change", changed)
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
    root.addEventListener("mui:radio-group-change", group)
    root.addEventListener("mui:rate-clear", cleared)
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
    const changed = vi.fn(); root.addEventListener("mui:radio-group-change", changed)
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
    const errors = vi.fn(); root.addEventListener("mui:rate-error", errors)
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
    const changed = vi.fn(); root.addEventListener("mui:radio-group-change", changed)
    input("4").click(); root.remove(); await flush()
    expect(helper.connected).toBe(false)
    expect(changed).not.toHaveBeenCalled()
  })
})
