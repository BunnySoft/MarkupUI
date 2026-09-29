import { afterEach, describe, expect, it, vi } from "vitest"
import { m } from "../src/index.js"
import { advancedPlugin } from "../src/plugins/advanced.js"

interface Grid extends HTMLElement {
  rows: ReadonlyArray<Record<string, unknown>>
  refresh(): void
}
interface Column extends HTMLElement { key: string; label: string; sortable: boolean }

// The own value must survive Custom Element upgrade, before the plugin exists.
const beforeUpgrade = document.createElement("m-data-grid") as Grid
beforeUpgrade.innerHTML = '<m-data-column key="name" label="Name" sortable></m-data-column>'
beforeUpgrade.rows = [{ name: "Before upgrade" }]
document.body.append(beforeUpgrade)
m.use(advancedPlugin)

afterEach(() => document.body.replaceChildren())

function grid(): Grid {
  const element = document.createElement("m-data-grid") as Grid
  element.innerHTML = '<m-data-column key="name" label="Name" sortable></m-data-column><m-data-column key="score" label="Score" sortable></m-data-column>'
  document.body.append(element)
  element.rows = [{ name: "Grace", score: 10 }, { name: "Ada", score: 2 }]
  return element
}

describe("optional DataGrid ownership", () => {
  it.each(["index", "iterator", "subclass", "symbol"])("rejects executable or nonplain %s arrays before reading rows", kind => {
    const element = grid(), previous = element.rows
    const executed = vi.fn(() => ({ name: "Injected" }))
    const rows: unknown[] = [{ name: "Valid" }]
    if (kind === "index") Object.defineProperty(rows, "0", { get: executed })
    if (kind === "iterator") Object.defineProperty(rows, Symbol.iterator, { get: executed })
    if (kind === "subclass") Object.setPrototypeOf(rows, Object.create(Array.prototype))
    if (kind === "symbol") Object.defineProperty(rows, Symbol("hidden"), { value: true })
    expect(() => { element.rows = rows as Grid["rows"] }).toThrow()
    expect(executed).not.toHaveBeenCalled()
    expect(element.rows).toBe(previous)
  })

  it("replays rows assigned before plugin registration", () => {
    expect(beforeUpgrade.querySelector("td")?.textContent).toBe("Before upgrade")
    expect(Object.hasOwn(beforeUpgrade, "rows")).toBe(false)
  })

  it("sorts with stable native buttons, table identity and accurate header state", () => {
    const element = grid(), table = element.querySelector("table")!
    const button = element.querySelector<HTMLButtonElement>("th button")!
    const changed = vi.fn()
    element.addEventListener("m:sort", changed)
    button.focus()
    button.click()
    expect(element.querySelector("table")).toBe(table)
    expect(element.querySelector("th button")).toBe(button)
    expect(document.activeElement).toBe(button)
    expect(element.querySelector("td")?.textContent).toBe("Ada")
    expect(button.closest("th")?.getAttribute("aria-sort")).toBe("ascending")
    expect(changed.mock.calls[0]![0].detail).toEqual({ key: "name", direction: "asc" })
    button.click()
    expect(button.closest("th")?.getAttribute("aria-sort")).toBe("descending")
    expect(element.querySelector("td")?.textContent).toBe("Grace")
    expect(changed).toHaveBeenCalledTimes(2)
  })

  it("does not delete authored tables, nodes or listeners", () => {
    const element = grid(), authored = document.createElement("table")
    const clicked = vi.fn()
    authored.addEventListener("click", clicked)
    element.prepend(authored)
    element.rows = [{ name: "<img src=x>", score: 3 }]
    element.refresh()
    expect(authored.parentElement).toBe(element)
    authored.click()
    expect(clicked).toHaveBeenCalledOnce()
    expect(element.querySelector("img")).toBeNull()
    expect(element.querySelectorAll("table")).toHaveLength(2)
    expect(element.querySelector("td")?.textContent).toBe("<img src=x>")
  })

  it("updates direct column properties and removes stale sorting and owned output", async () => {
    const element = grid()
    const column = element.querySelector("m-data-column") as Column
    const table = element.querySelector("table")
    const button = element.querySelector<HTMLButtonElement>("th button")!
    button.click()
    column.label = "Full name"
    await Promise.resolve()
    expect(button.textContent).toBe("Full name")
    expect(element.querySelector("th button")).toBe(button)
    column.sortable = false
    await Promise.resolve()
    expect(element.querySelector("th button")?.textContent).toBe("Score")
    expect(element.querySelector("th")?.hasAttribute("aria-sort")).toBe(false)
    expect(element.querySelector("td")?.textContent).toBe("Grace")
    for (const node of element.querySelectorAll("m-data-column")) node.remove()
    await Promise.resolve()
    expect(table?.isConnected).toBe(false)
    element.append(column)
    await Promise.resolve()
    expect(element.querySelector("table")).toBe(table)
  })

  it("keeps focus on surviving sort controls when columns reorder or disappear", () => {
    const element = grid(), columns = element.querySelectorAll("m-data-column")
    const buttons = element.querySelectorAll<HTMLButtonElement>("th button")
    buttons[0]!.focus()
    element.insertBefore(columns[1]!, columns[0]!)
    element.refresh()
    expect(document.activeElement).toBe(buttons[0])
    columns[0]!.remove()
    element.refresh()
    expect(document.activeElement).toBe(buttons[1])
  })

  it("validates row data before mutation and never evaluates accessors", () => {
    const element = grid(), previous = element.rows
    const getter = vi.fn(() => "Unsafe")
    for (const invalid of [null, {}, [null], [{ name: () => {} }], [{ score: Infinity }],
      [Object.defineProperty({}, "name", { get: getter, enumerable: true })],
      Array.from({ length: 1001 }, () => ({ name: "Too many" }))]) {
      expect(() => { element.rows = invalid as Grid["rows"] }).toThrow()
      expect(element.rows).toBe(previous)
      expect(element.querySelector("td")?.textContent).toBe("Grace")
    }
    expect(getter).not.toHaveBeenCalled()
  })

  it("rejects duplicate or unsafe columns before changing the visible table", () => {
    const element = grid(), column = element.querySelectorAll("m-data-column")[1]!
    const table = element.querySelector("table")!.innerHTML
    for (const key of ["name", "__proto__", "constructor", ""]) {
      column.setAttribute("key", key)
      expect(() => element.refresh()).toThrow()
      expect(element.querySelector("table")!.innerHTML).toBe(table)
    }
    column.setAttribute("key", "score")
    element.refresh()
  })

  it("reports invalid asynchronous configuration and recovers after correction", async () => {
    const element = grid(), column = element.querySelectorAll("m-data-column")[1]!
    const error = vi.fn()
    element.addEventListener("m:error", error)
    column.setAttribute("key", "name")
    await Promise.resolve()
    expect(error).toHaveBeenCalledOnce()
    expect(element.querySelectorAll("th")).toHaveLength(2)
    column.setAttribute("key", "score")
    await Promise.resolve()
    expect(element.querySelectorAll("th")).toHaveLength(2)
  })

  it("releases listeners/observers while disconnected and reconnects once", async () => {
    const element = grid(), button = element.querySelector<HTMLButtonElement>("th button")!
    const changed = vi.fn()
    element.addEventListener("m:sort", changed)
    element.remove()
    button.click()
    const column = element.querySelector("m-data-column") as Column
    column.label = "Updated"
    await Promise.resolve()
    expect(changed).not.toHaveBeenCalled()
    expect(button.textContent).toBe("Name")
    document.body.append(element)
    expect(button.textContent).toBe("Updated")
    button.click()
    expect(changed).toHaveBeenCalledOnce()
    expect(element.querySelectorAll("table")).toHaveLength(1)
  })
})
