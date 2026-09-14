import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  Thing,
  MThing,
  ThingAvatar,
  MThingAvatar,
  ThingHeader,
  MThingHeader,
  ThingContent,
  MThingContent,
  ThingFooter,
  MThingFooter,
  ThingAction,
  MThingAction,
  registerThing,
} from "../src/components/thing/index.js"
import * as thingApi from "../src/components/thing/index.js"
import { ViewElement } from "../src/core/index.js"
import { generateComponentApi } from "../scripts/component-api.mjs"

const css = readFileSync(resolve("src", "components", "thing", "thing.css"), "utf8")
const compactCss = css.replace(/\s+/g, "")
const demo = readFileSync(resolve("demo", "components", "thing.html"), "utf8")
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
  vi.restoreAllMocks()
})

describe("CSS-only native Thing", () => {
  it("ships isolated CSS without a Card/List/PageHeader runtime or artificial constructor", () => {
    expect(pkg.exports["./thing/style.css"]).toBe("./dist/markup-ui-thing.css")
    expect(pkg.exports["./thing"].import).toBe("./dist/markup-ui-thing.js")
    expect(readdirSync(resolve("src", "components", "thing")).sort()).toEqual([
      "global.ts",
      "index.ts",
      "regions.ts",
      "thing.css",
      "thing.ts",
    ])
    expect(pkg.dependencies).toEqual({})
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("markup-ui-card")
    expect(demo).not.toContain("markup-ui-list")
    expect(demo).not.toContain("markup-ui-page-header")
    expect(css).not.toContain("[data-size")
    expect(css).not.toContain("[data-align")
  })

  it("keeps author-selected articles, generic containers, headings and all seven regions", () => {
    fixture()
    install()
    expect(document.querySelector("#project-thing")!.tagName).toBe("ARTICLE")
    expect(document.querySelector("#project-thing")!.getAttribute("aria-labelledby")).toBe("project-title")
    expect(document.querySelector("#project-title")!.tagName).toBe("H3")
    expect(document.querySelector("#nested-thing")!.tagName).toBe("DIV")
    for (const region of ["avatar", "header", "header-extra", "description", "content", "footer", "action"]) {
      expect(document.querySelector(`#project-thing .m-thing-${region}`)).not.toBeNull()
    }
    expect(document.querySelectorAll("main")).toHaveLength(1)
    expect(document.querySelectorAll(".m-thing[role=button], .m-thing[tabindex]")).toHaveLength(0)
    expect(css).not.toContain("cursor: pointer")
  })

  it("preserves authored nodes, classes and listeners without moving the avatar on indentation", () => {
    fixture()
    const root = document.querySelector<HTMLElement>("#project-thing")!
    const nodes = [...root.querySelectorAll("*")]
    const before = root.innerHTML
    const follow = document.querySelector<HTMLButtonElement>("#follow-project")!
    let clicks = 0
    follow.addEventListener("click", () => clicks++)
    install()
    root.dataset.contentIndented = ""
    root.remove()
    document.body.append(root)
    expect(root.innerHTML).toBe(before)
    expect([...root.querySelectorAll("*")]).toEqual(nodes)
    follow.click()
    expect(clicks).toBe(1)
    expect(document.querySelector("#project-description")!.classList.contains("project-description")).toBe(true)
    expect(document.querySelector("#project-content")!.classList.contains("project-content")).toBe(true)
  })

  it("adapts content-indented through native grid columns while retaining full-width defaults", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#project-thing")!
    const content = document.querySelector("#project-content")!
    const indented = (region: string) => `.m-thing[data-content-indented] > .m-thing-avatar:not(template):not([hidden]) ~ .m-thing-${region}`
    expect(getComputedStyle(content).gridColumn).toBe("1 / -1")
    root.dataset.contentIndented = ""
    // Chromium covers the complex :where() cascade and actual column geometry.
    for (const region of ["content", "footer", "action"]) {
      expect(root.querySelector(`:scope > .m-thing-${region}`)!.matches(indented(region))).toBe(true)
      expect(compactCss).toContain(indented(region).replace(/\s+/g, ""))
    }
    root.dataset.contentIndented = "false"
    expect(content.matches(indented("content"))).toBe(true)
    root.removeAttribute("data-content-indented")
    expect(getComputedStyle(content).gridColumn).toBe("1 / -1")
    expect(css).not.toContain("display: contents")
  })

  it("does not let hidden or template avatars create a phantom indentation column", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#project-thing")!
    root.dataset.contentIndented = ""
    document.querySelector<HTMLElement>("#project-avatar")!.hidden = true
    expect(getComputedStyle(document.querySelector("#project-lead")!).gridColumn).toBe("1 / -1")
    expect(getComputedStyle(document.querySelector("#project-content")!).gridColumn).toBe("1 / -1")
    expect(document.querySelector("#native-template")!.classList.contains("m-thing-avatar")).toBe(true)
    expect(css).toContain(".m-thing-avatar:not(template):not([hidden])")
  })

  it("preserves image attributes and explicit SVG naming without an Avatar/Icon dependency", () => {
    fixture()
    const image = document.querySelector<HTMLImageElement>("#project-image")!
    const before = image.outerHTML
    install()
    expect(image.outerHTML).toBe(before)
    expect(image.alt).toBe("Blue project emblem")
    expect(image.width).toBe(48)
    expect(image.height).toBe(48)
    const svg = document.querySelector("#beta-avatar svg")!
    expect(svg.getAttribute("role")).toBe("img")
    expect(svg.getAttribute("aria-labelledby")).toBe("beta-symbol-title")
    expect(svg.querySelector("title")!.textContent).toBe("Beta project symbol")
  })

  it("keeps sparse descriptions/content/actions and empty roots without generated headings", () => {
    fixture()
    install()
    expect(document.querySelector("#description-only .m-thing-header")).toBeNull()
    expect(document.querySelector("#description-only .m-thing-description")!.textContent).toContain("not suppressed")
    expect(document.querySelector("#content-only")!.children).toHaveLength(1)
    expect(document.querySelector("#action-only")!.children).toHaveLength(1)
    expect(document.querySelector("#empty-thing")!.children).toHaveLength(0)
    expect(document.querySelector("#content-only h1, #content-only h2, #content-only h3")).toBeNull()
  })

  it("retains native form validation, external form-associated actions, disabling and reset", () => {
    fixture()
    install()
    const form = document.querySelector<HTMLFormElement>("#project-form")!
    const input = document.querySelector<HTMLInputElement>("#project-name")!
    const submit = document.querySelector<HTMLButtonElement>("#native-submit")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabledClicks++)
    expect(submit.form).toBe(form)
    expect(submit.closest("form")).toBeNull()
    input.value = ""
    submit.click()
    expect(submits).toBe(0)
    input.value = "Updated"
    submit.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["project", "Updated"]])
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(input.value).toBe("Original")
    expect(disabledClicks).toBe(0)
    expect(input.labels?.[0]?.textContent).toBe("Project name")
  })

  it("keeps hidden roots, regions and template content hidden/inert", () => {
    fixture()
    install()
    for (const element of document.querySelectorAll("#hidden-thing, #native-template, #hidden-regions [hidden]")) {
      expect(getComputedStyle(element).display).toBe("none")
    }
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert avatar template")
    const template = document.createElement("template")
    template.className = "m-thing"
    document.body.append(template)
    expect(getComputedStyle(template).display).toBe("none")
    expect(css).toContain(':not([hidden=until-found])')
  })

  it("keeps nested grid placement local without overwriting inherited author tokens", () => {
    fixture()
    install()
    const outer = document.querySelector<HTMLElement>("#indented-thing")!
    outer.style.setProperty("--m-thing-row-gap", "4rem")
    expect(outer.style.getPropertyValue("--m-thing-row-gap")).toBe("4rem")
    expect(css).not.toContain("--m-thing-row-gap:")
    expect(css).toContain("var(--m-thing-row-gap,12px)")
    expect(getComputedStyle(document.querySelector("#nested-content")!).gridColumn).toBe("1 / -1")
    expect(getComputedStyle(document.querySelector("#native-list-item")!).display).toBe("list-item")
    expect(getComputedStyle(document.querySelector("#native-list")!).listStyleType).toBe("disc")
  })

  it("allows late authored safe text/content updates without adding event or role contracts", () => {
    fixture()
    install()
    const content = document.querySelector("#project-content")!
    const late = document.createElement("p")
    late.textContent = "<script>Plain authored text</script>"
    content.append(late)
    expect(content.lastElementChild).toBe(late)
    expect(late.querySelector("script")).toBeNull()
    expect(document.querySelectorAll(".m-thing[aria-live], .m-thing[aria-selected]")).toHaveLength(0)
    expect(document.querySelector("#project-link button, #details-link button")).toBeNull()
  })

  it("uses scoped wrapping, logical positioning, print and forced colors without global resets", () => {
    fixture()
    const outside = document.querySelector("#outside-content")!
    const before = getComputedStyle(outside).display
    install()
    expect(getComputedStyle(outside).display).toBe(before)
    expect(getComputedStyle(document.querySelector("#project-header")!).flexWrap).toBe("wrap")
    expect(getComputedStyle(document.querySelector("#project-actions")!).flexWrap).toBe("wrap")
    expect(css).toContain("column-gap:var(--m-thing-column-gap,12px)")
    expect(compactCss).toContain("overflow-wrap:anywhere")
    expect(css).toContain("@media print")
    expect(compactCss).toContain("@media(forced-colors:active)")
    expect(css).not.toContain("row-reverse")
    expect(css).toContain("transition:color .3s cubic-bezier(.4,0,.2,1)")
    expect(css).not.toContain("animation:")
    expect(css).not.toMatch(/(?:^|[;{])\s*order\s*:/m)
  })

  it("keeps audited typography, theme roles, avatar spacing and motion within the CSS budget", () => {
    expect(css).toContain("var(--m-thing-font-size,var(--m-font-size,14px))")
    expect(css).toContain("var(--m-thing-font-family,var(--m-font-family,inherit))")
    expect(css).toContain("var(--m-thing-line-height,var(--m-line-height,1.6))")
    expect(css).toContain("var(--m-thing-title-size,16px)")
    expect(css).toContain("var(--m-thing-title-weight,var(--m-font-weight-strong,500))")
    expect(css).toContain("var(--m-thing-color,var(--_m-thing-color,#333639))")
    expect(css).toContain("var(--m-thing-title-color,var(--_m-thing-title,#1f2225))")
    expect(css).toContain("rgba(255,255,255,.82)")
    expect(css).toContain("rgba(255,255,255,.9)")
    expect(css).not.toContain("--m-text-primary")
    expect(css).toContain("margin-block-start:2px")
    expect(css).toContain("grid-row:1 / span 4")
    expect(css).toContain("grid-template:auto auto auto 1fr/auto minmax(0,1fr)")
    expect(css).toContain("var(--m-thing-avatar-width,none)")
    expect(css).toContain("max(0px,var(--m-thing-row-gap,12px) - var(--m-thing-lead-gap,4px))")
    expect(compactCss).toContain("@media(prefers-reduced-motion:reduce)")
    expect(css).toContain("transition:none")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
  })

  it("preserves authored shared and local typography and spacing without a controller", () => {
    document.body.innerHTML = '<div style="--m-font-size:18px;--m-line-height:2;--m-font-family:monospace;--m-thing-row-gap:16px"><article class="m-thing" style="--m-thing-font-size:20px;--m-thing-title-size:24px;--m-thing-title-weight:600;--m-thing-color:rgb(1,2,3)"><div class="m-thing-lead"><header class="m-thing-header"><h2 class="m-thing-title">Title</h2></header></div><div class="m-thing-content">Content</div></article></div>'
    const root = document.querySelector<HTMLElement>(".m-thing")!
    const parent = root.parentElement!
    const shared = parent.getAttribute("style"), local = root.getAttribute("style")
    const heading = root.querySelector("h2")
    install()
    root.dataset.contentIndented = ""
    root.remove()
    parent.append(root)
    expect(parent.getAttribute("style")).toBe(shared)
    expect(root.getAttribute("style")).toBe(local)
    expect(root.querySelector("h2")).toBe(heading)
    expect(root.querySelector("[role],[aria-live],script")).toBeNull()
  })
})

describe("canonical Thing ViewElement", () => {
  it("exports canonical ViewElement classes and registers m-thing and companion elements", () => {
    expect(thingApi.Thing).toBe(Thing)
    expect(thingApi.MThing).toBe(Thing)
    expect(thingApi.ThingHeader).toBe(ThingHeader)
    expect(thingApi.MThingHeader).toBe(ThingHeader)
    expect(thingApi.ThingAvatar).toBe(ThingAvatar)
    expect(thingApi.MThingAvatar).toBe(ThingAvatar)
    expect(thingApi.ThingContent).toBe(ThingContent)
    expect(thingApi.MThingContent).toBe(ThingContent)
    expect(thingApi.ThingFooter).toBe(ThingFooter)
    expect(thingApi.MThingFooter).toBe(ThingFooter)
    expect(thingApi.ThingAction).toBe(ThingAction)
    expect(thingApi.MThingAction).toBe(ThingAction)

    expect(Thing.tag).toBe("m-thing")
    expect(ThingHeader.tag).toBe("m-thing-header")
    expect(ThingAvatar.tag).toBe("m-thing-avatar")
    expect(ThingContent.tag).toBe("m-thing-content")
    expect(ThingFooter.tag).toBe("m-thing-footer")
    expect(ThingAction.tag).toBe("m-thing-action")

    expect(ViewElement.prototype.isPrototypeOf(Thing.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(ThingHeader.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(ThingAvatar.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(ThingContent.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(ThingFooter.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(ThingAction.prototype)).toBe(true)

    expect(customElements.get("m-thing")).toBe(Thing)
    expect(customElements.get("m-thing-header")).toBe(ThingHeader)
    expect(customElements.get("m-thing-avatar")).toBe(ThingAvatar)
    expect(customElements.get("m-thing-content")).toBe(ThingContent)
    expect(customElements.get("m-thing-footer")).toBe(ThingFooter)
    expect(customElements.get("m-thing-action")).toBe(ThingAction)

    expect(Thing.observedAttributes).toEqual(["title", "description"])
    expect(typeof registerThing).toBe("function")
    expect(() => registerThing()).not.toThrow()

    const define = vi.fn()
    expect(() =>
      registerThing({ get: () => class extends HTMLElement {}, define }),
    ).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("handles title and description property defaults, reflections, and validation", () => {
    const element = document.createElement("m-thing") as Thing
    expect(element.title).toBe("")
    expect(element.description).toBe("")

    element.title = "Project Alpha"
    expect(element.title).toBe("Project Alpha")
    expect(element.getAttribute("title")).toBe("Project Alpha")

    element.description = "A sophisticated web application."
    expect(element.description).toBe("A sophisticated web application.")
    expect(element.getAttribute("description")).toBe("A sophisticated web application.")

    element.setAttribute("title", "Project Beta")
    expect(element.title).toBe("Project Beta")

    element.setAttribute("description", "An updated description.")
    expect(element.description).toBe("An updated description.")

    element.removeAttribute("title")
    expect(element.title).toBe("")

    element.removeAttribute("description")
    expect(element.description).toBe("")

    expect(() => Reflect.set(element, "title", 123)).toThrow(RangeError)
    expect(() => Reflect.set(element, "description", 456)).toThrow(RangeError)
  })

  it("synchronizes generated title and description nodes when properties are set", () => {
    const element = document.createElement("m-thing") as Thing
    document.body.append(element)
    expect(element.children).toHaveLength(0)

    element.title = "Generated Title"
    const header = element.querySelector("m-thing-header")
    expect(header).not.toBeNull()
    const titleSpan = header?.querySelector(".m-thing-title")
    expect(titleSpan?.textContent).toBe("Generated Title")

    element.description = "Generated Description"
    const desc = element.querySelector(".m-thing-description")
    expect(desc).not.toBeNull()
    expect(desc?.textContent).toBe("Generated Description")

    element.title = "Updated Title"
    expect(titleSpan?.textContent).toBe("Updated Title")

    element.description = "Updated Description"
    expect(desc?.textContent).toBe("Updated Description")

    element.title = ""
    expect(element.querySelector(".m-thing-title")).toBeNull()

    element.description = ""
    expect(element.querySelector(".m-thing-description")).toBeNull()
  })

  it("replays pre-upgrade properties upon connection", () => {
    const element = document.createElement("m-thing") as Thing
    Object.defineProperty(element, "title", { configurable: true, value: "Pre Title" })
    Object.defineProperty(element, "description", { configurable: true, value: "Pre Description" })
    document.body.append(element)

    expect(element.title).toBe("Pre Title")
    expect(element.description).toBe("Pre Description")
    expect(element.getAttribute("title")).toBe("Pre Title")
    expect(element.getAttribute("description")).toBe("Pre Description")
  })

  it("exposes MarkupUIThing on globalThis", async () => {
    await import("../src/components/thing/global.js")
    const target = globalThis as typeof globalThis & { MarkupUIThing?: typeof thingApi }
    expect(target.MarkupUIThing).toBeDefined()
    expect(target.MarkupUIThing?.Thing).toBe(Thing)
    expect(target.MarkupUIThing?.registerThing).toBe(registerThing)
  })

  it("extracts Thing properties and regions via generateComponentApi", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["thing"])
    expect(docs).toBeDefined()
    const thingElement = docs.elements.find(e => e.type === "Thing")
    expect(thingElement).toBeDefined()
    expect(thingElement?.web.primary).toBe("m-thing")
    expect(thingElement?.properties.title).toBeDefined()
    expect(thingElement?.properties.title.type).toBe("string")
    expect(thingElement?.properties.title.default).toBe("")
    expect(thingElement?.properties.description).toBeDefined()
    expect(thingElement?.properties.description.type).toBe("string")
    expect(thingElement?.properties.description.default).toBe("")
    expect(thingElement?.regions).toHaveLength(5)
    for (const regionName of ["avatar", "header", "content", "footer", "action"]) {
      expect(thingElement?.regions.some(r => r.name === regionName)).toBe(true)
    }
  })
})
