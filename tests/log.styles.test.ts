import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { createLog } from "../src/components/log/index.js"

const css = readFileSync(resolve("src", "components", "log", "log.css"), "utf8")
const code = readFileSync(resolve("src", "components", "code", "code.css"), "utf8")

describe("audited native Log presentation", () => {
  it("uses fixed reference typography and rounded line-count height without legacy panel insets", () => {
    expect(css).toContain("--mui-code-font-size: var(--mui-log-font-size, 14px)")
    expect(css).toContain("--mui-code-line-height: var(--mui-log-line-height, 1.25)")
    expect(css).toContain("--mui-code-padding: var(--mui-log-padding, 0px)")
    expect(css).toContain("round(nearest, var(--mui-log-rows, 15) * 1lh, 1px)")
    expect(css).toContain("block-size: var(--mui-log-height, calc(var(--mui-log-rows, 15) * 1lh")
    expect(css).not.toContain(".875rem")
    expect(css).not.toContain("+ 2px")
    expect(css).not.toContain("border-style: dashed")
  })

  it("wraps by default on screen while preserving explicit Code wrap and native nowrap overrides", () => {
    const screen = css.slice(css.indexOf("@media screen"), css.indexOf("@media print"))
    expect(screen).toContain('pre.mui-code-block[data-log-viewport]:not([data-word-wrap])')
    expect(screen).toContain("white-space: var(--mui-log-white-space, pre-wrap)")
    expect(screen).toContain("word-break: var(--mui-log-word-break, break-word)")
    expect(code).toContain("pre.mui-code-block[data-word-wrap]")
    expect(code).toContain("word-break: break-all")
    expect(css).toContain("overflow-anchor: none")
    expect(css).toContain("scroll-behavior: auto")
  })

  it("uses Code's measured digit-count gutter without changing retained empty line anatomy", () => {
    expect(css).toContain("--mui-code-gutter: var(--mui-log-gutter);")
    expect(css).not.toContain("5ch")
    expect(code).toContain("min-block-size: 1lh")
    expect(code).toContain("var(--_mui-code-gutter)) + 12px")
    expect(css).not.toContain("content:")
    expect(css).not.toContain(".mui-code-line")
  })

  it("keeps author styles, native text nodes, focus and loading ownership independent of CSS loading", () => {
    const root = document.createElement("section")
    root.className = "mui-log"; root.dataset.log = ""
    root.style.cssText = "--mui-log-font-size:19px;--mui-log-gutter:5ch;--mui-code-gutter:4ch;--mui-code-color:purple"
    root.innerHTML = '<pre class="mui-code-block" data-log-viewport tabindex="0" role="region" aria-label="Log" style="font-size:19px;line-height:2;white-space:pre"><code class="mui-code" data-log-output>first\npartial</code></pre><p data-log-loading hidden>Loading locally</p>'
    document.body.append(root)
    const pre = root.querySelector("pre")!, output = root.querySelector("code")!
    const rootStyle = root.getAttribute("style"), preStyle = pre.getAttribute("style")
    const log = createLog(root)
    const first = output.firstChild!, text = first.lastChild!
    const style = document.createElement("style")
    style.textContent = `${code}\n${css}`
    try {
      pre.focus()
      document.head.append(style)
      log.append(" tail")
      log.setLoading(true)
      expect(document.activeElement).toBe(pre)
      expect(output.firstChild).toBe(first)
      expect(first.lastChild).toBe(text)
      expect(output.textContent).toBe("first\npartial tail")
      expect(pre.getAttribute("aria-busy")).toBe("true")
      expect(root.querySelector<HTMLElement>("[data-log-loading]")!.hidden).toBe(false)
      expect(getComputedStyle(pre).fontSize).toBe("19px")
      expect(getComputedStyle(pre).whiteSpace).toBe("pre")
      expect(getComputedStyle(root).getPropertyValue("--mui-code-gutter")).toBe("4ch")
      log.disconnect()
      expect(root.getAttribute("style")).toBe(rootStyle)
      expect(pre.getAttribute("style")).toBe(preStyle)
      expect(output.querySelector("[style]")).toBeNull()
      expect(pre.hasAttribute("aria-busy")).toBe(false)
      expect(root.querySelector<HTMLElement>("[data-log-loading]")!.hidden).toBe(true)
    } finally { log.disconnect(); style.remove(); root.remove() }
  })

  it("provides a Log-local light print surface while retaining full native print and forced-color behavior", () => {
    const print = css.slice(css.indexOf("@media print"))
    expect(print).toContain(".mui-log { color-scheme: light; color: CanvasText; background: Canvas; }")
    expect(print).toContain(".mui-log :is(pre.mui-code-block, code.mui-code) { color: CanvasText; background: transparent; }")
    expect(print).toContain("[data-log-loading] { display: none; }")
    expect(code).toContain("block-size: auto !important")
    expect(code).toContain("overflow: visible !important")
    expect(code).toContain("@media (forced-colors: active)")
    expect(css).not.toContain("animation:")
    expect(css).not.toContain("forced-color-adjust")
  })

  it("stays within the composed Code plus Log stylesheet ceiling without imports or transforms", () => {
    expect(css).not.toContain("@import")
    expect(gzipSync(`${code}\n${css}`, { level: 9 }).length).toBeLessThanOrEqual(1750)
  })
})
