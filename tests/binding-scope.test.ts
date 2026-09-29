import { describe, expect, it, vi } from "vitest"
import { createStore } from "../src/state/index.js"
import { BindingScope, keyedItems } from "../src/state/scope.js"

function fixture() {
  const first = { id: "a", name: "A", children: [{ id: 1, name: "One" }, { id: 2, name: "Two" }] }
  const second = { id: "b", name: "B", children: [{ id: 1, name: "Other one" }] }
  const store = createStore({
    title: "Root", rows: [first, second],
    $item: { name: "Literal item" }, $root: { title: "Literal root" }, $index: 42, $key: "Literal key",
    $parent: { name: "Literal parent" }
  })
  const root = new BindingScope(store)
  return { store, root, first, second, item: root.each("rows", "id", "a") }
}

describe("internal binding scope routes", () => {
  it("keeps root dollar paths literal and enables context only in template scopes", () => {
    const { root, item, store, first } = fixture()
    expect(root.read("$item.name")).toBe("Literal item")
    expect(root.read("$root.title")).toBe("Literal root")
    expect(root.read("$index")).toBe(42)
    expect(root.read("$key")).toBe("Literal key")
    expect(root.read("$parent.name")).toBe("Literal parent")
    root.write("$item.name", "Still literal")
    expect(store.get("$item.name")).toBe("Still literal")
    expect(item.read("$item")).toBe(first)
    expect(item.read("$root")).toBe(store.state)
    expect(item.read("$root.title")).toBe("Root")
    expect(item.read("title")).toBe("Root")
    expect(item.read("$key")).toBe("a")
    expect(item.read("$index")).toBe(0)
    expect(() => item.read("$parent")).toThrow("Unavailable")
  })

  it("does not let conditional scopes add an item/parent level", () => {
    const { root, item, first } = fixture()
    const condition = root.template()
    expect(condition.read("$root.title")).toBe("Root")
    expect(() => condition.read("$item")).toThrow("Unavailable")
    const nestedCondition = item.template().template()
    expect(nestedCondition.read("$item")).toBe(first)
    expect(() => nestedCondition.read("$parent")).toThrow("Unavailable")
    const child = nestedCondition.each("$item.children", "id", 2).template()
    expect(child.read("$parent")).toBe(first)
    expect(child.read("$parent.name")).toBe("A")
    expect(child.read("$item.name")).toBe("Two")
  })

  it("retains record references and resolves current indices after replacement and reorder", () => {
    const { store, item, second } = fixture()
    const replacement = { id: "a", name: "New A", children: [] }
    store.set("rows", [second, replacement])
    expect(item.read("$item")).toBe(replacement)
    expect(item.read("$item.name")).toBe("New A")
    expect(item.read("$index")).toBe(1)
    const write = vi.spyOn(store, "set")
    const notify = vi.fn()
    store.subscribe("rows.1.name", notify)
    item.write("$item.name", "Edited")
    expect(write).toHaveBeenCalledExactlyOnceWith("rows.1.name", "Edited")
    expect(notify).toHaveBeenCalledExactlyOnceWith("Edited", "rows.1.name")
    expect(second.name).toBe("B")
  })

  it("resolves every nested stable key at write time, including parent models", () => {
    const { store, item, second } = fixture()
    const child = item.each("$item.children", "id", 2)
    const replacement = { id: "a", name: "New A", children: [{ id: 2, name: "New Two" }, { id: 1, name: "New One" }] }
    store.set("rows", [second, replacement])
    expect(child.read("$index")).toBe(0)
    expect(child.read("$parent")).toBe(replacement)
    const write = vi.spyOn(store, "set")
    child.write("$item.name", "Edited Two")
    expect(write).toHaveBeenLastCalledWith("rows.1.children.0.name", "Edited Two")
    child.write("$parent.name", "Edited A")
    expect(write).toHaveBeenLastCalledWith("rows.1.name", "Edited A")
    child.write("$root.title", "Edited Root")
    expect(store.get("title")).toBe("Edited Root")
    expect(second.children[0]!.name).toBe("Other one")
  })

  it("allows explicit root collections in nested contexts without confusing their route", () => {
    const { root, store, item, first } = fixture()
    const independent = item.each("$root.rows", "id", "b")
    expect(independent.read("$parent")).toBe(first)
    independent.write("$item.name", "Root B")
    expect(store.get("rows.1.name")).toBe("Root B")
    const literal = new BindingScope(createStore({ $item: [{ id: "x" }] }))
    expect(literal.each("$item", "id", "x").read("$key")).toBe("x")
    expect(root.collection("rows", "id").size).toBe(2)
  })

  it.each(["$item", "$item.id", "$root.rows", "$root.rows.0", "$root.rows.0.id", "rows.0.id"])(
    "rejects key writes through %s before calling the store", path => {
      const { store, item, first } = fixture()
      const write = vi.spyOn(store, "set")
      expect(() => item.write(path, "changed")).toThrow("item key")
      expect(write).not.toHaveBeenCalled()
      expect(first.id).toBe("a")
    }
  )

  it("protects nested key paths and ancestors using segments, not string prefixes", () => {
    const store = createStore({ rows: [{ identity: { id: "a", label: "Name" }, identityExtra: "OK" }] })
    const item = new BindingScope(store).each("rows", "identity.id", "a")
    for (const path of ["$item.identity", "$item.identity.id", "$item"]) {
      expect(() => item.write(path, {})).toThrow("item key")
    }
    item.write("$item.identity.label", "New label")
    item.write("$item.identityExtra", "New extra")
    expect(store.get("rows.0.identity.label")).toBe("New label")
    expect(store.get("rows.0.identityExtra")).toBe("New extra")
  })

  it("protects enclosing keys, even from a nested independent root collection", () => {
    const { item, store } = fixture()
    const child = item.each("$root.rows", "id", "b")
    for (const path of ["$parent.id", "$parent", "$root.rows.0.id"]) {
      expect(() => child.write(path, {})).toThrow("item key")
    }
    expect(store.get("rows.0.id")).toBe("a")
  })

  it.each(["$index", "$key", "$root"])("keeps %s read-only inside templates", path => {
    const { store, item } = fixture()
    const write = vi.spyOn(store, "set")
    expect(() => item.write(path, 3)).toThrow("read-only")
    expect(write).not.toHaveBeenCalled()
  })

  it.each(["$index.value", "$key.value"])("rejects child paths on %s", path => {
    const { item } = fixture()
    expect(() => item.read(path)).toThrow("child paths")
    expect(() => item.write(path, 3)).toThrow("child paths")
  })

  it("cannot recreate a removed item or use it to write an unrelated root field", () => {
    const { store, item, second } = fixture()
    const child = item.each("$item.children", "id", 2)
    store.set("rows", [second])
    const write = vi.spyOn(store, "set")
    for (const scope of [item, child]) {
      expect(() => scope.read("$item")).toThrow("no longer exists")
      expect(() => scope.write("$item.name", "Wrong")).toThrow("no longer exists")
      expect(() => scope.write("$root.title", "Wrong")).toThrow("no longer exists")
    }
    expect(write).not.toHaveBeenCalled()
    expect(store.state.rows).toEqual([second])
  })

  it("rejects removed children and ambiguous replacement collections without stale writes", () => {
    const { store, item, first } = fixture()
    const child = item.each("$item.children", "id", 2)
    store.set("rows.0.children", [{ id: 1, name: "Only one" }])
    expect(() => child.write("$item.name", "Wrong")).toThrow("no longer exists")
    store.set("rows", [first, { ...first }])
    expect(() => item.write("$item.name", "Wrong")).toThrow("unique keys")
    expect(first.name).toBe("A")
    store.set("rows", [first])
    item.write("$item.name", "Corrected")
    expect(first.name).toBe("Corrected")
  })

  it("invalidates descendants on disposal without invalidating the parent or sibling", () => {
    const { root, item, store } = fixture()
    const condition = item.template()
    const child = condition.each("$item.children", "id", 1)
    const sibling = item.each("$item.children", "id", 2)
    condition.dispose()
    condition.dispose()
    expect(() => condition.read("$root.title")).toThrow("disposed")
    expect(() => child.write("$item.name", "Wrong")).toThrow("disposed")
    sibling.write("$item.name", "Still live")
    expect(item.read("$item.name")).toBe("A")
    expect(store.get("rows.0.children.1.name")).toBe("Still live")
    root.dispose()
    expect(() => item.template()).toThrow("disposed")
    expect(() => sibling.read("$item")).toThrow("disposed")
    expect(() => root.each("rows", "id", "a")).toThrow("disposed")
  })

  it("does not retain a stale record after a synchronous notification replaces the collection", () => {
    const { store, item } = fixture()
    let replaced = false
    store.subscribe("rows.0.name", () => {
      if (replaced) return
      replaced = true
      store.set("rows", [{ id: "a", name: "Replacement", children: [] }])
    })
    item.write("$item.name", "First edit")
    expect(item.read("$item.name")).toBe("Replacement")
    item.write("$item.newField", "Next edit")
    expect(store.get("rows.0.newField")).toBe("Next edit")
  })

  it("does not promise state rollback when a store subscriber throws", () => {
    const { store, item } = fixture()
    const stop = store.subscribe("rows", () => { throw new Error("Subscriber failed") })
    expect(() => item.write("$item.name", "Applied")).toThrow("Subscriber failed")
    expect(store.get("rows.0.name")).toBe("Applied")
    stop()
    item.write("$item.name", "Retry")
    expect(item.read("$item.name")).toBe("Retry")
  })
})

describe("scope plain data and collection preparation", () => {
  it("allows empty and bounded dense collections without copying records", () => {
    expect(keyedItems([], "id").size).toBe(0)
    const rows = Array.from({ length: 1000 }, (_, id) => ({ id }))
    const prepared = keyedItems(rows, "id")
    expect(prepared.size).toBe(1000)
    expect(prepared.get(999)).toEqual({ item: rows[999], index: 999 })
    expect(prepared.get(999)!.item).toBe(rows[999])
    expect(() => keyedItems([...rows, { id: 1000 }], "id")).toThrow("1000")
  })

  it("distinguishes numeric and string keys and supports null-prototype records", () => {
    const record = Object.assign(Object.create(null), { id: "1" })
    const prepared = keyedItems([{ id: 1 }, record, { id: -1 }, { id: Number.MAX_SAFE_INTEGER }], "id")
    expect(prepared.size).toBe(4)
    expect(prepared.get("1")!.item).toBe(record)
    expect(() => keyedItems([{ id: 0 }, { id: -0 }], "id")).toThrow("unique keys")
  })

  it.each([undefined, null, {}, "rows", new Set(), new Array(2), [{ id: 1 }, , { id: 3 }]])(
    "rejects a missing, non-array or sparse collection (%j)", rows => {
      expect(() => keyedItems(rows, "id")).toThrow()
    }
  )

  it.each([undefined, null, "", true, false, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, {}, [], 1n, Symbol("key")])(
    "rejects an invalid item key (%s)", key => {
      expect(() => keyedItems([{ id: key }], "id")).toThrow()
    }
  )

  it("validates every key and nested value before returning a prepared collection", () => {
    const nestedGetter = vi.fn()
    const bad = Object.defineProperty({ id: 2 }, "content", { get: nestedGetter })
    for (const rows of [[{ id: 1 }, { id: 1 }], [{ id: 1 }, {}], [{ id: 1 }, bad], [{ id: 1 }, { id: 2, callback() {} }]]) {
      expect(() => keyedItems(rows, "id")).toThrow()
    }
    expect(nestedGetter).not.toHaveBeenCalled()
    const cyclic: Record<string, unknown> = { id: 1 }
    cyclic.self = cyclic
    expect(() => keyedItems([cyclic], "id")).toThrow("circular")
  })

  it("rejects symbol data members without invoking them", () => {
    const getter = vi.fn()
    const record = Object.defineProperty({ id: "a" }, Symbol("hidden"), { get: getter })
    expect(() => keyedItems([record], "id")).toThrow("Unsafe")
    const { item } = fixture()
    expect(() => item.write("$item.content", { [Symbol("hidden")]: () => {} })).toThrow("Unsafe")
    expect(getter).not.toHaveBeenCalled()
  })

  it("never invokes accessors while resolving collections, keys or model destinations", () => {
    const getter = vi.fn(() => [{ id: 1 }]), setter = vi.fn()
    const store = createStore(Object.defineProperty({}, "rows", { get: getter, set: setter }))
    const root = new BindingScope(store)
    expect(() => root.read("rows")).toThrow("accessors")
    expect(() => root.each("rows", "id", 1)).toThrow("accessors")
    expect(() => root.write("rows", [])).toThrow("accessors")
    const rows = [{ id: 1 }]
    Object.defineProperty(rows, 0, { get: getter })
    expect(() => keyedItems(rows, "id")).toThrow("Unsafe")
    const key = Object.defineProperty({}, "id", { get: getter })
    expect(() => keyedItems([key], "id")).toThrow("Unsafe")
    expect(getter).not.toHaveBeenCalled()
    expect(setter).not.toHaveBeenCalled()
  })

  it.each(["", "a..b", "a[0]", " a", "a()", "__proto__.x", "a.constructor.x", "a.prototype.x", "a.01"])(
    "rejects unsafe scope and key paths (%s)", path => {
      const { item, root } = fixture()
      expect(() => item.read(path)).toThrow()
      expect(() => item.write(path, true)).toThrow()
      expect(() => root.each(path, "id", "a")).toThrow()
      expect(() => root.each("rows", path, "a")).toThrow()
      expect(() => keyedItems([], path)).toThrow()
    }
  )

  it("does not read inherited keys, array subclasses, dates or executable data", () => {
    class Rows extends Array {}
    expect(() => keyedItems(new Rows({ id: 1 }), "id")).toThrow("plain arrays")
    expect(() => keyedItems([Object.create({ id: 1 })], "id")).toThrow("plain data")
    const root = new BindingScope(createStore({ value: new Date(), name: "Plain" }))
    expect(root.read("toString")).toBeUndefined()
    expect(() => root.read("value")).toThrow("plain data")
    expect(() => root.write("name", () => {})).toThrow("plain data")
    expect(root.read("name")).toBe("Plain")
  })

  it("creates missing own records through the store but does not cross scalars", () => {
    const { item, store } = fixture()
    expect(item.read("$item.name.note")).toBeUndefined()
    item.write("$item.extra.note", "New")
    expect(store.get("rows.0.extra.note")).toBe("New")
    expect(() => item.write("$item.name.note", "Wrong")).toThrow("plain data")
    expect(store.get("rows.0.name")).toBe("A")
  })

  it("rejects frozen destinations and nonextensible parents before store mutation", () => {
    const frozen = Object.freeze({ value: "Original" })
    const fixed = Object.preventExtensions({ existing: { value: "Original" } })
    const store = createStore({ frozen, fixed })
    const root = new BindingScope(store)
    const write = vi.spyOn(store, "set")
    for (const path of ["frozen.value", "frozen.missing.child", "fixed.missing.child"]) {
      expect(() => root.write(path, "Wrong")).toThrow("writable")
    }
    expect(write).not.toHaveBeenCalled()
    root.write("fixed.existing.value", "Allowed")
    expect(store.get("fixed.existing.value")).toBe("Allowed")
  })

  it("does not invoke destination setters or grow a fixed-length array", () => {
    const setter = vi.fn()
    const store = createStore({ record: Object.defineProperty({}, "field", { set: setter }), rows: ["Original"] })
    Object.defineProperty(store.state.rows, "length", { writable: false })
    const root = new BindingScope(store)
    const write = vi.spyOn(store, "set")
    expect(() => root.write("record.field.child", "Wrong")).toThrow("accessors")
    expect(() => root.write("rows.1", "Wrong")).toThrow("cannot grow")
    expect(setter).not.toHaveBeenCalled()
    expect(write).not.toHaveBeenCalled()
    root.write("rows.0", "Allowed")
    expect(store.get("rows.0")).toBe("Allowed")
    root.write("rows.4294967295", "Not an array index")
    expect(store.get("rows.4294967295")).toBe("Not an array index")
    expect(store.get("rows.length")).toBe(1)
  })

  it("rejects array length model writes without truncation but allows ordinary length fields", () => {
    const { item, store } = fixture()
    const write = vi.spyOn(store, "set")
    expect(() => item.write("$root.rows.length", 0)).toThrow("read-only")
    expect(() => item.write("$item.children.length", 0)).toThrow("read-only")
    expect(write).not.toHaveBeenCalled()
    expect(store.state.rows).toHaveLength(2)
    expect(store.get("rows.0.children")).toHaveLength(2)
    item.write("$item.length", 3)
    expect(store.get("rows.0.length")).toBe(3)
    item.write("$item.children", [])
    expect(store.get("rows.0.children")).toEqual([])
  })
})
