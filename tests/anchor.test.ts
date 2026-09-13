import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createAnchor, Anchor, AnchorLink, registerAnchor } from "../src/components/anchor/index.js"
import * as anchorApi from "../src/components/anchor/index.js"
import { ViewElement } from "../src/core/index.js"
import { generateComponentApi } from "../scripts/component-api.mjs"
import { createScrollContext, fragmentId } from "../src/components/anchor/scroll.js"
import type { AnchorController, AnchorOptions } from "../src/components/anchor/index.js"

const controllers: AnchorController[] = []
let sequence = 0
const rect = (top: number, height: number, left = 0, width = 300) =>
  ({ x: left, y: top, top, left, bottom: top + height, right: left + width, width, height, toJSON() {} }) as DOMRect
function geometry(element: HTMLElement, get: () => DOMRect) {
  element.getBoundingClientRect = get
  element.getClientRects = () => [get()] as unknown as DOMRectList
}
function nodes() {
  const suffix = sequence++
  const nav = document.createElement("nav")
  nav.className = "m-anchor"
  nav.setAttribute("data-anchor", "")
  nav.setAttribute("aria-label", "Contents")
  const root = document.createElement("div")
  root.style.overflowY = "auto"
  Object.defineProperties(root, {
    clientTop: { configurable: true, value: 1 },
    clientHeight: { configurable: true, value: 200 },
    offsetHeight: { configurable: true, value: 202 },
    scrollHeight: { configurable: true, value: 500 },
  })
  geometry(nav, () => rect(0, 100))
  geometry(root, () => rect(100, 202))
  const points = new Map<HTMLElement, { top: number; height: number }>()
  const targets: HTMLElement[] = []
  const links: HTMLAnchorElement[] = []
  for (const [index, [top, height]] of [[0, 100], [150, 100], [400, 40]].entries()) {
    const section = document.createElement("section")
    section.id = `section-${suffix}-${index}`
    section.textContent = `Section ${index}`
    points.set(section, { top: top!, height: height! })
    geometry(section, () => {
      const point = points.get(section)!
      return rect(101 + point.top - root.scrollTop, point.height)
    })
    root.append(section)
    const link = document.createElement("a")
    link.href = `#${section.id}`
    link.textContent = section.textContent
    geometry(link, () => rect(0, 20))
    nav.append(link)
    targets.push(section)
    links.push(link)
  }
  root.scrollTo = vi.fn(options => {
    root.scrollTop = (options as ScrollToOptions).top ?? 0
    root.dispatchEvent(new Event("scroll"))
  })
  document.body.append(nav, root)
  return { nav, root, targets, links, points }
}
function bind(options: AnchorOptions = {}) {
  const pair = nodes()
  const controller = createAnchor(pair.nav, { root: pair.root, ...options })
  controllers.push(controller)
  return { ...pair, controller }
}
async function flush() {
  await new Promise(resolve => setTimeout(resolve, 30))
}
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("deterministic native Anchor location", () => {
  it("selects by ordered geometry, not link order or callback arrival", () => {
    const { nav, root, links, controller } = bind()
    expect(controller.activeHref).toBe(links[0]!.getAttribute("href"))
    nav.prepend(links[2]!)
    controller.refresh()
    root.scrollTop = 200
    controller.update()
    expect(controller.activeHref).toBe(links[1]!.getAttribute("href"))
    expect(nav.querySelectorAll('[aria-current="location"]')).toHaveLength(1)
  })
  it("clears in gaps by default and retains the latest start with ignoreGap", () => {
    const plain = bind()
    plain.root.scrollTop = 125
    plain.controller.update()
    expect(plain.controller.activeHref).toBeNull()
    const continuous = bind({ ignoreGap: true })
    continuous.root.scrollTop = 125
    continuous.controller.update()
    expect(continuous.controller.activeHref).toBe(continuous.links[0]!.getAttribute("href"))
  })
  it("makes a visible short last target current at actual scroll bottom", () => {
    const { root, controller, links } = bind()
    root.scrollTop = 300
    controller.update()
    expect(controller.activeHref).toBe(links[2]!.getAttribute("href"))
  })
  it("does not force a last target before the first or in a long trailing gap", () => {
    const { root, controller, points, targets } = bind()
    points.set(targets[0]!, { top: 80, height: 20 })
    controller.update()
    expect(controller.activeHref).toBeNull()
    points.set(targets[2]!, { top: 250, height: 10 })
    root.scrollTop = 300
    controller.update()
    expect(controller.activeHref).toBeNull()
  })
  it("uses explicit offset/bound and clamps the reference line to a narrow viewport", () => {
    const { controller, links, root } = bind({ offset: 40, bound: 12 })
    root.scrollTop = 100
    controller.update()
    expect(controller.activeHref).toBe(links[1]!.getAttribute("href"))
    const narrow = bind({ offset: 500, bound: 1000 })
    narrow.controller.update()
    expect(narrow.controller.activeHref).toBe(narrow.links[1]!.getAttribute("href"))
  })
  it("breaks equal-top ties by specificity then document order, without multiple current links", () => {
    const { points, targets, controller, links, nav } = bind()
    points.set(targets[1]!, { top: 0, height: 50 })
    controller.update()
    expect(controller.activeHref).toBe(links[1]!.getAttribute("href"))
    points.set(targets[2]!, { top: 0, height: 50 })
    controller.update()
    expect(controller.activeHref).toBe(links[2]!.getAttribute("href"))
    const duplicate = links[2]!.cloneNode(true) as HTMLAnchorElement
    geometry(duplicate, () => rect(0, 20))
    nav.append(duplicate)
    controller.refresh()
    expect(nav.querySelectorAll("[data-anchor-active]")).toHaveLength(1)
    expect(duplicate.hasAttribute("aria-current")).toBe(false)
  })
  it("ignores hidden targets/links and chooses a visible duplicate deterministically", () => {
    const { nav, links, targets, controller } = bind()
    const duplicate = links[0]!.cloneNode(true) as HTMLAnchorElement
    geometry(duplicate, () => rect(0, 20))
    nav.append(duplicate)
    links[0]!.hidden = true
    controller.refresh()
    expect(duplicate.getAttribute("aria-current")).toBe("location")
    targets[0]!.hidden = true
    controller.update()
    expect(controller.activeHref).toBeNull()
  })
  it("handles empty or entirely unresolved contents without inventing a current item", () => {
    const { nav, controller } = bind()
    nav.replaceChildren()
    controller.refresh()
    expect(controller.activeHref).toBeNull()
    expect(controller.issues).toEqual([])
  })
})

describe("native href and safe target resolution", () => {
  it.each(["雪 /#[]%", "a:b.c[d]", "100%", "literal%20id", "#fragment", "a b"])("resolves encoded ID %s without selector interpolation", id => {
    const { targets, links, controller } = bind()
    targets[0]!.id = id
    links[0]!.setAttribute("href", `#${encodeURIComponent(id)}`)
    controller.refresh()
    expect(controller.activeTarget).toBe(targets[0])
  })
  it("uses URL-style decoding for literal malformed percent signs and UTF-8 replacement", () => {
    expect(fragmentId("#100%")).toBe("100%")
    expect(fragmentId("#%E9")).toBe("\ufffd")
    expect(fragmentId("#a%2Fb%23c")).toBe("a/b#c")
    const { targets, links, controller } = bind()
    targets[0]!.id = "100%"
    links[0]!.setAttribute("href", "#100%")
    controller.refresh()
    expect(controller.activeTarget).toBe(targets[0])
  })
  it("reports missing and duplicate IDs while retaining native hrefs", () => {
    const { links, targets, controller } = bind()
    links[1]!.setAttribute("href", "#missing")
    const duplicate = document.createElement("section")
    duplicate.id = targets[0]!.id
    document.body.append(duplicate)
    controller.refresh()
    expect(controller.issues.map(issue => issue.reason)).toEqual(["duplicate-id", "missing-target"])
    expect(links[1]!.getAttribute("href")).toBe("#missing")
    expect(controller.scrollTo("#missing")).toBe(false)
  })
  it("does not hijack external/non-self/download/modifier/defaultPrevented navigation", () => {
    const { links, nav, controller } = bind()
    links[1]!.target = "_blank"
    links[2]!.setAttribute("download", "")
    const external = document.createElement("a")
    external.href = "https://example.test/other#section"
    external.textContent = "External"
    nav.append(external)
    controller.refresh()
    expect(controller.issues).toEqual([])
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true })
    links[0]!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    const prevented = new MouseEvent("click", { bubbles: true, cancelable: true })
    prevented.preventDefault()
    links[0]!.dispatchEvent(prevented)
    expect(prevented.defaultPrevented).toBe(true)
    expect(links[1]!.target).toBe("_blank")
  })
  it("reports targets outside an explicit root and in a different nested scroll plane", () => {
    const { root, targets, controller } = bind()
    document.body.append(targets[1]!)
    const inner = document.createElement("div")
    inner.style.overflowY = "auto"
    Object.defineProperties(inner, { clientHeight: { value: 50 }, scrollHeight: { value: 100 } })
    root.append(inner)
    inner.append(targets[2]!)
    controller.refresh()
    expect(controller.issues.map(issue => issue.reason)).toEqual(["outside-root", "nested-scroll-root"])
  })
})

describe("explicit native scrolling and root geometry", () => {
  it("scrolls only the explicit element, preserving horizontal position, URL and focus", () => {
    const { root, links, controller } = bind({ offset: 20 })
    root.scrollLeft = -15
    links[0]!.focus()
    const href = location.href
    expect(controller.scrollTo(links[1]!.getAttribute("href")!)).toBe(true)
    expect(root.scrollTo).toHaveBeenCalledWith({ top: 130, left: -15, behavior: "auto" })
    expect(location.href).toBe(href)
    expect(document.activeElement).toBe(links[0])
  })
  it("forces instant scrolling for reduced motion, even if smooth was requested", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }))
    const { root, links, controller } = bind()
    controller.scrollTo(links[1]!.getAttribute("href")!, { behavior: "smooth" })
    expect(root.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: "instant" }))
  })
  it("accounts for nested root borders and axis-aligned scale without geometry writes", () => {
    const pair = nodes()
    geometry(pair.root, () => rect(100, 404))
    for (const target of pair.targets) geometry(target, () => {
      const point = pair.points.get(target)!
      return rect(102 + (point.top - pair.root.scrollTop) * 2, point.height * 2)
    })
    const controller = createAnchor(pair.nav, { root: pair.root, offset: 10 })
    controllers.push(controller)
    controller.scrollTo(pair.links[1]!.getAttribute("href")!)
    expect(pair.root.scrollTop).toBe(140)
    expect(pair.targets[1]!.hasAttribute("style")).toBe(false)
  })
  it("uses the document visual viewport and preserves page horizontal scroll", () => {
    const pair = nodes()
    document.body.append(...pair.targets)
    vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(600)
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2000)
    vi.stubGlobal("visualViewport", Object.assign(new EventTarget(), { offsetTop: 80, height: 300 }))
    vi.stubGlobal("scrollY", 200)
    vi.stubGlobal("scrollX", 13)
    const scroll = vi.fn()
    vi.stubGlobal("scrollTo", scroll)
    geometry(pair.targets[0]!, () => rect(80, 200))
    geometry(pair.targets[1]!, () => rect(300, 100))
    geometry(pair.targets[2]!, () => rect(700, 20))
    const controller = createAnchor(pair.nav, { root: document, offset: 20 })
    controllers.push(controller)
    expect(controller.activeTarget).toBe(pair.targets[0])
    controller.scrollTo(pair.links[1]!.getAttribute("href")!)
    expect(scroll).toHaveBeenCalledWith({ top: 400, left: 13, behavior: "auto" })
  })
  it("validates root/type/bounds and explicit scroll inputs", () => {
    const { nav, root } = nodes()
    expect(() => createAnchor(nav, { root: "#root" } as unknown as AnchorOptions)).toThrow("Scroll root")
    expect(() => createAnchor(nav, { bound: NaN })).toThrow("finite")
    expect(() => createAnchor(nav, { offset: -1 })).toThrow("finite")
    expect(() => createAnchor(nav, { affix: true } as AnchorOptions)).toThrow("Unsupported")
    root.style.overflowY = "visible"
    expect(() => createAnchor(nav, { root })).toThrow("vertical overflow")
    root.style.overflowY = "auto"
    const controller = createAnchor(nav, { root })
    controllers.push(controller)
    expect(() => controller.scrollTo("https://example.test/#one")).toThrow("same-document")
    expect(() => controller.scrollTo("#missing", { behavior: "fly" } as never)).toThrow("behavior")
    expect(() => controller.scrollTo(1 as unknown as string)).toThrow("string")
  })
  it("provides a concrete native scroll primitive suitable for Back Top, with clamping/fallback", () => {
    const { root } = nodes()
    const context = createScrollContext(document, root)
    context.scrollTo(500)
    expect(root.scrollTop).toBe(300)
    context.scrollTo(-50)
    expect(root.scrollTop).toBe(0)
    Object.defineProperty(root, "scrollTo", { value: undefined, configurable: true })
    expect(context.scrollTo(100)).toBe(true)
    expect(root.scrollTop).toBe(100)
  })
})

describe("location ownership, observers and cleanup", () => {
  it("notifies actual location changes, never user click or focus events", () => {
    const { nav, root, links, controller } = bind()
    const change = vi.fn(), click = vi.fn()
    nav.addEventListener("m:anchor-change", change)
    nav.addEventListener("click", click)
    links[0]!.focus()
    root.scrollTop = 200
    controller.update()
    expect(change).toHaveBeenCalledOnce()
    expect(click).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(links[0])
    controller.update()
    expect(change).toHaveBeenCalledOnce()
  })
  it("restores only owned ARIA/markers and preserves author nodes and changes", () => {
    const pair = nodes()
    pair.links[0]!.setAttribute("aria-current", "page")
    const text = pair.links[0]!.firstChild
    const handler = vi.fn()
    pair.links[0]!.addEventListener("click", handler)
    const controller = createAnchor(pair.nav, { root: pair.root })
    controllers.push(controller)
    pair.links[1]!.setAttribute("aria-current", "step")
    controller.disconnect()
    expect(pair.links[0]!.getAttribute("aria-current")).toBe("page")
    expect(pair.links[1]!.getAttribute("aria-current")).toBe("step")
    expect(pair.links[0]!.firstChild).toBe(text)
    pair.links[0]!.click()
    expect(handler).toHaveBeenCalledOnce()
  })
  it("refreshes newly resolved IDs and changed geometry, preserving link identity", async () => {
    const { nav, root, controller } = bind()
    const link = document.createElement("a")
    link.href = "#later"
    link.textContent = "Later"
    geometry(link, () => rect(0, 20))
    nav.append(link)
    await flush()
    expect(controller.issues.some(issue => issue.href === "#later")).toBe(true)
    const section = document.createElement("section")
    section.id = "later"
    section.textContent = "Later"
    geometry(section, () => rect(101, 20))
    root.append(section)
    await flush()
    expect(controller.activeHref).toBe("#later")
    expect(nav.contains(link)).toBe(true)
  })
  it("keeps nested independent TOCs from being captured by parent bindings", async () => {
    const parent = bind()
    const child = bind()
    parent.nav.append(child.nav)
    await flush()
    child.root.scrollTop = 300
    child.controller.update()
    expect(child.controller.activeTarget).toBe(child.targets[2])
    expect(parent.controller.activeTarget).toBe(parent.targets[0])
    parent.controller.disconnect()
    expect(child.links[2]!.getAttribute("aria-current")).toBe("location")
  })
  it("transfers link ownership without restoring another helper's current marker as author state", async () => {
    const child = bind()
    const parent = bind()
    const moved = parent.links[0]!
    child.nav.append(moved)
    child.root.append(parent.targets[0]!)
    await flush()
    parent.controller.disconnect()
    child.controller.disconnect()
    expect(moved.hasAttribute("aria-current")).toBe(false)
    expect(moved.hasAttribute("data-anchor-active")).toBe(false)
  })
  it("reconciles a newly introduced nested navigation boundary before stale parent writes", async () => {
    const parent = bind()
    const nested = document.createElement("nav")
    nested.className = "m-anchor"
    nested.setAttribute("aria-label", "Nested")
    geometry(nested, () => rect(0, 60))
    parent.nav.append(nested)
    nested.append(parent.links[0]!)
    parent.controller.refresh()
    nested.setAttribute("data-anchor", "")
    const child = createAnchor(nested, { root: parent.root })
    controllers.push(child)
    parent.controller.update()
    await flush()
    expect(child.activeHref).toBe(parent.links[0]!.getAttribute("href"))
    expect(parent.controller.activeHref).toBeNull()
    parent.controller.disconnect()
    expect(parent.links[0]!.getAttribute("aria-current")).toBe("location")
    child.disconnect()
    expect(parent.links[0]!.hasAttribute("aria-current")).toBe(false)
  })
  it("reconsiders targets when style or layout creates/removes an intervening scroll plane", async () => {
    const { root, targets, controller } = bind()
    const wrapper = document.createElement("div")
    wrapper.style.overflowY = "visible"
    Object.defineProperties(wrapper, { clientHeight: { value: 30 }, scrollHeight: { value: 80 } })
    root.append(wrapper)
    wrapper.append(targets[0]!)
    controller.refresh()
    expect(controller.activeTarget).toBe(targets[0])
    wrapper.style.overflowY = "auto"
    await flush()
    expect(controller.activeTarget).toBeNull()
    expect(controller.issues.some(issue => issue.reason === "nested-scroll-root")).toBe(true)
    wrapper.style.overflowY = "visible"
    await flush()
    expect(controller.activeTarget).toBe(targets[0])
  })
  it("rejects and disposes a root that no longer has native vertical overflow", async () => {
    const { root, controller, links } = bind()
    root.style.overflowY = "visible"
    expect(() => controller.scrollTo(links[0]!.getAttribute("href")!)).toThrow("vertical overflow")
    expect(controller.connected).toBe(false)
    const next = bind()
    next.root.style.overflowY = "clip"
    await flush()
    expect(next.controller.connected).toBe(false)
    expect(next.links[0]!.hasAttribute("aria-current")).toBe(false)
  })
  it("releases removed roots and pending frames, and preserves replacement ownership", async () => {
    const { nav, root, links, controller } = bind()
    controller.disconnect()
    const replacement = createAnchor(nav, { root })
    controllers.push(replacement)
    controller.disconnect()
    expect(() => createAnchor(nav, { root })).toThrow("active controller")
    root.dispatchEvent(new Event("scroll"))
    nav.remove()
    await flush()
    expect(replacement.connected).toBe(false)
    expect(links[0]!.hasAttribute("data-anchor-active")).toBe(false)
  })
  it("works without ResizeObserver using native scroll and explicit update", () => {
    vi.stubGlobal("ResizeObserver", undefined)
    const { root, links, controller } = bind()
    root.scrollTop = 200
    controller.update()
    expect(controller.activeHref).toBe(links[1]!.getAttribute("href"))
  })
  it("exports independent native assets without click hijacking, provider or animation engine", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./anchor"].import).toBe("./dist/markup-ui-anchor.js")
    const source = readFileSync(join("src", "components", "anchor", "anchor.ts"), "utf8")
    const css = readFileSync(join("src", "components", "anchor", "anchor.css"), "utf8")
    expect(source).not.toContain('listen(nav, "click"')
    expect(source).not.toContain("innerHTML")
    expect(source).not.toContain("customElements")
    expect(css).toContain("position:sticky")
    expect(css).toContain("scroll-margin-block-start")
    expect(css).toContain("prefers-reduced-motion")
    expect(css).toContain("@media print")
  })
  it("keeps audited typography, rail, interaction colors and reduced motion within budget", () => {
    const css = readFileSync(join("src", "components", "anchor", "anchor.css"), "utf8")
    expect(css).toContain("var(--m-anchor-font-size,13px)")
    expect(css).toContain("line-height:1.5")
    expect(css).toContain("var(--m-anchor-rail-width,4px)")
    expect(css).toContain("var(--m-anchor-indent,16px)")
    expect(css).toContain("--_m-anchor-padding:2px 8px")
    expect(css).toContain("--_m-anchor-radius:3px")
    expect(css).toContain("#333639")
    expect(css).toContain("#dbdbdf")
    expect(css).toContain("rgba(255,255,255,.82)")
    expect(css).toContain("rgba(255,255,255,.2)")
    expect(css).toContain("var(--m-color-primary,")
    expect(css).toContain("var(--m-color-primary-hover,")
    expect(css).toContain("var(--m-color-primary-pressed,")
    expect(css).toContain("color-mix(in srgb,var(--_m-anchor-accent) 15%,transparent)")
    expect(css).not.toContain("text-decoration:underline")
    expect(css).toContain(".m-anchor a[href]{color:#000;background:transparent}")
    const style = document.createElement("style")
    style.textContent = css
    document.head.append(style)
    try {
      const media = [...style.sheet!.cssRules].filter(rule => rule.type === CSSRule.MEDIA_RULE)
        .map(rule => (rule as CSSMediaRule).media.mediaText)
      expect(media).toContain("(prefers-reduced-motion:reduce)")
    } finally { style.remove() }
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
  })
  it("preserves authored styles, hrefs and native focus during current-marker updates", () => {
    const { nav, root, links, controller } = bind()
    nav.style.cssText = "--m-anchor-font-size:16px;--m-anchor-active-color:rgb(1,2,3);--m-anchor-rail-width:6px"
    const style = nav.getAttribute("style"), hrefs = links.map(link => link.getAttribute("href")), url = document.URL
    links[0]!.focus()
    root.scrollTop = 150
    controller.update()
    controller.refresh()
    expect(nav.getAttribute("style")).toBe(style)
    expect(links.map(link => link.getAttribute("href"))).toEqual(hrefs)
    expect([...nav.querySelectorAll("a")]).toEqual(links)
    expect(document.URL).toBe(url)
    expect(document.activeElement).toBe(links[0])
    expect(nav.querySelectorAll("[data-anchor-active]")).toHaveLength(1)
  })
})

describe("canonical Anchor ViewElement", () => {
  it("exports canonical ViewElement classes and registration", () => {
    expect(anchorApi.Anchor).toBe(Anchor)
    expect(anchorApi.AnchorLink).toBe(AnchorLink)
    expect(Anchor.tag).toBe("m-anchor")
    expect(AnchorLink.tag).toBe("m-anchor-link")
    expect(ViewElement.prototype.isPrototypeOf(Anchor.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(AnchorLink.prototype)).toBe(true)
    expect(customElements.get("m-anchor")).toBe(Anchor)
    expect(customElements.get("m-anchor-link")).toBe(AnchorLink)
    expect(Anchor.observedAttributes).toEqual(["affix", "offset-top", "bound"])
    expect(AnchorLink.observedAttributes).toEqual(["href", "title"])
    expect(() => registerAnchor()).not.toThrow()
  })

  it("handles typed properties and defaults on Anchor", () => {
    const anchor = document.createElement("m-anchor") as Anchor
    expect(anchor.affix).toBe(false)
    expect(anchor.offsetTop).toBe(0)
    expect(anchor.bound).toBe(12)

    anchor.affix = true
    expect(anchor.affix).toBe(true)
    expect(anchor.hasAttribute("affix")).toBe(true)

    anchor.affix = false
    expect(anchor.affix).toBe(false)
    expect(anchor.hasAttribute("affix")).toBe(false)

    anchor.setAttribute("affix", "true")
    expect(anchor.affix).toBe(true)

    anchor.offsetTop = 25
    expect(anchor.offsetTop).toBe(25)
    expect(anchor.getAttribute("offset-top")).toBe("25")

    anchor.bound = 30
    expect(anchor.bound).toBe(30)
    expect(anchor.getAttribute("bound")).toBe("30")
  })

  it("handles typed properties and defaults on AnchorLink", () => {
    const link = document.createElement("m-anchor-link") as AnchorLink
    expect(link.href).toBe("")
    expect(link.title).toBe("")

    link.href = "#section-1"
    expect(link.href).toBe("#section-1")
    expect(link.getAttribute("href")).toBe("#section-1")

    link.title = "Section 1"
    expect(link.title).toBe("Section 1")
    expect(link.getAttribute("title")).toBe("Section 1")

    link.href = null
    expect(link.href).toBe("")
    expect(link.hasAttribute("href")).toBe(false)
  })

  it("renders inner anchor link with href and title", () => {
    const link = document.createElement("m-anchor-link") as AnchorLink
    link.href = "#intro"
    link.title = "Introduction"
    document.body.append(link)

    const a = link.querySelector<HTMLAnchorElement>("a")
    expect(a).not.toBeNull()
    expect(a?.getAttribute("href")).toBe("#intro")
    expect(a?.textContent).toBe("Introduction")
    expect(a?.title).toBe("Introduction")
    expect(a?.classList.contains("m-anchor-link")).toBe(true)
    expect(a?.dataset.part).toBe("link")
  })

  it("renders authored children inside the inner anchor link when title is not specified", () => {
    const link = document.createElement("m-anchor-link") as AnchorLink
    link.href = "#custom"
    link.textContent = "Custom Label"
    document.body.append(link)

    const a = link.querySelector<HTMLAnchorElement>("a")
    expect(a).not.toBeNull()
    expect(a?.getAttribute("href")).toBe("#custom")
    expect(a?.textContent).toBe("Custom Label")
  })

  it("handles nested m-anchor-link elements outside the parent a tag", () => {
    const parent = document.createElement("m-anchor-link") as AnchorLink
    parent.href = "#parent"
    parent.title = "Parent"

    const child = document.createElement("m-anchor-link") as AnchorLink
    child.href = "#child"
    child.title = "Child"

    parent.append(child)
    document.body.append(parent)

    const parentA = parent.querySelector<HTMLAnchorElement>(":scope > a")
    const childA = child.querySelector<HTMLAnchorElement>(":scope > a")

    expect(parentA).not.toBeNull()
    expect(childA).not.toBeNull()
    expect(parentA?.textContent).toBe("Parent")
    expect(childA?.textContent).toBe("Child")
    expect(parentA?.contains(child)).toBe(false)
  })

  it("toggles sticky class when affix is set", () => {
    const anchor = document.createElement("m-anchor") as Anchor
    document.body.append(anchor)
    expect(anchor.classList.contains("m-anchor--sticky")).toBe(false)

    anchor.affix = true
    expect(anchor.classList.contains("m-anchor--sticky")).toBe(true)

    anchor.offsetTop = 32
    expect(anchor.style.getPropertyValue("--m-anchor-sticky-offset")).toBe("32px")

    anchor.affix = false
    expect(anchor.classList.contains("m-anchor--sticky")).toBe(false)
  })

  it("tracks active section and emits m:change event on Anchor", () => {
    const anchor = document.createElement("m-anchor") as Anchor
    const link1 = document.createElement("m-anchor-link") as AnchorLink
    link1.href = "#sec1"
    link1.title = "Section 1"
    const link2 = document.createElement("m-anchor-link") as AnchorLink
    link2.href = "#sec2"
    link2.title = "Section 2"
    anchor.append(link1, link2)

    const root = document.createElement("div")
    root.style.overflowY = "auto"
    Object.defineProperties(root, {
      clientTop: { configurable: true, value: 1 },
      clientHeight: { configurable: true, value: 200 },
      offsetHeight: { configurable: true, value: 202 },
      scrollHeight: { configurable: true, value: 600 },
    })
    const sec1 = document.createElement("section")
    sec1.id = "sec1"
    const sec2 = document.createElement("section")
    sec2.id = "sec2"
    root.append(sec1, sec2)

    geometry(anchor, () => rect(0, 100))
    geometry(root, () => rect(100, 202))
    geometry(sec1, () => rect(101 - root.scrollTop, 100))
    geometry(sec2, () => rect(251 - root.scrollTop, 100))
    geometry(link1, () => rect(0, 20))
    geometry(link2, () => rect(20, 20))

    const changeSpy = vi.fn()
    anchor.addEventListener("m:change", changeSpy)
    anchor.setScrollRoot(root)

    document.body.append(anchor, root)

    expect(anchor.getAttribute("role")).toBe("navigation")
    expect(anchor.getAttribute("aria-label")).toBe("Anchor")
    expect(anchor.classList.contains("m-anchor")).toBe(true)

    anchor.update()
    expect(changeSpy).toHaveBeenCalled()
    expect(changeSpy.mock.calls[0]![0].detail).toEqual({ href: "#sec1" })

    root.scrollTop = 160
    anchor.update()
    expect(changeSpy).toHaveBeenCalledTimes(2)
    expect(changeSpy.mock.calls[1]![0].detail).toEqual({ href: "#sec2" })

    const a2 = link2.querySelector("a")
    expect(a2?.getAttribute("aria-current")).toBe("location")
    expect(a2?.hasAttribute("data-anchor-active")).toBe(true)
  })

  it("extracts Anchor and AnchorLink API metadata matching specification", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["anchor"])
    expect(docs.elements).toHaveLength(2)

    const [anchorDoc, linkDoc] = docs.elements
    expect(anchorDoc!.type).toBe("Anchor")
    expect(anchorDoc!.web.primary).toBe("m-anchor")
    expect(anchorDoc!.properties.affix).toMatchObject({
      name: "affix",
      type: "boolean",
      default: false,
      attribute: "affix",
      encoding: "boolean",
      readable: true,
      writable: true,
    })
    expect(anchorDoc!.properties.offsetTop).toMatchObject({
      name: "offsetTop",
      type: "number",
      default: 0,
      attribute: "offset-top",
      readable: true,
      writable: true,
    })
    expect(anchorDoc!.properties.bound).toMatchObject({
      name: "bound",
      type: "number",
      default: 12,
      attribute: "bound",
      readable: true,
      writable: true,
    })
    expect(anchorDoc!.events).toEqual([
      {
        name: "Change",
        web: "m:change",
        bubbles: true,
        cancelable: false,
        composed: false,
        detail: { href: "string" },
      },
    ])
    expect(anchorDoc!.regions).toEqual([
      {
        name: "links",
        element: "m-anchor-link",
        accepts: ["AnchorLink"],
        min: 0,
        max: null,
      },
    ])

    expect(linkDoc!.type).toBe("AnchorLink")
    expect(linkDoc!.web.primary).toBe("m-anchor-link")
    expect(linkDoc!.properties.href).toMatchObject({
      name: "href",
      type: "string",
      default: "",
      attribute: "href",
      readable: true,
      writable: true,
    })
    expect(linkDoc!.properties.title).toMatchObject({
      name: "title",
      type: "string",
      default: "",
      attribute: "title",
      readable: true,
      writable: true,
    })
    expect(linkDoc!.regions).toEqual([
      {
        name: "content",
        accepts: ["AnchorLink", "text", "flow content"],
        min: 0,
        max: null,
      },
    ])
  })

  it("structures Anchor demo with standard scaffold and explicit shared-core loading", () => {
    const demoHtml = readFileSync(resolve("demo", "components", "anchor.html"), "utf8")
    const parsed = new DOMParser().parseFromString(demoHtml, "text/html")
    const scripts = [...parsed.querySelectorAll("script[src]")].map(script => script.getAttribute("src"))
    expect(scripts.indexOf("../../dist/markup-ui-core.global.js")).toBeLessThan(scripts.indexOf("../../dist/markup-ui-anchor.global.js"))
    expect(parsed.querySelector("main[data-demo-page].component-docs #anchor-api")).not.toBeNull()
    expect(parsed.querySelector('script[src="../component-outline.js"]')).not.toBeNull()
    expect(parsed.querySelector('link[href="../example-code.css"]')).not.toBeNull()
    expect(parsed.querySelector('link[href="../component-api.css"]')).not.toBeNull()
    expect(parsed.querySelector("details.component-setup")).not.toBeNull()
    for (const example of parsed.querySelectorAll("[data-demo-example]")) {
      expect(example.querySelector("[data-demo-header] h2[id]")).not.toBeNull()
      expect(example.querySelector("[data-demo-preview]")).not.toBeNull()
    }
  })
})

