import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "input-otp", "input-otp.css"), "utf8")
const compact = (value: string) => value.replace(/\s+/g, "").replace(/="([a-z-]+)"\]/g, "=$1]")
function withRules(check: (rules: CSSStyleRule[]) => void) {
  const style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  try { check([...style.sheet!.cssRules] as CSSStyleRule[]) } finally { style.remove() }
}
const selector = (rule: CSSStyleRule) => compact(rule.selectorText ?? "")

describe("Input OTP single-field default styles", () => {
  it("matches source field heights and font sizes without overwriting public size tokens", () => {
    withRules(rules => {
      const base = rules.find(rule => selector(rule) === ".mui-input-otp")!
      expect(compact(base.style.getPropertyValue("block-size"))).toBe("var(--mui-input-otp-height,var(--_mui-otp-height,34px))")
      expect(compact(base.style.getPropertyValue("font"))).toContain("var(--_mui-otp-font,14px)")
      for (const [size, height] of [["small", "28px"], ["large", "40px"]]) {
        const rule = rules.find(rule => selector(rule) === `.mui-input-otp[data-size=${size}]`)!
        expect(rule.style.getPropertyValue("--_mui-otp-height")).toBe(height)
        expect(rule.style.getPropertyValue("--mui-input-otp-height")).toBe("")
      }
      expect(rules.find(rule => selector(rule) === ".mui-input-otp[data-size=large]")!
        .style.getPropertyValue("--_mui-otp-font")).toBe("15px")
    })
  })

  it("includes the authored character gap in width while preserving native LTR text and block sizing", () => {
    withRules(rules => {
      const base = rules.find(rule => selector(rule) === ".mui-input-otp")!
      expect(compact(base.style.getPropertyValue("inline-size")))
        .toBe("calc(var(--mui-input-otp-length,6)*(1ch+var(--mui-input-otp-gap,8px))+2*var(--mui-input-otp-padding,12px)+2px)")
      expect(compact(base.style.getPropertyValue("letter-spacing"))).toBe("var(--mui-input-otp-gap,8px)")
      expect(base.style.getPropertyValue("direction")).toBe("ltr")
      expect(base.style.getPropertyValue("unicode-bidi")).toBe("isolate")
      expect(base.style.getPropertyValue("max-inline-size")).toBe("100%")
      expect(rules.find(rule => selector(rule) === ".mui-input-otp[data-block]")!
        .style.getPropertyValue("inline-size")).toBe("100%")
    })
  })

  it("selects local light/dark color and shadow defaults, including nested light reset", () => {
    withRules(rules => {
      for (const theme of ["light", "dark"]) {
        const rule = rules.find(rule => selector(rule) === `:where([data-mui-theme=${theme}])`)!
        expect(rule.style.getPropertyValue("--_mui-otp-scheme")).toBe(theme)
        expect(rule.style.getPropertyValue("--_mui-otp-shadow")).toBe(theme === "light" ? "0 0 0 2px" : "0 0 8px 0")
      }
    })
    expect(compact(css)).toContain("light-dark(#333639,rgba(255,255,255,.82))")
    expect(compact(css)).toContain("light-dark(#c2c2c2,rgba(255,255,255,.38))")
    expect(compact(css)).toContain("light-dark(#d1d1d1,rgba(255,255,255,.28))")
  })

  it("preserves the aria-invalid dashed cue without converting local completion into validation success", () => {
    withRules(rules => {
      const error = rules.find(rule => selector(rule) === ".mui-input-otp[aria-invalid=true]")!
      expect(error.style.getPropertyValue("border-style")).toBe("dashed")
      expect(compact(error.style.getPropertyValue("--_mui-otp-tone"))).toContain("light-dark(#d03050,#e88080)")
      const complete = rules.find(rule => selector(rule) === ".mui-input-otp-status[data-input-otp-state=complete]")!
      expect(complete.style.getPropertyValue("font-weight")).toBe("600")
      expect(complete.style.getPropertyValue("color")).toBe("")
    })
    expect(css).not.toContain(":invalid")
  })

  it("avoids adding a second focus/disabled surface inside the shared Input owner", () => {
    withRules(rules => {
      const focus = rules.find(rule => selector(rule) === ".mui-input-otp:not([data-input-control]):enabled:focus")!
      expect(focus.style.getPropertyValue("box-shadow")).not.toBe("")
      const disabled = rules.find(rule => selector(rule) === ".mui-input-otp:not([data-input-control]):disabled")!
      expect(disabled.style.getPropertyValue("opacity")).toBe("")
      const outline = rules.find(rule => selector(rule) === ".mui-input-otp:focus-visible")!
      expect(outline.style.getPropertyValue("outline")).toBe("2px solid Highlight")
    })
  })

  it("uses unfaded GrayText disabled/placeholder paint in forced colors and black text in dark print", () => {
    withRules(rules => {
      const forced = rules.find(rule => rule instanceof CSSMediaRule
        && compact(rule.conditionText) === "(forced-colors:active)") as CSSMediaRule
      const disabled = [...forced.cssRules].find(rule => rule instanceof CSSStyleRule
        && rule.selectorText.includes(":disabled")) as CSSStyleRule
      expect(disabled.style.getPropertyValue("color")).toBe("GrayText")
      expect(disabled.style.getPropertyValue("border-color")).toBe("GrayText")
      expect(disabled.style.getPropertyValue("opacity")).toBe("1")
      expect(disabled.style.getPropertyPriority("color")).toBe("important")
      const print = rules.find(rule => rule instanceof CSSMediaRule && rule.conditionText === "print") as CSSMediaRule
      const paint = print.cssRules[0] as CSSStyleRule
      expect(paint.selectorText).toContain("::placeholder")
      expect(paint.selectorText).toContain(".mui-input-otp-status")
      expect(paint.style.getPropertyValue("color")).toBe("black")
      expect(paint.style.getPropertyPriority("color")).toBe("important")
      expect(paint.style.getPropertyValue("background")).toBe("white")
    })
  })

  it("keeps real editing and password presentation instead of painting synthetic digit cells", () => {
    for (const forbidden of ["content:", "appearance:none", "text-security", "animation:", "user-select:none"]) {
      expect(compact(css)).not.toContain(forbidden)
    }
  })

  it("fits the existing 1000-byte ceiling in LF and Windows checkout form", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
    expect(gzipSync(css.replace(/\r?\n/g, "\r\n"), { level: 9 }).length).toBeLessThanOrEqual(1000)
  })
})
