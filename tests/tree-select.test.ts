import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { TreeSelect, registerTreeSelect } from "../src/components/tree-select/index.js"
import type { TreeSelectItem, TreeSelectSettings } from "../src/components/tree-select/index.js"
import { createTreeSelect, treeSelectData } from "../src/components/tree-select/tree-select.js"
import { ViewElement } from "../src/core/index.js"
import { createSelect } from "../src/components/native-select.js"
import { coordinateForm } from "../src/components/form/controller.js"

const css = readFileSync("src/components/tree-select/tree-select.css", "utf8")
const wait = () => new Promise(resolve => setTimeout(resolve, 25))
const items = (): TreeSelectItem[] => [
  { value: "docs", label: "Documents", children: [{ value: "readme", label: "README" }, { value: "notes", label: "Notes" }] },
  { value: "archive", label: "Archive", disabled: true, children: [{ value: "archived", label: "Old file" }] },
  { value: "standalone", label: "Standalone" },
]
function fixture(config: { multiple?: boolean; filterable?: boolean; settings?: TreeSelectSettings } = {}) {
  const form = document.createElement("form"), element = new TreeSelect()
  element.multiple = config.multiple ?? false; element.filterable = config.filterable ?? false
  element.settings = config.settings ?? {}; element.options = items()
  element.name = "files"; element.required = true; element.clearable = true
  form.append(element); document.body.append(form)
  const control = element.native!
  const option = (key: string) => [...control.options].find(option => option.value === key)!
  return { form, element, control, option, clear: element.querySelector<HTMLButtonElement>("[data-tree-select-clear]")! }
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Tree Select native visuals and registration", () => {
  it("keeps native list sizing and palette overrides within budget", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1250)
    for (const height of [22, 28, 34, 40]) expect(css).toContain(`--_tree-select-height: ${height}px`)
    for (const token of ["--m-select-border", "--m-select-background", "--m-select-color", "--m-select-focus", "--m-select-pad"]) expect(css).toContain(token)
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:height|block-size):/m)
    expect(css).not.toContain("appearance:"); expect(css).not.toContain("position: fixed")
    expect(css).toContain("color: GrayText !important"); expect(css).toContain("[hidden] { display: none !important; }")
  })
  it("registers only its own ViewElement and rejects conflicts", () => {
    expect(TreeSelect.prototype).toBeInstanceOf(ViewElement)
    expect(customElements.get("m-tree-select")).toBe(TreeSelect)
    const define = vi.fn(); registerTreeSelect({ get: () => undefined, define })
    expect(define.mock.calls.map(call => call[0])).toEqual(["m-tree-select"])
    expect(() => registerTreeSelect({ get: () => HTMLElement, define })).toThrow("different")
    expect(TreeSelect.observedAttributes).not.toContain("checkable")
    expect("checkable" in new TreeSelect()).toBe(false)
  })
  it("creates no passive native tree or competing Tree registration", () => {
    const { element } = fixture()
    expect(element.querySelector("[data-tree-select-source], [data-tree-list]")).toBeNull()
    expect(customElements.get("m-tree")).toBeUndefined()
    expect(customElements.get("m-select")).toBeUndefined()
    expect(element.hasAttribute("tabindex")).toBe(false); expect(element.hasAttribute("role")).toBe(false)
  })
})

describe("bounded data and projection", () => {
  it("preserves native option identity and listeners when labels and paths change", () => {
    const { element, option, control } = fixture()
    element.value = "readme"; const before = option("readme"), listener = vi.fn()
    before.addEventListener("custom", listener)
    element.options = [{ value: "manuals", label: "Manuals", children: [{ value: "readme", label: "Start" }] }]
    expect(option("readme")).toBe(before); expect(control).toBe(element.native)
    expect(before.textContent).toBe("Manuals / Start")
    expect(element.state.paths).toEqual([["manuals", "readme"]])
    before.dispatchEvent(new Event("custom")); expect(listener).toHaveBeenCalledOnce()
  })
  it("keeps leaf-only empty branches and nonselectable groups distinct", () => {
    const { element, control } = fixture({ settings: { selection: "leaf" } })
    expect(() => { element.value = "docs" }).toThrow()
    element.options = [{ value: "docs", label: "Documents", children: [] }, { value: "group", label: "Group", group: true }]
    expect([...control.options].map(option => option.value)).toEqual([""])
  })
  it("supports any-node selection without promoting descendants or groups", () => {
    const { element } = fixture()
    element.value = "docs"; expect(element.state.keys).toEqual(["docs"])
    element.options = [{ value: "docs", label: "Documents", group: true, children: [{ value: "readme", label: "README" }] }]
    expect(element.value).toBeNull(); expect(() => { element.value = "docs" }).toThrow()
    element.value = "readme"; expect(element.state.paths).toEqual([["docs", "readme"]])
  })
  it("prunes disabled paths and retains unavailable defaults without successful submission", () => {
    const { element, form, control } = fixture()
    element.defaultValue = "readme"; element.value = "readme"
    element.options = [{ ...items()[0]!, disabled: true }]
    expect(element.value).toBeNull(); expect(control.selectedIndex).toBe(-1)
    expect(element.state.unavailableDefaultKeys).toEqual(["readme"])
    expect(new FormData(form).getAll("files")).toEqual([]); expect(form.checkValidity()).toBe(false)
    expect(() => { element.value = "readme" }).toThrow()
  })
  it("keeps labels literal and supports custom separators and last-label readout", () => {
    const { element, option } = fixture({ settings: { separator: " > ", showPath: false } })
    element.options = [{ value: "docs", label: "Documents", children: [{ value: "readme", label: "<img src=x>" }] }]
    element.value = "readme"
    expect(option("readme").textContent).toBe("Documents > <img src=x>")
    expect(element.querySelector("[data-tree-select-value]")!.textContent).toBe("<img src=x>")
    expect(element.querySelector("img")).toBeNull()
  })
  it("snapshots caller data deeply and rejects duplicate keys before mutation", () => {
    const { element } = fixture(), data = items()
    element.options = data
    Object.assign(data[0]!, { label: "Changed" })
    expect(element.options[0]!.label).toBe("Documents")
    expect(Object.isFrozen(element.options[0]!.children)).toBe(true)
    const before = element.options
    expect(() => { element.options = [...items(), items()[0]!] }).toThrow("unique")
    expect(element.options).toBe(before)
  })
  it("enforces node, depth and path-label bounds", () => {
    const { element } = fixture()
    element.value = "readme"
    const before = element.options
    expect(() => { element.options = Array.from({ length: 2001 }, (_, i) => ({ value: String(i), label: "Node" })) }).toThrow()
    let nested: TreeSelectItem = { value: "0", label: "Node" }
    for (let i = 1; i <= 64; i++) nested = { value: String(i), label: "Node", children: [nested] }
    expect(() => { element.options = [nested] }).toThrow("64")
    expect(() => { element.options = [{ value: "a", label: "A".repeat(1024), children: [{ value: "b", label: "B".repeat(1024) }] }] }).toThrow("2048")
    expect(element.options).toBe(before)
    expect(element.state.valid).toBe(true); expect(element.value).toBe("readme")
  })
  it.each([{ load: () => {} }, { cascade: true }, { checkable: true }, { selection: "bad" }, { separator: "x".repeat(33) }, { showPath: null }])("rejects unsupported settings %j", settings => {
    expect(() => { new TreeSelect().settings = settings as never }).toThrow()
  })
})

describe("native forms, filtering and events", () => {
  it("keeps required single listboxes empty instead of accepting blank options", () => {
    const { element, control, form } = fixture({ filterable: true })
    expect(control.selectedIndex).toBe(-1); expect(form.checkValidity()).toBe(false)
    control.selectedIndex = 0; control.dispatchEvent(new Event("change", { bubbles: true }))
    expect(element.value).toBeNull(); expect(control.selectedIndex).toBe(-1)
    expect(form.checkValidity()).toBe(false)
  })
  it("retains selected nonmatches and authored hidden flags while filtering", () => {
    const { element, option, form } = fixture({ multiple: true, filterable: true })
    element.value = ["readme"]; const before = [...new FormData(form)]
    element.setFilter("Standalone")
    expect(option("readme").selected).toBe(true); expect(option("readme").hidden).toBe(false)
    expect(option("notes").hidden).toBe(true); expect([...new FormData(form)]).toEqual(before)
    option("readme").hidden = true; element.setFilter("zzz")
    expect(element.value).toEqual(["readme"]); expect([...new FormData(form)]).toEqual(before)
  })
  it("protects composing drafts and does not confuse disabled fieldsets with lost values", () => {
    const { element, form } = fixture({ multiple: true, filterable: true })
    const input = element.querySelector<HTMLInputElement>("[data-select-filter]")!
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); input.value = "draft"
    expect(() => element.setFilter("replace")).toThrow("composing")
    expect(input.value).toBe("draft")
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    element.value = ["readme"]
    const fieldset = document.createElement("fieldset"); fieldset.disabled = true
    form.append(fieldset); fieldset.append(element)
    expect(element.value).toEqual(["readme"]); expect(new FormData(form).getAll("files")).toEqual([])
  })
  it("supports external form association established before rebind", async () => {
    const { element, form, control } = fixture()
    element.defaultValue = "readme"; element.value = "notes"
    element.remove(); form.id = "external-form"; control.setAttribute("form", form.id); document.body.append(element)
    form.reset(); await wait()
    expect(element.value).toBe("readme"); expect(new FormData(form).getAll("files")).toEqual(["readme"])
  })
  it("preserves application validity and composes with the native Form coordinator", async () => {
    const { element, form, control } = fixture()
    control.setCustomValidity("Application policy"); element.value = "readme"
    const validation = coordinateForm(form, { items: [{ key: "files", controls: [control] }] })
    expect((await validation.validate()).status).toBe("invalid")
    control.setCustomValidity(""); element.refresh()
    expect((await validation.validate()).status).toBe("valid"); validation.disconnect()
  })
  it("recognizes native defaultSelected edits without overwriting native current selection", async () => {
    const { element, option, form } = fixture()
    element.defaultValue = "readme"; element.value = "standalone"
    option("readme").defaultSelected = false; option("notes").defaultSelected = true
    const current = element.native!.value
    element.refresh(); expect(element.value).toBe(current)
    form.reset(); await wait(); expect(element.value).toBe("notes")
  })
  it("captures pending native defaults and disabled overrides before disconnect", async () => {
    const { element, option, form } = fixture()
    option("notes").defaultSelected = true; option("readme").disabled = true
    element.remove(); form.append(element)
    form.reset(); await wait(); expect(element.value).toBe("notes")
    expect(() => { element.value = "readme" }).toThrow()
  })
  it("does not let queued clear supersede an explicit value write", async () => {
    const { element, clear } = fixture()
    element.value = "readme"; clear.click(); element.value = "notes"; await wait()
    expect(element.value).toBe("notes")
  })
  it("preserves a clear requested after native reset but before reset reconciliation", async () => {
    const { element, form, clear } = fixture()
    element.defaultValue = "readme"; element.value = "notes"
    form.reset(); expect(element.value).toBe("readme")
    clear.click(); await wait()
    expect(element.value).toBeNull()
  })
  it("preserves a native reset requested after a queued clear", async () => {
    const { element, form, clear } = fixture()
    element.defaultValue = "readme"; element.value = "notes"
    clear.click(); form.reset(); await wait()
    expect(element.value).toBe("readme")
  })
  it("finishes reset presentation when the subsequent clear is canceled", async () => {
    const { element, form, clear } = fixture()
    element.defaultValue = "readme"; element.value = "notes"
    clear.addEventListener("click", event => event.preventDefault(), { once: true })
    form.reset(); clear.click(); await wait()
    expect(element.value).toBe("readme")
    expect(element.querySelector("[data-tree-select-value]")!.textContent).toBe("Documents / README")
  })
  it("emits one host event for native selection and no event for programmatic writes", () => {
    const { element, control, form } = fixture(), listener = vi.fn()
    form.addEventListener("m:tree-select-change", listener)
    element.value = "readme"; expect(listener).not.toHaveBeenCalled()
    control.value = "notes"; control.dispatchEvent(new Event("change", { bubbles: true }))
    expect(listener).toHaveBeenCalledOnce()
    const event = listener.mock.calls[0]![0]
    expect(event.target).toBe(element); expect(event.detail.action).toBe("select")
    expect(event.detail.paths).toEqual([["docs", "notes"]])
    expect(event.cancelable).toBe(false); expect(event.composed).toBe(false)
  })
  it("hands off current native options, defaults and submission after disconnect", () => {
    const { element, form, option, control } = fixture({ multiple: true, filterable: true })
    element.defaultValue = ["readme", "notes"]; element.value = ["notes", "standalone"]
    element.setFilter("no match"); const notes = option("notes")
    element.disconnectedCallback()
    expect(control.selectedOptions.length).toBe(2); expect(notes.hidden).toBe(false)
    form.reset(); expect([...new FormData(form)].map(([, value]) => value)).toEqual(["readme", "notes"])
  })
})

describe("ownership, corruption and cleanup", () => {
  it("rejects duplicate Tree Select and Native Select owners", () => {
    const { element } = fixture(), root = element.querySelector<HTMLElement>("[data-tree-select]")!
    expect(() => createTreeSelect(root, treeSelectData(items()))).toThrow("unowned")
    expect(() => createSelect(root.querySelector("[data-tree-select-field]")!)).toThrow("owner")
  })
  it("gates native option corruption until repair and cancels submission", () => {
    const { element, control, option, form } = fixture()
    element.value = "readme"; const node = option("notes"); node.value = "duplicate"
    expect(() => element.refresh()).toThrow("projected")
    expect(control.validity.customError).toBe(true)
    const event = new Event("submit", { bubbles: true, cancelable: true }); form.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    node.value = "notes"; element.refresh()
    expect(element.value).toBe("readme"); expect(control.validity.customError).toBe(false)
  })
  it("rejects nested control ownership changes and recovers after repair", () => {
    const { element, control } = fixture()
    element.value = "readme"; control.setAttribute("role", "combobox")
    expect(() => element.refresh()).toThrow("role")
    control.removeAttribute("role"); element.refresh()
    expect(element.value).toBe("readme"); expect(element.error).toBeNull()
  })
  it("blocks reentrant data changes from native focus callbacks", () => {
    const { element, control, clear } = fixture()
    element.value = "readme"; clear.focus()
    let rejected = false
    control.addEventListener("focus", () => {
      try { element.options = [] } catch { rejected = true }
    }, { once: true })
    element.options = []
    expect(rejected).toBe(true); expect(element.options).toEqual([])
  })
  it("cancels queued actions on disconnect and keeps surviving native options on reconnect", async () => {
    const { element, control, clear, form, option } = fixture()
    element.value = "readme"; const before = option("readme")
    clear.click(); element.remove(); form.append(element); await wait()
    expect(element.native).toBe(control); expect(option("readme")).toBe(before); expect(element.value).toBe("readme")
  })
  it("requires explicit disconnect for native mode changes without partial writes", () => {
    const { element, form, control } = fixture()
    expect(() => { element.multiple = true }).toThrow("Disconnect")
    expect(() => { element.settings = { selection: "leaf" } }).toThrow("Disconnect")
    expect(control.multiple).toBe(false)
    element.remove(); element.multiple = true; element.filterable = true
    element.value = ["readme", "notes"]; form.append(element)
    expect(element.native).toBe(control); expect(element.value).toEqual(["readme", "notes"])
  })
})
