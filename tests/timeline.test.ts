import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  Timeline,
  MTimeline,
  TimelineItem,
  MTimelineItem,
  registerTimeline,
  timelineItemTypes,
} from "../src/components/timeline/index.js"
import * as timelineApi from "../src/components/timeline/index.js"
import "../src/components/timeline/global.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "timeline", "timeline.css"), "utf8")
let style: HTMLStyleElement | undefined

function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}

afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("canonical Timeline ViewElement", () => {
  it("exports canonical ViewElement classes and registration", () => {
    expect(timelineApi.Timeline).toBe(Timeline)
    expect(timelineApi.MTimeline).toBe(Timeline)
    expect(timelineApi.TimelineItem).toBe(TimelineItem)
    expect(timelineApi.MTimelineItem).toBe(TimelineItem)
    expect(Timeline.tag).toBe("m-timeline")
    expect(TimelineItem.tag).toBe("m-timeline-item")
    expect(ViewElement.prototype.isPrototypeOf(Timeline.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(TimelineItem.prototype)).toBe(true)
    expect(customElements.get("m-timeline")).toBe(Timeline)
    expect(customElements.get("m-timeline-item")).toBe(TimelineItem)
    expect(Timeline.observedAttributes).toEqual(["horizontal"])
    expect(TimelineItem.observedAttributes).toEqual(["title", "content", "time", "type"])
    expect(() => registerTimeline()).not.toThrow()

    const define = vi.fn()
    expect(() =>
      registerTimeline({ get: () => class extends HTMLElement {}, define }),
    ).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("exposes global MarkupUITimeline namespace", () => {
    const globalApi = (globalThis as unknown as { MarkupUITimeline?: typeof timelineApi }).MarkupUITimeline
    expect(globalApi).toBeDefined()
    expect(globalApi?.Timeline).toBe(Timeline)
    expect(globalApi?.MTimeline).toBe(MTimeline)
    expect(globalApi?.TimelineItem).toBe(TimelineItem)
    expect(globalApi?.MTimelineItem).toBe(MTimelineItem)
    expect(globalApi?.registerTimeline).toBe(registerTimeline)
  })

  it("handles Timeline horizontal property and attribute reflection", () => {
    const timeline = document.createElement("m-timeline") as Timeline
    expect(timeline.horizontal).toBe(false)
    expect(timeline.hasAttribute("horizontal")).toBe(false)

    timeline.horizontal = true
    expect(timeline.horizontal).toBe(true)
    expect(timeline.hasAttribute("horizontal")).toBe(true)

    timeline.horizontal = false
    expect(timeline.horizontal).toBe(false)
    expect(timeline.hasAttribute("horizontal")).toBe(false)

    timeline.setAttribute("horizontal", "")
    expect(timeline.horizontal).toBe(true)

    timeline.removeAttribute("horizontal")
    expect(timeline.horizontal).toBe(false)

    expect(() => Reflect.set(timeline, "horizontal", "not-a-bool")).toThrow(RangeError)
  })

  it("handles TimelineItem title, content, time, and type properties", () => {
    const item = document.createElement("m-timeline-item") as TimelineItem
    expect(item.title).toBe("")
    expect(item.content).toBe("")
    expect(item.time).toBe("")
    expect(item.type).toBe("default")

    // title
    item.title = "Release 1.0"
    expect(item.title).toBe("Release 1.0")
    expect(item.getAttribute("title")).toBe("Release 1.0")
    item.setAttribute("title", "Release 2.0")
    expect(item.title).toBe("Release 2.0")
    expect(() => Reflect.set(item, "title", 123)).toThrow(RangeError)

    // content
    item.content = "Initial stable version"
    expect(item.content).toBe("Initial stable version")
    expect(item.getAttribute("content")).toBe("Initial stable version")
    item.setAttribute("content", "Updated stable version")
    expect(item.content).toBe("Updated stable version")
    expect(() => Reflect.set(item, "content", 456)).toThrow(RangeError)

    // time
    item.time = "2026-09-01"
    expect(item.time).toBe("2026-09-01")
    expect(item.getAttribute("time")).toBe("2026-09-01")
    item.setAttribute("time", "2026-09-15")
    expect(item.time).toBe("2026-09-15")
    expect(() => Reflect.set(item, "time", 789)).toThrow(RangeError)

    // type
    for (const type of timelineItemTypes) {
      item.type = type
      expect(item.type).toBe(type)
      expect(item.getAttribute("type")).toBe(type)
    }
    expect(() => Reflect.set(item, "type", "invalid-type")).toThrow(RangeError)
    item.setAttribute("type", "invalid-type")
    expect(() => item.type).toThrow(RangeError)
    item.removeAttribute("type")
    expect(item.type).toBe("default")
  })

  it("renders accessible semantics on connected callback", () => {
    const timeline = document.createElement("m-timeline") as Timeline
    const item = document.createElement("m-timeline-item") as TimelineItem
    timeline.append(item)
    document.body.append(timeline)

    expect(timeline.getAttribute("role")).toBe("list")
    expect(item.getAttribute("role")).toBe("listitem")
  })

  it("preserves authored role attribute", () => {
    const timeline = document.createElement("m-timeline") as Timeline
    timeline.setAttribute("role", "region")
    const item = document.createElement("m-timeline-item") as TimelineItem
    item.setAttribute("role", "article")
    timeline.append(item)
    document.body.append(timeline)

    expect(timeline.getAttribute("role")).toBe("region")
    expect(item.getAttribute("role")).toBe("article")
  })

  it("synchronizes DOM regions for title, content, time, and marker", () => {
    const timeline = document.createElement("m-timeline") as Timeline
    const item = document.createElement("m-timeline-item") as TimelineItem
    item.title = "Release"
    item.content = "Deploy to production"
    item.time = "2026-09-13"
    item.type = "success"
    timeline.append(item)
    document.body.append(timeline)

    expect(item.querySelector(".m-timeline-marker")).not.toBeNull()
    expect(item.querySelector(".m-timeline-body")).not.toBeNull()
    expect(item.querySelector(".m-timeline-title")?.textContent).toBe("Release")
    expect(item.querySelector(".m-timeline-content")?.textContent).toBe("Deploy to production")
    expect(item.querySelector(".m-timeline-time")?.textContent).toBe("2026-09-13")
    expect(item.getAttribute("data-type")).toBe("success")

    // Dynamic update
    item.title = "Hotfix"
    expect(item.querySelector(".m-timeline-title")?.textContent).toBe("Hotfix")
    item.content = "Patch applied"
    expect(item.querySelector(".m-timeline-content")?.textContent).toBe("Patch applied")
    item.time = "2026-09-14"
    expect(item.querySelector(".m-timeline-time")?.textContent).toBe("2026-09-14")
    item.type = "warning"
    expect(item.getAttribute("data-type")).toBe("warning")

    // Clearing properties
    item.title = ""
    expect(item.querySelector(".m-timeline-title")).toBeNull()
    item.content = ""
    expect(item.querySelector(".m-timeline-content")).toBeNull()
    item.time = ""
    expect(item.querySelector(".m-timeline-footer")).toBeNull()
    item.type = "default"
    expect(item.hasAttribute("data-type")).toBe(false)
  })

  it("preserves authored marker, body, title, content, and footer regions", () => {
    document.body.innerHTML = `
      <m-timeline>
        <m-timeline-item id="authored-item" type="info">
          <span class="m-timeline-marker" data-icon id="my-marker"><svg viewBox="0 0 16 16"><path d="M0 0"></path></svg></span>
          <div class="m-timeline-body" id="my-body">
            <h3 class="m-timeline-title" id="my-title">Authored Heading</h3>
            <p id="my-para">Authored text</p>
            <div class="m-timeline-footer" id="my-footer"><time class="m-timeline-time">Custom date</time></div>
          </div>
        </m-timeline-item>
      </m-timeline>
    `
    const authoredItem = document.querySelector<TimelineItem>("#authored-item")!
    expect(authoredItem.querySelector("#my-marker")).not.toBeNull()
    expect(authoredItem.querySelectorAll(".m-timeline-marker")).toHaveLength(1)
    expect(authoredItem.querySelector("#my-body")).not.toBeNull()
    expect(authoredItem.querySelectorAll(".m-timeline-body")).toHaveLength(1)
    expect(authoredItem.querySelector("#my-title")?.textContent).toBe("Authored Heading")
    expect(authoredItem.querySelector("#my-para")?.textContent).toBe("Authored text")
    expect(authoredItem.querySelector("#my-footer time")?.textContent).toBe("Custom date")
  })

  it("relocates loose children into the generated body container", () => {
    document.body.innerHTML = `
      <m-timeline>
        <m-timeline-item id="loose-item" title="Title">
          <button type="button" id="loose-btn">Click me</button>
        </m-timeline-item>
      </m-timeline>
    `
    const looseItem = document.querySelector<TimelineItem>("#loose-item")!
    const btn = looseItem.querySelector("#loose-btn")!
    expect(looseItem.querySelector(".m-timeline-body")?.contains(btn)).toBe(true)
  })

  it("reflects horizontal layout attribute to data-horizontal", () => {
    const tl = document.createElement("m-timeline") as Timeline
    document.body.append(tl)
    expect(tl.hasAttribute("data-horizontal")).toBe(false)

    tl.horizontal = true
    expect(tl.hasAttribute("data-horizontal")).toBe(true)

    tl.horizontal = false
    expect(tl.hasAttribute("data-horizontal")).toBe(false)
  })

  it("handles pre-upgrade properties assigned before element is connected", () => {
    const elem = document.createElement("m-timeline-item") as TimelineItem
    elem.title = "Pre-upgrade title"
    elem.content = "Pre-upgrade content"
    elem.time = "Pre-upgrade time"
    elem.type = "error"
    document.body.append(elem)

    expect(elem.title).toBe("Pre-upgrade title")
    expect(elem.content).toBe("Pre-upgrade content")
    expect(elem.time).toBe("Pre-upgrade time")
    expect(elem.type).toBe("error")
    expect(elem.querySelector(".m-timeline-title")?.textContent).toBe("Pre-upgrade title")
    expect(elem.querySelector(".m-timeline-content")?.textContent).toBe("Pre-upgrade content")
    expect(elem.querySelector(".m-timeline-time")?.textContent).toBe("Pre-upgrade time")
    expect(elem.getAttribute("data-type")).toBe("error")
  })

  it("keeps compact authored CSS within its unchanged 1500 gzip-byte ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1500)
  })

  it("includes valid stylesheet targeting m-timeline and m-timeline-item", () => {
    install()
    expect(css).toContain("m-timeline")
    expect(css).toContain("m-timeline-item")
    expect(css).not.toContain("@import")
    expect(css).not.toContain("display: contents")
    expect(css).toContain("@supports selector(:has(*))")
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
  })

  it("uses private dark supplementary status colors and resets them at nested light boundaries", () => {
    install()
    const rules = Array.from(style!.sheet!.cssRules) as CSSStyleRule[]
    const light = rules.find(rule => rule.selectorText === ':where([data-m-theme="light"])')!
    const dark = rules.find(rule => rule.selectorText === ':where([data-m-theme="dark"])')!
    for (let i = 0; i < light.style.length; i++) {
      expect(light.style[i]).toMatch(/^--_m-timeline-/)
      expect(light.style.getPropertyValue(light.style[i])).toBe("initial")
    }
    for (const [role, value] of [
      ["info", "#3889c5"],
      ["success", "#2a947d"],
      ["warning", "#f08a00"],
      ["error", "#d03a52"],
    ]) {
      expect(dark.style.getPropertyValue(`--_m-timeline-${role}`)).toBe(value)
    }
    expect(css).toContain("--_m-timeline-rail: rgb(255 255 255 / .2)")
  })

  it("matches reference typography, marker alignment and intrinsic horizontal sizing", () => {
    expect(css).toContain("font-size: var(--m-font-size, 14px)")
    expect(css).toContain("line-height: 1.25")
    expect(css).toContain("font-weight: 500")
    expect(css).toContain("font-size: 12px")
    expect(css).toContain("--_m-timeline-title-top: -2px")
    expect(css).toContain("var(--m-timeline-title-size) * .625 - var(--m-timeline-icon-size) / 2")
    expect(css).toContain("--m-timeline-item-gap: 20px")
    expect(css).toContain("--m-timeline-item-gap: 40px")
    expect(css).toContain("flex: 0 0 var(--m-timeline-item-width, auto)")
    expect(css).not.toContain("16rem")
  })
})

