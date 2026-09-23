import { afterEach, describe, expect, it, vi } from "vitest"
import { m } from "../src/index.js"
import { widgetsPlugin, type RatingElement } from "../src/plugins/widgets.js"

const beforeUpgrade = document.createElement("m-rating") as RatingElement
beforeUpgrade.max = 8
beforeUpgrade.value = 7
beforeUpgrade.disabled = true
document.body.append(beforeUpgrade)
m.use(widgetsPlugin)

afterEach(() => document.body.replaceChildren())

function rating(): RatingElement {
  const element = document.createElement("m-rating") as RatingElement
  element.setAttribute("aria-label", "Review score")
  document.body.append(element)
  return element
}

describe("optional Rating ownership", () => {
  it("replays pre-upgrade max, value and disabled before rendering", () => {
    expect(beforeUpgrade.max).toBe(8)
    expect(beforeUpgrade.value).toBe(7)
    expect(beforeUpgrade.querySelectorAll("button")).toHaveLength(8)
    expect(beforeUpgrade.querySelectorAll(":disabled")).toHaveLength(8)
    for (const key of ["max", "value", "disabled"]) expect(Object.hasOwn(beforeUpgrade, key)).toBe(false)
  })

  it("keeps native button semantics, identity and focus for silent programmatic writes", () => {
    const element = rating(), button = element.querySelector<HTMLButtonElement>("button")!
    const changed = vi.fn()
    element.addEventListener("m:change", changed)
    button.focus()
    element.value = 3
    expect(element.getAttribute("role")).toBe("group")
    expect(element.querySelector("button")).toBe(button)
    expect(document.activeElement).toBe(button)
    expect(element.querySelectorAll('[data-state="active"]')).toHaveLength(3)
    expect(element.querySelector('[aria-pressed="true"]')?.getAttribute("aria-label")).toBe("3 of 5")
    element.setAttribute("value", "2")
    expect(element.value).toBe(2)
    expect(changed).not.toHaveBeenCalled()
  })

  it("emits once per changed user selection and ignores disabled controls and authored buttons", () => {
    const element = rating(), button = element.querySelector<HTMLButtonElement>("button")!
    const changed = vi.fn(), authored = document.createElement("button")
    element.prepend(authored)
    element.addEventListener("m:change", changed)
    authored.click()
    button.click()
    button.click()
    expect(changed).toHaveBeenCalledOnce()
    expect(changed.mock.calls[0]![0].detail).toBe(1)
    expect(changed.mock.calls[0]![0].bubbles).toBe(true)
    expect(changed.mock.calls[0]![0].cancelable).toBe(false)
    element.disabled = true
    element.querySelector<HTMLButtonElement>('button[aria-label="2 of 5"]')!.click()
    expect(element.value).toBe(1)
    element.disabled = false
    const fieldset = document.createElement("fieldset")
    fieldset.disabled = true
    document.body.append(fieldset)
    fieldset.append(element)
    button.click()
    expect(changed).toHaveBeenCalledOnce()
  })

  it("validates bounded integers before mutation and recovers from malformed attributes", () => {
    const element = rating(), error = vi.fn()
    element.value = 2
    for (const value of [-1, 6, NaN, Infinity, 1.5, "2", null]) {
      expect(() => { element.value = value as number }).toThrow()
      expect(element.value).toBe(2)
    }
    for (const value of [0, 1, 11, NaN, 2.5, "3"]) {
      expect(() => { element.max = value as number }).toThrow()
      expect(element.max).toBe(5)
    }
    element.addEventListener("m:error", error)
    element.setAttribute("max", "100000")
    expect(error).toHaveBeenCalledOnce()
    expect(element.querySelectorAll("button")).toHaveLength(5)
    expect(() => element.max).toThrow()
    element.setAttribute("max", "3")
    expect(element.querySelectorAll("button")).toHaveLength(3)
    expect(element.value).toBe(2)
  })

  it("updates max while keeping surviving buttons and recovering removed focus", () => {
    const element = rating(), first = element.querySelector("button")
    element.querySelector<HTMLButtonElement>('button[aria-label="5 of 5"]')!.focus()
    element.max = 3
    expect(element.querySelector("button")).toBe(first)
    expect(document.activeElement?.getAttribute("aria-label")).toBe("3 of 3")
    element.max = 10
    expect(element.querySelectorAll("button")).toHaveLength(10)
    expect(document.activeElement?.getAttribute("aria-label")).toBe("3 of 10")
  })

  it("preserves authored nodes and releases click handling and owned role on disconnect", () => {
    const element = rating(), note = document.createElement("span"), clicked = vi.fn(), changed = vi.fn()
    note.textContent = "Score"
    note.addEventListener("click", clicked)
    element.prepend(note)
    const button = element.querySelector<HTMLButtonElement>("button")!
    element.addEventListener("m:change", changed)
    element.remove()
    expect(element.hasAttribute("role")).toBe(false)
    button.click()
    expect(element.value).toBe(0)
    element.value = 2
    document.body.append(element)
    note.click()
    expect(clicked).toHaveBeenCalledOnce()
    expect(element.querySelector("button")).toBe(button)
    button.click()
    expect(changed).toHaveBeenCalledOnce()
    expect(element.querySelectorAll("button")).toHaveLength(5)
    element.setAttribute("role", "region")
    element.remove()
    expect(element.getAttribute("role")).toBe("region")
  })
})
