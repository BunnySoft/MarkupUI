import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "progress", "progress.css"), "utf8")

function withRules(check: (rules: CSSRule[]) => void): void {
  const style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  try { check([...style.sheet!.cssRules]) } finally { style.remove() }
}

describe("Progress default styles", () => {
  it("uses the info fill palette and scoped neutral rails instead of legacy primary colors", () => {
    withRules((rules) => {
      const defaults = rules.find((rule) => (rule as CSSStyleRule).selectorText === "mui-progress[data-mui-progress]") as CSSStyleRule
      expect(defaults.style.getPropertyValue("--_mui-progress-tone")).toBe("var(--mui-color-info, #2080f0)")
      const light = rules.find((rule) => (rule as CSSStyleRule).selectorText === ':where([data-mui-theme="light"])') as CSSStyleRule
      const dark = rules.find((rule) => (rule as CSSStyleRule).selectorText === ':where([data-mui-theme="dark"])') as CSSStyleRule
      expect(light.style.getPropertyValue("--_mui-progress-default-rail")).toBe("#ebebeb")
      expect(dark.style.getPropertyValue("--_mui-progress-default-rail")).toBe("rgba(255, 255, 255, .12)")
      const webkitRail = rules.find((rule) => (rule as CSSStyleRule).selectorText?.endsWith("::-webkit-progress-bar")) as CSSStyleRule
      expect(webkitRail.style.getPropertyValue("background")).toBe("transparent")
    })
  })

  it("replaces decorative status glyphs with scalable masks without hiding inside or unknown values", () => {
    withRules((rules) => {
      const masks = rules.filter((rule) => (rule as CSSStyleRule).style?.getPropertyValue("--_mui-progress-status-mask").startsWith("url(")) as CSSStyleRule[]
      expect(masks).toHaveLength(4)
      expect(masks.every((rule) => rule.style.getPropertyValue("--_mui-progress-status-mask").includes("data:image/svg+xml"))).toBe(true)
      const replacement = rules.find((rule) => (rule as CSSStyleRule).style?.getPropertyValue("font-size") === "0") as CSSStyleRule
      expect(replacement.selectorText).toContain("[data-mui-progress-indeterminate]")
      expect(replacement.selectorText).toContain('[data-mui-progress-placement="inside"]')
      expect(replacement.selectorText).toContain('[data-mui-progress-type="multiple-circle"]')
    })
  })

  it("matches the two-second processing sweep and disables motion under reduced motion", () => {
    withRules((rules) => {
      const sweep = rules.find((rule) => (rule as CSSKeyframesRule).name === "mui-progress-shine") as CSSKeyframesRule
      const frames = [...sweep.cssRules] as CSSKeyframeRule[]
      expect(frames.map((frame) => frame.style.getPropertyValue("opacity"))).toEqual(["1", "0"])
      expect(frames[0]?.style.getPropertyValue("width")).toBe("0")
      expect(frames[1]?.style.getPropertyValue("width")).toContain("--_mui-progress-percent")
      const processing = rules.find((rule) => (rule as CSSStyleRule).style?.getPropertyValue("animation").includes("mui-progress-shine")) as CSSStyleRule
      expect(processing.style.getPropertyValue("animation")).toBe("mui-progress-shine 2s cubic-bezier(.4, 0, .2, 1) infinite")
      const reduced = rules.find((rule) => rule.type === CSSRule.MEDIA_RULE) as CSSMediaRule
      expect(reduced.conditionText).toBe("(prefers-reduced-motion: reduce)")
      expect((reduced.cssRules[0] as CSSStyleRule).style.getPropertyValue("animation")).toBe("none")
      expect((reduced.cssRules[1] as CSSStyleRule).style.getPropertyValue("transition")).toBe("none")
    })
  })
})
