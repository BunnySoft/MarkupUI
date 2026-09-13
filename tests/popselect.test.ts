import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { createPopselect, Popselect, PopselectTrigger, PopselectPanel, registerPopselect } from "../src/components/popselect/index.js"
import type { PopselectController, PopselectOptions } from "../src/components/popselect/index.js"
import { ViewElement } from "../src/core/index.js"
import { createSelect } from "../src/components/native-select.js"
import { createPopover } from "../src/components/popover/index.js"
import { coordinateForm as createForm } from "../src/components/form/controller.js"

describe("audited Popselect context styles", () => {
  const css = readFileSync("src/components/popselect/popselect.css", "utf8")

  it("inherits the shared region surface instead of copying a popup palette", () => {
    expect(css).toContain("[data-popselect-panel] .m-select")
    expect(css).toContain("color: var(--m-select-color, inherit)")
    expect(css).toContain("background-color: var(--m-select-background, transparent)")
    expect(css).toContain("[data-select-control]:not(:disabled)")
    expect(css).not.toContain("box-shadow:")
    expect(css).not.toContain("data-m-theme")
  })

  it("uses native-field typography and private size defaults behind author overrides", () => {
    expect(css).toContain("font-family: var(--m-font-family, inherit)")
    expect(css).toContain("font-size: var(--m-select-font, var(--_ps-font, var(--_select-font, 14px)))")
    expect(css).toContain("line-height: 1.5")
    expect(css).toContain("--_ps-font: 15px")
    expect(css).toContain("var(--m-select-pad, var(--_ps-pad, .5rem))")
    expect(css).not.toMatch(/(?:^|[;{])\s*--m-select-(?:font|pad)\s*:/m)
  })

  it("does not style or replace platform option/group/selection rendering", () => {
    expect(css).not.toMatch(/(?:^|[},])\s*(?:option|optgroup)\b/m)
    expect(css).not.toContain("[selected]")
    expect(css).not.toContain("combobox")
    expect(css).not.toContain("menuitem")
  })

  it("retains inline-width, native focus, forced-color and print safeguards", () => {
    expect(css).toContain("[data-popselect-panel]:not([popover]) { width: 100%; max-width: 100%; }")
    expect(css).not.toContain("outline-color:")
    expect(css).toContain("@media (forced-colors: active), print")
    expect(css).toContain("background-color: Canvas")
    expect(css).toContain("@media print")
  })

  it("keeps the composed Popover, Select and Popselect stylesheet within its ceiling", () => {
    const composed = [
      readFileSync("src/components/popover/popover.css", "utf8"),
      readFileSync("src/components/select/select.css", "utf8"),
      css,
    ].join("\n")
    expect(gzipSync(composed, { level: 9 }).length).toBeLessThanOrEqual(2500)
  })
})

const helpers: PopselectController[] = []
const matches = HTMLElement.prototype.matches
let opened: WeakSet<HTMLElement>, sequence = 0
const turn = () => new Promise(resolve => setTimeout(resolve, 10))
function toggle(panel: HTMLElement, show: boolean) {
  const event = Object.assign(new Event("beforetoggle", { cancelable: show }), { newState: show ? "open" : "closed", oldState: opened.has(panel) ? "open" : "closed" })
  if (!panel.dispatchEvent(event)) return
  if (show) opened.add(panel); else opened.delete(panel)
  panel.dispatchEvent(Object.assign(new Event("toggle"), { newState: show ? "open" : "closed" }))
}
function markup(multiple = false) {
  const id = ++sequence
  return `<section class="m-popselect" data-popselect><button type="button" data-popselect-trigger popovertarget="panel-${id}" hidden>Choose values</button>
    <span data-popselect-value>Fallback readout</span><div id="panel-${id}" class="m-popover" data-popselect-panel role="region" aria-label="Choices ${id}">
    <header><h2>Native choices</h2></header><div class="m-select" data-select>
    <label for="choices-${id}">Values ${id}</label><select id="choices-${id}" data-select-control name="values-${id}" size="5" ${multiple ? "multiple" : ""} required>
    <option value="">Empty string</option><option value="a" selected>Alpha</option><optgroup label="Group"><option value="b">Beta</option><option value="c" disabled ${multiple ? "selected" : ""}>Locked Charlie</option></optgroup>
    <optgroup label="Disabled group" disabled><option value="d">Delta</option></optgroup></select>
    <button type="button" data-select-clear hidden>Clear values</button><p data-select-empty hidden>No options available</p></div>
    <footer><button type="button" data-popselect-done popovertarget="panel-${id}" popovertargetaction="hide" hidden>Done</button></footer></div></section>`
}
function fixture(multiple = false, options: PopselectOptions = {}, prepare?: (root: HTMLElement) => void) {
  const form = document.createElement("form"); form.innerHTML = markup(multiple) + '<button type="button" data-outside>Outside</button>'
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-popselect]")!, trigger = root.querySelector<HTMLButtonElement>("[data-popselect-trigger]")!, panel = root.querySelector<HTMLElement>("[data-popselect-panel]")!
  trigger.getBoundingClientRect = () => new DOMRect(200, 100, 120, 30)
  panel.getBoundingClientRect = () => new DOMRect(0, 0, 240, 220)
  prepare?.(root)
  const helper = createPopselect(root, options); helpers.push(helper)
  return { root, form, trigger, panel, helper, control: helper.control, readout: root.querySelector<HTMLElement>("[data-popselect-value]")!, clear: root.querySelector<HTMLButtonElement>("[data-select-clear]")!, done: root.querySelector<HTMLButtonElement>("[data-popselect-done]")! }
}
beforeEach(() => {
  opened = new WeakSet()
  vi.spyOn(HTMLElement.prototype, "matches").mockImplementation(function (selector) { return selector === ":popover-open" ? opened.has(this) : matches.call(this, selector) })
  Object.defineProperty(HTMLElement.prototype, "showPopover", { configurable: true, value() { toggle(this, true) } })
  Object.defineProperty(HTMLElement.prototype, "hidePopover", { configurable: true, value() { toggle(this, false) } })
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(800)
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(600)
})
afterEach(() => {
  helpers.splice(0).forEach(helper => helper.disconnect())
  document.body.replaceChildren()
  delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover
  delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover
  vi.restoreAllMocks()
})

describe("native composition and immediate selection", () => {
  it("preserves original native nodes/labels/options/groups and uses a region, not combobox/menu", () => {
    const { helper, trigger, panel, control } = fixture()
    expect(panel.getAttribute("role")).toBe("region"); expect(trigger.hasAttribute("aria-haspopup")).toBe(false)
    expect(control.hasAttribute("role")).toBe(false); expect(control.size).toBe(5)
    const option = control.options[1]!, group = control.querySelector("optgroup")!, label = control.labels![0]
    helper.setValue("b"); helper.open(); helper.close()
    expect(control.options[1]).toBe(option); expect(control.querySelector("optgroup")).toBe(group); expect(control.labels![0]).toBe(label)
    expect(trigger.getAttribute("aria-controls")).toContain(panel.id)
  })
  it("uses current native strings, including empty string versus null", () => {
    const { helper, control, readout } = fixture()
    expect(helper.value).toBe("a"); expect(readout.textContent).toBe("Alpha")
    helper.setValue(""); expect(helper.value).toBe(""); expect(readout.textContent).toBe("Empty string")
    helper.setValue(null); expect(helper.value).toBeNull(); expect(control.selectedIndex).toBe(-1); expect(readout.textContent).toBe("None selected")
  })
  it("uses DOM-order multi values and never stages a second committed-value model", () => {
    const { helper, control } = fixture(true)
    expect(helper.value).toEqual(["a", "c"])
    helper.setValue(["d", "b"]); expect(helper.value).toEqual(["b", "d"])
    helper.open(); control.options[1]!.selected = true; control.dispatchEvent(new Event("change", { bubbles: true })); helper.close()
    expect(helper.value).toEqual(["a", "b", "d"])
  })
  it("validates single/multiple types and unknown/duplicate keys without erasing current selection", () => {
    const single = fixture(), multi = fixture(true)
    for (const value of ["unknown", 1, ["a"], {}]) expect(() => single.helper.setValue(value as never)).toThrow()
    expect(single.helper.value).toBe("a"); expect(single.helper.connected).toBe(true)
    for (const value of [null, "a", ["a", "a"], ["unknown"], [1]]) expect(() => multi.helper.setValue(value as never)).toThrow()
    expect(multi.helper.value).toEqual(["a", "c"]); expect(multi.helper.connected).toBe(true)
  })
  it("keeps programmatic setters/clear/refresh silent and native defaults unchanged", () => {
    const { helper, control } = fixture(), input = vi.fn(), change = vi.fn()
    control.addEventListener("input", input); control.addEventListener("change", change)
    helper.setValue("b"); helper.clear(); helper.refresh()
    expect(helper.value).toBeNull(); expect(control.options[1]!.defaultSelected).toBe(true)
    expect(input).not.toHaveBeenCalled(); expect(change).not.toHaveBeenCalled()
  })
  it("reuses Select clear-button input/change/clear notifications without closing", async () => {
    const { helper, clear, control } = fixture(), events: string[] = []
    for (const type of ["input", "change", "m:select-clear"]) control.addEventListener(type, () => events.push(type))
    helper.open(); clear.focus(); clear.click(); await turn()
    expect(events).toEqual(["input", "change", "m:select-clear"]); expect(helper.value).toBeNull()
    expect(helper.show).toBe(true); expect(document.activeElement).toBe(control)
  })
  it("does not close on native change, pointer selection, arrows/typeahead or Enter", () => {
    const { helper, control } = fixture()
    helper.open(); control.value = "b"
    control.dispatchEvent(new Event("input", { bubbles: true })); control.dispatchEvent(new Event("change", { bubbles: true }))
    control.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
    control.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })); control.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false); expect(helper.show).toBe(true); expect(helper.value).toBe("b")
  })
  it("adds no duplicate native trigger activation or modified-click behavior", () => {
    const { helper, trigger } = fixture()
    trigger.dispatchEvent(new MouseEvent("click", { ctrlKey: true, bubbles: true }))
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    expect(helper.show).toBe(false) // Native declarative activation is not implemented by jsdom.
  })
  it("honors native beforetoggle cancellation and current visibility after stale toggle events", async () => {
    const { helper, panel } = fixture()
    panel.addEventListener("beforetoggle", event => event.preventDefault(), { once: true })
    expect(helper.open()).toBe(false)
    expect(helper.open()).toBe(true); panel.dispatchEvent(Object.assign(new Event("toggle"), { newState: "closed" }))
    await turn(); expect(helper.show).toBe(true)
  })
  it("recovers only body/hidden-owned focus after closing, never an outside focus destination", () => {
    const { helper, control, panel, trigger, form } = fixture()
    helper.open(); control.focus(); helper.close()
    expect(document.activeElement).toBe(trigger)
    helper.open(); control.focus()
    panel.addEventListener("beforetoggle", event => { if ((event as ToggleEvent).newState === "closed") control.blur() }, { once: true })
    helper.close(); expect(document.activeElement).toBe(trigger)
    helper.open(); control.focus(); control.blur(); helper.close()
    expect(document.activeElement).toBe(trigger)
    helper.open(); control.focus()
    const outside = form.querySelector<HTMLElement>("[data-outside]")!
    panel.addEventListener("beforetoggle", event => { if ((event as ToggleEvent).newState === "closed") outside.focus() }, { once: true })
    helper.close(); expect(document.activeElement).toBe(outside)
  })
  it("bounded readout is literal text, outside the trigger, with no live-region behavior", () => {
    const { helper, control, readout, trigger } = fixture(true)
    control.options[1]!.label = "<img src=x>"
    helper.setValue(["", "a", "b", "c", "d"])
    expect(readout.textContent).toBe("Empty string, <img src=x>, Beta (+2)")
    expect(readout.querySelector("img")).toBeNull(); expect(readout.hasAttribute("aria-live")).toBe(false)
    expect(trigger.textContent).toBe("Choose values")
  })
})

describe("native forms, defaults and explicit validation reveal", () => {
  it("keeps closed native fields successful without hidden proxies", () => {
    const { helper, form, control } = fixture()
    expect(helper.show).toBe(false)
    expect(new FormData(form).getAll(control.name)).toEqual(["a"])
    helper.setValue(""); expect(new FormData(form).getAll(control.name)).toEqual([""])
    helper.clear(); expect(new FormData(form).has(control.name)).toBe(false)
    expect(form.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
  })
  it("distinguishes disabled selected options/groups from successful native form values", () => {
    const { helper, form, control } = fixture(true)
    const native = new FormData(form).getAll(control.name)
    expect(helper.value).toEqual(["a", "c"]); helper.open(); helper.close()
    // jsdom includes disabled selected options; real successful-control omission is checked in Chromium.
    expect(new FormData(form).getAll(control.name)).toEqual(native)
    expect(control.options[3]!.disabled).toBe(true)
    helper.setValue(["b", "d"]); expect(helper.value).toEqual(["b", "d"])
    expect(control.options[4]!.parentElement!.hasAttribute("disabled")).toBe(true)
    helper.clear(); expect(helper.value).toEqual([])
  })
  it("reads actual multi-option defaults after reset even when a selection collection was previously accessed", async () => {
    const { helper, control, form, readout } = fixture(true)
    helper.setValue(["b"]); expect(helper.value).toEqual(["b"]); void control.selectedOptions
    form.reset(); await turn()
    expect(helper.value).toEqual(["a", "c"]); expect(readout.textContent).toBe("Alpha, Locked Charlie")
  })
  it("uses native defaultSelected/reset quietly, without opening or restoring dismissed selection snapshots", async () => {
    const { helper, control, form, readout } = fixture(), change = vi.fn()
    control.addEventListener("change", change)
    helper.setValue("b"); helper.open(); helper.close(); form.reset(); await turn()
    expect(helper.value).toBe("a"); expect(readout.textContent).toBe("Alpha"); expect(helper.show).toBe(false)
    expect(change).not.toHaveBeenCalled()
    helper.setValue("b"); form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await turn()
    expect(helper.value).toBe("b")
  })
  it("supports external form association and native reset defaults", async () => {
    const { helper, root, control, form, readout } = fixture()
    form.id = "external-owner"; control.setAttribute("form", form.id); document.body.append(root)
    helper.setValue("b"); form.reset(); await turn()
    expect(helper.value).toBe("a"); expect(readout.textContent).toBe("Alpha"); expect(new FormData(form).get(control.name)).toBe("a")
  })
  it("quiet validity checks do not open or focus any popup; reveal is explicit", async () => {
    const { helper, control, form } = fixture(), outside = form.querySelector<HTMLElement>("[data-outside]")!
    helper.clear(); outside.focus()
    expect(control.checkValidity()).toBe(false); expect(helper.show).toBe(false); expect(document.activeElement).toBe(outside)
    const native = createForm(form, { items: [{ key: "choices", controls: [control] }] })
    const result = await native.validate(); expect(result.status).toBe("invalid"); expect(helper.show).toBe(false)
    expect(document.activeElement).toBe(outside)
    expect(helper.reveal()).toBe(true); expect(document.activeElement).toBe(outside)
    control.focus(); expect(control.reportValidity()).toBe(false); expect(document.activeElement).toBe(control)
    native.disconnect()
  })
  it("disabling the opener is not disabling or silently excluding the native select", () => {
    const { helper, trigger, control, form } = fixture()
    helper.clear(); trigger.disabled = true; helper.refresh()
    expect(helper.reveal()).toBe(false); expect(control.disabled).toBe(false); expect(form.checkValidity()).toBe(false)
    helper.disconnect(); expect(control.required).toBe(true); expect(helper.panel.hasAttribute("popover")).toBe(false)
  })
  it("native select/fieldset disabling closes and blocks opening without overwriting native flags", async () => {
    const { helper, root, control, trigger } = fixture()
    helper.open(); control.disabled = true; await turn()
    expect(helper.show).toBe(false); expect(trigger.getAttribute("aria-disabled")).toBe("true"); expect(trigger.disabled).toBe(false)
    control.disabled = false; await turn(); expect(helper.open()).toBe(true)
    const fieldset = document.createElement("fieldset"); root.before(fieldset); fieldset.append(root); fieldset.disabled = true; await turn()
    expect(helper.show).toBe(false); expect(helper.open()).toBe(false); expect(control.disabled).toBe(false)
  })
  it("blocks a native opening immediately after disabling, before observers run", () => {
    const { helper, panel, control } = fixture()
    control.disabled = true; panel.showPopover()
    expect(helper.show).toBe(false)
  })
})

describe("refresh, fallback and ownership", () => {
  it("retains selections/listeners through append/reorder and follows native removal reconciliation", async () => {
    const { helper, control, readout } = fixture(), alpha = control.options[1]!, listener = vi.fn()
    alpha.addEventListener("example", listener); control.append(alpha); helper.refresh()
    expect(helper.value).toBe("a"); expect(alpha.selected).toBe(true)
    alpha.dispatchEvent(new Event("example")); expect(listener).toHaveBeenCalledOnce()
    alpha.label = "Renamed Alpha"; await turn(); expect(readout.textContent).toBe("Renamed Alpha")
    alpha.remove(); helper.refresh(); expect(helper.value).toBe(control.selectedIndex < 0 ? null : control.value)
    expect(control.querySelector('[value="a"]')).toBeNull()
  })
  it("shows authored empty content when options are removed without generating a fallback key", async () => {
    const { helper, control, root } = fixture()
    control.replaceChildren(); helper.refresh(); await turn()
    expect(helper.value).toBeNull(); expect(control.options).toHaveLength(0)
    expect(root.querySelector<HTMLElement>("[data-select-empty]")!.hidden).toBe(false)
  })
  it("hands off static native choices on an invalid external mode change", async () => {
    const { helper, control, panel } = fixture()
    helper.open(); control.multiple = true; await turn()
    expect(helper.connected).toBe(false); expect(panel.hasAttribute("popover")).toBe(false); expect(control.multiple).toBe(true)
    expect(control.isConnected).toBe(true)
  })
  it("does not overwrite rich author readout changes on failure", () => {
    const { helper, readout, panel } = fixture()
    readout.innerHTML = "<strong>Author content</strong>"
    expect(() => helper.refresh()).toThrow()
    expect(readout.querySelector("strong")!.textContent).toBe("Author content"); expect(panel.hasAttribute("popover")).toBe(false)
  })
  it("keeps grouped labels/keys bounded and rejects unsupported sizes/rendered options/filter surfaces", () => {
    expect(() => fixture(false, {}, root => { root.querySelector("select")!.size = 1 })).toThrow("size")
    expect(() => fixture(false, {}, root => { root.querySelector("select")!.size = 21 })).toThrow("size")
    expect(() => fixture(false, {}, root => { root.querySelector("option")!.value = "x".repeat(257) })).toThrow()
    expect(() => fixture(false, {}, root => { root.querySelector("option")!.label = "" ; root.querySelector("option")!.textContent = "" })).toThrow()
    expect(() => fixture(false, { trigger: "hover" } as never)).toThrow("Unsupported")
  })
  it("rejects duplicate keys and over-2000 options before hiding the fallback", () => {
    expect(() => fixture(false, {}, root => { root.querySelector("select")!.insertAdjacentHTML("beforeend", '<option value="a">Duplicate</option>') })).toThrow("unique")
    expect(() => fixture(false, {}, root => { root.querySelector("select")!.innerHTML = Array.from({ length: 2001 }, (_, i) => `<option value="${i}">Option ${i}</option>`).join("") })).toThrow("2000")
    expect([...document.querySelectorAll("[data-popselect-panel]")].every(panel => !panel.hasAttribute("popover"))).toBe(true)
  })
  it("rejects unsupported popup ARIA or pre-hidden focused inline choices", () => {
    expect(() => fixture(false, {}, root => { root.querySelector("[data-popselect-trigger]")!.setAttribute("aria-haspopup", "listbox") })).toThrow()
    expect(() => fixture(false, {}, root => { root.querySelector("select")!.focus() })).toThrow("focused")
  })
  it("does not steal existing Select or Popover ownership, and rejects a second Popselect", () => {
    const { helper, root, trigger, panel } = fixture()
    expect(() => createPopselect(root)).toThrow("unowned")
    expect(() => createSelect(root.querySelector<HTMLElement>("[data-select]")!)).toThrow("owner")
    expect(() => createPopover(trigger, panel)).toThrow("active controller")
    helper.disconnect()
    const selected = createSelect(root.querySelector<HTMLElement>("[data-select]")!)
    expect(() => createPopselect(root)).toThrow("owner"); selected.disconnect()
  })
  it("unsupported and partial Popover APIs leave usable inline native choices", () => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover
    const { helper, panel, trigger, done } = fixture()
    expect(helper.supported).toBe(false); expect(panel.hasAttribute("popover")).toBe(false)
    expect(trigger.hidden).toBe(true); expect(done.hidden).toBe(true)
    helper.setValue("b"); expect(helper.value).toBe("b"); expect(helper.reveal()).toBe(true); expect(helper.show).toBe(false)
    helper.disconnect(); expect(panel.hasAttribute("popover")).toBe(false)
  })
  it("disconnect exposes inline controls and preserves current values/defaults/nodes/author ARIA", () => {
    const { helper, trigger, panel, control, readout } = fixture(), options = [...control.options]
    helper.setValue("b"); helper.open()
    trigger.setAttribute("aria-expanded", "author override"); panel.style.color = "red"
    helper.disconnect()
    expect(panel.hasAttribute("popover")).toBe(false); expect(trigger.hidden).toBe(true)
    expect(trigger.getAttribute("aria-expanded")).toBe("author override")
    expect(panel.style.color).toBe("red"); expect([...control.options]).toEqual(options)
    expect(control.value).toBe("b"); expect(options[1]!.defaultSelected).toBe(true); expect(readout.textContent).toBe("Beta")
  })
  it("reveals an optional dynamic readout only for its owned enhancement lifetime", () => {
    const { helper, readout } = fixture(false, {}, root => { root.querySelector<HTMLElement>("[data-popselect-value]")!.hidden = true })
    expect(readout.hidden).toBe(false); helper.disconnect(); expect(readout.hidden).toBe(true)
  })
  it("rejects unsupported CSS zoom and exposes native choices rather than mispositioning them", async () => {
    const { helper, root, panel, control } = fixture()
    helper.setValue("b")
    const get = CSSStyleDeclaration.prototype.getPropertyValue
    vi.spyOn(CSSStyleDeclaration.prototype, "getPropertyValue").mockImplementation(function (name) { return name === "zoom" ? "2" : get.call(this, name) })
    root.classList.add("zoom-fixture"); await turn()
    expect(helper.connected).toBe(false); expect(panel.hasAttribute("popover")).toBe(false); expect(control.value).toBe("b")
  })
  it("does not resurrect removed nodes, and can explicitly rebind a closed static handoff", async () => {
    const { helper, root, control, panel } = fixture()
    control.options[2]!.remove(); helper.refresh(); helper.disconnect()
    const second = createPopselect(root); helpers.push(second)
    expect(second.control).toBe(control); expect(control.options).toHaveLength(4)
    root.remove(); await turn(); expect(second.connected).toBe(false); expect(panel.isConnected).toBe(false)
  })
  it("keeps nested value/visibility owners independent", async () => {
    const outer = fixture(), inner = fixture(true)
    outer.panel.append(inner.root)
    outer.helper.refresh(); inner.helper.refresh()
    outer.helper.open(); inner.helper.open(); inner.helper.setValue(["b"])
    expect(outer.helper.value).toBe("a"); expect(inner.helper.value).toEqual(["b"])
    inner.helper.close(); expect(outer.helper.show).toBe(true)
    inner.helper.disconnect(); outer.helper.close(); await turn()
  })
  it("cancels pending reset/clear work when disconnecting", async () => {
    const { helper, clear, form, control, panel } = fixture()
    clear.click(); form.reset(); helper.disconnect(); await turn()
    expect(control.value).toBe("a"); expect(panel.hasAttribute("popover")).toBe(false)
  })
})

function setupPopselectRects(el: HTMLElement) {
  for (const node of [el, ...el.querySelectorAll<HTMLElement>("*")]) {
    node.getBoundingClientRect = () => new DOMRect(200, 200, 100, 30)
  }
}

describe("canonical Popselect ViewElement", () => {
  it("exports canonical own-tag ViewElements and registers m-popselect, m-popselect-trigger, m-popselect-panel", () => {
    expect(Popselect.tag).toBe("m-popselect")
    expect(PopselectTrigger.tag).toBe("m-popselect-trigger")
    expect(PopselectPanel.tag).toBe("m-popselect-panel")
    expect(ViewElement.prototype.isPrototypeOf(Popselect.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(PopselectTrigger.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(PopselectPanel.prototype)).toBe(true)
    expect(customElements.get("m-popselect")).toBe(Popselect)
    expect(customElements.get("m-popselect-trigger")).toBe(PopselectTrigger)
    expect(customElements.get("m-popselect-panel")).toBe(PopselectPanel)
    expect(Popselect.observedAttributes).toEqual([
      "value", "placeholder", "disabled", "placement", "multiple", "trigger",
    ])
    expect(() => registerPopselect()).not.toThrow()
  })

  it("handles typed properties, attributes, and defaults", () => {
    const el = document.createElement("m-popselect") as Popselect
    document.body.append(el)
    expect(el.value).toBe("")
    expect(el.placeholder).toBe("")
    expect(el.disabled).toBe(false)
    expect(el.placement).toBe("bottom-start")
    expect(el.multiple).toBe(false)
    expect(el.trigger).toBe("click")

    el.value = "option1"
    expect(el.getAttribute("value")).toBe("option1")
    expect(el.value).toBe("option1")

    el.placeholder = "Select fruit"
    expect(el.getAttribute("placeholder")).toBe("Select fruit")
    expect(el.placeholder).toBe("Select fruit")

    el.placement = "top"
    expect(el.getAttribute("placement")).toBe("top")
    expect(el.placement).toBe("top")

    el.disabled = true
    expect(el.hasAttribute("disabled")).toBe(true)
    expect(el.disabled).toBe(true)

    el.multiple = true
    expect(el.hasAttribute("multiple")).toBe(true)
    expect(el.multiple).toBe(true)

    el.trigger = "hover"
    expect(el.getAttribute("trigger")).toBe("hover")
    expect(el.trigger).toBe("hover")

    el.setAttribute("value", "new-val")
    expect(el.value).toBe("new-val")

    el.setAttribute("placeholder", "choose")
    expect(el.placeholder).toBe("choose")

    el.setAttribute("placement", "bottom")
    expect(el.placement).toBe("bottom")

    el.removeAttribute("disabled")
    expect(el.disabled).toBe(false)

    el.removeAttribute("multiple")
    expect(el.multiple).toBe(false)

    el.setAttribute("trigger", "click")
    expect(el.trigger).toBe("click")
  })

  it("generates panel anatomy and synchronizes native trigger and options", async () => {
    document.body.innerHTML = `
      <m-popselect value="b" placeholder="Select an option">
        <button type="button" id="test-trigger">Choose</button>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
        <option value="c">Charlie</option>
      </m-popselect>`
    await turn()
    const popselect = document.querySelector("m-popselect") as Popselect
    const trigger = document.getElementById("test-trigger") as HTMLButtonElement
    const panel = popselect.querySelector("m-popselect-panel") as PopselectPanel
    expect(panel).not.toBeNull()
    expect(panel.classList.contains("m-popover")).toBe(true)
    expect(panel.classList.contains("m-popselect-panel")).toBe(true)
    expect(panel.getAttribute("role")).toBe("region")
    expect(panel.getAttribute("aria-label")).toBe("Select an option")
    expect(trigger.getAttribute("popovertarget")).toBe(panel.id)

    const select = panel.querySelector("select") as HTMLSelectElement
    expect(select).not.toBeNull()
    expect(select.options.length).toBe(3)
    expect(select.value).toBe("b")

    const done = panel.querySelector("[data-popselect-done]") as HTMLButtonElement
    expect(done).not.toBeNull()
    expect(done.getAttribute("popovertarget")).toBe(panel.id)
  })

  it("integrates companion regions and supports open/close/toggle methods", async () => {
    document.body.innerHTML = `
      <m-popselect placeholder="Companion test">
        <m-popselect-trigger>
          <button type="button" id="companion-trigger">Trigger</button>
        </m-popselect-trigger>
        <m-popselect-panel>
          <select id="companion-select">
            <option value="1">One</option>
            <option value="2">Two</option>
          </select>
        </m-popselect-panel>
      </m-popselect>`
    await turn()
    const popselect = document.querySelector("m-popselect") as Popselect
    setupPopselectRects(popselect)
    const panel = popselect.querySelector("m-popselect-panel") as HTMLElement
    expect(panel).not.toBeNull()
    expect(popselect.open()).toBe(true)
    expect(panel.matches(":popover-open")).toBe(true)
    popselect.close()
    expect(panel.matches(":popover-open")).toBe(false)
    popselect.toggle()
    expect(panel.matches(":popover-open")).toBe(true)
    popselect.toggle()
    expect(panel.matches(":popover-open")).toBe(false)
  })

  it("dispatches m:change event when selection changes", async () => {
    document.body.innerHTML = `
      <m-popselect value="1">
        <button type="button">Trigger</button>
        <option value="1">One</option>
        <option value="2">Two</option>
      </m-popselect>`
    await turn()
    const popselect = document.querySelector("m-popselect") as Popselect
    setupPopselectRects(popselect)
    const select = popselect.querySelector("select") as HTMLSelectElement
    const changeHandler = vi.fn()
    popselect.addEventListener("m:change", changeHandler)

    select.value = "2"
    select.dispatchEvent(new Event("change", { bubbles: true }))

    expect(changeHandler).toHaveBeenCalledOnce()
    const event = changeHandler.mock.calls[0][0] as CustomEvent
    expect(event.detail).toEqual({ value: "2" })
    expect(popselect.value).toBe("2")
  })

  it("synchronizes disabled state to trigger, select, and controller", async () => {
    document.body.innerHTML = `
      <m-popselect disabled>
        <button type="button" id="dis-trigger">Trigger</button>
        <option value="1">One</option>
      </m-popselect>`
    await turn()
    const popselect = document.querySelector("m-popselect") as Popselect
    setupPopselectRects(popselect)
    const trigger = document.getElementById("dis-trigger") as HTMLButtonElement
    const select = popselect.querySelector("select") as HTMLSelectElement
    expect(popselect.disabled).toBe(true)
    expect(trigger.disabled).toBe(true)
    expect(select.disabled).toBe(true)
    expect(popselect.open()).toBe(false)

    popselect.disabled = false
    expect(trigger.disabled).toBe(false)
    expect(select.disabled).toBe(false)
  })

  it("generates a default trigger when no trigger is authored", async () => {
    document.body.innerHTML = `
      <m-popselect placeholder="Select choice">
        <option value="1">One</option>
      </m-popselect>`
    await turn()
    const popselect = document.querySelector("m-popselect") as Popselect
    const trigger = popselect.querySelector("button.m-popselect-trigger") as HTMLButtonElement
    expect(trigger).not.toBeNull()
    expect(trigger.textContent).toBe("Select choice")
  })
})

