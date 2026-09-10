import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "skeleton", "skeleton.css"), "utf8")

function withRules(check: (rules: CSSRule[]) => void): void {
  const style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  try { check([...style.sheet!.cssRules]) } finally { style.remove() }
}

describe("Skeleton default styles", () => {
  it("animates the two color endpoints at the upstream phases without fading opacity", () => {
    withRules((rules) => {
      const pulse = rules.find((rule) => rule.type === CSSRule.KEYFRAMES_RULE) as CSSKeyframesRule
      expect(pulse.name).toBe("mui-skeleton-pulse")
      const frames = [...pulse.cssRules] as CSSKeyframeRule[]
      expect(frames.map((frame) => frame.keyText.split(",").map((key) => key.trim()))).toEqual([["0%", "80%", "100%"], ["40%"]])
      expect(frames[0]?.style.getPropertyValue("background-color")).toContain("--mui-skeleton-color,")
      expect(frames[1]?.style.getPropertyValue("background-color")).toContain("--mui-skeleton-color-end,")
      expect(frames.every((frame) => !frame.style.getPropertyValue("opacity"))).toBe(true)
    })
  })

  it("shares the default animation between static spans and generated bars", () => {
    withRules((rules) => {
      const surface = rules.find((rule) => (rule as CSSStyleRule).style?.getPropertyValue("animation").includes("mui-skeleton-pulse")) as CSSStyleRule
      expect(surface.selectorText).toContain(".mui-skeleton")
      expect(surface.selectorText).toContain("[data-mui-skeleton-item]")
      expect(surface.style.getPropertyValue("animation")).toBe("mui-skeleton-pulse 2s cubic-bezier(.36, 0, .64, 1) infinite")
      expect(surface.style.getPropertyValue("background")).toContain("--mui-skeleton-color")
    })
  })

  it("defines scoped light and dark endpoints and stops motion in reduced-motion mode", () => {
    withRules((rules) => {
      const light = rules.find((rule) => (rule as CSSStyleRule).selectorText === ':where([data-mui-theme="light"])') as CSSStyleRule
      const dark = rules.find((rule) => (rule as CSSStyleRule).selectorText === ':where([data-mui-theme="dark"])') as CSSStyleRule
      expect(light.style.getPropertyValue("--_mui-skeleton-color-start")).toBe("#eee")
      expect(light.style.getPropertyValue("--_mui-skeleton-color-end")).toBe("#ddd")
      expect(dark.style.getPropertyValue("--_mui-skeleton-color-start")).toBe("rgba(255, 255, 255, .12)")
      expect(dark.style.getPropertyValue("--_mui-skeleton-color-end")).toBe("rgba(255, 255, 255, .18)")
      const reduced = rules.find((rule) => rule.type === CSSRule.MEDIA_RULE) as CSSMediaRule
      expect(reduced.conditionText).toBe("(prefers-reduced-motion: reduce)")
      const surface = reduced.cssRules[0] as CSSStyleRule
      expect(surface.selectorText).toContain(".mui-skeleton")
      expect(surface.selectorText).toContain("[data-mui-skeleton-item]")
      expect(surface.style.getPropertyValue("animation")).toBe("none")
      expect(surface.style.getPropertyValue("transition")).toBe("none")
    })
  })
})
