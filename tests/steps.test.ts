import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createSteps, Steps, Step, registerSteps, stepStatuses } from "../src/components/steps/index.js"
import type { StepsController, StepsOptions } from "../src/components/steps/index.js"
import { ViewElement } from "../src/core/index.js"

const controllers: StepsController[] = []
function fixture() {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "steps.html"), "utf8"), "text/html")
  const list = document.importNode(parsed.querySelector("#steps")!, true) as HTMLOListElement
  for (const action of list.querySelectorAll<HTMLButtonElement>("[data-step-action]")) action.hidden = false
  document.body.append(list)
  const items = [...list.children].filter(node => node.localName === "li") as HTMLLIElement[]
  const actions = items.map(item => item.querySelector<HTMLButtonElement>("[data-step-action]")!)
  return { list, items, actions }
}
function bind(options: StepsOptions = {}) {
  const nodes = fixture(), controller = createSteps(nodes.list, options)
  controllers.push(controller)
  return { ...nodes, controller }
}
const flush = () => new Promise(resolve => setTimeout(resolve, 20))
afterEach(() => { controllers.splice(0).forEach(controller => controller.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Steps current and independent status", () => {
  it("seeds current from one authored marker and retains one semantic owner", () => {
    const { list, controller, items } = bind()
    expect(controller.current).toBe(2)
    expect(controller.currentStep).toBe(items[1])
    expect(list.querySelectorAll('[aria-current="step"]')).toHaveLength(1)
    expect(items[1]!.hasAttribute("role")).toBe(false)
  })
  it("uses explicit current over default and authored state without events", () => {
    const { list, items } = fixture()
    const event = vi.fn(); list.addEventListener("m:steps-request", event)
    const controller = createSteps(list, { current: 4, defaultCurrent: 1 })
    controllers.push(controller)
    expect(controller.currentStep).toBe(items[3])
    expect(event).not.toHaveBeenCalled()
  })
  it("does not infer earlier completion and honors each explicit status over current status", () => {
    const { controller, items } = bind({ current: 4, status: "error" })
    expect(controller.steps.map(item => item.status)).toEqual(["finish", "wait", "error", "error"])
    expect(items[1]!.querySelector("[data-step-status-text]")!.textContent).toBe("Waiting")
    controller.current = 3
    controller.status = "finish"
    expect(controller.steps[2]!.status).toBe("error")
    expect(controller.steps[1]!.status).toBe("wait")
  })
  it("supports unset/before-first/after-last/clamped current without invented completion", () => {
    const { controller, list } = bind()
    for (const value of [null, 0, 5, Number.MAX_SAFE_INTEGER]) {
      controller.current = value
      expect(controller.currentStep).toBeNull()
      expect(list.querySelectorAll('[aria-current="step"]')).toHaveLength(0)
    }
    expect(controller.current).toBe(5)
    expect(controller.steps.map(item => item.status)).toEqual(["finish", "wait", "error", "wait"])
  })
  it("keeps empty lists useful and normalizes numeric current to zero", () => {
    const { list } = fixture()
    list.replaceChildren()
    const controller = createSteps(list, { current: 10 })
    controllers.push(controller)
    expect(controller.current).toBe(0)
    expect(controller.steps).toEqual([])
    controller.current = null
    expect(controller.current).toBeNull()
  })
  it("uses custom status words as literal text without parsing or replacing text nodes", () => {
    const { list } = fixture(), label = list.querySelector("[data-step-status-text]")!, text = label.firstChild
    const controller = createSteps(list, { labels: { wait: "等待", process: "Current", finish: "<b>Done</b>", error: "Error" } })
    controllers.push(controller)
    expect(label.textContent).toBe("<b>Done</b>")
    expect(label.children).toHaveLength(0)
    expect(label.firstChild).toBe(text)
  })
  it.each([{ current: -1 }, { current: 1.5 }, { current: Infinity }, { current: Number.MAX_SAFE_INTEGER + 1 }, { defaultCurrent: -1 }, { status: "blocked" }, { labels: null }, { labels: { wait: "Wait" } }, { unknown: true }])("rejects invalid options %j", options => {
    const { list } = fixture()
    expect(() => createSteps(list, options as StepsOptions)).toThrow()
  })
})

describe("native selection intents, not a wizard", () => {
  it("emits a captured native button intent without automatically selecting", async () => {
    const { list, actions, controller, items } = bind()
    const request = vi.fn(); list.addEventListener("m:steps-request", request)
    actions[3]!.click(); await flush()
    expect(controller.current).toBe(2)
    expect(request).toHaveBeenCalledTimes(1)
    expect(request.mock.calls[0]![0].detail).toEqual({ current: 4, previous: 2, step: items[3], action: actions[3] })
    expect(request.mock.calls[0]![0].cancelable).toBe(false)
  })
  it("lets the application decline or explicitly accept a request with silent current assignment", async () => {
    const { list, actions, controller } = bind()
    const request = vi.fn(); list.addEventListener("m:steps-request", request)
    actions[0]!.click(); await flush(); expect(controller.current).toBe(2)
    list.addEventListener("m:steps-request", event => { controller.current = (event as CustomEvent).detail.current }, { once: true })
    actions[3]!.click(); await flush(); expect(controller.current).toBe(4)
    expect(request).toHaveBeenCalledTimes(2)
    controller.current = 1
    controller.status = "error"
    controller.refresh()
    expect(request).toHaveBeenCalledTimes(2)
  })
  it("honors late synchronous cancellation and native disabled/fieldset state", async () => {
    const { list, actions } = bind()
    const request = vi.fn(); list.addEventListener("m:steps-request", request)
    list.addEventListener("click", event => event.preventDefault(), { once: true })
    actions[0]!.click(); actions[2]!.click(); await flush()
    expect(request).not.toHaveBeenCalled()
    const fieldset = document.createElement("fieldset"); fieldset.disabled = true
    document.body.append(fieldset); fieldset.append(list)
    actions[3]!.dispatchEvent(new MouseEvent("click", { button: 0, bubbles: true }))
    await flush(); expect(request).not.toHaveBeenCalled()
  })
  it("uses typed buttons in native forms and does not synthesize keyboard activation", async () => {
    const { list, actions } = bind(), form = document.createElement("form")
    document.body.append(form); form.append(list)
    const request = vi.fn(), submit = vi.fn(event => event.preventDefault())
    list.addEventListener("m:steps-request", request); form.addEventListener("submit", submit)
    actions[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    actions[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }))
    await flush(); expect(request).not.toHaveBeenCalled()
    actions[0]!.click(); await flush()
    expect(request).toHaveBeenCalledTimes(1); expect(submit).not.toHaveBeenCalled()
  })
  it("leaves native link href/target/modifiers and authored cancellation untouched", async () => {
    const { list, controller } = bind(), link = list.querySelector<HTMLAnchorElement>("#native-link")!
    const request = vi.fn(); list.addEventListener("m:steps-request", request)
    link.target = "_blank"
    const event = new MouseEvent("click", { ctrlKey: true, bubbles: true, cancelable: true })
    link.addEventListener("click", event => { expect(event.defaultPrevented).toBe(false); event.preventDefault() })
    link.dispatchEvent(event); await flush()
    expect(request).not.toHaveBeenCalled(); expect(controller.current).toBe(2)
    expect(link.getAttribute("href")).toBe("#native-note")
    expect(link.target).toBe("_blank")
  })
  it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }])("does not turn modified activation into selection %j", modifiers => {
    const { list, actions } = bind(), request = vi.fn()
    list.addEventListener("m:steps-request", request)
    actions[0]!.dispatchEvent(new MouseEvent("click", { bubbles: true, ...modifiers }))
    expect(request).not.toHaveBeenCalled()
  })
  it("invalidates queued work on setter/refresh/disconnect", async () => {
    const { list, actions, controller } = bind(), request = vi.fn()
    list.addEventListener("m:steps-request", request)
    actions[0]!.click(); controller.current = 3; await flush()
    actions[0]!.click(); controller.refresh(); await flush()
    actions[0]!.click(); controller.disconnect(); await flush()
    expect(request).not.toHaveBeenCalled()
  })
  it("reports stale unrefreshed anatomy rather than dispatching a wrong index", async () => {
    const { list, items, actions, controller } = bind(), error = vi.fn(), request = vi.fn()
    list.addEventListener("m:steps-error", error); list.addEventListener("m:steps-request", request)
    actions[3]!.click(); list.insertBefore(items[3]!, items[0]!)
    await flush()
    expect(error).toHaveBeenCalledTimes(1); expect(request).not.toHaveBeenCalled()
    expect(controller.connected).toBe(false)
  })
})

describe("native identity, hidden items and ownership", () => {
  it("preserves current node when inserting/reordering, and falls back by ordinal when removed", () => {
    const { list, controller, items } = bind()
    const inserted = items[3]!.cloneNode(true) as HTMLLIElement
    inserted.removeAttribute("id")
    list.insertBefore(inserted, items[1]!)
    controller.refresh()
    expect(controller.currentStep).toBe(items[1]); expect(controller.current).toBe(3)
    list.insertBefore(items[1]!, items[0]!)
    controller.refresh()
    expect(controller.current).toBe(1)
    items[1]!.remove(); controller.refresh()
    expect(controller.currentStep).toBe(items[0])
  })
  it("excludes hidden items and marks only the last visible boundary", () => {
    const { items, controller } = bind({ current: 4 })
    items[3]!.hidden = true; controller.refresh()
    expect(controller.currentStep).toBe(items[2])
    expect(controller.current).toBe(3)
    expect(controller.steps).toHaveLength(3)
    expect(items[2]!.hasAttribute("data-step-following")).toBe(false)
    expect(items[1]!.hasAttribute("data-step-following")).toBe(true)
    expect(items[3]!.hasAttribute("aria-current")).toBe(false)
    items[3]!.hidden = false; controller.refresh()
    expect(controller.current).toBe(3)
  })
  it("keeps an after-last sentinel after appending steps, without selecting them", () => {
    const { list, items, controller } = bind({ current: 5 })
    list.append(items[3]!.cloneNode(true)); controller.refresh()
    expect(controller.current).toBe(6); expect(controller.currentStep).toBeNull()
  })
  it("retains title, description, icon, button and status text-node identity", () => {
    const { list, controller, actions } = bind()
    const title = list.querySelector("[data-step-title]"), label = list.querySelector("[data-step-status-text]")!, text = label.firstChild
    const listener = vi.fn(); actions[0]!.addEventListener("click", listener)
    controller.current = 1; controller.status = "wait"; controller.refresh()
    expect(list.querySelector("[data-step-title]")).toBe(title)
    expect(label.firstChild).toBe(text)
    controller.disconnect(); actions[0]!.click()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(actions[2]!.disabled).toBe(true)
  })
  it("restores only owned state, retaining observable author text/ARIA updates", () => {
    const { controller, items } = bind()
    const text = items[0]!.querySelector("[data-step-status-text]")!.firstChild!
    text.textContent = "Author changed this"
    items[1]!.setAttribute("aria-current", "location")
    controller.disconnect()
    expect(text.textContent).toBe("Author changed this")
    expect(items[1]!.getAttribute("aria-current")).toBe("location")
    expect(items[0]!.hasAttribute("data-step-state")).toBe(false)
  })
  it("scopes nested lists and their current/status markers independently", () => {
    const outer = bind(), innerList = outer.list.querySelector<HTMLOListElement>("#nested")!
    const inner = createSteps(innerList, { current: 1 }); controllers.push(inner)
    outer.controller.current = 4; outer.controller.refresh()
    expect(inner.current).toBe(1)
    expect(inner.currentStep!.getAttribute("aria-current")).toBe("step")
    expect(outer.controller.steps).toHaveLength(4)
  })
  it("hands transferred item ownership over without restoring the old controller over new state", () => {
    const first = bind({ current: 4 }), second = bind({ current: 1 })
    const moved = first.items[3]!
    second.list.append(moved); second.controller.refresh()
    first.controller.refresh(); first.controller.disconnect()
    expect(moved.getAttribute("data-step-state")).toBe("wait")
    second.controller.disconnect()
    expect(moved.hasAttribute("data-step-state")).toBe(false)
    expect(moved.querySelector("[data-step-status-text]")!.textContent).toBe("Waiting")
  })
  it("does not adopt a transferred helper marker as a new list's authored default", () => {
    const { items } = bind({ current: 4 })
    const list = document.createElement("ol"); list.className = "m-steps"; list.setAttribute("data-steps", "")
    document.body.append(list); list.append(items[3]!)
    const controller = createSteps(list); controllers.push(controller)
    expect(controller.current).toBeNull()
  })
  it("recovers focus on explicit refresh after hidden/removed/disabled actions without stealing outside focus", () => {
    const { actions, items, controller } = bind()
    actions[3]!.focus(); items[3]!.hidden = true; actions[3]!.blur(); controller.refresh()
    expect(document.activeElement).toBe(actions[1])
    const outside = document.createElement("input"); document.body.append(outside); outside.focus()
    items[1]!.remove(); controller.refresh()
    expect(document.activeElement).toBe(outside)
  })
  it("recovers focus when CSS hides a containing step, not the action itself", () => {
    const { actions, items, controller } = bind({ current: 4 })
    actions[3]!.focus(); items[3]!.style.display = "none"; actions[3]!.blur()
    controller.refresh()
    expect(controller.currentStep).toBe(items[2])
    expect(document.activeElement).toBe(actions[0])
  })
  it("tracks preexisting focused controls and uses a programmatic-only list fallback", () => {
    const { list, actions } = fixture()
    actions[0]!.focus()
    const controller = createSteps(list); controllers.push(controller)
    for (const action of actions) action.disabled = true
    actions[0]!.blur(); controller.refresh()
    expect(document.activeElement).toBe(list); expect(list.tabIndex).toBe(-1)
    controller.disconnect()
    expect(list.hasAttribute("tabindex")).toBe(false)
  })
  it("supports refresh after replacing a status span and restores its prior text identity", () => {
    const { items, controller } = bind()
    const label = items[1]!.querySelector("[data-step-status-text]")!, text = label.firstChild
    const replacement = label.cloneNode(true); label.replaceWith(replacement)
    controller.refresh(); controller.status = "error"
    expect(replacement.textContent).toBe("Error")
    expect(label.firstChild).toBe(text); expect(label.textContent).toBe("In progress")
  })
  it("cleans up and reconnects without duplicate intent handlers", async () => {
    const { list, controller, actions } = bind(), request = vi.fn()
    list.addEventListener("m:steps-request", request)
    controller.disconnect(); controller.connect(); controller.connect()
    actions[0]!.click(); await flush()
    expect(request).toHaveBeenCalledTimes(1)
    expect(() => createSteps(list)).toThrow(/active controller/)
  })
  it("validates unsafe form actions, duplicate semantic owners and misleading list numbering", () => {
    const { list, actions } = fixture()
    actions[0]!.removeAttribute("type")
    expect(() => createSteps(list)).toThrow(/type=button/)
    actions[0]!.type = "button"; actions[0]!.setAttribute("aria-current", "step")
    expect(() => createSteps(list)).toThrow(/sole aria-current/)
    actions[0]!.removeAttribute("aria-current"); list.start = 5
    expect(() => createSteps(list)).toThrow(/one-based/)
  })
  it("rejects unresolved action naming rather than claiming an accessible control", () => {
    const { list, actions } = fixture()
    actions[0]!.textContent = ""
    actions[0]!.setAttribute("aria-labelledby", "missing-label")
    expect(() => createSteps(list)).toThrow(/named/)
  })
  it("keeps native list markers and external CSS without a renderer or layout observer", () => {
    const css = readFileSync(join("src", "components", "steps", "steps.css"), "utf8")
    const source = readFileSync(join("src", "components", "steps", "steps.ts"), "utf8")
    expect(css.replace(/\s/g, "")).toContain("list-style:decimal")
    expect(css).toContain("data-step-following")
    expect(css).toContain("forced-colors")
    expect(css).toContain("@media print")
    expect(source).not.toMatch(/innerHTML|MutationObserver|ResizeObserver|keydown|setInterval/)
  })
})

describe("canonical Steps ViewElement", () => {
  it("exports canonical own-tag ViewElements and registers m-steps, m-step", () => {
    expect(Steps.tag).toBe("m-steps")
    expect(Step.tag).toBe("m-step")
    expect(ViewElement.prototype.isPrototypeOf(Steps.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(Step.prototype)).toBe(true)
    expect(customElements.get("m-steps")).toBe(Steps)
    expect(customElements.get("m-step")).toBe(Step)
    expect(Steps.observedAttributes).toEqual(["current", "status", "vertical"])
    expect(Step.observedAttributes).toEqual(["title", "description", "disabled"])
    expect(stepStatuses).toEqual(["process", "finish", "error", "wait"])
    expect(() => registerSteps()).not.toThrow()
  })

  it("handles typed properties and default values on Steps", () => {
    const steps = document.createElement("m-steps") as Steps
    document.body.append(steps)

    expect(steps.current).toBe(1)
    expect(steps.status).toBe("process")
    expect(steps.vertical).toBe(false)

    steps.current = 3
    expect(steps.current).toBe(3)
    expect(steps.getAttribute("current")).toBe("3")

    steps.setAttribute("current", "4")
    expect(steps.current).toBe(4)

    steps.status = "finish"
    expect(steps.status).toBe("finish")
    expect(steps.getAttribute("status")).toBe("finish")

    steps.vertical = true
    expect(steps.vertical).toBe(true)
    expect(steps.hasAttribute("vertical")).toBe(true)
    expect(steps.classList.contains("m-steps--vertical")).toBe(true)

    steps.vertical = false
    expect(steps.vertical).toBe(false)
    expect(steps.hasAttribute("vertical")).toBe(false)
    expect(steps.classList.contains("m-steps--vertical")).toBe(false)

    expect(() => { steps.current = 0 }).toThrow(RangeError)
    expect(() => { steps.current = -1 }).toThrow(RangeError)
    expect(() => { steps.status = "invalid" as unknown as typeof steps.status }).toThrow(RangeError)
  })

  it("handles typed properties on Step", () => {
    const step = document.createElement("m-step") as Step
    document.body.append(step)

    expect(step.title).toBe("")
    expect(step.description).toBe("")
    expect(step.disabled).toBe(false)

    step.title = "Verification"
    expect(step.title).toBe("Verification")
    expect(step.getAttribute("title")).toBe("Verification")

    step.description = "Submit your documents"
    expect(step.description).toBe("Submit your documents")
    expect(step.getAttribute("description")).toBe("Submit your documents")

    step.disabled = true
    expect(step.disabled).toBe(true)
    expect(step.hasAttribute("disabled")).toBe(true)

    step.disabled = false
    expect(step.disabled).toBe(false)
    expect(step.hasAttribute("disabled")).toBe(false)
  })

  it("renders child steps and synchronizes step progression", () => {
    document.body.innerHTML = `
      <m-steps current="2" status="process">
        <m-step title="Step 1" description="First description"></m-step>
        <m-step title="Step 2" description="Second description"></m-step>
        <m-step title="Step 3" description="Third description"></m-step>
      </m-steps>`
    const steps = document.querySelector("m-steps") as Steps
    expect(steps.steps).toHaveLength(3)

    const [step1, step2, step3] = steps.steps
    expect(step1!.getAttribute("data-step-state")).toBe("finish")
    expect(step1!.hasAttribute("data-step-following")).toBe(true)
    expect(step1!.hasAttribute("aria-current")).toBe(false)
    expect(step1!.querySelector("[data-step-title]")!.textContent).toBe("Step 1")
    expect(step1!.querySelector(".m-step__description")!.textContent).toBe("First description")
    expect(step1!.querySelector("[data-step-status-text]")!.textContent).toBe("Completed")
    expect(step1!.querySelector(".m-step__icon")!.textContent).toBe("✓")

    expect(step2!.getAttribute("data-step-state")).toBe("process")
    expect(step2!.hasAttribute("data-step-following")).toBe(true)
    expect(step2!.getAttribute("aria-current")).toBe("step")
    expect(step2!.querySelector("[data-step-title]")!.textContent).toBe("Step 2")
    expect(step2!.querySelector("[data-step-status-text]")!.textContent).toBe("In progress")
    expect(step2!.querySelector(".m-step__icon")!.textContent).toBe("2")

    expect(step3!.getAttribute("data-step-state")).toBe("wait")
    expect(step3!.hasAttribute("data-step-following")).toBe(false)
    expect(step3!.hasAttribute("aria-current")).toBe(false)
    expect(step3!.querySelector("[data-step-title]")!.textContent).toBe("Step 3")
    expect(step3!.querySelector("[data-step-status-text]")!.textContent).toBe("Waiting")
    expect(step3!.querySelector(".m-step__icon")!.textContent).toBe("3")
  })

  it("supports select(), next(), previous(), and emits m:change", () => {
    document.body.innerHTML = `
      <m-steps current="1">
        <m-step title="Step 1"></m-step>
        <m-step title="Step 2"></m-step>
        <m-step title="Step 3"></m-step>
      </m-steps>`
    const steps = document.querySelector("m-steps") as Steps
    const changeSpy = vi.fn()
    steps.addEventListener("m:change", changeSpy)

    steps.select(2)
    expect(steps.current).toBe(2)
    expect(changeSpy).toHaveBeenCalledOnce()
    expect(changeSpy.mock.calls[0]![0].detail).toEqual({ current: 2 })

    steps.next()
    expect(steps.current).toBe(3)
    expect(changeSpy).toHaveBeenCalledTimes(2)
    expect(changeSpy.mock.calls[1]![0].detail).toEqual({ current: 3 })

    steps.previous()
    expect(steps.current).toBe(2)
    expect(changeSpy).toHaveBeenCalledTimes(3)
    expect(changeSpy.mock.calls[2]![0].detail).toEqual({ current: 2 })

    // Selecting the same step should not re-emit
    steps.select(2)
    expect(changeSpy).toHaveBeenCalledTimes(3)
  })

  it("selects step upon click when enabled and ignores clicks when disabled", () => {
    document.body.innerHTML = `
      <m-steps current="1">
        <m-step title="Step 1"></m-step>
        <m-step title="Step 2" disabled></m-step>
        <m-step title="Step 3"></m-step>
      </m-steps>`
    const steps = document.querySelector("m-steps") as Steps
    const changeSpy = vi.fn()
    steps.addEventListener("m:change", changeSpy)

    const [step1, step2, step3] = steps.steps
    expect(step2!.hasAttribute("data-step-action-disabled")).toBe(true)

    // Click disabled step - should do nothing
    step2!.click()
    expect(steps.current).toBe(1)
    expect(changeSpy).not.toHaveBeenCalled()

    // Select disabled step programmatically - should do nothing
    steps.select(2)
    expect(steps.current).toBe(1)
    expect(changeSpy).not.toHaveBeenCalled()

    // Click step 3 - should select
    step3!.click()
    expect(steps.current).toBe(3)
    expect(changeSpy).toHaveBeenCalledOnce()
    expect(changeSpy.mock.calls[0]![0].detail).toEqual({ current: 3 })
  })

  it("honors step status override and container error status", () => {
    document.body.innerHTML = `
      <m-steps current="2" status="error">
        <m-step title="Step 1"></m-step>
        <m-step title="Step 2"></m-step>
        <m-step title="Step 3" data-step-status="finish"></m-step>
      </m-steps>`
    const steps = document.querySelector("m-steps") as Steps
    const [step1, step2, step3] = steps.steps

    expect(step1!.getAttribute("data-step-state")).toBe("finish")
    expect(step2!.getAttribute("data-step-state")).toBe("error")
    expect(step2!.querySelector(".m-step__icon")!.textContent).toBe("!")
    expect(step2!.querySelector("[data-step-status-text]")!.textContent).toBe("Error")
    expect(step3!.getAttribute("data-step-state")).toBe("finish")
    expect(step3!.querySelector(".m-step__icon")!.textContent).toBe("✓")
  })
})

