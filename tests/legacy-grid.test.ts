import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"

const html = readFileSync(resolve("demo", "components", "legacy-grid.html"), "utf8")
const css = readFileSync(resolve("demo", "components", "legacy-grid.css"), "utf8")
const assets = ["grid", "flex", "space"]
let sheet: HTMLStyleElement | undefined
function fixture() {
  const parsed = new DOMParser().parseFromString(html, "text/html")
  document.body.append(document.importNode(parsed.querySelector("#legacy-grid-example")!, true))
  sheet = document.createElement("style")
  sheet.textContent = assets.map(name => readFileSync(resolve("src", "components", name, `${name}.css`), "utf8")).join("\n") + css.split("@media")[0]
  document.head.append(sheet)
  return document.querySelector<HTMLElement>("#legacy-grid-example")!
}
afterEach(() => { sheet?.remove(); sheet = undefined; document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Legacy Grid resolved through shipped native layout CSS", () => {
  it("loads the real modern assets without a legacy runtime, export, dependency or script", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    const manifest = JSON.parse(readFileSync(resolve("dist", "manifest.json"), "utf8"))
    const parsed = new DOMParser().parseFromString(html, "text/html")
    expect([...parsed.querySelectorAll("link[rel=stylesheet]")].map(node => node.getAttribute("href"))).toEqual([
      "../../dist/markup-ui-grid.css", "../../dist/markup-ui-flex.css", "../../dist/markup-ui-space.css", "legacy-grid.css",
    ])
    for (const asset of assets) {
      expect(pkg.exports[`./${asset}/style.css`]).toBe(`./dist/markup-ui-${asset}.css`)
      expect(existsSync(resolve("dist", `markup-ui-${asset}.css`))).toBe(true)
    }
    expect(pkg.dependencies).toEqual({})
    expect(pkg.exports["./legacy-grid"]).toBeUndefined()
    expect(pkg.exports["./legacy-grid/style.css"]).toBeUndefined()
    expect(existsSync(resolve("src", "components", "legacy-grid"))).toBe(false)
    expect(Object.keys(manifest.bundles).some(name => name.includes("legacy-grid"))).toBe(false)
    expect(html).not.toMatch(/<script|<style|\sstyle=|<mui-|<n-row|<n-col/)
  })
  it("uses original semantic native containers, direct items and real form labels", () => {
    const root = fixture()
    expect(root.querySelector("#span-grid")!.localName).toBe("div")
    expect(root.querySelector("#first-cell")!.localName).toBe("label")
    expect(root.querySelector("#second-cell")!.localName).toBe("fieldset")
    expect(root.querySelector<HTMLInputElement>("#reader")!.labels?.[0]?.id).toBe("first-cell")
    expect(root.querySelector('[role=grid], [role=row], [role=gridcell], [role=presentation]')).toBeNull()
  })
  it("keeps compact spans valid and declares actual viewport changes instead of legacy breakpoint props", () => {
    const root = fixture(), grid = getComputedStyle(root.querySelector("#span-grid")!), first = getComputedStyle(root.querySelector("#first-cell")!)
    expect(grid.display).toBe("grid")
    expect(grid.getPropertyValue("--mui-grid-cols").trim()).toBe("1")
    expect(first.getPropertyValue("--mui-grid-span").trim()).toBe("1")
    expect(css).toContain("@media (min-width: 48rem)")
    expect(css).toContain(".migration-columns { --mui-grid-cols: 24; }")
    expect(css).toContain(".first-column { --mui-grid-span: 8; }")
    expect(css).toContain(".second-column { --mui-grid-span: 16; }")
    expect(root.querySelector("[xs], [sm], [md], [lg], [xl], [xxl], [span], [offset], [push], [pull]")).toBeNull()
  })
  it("uses explicit native x/y gaps rather than negative row margins and half-gutter padding", () => {
    const root = fixture(), grid = getComputedStyle(root.querySelector("#span-grid")!)
    expect(grid.getPropertyValue("--mui-grid-x-gap").trim()).toBe("12px")
    expect(grid.getPropertyValue("--mui-grid-y-gap").trim()).toBe("8px")
    expect(css).not.toMatch(/margin-(?:left|right)\s*:|calc\(100%\s*\+/)
  })
  it("keeps inner defaults separate from outer item spans and gaps", () => {
    const root = fixture(), nested = root.querySelector("#nested-grid")!, child = nested.firstElementChild!
    expect(getComputedStyle(nested).getPropertyValue("--mui-grid-cols").trim()).toBe("2")
    expect(getComputedStyle(nested).getPropertyValue("--mui-grid-x-gap").trim()).toBe("4px")
    expect(getComputedStyle(child).getPropertyValue("--mui-grid-span").trim()).toBe("1")
    expect(getComputedStyle(child).getPropertyValue("--mui-grid-start").trim()).toBe("auto")
  })
  it("authors a noninteractive spacer and separately identifies absolute start line 3", () => {
    const root = fixture(), spacer = root.querySelector("#authored-spacer")!
    expect(spacer.getAttribute("aria-hidden")).toBe("true")
    expect(spacer.textContent).toBe("")
    expect(spacer.hasAttribute("tabindex")).toBe(false)
    expect(spacer.nextElementSibling?.id).toBe("after-spacer")
    expect(getComputedStyle(spacer).display).toBe("none")
    expect(css).toContain(".start-three { --mui-grid-start: 3; }")
    expect(css).not.toContain("--mui-grid-offset")
    expect(root.querySelector("#absolute-third")!.previousElementSibling!.id).toBe("start-first")
  })
  it("queries descendant grids through actual independent named container wrappers", () => {
    const root = fixture()
    for (const name of ["wide", "compact"]) {
      const wrapper = root.querySelector(`#${name}-container`)!, grid = root.querySelector(`#${name}-query`)!
      expect(grid.parentElement).toBe(wrapper)
      expect(wrapper.classList.contains("mui-grid-container")).toBe(true)
      expect(wrapper.classList.contains("mui-grid")).toBe(false)
      expect(getComputedStyle(grid).getPropertyValue("--mui-grid-cols").trim()).toBe("1")
    }
    expect(css).toContain("@supports (container-type: inline-size)")
    expect(css).toContain("@container migration (min-width: 30rem)")
    expect(css).toContain(".query-feature { --mui-grid-span: 2; }")
  })
  it("uses actual Flex/Space rules for native navigation and form actions", () => {
    const root = fixture()
    expect(getComputedStyle(root.querySelector("nav")!).display).toBe("flex")
    expect(getComputedStyle(root.querySelector("#form-actions")!).display).toBe("flex")
    expect(root.querySelector("#reset-notes")!.parentElement!.children).toHaveLength(2)
    expect(getComputedStyle(root.querySelector("#form-actions")!).getPropertyValue("--_mui-space-column-gap").trim()).toBe("8px")
  })
  it("keeps hidden items out of layout but not FormData, unlike native disabled fields", () => {
    const root = fixture(), hidden = root.querySelector("#hidden-cell")!
    expect(getComputedStyle(hidden).display).toBe("none")
    expect([...new FormData(root.querySelector("form")!)]).toEqual([
      ["reader", "Original reader"], ["notes", "Native notes"], ["project", "Local project"], ["hidden-note", "Still a named field"],
    ])
    expect(root.querySelector<HTMLInputElement>("#hidden-note")!.required).toBe(false)
  })
  it("preserves reset, field identity, focus, author attributes and listeners without an owner", () => {
    const root = fixture(), input = root.querySelector<HTMLInputElement>("#reader")!, listener = vi.fn()
    input.addEventListener("author-probe", listener); input.setAttribute("aria-label", "Author reader")
    input.value = "Edited reader"; input.focus(); root.dir = "rtl"
    input.dispatchEvent(new Event("author-probe"))
    expect(listener).toHaveBeenCalledOnce(); expect(document.activeElement).toBe(input)
    root.querySelector<HTMLButtonElement>("#reset-notes")!.click()
    expect(input.value).toBe("Original reader"); expect(root.querySelector("#reader")).toBe(input)
    expect(input.getAttribute("aria-label")).toBe("Author reader")
    expect(root.querySelector('button:not([type=reset]), input[type=submit]')).toBeNull()
  })
  it("keeps meaningful DOM order with no push/pull, dense placement or reverse styles", () => {
    const root = fixture(), rtl = root.querySelector("#rtl-grid")!
    expect([...rtl.children].map(node => node.id)).toEqual(["rtl-first", "rtl-second"])
    expect(rtl.closest("section")!.getAttribute("dir")).toBe("rtl")
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:order|left|right|transform|grid-row)\s*:|row-reverse|column-reverse|\bdense\b/)
    const first = root.querySelector("#first-cell")!
    first.setAttribute("span", "12"); first.setAttribute("push", "4")
    expect(getComputedStyle(first).getPropertyValue("--mui-grid-span").trim()).toBe("1")
  })
  it("keeps native disclosure content and local destinations valid without script", () => {
    const root = fixture(), details = root.querySelector("details")!, extra = details.querySelector("a")
    details.querySelector("summary")!.click()
    expect(details.open).toBe(true); expect(details.querySelector("a")).toBe(extra)
    for (const link of root.querySelectorAll<HTMLAnchorElement>("a")) {
      expect(root.querySelector(link.getAttribute("href")!)).not.toBeNull()
    }
    expect(css).not.toMatch(/@import|@font-face|url\(|@keyframes/)
  })
})
