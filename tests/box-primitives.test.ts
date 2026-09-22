import { afterEach, describe, expect, it, vi } from "vitest"
import { Article, Details, Label, Strong, Summary } from "../src/components/box/index.js"
import { Input } from "../src/components/input/index.js"

const flush = () => new Promise(resolve => setTimeout(resolve, 10))
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("portable primitive Web semantics", () => {
  it.each([
    ["m-footer", "footer"], ["m-article", "article"], ["m-strong", "strong"],
    ["m-em", "em"], ["m-small", "small"], ["m-pre", "pre"],
  ])("%s creates one semantic %s owner and preserves authored nodes", async (tag, nativeTag) => {
    const host = document.createElement(tag) as Strong
    const content = document.createElement("span")
    content.textContent = "Original"
    const listener = vi.fn()
    content.addEventListener("test", listener)
    host.append(content)
    document.body.append(host)
    const native = host.native
    expect(native.localName).toBe(nativeTag)
    expect(native.firstChild).toBe(content)
    host.prepend(document.createTextNode("Before "))
    host.append(document.createTextNode(" After"))
    await flush()
    expect(native.textContent).toBe("Before Original After")
    host.remove()
    document.body.append(host)
    expect(host.native).toBe(native)
    expect(host.querySelectorAll(nativeTag)).toHaveLength(1)
    content.dispatchEvent(new Event("test"))
    expect(listener).toHaveBeenCalledOnce()
    host.textContent = "Replacement"
    await flush()
    expect(host.native).toBe(native)
    expect(native.textContent).toBe("Replacement")
    expect(host.contains(content)).toBe(false)
  })

  it("forwards accessible names and descriptions to the semantic owner", () => {
    const article = new Article()
    article.setAttribute("aria-label", "Report")
    article.setAttribute("aria-describedby", "report-help")
    document.body.append(article)
    expect(article.native.getAttribute("aria-label")).toBe("Report")
    expect(article.native.getAttribute("aria-describedby")).toBe("report-help")
    article.removeAttribute("aria-label")
    expect(article.native.hasAttribute("aria-label")).toBe(false)
  })

  it("uses native label activation, cancellation and disabled behavior without duplicate clicks", () => {
    document.body.innerHTML = '<m-label for="check">Consent</m-label><input id="check" type="checkbox">'
    const label = document.querySelector("m-label") as Label
    const input = document.querySelector("input")!
    const changes = vi.fn()
    input.addEventListener("change", changes)
    expect(input.labels![0]).toBe(label.native)
    label.click()
    expect(input.checked).toBe(true)
    expect(changes).toHaveBeenCalledOnce()
    input.disabled = true
    label.click()
    expect(input.checked).toBe(true)
    expect(changes).toHaveBeenCalledOnce()
    input.disabled = false
    label.addEventListener("click", event => event.preventDefault(), { once: true })
    label.click()
    expect(input.checked).toBe(true)
    expect(changes).toHaveBeenCalledOnce()
  })

  it("associates a portable field by its public ID without requiring an authored native control", async () => {
    document.body.innerHTML = '<m-label for="name-field">Name</m-label><m-input id="name-field"></m-input>'
    await flush()
    const label = document.querySelector("m-label") as Label
    const field = document.querySelector("m-input") as Input
    expect(label.control).toBe(field.native)
    expect(field.native.labels![0]).toBe(label.native)
    expect(field.native.id).not.toBe(field.id)
    label.focus()
    expect(document.activeElement).toBe(field.native)
    const id = field.native.id
    label.refresh()
    expect(field.native.id).toBe(id)
  })

  it("supports wrapping a portable field and multiple labels for one control", async () => {
    document.body.innerHTML = '<m-label>First<m-input id="wrapped"></m-input></m-label><m-label for="wrapped">Second</m-label>'
    await flush()
    const field = document.querySelector("m-input") as Input
    const labels = [...document.querySelectorAll<Label>("m-label")]
    expect(field.native.labels).toHaveLength(2)
    expect([...field.native.labels!]).toEqual(labels.map(label => label.native))
    labels[0]!.click()
    expect(labels[0]!.control).toBe(field.native)
  })

  it("resolves late targets, preserves authored control IDs and cleans up on disconnect", async () => {
    const label = new Label()
    label.htmlFor = "late"
    label.textContent = "Late field"
    document.body.append(label)
    expect(label.control).toBeNull()
    const field = new Input()
    field.id = "late"
    field.native.id = "authored-control"
    document.body.append(field)
    await flush()
    expect(label.native.htmlFor).toBe("authored-control")
    label.remove()
    field.native.id = "updated-control"
    await flush()
    expect(label.native.htmlFor).toBe("authored-control")
    document.body.prepend(label)
    await flush()
    expect(label.native.htmlFor).toBe("updated-control")
    expect(field.native.labels![0]).toBe(label.native)
  })

  it("replays pre-upgrade label properties through the canonical API", () => {
    const host = document.createElement("m-late-label") as Label
    host.htmlFor = "upgrade-control"
    host.required = true
    host.textContent = "Late label"
    const input = document.createElement("input")
    input.id = "upgrade-control"
    document.body.append(host, input)
    customElements.define("m-late-label", class extends Label {})
    expect(Object.hasOwn(host, "htmlFor")).toBe(false)
    expect(host.control).toBe(input)
    expect(host.required).toBe(true)
  })

  it("uses a direct native summary and details owner for portable disclosure", async () => {
    document.body.innerHTML = '<m-details><m-summary>More</m-summary><m-span>Body</m-span></m-details>'
    const details = document.querySelector("m-details") as Details
    const summary = document.querySelector("m-summary") as Summary
    const body = document.querySelector("m-span")!
    expect(details.native.localName).toBe("details")
    expect(details.native.firstElementChild).toBe(summary.native)
    expect(summary.native!.localName).toBe("summary")
    expect(summary.native!.parentElement).toBe(details.native)
    expect(details.open).toBe(false)
    const toggle = vi.fn()
    details.addEventListener("m:toggle", toggle)
    summary.click()
    expect(details.native.open).toBe(true)
    expect(details.open).toBe(true)
    details.append(document.createTextNode("Late body"))
    await flush()
    expect(details.open).toBe(true)
    expect(details.hasAttribute("open")).toBe(true)
    expect(toggle).toHaveBeenCalledOnce()
    expect(details.contains(body)).toBe(true)
    summary.click()
    await flush()
    expect(details.open).toBe(false)
    expect(details.hasAttribute("open")).toBe(false)
    expect(toggle).toHaveBeenCalledTimes(2)
  })

  it("preserves nested disclosure independence, open state and content across reconnect", async () => {
    document.body.innerHTML = '<m-details open><m-summary>Outer</m-summary><m-details><m-summary>Inner</m-summary><m-span>Nested</m-span></m-details></m-details>'
    const [outer, inner] = [...document.querySelectorAll<Details>("m-details")]
    const outerSummary = outer!.native.firstElementChild
    inner!.open = true
    await flush()
    expect(outer!.open).toBe(true)
    outer!.remove()
    document.body.append(outer!)
    await flush()
    expect(inner!.open).toBe(true)
    expect(outer!.native.firstElementChild).toBe(outerSummary)
    expect(outer!.querySelectorAll("summary")).toHaveLength(2)
    expect(() => { outer!.open = "yes" as unknown as boolean }).toThrow(RangeError)
    expect(outer!.open).toBe(true)
  })

  it("honors synchronous open writes before the native toggle event and does not reset on ARIA changes", async () => {
    const details = new Details()
    details.innerHTML = "<m-summary>More</m-summary>"
    document.body.append(details)
    details.native.open = true
    details.setAttribute("aria-label", "More information")
    expect(details.open).toBe(true)
    details.open = false
    expect(details.open).toBe(false)
    await flush()
    expect(details.hasAttribute("open")).toBe(false)
  })

  it("rejects duplicate or indirect summaries instead of silently selecting one", () => {
    const details = new Details()
    details.innerHTML = "<m-summary>One</m-summary><m-summary>Two</m-summary>"
    expect(() => details.refresh()).toThrow("at most one Summary")
    details.textContent = ""
    details.innerHTML = "<m-box><m-summary>Indirect</m-summary></m-box>"
    expect(() => details.refresh()).toThrow("directly")
  })
})
