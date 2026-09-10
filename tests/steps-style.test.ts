import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "steps", "steps.css"), "utf8")
let style: HTMLStyleElement | undefined
function install() {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  return [...style.sheet!.cssRules] as CSSStyleRule[]
}
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("Steps retained native appearance", () => {
  it("keeps the unchanged 1250-byte CSS ceiling and native media fallbacks", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1250)
    expect(css).toContain("forced-colors")
    expect(css).toContain("@media print")
    expect(css).not.toContain("animation")
    expect(css).not.toContain("transition")
  })

  it("uses private light/dark role defaults and correct normal semantic colors", () => {
    const rules = install()
    const themes = rules.filter(rule => rule.selectorText?.includes("data-mui-theme"))
    expect(themes).toHaveLength(2)
    for (const rule of themes) {
      for (let i = 0; i < rule.style.length; i++) expect(rule.style[i]).toMatch(/^--_steps-/)
    }
    expect(css).toContain("--_steps-p: #63e2b7")
    expect(css).toContain("--_steps-e: #e88080")
    expect(css).toContain("--_steps-w: rgb(255 255 255 / .38)")
    expect(css).toContain("var(--mui-color-primary, var(--_steps-p, #18a058))")
    expect(css).toContain("var(--mui-color-error, var(--_steps-e, #d03050))")
  })

  it("keeps explicit status paint independent of current position and public marker overrides", () => {
    const rules = install()
    const finish = rules.find(rule => rule.selectorText === ".mui-steps>.mui-step[data-step-state=finish]")!
    const process = rules.find(rule => rule.selectorText === ".mui-steps>.mui-step[data-step-state=process]")!
    const error = rules.find(rule => rule.selectorText === ".mui-steps>.mui-step[data-step-state=error]")!
    for (const rule of [finish, process, error]) expect(rule.style.getPropertyValue("--mui-steps-marker")).toBe("")
    expect(finish.style.getPropertyValue("--_step-l")).toBe("var(--_step-a)")
    expect(process.style.getPropertyValue("--_step-t")).toBe("var(--_steps-h, #1f2225)")
    expect(error.style.getPropertyValue("--_step-d")).toBe("var(--_step-a)")
    expect(css).not.toContain(":nth-child")
  })

  it("matches retained title/description density without manufacturing circular nodes", () => {
    const rules = install()
    const title = rules.find(rule => rule.selectorText === ".mui-step__body>[data-step-title]")!
    expect(title.style.getPropertyValue("line-height")).toBe("1")
    expect(title.style.getPropertyValue("font-weight")).toBe("500")
    expect(rules.find(rule => rule.selectorText === ".mui-steps")!.style.getPropertyValue("--_steps-font")).toBe("16px")
    expect(rules.find(rule => rule.selectorText === ".mui-steps--small")!.style.getPropertyValue("--_steps-font")).toBe("14px")
    expect(rules.find(rule => rule.selectorText === ".mui-step__body>p")!.style.getPropertyValue("margin-block")).toBe("12px 0")
    const icon = rules.find(rule => rule.selectorText === ".mui-step__layout>.mui-step__icon")!
    expect(icon.style.getPropertyValue("box-shadow")).toBe("")
    expect(icon.style.getPropertyValue("background")).toBe("")
    expect(css.replace(/\s/g, "")).toContain("list-style:decimaloutside")
  })

  it("keeps native connector clearance, one-pixel strokes and author content untouched", () => {
    document.body.innerHTML = '<ol class="mui-steps" style="--mui-steps-gap:30px;--mui-steps-marker:purple"><li class="mui-step" data-step-state="finish"><div class="mui-step__layout"><span class="mui-step__icon" aria-hidden="true">✓</span><div class="mui-step__body"><h2 data-step-title>Original</h2><span data-step-status-text>Completed</span><p>Description</p><button type="button" data-step-action>Select</button></div></div></li></ol>'
    const before = document.body.innerHTML
    const rules = install()
    expect(rules.find(rule => rule.selectorText === ".mui-steps>.mui-step")!.style.getPropertyValue("padding-inline-end")).toBe(".75rem")
    expect(rules.find(rule => rule.selectorText === ".mui-steps>.mui-step::after")!.style.getPropertyValue("border-block-start")).toContain("1px solid")
    expect(document.body.innerHTML).toBe(before)
    expect(document.querySelector("button")!.disabled).toBe(false)
    expect(getComputedStyle(document.querySelector("ol")!).getPropertyValue("--mui-steps-marker")).toBe("purple")
  })

  it("resets every explicit text and marker color for print without overriding author priority", () => {
    const rules = install()
    const media = [...style!.sheet!.cssRules].find(rule =>
      "conditionText" in rule && String(rule.conditionText).replace(/\s/g, "") === "(forced-colors:active),print"
    ) as CSSMediaRule
    expect(media).toBeDefined()
    const reset = media.cssRules[0] as CSSStyleRule
    expect(reset.selectorText).toBe(".mui-steps")
    for (const name of ["--mui-steps-color", "--mui-steps-marker", "--mui-steps-line"]) {
      expect(reset.style.getPropertyValue(name)).toBe("CanvasText")
      expect(reset.style.getPropertyPriority(name)).toBe("")
    }
    for (const selector of [".mui-step__body>[data-step-title]", ".mui-step__body>p"]) {
      expect(rules.find(rule => rule.selectorText === selector)!.style.getPropertyValue("color")).toContain("--mui-steps-color")
    }
    for (const selector of [".mui-steps>.mui-step::marker", ".mui-step__layout>.mui-step__icon"]) {
      expect(rules.find(rule => rule.selectorText === selector)!.style.getPropertyValue("color")).toContain("--mui-steps-marker")
    }
    const print = [...style!.sheet!.cssRules].find(rule =>
      "conditionText" in rule && rule.conditionText === "print"
    ) as CSSMediaRule
    const printRoot = print.cssRules[0] as CSSStyleRule
    expect(printRoot.style.getPropertyValue("color-scheme")).toBe("light")
    expect(printRoot.style.getPropertyPriority("color-scheme")).toBe("")
  })
})
