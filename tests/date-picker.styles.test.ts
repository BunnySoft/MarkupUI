import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"

const css = readFileSync(join("src", "components", "date-picker", "date-picker.css"), "utf8")
function inspect(run: (rules: CSSRule[]) => void) {
  const style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  try { run([...style.sheet!.cssRules]) } finally { style.remove() }
}

describe("Date Picker native field presentation", () => {
  it("keeps measured trigger roles inside the unchanged stylesheet ceiling", () => {
    for (const height of [28, 34, 40]) expect(css).toContain(`--_mui-date-picker-height: ${height}px`)
    for (const padding of [10, 12, 14]) expect(css).toContain(`--_mui-date-picker-pad: ${padding}px`)
    expect(css).toContain("var(--mui-font-size-large,15px)")
    expect(css).toContain("light-dark(#333639,rgba(255,255,255,.82))")
    expect(css).toContain("light-dark(#e0e0e6,transparent)")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
  })
  it("preserves inherited local tokens over private density and shared font/hover defaults", () => {
    expect(css).not.toMatch(/(?:^|[;{])\s*--mui-date-picker-[\w-]+\s*:/)
    for (const token of ["font-family", "font-size", "line-height", "height", "padding", "gap", "radius", "color", "background", "border-color", "focus-color", "disabled-color", "disabled-background"]) {
      expect(css).toContain(`var(--mui-date-picker-${token},`)
    }
    expect(css).toContain("var(--mui-font-family,")
    expect(css).toContain("var(--mui-color-primary-hover,")
  })
  it("does not replace native segments, picker artwork, range fields or validity semantics", () => {
    expect(css).not.toMatch(/appearance\s*:|content\s*:|::-webkit|::picker|:invalid|:valid|pointer-events|position\s*:\s*(?:fixed|absolute)/)
    expect(css).toContain(".mui-date-picker__fields { display: flex; flex-wrap: wrap;")
    expect(css).toContain("input[data-date-control]")
    expect(css).toContain("[hidden] { display: none !important; }")
  })
  it("uses actual native disabled eligibility, not readonly or attribute-only substitutes", () => {
    expect(css).toContain("input[data-date-control]:disabled")
    expect(css).toContain("light-dark(#fafafc,rgba(255,255,255,.06))")
    expect(css).toContain("light-dark(#c2c2c2,rgba(255,255,255,.38))")
    expect(css).not.toMatch(/\[disabled\]|\[readonly\]|\[aria-disabled/)
    expect(css).toContain(":focus-visible { outline: 2px solid Highlight; outline-offset: 2px; }")
  })
  it("uses private light print defaults and preserves public disabled-color overrides", () => {
    inspect(rules => {
      const print = rules.find(rule => rule.type === CSSRule.MEDIA_RULE && (rule as CSSMediaRule).conditionText === "print") as CSSMediaRule
      expect(print).toBeDefined()
      const root = print.cssRules[0] as CSSStyleRule
      expect(root.selectorText).toBe(".mui-date-picker")
      expect(root.style.length).toBe(2)
      expect(root.style.getPropertyValue("--_mui-date-picker-scheme")).toBe("light")
      expect(root.style.getPropertyValue("--_mui-date-picker-disabled")).toBe("GrayText")
      const action = print.cssRules[1] as CSSStyleRule
      expect(action.style.color).toBe("var(--mui-date-picker-disabled-color,GrayText)")
      expect(action.style.opacity).toBe("1")
    })
  })
  it("keeps forced-color disabled fields/actions opaque with system paint", () => {
    inspect(rules => {
      const forced = rules.find(rule => rule.type === CSSRule.MEDIA_RULE && (rule as CSSMediaRule).conditionText === "(forced-colors: active)") as CSSMediaRule
      expect(forced).toBeDefined()
      const field = forced.cssRules[0] as CSSStyleRule
      expect(field.selectorText).toContain("input[data-date-control]:disabled")
      expect(field.style.background).toBe("Canvas")
      expect(field.style.getPropertyValue("border-color")).toBe("CanvasText")
      const disabled = forced.cssRules[1] as CSSStyleRule
      expect(disabled.selectorText).toContain("input[data-date-control],button")
      expect(disabled.selectorText).toContain(":disabled")
      expect(disabled.style.color).toBe("GrayText")
      expect(disabled.style.opacity).toBe("1")
    })
  })
})
