import { afterEach, describe, expect, it, vi } from "vitest"
import { bind, createStore, type Binding } from "../src/state/index.js"
import { ViewElement } from "../src/core/index.js"
import { Input } from "../src/components/input/index.js"
import { App } from "../src/components/foundation.js"

class DataReceiver extends ViewElement {
  public source: unknown = null
  public text = ""
}
customElements.define("test-data-receiver", DataReceiver)
if (!customElements.get("m-app")) customElements.define("m-app", App)
const bindings: Binding[] = []
const attach = (root: ParentNode, state: Record<string, unknown>) => {
  const store = createStore(state)
  const binding = bind(root, store)
  bindings.push(binding)
  return { store, binding }
}
afterEach(() => { bindings.splice(0).forEach(stop => stop()); document.body.replaceChildren() })

describe("explicit scoped binding", () => {
  it("passes real dataset values without serialization or global lookup", () => {
    document.body.innerHTML = '<test-data-receiver data-bind-source="report.rows"></test-data-receiver>'
    const rows = [{ month: "January", sales: 120 }]
    const { store } = attach(document.body, { report: { rows } })
    const receiver = document.querySelector("test-data-receiver") as DataReceiver
    expect(receiver.source).toBe(rows)
    const next = { month: ["February"], sales: [180] }
    store.set("report.rows", next)
    expect(receiver.source).toBe(next)
  })

  it("uses literal text and an explicit escape for a component text property", () => {
    document.body.innerHTML = '<span data-bind-text="title"></span><test-data-receiver data-bind-prop-text="title"></test-data-receiver>'
    const { store } = attach(document.body, { title: "<img src=x onerror=alert(1)>" })
    expect(document.querySelector("img")).toBeNull()
    expect(document.querySelector("span")!.textContent).toBe(store.get("title"))
    expect((document.querySelector("test-data-receiver") as DataReceiver).text).toBe(store.get("title"))
  })

  it("rejects executable nested data and does not invoke accessors", () => {
    const receiver = new DataReceiver()
    receiver.setAttribute("data-bind-source", "rows")
    const getter = vi.fn(() => [])
    for (const rows of [{ callback: () => {} }, { node: document.body }, Object.defineProperty({}, "rows", { get: getter, enumerable: true })]) {
      expect(() => bind(receiver, createStore({ rows }))).toThrow()
      expect(receiver.source).toBeNull()
    }
    expect(getter).not.toHaveBeenCalled()
  })

  it("rejects executable text destinations", () => {
    const script = document.createElement("script")
    script.setAttribute("data-bind-text", "text")
    expect(() => bind(script, createStore({ text: "alert(1)" }))).toThrow("Unsafe")
  })

  it("rejects unsupported structural directives instead of claiming they are active", () => {
    const template = document.createElement("template")
    template.setAttribute("data-each", "rows")
    expect(() => bind(template, createStore({ rows: [] }))).toThrow("not implemented")
  })

  it("does not coerce strings into native Boolean state", () => {
    const button = document.createElement("button")
    button.setAttribute("data-bind-disabled", "busy")
    expect(() => bind(button, createStore({ busy: "false" }))).toThrow("scalar type")
    expect(button.disabled).toBe(false)
  })

  it("disposes idempotently without releasing a later owner's root", () => {
    const root = document.createElement("div"), store = createStore()
    const first = bind(root, store)
    first()
    const second = bind(root, store)
    first()
    expect(() => bind(root, store)).toThrow("overlap")
    second()
  })

  it("encodes ARIA false as text, presence false as absence, and removes null attributes", () => {
    document.body.innerHTML = '<button data-bind-attr-disabled="disabled" data-bind-attr-aria-expanded="expanded" data-bind-attr-title="title">Action</button>'
    const { store } = attach(document.body, { disabled: false, expanded: false, title: "Help" })
    const button = document.querySelector("button")!
    expect(button.disabled).toBe(false)
    expect(button.getAttribute("aria-expanded")).toBe("false")
    store.set("disabled", true)
    store.set("title", null)
    expect(button.disabled).toBe(true)
    expect(button.hasAttribute("title")).toBe(false)
    expect(() => store.set("disabled", "false")).toThrow("Boolean")
    expect(button.disabled).toBe(true)
  })

  it.each(["inner-html", "outer-html", "onclick", "constructor", "style", "text-content", "not-a-property", "attr-src", "attr-onclick", "attr-style"])("rejects unsafe or unknown target %s", target => {
    const root = document.createElement("div")
    root.setAttribute(`data-bind-${target}`, "value")
    expect(() => bind(root, createStore({ value: "test" }))).toThrow()
  })

  it("rejects overlapping roots and competing destinations without leaking subscriptions", () => {
    document.body.innerHTML = '<input data-bind-value="name" data-model-value="name" data-model-event="input">'
    const conflictingStore = createStore({ name: "Original" })
    const subscribe = vi.spyOn(conflictingStore, "subscribe")
    expect(() => bind(document.body, conflictingStore)).toThrow()
    expect(subscribe).not.toHaveBeenCalled()
    document.querySelector("input")!.removeAttribute("data-bind-value")
    const { store, binding } = attach(document.body, { name: "Original" })
    expect(() => bind(document.body, store)).toThrow("overlap")
    expect(() => bind(document.querySelector("input")!, store)).toThrow("overlap")
    binding()
    const child = bind(document.querySelector("input")!, store)
    expect(() => bind(document.body, store)).toThrow("overlap")
    child()
  })

  it("requires explicit model events and uses only the declared native owner", () => {
    const field = new Input()
    field.setAttribute("aria-label", "Name")
    field.setAttribute("data-model-value", "name")
    document.body.append(field)
    const store = createStore({ name: "Original" })
    expect(() => bind(field, store)).toThrow("explicit")
    field.setAttribute("data-model-event", "input change")
    field.setAttribute("data-model-target", "native")
    const binding = bind(field, store)
    bindings.push(binding)
    const setter = vi.spyOn(field, "value", "set")
    field.native.value = "Edited"
    field.native.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    expect(store.get("name")).toBe("Edited")
    expect(setter).not.toHaveBeenCalled()
    field.value = "Ignored"
    field.dispatchEvent(new Event("input"))
    expect(store.get("name")).toBe("Edited")
    binding()
    field.native.dispatchEvent(new Event("change", { bubbles: true }))
    expect(store.get("name")).toBe("Edited")
  })

  it("refreshes changed directives and releases removed nodes without duplicating listeners", () => {
    document.body.innerHTML = '<input data-model-value="first" data-model-event="input">'
    const { store, binding } = attach(document.body, { first: "A", second: "B" })
    const input = document.querySelector("input")!
    const writes = vi.spyOn(store, "set")
    binding.refresh()
    input.value = "C"
    input.dispatchEvent(new Event("input"))
    expect(writes).toHaveBeenCalledOnce()
    input.setAttribute("data-model-value", "second")
    binding.refresh()
    expect(input.value).toBe("B")
    input.remove()
    binding.refresh()
    store.set("second", "D")
    expect(input.value).toBe("B")
    input.dispatchEvent(new Event("input"))
    expect(store.get("second")).toBe("D")
    binding()
    expect(() => binding.refresh()).toThrow("disposed")
  })

  it("does not destroy another bound subtree with a text assignment", () => {
    document.body.innerHTML = '<div data-bind-text="name"><input data-bind-value="name"></div>'
    expect(() => bind(document.body, createStore({ name: "A" }))).toThrow("subtree")
    expect(document.querySelector("input")).not.toBeNull()
  })

  it("rolls back listeners/subscriptions on a failed initial assignment and permits retry", () => {
    document.body.innerHTML = '<span data-bind-text="name"></span><span data-bind-text="bad"></span>'
    const store = createStore({ name: "A", bad: {} })
    expect(() => bind(document.body, store)).toThrow("scalar")
    store.set("name", "B")
    expect(document.querySelector("span")!.textContent).toBe("A")
    store.set("bad", "Fixed")
    const stop = bind(document.body, store)
    bindings.push(stop)
    expect(document.querySelector("span")!.textContent).toBe("B")
  })

  it("restarts App bindings after reconnect without resetting the store or retaining removed nodes", async () => {
    document.body.innerHTML = '<m-app><script type="application/json" data-m-state>{"name":"A"}</script><span data-bind-text="name"></span></m-app>'
    await Promise.resolve()
    const app = document.querySelector("m-app") as App
    const span = app.querySelector("span")!
    app.remove()
    app.store.set("name", "B")
    expect(span.textContent).toBe("A")
    document.body.append(app)
    await Promise.resolve()
    expect(span.textContent).toBe("B")
    span.remove()
    await Promise.resolve()
    app.store.set("name", "C")
    expect(span.textContent).toBe("B")
  })
})
