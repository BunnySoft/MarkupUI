import { describe, expect, it } from "vitest"
import { ViewElement } from "../src/core/index.js"

class LayoutProbe extends ViewElement {
  public static readonly tag = "m-layout-style-probe"
  public sync(name: string, value: string | null): boolean { return this.syncLayoutStyle(name, value) }
}
ViewElement.register([LayoutProbe])

describe("ViewElement layout styles", () => {
  it.each([
    ["display", "flex", "display", "flex"],
    ["direction", "column", "flex-direction", "column"],
    ["align", "center", "align-items", "center"],
    ["justify", "space-between", "justify-content", "space-between"],
    ["wrap", "", "flex-wrap", "wrap"],
    ["wrap", "true", "flex-wrap", "wrap"],
    ["wrap", "nowrap", "flex-wrap", "nowrap"],
    ["wrap", "wrap-reverse", "flex-wrap", "wrap-reverse"],
    ["gap", "12", "gap", "12px"],
    ["padding", "8", "padding", "8px"],
    ["margin", "0", "margin", "0px"],
    ["width", "50", "width", "50px"],
    ["height", "30", "height", "30px"],
    ["border-radius", "4", "border-radius", "4px"],
    ["gap", "1.5rem", "gap", "1.5rem"],
    ["padding", "2px 4px", "padding", "2px 4px"],
    ["margin", "-2px", "margin", "-2px"],
    ["width", "50%", "width", "50%"],
    ["background", "red", "background", "red"],
    ["border", "1px solid red", "border", "1px solid red"],
  ])("maps %s=%s to CSS and clears it on removal", (name, value, property, expected) => {
    const element = new LayoutProbe()
    element.style.color = "blue"
    expect(element.sync(name, value)).toBe(true)
    expect(element.style.getPropertyValue(property)).toBe(expected)
    expect(element.sync(name, null)).toBe(true)
    expect(element.style.getPropertyValue(property)).toBe("")
    expect(element.style.color).toBe("blue")
  })

  it.each(["toString", "constructor", "__proto__", "color", "--custom"])("rejects unrecognized layout property %s", name => {
    const element = new LayoutProbe()
    element.style.color = "blue"
    const before = element.style.cssText
    expect(element.sync(name, "red")).toBe(false)
    expect(element.style.cssText).toBe(before)
  })

  it("returns a detached complete attribute snapshot with the typed borderRadius spelling", () => {
    const element = new LayoutProbe()
    element.viewStyle = { gap: 8, borderRadius: 4, wrap: true }
    const snapshot = element.viewStyle
    expect(Object.keys(snapshot)).toHaveLength(ViewElement.layoutAttributes.length)
    expect(snapshot).toMatchObject({ gap: "8", borderRadius: "4", wrap: "", display: null })
    snapshot.gap = 99
    expect(element.viewStyle.gap).toBe("8")
    element.viewStyle = { gap: null, wrap: false }
    expect(element.viewStyle).toMatchObject({ gap: null, wrap: null, borderRadius: "4" })
    expect(element.style.gap).toBe("")
    expect(element.style.flexWrap).toBe("")
  })
})
