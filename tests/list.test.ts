import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { List, ListItem, listSizes, registerList } from "../src/components/list/index.js"
import * as listApi from "../src/components/list/index.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "list", "list.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "list.html"), "utf8")
let style: HTMLStyleElement | undefined

function fixture(): void {
  document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>"))
}
function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}
afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("canonical List and ListItem components", () => {
  it("registers canonical classes extending ViewElement with own tags", () => {
    expect(Object.keys(listApi).sort()).toEqual(["List", "ListItem", "listSizes", "registerList"])
    expect(List.tag).toBe("m-list")
    expect(ListItem.tag).toBe("m-list-item")
    expect(ViewElement.prototype.isPrototypeOf(List.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(ListItem.prototype)).toBe(true)
    expect(customElements.get("m-list")).toBe(List)
    expect(customElements.get("m-list-item")).toBe(ListItem)

    expect(() => registerList()).not.toThrow()
    const define = vi.fn()
    expect(() =>
      registerList({
        get: name => (name === "m-list" ? (class extends HTMLElement {} as any) : undefined),
        define,
      }),
    ).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("manages List bordered, size, clickable, hoverable, and showDivider properties", () => {
    const list = document.createElement("m-list") as List
    document.body.append(list)

    expect(list.bordered).toBe(true)
    expect(list.size).toBe("medium")
    expect(list.clickable).toBe(false)
    expect(list.hoverable).toBe(false)
    expect(list.showDivider).toBe(true)

    list.bordered = false
    expect(list.getAttribute("bordered")).toBe("false")
    expect(list.bordered).toBe(false)
    list.bordered = true
    expect(list.getAttribute("bordered")).toBe("true")
    expect(list.bordered).toBe(true)
    list.removeAttribute("bordered")
    expect(list.bordered).toBe(true)

    list.setAttribute("bordered", "invalid")
    expect(() => list.bordered).toThrow(RangeError)
    list.removeAttribute("bordered")
    expect(() => Reflect.set(list, "bordered", "not-boolean")).toThrow(RangeError)

    for (const size of listSizes) {
      list.size = size
      expect(list.getAttribute("size")).toBe(size)
      expect(list.size).toBe(size)
    }
    expect(() => Reflect.set(list, "size", "huge")).toThrow(RangeError)
    list.setAttribute("size", "invalid")
    expect(() => list.size).toThrow(RangeError)
    list.removeAttribute("size")
    expect(list.size).toBe("medium")

    list.clickable = true
    expect(list.hasAttribute("clickable")).toBe(true)
    expect(list.clickable).toBe(true)
    list.clickable = false
    expect(list.hasAttribute("clickable")).toBe(false)
    expect(list.clickable).toBe(false)

    list.hoverable = true
    expect(list.hasAttribute("hoverable")).toBe(true)
    expect(list.hoverable).toBe(true)
    list.hoverable = false
    expect(list.hasAttribute("hoverable")).toBe(false)
    expect(list.hoverable).toBe(false)

    list.showDivider = false
    expect(list.getAttribute("show-divider")).toBe("false")
    expect(list.showDivider).toBe(false)
    list.showDivider = true
    expect(list.showDivider).toBe(true)
  })

  it("exposes regions and items on List and isolates nested lists", () => {
    const list = document.createElement("m-list") as List
    list.innerHTML = `
      <div data-part="header" class="m-list-header">Header</div>
      <m-list-item id="item-1">Item 1</m-list-item>
      <m-list-item id="item-2">
        Item 2
        <m-list id="nested-list">
          <m-list-item id="nested-item">Nested Item</m-list-item>
        </m-list>
      </m-list-item>
      <div data-part="footer" class="m-list-footer">Footer</div>
    `
    document.body.append(list)

    expect(list.header?.textContent).toBe("Header")
    expect(list.footer?.textContent).toBe("Footer")
    expect(list.itemsContainer).toBeNull()

    const items = list.items
    expect(items).toHaveLength(2)
    expect(items[0]?.id).toBe("item-1")
    expect(items[1]?.id).toBe("item-2")

    const nested = list.querySelector<List>("#nested-list")!
    expect(nested.items).toHaveLength(1)
    expect(nested.items[0]?.id).toBe("nested-item")

    const added = list.appendItem("Item 3")
    expect(added.tagName).toBe("M-LIST-ITEM")
    expect(added.textContent).toBe("Item 3")
    expect(list.items).toHaveLength(3)

    expect(list.removeItem(added)).toBe(true)
    expect(list.items).toHaveLength(2)
  })

  it("handles itemsContainer when authored with ul or ol", () => {
    const list = document.createElement("m-list") as List
    list.innerHTML = `
      <header class="m-list-header">Header</header>
      <ul class="m-list-items" role="list">
        <m-list-item id="ul-item-1">One</m-list-item>
        <m-list-item id="ul-item-2">Two</m-list-item>
      </ul>
      <footer class="m-list-footer">Footer</footer>
    `
    document.body.append(list)

    expect(list.itemsContainer?.tagName).toBe("UL")
    expect(list.items).toHaveLength(2)
    expect(list.hasAttribute("role")).toBe(false)
    expect(list.itemsContainer?.getAttribute("role")).toBe("list")
  })

  it("manages ListItem prefix, suffix, and content regions", () => {
    const item = document.createElement("m-list-item") as ListItem
    document.body.append(item)

    expect(item.getAttribute("role")).toBe("listitem")
    expect(item.prefix).toBeNull()
    expect(item.suffix).toBeNull()
    expect(item.prefixRegion).toBeNull()
    expect(item.suffixRegion).toBeNull()

    item.prefix = "◈"
    expect(item.getAttribute("prefix")).toBe("◈")
    expect(item.prefixRegion?.textContent).toBe("◈")
    expect(item.prefixRegion?.dataset.part).toBe("prefix")

    item.suffix = "Active"
    expect(item.getAttribute("suffix")).toBe("Active")
    expect(item.suffixRegion?.textContent).toBe("Active")
    expect(item.suffixRegion?.dataset.part).toBe("suffix")

    item.prefix = null
    expect(item.hasAttribute("prefix")).toBe(false)
    expect(item.prefixRegion).toBeNull()

    item.suffix = null
    expect(item.hasAttribute("suffix")).toBe(false)
    expect(item.suffixRegion).toBeNull()
  })

  it("preserves authored ListItem row, prefix, content, and suffix regions without duplication", () => {
    const item = document.createElement("m-list-item") as ListItem
    item.innerHTML = `
      <div data-part="row" class="m-list-row">
        <span data-part="prefix" class="m-list-prefix">◈</span>
        <div data-part="content" class="m-list-content">Project Alpha</div>
        <span data-part="suffix" class="m-list-suffix">Pending</span>
      </div>
    `
    document.body.append(item)

    expect(item.rowRegion?.classList.contains("m-list-row")).toBe(true)
    expect(item.prefixRegion?.textContent).toBe("◈")
    expect(item.contentRegion?.textContent).toBe("Project Alpha")
    expect(item.suffixRegion?.textContent).toBe("Pending")

    item.prefix = "★"
    expect(item.querySelectorAll(".m-list-prefix")).toHaveLength(1)
  })

  it("preserves native list/listitem accessibility and semantic layout", () => {
    fixture()
    install()

    const list = document.querySelector<List>("#projects")!
    expect(list).toBeInstanceOf(List)
    expect(list.bordered).toBe(true)
    expect(list.hoverable).toBe(true)

    const header = list.header!
    expect(header).not.toBeNull()
    expect(header.closest("ul, ol")).toBeNull()

    const footer = list.footer!
    expect(footer).not.toBeNull()
    expect(footer.closest("ul, ol")).toBeNull()

    const items = list.items
    expect(items.length).toBeGreaterThanOrEqual(2)
    for (const item of items) {
      expect(item.getAttribute("role")).toBe("listitem")
    }
  })

  it("preserves authored listeners and node identity across removal and reconnection", () => {
    fixture()
    install()

    const root = document.querySelector<List>("#projects")!
    const before = root.outerHTML
    const children = [...root.querySelectorAll("*")]
    const action = document.querySelector<HTMLButtonElement>("#archive-alpha")!
    let clicks = 0
    action.addEventListener("click", () => clicks++)

    root.remove()
    document.body.append(root)

    expect(root.outerHTML).toBe(before)
    expect([...root.querySelectorAll("*")]).toEqual(children)
    action.click()
    expect(clicks).toBe(1)
  })

  it("preserves native markers in ordered lists", () => {
    fixture()
    install()

    const ordered = document.querySelector<HTMLOListElement>("#ordered ol")!
    expect(ordered.start).toBe(3)
    const secondItem = ordered.querySelector<ListItem>("m-list-item[value]")!
    expect(secondItem.getAttribute("value")).toBe("8")
  })

  it("does not intercept form validation, submission, reset or fieldset disabling", () => {
    fixture()
    install()

    const form = document.querySelector<HTMLFormElement>("#native-form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => {
      event.preventDefault()
      submits++
    })
    document.querySelector("#fieldset-disabled")!.addEventListener("click", () => disabledClicks++)

    input.value = ""
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(0)

    input.value = "Edited"
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["name", "Edited"]])

    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    expect(input.value).toBe("Original")

    document.querySelector<HTMLButtonElement>("#fieldset-disabled")!.click()
    document.querySelector<HTMLButtonElement>("#disabled-row")!.click()
    expect(disabledClicks).toBe(0)
  })

  it("keeps styles, tokens, and media queries clean and within budget", () => {
    expect(css).toContain("var(--m-list-font-size, var(--m-font-size, 14px))")
    expect(css).toContain("var(--m-list-line-height, var(--m-line-height, 1.6))")
    expect(css).toContain("var(--m-list-border-radius, 3px)")
    expect(css).toContain("var(--m-list-color, var(--_m-list-color, #333639))")
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("@media (prefers-reduced-motion: reduce)")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1800)
  })
})
