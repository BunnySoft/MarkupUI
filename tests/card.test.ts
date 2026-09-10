import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { MuiCard, registerCard } from "../src/components/card/index.js"
import type { CardCloseDetail } from "../src/components/card/index.js"
import { registerElements } from "../src/components/elements.js"

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

function card(markup = "<mui-card>Content</mui-card>"): MuiCard {
  document.body.innerHTML = markup
  const element = document.querySelector("mui-card")
  if (!(element instanceof MuiCard)) throw new Error("Card was not upgraded")
  return element
}

function closeButton(element: MuiCard): HTMLButtonElement {
  return element.querySelector<HTMLButtonElement>("[data-mui-card-close]")!
}

describe("standalone Card", () => {
  it("wraps free-form content without cloning nodes or discarding listeners", () => {
    const element = document.createElement("mui-card") as MuiCard
    const text = document.createTextNode("Free-form ")
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = "Action"
    const action = vi.fn()
    button.addEventListener("click", action)
    element.append(text, button)
    document.body.append(element)
    const content = element.querySelector("[data-mui-card-content]")!
    expect([...content.childNodes]).toEqual([text, button])
    button.click()
    expect(action).toHaveBeenCalledOnce()
    expect(element.hasAttribute("structured")).toBe(true)
    expect(element.hasAttribute("role")).toBe(false)
    expect(element.hasAttribute("tabindex")).toBe(false)
  })

  it("preserves legacy compound regions without registering passive controllers", () => {
    const element = card("<mui-card><mui-card-header><h2>Heading</h2></mui-card-header><mui-card-content>Content</mui-card-content><mui-card-footer>Footer</mui-card-footer></mui-card>")
    const children = [...element.children]
    expect(children.map((child) => child.localName)).toEqual(["mui-card-header", "mui-card-content", "mui-card-footer"])
    expect(customElements.get("mui-card-header")).toBeUndefined()
    expect(customElements.get("mui-card-content")).toBeUndefined()
    expect(element.hasAttribute("structured")).toBe(true)
    element.remove()
    document.body.append(element)
    expect([...element.children]).toEqual(children)
  })

  it("supports all six native anatomy regions and moves a direct extra into the header", () => {
    const element = card(`<mui-card closable role="region" aria-labelledby="heading">
      <div data-mui-card-cover><img alt="Cover"></div>
      <header data-mui-card-header><h2 id="heading">Heading</h2></header>
      <div data-mui-card-header-extra><button type="button">Extra</button></div>
      <section data-mui-card-content>Content</section>
      <footer data-mui-card-footer>Footer</footer>
      <div data-mui-card-action>Action</div>
    </mui-card>`)
    const header = element.querySelector("header")!
    expect(header.querySelector("[data-mui-card-header-extra]")).not.toBeNull()
    expect(header.lastElementChild).toBe(closeButton(element))
    expect(element.children).toHaveLength(5)
    expect(element.getAttribute("role")).toBe("region")
    expect(element.getAttribute("aria-labelledby")).toBe("heading")
    expect(header.hasAttribute("role")).toBe(false)
  })

  it("generates a safe text title without inferring heading level or replacing body content", () => {
    const element = card()
    const content = element.querySelector("[data-mui-card-content]")
    element.title = "<img src=x onerror=alert(1)>"
    const title = element.querySelector("[data-mui-card-title]")!
    expect(title.textContent).toBe("<img src=x onerror=alert(1)>")
    expect(title.querySelector("img")).toBeNull()
    expect(title.hasAttribute("role")).toBe(false)
    element.title = "Changed"
    expect(element.querySelector("[data-mui-card-title]")).toBe(title)
    expect(title.textContent).toBe("Changed")
    expect(element.querySelector("[data-mui-card-content]")).toBe(content)
    element.removeAttribute("title")
    expect(element.querySelector("[data-mui-card-header]")).toBeNull()
    expect(element.querySelector("[data-mui-card-content]")).toBe(content)
  })

  it("gives authored headers precedence over the title convenience", () => {
    const element = card('<mui-card title="Fallback"><header data-mui-card-header><h2>Authored</h2></header><p>Body</p></mui-card>')
    const heading = element.querySelector("h2")!
    element.title = "Changed fallback"
    expect(element.querySelector("[data-mui-card-title]")).toBeNull()
    expect(element.querySelector("h2")).toBe(heading)
    expect(heading.textContent).toBe("Authored")
  })

  it("adopts late authored headers and keeps close last while preserving extra nodes", async () => {
    const element = card('<mui-card title="Fallback" closable><div data-mui-card-header-extra><button type="button">Extra</button></div>Body</mui-card>')
    const extra = element.querySelector("[data-mui-card-header-extra]")!
    const close = closeButton(element)
    const header = document.createElement("header")
    header.setAttribute("data-mui-card-header", "")
    const heading = document.createElement("h2")
    heading.textContent = "Authored"
    header.append(heading)
    element.prepend(header)
    await Promise.resolve()
    expect(element.querySelectorAll("[data-mui-card-header]")).toHaveLength(1)
    expect(header.contains(extra)).toBe(true)
    expect(header.contains(heading)).toBe(true)
    expect([...header.children]).toEqual([heading, extra, close])
    expect(header.lastElementChild).toBe(close)
    expect(element.querySelector("[data-mui-card-title]")).toBeNull()
  })

  it("adopts late explicit content and preserves all previous free-form nodes", async () => {
    const element = card("<mui-card><strong>Original</strong></mui-card>")
    const original = element.querySelector("strong")!
    const clicked = vi.fn()
    original.addEventListener("click", clicked)
    const content = document.createElement("section")
    content.setAttribute("data-mui-card-content", "")
    content.textContent = "New"
    element.append(content)
    await Promise.resolve()
    expect(element.querySelectorAll("[data-mui-card-content]")).toHaveLength(1)
    expect(content.firstChild).toBe(original)
    original.click()
    expect(clicked).toHaveBeenCalledOnce()
    expect(content.textContent).toBe("OriginalNew")
    element.append(" Late")
    await Promise.resolve()
    expect(content.textContent).toBe("OriginalNew Late")
  })

  it("places a generated header after cover and default content before footer/action", () => {
    const element = card('<mui-card title="Title"><div data-mui-card-cover>Cover</div><footer data-mui-card-footer>Footer</footer><div data-mui-card-action>Action</div>Body</mui-card>')
    expect([...element.children].map((child) => child.textContent)).toEqual(["Cover", "Title", "Body", "Footer", "Action"])
  })

  it("preserves inert templates without cloning or activating them", () => {
    const element = card('<mui-card><template id="content-template"><button type="button">Inert</button></template>Body</mui-card>')
    const template = element.querySelector("template")!
    expect(template.parentElement).toBe(element)
    expect(element.querySelector("button")).toBeNull()
    expect(template.content.querySelector("button")?.textContent).toBe("Inert")
    element.title = "Title"
    expect(element.querySelector("template")).toBe(template)
    expect(element.querySelector("button")).toBeNull()
  })

  it("emits one bubbling cancellable close intent without hiding or removing the card", () => {
    const element = card('<mui-card closable title="Dismissible">Body</mui-card>')
    const close = closeButton(element)
    const intent = vi.fn((event: Event) => event.preventDefault())
    document.body.addEventListener("mui:close", intent, { once: true })
    close.click()
    expect(intent).toHaveBeenCalledOnce()
    const event = intent.mock.calls[0]![0] as CustomEvent<CardCloseDetail>
    expect(event.target).toBe(element)
    expect(event.cancelable).toBe(true)
    expect(event.defaultPrevented).toBe(true)
    expect(event.detail.originalEvent.target).toBe(close)
    expect(element.isConnected).toBe(true)
    expect(element.hidden).toBe(false)
    close.click()
    expect(element.isConnected).toBe(true)
    expect(element.hidden).toBe(false)
  })

  it("uses a type=button close control that never submits an enclosing form", () => {
    const element = card('<form><mui-card closable>Body</mui-card></form>')
    const submit = vi.fn((event: Event) => event.preventDefault())
    document.querySelector("form")!.addEventListener("submit", submit)
    const intent = vi.fn()
    element.addEventListener("mui:close", intent)
    expect(closeButton(element).type).toBe("button")
    closeButton(element).click()
    expect(intent).toHaveBeenCalledOnce()
    expect(submit).not.toHaveBeenCalled()
  })

  it("does not synthesize keyboard clicks or suppress native defaults", () => {
    const element = card("<mui-card closable>Body</mui-card>")
    const intent = vi.fn()
    element.addEventListener("mui:close", intent)
    const close = closeButton(element)
    for (const key of ["Enter", " "]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
      close.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(intent).not.toHaveBeenCalled()
    close.click()
    expect(intent).toHaveBeenCalledOnce()
  })

  it("provides an accessible close name and a native tab stop with live overrides", () => {
    const element = card("<mui-card closable>Body</mui-card>")
    const close = closeButton(element)
    expect(close.getAttribute("aria-label")).toBe("Close card")
    expect(close.querySelector("span")?.getAttribute("aria-hidden")).toBe("true")
    expect(close.querySelector("span")?.textContent).toBe("")
    expect(close.tabIndex).toBe(0)
    close.focus()
    expect(document.activeElement).toBe(close)
    element.closeLabel = "Dismiss report"
    expect(close.getAttribute("aria-label")).toBe("Dismiss report")
    element.closeFocusable = false
    expect(close.tabIndex).toBe(-1)
    element.closeFocusable = true
    expect(close.tabIndex).toBe(0)
    element.closeLabel = " "
    expect(close.getAttribute("aria-label")).toBe("Close card")
  })

  describe("audited Card styles", () => {
    const css = readFileSync("src/components/card/card.css", "utf8")

    it("keeps shared typography and focus overrides ahead of standalone fallbacks", () => {
      expect(css).toContain("var(--mui-card-font-size, var(--mui-font-size, 14px))")
      expect(css).toContain("var(--mui-card-line-height, var(--mui-line-height, 1.6))")
      expect(css).toContain("var(--mui-card-focus-color, var(--mui-focus-ring, #2080f080))")
      expect(css).toContain("var(--mui-card-target-color, var(--mui-color-primary, var(--_mui-card-primary, #18a058)))")
    })

    it("does not map Card colors to unequal legacy palette roles or overwrite public tokens", () => {
      expect(css).not.toMatch(/--mui-(bg-surface|bg-muted|text-primary|text-secondary|border-hover)\b/)
      expect(css).not.toMatch(/(?:^|[;{])\s*--mui-card-[\w-]+\s*:/m)
      expect(css).toContain("var(--mui-card-background, var(--_mui-card-surface, #fff))")
      expect(css).toContain("var(--mui-card-border-color, var(--_mui-card-border, #efeff5))")
      expect(css).toContain("var(--mui-card-title-weight, 500)")
      expect(css).toContain("var(--mui-card-radius, 3px)")
    })

    it("resets all private dark palette defaults at explicit nested light boundaries", () => {
      const light = css.match(/:where\(\[data-mui-theme="light"\]\) \{([^}]+)\}/)![1]!
      const dark = css.match(/:where\(\[data-mui-theme="dark"\]\) \{([^}]+)\}/)![1]!
      const names = [...dark.matchAll(/(--_mui-card-[\w-]+):/g)].map(match => match[1])
      expect(names.length).toBe(11)
      for (const name of names) expect(light).toContain(`${name}: initial;`)
    })

    it("preserves measured asymmetric size geometry and unsegmented region spacing", () => {
      expect(css).toContain("--_mui-card-top: 19px")
      expect(css).toContain("--_mui-card-bottom: 20px")
      for (const [size, horizontal, top, bottom] of [["small", 16, 12, 12], ["large", 32, 23, 24], ["huge", 40, 27, 28]]) {
        expect(css).toContain(`[size="${size}"] { --_mui-card-padding: ${horizontal}px; --_mui-card-top: ${top}px; --_mui-card-bottom: ${bottom}px;`)
      }
      expect(css).toContain("padding: 0 var(--mui-card-padding, var(--_mui-card-padding)) var(--mui-card-padding, var(--_mui-card-bottom))")
      expect(css).toContain('[bordered="false"] { border: 0; }')
      expect(css).not.toContain("justify-content: flex-end")
    })

    it("keeps a font-independent close mark, expanded state paint and reduced-motion opt-out", () => {
      expect(css).toContain("width: var(--mui-card-close-size, 18px)")
      expect(css).toContain("inset: -2px")
      expect(css).toContain("transform: rotate(-45deg)")
      expect(css).toContain("@media (prefers-reduced-motion: reduce)")
      expect(css).toContain('[data-mui-card-close]::before { transition: none; }')
    })
  })

  it("removes generated-only headers and close listeners when closable is unset", () => {
    const element = card("<mui-card closable>Body</mui-card>")
    const close = closeButton(element)
    const intent = vi.fn()
    element.addEventListener("mui:close", intent)
    element.closable = false
    close.click()
    expect(intent).not.toHaveBeenCalled()
    expect(element.querySelector("[data-mui-card-header]")).toBeNull()
    expect(element.textContent).toBe("Body")
    element.closable = true
    expect(element.querySelectorAll("[data-mui-card-close]")).toHaveLength(1)
    closeButton(element).click()
    expect(intent).toHaveBeenCalledOnce()
  })

  it("retains authored header content when removing the generated close button", () => {
    const element = card('<mui-card closable><header data-mui-card-header><h2>Heading</h2><button type="button">Action</button></header>Body</mui-card>')
    const header = element.querySelector("header")!
    const action = header.querySelector("button")!
    element.closable = false
    expect(element.querySelector("header")).toBe(header)
    expect(header.querySelector("button")).toBe(action)
    expect(header.children).toHaveLength(2)
  })

  it("disconnects observers/listeners and reconnects without duplication or lost identity", async () => {
    const element = card('<mui-card closable title="Before"><input value="Initial"></mui-card>')
    const close = closeButton(element)
    const input = element.querySelector("input")!
    input.value = "Edited"
    const intent = vi.fn()
    element.addEventListener("mui:close", intent)
    element.remove()
    close.click()
    element.title = "After"
    await Promise.resolve()
    expect(intent).not.toHaveBeenCalled()
    expect(element.querySelector("[data-mui-card-title]")?.textContent).toBe("Before")
    document.body.append(element)
    expect(closeButton(element)).toBe(close)
    expect(element.querySelector("[data-mui-card-title]")?.textContent).toBe("After")
    expect(element.querySelector("input")).toBe(input)
    expect(input.value).toBe("Edited")
    close.click()
    expect(intent).toHaveBeenCalledOnce()
  })

  it("handles replaced children without resurrecting removed authored content", async () => {
    const element = card('<mui-card closable title="Fallback"><header data-mui-card-header>Old header</header><div data-mui-card-content><input value="Old"></div></mui-card>')
    const close = closeButton(element)
    const oldInput = element.querySelector("input")!
    element.innerHTML = '<header data-mui-card-header>New header</header><section data-mui-card-content>New content</section>'
    await Promise.resolve()
    expect(closeButton(element)).toBe(close)
    expect(element.contains(oldInput)).toBe(false)
    expect(element.querySelectorAll("[data-mui-card-header]")).toHaveLength(1)
    expect(element.textContent).not.toContain("Old")
    expect(element.querySelector("header")!.lastElementChild).toBe(close)
  })

  it("regenerates removed close placement and detects emptied default content", async () => {
    const element = card("<mui-card closable>Body</mui-card>")
    const close = closeButton(element)
    close.remove()
    await Promise.resolve()
    expect(closeButton(element)).toBe(close)
    element.closable = false
    element.querySelector("[data-mui-card-content]")!.replaceChildren()
    await Promise.resolve()
    expect(element.children).toHaveLength(0)
    expect(element.hasAttribute("structured")).toBe(false)
  })

  it("recognizes late region attributes and direct text character changes", async () => {
    const element = card("<mui-card></mui-card>")
    const header = document.createElement("header")
    element.append(header)
    header.setAttribute("data-mui-card-header", "")
    header.textContent = "Header"
    await Promise.resolve()
    expect(header.parentElement).toBe(element)
    const text = document.createTextNode("")
    element.append(text)
    await Promise.resolve()
    text.data = "Now content"
    await Promise.resolve()
    expect(text.parentElement).toBe(element.querySelector("[data-mui-card-content]"))
  })

  it("does not turn a nested card close into a second parent close intent", () => {
    const outer = card('<mui-card closable title="Outer"><mui-card closable title="Inner">Body</mui-card></mui-card>')
    const inner = outer.querySelector("mui-card") as MuiCard
    const intent = vi.fn()
    outer.addEventListener("mui:close", intent)
    closeButton(inner).click()
    expect(intent).toHaveBeenCalledOnce()
    expect(intent.mock.calls[0]![0].target).toBe(inner)
    expect(outer.isConnected && inner.isConnected).toBe(true)
  })

  it("respects native disabled close buttons and disabled fieldsets", () => {
    const element = card("<fieldset disabled><mui-card closable>Body</mui-card></fieldset>")
    const intent = vi.fn()
    element.addEventListener("mui:close", intent)
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

  it("upgrades pre-definition properties and keeps templates/native regions intact", () => {
    document.body.innerHTML = '<test-late-card><p>Body</p></test-late-card>'
    const element = document.querySelector("test-late-card") as MuiCard
    const body = element.querySelector("p")
    Object.assign(element, { title: "Late", closable: true, closeFocusable: false, closeLabel: "Dismiss", size: "huge", bordered: false, hoverable: true, embedded: true, segmented: true, contentScrollable: true })
    customElements.define("test-late-card", class extends MuiCard {})
    expect(element.querySelector("[data-mui-card-title]")?.textContent).toBe("Late")
    expect(closeButton(element).tabIndex).toBe(-1)
    expect(closeButton(element).getAttribute("aria-label")).toBe("Dismiss")
    expect(element.querySelector("p")).toBe(body)
    expect(element.size).toBe("huge")
    expect(element.bordered).toBe(false)
    expect(element.hoverable && element.embedded && element.segmented && element.contentScrollable).toBe(true)
  })

  it("reflects visual properties without injecting CSS, styles or a shadow root", () => {
    const element = card()
    for (const name of ["hoverable", "embedded", "segmented", "contentScrollable"] as const) {
      element[name] = true
      expect(element[name]).toBe(true)
      element[name] = false
      expect(element[name]).toBe(false)
    }
    element.size = "large"
    element.bordered = false
    expect(element.getAttribute("size")).toBe("large")
    expect(element.getAttribute("bordered")).toBe("false")
    expect(element.querySelector("[style]")).toBeNull()
    expect(element.hasAttribute("style")).toBe(false)
    expect(element.shadowRoot).toBeNull()
    expect(document.querySelector("style")).toBeNull()
  })

  it("registers idempotently and rejects the legacy Card definition explicitly", () => {
    expect(() => registerCard()).not.toThrow()
    const define = vi.fn()
    expect(() => registerCard({ get: () => class extends HTMLElement {}, define })).toThrow("before the legacy MarkupUI bundle")
    expect(define).not.toHaveBeenCalled()
  })

  it("preserves rich Card registration when loading the legacy compound elements", () => {
    registerElements(customElements)
    expect(customElements.get("mui-card")).toBe(MuiCard)
    const element = card("<mui-card closable><mui-card-header>Heading</mui-card-header><mui-card-content>Content</mui-card-content><mui-card-footer>Footer</mui-card-footer></mui-card>")
    expect(customElements.get("mui-card-header")).toBeDefined()
    expect(element.hasAttribute("structured")).toBe(true)
    expect(element.querySelector("mui-card-header > [data-mui-card-close]")).not.toBeNull()
  })
})
