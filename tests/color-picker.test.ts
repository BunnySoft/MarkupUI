import { checkSizeRecommendation } from "../scripts/size-policy.mjs"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import * as colorPickerApi from "../src/components/color-picker/index.js"
import { ColorPicker, registerColorPicker, createColorPicker } from "../src/components/color-picker/index.js"
import { ViewElement } from "../src/core/index.js"
import { createInput } from "../src/components/native-input.js"
import { coordinateForm as createForm } from "../src/components/form/controller.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 20))
function fixture(withEditor = true) {
  document.body.innerHTML = `<form id="form"><fieldset data-color-picker id="root"><legend>Color</legend>
    <label for="color">Color</label><input data-color-control id="color" type="color" name="theme.color" value="#336699" list="palette">
    <span data-color-output hidden>Original readout</span><datalist id="palette"><option value="#336699"></option><option value="#008844"></option></datalist>
    ${withEditor ? '<div data-color-entry hidden><label for="hex">Hex draft</label><span class="m-input" data-input id="input-root"><input data-color-hex data-input-control id="hex" type="text" value="#336699" required pattern="#[0-9a-fA-F]{6}" maxlength="7" disabled aria-describedby="help"><span data-input-count id="count"></span></span><button type="button" data-color-apply hidden>Apply</button><button type="button" data-color-revert hidden>Revert</button></div>' : ""}
    </fieldset><button name="intent" value="save">Submit</button></form><p id="help">Help</p><p id="feedback" hidden></p><button type="button" id="outside">Outside</button>`
  const root = document.querySelector<HTMLFieldSetElement>("#root")!, control = document.querySelector<HTMLInputElement>("#color")!
  const helper = createColorPicker(root); helpers.push(helper)
  return { helper, root, control, hex: document.querySelector<HTMLInputElement>("#hex")!, form: document.querySelector("form")!,
    output: root.querySelector<HTMLElement>("[data-color-output]")!, apply: root.querySelector<HTMLButtonElement>("[data-color-apply]")!,
    revert: root.querySelector<HTMLButtonElement>("[data-color-revert]")! }
}
function edit(hex: HTMLInputElement, value: string) { hex.value = value; hex.dispatchEvent(new InputEvent("input", { bubbles: true })) }
afterEach(() => { helpers.splice(0).reverse().forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("classic RGB value and native control ownership", () => {
  it("preserves original controls, labels, names, datalist, listeners and defaults", () => {
    const { helper, control, form, output } = fixture()
    const label = control.labels![0], list = control.list, listener = vi.fn()
    control.addEventListener("input", listener)
    helper.setValue("#ABCDEF")
    expect(helper.value).toBe("#abcdef"); expect(control.defaultValue).toBe("#336699")
    expect(control.labels![0]).toBe(label); expect(control.list).toBe(list); expect(output.textContent).toBe("#abcdef")
    expect(new FormData(form).getAll("theme.color")).toEqual(["#abcdef"])
    expect(listener).not.toHaveBeenCalled(); expect(form.querySelectorAll('input[name]')).toHaveLength(1)
  })
  it.each([null, undefined, "#fff", "#12345g", "red", "transparent", "color(display-p3 1 0 0)", " #123456", "#123456\n", 0,
    "rgba(1,2,3,1.001)", "rgba(1,2,3,.1234)", "rgb(256,0,0)", "rgb(1.2,0,0)", "hsl(361,50%,50%)", "hsl(1,101%,0%)", "rgb(1 2 3 / .5)"])("rejects unsupported value %j before native black fallback", value => {
    const { helper, control, hex } = fixture()
    expect(() => helper.setValue(value as string)).toThrow()
    expect(control.value).toBe("#336699"); expect(hex.value).toBe("#336699")
  })
  it("treats black as a real color, not a null/clear value", () => {
    const { helper, form } = fixture(false)
    helper.setValue("#000000"); expect(helper.value).toBe("#000000")
    expect(new FormData(form).get("theme.color")).toBe("#000000")
    expect(helper.clear()).toBe(true); expect(helper.value).toBe("")
    expect(new FormData(form).get("theme.color")).toBe("")
  })
  it("accepts omitted native default as black but rejects explicitly invalid defaults", () => {
    const { helper, root, control } = fixture(false); helper.disconnect()
    root.querySelector("[data-color-value]")!.remove()
    control.removeAttribute("value"); control.value = "#000000"
    const next = createColorPicker(root); helpers.push(next); expect(next.value).toBe("#000000"); next.disconnect()
    control.setAttribute("value", "rgba(0,0,0,0)")
    expect(() => createColorPicker(root)).toThrow("RGB")
  })
  it.each(["alpha", "colorspace"])("does not claim or flatten unsupported native %s markup", async name => {
    const { helper, root, control } = fixture(false)
    control.setAttribute(name, name === "colorspace" ? "display-p3" : "")
    await flush(); expect(helper.connected).toBe(false); expect(control.hasAttribute(name)).toBe(true)
    expect(() => createColorPicker(root)).toThrow("RGB")
  })
  it("rejects duplicate owners across module copies and releases them", async () => {
    const { helper, root } = fixture()
    expect(() => createColorPicker(root)).toThrow("owner")
    const other = await import("../src/components/color-picker/color-picker.js" + "?ownership-copy")
    expect(other.createColorPicker).not.toBe(createColorPicker)
    expect(() => other.createColorPicker(root)).toThrow("owner")
    helper.disconnect(); helpers.push(other.createColorPicker(root))
  })
  it("validates native palette literals without rendering or replacing options", () => {
    const { helper, control } = fixture(false), option = control.list!.options[0]!
    helper.refresh(); expect(control.list!.options[0]).toBe(option)
    option.value = "hsl(0,100%,50%)"
    expect(() => helper.refresh()).toThrow("swatches"); expect(option.value).toBe("hsl(0,100%,50%)")
  })
})

describe("optional native hex draft and deliberate apply", () => {
  it("keeps invalid drafts until Apply/Revert while the real color stays valid", async () => {
    const { helper, hex, control, apply } = fixture()
    edit(hex, "#12"); expect(helper.dirty).toBe(true)
    expect(hex.validity.customError).toBe(true); expect(helper.commit()).toBe(false)
    const report = vi.spyOn(hex, "reportValidity")
    apply.click(); await flush(); expect(report).toHaveBeenCalledOnce()
    expect(control.value).toBe("#336699"); expect(hex.value).toBe("#12")
    helper.restoreDraft(); expect(hex.value).toBe("#336699"); expect(helper.dirty).toBe(false)
  })
  it("rejects empty drafts through native required, never coercing them to black", () => {
    const { helper, hex, control } = fixture()
    helper.configure({ required: true })
    edit(hex, ""); expect(hex.validity.valueMissing).toBe(true); expect(helper.commit()).toBe(false)
    expect(control.value).toBe("#336699"); expect(hex.value).toBe("")
  })
  it("commits a valid uppercase hex draft canonically with one input/change pair", () => {
    const { helper, hex, control } = fixture(), inputs = vi.fn(), changes = vi.fn()
    control.addEventListener("input", inputs); control.addEventListener("change", changes)
    edit(hex, "#AABBCC"); expect(helper.commit()).toBe(true)
    expect(control.value).toBe("#aabbcc"); expect(hex.value).toBe("#aabbcc")
    expect(inputs).toHaveBeenCalledOnce(); expect(changes).toHaveBeenCalledOnce()
    expect(helper.commit()).toBe(true); expect(inputs).toHaveBeenCalledOnce()
  })
  it("does not duplicate native color input/change and preserves dirty text across native changes", () => {
    const { helper, control, hex, output } = fixture(), input = vi.fn(), change = vi.fn()
    control.addEventListener("input", input); control.addEventListener("change", change)
    edit(hex, "#AA")
    control.value = "#008844"; control.dispatchEvent(new Event("input", { bubbles: true })); control.dispatchEvent(new Event("change", { bubbles: true }))
    expect(input).toHaveBeenCalledOnce(); expect(change).toHaveBeenCalledOnce()
    expect(output.textContent).toBe("#008844"); expect(hex.value).toBe("#AA"); expect(helper.dirty).toBe(true)
  })
  it("keeps a dirty draft on silent setters/refresh and avoids clean-field caret churn", () => {
    const { helper, hex } = fixture()
    hex.focus(); hex.setSelectionRange(2, 5); helper.refresh()
    expect([hex.selectionStart, hex.selectionEnd]).toEqual([2, 5])
    helper.setValue("#112233"); expect(hex.value).toBe("#112233"); expect([hex.selectionStart, hex.selectionEnd]).toEqual([2, 5])
    edit(hex, "#a"); helper.setValue("#998877"); helper.refresh()
    expect(hex.value).toBe("#a"); expect(helper.value).toBe("#998877")
  })
  it("preserves native external custom validity on both color and draft fields", () => {
    const { helper, control, hex } = fixture()
    hex.setCustomValidity("Application draft error"); edit(hex, "#112233")
    expect(helper.commit()).toBe(false); helper.restoreDraft()
    expect(hex.validationMessage).toBe("Application draft error")
    control.setCustomValidity("Application color error"); helper.setValue("#abcdef"); helper.disconnect()
    expect(control.validationMessage).toBe("Application color error")
    hex.disabled = false; expect(hex.validationMessage).toBe("Application draft error")
  })
  it("does not send a stale change after an input listener supersedes the value", () => {
    const { helper, control, hex } = fixture(), changes = vi.fn()
    control.addEventListener("input", () => helper.setValue("#000000"), { once: true }); control.addEventListener("change", changes)
    edit(hex, "#abcdef"); helper.commit()
    expect(control.value).toBe("#000000"); expect(changes).not.toHaveBeenCalled()
  })
  it("synchronizes distinct reentrant native input events during an Apply notification", () => {
    const { helper, control, hex, output } = fixture(), changes = vi.fn()
    control.addEventListener("input", () => {
      control.value = "#778899"; control.dispatchEvent(new Event("input", { bubbles: true }))
    }, { once: true })
    control.addEventListener("change", changes)
    edit(hex, "#112233"); helper.commit()
    expect(control.value).toBe("#778899"); expect(hex.value).toBe("#778899"); expect(output.textContent).toBe("#778899")
    expect(helper.dirty).toBe(false); expect(changes).not.toHaveBeenCalled()
  })
  it("does not cancel a valid Apply because unrelated status/refresh work occurred", async () => {
    const { helper, control, hex, apply } = fixture()
    const status = document.createElement("p"); document.body.append(status)
    apply.addEventListener("click", () => { status.textContent = "Applying"; helper.refresh() })
    edit(hex, "#112233"); apply.click(); await flush()
    expect(control.value).toBe("#112233"); expect(helper.dirty).toBe(false)
  })
  it("guards queued Apply against changed drafts and cancellation", async () => {
    const { helper, hex, apply, control } = fixture()
    edit(hex, "#112233"); apply.click(); edit(hex, "#445566"); await flush()
    expect(control.value).toBe("#336699"); expect(hex.value).toBe("#445566")
    apply.addEventListener("click", event => event.preventDefault(), { once: true }); apply.click(); await flush()
    expect(control.value).toBe("#336699")
    expect(helper.commit()).toBe(true); expect(control.value).toBe("#445566")
  })
  it("does not let a queued Revert erase a newer draft", async () => {
    const { hex, revert, control } = fixture()
    edit(hex, "#ab"); revert.click(); edit(hex, "#cd"); await flush()
    expect(hex.value).toBe("#cd"); expect(control.value).toBe("#336699")
  })
  it("reserves hex Enter, but never applies while composing or on its ending turn", async () => {
    const { helper, hex, control, form } = fixture(), submitted = vi.fn(); form.addEventListener("submit", submitted)
    hex.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    hex.value = "#112233"; hex.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    expect(() => helper.restoreDraft()).toThrow("composition")
    hex.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }); hex.dispatchEvent(enter)
    await flush(); expect(control.value).toBe("#336699"); expect(enter.defaultPrevented).toBe(true)
    hex.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })); await flush()
    expect(control.value).toBe("#112233"); expect(submitted).not.toHaveBeenCalled()
  })
})

describe("native reset, form boundaries and teardown", () => {
  it("resets original native defaults silently and preserves cancelled reset drafts", async () => {
    const { helper, control, hex, form } = fixture(), input = vi.fn(); control.addEventListener("input", input)
    helper.setValue("#abcdef"); edit(hex, "#12")
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(hex.value).toBe("#12"); expect(control.value).toBe("#abcdef")
    form.reset(); await flush()
    expect(control.value).toBe("#336699"); expect(control.defaultValue).toBe("#336699")
    expect(hex.value).toBe("#336699"); expect(helper.dirty).toBe(false); expect(input).not.toHaveBeenCalled()
  })
  it("does not let old reset cleanup overwrite immediate new drafts or committed colors", async () => {
    const { helper, control, hex, form } = fixture()
    form.reset(); edit(hex, "#112233"); expect(helper.commit()).toBe(true); await flush()
    expect(control.value).toBe("#112233"); expect(hex.value).toBe("#112233")
    form.reset(); hex.value = "#ab"; helper.refresh(); await flush()
    expect(hex.value).toBe("#ab"); expect(helper.dirty).toBe(true)
  })
  it("refresh during reset dispatch cannot retain an obsolete dirty draft", async () => {
    const { helper, control, hex, form, output } = fixture()
    helper.setValue("#abcdef"); edit(hex, "#ab")
    form.addEventListener("reset", () => helper.refresh())
    form.reset(); await flush()
    expect(helper.dirty).toBe(false); expect(output.textContent).toBe("#336699")
    control.value = "#778899"; control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(hex.value).toBe("#778899")
  })
  it("tracked reset-button reconciliation updates readout and clears draft state", async () => {
    const { helper, control, hex, form, output } = fixture()
    const reset = document.createElement("button"); reset.type = "reset"; form.append(reset)
    helper.setValue("#abcdef"); edit(hex, "#ab"); reset.click(); await flush()
    expect(control.value).toBe("#336699"); expect(hex.value).toBe("#336699")
    expect(output.textContent).toBe("#336699"); expect(helper.dirty).toBe(false)
  })
  it("native fieldset disabling and first legend rules remain browser-owned", () => {
    const { helper, root, control, hex, form } = fixture()
    root.disabled = true; helper.refresh(); expect(new FormData(form).has("theme.color")).toBe(false)
    hex.value = "#112233"; expect(helper.commit()).toBe(false)
    helper.setValue("#778899"); expect(control.value).toBe("#778899")
    root.querySelector("legend")!.append(control); helper.refresh()
    expect(control.matches(":disabled")).toBe(false); expect(new FormData(form).get("theme.color")).toBe("#778899")
  })
  it("keeps one successful color field and native submitter semantics", () => {
    const { helper, form, hex } = fixture()
    edit(hex, "#112233"); helper.commit()
    const submitter = form.querySelector<HTMLButtonElement>('button[name="intent"]')!
    expect([...new FormData(form, submitter)]).toEqual([["theme.color", "#112233"], ["intent", "save"]])
    expect(form.noValidate).toBe(false)
  })
  it("requires paired fields to share their actual native form owner without rewriting it", () => {
    const { helper, control, hex } = fixture()
    control.setAttribute("form", "other")
    expect(() => helper.refresh()).toThrow(); expect(control.getAttribute("form")).toBe("other"); expect(hex.hasAttribute("form")).toBe(false)
  })
  it("supports an explicitly external form-associated native pair", async () => {
    const { helper, root, control, hex, form } = fixture()
    control.setAttribute("form", form.id); hex.setAttribute("form", form.id); document.body.append(root); helper.refresh()
    helper.setValue("#112233"); form.reset(); await flush()
    expect(control.value).toBe("#336699"); expect(hex.value).toBe("#336699")
  })
  it("does not call native chooser, EyeDropper or clipboard APIs on setup or setters", () => {
    const { helper, control } = fixture(false), picker = vi.fn()
    Object.defineProperty(control, "showPicker", { value: picker, configurable: true })
    helper.setValue("#112233"); helper.refresh(); helper.disconnect()
    expect(picker).not.toHaveBeenCalled()
  })
  it("restores only owned visibility/disabled/readout while retaining edited native values/drafts", () => {
    const { helper, root, control, hex, output } = fixture()
    helper.setValue("#112233"); edit(hex, "#ab")
    helper.disconnect(); helper.disconnect()
    expect(control.value).toBe("#112233"); expect(hex.value).toBe("#ab"); expect(hex.disabled).toBe(true)
    expect(root.querySelector<HTMLElement>("[data-color-entry]")!.hidden).toBe(true)
    expect(output.hidden).toBe(true); expect(output.textContent).toBe("Original readout")
  })
  it("preserves external readout text and disabled overrides", async () => {
    const { helper, output, hex } = fixture()
    output.textContent = "Application readout"; hex.disabled = true
    helper.disconnect()
    expect(output.textContent).toBe("Application readout"); expect(hex.disabled).toBe(true)
    await flush()
  })
  it("coexists with Input/Form ownership in either native draft synchronization order", async () => {
    const { helper, root, control, hex, form } = fixture()
    const input = createInput(document.querySelector("#input-root")!), validation = createForm(form, { items: [{ key: "draft", controls: [hex], feedback: document.querySelector("#feedback")! }] })
    helpers.push(input, validation)
    edit(hex, "#ab"); await validation.validate()
    expect(hex.getAttribute("aria-describedby")).toBe("help feedback")
    form.reset(); await flush()
    expect(helper.dirty).toBe(false); expect(hex.value).toBe(control.value)
    helper.disconnect(); input.disconnect(); validation.disconnect()
    expect(hex.getAttribute("aria-describedby")).toBe("help")
    expect(root.querySelectorAll('[name="theme.color"]')).toHaveLength(1)
  })
  it("Input-first reset/count tasks cannot leave a reset draft dirty or stale", async () => {
    const { helper, root, control, hex, form, output } = fixture(); helper.disconnect()
    const input = createInput(document.querySelector("#input-root")!); helpers.push(input)
    const color = createColorPicker(root); helpers.push(color)
    color.setValue("#abcdef"); edit(hex, "#ab"); form.reset(); await flush()
    expect(color.dirty).toBe(false); expect(hex.value).toBe("#336699"); expect(output.textContent).toBe("#336699")
    control.value = "#112233"; control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(hex.value).toBe("#112233")
  })
  it("disposal/removal cancels queued actions and never steals outside focus", async () => {
    const { helper, root, hex, apply, control } = fixture()
    edit(hex, "#112233"); apply.click()
    const outside = document.querySelector<HTMLButtonElement>("#outside")!; outside.focus(); root.remove(); await flush()
    expect(helper.connected).toBe(false); expect(control.value).toBe("#336699"); expect(document.activeElement).toBe(outside)
  })
})

describe("Color Picker default styles", () => {
  const css = readFileSync(resolve("src", "components", "color-picker", "color-picker.css"), "utf8")

  it("keeps the Color Picker stylesheet within its unchanged ceiling", () => {
    checkSizeRecommendation(gzipSync(css, { level: 9 }).length, 1000, "color-picker.test.ts: gzipSync(css, { level: 9 }).length")
  })

  it("matches the retained reference trigger heights and type sizes", () => {
    expect(css).toContain("--_m-color-picker-height: 34px")
    expect(css).toContain("--_m-color-picker-height: 28px")
    expect(css).toContain("--_m-color-picker-height: 40px")
    expect(css).toContain("--_m-color-picker-font: 15px")
  })

  it("does not restyle an Input-owned composed draft field", () => {
    expect(css).toContain(".m-color-picker__hex:not([data-input-control])")
    expect(css).not.toContain(".m-color-picker__hex {")
  })

  it("keeps disabled, forced-color and print ownership explicit", () => {
    expect(css).toContain(".m-color-picker__control:disabled")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("@media print")
  })
})

describe("canonical ColorPicker ViewElement", () => {
  it("exports canonical ViewElement classes and registration", () => {
    expect(colorPickerApi.ColorPicker).toBe(ColorPicker)
    expect(colorPickerApi).not.toHaveProperty("MColorPicker")
    expect(ColorPicker.tag).toBe("m-color-picker")
    expect(ViewElement.prototype.isPrototypeOf(ColorPicker.prototype)).toBe(true)
    expect(customElements.get("m-color-picker")).toBe(ColorPicker)
    expect(ColorPicker.observedAttributes).toEqual(["value", "disabled", "readonly", "required", "show-alpha", "modes", "mode", "name", "form"])
    expect(() => registerColorPicker()).not.toThrow()
    const define = vi.fn()
    expect(() => registerColorPicker({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  describe("full bounded ColorPicker owner", () => {
    function picker(value = "rgba(51, 102, 153, 0.5)") {
      const form = document.createElement("form")
      const element = document.createElement("m-color-picker") as ColorPicker
      element.defaultValue = value; element.value = value; element.showAlpha = true; element.name = "accent"
      form.append(element); document.body.append(form)
      return { element, form, control: element.native, text: element.draftControl, alpha: element.alphaControl }
    }
    it.each([
      ["#ABCDEF", "#abcdef"], ["#33669980", "rgba(51, 102, 153, 0.502)"],
      ["rgba(51,102,153,.125)", "rgba(51, 102, 153, 0.125)"], ["rgb(51,102,153)", "#336699"],
      ["hsl(210,50%,40%)", "#336699"], ["hsla(210deg,50%,40%,.5)", "rgba(51, 102, 153, 0.5)"],
      ["hsl(360,100%,50%)", "#ff0000"], ["rgba(0,0,0,0)", "rgba(0, 0, 0, 0)"], ["", ""],
    ])("accepts %s and serializes %s through element and native entry", (input, canonical) => {
      const { element, form } = picker()
      element.value = input
      expect(element.value).toBe(canonical); expect(new FormData(form).getAll("accent")).toEqual([canonical])
      const { helper } = fixture(); helper.setValue(input); expect(helper.value).toBe(canonical)
    })
    it("edits true RGB/HSL/HEX modes without discarding logical alpha or replacing controls", () => {
      const { element, control, text, alpha } = picker()
      const changes = vi.fn(); element.addEventListener("m:change", changes)
      expect(element.formattedValue).toBe("#336699"); expect(alpha.value).toBe("0.5")
      element.mode = "rgb"; expect(element.formattedValue).toBe("rgba(51, 102, 153, 0.5)")
      edit(text, "rgba(255,0,0,.25)"); expect(element.commit()).toBe(true)
      expect(element.value).toBe("rgba(255, 0, 0, 0.25)")
      element.mode = "hsl"; expect(text.value).toBe("hsla(0, 100%, 50%, 0.25)")
      edit(text, "hsla(120,100%,50%,.75)"); expect(element.commit()).toBe(true)
      expect(element.value).toBe("rgba(0, 255, 0, 0.75)")
      element.mode = "hex"; edit(text, "#112233"); expect(element.commit()).toBe(true)
      expect(element.value).toBe("rgba(17, 34, 51, 0.75)")
      expect(element.native).toBe(control); expect(element.draftControl).toBe(text); expect(element.alphaControl).toBe(alpha)
      expect(changes).toHaveBeenCalledTimes(3)
    })
    it("uses alpha range drafts and commits in every mode, without input-alpha support", async () => {
      const { element, text, alpha, control } = picker()
      for (const mode of ["hex", "rgb", "hsl"] as const) {
        element.mode = mode
        alpha.value = "0.333"; alpha.dispatchEvent(new Event("input", { bubbles: true }))
        expect(element.dirty).toBe(true); expect(element.value).not.toBe("")
        alpha.dispatchEvent(new Event("change", { bubbles: true })); await flush()
        expect(element.value).toBe("rgba(51, 102, 153, 0.333)"); expect(element.dirty).toBe(false)
        expect(text.value).toBe(element.formattedValue)
      }
      expect(control.hasAttribute("alpha")).toBe(false); expect(control.hasAttribute("colorspace")).toBe(false)
    })
    it("hides alpha without flattening it, and native RGB edits preserve transparency", () => {
      const { element, control, alpha } = picker()
      element.showAlpha = false; expect(alpha.hidden).toBe(true)
      control.value = "#ff0000"; control.dispatchEvent(new Event("input", { bubbles: true }))
      expect(element.value).toBe("rgba(255, 0, 0, 0.5)")
      element.showAlpha = true; expect(alpha.value).toBe("0.5")
    })
    it("rejects an entire settings record before value, defaults, attributes, mode options or drafts change", () => {
      const { element, control, text } = picker()
      edit(text, "#12")
      const snapshot = element.outerHTML, options = element.querySelector("[data-color-mode]")!.firstChild
      expect(() => element.configure({ value: "#ffffff", defaultValue: "#000000", modes: ["rgb"], mode: "hsl" })).toThrow()
      expect(element.outerHTML).toBe(snapshot); expect(element.value).toBe("rgba(51, 102, 153, 0.5)")
      expect(element.querySelector("[data-color-mode]")!.firstChild).toBe(options)
      expect(() => element.configure({ disabled: true, value: "rgba(0,0,0,2)" })).toThrow()
      expect(control.disabled).toBe(false); expect(text.value).toBe("#12")
      expect(() => element.modes = []).toThrow(); expect(() => element.modes = ["hex", "hex"]).toThrow()
    })
    it("retains invalid drafts and native selection across settings, silent value writes and deliberate restore", () => {
      const { element, text } = picker()
      edit(text, "#12"); text.focus(); text.setSelectionRange(1, 2)
      element.mode = "hsl"; element.value = "rgba(0,255,0,.6)"
      expect(text.value).toBe("#12"); expect([text.selectionStart, text.selectionEnd]).toEqual([1, 2])
      expect(element.commit()).toBe(false); expect(element.value).toBe("rgba(0, 255, 0, 0.6)")
      element.restoreDraft(); expect(text.value).toBe("hsla(120, 100%, 50%, 0.6)"); expect(element.dirty).toBe(false)
    })
    it("keeps clean mode projections lossless on commit, including non-byte alpha", () => {
      const { element } = picker("rgba(17, 39, 211, 0.123)")
      for (const mode of ["hex", "rgb", "hsl"] as const) {
        element.mode = mode; expect(element.commit()).toBe(true)
        expect(element.value).toBe("rgba(17, 39, 211, 0.123)")
      }
    })
    it("distinguishes empty/black/default and resets mode and alpha silently", async () => {
      const { element, form, text, alpha } = picker()
      const changes = vi.fn(); element.addEventListener("m:change", changes)
      element.mode = "hsl"; element.value = "#000000"
      element.defaultValue = "rgba(255,0,0,.75)"
      expect(element.value).toBe("#000000"); expect(element.valueDirty).toBe(true)
      form.reset(); await flush()
      expect(element.value).toBe("rgba(255, 0, 0, 0.75)"); expect(text.value).toBe("hsla(0, 100%, 50%, 0.75)")
      expect(alpha.value).toBe("0.75"); expect(element.valueDirty).toBe(false); expect(changes).not.toHaveBeenCalled()
      element.defaultValue = ""; expect(element.value).toBe(""); expect(text.value).toBe("")
      element.required = true; expect(element.checkValidity()).toBe(false)
      element.value = "#000000"; expect(element.checkValidity()).toBe(true)
      element.clear(); expect(element.value).toBe(""); expect(element.checkValidity()).toBe(false)
    })
    it("preserves full-alpha current/default/draft state and original listeners on reconnect", async () => {
      const { element, form, text, alpha, control } = picker()
      const listener = vi.fn(); control.addEventListener("input", listener)
      element.value = "rgba(255,0,0,.123)"; edit(text, "#12"); text.setAttribute("aria-describedby", "authored")
      element.remove(); form.append(element); await flush()
      expect(element.value).toBe("rgba(255, 0, 0, 0.123)"); expect(element.defaultValue).toBe("rgba(51, 102, 153, 0.5)")
      expect(element.draftControl).toBe(text); expect(element.alphaControl).toBe(alpha)
      expect(text.value).toBe("#12"); expect(text.getAttribute("aria-describedby")).toBe("authored")
      element.restoreDraft(); edit(text, "#112233"); element.commit(); expect(listener).toHaveBeenCalledOnce()
      expect(new FormData(form).getAll("accent")).toEqual(["rgba(17, 34, 51, 0.123)"])
    })
    it("blocks user actions for readonly/disabled/fieldset but permits silent programmatic writes", () => {
      const { element, form, control, text, alpha } = picker()
      element.readOnly = true
      expect(control.disabled).toBe(true); expect(text.readOnly).toBe(true); expect(alpha.disabled).toBe(true)
      expect(element.clear()).toBe(false); expect(element.commit()).toBe(false)
      expect(new FormData(form).get("accent")).toBe("rgba(51, 102, 153, 0.5)")
      element.value = "#112233"; expect(element.value).toBe("#112233")
      element.readOnly = false; element.disabled = true; expect(new FormData(form).has("accent")).toBe(false)
      element.disabled = false
      const fieldset = document.createElement("fieldset"); form.append(fieldset); fieldset.append(element); fieldset.disabled = true
      expect(element.commit()).toBe(false); expect(element.clear()).toBe(false); expect(new FormData(form).has("accent")).toBe(false)
    })
    it("suppresses stale alpha apply and queued clear on cancellation, newer drafts and disconnect", async () => {
      const { element, alpha, text } = picker()
      alpha.value = "0.7"; alpha.dispatchEvent(new Event("input", { bubbles: true })); alpha.dispatchEvent(new Event("change", { bubbles: true }))
      element.value = "#112233"; await flush(); expect(element.value).toBe("#112233")
      element.restoreDraft()
      const clear = element.querySelector<HTMLButtonElement>("[data-color-clear]")!
      clear.addEventListener("click", event => event.preventDefault(), { once: true }); clear.click(); await flush()
      expect(element.value).toBe("#112233")
      clear.click(); edit(text, "#123"); await flush(); expect(element.value).toBe("#112233")
      element.restoreDraft(); clear.click(); element.remove(); await flush(); expect(element.value).toBe("#112233")
    })
    it("settles independently with multiple connected native owners and changing readouts", async () => {
      const first = picker(), second = picker("#112233")
      first.element.value = "rgba(255,0,0,.75)"; second.element.mode = "rgb"
      await flush()
      expect(first.element.value).toBe("rgba(255, 0, 0, 0.75)")
      expect(second.element.value).toBe("#112233")
      expect(first.element.querySelector("[data-color-output]")!.textContent).toBe(first.element.value)
      expect(second.text.value).toBe("rgb(17, 34, 51)")
    })
    it("retains pending alpha when hidden or reconnected, and keeps the same live dirty flag", async () => {
      const { element, form, alpha } = picker()
      element.value = element.defaultValue; expect(element.valueDirty).toBe(true)
      alpha.value = "0.123"; alpha.dispatchEvent(new Event("input", { bubbles: true }))
      element.showAlpha = false
      element.remove(); form.append(element); await flush()
      expect(element.valueDirty).toBe(true); expect(alpha.value).toBe("0.123")
      expect(element.commit()).toBe(true); expect(element.value).toBe("rgba(51, 102, 153, 0.123)")
    })
    it("keeps preconnection current/default records distinct, including updates while detached", async () => {
      const element = document.createElement("m-color-picker") as ColorPicker
      element.configure({ value: "rgba(255,0,0,.5)", defaultValue: "rgba(0,255,0,.75)", showAlpha: true })
      document.body.append(element)
      expect(element.value).toBe("rgba(255, 0, 0, 0.5)"); expect(element.defaultValue).toBe("rgba(0, 255, 0, 0.75)")
      element.remove(); element.value = "rgba(0,0,255,.123)"; element.mode = "hsl"; document.body.append(element); await flush()
      expect(element.value).toBe("rgba(0, 0, 255, 0.123)"); expect(element.draft).toBe("hsla(240, 100%, 50%, 0.123)")
    })
    it("does not erase application custom validity while readonly or disabled bars validation", () => {
      const { element, text } = picker()
      text.setCustomValidity("Application error")
      element.readOnly = true; element.readOnly = false; expect(text.validationMessage).toBe("Application error")
      element.disabled = true; element.disabled = false; expect(text.validationMessage).toBe("Application error")
    })
    it("requires a committed color, not merely a valid pending draft, before native form submission", () => {
      const { element, form, text } = picker("")
      element.required = true; edit(text, "#112233")
      expect(element.value).toBe(""); expect(form.checkValidity()).toBe(false)
      expect(new FormData(form).get("accent")).toBe("")
      expect(element.commit()).toBe(true); expect(form.checkValidity()).toBe(true)
      expect(new FormData(form).get("accent")).toBe("#112233")
    })
    it("does not let pending reset reconciliation overwrite a newer native RGB edit", async () => {
      const { element, form, control } = picker()
      element.value = "#ff0000"; form.reset()
      control.value = "#112233"; control.dispatchEvent(new Event("input", { bubbles: true }))
      await flush()
      expect(element.value).toBe("rgba(17, 34, 51, 0.5)")
      expect(new FormData(form).get("accent")).toBe("rgba(17, 34, 51, 0.5)")
    })
    it("retains an authored canonical submission field and its name in the native Web entry", () => {
      const form = document.createElement("form"), root = document.createElement("fieldset")
      root.setAttribute("data-color-picker", "")
      root.innerHTML = '<legend>Accent</legend><label>RGB<input type="color" data-color-control value="#336699"></label><input type="hidden" data-color-value name="accent" value="rgba(51,102,153,.5)">'
      form.append(root); document.body.append(form)
      const field = root.querySelector<HTMLInputElement>("[data-color-value]")!, helper = createColorPicker(root)
      helpers.push(helper); helper.setValue("hsla(120,100%,50%,.25)")
      expect(helper.submission).toBe(field)
      expect(new FormData(form).getAll("accent")).toEqual(["rgba(0, 255, 0, 0.25)"])
    })
  })

  it("initializes with canonical default values", () => {
    const picker = document.createElement("m-color-picker") as ColorPicker
    document.body.append(picker)
    expect(picker.value).toBe("#000000")
    expect(picker.disabled).toBe(false)
    expect(picker.showAlpha).toBe(false)
  })

  it("generates an inner native color control when none is authored", () => {
    const picker = document.createElement("m-color-picker") as ColorPicker
    document.body.append(picker)
    expect(picker.classList.contains("m-color-picker")).toBe(true)
    const control = picker.querySelector("input[type=color]") as HTMLInputElement
    expect(control).not.toBeNull()
    expect(control.hasAttribute("data-color-control")).toBe(true)
    expect(control.classList.contains("m-color-picker__control")).toBe(true)
    expect(control.value).toBe("#000000")
    expect(control.disabled).toBe(false)
  })

  it("adopts an authored native color input", () => {
    const picker = document.createElement("m-color-picker") as ColorPicker
    const authored = document.createElement("input")
    authored.type = "color"
    authored.value = "#336699"
    authored.disabled = true
    picker.append(authored)
    document.body.append(picker)
    expect(picker.value).toBe("#336699")
    expect(picker.disabled).toBe(true)
    expect(authored.classList.contains("m-color-picker__control")).toBe(true)
  })

  it("reflects property changes to attributes and control", () => {
    const picker = document.createElement("m-color-picker") as ColorPicker
    document.body.append(picker)
    const control = picker.querySelector("input") as HTMLInputElement

    picker.value = "#112233"
    expect(picker.getAttribute("value")).toBeNull()
    expect(picker.value).toBe("#112233")
    expect(control.value).toBe("#112233")

    picker.setAttribute("value", "#445566")
    expect(picker.defaultValue).toBe("#445566")
    expect(picker.value).toBe("#112233")
    expect(control.value).toBe("#112233")

    picker.disabled = true
    expect(picker.hasAttribute("disabled")).toBe(true)
    expect(picker.disabled).toBe(true)
    expect(control.disabled).toBe(true)

    picker.disabled = false
    expect(picker.hasAttribute("disabled")).toBe(false)
    expect(picker.disabled).toBe(false)
    expect(control.disabled).toBe(false)

    picker.showAlpha = true
    expect(picker.hasAttribute("show-alpha")).toBe(true)
    expect(picker.showAlpha).toBe(true)
    expect(picker.alphaControl.hidden).toBe(false)

    picker.showAlpha = false
    expect(picker.hasAttribute("show-alpha")).toBe(false)
    expect(picker.showAlpha).toBe(false)
    expect(picker.alphaControl.hidden).toBe(true)
  })

  it("emits m:change event when native color control changes or inputs", () => {
    const picker = document.createElement("m-color-picker") as ColorPicker
    document.body.append(picker)
    const control = picker.querySelector("input") as HTMLInputElement
    const changes: string[] = []
    picker.addEventListener("m:change", ((event: CustomEvent<{ value: string }>) => {
      expect(event.bubbles).toBe(true)
      expect(event.cancelable).toBe(false)
      expect(event.composed).toBe(false)
      changes.push(event.detail.value)
    }) as EventListener)

    control.value = "#abcdef"
    control.dispatchEvent(new Event("change", { bubbles: true }))
    expect(picker.value).toBe("#abcdef")
    expect(changes).toEqual(["#abcdef"])

    control.value = "#123456"
    control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(picker.value).toBe("#123456")
    expect(changes).toEqual(["#abcdef", "#123456"])
  })

  it("delegates focus and blur to the child control", () => {
    const picker = document.createElement("m-color-picker") as ColorPicker
    document.body.append(picker)
    const control = picker.querySelector("input") as HTMLInputElement
    const focusSpy = vi.spyOn(control, "focus")
    const blurSpy = vi.spyOn(control, "blur")

    picker.focus()
    expect(focusSpy).toHaveBeenCalledOnce()

    picker.blur()
    expect(blurSpy).toHaveBeenCalledOnce()
  })

  it("synchronizes output text when data-color-output exists", () => {
    const picker = document.createElement("m-color-picker") as ColorPicker
    const output = document.createElement("span")
    output.setAttribute("data-color-output", "")
    output.hidden = true
    picker.append(output)
    document.body.append(picker)

    picker.value = "#008844"
    expect(output.textContent).toBe("#008844")
    expect(output.hidden).toBe(false)
  })

  it("replays pre-upgrade properties upon connection", () => {
    const picker = document.createElement("m-color-picker") as ColorPicker
    picker.value = "#aabbcc"
    picker.disabled = true
    picker.showAlpha = true
    document.body.append(picker)

    expect(picker.value).toBe("#aabbcc")
    expect(picker.disabled).toBe(true)
    expect(picker.showAlpha).toBe(true)
    expect(picker.getAttribute("value")).toBeNull()
    expect(picker.defaultValue).toBe("#000000")
    expect(picker.hasAttribute("disabled")).toBe(true)
    expect(picker.hasAttribute("show-alpha")).toBe(true)
  })

  it("handles form reset to restore default value", async () => {
    const form = document.createElement("form")
    const picker = document.createElement("m-color-picker") as ColorPicker
    picker.setAttribute("value", "#336699")
    form.append(picker)
    document.body.append(form)

    picker.value = "#ff0000"
    expect(picker.value).toBe("#ff0000")
    form.reset()
    await flush()
    expect(picker.value).toBe("#336699")
  })
})
