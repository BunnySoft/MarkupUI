import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "divider", "divider.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "divider.html"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
function fixture(): void { document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>")) }
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("CSS-only native Divider", () => {
  it("exports only CSS and has no runtime, synthetic registration or asset dependency", () => {
    expect(pkg.exports["./divider/style.css"]).toBe("./dist/markup-ui-divider.css")
    expect(pkg.exports["./divider"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "divider"))).toEqual(["divider.css"])
    expect(demo).not.toContain("<script")
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
})
