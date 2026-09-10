import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "flex", "flex.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "flex.html"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
function fixture(): void { document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>")) }
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("CSS-only native Flex", () => {
  it("ships only CSS without a renderer, size parser or synthetic Custom Element", () => {
    expect(pkg.exports["./flex/style.css"]).toBe("./dist/markup-ui-flex.css")
    expect(pkg.exports["./flex"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "flex"))).toEqual(["flex.css"])
    expect(customElements.get("mui-flex")).toBeUndefined()
    expect(demo).not.toContain("<script")
  })

  it("preserves exact original children, text, native attributes and order", () => {
    document.body.innerHTML = '<section class="mui-flex" aria-labelledby="heading"><h2 id="heading">Original heading</h2> Original text <p><em>Native emphasis</em></p><!-- authored comment --></section>'
    const root = document.querySelector("section")!
    const nodes = [...root.childNodes]
    const before = root.outerHTML
    install()
    expect(root.outerHTML).toBe(before)
    expect([...root.childNodes]).toEqual(nodes)
    expect(document.querySelector("[role],[tabindex],[aria-live]")).toBeNull()
  })

  it("defines the pinned row/column spacing presets independently on each nested container", () => {
    fixture()
    install()
    const gap = (id: string) => {
      const s = getComputedStyle(document.getElementById(id)!)
      return [s.getPropertyValue("--_mui-flex-row-gap").trim(), s.getPropertyValue("--_mui-flex-column-gap").trim()]
    }
    expect(gap("small")).toEqual(["4px", "8px"])
    expect(gap("medium")).toEqual(["8px", "12px"])
    expect(gap("large")).toEqual(["12px", "16px"])
    expect(gap("nested-small")).toEqual(["4px", "8px"])
    expect(gap("nested-medium")).toEqual(["8px", "12px"])
  })

  it("uses explicit CSS row and column gaps instead of swapping a tuple in vertical mode", () => {
    expect(css).toContain("row-gap: var(--mui-flex-row-gap")
    expect(css).toContain("column-gap: var(--mui-flex-column-gap")
    expect(css).not.toContain("margin:")
    expect(css).not.toContain("padding:")
    expect(css).not.toContain("attr(")
    expect(css).not.toContain("@supports")
  })

  it("retains row wrapping by default, explicit nowrap, vertical nowrap and inline-flex", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#medium")!).flexDirection).toBe("row")
    expect(getComputedStyle(document.querySelector("#medium")!).flexWrap).toBe("wrap")
    expect(getComputedStyle(document.querySelector("#no-wrap")!).flexWrap).toBe("nowrap")
    expect(getComputedStyle(document.querySelector("#vertical")!).flexDirection).toBe("column")
    expect(getComputedStyle(document.querySelector("#vertical")!).flexWrap).toBe("nowrap")
    expect(getComputedStyle(document.querySelector("#inline")!).display).toBe("inline-flex")
  })

  it("preserves real ordered-list semantics, markers and native link behavior", () => {
    fixture()
    const list = document.querySelector<HTMLOListElement>("#native-list")!
    const first = list.querySelector("li")!
    const before = list.outerHTML
    let clicks = 0
    list.querySelector("a")!.addEventListener("click", (event) => { event.preventDefault(); clicks++ })
    install()
    list.querySelector("a")!.click()
    expect(clicks).toBe(1)
    expect(list.outerHTML).toBe(before)
    expect(list.start).toBe(3)
    expect(list.type).toBe("A")
    expect(getComputedStyle(first).display).toBe("list-item")
    expect(css).not.toContain("list-style")
  })

  it("retains native form submit, reset, disabled controls and authored types", () => {
    fixture()
    const form = document.querySelector("form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", (event) => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabledClicks++)
    install()
    input.value = "Edited"
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    expect(input.value).toBe("Original")
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(submits).toBe(1)
    expect(disabledClicks).toBe(0)
    expect(form.getAttribute("method")).toBe("get")
  })

  it("keeps hidden roots/items and native templates out of the layout", () => {
    fixture()
    install()
    for (const node of document.querySelectorAll("#hidden-root,#hidden-item,#native-template")) expect(getComputedStyle(node).display).toBe("none")
    expect(document.querySelector("template")?.content.textContent).toBe("Application-owned inert template")
    expect(document.querySelectorAll("template > span")).toHaveLength(0)
    expect(document.querySelector("#hidden-root")?.hasAttribute("hidden")).toBe(true)
  })

  it("does not remove empty containers, late children or original listeners on reconnect", () => {
    document.body.innerHTML = '<div class="mui-flex" id="empty"></div>'
    const root = document.querySelector("#empty")!
    install()
    expect(root.isConnected).toBe(true)
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = "Late native action"
    let clicks = 0
    button.addEventListener("click", () => clicks++)
    root.append(button)
    root.remove()
    document.body.append(root)
    button.click()
    expect(root.firstChild).toBe(button)
    expect(clicks).toBe(1)
    expect(document.querySelectorAll("#empty > *")).toHaveLength(1)
  })

  it("preserves native direction and reading order without reverse/order styling", () => {
    fixture()
    const first = document.querySelector("#rtl-first")!
    install()
    expect(document.querySelector("#rtl")?.firstElementChild).toBe(first)
    expect(document.querySelector("section[dir]")?.getAttribute("dir")).toBe("rtl")
    expect(document.querySelector("section[lang]")?.getAttribute("lang")).toBe("ar")
    expect(css).not.toContain("reverse")
    expect(css).not.toMatch(/(?:^|[;{])\s*order:/m)
    expect(css).not.toMatch(/(?:^|[;{])\s*direction:/m)
  })

  it("limits sizing to the container/direct children without typography or global resets", () => {
    fixture()
    const outside = document.querySelector("#outside")!
    const before = { display: getComputedStyle(outside).display, wrap: getComputedStyle(outside).overflowWrap }
    install()
    expect({ display: getComputedStyle(outside).display, wrap: getComputedStyle(outside).overflowWrap }).toEqual(before)
    expect(css).toContain(".mui-flex > * { min-inline-size: 0; }")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).not.toContain("font")
    expect(css).not.toContain("overflow: hidden")
    expect(css).not.toMatch(/(?:^|[;{])\s*content:/m)
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("@keyframes")
  })

  it("keeps the strict source-only budget and remains theme-neutral", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
    expect(css).not.toContain("data-mui-theme")
    expect(css).not.toContain("--mui-color")
    expect(css).not.toContain("--mui-font")
    expect(css).not.toContain("--mui-text")
  })

  it("matches Naive's native start default and lets author tokens outrank every preset", () => {
    install()
    const rules = [...style!.sheet!.cssRules] as CSSStyleRule[]
    const root = rules.find(rule => rule.selectorText === ".mui-flex")!
    expect(root.style.getPropertyValue("justify-content")).toBe("var(--mui-flex-justify, start)")
    expect(root.style.getPropertyValue("align-items")).toBe("var(--mui-flex-align, normal)")
    expect(root.style.getPropertyValue("row-gap")).toBe("var(--mui-flex-row-gap, var(--_mui-flex-row-gap))")
    expect(root.style.getPropertyValue("column-gap")).toBe("var(--mui-flex-column-gap, var(--_mui-flex-column-gap))")
    for (const rule of rules.filter(rule => rule.selectorText?.includes("data-size"))) {
      for (let i = 0; i < rule.style.length; i++) expect(rule.style[i]).toMatch(/^--_mui-flex-/)
    }
  })

  it("preserves authored intrinsic minima and native layout declarations", () => {
    document.body.innerHTML = '<div class="mui-flex" data-wrap="false" style="gap:5px 7px;align-items:center;justify-content:space-evenly"><section style="min-inline-size:auto">Intrinsic native group</section></div>'
    const root = document.querySelector(".mui-flex")!
    const item = root.firstElementChild!
    const before = root.outerHTML
    install()
    expect(root.outerHTML).toBe(before)
    expect(getComputedStyle(root).gap).toBe("5px 7px")
    expect(getComputedStyle(root).alignItems).toBe("center")
    expect(getComputedStyle(root).justifyContent).toBe("space-evenly")
    expect(getComputedStyle(item).minInlineSize).toBe("auto")
  })

  it("retains bounded direct-child sizing without adding wrappers or coercing direction", () => {
    install()
    const rules = [...style!.sheet!.cssRules] as CSSStyleRule[]
    const child = rules.find(rule => rule.selectorText === ".mui-flex > *")!
    expect(child.style.getPropertyValue("min-inline-size")).toBe("0")
    expect(child.style.getPropertyValue("display")).toBe("")
    expect(child.style.getPropertyValue("box-sizing")).toBe("")
    expect(child.style.getPropertyValue("flex-shrink")).toBe("")
    expect(css).not.toContain("[dir")
    expect(css).not.toContain("::before")
    expect(css).not.toContain("::after")
  })
})
