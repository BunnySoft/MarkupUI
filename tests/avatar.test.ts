import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { MuiAvatar, MuiAvatarGroup, registerAvatar } from "../src/components/avatar/index.js"

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

function avatar(markup: string): MuiAvatar {
  document.body.innerHTML = markup
  const element = document.querySelector("mui-avatar")
  if (!(element instanceof MuiAvatar)) throw new Error("Avatar was not upgraded")
  return element
}

describe("standalone Avatar", () => {
  it("adopts authored image and fallback nodes without discarding listeners", () => {
    const element = document.createElement("mui-avatar")
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
    expect(element.querySelector<HTMLElement>("[data-mui-avatar-content]")?.hidden).toBe(true)
  })

  it("handles source changes, native lazy loading and bounded fallback attempts", () => {
    const element = avatar('<mui-avatar src="/first.png" fallback-src="/fallback.png" lazy alt="Ada">A</mui-avatar>')
    const image = element.querySelector("img")!
    const error = vi.fn()
    element.addEventListener("mui:error", error)
    expect(image.getAttribute("loading")).toBe("lazy")
    image.dispatchEvent(new Event("error"))
    expect(image.getAttribute("src")).toBe("/fallback.png")
    expect(element.dataset.muiAvatarState).toBe("loading")
    image.dispatchEvent(new Event("error"))
    expect(element.dataset.muiAvatarState).toBe("error")
    expect(image.hidden).toBe(true)
    expect(error).toHaveBeenCalledTimes(2)
    element.src = "/second.png"
    expect(image.getAttribute("src")).toBe("/second.png")
    expect(element.dataset.muiAvatarState).toBe("loading")
    element.lazy = false
    expect(image.hasAttribute("loading")).toBe(false)
    element.removeAttribute("src")
    expect(image.hasAttribute("src")).toBe(false)
    expect(element.dataset.muiAvatarState).toBe("empty")
  })

  it("clones inert placeholder/fallback templates and changes visibility with state", () => {
    const element = avatar(`<mui-avatar src="/missing.png" alt="Ada">
      A
      <template data-mui-avatar-placeholder><span>Loading</span></template>
      <template data-mui-avatar-fallback><strong>Unavailable</strong></template>
    </mui-avatar>`)
    const placeholder = element.querySelector<HTMLElement>(":scope > span[data-mui-avatar-placeholder]")!
    const fallback = element.querySelector<HTMLElement>(":scope > span[data-mui-avatar-fallback]")!
    expect(placeholder.textContent).toBe("Loading")
    expect(placeholder.hidden).toBe(false)
    expect(fallback.hidden).toBe(true)
    element.querySelector("img")!.dispatchEvent(new Event("error"))
    expect(placeholder.hidden).toBe(true)
    expect(fallback.hidden).toBe(false)
    expect(element.querySelectorAll("template")).toHaveLength(2)
  })

  it("adopts late content and preserves explicit accessibility labels", async () => {
    const element = avatar('<mui-avatar aria-label="Profile"></mui-avatar>')
    const content = document.createElement("span")
    content.textContent = "Ada"
    element.append(content)
    await Promise.resolve()
    expect(element.querySelector("[data-mui-avatar-content]")?.contains(content)).toBe(true)
    expect(element.getAttribute("aria-label")).toBe("Profile")
    element.alt = "New image description"
    expect(element.getAttribute("aria-label")).toBe("Profile")
  })

  it("removes listeners while detached and restores them without duplication", () => {
    const element = avatar('<mui-avatar src="/ada.png">A</mui-avatar>')
    const image = element.querySelector("img")!
    const load = vi.fn()
    element.addEventListener("mui:load", load)
    element.remove()
    image.dispatchEvent(new Event("load"))
    expect(load).not.toHaveBeenCalled()
    document.body.append(element)
    image.dispatchEvent(new Event("load"))
    expect(load).toHaveBeenCalledOnce()
    expect(element.querySelectorAll("img")).toHaveLength(1)
  })

  it("restores authored loading behavior after reconnection", () => {
    const element = avatar('<mui-avatar lazy><img src="/ada.png" alt="Ada" loading="eager"></mui-avatar>')
    const image = element.querySelector("img")!
    expect(image.getAttribute("loading")).toBe("lazy")
    element.remove()
    document.body.append(element)
    element.lazy = false
    expect(image.getAttribute("loading")).toBe("eager")
  })

  it("reconciles an image that failed while disconnected", () => {
    const element = avatar('<mui-avatar src="/bad.png"><template data-mui-avatar-fallback><span>Fallback</span></template></mui-avatar>')
    const image = element.querySelector("img")!
    element.remove()
    Object.defineProperty(image, "complete", { configurable: true, value: true })
    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 0 })
    document.body.append(element)
    expect(element.dataset.muiAvatarState).toBe("error")
    expect(element.querySelector<HTMLElement>(":scope > span[data-mui-avatar-fallback]")?.hidden).toBe(false)
  })

  it("observes authored image updates without retrying a failed fallback indefinitely", async () => {
    const element = avatar('<mui-avatar fallback-src="/fallback.png"><img src="/first.png" alt="First">A</mui-avatar>')
    const image = element.querySelector("img")!
    image.dispatchEvent(new Event("error"))
    await Promise.resolve()
    expect(image.getAttribute("src")).toBe("/fallback.png")
    image.dispatchEvent(new Event("error"))
    await Promise.resolve()
    expect(element.dataset.muiAvatarState).toBe("error")
    image.src = "/second.png"
    image.alt = "Second"
    await Promise.resolve()
    expect(element.dataset.muiAvatarState).toBe("loading")
    expect(element.getAttribute("aria-label")).toBe("Second")
    image.dispatchEvent(new Event("error"))
    expect(image.getAttribute("src")).toBe("/fallback.png")
  })

  it("honors properties assigned before element upgrade", () => {
    const element = document.createElement("mui-avatar-preupgrade")
    Object.assign(element, { src: "/preupgrade.png", alt: "Ada", lazy: true })
    document.body.append(element)
    customElements.define("mui-avatar-preupgrade", class extends MuiAvatar {})
    expect(element.querySelector("img")?.getAttribute("src")).toBe("/preupgrade.png")
    expect(element.querySelector("img")?.getAttribute("loading")).toBe("lazy")
    expect(element.getAttribute("aria-label")).toBe("Ada")
  })

  it("uses bounded numeric CSS values and preserves source-free text", () => {
    const element = avatar('<mui-avatar alt="Ada" size="48" object-fit="contain">AB</mui-avatar>')
    expect(element.style.getPropertyValue("--mui-avatar-size")).toBe("48px")
    expect(element.style.getPropertyValue("--mui-avatar-object-fit")).toBe("contain")
    element.size = "large"
    expect(element.style.getPropertyValue("--mui-avatar-size")).toBe("")
    expect(element.textContent).toBe("AB")
    expect(element.dataset.muiAvatarState).toBe("empty")
  })

  it("preserves authored size and fit tokens across upgrade, source changes and reconnect", () => {
    const element = avatar('<mui-avatar style="--mui-avatar-size:60px;--mui-avatar-object-fit:contain">AB</mui-avatar>')
    element.alt = "Ada"
    element.remove()
    document.body.append(element)
    expect(element.style.getPropertyValue("--mui-avatar-size")).toBe("60px")
    expect(element.style.getPropertyValue("--mui-avatar-object-fit")).toBe("contain")
    // JSDOM drops custom-property priorities; verify the native API passthrough here.
    vi.spyOn(element.style, "getPropertyPriority").mockReturnValue("important")
    const write = vi.spyOn(element.style, "setProperty")
    element.size = 52
    element.setAttribute("object-fit", "cover")
    expect(element.style.getPropertyValue("--mui-avatar-size")).toBe("52px")
    element.size = "large"
    element.removeAttribute("object-fit")
    expect(element.style.getPropertyValue("--mui-avatar-size")).toBe("60px")
    expect(element.style.getPropertyValue("--mui-avatar-object-fit")).toBe("contain")
    expect(write).toHaveBeenCalledWith("--mui-avatar-size", "60px", "important")
    expect(write).toHaveBeenCalledWith("--mui-avatar-object-fit", "contain", "important")
    element.size = 48
    element.style.setProperty("--mui-avatar-size", "64px")
    element.size = "medium"
    expect(element.style.getPropertyValue("--mui-avatar-size")).toBe("64px")
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

  describe("audited default Avatar styles", () => {
    const css = readFileSync("src/components/avatar/avatar.css", "utf8")
    const legacy = readFileSync("src/components/styles.css", "utf8")
    it("keeps the native and canonical legacy defaults aligned to the pinned light reference", () => {
      for (const source of [css, legacy]) {
        const compact = source.replace(/\s+/g, "")
        expect(compact).toContain("box-sizing:content-box")
        expect(compact).toContain("var(--mui-avatar-size,34px)")
        expect(compact).toContain("border-radius:var(--mui-avatar-radius,3px)")
        expect(compact).toContain("var(--mui-avatar-default-background,#ccc)")
        expect(compact).toContain("color:var(--mui-avatar-color,#fff)")
        expect(compact).toContain("font-size:var(--mui-avatar-font-size,14px)")
        expect(compact).toContain("font-weight:inherit")
        expect(compact).toContain("object-fit:var(--mui-avatar-object-fit,fill)")
        expect(compact).toContain("border:2pxsolidvar(--mui-avatar-border-color")
        expect(compact).toContain("--mui-avatar-default-background:#424245")
        expect(compact).toContain("--mui-avatar-default-border:#18181c")
        for (const [size, pixels] of [["tiny", 22], ["small", 28], ["medium", 34], ["large", 40], ["huge", 46]]) {
          expect(compact).toContain(`mui-avatar[size="${size}"]{--mui-avatar-size:${pixels}px`)
        }
      }
    })
    it("uses real group borders, reference overlap, bounded text and native focus", () => {
      expect(css).toContain("var(--mui-avatar-overlap, -12px)")
      expect(css).not.toContain("outline: 2px solid var(--mui-avatar-group-background")
      expect(css).toContain("line-height: 1.25")
      expect(css).toContain("text-overflow: ellipsis")
      expect(css).toContain("summary:focus-visible")
      expect(css).toContain("@media (prefers-reduced-motion: reduce)")
    })
  })
})

describe("Avatar group", () => {
  it("uses a native details overflow while preserving avatar identity", () => {
    document.body.innerHTML = '<mui-avatar-group max="1" label="Team"><mui-avatar>A</mui-avatar><mui-avatar>B</mui-avatar><mui-avatar>C</mui-avatar></mui-avatar-group>'
    const group = document.querySelector("mui-avatar-group")
    if (!(group instanceof MuiAvatarGroup)) throw new Error("Group was not upgraded")
    const avatars = [...group.querySelectorAll("mui-avatar")]
    expect(group.querySelectorAll(":scope > mui-avatar")).toHaveLength(1)
    expect(group.querySelector("summary")?.textContent).toBe("+2")
    expect(group.querySelectorAll("[data-mui-avatar-rest] > mui-avatar")).toHaveLength(2)
    expect(group.getAttribute("aria-label")).toBe("Team")
    group.max = 2
    expect(group.querySelectorAll(":scope > mui-avatar")).toHaveLength(2)
    group.removeAttribute("max")
    expect(group.querySelector("details")).toBeNull()
    expect([...group.querySelectorAll("mui-avatar")]).toEqual(avatars)
  })

  it("updates appended avatars without duplicate overflow controls", async () => {
    document.body.innerHTML = '<mui-avatar-group max="0"><mui-avatar>A</mui-avatar></mui-avatar-group>'
    const group = document.querySelector("mui-avatar-group")!
    group.append(document.createElement("mui-avatar"))
    await Promise.resolve()
    expect(group.querySelectorAll("details")).toHaveLength(1)
    expect(group.querySelector("summary")?.textContent).toBe("+2")
  })

  it("preserves order when adding or removing overflow items", async () => {
    document.body.innerHTML = '<mui-avatar-group max="1"><mui-avatar>A</mui-avatar><mui-avatar>B</mui-avatar></mui-avatar-group>'
    const group = document.querySelector("mui-avatar-group")!
    const added = document.createElement("mui-avatar")
    added.textContent = "C"
    group.append(added)
    await Promise.resolve()
    expect([...group.querySelectorAll("mui-avatar")].map(item => item.textContent)).toEqual(["A", "B", "C"])
    group.querySelector("[data-mui-avatar-rest] > mui-avatar")!.remove()
    await Promise.resolve()
    expect(group.querySelector("summary")?.textContent).toBe("+1")
  })

  it("recreates overflow after authored children are replaced", async () => {
    document.body.innerHTML = '<mui-avatar-group max="1"><mui-avatar>A</mui-avatar><mui-avatar>B</mui-avatar></mui-avatar-group>'
    const group = document.querySelector("mui-avatar-group")!
    group.innerHTML = "<mui-avatar>C</mui-avatar><mui-avatar>D</mui-avatar>"
    await Promise.resolve()
    expect([...group.querySelectorAll("mui-avatar")].map(item => item.textContent)).toEqual(["C", "D"])
    expect(group.querySelector("summary")?.textContent).toBe("+1")
    group.append(document.createElement("mui-avatar"))
    await Promise.resolve()
    expect(group.querySelector("summary")?.textContent).toBe("+2")
  })

  it("replays max assigned before group upgrade", () => {
    const group = document.createElement("mui-avatar-group-preupgrade")
    group.innerHTML = "<mui-avatar>A</mui-avatar><mui-avatar>B</mui-avatar>"
    Object.assign(group, { max: 1 })
    document.body.append(group)
    customElements.define("mui-avatar-group-preupgrade", class extends MuiAvatarGroup {})
    expect(group.querySelector("summary")?.textContent).toBe("+1")
    Object.assign(group, { max: 2 })
    expect(group.querySelector("details")).toBeNull()
    expect(group.hasAttribute("max")).toBe(true)
  })
})
