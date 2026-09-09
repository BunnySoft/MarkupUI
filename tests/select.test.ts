import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createSelect } from "../src/components/select/index.js"
import type { SelectController } from "../src/components/select/index.js"

const helpers: SelectController[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "language-root") {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "select.html"), "utf8"), "text/html")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const root = document.getElementById(id)!, helper = createSelect(root)
  helpers.push(helper)
  return { root, helper, control: helper.control, filter: helper.filter!,
    clear: root.querySelector<HTMLButtonElement>("[data-select-clear]")!,
    form: document.getElementById("selection-form") as HTMLFormElement,
    option: (value: string) => [...helper.control.options].find(option => option.value === value)! }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("authored native Select ownership", () => {
  it("preserves select/options/groups/labels/listeners, attributes and pre-enhancement state", () => {
    const { root, helper, control, option } = fixture()
    helper.disconnect()
    control.value = "rust"
    const original = option("rust"), group = original.parentElement, label = control.labels![0], before = control.outerHTML
    const changed = vi.fn(); control.addEventListener("change", changed)
    const rebound = createSelect(root); helpers.push(rebound)
    expect(rebound.control).toBe(control)
    expect(option("rust")).toBe(original)
    expect(original.parentElement).toBe(group)
    expect(control.labels![0]).toBe(label)
    expect(control.outerHTML).toBe(before)
    expect(rebound.value).toBe("rust")
    control.dispatchEvent(new Event("change", { bubbles: true }))
    expect(changed).toHaveBeenCalledTimes(1)
    expect(root.querySelectorAll("select")).toHaveLength(1)
    expect(root.hasAttribute("role")).toBe(false)
  })
  it("has no legacy registration or defaultValue proxy", () => {
    const before = customElements.get("mui-select")
    const { control } = fixture()
    expect(customElements.get("mui-select")).toBe(before)
    expect("defaultValue" in control).toBe(false)
  })
  it("rejects duplicate and cross-module owners and permits recreation", async () => {
    const { root, helper } = fixture()
    expect(() => createSelect(root)).toThrow("owner")
    vi.resetModules()
    const other = await import("../src/components/select/index.js")
    expect(() => other.createSelect(root)).toThrow("owner")
    helper.disconnect(); helper.disconnect()
    helpers.push(other.createSelect(root))
  })
  it("rejects missing/duplicate option keys and unnamed groups", () => {
    const { root, helper, option } = fixture()
    helper.disconnect(); option("rust").value = "typescript"
    expect(() => createSelect(root)).toThrow("unique")
    option("go").removeAttribute("value")
    expect(() => createSelect(root)).toThrow("explicit")
    root.querySelector<HTMLOptionElement>('option[value="typescript"]')!.nextElementSibling!.setAttribute("value", "rust")
    root.querySelector("optgroup")!.lastElementChild!.setAttribute("value", "go")
    root.querySelector("optgroup")!.removeAttribute("label")
    expect(() => createSelect(root)).toThrow("labels")
  })
  it("rejects unsafe clear buttons and fictitious readonly", () => {
    const { root, helper, clear, control } = fixture()
    helper.disconnect(); clear.type = "submit"
    expect(() => createSelect(root)).toThrow("type=button")
    clear.type = "button"; control.setAttribute("readonly", "")
    expect(() => createSelect(root)).toThrow("readonly")
  })
  it("requires a labelled external filter and native list presentation", () => {
    const { root, helper, control } = fixture("tools-root")
    helper.disconnect(); control.multiple = false; control.size = 1
    expect(() => createSelect(root)).toThrow("native list")
    control.size = 5
    root.querySelector('label[for="tool-filter"]')!.remove()
    expect(() => createSelect(root)).toThrow("labelled")
  })
})

describe("single/multiple strings, placeholder and defaults", () => {
  it("distinguishes selected empty placeholder, no selection and an ordinary key", () => {
    const { helper, control, option, form } = fixture()
    const nativePlaceholderData = new FormData(form).getAll("language")
    expect(helper.value).toBe("")
    expect(control.selectedIndex).toBe(0)
    expect(control.validity.valueMissing).toBe(true)
    helper.setValue(null)
    expect(helper.value).toBeNull()
    expect(control.selectedIndex).toBe(-1)
    helper.setValue("typescript")
    expect(control.validity.valueMissing).toBe(false)
    expect(helper.clear()).toBe(true)
    expect(helper.value).toBe("")
    expect(option("").selected).toBe(true)
    // jsdom includes disabled selected options in FormData; real omission is verified in Chromium.
    expect(new FormData(form).getAll("language")).toEqual(nativePlaceholderData)
  })
  it("distinguishes enabled empty-string submission from no selection", () => {
    const { helper, option, form } = fixture()
    option("").disabled = false
    expect(new FormData(form).getAll("language")).toEqual([""])
    helper.setValue(null)
    expect(new FormData(form).has("language")).toBe(false)
  })
  it("uses null for clear without a placeholder", () => {
    const { helper, control } = fixture("external-root")
    expect(helper.clear()).toBe(true)
    expect(helper.value).toBeNull()
    expect(control.selectedIndex).toBe(-1)
  })
  it("uses DOM-order arrays and includes disabled selected options/groups in state", () => {
    const { helper, option } = fixture("tools-root")
    expect(helper.value).toEqual(["html", "server", "legacy"])
    helper.setValue(["css", "html"])
    expect(helper.value).toEqual(["html", "css"])
    helper.setValue(["server", "legacy"])
    expect(helper.value).toEqual(["server", "legacy"])
    expect(option("server").parentElement!.hasAttribute("disabled")).toBe(true)
    expect(option("legacy").disabled).toBe(true)
    helper.clear()
    expect(helper.value).toEqual([])
  })
  it.each([["missing"], [1], ["rust", "rust"], [null]])("rejects array input in single mode %j", (...value) => {
    const { helper } = fixture()
    expect(() => helper.setValue(value as string[])).toThrow()
    expect(helper.value).toBe("")
  })
  it.each([{ value: null }, { value: "html" }, { value: ["missing"] }, { value: ["html", "html"] }, { value: [1] }])("rejects invalid multiple value %j", ({ value }) => {
    const { helper } = fixture("tools-root")
    expect(() => helper.setValue(value as string[])).toThrow()
    expect(helper.value).toEqual(["html", "server", "legacy"])
  })
  it("does not fabricate events or defaultSelected changes on setters/refresh", () => {
    const { helper, control, option } = fixture()
    const events = vi.fn(); control.addEventListener("input", events); control.addEventListener("change", events)
    helper.setValue("rust"); helper.refresh()
    expect(option("").defaultSelected).toBe(true)
    expect(option("rust").defaultSelected).toBe(false)
    expect(events).not.toHaveBeenCalled()
    control.value = "go"
    expect(helper.value).toBe("go")
    expect(Object.hasOwn(control, "value")).toBe(false)
  })
  it("requires placeholder markers to have native dropdown placeholder anatomy", () => {
    const { root, helper, control } = fixture()
    helper.disconnect(); control.size = 5
    expect(() => createSelect(root)).toThrow("placeholder")
    control.size = 1; control.multiple = true
    expect(() => createSelect(root)).toThrow("placeholder")
  })
})

describe("literal filtering preserves native selectedness and owner visibility", () => {
  it("pins selected nonmatches, preserves native FormData and hides only unselected nonmatches", () => {
    const { helper, option, form } = fixture("tools-root")
    const before = [...new FormData(form)]
    helper.setFilter("CSS")
    expect(helper.value).toEqual(["html", "server", "legacy"])
    for (const key of ["html", "server", "legacy", "css"]) expect(option(key).hidden).toBe(false)
    expect(option("js").hidden).toBe(true)
    expect([...new FormData(form)]).toEqual(before)
    expect(option("archive").hidden).toBe(true)
  })
  it("matches group labels literally, without regex interpretation", () => {
    const { helper, option, root } = fixture("tools-root")
    helper.setFilter("Locked")
    expect(option("database").hidden).toBe(false)
    helper.setFilter(".*")
    expect(option("database").hidden).toBe(true)
    expect(root.querySelector<HTMLElement>("[data-select-empty]")!.hidden).toBe(false)
    expect(option("html").hidden).toBe(false)
  })
  it("supports a filtered single native list without creating a placeholder or changing clear semantics", () => {
    const { root, helper, control } = fixture("tools-root")
    helper.disconnect(); control.multiple = false
    const single = createSelect(root); helpers.push(single)
    single.setValue("css"); single.setFilter("unmatched")
    expect(single.value).toBe("css")
    expect([...control.selectedOptions][0]!.hidden).toBe(false)
    single.clear()
    expect(single.value).toBeNull()
    expect(control.selectedIndex).toBe(-1)
  })
  it("preserves composed filter drafts and defers visibility until composition ends", () => {
    const { helper, filter, option } = fixture("tools-root")
    filter.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    filter.value = "CSS"
    filter.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    expect(option("js").hidden).toBe(false)
    expect(() => helper.setFilter("replace")).toThrow("composing")
    filter.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    expect(option("js").hidden).toBe(true)
    expect(filter.value).toBe("CSS")
  })
  it("does not reset filter text on user selection and never duplicates ordinary native events", () => {
    const { helper, filter, control, option } = fixture("tools-root")
    const events = vi.fn(); control.addEventListener("input", events); control.addEventListener("change", events)
    helper.setFilter("CSS"); option("css").selected = true
    control.dispatchEvent(new Event("input", { bubbles: true }))
    control.dispatchEvent(new Event("change", { bubbles: true }))
    expect(filter.value).toBe("CSS")
    expect(events).toHaveBeenCalledTimes(2)
    expect(helper.value).toEqual(["html", "css", "server", "legacy"])
  })
  it("updates after direct filter/select property assignment only when explicitly refreshed", async () => {
    const { helper, filter, control, option } = fixture("tools-root")
    filter.value = "CSS"
    await flush()
    expect(option("js").hidden).toBe(false)
    helper.refresh()
    expect(option("js").hidden).toBe(true)
    control.value = "js"
    helper.refresh()
    expect(option("js").hidden).toBe(false)
  })
  it("restores only owned visibility on filter changes/disposal and preserves author mutations", async () => {
    const { helper, option } = fixture("tools-root")
    helper.setFilter("CSS")
    option("js").hidden = true
    await flush()
    helper.setFilter("")
    expect(option("js").hidden).toBe(true)
    helper.disconnect()
    expect(option("js").hidden).toBe(true)
    expect(option("archive").hidden).toBe(true)
    expect(option("database").hidden).toBe(false)
  })
})

describe("clear, form reset, dynamic mode and disposal", () => {
  it("clear focuses the real select and emits input/change/clear once", async () => {
    const { helper, clear, control } = fixture()
    helper.setValue("rust")
    const events: string[] = []
    for (const type of ["input", "change", "mui:select-clear"]) control.addEventListener(type, () => events.push(type))
    clear.focus(); clear.click(); await flush()
    expect(helper.value).toBe("")
    expect(document.activeElement).toBe(control)
    expect(clear.hidden).toBe(true)
    expect(events).toEqual(["input", "change", "mui:select-clear"])
    expect(helper.clear()).toBe(false)
  })
  it("honors disabled, fieldset and advisory readonly-like clear guards", async () => {
    const { helper, control, clear } = fixture("tools-root")
    const fieldset = document.getElementById("tool-fieldset") as HTMLFieldSetElement
    fieldset.disabled = true; await flush()
    expect(helper.clear()).toBe(false)
    expect(clear.disabled).toBe(true)
    fieldset.disabled = false; control.setAttribute("aria-readonly", "true")
    expect(helper.clear()).toBe(false)
    control.removeAttribute("aria-readonly"); control.setAttribute("aria-disabled", "true")
    expect(helper.clear()).toBe(false)
    expect(control.disabled).toBe(false)
  })
  it("allows author cancellation of clear and never submits its form", async () => {
    const { helper, root, clear, form } = fixture()
    helper.setValue("go")
    const submit = vi.fn(); form.addEventListener("submit", submit)
    root.addEventListener("click", e => e.preventDefault(), { once: true })
    clear.click(); await flush()
    expect(helper.value).toBe("go")
    expect(submit).not.toHaveBeenCalled()
  })
  it("resets native option defaults and query after the native default action", async () => {
    const { helper, control, option, filter, form } = fixture("tools-root")
    helper.setValue(["css"]); helper.setFilter("CSS")
    option("html").defaultSelected = false; option("js").defaultSelected = true
    const change = vi.fn(); control.addEventListener("change", change)
    form.reset(); await flush()
    expect(helper.value).toEqual(["js", "server", "legacy"])
    expect(filter.value).toBe("")
    expect(option("database").hidden).toBe(false)
    expect(change).not.toHaveBeenCalled()
  })
  it("keeps cancelled resets and composing query state intact", async () => {
    const { helper, filter, option, form } = fixture("tools-root")
    helper.setValue(["css"])
    filter.dispatchEvent(new CompositionEvent("compositionstart"))
    filter.value = "CSS"
    form.addEventListener("reset", e => e.preventDefault(), { once: true })
    form.reset(); await flush()
    expect(helper.value).toEqual(["css"])
    expect(option("js").hidden).toBe(false)
    expect(() => helper.setFilter("replace")).toThrow("composing")
    filter.dispatchEvent(new CompositionEvent("compositionend"))
  })
  it("follows actual external form ownership and changed form IDs", async () => {
    const { helper, control, form } = fixture("external-root")
    helper.setValue("b"); form.reset(); await flush()
    expect(helper.value).toBe("b")
    const other = document.getElementById("other-form") as HTMLFormElement
    other.id = "renamed"; control.setAttribute("form", other.id)
    other.reset(); await flush()
    expect(helper.value).toBe("a")
  })
  it("accepts dynamic options and changed keys without replacing nodes", () => {
    const { helper, root, control, option } = fixture()
    const newOption = document.createElement("option"); newOption.value = "new"; newOption.textContent = "New"
    control.querySelector("optgroup")!.append(newOption)
    helper.refresh(); helper.setValue("new")
    expect(control.options[control.options.length - 1]).toBe(newOption)
    option("rust").value = "changed"; helper.refresh()
    expect(() => helper.setValue("rust")).toThrow()
    newOption.remove(); helper.refresh()
    expect(root.querySelectorAll("select")).toHaveLength(1)
    expect(helper.value).toBe(control.selectedIndex < 0 ? null : control.value)
  })
  it("reports invalid late keys and recovers after a valid refresh", async () => {
    const { root, helper, option } = fixture()
    const errors = vi.fn(); root.addEventListener("mui:select-error", errors)
    option("rust").value = "typescript"; await flush()
    expect(errors).toHaveBeenCalledTimes(1)
    expect(() => helper.refresh()).toThrow("unique")
    root.querySelector("optgroup")!.children[1]!.setAttribute("value", "rust"); helper.refresh()
    expect(helper.error).toBeNull()
  })
  it("requires disconnect/rebind after native multiple mode changes, restoring filters first", async () => {
    const { helper, root, control, option } = fixture("tools-root")
    helper.setFilter("CSS"); control.multiple = false
    expect(() => helper.refresh()).toThrow("mode changed")
    expect(helper.connected).toBe(false)
    expect(option("js").hidden).toBe(false)
    helpers.push(createSelect(root))
    await flush()
  })
  it("supports empty selects without invented options", () => {
    const { helper, control } = fixture()
    control.replaceChildren(); helper.refresh()
    expect(helper.value).toBeNull()
    helper.setValue(null)
    expect(() => helper.setValue("missing")).toThrow()
    expect(control.options).toHaveLength(0)
  })
  it("disconnect restores enhancement visibility and keeps edited values", () => {
    const { helper, root, control, filter, option } = fixture("tools-root")
    helper.setValue(["css"]); helper.setFilter("CSS")
    filter.focus(); helper.disconnect()
    expect(document.activeElement).toBe(control)
    expect(root.querySelector<HTMLElement>("[data-select-search]")!.hidden).toBe(true)
    expect(option("css").selected).toBe(true)
    expect(option("js").hidden).toBe(false)
    expect(() => helper.setValue([])).toThrow("disconnected")
  })
  it("disconnects removed roots and leaves native selection state intact", async () => {
    const { helper, root, control } = fixture()
    helper.setValue("go"); root.remove(); await flush()
    expect(helper.connected).toBe(false)
    expect(control.value).toBe("go")
  })
})
