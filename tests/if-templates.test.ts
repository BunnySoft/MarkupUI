import { afterEach, describe, expect, it, vi } from "vitest"
import { If, registerBox } from "../src/components/box/index.js"
import { Input } from "../src/components/input/index.js"
import { Card } from "../src/components/card/index.js"
import { Collapse } from "../src/components/collapse/index.js"
import "../src/components/button/index.js"
import "../src/components/list/index.js"
import { App } from "../src/components/foundation.js"
import { bind, createStore, type Binding } from "../src/state/index.js"
import { installActions, registerAction } from "../src/actions/index.js"
import { readFileSync } from "node:fs"

let stop: Binding | undefined
let stopActions: (() => void) | undefined
afterEach(() => { stopActions?.(); stopActions = undefined; stop?.(); stop = undefined; document.body.replaceChildren() })
const tick = () => new Promise(resolve => setTimeout(resolve, 0))
function fixture(content = '<m-input aria-label="Title" data-model-value="title" data-model-event="input change" data-model-target="native"></m-input>') {
  const root = document.createElement("m-box")
  root.innerHTML = `<m-button id="return">Edit</m-button><m-if data-if="visible" focus-target="return">${content}</m-if>`
  document.body.append(root)
  const store = createStore({ visible: true, title: "Report" })
  return { root, region: root.querySelector<If>("m-if")!, store }
}

describe("portable conditional content", () => {
  it("registers with Box atomically and keeps state independently selected", () => {
    expect(customElements.get("m-if")).toBe(If)
    const define = vi.fn()
    expect(() => registerBox({ get: name => name === "m-if" ? class extends HTMLElement {} : undefined, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    expect(manifest.componentPayloads.box.esm.dependencies).toEqual(["markup-ui-core.js"])
    expect(manifest.entryPayloads.all.tags).toContain("m-if")
    const state = JSON.parse(readFileSync("dist/markup-ui-state.js.map", "utf8"))
    expect(state.sources.some((name: string) => /\/(?:components|core)\//.test(name))).toBe(false)
  })

  it("captures inert content without binding or making a second focus owner", async () => {
    const { root, region } = fixture()
    await tick()
    expect(root.querySelector("m-input")).toBeNull()
    expect(region.native.content.querySelector("m-input")).not.toBeNull()
    expect(region.hasAttribute("tabindex")).toBe(false)
    expect(region.hasAttribute("role")).toBe(false)
  })

  it("creates and disposes content instead of hiding it", () => {
    const { root, store, region } = fixture()
    stop = bind(root, store)
    const input = root.querySelector<Input>("m-input")!
    store.set("visible", false)
    expect(root.querySelector("m-input")).toBeNull()
    input.native!.value = "Retired"
    input.native!.dispatchEvent(new Event("input", { bubbles: true }))
    expect(store.get("title")).toBe("Report")
    store.set("visible", true)
    expect(root.querySelector("m-input")).not.toBe(input)
    expect(root.querySelector<Input>("m-input")!.value).toBe("Report")
    expect(region.native.content.children).toHaveLength(1)
  })

  it("adopts already-rendered Collapse owners through conditional capture and recreation", () => {
    const { root, store, region } = fixture('<m-collapse accordion><m-collapse-item key="one"><m-collapse-header>Section</m-collapse-header><m-collapse-content><input value="Source"></m-collapse-content></m-collapse-item><m-collapse-item key="two" disabled><m-collapse-header>Disabled</m-collapse-header><m-collapse-content>Body</m-collapse-content></m-collapse-item></m-collapse>')
    const source = root.querySelector<Collapse>("m-collapse")!
    source.expand("one")
    const captured = region.native.content.querySelector("m-collapse")!
    expect(captured.querySelector("details[open]")).not.toBeNull()
    stop = bind(root, store)
    for (let cycle = 0; cycle < 2; cycle++) {
      const group = root.querySelector<Collapse>("m-collapse")!
      expect(group.state).toBe("ready")
      expect(group.expandedKeys).toEqual(["one"])
      expect(group.querySelectorAll("details")).toHaveLength(2)
      expect(group.querySelectorAll("summary")).toHaveLength(2)
      expect(group.querySelectorAll('svg[data-part="arrow"]')).toHaveLength(2)
      group.expand("two")
      expect(group.expandedKeys).toEqual(["two"])
      store.set("visible", false)
      expect(group.state).toBe("disconnected")
      store.set("visible", true)
      expect(root.querySelector("m-collapse")).not.toBe(group)
    }
    expect(region.native.content.querySelector("m-collapse")).toBe(captured)
    expect(captured.querySelector("details[open]")?.parentElement?.getAttribute("key")).toBe("one")
  })

  it.each(["generated", "authored"])("retains one Card header and close owner through captured %s regions", header => {
    const content = '<m-input aria-label="Title" data-model-value="title" data-model-event="input" data-model-target="native"></m-input>'
    const { root, store } = fixture(header === "generated"
      ? `<m-card title="Report" closable>${content}</m-card>`
      : `<m-card title="Report" closable><m-card-header>Authored heading</m-card-header><m-card-content>${content}</m-card-content></m-card>`)
    stop = bind(root, store)
    for (let cycle = 0; cycle < 3; cycle++) {
      const card = root.querySelector<Card>("m-card")!
      expect(card).toBeInstanceOf(Card)
      expect(card.querySelectorAll("[data-part=header]")).toHaveLength(header === "generated" ? 1 : 0)
      expect(card.querySelectorAll("[data-part=title]")).toHaveLength(header === "generated" ? 1 : 0)
      expect(card.querySelectorAll("[data-part=content]")).toHaveLength(header === "generated" ? 1 : 0)
      expect(card.querySelectorAll("button[data-part=close]")).toHaveLength(1)
      expect(card.querySelectorAll("input")).toHaveLength(1)
      const close = card.querySelector<HTMLButtonElement>("button[data-part=close]")!
      const intent = vi.fn()
      card.addEventListener("m:close", intent)
      close.click()
      expect(intent).toHaveBeenCalledOnce()
      expect(card.isConnected).toBe(true)
      store.set("visible", false)
      close.click()
      expect(intent).toHaveBeenCalledOnce()
      store.set("visible", true)
      expect(root.querySelector("m-card")).not.toBe(card)
    }
  })

  it("applies initial Card bindings without retaining captured close controls or adopting authored markers", () => {
    const { root, store } = fixture(`<m-card title="Report" closable data-bind-closable="details">
      <m-card-header><button type="button" data-part="close">Authored action</button></m-card-header>
      <div data-part="header">Authored body</div>
    </m-card>`)
    store.set("details", false)
    stop = bind(root, store)
    const card = root.querySelector<Card>("m-card")!
    expect(card.closable).toBe(false)
    expect(card.querySelector("button[data-part=close][data-state~=generated]")).toBeNull()
    const action = card.querySelector<HTMLButtonElement>("button[data-part=close]")!
    expect(action.textContent).toBe("Authored action")
    expect(card.querySelector("div[data-part=header]")?.textContent).toBe("Authored body")
    expect(card.querySelector("div[data-part=header]")?.parentElement?.getAttribute("data-part")).toBe("content")
    const intent = vi.fn()
    card.addEventListener("m:close", intent)
    action.click()
    expect(intent).not.toHaveBeenCalled()
    store.set("details", true)
    expect(card.querySelectorAll("button[data-part=close][data-state~=generated]")).toHaveLength(1)
    card.querySelector<HTMLButtonElement>("button[data-state~=generated]")!.click()
    expect(intent).toHaveBeenCalledOnce()
    store.set("details", false)
    expect(card.querySelector("button[data-state~=generated]")).toBeNull()
    expect(card.querySelector("button[data-part=close]")).toBe(action)
  })

  it.each([null, undefined, 0, 1, "", "true", [], {}])("rejects non-Boolean conditions (%j) before removal", value => {
    const { root, store } = fixture()
    stop = bind(root, store)
    const input = root.querySelector("m-input")
    expect(() => store.set("visible", value)).toThrow("Boolean")
    expect(root.querySelector("m-input")).toBe(input)
    store.set("visible", false)
    expect(root.querySelector("m-input")).toBeNull()
  })

  it.each([
    "", "text<m-span>Text</m-span>", "<m-span>A</m-span><m-span>B</m-span>",
    '<template><m-span>A</m-span></template>',
    '<m-box><m-if data-if="other"></m-if></m-box>',
    '<m-box><m-if data-if="other"><m-span data-bind-inner-html="title"></m-span></m-if></m-box>',
  ])("validates even inactive sources: %s", content => {
    const { root, store } = fixture(content)
    store.set("visible", false)
    expect(() => bind(root, store)).toThrow()
    expect(root.querySelector("input")).toBeNull()
  })

  it.each(["data-each", "data-each-key", "data-bind-text", "data-model-value"])("rejects competing source directive %s", name => {
    const { root, region, store } = fixture()
    region.setAttribute(name, "title")
    expect(() => bind(root, store)).toThrow()
  })

  it("requires data-if and validates its safe path", () => {
    const { root, region, store } = fixture()
    region.removeAttribute("data-if")
    expect(() => bind(root, store)).toThrow("requires data-if")
    region.setAttribute("data-if", "constructor.prototype")
    expect(() => bind(root, store)).toThrow()
  })

  it("retains item and parent scopes through native and portable nesting", () => {
    const { root, store } = fixture(`<m-list>
      <m-list-template data-each="rows" data-each-key="id" focus-on-remove>
        <m-list-item><m-if data-if="$item.editable"><m-box>
          <m-input data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input>
          <template data-each="$item.children" data-each-key="id"><m-box>
            <m-if data-if="$item.editable"><m-input data-model-value="$parent.name" data-model-event="input" data-model-target="native"></m-input></m-if>
          </m-box></template>
        </m-box></m-if></m-list-item>
      </m-list-template>
    </m-list>`)
    store.set("rows", [
      { id: "a", editable: true, name: "Alpha", children: [{ id: "c", editable: true }] },
      { id: "b", editable: false, name: "Beta", children: [] },
    ])
    stop = bind(root, store)
    const inputs = [...root.querySelectorAll<Input>("m-input")]
    expect(inputs.map(input => input.value)).toEqual(["Alpha", "Alpha"])
    store.set("rows", [...store.get<any[]>("rows")].reverse())
    expect([...root.querySelectorAll("m-input")]).toEqual(inputs)
    inputs[1]!.native!.value = "Edited parent"
    inputs[1]!.native!.dispatchEvent(new Event("input", { bubbles: true }))
    expect(store.get("rows.1.name")).toBe("Edited parent")
    expect(stop.read(inputs[0]!, "$index")).toBe(1)
    expect(stop.read(inputs[1]!, "$key")).toBe("c")
  })

  it("uses the current condition and same model owner after stop/rebind", () => {
    const { root, store } = fixture()
    stop = bind(root, store)
    const input = root.querySelector<Input>("m-input")!
    for (let index = 0; index < 10; index++) {
      stop()
      root.remove()
      document.body.append(root)
      stop = bind(root, store)
      expect(root.querySelector("m-input")).toBe(input)
      expect(root.querySelectorAll("input")).toHaveLength(1)
    }
    const set = vi.spyOn(store, "set")
    input.native!.value = "Once"
    input.native!.dispatchEvent(new Event("input", { bubbles: true }))
    expect(set).toHaveBeenCalledTimes(1)
  })

  it("focuses an explicit portable control and ignores retiring blur writes", () => {
    const { root, store } = fixture()
    stop = bind(root, store)
    const field = root.querySelector<Input>("m-input")!.native!
    field.addEventListener("blur", () => {
      field.value = "Late change"
      field.dispatchEvent(new Event("change", { bubbles: true }))
    })
    field.focus()
    store.set("visible", false)
    expect(document.activeElement).toBe(root.querySelector("m-button button"))
    expect(store.get("title")).toBe("Report")
  })

  it("uses the explicit Web callback before portable policy", () => {
    const { root, region, store } = fixture()
    region.focusTarget = "missing"
    const button = document.createElement("button")
    root.prepend(button)
    stop = bind(root, store, { focusFallback: () => button })
    root.querySelector<Input>("m-input")!.focus()
    store.set("visible", false)
    expect(document.activeElement).toBe(button)
  })

  it.each(["missing", "disabled", "hidden", "duplicate", "outside", "retiring", "passive"])("rejects %s focus targets without removing content", kind => {
    const { root, region, store } = fixture()
    const button = root.querySelector("m-button")!
    if (kind === "missing") region.focusTarget = "unknown"
    if (kind === "disabled") button.setAttribute("disabled", "")
    if (kind === "hidden") button.setAttribute("hidden", "")
    if (kind === "duplicate") { const other = document.createElement("button"); other.id = "return"; root.prepend(other) }
    if (kind === "outside") document.body.prepend(button)
    if (kind === "retiring") { button.removeAttribute("id"); region.native.content.firstElementChild!.id = "return" }
    if (kind === "passive") { button.removeAttribute("id"); const other = document.createElement("div"); other.id = "return"; root.prepend(other) }
    stop = bind(root, store)
    const input = root.querySelector<Input>("m-input")!
    input.focus()
    expect(() => store.set("visible", false)).toThrow(/focus/)
    expect(root.querySelector("m-input")).toBe(input)
    expect(document.activeElement).toBe(input.native)
  })

  it("does not resolve unused focus targets or move external focus", () => {
    const { root, region, store } = fixture()
    region.focusTarget = "missing"
    stop = bind(root, store)
    const button = root.querySelector<HTMLElement>("m-button")!
    button.focus()
    store.set("visible", false)
    expect(document.activeElement).toBe(button.querySelector("button"))
  })

  it("rejects surviving owners that forward focus into retiring content", () => {
    const { root, store } = fixture()
    root.innerHTML = `<m-label id="return">Title<m-if data-if="visible" focus-target="return">
      <m-input data-model-value="title" data-model-event="input" data-model-target="native"></m-input>
    </m-if></m-label>`
    stop = bind(root, store)
    const input = root.querySelector<Input>("m-input")!
    input.focus()
    expect(() => store.set("visible", false)).toThrow("focusFallback")
    expect(root.querySelector("m-input")).toBe(input)
    expect(document.activeElement).toBe(input.native)
  })

  it("uses a surviving List policy for nested conditions without a target", () => {
    const { root, store } = fixture(`<m-list><m-list-template data-each="rows" data-each-key="id" focus-on-remove>
      <m-list-item><m-if data-if="$item.editable"><m-input data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input></m-if></m-list-item>
    </m-list-template></m-list>`)
    store.set("rows", [{ id: "a", editable: true, name: "Alpha" }])
    stop = bind(root, store)
    root.querySelector<Input>("m-input")!.focus()
    store.set("rows.0.editable", false)
    expect(document.activeElement?.localName).toBe("ul")
  })

  it("keeps referenced definitions inert and replaces only after valid refresh", () => {
    const { root, region, store } = fixture("")
    const source = document.createElement("template")
    source.id = "definition"
    source.innerHTML = '<m-box><m-if data-if="visible"><m-span data-bind-text="title"></m-span></m-if></m-box>'
    root.append(source)
    region.setAttribute("data-template", "#definition")
    stop = bind(root, store)
    const rendered = region.firstElementChild
    expect(region.querySelector("m-span")!.textContent).toBe("Report")
    expect(source.content.querySelector("m-span")!.textContent).toBe("")
    stop()
    stop = bind(root, store)
    expect(region.firstElementChild).toBe(rendered)
    source.innerHTML = "<m-span>A</m-span><m-span>B</m-span>"
    expect(() => stop!.refresh()).toThrow("one element root")
    expect(region.firstElementChild).toBe(rendered)
  })

  it("accepts an explicit named source and detects portable reference cycles", () => {
    const { root, region, store } = fixture("")
    region.setAttribute("data-template", "content")
    const source = document.createElement("template")
    source.innerHTML = '<m-span data-bind-text="title"></m-span>'
    stop = bind(root, store, { templates: new Map([["content", source]]) })
    expect(region.querySelector("m-span")!.textContent).toBe("Report")
    source.innerHTML = '<m-box><m-if data-if="visible" data-template="content"></m-if></m-box>'
    expect(() => stop!.refresh()).toThrow("cycle")
    expect(region.querySelector("m-span")!.textContent).toBe("Report")
  })

  it("preflights paired IDs and scoped actions inside the condition", async () => {
    const { root, store } = fixture(`<m-box>
      <m-label data-bind-html-for="field" data-bind-text="title"></m-label>
      <m-input data-bind-id="field" data-model-value="title" data-model-event="input" data-model-target="native"></m-input>
      <m-button m-action="if-test" m-arg-title="$root.title">Save</m-button>
    </m-box>`)
    store.set("field", "conditional-field")
    stop = bind(root, store)
    await tick()
    expect(root.querySelectorAll("label")).toHaveLength(1)
    expect(root.querySelector("label")!.control).toBe(root.querySelector("input"))
    const action = vi.fn()
    registerAction("if-test", action)
    stopActions = installActions(root, stop)
    const button = root.querySelector<HTMLElement>("m-if m-button")!
    button.querySelector("button")!.click()
    expect(action.mock.calls[0]![0].arguments).toEqual({ title: "Report" })
    store.set("visible", false)
    button.querySelector("button")!.click()
    expect(action).toHaveBeenCalledTimes(1)
    expect(() => stop!.read(button, "$root.title")).toThrow("ownership")
  })

  it("adopts previously connected primitive chrome without nesting native owners", async () => {
    const { root, store } = fixture(`<m-box>
      <m-details open><m-summary>Details</m-summary><m-strong>Text</m-strong></m-details>
      <m-label for="field">Title</m-label><m-input id="field"></m-input>
    </m-box>`)
    await tick()
    stop = bind(root, store)
    await tick()
    for (const tag of ["details", "summary", "strong", "label"]) expect(root.querySelectorAll(tag)).toHaveLength(1)
    expect(root.querySelector("label")!.control).toBe(root.querySelector("input"))
    store.set("visible", false)
    store.set("visible", true)
    await tick()
    for (const tag of ["details", "summary", "strong", "label"]) expect(root.querySelectorAll(tag)).toHaveLength(1)
  })

  it("rejects fixed IDs inside repeated conditional sources even when empty", () => {
    const { root, store } = fixture('<m-list><m-list-template data-each="rows" data-each-key="id"><m-list-item><m-if data-if="$item.editable"><m-span id="fixed">Text</m-span></m-if></m-list-item></m-list-template></m-list>')
    store.set("rows", [])
    expect(() => bind(root, store)).toThrow("authored IDs")
  })

  it("rejects moved sources, generated content and extracted scoped descendants", () => {
    const { root, region, store } = fixture("<m-box><m-span data-bind-text=\"title\"></m-span></m-box>")
    stop = bind(root, store)
    const text = region.querySelector("m-span")!
    root.append(text)
    expect(() => stop!.refresh()).toThrow("scoped node")
    region.querySelector("m-box")!.append(text)
    root.append(region.native)
    expect(() => stop!.refresh()).toThrow("ownership changed")
  })

  it("rejects unowned content after preparation and removes instances with their source", () => {
    const { root, region, store } = fixture()
    stop = bind(root, store)
    const extra = document.createElement("m-span")
    region.append(extra)
    expect(() => stop!.refresh()).toThrow("unowned content")
    extra.remove()
    region.remove()
    stop.refresh()
    expect(() => stop!.read(region, "title")).toThrow("ownership")
    expect(root.querySelector("input")).toBeNull()
  })

  it("captures incremental parser-like content only until first preparation", async () => {
    const { root, region, store } = fixture("")
    await tick()
    const content = document.createElement("m-span")
    content.setAttribute("data-bind-text", "title")
    region.append(content)
    await tick()
    stop = bind(root, store)
    expect(region.querySelector("m-span")!.textContent).toBe("Report")
  })

  it("validates focusTarget setters and upgrades preassigned values", () => {
    const region = new If()
    expect(region.focusTarget).toBeNull()
    for (const value of ["", "two ids", 1]) expect(() => { region.focusTarget = value as string }).toThrow()
    Object.defineProperty(region, "focusTarget", { configurable: true, writable: true, value: "return" })
    region.setAttribute("data-if", "visible")
    region.innerHTML = "<m-span>Text</m-span>"
    document.body.append(region)
    expect(region.getAttribute("focus-target")).toBe("return")
    region.focusTarget = null
    expect(region.hasAttribute("focus-target")).toBe(false)
  })

  it("settles App attachment and reconnect with one condition owner", async () => {
    if (!customElements.get("m-app")) customElements.define("m-app", App)
    const { root, store } = fixture()
    const app = document.createElement("m-app") as App
    app.store = store
    app.append(root)
    document.body.append(app)
    await tick()
    const field = root.querySelector("input")
    expect(field).not.toBeNull()
    for (let index = 0; index < 5; index++) { app.remove(); document.body.append(app); await tick() }
    expect(root.querySelector("input")).toBe(field)
    store.set("visible", false)
    await tick()
    expect(root.querySelector("input")).toBeNull()
    app.remove()
  })
})
