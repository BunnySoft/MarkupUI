import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  HIGHLIGHT_LIMITS,
  Highlight,
  MHighlight,
  createHighlight,
  findHighlightRanges,
  highlightText,
  registerHighlight,
} from "../src/components/highlight/index.js"
import * as highlightApi from "../src/components/highlight/index.js"
import type { HighlightMatchOptions, HighlightOptions } from "../src/components/highlight/index.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "highlight", "highlight.css"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))

function surface(text = "Previous content"): HTMLSpanElement {
  const element = document.createElement("span")
  element.className = "m-highlight"
  element.textContent = text
  document.body.append(element)
  return element
}
afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("bounded literal Highlight matching", () => {
  it("uses case-insensitive matching by default and original half-open offsets", () => {
    expect(findHighlightRanges("Atlas atlas ATLAS", ["atlas"])).toEqual([
      { start: 0, end: 5 }, { start: 6, end: 11 }, { start: 12, end: 17 },
    ])
  })

  it("supports explicit case-sensitive matching", () => {
    expect(findHighlightRanges("Atlas atlas ATLAS", ["atlas"], { caseSensitive: true })).toEqual([{ start: 6, end: 11 }])
  })

  it("does not shift offsets by lowercasing expanding Unicode characters", () => {
    expect(findHighlightRanges("İx x", ["X"])).toEqual([{ start: 1, end: 2 }, { start: 3, end: 4 }])
    expect(findHighlightRanges("İI i", ["i"])).toEqual([{ start: 1, end: 2 }, { start: 3, end: 4 }])
  })

  it("uses Unicode simple case folding without locale or full-case expansions", () => {
    expect(findHighlightRanges("Σσς", ["σ"])).toEqual([{ start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 }])
    expect(findHighlightRanges("Kk", ["k"])).toEqual([{ start: 0, end: 1 }, { start: 1, end: 2 }])
    expect(findHighlightRanges("straße", ["STRASSE"])).toEqual([])
  })

  it("retains UTF-16 offsets for emoji and supplementary cased characters", () => {
    expect(findHighlightRanges("a😀b😀", ["😀"])).toEqual([{ start: 1, end: 3 }, { start: 4, end: 6 }])
    expect(findHighlightRanges("\u{10400} \u{10428}", ["\u{10428}"])).toEqual([{ start: 0, end: 2 }, { start: 3, end: 5 }])
  })

  it("does not split paired surrogates when matching an isolated surrogate", () => {
    expect(findHighlightRanges("😀\ud83d", ["\ud83d"])).toEqual([{ start: 2, end: 3 }])
  })

  it("does not normalize text or pretend code-point matching is grapheme matching", () => {
    expect(findHighlightRanges("é e\u0301", ["é"])).toEqual([{ start: 0, end: 1 }])
    expect(findHighlightRanges("e\u0301", ["\u0301"])).toEqual([{ start: 1, end: 2 }])
    expect(findHighlightRanges("👩‍💻", ["💻"])).toEqual([{ start: 3, end: 5 }])
  })

  it("treats every regexp metacharacter and regex-looking pattern literally", () => {
    const literal = "\\^$.*+?()[]{}|/-"
    expect(findHighlightRanges(`before ${literal} after`, [literal])).toEqual([{ start: 7, end: 7 + literal.length }])
    expect(findHighlightRanges("(a+)+$ aaaa", ["(a+)+$"])).toEqual([{ start: 0, end: 6 }])
    expect(findHighlightRanges("a.b aXb", ["a.b"])).toEqual([{ start: 0, end: 3 }])
  })

  it("keeps newline and control characters as literal text", () => {
    expect(findHighlightRanges("a\nb\u0000c", ["\n", "\u0000"])).toEqual([{ start: 1, end: 2 }, { start: 3, end: 4 }])
  })

  it("uses earliest matches with input-order precedence and non-overlapping consumption", () => {
    expect(findHighlightRanges("ababa", ["aba", "ba"])).toEqual([{ start: 0, end: 3 }, { start: 3, end: 5 }])
    expect(findHighlightRanges("abc", ["ab", "abc"])).toEqual([{ start: 0, end: 2 }])
    expect(findHighlightRanges("abc", ["abc", "ab"])).toEqual([{ start: 0, end: 3 }])
    expect(findHighlightRanges("aaa", ["aa"])).toEqual([{ start: 0, end: 2 }])
  })

  it("ignores empty patterns, deduplicates exact patterns and does not mutate inputs", () => {
    const patterns = Object.freeze(["", "a", "a", ""])
    expect(findHighlightRanges("aa", patterns)).toEqual([{ start: 0, end: 1 }, { start: 1, end: 2 }])
    expect(patterns).toEqual(["", "a", "a", ""])
    expect(findHighlightRanges("text", ["", ""])).toEqual([])
    expect(findHighlightRanges(" " , [" "])).toEqual([{ start: 0, end: 1 }])
  })

  it("handles empty or omitted text/patterns without zero-length matches", () => {
    expect(findHighlightRanges()).toEqual([])
    expect(findHighlightRanges("", ["x"])).toEqual([])
    expect(findHighlightRanges("text")).toEqual([])
    expect(findHighlightRanges("text", [])).toEqual([])
  })

  it("rejects invalid text/pattern types and unknown or non-boolean options", () => {
    expect(() => findHighlightRanges(null as unknown as string)).toThrow(TypeError)
    expect(() => findHighlightRanges("x", "x" as unknown as string[])).toThrow(TypeError)
    expect(() => findHighlightRanges("x", [42] as unknown as string[])).toThrow(TypeError)
    expect(() => findHighlightRanges("x", ["x"], { caseSensitive: "false" } as unknown as HighlightMatchOptions)).toThrow(TypeError)
    expect(() => findHighlightRanges("x", ["x"], { autoEscape: false } as HighlightMatchOptions)).toThrow(/Unsupported/)
    expect(() => findHighlightRanges("x", ["x"], null as unknown as HighlightMatchOptions)).toThrow(TypeError)
  })

  it("bounds text, input pattern count, distinct pattern length and work", () => {
    expect(() => findHighlightRanges("x".repeat(HIGHLIGHT_LIMITS.textLength + 1))).toThrow(RangeError)
    expect(() => findHighlightRanges("x", Array.from({ length: HIGHLIGHT_LIMITS.patternCount + 1 }, () => ""))).toThrow(RangeError)
    expect(() => findHighlightRanges("", ["x".repeat(HIGHLIGHT_LIMITS.patternCharacters + 1)])).toThrow(RangeError)
    expect(() => findHighlightRanges("x".repeat(65_536), ["a".repeat(257)])).toThrow(/work limit/)
    expect(Object.isFrozen(HIGHLIGHT_LIMITS)).toBe(true)
  })

  it("bounds match count instead of silently truncating results or creating unbounded marks", () => {
    expect(findHighlightRanges("a".repeat(HIGHLIGHT_LIMITS.matches), ["a"])).toHaveLength(HIGHLIGHT_LIMITS.matches)
    expect(() => findHighlightRanges("a".repeat(HIGHLIGHT_LIMITS.matches + 1), ["a"])).toThrow(/4096 matches/)
  })
})

describe("native owned Highlight surface", () => {
  it("keeps the authored no-JS demo fallback equal to initial automatic matching", () => {
    const demo = readFileSync(resolve("demo", "components", "highlight.html"), "utf8")
    document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>"))
    const target = document.querySelector<HTMLSpanElement>("#preview")!
    expect(document.querySelector<HTMLFieldSetElement>("#matching-controls")!.disabled).toBe(true)
    const original = target.textContent
    const marks = [...target.querySelectorAll("mark")].map(mark => mark.textContent)
    const text = document.querySelector<HTMLTextAreaElement>("#text-input")!.value
    const patterns = document.querySelector<HTMLTextAreaElement>("#pattern-input")!.value.split(/\r?\n/)
    highlightText(target, text, patterns)
    expect(target.textContent).toBe(original)
    expect([...target.querySelectorAll("mark")].map(mark => mark.textContent)).toEqual(marks)
    expect(marks).toHaveLength(7)
  })

  describe("audited native mark presentation", () => {
    it("uses native mark colors and zero-radius geometry without resetting inherited typography", () => {
      expect(css).toContain("color: var(--m-highlight-color, MarkText)")
      expect(css).toContain("background: var(--m-highlight-background, Mark)")
      expect(css).toContain("padding: 0")
      expect(css).toContain("border-radius: 0")
      expect(css).not.toContain("#fef08a")
      expect(css).not.toContain(".125em")
      expect(css).not.toMatch(/(?:^|[;{])\s*(?:font(?:-[\w-]+)?|line-height)\s*:/m)
    })

    it("preserves authored mark styles and zero-specificity component selectors", () => {
      const target = surface()
      highlightText(target, "A needle appears.", ["needle"], { highlightClass: "custom" })
      const mark = target.querySelector("mark")!
      mark.style.cssText = "color: rgb(12, 34, 56); background: rgb(220, 230, 240); padding: 1px 3px; border-radius: 4px; font-weight: 700"
      const original = mark.getAttribute("style")
      const library = document.createElement("style")
      library.textContent = css
      document.head.append(library)
      try {
        expect(getComputedStyle(mark).color).toBe("rgb(12, 34, 56)")
        expect(getComputedStyle(mark).padding).toBe("1px 3px")
        expect(getComputedStyle(mark).borderRadius).toBe("4px")
        expect(getComputedStyle(mark).fontWeight).toBe("700")
        expect(mark.getAttribute("style")).toBe(original)
        expect(mark.classList.contains("custom")).toBe(true)
        expect(css).toContain(":where(mark.m-highlight-mark)")
      } finally { library.remove() }
    })

    it("does not opt an ordinary text surface into whitespace or wrapping behavior", () => {
      const target = document.createElement("span")
      document.body.append(target)
      highlightText(target, "A  needle\nneedle", ["needle"])
      expect(target.hasAttribute("class")).toBe(false)
      expect(target.textContent).toBe("A  needle\nneedle")
      expect(css).toContain(":where(span.m-highlight)")
      expect(css).toContain("white-space: pre-wrap")
      expect(css).toContain("overflow-wrap: anywhere")
    })

    it("retains native media adaptations and the existing stylesheet ceiling", () => {
      expect(css).toContain("color: HighlightText")
      expect(css).toContain("background: Highlight")
      expect(css).toContain("text-decoration: underline")
      expect(css.slice(css.indexOf("@media print"))).not.toContain("color: inherit")
      expect(css.slice(css.indexOf("@media print"))).toContain("color: var(--m-highlight-color, MarkText)")
      expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(750)
    })
  })

  it("constructs only text and mark nodes while retaining the exact source string", () => {
    const target = surface()
    const text = "<img src=x onerror=alert(1)> & <script>literal</script>"
    highlightText(target, text, ["<img", "<script>", "literal"])
    expect(target.textContent).toBe(text)
    expect(target.querySelector("img, script")).toBeNull()
    expect([...target.children].every(element => element.tagName === "MARK")).toBe(true)
    expect([...target.querySelectorAll("mark")].map(mark => mark.textContent)).toEqual(["<img", "<script>", "literal"])
  })

  it("applies multiple native classes without interpreting class strings as attributes", () => {
    const target = surface()
    highlightText(target, "Atlas", ["Atlas"], { highlightClass: 'custom accent " onclick="bad' })
    const mark = target.querySelector("mark")!
    expect(mark.classList.contains("m-highlight-mark")).toBe(true)
    expect(mark.classList.contains("custom")).toBe(true)
    expect(mark.classList.contains("accent")).toBe(true)
    expect(mark.hasAttribute("onclick")).toBe(false)
    expect(mark.getAttributeNames()).toEqual(["class"])
  })

  it("updates text, case options and classes explicitly without leaving stale marks", () => {
    const target = surface()
    highlightText(target, "Atlas atlas", ["atlas"])
    expect(target.querySelectorAll("mark")).toHaveLength(2)
    highlightText(target, "Atlas atlas", ["atlas"], { caseSensitive: true, highlightClass: "new-class" })
    expect(target.querySelectorAll("mark")).toHaveLength(1)
    expect(target.querySelector("mark")!.textContent).toBe("atlas")
    highlightText(target, "Changed", ["Changed"])
    expect(target.textContent).toBe("Changed")
    expect(target.querySelector(".new-class")).toBeNull()
  })

  it("clears decoration with empty patterns and clears the owned surface with empty text", () => {
    const target = surface()
    highlightText(target, "a a", ["a"])
    highlightText(target, "a a", [])
    expect(target.childNodes).toHaveLength(1)
    expect(target.firstChild?.nodeType).toBe(Node.TEXT_NODE)
    expect(target.textContent).toBe("a a")
    highlightText(target, "")
    expect(target.childNodes).toHaveLength(0)
  })

  it("explicitly replaces child ownership but preserves host/parent nodes and listeners", () => {
    const link = document.createElement("a")
    link.href = "#target"
    const target = surface()
    target.id = "owned"
    target.setAttribute("aria-label", "Author name")
    const child = document.createElement("button")
    child.textContent = "Rich child"
    target.replaceChildren(child)
    link.append(target)
    document.body.append(link)
    let hostClicks = 0
    target.addEventListener("click", event => { event.preventDefault(); hostClicks++ })
    highlightText(target, "New text", ["New"])
    expect(child.isConnected).toBe(false)
    expect(target.parentElement).toBe(link)
    expect(target.id).toBe("owned")
    expect(target.getAttribute("aria-label")).toBe("Author name")
    target.querySelector<HTMLElement>("mark")!.click()
    expect(hostClicks).toBe(1)
    expect(link.getAttribute("href")).toBe("#target")
  })

  it("leaves the surface untouched on every validation or capacity error", () => {
    const target = surface("Keep me")
    const node = target.firstChild
    for (const run of [
      () => highlightText(target, "a".repeat(HIGHLIGHT_LIMITS.matches + 1), ["a"]),
      () => highlightText(target, "x", ["x"], { highlightClass: "x".repeat(257) }),
      () => highlightText(target, "x", ["x"], { highlightClass: {} } as HighlightOptions),
      () => highlightText(target, "x", ["x"], { highlightTag: "script" } as HighlightOptions),
      () => highlightText(target, "x", ["x"], { highlightStyle: {} } as HighlightOptions),
      () => highlightText(target, "x", ["x"], { autoEscape: false } as HighlightOptions),
    ]) {
      expect(run).toThrow()
      expect(target.textContent).toBe("Keep me")
      expect(target.firstChild).toBe(node)
    }
  })

  it("rejects raw-text/interactive/non-HTML targets instead of executing text or corrupting controls", () => {
    for (const name of ["script", "style", "textarea", "input", "button", "div"]) {
      const target = document.createElement(name)
      target.textContent = "Keep"
      expect(() => highlightText(target as HTMLSpanElement, "Changed", ["Changed"])).toThrow(TypeError)
      expect(target.textContent).toBe("Keep")
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "span")
    expect(() => highlightText(svg as unknown as HTMLSpanElement, "x", ["x"])).toThrow(TypeError)
  })

  it("works detached, after reattachment and with another document without lifecycle state", () => {
    const target = surface()
    target.remove()
    highlightText(target, "Detached", ["Detached"])
    document.body.append(target)
    expect(target.querySelector("mark")!.textContent).toBe("Detached")
    const other = document.implementation.createHTMLDocument("Other")
    const another = other.createElement("span")
    highlightText(another, "Other", ["Other"])
    expect(another.firstChild?.ownerDocument).toBe(other)
    expect(another.textContent).toBe("Other")
  })

  it("does not reveal hidden surfaces or add roles, listeners or live announcements", () => {
    const target = surface()
    target.hidden = true
    highlightText(target, "Hidden", ["Hidden"])
    expect(target.hidden).toBe(true)
    expect(target.hasAttribute("aria-live")).toBe(false)
    const mark = target.querySelector<HTMLElement>("mark")!
    expect(mark.hasAttribute("role")).toBe(false)
    expect(mark.hasAttribute("tabindex")).toBe(false)
    expect(mark.tabIndex).toBe(-1)
  })

  it("keeps text selectable across mark boundaries", () => {
    const target = surface()
    const text = "İx 😀 <b>literal</b>"
    highlightText(target, text, ["x", "😀", "<b>"])
    const range = document.createRange()
    range.selectNodeContents(target)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    expect(selection.toString()).toBe(text)
    selection.removeAllRanges()
  })

  it("ships optional ESM/classic helpers and standalone mark CSS", () => {
    expect(pkg.exports["./highlight"].import).toBe("./dist/markup-ui-highlight.js")
    expect(pkg.exports["./highlight"].types).toBe("./dist/components/highlight/index.d.ts")
    expect(pkg.exports["./highlight/style.css"]).toBe("./dist/markup-ui-highlight.css")
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("m-highlight")).toBe(Highlight)
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("@media print")
    expect(css).not.toContain("@import")
  })
})

describe("canonical Highlight ViewElement", () => {
  it("exports canonical ViewElement classes and registration", () => {
    expect(highlightApi.Highlight).toBe(Highlight)
    expect(highlightApi.MHighlight).toBe(MHighlight)
    expect(Highlight.tag).toBe("m-highlight")
    expect(ViewElement.prototype.isPrototypeOf(Highlight.prototype)).toBe(true)
    expect(customElements.get("m-highlight")).toBe(Highlight)
    expect(Highlight.observedAttributes).toEqual(["text", "keywords", "case-sensitive"])
    expect(() => registerHighlight()).not.toThrow()
    const define = vi.fn()
    expect(() => registerHighlight({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("handles text property defaults, attributes, and validation", () => {
    const element = document.createElement("m-highlight") as Highlight
    document.body.append(element)
    expect(element.text).toBe("")

    element.text = "Hello world"
    expect(element.text).toBe("Hello world")
    expect(element.getAttribute("text")).toBe("Hello world")

    element.setAttribute("text", "From attribute")
    expect(element.text).toBe("From attribute")

    element.removeAttribute("text")
    expect(element.text).toBe("")

    expect(() => { element.text = 123 as unknown as string }).toThrow(TypeError)
    expect(() => { element.text = "x".repeat(HIGHLIGHT_LIMITS.textLength + 1) }).toThrow(RangeError)
  })

  it("handles keywords property defaults, attributes, validation, array vs string", () => {
    const element = document.createElement("m-highlight") as Highlight
    document.body.append(element)
    expect(element.keywords).toBe("")

    element.keywords = ["atlas", "test"]
    expect(element.keywords).toEqual(["atlas", "test"])
    expect(element.getAttribute("keywords")).toBe('["atlas","test"]')

    element.keywords = "single"
    expect(element.keywords).toBe("single")
    expect(element.getAttribute("keywords")).toBe("single")

    element.setAttribute("keywords", '["json", "keyword"]')
    expect(element.keywords).toEqual(["json", "keyword"])

    element.setAttribute("keywords", "plain")
    expect(element.keywords).toBe("plain")

    element.removeAttribute("keywords")
    expect(element.keywords).toBe("")

    expect(() => { element.keywords = 123 as unknown as string }).toThrow(TypeError)
    expect(() => { element.keywords = [123] as unknown as string[] }).toThrow(TypeError)
    expect(() => { element.keywords = Array.from({ length: HIGHLIGHT_LIMITS.patternCount + 1 }, () => "a") }).toThrow(RangeError)
    expect(() => { element.keywords = ["x".repeat(HIGHLIGHT_LIMITS.patternCharacters + 1)] }).toThrow(RangeError)
  })

  it("handles caseSensitive property defaults, attributes, and validation", () => {
    const element = document.createElement("m-highlight") as Highlight
    document.body.append(element)
    expect(element.caseSensitive).toBe(false)
    expect(element.hasAttribute("case-sensitive")).toBe(false)

    element.caseSensitive = true
    expect(element.caseSensitive).toBe(true)
    expect(element.hasAttribute("case-sensitive")).toBe(true)

    element.caseSensitive = false
    expect(element.caseSensitive).toBe(false)
    expect(element.hasAttribute("case-sensitive")).toBe(false)

    element.setAttribute("case-sensitive", "")
    expect(element.caseSensitive).toBe(true)

    element.removeAttribute("case-sensitive")
    expect(element.caseSensitive).toBe(false)

    expect(() => { element.caseSensitive = "true" as unknown as boolean }).toThrow(RangeError)
  })

  it("replays pre-upgrade properties upon connection", () => {
    const element = document.createElement("m-highlight") as Highlight
    Object.defineProperty(element, "text", { configurable: true, value: "Atlas atlas" })
    Object.defineProperty(element, "keywords", { configurable: true, value: ["Atlas"] })
    Object.defineProperty(element, "caseSensitive", { configurable: true, value: true })
    document.body.append(element)

    expect(element.text).toBe("Atlas atlas")
    expect(element.keywords).toEqual(["Atlas"])
    expect(element.caseSensitive).toBe(true)
    expect(element.getAttribute("text")).toBe("Atlas atlas")
    expect(element.getAttribute("keywords")).toBe('["Atlas"]')
    expect(element.hasAttribute("case-sensitive")).toBe(true)
    expect(element.querySelectorAll("mark")).toHaveLength(1)
    expect(element.querySelector("mark")!.textContent).toBe("Atlas")
  })

  it("renders marks and updates dynamically on property/attribute changes", () => {
    const element = document.createElement("m-highlight") as Highlight
    element.text = "Atlas and atlas."
    element.keywords = ["atlas"]
    document.body.append(element)

    expect(element.querySelectorAll("mark")).toHaveLength(2)

    element.caseSensitive = true
    expect(element.querySelectorAll("mark")).toHaveLength(1)
    expect(element.querySelector("mark")!.textContent).toBe("atlas")

    element.keywords = []
    expect(element.querySelectorAll("mark")).toHaveLength(0)
    expect(element.textContent).toBe("Atlas and atlas.")

    element.text = ""
    expect(element.childNodes).toHaveLength(0)
  })

  it("renders child textContent when text attribute is not set", () => {
    const element = document.createElement("m-highlight") as Highlight
    element.textContent = "Searching for needle in haystack"
    element.keywords = ["needle"]
    document.body.append(element)

    expect(element.querySelectorAll("mark")).toHaveLength(1)
    expect(element.querySelector("mark")!.textContent).toBe("needle")
  })

  it("supports createHighlight helper", () => {
    const element = createHighlight({ text: "Hello world", keywords: ["world"] })
    expect(element).toBeInstanceOf(Highlight)
    expect(element.text).toBe("Hello world")
    expect(element.keywords).toEqual(["world"])
    document.body.append(element)
    expect(element.querySelectorAll("mark")).toHaveLength(1)
    expect(element.querySelector("mark")!.textContent).toBe("world")
  })

  it("exposes MarkupUIHighlight global", async () => {
    await import("../src/components/highlight/global.js")
    const globalApi = (globalThis as unknown as { MarkupUIHighlight?: typeof highlightApi }).MarkupUIHighlight
    expect(globalApi).toBeDefined()
    expect(globalApi?.Highlight).toBe(Highlight)
    expect(globalApi?.registerHighlight).toBe(registerHighlight)
  })

  it("generates component API documentation matching the ViewElement specification", () => {
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "highlight.json"), "utf8"))
    expect(docs.elements).toHaveLength(1)
    const [element] = docs.elements
    expect(element.type).toBe("Highlight")
    expect(element.web.primary).toBe("m-highlight")
    expect(element.properties.text).toMatchObject({
      name: "text",
      type: "string",
      typeName: "string",
      attribute: "text",
      default: "",
      nullable: false,
      writable: true,
    })
    expect(element.properties.keywords).toMatchObject({
      name: "keywords",
      type: "string",
      typeName: "string | readonly string[]",
      attribute: "keywords",
      default: "",
      nullable: false,
      writable: true,
    })
    expect(element.properties.caseSensitive).toMatchObject({
      name: "caseSensitive",
      type: "boolean",
      typeName: "boolean",
      attribute: "case-sensitive",
      default: false,
      nullable: false,
      writable: true,
    })
    expect(element.regions).toEqual([
      { name: "content", accepts: ["phrasing content"], min: 0, max: null },
    ])
    expect(element.events).toEqual([])
    expect(element.actions).toEqual([])
  })

  it("renders API documentation in demo element", async () => {
    const { renderComponentApi } = await import("../demo/component-api.js")
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "highlight.json"), "utf8"))
    const container = document.createElement("div")
    renderComponentApi(container, docs.elements)
    expect(container.textContent).toContain("Highlight")
    expect(container.textContent).toContain("m-highlight")
    expect(container.textContent).toContain("text")
    expect(container.textContent).toContain("keywords")
    expect(container.textContent).toContain("case-sensitive")
  })
})

