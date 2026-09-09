import { afterEach, describe, expect, it, vi } from "vitest"
import { createTreeSelect } from "../src/components/tree-select/index.js"
import type { TreeSelectController, TreeSelectOptions } from "../src/components/tree-select/index.js"
import { createTree } from "../src/components/tree/index.js"
import { createSelect } from "../src/components/select/index.js"
import { createForm } from "../src/components/form/index.js"

const controllers: TreeSelectController[] = []
const wait = () => new Promise(resolve => setTimeout(resolve, 25))
function row(key: string, label: string, children = "", extra = "") {
  return `<li data-tree-key="${key}" ${extra}><div data-tree-row><span data-tree-label>${label}</span></div>${children ? `<details data-tree-branch><summary>${label} children</summary><ul data-tree-list>${children}</ul></details>` : ""}</li>`
}
const sourceHTML = () => row("docs", "Documents", row("readme", "README") + row("notes", "Notes"))
  + row("archive", "Archive", row("archived", "Old file"), "data-tree-disabled") + row("standalone", "Standalone")
function fixture(options: TreeSelectOptions = {}, config: { multiple?: boolean; filter?: boolean; initial?: string; required?: boolean; source?: string } = {}) {
  const form = document.createElement("form")
  form.innerHTML = `<section class="mui-tree-select" data-tree-select><section class="mui-tree" data-tree data-tree-select-source aria-label="Files"><ul data-tree-list>${config.source ?? sourceHTML()}</ul></section><div class="mui-select" data-select data-tree-select-field><label>Files<select data-select-control name="files" ${config.multiple ? "multiple" : ""} ${config.filter || config.multiple ? 'size="5"' : ""} ${config.required !== false ? "required" : ""}>${!config.multiple ? `<option value="" ${config.filter ? "" : "data-select-placeholder"}>Choose file</option>` : ""}<option value="readme" ${config.initial === "readme" ? "selected" : ""}>Documents / README</option><option value="notes" ${config.initial === "notes" ? "selected" : ""}>Documents / Notes</option><option value="standalone" ${config.initial === "standalone" ? "selected" : ""}>Standalone</option></select></label>${config.filter ? '<div data-select-search hidden><label>Filter<input type="search" data-select-filter></label><p data-select-empty hidden>No matches. Selected items remain visible.</p></div>' : ""}</div><p data-tree-select-value></p><p data-tree-select-status></p><button type="button" data-tree-select-clear hidden>Clear files</button></section><button type="button" id="outside">Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-tree-select]")!, source = root.querySelector<HTMLElement>("[data-tree-select-source]")!
  const control = root.querySelector<HTMLSelectElement>("select")!, original = [...control.options], label = control.labels![0]!
  const helper = createTreeSelect(root, options); controllers.push(helper)
  const node = (key: string) => [...source.querySelectorAll<HTMLLIElement>("[data-tree-key]")].find(node => node.dataset.treeKey === key)!
  const option = (key: string) => [...control.options].find(option => option.value === key)!
  return { form, root, source, control, original, label, helper, node, option, clear: root.querySelector<HTMLButtonElement>("[data-tree-select-clear]")! }
}
afterEach(() => {
  for (const controller of controllers.splice(0)) { try { controller.disconnect() } catch { /* Fault teardown is asserted separately. */ } }
  document.body.replaceChildren(); vi.restoreAllMocks()
})

describe("native hierarchy projection and value policy", () => {
  it("keeps native selects, labels, options and listeners while showing full paths", () => {
    const { helper, control, original, label, option } = fixture()
    const listener = vi.fn(); original[1]!.addEventListener("custom", listener); helper.refresh()
    expect(control.labels![0]).toBe(label); expect(option("readme")).toBe(original[1])
    expect(option("readme").textContent).toBe("Documents / README")
    option("readme").dispatchEvent(new Event("custom")); expect(listener).toHaveBeenCalledOnce()
    expect(control.getAttribute("role")).toBeNull()
  })
  it("uses single native string/null values and complete key paths", () => {
    const { helper } = fixture()
    helper.setValue("readme"); expect(helper.value).toBe("readme")
    expect(helper.state.paths).toEqual([["docs", "readme"]])
    helper.setValue(null); expect(helper.value).toBeNull(); expect(helper.state.keys).toEqual([])
  })
  it("uses independent multiple keys in native DOM order without cascading parents", () => {
    const { helper, form } = fixture({}, { multiple: true })
    helper.setValue(["readme", "docs"])
    expect(helper.value).toEqual(["docs", "readme"])
    expect(helper.state.paths).toEqual([["docs"], ["docs", "readme"]])
    expect(new FormData(form).getAll("files")).toEqual(["docs", "readme"])
  })
  it("supports leaf-only selection without automatically promoting an empty branch", () => {
    const { helper, node, control } = fixture({ selection: "leaf" })
    expect([...control.options].some(option => option.value === "docs")).toBe(false)
    expect(() => helper.setValue("docs")).toThrow()
    node("readme").remove(); node("notes").remove(); helper.refresh()
    expect([...control.options].some(option => option.value === "docs")).toBe(false)
  })
  it("allows known branches in any mode and never accepts unknown or numeric keys", () => {
    const { helper, control } = fixture()
    helper.setValue("docs")
    for (const key of ["missing", 1, {}, ["readme"], ""]) expect(() => helper.setValue(key as never)).toThrow()
    expect(control.value).toBe("docs")
  })
  it("requires arrays only in multiple mode and rejects duplicates atomically", () => {
    const { helper } = fixture({}, { multiple: true })
    helper.setValue(["readme"])
    for (const value of [null, "notes", [1], ["readme", "readme"], ["missing"]]) expect(() => helper.setValue(value as never)).toThrow()
    expect(helper.value).toEqual(["readme"])
  })
  it("disables every path beneath a disabled ancestor and prunes newly disabled selections", () => {
    const { helper, node, option, form } = fixture()
    expect(option("archived").disabled).toBe(true)
    expect(() => helper.setValue("archived")).toThrow()
    helper.setValue("readme"); node("docs").setAttribute("data-tree-disabled", ""); helper.refresh()
    expect(helper.value).toBeNull(); expect(form.checkValidity()).toBe(false)
  })
  it("prunes disabled selected defaults rather than letting required pass with no successful value", () => {
    const { helper, control, form, node } = fixture({}, { initial: "readme" })
    node("docs").setAttribute("data-tree-disabled", ""); helper.refresh()
    expect(helper.value).toBeNull(); expect(control.selectedIndex).toBe(-1)
    expect(helper.state.unavailableDefaultKeys).toEqual(["readme"])
    expect(new FormData(form).getAll("files")).toEqual([]); expect(form.checkValidity()).toBe(false)
  })
  it("refreshes labels and moved paths while retaining valid key/option identity", () => {
    const { helper, node, option, source } = fixture({ value: "readme" })
    const before = option("readme"); node("docs").querySelector("[data-tree-label]")!.textContent = "Manuals"
    helper.refresh(); expect(before.textContent).toBe("Manuals / README")
    source.querySelector("[data-tree-list]")!.append(node("readme")); helper.refresh()
    expect(option("readme")).toBe(before); expect(helper.value).toBe("readme")
    expect(helper.state.paths).toEqual([["readme"]]); expect(before.textContent).toBe("README")
  })
  it("keeps duplicate leaf labels unambiguous through full native paths", () => {
    const { helper, node, option } = fixture()
    node("standalone").querySelector("[data-tree-label]")!.textContent = "README"; helper.refresh()
    expect(option("readme").textContent).toBe("Documents / README")
    expect(option("standalone").textContent).toBe("README")
  })
  it("uses literal labels and optional last-label readout without unsafe HTML", () => {
    const { helper, node, option, root } = fixture({ showPath: false, separator: " → " })
    node("readme").querySelector("[data-tree-label]")!.textContent = "<img src=x>"
    helper.refresh(); helper.setValue("readme")
    expect(option("readme").textContent).toBe("Documents → <img src=x>")
    expect(root.querySelector("[data-tree-select-value]")!.textContent).toBe("<img src=x>")
    expect(root.querySelector("img")).toBeNull()
  })
})

describe("native filtering and forms", () => {
  it("keeps selected nonmatches mounted/visible and FormData unchanged while filtering", () => {
    const { helper, option, form } = fixture({}, { multiple: true, filter: true })
    helper.setValue(["readme"]); const before = [...new FormData(form)]
    helper.setFilter("Standalone")
    expect(option("readme").selected).toBe(true); expect(option("readme").hidden).toBe(false)
    expect(option("notes").hidden).toBe(true); expect([...new FormData(form)]).toEqual(before)
  })
  it("does not confuse authored CSS-hidden selected values with unsubmitted values", () => {
    const { helper, option, form } = fixture({}, { multiple: true, filter: true })
    helper.setValue(["readme"]); option("readme").hidden = true
    helper.setFilter("zzz")
    expect(helper.value).toEqual(["readme"]); expect(new FormData(form).getAll("files")).toEqual(["readme"])
  })
  it("leaves filter composition to the existing Native Select helper", () => {
    const { helper } = fixture({}, { filter: true })
    const filter = helper.filter!
    filter.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    filter.value = "draft"
    expect(() => helper.setFilter("replace")).toThrow()
    expect(filter.value).toBe("draft")
    filter.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    helper.setFilter("README"); expect(filter.value).toBe("README")
  })
  it("keeps a required single listbox empty instead of accepting its blank placeholder", () => {
    const { helper, control, form } = fixture({}, { filter: true })
    expect(control.selectedIndex).toBe(-1); expect(form.checkValidity()).toBe(false)
    control.selectedIndex = 0; control.dispatchEvent(new Event("change", { bubbles: true }))
    expect(helper.value).toBeNull(); expect(control.selectedIndex).toBe(-1); expect(form.checkValidity()).toBe(false)
  })
  it("honors native multiple required/name/fieldset/FormData behavior", () => {
    const { helper, root, form, control } = fixture({}, { multiple: true })
    expect(form.checkValidity()).toBe(false); helper.setValue(["readme", "notes"])
    expect(form.checkValidity()).toBe(true); expect(control.name).toBe("files")
    const fieldset = document.createElement("fieldset"); fieldset.disabled = true; form.append(fieldset); fieldset.append(root)
    helper.refresh(); expect(new FormData(form).getAll("files")).toEqual([])
    expect(helper.value).toEqual(["readme", "notes"])
  })
  it("preserves application custom validity and composes with Native Form", async () => {
    const { helper, form, control } = fixture()
    control.setCustomValidity("Application policy")
    helper.setValue("readme"); expect(control.validationMessage).toBe("Application policy")
    const validation = createForm(form, { items: [{ key: "files", controls: [control] }] })
    expect((await validation.validate()).status).toBe("invalid")
    control.setCustomValidity(""); helper.refresh()
    expect((await validation.validate()).status).toBe("valid")
    validation.disconnect()
  })
  it("supports explicit external form association without moving names or controls", async () => {
    const { helper, root, form, control } = fixture({ defaultValue: "readme" })
    form.id = "external-form"; control.setAttribute("form", form.id); document.body.append(root); helper.refresh()
    helper.setValue("notes"); form.reset(); await wait()
    expect(helper.value).toBe("readme"); expect(new FormData(form).getAll("files")).toEqual(["readme"])
  })
})

describe("native defaults, refresh and notifications", () => {
  it("keeps current/default values separate and resets silently", async () => {
    const { helper, form, root } = fixture({ defaultValue: "readme", value: "notes" }), change = vi.fn()
    root.addEventListener("mui:tree-select-change", change)
    form.reset(); await wait(); expect(helper.value).toBe("readme")
    helper.setValue("standalone"); helper.refresh(); expect(change).not.toHaveBeenCalled()
  })
  it("preserves current selection and filter on cancelled reset", async () => {
    const { helper, form } = fixture({ defaultValue: ["readme"] }, { multiple: true, filter: true })
    helper.setValue(["notes"]); helper.setFilter("Notes")
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await wait(); expect(helper.value).toEqual(["notes"]); expect(helper.filter!.value).toBe("Notes")
  })
  it("restores only surviving multiple defaults without an unrelated replacement", async () => {
    const { helper, node, form } = fixture({ defaultValue: ["readme", "notes"] }, { multiple: true })
    helper.setValue(["standalone"]); node("readme").remove()
    form.reset(); await wait()
    expect(helper.value).toEqual(["notes"]); expect(helper.state.unavailableDefaultKeys).toEqual(["readme"])
  })
  it("clears a missing single default and retains required invalidity", async () => {
    const { helper, node, control, form } = fixture({ defaultValue: "readme" })
    node("readme").remove(); form.reset(); await wait()
    expect(helper.value).toBeNull(); expect(control.selectedIndex).toBe(-1); expect(form.checkValidity()).toBe(false)
    expect([...control.options].some(option => option.value === "readme")).toBe(false)
  })
  it("recognizes native defaultSelected edits and explicit default setter", async () => {
    const { helper, option, form } = fixture({ defaultValue: "readme" })
    option("readme").defaultSelected = false; option("notes").defaultSelected = true
    helper.refresh(); helper.setValue("standalone"); form.reset(); await wait()
    expect(helper.value).toBe("notes")
    helper.setDefaultValue("standalone"); expect(helper.value).toBe("notes")
    form.reset(); await wait(); expect(helper.value).toBe("standalone")
  })
  it("does not overwrite a later setter with queued post-reset synchronization", async () => {
    const { helper, form } = fixture({ defaultValue: "readme" })
    form.reset(); helper.setValue("notes"); await wait()
    expect(helper.value).toBe("notes")
  })
  it("emits once for native change/clear and never for filtering or setters", async () => {
    const { helper, control, root, clear } = fixture({}, { filter: true }), change = vi.fn()
    root.addEventListener("mui:tree-select-change", change)
    helper.setValue("readme"); helper.setFilter("README"); expect(change).not.toHaveBeenCalled()
    control.value = "notes"; control.dispatchEvent(new Event("change", { bubbles: true }))
    expect(change).toHaveBeenCalledOnce()
    clear.click(); await wait(); expect(change).toHaveBeenCalledTimes(2); expect(helper.value).toBeNull()
  })
  it("honors cancelled clear and moves focus before hiding the clear action", async () => {
    const { helper, form, clear, control } = fixture({ value: "readme" })
    form.addEventListener("click", event => event.preventDefault(), { once: true }); clear.click(); await wait()
    expect(helper.value).toBe("readme")
    clear.focus(); helper.clear(); expect(document.activeElement).toBe(control); expect(clear.hidden).toBe(true)
  })
})

describe("ownership, bounded data and native handoff", () => {
  it("rejects active Tree/Select owners and repeated module owners", async () => {
    const { helper, root, source } = fixture()
    expect(() => createTree(source)).toThrow("owner")
    expect(() => createSelect(root.querySelector("[data-tree-select-field]")!)).toThrow("owner")
    vi.resetModules(); const other = await import("../src/components/tree-select/index.js")
    expect(() => other.createTreeSelect(root)).toThrow("unowned")
    helper.disconnect()
  })
  it("does not rewrite another Native Select owner's option collection on a rejected bind", () => {
    const { helper, root, control } = fixture({ value: "notes" }); helper.disconnect()
    const native = createSelect(root.querySelector("[data-tree-select-field]")!)
    const replace = vi.spyOn(control, "replaceChildren")
    expect(() => createTreeSelect(root)).toThrow("owner")
    expect(replace).not.toHaveBeenCalled(); expect(control.value).toBe("notes")
    native.disconnect()
  })
  it("rejects unknown fallback options, source form controls and duplicate keys before mutation", () => {
    expect(() => fixture({}, { source: row("x", "X") })).toThrow("fallback")
    expect(() => fixture({}, { source: sourceHTML() + row("readme", "Duplicate") })).toThrow("unique")
    expect(() => fixture({}, { source: sourceHTML().replace("Documents</span>", 'Documents</span><input name="hidden-source">') })).toThrow("passive")
  })
  it("bounds native source count, depth and full-path labels", () => {
    expect(() => fixture({}, { source: sourceHTML() + Array.from({ length: 2000 }, (_, i) => row(`x-${i}`, "Extra")).join("") })).toThrow("2000")
    expect(() => fixture({}, { source: sourceHTML().replace("Documents</span>", `${"x".repeat(2049)}</span>`) })).toThrow("2048")
  })
  it("retains keys across replacement/reorder, clears removed keys and refreshes their paths", () => {
    const { helper, source, node, control } = fixture({ value: "readme" })
    const option = [...control.options].find(option => option.value === "readme")
    const replacement = node("readme").cloneNode(true); node("readme").replaceWith(replacement); helper.refresh()
    expect(helper.value).toBe("readme"); expect([...control.options].find(item => item.value === "readme")).toBe(option)
    source.querySelector("[data-tree-list]")!.append(replacement); helper.refresh()
    expect(helper.state.paths).toEqual([["readme"]])
    replacement.remove(); helper.refresh(); expect(helper.value).toBeNull()
  })
  it("keeps nested and separate roots independent with native form ownership", () => {
    const a = fixture(), b = fixture({}, { multiple: true })
    b.form.id = "nested-owner"; b.control.setAttribute("form", b.form.id); a.root.append(b.root)
    a.helper.refresh(); b.helper.refresh(); a.helper.setValue("readme"); b.helper.setValue(["notes"])
    expect(a.helper.value).toBe("readme"); expect(b.helper.value).toEqual(["notes"])
  })
  it("gates corrupted sources until repair without clearing unrelated author DOM", () => {
    const { helper, node, root, form } = fixture({ value: "readme" })
    node("notes").dataset.treeKey = "readme"; expect(() => helper.refresh()).toThrow("unique")
    expect(helper.state.valid).toBe(false); expect(form.checkValidity()).toBe(false)
    const bad = [...root.querySelectorAll('[data-tree-key="readme"]')][1]!; bad.setAttribute("data-tree-key", "notes")
    helper.refresh(); expect(helper.value).toBe("readme")
  })
  it("hands off current options/selection/defaults instead of undoing edits or resurrecting removed keys", async () => {
    const { helper, control, form, node, option } = fixture({ defaultValue: ["readme", "notes"] }, { multiple: true, filter: true })
    helper.setValue(["notes", "standalone"]); helper.setFilter("does not match")
    const notes = option("notes"); node("readme").remove()
    helper.disconnect(); await wait()
    expect([...control.selectedOptions].map(option => option.value)).toEqual(["notes", "standalone"])
    expect([...control.options].find(option => option.value === "notes")).toBe(notes)
    expect([...control.options].some(option => option.value === "readme")).toBe(false)
    expect(notes.hidden).toBe(false)
    form.reset(); expect([...control.options].filter(option => option.selected).map(option => option.value)).toEqual(["notes"])
    expect(new FormData(form).getAll("files")).toEqual(["notes"])
    expect(() => helper.setValue([])).toThrow("disconnected")
  })
  it("leaves single selected native value intact after teardown", () => {
    const { helper, control, form } = fixture({ defaultValue: "readme" })
    helper.setValue("notes"); helper.disconnect()
    expect(control.value).toBe("notes"); expect(new FormData(form).get("files")).toBe("notes")
    expect(() => helper.value).toThrow("disconnected")
  })
  it("keeps source updates application-owned and rejects fake lazy/checking options", () => {
    for (const options of [{ load: () => {} }, { cascade: true }, { checkable: true }, { virtualScroll: true }]) {
      expect(() => fixture(options as TreeSelectOptions)).toThrow("Unsupported")
    }
  })
})
