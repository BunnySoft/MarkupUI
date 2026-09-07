import { afterEach, describe, expect, it, vi } from "vitest"
import { MuiStatistic, registerStatistic } from "../src/components/statistic/index.js"
import { registerElements } from "../src/components/elements.js"

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

function statistic(markup = "<mui-statistic></mui-statistic>"): MuiStatistic {
  document.body.innerHTML = markup
  const element = document.querySelector("mui-statistic")
  if (!(element instanceof MuiStatistic)) throw new Error("Statistic was not upgraded")
  return element
}
function region(element: MuiStatistic, name: string): HTMLElement {
  return element.querySelector<HTMLElement>(name === "label"
    ? ":scope > [data-mui-statistic-label]"
    : `:scope > [data-mui-statistic-display] > [data-mui-statistic-${name}]`)!
}
function text(element: MuiStatistic, name: string): HTMLElement {
  return region(element, name).querySelector<HTMLElement>(":scope > [data-mui-statistic-text]")!
}
function slot(element: MuiStatistic, name: string): HTMLElement {
  return region(element, name).querySelector<HTMLElement>(":scope > [data-mui-statistic-slot]")!
}

describe("standalone Statistic", () => {
  it("does not turn missing values into zero or fabricate semantics", () => {
    const element = statistic()
    expect(element.value).toBeUndefined()
    expect(element.label).toBeUndefined()
    expect(region(element, "value").hidden).toBe(true)
    expect(region(element, "label").hidden).toBe(true)
    expect(element.textContent).toBe("")
    expect(element.querySelector("output,[role],[aria-live],button")).toBeNull()
    expect(element.hasAttribute("role") || element.hasAttribute("tabindex")).toBe(false)
  })

  it("retains legacy label/value/prefix/suffix attributes as separate native regions", () => {
    const element = statistic('<mui-statistic label="Revenue" value="123" prefix="$" suffix="USD"></mui-statistic>')
    expect(text(element, "label").textContent).toBe("Revenue")
    expect(text(element, "prefix").textContent).toBe("$")
    expect(text(element, "value").textContent).toBe("123")
    expect(text(element, "suffix").textContent).toBe("USD")
    expect(element.querySelectorAll("[data-mui-statistic-display]")).toHaveLength(1)
  })

  it("preserves zero, blank and arbitrary string meanings without numeric coercion", () => {
    const element = statistic()
    for (const value of [0, -12.5, "0012", "N/A", "NaN", "12.345,67", "", " "]) {
      element.value = value
      expect(element.value).toBe(String(value))
      expect(text(element, "value").textContent).toBe(String(value))
      expect(region(element, "value").hidden).toBe(false)
    }
    element.value = undefined
    expect(region(element, "value").hidden).toBe(true)
    expect(element.value).toBeUndefined()
  })

  it("rejects nonfinite numeric assignments before changing the current value", () => {
    const element = statistic('<mui-statistic value="12"></mui-statistic>')
    for (const value of [NaN, Infinity, -Infinity]) {
      expect(() => { element.value = value }).toThrow(RangeError)
      expect(element.value).toBe("12")
    }
    element.value = "Infinity"
    expect(text(element, "value").textContent).toBe("Infinity")
    for (const value of [false, {}, [1, 2]]) {
      expect(() => { element.value = value as never }).toThrow(TypeError)
      expect(element.value).toBe("Infinity")
    }
  })

  it("renders attribute strings as text, never HTML", () => {
    const element = statistic()
    element.label = "<h2>Unsafe label</h2>"
    element.value = "<img src=x onerror=alert(1)>"
    element.valuePrefix = "<svg>"
    element.valueSuffix = "</svg>"
    expect(element.querySelector("h2,img,svg")).toBeNull()
    expect(text(element, "label").textContent).toBe("<h2>Unsafe label</h2>")
    expect(text(element, "value").textContent).toBe("<img src=x onerror=alert(1)>")
  })

  it("preserves authored headings/value nodes and listeners", () => {
    const element = document.createElement("mui-statistic") as MuiStatistic
    const heading = document.createElement("h3")
    heading.dataset.muiStatisticLabel = ""
    heading.id = "heading"
    heading.textContent = "Users"
    const value = document.createElement("strong")
    value.textContent = "128"
    const click = vi.fn()
    value.addEventListener("click", click)
    element.append(heading, value)
    document.body.append(element)
    expect(slot(element, "label").firstChild).toBe(heading)
    expect(slot(element, "value").firstChild).toBe(value)
    value.click()
    expect(click).toHaveBeenCalledOnce()
    expect(heading.localName).toBe("h3")
    expect(heading.hasAttribute("role")).toBe(false)
  })

  it("gives nonempty label props precedence and restores authored label nodes on removal or empty label", () => {
    const element = statistic('<mui-statistic label="Override"><h2 data-mui-statistic-label>Authored</h2></mui-statistic>')
    const heading = element.querySelector("h2")!
    expect(slot(element, "label").hidden).toBe(true)
    expect(heading.hidden).toBe(false)
    element.label = ""
    expect(slot(element, "label").hidden).toBe(false)
    expect(slot(element, "label").firstChild).toBe(heading)
    element.label = "New"
    element.label = null
    expect(slot(element, "label").firstChild).toBe(heading)
  })

  it("treats an explicit empty value as an override while missing value restores the authored default", () => {
    const element = statistic('<mui-statistic value=""><span data-mui-statistic-value>Authored</span></mui-statistic>')
    const authored = slot(element, "value").firstChild
    expect(slot(element, "value").hidden).toBe(true)
    expect(text(element, "value").textContent).toBe("")
    element.value = null
    expect(slot(element, "value").hidden).toBe(false)
    expect(slot(element, "value").firstChild).toBe(authored)
    expect(text(element, "value").hidden).toBe(true)
  })

  it("gives native prefix/suffix regions precedence over legacy text fallbacks", () => {
    const element = statistic('<mui-statistic prefix="$" suffix="USD" value="12"><svg data-mui-statistic-prefix aria-hidden="true" viewBox="0 0 20 20"><circle r="8" cx="10" cy="10"></circle></svg><a data-mui-statistic-suffix href="#details">details</a></mui-statistic>')
    const icon = element.querySelector("svg")!
    const link = element.querySelector("a")!
    element.valuePrefix = "Ignored"
    element.valueSuffix = "Also ignored"
    expect(slot(element, "prefix").firstChild).toBe(icon)
    expect(slot(element, "suffix").firstChild).toBe(link)
    expect(text(element, "prefix").hidden).toBe(true)
    expect(text(element, "suffix").hidden).toBe(true)
    expect(link.getAttribute("href")).toBe("#details")
    expect(icon.namespaceURI).toBe("http://www.w3.org/2000/svg")
  })

  it("supports native actions and form types in authored regions without interception", () => {
    const element = statistic('<form><mui-statistic value="12"><span data-mui-statistic-suffix><button type="submit">Submit</button><button type="button">Details</button></span></mui-statistic></form>')
    const submit = vi.fn((event: Event) => event.preventDefault())
    document.querySelector("form")!.addEventListener("submit", submit)
    const normal = element.querySelector<HTMLButtonElement>('[type="button"]')!
    normal.focus()
    element.value = 13
    expect(document.activeElement).toBe(normal)
    normal.click()
    expect(submit).not.toHaveBeenCalled()
    element.querySelector<HTMLButtonElement>('[type="submit"]')!.click()
    expect(submit).toHaveBeenCalledOnce()
  })

  it("preserves author ARIA and native hidden state rather than inferring group or output semantics", () => {
    const element = statistic('<mui-statistic role="group" aria-labelledby="metric-label" aria-live="off"><h3 data-mui-statistic-label id="metric-label">Users</h3><span data-mui-statistic-value hidden>Private display</span></mui-statistic>')
    const hidden = slot(element, "value").firstElementChild!
    element.tabularNums = true
    element.value = 0
    element.value = null
    expect(element.getAttribute("role")).toBe("group")
    expect(element.getAttribute("aria-labelledby")).toBe("metric-label")
    expect(element.getAttribute("aria-live")).toBe("off")
    expect(hidden.hasAttribute("hidden")).toBe(true)
    expect(element.querySelector("[role],[aria-live],output")).toBeNull()
  })

  it("preserves application-formatted Intl strings without adding formatter options", () => {
    const element = statistic()
    const formatted = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(12345.6)
    element.value = formatted
    expect(text(element, "value").textContent).toBe(formatted)
    expect(element.value).toBe(formatted)
  })

  it("adopts late native regions/default content and follows live region-marker changes", async () => {
    const element = statistic()
    const value = document.createElement("strong")
    value.textContent = "Original"
    element.append(value)
    await Promise.resolve()
    expect(slot(element, "value").firstChild).toBe(value)
    value.setAttribute("data-mui-statistic-prefix", "")
    await Promise.resolve()
    expect(slot(element, "prefix").firstChild).toBe(value)
    value.removeAttribute("data-mui-statistic-prefix")
    await Promise.resolve()
    expect(slot(element, "value").firstChild).toBe(value)
  })

  it("keeps original authored nodes through property overrides and reconnect", async () => {
    const element = statistic('<mui-statistic value="Override"><strong>Authored</strong><span data-mui-statistic-suffix><button type="button">Details</button></span></mui-statistic>')
    const value = element.querySelector("strong")!
    const button = element.querySelector("button")!
    const click = vi.fn()
    button.addEventListener("click", click)
    element.remove()
    element.value = "Changed while detached"
    await Promise.resolve()
    expect(text(element, "value").textContent).toBe("Override")
    document.body.append(element)
    expect(text(element, "value").textContent).toBe("Changed while detached")
    element.value = null
    expect(slot(element, "value").firstChild).toBe(value)
    button.click()
    expect(click).toHaveBeenCalledOnce()
  })

  it("does not rewrite unchanged visibility or ARIA during a value update", async () => {
    const element = statistic('<mui-statistic role="status" label="Users" value="12" prefix="~"></mui-statistic>')
    const records: MutationRecord[] = []
    const observer = new MutationObserver((items) => records.push(...items))
    observer.observe(element, { subtree: true, attributes: true, childList: true })
    element.value = 13
    await Promise.resolve()
    await Promise.resolve()
    observer.disconnect()
    expect(records.filter((record) => record.type === "attributes").every((record) => record.target === element && record.attributeName === "value")).toBe(true)
    expect(element.getAttribute("role")).toBe("status")
  })

  it("keeps templates inert and never treats marked templates as actual regions", () => {
    const element = statistic('<mui-statistic value="12"><template data-mui-statistic-label><h2>Inert</h2></template><template data-mui-statistic-value><button>Inert</button></template></mui-statistic>')
    expect(element.querySelectorAll(":scope > template")).toHaveLength(2)
    expect(element.querySelector("h2,button")).toBeNull()
    expect(text(element, "value").textContent).toBe("12")
    expect(region(element, "label").hidden).toBe(true)
  })

  it("does not resurrect discarded author nodes on whole-subtree replacement", async () => {
    const element = statistic("<mui-statistic><strong>Old</strong></mui-statistic>")
    const old = element.querySelector("strong")!
    element.innerHTML = "<em>New</em>"
    await Promise.resolve()
    expect(element.contains(old)).toBe(false)
    expect(slot(element, "value").textContent).toBe("New")
    expect(element.querySelectorAll(":scope > [data-mui-statistic-display]")).toHaveLength(1)
  })

  it("preserves surviving author content when a generated part needs rebuilding", async () => {
    const element = statistic('<mui-statistic value="12"><a data-mui-statistic-prefix href="#currency">$</a></mui-statistic>')
    const prefix = element.querySelector("a")!
    region(element, "value").remove()
    await Promise.resolve()
    expect(slot(element, "prefix").firstChild).toBe(prefix)
    expect(text(element, "value").textContent).toBe("12")
  })

  it("upgrades pre-definition props silently and writes no inline styles", () => {
    document.body.innerHTML = "<test-late-statistic><strong>Fallback</strong></test-late-statistic>"
    const element = document.querySelector("test-late-statistic") as MuiStatistic
    const fallback = element.querySelector("strong")
    const event = vi.fn()
    for (const name of ["change", "input", "mui:change"]) element.addEventListener(name, event)
    Object.assign(element, { label: "Users", value: 0, valuePrefix: "~", valueSuffix: "people", tabularNums: true })
    customElements.define("test-late-statistic", class extends MuiStatistic {})
    expect(text(element, "value").textContent).toBe("0")
    expect(element.tabularNums).toBe(true)
    expect(element.contains(fallback)).toBe(true)
    expect(element.prefix).toBeNull()
    expect(event).not.toHaveBeenCalled()
    expect(document.querySelector("style,[style]")).toBeNull()
    expect(element.shadowRoot).toBeNull()
  })

  it("reports collisions and keeps enhanced registration before the legacy aggregate", () => {
    expect(() => registerStatistic()).not.toThrow()
    const define = vi.fn()
    expect(() => registerStatistic({ get: () => class extends HTMLElement {}, define })).toThrow("before the legacy MarkupUI bundle")
    expect(define).not.toHaveBeenCalled()
    registerElements(customElements)
    expect(customElements.get("mui-statistic")).toBe(MuiStatistic)
    expect(text(statistic('<mui-statistic value="0"></mui-statistic>'), "value").textContent).toBe("0")
  })
})
