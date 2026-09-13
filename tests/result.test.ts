import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Result, MResult, ResultHeader, ResultContent, ResultFooter, registerResult, resultStatuses } from "../src/components/result/index.js"
import * as resultApi from "../src/components/result/index.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "result", "result.css"), "utf8")
let style: HTMLStyleElement | undefined

function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}

function result(markup = "<m-result></m-result>"): Result {
  document.body.innerHTML = markup
  const element = document.querySelector("m-result")
  if (!(element instanceof Result)) throw new Error("Result was not upgraded")
  return element
}

afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("canonical Result ViewElement", () => {
  it("exports canonical ViewElement classes and registration", () => {
    expect(resultApi.Result).toBe(Result)
    expect(resultApi.MResult).toBe(Result)
    expect(resultApi.ResultHeader).toBe(ResultHeader)
    expect(resultApi.ResultContent).toBe(ResultContent)
    expect(resultApi.ResultFooter).toBe(ResultFooter)
    expect(Result.tag).toBe("m-result")
    expect(ResultHeader.tag).toBe("m-result-header")
    expect(ResultContent.tag).toBe("m-result-content")
    expect(ResultFooter.tag).toBe("m-result-footer")
    expect(ViewElement.prototype.isPrototypeOf(Result.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(ResultHeader.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(ResultContent.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(ResultFooter.prototype)).toBe(true)
    expect(customElements.get("m-result")).toBe(Result)
    expect(customElements.get("m-result-header")).toBe(ResultHeader)
    expect(customElements.get("m-result-content")).toBe(ResultContent)
    expect(customElements.get("m-result-footer")).toBe(ResultFooter)
    expect(Result.observedAttributes).toEqual(["status", "title", "description"])
    expect(() => registerResult()).not.toThrow()
    const define = vi.fn()
    expect(() => registerResult({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("handles status property defaults and validation", () => {
    const element = result()
    expect(element.status).toBe("info")

    for (const status of resultStatuses) {
      element.status = status
      expect(element.status).toBe(status)
      expect(element.getAttribute("status")).toBe(status)
    }

    expect(() => Reflect.set(element, "status", "unknown")).toThrow(RangeError)
    element.setAttribute("status", "invalid")
    expect(() => element.status).toThrow(RangeError)

    element.removeAttribute("status")
    expect(element.status).toBe("info")
  })

  it("handles title and description properties and attributes", () => {
    const element = result()
    expect(element.title).toBe("")
    expect(element.description).toBe("")

    element.title = "Outcome Title"
    element.description = "Outcome Description"
    expect(element.title).toBe("Outcome Title")
    expect(element.getAttribute("title")).toBe("Outcome Title")
    expect(element.description).toBe("Outcome Description")
    expect(element.getAttribute("description")).toBe("Outcome Description")

    const titleEl = element.querySelector(".m-result-title")
    const descEl = element.querySelector(".m-result-description")
    expect(titleEl?.textContent).toBe("Outcome Title")
    expect(descEl?.textContent).toBe("Outcome Description")

    element.title = ""
    element.description = ""
    expect(element.title).toBe("")
    expect(element.description).toBe("")
    expect(element.querySelector(".m-result-header")).toBeNull()
  })

  it("validates title and description property types", () => {
    const element = result()
    expect(() => Reflect.set(element, "title", 123)).toThrow(RangeError)
    expect(() => Reflect.set(element, "description", 456)).toThrow(RangeError)
  })

  it("preserves authored regions over generated ones", () => {
    const element = result(`
      <m-result status="error" title="Ignored Title" description="Ignored Description">
        <m-result-header id="authored-header">
          <h2 class="m-result-title">Authored Title</h2>
          <p class="m-result-description">Authored Description</p>
        </m-result-header>
        <m-result-content id="authored-content">
          <p>Authored Content Body</p>
        </m-result-content>
        <m-result-footer id="authored-footer">
          <button type="button">Authored Action</button>
        </m-result-footer>
      </m-result>
    `)
    expect(element.querySelector("#authored-header")).not.toBeNull()
    expect(element.querySelector("#authored-header h2")?.textContent).toBe("Authored Title")
    expect(element.querySelector("#authored-content")?.textContent).toContain("Authored Content Body")
    expect(element.querySelector("#authored-footer button")?.textContent).toBe("Authored Action")
    expect(element.querySelectorAll("m-result-header")).toHaveLength(1)
  })

  it("wraps loose nodes into m-result-content when no content region is authored", () => {
    const element = result(`
      <m-result title="Title">
        <p id="loose-p">Loose child paragraph</p>
      </m-result>
    `)
    const content = element.querySelector("m-result-content")
    expect(content).not.toBeNull()
    expect(content?.querySelector("#loose-p")).not.toBeNull()
  })

  it("does not generate missing regions and keeps empty roots empty", () => {
    const element = result("<m-result></m-result>")
    expect(element.childNodes).toHaveLength(0)
    expect(element.textContent).toBe("")
    expect(element.querySelector(".m-result-icon")).toBeNull()
    expect(element.querySelector("m-result-header")).toBeNull()
    expect(element.querySelector("m-result-content")).toBeNull()
    expect(element.querySelector("m-result-footer")).toBeNull()
  })

  it("retains authored region order, listeners, and nodes without rewriting", () => {
    const element = result(`
      <m-result status="warning">
        <div class="m-result-icon" id="i">Icon</div>
        <m-result-header id="h">Header</m-result-header>
        <m-result-content id="c">Content</m-result-content>
        <m-result-footer id="f">Footer</m-result-footer>
      </m-result>
    `)
    const children = [...element.children].map(c => c.id)
    expect(children).toEqual(["i", "h", "c", "f"])
  })

  it("places generated header before generated content and footer", () => {
    const element = result(`
      <m-result title="Title">
        <p id="body-text">Some body text</p>
        <m-result-footer id="footer"><button>Action</button></m-result-footer>
      </m-result>
    `)
    const header = element.querySelector("m-result-header")!
    const content = element.querySelector("m-result-content")!
    const footer = element.querySelector("m-result-footer")!
    expect(element.children[0]).toBe(header)
    expect(element.children[1]).toBe(content)
    expect(element.children[2]).toBe(footer)
  })

  it("keeps template nodes inert", () => {
    const element = result(`
      <m-result title="Title">
        <template id="tpl"><button id="inert-btn">Inert Action</button></template>
      </m-result>
    `)
    expect(element.querySelector("#inert-btn")).toBeNull()
    expect(element.querySelector<HTMLTemplateElement>("#tpl")?.content.querySelector("#inert-btn")).not.toBeNull()
  })

  it("upgrades properties assigned before custom element registration", () => {
    document.body.innerHTML = "<test-late-result></test-late-result>"
    const element = document.querySelector("test-late-result") as Result
    Object.assign(element, { status: "success", title: "Late Title", description: "Late Description" })
    customElements.define("test-late-result", class extends Result {})
    expect(element.status).toBe("success")
    expect(element.title).toBe("Late Title")
    expect(element.description).toBe("Late Description")
    expect(element.querySelector(".m-result-title")?.textContent).toBe("Late Title")
    expect(element.querySelector(".m-result-description")?.textContent).toBe("Late Description")
  })

  it("styles m-result cleanly via result.css with accent colors and dark theme", () => {
    install()
    const element = result("<m-result status='success' title='Success'></m-result>")
    expect(getComputedStyle(element).display).toBe("grid")
    expect(getComputedStyle(element).getPropertyValue("--_m-result-accent")).toBe("var(--_m-result-success,var(--m-color-success,#18a058))")

    element.status = "error"
    expect(getComputedStyle(element).getPropertyValue("--_m-result-accent")).toBe("var(--_m-result-error,var(--m-color-error,#d03050))")

    element.status = "warning"
    expect(getComputedStyle(element).getPropertyValue("--_m-result-accent")).toBe("var(--_m-result-warning,var(--m-color-warning,#f0a020))")

    element.status = "404"
    expect(getComputedStyle(element).getPropertyValue("--_m-result-accent")).toBe("currentColor")

    element.dataset.mTheme = "dark"
    const dark = getComputedStyle(element)
    expect(dark.getPropertyValue("--_m-result-text")).toBe("rgba(255,255,255,.82)")
    expect(dark.getPropertyValue("--_m-result-title")).toBe("rgba(255,255,255,.9)")
    expect(dark.getPropertyValue("--_m-result-success")).toBe("#63e2b7")
    expect(dark.getPropertyValue("--_m-result-error")).toBe("#e88080")

    expect(css).toContain("m-result")
    expect(css).toContain("m-result-header")
    expect(css).toContain("m-result-content")
    expect(css).toContain("m-result-footer")
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
  })
})
