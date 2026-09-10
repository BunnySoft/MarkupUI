import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { MuiBadge, registerBadge } from "../src/components/badge/index.js"
import { registerElements } from "../src/components/elements.js"

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

function badge(markup = '<mui-badge value="12"></mui-badge>'): MuiBadge {
  document.body.innerHTML = markup
  const element = document.querySelector("mui-badge")
  if (!(element instanceof MuiBadge)) throw new Error("Badge was not upgraded")
  return element
}
function number(element: MuiBadge): HTMLSpanElement {
  return element.querySelector<HTMLSpanElement>("[data-mui-badge-number]")!
}

describe("standalone Badge", () => {
  it("renders a standalone numeric value without inventing semantics or interaction", () => {
    const element = badge()
    expect(element.value).toBe("12")
    expect(number(element).textContent).toBe("12")
    expect(element.indicator?.hidden).toBe(false)
    expect(element.dataset.muiBadgeMode).toBe("standalone")
    expect(element.dataset.muiBadgeState).toBe("value")
    expect(element.querySelector("[role],[tabindex],[aria-live],[aria-label]")).toBeNull()
    expect(element.hasAttribute("role") || element.hasAttribute("tabindex")).toBe(false)
  })

  it("caps numeric and numeric-string values without changing their source", () => {
    const element = badge('<mui-badge value="105" max="99"></mui-badge>')
    expect(number(element).textContent).toBe("99+")
    expect(element.value).toBe("105")
    element.value = 200
    expect(number(element).textContent).toBe("99+")
    element.max = undefined
    expect(number(element).textContent).toBe("200")
    element.max = 0
    expect(number(element).textContent).toBe("0+")
  })

  it("gives integer counts and overflow suffixes stable digit cells without a transition renderer", () => {
    const element = badge('<mui-badge value="105" max="99"></mui-badge>')
    expect([...number(element).children].map((digit) => digit.textContent)).toEqual(["9", "9", "+"])
    expect(number(element).querySelectorAll("[data-mui-badge-digit]")).toHaveLength(3)
    element.max = undefined
    element.value = "001"
    expect(number(element).textContent).toBe("001")
    expect(number(element).children).toHaveLength(3)
    const digits = [...number(element).children]
    element.dot = true
    element.dot = false
    expect([...number(element).children]).toEqual(digits)
    for (const value of ["2.5", "-3", "1e3", "New", "12+"]) {
      element.value = value
      expect(number(element).textContent).toBe(value)
      expect(number(element).children).toHaveLength(0)
    }
    element.value = 5
    expect(number(element).children).toHaveLength(1)
    expect(element.querySelector("[style],[role],[aria-live]")).toBeNull()
  })

  it("switches formatting modes when capped and literal values have the same displayed text", () => {
    const element = badge('<mui-badge value="105" max="99"></mui-badge>')
    const content = number(element)
    expect(content.querySelectorAll("[data-mui-badge-digit]")).toHaveLength(3)
    element.value = "99+"
    expect(content.textContent).toBe("99+")
    expect(content.childElementCount).toBe(0)
    const literal = content.firstChild
    expect(literal?.nodeType).toBe(Node.TEXT_NODE)
    element.value = "99+"
    element.dot = true
    element.dot = false
    expect(content.firstChild).toBe(literal)

    element.value = 105
    expect(content.textContent).toBe("99+")
    expect(content.querySelectorAll("[data-mui-badge-digit]")).toHaveLength(3)
    const cells = [...content.children]
    element.value = 200
    element.show = false
    element.show = true
    element.dot = true
    element.dot = false
    expect(content.children).toHaveLength(cells.length)
    cells.forEach((cell, index) => expect(content.children[index]).toBe(cell))
  })

  it("retains authored Badge tokens through formatting, dot changes and reconnection", () => {
    const element = badge('<mui-badge value="5" style="--mui-badge-size:28px;--mui-badge-font-size:16px;--mui-badge-font-family:monospace;--mui-badge-background:rgb(1,2,3);--mui-badge-offset-x:6px"></mui-badge>')
    const authored = element.getAttribute("style")
    element.value = 105
    element.max = 99
    element.dot = true
    element.dot = false
    element.remove()
    document.body.append(element)
    expect(element.getAttribute("style")).toBe(authored)
    expect(number(element).textContent).toBe("99+")
    expect(element.querySelector("[style]")).toBeNull()
  })

  it("keeps the audited geometry, theme fallback roles and reduced-motion styling external", () => {
    const css = readFileSync(resolve("src", "components", "badge", "badge.css"), "utf8")
    expect(css).toContain('inline-size: .6em')
    expect(css).toContain('block-size: var(--mui-badge-size, 18px)')
    expect(css).toContain('line-height: var(--mui-badge-size, 18px)')
    expect(css).toContain('border-radius: var(--mui-badge-radius, 9px)')
    expect(css).toContain('z-index: var(--mui-badge-z-index, 2)')
    expect(css).toContain('inset-inline-start: 100%')
    expect(css).toContain('overflow: hidden')
    for (const [role, color] of [["error", "#d03a52"], ["success", "#2a947d"], ["warning", "#f08a00"], ["info", "#3889c5"]]) {
      expect(css).toContain(`var(--mui-color-${role}-suppl, ${color})`)
    }
    expect(css).toContain(':where([data-mui-theme="light"])')
    expect(css).toContain(':where([data-mui-theme="dark"])')
    expect(css).toContain('var(--mui-badge-font-family, var(--mui-font-family, v-sans')
    expect(css).toContain('4.5px var(--mui-badge-background')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('transition: none')
    expect(css).toContain('animation: none; content: none')
  })

  it("handles zero and negative counts explicitly", () => {
    const element = badge('<mui-badge value="0"></mui-badge>')
    expect(element.indicator?.hidden).toBe(true)
    element.showZero = true
    expect(element.indicator?.hidden).toBe(false)
    expect(number(element).textContent).toBe("0")
    element.value = -3
    expect(number(element).textContent).toBe("-3")
    expect(element.indicator?.hidden).toBe(false)
    element.showZero = false
    expect(element.indicator?.hidden).toBe(true)
    element.value = "-0.0"
    expect(element.indicator?.hidden).toBe(true)
  })

  it("preserves decimal text and caps decimal/exponent numeric representations", () => {
    const element = badge('<mui-badge value="2.5"></mui-badge>')
    expect(number(element).textContent).toBe("2.5")
    element.value = "1e3"
    element.max = 10
    expect(number(element).textContent).toBe("10+")
    element.value = "001"
    expect(number(element).textContent).toBe("001")
    element.value = "0xff"
    expect(number(element).textContent).toBe("0xff")
  })

  it("rejects nonfinite numeric property assignments and invalid caps", () => {
    const element = badge()
    for (const cap of ["-1", "Infinity", "NaN", "", " ", "wrong"]) {
      element.setAttribute("max", cap)
      expect(element.max).toBeUndefined()
      expect(number(element).textContent).toBe("12")
    }
    element.max = Infinity
    expect(element.hasAttribute("max")).toBe(false)
    element.max = -1
    expect(element.max).toBeUndefined()
    element.value = NaN
    expect(element.value).toBeUndefined()
    expect(element.indicator?.hidden).toBe(true)
    element.value = "Infinity"
    expect(number(element).textContent).toBe("Infinity")
    expect(element.indicator?.hidden).toBe(false)
  })

  it("renders arbitrary text safely and hides absent/blank values", () => {
    const element = badge()
    element.value = '<img src=x onerror="alert(1)">'
    expect(number(element).textContent).toBe('<img src=x onerror="alert(1)">')
    expect(element.querySelector("img")).toBeNull()
    for (const value of ["", " ", null, undefined]) {
      element.value = value
      expect(element.indicator?.hidden).toBe(true)
    }
  })

  it("preserves target nodes, listeners, names, focus and native form behavior", () => {
    const form = document.createElement("form")
    const element = document.createElement("mui-badge") as MuiBadge
    element.value = 5
    const target = document.createElement("button")
    target.type = "submit"
    target.setAttribute("aria-label", "Inbox, 5 unread")
    target.textContent = "Inbox"
    const click = vi.fn()
    target.addEventListener("click", click)
    element.append(target)
    form.append(element)
    document.body.append(form)
    const submit = vi.fn((event: Event) => event.preventDefault())
    form.addEventListener("submit", submit)
    element.value = 6
    target.focus()
    target.click()
    expect(element.querySelector("button")).toBe(target)
    expect(target.parentElement).toBe(element)
    expect(target.getAttribute("aria-label")).toBe("Inbox, 5 unread")
    expect(document.activeElement).toBe(target)
    expect(click).toHaveBeenCalledOnce()
    expect(submit).toHaveBeenCalledOnce()
    expect(element.dataset.muiBadgeMode).toBe("attached")
  })

  it("hides only the indicator when show is false", () => {
    const element = badge('<mui-badge value="5"><button type="button">Inbox</button></mui-badge>')
    element.show = false
    expect(element.indicator?.hidden).toBe(true)
    expect(element.hidden).toBe(false)
    expect(element.querySelector("button")?.hidden).toBe(false)
    element.show = true
    expect(element.indicator?.hidden).toBe(false)
    expect(element.show).toBe(true)
  })

  it("shows a dot independently of value and restores the original count when cleared", () => {
    const element = badge('<mui-badge dot value="0"></mui-badge>')
    expect(element.dataset.muiBadgeState).toBe("dot")
    expect(element.indicator?.hidden).toBe(false)
    expect(number(element).hidden).toBe(true)
    element.value = 9
    element.dot = false
    expect(number(element).hidden).toBe(false)
    expect(number(element).textContent).toBe("9")
    element.show = false
    element.dot = true
    expect(element.indicator?.hidden).toBe(true)
  })

  it("does not use processing alone as a visibility trigger", () => {
    const element = badge("<mui-badge processing></mui-badge>")
    expect(element.indicator?.hidden).toBe(true)
    element.dot = true
    expect(element.indicator?.hidden).toBe(false)
    element.processing = false
    expect(element.indicator?.hidden).toBe(false)
    expect(element.hasAttribute("processing")).toBe(false)
  })

  it("adopts custom value content ahead of count/cap/zero rules without cloning", () => {
    const element = document.createElement("mui-badge") as MuiBadge
    element.value = 0
    element.max = 0
    const content = document.createElement("span")
    content.setAttribute("data-mui-badge-value", "")
    content.textContent = "New"
    const listener = vi.fn()
    content.addEventListener("click", listener)
    element.append(content)
    document.body.append(element)
    expect(element.indicator?.contains(content)).toBe(true)
    expect(element.indicator?.hidden).toBe(false)
    expect(number(element).hidden).toBe(true)
    content.click()
    expect(listener).toHaveBeenCalledOnce()
    element.value = 999
    expect(element.querySelector("[data-mui-badge-value]")).toBe(content)
    expect(content.textContent).toBe("New")
    expect(element.dataset.muiBadgeMode).toBe("standalone")
  })

  it("preserves authored custom accessibility and hidden state when switching to a dot", () => {
    const element = badge('<mui-badge><span data-mui-badge-value id="status" role="status" aria-live="polite">New</span></mui-badge>')
    const content = element.querySelector<HTMLElement>("[data-mui-badge-value]")!
    element.dot = true
    expect(content.hidden).toBe(false)
    expect(content.parentElement?.hidden).toBe(true)
    element.dot = false
    expect(content.parentElement?.hidden).toBe(false)
    expect(content.getAttribute("role")).toBe("status")
    expect(content.getAttribute("aria-live")).toBe("polite")
    expect(content.id).toBe("status")
  })

  it("decorates only the indicator, never the wrapped action", () => {
    const element = badge('<mui-badge value="5" decorative><button type="button" aria-label="Inbox, 5 unread">Inbox</button></mui-badge>')
    expect(element.indicator?.getAttribute("aria-hidden")).toBe("true")
    expect(element.hasAttribute("aria-hidden")).toBe(false)
    expect(element.querySelector("button")?.hasAttribute("aria-hidden")).toBe(false)
    element.decorative = false
    expect(element.indicator?.hasAttribute("aria-hidden")).toBe(false)
    expect(element.querySelector("[aria-live]")).toBeNull()
  })

  it("keeps templates inert and default text readable without inventing a count", () => {
    const element = badge("<mui-badge>Inbox<template><button>Inert</button></template></mui-badge>")
    expect(element.indicator?.hidden).toBe(true)
    expect(element.firstChild?.textContent).toBe("Inbox")
    expect(element.querySelector("template")?.parentElement).toBe(element)
    expect(element.querySelector("button")).toBeNull()
    expect(element.dataset.muiBadgeMode).toBe("attached")
  })

  it("does not treat an inert value-marked template as rendered value content", () => {
    const element = badge("<mui-badge><template data-mui-badge-value><span>Inert value</span></template></mui-badge>")
    expect(element.querySelector("template")?.parentElement).toBe(element)
    expect(element.indicator?.hidden).toBe(true)
    expect(element.dataset.muiBadgeMode).toBe("standalone")
  })

  it("handles late/replaced targets without replacing the indicator", async () => {
    const element = badge()
    const indicator = element.indicator
    const target = document.createElement("button")
    target.textContent = "Inbox"
    element.prepend(target)
    await Promise.resolve()
    expect(element.dataset.muiBadgeMode).toBe("attached")
    const replacement = document.createElement("a")
    replacement.href = "#inbox"
    replacement.textContent = "Messages"
    target.replaceWith(replacement)
    await Promise.resolve()
    expect(element.indicator).toBe(indicator)
    expect(replacement.parentElement).toBe(element)
    replacement.remove()
    await Promise.resolve()
    expect(element.dataset.muiBadgeMode).toBe("standalone")
  })

  it("reclassifies late/changed value markers and restores generated values", async () => {
    const element = badge()
    const content = document.createElement("span")
    content.setAttribute("data-mui-badge-value", "")
    content.textContent = "New"
    element.append(content)
    await Promise.resolve()
    expect(number(element).hidden).toBe(true)
    expect(element.indicator?.contains(content)).toBe(true)
    content.removeAttribute("data-mui-badge-value")
    await Promise.resolve()
    expect(content.parentElement).toBe(element)
    expect(element.dataset.muiBadgeMode).toBe("attached")
    expect(number(element).hidden).toBe(false)
    expect(number(element).textContent).toBe("12")
  })

  it("does not resurrect removed authored values when all host children are replaced", async () => {
    const element = badge('<mui-badge value="5"><span data-mui-badge-value>Old</span></mui-badge>')
    const old = element.querySelector("[data-mui-badge-value]")!
    const indicator = element.indicator
    const target = document.createElement("button")
    target.textContent = "New target"
    element.replaceChildren(target)
    await Promise.resolve()
    expect(element.indicator).not.toBe(indicator)
    expect(element.contains(old)).toBe(false)
    expect(number(element).textContent).toBe("5")
    expect(element.querySelectorAll("[data-mui-badge-indicator]")).toHaveLength(1)
  })

  it("disconnects observation and reconnects without duplicating or losing nodes", async () => {
    const element = badge()
    const indicator = element.indicator
    element.remove()
    element.value = 15
    await Promise.resolve()
    expect(number(element).textContent).toBe("12")
    document.body.append(element)
    expect(element.indicator).toBe(indicator)
    expect(number(element).textContent).toBe("15")
    expect(element.querySelectorAll("[data-mui-badge-indicator]")).toHaveLength(1)
  })

  it("keeps property assignment silent and never alters target disabled state", () => {
    const element = badge('<mui-badge value="5"><button type="button" disabled>Inbox</button></mui-badge>')
    const notification = vi.fn()
    for (const name of ["click", "change", "input", "mui:change"]) element.addEventListener(name, notification)
    element.value = 9
    element.show = false
    element.max = 3
    element.dot = true
    expect(notification).not.toHaveBeenCalled()
    expect(element.querySelector("button")?.disabled).toBe(true)
    expect(element.querySelector("[tabindex]")).toBeNull()
  })

  it("preserves pre-definition properties", () => {
    document.body.innerHTML = "<test-late-badge></test-late-badge>"
    const element = document.querySelector("test-late-badge") as MuiBadge
    Object.assign(element, { value: 12, max: 9, show: true, showZero: true, dot: false, processing: true, decorative: true, type: "info", placement: "bottom-start" })
    customElements.define("test-late-badge", class extends MuiBadge {})
    expect(number(element).textContent).toBe("9+")
    expect(element.indicator?.getAttribute("aria-hidden")).toBe("true")
    expect(element.showZero && element.processing).toBe(true)
    expect(element.type).toBe("info")
    expect(element.placement).toBe("bottom-start")
  })

  it("injects no styles or shadow DOM and reports registration conflicts", () => {
    const element = badge()
    expect(element.shadowRoot).toBeNull()
    expect(document.querySelector("style,[style]")).toBeNull()
    expect(() => registerBadge()).not.toThrow()
    const define = vi.fn()
    expect(() => registerBadge({ get: () => class extends HTMLElement {}, define })).toThrow("before the legacy MarkupUI bundle")
    expect(define).not.toHaveBeenCalled()
  })

  it("retains rich registration when the legacy aggregate is registered", () => {
    registerElements(customElements)
    expect(customElements.get("mui-badge")).toBe(MuiBadge)
    const element = badge('<mui-badge value="3">Inbox</mui-badge>')
    expect(number(element).textContent).toBe("3")
    expect(element.dataset.muiBadgeMode).toBe("attached")
  })
})
