import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "timeline", "timeline.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "timeline.html"), "utf8")
const appCss = readFileSync(resolve("demo", "components", "timeline.css"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined

function fixture(): void {
  document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>"))
}
function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}
afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
})

describe("CSS-only Timeline and TimelineItem", () => {
  it("ships only an isolated stylesheet, without widgets, icons or a date runtime", () => {
    expect(pkg.exports["./timeline/style.css"]).toBe("./dist/markup-ui-timeline.css")
    expect(pkg.exports["./timeline"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "timeline"))).toEqual(["timeline.css"])
    expect(pkg.dependencies).toEqual({})
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("markup-ui-widgets")
    expect(demo).not.toContain("markup-ui-timeline.js")
    expect(customElements.get("mui-timeline")).toBeUndefined()
  })

  it("preserves real lists, listitems, headings and authored date semantics", () => {
    fixture()
    install()
    for (const list of document.querySelectorAll(".mui-timeline")) {
      expect(["OL", "UL"]).toContain(list.tagName)
      expect([...list.children].every(child => ["LI", "TEMPLATE"].includes(child.tagName))).toBe(true)
    }
    expect(getComputedStyle(document.querySelector("#created-event")!).display).toBe("list-item")
    expect(document.querySelector("#created-event h3")!.textContent).toContain("Recorded")
    expect(document.querySelector<HTMLTimeElement>("#created-time")!.dateTime).toBe("2026-09-01")
    const unknownTime = document.querySelector("#end-first .mui-timeline-time")!
    expect(unknownTime.tagName).toBe("SPAN")
    unknownTime.textContent = String(42)
    expect(unknownTime.textContent).toBe("42")
    expect(unknownTime.hasAttribute("datetime")).toBe(false)
    expect(document.querySelectorAll('.mui-timeline [role="timeline"], .mui-timeline [aria-live], .mui-timeline [aria-selected]')).toHaveLength(0)
    expect(css).not.toContain("display: contents")
  })

  it("preserves original content, listeners and identity through removal and late insertion", () => {
    fixture()
    const root = document.querySelector("#history")!
    const before = root.outerHTML
    const nodes = [...root.querySelectorAll("*")]
    const link = document.querySelector<HTMLElement>("#review-link")!
    let clicks = 0
    link.addEventListener("click", event => { event.preventDefault(); clicks++ })
    install()
    root.remove()
    document.body.append(root)
    expect(root.outerHTML).toBe(before)
    expect([...root.querySelectorAll("*")]).toEqual(nodes)
    link.click()
    expect(clicks).toBe(1)
    const late = document.createElement("li")
    late.className = "mui-timeline-item"
    late.textContent = "<b>Unparsed event content</b>"
    root.append(late)
    expect(root.lastElementChild).toBe(late)
    expect(late.querySelector("b")).toBeNull()
  })

  it("retains DOM chronology and numbering instead of visually reversing events", () => {
    fixture()
    install()
    expect([...document.querySelectorAll("#newest-first time")].map(time => time.getAttribute("datetime"))).toEqual(["2026-09-08", "2026-09-07"])
    expect(document.querySelector("#newest-first")!.hasAttribute("reversed")).toBe(false)
    expect(document.querySelector("#history")!.getAttribute("role")).toBe("list")
    expect(getComputedStyle(document.querySelector("#newest-first")!).listStyleType).toBe("decimal")
    expect(css).not.toContain("row-reverse")
    expect(css).not.toContain("column-reverse")
    expect(css).not.toMatch(/(?:^|[;{])\s*order\s*:/m)
  })

  it("covers all documented status types without using color as the only label", () => {
    fixture()
    install()
    const cases = [["created-event", "#767c82"], ["review-event", "#2080f0"], ["approved-event", "#18a058"], ["delayed-event", "#f0a020"], ["failed-event", "#d03050"]]
    for (const [id, color] of cases) {
      const item = document.getElementById(id)!
      expect(getComputedStyle(item).getPropertyValue("--_mui-timeline-accent")).toContain(color)
      expect(item.querySelector("h3")!.textContent).toMatch(/Recorded|Information|Success|Warning|Error/)
    }
    const item = document.querySelector<HTMLElement>("#created-event")!
    item.dataset.type = "unknown"
    expect(getComputedStyle(item).getPropertyValue("--_mui-timeline-accent")).toContain("#767c82")
    expect(appCss).toContain("--mui-timeline-item-color: #7c3aed")
  })

  it("keeps icon content decorative and uses explicit CSS lengths and supported sizes", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#history")!
    expect(getComputedStyle(root).getPropertyValue("--mui-timeline-icon-size")).toBe("14px")
    root.dataset.size = "large"
    expect(getComputedStyle(root).getPropertyValue("--mui-timeline-title-size")).toBe("16px")
    root.dataset.size = "small"
    expect(getComputedStyle(root).getPropertyValue("--mui-timeline-title-size")).toBe("14px")
    const icon = document.querySelector("#authored-icon")!
    expect(icon.getAttribute("aria-hidden")).toBe("true")
    expect(icon.querySelector("svg")!.getAttribute("focusable")).toBe("false")
    expect(icon.querySelector("path")!.getAttribute("stroke")).toBe("currentColor")
    expect(icon.querySelector("button, a")).toBeNull()
    expect(appCss).toContain("--mui-timeline-icon-size: 1.5rem")
  })

  it("connects only items with a later visible native item, ignoring hidden items and templates", () => {
    fixture()
    install()
    const selector = ".mui-timeline > li.mui-timeline-item:not([hidden]):has(~ li.mui-timeline-item:not([hidden]))"
    // Chromium covers :has() and pseudo-element output; jsdom mis-matches hidden siblings.
    const visible = [...document.querySelectorAll("#history > li.mui-timeline-item:not([hidden])")]
    expect(visible[0]?.id).toBe("created-event")
    expect(visible.at(-1)?.id).toBe("completed-event")
    expect(document.querySelector("#nested-last")!.nextElementSibling).toBeNull()
    expect(document.querySelector("#native-template")!.tagName).toBe("TEMPLATE")
    expect(css).toContain("@supports selector(:has(*))")
    expect(css).toContain(selector)
    expect(getComputedStyle(document.querySelector("#delayed-event")!).getPropertyValue("--_mui-timeline-line-style")).toBe("dashed")
    expect(getComputedStyle(document.querySelector("#created-event")!).getPropertyValue("--_mui-timeline-line-style")).toBe("solid")
  })

  it("keeps nested timelines independent from parent placement, orientation and size", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#history")!
    root.dataset.horizontal = ""
    root.dataset.itemPlacement = "right"
    root.dataset.size = "large"
    root.style.setProperty("--mui-timeline-icon-size", "30px")
    const nested = document.querySelector("#nested-timeline")!
    expect(getComputedStyle(nested).flexDirection).toBe("column")
    expect(getComputedStyle(nested).getPropertyValue("--mui-timeline-icon-size")).toBe("14px")
    expect(getComputedStyle(nested).getPropertyValue("--mui-timeline-title-size")).toBe("14px")
    expect(getComputedStyle(nested).textAlign).toBe("start")
    expect(nested.hasAttribute("data-item-placement")).toBe(false)
  })

  it("uses an explicit named native horizontal scroll region with discoverable controls", () => {
    fixture()
    install()
    const scroll = document.querySelector("#milestone-scroll")!
    expect(scroll.getAttribute("role")).toBe("region")
    expect(scroll.getAttribute("aria-label")).toBe("Scrollable release milestones")
    expect(scroll.getAttribute("tabindex")).toBe("0")
    expect(getComputedStyle(scroll).overflowX).toBe("auto")
    expect(getComputedStyle(document.querySelector("#milestones")!).display).toBe("flex")
    expect(document.querySelectorAll("#milestones button")).toHaveLength(3)
    expect(document.querySelector("#history")!.hasAttribute("tabindex")).toBe(false)
    expect(css).not.toContain("overflow: hidden")
  })

  it("preserves native keyboard targets, validation, submission, reset and disabled fieldsets", () => {
    fixture()
    install()
    const form = document.querySelector<HTMLFormElement>("#native-form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabledClicks++)
    input.value = ""
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(0)
    input.value = "Recovery"
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["note", "Recovery"]])
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(input.value).toBe("Original")
    expect(disabledClicks).toBe(0)
    expect(document.querySelector<HTMLElement>("#created-event")!.tabIndex).toBe(-1)
    expect(input.labels?.[0]?.textContent).toBe("Recovery note")
  })

  it("keeps native hidden roots/items/templates and presentation-class templates inert", () => {
    fixture()
    install()
    for (const id of ["hidden-timeline", "hidden-middle", "hidden-last", "native-template"]) {
      expect(getComputedStyle(document.getElementById(id)!).display).toBe("none")
    }
    const template = document.createElement("template")
    template.className = "mui-timeline-marker"
    document.body.append(template)
    expect(getComputedStyle(template).display).toBe("none")
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert event template")
    expect(css).toContain(':not([hidden="until-found"])')
  })

  it("provides logical, print and forced-color fallbacks without resetting other lists", () => {
    fixture()
    const outside = document.querySelector("#outside-list")!
    const before = getComputedStyle(outside).padding
    install()
    expect(getComputedStyle(outside).padding).toBe(before)
    expect(css).toContain("inset-inline-end")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).toContain("@media print")
    expect(css).toContain("break-inside: avoid")
    expect(css).toContain("content: none")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("border-color: CanvasText")
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("animation:")
  })

  it("keeps compact authored CSS within its unchanged 1500 gzip-byte ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1500)
  })

  it("uses private dark supplementary status colors and resets them at nested light boundaries", () => {
    install()
    const rules = [...style!.sheet!.cssRules] as CSSStyleRule[]
    const light = rules.find(rule => rule.selectorText === ':where([data-mui-theme="light"])')!
    const dark = rules.find(rule => rule.selectorText === ':where([data-mui-theme="dark"])')!
    for (let i = 0; i < light.style.length; i++) {
      expect(light.style[i]).toMatch(/^--_mui-timeline-/)
      expect(light.style.getPropertyValue(light.style[i])).toBe("initial")
    }
    for (const [role, value] of [["info", "#3889c5"], ["success", "#2a947d"], ["warning", "#f08a00"], ["error", "#d03a52"]]) {
      expect(dark.style.getPropertyValue(`--_mui-timeline-${role}`)).toBe(value)
    }
    expect(css).toContain("--_mui-timeline-rail: rgb(255 255 255 / .2)")
    expect(css).not.toContain("--mui-text-primary")
    expect(css).not.toContain("--mui-text-secondary")
    expect(css).not.toContain("--mui-border")
  })

  it("matches reference typography, marker alignment and intrinsic horizontal sizing", () => {
    expect(css).toContain("font-size: var(--mui-font-size, 14px)")
    expect(css).toContain("line-height: 1.25")
    expect(css).toContain("font-weight: 500")
    expect(css).toContain("font-size: 12px")
    expect(css).toContain("--_mui-timeline-title-top: -2px")
    expect(css).toContain("var(--mui-timeline-title-size) * .625 - var(--mui-timeline-icon-size) / 2")
    expect(css).toContain("--mui-timeline-item-gap: 20px")
    expect(css).toContain("--mui-timeline-item-gap: 40px")
    expect(css).toContain("flex: 0 0 var(--mui-timeline-item-width, auto)")
    expect(css).not.toContain("16rem")
  })

  it("keeps author gap, marker and body overrides without introducing generated metadata", () => {
    document.body.innerHTML = '<ol class="mui-timeline" style="--mui-timeline-icon-size:24px;--mui-timeline-item-gap:30px"><li class="mui-timeline-item" style="--mui-timeline-item-color:purple"><span class="mui-timeline-marker" aria-hidden="true"></span><div class="mui-timeline-body" style="color:teal"><h3 class="mui-timeline-title">Author</h3></div></li></ol>'
    const before = document.body.innerHTML
    install()
    expect(document.body.innerHTML).toBe(before)
    expect(document.querySelector(".mui-timeline-footer")).toBeNull()
    expect(getComputedStyle(document.querySelector("li")!).getPropertyValue("--mui-timeline-item-color")).toBe("purple")
    expect(getComputedStyle(document.querySelector("ol")!).getPropertyValue("--mui-timeline-icon-size")).toBe("24px")
    expect(getComputedStyle(document.querySelector(".mui-timeline-body")!).color).toBe("rgb(0, 128, 128)")
  })
})
