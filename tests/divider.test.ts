import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "divider", "divider.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "divider.html"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
const fixtureHtml = `
  <hr class="mui-divider" id="thematic">
  <hr class="mui-divider" data-dashed aria-label="End of introduction" id="dashed">
  <span class="mui-divider custom-rule" aria-hidden="true" id="decorative"></span>
  <div class="mui-divider mui-divider-captioned" role="separator" aria-labelledby="settings-label" id="named">
    <span class="mui-divider-label" id="settings-label" aria-hidden="true">Settings</span>
  </div>
  <div class="mui-divider mui-divider-captioned" data-placement="left" role="separator" aria-labelledby="left-label" id="left">
    <span class="mui-divider-label" id="left-label" aria-hidden="true">Left label</span>
  </div>
  <div class="mui-divider mui-divider-captioned" data-placement="right" data-dashed role="separator" aria-labelledby="right-label" id="right">
    <span class="mui-divider-label" id="right-label" aria-hidden="true">Right label</span>
  </div>
  <div class="mui-divider mui-divider-captioned narrow" role="separator" aria-labelledby="long-label" id="long">
    <span class="mui-divider-label" id="long-label" aria-hidden="true">AnOriginalLongUnbrokenCaptionThatWrapsWithoutClippingOrReplacingAnyOfItsText</span>
  </div>
  <div class="mui-divider mui-divider-captioned" data-placement="start" id="heading-decoration">
    <h2 class="mui-divider-label" id="real-heading">A real native heading with decorative rules</h2>
  </div>
  <div class="actions">
    <a href="#destination" id="first-action">First action</a>
    <span class="mui-divider" role="separator" aria-orientation="vertical" aria-label="Action groups" id="vertical"></span>
    <a href="#destination" id="second-action">Second action</a>
    <span class="mui-divider tall" data-dashed data-orientation="vertical" aria-hidden="true" id="vertical-decorative"></span>
  </div>
  <section dir="rtl">
    <div class="mui-divider mui-divider-captioned" data-placement="start" role="separator" aria-labelledby="rtl-start-label">
      <span class="mui-divider-label" id="rtl-start-label" aria-hidden="true">Start</span>
    </div>
    <div class="mui-divider mui-divider-captioned" data-placement="left" role="separator" aria-labelledby="rtl-left-label">
      <span class="mui-divider-label" id="rtl-left-label" aria-hidden="true">Left</span>
    </div>
  </section>
  <hr id="outside">`
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
function fixture(): void { document.body.innerHTML = fixtureHtml }
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("CSS-only native Divider", () => {
  it("exports only CSS and has no runtime, synthetic registration or asset dependency", () => {
    expect(pkg.exports["./divider/style.css"]).toBe("./dist/markup-ui-divider.css")
    expect(pkg.exports["./divider"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "divider"))).toEqual(["divider.css"])
    expect(demo).not.toContain("markup-ui-divider.js")
    expect(demo).toContain('src="../example-code.js"')
    expect(customElements.get("mui-divider")).toBeUndefined()
  })

  it("keeps native thematic hr semantics and never nests captions in a void element", () => {
    fixture()
    const hr = document.querySelector("#thematic")!
    const before = hr.outerHTML
    install()
    expect(hr.tagName).toBe("HR")
    expect(hr.outerHTML).toBe(before)
    expect(hr.childNodes).toHaveLength(0)
    expect(document.querySelectorAll("hr > *")).toHaveLength(0)
    expect(document.querySelector("#dashed")?.getAttribute("aria-label")).toBe("End of introduction")
  })

  it("has one author-selected owner for a named separator without a duplicate label string", () => {
    fixture()
    const separator = document.querySelector("#named")!
    const caption = document.querySelector("#settings-label")!
    install()
    expect(separator.getAttribute("role")).toBe("separator")
    expect(separator.getAttribute("aria-labelledby")).toBe(caption.id)
    expect(caption.getAttribute("aria-hidden")).toBe("true")
    expect(caption.textContent).toBe("Settings")
    expect(separator.querySelectorAll(".mui-divider-label")).toHaveLength(1)
    expect(separator.hasAttribute("aria-label")).toBe(false)
    expect(caption.getAttribute("hidden")).toBeNull()
  })

  it("keeps a real heading outside separator/presentational semantics", () => {
    fixture()
    const heading = document.querySelector("#real-heading")!
    const wrapper = document.querySelector("#heading-decoration")!
    const before = heading.outerHTML
    install()
    expect(heading.tagName).toBe("H2")
    expect(heading.outerHTML).toBe(before)
    expect(wrapper.hasAttribute("role")).toBe(false)
    expect(heading.closest("[aria-hidden],[role=separator]")).toBeNull()
    expect(document.querySelector("[aria-level],[aria-live]")).toBeNull()
  })

  it("uses semantic aria orientation for geometry and restricts decorative data orientation to hidden content", () => {
    fixture()
    const semantic = document.querySelector("#vertical")!
    const decorative = document.querySelector("#vertical-decorative")!
    install()
    expect(semantic.getAttribute("aria-orientation")).toBe("vertical")
    expect(semantic.getAttribute("role")).toBe("separator")
    expect(decorative.getAttribute("data-orientation")).toBe("vertical")
    expect(decorative.getAttribute("aria-hidden")).toBe("true")
    expect(css).toContain('.mui-divider:is([aria-orientation="vertical"]')
    expect(css).toContain('[aria-hidden="true"][data-orientation="vertical"]:not([aria-orientation])')
    expect(css).not.toContain('.mui-divider[vertical]')
  })

  it("preserves authored decorative visibility, native actions and tab order", () => {
    fixture()
    const before = document.querySelector(".actions")!.outerHTML
    const link = document.querySelector<HTMLAnchorElement>("#first-action")!
    let clicks = 0
    link.addEventListener("click", (event) => { event.preventDefault(); clicks++ })
    install()
    link.click()
    expect(clicks).toBe(1)
    expect(document.querySelector(".actions")!.outerHTML).toBe(before)
    expect(document.querySelector("#decorative")?.getAttribute("aria-hidden")).toBe("true")
    expect(document.querySelectorAll(".mui-divider[tabindex]")).toHaveLength(0)
    expect(document.querySelectorAll(".mui-divider button,.mui-divider a")).toHaveLength(0)
  })

  it("keeps original caption nodes, listeners and later content without a lifecycle", () => {
    fixture()
    const separator = document.querySelector("#named")!
    const caption = separator.firstElementChild!
    let events = 0
    separator.addEventListener("example", () => events++)
    install()
    caption.textContent = "Authored replacement"
    separator.remove()
    document.body.append(separator)
    separator.dispatchEvent(new Event("example"))
    expect(separator.firstElementChild).toBe(caption)
    expect(caption.textContent).toBe("Authored replacement")
    expect(events).toBe(1)
  })

  it("keeps hidden dividers and native templates inert despite flex/block styles", () => {
    document.body.innerHTML = '<hr class="mui-divider" hidden><div class="mui-divider mui-divider-captioned" hidden><span class="mui-divider-label">Hidden</span></div><template class="mui-divider"><span>Inert</span></template>'
    install()
    for (const node of document.querySelectorAll("[hidden],template")) expect(getComputedStyle(node).display).toBe("none")
    expect(document.querySelector("template")?.content.textContent).toBe("Inert")
    expect(document.body.textContent).not.toContain("Inert")
  })

  it("supports wrapped labels and physical/logical positions without changing direction or global hr", () => {
    fixture()
    const outside = document.querySelector("#outside")!
    const before = { display: getComputedStyle(outside).display, margin: getComputedStyle(outside).margin, border: getComputedStyle(outside).borderTopStyle }
    install()
    expect({ display: getComputedStyle(outside).display, margin: getComputedStyle(outside).margin, border: getComputedStyle(outside).borderTopStyle }).toEqual(before)
    expect(document.querySelector("section[dir]")?.getAttribute("dir")).toBe("rtl")
    expect(css).toContain('[data-placement="left"]:dir(rtl)')
    expect(css).toContain('[data-placement="start"]')
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).not.toContain("white-space: nowrap")
    expect(css).not.toContain("overflow: hidden")
    expect(css).not.toContain("direction:")
  })

  it("uses printable borders and system colors without animation or generated label text", () => {
    expect(css).toContain("border-block-start:")
    expect(css).toContain("border-inline-start:")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("--mui-divider-color: CanvasText")
    expect(css).not.toContain("background:")
    expect(css).not.toContain("forced-color-adjust: none")
    expect(css).not.toContain("@keyframes")
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("attr(")
    expect(css).not.toContain("url(")
  })

  it("keeps vertical orientation authoritative without hiding an authored caption", () => {
    document.body.innerHTML = '<div class="mui-divider mui-divider-captioned" role="separator" aria-orientation="vertical" aria-labelledby="caption"><span class="mui-divider-label" id="caption" aria-hidden="true">Original caption</span></div>'
    const separator = document.querySelector(".mui-divider")!
    const caption = separator.firstElementChild
    install()
    expect(getComputedStyle(separator).display).toBe("inline-flex")
    expect(getComputedStyle(separator).inlineSize).toBe("auto")
    expect(separator.firstElementChild).toBe(caption)
    expect(caption?.textContent).toBe("Original caption")
    expect(separator.getAttribute("aria-orientation")).toBe("vertical")
  })

  it("keeps source CSS within the unchanged 1500 gzip-byte budget", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1500)
  })

  it("defines only private theme defaults and preserves local color override precedence", () => {
    install()
    const rules = [...style!.sheet!.cssRules] as CSSStyleRule[]
    for (const theme of ["light", "dark"]) {
      const rule = rules.find(rule => rule.selectorText === `:where([data-mui-theme="${theme}"])`)!
      expect(rule).toBeDefined()
      for (let i = 0; i < rule.style.length; i++) expect(rule.style[i]).toMatch(/^--_mui-divider-/)
    }
    expect(css).toContain("var(--mui-divider-color, var(--_mui-divider-color, #efeff5))")
    expect(css).toContain("var(--mui-divider-text-color, var(--_mui-divider-text-color, #1f2225))")
    expect(css).toContain("--_mui-divider-color: rgb(255 255 255 / .09)")
    expect(css).toContain("--_mui-divider-text-color: rgb(255 255 255 / .9)")
    expect(css).not.toContain("--mui-border")
    expect(css).not.toContain("--mui-text-primary")
  })

  it("uses reference 16px divider sizing, 500 caption weight and root-independent spacing", () => {
    expect(css).toContain("font-size: 16px")
    expect(css).toContain("var(--mui-divider-label-size, 16px)")
    expect(css).toContain("var(--mui-divider-label-weight, 500)")
    expect(css).toContain("var(--mui-divider-space, 24px)")
    expect(css).toContain("var(--mui-divider-inline-space, 8px)")
    expect(css).toContain("var(--mui-divider-label-gap, 12px)")
    expect(css).toContain("var(--mui-font-family, inherit)")
  })

  it("lets edge rules shrink like the reference while bounding a wrappable caption", () => {
    expect(css).toContain("flex: 1 1 100%")
    expect(css).toContain("flex: 0 1 var(--mui-divider-edge, 28px)")
    expect(css).toContain("flex: 0 0 auto")
    expect(css).toContain("max(0px, calc(100% - 2 * (var(--mui-divider-label-gap, 12px) + var(--mui-divider-rule-min, 1rem))))")
    expect(css).toContain("--_mui-divider-label-max: 100%")
    expect(css).toContain("overflow-wrap: anywhere")
  })

  it("does not overwrite authored divider or caption declarations", () => {
    document.body.innerHTML = '<div class="mui-divider mui-divider-captioned" style="color:purple;margin-block:31px"><span class="mui-divider-label" style="font-size:21px;font-weight:800">Author</span></div>'
    const divider = document.querySelector(".mui-divider")!
    const caption = divider.firstElementChild!
    const before = divider.outerHTML
    install()
    expect(divider.outerHTML).toBe(before)
    expect(getComputedStyle(divider).color).toBe("rgb(128, 0, 128)")
    expect(getComputedStyle(caption).fontSize).toBe("21px")
    expect(getComputedStyle(caption).fontWeight).toBe("800")
  })
})
