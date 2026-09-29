import { afterEach, describe, expect, it, vi } from "vitest"
import { bind, createStore, type Binding, type BindingOptions } from "../src/state/index.js"
import { Input } from "../src/components/input/index.js"
import { App } from "../src/components/foundation.js"

const bindings: Binding[] = []
const rows = () => [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }]
function setup(markup: string, state: Record<string, unknown>, options?: BindingOptions) {
  document.body.innerHTML = markup
  const store = createStore(state)
  const binding = bind(document.body, store, options)
  bindings.push(binding)
  return { store, binding }
}
const each = '<template data-each="rows" data-each-key="id"><label><span data-bind-text="$index"></span><input data-model-value="$item.name" data-model-event="input"></label></template>'
class LateField extends HTMLElement {
  public value = ""
  public native: HTMLInputElement | undefined
  public connectedCallback(): void {
    this.native ??= document.createElement("input")
    this.append(this.native)
  }
}
class MissingField extends HTMLElement {
  public value = ""
}
class ReentrantField extends HTMLElement {
  public static change: (() => void) | undefined
  private current = ""
  public get value(): string { return this.current }
  public set value(value: string) { this.current = value; ReentrantField.change?.() }
}
customElements.define("test-template-late-field", LateField)
customElements.define("test-template-missing-field", MissingField)
customElements.define("test-template-reentrant-field", ReentrantField)
afterEach(() => { bindings.splice(0).forEach(stop => stop()); document.body.replaceChildren() })

describe("inline Web structural binding", () => {
  it("batches contiguous fallback moves without moving already-positioned instances", () => {
    const { store } = setup(each, { rows: Array.from({ length: 20 }, (_, id) => ({ id, name: String(id) })) })
    Object.defineProperty(document.body, "moveBefore", { configurable: true, value: undefined })
    const inputs = [...document.querySelectorAll("input")]
    const insert = vi.spyOn(document.body, "insertBefore")
    try {
      store.set("rows", [...store.get<any[]>("rows")].reverse())
      expect(insert).toHaveBeenCalledTimes(1)
      expect(insert.mock.calls[0]![0]).toBeInstanceOf(DocumentFragment)
      expect([...document.querySelectorAll("input")]).toEqual([...inputs].reverse())
      insert.mockClear()
      store.set("rows.0.name", "Updated")
      expect(insert).not.toHaveBeenCalled()
    } finally { insert.mockRestore(); delete (document.body as any).moveBefore }
  })

  it("preserves keyed identity through all four-item fallback permutations and mixed insertion", () => {
    const { store } = setup(each, { rows: Array.from({ length: 4 }, (_, id) => ({ id, name: String(id) })) })
    Object.defineProperty(document.body, "moveBefore", { configurable: true, value: undefined })
    const inputs = [...document.querySelectorAll("input")]
    const permutations = (items: number[]): number[][] => items.length
      ? items.flatMap((value, index) => permutations(items.filter((_, i) => i !== index)).map(tail => [value, ...tail])) : [[]]
    try {
      for (const order of [...permutations([0, 1, 2, 3]), [4, 1, 3, 0, 5], [0, 4, 3, 5, 1], []]) {
        store.set("rows", order.map(id => ({ id, name: String(id) })))
        const actual = [...document.querySelectorAll("input")]
        expect(actual.map(input => input.value)).toEqual(order.map(String))
        order.forEach((id, index) => { if (id < 4) expect(actual[index]).toBe(inputs[id]) })
      }
    } finally { delete (document.body as any).moveBefore }
  })

  it("creates strict conditions, updates root context, removes listeners, and recreates", () => {
    const { store } = setup('<template data-if="visible"><input data-model-value="$root.name" data-model-event="input"></template>', { visible: false, name: "A" })
    expect(document.querySelector("input")).toBeNull()
    store.set("visible", true)
    const input = document.querySelector("input")!
    expect(input.value).toBe("A")
    store.set("name", "B")
    expect(input.value).toBe("B")
    store.set("visible", false)
    expect(input.isConnected).toBe(false)
    input.value = "stale"
    input.dispatchEvent(new Event("input"))
    expect(store.get("name")).toBe("B")
    store.set("visible", true)
    expect(document.querySelector("input")).not.toBe(input)
  })

  it.each([null, undefined, 0, 1, "", "false", [], {}])("rejects non-Boolean conditions %j without replacing an existing instance", value => {
    const { store } = setup('<template data-if="visible"><span>Kept</span></template>', { visible: true })
    const span = document.querySelector("span")
    expect(() => store.set("visible", value)).toThrow("Boolean")
    expect(document.querySelector("span")).toBe(span)
    store.set("visible", false)
    expect(document.querySelector("span")).toBeNull()
  })

  it("retains nodes and drafts, updates indices and writes through current keys", () => {
    const { store } = setup(each, { rows: rows() })
    const [a, b] = [...document.querySelectorAll("input")]
    a!.value = "Uncommitted"
    store.set("rows", rows().reverse())
    expect([...document.querySelectorAll("input")]).toEqual([b, a])
    expect(a!.value).toBe("Uncommitted")
    expect([...document.querySelectorAll("span")].map(node => node.textContent)).toEqual(["0", "1"])
    a!.dispatchEvent(new Event("input"))
    expect(store.get("rows.1.name")).toBe("Uncommitted")
    expect(store.get("rows.0.name")).toBe("Beta")
    store.set("rows.1.name", "Changed")
    expect(a!.value).toBe("Changed")
  })

  it("retargets same-key replacement and distinguishes numeric/string keys", () => {
    const { store } = setup(each, { rows: [{ id: 1, name: "Number" }, { id: "1", name: "String" }] })
    const [number, string] = [...document.querySelectorAll("input")]
    store.set("rows", [{ id: "1", name: "New string" }, { id: 1, name: "New number" }])
    expect([...document.querySelectorAll("input")]).toEqual([string, number])
    expect(number!.value).toBe("New number")
    string!.value = "Written"
    string!.dispatchEvent(new Event("input"))
    expect(store.get("rows.0.name")).toBe("Written")
  })

  it("resolves nested items and parents through conditions and reordered parents", () => {
    const state = { groups: [{ id: "g", name: "Group", show: true, rows: rows() }, { id: "h", name: "Other", show: true, rows: [] }], title: "Root" }
    const { store } = setup('<template data-each="groups" data-each-key="id"><section><template data-if="$item.show"><div><template data-each="$item.rows" data-each-key="id"><label><span data-bind-text="$parent.name"></span><b data-bind-text="$root.title"></b><input data-model-value="$item.name" data-model-event="input"></label></template></div></template></section></template>', state)
    const input = document.querySelector("input")!
    store.set("groups", [...state.groups].reverse())
    store.set("groups.1.rows", rows().reverse())
    input.value = "Moved"
    input.dispatchEvent(new Event("input"))
    expect(store.get("groups.1.rows.1.name")).toBe("Moved")
    store.set("groups.1.name", "Renamed")
    expect(document.querySelector("span")!.textContent).toBe("Renamed")
    store.set("title", "Updated")
    expect(document.querySelector("b")!.textContent).toBe("Updated")
  })

  it.each([
    [{ id: "a", name: "One" }, { id: "a", name: "Two" }],
    [{ name: "No key" }],
    [{ id: "", name: "Empty" }],
    null, {}, new Array(2),
    Array.from({ length: 1001 }, (_, id) => ({ id, name: "" })),
  ])("preflights the complete key set %j", next => {
    const { store } = setup(each, { rows: rows() })
    const before = [...document.querySelectorAll("label")]
    expect(() => store.set("rows", next)).toThrow()
    expect([...document.querySelectorAll("label")]).toEqual(before)
    store.set("rows", [])
    expect(document.querySelectorAll("label")).toHaveLength(0)
  })

  it("validates all item values before changing a surviving region", () => {
    const { store } = setup(each, { rows: rows() })
    const before = [...document.querySelectorAll("input")]
    expect(() => store.set("rows", [{ id: "b", name: "Changed" }, { id: "c", name: {} }])).toThrow()
    expect([...document.querySelectorAll("input")]).toEqual(before)
    expect(before.map(input => input.value)).toEqual(["Alpha", "Beta"])
  })

  it.each([
    '<template data-each="rows"><span></span></template>',
    '<template data-each="rows" data-each-key="id"><span></span><span></span></template>',
    '<template data-each="rows" data-each-key="id">Text<span></span></template>',
    '<template data-each="rows" data-each-key="id"><span id="fixed"></span></template>',
    '<template data-each="rows" data-each-key="id"><span id="fixed" data-bind-attr-id="$item.id"></span></template>',
    '<template data-each="rows" data-each-key="id"><div><template data-if="$item.show"><span id="nested"></span></template></div></template>',
    '<template data-if="show"><input data-bind-onclick="name"></template>',
    '<template data-if="show"><div data-bind-text="name"><input data-bind-value="name"></div></template>',
    '<template data-if="show" data-each="rows" data-each-key="id"><span></span></template>',
  ])("validates inactive source syntax: %s", markup => {
    document.body.innerHTML = markup
    expect(() => bind(document.body, createStore({ show: false, rows: [], name: "A" }))).toThrow()
    expect(document.body.children).toHaveLength(1)
  })

  it("allows surrounding whitespace/comments and leaves ordinary templates inert", () => {
    setup('<template><input data-bind-value="unavailable"></template><template data-if="show"> \n<!--ok--><span data-bind-text="$root.name"></span>\n</template>', { show: true, name: "A" })
    expect(document.querySelector("span")!.textContent).toBe("A")
    expect(document.querySelector("input")).toBeNull()
  })

  it("keeps current DOM on stop and rebinds retained keyed instances without duplicates", () => {
    const { store, binding } = setup(each, { rows: rows() })
    const [a, b] = [...document.querySelectorAll("input")]
    binding()
    store.set("rows", rows().reverse())
    expect([...document.querySelectorAll("input")]).toEqual([a, b])
    const writes = vi.spyOn(store, "set")
    a!.value = "Ignored"
    a!.dispatchEvent(new Event("input"))
    expect(writes).not.toHaveBeenCalled()
    for (let index = 0; index < 3; index++) {
      const next = bind(document.body, store)
      expect([...document.querySelectorAll("input")]).toEqual([b, a])
      next()
    }
    bindings.push(bind(document.body, store))
    a!.value = "Edited"
    a!.dispatchEvent(new Event("input"))
    expect(writes).toHaveBeenCalledOnce()
    expect(store.get("rows.1.name")).toBe("Edited")
  })

  it("removes instances after source removal and stops detached model writes", () => {
    const { store, binding } = setup(each, { rows: rows() })
    const input = document.querySelector("input")!
    document.querySelector("template")!.remove()
    input.value = "Ignored"
    input.dispatchEvent(new Event("input"))
    expect(store.get("rows.0.name")).toBe("Alpha")
    binding.refresh()
    expect(document.querySelector("label")).toBeNull()
    input.dispatchEvent(new Event("input"))
    expect(store.get("rows.0.name")).toBe("Alpha")
  })

  it("rejects externally moved instance roots and blocks their model events", () => {
    const { store, binding } = setup(`<aside></aside>${each}`, { rows: rows() })
    const label = document.querySelector("label")!
    document.querySelector("aside")!.append(label)
    const input = label.querySelector("input")!
    input.value = "Ignored"
    input.dispatchEvent(new Event("input"))
    expect(store.get("rows.0.name")).toBe("Alpha")
    expect(() => binding.refresh()).toThrow("moved")
    document.body.insertBefore(label, document.querySelector("template"))
    binding.refresh()
    input.dispatchEvent(new Event("input"))
    expect(store.get("rows.0.name")).toBe("Ignored")
  })

  it("rejects a new binder taking a retained instance out of its original root", () => {
    const { store, binding } = setup(each, { rows: rows() })
    binding()
    expect(() => bind(document.querySelector("label")!, store)).toThrow("another binding")
  })

  it("preflights focus removal and supports an explicit surviving target", () => {
    const { store, binding } = setup(`<button>Next</button>${each}`, { rows: rows() })
    const input = document.querySelector("input")!
    input.focus()
    expect(() => store.set("rows", [])).toThrow("focusFallback")
    expect(document.querySelectorAll("label")).toHaveLength(2)
    expect(document.activeElement).toBe(input)
    binding()
    const target = document.querySelector("button")!
    const fallback = vi.fn(() => target)
    bindings.push(bind(document.body, store, { focusFallback: fallback }))
    expect(fallback).toHaveBeenCalledOnce()
    expect(document.querySelectorAll("label")).toHaveLength(0)
    expect(document.activeElement).toBe(target)
  })

  it("does not reinterpret an externally moved scoped descendant as a root model", () => {
    const { store, binding } = setup(each, { rows: rows() })
    const input = document.querySelector("input")!
    const parent = input.parentElement!
    document.body.append(input)
    input.value = "Moved"
    input.dispatchEvent(new Event("input"))
    expect(store.get("rows.0.name")).toBe("Alpha")
    expect(() => binding.refresh()).toThrow("scoped node")
    parent.append(input)
    binding.refresh()
    input.dispatchEvent(new Event("input"))
    expect(store.get("rows.0.name")).toBe("Moved")
  })

  it("replaces changed inline sources only after complete validation", () => {
    const { store, binding } = setup(each, { rows: rows() })
    const source = document.querySelector("template")!
    const original = [...document.querySelectorAll("label")]
    source.innerHTML = '<div><span data-bind-onclick="$item.name"></span></div>'
    expect(() => binding.refresh()).toThrow()
    expect([...document.querySelectorAll("label")]).toEqual(original)
    source.innerHTML = '<b data-bind-text="$item.name"></b>'
    binding.refresh()
    expect(document.querySelectorAll("label")).toHaveLength(0)
    expect([...document.querySelectorAll("b")].map(node => node.textContent)).toEqual(["Alpha", "Beta"])
    store.set("rows.0.name", "Changed")
    expect(document.querySelector("b")!.textContent).toBe("Changed")
  })

  it("binds a model owner that becomes available on connection", () => {
    const { store } = setup('<template data-if="show"><test-template-late-field data-model-value="$root.name" data-model-event="input" data-model-target="native"></test-template-late-field></template>', { show: true, name: "Initial" })
    const field = document.querySelector("test-template-late-field") as LateField
    expect(field.value).toBe("Initial")
    field.value = "Edited"
    field.native!.dispatchEvent(new Event("input", { bubbles: true }))
    expect(store.get("name")).toBe("Edited")
  })

  it("removes newly attached instances and listeners when native initialization fails", () => {
    document.body.innerHTML = '<template data-if="show"><test-template-missing-field data-model-value="$root.name" data-model-event="input" data-model-target="native"></test-template-missing-field></template>'
    const store = createStore({ show: true, name: "Initial" })
    expect(() => bind(document.body, store)).toThrow("after attachment")
    expect(document.querySelector("test-template-missing-field")).toBeNull()
    document.querySelector("template")!.innerHTML = '<input data-model-value="$root.name" data-model-event="input">'
    bindings.push(bind(document.body, store))
    expect(document.querySelector("input")!.value).toBe("Initial")
  })

  it("queues reentrant store updates until the current tree is consistent", () => {
    document.body.innerHTML = '<template data-each="rows" data-each-key="id"><test-template-reentrant-field data-bind-value="$item.name"></test-template-reentrant-field></template>'
    const store = createStore({ rows: rows() })
    let changed = false
    ReentrantField.change = () => {
      if (changed) return
      changed = true
      store.set("rows", [{ id: "b", name: "Only" }])
    }
    try {
      bindings.push(bind(document.body, store))
      const fields = document.querySelectorAll("test-template-reentrant-field")
      expect(fields).toHaveLength(1)
      expect((fields[0] as ReentrantField).value).toBe("Only")
    } finally { ReentrantField.change = undefined }
  })

  it("bounds non-settling reentrant updates and leaves a bindable root", () => {
    document.body.innerHTML = '<template data-if="show"><test-template-reentrant-field data-bind-value="$root.name"></test-template-reentrant-field></template>'
    const store = createStore({ show: true, name: "A" })
    ReentrantField.change = () => store.set("name", store.get("name") === "A" ? "B" : "A")
    try { expect(() => bind(document.body, store)).toThrow("did not settle") }
    finally { ReentrantField.change = undefined }
    bindings.push(bind(document.body, store))
    expect(document.querySelectorAll("test-template-reentrant-field")).toHaveLength(1)
  })

  it("does not revisit subscribers added during notification or lose replacements to stale disposal", () => {
    const store = createStore({ name: "A" })
    const late = vi.fn()
    let stop = () => {}
    stop = store.subscribe("name", () => { stop(); store.subscribe("name", late) })
    store.set("name", "B")
    expect(late).not.toHaveBeenCalled()
    stop()
    store.set("name", "C")
    expect(late).toHaveBeenCalledOnce()
  })

  it("preserves native focus, selection and drafts across fallback moves", () => {
    const { store } = setup(each, { rows: rows() })
    const input = document.querySelector("input")!
    input.focus()
    input.value = "Draft value"
    input.setSelectionRange(2, 5, "backward")
    store.set("rows", rows().reverse())
    expect(document.activeElement).toBe(input)
    expect(input.value).toBe("Draft value")
    expect([input.selectionStart, input.selectionEnd, input.selectionDirection]).toEqual([2, 5, "backward"])
  })

  it("upgrades selected native-owner fields detached and binds only their native events", () => {
    const { store } = setup('<template data-each="rows" data-each-key="id"><m-input aria-label="Name" data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input></template>', { rows: rows() })
    const field = document.querySelector("m-input") as Input
    expect(field).toBeInstanceOf(Input)
    expect(field.native.value).toBe("Alpha")
    field.native.value = "Composing"
    field.native.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    expect(store.get("rows.0.name")).toBe("Composing")
    field.value = "Ignored"
    field.dispatchEvent(new Event("input"))
    expect(store.get("rows.0.name")).toBe("Composing")
  })

  it("settles App-generated mutations and reuses instances on reconnect", async () => {
    if (!customElements.get("m-app")) customElements.define("m-app", App)
    const app = new App()
    app.store = createStore({ rows: rows() })
    app.innerHTML = each
    document.body.append(app)
    await Promise.resolve()
    await Promise.resolve()
    const inputs = [...app.querySelectorAll("input")]
    expect(inputs).toHaveLength(2)
    app.remove()
    app.store.set("rows", rows().reverse())
    document.body.append(app)
    await Promise.resolve()
    await Promise.resolve()
    expect([...app.querySelectorAll("input")]).toEqual(inputs.reverse())
    app.remove()
  })
})
