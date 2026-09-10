import { ownedWrites } from "../popover/position.js"
import { buildHeatmap, heatmapConfig, heatmapDefaults, numberText } from "./model.js"
import type { HeatmapCell, HeatmapConfig, HeatmapModel, HeatmapOptions, HeatmapSettings } from "./model.js"

export interface HeatmapState {
  readonly start: string | null
  readonly end: string | null
  readonly weeks: number
  readonly cells: number
  readonly numericCount: number
  readonly missingCount: number
  readonly domain: readonly [number, number] | null
  readonly currentDate: string | null
  readonly loading: boolean
}
export interface HeatmapController {
  readonly element: HTMLElement
  readonly table: HTMLTableElement
  readonly connected: boolean
  readonly model: HeatmapModel
  readonly state: HeatmapState
  readonly error: unknown
  set(settings: HeatmapSettings): void
  refresh(): void
  explore(date: string): void
  disconnect(): void
}
interface CellNodes { td: HTMLTableCellElement; button: HTMLButtonElement; date: HTMLTimeElement; value: HTMLElement; code: HTMLElement }
const owner = Symbol.for("markup-ui.heatmap.owner")
type Owned = HTMLElement & { [owner]?: object }

/** A bounded calendar-by-week table and persistent native detail view, not a chart engine. */
export function createHeatmap(element: HTMLElement, options: HeatmapOptions = {}): HeatmapController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLElement) || !["div", "section"].includes(element.localName)
    || !element.matches(".mui-heatmap[data-heatmap]") || element.getAttribute("tabindex") !== "-1"
    || !element.isConnected || element.getRootNode() !== document || (element as Owned)[owner]) throw new TypeError("Use an unowned connected native .mui-heatmap[data-heatmap][tabindex='-1'].")
  const win = view, doc = document!, token = {}, writes = ownedWrites(), palette = ownedWrites()
  const own = (node: Element) => node.closest("[data-heatmap]") === element
  function one(selector: string) {
    const nodes = [...element.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length !== 1) throw new TypeError(`Author exactly one ${selector}.`)
    return nodes[0]!
  }
  const tableNode = one("[data-heatmap-table]"), headNode = one("[data-heatmap-head]"), bodyNode = one("[data-heatmap-body]"),
    caption = one("[data-heatmap-caption]"), legend = one("[data-heatmap-legend]"), bands = one("[data-heatmap-bands]"),
    detail = one("[data-heatmap-detail]"), status = one("[data-heatmap-status]"), templateNode = one("template[data-heatmap-cell]")
  if (!(element.getAttribute("aria-label")?.trim() || element.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => doc.getElementById(id)?.textContent?.trim()))
    || !(tableNode instanceof win.HTMLTableElement) || tableNode.hasAttribute("role")
    || !(headNode instanceof win.HTMLTableSectionElement) || headNode.localName !== "thead" || headNode.parentElement !== tableNode
    || !(bodyNode instanceof win.HTMLTableSectionElement) || bodyNode.localName !== "tbody" || bodyNode.parentElement !== tableNode
    || caption.closest("caption")?.parentElement !== tableNode || !["ul", "ol"].includes(bands.localName) || !legend.contains(bands)
    || !(templateNode instanceof win.HTMLTemplateElement)
    || [caption, detail, status].some(node => node.childElementCount || !["span", "p", "div"].includes(node.localName)
      || node.hasAttribute("role") || node.hasAttribute("aria-live") || node.hasAttribute("tabindex"))
    || [headNode, bodyNode, bands].some(node => node.querySelector("button,input,select,textarea,a[href],[tabindex],[contenteditable]"))) {
    throw new TypeError("Keep a named captioned table, noninteractive fallbacks, cell template and nonlive detail/status text.")
  }
  const table = tableNode, head = headNode, body = bodyNode, template = templateNode
  const prototype = template.content.firstElementChild
  if (!(prototype instanceof win.HTMLTableCellElement) || prototype.localName !== "td" || template.content.children.length !== 1
    || prototype.hasAttribute("id") || prototype.hasAttribute("role") || prototype.hidden
    || prototype.querySelector("[id],[autofocus],input,textarea,select,form,script,style,iframe,object,embed,a,details,summary,[contenteditable],[tabindex]")
    || [...prototype.querySelectorAll("*")].some(node => node.localName.includes("-"))) throw new TypeError("Use one native td template with a day button and text/swatch parts.")
  function part<T extends HTMLElement>(root: Element, selector: string): T {
    const nodes = root.querySelectorAll(selector)
    if (nodes.length !== 1) throw new TypeError(`Cell template needs exactly one ${selector}.`)
    return nodes[0] as T
  }
  const protoButton = part<HTMLButtonElement>(prototype, "[data-heatmap-day]")
  const protoDate = part<HTMLTimeElement>(prototype, "[data-heatmap-date]")
  const protoValue = part(prototype, "[data-heatmap-value]"), protoCode = part(prototype, "[data-heatmap-code]"), swatch = part(prototype, "[data-heatmap-swatch]")
  if (!(protoButton instanceof win.HTMLButtonElement) || protoButton.type !== "button" || protoButton.getAttribute("type") !== "button"
    || prototype.querySelectorAll("button").length !== 1 || protoButton.hasAttribute("role") || protoButton.disabled || protoButton.hidden
    || protoButton.hasAttribute("name") || protoButton.hasAttribute("popovertarget") || protoButton.hasAttribute("commandfor")
    || !(protoDate instanceof win.HTMLTimeElement) || [protoDate, protoValue, protoCode, swatch].some(node => node.childElementCount || !protoButton.contains(node))) {
    throw new TypeError("Cell parts need type=button, native time, plain value/code and a swatch.")
  }
  const originalHead = [...head.childNodes], originalBody = [...body.childNodes], originalBands = [...bands.childNodes]
  const text = new Map<HTMLElement, { before: string | null; last: string | null }>([caption, detail, status].map(node => [node, { before: node.textContent, last: node.textContent }]))
  let connected = true, preparing = false, committing = false, bound = false, version = 0, error: unknown = null
  let settings: HeatmapConfig = heatmapDefaults, model: HeatmapModel
  let cells = new Map<string, CellNodes>(), current: string | null = null
  let headRows: HTMLElement[] = [], bodyRows: HTMLElement[] = [], legendRows: HTMLElement[] = []
  const removers: (() => void)[] = []
  function anatomy() {
    if (!element.isConnected || element.getRootNode() !== doc || !element.contains(table) || !element.contains(legend)
      || head.parentElement !== table || body.parentElement !== table || !element.contains(detail) || !element.contains(status)
      || !element.contains(caption) || !legend.contains(bands) || caption.closest("caption")?.parentElement !== table
      || bound && (head.childNodes.length !== headRows.length || headRows.some((row, i) => head.childNodes[i] !== row))
      || bound && (body.childNodes.length !== bodyRows.length || bodyRows.some((row, i) => body.childNodes[i] !== row))
      || bound && (bands.childNodes.length !== legendRows.length || legendRows.some((row, i) => bands.childNodes[i] !== row))) {
      disconnect(); throw new Error("Heatmap anatomy was changed; rebind rather than overwrite an author replacement.")
    }
  }
  function writeText(node: HTMLElement, value: string) { text.get(node)!.last = value; if (node.textContent !== value) node.textContent = value }
  function live() {
    if (!connected) throw new Error("Heatmap is disconnected.")
    if (preparing || committing) throw new Error("Do not reenter Heatmap during preparation/commit; disconnect is allowed.")
    anatomy()
  }
  function prepare(input: HeatmapSettings) {
    preparing = true; const stamp = version
    try {
      const next = heatmapConfig(input, settings), data = buildHeatmap(doc, next)
      if (!connected || stamp !== version) throw new Error("Heatmap was disconnected during preparation.")
      anatomy(); return { next, data }
    } finally { preparing = false }
  }
  function state(): HeatmapState {
    return Object.freeze({ start: model.start, end: model.end, weeks: model.weeks, cells: cells.size,
      numericCount: model.numericCount, missingCount: model.missingCount, domain: model.domain, currentDate: current, loading: settings.loading })
  }
  function selected(date: string) {
    current = date
    for (const [key, nodes] of cells) { nodes.button.tabIndex = key === date ? 0 : -1; nodes.td.toggleAttribute("data-heatmap-current", key === date) }
    const cell = model.cells.find(cell => cell?.date === date)
    if (cell) writeText(detail, cell.detail)
  }
  function makeCell(day: HeatmapCell): CellNodes {
    const prior = cells.get(day.date)
    if (prior) return prior
    const td = prototype!.cloneNode(true) as HTMLTableCellElement
    return { td, button: part(td, "[data-heatmap-day]"), date: part(td, "[data-heatmap-date]"), value: part(td, "[data-heatmap-value]"), code: part(td, "[data-heatmap-code]") }
  }
  function commit(next: HeatmapConfig, data: HeatmapModel) {
    const active = doc.activeElement, activeDate = [...cells].find(([, node]) => node.button === active)?.[0]
    committing = true
    try {
      const nextCells = new Map<string, CellNodes>(), rows: HTMLElement[] = []
      const sameGrid = bodyRows.length === 7 && model && model.weeks === data.weeks
        && data.cells.every((cell, i) => (cell?.date ?? null) === (model.cells[i]?.date ?? null))
      if (!data.weeks) {
        const row = doc.createElement("tr"), td = doc.createElement("td"); td.textContent = "No dates"; row.append(td); rows.push(row)
      } else for (let rowIndex = 0; rowIndex < 7; ++rowIndex) {
        const tr = sameGrid ? bodyRows[rowIndex]! : doc.createElement("tr")
        if (!sameGrid) { const th = doc.createElement("th"); th.scope = "row"; th.append(doc.createElement("span")); tr.append(th) }
        const th = tr.firstElementChild!
        const weekText = th.firstElementChild!
        weekText.textContent = data.weekLabels[rowIndex]!
        weekText.classList.toggle("mui-heatmap-visually-hidden", !next.showWeekLabels)
        for (let column = 0; column < data.weeks; ++column) {
          const day = data.cells[column * 7 + rowIndex]
          if (!day) { if (!sameGrid) { const empty = doc.createElement("td"); empty.textContent = "—"; tr.append(empty) } continue }
          const node = makeCell(day)
          node.button.dataset.heatmapDate = day.date
          node.button.setAttribute("aria-label", day.label)
          node.date.dateTime = day.date; node.date.textContent = day.date.slice(8)
          node.value.textContent = day.value === null ? "Missing" : numberText(day.value)
          node.code.textContent = day.level === null ? "No value" : `L${day.level}${day.clamped ? "*" : ""}`
          node.td.toggleAttribute("data-heatmap-missing", day.value === null)
          if (day.level === null) node.td.removeAttribute("data-heatmap-level")
          else node.td.dataset.heatmapLevel = String(day.level)
          node.button.querySelector("[data-heatmap-swatch]")!.setAttribute("aria-hidden", "true")
          if (!sameGrid) tr.append(node.td)
          if (!connected) return
          nextCells.set(day.date, node)
        }
        rows.push(tr)
      }
      const headers: HTMLElement[] = []
      if (data.weeks && next.showMonthLabels) {
        const row = doc.createElement("tr"), corner = doc.createElement("th"); corner.textContent = "Month"; row.append(corner)
        for (const group of data.months) { const th = doc.createElement("th"); th.scope = "colgroup"; th.colSpan = group.columns; th.textContent = group.label; row.append(th) }
        headers.push(row)
      }
      if (data.weeks) {
        const row = doc.createElement("tr"), corner = doc.createElement("th"); corner.textContent = "Weekday"; row.append(corner)
        for (const start of data.weekStarts) {
          const th = doc.createElement("th"), label = doc.createElement("span"); th.scope = "col"
          label.className = "mui-heatmap-visually-hidden"; label.textContent = `Week including ${start}`; th.append(label); row.append(th)
        }
        headers.push(row)
      }
      const legendNodes: HTMLElement[] = []
      function band(label: string, level: number | null) {
        const li = doc.createElement("li"), swatch = doc.createElement("span"), text = doc.createElement("span")
        if (level === null) li.setAttribute("data-heatmap-missing", "")
        else li.dataset.heatmapLevel = String(level)
        swatch.setAttribute("data-heatmap-swatch", ""); swatch.setAttribute("aria-hidden", "true")
        text.textContent = label; li.append(swatch, text); legendNodes.push(li)
      }
      band("Missing — no numeric record/value; never zero", null)
      if (data.domain) {
        const edges = [0, ...data.thresholds, 1]
        for (let i = 0; i < 5; ++i) band(`L${i}: position ${edges[i]} ≤ p ${i === 4 ? "≤" : "<"} ${edges[i + 1]}`, i)
      }
      head.replaceChildren(...headers); if (!sameGrid) body.replaceChildren(...rows); bands.replaceChildren(...legendNodes)
      if (!connected) return
      headRows = headers; bodyRows = rows; legendRows = legendNodes; cells = nextCells; settings = next; model = data; bound = true; ++version; error = null
      palette.restore()
      if (next.activeColors) next.activeColors.forEach((color, i) => palette.style(element, `--mui-heatmap-level-${i}`, color))
      if (next.minimumColor) palette.style(element, "--mui-heatmap-level-0", next.minimumColor)
      writes.attr(element, "data-heatmap-theme", next.colorTheme); writes.attr(element, "data-heatmap-size", next.size)
      writes.attr(table, "aria-busy", next.loading ? "true" : "false"); writes.attr(bands, "hidden", next.showColorIndicator ? null : "")
      writeText(caption, data.start ? `${data.start} – ${data.end}` : "No calendar data")
      const domainText = data.domain ? `Domain [${numberText(data.domain[0])}, ${numberText(data.domain[1])}]. ${data.domain[0] === data.domain[1] ? "Equal domain maps to p=0.5." : "p=(clamped value−min)/(max−min)."} Outside values clamp to p=0/1 (*).`
        : "No numeric domain."
      writeText(status, `${next.loading ? "Updating; displayed values remain real data. " : ""}${data.numericCount} numeric, ${data.missingCount} missing dates. ${domainText}`)
      const first = data.cells.find((cell): cell is HeatmapCell => cell !== null)?.date ?? null
      const retained = activeDate && cells.has(activeDate) ? activeDate : current && cells.has(current) ? current : first
      if (retained) selected(retained)
      else { current = null; writeText(detail, "No date available to inspect.") }
      if (activeDate) {
        if (cells.has(activeDate)) cells.get(activeDate)!.button.focus({ preventScroll: true })
        else element.focus({ preventScroll: true })
      }
    } finally { committing = false }
  }
  function set(input: HeatmapSettings) {
    live(); const { next, data } = prepare(input); commit(next, data)
    if (!element.isConnected) { disconnect(); return }
    if (connected) element.dispatchEvent(new win.CustomEvent("mui:heatmap-change", { bubbles: true, detail: state() }))
  }
  function explore(date: string) {
    live()
    const cell = model.cells.find(cell => cell?.date === date)
    if (!cell || !cells.has(date)) throw new RangeError("Date is not in the rendered Heatmap.")
    selected(date)
    element.dispatchEvent(new win.CustomEvent("mui:heatmap-explore", { bubbles: true, detail: cell }))
  }
  function keyboard(event: KeyboardEvent) {
    const button = event.target instanceof win.HTMLButtonElement ? event.target : null
    const date = button?.dataset.heatmapDate, cell = model.cells.find(cell => cell?.date === date)
    if (!date || !cell || cells.get(date)?.button !== button || button.matches(":disabled") || event.altKey || event.metaKey || event.shiftKey || event.isComposing) return
    const rtl = win.getComputedStyle(table).direction === "rtl"
    let row = cell.row, column = cell.column, targetDate: string | null = null
    if (event.ctrlKey) {
      const days = model.cells.filter((day): day is HeatmapCell => day !== null)
      if (event.key === "Home") targetDate = days[0]?.date ?? null
      else if (event.key === "End") targetDate = days.at(-1)?.date ?? null
      else return
    } else if (event.key === "ArrowUp") row--
    else if (event.key === "ArrowDown") row++
    else if (event.key === "ArrowLeft") column += rtl ? 1 : -1
    else if (event.key === "ArrowRight") column += rtl ? -1 : 1
    else if (event.key === "Home" || event.key === "End") {
      const line = model.cells.filter((day): day is HeatmapCell => day !== null && day.row === row)
      targetDate = event.key === "Home" ? line[0]?.date ?? null : line.at(-1)?.date ?? null
    } else return
    event.preventDefault()
    if (!targetDate && row >= 0 && row < 7 && column >= 0 && column < model.weeks) targetDate = model.cells[column * 7 + row]?.date ?? null
    if (targetDate) { selected(targetDate); cells.get(targetDate)!.button.focus() }
  }
  function report(failure: unknown) {
    error = failure
    if (connected && element.isConnected) element.dispatchEvent(new win.CustomEvent("mui:heatmap-error", { bubbles: true, detail: Object.freeze({ error: failure }) }))
  }
  function listen(node: EventTarget, event: string, callback: EventListener) { node.addEventListener(event, callback); removers.push(() => node.removeEventListener(event, callback)) }
  const observer = new win.MutationObserver(() => { if (!element.isConnected || element.getRootNode() !== doc || !element.contains(table)) disconnect() })
  function disconnect() {
    if (!connected) return
    connected = false; ++version; observer.disconnect(); removers.forEach(remove => remove())
    if ([...cells.values()].some(node => node.button === doc.activeElement) && element.isConnected) element.focus({ preventScroll: true })
    for (const [node, generated, original] of [[head, headRows, originalHead], [body, bodyRows, originalBody], [bands, legendRows, originalBands]] as const) {
      generated.forEach(row => { if (row.parentNode === node) row.remove() })
      if (!node.childNodes.length) node.append(...original)
    }
    palette.restore(); writes.restore()
    for (const [node, saved] of text) if (node.textContent === saved.last) node.textContent = saved.before
    cells.clear()
    if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
  }
  const initial = prepare(options); model = initial.data
  ;(element as Owned)[owner] = token
  commit(initial.next, initial.data)
  listen(body, "focusin", event => {
    const button = event.target instanceof win.HTMLButtonElement ? event.target : null, date = button?.dataset.heatmapDate
    if (date && cells.get(date)?.button === button) selected(date)
  })
  listen(body, "keydown", event => { try { keyboard(event as KeyboardEvent) } catch (failure) { report(failure) } })
  listen(body, "click", event => {
    const button = event.target instanceof win.Element ? event.target.closest<HTMLButtonElement>("[data-heatmap-day]") : null
    const date = button?.dataset.heatmapDate
    if (!button || !date || button.matches(":disabled") || cells.get(date)?.button !== button) return
    try { explore(date) } catch (failure) { report(failure) }
  })
  observer.observe(doc.documentElement, { childList: true, subtree: true })
  return { element, table, get connected() { return connected }, get model() { return model }, get state() { return state() }, get error() { return error },
    set, refresh: () => set({}), explore, disconnect }
}
