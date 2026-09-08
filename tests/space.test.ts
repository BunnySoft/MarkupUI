import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "space", "space.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "space.html"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
function fixture(): void { document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>")) }
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("CSS-only native Space", () => {
  it("exports only independent CSS with no Flex import, runtime or gap detector", () => {
    expect(pkg.exports["./space/style.css"]).toBe("./dist/markup-ui-space.css")
    expect(pkg.exports["./space"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "space"))).toEqual(["space.css"])
    expect(customElements.get("mui-space")).toBeUndefined()
    expect(css).not.toContain("@import")
    expect(css).not.toContain(".mui-flex")
    expect(demo).not.toContain("<script")
  })

  it("preserves authored groups, mixed text/element/comment nodes and unwrapped children", () => {
    fixture()
    const group = document.querySelector("#authored-items")!
    const before = group.outerHTML
    const nodes = [...group.querySelectorAll("*")]
    const raw = document.querySelector("#unwrapped")!
    raw.append(document.createComment("Original comment"))
    const rawNodes = [...raw.childNodes]
    install()
    expect(group.outerHTML).toBe(before)
    expect([...group.querySelectorAll("*")]).toEqual(nodes)
    expect([...raw.childNodes]).toEqual(rawNodes)
    expect(raw.textContent).toContain("Bare native text")
    expect(raw.querySelector(".mui-space-item")).toBeNull()
    expect(document.querySelector(".mui-space[role]")).toBeNull()
  })

  it("makes item styling an actual authored box/class without parsing item-style or wrap-item", () => {
    document.body.innerHTML = '<div class="mui-space" wrap-item="false" item-class="ignored" item-style="ignored"><span class="mui-space-item authored" style="color: red">Actual item</span><button type="button">Direct action</button></div>'
    const root = document.querySelector(".mui-space")!
    const item = root.firstElementChild!
    const before = root.outerHTML
    install()
    expect(root.outerHTML).toBe(before)
    expect(getComputedStyle(item).boxSizing).toBe("border-box")
    expect(getComputedStyle(item).maxInlineSize).toBe("100%")
    expect(item.className).toBe("mui-space-item authored")
    expect(item.getAttribute("style")).toBe("color: red")
    expect(root.querySelector(".ignored")).toBeNull()
  })

  it("retains exact presets, independent nested defaults and explicit row/column tokens", () => {
    fixture()
    install()
    const gap = (id: string) => {
      const s = getComputedStyle(document.getElementById(id)!)
      return [s.getPropertyValue("--_mui-space-row-gap").trim(), s.getPropertyValue("--_mui-space-column-gap").trim()]
    }
    expect(gap("small")).toEqual(["4px", "8px"])
    expect(gap("medium")).toEqual(["8px", "12px"])
    expect(gap("large")).toEqual(["12px", "16px"])
    expect(gap("nested-small")).toEqual(["4px", "8px"])
    expect(gap("nested-medium")).toEqual(["8px", "12px"])
    expect(css).toContain("row-gap: var(--mui-space-row-gap")
    expect(css).toContain("column-gap: var(--mui-space-column-gap")
  })

  it("uses native inline/row/column wrapping with source-compatible vertical nowrap", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#medium")!).flexWrap).toBe("wrap")
    expect(getComputedStyle(document.querySelector("#nowrap")!).flexWrap).toBe("nowrap")
    expect(getComputedStyle(document.querySelector("#vertical")!).flexDirection).toBe("column")
    expect(getComputedStyle(document.querySelector("#vertical")!).flexWrap).toBe("nowrap")
    expect(getComputedStyle(document.querySelector("#inline")!).display).toBe("inline-flex")
  })

  it("keeps separators explicit and preserves their author-selected grouping/ARIA", () => {
    fixture()
    const free = document.querySelector("#free-separator")!
    const paired = document.querySelector("#paired-separator")!
    const parent = paired.parentElement
    install()
    expect(free.parentElement?.id).toBe("separate-items")
    expect(paired.parentElement).toBe(parent)
    expect(parent?.id).toBe("paired-item")
    expect(free.textContent).toBe("/")
    expect(paired.getAttribute("aria-hidden")).toBe("true")
    expect(parent?.hasAttribute("aria-hidden")).toBe(false)
    expect(css).not.toContain("separator")
    expect(css).not.toMatch(/(?:^|[;{])\s*content:/m)
  })

  it("preserves native lists and markers instead of inserting invalid anonymous div wrappers", () => {
    fixture()
    const list = document.querySelector<HTMLOListElement>("#native-list")!
    const children = [...list.children]
    install()
    expect([...list.children]).toEqual(children)
    expect(children.every(n => n.tagName === "LI")).toBe(true)
    expect(list.type).toBe("A")
    expect(list.start).toBe(2)
    expect(getComputedStyle(children[0]!).display).toBe("list-item")
    expect(list.hasAttribute("role")).toBe(false)
    expect(css).not.toContain("list-style")
  })

  it("retains grouped native form submit/reset/disabled controls and link listeners", () => {
    fixture()
    const form = document.querySelector("form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    let submits = 0
    let disabled = 0
    let links = 0
    form.addEventListener("submit", (event) => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabled++)
    document.querySelector("#group-link")!.addEventListener("click", (event) => { event.preventDefault(); links++ })
    install()
    input.value = "Edited"
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    expect(input.value).toBe("Original")
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    document.querySelector<HTMLAnchorElement>("#group-link")!.click()
    expect(submits).toBe(1)
    expect(disabled).toBe(0)
    expect(links).toBe(1)
    expect(form.getAttribute("method")).toBe("get")
  })

  it("hides native roots/items but does not silently remove an empty authored wrapper", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#hidden-root")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#hidden-item")!).display).toBe("none")
    const empty = document.querySelector("#empty-item")!
    expect(empty.isConnected).toBe(true)
    expect(getComputedStyle(empty).display).not.toBe("none")
    expect(getComputedStyle(empty.querySelector("button")!).display).toBe("none")
    expect(css).not.toContain(":empty")
  })

  it("preserves native templates, late item identity and listeners through reconnect", () => {
    fixture()
    const root = document.querySelector("#authored-items")!
    const template = document.querySelector("template")!
    install()
    expect(getComputedStyle(template).display).toBe("none")
    expect(template.content.firstElementChild?.className).toBe("mui-space-item")
    const item = document.createElement("span")
    item.className = "mui-space-item"
    const button = document.createElement("button")
    button.type = "button"
    item.append(button)
    let clicks = 0
    button.addEventListener("click", () => clicks++)
    root.append(item)
    root.remove()
    document.body.append(root)
    button.click()
    expect(clicks).toBe(1)
    expect(root.lastChild).toBe(item)
    expect(item.firstChild).toBe(button)
  })

  it("preserves native order/RTL and limits CSS to its container and direct items", () => {
    fixture()
    const outside = document.querySelector("#outside")!
    const before = getComputedStyle(outside).display
    install()
    expect(document.querySelector("#rtl")?.firstElementChild?.id).toBe("rtl-first")
    expect(document.querySelector("section[dir]")?.getAttribute("dir")).toBe("rtl")
    expect(getComputedStyle(outside).display).toBe(before)
    expect(css).not.toContain("reverse")
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:order|direction):/m)
    expect(css).not.toContain("font")
    expect(css).not.toContain("overflow: hidden")
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("@keyframes")
    expect(css).not.toContain("@supports")
  })
})
