import { afterEach, describe, expect, it, vi } from "vitest"
import { MuiEmpty, registerEmpty } from "../src/components/empty/index.js"
import { registerElements } from "../src/components/elements.js"

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

function empty(markup = "<mui-empty></mui-empty>"): MuiEmpty {
  document.body.innerHTML = markup
  const element = document.querySelector("mui-empty")
  if (!(element instanceof MuiEmpty)) throw new Error("Empty was not upgraded")
  return element
}
function description(element: MuiEmpty): Element {
  return element.querySelector(":scope > [data-mui-empty-description]:not(template,script,style)")!
}

describe("standalone Empty", () => {
  it("generates readable fallback text and an original decorative namespaced SVG only", () => {
    const element = empty()
    expect(description(element).textContent).toBe("No Data")
    const icon = element.querySelector("[data-mui-empty-icon]")!
    const svg = icon.querySelector("svg")!
    expect(icon.getAttribute("aria-hidden")).toBe("true")
    expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(svg.getAttribute("viewBox")).toBe("0 0 48 48")
    expect(svg.getAttribute("aria-hidden")).toBe("true")
    expect(svg.getAttribute("focusable")).toBe("false")
    expect(svg.querySelectorAll("path")).toHaveLength(2)
    expect([...svg.querySelectorAll("path")].every((path) => path.namespaceURI === svg.namespaceURI)).toBe(true)
    expect(element.querySelector("button,a")).toBeNull()
    expect(element.hasAttribute("role") || element.hasAttribute("tabindex") || element.hasAttribute("aria-live")).toBe(false)
  })

  it("localizes through safe text attributes and distinguishes absent from explicit empty text", () => {
    const element = empty()
    const region = description(element)
    const text = region.firstChild
    element.description = "暂无数据"
    expect(region.textContent).toBe("暂无数据")
    expect(region.firstChild).toBe(text)
    element.description = '<img src=x onerror="alert(1)">'
    expect(region.textContent).toBe('<img src=x onerror="alert(1)">')
    expect(element.querySelector("img")).toBeNull()
    element.description = ""
    expect(region.textContent).toBe("")
    element.description = null
    expect(region.textContent).toBe("No Data")
  })

  it("preserves authored description nodes, heading semantics and listeners ahead of fallback props", () => {
    const element = document.createElement("mui-empty") as MuiEmpty
    element.description = "Fallback"
    const heading = document.createElement("h2")
    heading.textContent = "No reports"
    const click = vi.fn()
    heading.addEventListener("click", click)
    const body = document.createElement("p")
    body.textContent = "Create a report"
    element.append(heading, body)
    document.body.append(element)
    expect([...description(element).childNodes]).toEqual([heading, body])
    expect(element.textContent).not.toContain("Fallback")
    element.description = "Changed fallback"
    expect([...description(element).childNodes]).toEqual([heading, body])
    heading.click()
    expect(click).toHaveBeenCalledOnce()
    expect(heading.hasAttribute("role")).toBe(false)
  })

  it("treats an explicitly authored empty description region as an override", () => {
    const element = empty('<mui-empty description="Fallback"><p data-mui-empty-description></p></mui-empty>')
    const region = description(element)
    element.description = "Changed"
    expect(region.textContent).toBe("")
    expect(element.querySelectorAll("[data-mui-empty-description]")).toHaveLength(1)
  })

  it("replaces generated fallback text when late default content arrives", async () => {
    const element = empty()
    const text = document.createTextNode("Authored late")
    element.append(text)
    await Promise.resolve()
    expect(description(element).textContent).toBe("Authored late")
    expect(description(element).firstChild).toBe(text)
    element.description = "Ignored fallback"
    expect(description(element).firstChild).toBe(text)
  })

  it("adopts late description wrappers without discarding earlier authored content", async () => {
    const element = empty("<mui-empty><strong>Original</strong></mui-empty>")
    const original = element.querySelector("strong")
    const region = document.createElement("section")
    region.dataset.muiEmptyDescription = ""
    region.textContent = "New"
    element.append(region)
    await Promise.resolve()
    expect(description(element)).toBe(region)
    expect(region.firstChild).toBe(original)
    expect(region.textContent).toBe("OriginalNew")
    expect(element.querySelectorAll("[data-mui-empty-description]")).toHaveLength(1)
  })

  it("does not carry generated fallback into a late authored description", async () => {
    const element = empty()
    const region = document.createElement("p")
    region.dataset.muiEmptyDescription = ""
    region.textContent = "No matches"
    element.append(region)
    await Promise.resolve()
    expect(description(element)).toBe(region)
    expect(region.textContent).toBe("No matches")
  })

  it("preserves direct SVG icon nodes and ARIA ahead of both illustration and legacy glyph", () => {
    const element = empty('<mui-empty icon="?"><svg data-mui-empty-icon viewBox="0 0 24 24" role="img" aria-label="Custom artwork"><circle cx="12" cy="12" r="10"></circle></svg></mui-empty>')
    const icon = element.querySelector("svg")!
    const shape = icon.querySelector("circle")
    element.icon = "!"
    element.size = "huge"
    element.showIcon = false
    expect(element.querySelectorAll("[data-mui-empty-icon]")).toHaveLength(1)
    expect(element.querySelector("svg")).toBe(icon)
    expect(icon.querySelector("circle")).toBe(shape)
    expect(icon.getAttribute("aria-label")).toBe("Custom artwork")
    expect(icon.hasAttribute("aria-hidden")).toBe(false)
  })

  it("retains the legacy plain-text icon convenience without treating it as HTML", () => {
    const element = empty('<mui-empty icon="?"></mui-empty>')
    const icon = element.querySelector("[data-mui-empty-icon]")!
    expect(icon.textContent).toBe("?")
    expect(icon.querySelector("svg")).toBeNull()
    element.icon = "<img>"
    expect(icon.textContent).toBe("<img>")
    expect(icon.querySelector("img")).toBeNull()
    element.icon = null
    expect(icon.querySelector("svg")?.namespaceURI).toBe("http://www.w3.org/2000/svg")
  })

  it("adopts late authored icons and orders them before description/extra", async () => {
    const element = empty('<mui-empty><div data-mui-empty-extra><button type="button">Create</button></div></mui-empty>')
    const extra = element.querySelector("[data-mui-empty-extra]")
    const icon = document.createElement("span")
    icon.dataset.muiEmptyIcon = ""
    icon.textContent = "☆"
    element.append(icon)
    await Promise.resolve()
    expect(element.querySelectorAll("[data-mui-empty-icon]")).toHaveLength(1)
    expect([...element.children]).toEqual([icon, description(element), extra])
  })

  it("does not let an extra action suppress the missing description/icon defaults", () => {
    const element = empty('<mui-empty><div data-mui-empty-extra><button type="button">Retry</button></div></mui-empty>')
    expect(description(element).textContent).toBe("No Data")
    expect(element.querySelector("[data-mui-empty-icon] svg")).not.toBeNull()
    expect(element.querySelector("[data-mui-empty-extra] button")?.textContent).toBe("Retry")
  })

  it("keeps show/hide flags separate from authored nodes and native hidden state", () => {
    const element = empty('<mui-empty><p data-mui-empty-description hidden>No results</p><div data-mui-empty-extra><a href="#retry">Retry</a></div></mui-empty>')
    const region = description(element)
    const link = element.querySelector("a")
    const svg = element.querySelector("svg")
    element.showDescription = false
    element.showIcon = false
    expect(element.showDescription || element.showIcon).toBe(false)
    expect(region.hasAttribute("hidden")).toBe(true)
    element.showDescription = true
    element.showIcon = true
    expect(description(element)).toBe(region)
    expect(element.querySelector("a")).toBe(link)
    expect(element.querySelector("svg")).toBe(svg)
  })

  it("avoids creating an illustration when icon display starts disabled", () => {
    const element = empty('<mui-empty show-icon="false"></mui-empty>')
    expect(element.querySelector("[data-mui-empty-icon]")).toBeNull()
    element.showIcon = true
    expect(element.querySelector("[data-mui-empty-icon] svg")).not.toBeNull()
  })

  it("preserves native submit/reset/button semantics and input state in extra content", () => {
    const element = empty('<form><mui-empty><div data-mui-empty-extra><input value="Initial"><button type="submit">Create</button><button type="reset">Reset</button><button type="button">Browse</button></div></mui-empty></form>')
    const input = element.querySelector("input")!
    const submit = vi.fn((event: Event) => event.preventDefault())
    document.querySelector("form")!.addEventListener("submit", submit)
    input.value = "Edited"
    element.description = "No reports"
    element.showDescription = false
    element.querySelector<HTMLButtonElement>('[type="button"]')!.click()
    expect(submit).not.toHaveBeenCalled()
    expect(input.value).toBe("Edited")
    element.querySelector<HTMLButtonElement>('[type="submit"]')!.click()
    expect(submit).toHaveBeenCalledOnce()
    element.querySelector<HTMLButtonElement>('[type="reset"]')!.click()
    expect(input.value).toBe("Initial")
  })

  it("never rewrites roles/names/live attributes or fabricates events", () => {
    const element = empty('<mui-empty role="region" aria-labelledby="heading" aria-live="off"><h2 data-mui-empty-description id="heading">No reports</h2><div data-mui-empty-extra><button type="button" disabled>Retry</button></div></mui-empty>')
    const notification = vi.fn()
    for (const name of ["mui:change", "change", "input", "click"]) element.addEventListener(name, notification)
    element.description = "Changed"
    element.size = "small"
    element.showIcon = false
    expect(element.getAttribute("role")).toBe("region")
    expect(element.getAttribute("aria-labelledby")).toBe("heading")
    expect(element.getAttribute("aria-live")).toBe("off")
    expect(element.querySelector("[role],[aria-live]")).toBeNull()
    expect(element.querySelector("button")?.disabled).toBe(true)
    expect(notification).not.toHaveBeenCalled()
  })

  it("keeps focused native extra controls in place during fallback text updates", async () => {
    const element = empty('<mui-empty role="status"><div data-mui-empty-extra><button type="button">Retry</button></div></mui-empty>')
    const native = element.querySelector("button")!
    native.focus()
    const region = description(element)
    const text = region.firstChild
    element.description = "Nothing found"
    await Promise.resolve()
    expect(document.activeElement).toBe(native)
    expect(description(element)).toBe(region)
    expect(region.firstChild).toBe(text)
    expect(element.querySelectorAll("[aria-live],[role]")).toHaveLength(0)
  })

  it("keeps templates inert, including region-marked templates", () => {
    const element = empty('<mui-empty><template data-mui-empty-description><h2>Inert</h2></template><template data-mui-empty-icon><svg></svg></template><template data-mui-empty-extra><button>Inert action</button></template></mui-empty>')
    expect(element.querySelectorAll(":scope > template")).toHaveLength(3)
    expect(element.querySelector("h2,button")).toBeNull()
    expect(description(element).textContent).toBe("No Data")
  })

  it("accepts application-owned native template clones and preserves bound actions", async () => {
    const element = empty('<mui-empty><template id="template"><h2 data-mui-empty-description>No reports</h2><div data-mui-empty-extra><button type="button">Create</button></div></template></mui-empty>')
    const template = element.querySelector("template")!
    const fragment = document.importNode(template.content, true)
    const action = fragment.querySelector("button")!
    const click = vi.fn()
    action.addEventListener("click", click)
    element.append(fragment)
    await Promise.resolve()
    expect(description(element).textContent).toBe("No reports")
    expect(element.querySelector("template")).toBe(template)
    expect(element.querySelector("button")).toBe(action)
    action.click()
    expect(click).toHaveBeenCalledOnce()
  })

  it("disconnects observation and reconnects without duplicating or losing authored state", async () => {
    const element = empty('<mui-empty><div data-mui-empty-extra><input value="Initial"><button type="button">Retry</button></div></mui-empty>')
    const region = description(element)
    const icon = element.querySelector("svg")
    const input = element.querySelector("input")!
    const button = element.querySelector("button")!
    const click = vi.fn()
    button.addEventListener("click", click)
    input.value = "Edited"
    element.remove()
    element.description = "Changed"
    await Promise.resolve()
    expect(region.textContent).toBe("No Data")
    document.body.append(element)
    expect(description(element)).toBe(region)
    expect(region.textContent).toBe("Changed")
    expect(element.querySelector("svg")).toBe(icon)
    expect(element.querySelector("input")).toBe(input)
    expect(input.value).toBe("Edited")
    button.click()
    expect(click).toHaveBeenCalledOnce()
  })

  it("does not resurrect discarded content on whole-subtree replacement", async () => {
    const element = empty("<mui-empty><strong>Old</strong></mui-empty>")
    const old = element.querySelector("strong")!
    element.innerHTML = '<p data-mui-empty-description>New</p>'
    await Promise.resolve()
    expect(element.contains(old)).toBe(false)
    expect(description(element).textContent).toBe("New")
    expect(element.querySelectorAll("[data-mui-empty-description]")).toHaveLength(1)
    expect(element.querySelectorAll("[data-mui-empty-icon]")).toHaveLength(1)
  })

  it("restores fallback after generated default content is emptied", async () => {
    const element = empty("<mui-empty>Authored</mui-empty>")
    description(element).replaceChildren()
    await Promise.resolve()
    expect(description(element).textContent).toBe("No Data")
  })

  it("honors pre-definition properties and external CSS separation", () => {
    document.body.innerHTML = "<test-late-empty></test-late-empty>"
    const element = document.querySelector("test-late-empty") as MuiEmpty
    Object.assign(element, { description: "Late", showDescription: false, showIcon: false, size: "huge", icon: "?" })
    customElements.define("test-late-empty", class extends MuiEmpty {})
    expect(element.description).toBe("Late")
    expect(description(element).textContent).toBe("Late")
    expect(element.showDescription || element.showIcon).toBe(false)
    expect(element.size).toBe("huge")
    element.showIcon = true
    expect(element.querySelector("[data-mui-empty-icon]")?.textContent).toBe("?")
    expect(element.shadowRoot).toBeNull()
    expect(document.querySelector("style,[style]")).toBeNull()
  })

  it("reports collisions and preserves rich registration when the legacy aggregate follows", () => {
    expect(() => registerEmpty()).not.toThrow()
    const define = vi.fn()
    expect(() => registerEmpty({ get: () => class extends HTMLElement {}, define })).toThrow("before the legacy MarkupUI bundle")
    expect(define).not.toHaveBeenCalled()
    registerElements(customElements)
    expect(customElements.get("mui-empty")).toBe(MuiEmpty)
    expect(description(empty()).textContent).toBe("No Data")
  })
})
