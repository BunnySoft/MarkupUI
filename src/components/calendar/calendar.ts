import { ownedWrites } from "../popover/position.js"
import { carrier, dateString, fromOrdinal, inMonth, lastOrdinal, monthIndex, ordinal, parseDate, parseMonth, weekday } from "./date.js"
import type { CalendarDate } from "./date.js"

export interface CalendarLabels {
  today: string
  selected: string
  unavailable: string
  none: string
  failed: string
}
export interface CalendarSettings {
  value?: string | null
  defaultValue?: string | null
  panel?: string
  today?: string | null
  min?: string
  max?: string
  firstDayOfWeek?: number
  locale?: string
  disabled?: boolean
  isDateDisabled?: ((value: string, parts: CalendarDate) => boolean) | null
  getDayContent?: ((value: string, parts: CalendarDate) => string) | null
  labels?: Partial<CalendarLabels>
}
export type CalendarOptions = CalendarSettings
export interface CalendarState {
  readonly value: string | null
  readonly defaultValue: string | null
  readonly panel: string
  readonly focusedDate: string
  readonly today: string | null
  readonly firstDayOfWeek: number
  readonly selectionAvailable: boolean | null
  readonly disabled: boolean
  readonly year: number
  readonly month: number
}
export interface CalendarChange {
  readonly value: string | null
  readonly previousValue: string | null
  readonly year: number | null
  readonly month: number | null
  readonly date: number | null
  readonly reason: string
}
export interface CalendarPanelChange {
  readonly panel: string
  readonly previousPanel: string
  readonly year: number
  readonly month: number
  readonly reason: string
}
export interface CalendarController {
  readonly element: HTMLElement
  readonly table: HTMLTableElement
  readonly connected: boolean
  readonly error: unknown
  readonly state: CalendarState
  readonly value: string | null
  set(settings: CalendarSettings): void
  select(value: string | null): boolean
  show(panel: string): void
  moveMonths(delta: number): void
  moveYears(delta: number): void
  today(): boolean
  reset(): void
  refresh(): void
  disconnect(): void
}
type Settings = Omit<Required<CalendarSettings>, "labels"> & { labels: CalendarLabels }
interface Day {
  value: string
  parts: CalendarDate
  unavailable: boolean
  adjacent: boolean
  label: string
  note: string
}
interface Cell {
  node: HTMLTableCellElement
  button: HTMLButtonElement
  number: HTMLElement
  marks: HTMLElement
  note: HTMLElement
}
interface Prepared {
  settings: Settings
  days: (Day | null)[]
  panel: CalendarDate
  focus: string
  title: string
  weekdays: { short: string; long: string }[]
  selectionAvailable: boolean | null
  unavailable: (value: string) => boolean
}
const owner = Symbol.for("markup-ui.calendar.owner")
type Owned = HTMLElement & { [owner]?: object }
const actions = ["prev-month", "next-month", "prev-year", "next-year", "today", "clear"]
const optionKeys = ["value", "defaultValue", "panel", "today", "min", "max", "firstDayOfWeek", "locale", "disabled", "isDateDisabled", "getDayContent", "labels"]
const defaultLabels: CalendarLabels = { today: "Today", selected: "Selected", unavailable: "Unavailable", none: "No date selected", failed: "Calendar update failed; previous view retained." }

/** One bounded Gregorian month table; date-only state, no timestamps or form proxy. */
export function createCalendar(element: HTMLElement, options: CalendarOptions = {}): CalendarController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLElement) || !["div", "section"].includes(element.localName)
    || !element.matches(".mui-calendar[data-calendar]") || !element.isConnected || element.getRootNode() !== document
    || element.getAttribute("tabindex") !== "-1" || (element as Owned)[owner]) throw new TypeError("Use an unowned connected native .mui-calendar[data-calendar][tabindex='-1'] scope.")
  const doc = document!, win = view, token = {}, writes = ownedWrites()
  const own = (node: Element) => node.closest("[data-calendar]") === element
  if (!(element.getAttribute("aria-label")?.trim() || element.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => doc.getElementById(id)?.textContent?.trim()))) throw new TypeError("Give the native Calendar scope an accessible name.")
  function one(selector: string) {
    const nodes = [...element.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length !== 1) throw new TypeError(`Author exactly one ${selector}.`)
    return nodes[0]!
  }
  const tableNode = one("[data-calendar-table]"), caption = one("[data-calendar-caption]"),
    headNode = one("[data-calendar-weekdays]"), bodyNode = one("[data-calendar-body]"),
    controls = one("[data-calendar-controls]"), templateNode = one("template[data-calendar-cell]"),
    readout = one("[data-calendar-value]"), status = one("[data-calendar-status]")
  if (!(tableNode instanceof win.HTMLTableElement) || tableNode.hasAttribute("role")
    || !(headNode instanceof win.HTMLTableSectionElement) || headNode.localName !== "thead"
    || !(bodyNode instanceof win.HTMLTableSectionElement) || bodyNode.localName !== "tbody"
    || headNode.parentElement !== tableNode || bodyNode.parentElement !== tableNode
    || caption.closest("caption")?.parentElement !== tableNode
    || !(templateNode instanceof win.HTMLTemplateElement) || !controls.hidden
    || [caption, readout, status].some(node => node.childElementCount || !["span", "div", "p"].includes(node.localName)
      || node.hasAttribute("role") || node.hasAttribute("tabindex") || node.hasAttribute("contenteditable"))
    || readout.hasAttribute("aria-live") || [headNode, bodyNode].some(node => node.querySelector("button,input,select,textarea,a[href],[tabindex],[contenteditable]"))) {
    throw new TypeError("Author a native captioned table with readable noninteractive fallback rows, cell template, hidden controls and separate plain readouts; no grid role.")
  }
  const table = tableNode, head = headNode, body = bodyNode, template = templateNode
  const sourceCell = template.content.firstElementChild
  if (template.content.children.length !== 1 || !(sourceCell instanceof win.HTMLTableCellElement) || sourceCell.localName !== "td"
    || sourceCell.hidden || sourceCell.hasAttribute("role") || sourceCell.hasAttribute("id")
    || sourceCell.querySelector("[id],script,style,iframe,object,embed,a,input,select,textarea,form,details,summary,[contenteditable],[tabindex]")
    || [...sourceCell.querySelectorAll("*")].some(node => node.localName.includes("-"))
    || sourceCell.querySelectorAll("button").length !== 1) throw new TypeError("The cell template is one td with one native day button and noninteractive content; no IDs or form fields.")
  function part<T extends HTMLElement>(node: Element, selector: string): T {
    const found = node.querySelectorAll(selector)
    if (found.length !== 1) throw new TypeError(`Cell template needs one ${selector}.`)
    return found[0] as T
  }
  const dayButton = part<HTMLButtonElement>(sourceCell, "[data-calendar-day]")
  function buttonValid(button: HTMLElement) {
    return button instanceof win.HTMLButtonElement && button.getAttribute("type") === "button" && !button.hasAttribute("role")
      && !button.hasAttribute("name") && !button.hasAttribute("popovertarget") && !button.hasAttribute("commandfor")
      && !button.querySelector("button,a,input,select,textarea,[tabindex],[contenteditable]")
  }
  const numberPart = part(sourceCell, "[data-calendar-number]"), marksPart = part(sourceCell, "[data-calendar-marks]"), notePart = part(sourceCell, "[data-calendar-note]")
  if (!buttonValid(dayButton) || dayButton.disabled || dayButton.hidden || !dayButton.contains(numberPart) || dayButton.contains(marksPart) || dayButton.contains(notePart)
    || [numberPart, marksPart, notePart].some(node => node.childElementCount)
    || marksPart.contains(notePart) || notePart.contains(marksPart)) throw new TypeError("Put the day number in its type=button; plain status marks and annotation are separate siblings, never nested actions.")
  const buttons = [...controls.querySelectorAll<HTMLButtonElement>("button")]
  if (buttons.some(button => !buttonValid(button) || !(button.textContent?.trim() || button.getAttribute("aria-label")?.trim())
    || !actions.includes(button.dataset.calendarAction ?? "")) || new Set(buttons.map(button => button.dataset.calendarAction)).size !== buttons.length) {
    throw new TypeError("Author distinct labelled native month/year/today/clear actions.")
  }
  const nativeDisabled = new WeakMap(buttons.map(button => [button, button.disabled]))
  const fallbackHead = [...head.childNodes], fallbackBody = [...body.childNodes]
  const text = new Map<HTMLElement, { before: string | null; last: string | null }>([caption, readout, status].map(node => [node, { before: node.textContent, last: node.textContent }]))
  const prefix = win.crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
  const removers: (() => void)[] = []
  let connected = true, preparing = false, committing = false, version = 0, error: unknown = null
  let cells = new Map<string, Cell>(), rows: HTMLTableRowElement[] = [], header: HTMLTableRowElement | null = null
  let settings: Settings = { value: null, defaultValue: null, panel: element.dataset.calendarMonth ?? "",
    today: null, min: "0001-01-01", max: "9999-12-31", firstDayOfWeek: 1, locale: "en-US", disabled: false,
    isDateDisabled: null, getDayContent: null, labels: { ...defaultLabels } }
  let prepared: Prepared, focusedDate = ""
  function object(value: unknown, keys: readonly string[]) {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !keys.includes(key))) throw new TypeError("Unsupported Calendar settings.")
  }
  function config(input: CalendarSettings, initial = false): Settings {
    object(input, optionKeys)
    if (input.labels !== undefined) object(input.labels, Object.keys(defaultLabels))
    const next = { ...settings, ...input, labels: { ...settings.labels, ...input.labels } }
    if (initial && input.value === undefined) next.value = next.defaultValue
    if (input.panel === undefined && input.value !== undefined && input.value !== null) next.panel = input.value.slice(0, 7)
    if (!next.panel) next.panel = (next.value ?? next.defaultValue ?? next.today)?.slice(0, 7) ?? ""
    for (const value of [next.value, next.defaultValue, next.today]) if (value !== null) parseDate(doc, value)
    const min = parseDate(doc, next.min), max = parseDate(doc, next.max)
    if (ordinal(min) > ordinal(max)) throw new RangeError("min must not follow max.")
    const requested = parseMonth(doc, next.panel)
    next.panel = dateString(inMonth(Math.max(monthIndex(min), Math.min(monthIndex(max), monthIndex(requested))), 1)).slice(0, 7)
    if (!Number.isInteger(next.firstDayOfWeek) || next.firstDayOfWeek < 0 || next.firstDayOfWeek > 6
      || typeof next.disabled !== "boolean" || typeof next.locale !== "string" || !next.locale || next.locale.length > 128
      || [next.isDateDisabled, next.getDayContent].some(fn => fn !== null && typeof fn !== "function")
      || Object.values(next.labels).some(value => typeof value !== "string" || !value.trim() || value.length > 100)) throw new TypeError("Use bounded locale/labels, boolean disabled, weekday 0..6 and synchronous callback functions.")
    return next
  }
  function anatomy() {
    if (!element.isConnected || element.getRootNode() !== doc || !element.contains(table) || !element.contains(controls)
      || head.parentElement !== table || body.parentElement !== table || caption.closest("caption")?.parentElement !== table
      || !element.contains(readout) || !element.contains(status)
      || header && (head.childNodes.length !== 1 || head.firstChild !== header)
      || rows.length && (body.childNodes.length !== rows.length || rows.some((row, i) => body.childNodes[i] !== row))) {
      disconnect()
      throw new Error("Calendar anatomy was replaced or detached; disconnect and rebind.")
    }
  }
  function synchronous(value: unknown) {
    if (value && typeof (value as PromiseLike<unknown>).then === "function") {
      void Promise.resolve(value).catch(() => {})
      throw new TypeError("Calendar date/content callbacks must be synchronous.")
    }
  }
  function prepare(next: Settings, desired: string): Prepared {
    const stamp = version
    preparing = true
    try {
      anatomy()
      const panel = parseMonth(doc, next.panel), min = ordinal(parseDate(doc, next.min)), max = ordinal(parseDate(doc, next.max))
      const cache = new Map<string, boolean>()
      const unavailable = (value: string) => {
        if (cache.has(value)) return cache.get(value)!
        const parts = parseDate(doc, value), coordinate = ordinal(parts)
        let blocked = coordinate < min || coordinate > max
        if (!blocked && next.isDateDisabled) {
          const result = next.isDateDisabled(value, parts); synchronous(result)
          if (typeof result !== "boolean") throw new TypeError("isDateDisabled must return true or false.")
          blocked = result
        }
        cache.set(value, blocked); return blocked
      }
      const base = { calendar: "gregory", timeZone: "UTC" } as const
      const monthLabel = new Intl.DateTimeFormat(next.locale, { ...base, year: "numeric", month: "long" })
      const dateLabel = new Intl.DateTimeFormat(next.locale, { ...base, year: "numeric", month: "long", day: "numeric", weekday: "long" })
      const shortWeek = new Intl.DateTimeFormat(next.locale, { ...base, weekday: "short" }), longWeek = new Intl.DateTimeFormat(next.locale, { ...base, weekday: "long" })
      if (monthLabel.resolvedOptions().calendar !== "gregory" || monthLabel.resolvedOptions().timeZone !== "UTC") throw new Error("Explicit native Gregorian/UTC formatting is required.")
      const first = ordinal(panel) - (weekday(panel) - next.firstDayOfWeek + 7) % 7
      const days = Array.from({ length: 42 }, (_, i): Day | null => {
        const coordinate = first + i
        if (coordinate < 0 || coordinate > lastOrdinal) return null
        const parts = fromOrdinal(coordinate), value = dateString(parts), disabled = unavailable(value)
        const note = next.getDayContent ? next.getDayContent(value, parts) : ""
        synchronous(note)
        if (typeof note !== "string" || note.length > 512) throw new TypeError("getDayContent must return literal text of at most 512 characters.")
        return { value, parts, unavailable: disabled, adjacent: parts.month !== panel.month || parts.year !== panel.year, label: dateLabel.format(carrier(parts)), note }
      })
      const selectionAvailable = next.value === null ? null : !unavailable(next.value)
      if (!connected || version !== stamp) throw new Error("Calendar was disconnected during preparation.")
      anatomy()
      const focus = days.some(day => day?.value === desired) ? desired : dateString(inMonth(monthIndex(panel), desired ? parseDate(doc, desired).date : 1))
      return { settings: next, days, panel, focus, title: monthLabel.format(carrier(panel)), selectionAvailable, unavailable,
        weekdays: Array.from({ length: 7 }, (_, i) => {
          const day = carrier({ year: 2023, month: 1, date: (next.firstDayOfWeek + i) % 7 + 1 })
          return { short: shortWeek.format(day), long: longWeek.format(day) }
        }) }
    } finally { preparing = false }
  }
  function writeText(node: HTMLElement, value: string) {
    text.get(node)!.last = value
    if (node.textContent !== value) node.textContent = value
  }
  function state(): CalendarState {
    return Object.freeze({ value: settings.value, defaultValue: settings.defaultValue, panel: settings.panel,
      focusedDate, today: settings.today, firstDayOfWeek: settings.firstDayOfWeek, selectionAvailable: prepared.selectionAvailable,
      disabled: !available(), year: prepared.panel.year, month: prepared.panel.month })
  }
  function live() {
    if (!connected) throw new Error("Calendar is disconnected.")
    if (preparing || committing) throw new Error("Do not reenter Calendar while preparing/committing; disconnect is allowed.")
    anatomy()
  }
  function available() {
    if (!connected || !element.isConnected || settings.disabled || element.closest("[hidden],[inert]")) return false
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      const css = win.getComputedStyle(node)
      if (css.display === "none" || css.visibility === "hidden" || node.localName === "dialog" && !(node as HTMLDialogElement).open
        || node.localName === "details" && !(node as HTMLDetailsElement).open && !node.firstElementChild?.contains(element)) return false
    }
    return ![...cells.values()][0]?.button.matches(":disabled")
  }
  function monthTarget(delta: number, source = settings) {
    return Math.max(monthIndex(parseDate(doc, source.min)), Math.min(monthIndex(parseDate(doc, source.max)), monthIndex(parseMonth(doc, source.panel)) + delta))
  }
  function controlsState() {
    for (const button of buttons) {
      const action = button.dataset.calendarAction
      const delta = action === "prev-month" ? -1 : action === "next-month" ? 1 : action === "prev-year" ? -12 : 12
      const disabled = settings.disabled || nativeDisabled.get(button) || (action === "today"
        ? settings.today === null || settings.today < settings.min || settings.today > settings.max
        : action === "clear" ? settings.value === null : monthTarget(delta) === monthIndex(prepared.panel))
      writes.attr(button, "disabled", disabled && doc.activeElement !== button ? "" : null)
      writes.attr(button, "aria-disabled", disabled ? "true" : null)
    }
  }
  function tabStops() {
    for (const [value, cell] of cells) cell.button.tabIndex = value === focusedDate ? 0 : -1
  }
  function cellFor(value: string): Cell {
    const existing = cells.get(value)
    if (existing) return existing
    const node = sourceCell!.cloneNode(true) as HTMLTableCellElement
    const cell: Cell = { node, button: part(node, "[data-calendar-day]"), number: part(node, "[data-calendar-number]"), marks: part(node, "[data-calendar-marks]"), note: part(node, "[data-calendar-note]") }
    cell.button.dataset.calendarDate = value
    cell.note.id = `mui-calendar-${prefix}-${value}`
    return cell
  }
  function commit(next: Prepared, reason: string, notify: boolean, focusTarget = false) {
    const previousPanel = settings.panel, previousValue = settings.value
    const active = doc.activeElement, activeDate = [...cells].find(([, cell]) => cell.button === active)?.[0]
    committing = true
    try {
      const sameGrid = rows.length === 6 && next.days.every((day, i) => (day?.value ?? null) === (prepared.days[i]?.value ?? null))
      const sameHead = header && next.weekdays.every((day, i) => day.short === prepared.weekdays[i]?.short && day.long === prepared.weekdays[i]?.long)
      const nextCells = new Map<string, Cell>(), nextRows: HTMLTableRowElement[] = []
      for (let row = 0; row < 6; ++row) {
        const tr = sameGrid ? rows[row]! : doc.createElement("tr")
        for (let column = 0; column < 7; ++column) {
          const day = next.days[row * 7 + column]
          if (!day) { if (!sameGrid) { const blank = doc.createElement("td"); blank.textContent = "—"; tr.append(blank) } continue }
          const cell = cellFor(day.value)
          cell.number.textContent = String(day.parts.date)
          cell.button.setAttribute("aria-label", day.label)
          cell.button.setAttribute("aria-pressed", String(day.value === next.settings.value))
          cell.button.setAttribute("aria-disabled", String(day.unavailable || next.settings.disabled))
          if (day.value === next.settings.today) cell.button.setAttribute("aria-current", "date")
          else cell.button.removeAttribute("aria-current")
          cell.node.toggleAttribute("data-calendar-adjacent", day.adjacent)
          cell.marks.setAttribute("aria-hidden", "true")
          cell.marks.textContent = [day.value === next.settings.today ? next.settings.labels.today : "",
            day.value === next.settings.value ? next.settings.labels.selected : "", day.unavailable ? next.settings.labels.unavailable : ""].filter(Boolean).join(" · ")
          cell.note.textContent = day.note
          if (day.note) cell.button.setAttribute("aria-describedby", cell.note.id)
          else cell.button.removeAttribute("aria-describedby")
          if (!sameGrid) tr.append(cell.node)
          if (!connected) return
          nextCells.set(day.value, cell)
        }
        nextRows.push(tr)
      }
      const tr = sameHead ? header! : doc.createElement("tr")
      if (!sameHead) {
        for (const day of next.weekdays) {
          const th = doc.createElement("th"), abbr = doc.createElement("abbr")
          th.scope = "col"; abbr.title = day.long; abbr.textContent = day.short; th.append(abbr); tr.append(th)
        }
        head.replaceChildren(tr)
      }
      if (!sameGrid) body.replaceChildren(...nextRows)
      if (!connected) return
      cells = nextCells; rows = nextRows; header = tr; settings = next.settings; prepared = next
      focusedDate = !focusTarget && activeDate && cells.has(activeDate) ? activeDate : next.focus
      ++version; error = null
      writes.attr(controls, "hidden", null); writes.attr(element, "data-calendar-month", settings.panel)
      writes.attr(status, "aria-live", "polite"); writes.attr(status, "aria-atomic", "true")
      writeText(caption, next.title)
      writeText(readout, settings.value === null ? settings.labels.none
        : `${settings.labels.selected}: ${settings.value}${next.selectionAvailable ? "" : ` · ${settings.labels.unavailable}`}`)
      tabStops(); controlsState()
      if ((focusTarget || activeDate) && cells.get(focusedDate)) cells.get(focusedDate)!.button.focus({ preventScroll: reason !== "keyboard" })
      if (!connected) return
      writeText(status, notify && previousPanel !== settings.panel && !activeDate && !focusTarget ? next.title : "")
    } finally { committing = false }
    if (!connected || !notify) return
    const stamp = version
    if (previousPanel !== settings.panel) {
      const detail: CalendarPanelChange = Object.freeze({ panel: settings.panel, previousPanel, year: next.panel.year, month: next.panel.month, reason })
      element.dispatchEvent(new win.CustomEvent("mui:calendar-panel-change", { bubbles: true, detail }))
    }
    if (connected && version === stamp && previousValue !== settings.value) {
      const parts = settings.value === null ? null : parseDate(doc, settings.value)
      const detail: CalendarChange = Object.freeze({ value: settings.value, previousValue, year: parts?.year ?? null, month: parts?.month ?? null, date: parts?.date ?? null, reason })
      element.dispatchEvent(new win.CustomEvent("mui:calendar-change", { bubbles: true, detail }))
    }
  }
  function apply(input: CalendarSettings, reason: string, notify: boolean, desired?: string, focusTarget = false) {
    live()
    const next = config(input), panel = parseMonth(doc, next.panel)
    const preferred = desired ?? (focusedDate ? dateString(inMonth(monthIndex(panel), parseDate(doc, focusedDate).date)) : next.value ?? next.today ?? `${next.panel}-01`)
    const result = prepare(next, preferred)
    commit(result, reason, notify, focusTarget)
  }
  function select(value: string | null, reason = "api"): boolean {
    live(); if (!available()) return false
    if (value !== null) parseDate(doc, value)
    const next = config({ value }), result = prepare(next, value ?? focusedDate)
    if (value !== null && result.unavailable(value)) return false
    commit(result, reason, true); return true
  }
  function moveMonths(delta: number, reason = "api", focusTarget = false) {
    live()
    if (!Number.isSafeInteger(delta) || Math.abs(delta) > 119988) throw new RangeError("Month delta must be a bounded integer.")
    if (!available()) return
    const target = inMonth(monthTarget(delta), parseDate(doc, focusedDate).date)
    apply({ panel: dateString(target).slice(0, 7) }, reason, true, dateString(target), focusTarget)
  }
  function today(reason = "api") {
    live()
    if (!settings.today || settings.today < settings.min || settings.today > settings.max || !available()) return false
    apply({ panel: settings.today.slice(0, 7) }, reason, true, settings.today)
    return true
  }
  function keyboard(event: KeyboardEvent) {
    const button = event.target instanceof win.HTMLButtonElement ? event.target : null
    if (!button || cells.get(button.dataset.calendarDate ?? "")?.button !== button || !available() || button.matches(":disabled")
      || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return
    let delta: number | null = null
    const parts = parseDate(doc, button.dataset.calendarDate!), rtl = win.getComputedStyle(table).direction === "rtl"
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault(); moveMonths((event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1), "keyboard", true); return
    }
    if (event.shiftKey) return
    if (event.key === "ArrowLeft") delta = rtl ? 1 : -1
    else if (event.key === "ArrowRight") delta = rtl ? -1 : 1
    else if (event.key === "ArrowUp") delta = -7
    else if (event.key === "ArrowDown") delta = 7
    else if (event.key === "Home") delta = -(weekday(parts) - settings.firstDayOfWeek + 7) % 7
    else if (event.key === "End") delta = 6 - (weekday(parts) - settings.firstDayOfWeek + 7) % 7
    if (delta === null) return
    event.preventDefault()
    let target = fromOrdinal(Math.max(0, Math.min(lastOrdinal, ordinal(parts) + delta)))
    let panel = dateString(target).slice(0, 7)
    if (panel < settings.min.slice(0, 7) || panel > settings.max.slice(0, 7)) {
      panel = settings.panel
      const actual = prepared.days.filter((day): day is Day => day !== null)
      target = fromOrdinal(Math.max(ordinal(actual[0]!.parts), Math.min(ordinal(actual.at(-1)!.parts), ordinal(target))))
    }
    const value = dateString(target)
    if (panel === settings.panel && cells.has(value)) {
      focusedDate = value; tabStops(); cells.get(value)!.button.focus()
    } else apply({ panel }, "keyboard", true, value, true)
  }
  function report(failure: unknown) {
    error = failure
    if (!connected || !element.isConnected) return
    writeText(status, settings.labels.failed)
    element.dispatchEvent(new win.CustomEvent("mui:calendar-error", { bubbles: true, detail: Object.freeze({ error: failure }) }))
  }
  function listen(node: EventTarget, type: string, callback: EventListener) {
    node.addEventListener(type, callback); removers.push(() => node.removeEventListener(type, callback))
  }
  const removal = new win.MutationObserver(() => { if (!element.isConnected || element.getRootNode() !== doc || !element.contains(table)) disconnect() })
  function disconnect() {
    if (!connected) return
    connected = false; ++version
    removal.disconnect(); removers.forEach(remove => remove())
    if ([...cells.values()].some(cell => cell.button === doc.activeElement) && element.isConnected) {
      element.focus({ preventScroll: true })
    }
    if (header?.parentNode === head) header.remove()
    rows.forEach(row => { if (row.parentNode === body) row.remove() })
    if (!head.childNodes.length) head.append(...fallbackHead)
    if (!body.childNodes.length) body.append(...fallbackBody)
    writes.restore()
    for (const [node, saved] of text) if (node.textContent === saved.last) node.textContent = saved.before
    cells.clear(); rows = []
    if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
  }
  const initial = config(options, true)
  prepared = prepare(initial, initial.value ?? initial.today ?? `${initial.panel}-01`)
  ;(element as Owned)[owner] = token
  commit(prepared, "initial", false)
  listen(body, "focusin", event => {
    const button = event.target instanceof win.HTMLButtonElement ? event.target : null, value = button?.dataset.calendarDate
    if (value && cells.get(value)?.button === button) { focusedDate = value; tabStops() }
  })
  listen(body, "keydown", event => { try { keyboard(event as KeyboardEvent) } catch (failure) { report(failure) } })
  listen(body, "click", event => {
    const button = event.target instanceof win.Element ? event.target.closest<HTMLButtonElement>("[data-calendar-day]") : null
    if (!button || cells.get(button.dataset.calendarDate ?? "")?.button !== button || button.matches(":disabled")) return
    try { select(button.dataset.calendarDate!, "user") } catch (failure) { report(failure) }
  })
  listen(controls, "click", event => {
    const button = event.target instanceof win.Element ? event.target.closest("button") : null
    if (!(button instanceof win.HTMLButtonElement) || !buttons.includes(button) || button.matches(":disabled")
      || button.getAttribute("aria-disabled") === "true" || !available()) return
    try {
      const action = button.dataset.calendarAction
      if (action === "today") today("user")
      else if (action === "clear") select(null, "user")
      else moveMonths(action === "prev-month" ? -1 : action === "next-month" ? 1 : action === "prev-year" ? -12 : 12, "user")
    } catch (failure) { report(failure) }
  })
  listen(controls, "focusout", () => { win.queueMicrotask(() => { if (connected) controlsState() }) })
  removal.observe(doc.documentElement, { childList: true, subtree: true })
  return {
    element, table, get connected() { return connected }, get error() { return error }, get value() { return settings.value }, get state() { return state() },
    set: input => apply(input, "set", false),
    select: value => select(value),
    show: panel => apply({ panel }, "api", true),
    moveMonths: delta => moveMonths(delta),
    moveYears(delta) { if (!Number.isSafeInteger(delta) || Math.abs(delta) > 9999) throw new RangeError("Year delta must be a bounded integer."); moveMonths(delta * 12) },
    today: () => today(),
    reset: () => apply({ value: settings.defaultValue }, "reset", false),
    refresh: () => apply({}, "refresh", false, focusedDate),
    disconnect,
  }
}
