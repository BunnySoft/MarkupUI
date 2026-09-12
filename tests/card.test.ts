import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { createContext, runInContext } from "node:vm"
import { gzipSync } from "node:zlib"
import {
  Card, CardAction, CardContent, CardCover, CardFooter, CardHeader, CardHeaderExtra, registerCard,
} from "../src/components/card/index.js"
import type { CardCloseDetail } from "../src/components/card/index.js"
import * as cardApi from "../src/components/card/index.js"
import { ViewElement } from "../src/core/index.js"
import { builtInElementNames, registerElements } from "../src/components/elements.js"

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

function card(markup = "<m-card>Content</m-card>"): Card {
  document.body.innerHTML = markup
  const element = document.querySelector("m-card")
  if (!(element instanceof Card)) throw new Error("Card was not upgraded")
  return element
}

function closeButton(element: Card): HTMLButtonElement {
  return element.querySelector<HTMLButtonElement>(":scope > :is(m-card-header, [data-part=header]) > [data-part=close]")!
}

describe("direct Card API", () => {
  it("exports only its own classes and registration, with shared-base identity and own tags", () => {
    expect(Object.keys(cardApi).sort()).toEqual([
      "Card", "CardAction", "CardContent", "CardCover", "CardFooter", "CardHeader", "CardHeaderExtra", "registerCard",
    ])
    for (const type of [Card, CardCover, CardHeader, CardHeaderExtra, CardContent, CardFooter, CardAction]) {
      expect(ViewElement.prototype.isPrototypeOf(type.prototype)).toBe(true)
      expect(Object.hasOwn(type, "tag")).toBe(true)
      expect(customElements.get(type.tag)).toBe(type)
      expect("meta" in type).toBe(false)
    }
  })

  it("defines defaults and validates choices, string setters and boolean-text values directly", () => {
    const element = document.createElement("m-card") as Card
    expect(element.title).toBe("")
    expect(element.size).toBe("medium")
    expect(element.bordered && element.closeFocusable).toBe(true)
    expect(element.closeLabel).toBe("Close card")
    expect(element.segmentedContent).toBeNull()
    expect(element.segmentedFooter).toBeNull()
    expect(element.segmentedAction).toBeNull()
    for (const property of ["closable", "hoverable", "embedded", "segmented", "contentScrollable"] as const) {
      expect(element[property]).toBe(false)
      element[property] = true
      expect(element[property]).toBe(true)
      element[property] = false
      expect(element[property]).toBe(false)
      expect(() => Reflect.set(element, property, "false")).toThrow(RangeError)
    }
    for (const size of ["small", "medium", "large", "huge"] as const) {
      element.size = size
      expect(element.size).toBe(size)
    }
    expect(() => Reflect.set(element, "size", "giant")).toThrow(RangeError)
    expect(element.size).toBe("huge")
    element.setAttribute("size", "")
    expect(() => element.size).toThrow(RangeError)
    element.removeAttribute("size")
    expect(element.size).toBe("medium")
    for (const [property, attribute] of [["bordered", "bordered"], ["closeFocusable", "close-focusable"]] as const) {
      element[property] = false
      expect(element.getAttribute(attribute)).toBe("false")
      for (const value of ["", "true"]) {
        element.setAttribute(attribute, value)
        expect(element[property]).toBe(true)
      }
      element.setAttribute(attribute, "maybe")
      expect(() => element[property]).toThrow(RangeError)
      element.removeAttribute(attribute)
      expect(element[property]).toBe(true)
      expect(() => Reflect.set(element, property, 1)).toThrow(RangeError)
    }
    for (const property of ["title", "closeLabel"]) {
      expect(() => Reflect.set(element, property, 42)).toThrow(RangeError)
    }
    element.closeLabel = "  Dismiss report  "
    expect(element.closeLabel).toBe("Dismiss report")
    element.closeLabel = " "
    expect(element.closeLabel).toBe("Close card")
    element.setAttribute("closable", "false")
    expect(element.closable).toBe(true)
  })

  it("keeps segmentation a finite nullable choice with independent regional overrides", () => {
    const element = card()
    element.segmented = true
    for (const [property, attribute] of [
      ["segmentedContent", "segmented-content"], ["segmentedFooter", "segmented-footer"], ["segmentedAction", "segmented-action"],
    ] as const) {
      for (const value of ["", "true", "false", "soft"] as const) {
        element[property] = value
        expect(element[property]).toBe(value)
        expect(element.getAttribute(attribute)).toBe(value)
      }
      expect(() => Reflect.set(element, property, true)).toThrow(RangeError)
      expect(() => Reflect.set(element, property, "hard")).toThrow(RangeError)
      element.setAttribute(attribute, "invalid")
      expect(() => element[property]).toThrow(RangeError)
      element[property] = null
      expect(element.hasAttribute(attribute)).toBe(false)
      expect(element[property]).toBeNull()
    }
    expect(element.segmented).toBe(true)
  })

  it("atomically registers the family and rejects incompatible definitions", () => {
    expect(() => registerCard()).not.toThrow()
    const define = vi.fn()
    expect(() => registerCard({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerCard({
      get: name => name === "m-card-header-extra" ? class extends HTMLElement {} : undefined, define,
    })).toThrow("'m-card-header-extra' is already defined")
    expect(define).not.toHaveBeenCalled()
  })

  it("removes aggregate Card registrations rather than selecting by load order", () => {
    expect(builtInElementNames.filter(name => name === "m-card" || name.startsWith("m-card-"))).toEqual([])
    const define = vi.fn()
    registerElements({ get: () => undefined, define } as unknown as CustomElementRegistry)
    expect(define.mock.calls.some(([name]) => String(name).startsWith("m-card"))).toBe(false)
    registerElements(customElements)
    expect(customElements.get("m-card")).toBe(Card)
    expect(closeButton(card("<m-card closable>Content</m-card>"))).toBeInstanceOf(HTMLButtonElement)
  })

  it("upgrades all own accessors before definition and preserves authored input state", () => {
    document.body.innerHTML = "<test-late-card><input value=Initial></test-late-card>"
    const element = document.querySelector("test-late-card") as Card
    const input = element.querySelector("input")!
    input.value = "Edited"
    Object.defineProperty(element, "title", { value: "Late", configurable: true })
    Object.assign(element, {
      closable: true, closeFocusable: false, closeLabel: "Dismiss", size: "huge", bordered: false,
      hoverable: true, embedded: true, segmented: true, contentScrollable: true,
      segmentedContent: "false", segmentedFooter: "soft", segmentedAction: "true",
    })
    customElements.define("test-late-card", class extends Card {})
    expect(element.querySelector("[data-part=title]")?.textContent).toBe("Late")
    expect(closeButton(element).tabIndex).toBe(-1)
    expect(closeButton(element).getAttribute("aria-label")).toBe("Dismiss")
    expect(element.querySelector("input")).toBe(input)
    expect(input.value).toBe("Edited")
    expect(element.size).toBe("huge")
    expect(element.bordered).toBe(false)
    expect(element.hoverable && element.embedded && element.segmented && element.contentScrollable).toBe(true)
    expect([element.segmentedContent, element.segmentedFooter, element.segmentedAction]).toEqual(["false", "soft", "true"])
  })
})

describe("Card shared-core distribution", () => {
  it("requires core first, registers only its own classes and shares the exact base", () => {
    const component = readFileSync("dist\\markup-ui-card.global.js", "utf8")
    const define = vi.fn()
    expect(() => runInContext(component, createContext({
      HTMLElement, customElements: { get: vi.fn(), define },
    }))).toThrow("Load compatible markup-ui-core.global.js")
    expect(define).not.toHaveBeenCalled()
    const entries = new Map<string, unknown>()
    const context = createContext({
      HTMLElement,
      customElements: {
        get: (name: string) => entries.get(name),
        define: (name: string, constructor: unknown) => { entries.set(name, constructor) },
      },
    })
    runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
    expect(entries.size).toBe(0)
    runInContext(component, context)
    expect([...entries.keys()]).toEqual([
      "m-card", "m-card-cover", "m-card-header", "m-card-header-extra", "m-card-content", "m-card-footer", "m-card-action",
    ])
    for (const name of ["Card", "CardCover", "CardHeader", "CardHeaderExtra", "CardContent", "CardFooter", "CardAction"]) {
      expect(runInContext(`MarkupUICard.${name}.prototype instanceof MarkupUICore.ViewElement`, context)).toBe(true)
    }
    expect(runInContext("Object.keys(MarkupUICard).sort().join(',')", context))
      .toBe("Card,CardAction,CardContent,CardCover,CardFooter,CardHeader,CardHeaderExtra,registerCard")
    expect(runInContext("'meta' in MarkupUICard.Card", context)).toBe(false)
    expect(() => runInContext(component, context)).toThrow()
  })

  it("externalizes ESM core, excludes unrelated runtime sources and packages no documentation", () => {
    expect(readFileSync("dist\\markup-ui-card.js", "utf8")).toContain("./markup-ui-core.js")
    for (const suffix of [".js", ".global.js"]) {
      const map = JSON.parse(readFileSync(`dist\\markup-ui-card${suffix}.map`, "utf8"))
      expect(map.sources.filter((source: string) => source.includes("/src/"))
        .every((source: string) => source.includes("/src/components/card/"))).toBe(true)
      const code = readFileSync(`dist\\markup-ui-card${suffix}`, "utf8")
      expect(code).not.toMatch(/cardDefinition|component-api|__decorate|demo\/api/)
    }
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./card"]).toEqual({
      types: "./dist/components/card/index.d.ts", import: "./dist/markup-ui-card.js",
    })
  })

  it.each([["esm", ".js"], ["classic", ".global.js"]])("accounts for %s Card, core and CSS within every unchanged budget", (mode, suffix) => {
    const file = `markup-ui-card${suffix}`
    const core = `markup-ui-core${suffix}`
    const measure = (name: string) => gzipSync(readFileSync(`dist\\${name}`), { level: 9 }).length
    const runtime = measure(core) + measure(file)
    expect(measure(core)).toBeLessThanOrEqual(4000)
    expect(measure(file)).toBeLessThanOrEqual(3000)
    expect(measure("markup-ui-card.css")).toBeLessThanOrEqual(2500)
    expect(runtime).toBeLessThanOrEqual(7000)
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    expect(manifest.componentPayloads.card[mode!]).toMatchObject({
      file, dependencies: [core], runtimeGzipBytes: runtime, runtimeBudget: 7000,
      totalGzipBytes: runtime + measure("markup-ui-card.css"),
    })
  })
})

describe("Card light-DOM ownership", () => {
  it("adopts free-form text and controls without cloning or losing listeners", () => {
    const element = document.createElement("m-card") as Card
    const text = document.createTextNode("Free-form ")
    const button = document.createElement("button")
    const action = vi.fn()
    button.addEventListener("click", action)
    element.append(text, button)
    document.body.append(element)
    expect([...element.querySelector("[data-part=content]")!.childNodes]).toEqual([text, button])
    button.click()
    expect(action).toHaveBeenCalledOnce()
    expect(element.dataset.part).toBe("card")
    expect(element.dataset.state).toBe("structured")
    expect(element.hasAttribute("role") || element.hasAttribute("tabindex") || element.hasAttribute("structured")).toBe(false)
    expect(element.shadowRoot).toBeNull()
    expect(element.querySelector("style, [style]")).toBeNull()
    expect(element.hasAttribute("style")).toBe(false)
  })

  it("preserves six canonical regions, authored semantics and reconnect identity", () => {
    const element = card(`<m-card closable role="region" aria-labelledby="heading">
      <m-card-cover><img alt="Cover"></m-card-cover>
      <m-card-header><h2 id="heading">Heading</h2></m-card-header>
      <m-card-header-extra><button type="button">Extra</button></m-card-header-extra>
      <m-card-content>Content</m-card-content><m-card-footer>Footer</m-card-footer><m-card-action>Action</m-card-action>
    </m-card>`)
    const header = element.querySelector("m-card-header")!
    expect(header.querySelector("m-card-header-extra")).not.toBeNull()
    expect(header.lastElementChild).toBe(closeButton(element))
    const children = [...element.children]
    expect(children.map(child => child.localName)).toEqual(["m-card-cover", "m-card-header", "m-card-content", "m-card-footer", "m-card-action"])
    expect(element.getAttribute("role")).toBe("region")
    expect(element.getAttribute("aria-labelledby")).toBe("heading")
    expect(header.hasAttribute("role")).toBe(false)
    element.remove()
    document.body.append(element)
    expect([...element.children]).toEqual(children)
  })

  it("generates safe title text only when there is no explicit header", () => {
    const element = card()
    const content = element.querySelector("[data-part=content]")
    element.title = "<img src=x onerror=alert(1)>"
    const title = element.querySelector("[data-part=title]")!
    expect(title.textContent).toBe("<img src=x onerror=alert(1)>")
    expect(title.querySelector("img")).toBeNull()
    expect(title.hasAttribute("role")).toBe(false)
    element.title = "Changed"
    expect(element.querySelector("[data-part=title]")).toBe(title)
    expect(title.textContent).toBe("Changed")
    element.removeAttribute("title")
    expect(element.querySelector("[data-part=header]")).toBeNull()
    expect(element.querySelector("[data-part=content]")).toBe(content)
    const authored = card('<m-card title="Fallback"><m-card-header><h2>Authored</h2></m-card-header>Body</m-card>')
    const heading = authored.querySelector("h2")
    authored.title = "Changed fallback"
    expect(authored.querySelector("[data-part=title]")).toBeNull()
    expect(authored.querySelector("h2")).toBe(heading)
    expect(heading?.textContent).toBe("Authored")
  })

  it("adopts a late explicit header while retaining authored extras and the close button", async () => {
    const element = card('<m-card title="Fallback" closable><m-card-header-extra><button>Extra</button></m-card-header-extra>Body</m-card>')
    const extra = element.querySelector("m-card-header-extra")!
    const close = closeButton(element)
    const header = document.createElement("m-card-header")
    const heading = document.createElement("h2")
    header.append(heading)
    element.prepend(header)
    await Promise.resolve()
    expect(element.querySelector("[data-part=header]")).toBeNull()
    expect([...header.children]).toEqual([heading, extra, close])
    expect(element.querySelector("[data-part=title]")).toBeNull()
  })

  it("adopts late content and subsequent text without replacing authored nodes", async () => {
    const element = card("<m-card><strong>Original</strong></m-card>")
    const original = element.querySelector("strong")!
    const clicked = vi.fn()
    original.addEventListener("click", clicked)
    const content = document.createElement("m-card-content")
    content.textContent = "New"
    element.append(content)
    await Promise.resolve()
    expect(element.querySelector("[data-part=content]")).toBeNull()
    expect(content.firstChild).toBe(original)
    original.click()
    expect(clicked).toHaveBeenCalledOnce()
    expect(content.textContent).toBe("OriginalNew")
    element.append(" Late")
    await Promise.resolve()
    expect(content.textContent).toBe("OriginalNew Late")
  })

  it("places generated regions around cover/footer/action and leaves inert nodes alone", () => {
    const element = card('<m-card title="Title"><m-card-cover>Cover</m-card-cover><m-card-footer>Footer</m-card-footer><m-card-action>Action</m-card-action>Body</m-card>')
    expect([...element.children].map(child => child.textContent)).toEqual(["Cover", "Title", "Body", "Footer", "Action"])
    const inert = card('<m-card><template><button>Inert</button></template><script type="application/json">{}</script><style></style>Body</m-card>')
    const children = [...inert.children]
    const template = inert.querySelector("template")!
    expect(template.parentElement).toBe(inert)
    expect(template.content.querySelector("button")?.textContent).toBe("Inert")
    expect(inert.querySelector("button")).toBeNull()
    inert.title = "Title"
    expect([...inert.children].filter(child => child !== inert.querySelector("[data-part=header]"))).toEqual(children)
  })

  it("preserves duplicate authored regions in place and only manages the first header/content", async () => {
    const element = card("<m-card closable><m-card-footer>First</m-card-footer><m-card-content>A</m-card-content><m-card-content>B</m-card-content><m-card-header>H1</m-card-header><m-card-header>H2</m-card-header>Loose</m-card>")
    const children = [...element.children]
    expect(element.querySelectorAll("m-card-content")[0]?.textContent).toBe("ALoose")
    expect(element.querySelectorAll("m-card-content")[1]?.textContent).toBe("B")
    expect(element.querySelector("m-card-header")?.lastChild).toBe(closeButton(element))
    element.append(" Later")
    await Promise.resolve()
    expect([...element.children]).toEqual(children)
    expect(element.querySelectorAll("m-card-header")[1]?.textContent).toBe("H2")
  })

  it("does not mistake private-looking authored nodes or nested regions for its own", () => {
    const element = card('<m-card><div data-part="header"><button data-part="close">Authored</button></div><m-card title="Inner"><m-card-content>Inner body</m-card-content></m-card></m-card>')
    const content = element.querySelector(":scope > [data-part=content]")!
    expect(content.querySelector("[data-part=header]")?.parentElement).toBe(content)
    expect(element.querySelector(":scope > [data-part=header]")).toBeNull()
    expect(content.querySelector("m-card-content")?.textContent).toBe("Inner body")
  })

  it("disconnects observers/listeners and reconnects with edited input and one close control", async () => {
    const element = card('<m-card closable title="Before"><input value="Initial"></m-card>')
    const close = closeButton(element)
    const input = element.querySelector("input")!
    input.value = "Edited"
    const intent = vi.fn()
    element.addEventListener("m:close", intent)
    element.remove()
    close.click()
    element.title = "After"
    await Promise.resolve()
    expect(intent).not.toHaveBeenCalled()
    expect(element.querySelector("[data-part=title]")?.textContent).toBe("Before")
    document.body.append(element)
    expect(closeButton(element)).toBe(close)
    expect(element.querySelector("[data-part=title]")?.textContent).toBe("After")
    expect(element.querySelector("input")).toBe(input)
    expect(input.value).toBe("Edited")
    close.click()
    expect(intent).toHaveBeenCalledOnce()
    expect(element.querySelectorAll("[data-part=close]")).toHaveLength(1)
  })

  it("repairs removed private controls without resurrecting replaced authored content", async () => {
    const element = card('<m-card closable title="Fallback"><m-card-header>Old header</m-card-header><m-card-content><input value="Old"></m-card-content></m-card>')
    const close = closeButton(element)
    const oldInput = element.querySelector("input")!
    element.innerHTML = "<m-card-header>New header</m-card-header><m-card-content>New content</m-card-content>"
    await Promise.resolve()
    expect(closeButton(element)).toBe(close)
    expect(element.contains(oldInput)).toBe(false)
    expect(element.textContent).not.toContain("Old")
    close.remove()
    await Promise.resolve()
    expect(closeButton(element)).toBe(close)
    element.replaceChildren("New loose content")
    await Promise.resolve()
    element.closable = false
    element.title = ""
    element.querySelector("[data-part=content]")!.replaceChildren()
    await Promise.resolve()
    expect(element.children).toHaveLength(0)
    expect(element.dataset.state).toBe("")
  })

  it("recognizes late canonical regions and direct text character changes", async () => {
    const element = card("<m-card></m-card>")
    const header = document.createElement("m-card-header")
    header.textContent = "Header"
    element.append(header)
    await Promise.resolve()
    expect(header.parentElement).toBe(element)
    const text = document.createTextNode("")
    element.append(text)
    await Promise.resolve()
    text.data = "Now content"
    await Promise.resolve()
    expect(text.parentElement).toBe(element.querySelector("[data-part=content]"))
  })
})

describe("native Card close intent", () => {
  it("emits one bubbling cancelable event without hiding, removing or submitting", () => {
    const element = card('<form><m-card closable title="Dismissible">Body</m-card></form>')
    const close = closeButton(element)
    const submit = vi.fn((event: Event) => event.preventDefault())
    document.querySelector("form")!.addEventListener("submit", submit)
    const intent = vi.fn((event: Event) => event.preventDefault())
    document.body.addEventListener("m:close", intent, { once: true })
    close.click()
    expect(intent).toHaveBeenCalledOnce()
    const event = intent.mock.calls[0]![0] as CustomEvent<CardCloseDetail>
    expect(event.target).toBe(element)
    expect(event.cancelable && event.defaultPrevented && event.bubbles).toBe(true)
    expect(event.composed).toBe(false)
    expect(event.detail.originalEvent.target).toBe(close)
    expect(close.type).toBe("button")
    expect(submit).not.toHaveBeenCalled()
    close.click()
    expect(element.isConnected).toBe(true)
    expect(element.hidden).toBe(false)
  })

  it("leaves keyboard activation native and does not synthesize clicks", () => {
    const element = card("<m-card closable>Body</m-card>")
    const intent = vi.fn()
    element.addEventListener("m:close", intent)
    for (const key of ["Enter", " "]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
      closeButton(element).dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(intent).not.toHaveBeenCalled()
    closeButton(element).click()
    expect(intent).toHaveBeenCalledOnce()
  })

  it("names the native button, hides its icon and updates focus/label overrides live", () => {
    const element = card("<m-card closable>Body</m-card>")
    const close = closeButton(element)
    expect(close.getAttribute("aria-label")).toBe("Close card")
    expect(close.querySelector("span")?.getAttribute("aria-hidden")).toBe("true")
    expect(close.querySelector("span")?.textContent).toBe("")
    expect(close.tabIndex).toBe(0)
    close.focus()
    expect(document.activeElement).toBe(close)
    element.closeLabel = " Dismiss report "
    expect(close.getAttribute("aria-label")).toBe("Dismiss report")
    element.closeFocusable = false
    expect(close.tabIndex).toBe(-1)
    element.closeFocusable = true
    expect(close.tabIndex).toBe(0)
    element.closeLabel = " "
    expect(close.getAttribute("aria-label")).toBe("Close card")
  })

  it("removes generated-only headers and close listeners but retains authored header content", () => {
    const element = card("<m-card closable>Body</m-card>")
    const close = closeButton(element)
    const intent = vi.fn()
    element.addEventListener("m:close", intent)
    element.closable = false
    close.click()
    expect(intent).not.toHaveBeenCalled()
    expect(element.querySelector("[data-part=header]")).toBeNull()
    expect(element.textContent).toBe("Body")
    element.closable = true
    closeButton(element).click()
    expect(intent).toHaveBeenCalledOnce()
    const authored = card("<m-card closable><m-card-header><h2>Heading</h2><button>Action</button></m-card-header>Body</m-card>")
    const header = authored.querySelector("m-card-header")!
    const action = header.querySelector("button")
    authored.closable = false
    expect(authored.querySelector("m-card-header")).toBe(header)
    expect(header.querySelector("button")).toBe(action)
    expect(header.children).toHaveLength(2)
  })

  it("does not duplicate a nested close event or steal an inner header-extra", () => {
    const outer = card('<m-card closable title="Outer"><m-card closable title="Inner"><m-card-header-extra>Inner extra</m-card-header-extra>Body</m-card></m-card>')
    const inner = outer.querySelector("m-card") as Card
    const intent = vi.fn()
    outer.addEventListener("m:close", intent)
    closeButton(inner).click()
    expect(intent).toHaveBeenCalledOnce()
    expect(intent.mock.calls[0]![0].target).toBe(inner)
    expect(inner.querySelector("m-card-header-extra")).not.toBeNull()
    expect(outer.isConnected && inner.isConnected).toBe(true)
  })

  it("respects native disabled buttons and disabled fieldsets", () => {
    const element = card("<fieldset disabled><m-card closable>Body</m-card></fieldset>")
    const intent = vi.fn()
    element.addEventListener("m:close", intent)
    const close = closeButton(element)
    close.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    expect(intent).not.toHaveBeenCalled()
    document.querySelector("fieldset")!.disabled = false
    close.disabled = true
    close.click()
    expect(intent).not.toHaveBeenCalled()
    close.disabled = false
    close.click()
    expect(intent).toHaveBeenCalledOnce()
  })
})

describe("audited Card styles", () => {
  const css = readFileSync("src\\components\\card\\card.css", "utf8")
  it("preserves supported tokens, asymmetric size geometry and local palette fallbacks", () => {
    for (const value of [
      "var(--m-card-font-size, var(--m-font-size, 14px))",
      "var(--m-card-line-height, var(--m-line-height, 1.6))",
      "var(--m-card-focus-color, var(--m-focus-ring, #2080f080))",
      "var(--m-card-target-color, var(--m-color-primary, var(--_m-card-primary, #18a058)))",
      "var(--m-card-background, var(--_m-card-surface, #fff))",
      "var(--m-card-border-color, var(--_m-card-border, #efeff5))",
      "var(--m-card-title-weight, 500)", "var(--m-card-radius, 3px)",
      "--_m-card-top: 19px", "--_m-card-bottom: 20px",
      "padding: 0 var(--m-card-padding, var(--_m-card-padding)) var(--m-card-padding, var(--_m-card-bottom))",
      '[bordered="false"] { border: 0; }',
    ]) expect(css).toContain(value)
    for (const [size, horizontal, top, bottom] of [["small", 16, 12, 12], ["large", 32, 23, 24], ["huge", 40, 27, 28]]) {
      expect(css).toContain(`[size="${size}"] { --_m-card-padding: ${horizontal}px; --_m-card-top: ${top}px; --_m-card-bottom: ${bottom}px;`)
    }
    expect(css).not.toMatch(/--m-(bg-surface|bg-muted|text-primary|text-secondary|border-hover)\b/)
    expect(css).not.toMatch(/(?:^|[;{])\s*--m-card-[\w-]+\s*:/m)
    expect(css).not.toContain("justify-content: flex-end")
  })

  it("resets private palette defaults at nested explicit light boundaries", () => {
    const light = css.match(/:where\(\[data-m-theme="light"\]\) \{([^}]+)\}/)![1]!
    const dark = css.match(/:where\(\[data-m-theme="dark"\]\) \{([^}]+)\}/)![1]!
    const names = [...dark.matchAll(/(--_m-card-[\w-]+):/g)].map(match => match[1])
    expect(names).toHaveLength(11)
    for (const name of names) expect(light).toContain(`${name}: initial;`)
  })

  it("keeps close paint owner-scoped, font-independent and reduced-motion aware", () => {
    expect(css).not.toContain("data-m-card")
    for (const value of [
      "width: var(--m-card-close-size, 18px)", "inset: -2px", "transform: rotate(-45deg)",
      "@media (prefers-reduced-motion: reduce)", '[data-part="close"]::before { transition: none; }',
      'm-card[data-part="card"][data-part="card"] > *',
    ]) expect(css).toContain(value)
    expect(css).not.toMatch(/m-card\[data-part="card"\] \[data-part="close"\]/)
  })

  it("uses hidden-aware direct region ordering and confines scrolling to content", () => {
    expect(css).toContain(':not([hidden]) ~ :is(m-card-content, [data-part="content"], m-card-footer, m-card-action)')
    expect(css).toContain('m-card[data-part="card"][content-scrollable] > :is(m-card-content, [data-part="content"]) { overflow: auto; overscroll-behavior: contain; }')
    expect(css).toContain('[segmented-content="soft"]')
    expect(css).toContain('[segmented-footer="soft"]')
    expect(css).toContain('[segmented-action="soft"]')
  })
})
