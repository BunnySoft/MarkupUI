import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "rate", "rate.css"), "utf8")
function withRules(check: (rules: CSSStyleRule[]) => void) {
  const style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  try { check([...style.sheet!.cssRules] as CSSStyleRule[]) } finally { style.remove() }
}

describe("Rate default styles", () => {
  it("uses source 16/20/24px sizes without overwriting public tokens or multi-character artwork", () => {
    withRules(rules => {
      for (const [size, value] of [["small", "16px"], ["medium", "20px"], ["large", "24px"]]) {
        const rule = rules.find(rule => rule.selectorText?.includes(`[data-size="${size}"]`))!
        expect(rule.style.getPropertyValue("--_mui-rate-size")).toBe(value)
        expect(rule.style.getPropertyValue("--mui-rate-size")).toBe("")
      }
      const glyph = rules.find(rule => rule.selectorText === ".mui-rate__glyph")!
      expect(glyph.style.getPropertyValue("inline-size")).toBe("")
      expect(css).toContain("var(--mui-rate-size, var(--_mui-rate-size, 20px))")
    })
  })

  it("uses the pinned gold/inactive palette and a six-pixel native choice gap", () => {
    withRules(rules => {
      const dark = rules.find(rule => rule.selectorText === ':where([data-mui-theme="dark"])')!
      expect(dark.style.getPropertyValue("--_mui-rate-active")).toBe("#ccaa33")
      expect(dark.style.getPropertyValue("--_mui-rate-muted")).toBe("rgba(255, 255, 255, .2)")
      expect(css).toContain("#ffcc33")
      expect(css).toContain("#dbdbdf")
      expect(css).toContain("gap: var(--mui-rate-gap, 6px)")
    })
  })

  it("blocks disabled hover previews without removing checked or cumulative selected color", () => {
    expect(css).toContain(".mui-rate__choice:hover > input:enabled ~ .mui-rate__glyph")
    expect(css).toContain(":has(~ .mui-rate__choice:hover > input:enabled)")
    expect(css).toContain(".mui-rate__choice > input:checked ~ .mui-rate__glyph")
    expect(css).toContain(":has(~ .mui-rate__choice > input:checked)")
    expect(css).not.toContain("input:checked:enabled")
  })

  it("keeps decorative half clipping separate from visible native controls in print/high contrast", () => {
    expect(css).toContain("inline-size: 50%")
    expect(css).toContain("color: CanvasText !important")
    expect(css).toContain("color: black !important")
    expect(css).toContain("accent-color: auto")
    expect(css).not.toContain("appearance: none")
    expect(css).not.toContain("animation:")
  })
})
