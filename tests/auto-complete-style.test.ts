import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "auto-complete", "auto-complete.css"), "utf8")
let style: HTMLStyleElement | undefined
function install() {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
  return [...style.sheet!.cssRules] as CSSStyleRule[]
}
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("Auto Complete native field styles", () => {
  it("keeps the strict 1000-byte CSS budget with no Input stylesheet dependency", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
    expect(css).not.toContain("@import")
    expect(css).not.toContain("--mui-input-")
    expect(css).not.toContain("animation")
    expect(css).not.toContain("transition")
  })

  it("matches retained size defaults without writing public author tokens", () => {
    const rules = install()
    const root = rules.find(rule => rule.selectorText?.startsWith(".mui-auto-complete:where"))!
    expect(root.style.getPropertyValue("--_ac-h")).toBe("34px")
    expect(root.style.getPropertyValue("--_ac-f")).toBe("14px")
    const small = rules.find(rule => rule.selectorText === ".mui-auto-complete[data-size=small]")!
    const large = rules.find(rule => rule.selectorText === ".mui-auto-complete[data-size=large]")!
    expect(small.style.getPropertyValue("--_ac-h")).toBe("28px")
    expect(large.style.getPropertyValue("--_ac-h")).toBe("40px")
    expect(large.style.getPropertyValue("--_ac-f")).toBe("15px")
    for (const rule of [root, small, large]) expect(rule.style.getPropertyValue("--mui-auto-complete-height")).toBe("")
  })

  it("leaves Input-owned field paint and control sizing to Input in either load order", () => {
    const rules = install()
    const owned = ["padding-inline", "background", "color", "font", "block-size", "border", "outline", "box-shadow", "color-scheme"]
    for (const rule of rules.filter(rule => rule.selectorText?.includes("mui-auto-complete__field"))) {
      if (owned.some(property => rule.style.getPropertyValue(property))) {
        expect(rule.selectorText).toContain(":not(.mui-input)")
      }
    }
    const input = rules.find(rule => rule.selectorText === ".mui-auto-complete__field:not(.mui-input)>input")!
    expect(input.style.getPropertyValue("font")).toBe("inherit")
    expect(input.style.getPropertyValue("block-size").replace(/\s/g, "")).toBe("var(--mui-auto-complete-height,var(--_ac-h,34px))")
  })

  it("preserves native value, suggestions and author styles without popup semantics", () => {
    document.body.innerHTML = '<label for="entry">Entry</label><div class="mui-auto-complete__field" style="--mui-auto-complete-height:42px"><input id="entry" list="choices" value="Unlisted"></div><datalist id="choices"><option value="First" label="Label"></option></datalist>'
    const input = document.querySelector("input")!
    const option = document.querySelector("option")!
    const before = document.body.innerHTML
    install()
    expect(input.value).toBe("Unlisted")
    expect(input.list).toBe(document.querySelector("datalist"))
    expect(input.list!.options[0]).toBe(option)
    expect(document.body.innerHTML).toBe(before)
    expect(input.hasAttribute("role") || input.hasAttribute("aria-expanded")).toBe(false)
  })

  it("does not reveal native hidden roots or field wrappers", () => {
    document.body.innerHTML = '<div class="mui-auto-complete" hidden>Hidden root</div><div class="mui-auto-complete__field" hidden><input></div>'
    install()
    for (const node of document.querySelectorAll("[hidden]")) expect(getComputedStyle(node).display).toBe("none")
  })

  it("keeps readable standalone print/forced colors and native placeholder colors", () => {
    install()
    expect(css).toContain("forced-colors:active),print")
    expect(css).toContain("input:disabled::placeholder")
    expect(css).toContain("#d1d1d1")
    const print = [...style!.sheet!.cssRules].find(rule => "conditionText" in rule && rule.conditionText === "print") as CSSMediaRule
    expect((print.cssRules[0] as CSSStyleRule).style.getPropertyValue("color-scheme")).toBe("light")
  })

  it("supplies a real forced-color focused outline without styling Input-owned fields", () => {
    install()
    const media = [...style!.sheet!.cssRules].find(rule =>
      "conditionText" in rule && String(rule.conditionText).replace(/\s/g, "") === "(forced-colors:active),print"
    ) as CSSMediaRule
    const focus = [...media.cssRules].find(rule =>
      "selectorText" in rule && String(rule.selectorText).includes(":focus-within::before")
    ) as CSSStyleRule
    expect(focus.selectorText).toContain(":not(.mui-input)")
    expect(focus.style.getPropertyValue("outline")).toBe("2px solid Highlight")
    expect(css).toContain(":not(:has(>input:disabled))")
    expect(css).toContain(":where(:not([hidden]))")
  })
})
