import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createTooltip } from "../src/components/tooltip/index.js"
import { createPopover } from "../src/components/popover/index.js"
import type { TooltipController, TooltipOptions } from "../src/components/tooltip/index.js"

const controllers: TooltipController[] = []
const matches = HTMLElement.prototype.matches
let open: WeakSet<HTMLElement>
const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, right: left + width, bottom: top + height, width, height, x: left, y: top, toJSON() {} }) as DOMRect
function toggle(panel: HTMLElement, show: boolean) {
  const event = Object.assign(new Event("beforetoggle", { cancelable: show }), {
    oldState: open.has(panel) ? "open" : "closed", newState: show ? "open" : "closed",
  })
  if (!panel.dispatchEvent(event)) return
  if (show) open.add(panel)
  else open.delete(panel)
  panel.dispatchEvent(new Event("toggle"))
}
function nodes() {
  const trigger = document.createElement("button")
  trigger.type = "button"
  trigger.textContent = "A meaningful action"
  const panel = document.createElement("span")
  panel.id = `tip-${document.querySelectorAll(".mui-tooltip").length}`
  panel.className = "mui-popover mui-tooltip"
  panel.setAttribute("role", "tooltip")
  panel.setAttribute("popover", "manual")
  panel.innerHTML = "Authored <strong>description</strong>."
  trigger.getBoundingClientRect = () => rect(200, 200, 100, 30)
  panel.getBoundingClientRect = () => rect(0, 0, 160, 50)
  document.body.append(trigger, panel)
  return { trigger, panel }
}
function bind(options: TooltipOptions = {}) {
  const pair = nodes()
  const controller = createTooltip(pair.trigger, pair.panel, options)
  controllers.push(controller)
  return { ...pair, controller }
}
function pointer(node: HTMLElement, type: string, relatedTarget: EventTarget | null = null, pointerType = "mouse") {
  node.dispatchEvent(Object.assign(new Event(type), { pointerType, relatedTarget }))
}
function escape() {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
  document.dispatchEvent(event)
  return event
}
beforeEach(() => {
  vi.useFakeTimers()
  open = new WeakSet()
  vi.spyOn(HTMLElement.prototype, "matches").mockImplementation(function (selector) {
    return selector === ":popover-open" ? open.has(this) : matches.call(this, selector)
  })
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} })
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

describe("Tooltip description semantics over shared native Popover", () => {
  it("owns only its describedby token, not expanded/controls/haspopup or trigger names", () => {
    const { trigger, panel } = nodes()
    trigger.setAttribute("aria-describedby", "existing")
    trigger.setAttribute("aria-expanded", "author")
    trigger.setAttribute("aria-controls", "other")
    const controller = createTooltip(trigger, panel)
    controllers.push(controller)
    expect(trigger.getAttribute("aria-describedby")).toBe(`existing ${panel.id}`)
    controller.open()
    expect(trigger.getAttribute("aria-expanded")).toBe("author")
    expect(trigger.getAttribute("aria-controls")).toBe("other")
    expect(trigger.hasAttribute("aria-haspopup")).toBe(false)
    expect(trigger.hasAttribute("aria-label")).toBe(false)
    expect(panel.hasAttribute("aria-label")).toBe(false)
    controller.disconnect()
    expect(trigger.getAttribute("aria-describedby")).toBe("existing")
    expect(panel.id).toBe("tip-0")
    expect(panel.getAttribute("role")).toBe("tooltip")
  })
  it("opens without native invoker/source or synthesized click/key actions", () => {
    const { trigger, panel, controller } = bind()
    const show = vi.spyOn(panel, "showPopover")
    expect(controller.open()).toBe(true)
    expect(show).toHaveBeenCalledWith()
    expect(trigger.hasAttribute("aria-expanded")).toBe(false)
    expect(trigger.hasAttribute("aria-controls")).toBe(false)
    controller.close()
    trigger.click()
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
    expect(controller.show).toBe(false)
  })
  it("preserves existing descriptions, concurrently appended tokens and original formatting", () => {
    const { trigger, panel } = nodes()
    trigger.setAttribute("aria-describedby", " first   second ")
    const controller = createTooltip(trigger, panel)
    controllers.push(controller)
    controller.disconnect()
    expect(trigger.getAttribute("aria-describedby")).toBe(" first   second ")
    controller.connect()
    trigger.setAttribute("aria-describedby", `${trigger.getAttribute("aria-describedby")} new-author`)
    controller.disconnect()
    expect(trigger.getAttribute("aria-describedby")).toBe("first second new-author")
  })
  it("does not remove a tooltip ID that was already authored or restore author-deleted attributes", () => {
    const { trigger, panel } = nodes()
    trigger.setAttribute("aria-describedby", panel.id)
    const controller = createTooltip(trigger, panel)
    controllers.push(controller)
    controller.disconnect()
    expect(trigger.getAttribute("aria-describedby")).toBe(panel.id)
    trigger.removeAttribute("aria-describedby")
    controller.connect()
    trigger.removeAttribute("aria-describedby")
    controller.disconnect()
    expect(trigger.hasAttribute("aria-describedby")).toBe(false)
  })
  it("keeps original markup, listeners and inert authored templates unchanged", () => {
    const { trigger, panel } = nodes()
    const template = document.createElement("template")
    template.innerHTML = "<button type='button'>Not instantiated</button>"
    panel.append(template)
    const child = panel.querySelector("strong")
    const listener = vi.fn()
    child!.addEventListener("click", listener)
    const controller = createTooltip(trigger, panel)
    controllers.push(controller)
    controller.open()
    ;(child as HTMLElement).click()
    controller.close()
    expect(listener).toHaveBeenCalledOnce()
    expect(panel.querySelector("strong")).toBe(child)
    expect(panel.lastElementChild).toBe(template)
    expect(template.content.querySelector("button")).not.toBeNull()
  })
  it("uses readable static fallback with descriptions when native API is incomplete", () => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover
    const { trigger, panel, controller } = bind()
    expect(controller.supported).toBe(false)
    expect(controller.open()).toBe(false)
    expect(panel.hasAttribute("popover")).toBe(false)
    expect(trigger.getAttribute("aria-describedby")).toBe(panel.id)
    expect(trigger.hasAttribute("aria-expanded")).toBe(false)
    controller.disconnect()
    expect(panel.getAttribute("popover")).toBe("manual")
    expect(trigger.hasAttribute("aria-describedby")).toBe(false)
    controller.connect()
    expect(trigger.getAttribute("aria-describedby")).toBe(panel.id)
  })
  it("rejects auto/hint popovers instead of causing peer auto-dismiss surprises", () => {
    const { trigger, panel } = nodes()
    for (const mode of ["auto", "hint"]) {
      panel.setAttribute("popover", mode)
      expect(() => createTooltip(trigger, panel)).toThrow("popover=manual")
    }
  })
  it.each([
    "<button type='button'>Action</button>", "<a href='#'>Link</a>", "<input>",
    "<textarea></textarea>", "<select><option>Option</option></select>",
    "<details><summary>Disclosure</summary></details>", "<span tabindex='-1'>Focusable</span>",
    "<span contenteditable>Editor</span>", "<span autofocus>Auto focus</span>",
    "<span role='button'>Fake button</span>", "<video controls></video>",
    "<iframe></iframe>", "<x-widget></x-widget>", "<script>void 0</script>",
    "<label for='external-submit'>Forwarded action</label>",
  ])("rejects interactive/custom content %s without modifying it", markup => {
    const { trigger, panel } = nodes()
    panel.innerHTML = `Description ${markup}`
    const original = panel.innerHTML
    expect(() => createTooltip(trigger, panel)).toThrow("noninteractive")
    expect(panel.innerHTML).toBe(original)
    expect(trigger.hasAttribute("aria-describedby")).toBe(false)
  })
  it("requires text, role and separate noninteractive content outside the native trigger", () => {
    const { trigger, panel } = nodes()
    panel.textContent = ""
    expect(() => createTooltip(trigger, panel)).toThrow("nonempty")
    panel.textContent = "Description"
    panel.removeAttribute("role")
    expect(() => createTooltip(trigger, panel)).toThrow("role=tooltip")
    panel.setAttribute("role", "tooltip")
    panel.innerHTML = "Description <svg><a xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='#destination'><text>SVG link</text></a></svg>"
    expect(() => createTooltip(trigger, panel)).toThrow("noninteractive")
    panel.textContent = "Description"
    trigger.append(panel)
    expect(() => createTooltip(trigger, panel)).toThrow("separate")
  })
  it("rejects disabled and negative-tabindex triggers; an explicit native alternative works", () => {
    const { trigger, panel } = nodes()
    trigger.disabled = true
    expect(() => createTooltip(trigger, panel)).toThrow("native alternative")
    trigger.disabled = false
    trigger.tabIndex = -1
    expect(() => createTooltip(trigger, panel)).toThrow("keyboard-reachable")
    trigger.removeAttribute("tabindex")
    const controller = createTooltip(trigger, panel)
    controllers.push(controller)
    expect(controller.open()).toBe(true)
  })
  it("rejects competing trigger modes, fake spans and legacy tooltip ancestry", () => {
    const { trigger, panel } = nodes()
    expect(() => createTooltip(trigger, panel, { trigger: "manual" } as TooltipOptions)).toThrow("always supports")
    const span = document.createElement("span")
    span.tabIndex = 0
    document.body.append(span)
    expect(() => createTooltip(span, panel)).toThrow("native focusable")
    const legacy = document.createElement("mui-tooltip")
    document.body.append(legacy)
    legacy.append(trigger)
    expect(() => createTooltip(trigger, panel)).toThrow("legacy")
  })
})

describe("shared hover/focus timing with Tooltip Escape suppression", () => {
  it("delays hover and bridges pointer travel to the noninteractive panel", () => {
    const { trigger, panel, controller } = bind({ delay: 100, duration: 150 })
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
  it("opens on focus immediately without moving focus or adding a tab stop", () => {
    const { trigger, panel, controller } = bind({ delay: 1000 })
    trigger.focus()
    expect(controller.show).toBe(true)
    expect(document.activeElement).toBe(trigger)
    expect(panel.hasAttribute("tabindex")).toBe(false)
  })
  it("retains while either pointer or focus is engaged, then closes after both leave", () => {
    const { trigger, controller } = bind()
    pointer(trigger, "pointerenter")
    trigger.focus()
    pointer(trigger, "pointerleave")
    vi.advanceTimersByTime(200)
    expect(controller.show).toBe(true)
    pointer(trigger, "pointerenter")
    trigger.blur()
    vi.advanceTimersByTime(200)
    expect(controller.show).toBe(true)
    pointer(trigger, "pointerleave")
    vi.advanceTimersByTime(101)
    expect(controller.show).toBe(false)
  })
  it("Escape suppresses reopening from panel entry or unchanged focus, but new trigger entry resets", () => {
    const { trigger, panel, controller } = bind()
    trigger.focus()
    expect(escape().defaultPrevented).toBe(true)
    expect(controller.show).toBe(false)
    pointer(panel, "pointerenter")
    trigger.focus()
    vi.advanceTimersByTime(200)
    expect(controller.show).toBe(false)
    pointer(trigger, "pointerenter")
    vi.advanceTimersByTime(101)
    expect(controller.show).toBe(true)
    escape()
    trigger.blur()
    trigger.focus()
    expect(controller.show).toBe(true)
  })
  it("Escape cancels a pending delay without consuming another native surface's default action", () => {
    const { trigger, controller } = bind()
    pointer(trigger, "pointerenter")
    expect(escape().defaultPrevented).toBe(false)
    vi.advanceTimersByTime(200)
    expect(controller.show).toBe(false)
    expect(controller.open()).toBe(true)
  })
  it("keeps multiple manual tips independent and dismisses visible peers on one Escape", () => {
    const first = bind()
    const second = bind()
    first.controller.open()
    second.controller.open()
    expect(first.controller.show && second.controller.show).toBe(true)
    expect(escape().defaultPrevented).toBe(true)
    expect(first.controller.show || second.controller.show).toBe(false)
  })
  it("handles manual requests, native cancellation and close/reopen toggle coalescing", async () => {
    const { panel, controller } = bind()
    const prevent = (event: Event) => event.preventDefault()
    panel.addEventListener("beforetoggle", prevent)
    expect(controller.setShow(true)).toBe(false)
    panel.removeEventListener("beforetoggle", prevent)
    controller.open()
    controller.close()
    expect(controller.setShow(true)).toBe(true)
    panel.dispatchEvent(Object.assign(new Event("toggle"), { newState: "closed" }))
    await Promise.resolve()
    expect(controller.show).toBe(true)
    expect(() => controller.setShow("yes" as unknown as boolean)).toThrow("boolean")
  })
  it("ignores touch hover and keeps disabled tooltip state separate from native actions", () => {
    const { trigger, controller } = bind()
    pointer(trigger, "pointerenter", null, "touch")
    vi.advanceTimersByTime(101)
    expect(controller.show).toBe(false)
    controller.open()
    controller.disabled = true
    expect(controller.show).toBe(false)
    expect(trigger.disabled).toBe(false)
    controller.disabled = false
    expect(controller.show).toBe(false)
  })
  it("does not prevent modified link clicks or duplicate native form submission", () => {
    const { trigger, panel } = nodes()
    const form = document.createElement("form")
    const submit = vi.fn((event: Event) => event.preventDefault())
    form.addEventListener("submit", submit)
    trigger.type = "submit"
    document.body.append(form)
    form.append(trigger, panel)
    const controller = createTooltip(trigger, panel)
    controllers.push(controller)
    trigger.click()
    expect(submit).toHaveBeenCalledOnce()
    controller.disconnect()
    const link = document.createElement("a")
    link.href = "#destination"
    link.getBoundingClientRect = trigger.getBoundingClientRect
    trigger.replaceWith(link)
    const linked = createTooltip(link, panel)
    controllers.push(linked)
    const event = new MouseEvent("click", { ctrlKey: true, cancelable: true })
    link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
})

describe("Tooltip lifecycle, validation and shared placement", () => {
  it("disconnects removed pending triggers, cancelling descriptions and listeners as well as shared timers", async () => {
    const { trigger, panel, controller } = bind()
    pointer(trigger, "pointerenter")
    trigger.remove()
    await Promise.resolve()
    vi.advanceTimersByTime(200)
    expect(controller.connected).toBe(false)
    expect(controller.show).toBe(false)
    expect(trigger.hasAttribute("aria-describedby")).toBe(false)
    expect(panel.hasAttribute("style")).toBe(false)
    expect(escape().defaultPrevented).toBe(false)
  })
  it("disconnects an open panel when interactive children or attributes appear", async () => {
    const first = bind()
    const error = vi.fn()
    first.panel.addEventListener("mui:tooltip-error", error)
    first.controller.open()
    const button = document.createElement("button")
    first.panel.append(button)
    await Promise.resolve()
    expect(first.controller.connected).toBe(false)
    expect(first.trigger.hasAttribute("aria-describedby")).toBe(false)
    expect(error).toHaveBeenCalledOnce()
    const second = bind()
    second.controller.open()
    second.panel.querySelector("strong")!.setAttribute("tabindex", "0")
    await Promise.resolve()
    expect(second.controller.connected).toBe(false)
  })
  it("validates content before direct native show can transfer autofocus", () => {
    const { panel, controller } = bind()
    const button = document.createElement("button")
    button.autofocus = true
    panel.append(button)
    const error = vi.fn()
    panel.addEventListener("mui:tooltip-error", error)
    panel.showPopover()
    expect(controller.show).toBe(false)
    expect(controller.connected).toBe(false)
    expect(error).toHaveBeenCalledOnce()
  })
  it("keeps IDs immutable and removes only the originally owned description token", async () => {
    const { trigger, panel, controller } = bind()
    controller.open()
    trigger.setAttribute("aria-describedby", `${panel.id} author-added`)
    panel.id = "changed"
    await Promise.resolve()
    expect(controller.connected).toBe(false)
    expect(trigger.getAttribute("aria-describedby")).toBe("author-added")
  })
  it("restores geometry and source attributes across disconnect/reconnect and duplicate binding", async () => {
    const { trigger, panel, controller } = bind()
    expect(() => createTooltip(trigger, panel)).toThrow("active controller")
    controller.open()
    panel.style.color = "red"
    window.dispatchEvent(new Event("resize"))
    controller.disconnect()
    vi.runAllTimers()
    await Promise.resolve()
    expect(panel.style.left).toBe("")
    expect(panel.style.color).toBe("red")
    expect(panel.getAttribute("popover")).toBe("manual")
    expect(trigger.hasAttribute("aria-describedby")).toBe(false)
    controller.connect()
    expect(controller.open()).toBe(true)
  })
  it("reuses placement and RTL flip/clamp behavior without copying a positioning implementation", () => {
    const { trigger, panel, controller } = bind({ placement: "bottom-start", positioning: "fallback" })
    trigger.style.direction = "rtl"
    controller.open()
    expect(panel.style.left).toBe("140px")
    expect(panel.dataset.popoverPlacement).toBe("bottom-start")
    trigger.getBoundingClientRect = () => rect(200, 565, 100, 30)
    controller.syncPosition()
    expect(panel.dataset.popoverPlacement).toBe("top-start")
    controller.close()
    expect(panel.hasAttribute("data-popover-placement")).toBe(false)
    expect(controller.syncPosition()).toBe(false)
  })
  it("allows Tooltip inside an authored parent Popover without a tooltip-inside-tooltip widget", () => {
    vi.stubGlobal("ResizeObserver", undefined)
    const { trigger, panel } = nodes()
    const outerTrigger = document.createElement("button")
    outerTrigger.type = "button"
    outerTrigger.setAttribute("popovertarget", "outer")
    outerTrigger.getBoundingClientRect = () => rect(100, 100, 100, 30)
    const outer = document.createElement("div")
    outer.id = "outer"
    outer.className = "mui-popover"
    outer.setAttribute("popover", "auto")
    outer.getBoundingClientRect = () => rect(0, 0, 300, 200)
    outer.append(trigger, panel)
    document.body.append(outerTrigger, outer)
    const parent = createPopover(outerTrigger, outer)
    const child = createTooltip(trigger, panel)
    controllers.push(parent, child)
    parent.open()
    child.open()
    expect(parent.show && child.show).toBe(true)
    escape()
    expect(child.show).toBe(false)
    expect(parent.show).toBe(true)
    expect(outerTrigger.getAttribute("aria-expanded")).toBe("true")
    expect(trigger.hasAttribute("aria-expanded")).toBe(false)
    child.open()
    parent.close()
    expect(child.show).toBe(false)
    expect(escape().defaultPrevented).toBe(false)
    parent.open()
    pointer(trigger, "pointerenter")
    parent.close()
    vi.advanceTimersByTime(200)
    expect(child.show).toBe(false)
  })
  it("composes maintained shared CSS at build time and avoids registration or runtime CSS imports", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./tooltip"].import).toBe("./dist/markup-ui-tooltip.js")
    const build = readFileSync("scripts/build.mjs", "utf8")
    expect(build).toContain('name === "tooltip"')
    const css = readFileSync("src/components/tooltip/tooltip.css", "utf8")
    expect(css).toContain("overflow: clip")
    expect(css).not.toContain("@import")
    const source = readFileSync("src/components/tooltip/tooltip.ts", "utf8")
    expect(source).toContain("createPopoverController")
    expect(source).not.toContain("getBoundingClientRect")
    expect(source).not.toContain("innerHTML")
    expect(source).not.toContain("customElements")
  })
})
