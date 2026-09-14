import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Breadcrumb, BreadcrumbItem, registerBreadcrumb, DEFAULT_BREADCRUMB_SEPARATOR } from "../src/components/breadcrumb/index.js"
import * as breadcrumbApi from "../src/components/breadcrumb/index.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "breadcrumb", "breadcrumb.css"), "utf8")
let style: HTMLStyleElement | undefined

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

describe("canonical Breadcrumb and BreadcrumbItem ViewElement", () => {
  it("exports canonical ViewElement classes and registration", () => {
    expect(breadcrumbApi.Breadcrumb).toBe(Breadcrumb)
    expect(breadcrumbApi.BreadcrumbItem).toBe(BreadcrumbItem)
    expect(Breadcrumb.tag).toBe("m-breadcrumb")
    expect(BreadcrumbItem.tag).toBe("m-breadcrumb-item")
    expect(ViewElement.prototype.isPrototypeOf(Breadcrumb.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(BreadcrumbItem.prototype)).toBe(true)
    expect(customElements.get("m-breadcrumb")).toBe(Breadcrumb)
    expect(customElements.get("m-breadcrumb-item")).toBe(BreadcrumbItem)
    expect(Breadcrumb.observedAttributes).toEqual(["separator"])
    expect(BreadcrumbItem.observedAttributes).toEqual(["href", "separator"])
    expect(() => registerBreadcrumb()).not.toThrow()
  })

  it("handles Breadcrumb separator property and default values", () => {
    const element = document.createElement("m-breadcrumb") as Breadcrumb
    expect(element.separator).toBe(DEFAULT_BREADCRUMB_SEPARATOR)
    expect(element.separator).toBe("/")

    element.separator = ">"
    expect(element.getAttribute("separator")).toBe(">")
    expect(element.separator).toBe(">")

    element.setAttribute("separator", "→")
    expect(element.separator).toBe("→")

    element.separator = undefined
    expect(element.hasAttribute("separator")).toBe(false)
    expect(element.separator).toBe("/")
  })

  it("handles BreadcrumbItem href and separator properties", () => {
    const item = document.createElement("m-breadcrumb-item") as BreadcrumbItem
    expect(item.href).toBeUndefined()
    expect(item.separator).toBeUndefined()

    item.href = "#home"
    expect(item.getAttribute("href")).toBe("#home")
    expect(item.href).toBe("#home")

    item.separator = ">"
    expect(item.getAttribute("separator")).toBe(">")
    expect(item.separator).toBe(">")

    item.href = undefined
    expect(item.hasAttribute("href")).toBe(false)
    expect(item.href).toBeUndefined()

    item.separator = undefined
    expect(item.hasAttribute("separator")).toBe(false)
    expect(item.separator).toBeUndefined()
  })

  it("renders accessible semantics on connected callback", () => {
    const breadcrumb = document.createElement("m-breadcrumb") as Breadcrumb
    const item = document.createElement("m-breadcrumb-item") as BreadcrumbItem
    item.textContent = "Home"
    breadcrumb.append(item)
    document.body.append(breadcrumb)

    expect(breadcrumb.getAttribute("role")).toBe("navigation")
    expect(breadcrumb.getAttribute("aria-label")).toBe("Breadcrumb")
    expect(item.getAttribute("role")).toBe("listitem")
  })

  it("preserves authored aria-label on Breadcrumb", () => {
    const breadcrumb = document.createElement("m-breadcrumb") as Breadcrumb
    breadcrumb.setAttribute("aria-label", "Custom Nav")
    document.body.append(breadcrumb)
    expect(breadcrumb.getAttribute("aria-label")).toBe("Custom Nav")
  })

  it("renders anchor link for items with href and span for items without href", () => {
    document.body.innerHTML = `
      <m-breadcrumb>
        <m-breadcrumb-item href="#home" id="item-1">Home</m-breadcrumb-item>
        <m-breadcrumb-item id="item-2">Current</m-breadcrumb-item>
      </m-breadcrumb>
    `
    const item1 = document.querySelector<BreadcrumbItem>("#item-1")!
    const item2 = document.querySelector<BreadcrumbItem>("#item-2")!

    expect(item1.link).toBeInstanceOf(HTMLAnchorElement)
    expect(item1.link?.getAttribute("href")).toBe("#home")
    expect(item1.link?.textContent).toBe("Home")
    expect(item1.separatorNode).not.toBeNull()

    expect(item2.link).toBeInstanceOf(HTMLSpanElement)
    expect(item2.link?.hasAttribute("href")).toBe(false)
    expect(item2.link?.textContent).toBe("Current")
    expect(item2.separatorNode).not.toBeNull()
  })

  it("propagates separator from breadcrumb to items and supports item override", () => {
    document.body.innerHTML = `
      <m-breadcrumb separator=">" id="bc">
        <m-breadcrumb-item href="#a" id="item-a">A</m-breadcrumb-item>
        <m-breadcrumb-item href="#b" separator="→" id="item-b">B</m-breadcrumb-item>
        <m-breadcrumb-item id="item-c">C</m-breadcrumb-item>
      </m-breadcrumb>
    `
    const bc = document.querySelector<Breadcrumb>("#bc")!
    const itemA = document.querySelector<BreadcrumbItem>("#item-a")!
    const itemB = document.querySelector<BreadcrumbItem>("#item-b")!
    const itemC = document.querySelector<BreadcrumbItem>("#item-c")!

    expect(itemA.separatorNode?.textContent).toBe(">")
    expect(itemB.separatorNode?.textContent).toBe("→")
    expect(itemC.separatorNode?.textContent).toBe(">")

    bc.separator = "/"
    expect(itemA.separatorNode?.textContent).toBe("")
    expect(itemB.separatorNode?.textContent).toBe("→")
    expect(itemC.separatorNode?.textContent).toBe("")
  })

  it("updates link when href changes dynamically", () => {
    const item = document.createElement("m-breadcrumb-item") as BreadcrumbItem
    item.textContent = "Docs"
    document.body.append(item)

    expect(item.link?.tagName).toBe("SPAN")
    item.href = "/docs"
    expect(item.link?.tagName).toBe("A")
    expect(item.link?.getAttribute("href")).toBe("/docs")

    item.href = undefined
    expect(item.link?.hasAttribute("href")).toBe(false)
  })

  it("forwards aria-current to link element", () => {
    document.body.innerHTML = `
      <m-breadcrumb>
        <m-breadcrumb-item href="#home">Home</m-breadcrumb-item>
        <m-breadcrumb-item aria-current="page" id="current-item">Current</m-breadcrumb-item>
      </m-breadcrumb>
    `
    const current = document.querySelector<BreadcrumbItem>("#current-item")!
    expect(current.link?.getAttribute("aria-current")).toBe("page")
  })

  it("includes valid stylesheet targeting m-breadcrumb and m-breadcrumb-item", () => {
    install()
    expect(css).toContain("m-breadcrumb")
    expect(css).toContain("m-breadcrumb-item")
    expect(css).not.toContain("@import")
  })
})
