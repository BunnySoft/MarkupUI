import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { connectExample } from "../demo/components/element.js"

const html = readFileSync(resolve("demo", "components", "element.html"), "utf8")
const connections: ReturnType<typeof connectExample>[] = []
function fixture() {
  const parsed = new DOMParser().parseFromString(html, "text/html")
  const root = document.importNode(parsed.querySelector("[data-element-example]")!, true) as HTMLElement
  document.body.append(root)
  return root
}
function connect(root = fixture()) { connections.push(connectExample(root)); return root }
function choose(root: HTMLElement, selector: string, value: string) {
  const select = root.querySelector<HTMLSelectElement>(selector)!
  select.value = value
  select.dispatchEvent(new Event("change", { bubbles: true }))
}
function click(root: HTMLElement, selector: string) { root.querySelector<HTMLElement>(selector)!.click() }
function output(root: HTMLElement) { return root.querySelector("[data-preview-output]")!.textContent! }
afterEach(() => {
  for (const connection of connections.splice(0)) connection.disconnect()
  document.body.replaceChildren()
  document.body.removeAttribute("style")
  vi.restoreAllMocks()
})

describe("Element resolved through authored native HTML", () => {
  it("adds no wrapper, factory, export, dependency or distribution", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    const manifest = JSON.parse(readFileSync(resolve("dist", "manifest.json"), "utf8"))
    expect(pkg.dependencies).toEqual({})
    expect(pkg.exports["./element"]).toBeUndefined()
    expect(pkg.exports["./element/style.css"]).toBeUndefined()
    expect(existsSync(resolve("src", "components", "element"))).toBe(false)
    expect(existsSync(resolve("dist", "markup-ui-element.js"))).toBe(false)
    expect(Object.keys(manifest.bundles).some(name => /markup-ui-element[.]/.test(name))).toBe(false)
    const js = readFileSync(resolve("demo", "components", "element.js"), "utf8")
    expect(js).not.toMatch(/^import |customElements|createElement|innerHTML|replaceChildren|attachShadow|localStorage|fetch\(|\.style\b/m)
    expect(html).not.toMatch(/<mui-|role="(?:none|presentation|button|link|heading)"|\sstyle=|<style>/)
  })
  it("reuses the accepted application palettes instead of defining a second palette", () => {
    const css = readFileSync(resolve("demo", "components", "element.css"), "utf8")
    expect(html).toContain('href="config-provider.css"')
    expect(css).toContain("var(--mui-bg-surface, Canvas)")
    expect(css).toContain("var(--mui-color-primary, LinkText)")
    expect(css).not.toMatch(/--mui-[\w-]+\s*:/)
    expect(css).not.toMatch(/--primary-color|--n-/)
  })
  it("has usable no-JS native heading/link/list/fieldset/label/reset/disclosure anatomy", () => {
    const root = fixture()
    expect(root.querySelector("h1")!.tagName).toBe("H1")
    expect(root.querySelector("a")!.getAttribute("href")).toBe("#element-target")
    expect(root.querySelector("details")).toBeInstanceOf(HTMLDetailsElement)
    expect(root.querySelectorAll("ul > li")).toHaveLength(2)
    const title = root.querySelector<HTMLInputElement>('input[name="title"]')!
    expect(title.labels?.[0]?.textContent).toContain("Title")
    expect(root.querySelector("fieldset > legend")).not.toBeNull()
    expect(root.querySelector<HTMLButtonElement>('button[type="reset"]')!.type).toBe("reset")
    expect(root.querySelector('button[type="submit"], input[type="submit"]')).toBeNull()
    expect(root.querySelectorAll('form input:not([type]), form input[type="email"]').length).toBeGreaterThanOrEqual(2)
    expect([...root.querySelectorAll<HTMLElement>("[data-element-enhanced]")].every(node => node.hidden)).toBe(true)
  })
  it("counts native click activation without synthetic roles or keyboard dispatch", () => {
    const root = connect()
    const button = root.querySelector<HTMLButtonElement>("[data-action]")!
    expect(button).toBeInstanceOf(HTMLButtonElement)
    button.click(); button.click()
    expect(root.querySelector("output[data-count]")!.textContent).toBe("2")
    expect(button.hasAttribute("role")).toBe(false)
  })
  it("uses native validation and handles a valid submit locally with real FormData", () => {
    const root = connect(), form = root.querySelector("form")!
    const submitted = vi.fn((event: Event) => expect(event.defaultPrevented).toBe(true))
    form.addEventListener("submit", submitted)
    click(root, "[data-preview]")
    expect(submitted).toHaveBeenCalledOnce()
    expect(JSON.parse(output(root))).toEqual([["title", "Local draft"], ["email", "reader@example.invalid"], ["reviewed", "yes"]])
    expect(output(root)).not.toContain("disabled-value")
  })
  it("does not preview invalid native fields or bypass constraint validation", () => {
    const root = connect()
    root.querySelector<HTMLInputElement>('input[name="email"]')!.value = "invalid"
    const submitted = vi.fn()
    root.querySelector("form")!.addEventListener("submit", submitted)
    click(root, "[data-preview]")
    expect(submitted).not.toHaveBeenCalled()
    expect(output(root)).toBe("Nothing previewed yet.")
  })
  it("keeps untrusted form values literal and leaves native reset/default/checkbox behavior intact", () => {
    const root = connect(), title = root.querySelector<HTMLInputElement>('input[name="title"]')!
    const reviewed = root.querySelector<HTMLInputElement>('input[name="reviewed"]')!
    title.value = "<img src=x>"
    reviewed.checked = false
    click(root, "[data-preview]")
    expect(output(root)).toContain("<img src=x>")
    expect(root.querySelector("[data-preview-output] img")).toBeNull()
    expect(new FormData(root.querySelector("form")!).has("reviewed")).toBe(false)
    click(root, 'button[type="reset"]')
    expect(title.value).toBe("Local draft")
    expect(reviewed.checked).toBe(true)
  })
  it("changes scoped attributes without changing native tags, content, attributes or children", () => {
    const root = connect()
    const content = root.querySelector("[data-authored-text]")!, text = content.firstChild
    const input = root.querySelector<HTMLInputElement>('input[name="title"]')!
    input.value = "Still editing"
    input.setAttribute("aria-label", "Author-owned label")
    choose(root, "[data-palette]", "dark")
    choose(root, "[data-direction]", "rtl")
    choose(root, "[data-nested-palette]", "light")
    choose(root, "[data-nested-palette]", "inherit")
    expect(root.querySelector("#element-nested")!.hasAttribute("data-example-palette")).toBe(false)
    expect(root.querySelector("#element-outside")!.hasAttribute("dir")).toBe(false)
    expect(root.querySelector("#element-scope")!.getAttribute("dir")).toBe("rtl")
    expect(content.firstChild).toBe(text)
    expect(root.querySelector('input[name="title"]')).toBe(input)
    expect(input.value).toBe("Still editing")
    expect(input.getAttribute("aria-label")).toBe("Author-owned label")
  })
  it("leaves native hidden and disclosure state under the author's control", () => {
    const root = connect()
    const hidden = root.querySelector<HTMLElement>("[data-hidden-sample]")!
    const details = root.querySelector("details")!
    expect(hidden.hidden).toBe(true)
    hidden.hidden = false
    details.open = true
    connections[0].disconnect()
    expect(hidden.hidden).toBe(false)
    expect(details.open).toBe(true)
  })
  it("disconnects only its listeners, keeping author listeners, inline overrides and values", () => {
    const root = fixture(), button = root.querySelector<HTMLButtonElement>("[data-action]")!
    const author = vi.fn()
    button.addEventListener("click", author)
    connect(root)
    button.click()
    root.querySelector<HTMLElement>("#element-scope")!.style.setProperty("--mui-color-primary", "#123456")
    connections[0].disconnect()
    button.click()
    expect(author).toHaveBeenCalledTimes(2)
    expect(root.querySelector("[data-count]")!.textContent).toBe("1")
    expect(root.querySelector<HTMLElement>("#element-scope")!.style.getPropertyValue("--mui-color-primary")).toBe("#123456")
    connections[0].disconnect()
    expect(root.querySelector("button[data-action]")).toBe(button)
  })
  it("keeps examples independent and does not mutate body styles or storage", () => {
    const storage = vi.spyOn(Storage.prototype, "setItem")
    document.body.style.padding = "7px"
    const first = connect(), second = connect()
    choose(first, "[data-palette]", "dark")
    click(second, "[data-action]")
    connections[0].disconnect()
    first.remove()
    click(second, "[data-action]")
    expect(second.querySelector("[data-count]")!.textContent).toBe("2")
    expect(second.querySelector("#element-scope")!.getAttribute("data-example-palette")).toBe("system")
    expect(document.body.style.padding).toBe("7px")
    expect(storage).not.toHaveBeenCalled()
  })
  it("moves focus before hiding its optional controls on disconnect", () => {
    const root = connect()
    root.querySelector<HTMLButtonElement>("[data-disconnect]")!.focus()
    click(root, "[data-disconnect]")
    expect(document.activeElement).toBe(root.querySelector("[data-example-status]"))
    expect([...root.querySelectorAll<HTMLElement>("[data-element-enhanced]")].every(node => node.hidden)).toBe(true)
  })
})
