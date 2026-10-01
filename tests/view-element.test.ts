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

  it("returns a detached complete inline-style snapshot with the typed borderRadius spelling", () => {
    const element = new LayoutProbe()
    element.viewStyle = { gap: 8, borderRadius: 4, wrap: true }
    const snapshot = element.viewStyle
    expect(Object.keys(snapshot)).toHaveLength(ViewElement.layoutAttributes.length)
    expect(snapshot).toMatchObject({ gap: "8px", borderRadius: "4px", wrap: "wrap", display: null })
    snapshot.gap = 99
    expect(element.viewStyle.gap).toBe("8px")
    element.viewStyle = { gap: null, wrap: false }
    expect(element.viewStyle).toMatchObject({ gap: null, wrap: "nowrap", borderRadius: "4px" })
    expect(element.style.gap).toBe("")
    expect(element.style.flexWrap).toBe("nowrap")
  })

  it("never interprets or rewrites same-named component behavior attributes", () => {
    const element = new LayoutProbe()
    element.setAttribute("direction", "vertical")
    element.setAttribute("gap", "20")
    expect(element.viewStyle.direction).toBeNull()
    expect(element.viewStyle.gap).toBeNull()
    element.viewStyle = { direction: "row", gap: 6 }
    expect(element.getAttribute("direction")).toBe("vertical")
    expect(element.getAttribute("gap")).toBe("20")
    expect(element.viewStyle).toMatchObject({ direction: "row", gap: "6px" })
  })

  it("applies only supplied styles and reads current inline values without affecting unrelated CSS", () => {
    const element = new LayoutProbe()
    element.style.color = "blue"
    element.style.margin = "4px"
    element.viewStyle = { display: "flex", gap: 1.5, borderRadius: 2.5 }
    expect(element.getAttributeNames()).toEqual(["style"])
    expect(element.viewStyle).toMatchObject({ display: "flex", gap: "1.5px", borderRadius: "2.5px", margin: "4px" })
    element.viewStyle = { gap: null }
    expect(element.style.color).toBe("blue")
    expect(element.style.display).toBe("flex")
    element.style.width = "50%"
    expect(element.viewStyle.width).toBe("50%")
  })

  it.each([null, [], "flex", { gap: Infinity }, { display: true }, { width: {} }, { color: "red" }, { "border-radius": "8px" }, { display: "grid", width: NaN }])("rejects invalid descriptors before modifying any style: %j", value => {
    const element = new LayoutProbe()
    element.style.width = "20px"
    expect(() => Reflect.set(element, "viewStyle", value)).toThrow(TypeError)
    expect(element.style.cssText).toBe("width: 20px;")
  })
})
