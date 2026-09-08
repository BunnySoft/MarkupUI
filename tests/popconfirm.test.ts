import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createPopconfirm } from "../src/components/popconfirm/index.js"
import type { PopconfirmController, PopconfirmOptions } from "../src/components/popconfirm/index.js"

const controllers: PopconfirmController[] = []
const matches = HTMLElement.prototype.matches
let opened: WeakSet<HTMLElement>
let sequence = 0
const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, right: left + width, bottom: top + height, width, height, x: left, y: top, toJSON() {} }) as DOMRect
function nativeToggle(panel: HTMLElement, show: boolean) {
  if (opened.has(panel) === show) return
  const event = Object.assign(new Event("beforetoggle", { cancelable: show }), {
    oldState: show ? "closed" : "open", newState: show ? "open" : "closed",
  })
  if (!panel.dispatchEvent(event)) return
  if (show) opened.add(panel)
  else opened.delete(panel)
  panel.dispatchEvent(new Event("toggle"))
}
function nodes() {
  const id = `confirm-${sequence++}`
  const trigger = document.createElement("button")
  trigger.type = "button"
  trigger.textContent = "Review local choice"
  trigger.setAttribute("popovertarget", id)
  const panel = document.createElement("div")
  panel.id = id
  panel.className = "mui-popover mui-popconfirm"
  panel.setAttribute("role", "dialog")
  panel.setAttribute("aria-label", "Confirm local choice")
  panel.setAttribute("aria-describedby", `${id}-description`)
  panel.setAttribute("popover", "auto")
  panel.innerHTML = `
    <p id="${id}-description" data-popconfirm-content>Authored <strong>question</strong>.</p>
    <div data-popconfirm-actions><span><button type="button" data-popconfirm-negative>Keep unchanged</button></span><button type="button" data-popconfirm-positive>Apply locally</button></div>
    <p data-popconfirm-pending role="status" hidden>Working locally.</p>
    <p data-popconfirm-error role="alert" hidden>Local work failed. Retry.</p>
    <p data-popconfirm-complete role="status" hidden>Inline choice completed.</p>`
  trigger.getBoundingClientRect = () => rect(200, 200, 100, 30)
  panel.getBoundingClientRect = () => rect(0, 0, 250, 180)
  for (const button of panel.querySelectorAll("button")) button.getBoundingClientRect = () => rect(200, 300, 100, 30)
  document.body.append(trigger, panel)
  return {
    trigger, panel,
    positive: panel.querySelector<HTMLButtonElement>("[data-popconfirm-positive]")!,
    negative: panel.querySelector<HTMLButtonElement>("[data-popconfirm-negative]")!,
    error: panel.querySelector<HTMLElement>("[data-popconfirm-error]")!,
    status: panel.querySelector<HTMLElement>("[data-popconfirm-pending]")!,
    complete: panel.querySelector<HTMLElement>("[data-popconfirm-complete]")!,
  }
}
function bind(options: PopconfirmOptions = {}) {
  const pair = nodes()
  if (options.trigger === "manual") pair.trigger.removeAttribute("popovertarget")
  const controller = createPopconfirm(pair.trigger, pair.panel, options)
  controllers.push(controller)
  return { ...pair, controller }
}
function deferred() {
  let resolve!: (value?: unknown) => void
  let reject!: (error: unknown) => void
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
async function flush() {
  await new Promise(resolve => setTimeout(resolve, 0))
  for (let index = 0; index < 8; index++) await Promise.resolve()
}
beforeEach(() => {
  opened = new WeakSet()
  vi.spyOn(HTMLElement.prototype, "matches").mockImplementation(function (selector) {
    return selector === ":popover-open" ? opened.has(this) : matches.call(this, selector)
  })
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} })
  Object.defineProperty(HTMLElement.prototype, "showPopover", { configurable: true, value() { nativeToggle(this, true) } })
  Object.defineProperty(HTMLElement.prototype, "hidePopover", { configurable: true, value() { nativeToggle(this, false) } })
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
})

describe("authored Popconfirm anatomy and native action ownership", () => {
  it("retains all authored labels, markup, listeners and ARIA without a fake modal", async () => {
    const { trigger, panel, positive, controller } = bind()
    const child = panel.querySelector("strong")
    const template = document.createElement("template")
    template.innerHTML = "<button type='button' data-popconfirm-positive>Inert, not an owned action</button>"
    panel.append(template)
    const handler = vi.fn()
    child!.addEventListener("click", handler)
    const label = positive.textContent
    expect(controller.open()).toBe(true)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(panel.getAttribute("role")).toBe("dialog")
    expect(panel.hasAttribute("aria-modal")).toBe(false)
    positive.click()
    await flush()
    expect(controller.show).toBe(false)
    expect(positive.textContent).toBe(label)
    expect(panel.querySelector("strong")).toBe(child)
    expect(panel.lastElementChild).toBe(template)
    expect(template.content.querySelector("button")?.textContent).toBe("Inert, not an owned action")
    ;(child as HTMLElement).click()
    expect(handler).toHaveBeenCalledOnce()
  })
  it("never synthesizes native trigger clicks or keyboard actions", () => {
    const { trigger, controller } = bind()
    trigger.click()
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
    expect(controller.show).toBe(false)
  })
  it("respects native opening cancellation and keeps callbacks separate from show assignments", async () => {
    const callback = vi.fn()
    const { panel, controller } = bind({ onPositive: callback, onNegative: callback })
    const prevent = (event: Event) => event.preventDefault()
    panel.addEventListener("beforetoggle", prevent)
    expect(controller.setShow(true)).toBe(false)
    panel.removeEventListener("beforetoggle", prevent)
    controller.setShow(true)
    controller.setShow(false)
    await flush()
    expect(callback).not.toHaveBeenCalled()
  })
  it("checks defaultPrevented after all synchronous action listeners, including later listeners", async () => {
    const callback = vi.fn()
    const { positive, controller } = bind({ onPositive: callback })
    controller.open()
    positive.addEventListener("click", event => event.preventDefault())
    positive.click()
    await flush()
    expect(callback).not.toHaveBeenCalled()
    expect(controller.lastAction).toBeNull()
    expect(controller.show).toBe(true)
  })
  it("does not accidentally submit enclosing forms, including custom wrapped action markup", async () => {
    const { trigger, panel, positive, negative, controller } = bind()
    const form = document.createElement("form")
    const submit = vi.fn((event: Event) => event.preventDefault())
    form.addEventListener("submit", submit)
    document.body.append(form)
    form.append(trigger, panel)
    controller.open()
    positive.click()
    await flush()
    controller.open()
    negative.click()
    await flush()
    expect(submit).not.toHaveBeenCalled()
  })
  it("requires explicit names/descriptions, safe decision buttons and initially hidden messages", () => {
    const { trigger, panel, positive, error } = nodes()
    positive.type = "submit"
    expect(() => createPopconfirm(trigger, panel)).toThrow("type=button")
    positive.type = "button"
    panel.setAttribute("aria-modal", "true")
    expect(() => createPopconfirm(trigger, panel)).toThrow("nonmodal")
    panel.removeAttribute("aria-modal")
    panel.removeAttribute("aria-label")
    expect(() => createPopconfirm(trigger, panel)).toThrow("named")
    panel.setAttribute("aria-label", "Choice")
    panel.removeAttribute("aria-describedby")
    expect(() => createPopconfirm(trigger, panel)).toThrow("description")
    panel.setAttribute("aria-describedby", panel.querySelector("[data-popconfirm-content]")!.id)
    error.hidden = false
    expect(() => createPopconfirm(trigger, panel)).toThrow("initially be hidden")
  })
  it.each(["popovertarget", "popovertargetaction", "command", "commandfor"])("rejects competing native %s decision commands", name => {
    const { trigger, panel, positive } = nodes()
    positive.setAttribute(name, "other")
    expect(() => createPopconfirm(trigger, panel)).toThrow("without native commands")
  })
  it("rejects missing/duplicate owned anatomy and transient hover/focus options", () => {
    const { trigger, panel, positive } = nodes()
    expect(() => createPopconfirm(trigger, panel, { trigger: "hover" } as unknown as PopconfirmOptions)).toThrow("click/manual")
    expect(() => createPopconfirm(trigger, panel, { delay: 10 } as PopconfirmOptions)).toThrow("delays")
    expect(() => createPopconfirm(trigger, panel, { onPositive: true } as unknown as PopconfirmOptions)).toThrow("functions")
    const copy = positive.cloneNode(true)
    panel.append(copy)
    expect(() => createPopconfirm(trigger, panel)).toThrow("exactly one")
    copy.remove()
    positive.remove()
    expect(() => createPopconfirm(trigger, panel)).toThrow("exactly one")
  })
  it("rejects dual decision markers and native activation-bearing panel containers", () => {
    const { trigger, panel, positive, negative } = nodes()
    negative.remove()
    positive.setAttribute("data-popconfirm-negative", "")
    expect(() => createPopconfirm(trigger, panel)).toThrow("separate")
    const label = document.createElement("label")
    for (const attribute of panel.attributes) label.setAttribute(attribute.name, attribute.value)
    while (panel.firstChild) label.append(panel.firstChild)
    panel.replaceWith(label)
    expect(() => createPopconfirm(trigger, label)).toThrow("HTML panel")
  })
})

describe("callback outcomes, pending locks and explicit failures", () => {
  it.each([undefined, true, null, 0, "", "accepted"])("closes for fulfilled non-false value %j", async value => {
    const callback = vi.fn(() => value)
    const { positive, controller } = bind({ onPositive: callback })
    controller.open()
    positive.click()
    await flush()
    expect(callback).toHaveBeenCalledOnce()
    expect(await controller.lastAction).toBe(true)
    expect(controller.show).toBe(false)
  })
  it.each(["positive", "negative"] as const)("keeps false-result %s panels open and restores button focus/state", async action => {
    const callback = vi.fn(() => false)
    const pair = bind({ onPositive: callback, onNegative: callback })
    pair.controller.open()
    pair[action].focus()
    pair[action].click()
    await flush()
    expect(await pair.controller.lastAction).toBe(false)
    expect(pair.controller.show).toBe(true)
    expect(pair.controller.pending).toBeNull()
    expect(pair.positive.disabled || pair.negative.disabled).toBe(false)
    expect(document.activeElement).toBe(pair[action])
    expect(pair.error.hidden).toBe(true)
  })
  it("locks both decisions before calling an async hook and prevents repeated or opposite actions", async () => {
    const task = deferred()
    const positiveHook = vi.fn(() => task.promise)
    const negativeHook = vi.fn()
    const { positive, negative, panel, status, controller } = bind({ onPositive: positiveHook, onNegative: negativeHook })
    controller.open()
    positive.click()
    positive.click()
    negative.click()
    await flush()
    expect(positiveHook).toHaveBeenCalledOnce()
    expect(negativeHook).not.toHaveBeenCalled()
    expect(controller.pending).toBe("positive")
    expect(positive.disabled && negative.disabled).toBe(true)
    expect(panel.getAttribute("aria-busy")).toBe("true")
    expect(status.hidden).toBe(false)
    task.resolve()
    await flush()
    expect(controller.show).toBe(false)
    expect(panel.hasAttribute("aria-busy")).toBe(false)
    expect(status.hidden).toBe(true)
  })
  it.each(["throw", "reject"] as const)("reports %s explicitly through a rejected lastAction, event and authored error UI", async mode => {
    const failure = new Error("local failure")
    const hook = () => { if (mode === "throw") throw failure; return Promise.reject(failure) }
    const { panel, positive, error, controller } = bind({ onPositive: hook })
    const events: unknown[] = []
    panel.addEventListener("mui:popconfirm-error", event => events.push((event as CustomEvent).detail))
    controller.open()
    positive.click()
    await flush()
    await expect(controller.lastAction).rejects.toBe(failure)
    expect(controller.show).toBe(true)
    expect(error.hidden).toBe(false)
    expect(error.textContent).toBe("Local work failed. Retry.")
    expect(panel.dataset.popconfirmState).toBe("error")
    expect(events).toEqual([{ action: "positive", error: failure, stale: false }])
  })
  it("clears old error UI for the next action and supports asynchronous negative false", async () => {
    let reject = true
    const { positive, negative, error, controller } = bind({
      onPositive: () => { if (reject) throw new Error("local"); return false },
      onNegative: () => Promise.resolve(false),
    })
    controller.open()
    positive.click()
    await flush()
    expect(error.hidden).toBe(false)
    reject = false
    negative.click()
    await flush()
    expect(error.hidden).toBe(true)
    expect(controller.show).toBe(true)
    expect(await controller.lastAction).toBe(false)
  })
  it("preserves initially disabled buttons and same-value author disabled writes during pending", async () => {
    const task = deferred()
    const pair = nodes()
    pair.negative.disabled = true
    const controller = createPopconfirm(pair.trigger, pair.panel, { onPositive: () => task.promise })
    controllers.push(controller)
    controller.open()
    pair.positive.click()
    await flush()
    pair.positive.disabled = true
    task.resolve(false)
    await flush()
    expect(pair.positive.disabled).toBe(true)
    expect(pair.negative.disabled).toBe(true)
  })
  it("preserves author re-enabling, own busy-state updates and repeated author attribute values", async () => {
    const task = deferred()
    const { positive, panel, status, controller } = bind({ onPositive: () => task.promise })
    panel.setAttribute("aria-busy", "false")
    controller.open()
    positive.click()
    await flush()
    positive.disabled = false
    panel.setAttribute("aria-busy", "true")
    status.hidden = true
    status.hidden = false
    positive.click()
    task.resolve(false)
    await flush()
    expect(positive.disabled).toBe(false)
    expect(panel.getAttribute("aria-busy")).toBe("true")
    expect(status.hidden).toBe(false)
    expect(controller.pending).toBeNull()
  })
})

describe("per-opening and per-action races", () => {
  it("does not execute a queued old click after native hide/reopen", async () => {
    const hook = vi.fn()
    const { positive, panel, controller } = bind({ onPositive: hook })
    controller.open()
    positive.click()
    panel.hidePopover()
    panel.showPopover()
    await flush()
    expect(hook).not.toHaveBeenCalled()
    expect(controller.show).toBe(true)
  })
  it("does not close or unlock a new pending action when an old action resolves", async () => {
    const first = deferred(), second = deferred()
    let invocation = 0
    const { positive, panel, controller } = bind({ onPositive: () => ++invocation === 1 ? first.promise : second.promise })
    controller.open()
    positive.click()
    await flush()
    const oldTask = controller.lastAction
    panel.hidePopover()
    panel.showPopover()
    positive.click()
    await flush()
    first.resolve(true)
    await flush()
    expect(await oldTask).toBe(true)
    expect(controller.show).toBe(true)
    expect(controller.pending).toBe("positive")
    expect(positive.disabled).toBe(true)
    second.resolve(false)
    await flush()
    expect(controller.pending).toBeNull()
    expect(controller.show).toBe(true)
    expect(positive.disabled).toBe(false)
  })
  it("reports late rejections as stale diagnostics without mutating the new UI session", async () => {
    const task = deferred()
    const { positive, panel, error, controller } = bind({ onPositive: () => task.promise })
    const failures: unknown[] = []
    panel.addEventListener("mui:popconfirm-error", event => failures.push((event as CustomEvent).detail))
    controller.open()
    positive.click()
    await flush()
    const original = controller.lastAction
    controller.close()
    controller.open()
    const snapshot = panel.outerHTML
    const failure = new Error("late failure")
    task.reject(failure)
    await flush()
    await expect(original).rejects.toBe(failure)
    expect(panel.outerHTML).toBe(snapshot)
    expect(error.hidden).toBe(true)
    expect(controller.show).toBe(true)
    expect(failures).toEqual([{ action: "positive", error: failure, stale: true }])
  })
  it("cleans up immediately on removal and never restores stale state after detached settlement", async () => {
    const task = deferred()
    const { trigger, panel, positive, controller } = bind({ onPositive: () => task.promise })
    controller.open()
    positive.click()
    await flush()
    panel.remove()
    await flush()
    expect(controller.connected).toBe(false)
    expect(controller.pending).toBeNull()
    const before = panel.outerHTML
    trigger.setAttribute("aria-controls", "author-update")
    task.resolve(true)
    await flush()
    expect(panel.outerHTML).toBe(before)
    expect(trigger.getAttribute("aria-controls")).toBe("author-update")
  })
  it("supports callback-driven synchronous dismissal without later UI resurrection", async () => {
    let controller!: PopconfirmController
    const pair = bind({ onPositive: () => { controller.close(); throw new Error("failure after dismissal") } })
    controller = pair.controller
    controller.open()
    pair.positive.click()
    await flush()
    expect(controller.show).toBe(false)
    expect(controller.pending).toBeNull()
    expect(pair.error.hidden).toBe(true)
  })
  it("does not steal focus after the user moves to an unrelated native control", async () => {
    const task = deferred()
    const { positive, controller } = bind({ onPositive: () => task.promise })
    const outside = document.createElement("button")
    document.body.append(outside)
    controller.open()
    positive.focus()
    positive.click()
    await flush()
    outside.focus()
    task.resolve(true)
    await flush()
    expect(document.activeElement).toBe(outside)
  })
  it("does not overwrite focus deliberately moved by a native closing listener", async () => {
    const { positive, panel, controller } = bind()
    const outside = document.createElement("button")
    document.body.append(outside)
    panel.addEventListener("beforetoggle", event => {
      if ((event as ToggleEvent).newState === "closed") outside.focus()
    })
    controller.open()
    positive.focus()
    positive.click()
    await flush()
    expect(controller.show).toBe(false)
    expect(document.activeElement).toBe(outside)
  })
  it("invalidates pending work on disabled state and supports explicit reconnect/rebind", async () => {
    const task = deferred()
    const { trigger, panel, positive, controller } = bind({ onPositive: () => task.promise })
    controller.open()
    positive.click()
    await flush()
    controller.disabled = true
    expect(controller.pending).toBeNull()
    expect(controller.show).toBe(false)
    controller.disconnect()
    controller.disabled = false
    controller.connect()
    expect(controller.open()).toBe(true)
    task.resolve(true)
    await flush()
    expect(controller.show).toBe(true)
    expect(() => createPopconfirm(trigger, panel)).toThrow("active controller")
  })
  it("rejects live action replacement/type changes and invalid native opening before taking actions", async () => {
    const { positive, controller, panel } = bind()
    const failures = vi.fn()
    panel.addEventListener("mui:popconfirm-error", failures)
    controller.open()
    positive.type = "submit"
    await flush()
    expect(controller.connected).toBe(false)
    expect(failures).toHaveBeenCalledOnce()
    positive.type = "button"
    controller.connect()
    panel.setAttribute("aria-modal", "true")
    panel.showPopover()
    await flush()
    expect(controller.show).toBe(false)
    expect(controller.connected).toBe(false)
  })
})

describe("inline fallback, shared geometry and distribution", () => {
  it("retains usable inline callback, busy/error/completion behavior without pretending to open a popup", async () => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover
    const task = deferred()
    const { positive, complete, panel, controller } = bind({ onPositive: () => task.promise })
    expect(controller.inline).toBe(true)
    expect(controller.supported).toBe(false)
    expect(controller.open()).toBe(false)
    expect(panel.hasAttribute("popover")).toBe(false)
    positive.click()
    await flush()
    expect(controller.pending).toBe("positive")
    task.resolve()
    await flush()
    expect(complete.hidden).toBe(false)
    expect(panel.dataset.popconfirmState).toBe("complete")
    expect(positive.disabled).toBe(false)
    controller.disconnect()
    expect(panel.getAttribute("popover")).toBe("auto")
    expect(complete.hidden).toBe(true)
  })
  it("cancels inline pending UI on ancestor hiding or root removal", async () => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover
    const task = deferred()
    const { trigger, panel, positive, controller } = bind({ onPositive: () => task.promise })
    const root = document.createElement("section")
    document.body.append(root)
    root.append(trigger, panel)
    positive.click()
    await flush()
    root.hidden = true
    await flush()
    expect(controller.pending).toBeNull()
    expect(positive.disabled).toBe(false)
    root.remove()
    const before = panel.outerHTML
    task.resolve()
    await flush()
    expect(panel.outerHTML).toBe(before)
  })
  it("uses shared native placement and restores only owned geometry after closure", () => {
    const { trigger, panel, controller } = bind({ placement: "bottom-start", positioning: "fallback" })
    trigger.style.direction = "rtl"
    panel.style.color = "red"
    controller.open()
    expect(panel.style.left).toBe("50px")
    expect(panel.dataset.popoverPlacement).toBe("bottom-start")
    trigger.getBoundingClientRect = () => rect(200, 565, 100, 30)
    controller.syncPosition()
    expect(panel.dataset.popoverPlacement).toBe("top-start")
    controller.close()
    expect(panel.style.left).toBe("")
    expect(panel.style.color).toBe("red")
  })
  it("supports manual opening while keeping all decision buttons ordinary native actions", async () => {
    const { trigger, negative, controller } = bind({ trigger: "manual" })
    expect(trigger.hasAttribute("popovertarget")).toBe(false)
    expect(controller.setShow(true)).toBe(true)
    negative.click()
    await flush()
    expect(await controller.lastAction).toBe(true)
    expect(controller.show).toBe(false)
  })
  it("exports self-contained composed CSS and reuses the public side-effect-free Popover controller", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./popconfirm"].import).toBe("./dist/markup-ui-popconfirm.js")
    const build = readFileSync("scripts/build.mjs", "utf8")
    expect(build).toContain('name === "popconfirm"')
    const css = readFileSync("src/components/popconfirm/popconfirm.css", "utf8")
    expect(css).not.toContain("@import")
    const source = readFileSync("src/components/popconfirm/popconfirm.ts", "utf8")
    expect(source).toContain("createPopover(trigger, panel, options)")
    expect(source).not.toContain("createPopoverPositioner")
    expect(source).not.toContain("innerHTML")
    expect(source).not.toContain("customElements")
  })
})
