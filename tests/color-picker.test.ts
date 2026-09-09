import { afterEach, describe, expect, it, vi } from "vitest"
import { createColorPicker } from "../src/components/color-picker/index.js"
import { createInput } from "../src/components/input/index.js"
import { createForm } from "../src/components/form/index.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 20))
function fixture(withEditor = true) {
  document.body.innerHTML = `<form id="form"><fieldset data-color-picker id="root"><legend>Color</legend>
    <label for="color">Color</label><input data-color-control id="color" type="color" name="theme.color" value="#336699" list="palette">
    <span data-color-output hidden>Original readout</span><datalist id="palette"><option value="#336699"></option><option value="#008844"></option></datalist>
    ${withEditor ? '<div data-color-entry hidden><label for="hex">Hex draft</label><span class="mui-input" data-input id="input-root"><input data-color-hex data-input-control id="hex" type="text" value="#336699" required pattern="#[0-9a-fA-F]{6}" maxlength="7" disabled aria-describedby="help"><span data-input-count id="count"></span></span><button type="button" data-color-apply hidden>Apply</button><button type="button" data-color-revert hidden>Revert</button></div>' : ""}
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
  it.each([null, undefined, "", "#fff", "#12345678", "#12345g", "red", "rgb(1, 2, 3)", "transparent", "color(display-p3 1 0 0)", " #123456", "#123456\n", 0])("rejects unsupported value %j before native black fallback", value => {
    const { helper, control, hex } = fixture()
    expect(() => helper.setValue(value as string)).toThrow("#RRGGBB")
    expect(control.value).toBe("#336699"); expect(hex.value).toBe("#336699")
  })
  it("treats black as a real color, not a null/clear value", () => {
    const { helper, form } = fixture(false)
    helper.setValue("#000000"); expect(helper.value).toBe("#000000")
    expect(new FormData(form).get("theme.color")).toBe("#000000")
    expect("clear" in helper).toBe(false)
  })
  it("accepts omitted native default as black but rejects explicitly invalid defaults", () => {
    const { helper, root, control } = fixture(false); helper.disconnect()
    control.removeAttribute("value"); control.value = "#000000"
    const next = createColorPicker(root); helpers.push(next); expect(next.value).toBe("#000000"); next.disconnect()
    control.setAttribute("value", "rgba(0,0,0,0)")
    expect(() => createColorPicker(root)).toThrow("RGB")
  })
  it.each(["alpha", "colorspace", "readonly", "required"])("does not claim or flatten unsupported %s markup", async name => {
    const { helper, root, control } = fixture(false)
    control.setAttribute(name, name === "colorspace" ? "display-p3" : "")
    await flush(); expect(helper.connected).toBe(false); expect(control.hasAttribute(name)).toBe(true)
    expect(() => createColorPicker(root)).toThrow("RGB")
  })
  it("rejects duplicate owners across module copies and releases them", async () => {
    const { helper, root } = fixture()
    expect(() => createColorPicker(root)).toThrow("owner")
    vi.resetModules(); const other = await import("../src/components/color-picker/index.js")
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
    expect(hex.validity.patternMismatch).toBe(true); expect(helper.commit()).toBe(false)
    const report = vi.spyOn(hex, "reportValidity")
    apply.click(); await flush(); expect(report).toHaveBeenCalledOnce()
    expect(control.value).toBe("#336699"); expect(hex.value).toBe("#12")
    helper.restoreDraft(); expect(hex.value).toBe("#336699"); expect(helper.dirty).toBe(false)
  })
  it("rejects empty drafts through native required, never coercing them to black", () => {
    const { helper, hex, control } = fixture()
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
