import { existsSync, readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { connectExample } from "../demo/components/global-style.js"

const source = readFileSync(resolve("src", "components", "global-style", "global-style.css"), "utf8")
const html = readFileSync(resolve("demo", "components", "global-style.html"), "utf8")
const connections: ReturnType<typeof connectExample>[] = []
const styles: HTMLStyleElement[] = []
function install() {
  const style = document.createElement("style")
  style.textContent = source
  document.head.append(style)
  styles.push(style)
  return style
}
function fixture() {
  const parsed = new DOMParser().parseFromString(html, "text/html")
  const root = document.importNode(parsed.querySelector("#global-style-example")!, true) as HTMLElement
  const link = document.importNode(parsed.querySelector("#global-style-link")!, true) as HTMLLinkElement
  document.head.append(link)
  document.body.append(root)
  return { root, link }
}
function connect() {
  const f = fixture()
  connections.push(connectExample(f.root))
  return f
}
function click(root: HTMLElement, selector: string) { root.querySelector<HTMLElement>(selector)!.click() }
afterEach(() => {
  for (const connection of connections.splice(0)) connection.disconnect()
  for (const style of styles.splice(0)) style.remove()
  document.querySelectorAll("#global-style-link").forEach(link => link.remove())
  document.body.replaceChildren()
  document.body.removeAttribute("style")
  document.body.removeAttribute("data-global-style-author")
  for (const name of ["scheme", "type", "colors"]) document.documentElement.removeAttribute(`data-global-style-${name}`)
  vi.restoreAllMocks()
})

describe("Explicit external Global Style", () => {
  it("ships only a standalone opt-in stylesheet, not a runtime, registration or dependency", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    expect(pkg.exports["./global-style/style.css"]).toBe("./dist/markup-ui-global-style.css")
    expect(pkg.exports["./global-style"]).toBeUndefined()
    expect(pkg.dependencies).toEqual({})
    expect(readdirSync(resolve("src", "components", "global-style"))).toEqual(["global-style.css"])
    expect(existsSync(resolve("dist", "markup-ui-global-style.js"))).toBe(false)
    expect(existsSync(resolve("dist", "markup-ui-global-style.global.js"))).toBe(false)
    expect(customElements.get("mui-global-style")).toBeUndefined()
    for (const path of ["src\\index.ts", "src\\global.ts", "src\\plugins\\advanced.ts", "src\\plugins\\widgets.ts"]) {
      expect(readFileSync(resolve(path), "utf8")).not.toContain("global-style")
    }
  })
  it("builds byte-identical CSS from one source with an actual CSS-only budget", () => {
    const built = readFileSync(resolve("dist", "markup-ui-global-style.css"))
    const manifest = JSON.parse(readFileSync(resolve("dist", "manifest.json"), "utf8"))
    expect(built.toString()).toBe(source)
    expect(manifest.bundles["markup-ui-global-style.css"]).toEqual({ bytes: built.length, gzipBytes: gzipSync(built, { level: 9 }).length, budget: 500 })
    expect(gzipSync(built, { level: 9 }).length).toBeLessThanOrEqual(500)
    expect(Object.keys(manifest.bundles).filter(name => name.includes("global-style"))).toEqual(["markup-ui-global-style.css"])
  })
  it("restricts every rule to zero-specificity html/body selectors", () => {
    const style = install()
    const selectors: string[] = []
    function visit(rules: CSSRuleList) {
      for (const rule of [...rules]) {
        if ("selectorText" in rule) selectors.push((rule as CSSStyleRule).selectorText)
        else if ("cssRules" in rule) visit((rule as CSSMediaRule).cssRules)
      }
    }
    visit(style.sheet!.cssRules)
    expect(new Set(selectors)).toEqual(new Set([":where(html)", ":where(body)"]))
    expect(source).not.toMatch(/!important|@import|url\(|box-sizing|appearance|overflow|padding|text-size-adjust|tap-highlight|outline|transition|animation/)
  })
  it("uses body-only overrides, existing tokens and reference fallback colors without defining a palette", () => {
    for (const token of ["--mui-font-family", "--mui-font-size", "--mui-line-height", "--mui-text-primary", "--mui-bg-page"]) expect(source).toContain(`var(${token},`)
    expect(source).toContain("color: var(--mui-global-style-color, var(--mui-text-primary, light-dark(#333639, rgb(255 255 255 / .82))))")
    expect(source).toContain("background-color: var(--mui-global-style-background-color, var(--mui-bg-page, light-dark(#fff, #101014)))")
    expect(source).not.toMatch(/--mui-[\w-]+\s*:/)
    expect(source).toContain("color-scheme: light dark")
    expect(source).toContain("@media (forced-colors: active)")
    expect(source).toContain("@media print")
    expect(source).toContain("color-scheme: light")
    expect(source).toContain("color: CanvasText")
    expect(source).toContain("background-color: Canvas")
  })
  it("keeps source CSS within its strict budget before integrated distribution rebuild", () => {
    expect(gzipSync(source, { level: 9 }).length).toBeLessThanOrEqual(500)
  })
  it("reserves native system colors for forced colors and print, after theme defaults", () => {
    const style = install()
    const rules = [...style.sheet!.cssRules]
    for (const condition of ["(forced-colors: active)", "print"]) {
      const media = rules.find(rule => "conditionText" in rule && rule.conditionText === condition) as CSSMediaRule
      expect(media).toBeDefined()
      const body = [...media.cssRules].find(rule => "selectorText" in rule && rule.selectorText === ":where(body)") as CSSStyleRule
      expect(body.style.color).toBe("CanvasText")
      expect(body.style.getPropertyValue("background-color")).toBe("Canvas")
      expect(rules.indexOf(media)).toBeGreaterThan(rules.findIndex(rule => "selectorText" in rule && rule.selectorText === ":where(body)"))
    }
  })
  it("uses the verified reference typography without changing native control or author ownership", () => {
    const legacy = readFileSync(resolve("src", "components", "styles.css"), "utf8")
    const family = 'v-sans,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
    expect(source.replace(/, /g, ",")).toContain(`var(--mui-font-family,${family})`)
    expect(source).toContain("font-size: var(--mui-font-size, 14px)")
    expect(source).toContain("line-height: var(--mui-line-height, 1.6)")
    expect(legacy).toContain(`--mui-font-family:${family}`)
    expect(legacy).toContain("--mui-font-size:14px;--mui-line-height:1.6")
  })
  it("does not overwrite author body inline declarations when installed or removed", () => {
    document.body.style.cssText = "margin: 13px; padding: 7px; color: purple; overflow: auto"
    const before = document.body.getAttribute("style")
    const style = install()
    expect(getComputedStyle(document.body).margin).toBe("13px")
    expect(document.body.getAttribute("style")).toBe(before)
    style.remove()
    expect(document.body.getAttribute("style")).toBe(before)
    expect(document.body.hasAttribute("n-styled")).toBe(false)
  })
  it("authors a real external link and useful native no-JS anatomy", () => {
    const { root, link } = fixture()
    expect(link.rel).toBe("stylesheet")
    expect(link.getAttribute("href")).toBe("../../dist/markup-ui-global-style.css")
    expect(root.querySelector<HTMLElement>("[data-demo-controls]")!.hidden).toBe(true)
    expect(root.querySelector("form")!.querySelector('button[type="submit"]')).toBeNull()
    expect(root.querySelector<HTMLInputElement>('input[name="title"]')!.labels?.[0]?.textContent).toContain("Title")
    expect(root.querySelector("details")).toBeInstanceOf(HTMLDetailsElement)
    expect(root.querySelector<HTMLElement>("[data-hidden-sample]")!.hidden).toBe(true)
    expect(html).not.toMatch(/\sstyle=|<style>|\sonclick=/)
  })
  it("uses the native link disabled state without writing body styles", () => {
    const { root, link } = connect()
    document.body.style.margin = "9px"
    click(root, "[data-enabled]")
    expect(link.disabled).toBe(true)
    click(root, "[data-enabled]")
    expect(link.disabled).toBe(false)
    expect(document.body.style.margin).toBe("9px")
  })
  it("removes and reinserts the same authored link without recreating document content", () => {
    const { root, link } = connect()
    const field = root.querySelector<HTMLInputElement>('input[name="title"]')!
    field.value = "Still editing"
    const listener = vi.fn()
    field.addEventListener("input", listener)
    click(root, "[data-attach]")
    expect(link.isConnected).toBe(false)
    expect(root.querySelector<HTMLInputElement>("[data-enabled]")!.disabled).toBe(true)
    click(root, "[data-attach]")
    expect(document.querySelector("#global-style-link")).toBe(link)
    expect(root.querySelector('input[name="title"]')).toBe(field)
    expect(field.value).toBe("Still editing")
    field.dispatchEvent(new Event("input"))
    expect(listener).toHaveBeenCalledOnce()
  })
  it("keeps chosen native document attributes explicit rather than injecting tokens", () => {
    const { root } = connect()
    click(root, "[data-document-type]")
    click(root, "[data-document-colors]")
    click(root, "[data-author-body]")
    expect(document.documentElement.hasAttribute("data-global-style-type")).toBe(true)
    expect(document.documentElement.hasAttribute("data-global-style-colors")).toBe(true)
    expect(document.body.hasAttribute("data-global-style-author")).toBe(true)
    const scheme = root.querySelector<HTMLSelectElement>("[data-scheme]")!
    scheme.value = "dark"; scheme.dispatchEvent(new Event("change"))
    expect(document.documentElement.dataset.globalStyleScheme).toBe("dark")
    scheme.value = "system"; scheme.dispatchEvent(new Event("change"))
    expect(document.documentElement.hasAttribute("data-global-style-scheme")).toBe(false)
    expect(document.documentElement.hasAttribute("style")).toBe(false)
    expect(document.body.hasAttribute("style")).toBe(false)
  })
  it("preserves native form values, successful controls, reset and disabled fieldsets", () => {
    const { root } = connect()
    const style = install(), form = root.querySelector("form")!
    const title = form.querySelector<HTMLInputElement>('input[name="title"]')!
    title.value = "Changed"
    expect([...new FormData(form).entries()]).toEqual([["title", "Changed"], ["email", "reader@example.invalid"], ["choice", "one"], ["confirmed", "yes"]])
    expect(form.querySelector('input[name="excluded"]')!.matches(":disabled")).toBe(true)
    style.remove()
    click(root, 'button[type="reset"]')
    expect(title.value).toBe("Local document")
    expect(form.checkValidity()).toBe(true)
  })
  it("disconnects only demo listeners, preserving chosen link/author state and native focus", () => {
    const { root, link } = connect()
    click(root, "[data-enabled]")
    click(root, "[data-author-body]")
    root.querySelector<HTMLButtonElement>("[data-disconnect]")!.focus()
    click(root, "[data-disconnect]")
    expect(document.activeElement).toBe(root.querySelector("[data-demo-status]"))
    expect(root.querySelector<HTMLElement>("[data-demo-controls]")!.hidden).toBe(true)
    expect(link.disabled).toBe(true)
    expect(document.body.hasAttribute("data-global-style-author")).toBe(true)
    connections[0].disconnect()
    click(root, "[data-enabled]")
    expect(link.disabled).toBe(true)
  })
  it("has no storage, global style registry or automatic side-effecting package imports", () => {
    const storage = vi.spyOn(Storage.prototype, "setItem")
    const { root } = connect()
    click(root, "[data-document-type]")
    connections[0].disconnect()
    expect(storage).not.toHaveBeenCalled()
    const js = readFileSync(resolve("demo", "components", "global-style.js"), "utf8")
    expect(js).not.toMatch(/^import |localStorage|fetch\(|customElements|createElement|style\.|setProperty|setInterval|MutationObserver/m)
    expect(source).not.toContain("n-styled")
  })
})
