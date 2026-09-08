import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "code", "code.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "code.html"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
const numberedSource = '\tconst message = "<b>literal</b>";\r\nconsole.log(message); // 😀\r\n\r\nreturn message;\r\n'
let style: HTMLStyleElement | undefined

function fixture(): void {
  document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>"))
}
function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}
afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
})

describe("CSS-only native plain Code", () => {
  it("ships no runtime, language engine, constructor or clipboard action", () => {
    expect(pkg.exports["./code/style.css"]).toBe("./dist/markup-ui-code.css")
    expect(pkg.exports["./code"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "code"))).toEqual(["code.css"])
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("mui-code")).toBeUndefined()
    expect(demo).not.toContain("<script")
    expect(demo).not.toContain("navigator.clipboard")
    expect(css).not.toContain("@import")
    expect(css).not.toContain("hljs")
  })

  it("uses native pre/code and inline code without changing headings or roles", () => {
    fixture()
    install()
    expect(document.querySelector("#plain-block")!.tagName).toBe("PRE")
    expect(document.querySelector("#plain-code")!.tagName).toBe("CODE")
    expect(document.querySelector("#plain-code")!.parentElement?.id).toBe("plain-block")
    expect(document.querySelector("#inline-code")!.closest("pre")).toBeNull()
    expect(document.querySelector("#plain-block")!.getAttribute("aria-labelledby")).toBe("plain-heading")
    expect(document.querySelectorAll(".mui-code[role], .mui-code[aria-live]")).toHaveLength(0)
  })

  it("preserves literal HTML, whitespace, tabs, leading and trailing newlines", () => {
    fixture()
    install()
    const plain = document.querySelector("#plain-code")!
    expect(plain.textContent?.startsWith("\n\t<script>")).toBe(true)
    expect(plain.textContent?.endsWith("\n\n")).toBe(true)
    expect(plain.querySelector("script")).toBeNull()
    expect(document.querySelector("#inline-code")!.textContent).toBe("a  < b\t&&  x")
    expect(document.querySelector("#numbered-code")!.textContent).toBe(numberedSource)
  })

  it("keeps five physical lines including the final empty line without number text nodes", () => {
    fixture()
    install()
    const code = document.querySelector("#numbered-code")!
    const lines = [...code.querySelectorAll(".mui-code-line")]
    expect(lines).toHaveLength(5)
    expect(lines.at(-1)?.textContent).toBe("")
    for (const number of code.querySelectorAll(".mui-code-number")) {
      expect(number.textContent).toBe("")
      expect(number.getAttribute("aria-hidden")).toBe("true")
    }
    expect(css).toContain("counter-increment: mui-code-line")
    expect(css).toContain("content: counter(mui-code-line)")
    expect(css).not.toContain("user-select: none;")
    expect(css).toContain("min-block-size: calc(var(--mui-code-line-height, 1.6) * 1em)")
  })

  it("retains exact selected source across physical-line wrappers", () => {
    fixture()
    install()
    const range = document.createRange()
    range.selectNodeContents(document.querySelector("#numbered-code")!)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    expect(selection.toString()).toBe(numberedSource)
    expect(range.toString()).toBe(numberedSource)
    selection.removeAllRanges()
  })

  it("enables numbering only on unwrapped block code, not inline or soft-wrapped content", () => {
    fixture()
    install()
    const selector = 'pre.mui-code-block[data-line-numbers]:not([data-word-wrap]) > code.mui-code > .mui-code-line > .mui-code-number'
    expect(document.querySelector("#numbered-code .mui-code-number")!.matches(selector)).toBe(true)
    expect(document.querySelector("#wrapped-code .mui-code-number")!.matches(selector)).toBe(false)
    expect(getComputedStyle(document.querySelector("#wrapped-code .mui-code-number")!).display).toBe("none")
    expect(document.querySelectorAll("#wrapped-code > .mui-code-line")).toHaveLength(3)
    expect(css).toContain(selector)
  })

  it("preserves application-authored token spans without claiming language parsing", () => {
    fixture()
    const code = document.querySelector("#token-code")!
    const nodes = [...code.childNodes]
    install()
    expect([...code.childNodes]).toEqual(nodes)
    expect(code.querySelectorAll(".mui-code-token")).toHaveLength(4)
    expect(code.querySelector("img")).toBeNull()
    expect(code.textContent).toContain('"<img src=x onerror=example>"')
    expect(document.querySelector("#token-block")!.getAttribute("data-language")).toBe("javascript")
    expect(css).not.toContain("[data-language")
  })

  it("leaves native textContent assignment to the author without decoding or trimming", () => {
    fixture()
    install()
    const code = document.querySelector("#plain-code")!
    const source = " \r\n\t%3Cscript%3E <b>😀</b>\r\n "
    code.textContent = source
    expect(code.textContent).toBe(source)
    expect(code.querySelector("b, script")).toBeNull()
    expect(code.childNodes).toHaveLength(1)
  })

  it("preserves authored nodes/listeners on removal and reattachment", () => {
    fixture()
    const block = document.querySelector("#numbered-block")!
    const before = block.innerHTML
    const nodes = [...block.querySelectorAll("*")]
    const link = document.querySelector<HTMLElement>("#native-link")!
    let clicks = 0
    link.addEventListener("click", event => { event.preventDefault(); clicks++ })
    install()
    block.remove()
    document.body.append(block)
    link.click()
    expect(clicks).toBe(1)
    expect(block.innerHTML).toBe(before)
    expect([...block.querySelectorAll("*")]).toEqual(nodes)
  })

  it("uses native font/tab/line-height customization without a numeric attribute parser", () => {
    fixture()
    install()
    const block = document.querySelector<HTMLElement>("#plain-block")!
    block.style.setProperty("--mui-code-font-size", "15px")
    block.style.setProperty("--mui-code-tab-size", "2")
    expect(getComputedStyle(block).getPropertyValue("--mui-code-font-size")).toBe("15px")
    expect(getComputedStyle(block).getPropertyValue("--mui-code-tab-size")).toBe("2")
    expect(css).toContain("--mui-typography-mono-font")
    expect(css).not.toContain("[data-size")
  })

  it("keeps hidden blocks/templates inert and does not reset ordinary pre elements", () => {
    fixture()
    const outside = document.querySelector("#outside-pre")!
    const before = getComputedStyle(outside).padding
    install()
    expect(getComputedStyle(outside).padding).toBe(before)
    expect(getComputedStyle(document.querySelector("#hidden-code")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#native-template")!).display).toBe("none")
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert code template")
  })

  it("provides native scrolling/focus, explicit direction and readable print/forced-color paths", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#plain-block")!).overflow).toBe("auto")
    expect(document.querySelector("#plain-block")!.getAttribute("tabindex")).toBe("0")
    expect(document.querySelector("#ltr-in-rtl")!.getAttribute("dir")).toBe("ltr")
    expect(document.querySelector("#rtl-block")!.getAttribute("dir")).toBe("rtl")
    expect(css).toContain("inset-inline-start")
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain(":focus-visible")
    expect(css).not.toContain("row-reverse")
  })
})
