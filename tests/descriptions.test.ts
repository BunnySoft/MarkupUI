import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DescriptionItem, Descriptions, registerDescriptions } from "../src/components/descriptions/index.js"
import * as descriptionsApi from "../src/components/descriptions/index.js"
import { descriptionsLabelPlacements, descriptionsSizes } from "../src/components/descriptions/model.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "descriptions", "descriptions.css"), "utf8")
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

describe("canonical Descriptions and DescriptionItem", () => {
  it("registers canonical tags extending ViewElement and exposes the family API", () => {
    expect(Object.keys(descriptionsApi).sort()).toEqual([
      "DescriptionItem",
      "Descriptions",
      "MDescriptionItem",
      "MDescriptions",
      "registerDescriptions",
    ])
    for (const type of [Descriptions, DescriptionItem]) {
      expect(Object.hasOwn(type, "tag")).toBe(true)
      expect(type.prototype instanceof ViewElement).toBe(true)
      expect(customElements.get(type.tag)).toBe(type)
    }
    expect(Descriptions.tag).toBe("m-descriptions")
    expect(DescriptionItem.tag).toBe("m-description-item")
    expect(Descriptions.observedAttributes).toEqual(["title", "bordered", "column", "columns", "size", "label-placement"])
    expect(DescriptionItem.observedAttributes).toEqual(["label", "span"])

    const define = vi.fn()
    expect(() => registerDescriptions({ get: name => name === "m-description-item" ? class extends HTMLElement {} : undefined, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerDescriptions()).not.toThrow()
  })

  it("has expected default property values", () => {
    const list = new Descriptions()
    const item = new DescriptionItem()
    expect(list.title).toBe("")
    expect(list.bordered).toBe(false)
    expect(list.column).toBe(3)
    expect(list.size).toBe("medium")
    expect(list.labelPlacement).toBe("top")
    expect(item.label).toBeNull()
    expect(item.span).toBe(1)
  })

  it("validates and reflects bordered boolean presence attribute", () => {
    const list = new Descriptions()
    document.body.append(list)
    expect(list.bordered).toBe(false)
    expect(list.hasAttribute("bordered")).toBe(false)

    list.bordered = true
    expect(list.bordered).toBe(true)
    expect(list.hasAttribute("bordered")).toBe(true)

    list.bordered = false
    expect(list.bordered).toBe(false)
    expect(list.hasAttribute("bordered")).toBe(false)

    expect(() => Reflect.set(list, "bordered", "true")).toThrow(RangeError)
    expect(() => Reflect.set(list, "bordered", 123)).toThrow(RangeError)
  })

  it("validates and reflects column count with default of 3", () => {
    const list = new Descriptions()
    document.body.append(list)
    expect(list.column).toBe(3)

    list.column = 4
    expect(list.column).toBe(4)
    expect(list.getAttribute("column")).toBe("4")

    list.setAttribute("column", "2")
    expect(list.column).toBe(2)

    list.removeAttribute("column")
    list.setAttribute("columns", "5")
    expect(list.column).toBe(5)

    expect(() => { list.column = 0 }).toThrow(RangeError)
    expect(() => { list.column = -2 }).toThrow(RangeError)
    expect(() => { list.column = 1.5 }).toThrow(RangeError)
    expect(() => { list.column = NaN }).toThrow(RangeError)
  })

  it("validates and reflects size attribute", () => {
    const list = new Descriptions()
    document.body.append(list)
    expect(list.size).toBe("medium")

    for (const size of descriptionsSizes) {
      list.size = size
      expect(list.size).toBe(size)
      expect(list.getAttribute("size")).toBe(size)
    }

    expect(() => Reflect.set(list, "size", "huge")).toThrow(RangeError)
    expect(() => Reflect.set(list, "size", "")).toThrow(RangeError)

    list.removeAttribute("size")
    expect(list.size).toBe("medium")
  })

  it("validates and reflects labelPlacement attribute", () => {
    const list = new Descriptions()
    document.body.append(list)
    expect(list.labelPlacement).toBe("top")

    for (const placement of descriptionsLabelPlacements) {
      list.labelPlacement = placement
      expect(list.labelPlacement).toBe(placement)
      expect(list.getAttribute("label-placement")).toBe(placement)
    }

    expect(() => Reflect.set(list, "labelPlacement", "right")).toThrow(RangeError)
    expect(() => Reflect.set(list, "labelPlacement", "bottom")).toThrow(RangeError)

    list.removeAttribute("label-placement")
    expect(list.labelPlacement).toBe("top")
  })

  it("validates and reflects DescriptionItem span", () => {
    const item = new DescriptionItem()
    document.body.append(item)
    expect(item.span).toBe(1)

    item.span = 3
    expect(item.span).toBe(3)
    expect(item.getAttribute("span")).toBe("3")

    expect(() => { item.span = 0 }).toThrow(RangeError)
    expect(() => { item.span = -1 }).toThrow(RangeError)
    expect(() => { item.span = 2.5 }).toThrow(RangeError)

    item.removeAttribute("span")
    expect(item.span).toBe(1)
  })

  it("rejects invalid authored attributes on property read", () => {
    const list = new Descriptions()
    const item = new DescriptionItem()

    for (const val of ["0", "-1", "1.5", "invalid", ""]) {
      list.setAttribute("column", val)
      expect(() => list.column).toThrow(RangeError)
    }
    list.removeAttribute("column")

    list.setAttribute("size", "unknown")
    expect(() => list.size).toThrow(RangeError)
    list.removeAttribute("size")

    list.setAttribute("label-placement", "bottom")
    expect(() => list.labelPlacement).toThrow(RangeError)
    list.removeAttribute("label-placement")

    for (const val of ["0", "-1", "2.5", "not-a-number", ""]) {
      item.setAttribute("span", val)
      expect(() => item.span).toThrow(RangeError)
    }
    item.removeAttribute("span")
  })

  it("validates and reflects DescriptionItem label", () => {
    const item = new DescriptionItem()
    document.body.append(item)
    expect(item.label).toBeNull()

    item.label = "Username"
    expect(item.label).toBe("Username")
    expect(item.getAttribute("label")).toBe("Username")

    item.label = null
    expect(item.label).toBeNull()
    expect(item.hasAttribute("label")).toBe(false)

    expect(() => Reflect.set(item, "label", 123)).toThrow(RangeError)
    expect(() => Reflect.set(item, "label", true)).toThrow(RangeError)
  })

  it("generates and cleans up header element when title is assigned", () => {
    const list = new Descriptions()
    document.body.append(list)
    expect(list.querySelector("[data-part='header']")).toBeNull()

    list.title = "User Details"
    const header = list.querySelector<HTMLElement>("[data-part='header']")
    expect(header).not.toBeNull()
    expect(header?.textContent).toBe("User Details")
    expect(header?.classList.contains("m-descriptions-header")).toBe(true)

    list.title = "Updated Title"
    expect(list.querySelector("[data-part='header']")?.textContent).toBe("Updated Title")

    list.title = undefined
    expect(list.querySelector("[data-part='header']")).toBeNull()
  })

  it("gives authored header precedence over generated title", () => {
    const list = new Descriptions()
    const customHeader = document.createElement("header")
    customHeader.textContent = "Authored Header"
    list.append(customHeader)
    document.body.append(list)

    list.title = "Fallback Title"
    expect(list.querySelector("[data-part='header']")).toBeNull()
    expect(list.contains(customHeader)).toBe(true)
    expect(customHeader.textContent).toBe("Authored Header")
  })

  it("generates label and wraps loose content in DescriptionItem", () => {
    const item = new DescriptionItem()
    item.label = "Name"
    item.textContent = "Morgan Chen"
    document.body.append(item)

    const labelEl = item.querySelector("[data-part='label']")
    expect(labelEl).not.toBeNull()
    expect(labelEl?.textContent).toBe("Name")

    const contentEl = item.querySelector("[data-part='content']")
    expect(contentEl).not.toBeNull()
    expect(contentEl?.textContent).toBe("Morgan Chen")

    item.label = "Full Name"
    expect(item.querySelector("[data-part='label']")?.textContent).toBe("Full Name")
  })

  it("preserves authored dt/dd or custom parts in DescriptionItem", () => {
    const item = new DescriptionItem()
    const dt = document.createElement("dt")
    dt.textContent = "Authored Term"
    const dd = document.createElement("dd")
    dd.textContent = "Authored Definition"
    item.append(dt, dd)
    document.body.append(item)

    expect(item.querySelector("[data-part='label']")).toBeNull()
    expect(item.querySelector("[data-part='content']")).toBeNull()
    expect(item.firstElementChild).toBe(dt)
    expect(item.lastElementChild).toBe(dd)
  })

  it("applies inline style leases and restores them upon disconnect", () => {
    const list = new Descriptions()
    list.column = 4
    const item = new DescriptionItem()
    item.span = 2
    list.append(item)
    document.body.append(list)

    expect(list.style.getPropertyValue("--_m-descriptions-columns")).toBe("4")
    expect(item.style.getPropertyValue("--_m-description-span")).toBe("2")

    list.remove()
    expect(list.style.getPropertyValue("--_m-descriptions-columns")).toBe("")
    expect(item.style.getPropertyValue("--_m-description-span")).toBe("")
  })

  it("survives reconnection preserving identity and children", () => {
    const list = new Descriptions()
    list.title = "Project"
    const item = new DescriptionItem()
    item.label = "Status"
    const btn = document.createElement("button")
    btn.type = "button"
    btn.textContent = "Click"
    let clicks = 0
    btn.addEventListener("click", () => clicks++)
    item.append(btn)
    list.append(item)
    document.body.append(list)

    list.remove()
    document.body.append(list)

    btn.click()
    expect(clicks).toBe(1)
    expect(list.querySelector("[data-part='header']")?.textContent).toBe("Project")
    expect(item.querySelector("[data-part='label']")?.textContent).toBe("Status")
  })

  it("applies CSS rules to both m-descriptions and dl.m-descriptions", () => {
    install()
    const customList = new Descriptions()
    customList.bordered = true
    const customItem = new DescriptionItem()
    customList.append(customItem)
    document.body.append(customList)

    const dlList = document.createElement("dl")
    dlList.className = "m-descriptions"
    dlList.dataset.bordered = ""
    const divItem = document.createElement("div")
    divItem.className = "m-description-item"
    const dt = document.createElement("dt")
    const dd = document.createElement("dd")
    divItem.append(dt, dd)
    dlList.append(divItem)
    document.body.append(dlList)

    const customListStyle = getComputedStyle(customList)
    const dlListStyle = getComputedStyle(dlList)
    expect(customListStyle.display).toBe("grid")
    expect(dlListStyle.display).toBe("grid")
    expect(customListStyle.getPropertyValue("--m-descriptions-columns")).toBe("3")
    expect(dlListStyle.getPropertyValue("--m-descriptions-columns")).toBe("3")
  })
})
