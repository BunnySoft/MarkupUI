import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { Heading } from "../src/components/typography/index.js"
import { Box } from "../src/components/box/index.js"

afterEach(() => { document.body.replaceChildren() })

function demo(name: string): Document {
  return new DOMParser().parseFromString(readFileSync(join("demo", "components", `${name}.html`), "utf8"), "text/html")
}

const nativeDemos = ["input-number", "select", "slider", "pagination", "float-button", "grid", "layout", "list", "table", "thing"]

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
    expect(document.querySelector("m-details, m-summary")).toBeNull()
    const disclosure = document.getElementById(name === "grid" ? "more-results" : "sidebar")!
    expect(disclosure.localName).toBe("details")
    expect(disclosure.firstElementChild!.localName).toBe("summary")
  })

  it.each(["input-number", "select"])("%s loads selected runtimes consistently as ESM", name => {
    const scripts = [...demo(name).querySelectorAll<HTMLScriptElement>('script[src*="/dist/"]')]
    expect(scripts.length).toBeGreaterThan(0)
    for (const script of scripts) {
      expect(script.type).toBe("module")
      expect(script.getAttribute("src")).not.toContain(".global.js")
    }
  })

  it("Slider authors named native ranges and associates readouts with them", () => {
    const document = demo("slider")
    const sliders = [...document.querySelectorAll("m-slider")]
    expect(sliders).toHaveLength(4)
    for (const slider of sliders) {
      const input = slider.querySelector<HTMLInputElement>('input[type="range"]')!
      expect(input).not.toBeNull()
      expect(input.labels).toHaveLength(1)
      for (const output of slider.querySelectorAll("output")) expect(output.htmlFor.contains(input.id)).toBe(true)
    }
  })
})
