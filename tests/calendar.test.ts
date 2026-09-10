import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createCalendar } from "../src/components/calendar/index.js"
import type { CalendarController, CalendarOptions } from "../src/components/calendar/index.js"
import { carrier, dateString, fromOrdinal, inMonth, lastOrdinal, monthDays, monthIndex, ordinal, parseDate, weekday } from "../src/components/calendar/date.js"

const helpers: CalendarController[] = []
function fixture(options: CalendarOptions = {}, bind = true) {
  const form = document.createElement("form")
  form.innerHTML = `<h2 id="calendar-heading">Original <em>calendar heading</em></h2>
    <section class="mui-calendar" data-calendar data-calendar-month="2024-02" tabindex="-1" aria-labelledby="calendar-heading">
      <div data-calendar-controls hidden>
        <button type="button" data-calendar-action="prev-year">Previous year</button>
        <button type="button" data-calendar-action="prev-month">Previous month</button>
        <button type="button" data-calendar-action="today">Go to today</button>
        <button type="button" data-calendar-action="next-month">Next month</button>
        <button type="button" data-calendar-action="next-year">Next year</button>
        <button type="button" data-calendar-action="clear">Clear date</button>
      </div>
      <div data-calendar-scroll><table data-calendar-table>
        <caption>Schedule: <span data-calendar-caption>Authored February 2024</span></caption>
        <thead data-calendar-weekdays><tr><th scope="col">Original weekdays</th></tr></thead>
        <tbody data-calendar-body><tr><td><time datetime="2024-02-01">Authored February 1</time></td></tr></tbody>
      </table></div>
      <template data-calendar-cell><td><button type="button" data-calendar-day><span data-calendar-number></span></button><span data-calendar-marks></span><span data-calendar-note></span></td></template>
      <p data-calendar-value>Original selection readout</p><p data-calendar-status></p>
    </section><label>Native title<input name="title" value="kept"></label><button type="button" data-outside>Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-calendar]")!, body = root.querySelector<HTMLTableSectionElement>("tbody")!
  const original = [...body.childNodes]
  const helper = bind ? createCalendar(root, { today: "2024-02-10", ...options }) : null
  if (helper) helpers.push(helper)
  const day = (value: string) => root.querySelector<HTMLButtonElement>(`[data-calendar-date="${value}"]`)!
  const action = (name: string) => root.querySelector<HTMLButtonElement>(`[data-calendar-action="${name}"]`)!
  function key(button: HTMLElement, key: string, extra: KeyboardEventInit = {}) {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra })
    button.dispatchEvent(event); return event
  }
  return { helper: helper!, root, body, original, form, day, action, key,
    heading: form.querySelector("h2")!, outside: form.querySelector<HTMLButtonElement>("[data-outside]")!,
    caption: root.querySelector<HTMLElement>("[data-calendar-caption]")!,
    readout: root.querySelector<HTMLElement>("[data-calendar-value]")!,
    status: root.querySelector<HTMLElement>("[data-calendar-status]")! }
}
afterEach(() => {
  helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks()
})

describe("Calendar canonical Gregorian arithmetic", () => {
  it.each([[1, false], [4, true], [99, false], [100, false], [400, true], [1500, false], [1600, true], [1900, false], [2000, true], [2024, true], [9999, false]])("handles leap rules for year %i", (year, leap) => {
    expect(monthDays(year as number, 2)).toBe(leap ? 29 : 28)
  })
  it("round-trips bounded dates and weekday arithmetic without local DST or year 0–99 remapping", () => {
    for (const year of [1, 4, 99, 100, 400, 1582, 1900, 2000, 2024, 9999]) for (let month = 1; month <= 12; ++month) {
      for (const date of [1, monthDays(year, month)]) {
        const parts = { year, month, date }, native = carrier(parts)
        expect(fromOrdinal(ordinal(parts))).toEqual(parts)
        expect(native.getUTCFullYear()).toBe(year); expect(native.getUTCMonth() + 1).toBe(month)
        expect(native.getUTCDate()).toBe(date); expect(native.getUTCDay()).toBe(weekday(parts))
      }
    }
    expect(ordinal({ year: 1, month: 1, date: 1 })).toBe(0)
    expect(weekday({ year: 1, month: 1, date: 1 })).toBe(1)
    expect(dateString(fromOrdinal(lastOrdinal))).toBe("9999-12-31")
    expect(() => fromOrdinal(-1)).toThrow(); expect(() => fromOrdinal(lastOrdinal + 1)).toThrow()
  })
  it("reuses Date Picker native canonical validation, not timestamp inference", () => {
    expect(parseDate(document, "0001-01-01")).toEqual({ year: 1, month: 1, date: 1 })
    expect(parseDate(document, "2024-03-10")).toEqual({ year: 2024, month: 3, date: 10 })
    for (const value of ["", "0000-01-01", "10000-01-01", "1900-02-29", "2024-2-01", "2024-02-30", "2024-01-01Z", 0, new Date()]) {
      expect(() => parseDate(document, value)).toThrow()
    }
  })
  it("clamps month/year changes without sticky 31 or invalid leap dates", () => {
    const jan = parseDate(document, "2024-01-31"), feb = inMonth(monthIndex(jan) + 1, jan.date)
    expect(dateString(feb)).toBe("2024-02-29")
    expect(dateString(inMonth(monthIndex(feb) + 1, feb.date))).toBe("2024-03-29")
    expect(dateString(inMonth(monthIndex(feb) + 12, feb.date))).toBe("2025-02-28")
  })
})

describe("Calendar native table and explicit date-only state", () => {
  it("creates one bounded 6×7 native table, not a fake grid or form field", () => {
    const { helper, root, body, form, heading } = fixture()
    expect(body.rows).toHaveLength(6); expect(body.querySelectorAll("td")).toHaveLength(42)
    expect(body.querySelectorAll("button")).toHaveLength(42)
    expect(root.querySelector("[role=grid],[role=gridcell],[role=tab],[aria-selected]")).toBeNull()
    expect(root.querySelectorAll("[data-calendar-day][tabindex='0']")).toHaveLength(1)
    expect(heading.tagName).toBe("H2"); expect(heading.innerHTML).toBe("Original <em>calendar heading</em>")
    expect([...new FormData(form)]).toEqual([["title", "kept"]])
    expect(helper.value).toBeNull(); expect(helper.state.panel).toBe("2024-02")
  })
  it("separates current/default/focused dates and does not react to native form reset", () => {
    const { helper, form } = fixture({ value: "2024-02-29", defaultValue: "2024-02-10" })
    expect(helper.value).toBe("2024-02-29"); expect(helper.state.focusedDate).toBe("2024-02-29")
    helper.set({ defaultValue: "2024-01-31" }); expect(helper.value).toBe("2024-02-29")
    form.reset(); expect(helper.value).toBe("2024-02-29")
    helper.reset(); expect(helper.value).toBe("2024-01-31"); expect(helper.state.panel).toBe("2024-01")
  })
  it("uses authored panel and no implicit clock when today is not supplied", () => {
    const { root } = fixture({}, false), helper = createCalendar(root)
    helpers.push(helper)
    expect(helper.state.today).toBeNull(); expect(helper.today()).toBe(false)
    expect(helper.state.panel).toBe("2024-02")
    expect(root.querySelector('[aria-current="date"]')).toBeNull()
  })
  it("requires an explicit month/value/today anchor instead of reading Date.now", () => {
    const { root } = fixture({}, false); root.removeAttribute("data-calendar-month")
    expect(() => createCalendar(root)).toThrow(/panel/)
    const helper = createCalendar(root, { today: "0099-03-01" }); helpers.push(helper)
    expect(helper.state.panel).toBe("0099-03")
  })
  it("shows adjacent months and changes panel once when an adjacent available date is selected", () => {
    const { helper, root, day } = fixture(), panels = vi.fn(), changes = vi.fn()
    root.addEventListener("mui:calendar-panel-change", panels); root.addEventListener("mui:calendar-change", changes)
    expect(day("2024-01-29").closest("td")!.hasAttribute("data-calendar-adjacent")).toBe(true)
    day("2024-03-01").click()
    expect(helper.state.panel).toBe("2024-03"); expect(helper.value).toBe("2024-03-01")
    expect(panels).toHaveBeenCalledOnce(); expect(changes).toHaveBeenCalledOnce()
    expect(changes.mock.calls[0]![0].detail).toMatchObject({ year: 2024, month: 3, date: 1, value: "2024-03-01" })
  })
  it("distinguishes today/selection/unavailability without color-only semantics", () => {
    const { root, day, readout, helper } = fixture({ value: "2024-02-10", isDateDisabled: value => value === "2024-02-10" })
    const today = day("2024-02-10")
    expect(today.getAttribute("aria-current")).toBe("date")
    expect(today.getAttribute("aria-pressed")).toBe("true")
    expect(today.getAttribute("aria-disabled")).toBe("true")
    expect(today.disabled).toBe(false)
    expect(today.closest("td")!.querySelector("[data-calendar-marks]")!.textContent).toBe("Today · Selected · Unavailable")
    expect(today.closest("td")!.querySelector("[data-calendar-marks]")!.getAttribute("aria-hidden")).toBe("true")
    expect(helper.state.selectionAvailable).toBe(false); expect(readout.textContent).toContain("Unavailable")
    expect(root.querySelectorAll('[aria-current="date"]')).toHaveLength(1)
  })
  it("accepts unavailable programmatic state without allowing unavailable user selection", () => {
    const { helper, root, day } = fixture({ min: "2024-02-10", max: "2024-02-20" }), changed = vi.fn()
    root.addEventListener("mui:calendar-change", changed)
    day("2024-02-09").click(); expect(helper.value).toBeNull()
    expect(helper.select("2024-02-21")).toBe(false)
    helper.set({ value: "2024-02-21" }); expect(helper.value).toBe("2024-02-21"); expect(helper.state.selectionAvailable).toBe(false)
    expect(changed).not.toHaveBeenCalled()
  })
  it("retains selection if a refreshed policy makes it unavailable, with no search/automatic clearing", () => {
    let disabled = false
    const { helper, day } = fixture({ value: "2024-02-15", isDateDisabled: () => disabled })
    day("2024-02-15").focus(); disabled = true; helper.refresh()
    expect(helper.value).toBe("2024-02-15"); expect(helper.state.selectionAvailable).toBe(false)
    expect(document.activeElement).toBe(day("2024-02-15"))
    expect(day("2024-02-15").getAttribute("aria-disabled")).toBe("true")
  })
  it("uses safe literal annotations outside day buttons and stable description IDs", () => {
    const { helper, day } = fixture({ getDayContent: (value, parts) => {
      expect(Object.isFrozen(parts)).toBe(true)
      return value === "2024-02-15" ? "<img src=x> & note" : ""
    } })
    const button = day("2024-02-15"), cell = button.closest("td")!, note = cell.querySelector("[data-calendar-note]")!
    expect(note.textContent).toBe("<img src=x> & note"); expect(cell.querySelector("img")).toBeNull()
    expect(button.contains(note)).toBe(false); expect(button.getAttribute("aria-describedby")).toBe(note.id)
    helper.refresh(); expect(day("2024-02-15")).toBe(button)
  })
})

describe("Calendar keyboard, bounds, locale and focus", () => {
  it("moves roving focus with arrows/Home/End without selecting or rebuilding the current rows", () => {
    const { helper, root, body, day, key } = fixture(), rows = [...body.rows], changed = vi.fn()
    root.addEventListener("mui:calendar-change", changed)
    day("2024-02-28").focus(); key(day("2024-02-28"), "ArrowRight")
    expect(helper.state.focusedDate).toBe("2024-02-29"); expect(document.activeElement).toBe(day("2024-02-29"))
    key(day("2024-02-29"), "Home"); expect(helper.state.focusedDate).toBe("2024-02-26")
    key(day("2024-02-26"), "End"); expect(helper.state.focusedDate).toBe("2024-03-03")
    expect(helper.value).toBeNull(); expect(changed).not.toHaveBeenCalled()
    expect(helper.state.panel).toBe("2024-03")
    expect(rows[0]).not.toBe(body.rows[0])
  })
  it("keeps rows and buttons for same-month selection/focus changes", () => {
    const { helper, body, day, key } = fixture(), rows = [...body.rows], button = day("2024-02-15")
    button.focus(); key(button, "ArrowRight")
    expect([...body.rows]).toEqual(rows); expect(day("2024-02-15")).toBe(button)
    helper.select("2024-02-16"); expect([...body.rows]).toEqual(rows)
  })
  it("uses PageUp/Down month steps and Shift for clamped years", () => {
    const { helper, day, key } = fixture({ value: "2024-01-31" })
    day("2024-01-31").focus(); key(day("2024-01-31"), "PageDown")
    expect(helper.state.focusedDate).toBe("2024-02-29")
    key(day("2024-02-29"), "PageDown", { shiftKey: true })
    expect(helper.state.focusedDate).toBe("2025-02-28"); expect(helper.value).toBe("2024-01-31")
    key(day("2025-02-28"), "PageUp"); expect(helper.state.focusedDate).toBe("2025-01-28")
  })
  it("leaves Tab, editing/modifier and native Enter/Space activation alone", () => {
    const { helper, day, key, form } = fixture(), button = day("2024-02-15")
    expect(key(button, "Tab").defaultPrevented).toBe(false)
    expect(key(button, "ArrowRight", { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(key(form.querySelector("input")!, "ArrowRight").defaultPrevented).toBe(false)
    expect(key(button, "Enter").defaultPrevented).toBe(false); expect(helper.value).toBeNull()
    button.click(); expect(helper.value).toBe("2024-02-15")
  })
  it("honors physical RTL horizontal keys and an explicit first weekday", () => {
    const { helper, root, day, key } = fixture({ firstDayOfWeek: 0 })
    expect(root.querySelector("thead abbr")!.getAttribute("title")).toBe("Sunday")
    root.querySelector("table")!.style.direction = "rtl"
    day("2024-02-15").focus(); key(day("2024-02-15"), "ArrowLeft")
    expect(helper.state.focusedDate).toBe("2024-02-16")
    key(day("2024-02-16"), "Home"); expect(helper.state.focusedDate).toBe("2024-02-11")
  })
  it("forces Gregorian/UTC formatting despite a locale's Buddhist calendar preference", () => {
    const { helper, caption, day } = fixture({ locale: "th-TH-u-ca-buddhist" })
    expect(helper.state.year).toBe(2024); expect(caption.textContent).toContain("2024")
    expect(caption.textContent).not.toContain("2567")
    expect(day("2024-02-29").getAttribute("aria-label")).toContain("2024")
  })
  it("keeps all-disabled intervals navigable for discovery without an unbounded valid-day search", () => {
    const callback = vi.fn(() => true), { helper, day, key, root } = fixture({ isDateDisabled: callback })
    expect(callback.mock.calls.length).toBe(42)
    const button = day("2024-02-10"); button.focus(); key(button, "ArrowRight")
    expect(helper.state.focusedDate).toBe("2024-02-11"); expect(callback.mock.calls.length).toBe(42)
    day("2024-02-11").click(); expect(helper.value).toBeNull()
    expect(root.querySelectorAll("[data-calendar-day][tabindex='0']")).toHaveLength(1)
  })
  it("bounds years 1/9999 and renders physical out-of-domain cells without fake dates/buttons", () => {
    const { helper, root, day, key } = fixture({ panel: "0001-01", firstDayOfWeek: 0, today: null })
    expect(root.querySelector("[data-calendar-caption]")!.textContent).toContain("1")
    expect(root.querySelector("[data-calendar-date^='1901']")).toBeNull()
    day("0001-01-01").focus(); key(day("0001-01-01"), "ArrowLeft"); expect(helper.state.focusedDate).toBe("0001-01-01")
    expect(root.querySelector("tbody td")!.textContent).toBe("—")
    helper.set({ panel: "9999-12" }); helper.moveYears(1); expect(helper.state.panel).toBe("9999-12")
    expect(root.querySelector("[data-calendar-date^='10000']")).toBeNull()
    expect(root.querySelectorAll("tbody td")).toHaveLength(42)
  })
  it("keeps focused navigation at a boundary and uses today only as explicit panel navigation", async () => {
    const { helper, action, outside } = fixture({ panel: "2024-01", min: "2024-01-01", max: "2024-02-29" })
    const next = action("next-month"); next.focus(); next.click()
    expect(helper.state.panel).toBe("2024-02"); expect(document.activeElement).toBe(next)
    expect(next.disabled).toBe(false); expect(next.getAttribute("aria-disabled")).toBe("true")
    next.click(); expect(helper.state.panel).toBe("2024-02")
    outside.focus(); await Promise.resolve(); expect(next.disabled).toBe(true)
    helper.show("2024-01"); expect(helper.today()).toBe(true)
    expect(helper.state.panel).toBe("2024-02"); expect(helper.value).toBeNull()
    expect(document.activeElement).toBe(outside)
  })
  it("never changes external focus or form submission membership", () => {
    const { helper, outside, form, action, day } = fixture(), submit = vi.fn()
    form.addEventListener("submit", event => { submit(event); event.preventDefault() })
    outside.focus(); helper.set({ value: "2024-03-12" }); expect(document.activeElement).toBe(outside)
    action("prev-month").click(); day("2024-02-12").click()
    expect(submit).not.toHaveBeenCalled(); expect([...new FormData(form)]).toEqual([["title", "kept"]])
  })
})

describe("Calendar atomic callbacks and lifetime", () => {
  it.each([{ min: "2024-03-01", max: "2024-02-01" }, { firstDayOfWeek: 7 }, { panel: "2024-13" },
    { value: "2023-02-29" }, { value: 0 }, { today: new Date() }, { locale: "invalid_locale" },
    { labels: { today: "" } }, { isDateDisabled: () => undefined }, { getDayContent: () => document.createElement("b") },
    { getDayContent: () => "x".repeat(513) }])("rejects invalid settings/callback output atomically", options => {
    const { helper, body, caption } = fixture(), before = body.innerHTML, title = caption.textContent, state = helper.state
    expect(() => helper.set(options as CalendarOptions)).toThrow()
    expect(body.innerHTML).toBe(before); expect(caption.textContent).toBe(title); expect(helper.state).toEqual(state)
  })
  it("does not partially render when a later date callback throws or returns a promise", async () => {
    const { helper, body, root, action } = fixture(), before = body.innerHTML
    expect(() => helper.set({ getDayContent: value => { if (value.endsWith("-15")) throw new Error("failed note"); return "OK" } })).toThrow("failed note")
    expect(body.innerHTML).toBe(before)
    expect(() => helper.set({ isDateDisabled: (() => Promise.reject(new Error("not synchronous"))) as never })).toThrow(/synchronous/)
    await Promise.resolve(); expect(body.innerHTML).toBe(before)
    let fail = false; helper.set({ isDateDisabled: () => { if (fail) throw new Error("policy changed"); return false } })
    const error = vi.fn(); root.addEventListener("mui:calendar-error", error); fail = true
    action("next-month").click(); expect(helper.state.panel).toBe("2024-02"); expect(error).toHaveBeenCalledOnce()
  })
  it("guards mutations during callbacks and honors callback-driven disconnect", () => {
    const { helper, root, original, body } = fixture()
    expect(() => helper.set({ getDayContent: () => { helper.show("2024-03"); return "" } })).toThrow(/reenter/)
    expect(helper.state.panel).toBe("2024-02")
    expect(() => helper.set({ getDayContent: () => { helper.disconnect(); return "" } })).toThrow(/disconnected/)
    expect(helper.connected).toBe(false); expect([...body.childNodes]).toEqual(original)
    expect(root.querySelector("[data-calendar-controls]")!.hasAttribute("hidden")).toBe(true)
  })
  it("suppresses stale value notification after a reentrant panel event changes the state", () => {
    const { helper, root } = fixture(), change = vi.fn()
    root.addEventListener("mui:calendar-change", change)
    root.addEventListener("mui:calendar-panel-change", () => helper.set({ value: "2024-04-10" }), { once: true })
    helper.select("2024-03-01")
    expect(helper.value).toBe("2024-04-10"); expect(change).not.toHaveBeenCalled()
  })
  it("stops committing if focus restoration disconnects the controller", () => {
    const { helper, day, root, body, original } = fixture()
    const button = day("2024-02-29"); button.focus()
    button.addEventListener("focus", () => helper.disconnect(), { once: true })
    helper.moveMonths(1)
    expect(helper.connected).toBe(false); expect([...body.childNodes]).toEqual(original)
    expect(root.querySelector("[data-calendar-controls]")!.hasAttribute("hidden")).toBe(true)
  })
  it("restores original fallback nodes/listeners and only still-owned text/attributes", () => {
    const { helper, body, original, root, caption } = fixture()
    const listener = vi.fn(); original[0]!.addEventListener("fallback-test", listener)
    caption.textContent = "Author changed the caption"
    helper.disconnect(); helper.disconnect()
    expect([...body.childNodes]).toEqual(original); expect(caption.textContent).toBe("Author changed the caption")
    expect(root.dataset.calendarMonth).toBe("2024-02")
    original[0]!.dispatchEvent(new Event("fallback-test")); expect(listener).toHaveBeenCalledOnce()
    const next = createCalendar(root); helpers.push(next); expect(next.connected).toBe(true)
  })
  it("does not overwrite an externally supplied replacement tbody on teardown", () => {
    const { helper, body } = fixture(), author = document.createElement("tr")
    author.innerHTML = "<td>Author replacement</td>"; body.replaceChildren(author); helper.disconnect()
    expect(body.firstElementChild).toBe(author)
  })
  it("rejects refresh after externally replaced owned rows rather than claiming a stale view", () => {
    const { helper, body } = fixture(), author = document.createElement("tr")
    author.innerHTML = "<td>New author view</td>"; body.replaceChildren(author)
    expect(() => helper.refresh()).toThrow(/anatomy/)
    expect(helper.connected).toBe(false); expect(body.firstElementChild).toBe(author)
  })
  it("auto-disconnects removed owners and permits safe explicit rebinding", async () => {
    const { helper, root, form } = fixture()
    root.remove(); await Promise.resolve(); expect(helper.connected).toBe(false)
    form.append(root); const next = createCalendar(root); helpers.push(next); expect(next.connected).toBe(true)
  })
  it("disables only Calendar interaction without inventing a named form control", () => {
    const { helper, action, day, form } = fixture()
    helper.set({ disabled: true }); action("next-month").click(); day("2024-02-15").click()
    expect(helper.value).toBeNull(); expect(helper.state.panel).toBe("2024-02")
    expect(helper.select("2024-02-15")).toBe(false)
    expect([...new FormData(form)]).toEqual([["title", "kept"]])
  })
  it("preserves native fieldset disabling without rewriting original form fields", () => {
    const { helper, root, form, day } = fixture(), fieldset = document.createElement("fieldset")
    form.prepend(fieldset); fieldset.append(root); fieldset.disabled = true
    expect(helper.state.disabled).toBe(true); expect(day("2024-02-15").matches(":disabled")).toBe(true)
    day("2024-02-15").click(); expect(helper.value).toBeNull()
    expect([...new FormData(form)]).toEqual([["title", "kept"]])
    fieldset.disabled = false; expect(helper.select("2024-02-15")).toBe(true)
  })
})

describe("Calendar default styles", () => {
  const css = readFileSync(resolve("src", "components", "calendar", "calendar.css"), "utf8")

  it("keeps the Calendar stylesheet within its unchanged budget", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1250)
  })

  it("defines the measured light and dark Calendar surfaces without a runtime dependency", () => {
    expect(css).toContain("light-dark(#18a058, #63e2b7)")
    expect(css).toContain("light-dark(#fff, #18181c)")
    expect(css).toContain("light-dark(#efeff5, #2d2d30)")
    expect(css).toContain("light-dark(#333639, rgba(255,255,255,.82))")
    expect(css).not.toContain("@import")
  })

  it("retains native table and button ownership while matching the measured metrics", () => {
    expect(css).toContain("font-size: var(--mui-calendar-font-size, 14px)")
    expect(css).toContain("font-size: var(--mui-calendar-title-size, 22px)")
    expect(css).toContain("padding: var(--mui-calendar-padding, 10px)")
    expect(css).toContain("min-block-size: 28px")
    expect(css).toContain("inline-size: 1.8em")
    expect(css).not.toContain("[role=")
  })

  it("keeps hidden, forced-color and print behavior explicit", () => {
    expect(css).toContain(".mui-calendar [hidden] { display: none !important; }")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("@media print")
    expect(css).toContain("[data-calendar-controls], .mui-calendar [data-calendar-status] { display: none; }")
  })
})
