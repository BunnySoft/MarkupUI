import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "pagination", "pagination.css"), "utf8")
function withRules(check: (rules: CSSStyleRule[]) => void) {
  const style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  try { check([...style.sheet!.cssRules] as CSSStyleRule[]) } finally { style.remove() }
}

describe("Pagination default styles", () => {
  it("keeps public size overrides above the 22/28/34px presets", () => {
    withRules(rules => {
      const root = rules.find(rule => rule.selectorText === ".mui-pagination")!
      expect(root.style.getPropertyValue("--_mui-pagination-size")).toBe("28px")
      expect(root.style.getPropertyValue("--_mui-pagination-font")).toBe("14px")
      const small = rules.find(rule => rule.selectorText === ".mui-pagination--small")!
      const large = rules.find(rule => rule.selectorText === ".mui-pagination--large")!
      expect(small.style.getPropertyValue("--_mui-pagination-size")).toBe("22px")
      expect(small.style.getPropertyValue("--_mui-pagination-font")).toBe("12px")
      expect(large.style.getPropertyValue("--_mui-pagination-size")).toBe("34px")
      expect(small.style.getPropertyValue("--mui-pagination-size")).toBe("")
    })
  })

  it("uses transparent page surfaces with theme-specific current and disabled borders", () => {
    withRules(rules => {
      const page = rules.find(rule => rule.selectorText === ".mui-pagination [data-pagination-pages] > button")!
      expect(page.style.getPropertyValue("border-color")).toBe("transparent")
      const current = rules.find(rule => rule.style?.getPropertyValue("background") === "var(--mui-pagination-current, transparent)")!
      expect(current.style.getPropertyValue("font-weight")).toBe("")
      expect(current.style.getPropertyValue("border-color")).toContain("--mui-pagination-active-border")
      const dark = rules.find(rule => rule.selectorText === ':where([data-mui-theme="dark"])')!
      expect(dark.style.getPropertyValue("--_mui-pagination-active-alpha")).toBe("52%")
      expect(dark.style.getPropertyValue("--_mui-pagination-control-border")).toBe("transparent")
      expect(dark.style.getPropertyValue("--_mui-pagination-disabled-bg")).toBe("rgba(255, 255, 255, .06)")
    })
  })

  it("does not recolor disabled or current pages through passive hover styling", () => {
    withRules(rules => {
      const hover = rules.find(rule => rule.style?.getPropertyValue("background") === "var(--mui-pagination-hover, transparent)")!
      expect(hover.selectorText).toContain("button:enabled")
      expect(hover.selectorText).toContain(':not([aria-current="page"])')
      const disabled = rules.find(rule => rule.selectorText === ".mui-pagination :is(button, select, input):disabled")!
      expect(disabled.style.getPropertyValue("opacity")).toBe("")
      expect(disabled.style.getPropertyValue("color")).toContain("--mui-pagination-disabled-color")
    })
  })

  it("styles the native auxiliary controls without replacing their appearance or layout order", () => {
    withRules(rules => {
      const controls = rules.find(rule => rule.style?.getPropertyValue("background").includes("--mui-pagination-control-background"))!
      expect(controls.selectorText).toContain("select[data-pagination-size]")
      expect(controls.selectorText).toContain("input[data-pagination-jump]")
    })
    expect(css).toContain("var(--mui-pagination-jump-width, 60px)")
    expect(css).toContain("var(--mui-pagination-control-background")
    expect(css).not.toContain("appearance: none")
    expect(css).not.toMatch(/(^|[;{])\s*order\s*:/m)
    expect(css).toContain("flex-wrap: wrap")
    expect(css).toContain("color: black !important")
    expect(css).toContain("background: white !important")
    const print = css.slice(css.indexOf("@media print"))
    expect(print).toContain(".mui-pagination { break-inside: avoid; color: black; }")
    expect(print).toContain(".mui-pagination :is(button, a, input, select)")
  })
})
