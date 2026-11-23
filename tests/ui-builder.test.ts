import { afterEach, describe, expect, it, vi } from "vitest"
import * as ui from "../src/core/ui.js"
import { Box, Span } from "../src/components/box/index.js"
import { Button } from "../src/components/button/index.js"

afterEach(() => document.body.replaceChildren())

describe("optional JavaScript UI builders", () => {
  it("composes real components and literal text without parsing HTML", () => {
    const title = ui.heading("Workspace").level(2)
    const link = ui.link("<img src=x>").href("/projects")
    const builder = ui.box(title, ui.span("Visit ", link, "."))
      .display("flex").direction("column").gap(8).padding(16)
    const element = builder.mount(document.body)

    expect(element).toBeInstanceOf(Box)
    expect(element).toBe(builder.build())
    expect(element.style.gap).toBe("8px")
    expect(element.style.padding).toBe("16px")
    expect(element.direction).toBeNull()
    expect(title.build().native?.localName).toBe("h2")
    expect(link.build().native?.textContent).toBe("<img src=x>")
    expect(element.querySelector("img")).toBeNull()
    expect(element.querySelector("m-span")).toBeInstanceOf(Span)

    link.href("/updated")
    expect(link.build().native?.getAttribute("href")).toBe("/updated")
  })

  it("preserves authored nodes, handlers and direct component APIs", () => {
    const text = document.createTextNode("Save")
    const click = vi.fn()
    const builder = ui.button(text).type("primary").on("click", click)
    const button = builder.mount(document.body)
    expect(button).toBeInstanceOf(Button)
    expect(button.control?.contains(text)).toBe(true)
    button.click()
    expect(click).toHaveBeenCalledOnce()
    button.disabled = true
    button.click()
    expect(click).toHaveBeenCalledOnce()
    button.disabled = false
    button.remove()
    builder.mount(document.body).click()
    expect(click).toHaveBeenCalledTimes(2)
    text.data = "Saved"
    expect(button.control?.textContent).toContain("Saved")
  })

  it("does not erase siblings and rejects invalid children or missing mount points", () => {
    const original = document.createElement("p")
    document.body.append(original)
    const builder = ui.flex(ui.span("One"), 2).vertical().wrap(false).className("example")
    expect(() => builder.mount("#absent")).toThrow("mount target")
    expect(builder.build().isConnected).toBe(false)
    builder.mount(document.body)
    expect(document.body.firstChild).toBe(original)
    expect(builder.build().vertical).toBe(true)
    expect(builder.build().wrap).toBe(false)
    expect(() => ui.span(NaN)).toThrow("finite numbers")
    expect(() => ui.heading("Invalid").level(7)).toThrow()
    expect(() => ui.box().padding(Infinity)).toThrow()
  })
})
