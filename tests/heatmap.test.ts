import { afterEach, describe, expect, it, vi } from "vitest"
import { buildHeatmap, createHeatmap, heatmapLevel } from "../src/components/heatmap/index.js"
import type { HeatmapController, HeatmapOptions } from "../src/components/heatmap/index.js"

const helpers: HeatmapController[] = []
const data = [{ date: "2024-02-01", value: -5 }, { date: "2024-02-10", value: 0 }, { date: "2024-02-29", value: 10 }]
function fixture(options: HeatmapOptions = {}, bind = true) {
  const form = document.createElement("form")
  form.innerHTML = `<h2 id="heatmap-title">Original <em>activity</em> heading</h2>
    <section class="mui-heatmap" data-heatmap tabindex="-1" aria-labelledby="heatmap-title">
      <div data-heatmap-scroll><table data-heatmap-table><caption>Daily data: <span data-heatmap-caption>Authored February</span></caption>
      <thead data-heatmap-head><tr><th scope="col">Date</th><th scope="col">Value</th></tr></thead>
      <tbody data-heatmap-body><tr><td>2024-02-01</td><td>-5</td></tr><tr><td>2024-02-10</td><td>0</td></tr></tbody></table></div>
      <template data-heatmap-cell><td><button type="button" data-heatmap-day><span data-heatmap-swatch></span><time data-heatmap-date></time><span data-heatmap-value></span><span data-heatmap-code></span></button></td></template>
      <div data-heatmap-legend><strong>Original legend prefix</strong><ul data-heatmap-bands><li>Authored value legend</li></ul><span>Original suffix</span></div>
      <p data-heatmap-detail>Inspect a date.</p><p data-heatmap-status>Original status</p>
      <footer><button type="button" data-author-action>Author action</button></footer>
    </section><label>Other<input name="other" value="kept"></label><button type="button" data-outside>Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-heatmap]")!, body = root.querySelector<HTMLTableSectionElement>("tbody")!
  const original = [...body.childNodes], helper = bind ? createHeatmap(root, { data, ...options }) : null
  if (helper) helpers.push(helper)
  const day = (date: string) => root.querySelector<HTMLButtonElement>(`[data-heatmap-date="${date}"]`)!
  function key(date: string, key: string, init: KeyboardEventInit = {}) {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init })
    day(date).dispatchEvent(event); return event
  }
  return { helper: helper!, root, body, original, day, key, form,
    detail: root.querySelector<HTMLElement>("[data-heatmap-detail]")!,
    status: root.querySelector<HTMLElement>("[data-heatmap-status]")!,
    outside: form.querySelector<HTMLButtonElement>("[data-outside]")! }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Heatmap explicit calendar data model", () => {
  it("sorts calendar cells by date and distinguishes missing, explicit null and real zero", () => {
    const model = buildHeatmap(document, { data: [{ date: "2024-02-03", value: 0 }, { date: "2024-02-01", value: null }] })
    const days = model.cells.filter(cell => cell !== null)
    expect(days.map(cell => cell.date)).toEqual(["2024-02-01", "2024-02-02", "2024-02-03"])
    expect(days[0]).toMatchObject({ value: null, supplied: true, level: null })
    expect(days[1]).toMatchObject({ value: null, supplied: false, level: null })
    expect(days[2]).toMatchObject({ value: 0, supplied: true, level: 2 })
    expect(model.domain).toEqual([0, 0]); expect(model.numericCount).toBe(1); expect(model.missingCount).toBe(2)
  })
  it("never creates zero-valued gaps and fills optional leading days as missing only", () => {
    const plain = buildHeatmap(document, { data: [{ date: "2024-02-01", value: 3 }] })
    const leading = buildHeatmap(document, { data: [{ date: "2024-02-01", value: 3 }], fillCalendarLeading: true })
    expect(plain.cells.filter(Boolean)).toHaveLength(1)
    expect(leading.cells.filter(Boolean)).toHaveLength(4)
    expect(leading.cells[0]).toMatchObject({ date: "2024-01-29", value: null, supplied: false, inRange: false })
    expect(leading.cells.at(-1)).toBeNull()
  })
  it("keeps empty data empty unless an explicit bounded calendar range is provided", () => {
    expect(buildHeatmap(document).weeks).toBe(0)
    const model = buildHeatmap(document, { range: ["2024-02-01", "2024-02-29"] })
    expect(model.numericCount).toBe(0); expect(model.missingCount).toBe(29); expect(model.domain).toBeNull()
  })
  it("uses source Monday=0..Sunday=6 numbering through the shared Gregorian primitives", () => {
    const monday = buildHeatmap(document, { data: [{ date: "2024-02-01", value: 1 }], firstDayOfWeek: 0 })
    const sunday = buildHeatmap(document, { data: [{ date: "2024-02-01", value: 1 }], firstDayOfWeek: 6 })
    expect(monday.weekLabels[0]).toBe("Monday"); expect(sunday.weekLabels[0]).toBe("Sunday")
    expect(monday.cells.find(Boolean)!.row).toBe(3); expect(sunday.cells.find(Boolean)!.row).toBe(4)
  })
  it("handles leap/century/year1/year9999 without timestamp or timezone inference", () => {
    const leap = buildHeatmap(document, { range: ["2024-02-28", "2024-03-01"] })
    expect(leap.cells.filter(Boolean).map(cell => cell!.date)).toEqual(["2024-02-28", "2024-02-29", "2024-03-01"])
    expect(() => buildHeatmap(document, { data: [{ date: "1900-02-29", value: 1 }] })).toThrow()
    const first = buildHeatmap(document, { range: ["0001-01-01", "0001-01-07"], firstDayOfWeek: 6, fillCalendarLeading: true })
    expect(first.cells[0]).toBeNull(); expect(first.cells[1]!.date).toBe("0001-01-01")
    expect(first.cells[1]!.label).toContain("Monday"); expect(first.cells[1]!.label).not.toContain("1901")
    const last = buildHeatmap(document, { range: ["9999-12-30", "9999-12-31"], fillCalendarLeading: true })
    expect(last.cells.filter(Boolean).at(-1)!.date).toBe("9999-12-31")
  })
  it("forces Gregorian/UTC labels despite alternate-calendar locale preferences", () => {
    const model = buildHeatmap(document, { data: [{ date: "2024-02-29", value: 1 }], locale: "th-TH-u-ca-buddhist" })
    expect(model.cells.find(Boolean)!.label).toContain("2024")
    expect(model.cells.find(Boolean)!.label).not.toContain("2567")
  })
  it("bounds records/range/padded cells before creating a sparse calendar explosion", () => {
    expect(() => buildHeatmap(document, { data: Array.from({ length: 367 }, () => ({ date: "2024-01-01", value: 1 })) })).toThrow(/366/)
    expect(() => buildHeatmap(document, { data: [{ date: "0001-01-01" }, { date: "9999-12-31" }] })).toThrow(/366/)
    const year = buildHeatmap(document, { range: ["2028-01-01", "2028-12-31"], firstDayOfWeek: 6, fillCalendarLeading: true })
    expect(year.weeks).toBe(54); expect(year.cells).toHaveLength(378)
  })
  it("rejects duplicate dates, out-of-range records and floating-to-instant guesses", () => {
    expect(() => buildHeatmap(document, { data: [{ date: "2024-01-01", value: 1 }, { date: "2024-01-01", value: 2 }] })).toThrow(/Duplicate/)
    expect(() => buildHeatmap(document, { data: [{ date: "2024-01-01" }], range: ["2024-02-01", "2024-02-02"] })).toThrow(/inside/)
    expect(() => buildHeatmap(document, { data: [{ timestamp: 0, value: 1 }] as never })).toThrow()
    expect(() => buildHeatmap(document, { data: [{ date: "2024-01-01T00:00:00Z" }] })).toThrow()
  })
})

describe("Heatmap numeric domain and deterministic bands", () => {
  it("maps normalized bands, clamps explicit outliers, and keeps negatives meaningful", () => {
    expect(heatmapLevel(-5, [-5, 10])).toMatchObject({ level: 0, position: 0, clamped: null })
    expect(heatmapLevel(0, [-5, 10]).level).toBe(1)
    expect(heatmapLevel(10, [-5, 10])).toMatchObject({ level: 4, position: 1 })
    expect(heatmapLevel(-100, [-5, 10])).toMatchObject({ level: 0, clamped: "low" })
    expect(heatmapLevel(100, [-5, 10])).toMatchObject({ level: 4, clamped: "high" })
  })
  it("uses p=.5 for constant/all-zero domains, with deterministic explicit thresholds", () => {
    expect(heatmapLevel(0, [0, 0])).toMatchObject({ level: 2, position: .5 })
    expect(heatmapLevel(5, [5, 5], [.1, .2, .3, .4]).level).toBe(4)
    expect(heatmapLevel(4, [5, 5])).toMatchObject({ level: 0, clamped: "low" })
    expect(heatmapLevel(6, [5, 5])).toMatchObject({ level: 4, clamped: "high" })
  })
  it("stays finite for accepted extremes and subnormal domains by clamping before division", () => {
    expect(heatmapLevel(0, [-1e12, 1e12]).position).toBe(.5)
    expect(heatmapLevel(1e12, [0, Number.MIN_VALUE])).toMatchObject({ level: 4, position: 1, clamped: "high" })
    expect(heatmapLevel(Number.MIN_VALUE, [0, Number.MIN_VALUE]).position).toBe(1)
  })
  it.each([NaN, Infinity, -Infinity, 1e12 + 1, -1e12 - 1, "2"])("rejects unsupported value %s", value => {
    expect(() => buildHeatmap(document, { data: [{ date: "2024-01-01", value: value as number }] })).toThrow()
  })
  it.each([[.2, .2, .6, .8], [0, .4, .6, .8], [.2, .4, .6, 1], [.2, .4, .6], [.2, , .6, .8], [.2, NaN, .6, .8]])("rejects invalid thresholds %j", thresholds => {
    expect(() => buildHeatmap(document, { thresholds: thresholds as never })).toThrow()
  })
  it("does not coerce missing data into an explicit numeric domain", () => {
    const model = buildHeatmap(document, { data: [{ date: "2024-02-01" }, { date: "2024-02-02", value: null }] })
    expect(model.domain).toBeNull(); expect(model.cells.filter(Boolean).every(cell => cell!.level === null)).toBe(true)
  })
})

describe("Heatmap native table, legend, exploration and identity", () => {
  it("renders real values, missing labels and level codes in a native table with one tab stop", () => {
    const { helper, root, body, day, form } = fixture()
    expect(body.rows).toHaveLength(7); expect(helper.state.numericCount).toBe(3); expect(helper.state.missingCount).toBe(26)
    expect(day("2024-02-10").querySelector("[data-heatmap-value]")!.textContent).toBe("0")
    expect(day("2024-02-11").querySelector("[data-heatmap-value]")!.textContent).toBe("Missing")
    expect(root.querySelectorAll("[data-heatmap-day][tabindex='0']")).toHaveLength(1)
    expect(root.querySelector("[role=grid],[role=gridcell],[role=tab]")).toBeNull()
    expect(root.querySelectorAll("th[scope=row]")).toHaveLength(7)
    expect(root.querySelectorAll("th[scope=col]")).toHaveLength(helper.state.weeks)
    expect([...new FormData(form)]).toEqual([["other", "kept"]])
  })
  it("keeps weekday semantic cells when visual labels are disabled and can hide the legend", () => {
    const { helper, root } = fixture()
    helper.set({ showWeekLabels: false, showMonthLabels: false, showColorIndicator: false })
    const th = root.querySelector('th[scope="row"]')!
    expect(th.classList.contains("mui-heatmap-visually-hidden")).toBe(false)
    expect(th.firstElementChild!.classList.contains("mui-heatmap-visually-hidden")).toBe(true)
    expect(root.querySelector("[data-heatmap-bands]")!.hasAttribute("hidden")).toBe(true)
    expect(root.querySelector("[data-heatmap-legend]")!.hasAttribute("hidden")).toBe(false)
    expect(root.querySelectorAll("th[scope=colgroup]")).toHaveLength(0)
  })
  it("uses a persistent nonlive detail view instead of a title-only tooltip", () => {
    const { helper, day, detail } = fixture({ describe: cell => cell.date === "2024-02-10" ? "<em>Literal note</em>" : "" })
    helper.explore("2024-02-10")
    expect(detail.textContent).toContain("2024-02-10: 0"); expect(detail.textContent).toContain("<em>Literal note</em>")
    expect(detail.querySelector("em")).toBeNull(); expect(day("2024-02-10").hasAttribute("title")).toBe(false)
    expect(detail.hasAttribute("aria-live")).toBe(false)
  })
  it("implements scoped arrows/Home/End/Ctrl edges and native activation without a Tab trap", () => {
    const { helper, root, day, key, detail } = fixture(), activate = vi.fn()
    root.addEventListener("mui:heatmap-explore", activate)
    day("2024-02-08").focus(); key("2024-02-08", "ArrowDown")
    expect(helper.state.currentDate).toBe("2024-02-09"); expect(detail.textContent).toContain("Missing")
    key("2024-02-09", "ArrowRight"); expect(helper.state.currentDate).toBe("2024-02-16")
    key("2024-02-16", "Home"); expect(helper.state.currentDate).toBe("2024-02-02")
    key("2024-02-02", "End"); expect(helper.state.currentDate).toBe("2024-02-23")
    key("2024-02-23", "End", { ctrlKey: true }); expect(helper.state.currentDate).toBe("2024-02-29")
    expect(key("2024-02-29", "Tab").defaultPrevented).toBe(false)
    expect(key("2024-02-29", "Enter").defaultPrevented).toBe(false)
    expect(activate).not.toHaveBeenCalled()
    day("2024-02-29").click(); expect(activate).toHaveBeenCalledOnce()
  })
  it("uses physical RTL week navigation and ignores editing/modifier keys", () => {
    const { helper, root, day, key, form } = fixture()
    root.querySelector("table")!.style.direction = "rtl"
    day("2024-02-08").focus(); key("2024-02-08", "ArrowLeft"); expect(helper.state.currentDate).toBe("2024-02-15")
    expect(key("2024-02-15", "ArrowDown", { isComposing: true }).defaultPrevented).toBe(false)
    const inputEvent = new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })
    form.querySelector("input")!.dispatchEvent(inputEvent); expect(inputEvent.defaultPrevented).toBe(false)
  })
  it("preserves focused cell nodes through data changes, and falls back safely when dates disappear", () => {
    const { helper, root, day } = fixture(), node = day("2024-02-10")
    node.focus(); const listener = vi.fn(); node.addEventListener("probe", listener)
    helper.set({ data: [{ date: "2024-02-01", value: 1 }, { date: "2024-02-29", value: 2 }] })
    expect(day("2024-02-10")).toBe(node); expect(document.activeElement).toBe(node)
    expect(node.querySelector("[data-heatmap-value]")!.textContent).toBe("Missing")
    node.dispatchEvent(new Event("probe")); expect(listener).toHaveBeenCalledOnce()
    helper.set({ data: [{ date: "2024-03-01", value: 2 }] })
    expect(document.activeElement).toBe(root); expect(helper.state.currentDate).toBe("2024-03-01")
  })
  it("preserves outside focus, native forms and author header/footer controls", () => {
    const { helper, form, outside, root } = fixture(), heading = form.querySelector("h2")!, action = root.querySelector("[data-author-action]")!
    outside.focus(); helper.set({ firstDayOfWeek: 6, loading: true, colorTheme: "blue" })
    expect(document.activeElement).toBe(outside); expect(form.querySelector("h2")).toBe(heading); expect(root.querySelector("[data-author-action]")).toBe(action)
    expect([...new FormData(form)]).toEqual([["other", "kept"]])
    expect(helper.table.getAttribute("aria-busy")).toBe("true")
  })
  it("uses real data while loading, rather than a random hidden-zero matrix", () => {
    const { helper, day, status } = fixture({ loading: true })
    expect(helper.state.numericCount).toBe(3); expect(day("2024-02-10").textContent).toContain("0")
    expect(status.textContent).toContain("displayed values remain real data")
  })
  it("uses theme/custom/minimum color precedence through validated CSS properties only", () => {
    const colors = ["#111111", "#222222", "#333333", "#444444", "#555555"]
    const { helper, root } = fixture({ colorTheme: "red", activeColors: colors, minimumColor: "#abcdef" })
    expect(root.style.getPropertyValue("--mui-heatmap-level-0")).toBe("#abcdef")
    expect(root.style.getPropertyValue("--mui-heatmap-level-4")).toBe("#555555")
    helper.set({ activeColors: null, minimumColor: null })
    expect(root.style.getPropertyValue("--mui-heatmap-level-0")).toBe("")
  })
})

describe("Heatmap atomic validation and lifetime", () => {
  it.each([{ data: [{ date: "2023-02-29", value: 1 }] }, { firstDayOfWeek: 7 }, { locale: "zz-ZZ" },
    { domain: [5, -5] }, { range: ["2024-03-01", "2024-02-01"] }, { activeColors: ["red"] },
    { activeColors: ["#111111", "#222222", , "#444444", "#555555"] }, { minimumColor: "url(evil)" },
    { loadingData: [] }, { thresholds: [0, .2, .5, .8] }, { describe: () => document.createElement("b") }])("rejects invalid updates before DOM/state changes", input => {
    const { helper, body, root } = fixture(), before = body.innerHTML, state = helper.state, style = root.getAttribute("style")
    expect(() => helper.set(input as HeatmapOptions)).toThrow()
    expect(body.innerHTML).toBe(before); expect(helper.state).toEqual(state); expect(root.getAttribute("style")).toBe(style)
  })
  it("prepares all callback output before mutation and guards reentrancy", async () => {
    const { helper, body } = fixture(), before = body.innerHTML
    expect(() => helper.set({ describe: cell => { if (cell.date.endsWith("-15")) throw new Error("late cell"); return "valid" } })).toThrow("late cell")
    expect(body.innerHTML).toBe(before)
    expect(() => helper.set({ describe: () => { helper.refresh(); return "" } })).toThrow(/reenter/)
    expect(() => helper.set({ describe: (() => Promise.reject(new Error("async"))) as never })).toThrow(/synchronously/)
    await Promise.resolve(); expect(body.innerHTML).toBe(before)
  })
  it("honors callback disposal without stale cells or ownership", () => {
    const { helper, body, original } = fixture()
    expect(() => helper.set({ describe: () => { helper.disconnect(); return "" } })).toThrow(/disconnected/)
    expect([...body.childNodes]).toEqual(original); expect(helper.connected).toBe(false)
  })
  it("restores original fallback/legend nodes and only still-owned attributes/styles", () => {
    const { helper, root, body, original } = fixture({ activeColors: ["#111111", "#222222", "#333333", "#444444", "#555555"] })
    const callback = vi.fn(); original[0]!.addEventListener("probe", callback)
    root.style.setProperty("--mui-heatmap-level-0", "#ffffff")
    helper.disconnect()
    expect([...body.childNodes]).toEqual(original); original[0]!.dispatchEvent(new Event("probe")); expect(callback).toHaveBeenCalledOnce()
    expect(root.style.getPropertyValue("--mui-heatmap-level-0")).toBe("#ffffff")
    expect(root.querySelector("[data-heatmap-bands]")!.textContent).toBe("Authored value legend")
  })
  it("does not overwrite foreign replacement rows, including an empty generated header", () => {
    const { helper, body } = fixture(), author = document.createElement("tr")
    author.innerHTML = "<td>Replacement</td>"; body.replaceChildren(author)
    expect(() => helper.refresh()).toThrow(/anatomy/); expect(body.firstElementChild).toBe(author)
    const empty = fixture({ data: [] }), header = empty.root.querySelector("thead")!, row = document.createElement("tr")
    header.append(row); expect(() => empty.helper.refresh()).toThrow(/anatomy/)
    expect(header.firstElementChild).toBe(row)
  })
  it("rejects replaced caption/bands and autofocus cell templates before a misleading update", () => {
    const setup = fixture({}, false)
    setup.root.querySelector<HTMLTemplateElement>("template")!.content.querySelector("button")!.setAttribute("autofocus", "")
    expect(() => createHeatmap(setup.root, { data })).toThrow()
    const bound = fixture(), replacement = document.createElement("ul")
    bound.root.querySelector("[data-heatmap-bands]")!.replaceWith(replacement)
    expect(() => bound.helper.refresh()).toThrow(/anatomy/)
    expect(replacement.isConnected).toBe(true)
  })
  it("suppresses change notifications after focus restoration removes the root", () => {
    const { helper, day, root } = fixture(), changed = vi.fn()
    const button = day("2024-02-10"); button.focus()
    button.addEventListener("focus", () => root.remove(), { once: true })
    root.addEventListener("mui:heatmap-change", changed)
    helper.set({ firstDayOfWeek: 6 })
    expect(helper.connected).toBe(false); expect(changed).not.toHaveBeenCalled()
  })
  it("releases removed owners and supports explicit rebinding", async () => {
    const { helper, root, form } = fixture()
    root.remove(); await Promise.resolve(); expect(helper.connected).toBe(false)
    form.append(root); const next = createHeatmap(root, { data }); helpers.push(next); expect(next.state.numericCount).toBe(3)
  })
  it("keeps an empty calendar bounded and clearly described", () => {
    const { helper, root, detail, body } = fixture({ data: [] })
    expect(helper.state.cells).toBe(0); expect(body.rows).toHaveLength(1)
    expect(root.querySelector("[data-heatmap-caption]")!.textContent).toBe("No calendar data")
    expect(detail.textContent).toContain("No date")
  })
})
