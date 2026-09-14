import { ViewElement } from "../../core/index.js"
import { formatTime } from "./format.js"

export type TimeDisplayType = "relative" | "date" | "datetime"
export const timeTypes: readonly TimeDisplayType[] = ["relative", "date", "datetime"] as const

function formatCustom(date: Date, fmt: string): string {
  const pad = (n: number, l = 2): string => String(n).padStart(l, "0")
  const hours = date.getHours()
  const map: Record<string, string> = {
    yyyy: String(date.getFullYear()),
    yy: String(date.getFullYear()).slice(-2),
    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    dd: pad(date.getDate()),
    d: String(date.getDate()),
    HH: pad(hours),
    H: String(hours),
    hh: pad(hours % 12 || 12),
    h: String(hours % 12 || 12),
    mm: pad(date.getMinutes()),
    m: String(date.getMinutes()),
    ss: pad(date.getSeconds()),
    s: String(date.getSeconds()),
    a: hours < 12 ? "am" : "pm",
    A: hours < 12 ? "AM" : "PM",
  }
  return fmt.replace(/yyyy|yy|MM|M|dd|d|HH|H|hh|h|mm|m|ss|s|[aA]/g, match => map[match] ?? match)
}

/**
 * A time component for formatting and displaying dates, times, and relative times.
 * @region {"name":"content","accepts":["text","phrasing"],"min":0,"max":null}
 * @event {"name":"TimeChange","web":"m:time-change","bubbles":true,"cancelable":false,"composed":false,"detail":{"text":"string","datetime":"string"}}
 */
export class Time extends ViewElement {
  public static readonly tag = "m-time"
  public static readonly observedAttributes = ["time", "format", "type"]

  private timer: number | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-time")
    this.synchronize()
  }

  public disconnectedCallback(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
  }

  public attributeChangedCallback(name: string): void {
    if (this.isConnected && Time.observedAttributes.includes(name)) {
      this.synchronize()
    }
  }

  /**
   * The timestamp or date string to format.
   */
  public get time(): number | string {
    return this.getAttribute("time") ?? ""
  }

  public set time(value: number | string | null | undefined) {
    if (value == null) {
      this.removeAttribute("time")
    } else if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new RangeError("Time value must be finite.")
      this.setAttribute("time", String(value))
    } else if (typeof value === "string") {
      this.setStringAttribute("time", value)
    } else {
      throw new TypeError("Time value must be a string or number.")
    }
  }

  /**
   * Date/time formatting string.
   */
  public get format(): string {
    return this.getAttribute("format") ?? ""
  }

  public set format(value: string | null | undefined) {
    this.setStringAttribute("format", value ?? null)
  }

  /**
   * Type of time formatting to display.
   */
  public get type(): TimeDisplayType {
    return this.choiceAttribute("type", timeTypes, "datetime")
  }

  public set type(value: TimeDisplayType) {
    this.setChoiceAttribute("type", value, timeTypes)
  }

  private synchronize(): void {
    if (!this.isConnected) return

    if (this.timer !== undefined) {
      clearTimeout(this.timer)
      this.timer = undefined
    }

    const rawTime = this.time
    let timestamp: number
    if (rawTime !== "") {
      const num = Number(rawTime)
      if (!Number.isNaN(num) && Number.isFinite(num)) {
        timestamp = num
      } else {
        const parsed = Date.parse(String(rawTime))
        if (!Number.isNaN(parsed)) {
          timestamp = parsed
        } else {
          return
        }
      }
    } else {
      if (this.childNodes.length > 0 && this.textContent?.trim()) {
        return
      }
      timestamp = Date.now()
    }

    try {
      const date = new Date(timestamp)
      let text: string
      let datetime: string
      let nextChangeMs: number | undefined

      if (this.format) {
        text = formatCustom(date, this.format)
        datetime = date.toISOString()
      } else {
        const formatOptions: { type?: TimeDisplayType; to?: number } = { type: this.type }
        if (this.type === "relative") {
          formatOptions.to = Date.now()
        }
        const result = formatTime(timestamp, formatOptions)
        text = result.text
        datetime = result.datetime
        nextChangeMs = result.relative?.nextChangeMs
      }

      if (this.textContent !== text) {
        this.textContent = text
      }
      if (this.getAttribute("datetime") !== datetime) {
        this.setAttribute("datetime", datetime)
      }

      this.emit("m:time-change", { text, datetime, time: timestamp }, { bubbles: true, cancelable: false, composed: false })

      if (this.isConnected && this.type === "relative" && nextChangeMs) {
        const delay = Math.max(1000, Math.min(2147483647, nextChangeMs))
        this.timer = window.setTimeout(() => {
          this.timer = undefined
          if (this.isConnected) this.synchronize()
        }, delay)
      }
    } catch (err) {
      this.emit("m:time-error", { error: err }, { bubbles: true, cancelable: false, composed: false })
    }
  }
}

export { Time as MTime }
