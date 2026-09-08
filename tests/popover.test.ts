import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createPopover } from "../src/components/popover/index.js"
import { createPopoverPositioner, ownedWrites } from "../src/components/popover/position.js"
import type { PopoverController, PopoverOptions } from "../src/components/popover/index.js"

const controllers: PopoverController[] = []
let open: WeakSet<HTMLElement>
const matches = HTMLElement.prototype.matches
const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, right: left + width, bottom: top + height, width, height, x: left, y: top, toJSON() {} }) as DOMRect
function toggle(panel: HTMLElement, show: boolean) {
  const event = new Event("beforetoggle", { cancelable: show })
  Object.assign(event, { oldState: open.has(panel) ? "open" : "closed", newState: show ? "open" : "closed" })
  if (!panel.dispatchEvent(event)) return
  if (show) open.add(panel)
  else open.delete(panel)
  panel.dispatchEvent(new Event("toggle"))
}
function nodes(mode: PopoverOptions["trigger"] = "click") {
  const trigger = document.createElement("button")
  trigger.type = "button"
  const panel = document.createElement("div")
  panel.id = `panel-${document.querySelectorAll(".mui-popover").length}`
  panel.className = "mui-popover"
  panel.setAttribute("popover", "auto")
  panel.innerHTML = "<p>Authored content</p><button type='button'>Action</button>"
  if (mode === "click") trigger.setAttribute("popovertarget", panel.id)
  trigger.getBoundingClientRect = () => rect(200, 200, 100, 30)
  panel.getBoundingClientRect = () => rect(0, 0, 160, 80)
  document.body.append(trigger, panel)
  return { trigger, panel }
}
function bind(options: PopoverOptions = {}) {
  const pair = nodes(options.trigger)
  const controller = createPopover(pair.trigger, pair.panel, options)
  controllers.push(controller)
  return { ...pair, controller }
}
function pointer(node: HTMLElement, type: string, relatedTarget: EventTarget | null = null, pointerType = "mouse") {
  const event = new Event(type)
  Object.assign(event, { pointerType, relatedTarget })
  node.dispatchEvent(event)
}
beforeEach(() => {
  vi.useFakeTimers()
  open = new WeakSet()
  vi.spyOn(HTMLElement.prototype, "matches").mockImplementation(function (selector) {
    return selector === ":popover-open" ? open.has(this) : matches.call(this, selector)
  })
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  })
  Object.defineProperty(HTMLElement.prototype, "showPopover", { configurable: true, value() { toggle(this, true) } })
  Object.defineProperty(HTMLElement.prototype, "hidePopover", { configurable: true, value() { toggle(this, false) } })
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(800)
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(600)
})
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  document.body.replaceChildren()
  delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover
  delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("Popover native visibility ownership (native API mocked, not browser certification)", () => {
  it("opens, closes, reports actual state and retains every authored node/listener", () => {
    const { trigger, panel, controller } = bind()
    const child = panel.firstChild
    const action = vi.fn()
    panel.addEventListener("click", action)
    expect(controller.open()).toBe(true)
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id)
    expect(controller.show).toBe(true)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(controller.setShow(false)).toBe(false)
    panel.click()
    expect(action).toHaveBeenCalledOnce()
    expect(panel.firstChild).toBe(child)
    expect(controller.show).toBe(false)
  })
  it("never synthesizes click or keyboard activation, including modified native button clicks", () => {
    const { trigger, controller } = bind()
    trigger.dispatchEvent(new MouseEvent("click", { ctrlKey: true, bubbles: true }))
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    expect(controller.show).toBe(false)
  })
  it("respects author cancellation of native opening and adds no custom update event", () => {
    const { panel, controller } = bind()
    panel.addEventListener("beforetoggle", event => event.preventDefault())
    const notification = vi.fn()
    panel.addEventListener("mui:change:show", notification)
    expect(controller.open()).toBe(false)
    expect(notification).not.toHaveBeenCalled()
    expect(panel.style.left).toBe("")
  })
  it("uses current native state after a coalesced stale toggle and close/reopen", async () => {
    const { panel, controller, trigger } = bind()
    controller.open()
    controller.close()
    controller.open()
    panel.dispatchEvent(Object.assign(new Event("toggle"), { newState: "closed" }))
    await Promise.resolve()
    expect(controller.show).toBe(true)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(panel.style.left).not.toBe("")
  })
  it("disabled closes immediately and prevents declarative/external opening", () => {
    const { panel, controller } = bind()
    controller.open()
    controller.disabled = true
    expect(controller.show).toBe(false)
    panel.showPopover()
    expect(controller.show).toBe(false)
    controller.disabled = false
    expect(controller.show).toBe(false)
    expect(controller.open()).toBe(true)
  })
  it("observes native disabled fieldsets while open", async () => {
    const { trigger, panel, controller } = bind()
    const fieldset = document.createElement("fieldset")
    document.body.append(fieldset)
    fieldset.append(trigger, panel)
    controller.open()
    fieldset.disabled = true
    await Promise.resolve()
    expect(controller.show).toBe(false)
  })
  it("restores only controlled ARIA/styles and retains author changes", () => {
    const { trigger, panel } = nodes()
    trigger.setAttribute("aria-controls", "other")
    trigger.setAttribute("aria-describedby", "description")
    trigger.setAttribute("aria-expanded", "author")
    panel.style.left = "2px"
    const controller = createPopover(trigger, panel)
    controllers.push(controller)
    controller.open()
    expect(trigger.getAttribute("aria-controls")).toBe(`other ${panel.id}`)
    panel.style.color = "red"
    panel.style.top = "17px"
    controller.disconnect()
    expect(trigger.getAttribute("aria-controls")).toBe("other")
    expect(trigger.getAttribute("aria-describedby")).toBe("description")
    expect(trigger.getAttribute("aria-expanded")).toBe("author")
    expect(panel.style.left).toBe("2px")
    expect(panel.style.top).toBe("17px")
    expect(panel.style.color).toBe("red")
    expect(panel.hasAttribute("data-popover-placement")).toBe(false)
  })
  it("rejects duplicate ownership and can reconnect or bind a replacement after disposal", () => {
    const { trigger, panel, controller } = bind()
    expect(() => createPopover(trigger, panel)).toThrow("active controller")
    controller.connect()
    controller.disconnect()
    controller.connect()
    expect(controller.open()).toBe(true)
    controller.disconnect()
    const next = createPopover(trigger, panel)
    controllers.push(next)
    expect(next.open()).toBe(true)
  })
  it("disconnects detached pending/open instances and cancels all delayed work", async () => {
    const { trigger, panel, controller } = bind({ trigger: "hover" })
    pointer(trigger, "pointerenter")
    trigger.remove()
    await Promise.resolve()
    vi.advanceTimersByTime(500)
    expect(controller.connected).toBe(false)
    expect(controller.show).toBe(false)
    expect(panel.hasAttribute("style")).toBe(false)
  })
  it("releases active positioning and queued microtasks on disconnect", async () => {
    const { controller, panel, trigger } = bind()
    controller.open()
    window.dispatchEvent(new Event("resize"))
    controller.disconnect()
    vi.runAllTimers()
    await Promise.resolve()
    expect(panel.hasAttribute("style")).toBe(false)
    expect(trigger.hasAttribute("aria-expanded")).toBe(false)
  })
  it("surfaces invalid live anatomy and disconnects rather than keeping stale ID controls", async () => {
    const { controller, panel } = bind()
    const error = vi.fn()
    panel.addEventListener("mui:popover-error", error)
    controller.open()
    panel.id = "changed"
    await Promise.resolve()
    expect(controller.connected).toBe(false)
    expect(error).toHaveBeenCalledOnce()
    const removed = bind()
    removed.controller.open()
    removed.panel.removeAttribute("popover")
    await Promise.resolve()
    expect(removed.controller.connected).toBe(false)
  })
  it.each(["click", "hover", "focus", "manual"] as const)("rejects a changed ID even when the %s target remains otherwise valid", async mode => {
    const { controller, panel, trigger } = bind({ trigger: mode })
    controller.open()
    panel.id = "new-valid-id"
    if (mode === "click") trigger.setAttribute("popovertarget", panel.id)
    await Promise.resolve()
    expect(controller.connected).toBe(false)
    expect(trigger.hasAttribute("aria-controls")).toBe(false)
    expect(() => controller.connect()).toThrow("unique ID")
  })
  it("supports static readable content when Popover is unsupported without ARIA lies", () => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover
    delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover
    const { controller, trigger, panel } = bind()
    expect(controller.supported).toBe(false)
    expect(controller.open()).toBe(false)
    expect(trigger.hasAttribute("aria-expanded")).toBe(false)
    expect(panel.hidden).toBe(false)
    expect(panel.hasAttribute("popover")).toBe(false)
    expect(panel.textContent).toContain("Authored content")
    controller.disconnect()
    expect(panel.getAttribute("popover")).toBe("auto")
  })
  it("keeps independent and nested node ownership local", () => {
    vi.stubGlobal("ResizeObserver", undefined)
    const parent = bind()
    const child = bind()
    parent.panel.append(child.trigger, child.panel)
    parent.controller.open()
    child.controller.open()
    child.controller.disconnect()
    expect(parent.controller.show).toBe(true)
    expect(parent.trigger.getAttribute("aria-expanded")).toBe("true")
    child.controller.connect()
    child.controller.open()
    parent.controller.close()
    expect(child.controller.show).toBe(false)
  })
  it("rejects portalled nested panels rather than claiming native source ancestry support", () => {
    const parent = bind({ trigger: "focus" })
    const { trigger, panel } = nodes()
    parent.panel.append(trigger)
    expect(() => createPopover(trigger, panel)).toThrow("portalled nesting")
  })
  it.each(["span", "div"])("rejects fake focusable %s triggers", tag => {
    const { trigger, panel } = nodes("hover")
    const fake = document.createElement(tag)
    fake.tabIndex = 0
    trigger.replaceWith(fake)
    expect(() => createPopover(fake, panel, { trigger: "hover" })).toThrow("native focusable")
  })
  it("rejects missing/duplicate anatomy, submit buttons and competing declarative modes", () => {
    const { trigger, panel } = nodes()
    panel.removeAttribute("popover")
    expect(() => createPopover(trigger, panel)).toThrow("light-DOM")
    panel.setAttribute("popover", "auto")
    trigger.type = "submit"
    expect(() => createPopover(trigger, panel)).toThrow("type=button")
    trigger.type = "button"
    expect(() => createPopover(trigger, panel, { trigger: "hover" })).toThrow("Only click")
    const duplicate = document.createElement("div")
    duplicate.id = panel.id
    document.body.append(duplicate)
    expect(() => createPopover(trigger, panel)).toThrow("unique ID")
  })
  it("rejects legacy owned anatomy and already-open setup", () => {
    const { trigger, panel } = nodes()
    panel.showPopover()
    expect(() => createPopover(trigger, panel)).toThrow("while closed")
    panel.hidePopover()
    const legacy = document.createElement("mui-popover")
    document.body.append(legacy)
    legacy.append(trigger, panel)
    expect(() => createPopover(trigger, panel)).toThrow("legacy")
  })
  it.each([{ delay: NaN }, { duration: -1 }, { margin: Infinity }, { gap: 60001 }, { placement: "bad" }, { trigger: "contextmenu" }])("validates finite options %j", options => {
    const { trigger, panel } = nodes()
    expect(() => createPopover(trigger, panel, options as PopoverOptions)).toThrow()
  })
})

describe("Popover timing and native focus", () => {
  it("delays hover, cancels gap dismissal upon panel entry and hides after leaving both", () => {
    const options = { trigger: "hover", delay: 100, duration: 150 } as const
    const { trigger, panel, controller } = bind(options)
    Object.assign(options, { delay: 1, duration: 1 })
    pointer(trigger, "pointerenter")
    vi.advanceTimersByTime(99)
    expect(controller.show).toBe(false)
    vi.advanceTimersByTime(1)
    expect(controller.show).toBe(true)
    pointer(trigger, "pointerleave")
    vi.advanceTimersByTime(80)
    pointer(panel, "pointerenter")
    vi.advanceTimersByTime(200)
    expect(controller.show).toBe(true)
    pointer(panel, "pointerleave")
    vi.advanceTimersByTime(150)
    expect(controller.show).toBe(false)
  })
  it("cancels a pending show on rapid leave, close, or disconnect", () => {
    const { trigger, controller } = bind({ trigger: "hover" })
    pointer(trigger, "pointerenter")
    pointer(trigger, "pointerleave")
    vi.advanceTimersByTime(101)
    expect(controller.show).toBe(false)
    pointer(trigger, "pointerenter")
    controller.close()
    vi.advanceTimersByTime(101)
    expect(controller.show).toBe(false)
    pointer(trigger, "pointerenter")
    controller.disconnect()
    vi.advanceTimersByTime(101)
    expect(controller.show).toBe(false)
  })
  it("ignores touch-generated hover", () => {
    const { trigger, controller } = bind({ trigger: "hover" })
    pointer(trigger, "pointerenter", null, "touch")
    vi.advanceTimersByTime(101)
    expect(controller.show).toBe(false)
  })
  it("keeps focus transfer trigger to panel, then closes when focus leaves", () => {
    const { trigger, panel, controller } = bind({ trigger: "focus" })
    trigger.focus()
    expect(controller.show).toBe(true)
    panel.querySelector("button")!.focus()
    vi.advanceTimersByTime(101)
    expect(controller.show).toBe(true)
    const outside = document.createElement("button")
    document.body.append(outside)
    outside.focus()
    vi.advanceTimersByTime(101)
    expect(controller.show).toBe(false)
  })
  it("does not cancel normal or modified link navigation", () => {
    const { trigger, panel } = nodes("focus")
    const link = document.createElement("a")
    link.href = "#target"
    link.getBoundingClientRect = trigger.getBoundingClientRect
    trigger.replaceWith(link)
    const controller = createPopover(link, panel, { trigger: "focus" })
    controllers.push(controller)
    const event = new MouseEvent("click", { ctrlKey: true, cancelable: true })
    link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
})

describe("local viewport positioning and external distribution", () => {
  it.each(["top", "bottom", "left", "right", "top-start", "top-end", "bottom-start", "bottom-end", "left-start", "left-end", "right-start", "right-end"] as const)("positions %s without changing core geometry", placement => {
    const { controller, panel } = bind({ placement, positioning: "fallback" })
    expect(controller.open()).toBe(true)
    expect(panel.dataset.popoverPlacement).toBe(placement)
    expect(Number.parseFloat(panel.style.left)).toBeGreaterThanOrEqual(8)
    expect(Number.parseFloat(panel.style.top)).toBeGreaterThanOrEqual(8)
  })
  it("flips only when the opposite side has more room and honors flip=false", () => {
    const { controller, trigger, panel } = bind({ placement: "bottom" })
    trigger.getBoundingClientRect = () => rect(200, 565, 100, 30)
    controller.open()
    expect(panel.dataset.popoverPlacement).toBe("top")
    controller.disconnect()
    const other = createPopover(trigger, panel, { placement: "bottom", flip: false })
    controllers.push(other)
    other.open()
    expect(panel.dataset.popoverPlacement).toBe("bottom")
    expect(panel.dataset.popoverArrow).toBe("hidden")
  })
  it("maps horizontal start logically in RTL and vertical start to the top", () => {
    const { controller, trigger, panel } = bind({ placement: "bottom-start" })
    trigger.style.direction = "rtl"
    controller.open()
    expect(panel.style.left).toBe("140px")
  })
  it("uses visual viewport offsets/bounds and fallback when pinched", () => {
    vi.stubGlobal("visualViewport", Object.assign(new EventTarget(), { offsetLeft: 100, offsetTop: 100, width: 300, height: 250, scale: 2 }))
    const { controller, panel } = bind()
    controller.open()
    expect(panel.style.getPropertyValue("--mui-popover-available-width")).toBe("284px")
    expect(panel.dataset.popoverPositioning).toBe("fallback")
    expect(Number.parseFloat(panel.style.left)).toBeGreaterThanOrEqual(108)
  })
  it("closes if the anchor is fully clipped or geometry is invalid", () => {
    const { controller, trigger } = bind()
    const scroller = document.createElement("div")
    scroller.style.overflowY = "auto"
    scroller.getBoundingClientRect = () => rect(0, 0, 800, 150)
    document.body.append(scroller)
    scroller.append(trigger)
    expect(controller.open()).toBe(false)
    scroller.style.overflowY = "visible"
    trigger.getBoundingClientRect = () => rect(NaN, 20, 100, 20)
    expect(controller.open()).toBe(false)
  })
  it("does not apply an outer DOM clip above an open top-layer ancestor", () => {
    const outer = bind()
    outer.panel.getBoundingClientRect = () => rect(200, 150, 300, 300)
    outer.panel.style.overflowX = "auto"
    outer.panel.style.overflowY = "auto"
    const clipper = document.createElement("div")
    clipper.style.overflowX = "hidden"
    clipper.style.overflowY = "hidden"
    clipper.getBoundingClientRect = () => rect(0, 0, 100, 100)
    document.body.append(clipper)
    clipper.append(outer.panel)
    const inner = bind()
    outer.panel.append(inner.trigger, inner.panel)
    expect(outer.controller.open()).toBe(true)
    expect(inner.controller.open()).toBe(true)
  })
  it("checks every anchor capability and falls back if one is absent", () => {
    const supports = vi.fn((name: string) => name !== "top")
    vi.stubGlobal("CSS", { supports })
    const { trigger, panel } = nodes()
    const positioner = createPopoverPositioner(trigger, panel, { placement: "bottom", gap: 8, margin: 8, flip: true, positioning: "auto" })
    positioner.update()
    expect(supports.mock.calls.map(call => call[0])).toEqual(["anchor-name", "position-anchor", "left", "top"])
    expect(panel.dataset.popoverPositioning).toBe("fallback")
    positioner.clear()
    expect(panel.hasAttribute("style")).toBe(false)
  })
  it("preserves authored attribute changes during restoration", () => {
    const node = document.createElement("div")
    const writes = ownedWrites()
    writes.attr(node, "data-test", "owned")
    node.setAttribute("data-test", "author")
    writes.restore()
    expect(node.getAttribute("data-test")).toBe("author")
    writes.style(node, "left", "10px")
    node.style.setProperty("left", "10px", "important")
    writes.restore()
    expect(node.style.getPropertyPriority("left")).toBe("important")
  })
  it("exports standalone assets, external fallback/print/motion CSS and no registry", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./popover"].import).toBe("./dist/markup-ui-popover.js")
    const css = readFileSync("src/components/popover/popover.css", "utf8")
    expect(css).toContain("prefers-reduced-motion")
    expect(css).toContain("forced-colors")
    expect(css).toContain("@media print")
    expect(css).not.toContain("display: none;\n}")
    const source = readFileSync("src/components/popover/popover.ts", "utf8")
    expect(source).not.toContain("customElements")
    expect(source).not.toContain("innerHTML")
    expect(source).not.toContain('"keydown"')
    expect(source).not.toContain('"click" ,')
  })
})
