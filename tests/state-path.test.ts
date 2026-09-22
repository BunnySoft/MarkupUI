import { describe, expect, it, vi } from "vitest"
import { createStore } from "../src/state/index.js"
import { readPath } from "../src/state/path.js"

describe("safe state paths", () => {
  it.each(["", ".", "a..b", " a", "a ", "a[0]", "a()", "a + b", "__proto__.polluted", "a.constructor.x", "a.prototype.x", "a.01"])("rejects %j on every store operation", path => {
    const store = createStore({})
    expect(() => store.get(path)).toThrow(TypeError)
    expect(() => store.set(path, true)).toThrow(TypeError)
    expect(() => store.subscribe(path, vi.fn())).toThrow(TypeError)
    expect(store.state).toEqual({})
    expect(Object.hasOwn(Object.prototype, "polluted")).toBe(false)
  })

  it("reads only own values and creates own records without mutating inherited records", () => {
    const inherited = { private: { value: "original" } }
    const state = Object.create(inherited)
    const store = createStore(state)
    expect(store.get("private.value")).toBeUndefined()
    store.set("private.value", "new")
    expect(inherited.private.value).toBe("original")
    expect(store.get("private.value")).toBe("new")
  })

  it("updates array paths without replacing the array and notifies parent and child subscribers", () => {
    const rows = [{ sales: 120 }]
    const store = createStore({ report: { rows } })
    const parent = vi.fn(), child = vi.fn(), unrelated = vi.fn()
    const stop = store.subscribe("report.rows", parent)
    store.subscribe("report.rows.0.sales", child)
    store.subscribe("report.other", unrelated)
    store.set("report.rows.0.sales", 180)
    expect(store.get("report.rows")).toBe(rows)
    expect(parent).toHaveBeenLastCalledWith(rows, "report.rows")
    expect(child).toHaveBeenLastCalledWith(180, "report.rows.0.sales")
    expect(unrelated).not.toHaveBeenCalled()
    stop()
    store.set("report.rows", [{ sales: 200 }])
    expect(parent).toHaveBeenCalledOnce()
    expect(child).toHaveBeenLastCalledWith(200, "report.rows.0.sales")
  })

  it("does not destroy a scalar to create a nested path", () => {
    const store = createStore({ report: 5 })
    expect(() => store.set("report.sales", 100)).toThrow(TypeError)
    expect(store.state.report).toBe(5)
    expect(readPath({ data: { rows: [] } }, "data.rows")).toEqual([])
  })
})
