import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
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
})
