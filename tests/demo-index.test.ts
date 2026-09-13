import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { components, componentGroups } from "../demo/catalog.js"
import { createComponentBrowser } from "../demo/app.js"
import { createExampleCodeViewers } from "../demo/example-code.js"
import { renderComponentApi, loadComponentApi } from "../demo/component-api.js"
import { createComponentOutline } from "../demo/component-outline.js"
import { generateComponentApi } from "../scripts/component-api.mjs"
import * as cardRuntime from "../src/components/card/index.js"
import * as typographyRuntime from "../src/components/typography/index.js"
import { Switch } from "../src/components/switch/index.js"
import { createTabs } from "../src/components/tabs/index.js"

const html = readFileSync(resolve("demo", "index.html"), "utf8")
const css = readFileSync(resolve("demo", "app.css"), "utf8")
const exampleCodeCss = readFileSync(resolve("demo", "example-code.css"), "utf8")
const avatarHtml = readFileSync(resolve("demo", "components", "avatar.html"), "utf8")
const buttonHtml = readFileSync(resolve("demo", "components", "button.html"), "utf8")
const cardHtml = readFileSync(resolve("demo", "components", "card.html"), "utf8")
const carouselHtml = readFileSync(resolve("demo", "components", "carousel.html"), "utf8")
const collapseHtml = readFileSync(resolve("demo", "components", "collapse.html"), "utf8")
const dividerHtml = readFileSync(resolve("demo", "components", "divider.html"), "utf8")
const dropdownHtml = readFileSync(resolve("demo", "components", "dropdown.html"), "utf8")
const iconHtml = readFileSync(resolve("demo", "components", "icon.html"), "utf8")
const typographyHtml = readFileSync(resolve("demo", "components", "typography.html"), "utf8")
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

describe("metadata-based component documentation", () => {
  it("extracts Select's native selection API and all events without invented defaults", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["select"])
    expect(docs.elements).toHaveLength(1)
    const select = docs.elements[0]
    expect(select.web.primary).toBe("m-select")
    expect(select.properties.value).toMatchObject({ writable: true, nullable: true })
    expect(select.properties.native.typeName).toBe("HTMLSelectElement")
    expect(select.properties.options.typeName).toBe("HTMLOptionsCollection")
    expect(select.properties.selectedOptions.writable).toBe(false)
    expect(select.properties.selectedIndex).toMatchObject({ min: -2147483648, max: 2147483647, integer: true })
    expect(select.properties.listSize).toMatchObject({ min: 0, max: 2147483647, integer: true })
    for (const key of ["value", "selectedIndex", "options", "multiple", "listSize", "form"]) expect(select.properties[key]).not.toHaveProperty("default")
    expect(select.properties).not.toHaveProperty("defaultValue")
    expect(select.properties.size.default).toBe("medium")
    expect(select.properties.status.default).toBeNull()
    expect(select.properties.borderless.default).toBe(false)
    expect(select.actions).toEqual(["focus", "blur", "checkValidity", "reportValidity", "setCustomValidity", "showPicker", "add", "item", "namedItem", "remove", "setFilter", "clear", "refresh"])
    expect(select.events).toHaveLength(5)
    expect(select.events).toContainEqual({ name: "Invalid", web: "invalid", bubbles: false, cancelable: true, composed: false })
    expect(select.events.find((event: { web: string }) => event.web === "m:select-clear").detail).toEqual({ previous: "SelectValue" })
  })
  it("extracts the complete InputNumber native-owner API without private members or invented defaults", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["input-number"])
    expect(docs.elements).toHaveLength(1)
    const number = docs.elements[0]
    expect(number.web.primary).toBe("m-input-number")
    expect(Object.keys(number.properties)).toHaveLength(22)
    expect(number.properties.value).toMatchObject({ writable: true, nullable: true, typeName: "number | null" })
    expect(number.properties.native.typeName).toBe("HTMLInputElement")
    for (const key of ["value", "defaultValue", "text", "min", "max", "step", "form", "state", "disabled"]) expect(number.properties[key]).not.toHaveProperty("default")
    expect(number.properties.size.default).toBe("medium")
    expect(number.actions).toEqual(["focus", "blur", "checkValidity", "reportValidity", "setCustomValidity", "stepUp", "stepDown", "clear", "refresh"])
    expect(number.actions.some((action: string) => action.startsWith("#"))).toBe(false)
    expect(number.events).toContainEqual({ name: "Input", web: "input", bubbles: true, cancelable: false, composed: true })
    expect(number.events).toContainEqual({ name: "Invalid", web: "invalid", bubbles: false, cancelable: true, composed: false })
    expect(number.events.find((event: { web: string }) => event.web === "m:input-number-clear").detail).toEqual({ previous: "{ value: number | null; text: string; badInput: boolean }" })
    const target = document.createElement("div")
    renderComponentApi(target, docs.elements)
    expect(target.textContent).toContain("InputNumber")
    expect(target.textContent).toContain("Bad-input")
  })

  it("extracts the full inherited Input API without invented native defaults or duplicate overloads", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["input"])
    expect(docs.elements.map((element: { type: string }) => element.type)).toEqual(["Input", "Textarea", "InputGroup", "InputGroupLabel"])
    const [input, textarea] = docs.elements
    for (const element of [input, textarea]) {
      expect(element.properties.value).toMatchObject({ writable: true, typeName: "string", attribute: null })
      expect(element.properties.value).not.toHaveProperty("default")
      expect(element.properties.value.description).toContain("Live native")
      expect(element.properties.defaultValue).not.toHaveProperty("default")
      expect(element.properties.form).toMatchObject({ writable: false, nullable: true, typeName: "HTMLFormElement | null" })
      expect(element.properties.size.default).toBe("medium")
      expect(element.properties.disabled).not.toHaveProperty("default")
      expect(element.actions).toContain("clear")
      expect(element.actions.filter((action: string) => action === "setRangeText")).toHaveLength(1)
      expect(element.actions).not.toContain("upgradeProperties")
    }
    expect(input.properties.native.typeName).toBe("HTMLInputElement")
    expect(textarea.properties.native.typeName).toBe("HTMLTextAreaElement")
    const target = document.createElement("div")
    renderComponentApi(target, docs.elements)
    expect(target.textContent).toContain("HTMLInputElement")
    expect(target.textContent).toContain("Live native")
  })

  it("loads documentation separately and surfaces request errors", async () => {
    const target = document.createElement("div")
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 404 })))
    await expect(loadComponentApi(target, "/demo/api/missing.json")).rejects.toThrow("404")
    expect(target.textContent).toContain("unavailable")
  })

  it("uses source-generated defaults without a component metadata API", () => {
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "avatar.json"), "utf8"))
    const avatar = docs.elements.find((element: { type: string }) => element.type === "Avatar")
    expect(avatar.properties.shape.default).toBe("rounded")
    expect(avatar.properties.shape.values).toEqual(["rounded", "circle", "square"])
    expect(avatar.properties.size.type).toBe("size")
    expect(avatar.properties.size.min).toBe(0)
    expect(avatar.properties.state.writable).toBe(false)
    expect(avatar.properties.state).not.toHaveProperty("default")
    expect(avatar.events.find((event: { web: string }) => event.web === "m:error").detail).toHaveProperty("src", "string")
    expect(docs.generatedFrom).toContain("documentation only")
  })

  it("extracts Card literal fallback defaults, direct choices, region tags and native event flags", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["card"])
    const card = docs.elements.find((element: { type: string }) => element.type === "Card")
    expect(docs.elements).toHaveLength(7)
    expect(card.properties.title).toMatchObject({ default: "", attribute: "title", type: "string" })
    expect(card.properties.closeLabel).toMatchObject({ default: "Close card", attribute: "close-label" })
    expect(card.properties.size).toMatchObject({ default: "medium", values: ["small", "medium", "large", "huge"] })
    expect(card.properties.closable).toMatchObject({ default: false, encoding: "presence" })
    expect(card.properties.closeFocusable).toMatchObject({ default: true, encoding: "boolean" })
    expect(card.properties.segmentedContent).toMatchObject({ default: null, nullable: true, values: ["", "true", "false", "soft"] })
    expect(card.regions.map((region: { element: string }) => region.element)).toEqual([
      "m-card-cover", "m-card-header", "m-card-header-extra", "m-card-content", "m-card-footer", "m-card-action",
    ])
    expect(card.events).toEqual([{
      name: "Close", web: "m:close", bubbles: true, cancelable: true, composed: false,
      detail: { originalEvent: "MouseEvent" },
    }])
    expect(card.states).toEqual(["structured"])
    expect(card.actions).toEqual([])
    const target = document.createElement("div")
    renderComponentApi(target, docs.elements)
    expect(target.querySelectorAll("[data-api-type]")).toHaveLength(7)
    expect(target.textContent).toContain("Close card")
    expect(target.textContent).toContain("m-card-header-extra")
  })

  it("renders API data without constructing components or inserting executable markup", () => {
    const target = document.createElement("div")
    const meta = {
      type: "Example", web: { primary: "m-example" },
      properties: { label: {
        name: "label", type: "string", nullable: true, default: "<img src=x onerror=alert(1)>",
        writable: true, attribute: "label", values: [], min: null, max: null, integer: false, encoding: null,
      } },
      regions: [{ name: "content", accepts: ["text"], min: 0, max: 1 }],
      events: [{ name: "Change", web: "m:change", bubbles: true, cancelable: false, composed: false }],
      actions: [], states: ["ready"], capabilities: [],
    }
    renderComponentApi(target, [meta])
    expect(target.querySelector("img")).toBeNull()
    expect(target.textContent).toContain("<img src=x onerror=alert(1)>")
    expect(target.textContent).toContain("Example properties")
    expect(target.textContent).toContain("m:change")
    expect(target.querySelectorAll("table")).toHaveLength(3)
    renderComponentApi(target, [meta])
    expect(target.querySelectorAll("[data-api-type]")).toHaveLength(1)
  })
})

describe("Typography documentation and composition", () => {
  it("extracts eight concrete elements, direct defaults and native properties without adding a schema", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["typography"])
    expect(docs.elements.map((element: { type: string }) => element.type)).toEqual([
      "Typography", "Text", "Paragraph", "Heading", "Link", "Blockquote", "UnorderedList", "OrderedList",
    ])
    const text = docs.elements.find((element: { type: string }) => element.type === "Text")
    const heading = docs.elements.find((element: { type: string }) => element.type === "Heading")
    const link = docs.elements.find((element: { type: string }) => element.type === "Link")
    const list = docs.elements.find((element: { type: string }) => element.type === "OrderedList")
    expect(text.properties.type).toMatchObject({ attribute: "type", default: "default" })
    expect(text.properties.depth).toMatchObject({ default: null, min: 1, max: 3, integer: true })
    expect(text.properties.strong).toMatchObject({ default: false, encoding: "presence" })
    expect(heading.properties.level).toMatchObject({ default: 2, min: 1, max: 6, integer: true })
    expect(heading.properties.prefix).toMatchObject({ attribute: "prefix", default: null, values: ["bar"] })
    expect(link.properties.href).toMatchObject({ attribute: "href", default: null, writable: true })
    expect(link.properties.native).toMatchObject({ attribute: null, writable: false })
    expect(link.actions).toEqual(["focus", "blur"])
    expect(list.properties.start).toMatchObject({ default: null, min: -2147483648, max: 2147483647, integer: true })
    expect(list.properties.reversed).toMatchObject({ default: false, encoding: "presence" })
    expect(docs.elements.every((element: { events: unknown[] }) => element.events.length === 0)).toBe(true)
    expect(typographyRuntime).not.toHaveProperty("meta")
  })

  it("uses native owners and canonical implementations in every example with explicit shared-core loading", () => {
    const parsed = new DOMParser().parseFromString(typographyHtml, "text/html")
    const scripts = [...parsed.querySelectorAll("script[src]")].map(script => script.getAttribute("src"))
    expect(scripts.indexOf("../../dist/markup-ui-core.global.js")).toBeLessThan(scripts.indexOf("../../dist/markup-ui-typography.global.js"))
    expect(parsed.querySelector("main[data-demo-page].component-docs #typography-api")).not.toBeNull()
    expect(parsed.querySelector('script[src="../component-outline.js"]')).not.toBeNull()
    expect(parsed.querySelector('link[href="../example-code.css"]')).not.toBeNull()
    expect(parsed.querySelector('link[href="../component-api.css"]')).not.toBeNull()
    expect(parsed.querySelector("m-strong,m-code,m-li")).toBeNull()
    for (const example of parsed.querySelectorAll("[data-demo-example]")) {
      expect(example.querySelector("[data-demo-header] h2[id]")).not.toBeNull()
      expect(example.querySelector("[data-demo-preview] m-typography")).not.toBeNull()
    }
    expect(parsed.querySelector("m-typography[class],m-heading[class],m-text[class],m-p[class]")).toBeNull()
    expect(parsed.body.textContent?.replace(/\s+/g, " ")).toContain("listeners attached to the replaced shell")
    expect(readFileSync(resolve("demo", "components", "typography.js"), "utf8")).toContain('new URL("../api/typography.json", import.meta.url)')
    const legacy = readFileSync(resolve("demo", "legacy.html"), "utf8")
    const legacyScript = readFileSync(resolve("demo", "legacy.js"), "utf8")
    expect(legacy).toContain('src="../dist/markup-ui-typography.js"')
    expect(legacy).not.toMatch(/<\/?m-(strong|code)(?:\s|>)/)
    expect(legacyScript).toContain('querySelectorAll("m-heading > h2,m-heading > h3")')
    expect(legacyScript).not.toContain('createElement("m-code")')
  })

  it("loads the API after readiness and exercises properties and reconnect on real elements", async () => {
    const parsed = new DOMParser().parseFromString(typographyHtml, "text/html")
    document.body.replaceChildren(document.importNode(parsed.querySelector("main")!, true))
    const heading = document.getElementById("live-title") as typographyRuntime.Heading
    const paragraph = document.getElementById("live-paragraph") as typographyRuntime.Paragraph
    const span = document.getElementById("live-content")
    const nativeParagraph = paragraph.native
    const fetch = vi.fn(async () => ({ ok: true, json: async () => JSON.parse(readFileSync(resolve("demo", "api", "typography.json"), "utf8")) }))
    vi.stubGlobal("MarkupUITypography", typographyRuntime)
    vi.stubGlobal("fetch", fetch)
    const ready = vi.spyOn(document, "readyState", "get").mockReturnValue("loading")
    try {
      await import("../demo/components/typography.js")
      expect(fetch).not.toHaveBeenCalled()
      document.dispatchEvent(new Event("DOMContentLoaded"))
      await Promise.resolve()
      await Promise.resolve()
      expect(fetch).toHaveBeenCalledOnce()
      document.getElementById("change-level")!.click()
      expect(heading.level).toBe(3)
      expect(heading.native?.localName).toBe("h3")
      document.getElementById("change-tone")!.click()
      expect(paragraph.type).toBe("success")
      document.getElementById("reconnect-typography")!.click()
      expect(heading.native?.querySelector("#live-content")).toBe(span)
      expect(paragraph.native).toBe(nativeParagraph)
      expect(document.getElementById("typography-status")?.textContent).toBe("Level: 3; tone: success")
    } finally { ready.mockRestore() }
  })
})

describe("Carousel documentation and composition", () => {
  it("extracts direct numeric constraints, read-only snapshots and the canonical family without runtime metadata", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["carousel"])
    expect(docs.elements.map((element: { type: string }) => element.type)).toEqual([
      "Carousel", "CarouselViewport", "CarouselItem", "CarouselControls", "CarouselReadout",
    ])
    const carousel = docs.elements[0]
    expect(carousel.properties.currentIndex).toMatchObject({ attribute: "current-index", default: 0, integer: true, writable: true })
    expect(carousel.properties.interval).toMatchObject({ default: 5000, min: 1000, max: 2147483647, integer: true })
    expect(carousel.properties.direction).toMatchObject({ default: "horizontal", values: ["horizontal", "vertical"] })
    expect(carousel.properties.gap).toMatchObject({ attribute: "gap", type: "number", default: 0, min: 0, writable: true })
    expect(carousel.properties.loop).toMatchObject({ default: true, encoding: "boolean" })
    expect(carousel.properties.state).toMatchObject({ attribute: null, writable: false, type: "object" })
    expect(carousel.properties.state).not.toHaveProperty("default")
    expect(carousel.properties.items).not.toHaveProperty("default")
    expect(carousel.properties).not.toHaveProperty("controller")
    expect(carousel.actions).toEqual(["to", "previous", "next", "play", "pause", "reset", "refresh"])
    expect(carousel.events).toEqual([{
      name: "CurrentChanged", web: "m:current-changed", bubbles: true, cancelable: false, composed: false,
      detail: { index: "number", previousIndex: "number", item: "HTMLElement | null", previousItem: "HTMLElement | null",
        reason: '"api" | "control" | "autoplay" | "scroll" | "refresh"' },
    }])
    expect(carousel.regions.map((region: { name: string }) => region.name)).toEqual(["viewport", "items", "controls", "readout"])
    const item = docs.elements.find((element: { type: string }) => element.type === "CarouselItem")
    expect(item.properties.key).toMatchObject({ default: null, attribute: "key", nullable: true })
    expect(item.properties.index).not.toHaveProperty("default")
    const target = document.createElement("div")
    renderComponentApi(target, docs.elements)
    expect(target.querySelectorAll("[data-api-type]")).toHaveLength(5)
    expect(target.textContent).toContain("m:current-changed")
  })

  it("loads core before classic Carousel and documents actual native anatomy and unsupported modes", () => {
    const parsed = new DOMParser().parseFromString(carouselHtml, "text/html")
    const scripts = [...parsed.querySelectorAll("script[src]")].map(script => script.getAttribute("src")!)
    expect(scripts.indexOf("../../dist/markup-ui-core.global.js")).toBeLessThan(scripts.indexOf("../../dist/markup-ui-carousel.global.js"))
    expect(parsed.querySelector('script[src="./carousel.js"]')?.getAttribute("type")).toBe("module")
    expect(parsed.querySelector('link[href="../component-api.css"]')).not.toBeNull()
    expect(parsed.querySelector("#carousel-api")).not.toBeNull()
    expect(parsed.querySelectorAll("m-carousel").length).toBeGreaterThanOrEqual(8)
    expect(parsed.querySelector("m-carousel")!.hasAttribute("class")).toBe(false)
    expect(parsed.querySelector("m-carousel.parity-carousel,m-carousel-item.text-slide")).toBeNull()
    expect(carouselHtml).toContain("This Web styling example")
    for (const root of parsed.querySelectorAll("m-carousel")) {
      expect(root.getAttribute("aria-label")).toBeTruthy()
      expect(root.querySelectorAll(":scope > m-carousel-viewport[tabindex='0'][id]")).toHaveLength(1)
      expect(root.querySelectorAll("m-carousel-readout")).toHaveLength(1)
      expect(root.querySelector("m-carousel-controls")?.hasAttribute("hidden")).toBe(true)
      if (root.hasAttribute("autoplay")) expect(root.querySelector('button[type="button"][data-part="toggle"]')).not.toBeNull()
    }
    const source = readFileSync(resolve("demo", "components", "carousel.js"), "utf8")
    expect(source).toContain('new URL("../api/carousel.json", import.meta.url)')
    expect(source.replaceAll("import.meta.url", "")).not.toContain(".meta")
    expect(source).not.toContain(".controller")
    expect(source).not.toContain('import "../../dist')
    expect(parsed.querySelector('[data-demo-example="space-between"] m-carousel[gap="20"]')).not.toBeNull()
    for (const example of parsed.querySelectorAll("[data-demo-example]")) {
      expect(example.querySelector("m-carousel")).not.toBeNull()
    }
    expect(parsed.querySelector(".native-carousel-strip,.native-card-carousel")).toBeNull()
    expect(parsed.querySelectorAll("#unsupported [data-demo-example]")).toHaveLength(0)
    expect(parsed.querySelector("#unsupported-heading")?.textContent).toBe("Not implemented")
    expect(carouselHtml).not.toContain("data-carousel-")
  })

  it("waits for DOMContentLoaded and wires direct requests, refresh and detach/reconnect", async () => {
    const parsed = new DOMParser().parseFromString(carouselHtml, "text/html")
    document.body.replaceChildren(document.importNode(parsed.querySelector("main")!, true))
    const root = document.getElementById("api-carousel") as HTMLElement & {
      currentIndex: number; disabled: boolean; state: object; items: Element[]; reset(): void; refresh(): void
    }
    Object.assign(root, {
      currentIndex: 1, disabled: false, state: { targetIndex: null, total: 3 },
      items: [...root.querySelectorAll("m-carousel-item")], reset: vi.fn(), refresh: vi.fn(),
    })
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "carousel.json"), "utf8"))
    const fetch = vi.fn(async () => ({ ok: true, json: async () => docs }))
    vi.stubGlobal("MarkupUICarousel", {})
    vi.stubGlobal("fetch", fetch)
    const ready = vi.spyOn(document, "readyState", "get").mockReturnValue("loading")
    try {
      await import("../demo/components/carousel.js")
      expect(fetch).not.toHaveBeenCalled()
      document.dispatchEvent(new Event("DOMContentLoaded"))
      await Promise.resolve()
      await Promise.resolve()
      expect(fetch).toHaveBeenCalledOnce()
      document.querySelector<HTMLButtonElement>("[data-api-request]")!.click()
      expect(root.currentIndex).toBe(2)
      document.querySelector<HTMLButtonElement>("[data-api-reorder]")!.click()
      expect(root.refresh).toHaveBeenCalledOnce()
      expect(root.querySelector("m-carousel-viewport")!.firstElementChild).toBe(root.items[2])
      document.querySelector<HTMLButtonElement>("[data-api-reset]")!.click()
      expect(root.reset).toHaveBeenCalledOnce()
      document.querySelector<HTMLButtonElement>("[data-api-disable]")!.click()
      expect(root.disabled).toBe(true)
      const detach = document.querySelector<HTMLButtonElement>("[data-api-detach]")!
      detach.click()
      expect(root.isConnected).toBe(false)
      expect(document.querySelector<HTMLButtonElement>("[data-api-request]")!.disabled).toBe(true)
      detach.click()
      expect(document.getElementById("api-carousel")).toBe(root)
      expect(document.querySelector("[data-api-status]")!.textContent).toContain("Settled: 2")
    } finally {
      ready.mockRestore()
    }
  })
})

describe("Collapse documentation and composition", () => {
  it("extracts property-only readonly arrays and only explicitly documented empty defaults", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["collapse"])
    expect(docs.elements.map((element: { type: string }) => element.type)).toEqual([
      "Collapse", "CollapseItem", "CollapseHeader", "CollapseHeaderExtra", "CollapseContent",
    ])
    const root = docs.elements[0]
    expect(root.properties.expandedKeys).toMatchObject({ type: "array", typeName: "readonly string[]", attribute: null, writable: true })
    expect(root.properties.expandedKeys).not.toHaveProperty("default")
    expect(root.properties.defaultExpandedKeys).toMatchObject({ type: "array", attribute: null, writable: true, default: [] })
    expect(root.properties.items).toMatchObject({ type: "array", typeName: "readonly CollapseItem[]", writable: false })
    expect(root.properties.items).not.toHaveProperty("default")
    expect(root.properties.accordion).toMatchObject({ encoding: "presence", default: false })
    expect(root.actions).toEqual(["expand", "collapse", "toggle", "reset", "refresh"])
    expect(root.events.map((event: { web: string }) => event.web)).toEqual(["m:error", "m:header-activated", "m:expanded-changed"])
    expect(root.events.every((event: { bubbles: boolean; cancelable: boolean; composed: boolean }) => event.bubbles && !event.cancelable && !event.composed)).toBe(true)
    expect(root.events[2].detail.expandedKeys).toBe("readonly string[]")
    expect(root.events[2].detail.item).toBe("CollapseItem")
    const item = docs.elements[1]
    expect(item.properties.expanded.writable).toBe(false)
    expect(item.properties.expanded).not.toHaveProperty("default")
    expect(item.regions.map((region: { element: string }) => region.element)).toEqual(["m-collapse-header", "m-collapse-header-extra", "m-collapse-content"])
    const target = document.createElement("div")
    renderComponentApi(target, docs.elements)
    expect(target.querySelectorAll("[data-api-type]")).toHaveLength(5)
    expect(target.textContent).toContain("array")
    expect(target.textContent).toContain("m:expanded-changed")
  })
  it("loads core before Collapse classic and authors only canonical public regions", () => {
    const parsed = new DOMParser().parseFromString(collapseHtml, "text/html")
    const scripts = [...parsed.querySelectorAll("script[src]")].map(script => script.getAttribute("src")!)
    expect(scripts.indexOf("../../dist/markup-ui-core.global.js")).toBeLessThan(scripts.indexOf("../../dist/markup-ui-collapse.global.js"))
    expect(parsed.querySelector('script[src="./collapse.js"]')?.getAttribute("type")).toBe("module")
    expect(parsed.querySelector('link[href="../component-api.css"]')).not.toBeNull()
    expect(parsed.querySelector("#collapse-api")).not.toBeNull()
    expect(parsed.querySelectorAll("m-collapse").length).toBeGreaterThan(10)
    expect(parsed.querySelectorAll("m-collapse details,m-collapse summary,[data-collapse]")).toHaveLength(0)
    for (const item of parsed.querySelectorAll("m-collapse-item")) {
      expect(item.getAttribute("key")).toBeTruthy()
      expect(item.querySelectorAll(":scope > m-collapse-header")).toHaveLength(1)
      expect(item.querySelectorAll(":scope > m-collapse-content")).toHaveLength(1)
      expect(item.querySelector("m-collapse-header button")).toBeNull()
    }
    const script = readFileSync(resolve("demo", "components", "collapse.js"), "utf8")
    expect(script).toContain('new URL("../api/collapse.json", import.meta.url)')
    expect(script.replaceAll("import.meta.url", "")).not.toContain(".meta")
    expect(script).not.toContain("createCollapse")
    expect(script).toContain("DOMContentLoaded")
  })
  it("initializes defaults and direct actions after DOMContentLoaded without exposing a helper", async () => {
    const parsed = new DOMParser().parseFromString(collapseHtml, "text/html")
    document.body.replaceChildren(document.importNode(parsed.querySelector("main")!, true))
    const roots = [...document.querySelectorAll<HTMLElement>("m-collapse")]
    for (const root of roots) Object.assign(root, {
      expandedKeys: [], defaultExpandedKeys: [], state: "ready",
      reset: vi.fn(), collapse: vi.fn(), toggle: vi.fn(),
    })
    const fetch = vi.fn(async () => ({ ok: true, json: async () => JSON.parse(readFileSync("demo\\api\\collapse.json", "utf8")) }))
    vi.stubGlobal("fetch", fetch)
    vi.stubGlobal("MarkupUICollapse", {})
    const ready = vi.spyOn(document, "readyState", "get").mockReturnValue("loading")
    try {
      await import("../demo/components/collapse.js")
      expect(fetch).not.toHaveBeenCalled()
      document.dispatchEvent(new Event("DOMContentLoaded"))
      await Promise.resolve()
      expect(fetch).toHaveBeenCalledOnce()
      const defaults = document.getElementById("default-collapse") as HTMLElement & { expandedKeys: string[]; defaultExpandedKeys: string[]; reset(): void }
      expect(defaults.defaultExpandedKeys).toEqual(["red", "amber"])
      expect(defaults.reset).toHaveBeenCalledOnce()
      document.querySelector<HTMLButtonElement>("[data-default-expand]")!.click()
      expect(defaults.expandedKeys).toEqual(["green"])
      document.querySelector<HTMLButtonElement>("[data-default-reset]")!.click()
      expect(defaults.reset).toHaveBeenCalledTimes(2)
      const retained = document.getElementById("retained-collapse")!
      const detach = document.querySelector<HTMLButtonElement>("[data-retained-detach]")!
      detach.click()
      expect(retained.isConnected).toBe(false)
      detach.click()
      expect(document.getElementById("retained-collapse")).toBe(retained)
      document.querySelector<HTMLButtonElement>("[data-trigger-extra]")!.click()
      expect(document.querySelector("[data-trigger-status]")!.textContent).toContain("without toggling")
    } finally { ready.mockRestore() }
  })
})

describe("Divider documentation and composition", () => {
  it("extracts the five direct properties and primary title region without runtime metadata", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["divider"])
    expect(docs.elements).toHaveLength(1)
    const divider = docs.elements[0]
    expect(divider.type).toBe("Divider")
    expect(Object.keys(divider.properties)).toEqual(["orientation", "dashed", "titlePlacement", "semantic", "label"])
    expect(divider.properties.orientation).toMatchObject({ default: "horizontal", values: ["horizontal", "vertical"], attribute: "orientation" })
    expect(divider.properties.titlePlacement).toMatchObject({ default: "center", values: ["start", "center", "end"], attribute: "title-placement" })
    expect(divider.properties.dashed).toMatchObject({ default: false, encoding: "presence" })
    expect(divider.properties.semantic).toMatchObject({ default: true, encoding: "boolean" })
    expect(divider.properties.label).toMatchObject({ default: null, nullable: true, attribute: "label" })
    expect(divider.regions).toEqual([{ name: "title", accepts: ["text", "noninteractive heading"], min: 0, max: 1 }])
    expect(divider.events).toEqual([])
    expect(divider.actions).toEqual([])
    expect(divider.states).toEqual(["titled", "decorative"])
    const target = document.createElement("div")
    renderComponentApi(target, docs.elements)
    expect(target.querySelectorAll("[data-api-type]")).toHaveLength(1)
    expect(target.textContent).toContain("authored content")
  })

  it("loads core before Divider classic, preserves headings and replaces CSS-only authoring", () => {
    const parsed = new DOMParser().parseFromString(dividerHtml, "text/html")
    const scripts = [...parsed.querySelectorAll("script[src]")].map(script => script.getAttribute("src")!)
    expect(scripts.indexOf("../../dist/markup-ui-core.global.js")).toBeLessThan(scripts.indexOf("../../dist/markup-ui-divider.global.js"))
    expect(parsed.querySelector('script[src="./divider.js"]')?.getAttribute("type")).toBe("module")
    expect(parsed.querySelector('link[href="../component-api.css"]')).not.toBeNull()
    expect(parsed.querySelector("#divider-api")).not.toBeNull()
    expect(parsed.querySelectorAll("m-divider").length).toBeGreaterThan(8)
    expect(parsed.querySelector(".m-divider,hr,[role=separator]")).toBeNull()
    for (const heading of parsed.querySelectorAll("m-divider > :is(h2,h3)")) {
      expect(heading.closest("[aria-hidden]")).toBeNull()
    }
    const source = readFileSync("demo\\components\\divider.js", "utf8")
    expect(source).toContain('new URL("../api/divider.json", import.meta.url)')
    expect(source.replaceAll("import.meta.url", "")).not.toContain(".meta")
    expect(source).toContain("DOMContentLoaded")
    const legacy = readFileSync("demo\\legacy.html", "utf8")
    expect(legacy).toContain('href="../dist/markup-ui-divider.css"')
    expect(legacy).toContain('src="../dist/markup-ui-divider.js"')
  })

  it("initializes its property controls at DOMContentLoaded and preserves the live heading on reconnect", async () => {
    const parsed = new DOMParser().parseFromString(dividerHtml, "text/html")
    document.body.replaceChildren(document.importNode(parsed.querySelector("main")!, true))
    const divider = document.getElementById("live-divider") as HTMLElement & {
      orientation: string; titlePlacement: string; semantic: boolean; dashed: boolean; label: string | null
    }
    Object.assign(divider, { orientation: "horizontal", titlePlacement: "center", semantic: true, dashed: false, label: "Live rule" })
    const heading = document.getElementById("divider-live-heading")!
    const fetch = vi.fn(async () => ({ ok: true, json: async () => JSON.parse(readFileSync("demo\\api\\divider.json", "utf8")) }))
    vi.stubGlobal("MarkupUIDivider", {})
    vi.stubGlobal("fetch", fetch)
    const ready = vi.spyOn(document, "readyState", "get").mockReturnValue("loading")
    try {
      await import("../demo/components/divider.js")
      expect(fetch).not.toHaveBeenCalled()
      document.dispatchEvent(new Event("DOMContentLoaded"))
      await Promise.resolve()
      expect(fetch).toHaveBeenCalledOnce()
      const orientation = document.getElementById("divider-orientation") as HTMLSelectElement
      orientation.value = "vertical"
      orientation.dispatchEvent(new Event("change"))
      expect(divider.orientation).toBe("vertical")
      const semantic = document.getElementById("divider-semantic") as HTMLInputElement
      semantic.checked = false
      semantic.dispatchEvent(new Event("change"))
      expect(divider.semantic).toBe(false)
      document.getElementById("divider-clear-label")!.click()
      expect(divider.label).toBeNull()
      document.getElementById("divider-update-title")!.click()
      expect(heading.textContent).toBe("Live heading 1")
      document.getElementById("divider-detach")!.click()
      expect(divider.isConnected).toBe(false)
      document.getElementById("divider-detach")!.click()
      expect(document.getElementById("divider-live-heading")).toBe(heading)
      expect(document.getElementById("divider-status")!.textContent).toContain("Connected; vertical; decorative")
    } finally { ready.mockRestore() }
  })
})

describe("Dropdown documentation and composition", () => {
  it("extracts the canonical family, direct defaults, finite timings and native event details", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["dropdown"])
    expect(docs.elements.map((element: { type: string }) => element.type)).toEqual([
      "Dropdown", "DropdownTrigger", "DropdownMenu", "DropdownItem", "DropdownGroup", "DropdownDivider",
    ])
    const root = docs.elements[0]
    expect(root.properties.value).toMatchObject({ default: null, nullable: true, attribute: "value" })
    expect(root.properties.disabled).toMatchObject({ default: false, encoding: "presence" })
    expect(root.properties.placement).toMatchObject({ default: "bottom" })
    expect(root.properties.placement.values).toHaveLength(12)
    expect(root.properties.submenuDelay).toMatchObject({ default: 100, min: 0, max: 60000, integer: false })
    expect(root.properties.submenuDuration.default).toBe(150)
    expect(root.properties.typeaheadDuration.default).toBe(500)
    for (const property of ["show", "state", "items"]) {
      expect(root.properties[property].writable).toBe(false)
      expect(root.properties[property]).not.toHaveProperty("default")
    }
    expect(root.actions).toEqual(["open", "close", "toggle", "select", "refresh", "syncPosition"])
    expect(root.events.map((event: { web: string }) => event.web).sort()).toEqual(["m:error", "m:open-changed", "m:selection-requested"])
    expect(root.events.every((event: { bubbles: boolean; cancelable: boolean; composed: boolean }) => event.bubbles && !event.cancelable && !event.composed)).toBe(true)
    const selection = root.events.find((event: { web: string }) => event.web === "m:selection-requested")
    expect(selection.detail).toMatchObject({ item: "DropdownItem", path: "readonly string[]", source: '"native"', originalEvent: "MouseEvent" })
    const menu = docs.elements.find((element: { type: string }) => element.type === "DropdownMenu")
    expect(menu.properties.size).toMatchObject({ default: null, nullable: true, values: ["small", "medium", "large", "huge"] })
    expect(menu.properties.animated).toMatchObject({ default: false, encoding: "presence" })
    const item = docs.elements.find((element: { type: string }) => element.type === "DropdownItem")
    expect(item.properties.selected.writable).toBe(false)
    expect(item.properties.selected).not.toHaveProperty("default")
    const target = document.createElement("div")
    renderComponentApi(target, docs.elements)
    expect(target.querySelectorAll("[data-api-type]")).toHaveLength(6)
    expect(target.textContent).toContain("m:selection-requested")
  })

  it("loads core before Dropdown classic and uses canonical regions with native action owners", () => {
    const parsed = new DOMParser().parseFromString(dropdownHtml, "text/html")
    const scripts = [...parsed.querySelectorAll("script[src]")].map(script => script.getAttribute("src")!)
    expect(scripts.indexOf("../../dist/markup-ui-core.global.js")).toBeLessThan(scripts.indexOf("../../dist/markup-ui-dropdown.global.js"))
    expect(parsed.querySelector('script[src="./dropdown.js"]')?.getAttribute("type")).toBe("module")
    expect(parsed.querySelector('link[href="../component-api.css"]')).not.toBeNull()
    expect(parsed.querySelector("#dropdown-api")).not.toBeNull()
    expect(parsed.querySelectorAll("m-dropdown").length).toBeGreaterThan(10)
    expect(parsed.querySelector("[data-dropdown-menu],[data-dropdown-item]")).toBeNull()
    for (const trigger of parsed.querySelectorAll("m-dropdown-trigger")) expect(trigger.querySelectorAll(':scope > button[type="button"]')).toHaveLength(1)
    for (const item of parsed.querySelectorAll("m-dropdown-item")) {
      expect(item.getAttribute("key")).toBeTruthy()
      expect(item.querySelectorAll(':scope > button[type="button"],:scope > a[href]')).toHaveLength(1)
    }
    const source = readFileSync("demo\\components\\dropdown.js", "utf8")
    expect(source).toContain('new URL("../api/dropdown.json", import.meta.url)')
    expect(source.replaceAll("import.meta.url", "")).not.toContain(".meta")
    expect(source).not.toContain("createDropdown")
    expect(source).not.toContain(".controller")
  })

  it("initializes direct page actions after DOMContentLoaded and retains native listeners across reconnect", async () => {
    const parsed = new DOMParser().parseFromString(dropdownHtml, "text/html")
    document.body.replaceChildren(document.importNode(parsed.querySelector("main")!, true))
    const roots = [...document.querySelectorAll("m-dropdown")]
    for (const root of roots) Object.assign(root, { disabled: false, show: false, state: "closed", value: null, toggle: vi.fn(), select: vi.fn(), refresh: vi.fn(), items: [...root.querySelectorAll("m-dropdown-item")] })
    const fetch = vi.fn(async () => ({ ok: true, json: async () => JSON.parse(readFileSync("demo\\api\\dropdown.json", "utf8")) }))
    vi.stubGlobal("fetch", fetch)
    vi.stubGlobal("MarkupUIDropdown", {})
    const ready = vi.spyOn(document, "readyState", "get").mockReturnValue("loading")
    try {
      await import("../demo/components/dropdown.js")
      expect(fetch).not.toHaveBeenCalled()
      document.dispatchEvent(new Event("DOMContentLoaded"))
      await Promise.resolve()
      expect(fetch).toHaveBeenCalledOnce()
      const manual = document.getElementById("manual-toggle-dropdown") as HTMLElement & { toggle(): void; disabled: boolean }
      document.querySelector<HTMLButtonElement>("[data-manual-toggle]")!.click()
      expect(manual.toggle).toHaveBeenCalledOnce()
      document.querySelector<HTMLButtonElement>("[data-root-disabled]")!.click()
      expect(manual.disabled).toBe(true)
      const root = document.getElementById("lifecycle-dropdown") as HTMLElement & { select(key: string): void; refresh(): void }
      const action = document.getElementById("listener-action")!
      const status = root.closest("[data-demo-example]")!.querySelector("[data-dropdown-status]")!
      action.click()
      expect(status.textContent).toContain("Native listener ran 1")
      document.querySelector<HTMLButtonElement>("[data-select-last]")!.click()
      expect(root.select).toHaveBeenCalledWith("last")
      document.querySelector<HTMLButtonElement>("[data-add-item]")!.click()
      expect(root.refresh).toHaveBeenCalledOnce()
      const detach = document.querySelector<HTMLButtonElement>("[data-detach]")!
      detach.click()
      expect(root.isConnected).toBe(false)
      detach.click()
      expect(document.getElementById("listener-action")).toBe(action)
      action.click()
      expect(status.textContent).toContain("Native listener ran 2")
      const cancel = new MouseEvent("click", { bubbles: true, cancelable: true })
      document.getElementById("cancel-action")!.dispatchEvent(cancel)
      expect(cancel.defaultPrevented).toBe(true)
    } finally { ready.mockRestore() }
  })
})

describe("Card documentation and composition", () => {
  it("loads core first, uses generated tables and keeps valid loading/tabs region markup", () => {
    const parsed = new DOMParser().parseFromString(cardHtml, "text/html")
    const scripts = [...parsed.querySelectorAll("script[src]")].map(script => script.getAttribute("src")!)
    expect(scripts.indexOf("../../dist/markup-ui-core.global.js")).toBeLessThan(scripts.indexOf("../../dist/markup-ui-card.global.js"))
    expect(parsed.querySelector('script[src="./card.js"]')?.getAttribute("type")).toBe("module")
    expect(parsed.querySelector('link[href="../component-api.css"]')).not.toBeNull()
    expect(parsed.querySelector("#card-api")).not.toBeNull()
    expect(parsed.querySelector("#loading-card > m-card-content > [data-loaded-content]")).not.toBeNull()
    expect(parsed.querySelector("#loading-card > m-card-content > [data-loading-content]")).not.toBeNull()
    expect(parsed.querySelector(".custom-card > m-card-content #custom-tabs [data-tabs-panels]")).not.toBeNull()
    expect(parsed.querySelector(".task-card > m-card-content + m-card-footer")).not.toBeNull()
    expect(parsed.querySelectorAll(".task-card > m-card-content > p")).toHaveLength(20)
    expect(parsed.querySelectorAll("#custom-tabs [data-tabs-list] > button")).toHaveLength(2)
    expect(cardHtml).not.toContain("data-m-card")
  })

  it("initializes after DOMContentLoaded with canonical Switch, Tabs and generated API", async () => {
    const parsed = new DOMParser().parseFromString(cardHtml, "text/html")
    document.body.replaceChildren(document.importNode(parsed.querySelector("main")!, true))
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "card.json"), "utf8"))
    const owners: Array<{ disconnect(): void }> = []
    const tabsFactory = vi.fn((root: HTMLElement) => {
      const owner = createTabs(root)
      owners.push(owner)
      return owner
    })
    vi.stubGlobal("MarkupUICard", cardRuntime)
    vi.stubGlobal("MarkupUITabs", { createTabs: tabsFactory })
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => docs })))
    const ready = vi.spyOn(document, "readyState", "get").mockReturnValue("loading")
    try {
      await import("../demo/components/card.js")
      document.dispatchEvent(new Event("DOMContentLoaded"))
      await vi.waitFor(() => expect(document.querySelectorAll("#card-api [data-api-type]")).toHaveLength(7))
      expect(document.getElementById("loading-switch")).toBeInstanceOf(Switch)
      expect(tabsFactory).toHaveBeenCalledOnce()
      const card = document.querySelector("#closable-card")!
      card.querySelector<HTMLButtonElement>("[data-part=close]")!.click()
      expect(document.querySelector("#close-message")?.textContent).toBe("Card Close")
      expect(card.isConnected).toBe(true)
      const loading = document.querySelector<HTMLInputElement>("#loading-control")!
      loading.click()
      expect(document.querySelector("#loading-card")?.getAttribute("aria-busy")).toBe("false")
      expect(document.querySelector<HTMLElement>("#loading-card m-card-content > [data-loaded-content]")!.hidden).toBe(false)
      document.querySelector<HTMLButtonElement>("#rocklife-tab")!.click()
      await vi.waitFor(() => expect(document.querySelector("#rocklife-tab")?.getAttribute("aria-selected")).toBe("true"))
      document.dispatchEvent(new Event("DOMContentLoaded"))
      expect(tabsFactory).toHaveBeenCalledOnce()
    } finally {
      for (const owner of owners) owner.disconnect()
      ready.mockRestore()
    }
  })

  it("keeps static consumers on canonical regions and legacy consumers explicitly load Card", () => {
    for (const file of ["config-provider", "global-style"]) {
      const html = readFileSync(resolve("demo", "components", `${file}.html`), "utf8")
      const parsed = new DOMParser().parseFromString(html, "text/html")
      expect(parsed.querySelectorAll("m-card > m-card-content").length).toBeGreaterThan(0)
      expect(html).not.toContain("data-m-card")
      expect(parsed.querySelector('link[href="../../dist/markup-ui-card.css"]')).not.toBeNull()
    }
    expect(readFileSync(resolve("demo", "legacy.html"), "utf8")).toContain('src="../dist/markup-ui-card.js"')
    expect(readFileSync(resolve("demo", "foundations.js"), "utf8")).toContain('import("../dist/markup-ui-card.js")')
  })
})

describe("component-by-component demo browser", () => {
  it("builds a responsive outline from examples and generated API headings, then disconnects cleanly", async () => {
    document.body.innerHTML = avatarHtml.slice(avatarHtml.indexOf("<body>") + 6, avatarHtml.indexOf("</body>"))
    const outline = createComponentOutline()
    try {
      const panel = document.querySelector<HTMLDetailsElement>(".component-outline > details")!
      expect(panel.open).toBe(true)
      expect(document.querySelector('.component-outline a[href="#size-heading"]')?.textContent).toBe("Size")
      const docs = JSON.parse(readFileSync(resolve("demo", "api", "avatar.json"), "utf8"))
      renderComponentApi(document.getElementById("avatar-api"), docs.elements)
      await Promise.resolve()
      expect(document.querySelector('.component-outline a[href="#api-m-avatar"]')?.textContent).toBe("Avatar")
      expect(document.querySelector('.component-outline a[href="#api-avatar-properties"]')?.textContent).toBe("properties")
      for (const link of document.querySelectorAll<HTMLAnchorElement>(".component-outline a")) {
        expect(document.getElementById(link.hash.slice(1))).not.toBeNull()
      }
      expect(document.querySelectorAll('.component-outline [aria-current="location"]')).toHaveLength(1)
      Object.defineProperty(media, "matches", { value: true, configurable: true })
      mediaListener?.()
      expect(panel.open).toBe(false)
      panel.open = true
      expect(document.querySelector('.component-outline a[href="#loading-heading"]')).toBeNull()
      const link = document.querySelector<HTMLAnchorElement>('.component-outline a[href="#size-heading"]')!
      document.querySelector(".component-outline nav")!.addEventListener("click", event => event.preventDefault())
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0, cancelable: true }))
      expect(panel.open).toBe(false)
      expect(document.activeElement).toBe(document.getElementById("size-heading"))
    } finally {
      outline.disconnect()
    }
    expect(document.querySelector(".component-outline")).toBeNull()
    expect(document.querySelector(".has-outline")).toBeNull()
    expect(media.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function))
  })

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
    expect(document.querySelector<HTMLElement>("#component-note")!.hidden).toBe(true)
    expect(document.querySelector(".component-toolbar")).toBeNull()
    expect(document.querySelector(".site-header #standalone-link")).not.toBeNull()
    frame.dispatchEvent(new Event("load"))
    expect(document.querySelector<HTMLElement>("#page-status")!.hidden).toBe(true)
  })

  it("reveals setup from documentation links and deep links, then removes its listeners", () => {
    document.body.innerHTML = avatarHtml.slice(avatarHtml.indexOf("<body>") + 6, avatarHtml.indexOf("</body>"))
    history.replaceState(null, "", "/demo/components/avatar.html#loading")
    const viewers = createExampleCodeViewers()
    const setup = document.querySelector<HTMLDetailsElement>(".component-setup")!
    const link = document.querySelector<HTMLAnchorElement>('.component-docs-nav a[href="#loading"]')!
    link.addEventListener("click", event => event.preventDefault())
    expect(setup.open).toBe(true)
    setup.open = false
    link.dispatchEvent(new MouseEvent("click", { button: 0, ctrlKey: true, cancelable: true }))
    expect(setup.open).toBe(false)
    link.dispatchEvent(new MouseEvent("click", { button: 0, cancelable: true }))
    expect(setup.open).toBe(true)
    setup.open = false
    window.dispatchEvent(new HashChangeEvent("hashchange"))
    expect(setup.open).toBe(true)
    viewers.disconnect()
    setup.open = false
    link.dispatchEvent(new MouseEvent("click", { button: 0, cancelable: true }))
    window.dispatchEvent(new HashChangeEvent("hashchange"))
    expect(setup.open).toBe(false)
  })

  it("adds one literal code viewer to each pinned Avatar example", async () => {
    const fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => avatarHtml,
    }))
    vi.stubGlobal("fetch", fetch)
    document.body.innerHTML = avatarHtml.slice(avatarHtml.indexOf("<body>") + 6, avatarHtml.indexOf("</body>"))
    const viewers = createExampleCodeViewers()
    const examples = [...document.querySelectorAll<HTMLElement>("[data-demo-example]")]
    expect(examples.map(example => example.dataset.demoExample)).toEqual([
      "size", "shape", "color", "badge", "icon", "content-size", "fallback", "group", "lazy", "show-debug",
    ])
    expect(document.querySelectorAll("[data-demo-code-toggle]")).toHaveLength(10)
    const toggle = examples[0]!.querySelector<HTMLElement>("[data-demo-code-toggle]")!
    const container = examples[0]!.querySelector<HTMLElement>(".demo-example-code-container")!
    const panel = container.querySelector<HTMLElement>(".demo-example-code")!
    const source = panel.querySelector<HTMLElement>("code")!
    toggle.click()
    await vi.waitFor(() => expect(source.dataset.loaded).toBe("true"))
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(toggle.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 512 512")
    expect(toggle.querySelectorAll("svg path")).toHaveLength(2)
    expect(source.textContent).toContain('<m-avatar size="small"')
    expect(source.querySelector('[data-code-token="tag"]')?.textContent).toBe("m-avatar")
    expect(source.querySelector('[data-code-token="attribute"]')?.textContent).toBe("size")
    expect(source.querySelector('[data-code-token="string"]')?.textContent).toBe('"small"')
    const sourceLines = source.textContent!.split("\n")
    expect(sourceLines[0]).toMatch(/^<m-avatar/)
    expect(sourceLines[1]).toMatch(/^<m-avatar/)
    expect(panel.querySelector("m-avatar")).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(1)
    toggle.click()
    expect(container.hidden).toBe(true)
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    viewers.disconnect()
  })

  it.each([
    ["Avatar", avatarHtml, ["size", "shape", "color", "badge", "icon", "content-size", "fallback", "group", "lazy", "show-debug"]],
    ["Button", buttonHtml, ["basic", "secondary", "tertiary", "quaternary", "dashed", "size", "text", "tag", "disabled", "icon", "events", "shape", "ghost", "loading", "color", "group", "icon-button", "popover"]],
    ["Card", cardHtml, ["basic", "size", "cover", "hoverable", "slots", "border", "segment", "closable", "no-title", "content-scrollable", "loading", "custom-style", "embedded"]],
    ["Carousel", carouselHtml, ["basic", "arrow", "autoplay", "dots", "vertical", "space-between", "hover", "keyboard", "custom-arrow-and-dots", "custom-dots"]],
    ["Collapse", collapseHtml, ["basic", "arrow-placement", "accordion", "nested", "display-directive", "item-header-click", "customize-icon", "default-expanded", "header-extra", "disabled", "trigger-areas"]],
    ["Divider", dividerHtml, ["basic", "content", "vertical"]],
    ["Dropdown", dropdownHtml, ["basic", "icon", "trigger", "cascade", "arrow", "placement", "size", "batch-render", "manual-position", "render", "option-props", "render-option"]],
    ["Icon", iconHtml, ["paint", "size", "depth", "wrapper", "live"]],
    ["Typography", typographyHtml, ["levels", "text", "alignment", "lists", "links", "rtl", "scope", "live"]],
  ])("keeps the supported %s demo inventory with per-example code controls", (_name, sourceHtml, expected) => {
    document.body.innerHTML = sourceHtml.slice(sourceHtml.indexOf("<body>") + 6, sourceHtml.indexOf("</body>"))
    const setup = document.querySelector<HTMLDetailsElement>(".component-setup")!
    expect(setup.open).toBe(false)
    expect(setup.querySelector("summary")?.textContent).toBe("Setup code")
    expect([...setup.children].map(element => element.tagName)).toEqual(["SUMMARY", "PRE", "A"])
    expect(setup.querySelector("a")?.getAttribute("href")).toBe("../setup.html")
    const snippet = new DOMParser().parseFromString(setup.querySelector("code")!.textContent!, "text/html")
    const family = _name.toLowerCase()
    expect(snippet.querySelector("link")?.getAttribute("href")).toBe(`./dist/markup-ui-${family}.css`)
    expect([...snippet.querySelectorAll("script")].map(script => script.getAttribute("src"))).toEqual([
      "./dist/markup-ui-core.global.js", `./dist/markup-ui-${family}.global.js`,
    ])
    expect(document.querySelector(".component-docs-nav a")?.textContent).toBe("Examples")
    for (const link of document.querySelectorAll<HTMLAnchorElement>(".component-docs-nav a")) {
      expect(document.getElementById(link.hash.slice(1))).not.toBeNull()
    }
    const viewers = createExampleCodeViewers()
    expect([...document.querySelectorAll<HTMLElement>("[data-demo-example]")]
      .map(example => example.dataset.demoExample)).toEqual(expected)
    expect(document.querySelectorAll("[data-demo-code-toggle]")).toHaveLength(expected.length)
    viewers.disconnect()
  })

  it("loads a deep link directly and preserves the standalone page link", () => {
    history.replaceState(null, "", "/demo/?component=tree-select")
    browser = createComponentBrowser()
    expect(browser.current).toBe("tree-select")
    expect(document.title).toBe("Tree Select - MarkupUI")
    expect(document.querySelector<HTMLIFrameElement>("#component-frame")!.title).toBe("Tree Select examples")
    expect(document.querySelector<HTMLAnchorElement>("#standalone-link")!.href).toContain("/demo/components/tree-select.html")
  })

  it("keeps shared loading and styling instructions on one standalone setup page", () => {
    const source = readFileSync(resolve("demo", "setup.html"), "utf8")
    const guide = new DOMParser().parseFromString(source, "text/html")
    expect(guide.querySelector("h1")?.textContent).toBe("Setup")
    expect([...guide.querySelectorAll("main > section")].map(section => section.id)).toEqual([
      "classic", "modules", "styles", "local",
    ])
    expect(guide.querySelector("script")).toBeNull()
    expect(guide.querySelector('link[href="./component-api.css"]')).not.toBeNull()
    expect(guide.querySelector(".component-docs-nav a")?.getAttribute("href")).toBe("./")
    for (const link of guide.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      expect(guide.getElementById(link.getAttribute("href")!.slice(1))).not.toBeNull()
    }
    expect(source).toContain("pnpm build")
    expect(source).toContain("pnpm demo")
  })

  it("navigates one component at a time and restores the component on browser history changes", () => {
    browser = createComponentBrowser()
    const previousFrame = document.querySelector("#component-frame")
    document.querySelector<HTMLAnchorElement>('[data-component="button"]')!.click()
    expect(location.search).toBe("?component=button")
    expect(browser.current).toBe("button")
    expect(document.querySelector('a[aria-current="page"]')?.textContent).toBe("Button")
    expect(document.activeElement?.id).toBe("component-frame")
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
    expect(document.querySelector("#page-status")?.textContent).toContain("Component not found")
    expect(document.title).toBe("Component not found - MarkupUI")
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
    expect(document.activeElement).toBe(toggle.querySelector("button"))
    Object.defineProperty(media, "matches", { value: false, configurable: true })
    mediaListener?.()
    expect(sidebar.hidden).toBe(false)
    expect(toggle.hidden).toBe(true)
  })

  it("keeps alternative/exclusion pages explicit", () => {
    history.replaceState(null, "", "/demo/?component=qr-code")
    browser = createComponentBrowser()
    expect(document.querySelector("#component-note")?.textContent).toContain("exclusion")
    expect(document.querySelector<HTMLElement>("#component-note")!.hidden).toBe(false)
  })

  it("loads MarkupUI shell controls and keeps legacy styles before showcase overrides", () => {
    expect(html).toContain('href="./app.css"')
    expect(html).toContain('src="./app.js"')
    expect(html).toContain('../dist/markup-ui-button.css')
    expect(html).toContain('../dist/markup-ui-input.css')
    expect(html).toContain('../dist/markup-ui-button.global.js')
    expect(html.indexOf('markup-ui-core.global.js')).toBeLessThan(html.indexOf('markup-ui-button.global.js'))
    expect(buttonHtml.indexOf('markup-ui-core.global.js')).toBeLessThan(buttonHtml.indexOf('markup-ui-button.global.js'))
    expect(buttonHtml).toContain('id="button-api"')
    expect(css).toContain("min-block-size: 34px")
    expect(css).toContain(".component-link { min-block-size: 42px; }")
    expect(css).toContain('.component-link[aria-current="page"]')
    expect(exampleCodeCss).toContain("grid-template-columns: minmax(0, 1fr)")
    expect(exampleCodeCss).not.toContain("repeat(2")
    expect(avatarHtml).toContain('markup-ui-button.css')
    expect(avatarHtml).toContain('markup-ui-input.css')
    expect(avatarHtml).toContain('markup-ui-slider.css')
    expect(avatarHtml).toContain('markup-ui-badge.css')
    expect(avatarHtml).toContain('markup-ui-icon.css')
    expect(avatarHtml).toContain('markup-ui-code.css')
    expect(avatarHtml).toContain('src="../example-code.js"')
    expect(avatarHtml.match(/data-demo-example=/g)).toHaveLength(10)
    const legacy = readFileSync(resolve("demo", "legacy.html"), "utf8")
    expect(legacy.indexOf('id="m-styles"')).toBeLessThan(legacy.indexOf('href="./legacy.css"'))
    expect(legacy).toContain('src="./legacy.js"')
    expect(readFileSync(resolve("demo", "legacy.js"), "utf8")).toContain('fetch("./legacy.html")')
  })
})
