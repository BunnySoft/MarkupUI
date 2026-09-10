import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createTime, formatTime } from "../src/components/time/index.js"
import type { TimeBindingOptions, TimeController, TimeFormatOptions, TimeInput } from "../src/components/time/index.js"
import { minTime, maxTime } from "../src/components/time/format.js"

const helpers: TimeController[] = []
let hidden = false
function fixture(options: TimeBindingOptions = { time: 0 }, bind = true, rich = false) {
  const host = document.createElement("div")
  host.innerHTML = `<time class="mui-time" data-time datetime="1970-01-01T00:00:00.000Z">${rich ? '<strong>Updated: </strong><span data-time-text>Authored epoch</span>' : "Authored epoch"}</time><input name="other" value="kept" aria-label="Outside">`
  document.body.append(host)
  const element = host.querySelector("time")!, target = element.querySelector<HTMLElement>("[data-time-text]") ?? element
  const text = target.firstChild as Text
  const helper = bind ? createTime(element, options) : null
  if (helper) helpers.push(helper)
  return { helper: helper!, element, target, text, host, outside: host.querySelector("input")! }
}
function selection(text: Text) {
  const range = document.createRange(); range.setStart(text, 0); range.setEnd(text, Math.min(4, text.length))
  document.getSelection()!.removeAllRanges(); document.getSelection()!.addRange(range)
  document.dispatchEvent(new Event("selectionchange"))
}
function clearSelection() { document.getSelection()!.removeAllRanges(); document.dispatchEvent(new Event("selectionchange")) }
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(0); hidden = false
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden)
})
afterEach(() => {
  helpers.splice(0).forEach(helper => helper.disconnect()); clearSelection(); document.body.replaceChildren()
  vi.restoreAllMocks(); vi.useRealTimers()
})

describe("Time explicit instant and native formatting contract", () => {
  it("accepts epoch zero, negative milliseconds and integer Unix seconds without truthiness defaults", () => {
    expect(formatTime(0).datetime).toBe("1970-01-01T00:00:00.000Z")
    expect(formatTime(-1).datetime).toBe("1969-12-31T23:59:59.999Z")
    expect(formatTime(-1, { unit: "seconds" }).time).toBe(-1000)
    expect(formatTime(1704067200, { unit: "seconds" }).datetime).toBe("2024-01-01T00:00:00.000Z")
  })
  it("never multiplies a Date by Unix units or calls an overridden valueOf", () => {
    const date = new Date(1000); date.valueOf = () => 999999999999999
    expect(formatTime(date, { unit: "seconds" }).time).toBe(1000)
    expect(formatTime(date, { type: "relative", unit: "seconds", to: 0 }).relative?.amount).toBe(1)
  })
  it("handles UTC year 1/99/9999 without remapping to 1900 or accepting year zero", () => {
    expect(formatTime(minTime).datetime).toBe("0001-01-01T00:00:00.000Z")
    expect(formatTime(maxTime).datetime).toBe("9999-12-31T23:59:59.999Z")
    const value = new Date(0); value.setUTCFullYear(99, 0, 1)
    expect(formatTime(value).datetime.startsWith("0099-01-01")).toBe(true)
    expect(() => formatTime(minTime - 1)).toThrow(); expect(() => formatTime(maxTime + 1)).toThrow()
    expect(() => formatTime(minTime, { timeZone: "America/New_York" })).toThrow(/outside/)
    expect(() => formatTime(maxTime, { timeZone: "Asia/Tokyo" })).toThrow(/outside/)
  })
  it.each([NaN, Infinity, -Infinity, .5, "2024-02-29", "2024-02-29T12:30", "2024-02-29T12:30:00Z", null, {}, new Date(NaN)])("rejects non-instant, invalid or fractional input %s", value => {
    expect(() => formatTime(value as TimeInput)).toThrow()
  })
  it("exposes date/time/datetime as display subsets, with the same exact machine instant", () => {
    const values = ["date", "time", "datetime"].map(type => formatTime(0, { type: type as "date" | "time" | "datetime" }))
    expect(values.every(value => value.datetime === "1970-01-01T00:00:00.000Z")).toBe(true)
    expect(values[0]!.text).toContain("1970")
    expect(values[1]!.text).toContain("00:00:00"); expect(values[1]!.text).toContain("UTC")
    expect(values[2]!.text).toContain("1970"); expect(values[2]!.text).toContain("00:00:00")
  })
  it("formats explicit DST gap/fold instants without changing the represented instant", () => {
    const gap = formatTime(1710055800000, { timeZone: "America/New_York" })
    expect(gap.datetime).toBe("2024-03-10T07:30:00.000Z"); expect(gap.text).toContain("03:30:00"); expect(gap.text).toContain("EDT")
    const first = formatTime(1730611800000, { timeZone: "America/New_York" }), second = formatTime(1730615400000, { timeZone: "America/New_York" })
    expect(first.text).toContain("01:30:00"); expect(second.text).toContain("01:30:00")
    expect(first.text).toContain("EDT"); expect(second.text).toContain("EST")
    expect(first.datetime).not.toBe(second.datetime)
  })
  it("forces Gregorian names even when the locale requests a Buddhist calendar", () => {
    const value = formatTime(1704067200000, { locale: "th-TH-u-ca-buddhist", type: "date" })
    expect(value.text).toContain("2024"); expect(value.text).not.toContain("2567")
  })
  it("accepts native Intl options instead of parsing formatter tokens", () => {
    const result = formatTime(0, { dateTime: { dateStyle: "full", timeStyle: "long" } })
    expect(result.text).toContain("1970")
    expect(() => formatTime(0, { format: "yyyy-MM-dd" } as TimeFormatOptions)).toThrow()
    expect(() => formatTime(0, { dateTime: { dateStyle: "full", year: "numeric" } })).toThrow()
    expect(formatTime(0, { dateTime: { year: undefined } }).text).toBe(formatTime(0).text)
  })
  it.each([{ unit: "guess" }, { unit: null }, { type: null }, { locale: null }, { timeZone: null }, { type: "calendar" }, { locale: "bad_locale" }, { locale: "zz-ZZ" },
    { timeZone: "Not/AZone" }, { timeZone: "" }, { dateTime: { hour12: "false" } },
    { dateTime: { fractionalSecondDigits: 4 } }, { dateTime: { calendar: "buddhist" } }, { dateTime: null },
    { dateTime: [] }, { type: "date", dateTime: { hour: "numeric" } }, { type: "time", dateTime: { year: "numeric" } }])("rejects invalid option grammar before formatting", options => {
    expect(() => formatTime(0, options as TimeFormatOptions)).toThrow()
  })
})

describe("Time native relative quantities and boundaries", () => {
  it("requires an explicit reference for the pure relative formatter", () => {
    expect(() => formatTime(0, { type: "relative" })).toThrow(/explicit to/)
    expect(formatTime(1000, { type: "relative", to: 0 }).text).toBe("in 1 second")
    expect(formatTime(0, { type: "relative", to: 1000 }).text).toBe("1 second ago")
  })
  it("rounds signed halves away from zero, preserving negative zero for native past labels", () => {
    expect(formatTime(1500, { type: "relative", to: 0 }).relative?.amount).toBe(2)
    expect(formatTime(0, { type: "relative", to: 1500 }).relative?.amount).toBe(-2)
    expect(Object.is(formatTime(0, { type: "relative", to: 1 }).relative?.amount, -0)).toBe(true)
    expect(formatTime(0, { type: "relative", to: 1 }).text).toBe("0 seconds ago")
    expect(formatTime(0, { type: "relative", to: 0, numeric: "auto" }).text).toBe("now")
  })
  it.each([[59999, "second"], [60000, "minute"], [3600000, "hour"], [86400000, "day"],
    [604800000, "week"], [2592000000, "month"], [31536000000, "year"]])("uses documented auto threshold %i", (time, unit) => {
    expect(formatTime(time as number, { type: "relative", to: 0 }).relative?.unit).toBe(unit)
  })
  it("uses fixed elapsed day/month/year approximations, independent of timezone calendar boundaries", () => {
    const options: TimeFormatOptions = { type: "relative", to: 0, relativeUnit: "day", timeZone: "America/New_York" }
    expect(formatTime(23 * 3600000, options).relative?.amount).toBe(1)
    expect(formatTime(45 * 86400000, { ...options, relativeUnit: "month" }).relative?.amount).toBe(2)
    expect(formatTime(365 * 86400000, { ...options, relativeUnit: "year" }).relative?.amount).toBe(1)
    expect(formatTime(23 * 3600000, options).text).toBe(formatTime(23 * 3600000, { ...options, timeZone: "Asia/Tokyo" }).text)
  })
  it("computes both rounding and automatic unit change boundaries without polling", () => {
    expect(formatTime(60000, { type: "relative", to: 0 }).relative?.nextChangeMs).toBe(1)
    expect(formatTime(0, { type: "relative", to: 59999 }).relative?.nextChangeMs).toBe(1)
    expect(formatTime(0, { type: "relative", to: 100000 }).relative?.nextChangeMs).toBe(50000)
  })
})

describe("Time bound native ownership and static reference", () => {
  it("updates only the existing Text node and datetime, never author markup/ARIA/focus/forms", () => {
    const { helper, element, target, text, outside } = fixture({ time: 0 }, true, true)
    const strong = element.querySelector("strong")!, click = vi.fn()
    strong.addEventListener("click", click); element.setAttribute("aria-label", "Authored publication time"); outside.focus()
    helper.set({ time: 1000, timeZone: "America/New_York" })
    expect(target.firstChild).toBe(text); expect(element.querySelector("strong")).toBe(strong)
    strong.dispatchEvent(new Event("click")); expect(click).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(outside); expect(outside.value).toBe("kept")
    expect(element.getAttribute("aria-label")).toBe("Authored publication time")
    expect(element.hasAttribute("role")).toBe(false); expect(element.hasAttribute("aria-live")).toBe(false)
    expect(Date.parse(element.dateTime)).toBe(1000)
  })
  it("snapshots supplied Date objects instead of tracking later external mutation", () => {
    const input = new Date(0), { helper } = fixture({ time: input })
    input.setTime(10000); helper.refresh(); expect(helper.state.time).toBe(0)
    helper.set({ time: input }); expect(helper.state.time).toBe(10000)
  })
  it("never reads the clock for static absolute formatting and never creates a tick timer", () => {
    const clock = vi.fn(() => { throw new Error("unneeded clock") }), { helper } = fixture({ time: 0, clock })
    helper.refresh(); helper.set({ locale: "fr" }); vi.advanceTimersByTime(100000)
    expect(clock).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0)
  })
  it("captures missing relative to once; static refresh does not turn it into a live clock", () => {
    let now = 100000
    const clock = vi.fn(() => now), { helper, text } = fixture({ time: 0, type: "relative", clock })
    const old = text.data; now = 200000; helper.refresh()
    expect(text.data).toBe(old); expect(helper.state.rendered?.to).toBe(100000); expect(clock).toHaveBeenCalledOnce()
    helper.set({ to: undefined }); expect(helper.state.rendered?.to).toBe(200000)
    expect(vi.getTimerCount()).toBe(0)
  })
  it("validates new settings before replacing a good view or cancelling a healthy timer", () => {
    const { helper, text, element } = fixture({ time: 0, type: "relative", live: true })
    const before = text.data, datetime = element.dateTime, count = vi.getTimerCount()
    expect(() => helper.set({ dateTime: null as never })).toThrow()
    expect(() => helper.set({ time: "2024-03-01" as never })).toThrow()
    expect(() => helper.set({ to: 1000 })).toThrow(/Live/)
    expect(text.data).toBe(before); expect(element.dateTime).toBe(datetime); expect(vi.getTimerCount()).toBe(count)
  })
  it("defers paired machine/text updates while the user selects its text", () => {
    const { helper, text, element } = fixture()
    const before = text.data, datetime = element.dateTime; selection(text)
    helper.set({ time: 5000 })
    expect(helper.state.time).toBe(5000); expect(helper.state.pending).toBe(true)
    expect(text.data).toBe(before); expect(element.dateTime).toBe(datetime)
    clearSelection()
    expect(helper.state.rendered?.time).toBe(5000); expect(element.dateTime).toBe("1970-01-01T00:00:05.000Z")
    expect(helper.text).toBe(text)
  })
  it("does not rewrite equal text/attributes on redundant refresh", async () => {
    const { helper, element } = fixture(), changes: MutationRecord[] = []
    const observer = new MutationObserver(records => changes.push(...records))
    observer.observe(element, { attributes: true, characterData: true, subtree: true })
    helper.refresh(); helper.set({ time: 0 }); await Promise.resolve()
    expect(changes).toEqual([]); observer.disconnect()
  })
  it("restores the exact authored pair only while it still owns both values", () => {
    const { helper, element, text } = fixture({ time: 5000 })
    helper.disconnect()
    expect(text.data).toBe("Authored epoch"); expect(element.dateTime).toBe("1970-01-01T00:00:00.000Z")
    const second = fixture({ time: 10000 }); second.text.data = "Author replacement"
    second.helper.disconnect()
    expect(second.text.data).toBe("Author replacement"); expect(second.element.dateTime).toBe("1970-01-01T00:00:10.000Z")
  })
  it("leaves a meaningful last pair on disposal rather than destroying an active selection", () => {
    const { helper, element, text } = fixture({ time: 5000 })
    selection(text); const value = text.data, selected = document.getSelection()!.toString()
    helper.disconnect()
    expect(text.data).toBe(value); expect(document.getSelection()!.toString()).toBe(selected)
    vi.advanceTimersByTime(0) // Deliver jsdom's own queued selectionchange, not an owned tick.
    expect(element.dateTime).toBe("1970-01-01T00:00:05.000Z"); expect(vi.getTimerCount()).toBe(0)
  })
})

describe("Time meaningful live refresh and cleanup", () => {
  it("uses a single >=1s boundary timer and no catch-up loop", () => {
    const { helper, text } = fixture({ time: 0, type: "relative", live: true })
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(999); expect(text.data).toBe("in 0 seconds")
    vi.advanceTimersByTime(1); expect(text.data).toBe("1 second ago")
    expect(vi.getTimerCount()).toBe(1); helper.disconnect(); expect(vi.getTimerCount()).toBe(0)
  })
  it("schedules minute/year boundaries rather than a per-second interval", () => {
    vi.setSystemTime(100000)
    const clock = vi.fn(() => Date.now()), { helper, text } = fixture({ time: 0, type: "relative", live: true, clock })
    expect(text.data).toBe("2 minutes ago"); expect(clock).toHaveBeenCalledOnce()
    vi.advanceTimersByTime(49999); expect(clock).toHaveBeenCalledOnce()
    vi.advanceTimersByTime(1); expect(text.data).toBe("3 minutes ago")
    helper.set({ relativeUnit: "year" })
    vi.advanceTimersByTime(1000000); expect(vi.getTimerCount()).toBe(1)
  })
  it("pauses for document invisibility and catches up once on return", () => {
    const { helper, text } = fixture({ time: 0, type: "relative", live: true }), change = vi.fn()
    helper.element.addEventListener("mui:time-change", change)
    hidden = true; document.dispatchEvent(new Event("visibilitychange"))
    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(120000); expect(text.data).toBe("in 0 seconds")
    hidden = false; document.dispatchEvent(new Event("visibilitychange"))
    expect(text.data).toBe("2 minutes ago"); expect(change).toHaveBeenCalledOnce()
  })
  it("pauses for selection and focus without stealing focus or erasing selection", () => {
    const { helper, element, text, outside } = fixture({ time: 0, type: "relative", live: true })
    selection(text); const selectedText = document.getSelection()!.toString()
    vi.advanceTimersByTime(10000); expect(document.getSelection()!.toString()).toBe(selectedText)
    expect(text.data).toBe("in 0 seconds"); expect(vi.getTimerCount()).toBe(0)
    clearSelection(); expect(text.data).toBe("10 seconds ago")
    element.tabIndex = 0; element.focus(); vi.advanceTimersByTime(5000)
    expect(document.activeElement).toBe(element); expect(text.data).toBe("10 seconds ago")
    outside.focus(); expect(text.data).toBe("15 seconds ago")
  })
  it("pauses for CSS/closed-details hiding and catches up with one render", async () => {
    const { helper, element, host, text } = fixture({ time: 0, type: "relative", live: true })
    const details = document.createElement("details"); details.innerHTML = "<summary>Time</summary>"; host.prepend(details); details.append(element)
    await Promise.resolve(); expect(helper.state.pauseReasons).toContain("hidden-element"); expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(5000); details.open = true; details.dispatchEvent(new Event("toggle"))
    expect(text.data).toBe("5 seconds ago")
  })
  it("rejects live regions initially and pauses if an author adds one later", async () => {
    const setup = fixture({ time: 0 }, false); setup.host.setAttribute("aria-live", "polite")
    expect(() => createTime(setup.element, { time: 0, type: "relative", live: true })).toThrow(/live region/)
    const live = fixture({ time: 0, type: "relative", live: true })
    live.host.setAttribute("role", "status"); await Promise.resolve()
    expect(live.helper.state.pauseReasons).toContain("live-region"); expect(vi.getTimerCount()).toBe(0)
  })
  it("freezes a current reference when live is disabled and cancels stale timers", () => {
    const { helper, text } = fixture({ time: 0, type: "relative", live: true })
    vi.advanceTimersByTime(5000); helper.set({ live: false })
    expect(helper.state.rendered?.to).toBe(5000); expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(20000); helper.refresh(); expect(text.data).toBe("5 seconds ago")
  })
  it("keeps the previous pair on automatic clock failure and stops retry polling", () => {
    let broken = false
    const clock = vi.fn(() => broken ? NaN : Date.now()), { helper, text, element } = fixture({ time: 0, type: "relative", live: true, clock }), error = vi.fn()
    element.addEventListener("mui:time-error", error); const before = text.data
    broken = true; vi.advanceTimersByTime(1000)
    expect(error).toHaveBeenCalledOnce(); expect(text.data).toBe(before); expect(helper.state.error).toBeInstanceOf(Error)
    expect(vi.getTimerCount()).toBe(0)
    const count = clock.mock.calls.length; vi.advanceTimersByTime(100000); expect(clock.mock.calls.length).toBe(count)
    broken = false; helper.refresh(); expect(helper.state.error).toBeNull(); expect(vi.getTimerCount()).toBe(1)
  })
  it("guards reentrant clocks while allowing disconnect and reentrant change handlers", () => {
    let action: () => void = () => {}
    const { helper, element } = fixture({ time: 0, type: "relative", live: true, clock: () => { action(); return Date.now() } })
    action = () => helper.set({ time: 1000 })
    expect(() => helper.refresh()).toThrow(/reenter/)
    action = () => {}; element.addEventListener("mui:time-change", () => helper.set({ time: 10000, type: "datetime", live: false }), { once: true })
    vi.advanceTimersByTime(1000); expect(helper.state.time).toBe(10000); expect(vi.getTimerCount()).toBe(0)
    helper.set({ type: "relative", live: true }); action = () => helper.disconnect()
    helper.refresh(); expect(helper.connected).toBe(false); expect(vi.getTimerCount()).toBe(0)
  })
  it("requires a synchronous millisecond clock, not a Date or promise", async () => {
    const setup = fixture({ time: 0 }, false)
    expect(() => createTime(setup.element, { time: 0, type: "relative", clock: (() => new Date()) as never })).toThrow(/synchronously/)
    expect(() => createTime(setup.element, { time: 0, type: "relative", clock: (() => Promise.reject(new Error("bad"))) as never })).toThrow(/synchronously/)
    await Promise.resolve()
  })
  it("cleans removal/replaced text ownership and supports explicit rebinding", async () => {
    const { helper, host, element } = fixture({ time: 0, type: "relative", live: true })
    element.remove(); await Promise.resolve()
    expect(helper.connected).toBe(false); expect(vi.getTimerCount()).toBe(0)
    host.prepend(element); const next = createTime(element, { time: 1000 }); helpers.push(next)
    element.textContent = "Author replacement"; await Promise.resolve()
    expect(next.connected).toBe(false); expect(element.textContent).toBe("Author replacement")
  })
  it("refuses duplicate owners, missing instants and ambiguous text anatomy", () => {
    const { element } = fixture()
    expect(() => createTime(element, { time: 0 })).toThrow(/unowned/)
    const plain = fixture({ time: 0 }, false)
    expect(() => createTime(plain.element, {} as TimeBindingOptions)).toThrow(/explicit time/)
    plain.element.innerHTML = "<em>Do not destroy markup</em>"
    expect(() => createTime(plain.element, { time: 0 })).toThrow(/Text node/)
  })
})
