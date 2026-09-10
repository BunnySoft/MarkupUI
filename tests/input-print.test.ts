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
  it("retains the fixed 1750-byte stylesheet ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1750)
  })

  it("uses light print colors for roots, groups and labels without replacing author tokens", () => {
    const print = install().find(rule => "conditionText" in rule && rule.conditionText === "print") as CSSMediaRule
    const rule = print.cssRules[0] as CSSStyleRule
    expect(rule.selectorText.replace(/\s/g, "")).toBe(".mui-input,.mui-input-group,.mui-input-group-label")
    expect(rule.style.getPropertyValue("color-scheme")).toBe("light")
    expect(rule.style.getPropertyPriority("color-scheme")).toBe("")
    expect(rule.style.length).toBe(1)
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
