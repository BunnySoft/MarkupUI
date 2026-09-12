import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import "../src/components/space/index.js"
import "../src/components/flex/index.js"

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
  it("loads native Grid CSS and canonical Flex/Space without a legacy-grid runtime or export", () => {
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
    expect([...parsed.querySelectorAll("script")].map(node => node.getAttribute("src"))).toEqual([
      "../../dist/markup-ui-core.global.js", "../../dist/markup-ui-flex.global.js", "../../dist/markup-ui-space.global.js",
    ])
    expect(html).not.toMatch(/<style|\sstyle=|<m-(?!space|flex)|<n-row|<n-col/)
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
    expect(grid.getPropertyValue("--m-grid-cols").trim()).toBe("1")
    expect(first.getPropertyValue("--m-grid-span").trim()).toBe("1")
    expect(css).toContain("@media (min-width: 48rem)")
    expect(css).toContain(".migration-columns { --m-grid-cols: 24; }")
    expect(css).toContain(".first-column { --m-grid-span: 8; }")
    expect(css).toContain(".second-column { --m-grid-span: 16; }")
    expect(root.querySelector("[xs], [sm], [md], [lg], [xl], [xxl], [span], [offset], [push], [pull]")).toBeNull()
  })
  it("uses explicit native x/y gaps rather than negative row margins and half-gutter padding", () => {
    const root = fixture(), grid = getComputedStyle(root.querySelector("#span-grid")!)
    expect(grid.getPropertyValue("--m-grid-x-gap").trim()).toBe("12px")
    expect(grid.getPropertyValue("--m-grid-y-gap").trim()).toBe("8px")
    expect(css).not.toMatch(/margin-(?:left|right)\s*:|calc\(100%\s*\+/)
  })
  it("keeps inner defaults separate from outer item spans and gaps", () => {
    const root = fixture(), nested = root.querySelector("#nested-grid")!, child = nested.firstElementChild!
    expect(getComputedStyle(nested).getPropertyValue("--m-grid-cols").trim()).toBe("2")
    expect(getComputedStyle(nested).getPropertyValue("--m-grid-x-gap").trim()).toBe("4px")
    expect(getComputedStyle(child).getPropertyValue("--m-grid-span").trim()).toBe("1")
    expect(getComputedStyle(child).getPropertyValue("--m-grid-start").trim()).toBe("auto")
  })
  it("authors a noninteractive spacer and separately identifies absolute start line 3", () => {
    const root = fixture(), spacer = root.querySelector("#authored-spacer")!
    expect(spacer.getAttribute("aria-hidden")).toBe("true")
    expect(spacer.textContent).toBe("")
    expect(spacer.hasAttribute("tabindex")).toBe(false)
    expect(spacer.nextElementSibling?.id).toBe("after-spacer")
    expect(getComputedStyle(spacer).display).toBe("none")
    expect(css).toContain(".start-three { --m-grid-start: 3; }")
    expect(css).not.toContain("--m-grid-offset")
    expect(root.querySelector("#absolute-third")!.previousElementSibling!.id).toBe("start-first")
  })
  it("queries descendant grids through actual independent named container wrappers", () => {
    const root = fixture()
    for (const name of ["wide", "compact"]) {
      const wrapper = root.querySelector(`#${name}-container`)!, grid = root.querySelector(`#${name}-query`)!
      expect(grid.parentElement).toBe(wrapper)
      expect(wrapper.classList.contains("m-grid-container")).toBe(true)
      expect(wrapper.classList.contains("m-grid")).toBe(false)
      expect(getComputedStyle(grid).getPropertyValue("--m-grid-cols").trim()).toBe("1")
    }
    expect(css).toContain("@supports (container-type: inline-size)")
    expect(css).toContain("@container migration (min-width: 30rem)")
    expect(css).toContain(".query-feature { --m-grid-span: 2; }")
  })
  it("uses actual Flex/Space rules for native navigation and form actions", () => {
    const root = fixture()
    expect(getComputedStyle(root.querySelector("nav > m-flex")!).display).toBe("flex")
    expect(getComputedStyle(root.querySelector("#form-actions")!).display).toBe("flex")
    expect(root.querySelector("#reset-notes")!.parentElement!.children).toHaveLength(2)
    expect(getComputedStyle(root.querySelector("#form-actions")!).getPropertyValue("--_m-space-column-gap").trim()).toBe("8px")
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
    expect(getComputedStyle(first).getPropertyValue("--m-grid-span").trim()).toBe("1")
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
  it("retains pinned zero-gutter 24-way defaults and public author tokens", () => {
    document.body.innerHTML = '<div class="m-grid" id="default-row"><div class="m-grid-item" id="default-col">Original</div></div>'
    sheet = document.createElement("style")
    sheet.textContent = readFileSync(resolve("src", "components", "grid", "grid.css"), "utf8")
    document.head.append(sheet)
    const root = document.querySelector<HTMLElement>("#default-row")!
    const child = document.querySelector<HTMLElement>("#default-col")!
    expect(getComputedStyle(root).display).toBe("grid")
    expect(getComputedStyle(root).getPropertyValue("--m-grid-cols").trim()).toBe("24")
    expect(getComputedStyle(root).getPropertyValue("--m-grid-x-gap").trim()).toBe("0px")
    expect(getComputedStyle(root).getPropertyValue("--m-grid-y-gap").trim()).toBe("0px")
    expect(getComputedStyle(root).getPropertyValue("--m-grid-align").trim()).toBe("normal")
    expect(getComputedStyle(root).getPropertyValue("--m-grid-justify").trim()).toBe("normal")
    expect(getComputedStyle(child).getPropertyValue("--m-grid-span").trim()).toBe("1")
    expect(getComputedStyle(child).getPropertyValue("--m-grid-start").trim()).toBe("auto")
    root.style.cssText = "--m-grid-cols:3;--m-grid-tracks:80px minmax(0,1fr);--m-grid-x-gap:7px;--m-grid-y-gap:5px;--m-grid-align:center;--m-grid-justify:end"
    child.style.cssText = "--m-grid-span:2;--m-grid-start:2"
    expect(getComputedStyle(root).getPropertyValue("--m-grid-cols").trim()).toBe("3")
    expect(getComputedStyle(root).getPropertyValue("--m-grid-tracks").trim()).toBe("80px minmax(0,1fr)")
    expect(getComputedStyle(root).getPropertyValue("--m-grid-x-gap").trim()).toBe("7px")
    expect(getComputedStyle(root).getPropertyValue("--m-grid-y-gap").trim()).toBe("5px")
    expect(getComputedStyle(root).getPropertyValue("--m-grid-align").trim()).toBe("center")
    expect(getComputedStyle(root).getPropertyValue("--m-grid-justify").trim()).toBe("end")
    expect(getComputedStyle(child).getPropertyValue("--m-grid-span").trim()).toBe("2")
    expect(getComputedStyle(child).getPropertyValue("--m-grid-start").trim()).toBe("2")
  })
  it("keeps reused layout CSS within the existing build ceilings without a Legacy Grid asset", () => {
    const ceilings = { grid: 1500, flex: 1000, space: 1000 }
    const build = readFileSync(resolve("scripts", "build.mjs"), "utf8")
    for (const [name, ceiling] of Object.entries(ceilings)) {
      const source = readFileSync(resolve("src", "components", name, `${name}.css`))
      expect(gzipSync(source, { level: 9 }).length).toBeLessThanOrEqual(ceiling)
      expect(build).toContain(`"markup-ui-${name}.css": ${ceiling.toLocaleString("en-US").replace(",", "_")}`)
    }
    expect(build).not.toContain("markup-ui-legacy-grid")
  })
})
