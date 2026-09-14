import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createSelect } from "../src/components/native-select.js"
import type { SelectController } from "../src/components/native-select.js"
import { Select, registerSelect } from "../src/components/select/index.js"
import { ViewElement } from "../src/core/index.js"
import { bind, createStore } from "../src/state/index.js"

const helpers: SelectController[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "language-root") {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "select.html"), "utf8"), "text/html")
  // Exercise the same internal mechanics still used by unmigrated native compositions.
  for (const element of parsed.querySelectorAll("m-select")) {
    const root = parsed.createElement("div")
    for (const attribute of element.attributes) root.setAttribute(attribute.name, attribute.value)
    root.classList.add("m-select"); root.setAttribute("data-select", "")
    root.append(...element.childNodes); element.replaceWith(root)
  }
  for (const control of parsed.querySelectorAll("select")) control.setAttribute("data-select-control", "")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const root = document.getElementById(id)!, helper = createSelect(root)
  helpers.push(helper)
  return { root, helper, control: helper.control, filter: helper.filter!,
    clear: root.querySelector<HTMLButtonElement>("[data-select-clear]")!,
    form: document.getElementById("selection-form") as HTMLFormElement,
    option: (value: string) => [...helper.control.options].find(option => option.value === value)! }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

function canonical(content = '<option value="a" selected>A</option><option value="b">B</option>', attributes = "") {
  document.body.innerHTML = `<form id="native-form"><m-select aria-label="Choice" ${attributes}><select name="choice">${content}</select><button type="button" data-select-clear hidden>Clear</button></m-select></form>`
  const element = document.querySelector("m-select") as Select
  element.refresh()
  return { element, control: element.native, form: document.querySelector("form")!, clear: element.querySelector("button")! }
}

describe("canonical Select direct API", () => {
  it("registers only the own-tag ViewElement and removes the public factory", async () => {
    expect(Object.hasOwn(Select, "tag")).toBe(true)
    expect(customElements.get("m-select")).toBe(Select)
    expect(Select.prototype).toBeInstanceOf(ViewElement)
    registerSelect()
    const index = readFileSync(join("src", "components", "select", "index.ts"), "utf8")
    expect(index).not.toContain("createSelect")
    expect(index).not.toContain("SelectController")
    expect(Select.observedAttributes).toContain("list-size")
    expect(Select.observedAttributes).not.toContain("value")
  })
  it("preserves native owner, options, default flags, listeners and live collections", () => {
    const { element, control } = canonical()
    const options = element.options, selected = element.selectedOptions, a = options[0]!, callback = vi.fn()
    a.addEventListener("test", callback)
    element.value = "b"; element.refresh()
    a.dispatchEvent(new Event("test"))
    expect(callback).toHaveBeenCalledOnce()
    expect(element.native).toBe(control)
    expect(element.options).toBe(options)
    expect(element.selectedOptions).toBe(selected)
    expect(a.defaultSelected).toBe(true)
    expect("defaultValue" in element).toBe(false)
    expect(element.hasAttribute("tabindex")).toBe(false)
  })
  it("distinguishes empty native state from nonempty native defaults without fabricated properties", () => {
    const element = new Select()
    element.setAttribute("aria-label", "Empty")
    expect(element.value).toBeNull()
    expect(element.selectedIndex).toBe(-1)
    expect(element.options).toHaveLength(0)
    expect(element.multiple).toBe(false)
    expect(element.required).toBe(false)
    expect(element.disabled).toBe(false)
    expect(element.listSize).toBe(0)
    expect(element.size).toBe("medium")
    expect(element.status).toBeNull()
    expect(element.borderless).toBe(false)
    expect(element.name).toBe("")
    expect(element.filter).toBeNull()
    expect(element.form).toBeNull()
    expect(() => { element.value = "missing" }).toThrow("existing")
    expect(element.hasAttribute("value")).toBe(false)
  })
  it("keeps visual size independent of native row size and validates setters atomically", () => {
    const { element, control } = canonical()
    element.size = "large"; element.listSize = 5
    expect(control.size).toBe(5)
    expect(element.getAttribute("size")).toBe("large")
    element.setAttribute("list-size", "3")
    expect(element.listSize).toBe(3)
    expect(() => { element.listSize = -1 }).toThrow()
    expect(() => { element.size = "5" as never }).toThrow()
    expect(() => { element.status = "invalid" as never }).toThrow()
    expect(() => { element.disabled = "false" as never }).toThrow()
    expect(() => { element.value = "unknown" }).toThrow()
    expect(element.value).toBe("a")
    expect(element.listSize).toBe(3)
  })
  it("replays pre-upgrade mode before value and retains disconnected writes", () => {
    const element = new Select()
    element.setAttribute("aria-label", "Pre-upgrade")
    element.innerHTML = '<option value="a" selected>A</option><option value="b">B</option>'
    Object.defineProperty(element, "value", { value: ["b"], configurable: true })
    Object.defineProperty(element, "multiple", { value: true, configurable: true })
    document.body.append(element); element.refresh()
    expect(element.value).toEqual(["b"])
    expect(Object.hasOwn(element, "value")).toBe(false)
    const control = element.native
    element.remove(); element.value = ["a"]; element.name = "changed"
    document.body.append(element); element.refresh()
    expect(element.native).toBe(control)
    expect(element.value).toEqual(["a"])
    expect(element.name).toBe("changed")
  })
  it("moves direct options/optgroups without cloning or swallowing nested ownership", () => {
    const outer = new Select(), inner = new Select()
    outer.setAttribute("aria-label", "Outer"); inner.setAttribute("aria-label", "Inner")
    const a = new Option("A", "a"), group = document.createElement("optgroup"), b = new Option("B", "b")
    group.label = "Group"; group.append(b); outer.append(a, group)
    inner.append(new Option("Inner", "inner")); outer.append(inner)
    document.body.append(outer); inner.refresh(); outer.refresh()
    expect(outer.options[0]).toBe(a)
    expect(outer.options[1]).toBe(b)
    expect(group.parentElement).toBe(outer.native)
    expect(inner.value).toBe("inner")
    expect(outer.value).toBe("a")
    expect(outer.native).not.toBe(inner.native)
  })
  it("adopts one late authored owner without an early read dirtying its default state", () => {
    const element = new Select()
    element.setAttribute("aria-label", "Late")
    const generated = element.native
    const authored = document.createElement("select")
    const a = new Option("A", "a", true), b = new Option("B", "b")
    authored.append(a, b); element.append(authored)
    document.body.append(element); element.refresh()
    expect(element.native).toBe(authored)
    expect(generated.isConnected).toBe(false)
    b.defaultSelected = true
    expect(element.value).toBe("b")
    expect(element.querySelectorAll("select")).toHaveLength(1)
  })
  it("preserves pending attributes and null writes across empty early materialization", () => {
    const element = new Select()
    element.setAttribute("aria-label", "Late")
    element.name = "pending"; element.required = true; element.value = null
    const authored = document.createElement("select")
    authored.append(new Option("A", "a", true)); element.append(authored)
    document.body.append(element); element.refresh()
    expect(element.native).toBe(authored)
    expect(element.value).toBeNull()
    expect(element.name).toBe("pending")
    expect(element.required).toBe(true)
    expect(element.options[0]!.defaultSelected).toBe(true)
  })
  it("retains generated-owner authored options and live pending writes during adoption", () => {
    const element = new Select(); element.setAttribute("aria-label", "Late")
    const a = new Option("A", "a", true), b = new Option("B", "b"), callback = vi.fn()
    b.addEventListener("test", callback)
    element.append(a, b); element.value = "b"; element.name = "pending"
    const old = element.native, next = document.createElement("select")
    next.append(new Option("C", "c")); element.append(next)
    document.body.append(element); element.refresh()
    expect(element.native).toBe(next)
    expect(element.options[0]).toBe(a)
    expect(element.options[1]).toBe(b)
    expect(element.value).toBe("b")
    expect(element.name).toBe("pending")
    expect(old.isConnected).toBe(false)
    b.dispatchEvent(new Event("test")); expect(callback).toHaveBeenCalledOnce()
  })
  it("rejects conflicting late owners without discarding the original option nodes", () => {
    const element = new Select(); element.setAttribute("aria-label", "Late")
    const a = new Option("A", "a"); element.append(a); element.value = "a"
    const original = element.native, replacement = document.createElement("select")
    const duplicate = new Option("Duplicate", "a"); replacement.append(duplicate); element.append(replacement)
    expect(() => element.native).toThrow("unique")
    expect(a.parentElement).toBe(original)
    expect(original.value).toBe("a")
    duplicate.value = "b"
    expect(element.native).toBe(replacement)
    expect(element.options[0]).toBe(a)
    expect(element.value).toBe("a")
  })
  it("does not repeat host attribute forwarding over live native changes", () => {
    const { element, control } = canonical(undefined, 'name="host" required')
    control.name = "native"; control.required = false
    element.refresh(); element.remove(); document.body.append(element); element.refresh()
    expect(element.name).toBe("native"); expect(element.required).toBe(false)
    element.setAttribute("name", "updated")
    expect(control.name).toBe("updated")
  })
  it("keeps native form association, silent defaults/reset and invalid targets", async () => {
    const { element, control, form } = canonical('<option value="" selected data-select-placeholder>Choose</option><option value="b">B</option>', "required")
    const events: string[] = []
    element.addEventListener("input", () => events.push("input")); element.addEventListener("change", () => events.push("change"))
    const invalid = vi.fn(); control.addEventListener("invalid", invalid)
    expect(element.checkValidity()).toBe(false); expect(invalid).toHaveBeenCalledOnce()
    expect(new FormData(form).getAll("choice")).toEqual([""])
    element.value = null
    expect(new FormData(form).has("choice")).toBe(false)
    element.value = "b"; form.reset(); await flush()
    expect(element.value).toBe("")
    expect(events).toEqual([])
    element.setCustomValidity("Custom"); expect(element.validationMessage).toBe("Custom")
    element.setCustomValidity(""); expect(element.validity.customError).toBe(false)
    const external = document.createElement("form"); external.id = "other"; document.body.append(external)
    element.setAttribute("form", "other")
    expect(element.form).toBe(external)
    expect(new FormData(form).has("choice")).toBe(false)
  })
  it("marks equal writes dirty like native setters and never rewrites defaultSelected", () => {
    const { element, control, form } = canonical()
    const plain = document.createElement("select"); plain.innerHTML = control.innerHTML
    element.value = "a"; plain.value = "a"
    element.options[0]!.defaultSelected = false; plain.options[0]!.defaultSelected = false
    expect(element.value).toBe(plain.selectedIndex < 0 ? null : plain.value)
    element.multiple = true; plain.multiple = true
    element.value = []; for (const option of plain.options) option.selected = false
    element.options[0]!.defaultSelected = true; plain.options[0]!.defaultSelected = true
    expect(element.value).toEqual([...plain.options].filter(option => option.selected).map(option => option.value))
    form.reset()
    expect(element.value).toEqual(["a"])
  })
  it("handles native mode changes without changing option identity", async () => {
    const { element, control } = canonical()
    const a = element.options[0]
    element.multiple = true; element.value = ["b", "a"]
    expect(element.value).toEqual(["a", "b"])
    element.multiple = false
    expect(element.value).toBe(control.value)
    control.multiple = true; await flush()
    expect(element.error).toBeNull()
    expect(element.options[0]).toBe(a)
  })
  it("retains single placeholder validation, selectedIndex and native option methods", () => {
    const { element } = canonical()
    const c = new Option("C", "c"); c.id = "choice-c"
    const listener = vi.fn(); c.addEventListener("test", listener)
    element.add(c, 1)
    expect(element.item(1)).toBe(c)
    expect(element.namedItem("choice-c")).toBe(c)
    c.dispatchEvent(new Event("test")); expect(listener).toHaveBeenCalledOnce()
    element.selectedIndex = 2; expect(element.value).toBe("b")
    element.selectedIndex = 99; expect(element.value).toBeNull()
    expect(() => { element.selectedIndex = NaN }).toThrow()
    element.remove(1); expect(element.options).toHaveLength(2)
    element.remove(); expect(element.isConnected).toBe(false)
  })
  it("follows late option reorder/removal without resurrecting a missing key", async () => {
    const { element, control } = canonical()
    const b = element.options[1]!
    element.value = "b"; control.prepend(b); await flush()
    expect(element.selectedIndex).toBe(control.selectedIndex)
    expect(element.options[0]).toBe(b)
    b.remove(); await flush()
    expect(element.value).toBe(control.selectedIndex < 0 ? null : control.value)
    expect(() => { element.value = "b" }).toThrow()
    expect(element.options).toHaveLength(1)
  })
  it("reports invalid late keys once and recovers, without discarding the original nodes", async () => {
    const { element } = canonical()
    const b = element.options[1]!, errors = vi.fn()
    element.addEventListener("m:select-error", errors)
    b.value = "a"; await flush()
    expect(errors).toHaveBeenCalledOnce()
    expect(element.error).toContain("unique")
    b.value = "b"; element.refresh()
    expect(element.error).toBeNull()
    expect(element.options[1]).toBe(b)
  })
  it("honors fieldset disabledness and its first-legend exception", async () => {
    document.body.innerHTML = '<fieldset disabled><legend>Scope<m-select aria-label="Legend"><option value="a">A</option><button type="button" data-select-clear>Clear</button></m-select></legend><m-select aria-label="Body"><option value="b">B</option><button type="button" data-select-clear>Clear</button></m-select></fieldset>'
    const [legend, body] = [...document.querySelectorAll<Select>("m-select")]
    legend!.refresh(); body!.refresh()
    expect(legend!.disabled).toBe(false); expect(body!.disabled).toBe(false)
    expect(legend!.native.matches(":disabled")).toBe(false); expect(body!.native.matches(":disabled")).toBe(true)
    expect(legend!.clear()).toBe(true); expect(body!.clear()).toBe(false)
    expect(body!.querySelector("button")!.disabled).toBe(true)
  })
  it("cancels queued clear across resets and reconnects without event duplication", async () => {
    const { element, form, clear, control } = canonical()
    const events: string[] = []
    for (const type of ["input", "change", "m:select-clear"]) control.addEventListener(type, () => events.push(type))
    element.value = "b"; clear.click(); form.reset(); await flush()
    expect(element.value).toBe("a"); expect(events).toEqual([])
    element.value = "b"; clear.click(); element.remove(); document.body.append(element); element.refresh(); await flush()
    expect(element.value).toBe("b"); expect(events).toEqual([])
    clear.click(); await flush()
    expect(events).toEqual(["input", "change", "m:select-clear"])
  })
  it("does not continue clear notifications after native input disconnects its owner", () => {
    const { element, control } = canonical()
    const events: string[] = []
    control.addEventListener("input", () => { events.push("input"); element.remove() })
    control.addEventListener("change", () => events.push("change"))
    expect(element.clear()).toBe(true)
    expect(events).toEqual(["input"])
  })
  it("does not continue clear notifications after an input listener resets the native form", () => {
    const { element, control, form } = canonical()
    element.value = "b"
    const change = vi.fn()
    control.addEventListener("input", () => form.reset())
    control.addEventListener("change", change)
    element.clear()
    expect(element.value).toBe("a")
    expect(change).not.toHaveBeenCalled()
  })
  it("reconciles late clear/filter helpers and cleans up their original attributes", async () => {
    const { element, control } = canonical(undefined, "multiple")
    const search = document.createElement("div"); search.setAttribute("data-select-search", ""); search.hidden = true
    search.innerHTML = '<input data-select-filter type="search" aria-label="Literal query">'
    element.append(search); await flush()
    element.setFilter("B")
    expect(search.hidden).toBe(false)
    expect(element.filter?.value).toBe("B")
    element.value = []; element.setFilter("B")
    expect(control.options[0]!.hidden).toBe(true)
    element.remove()
    expect(search.hidden).toBe(true)
    expect(control.options[0]!.hidden).toBe(false)
  })
  it("keeps composing filter drafts protected when helper anatomy changes", async () => {
    const { element } = canonical(undefined, "multiple")
    const search = document.createElement("div"); search.setAttribute("data-select-search", "")
    search.innerHTML = '<input data-select-filter type="search" aria-label="Literal query">'
    element.append(search); element.refresh()
    const filter = element.filter!
    filter.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    filter.value = "draft"
    element.querySelector("button")!.remove(); await flush()
    expect(() => element.setFilter("replace")).toThrow("composing")
    expect(filter.value).toBe("draft")
    filter.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    element.setFilter("A")
    expect(filter.value).toBe("A")
  })
  it("rejects native replacement during filter composition without losing the draft or option identity", () => {
    const element = new Select(); element.setAttribute("aria-label", "Filtered"); element.multiple = true
    const option = new Option("A", "a"); element.append(option)
    const search = document.createElement("div"); search.setAttribute("data-select-search", "")
    search.innerHTML = '<input data-select-filter type="search" aria-label="Literal query">'
    element.append(search); document.body.append(element); element.refresh()
    const filter = element.filter!, original = element.native
    filter.dispatchEvent(new CompositionEvent("compositionstart")); filter.value = "draft"
    const authored = document.createElement("select"); element.append(authored)
    expect(() => element.native).toThrow("composing")
    expect(option.parentElement).toBe(original)
    expect(filter.value).toBe("draft")
    filter.dispatchEvent(new CompositionEvent("compositionend")); element.refresh()
    expect(element.native).toBe(authored)
    expect(element.options[0]).toBe(option)
    expect(filter.value).toBe("draft")
  })
  it("bridges only the native selection owner, not nested/filter events, with typed values", () => {
    const { element, control } = canonical(undefined, 'multiple m-bind="choice"')
    const store = createStore({ choice: ["b"] }), updates = vi.fn()
    const dispose = bind(element, store); const unsubscribe = store.subscribe("choice", updates)
    expect(element.value).toEqual(["b"])
    control.options[0]!.selected = true
    control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(store.get("choice")).toEqual(["a", "b"])
    const input = document.createElement("input"); element.append(input)
    input.dispatchEvent(new Event("input", { bubbles: true }))
    expect(updates).toHaveBeenCalledOnce()
    store.set("choice", [])
    expect(element.value).toEqual([])
    dispose(); unsubscribe()
  })
  it("does not swallow invalid binding writes", () => {
    const { element } = canonical(undefined, 'm-bind="choice"')
    expect(() => bind(element, createStore({ choice: "missing" }))).toThrow("existing")
    expect(element.value).toBe("a")
  })
  it("rejects native roles, readonly, invalid hierarchy and legacy m-option", () => {
    const { element, control } = canonical()
    control.setAttribute("readonly", "")
    expect(() => element.refresh()).toThrow("readonly")
    control.removeAttribute("readonly"); element.setAttribute("role", "combobox")
    expect(() => element.refresh()).toThrow("role")
    element.removeAttribute("role")
    const group = document.createElement("optgroup"); group.label = ""
    control.append(group); expect(() => element.refresh()).toThrow("labels")
    group.remove(); element.append(document.createElement("m-option"))
    expect(() => element.refresh()).toThrow("m-option")
  })
  it("rejects options hidden inside non-native wrappers rather than silently ignoring them", () => {
    const element = new Select(), wrapper = document.createElement("span")
    element.setAttribute("aria-label", "Invalid hierarchy")
    wrapper.append(new Option("Lost", "lost")); element.append(wrapper)
    expect(() => element.value).toThrow("belong")
    expect(wrapper.firstElementChild?.localName).toBe("option")
  })
  it("loads the modern demo with canonical nodes and source-generated reference", () => {
    const html = readFileSync(join("demo", "components", "select.html"), "utf8")
    const parsed = new DOMParser().parseFromString(html, "text/html")
    expect(parsed.querySelector("main[data-demo-page].component-docs")).not.toBeNull()
    expect(parsed.querySelector("#select-api")).not.toBeNull()
    expect(parsed.querySelectorAll("[data-demo-example]")).toHaveLength(4)
    for (const section of parsed.querySelectorAll("[data-demo-example]")) {
      expect(section.querySelector("header[data-demo-header] h2[id]")).not.toBeNull()
      expect(section.querySelector("[data-demo-preview] m-select")).not.toBeNull()
    }
    expect(parsed.querySelectorAll("m-select[class]")).toHaveLength(0)
    expect(parsed.querySelector('a[href="../setup.html"]')).not.toBeNull()
  })
  it("accounts for shared native consumers, selected entries and unchanged payload ceilings", () => {
    const manifest = JSON.parse(readFileSync(join("dist", "manifest.json"), "utf8"))
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"))
    expect(packageJson.exports["./select"]).toEqual({ types: "./dist/components/select/index.d.ts", import: "./dist/markup-ui-select.js" })
    expect(packageJson.exports["./select/style.css"]).toBe("./dist/markup-ui-select.css")
    for (const [mode, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      const select = manifest.componentPayloads.select[mode!]
      expect(select.dependencies).toEqual([`markup-ui-core${suffix}`, `markup-ui-native-select${suffix}`])
      expect(select.runtimeGzipBytes).toBe(select.gzipBytes + select.dependencies.reduce((total: number, file: string) => total + manifest.bundles[file].gzipBytes, 0))
      expect(select.runtimeGzipBytes).toBeLessThanOrEqual(8000)
      expect(manifest.bundles[select.file].budget).toBe(4000)
      expect(manifest.bundles[`markup-ui-native-select${suffix}`].budget).toBe(4000)
      for (const consumer of ["tree-select", "popselect"]) expect(manifest.componentPayloads[consumer][mode!].dependencies).toEqual([`markup-ui-core${suffix}`, `markup-ui-native-select${suffix}`])
    }
    expect(manifest.bundles["markup-ui-select.css"].budget).toBe(1000)
    const esm = readFileSync(join("dist", "markup-ui-select.js"), "utf8")
    expect(esm).toContain('"./markup-ui-core.js"')
    expect(esm).toContain('"./markup-ui-native-select.js"')
    expect(esm).not.toContain("extends HTMLElement")
    const native = readFileSync(join("dist", "markup-ui-native-select.js"), "utf8")
    expect(native).not.toContain("customElements")
    expect(native).not.toContain("ViewElement")
  })
})

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
    const before = customElements.get("m-select")
    const { control } = fixture()
    expect(customElements.get("m-select")).toBe(before)
    expect("defaultValue" in control).toBe(false)
  })
  it("rejects duplicate and cross-module owners and permits recreation", async () => {
    const { root, helper } = fixture()
    expect(() => createSelect(root)).toThrow("owner")
    vi.resetModules()
    const other = await import("../src/components/native-select.js")
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
    for (const type of ["input", "change", "m:select-clear"]) control.addEventListener(type, () => events.push(type))
    clear.focus(); clear.click(); await flush()
    expect(helper.value).toBe("")
    expect(document.activeElement).toBe(control)
    expect(clear.hidden).toBe(true)
    expect(events).toEqual(["input", "change", "m:select-clear"])
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
    const errors = vi.fn(); root.addEventListener("m:select-error", errors)
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
