import { ViewElement } from "../../core/index.js"
import { dateString, fromOrdinal, lastOrdinal, ordinal, weekday } from "./date.js"

export type CalendarMode = "month" | "year"
export const calendarModes: readonly CalendarMode[] = ["month", "year"] as const

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

/**
 * A calendar component for displaying and selecting dates in month and year views.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @region {"name":"content","accepts":["calendar content","table"],"min":0,"max":null}
 */
export class Calendar extends ViewElement {
  public static readonly tag = "m-calendar"

  public static get observedAttributes(): string[] {
    return ["value", "mode"]
  }

  private initialized = false
  private panelYear: number
  private panelMonth: number

  public constructor() {
    super()
    const now = new Date()
    this.panelYear = now.getFullYear()
    this.panelMonth = now.getMonth() + 1
  }

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-calendar")
    if (this.value) {
      this.updatePanelFromValue(this.value)
    }
    this.render()
  }

  public disconnectedCallback(): void {
    // No-op
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.initialized && this.isConnected) {
      if (name === "value" && newValue) {
        this.updatePanelFromValue(newValue)
      }
      this.render()
    }
  }

  public get value(): string | null {
    return this.getAttribute("value")
  }

  public set value(value: string | null) {
    this.setStringAttribute("value", value)
    if (this.initialized && value) {
      this.updatePanelFromValue(value)
    }
    if (this.initialized && this.isConnected) {
      this.render()
    }
  }

  public get mode(): CalendarMode {
    return this.choiceAttribute("mode", calendarModes, "month")
  }

  public set mode(value: CalendarMode) {
    this.setChoiceAttribute("mode", value, calendarModes)
    if (this.initialized && this.isConnected) {
      this.render()
    }
  }

  public select(date: string | null): void {
    const oldValue = this.value
    this.value = date
    if (oldValue !== date) {
      this.emit<{ value: string }>("m:change", { value: date ?? "" }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  public prev(): void {
    if (this.mode === "year") {
      this.panelYear -= 1
    } else {
      this.panelMonth -= 1
      if (this.panelMonth < 1) {
        this.panelMonth = 12
        this.panelYear -= 1
      }
    }
    this.render()
  }

  public next(): void {
    if (this.mode === "year") {
      this.panelYear += 1
    } else {
      this.panelMonth += 1
      if (this.panelMonth > 12) {
        this.panelMonth = 1
        this.panelYear += 1
      }
    }
    this.render()
  }

  public today(): void {
    const now = new Date()
    this.panelYear = now.getFullYear()
    this.panelMonth = now.getMonth() + 1
    this.render()
  }

  private updatePanelFromValue(val: string): void {
    const match = /^(\d{4})-(\d{2})/.exec(val)
    if (match && match[1] && match[2]) {
      this.panelYear = Number(match[1])
      this.panelMonth = Number(match[2])
    }
  }

  private render(): void {
    const doc = this.ownerDocument
    const mode = this.mode

    // Controls
    const controls = doc.createElement("div")
    controls.setAttribute("data-calendar-controls", "")

    const prevYearBtn = doc.createElement("button")
    prevYearBtn.type = "button"
    prevYearBtn.setAttribute("data-calendar-action", "prev-year")
    prevYearBtn.setAttribute("aria-label", "Previous year")
    prevYearBtn.textContent = "«"
    prevYearBtn.addEventListener("click", () => {
      this.panelYear -= 1
      this.render()
    })
    controls.append(prevYearBtn)

    if (mode === "month") {
      const prevMonthBtn = doc.createElement("button")
      prevMonthBtn.type = "button"
      prevMonthBtn.setAttribute("data-calendar-action", "prev-month")
      prevMonthBtn.setAttribute("aria-label", "Previous month")
      prevMonthBtn.textContent = "‹"
      prevMonthBtn.addEventListener("click", () => {
        this.panelMonth -= 1
        if (this.panelMonth < 1) {
          this.panelMonth = 12
          this.panelYear -= 1
        }
        this.render()
      })
      controls.append(prevMonthBtn)
    }

    const todayBtn = doc.createElement("button")
    todayBtn.type = "button"
    todayBtn.setAttribute("data-calendar-action", "today")
    todayBtn.textContent = mode === "year" ? "This year" : "Today"
    todayBtn.addEventListener("click", () => this.today())
    controls.append(todayBtn)

    if (mode === "month") {
      const nextMonthBtn = doc.createElement("button")
      nextMonthBtn.type = "button"
      nextMonthBtn.setAttribute("data-calendar-action", "next-month")
      nextMonthBtn.setAttribute("aria-label", "Next month")
      nextMonthBtn.textContent = "›"
      nextMonthBtn.addEventListener("click", () => {
        this.panelMonth += 1
        if (this.panelMonth > 12) {
          this.panelMonth = 1
          this.panelYear += 1
        }
        this.render()
      })
      controls.append(nextMonthBtn)
    }

    const nextYearBtn = doc.createElement("button")
    nextYearBtn.type = "button"
    nextYearBtn.setAttribute("data-calendar-action", "next-year")
    nextYearBtn.setAttribute("aria-label", "Next year")
    nextYearBtn.textContent = "»"
    nextYearBtn.addEventListener("click", () => {
      this.panelYear += 1
      this.render()
    })
    controls.append(nextYearBtn)

    // Scroll wrapper & table
    const scroll = doc.createElement("div")
    scroll.setAttribute("data-calendar-scroll", "")

    const table = doc.createElement("table")
    table.setAttribute("data-calendar-table", "")

    const caption = doc.createElement("caption")
    const captionSpan = doc.createElement("span")
    captionSpan.setAttribute("data-calendar-caption", "")
    const monthName = monthNames[Math.max(0, Math.min(11, this.panelMonth - 1))]
    captionSpan.textContent = mode === "year"
      ? String(this.panelYear)
      : `${monthName} ${this.panelYear}`
    caption.append(captionSpan)
    table.append(caption)

    const selectedValue = this.value
    const now = new Date()
    const todayStr = `${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    if (mode === "month") {
      const thead = doc.createElement("thead")
      thead.setAttribute("data-calendar-weekdays", "")
      const trHead = doc.createElement("tr")
      for (const dayName of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
        const th = doc.createElement("th")
        th.scope = "col"
        th.textContent = dayName
        trHead.append(th)
      }
      thead.append(trHead)
      table.append(thead)

      const tbody = doc.createElement("tbody")
      tbody.setAttribute("data-calendar-body", "")

      const panel = { year: this.panelYear, month: this.panelMonth, date: 1 }
      const firstDayOrdinal = ordinal(panel)
      const w = weekday(panel)
      const startOrdinal = firstDayOrdinal - ((w - 1 + 7) % 7)

      for (let r = 0; r < 6; r++) {
        const tr = doc.createElement("tr")
        for (let c = 0; c < 7; c++) {
          const idx = r * 7 + c
          const cord = startOrdinal + idx
          const td = doc.createElement("td")
          if (cord >= 0 && cord <= lastOrdinal) {
            const parts = fromOrdinal(cord)
            const dStr = dateString(parts)
            const isAdjacent = parts.month !== this.panelMonth || parts.year !== this.panelYear
            if (isAdjacent) {
              td.setAttribute("data-calendar-adjacent", "")
            }
            const btn = doc.createElement("button")
            btn.type = "button"
            btn.setAttribute("data-calendar-day", "")
            btn.setAttribute("data-calendar-date", dStr)
            if (selectedValue === dStr) {
              btn.setAttribute("aria-pressed", "true")
            }
            if (todayStr === dStr) {
              btn.setAttribute("aria-current", "date")
            }
            const numSpan = doc.createElement("span")
            numSpan.setAttribute("data-calendar-number", "")
            numSpan.textContent = String(parts.date)
            btn.append(numSpan)
            btn.addEventListener("click", () => this.select(dStr))

            const marksSpan = doc.createElement("span")
            marksSpan.setAttribute("data-calendar-marks", "")
            marksSpan.setAttribute("aria-hidden", "true")

            const noteSpan = doc.createElement("span")
            noteSpan.setAttribute("data-calendar-note", "")

            td.append(btn, marksSpan, noteSpan)
          }
          tr.append(td)
        }
        tbody.append(tr)
      }
      table.append(tbody)
    } else {
      // Year mode
      const tbody = doc.createElement("tbody")
      tbody.setAttribute("data-calendar-body", "")

      for (let r = 0; r < 4; r++) {
        const tr = doc.createElement("tr")
        for (let c = 0; c < 3; c++) {
          const m = r * 3 + c + 1
          const td = doc.createElement("td")
          const mStr = `${String(this.panelYear).padStart(4, "0")}-${String(m).padStart(2, "0")}`
          const btn = doc.createElement("button")
          btn.type = "button"
          btn.setAttribute("data-calendar-day", "")
          btn.setAttribute("data-calendar-date", mStr)
          if (selectedValue === mStr || (selectedValue !== null && selectedValue.startsWith(mStr))) {
            btn.setAttribute("aria-pressed", "true")
          }
          const numSpan = doc.createElement("span")
          numSpan.setAttribute("data-calendar-number", "")
          numSpan.textContent = shortMonthNames[m - 1]!
          btn.append(numSpan)
          btn.addEventListener("click", () => this.select(mStr))

          td.append(btn)
          tr.append(td)
        }
        tbody.append(tr)
      }
      table.append(tbody)
    }

    scroll.replaceChildren(table)
    this.replaceChildren(controls, scroll)
  }
}
