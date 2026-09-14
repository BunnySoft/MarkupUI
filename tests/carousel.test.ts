import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { createContext, runInContext } from "node:vm"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  Carousel,
  CarouselControls,
  CarouselItem,
  CarouselReadout,
  CarouselViewport,
  registerCarousel,
} from "../src/components/carousel/index.js"
import * as carouselApi from "../src/components/carousel/index.js"
import { createCarousel } from "../src/components/carousel/controller.js"
import type { CarouselController, CarouselOptions } from "../src/components/carousel/controller.js"
import { ViewElement } from "../src/core/index.js"

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
  form.innerHTML = `<section data-part="carousel" aria-label="Examples">
    <div data-part="viewport" id="viewport-${id}" tabindex="0" aria-label="Slides">
      ${Array.from({ length: count }, (_, i) => `<article data-part="item"><h2>Slide ${i}</h2><label>Field ${i}<input name="field-${i}" value="value-${i}" required></label><button type="button">Inner action</button><template><p>Kept</p></template></article>`).join("")}
    </div><div data-part="controls" hidden><button type="button" data-part="prev">Previous</button><button type="button" data-part="next">Next</button>
    ${Array.from({ length: count }, (_, i) => `<button type="button" data-part="to" data-index="${i}">Slide ${i + 1}</button>`).join("")}
    <button type="button" data-part="toggle">Rotation</button></div><p data-part="readout">Scroll through slides.</p>
    </section><button type="button" id="outside-${id}">Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>('[data-part="carousel"]')!, viewport = root.querySelector<HTMLElement>('[data-part="viewport"]')!
  let width = 400, height = 240, deferred = false
  const vertical = () => root.matches('[data-state~="vertical"]')
  const rtl = () => viewport.style.direction === "rtl"
  const gap = () => Number.parseFloat(viewport.style.gap || "0")
  Object.defineProperties(viewport, { clientWidth: { get: () => width }, clientHeight: { get: () => height } })
  function measure(slide: HTMLElement) {
    Object.defineProperties(slide, {
      offsetWidth: { configurable: true, get: () => width }, offsetHeight: { configurable: true, get: () => height },
      offsetLeft: { configurable: true, get: () => vertical() ? 0 : [...viewport.children].indexOf(slide) * (width + gap()) * (rtl() ? -1 : 1) },
      offsetTop: { configurable: true, get: () => vertical() ? [...viewport.children].indexOf(slide) * (height + gap()) : 0 },
    })
  }
  ;[...viewport.children].forEach(node => measure(node as HTMLElement))
  const scroll = vi.fn((value: ScrollToOptions) => {
    if (!deferred || value.behavior === "instant") {
      viewport.scrollLeft = value.left ?? 0; viewport.scrollTop = value.top ?? 0
    }
  })
  viewport.scrollTo = scroll
  const controller = bind ? createCarousel(root, { ...options, onChange: change => {
    root.dispatchEvent(new CustomEvent("m:current-changed", { bubbles: true, detail: change }))
    options.onChange?.(change)
  } }) : null
  if (controller) controllers.push(controller)
  const helper = controller!
  function finish(index: number) {
    if (vertical()) viewport.scrollTop = index * (height + gap())
    else viewport.scrollLeft = index * (width + gap()) * (rtl() ? -1 : 1)
    viewport.dispatchEvent(new Event("scroll")); viewport.dispatchEvent(new Event("scrollend"))
  }
  return { root, viewport, form, helper, scroll, measure, finish,
    resize(w: number, h = height) { width = w; height = h; Resize.instances.at(-1)?.emit() },
    defer() { deferred = true },
    next: root.querySelector<HTMLButtonElement>('[data-part="next"]')!,
    prev: root.querySelector<HTMLButtonElement>('[data-part="prev"]')!,
    toggle: root.querySelector<HTMLButtonElement>('[data-part="toggle"]')!,
    readout: root.querySelector<HTMLElement>('[data-part="readout"]')!,
    outside: form.querySelector<HTMLButtonElement>(`#outside-${id}`)!,
  }
}
function elementFixture(settings: Partial<Pick<Carousel, "currentIndex" | "defaultIndex" | "direction" | "gap" | "smooth" | "autoplay" | "interval" | "disabled">> = {}, count = 3, connect = true) {
  const element = document.createElement("m-carousel") as Carousel
  element.setAttribute("aria-label", "Direct Carousel")
  Object.assign(element, settings)
  element.innerHTML = `<m-carousel-viewport id="direct-${++sequence}" tabindex="0" aria-label="Slides">
    ${Array.from({ length: count }, (_, i) => `<m-carousel-item key="key-${i}"><input value="Item ${i}"></m-carousel-item>`).join("")}
    </m-carousel-viewport><m-carousel-controls hidden>
    <button type="button" data-part="prev">Previous</button><button type="button" data-part="next">Next</button>
    <button type="button" data-part="toggle">Rotation</button></m-carousel-controls>
    <m-carousel-readout>Scroll through slides.</m-carousel-readout>`
  const viewport = element.querySelector<CarouselViewport>("m-carousel-viewport")!
  const gap = () => Number.parseFloat(viewport.style.gap || "0")
  const sign = () => viewport.style.direction === "rtl" ? -1 : 1
  let deferred = false
  Object.defineProperties(viewport, { clientWidth: { get: () => 400 }, clientHeight: { get: () => 240 } })
  function measure(item: Element) {
    Object.defineProperties(item, {
      offsetWidth: { configurable: true, get: () => 400 }, offsetHeight: { configurable: true, get: () => 240 },
      offsetLeft: { configurable: true, get: () => element.direction === "vertical" ? 0 : [...viewport.children].indexOf(item) * (400 + gap()) * sign() },
      offsetTop: { configurable: true, get: () => element.direction === "vertical" ? [...viewport.children].indexOf(item) * (240 + gap()) : 0 },
    })
  }
  ;[...viewport.children].forEach(measure)
  viewport.scrollTo = vi.fn(value => {
    if (typeof value === "object" && (!deferred || value.behavior === "instant")) {
      viewport.scrollLeft = value.left ?? 0
      viewport.scrollTop = value.top ?? 0
    }
  })
  if (connect) document.body.append(element)
  return { element, viewport, measure, defer() { deferred = true }, finish(index: number) {
    if (element.direction === "vertical") viewport.scrollTop = index * (240 + gap())
    else viewport.scrollLeft = index * (400 + gap()) * sign()
    viewport.dispatchEvent(new Event("scroll"))
    viewport.dispatchEvent(new Event("scrollend"))
  } }
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

describe("Carousel spacing", () => {
  it("defaults to zero and rejects invalid values before changing attributes or layout", () => {
    const { element, viewport } = elementFixture({ gap: 12.5, smooth: false })
    expect(new Carousel().gap).toBe(0)
    expect(element.gap).toBe(12.5)
    expect(viewport.style.gap).toBe("12.5px")
    for (const value of [-1, NaN, Infinity, -Infinity, null, "20", true]) {
      expect(() => Reflect.set(element, "gap", value)).toThrow(RangeError)
      expect(element.getAttribute("gap")).toBe("12.5")
      expect(viewport.style.gap).toBe("12.5px")
    }
    const detached = document.createElement("m-carousel") as Carousel
    for (const value of ["", "-1", "NaN", "Infinity", "12px"]) {
      detached.setAttribute("gap", value)
      expect(() => detached.gap).toThrow(RangeError)
    }
    const { helper } = fixture()
    expect(() => helper.set({ gap: -1 })).toThrow(RangeError)
    expect(helper.state.ready).toBe(true)
  })

  it("keeps settled identity and authored requests when spacing changes or is removed", () => {
    const { element, viewport } = elementFixture({ currentIndex: 1, gap: 12.5, smooth: false })
    element.to(2)
    const item = element.items[2]
    const changed = vi.fn()
    element.addEventListener("m:current-changed", changed)
    expect(viewport.scrollLeft).toBe(825)
    element.gap = 20
    expect(viewport.scrollLeft).toBe(840)
    expect(element.currentIndex).toBe(2)
    expect(element.items[2]).toBe(item)
    expect(element.getAttribute("current-index")).toBe("1")
    expect(changed).not.toHaveBeenCalled()
    element.removeAttribute("gap")
    expect(element.gap).toBe(0)
    expect(viewport.style.gap).toBe("0px")
    expect(viewport.scrollLeft).toBe(800)
    expect(changed).not.toHaveBeenCalled()
  })

  it("uses spaced positions for vertical and RTL keyboard navigation and native scrolling", () => {
    const { element, viewport, finish } = elementFixture({ gap: 20, smooth: false })
    viewport.style.direction = "rtl"
    element.refresh()
    viewport.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }))
    expect(element.currentIndex).toBe(1)
    expect(viewport.scrollLeft).toBe(-420)
    element.direction = "vertical"
    expect(viewport.scrollLeft).toBe(0)
    expect(viewport.scrollTop).toBe(260)
    viewport.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }))
    expect(viewport.scrollTop).toBe(520)
    finish(0)
    expect(element.currentIndex).toBe(0)
    expect(element.state.ready).toBe(true)
  })

  it("realigns spaced autoplay and wrapping commands after resize", () => {
    const { helper, viewport, resize } = fixture({ gap: 20, autoplay: true, interval: 1000, smooth: false })
    vi.advanceTimersByTime(1000)
    expect(helper.getCurrentIndex()).toBe(1)
    expect(viewport.scrollLeft).toBe(420)
    resize(500)
    expect(viewport.scrollLeft).toBe(520)
    helper.to(2)
    expect(viewport.scrollLeft).toBe(1040)
    helper.next()
    expect(helper.getCurrentIndex()).toBe(0)
    helper.prev()
    expect(helper.getCurrentIndex()).toBe(2)
    expect(viewport.scrollLeft).toBe(1040)
  })

  it("settles a pending request once when a gap change realigns it", () => {
    const { element, viewport, defer } = elementFixture()
    const changed = vi.fn()
    element.addEventListener("m:current-changed", changed)
    defer()
    element.next()
    expect(element.state.targetIndex).toBe(1)
    element.gap = 20
    expect(element.currentIndex).toBe(1)
    expect(viewport.scrollLeft).toBe(420)
    expect(changed).toHaveBeenCalledOnce()
    expect(changed.mock.calls[0]![0].detail.reason).toBe("api")
  })

  it("restores authored spacing and reconnects without replacing items", () => {
    const { element, viewport } = elementFixture({ gap: 20, smooth: false }, 3, false)
    viewport.style.setProperty("gap", "7px", "important")
    document.body.append(element)
    element.to(2)
    const item = element.items[2]
    element.remove()
    expect(viewport.style.gap).toBe("7px")
    expect(viewport.style.getPropertyPriority("gap")).toBe("important")
    document.body.append(element)
    expect(element.currentIndex).toBe(2)
    expect(element.items[2]).toBe(item)
    expect(viewport.scrollLeft).toBe(840)
    viewport.style.gap = "31px"
    element.remove()
    expect(viewport.style.gap).toBe("31px")
  })

  it("still rejects partial-width and nonuniform layouts", () => {
    const { element } = elementFixture({ gap: 20, smooth: false })
    Object.defineProperty(element.items[1]!, "offsetLeft", { configurable: true, get: () => 450 })
    expect(element.state.ready).toBe(false)
    element.next()
    expect(element.currentIndex).toBe(0)
  })
})

describe("Carousel current/default/native command contract", () => {
  it("registers the canonical Carousel element and light-DOM regions", () => {
    expect(Object.keys(carouselApi).sort()).toEqual([
      "Carousel", "CarouselControls", "CarouselItem", "CarouselReadout", "CarouselViewport", "registerCarousel",
    ])
    for (const type of [Carousel, CarouselViewport, CarouselItem, CarouselControls, CarouselReadout]) {
      expect(customElements.get(type.tag)).toBe(type)
      expect(Object.hasOwn(type, "tag")).toBe(true)
      expect(ViewElement.prototype.isPrototypeOf(type.prototype)).toBe(true)
      expect("meta" in type).toBe(false)
    }
  })

  it("validates all Carousel registrations before defining missing elements", () => {
    const constructors = new Map<string, CustomElementConstructor>([
      ["m-carousel-item", class extends HTMLElement {}],
    ])
    const define = vi.fn()
    expect(() => registerCarousel({
      get: (name) => constructors.get(name),
      define,
    })).toThrow("'m-carousel-item' is already defined")
    expect(define).not.toHaveBeenCalled()
  })

  it("owns the native controller from canonical Custom Element anatomy", () => {
    const element = document.createElement("m-carousel") as Carousel
    element.setAttribute("aria-label", "Examples")
    element.smooth = false
    element.innerHTML = `<m-carousel-viewport id="custom-viewport" tabindex="0" aria-label="Slides">
      <m-carousel-item>First</m-carousel-item>
      <m-carousel-item>Second</m-carousel-item>
    </m-carousel-viewport>
    <m-carousel-controls hidden>
      <button type="button" data-part="prev">Previous</button>
      <button type="button" data-part="next">Next</button>
    </m-carousel-controls>
    <m-carousel-readout>Scroll through slides.</m-carousel-readout>`
    const viewport = element.querySelector<CarouselViewport>("m-carousel-viewport")!
    Object.defineProperties(viewport, {
      clientWidth: { get: () => 400 },
      clientHeight: { get: () => 240 },
    })
    for (const [index, slide] of [...viewport.children].entries()) {
      Object.defineProperties(slide, {
        offsetWidth: { get: () => 400 },
        offsetHeight: { get: () => 240 },
        offsetLeft: { get: () => index * 400 },
        offsetTop: { get: () => 0 },
      })
    }
    viewport.scrollTo = vi.fn()
    document.body.append(element)

    expect(element.shadowRoot).toBeNull()
    expect(element.items).toEqual([...viewport.children])
    expect(element.state.total).toBe(2)
    expect(element.querySelector("m-carousel-readout")?.textContent).toBe("1 / 2")
    element.disabled = true
    expect(element.state.disabled).toBe(true)
  })

  it("uses stable authored CarouselItem nodes, controls and a single readout", () => {
    const { helper, root, viewport, readout } = fixture()
    expect(helper.getCurrentIndex()).toBe(0); expect(helper.state.total).toBe(3)
    expect(helper.slides[0]).toBe(viewport.firstElementChild)
    expect(root.getAttribute("role")).toBe("region"); expect(root.getAttribute("aria-roledescription")).toBe("carousel")
    expect(helper.slides[0]!.getAttribute("aria-label")).toBe("1 of 3")
    expect(readout.getAttribute("aria-live")).toBe("polite")
    expect(root.querySelector('[data-part="controls"]')!.hasAttribute("hidden")).toBe(false)
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
    root.addEventListener("m:current-changed", changed)
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
    helper.to(2); root.addEventListener("m:current-changed", change); resize(600)
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

describe("direct Carousel requests, properties and lifetime", () => {
  it("validates typed setters before reflecting them", () => {
    const element = document.createElement("m-carousel") as Carousel
    expect(element.currentIndex).toBe(0)
    expect(element.defaultIndex).toBe(0)
    expect(element.direction).toBe("horizontal")
    expect(element.loop && element.keyboard && element.smooth).toBe(true)
    expect(element.autoplay || element.disabled).toBe(false)
    expect(element.interval).toBe(5000)
    for (const key of ["currentIndex", "defaultIndex"] as const) {
      for (const value of [NaN, Infinity, 1.2, "2", null, Number.MAX_SAFE_INTEGER + 1]) {
        expect(() => Reflect.set(element, key, value)).toThrow(RangeError)
      }
      expect(element[key]).toBe(0)
    }
    for (const value of [0, 999, 1000.5, 2147483648, "1000", NaN]) expect(() => Reflect.set(element, "interval", value)).toThrow(RangeError)
    for (const key of ["loop", "keyboard", "smooth", "autoplay", "disabled"] as const) {
      expect(() => Reflect.set(element, key, "false")).toThrow(RangeError)
      element[key] = false
      expect(element.getAttribute(key)).toBe("false")
      element.setAttribute(key, "")
      expect(element[key]).toBe(true)
      element.setAttribute(key, "invalid")
      expect(() => element[key]).toThrow(RangeError)
      element.removeAttribute(key)
    }
    expect(() => Reflect.set(element, "direction", "diagonal")).toThrow(RangeError)
    expect(() => element.state).toThrow("not connected")
    expect(() => element.items).toThrow("not connected")
    expect(() => element.next()).toThrow("not connected")
  })

  it("reads settled index while clamped attribute/property requests are in flight", () => {
    const { element, defer, finish } = elementFixture()
    const changed = vi.fn()
    element.addEventListener("m:current-changed", changed)
    defer()
    element.currentIndex = 99
    expect(element.currentIndex).toBe(0)
    expect(element.state.targetIndex).toBe(2)
    expect(element.getAttribute("current-index")).toBe("99")
    expect(changed).not.toHaveBeenCalled()
    finish(2)
    expect(element.currentIndex).toBe(2)
    expect(changed).toHaveBeenCalledOnce()
    const event = changed.mock.calls[0]![0] as CustomEvent
    expect(event.bubbles).toBe(true)
    expect(event.cancelable || event.composed).toBe(false)
    expect(event.detail).toMatchObject({ index: 2, previousIndex: 0, reason: "api", item: element.items[2], previousItem: element.items[0] })
    expect(Object.isFrozen(event.detail)).toBe(true)
    element.setAttribute("current-index", "-99")
    expect(element.state.targetIndex).toBe(0)
    finish(0)
    expect(element.currentIndex).toBe(0)
  })

  it("never replays a stale request on unrelated properties, and repeats identical setter requests", () => {
    const { element, finish } = elementFixture({ currentIndex: 1, smooth: false })
    finish(2)
    element.interval = 1000
    element.defaultIndex = -20
    element.loop = false
    element.keyboard = false
    element.direction = "vertical"
    expect(element.currentIndex).toBe(2)
    expect(element.getAttribute("current-index")).toBe("1")
    element.currentIndex = 1
    expect(element.currentIndex).toBe(1)
    element.reset()
    expect(element.currentIndex).toBe(0)
    element.to(-1)
    expect(element.currentIndex).toBe(0)
    element.loop = true
    element.previous()
    expect(element.currentIndex).toBe(2)
  })

  it("preserves a pending notification when an unrelated setting realigns the viewport", () => {
    const { element, defer } = elementFixture({ currentIndex: 0 })
    const changed = vi.fn()
    element.addEventListener("m:current-changed", changed)
    defer()
    element.currentIndex = 2
    element.interval = 1500
    expect(element.currentIndex).toBe(2)
    expect(changed).toHaveBeenCalledOnce()
    expect(changed.mock.calls[0]![0].detail.reason).toBe("api")
  })

  it.each([0, 1])("keeps the native %s-item bounds and initial/default precedence", count => {
    const { element } = elementFixture({ currentIndex: 50, defaultIndex: -10, smooth: false }, count)
    expect(element.currentIndex).toBe(count - 1)
    element.currentIndex = -50
    element.to(100)
    element.reset()
    expect(element.currentIndex).toBe(count - 1)
    expect(element.state.playing).toBe(false)
    expect(element.state.targetIndex).toBeNull()
  })

  it("uses defaultIndex initially but only reset applies subsequent default changes", () => {
    const { element } = elementFixture({ defaultIndex: 2, smooth: false })
    expect(element.currentIndex).toBe(2)
    element.defaultIndex = 1
    expect(element.currentIndex).toBe(2)
    element.reset()
    expect(element.currentIndex).toBe(1)
  })

  it("clears an authored current request without navigating when the attribute is removed", () => {
    const { element } = elementFixture({ currentIndex: 1, defaultIndex: 2, smooth: false }, 3, false)
    element.removeAttribute("current-index")
    expect(element.currentIndex).toBe(2)
    document.body.append(element)
    element.currentIndex = 1
    element.removeAttribute("current-index")
    expect(element.currentIndex).toBe(1)
    element.interval = 1200
    expect(element.currentIndex).toBe(1)
  })

  it("retains keyed and node identity on refresh without touching native input values", () => {
    const { element, viewport, measure } = elementFixture({ smooth: false })
    element.to(1)
    const original = element.items[1]!
    const input = original.querySelector("input")!
    input.value = "Edited"
    viewport.prepend(original)
    element.refresh()
    expect(element.items[0]).toBe(original)
    expect(input.value).toBe("Edited")
    expect(original.current).toBe(true)
    expect(original.index).toBe(0)
    const replacement = document.createElement("m-carousel-item") as CarouselItem
    replacement.key = original.key
    measure(replacement)
    original.replaceWith(replacement)
    viewport.append(replacement)
    element.refresh()
    expect(element.currentIndex).toBe(2)
    expect(element.items[2]).toBe(replacement)
    expect(original.current).toBe(false)
    expect(original.index).toBe(-1)
    expect(replacement.previous).toBe(false)
    expect(element.items[1]!.previous).toBe(true)
    expect(element.items[0]!.next).toBe(true)
    expect(() => { replacement.key = "" }).toThrow(RangeError)
    replacement.key = element.items[0]!.key
    expect(() => element.refresh()).toThrow("unique")
  })

  it("restores owned output and resumes selected identity and manual pause on reconnect", () => {
    const { element, viewport } = elementFixture({ currentIndex: 0, autoplay: true, interval: 1000, smooth: false })
    element.to(2)
    element.pause()
    const selected = element.items[2]!, input = selected.querySelector("input")!
    input.value = "Retained"
    const observer = Resize.instances.at(-1)!
    element.remove()
    expect(vi.getTimerCount()).toBe(0)
    expect(element.querySelector("m-carousel-controls")!.hasAttribute("hidden")).toBe(true)
    expect(element.querySelector("m-carousel-readout")!.textContent).toBe("Scroll through slides.")
    observer.emit()
    viewport.dispatchEvent(new Event("scrollend"))
    viewport.prepend(selected)
    document.body.append(element)
    expect(element.currentIndex).toBe(0)
    expect(element.items[0]).toBe(selected)
    expect(element.state.paused).toBe(true)
    expect(input.value).toBe("Retained")
    vi.advanceTimersByTime(5000)
    expect(element.currentIndex).toBe(0)
    const changed = vi.fn()
    element.addEventListener("m:current-changed", changed)
    element.next()
    expect(changed).toHaveBeenCalledOnce()
    element.remove()
    element.currentIndex = 2
    document.body.append(element)
    expect(element.currentIndex).toBe(2)
  })

  it("does not replay disabled requests or disable content and fails closed without rotation controls", () => {
    const { element } = elementFixture({ smooth: false })
    element.disabled = true
    element.currentIndex = 2
    element.next()
    expect(element.currentIndex).toBe(0)
    expect(element.querySelector("input")!.disabled).toBe(false)
    element.disabled = false
    expect(element.currentIndex).toBe(0)
    element.querySelector('[data-part="toggle"]')!.remove()
    expect(() => { element.autoplay = true }).toThrow("pause/play")
    expect(element.hasAttribute("autoplay")).toBe(false)
  })

  it("does not mistake other components' short part markers for Carousel anatomy or controls", () => {
    const { element, viewport } = elementFixture({ smooth: false }, 3, false)
    const content = document.createElement("div")
    content.innerHTML = '<div data-part="viewport"><button type="button" data-part="next">Unrelated next</button></div><div data-part="controls"></div><div data-part="readout">Unrelated readout</div>'
    viewport.firstElementChild!.append(content)
    document.body.append(element)
    expect(element.state.total).toBe(3)
    content.querySelector("button")!.click()
    expect(element.currentIndex).toBe(0)
    expect(content.querySelector('[data-part="readout"]')!.textContent).toBe("Unrelated readout")
    element.querySelector<HTMLButtonElement>('m-carousel-controls [data-part="next"]')!.click()
    expect(element.currentIndex).toBe(1)
  })

  it("upgrades own properties before first connection without losing item identity", () => {
    const { element, viewport } = elementFixture({}, 3, false)
    Object.defineProperty(element, "currentIndex", { value: 2, configurable: true })
    Object.defineProperty(element, "smooth", { value: false, configurable: true })
    Object.defineProperty(element, "gap", { value: 20, configurable: true })
    const item = viewport.children[2] as CarouselItem
    Object.defineProperty(item, "key", { value: "late-key", configurable: true })
    document.body.append(element)
    expect(element.currentIndex).toBe(2)
    expect(element.smooth).toBe(false)
    expect(element.gap).toBe(20)
    expect(viewport.style.gap).toBe("20px")
    expect(viewport.scrollLeft).toBe(840)
    expect(Object.hasOwn(element, "gap")).toBe(false)
    expect(Object.hasOwn(element, "currentIndex")).toBe(false)
    expect(item.key).toBe("late-key")
    expect(Object.hasOwn(item, "key")).toBe(false)
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
    root.addEventListener("m:current-changed", changed); form.addEventListener("submit", submit)
    const button = root.querySelector<HTMLButtonElement>('[data-part="to"][data-index="2"]')!
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
    root.addEventListener("m:current-changed", changes)
    viewport.prepend(current); helper.refresh()
    expect(helper.getCurrentIndex()).toBe(0); expect(helper.slides[0]).toBe(current)
    expect(changes).toHaveBeenCalledOnce()
    expect(changes.mock.calls[0]![0].detail.previousIndex).toBe(1)
    current.remove(); helper.refresh()
    expect(helper.getCurrentIndex()).toBe(0); expect(current.matches('[data-state~="current"]')).toBe(false)
    viewport.replaceChildren(); helper.refresh(); expect(helper.getCurrentIndex()).toBe(-1)
  })
  it("adopts a new measured native item on explicit refresh, without cloning", () => {
    const { helper, viewport, measure } = fixture({ smooth: false }, 1)
    const slide = document.createElement("article"); slide.setAttribute("data-part", "item")
    slide.textContent = "New"; measure(slide); viewport.append(slide); helper.refresh(); helper.to(1)
    expect(helper.slides[1]).toBe(slide); expect(helper.getCurrentIndex()).toBe(1)
  })
  it("does not overwrite reentrant commands or resurrect a disconnected controller", () => {
    const { helper, root } = fixture({ smooth: false })
    const changed = vi.fn()
    root.addEventListener("m:current-changed", changed)
    root.addEventListener("m:current-changed", () => helper.to(2), { once: true })
    helper.to(1)
    expect(helper.getCurrentIndex()).toBe(2); expect(changed).toHaveBeenCalledTimes(2)
    expect(changed.mock.calls[0]![0].detail.index).toBe(1)
    expect(changed.mock.calls[1]![0].detail.index).toBe(2)
    root.addEventListener("m:current-changed", () => helper.disconnect(), { once: true })
    helper.to(0); expect(helper.connected).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
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
    expect(root.querySelector('[data-part="controls"]')!.hasAttribute("hidden")).toBe(true)
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
    expect(other.root.querySelector('[data-part="controls"]')!.hasAttribute("hidden")).toBe(true)
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
    expect(helper.slides[2]!.matches('[data-state~="previous"]')).toBe(true)
    expect(helper.slides[1]!.matches('[data-state~="next"]')).toBe(true)
    helper.set({ loop: false })
    expect(helper.slides[2]!.matches('[data-state~="previous"]')).toBe(false)
  })
  it("disconnects after a change listener removes the root", async () => {
    const { helper, root } = fixture({ smooth: false })
    root.addEventListener("m:current-changed", () => root.remove())
    helper.next()
    await Promise.resolve(); expect(helper.connected).toBe(false)
  })
  it("pauses when external CSS removes the rotation control container", () => {
    const { helper, root } = fixture({ autoplay: true, interval: 1000, smooth: false })
    root.querySelector<HTMLElement>('[data-part="controls"]')!.style.display = "none"
    vi.advanceTimersByTime(5000)
    expect(helper.getCurrentIndex()).toBe(0); expect(helper.state.pauseReasons).toContain("rotation-control")
  })
  it("retains a pending command notification when a current resize completes it", () => {
    const { helper, root, defer } = fixture(), changed = vi.fn()
    root.addEventListener("m:current-changed", changed)
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

  describe("Carousel shared-core distribution", () => {
    it("requires shared core first and registers only one canonical family with exact base identity", () => {
      const component = readFileSync("dist\\markup-ui-carousel.global.js", "utf8")
      const define = vi.fn()
      expect(() => runInContext(component, createContext({ HTMLElement, customElements: { get: vi.fn(), define } }))).toThrow("Load compatible markup-ui-core.global.js")
      expect(define).not.toHaveBeenCalled()
      const entries = new Map<string, unknown>()
      const context = createContext({ HTMLElement, customElements: {
        get: (name: string) => entries.get(name),
        define: (name: string, constructor: unknown) => { entries.set(name, constructor) },
      } })
      runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
      expect(entries.size).toBe(0)
      runInContext(component, context)
      expect([...entries.keys()]).toEqual(["m-carousel", "m-carousel-viewport", "m-carousel-item", "m-carousel-controls", "m-carousel-readout"])
      expect(runInContext("Object.keys(MarkupUICarousel).sort()", context)).toEqual(Object.keys(carouselApi).sort())
      expect(runInContext("MarkupUICore.ViewElement.prototype.isPrototypeOf(MarkupUICarousel.Carousel.prototype)", context)).toBe(true)
      expect(() => runInContext(component, context)).toThrow("already defined")
      const esm = readFileSync("dist\\markup-ui-carousel.js", "utf8")
      expect(esm).toContain('./markup-ui-core.js')
      for (const name of ["m-card", "m-avatar", "m-button", "m-popover"]) expect(component).not.toContain(`"${name}"`)
      for (const file of ["markup-ui-carousel.js", "markup-ui-carousel.global.js"]) {
        const componentSize = gzipSync(readFileSync(`dist\\${file}`), { level: 9 }).length
        const coreSize = gzipSync(readFileSync(`dist\\${file.replace("carousel", "core")}`), { level: 9 }).length
        expect(componentSize).toBeLessThanOrEqual(7000)
        expect(coreSize).toBeLessThanOrEqual(4000)
        expect(componentSize + coreSize).toBeLessThanOrEqual(11000)
      }
    })
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
    expect(css).toContain("m-carousel > :is(m-carousel-controls, m-carousel-readout)")
    expect(css).not.toContain("data-carousel")
  })
})
