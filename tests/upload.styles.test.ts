import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "upload", "upload.css"), "utf8")
const compact = (value: string) => value.replace(/\s+/g, "").replace(/="([a-z-]+)"\]/g, "=$1]")
const contains = (value: string) => expect(compact(css)).toContain(compact(value))
function withRules(check: (rules: CSSStyleRule[]) => void) {
  const style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  try { check([...style.sheet!.cssRules] as CSSStyleRule[]) } finally { style.remove() }
}

describe("Upload default styles", () => {
  it("keeps the source typography and drop geometry locally overridable", () => {
    withRules(rules => {
      const root = rules.find(rule => rule.selectorText === ".mui-upload")!
      const drop = rules.find(rule => rule.selectorText === ".mui-upload [data-upload-drop]")!
      expect(compact(root.style.getPropertyValue("font-size"))).toBe("var(--mui-upload-font-size,14px)")
      expect(root.style.getPropertyValue("line-height")).toBe("1.6")
      expect(compact(drop.style.getPropertyValue("padding"))).toBe("var(--mui-upload-drop-padding,24px)")
      expect(compact(drop.style.getPropertyValue("border-radius"))).toBe("var(--mui-upload-radius,3px)")
      expect(drop.style.getPropertyValue("cursor")).toBe("")
    })
  })

  it("resets local dark defaults in nested light scopes without assigning public tokens", () => {
    withRules(rules => {
      const light = rules.find(rule => compact(rule.selectorText ?? "") === ":where([data-mui-theme=light])")!
      const dark = rules.find(rule => compact(rule.selectorText ?? "") === ":where([data-mui-theme=dark])")!
      for (const token of Array.from({ length: dark.style.length }, (_, i) => dark.style[i]!)) {
        expect(token.startsWith("--_mui-upload-")).toBe(true)
        expect(light.style.getPropertyValue(token)).toBe("initial")
      }
      expect(dark.style.getPropertyValue("--_mui-upload-error")).toBe("#e88080")
      expect(dark.style.getPropertyValue("--_mui-upload-rail")).toBe("rgba(255,255,255,.12)")
    })
  })

  it("guards disabled action/drop hover and keeps status text independent of error color", () => {
    contains('button:enabled:not([aria-disabled="true"]):hover')
    contains('.mui-upload:not(:has(input:disabled)) [data-upload-drop]')
    contains('.mui-upload li[data-upload-state="error"]:hover')
    contains('rgba(208,48,80,.06)')
    contains('[data-upload-state="error"] [data-upload-name]')
    expect(css).not.toContain('border-inline-start:')
  })

  it("retains complete row actions and gives progress the full row width", () => {
    withRules(rules => {
      const row = rules.find(rule => compact(rule.selectorText ?? "") === ".mui-upload[data-upload-list]>li")!
      expect(row.style.getPropertyValue("padding")).toBe("6px 12px 6px 6px")
      const full = rules.find(rule => rule.selectorText?.includes("[data-upload-row-actions],"))!
      expect(full.style.getPropertyValue("grid-column")).toBe("1 / -1")
    })
    contains("overflow-wrap: anywhere")
    contains("@media (max-width: 40rem)")
  })

  it("only replaces determinate progress paint and avoids a double-composited WebKit rail", () => {
    withRules(rules => {
      const progress = rules.find(rule => rule.selectorText === ".mui-upload progress[value]")!
      const rail = rules.find(rule => rule.selectorText === ".mui-upload progress::-webkit-progress-bar")!
      expect(progress.style.getPropertyValue("appearance")).toBe("none")
      expect(progress.style.getPropertyValue("block-size")).toBe("2px")
      expect(rail.style.getPropertyValue("background")).toBe("transparent")
      const base = rules.find(rule => rule.selectorText === ".mui-upload [data-upload-progress]")!
      expect(base.style.getPropertyValue("appearance")).toBe("")
    })
    expect(css).not.toContain("animation:")
  })

  it("keeps native file controls/focus, high contrast and printed status readable", () => {
    contains('input[type="file"]::file-selector-button')
    contains(".mui-upload :focus-visible")
    contains("color: CanvasText !important")
    contains("appearance: auto !important")
    contains("color: black !important; background: white !important")
    expect(compact(css)).not.toContain("input[type=file]{display:none")
  })

  it("uses unfaded system-disabled colors for native and aria-disabled controls in forced colors only", () => {
    withRules(rules => {
      const media = rules.find(rule => rule instanceof CSSMediaRule
        && compact(rule.conditionText) === "(forced-colors:active)") as CSSMediaRule | undefined
      expect(media).toBeDefined()
      const disabled = [...media!.cssRules].find(rule => rule instanceof CSSStyleRule
        && rule.style.getPropertyValue("color") === "GrayText") as CSSStyleRule
      const selector = compact(disabled.selectorText)
      expect(selector).toContain(":is([aria-disabled=true],button:disabled,input:disabled)")
      expect(selector).toContain(':has(input:disabled)[data-upload-drop]')
      expect(selector).toContain("input:is(:disabled,[aria-disabled=true])::file-selector-button")
      expect(disabled.style.getPropertyValue("opacity")).toBe("1")
      expect(disabled.style.getPropertyValue("border-color")).toBe("GrayText")
      expect(disabled.style.getPropertyPriority("color")).toBe("important")
      expect(disabled.style.getPropertyPriority("border-color")).toBe("important")
      const screen = rules.find(rule => compact(rule.selectorText ?? "").includes("[aria-disabled=true]")
        && rule.style.getPropertyValue("opacity") === ".5")!
      expect(screen).toBeDefined()
      expect(screen.style.getPropertyValue("color")).toBe("")
    })
  })

  it("stays inside the existing 1250-byte level-nine CSS ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1250)
  })
})
