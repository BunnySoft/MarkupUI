import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "tabs", "tabs.css"), "utf8")
let style: HTMLStyleElement | undefined
function install() {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  return [...style.sheet!.cssRules] as CSSStyleRule[]
}
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("Tabs retained default styles", () => {
  it("keeps the strict 1750-byte source budget and existing native media policies", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1750)
    expect(css).toContain("prefers-reduced-motion")
    expect(css).toContain("forced-colors")
    expect(css).toContain("@media print")
    expect(css).not.toContain("@import")
  })

  it("defines private palette fallbacks while retaining correct shared primary-color ownership", () => {
    const rules = install()
    const themeRules = rules.filter(rule => rule.selectorText?.includes("data-mui-theme"))
    expect(themeRules).toHaveLength(2)
    for (const rule of themeRules) {
      for (let i = 0; i < rule.style.length; i++) expect(rule.style[i]).toMatch(/^--_tabs-/)
    }
    expect(css).toContain("var(--mui-color-primary, var(--_tabs-primary, #18a058))")
    expect(css).toContain("--_tabs-primary: #63e2b7")
    expect(css).toContain("--_tabs-body: rgb(255 255 255 / .82)")
    expect(css).toContain("--_tabs-segment: rgb(255 255 255 / .1)")
    expect(css).not.toContain("--mui-text-primary")
    expect(css).not.toContain("--mui-bg-surface")
  })

  it("keeps size/type defaults private so public padding remains authoritative", () => {
    document.body.innerHTML = '<div class="mui-tabs mui-tabs--large" data-tabs-type="card" style="--mui-tabs-tab-padding:7px 13px"><button data-tabs-tab type="button">Tab</button></div>'
    const rules = install()
    const root = document.querySelector(".mui-tabs")!
    expect(getComputedStyle(root).getPropertyValue("--_tabs-size")).toBe("1")
    expect(getComputedStyle(root).getPropertyValue("--_tabs-font")).toBe("16px")
    expect(getComputedStyle(root).getPropertyValue("--mui-tabs-tab-padding")).toBe("7px 13px")
    expect(css).toContain("var(--mui-tabs-tab-padding, var(--_tabs-pad))")
    expect(css).toContain("--_tabs-gap: 36px")
    expect(css).toContain("--_tabs-gap: 4px")
    expect(css).toContain("--_tabs-gap: 0")
    const small = rules.find(rule => rule.selectorText === ".mui-tabs--small")!
    expect(small.style.getPropertyValue("--mui-tabs-tab-padding")).toBe("")
  })

  it("uses native disabled buttons without fading their entire border/background", () => {
    document.body.innerHTML = '<div class="mui-tabs"><button type="button" data-tabs-tab disabled>Unavailable</button></div>'
    const before = document.body.innerHTML
    const rules = install()
    const disabled = rules.find(rule => rule.selectorText === ".mui-tabs [data-tabs-tab]:disabled")!
    expect(disabled.style.getPropertyValue("color")).toContain("--mui-tabs-disabled")
    expect(disabled.style.getPropertyValue("opacity")).toBe("")
    expect(disabled.style.getPropertyValue("pointer-events")).toBe("")
    expect(document.body.innerHTML).toBe(before)
    expect(document.querySelector("button")!.disabled).toBe(true)
  })

  it("keeps panes unboxed by default and preserves authored first-child spacing", () => {
    document.body.innerHTML = '<div class="mui-tabs"><section data-tabs-pane><h2 style="margin-block-start:17px">Authored heading</h2></section></div>'
    const rules = install()
    const pane = rules.find(rule => rule.selectorText === ".mui-tabs [data-tabs-pane]")!
    expect(pane.style.getPropertyValue("border")).toBe("")
    expect(pane.style.getPropertyValue("background")).toContain("transparent")
    expect(css).not.toContain("[data-tabs-pane] > :first-child")
    expect(getComputedStyle(document.querySelector("h2")!).marginBlockStart).toBe("17px")
  })

  it("uses local 2px indicators for line/bar and no extra underline for card/segment", () => {
    const rules = install()
    const indicator = rules.find(rule => rule.selectorText?.replaceAll('"', "") === '.mui-tabs [data-tabs-tab][aria-selected=true]::after')!
    expect(indicator.style.getPropertyValue("block-size")).toBe("2px")
    const suppressed = rules.find(rule => rule.selectorText?.includes("data-tabs-type=card") && rule.selectorText.includes("data-tabs-type=segment") && rule.selectorText.endsWith("::after"))!
    expect(suppressed.style.getPropertyValue("content")).toBe("none")
    expect(css).toMatch(/font-weight:\s*400/)
    expect(css).toMatch(/font-weight:\s*500/)
    expect(css).not.toContain(":has(")
  })

  it("maps pane padding to physical placements and logical start/end under RTL", () => {
    const rules = install()
    const normalized = (rule: CSSStyleRule) => rule.selectorText?.replaceAll('"', "").replace(/\s+/g, "")
    const pane = rules.find(rule => rule.selectorText === ".mui-tabs [data-tabs-pane]")!
    expect(pane.style.getPropertyValue("padding")).toBe("var(--mui-tabs-pane-padding, var(--_tabs-p))")
    const mappings = [
      ['.mui-tabs[data-tabs-placement=bottom][data-tabs-enhanced]', "0 0 var(--_tabs-i)"],
      ['.mui-tabs:is([data-tabs-placement=left],[data-tabs-placement=start])[data-tabs-enhanced]', "0 0 0 var(--_tabs-i)"],
      ['.mui-tabs:is([data-tabs-placement=right],[data-tabs-placement=end])[data-tabs-enhanced]', "0 var(--_tabs-i) 0 0"],
      ['.mui-tabs:is([data-tabs-placement=left],[data-tabs-placement=end]):dir(rtl)[data-tabs-enhanced]', "0 0 0 var(--_tabs-i)"],
      ['.mui-tabs:is([data-tabs-placement=right],[data-tabs-placement=start]):dir(rtl)[data-tabs-enhanced]', "0 var(--_tabs-i) 0 0"]
    ]
    for (const [selector, padding] of mappings) {
      expect(rules.find(rule => normalized(rule) === selector)!.style.getPropertyValue("--_tabs-p")).toBe(padding)
    }
    expect(rules.find(rule => rule.selectorText === ".mui-tabs")!.style.getPropertyValue("--_tabs-i")).toBe("calc(12px + var(--_tabs-size) * 4px)")
  })

  it("uses the distinct vertical-card density without overriding public padding", () => {
    const rules = install()
    expect(rules.find(rule => rule.selectorText === ".mui-tabs")!.style.getPropertyValue("--_tabs-v")).toBe("8px")
    expect(rules.find(rule => rule.selectorText === ".mui-tabs[data-tabs-type=card]")!.style.getPropertyValue("--_tabs-v")).toBe("10px")
    const vertical = rules.find(rule => rule.selectorText === ".mui-tabs [aria-orientation=vertical] [data-tabs-tab]")!
    expect(vertical.style.getPropertyValue("padding")).toBe("var(--mui-tabs-tab-padding, calc(var(--_tabs-v) + var(--_tabs-size) * 2px) calc(16px + var(--_tabs-size) * 4px))")
  })

  it("never applies selected foreground to a disabled tab, including forced colors", () => {
    document.body.innerHTML = '<div class="mui-tabs"><button type="button" data-tabs-tab aria-selected="true" disabled>Transitioning</button></div>'
    const rules = install()
    const selected = rules.find(rule => rule.selectorText?.includes("aria-selected=true") && rule.style.getPropertyValue("color"))!
    expect(selected.selectorText).toContain(":not(:disabled)")
    expect(document.querySelector("button")!.matches(selected.selectorText)).toBe(false)
    const forced = [...style!.sheet!.cssRules].find(rule => "conditionText" in rule && String(rule.conditionText).replace(/\s/g, "") === "(forced-colors:active)") as CSSMediaRule
    expect((forced.cssRules[0] as CSSStyleRule).selectorText).toContain(":not(:disabled)")
  })
})
