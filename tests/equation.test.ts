import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"

const html = readFileSync(resolve("demo", "components", "equation.html"), "utf8")
const css = readFileSync(resolve("demo", "components", "equation.css"), "utf8")
const mathNamespace = "http://www.w3.org/1998/Math/MathML"
function fixture() {
  const parsed = new DOMParser().parseFromString(html, "text/html")
  const root = document.importNode(parsed.querySelector("#equation-example")!, true)
  document.body.append(root)
  return document.querySelector<HTMLElement>("#equation-example")!
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Equation resolved exclusion and native authored alternative", () => {
  it("adds no Equation runtime, package export, dependency, stylesheet distribution or demo script", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    const manifest = JSON.parse(readFileSync(resolve("dist", "manifest.json"), "utf8"))
    expect(pkg.dependencies).toEqual({})
    expect(pkg.exports["./equation"]).toBeUndefined()
    expect(pkg.exports["./equation/style.css"]).toBeUndefined()
    expect(existsSync(resolve("src", "components", "equation"))).toBe(false)
    expect(existsSync(resolve("demo", "components", "equation.js"))).toBe(false)
    expect(Object.keys(manifest.bundles).some(name => /markup-ui-equation[.]/.test(name))).toBe(false)
    expect(html).not.toMatch(/<script\b|<style\b|\sstyle=|<mui-|<iframe\b|<object\b|<img\b/)
    expect(css).not.toMatch(/@import|@font-face|url\(|animation|transition/)
  })
  it("parses all authored mathematical descendants in the native MathML namespace", () => {
    const root = fixture(), expressions = [...root.querySelectorAll("math")]
    expect(expressions).toHaveLength(4)
    for (const expression of expressions) {
      expect(expression.namespaceURI).toBe(mathNamespace)
      expect([...expression.querySelectorAll("*")].every(node => node.namespaceURI === mathNamespace)).toBe(true)
      expect(expression.getAttribute("xmlns")).toBe(mathNamespace)
    }
  })
  it("retains original inline powers and native inline versus block presentation", () => {
    const root = fixture(), inline = root.querySelector("#inline-equation")!
    expect(inline.parentElement!.id).toBe("inline-sentence")
    expect(inline.getAttribute("display")).toBe("inline")
    expect([...inline.querySelectorAll("msup")].map(node => [...node.children].map(child => child.textContent))).toEqual([["a", "2"], ["b", "2"], ["c", "2"]])
    expect([...inline.querySelectorAll("mo")].map(node => node.textContent)).toEqual(["+", "="])
    expect(root.querySelectorAll('math[display="block"]')).toHaveLength(3)
  })
  it("authors each fraction as two native operands rather than a TeX or slash renderer", () => {
    const root = fixture()
    expect([...root.querySelectorAll("#fraction-equation mfrac")].map(node => [...node.children].map(child => child.textContent))).toEqual([["1", "2"], ["1", "3"], ["5", "6"]])
    expect(root.querySelector("#fraction-equation")!.getAttribute("aria-label")).toBe("one half plus one third equals five sixths")
  })
  it("preserves the square root, subscript and literal result as native constructs", () => {
    const root = fixture(), expression = root.querySelector("#root-equation")!
    expect(expression.querySelector("msqrt > mn")!.textContent).toBe("9")
    expect([...expression.querySelector("msub")!.children].map(node => node.textContent)).toEqual(["x", "0"])
    expect(expression.querySelector("mrow")!.lastElementChild!.textContent).toBe("3")
  })
  it("keeps a native two-by-two matrix and fixed row order, even inside RTL prose", () => {
    const root = fixture(), matrix = root.querySelector("#matrix-equation")!
    expect([...matrix.querySelectorAll("mtr")].map(row => [...row.querySelectorAll("mtd")].map(cell => cell.textContent))).toEqual([["1", "0"], ["0", "1"]])
    expect(matrix.closest("section")!.getAttribute("dir")).toBe("rtl")
    expect(matrix.getAttribute("dir")).toBe("ltr")
    expect(root.querySelector('[role="grid"], [role="table"], math[role]')).toBeNull()
  })
  it("has explicit mathematical labels, named native figures and visible plain explanations", () => {
    const root = fixture()
    for (const expression of root.querySelectorAll("math")) {
      expect(expression.getAttribute("aria-label")!.length).toBeGreaterThan(20)
      expect(expression.hasAttribute("aria-hidden")).toBe(false)
      expect(expression.querySelector("[aria-hidden], annotation, semantics")).toBeNull()
    }
    for (const figure of root.querySelectorAll("figure")) {
      expect(root.querySelector(`#${figure.getAttribute("aria-labelledby")}`)).toBe(figure.querySelector("figcaption"))
      expect(figure.querySelector("p")!.textContent!.length).toBeGreaterThan(40)
      expect(figure.tabIndex).toBe(0)
    }
    expect(root.querySelector('[aria-live], [role="status"]')).toBeNull()
  })
  it("keeps raw TeX literal and its native explanatory disclosure useful without JS", () => {
    const root = fixture(), details = root.querySelector("details")!
    expect(root.querySelector("#literal-tex")!.textContent).toBe("\\frac{1}{2}")
    expect(root.querySelector("#literal-tex")!.closest("math")).toBeNull()
    expect(details.querySelector("summary")).not.toBeNull()
    details.open = true
    expect(details.textContent!.replace(/\s+/g, " ")).toContain("does not convert it")
  })
  it("uses only local scoped presentation, with no semantic replacement or font requests", () => {
    const document = new DOMParser().parseFromString(html, "text/html")
    expect([...document.querySelectorAll("[src], link[href]")].map(node => node.getAttribute("src") || node.getAttribute("href"))).toEqual(["equation.css"])
    expect(css).toContain("#equation-example math { font-family: math; overflow-wrap: normal; }")
    expect(css).toContain("min-inline-size: max-content")
    expect(css).toContain('math[display="block"]')
    expect(css).toContain("overflow-x: auto")
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).not.toMatch(/(?:^|\n)(?:body|html|math|figure|:root)\s*[{,]/)
  })
  it("adds no form values or submission action and preserves native reset", () => {
    const root = fixture(), form = root.querySelector("form")!
    expect([...new FormData(form)]).toEqual([["reader", "Local reader"], ["notes", "The expressions stay authored."]])
    expect(form.querySelector('button:not([type="reset"]), input[type="hidden"]')).toBeNull()
    const input = form.querySelector<HTMLInputElement>('[name="notes"]')!
    expect(input.labels?.[0]?.textContent).toContain("Notes")
    input.value = "Changed notes"
    form.querySelector<HTMLButtonElement>('button[type="reset"]')!.click()
    expect(input.value).toBe("The expressions stay authored.")
  })
  it("keeps original math/text identities, listeners, selection and unrelated input focus", () => {
    const root = fixture(), math = root.querySelector("#inline-equation")!, token = math.querySelector("mi")!, text = token.firstChild
    const listener = vi.fn(); token.addEventListener("author-probe", listener)
    const input = root.querySelector<HTMLInputElement>('[name="notes"]')!; input.focus()
    const range = document.createRange(); range.selectNodeContents(math)
    const selection = document.getSelection()!; selection.removeAllRanges(); selection.addRange(range)
    const selected = selection.toString()
    root.setAttribute("dir", "rtl"); root.querySelector("details")!.open = true
    token.dispatchEvent(new Event("author-probe"))
    expect(listener).toHaveBeenCalledOnce()
    expect(token.firstChild).toBe(text); expect(root.querySelector("#inline-equation")).toBe(math)
    expect(selection.toString()).toBe(selected); expect(document.activeElement).toBe(input)
    selection.removeAllRanges()
  })
  it("supports only explicit native namespace/text authoring, not untrusted markup conversion", () => {
    const math = document.createElementNS(mathNamespace, "math"), token = document.createElementNS(mathNamespace, "mtext")
    token.textContent = "<img src=x> is literal author-supplied text"
    math.append(token); document.body.append(math)
    expect(math.namespaceURI).toBe(mathNamespace)
    expect(math.querySelector("img")).toBeNull()
    expect(token.textContent).toContain("<img src=x>")
  })
})
