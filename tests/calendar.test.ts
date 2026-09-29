import { checkSizeRecommendation } from "../scripts/size-policy.mjs"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Calendar, calendarModes, registerCalendar } from "../src/components/calendar/index.js"
import { createCalendar } from "../src/components/calendar/calendar.js"
import type { CalendarController, CalendarSettings as CalendarOptions } from "../src/components/calendar/calendar.js"
import { carrier, dateString, fromOrdinal, inMonth, lastOrdinal, monthDays, monthIndex, ordinal, parseDate, weekday } from "../src/components/calendar/date.js"
import { ViewElement } from "../src/core/index.js"
import "../src/components/box/index.js"
import "../src/components/form/index.js"
import "../src/components/button/index.js"

const helpers: CalendarController[] = []
function fixture(options: CalendarOptions = {}, bind = true) {
  const form = document.createElement("form")
  form.innerHTML = `<h2 id="calendar-heading">Original <em>calendar heading</em></h2>
    <section class="m-calendar" data-calendar data-calendar-month="2024-02" tabindex="-1" aria-labelledby="calendar-heading">
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
  it("uses strict native UTC round-trip validation, not timestamp inference or form input capabilities", () => {
    vi.spyOn(HTMLInputElement.prototype, "type", "get").mockReturnValue("text")
    expect(parseDate("0001-01-01")).toEqual({ year: 1, month: 1, date: 1 })
    expect(parseDate("2024-03-10")).toEqual({ year: 2024, month: 3, date: 10 })
    for (const value of ["", "0000-01-01", "10000-01-01", "1900-02-29", "2024-2-01", "2024-02-30", "2024-01-01Z",
      "2024-01-01\n", "2024-00-01", "2024-13-01", "2024-01-00", "2024-99-99", 0, new Date()]) {
      expect(() => parseDate(value)).toThrow()
    }
  })
  it("clamps month/year changes without sticky 31 or invalid leap dates", () => {
    const jan = parseDate("2024-01-31"), feb = inMonth(monthIndex(jan) + 1, jan.date)
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
    root.addEventListener("m:calendar-panel-change", panels); root.addEventListener("m:change", changes)
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
    root.addEventListener("m:change", changed)
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
    root.addEventListener("m:change", changed)
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
    const error = vi.fn(); root.addEventListener("m:calendar-error", error); fail = true
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
    root.addEventListener("m:change", change)
    root.addEventListener("m:calendar-panel-change", () => helper.set({ value: "2024-04-10" }), { once: true })
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
    checkSizeRecommendation(gzipSync(css, { level: 9 }).length, 1250, "calendar.test.ts: gzipSync(css, { level: 9 }).length")
  })

  it("defines the measured light and dark Calendar surfaces without a runtime dependency", () => {
    expect(css).toContain("light-dark(#18a058, #63e2b7)")
    expect(css).toContain("light-dark(#fff, #18181c)")
    expect(css).toContain("light-dark(#efeff5, #2d2d30)")
    expect(css).toContain("light-dark(#333639, rgba(255,255,255,.82))")
    expect(css).not.toContain("@import")
  })

  it("retains native table and button ownership while matching the measured metrics", () => {
    expect(css).toContain("font-size: var(--m-calendar-font-size, 14px)")
    expect(css).toContain("font-size: var(--m-calendar-title-size, 22px)")
    expect(css).toContain("padding: var(--m-calendar-padding, 10px)")
    expect(css).toContain("min-block-size: 28px")
    expect(css).toContain("inline-size: 1.8em")
    expect(css).not.toContain("[role=")
  })

  it("keeps hidden, forced-color and print behavior explicit", () => {
    expect(css).toContain(".m-calendar [hidden] { display: none !important; }")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("@media print")
    expect(css).toContain("[data-calendar-controls], .m-calendar [data-calendar-status] { display: none; }")
  })
})

describe("canonical Calendar ViewElement", () => {
  it("registers canonical Calendar with own tag, ViewElement inheritance and registration conflict safety", () => {
    expect(Calendar.prototype instanceof ViewElement).toBe(true)
    expect(customElements.get("m-calendar")).toBe(Calendar)
    expect(Calendar.tag).toBe("m-calendar")
    const define = vi.fn()
    registerCalendar({ get: () => undefined, define })
    expect(define.mock.calls.map(call => call[0])).toEqual(["m-calendar"])
    expect(() => registerCalendar({ get: () => HTMLElement as any, define })).toThrow("different implementation")
  })

  it("exposes canonical observedAttributes and default property values", () => {
    expect(Calendar.observedAttributes).toEqual(["value", "default-value", "mode", "panel", "today", "min", "max", "first-day-of-week", "locale", "disabled"])
    const calendar = new Calendar()
    expect(calendar.value).toBeNull()
    expect(calendar.mode).toBe("month")
    expect(calendarModes).toEqual(["month", "year"])
  })

  it("reflects properties to attributes and validates mode choices", () => {
    const calendar = new Calendar()
    calendar.value = "2026-09-13"
    expect(calendar.getAttribute("value")).toBe("2026-09-13")
    calendar.value = null
    expect(calendar.hasAttribute("value")).toBe(false)

    calendar.mode = "year"
    expect(calendar.getAttribute("mode")).toBe("year")
    calendar.mode = "month"
    expect(calendar.getAttribute("mode")).toBe("month")
    expect(() => { (calendar as any).mode = "decade" }).toThrow()
  })

  it("renders month grid, table caption and sets aria-pressed on selected day", () => {
    const calendar = new Calendar()
    calendar.value = "2024-02-15"
    document.body.append(calendar)

    expect(calendar.classList.contains("m-calendar")).toBe(true)
    const table = calendar.querySelector("table[data-calendar-table]")
    expect(table).not.toBeNull()
    const caption = calendar.querySelector("[data-calendar-caption]")
    expect(caption?.textContent).toBe("February 2024")

    const days = calendar.querySelectorAll<HTMLButtonElement>("button[data-calendar-day]")
    expect(days).toHaveLength(42)

    const selectedBtn = calendar.querySelector<HTMLButtonElement>('button[data-calendar-date="2024-02-15"]')
    expect(selectedBtn).not.toBeNull()
    expect(selectedBtn?.getAttribute("aria-pressed")).toBe("true")
  })

  it("emits m:change event when a day is selected or clicked", () => {
    const calendar = new Calendar()
    calendar.value = "2024-02-10"
    document.body.append(calendar)

    const listener = vi.fn()
    calendar.addEventListener("m:change", listener)

    const targetDay = calendar.querySelector<HTMLButtonElement>('button[data-calendar-date="2024-02-20"]')!
    expect(targetDay).not.toBeNull()
    targetDay.click()

    expect(listener).toHaveBeenCalledOnce()
    const event = listener.mock.calls[0]![0] as CustomEvent<{ value: string }>
    expect(event.detail).toMatchObject({ value: "2024-02-20", previousValue: "2024-02-10", year: 2024, month: 2, date: 20, reason: "user" })
    expect(event.bubbles).toBe(true)
    expect(event.cancelable).toBe(false)
    expect(event.composed).toBe(false)
    expect(calendar.value).toBe("2024-02-20")

    calendar.select("2024-02-25")
    expect(listener).toHaveBeenCalledTimes(2)
    expect(calendar.value).toBe("2024-02-25")
  })

  it("supports navigation via controls and methods", () => {
    const calendar = new Calendar()
    calendar.value = "2024-02-15"
    document.body.append(calendar)

    calendar.next()
    let caption = calendar.querySelector("[data-calendar-caption]")
    expect(caption?.textContent).toBe("March 2024")

    calendar.prev()
    caption = calendar.querySelector("[data-calendar-caption]")
    expect(caption?.textContent).toBe("February 2024")

    const nextMonthBtn = calendar.querySelector<HTMLButtonElement>('button[data-calendar-action="next-month"]')!
    nextMonthBtn.click()
    caption = calendar.querySelector("[data-calendar-caption]")
    expect(caption?.textContent).toBe("March 2024")
  })

  it("supports year mode and selecting months", () => {
    const calendar = new Calendar()
    calendar.mode = "year"
    calendar.value = "2024-05"
    document.body.append(calendar)

    const caption = calendar.querySelector("[data-calendar-caption]")
    expect(caption?.textContent).toBe("2024")

    const monthBtns = calendar.querySelectorAll<HTMLButtonElement>("button[data-calendar-day]")
    expect(monthBtns).toHaveLength(12)

    const selectedMonth = calendar.querySelector<HTMLButtonElement>('button[data-calendar-date="2024-05"]')
    expect(selectedMonth?.getAttribute("aria-pressed")).toBe("true")

    const listener = vi.fn()
    calendar.addEventListener("m:change", listener)

    const targetMonth = calendar.querySelector<HTMLButtonElement>('button[data-calendar-date="2024-08"]')!
    targetMonth.click()

    expect(listener).toHaveBeenCalledOnce()
    expect((listener.mock.calls[0]![0] as CustomEvent<{ value: string }>).detail).toMatchObject({ value: "2024-08", date: null })
    expect(calendar.value).toBe("2024-08")
  })

  it("exports only the canonical element, mode values and registration", async () => {
    const api = await import("../src/components/calendar/index.js")
    expect(api.Calendar).toBe(Calendar)
    expect(api.registerCalendar).toBeTypeOf("function")
    expect(Object.keys(api).sort()).toEqual(["Calendar", "calendarModes", "registerCalendar"])
    expect(api.calendarModes).toEqual(["month", "year"])
  })
})

describe("Calendar unified public behavior", () => {
  function calendar(settings: CalendarOptions = {}) {
    const element = new Calendar()
    element.configure({ value: "2024-02-15", today: "2024-02-10", ...settings })
    document.body.append(element)
    const day = (date: string) => element.querySelector<HTMLButtonElement>(`[data-calendar-date="${date}"]`)!
    const key = (date: string, key: string, extra: KeyboardEventInit = {}) => {
      day(date).focus()
      day(date).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra }))
    }
    return { element, day, key }
  }

  it("maps entirely m-* authored content to one native table without a factory or form proxy", async () => {
    const source = `<m-form><m-calendar value="2024-02-15" today="2024-02-10" aria-label="Schedule"><m-span>Authored note</m-span></m-calendar><m-button attr-type="submit">Save</m-button></m-form>`
    const template = document.createElement("template")
    template.innerHTML = source
    expect([...template.content.querySelectorAll("*")].every(node => node.localName.startsWith("m-"))).toBe(true)
    const note = template.content.querySelector("m-span")!, listener = vi.fn()
    note.addEventListener("note-test", listener)
    document.body.append(template.content)
    await Promise.resolve()
    const element = document.querySelector<Calendar>("m-calendar")!
    expect(element.connected).toBe(true)
    expect(element.getAttribute("role")).toBe("group")
    expect(element.getAttribute("aria-label")).toBe("Schedule")
    expect(element.table).toBeInstanceOf(HTMLTableElement)
    expect(element.querySelectorAll("table")).toHaveLength(1)
    expect(element.querySelectorAll("[data-calendar-day][tabindex='0']")).toHaveLength(1)
    expect([...new FormData(document.querySelector("form")!)]).toEqual([])
    expect(document.querySelector("m-button button")!.getAttribute("type")).toBe("submit")
    element.next()
    expect(element.querySelector("m-span")).toBe(note)
    note.dispatchEvent(new Event("note-test"))
    expect(listener).toHaveBeenCalledOnce()
  })

  it("creates Web chrome without HTML parsing sinks", () => {
    const inner = vi.spyOn(Element.prototype, "innerHTML", "set").mockImplementation(() => { throw new Error("HTML sink") })
    const adjacent = vi.spyOn(Element.prototype, "insertAdjacentHTML").mockImplementation(() => { throw new Error("HTML sink") })
    const { element } = calendar()
    element.next(); element.mode = "year"; element.prev()
    expect(inner).not.toHaveBeenCalled(); expect(adjacent).not.toHaveBeenCalled()
  })

  it("updates once per property/attribute transaction and preserves controls, cells and focus", () => {
    const getDayContent = vi.fn(() => ""), { element, day } = calendar({ getDayContent })
    const table = element.table, button = day("2024-02-15"), next = element.querySelector("[data-calendar-action='next-month']")
    const change = vi.fn()
    element.addEventListener("m:change", change)
    button.focus()
    getDayContent.mockClear()
    element.value = "2024-02-16"
    expect(getDayContent).toHaveBeenCalledTimes(42)
    expect(element.value).toBe(element.getAttribute("value"))
    expect(element.table).toBe(table); expect(day("2024-02-15")).toBe(button)
    expect(document.activeElement).toBe(button)
    getDayContent.mockClear()
    element.setAttribute("value", "2024-02-17")
    expect(getDayContent).toHaveBeenCalledTimes(42)
    expect(change).not.toHaveBeenCalled()
    expect(element.querySelector("[data-calendar-action='next-month']")).toBe(next)
  })

  it.each([
    { value: "2023-02-29" }, { panel: "2024-13" }, { min: "2025-01-01", max: "2024-12-31" },
    { firstDayOfWeek: 7 }, { mode: "decade" }, { locale: "invalid_locale" }, { disabled: "false" },
    { getDayContent: () => "a".repeat(513) }, { isDateDisabled: () => undefined },
  ])("rejects invalid public writes without changing attributes, state or DOM", input => {
    const { element } = calendar(), state = element.state, html = element.outerHTML
    expect(() => element.configure(input as CalendarOptions)).toThrow()
    expect(element.state).toEqual(state); expect(element.outerHTML).toBe(html)
  })

  it("rolls back invalid direct attributes and keeps the previous rendered state", () => {
    const { element } = calendar(), before = element.outerHTML
    const errors = (event: ErrorEvent) => event.preventDefault()
    window.addEventListener("error", errors)
    try { element.setAttribute("value", "2024-02-30") } finally { window.removeEventListener("error", errors) }
    expect(element.outerHTML).toBe(before)
  })

  it("retains selection across policy changes, safely renders literal notes, and reports user callback failures", () => {
    let fail = false
    const { element, day } = calendar({
      isDateDisabled: value => { if (fail) throw new Error("Policy failed"); return value.endsWith("-16") },
      getDayContent: () => "<img src=x>",
    })
    expect(day("2024-02-16").getAttribute("aria-disabled")).toBe("true")
    expect(element.select("2024-02-16")).toBe(false)
    element.value = "2024-02-16"
    expect(element.state.selectionAvailable).toBe(false)
    expect(element.querySelector("img")).toBeNull()
    const error = vi.fn(); element.addEventListener("m:calendar-error", error)
    fail = true
    element.querySelector<HTMLButtonElement>("[data-calendar-action='next-month']")!.click()
    expect(error).toHaveBeenCalledOnce()
    expect(element.error).toBeInstanceOf(Error)
    expect(element.panel).toBe("2024-02")
  })

  it("has one event path and exposes committed properties before panel/value notifications", () => {
    const { element } = calendar(), events: string[] = [], old = vi.fn()
    element.addEventListener("m:calendar-change", old)
    element.addEventListener("m:calendar-panel-change", () => {
      expect(element.panel).toBe("2024-03"); expect(element.value).toBe("2024-03-01")
      expect(element.getAttribute("value")).toBe(element.value); events.push("panel")
    })
    element.addEventListener("m:change", () => events.push("value"))
    expect(element.select("2024-03-01")).toBe(true)
    expect(events).toEqual(["panel", "value"])
    element.select("2024-03-01")
    expect(events).toHaveLength(2); expect(old).not.toHaveBeenCalled()
  })

  it("suppresses stale notifications when a panel listener changes the public value", () => {
    const { element } = calendar(), change = vi.fn()
    element.addEventListener("m:change", change)
    element.addEventListener("m:calendar-panel-change", () => { element.value = "2024-04-10" }, { once: true })
    element.select("2024-03-01")
    expect(element.value).toBe("2024-04-10"); expect(change).not.toHaveBeenCalled()
  })

  it("keeps defaults, current value and panel independent across reset and reconnect", () => {
    const { element } = calendar({ defaultValue: "2024-01-31" }), table = element.table
    const controls = element.querySelector("[data-calendar-controls]")
    element.select("2024-02-20"); element.next()
    element.remove()
    expect(element.connected).toBe(false); expect(controls!.hasAttribute("hidden")).toBe(true)
    document.body.append(element)
    expect(element.connected).toBe(true); expect(element.value).toBe("2024-02-20"); expect(element.panel).toBe("2024-03")
    expect(element.table).toBe(table); expect(element.querySelectorAll("[data-calendar-controls]")).toHaveLength(1)
    element.reset(); expect(element.value).toBe("2024-01-31")
  })

  it("applies pre-upgrade own properties and initial default without duplicate chrome", () => {
    const element = new Calendar()
    Object.defineProperty(element, "defaultValue", { configurable: true, value: "0099-03-01" })
    Object.defineProperty(element, "todayValue", { configurable: true, value: null })
    document.body.append(element)
    expect(Object.hasOwn(element, "defaultValue")).toBe(false)
    expect(element.value).toBe("0099-03-01"); expect(element.panel).toBe("0099-03")
    expect(element.querySelector("[aria-current]")).toBeNull()
    expect(element.today()).toBe(false)
  })

  it.each([
    'panel="2024-03" value="2024-02-15" mode="year"',
    'mode="year" value="2024-02-15" panel="2024-03"',
  ])("retains explicit panel regardless of initial attribute order: %s", attributes => {
    document.body.innerHTML = `<m-calendar ${attributes}></m-calendar>`
    const element = document.querySelector<Calendar>("m-calendar")!
    expect(element.mode).toBe("year"); expect(element.panel).toBe("2024-03"); expect(element.value).toBe("2024-02-15")
    expect(element.querySelectorAll("[data-calendar-day]")).toHaveLength(12)
  })

  it("supports year roving focus, RTL, month selection precision and switching back to days", () => {
    const { element, day, key } = calendar({ mode: "year", value: "2024-05" }), change = vi.fn()
    element.addEventListener("m:change", change)
    key("2024-05", "ArrowDown")
    expect(element.state.focusedDate).toBe("2024-08")
    key("2024-08", "PageDown")
    expect(element.state.focusedDate).toBe("2025-08")
    element.table!.style.direction = "rtl"
    key("2025-08", "ArrowLeft")
    expect(document.activeElement).toBe(day("2025-09"))
    key("2025-09", "Home"); expect(element.state.focusedDate).toBe("2025-07")
    key("2025-07", "End"); expect(element.state.focusedDate).toBe("2025-09")
    expect(change).not.toHaveBeenCalled()
    day("2025-09").click()
    expect(element.value).toBe("2025-09")
    expect(change.mock.calls[0]![0].detail).toMatchObject({ value: "2025-09", date: null })
    element.mode = "month"
    expect(element.value).toBe("2025-09")
    expect(element.querySelectorAll("[data-calendar-day]")).toHaveLength(42)
    expect(element.querySelector("[data-calendar-weekdays]")!.hasAttribute("hidden")).toBe(false)
    expect(() => element.select("2025-09")).toThrow()
    expect(element.select("2025-09-15")).toBe(true)
    element.mode = "year"
    expect(element.value).toBe("2025-09-15"); expect(day("2025-09").getAttribute("aria-pressed")).toBe("true")
  })

  it("bounds year selection by overlapping months without an unbounded day-policy search", () => {
    const policy = vi.fn(() => true), note = vi.fn(() => "note")
    const { element, day } = calendar({ mode: "year", value: "2024-02", min: "2024-02-15", max: "2024-05-10", isDateDisabled: policy, getDayContent: note })
    expect(day("2024-01").getAttribute("aria-disabled")).toBe("true")
    expect(element.select("2024-01")).toBe(false); expect(element.select("2024-05")).toBe(true)
    expect(policy).not.toHaveBeenCalled(); expect(note).not.toHaveBeenCalled()
    element.next(); expect(element.panel).toBe("2024-05")
    element.configure({ value: "0001-01", min: "0001-01-01", max: "9999-12-31" })
    element.prev(); expect(element.panel).toBe("0001-01")
    element.value = "9999-12"; element.next(); expect(element.panel).toBe("9999-12")
  })

  it("preserves native fieldset disabling and does not steal external focus", () => {
    const { element, day } = calendar(), fieldset = document.createElement("fieldset"), outside = document.createElement("button")
    document.body.append(fieldset, outside); fieldset.append(element)
    outside.focus()
    element.value = "2024-02-20"; expect(document.activeElement).toBe(outside)
    fieldset.disabled = true
    expect(day("2024-02-20").matches(":disabled")).toBe(true)
    expect(element.select("2024-02-21")).toBe(false)
    fieldset.disabled = false; element.disabled = true
    expect(element.select("2024-02-21")).toBe(false)
    element.disabled = false; expect(element.select("2024-02-21")).toBe(true)
    element.focus(); expect(document.activeElement).toBe(day(element.state.focusedDate))
  })

  it("adopts native Web anatomy with the same owner and restores original fallback/listeners", () => {
    const { root, form, original } = fixture({}, false), element = new Calendar()
    element.panel = "2024-02"
    element.setAttribute("aria-labelledby", "calendar-heading")
    const listener = vi.fn(); original[0]!.addEventListener("fallback-test", listener)
    element.append(...root.childNodes); root.remove(); form.prepend(element)
    expect(element.select("2024-02-15")).toBe(true)
    const controls = element.querySelector("[data-calendar-controls]")
    element.remove()
    expect([...element.querySelector("tbody")!.childNodes]).toEqual(original)
    original[0]!.dispatchEvent(new Event("fallback-test")); expect(listener).toHaveBeenCalledOnce()
    form.append(element)
    expect(element.value).toBe("2024-02-15"); expect(element.querySelector("[data-calendar-controls]")).toBe(controls)
    expect(() => createCalendar(element)).toThrow(/unowned/)
  })

  it("keeps nested calendars isolated", () => {
    const outer = new Calendar(), inner = new Calendar()
    outer.value = "2024-02-15"; inner.value = "2025-03-15"
    outer.append(inner); document.body.append(outer)
    expect(outer.connected).toBe(true); expect(inner.connected).toBe(true)
    inner.next()
    expect(inner.panel).toBe("2025-04"); expect(outer.panel).toBe("2024-02")
    expect(outer.table).not.toBe(inner.table)
  })

  it("preserves adopted action disabled/hidden flags across modes and reconnect", () => {
    const { root, form, action } = fixture({}, false)
    const previous = action("prev-month"), clear = action("clear")
    previous.disabled = true; clear.hidden = true
    const element = new Calendar()
    element.value = "2024-02-15"
    element.append(...root.childNodes); root.remove(); form.append(element)
    expect(previous.disabled).toBe(true); expect(clear.hidden).toBe(true)
    element.mode = "year"; element.mode = "month"
    expect(previous.disabled).toBe(true); expect(clear.hidden).toBe(true)
    element.remove(); form.append(element)
    expect(previous.disabled).toBe(true); expect(clear.hidden).toBe(true)
  })

  it("rejects initialization reentry without acquiring an owner and can retry", () => {
    const element = new Calendar(), errors: unknown[] = []
    element.getDayContent = () => { element.value = "2024-02-10"; return "" }
    const handler = (event: ErrorEvent) => { errors.push(event.error); event.preventDefault() }
    window.addEventListener("error", handler)
    try { document.body.append(element) } finally { window.removeEventListener("error", handler) }
    expect(errors).toHaveLength(1); expect(String(errors[0])).toContain("reenter")
    expect(element.connected).toBe(false)
    element.getDayContent = null
    element.remove(); document.body.append(element)
    expect(element.connected).toBe(true)
    expect(element.querySelectorAll("[data-calendar-controls]")).toHaveLength(1)
  })
})
