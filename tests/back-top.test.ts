import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createBackTop } from "../src/components/back-top/index.js"
import type { BackTopController, BackTopOptions } from "../src/components/back-top/index.js"

const controllers: BackTopController[] = []
function nodes(link = false) {
  const root = document.createElement("div")
  root.style.overflow = "auto"
  Object.defineProperties(root, {
    clientHeight: { configurable: true, value: 200 },
    offsetHeight: { configurable: true, value: 200 },
    scrollHeight: { configurable: true, value: 1000 },
  })
  root.getBoundingClientRect = () => ({ top: 0, height: 200 }) as DOMRect
  root.scrollTo = vi.fn(options => {
    root.scrollTop = (options as ScrollToOptions).top!
    root.dispatchEvent(new Event("scroll"))
  })
  const action = document.createElement(link ? "a" : "button")
  action.className = "mui-back-top"
  action.textContent = "Return to top"
  if (action instanceof HTMLButtonElement) action.type = "button"
  else {
    const target = document.createElement("h2")
    target.id = `top-${document.querySelectorAll("h2").length}`
    target.textContent = "Top"
    root.append(target)
    action.href = `#${target.id}`
  }
  document.body.append(root, action)
  return { root, action }
}
function bind(options: BackTopOptions = {}, link = false) {
  const pair = nodes(link)
  const controller = createBackTop(pair.action, { root: pair.root, ...options })
  controllers.push(controller)
  return { ...pair, controller }
}
const flush = () => new Promise(resolve => setTimeout(resolve, 40))
afterEach(() => {
  controllers.splice(0).forEach(controller => controller.disconnect())
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("Back Top visibility and native focus", () => {
  it("uses inclusive 180px default threshold and no initial callback", () => {
    const { action, root } = nodes()
    const change = vi.fn()
    action.addEventListener("mui:back-top-update-show", change)
    const controller = createBackTop(action, { root })
    controllers.push(controller)
    expect(change).not.toHaveBeenCalled()
    expect(controller.visible).toBe(false)
    root.scrollTop = 179
    controller.update()
    expect(change).not.toHaveBeenCalled()
    root.scrollTop = 180
    controller.update()
    expect(controller.visible).toBe(true)
    expect(change).toHaveBeenCalledTimes(1)
    expect(change.mock.calls[0]![0].detail).toEqual({ show: true })
    controller.update()
    expect(change).toHaveBeenCalledTimes(1)
  })
  it("accepts zero and fractional thresholds", () => {
    expect(bind({ visibilityHeight: 0 }).controller.visible).toBe(true)
    const { controller, root } = bind({ visibilityHeight: .5 })
    root.scrollTop = .5
    controller.update()
    expect(controller.visible).toBe(true)
  })
  it("keeps forced visibility separate from threshold notifications and silent assignments", () => {
    const { action, controller, root } = bind({ show: true })
    const change = vi.fn()
    action.addEventListener("mui:back-top-update-show", change)
    controller.show = false
    expect(controller.visible).toBe(false)
    expect(change).not.toHaveBeenCalled()
    root.scrollTop = 200
    controller.update()
    expect(controller.visible).toBe(false)
    expect(controller.thresholdVisible).toBe(true)
    expect(change).toHaveBeenCalledTimes(1)
    controller.show = null
    expect(controller.visible).toBe(true)
    expect(change).toHaveBeenCalledTimes(1)
  })
  it("retains a focused action even under forced hide, then hides on blur", async () => {
    const { action, root, controller } = bind({ visibilityHeight: 0 })
    action.focus()
    controller.show = false
    expect(controller.visible).toBe(true)
    expect(document.activeElement).toBe(action)
    root.scrollTop = 0
    controller.update()
    action.blur()
    await flush()
    expect(controller.visible).toBe(false)
  })
  it("never removes author hidden, ARIA, classes or labels", () => {
    const { action, controller } = bind()
    action.hidden = true
    action.setAttribute("aria-controls", "reader")
    action.classList.add("author")
    controller.show = true
    expect(action.hidden).toBe(true)
    controller.disconnect()
    expect(action.hidden).toBe(true)
    expect(action.getAttribute("aria-controls")).toBe("reader")
    expect(action.classList.contains("author")).toBe(true)
    expect(action.textContent).toBe("Return to top")
  })
  it("coalesces scroll work and observes only the explicit scroll root", async () => {
    const { root, controller } = bind()
    const update = vi.spyOn(controller, "update")
    root.scrollTop = 200
    root.dispatchEvent(new Event("scroll"))
    root.dispatchEvent(new Event("scroll"))
    await flush()
    expect(update).toHaveBeenCalledTimes(1)
    expect(controller.visible).toBe(true)
  })
})

describe("native scrolling and activation", () => {
  it("scrolls only to zero with horizontal RTL position preserved, without focus/hash changes", () => {
    const { root, controller, action } = bind({ visibilityHeight: 0 })
    root.scrollTop = 300
    root.scrollLeft = -70
    action.focus()
    const url = document.URL
    expect(controller.scrollToTop({ behavior: "instant" })).toBe(true)
    expect(root.scrollTo).toHaveBeenCalledWith({ top: 0, left: -70, behavior: "instant" })
    expect(document.URL).toBe(url)
    expect(document.activeElement).toBe(action)
  })
  it("uses the same document/window scroll context by default", () => {
    Object.defineProperties(document.documentElement, {
      clientHeight: { configurable: true, value: 600 },
      scrollHeight: { configurable: true, value: 1600 },
    })
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {})
    vi.spyOn(window, "scrollX", "get").mockReturnValue(45)
    const { action } = nodes()
    const controller = createBackTop(action)
    controllers.push(controller)
    expect(controller.scrollToTop()).toBe(true)
    expect(scroll).toHaveBeenCalledWith({ top: 0, left: 45, behavior: "smooth" })
  })
  it("forces instant native scrolling under reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }))
    const { root, controller } = bind()
    controller.scrollToTop()
    expect(root.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" })
  })
  it("falls back to writable element scrollTop without overriding horizontal state", () => {
    const { root, controller } = bind()
    root.scrollTo = undefined as unknown as typeof root.scrollTo
    root.scrollTop = 300
    root.scrollLeft = 40
    expect(controller.scrollToTop()).toBe(true)
    expect(root.scrollTop).toBe(0)
    expect(root.scrollLeft).toBe(40)
  })
  it("activates a native typed button once without form submission", async () => {
    const { action, root } = bind({ visibilityHeight: 0 })
    const form = document.createElement("form")
    document.body.append(form)
    form.append(action)
    const submit = vi.fn(event => event.preventDefault())
    form.addEventListener("submit", submit)
    action.click()
    await flush()
    expect(root.scrollTo).toHaveBeenCalledTimes(1)
    expect(submit).not.toHaveBeenCalled()
  })
  it("honors defaultPrevented from later listeners and cancels queued work on refresh", async () => {
    const { action, root, controller } = bind({ visibilityHeight: 0 })
    action.addEventListener("click", event => event.preventDefault(), { once: true })
    action.click()
    await flush()
    expect(root.scrollTo).not.toHaveBeenCalled()
    action.click()
    controller.refresh()
    await flush()
    expect(root.scrollTo).not.toHaveBeenCalled()
  })
  it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true }, { button: 1 }])("ignores modified activation %j", async init => {
    const { action, root } = bind({ visibilityHeight: 0 })
    action.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ...init }))
    await flush()
    expect(root.scrollTo).not.toHaveBeenCalled()
  })
  it("respects native fieldset disabling, hidden and inert author state", async () => {
    const { action, root } = bind({ visibilityHeight: 0 })
    const fieldset = document.createElement("fieldset")
    fieldset.disabled = true
    document.body.append(fieldset)
    fieldset.append(action)
    action.dispatchEvent(new MouseEvent("click", { button: 0 }))
    fieldset.disabled = false
    action.hidden = true
    action.click()
    action.hidden = false
    fieldset.setAttribute("inert", "")
    action.click()
    await flush()
    expect(root.scrollTo).not.toHaveBeenCalled()
  })
  it("does not synthesize keyboard clicks", async () => {
    const { action, root } = bind({ visibilityHeight: 0 })
    action.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
    action.dispatchEvent(new KeyboardEvent("keydown", { key: " " }))
    await flush()
    expect(root.scrollTo).not.toHaveBeenCalled()
  })
  it("never intercepts native links, including modified/target/download and authored cancellation", async () => {
    const { action, root } = bind({ visibilityHeight: 0 }, true)
    const link = action as HTMLAnchorElement
    link.target = "_blank"
    link.download = "author"
    const event = new MouseEvent("click", { cancelable: true, ctrlKey: true })
    expect(link.dispatchEvent(event)).toBe(true)
    expect(event.defaultPrevented).toBe(false)
    link.addEventListener("click", e => e.preventDefault())
    link.click()
    await flush()
    expect(root.scrollTo).not.toHaveBeenCalled()
    expect(link.target).toBe("_blank")
    expect(link.download).toBe("author")
  })
  it("accepts encoded Unicode and punctuation destinations without selector interpolation", () => {
    const { action, root } = nodes(true)
    root.firstElementChild!.id = "雪 /#[]%"
    action.setAttribute("href", `#${encodeURIComponent(root.firstElementChild!.id)}`)
    const controller = createBackTop(action, { root })
    controllers.push(controller)
    expect(controller.connected).toBe(true)
  })
})

describe("validation, ownership and cleanup", () => {
  it.each([-1, Infinity, NaN, null, "180"])("rejects invalid threshold %s", visibilityHeight => {
    expect(() => bind({ visibilityHeight } as BackTopOptions)).toThrow()
  })
  it.each([{ show: "yes" }, { behavior: "fast" }, { behavior: null }, { root: "#root" }, { duration: 300 }])("rejects invalid options %j", options => {
    expect(() => bind(options as BackTopOptions)).toThrow()
  })
  it("rejects unsafe or nameless anatomy instead of rewriting it", () => {
    const { action, root } = nodes()
    action.removeAttribute("type")
    expect(() => createBackTop(action, { root })).toThrow(/type=button/)
    action.setAttribute("type", "button")
    action.textContent = ""
    expect(() => createBackTop(action, { root })).toThrow(/label/)
    action.textContent = "Top"
    action.append(document.createElement("input"))
    expect(() => createBackTop(action, { root })).toThrow(/nested/)
  })
  it("rejects missing or external fragment destinations while leaving nodes intact", () => {
    const { action, root } = nodes(true)
    action.setAttribute("href", "#missing")
    expect(() => createBackTop(action, { root })).toThrow(/destination/)
    action.setAttribute("href", "https://example.org/#top")
    expect(() => createBackTop(action, { root })).toThrow(/destination/)
    expect(action.getAttribute("href")).toBe("https://example.org/#top")
  })
  it("prevents duplicate ownership but allows multiple actions and independent roots", () => {
    const first = bind()
    expect(() => createBackTop(first.action, { root: first.root })).toThrow(/active controller/)
    const second = bind()
    first.root.scrollTop = 300
    first.controller.update()
    expect(first.controller.visible).toBe(true)
    expect(second.controller.visible).toBe(false)
    const otherAction = nodes().action
    const third = createBackTop(otherAction, { root: first.root })
    controllers.push(third)
    expect(third.visible).toBe(true)
  })
  it("restores only owned state and retains original child identity/listeners", () => {
    const { action, controller } = bind()
    const child = action.firstChild
    const click = vi.fn()
    action.addEventListener("click", click)
    action.setAttribute("data-back-top-hidden", "author")
    controller.disconnect()
    expect(action.getAttribute("data-back-top-hidden")).toBe("author")
    expect(action.firstChild).toBe(child)
    action.click()
    expect(click).toHaveBeenCalledTimes(1)
  })
  it("cleans frames/tasks/listeners on disconnect and reconnects without duplicate activation", async () => {
    const { action, root, controller } = bind({ visibilityHeight: 0 })
    action.click()
    controller.disconnect()
    await flush()
    expect(root.scrollTo).not.toHaveBeenCalled()
    expect(controller.scrollToTop()).toBe(false)
    expect(action.hasAttribute("data-back-top-hidden")).toBe(false)
    controller.connect()
    controller.connect()
    action.click()
    await flush()
    expect(root.scrollTo).toHaveBeenCalledTimes(1)
  })
  it("detects removals on update without a document mutation observer", () => {
    const { action, root, controller } = bind()
    const spy = vi.spyOn(window, "MutationObserver")
    root.remove()
    controller.update()
    expect(controller.connected).toBe(false)
    expect(action.hasAttribute("data-back-top-hidden")).toBe(false)
    expect(spy).not.toHaveBeenCalled()
  })
  it("surfaces automatic invalid-root errors and throws explicit invalid requests", async () => {
    const { action, root, controller } = bind()
    const error = vi.fn()
    action.addEventListener("mui:back-top-error", error)
    root.style.overflow = "clip"
    root.dispatchEvent(new Event("scroll"))
    await flush()
    expect(controller.connected).toBe(false)
    expect(error).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0]![0].detail.error).toBeInstanceOf(TypeError)
    expect(() => controller.scrollToTop({ behavior: "fast" as "smooth" })).toThrow()
  })
  it("invalidates delayed clicks if authored button type becomes unsafe", async () => {
    const { action, root, controller } = bind({ visibilityHeight: 0 })
    const error = vi.fn()
    action.addEventListener("mui:back-top-error", error)
    action.click()
    action.setAttribute("type", "submit")
    await flush()
    expect(root.scrollTo).not.toHaveBeenCalled()
    expect(controller.connected).toBe(false)
    expect(error).toHaveBeenCalledTimes(1)
  })
  it("allows reentrant threshold listeners to dispose without later writes", () => {
    const { action, root, controller } = bind()
    action.addEventListener("mui:back-top-update-show", () => controller.disconnect())
    root.scrollTop = 300
    controller.update()
    expect(controller.connected).toBe(false)
    expect(action.hasAttribute("data-back-top-hidden")).toBe(false)
  })
  it("works without ResizeObserver and rejects empty viewports without faking a scroll", () => {
    vi.stubGlobal("ResizeObserver", undefined)
    const { root, controller } = bind()
    Object.defineProperty(root, "clientHeight", { configurable: true, value: 0 })
    expect(controller.scrollToTop()).toBe(false)
  })
  it("ships external hidden/focus/RTL/print CSS and no runtime DOM renderer", () => {
    const css = readFileSync(join("src", "components", "back-top", "back-top.css"), "utf8")
    const source = readFileSync(join("src", "components", "back-top", "back-top.ts"), "utf8")
    expect(css).toContain("[hidden]")
    expect(css).toContain("[data-back-top-hidden]")
    expect(css).toContain(":dir(rtl)")
    expect(css).toContain("forced-colors")
    expect(css).toContain("@media print")
    expect(source).not.toMatch(/innerHTML|MutationObserver|keydown|createElement|setInterval/)
  })
})
