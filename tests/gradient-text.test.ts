import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "gradient-text", "gradient-text.css"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("CSS-only Gradient Text", () => {
  it("exports only CSS without any gradient object or Custom Element runtime", () => {
    expect(pkg.exports["./gradient-text/style.css"]).toBe("./dist/markup-ui-gradient-text.css")
    expect(pkg.exports["./gradient-text"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "gradient-text"))).toEqual(["gradient-text.css"])
    expect(customElements.get("mui-gradient-text")).toBeUndefined()
  })

  it("preserves native semantic elements, text and inline content", () => {
    document.body.innerHTML = '<h1 class="mui-gradient-text" lang="en">Heading <strong>Strong</strong> <em>Emphasis</em></h1><p><span class="mui-gradient-text">Original text</span></p>'
    const heading = document.querySelector("h1")!
    const before = heading.outerHTML
    const strong = heading.querySelector("strong")
    install()
    expect(heading.outerHTML).toBe(before)
    expect(heading.querySelector("strong")).toBe(strong)
    expect(document.querySelector("[role],[aria-hidden],[aria-live],[aria-level]")).toBeNull()
    expect(heading.lang).toBe("en")
  })

  it("keeps a foreground fallback outside feature detection and a clipped solid underpaint inside it", () => {
    const base = css.slice(0, css.indexOf("@supports"))
    expect(base).toContain("color: var(--mui-gradient-text-fallback")
    expect(base).toContain("-webkit-text-fill-color: currentColor")
    expect(base).not.toContain("-webkit-text-fill-color: transparent")
    expect(css).toContain("@supports ((background-clip: text)")
    expect(css).toContain("background-color: currentColor")
    expect(css).not.toMatch(/(?:^|[;{])\s*color:\s*transparent/m)
  })

  it("has explicit print/forced-color foreground restoration without disabling system color preferences", () => {
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("background: none !important")
    expect(css).toContain("-webkit-text-fill-color: currentColor !important")
    expect(css).toContain("color: #000 !important")
    expect(css).toContain("color: CanvasText !important")
    expect(css).not.toContain("forced-color-adjust: none")
  })

  it("preserves native font size, selection and direction while establishing an enhanced paint box", () => {
    document.body.innerHTML = '<section dir="rtl" lang="ar"><h2 class="mui-gradient-text">عنوان</h2></section><p id="outside">Outside</p>'
    const heading = document.querySelector("h2")!
    const before = { size: getComputedStyle(heading).fontSize, outside: getComputedStyle(document.querySelector("#outside")!).color }
    install()
    expect(getComputedStyle(heading).fontSize).toBe(before.size)
    expect(heading.tagName).toBe("H2")
    expect(css.slice(css.indexOf("@supports"))).toContain("display: inline-block")
    expect(css).not.toContain("font-size:")
    expect(getComputedStyle(document.querySelector("#outside")!).color).toBe(before.outside)
    expect(document.querySelector("section")?.dir).toBe("rtl")
    expect(document.querySelector("section")?.lang).toBe("ar")
    expect(css).not.toContain("white-space: nowrap")
    expect(css).not.toContain("user-select: none")
  })

  it("matches theme endpoint roles and retains surface-aware light compositing", () => {
    document.body.innerHTML = '<span class="mui-gradient-text" data-mui-theme="dark">Text</span>'
    install()
    const theme = getComputedStyle(document.querySelector("span")!)
    for (const [type, from, to] of [
      ["primary", "#63e2b7", "#2a947d"], ["success", "#63e2b7", "#2a947d"],
      ["info", "#70c0e8", "#3889c5"], ["warning", "#f2c97d", "#f08a00"],
      ["error", "#e88080", "#d03a52"],
    ]) {
      expect(theme.getPropertyValue(`--_mui-gradient-${type}-start`)).toBe(from)
      expect(theme.getPropertyValue(`--_mui-gradient-${type}-end`)).toBe(to)
    }
    expect(css).toContain("font-weight: var(--mui-gradient-text-weight, 500)")
    expect(css).toContain("var(--_mui-gradient-color) 60%, var(--mui-gradient-text-surface, #fff)")
    expect(css).toContain("252deg) in srgb")
    expect(css).not.toContain("@property")
  })

  it("keeps native link attributes and listeners instead of intercepting activation", () => {
    document.body.innerHTML = '<a class="mui-gradient-text" href="#target" target="_blank" rel="noopener">Native link</a>'
    const link = document.querySelector("a")!
    const before = link.outerHTML
    let clicks = 0
    link.addEventListener("click", (event) => { event.preventDefault(); clicks++ })
    install()
    link.click()
    expect(link.outerHTML).toBe(before)
    expect(clicks).toBe(1)
    expect(link.getAttribute("href")).toBe("#target")
    expect(css).not.toContain("outline: none")
  })

  it("restores descendant text fill and preserves nested native content", () => {
    document.body.innerHTML = '<span class="mui-gradient-text">Parent <code>Code</code><a href="#target">Link</a></span>'
    const code = document.querySelector("code")!
    install()
    expect(document.querySelector("code")).toBe(code)
    expect(css).toContain(".mui-gradient-text :not(.mui-gradient-text)")
    expect(css).toContain("::selection")
    expect(document.querySelector("script")).toBeNull()
  })

  it("uses no animation, image asset loader or generated duplicate text", () => {
    expect(css).not.toContain("@keyframes")
    expect(css).not.toContain("url(")
    expect(css).not.toContain("content:")
    expect(css).toContain('data-type="danger"')
  })
})
