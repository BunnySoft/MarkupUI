import { afterEach, describe, expect, it, vi } from "vitest"
import { ChartDataset } from "../src/components/chart/dataset.js"
import { ViewElement } from "../src/core/index.js"
import { chartTable, validateSource } from "../src/components/chart/data.js"
import { bind, createStore } from "../src/state/index.js"

ViewElement.register([ChartDataset])
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } })
afterEach(() => { document.body.replaceChildren(); vi.unstubAllGlobals(); vi.useRealTimers() })

describe("Chart dataset sources", () => {
  it.each([
    [[["month", "sales"], ["January", 120]], 1],
    [[{ month: "January", sales: 120 }], 1],
    [{ month: ["January"], sales: [120] }, 1],
    [[], 0],
  ])("accepts rows/columns and builds an equivalent table: %j", (source, count) => {
    validateSource(source)
    expect(chartTable(source, null, "auto").rows).toHaveLength(count)
  })

  it.each([null, 42, [1, 2], [[1], [2, 3]], [[Infinity]], [[undefined]], [{ x: () => {} }], { x: [1], y: [1, 2] }, JSON.parse('{"__proto__":[]}')])("rejects malformed or unsafe data %j", source => {
    expect(() => validateSource(source)).toThrow()
  })

  it("rejects accessors, sparse values and bounded row/column violations", () => {
    const getter = vi.fn()
    expect(() => validateSource([Object.defineProperty({}, "x", { enumerable: true, get: getter })])).toThrow()
    expect(getter).not.toHaveBeenCalled()
    expect(() => validateSource([Array(2)])).toThrow()
    expect(() => validateSource(Array.from({ length: 10_001 }, () => [1]))).toThrow("10000")
    expect(() => validateSource([Array(65).fill(1)])).toThrow("64")
  })

  it("supports assignment, JSON attributes, nested JSON, and scoped binding without copying source references", async () => {
    const dataset = new ChartDataset(), rows = [{ month: "January", sales: 120 }]
    dataset.source = rows
    expect(dataset.source).toBe(rows)
    dataset.clearSource()
    dataset.setAttribute("source", JSON.stringify(rows))
    expect(dataset.source).toEqual(rows)
    dataset.clearSource()
    dataset.innerHTML = `<script type="application/json">${JSON.stringify(rows)}</script>`
    const script = dataset.firstChild
    document.body.append(dataset)
    expect(dataset.source).toEqual(rows)
    dataset.refresh()
    expect(dataset.firstChild).toBe(script)
    dataset.clearSource()
    dataset.setAttribute("data-bind-source", "report.sales")
    const store = createStore({ report: { sales: rows } })
    const stop = bind(dataset, store)
    expect(dataset.source).toBe(rows)
    const next = [{ month: "February", sales: 180 }]
    store.set("report.sales", next)
    expect(dataset.source).toBe(next)
    stop()
    await flush()
    expect(dataset.error).toBeNull()
  })

  it("rejects source conflicts atomically and supports explicit channel clearing", () => {
    const dataset = new ChartDataset()
    dataset.source = [[1, 2]]
    expect(() => { dataset.src = "/data.json" }).toThrow("Conflicting")
    expect(dataset.source).toEqual([[1, 2]])
    dataset.setAttribute("source", "[[3,4]]")
    expect(() => dataset.source).toThrow("Conflicting")
    dataset.source = undefined
    expect(dataset.source).toEqual([[3, 4]])
    dataset.innerHTML = '<script type="application/json">[[5,6]]</script>'
    expect(() => dataset.source).toThrow("Conflicting")
    dataset.clearSource()
    expect(dataset.source).toEqual([])
  })

  it("validates dimensions, headers and nested ownership", () => {
    const dataset = new ChartDataset()
    dataset.dimensions = ["month", "sales"]
    dataset.sourceHeader = false
    expect(dataset.dimensions).toEqual(["month", "sales"])
    expect(dataset.sourceHeader).toBe(false)
    expect(() => { dataset.dimensions = ["sales", "sales"] }).toThrow()
    expect(() => { dataset.sourceHeader = "yes" as never }).toThrow()
    dataset.innerHTML = '<m-box><script type="application/json">[]</script></m-box>'
    expect(() => dataset.source).toThrow("only")
  })

  it("replays pre-upgrade dataset values", () => {
    const host = document.createElement("m-late-chart-dataset") as ChartDataset
    const rows = [[1, 2]]
    host.source = rows
    document.body.append(host)
    customElements.define("m-late-chart-dataset", class extends ChartDataset {})
    expect(Object.hasOwn(host, "source")).toBe(false)
    expect(host.source).toBe(rows)
  })
})

describe("Chart remote JSON boundary", () => {
  it("times out stalled requests and permits recovery through reload", async () => {
    vi.useFakeTimers()
    const fetcher = vi.fn((_url, options) => new Promise<Response>((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true })
    }))
    vi.stubGlobal("fetch", fetcher)
    const dataset = new ChartDataset()
    dataset.src = "/slow.json"
    document.body.append(dataset)
    const rejected = expect(dataset.settled()).rejects.toThrow("timed out")
    await vi.advanceTimersByTimeAsync(15_000)
    await rejected
    expect(dataset.loading).toBe(false)
    expect(dataset.error?.message).toContain("timed out")
    fetcher.mockResolvedValueOnce(json([[1]]))
    await dataset.reload()
    expect(dataset.error).toBeNull()
    expect(dataset.source).toEqual([[1]])
    expect(vi.getTimerCount()).toBe(0)
  })

  it("loads a safe response path with credentials omitted and permits explicit reload", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(json({ data: { rows: [["A", 2]] } })).mockResolvedValueOnce(json({ data: { rows: [["B", 3]] } }))
    vi.stubGlobal("fetch", fetcher)
    const dataset = new ChartDataset()
    dataset.src = "/report.json"
    dataset.sourcePath = "data.rows"
    dataset.sourceHeader = false
    document.body.append(dataset)
    expect(dataset.loading).toBe(true)
    await dataset.settled()
    expect(dataset.loading).toBe(false)
    expect(dataset.source).toEqual([["A", 2]])
    expect(fetcher.mock.calls[0]![1]).toMatchObject({ credentials: "omit", redirect: "error", signal: expect.any(AbortSignal) })
    await dataset.reload()
    expect(dataset.source).toEqual([["B", 3]])
  })

  it.each(["javascript:alert(1)", "data:application/json,[]", "https://other.example/data", "http://user:password@localhost/data", ""])("rejects remote URL %j", src => {
    expect(() => { new ChartDataset().src = src }).toThrow()
  })

  it("rejects unsafe response paths before fetching", () => {
    const fetcher = vi.fn()
    vi.stubGlobal("fetch", fetcher)
    const dataset = new ChartDataset()
    expect(() => { dataset.sourcePath = "data.__proto__.rows" }).toThrow()
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    () => json([], 500),
    () => new Response("not json", { headers: { "Content-Type": "application/json" } }),
    () => new Response("[]", { headers: { "Content-Type": "text/html" } }),
    () => new Response("[]", { headers: { "Content-Type": "application/json", "Content-Length": "1048577" } }),
    () => json({ x: [1], y: [] }),
  ])("reports HTTP, JSON, content-type, size and data errors", async response => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()))
    const dataset = new ChartDataset(), error = vi.fn()
    dataset.src = "/bad.json"
    dataset.addEventListener("m:chart-data-error", error)
    document.body.append(dataset)
    await expect(dataset.settled()).rejects.toThrow()
    expect(dataset.error).toBeInstanceOf(Error)
    expect(dataset.loading).toBe(false)
    expect(error).toHaveBeenCalledOnce()
  })

  it("enforces streamed response size even without Content-Length", async () => {
    const value = new Uint8Array(1_048_577)
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(value, { headers: { "Content-Type": "application/json" } })))
    const dataset = new ChartDataset()
    dataset.src = "/large.json"
    document.body.append(dataset)
    await expect(dataset.settled()).rejects.toThrow("1 MiB")
  })

  it("ignores stale completion and aborts on source changes and disconnect", async () => {
    const pending: Array<(response: Response) => void> = []
    const fetcher = vi.fn((_url, _options) => new Promise<Response>(resolve => pending.push(resolve)))
    vi.stubGlobal("fetch", fetcher)
    const dataset = new ChartDataset()
    dataset.src = "/first.json"
    document.body.append(dataset)
    const first = dataset.settled().catch(() => {})
    dataset.src = "/second.json"
    expect(fetcher.mock.calls[0]![1].signal.aborted).toBe(true)
    const second = dataset.settled()
    pending[1]!(json([[2]]))
    await second
    pending[0]!(json([[1]]))
    await first
    expect(dataset.source).toEqual([[2]])
    const third = dataset.reload().catch(() => {})
    dataset.remove()
    expect(fetcher.mock.calls[2]![1].signal.aborted).toBe(true)
    pending[2]!(json([[3]]))
    await third
    expect(dataset.source).toEqual([[2]])
    document.body.append(dataset)
    const reconnected = dataset.settled()
    pending[3]!(json([[4]]))
    await reconnected
    expect(dataset.source).toEqual([[4]])
  })
})
