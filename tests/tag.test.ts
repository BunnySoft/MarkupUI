import { afterEach, describe, expect, it, vi } from "vitest"
import { MTag, registerTag } from "../src/components/tag/index.js"
import type { TagCloseDetail } from "../src/components/tag/index.js"
import { registerElements } from "../src/components/elements.js"

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

function tag(markup = "<m-tag>Topic</m-tag>"): MTag {
  document.body.innerHTML = markup
  const element = document.querySelector("m-tag")
  if (!(element instanceof MTag)) throw new Error("Tag was not upgraded")
  return element
}
function close(element: MTag): HTMLButtonElement {
  return element.querySelector<HTMLButtonElement>("[data-m-tag-close]")!
}

describe("standalone Tag", () => {
  it("keeps the decorative vector close glyph stable across visual state changes", () => {
    const element = tag("<m-tag closable>Topic</m-tag>")
    const button = close(element)
    const icon = button.querySelector("svg")
    for (const [name, value] of [["size", "tiny"], ["type", "warning"], ["round", ""], ["strong", ""], ["bordered", "false"]]) {
      element.setAttribute(name!, value!)
    }
    element.disabled = true
    element.disabled = false
    expect(close(element)).toBe(button)
    expect(button.querySelector("svg")).toBe(icon)
    expect(icon?.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(element.querySelector("[style], style")).toBeNull()
  })

  it("treats SVG close descendants as native close intent without host activation", () => {
    const element = tag("<m-tag closable>Topic</m-tag>")
    const intent = vi.fn()
    const hostClick = vi.fn()
    element.addEventListener("m:close", intent)
    element.addEventListener("click", hostClick)
    const path = close(element).querySelector("path")!
    const event = new MouseEvent("click", { bubbles: true, cancelable: true })
    path.dispatchEvent(event)
    expect(intent).toHaveBeenCalledOnce()
    expect(intent.mock.calls[0]![0].detail.originalEvent).toBe(event)
    expect(hostClick).not.toHaveBeenCalled()
    element.disabled = true
    path.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    expect(intent).toHaveBeenCalledOnce()
  })

  it("uses a passive native span and preserves authored nodes and listeners", () => {
    const element = document.createElement("m-tag") as MTag
    const label = document.createElement("strong")
    label.textContent = "Topic"
    const listener = vi.fn()
    label.addEventListener("click", listener)
    element.append(label)
    document.body.append(element)
    expect(element.contentElement?.localName).toBe("span")
    expect(element.contentElement?.firstChild).toBe(label)
    expect(element.control).toBeNull()
    expect(element.hasAttribute("role") || element.hasAttribute("tabindex")).toBe(false)
    label.click()
    expect(listener).toHaveBeenCalledOnce()
  })

  it("adopts an authored content span and leaves templates inert", () => {
    const element = tag('<m-tag><span data-m-tag-content><strong>Label</strong></span><template><button>Inert</button></template></m-tag>')
    expect(element.contentElement?.firstElementChild?.localName).toBe("strong")
    expect(element.querySelector("template")?.parentElement).toBe(element)
    expect(element.querySelector("button")).toBeNull()
    element.checkable = true
    expect(element.querySelectorAll("button")).toHaveLength(1)
    expect(element.querySelector("template")?.parentElement).toBe(element)
  })

  it("uses a native aria-pressed toggle and emits the new boolean once", () => {
    const element = tag("<m-tag checkable>Topic</m-tag>")
    const changes = vi.fn()
    element.addEventListener("m:change", changes)
    expect(element.control?.type).toBe("button")
    expect(element.control?.getAttribute("aria-pressed")).toBe("false")
    element.click()
    expect(element.checked).toBe(true)
    expect(element.control?.getAttribute("aria-pressed")).toBe("true")
    expect(changes).toHaveBeenCalledOnce()
    expect(changes.mock.calls[0]![0].detail).toBe(true)
    element.control!.click()
    expect(changes).toHaveBeenCalledTimes(2)
    expect(changes.mock.calls[1]![0].detail).toBe(false)
    expect(element.checked).toBe(false)
  })

  it("keeps programmatic assignments and attribute changes silent", () => {
    const element = tag("<m-tag checkable>Topic</m-tag>")
    const change = vi.fn()
    element.addEventListener("m:change", change)
    element.checked = true
    element.removeAttribute("checked")
    element.setAttribute("checked", "")
    expect(element.control?.getAttribute("aria-pressed")).toBe("true")
    expect(change).not.toHaveBeenCalled()
  })

  it("does not synthesize keyboard activation or cancel native defaults", () => {
    const element = tag("<m-tag checkable>Topic</m-tag>")
    const changes = vi.fn()
    element.addEventListener("m:change", changes)
    for (const key of ["Enter", " "]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
      element.control!.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(changes).not.toHaveBeenCalled()
  })

  it("honors click cancellation before toggle handling", () => {
    const element = tag("<m-tag checkable>Topic</m-tag>")
    element.addEventListener("click", (event) => event.preventDefault(), { capture: true })
    element.click()
    expect(element.checked).toBe(false)
  })

  it("adopts an authored native button without nesting or losing its listeners", () => {
    const element = document.createElement("m-tag") as MTag
    element.checkable = true
    const native = document.createElement("button")
    native.type = "submit"
    native.textContent = "Topic"
    const click = vi.fn()
    native.addEventListener("click", click)
    element.append(native)
    document.body.append(element)
    expect(element.control).toBe(native)
    expect(element.querySelectorAll("button")).toHaveLength(1)
    expect(native.type).toBe("button")
    native.click()
    expect(click).toHaveBeenCalledOnce()
    expect(element.checked).toBe(true)
    element.checkable = false
    expect(element.control).toBe(native)
    expect(native.type).toBe("submit")
    expect(native.hasAttribute("aria-pressed")).toBe(false)
  })

  it("adopts a late authored button and moves prior generated label nodes into it", async () => {
    const element = tag("<m-tag checkable><strong>Original</strong></m-tag>")
    const original = element.querySelector("strong")
    const native = document.createElement("button")
    native.textContent = "New"
    element.append(native)
    await Promise.resolve()
    expect(element.control).toBe(native)
    expect(element.querySelectorAll("button")).toHaveLength(1)
    expect(native.contains(original)).toBe(true)
    expect(native.textContent).toBe("OriginalNew")
  })

  it("rejects interactive label descendants before generating a nested button root", () => {
    const element = document.createElement("m-tag") as MTag
    element.innerHTML = '<span><a href="#topic">Topic</a></span>'
    element.checkable = true
    expect(() => element.connectedCallback()).toThrow("Checkable Tag labels must be noninteractive")
    expect(element.querySelector("[data-m-tag-toggle]")).toBeNull()
    expect(element.querySelector("a")?.getAttribute("href")).toBe("#topic")
    element.disconnectedCallback()
  })

  it("switches generated checkable/passive modes without replacing icon/avatar/content nodes", () => {
    const element = tag('<m-tag><span data-m-tag-avatar aria-hidden="true"><img alt="" src="avatar.png"></span><span data-m-tag-icon aria-hidden="true">+</span><strong>Label</strong></m-tag>')
    const nodes = [...element.contentElement!.childNodes]
    for (let i = 0; i < 3; i++) {
      element.checkable = true
      expect(element.querySelectorAll("button")).toHaveLength(1)
      expect([...element.contentElement!.childNodes]).toEqual(nodes)
      element.checkable = false
      expect(element.querySelector("button")).toBeNull()
      expect([...element.contentElement!.childNodes]).toEqual(nodes)
    }
  })

  it("blocks disabled native, programmatic and synthetic descendant activation", () => {
    const element = tag("<m-tag checkable disabled><span>Topic</span></m-tag>")
    const change = vi.fn()
    const click = vi.fn()
    element.addEventListener("m:change", change)
    element.control!.addEventListener("click", click)
    expect(element.control!.disabled).toBe(true)
    expect(element.control!.tabIndex).toBe(-1)
    element.click()
    const event = new MouseEvent("click", { bubbles: true, cancelable: true })
    element.contentElement!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(change).not.toHaveBeenCalled()
    expect(click).not.toHaveBeenCalled()
    element.disabled = false
    element.click()
    expect(change).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
  })

  it("restores authored disabled/type/ARIA/tab order and observes native changes", async () => {
    const element = tag('<m-tag checkable disabled aria-label="Override"><button type="reset" aria-pressed="mixed" aria-label="Original" tabindex="2">Topic</button></m-tag>')
    const native = element.control!
    native.type = "submit"
    native.setAttribute("aria-label", "Updated")
    await Promise.resolve()
    expect(native.type).toBe("button")
    expect(native.getAttribute("aria-label")).toBe("Override")
    element.disabled = false
    element.removeAttribute("aria-label")
    element.checkable = false
    expect(native.type).toBe("submit")
    expect(native.getAttribute("aria-pressed")).toBe("mixed")
    expect(native.getAttribute("aria-label")).toBe("Updated")
    expect(native.tabIndex).toBe(2)
    expect(native.disabled).toBe(false)
  })

  it("retains authored disabled state after host state is removed", () => {
    const element = tag('<m-tag checkable disabled><button disabled>Topic</button></m-tag>')
    element.disabled = false
    expect(element.control!.disabled).toBe(true)
    element.checkable = false
    expect(element.control!.disabled).toBe(true)
  })

  it("delegates focus to the native checkable control without a host tab stop", () => {
    const element = tag("<m-tag checkable>Topic</m-tag>")
    element.focus()
    expect(document.activeElement).toBe(element.control)
    expect(element.hasAttribute("tabindex")).toBe(false)
    element.blur()
    expect(document.activeElement).not.toBe(element.control)
    element.disabled = true
    element.focus()
    expect(document.activeElement).not.toBe(element.control)
  })

  it("emits a cancellable bubbling close intent without removing or hiding the tag", () => {
    const element = tag("<m-tag closable>Topic</m-tag>")
    const intent = vi.fn((event: Event) => event.preventDefault())
    const click = vi.fn()
    element.addEventListener("m:close", intent)
    element.addEventListener("click", click)
    close(element).click()
    expect(intent).toHaveBeenCalledOnce()
    const event = intent.mock.calls[0]![0] as CustomEvent<TagCloseDetail>
    expect(event.bubbles && event.cancelable && event.defaultPrevented).toBe(true)
    expect(event.detail.originalEvent.target).toBe(close(element))
    expect(click).not.toHaveBeenCalled()
    expect(element.isConnected && !element.hidden).toBe(true)
  })

  it("allows native close click propagation only when explicitly requested", () => {
    const element = tag("<m-tag closable>Topic</m-tag>")
    const click = vi.fn()
    element.addEventListener("click", click)
    element.triggerClickOnClose = true
    close(element).click()
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.calls[0]![0].target).toBe(close(element))
    element.triggerClickOnClose = false
    close(element).click()
    expect(click).toHaveBeenCalledOnce()
  })

  it("suppresses close in checkable mode, without nesting interactive roots", () => {
    const element = tag("<m-tag checkable closable>Topic</m-tag>")
    expect(element.querySelector("[data-m-tag-close]")).toBeNull()
    expect(element.querySelectorAll("button")).toHaveLength(1)
    element.click()
    expect(element.checked).toBe(true)
    element.checkable = false
    expect(element.querySelector("[data-m-tag-toggle]")).toBeNull()
    expect(element.querySelectorAll("button")).toHaveLength(1)
    expect(close(element).parentElement).toBe(element)
    close(element).click()
    expect(element.checked).toBe(true)
  })

  it("does not inadvertently toggle when close intent changes the tag into checkable mode", () => {
    const element = tag("<m-tag closable trigger-click-on-close>Topic</m-tag>")
    element.addEventListener("m:close", () => { element.checkable = true })
    const change = vi.fn()
    element.addEventListener("m:change", change)
    close(element).click()
    expect(element.checkable).toBe(true)
    expect(element.checked).toBe(false)
    expect(change).not.toHaveBeenCalled()
  })

  it("provides a native close name with dynamic localization and disabled state", () => {
    const element = tag("<m-tag closable disabled>Topic</m-tag>")
    const intent = vi.fn()
    element.addEventListener("m:close", intent)
    expect(close(element).type).toBe("button")
    expect(close(element).getAttribute("aria-label")).toBe("Remove tag")
    const icon = close(element).querySelector("svg")
    expect(icon?.getAttribute("aria-hidden")).toBe("true")
    expect(icon?.getAttribute("focusable")).toBe("false")
    expect(icon?.getAttribute("viewBox")).toBe("0 0 12 12")
    expect(icon?.querySelector("path")?.getAttribute("stroke")).toBe("currentColor")
    close(element).click()
    expect(intent).not.toHaveBeenCalled()
    element.closeLabel = "Remove topic"
    element.disabled = false
    expect(close(element).getAttribute("aria-label")).toBe("Remove topic")
    close(element).click()
    expect(intent).toHaveBeenCalledOnce()
    element.closeLabel = " "
    expect(close(element).getAttribute("aria-label")).toBe("Remove tag")
  })

  it("never submits forms through checkable/close controls and honors disabled fieldsets", () => {
    const element = tag("<form><fieldset disabled><m-tag checkable>Topic</m-tag></fieldset><m-tag closable>Other</m-tag></form>")
    const submit = vi.fn((event: Event) => event.preventDefault())
    document.querySelector("form")!.addEventListener("submit", submit)
    element.click()
    expect(element.checked).toBe(false)
    expect(element.control!.hasAttribute("tabindex")).toBe(false)
    document.querySelector("fieldset")!.disabled = false
    element.click()
    expect(element.checked).toBe(true)
    close(document.querySelectorAll("m-tag")[1] as MTag).click()
    expect(submit).not.toHaveBeenCalled()
  })

  it("cleans up observers and listeners while disconnected and reconnects once", async () => {
    const element = tag("<m-tag checkable>Topic</m-tag>")
    const native = element.control!
    const label = element.contentElement!
    const changes = vi.fn()
    element.addEventListener("m:change", changes)
    element.remove()
    native.click()
    element.checked = true
    await Promise.resolve()
    expect(changes).not.toHaveBeenCalled()
    expect(native.getAttribute("aria-pressed")).toBe("false")
    document.body.append(element)
    expect(element.control).toBe(native)
    expect(element.contentElement).toBe(label)
    expect(native.getAttribute("aria-pressed")).toBe("true")
    native.click()
    expect(changes).toHaveBeenCalledOnce()
  })

  it("removes stale close listeners after toggling closable and disconnecting", () => {
    const element = tag("<m-tag closable>Topic</m-tag>")
    const native = close(element)
    const intent = vi.fn()
    element.addEventListener("m:close", intent)
    element.remove()
    native.click()
    expect(intent).not.toHaveBeenCalled()
    document.body.append(element)
    native.click()
    expect(intent).toHaveBeenCalledOnce()
    element.closable = false
    native.click()
    expect(intent).toHaveBeenCalledOnce()
  })

  it("handles replaced/late content without resurrecting discarded nodes", async () => {
    const element = tag("<m-tag checkable><strong>Old</strong></m-tag>")
    const old = element.control!
    element.innerHTML = "<em>New</em>"
    await Promise.resolve()
    expect(element.control).not.toBe(old)
    expect(element.querySelectorAll("button")).toHaveLength(1)
    expect(element.textContent).toBe("New")
    element.append(" late")
    await Promise.resolve()
    expect(element.contentElement!.textContent).toBe("New late")
    expect(old.hasAttribute("data-m-tag-toggle")).toBe(false)
  })

  it("upgrades reflected properties before definition without fabricating changes", () => {
    document.body.innerHTML = "<test-late-tag>Late</test-late-tag>"
    const element = document.querySelector("test-late-tag") as MTag
    const changes = vi.fn()
    element.addEventListener("m:change", changes)
    Object.assign(element, { checkable: true, checked: true, disabled: true, closable: true, type: "info", size: "large", round: true, strong: true, bordered: false, closeLabel: "Dismiss", triggerClickOnClose: true })
    customElements.define("test-late-tag", class extends MTag {})
    expect(element.control?.getAttribute("aria-pressed")).toBe("true")
    expect(element.control?.disabled).toBe(true)
    expect(element.round && element.strong && element.triggerClickOnClose).toBe(true)
    expect(element.type).toBe("info")
    expect(element.size).toBe("large")
    expect(element.bordered).toBe(false)
    expect(element.closeLabel).toBe("Dismiss")
    expect(changes).not.toHaveBeenCalled()
  })

  it("keeps runtime styles external and rejects conflicting registration", () => {
    const element = tag("<m-tag round strong type=primary>Topic</m-tag>")
    expect(element.shadowRoot).toBeNull()
    expect(document.querySelector("style,[style]")).toBeNull()
    expect(() => registerTag()).not.toThrow()
    const define = vi.fn()
    expect(() => registerTag({ get: () => class extends HTMLElement {}, define })).toThrow("before the legacy MarkupUI bundle")
    expect(define).not.toHaveBeenCalled()
  })

  it("retains rich registration when the aggregate is registered afterward", () => {
    registerElements(customElements)
    expect(customElements.get("m-tag")).toBe(MTag)
    const element = tag("<m-tag closable>Topic</m-tag>")
    expect(element.querySelector(":scope > [data-m-close]")).not.toBeNull()
  })
})
