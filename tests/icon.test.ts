import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "icon", "icon.css"), "utf8")
const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let stylesheet: HTMLStyleElement | undefined
function install(): void {
  stylesheet = document.createElement("style")
  stylesheet.textContent = css
  document.head.append(stylesheet)
}
afterEach(() => { stylesheet?.remove(); stylesheet = undefined; document.body.replaceChildren() })

describe("CSS-only Icon and IconWrapper", () => {
  it("exports only CSS with no fake runtime or icon library", () => {
    expect(packageJson.exports["./icon/style.css"]).toBe("./dist/markup-ui-icon.css")
    expect(packageJson.exports["./icon"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "icon"))).toEqual(["icon.css"])
    expect(customElements.get("mui-icon")).toBeUndefined()
    expect(customElements.get("mui-icon-wrapper")).toBeUndefined()
  })

  it("preserves SVG namespaces, viewports, titles, descriptions and paint attributes", () => {
    document.body.innerHTML = '<svg class="mui-icon" role="img" aria-labelledby="title desc" viewBox="0 0 40 20" preserveAspectRatio="xMidYMid meet"><title id="title">Native artwork</title><desc id="desc">Description</desc><path d="M0 0h20" fill="none" stroke="#123456" stroke-width="2"></path><circle cx="20" cy="10" r="5" fill="red"></circle></svg>'
    const svg = document.querySelector("svg")!
    const before = svg.outerHTML
    const path = svg.querySelector("path")
    install()
    expect(svg.outerHTML).toBe(before)
    expect(svg.querySelector("path")).toBe(path)
    expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMid meet")
  })

  it("does not contain blanket fill/stroke or nested-SVG resets", () => {
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:fill|stroke|stroke-width)\s*:/m)
    expect(css).not.toMatch(/\.mui-icon\s+svg/)
    document.body.innerHTML = '<svg class="mui-icon" viewBox="0 0 40 40"><svg width="12" height="6" viewBox="0 0 12 6"><rect width="12" height="6" fill="blue"></rect></svg></svg>'
    const nested = document.querySelector("svg svg")!
    const before = nested.outerHTML
    install()
    expect(nested.outerHTML).toBe(before)
    expect(nested.getAttribute("width")).toBe("12")
    expect(nested.getAttribute("height")).toBe("6")
  })

  it("preserves standalone and decorative naming without creating duplicate roles", () => {
    document.body.innerHTML = '<span class="mui-icon" aria-hidden="true">+</span><svg class="mui-icon" role="img" aria-label="Meaningful" viewBox="0 0 10 10"></svg>'
    install()
    expect(document.querySelectorAll("[role=img]")).toHaveLength(1)
    expect(document.querySelector("span")?.getAttribute("aria-hidden")).toBe("true")
    expect(document.querySelectorAll("[aria-label]")).toHaveLength(1)
    expect(document.querySelector("[aria-live],[tabindex]")).toBeNull()
  })

  it("keeps native button/link attributes, event listeners and keyboard defaults", () => {
    document.body.innerHTML = '<button type="button" aria-label="Save"><span class="mui-icon" aria-hidden="true">✓</span></button><a class="mui-icon-wrapper" href="#next" target="_blank" rel="noopener" aria-label="Next"><span class="mui-icon" aria-hidden="true">→</span></a>'
    const button = document.querySelector("button")!
    const anchor = document.querySelector("a")!
    const before = anchor.outerHTML
    let clicks = 0
    button.addEventListener("click", () => clicks++)
    install()
    button.click()
    expect(clicks).toBe(1)
    expect(anchor.outerHTML).toBe(before)
    expect(button.type).toBe("button")
    const key = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
    anchor.dispatchEvent(key)
    expect(key.defaultPrevented).toBe(false)
  })

  it("does not change unclassified SVG or document direction/language", () => {
    document.body.innerHTML = '<div dir="rtl" lang="ar"><svg id="outside" width="70" height="30" viewBox="0 0 70 30"><rect fill="#556677"></rect></svg><span class="mui-icon">◇</span></div>'
    const outside = document.querySelector("#outside")!
    const before = outside.outerHTML
    install()
    expect(outside.outerHTML).toBe(before)
    expect(document.querySelector("div")?.dir).toBe("rtl")
    expect(document.querySelector("div")?.lang).toBe("ar")
  })

  it("keeps native image source/alt/intrinsic attributes and hidden states", () => {
    document.body.innerHTML = '<span class="mui-icon" hidden><img src="original.svg" alt="" width="40" height="20"></span><span class="mui-icon-wrapper" hidden>Hidden</span>'
    const image = document.querySelector("img")!
    const before = image.outerHTML
    install()
    expect(image.outerHTML).toBe(before)
    expect(getComputedStyle(document.querySelector(".mui-icon")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector(".mui-icon-wrapper")!).display).toBe("none")
  })

  it("defines depth and forced-color fallback without animation or disabled-control emulation", () => {
    document.body.innerHTML = '<span class="mui-icon" data-depth="5">◇</span>'
    install()
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).not.toContain("forced-color-adjust")
    expect(css).not.toContain("@keyframes")
    expect(css).not.toContain("pointer-events: none")
    expect(document.querySelector(".mui-icon")?.hasAttribute("role")).toBe(false)
  })
})
