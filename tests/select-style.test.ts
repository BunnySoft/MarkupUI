import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "select", "select.css"), "utf8")
let style: HTMLStyleElement | undefined
function install() {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  return [...style.sheet!.cssRules] as CSSStyleRule[]
}
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("Select native field defaults", () => {
  it("keeps both the Select and derived Popselect CSS within their fixed budgets", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
    const composed = [
      readFileSync(resolve("src", "components", "popover", "popover.css"), "utf8"),
      css,
      readFileSync(resolve("src", "components", "popselect", "popselect.css"), "utf8")
    ].join("\n")
    expect(gzipSync(composed, { level: 9 }).length).toBeLessThanOrEqual(2500)
  })

  it("uses reference font/height presets without overwriting public size or state overrides", () => {
    const rules = install()
    const root = rules.find(rule => rule.selectorText === ".m-select")!
    expect(root.style.getPropertyValue("--_select-font")).toBe("14px")
    expect(root.style.getPropertyValue("--_select-height")).toBe("34px")
    const tiny = rules.find(rule => rule.selectorText === ".m-select[size=tiny]")!
    const large = rules.find(rule => rule.selectorText === ".m-select[size=large]")!
    expect(tiny.style.getPropertyValue("--_select-font")).toBe("12px")
    expect(tiny.style.getPropertyValue("--_select-height")).toBe("22px")
    expect(large.style.getPropertyValue("--_select-font")).toBe("15px")
    expect(large.style.getPropertyValue("--_select-height")).toBe("40px")
    for (const rule of rules.filter(rule => /^\.m-select\[(size|status|borderless)/.test(rule.selectorText ?? ""))) {
      for (let i = 0; i < rule.style.length; i++) expect(rule.style[i]).toMatch(/^--_select-/)
    }
  })

  it("keeps native multiple/list height and popup painting rather than replacing them", () => {
    const rules = install()
    const control = rules.find(rule => rule.selectorText === ".m-select [data-select-control]")!
    expect(control.style.getPropertyValue("min-block-size")).toBe("var(--_select-height)")
    expect(control.style.getPropertyValue("height")).toBe("")
    expect(control.style.getPropertyValue("block-size")).toBe("")
    expect(control.style.getPropertyValue("appearance")).toBe("")
    expect(control.style.getPropertyValue("border-radius")).toBe("3px")
    expect(css).not.toContain("::picker")
    expect(rules.some(rule => /(^|[\s,>])(option|optgroup)([^\w-]|$)/.test(rule.selectorText ?? ""))).toBe(false)
  })

  it("preserves original options, groups, values and explicit author padding", () => {
    document.body.innerHTML = '<div class="m-select" size="large" status="error" style="--m-select-font:18px;--m-select-pad:7px 13px;--m-select-border:purple"><select data-select-control multiple size="4"><option value="a" selected>Alpha</option><optgroup label="Group" disabled><option value="b" selected>Beta</option></optgroup></select></div>'
    const select = document.querySelector("select")!
    const before = select.outerHTML
    install()
    expect(select.outerHTML).toBe(before)
    expect([...select.selectedOptions].map(option => option.value)).toEqual(["a", "b"])
    const root = getComputedStyle(document.querySelector(".m-select")!)
    expect(root.getPropertyValue("--m-select-font")).toBe("18px")
    expect(root.getPropertyValue("--m-select-pad")).toBe("7px 13px")
    expect(root.getPropertyValue("--m-select-border")).toBe("purple")
  })

  it("retains readable native disabled and print/forced-color policies", () => {
    const rules = install()
    const disabled = rules.find(rule => rule.selectorText === ".m-select [data-select-control]:disabled")!
    expect(disabled.style.getPropertyValue("color")).toContain("--m-select-disabled")
    expect(disabled.style.getPropertyValue("background-color")).toContain("#fafafc")
    const print = [...style!.sheet!.cssRules].find(rule => "conditionText" in rule && rule.conditionText === "print") as CSSMediaRule
    expect((print.cssRules[0] as CSSStyleRule).style.getPropertyValue("color-scheme")).toBe("light")
    expect(css).toContain("forced-colors:active),print")
  })

  it("does not repaint borderless or disabled fields as hovered editable fields", () => {
    const rules = install()
    const interactive = rules.find(rule => rule.selectorText?.includes(":is(:hover,:focus)"))!
    expect(interactive.selectorText).toContain(".m-select:not([borderless])")
    expect(interactive.selectorText).toContain(":not(:disabled)")
    expect(interactive.style.getPropertyValue("border-color")).toContain("--m-select-focus")
  })
})
