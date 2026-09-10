import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"

const css = readFileSync(join("src", "components", "cascader", "cascader.css"), "utf8")
function inspect(run: (rules: CSSRule[]) => void) {
  const style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  try { run([...style.sheet!.cssRules]) } finally { style.remove() }
}

describe("Cascader retained native styles", () => {
  it("keeps corrected trigger density and paint inside the existing CSS budget", () => {
    expect(css).toContain("--_mui-cascader-height: 28px")
    expect(css).toContain("--_mui-cascader-height: 34px")
    expect(css).toContain("--_mui-cascader-height: 40px")
    expect(css).toContain("var(--mui-font-size-large,15px)")
    expect(css).toContain("light-dark(#333639,rgba(255,255,255,.82))")
    expect(css).toContain("light-dark(#e0e0e6,transparent)")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1250)
  })
  it("uses fallbacks rather than overwriting inherited public author tokens", () => {
    expect(css).not.toMatch(/(?:^|[;{])\s*--mui-cascader-[\w-]+\s*:/)
    for (const token of ["gap", "font-size", "font-family", "line-height", "height", "padding", "radius", "color", "background", "border-color", "focus-color", "disabled-color", "disabled-background"]) {
      expect(css).toContain(`var(--mui-cascader-${token},`)
    }
    expect(css).toContain("var(--mui-color-primary-hover,")
  })
  it("leaves native option, disclosure, focus and loading renderers intact", () => {
    expect(css).not.toMatch(/appearance\s*:|content\s*:|position\s*:\s*(?:absolute|fixed)|option:checked|animation\s*:/)
    expect(css).toContain("[data-cascader-source] summary { cursor: pointer; }")
    expect(css).toContain("[data-cascader-path] { white-space: pre-wrap; }")
    expect(css).toContain("[data-cascader-status] { min-block-size: 1.5em; }")
    expect(css).toContain(":focus-visible { outline: 2px solid Highlight;")
    expect(css).toContain("[hidden] { display: none !important; }")
  })
  it("uses actual disabled controls including native fieldset inheritance", () => {
    expect(css).toContain("select[data-cascader-control]:disabled")
    expect(css).toContain("light-dark(#fafafc,rgba(255,255,255,.06))")
    expect(css).toContain("light-dark(#c2c2c2,rgba(255,255,255,.38))")
    expect(css).not.toContain("[aria-disabled")
    expect(css).not.toContain("pointer-events")
  })
  it("resets private scheme and disabled defaults for dark print without discarding author colors", () => {
    inspect(rules => {
      const print = rules.find(rule => rule.type === CSSRule.MEDIA_RULE && (rule as CSSMediaRule).conditionText === "print") as CSSMediaRule
      expect(print).toBeDefined()
      const rule = print.cssRules[0] as CSSStyleRule
      expect(rule.selectorText).toBe(".mui-cascader")
      expect(rule.style.length).toBe(2)
      expect(rule.style.getPropertyValue("--_mui-cascader-scheme")).toBe("light")
      expect(rule.style.getPropertyValue("--_mui-cascader-disabled")).toBe("GrayText")
      const clear = print.cssRules[1] as CSSStyleRule
      expect(clear.style.color).toBe("var(--mui-cascader-disabled-color,GrayText)")
      expect(clear.style.opacity).toBe("1")
    })
  })
  it("preserves system-disabled color and opacity in top-level forced colors", () => {
    inspect(rules => {
      const forced = rules.find(rule => rule.type === CSSRule.MEDIA_RULE && (rule as CSSMediaRule).conditionText === "(forced-colors: active)") as CSSMediaRule
      expect(forced).toBeDefined()
      const disabled = forced.cssRules[1] as CSSStyleRule
      expect(disabled.selectorText).toContain("[data-cascader-clear]")
      expect(disabled.selectorText).toContain(":disabled")
      expect(disabled.style.color).toBe("GrayText")
      expect(disabled.style.opacity).toBe("1")
    })
  })
})
