import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"

const html = readFileSync(resolve("demo", "components", "qr-code.html"), "utf8")
const css = readFileSync(resolve("demo", "components", "qr-code.css"), "utf8")
const payload = "Reference: LOCAL-0042\nDesk: North\nNote: A & B"
function fixture() {
  const parsed = new DOMParser().parseFromString(html, "text/html")
  document.body.append(document.importNode(parsed.querySelector("#qr-code-example")!, true))
  return document.querySelector<HTMLElement>("#qr-code-example")!
}
afterEach(() => { document.getSelection()?.removeAllRanges(); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("QR Code resolved exclusion and native destination handoff", () => {
  it("adds no encoder, public helper, dependency, runtime or distribution asset", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    const manifest = JSON.parse(readFileSync(resolve("dist", "manifest.json"), "utf8"))
    expect(pkg.dependencies).toEqual({})
    expect(pkg.exports["./qr-code"]).toBeUndefined()
    expect(pkg.exports["./qr-code/style.css"]).toBeUndefined()
    expect(existsSync(resolve("src", "components", "qr-code"))).toBe(false)
    expect(existsSync(resolve("demo", "components", "qr-code.js"))).toBe(false)
    expect(Object.keys(manifest.bundles).some(name => /markup-ui-qr-code[.]/.test(name))).toBe(false)
  })
  it("does not substitute fake pixels, broken images, canvas, SVG or a scanner for an encoder", () => {
    const parsed = new DOMParser().parseFromString(html, "text/html")
    expect(parsed.querySelector("img, canvas, svg, object, iframe, script, video, input")).toBeNull()
    expect(parsed.querySelector("[src], [srcset], [role=img], [data-qr]")).toBeNull()
    expect(css).not.toMatch(/url\(|gradient\(|@import|@font-face|content\s*:|animation|transition/)
    expect(parsed.body.textContent).toContain("not a QR code")
    expect(parsed.body.textContent!.replace(/\s+/g, " ")).toContain("No verified QR image is supplied")
  })
  it("uses one actual labelled native link to a fixed existing local page", () => {
    const root = fixture(), link = root.querySelector<HTMLAnchorElement>("#destination-link")!
    expect(root.querySelectorAll("a")).toHaveLength(1)
    expect(link.getAttribute("href")).toBe("equation.html")
    expect(link.textContent).toBe("Read the native Equation example")
    expect(existsSync(resolve("demo", "components", link.getAttribute("href")!))).toBe(true)
    expect(link.hasAttribute("role")).toBe(false)
    expect(link.hasAttribute("target")).toBe(false)
    expect(link.hasAttribute("download")).toBe(false)
    expect(link.tabIndex).toBe(0)
    expect(root.querySelector("#destination-text")!.textContent).toBe(link.getAttribute("href"))
  })
  it("keeps non-URL payloads as exact multiline native text, never automatic hrefs", () => {
    const root = fixture(), text = root.querySelector("#opaque-payload")!
    expect(text.textContent).toBe(payload)
    expect(text.closest("a")).toBeNull()
    expect(text.children).toHaveLength(0)
    expect(text.parentElement!.localName).toBe("pre")
    expect(text.parentElement!.getAttribute("dir")).toBe("ltr")
    expect(text.closest("section")!.getAttribute("dir")).toBe("rtl")
    expect([...root.querySelectorAll("[href]")].some(node => node.getAttribute("href")!.includes("LOCAL-0042"))).toBe(false)
  })
  it("preserves native names, reading order and explanatory image responsibilities without live spam", () => {
    const root = fixture()
    expect(root.querySelector("h1")!.textContent).toContain("No QR encoder")
    for (const section of root.querySelectorAll("section")) {
      expect(root.querySelector(`#${section.getAttribute("aria-labelledby")}`)).toBe(section.querySelector("h2"))
    }
    expect(root.querySelector('[aria-live], [aria-hidden], [role="status"], [role="grid"]')).toBeNull()
    expect(root.querySelector("details li")!.textContent).toContain("independently verified")
    expect(root.querySelector("details")!.textContent).toContain("actual decoded payload")
  })
  it("keeps native disclosure usable without script and does not turn it into a generator", () => {
    const root = fixture(), details = root.querySelector("details")!
    expect(details.querySelector("summary")!.textContent).toContain("supplies a real QR image")
    details.open = true
    expect(details.open).toBe(true)
    expect(root.querySelector("img, canvas, svg")).toBeNull()
    expect(root.querySelector("#opaque-payload")!.textContent).toBe(payload)
  })
  it("preserves original nodes, selection and author listeners through native presentation changes", () => {
    const root = fixture(), text = root.querySelector("#opaque-payload")!, original = text.firstChild, listener = vi.fn()
    text.addEventListener("author-probe", listener)
    const range = document.createRange(); range.selectNodeContents(text)
    const selection = document.getSelection()!; selection.addRange(range)
    root.setAttribute("dir", "rtl"); root.querySelector("details")!.open = true
    text.dispatchEvent(new Event("author-probe"))
    expect(listener).toHaveBeenCalledOnce()
    expect(text.firstChild).toBe(original); expect(selection.toString()).toBe(payload)
    expect(root.querySelector("#opaque-payload")).toBe(text)
  })
  it("retains author focus and attributes without adding form values or activation handlers", () => {
    const root = fixture(), link = root.querySelector<HTMLAnchorElement>("a")!
    link.setAttribute("aria-label", "Author's local destination")
    link.focus(); root.querySelector("details")!.open = true
    expect(document.activeElement).toBe(link)
    expect(link.getAttribute("aria-label")).toBe("Author's local destination")
    expect(root.querySelector("form, input, button")).toBeNull()
    expect([...root.querySelectorAll("*")].flatMap(node => [...node.attributes]).some(attribute => /^on/i.test(attribute.name))).toBe(false)
  })
  it("loads only scoped local presentation and supplies readable narrow/print/forced-color styles", () => {
    const parsed = new DOMParser().parseFromString(html, "text/html")
    expect([...parsed.querySelectorAll("link[href]")].map(node => node.getAttribute("href"))).toEqual(["qr-code.css"])
    expect(html).not.toMatch(/<style\b|\sstyle=/)
    expect(css).toContain("white-space: pre-wrap")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).not.toMatch(/(?:^|\n)(?:body|html|a|pre|:root)\s*[{,]/)
  })
})
