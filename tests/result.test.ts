import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "result", "result.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "result.html"), "utf8")
const app = readFileSync(resolve("demo", "components", "result.js"), "utf8")
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

describe("CSS-only native Result", () => {
  it("ships only CSS with no Empty/Button/Icon runtime or illustration dependency", () => {
    expect(pkg.exports["./result/style.css"]).toBe("./dist/markup-ui-result.css")
    expect(pkg.exports["./result"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "result"))).toEqual(["result.css"])
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("mui-result")).toBeUndefined()
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("markup-ui-empty")
    expect(demo).not.toContain("markup-ui-button")
    expect(demo).not.toContain("twemoji")
  })

  it("keeps author-selected headings, native regions and explicit status words", () => {
    fixture()
    install()
    expect(document.querySelector("#recovery-result")!.tagName).toBe("SECTION")
    expect(document.querySelector("#recovery-result")!.getAttribute("aria-labelledby")).toBe("retry-title")
    expect(document.querySelector("#retry-title")!.tagName).toBe("H2")
    expect(document.querySelector("#nested-result")!.tagName).toBe("DIV")
    for (const id of ["info-result", "success-result", "warning-result", "error-result", "not-found-result", "forbidden-result", "server-result", "teapot-result"]) {
      expect(document.querySelector(`#${id} .mui-result-title`)!.textContent).toMatch(/Information|Success|Warning|Error|404|403|500|418/)
    }
    expect(document.querySelectorAll("main")).toHaveLength(1)
    expect(document.querySelectorAll(".mui-result[role], .mui-result[aria-live], .mui-result[tabindex]")).toHaveLength(0)
  })

  it("retains original regions, nodes, listeners and order on live presentation changes", () => {
    fixture()
    const root = document.querySelector<HTMLElement>("#recovery-result")!
    const before = root.innerHTML
    const nodes = [...root.querySelectorAll("*")]
    const link = document.querySelector<HTMLElement>("#home-link")!
    let clicks = 0
    link.addEventListener("click", event => { event.preventDefault(); clicks++ })
    install()
    root.dataset.status = "success"
    root.dataset.size = "large"
    root.remove()
    document.body.append(root)
    expect(root.innerHTML).toBe(before)
    expect([...root.querySelectorAll("*")]).toEqual(nodes)
    link.click()
    expect(clicks).toBe(1)
    expect(document.querySelector("#retry-title")!.textContent).toBe("Error — request not saved")
  })

  it("supports all eight status palettes without inferring HTTP responses or changing text", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#recovery-result")!
    const cases = { info: "#0369a1", success: "#15803d", warning: "#a16207", error: "#b91c1c", "403": "#52525b", "404": "#52525b", "500": "#b91c1c", "418": "#7c3aed" }
    for (const [status, color] of Object.entries(cases)) {
      root.dataset.status = status
      expect(getComputedStyle(root).getPropertyValue("--_mui-result-accent")).toBe(color)
    }
    root.dataset.status = "unknown"
    expect(getComputedStyle(root).getPropertyValue("--_mui-result-accent")).toBe("#0369a1")
    expect(app).not.toContain("fetch(")
    expect(app).not.toContain("history.")
    expect(app).not.toContain("location.")
    expect(css).not.toContain("[data-align")
  })

  it("provides small/medium/large/huge dimensions and a medium unknown-size fallback", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#recovery-result")!
    for (const [size, icon, title] of [["small", "4rem", "1.625rem"], ["medium", "5rem", "2rem"], ["large", "6.25rem", "2.5rem"], ["huge", "7.8125rem", "3rem"]]) {
      root.dataset.size = size
      expect(getComputedStyle(root).getPropertyValue("--_mui-result-icon-size")).toBe(icon)
      expect(getComputedStyle(root).getPropertyValue("--_mui-result-title-size")).toBe(title)
    }
    root.dataset.size = "tiny"
    expect(getComputedStyle(root).getPropertyValue("--_mui-result-icon-size")).toBe("5rem")
  })

  it("keeps decorative SVGs hidden and preserves named custom SVG/image attributes", () => {
    fixture()
    const image = document.querySelector<HTMLImageElement>("#authored-image")!
    const before = image.outerHTML
    install()
    expect(document.querySelector("#recovery-icon")!.getAttribute("aria-hidden")).toBe("true")
    const svg = document.querySelector("#custom-icon svg")!
    expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(svg.getAttribute("role")).toBe("img")
    expect(svg.getAttribute("aria-labelledby")).toBe("emblem-title")
    expect(svg.querySelector("title")!.textContent).toBe("Project emblem")
    expect(image.outerHTML).toBe(before)
    expect(image.alt).toBe("Project archive symbol")
  })

  it("accepts author icon replacement without a render callback or observer", () => {
    fixture()
    install()
    const region = document.querySelector("#recovery-icon")!
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("viewBox", "0 0 10 10")
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    circle.setAttribute("r", "4")
    svg.append(circle)
    region.replaceChildren(svg)
    expect(region.firstElementChild).toBe(svg)
    expect(svg.firstElementChild).toBe(circle)
    expect(getComputedStyle(svg).display).toBe("block")
  })

  it("keeps retry/reset/home actions native with real form association and validity", () => {
    fixture()
    install()
    const form = document.querySelector<HTMLFormElement>("#retry-form")!
    const input = document.querySelector<HTMLInputElement>("#recovery-email")!
    const retry = document.querySelector<HTMLButtonElement>("#retry-action")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#disabled-action")!.addEventListener("click", () => disabledClicks++)
    expect(retry.form).toBe(form)
    expect(retry.closest("form")).toBeNull()
    input.value = "invalid"
    retry.click()
    expect(submits).toBe(0)
    input.value = "native@example.test"
    retry.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["email", "native@example.test"]])
    document.querySelector<HTMLButtonElement>("#reset-action")!.click()
    document.querySelector<HTMLButtonElement>("#disabled-action")!.click()
    expect(input.value).toBe("reader@example.test")
    expect(disabledClicks).toBe(0)
    expect(document.querySelector("#home-link")!.getAttribute("href")).toBe("#home")
  })

  it("does not generate missing icons/messages/actions and keeps empty roots empty", () => {
    fixture()
    install()
    expect(document.querySelector("#text-result .mui-result-icon")).toBeNull()
    expect(document.querySelector("#text-result .mui-result-footer")).toBeNull()
    const empty = document.querySelector<HTMLElement>("#empty-result")!
    empty.dataset.status = "404"
    expect(empty.childNodes).toHaveLength(0)
    expect(empty.textContent).toBe("")
  })

  it("keeps hidden regions/templates hidden and inert without removing their nodes", () => {
    fixture()
    install()
    for (const element of document.querySelectorAll("#hidden-result, #native-template, #hidden-regions [hidden]")) {
      expect(getComputedStyle(element).display).toBe("none")
    }
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert icon template")
    expect(css).toContain(':not([hidden="until-found"])')
  })

  it("resets nested presets and keeps authored string content safe", () => {
    fixture()
    install()
    const outer = document.querySelector<HTMLElement>("#custom-result")!
    outer.dataset.size = "huge"
    outer.style.setProperty("--mui-result-align", "end")
    const nested = document.querySelector("#nested-result")!
    expect(getComputedStyle(nested).getPropertyValue("--_mui-result-icon-size")).toBe("5rem")
    expect(getComputedStyle(nested).getPropertyValue("--_mui-result-accent")).toBe("#0369a1")
    expect(getComputedStyle(nested).getPropertyValue("--mui-result-align")).toBe("center")
    const description = document.querySelector("#retry-description")!
    description.textContent = "<img src=x> stays literal"
    expect(description.querySelector("img")).toBeNull()
  })

  it("wraps content/actions and provides print/forced-color rules without global resets", () => {
    fixture()
    const outside = document.querySelector("#outside-content")!
    const before = getComputedStyle(outside).display
    install()
    expect(getComputedStyle(outside).display).toBe(before)
    expect(getComputedStyle(document.querySelector("#recovery-actions")!).flexWrap).toBe("wrap")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).not.toContain("cursor: pointer")
    expect(css).not.toContain("animation:")
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("row-reverse")
  })
})
