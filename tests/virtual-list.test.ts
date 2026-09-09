import { afterEach, describe, expect, it, vi } from "vitest"
import { createVirtualList, virtualWindow } from "../src/components/virtual-list/index.js"
import type { VirtualListController, VirtualListOptions } from "../src/components/virtual-list/index.js"

interface Item { id: number; text: string }
const helpers: VirtualListController<Item>[] = []
const data = (length = 100_000) => Array.from({ length }, (_, id) => ({ id, text: `Row ${id + 1}` }))
const render = (item: Item) => { const li = document.createElement("li"); li.textContent = item.text; return li }
function fixture(options: Partial<VirtualListOptions<Item>> = {}, height = 320) {
  const root = document.createElement("div")
  root.className = "mui-virtual-list"
  root.style.cssText = "--mui-virtual-list-height:320px;overflow-y:auto"
  root.innerHTML = '<ul class="mui-virtual-list__items"></ul>'
  document.body.append(root)
  let measuredHeight = height
  Object.defineProperty(root, "clientHeight", { get: () => measuredHeight, configurable: true })
  const list = root.firstElementChild as HTMLUListElement
  Object.defineProperty(list, "offsetHeight", { get: () => Math.round(Number.parseFloat(list.style.height || "0")), configurable: true })
  Object.defineProperty(root, "scrollHeight", { get: () => Math.max(measuredHeight, list.offsetHeight), configurable: true })
  const source = options.items ?? data()
  const helper = createVirtualList(root, {
    items: source, rowSize: 32, key: item => item.id, render,
    update: (element, item) => { element.textContent = item.text }, ...options,
  })
  helpers.push(helper)
  return { root, list, helper, source, resize: (value: number) => { measuredHeight = value; helper.refresh() } }
}
afterEach(() => {
  helpers.splice(0).forEach(helper => { try { helper.disconnect() } catch { /* Error tests assert cleanup separately. */ } })
  document.body.replaceChildren(); vi.restoreAllMocks()
})

describe("fixed-size bounded window", () => {
  it("mounts 13/16/13 rows at start/middle/end for 100,000 items", () => {
    const { helper, root, list } = fixture()
    expect(helper.state).toMatchObject({ count: 100_000, start: 0, end: 13, mounted: 13 })
    expect(list.style.height).toBe("3200000px")
    helper.scrollTo({ index: 50_000 })
    expect(root.scrollTop).toBe(1_600_000)
    expect(helper.state).toMatchObject({ start: 49_997, end: 50_013, mounted: 16 })
    helper.scrollTo({ position: "bottom" })
    expect(root.scrollTop).toBe(3_199_680)
    expect(helper.state).toMatchObject({ start: 99_987, end: 100_000, mounted: 13 })
    expect(list.lastElementChild!.textContent).toBe("Row 100000")
    expect(list.lastElementChild!.getAttribute("aria-posinset")).toBe("100000")
  })
  it("clamps empty, small, negative elastic and beyond-end windows", () => {
    expect(virtualWindow(0, 32, 320, -50, 3)).toMatchObject({ start: 0, end: 0, offset: 0 })
    expect(virtualWindow(2, 32, 320, 99, 3)).toMatchObject({ start: 0, end: 2, offset: 0 })
    expect(virtualWindow(100, 32, 320, -99, 3)).toMatchObject({ start: 0, end: 13 })
    expect(virtualWindow(100, 32, 320, 9e8, 3)).toMatchObject({ start: 87, end: 100, offset: 2880 })
    expect(virtualWindow(100, 32, 0, 50, 3)).toMatchObject({ start: 0, end: 0 })
    expect(virtualWindow(100, 32, 321, 1, 0)).toMatchObject({ start: 0, end: 11 })
  })
  it.each([
    [-1, 32, 320, 0, 3], [1_000_001, 1, 320, 0, 3], [100_000, 81, 320, 0, 3],
    [2, 0, 320, 0, 3], [2, Infinity, 320, 0, 3], [2, 32, NaN, 0, 3],
    [2, 32, 16385, 0, 3], [2, 32, -1, 0, 3], [2, 32, 320, Infinity, 3],
    [2, 32, 320, 0, -1], [2, 32, 320, 0, 51], [2, 32, 320, 0, 1.5],
    [10000, 1, 1000, 0, 3],
  ])("rejects invalid or unbounded geometry %j", (...values) => {
    expect(() => virtualWindow(...values as [number, number, number, number, number])).toThrow()
  })
  it("handles hidden, resized, empty and subsequently repopulated data", () => {
    const { helper, resize, root } = fixture()
    helper.scrollTo({ position: "bottom" }); resize(0); expect(helper.state.mounted).toBe(0)
    resize(160); expect(helper.state.mounted).toBeLessThanOrEqual(11)
    helper.setItems([]); expect(helper.state.mounted).toBe(0); expect(root.scrollTop).toBe(0)
    helper.setItems(data(2)); expect(helper.state.mounted).toBe(2)
  })
  it("supports every retained scroll alignment and rejects unsupported options atomically", () => {
    const { helper, root } = fixture()
    helper.scrollTo({ key: 500, align: "center" }); expect(root.scrollTop).toBe(15856)
    helper.scrollTo({ key: 500, align: "end" }); expect(root.scrollTop).toBe(15712)
    helper.scrollTo({ key: 500, align: "nearest" }); expect(root.scrollTop).toBe(15712)
    helper.scrollTo({ key: 499, align: "start" }); expect(root.scrollTop).toBe(15968)
    helper.scrollTo({ top: -5 }); expect(root.scrollTop).toBe(0)
    for (const options of [{ key: -1 }, { index: 1.5 }, { index: 100000 }, {}, { top: NaN },
      { left: 0 }, { index: 1, key: 1 }, { position: "left" }, { top: 10, align: "start" }, { index: 1, behavior: "smooth" }]) {
      expect(() => helper.scrollTo(options as never)).toThrow()
      expect(root.scrollTop).toBe(0); expect(helper.connected).toBe(true)
    }
  })
  it("uses the nearest edge for oversized rows and keeps a viewport already contained in a row", () => {
    const { helper, root } = fixture({ items: data(4), rowSize: 640 })
    helper.scrollTo({ top: 100 }); helper.scrollTo({ index: 0, align: "nearest" })
    expect(root.scrollTop).toBe(100)
    helper.scrollTo({ top: 400 }); helper.scrollTo({ index: 0, align: "nearest" })
    expect(root.scrollTop).toBe(320)
    helper.scrollTo({ index: 1, align: "nearest" }); expect(root.scrollTop).toBe(640)
  })
})

describe("data, keys and native ownership", () => {
  it("validates all keys before changing any DOM, including duplicate offscreen keys", () => {
    const { helper, list, source } = fixture(), before = list.innerHTML
    const bad = [...source]; bad[99999] = bad[0]!
    expect(() => helper.setItems(bad)).toThrow("unique")
    expect(list.innerHTML).toBe(before); expect(helper.state.count).toBe(100000)
    expect(() => helper.setItems([{ id: NaN, text: "bad" }])).toThrow()
    expect(helper.connected).toBe(true)
  })
  it("requires an updater instead of silently retaining stale same-key data", () => {
    const { helper, list } = fixture({}, 64), first = list.firstElementChild
    helper.setItems(data(4).map(item => ({ ...item, text: `Changed ${item.id}` })))
    expect(list.firstElementChild).toBe(first); expect(first!.textContent).toBe("Changed 0")
    helper.setItems([...data(4)].reverse())
    expect(list.lastElementChild).toBe(first); expect(first!.textContent).toBe("Row 1")
    expect(first!.getAttribute("aria-posinset")).toBe("4")
  })
  it("copies the array and refresh does not invoke updater or reconstruct stable rows", () => {
    const update = vi.fn(), { helper, source, list } = fixture({ update }), first = list.firstElementChild
    source.splice(0, 1000); helper.refresh(); helper.scrollTo({ top: 32 })
    expect(helper.state.count).toBe(100000); expect(update).not.toHaveBeenCalled()
    expect(list.firstElementChild).toBe(first)
  })
  it("supports string keys separately from numeric keys", () => {
    const { helper } = fixture({ items: data(2), key: item => item.id ? "0" : 0 })
    expect(helper.state.count).toBe(2); helper.scrollTo({ key: "0" })
    expect(() => helper.scrollTo({ key: "" })).toThrow()
  })
  it("rejects competing module owners and permits rebind after disconnect", async () => {
    const { helper, root } = fixture(), options = { items: data(2), rowSize: 32, key: (item: Item) => item.id, render, update: vi.fn() }
    vi.resetModules(); const other = await import("../src/components/virtual-list/index.js")
    expect(() => other.createVirtualList(root, options)).toThrow()
    helper.disconnect(); const rebound = other.createVirtualList(root, options); rebound.disconnect()
    expect(root.children).toHaveLength(1)
  })
  it("does not steal connected or fragment-owned factory results", () => {
    const li = document.createElement("li"); document.body.append(li)
    expect(() => fixture({ render: () => li })).toThrow("fresh")
    expect(li.parentElement).toBe(document.body)
    const fragment = document.createDocumentFragment(); fragment.append(li)
    expect(() => fixture({ render: () => li })).toThrow("fresh")
    expect(li.parentNode).toBe(fragment)
  })
  it("imports authored template rows into the active document without unsafe HTML binding", () => {
    const template = document.createElement("template"); template.innerHTML = "<li><span></span></li>"
    const { list } = fixture({ items: [{ id: 0, text: '<img src=x onerror="bad">' }], render: item => {
      const row = document.importNode(template.content.firstElementChild!, true) as HTMLLIElement
      row.firstElementChild!.textContent = item.text; return row
    } })
    expect(list.querySelector("img")).toBeNull(); expect(list.textContent).toContain("<img")
  })
  it("does not adopt or delete externally added nodes", () => {
    const { helper, list } = fixture(), extra = document.createElement("li"); list.append(extra)
    expect(() => helper.refresh()).toThrow("anatomy"); expect(helper.connected).toBe(false)
    expect(list.children).toHaveLength(1); expect(list.firstElementChild).toBe(extra)
  })
  it("requires explicit viewport sizing, external scrolling CSS and no vertical padding", () => {
    for (const style of ["", "--mui-virtual-list-height:100%;overflow-y:auto",
      "--mui-virtual-list-height:320px;overflow-y:hidden", "--mui-virtual-list-height:320px;overflow-y:auto;padding-top:1px"]) {
      const { root, helper } = fixture({ items: [] }); helper.disconnect(); root.style.cssText = style
      expect(() => createVirtualList(root, { items: [], rowSize: 32, key: item => item, render: () => document.createElement("li"), update: vi.fn() })).toThrow()
    }
  })
})

describe("focus and interactive row state", () => {
  const editor = (item: Item) => {
    const row = document.createElement("li"), input = document.createElement("input")
    input.name = "mounted[]"; input.value = item.text; row.append(input); return row
  }
  it("pins at most one focused row, keeps control identity/value/listeners and global DOM order", () => {
    const { helper, list } = fixture({ render: editor, update: vi.fn() })
    const input = list.querySelector("input")!, first = input.parentElement!
    const listener = vi.fn(); input.addEventListener("input", listener); input.focus(); input.value = "unsaved"
    helper.scrollTo({ index: 50000 })
    expect(helper.state).toMatchObject({ mounted: 17, pinnedKey: 0 })
    expect(document.activeElement).toBe(input); expect(input.value).toBe("unsaved")
    expect(list.firstElementChild).toBe(first)
    input.dispatchEvent(new Event("input")); expect(listener).toHaveBeenCalledOnce()
    input.blur(); helper.refresh(); expect(helper.state.mounted).toBe(16); expect(first.isConnected).toBe(false)
  })
  it("keeps a focused row through reordering even without moveBefore", () => {
    const { helper, list } = fixture({ items: data(4), render: editor, update: vi.fn() })
    const input = list.querySelector("input")!; input.focus(); input.value = "draft"
    Object.defineProperty(list, "moveBefore", { value: undefined })
    helper.setItems([...data(4)].reverse())
    expect(document.activeElement).toBe(input); expect(list.lastElementChild).toBe(input.parentElement)
    expect(input.value).toBe("draft")
    expect([...list.children].map(row => row.getAttribute("aria-posinset"))).toEqual(["1", "2", "3", "4"])
  })
  it("moves removed-key focus to the native viewport before disposing", () => {
    let activeDuringDispose: Element | null = null
    const { helper, root, list } = fixture({ items: data(4), render: editor, update: vi.fn(),
      dispose: () => { activeDuringDispose = document.activeElement } })
    list.querySelector("input")!.focus(); helper.setItems(data(4).slice(1))
    expect(document.activeElement).toBe(root); expect(activeDuringDispose).toBe(root)
  })
  it("pins a focused row during hidden viewport refresh rather than serializing unmounted controls", () => {
    const { helper, list, resize } = fixture({ render: editor })
    list.querySelector("input")!.focus(); resize(0)
    expect(helper.state).toMatchObject({ mounted: 1, pinnedKey: 0 })
    expect(list.querySelectorAll("input")).toHaveLength(1)
  })
})

describe("failure, scheduling and teardown", () => {
  it("cleans staged factories when a later factory throws", () => {
    const dispose = vi.fn(), nodes: HTMLLIElement[] = []
    expect(() => fixture({ render: item => {
      if (item.id === 4) throw new Error("factory failure")
      const row = render(item); nodes.push(row); return row
    }, dispose })).toThrow("factory failure")
    expect(dispose).toHaveBeenCalledTimes(4)
    expect(nodes.every(node => !node.parentNode)).toBe(true)
    expect(document.querySelectorAll(".mui-virtual-list__items > li")).toHaveLength(0)
  })
  it("fails closed on updater errors; never advertises partially updated success", () => {
    const dispose = vi.fn(), { helper, list, root } = fixture({
      items: data(4), dispose, update: (element, item) => { element.textContent = "partial"; if (item.id === 1) throw new Error("update failure") },
    })
    const error = vi.fn(); root.addEventListener("mui:virtual-list-error", error)
    expect(() => helper.setItems(data(4))).toThrow("update failure")
    expect(helper.connected).toBe(false); expect(helper.error).toBeInstanceOf(Error)
    expect(list.children).toHaveLength(0); expect(dispose).toHaveBeenCalledTimes(4); expect(error).toHaveBeenCalledOnce()
  })
  it("surfaces thrown undefined rather than treating it as successful cleanup", () => {
    const { helper, list, root } = fixture({ items: data(1), update: () => { throw undefined } })
    const error = vi.fn(); root.addEventListener("mui:virtual-list-error", error)
    let caught = false
    try { helper.setItems(data(1)) } catch (cause) { caught = true; expect(cause).toBeUndefined() }
    expect(caught).toBe(true); expect(helper.connected).toBe(false)
    expect(list.children).toHaveLength(0); expect(error).toHaveBeenCalledOnce()
  })
  it("rejects promise-returning hooks, releases owned rows, and makes no async success claim", () => {
    const { helper, list } = fixture({ items: data(1), update: () => Promise.reject(new Error("late")) })
    expect(() => helper.setItems(data(1))).toThrow("synchronous")
    expect(helper.connected).toBe(false); expect(list.children).toHaveLength(0)
    expect(() => fixture({ key: (() => Promise.reject(new Error("late key"))) as never })).toThrow("synchronous")
  })
  it("continues all disposals and releases ownership even when cleanup throws", () => {
    const dispose = vi.fn(() => { throw new Error("cleanup") }), { helper, list, root } = fixture({ items: data(3), dispose })
    expect(() => helper.disconnect()).toThrow()
    expect(dispose).toHaveBeenCalledTimes(3); expect(list.children).toHaveLength(0)
    expect(root.hasAttribute("tabindex")).toBe(false); expect(list.style.height).toBe("")
    expect(() => helper.disconnect()).not.toThrow()
  })
  it("rejects reentrant updates and cleans rows returned after a factory disconnects", () => {
    let helper: VirtualListController<Item> | undefined
    const dispose = vi.fn(), f = fixture({ render: item => {
      if (item.id === 500) helper!.disconnect()
      return render(item)
    }, dispose })
    helper = f.helper
    expect(() => helper!.scrollTo({ index: 500 })).toThrow("disconnected")
    expect(f.list.children).toHaveLength(0); expect(helper.connected).toBe(false)
    expect(dispose).toHaveBeenCalledTimes(17)
    const g = fixture({ update: () => g.helper.setItems(data(1)) })
    expect(() => g.helper.setItems(data(10))).toThrow("reenter"); expect(g.helper.connected).toBe(false)
  })
  it("cancels scheduled scroll/resize work on replacement and disconnect", () => {
    const callbacks = new Map<number, FrameRequestCallback>(), request = vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      callbacks.set(callbacks.size + 1, callback); return callbacks.size
    }), cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(id => { callbacks.delete(id) })
    let resized: ResizeObserverCallback | undefined
    const disconnect = vi.fn()
    vi.stubGlobal("ResizeObserver", class { constructor(callback: ResizeObserverCallback) { resized = callback } observe() {} disconnect = disconnect })
    const { root, helper } = fixture()
    root.dispatchEvent(new Event("scroll")); root.dispatchEvent(new Event("scroll"))
    expect(request).toHaveBeenCalledOnce()
    helper.setItems(data(2)); expect(cancel).toHaveBeenCalledOnce()
    resized!([], {} as ResizeObserver); helper.disconnect(); expect(disconnect).toHaveBeenCalledOnce()
    expect(callbacks.size).toBe(0); root.dispatchEvent(new Event("scroll")); expect(request).toHaveBeenCalledTimes(2)
    vi.unstubAllGlobals()
  })
  it("reports asynchronous failures without leaving listeners or rows alive", () => {
    let callback: FrameRequestCallback | undefined
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(value => { callback = value; return 1 })
    const { root, helper, list } = fixture(), error = vi.fn(); root.addEventListener("mui:virtual-list-error", error)
    root.dispatchEvent(new Event("scroll")); root.style.removeProperty("--mui-virtual-list-height")
    callback!(0)
    expect(error).toHaveBeenCalledOnce(); expect(helper.connected).toBe(false); expect(list.children).toHaveLength(0)
  })
  it("rejects a native extent cap instead of claiming unreachable data rendered successfully", () => {
    const { helper, list } = fixture()
    Object.defineProperty(list, "offsetHeight", { value: 100000 })
    expect(() => helper.refresh()).toThrow("extent")
    expect(helper.connected).toBe(false); expect(list.children).toHaveLength(0)
  })
  it("keeps nested instances independently owned and explicitly disposes the child", () => {
    const outer = fixture({ items: data(1), rowSize: 320 }, 320)
    const row = outer.list.firstElementChild!, inner = fixture({ items: data(2) }, 64)
    row.append(inner.root)
    outer.helper.refresh(); inner.helper.scrollTo({ position: "bottom" })
    expect(outer.helper.connected).toBe(true); expect(inner.helper.connected).toBe(true)
    inner.helper.disconnect(); expect(outer.helper.connected).toBe(true)
  })
  it("restores original geometry/attributes and preserves external viewport overrides", () => {
    const nodes: HTMLLIElement[] = [], { helper, root, list } = fixture({ items: data(2), render: item => {
      const row = render(item); row.style.top = "8px"; row.setAttribute("aria-posinset", "77"); nodes.push(row); return row
    } })
    root.style.setProperty("--mui-virtual-row-size", "99px"); root.setAttribute("tabindex", "5")
    helper.disconnect()
    expect(root.style.getPropertyValue("--mui-virtual-row-size")).toBe("99px")
    expect(root.getAttribute("tabindex")).toBe("5"); expect(list.style.height).toBe("")
    expect(nodes[0]!.style.top).toBe("8px"); expect(nodes[0]!.getAttribute("aria-posinset")).toBe("77")
    expect(nodes[0]!.classList.contains("mui-virtual-list__row")).toBe(false)
  })
  it("compares the browser's serialized large CSS length when restoring owned spacer height", () => {
    const { helper, list } = fixture(), read = list.style.getPropertyValue.bind(list.style)
    vi.spyOn(list.style, "getPropertyValue").mockImplementation(name => name === "height" && read(name) ? "3.2e+06px" : read(name))
    helper.refresh(); helper.disconnect()
    expect(list.style.height).toBe("")
  })
  it("separate roots remain independent and removal is detected at refresh", () => {
    const a = fixture(), b = fixture(); a.helper.scrollTo({ index: 50000 })
    expect(b.helper.state.start).toBe(0); a.root.remove()
    expect(() => a.helper.refresh()).toThrow("anatomy"); expect(b.helper.connected).toBe(true)
  })
})
