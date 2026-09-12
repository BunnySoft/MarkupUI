import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { createContext, runInContext } from "node:vm"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Icon, IconWrapper, registerIcon } from "../src/components/icon/index.js"
import * as iconApi from "../src/components/icon/index.js"
import { ViewElement } from "../src/core/index.js"
import { validateHeader } from "../src/components/collapse/controller.js"
import { createTooltip } from "../src/components/tooltip/index.js"
import { Dropdown } from "../src/components/dropdown/index.js"

const css = readFileSync(resolve("src", "components", "icon", "icon.css"), "utf8")
const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
const controllers: { disconnect(): void }[] = []
let stylesheet: HTMLStyleElement | undefined
function install(): void {
  stylesheet = document.createElement("style")
  stylesheet.textContent = css
  document.head.append(stylesheet)
}
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  stylesheet?.remove()
  stylesheet = undefined
  document.body.replaceChildren()
})

describe("direct Icon and IconWrapper", () => {
  it("exports only its canonical family and registers atomically through shared core", () => {
    expect(Object.keys(iconApi).sort()).toEqual(["Icon", "IconWrapper", "registerIcon"])
    for (const type of [Icon, IconWrapper]) {
      expect(Object.hasOwn(type, "tag")).toBe(true)
      expect(type.prototype instanceof ViewElement).toBe(true)
      expect(customElements.get(type.tag)).toBe(type)
      expect("meta" in type).toBe(false)
    }
    const define = vi.fn()
    expect(() => registerIcon({ get: name => name === "m-icon-wrapper" ? class extends HTMLElement {} : undefined, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerIcon()).not.toThrow()
  })

  it("uses inherited sizing by default and validates direct size/depth writes", () => {
    const icon = new Icon()
    const wrapper = new IconWrapper()
    expect(icon.size).toBeNull()
    expect(icon.depth).toBeNull()
    expect(wrapper.size).toBeNull()
    document.body.append(icon, wrapper)
    icon.size = 28.5
    wrapper.size = 40
    icon.depth = 3
    expect(icon.style.getPropertyValue("--m-icon-size")).toBe("28.5px")
    expect(wrapper.style.getPropertyValue("--m-icon-wrapper-size")).toBe("40px")
    expect(icon.getAttribute("depth")).toBe("3")
    for (const value of [0, -1, NaN, Infinity, "32", true]) {
      expect(() => Reflect.set(icon, "size", value)).toThrow(RangeError)
      expect(() => Reflect.set(wrapper, "size", value)).toThrow(RangeError)
    }
    for (const value of [0, 6, 1.5, NaN, "3", true]) {
      expect(() => Reflect.set(icon, "depth", value)).toThrow(RangeError)
    }
    expect(icon.size).toBe(28.5)
    expect(icon.depth).toBe(3)
    const detached = new Icon()
    detached.setAttribute("depth", "03")
    expect(() => detached.depth).toThrow()
    detached.setAttribute("size", "20px")
    expect(() => detached.size).toThrow()
  })

  it("replays pre-upgrade properties and restores sizing without erasing later author edits", () => {
    const icon = new Icon()
    icon.style.setProperty("--m-icon-size", "3em", "important")
    const priority = icon.style.getPropertyPriority("--m-icon-size")
    Object.defineProperty(icon, "size", { value: 32, configurable: true })
    Object.defineProperty(icon, "depth", { value: 2, configurable: true })
    document.body.append(icon)
    expect(Object.hasOwn(icon, "size")).toBe(false)
    expect(Object.hasOwn(icon, "depth")).toBe(false)
    expect(icon.size).toBe(32)
    expect(icon.depth).toBe(2)
    icon.size = null
    expect(icon.style.getPropertyValue("--m-icon-size")).toBe("3em")
    expect(icon.style.getPropertyPriority("--m-icon-size")).toBe(priority)
    icon.size = 40
    icon.remove()
    expect(icon.style.getPropertyValue("--m-icon-size")).toBe("3em")
    document.body.append(icon)
    expect(icon.style.getPropertyValue("--m-icon-size")).toBe("40px")
    icon.style.setProperty("--m-icon-size", "5em")
    icon.remove()
    expect(icon.style.getPropertyValue("--m-icon-size")).toBe("5em")
  })

  it("preserves SVG namespaces, paint, native names, descriptions and node listeners", () => {
    const icon = new Icon()
    icon.innerHTML = '<svg role="img" aria-labelledby="title desc" viewBox="0 0 40 20" preserveAspectRatio="xMidYMid meet" color="#a04080" opacity=".45"><title id="title">Artwork</title><desc id="desc">Description</desc><path d="M0 0h20" fill="none" stroke="#123456" stroke-width="2"></path><circle cx="20" cy="10" r="5" fill="red"></circle></svg>'
    const svg = icon.firstElementChild!
    const before = svg.outerHTML
    const action = vi.fn()
    svg.addEventListener("example", action)
    document.body.append(icon)
    install()
    icon.size = 40
    icon.depth = 2
    icon.remove()
    document.body.append(icon)
    expect(icon.firstElementChild).toBe(svg)
    expect(svg.outerHTML).toBe(before)
    expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg")
    svg.dispatchEvent(new Event("example"))
    expect(action).toHaveBeenCalledOnce()
    expect(icon.hasAttribute("role") || icon.hasAttribute("aria-label") || icon.hasAttribute("aria-hidden")).toBe(false)
  })

  it("does not rewrite nested SVG viewports or introduce fill, stroke or rotation rules", () => {
    document.body.innerHTML = '<m-icon><svg viewBox="0 0 40 40"><svg width="12" height="6" viewBox="0 0 12 6"><rect fill="blue"></rect></svg></svg></m-icon>'
    const nested = document.querySelector("svg svg")!
    const before = nested.outerHTML
    install()
    expect(nested.outerHTML).toBe(before)
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:fill|stroke|stroke-width|transform)\s*:/m)
    expect(css).toContain("m-icon > :is(svg, img)")
    expect(css).not.toMatch(/m-icon\s+svg/)
  })

  it("preserves native names, actions, form semantics and hidden content", () => {
    document.body.innerHTML = '<form><input name="value" value="before"><button type="reset" aria-label="Reset"><m-icon-wrapper><m-icon aria-hidden="true">R</m-icon></m-icon-wrapper></button><button type="submit" name="action" value="save"><m-icon aria-hidden="true">S</m-icon>Save</button></form><a href="#next" aria-label="Next"><m-icon-wrapper><m-icon aria-hidden="true">+</m-icon></m-icon-wrapper></a><m-icon hidden><img src="original.svg" alt="" width="40" height="20"></m-icon><m-icon-wrapper hidden>Hidden</m-icon-wrapper>'
    const form = document.querySelector("form")!
    const input = form.querySelector("input")!
    const image = document.querySelector("img")!
    const before = image.outerHTML
    install()
    input.value = "after"
    form.querySelector<HTMLButtonElement>('[type="reset"]')!.click()
    expect(input.value).toBe("before")
    expect(new FormData(form, form.querySelector<HTMLButtonElement>('[type="submit"]')!).get("action")).toBe("save")
    expect(image.outerHTML).toBe(before)
    expect(document.querySelector("button")!.getAttribute("aria-label")).toBe("Reset")
    expect(getComputedStyle(document.querySelector("m-icon[hidden]")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("m-icon-wrapper[hidden]")!).display).toBe("none")
    expect(document.querySelector("m-icon[tabindex],m-icon-wrapper[tabindex],[aria-live]")).toBeNull()
  })

  it("adopts later native content without changing unrelated SVG or authored transforms", () => {
    const icon = new Icon()
    icon.style.transform = "rotate(30deg)"
    document.body.append(icon)
    icon.innerHTML = '<img src="original.svg" alt="Original" width="40" height="20">'
    const image = icon.firstElementChild
    document.body.insertAdjacentHTML("beforeend", '<svg id="outside" width="70" height="30" viewBox="0 0 70 30"></svg>')
    const outside = document.getElementById("outside")!
    const before = outside.outerHTML
    install()
    icon.size = 32
    expect(icon.firstElementChild).toBe(image)
    expect(icon.style.transform).toBe("rotate(30deg)")
    expect(outside.outerHTML).toBe(before)
  })
})

describe("passive Icon composition", () => {
  it("allows canonical icons in Collapse headers without allowing nested actions", () => {
    const header = document.createElement("m-collapse-header")
    header.innerHTML = '<m-icon-wrapper><m-icon aria-hidden="true">+</m-icon></m-icon-wrapper>Section'
    expect(() => validateHeader(header)).not.toThrow()
    header.querySelector("m-icon")!.append(document.createElement("button"))
    expect(() => validateHeader(header)).toThrow("noninteractive")
    header.innerHTML = "<x-widget>Unknown widget</x-widget>"
    expect(() => validateHeader(header)).toThrow()
  })

  it("allows passive icons in Tooltip content without registering or importing its UI family", () => {
    document.body.innerHTML = '<button id="tip-trigger" type="button">Help</button><div id="tip" class="m-popover m-tooltip" role="tooltip" popover="manual"><m-icon aria-hidden="true">+</m-icon>Explanation</div>'
    const trigger = document.getElementById("tip-trigger")!
    const panel = document.getElementById("tip")!
    const controller = createTooltip(trigger, panel)
    controllers.push(controller)
    expect(controller.connected).toBe(true)
    controller.disconnect()
    panel.querySelector("m-icon")!.append(document.createElement("input"))
    expect(() => createTooltip(trigger, panel)).toThrow("noninteractive")
  })

  it("allows icons in Dropdown labels but still rejects interactive descendants", () => {
    const root = new Dropdown()
    root.innerHTML = '<m-dropdown-trigger><button type="button"><m-icon aria-hidden="true">+</m-icon>Actions</button></m-dropdown-trigger><m-dropdown-menu label="Actions"><m-dropdown-item key="save"><button type="button"><m-icon aria-hidden="true">+</m-icon>Save</button></m-dropdown-item></m-dropdown-menu>'
    document.body.append(root)
    expect(root.items).toHaveLength(1)
    root.querySelector("m-dropdown-item m-icon")!.append(document.createElement("input"))
    expect(() => root.refresh()).toThrow()
  })
})

describe("Icon styling and distribution", () => {
  it("generates the direct API without a runtime metadata definition", () => {
    const docs = JSON.parse(readFileSync("demo\\api\\icon.json", "utf8"))
    expect(docs.elements.map((element: { type: string }) => element.type)).toEqual(["Icon", "IconWrapper"])
    expect(docs.elements[0].properties.size).toMatchObject({ attribute: "size", default: null, min: 0, exclusiveMin: true })
    expect(docs.elements[0].properties.depth).toMatchObject({ attribute: "depth", default: null, min: 1, max: 5, integer: true })
    expect(docs.elements[1].properties.size.default).toBeNull()
    expect(docs.elements[0].actions).toEqual([])
  })
  it("retains baseline, depth palettes, wrapper geometry and author style resources", () => {
    expect(css).toContain("display: inline-block")
    expect(css).toContain("position: relative")
    expect(css).toContain("font-size: var(--m-icon-size, 1em)")
    expect(css).not.toContain("font-style:")
    expect(css).not.toContain("vertical-align:")
    for (const [depth, light, dark] of [[1, ".82", ".9"], [2, ".72", ".82"], [3, ".38", ".52"], [4, ".24", ".38"], [5, ".18", ".28"]]) {
      expect(css).toContain(`m-icon[depth="${depth}"]`)
      expect(css).toContain(`var(--m-icon-depth-${depth}, var(--_m-icon-depth-${depth}, ${light}))`)
      expect(css).toContain(`--_m-icon-depth-${depth}: ${dark}`)
    }
    expect(css).toContain("var(--m-icon-wrapper-size, 24px)")
    expect(css).toContain("var(--m-icon-wrapper-radius, 6px)")
    expect(css).toContain("light-dark(#18a058, #63e2b7)")
    expect(css).toContain("m-icon[depth], m-icon-wrapper { transition: none; }")
    expect(css).toContain("m-icon-wrapper { border: 1px solid CanvasText; transition: none; }")
    expect(css).not.toContain("@keyframes")
    expect(css).not.toContain("pointer-events: none")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
  })

  it("delivers only core and Icon with explicit classic core requirements", () => {
    expect(packageJson.exports["./icon"]).toEqual({ types: "./dist/components/icon/index.d.ts", import: "./dist/markup-ui-icon.js" })
    expect(packageJson.exports["./icon/style.css"]).toBe("./dist/markup-ui-icon.css")
    const script = readFileSync("dist\\markup-ui-icon.global.js", "utf8")
    expect(() => runInContext(script, createContext({ HTMLElement }))).toThrow("Load compatible markup-ui-core.global.js")
    const entries = new Map<string, unknown>()
    const context = createContext({ HTMLElement, customElements: {
      get: (name: string) => entries.get(name),
      define: (name: string, type: unknown) => entries.set(name, type),
    } })
    runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
    runInContext(script, context)
    expect([...entries.keys()]).toEqual(["m-icon", "m-icon-wrapper"])
    expect(() => runInContext(script, context)).toThrow("already defined")
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    for (const [mode, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      const payload = manifest.componentPayloads.icon[mode]
      expect(payload.dependencies).toEqual([`markup-ui-core${suffix}`])
      expect(payload.gzipBytes).toBeLessThanOrEqual(3000)
      expect(payload.runtimeGzipBytes).toBeLessThanOrEqual(5000)
      expect(payload.totalGzipBytes).toBe(payload.runtimeGzipBytes + manifest.componentPayloads.icon.cssGzipBytes)
    }
    expect(manifest.componentPayloads.icon.cssGzipBytes).toBeLessThanOrEqual(1000)
  })
})
