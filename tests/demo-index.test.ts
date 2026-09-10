import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { components, componentGroups } from "../demo/catalog.js"
import { createComponentBrowser } from "../demo/app.js"

const html = readFileSync(resolve("demo", "index.html"), "utf8")
const css = readFileSync(resolve("demo", "app.css"), "utf8")
let browser: ReturnType<typeof createComponentBrowser> | undefined
let media: MediaQueryList
let mediaListener: (() => void) | undefined

beforeEach(() => {
  document.body.innerHTML = html.slice(html.indexOf("<body>") + 6, html.indexOf("</body>"))
  history.replaceState(null, "", "/demo/")
  media = {
    matches: false,
    media: "(max-width: 760px)",
    onchange: null,
    addEventListener: vi.fn((_event, listener) => { mediaListener = listener }),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }
  vi.stubGlobal("matchMedia", vi.fn(() => media))
})
afterEach(() => {
  browser?.disconnect()
  browser = undefined
  mediaListener = undefined
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

describe("component-by-component demo browser", () => {
  it("lists exactly the 96 existing standalone pages without group pages", () => {
    const files = readdirSync(resolve("demo", "components")).filter(file => file.endsWith(".html")).sort()
    expect(components).toHaveLength(96)
    expect(new Set(components.map(item => item.slug)).size).toBe(96)
    expect(components.map(item => `${item.slug}.html`).sort()).toEqual(files)
    expect(componentGroups).toHaveLength(9)
    browser = createComponentBrowser()
    expect(document.querySelectorAll("a[data-component]")).toHaveLength(96)
    expect(document.querySelectorAll(".nav-group")).toHaveLength(9)
    expect(document.querySelector("#component-navigation details")).toBeNull()
  })

  it("opens Avatar by default with one isolated example frame and a shareable URL", () => {
    browser = createComponentBrowser()
    expect(browser.current).toBe("avatar")
    expect(location.search).toBe("?component=avatar")
    expect(document.title).toBe("Avatar - MarkupUI")
    expect(document.querySelectorAll("iframe")).toHaveLength(1)
    const frame = document.querySelector<HTMLIFrameElement>("#component-frame")!
    expect(frame.src).toContain("/demo/components/avatar.html")
    expect(frame.title).toBe("Avatar examples")
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  })

  it("loads a deep link directly and preserves the standalone page link", () => {
    history.replaceState(null, "", "/demo/?component=tree-select")
    browser = createComponentBrowser()
    expect(browser.current).toBe("tree-select")
    expect(document.querySelector("#component-title")?.textContent).toBe("Tree Select")
    expect(document.querySelector<HTMLAnchorElement>("#standalone-link")!.href).toContain("/demo/components/tree-select.html")
  })

  it("navigates one component at a time and restores the component on browser history changes", () => {
    browser = createComponentBrowser()
    const previousFrame = document.querySelector("#component-frame")
    document.querySelector<HTMLAnchorElement>('[data-component="button"]')!.click()
    expect(location.search).toBe("?component=button")
    expect(browser.current).toBe("button")
    expect(document.querySelector('a[aria-current="page"]')?.textContent).toBe("Button")
    expect(document.activeElement?.id).toBe("component-title")
    expect(document.querySelector("#component-frame")).not.toBe(previousFrame)
    history.replaceState(null, "", "/demo/?component=avatar")
    window.dispatchEvent(new PopStateEvent("popstate"))
    expect(browser.current).toBe("avatar")
  })

  it("preserves modified native link activation", () => {
    browser = createComponentBrowser()
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true })
    const link = document.querySelector<HTMLAnchorElement>('[data-component="button"]')!
    let preventedByApp: boolean | undefined
    document.querySelector("#component-navigation")!.addEventListener("click", nativeEvent => {
      preventedByApp = nativeEvent.defaultPrevented
      nativeEvent.preventDefault()
    }, { once: true })
    link.dispatchEvent(event)
    expect(preventedByApp).toBe(false)
    expect(browser.current).toBe("avatar")
    expect(link.href).toContain("?component=button")
  })

  it("filters actual component items and hides empty categories", () => {
    browser = createComponentBrowser()
    const search = document.querySelector<HTMLInputElement>("#component-search")!
    search.value = "avatar"
    search.dispatchEvent(new Event("input"))
    const visible = [...document.querySelectorAll<HTMLLIElement>(".nav-group li")].filter(item => !item.hidden)
    expect(visible).toHaveLength(1)
    expect(visible[0]?.textContent).toBe("Avatar")
    expect(document.querySelector("#component-count")?.textContent).toBe("1 of 96 components")
    search.value = "no component matches this"
    search.dispatchEvent(new Event("input"))
    expect(document.querySelector<HTMLElement>("#no-results")!.hidden).toBe(false)
  })

  it("rejects arbitrary component paths rather than loading them into the frame", () => {
    history.replaceState(null, "", "/demo/?component=../../outside")
    browser = createComponentBrowser()
    expect(browser.current).toBeNull()
    expect(document.querySelector<HTMLIFrameElement>("#component-frame")!.src).toBe("about:blank")
    expect(document.querySelector<HTMLElement>("#component-frame")!.hidden).toBe(true)
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(0)
    expect(document.querySelector("#component-title")?.textContent).toBe("Component not found")
  })

  it("uses an accessible mobile navigation toggle without hidden focusable menus", () => {
    Object.defineProperty(media, "matches", { value: true, configurable: true })
    browser = createComponentBrowser()
    const sidebar = document.querySelector<HTMLElement>("#component-sidebar")!
    const toggle = document.querySelector<HTMLButtonElement>("#navigation-toggle")!
    expect(sidebar.hidden).toBe(true)
    expect(toggle.hidden).toBe(false)
    toggle.click()
    expect(sidebar.hidden).toBe(false)
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    document.querySelector<HTMLInputElement>("#component-search")!.focus()
    sidebar.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    expect(sidebar.hidden).toBe(true)
    expect(document.activeElement).toBe(toggle)
    Object.defineProperty(media, "matches", { value: false, configurable: true })
    mediaListener?.()
    expect(sidebar.hidden).toBe(false)
    expect(toggle.hidden).toBe(true)
  })

  it("keeps alternative/exclusion pages explicit", () => {
    history.replaceState(null, "", "/demo/?component=qr-code")
    browser = createComponentBrowser()
    expect(document.querySelector("#component-note")?.textContent).toContain("exclusion")
  })

  it("loads shell CSS/JS directly and keeps legacy styles before showcase overrides", () => {
    expect(html).toContain('href="./app.css"')
    expect(html).toContain('src="./app.js"')
    expect(html).not.toContain("../dist/")
    expect(css).toContain("min-block-size: 42px")
    expect(css).toContain('.component-link[aria-current="page"]')
    expect(css).not.toContain("mui-button")
    const legacy = readFileSync(resolve("demo", "legacy.html"), "utf8")
    expect(legacy.indexOf('id="mui-styles"')).toBeLessThan(legacy.indexOf('href="./legacy.css"'))
    expect(legacy).toContain('src="./legacy.js"')
    expect(readFileSync(resolve("demo", "legacy.js"), "utf8")).toContain('fetch("./legacy.html")')
  })
})
