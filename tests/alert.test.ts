import { afterEach, describe, expect, it, vi } from "vitest"
import { MuiAlert, registerAlert } from "../src/components/alert/index.js"
import type { AlertCloseDetail } from "../src/components/alert/index.js"
import { registerElements } from "../src/components/elements.js"

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

function alert(markup = "<mui-alert>Notice</mui-alert>"): MuiAlert {
  document.body.innerHTML = markup
  const element = document.querySelector("mui-alert")
  if (!(element instanceof MuiAlert)) throw new Error("Alert was not upgraded")
  return element
}
function close(element: MuiAlert): HTMLButtonElement {
  return element.querySelector<HTMLButtonElement>(":scope > [data-mui-alert-close]")!
}

describe("standalone Alert", () => {
  it("preserves free-form native content and listeners without adding an interactive or live role", () => {
    const element = document.createElement("mui-alert") as MuiAlert
    const text = document.createTextNode("Notice ")
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = "Action"
    const action = vi.fn()
    button.addEventListener("click", action)
    element.append(text, button)
    document.body.append(element)
    expect([...element.querySelector("[data-mui-alert-content]")!.childNodes]).toEqual([text, button])
    button.click()
    expect(action).toHaveBeenCalledOnce()
    expect(element.hasAttribute("role") || element.hasAttribute("tabindex") || element.hasAttribute("aria-live")).toBe(false)
    expect(element.querySelector("[role],[aria-live]")).toBeNull()
  })

  it("preserves explicitly authored native roles, live settings and names", () => {
    const element = alert('<mui-alert role="status" aria-live="polite" aria-atomic="true" aria-labelledby="heading" closable><h2 data-mui-alert-header id="heading">Saved</h2><p data-mui-alert-content>Initial</p></mui-alert>')
    element.type = "error"
    element.title = "Fallback"
    expect(element.getAttribute("role")).toBe("status")
    expect(element.getAttribute("aria-live")).toBe("polite")
    expect(element.getAttribute("aria-atomic")).toBe("true")
    expect(element.getAttribute("aria-labelledby")).toBe("heading")
    expect(element.querySelectorAll("[role],[aria-live]")).toHaveLength(0)
    element.setAttribute("role", "alert")
    element.removeAttribute("aria-live")
    element.showIcon = false
    expect(element.getAttribute("role")).toBe("alert")
    expect(element.hasAttribute("aria-live")).toBe(false)
  })

  it("does not add assertive semantics when a static notice is inserted or updated", async () => {
    const element = alert("<mui-alert type='warning'>Initial</mui-alert>")
    element.querySelector("[data-mui-alert-content]")!.textContent = "Changed"
    await Promise.resolve()
    element.remove()
    document.body.append(element)
    expect(element.hasAttribute("role") || element.hasAttribute("aria-live")).toBe(false)
    expect(element.querySelector("[role],[aria-live]")).toBeNull()
  })

  it("adopts authored header/content/icon/action nodes without rewriting headings or controls", () => {
    const element = alert('<mui-alert><span data-mui-alert-icon aria-hidden="true">★</span><header data-mui-alert-header><h3>Title</h3></header><section data-mui-alert-content><div data-mui-alert-actions><button type="button">Retry</button></div></section></mui-alert>')
    const header = element.querySelector("header")!
    const content = element.querySelector("section")!
    expect(header.parentElement).toBe(element.querySelector("[data-mui-alert-body]"))
    expect(content.parentElement).toBe(header.parentElement)
    expect(element.querySelector("[data-mui-alert-icon]")?.parentElement).toBe(element)
    expect(element.querySelector("h3")?.textContent).toBe("Title")
    expect(element.querySelector("button")?.type).toBe("button")
  })

  it("renders title strings as safe text and gives authored header precedence", async () => {
    const element = alert()
    element.title = "<img src=x onerror=alert(1)>"
    const generated = element.querySelector("[data-mui-alert-header]")!
    expect(generated.textContent).toBe("<img src=x onerror=alert(1)>")
    expect(element.querySelector("img")).toBeNull()
    expect(generated.hasAttribute("role")).toBe(false)
    const header = document.createElement("h2")
    header.setAttribute("data-mui-alert-header", "")
    header.textContent = "Authored"
    element.prepend(header)
    await Promise.resolve()
    element.title = "Changed fallback"
    expect(element.querySelector("[data-mui-alert-header]")).toBe(header)
    expect(header.textContent).toBe("Authored")
    expect(element.contains(generated)).toBe(false)
  })

  it("clears only the generated title when the title attribute is removed", () => {
    const element = alert('<mui-alert title="Title"><strong>Body</strong></mui-alert>')
    const body = element.querySelector("strong")
    element.removeAttribute("title")
    expect(element.querySelector("[data-mui-alert-header]")).toBeNull()
    expect(element.querySelector("strong")).toBe(body)
  })

  it("uses decorative semantic glyphs, with no empty default icon", () => {
    const element = alert()
    expect(element.querySelector("[data-mui-alert-icon]")).toBeNull()
    for (const [type, glyph] of [["info", "ⓘ"], ["success", "✓"], ["warning", "!"], ["error", "×"]]) {
      element.type = type!
      const icon = element.querySelector("[data-mui-alert-icon]")!
      expect(icon.textContent).toBe(glyph)
      expect(icon.getAttribute("aria-hidden")).toBe("true")
    }
    element.type = "constructor"
    expect(element.querySelector("[data-mui-alert-icon]")).toBeNull()
    element.type = "default"
    expect(element.querySelector("[data-mui-alert-icon]")).toBeNull()
  })

  it("preserves authored icon identity, listeners and ARIA across type/show changes", () => {
    const element = document.createElement("mui-alert") as MuiAlert
    const icon = document.createElement("span")
    icon.setAttribute("data-mui-alert-icon", "")
    icon.setAttribute("role", "img")
    icon.setAttribute("aria-label", "Custom symbol")
    icon.textContent = "★"
    const click = vi.fn()
    icon.addEventListener("click", click)
    element.append(icon, "Body")
    document.body.append(element)
    element.type = "error"
    element.showIcon = false
    expect(element.querySelector("[data-mui-alert-icon]")).toBe(icon)
    expect(icon.getAttribute("aria-label")).toBe("Custom symbol")
    expect(icon.hasAttribute("aria-hidden")).toBe(false)
    element.showIcon = true
    icon.click()
    expect(click).toHaveBeenCalledOnce()
    expect(element.querySelectorAll("[data-mui-alert-icon]")).toHaveLength(1)
  })

  it("adopts a late custom icon without retaining the generated one", async () => {
    const element = alert('<mui-alert type="info">Body</mui-alert>')
    const generated = element.querySelector("[data-mui-alert-icon]")
    const icon = document.createElement("span")
    icon.dataset.muiAlertIcon = ""
    icon.textContent = "★"
    element.append(icon)
    await Promise.resolve()
    expect(element.querySelectorAll("[data-mui-alert-icon]")).toHaveLength(1)
    expect(element.querySelector("[data-mui-alert-icon]")).toBe(icon)
    expect(element.contains(generated)).toBe(false)
  })

  it("accepts direct native SVG icons without moving them into body content", () => {
    const element = alert('<mui-alert type="info"><svg data-mui-alert-icon aria-hidden="true" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"></circle></svg>Body</mui-alert>')
    const icon = element.querySelector("svg")!
    const shape = icon.querySelector("circle")
    element.type = "warning"
    element.showIcon = false
    expect(icon.parentElement).toBe(element)
    expect(element.querySelectorAll("[data-mui-alert-icon]")).toHaveLength(1)
    expect(icon.querySelector("circle")).toBe(shape)
    expect(element.querySelector("[data-mui-alert-content]")?.textContent).toBe("Body")
  })

  it("preserves inert templates even when they carry region markers", () => {
    const element = alert('<mui-alert><template data-mui-alert-header><h2>Inert header</h2></template><template data-mui-alert-icon><span>Inert icon</span></template>Body</mui-alert>')
    expect(element.querySelectorAll(":scope > template")).toHaveLength(2)
    expect(element.querySelector("h2")).toBeNull()
    expect(element.querySelector("[data-mui-alert-body]")?.textContent).toBe("Body")
    expect(element.querySelector(":scope > span[data-mui-alert-icon]")).toBeNull()
  })

  it("adopts late explicit content and preserves original body nodes", async () => {
    const element = alert("<mui-alert><strong>Original</strong></mui-alert>")
    const original = element.querySelector("strong")
    const content = document.createElement("section")
    content.dataset.muiAlertContent = ""
    content.textContent = "New"
    element.append(content)
    await Promise.resolve()
    expect(element.querySelectorAll("[data-mui-alert-content]")).toHaveLength(1)
    expect(content.firstChild).toBe(original)
    expect(content.textContent).toBe("OriginalNew")
    element.append(" late")
    await Promise.resolve()
    expect(content.textContent).toBe("OriginalNew late")
  })

  it("adopts an authored body arriving after generated structure", async () => {
    const element = alert('<mui-alert title="Title" closable>Original</mui-alert>')
    const nativeClose = close(element)
    const body = document.createElement("div")
    body.dataset.muiAlertBody = ""
    const header = document.createElement("h2")
    header.dataset.muiAlertHeader = ""
    header.textContent = "Authored"
    body.append(header)
    element.append(body)
    await Promise.resolve()
    expect(element.querySelectorAll("[data-mui-alert-body]")).toHaveLength(1)
    expect(element.querySelector("[data-mui-alert-body]")).toBe(body)
    expect(element.querySelector("[data-mui-alert-header]")).toBe(header)
    expect(element.textContent).toContain("Original")
    expect(element.lastElementChild).toBe(nativeClose)
  })

  it("emits cancellable close intent without hiding, removal or leave notifications", () => {
    const element = alert('<mui-alert closable title="Notice">Body</mui-alert>')
    const intent = vi.fn((event: Event) => event.preventDefault())
    const leave = vi.fn()
    element.addEventListener("mui:close", intent)
    element.addEventListener("mui:after-leave", leave)
    element.addEventListener("mui:after-hide", leave)
    close(element).click()
    expect(intent).toHaveBeenCalledOnce()
    const event = intent.mock.calls[0]![0] as CustomEvent<AlertCloseDetail>
    expect(event.bubbles && event.cancelable && event.defaultPrevented).toBe(true)
    expect(event.detail.originalEvent.target).toBe(close(element))
    expect(element.isConnected && !element.hidden).toBe(true)
    element.hidden = true
    element.remove()
    expect(leave).not.toHaveBeenCalled()
  })

  it("does not remove the alert when close intent is not cancelled", () => {
    const element = alert("<mui-alert closable>Body</mui-alert>")
    close(element).click()
    expect(element.isConnected && !element.hidden).toBe(true)
  })

  it("uses an accessible native type=button close without submitting the enclosing form", () => {
    const element = alert('<form><mui-alert closable close-label="Dismiss warning"><button type="submit">Retry</button></mui-alert></form>')
    const submit = vi.fn((event: Event) => event.preventDefault())
    document.querySelector("form")!.addEventListener("submit", submit)
    const native = close(element)
    expect(native.type).toBe("button")
    expect(native.tabIndex).toBe(0)
    expect(native.getAttribute("aria-label")).toBe("Dismiss warning")
    expect(native.querySelector("span")?.getAttribute("aria-hidden")).toBe("true")
    native.focus()
    expect(document.activeElement).toBe(native)
    native.click()
    expect(submit).not.toHaveBeenCalled()
    element.querySelector<HTMLButtonElement>("[data-mui-alert-content] button")!.click()
    expect(submit).toHaveBeenCalledOnce()
  })

  it("keeps native keyboard defaults and respects cancellation before close handling", () => {
    const element = alert("<mui-alert closable>Body</mui-alert>")
    const intent = vi.fn()
    element.addEventListener("mui:close", intent)
    for (const key of ["Enter", " "]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
      close(element).dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(intent).not.toHaveBeenCalled()
    element.addEventListener("click", (event) => event.preventDefault(), { capture: true })
    close(element).click()
    expect(intent).not.toHaveBeenCalled()
  })

  it("updates close labels without touching original content or control identity", () => {
    const element = alert("<mui-alert closable>Body</mui-alert>")
    const native = close(element)
    const content = element.querySelector("[data-mui-alert-content]")
    expect(native.getAttribute("aria-label")).toBe("Close alert")
    element.closeLabel = "Dismiss notice"
    expect(native.getAttribute("aria-label")).toBe("Dismiss notice")
    element.closeLabel = " "
    expect(native.getAttribute("aria-label")).toBe("Close alert")
    expect(close(element)).toBe(native)
    expect(element.querySelector("[data-mui-alert-content]")).toBe(content)
  })

  it("does not rewrite ARIA or move controls during authored live-region text updates", async () => {
    const element = alert('<mui-alert role="status" closable><p data-mui-alert-content>Before</p></mui-alert>')
    const records: MutationRecord[] = []
    const observer = new MutationObserver((mutations) => records.push(...mutations))
    observer.observe(element, { attributes: true, childList: true, subtree: true })
    close(element).focus()
    element.querySelector("p")!.textContent = "After"
    await Promise.resolve()
    await Promise.resolve()
    observer.disconnect()
    expect(records.some((record) => record.type === "attributes")).toBe(false)
    expect(records.every((record) => record.target === element.querySelector("p"))).toBe(true)
    expect(document.activeElement).toBe(close(element))
  })

  it("removes stale close listeners when closable is unset", () => {
    const element = alert("<mui-alert closable>Body</mui-alert>")
    const native = close(element)
    const intent = vi.fn()
    element.addEventListener("mui:close", intent)
    element.closable = false
    native.click()
    expect(intent).not.toHaveBeenCalled()
    expect(element.querySelector("[data-mui-alert-close]")).toBeNull()
    expect(element.textContent).toBe("Body")
    element.closable = true
    close(element).click()
    expect(intent).toHaveBeenCalledOnce()
  })

  it("preserves native disabled fieldsets and explicitly disabled close controls", () => {
    const element = alert("<fieldset disabled><mui-alert closable>Body</mui-alert></fieldset>")
    const intent = vi.fn()
    element.addEventListener("mui:close", intent)
    const native = close(element)
    native.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    expect(intent).not.toHaveBeenCalled()
    document.querySelector("fieldset")!.disabled = false
    native.disabled = true
    element.title = "Updated"
    expect(native.disabled).toBe(true)
    native.click()
    expect(intent).not.toHaveBeenCalled()
    native.disabled = false
    native.click()
    expect(intent).toHaveBeenCalledOnce()
  })

  it("releases observers/listeners on disconnect and reconnects without losing native state", async () => {
    const element = alert('<mui-alert closable title="Before"><input value="Initial"></mui-alert>')
    const native = close(element)
    const input = element.querySelector("input")!
    input.value = "Edited"
    const intent = vi.fn()
    element.addEventListener("mui:close", intent)
    element.remove()
    element.title = "After"
    native.click()
    await Promise.resolve()
    expect(intent).not.toHaveBeenCalled()
    expect(element.querySelector("[data-mui-alert-header]")?.textContent).toBe("Before")
    document.body.append(element)
    expect(close(element)).toBe(native)
    expect(element.querySelector("input")).toBe(input)
    expect(input.value).toBe("Edited")
    expect(element.querySelector("[data-mui-alert-header]")?.textContent).toBe("After")
    native.click()
    expect(intent).toHaveBeenCalledOnce()
  })

  it("handles replaced regions without resurrecting discarded authored content", async () => {
    const element = alert('<mui-alert closable title="Fallback"><header data-mui-alert-header>Old header</header><p data-mui-alert-content>Old body</p></mui-alert>')
    const old = element.querySelector("p")!
    const native = close(element)
    element.innerHTML = "<h3 data-mui-alert-header>New header</h3><p data-mui-alert-content>New body</p>"
    await Promise.resolve()
    expect(close(element)).toBe(native)
    expect(element.contains(old)).toBe(false)
    expect(element.querySelectorAll("[data-mui-alert-body]")).toHaveLength(1)
    expect(element.querySelectorAll("[data-mui-alert-header]")).toHaveLength(1)
    expect(element.textContent).not.toContain("Old")
  })

  it("does not emit a second parent close for nested alerts", () => {
    const outer = alert('<mui-alert closable><mui-alert closable>Inner</mui-alert></mui-alert>')
    const inner = outer.querySelector("mui-alert") as MuiAlert
    const intent = vi.fn()
    outer.addEventListener("mui:close", intent)
    close(inner).click()
    expect(intent).toHaveBeenCalledOnce()
    expect(intent.mock.calls[0]![0].target).toBe(inner)
    expect(outer.isConnected && inner.isConnected).toBe(true)
  })

  it("preserves pre-definition properties and runtime CSS separation", () => {
    document.body.innerHTML = "<test-late-alert><p>Body</p></test-late-alert>"
    const element = document.querySelector("test-late-alert") as MuiAlert
    const content = element.querySelector("p")
    Object.assign(element, { title: "Late", type: "success", closable: true, closeLabel: "Dismiss", showIcon: false, bordered: false })
    customElements.define("test-late-alert", class extends MuiAlert {})
    expect(element.querySelector("p")).toBe(content)
    expect(element.querySelector("[data-mui-alert-header]")?.textContent).toBe("Late")
    expect(element.type).toBe("success")
    expect(element.showIcon || element.bordered).toBe(false)
    expect(close(element).getAttribute("aria-label")).toBe("Dismiss")
    expect(element.querySelector("[data-mui-alert-icon]")).toBeNull()
    expect(element.shadowRoot).toBeNull()
    expect(document.querySelector("style,[style]")).toBeNull()
  })

  it("reports conflicts and preserves rich definitions when the aggregate loads afterward", () => {
    expect(() => registerAlert()).not.toThrow()
    const define = vi.fn()
    expect(() => registerAlert({ get: () => class extends HTMLElement {}, define })).toThrow("before the legacy MarkupUI bundle")
    expect(define).not.toHaveBeenCalled()
    registerElements(customElements)
    expect(customElements.get("mui-alert")).toBe(MuiAlert)
    expect(alert("<mui-alert closable>Body</mui-alert>").querySelector("button")).not.toBeNull()
  })
})
