import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "ellipsis", "ellipsis.css"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
const demo = readFileSync(resolve("demo", "components", "ellipsis.html"), "utf8")
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("CSS-only Ellipsis and native disclosure", () => {
  it("exports CSS only, without a tooltip, measurement or component runtime", () => {
    expect(pkg.exports["./ellipsis/style.css"]).toBe("./dist/markup-ui-ellipsis.css")
    expect(pkg.exports["./ellipsis"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "ellipsis"))).toEqual(["ellipsis.css"])
    expect(customElements.get("mui-ellipsis")).toBeUndefined()
    expect(demo).not.toContain("<script")
  })

  it("retains complete original text, native emphasis and authored ARIA", () => {
    document.body.innerHTML = '<p class="mui-ellipsis" data-multiline lang="en" aria-describedby="description">Original <strong>complete</strong> text</p><span id="description">Description</span>'
    const text = document.querySelector("p")!
    const strong = text.querySelector("strong")
    const before = text.outerHTML
    install()
    expect(text.outerHTML).toBe(before)
    expect(text.querySelector("strong")).toBe(strong)
    expect(text.textContent).toBe("Original complete text")
    expect(document.querySelector("[role],[aria-live],[aria-hidden],[aria-label],title")).toBeNull()
  })

  it("expands the same text via native summary activation without a duplicate full label", () => {
    document.body.innerHTML = '<details class="mui-ellipsis-disclosure"><summary><span class="mui-ellipsis">Complete original content</span><span class="mui-ellipsis-hint">Expand or collapse text</span></summary></details>'
    const details = document.querySelector("details")!
    const summary = document.querySelector("summary")!
    const text = summary.querySelector(".mui-ellipsis")!
    const child = text.firstChild
    let clicks = 0
    summary.addEventListener("click", () => clicks++)
    install()
    summary.click()
    expect(details.open).toBe(true)
    summary.click()
    expect(details.open).toBe(false)
    expect(clicks).toBe(2)
    expect(text.firstChild).toBe(child)
    expect(text.textContent).toBe("Complete original content")
    expect(document.querySelectorAll(".mui-ellipsis")).toHaveLength(1)
  })

  it("preserves authored open state, native toggle events and reconnect identity", async () => {
    document.body.innerHTML = '<details class="mui-ellipsis-disclosure" open><summary><span class="mui-ellipsis">Original</span><span class="mui-ellipsis-hint">Full text</span></summary></details>'
    const details = document.querySelector("details")!
    const text = details.querySelector(".mui-ellipsis")
    install()
    expect(details.open).toBe(true)
    const toggle = new Promise<void>((resolve) => details.addEventListener("toggle", () => resolve(), { once: true }))
    details.open = false
    await toggle
    details.remove()
    document.body.append(details)
    expect(details.open).toBe(false)
    expect(details.querySelector(".mui-ellipsis")).toBe(text)
  })

  it("keeps normal multiline text as the unsupported-clamp fallback", () => {
    expect(css).toContain("@supports selector(:has(*))")
    expect(css).toContain("@supports (-webkit-line-clamp: 2) or (line-clamp: 2)")
    expect(css).toContain("--mui-ellipsis-lines, 2")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).toContain("min-inline-size: 0")
    expect(css).not.toContain("max-height")
    expect(css).not.toContain("block-size:")
  })

  it("uses inline passive boxes while retaining native disclosure preview layout", () => {
    expect(css).toContain("display: inline-block")
    expect(css).toContain("vertical-align: bottom")
    expect(css).toContain("display: -webkit-inline-box")
    expect(css).toContain("vertical-align: baseline")
    expect(css).toContain(":where(details.mui-ellipsis-disclosure > summary) > .mui-ellipsis { display: block; }")
    expect(css).toContain(":where(details.mui-ellipsis-disclosure > summary) > .mui-ellipsis[data-multiline]")
    expect(css).not.toContain("list-style: none")
    expect(css).not.toContain("::marker")
  })

  it("has fail-open guards for native actions/editable or focusable text instead of clipping controls", () => {
    expect(css).toContain(".mui-ellipsis:has(:is(a, button")
    expect(css).toContain(":is(a, button, [tabindex], [contenteditable]) .mui-ellipsis")
    expect(css).toContain("iframe, object, embed, audio, video, [tabindex], [contenteditable]")
    expect(css).not.toContain("pointer-events")
    expect(css).not.toContain("visibility: hidden")
    expect(css).not.toContain("user-select")
  })

  it("preserves native adjacent and accidentally nested action attributes/listeners", () => {
    document.body.innerHTML = '<p class="mui-ellipsis">Original <button type="button">Action</button></p><a href="#full" target="_self" rel="help">Full text</a>'
    const button = document.querySelector("button")!
    const link = document.querySelector("a")!
    const before = document.body.innerHTML
    let clicks = 0
    button.addEventListener("click", () => clicks++)
    install()
    button.click()
    expect(clicks).toBe(1)
    expect(button.type).toBe("button")
    expect(link.getAttribute("href")).toBe("#full")
    expect(document.body.innerHTML).toBe(before)
  })

  it("keeps late authored text, templates and hidden content application-owned", () => {
    document.body.innerHTML = '<p class="mui-ellipsis">Original</p><template class="mui-ellipsis"><button type="button">Inert template action</button></template><span class="mui-ellipsis" hidden>Hidden</span>'
    const text = document.querySelector("p")!
    const template = document.querySelector("template")!
    install()
    const late = document.createElement("em")
    late.textContent = " late content"
    text.append(late)
    expect(text.lastChild).toBe(late)
    expect(template.content.querySelector("button")?.textContent).toBe("Inert template action")
    expect(document.querySelector("button")).toBeNull()
    expect(getComputedStyle(template).display).toBe("none")
    expect(getComputedStyle(document.querySelector("[hidden]")!).display).toBe("none")
  })

  it("preserves direction, language and out-of-scope typography", () => {
    document.body.innerHTML = '<section dir="rtl" lang="ar"><p class="mui-ellipsis">نص أصلي</p></section><p id="outside">Outside</p>'
    const outside = document.querySelector("#outside")!
    const before = { display: getComputedStyle(outside).display, overflow: getComputedStyle(outside).overflow, whiteSpace: getComputedStyle(outside).whiteSpace }
    install()
    expect({ display: getComputedStyle(outside).display, overflow: getComputedStyle(outside).overflow, whiteSpace: getComputedStyle(outside).whiteSpace }).toEqual(before)
    expect(document.querySelector("section")?.dir).toBe("rtl")
    expect(document.querySelector("section")?.lang).toBe("ar")
    expect(css).not.toContain("direction:")
    expect(css).not.toContain("font-family:")
  })

  it("does not reveal hidden or template previews when a disclosure is open", () => {
    document.body.innerHTML = '<details class="mui-ellipsis-disclosure" open><summary><span class="mui-ellipsis" data-multiline hidden>Still hidden</span><template class="mui-ellipsis">Still inert</template><span class="mui-ellipsis-hint">Native disclosure</span></summary></details>'
    install()
    expect(getComputedStyle(document.querySelector("[hidden]")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("template")!).display).toBe("none")
    expect(document.querySelector("[hidden]")?.textContent).toBe("Still hidden")
  })

  it("prints full summary text without opening unrelated details or adding animation", () => {
    const print = css.slice(css.indexOf("@media print"))
    expect(print).toContain("white-space: normal")
    expect(print).toContain("-webkit-line-clamp: unset")
    expect(print).toContain("overflow: visible")
    expect(print).toContain(".mui-ellipsis-hint { display: none; }")
    expect(css).not.toContain("@keyframes")
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("content:")
    expect(css).not.toContain("outline: none")
  })
})
