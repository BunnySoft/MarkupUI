import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "typography", "typography.css"), "utf8")
const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let stylesheet: HTMLStyleElement | undefined

function install(): void {
  stylesheet = document.createElement("style")
  stylesheet.textContent = css
  document.head.append(stylesheet)
}
afterEach(() => { stylesheet?.remove(); stylesheet = undefined; document.body.replaceChildren() })

describe("CSS-only Typography", () => {
  it("ships only a stylesheet export, without a fake runtime or custom-element source", () => {
    expect(packageJson.exports["./typography/style.css"]).toBe("./dist/markup-ui-typography.css")
    expect(packageJson.exports["./typography"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "typography"))).toEqual(["typography.css"])
    expect(customElements.get("mui-typography")).toBeUndefined()
  })

  it("keeps native heading levels, paragraph/list/quote/code structure and contents", () => {
    document.body.innerHTML = '<article class="mui-typography"><h1>One</h1><h2>Two</h2><h3>Three</h3><h4>Four</h4><h5>Five</h5><h6>Six</h6><p><strong>Strong</strong> <em>Emphasis</em> <del>Deleted</del> <code>Code</code></p><ul><li>Item</li></ul><blockquote cite="#source">Quote</blockquote><hr></article>'
    const before = [...document.querySelectorAll("*")].filter((node) => document.body.contains(node))
    install()
    expect([...document.querySelectorAll("*")].filter((node) => document.body.contains(node))).toEqual(before)
    expect([...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((node) => node.tagName)).toEqual(["H1", "H2", "H3", "H4", "H5", "H6"])
    expect(document.querySelector("[role],[aria-level],[aria-live]")).toBeNull()
    expect(document.querySelector("blockquote")?.getAttribute("cite")).toBe("#source")
  })

  it("leaves out-of-scope native text and data attributes unstyled", () => {
    document.body.innerHTML = '<p id="outside"><span data-strong data-type="error">Outside</span></p><article class="mui-typography"><p>Inside</p></article>'
    const outside = document.querySelector("#outside span")!
    const before = { color: getComputedStyle(outside).color, weight: getComputedStyle(outside).fontWeight }
    install()
    expect(getComputedStyle(outside).color).toBe(before.color)
    expect(getComputedStyle(outside).fontWeight).toBe(before.weight)
  })

  it("preserves native anchor href/target/rel/download and authored SVG content", () => {
    document.body.innerHTML = '<article class="mui-typography"><a href="#destination" target="_blank" rel="noopener noreferrer" download="file" hreflang="en"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M0 0h10"></path></svg>Link</a></article>'
    const anchor = document.querySelector("a")!
    const svg = anchor.querySelector("svg")
    const before = anchor.outerHTML
    install()
    expect(anchor.outerHTML).toBe(before)
    expect(anchor.querySelector("svg")).toBe(svg)
    expect(anchor.getAttribute("href")).toBe("#destination")
    expect(anchor.target).toBe("_blank")
    expect(anchor.rel).toBe("noopener noreferrer")
    expect(anchor.download).toBe("file")
  })

  it("does not convert placeholder anchors into interactive controls", () => {
    document.body.innerHTML = '<article class="mui-typography"><a>Placeholder</a></article>'
    install()
    const anchor = document.querySelector("a")!
    expect(anchor.hasAttribute("href") || anchor.hasAttribute("role") || anchor.hasAttribute("tabindex")).toBe(false)
    expect(getComputedStyle(anchor).cursor).not.toBe("pointer")
  })

  it("keeps native ordered-list numbering attributes and marker semantics", () => {
    document.body.innerHTML = '<ol class="mui-ol" type="A" start="3" reversed><li value="7">Item</li></ol>'
    install()
    const list = document.querySelector("ol")!
    expect(list.type).toBe("A")
    expect(list.start).toBe(3)
    expect(list.reversed).toBe(true)
    expect(document.querySelector("li")?.value).toBe(7)
    expect(getComputedStyle(document.querySelector("li")!).display).toBe("list-item")
  })

  it("preserves document language/direction and native hidden state", () => {
    document.body.innerHTML = '<section class="mui-typography" lang="ar" dir="rtl"><h2 data-prefix="bar" data-align-text hidden>عنوان</h2><p>نص</p></section>'
    install()
    expect(document.querySelector("section")?.lang).toBe("ar")
    expect(document.querySelector("section")?.dir).toBe("rtl")
    expect(document.querySelector("h2")?.hidden).toBe(true)
    expect(getComputedStyle(document.querySelector("h2")!).display).toBe("none")
  })

  it("uses native code/deletion/emphasis instead of replacing tags from data flags", () => {
    document.body.innerHTML = '<article class="mui-typography"><span id="styled" data-strong data-italic data-underline>Style only</span><code><del>Old</del></code><em>Emphasis</em></article>'
    install()
    expect(document.querySelector("#styled")?.tagName).toBe("SPAN")
    expect(getComputedStyle(document.querySelector("#styled")!).fontStyle).toBe("italic")
    expect(getComputedStyle(document.querySelector("#styled")!).textDecorationLine).toBe("underline")
    expect(document.querySelector("code > del")?.textContent).toBe("Old")
    expect(document.querySelector("em")?.tagName).toBe("EM")
  })

  it("keeps native event listeners/selection targets and owns no animation or routing", () => {
    document.body.innerHTML = '<article class="mui-typography"><span id="text">Selectable</span><a href="#target">Native</a></article>'
    const text = document.querySelector("#text")!
    let events = 0
    text.addEventListener("click", () => events++)
    install()
    text.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(events).toBe(1)
    expect(getComputedStyle(text).userSelect).not.toBe("none")
    expect(css).not.toContain("@keyframes")
    expect(css).not.toContain("user-select: none")
    expect(document.querySelectorAll("script")).toHaveLength(0)
  })

  it("keeps block-code markup outside the inline-code presentation contract", () => {
    document.body.innerHTML = '<article class="mui-typography"><pre><code id="block">const value = 1</code></pre><code id="inline">value</code></article>'
    install()
    expect(document.querySelector("#block")?.parentElement?.tagName).toBe("PRE")
    expect(document.querySelector("#block")?.textContent).toBe("const value = 1")
    expect(css).toContain(":not(:where(pre code))")
  })

  it("keeps the source-only CSS within its unchanged 2500 gzip-byte budget", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(2500)
  })

  it("uses measured reference heading sizes, weights, paragraph and list spacing", () => {
    for (const [level, size] of [[1, 30], [2, 22], [3, 18], [4, 16], [5, 16], [6, 16]]) {
      expect(css).toContain(`var(--mui-typography-h${level}-size, ${size}px)`)
    }
    expect(css).toContain("var(--mui-typography-heading-weight, 500)")
    expect(css).toContain("var(--mui-typography-strong-weight, 500)")
    expect(css).toContain("var(--mui-typography-paragraph-margin, 16px)")
    expect(css).toContain("var(--mui-typography-list-indent, 2em)")
    expect(css).toContain("margin-block: .25em 0")
    expect(css).toContain("var(--mui-typography-font-size, var(--mui-font-size, 14px))")
  })

  it("sets only private defaults at light/dark theme boundaries and retains public override precedence", () => {
    install()
    const rules = [...stylesheet!.sheet!.cssRules] as CSSStyleRule[]
    for (const theme of ["light", "dark"]) {
      const rule = rules.find(rule => rule.selectorText === `:where([data-mui-theme="${theme}"])`)!
      expect(rule).toBeDefined()
      for (let i = 0; i < rule.style.length; i++) expect(rule.style[i]).toMatch(/^--_mui-typography-/)
    }
    expect(css).toContain("var(--mui-typography-color, var(--_mui-typography-color, #333639))")
    expect(css).toContain("var(--mui-typography-info, var(--mui-color-info, var(--_mui-typography-info, #2080f0)))")
    expect(css).toContain("--_mui-typography-color: rgb(255 255 255 / .82)")
    expect(css).toContain("--_mui-typography-heading: rgb(255 255 255 / .9)")
    expect(css).toContain("--_mui-typography-muted: rgb(255 255 255 / .52)")
    expect(css).not.toContain("--mui-text-primary")
    expect(css).not.toContain("-suppl")
  })

  it("colors a typed heading's bar, not its text, and preserves the explicit bar override", () => {
    install()
    const rules = [...stylesheet!.sheet!.cssRules] as CSSStyleRule[]
    const types = rules.filter(rule => rule.selectorText?.includes('.mui-h)[data-type='))
    expect(types).toHaveLength(4)
    for (const rule of types) {
      expect(rule.style.getPropertyValue("color")).toBe("")
      expect(rule.style.getPropertyValue("--_mui-typography-accent")).not.toBe("")
    }
    expect(css).toContain("background: var(--mui-typography-bar-color, var(--_mui-typography-accent,")
    expect(css).toContain("--_mui-typography-prefix: 16px; --_mui-typography-bar: 4px")
    expect(css).toContain("inset-block: 0")
  })

  it("matches inline-code metrics without revealing hidden code or changing block code", () => {
    document.body.innerHTML = '<article class="mui-typography"><code id="hidden" hidden>Hidden</code><code id="inline">Visible</code><pre><code id="block">Block</code></pre></article>'
    install()
    expect(getComputedStyle(document.querySelector("#hidden")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#inline")!).display).toBe("inline-block")
    expect(css).toContain(':where(code:not([hidden])):not(:where(pre code))')
    expect(css).toContain("v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace")
    expect(css).toContain("line-height: 1.4")
    expect(css).toContain("padding: .05em .35em 0")
    expect(css).toContain("var(--mui-typography-code-border, transparent)")
    expect(css).toContain("var(--mui-typography-code-radius, 2px)")
  })

  it("keeps first/last block spacing rules scoped, last in the cascade and overridable", () => {
    install()
    const rules = [...stylesheet!.sheet!.cssRules] as CSSStyleRule[]
    expect(rules.at(-2)!.selectorText).toContain(":where(:first-child)")
    expect(rules.at(-1)!.selectorText).toContain(":where(:last-child)")
    expect(rules.at(-2)!.style.getPropertyValue("margin-block-start")).toBe("0")
    expect(rules.at(-1)!.style.getPropertyValue("margin-block-end")).toBe("0")
    document.body.innerHTML = '<article class="mui-typography"><h1 style="font-size:41px;color:purple;margin-block-start:11px">Title</h1></article>'
    expect(getComputedStyle(document.querySelector("h1")!).fontSize).toBe("41px")
    expect(getComputedStyle(document.querySelector("h1")!).color).toBe("rgb(128, 0, 128)")
  })
})
