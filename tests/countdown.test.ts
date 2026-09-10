import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createCountdown, formatCountdown } from "../src/components/countdown/index.js"
import type { CountdownController, CountdownOptions } from "../src/components/countdown/index.js"
import { maximumDuration } from "../src/components/countdown/format.js"

const helpers: CountdownController[] = []
let hidden = false
function fixture(options: CountdownOptions = { duration: 5000 }, units = false, bind = true) {
  const host = document.createElement("div")
  host.innerHTML = `<time class="mui-countdown" data-countdown datetime="PT5S" tabindex="0">${units
    ? '<strong>Remaining: </strong><span data-countdown-units><span data-countdown-hours>00</span><abbr>h</abbr><span data-countdown-minutes>00</span><abbr>m</abbr><span data-countdown-seconds>05</span><abbr>s</abbr><span data-countdown-fraction>.000</span></span>'
    : '<strong>Remaining: </strong><span data-countdown-text>00:00:05</span>'}</time><button type="button" data-action>Native action</button><input name="outside" value="kept" aria-label="Outside">`
  document.body.append(host)
  const element = host.querySelector<HTMLTimeElement>("time")!, target = element.querySelector<HTMLElement>("[data-countdown-text],[data-countdown-seconds]")!
  const helper = bind ? createCountdown(element, options) : null
  if (helper) helpers.push(helper)
  return { host, element, target, text: target.firstChild as Text, helper: helper!, outside: host.querySelector("input")! }
}
function select(text: Text) {
  const range = document.createRange(); range.selectNodeContents(text)
  document.getSelection()!.removeAllRanges(); document.getSelection()!.addRange(range)
  document.dispatchEvent(new Event("selectionchange"))
}
function clearSelection() { document.getSelection()!.removeAllRanges(); document.dispatchEvent(new Event("selectionchange")) }
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(0); hidden = false
  vi.spyOn(window.performance, "now").mockImplementation(() => Date.now())
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden)
})
afterEach(() => {
  helpers.splice(0).forEach(helper => helper.disconnect()); clearSelection(); document.body.replaceChildren()
  vi.restoreAllMocks(); vi.useRealTimers()
})

describe("Countdown bounded duration formatting", () => {
  it.each([[0, 0, "00:00:00"], [1, 0, "00:00:01"], [1000, 0, "00:00:01"],
    [1001, 0, "00:00:02"], [1500, 1, "00:00:01.5"], [1234, 2, "00:00:01.24"],
    [.2, 3, "00:00:00.001"], [3600001, 0, "01:00:01"], [maximumDuration, 0, "8760:00:00"]])("formats %i ms at precision %i", (value, precision, text) => {
    const result = formatCountdown(value as number, precision as 0 | 1 | 2 | 3)
    expect(result.text).toBe(text); expect(result.displayed).toBeGreaterThanOrEqual(value as number)
    expect(result.datetime).toBe(`PT${result.displayed / 1000}S`)
  })
  it("exposes rounded component units separately from actual remaining time", () => {
    const info = formatCountdown(3661234.2, 2)
    expect(info).toMatchObject({ hours: 1, minutes: 1, seconds: 1, milliseconds: 240, remaining: 3661234.2, displayed: 3661240 })
    expect(Object.isFrozen(info)).toBe(true)
  })
  it.each([NaN, Infinity, -1, maximumDuration + 1, "5000", new Date(), null])("rejects invalid/non-duration %s", value => {
    expect(() => formatCountdown(value as number)).toThrow()
  })
  it.each([-1, 4, 1.5, "2", null])("rejects invalid precision %s", precision => {
    expect(() => formatCountdown(1000, precision as never)).toThrow()
  })
})

describe("Countdown elapsed timing and run semantics", () => {
  it("derives remaining from timestamps and finishes once, not from tick decrements", () => {
    let now = 0
    const finish = vi.fn(), { helper, text } = fixture({ duration: 10000, monotonicNow: () => now, onFinish: finish })
    expect(text.data).toBe("00:00:10")
    now = 8500; vi.advanceTimersByTime(1000)
    expect(helper.value).toBe(1500); expect(text.data).toBe("00:00:02")
    now = 15000; vi.advanceTimersByTime(1000)
    expect(helper.value).toBe(0); expect(finish).toHaveBeenCalledOnce()
    expect(helper.state.status).toBe("finished"); expect(text.data).toBe("00:00:00")
    vi.advanceTimersByTime(10000); helper.refresh(); expect(finish).toHaveBeenCalledOnce()
  })
  it("pauses/resumes elapsed time exactly rather than counting the pause gap", () => {
    const finish = vi.fn(), { helper } = fixture({ duration: 5000, onFinish: finish })
    vi.advanceTimersByTime(1234); helper.pause()
    expect(helper.value).toBe(3766); expect(helper.state.status).toBe("paused")
    vi.advanceTimersByTime(20000); expect(helper.value).toBe(3766); expect(vi.getTimerCount()).toBe(0)
    helper.start(); vi.advanceTimersByTime(3766)
    expect(helper.value).toBe(0); expect(finish).toHaveBeenCalledOnce()
  })
  it("uses duration as a future reset default and value as an explicit new run", () => {
    const { helper } = fixture({ duration: 5000, active: false })
    helper.set({ duration: 10000 }); expect(helper.value).toBe(5000); expect(helper.state.runId).toBe(1)
    helper.set({ value: 2500 }); expect(helper.value).toBe(2500); expect(helper.state.runId).toBe(2)
    helper.reset(); expect(helper.value).toBe(10000); expect(helper.state.runId).toBe(3)
    expect(helper.state.active).toBe(false)
  })
  it("handles active zero asynchronously once and inactive zero only after start", () => {
    const finish = vi.fn(), { helper } = fixture({ duration: 0, onFinish: finish })
    expect(helper.value).toBe(0); expect(finish).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100); expect(finish).toHaveBeenCalledOnce()
    helper.start(); helper.pause(); helper.start(); vi.advanceTimersByTime(1000)
    expect(finish).toHaveBeenCalledOnce()
    const second = fixture({ duration: 0, active: false, onFinish: finish })
    vi.advanceTimersByTime(1000); expect(finish).toHaveBeenCalledOnce()
    second.helper.start(); vi.advanceTimersByTime(100); expect(finish).toHaveBeenCalledTimes(2)
  })
  it("reset/value replacement cancels stale completion even if the old run has logically expired", () => {
    let now = 0
    const finish = vi.fn(), { helper } = fixture({ duration: 1000, monotonicNow: () => now, onFinish: finish })
    now = 2000; helper.reset(); expect(helper.state.runId).toBe(2); expect(finish).not.toHaveBeenCalled()
    now = 2500; vi.advanceTimersByTime(1000); expect(helper.value).toBe(500); expect(finish).not.toHaveBeenCalled()
    helper.set({ value: 5000 }); now = 7500; vi.advanceTimersByTime(1000)
    expect(finish).toHaveBeenCalledOnce(); expect(finish.mock.calls[0]![0].runId).toBe(3)
  })
  it("observes an already expired active run when pause is requested", () => {
    let now = 0
    const finish = vi.fn(), { helper } = fixture({ duration: 1000, monotonicNow: () => now, onFinish: finish })
    now = 1500; helper.pause()
    expect(helper.state.active).toBe(false); expect(helper.state.status).toBe("finished")
    expect(finish).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0)
  })
  it("does not treat a wall-clock change as elapsed time when the monotonic source is unchanged", () => {
    let monotonic = 10
    const { helper } = fixture({ duration: 10000, monotonicNow: () => monotonic })
    vi.setSystemTime(1000000000); expect(helper.value).toBe(10000)
    monotonic = 1010; expect(helper.value).toBe(9000)
  })
  it("never runs a 1ms busy loop even for high precision and sub-interval durations", () => {
    const clock = vi.fn(() => 0), { helper } = fixture({ duration: 1, precision: 3, refreshInterval: 50, monotonicNow: clock })
    vi.advanceTimersByTime(49); expect(clock).toHaveBeenCalledOnce()
    vi.advanceTimersByTime(151); expect(clock.mock.calls.length).toBe(5)
    expect(helper.state.status).toBe("running"); expect(vi.getTimerCount()).toBe(1)
  })
})

describe("Countdown rendering/visibility versus explicit pause", () => {
  it("continues elapsed time and finishes while document-hidden, without hidden paints", () => {
    const finish = vi.fn(), { helper, text, element } = fixture({ duration: 2000, onFinish: finish })
    const original = text.data, datetime = element.dateTime
    hidden = true; document.dispatchEvent(new Event("visibilitychange"))
    vi.advanceTimersByTime(2500)
    expect(helper.value).toBe(0); expect(helper.state.status).toBe("finished")
    expect(finish).toHaveBeenCalledOnce(); expect(text.data).toBe(original); expect(element.dateTime).toBe(datetime)
    expect(helper.state.pending).toBe(true)
    hidden = false; document.dispatchEvent(new Event("visibilitychange"))
    expect(text.data).toBe("00:00:00"); expect(element.dateTime).toBe("PT0S")
    expect(finish).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0)
  })
  it("preserves selected text/duration while elapsed time and completion continue", () => {
    const finish = vi.fn(), { helper, text, element } = fixture({ duration: 1000, onFinish: finish })
    select(text); const chosen = document.getSelection()!.toString()
    vi.advanceTimersByTime(1500)
    expect(helper.value).toBe(0); expect(finish).toHaveBeenCalledOnce()
    expect(document.getSelection()!.toString()).toBe(chosen); expect(text.data).toBe("00:00:01"); expect(element.dateTime).toBe("PT1S")
    clearSelection(); expect(text.data).toBe("00:00:00"); expect(element.dateTime).toBe("PT0S")
  })
  it("pauses painting for focused display but never moves native focus or edits fields", () => {
    const { helper, element, text, outside } = fixture({ duration: 2000 })
    element.focus(); vi.advanceTimersByTime(1000)
    expect(helper.value).toBe(1000); expect(text.data).toBe("00:00:02"); expect(document.activeElement).toBe(element)
    outside.focus(); expect(text.data).toBe("00:00:01"); expect(outside.value).toBe("kept")
  })
  it("does not freeze the clock for hidden/closed-details scopes", async () => {
    const { helper, host, element, text } = fixture({ duration: 2000 })
    const details = document.createElement("details"); details.innerHTML = "<summary>Timer</summary>"; host.prepend(details); details.append(element)
    await Promise.resolve(); vi.advanceTimersByTime(2500)
    expect(helper.value).toBe(0); expect(text.data).toBe("00:00:02")
    details.open = true; details.dispatchEvent(new Event("toggle"))
    expect(text.data).toBe("00:00:00")
  })
  it("does not introduce a live region or native form value and rejects announcing ancestors", () => {
    const { helper, element, host } = fixture({ duration: 2000, active: false })
    expect(element.hasAttribute("role")).toBe(false); expect(element.hasAttribute("aria-live")).toBe(false)
    helper.disconnect(); host.setAttribute("aria-live", "polite")
    expect(() => createCountdown(element, { duration: 1000 })).toThrow(/nonannouncing/)
  })
})

describe("Countdown authored text/units and atomic formatting", () => {
  it("supports explicit unit text targets and preserves all original markup/listeners", () => {
    const { helper, element } = fixture({ duration: 3661234, precision: 2, active: false }, true)
    const strong = element.querySelector("strong")!, listener = vi.fn(); strong.addEventListener("click", listener)
    expect(element.querySelector("[data-countdown-hours]")!.textContent).toBe("01")
    expect(element.querySelector("[data-countdown-minutes]")!.textContent).toBe("01")
    expect(element.querySelector("[data-countdown-seconds]")!.textContent).toBe("01")
    expect(element.querySelector("[data-countdown-fraction]")!.textContent).toBe(".24")
    helper.set({ precision: 0 }); expect(element.querySelector("[data-countdown-fraction]")!.textContent).toBe("")
    expect(element.querySelector("strong")).toBe(strong); strong.click(); expect(listener).toHaveBeenCalledOnce()
    expect(() => helper.set({ format: () => "not a unit renderer" })).toThrow()
  })
  it("formats literal text from frozen actual/displayed parts without HTML interpolation", () => {
    const { helper, text, element } = fixture({ duration: 1501, precision: 1, active: false,
      format: info => { expect(Object.isFrozen(info)).toBe(true); return `<b>${info.seconds}.${info.milliseconds} (${info.remaining})</b>` } })
    expect(text.data).toBe("<b>1.600 (1501)</b>"); expect(element.querySelector("b")).toBeNull()
    expect(helper.state.rendered?.displayed).toBe(1600)
  })
  it("rejects overlapping instant/duration ownership and semantic child-time targets", () => {
    const first = fixture({}, false, false); first.element.setAttribute("data-time", "")
    expect(() => createCountdown(first.element)).toThrow(/overlap/)
    const root = document.createElement("div"); root.setAttribute("data-countdown", "")
    root.innerHTML = '<time data-countdown-text datetime="PT5S">00:00:05</time>'; document.body.append(root)
    expect(() => createCountdown(root)).toThrow(/Text node/)
  })
  it.each([{ duration: -1 }, { value: NaN }, { duration: maximumDuration + 1 }, { active: "yes" },
    { refreshInterval: 1 }, { refreshInterval: 60001 }, { precision: 4 }, { deadline: new Date() },
    { monotonicNow: () => 0 }, { clock: () => 0 }, { format: () => "" }, { format: () => document.createElement("span") }])("rejects invalid settings %j before changing the current view/run", options => {
    const { helper, element, text } = fixture({ duration: 5000, active: false })
    const state = helper.state, displayed = text.data, datetime = element.dateTime
    expect(() => helper.set(options as CountdownOptions)).toThrow()
    expect(text.data).toBe(displayed); expect(element.dateTime).toBe(datetime)
    expect(helper.state.runId).toBe(state.runId); expect(helper.state.value).toBe(state.value)
  })
  it("does not rewrite unchanged native Text nodes or semantic attributes", async () => {
    const { helper, element, text } = fixture({ duration: 5000, active: false }), records: MutationRecord[] = []
    const observer = new MutationObserver(changes => records.push(...changes))
    observer.observe(element, { attributes: true, characterData: true, subtree: true })
    helper.refresh(); helper.set({ duration: 10000 }); await Promise.resolve()
    expect(records).toEqual([]); expect(helper.state.duration).toBe(10000); expect(text.data).toBe("00:00:05")
    observer.disconnect()
  })
  it("does not sample/reformat paused displays on unrelated focus/selection events", () => {
    const clock = vi.fn(() => 0), formatter = vi.fn(() => "Paused duration")
    const { outside, helper } = fixture({ duration: 5000, active: false, monotonicNow: clock, format: formatter })
    outside.focus(); document.dispatchEvent(new Event("selectionchange"))
    expect(clock).toHaveBeenCalledOnce(); expect(formatter).toHaveBeenCalledOnce()
    vi.advanceTimersByTime(0) // jsdom's native focus/selection event task is not an owned ticker.
    expect(helper.state.status).toBe("paused"); expect(vi.getTimerCount()).toBe(0)
  })
  it("does not let unrelated document events bypass the visible refresh bound", () => {
    const formatter = vi.fn(info => String(info.displayed))
    fixture({ duration: 2000, precision: 3, refreshInterval: 100, format: formatter })
    for (let i = 0; i < 30; ++i) {
      document.dispatchEvent(new Event("selectionchange")); vi.advanceTimersByTime(10)
    }
    expect(formatter).toHaveBeenCalledTimes(4)
  })
})

describe("Countdown failure, completion reentrancy and teardown", () => {
  it("does not finish when the final formatter fails; recovery completes once", () => {
    let fail = true
    const finish = vi.fn(), { helper, text } = fixture({ duration: 1000, format: info => {
      if (info.remaining === 0 && fail) throw new Error("format failed")
      return String(info.displayed)
    }, onFinish: finish })
    vi.advanceTimersByTime(1000)
    expect(helper.state.status).toBe("error"); expect(helper.state.errorPhase).toBe("format"); expect(helper.value).toBe(0)
    expect(finish).not.toHaveBeenCalled(); expect(text.data).toBe("1000"); expect(vi.getTimerCount()).toBe(0)
    fail = false; helper.refresh(); expect(helper.state.status).toBe("finished"); expect(finish).toHaveBeenCalledOnce()
  })
  it("reports finish-hook failure and never retries the same hook as a fake new completion", () => {
    const finish = vi.fn(() => { throw new Error("finish failed") }), { helper } = fixture({ duration: 1000, onFinish: finish })
    vi.advanceTimersByTime(1000)
    expect(helper.state.status).toBe("error"); expect(helper.state.errorPhase).toBe("finish")
    expect(helper.value).toBe(0); expect(vi.getTimerCount()).toBe(0)
    helper.refresh(); helper.start(); expect(finish).toHaveBeenCalledOnce()
  })
  it("supports reset from finish, with no stale timer or callback overwriting the new run", () => {
    let helper!: CountdownController
    const hook = vi.fn(() => { if (helper.state.runId === 1) helper.reset() })
    helper = fixture({ duration: 1000, onFinish: hook }).helper
    vi.advanceTimersByTime(1000)
    expect(helper.state.runId).toBe(2); expect(helper.value).toBe(1000); expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(1000); expect(hook).toHaveBeenCalledTimes(2); expect(vi.getTimerCount()).toBe(0)
  })
  it("bounds reentrant zero-duration resets rather than recursing or scheduling 1ms loops", () => {
    let helper!: CountdownController
    const hook = vi.fn(() => { if (helper.state.runId === 1) helper.reset() })
    helper = fixture({ duration: 0, onFinish: hook }).helper
    vi.advanceTimersByTime(99); expect(hook).not.toHaveBeenCalled()
    vi.advanceTimersByTime(101); expect(hook).toHaveBeenCalledTimes(2); expect(helper.state.runId).toBe(2)
  })
  it("suppresses an old finish callback after an event listener replaces the run", () => {
    const hook = vi.fn(), { helper, element } = fixture({ duration: 1000, onFinish: hook })
    element.addEventListener("mui:countdown-finish", () => helper.set({ value: 5000 }), { once: true })
    vi.advanceTimersByTime(1000)
    expect(hook).not.toHaveBeenCalled(); expect(helper.state.runId).toBe(2); expect(helper.value).toBe(5000)
  })
  it("reports an old finish-hook failure after reset without poisoning the new run", () => {
    let helper!: CountdownController
    const errors = vi.fn()
    const setup = fixture({ duration: 1000, onFinish: () => { helper.reset(); throw new Error("old hook failed") } }); helper = setup.helper
    setup.element.addEventListener("mui:countdown-error", errors); vi.advanceTimersByTime(1000)
    expect(helper.state.runId).toBe(2); expect(helper.state.status).toBe("running"); expect(helper.state.error).toBeNull()
    expect(errors).toHaveBeenCalledOnce(); expect(errors.mock.calls[0]![0].detail).toMatchObject({ runId: 1, phase: "finish", stale: true })
    expect(vi.getTimerCount()).toBe(1)
  })
  it("does not deliver completion or hooks after a notification removes the root", () => {
    const hook = vi.fn(), first = fixture({ duration: 1000, onFinish: hook }), event = vi.fn()
    first.element.addEventListener("mui:countdown-update", () => { if (first.helper.state.value === 0) first.element.remove() })
    first.element.addEventListener("mui:countdown-finish", event)
    vi.advanceTimersByTime(1000)
    expect(hook).not.toHaveBeenCalled(); expect(event).not.toHaveBeenCalled(); expect(first.helper.connected).toBe(false)
    const second = fixture({ duration: 1000, onFinish: hook })
    second.element.addEventListener("mui:countdown-finish", () => second.element.remove())
    vi.advanceTimersByTime(1000); expect(hook).not.toHaveBeenCalled(); expect(second.helper.connected).toBe(false)
  })
  it("guards reentrant clocks/formatters but permits disconnect without stale writes", () => {
    const { helper, element } = fixture({ duration: 1000 })
    expect(() => helper.set({ format: () => { helper.reset(); return "bad" } })).toThrow(/reenter/)
    expect(() => helper.set({ format: () => { helper.disconnect(); return "bad" } })).toThrow(/disconnected/)
    expect(helper.connected).toBe(false); expect(element.textContent).toContain("00:00:05"); expect(vi.getTimerCount()).toBe(0)
  })
  it("rejects backward/invalid elapsed clocks and keeps an inspectable error snapshot", () => {
    let now = 100
    const { helper } = fixture({ duration: 1000, monotonicNow: () => now })
    now = 50; vi.advanceTimersByTime(1000)
    expect(helper.state.status).toBe("error"); expect(helper.state.errorPhase).toBe("clock"); expect(vi.getTimerCount()).toBe(0)
    now = 200; helper.refresh(); expect(helper.value).toBe(900); expect(helper.state.status).toBe("running")
  })
  it("rejects asynchronous format/finish hooks with reported protocol errors", async () => {
    const first = fixture({ duration: 1000, active: false })
    expect(() => first.helper.set({ format: (() => Promise.reject(new Error("async"))) as never })).toThrow(/synchronously/)
    const second = fixture({ duration: 0, onFinish: (() => Promise.reject(new Error("async finish"))) as never })
    vi.advanceTimersByTime(100)
    expect(second.helper.state.status).toBe("error"); expect(second.helper.state.errorPhase).toBe("finish")
    await Promise.resolve()
  })
  it("cancels removal/dispose work, restores owned state and supports explicit rebinding", async () => {
    const hook = vi.fn(), { helper, host, element, text } = fixture({ duration: 1000, onFinish: hook })
    element.remove(); await Promise.resolve(); vi.advanceTimersByTime(2000)
    expect(helper.connected).toBe(false); expect(hook).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0)
    expect(text.data).toBe("00:00:05"); expect(element.dateTime).toBe("PT5S")
    host.prepend(element); const next = createCountdown(element, { duration: 1000, active: false }); helpers.push(next)
    expect(next.connected).toBe(true)
  })
  it("preserves author replacements or active selection instead of restoring only part of a display", () => {
    const { helper, text, element } = fixture({ duration: 1000 })
    select(text); const chosen = document.getSelection()!.toString()
    helper.disconnect(); expect(document.getSelection()!.toString()).toBe(chosen); expect(element.dateTime).toBe("PT1S")
    clearSelection()
    const second = fixture({ duration: 1000 }); second.text.data = "Author override"; second.helper.disconnect()
    expect(second.text.data).toBe("Author override"); expect(second.element.dateTime).toBe("PT1S")
  })
})

describe("Countdown default styles", () => {
  const css = readFileSync(resolve("src", "components", "countdown", "countdown.css"), "utf8")

  it("keeps the Countdown stylesheet within its unchanged ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(750)
  })

  it("adds only numeric readability, unit flow and focus presentation", () => {
    expect(css).toContain("font-variant-numeric: tabular-nums")
    expect(css).toContain("display: inline-flex")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).toContain(":focus-visible")
  })

  it("inherits application typography and paint like the unstyled reference output", () => {
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:color|background|font-size|font-family)\s*:/)
    expect(css).not.toContain("animation")
    expect(css).not.toContain("transition")
  })
})
