import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createCarousel } from "../src/components/carousel/index.js"
import type { CarouselController, CarouselOptions } from "../src/components/carousel/index.js"

let controllers: CarouselController[] = [], sequence = 0
let media: EventTarget & { matches: boolean }, hidden = false
class Resize {
  static instances: Resize[] = []
  observe = vi.fn()
  disconnect = vi.fn()
  constructor(readonly callback: ResizeObserverCallback) { Resize.instances.push(this) }
  emit() { this.callback([], {} as ResizeObserver) }
}
function fixture(options: CarouselOptions = {}, count = 3, bind = true) {
  const form = document.createElement("form"), id = ++sequence
  form.innerHTML = `<section class="mui-carousel" data-carousel aria-label="Examples">
    <div data-carousel-viewport id="viewport-${id}" tabindex="0" aria-label="Slides">
      ${Array.from({ length: count }, (_, i) => `<article data-carousel-item><h2>Slide ${i}</h2><label>Field ${i}<input name="field-${i}" value="value-${i}" required></label><button type="button">Inner action</button><template><p>Kept</p></template></article>`).join("")}
    </div><div data-carousel-controls hidden><button type="button" data-carousel-prev>Previous</button><button type="button" data-carousel-next>Next</button>
    ${Array.from({ length: count }, (_, i) => `<button type="button" data-carousel-to="${i}">Slide ${i + 1}</button>`).join("")}
    <button type="button" data-carousel-toggle>Rotation</button></div><p data-carousel-readout>Scroll through slides.</p>
    </section><button type="button" id="outside-${id}">Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-carousel]")!, viewport = root.querySelector<HTMLElement>("[data-carousel-viewport]")!
  let width = 400, height = 240, deferred = false
  const vertical = () => root.dataset.carouselDirection === "vertical"
  const rtl = () => viewport.style.direction === "rtl"
  Object.defineProperties(viewport, { clientWidth: { get: () => width }, clientHeight: { get: () => height } })
  function measure(slide: HTMLElement) {
    Object.defineProperties(slide, {
      offsetWidth: { configurable: true, get: () => width }, offsetHeight: { configurable: true, get: () => height },
      offsetLeft: { configurable: true, get: () => vertical() ? 0 : [...viewport.children].indexOf(slide) * width * (rtl() ? -1 : 1) },
      offsetTop: { configurable: true, get: () => vertical() ? [...viewport.children].indexOf(slide) * height : 0 },
    })
  }
  ;[...viewport.children].forEach(node => measure(node as HTMLElement))
  const scroll = vi.fn((value: ScrollToOptions) => {
    if (!deferred || value.behavior === "instant") {
      viewport.scrollLeft = value.left ?? 0; viewport.scrollTop = value.top ?? 0
    }
  })
  viewport.scrollTo = scroll
  const controller = bind ? createCarousel(root, options) : null
  if (controller) controllers.push(controller)
  const helper = controller!
  function finish(index: number) {
    if (vertical()) viewport.scrollTop = index * height
    else viewport.scrollLeft = index * width * (rtl() ? -1 : 1)
    viewport.dispatchEvent(new Event("scroll")); viewport.dispatchEvent(new Event("scrollend"))
  }
  return { root, viewport, form, helper, scroll, measure, finish,
    resize(w: number, h = height) { width = w; height = h; Resize.instances.at(-1)?.emit() },
    defer() { deferred = true },
    next: root.querySelector<HTMLButtonElement>("[data-carousel-next]")!,
    prev: root.querySelector<HTMLButtonElement>("[data-carousel-prev]")!,
    toggle: root.querySelector<HTMLButtonElement>("[data-carousel-toggle]")!,
    readout: root.querySelector<HTMLElement>("[data-carousel-readout]")!,
    outside: form.querySelector<HTMLButtonElement>(`#outside-${id}`)!,
  }
}
beforeEach(() => {
  vi.useFakeTimers(); hidden = false
  media = Object.assign(new EventTarget(), { matches: false })
  vi.stubGlobal("matchMedia", () => media)
  vi.stubGlobal("ResizeObserver", Resize)
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden)
})
afterEach(() => {
  controllers.forEach(controller => controller.disconnect()); controllers = []; Resize.instances = []
  document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers()
})

describe("Carousel current/default/native command contract", () => {
  it("uses stable authored CarouselItem nodes, controls and a single readout", () => {
    const { helper, root, viewport, readout } = fixture()
    expect(helper.getCurrentIndex()).toBe(0); expect(helper.state.total).toBe(3)
    expect(helper.slides[0]).toBe(viewport.firstElementChild)
    expect(root.getAttribute("role")).toBe("region"); expect(root.getAttribute("aria-roledescription")).toBe("carousel")
    expect(helper.slides[0]!.getAttribute("aria-label")).toBe("1 of 3")
    expect(readout.getAttribute("aria-live")).toBe("polite")
    expect(root.querySelector("[data-carousel-controls]")!.hasAttribute("hidden")).toBe(false)
    expect(viewport.querySelector("[hidden],[inert],[aria-hidden]")).toBeNull()
  })
  it("separates initial current/default and clamps defaults instead of wrapping them", () => {
    const { helper } = fixture({ currentIndex: 1, defaultIndex: 7, smooth: false })
    expect(helper.getCurrentIndex()).toBe(1)
    helper.set({ defaultIndex: -5 }); expect(helper.getCurrentIndex()).toBe(1)
    helper.reset(); expect(helper.getCurrentIndex()).toBe(0)
    helper.set({ currentIndex: 99 }); expect(helper.getCurrentIndex()).toBe(2)
  })
  it.each([0, 1])("handles %s slides without rotation or navigation", count => {
    const { helper, next } = fixture({ autoplay: true }, count)
    helper.next(); helper.prev(); helper.to(-100)
    expect(helper.getCurrentIndex()).toBe(count - 1)
    expect(next.disabled).toBe(true); expect(helper.state.playing).toBe(false)
  })
  it("wraps positive and negative commands without cloning", () => {
    const { helper, viewport } = fixture({ smooth: false })
    const nodes = helper.slides
    helper.to(-7); expect(helper.getCurrentIndex()).toBe(2)
    helper.next(); expect(helper.getCurrentIndex()).toBe(0)
    helper.to(10); expect(helper.getCurrentIndex()).toBe(1)
    expect([...viewport.children]).toEqual(nodes)
  })
  it("uses disabled boundaries while retaining focused controls", () => {
    const { helper, next, prev, outside } = fixture({ loop: false, smooth: false })
    expect(prev.disabled).toBe(true); next.focus(); next.click(); next.click()
    expect(helper.getCurrentIndex()).toBe(2); expect(document.activeElement).toBe(next)
    expect(next.disabled).toBe(false); expect(next.getAttribute("aria-disabled")).toBe("true")
    next.click(); expect(helper.getCurrentIndex()).toBe(2)
    outside.focus(); vi.advanceTimersByTime(0); expect(next.disabled).toBe(true)
  })
  it("settles real native scrolling and emits one change", () => {
    const { helper, root, finish, readout } = fixture(), changed = vi.fn()
    root.addEventListener("mui:carousel-change", changed)
    finish(2)
    expect(helper.getCurrentIndex()).toBe(2); expect(readout.textContent).toBe("3 / 3")
    expect(changed).toHaveBeenCalledTimes(1)
    expect(changed.mock.calls[0]![0].detail.reason).toBe("scroll")
  })
  it("bases rapid commands on the pending target and ignores a stale scrollend", () => {
    const { helper, viewport, defer, finish } = fixture({ loop: false })
    defer(); helper.next(); helper.next()
    expect(helper.getCurrentIndex()).toBe(0); expect(helper.state.targetIndex).toBe(2)
    viewport.dispatchEvent(new Event("scrollend")); expect(helper.state.targetIndex).toBe(2)
    finish(2); expect(helper.getCurrentIndex()).toBe(2); expect(helper.state.targetIndex).toBeNull()
  })
  it("uses a bounded quiet-event debounce when scrollend is absent or scrolling is interrupted", () => {
    const { helper, viewport, defer } = fixture()
    defer(); helper.to(2)
    viewport.scrollLeft = 400; viewport.dispatchEvent(new Event("scroll"))
    vi.advanceTimersByTime(179); expect(helper.getCurrentIndex()).toBe(0)
    vi.advanceTimersByTime(1); expect(helper.getCurrentIndex()).toBe(1)
    expect(vi.getTimerCount()).toBe(0)
  })
  it("suspends zero layout and aligns the last command on resize", () => {
    const { helper, resize } = fixture({ smooth: false })
    resize(0); helper.to(2)
    expect(helper.state.ready).toBe(false); expect(helper.state.targetIndex).toBe(2)
    resize(500); expect(helper.getCurrentIndex()).toBe(2); expect(helper.state.ready).toBe(true)
  })
  it("keeps the current identity through resize without a second notification", () => {
    const { helper, resize, root, viewport } = fixture({ smooth: false }), change = vi.fn()
    helper.to(2); root.addEventListener("mui:carousel-change", change); resize(600)
    expect(viewport.scrollLeft).toBe(1200); expect(helper.getCurrentIndex()).toBe(2)
    expect(change).not.toHaveBeenCalled()
  })
  it("supports vertical and modern native negative RTL coordinates", () => {
    const { helper, viewport } = fixture({ smooth: false })
    viewport.style.direction = "rtl"; helper.refresh(); helper.to(2)
    expect(viewport.scrollLeft).toBe(-800); expect(helper.getCurrentIndex()).toBe(2)
    helper.set({ direction: "vertical" }); expect(viewport.scrollTop).toBe(480); expect(viewport.scrollLeft).toBe(0)
  })
  it("does not mix visual rectangles with layout CSS pixel coordinates", () => {
    const { helper, viewport } = fixture({ smooth: false })
    viewport.getBoundingClientRect = () => new DOMRect(0, 0, 800, 480)
    helper.to(2); expect(viewport.scrollLeft).toBe(800)
  })
  it.each([NaN, Infinity, 1.5, "2", null])("rejects invalid index %s atomically", index => {
    const { helper } = fixture()
    expect(() => helper.to(index as number)).toThrow()
    expect(() => helper.set({ currentIndex: index as number })).toThrow()
    expect(helper.getCurrentIndex()).toBe(0)
  })
})

describe("Carousel native focus, form and keyboard", () => {
  it("owns keys only on the viewport, never native editors or page cross-axis keys", () => {
    const { helper, viewport } = fixture({ smooth: false })
    const key = (target: Element, value: string) => { const event = new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true }); target.dispatchEvent(event); return event.defaultPrevented }
    expect(key(viewport.querySelector("input")!, "ArrowRight")).toBe(false)
    expect(key(viewport, "ArrowDown")).toBe(false)
    expect(key(viewport, "ArrowRight")).toBe(true); expect(helper.getCurrentIndex()).toBe(1)
    expect(key(viewport, "End")).toBe(true); expect(helper.getCurrentIndex()).toBe(2)
    helper.set({ keyboard: false }); expect(key(viewport, "Home")).toBe(false)
  })
  it("does not intercept wheel, pointer, text editing or change form membership", () => {
    const { helper, viewport, form, finish } = fixture(), input = viewport.querySelector("input")!
    const handler = vi.fn(); input.addEventListener("input", handler); input.value = "edited"; input.focus()
    finish(2)
    expect(document.activeElement).toBe(input); expect(input.closest("[inert],[hidden]")).toBeNull()
    const wheel = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true })
    viewport.dispatchEvent(wheel); expect(wheel.defaultPrevented).toBe(false)
    expect(new FormData(form).get("field-0")).toBe("edited"); expect(new FormData(form).get("field-2")).toBe("value-2")
    helper.refresh(); input.dispatchEvent(new Event("input")); expect(handler).toHaveBeenCalledOnce()
    expect(helper.slides[0]!.querySelector("input")).toBe(input)
  })
  it("clicks indicators once without tab roles, implicit form submit or automatic focus", () => {
    const { root, helper, form } = fixture({ smooth: false }), changed = vi.fn(), submit = vi.fn()
    root.addEventListener("mui:carousel-change", changed); form.addEventListener("submit", submit)
    const button = root.querySelector<HTMLButtonElement>('[data-carousel-to="2"]')!
    button.focus(); button.click()
    expect(helper.getCurrentIndex()).toBe(2); expect(document.activeElement).toBe(button)
    expect(button.getAttribute("aria-current")).toBe("true"); expect(button.hasAttribute("role")).toBe(false)
    expect(changed).toHaveBeenCalledOnce(); expect(submit).not.toHaveBeenCalled()
  })
})

describe("Carousel opt-in autoplay lifetime", () => {
  it("never rotates by default and requires a pause/play control", () => {
    const { helper } = fixture()
    vi.advanceTimersByTime(100000); expect(helper.getCurrentIndex()).toBe(0)
    const { root, toggle } = fixture({}, 3, false); toggle.remove()
    expect(() => createCarousel(root, { autoplay: true })).toThrow(/pause\/play/)
  })
  it("rotates on a completion-based interval, with live announcements off", () => {
    const { helper, readout } = fixture({ autoplay: true, interval: 1000, smooth: false })
    expect(readout.getAttribute("aria-live")).toBe("off")
    vi.advanceTimersByTime(1000); expect(helper.getCurrentIndex()).toBe(1)
    vi.advanceTimersByTime(1000); expect(helper.getCurrentIndex()).toBe(2)
    vi.advanceTimersByTime(1000); expect(helper.getCurrentIndex()).toBe(0)
  })
  it("preserves user pause across hover, focus and explicit refresh", () => {
    const { helper, root, outside, toggle } = fixture({ autoplay: true, interval: 1000, smooth: false })
    toggle.click(); expect(helper.state.paused).toBe(true)
    root.dispatchEvent(new Event("pointerenter")); root.dispatchEvent(new Event("pointerleave"))
    root.querySelector<HTMLInputElement>("input")!.focus(); outside.focus(); helper.refresh()
    vi.advanceTimersByTime(5000); expect(helper.getCurrentIndex()).toBe(0); expect(helper.state.paused).toBe(true)
    helper.play(); vi.advanceTimersByTime(1000); expect(helper.getCurrentIndex()).toBe(1)
  })
  it.each(["hover", "focus", "document-hidden", "reduced-motion"])("pauses for %s and resumes with a fresh interval", why => {
    const { helper, root, outside } = fixture({ autoplay: true, interval: 1000, smooth: false })
    if (why === "hover") root.dispatchEvent(new Event("pointerenter"))
    if (why === "focus") root.querySelector<HTMLInputElement>("input")!.focus()
    if (why === "document-hidden") { hidden = true; document.dispatchEvent(new Event("visibilitychange")) }
    if (why === "reduced-motion") { media.matches = true; media.dispatchEvent(new Event("change")) }
    expect(helper.state.pauseReasons).toContain(why)
    vi.advanceTimersByTime(5000); expect(helper.getCurrentIndex()).toBe(0)
    root.dispatchEvent(new Event("pointerleave")); outside.focus(); hidden = false; media.matches = false
    document.dispatchEvent(new Event("visibilitychange")); media.dispatchEvent(new Event("change"))
    vi.advanceTimersByTime(1000); expect(helper.getCurrentIndex()).toBe(1)
  })
  it("halts an in-flight automatic move when focus enters", () => {
    const { helper, defer, root, scroll } = fixture({ autoplay: true, interval: 1000 })
    defer(); vi.advanceTimersByTime(1000); expect(helper.state.targetIndex).toBe(1)
    root.querySelector<HTMLInputElement>("input")!.focus()
    expect(helper.state.targetIndex).toBeNull()
    expect(scroll.mock.calls.at(-1)![0].behavior).toBe("instant")
    vi.advanceTimersByTime(5000); expect(helper.getCurrentIndex()).toBe(0)
  })
  it("disables without disabling slide fields and cancels all observer/timer work", () => {
    const { helper, root } = fixture({ autoplay: true, interval: 1000, smooth: false })
    const observer = Resize.instances.at(-1)!
    helper.set({ disabled: true })
    expect(observer.disconnect).toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0)
    expect(root.querySelector("input")!.disabled).toBe(false)
    helper.next(); vi.advanceTimersByTime(5000); expect(helper.getCurrentIndex()).toBe(0)
    helper.set({ disabled: false }); vi.advanceTimersByTime(1000); expect(helper.getCurrentIndex()).toBe(1)
  })
  it("uses instant manual navigation and no autoplay under reduced motion", () => {
    media.matches = true
    const { helper, scroll } = fixture({ autoplay: true, interval: 1000 })
    helper.next(); expect(helper.getCurrentIndex()).toBe(1)
    expect(scroll.mock.calls.at(-1)![0].behavior).toBe("instant")
    vi.advanceTimersByTime(5000); expect(helper.getCurrentIndex()).toBe(1)
  })
})

describe("Carousel refresh, reentrancy and ownership", () => {
  it("retains current identity through reorder and chooses a clamped neighbor after removal", () => {
    const { helper, viewport, root } = fixture({ smooth: false }), changes = vi.fn()
    helper.to(1); const current = helper.slides[1]!
    root.addEventListener("mui:carousel-change", changes)
    viewport.prepend(current); helper.refresh()
    expect(helper.getCurrentIndex()).toBe(0); expect(helper.slides[0]).toBe(current)
    expect(changes).toHaveBeenCalledOnce()
    expect(changes.mock.calls[0]![0].detail.previousIndex).toBe(1)
    current.remove(); helper.refresh()
    expect(helper.getCurrentIndex()).toBe(0); expect(current.hasAttribute("data-carousel-current")).toBe(false)
    viewport.replaceChildren(); helper.refresh(); expect(helper.getCurrentIndex()).toBe(-1)
  })
  it("adopts a new measured native item on explicit refresh, without cloning", () => {
    const { helper, viewport, measure } = fixture({ smooth: false }, 1)
    const slide = document.createElement("article"); slide.setAttribute("data-carousel-item", "")
    slide.textContent = "New"; measure(slide); viewport.append(slide); helper.refresh(); helper.to(1)
    expect(helper.slides[1]).toBe(slide); expect(helper.getCurrentIndex()).toBe(1)
  })
  it("suppresses stale callbacks after reentrant disconnect or a new command", () => {
    const callback = vi.fn(), { helper, root } = fixture({ smooth: false, onUpdateCurrentIndex: callback })
    root.addEventListener("mui:carousel-change", () => helper.to(2), { once: true })
    helper.to(1)
    expect(helper.getCurrentIndex()).toBe(2); expect(callback).toHaveBeenCalledOnce()
    expect(callback.mock.calls[0]![0]).toBe(2)
    root.addEventListener("mui:carousel-change", () => helper.disconnect(), { once: true })
    helper.to(0); expect(callback).toHaveBeenCalledOnce()
  })
  it("restores only owned values on disconnect and supports clean rebinding", () => {
    const { helper, root, viewport, readout } = fixture()
    root.setAttribute("aria-roledescription", "Authored replacement")
    helper.slides[1]!.setAttribute("aria-label", "Application title")
    const nodes = [...viewport.children]
    helper.disconnect(); helper.disconnect()
    expect(root.getAttribute("aria-roledescription")).toBe("Authored replacement")
    expect(nodes[1]!.getAttribute("aria-label")).toBe("Application title")
    expect(readout.textContent).toBe("Scroll through slides.")
    expect(root.querySelector("[data-carousel-controls]")!.hasAttribute("hidden")).toBe(true)
    expect([...viewport.children]).toEqual(nodes); expect(vi.getTimerCount()).toBe(0)
    const second = createCarousel(root); controllers.push(second); expect(second.getCurrentIndex()).toBe(0)
  })
  it("auto-disconnects removed enabled roots and ignores stale scroll/resize callbacks", async () => {
    const { helper, root, viewport } = fixture({ autoplay: true, interval: 1000 })
    const observer = Resize.instances.at(-1)!
    root.remove(); await Promise.resolve()
    expect(helper.connected).toBe(false); observer.emit(); viewport.dispatchEvent(new Event("scrollend"))
    vi.advanceTimersByTime(10000); expect(vi.getTimerCount()).toBe(0)
  })
  it("rejects duplicate owners and invalid native anatomy before exposing controls", () => {
    const { root } = fixture(); expect(() => createCarousel(root)).toThrow(/unowned/)
    const other = fixture({}, 3, false); other.next.type = "submit"
    expect(() => createCarousel(other.root)).toThrow(/type=button/)
    expect(other.root.querySelector("[data-carousel-controls]")!.hasAttribute("hidden")).toBe(true)
  })
  it("requires explicit refresh after slide mutation and pauses autoplay meanwhile", () => {
    const { helper, viewport } = fixture({ autoplay: true, interval: 1000 })
    viewport.lastElementChild!.remove()
    expect(() => helper.next()).toThrow(/Refresh/)
    vi.advanceTimersByTime(5000); expect(helper.state.playing).toBe(false)
    helper.refresh(); expect(helper.state.total).toBe(2)
  })
  it("pauses in a closed details ancestor even when layout metrics remain nonzero", () => {
    const { helper, root, form } = fixture({ autoplay: true, interval: 1000, smooth: false })
    const details = document.createElement("details"); details.innerHTML = "<summary>Reveal</summary>"
    form.prepend(details); details.append(root); helper.refresh()
    expect(helper.state.ready).toBe(false)
    vi.advanceTimersByTime(5000); expect(helper.getCurrentIndex()).toBe(0)
    details.open = true; details.dispatchEvent(new Event("toggle"))
    vi.advanceTimersByTime(1000); expect(helper.getCurrentIndex()).toBe(1)
  })
  it("fails closed when the accessible rotation control is removed", () => {
    const { helper, toggle } = fixture({ autoplay: true, interval: 1000, smooth: false })
    toggle.remove(); vi.advanceTimersByTime(5000)
    expect(helper.getCurrentIndex()).toBe(0); expect(helper.state.pauseReasons).toContain("rotation-control")
    expect(() => helper.refresh()).toThrow(/pause\/play/)
  })
  it("preserves authored disabled action buttons", () => {
    const { root, next } = fixture({}, 3, false); next.disabled = true
    const helper = createCarousel(root, { smooth: false }); controllers.push(helper)
    expect(next.disabled).toBe(true); next.click(); expect(helper.getCurrentIndex()).toBe(0)
    helper.disconnect(); expect(next.disabled).toBe(true)
  })
  it("ignores a queued resize callback belonging to an earlier refresh", () => {
    const { helper, defer } = fixture()
    const previous = Resize.instances.at(-1)!
    helper.refresh(); defer(); helper.to(2); previous.emit()
    expect(helper.state.targetIndex).toBe(2); expect(helper.getCurrentIndex()).toBe(0)
  })
  it("exposes loop-aware CarouselItem adjacent markers without hiding slides", () => {
    const { helper } = fixture({ smooth: false })
    expect(helper.slides[2]!.hasAttribute("data-carousel-previous-slide")).toBe(true)
    expect(helper.slides[1]!.hasAttribute("data-carousel-next-slide")).toBe(true)
    helper.set({ loop: false })
    expect(helper.slides[2]!.hasAttribute("data-carousel-previous-slide")).toBe(false)
  })
  it("does not call an options callback after a change listener removes the root", async () => {
    const callback = vi.fn(), { helper, root } = fixture({ smooth: false, onUpdateCurrentIndex: callback })
    root.addEventListener("mui:carousel-change", () => root.remove())
    helper.next(); expect(callback).not.toHaveBeenCalled()
    await Promise.resolve(); expect(helper.connected).toBe(false)
  })
  it("pauses when external CSS removes the rotation control container", () => {
    const { helper, root } = fixture({ autoplay: true, interval: 1000, smooth: false })
    root.querySelector<HTMLElement>("[data-carousel-controls]")!.style.display = "none"
    vi.advanceTimersByTime(5000)
    expect(helper.getCurrentIndex()).toBe(0); expect(helper.state.pauseReasons).toContain("rotation-control")
  })
  it("retains a pending command notification when a current resize completes it", () => {
    const { helper, root, defer } = fixture(), changed = vi.fn()
    root.addEventListener("mui:carousel-change", changed)
    defer(); helper.to(2); Resize.instances.at(-1)!.emit()
    expect(helper.getCurrentIndex()).toBe(2); expect(changed).toHaveBeenCalledOnce()
    expect(changed.mock.calls[0]![0].detail.reason).toBe("api")
  })
})

describe("Carousel default styles", () => {
  const css = readFileSync(resolve("src", "components", "carousel", "carousel.css"), "utf8")

  it("keeps the Carousel stylesheet within its unchanged ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1500)
  })

  it("retains native one-slide scroll-snap geometry", () => {
    expect(css).toContain("scroll-snap-type: x mandatory")
    expect(css).toContain("flex: 0 0 100%")
    expect(css).toContain("scroll-snap-align: start")
    expect(css).toContain("overflow: auto")
    expect(css).not.toContain("transform:")
  })

  it("uses measured 28px controls without hiding their native labels", () => {
    expect(css).toContain("min-block-size: 28px")
    expect(css).toContain("min-inline-size: 28px")
    expect(css).toContain("padding: 0 10px")
    expect(css).not.toContain("font-size: 0")
    expect(css).not.toContain("text-indent")
  })

  it("keeps current, disabled, forced-color and print states explicit", () => {
    expect(css).toContain('[aria-current="true"]')
    expect(css).toContain("button:disabled")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("[data-carousel-readout] { display: none; }")
  })
})
