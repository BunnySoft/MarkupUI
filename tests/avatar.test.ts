import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { createContext, runInContext } from "node:vm"
import { gzipSync } from "node:zlib"
import { Avatar, AvatarGroup, AvatarPlaceholder, AvatarFallback, registerAvatar } from "../src/components/avatar/index.js"
import { ViewElement } from "../src/core/index.js"
import * as coreApi from "../src/core/index.js"
import * as avatarApi from "../src/components/avatar/index.js"
import { builtInElementNames, registerElements } from "../src/components/elements.js"

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function avatar(markup: string): Avatar {
  document.body.innerHTML = markup
  const element = document.querySelector("m-avatar")
  if (!(element instanceof Avatar)) throw new Error("Avatar was not upgraded")
  return element
}

describe("ViewElement direct DOM API", () => {
  it("registers only explicit tags and has no metadata or decorator API", () => {
    class Untagged extends Avatar {}
    const registry = { get: vi.fn(), define: vi.fn() }
    expect(() => ViewElement.register([Avatar, Untagged], registry)).toThrow("own m-* tag")
    expect(() => ViewElement.register([Avatar, Avatar], registry)).toThrow("Duplicate element")
    expect(registry.define).not.toHaveBeenCalled()
    expect(Object.keys(coreApi)).toEqual(["ViewElement"])
    expect("meta" in Avatar).toBe(false)
    expect("AvatarDefinition" in avatarApi).toBe(false)
  })

  it("uses direct defaults, encodings and event dispatch without metadata", () => {
    class DirectValues extends ViewElement {
      public static readonly tag = "m-direct-values"
      public get enabled(): boolean { return this.booleanAttribute("enabled", true) }
      public set enabled(value: boolean) { this.setBooleanAttribute("enabled", value, false) }
      public get busy(): boolean { return this.hasAttribute("busy") }
      public set busy(value: boolean) { this.setBooleanAttribute("busy", value) }
      public get mode(): "a" | "b" { return this.choiceAttribute("mode", ["a", "b"], "a") }
      public set mode(value: "a" | "b") { this.setChoiceAttribute("mode", value, ["a", "b"]) }
      public request(): boolean { return this.emit("m:requested", null, { cancelable: true, composed: true }) }
    }
    ViewElement.register([DirectValues])
    const value = document.createElement("m-direct-values")
    if (!(value instanceof DirectValues)) throw new Error("Direct values did not upgrade.")
    document.body.append(value)
    const listener = vi.fn((event: Event) => event.preventDefault())
    value.addEventListener("m:requested", listener)
    expect(value.enabled).toBe(true)
    value.enabled = false
    expect(value.getAttribute("enabled")).toBe("false")
    value.removeAttribute("enabled")
    expect(value.enabled).toBe(true)
    value.setAttribute("busy", "false")
    expect(value.busy).toBe(true)
    value.busy = false
    expect(value.hasAttribute("busy")).toBe(false)
    expect(value.mode).toBe("a")
    value.mode = "b"
    expect(() => Reflect.set(value, "mode", "other")).toThrow(RangeError)
    expect(value.mode).toBe("b")
    expect(listener).not.toHaveBeenCalled()
    expect(value.request()).toBe(false)
    expect(listener.mock.calls[0]![0].composed).toBe(true)
    value.setAttribute("enabled", "maybe")
    expect(() => value.enabled).toThrow(RangeError)
  })

  it("rejects invalid or nonconfigurable pre-upgrade values without silently losing them", () => {
    class UpgradeProbe extends ViewElement {
      public static readonly tag = "m-upgrade-probe"
      public get label(): string | null { return this.getAttribute("label") }
      public set label(value: string | null) { this.setStringAttribute("label", value) }
      public get state(): "ready" { return "ready" }
      public initialize(): void { this.upgradeProperties() }
    }
    ViewElement.register([UpgradeProbe])
    const invalid = document.createElement("m-upgrade-probe")
    const fixed = document.createElement("m-upgrade-probe")
    if (!(invalid instanceof UpgradeProbe) || !(fixed instanceof UpgradeProbe)) throw new Error("Upgrade probe did not register.")
    Object.defineProperty(invalid, "label", { value: 42, configurable: true })
    expect(() => invalid.initialize()).toThrow(RangeError)
    expect(Object.getOwnPropertyDescriptor(invalid, "label")?.value).toBe(42)
    Object.defineProperty(invalid, "label", { value: "Ada", configurable: true })
    invalid.initialize()
    expect(Object.hasOwn(invalid, "label")).toBe(false)
    expect(invalid.label).toBe("Ada")
    Object.defineProperty(fixed, "label", { value: "Grace", configurable: false })
    expect(() => fixed.initialize()).toThrow("Cannot remove own property")
    Object.defineProperty(invalid, "state", { value: "ready", configurable: true })
    expect(() => invalid.initialize()).toThrow("read-only property")
  })
})

describe("modular Avatar distribution", () => {
  it("loads only the core and Avatar family without a metadata runtime", () => {
    const registered = new Map<string, unknown>()
    const context = createContext({
      HTMLElement,
      customElements: {
        get(name: string) { return registered.get(name) },
        define(name: string, constructor: unknown) { registered.set(name, constructor) },
      },
    })
    const core = readFileSync("dist/markup-ui-core.global.js", "utf8")
    const component = readFileSync("dist/markup-ui-avatar.global.js", "utf8")
    runInContext(core, context)
    expect(registered.size).toBe(0)
    runInContext(component, context)
    expect([...registered.keys()]).toEqual(["m-avatar", "m-avatar-group", "m-avatar-placeholder", "m-avatar-fallback"])
    expect(runInContext("MarkupUIAvatar.Avatar.prototype instanceof MarkupUICore.ViewElement", context)).toBe(true)
    expect(runInContext("'meta' in MarkupUIAvatar.Avatar", context)).toBe(false)
    expect(core).not.toContain("collectElementMeta")
    expect(component).not.toContain("__decorate")
    expect(runInContext("'ViewElement' in MarkupUIAvatar", context)).toBe(false)
    expect(() => runInContext(core, context)).toThrow("already defined")
  })

  it("reports a missing shared core before registering a component", () => {
    const define = vi.fn()
    const context = createContext({ HTMLElement, customElements: { get: vi.fn(), define } })
    expect(() => runInContext(readFileSync("dist/markup-ui-avatar.global.js", "utf8"), context)).toThrow("Load compatible markup-ui-core.global.js")
    expect(define).not.toHaveBeenCalled()
  })

  it("publishes the core entry and accounts for required runtime files as well as CSS", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./core"]).toEqual({
      types: "./dist/core/index.d.ts", import: "./dist/markup-ui-core.js",
    })
    expect(readFileSync("dist/markup-ui-avatar.js", "utf8")).toContain("./markup-ui-core.js")
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    for (const [mode, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      const core = `markup-ui-core${suffix}`
      const component = `markup-ui-avatar${suffix}`
      const payload = manifest.componentPayloads.avatar[mode!]
      const coreBytes = gzipSync(readFileSync(`dist/${core}`), { level: 9 }).length
      const componentBytes = gzipSync(readFileSync(`dist/${component}`), { level: 9 }).length
      expect(payload.dependencies).toEqual([core])
      expect(payload.runtimeGzipBytes).toBe(coreBytes + componentBytes)
      expect(payload.runtimeBudget).toBe(8500)
      expect(payload.runtimeGzipBytes).toBeLessThanOrEqual(payload.runtimeBudget)
      expect(payload.totalGzipBytes).toBe(payload.runtimeGzipBytes + manifest.bundles["markup-ui-avatar.css"].gzipBytes)
    }
  })
})

describe("standalone Avatar", () => {
  it("adopts authored image and fallback nodes without discarding listeners", () => {
    const element = document.createElement("m-avatar")
    const image = document.createElement("img")
    image.src = "/ada.png"
    image.alt = "Ada"
    const text = document.createElement("span")
    text.textContent = "A"
    const click = vi.fn()
    text.addEventListener("click", click)
    element.append(image, text)
    document.body.append(element)
    expect(element.querySelector("img")).toBe(image)
    expect(element.contains(text)).toBe(true)
    text.click()
    expect(click).toHaveBeenCalledOnce()
    expect(element.getAttribute("aria-label")).toBe("Ada")
    image.dispatchEvent(new Event("load"))
    expect(image.hidden).toBe(false)
    expect(element.querySelector<HTMLElement>("[data-part=content]")?.hidden).toBe(true)
  })

  it("handles source changes, native lazy loading and bounded fallback attempts", () => {
    const element = avatar('<m-avatar src="/first.png" fallback-src="/fallback.png" loading="lazy" label="Ada">A</m-avatar>')
    const image = element.querySelector("img")!
    const error = vi.fn()
    element.addEventListener("m:error", error)
    expect(image.getAttribute("loading")).toBe("lazy")
    image.dispatchEvent(new Event("error"))
    expect(image.getAttribute("src")).toBe("/fallback.png")
    expect(element.dataset.state).toBe("loading")
    image.dispatchEvent(new Event("error"))
    expect(element.dataset.state).toBe("error")
    expect(image.hidden).toBe(true)
    expect(error).toHaveBeenCalledTimes(2)
    element.src = "/second.png"
    expect(image.getAttribute("src")).toBe("/second.png")
    expect(element.dataset.state).toBe("loading")
    element.removeAttribute("loading")
    expect(image.hasAttribute("loading")).toBe(false)
    element.removeAttribute("src")
    expect(image.hasAttribute("src")).toBe(false)
    expect(element.dataset.state).toBe("empty")
  })

  it("clones inert placeholder/fallback templates and changes visibility with state", () => {
    const element = avatar(`<m-avatar src="/missing.png" label="Ada">
      A
      <m-avatar-placeholder><template><span>Loading</span></template></m-avatar-placeholder>
      <m-avatar-fallback><template><strong>Unavailable</strong></template></m-avatar-fallback>
    </m-avatar>`)
    const placeholder = element.querySelector<HTMLElement>(":scope > m-avatar-placeholder")!
    const fallback = element.querySelector<HTMLElement>(":scope > m-avatar-fallback")!
    expect(placeholder).toBeInstanceOf(AvatarPlaceholder)
    expect(fallback).toBeInstanceOf(AvatarFallback)
    expect(placeholder.dataset.part).toBe("placeholder")
    expect(fallback.dataset.part).toBe("fallback")
    expect(placeholder.textContent).toBe("Loading")
    expect(placeholder.hidden).toBe(false)
    expect(fallback.hidden).toBe(true)
    element.querySelector("img")!.dispatchEvent(new Event("error"))
    expect(placeholder.hidden).toBe(true)
    expect(fallback.hidden).toBe(false)
    expect(element.querySelectorAll("template")).toHaveLength(2)
  })

  it("adopts late content and preserves explicit accessibility labels", async () => {
    const element = avatar('<m-avatar aria-label="Profile"></m-avatar>')
    const content = document.createElement("span")
    content.textContent = "Ada"
    element.append(content)
    await Promise.resolve()
    expect(element.querySelector("[data-part=content]")?.contains(content)).toBe(true)
    expect(element.getAttribute("aria-label")).toBe("Profile")
    element.label = "New image description"
    expect(element.getAttribute("aria-label")).toBe("Profile")
  })

  it("removes listeners while detached and restores them without duplication", () => {
    const element = avatar('<m-avatar src="/ada.png">A</m-avatar>')
    const image = element.querySelector("img")!
    const load = vi.fn()
    element.addEventListener("m:load", load)
    element.remove()
    image.dispatchEvent(new Event("load"))
    expect(load).not.toHaveBeenCalled()
    document.body.append(element)
    image.dispatchEvent(new Event("load"))
    expect(load).toHaveBeenCalledOnce()
    expect(element.querySelectorAll("img")).toHaveLength(1)
  })

  it("restores authored loading behavior after reconnection", () => {
    const element = avatar('<m-avatar loading="lazy"><img src="/ada.png" alt="Ada" loading="eager"></m-avatar>')
    const image = element.querySelector("img")!
    expect(image.getAttribute("loading")).toBe("lazy")
    element.remove()
    document.body.append(element)
    element.removeAttribute("loading")
    expect(image.getAttribute("loading")).toBe("eager")
  })

  it("reconciles an image that failed while disconnected", () => {
    const element = avatar('<m-avatar src="/bad.png"><m-avatar-fallback><span>Fallback</span></m-avatar-fallback></m-avatar>')
    const image = element.querySelector("img")!
    element.remove()
    Object.defineProperty(image, "complete", { configurable: true, value: true })
    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 0 })
    document.body.append(element)
    expect(element.dataset.state).toBe("error")
    expect(element.querySelector<HTMLElement>(":scope > m-avatar-fallback")?.hidden).toBe(false)
  })

  it("observes authored image updates without retrying a failed fallback indefinitely", async () => {
    const element = avatar('<m-avatar fallback-src="/fallback.png"><img src="/first.png" alt="First">A</m-avatar>')
    const image = element.querySelector("img")!
    image.dispatchEvent(new Event("error"))
    await Promise.resolve()
    expect(image.getAttribute("src")).toBe("/fallback.png")
    image.dispatchEvent(new Event("error"))
    await Promise.resolve()
    expect(element.dataset.state).toBe("error")
    image.src = "/second.png"
    image.alt = "Second"
    await Promise.resolve()
    expect(element.dataset.state).toBe("loading")
    expect(element.getAttribute("aria-label")).toBe("Second")
    image.dispatchEvent(new Event("error"))
    expect(image.getAttribute("src")).toBe("/fallback.png")
  })

  it("honors properties assigned before element upgrade", () => {
    const element = document.createElement("m-avatar-preupgrade")
    Object.assign(element, { src: "/preupgrade.png", label: "Ada", loading: "lazy", shape: "circle", imageFit: "cover", bordered: true, size: 48 })
    document.body.append(element)
    customElements.define("m-avatar-preupgrade", class extends Avatar {})
    expect(element.querySelector("img")?.getAttribute("src")).toBe("/preupgrade.png")
    expect(element.querySelector("img")?.getAttribute("loading")).toBe("lazy")
    expect(element.getAttribute("aria-label")).toBe("Ada")
    expect(element.getAttribute("shape")).toBe("circle")
    expect(element.getAttribute("bordered")).toBe("")
    expect(element.style.getPropertyValue("--m-avatar-size")).toBe("48px")
  })

  it("uses bounded numeric CSS values and preserves source-free text", () => {
    const element = avatar('<m-avatar label="Ada" size="48" image-fit="contain">AB</m-avatar>')
    expect(element.style.getPropertyValue("--m-avatar-size")).toBe("48px")
    expect(element.style.getPropertyValue("--m-avatar-object-fit")).toBe("contain")
    element.size = "large"
    expect(element.style.getPropertyValue("--m-avatar-size")).toBe("")
    expect(element.textContent).toBe("AB")
    expect(element.dataset.state).toBe("empty")
  })

  it("preserves authored size and fit tokens across upgrade, source changes and reconnect", () => {
    const element = avatar('<m-avatar style="--m-avatar-size:60px;--m-avatar-object-fit:contain">AB</m-avatar>')
    element.label = "Ada"
    element.remove()
    document.body.append(element)
    expect(element.style.getPropertyValue("--m-avatar-size")).toBe("60px")
    expect(element.style.getPropertyValue("--m-avatar-object-fit")).toBe("contain")
    // JSDOM drops custom-property priorities; verify the native API passthrough here.
    vi.spyOn(element.style, "getPropertyPriority").mockImplementation((name) =>
      ["60px", "contain"].includes(element.style.getPropertyValue(name)) ? "important" : "")
    const write = vi.spyOn(element.style, "setProperty")
    element.size = 52
    element.setAttribute("image-fit", "cover")
    expect(element.style.getPropertyValue("--m-avatar-size")).toBe("52px")
    element.size = "large"
    element.removeAttribute("image-fit")
    expect(element.style.getPropertyValue("--m-avatar-size")).toBe("60px")
    expect(element.style.getPropertyValue("--m-avatar-object-fit")).toBe("contain")
    expect(write).toHaveBeenCalledWith("--m-avatar-size", "60px", "important")
    expect(write).toHaveBeenCalledWith("--m-avatar-object-fit", "contain", "important")
    element.size = 48
    element.style.setProperty("--m-avatar-size", "64px")
    element.size = "medium"
    expect(element.style.getPropertyValue("--m-avatar-size")).toBe("64px")
  })

  it("registers idempotently and reports conflicts instead of claiming an upgrade", () => {
    expect(() => registerAvatar()).not.toThrow()
    const registry = {
      get: () => class extends HTMLElement {},
      define: vi.fn(),
    }
    expect(() => registerAvatar(registry)).toThrow("already defined")
    expect(registry.define).not.toHaveBeenCalled()
  })

  it("exposes typed defaults and rejects invalid property values without replacing content", () => {
    const element = avatar("<m-avatar>Ada</m-avatar>")
    const content = element.firstChild
    expect(element).toBeInstanceOf(ViewElement)
    expect(Avatar.tag).toBe("m-avatar")
    expect("definition" in Avatar).toBe(false)
    expect(element.src).toBeNull()
    expect(element.label).toBeNull()
    expect(element.shape).toBe("rounded")
    expect(element.size).toBe("medium")
    expect(element.imageFit).toBe("fill")
    expect(element.loading).toBe("eager")
    expect(() => { element.size = 0 }).toThrow(RangeError)
    expect(() => { element.size = Infinity }).toThrow(RangeError)
    expect(() => Reflect.set(element, "shape", "ellipse")).toThrow(RangeError)
    expect(() => Reflect.set(element, "loading", "later")).toThrow(RangeError)
    expect(() => Reflect.set(element, "imageFit", "crop")).toThrow(RangeError)
    element.shape = "square"
    element.bordered = true
    element.loading = "lazy"
    expect(element.firstChild).toBe(content)
    expect(element.dataset.state).toBe(element.state)
    expect(element.hasAttribute("data-m-avatar-state")).toBe(false)
    expect("alt" in element).toBe(false)
    expect("lazy" in element).toBe(false)
  })

  it("keeps logical labels separate from authored image names and supports decoration", () => {
    const element = avatar('<m-avatar><img src="/ada.png" alt="Authored name"></m-avatar>')
    const image = element.querySelector("img")!
    element.label = "Profile"
    expect(image.alt).toBe("Authored name")
    element.label = ""
    expect(element.getAttribute("aria-hidden")).toBe("true")
    element.label = null
    expect(element.getAttribute("aria-label")).toBe("Authored name")
    expect(element.hasAttribute("aria-hidden")).toBe(false)
  })

  it("updates decoration and semantics when an accessible name is authored later", async () => {
    const element = avatar("<m-avatar></m-avatar>")
    expect(element.getAttribute("aria-hidden")).toBe("true")
    element.setAttribute("aria-label", "Ada")
    await Promise.resolve()
    expect(element.hasAttribute("aria-hidden")).toBe(false)
    expect(element.getAttribute("role")).toBe("img")
    element.removeAttribute("aria-label")
    await Promise.resolve()
    expect(element.getAttribute("aria-hidden")).toBe("true")
    const label = document.createElement("span")
    label.id = "avatar-name"
    label.textContent = "Grace"
    document.body.append(label)
    element.setAttribute("aria-labelledby", label.id)
    await Promise.resolve()
    expect(element.hasAttribute("aria-hidden")).toBe(false)
    expect(element.getAttribute("role")).toBe("img")
  })

  it("does not retry an equivalent resolved fallback URL", () => {
    const element = avatar('<m-avatar src="/same.png">A</m-avatar>')
    const image = element.querySelector("img")!
    element.fallbackSrc = image.src
    const error = vi.fn()
    element.addEventListener("m:error", error)
    image.dispatchEvent(new Event("error"))
    expect(element.state).toBe("error")
    expect(error.mock.calls[0]![0].detail.fallback).toBe(false)
  })

  it("adopts named regions and instantiates their templates once across reconnection", async () => {
    const element = avatar('<m-avatar src="/ada.png">A</m-avatar>')
    const region = document.createElement("m-avatar-placeholder")
    const template = document.createElement("template")
    template.innerHTML = "<strong>Loading</strong>"
    region.append(template)
    element.append(region)
    await Promise.resolve()
    const content = region.querySelector("strong")
    element.remove()
    document.body.append(element)
    await Promise.resolve()
    expect(region.querySelectorAll("strong")).toHaveLength(1)
    expect(region.querySelector("strong")).toBe(content)
    expect(region.hidden).toBe(false)
  })

  it("settles cached success once and ignores detached-image or source-free notifications", async () => {
    const element = document.createElement("m-avatar") as Avatar
    const image = document.createElement("img")
    image.src = "/cached.png"
    Object.defineProperties(image, {
      complete: { configurable: true, value: true },
      naturalWidth: { configurable: true, value: 20 },
    })
    const load = vi.fn()
    element.addEventListener("m:load", load)
    element.append(image)
    document.body.append(element)
    expect(element.state).toBe("loaded")
    expect(load).toHaveBeenCalledOnce()
    element.remove()
    document.body.append(element)
    expect(load).toHaveBeenCalledOnce()
    image.remove()
    await Promise.resolve()
    image.dispatchEvent(new Event("error"))
    expect(element.state).toBe("empty")
    element.src = "/new.png"
    const generated = element.querySelector("img")!
    element.src = null
    generated.dispatchEvent(new Event("load"))
    expect(element.state).toBe("empty")
    expect(load).toHaveBeenCalledOnce()
  })

  it("keeps canonical registration independent of aggregate import order", () => {
    expect(builtInElementNames).not.toContain("m-avatar")
    for (const first of [true, false]) {
      const frame = document.createElement("iframe")
      document.body.append(frame)
      const registry = frame.contentWindow!.customElements
      if (first) registerAvatar(registry)
      registerElements(registry)
      registerAvatar(registry)
      expect(registry.get("m-avatar")).toBe(Avatar)
      expect(registry.get("m-avatar-group")).toBe(AvatarGroup)
      frame.remove()
    }
  })

  describe("audited default Avatar styles", () => {
    const css = readFileSync("src/components/avatar/avatar.css", "utf8")
    const legacy = readFileSync("src/components/styles.css", "utf8")
    it("keeps the native and canonical legacy defaults aligned to the pinned light reference", () => {
      for (const source of [css, legacy]) {
        const compact = source.replace(/\s+/g, "")
        expect(compact).toContain("box-sizing:content-box")
        expect(compact).toContain("var(--m-avatar-size,34px)")
        expect(compact).toContain("border-radius:var(--m-avatar-radius,3px)")
        expect(compact).toContain("var(--m-avatar-default-background,#ccc)")
        expect(compact).toContain("color:var(--m-avatar-color,#fff)")
        expect(compact).toContain("font-size:var(--m-avatar-font-size,14px)")
        expect(compact).toContain("font-weight:inherit")
        expect(compact).toContain("object-fit:var(--m-avatar-object-fit,fill)")
        expect(compact).toContain("border:2pxsolidvar(--m-avatar-border-color")
        expect(compact).toContain("--m-avatar-default-background:#424245")
        expect(compact).toContain("--m-avatar-default-border:#18181c")
        for (const [size, pixels] of [["tiny", 22], ["small", 28], ["medium", 34], ["large", 40], ["huge", 46]]) {
          expect(compact).toContain(`m-avatar[size="${size}"]{--m-avatar-size:${pixels}px`)
        }
      }
    })
    it("uses real group borders, reference overlap, natural-width fitted text and native focus", () => {
      expect(css).toContain("var(--m-avatar-overlap, -12px)")
      expect(css).not.toContain("outline: 2px solid var(--m-avatar-group-background")
      expect(css).toContain("line-height: 1.25")
      expect(css).toContain("inline-size: max-content")
      expect(css).toContain("scale(var(--m-avatar-text-scale, 1))")
      expect(css).not.toContain("text-overflow: ellipsis")
      expect(css).toContain("summary:focus-visible")
      expect(css).toContain("@media (prefers-reduced-motion: reduce)")
    })
  })
})

describe("Avatar text fitting", () => {
  function measure() {
    const observers: Array<{ notify: () => void; observe: ReturnType<typeof vi.fn>; unobserve: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }> = []
    vi.stubGlobal("ResizeObserver", class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      constructor(public notify: () => void) { observers.push(this) }
    })
    const dimensions = { textWidth: 65, textHeight: 18 }
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
      if (this.hidden) return 0
      if (this.matches("m-avatar")) return Number.parseFloat(this.style.getPropertyValue("--m-avatar-size")) || 34
      return this.textContent === "AB" ? 17 : dimensions.textWidth
    })
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
      if (this.hidden) return 0
      return this.matches("m-avatar") ? Number.parseFloat(this.style.getPropertyValue("--m-avatar-size")) || 34 : dimensions.textHeight
    })
    return { observers, dimensions }
  }
  const scale = (element: Element) => Number((element as HTMLElement).style.getPropertyValue("--m-avatar-text-scale"))

  it("fits initial natural text to 90% of the outer box without replacing nodes or author transforms", () => {
    const { observers } = measure()
    const element = document.createElement("m-avatar")
    const text = document.createElement("span")
    text.dataset.part = "content"
    text.textContent = "Alexandria"
    text.style.transform = "rotate(2deg)"
    const click = vi.fn()
    text.addEventListener("click", click)
    element.append(text)
    document.body.append(element)
    expect(scale(text)).toBe(34 / 65 * .9)
    expect(text.style.transform).toBe("rotate(2deg)")
    expect(element.firstElementChild).toBe(text)
    text.click()
    expect(click).toHaveBeenCalledOnce()
    expect(observers[0].observe).toHaveBeenCalledWith(element, { box: "border-box" })
    expect(observers[0].observe).toHaveBeenCalledWith(text)
  })

  it("refits character data and nested child replacement while keeping the full accessible label", async () => {
    measure()
    const element = avatar("<m-avatar><strong>Alexandria</strong></m-avatar>")
    const text = element.querySelector<HTMLElement>("[data-part=content]")!
    const strong = element.querySelector("strong")!
    expect(scale(text)).toBe(34 / 65 * .9)
    strong.firstChild!.nodeValue = "AB"
    await Promise.resolve()
    expect(scale(text)).toBe(1)
    expect(element.getAttribute("aria-label")).toBe("AB")
    strong.textContent = "Alexandria"
    await Promise.resolve()
    expect(scale(text)).toBe(34 / 65 * .9)
    expect(element.getAttribute("aria-label")).toBe("Alexandria")
    expect(element.querySelector("strong")).toBe(strong)
  })

  it("refits numeric sizes and resize/font changes using untransformed width and height", () => {
    const { observers, dimensions } = measure()
    const element = avatar("<m-avatar>Alexandria</m-avatar>")
    const text = element.querySelector("[data-part=content]")!
    element.size = 22
    expect(scale(text)).toBe(22 / 65 * .9)
    element.size = 100
    expect(scale(text)).toBe(1)
    dimensions.textWidth = 200
    observers[0].notify()
    expect(scale(text)).toBe(100 / 200 * .9)
    dimensions.textHeight = 300
    observers[0].notify()
    expect(scale(text)).toBe(100 / 300 * .9)
    const write = vi.spyOn((text as HTMLElement).style, "setProperty")
    observers[0].notify()
    expect(write).not.toHaveBeenCalled()
  })

  it("fits only visible content, then recalculates when placeholder, fallback or text is revealed", () => {
    const { dimensions } = measure()
    const element = avatar(`<m-avatar src="/missing.png">Alexandria
      <m-avatar-placeholder>Loading profile</m-avatar-placeholder>
      <m-avatar-fallback>Unavailable profile</m-avatar-fallback>
    </m-avatar>`)
    const content = element.querySelector<HTMLElement>("[data-part=content]")!
    const placeholder = element.querySelector<HTMLElement>("m-avatar-placeholder")!
    const fallback = element.querySelector<HTMLElement>("m-avatar-fallback")!
    expect(scale(placeholder)).toBe(34 / 65 * .9)
    expect(content.style.getPropertyValue("--m-avatar-text-scale")).toBe("")
    expect(fallback.style.getPropertyValue("--m-avatar-text-scale")).toBe("")
    dimensions.textWidth = 100
    element.querySelector("img")!.dispatchEvent(new Event("error"))
    expect(scale(fallback)).toBe(34 / 100 * .9)
    element.src = ""
    expect(content.hidden).toBe(false)
    expect(scale(content)).toBe(34 / 100 * .9)
  })

  it("unobserves replaced content and disconnects all measurements until reconnection", async () => {
    const { observers, dimensions } = measure()
    const element = avatar("<m-avatar>Alexandria</m-avatar>")
    const text = element.querySelector<HTMLElement>("[data-part=content]")!
    element.textContent = "AB"
    await Promise.resolve()
    expect(observers[0].unobserve).toHaveBeenCalledWith(text)
    const replacement = element.querySelector<HTMLElement>("[data-part=content]")!
    expect(scale(replacement)).toBe(1)
    element.remove()
    expect(observers[0].disconnect).toHaveBeenCalledOnce()
    replacement.textContent = "Alexandria"
    dimensions.textWidth = 100
    observers[0].notify()
    expect(scale(replacement)).toBe(1)
    document.body.append(element)
    expect(observers).toHaveLength(2)
    expect(scale(replacement)).toBe(34 / 100 * .9)
    expect(observers[1].observe).toHaveBeenCalledWith(replacement)
  })

  it("does not erase an authored size/fit override on unrelated synchronization", () => {
    measure()
    const element = avatar('<m-avatar size="52" image-fit="cover">Alexandria</m-avatar>')
    element.style.setProperty("--m-avatar-size", "60px")
    element.style.setProperty("--m-avatar-object-fit", "contain")
    element.label = "Profile"
    element.remove()
    document.body.append(element)
    expect(element.style.getPropertyValue("--m-avatar-size")).toBe("60px")
    expect(element.style.getPropertyValue("--m-avatar-object-fit")).toBe("contain")
    element.size = 48
    element.setAttribute("image-fit", "fill")
    element.removeAttribute("size")
    element.removeAttribute("image-fit")
    expect(element.style.getPropertyValue("--m-avatar-size")).toBe("60px")
    expect(element.style.getPropertyValue("--m-avatar-object-fit")).toBe("contain")
  })
})

describe("Avatar group", () => {
  it("uses null for an unlimited count and validates finite counts without coercion", () => {
    const group = document.createElement("m-avatar-group")
    if (!(group instanceof AvatarGroup)) throw new Error("Group did not upgrade.")
    expect(group.max).toBeNull()
    expect(AvatarGroup.tag).toBe("m-avatar-group")
    group.max = 2
    expect(() => { group.max = -1 }).toThrow(RangeError)
    expect(() => { group.max = 1.5 }).toThrow(RangeError)
    expect(() => { group.max = Infinity }).toThrow(RangeError)
    expect(group.max).toBe(2)
    group.max = null
    expect(group.hasAttribute("max")).toBe(false)
  })
  it("uses a native details overflow while preserving avatar identity", () => {
    document.body.innerHTML = '<m-avatar-group max="1" label="Team"><m-avatar>A</m-avatar><m-avatar>B</m-avatar><m-avatar>C</m-avatar></m-avatar-group>'
    const group = document.querySelector("m-avatar-group")
    if (!(group instanceof AvatarGroup)) throw new Error("Group was not upgraded")
    const avatars = [...group.querySelectorAll("m-avatar")]
    expect(group.querySelectorAll(":scope > m-avatar")).toHaveLength(1)
    expect(group.querySelector("summary")?.textContent).toBe("+2")
    expect(group.querySelectorAll("[data-part=rest] > m-avatar")).toHaveLength(2)
    expect(group.getAttribute("aria-label")).toBe("Team")
    group.max = 2
    expect(group.querySelectorAll(":scope > m-avatar")).toHaveLength(2)
    group.removeAttribute("max")
    expect(group.querySelector("details")).toBeNull()
    expect([...group.querySelectorAll("m-avatar")]).toEqual(avatars)
  })

  it("updates appended avatars without duplicate overflow controls", async () => {
    document.body.innerHTML = '<m-avatar-group max="0"><m-avatar>A</m-avatar></m-avatar-group>'
    const group = document.querySelector("m-avatar-group")!
    group.append(document.createElement("m-avatar"))
    await Promise.resolve()
    expect(group.querySelectorAll("details")).toHaveLength(1)
    expect(group.querySelector("summary")?.textContent).toBe("+2")
  })

  it("preserves order when adding or removing overflow items", async () => {
    document.body.innerHTML = '<m-avatar-group max="1"><m-avatar>A</m-avatar><m-avatar>B</m-avatar></m-avatar-group>'
    const group = document.querySelector("m-avatar-group")!
    const added = document.createElement("m-avatar")
    added.textContent = "C"
    group.append(added)
    await Promise.resolve()
    expect([...group.querySelectorAll("m-avatar")].map(item => item.textContent)).toEqual(["A", "B", "C"])
    group.querySelector("[data-part=rest] > m-avatar")!.remove()
    await Promise.resolve()
    expect(group.querySelector("summary")?.textContent).toBe("+1")
  })

  it("recreates overflow after authored children are replaced", async () => {
    document.body.innerHTML = '<m-avatar-group max="1"><m-avatar>A</m-avatar><m-avatar>B</m-avatar></m-avatar-group>'
    const group = document.querySelector("m-avatar-group")!
    group.innerHTML = "<m-avatar>C</m-avatar><m-avatar>D</m-avatar>"
    await Promise.resolve()
    expect([...group.querySelectorAll("m-avatar")].map(item => item.textContent)).toEqual(["C", "D"])
    expect(group.querySelector("summary")?.textContent).toBe("+1")
    group.append(document.createElement("m-avatar"))
    await Promise.resolve()
    expect(group.querySelector("summary")?.textContent).toBe("+2")
  })

  it("replays max assigned before group upgrade", () => {
    const group = document.createElement("m-avatar-group-preupgrade")
    group.innerHTML = "<m-avatar>A</m-avatar><m-avatar>B</m-avatar>"
    Object.assign(group, { max: 1, vertical: true, label: "Team", restLabel: "More people" })
    document.body.append(group)
    customElements.define("m-avatar-group-preupgrade", class extends AvatarGroup {})
    expect(group.querySelector("summary")?.textContent).toBe("+1")
    expect(group.querySelector("summary")?.getAttribute("aria-label")).toBe("More people")
    expect(group.getAttribute("aria-label")).toBe("Team")
    expect(group.hasAttribute("vertical")).toBe(true)
    Object.assign(group, { label: null })
    expect(group.hasAttribute("aria-label")).toBe(false)
    Object.assign(group, { max: 2 })
    expect(group.querySelector("details")).toBeNull()
    expect(group.hasAttribute("max")).toBe(true)
  })
})
