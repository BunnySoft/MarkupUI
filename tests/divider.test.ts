import { readFileSync } from "node:fs"
import { createContext, runInContext } from "node:vm"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Divider, registerDivider } from "../src/components/divider/index.js"
import * as dividerApi from "../src/components/divider/index.js"
import { ViewElement } from "../src/core/index.js"
import { builtInElementNames, registerElements } from "../src/components/elements.js"

const css = readFileSync("src\\components\\divider\\divider.css", "utf8")
let style: HTMLStyleElement | undefined
function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}
function divider(markup = "<m-divider></m-divider>"): Divider {
  document.body.innerHTML = markup
  return document.querySelector<Divider>("m-divider")!
}
const rule = (element: Divider) => element.querySelector<HTMLHRElement>(":scope > hr[data-part=rule]")!
const title = (element: Divider) => element.querySelector<HTMLDivElement>(":scope > div[data-part=title]")!
const tail = (element: Divider) => element.querySelector<HTMLSpanElement>(":scope > span[data-part=tail]")!
afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("direct Divider API", () => {
  it("exports one canonical own-tag ViewElement and atomic registration without aggregate competition", () => {
    expect(Object.keys(dividerApi).sort()).toEqual(["Divider", "registerDivider"])
    expect(Object.hasOwn(Divider, "tag")).toBe(true)
    expect(Divider.tag).toBe("m-divider")
    expect(ViewElement.prototype.isPrototypeOf(Divider.prototype)).toBe(true)
    expect(customElements.get("m-divider")).toBe(Divider)
    expect("meta" in Divider).toBe(false)
    expect(Divider.observedAttributes).toEqual(["orientation", "dashed", "title-placement", "semantic", "label"])
    expect(builtInElementNames).not.toContain("m-divider")
    const aggregateCss = readFileSync("src\\components\\styles.css", "utf8")
    expect(aggregateCss).not.toContain("m-divider{display:block;border-top:")
    expect(aggregateCss).not.toContain("m-divider[vertical]")
    const define = vi.fn()
    registerElements({ get: () => undefined, define } as unknown as CustomElementRegistry)
    expect(define.mock.calls.some(([name]) => name === "m-divider")).toBe(false)
    define.mockClear()
    expect(() => registerDivider({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerDivider()).not.toThrow()
  })

  it("has five explicit defaults and rejects invalid typed writes before changing attributes", () => {
    const element = document.createElement("m-divider") as Divider
    expect(element.orientation).toBe("horizontal")
    expect(element.dashed).toBe(false)
    expect(element.titlePlacement).toBe("center")
    expect(element.semantic).toBe(true)
    expect(element.label).toBeNull()
    for (const [property, value] of [
      ["orientation", "diagonal"], ["orientation", null], ["titlePlacement", "left"],
      ["dashed", "false"], ["semantic", "false"], ["label", 2], ["label", undefined],
    ]) expect(() => Reflect.set(element, property!, value)).toThrow(RangeError)
    expect(element.attributes).toHaveLength(0)
    element.setAttribute("orientation", "invalid")
    expect(() => element.orientation).toThrow(RangeError)
    element.removeAttribute("orientation")
    element.setAttribute("title-placement", "")
    expect(() => element.titlePlacement).toThrow(RangeError)
    element.removeAttribute("title-placement")
    element.setAttribute("semantic", "invalid")
    expect(() => element.semantic).toThrow(RangeError)
    element.removeAttribute("semantic")
    for (const value of ["", "true"]) {
      element.setAttribute("semantic", value)
      expect(element.semantic).toBe(true)
    }
    element.semantic = false
    expect(element.getAttribute("semantic")).toBe("false")
    element.dashed = true
    expect(element.getAttribute("dashed")).toBe("")
    element.dashed = false
    expect(element.hasAttribute("dashed")).toBe(false)
  })

  it("updates only the native rule's name, orientation and semantic exposure", () => {
    const element = divider("<m-divider><h2>Settings</h2></m-divider>")
    const native = rule(element), heading = element.querySelector("h2")!
    expect(native.localName).toBe("hr")
    expect(native.childNodes).toHaveLength(0)
    expect(native.getAttribute("aria-orientation")).toBe("horizontal")
    expect(native.hasAttribute("aria-label") || native.hasAttribute("role")).toBe(false)
    element.label = "End of introduction"
    element.orientation = "vertical"
    element.dashed = true
    element.titlePlacement = "end"
    element.semantic = false
    expect(rule(element)).toBe(native)
    expect(native.getAttribute("aria-label")).toBe("End of introduction")
    expect(native.getAttribute("aria-orientation")).toBe("vertical")
    expect(native.getAttribute("aria-hidden")).toBe("true")
    expect(element.hasAttribute("role") || element.hasAttribute("aria-hidden") || element.hasAttribute("aria-orientation")).toBe(false)
    expect(heading.closest("[role=separator],[aria-hidden]")).toBeNull()
    expect(heading.textContent).toBe("Settings")
    element.semantic = true
    element.label = null
    expect(native.hasAttribute("aria-hidden") || native.hasAttribute("aria-label")).toBe(false)
    expect(tail(element).getAttribute("aria-hidden")).toBe("true")
  })

  it("does not derive a separator label from title text, hide captions or synthesize heading semantics", () => {
    const element = divider('<m-divider label="Rule name"><span id="caption">Plain caption</span></m-divider>')
    const caption = element.querySelector("#caption")!
    expect(rule(element).getAttribute("aria-label")).toBe("Rule name")
    expect(rule(element).hasAttribute("aria-labelledby")).toBe(false)
    expect(caption.hasAttribute("role") || caption.hasAttribute("aria-hidden") || caption.hasAttribute("hidden")).toBe(false)
    expect(element.querySelector("[aria-level]")).toBeNull()
    expect(caption.parentElement).toBe(title(element))
    expect(title(element).parentElement).toBe(rule(element).parentElement)
    element.label = ""
    expect(rule(element).getAttribute("aria-label")).toBe("")
    expect(caption.textContent).toBe("Plain caption")
  })

  it("replays pre-upgrade properties before creating a consistent native rule", () => {
    const element = document.createElement("m-divider") as Divider
    element.innerHTML = "<h3>Late upgrade</h3>"
    const heading = element.firstElementChild
    for (const [name, value] of Object.entries({ orientation: "vertical", dashed: true, titlePlacement: "start", semantic: false, label: "Late label" })) {
      Object.defineProperty(element, name, { configurable: true, value })
    }
    document.body.append(element)
    expect(element.orientation).toBe("vertical")
    expect(element.dashed).toBe(true)
    expect(element.titlePlacement).toBe("start")
    expect(element.semantic).toBe(false)
    expect(element.label).toBe("Late label")
    expect(Object.hasOwn(element, "orientation") || Object.hasOwn(element, "semantic")).toBe(false)
    expect(rule(element).getAttribute("aria-hidden")).toBe("true")
    expect(title(element).firstElementChild).toBe(heading)
    expect(element.querySelectorAll("hr")).toHaveLength(1)
  })
})

describe("Divider content and lifetime", () => {
  it("preserves original text, heading nodes, listeners and inert template/script content", () => {
    const element = document.createElement("m-divider") as Divider
    element.innerHTML = '<h2 style="font-size:21px;font-weight:800">Original</h2> suffix<template><span>Inert</span></template><script type="application/json">{}</script>'
    const heading = element.querySelector("h2")!, originalText = heading.nextSibling!
    const template = element.querySelector("template")!, script = element.querySelector("script")!
    const listener = vi.fn()
    heading.addEventListener("example", listener)
    document.body.append(element)
    install()
    heading.dispatchEvent(new Event("example"))
    expect(listener).toHaveBeenCalledOnce()
    expect(title(element).firstChild).toBe(heading)
    expect(heading.nextSibling).toBe(originalText)
    expect(template.parentElement).toBe(element)
    expect(template.content.textContent).toBe("Inert")
    expect(script.parentElement).toBe(element)
    expect(getComputedStyle(heading).fontSize).toBe("21px")
    expect(getComputedStyle(heading).fontWeight).toBe("800")
    expect(element.textContent).not.toContain("Inert")
  })

  it("adopts late content in order and retains private chrome on scalar changes", async () => {
    const element = divider("<m-divider><span>Original</span></m-divider>")
    const native = rule(element), wrapper = title(element), trailing = tail(element), original = wrapper.firstChild
    const before = document.createTextNode("Before ")
    const after = document.createTextNode(" After")
    element.prepend(before)
    element.append(after)
    await Promise.resolve()
    expect([...wrapper.childNodes]).toEqual([before, original, after])
    expect(wrapper.textContent).toBe("Before Original After")
    element.orientation = "vertical"
    element.titlePlacement = "start"
    element.label = "Named"
    expect(rule(element)).toBe(native)
    expect(title(element)).toBe(wrapper)
    expect(tail(element)).toBe(trailing)
    expect(element.querySelectorAll(":scope > hr")).toHaveLength(1)
  })

  it("observes initially empty text becoming a title without dropping authored nodes", async () => {
    const element = divider()
    const text = document.createTextNode("")
    element.append(text)
    await Promise.resolve()
    expect(element.dataset.state).toBe("")
    text.data = "Now a title"
    await Promise.resolve()
    expect(element.dataset.state).toBe("titled")
    expect(text.parentElement).toBe(title(element))
    text.data = " "
    await Promise.resolve()
    expect(element.dataset.state).toBe("")
    expect(text.parentElement).toBe(title(element))
    text.data = "Visible again"
    await Promise.resolve()
    expect(element.dataset.state).toBe("titled")
  })

  it("does not resurrect removed title content when authored regions are replaced", async () => {
    const element = divider("<m-divider><h2>Old title</h2></m-divider>")
    const native = rule(element), oldHeading = element.querySelector("h2")!
    element.innerHTML = "<h3>New title</h3>"
    const newHeading = element.querySelector("h3")!
    await Promise.resolve()
    expect(element.querySelectorAll("hr")).toHaveLength(1)
    expect(rule(element)).toBe(native)
    expect(title(element).firstElementChild).toBe(newHeading)
    expect(element.contains(oldHeading)).toBe(false)
    element.replaceChildren()
    await Promise.resolve()
    expect(element.dataset.state).toBe("")
    expect(element.textContent).toBe("")
  })

  it("does not mistake private-looking authored descendants for its owned title or rule", () => {
    const element = divider('<m-divider><span data-part="title">Authored title</span><span data-part="rule">Authored text</span></m-divider>')
    expect(title(element).children).toHaveLength(2)
    expect(title(element).firstElementChild?.textContent).toBe("Authored title")
    expect(element.querySelectorAll("hr")).toHaveLength(1)
    expect(title(element).hasAttribute("aria-hidden")).toBe(false)
  })

  it("stops observation when disconnected and reconciles the same nodes once on reconnect", async () => {
    const element = divider("<m-divider><h2>Retained</h2></m-divider>")
    const native = rule(element), wrapper = title(element), heading = element.querySelector("h2")!
    const listener = vi.fn()
    heading.addEventListener("example", listener)
    element.remove()
    element.orientation = "vertical"
    element.semantic = false
    element.append(" Late")
    await Promise.resolve()
    expect(native.getAttribute("aria-orientation")).toBe("horizontal")
    expect(wrapper.textContent).toBe("Retained")
    document.body.append(element)
    expect(rule(element)).toBe(native)
    expect(title(element)).toBe(wrapper)
    expect(wrapper.textContent).toBe("Retained Late")
    expect(native.getAttribute("aria-orientation")).toBe("vertical")
    expect(native.getAttribute("aria-hidden")).toBe("true")
    heading.dispatchEvent(new Event("example"))
    expect(listener).toHaveBeenCalledOnce()
    expect(element.querySelectorAll("hr")).toHaveLength(1)
  })

  it("adds no focus model, keyboard handler or interaction to the separator", () => {
    const element = divider('<a href="#one">Before</a><m-divider orientation="vertical"><h2>Title</h2></m-divider><a href="#two">After</a>')
    expect(element.tabIndex).toBe(-1)
    expect(rule(element).tabIndex).toBe(-1)
    expect(element.querySelector("[tabindex],button,input,[role=button]")).toBeNull()
    for (const key of ["Enter", " ", "ArrowRight"]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
      element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(document.querySelectorAll("body > a")).toHaveLength(2)
    expect(element.querySelector("h2")?.closest("[aria-hidden],[role=separator]")).toBeNull()
  })
})

describe("Divider presentation and packaging", () => {
  it("uses one visible rule without a title and keeps vertical titles beside their rule", () => {
    install()
    const element = divider('<m-divider title-placement="start"></m-divider>')
    expect(getComputedStyle(tail(element)).display).toBe("none")
    expect(getComputedStyle(rule(element)).flexGrow).toBe("1")
    element.append(document.createElement("h2"))
    element.orientation = "vertical"
    expect(getComputedStyle(element).display).toBe("inline-flex")
    expect(getComputedStyle(tail(element)).display).toBe("none")
    expect(getComputedStyle(title(element)).display).not.toBe("none")
    expect(element.querySelector("h2")?.hasAttribute("hidden")).toBe(false)
  })

  it("preserves hidden hosts and authored content visibility without styling unrelated hr elements", () => {
    const outside = document.createElement("hr")
    document.body.append(outside)
    const original = getComputedStyle(outside).borderTopStyle
    install()
    expect(getComputedStyle(outside).borderTopStyle).toBe(original)
    const element = document.createElement("m-divider") as Divider
    element.hidden = true
    element.innerHTML = '<h2>Hidden by author</h2><span hidden>Also authored</span>'
    document.body.append(element)
    expect(getComputedStyle(element).display).toBe("none")
    expect(element.querySelector("span[hidden]")?.hasAttribute("hidden")).toBe(true)
    expect(element.querySelector("h2")?.hasAttribute("hidden")).toBe(false)
  })

  it("retains light/dark tokens, caption sizing, spacing, printable borders and forced colors without motion", () => {
    for (const value of [
      "--_m-divider-color: #efeff5", "--_m-divider-text-color: #1f2225",
      "--_m-divider-color: rgb(255 255 255 / .09)", "--_m-divider-text-color: rgb(255 255 255 / .9)",
      "var(--m-divider-color, var(--_m-divider-color, #efeff5))",
      "var(--m-divider-text-color, var(--_m-divider-text-color, #1f2225))",
      "font-size: 16px", "var(--m-divider-label-size, 16px)", "var(--m-divider-label-weight, 500)",
      "var(--m-divider-space, 24px)", "var(--m-divider-inline-space, 8px)", "var(--m-divider-label-gap, 12px)",
      "border-block-start:", "border-inline-start:", "overflow-wrap: anywhere",
      "flex: 0 1 var(--m-divider-edge, 28px)", "@media (forced-colors: active)", "--m-divider-color: CanvasText",
    ]) expect(css).toContain(value)
    for (const value of ["transition:", "@keyframes", "overflow: hidden", "background:", ".m-divider", "--m-border", "--m-text-primary", "forced-color-adjust: none"]) expect(css).not.toContain(value)
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1500)
  })

  it("exports the runtime and stylesheet, requires shared core and registers no other family", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./divider"]).toEqual({ types: "./dist/components/divider/index.d.ts", import: "./dist/markup-ui-divider.js" })
    expect(pkg.exports["./divider/style.css"]).toBe("./dist/markup-ui-divider.css")
    const script = readFileSync("dist\\markup-ui-divider.global.js", "utf8")
    const define = vi.fn()
    expect(() => runInContext(script, createContext({ HTMLElement, customElements: { get: vi.fn(), define } }))).toThrow("Load compatible markup-ui-core.global.js")
    expect(define).not.toHaveBeenCalled()
    const entries = new Map<string, unknown>()
    const context = createContext({ HTMLElement, customElements: {
      get: (name: string) => entries.get(name), define: (name: string, constructor: unknown) => entries.set(name, constructor),
    } })
    runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
    runInContext(script, context)
    expect([...entries.keys()]).toEqual(["m-divider"])
    expect(runInContext("Object.keys(MarkupUIDivider).sort()", context)).toEqual(["Divider", "registerDivider"])
    expect(runInContext("MarkupUICore.ViewElement.prototype.isPrototypeOf(MarkupUIDivider.Divider.prototype)", context)).toBe(true)
    expect(() => runInContext(script, context)).toThrow("already defined")
    expect(readFileSync("dist\\markup-ui-divider.js", "utf8")).toContain("./markup-ui-core.js")
    for (const name of ["m-card", "m-carousel", "m-collapse", "m-avatar", "m-button"]) expect(script).not.toContain(`"${name}"`)
  })

  it("stays within the new JS/runtime budgets and unchanged CSS budget with honest manifest accounting", () => {
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    const payload = manifest.componentPayloads.divider
    expect(manifest.bundles["markup-ui-divider.css"].budget).toBe(1500)
    for (const [mode, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      const component = gzipSync(readFileSync(`dist\\markup-ui-divider${suffix}`), { level: 9 }).length
      const core = gzipSync(readFileSync(`dist\\markup-ui-core${suffix}`), { level: 9 }).length
      const styles = gzipSync(readFileSync("dist\\markup-ui-divider.css"), { level: 9 }).length
      expect(component).toBeLessThanOrEqual(3000)
      expect(component + core).toBeLessThanOrEqual(5000)
      expect(manifest.bundles[`markup-ui-divider${suffix}`].budget).toBe(3000)
      expect(payload[mode!]).toMatchObject({ dependencies: [`markup-ui-core${suffix}`], runtimeBudget: 5000, runtimeGzipBytes: component + core, totalGzipBytes: component + core + styles })
    }
  })
})
