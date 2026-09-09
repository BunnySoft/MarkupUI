import { afterEach, describe, expect, it, vi } from "vitest"
import { createCascader } from "../src/components/cascader/index.js"
import type { CascaderController, CascaderOptions } from "../src/components/cascader/index.js"
import type { TreeLoadResult } from "../src/components/tree/index.js"
import { createTree } from "../src/components/tree/index.js"
import { createSelect } from "../src/components/select/index.js"
import { createForm } from "../src/components/form/index.js"

const helpers: CascaderController[] = []
const wait = () => new Promise(resolve => setTimeout(resolve, 20))
function sourceNode(key: string, children = "", lazy = false, disabled = false) {
  return `<li data-tree-key="${key}" ${disabled ? "data-tree-disabled" : ""}><div data-tree-row><span data-tree-label>${key}</span></div>${children || lazy ? `<details data-tree-branch ${lazy ? "data-tree-lazy" : ""}><summary>${key} children</summary><ul data-tree-list>${children}</ul></details>` : ""}</li>`
}
const sourceHTML = () => sourceNode("eu", sourceNode("fr", sourceNode("paris") + sourceNode("lyon"))) + sourceNode("us", sourceNode("nyc"))
  + sourceNode("island") + sourceNode("lazy", "", true) + sourceNode("blocked", sourceNode("blocked-leaf"), false, true)
function fresh(key: string) {
  const template = document.createElement("template"); template.innerHTML = sourceNode(key)
  return document.importNode(template.content.firstElementChild!, true) as HTMLLIElement
}
function fixture(options: CascaderOptions = {}, config: { native?: boolean; required?: boolean; source?: string } = {}) {
  const form = document.createElement("form")
  const initial = [["eu", "us", "island", "lazy"], ["fr", "nyc"], ["paris", "lyon"]]
  form.innerHTML = `<section class="mui-cascader" data-cascader><section class="mui-tree" data-tree data-cascader-source aria-label="Places"><ul data-tree-list>${config.source ?? sourceHTML()}</ul></section><div data-cascader-columns>${initial.map((keys, i) => `<div class="mui-select" data-select data-cascader-column><label>Level ${i + 1}<select data-select-control data-cascader-control name="path[]" ${!i && config.required !== false ? "required" : ""}><option value="" ${config.native ? "" : "selected"}>Choose ${i + 1}</option>${config.native ? keys.map((key, index) => `<option value="${key}" ${!index ? "selected" : ""}>${key}</option>`).join("") : ""}</select></label></div>`).join("")}</div><p data-cascader-path></p><p data-cascader-status></p><button type="button" data-cascader-clear hidden>Clear path</button></section><button id="outside" type="button">Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-cascader]")!, source = root.querySelector<HTMLElement>("[data-cascader-source]")!
  const controls = [...root.querySelectorAll<HTMLSelectElement>("[data-cascader-control]")]
  const originals = controls.map(control => [...control.options])
  const helper = createCascader(root, options); helpers.push(helper)
  const node = (key: string) => [...source.querySelectorAll<HTMLLIElement>("[data-tree-key]")].find(node => node.dataset.treeKey === key)!
  const change = (level: number, value: string) => { controls[level]!.value = value; controls[level]!.dispatchEvent(new Event("change", { bubbles: true })) }
  return { form, root, source, controls, originals, helper, node, change, clear: root.querySelector<HTMLButtonElement>("[data-cascader-clear]")! }
}
afterEach(() => { helpers.splice(0).forEach(helper => { try { helper.disconnect() } catch { /* Failure tests assert cleanup. */ } }); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("native projection and path values", () => {
  it("adopts stable selects, labels, original options and listeners", () => {
    const { helper, controls, originals } = fixture({}, { native: true }), label = controls[2]!.labels![0], listener = vi.fn()
    controls[2]!.addEventListener("change", listener)
    helper.refresh()
    expect(controls[2]!.options[1]).toBe(originals[2]![1]); expect(controls[2]!.labels![0]).toBe(label)
    controls[2]!.dispatchEvent(new Event("change", { bubbles: true })); expect(listener).toHaveBeenCalledOnce()
    expect(helper.state.path).toEqual(["eu", "fr", "paris"]); expect(helper.state.value).toBe("paris")
  })
  it("does not automatically choose first children, and invalidates descendants on parent changes", () => {
    const { helper, controls, change } = fixture({ defaultValue: "paris" })
    change(0, "us")
    expect(helper.state).toMatchObject({ path: ["us"], value: null, complete: false })
    expect(controls[1]!.value).toBe(""); expect(controls[2]!.disabled).toBe(true)
    change(1, "nyc"); expect(helper.state.value).toBe("nyc")
    change(0, "island"); expect(helper.state.path).toEqual(["island"]); expect(helper.state.value).toBe("island")
  })
  it("retains an unchanged parent selection when an identical native change is dispatched", () => {
    const { helper, change } = fixture({ defaultValue: "paris" })
    change(0, "eu"); expect(helper.state.path).toEqual(["eu", "fr", "paris"])
  })
  it("keeps leaf/any policy and partial paths explicit", () => {
    const leaf = fixture()
    leaf.helper.setPath(["eu"]); expect(leaf.helper.state.value).toBeNull()
    expect(() => leaf.helper.setValue("eu")).toThrow("terminal")
    const any = fixture({ selection: "any" }); any.helper.setValue("eu")
    expect(any.helper.state).toMatchObject({ value: "eu", complete: true, path: ["eu"] })
  })
  it("uses strict string keys, known contiguous paths and no implicit numeric/object coercion", () => {
    const { helper, controls } = fixture({ defaultValue: "paris" }), before = controls.map(control => control.value)
    for (const value of [1, "", [], {}, undefined, "missing"]) expect(() => helper.setValue(value as never)).toThrow()
    for (const path of [["paris"], ["us", "paris"], ["eu", "eu"], ["eu", 1], ["blocked", "blocked-leaf"]]) expect(() => helper.setPath(path as never)).toThrow()
    expect(controls.map(control => control.value)).toEqual(before); expect(helper.state.valid).toBe(true)
  })
  it("blocks disabled ancestors and preserves authored disabled select state", () => {
    const { helper, controls } = fixture()
    expect(() => helper.setValue("blocked-leaf")).toThrow()
    controls[1]!.disabled = true; helper.refresh(); helper.setPath(["eu"])
    expect(controls[1]!.disabled).toBe(true)
    helper.setValue("paris"); expect(controls[1]!.disabled).toBe(true)
  })
  it("refreshes source labels and reuses projected options rather than stale text or replacement", () => {
    const { helper, controls, node, root } = fixture({ defaultValue: "paris" })
    const option = controls[2]!.selectedOptions[0]
    node("paris").querySelector("[data-tree-label]")!.textContent = "<Paris & updated>"
    helper.refresh()
    expect(controls[2]!.selectedOptions[0]).toBe(option); expect(option!.textContent).toBe("<Paris & updated>")
    expect(root.querySelector("[data-cascader-path]")!.textContent).toBe("eu / fr / <Paris & updated>")
    expect(controls[2]!.querySelector("Paris")).toBeNull()
  })
  it("supports a plain last-label readout and explicit separator", () => {
    const f = fixture({ defaultValue: "paris", separator: " → " })
    expect(f.root.querySelector("[data-cascader-path]")!.textContent).toBe("eu → fr → paris")
    const g = fixture({ defaultValue: "paris", showPath: false })
    expect(g.root.querySelector("[data-cascader-path]")!.textContent).toBe("paris")
  })
  it("rejects duplicate source keys, unsupported source controls and excess depth before insertion", () => {
    expect(() => fixture({}, { source: sourceNode("same") + sourceNode("same") })).toThrow("unique")
    expect(() => fixture({}, { source: sourceNode("x").replace("</div>", "<input name=hidden></div>") })).toThrow("static")
    expect(() => fixture({}, { source: sourceNode("a", sourceNode("b", sourceNode("c", sourceNode("d")))) })).toThrow("depth")
  })
})

describe("native defaults and reset reconstruction", () => {
  it("restores original default descendants after switching to a different ancestor", async () => {
    const { helper, form, controls } = fixture({ defaultValue: "paris" })
    helper.setValue("nyc"); expect(controls[1]!.options.namedItem("fr")).toBeNull()
    form.reset(); await wait()
    expect(helper.state.path).toEqual(["eu", "fr", "paris"])
    expect(controls.map(control => control.value)).toEqual(["eu", "fr", "paris"])
    expect(form.checkValidity()).toBe(true)
  })
  it("gates the reset settlement gap instead of allowing an unrelated post-reset child form value", async () => {
    const { helper, form } = fixture({ defaultValue: "paris" })
    helper.setValue("nyc"); form.reset()
    expect(helper.state.pending).toBe(true); expect(form.checkValidity()).toBe(false)
    await wait(); expect(helper.state.value).toBe("paris"); expect(form.checkValidity()).toBe(true)
  })
  it("captures authored defaultSelected paths independently of current values", async () => {
    const { helper, form } = fixture({ value: "nyc" }, { native: true })
    expect(helper.state.defaultPath).toEqual(["eu", "fr", "paris"]); expect(helper.state.value).toBe("nyc")
    form.reset(); await wait(); expect(helper.state.value).toBe("paris")
  })
  it("preserves current path and pending loads on cancelled reset", async () => {
    let finish!: (value: TreeLoadResult) => void, signal!: AbortSignal
    const { helper, form } = fixture({ defaultValue: "paris", load: (_, context) => { signal = context.signal; return new Promise(resolve => { finish = resolve }) } })
    helper.setPath(["lazy"]); const pending = helper.load()
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset()
    finish({ nodes: [fresh("child")] }); expect(await pending).toBe(true); await wait()
    expect(signal.aborted).toBe(false); expect(helper.state.path).toEqual(["lazy"])
  })
  it("does not install a load result between reset dispatch and dependent-default settlement", async () => {
    let finish!: (value: TreeLoadResult) => void
    const dispose = vi.fn(), { helper, form, node } = fixture({ defaultValue: "paris", load: () => new Promise(resolve => { finish = resolve }) })
    helper.setPath(["lazy"]); const pending = helper.load()
    form.reset(); finish({ nodes: [fresh("late")], dispose }); await wait()
    expect(await pending).toBe(false); expect(helper.state.value).toBe("paris")
    expect(node("lazy").querySelector("[data-tree-list]")!.children).toHaveLength(0); expect(dispose).toHaveBeenCalledOnce()
  })
  it("lets a later explicit setter supersede a pending reset settlement", async () => {
    const { helper, form } = fixture({ defaultValue: "paris" })
    helper.setValue("island"); form.reset(); helper.setValue("nyc")
    expect(form.checkValidity()).toBe(true); await wait()
    expect(helper.state.value).toBe("nyc")
  })
  it("coalesces real and cancelled resets without losing the original path", async () => {
    const { helper, form } = fixture({ defaultValue: "paris" })
    helper.setValue("nyc"); form.reset()
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await wait()
    expect(helper.state.value).toBe("paris")
  })
  it("restores an explicitly changed default without changing current value immediately", async () => {
    const { helper, form } = fixture({ defaultValue: "paris" })
    helper.setDefaultValue("nyc"); expect(helper.state.value).toBe("paris")
    form.reset(); await wait(); expect(helper.state.value).toBe("nyc")
  })
  it("recognizes coherent native defaultSelected edits", async () => {
    const { helper, form, controls } = fixture({ defaultValue: "paris" })
    controls[2]!.options[1]!.defaultSelected = false
    controls[2]!.options[2]!.defaultSelected = true
    helper.refresh(); helper.setValue("nyc"); form.reset(); await wait()
    expect(helper.state.defaultPath).toEqual(["eu", "fr", "lyon"]); expect(helper.state.value).toBe("lyon")
  })
  it("does not substitute a sibling or relocate a missing default to another ancestor", async () => {
    const { helper, node, form, controls } = fixture({ defaultValue: "paris" })
    helper.setValue("nyc"); node("paris").remove(); helper.refresh()
    expect(helper.state.defaultValid).toBe(false); expect(helper.state.value).toBe("nyc")
    form.reset(); await wait()
    expect(helper.state.value).toBeNull(); expect(helper.state.path).toEqual([])
    expect(form.checkValidity()).toBe(false); expect(controls[0]!.validity.customError).toBe(true)
    helper.setDefaultValue("lyon"); form.reset(); await wait(); expect(helper.state.value).toBe("lyon")
  })
  it("detects inconsistent cross-branch defaultSelected changes instead of inventing a path", async () => {
    const { helper, controls, form } = fixture({ defaultValue: "paris" })
    controls[0]!.options[1]!.defaultSelected = false
    controls[0]!.options[2]!.defaultSelected = true
    helper.refresh(); expect(helper.state.defaultValid).toBe(false)
    form.reset(); await wait(); expect(helper.state.value).toBeNull(); expect(form.checkValidity()).toBe(false)
  })
  it("keeps a failed optional reset gated through refresh until an explicit current/default action", async () => {
    const { helper, node, form } = fixture({ defaultValue: "paris" }, { required: false })
    node("paris").remove(); helper.refresh(); form.reset(); await wait(); helper.refresh()
    expect(form.checkValidity()).toBe(false)
    expect(helper.clear()).toBe(true); expect(form.checkValidity()).toBe(true)
    expect(helper.state.defaultValid).toBe(false)
  })
})

describe("native forms, validity and notification ownership", () => {
  it("requires actual completion, not a successful parent while a child loads", () => {
    const { helper, form, controls } = fixture({ load: () => new Promise(() => {}) })
    helper.setPath(["lazy"]); void helper.load()
    expect(helper.state.pending).toBe(true); expect(helper.state.complete).toBe(false)
    expect(controls[0]!.willValidate).toBe(true); expect(controls[0]!.validity.customError).toBe(true)
    expect(form.checkValidity()).toBe(false)
  })
  it("allows optional empty, blocks optional partial, and serializes only native path fields", () => {
    const { helper, form, controls } = fixture({}, { required: false })
    expect(helper.state.valid).toBe(true); helper.setPath(["eu"]); expect(form.checkValidity()).toBe(false)
    helper.setValue("paris")
    expect(new FormData(form).getAll("path[]")).toEqual(["eu", "fr", "paris"])
    expect([...form.querySelectorAll('input[type="hidden"]')]).toHaveLength(0)
    expect(controls.every(control => control.name === "path[]")).toBe(true)
    helper.setValue("island"); expect(new FormData(form).getAll("path[]")).toEqual(["island"])
  })
  it("gates another enabled active column when the first select is authored disabled", () => {
    const { helper, controls, form } = fixture()
    controls[0]!.disabled = true; helper.refresh(); helper.setPath(["eu"])
    expect(controls[1]!.willValidate).toBe(true); expect(controls[1]!.validity.customError).toBe(true)
    expect(form.checkValidity()).toBe(false)
  })
  it("respects native fieldset disabling and its first legend exception", () => {
    const { helper, form, root, controls } = fixture()
    const fieldset = document.createElement("fieldset"), legend = document.createElement("legend")
    legend.textContent = "Legend"; fieldset.disabled = true; form.append(fieldset); fieldset.append(legend, root)
    helper.refresh(); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll("path[]")).toEqual([])
    legend.append(root); helper.refresh(); expect(controls[0]!.willValidate).toBe(true); expect(form.checkValidity()).toBe(false)
  })
  it("preserves external custom-validity messages while applying its own incomplete-path gate", () => {
    const { helper, controls, form } = fixture()
    controls[0]!.setCustomValidity("Application policy"); helper.refresh(); helper.setValue("paris")
    expect(controls[0]!.validationMessage).toBe("Application policy"); expect(form.checkValidity()).toBe(false)
    controls[0]!.setCustomValidity(""); helper.refresh(); expect(form.checkValidity()).toBe(true)
    helper.setPath(["eu"]); expect(controls[0]!.validity.customError).toBe(true)
  })
  it("composes with the existing native Form helper without a proxy field or validator owner", async () => {
    const { helper, controls, form } = fixture()
    const validation = createForm(form, { items: [{ key: "destination", controls }] })
    helper.setPath(["eu"]); expect((await validation.validate()).status).toBe("invalid")
    helper.setValue("paris"); expect((await validation.validate()).status).toBe("valid")
    validation.disconnect(); expect(helper.state.value).toBe("paris")
  })
  it("uses external form ownership without moving or renaming fields", async () => {
    const { form, root, helper, controls } = fixture({ defaultValue: "paris" })
    form.id = "external"; controls.forEach(control => control.setAttribute("form", "external"))
    document.body.append(root); helper.refresh()
    helper.setValue("nyc"); form.reset(); await wait()
    expect(helper.state.value).toBe("paris"); expect(new FormData(form).getAll("path[]")).toEqual(["eu", "fr", "paris"])
  })
  it("emits one user selection, keeps setters/refresh/reset silent and respects cancelled clear", async () => {
    const { helper, root, change, clear, form } = fixture({ defaultValue: "paris" }), event = vi.fn()
    root.addEventListener("mui:cascader-change", event)
    helper.setValue("nyc"); helper.refresh(); form.reset(); await wait(); expect(event).not.toHaveBeenCalled()
    change(0, "us"); expect(event).toHaveBeenCalledOnce()
    form.addEventListener("click", event => event.preventDefault(), { once: true }); clear.click(); await wait()
    expect(helper.state.path).toEqual(["us"]); expect(event).toHaveBeenCalledOnce()
    clear.click(); await wait(); expect(helper.state.path).toEqual([]); expect(event).toHaveBeenCalledTimes(2)
  })
  it("clears toward an enabled native focus target before hiding the clear action", () => {
    const { helper, clear, controls } = fixture({ defaultValue: "paris" })
    clear.focus(); expect(helper.clear()).toBe(true)
    expect(document.activeElement).toBe(controls[0]); expect(clear.hidden).toBe(true); expect(helper.clear()).toBe(false)
  })
  it("does not clear a locked root selection and strand focus in disabled descendants", () => {
    const { helper, controls, clear } = fixture({ defaultValue: "paris" })
    controls[0]!.disabled = true; helper.refresh()
    expect(clear.hidden).toBe(true); expect(helper.clear()).toBe(false)
    expect(helper.state.value).toBe("paris"); expect(controls[1]!.disabled).toBe(false)
  })
  it("moves focus before a dependent column disappears and otherwise keeps stable controls", () => {
    const { helper, controls } = fixture({ defaultValue: "paris" })
    controls[2]!.focus(); helper.setValue("nyc"); expect(document.activeElement).toBe(controls[1])
    controls[1]!.focus(); helper.setValue("island"); expect(document.activeElement).toBe(controls[0])
  })
})

describe("safe async hierarchy insertion and lifetime", () => {
  function deferred() {
    let done!: (value: TreeLoadResult) => void, signal!: AbortSignal
    return { load: vi.fn((_node, context) => { signal = context.signal; return new Promise<TreeLoadResult>(resolve => { done = resolve }) }), finish: (value: TreeLoadResult) => done(value), get signal() { return signal } }
  }
  it("inserts safe source nodes, offers a blank child choice, and emits no second selection", async () => {
    const pending = deferred(), { helper, change, controls, root } = fixture({ load: pending.load }), selected = vi.fn(), loaded = vi.fn()
    root.addEventListener("mui:cascader-change", selected); root.addEventListener("mui:cascader-load", loaded)
    change(0, "lazy"); expect(helper.state.pending).toBe(true)
    pending.finish({ nodes: [fresh("child")] }); await wait()
    expect(helper.state.path).toEqual(["lazy"]); expect(helper.state.value).toBeNull(); expect(controls[1]!.value).toBe("")
    expect(selected).toHaveBeenCalledOnce(); expect(loaded).toHaveBeenCalledOnce()
    change(1, "child"); expect(helper.state.value).toBe("child")
  })
  it("aborts on parent change/clear and cleans a late result without selection overwrite", async () => {
    const pending = deferred(), dispose = vi.fn(), { helper, node } = fixture({ load: pending.load })
    helper.setPath(["lazy"]); const promise = helper.load(); helper.setValue("paris")
    expect(pending.signal.aborted).toBe(true); expect(await promise).toBe(false)
    pending.finish({ nodes: [fresh("late")], dispose }); await wait()
    expect(helper.state.value).toBe("paris"); expect(node("lazy").querySelector("[data-tree-list]")!.children).toHaveLength(0); expect(dispose).toHaveBeenCalledOnce()
  })
  it("does not overwrite a direct native ancestor value change even without a change event", async () => {
    const pending = deferred(), dispose = vi.fn(), { helper, node, controls } = fixture({ load: pending.load })
    helper.setPath(["lazy"]); const promise = helper.load()
    controls[0]!.value = "us"
    pending.finish({ nodes: [fresh("stale")], dispose }); expect(await promise).toBe(false); await wait()
    expect(controls[0]!.value).toBe("us"); expect(helper.state.path).toEqual(["us"])
    expect(node("lazy").querySelector("[data-tree-list]")!.children).toHaveLength(0); expect(dispose).toHaveBeenCalledOnce()
  })
  it("guards reused keys with actual branch identity and refresh generations", async () => {
    const pending = deferred(), dispose = vi.fn(), { helper, node } = fixture({ load: pending.load })
    helper.setPath(["lazy"]); const promise = helper.load()
    node("lazy").replaceWith(fresh("lazy")); helper.refresh()
    expect(await promise).toBe(false); pending.finish({ nodes: [fresh("late")], dispose }); await wait()
    expect(node("lazy").querySelector("[data-tree-key]")).toBeNull(); expect(dispose).toHaveBeenCalledOnce()
  })
  it("rejects duplicate, unsafe and connected results atomically and permits retry", async () => {
    const dispose = vi.fn(), { helper, node } = fixture({ load: () => ({ nodes: [fresh("paris")], dispose }) })
    helper.setPath(["lazy"]); await expect(helper.load()).rejects.toThrow("unique")
    expect(node("lazy").querySelector("[data-tree-list]")!.children).toHaveLength(0); expect(helper.connected).toBe(true); expect(dispose).toHaveBeenCalledOnce()
    const foreign = fresh("foreign"); document.body.append(foreign)
    const other = fixture({ load: () => ({ nodes: [foreign] }) }); other.helper.setPath(["lazy"])
    await expect(other.helper.load()).rejects.toThrow("fresh"); expect(foreign.parentElement).toBe(document.body)
    const unsafe = fresh("unsafe"); unsafe.append(document.createElement("input"))
    const third = fixture({ load: () => ({ nodes: [unsafe] }) }); third.helper.setPath(["lazy"])
    await expect(third.helper.load()).rejects.toThrow("passive")
  })
  it("handles empty results, any-branch policy and rejected loaders truthfully", async () => {
    const empty = fixture({ load: () => ({ nodes: [] }) })
    empty.helper.setPath(["lazy"]); await empty.helper.load()
    expect(empty.helper.state).toMatchObject({ value: null, complete: false, pending: false })
    const any = fixture({ selection: "any", load: () => new Promise(() => {}) })
    any.helper.setValue("lazy"); void any.helper.load(); expect(any.helper.state.complete).toBe(true)
    const bad = fixture({ load: async () => { throw new Error("Failed") } })
    bad.helper.setPath(["lazy"]); await expect(bad.helper.load()).rejects.toThrow("Failed")
    expect(bad.helper.state.valid).toBe(false); expect(bad.helper.state.pending).toBe(false)
  })
  it("snapshots accepted result arrays and callback ownership", async () => {
    const dispose = vi.fn(), result = { nodes: [fresh("child")], dispose }, foreign = fresh("foreign"); document.body.append(foreign)
    const { helper, node } = fixture({ load: () => result })
    helper.setPath(["lazy"]); await helper.load()
    result.nodes.splice(0, 1, foreign); result.dispose = vi.fn(); helper.disconnect()
    expect(foreign.isConnected).toBe(true); expect(node("lazy").querySelector("[data-tree-list]")!.children).toHaveLength(0); expect(dispose).toHaveBeenCalledOnce()
  })
  it("disposes returns after loader-triggered disconnect and rejects mutation reentry", async () => {
    const dispose = vi.fn()
    const f = fixture({ load: () => { f.helper.disconnect(); return { nodes: [fresh("late")], dispose } } })
    f.helper.setPath(["lazy"]); await expect(f.helper.load()).resolves.toBe(false); await wait(); expect(dispose).toHaveBeenCalledOnce()
    const g = fixture({ load: () => { g.helper.setValue("paris"); return { nodes: [] } } }); g.helper.setPath(["lazy"])
    await expect(g.helper.load()).rejects.toThrow("reenter")
  })
})

describe("scope, failure gates and teardown", () => {
  it("rejects competing Select/Tree owners and module copies without stealing native DOM", async () => {
    const { root, helper, source } = fixture()
    expect(() => createTree(source)).toThrow("owner")
    expect(() => createSelect(root.querySelector("[data-cascader-column]")!)).toThrow("owner")
    vi.resetModules(); const copy = await import("../src/components/cascader/index.js")
    expect(() => copy.createCascader(root)).toThrow("owner")
    helper.disconnect(); const rebound = copy.createCascader(root); rebound.disconnect()
  })
  it("keeps nested and separate roots independent", () => {
    const a = fixture(), b = fixture(); b.form.id = "nested-form"
    b.controls.forEach(control => control.setAttribute("form", b.form.id))
    a.root.append(b.root); a.helper.refresh()
    a.helper.setValue("paris"); b.helper.setValue("island")
    expect(a.helper.state.value).toBe("paris"); expect(b.helper.state.value).toBe("island")
  })
  it("marks invalid external hierarchy as a fault and blocks a native submit until repaired", () => {
    const { helper, node, form, controls } = fixture({ defaultValue: "paris" })
    node("lyon").setAttribute("data-tree-key", "paris")
    expect(() => helper.refresh()).toThrow("unique")
    expect(helper.state.valid).toBe(false); expect(helper.state.value).toBeNull(); expect(form.checkValidity()).toBe(false)
    expect(() => helper.setValue("nyc")).toThrow("unique")
    expect(() => helper.clear()).toThrow("unique")
    const event = new Event("submit", { bubbles: true, cancelable: true }); form.dispatchEvent(event); expect(event.defaultPrevented).toBe(true)
    const duplicate = [...form.querySelectorAll('[data-tree-key="paris"]')][1]!; duplicate.setAttribute("data-tree-key", "lyon")
    helper.refresh(); expect(controls[2]!.value).toBe("paris"); expect(helper.state.value).toBe("paris")
  })
  it("rejects changed column/view anatomy without deleting newly authored view content", () => {
    const { helper, root } = fixture()
    const button = document.createElement("button"); button.textContent = "New author action"
    root.querySelector("[data-cascader-status]")!.append(button)
    expect(() => helper.refresh()).toThrow()
    expect(button.isConnected).toBe(true)
  })
  it("restores original option nodes/attributes/messages and cancels pending tasks", async () => {
    const { helper, controls, originals, root } = fixture({}, { native: true })
    const labels = controls.map(control => control.labels![0]); helper.setValue("nyc"); helper.disconnect(); await wait()
    expect(controls.map(control => [...control.options])).toEqual(originals)
    expect(controls.map(control => control.labels![0])).toEqual(labels)
    expect(controls.map(control => control.value)).toEqual(["eu", "fr", "paris"])
    expect(root.hasAttribute("aria-busy")).toBe(false); expect(helper.state.path).toEqual([])
  })
  it("cleans loaded batches and continues teardown when disposal throws", async () => {
    const { helper, node, controls } = fixture({ load: () => ({ nodes: [fresh("child")], dispose() { throw new Error("Cleanup failed") } }) })
    helper.setPath(["lazy"]); await helper.load()
    expect(() => helper.disconnect()).toThrow("cleanup")
    expect(node("lazy").querySelector("[data-tree-list]")!.children).toHaveLength(0)
    expect(controls[0]!.validity.customError).toBe(false); expect(() => helper.disconnect()).not.toThrow()
  })
  it("moves source-disclosure focus outside a loaded batch before teardown removes it", async () => {
    const template = document.createElement("template"); template.innerHTML = sourceNode("group", sourceNode("leaf"))
    const { helper, node } = fixture({ load: () => ({ nodes: [document.importNode(template.content.firstElementChild!, true) as HTMLLIElement] }) })
    helper.setPath(["lazy"]); await helper.load()
    const parent = node("lazy").querySelector("details")!; parent.open = true
    node("group").querySelector<HTMLElement>("summary")!.focus(); helper.disconnect()
    expect(document.activeElement).toBe(parent.firstElementChild)
    expect(parent.querySelector("[data-tree-list]")!.children).toHaveLength(0)
  })
})
