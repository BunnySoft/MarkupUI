import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { PageHeader, MPageHeader, registerPageHeader } from "../src/components/page-header/index.js"
import type { PageHeaderBackDetail } from "../src/components/page-header/index.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "page-header", "page-header.css"), "utf8")
let style: HTMLStyleElement | undefined

function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}

function pageHeader(markup = "<m-page-header></m-page-header>"): PageHeader {
  document.body.innerHTML = markup
  const element = document.querySelector("m-page-header")
  if (!(element instanceof PageHeader)) throw new Error("PageHeader was not upgraded")
  return element
}

afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("canonical PageHeader component", () => {
  it("exports PageHeader extending ViewElement with static tag 'm-page-header'", () => {
    expect(PageHeader.tag).toBe("m-page-header")
    expect(MPageHeader).toBe(PageHeader)
    expect(ViewElement.prototype.isPrototypeOf(PageHeader.prototype)).toBe(true)
    expect(customElements.get("m-page-header")).toBe(PageHeader)
  })

  it("registers PageHeader via registerPageHeader and detects collisions", () => {
    expect(() => registerPageHeader()).not.toThrow()
    const define = vi.fn()
    expect(() => registerPageHeader({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("handles title and subtitle properties and attributes", () => {
    const header = pageHeader()
    expect(header.title).toBe("")
    expect(header.subtitle).toBeNull()

    header.title = "Project Title"
    header.subtitle = "Project Subtitle"
    expect(header.title).toBe("Project Title")
    expect(header.getAttribute("title")).toBe("Project Title")
    expect(header.subtitle).toBe("Project Subtitle")
    expect(header.getAttribute("subtitle")).toBe("Project Subtitle")

    expect(header.querySelector(".m-page-header-title")?.textContent).toBe("Project Title")
    expect(header.querySelector(".m-page-header-subtitle")?.textContent).toBe("Project Subtitle")

    header.title = undefined
    header.subtitle = undefined
    expect(header.title).toBe("")
    expect(header.hasAttribute("title")).toBe(false)
    expect(header.subtitle).toBeNull()
    expect(header.hasAttribute("subtitle")).toBe(false)
    expect(header.querySelector(".m-page-header-title")).toBeNull()
    expect(header.querySelector(".m-page-header-subtitle")).toBeNull()
  })

  it("validates string property inputs", () => {
    const header = pageHeader()
    expect(() => Reflect.set(header, "title", 123)).toThrow(RangeError)
    expect(() => Reflect.set(header, "subtitle", 123)).toThrow(RangeError)
    expect(() => Reflect.set(header, "extra", 123)).toThrow(RangeError)
  })

  it("preserves authored heading levels and region nodes", () => {
    const header = pageHeader(`
      <m-page-header>
        <div slot="header" class="m-page-header-header"><nav aria-label="Breadcrumb"><a href="#home">Home</a></nav></div>
        <div slot="avatar" class="m-page-header-avatar"><span class="avatar-icon">A</span></div>
        <a slot="back" class="m-page-header-back" href="#back">Back</a>
        <h1 slot="title" class="m-page-header-title" id="custom-h1">Authored Heading 1</h1>
        <p slot="subtitle" class="m-page-header-subtitle">Authored Subtitle</p>
        <div slot="extra" class="m-page-header-extra"><button type="button">Extra Action</button></div>
        <div slot="content" class="m-page-header-content"><p>Main Content</p></div>
        <div slot="footer" class="m-page-header-footer"><p>Footer Content</p></div>
      </m-page-header>
    `)
    expect(header.querySelector("#custom-h1")?.tagName).toBe("H1")
    expect(header.querySelector("#custom-h1")?.textContent).toBe("Authored Heading 1")
    expect(header.querySelector(".m-page-header-header nav")?.getAttribute("aria-label")).toBe("Breadcrumb")
    expect(header.querySelector(".m-page-header-extra button")?.textContent).toBe("Extra Action")
    expect(header.querySelector(".m-page-header-content p")?.textContent).toBe("Main Content")
    expect(header.querySelector(".m-page-header-footer p")?.textContent).toBe("Footer Content")
    expect(header.querySelector(".m-page-header-avatar")?.textContent).toBe("A")
    expect(header.querySelector(".m-page-header-back")?.getAttribute("href")).toBe("#back")
  })

  it("emits m:back event when back control is clicked", () => {
    const header = pageHeader(`
      <m-page-header>
        <button type="button" slot="back" class="m-page-header-back">Back</button>
      </m-page-header>
    `)
    const listener = vi.fn()
    header.addEventListener("m:back", listener)

    const backButton = header.querySelector<HTMLButtonElement>(".m-page-header-back")!
    backButton.click()

    expect(listener).toHaveBeenCalledOnce()
    const detail = (listener.mock.calls[0]![0] as CustomEvent<PageHeaderBackDetail>).detail
    expect(detail.originalEvent).toBeInstanceOf(MouseEvent)
  })

  it("does not emit m:back when disabled back button is clicked", () => {
    const header = pageHeader(`
      <m-page-header>
        <button type="button" disabled slot="back" class="m-page-header-back">Back</button>
      </m-page-header>
    `)
    const listener = vi.fn()
    header.addEventListener("m:back", listener)

    const backButton = header.querySelector<HTMLButtonElement>(".m-page-header-back")!
    backButton.click()

    expect(listener).not.toHaveBeenCalled()
  })

  it("wraps loose text and elements into content region", () => {
    const header = pageHeader("<m-page-header title='Title'>Loose descriptive text</m-page-header>")
    const content = header.querySelector(".m-page-header-content")
    expect(content).not.toBeNull()
    expect(content?.textContent).toContain("Loose descriptive text")
  })

  it("keeps templates inert", () => {
    const header = pageHeader(`
      <m-page-header>
        <template><button id="inert-btn">Inert Action</button></template>
      </m-page-header>
    `)
    expect(header.querySelector("#inert-btn")).toBeNull()
    expect(header.querySelector("template")?.content.querySelector("#inert-btn")).not.toBeNull()
  })

  it("upgrades properties assigned before custom element upgrade", () => {
    document.body.innerHTML = "<test-late-header></test-late-header>"
    const element = document.querySelector("test-late-header") as PageHeader
    Object.assign(element, { title: "Pre-upgrade Title", subtitle: "Pre-upgrade Subtitle", extra: "Extra Info" })
    customElements.define("test-late-header", class extends PageHeader {})
    expect(element.title).toBe("Pre-upgrade Title")
    expect(element.subtitle).toBe("Pre-upgrade Subtitle")
    expect(element.extra).toBe("Extra Info")
    expect(element.querySelector(".m-page-header-title")?.textContent).toBe("Pre-upgrade Title")
    expect(element.querySelector(".m-page-header-subtitle")?.textContent).toBe("Pre-upgrade Subtitle")
    expect(element.querySelector(".m-page-header-extra")?.textContent).toBe("Extra Info")
  })

  it("styles m-page-header cleanly alongside .m-page-header via page-header.css", () => {
    install()
    const customEl = pageHeader("<m-page-header title='Test'></m-page-header>")
    document.body.innerHTML += "<header class='m-page-header'><div class='m-page-header-main'><div class='m-page-header-lead'><div class='m-page-header-titles'><h1 class='m-page-header-title'>Class Header</h1></div></div></div></header>"
    const classEl = document.querySelector("header.m-page-header")!

    expect(getComputedStyle(customEl).display).toBe("block")
    expect(getComputedStyle(classEl).display).toBe("block")
    expect(css).toContain(":is(m-page-header, .m-page-header)")
    expect(css).toContain("--m-page-header-title-size, 18px")
    expect(css).toContain("--m-page-header-gap, 20px")
  })
})
