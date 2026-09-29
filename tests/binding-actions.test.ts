import { afterEach, describe, expect, it, vi } from "vitest"
import { bind, createStore } from "../src/state/index.js"
import { installActions, invokeAction, registerAction, type ActionContext } from "../src/actions/index.js"
import { App } from "../src/components/foundation.js"
import "../src/components/list/index.js"
import "../src/components/button/index.js"

const cleanup: Array<() => void> = []
const flush = async () => { await Promise.resolve(); await Promise.resolve() }
const rows = () => [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }]
const each = '<template data-each="rows" data-each-key="id"><button m-action="scoped-test" m-arg-key="$key" m-arg-index="$index" m-arg-name="$item.name" m-param-mode="edit">Edit</button></template>'
function setup(markup = each, state: Record<string, unknown> = { rows: rows() }) {
  const root = document.createElement("div")
  root.innerHTML = markup
  document.body.append(root)
  const store = createStore(state)
  const binding = bind(root, store)
  cleanup.push(binding, installActions(root, binding))
  const action = vi.fn<(context: ActionContext) => void>()
  registerAction("scoped-test", action)
  const errors: unknown[] = []
  root.addEventListener("m:error", event => errors.push((event as CustomEvent).detail))
  return { root, store, binding, action, errors }
}
afterEach(() => {
  cleanup.splice(0).reverse().forEach(stop => stop())
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("explicit scoped action arguments", () => {
  it("reads typed arguments at activation and shares exactly the bound store", () => {
    const { root, store, binding, action, errors } = setup()
    root.querySelector("button")!.click()
    const context = action.mock.calls[0]![0]
    expect(context.store).toBe(store)
    expect(binding.store).toBe(store)
    expect(context.arguments).toEqual({ key: "a", index: 0, name: "Alpha" })
    expect(context.parameters).toEqual({ mode: "edit" })
    expect(Object.isFrozen(context.arguments)).toBe(true)
    expect(Object.isFrozen(context.parameters)).toBe(true)
    expect(errors).toEqual([])
  })

  it("resolves retained keys after reorder and immutable record replacement", () => {
    const { root, store, action } = setup()
    const first = root.querySelector("button")!
    store.set("rows", [{ id: "b", name: "New beta" }, { id: "a", name: "New alpha" }])
    expect(root.querySelectorAll("button")[1]).toBe(first)
    first.click()
    expect(action.mock.calls[0]![0].arguments).toEqual({ key: "a", index: 1, name: "New alpha" })
  })

  it("distinguishes string and numeric keys without stringifying arguments", () => {
    const { root, store, action } = setup(each, { rows: [{ id: 1, name: "Number" }, { id: "1", name: "String" }] })
    const [number, string] = root.querySelectorAll("button")
    store.set("rows", [...store.get("rows") as unknown[]].reverse())
    number!.click()
    string!.click()
    expect(action.mock.calls.map(([context]) => context.arguments.key)).toEqual([1, "1"])
    expect(action.mock.calls.map(([context]) => context.arguments.index)).toEqual([1, 0])
  })

  it("resolves nested parents through conditions after both collections reorder", () => {
    const groups = [{ id: "g", name: "Group", visible: true, rows: rows() }, { id: "h", name: "Other", visible: false, rows: [] }]
    const { root, store, action } = setup('<template data-each="groups" data-each-key="id"><section><template data-if="$item.visible"><div><template data-each="$item.rows" data-each-key="id"><button m-action="scoped-test" m-arg-key="$key" m-arg-parent="$parent.name" m-arg-title="$root.title" m-arg-index="$index">Edit</button></template></div></template></section></template>', { groups, title: "Root" })
    const first = root.querySelector("button")!
    store.set("groups", [...groups].reverse())
    store.set("groups.1.rows", rows().reverse())
    store.set("groups.1.name", "Renamed")
    first.click()
    expect(action.mock.calls[0]![0].arguments).toEqual({ key: "a", parent: "Renamed", title: "Root", index: 1 })
  })

  it("keeps root dollar-prefixed paths literal and reads current plain data", () => {
    const record = { ready: true }
    const { root, store, action } = setup('<button m-action="scoped-test" m-arg-item="$item" m-arg-null="nil" m-arg-missing="absent" m-arg-record="record" m-arg-count="count">Read</button>',
      { $item: "literal", nil: null, record, count: 1 })
    store.set("count", 2)
    root.querySelector("button")!.click()
    expect(action.mock.calls[0]![0].arguments).toEqual({ item: "literal", null: null, missing: undefined, record, count: 2 })
    expect(action.mock.calls[0]![0].arguments.record).toBe(record)
  })

  it("supports root aliases in a condition without inventing an item scope", () => {
    const { root, action } = setup('<template data-if="visible"><button m-action="scoped-test" m-arg-title="$root.title">Read</button></template>', { visible: true, title: "Root" })
    root.querySelector("button")!.click()
    expect(action.mock.calls[0]![0].arguments).toEqual({ title: "Root" })
  })

  it("routes portable native Button clicks through a ListTemplate scope", () => {
    const { root, action } = setup('<m-list><m-list-template data-each="rows" data-each-key="id"><m-list-item><m-button m-action="scoped-test" m-arg-key="$key">Edit</m-button></m-list-item></m-list-template></m-list>')
    root.querySelector("button")!.click()
    expect(action.mock.calls[0]![0].element.localName).toBe("m-button")
    expect(action.mock.calls[0]![0].arguments).toEqual({ key: "a" })
  })

  it("allows a synchronous action to replace its collection through the store", () => {
    const { root, store, errors } = setup()
    registerAction("scoped-test", ({ store, arguments: args }) => {
      store!.set("rows", (store!.get("rows") as ReturnType<typeof rows>).filter(row => row.id !== args.key))
    })
    root.querySelector("button")!.click()
    expect(store.get("rows")).toEqual([rows()[1]])
    expect(root.querySelectorAll("button")).toHaveLength(1)
    expect(errors).toEqual([])
  })

  it("rejects missing current keys even for a root-only path after failed preflight", () => {
    const { root, store, binding, action, errors } = setup(each, { rows: rows(), title: "Root" })
    const first = root.querySelector("button")!
    first.setAttribute("m-arg-name", "$root.title")
    first.removeAttribute("m-arg-key")
    first.removeAttribute("m-arg-index")
    expect(() => store.set("rows", [{ id: "b", name: "Beta" }, { id: "b", name: "Duplicate" }])).toThrow("unique")
    first.click()
    expect(action).not.toHaveBeenCalled()
    expect(errors).toHaveLength(1)
    expect(() => binding.read(first, "$root.title")).toThrow("unique")
    store.set("rows", [rows()[1]])
    expect(() => binding.read(first, "$root.title")).toThrow("ownership")
  })

  it("rejects detached, transferred and extracted scoped nodes", () => {
    const { root, binding, action, errors } = setup('<template data-each="rows" data-each-key="id"><div><button m-action="scoped-test" m-arg-key="$key">Read</button></div></template>')
    const first = root.querySelector("button")!
    root.append(first)
    first.click()
    expect(errors).toHaveLength(1)
    expect(action).not.toHaveBeenCalled()
    first.remove()
    expect(() => binding.read(first, "$key")).toThrow("ownership")
  })

  it("rejects a removed key after focused removal fails and leaves the old row visible", () => {
    const { root, store, binding } = setup(each, { rows: rows(), title: "Root" })
    const first = root.querySelector("button")!
    first.focus()
    expect(() => store.set("rows", [rows()[1]])).toThrow("focusFallback")
    expect(first.isConnected).toBe(true)
    expect(() => binding.read(first, "$root.title")).toThrow("no longer exists")
  })

  it("rejects scoped reads as soon as the source is removed, before refresh", () => {
    const { root, binding } = setup()
    const first = root.querySelector("button")!
    root.querySelector("template")!.remove()
    expect(() => binding.read(first, "$key")).toThrow("ownership")
  })

  it("requires refresh for newly authored nodes and rejects source elements", () => {
    const { root, binding, action, errors } = setup()
    const late = document.createElement("button")
    late.setAttribute("m-action", "scoped-test")
    late.setAttribute("m-arg-count", "rows.length")
    root.append(late)
    late.click()
    expect(errors).toHaveLength(1)
    expect(action).not.toHaveBeenCalled()
    binding.refresh()
    late.click()
    expect(action.mock.calls[0]![0].arguments).toEqual({ count: 2 })
    expect(() => binding.read(root.querySelector("template")!, "rows")).toThrow("ownership")
  })

  it("rejects data reads after disposal and does not reuse an old binding on rebind", () => {
    const { root, store, binding, action, errors } = setup()
    const first = root.querySelector("button")!
    binding()
    expect(() => binding.read(first, "$key")).toThrow("disposed")
    const next = bind(root, store)
    cleanup.push(next)
    first.click()
    expect(action).not.toHaveBeenCalled()
    expect(errors[0]).toBeInstanceOf(Error)
    expect(next.read(first, "$key")).toBe("a")
    expect(root.querySelectorAll("button")).toHaveLength(2)
  })

  it("does not reinterpret elements from a different explicit root", () => {
    const first = setup()
    const other = document.createElement("button")
    document.body.append(other)
    expect(() => first.binding.read(other, "rows")).toThrow("ownership")
  })

  it("rejects event reads during property updates before publishing new scopes", () => {
    const { root, store, binding } = setup('<template data-each="rows" data-each-key="id"><button data-bind-title="$item.name" m-action="scoped-test">Read</button></template>')
    const button = root.querySelector("button")!
    const calls: unknown[] = []
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "title")!
    Object.defineProperty(button, "title", {
      get: () => original.get!.call(button),
      set: value => {
        try { binding.read(button, "$key") } catch (error) { calls.push(error) }
        original.set!.call(button, value)
      },
      configurable: true,
    })
    store.set("rows.0.name", "Updated")
    expect(calls).toHaveLength(1)
    expect((calls[0] as Error).message).toContain("during an update")
    expect(binding.read(button, "$item.name")).toBe("Updated")
  })

  it.each(["", "$item.constructor", "$item.__proto__", "$item.name()", "$index.value", "$parent.name"])("reports invalid or unavailable paths %j without invoking", path => {
    const { root, action, errors } = setup()
    root.querySelector("button")!.setAttribute("m-arg-name", path)
    root.querySelector("button")!.click()
    expect(action).not.toHaveBeenCalled()
    expect(errors).toHaveLength(1)
  })

  it.each(["", "constructor", "prototype", "__proto__", "bad--name"])("rejects unsafe argument name %j", key => {
    const { root, action, errors } = setup()
    const button = root.querySelector("button")!
    button.setAttribute(`m-arg-${key}`, "$key")
    button.click()
    expect(action).not.toHaveBeenCalled()
    expect(errors).toHaveLength(1)
  })

  it("does not execute accessors or accept executable root data", () => {
    const getter = vi.fn(() => "unsafe")
    const data = Object.defineProperty({}, "secret", { get: getter })
    const { root, store, action, errors } = setup('<button m-action="scoped-test" m-arg-value="data.secret">Read</button>', { data })
    root.querySelector("button")!.click()
    expect(getter).not.toHaveBeenCalled()
    expect(action).not.toHaveBeenCalled()
    store.set("data", { secret: () => {} })
    root.querySelector("button")!.click()
    expect(action).not.toHaveBeenCalled()
    expect(errors).toHaveLength(2)
  })

  it("keeps event-time scalar arguments through async work without retargeting", async () => {
    const { root, store } = setup()
    let resume!: () => void
    let captured: Readonly<Record<string, unknown>> | undefined
    const pending = new Promise<void>(resolve => { resume = resolve })
    registerAction("scoped-test", async ({ arguments: args }) => { await pending; captured = args })
    root.querySelector("button")!.click()
    store.set("rows", [])
    resume()
    await flush()
    expect(captured).toEqual({ key: "a", index: 0, name: "Alpha" })
  })

  it("reconnects App with one action listener and current scopes", async () => {
    customElements.define("m-action-test-app", class extends App {})
    const app = document.createElement("m-action-test-app") as App
    app.innerHTML = each
    app.store = createStore({ rows: rows() })
    const action = vi.fn()
    registerAction("scoped-test", action)
    document.body.append(app)
    await flush()
    const first = app.querySelector("button")!
    for (let index = 0; index < 3; index++) {
      app.remove()
      first.click()
      expect(action).toHaveBeenCalledTimes(index)
      app.store.set("rows", rows().reverse())
      document.body.append(app)
      await flush()
      first.click()
      expect(action).toHaveBeenCalledTimes(index + 1)
      expect(action.mock.calls[index]![0].arguments.index).toBe(1)
    }
  })

  it("releases a new App binding when action installation fails, then reconnects cleanly", () => {
    const pending: Array<() => void> = []
    vi.spyOn(globalThis, "queueMicrotask").mockImplementation(callback => { pending.push(callback) })
    customElements.define("m-action-conflict-app", class extends App {})
    const app = document.createElement("m-action-conflict-app") as App
    app.store = createStore({ title: "Current" })
    app.innerHTML = '<button m-action="scoped-test" m-arg-title="title">Read</button>'
    const action = vi.fn()
    registerAction("scoped-test", action)
    const disposeActions = installActions(app, app.store)
    cleanup.push(disposeActions)
    document.body.append(app)
    expect(() => pending.shift()!()).toThrow("already installed")
    const binding = bind(app, app.store)
    cleanup.push(binding)
    binding()
    disposeActions()
    app.remove()
    document.body.append(app)
    pending.shift()!()
    app.querySelector("button")!.click()
    expect(action).toHaveBeenCalledOnce()
    expect(action.mock.calls[0]![0].arguments).toEqual({ title: "Current" })
  })
})

describe("action delegation and errors", () => {
  it("preserves complete literal parameter names and needs no binder for literals", () => {
    const root = document.createElement("div")
    root.innerHTML = '<button m-action="literal-test" m-param-target="#dialog" m-param-id="x" m-param-mode="save">Save</button>'
    const action = vi.fn()
    registerAction("literal-test", action)
    const store = createStore()
    cleanup.push(installActions(root, store))
    root.querySelector("button")!.click()
    expect(action.mock.calls[0]![0].parameters).toEqual({ target: "#dialog", id: "x", mode: "save" })
    expect(action.mock.calls[0]![0].arguments).toEqual({})
    expect(action.mock.calls[0]![0].store).toBe(store)
  })

  it.each([false, true])("requires explicit binding instead of inferring a store scope (%s)", withStore => {
    const root = document.createElement("button")
    root.setAttribute("m-action", "no-binding-test")
    root.setAttribute("m-arg-value", "value")
    const action = vi.fn(), error = vi.fn()
    registerAction("no-binding-test", action)
    root.addEventListener("m:error", error)
    cleanup.push(installActions(root, withStore ? createStore({ value: 1 }) : undefined))
    root.click()
    expect(action).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledOnce()
  })

  it("uses the nearest installation, including a boundary without an action", () => {
    const outer = document.createElement("div")
    outer.innerHTML = '<div><button m-action="nested-test">Run</button></div>'
    const inner = outer.firstElementChild!
    const action = vi.fn()
    registerAction("nested-test", action)
    const first = createStore(), second = createStore()
    cleanup.push(installActions(outer, first), installActions(inner, second))
    inner.querySelector("button")!.click()
    expect(action).toHaveBeenCalledOnce()
    expect(action.mock.calls[0]![0].store).toBe(second)
    inner.querySelector("button")!.removeAttribute("m-action")
    outer.setAttribute("m-action", "nested-test")
    inner.querySelector("button")!.click()
    expect(action).toHaveBeenCalledOnce()
  })

  it("rejects duplicate installation and makes old disposal idempotent after reinstall", () => {
    const root = document.createElement("button")
    root.setAttribute("m-action", "single-test")
    const action = vi.fn()
    registerAction("single-test", action)
    const first = installActions(root)
    expect(() => installActions(root)).toThrow("already")
    first()
    cleanup.push(installActions(root))
    first()
    root.click()
    expect(action).toHaveBeenCalledOnce()
  })

  it("retains event ownership when an action disposes its own nested installation", () => {
    const outer = document.createElement("div")
    outer.innerHTML = '<button m-action="dispose-test">Run</button>'
    const inner = outer.querySelector("button")!
    cleanup.push(installActions(outer))
    const stopInner = installActions(inner)
    cleanup.push(stopInner)
    const action = vi.fn(() => stopInner())
    registerAction("dispose-test", action)
    const event = new MouseEvent("click", { bubbles: true })
    inner.dispatchEvent(event)
    expect(action).toHaveBeenCalledOnce()
    inner.dispatchEvent(event)
    expect(action).toHaveBeenCalledTimes(2)
  })

  it("does not select actions outside the installed root and accepts text-node targets", () => {
    const ancestor = document.createElement("div")
    ancestor.setAttribute("m-action", "bounded-test")
    ancestor.innerHTML = '<div><button><span>Save</span></button></div>'
    const root = ancestor.firstElementChild!
    const action = vi.fn()
    registerAction("bounded-test", action)
    cleanup.push(installActions(root))
    root.querySelector("button")!.click()
    expect(action).not.toHaveBeenCalled()
    root.querySelector("button")!.setAttribute("m-action", "bounded-test")
    root.querySelector("span")!.firstChild!.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(action).toHaveBeenCalledOnce()
  })

  it("does not double-dispatch across a composed shadow-root boundary", () => {
    const host = document.createElement("div")
    const shadow = host.attachShadow({ mode: "open" })
    shadow.innerHTML = '<button m-action="shadow-test">Save</button>'
    document.body.append(host)
    const action = vi.fn()
    registerAction("shadow-test", action)
    cleanup.push(installActions(document.body), installActions(shadow))
    shadow.querySelector("button")!.click()
    expect(action).toHaveBeenCalledOnce()
  })

  it.each(["sync", "async", "unknown"])("reports %s invocation errors exactly once", async mode => {
    const { root, errors } = setup()
    if (mode === "unknown") root.querySelector("button")!.setAttribute("m-action", "unregistered-scoped-test")
    else registerAction("scoped-test", mode === "sync"
      ? () => { throw new Error("sync failure") }
      : async () => { throw new Error("async failure") })
    root.querySelector("button")!.click()
    await flush()
    expect(errors).toHaveLength(1)
    expect(errors[0]).toBeInstanceOf(Error)
  })

  it("always returns a rejected promise for direct synchronous exceptions", async () => {
    const failure = new Error("direct failure")
    registerAction("direct-test", () => { throw failure })
    await expect(invokeAction("direct-test", {
      element: document.body, event: new Event("click"), parameters: {}, arguments: {},
    })).rejects.toBe(failure)
  })
})
