import { afterEach, describe, expect, it, vi } from "vitest"
import { App, Field } from "../src/components/foundation.js"
import { AccordionItem } from "../src/components/dynamic.js"
import { bind, createStore, registerAction, theme } from "../src/index.js"
import { Input } from "../src/components/input/index.js"
import "../src/components/checkbox/index.js"
import "../src/components/box/index.js"

const flush = async () => { await Promise.resolve(); await Promise.resolve() }
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("retained root lifecycle", () => {
  it.each(["m-header", "m-main", "m-section"])("preserves application roles through %s reconnect", tag => {
    const element = document.createElement(tag)
    element.setAttribute("role", "region")
    element.setAttribute("data-role", "complementary")
    document.body.append(element)
    expect(element.getAttribute("role")).toBe("region")
    element.remove()
    element.setAttribute("role", "navigation")
    document.body.append(element)
    expect(element.getAttribute("role")).toBe("navigation")
    expect(element.getAttribute("data-role")).toBe("complementary")
  })

  it("does not replace authored Spacer flex declarations on connect or reconnect", () => {
    const spacer = document.createElement("m-spacer")
    spacer.style.flex = "2 0 20px"
    document.body.append(spacer)
    expect(spacer.style.flex).toBe("2 0 20px")
    spacer.remove()
    spacer.style.flex = "3 1 10px"
    document.body.append(spacer)
    expect(spacer.style.flex).toBe("3 1 10px")
  })

  it("restores authored theme tokens and marker when name is removed", () => {
    theme.register("root-first", { accent: "red", surface: "white" })
    const root = document.createElement("m-theme")
    root.dataset.mTheme = "authored"
    root.style.setProperty("--m-accent", "blue")
    root.style.setProperty("--unrelated", "keep")
    root.setAttribute("name", "root-first")
    document.body.append(root)
    expect(root.style.getPropertyValue("--m-accent")).toBe("red")
    root.removeAttribute("name")
    expect(root.dataset.mTheme).toBe("authored")
    expect(root.style.getPropertyValue("--m-accent")).toBe("blue")
    expect(root.style.getPropertyValue("--m-surface")).toBe("")
    expect(root.style.getPropertyValue("--unrelated")).toBe("keep")
  })

  it("leaves later application theme writes intact and validates names before clearing", () => {
    theme.register("root-owned", { accent: "red", surface: "white", border: "black" })
    const root = document.createElement("m-theme")
    root.setAttribute("name", "root-owned")
    document.body.append(root)
    expect(() => theme.apply("missing-root-theme", root)).toThrow("Unknown")
    expect(root.style.getPropertyValue("--m-surface")).toBe("white")
    root.style.setProperty("--m-accent", "green")
    root.style.setProperty("--m-border", "green")
    root.dataset.mTheme = "application"
    root.setAttribute("name", "")
    expect(root.style.getPropertyValue("--m-accent")).toBe("green")
    expect(root.style.getPropertyValue("--m-border")).toBe("green")
    expect(root.style.getPropertyValue("--m-surface")).toBe("")
    expect(root.dataset.mTheme).toBe("application")
  })

  it("switches partial themes without stale tokens and reconnects without losing originals", () => {
    theme.register("root-complete", { accent: "red", surface: "white" })
    theme.register("root-partial", { accent: "green" })
    const root = document.createElement("m-theme")
    root.style.setProperty("--m-accent", "blue")
    root.setAttribute("name", "root-complete")
    document.body.append(root)
    root.setAttribute("name", "root-partial")
    expect(root.style.getPropertyValue("--m-surface")).toBe("")
    root.remove()
    document.body.append(root)
    root.removeAttribute("name")
    expect(root.style.getPropertyValue("--m-accent")).toBe("blue")
    expect(root.hasAttribute("data-m-theme")).toBe(false)
  })

  it("keeps nested theme ownership separate", () => {
    theme.register("root-outer", { accent: "red" })
    theme.register("root-inner", { accent: "blue" })
    document.body.innerHTML = '<m-theme name="root-outer"><m-theme name="root-inner"></m-theme></m-theme>'
    const outer = document.querySelector("m-theme")!
    const inner = outer.querySelector<HTMLElement>("m-theme")!
    outer.removeAttribute("name")
    expect(inner.style.getPropertyValue("--m-accent")).toBe("blue")
    expect(inner.dataset.mTheme).toBe("root-inner")
  })

  it("maps a portable Field to a real label without overriding authored names", async () => {
    document.body.innerHTML = '<m-field label="Name"><m-input aria-label="Preferred name" clearable></m-input></m-field>'
    await flush()
    const field = document.querySelector<Field>("m-field")!
    const input = field.querySelector<Input>("m-input")!
    const label = field.querySelector("label")!
    expect(label.control).toBe(input.native)
    expect(input.native.labels).toContain(label)
    expect(input.native.getAttribute("aria-label")).toBe("Preferred name")
    field.label = "Updated name"
    expect(field.querySelector("label")).toBe(label)
    expect(label.textContent).toBe("Updated name")
    field.label = null
    expect(label.isConnected).toBe(false)
    expect(input.native.getAttribute("aria-label")).toBe("Preferred name")
    field.label = "Restored name"
    expect(field.querySelector("label")).toBe(label)
    expect(label.control).toBe(input.native)
  })

  it("adopts late controls and tracks id changes and replacement", async () => {
    const field = new Field()
    field.label = "Late name"
    document.body.append(field)
    const label = field.querySelector("label")!
    expect(label.control).toBeNull()
    const first = new Input()
    field.append(first)
    await flush()
    expect(label.control).toBe(first.native)
    first.native.id = "application-field-id"
    await flush()
    expect(label.htmlFor).toBe("application-field-id")
    const replacement = new Input()
    first.replaceWith(replacement)
    await flush()
    expect(label.control).toBe(replacement.native)
    expect(first.native.id).toBe("application-field-id")
    replacement.remove()
    await flush()
    expect(label.hasAttribute("for")).toBe(false)
  })

  it("ignores nested Field controls and input chrome buttons", async () => {
    document.body.innerHTML = '<m-field label="Outer"><m-field label="Inner"><m-input clearable></m-input></m-field><m-input id="outer-control" clearable></m-input></m-field>'
    await flush()
    const fields = document.querySelectorAll("m-field")
    expect(fields[0]!.querySelector<HTMLLabelElement>(":scope > label")!.control)
      .toBe(document.querySelector<Input>("#outer-control")!.native)
    expect(fields[1]!.querySelector<HTMLLabelElement>(":scope > label")!.control)
      .toBe(fields[1]!.querySelector<Input>("m-input")!.native)
  })

  it("stops Field observation while disconnected and reconciles once reconnected", async () => {
    const field = new Field()
    field.label = "Name"
    field.append(new Input())
    document.body.append(field)
    await flush()
    const label = field.querySelector("label")!
    field.remove()
    field.label = "Offline"
    const replacement = new Input()
    field.querySelector("m-input")!.replaceWith(replacement)
    await flush()
    expect(label.textContent).toBe("Name")
    document.body.append(field)
    await flush()
    expect(field.querySelectorAll(":scope > label")).toHaveLength(1)
    expect(label.textContent).toBe("Offline")
    expect(label.control).toBe(replacement.native)
  })

  it("associates checkbox labels through native activation and disabled behavior", async () => {
    document.body.innerHTML = '<m-field label="Consent"><m-checkbox></m-checkbox></m-field>'
    await flush()
    const label = document.querySelector("m-field > label") as HTMLLabelElement
    const input = document.querySelector("m-checkbox input") as HTMLInputElement
    expect(label.control).toBe(input)
    label.click()
    expect(input.checked).toBe(true)
    input.disabled = true
    label.click()
    expect(input.checked).toBe(true)
  })

  it("supports Web-native controls and late hidden/type changes explicitly", async () => {
    document.body.innerHTML = '<m-field label="Web field"><input type="hidden"><textarea id="existing-control"></textarea></m-field>'
    await flush()
    const label = document.querySelector("label")!
    const input = document.querySelector("input")!
    expect(label.htmlFor).toBe("existing-control")
    input.type = "text"
    await flush()
    expect(label.control).toBe(input)
    expect(document.querySelector("textarea")!.id).toBe("existing-control")
  })

  it("adopts a control loaded after the Field without registering Input implicitly", async () => {
    document.body.innerHTML = '<m-field label="Late family"><m-root-late-input></m-root-late-input></m-field>'
    await flush()
    const label = document.querySelector("label")!
    expect(label.control).toBeNull()
    customElements.define("m-root-late-input", class extends Input {})
    await flush()
    expect(label.control).toBe(document.querySelector<Input>("m-root-late-input")!.native)
  })

  it("retains accordion chrome, authored children and listeners during live updates", () => {
    document.body.innerHTML = '<m-accordion-item title="Details"><m-span>Original</m-span></m-accordion-item>'
    const item = document.querySelector<AccordionItem>("m-accordion-item")!
    const button = item.querySelector("button")!
    const content = item.querySelector<HTMLElement>("[data-m-content]")!
    const authored = item.querySelector("m-span")!
    const listener = vi.fn()
    authored.addEventListener("click", listener)
    expect(content.hidden).toBe(true)
    item.open = true
    expect(content.hidden).toBe(false)
    expect(button.getAttribute("aria-expanded")).toBe("true")
    item.title = "Updated"
    expect(button.textContent).toBe("Updated")
    item.removeAttribute("open")
    expect(content.hidden).toBe(true)
    item.removeAttribute("title")
    expect(button.textContent).toBe("")
    expect(item.querySelector("button")).toBe(button)
    expect(item.querySelector("m-span")).toBe(authored)
    authored.dispatchEvent(new Event("click"))
    expect(listener).toHaveBeenCalledOnce()
  })

  it("releases accordion activation on disconnect and installs exactly one listener on reconnect", () => {
    const item = new AccordionItem()
    item.title = "Details"
    document.body.append(item)
    const button = item.querySelector("button")!
    for (let index = 0; index < 3; index++) {
      item.remove()
      button.click()
      expect(item.open).toBe(false)
      item.title = `Reconnected ${index}`
      document.body.append(item)
      button.click()
      expect(item.open).toBe(true)
      button.click()
      expect(item.open).toBe(false)
      expect(item.querySelectorAll("[data-m-header]")).toHaveLength(1)
      expect(button.textContent).toBe(item.title)
    }
  })

  it("does not let nested accordions change their parent", () => {
    document.body.innerHTML = '<m-accordion-item title="Outer" open><m-accordion-item title="Inner"></m-accordion-item></m-accordion-item>'
    const items = document.querySelectorAll<AccordionItem>("m-accordion-item")
    items[1]!.querySelector("button")!.click()
    expect(items[1]!.open).toBe(true)
    expect(items[0]!.open).toBe(true)
  })

  it("replays Field and Accordion property writes made before definition", () => {
    const field = document.createElement("m-root-late-field") as Field
    field.label = "Before upgrade"
    document.body.append(field)
    customElements.define("m-root-late-field", class extends Field {})
    expect(field.querySelector("label")!.textContent).toBe("Before upgrade")
    const item = document.createElement("m-root-late-accordion") as AccordionItem
    item.open = true
    Object.defineProperty(item, "title", { value: "Before upgrade", configurable: true, writable: true })
    document.body.append(item)
    customElements.define("m-root-late-accordion", class extends AccordionItem {})
    expect(item.querySelector("button")!.textContent).toBe("Before upgrade")
    expect(item.querySelector<HTMLElement>("[data-m-content]")!.hidden).toBe(false)
    expect(Object.hasOwn(item, "open")).toBe(false)
    expect(() => { item.open = "false" as unknown as boolean }).toThrow()
  })

  it("preserves an App store assigned before upgrade for both bindings and actions", async () => {
    const store = createStore({ name: "Before upgrade" })
    const app = document.createElement("m-root-late-app") as App
    app.store = store
    app.innerHTML = '<m-span data-bind-text="name" m-action="root-record-store"></m-span>'
    const action = vi.fn()
    registerAction("root-record-store", action)
    document.body.append(app)
    customElements.define("m-root-late-app", class extends App {})
    await flush()
    expect(app.store).toBe(store)
    expect(Object.hasOwn(app, "store")).toBe(false)
    const child = app.querySelector<HTMLElement>("m-span")!
    expect(child.textContent).toBe("Before upgrade")
    child.click()
    expect(action.mock.calls[0]![0].store).toBe(store)
    app.remove()
    store.set("name", "Offline")
    expect(child.textContent).toBe("Before upgrade")
    document.body.append(app)
    await flush()
    expect(child.textContent).toBe("Offline")
  })

  it("rejects live App store replacement, then rebinds a replacement on reconnect", async () => {
    const app = new App()
    const first = createStore({ name: "First" }), next = createStore({ name: "Next" })
    app.store = first
    app.innerHTML = '<m-span data-bind-text="name"></m-span>'
    document.body.append(app)
    await flush()
    expect(() => { app.store = next }).toThrow("Disconnect")
    app.store = first
    expect(app.store).toBe(first)
    expect(() => { app.store = {} as typeof first }).toThrow("MStore")
    app.remove()
    app.store = next
    document.body.append(app)
    await flush()
    first.set("name", "No longer bound")
    expect(app.querySelector("m-span")!.textContent).toBe("Next")
    next.set("name", "Updated")
    expect(app.querySelector("m-span")!.textContent).toBe("Updated")
  })

  it("rejects conflicting inline state without consuming it or leaking ownership", async () => {
    const pending: Array<() => void> = []
    const schedule = vi.spyOn(globalThis, "queueMicrotask").mockImplementation(callback => { pending.push(callback) })
    const app = new App()
    const store = createStore({ name: "Explicit" })
    app.store = store
    app.innerHTML = '<script type="application/json" data-m-state>{"name":"Inline"}</script><m-span data-bind-text="name"></m-span>'
    document.body.append(app)
    expect(() => pending.shift()!()).toThrow("either")
    expect(app.store).toBe(store)
    expect(app.querySelector("script")).not.toBeNull()
    app.querySelector("script")!.remove()
    const stop = bind(app, store)
    stop()
    app.remove()
    schedule.mockRestore()
    document.body.append(app)
    await flush()
    expect(app.querySelector("m-span")!.textContent).toBe("Explicit")
  })
})
