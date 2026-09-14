import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { FloatButton, MFloatButton, FloatButtonGroup, MFloatButtonGroup, registerFloatButton } from "../src/components/float-button/index.js"
import * as floatButtonApi from "../src/components/float-button/index.js"
import type { FloatButtonClickDetail } from "../src/components/float-button/index.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "float-button", "float-button.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "float-button.html"), "utf8")
const appCss = readFileSync(resolve("demo", "components", "float-button.css"), "utf8")
const app = readFileSync(resolve("demo", "components", "float-button.js"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined

function fixture(): void {
  document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>"))
}
function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}
afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("native FloatButton and FloatButtonGroup", () => {
  it("ships native action CSS with no external component dependencies", () => {
    expect(pkg.exports["./float-button/style.css"]).toBe("./dist/markup-ui-float-button.css")
    expect(pkg.dependencies).toEqual({})
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("markup-ui-button")
    expect(demo).not.toContain("markup-ui-tooltip")
  })

  it("keeps action roots native and explicitly names icon-only controls", () => {
    fixture()
    install()
    expect(document.querySelector("#single-action")!.tagName).toBe("BUTTON")
    expect(document.querySelector("#home-action")!.tagName).toBe("A")
    expect(document.querySelector("#single-action")!.getAttribute("aria-label")).toBe("Record an action")
    expect(document.querySelector("#quick-trigger")!.getAttribute("aria-label")).toBe("Quick actions")
    expect(document.querySelector("#badge-action")!.getAttribute("aria-label")).toBe("Notifications, 3 unread")
    for (const action of document.querySelectorAll(".m-float-button")) {
      if (action.tagName === "TEMPLATE") continue
      expect(["M-FLOAT-BUTTON", "BUTTON", "A"]).toContain(action.tagName)
      expect(action.querySelector("button, a, input, select")).toBeNull()
    }
    expect(document.querySelectorAll('[role="menu"], [role="menuitem"], .m-float-group[role="button"]')).toHaveLength(0)
  })

  it("preserves source nodes/listeners/ARIA while presentation attributes change", () => {
    fixture()
    const action = document.querySelector<HTMLButtonElement>("#single-action")!
    const nodes = [...action.childNodes]
    const before = action.innerHTML
    let clicks = 0
    action.addEventListener("click", () => clicks++)
    install()
    action.dataset.shape = "square"
    action.dataset.type = "primary"
    action.remove()
    document.body.append(action)
    action.click()
    expect(clicks).toBe(1)
    expect(action.innerHTML).toBe(before)
    expect([...action.childNodes]).toEqual(nodes)
    expect(action.getAttribute("aria-label")).toBe("Record an action")
  })

  it("supports actual relative/absolute/fixed CSS modes with explicit logical offsets", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#single-action")!).position).toBe("relative")
    expect(getComputedStyle(document.querySelector("#absolute-group")!).position).toBe("absolute")
    expect(getComputedStyle(document.querySelector("#quick-trigger")!).position).toBe("fixed")
    expect(css).toContain("min-block-size: var(--m-float-height, 40px)")
    expect(css).toContain("inline-size: var(--m-float-width, 40px)")
    expect(css).toContain("inset-inline-end")
    expect(css).not.toContain("anchor(")
  })

  it("keeps group shape/flow authoritative without provider injection or reordering", () => {
    fixture()
    install()
    const group = document.querySelector("#form-group")!
    expect(group.getAttribute("role")).toBe("group")
    expect(group.getAttribute("aria-label")).toBe("Project form actions")
    expect([...group.querySelectorAll(":scope > button")].map(e => e.id)).toEqual(["native-submit", "native-reset", "native-disabled", "hidden-group-action"])
    expect(getComputedStyle(document.querySelector("#native-submit")!).position).toBe("relative")
    expect(css).not.toContain("row-reverse")
    expect(css).not.toMatch(/(?:^|[;{])\s*order\s*:/m)
  })

  it("uses native popover commands and ordinary action groups instead of an ARIA menu runtime", () => {
    fixture()
    install()
    expect(document.querySelector("#quick-trigger")!.getAttribute("popovertarget")).toBe("quick-panel")
    expect(document.querySelector("#quick-panel")!.getAttribute("popover")).toBe("auto")
    expect(document.querySelector("#record-action")!.getAttribute("popovertargetaction")).toBe("hide")
    expect(document.querySelector("#close-panel")!.getAttribute("popovertargetaction")).toBe("hide")
    expect(document.querySelector("#quick-trigger")!.hasAttribute("aria-expanded")).toBe(false)
    expect(app).toContain('panel.addEventListener("toggle"')
    expect(app).not.toContain('addEventListener("keydown"')
    expect(app).not.toContain("m:change")
  })

  it("has a guarded static fallback without unconditional closed-popover display overrides", () => {
    expect(css).toContain("@supports selector(:popover-open)")
    expect(css).toMatch(/button\.m-float-trigger,\s*button\.m-float-popover-command\s*\{\s*display: none;\s*\}/)
    expect(css).not.toMatch(/\.m-float-panel\[popover\]\s*\{[^}]*display:\s*(?:block|flex|grid)/s)
    expect(app).toContain('"showPopover" in HTMLElement.prototype')
    expect(app).not.toContain("showPopover(")
    expect(app).not.toContain("togglePopover(")
  })

  it("preserves native form defaults, validity, reset and disabled semantics", () => {
    fixture()
    install()
    const form = document.querySelector<HTMLFormElement>("#native-form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    const submit = document.querySelector<HTMLButtonElement>("#native-submit")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabledClicks++)
    expect(submit.type).toBe("submit")
    expect(submit.getAttribute("data-type")).toBe("primary")
    input.value = ""
    submit.click()
    expect(submits).toBe(0)
    input.value = "Updated"
    submit.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["project", "Updated"]])
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(input.value).toBe("Original")
    expect(disabledClicks).toBe(0)
  })

  it("keeps badge/help/description as author markup, without generated tooltip assets", () => {
    fixture()
    install()
    expect(document.querySelector("#badge-action .demo-badge")!.getAttribute("aria-hidden")).toBe("true")
    expect(document.querySelector("#badge-action")!.getAttribute("aria-describedby")).toBe("badge-help")
    expect(document.querySelector("#home-action .m-float-description")!.textContent).toBe("Home")
    expect(document.querySelector("#single-action svg")!.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(document.querySelector("#single-action svg")!.getAttribute("focusable")).toBe("false")
    expect(css).not.toContain("badge")
    expect(css).not.toContain("tooltip")
  })

  it("preserves hidden buttons/templates and ignores templates for grouped separators", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#hidden-float")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#hidden-group-action")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#native-template")!).display).toBe("none")
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert authored template")
    expect(css).toContain(':where(button, a[href]).m-float-button:not([hidden]) ~')
  })

  it("documents geometry through author safe-area/gutter CSS rather than measurements", () => {
    expect(appCss).toContain("safe-area-inset-right")
    expect(appCss).toContain("safe-area-inset-left")
    expect(appCss).toContain("padding-inline: 1rem 6rem")
    expect(appCss).toContain("position: relative")
    expect(css).toContain("var(--m-float-trigger-size, 40px)")
    expect(css).toContain("var(--m-float-opposite-clearance, 1rem)")
    expect(css).toContain("safe-area-inset-top")
    expect(app).not.toContain("getBoundingClientRect")
    expect(app).not.toContain("ResizeObserver")
  })

  it("provides print and forced-color treatment with no animation or global overlay state", () => {
    expect(css).toContain("@media print")
    expect(css).toContain("position: static !important")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("color: GrayText")
    expect(css).toContain("filter: none!important")
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("animation:")
    expect(app).not.toContain("setTimeout")
    expect(app).not.toContain("history.")
  })

  it("matches source-sized icons, descriptions and borderless native actions", () => {
    install()
    const rules = [...style!.sheet!.cssRules] as CSSStyleRule[]
    const root = rules.find(rule => rule.selectorText === ":where(button, a[href]).m-float-button")!
    expect(root.style.getPropertyValue("padding")).toBe("2px 4px")
    expect(root.style.getPropertyValue("border")).toBe("0")
    expect(root.style.getPropertyValue("font-size")).toBe("18px")
    expect(root.style.getPropertyValue("border-radius")).toBe("4096px")
    const description = rules.find(rule => rule.selectorText === ".m-float-description")!
    expect(description.style.getPropertyValue("font-size")).toBe("12px")
    expect(description.style.getPropertyValue("line-height")).toBe("14px")
  })

  it("keeps authored colors above the primary palette and scopes dark contrast/shadows", () => {
    install()
    const rules = [...style!.sheet!.cssRules] as CSSStyleRule[]
    const primary = rules.find(rule => rule.selectorText === '.m-float-button[data-type="primary"]')!
    expect(primary.style.getPropertyValue("--m-float-background")).toBe("")
    expect(primary.style.getPropertyValue("--m-float-color")).toBe("")
    expect(primary.style.getPropertyValue("--_m-float-bg")).toContain("--m-color-primary")
    const dark = rules.find(rule => rule.selectorText === ':where([data-m-theme="dark"])')!
    expect(dark.style.getPropertyValue("--_m-float-bg")).toBe("#48484e")
    expect(dark.style.getPropertyValue("--_m-float-contrast")).toBe("#000")
    expect(dark.style.getPropertyValue("--_m-float-alpha")).toBe(".12")
    expect(dark.style.getPropertyValue("--_m-float-hover-alpha")).toBe(".18")
  })

  it("counts a visible square-group separator without shrinking the native action minimum", () => {
    expect(css).toContain("min-block-size: calc(var(--m-float-height, 40px) + 1px)")
    expect(css).toContain("gap: var(--m-float-group-gap, 16px)")
    expect(css).toContain("var(--m-float-square-radius, 3px)")
    expect(css).toContain("outline: 2px solid var(--m-color-info, #2080f0)")
  })
})

describe("canonical FloatButton ViewElement", () => {
  it("exports canonical ViewElement classes and registers m-float-button and m-float-button-group", () => {
    expect(floatButtonApi.FloatButton).toBe(FloatButton)
    expect(floatButtonApi.MFloatButton).toBe(MFloatButton)
    expect(MFloatButton).toBe(FloatButton)
    expect(floatButtonApi.FloatButtonGroup).toBe(FloatButtonGroup)
    expect(floatButtonApi.MFloatButtonGroup).toBe(MFloatButtonGroup)
    expect(MFloatButtonGroup).toBe(FloatButtonGroup)
    expect(FloatButton.tag).toBe("m-float-button")
    expect(FloatButtonGroup.tag).toBe("m-float-button-group")
    expect(ViewElement.prototype.isPrototypeOf(FloatButton.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(FloatButtonGroup.prototype)).toBe(true)
    expect(customElements.get("m-float-button")).toBe(FloatButton)
    expect(customElements.get("m-float-button-group")).toBe(FloatButtonGroup)
    expect(FloatButton.observedAttributes).toEqual(["type", "shape", "right", "bottom"])
    expect(FloatButtonGroup.observedAttributes).toEqual(["shape"])
    expect(() => registerFloatButton()).not.toThrow()

    const define = vi.fn()
    expect(() => registerFloatButton({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("handles type property defaults, choices, validation, and dataset synchronization", () => {
    const element = document.createElement("m-float-button") as FloatButton
    document.body.append(element)
    expect(element.type).toBe("default")
    expect(element.dataset.type).toBe("default")

    const types = ["default", "primary", "info", "success", "warning", "error"] as const
    for (const t of types) {
      element.type = t
      expect(element.type).toBe(t)
      expect(element.getAttribute("type")).toBe(t)
      expect(element.dataset.type).toBe(t)
    }

    expect(() => { element.type = "invalid" as any }).toThrow(RangeError)
    element.setAttribute("type", "invalid")
    expect(() => element.type).toThrow(RangeError)
    element.removeAttribute("type")
    expect(element.type).toBe("default")
    expect(element.dataset.type).toBe("default")
  })

  it("handles shape property defaults, choices, validation, and dataset synchronization", () => {
    const element = document.createElement("m-float-button") as FloatButton
    document.body.append(element)
    expect(element.shape).toBe("circle")
    expect(element.dataset.shape).toBe("circle")

    element.shape = "square"
    expect(element.shape).toBe("square")
    expect(element.getAttribute("shape")).toBe("square")
    expect(element.dataset.shape).toBe("square")

    element.shape = "circle"
    expect(element.shape).toBe("circle")
    expect(element.getAttribute("shape")).toBe("circle")
    expect(element.dataset.shape).toBe("circle")

    expect(() => { element.shape = "round" as any }).toThrow(RangeError)
    element.setAttribute("shape", "round")
    expect(() => element.shape).toThrow(RangeError)
    element.removeAttribute("shape")
    expect(element.shape).toBe("circle")
  })

  it("handles right property string, number, null, and CSS custom property synchronization", () => {
    const element = document.createElement("m-float-button") as FloatButton
    document.body.append(element)
    expect(element.right).toBeNull()
    expect(element.style.getPropertyValue("--m-float-inline-end")).toBe("")

    element.right = "40px"
    expect(element.right).toBe("40px")
    expect(element.getAttribute("right")).toBe("40px")
    expect(element.style.getPropertyValue("--m-float-inline-end")).toBe("40px")

    element.right = 32
    expect(element.right).toBe(32)
    expect(element.getAttribute("right")).toBe("32")
    expect(element.style.getPropertyValue("--m-float-inline-end")).toBe("32px")

    element.right = null
    expect(element.right).toBeNull()
    expect(element.hasAttribute("right")).toBe(false)
    expect(element.style.getPropertyValue("--m-float-inline-end")).toBe("")

    element.setAttribute("right", "50px")
    expect(element.right).toBe("50px")
    expect(element.style.getPropertyValue("--m-float-inline-end")).toBe("50px")

    element.setAttribute("right", "20")
    expect(element.right).toBe(20)
    expect(element.style.getPropertyValue("--m-float-inline-end")).toBe("20px")

    element.removeAttribute("right")
    expect(element.right).toBeNull()
    expect(element.style.getPropertyValue("--m-float-inline-end")).toBe("")

    for (const invalid of [NaN, Infinity, true as any, {} as any]) {
      expect(() => { element.right = invalid }).toThrow(RangeError)
    }
  })

  it("handles bottom property string, number, null, and CSS custom property synchronization", () => {
    const element = document.createElement("m-float-button") as FloatButton
    document.body.append(element)
    expect(element.bottom).toBeNull()
    expect(element.style.getPropertyValue("--m-float-block-end")).toBe("")

    element.bottom = "50px"
    expect(element.bottom).toBe("50px")
    expect(element.getAttribute("bottom")).toBe("50px")
    expect(element.style.getPropertyValue("--m-float-block-end")).toBe("50px")

    element.bottom = 48
    expect(element.bottom).toBe(48)
    expect(element.getAttribute("bottom")).toBe("48")
    expect(element.style.getPropertyValue("--m-float-block-end")).toBe("48px")

    element.bottom = null
    expect(element.bottom).toBeNull()
    expect(element.hasAttribute("bottom")).toBe(false)
    expect(element.style.getPropertyValue("--m-float-block-end")).toBe("")

    element.setAttribute("bottom", "60px")
    expect(element.bottom).toBe("60px")
    expect(element.style.getPropertyValue("--m-float-block-end")).toBe("60px")

    element.setAttribute("bottom", "15")
    expect(element.bottom).toBe(15)
    expect(element.style.getPropertyValue("--m-float-block-end")).toBe("15px")

    element.removeAttribute("bottom")
    expect(element.bottom).toBeNull()
    expect(element.style.getPropertyValue("--m-float-block-end")).toBe("")

    for (const invalid of [NaN, Infinity, true as any, {} as any]) {
      expect(() => { element.bottom = invalid }).toThrow(RangeError)
    }
  })

  it("replays pre-upgrade properties upon connection", () => {
    const element = document.createElement("m-float-button") as FloatButton
    Object.defineProperty(element, "type", { configurable: true, value: "warning" })
    Object.defineProperty(element, "shape", { configurable: true, value: "square" })
    Object.defineProperty(element, "right", { configurable: true, value: "24px" })
    Object.defineProperty(element, "bottom", { configurable: true, value: 36 })
    document.body.append(element)

    expect(element.type).toBe("warning")
    expect(element.shape).toBe("square")
    expect(element.right).toBe("24px")
    expect(element.bottom).toBe(36)
    expect(element.getAttribute("type")).toBe("warning")
    expect(element.getAttribute("shape")).toBe("square")
    expect(element.getAttribute("right")).toBe("24px")
    expect(element.getAttribute("bottom")).toBe("36")
    expect(element.dataset.type).toBe("warning")
    expect(element.dataset.shape).toBe("square")
    expect(element.style.getPropertyValue("--m-float-inline-end")).toBe("24px")
    expect(element.style.getPropertyValue("--m-float-block-end")).toBe("36px")
  })

  it("sets up connected attributes, role, tabindex, and classes", () => {
    const element = document.createElement("m-float-button") as FloatButton
    document.body.append(element)

    expect(element.dataset.mFloatButton).toBe("")
    expect(element.classList.contains("m-float-button")).toBe(true)
    expect(element.getAttribute("role")).toBe("button")
    expect(element.getAttribute("tabindex")).toBe("0")

    const link = document.createElement("m-float-button") as FloatButton
    link.setAttribute("href", "#home")
    document.body.append(link)
    expect(link.getAttribute("role")).toBe("link")
  })

  it("emits m:click event with originalEvent detail on click", () => {
    const element = document.createElement("m-float-button") as FloatButton
    document.body.append(element)

    const clickHandler = vi.fn()
    element.addEventListener("m:click", clickHandler)
    element.click()

    expect(clickHandler).toHaveBeenCalledTimes(1)
    expect(clickHandler.mock.calls[0]![0].detail).toHaveProperty("originalEvent")
    expect(clickHandler.mock.calls[0]![0].detail.originalEvent).toBeInstanceOf(MouseEvent)
    expect(clickHandler.mock.calls[0]![0].bubbles).toBe(true)
    expect(clickHandler.mock.calls[0]![0].cancelable).toBe(true)
  })

  it("keyboard Enter and Space activate float button and disabled suppresses click", () => {
    const element = document.createElement("m-float-button") as FloatButton
    document.body.append(element)

    const clickHandler = vi.fn()
    element.addEventListener("m:click", clickHandler)

    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    expect(clickHandler).toHaveBeenCalledTimes(1)

    element.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }))
    expect(clickHandler).toHaveBeenCalledTimes(2)

    element.setAttribute("disabled", "")
    element.click()
    expect(clickHandler).toHaveBeenCalledTimes(2)

    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    expect(clickHandler).toHaveBeenCalledTimes(2)
  })

  it("handles FloatButtonGroup shape and role setup", () => {
    const group = document.createElement("m-float-button-group") as FloatButtonGroup
    document.body.append(group)

    expect(group.dataset.mFloatGroup).toBe("")
    expect(group.classList.contains("m-float-group")).toBe(true)
    expect(group.getAttribute("role")).toBe("group")
    expect(group.shape).toBe("circle")
    expect(group.dataset.shape).toBe("circle")

    group.shape = "square"
    expect(group.shape).toBe("square")
    expect(group.getAttribute("shape")).toBe("square")
    expect(group.dataset.shape).toBe("square")

    expect(() => { group.shape = "invalid" as any }).toThrow(RangeError)
  })

  it("exposes MarkupUIFloatButton global", async () => {
    await import("../src/components/float-button/global.js")
    const globalApi = (globalThis as any).MarkupUIFloatButton
    expect(globalApi).toBeDefined()
    expect(globalApi.FloatButton).toBe(FloatButton)
    expect(globalApi.FloatButtonGroup).toBe(FloatButtonGroup)
    expect(globalApi.registerFloatButton).toBe(registerFloatButton)
  })

  it("generates component API documentation matching the ViewElement specification", () => {
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "float-button.json"), "utf8"))
    expect(docs.elements).toHaveLength(2)

    const [buttonDoc, groupDoc] = docs.elements
    expect(buttonDoc.type).toBe("FloatButton")
    expect(buttonDoc.web.primary).toBe("m-float-button")
    expect(buttonDoc.properties.type).toMatchObject({
      name: "type",
      type: "enum",
      default: "default",
      attribute: "type",
      values: expect.arrayContaining(["default", "primary", "info", "success", "warning", "error"]),
    })
    expect(buttonDoc.properties.shape).toMatchObject({
      name: "shape",
      type: "enum",
      default: "circle",
      attribute: "shape",
      values: ["circle", "square"],
    })
    expect(buttonDoc.properties.right).toMatchObject({
      name: "right",
      type: "number",
      typeName: "string | number | null",
      default: null,
      attribute: "right",
      nullable: true,
      writable: true,
    })
    expect(buttonDoc.properties.bottom).toMatchObject({
      name: "bottom",
      type: "number",
      typeName: "string | number | null",
      default: null,
      attribute: "bottom",
      nullable: true,
      writable: true,
    })
    expect(buttonDoc.regions).toEqual([
      { name: "content", accepts: ["text", "phrasing", "icon"], min: 0, max: null },
      { name: "description", accepts: ["text", "phrasing"], min: 0, max: 1 },
    ])
    expect(buttonDoc.events).toEqual([
      {
        name: "Click",
        web: "m:click",
        bubbles: true,
        cancelable: true,
        composed: false,
        detail: { originalEvent: "MouseEvent" },
      },
    ])

    expect(groupDoc.type).toBe("FloatButtonGroup")
    expect(groupDoc.web.primary).toBe("m-float-button-group")
    expect(groupDoc.properties.shape).toMatchObject({
      name: "shape",
      type: "enum",
      default: "circle",
      attribute: "shape",
      values: ["circle", "square"],
    })
    expect(groupDoc.regions).toEqual([
      { name: "items", accepts: ["FloatButton"], min: 0, max: null, element: "m-float-button" },
    ])
  })

  it("renders API documentation in demo element", async () => {
    const { renderComponentApi } = await import("../demo/component-api.js")
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "float-button.json"), "utf8"))
    const container = document.createElement("div")
    renderComponentApi(container, docs.elements)
    expect(container.textContent).toContain("FloatButton")
    expect(container.textContent).toContain("FloatButtonGroup")
    expect(container.textContent).toContain("m-float-button")
    expect(container.textContent).toContain("m-float-button-group")
    expect(container.textContent).toContain("m:click")
  })

  it("structures FloatButton demo with standard scaffold and explicit shared-core loading", () => {
    const demoHtml = readFileSync(resolve("demo", "components", "float-button.html"), "utf8")
    const parsed = new DOMParser().parseFromString(demoHtml, "text/html")
    const scripts = [...parsed.querySelectorAll("script[src]")].map(script => script.getAttribute("src"))
    expect(scripts.indexOf("../../dist/markup-ui-core.global.js")).toBeLessThan(scripts.indexOf("../../dist/markup-ui-float-button.global.js"))
    expect(parsed.querySelector("main[data-demo-page].component-docs #float-button-api")).not.toBeNull()
    expect(parsed.querySelector('script[src="../component-outline.js"]')).not.toBeNull()
    expect(parsed.querySelector('link[href="../example-code.css"]')).not.toBeNull()
    expect(parsed.querySelector('link[href="../component-api.css"]')).not.toBeNull()
    expect(parsed.querySelector("details.component-setup")).not.toBeNull()
    for (const example of parsed.querySelectorAll("[data-demo-example]")) {
      expect(example.querySelector("[data-demo-header] h2[id]")).not.toBeNull()
      expect(example.querySelector("[data-demo-preview]")).not.toBeNull()
    }
  })
})

