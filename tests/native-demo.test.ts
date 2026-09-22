import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

function demo(name: string): Document {
  return new DOMParser().parseFromString(readFileSync(join("demo", "components", `${name}.html`), "utf8"), "text/html")
}

describe("native-control demo markup", () => {
  it.each(["input-number", "select", "slider", "pagination"])("%s retains native label associations", name => {
    const document = demo(name)
    const labels = [...document.querySelectorAll<HTMLLabelElement>("main label")]
    expect(labels.length).toBeGreaterThan(0)
    expect(document.querySelector("main m-label")).toBeNull()
    for (const label of labels) {
      expect(label.control, label.outerHTML).not.toBeNull()
      expect(label.control!.labels).toContain(label)
    }
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
