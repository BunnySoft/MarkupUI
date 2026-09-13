import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createImagePreview, Image, ImageGroup, MImage, MImageGroup, registerImage } from "../src/components/image/index.js"
import type { ImagePreviewController } from "../src/components/image/index.js"
import { ViewElement } from "../src/core/index.js"

const controllers: ImagePreviewController[] = []
const css = readFileSync(resolve("src", "components", "image", "image.css"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
const dialogPrototype = HTMLDialogElement.prototype
let showDescriptor: PropertyDescriptor | undefined
let closeDescriptor: PropertyDescriptor | undefined

function fixture(): HTMLElement {
  const root = document.createElement("div")
  root.setAttribute("data-image-group", "")
  root.innerHTML = `<figure data-image-frame><a data-image-preview href="https://example.test/first.svg" id="first"><picture><source media="(min-width: 40rem)" srcset="first-2x.svg 2x"><img id="thumb" src="first.svg" srcset="first.svg 1x, first-2x.svg 2x" sizes="160px" width="160" height="100" loading="lazy" decoding="async" crossorigin="anonymous" referrerpolicy="no-referrer" alt="First image"></picture></a><p data-image-placeholder>Loading hint</p><p data-image-error hidden>Error content</p></figure>
<a data-image-preview href="https://example.test/second.svg" id="second"><img src="second.svg" alt="Second image"></a>
<a data-image-preview href="https://example.test/third.svg" data-preview-disabled id="disabled">Plain original</a>
<template data-image-preview-template><dialog aria-label="Image preview"><button type="button" data-image-close>Close preview</button><p data-image-position></p><div data-image-stage><img data-image-full alt="" decoding="async" referrerpolicy="no-referrer"></div><p data-image-preview-error hidden>Preview failed</p><div data-image-toolbar><button type="button" data-image-prev>Previous image</button><button type="button" data-image-next>Next image</button><a data-image-original target="_blank" rel="noopener noreferrer">Open original</a></div></dialog></template>`
  document.body.append(root)
  return root
}
function enhance(root = fixture()): ImagePreviewController {
  const controller = createImagePreview(root)
  controllers.push(controller)
  return controller
}
const flush = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
}
function completed(image: HTMLImageElement, width: number): void {
  Object.defineProperty(image, "complete", { configurable: true, value: true })
  Object.defineProperty(image, "naturalWidth", { configurable: true, value: width })
}
function clickWithoutNavigation(link: HTMLAnchorElement, init: MouseEventInit = {}): boolean {
  let handled = false
  const listener = (event: Event): void => { handled = event.defaultPrevented; event.preventDefault() }
  document.addEventListener("click", listener, { once: true })
  link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init }))
  return handled
}
beforeEach(() => {
  showDescriptor = Object.getOwnPropertyDescriptor(dialogPrototype, "showModal")
  closeDescriptor = Object.getOwnPropertyDescriptor(dialogPrototype, "close")
  Object.defineProperty(dialogPrototype, "showModal", { configurable: true, value(this: HTMLDialogElement) { this.open = true } })
  Object.defineProperty(dialogPrototype, "close", { configurable: true, value(this: HTMLDialogElement) {
    this.open = false
    this.dispatchEvent(new Event("close"))
  } })
})
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  vi.restoreAllMocks()
  document.body.replaceChildren()
  if (showDescriptor) Object.defineProperty(dialogPrototype, "showModal", showDescriptor)
  else Reflect.deleteProperty(dialogPrototype, "showModal")
  if (closeDescriptor) Object.defineProperty(dialogPrototype, "close", closeDescriptor)
  else Reflect.deleteProperty(dialogPrototype, "close")
})

describe("native Image/group preview helper", () => {
  it("ships independent ESM/classic helper support and CSS without a viewer dependency", () => {
    expect(pkg.exports["./image"].import).toBe("./dist/markup-ui-image.js")
    expect(pkg.exports["./image/style.css"]).toBe("./dist/markup-ui-image.css")
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("m-image")).toBe(Image)
    expect(customElements.get("m-image-group")).toBe(ImageGroup)
    expect(css).not.toContain("@import")
  })

  it("preserves responsive thumbnail nodes, srcset/sizes/alt/attributes and original listeners", () => {
    const root = fixture()
    const image = root.querySelector<HTMLImageElement>("#thumb")!
    const picture = image.parentElement!
    const before = picture.outerHTML
    let loads = 0
    image.addEventListener("load", () => loads++)
    const controller = enhance(root)
    controller.open(0)
    controller.next()
    image.dispatchEvent(new Event("load"))
    expect(picture.outerHTML).toBe(before)
    expect(root.querySelector("#thumb")).toBe(image)
    expect(loads).toBe(1)
    expect(image.getAttribute("loading")).toBe("lazy")
    expect(image.style.cssText).toBe("")
  })

  it("intercepts only plain intended activation and preserves modifier/download/target policy", () => {
    const root = fixture()
    const controller = enhance(root)
    const first = root.querySelector<HTMLAnchorElement>("#first")!
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
      expect(clickWithoutNavigation(first, init)).toBe(false)
      expect(controller.show).toBe(false)
    }
    first.download = ""
    expect(clickWithoutNavigation(first)).toBe(false)
    first.removeAttribute("download")
    first.target = "_blank"
    expect(clickWithoutNavigation(first)).toBe(false)
    first.removeAttribute("target")
    first.rel = "external"
    expect(clickWithoutNavigation(first)).toBe(false)
    first.removeAttribute("rel")
    expect(clickWithoutNavigation(root.querySelector("#disabled")!)).toBe(false)
    expect(clickWithoutNavigation(first)).toBe(true)
    expect(controller.show).toBe(true)
  })

  it("respects an author's already-cancelled click", () => {
    const root = fixture()
    const first = root.querySelector<HTMLAnchorElement>("#first")!
    first.addEventListener("click", event => event.preventDefault())
    const controller = enhance(root)
    clickWithoutNavigation(first)
    expect(controller.show).toBe(false)
  })

  it("keeps ordinary links as fallback when dialog support or valid template anatomy is missing", () => {
    const root = fixture()
    const controller = enhance(root)
    Reflect.deleteProperty(dialogPrototype, "showModal")
    expect(clickWithoutNavigation(root.querySelector("#first")!)).toBe(false)
    expect(controller.open()).toBe(false)
    expect(controller.dialog).toBeNull()
  })

  it("rejects unnamed/unsafe or initially open templates without cloning them", () => {
    for (const kind of ["unnamed", "open", "script", "source"]) {
      const root = fixture()
      const template = root.querySelector<HTMLTemplateElement>("template")!
      const dialog = template.content.querySelector("dialog")!
      if (kind === "unnamed") dialog.removeAttribute("aria-label")
      if (kind === "open") dialog.open = true
      if (kind === "script") dialog.append(document.createElement("script"))
      if (kind === "source") dialog.querySelector("img")!.setAttribute("srcset", "other.svg 2x")
      const controller = enhance(root)
      expect(controller.open()).toBe(false)
      expect(root.querySelector("dialog")).toBeNull()
    }
  })

  it("uses a named native dialog, distinct image alt and an always-reachable close button", () => {
    const root = fixture()
    const controller = enhance(root)
    expect(controller.open()).toBe(true)
    const dialog = controller.dialog!
    const image = dialog.querySelector<HTMLImageElement>("img[data-image-full]")!
    expect(dialog.getAttribute("aria-label")).toBe("Image preview")
    expect(image.alt).toBe("First image")
    expect(image.hasAttribute("aria-label")).toBe(false)
    expect(image.getAttribute("decoding")).toBe("async")
    expect(image.getAttribute("referrerpolicy")).toBe("no-referrer")
    expect(document.activeElement).toBe(dialog.querySelector("[data-image-close]"))
    expect(dialog.querySelector("[data-image-toolbar]")!.contains(document.activeElement)).toBe(false)
  })

  it("wraps group navigation in authored eligible order with explicit event notifications", () => {
    const root = fixture()
    const events: string[] = []
    for (const name of ["m:image-open", "m:image-change", "m:image-next", "m:image-prev", "m:image-close"]) {
      root.addEventListener(name, () => events.push(name))
    }
    const controller = enhance(root)
    controller.open(0)
    expect(controller.next()).toBe(true)
    expect(controller.current).toBe(1)
    expect(controller.next()).toBe(true)
    expect(controller.current).toBe(0)
    expect(controller.prev()).toBe(true)
    expect(controller.current).toBe(1)
    controller.close()
    expect(events).toContain("m:image-next")
    expect(events).toContain("m:image-prev")
    expect(events).toContain("m:image-close")
  })

  it("supports validated imperative current/show updates without a framework prop bridge", () => {
    const controller = enhance()
    controller.current = 1
    controller.show = true
    expect(controller.current).toBe(1)
    expect(controller.show).toBe(true)
    expect(() => { controller.current = -1 }).toThrow(RangeError)
    expect(() => { controller.current = 99 }).toThrow(RangeError)
    expect(() => { controller.show = "false" as unknown as boolean }).toThrow(TypeError)
    controller.show = false
    expect(controller.show).toBe(false)
  })

  it("isolates nested groups and rejects duplicate active ownership", () => {
    const outer = fixture()
    const nested = fixture()
    outer.append(nested)
    const parent = enhance(outer)
    const child = enhance(nested)
    expect(() => createImagePreview(outer)).toThrow(/already has/)
    expect(clickWithoutNavigation(nested.querySelector("#first")!)).toBe(true)
    expect(child.show).toBe(true)
    expect(parent.show).toBe(false)
    expect(child.dialog?.querySelector("[data-image-position]")?.textContent).toBe("Image 1 of 2")
  })

  it("disables navigation for a single image and does not pretend to provide gestures/tools", () => {
    const root = fixture()
    root.querySelector("#second")!.remove()
    const controller = enhance(root)
    controller.open()
    expect(controller.next()).toBe(false)
    expect(controller.prev()).toBe(false)
    expect(controller.dialog?.querySelector<HTMLButtonElement>("[data-image-next]")?.disabled).toBe(true)
    expect(controller.dialog?.querySelector("[data-image-zoom], [data-image-rotate], [data-image-download]")).toBeNull()
  })

  it("cancels stale preview loads by replacing only the owned preview image", () => {
    const controller = enhance()
    controller.open()
    const first = controller.dialog!.querySelector<HTMLImageElement>("img")!
    const staleError = first.onerror!
    controller.next()
    const second = controller.dialog!.querySelector<HTMLImageElement>("img")!
    expect(first).not.toBe(second)
    staleError.call(first, new Event("error"))
    expect(controller.dialog?.dataset.imageState).toBe("loading")
    second.onload!.call(second, new Event("load"))
    expect(controller.dialog?.dataset.imageState).toBe("loaded")
    expect(first.getAttribute("src")).toBeNull()
  })

  it("shows an authored preview error without replacing the toolbar or misreporting success", () => {
    const controller = enhance()
    controller.open()
    const dialog = controller.dialog!
    const close = dialog.querySelector("[data-image-close]")
    dialog.querySelector<HTMLImageElement>("img")!.onerror!.call(dialog.querySelector("img"), new Event("error"))
    expect(dialog.dataset.imageState).toBe("error")
    expect(dialog.querySelector<HTMLElement>("[data-image-preview-error]")!.hidden).toBe(false)
    expect(dialog.querySelector("[data-image-close]")).toBe(close)
    expect(dialog.querySelector<HTMLAnchorElement>("[data-image-original]")!.href).toBe("https://example.test/first.svg")
  })

  it("responds to live href/alt/toolbar changes while keeping the close action visible", async () => {
    const root = fixture()
    const controller = enhance(root)
    controller.open()
    const link = root.querySelector<HTMLAnchorElement>("#first")!
    const thumbnail = link.querySelector<HTMLImageElement>("img")!
    thumbnail.alt = "Updated thumbnail description"
    await flush()
    expect(controller.dialog?.querySelector<HTMLImageElement>("img")!.alt).toBe(thumbnail.alt)
    link.href = "https://example.test/revised.svg"
    link.setAttribute("data-preview-alt", "Revised preview name")
    root.setAttribute("data-show-toolbar", "false")
    await flush()
    expect(controller.dialog?.querySelector<HTMLImageElement>("img")!.src).toBe(link.href)
    expect(controller.dialog?.querySelector<HTMLImageElement>("img")!.alt).toBe("Revised preview name")
    expect(controller.dialog?.querySelector<HTMLElement>("[data-image-toolbar]")!.hidden).toBe(true)
    expect(controller.dialog?.querySelector<HTMLButtonElement>("[data-image-close]")!.hidden).toBe(false)
  })

  it("closes when the active trigger is removed and can reopen a remaining member", async () => {
    const root = fixture()
    const controller = enhance(root)
    controller.open()
    root.querySelector("#first")!.remove()
    await flush()
    expect(controller.show).toBe(false)
    expect(document.activeElement).toBe(root.querySelector("#second"))
    expect(controller.open(0)).toBe(true)
  })

  it("closes and cleans owned resources on root removal, then reconnects explicitly", async () => {
    const root = fixture()
    const controller = enhance(root)
    controller.open()
    const dialog = controller.dialog!
    root.remove()
    await flush()
    expect(controller.connected).toBe(false)
    expect(dialog.open).toBe(false)
    expect(root.querySelector("dialog")).toBeNull()
    document.body.append(root)
    controller.connect()
    controller.connect()
    expect(controller.open(0)).toBe(true)
    controller.disconnect()
    controller.disconnect()
    expect(controller.connected).toBe(false)
  })

  it("restores a programmatic opener but does not steal focus from another open dialog", () => {
    const root = fixture()
    const opener = document.createElement("button")
    opener.textContent = "Open preview"
    document.body.append(opener)
    const controller = enhance(root)
    controller.open(0, opener)
    controller.close()
    expect(document.activeElement).toBe(opener)
    controller.open()
    const other = document.createElement("dialog")
    other.open = true
    const button = document.createElement("button")
    button.textContent = "Other modal"
    other.append(button)
    document.body.append(other)
    button.focus()
    controller.close()
    expect(document.activeElement).toBe(button)
  })

  it("leaves original native links after disconnect and retains custom element registration", () => {
    const root = fixture()
    const controller = enhance(root)
    const first = root.querySelector<HTMLAnchorElement>("#first")!
    controller.open()
    controller.disconnect()
    expect(clickWithoutNavigation(first)).toBe(false)
    expect(first.href).toBe("https://example.test/first.svg")
    expect(customElements.get("m-image-group")).toBe(ImageGroup)
  })

  it("preserves authored hidden toolbar defaults and closes an externally hidden dialog", async () => {
    const root = fixture()
    root.querySelector<HTMLTemplateElement>("template")!.content.querySelector<HTMLElement>("[data-image-toolbar]")!.hidden = true
    const controller = enhance(root)
    controller.open()
    expect(controller.dialog!.querySelector<HTMLElement>("[data-image-toolbar]")!.hidden).toBe(true)
    controller.dialog!.hidden = true
    await flush()
    expect(controller.show).toBe(false)
    expect(controller.open()).toBe(false)
  })

  it("keeps selection identity across reordering and updates native group indices", async () => {
    const root = fixture()
    const controller = enhance(root)
    controller.open(1)
    const second = root.querySelector("#second")!
    root.prepend(second)
    await flush()
    expect(controller.current).toBe(0)
    expect(controller.dialog?.querySelector<HTMLImageElement>("img")!.alt).toBe("Second image")
    expect(controller.dialog?.querySelector("[data-image-position]")!.textContent).toBe("Image 1 of 2")
  })

  it("closes when the native trigger is disabled for preview while retaining its href", async () => {
    const root = fixture()
    const controller = enhance(root)
    const link = root.querySelector("#first")!
    controller.open()
    link.setAttribute("data-preview-disabled", "")
    await flush()
    expect(controller.show).toBe(false)
    expect(link.getAttribute("href")).toBe("https://example.test/first.svg")
  })

  it("cancels stale owned-image callbacks after close without altering the next session", () => {
    const controller = enhance()
    controller.open(0)
    const old = controller.dialog!.querySelector<HTMLImageElement>("img")!
    const staleLoad = old.onload!
    controller.close()
    controller.open(1)
    staleLoad.call(old, new Event("load"))
    expect(controller.dialog!.dataset.imageState).toBe("loading")
    expect(controller.dialog!.querySelector<HTMLImageElement>("img")!.alt).toBe("Second image")
  })

  it("reopens correctly before a queued native close event is delivered", () => {
    const controller = enhance()
    controller.open(0)
    const dialog = controller.dialog!
    dialog.open = false
    expect(controller.open(1)).toBe(true)
    expect(dialog.open).toBe(true)
    dialog.dispatchEvent(new Event("close"))
    expect(controller.show).toBe(true)
    expect(controller.current).toBe(1)
  })

  it("rejects non-image URL schemes and fragment links without claiming preview success", () => {
    const root = fixture()
    const controller = enhance(root)
    const first = root.querySelector<HTMLAnchorElement>("#first")!
    first.href = "javascript:void(0)"
    expect(controller.open(first)).toBe(false)
    first.href = "#fragment"
    expect(controller.open(first)).toBe(false)
    expect(controller.dialog).toBeNull()
  })
})

describe("bounded native thumbnail fallback", () => {
  function brokenFixture(): { root: HTMLElement, image: HTMLImageElement, probes: HTMLImageElement[] } {
    const root = fixture()
    const image = root.querySelector<HTMLImageElement>("#second img")!
    image.src = "https://example.test/broken.svg"
    image.setAttribute("data-image-fallback", "https://example.test/fallback.svg")
    completed(image, 0)
    const probes: HTMLImageElement[] = []
    const create = document.createElement.bind(document)
    vi.spyOn(document, "createElement").mockImplementation(((name: string, options?: ElementCreationOptions) => {
      const element = create(name, options)
      if (name === "img") probes.push(element as HTMLImageElement)
      return element
    }) as typeof document.createElement)
    return { root, image, probes }
  }

  it("probes one fallback then changes only src on the original plain img", async () => {
    const { root, image, probes } = brokenFixture()
    const alt = image.alt
    enhance(root)
    expect(probes).toHaveLength(1)
    probes[0]!.onload!.call(probes[0], new Event("load"))
    await flush()
    expect(image.src).toBe("https://example.test/fallback.svg")
    expect(image.alt).toBe(alt)
    image.dispatchEvent(new Event("error"))
    expect(probes).toHaveLength(1)
  })

  describe("audited Image presentation", () => {
    it("retains responsive native thumbnails and inherits authored thumbnail rounding", () => {
      expect(css).toContain(":where(img.m-image)")
      expect(css).toContain("max-inline-size: 100%")
      expect(css).toContain("object-fit: var(--m-image-fit, fill)")
      expect(css).toContain("border-radius: inherit")
      expect(css).not.toContain("cursor: zoom-in")
    })

    it("centers the natural preview in a transparent viewport instead of a 65vh framed panel", () => {
      expect(css).toContain("inline-size: 100%")
      expect(css).toContain("block-size: 100%")
      expect(css).toContain("max-inline-size: min(100%, calc(100vw - 32px))")
      expect(css).toContain("max-block-size: min(100%, calc(100vh - 32px))")
      expect(css).toContain("margin: auto")
      expect(css).toContain("[data-image-stage] { position: fixed; inset: 0;")
      expect(css).toContain("background: var(--m-image-preview-background, transparent)")
      expect(css).toContain("background: var(--m-image-backdrop, #0000004d)")
      expect(css).not.toContain("65vh")
    })

    it("uses scoped light/dark chrome without assigning public theme overrides", () => {
      expect(css).toContain(':where([data-m-theme="dark"]) { --_m-image-color: #ffffffd1; }')
      expect(css).toContain(':where([data-m-theme="light"]) { --_m-image-color: initial; }')
      expect(css).toContain("var(--m-image-preview-color, var(--_m-image-color, #ffffffe6))")
      expect(css).toContain("var(--m-image-toolbar-background, #00000059)")
      expect(css).not.toMatch(/(?:^|[;{])\s*--m-image-[\w-]+\s*:/m)
    })

    it("matches toolbar surface geometry while retaining wrap, native focus and disabled controls", () => {
      expect(css).toContain("bottom: 40px")
      expect(css).toMatch(/\[data-image-toolbar\]\s*\{\s*position:\s*fixed;/)
      expect(css).toContain("min-height: 48px")
      expect(css).toContain("padding: 0 12px")
      expect(css).toContain("border-radius: 24px")
      expect(css).toContain("flex-wrap: wrap")
      expect(css).toContain("max-width: calc(100% - 32px)")
      expect(css).toContain("button:disabled { opacity: .5; cursor: default; }")
      expect(css).not.toMatch(/outline:\s*(?:none|0)\b/)
      expect(css).toContain("@media (forced-colors: active)")
      expect(css).toContain("@media print")
    })
  })

  it("does not loop on a failed fallback or retry the same URL", () => {
    const { root, image, probes } = brokenFixture()
    enhance(root)
    probes[0]!.onerror!.call(probes[0], new Event("error"))
    image.dispatchEvent(new Event("error"))
    expect(probes).toHaveLength(1)
    expect(image.src).toBe("https://example.test/broken.svg")
  })

  it("ignores stale fallback completion after a new native source is assigned", async () => {
    const { root, image, probes } = brokenFixture()
    enhance(root)
    const stale = probes[0]!.onload!
    image.src = "https://example.test/new.svg"
    completed(image, 100)
    await flush()
    stale.call(probes[0], new Event("load"))
    expect(image.src).toBe("https://example.test/new.svg")
  })

  it("cancels fallback when the current original image succeeds without a source change", () => {
    const { root, image, probes } = brokenFixture()
    enhance(root)
    const stale = probes[0]!.onload!
    completed(image, 100)
    image.dispatchEvent(new Event("load"))
    stale.call(probes[0], new Event("load"))
    expect(image.src).toBe("https://example.test/broken.svg")
    expect(probes[0]!.getAttribute("src")).toBeNull()
  })

  it("does not suppress responsive picture/srcset sources to force a fallback", () => {
    const { root, image, probes } = brokenFixture()
    image.srcset = "one.svg 1x, two.svg 2x"
    const before = image.outerHTML
    enhance(root)
    image.dispatchEvent(new Event("error"))
    expect(probes).toHaveLength(0)
    expect(image.outerHTML).toBe(before)
    const responsive = root.querySelector<HTMLImageElement>("#thumb")!
    completed(responsive, 0)
    responsive.setAttribute("data-image-fallback", "fallback.svg")
    responsive.dispatchEvent(new Event("error"))
    expect(probes).toHaveLength(0)
  })

  it("cancels probes/listeners on disconnect without restoring/refetching original images", () => {
    const { root, image, probes } = brokenFixture()
    const controller = enhance(root)
    const stale = probes[0]!.onload!
    controller.disconnect()
    stale.call(probes[0], new Event("load"))
    expect(image.src).toBe("https://example.test/broken.svg")
    expect(probes[0]!.getAttribute("src")).toBeNull()
  })

  it("lets a live fallback configuration change retry once without looping the old failed URL", async () => {
    const { root, image, probes } = brokenFixture()
    enhance(root)
    probes[0]!.onerror!.call(probes[0], new Event("error"))
    image.setAttribute("data-image-fallback", "https://example.test/other-fallback.svg")
    await flush()
    expect(probes).toHaveLength(2)
    probes[1]!.onload!.call(probes[1], new Event("load"))
    await flush()
    image.dispatchEvent(new Event("error"))
    expect(probes).toHaveLength(2)
    expect(image.src).toBe("https://example.test/other-fallback.svg")
  })
})

function imageElement(markup = "<m-image></m-image>"): Image {
  document.body.innerHTML = markup
  const element = document.querySelector("m-image")
  if (!(element instanceof Image)) throw new Error("Image was not upgraded")
  return element
}

describe("canonical Image ViewElement", () => {
  it("exports canonical own-tag ViewElement and registers m-image and m-image-group", () => {
    expect(Image.tag).toBe("m-image")
    expect(ImageGroup.tag).toBe("m-image-group")
    expect(MImage).toBe(Image)
    expect(MImageGroup).toBe(ImageGroup)
    expect(ViewElement.prototype.isPrototypeOf(Image.prototype)).toBe(true)
    expect(ViewElement.prototype.isPrototypeOf(ImageGroup.prototype)).toBe(true)
    expect(customElements.get("m-image")).toBe(Image)
    expect(customElements.get("m-image-group")).toBe(ImageGroup)
    expect(Image.observedAttributes).toEqual(["src", "alt", "width", "height", "preview", "preview-src", "fallback-src", "object-fit"])
    const define = vi.fn()
    expect(() => registerImage({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerImage()).not.toThrow()
  })

  it("has explicit property defaults and validates values before mutating attributes", () => {
    const element = imageElement()
    expect(element.src).toBe("")
    expect(element.alt).toBe("")
    expect(element.width).toBeNull()
    expect(element.height).toBeNull()
    expect(element.preview).toBe(true)
    expect(element.previewSrc).toBeNull()
    expect(element.fallbackSrc).toBeNull()
    expect(element.objectFit).toBe("fill")

    element.src = "https://example.test/photo.jpg"
    expect(element.getAttribute("src")).toBe("https://example.test/photo.jpg")
    expect(element.src).toBe("https://example.test/photo.jpg")

    element.alt = "Sample photo"
    expect(element.getAttribute("alt")).toBe("Sample photo")
    expect(element.alt).toBe("Sample photo")

    element.width = "300"
    expect(element.getAttribute("width")).toBe("300")
    expect(element.width).toBe("300")
    element.width = null
    expect(element.hasAttribute("width")).toBe(false)
    expect(element.width).toBeNull()

    element.height = "200"
    expect(element.getAttribute("height")).toBe("200")
    expect(element.height).toBe("200")
    element.height = null
    expect(element.hasAttribute("height")).toBe(false)
    expect(element.height).toBeNull()

    element.preview = false
    expect(element.getAttribute("preview")).toBe("false")
    expect(element.preview).toBe(false)
    element.preview = true
    expect(element.getAttribute("preview")).toBe("true")
    expect(element.preview).toBe(true)

    element.previewSrc = "https://example.test/full.jpg"
    expect(element.getAttribute("preview-src")).toBe("https://example.test/full.jpg")
    expect(element.previewSrc).toBe("https://example.test/full.jpg")
    element.previewSrc = null
    expect(element.hasAttribute("preview-src")).toBe(false)
    expect(element.previewSrc).toBeNull()

    element.fallbackSrc = "https://example.test/fallback.jpg"
    expect(element.getAttribute("fallback-src")).toBe("https://example.test/fallback.jpg")
    expect(element.fallbackSrc).toBe("https://example.test/fallback.jpg")
    element.fallbackSrc = null
    expect(element.hasAttribute("fallback-src")).toBe(false)
    expect(element.fallbackSrc).toBeNull()

    expect(() => { Reflect.set(element, "objectFit", "invalid") }).toThrow(RangeError)

    for (const fit of ["contain", "cover", "none", "scale-down", "fill"] as const) {
      element.objectFit = fit
      expect(element.getAttribute("object-fit")).toBe(fit)
      expect(element.objectFit).toBe(fit)
    }
  })

  it("replays pre-upgrade properties upon connection", () => {
    const element = document.createElement("m-image") as Image
    Object.defineProperty(element, "src", { configurable: true, value: "https://example.test/pre.jpg" })
    Object.defineProperty(element, "alt", { configurable: true, value: "Pre alt" })
    Object.defineProperty(element, "preview", { configurable: true, value: false })
    Object.defineProperty(element, "objectFit", { configurable: true, value: "cover" })
    document.body.append(element)

    expect(element.src).toBe("https://example.test/pre.jpg")
    expect(element.alt).toBe("Pre alt")
    expect(element.preview).toBe(false)
    expect(element.objectFit).toBe("cover")
    expect(element.getAttribute("src")).toBe("https://example.test/pre.jpg")
    expect(element.getAttribute("alt")).toBe("Pre alt")
    expect(element.getAttribute("preview")).toBe("false")
    expect(element.getAttribute("object-fit")).toBe("cover")
  })

  it("dispatches m:load event when image loads successfully", () => {
    const element = imageElement('<m-image src="https://example.test/photo.jpg" alt="Photo"></m-image>')
    const events: CustomEvent[] = []
    element.addEventListener("m:load", (event) => events.push(event as CustomEvent))

    const img = element.querySelector("img")!
    img.dispatchEvent(new Event("load"))

    expect(events).toHaveLength(1)
    expect(events[0]!.type).toBe("m:load")
    expect(events[0]!.detail.src).toBe("https://example.test/photo.jpg")
    expect(events[0]!.bubbles).toBe(true)
  })

  it("dispatches m:error and falls back to fallbackSrc when image fails", () => {
    const element = imageElement('<m-image src="https://example.test/missing.jpg" fallback-src="https://example.test/fallback.jpg" alt="Missing"></m-image>')
    const errors: CustomEvent[] = []
    element.addEventListener("m:error", (event) => errors.push(event as CustomEvent))

    const img = element.querySelector("img")!
    img.dispatchEvent(new Event("error"))
    expect(img.src).toBe("https://example.test/fallback.jpg")
    expect(errors).toHaveLength(0)

    img.dispatchEvent(new Event("error"))
    expect(errors).toHaveLength(1)
    expect(errors[0]!.detail.src).toBe("https://example.test/fallback.jpg")
  })

  it("opens and closes preview modal for single image", () => {
    const element = imageElement('<m-image src="https://example.test/photo.jpg" alt="Photo" preview-src="https://example.test/full.jpg"></m-image>')
    expect(element.openPreview()).toBe(true)

    const dialog = element.querySelector("dialog.m-image-preview")!
    expect(dialog).not.toBeNull()
    expect(dialog.getAttribute("aria-label")).toBe("Image preview")

    const fullImg = dialog.querySelector<HTMLImageElement>("img[data-image-full]")!
    expect(fullImg.src).toBe("https://example.test/full.jpg")
    expect(fullImg.alt).toBe("Photo")

    element.closePreview()
    expect(dialog.open).toBe(false)
  })

  it("does not open preview when preview property is false", () => {
    const element = imageElement('<m-image src="https://example.test/photo.jpg" preview="false"></m-image>')
    expect(element.openPreview()).toBe(false)
    expect(element.querySelector("dialog")).toBeNull()
  })

  it("coordinates gallery preview across m-image-group", () => {
    document.body.innerHTML = `
      <m-image-group id="grp">
        <m-image src="https://example.test/1.jpg" alt="First"></m-image>
        <m-image src="https://example.test/2.jpg" alt="Second"></m-image>
      </m-image-group>
    `
    const group = document.querySelector("m-image-group") as ImageGroup
    expect(group.images).toHaveLength(2)

    expect(group.open(0)).toBe(true)
    expect(group.current).toBe(0)

    const dialog = group.querySelector("dialog.m-image-preview")!
    expect(dialog).not.toBeNull()
    expect(dialog.querySelector("[data-image-position]")?.textContent).toBe("Image 1 of 2")

    expect(group.next()).toBe(true)
    expect(group.current).toBe(1)
    expect(dialog.querySelector("[data-image-position]")?.textContent).toBe("Image 2 of 2")

    expect(group.prev()).toBe(true)
    expect(group.current).toBe(0)

    group.close()
    expect(dialog.open).toBe(false)
  })
})

