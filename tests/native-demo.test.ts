import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { JSDOM } from "jsdom"
import { afterEach, describe, expect, it } from "vitest"
import { Heading } from "../src/components/typography/index.js"
import { Box, Details, Summary } from "../src/components/box/index.js"

afterEach(() => { document.body.replaceChildren() })

function demo(name: string): Document {
  return new DOMParser().parseFromString(readFileSync(join("demo", "components", `${name}.html`), "utf8"), "text/html")
}

const nativeDemos = ["input-number", "select", "slider", "pagination", "float-button", "grid", "layout", "list", "table", "thing"]
const demoFiles = readdirSync(join("demo", "components")).filter(file => file.endsWith(".html"))

describe("catalog markup integrity", () => {
  it.each(demoFiles)("%s closes portable elements and uses canonical tags and action attributes", file => {
    const dom = new JSDOM(readFileSync(join("demo", "components", file), "utf8"), { includeNodeLocations: true })
    try {
      function elements(root: ParentNode): Element[] {
        return [...root.querySelectorAll("*")].flatMap(element => element.localName === "template"
          ? [element, ...elements((element as HTMLTemplateElement).content)] : [element])
      }
      for (const element of elements(dom.window.document)) {
        if (!element.localName.startsWith("m-")) continue
        const location = dom.nodeLocation(element)
        expect(location?.endTag, `${element.localName} at line ${location?.startLine}`).toBeDefined()
        expect(element.localName).not.toMatch(/^m-(h[1-6]|a|autocomplete)$/)
        if (element.localName === "m-heading") expect(element.querySelector("m-heading")).toBeNull()
        if (element.localName === "m-button") {
          expect(["button", "submit", "reset"]).not.toContain(element.getAttribute("type"))
        }
      }
      const scripts = [...dom.window.document.querySelectorAll<HTMLScriptElement>('script[src*="/dist/"]')]
      expect(new Set(scripts.map(script => script.type === "module")).size).toBeLessThanOrEqual(1)
    } finally { dom.window.close() }
  })
})

describe("native-control demo markup", () => {
  it.each(nativeDemos)("%s retains native label associations", name => {
    const document = demo(name)
    const labels = [...document.querySelectorAll<HTMLLabelElement>("main label")]
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) {
      const control = label.control
      expect(control, label.outerHTML).not.toBeNull()
      expect(control && "labels" in control ? control.labels : null).toContain(label)
    }
  })

  it.each(nativeDemos)("%s has unique IDs and no nested action controls", name => {
    const document = demo(name)
    const ids = [...document.querySelectorAll("[id]")].map(element => element.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const action of document.querySelectorAll("button, m-button, a[href], m-link")) {
      expect(action.querySelector("button, m-button, a[href], m-link, input, select, textarea"), action.outerHTML).toBeNull()
    }
  })

  it.each(["grid", "layout"])("%s uses portable headings and boxes with Web semantic owners", name => {
    const parsed = demo(name)
    document.body.append(document.importNode(parsed.querySelector("main")!, true))
    const sections = [...document.querySelectorAll("section[data-demo-example]")]
    expect(sections.length).toBeGreaterThan(0)
    for (const section of sections) {
      expect(section.parentElement!.localName).toBe("main")
      const heading = document.getElementById(section.getAttribute("aria-labelledby")!) as Heading
      expect(heading).toBeInstanceOf(Heading)
      expect(heading.native!.localName).toBe("h2")
      expect(heading.closest("section")).toBe(section)
      expect(section.querySelector(":scope > [data-demo-preview]")).toBeInstanceOf(Box)
    }
    const disclosure = document.getElementById(name === "grid" ? "more-results" : "sidebar") as Details
    expect(disclosure).toBeInstanceOf(Details)
    expect(disclosure.native.localName).toBe("details")
    expect(disclosure.native.firstElementChild!.localName).toBe("summary")
    expect(disclosure.native.firstElementChild!.firstElementChild).toBeInstanceOf(Summary)
  })

  it.each(["input-number", "select"])("%s loads selected runtimes consistently as ESM", name => {
    const scripts = [...demo(name).querySelectorAll<HTMLScriptElement>('script[src*="/dist/"]')]
    expect(scripts.length).toBeGreaterThan(0)
    for (const script of scripts) {
      expect(script.type).toBe("module")
      expect(script.getAttribute("src")).not.toContain(".global.js")
    }
  })

  it("Slider authors portable single and range configurations without requiring native controls", () => {
    const document = demo("slider")
    const sliders = [...document.querySelectorAll("m-slider")]
    expect(sliders.map(slider => slider.id)).toEqual(["demo-slider", "vert-s", "rev-s", "dis-s", "demo-range"])
    for (const slider of sliders) {
      expect(slider.querySelector("input")).toBeNull()
      expect(slider.getAttribute("aria-label")?.trim()).toBeTruthy()
      expect(slider.hasAttribute("role")).toBe(false)
      expect(slider.hasAttribute("tabindex")).toBe(false)
    }
    const range = document.getElementById("demo-range")!
    expect(range.hasAttribute("range")).toBe(true)
    expect(range.getAttribute("step")).toBe("any")
    expect(JSON.parse(range.getAttribute("value")!)).toEqual([20, 80])
  })

  it("Slider Web interoperability authors named native ranges and associated readouts", () => {
    const native = demo("slider").querySelector('[data-demo-example="native"]')!
    const inputs = [...native.querySelectorAll<HTMLInputElement>('input[type="range"]')]
    expect(inputs.map(input => input.id)).toEqual(["volume", "start", "end", "balance", "vertical", "external-range", "plain-range"])
    for (const input of inputs) {
      expect(input.name).not.toBe("")
      expect(input.labels).toHaveLength(1)
    }
    const outputs = [...native.querySelectorAll<HTMLOutputElement>("output[data-slider-output]")]
    const enhanced = [...native.querySelectorAll<HTMLInputElement>('[data-slider] input[type="range"], [data-slider-pair] input[type="range"]')]
    expect(outputs).toHaveLength(enhanced.length)
    for (const input of enhanced) expect(outputs.filter(output => output.htmlFor.contains(input.id))).toHaveLength(1)
    for (const output of outputs) {
      expect(output.htmlFor).toHaveLength(1)
      expect(inputs.some(input => output.htmlFor.contains(input.id))).toBe(true)
    }
  })
})
