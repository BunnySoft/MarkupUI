import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"
import { createDataTable } from "../src/components/data-table/index.js"
import type { DataTableController, DataTableOptions } from "../src/components/data-table/index.js"
import { createForm } from "../src/components/form/index.js"
import { createCheckboxGroup } from "../src/components/checkbox/index.js"

const controllers: DataTableController[] = []
const baseCss = readFileSync(join("src", "components", "table", "table.css"), "utf8")
const componentCss = readFileSync(join("src", "components", "data-table", "data-table.css"), "utf8")
const settle = () => new Promise(resolve => setTimeout(resolve, 0))
const numeric = (row: HTMLTableRowElement) => row.querySelector<HTMLInputElement>('[type="number"]')!.valueAsNumber
const dataRow = (key: string, score: number, extra = "") => `<tr data-data-key="${key}"><td><label><input type="checkbox" data-data-check name="keys" value="${key}" ${extra}>Select ${key}</label></td><th scope="row" id="row-${key}">${key}</th><td headers="row-${key} score"><label>Score ${key}<input type="number" name="score-${key}" value="${score}" required></label><button type="button">Cell action</button></td></tr>`
function markup(rows = dataRow("a", 10) + dataRow("b", 2) + dataRow("c", 2, "checked") + dataRow("d", 30, "checked disabled")) {
  return `<section class="mui-data-table" data-data-table aria-label="Scores">
    <div class="mui-data-table-controls"><label>Filter<input type="search" data-data-filter="name"></label>
    <label>Size<select data-data-page-size><option value="2">2</option><option value="all" selected>All</option></select></label>
    <button type="button" data-data-page="previous" hidden>Previous</button><button type="button" data-data-page="next" hidden>Next</button><span data-data-count></span></div>
    <div class="mui-data-table-scroll" tabindex="0" role="region" aria-label="Scrollable scores">
    <table class="mui-table" data-data-table-table><caption>Scores</caption><thead><tr><th scope="col"><label><input type="checkbox" data-data-check-all data-data-scope="page">Select page</label></th>
    <th scope="col" data-data-column="name">Name</th><th id="score" scope="col" data-data-column="score">Score<button type="button" data-data-sort="score" hidden>Sort score</button></th></tr></thead>
    <tbody>${rows}</tbody><tfoot><tr><th scope="row" colspan="2">Page total</th><td><span data-data-summary="total">44</span></td></tr></tfoot></table></div>
    <p data-data-empty hidden>No matching rows</p><p data-data-loading hidden>Loading</p></section>`
}
function fixture(options: Partial<DataTableOptions> = {}, transform?: (root: HTMLElement) => void) {
  const form = document.createElement("form")
  form.innerHTML = markup() + '<button type="button" id="outside">Outside</button>'
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-data-table]")!
  transform?.(root)
  const helper = createDataTable(root, {
    columns: [
      { key: "score", compare: (a, b) => numeric(a) - numeric(b) },
      { key: "name", filter: (row, value) => row.cells[1]!.textContent!.includes(value) },
    ],
    summaries: [{ key: "total", scope: "page", value: rows => String(rows.reduce((total, row) => total + numeric(row), 0)) }],
    ...options,
  })
  controllers.push(helper)
  const row = (key: string) => [...helper.table.tBodies[0]!.rows].find(row => row.dataset.dataKey === key)!
  const check = (key: string) => row(key).querySelector<HTMLInputElement>("[data-data-check]")!
  const all = root.querySelector<HTMLInputElement>("[data-data-check-all]")!
  const sort = root.querySelector<HTMLButtonElement>("[data-data-sort]")!
  const filter = root.querySelector<HTMLInputElement>("[data-data-filter]")!
  return { form, root, helper, row, check, all, sort, filter }
}
afterEach(() => { controllers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("native table operations", () => {
  it("keeps Data Table-specific defaults within the composed CSS budget without changing Table policy", () => {
    expect(baseCss).toContain("border-collapse: collapse")
    expect(baseCss).toContain("--_mui-table-padding: 6px")
    expect(componentCss).toContain('.mui-table[data-size="small"] { --_mui-table-padding: 8px; }')
    expect(componentCss).toContain("var(--mui-data-table-scroll-padding, 0)")
    expect(componentCss).toContain("font-variant-numeric: normal")
    expect(componentCss).toContain("font-weight: var(--mui-table-header-weight, 400)")
    expect(componentCss).toContain("#f7f7fa")
    expect(componentCss).toContain("#f3f3f7")
    expect(componentCss).toContain("#26262a")
    expect(componentCss).toContain("#333337")
    expect(componentCss).toContain("var(--mui-data-table-selected-background, transparent)")
    expect(componentCss).not.toContain("#e7f2ff")
    expect(componentCss).not.toContain("border-style: dashed")
    expect(componentCss).not.toContain("pointer-events: none")
    expect(componentCss).toContain("[data-data-sort]:disabled { cursor: default; opacity: .5; }")
    expect(gzipSync(`${baseCss}\n${componentCss}`, { level: 9 }).length).toBeLessThanOrEqual(2000)
  })
  it("retains original rows, fields and author styles while presentation states change", () => {
    const { helper, root, row, check } = fixture()
    const a = row("a"), field = a.querySelector<HTMLInputElement>('[type="number"]')!
    root.style.cssText = "--mui-data-table-hover-background:rgb(1,2,3);--mui-data-table-selected-background:rgb(4,5,6);--mui-data-table-color:rgb(7,8,9)"
    const authored = root.getAttribute("style")
    const style = document.createElement("style")
    style.textContent = `${baseCss}\n${componentCss}`
    document.head.append(style)
    try {
      field.value = "8"
      helper.set({ loading: true, sort: { key: "score", order: "ascending" } })
      expect(row("a")).toBe(a)
      expect(field.value).toBe("8")
      expect(field.disabled).toBe(false)
      expect(check("d").disabled && check("d").checked).toBe(true)
      expect(root.getAttribute("style")).toBe(authored)
      expect(helper.table.getAttribute("role")).toBeNull()
      expect(helper.table.getAttribute("aria-busy")).toBe("true")
      expect(root.querySelector("[data-data-loading]")?.textContent).toBe("Loading")
    } finally { style.remove() }
  })
  it("does not treat aria-sort none as a sorted header and preserves system disabled paint", () => {
    document.body.innerHTML = '<div class="mui-data-table"><div class="mui-data-table-scroll"><table class="mui-table"><thead><tr><th>Score</th></tr></thead></table></div></div>'
    const style = document.createElement("style")
    style.textContent = componentCss
    document.head.append(style)
    try {
      const rules = [...style.sheet!.cssRules]
      const isStyle = (rule: CSSRule): rule is CSSStyleRule => rule.type === CSSRule.STYLE_RULE
      const isMedia = (rule: CSSRule): rule is CSSMediaRule => rule.type === CSSRule.MEDIA_RULE
      const sorted = rules.filter(isStyle).find(rule => rule.style.getPropertyValue("background").includes("--mui-data-table-sort-background"))!
      // jsdom cannot match this combined :is/:has selector; Chromium covers its full live behavior.
      const stateSelector = sorted.selectorText.replace(/,\s*:has\(>\s*\[data-data-sort\]:not\(\[hidden\],\s*:disabled\)\):hover/, "")
      expect(stateSelector).not.toContain(":has")
      expect(sorted.selectorText).not.toContain("[aria-sort]")
      const header = document.querySelector("th")!
      for (const value of ["none", "other"]) {
        header.setAttribute("aria-sort", value)
        expect(header.matches(stateSelector)).toBe(false)
      }
      for (const value of ["ascending", "descending"]) {
        header.setAttribute("aria-sort", value)
        expect(header.matches(stateSelector)).toBe(true)
      }
      const forced = rules.filter(isMedia).find(rule => rule.conditionText === "(forced-colors: active)")!
      const disabled = [...forced.cssRules].filter(isStyle).find(rule => rule.selectorText.endsWith("[data-data-sort]:disabled"))!
      expect(disabled.style.getPropertyValue("opacity")).toBe("1")
      expect(disabled.style.getPropertyValue("color")).toBe("GrayText")
    } finally { style.remove() }
  })
  it("preserves table, caption, scoped headers, footer spans and associations", () => {
    const { helper, row } = fixture()
    expect(helper.table.getAttribute("role")).toBeNull()
    expect(helper.table.caption!.textContent).toBe("Scores")
    expect(row("a").cells[2]!.getAttribute("headers")).toBe("row-a score")
    expect(helper.table.tFoot!.rows[0]!.cells[0]!.colSpan).toBe(2)
  })
  it("sorts numerically and keeps source-order ties in both directions", () => {
    const { helper } = fixture()
    helper.set({ sort: { key: "score", order: "ascending" } }); expect(helper.state.filteredKeys).toEqual(["b", "c", "a", "d"])
    helper.set({ sort: { key: "score", order: "descending" } }); expect(helper.state.filteredKeys).toEqual(["d", "a", "b", "c"])
  })
  it("restores natural source order after sorted refresh and null sort", () => {
    const { helper } = fixture()
    helper.set({ sort: { key: "score", order: "ascending" } }); helper.refresh(); helper.set({ sort: null })
    expect(helper.state.filteredKeys).toEqual(["a", "b", "c", "d"])
  })
  it("moves original rows, preserving controls, edits, listeners and details", () => {
    const { helper, row } = fixture(), a = row("a"), input = a.querySelector<HTMLInputElement>('[type="number"]')!, listener = vi.fn()
    a.addEventListener("example", listener); input.value = "7"; a.cells[1]!.insertAdjacentHTML("beforeend", "<details open><summary>More</summary>Native detail</details>")
    helper.set({ sort: { key: "score", order: "ascending" } })
    expect(row("a")).toBe(a); expect(input.value).toBe("7"); expect(a.querySelector("details")!.open).toBe(true)
    a.dispatchEvent(new Event("example")); expect(listener).toHaveBeenCalledOnce()
  })
  it("filters before sorting before paging, without unmounting", () => {
    const { helper, row } = fixture({ pageSize: 2 })
    helper.set({ sort: { key: "score", order: "ascending" } })
    expect(helper.state.visibleKeys).toEqual(["b", "c"]); expect(row("a").hidden).toBe(true); expect(row("a").isConnected).toBe(true)
    helper.set({ page: 2 }); expect(helper.state.visibleKeys).toEqual(["a", "d"])
    helper.set({ filters: { name: "a" } }); expect(helper.state.visibleKeys).toEqual(["a"]); expect(helper.state.page).toBe(1)
  })
  it("represents filtered empty as page 1 of 0, never selecting an unrelated row", () => {
    const { helper, root } = fixture({ pageSize: 2 })
    helper.set({ filters: { name: "missing" } })
    expect(helper.state.visibleKeys).toEqual([]); expect(helper.state.pageCount).toBe(0); expect(helper.state.page).toBe(1)
    expect(root.querySelector<HTMLElement>("[data-data-empty]")!.hidden).toBe(false)
    expect(root.querySelector("[data-data-count]")!.textContent).toContain("No matching rows")
  })
  it("rejects unknown page, column, order and filter keys atomically", () => {
    const { helper } = fixture({ pageSize: 2 }), before = helper.state
    for (const value of [{ page: 999999999999 }, { page: 0 }, { pageSize: 0 }, { sort: { key: "missing", order: "ascending" } }, { sort: { key: "score", order: "asc" } }, { filters: { other: "x" } }, { virtualScroll: true }]) {
      expect(() => helper.set(value as never)).toThrow(); expect(helper.state).toEqual(before)
    }
  })
  it("keeps fixed-size previous/next controls, not one button per page", () => {
    const { helper, root } = fixture({ pageSize: 2 })
    expect(root.querySelectorAll("[data-data-page]").length).toBe(2)
    expect(root.querySelector<HTMLButtonElement>('[data-data-page="previous"]')!.disabled).toBe(true)
    helper.set({ page: 2 }); expect(root.querySelector<HTMLButtonElement>('[data-data-page="next"]')!.disabled).toBe(true)
  })
  it("updates explicit footer scopes using text only", () => {
    const { helper, root } = fixture({ pageSize: 2, summaries: [{ key: "total", scope: "all", value: rows => `<b>${rows.length}</b>` }] })
    helper.set({ filters: { name: "a" } })
    expect(root.querySelector("[data-data-summary]")!.textContent).toBe("<b>4</b>")
    expect(root.querySelector("[data-data-summary] b")).toBeNull()
  })
  it("leaves native footer rowspans and authored summary associations intact", () => {
    const { helper } = fixture({}, root => {
      const foot = root.querySelector("tfoot")!
      foot.rows[0]!.cells[0]!.rowSpan = 2
      foot.insertRow().insertCell().textContent = "Second footer value"
    })
    const foot = helper.table.tFoot!, first = foot.rows[0]!.cells[0]!
    helper.set({ sort: { key: "score", order: "descending" }, pageSize: 2 })
    expect(first.rowSpan).toBe(2); expect(first.colSpan).toBe(2); expect(foot.rows.length).toBe(2)
  })
  it("loading is informative aria-busy and native fields remain enabled", () => {
    const { helper, row, root } = fixture()
    helper.set({ loading: true })
    expect(helper.table.getAttribute("aria-busy")).toBe("true")
    expect(root.querySelector<HTMLElement>("[data-data-loading]")!.hidden).toBe(false)
    expect(row("a").querySelector<HTMLInputElement>('[type="number"]')!.disabled).toBe(false)
    helper.set({ loading: false }); expect(helper.table.hasAttribute("aria-busy")).toBe(false)
  })
})

describe("identity, structure and refresh", () => {
  it.each(["duplicate", "missing", "numeric", "group", "colspan", "rowspan", "role", "body"])("rejects unsupported %s anatomy before owning mutations", kind => {
    expect(() => fixture({}, root => {
      const table = root.querySelector("table")!, first = table.tBodies[0]!.rows[0]!
      if (kind === "duplicate") first.dataset.dataKey = "b"
      if (kind === "missing") first.removeAttribute("data-data-key")
      if (kind === "numeric") root.querySelector("[data-data-check]")!.setAttribute("value", "different")
      if (kind === "group") table.tHead!.rows[0]!.cells[0]!.colSpan = 2
      if (kind === "colspan") first.cells[1]!.colSpan = 2
      if (kind === "rowspan") first.cells[1]!.rowSpan = 0
      if (kind === "role") table.setAttribute("role", "grid")
      if (kind === "body") table.createTBody()
    })).toThrow()
  })
  it("adopts removed/replacement/new rows without resurrecting old nodes or defaults", () => {
    const { helper, row } = fixture(), removed = row("c")
    helper.set({ sort: { key: "score", order: "ascending" } })
    removed.remove(); helper.table.tBodies[0]!.insertAdjacentHTML("afterbegin", dataRow("new", 4)); helper.refresh()
    expect(helper.state.sourceKeys).toEqual(["a", "b", "d", "new"]); expect(helper.state.checkedKeys).toEqual(["d"])
    helper.set({ sort: null }); expect(helper.state.visibleKeys).toEqual(["a", "b", "d", "new"])
    helper.disconnect(); expect(removed.isConnected).toBe(false)
  })
  it("explicit sourceOrder is exact, validated atomically and survives sorting", () => {
    const { helper } = fixture()
    expect(() => helper.refresh({ sourceOrder: ["a"] })).toThrow()
    helper.refresh({ sourceOrder: ["d", "c", "b", "a"] }); helper.set({ sort: { key: "score", order: "ascending" } })
    expect(helper.state.visibleKeys).toEqual(["c", "b", "a", "d"])
    helper.set({ sort: null }); expect(helper.state.visibleKeys).toEqual(["d", "c", "b", "a"])
  })
  it("rejects in-place key mutation and leaves previously committed view state", () => {
    const { helper, row } = fixture(), before = helper.state
    row("a").dataset.dataKey = "other"
    expect(() => helper.refresh()).toThrow("immutable"); expect(helper.state.sourceKeys).toEqual(before.sourceKeys)
  })
  it("rejects changed summary/count children without destroying author updates", () => {
    const { helper, root } = fixture(), count = root.querySelector("[data-data-count]")!
    count.innerHTML = "<strong>Author replacement</strong>"
    expect(() => helper.refresh()).toThrow("plain-text"); expect(count.querySelector("strong")!.textContent).toBe("Author replacement")
  })
  it("requires rebind for duplicate/new action controls and header replacement", () => {
    const { helper, root, sort } = fixture(), clone = sort.cloneNode(true)
    sort.parentElement!.append(clone); expect(() => helper.refresh()).toThrow("anatomy"); clone.parentNode!.removeChild(clone)
    const header = helper.table.tHead!.rows[0]!.cells[0]!
    const replacement = header.cloneNode(true); header.replaceWith(replacement)
    expect(() => helper.refresh()).toThrow()
    expect(root.querySelector("thead")!.firstElementChild!.firstElementChild).toBe(replacement)
  })
  it("supports literal prototype-like filter keys without implicit inherited values", () => {
    const { helper, filter } = fixture({
      columns: [{ key: "__proto__", filter: (row, value) => row.cells[1]!.textContent === value }, { key: "score", compare: () => 0 }],
    }, root => {
      root.querySelector('[data-data-column="name"]')!.setAttribute("data-data-column", "__proto__")
      root.querySelector("[data-data-filter]")!.setAttribute("data-data-filter", "__proto__")
    })
    helper.set({ filters: { ["__proto__"]: "a" } }); expect(helper.state.visibleKeys).toEqual(["a"])
    helper.set({ filters: {} }); expect(filter.value).toBe(""); expect(helper.state.visibleKeys).toHaveLength(4)
  })
  it("clamps a shrinking refreshed page explicitly to the last surviving page", () => {
    const { helper, row } = fixture({ pageSize: 2, page: 2 })
    row("a").remove(); row("b").remove(); row("c").remove(); helper.refresh()
    expect(helper.state.page).toBe(1); expect(helper.state.visibleKeys).toEqual(["d"])
  })
  it("respects author-hidden rows, and unknown/author-hidden reveal is atomic", () => {
    const { helper, row } = fixture({}, root => { root.querySelector<HTMLElement>('[data-data-key="a"]')!.hidden = true })
    expect(helper.state.filteredKeys).toEqual(["b", "c", "d"])
    expect(() => helper.reveal("a")).toThrow("author-hidden"); expect(() => helper.reveal("missing")).toThrow()
    helper.disconnect(); expect(row("a").hidden).toBe(true)
  })
  it("keeps authored inert templates and unrelated nested native tables intact", () => {
    const { helper, row } = fixture({}, root => {
      root.querySelector("tbody")!.insertAdjacentHTML("beforeend", '<template><tr><td>Inert</td></tr></template>')
      root.querySelector('[data-data-key="a"] th')!.insertAdjacentHTML("beforeend", '<table><tbody><tr><td>Nested</td></tr></tbody></table>')
    })
    helper.set({ sort: { key: "score", order: "ascending" } })
    expect(helper.state.total).toBe(4); expect(row("a").querySelector("table")!.querySelector("td")!.textContent).toBe("Nested")
    expect(helper.table.querySelector("template")!.content.querySelector("tr")).not.toBeNull()
  })
  it("protects ownership across repeated binding and CheckboxGroup overlap", () => {
    const { root } = fixture()
    expect(() => createDataTable(root, { columns: [] })).toThrow("unowned")
    const fieldset = document.createElement("fieldset"); fieldset.className = "mui-checkbox-group"; fieldset.dataset.checkboxGroup = ""
    fieldset.innerHTML = '<legend>Native group</legend><label><input type="checkbox" data-checkbox value="a">A</label>'
    document.body.append(fieldset); const group = createCheckboxGroup(fieldset)
    expect(() => fixture({}, root => { const check = root.querySelector("[data-data-check]")!; const owned = fieldset.querySelector("input")!; owned.dataset.dataCheck = ""; check.replaceWith(owned) })).toThrow("CheckboxGroup")
    group.disconnect()
  })
  it("also prevents a later CheckboxGroup from stealing a Data Table checkbox", () => {
    const { helper, root, check } = fixture()
    const fieldset = document.createElement("fieldset"); fieldset.className = "mui-checkbox-group"; fieldset.dataset.checkboxGroup = ""
    fieldset.innerHTML = "<legend>Outer checkbox owner</legend>"
    root.before(fieldset); fieldset.append(root); check("a").dataset.checkbox = ""
    expect(() => createCheckboxGroup(fieldset)).toThrow("owner")
    helper.disconnect()
    const group = createCheckboxGroup(fieldset); group.disconnect()
  })
  it("keeps nested Data Table owners independent", () => {
    const parent = fixture(), outerSource = parent.helper.state.sourceKeys
    const container = document.createElement("div"); parent.row("a").cells[2]!.append(container); container.innerHTML = markup(dataRow("inner", 1))
    const innerRoot = container.querySelector<HTMLElement>("[data-data-table]")!
    const inner = createDataTable(innerRoot, { columns: [{ key: "score", compare: () => 0 }, { key: "name", filter: () => true }] }); controllers.push(inner)
    inner.select("all", true); parent.helper.refresh()
    expect(parent.helper.state.sourceKeys).toEqual(outerSource); expect(parent.helper.state.checkedKeys).toEqual(["c", "d"]); expect(inner.state.checkedKeys).toEqual(["inner"])
  })
})

describe("selection and native forms", () => {
  it("distinguishes checked row keys from arbitrary native field values", () => {
    const { helper, form } = fixture()
    expect(helper.state.checkedKeys).toEqual(["c", "d"])
    expect(new FormData(form).getAll("keys")).toEqual(["c"])
    expect(new FormData(form).get("score-a")).toBe("10")
  })
  it("scopes page/filtered/all selection explicitly and protects disabled selected rows", () => {
    const { helper } = fixture({ pageSize: 2 })
    helper.select("page", true); expect(helper.state.checkedKeys).toEqual(["a", "b", "c", "d"])
    helper.set({ filters: { name: "a" } }); helper.select("filtered", false)
    expect(helper.state.checkedKeys).toEqual(["b", "c", "d"])
    helper.select("all", false); expect(helper.state.checkedKeys).toEqual(["d"])
    expect(() => helper.setCheckedKeys([])).toThrow("protected")
  })
  it("updates actual checkbox defaults independently and derives header mixed state", () => {
    const { helper, all, check } = fixture()
    expect(all.indeterminate).toBe(true)
    helper.setCheckedKeys(["a", "d"]); expect(check("a").checked).toBe(true); expect(check("a").defaultChecked).toBe(false)
    expect(check("c").defaultChecked).toBe(true); expect(all.indeterminate).toBe(true)
    expect(() => helper.setCheckedKeys(["d", "unknown"])).toThrow()
  })
  it("keeps hidden named fields successful, including hidden selected checkbox values", () => {
    const { helper, form, row } = fixture({ pageSize: 2 })
    expect(row("c").hidden).toBe(true)
    expect(new FormData(form).getAll("keys")).toEqual(["c"])
    expect(new FormData(form).get("score-c")).toBe("2")
    helper.set({ filters: { name: "missing" } }); expect(new FormData(form).get("score-a")).toBe("10")
  })
  it("requires deliberate reveal before native validation; never silently disables invalid fields", () => {
    const { helper, form, row } = fixture({ pageSize: 2 }), field = row("c").querySelector<HTMLInputElement>('[type="number"]')!
    field.value = ""
    expect(field.willValidate).toBe(true); expect(form.checkValidity()).toBe(false)
    helper.revealAll(); expect(row("c").hidden).toBe(false); expect(field.disabled).toBe(false); expect(form.reportValidity()).toBe(false)
  })
  it("revealAll clears stale sort so incomplete numeric edits can be validated", () => {
    const { helper, row } = fixture({ pageSize: 2 })
    helper.set({ sort: { key: "score", order: "ascending" } })
    row("a").querySelector<HTMLInputElement>('[type="number"]')!.value = ""
    helper.revealAll(); expect(helper.state.sort).toBeNull(); expect(row("a").hidden).toBe(false)
  })
  it("composes existing native Form without a proxy or second data model", async () => {
    const { helper, form, row } = fixture({ pageSize: 2 }), control = row("c").querySelector<HTMLInputElement>('[type="number"]')!
    control.value = ""; helper.revealAll()
    const native = createForm(form, { items: [{ key: "score", controls: [control] }] })
    const result = await native.validate(); expect(result.status).toBe("invalid"); expect(result.issues[0]!.control).toBe(control)
    native.disconnect()
  })
  it("reveals a known key by clearing filters and choosing its sorted page", () => {
    const { helper, row } = fixture({ pageSize: 2 })
    helper.set({ filters: { name: "b" }, sort: { key: "score", order: "ascending" } })
    expect(helper.reveal("a")).toBe(row("a")); expect(helper.state.page).toBe(2); expect(helper.state.visibleKeys).toEqual(["a", "d"])
  })
  it("settles native defaultChecked reset, including disabled defaults, without user notifications", async () => {
    const { helper, check, form, root, all } = fixture(), change = vi.fn()
    root.addEventListener("mui:data-table-change", change); helper.setCheckedKeys(["a", "d"])
    check("d").defaultChecked = false
    form.reset(); expect(() => helper.select("all", true)).toThrow("reset"); await settle()
    expect(helper.state.checkedKeys).toEqual(["c"]); expect(all.indeterminate).toBe(true); expect(change).not.toHaveBeenCalled()
  })
  it("restores native filter defaults and initial sort after reset", async () => {
    const { helper, filter, form } = fixture({ sort: { key: "score", order: "ascending" } })
    filter.defaultValue = "a"; helper.set({ filters: { name: "b" }, sort: null })
    form.reset(); await settle()
    expect(helper.state.filters).toEqual({ name: "a" }); expect(helper.state.sort?.order).toBe("ascending")
  })
  it("settles explicit external form associations even without row selection", async () => {
    const { helper, form, root, row } = fixture({}, root => {
      root.querySelectorAll("[data-data-check],[data-data-check-all]").forEach(node => node.remove())
    })
    form.id = "external"; document.body.append(root)
    const field = row("a").querySelector<HTMLInputElement>('[type="number"]')!; field.setAttribute("form", form.id)
    field.value = "99"; helper.refresh(); expect(root.querySelector("[data-data-summary]")!.textContent).toBe("133")
    form.reset(); await settle()
    expect(field.value).toBe("10"); expect(root.querySelector("[data-data-summary]")!.textContent).toBe("44")
  })
  it("honors cancelled native resets and canceled checkbox activation", async () => {
    const { helper, form, check } = fixture()
    helper.setCheckedKeys(["a", "d"]); form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await settle()
    expect(helper.state.checkedKeys).toEqual(["a", "d"])
    check("b").addEventListener("click", event => event.preventDefault()); check("b").click(); await settle()
    expect(helper.state.checkedKeys).toEqual(["a", "d"])
  })
})

describe("events, focus and callback failures", () => {
  it("native header activation cycles one aria-sort and emits one settled event", async () => {
    const { helper, root, sort } = fixture(), change = vi.fn()
    root.addEventListener("mui:data-table-change", change)
    sort.click(); await settle(); expect(helper.state.sort?.order).toBe("ascending")
    expect(helper.table.querySelectorAll("[aria-sort]").length).toBe(1)
    sort.click(); await settle(); expect(helper.state.sort?.order).toBe("descending")
    sort.click(); await settle(); expect(helper.state.sort).toBeNull(); expect(helper.table.querySelector("[aria-sort]")).toBeNull()
    expect(change).toHaveBeenCalledTimes(3)
  })
  it("programmatic operations stay silent; user filter/selection/page events are distinct", async () => {
    const { helper, root, filter, check } = fixture({ pageSize: 2 }), events: string[] = []
    root.addEventListener("mui:data-table-change", event => events.push((event as CustomEvent).detail.source))
    helper.set({ sort: null }); helper.select("page", true); expect(events).toEqual([])
    root.querySelector<HTMLButtonElement>('[data-data-page="next"]')!.click(); await settle()
    check("c").click(); filter.value = "a"; filter.dispatchEvent(new Event("change", { bubbles: true }))
    expect(events).toEqual(["page", "selection", "filter"])
  })
  it("honors canceled sort clicks after dispatch", async () => {
    const { helper, sort } = fixture()
    sort.addEventListener("click", event => event.preventDefault()); sort.click(); await settle()
    expect(helper.state.sort).toBeNull()
  })
  it("preserves a focused input and text selection with insertBefore fallback", () => {
    const { helper, row } = fixture(), input = document.createElement("input")
    input.value = "edited"; row("a").cells[2]!.append(input); input.focus(); input.setSelectionRange(1, 4)
    helper.set({ sort: { key: "score", order: "descending" } })
    expect(document.activeElement).toBe(input); expect(input.selectionStart).toBe(1); expect(input.selectionEnd).toBe(4)
  })
  it("moves focus to the region if paging hides or refresh removes the focused row", () => {
    const { helper, row, root } = fixture({ pageSize: 2 }), field = row("a").querySelector<HTMLInputElement>('[type="number"]')!
    field.focus(); helper.set({ page: 2 }); expect(document.activeElement).toBe(root)
    const fieldD = row("d").querySelector<HTMLInputElement>('[type="number"]')!; fieldD.focus(); row("d").remove(); helper.refresh()
    expect(document.activeElement).toBe(root)
  })
  it("never steals outside focus on sort or filter changes", () => {
    const { helper } = fixture(), outside = document.getElementById("outside")!
    outside.focus(); helper.set({ sort: { key: "score", order: "ascending" }, filters: { name: "a" } })
    expect(document.activeElement).toBe(outside)
  })
  it("does not replace IME drafts until composition settles", () => {
    const { helper, filter } = fixture()
    filter.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); filter.value = "b"
    expect(() => helper.set({ filters: { name: "a" } })).toThrow("composing")
    filter.dispatchEvent(new Event("change", { bubbles: true })); expect(helper.state.visibleKeys).toHaveLength(4)
    filter.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })); expect(helper.state.visibleKeys).toEqual(["b"])
  })
  it.each(["throw", "nan", "promise", "filter", "summary"])("validates %s callback failure before table or state mutations", kind => {
    let fail = false
    const { helper } = fixture({
      columns: [
        { key: "score", compare: (a, b) => { if (fail && kind === "throw") throw new Error("compare failed"); return fail && kind === "nan" ? NaN : fail && kind === "promise" ? Promise.resolve(1) as never : numeric(a) - numeric(b) } },
        { key: "name", filter: () => fail && kind === "filter" ? "truthy" as never : true },
      ],
      summaries: [{ key: "total", scope: "page", value: () => { if (fail && kind === "summary") throw new Error("summary failed"); return "OK" } }],
    })
    const before = helper.state, nodes = [...helper.table.tBodies[0]!.rows]; fail = true
    expect(() => helper.set({ sort: { key: "score", order: "ascending" }, filters: { name: "x" } })).toThrow()
    expect(helper.state).toEqual(before); expect([...helper.table.tBodies[0]!.rows]).toEqual(nodes); expect(helper.error).not.toBeNull()
  })
  it("rejects callback reentrancy before any own commit", () => {
    let again: (() => void) | undefined
    const { helper } = fixture({ summaries: [{ key: "total", scope: "page", value: () => { again?.(); return "OK" } }] })
    again = () => helper.set({ sort: null })
    expect(() => helper.set({ pageSize: 2 })).toThrow("reenter"); expect(helper.state.pageSize).toBeNull()
  })
  it("allows callback disconnect but aborts its stale transaction", () => {
    let stop: (() => void) | undefined
    const { helper, row } = fixture({ summaries: [{ key: "total", scope: "page", value: () => { stop?.(); return "OK" } }] })
    stop = () => helper.disconnect()
    expect(() => helper.set({ pageSize: 2 })).toThrow("disconnected")
    expect(helper.connected).toBe(false); expect(row("c").hidden).toBe(false)
  })
  it("reports user callback failures explicitly without pretending success", async () => {
    const { helper, root, sort } = fixture({ columns: [{ key: "name", filter: () => true }, { key: "score", compare: () => { throw new Error("bad") } }] })
    const errors = vi.fn(), changed = vi.fn(); root.addEventListener("mui:data-table-error", errors); root.addEventListener("mui:data-table-change", changed)
    sort.click(); await settle()
    expect(errors).toHaveBeenCalledOnce(); expect(changed).not.toHaveBeenCalled(); expect(helper.state.sort).toBeNull()
  })
  it("retains a rejected native filter draft while the committed rows/state remain unchanged", () => {
    const { helper, filter, root } = fixture({ columns: [{ key: "name", filter: () => { throw new Error("bad filter") } }, { key: "score", compare: () => 0 }] })
    const errors = vi.fn(); root.addEventListener("mui:data-table-error", errors)
    filter.value = "draft"; filter.dispatchEvent(new Event("change", { bubbles: true }))
    expect(filter.value).toBe("draft"); expect(helper.state.filters.name).toBe(""); expect(helper.state.visibleKeys).toHaveLength(4)
    expect(errors).toHaveBeenCalledOnce()
    helper.set({ filters: null }); expect(filter.value).toBe("")
  })
  it("disconnect retains edits/current check/order, releases hidden rows and never resurrects removed data", () => {
    const { helper, row, sort, check } = fixture({ pageSize: 2 })
    helper.set({ sort: { key: "score", order: "ascending" } }); helper.select("all", true)
    const removed = row("d"); removed.remove()
    const before = [...helper.table.tBodies[0]!.rows]; helper.disconnect()
    expect([...helper.table.tBodies[0]!.rows]).toEqual(before); expect(check("a").checked).toBe(true)
    expect(row("a").hidden).toBe(false); expect(sort.hidden).toBe(true); expect(removed.isConnected).toBe(false)
    expect(() => helper.refresh()).toThrow("disconnected")
  })
  it("preserves externally overridden owned attributes on disconnect", () => {
    const { helper, row } = fixture({ pageSize: 2 })
    row("c").hidden = false; helper.table.setAttribute("aria-busy", "true"); helper.disconnect()
    expect(row("c").hidden).toBe(false); expect(helper.table.getAttribute("aria-busy")).toBe("true")
  })
})

describe("local bounds", () => {
  it("rejects 2001 native rows without partially hiding or adopting them", () => {
    expect(() => fixture({}, root => { root.querySelector("tbody")!.innerHTML = Array.from({ length: 2001 }, (_, index) => dataRow(`k${index}`, index)).join("") })).toThrow("2000")
    expect(document.querySelectorAll("tbody > tr[hidden]").length).toBe(0)
  })
})
