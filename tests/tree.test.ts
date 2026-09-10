import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { createTree, readTreeHierarchy } from "../src/components/tree/index.js"
import type { TreeController, TreeLoadResult, TreeOptions } from "../src/components/tree/index.js"
import { createCheckboxGroup } from "../src/components/checkbox/index.js"

const helpers: TreeController[] = []
const treeCss = readFileSync(resolve("src", "components", "tree", "tree.css"), "utf8")
const wait = () => new Promise(resolve => setTimeout(resolve, 20))
function markup(key: string, children = "", extra = "", lazy = false) {
  return `<li data-tree-key="${key}" ${extra}><div data-tree-row><button type="button" data-tree-label data-tree-select>${key}</button><label><input type="checkbox" data-tree-check name="checked" value="${key}">Include ${key}</label><a href="#destination">Help ${key}</a></div>${children || lazy ? `<details data-tree-branch ${lazy ? "data-tree-lazy" : ""}><summary>Contents ${key}</summary><ul data-tree-list>${children}</ul></details>` : ""}</li>`
}
function node(key: string) { const template = document.createElement("template"); template.innerHTML = markup(key); return document.importNode(template.content.firstElementChild!, true) as HTMLLIElement }
function fixture(options: TreeOptions = {}, html = markup("a", markup("b") + markup("c")) + markup("d")) {
  const form = document.createElement("form"); form.innerHTML = `<section class="mui-tree" data-tree aria-label="Files"><ul data-tree-list>${html}</ul></section><button type="button" id="outside">Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-tree]")!, helper = createTree(root, options); helpers.push(helper)
  const references = new Map(helper.nodes.map(node => [node.key, node]))
  const get = (key: string) => {
    for (const node of helper.nodes) references.set(node.key, node)
    return references.get(key)!
  }
  return { form, root, helper, get }
}
const press = (element: HTMLElement, key: string, extra: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra }); element.dispatchEvent(event); return event
}
afterEach(() => { helpers.splice(0).forEach(helper => { try { helper.disconnect() } catch { /* Error tests assert their own failure. */ } }); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("native Tree visual defaults", () => {
  it("keeps reference row metrics within the unchanged CSS budget", () => {
    expect(gzipSync(treeCss, { level: 9 }).length).toBeLessThanOrEqual(1250)
    expect(treeCss).toContain("--mui-tree-label-height, 24px")
    expect(treeCss).toContain("--mui-tree-row-padding, 3px")
    expect(treeCss).toContain("--mui-tree-indent, 24px")
    expect(treeCss).toContain("--mui-tree-line-height, 1.5")
    expect(treeCss).toContain("--_mui-tree-pressed: rgba(255,255,255,.05)")
    expect(treeCss).not.toContain("font-weight: bold")
    expect(treeCss).toContain(".mui-tree :focus-visible")
  })
  it("styles disabled labels/checks without multiplying container opacity or crossing node barriers", () => {
    expect(treeCss).toContain(":is([data-tree-label],summary):is(:disabled,[aria-disabled=true],[inert],[inert] *)")
    expect(treeCss).toContain("[data-tree-check]:is(:disabled,[aria-disabled=true],[inert],[inert] *)")
    expect(treeCss.match(/opacity:/g)).toHaveLength(2)
    const forced = treeCss.slice(treeCss.indexOf("@media (forced-colors: active)"))
    expect(forced).toContain("[data-tree-check] { accent-color: auto; }")
    expect(forced).toContain("[data-tree-check]:is(:disabled,[aria-disabled=true],[inert],[inert] *) { opacity: 1; }")
    expect(forced).toContain(":is([data-tree-label],summary):is(:disabled,[aria-disabled=true],[inert],[inert] *) { color: GrayText; }")
    expect(treeCss).not.toContain("[data-tree-disabled]")
    expect(treeCss).not.toContain(".mui-tree [aria-disabled=true] {")
  })
  it("retains native checkbox, disclosure and source-order presentation", () => {
    expect(treeCss).toContain("inline-size: 16px")
    expect(treeCss).toContain("accent-color:")
    expect(treeCss).not.toContain("appearance:")
    expect(treeCss).not.toMatch(/(?:^|[;{])\s*order:/m)
    expect(treeCss).not.toContain("::marker")
    expect(treeCss).toContain("[data-tree-branch][aria-busy=true] > summary::after")
  })
})

describe("native hierarchy, keys and defaults", () => {
  it("indexes authored nodes iteratively without rebuilding controls/listeners", () => {
    const { helper, get } = fixture(), input = get("b").checkbox!, listener = vi.fn()
    input.addEventListener("change", listener); helper.refresh(); input.click()
    expect(get("b").checkbox).toBe(input); expect(listener).toHaveBeenCalledOnce()
    expect(helper.nodes.map(node => node.key)).toEqual(["a", "b", "c", "d"])
    expect(get("b").parent!.element).toBe(get("a").element)
  })
  it("retains native labels, literal names, links and button semantics", () => {
    const { get, root } = fixture()
    expect(get("a").checkbox!.labels![0]!.textContent).toContain("Include a")
    expect(get("a").checkbox!.name).toBe("checked"); expect(get("a").label.getAttribute("role")).toBeNull()
    expect(root.querySelector("[role=tree]")).toBeNull()
    const link = get("d").element.querySelector("a")!
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }); link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
  it("rejects duplicate keys before altering native markup", () => {
    const { root, helper } = fixture(); helper.disconnect()
    root.querySelector('[data-tree-key="c"]')!.setAttribute("data-tree-key", "b")
    const html = root.innerHTML
    expect(() => createTree(root)).toThrow("unique"); expect(root.innerHTML).toBe(html)
  })
  it("rejects numeric API keys and unknown keys without mutation", () => {
    const { helper, root } = fixture(), html = root.innerHTML
    expect(() => helper.setSelectedKeys([1] as never)).toThrow("strings")
    expect(() => helper.setCheckedKeys(["missing"])).toThrow()
    expect(() => helper.setExpandedKeys(["d"])).toThrow()
    expect(root.innerHTML).toBe(html); expect(helper.connected).toBe(true)
  })
  it("validates all initial keys before deriving checked state", () => {
    const { root, helper, get } = fixture(); helper.disconnect(); get("b").checkbox!.checked = true
    const before = get("a").checkbox!.checked
    expect(() => createTree(root, { cascade: true, selectedKeys: ["missing"] })).toThrow()
    expect(get("a").checkbox!.checked).toBe(before)
  })
  it("uses initial/default expanded keys and expand-all only for known branches", () => {
    const { helper, get } = fixture({ defaultExpandAll: true }, markup("a", markup("b")) + markup("lazy", "", "", true))
    expect(get("a").branch!.open).toBe(true); expect(get("lazy").branch!.open).toBe(false)
    expect(helper.loadingKeys).toEqual([])
    helper.setExpandedKeys(["lazy"]); expect(helper.expandedKeys).toEqual(["lazy"]); expect(helper.loadingKeys).toEqual([])
  })
  it("keeps default/current check keys distinct through native reset", async () => {
    const { helper, form } = fixture({ defaultCheckedKeys: ["b"], checkedKeys: ["c"] })
    expect(helper.getCheckedData().keys).toEqual(["c"]); form.reset(); await wait()
    expect(helper.getCheckedData().keys).toEqual(["b"])
  })
  it("native reset cancellation preserves current checks and independent selection", async () => {
    const { helper, form } = fixture({ defaultCheckedKeys: ["b"], selectedKeys: ["d"] })
    helper.setCheckedKeys(["c"]); form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await wait(); expect(helper.getCheckedData().keys).toEqual(["c"]); expect(helper.selectedKeys).toEqual(["d"])
  })
  it("enforces node/depth caps without recursive stack overflow", () => {
    const { root, helper } = fixture(); helper.disconnect()
    const list = root.querySelector("[data-tree-list]")!; list.innerHTML = Array.from({ length: 2001 }, (_, i) => markup(String(i))).join("")
    expect(() => readTreeHierarchy(root)).toThrow("2000")
    let html = markup("leaf"); for (let i = 0; i < 64; i++) html = markup(String(i), html)
    list.innerHTML = html; expect(() => readTreeHierarchy(root)).toThrow("64")
  })
  it("supports static groups and native link labels without fake selection", () => {
    const html = markup("group", markup("leaf"), "data-tree-group").replace('<button type="button" data-tree-label data-tree-select>group</button>', '<span data-tree-label>Group</span>')
    const { helper, get } = fixture({}, html)
    expect(get("group").target).toBe(get("group").summary)
    expect(() => helper.setSelectedKeys(["group"])).toThrow()
  })
})

describe("selection, cascade, mixed and disabled boundaries", () => {
  it("emits one user selection and no setter/refresh notifications", async () => {
    const { helper, root, get } = fixture(), event = vi.fn(); root.addEventListener("mui:tree-select", event)
    helper.setSelectedKeys(["a"]); helper.refresh(); expect(event).not.toHaveBeenCalled()
    get("d").label.click(); await wait(); expect(helper.selectedKeys).toEqual(["d"]); expect(event).toHaveBeenCalledOnce()
    get("d").label.click(); await wait(); expect(helper.selectedKeys).toEqual([])
  })
  it("respects cancelled selection clicks and preserves native checkbox cancellation", async () => {
    const { root, helper, get } = fixture({ cascade: true })
    root.parentElement!.addEventListener("click", event => event.preventDefault(), { once: true })
    get("d").label.click(); await wait(); expect(helper.selectedKeys).toEqual([])
    get("b").checkbox!.indeterminate = true
    root.addEventListener("click", event => event.preventDefault(), { once: true })
    get("b").checkbox!.click(); expect(get("b").checkbox!.checked).toBe(false); expect(get("b").checkbox!.indeterminate).toBe(true)
  })
  it("separates multiple selection from native checks and honors cancelable=false", async () => {
    const { helper, get } = fixture({ multiple: true, cancelable: false })
    get("b").label.click(); get("d").label.click(); await wait()
    expect(helper.selectedKeys).toEqual(["b", "d"]); expect(helper.getCheckedData().keys).toEqual([])
    get("b").label.click(); await wait(); expect(helper.selectedKeys).toEqual(["b", "d"])
  })
  it("cascades real checkedness and derives a real mixed parent with one notification", () => {
    const { helper, get, root, form } = fixture({ cascade: true }), change = vi.fn()
    root.addEventListener("mui:tree-check", change)
    get("a").checkbox!.click()
    expect(helper.getCheckedData().keys).toEqual(["a", "b", "c"]); expect(change).toHaveBeenCalledOnce()
    expect(new FormData(form).getAll("checked")).toEqual(["a", "b", "c"])
    get("b").checkbox!.click()
    expect(get("a").checkbox!.checked).toBe(false); expect(get("a").checkbox!.indeterminate).toBe(true)
    expect(helper.getIndeterminateData().keys).toEqual(["a"])
  })
  it("reports all/parent/child without changing the native fields", () => {
    const { helper } = fixture({ cascade: true }); helper.setCheckedKeys(["a"])
    expect(helper.getCheckedData("all").keys).toEqual(["a", "b", "c"])
    expect(helper.getCheckedData("parent").keys).toEqual(["a"])
    expect(helper.getCheckedData("child").keys).toEqual(["b", "c"])
    expect(helper.getCheckedData().keys).toEqual(["a", "b", "c"])
  })
  it("does not cross disabled checkbox barriers but enabled descendants stay independent", () => {
    const html = markup("a", markup("b", markup("c")).replace('value="b"', 'value="b" disabled') + markup("d"))
    const { helper, get } = fixture({ cascade: true }, html)
    helper.setCheckedKeys(["a"]); expect(get("d").checkbox!.checked).toBe(true)
    expect(get("b").checkbox!.checked).toBe(false); expect(get("c").checkbox!.checked).toBe(false)
    get("c").checkbox!.click(); expect(get("c").checkbox!.checked).toBe(true)
    expect(() => helper.setCheckedKeys(["b"])).toThrow()
  })
  it("preserves disabled defaults on replacement and native FormData omits them", () => {
    const { helper, get, form } = fixture({}, markup("a").replace('value="a"', 'value="a" checked disabled') + markup("b"))
    helper.setCheckedKeys(["b"]); expect(get("a").checkbox!.checked).toBe(true)
    expect(new FormData(form).getAll("checked")).toEqual(["b"])
  })
  it("permits explicit programmatic selected/open state on disabled nodes without enabling user actions", async () => {
    const { helper, get } = fixture({}, markup("a", markup("b"), "data-tree-disabled") + markup("d"))
    helper.setSelectedKeys(["a"]); helper.setExpandedKeys(["a"])
    expect(helper.selectedKeys).toEqual(["a"]); expect(get("a").branch!.open).toBe(true)
    get("a").label.click(); get("a").summary!.click(); await wait()
    expect(helper.selectedKeys).toEqual(["a"]); expect(get("a").branch!.open).toBe(true)
    expect(() => helper.expand("a")).toThrow()
  })
  it("blocks cascade promises over unknown lazy subtrees without fake complete keys", () => {
    const { helper, get } = fixture({ cascade: true }, markup("a", markup("b") + markup("lazy", "", "", true)))
    expect(get("a").checkbox!.getAttribute("aria-disabled")).toBe("true")
    expect(() => helper.setCheckedKeys(["a"])).toThrow()
    get("a").checkbox!.click(); expect(get("a").checkbox!.checked).toBe(false)
    get("b").checkbox!.click(); expect(get("a").checkbox!.indeterminate).toBe(true)
  })
  it("honors fieldset disabling including its first legend exception", () => {
    const { root, helper, get } = fixture({ cascade: true })
    const fieldset = document.createElement("fieldset"); fieldset.disabled = true
    const legend = document.createElement("legend"); legend.textContent = "Legend"
    root.parentElement!.append(fieldset); fieldset.append(legend); legend.append(root)
    helper.refresh(); helper.setCheckedKeys(["b"]); expect(get("b").checkbox!.checked).toBe(true)
    fieldset.append(root); helper.refresh(); expect(() => helper.setCheckedKeys(["b"])).toThrow()
  })
})

describe("native outline keyboard and focus", () => {
  it("navigates visible nodes with arrows/Home/End while native Tab/Enter/Space remain untouched", () => {
    const { helper, get } = fixture()
    get("a").label.focus(); press(get("a").label, "ArrowRight")
    expect(helper.expandedKeys).toEqual(["a"])
    press(get("a").label, "ArrowRight"); expect(document.activeElement).toBe(get("b").label)
    press(get("b").label, "ArrowDown"); expect(document.activeElement).toBe(get("c").label)
    press(get("c").label, "ArrowLeft"); expect(document.activeElement).toBe(get("a").label)
    press(get("a").label, "End"); expect(document.activeElement).toBe(get("d").label)
    press(get("d").label, "Home"); expect(document.activeElement).toBe(get("a").label)
    for (const key of ["Tab", "Enter", " "]) expect(press(get("a").label, key).defaultPrevented).toBe(false)
  })
  it("skips disabled/hidden targets, refreshes label typeahead, and ignores controls/modifiers", () => {
    const { helper, get } = fixture({ defaultExpandAll: true })
    get("b").element.hidden = true; get("c").label.setAttribute("disabled", ""); get("d").label.textContent = "Zebra"
    get("a").label.focus(); press(get("a").label, "z"); expect(document.activeElement).toBe(get("d").label)
    expect(press(get("d").checkbox!, "ArrowUp").defaultPrevented).toBe(false)
    expect(press(get("d").label, "ArrowUp", { ctrlKey: true }).defaultPrevented).toBe(false)
    helper.refresh()
  })
  it("moves focus safely when a branch closes or a focused node disappears", () => {
    const { helper, get } = fixture({ defaultExpandAll: true })
    get("b").label.focus(); helper.setExpandedKeys([]); expect(document.activeElement).toBe(get("a").label)
    helper.setExpandedKeys(["a"]); get("b").label.focus(); get("b").element.remove(); helper.refresh()
    expect(document.activeElement).toBe(get("a").label)
  })
  it("does not steal unrelated focus after removal and keeps reorder identity", () => {
    const { helper, get, form } = fixture({ defaultExpandAll: true }), first = get("b").label
    first.focus(); form.querySelector<HTMLButtonElement>("#outside")!.focus()
    get("b").element.remove(); helper.refresh(); expect(document.activeElement!.id).toBe("outside")
    const c = get("c").element; get("a").list!.prepend(c); helper.refresh(); expect(get("c").element).toBe(c)
  })
  it("does not toggle a branch when its separate selection or checkbox control is clicked", async () => {
    const { get } = fixture()
    get("a").label.click(); get("a").checkbox!.click(); await wait(); expect(get("a").branch!.open).toBe(false)
    get("a").summary!.click(); await wait(); expect(get("a").branch!.open).toBe(true)
  })
  it("notifies native expand once and leaves programmatic refresh/setters silent", async () => {
    const { helper, get, root } = fixture(), event = vi.fn(); root.addEventListener("mui:tree-expand", event)
    helper.setExpandedKeys(["a"]); await wait(); expect(event).not.toHaveBeenCalled()
    get("a").summary!.click(); await wait(); expect(event).toHaveBeenCalledOnce()
    get("a").branch!.open = true; helper.refresh(); await wait(); expect(event).toHaveBeenCalledOnce()
  })
})

describe("lazy DOM ownership and async races", () => {
  function pending() {
    let done!: (result: TreeLoadResult) => void
    let signal: AbortSignal | undefined
    const loader = vi.fn((_node, context) => { signal = context.signal; return new Promise<TreeLoadResult>(resolve => { done = resolve }) })
    return { loader, finish: (result: TreeLoadResult) => done(result), get signal() { return signal! } }
  }
  it("validates and appends safe native children once and clears loading state", async () => {
    const load = pending(), { helper, get } = fixture({ load: load.loader, cascade: true }, markup("lazy", "", "", true))
    const first = helper.expand("lazy"), second = helper.expand("lazy")
    expect(load.loader).toHaveBeenCalledOnce(); expect(helper.loadingKeys).toEqual(["lazy"])
    load.finish({ nodes: [node("child")] }); expect(await first).toBe(true); expect(await second).toBe(true)
    expect(get("child").parent!.key).toBe("lazy"); expect(get("lazy").branch!.hasAttribute("data-tree-lazy")).toBe(false)
    expect(helper.loadingKeys).toEqual([]); helper.setCheckedKeys(["lazy"]); expect(helper.getCheckedData().keys).toEqual(["lazy", "child"])
  })
  it("aborts collapse immediately and never inserts or re-expands a late result", async () => {
    const load = pending(), dispose = vi.fn(), { helper, get } = fixture({ load: load.loader }, markup("lazy", "", "", true))
    const promise = helper.expand("lazy"); helper.setExpandedKeys([])
    expect(load.signal.aborted).toBe(true); expect(await promise).toBe(false)
    load.finish({ nodes: [node("late")], dispose }); await wait()
    expect(get("lazy").list!.children).toHaveLength(0); expect(get("lazy").branch!.open).toBe(false); expect(dispose).toHaveBeenCalledOnce()
  })
  it("guards reused keys and refresh generations by actual node identity", async () => {
    const load = pending(), dispose = vi.fn(), { helper, get } = fixture({ load: load.loader }, markup("lazy", "", "", true))
    const promise = helper.expand("lazy"), replacement = node("replacement")
    replacement.setAttribute("data-tree-key", "lazy"); get("lazy").element.replaceWith(replacement); helper.refresh()
    expect(await promise).toBe(false); expect(load.signal.aborted).toBe(true)
    load.finish({ nodes: [node("stale")], dispose }); await wait()
    expect(helper.nodes.map(node => node.key)).toEqual(["lazy"]); expect(dispose).toHaveBeenCalledOnce()
  })
  it("rejects duplicate-key results atomically without disconnecting the healthy outline", async () => {
    const dispose = vi.fn(), { helper, get, root } = fixture({ load: () => ({ nodes: [node("d")], dispose }) }, markup("lazy", "", "", true) + markup("d"))
    const error = vi.fn(); root.addEventListener("mui:tree-error", error)
    await expect(helper.expand("lazy")).rejects.toThrow("unique")
    expect(get("lazy").list!.children).toHaveLength(0); expect(helper.connected).toBe(true); expect(dispose).toHaveBeenCalledOnce(); expect(error).toHaveBeenCalledOnce()
  })
  it("rejects connected/fragment-owned nodes and unsafe content without stealing it", async () => {
    const foreign = node("foreign"); document.body.append(foreign)
    const { helper } = fixture({ load: () => ({ nodes: [foreign] }) }, markup("lazy", "", "", true))
    await expect(helper.expand("lazy")).rejects.toThrow("fresh"); expect(foreign.parentElement).toBe(document.body)
    const unsafe = node("unsafe"); unsafe.append(document.createElement("script"))
    const f = fixture({ load: () => ({ nodes: [unsafe] }) }, markup("lazy", "", "", true))
    await expect(f.helper.expand("lazy")).rejects.toThrow("safe")
  })
  it("handles empty success, loader rejection, missing loader and retry without phantom children", async () => {
    let fail = true
    const { helper, get } = fixture({ load: async () => { if (fail) throw Error("failed"); return { nodes: [] } } }, markup("lazy", "", "", true))
    await expect(helper.expand("lazy")).rejects.toThrow("failed"); expect(helper.loadingKeys).toEqual([])
    fail = false; await expect(helper.expand("lazy")).resolves.toBe(true); expect(get("lazy").list!.children).toHaveLength(0)
    const plain = fixture({}, markup("lazy", "", "", true))
    await expect(plain.helper.expand("lazy")).rejects.toThrow("No Tree loader")
  })
  it("aborts pending work on disconnect and disposes eventual results", async () => {
    const load = pending(), dispose = vi.fn(), { helper } = fixture({ load: load.loader }, markup("lazy", "", "", true))
    const promise = helper.expand("lazy"); helper.disconnect(); expect(await promise).toBe(false); expect(load.signal.aborted).toBe(true)
    load.finish({ nodes: [node("late")], dispose }); await wait(); expect(dispose).toHaveBeenCalledOnce()
  })
  it("snapshots accepted loader arrays/disposal so later mutation cannot remove foreign nodes", async () => {
    const foreign = node("foreign"); document.body.append(foreign)
    const result = { nodes: [node("child")], dispose: vi.fn() }, cleanup = result.dispose
    const { helper, get } = fixture({ load: () => result }, markup("lazy", "", "", true))
    await helper.expand("lazy"); result.nodes.splice(0, 1, foreign); result.dispose = vi.fn()
    helper.disconnect(); expect(foreign.isConnected).toBe(true)
    expect(get("lazy").list!.children).toHaveLength(0); expect(cleanup).toHaveBeenCalledOnce(); expect(result.dispose).not.toHaveBeenCalled()
  })
  it("supports eight independent pending branches and rejects excess work", async () => {
    const { helper } = fixture({ load: () => new Promise(() => {}) }, Array.from({ length: 9 }, (_, i) => markup(String(i), "", "", true)).join(""))
    const pending = Array.from({ length: 8 }, (_, i) => helper.expand(String(i)))
    await expect(helper.expand("8")).rejects.toThrow("eight"); expect(helper.loadingKeys).toHaveLength(8)
    helper.disconnect(); expect(await Promise.all(pending)).toEqual(Array(8).fill(false))
  })
  it("does not reclaim ownership or mutate after an abort listener disconnects the owner", async () => {
    let helper!: TreeController
    const f = fixture({ load: (_, { signal }) => {
      signal.addEventListener("abort", () => helper.disconnect(), { once: true })
      return new Promise(() => {})
    } }, markup("lazy", "", "", true)); helper = f.helper
    const pending = helper.expand("lazy")
    expect(() => helper.refresh()).toThrow("disconnected")
    expect(await pending).toBe(false); expect(helper.connected).toBe(false)
    const rebound = createTree(f.root); rebound.disconnect()
    expect(f.root.hasAttribute("tabindex")).toBe(false)
  })
  it("rejects reentrant loader mutation and disposes returned rows after a loader disconnect", async () => {
    let helper: TreeController, dispose = vi.fn()
    const f = fixture({ load: () => { helper.setSelectedKeys([]); return { nodes: [] } } }, markup("lazy", "", "", true)); helper = f.helper
    await expect(helper.expand("lazy")).rejects.toThrow("reenter")
    const g = fixture({ load: () => { g.helper.disconnect(); return { nodes: [node("late")], dispose } } }, markup("lazy", "", "", true))
    await expect(g.helper.expand("lazy")).resolves.toBe(false); await wait(); expect(dispose).toHaveBeenCalledOnce()
  })
})

describe("refresh, cleanup and independent ownership", () => {
  it("rejects competing Tree and native CheckboxGroup owners across module copies", async () => {
    const { helper, root, get } = fixture()
    vi.resetModules()
    await expect(import("../src/components/tree/index.js").then(api => api.createTree(root))).rejects.toThrow("owner")
    const fieldset = document.createElement("fieldset"); fieldset.className = "mui-checkbox-group"; fieldset.setAttribute("data-checkbox-group", "")
    fieldset.innerHTML = "<legend>Shared controls</legend>"; root.parentElement!.append(fieldset); fieldset.append(root)
    get("b").checkbox!.setAttribute("data-checkbox", "")
    expect(() => createCheckboxGroup(fieldset)).toThrow("owner")
    helper.disconnect()
  })
  it("keeps separate and nested roots independent", () => {
    const outer = fixture({ defaultExpandAll: true }), inner = fixture()
    outer.get("a").element.append(inner.root); outer.helper.refresh()
    inner.helper.setSelectedKeys(["b"]); expect(outer.helper.selectedKeys).toEqual([])
    outer.helper.setCheckedKeys(["d"]); expect(inner.helper.getCheckedData().keys).toEqual([])
  })
  it("fails closed on invalid refreshed anatomy without deleting author nodes", () => {
    const { helper, get, root } = fixture()
    get("c").element.setAttribute("data-tree-key", "b")
    expect(() => helper.refresh()).toThrow(); expect(helper.connected).toBe(false)
    expect(root.querySelectorAll("[data-tree-key]")).toHaveLength(4)
  })
  it("detects removal of the scope marker or unsupported ARIA-tree roles", async () => {
    const { root, helper } = fixture()
    root.setAttribute("role", "tree"); await wait()
    expect(helper.connected).toBe(false)
    root.removeAttribute("role")
    const next = createTree(root); root.removeAttribute("data-tree"); await wait()
    expect(next.connected).toBe(false)
  })
  it("restores helper attributes/mixed state while preserving edited native checkedness/defaults", () => {
    const { helper, get, root } = fixture({ cascade: true }), b = get("b").checkbox!, a = get("a").checkbox!
    helper.setCheckedKeys(["b"]); helper.setSelectedKeys(["d"]); expect(a.indeterminate).toBe(true)
    helper.disconnect(); expect(b.checked).toBe(true); expect(a.indeterminate).toBe(false)
    expect(get("d").label.hasAttribute("aria-pressed")).toBe(false); expect(root.hasAttribute("tabindex")).toBe(false)
  })
  it("cleans loaded nodes and resources once; all cleanups run even if one throws", async () => {
    const cleanup = vi.fn(() => { throw new Error("dispose failed") })
    const { helper, get } = fixture({ load: parent => ({ nodes: [node(parent.key + "-child")], dispose: cleanup }) }, markup("x", "", "", true) + markup("y", "", "", true))
    await helper.expand("x"); await helper.expand("y")
    expect(() => helper.disconnect()).toThrow("cleanup")
    expect(cleanup).toHaveBeenCalledTimes(2); expect(get("x").list!.children).toHaveLength(0); expect(get("y").list!.children).toHaveLength(0)
    expect(() => helper.disconnect()).not.toThrow()
  })
  it("focuses a surviving native parent before removing loaded rows and the leased root tabindex", async () => {
    const { helper, root, get } = fixture({ load: () => ({ nodes: [node("child")] }) }, markup("lazy", "", "", true))
    await helper.expand("lazy")
    const parent = get("lazy").label; get("child").label.focus(); helper.disconnect()
    expect(document.activeElement).toBe(parent); expect(root.hasAttribute("tabindex")).toBe(false)
    expect(helper.nodes).toHaveLength(0); expect(helper.getCheckedData().keys).toEqual([])
  })
  it("detects removed roots and cancels pending work automatically", async () => {
    let signal!: AbortSignal
    const { helper, root } = fixture({ load: (_, context) => { signal = context.signal; return new Promise(() => {}) } }, markup("lazy", "", "", true))
    const pending = helper.expand("lazy"); root.remove(); await wait()
    expect(signal.aborted).toBe(true); expect(await pending).toBe(false); expect(helper.connected).toBe(false)
  })
})
