import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { createSplit } from "../src/components/split/index.js"
import { splitMeasure, splitBounds } from "../src/components/split/model.js"
import type { SplitController, SplitOptions } from "../src/components/split/index.js"

const helpers: SplitController[] = []
let sequence = 0, sheet: HTMLStyleElement, captures: WeakMap<HTMLElement, number>
class Pointer extends MouseEvent {
  readonly pointerId: number
  readonly isPrimary: boolean
  readonly pointerType: string
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init); this.pointerId = init.pointerId ?? 1; this.isPrimary = init.isPrimary ?? true; this.pointerType = init.pointerType ?? "mouse"
  }
}
class Resize {
  static instances: Resize[] = []
  disconnect = vi.fn()
  observe = vi.fn()
  constructor(readonly callback: ResizeObserverCallback) { Resize.instances.push(this) }
  emit() { this.callback([], {} as ResizeObserver) }
}
const wait = () => vi.advanceTimersByTimeAsync(40)
function fixture(options: SplitOptions = {}, geometry = { width: 400, height: 240, x: 1, y: 1 }) {
  const id = ++sequence, form = document.createElement("form")
  form.innerHTML = `<section class="mui-split" data-split style="width:400px;padding:10px;border:2px solid;column-gap:4px;row-gap:4px;direction:ltr">
    <section data-split-pane="1" id="pane-one-${id}" aria-label="Primary pane"><div><label>First field<input name="first" value="kept" required></label><span>Selectable text</span></div></section>
    <div data-split-handle hidden aria-label="Resize primary pane"></div>
    <section data-split-pane="2" id="pane-two-${id}" aria-label="Secondary pane"><div><label>Second field<input name="second" value="also kept"></label><template><p>Inert</p></template></div></section>
    </section><button type="button" data-outside>Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-split]")!, handle = root.querySelector<HTMLElement>("[data-split-handle]")!
  const dimensions = { ...geometry }
  Object.defineProperties(root, {
    offsetWidth: { configurable: true, get: () => dimensions.width },
    offsetHeight: { configurable: true, get: () => dimensions.height },
    clientWidth: { configurable: true, get: () => Math.max(0, dimensions.width - 4) },
    clientHeight: { configurable: true, get: () => Math.max(0, dimensions.height - 4) },
    clientLeft: { configurable: true, get: () => 2 }, clientTop: { configurable: true, get: () => 2 },
  })
  root.getBoundingClientRect = () => new DOMRect(100, 100, dimensions.width * dimensions.x, dimensions.height * dimensions.y)
  handle.getBoundingClientRect = () => {
    const horizontal = root.getAttribute("data-split-direction") !== "vertical", rtl = getComputedStyle(root).direction === "rtl"
    const size = Number.parseFloat(root.style.getPropertyValue("--mui-split-first")) || 0
    const bar = Number.parseFloat(root.style.getPropertyValue("--mui-split-handle-size")) || 12
    if (horizontal) return new DOMRect(100 + (rtl ? dimensions.width - 12 - size - 4 - bar : 12 + size + 4) * dimensions.x, 100 + 12 * dimensions.y, bar * dimensions.x, (dimensions.height - 24) * dimensions.y)
    return new DOMRect(100 + 12 * dimensions.x, 100 + (12 + size + 4) * dimensions.y, (dimensions.width - 24) * dimensions.x, bar * dimensions.y)
  }
  const helper = createSplit(root, options); helpers.push(helper)
  function pointer(type: string, axisDelta = 0, extra: PointerEventInit = {}) {
    const rect = handle.getBoundingClientRect()
    const horizontal = helper.state.direction === "horizontal"
    const event = new Pointer(type, { bubbles: true, cancelable: true, button: 0, buttons: type === "pointerup" ? 0 : 1,
      clientX: rect.left + 3 * dimensions.x + (horizontal ? axisDelta : 0), clientY: rect.top + 3 * dimensions.y + (horizontal ? 0 : axisDelta), ...extra })
    handle.dispatchEvent(event); return event
  }
  function key(value: string, extra: KeyboardEventInit = {}) {
    const event = new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true, ...extra }); handle.dispatchEvent(event); return event
  }
  return { helper, root, handle, form, dimensions, pointer, key, pane1: helper.pane1, pane2: helper.pane2 }
}
beforeEach(() => {
  vi.useFakeTimers(); captures = new WeakMap()
  sheet = document.createElement("style"); sheet.textContent = readFileSync(resolve("src", "components", "split", "split.css"), "utf8"); document.head.append(sheet)
  vi.stubGlobal("PointerEvent", Pointer); vi.stubGlobal("ResizeObserver", Resize)
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { configurable: true, value(id: number) { captures.set(this, id) } })
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", { configurable: true, value(id: number) { return captures.get(this) === id } })
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { configurable: true, value(id: number) { captures.delete(this); this.dispatchEvent(new Pointer("lostpointercapture", { pointerId: id })) } })
})
afterEach(() => {
  helpers.splice(0).forEach(helper => helper.disconnect()); sheet.remove(); document.body.replaceChildren()
  delete (HTMLElement.prototype as Partial<HTMLElement>).setPointerCapture
  delete (HTMLElement.prototype as Partial<HTMLElement>).hasPointerCapture
  delete (HTMLElement.prototype as Partial<HTMLElement>).releasePointerCapture
  Resize.instances = []; vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers()
})

describe("Split default styles", () => {
  const css = readFileSync(resolve("src", "components", "split", "split.css"), "utf8")

  it("keeps the stylesheet within its existing ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1500)
  })

  it("uses the reference neutral and primary handle roles", () => {
    expect(css).toContain("light-dark(#e0e0e6, rgba(255, 255, 255, .24))")
    expect(css).toContain("light-dark(#36ad6a, #7fe7c4)")
    expect(css).toContain("background-color .3s cubic-bezier(.4, 0, .2, 1)")
  })

  it("retains the accessible 12px track and public handle overrides", () => {
    expect(css).toContain("var(--mui-split-handle-size, 12px)")
    expect(css).toContain("var(--mui-split-handle-border, transparent)")
    expect(css).toContain("var(--mui-split-handle-active")
  })

  it("supports forced colors, reduced motion and print", () => {
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("@media (prefers-reduced-motion: reduce)")
    expect(css).toContain("@media print")
  })
})

describe("explicit Split sizes and native geometry", () => {
  it("measures content minus borders/padding, handle and both grid gaps", () => {
    const { helper, handle } = fixture()
    expect(helper.state.available).toBe(356); expect(helper.state.pixels).toBe(178); expect(helper.size).toBe(.5)
    expect(handle.getAttribute("role")).toBe("separator"); expect(handle.tabIndex).toBe(0)
    expect(handle.getAttribute("aria-controls")).toBe(helper.pane1.id); expect(handle.getAttribute("aria-orientation")).toBe("vertical")
    expect(handle.getAttribute("aria-valuenow")).toBe("50")
  })
  it("retains pixel preference through clamping/shrink and restores it on growth", () => {
    const { helper, dimensions } = fixture({ size: "300px", max: .8 })
    expect(helper.size).toBe("300px"); expect(helper.state.pixels).toBeCloseTo(284.8)
    dimensions.width = 240; helper.refresh(); expect(helper.size).toBe("300px"); expect(helper.state.pixels).toBeCloseTo(156.8)
    dimensions.width = 600; helper.refresh(); expect(helper.state.pixels).toBe(300)
  })
  it("uses separate current/default sizes and a silent explicit reset", () => {
    const { helper, root } = fixture({ defaultSize: .25, size: "100px" }), changed = vi.fn()
    root.addEventListener("mui:split-change", changed)
    helper.setDefaultSize("80px"); expect(helper.size).toBe("100px"); helper.reset(); expect(helper.size).toBe("80px")
    expect(helper.state.defaultSize).toBe("80px"); expect(changed).not.toHaveBeenCalled()
  })
  it.each([NaN, -1, 1.1, null, "50%", "calc(20px)", "-1px", "10rem", " 20px", "1e3px", "1000001px"])("rejects ambiguous or invalid size %s", size => {
    expect(() => splitMeasure(size)).toThrow()
  })
  it("normalizes supported decimal pixel strings and validates same-unit bounds", () => {
    expect(splitMeasure(".5px").size).toBe("0.5px"); expect(splitMeasure("0010px").size).toBe("10px")
    expect(() => splitBounds(splitMeasure(.8), splitMeasure(.2), 500)).toThrow("min")
    const { helper } = fixture(); const old = helper.state
    expect(() => helper.set({ min: "200px", max: "100px" })).toThrow()
    expect(helper.state).toEqual(old)
  })
  it("suspends impossible mixed/too-small bounds into uncollapsed static layout without losing desired size", () => {
    const { helper, root, handle, pane1, pane2, dimensions } = fixture({ size: .7, min: "300px", max: .4 })
    expect(helper.state.status).toBe("suspended"); expect(helper.state.reason).toBe("bounds")
    expect(root.dataset.splitLayout).toBe("suspended"); expect(handle.hidden).toBe(true)
    expect(getComputedStyle(root).gridTemplateRows).toBe("max-content max-content")
    expect(pane1.hidden || pane2.hidden).toBe(false); expect(helper.size).toBe(.7)
    dimensions.width = 1000; helper.refresh(); expect(helper.state.status).toBe("ready"); expect(helper.state.pixels).toBeCloseTo(382.4)
  })
  it("keeps ratios valid through hidden/zero-size/unhidden resize", async () => {
    const { helper, root, dimensions } = fixture({ size: .7 })
    root.hidden = true; await wait()
    expect(helper.state.reason).toBe("hidden"); expect(helper.state.pixels).toBeNull(); expect(helper.size).toBe(.7)
    root.hidden = false; dimensions.width = 0; helper.refresh(); expect(helper.state.reason).toBe("space")
    expect(helper.revealPane(1)).toBe(false)
    dimensions.width = 500; Resize.instances[0]!.emit(); await wait()
    expect(helper.state.pixels).toBeCloseTo(319.2); expect(helper.size).toBe(.7)
  })
  it("captures direction and maps side-by-side panes to a vertical separator", () => {
    const { helper, handle } = fixture()
    helper.set({ direction: "vertical" })
    expect(helper.state.available).toBe(196); expect(helper.state.pixels).toBe(98)
    expect(handle.getAttribute("aria-orientation")).toBe("horizontal")
  })
  it("preserves original pane trees/listeners/forms and does not resize on native form reset", () => {
    const { helper, pane1, pane2, form } = fixture(), node = pane1.firstElementChild!, listener = vi.fn()
    node.addEventListener("example", listener); pane1.querySelector("input")!.value = "edit"
    helper.set({ size: .7 }); node.dispatchEvent(new Event("example"))
    expect(listener).toHaveBeenCalledOnce(); expect(pane1.firstElementChild).toBe(node)
    expect(new FormData(form).get("first")).toBe("edit"); expect(pane2.querySelector("template")!.content.querySelector("p")!.textContent).toBe("Inert")
    form.reset(); expect(helper.size).toBe(.7); expect(pane1.querySelector("input")!.value).toBe("kept")
  })
})

describe("keyboard parity, bounds and collapse safety", () => {
  it("supports physical arrows, Shift coarse steps, Home/End and exact effective ARIA", () => {
    const { helper, handle, key } = fixture({ min: .1, max: .9 })
    handle.focus(); key("ArrowRight"); expect(helper.state.pixels).toBeCloseTo(188)
    key("ArrowRight", { shiftKey: true }); expect(helper.state.pixels).toBeCloseTo(288)
    key("Home"); expect(helper.state.pixels).toBeCloseTo(35.6); expect(Number(handle.getAttribute("aria-valuenow"))).toBeCloseTo(10)
    key("End"); expect(helper.state.pixels).toBeCloseTo(320.4)
    expect(Number(handle.getAttribute("aria-valuemin"))).toBeCloseTo(10); expect(Number(handle.getAttribute("aria-valuemax"))).toBeCloseTo(90)
  })
  it("moves the physical separator right by shrinking logical pane one in RTL", () => {
    const { helper, root, key } = fixture()
    root.dir = "rtl"; root.style.direction = "rtl"; helper.refresh()
    key("ArrowRight"); expect(helper.state.pixels).toBeCloseTo(168)
    key("ArrowLeft"); expect(helper.state.pixels).toBeCloseTo(178)
    helper.set({ direction: "vertical" }); key("ArrowDown"); expect(helper.state.pixels).toBeCloseTo(108)
  })
  it("retains current pixel mode for keyboard changes and ignores perpendicular/modified/cancelled keys", () => {
    const { helper, handle, key } = fixture({ size: "100px" })
    key("ArrowRight"); expect(helper.size).toBe("110px")
    expect(key("ArrowDown").defaultPrevented).toBe(false)
    key("ArrowRight", { ctrlKey: true }); expect(helper.size).toBe("110px")
    handle.addEventListener("keydown", event => event.preventDefault(), { capture: true, once: true })
    key("End"); expect(helper.size).toBe("110px")
  })
  it("collapses zero/subpixel panes with hidden+inert, never native field disabling", () => {
    const { helper, pane1, pane2, handle, key, form } = fixture()
    pane1.querySelector("input")!.value = ""; handle.focus(); key("Home")
    expect(helper.state.collapsed).toBe(1); expect(pane1.hidden).toBe(true); expect(pane1.hasAttribute("inert")).toBe(true)
    expect(pane1.querySelector("input")!.disabled).toBe(false); expect(new FormData(form).get("first")).toBe("")
    expect(form.checkValidity()).toBe(false); expect(helper.revealPane(1)).toBe(true)
    expect(pane1.hidden).toBe(false); expect(pane2.hidden).toBe(false)
    helper.set({ size: ".25px" }); expect(pane1.hidden).toBe(true)
  })
  it("moves only focus that would become hidden, preserving outside focus otherwise", () => {
    const { helper, pane1, handle, form } = fixture(), outside = form.querySelector<HTMLElement>("[data-outside]")!
    pane1.querySelector("input")!.focus(); helper.set({ size: 0 }); expect(document.activeElement).toBe(handle)
    outside.focus(); helper.set({ size: 1 }); expect(document.activeElement).toBe(outside)
  })
  it("does not violate bounds merely to reveal a collapsed pane", () => {
    const { helper, handle, key } = fixture({ min: 0, max: 0 })
    expect(helper.state.disabled).toBe(true); expect(handle.getAttribute("aria-disabled")).toBe("true")
    key("ArrowRight"); expect(helper.state.pixels).toBe(0); expect(helper.revealPane(1)).toBe(false)
  })
  it("disabling retains geometry and named form fields without keyboard changes", () => {
    const { helper, handle, key, form } = fixture({ size: "100px" }), change = vi.fn()
    helper.element.addEventListener("mui:split-change", change); helper.set({ disabled: true }); key("End")
    expect(helper.state.pixels).toBe(100); expect(handle.hidden).toBe(false); expect(handle.getAttribute("aria-disabled")).toBe("true")
    expect(new FormData(form).get("first")).toBe("kept"); expect(change).not.toHaveBeenCalled()
  })
})

describe("scoped pointer capture and final samples", () => {
  it("captures only the owned handle, preserves grab offset and never writes body interaction styles", async () => {
    const { helper, handle, pointer } = fixture({ size: "100px" }), before = document.body.getAttribute("style")
    const down = pointer("pointerdown"), x = down.clientX, y = down.clientY
    expect(handle.hasPointerCapture(1)).toBe(true)
    pointer("pointermove", 0, { clientX: x + 20, clientY: y }); await wait()
    expect(helper.size).toBe("120px"); pointer("pointerup", 0, { clientX: x + 20, clientY: y })
    expect(handle.hasPointerCapture(1)).toBe(false); expect(helper.state.dragging).toBe(false); expect(document.body.getAttribute("style")).toBe(before)
  })
  it("normalizes zoom/nonuniform scale and vertical pointer coordinates to CSS pixels", async () => {
    const horizontal = fixture({ size: "100px" }, { width: 400, height: 240, x: 2, y: 3 })
    const down = horizontal.pointer("pointerdown")
    horizontal.pointer("pointerup", 0, { clientX: down.clientX + 40, clientY: down.clientY })
    expect(horizontal.helper.size).toBe("120px")
    const vertical = fixture({ direction: "vertical", size: "80px" }, { width: 400, height: 240, x: 2, y: 3 })
    const start = vertical.pointer("pointerdown")
    vertical.pointer("pointerup", 0, { clientX: start.clientX, clientY: start.clientY + 60 })
    expect(vertical.helper.size).toBe("100px")
  })
  it("uses the final pointerup position even when the last move frame has not run", () => {
    const { helper, pointer, root } = fixture({ size: "100px" }), events: string[] = []
    root.addEventListener("mui:split-change", () => events.push(`change:${helper.size}`))
    root.addEventListener("mui:split-drag-end", () => events.push(`end:${helper.size}`))
    const down = pointer("pointerdown")
    pointer("pointermove", 0, { clientX: down.clientX + 20, clientY: down.clientY })
    pointer("pointerup", 0, { clientX: down.clientX + 60, clientY: down.clientY })
    expect(helper.size).toBe("160px"); expect(events).toEqual(["change:160px", "end:160px"])
  })
  it("coalesces movement to the newest native sample and bounds scheduled work", async () => {
    const { helper, handle, pointer } = fixture({ size: "100px" })
    const down = pointer("pointerdown"), event = new Pointer("pointermove", { pointerId: 1, clientX: down.clientX + 10, clientY: down.clientY })
    Object.assign(event, { getCoalescedEvents: () => [new Pointer("pointermove", { pointerId: 1, clientX: down.clientX + 50, clientY: down.clientY })] })
    handle.dispatchEvent(event); await wait(); expect(helper.size).toBe("150px")
    pointer("pointerup", 0, { clientX: down.clientX + 50, clientY: down.clientY })
  })
  it("ignores other pointers, nonprimary/right/modified activation and already prevented starts", () => {
    const { helper, handle, pointer } = fixture({ size: "100px" })
    pointer("pointerdown", 0, { isPrimary: false }); pointer("pointerdown", 0, { button: 2 }); pointer("pointerdown", 0, { ctrlKey: true })
    expect(helper.state.dragging).toBe(false)
    handle.addEventListener("pointerdown", event => event.preventDefault(), { once: true, capture: true }); pointer("pointerdown")
    expect(helper.state.dragging).toBe(false)
    pointer("pointerdown"); pointer("pointerup", 50, { pointerId: 2 }); expect(helper.state.dragging).toBe(true)
    pointer("pointercancel"); expect(helper.state.dragging).toBe(false)
  })
  it.each(["pointercancel", "lostpointercapture", "Escape"] as const)("rolls back on %s with capture and end cleanup", async reason => {
    const { helper, handle, pointer, key, root } = fixture({ size: "100px" }), ended = vi.fn()
    root.addEventListener("mui:split-drag-end", ended)
    const down = pointer("pointerdown"); pointer("pointermove", 0, { clientX: down.clientX + 40, clientY: down.clientY }); await wait()
    expect(helper.size).toBe("140px")
    if (reason === "Escape") key("Escape")
    else if (reason === "lostpointercapture") handle.releasePointerCapture(1)
    else pointer(reason)
    expect(helper.size).toBe("100px"); expect(helper.state.dragging).toBe(false); expect(handle.hasPointerCapture(1)).toBe(false); expect(ended).toHaveBeenCalledOnce()
  })
  it("cancels on focus departure without stealing the new outside focus", async () => {
    const { helper, pointer, form } = fixture({ size: "100px" })
    const down = pointer("pointerdown"); pointer("pointermove", 0, { clientX: down.clientX + 30, clientY: down.clientY }); await wait()
    const outside = form.querySelector<HTMLElement>("[data-outside]")!; outside.focus()
    expect(helper.size).toBe("100px"); expect(helper.state.dragging).toBe(false); expect(document.activeElement).toBe(outside)
  })
  it("cancels on resize/direction/disable and keeps an explicit programmatic size authoritative", async () => {
    const { helper, pointer, dimensions, handle } = fixture({ size: "100px" })
    const down = pointer("pointerdown"); pointer("pointermove", 0, { clientX: down.clientX + 30, clientY: down.clientY }); await wait()
    dimensions.width = 300; helper.refresh(); expect(helper.size).toBe("100px"); expect(helper.state.dragging).toBe(false)
    pointer("pointerdown"); helper.set({ size: "90px", disabled: true })
    expect(helper.size).toBe("90px"); expect(handle.hasPointerCapture(1)).toBe(false); expect(helper.state.disabled).toBe(true)
  })
})

describe("lifecycle, reentrancy and native ownership", () => {
  it("supports keyboard-only enhancement if pointer capture is unavailable", () => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).setPointerCapture
    const { helper, key } = fixture()
    expect(helper.state.pointerSupported).toBe(false); key("ArrowRight"); expect(helper.state.pixels).toBeCloseTo(188)
  })
  it("allows a start listener to disable safely without stale capture or movement", () => {
    const { helper, root, handle, pointer } = fixture(), ended = vi.fn()
    root.addEventListener("mui:split-drag-start", () => helper.set({ disabled: true }))
    root.addEventListener("mui:split-drag-end", ended)
    pointer("pointerdown"); pointer("pointerup", 100)
    expect(helper.state.dragging).toBe(false); expect(handle.hasPointerCapture(1)).toBe(false); expect(helper.size).toBe(.5); expect(ended).toHaveBeenCalledOnce()
  })
  it("does not apply stale pointerup/end after a change listener replaces the size", () => {
    const { helper, root, pointer } = fixture({ size: "100px" }), ended = vi.fn()
    root.addEventListener("mui:split-change", () => helper.set({ size: "80px" }), { once: true })
    root.addEventListener("mui:split-drag-end", ended)
    const down = pointer("pointerdown"); pointer("pointerup", 0, { clientX: down.clientX + 50, clientY: down.clientY })
    expect(helper.size).toBe("80px"); expect(ended).toHaveBeenCalledOnce()
  })
  it("validates bad updates before canceling a healthy gesture", () => {
    const { helper, pointer, handle } = fixture()
    pointer("pointerdown"); expect(() => helper.set({ min: .8, max: .1 })).toThrow()
    expect(helper.state.dragging).toBe(true); expect(handle.hasPointerCapture(1)).toBe(true)
  })
  it("cleans up a failed native capture without announcing a successful drag", () => {
    const { helper, handle, pointer, root } = fixture(), start = vi.fn(), errors = vi.fn()
    root.addEventListener("mui:split-drag-start", start); root.addEventListener("mui:split-error", errors)
    Object.defineProperty(handle, "setPointerCapture", { configurable: true, value: () => { throw new DOMException("Capture failed", "NotFoundError") } })
    pointer("pointerdown")
    expect(helper.connected).toBe(false); expect(handle.hidden).toBe(true)
    expect(start).not.toHaveBeenCalled(); expect(errors).toHaveBeenCalledOnce()
  })
  it("lets an explicit update during cancellation win without a stale second end event", async () => {
    const { helper, pointer, root } = fixture({ size: "100px" }), ended = vi.fn()
    root.addEventListener("mui:split-drag-end", ended)
    const down = pointer("pointerdown"); pointer("pointermove", 0, { clientX: down.clientX + 30, clientY: down.clientY }); await wait()
    root.addEventListener("mui:split-change", event => { if ((event as CustomEvent).detail.source === "cancel") helper.set({ size: "80px" }) })
    pointer("pointercancel")
    expect(helper.size).toBe("80px"); expect(ended).toHaveBeenCalledOnce()
  })
  it("releases stale ARIA associations if an owned pane ID changes", async () => {
    const { helper, pane1, handle } = fixture()
    pane1.id = "changed-identifier"; await wait()
    expect(helper.connected).toBe(false); expect(handle.hasAttribute("aria-controls")).toBe(false)
  })
  it("suspends print interaction without losing desired size or disconnecting on block print layout", async () => {
    class Media extends EventTarget {
      matches = false
      set(value: boolean) { this.matches = value; this.dispatchEvent(new Event("change")) }
    }
    const media = new Media(); vi.stubGlobal("matchMedia", () => media)
    const { helper, root, pointer, handle } = fixture({ size: "100px" })
    pointer("pointerdown"); media.set(true); root.style.display = "block"; helper.refresh()
    expect(helper.connected).toBe(true); expect(helper.state.reason).toBe("print"); expect(handle.hasPointerCapture(1)).toBe(false)
    helper.set({ size: "120px" }); expect(helper.size).toBe("120px")
    root.style.display = "grid"; media.set(false); await wait()
    expect(helper.state.status).toBe("ready"); expect(helper.state.pixels).toBe(120)
  })
  it("rejects rotated/3D or decorated owned boxes and restores static fallback on observed failure", async () => {
    const { helper, root, handle } = fixture()
    root.style.transform = "rotate(30deg)"; await wait()
    expect(helper.connected).toBe(false); expect(handle.hidden).toBe(true); expect(handle.hasAttribute("role")).toBe(false)
    const second = fixture(); second.pane1.style.padding = "10px"
    expect(() => second.helper.refresh()).toThrow("outer pane"); expect(second.helper.connected).toBe(false)
  })
  it("restores only owned attributes/styles and retains original data on disposal", async () => {
    const { helper, root, pane1, handle, pointer } = fixture({ size: "100px" }), nodes = [...pane1.childNodes]
    const down = pointer("pointerdown"); pointer("pointermove", 0, { clientX: down.clientX + 50, clientY: down.clientY })
    root.style.setProperty("--mui-split-first", "77px"); helper.disconnect(); await wait()
    expect(root.style.getPropertyValue("--mui-split-first")).toBe("77px"); expect(handle.hidden).toBe(true)
    expect(pane1.hidden).toBe(false); expect(pane1.hasAttribute("inert")).toBe(false); expect([...pane1.childNodes]).toEqual(nodes)
    expect(handle.hasAttribute("role")).toBe(false); expect(helper.state.status).toBe("disconnected")
  })
  it("does not resurrect removed hosts or run queued geometry work after disconnect", async () => {
    const { helper, root, pointer } = fixture()
    pointer("pointerdown"); Resize.instances[0]!.emit(); root.remove(); await wait()
    expect(helper.connected).toBe(false); expect(root.isConnected).toBe(false)
    expect(() => helper.set({ size: .7 })).toThrow("disconnected")
  })
  it("rejects duplicate ownership and keeps nested separators independent", () => {
    const outer = fixture(), inner = fixture({ size: "80px" })
    expect(() => createSplit(outer.root)).toThrow("unowned")
    outer.pane2.firstElementChild!.append(inner.root)
    inner.key("ArrowRight"); expect(inner.helper.size).toBe("90px"); expect(outer.helper.size).toBe(.5)
    inner.pointer("pointerdown"); expect(outer.helper.state.dragging).toBe(false); inner.helper.disconnect()
    expect(outer.helper.connected).toBe(true)
  })
})
