import { checkSizeRecommendation } from "../scripts/size-policy.mjs"
import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { DataTable, registerDataTable, dataTableSizes } from "../src/components/data-table/index.js"
import type { DataTableDefinition, DataTableRecord } from "../src/components/data-table/index.js"
import { ViewElement } from "../src/core/index.js"
import { CheckboxGroup } from "../src/components/checkbox/index.js"
import { coordinateForm } from "../src/components/form/controller.js"

const settle = () => new Promise(resolve => setTimeout(resolve, 0))
const data = (): DataTableRecord[] => [
  { key: "a", values: ["Alpha", 10] }, { key: "b", values: ["Bravo", 2] },
  { key: "c", values: ["Charlie", 2], checked: true }, { key: "d", values: ["Delta", 30], checked: true, disabled: true },
]
function fixture(options: Partial<DataTableDefinition> = {}) {
  const element = new DataTable(), form = document.createElement("form")
  element.label = "Scores"
  element.options = {
    columns: [{ key: "name", label: "Name", filterable: true }, { key: "score", label: "Score", sort: "number" }],
    selection: { name: "keys", scope: "page" }, pageSizes: [2, 3],
    summaries: [{ key: "total", scope: "page", value: rows => String(rows.reduce((sum, row) => sum + Number(row.values[1]), 0)) }],
    ...options,
  }
  element.data = data(); form.append(element); document.body.append(form)
  const table = element.native!, root = element.querySelector<HTMLElement>("[data-data-table]")!
  const row = (key: string) => [...table.tBodies[0]!.rows].find(row => row.dataset.dataKey === key)!
  const check = (key: string) => row(key).querySelector<HTMLInputElement>("[data-data-check]")!
  return { element, form, root, table, row, check, all: root.querySelector<HTMLInputElement>("[data-data-check-all]")!,
    sort: root.querySelector<HTMLButtonElement>("[data-data-sort]")!, filter: root.querySelector<HTMLInputElement>("[data-data-filter]")! }
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Data Table mapping and structure", () => {
  it("keeps composed CSS policy within its unchanged budget", () => {
    const base = readFileSync("src/components/table/table.css", "utf8"), css = readFileSync("src/components/data-table/data-table.css", "utf8")
    expect(base).toContain("border-collapse: collapse")
    expect(css).toContain('.m-table[data-size="small"] { --_m-table-padding: 8px; }')
    expect(css).toContain("var(--m-data-table-scroll-padding, 0)")
    expect(css).toContain("var(--m-data-table-selected-background, transparent)")
    expect(css).toContain("font-variant-numeric: normal")
    expect(css).not.toContain("[aria-sort]")
    expect(css).toContain("color: GrayText")
    checkSizeRecommendation(gzipSync(`${base}\n${css}`, { level: 9 }).length, 2500, "data-table.test.ts: gzipSync(`${base}\\n${css}`, { level: 9 }).length")
  })
  it("registers one canonical shared-base class and rejects conflicts", () => {
    expect(DataTable.prototype).toBeInstanceOf(ViewElement)
    expect(customElements.get("m-data-table")).toBe(DataTable)
    const define = vi.fn()
    expect(() => registerDataTable({ get: () => HTMLElement, define })).toThrow("different")
    expect(define).not.toHaveBeenCalled()
    expect(DataTable.observedAttributes).not.toContain("pagination")
    expect("pagination" in new DataTable()).toBe(false)
  })
  it("maps data to a captioned native table without native authoring", () => {
    const { element, table, row } = fixture()
    expect(table.caption!.textContent).toBe("Scores"); expect(table.getAttribute("role")).toBeNull()
    expect([...table.tHead!.rows[0]!.cells].every(cell => cell.scope === "col")).toBe(true)
    expect(row("a").cells[1]!.textContent).toBe("Alpha")
    expect(table.tFoot!.textContent).toContain("44")
    expect(element.hasAttribute("role")).toBe(false); expect(element.hasAttribute("tabindex")).toBe(false)
  })
  it("preserves original authored help nodes and native row content across scalar updates", () => {
    const { element, row, table } = fixture(), help = document.createElement("m-span"), listener = vi.fn()
    help.textContent = "Help"; help.addEventListener("custom", listener); element.prepend(help)
    const details = document.createElement("details"); details.open = true; details.textContent = "Native note"; row("a").cells[1]!.append(details)
    element.size = "small"; element.striped = true; element.bordered = false; element.singleLine = false
    element.set({ loading: true, sort: { key: "score", order: "descending" } })
    expect(element.native).toBe(table); expect(details.open).toBe(true); expect(element.contains(help)).toBe(true)
    help.dispatchEvent(new Event("custom")); expect(listener).toHaveBeenCalledOnce()
    expect(table.dataset.size).toBe("small"); expect(table.dataset.bordered).toBe("false")
    expect(table.dataset.singleLine).toBe("false"); expect(table.hasAttribute("data-striped")).toBe(true)
    for (const size of dataTableSizes) { element.size = size; expect(table.dataset.size).toBe(size) }
  })
  it("snapshots data and schema, including nested filters and row values", () => {
    const element = new DataTable(), records = data(), columns = [{ key: "name", label: "Name" }, { key: "score", label: "Score" }]
    element.options = { columns }; element.data = records
    columns[0]!.label = "Changed"; Object.assign(records[0]!, { values: ["Changed", 99] })
    expect(element.options!.columns[0]!.label).toBe("Name"); expect(element.data[0]!.values).toEqual(["Alpha", 10])
    expect(Object.isFrozen(element.data[0]!.values)).toBe(true)
  })
  it("requires disconnection for schema replacement and permits live data updates", () => {
    const { element, table, form } = fixture()
    expect(() => { element.options = { columns: [{ key: "x", label: "X" }] } }).toThrow("Disconnect")
    expect(element.native).toBe(table)
    element.remove(); element.data = []; element.options = { columns: [{ key: "x", label: "X" }] }
    element.data = [{ key: "new", values: ["New"] }]; form.append(element)
    expect(element.state!.sourceKeys).toEqual(["new"]); expect(element.native).not.toBe(table)
  })
  it.each([
    { unknown: true }, { columns: Array(1) },
    { columns: [{ key: "name", label: "Name", unknown: true }] },
    { selection: null }, { selection: { name: "keys", scope: "page", unknown: true } },
    { pageSizes: Array(1) }, { summaries: Array(1) },
    { summaries: [{ key: "total", scope: "all", value: () => "", unknown: true }] },
  ])("rejects malformed schema without replacing retained DOM: %j", invalid => {
    const { element, table } = fixture()
    element.remove()
    const before = element.options
    expect(() => { element.options = { ...before!, ...invalid } as never }).toThrow()
    expect(element.options).toBe(before); expect(element.native).toBe(table)
  })
  it.each([
    [{ key: "a", values: ["A", 1] }, { key: "a", values: ["B", 2] }],
    [{ key: "", values: ["A", 1] }], [{ key: "a", values: ["A", NaN] }],
    [{ key: "a", values: ["A"] }], [{ key: "a", values: ["A", "wrong"] }],
    [{ key: "a", values: ["A", 1], hidden: "yes" }],
  ])("rejects malformed data atomically: %j", records => {
    const { element, table } = fixture(), before = element.data, state = element.state, rows = [...table.rows]
    expect(() => { element.data = records as never }).toThrow()
    expect(element.data).toBe(before); expect(element.state).toEqual(state); expect([...table.rows]).toEqual(rows)
  })
  it("rejects 2001 records before rendering any additional rows", () => {
    const { element, table } = fixture()
    expect(() => { element.data = Array.from({ length: 2001 }, (_, i) => ({ key: String(i), values: ["Name", i] })) }).toThrow("2000")
    expect(table.tBodies[0]!.rows.length).toBe(4)
  })
})

describe("data transactions and stable order", () => {
  it("sorts numerically, preserving source-order ties in both directions", () => {
    const { element } = fixture()
    element.set({ sort: { key: "score", order: "ascending" } }); expect(element.state!.filteredKeys).toEqual(["b", "c", "a", "d"])
    element.set({ sort: { key: "score", order: "descending" } }); expect(element.state!.filteredKeys).toEqual(["d", "a", "b", "c"])
    element.refresh(); element.set({ sort: null }); expect(element.state!.filteredKeys).toEqual(["a", "b", "c", "d"])
  })
  it("filters before sorting before paging without unmounting", () => {
    const { element, row } = fixture({ pageSize: 2 })
    element.set({ sort: { key: "score", order: "ascending" } })
    expect(element.state!.visibleKeys).toEqual(["b", "c"]); expect(row("a").hidden).toBe(true); expect(row("a").isConnected).toBe(true)
    element.set({ page: 2 }); expect(element.state!.visibleKeys).toEqual(["a", "d"])
    element.set({ filters: { name: "alpha" } }); expect(element.state!.page).toBe(1); expect(element.state!.visibleKeys).toEqual(["a"])
  })
  it("represents an empty result as page 1 of 0 with two stable pager buttons", () => {
    const { element, root } = fixture({ pageSize: 2 }), buttons = [...root.querySelectorAll("[data-data-page]")]
    element.set({ filters: { name: "missing" } })
    expect(element.state!.page).toBe(1); expect(element.state!.pageCount).toBe(0)
    expect(root.querySelector<HTMLElement>("[data-data-empty]")!.hidden).toBe(false)
    expect([...root.querySelectorAll("[data-data-page]")]).toEqual(buttons)
  })
  it.each([{ page: 999999999 }, { page: 0 }, { pageSize: 0 }, { pageSize: 7 }, { sort: { key: "unknown", order: "ascending" } },
    { sort: { key: "score", order: "asc" } }, { sort: { key: "score", order: "ascending", unknown: true } },
    { filters: { unknown: "x" } }, { virtualScroll: true }])("rejects invalid state atomically: %j", values => {
    const { element, table } = fixture({ pageSize: 2 }), before = element.state, rows = [...table.rows]
    expect(() => element.set(values as never)).toThrow()
    expect(element.state).toEqual(before); expect([...table.rows]).toEqual(rows)
  })
  it("uses exact data source order after replacements and sorting", () => {
    const { element, row } = fixture(), original = row("a")
    element.set({ sort: { key: "score", order: "ascending" } })
    element.data = [data()[3]!, data()[2]!, data()[1]!, data()[0]!]
    expect(row("a")).toBe(original); expect(element.state!.visibleKeys).toEqual(["c", "b", "a", "d"])
    element.set({ sort: null }); expect(element.state!.visibleKeys).toEqual(["d", "c", "b", "a"])
  })
  it("clamps shrinking data pages and never resurrects removed rows on reconnect", () => {
    const { element, row, form } = fixture({ pageSize: 2, page: 2 }), removed = row("c")
    element.data = [data()[3]!]
    expect(element.state!.page).toBe(1); expect(element.state!.visibleKeys).toEqual(["d"])
    element.remove(); form.append(element)
    expect(removed.isConnected).toBe(false); expect(element.state!.sourceKeys).toEqual(["d"])
  })
  it("clamps retained pages after disconnected data updates without clamping invalid initial requests", () => {
    const { element, form } = fixture({ pageSize: 2, page: 2 })
    element.remove(); element.data = [data()[0]!]
    expect(element.state).toBeNull()
    form.append(element)
    expect(element.state!.page).toBe(1); expect(element.state!.visibleKeys).toEqual(["a"])
  })
  it("retains surviving native cell edits, checkbox dirty state and listeners during data updates", () => {
    const { element, row, check } = fixture(), a = row("a"), input = document.createElement("input"), listener = vi.fn()
    input.value = "draft"; a.cells[1]!.append(input); a.addEventListener("custom", listener)
    element.checkedKeys = ["a", "d"]; const before = check("a")
    element.data = [...data(), { key: "new", values: ["New", 4] }]
    expect(row("a")).toBe(a); expect(check("a")).toBe(before); expect(before.checked).toBe(true)
    expect(input.value).toBe("draft"); expect(input.isConnected).toBe(true)
    a.dispatchEvent(new Event("custom")); expect(listener).toHaveBeenCalledOnce()
  })
  it("updates text cells without HTML interpretation and leaves unrelated cell content intact", () => {
    const { element, row } = fixture(), untouched = row("b").cells[1]!, child = document.createElement("m-span")
    untouched.append(child); element.data = [{ ...data()[0]!, values: ["<img src=x>", 3] }, ...data().slice(1)]
    expect(row("a").cells[1]!.textContent).toBe("<img src=x>"); expect(element.querySelector("img")).toBeNull()
    expect(untouched.contains(child)).toBe(true)
  })
  it("supports prototype-like filter keys literally", () => {
    const { element, filter } = fixture({ columns: [{ key: "__proto__", label: "Name", filterable: true }, { key: "score", label: "Score", sort: "number" }] })
    element.set({ filters: { ["__proto__"]: "Alpha" } }); expect(element.state!.visibleKeys).toEqual(["a"])
    element.set({ filters: {} }); expect(filter.value).toBe(""); expect(element.state!.visibleKeys).toHaveLength(4)
  })
  it("respects data-hidden and externally hidden rows, including rejected reveal", () => {
    const { element, row } = fixture()
    element.data = [{ ...data()[0]!, hidden: true }, ...data().slice(1)]
    expect(element.state!.filteredKeys).toEqual(["b", "c", "d"])
    expect(() => element.reveal("a")).toThrow("hidden")
    element.data = data(); expect(element.state!.visibleKeys).toContain("a")
    row("b").hidden = true; element.refresh(); expect(element.state!.filteredKeys).not.toContain("b")
  })
  it("computes explicit summary scopes and uses text only", () => {
    const { element, root } = fixture({ pageSize: 2, summaries: [{ key: "total", scope: "all", value: rows => `<b>${rows.length}</b>` }] })
    element.set({ filters: { name: "Alpha" } })
    expect(root.querySelector("[data-data-summary]")!.textContent).toBe("<b>4</b>")
    expect(root.querySelector("[data-data-summary] b")).toBeNull()
  })
})

describe("native forms, selection and reset", () => {
  it("distinguishes checked keys from successful fields, including hidden selected rows", () => {
    const { element, form, row } = fixture({ pageSize: 2 })
    expect(element.checkedKeys).toEqual(["c", "d"]); expect(new FormData(form).getAll("keys")).toEqual(["c"])
    expect(row("c").hidden).toBe(true)
    element.set({ filters: { name: "missing" } }); expect(new FormData(form).getAll("keys")).toEqual(["c"])
  })
  it("scopes page/filtered/all selection and protects disabled selected rows", () => {
    const { element } = fixture({ pageSize: 2 })
    element.select("page", true); expect(element.checkedKeys).toEqual(["a", "b", "c", "d"])
    element.set({ filters: { name: "Alpha" } }); element.select("filtered", false)
    expect(element.checkedKeys).toEqual(["b", "c", "d"])
    element.select("all", false); expect(element.checkedKeys).toEqual(["d"])
    expect(() => { element.checkedKeys = [] }).toThrow("protected")
  })
  it("keeps current checks independent from native reset defaults and mixed header state", async () => {
    const { element, check, all, form } = fixture(), listener = vi.fn()
    element.addEventListener("m:data-table-change", listener)
    element.checkedKeys = ["a", "d"]
    expect(check("a").defaultChecked).toBe(false); expect(all.indeterminate).toBe(true)
    check("d").defaultChecked = false; form.reset()
    expect(() => element.select("all", true)).toThrow("reset")
    await settle(); expect(element.checkedKeys).toEqual(["c"]); expect(listener).not.toHaveBeenCalled()
  })
  it("preserves original reset sort/filter/page defaults across reconnect", async () => {
    const { element, filter, form, table } = fixture({ pageSize: 2, sort: { key: "score", order: "ascending" } })
    filter.defaultValue = "Alpha"; element.set({ pageSize: null, sort: null, filters: { name: "Bravo" } })
    element.remove(); form.append(element); expect(element.native).toBe(table)
    form.reset(); await settle()
    expect(element.state!.sort?.order).toBe("ascending"); expect(element.state!.pageSize).toBe(2)
    expect(element.state!.filters).toEqual({ name: "Alpha" })
  })
  it("honors canceled checkbox activation and native reset", async () => {
    const { element, check, form } = fixture()
    element.checkedKeys = ["a", "d"]
    check("b").addEventListener("click", event => event.preventDefault(), { once: true }); check("b").click()
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await settle()
    expect(element.checkedKeys).toEqual(["a", "d"])
  })
  it("keeps added native fields successful and requires explicit reveal for validation", async () => {
    const { element, form, row, table } = fixture({ pageSize: 2 }), input = document.createElement("input")
    input.name = "edit"; input.required = true; row("c").cells[1]!.append(input)
    element.set({ loading: true }); expect(table.getAttribute("aria-busy")).toBe("true")
    expect(input.disabled).toBe(false); expect(new FormData(form).get("edit")).toBe("")
    expect(form.checkValidity()).toBe(false); element.revealAll(); expect(row("c").hidden).toBe(false)
    const coordinator = coordinateForm(form, { items: [{ key: "edit", controls: [input] }] })
    expect((await coordinator.validate()).status).toBe("invalid"); coordinator.disconnect()
  })
  it("supports external associations and resets after moving out of a form", async () => {
    const { element, form, check } = fixture()
    form.id = "external"; for (const key of ["a", "b", "c", "d"]) check(key).setAttribute("form", form.id)
    document.body.append(element); element.checkedKeys = ["a", "d"]
    form.reset(); await settle(); expect(element.checkedKeys).toEqual(["c", "d"])
  })
  it("reveals a known key in its sorted page and never invents unknown rows", () => {
    const { element, row } = fixture({ pageSize: 2 })
    element.set({ filters: { name: "Bravo" }, sort: { key: "score", order: "ascending" } })
    expect(element.reveal("a")).toBe(row("a")); expect(element.state!.page).toBe(2)
    expect(() => element.reveal("missing")).toThrow()
  })
  it("protects checkbox ownership from a later CheckboxGroup", () => {
    const { element, check } = fixture(), group = new CheckboxGroup()
    group.innerHTML = "<legend>Checks</legend>"; element.before(group); group.append(element)
    check("a").dataset.checkbox = ""; check("a").id = "owned-check"
    const label = document.createElement("label"); label.htmlFor = "owned-check"; label.textContent = "Alpha"; check("a").after(label)
    expect(() => group.refresh()).toThrow("owner")
    element.disconnectedCallback(); group.refresh(); group.remove()
  })
})

describe("events, focus and callback safety", () => {
  it("cycles one aria-sort with settled host events and honors cancellation", async () => {
    const { element, sort, table } = fixture(), listener = vi.fn()
    element.addEventListener("m:data-table-change", listener)
    sort.addEventListener("click", event => event.preventDefault(), { once: true }); sort.click(); await settle()
    expect(element.state!.sort).toBeNull()
    for (const order of ["ascending", "descending", null]) {
      sort.click(); await settle(); expect(element.state!.sort?.order ?? null).toBe(order)
      expect(table.querySelectorAll("[aria-sort]").length).toBe(order ? 1 : 0)
    }
    expect(listener).toHaveBeenCalledTimes(3); expect(listener.mock.calls[0]![0].target).toBe(element)
  })
  it("programmatic writes are silent; user operations have distinct sources", async () => {
    const { element, root, check, filter } = fixture({ pageSize: 2 }), events: string[] = []
    element.addEventListener("m:data-table-change", event => events.push((event as CustomEvent).detail.source))
    element.select("page", true); element.set({ sort: null }); expect(events).toEqual([])
    root.querySelector<HTMLButtonElement>('[data-data-page="next"]')!.click(); await settle()
    check("c").click(); filter.value = "Alpha"; filter.dispatchEvent(new Event("change", { bubbles: true }))
    expect(events).toEqual(["page", "selection", "filter"])
  })
  it("does not let queued actions supersede explicit state writes", async () => {
    const { element, sort } = fixture()
    sort.click(); element.set({ sort: { key: "score", order: "descending" } }); await settle()
    expect(element.state!.sort?.order).toBe("descending")
  })
  it("preserves focused editors and selection on reorder, recovering focus when a row disappears", () => {
    const { element, row, root } = fixture(), input = document.createElement("input")
    input.value = "edited"; row("a").cells[1]!.append(input); input.focus(); input.setSelectionRange(1, 4)
    element.set({ sort: { key: "score", order: "descending" } })
    expect(document.activeElement).toBe(input); expect(input.selectionStart).toBe(1); expect(input.selectionEnd).toBe(4)
    element.data = data().slice(1); expect(document.activeElement).toBe(root)
  })
  it("does not steal outside focus and does not overwrite composing drafts", () => {
    const { element, filter } = fixture(), outside = document.createElement("button")
    document.body.append(outside); outside.focus(); element.set({ sort: { key: "score", order: "ascending" } })
    expect(document.activeElement).toBe(outside)
    filter.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); filter.value = "Bravo"
    expect(() => element.set({ filters: { name: "Alpha" } })).toThrow("composing")
    filter.dispatchEvent(new Event("change", { bubbles: true })); expect(element.state!.visibleKeys).toHaveLength(4)
    filter.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })); expect(element.state!.visibleKeys).toEqual(["b"])
  })
  it.each(["throw", "nan", "promise", "filter", "summary"])("prepares %s callback failures before any DOM/data commit", kind => {
    let fail = false
    const { element, table } = fixture({
      columns: [{ key: "name", label: "Name", filter: () => fail && kind === "filter" ? "truthy" as never : true },
        { key: "score", label: "Score", compare: (a, b) => {
          if (fail && kind === "throw") throw new Error("Failure")
          return fail && kind === "nan" ? NaN : fail && kind === "promise" ? Promise.resolve(1) as never : Number(a.values[1]) - Number(b.values[1])
        } }],
      summaries: [{ key: "total", scope: "page", value: () => { if (fail && kind === "summary") throw new Error("Failure"); return "OK" } }],
    })
    element.set({ sort: { key: "score", order: "ascending" }, filters: { name: "active" } })
    const before = element.state, records = element.data, html = table.outerHTML, nodes = [...table.rows]; fail = true
    expect(() => { element.data = [{ key: "new", values: ["New", 8] }, ...data()] }).toThrow()
    expect(element.state).toEqual(before); expect(element.data).toBe(records)
    expect(table.outerHTML).toBe(html); expect([...table.rows]).toEqual(nodes)
  })
  it("guards initialization and live callback reentrancy without a competing facade transaction", () => {
    let element: DataTable | undefined, reenter = false
    const target = new DataTable(); target.options = { columns: [{ key: "name", label: "Name" }],
      summaries: [{ key: "total", scope: "all", value: () => {
        expect(() => { target.data = [] }).toThrow(/preparation|reenter/)
        expect(() => { target.size = "small" }).toThrow(/preparation|reenter/)
        return "OK"
      } }] }
    target.data = [{ key: "a", values: ["A"] }]; document.body.append(target)
    const f = fixture({ summaries: [{ key: "total", scope: "all", value: () => { if (reenter) element!.set({ sort: null }); return "OK" } }] })
    element = f.element; reenter = true
    expect(() => element!.set({ pageSize: 2 })).toThrow("reenter"); expect(element.state!.pageSize).toBeNull()
  })
  it("allows callback disconnect but aborts the stale commit", () => {
    let stop: (() => void) | undefined
    const { element, row } = fixture({ summaries: [{ key: "total", scope: "all", value: () => { stop?.(); return "OK" } }] })
    stop = () => element.remove()
    expect(() => element.set({ pageSize: 2 })).toThrow("disconnected")
    expect(row("c").hidden).toBe(false)
  })
  it("rejects callback changes to native row order and visibility before commit", () => {
    let mutate: (() => void) | undefined
    const { element, row } = fixture({ summaries: [{ key: "total", scope: "all", value: () => { mutate?.(); return "OK" } }] })
    const before = element.state
    mutate = () => { row("a").hidden = true }
    expect(() => element.set({ pageSize: 2 })).toThrow("visibility")
    expect(element.state).toEqual(before)
  })
  it("reports failed user callbacks without a success event, retaining the rejected draft", () => {
    const { element, filter } = fixture({ columns: [{ key: "name", label: "Name", filter: () => { throw new Error("Bad filter") } }, { key: "score", label: "Score" }] })
    const errors = vi.fn(), changed = vi.fn()
    element.addEventListener("m:data-table-error", errors); element.addEventListener("m:data-table-change", changed)
    filter.value = "draft"; filter.dispatchEvent(new Event("change", { bubbles: true }))
    expect(filter.value).toBe("draft"); expect(element.state!.visibleKeys).toHaveLength(4)
    expect(errors).toHaveBeenCalledOnce(); expect(changed).not.toHaveBeenCalled()
    element.set({ filters: null }); expect(filter.value).toBe("")
  })
  it("restores leased attributes on disconnect without discarding external overrides", () => {
    const { element, row, table } = fixture({ pageSize: 2 })
    row("c").hidden = false; table.setAttribute("aria-busy", "true")
    element.disconnectedCallback()
    expect(row("c").hidden).toBe(false); expect(table.getAttribute("aria-busy")).toBe("true")
    expect(() => element.refresh()).toThrow("connected")
  })
  it.each(["key", "span", "role", "body", "summary", "checkbox"])("rejects native %s corruption before changing committed state", kind => {
    const { element, table, row, root, check } = fixture(), before = element.state
    if (kind === "key") row("a").dataset.dataKey = "other"
    if (kind === "span") row("a").cells[1]!.colSpan = 2
    if (kind === "role") table.setAttribute("role", "grid")
    if (kind === "body") table.createTBody()
    if (kind === "summary") root.querySelector("[data-data-summary]")!.append(document.createElement("strong"))
    if (kind === "checkbox") check("a").value = "other"
    expect(() => element.refresh()).toThrow(); expect(element.state).toEqual(before)
  })
})
