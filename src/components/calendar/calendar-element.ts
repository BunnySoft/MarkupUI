import { ViewElement } from "../../core/index.js"
import { calendarConfig, calendarDefaults, createCalendar } from "./calendar.js"
import type { CalendarController, CalendarLabels, CalendarMode, CalendarSettings, CalendarState, Settings } from "./calendar.js"
import { dateString } from "./date.js"

/**
 * Gregorian date/month selection with one native Web table and no form value.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string | null","previousValue":"string | null","year":"number | null","month":"number | null","date":"number | null","reason":"string"}}
 * @event {"name":"PanelChange","web":"m:calendar-panel-change","bubbles":true,"cancelable":false,"composed":false,"detail":{"panel":"string","previousPanel":"string","year":"number","month":"number","reason":"string"}}
 * @event {"name":"Error","web":"m:calendar-error","bubbles":true,"cancelable":false,"composed":false,"detail":{"error":"unknown"}}
 * @region {"name":"content","accepts":["portable content","Web-only native calendar anatomy"],"min":0,"max":null}
 */
export class Calendar extends ViewElement {
  public static readonly tag = "m-calendar"
  public static get observedAttributes(): string[] {
    return ["value", "default-value", "mode", "panel", "today", "min", "max", "first-day-of-week", "locale", "disabled"]
  }

  private options: Settings = calendarDefaults()
  private controller: CalendarController | undefined
  private reflecting = false
  private attributeInput = false
  private upgraded = false
  private started = false
  private initializing = false
  private valueWritten = false

  public constructor() {
    super()
    const now = new Date()
    this.options.today = dateString({ year: now.getFullYear(), month: now.getMonth() + 1, date: now.getDate() })
    this.options.panel = this.options.today.slice(0, 7)
  }

  public connectedCallback(): void {
    // Container adoption can deliver stale or repeated connection notifications.
    if (!this.isConnected || this.initializing || this.controller?.connected) return
    if (!this.upgraded) { this.upgraded = true; this.upgradeProperties() }
    this.classList.add("m-calendar")
    this.dataset.calendar = ""
    if (!this.hasAttribute("role")) this.setAttribute("role", "group")
    if (!this.hasAttribute("tabindex")) this.tabIndex = -1
    if (!this.hasAttribute("aria-label") && !this.hasAttribute("aria-labelledby")) this.setAttribute("aria-label", "Calendar")
    this.ensureStructure()
    const panel = this.getAttribute("panel") ?? this.getAttribute("data-calendar-month")
    const initial = calendarConfig(this.options, {
      ...(!this.started && !this.valueWritten && { value: this.defaultValue }),
      ...(panel !== null && { panel }),
    })
    this.initializing = true
    try {
      this.controller = createCalendar(this, initial, settings => {
        this.options = settings
        this.reflect({ value: settings.value, panel: settings.panel, mode: settings.mode })
      })
    } finally { this.initializing = false }
    this.started = true
  }

  public disconnectedCallback(): void { this.controller?.disconnect() }

  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || this.reflecting) return
    this.attributeInput = true
    try {
      switch (name) {
        case "value": this.value = after; break
        case "default-value": this.defaultValue = after; break
        case "mode": this.mode = (after ?? "month") as CalendarMode; break
        case "panel": this.panel = after ?? ""; break
        case "today": this.todayValue = after || null; break
        case "min": this.min = after ?? "0001-01-01"; break
        case "max": this.max = after ?? "9999-12-31"; break
        case "first-day-of-week": this.firstDayOfWeek = after === null ? 1 : after.trim() ? Number(after) : NaN; break
        case "locale": this.locale = after ?? "en-US"; break
        case "disabled": this.disabled = after !== null; break
      }
    } catch (error) {
      this.reflecting = true
      try { this.setStringAttribute(name, before) } finally { this.reflecting = false }
      throw error
    } finally { this.attributeInput = false }
  }

  /** Null or a canonical YYYY-MM-DD date / YYYY-MM month. Writes are silent. Web attribute: value. */
  public get value(): string | null { return this.options.value }
  public set value(value: string | null) { this.configure({ value }) }
  /** Reset target (default null), independent of native form reset. Web attribute: default-value. */
  public get defaultValue(): string | null { return this.options.defaultValue }
  public set defaultValue(value: string | null) { this.configure({ defaultValue: value }) }
  /** Month (default) or year; switching retains the selection's original precision. Web attribute: mode. */
  public get mode(): CalendarMode { return this.options.mode }
  public set mode(value: CalendarMode) { this.configure({ mode: value }) }
  /** Canonical YYYY-MM panel, clamped to min/max months. Initially the local current month. Web attribute: panel. */
  public get panel(): string { return this.options.panel }
  public set panel(value: string) { this.configure({ panel: value }) }
  /** Explicit current-date marker/navigation target. Defaults to the local date at construction; null disables it. Web attribute: today. */
  public get todayValue(): string | null { return this.options.today }
  public set todayValue(value: string | null) { this.configure({ today: value }) }
  /** Inclusive canonical date bound; default 0001-01-01. Web attribute: min. */
  public get min(): string { return this.options.min }
  public set min(value: string) { this.configure({ min: value }) }
  /** Inclusive canonical date bound; default 9999-12-31. Web attribute: max. */
  public get max(): string { return this.options.max }
  public set max(value: string) { this.configure({ max: value }) }
  /** Sunday = 0, Monday = 1 (default). Web attribute: first-day-of-week. @min 0 @max 6 @integer */
  public get firstDayOfWeek(): number { return this.options.firstDayOfWeek }
  public set firstDayOfWeek(value: number) { this.configure({ firstDayOfWeek: value }) }
  /** Gregorian/UTC formatting locale; default en-US. Web attribute: locale. */
  public get locale(): string { return this.options.locale }
  public set locale(value: string) { this.configure({ locale: value }) }
  /** Interaction disabled, default false. Web presence attribute: disabled. */
  public get disabled(): boolean { return this.options.disabled }
  public set disabled(value: boolean) { this.configure({ disabled: value }) }
  /** Web-only synchronous day policy. Month selection is bounded by min/max month overlap. */
  public get isDateDisabled(): CalendarSettings["isDateDisabled"] { return this.options.isDateDisabled }
  public set isDateDisabled(value: CalendarSettings["isDateDisabled"]) { this.configure({ isDateDisabled: value ?? null }) }
  /** Web-only synchronous literal day annotation, at most 512 characters; not used for month cells. */
  public get getDayContent(): CalendarSettings["getDayContent"] { return this.options.getDayContent }
  public set getDayContent(value: CalendarSettings["getDayContent"]) { this.configure({ getDayContent: value ?? null }) }
  public get labels(): Readonly<CalendarLabels> { return Object.freeze({ ...this.options.labels }) }
  public set labels(value: Partial<CalendarLabels>) { this.configure({ labels: value }) }
  public get state(): CalendarState { return this.requireController().state }
  public get connected(): boolean { return this.controller?.connected ?? false }
  public get error(): unknown { return this.controller?.error ?? null }
  /** Web interoperability only; null before initialization. */
  public get table(): HTMLTableElement | null { return this.controller?.table ?? null }

  /** Atomic, silent multi-property update, including simultaneous min/max changes. */
  public configure(settings: CalendarSettings): void {
    if (this.initializing) throw new Error("Do not reenter Calendar during initialization.")
    if (this.controller?.connected) this.controller.set(settings)
    else this.options = calendarConfig(this.options, settings)
    if (!this.attributeInput) this.reflect(settings)
    if (settings.value !== undefined) this.valueWritten = true
  }
  /** Select a day in month mode, a month in year mode, or null to clear. */
  public select(value: string | null): boolean { return this.requireController().select(value) }
  public show(panel: string): void { this.requireController().show(panel) }
  public moveMonths(delta: number): void { this.requireController().moveMonths(delta) }
  public moveYears(delta: number): void { this.requireController().moveYears(delta) }
  public prev(): void { this.moveMonths(this.mode === "year" ? -12 : -1) }
  public next(): void { this.moveMonths(this.mode === "year" ? 12 : 1) }
  /** Navigate to todayValue without selecting it. */
  public today(): boolean { return this.requireController().today() }
  public reset(): void { this.requireController().reset() }
  public refresh(): void { this.requireController().refresh() }
  public override focus(options?: FocusOptions): void {
    this.table?.querySelector<HTMLButtonElement>('[data-calendar-day][tabindex="0"]')?.focus(options)
  }

  private requireController(): CalendarController {
    if (!this.controller?.connected) throw new Error("Calendar is disconnected.")
    return this.controller
  }
  private reflect(settings: CalendarSettings): void {
    this.reflecting = true
    try {
      if (settings.value !== undefined) this.setStringAttribute("value", this.value)
      if (settings.defaultValue !== undefined) this.setStringAttribute("default-value", this.defaultValue)
      if (settings.mode !== undefined) this.setAttribute("mode", this.mode)
      if (settings.panel !== undefined) this.setAttribute("panel", this.panel)
      if (settings.today !== undefined) this.setAttribute("today", this.todayValue ?? "")
      if (settings.min !== undefined) this.setAttribute("min", this.min)
      if (settings.max !== undefined) this.setAttribute("max", this.max)
      if (settings.firstDayOfWeek !== undefined) this.setAttribute("first-day-of-week", String(this.firstDayOfWeek))
      if (settings.locale !== undefined) this.setAttribute("locale", this.locale)
      if (settings.disabled !== undefined) this.toggleAttribute("disabled", this.disabled)
    } finally { this.reflecting = false }
  }

  private ensureStructure(): void {
    if (![...this.querySelectorAll("[data-calendar-table]")].some(table => table.closest("m-calendar") === this)) {
      const doc = this.ownerDocument
      const make = <T extends keyof HTMLElementTagNameMap>(tag: T, marker?: string) => {
        const node = doc.createElement(tag)
        if (marker) node.setAttribute(`data-calendar-${marker}`, "")
        return node
      }
      const controls = make("div", "controls")
      controls.hidden = true
      for (const [action, label, text] of [
        ["prev-year", "Previous year", "\u00ab"], ["prev-month", "Previous month", "\u2039"],
        ["today", "Today", "Today"], ["next-month", "Next month", "\u203a"],
        ["next-year", "Next year", "\u00bb"], ["clear", "Clear selection", "Clear"],
      ]) {
        const button = make("button")
        button.type = "button"
        button.dataset.calendarAction = action!
        button.setAttribute("aria-label", label!)
        button.textContent = text!
        controls.append(button)
      }
      const scroll = make("div", "scroll"), table = make("table", "table"), caption = make("caption")
      caption.append(make("span", "caption"))
      table.append(caption, make("thead", "weekdays"), make("tbody", "body"))
      scroll.append(table)
      const template = make("template", "cell"), cell = make("td"), button = make("button", "day")
      button.type = "button"
      button.append(make("span", "number"))
      cell.append(button, make("span", "marks"), make("span", "note"))
      template.content.append(cell)
      this.append(controls, scroll, template, make("p", "value"), make("p", "status"))
    }
  }
}
