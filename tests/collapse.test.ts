import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createCollapse } from "../src/components/collapse/index.js"
import type { CollapseController, CollapseOptions } from "../src/components/collapse/index.js"

const controllers: CollapseController[] = []
function nodes() {
  const root = document.createElement("div")
  root.className = "mui-collapse"
  root.setAttribute("data-collapse", "")
  root.innerHTML = `
    <div class="mui-collapse-row"><details data-collapse-item data-collapse-key="one"><summary>First section</summary><div data-collapse-content><p>Original content</p><input value="Original"><a href="#destination">Destination</a></div></details><div data-collapse-extra><button type="button">Extra action</button></div></div>
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
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  document.body.replaceChildren()
  vi.restoreAllMocks()
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
    root.addEventListener("mui:collapse-header-click", headers)
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
    root.addEventListener("mui:collapse-header-click", event => events.push((event as CustomEvent).detail))
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
    root.addEventListener("mui:collapse-change", event => changed.push((event as CustomEvent).detail))
    root.addEventListener("mui:collapse-header-click", headers)
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
    root.addEventListener("mui:collapse-header-click", headers)
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
    root.addEventListener("mui:collapse-header-click", header)
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
    root.addEventListener("mui:collapse-error", errors)
    summary("one").innerHTML = "<button type='button'>Invalid nested action</button>"
    await flush()
    expect(replacement.connected).toBe(false)
    expect(errors).toHaveBeenCalledOnce()
  })
  it("ships CSS-only baseline plus an independent helper with no height/transition/renderer engine", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./collapse"].import).toBe("./dist/markup-ui-collapse.js")
    const source = readFileSync("src/components/collapse/collapse.ts", "utf8")
    const css = readFileSync("src/components/collapse/collapse.css", "utf8")
    expect(source).not.toContain("innerHTML")
    expect(source).not.toContain("ResizeObserver")
    expect(source).not.toContain('attributes.attr(item.summary, "aria-expanded"')
    expect(css).toContain("forced-colors")
    expect(css).toContain("prefers-reduced-motion")
    expect(css).toContain("@media print")
    expect(css).not.toContain("height:")
  })
})
