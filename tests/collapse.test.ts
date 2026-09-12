import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createCollapse } from "../src/components/collapse/controller.js"
import type { CollapseController, CollapseOptions } from "../src/components/collapse/controller.js"
import { Collapse, CollapseItem, CollapseHeader, CollapseHeaderExtra, CollapseContent, registerCollapse } from "../src/components/collapse/index.js"
import * as collapseApi from "../src/components/collapse/index.js"
import { ViewElement } from "../src/core/index.js"
import { createContext, runInContext } from "node:vm"
import { gzipSync } from "node:zlib"

const controllers: CollapseController[] = []
function nodes() {
  const root = document.createElement("div")
  root.className = "m-collapse"
  root.setAttribute("data-collapse", "")
  root.innerHTML = `
    <div class="m-collapse-row"><details data-collapse-item data-collapse-key="one"><summary>First section</summary><div data-collapse-content><p>Original content</p><input value="Original"><a href="#destination">Destination</a></div></details><div data-collapse-extra><button type="button">Extra action</button></div></div>
    <details data-collapse-item data-collapse-key="two"><summary>Second section</summary><div data-collapse-content>Second content</div></details>
    <details data-collapse-item data-collapse-key="disabled" data-collapse-disabled><summary>Disabled toggle</summary><div data-collapse-content>Readable disabled content</div></details>`
  document.body.append(root)
  const item = (name: string) => root.querySelector<HTMLDetailsElement>(`[data-collapse-key="${name}"]`)!
  const summary = (name: string) => item(name).firstElementChild as HTMLElement
  return { root, item, summary, extra: root.querySelector<HTMLButtonElement>("[data-collapse-extra] button")! }
}
function bind(options: CollapseOptions = {}) {
  const pair = nodes()
  const controller = createCollapse(pair.root, options)
  controllers.push(controller)
  return { ...pair, controller }
}
async function flush() {
  for (let index = 0; index < 4; index++) await new Promise(resolve => setTimeout(resolve, 0))
}
function canonical(options: Partial<Pick<Collapse, "accordion" | "expandedKeys" | "defaultExpandedKeys">> = {}, connect = true) {
  const root = document.createElement("m-collapse") as Collapse
  root.innerHTML = `<m-collapse-item key="one">
    <m-collapse-header><h3>First section</h3></m-collapse-header>
    <m-collapse-header-extra><button type="button">Independent action</button></m-collapse-header-extra>
    <m-collapse-content><input value="Original"><p>Retained content</p></m-collapse-content>
    </m-collapse-item><m-collapse-item key="two"><m-collapse-header>Second section</m-collapse-header><m-collapse-content>Second content</m-collapse-content></m-collapse-item>
    <m-collapse-item key="disabled" disabled><m-collapse-header>Disabled activation</m-collapse-header><m-collapse-content>Readable content</m-collapse-content></m-collapse-item>`
  Object.assign(root, options)
  const item = (key: string) => root.querySelector<CollapseItem>(`:scope > m-collapse-item[key="${key}"]`)!
  const summary = (key: string) => item(key).querySelector<HTMLElement>(":scope > details > summary")!
  if (connect) document.body.append(root)
  return { root, item, summary }
}
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("direct Collapse family", () => {
  it("exports only five own-tag ViewElement classes and atomic registration", () => {
    expect(Object.keys(collapseApi).sort()).toEqual(["Collapse", "CollapseContent", "CollapseHeader", "CollapseHeaderExtra", "CollapseItem", "registerCollapse"])
    for (const type of [Collapse, CollapseItem, CollapseHeader, CollapseHeaderExtra, CollapseContent]) {
      expect(Object.hasOwn(type, "tag")).toBe(true)
      expect(ViewElement.prototype.isPrototypeOf(type.prototype)).toBe(true)
      expect(customElements.get(type.tag)).toBe(type)
      expect("meta" in type).toBe(false)
    }
    const define = vi.fn()
    expect(() => registerCollapse({ get: name => name === "m-collapse" ? class extends HTMLElement {} : undefined, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerCollapse()).not.toThrow()
  })
  it("keeps one decorative, font-independent SVG arrow across state changes and reconnect", async () => {
    const { root, summary } = canonical()
    const arrow = summary("one").querySelector<SVGSVGElement>('svg[data-part="arrow"]')!
    const path = arrow.querySelector("path")!
    expect(arrow.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(arrow.getAttribute("viewBox")).toBe("0 0 24 24")
    expect(arrow.getAttribute("aria-hidden")).toBe("true")
    expect(arrow.getAttribute("focusable")).toBe("false")
    expect(arrow.textContent).toBe("")
    expect(path.getAttribute("d")).toBe("m9 6 6 6-6 6")
    expect(path.getAttribute("stroke")).toBe("currentColor")
    expect(path.getAttribute("fill")).toBe("none")
    root.expand("one")
    await flush()
    root.collapse("one")
    root.remove()
    document.body.append(root)
    await flush()
    expect(summary("one").querySelectorAll('[data-part="arrow"]')).toHaveLength(1)
    expect(summary("one").querySelector('[data-part="arrow"]')).toBe(arrow)
    expect(arrow.querySelector("path")).toBe(path)
  })
  it("uses copied property-only key arrays with explicit precedence and reset-only defaults", async () => {
    const initial = ["one"]
    const { root } = canonical({ defaultExpandedKeys: initial, expandedKeys: ["two"] })
    initial.push("two")
    expect(root.state).toBe("ready")
    expect(root.expandedKeys).toEqual(["two"])
    expect(root.defaultExpandedKeys).toEqual(["one"])
    expect(Object.isFrozen(root.expandedKeys)).toBe(true)
    expect(Object.isFrozen(root.defaultExpandedKeys)).toBe(true)
    root.defaultExpandedKeys = ["disabled"]
    expect(root.expandedKeys).toEqual(["two"])
    root.reset()
    expect(root.expandedKeys).toEqual(["disabled"])
    root.expand("one")
    root.expand("one")
    expect(root.expandedKeys).toEqual(["one", "disabled"])
    root.collapse("one")
    root.toggle("two")
    expect(root.expandedKeys).toEqual(["two", "disabled"])
    root.expandedKeys = []
    expect(root.expandedKeys).toEqual([])
    expect(root.hasAttribute("expanded-keys") || root.hasAttribute("default-expanded-keys")).toBe(false)
    await flush()
  })
  it("rejects invalid collections, unknown keys and accordion conflicts without mutation", () => {
    const { root, item } = canonical({ expandedKeys: ["one"] })
    for (const value of [null, "one", 1, [1], [""], [" "], ["one", "one"], ["missing"]]) {
      expect(() => Reflect.set(root, "expandedKeys", value)).toThrow()
      expect(root.expandedKeys).toEqual(["one"])
      expect(() => Reflect.set(root, "defaultExpandedKeys", value)).toThrow()
    }
    expect(() => root.expand("missing")).toThrow("Unknown")
    expect(() => root.collapse("missing")).toThrow("Unknown")
    expect(() => Reflect.set(root, "accordion", "false")).toThrow()
    expect(() => { item("one").key = "two" }).toThrow("unique")
    expect(() => { item("one").key = "" }).toThrow()
    expect(() => Reflect.set(item("one"), "disabled", "false")).toThrow()
    root.expandedKeys = ["one", "two"]
    root.accordion = true
    expect(root.expandedKeys).toEqual(["one"])
    expect(() => { root.expandedKeys = ["one", "two"] }).toThrow("only one")
    root.expand("two")
    expect(root.expandedKeys).toEqual(["two"])
  })
  it("preserves public region and input identity and places extras outside the single native owner", async () => {
    const { root, item, summary } = canonical({}, false)
    const header = item("one").querySelector("m-collapse-header")!
    const content = item("one").querySelector("m-collapse-content")!
    const extra = item("one").querySelector("m-collapse-header-extra")!
    const input = content.querySelector("input")!
    const action = extra.querySelector("button")!, clicked = vi.fn()
    action.addEventListener("click", clicked)
    input.value = "Edited"
    document.body.append(root)
    expect(header.parentElement).toBe(summary("one"))
    expect(content.parentElement).toBe(item("one").querySelector("details"))
    expect(extra.parentElement).toBe(item("one"))
    expect(extra.closest("summary,details")).toBeNull()
    expect(summary("one").hasAttribute("role") || summary("one").hasAttribute("aria-expanded") || summary("one").hasAttribute("tabindex")).toBe(false)
    expect(item("one").querySelectorAll("summary")).toHaveLength(1)
    action.click()
    await flush()
    expect(clicked).toHaveBeenCalledOnce()
    expect(root.expandedKeys).toEqual([])
    summary("one").click()
    await flush()
    expect(root.expandedKeys).toEqual(["one"])
    expect(input.value).toBe("Edited")
    root.refresh()
    expect(item("one").querySelector("m-collapse-header")).toBe(header)
    expect(item("one").querySelector("m-collapse-content")).toBe(content)
  })
  it("blocks disabled user activation immediately but permits explicit programmatic expansion", async () => {
    const { root, item, summary } = canonical()
    summary("disabled").click()
    await flush()
    expect(item("disabled").expanded).toBe(false)
    root.expand("disabled")
    expect(item("disabled").expanded).toBe(true)
    summary("disabled").click()
    expect(item("disabled").expanded).toBe(true)
    item("disabled").disabled = false
    summary("disabled").click()
    await flush()
    expect(item("disabled").expanded).toBe(false)
    expect(summary("disabled").hasAttribute("aria-disabled")).toBe(false)
    item("one").disabled = true
    expect(summary("one").getAttribute("aria-disabled")).toBe("true")
    summary("one").click()
    expect(item("one").expanded).toBe(false)
  })
  it("retains native event timing, cancelation and owner-scoped bubbling notifications", async () => {
    const { root, summary, item } = canonical()
    const changed = vi.fn(), headers = vi.fn()
    root.addEventListener("m:expanded-changed", changed)
    root.addEventListener("m:header-activated", headers)
    const cancel = (event: Event) => event.preventDefault()
    summary("one").addEventListener("click", cancel)
    summary("one").click()
    await flush()
    expect(headers).not.toHaveBeenCalled()
    summary("one").removeEventListener("click", cancel)
    summary("one").click()
    await flush()
    expect(headers).toHaveBeenCalledOnce()
    expect(changed).toHaveBeenCalledOnce()
    const event = changed.mock.calls[0]![0] as CustomEvent
    expect(event.bubbles).toBe(true)
    expect(event.cancelable || event.composed).toBe(false)
    expect(event.detail).toMatchObject({ key: "one", expanded: true, item: item("one"), expandedKeys: ["one"] })
    expect(event.detail.originalEvent.type).toBe("toggle")
    root.collapse("one")
    await flush()
    expect(headers).toHaveBeenCalledOnce()
    expect(changed).toHaveBeenCalledTimes(2)
  })
  it("waits for late regions, renders once, and preserves keyed replacement expansion", async () => {
    const root = document.createElement("m-collapse") as Collapse
    document.body.append(root)
    const item = document.createElement("m-collapse-item") as CollapseItem
    root.append(item)
    await flush()
    expect(root.state).toBe("pending")
    item.key = "late"
    item.innerHTML = "<m-collapse-header>Late header</m-collapse-header><m-collapse-content><input value=Initial></m-collapse-content>"
    await flush()
    expect(root.state).toBe("ready")
    root.expand("late")
    const details = item.querySelector("details"), summary = item.querySelector("summary")
    root.refresh()
    expect(item.querySelector("details")).toBe(details)
    expect(item.querySelector("summary")).toBe(summary)
    const replacement = document.createElement("m-collapse-item") as CollapseItem
    replacement.key = "late"
    replacement.innerHTML = "<m-collapse-header>Replacement</m-collapse-header><m-collapse-content>New</m-collapse-content>"
    item.replaceWith(replacement)
    await flush()
    expect(root.expandedKeys).toEqual(["late"])
    expect(replacement.querySelectorAll("summary")).toHaveLength(1)
    replacement.innerHTML = "<m-collapse-header>Replaced regions</m-collapse-header><m-collapse-content>Only current content</m-collapse-content>"
    await flush()
    expect(root.state).toBe("ready")
    expect(replacement.querySelectorAll("m-collapse-header")).toHaveLength(1)
    expect(replacement.querySelectorAll("summary")).toHaveLength(1)
    expect(replacement.textContent).not.toContain("Replacement")
  })
  it("restores owned semantics and retains open state and edited content across reconnect", async () => {
    const { root, item, summary } = canonical({ expandedKeys: ["one"], accordion: true })
    const input = item("one").querySelector("input")!, control = summary("one")
    input.value = "Retained"
    await flush()
    const changed = vi.fn()
    root.addEventListener("m:expanded-changed", changed)
    root.remove()
    expect(root.state).toBe("disconnected")
    expect(summary("disabled").hasAttribute("aria-disabled")).toBe(false)
    expect(() => root.expand("two")).toThrow("Connect")
    document.body.append(root)
    expect(root.expandedKeys).toEqual(["one"])
    expect(summary("one")).toBe(control)
    expect(input.value).toBe("Retained")
    root.expand("two")
    await flush()
    expect(changed.mock.calls.filter(([event]) => event.detail.key === "two")).toHaveLength(1)
    root.remove()
    root.expandedKeys = ["disabled"]
    document.body.append(root)
    expect(root.expandedKeys).toEqual(["disabled"])
  })
  it("keeps nested groups independent and recovers focus to the outer header when content closes", async () => {
    const outer = canonical({ expandedKeys: ["one"], accordion: true })
    const inner = canonical({ expandedKeys: ["one"], accordion: true }, false)
    outer.item("one").querySelector("m-collapse-content")!.append(inner.root)
    await flush()
    expect(outer.root.state).toBe("ready")
    inner.item("one").querySelector("input")!.focus()
    outer.root.collapse("one")
    await flush()
    expect(document.activeElement).toBe(outer.summary("one"))
    expect(inner.root.expandedKeys).toEqual(["one"])
    inner.root.expand("two")
    await flush()
    expect(outer.root.expandedKeys).toEqual([])
    expect(inner.root.expandedKeys).toEqual(["two"])
  })
  it("rejects invalid public regions and passive-header violations before generating controls", async () => {
    const { root, item } = canonical({}, false)
    item("one").querySelector("m-collapse-header")!.innerHTML = "<button type=button>Invalid</button>"
    const error = vi.fn()
    root.addEventListener("m:error", error)
    document.body.append(root)
    expect(root.state).toBe("invalid")
    expect(error).toHaveBeenCalledOnce()
    expect(item("one").querySelector("summary")).toBeNull()
    item("one").querySelector("m-collapse-header")!.textContent = "Fixed"
    await flush()
    expect(root.state).toBe("ready")
    item("two").setAttribute("key", "one")
    expect(() => root.refresh()).toThrow("unique")
    expect(root.state).toBe("invalid")
  })
  it("upgrades own collection and item properties before initializing native state", async () => {
    const { root, item } = canonical({}, false)
    Object.defineProperty(root, "expandedKeys", { configurable: true, value: ["two"] })
    Object.defineProperty(root, "accordion", { configurable: true, value: true })
    Object.defineProperty(item("one"), "disabled", { configurable: true, value: true })
    document.body.append(root)
    await flush()
    expect(root.expandedKeys).toEqual(["two"])
    expect(root.accordion).toBe(true)
    expect(item("one").disabled).toBe(true)
    expect(Object.hasOwn(root, "expandedKeys")).toBe(false)
    expect(Object.hasOwn(item("one"), "disabled")).toBe(false)
  })
  it("rejects Checkbox as interactive passive-header content", () => {
    const { root, item } = canonical({}, false)
    item("one").querySelector("m-collapse-header")!.innerHTML = "<m-checkbox>Checkbox</m-checkbox>"
    document.body.append(root)
    expect(root.state).toBe("invalid")
    expect(item("one").querySelector("summary")).toBeNull()
  })
})

describe("native Collapse and CollapseItem anatomy", () => {
  it("keeps native summary roles/expanded state and all original content/listeners/templates", async () => {
    const { root, item, summary, controller } = bind()
    const input = item("one").querySelector("input")!
    const original = item("one").querySelector("p")
    const template = document.createElement("template")
    template.innerHTML = "<button type='button'>Inert native template</button>"
    item("one").querySelector("[data-collapse-content]")!.append(template)
    const clicks = vi.fn()
    summary("one").addEventListener("click", clicks)
    input.value = "Retained"
    summary("one").click()
    await flush()
    expect(item("one").open).toBe(true)
    expect(summary("one").hasAttribute("role")).toBe(false)
    expect(summary("one").hasAttribute("aria-expanded")).toBe(false)
    summary("one").click()
    await flush()
    expect(clicks).toHaveBeenCalledTimes(2)
    expect(input.value).toBe("Retained")
    expect(item("one").querySelector("p")).toBe(original)
    expect(template.content.firstElementChild?.textContent).toBe("Inert native template")
    controller.disconnect()
    expect(root.hasAttribute("data-collapse-enhanced")).toBe(false)
  })
  it("does not synthesize click/Enter/Space or add a second focus model", async () => {
    const { item, summary } = bind()
    for (const key of ["Enter", " "]) summary("one").dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }))
    await flush()
    expect(item("one").open).toBe(false)
    expect(summary("one").hasAttribute("tabindex")).toBe(false)
  })
  it("supports key aggregation, scalar/null requests and one-time defaults", async () => {
    const { controller, item } = bind({ defaultExpandedNames: "one", expandedNames: ["two"] })
    expect(controller.expandedNames).toEqual(["two"])
    controller.expandedNames = ["one", "two"]
    expect(controller.expandedNames).toEqual(["one", "two"])
    controller.expandedNames = null
    expect(controller.expandedNames).toEqual([])
    item("one").open = true
    await flush()
    controller.refresh()
    expect(controller.expandedNames).toEqual(["one"])
    controller.disconnect()
    controller.connect()
    expect(controller.expandedNames).toEqual(["one"])
  })
  it("adopts authored open state when no defaults are supplied and does not roll it back on disposal", () => {
    const pair = nodes()
    pair.item("one").open = true
    const controller = createCollapse(pair.root)
    controllers.push(controller)
    expect(controller.expandedNames).toEqual(["one"])
    controller.expandedNames = "two"
    controller.disconnect()
    expect(pair.item("two").open).toBe(true)
    expect(pair.item("one").open).toBe(false)
  })
  it.each([{ expandedNames: 1 }, { defaultExpandedNames: ["one", "one"] }, { expandedNames: "missing" }, { accordion: "true" }, { triggerAreas: ["arrow"] }, { displayDirective: "if" }])("rejects invalid or unsupported options %j", options => {
    const { root } = nodes()
    expect(() => createCollapse(root, options as CollapseOptions)).toThrow()
  })
  it("rejects invalid summary/content structure, random/duplicate keys and faux disabling", () => {
    const { root, item, summary } = nodes()
    item("two").setAttribute("data-collapse-key", "one")
    expect(() => createCollapse(root)).toThrow("unique string")
    root.querySelectorAll("[data-collapse-key=one]")[1]!.setAttribute("data-collapse-key", "two")
    summary("one").setAttribute("aria-expanded", "true")
    expect(() => createCollapse(root)).toThrow("expanded semantics")
    summary("one").removeAttribute("aria-expanded")
    summary("one").setAttribute("aria-disabled", "true")
    expect(() => createCollapse(root)).toThrow("disabled item marker")
  })
  it("requires extra actions outside summary and explicitly typed native buttons", () => {
    const { root, summary, extra } = nodes()
    extra.removeAttribute("type")
    expect(() => createCollapse(root)).toThrow("explicit native type")
    extra.type = "button"
    summary("one").append(extra)
    expect(() => createCollapse(root)).toThrow("first native summary")
  })
  it("validates the extra element itself when it is a direct native button", () => {
    const { root, extra } = nodes()
    const wrapper = extra.parentElement!
    wrapper.replaceWith(extra)
    extra.setAttribute("data-collapse-extra", "")
    extra.removeAttribute("type")
    expect(() => createCollapse(root)).toThrow("explicit native type")
  })
})

describe("disabled activation and honest native event policy", () => {
  it("actually blocks disabled summary activation while preserving its readable, focusable label", async () => {
    const { summary, item, root } = bind()
    const headers = vi.fn()
    root.addEventListener("m:collapse-header-click", headers)
    summary("disabled").focus()
    const click = new MouseEvent("click", { bubbles: true, cancelable: true })
    summary("disabled").dispatchEvent(click)
    summary("disabled").click()
    await flush()
    expect(click.defaultPrevented).toBe(true)
    expect(item("disabled").open).toBe(false)
    expect(summary("disabled").getAttribute("aria-disabled")).toBe("true")
    expect(summary("disabled").hasAttribute("inert") || summary("disabled").hasAttribute("tabindex")).toBe(false)
    expect(summary("disabled").textContent).toBe("Disabled toggle")
    expect(headers).not.toHaveBeenCalled()
  })
  it("allows explicit programmatic state overrides of activation-disabled disclosures", async () => {
    const { controller, item, summary } = bind()
    controller.expandedNames = "disabled"
    await flush()
    expect(item("disabled").open).toBe(true)
    summary("disabled").click()
    await flush()
    expect(item("disabled").open).toBe(true)
    controller.setDisabled("disabled", false)
    await flush()
    summary("disabled").click()
    await flush()
    expect(item("disabled").open).toBe(false)
  })
  it("preserves late defaultPrevented on header clicks and reports actual state after native dispatch", async () => {
    const { root, summary, controller } = bind()
    const events: unknown[] = []
    root.addEventListener("m:collapse-header-click", event => events.push((event as CustomEvent).detail))
    const cancel = (event: Event) => event.preventDefault()
    summary("one").addEventListener("click", cancel)
    summary("one").click()
    await flush()
    expect(controller.expandedNames).toEqual([])
    expect(events).toHaveLength(0)
    summary("one").removeEventListener("click", cancel)
    summary("one").click()
    await flush()
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ name: "one", expanded: true })
  })
  it("reports native toggle changes from programmatic updates without inventing user header events", async () => {
    const { root, controller } = bind()
    const changed: unknown[] = []
    const headers = vi.fn()
    root.addEventListener("m:collapse-change", event => changed.push((event as CustomEvent).detail))
    root.addEventListener("m:collapse-header-click", headers)
    controller.expandedNames = "one"
    await flush()
    expect(changed.at(-1)).toMatchObject({ expandedNames: ["one"], name: "one", expanded: true })
    expect(headers).not.toHaveBeenCalled()
  })
  it("keeps extra actions independent from disclosure and preserves intentional form submission", async () => {
    const { root, item, extra } = bind()
    const form = document.createElement("form")
    document.body.append(form)
    form.append(root)
    const clicked = vi.fn()
    const submit = vi.fn((event: Event) => event.preventDefault())
    extra.addEventListener("click", clicked)
    form.addEventListener("submit", submit)
    extra.click()
    await flush()
    expect(clicked).toHaveBeenCalledOnce()
    expect(submit).not.toHaveBeenCalled()
    expect(item("one").open).toBe(false)
    extra.type = "submit"
    await flush()
    extra.click()
    expect(submit).toHaveBeenCalledOnce()
    expect(item("one").open).toBe(false)
  })
})

describe("exclusive groups and native names", () => {
  it("enforces exclusive actual state and rejects multiple requested names", async () => {
    const { item, summary, controller } = bind({ accordion: true, defaultExpandedNames: "one" })
    expect(() => { controller.expandedNames = ["one", "two"] }).toThrow("only one")
    summary("two").click()
    await flush()
    expect(item("one").open).toBe(false)
    expect(item("two").open).toBe(true)
    controller.accordion = false
    controller.expandedNames = ["one", "two"]
    expect(controller.expandedNames).toEqual(["one", "two"])
  })
  it("normalizes existing exclusive state and honors the latest same-task native opening", async () => {
    const { item, controller } = bind({ accordion: true })
    item("one").open = true
    item("two").open = true
    await flush()
    expect(controller.expandedNames).toEqual(["two"])
  })
  it("keeps independent/nested groups with reusable item keys isolated", async () => {
    const outer = bind({ accordion: true })
    const nested = bind({ accordion: true })
    outer.item("two").querySelector("[data-collapse-content]")!.append(nested.root)
    await flush()
    outer.controller.expandedNames = "two"
    nested.controller.expandedNames = "one"
    await flush()
    expect(outer.controller.expandedNames).toEqual(["two"])
    expect(nested.controller.expandedNames).toEqual(["one"])
    nested.summary("two").click()
    await flush()
    expect(outer.item("two").open).toBe(true)
    expect(nested.controller.expandedNames).toEqual(["two"])
  })
  it("allows sibling header-extra actions within an explicitly nested group", async () => {
    const outer = bind()
    const nested = nodes()
    outer.item("one").querySelector("[data-collapse-content]")!.append(nested.root)
    const controller = createCollapse(nested.root)
    controllers.push(controller)
    nested.extra.click()
    await flush()
    expect(controller.connected).toBe(true)
    expect(nested.item("one").open).toBe(false)
  })
  it("transfers a disabled item's helper ownership without disconnecting its destination", async () => {
    const destination = bind({ accordion: true })
    const source = bind({ accordion: true })
    const moved = source.item("disabled")
    moved.setAttribute("data-collapse-key", "moved")
    destination.root.append(moved)
    ;(moved.querySelector("summary") as HTMLElement).click()
    expect(moved.open).toBe(false)
    await flush()
    expect(destination.controller.connected).toBe(true)
    expect(source.controller.connected).toBe(true)
    expect(moved.querySelector("summary")!.getAttribute("aria-disabled")).toBe("true")
    ;(moved.querySelector("summary") as HTMLElement).click()
    await flush()
    expect(moved.open).toBe(false)
    source.controller.disconnect()
    expect(moved.querySelector("summary")!.getAttribute("aria-disabled")).toBe("true")
  })
  it("rejects nested items in one group instead of assigning conflicting parent/child names", () => {
    const { root, item } = nodes()
    item("one").querySelector("[data-collapse-content]")!.append(item("two"))
    expect(() => createCollapse(root, { accordion: true })).toThrow("nested items")
  })
  it("restores authored name responsibility on disposal without restoring it during live mode/refresh", async () => {
    const pair = nodes()
    pair.item("one").setAttribute("name", "author-group")
    pair.item("two").setAttribute("name", "author-group")
    const controller = createCollapse(pair.root, { accordion: true })
    controllers.push(controller)
    const managedName = pair.item("one").getAttribute("name")
    expect(managedName === null || managedName !== "author-group").toBe(true)
    controller.refresh()
    expect(pair.item("one").getAttribute("name")).toBe(managedName)
    controller.accordion = false
    expect(pair.item("one").hasAttribute("name")).toBe(false)
    controller.disconnect()
    expect(pair.item("one").getAttribute("name")).toBe("author-group")
    await flush()
  })
})

describe("focus, refresh and cleanup", () => {
  it("repairs focus hidden by programmatic closure without focusing unrelated controls", async () => {
    const { item, summary, controller } = bind({ expandedNames: "one" })
    const input = item("one").querySelector("input")!
    input.focus()
    controller.expandedNames = null
    await flush()
    expect(document.activeElement).toBe(summary("one"))
    const outside = document.createElement("button")
    document.body.append(outside)
    controller.expandedNames = "one"
    input.focus()
    outside.focus()
    controller.expandedNames = null
    await flush()
    expect(document.activeElement).toBe(outside)
  })
  it("adopts focus that was already inside open content before connecting", async () => {
    const { root, item, summary } = nodes()
    item("one").open = true
    item("one").querySelector("input")!.focus()
    const controller = createCollapse(root, { expandedNames: null })
    controllers.push(controller)
    await flush()
    expect(document.activeElement).toBe(summary("one"))
  })
  it("includes nested focus for parent-content closure but not nested header events", async () => {
    const outer = bind({ expandedNames: "one" })
    const inner = bind({ expandedNames: "one" })
    outer.item("one").querySelector("[data-collapse-content]")!.append(inner.root)
    await flush()
    inner.item("one").querySelector("input")!.focus()
    outer.controller.expandedNames = null
    await flush()
    expect(document.activeElement).toBe(outer.summary("one"))
    expect(inner.controller.expandedNames).toEqual(["one"])
  })
  it("preserves native open, original nodes and valid queued header clicks through routine refresh", async () => {
    const { root, item, summary, controller } = bind()
    const content = item("one").querySelector("p")
    const headers = vi.fn()
    root.addEventListener("m:collapse-header-click", headers)
    summary("one").addEventListener("click", () => { summary("one").textContent = "Renamed title" })
    summary("one").click()
    await flush()
    expect(controller.expandedNames).toEqual(["one"])
    expect(item("one").querySelector("p")).toBe(content)
    expect(headers).toHaveBeenCalledOnce()
    controller.refresh()
    expect(item("one").open).toBe(true)
  })
  it("releases removed roots, queued notifications and owned attributes", async () => {
    const { root, summary, controller } = bind()
    const header = vi.fn()
    root.addEventListener("m:collapse-header-click", header)
    summary("one").click()
    root.remove()
    await flush()
    expect(controller.connected).toBe(false)
    expect(header).not.toHaveBeenCalled()
    expect(summary("disabled").hasAttribute("aria-disabled")).toBe(false)
  })
  it("handles empty groups and removal of all items without inventing focus targets", async () => {
    const { root, controller } = bind()
    root.replaceChildren()
    await flush()
    expect(controller.connected).toBe(true)
    expect(controller.expandedNames).toEqual([])
  })
  it("keeps replacement root ownership and errors explicit", async () => {
    const { root, controller, summary } = bind()
    controller.disconnect()
    const replacement = createCollapse(root)
    controllers.push(replacement)
    controller.disconnect()
    expect(() => createCollapse(root)).toThrow("active controller")
    const errors = vi.fn()
    root.addEventListener("m:collapse-error", errors)
    summary("one").innerHTML = "<button type='button'>Invalid nested action</button>"
    await flush()
    expect(replacement.connected).toBe(false)
    expect(errors).toHaveBeenCalledOnce()
  })
  it("ships CSS-only baseline plus an independent helper with no height/transition/renderer engine", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./collapse"].import).toBe("./dist/markup-ui-collapse.js")
    const source = readFileSync("src\\components\\collapse\\controller.ts", "utf8")
    const css = readFileSync("src\\components\\collapse\\collapse.css", "utf8")
    expect(source).not.toContain("innerHTML")
    expect(source).not.toContain("ResizeObserver")
    expect(source).not.toContain('attributes.attr(item.summary, "aria-expanded"')
    expect(css).toContain("forced-colors")
    expect(css).toContain("prefers-reduced-motion")
    expect(css).toContain("@media print")
    expect(css).not.toMatch(/(^|[;{])\s*(?:max-)?height\s*:/m)
    expect(source).not.toContain("collapse-transition")
  })
})

describe("Collapse shared-core delivery", () => {
  it("requires core, registers only its own family and rejects duplicate classic copies", () => {
    const script = readFileSync("dist\\markup-ui-collapse.global.js", "utf8")
    const define = vi.fn()
    expect(() => runInContext(script, createContext({ HTMLElement, customElements: { get: vi.fn(), define } }))).toThrow("Load compatible markup-ui-core.global.js")
    expect(define).not.toHaveBeenCalled()
    const entries = new Map<string, unknown>()
    const context = createContext({ HTMLElement, customElements: {
      get: (name: string) => entries.get(name),
      define: (name: string, constructor: unknown) => entries.set(name, constructor),
    } })
    runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
    expect(entries.size).toBe(0)
    runInContext(script, context)
    expect([...entries.keys()]).toEqual(["m-collapse-header", "m-collapse-header-extra", "m-collapse-content", "m-collapse-item", "m-collapse"])
    expect(runInContext("Object.keys(MarkupUICollapse).sort()", context)).toEqual(Object.keys(collapseApi).sort())
    expect(runInContext("MarkupUICore.ViewElement.prototype.isPrototypeOf(MarkupUICollapse.Collapse.prototype)", context)).toBe(true)
    expect(() => runInContext(script, context)).toThrow("already defined")
    expect(readFileSync("dist\\markup-ui-collapse.js", "utf8")).toContain("./markup-ui-core.js")
    for (const tag of ["m-avatar", "m-card", "m-carousel", "m-button", "m-popover"]) expect(script).not.toContain(`"${tag}"`)
  })
  it("accounts for required core and CSS under the approved build policy", () => {
    const build = readFileSync("scripts\\build.mjs", "utf8")
    expect(build).toContain('["collapse", 8_000]')
    expect(build).toContain('"markup-ui-collapse.js": 6_500')
    expect(build).toContain('"markup-ui-collapse.global.js": 6_500')
    expect(build).toContain('"markup-ui-collapse.css": 1_000')
    for (const suffix of [".js", ".global.js"]) {
      const component = gzipSync(readFileSync(`dist\\markup-ui-collapse${suffix}`), { level: 9 }).length
      const core = gzipSync(readFileSync(`dist\\markup-ui-core${suffix}`), { level: 9 }).length
      expect(component).toBeLessThanOrEqual(6500)
      expect(component + core).toBeLessThanOrEqual(8000)
    }
    expect(gzipSync(readFileSync("dist\\markup-ui-collapse.css"), { level: 9 }).length).toBeLessThanOrEqual(1000)
  })
})

describe("Collapse default styling", () => {
  const css = readFileSync("src\\components\\collapse\\collapse.css", "utf8")
  function withRules(check: (rules: CSSStyleRule[]) => void) {
    const style = document.createElement("style")
    style.textContent = css
    document.head.append(style)
    try { check([...style.sheet!.cssRules] as CSSStyleRule[]) } finally { style.remove() }
  }
  it("uses borderless source typography and distinct dark header/content/disabled colors", () => {
    withRules(rules => {
      const root = rules.find(rule => rule.selectorText === "m-collapse")!
      expect(root.style.getPropertyValue("font-size")).toBe("var(--m-collapse-font-size,14px)")
      expect(root.style.getPropertyValue("border")).toBe("")
      const header = rules.find(rule => rule.style?.getPropertyValue("font-weight"))!
      expect(header.style.getPropertyValue("font-weight")).toBe("var(--m-collapse-header-weight,400)")
      const dark = rules.find(rule => rule.selectorText === ':where([data-m-theme="dark"])')!
      expect(dark.style.getPropertyValue("--_m-collapse-title")).toBe("rgba(255,255,255,.9)")
      expect(dark.style.getPropertyValue("--_m-collapse-text")).toBe("rgba(255,255,255,.82)")
      expect(dark.style.getPropertyValue("--_m-collapse-disabled")).toBe("rgba(255,255,255,.38)")
    })

  })
  it("spaces mixed native rows/items and keeps custom arrows at the source size and gap", () => {
    withRules(rules => {
      const sibling = rules.find(rule => rule.selectorText?.includes("~"))!
      expect(sibling.selectorText).toBe("m-collapse>m-collapse-item:not([hidden])~m-collapse-item:not([hidden])")
      expect(sibling.style.getPropertyValue("--_m-collapse-padding")).toBe("16px 0 0")
      expect(sibling.style.getPropertyValue("margin-block-start")).toBe("var(--m-collapse-item-gap,16px)")
      const custom = rules.find(rule => rule.style?.getPropertyValue("list-style") === "none")!
      expect(custom.style.getPropertyValue("gap")).toBe("4px")
      const arrow = rules.find(rule => rule.style?.getPropertyValue("inline-size") === "1em")!
      expect(arrow.style.getPropertyValue("font-size")).toBe("var(--m-collapse-arrow-size,18px)")
    })
  })
  it("limits motion to the decorative arrow with source timing and reduced/print protection", () => {
    expect(css).toContain("transition:transform 150ms cubic-bezier(.4,0,.2,1)")
    expect(css).toContain("@media (prefers-reduced-motion:reduce),print")
    expect(css).toContain("transition:none !important")
    expect(css).not.toContain("grid-template-rows")
    expect(css).not.toContain("max-height")
  })
  it("does not leave a leading divider or gap after hidden rows and items", () => {
    document.body.innerHTML = '<m-collapse><m-collapse-item hidden></m-collapse-item><m-collapse-item id="first"></m-collapse-item><m-collapse-item hidden></m-collapse-item><m-collapse-item id="last"></m-collapse-item></m-collapse>'
    withRules(rules => {
      const selector = rules.find(rule => rule.selectorText?.includes("~"))!.selectorText
      const first = document.querySelector<HTMLElement>("#first")!
      const last = document.querySelector("#last")!
      expect(first.matches(selector)).toBe(false)
      expect(last.matches(selector)).toBe(true)
      first.hidden = true
      expect(last.matches(selector)).toBe(false)
    })
  })
})
