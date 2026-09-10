import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "spin", "spin.css"), "utf8")

function withRules(check: (rules: CSSRule[]) => void): void {
  const style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  try { check([...style.sheet!.cssRules]) } finally { style.remove() }
}

describe("Spin default styles", () => {
  it("combines the upstream arc offsets and rotations in CSS without affecting custom icons", () => {
    withRules((rules) => {
      const arc = rules.find((rule) => (rule as CSSKeyframesRule).name === "mui-spin-arc") as CSSKeyframesRule
      const frames = [...arc.cssRules] as CSSKeyframeRule[]
      expect(frames.map((frame) => frame.style.getPropertyValue("stroke-dashoffset"))).toEqual(["567", "142", "567"])
      expect(frames.map((frame) => frame.style.getPropertyValue("transform"))).toEqual(["rotate(0deg)", "rotate(270deg)", "rotate(720deg)"])
      const motion = rules.find((rule) => (rule as CSSStyleRule).style?.getPropertyValue("animation").includes("mui-spin-arc")) as CSSStyleRule
      expect(motion.selectorText).toContain("[data-mui-spin-default] > [data-mui-spin-arc]")
      expect(motion.style.getPropertyValue("animation")).toBe("mui-spin-arc 1.6s linear infinite")
      expect(motion.style.getPropertyValue("transform-box")).toBe("view-box")
    })
  })

  it("keeps three-second default and two-second custom rotation with scoped reduced motion", () => {
    withRules((rules) => {
      const rotations = rules.filter((rule) => (rule as CSSStyleRule).style?.getPropertyValue("animation").includes("mui-spin-turn")) as CSSStyleRule[]
      expect(rotations.map((rule) => rule.style.getPropertyValue("animation"))).toEqual(["mui-spin-turn 3s linear infinite both", "mui-spin-turn 2s linear infinite"])
      const reduced = rules.find((rule) => rule.type === CSSRule.MEDIA_RULE) as CSSMediaRule
      expect(reduced.conditionText).toBe("(prefers-reduced-motion: reduce)")
      const motion = reduced.cssRules[0] as CSSStyleRule
      expect(motion.selectorText).toContain("[data-mui-spin-arc]")
      expect(motion.selectorText).toContain("[data-mui-spin-custom-icon]")
      expect(motion.style.getPropertyValue("animation")).toBe("none")
    })
  })

  it("dims wrapped content by theme without introducing upstream pointer blocking", () => {
    withRules((rules) => {
      const light = rules.find((rule) => (rule as CSSStyleRule).selectorText === ':where([data-mui-theme="light"])') as CSSStyleRule
      const dark = rules.find((rule) => (rule as CSSStyleRule).selectorText === ':where([data-mui-theme="dark"])') as CSSStyleRule
      expect(light.style.getPropertyValue("--_mui-spin-content-opacity")).toBe(".5")
      expect(dark.style.getPropertyValue("--_mui-spin-content-opacity")).toBe(".38")
      const content = rules.find((rule) => (rule as CSSStyleRule).selectorText?.includes("[data-mui-spin-active]")) as CSSStyleRule
      expect(content.style.getPropertyValue("opacity")).toContain("--mui-spin-content-opacity")
      expect(content.style.getPropertyValue("pointer-events")).toBe("")
    })
  })
})
