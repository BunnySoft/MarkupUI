import { afterEach, describe, expect, it } from "vitest"
import {
  Box,
  Div,
  Span,
  Label,
  Footer,
  Article,
  Strong,
  Em,
  Small,
  Pre,
  Details,
  Summary,
  registerBox,
} from "../src/components/box/index.js"
import { ViewElement } from "../src/core/index.js"

afterEach(() => {
  document.body.replaceChildren()
})

describe("canonical Box and Primitives ViewElements", () => {
  it("exports canonical ViewElement classes and registers custom elements", () => {
    expect(Box.tag).toBe("m-box")
    expect(Div.tag).toBe("m-div")
    expect(Span.tag).toBe("m-span")
    expect(Label.tag).toBe("m-label")
    expect(Footer.tag).toBe("m-footer")
    expect(Article.tag).toBe("m-article")
    expect(Strong.tag).toBe("m-strong")
    expect(Em.tag).toBe("m-em")
    expect(Small.tag).toBe("m-small")
    expect(Pre.tag).toBe("m-pre")
    expect(Details.tag).toBe("m-details")
    expect(Summary.tag).toBe("m-summary")

    expect(ViewElement.prototype.isPrototypeOf(Box.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(Span.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(Label.prototype)).toBe(true)

    expect(customElements.get("m-box")).toBe(Box)
    expect(customElements.get("m-div")).toBe(Div)
    expect(customElements.get("m-span")).toBe(Span)
    expect(customElements.get("m-label")).toBe(Label)
  })

  it("handles declarative layout attributes on Box", () => {
    document.body.innerHTML = `
      <m-box display="flex" direction="row" align="center" justify="space-between" wrap gap="16" padding="20" margin="10" width="300" height="200" background="#f0f0f0" border="1px solid #ccc" border-radius="8">
        <m-span>Content</m-span>
      </m-box>`
    const box = document.querySelector("m-box") as Box
    expect(box.display).toBe("flex")
    expect(box.direction).toBe("row")
    expect(box.align).toBe("center")
    expect(box.justify).toBe("space-between")
    expect(box.wrap).toBe(true)
    expect(box.gap).toBe("16")
    expect(box.padding).toBe("20")
    expect(box.margin).toBe("10")
    expect(box.width).toBe("300")
    expect(box.height).toBe("200")
    expect(box.background).toBe("#f0f0f0")
    expect(box.border).toBe("1px solid #ccc")
    expect(box.borderRadius).toBe("8")

    expect(box.style.gap).toBe("16px")
    expect(box.style.padding).toBe("20px")
    expect(box.style.margin).toBe("10px")
    expect(box.style.width).toBe("300px")
    expect(box.style.height).toBe("200px")
    expect(box.style.background).toBe("rgb(240, 240, 240)")
    expect(box.style.borderRadius).toBe("8px")

    box.gap = "24"
    expect(box.getAttribute("gap")).toBe("24")
    expect(box.style.gap).toBe("24px")

    box.padding = null
    expect(box.hasAttribute("padding")).toBe(false)
    expect(box.style.padding).toBe("")
  })

  it("handles Span style attributes", () => {
    document.body.innerHTML = `<m-span color="red" weight="bold">Alert</m-span>`
    const span = document.querySelector("m-span") as Span
    expect(span.color).toBe("red")
    expect(span.weight).toBe("bold")
    expect(span.style.color).toBe("red")
    expect(span.style.fontWeight).toBe("bold")
  })

  it("handles Label target focus and click delegation", () => {
    document.body.innerHTML = `
      <m-label for="target-input">Name</m-label>
      <input id="target-input">`
    const label = document.querySelector("m-label") as Label
    const input = document.querySelector("input") as HTMLInputElement
    expect(label.htmlFor).toBe("target-input")
    expect(label.required).toBe(false)

    label.click()
    expect(document.activeElement).toBe(input)
  })

  it("handles Details and Summary interaction", () => {
    document.body.innerHTML = `
      <m-details>
        <m-summary>More info</m-summary>
        <m-box>Hidden details</m-box>
      </m-details>`
    const details = document.querySelector("m-details") as Details
    const summary = document.querySelector("m-summary") as Summary
    expect(details.open).toBe(false)

    summary.click()
    expect(details.open).toBe(true)

    summary.click()
    expect(details.open).toBe(false)
  })

  it("handles typed viewStyle and semantic classTokens on ViewElement", () => {
    document.body.innerHTML = `<m-box class="surface-card tone-primary" gap="12" direction="column"></m-box>`
    const box = document.querySelector("m-box") as Box

    expect(box.classTokens).toEqual(["surface-card", "tone-primary"])
    box.classTokens = ["surface-elevated", "tone-success"]
    expect(box.className).toBe("surface-elevated tone-success")

    expect(box.viewStyle.gap).toBe("12")
    expect(box.viewStyle.direction).toBe("column")

    box.viewStyle = {
      gap: 24,
      direction: "row",
      padding: 16,
      display: "flex",
    }
    expect(box.getAttribute("gap")).toBe("24")
    expect(box.getAttribute("direction")).toBe("row")
    expect(box.getAttribute("padding")).toBe("16")
    expect(box.getAttribute("display")).toBe("flex")
    expect(box.style.gap).toBe("24px")
    expect(box.style.padding).toBe("16px")
    expect(box.style.flexDirection).toBe("row")
  })
})
