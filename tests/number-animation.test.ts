import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createNumberAnimation, formatAnimatedNumber, interpolateNumber, NumberAnimation, MNumberAnimation, registerNumberAnimation } from "../src/components/number-animation/index.js"
import * as numberAnimationApi from "../src/components/number-animation/index.js"
import type { NumberAnimationController, NumberAnimationOptions } from "../src/components/number-animation/index.js"
import { ViewElement } from "../src/core/index.js"

const helpers: NumberAnimationController[] = []
let now = 0, sequence = 0, hidden = false, frames: Map<number, FrameRequestCallback>
let media: EventTarget & { matches: boolean }
function frame(at: number) {
  now = at
  const pending = [...frames.values()]; frames.clear()
  pending.forEach(callback => callback(at))
}
function fixture(options: NumberAnimationOptions = {}, bind = true) {
  const form = document.createElement("form")
  form.innerHTML = '<data class="m-number-animation" data-number-animation value="100" tabindex="0"><strong>Total: </strong><span data-number-text>100</span></data><label>Other field<input name="other" value="kept"></label><button type="button" data-outside>Outside</button>'
  document.body.append(form)
  const element = form.querySelector<HTMLDataElement>("data")!, target = element.querySelector<HTMLElement>("[data-number-text]")!, text = target.firstChild as Text
  const helper = bind ? createNumberAnimation(element, { from: 0, to: 100, duration: 1000, easing: "linear", ...options }) : null
  if (helper) helpers.push(helper)
  return { helper: helper!, form, element, target, text, outside: form.querySelector<HTMLButtonElement>("[data-outside]")! }
}
function select(text: Text) {
  const range = document.createRange(); range.selectNodeContents(text)
  document.getSelection()!.removeAllRanges(); document.getSelection()!.addRange(range)
  document.dispatchEvent(new Event("selectionchange"))
}

describe("Number Animation default styles", () => {
  const css = readFileSync(resolve("src", "components", "number-animation", "number-animation.css"), "utf8")

  it("keeps the optional stylesheet within its unchanged ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(500)
  })

  it("adds only numeric readability, wrapping and focus presentation", () => {
    expect(css).toContain("font-variant-numeric: tabular-nums")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).toContain(":focus-visible")
  })

  it("inherits application typography and paint like the unstyled reference output", () => {
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:color|background|font-size|font-family|font-weight)\s*:/)
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:animation|transition)(?:-[\w-]+)?\s*:/)
  })
})
function clearSelection() { document.getSelection()!.removeAllRanges(); document.dispatchEvent(new Event("selectionchange")) }
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(0); now = sequence = 0; hidden = false; frames = new Map()
  media = Object.assign(new EventTarget(), { matches: false })
  vi.stubGlobal("matchMedia", () => media)
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { const id = sequence++; frames.set(id, callback); return id }))
  vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => { frames.delete(id) }))
  vi.spyOn(window.performance, "now").mockImplementation(() => now)
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden)
})
afterEach(() => {
  helpers.splice(0).forEach(helper => helper.disconnect()); clearSelection(); document.body.replaceChildren()
  vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers()
})

describe("Number Animation finite interpolation and Intl formatting", () => {
  it("handles opposite extreme endpoints without overflowing their difference", () => {
    const max = Number.MAX_VALUE
    for (const [from, to] of [[-max, max], [max, -max], [max, max / 2], [-max, -max / 2], [Number.MIN_VALUE, -Number.MIN_VALUE]]) {
      for (const t of [0, .001, .25, .5, .75, .999, 1]) {
        const value = interpolateNumber(from!, to!, t)
        expect(Number.isFinite(value)).toBe(true)
        expect(value).toBeGreaterThanOrEqual(Math.min(from!, to!)); expect(value).toBeLessThanOrEqual(Math.max(from!, to!))
      }
      expect(interpolateNumber(from!, to!, 0)).toBe(from); expect(interpolateNumber(from!, to!, 1)).toBe(to)
    }
    expect(interpolateNumber(-max, max, .5)).toBe(0)
  })
  it("preserves exact final endpoints, including negative zero and fractional values", () => {
    expect(Object.is(interpolateNumber(100, -0, 1), -0)).toBe(true)
    expect(interpolateNumber(-123.456, .1, 1)).toBe(.1)
  })
  it.each([NaN, Infinity, -Infinity, "10", 10n, null])("rejects nonfinite/non-Number input %s", value => {
    expect(() => interpolateNumber(value as number, 0, .5)).toThrow()
    expect(() => formatAnimatedNumber(value as number)).toThrow()
  })
  it.each([-1, 1.1, NaN, "0.5"])("rejects invalid interpolation progress %s", progress => {
    expect(() => interpolateNumber(0, 1, progress as number)).toThrow()
  })
  it("uses native precision, grouping and full localized digit output", () => {
    expect(formatAnimatedNumber(1234.5, { precision: 2 })).toBe("1234.50")
    expect(formatAnimatedNumber(1234.5, { precision: 2, showSeparator: true, locale: "en-US" })).toBe("1,234.50")
    expect(formatAnimatedNumber(1234.5, { precision: 2, showSeparator: true, locale: "de-DE" })).toBe("1.234,50")
    expect(formatAnimatedNumber(1234.5, { precision: 2, locale: "ar-EG" })).toBe(new Intl.NumberFormat("ar-EG", { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(1234.5))
    expect(formatAnimatedNumber(-0)).toBe("-0")
    expect(formatAnimatedNumber(Number.MAX_VALUE)).not.toContain("∞")
  })
  it.each([{ precision: -1 }, { precision: 21 }, { precision: .5 }, { locale: "bad_locale" },
    { locale: "zz-ZZ" }, { showSeparator: "true" }, { precision: null }, { format: "0.00" }])("rejects invalid formatting options", options => {
    expect(() => formatAnimatedNumber(1, options as never)).toThrow()
  })
})

describe("Number Animation native monotonic runs", () => {
  it("animates from elapsed time with exactly one scheduled frame and exact completion", () => {
    const finish = vi.fn(), { helper, text, element } = fixture({ onFinish: finish })
    expect(helper.value).toBe(0); expect(frames.size).toBe(1)
    frame(500); expect(helper.value).toBe(50); expect(text.data).toBe("50"); expect(frames.size).toBe(1)
    frame(1500); expect(helper.value).toBe(100); expect(text.data).toBe("100"); expect(element.value).toBe("100")
    expect(helper.state.status).toBe("finished"); expect(finish).toHaveBeenCalledOnce(); expect(frames.size).toBe(0)
  })
  it("supports decreasing/fractional and huge finite animations", () => {
    const { helper } = fixture({ from: 10.5, to: -2.25, precision: 2 })
    frame(500); expect(helper.value).toBe(4.125)
    frame(1000); expect(helper.value).toBe(-2.25)
    helper.set({ from: -Number.MAX_VALUE, to: Number.MAX_VALUE }); frame(1500)
    expect(helper.value).toBe(0); expect(Number.isFinite(helper.state.value)).toBe(true)
    frame(2000); expect(helper.value).toBe(Number.MAX_VALUE)
  })
  it("uses the source-like ease-out quint curve and explicit linear alternative", () => {
    const { helper } = fixture({ easing: "ease-out" })
    frame(500); expect(helper.value).toBe(96.875)
  })
  it("pauses/resumes without counting the pause gap or restarting", () => {
    const { helper } = fixture()
    frame(400); helper.pause(); const run = helper.state.runId
    now = 5000; expect(helper.value).toBe(40); expect(helper.state.status).toBe("paused"); expect(frames.size).toBe(0)
    helper.play(); frame(5600)
    expect(helper.value).toBe(100); expect(helper.state.runId).toBe(run)
  })
  it("play is a no-op while playing and replays completed runs from configured from", () => {
    const finish = vi.fn(), { helper } = fixture({ onFinish: finish })
    helper.play(); expect(helper.state.runId).toBe(1); expect(frames.size).toBe(1)
    frame(1000); helper.play(); expect(helper.state.runId).toBe(2); expect(helper.value).toBe(0)
    frame(2000); expect(finish).toHaveBeenCalledTimes(2)
  })
  it("retargets from the current unrounded logical value, invalidating the prior run", () => {
    const finish = vi.fn(), { helper } = fixture({ onFinish: finish, precision: 0 })
    frame(333); now = 500
    helper.retarget(200, 1000)
    expect(helper.state.from).toBe(50); expect(helper.state.to).toBe(200); expect(helper.state.runId).toBe(2)
    expect(helper.value).toBe(50)
    frame(1000); expect(helper.value).toBe(125)
    frame(1500); expect(helper.value).toBe(200); expect(finish).toHaveBeenCalledOnce()
  })
  it("format-only changes preserve the run while endpoint/duration changes create a new run", () => {
    const { helper } = fixture()
    frame(500); helper.set({ precision: 2, locale: "de-DE", showSeparator: true })
    expect(helper.state.runId).toBe(1); expect(helper.value).toBe(50)
    helper.set({ to: 200 }); expect(helper.state.runId).toBe(2); expect(helper.value).toBe(0)
    helper.set({ duration: 2000 }); expect(helper.state.runId).toBe(3)
  })
  it("cancels at the last successful sample without completion and supports reset", () => {
    const finish = vi.fn(), { helper } = fixture({ onFinish: finish })
    frame(400); now = 500; helper.cancel()
    expect(helper.value).toBe(40); expect(helper.state.status).toBe("cancelled"); expect(frames.size).toBe(0)
    frame(2000); expect(finish).not.toHaveBeenCalled()
    helper.reset(); expect(helper.value).toBe(0); expect(helper.state.active).toBe(false)
    helper.play(); frame(3000); expect(finish).toHaveBeenCalledOnce()
  })
  it("settles same endpoints/zero duration once without frames or recursive completion", () => {
    const first = fixture({ from: 12, to: 12, onFinish: vi.fn() }), second = fixture({ from: 0, to: -0, duration: 0, onFinish: vi.fn() })
    expect(frames.size).toBe(0); expect(first.helper.value).toBe(12); expect(Object.is(second.helper.value, -0)).toBe(true)
    expect(second.element.value).toBe("-0")
    expect(first.helper.state.status).toBe("playing")
    vi.advanceTimersByTime(16); expect(first.helper.state.status).toBe("finished"); expect(second.helper.state.status).toBe("finished")
    expect(vi.getTimerCount()).toBe(0)
  })
  it("leaves inactive prepared runs idle until explicitly played", () => {
    const finish = vi.fn(), { helper, text } = fixture({ active: false, onFinish: finish })
    expect(text.data).toBe("0"); expect(helper.state.status).toBe("idle"); expect(frames.size).toBe(0)
    helper.play(); frame(1000); expect(finish).toHaveBeenCalledOnce()
  })
})

describe("Number Animation reduced motion, native text and frame bounds", () => {
  it("shows useful final values under reduced motion and finishes active runs once", () => {
    media.matches = true
    const finish = vi.fn(), { helper, text } = fixture({ onFinish: finish })
    expect(text.data).toBe("100"); expect(helper.value).toBe(100); expect(frames.size).toBe(0)
    vi.advanceTimersByTime(16); expect(finish).toHaveBeenCalledOnce()
    media.matches = false; media.dispatchEvent(new Event("change"))
    expect(helper.value).toBe(100); expect(frames.size).toBe(0)
  })
  it("settles on a motion preference change and never restarts cancelled work", () => {
    const finish = vi.fn(), { helper } = fixture({ onFinish: finish })
    frame(400); media.matches = true; media.dispatchEvent(new Event("change"))
    expect(helper.value).toBe(100); expect(finish).toHaveBeenCalledOnce(); expect(frames.size).toBe(0)
    media.matches = false; media.dispatchEvent(new Event("change")); helper.play(); frame(700)
    helper.cancel(); const value = helper.value
    media.matches = true; media.dispatchEvent(new Event("change")); expect(helper.value).toBe(value)
    helper.set({ precision: 2 }); expect(helper.value).toBe(value)
  })
  it("samples current reduced-motion preference before delayed change events arrive", () => {
    const { helper, text } = fixture()
    media.matches = true
    helper.set({ to: 200 })
    expect(helper.value).toBe(200); expect(text.data).toBe("200"); expect(frames.size).toBe(0)
    vi.advanceTimersByTime(16); expect(helper.state.status).toBe("finished")
  })
  it("does not let an old media callback settle a run created by reentrant finish", () => {
    let helper!: NumberAnimationController
    const finish = vi.fn(() => { if (helper.state.runId === 1) helper.reset() })
    helper = fixture({ onFinish: finish }).helper
    frame(200); hidden = true; document.dispatchEvent(new Event("visibilitychange"))
    now = 1500; hidden = false; media.matches = true; media.dispatchEvent(new Event("change"))
    expect(finish).toHaveBeenCalledOnce(); expect(helper.state.runId).toBe(2); expect(helper.state.status).toBe("playing")
    vi.advanceTimersByTime(16); expect(finish).toHaveBeenCalledTimes(2)
  })
  it("falls back to a final value when RAF or motion preference support is unavailable", () => {
    vi.stubGlobal("requestAnimationFrame", undefined); vi.stubGlobal("cancelAnimationFrame", undefined)
    const finish = vi.fn(), { helper } = fixture({ onFinish: finish })
    expect(helper.value).toBe(100); expect(helper.state.motionSupported).toBe(false)
    vi.advanceTimersByTime(16); expect(finish).toHaveBeenCalledOnce()
  })
  it("does not perform layout/style reads in frame callbacks", () => {
    fixture()
    const reads = vi.spyOn(window, "getComputedStyle"); reads.mockClear()
    frame(100); frame(200); frame(300)
    expect(reads).not.toHaveBeenCalled()
  })
  it("cancels hidden frames and catches up from elapsed time once, without hidden finish", () => {
    const finish = vi.fn(), { helper, text } = fixture({ onFinish: finish })
    frame(200); hidden = true; document.dispatchEvent(new Event("visibilitychange"))
    expect(frames.size).toBe(0)
    now = 3000; expect(helper.value).toBe(100); expect(text.data).toBe("20"); expect(finish).not.toHaveBeenCalled()
    hidden = false; document.dispatchEvent(new Event("visibilitychange"))
    expect(text.data).toBe("100"); expect(finish).toHaveBeenCalledOnce(); expect(frames.size).toBe(0)
  })
  it("preserves selection/pair and defers frames/finish until reading releases", () => {
    const finish = vi.fn(), { helper, text, element } = fixture({ onFinish: finish })
    frame(200); select(text); const chosen = document.getSelection()!.toString()
    now = 1500; expect(frames.size).toBe(0)
    expect(text.data).toBe("20"); expect(element.value).toBe("20"); expect(document.getSelection()!.toString()).toBe(chosen)
    clearSelection(); expect(text.data).toBe("100"); expect(finish).toHaveBeenCalledOnce()
    expect(helper.text).toBe(text)
  })
  it("keeps native focus, markup, listeners and form fields untouched", () => {
    const { helper, form, element, outside } = fixture({ active: false })
    const strong = element.querySelector("strong")!, click = vi.fn(); strong.addEventListener("click", click)
    outside.focus(); helper.play(); frame(500)
    expect(document.activeElement).toBe(outside); expect(element.querySelector("strong")).toBe(strong)
    strong.click(); expect(click).toHaveBeenCalledOnce(); expect([...new FormData(form)]).toEqual([["other", "kept"]])
    expect(element.hasAttribute("role")).toBe(false); expect(element.hasAttribute("aria-live")).toBe(false)
  })
  it("does not rewrite identical formatted text on every frame", async () => {
    const { element, text } = fixture({ from: 0, to: .1, precision: 0 })
    const records: MutationRecord[] = [], observer = new MutationObserver(changes => records.push(...changes))
    observer.observe(element, { characterData: true, subtree: true })
    frame(100); frame(200); frame(300); await Promise.resolve()
    expect(text.data).toBe("0"); expect(records).toEqual([]); observer.disconnect()
  })
  it("rejects announcing ancestors and pauses if one is added later", async () => {
    const first = fixture({}, false); first.form.setAttribute("aria-live", "polite")
    expect(() => createNumberAnimation(first.element)).toThrow(/nonannouncing/)
    const second = fixture(); second.form.setAttribute("role", "status"); await Promise.resolve()
    expect(second.helper.state.pauseReasons).toContain("live-region"); expect(frames.size).toBe(0)
  })
})

describe("Number Animation failures, reentrancy and lifetime", () => {
  it.each([{ from: NaN }, { to: Infinity }, { duration: -1 }, { duration: 3600001 },
    { precision: 21 }, { showSeparator: "yes" }, { easing: "bounce" }, { active: null },
    { locale: "bad_locale" }, { monotonicNow: () => 0 }])("rejects invalid updates atomically", options => {
    const { helper, element, text } = fixture(), before = helper.state, shown = text.data, attribute = element.value
    expect(() => helper.set(options as NumberAnimationOptions)).toThrow()
    expect(text.data).toBe(shown); expect(element.value).toBe(attribute); expect(helper.state.runId).toBe(before.runId)
    expect(frames.size).toBe(1)
  })
  it("surfaces easing/formatter failures without displaying NaN or fake completion", () => {
    const finish = vi.fn(), { helper, text } = fixture({ easing: progress => progress >= .5 && progress < 1 ? NaN : progress, onFinish: finish })
    frame(200); const before = text.data
    frame(500); expect(helper.state.status).toBe("error"); expect(helper.state.errorPhase).toBe("easing")
    expect(text.data).toBe(before); expect(frames.size).toBe(0); expect(finish).not.toHaveBeenCalled()
    helper.set({ easing: "linear", format: info => { if (info.value === 100) throw new Error("final format"); return String(info.value) }, active: true })
    frame(1500); expect(helper.state.status).toBe("error"); expect(helper.state.errorPhase).toBe("format"); expect(finish).not.toHaveBeenCalled()
  })
  it("rejects asynchronous/out-of-range callbacks and reports finish errors without repetition", async () => {
    const { helper } = fixture()
    expect(() => helper.set({ easing: (() => Promise.reject(new Error("async easing"))) as never })).toThrow(/Easing/)
    expect(() => helper.set({ easing: () => 2 })).toThrow(/Easing/)
    expect(() => helper.set({ format: (() => Promise.reject(new Error("async text"))) as never })).toThrow(/format/)
    const finish = vi.fn(() => { throw new Error("finish failed") })
    helper.set({ onFinish: finish }); frame(1000)
    expect(helper.state.status).toBe("error"); expect(helper.state.errorPhase).toBe("finish")
    helper.refresh(); expect(finish).toHaveBeenCalledOnce()
    await Promise.resolve()
  })
  it("stops on backward clocks and retains a safe observed value", () => {
    const { helper, text } = fixture()
    frame(200); const shown = text.data
    frame(100); expect(helper.state.errorPhase).toBe("clock"); expect(text.data).toBe(shown); expect(frames.size).toBe(0)
  })
  it("guards reentrant formatters and permits disposal without stale writes", () => {
    const { helper, text } = fixture()
    expect(() => helper.set({ format: () => { helper.reset(); return "bad" } })).toThrow(/reenter/)
    expect(() => helper.set({ format: () => { helper.disconnect(); return "bad" } })).toThrow(/disconnected/)
    expect(text.data).toBe("100"); expect(frames.size).toBe(0)
  })
  it("supports reentrant finish replay and suppresses stale finish hooks after reset", () => {
    const hook = vi.fn(), { helper, element } = fixture({ onFinish: hook })
    element.addEventListener("m:number-animation-finish", () => helper.reset(), { once: true })
    frame(1000)
    expect(helper.state.runId).toBe(2); expect(hook).not.toHaveBeenCalled(); expect(frames.size).toBe(1)
    frame(2000); expect(hook).toHaveBeenCalledOnce()
  })
  it("reports finish-hook errors after retarget without poisoning the new run", () => {
    let helper!: NumberAnimationController
    const setup = fixture({ onFinish: () => { helper.retarget(200); throw new Error("old hook failed") } }); helper = setup.helper
    const errors = vi.fn(); setup.element.addEventListener("m:number-animation-error", errors)
    frame(1000)
    expect(helper.state.status).toBe("playing"); expect(helper.state.to).toBe(200); expect(helper.state.error).toBeNull()
    expect(errors.mock.calls[0]![0].detail).toMatchObject({ runId: 1, phase: "finish", stale: true })
  })
  it("does not deliver finish after an update listener removes the root", () => {
    const finish = vi.fn(), { helper, element } = fixture({ onFinish: finish })
    element.addEventListener("m:number-animation-update", () => { if (helper.state.progress === 1) element.remove() })
    frame(1000); expect(finish).not.toHaveBeenCalled(); expect(helper.connected).toBe(false)
  })
  it("cancels RAF id zero and ignores stale callbacks after retarget/disconnect", () => {
    const { helper, text } = fixture(), stale = frames.get(0)!
    helper.retarget(200); expect(cancelAnimationFrame).toHaveBeenCalledWith(0)
    stale(1000); expect(helper.state.runId).toBe(2)
    helper.disconnect(); stale(2000); expect(text.data).toBe("100"); expect(frames.size).toBe(0)
  })
  it("keeps meaningful selected/author-owned text on disconnect and supports rebinding", () => {
    const { helper, text, element } = fixture()
    frame(200); select(text); const chosen = document.getSelection()!.toString()
    helper.disconnect(); expect(text.data).toBe("20"); expect(document.getSelection()!.toString()).toBe(chosen)
    clearSelection(); const next = createNumberAnimation(element, { from: 20, to: 50, active: false }); helpers.push(next)
    text.data = "Author override"; next.disconnect(); expect(text.data).toBe("Author override")
  })
  it("auto-disconnects changed text anatomy and refuses overlapping timer ownership", async () => {
    const { helper, target } = fixture(); target.textContent = "Replacement"; await Promise.resolve()
    expect(helper.connected).toBe(false); expect(target.textContent).toBe("Replacement"); expect(frames.size).toBe(0)
    const other = fixture({}, false); other.element.setAttribute("data-countdown", "")
    expect(() => createNumberAnimation(other.element)).toThrow(/Countdown/)
  })
})

describe("canonical NumberAnimation ViewElement", () => {
  it("exports canonical ViewElement classes and registration", () => {
    expect(numberAnimationApi.NumberAnimation).toBe(NumberAnimation)
    expect(numberAnimationApi.MNumberAnimation).toBe(NumberAnimation)
    expect(NumberAnimation.tag).toBe("m-number-animation")
    expect(ViewElement.prototype.isPrototypeOf(NumberAnimation.prototype)).toBe(true)
    expect(customElements.get("m-number-animation")).toBe(NumberAnimation)
    expect(NumberAnimation.observedAttributes).toEqual(["from", "to", "duration", "precision"])
    expect(() => registerNumberAnimation()).not.toThrow()
    const define = vi.fn()
    expect(() => registerNumberAnimation({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("initializes with canonical default values", () => {
    const element = document.createElement("m-number-animation") as NumberAnimation
    expect(element.from).toBe(0)
    expect(element.to).toBe(0)
    expect(element.duration).toBe(1000)
    expect(element.precision).toBe(0)
  })

  it("reflects property updates to attributes", () => {
    const element = document.createElement("m-number-animation") as NumberAnimation
    element.from = 10
    expect(element.from).toBe(10)
    expect(element.getAttribute("from")).toBe("10")

    element.to = 100
    expect(element.to).toBe(100)
    expect(element.getAttribute("to")).toBe("100")

    element.duration = 2000
    expect(element.duration).toBe(2000)
    expect(element.getAttribute("duration")).toBe("2000")

    element.precision = 2
    expect(element.precision).toBe(2)
    expect(element.getAttribute("precision")).toBe("2")
  })

  it("reflects attribute updates to properties", () => {
    const element = document.createElement("m-number-animation") as NumberAnimation
    element.setAttribute("from", "25")
    expect(element.from).toBe(25)

    element.setAttribute("to", "250")
    expect(element.to).toBe(250)

    element.setAttribute("duration", "500")
    expect(element.duration).toBe(500)

    element.setAttribute("precision", "1")
    expect(element.precision).toBe(1)
  })

  it("validates input ranges and types", () => {
    const element = document.createElement("m-number-animation") as NumberAnimation
    expect(() => { element.from = NaN }).toThrow(RangeError)
    expect(() => { element.from = Infinity }).toThrow(RangeError)
    expect(() => { element.from = "10" as never }).toThrow(RangeError)

    expect(() => { element.to = NaN }).toThrow(RangeError)
    expect(() => { element.to = -Infinity }).toThrow(RangeError)

    expect(() => { element.duration = -1 }).toThrow(RangeError)
    expect(() => { element.duration = NaN }).toThrow(RangeError)

    expect(() => { element.precision = -1 }).toThrow(RangeError)
    expect(() => { element.precision = 21 }).toThrow(RangeError)
    expect(() => { element.precision = 1.5 }).toThrow(RangeError)
  })

  it("animates numeric values and emits m:finish event on completion", () => {
    const element = document.createElement("m-number-animation") as NumberAnimation
    element.from = 0
    element.to = 100
    element.duration = 1000
    const finish = vi.fn()
    element.addEventListener("m:finish", finish)

    document.body.append(element)
    expect(frames.size).toBe(1)
    expect(element.textContent).toBe("0")

    frame(500)
    expect(element.textContent).not.toBe("0")
    expect(element.textContent).not.toBe("100")
    expect(finish).not.toHaveBeenCalled()

    frame(1000)
    expect(element.textContent).toBe("100")
    expect(finish).toHaveBeenCalledOnce()
    const event = finish.mock.calls[0]![0] as CustomEvent
    expect(event.detail).toEqual({ value: 100 })
    expect(event.bubbles).toBe(true)
    expect(event.cancelable).toBe(false)
    expect(event.composed).toBe(false)
  })

  it("formats numbers with specified precision", () => {
    const element = document.createElement("m-number-animation") as NumberAnimation
    element.from = 0
    element.to = 50.5
    element.precision = 2
    element.duration = 0

    document.body.append(element)
    expect(element.textContent).toBe("50.50")
  })

  it("preserves authored prefix and updates span[data-number-text] target", () => {
    document.body.innerHTML = '<m-number-animation from="0" to="100" duration="0"><strong>Total: </strong><span data-number-text>0</span></m-number-animation>'
    const element = document.querySelector("m-number-animation") as NumberAnimation
    expect(element.querySelector("strong")?.textContent).toBe("Total: ")
    expect(element.querySelector("[data-number-text]")?.textContent).toBe("100")
  })

  it("supports play, pause and reset controls", () => {
    const element = document.createElement("m-number-animation") as NumberAnimation
    element.from = 10
    element.to = 50
    element.duration = 1000
    document.body.append(element)

    frame(500)
    element.pause()
    element.reset()
    expect(element.textContent).toBe("10")
  })

  it("finishes immediately when reduced motion is preferred", () => {
    media.matches = true
    const finish = vi.fn()
    const element = document.createElement("m-number-animation") as NumberAnimation
    element.from = 0
    element.to = 200
    element.duration = 1000
    element.addEventListener("m:finish", finish)

    document.body.append(element)
    expect(element.textContent).toBe("200")
    expect(finish).toHaveBeenCalledOnce()
    expect((finish.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: 200 })
  })

  it("cleans up animation frames on disconnect", () => {
    const element = document.createElement("m-number-animation") as NumberAnimation
    element.from = 0
    element.to = 100
    element.duration = 1000
    document.body.append(element)
    expect(frames.size).toBe(1)

    element.remove()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })
})

