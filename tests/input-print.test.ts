import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "input", "input.css"), "utf8")
let sheet: HTMLStyleElement | undefined
function install() {
  sheet = document.createElement("style")
  sheet.textContent = css
  document.head.append(sheet)
  return [...sheet.sheet!.cssRules]
}
afterEach(() => { sheet?.remove(); sheet = undefined; document.body.replaceChildren() })

describe("Input scoped print defaults", () => {
  it("retains the adjusted 1800-byte stylesheet ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1800)
  })

  it("uses light print colors for roots, groups and labels without replacing author tokens", () => {
    const print = install().find(rule => "conditionText" in rule && rule.conditionText === "print") as CSSMediaRule
    const rule = print.cssRules[0] as CSSStyleRule
    expect(rule.selectorText.replace(/\s/g, "")).toBe(".mui-input,.mui-input-group,.mui-input-group-label")
    expect(rule.style.getPropertyValue("color-scheme")).toBe("light")
    expect(rule.style.getPropertyPriority("color-scheme")).toBe("")
    expect(rule.style.length).toBe(1)
  })

  it("uses GrayText for a disabled wrapper boundary in forced colors", () => {
    const forced = install().filter(rule => "conditionText" in rule
      && rule.conditionText.replace(/\s/g, "") === "(forced-colors:active)") as CSSMediaRule[]
    const boundary = forced.flatMap(rule => [...rule.cssRules]).find(rule => rule instanceof CSSStyleRule
      && rule.selectorText === ".mui-input:has([data-input-control]:disabled)::before") as CSSStyleRule
    expect(boundary.style.getPropertyValue("border-color")).toBe("GrayText")
  })

  it("resets status wrapper paint and focus glow for print", () => {
    const print = install().filter(rule => "conditionText" in rule
      && rule.conditionText === "print") as CSSMediaRule[]
    const status = print.flatMap(rule => [...rule.cssRules]).find(rule => rule instanceof CSSStyleRule
      && rule.selectorText === ".mui-input[data-status]:not(:has([data-input-control]:disabled)):focus-within") as CSSStyleRule
    const boundary = print.flatMap(rule => [...rule.cssRules]).find(rule => rule instanceof CSSStyleRule
      && rule.selectorText === ".mui-input[data-status]:not(:has([data-input-control]:disabled)):focus-within::before") as CSSStyleRule
    expect(status.style.getPropertyValue("color")).toBe("#000")
    expect(status.style.getPropertyValue("background")).toBe("transparent")
    expect(boundary.style.getPropertyValue("border-color")).toBe("currentColor")
    expect(boundary.style.getPropertyValue("box-shadow")).toBe("none")
  })

  it("keeps the existing value, disabled and count color roles and native form nodes", () => {
    document.body.innerHTML = '<div class="mui-input" style="--mui-input-color:maroon;--mui-input-disabled:purple"><input data-input-control value="Original" disabled><span data-input-count>8 / 20</span></div>'
    const before = document.body.innerHTML
    const rules = install() as CSSStyleRule[]
    const disabled = rules.find(rule => rule.selectorText === ".mui-input:has([data-input-control]:disabled)")!
    expect(disabled.style.getPropertyValue("color")).toContain("var(--mui-input-disabled, light-dark(#c2c2c2")
    const count = rules.find(rule => rule.selectorText === ".mui-input [data-input-count]")!
    expect(count.style.getPropertyValue("color")).toContain("light-dark(#767c82")
    expect(document.body.innerHTML).toBe(before)
    expect(document.querySelector("input")!.value).toBe("Original")
    expect(document.querySelector("input")!.disabled).toBe(true)
  })
})
