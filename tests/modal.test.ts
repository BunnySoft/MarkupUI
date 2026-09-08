import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createModal, createModalOwner } from "../src/components/modal/index.js"
import { createNativeDialog } from "../src/components/dialog/native.js"
import type { ModalController, ModalOptions } from "../src/components/modal/index.js"

const handles: { dispose(): void }[] = []
const proto = HTMLDialogElement.prototype
const names = ["showModal", "show", "close", "requestClose"] as const
const descriptors = new Map<string, PropertyDescriptor | undefined>()
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() }
const tick = async () => { await new Promise(resolve => setTimeout(resolve, 5)) }
function fixture() {
  const root = document.createElement("div")
  root.innerHTML = `<button type="button" data-opener>Open</button><dialog class="mui-native-dialog mui-modal" aria-label="Project information"><h2 data-modal-title>Project information</h2><p data-modal-content>Authored content</p><form method="dialog"><label>Reference <input required name="reference"></label><button value="saved">Save</button><button value="cancelled" formnovalidate>Cancel</button></form></dialog>`
  document.body.append(root)
  return root.querySelector("dialog")!
}
function enhance(options: ModalOptions = {}, dialog = fixture()) {
  const c = createModal(dialog, options); handles.push(c); return c
}
function template() {
  const t = document.createElement("template")
  const d = fixture(); t.content.append(d); return t
}
function owner() {
  const root = document.createElement("div"); document.body.append(root)
  const o = createModalOwner(root); handles.push(o); return { root, o }
}
beforeEach(() => {
  for (const name of names) descriptors.set(name, Object.getOwnPropertyDescriptor(proto, name))
  for (const name of ["showModal", "show"]) Object.defineProperty(proto, name, {
    configurable: true, value(this: HTMLDialogElement) { this.open = true },
  })
  Object.defineProperty(proto, "close", {
    configurable: true, value(this: HTMLDialogElement, result?: string) {
      if (!this.open) return
      if (result !== undefined) this.returnValue = result
      this.open = false
      this.dispatchEvent(new Event("close"))
    },
  })
  Reflect.deleteProperty(proto, "requestClose")
})
afterEach(() => {
  for (const handle of handles.splice(0)) handle.dispose()
  document.body.replaceChildren()
  document.body.removeAttribute("style")
  document.documentElement.removeAttribute("style")
  vi.restoreAllMocks()
  for (const name of names) {
    const descriptor = descriptors.get(name)
    if (descriptor) Object.defineProperty(proto, name, descriptor)
    else Reflect.deleteProperty(proto, name)
  }
})

describe("Generic native Modal", () => {
  it("packages only native lifetime, without decisions, dependencies or legacy registrations", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    const source = readFileSync(resolve("src", "components", "modal", "modal.ts"), "utf8")
    expect(pkg.exports["./modal"].import).toBe("./dist/markup-ui-modal.js")
    expect(pkg.exports["./modal/style.css"]).toBe("./dist/markup-ui-modal.css")
    expect(pkg.dependencies).toEqual({})
    expect(source).toContain("../dialog/native.js")
    expect(source).not.toContain("../dialog/dialog.js")
    expect(source).not.toContain("createDialog(")
    expect(customElements.get("mui-modal")).toBeUndefined()
  })
  it("keeps native content, headings, description and form nodes untouched", () => {
    const d = fixture()
    const heading = d.querySelector("h2")!; heading.id = "modal-title"
    const content = d.querySelector("p")!; content.id = "modal-description"
    d.removeAttribute("aria-label")
    d.setAttribute("aria-labelledby", heading.id); d.setAttribute("aria-describedby", content.id)
    const html = d.innerHTML
    const c = enhance({}, d); c.showModal()
    expect(c.mode).toBe("modal")
    expect(d.innerHTML).toBe(html)
    expect(d.querySelector("h2")).toBe(heading)
    expect(d.hasAttribute("aria-modal")).toBe(false)
    expect(d.hasAttribute("role")).toBe(false)
    expect(d.style.cssText).toBe("")
  })
  it("preserves authored Card-intent regions/classes without preset prop forwarding", () => {
    const d = fixture()
    const card = document.createElement("article")
    card.innerHTML = `<header data-modal-header class="author-header"><h2>Authored card</h2><span class="author-extra">Extra information</span></header><figure><img width="20" height="20" alt="Authored cover"></figure><section class="author-content">Content</section><footer data-modal-footer class="author-footer"><a href="#details">Details</a></footer>`
    d.append(card)
    const children = [...card.querySelectorAll("*")]
    const html = card.outerHTML
    const c = enhance({}, d); c.showModal(); c.close()
    expect(card.outerHTML).toBe(html)
    expect([...card.querySelectorAll("*")]).toEqual(children)
    expect(d.querySelector("mui-card")).toBeNull()
  })
  it("returns actual open mode and preserves values across close/reopen", () => {
    const c = enhance(); const input = c.dialog.querySelector("input")!
    input.value = "persisted"
    expect(c.showModal()).toBe("modal")
    c.close("saved")
    expect(c.dialog.returnValue).toBe("saved")
    expect(c.mode).toBe("closed")
    c.showModal()
    expect(c.dialog.returnValue).toBe("")
    expect(input.value).toBe("persisted")
  })
  it("requires close before changing native modal/modeless modes", () => {
    const c = enhance(); c.show()
    expect(c.mode).toBe("modeless")
    expect(() => c.showModal()).toThrow(/Close/)
    c.close(); c.showModal()
    expect(() => c.show()).toThrow(/Close/)
    c.close(); expect(c.show()).toBe("modeless")
  })
  it("adopts a visible native baseline without silently upgrading or hiding it", () => {
    const d = fixture(); d.open = true
    const c = enhance({}, d)
    expect(c.mode).toBe("modeless")
    expect(() => c.showModal()).toThrow(/Close/)
    expect(d.open).toBe(true)
  })
  it("does not silently degrade unsupported modality", () => {
    Reflect.deleteProperty(proto, "showModal")
    const c = enhance()
    expect(c.supportsModal).toBe(false)
    expect(() => c.showModal()).toThrow(/unavailable/)
    expect(c.dialog.open).toBe(false)
    expect(c.show()).toBe("modeless")
    expect(c.dialog.hasAttribute("aria-modal")).toBe(false)
  })
  it("supports an explicitly requested inline alternative when native methods are absent", () => {
    for (const name of names) Reflect.deleteProperty(proto, name)
    const c = enhance()
    expect(() => c.showModal()).toThrow(/unavailable/)
    expect(c.show()).toBe("inline")
    expect(c.dialog.hasAttribute("data-native-dialog-inline")).toBe(true)
    c.requestClose("inline")
    expect(c.dialog.open).toBe(false)
    expect(c.dialog.returnValue).toBe("inline")
  })
  it.each(["preset", "render", "style", "autoFocus", "trapFocus", "blockScroll", "onClose"])("rejects incompatible framework %s options instead of ignoring them", name => {
    expect(() => enhance({ [name]: false } as ModalOptions)).toThrow(/framework/)
  })
  it("requires named light-DOM dialog ownership without false ARIA", () => {
    const d = fixture(); d.removeAttribute("aria-label")
    expect(() => enhance({}, d)).toThrow(/Name/)
    d.setAttribute("aria-label", "Named"); d.setAttribute("aria-modal", "true")
    expect(() => enhance({}, d)).toThrow(/aria-modal/)
    d.removeAttribute("aria-modal")
    const host = document.createElement("div"); document.body.append(host)
    host.attachShadow({ mode: "open" }).append(d)
    expect(() => enhance({}, d)).toThrow(/light-DOM/)
  })
  it("retains an explicit valid role and rejects double-light-dismiss policy", () => {
    const d = fixture(); d.setAttribute("role", "alertdialog")
    const c = enhance({}, d)
    expect(d.getAttribute("role")).toBe("alertdialog")
    c.dispose(); d.setAttribute("closedby", "any")
    expect(() => enhance({}, d)).toThrow(/closedby/)
  })
  it("preserves native cancel veto and observable close/returnValue", () => {
    const c = enhance(); c.showModal()
    const cancel = (event: Event) => event.preventDefault()
    c.dialog.addEventListener("cancel", cancel)
    c.requestClose("vetoed")
    expect(c.dialog.open).toBe(true)
    c.dialog.removeEventListener("cancel", cancel)
    const closed = vi.fn(); c.dialog.addEventListener("close", closed)
    c.requestClose("accepted")
    expect(c.dialog.returnValue).toBe("accepted")
    expect(closed).toHaveBeenCalledTimes(1)
  })
  it("uses native requestClose exactly once where available", () => {
    const c = enhance(); c.showModal()
    const request = vi.fn(); Object.defineProperty(c.dialog, "requestClose", { value: request })
    c.requestClose("native")
    expect(request).toHaveBeenCalledExactlyOnceWith("native")
  })
  it("guards platform Escape separately from explicit native requests", () => {
    const c = enhance({ closeOnEsc: false }); c.showModal()
    expect(c.dialog.dispatchEvent(new Event("cancel", { cancelable: true }))).toBe(false)
    c.requestClose("explicit")
    expect(c.dialog.open).toBe(false)
  })
  it("does not intercept form validation, submit or business action clicks", async () => {
    const c = enhance(); c.showModal()
    const form = c.dialog.querySelector("form")!
    expect(form.checkValidity()).toBe(false)
    expect(form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))).toBe(true)
    const b = document.createElement("button"); b.type = "button"; b.dataset.dialogAction = "positive"; c.dialog.append(b)
    b.click(); await tick()
    expect(c.dialog.open).toBe(true)
    expect(form.method).toBe("dialog")
    expect(form.querySelector("button")!.type).toBe("submit")
    expect(c.dialog.hasAttribute("aria-busy")).toBe(false)
  })
  it("does not write scroll locking, body styles, inert or page aria-hidden", () => {
    document.body.style.cssText = "overflow: scroll; padding-right: 11px"
    document.documentElement.style.cssText = "overflow: auto"
    const before = document.body.style.cssText
    const c = enhance(); c.showModal()
    expect(document.body.style.cssText).toBe(before)
    document.body.style.overflow = "clip"
    c.dispose()
    expect(document.body.style.overflow).toBe("clip")
    expect(document.documentElement.style.overflow).toBe("auto")
    expect(document.querySelector("[inert], [aria-hidden=true]")).toBeNull()
  })
  it("shares one per-element owner with the independent Dialog primitive", () => {
    const c = enhance()
    expect(() => createNativeDialog(c.dialog)).toThrow(/owner/)
    c.dispose()
    const other = createNativeDialog(c.dialog); handles.push(other); other.showModal()
    c.dispose()
    expect(other.dialog.open).toBe(true)
  })
  it("restores a connected opener, not a removed or independently focused control", () => {
    const c = enhance()
    const opener = c.dialog.parentElement!.querySelector<HTMLButtonElement>("[data-opener]")!
    c.showModal(opener); c.dialog.querySelector("input")!.focus(); c.close()
    expect(document.activeElement).toBe(opener)
    c.showModal(opener); opener.remove(); c.dialog.querySelector("input")!.focus(); c.close()
    expect(document.activeElement).not.toBe(opener)
  })
  it("observes direct native close/reopen generations and ignores old close events", async () => {
    const c = enhance(); c.showModal(); const generation = c.generation
    c.dialog.close(); c.dialog.showModal(); await flush()
    expect(c.generation).toBeGreaterThan(generation)
    c.dialog.dispatchEvent(new Event("close"))
    expect(c.dialog.open).toBe(true)
  })
  it("allows independently nested ownership without closing the other dialog", () => {
    const a = enhance(); const d = fixture(); a.dialog.append(d)
    const b = enhance({}, d); a.showModal(); b.showModal()
    b.close("child")
    expect(a.dialog.open).toBe(true)
    expect(b.dialog.open).toBe(false)
  })
  it("rebinds ancestor observation after reparent/close and releases removal", async () => {
    const c = enhance(); c.showModal()
    const root = document.createElement("div"); document.body.append(root); root.append(c.dialog); c.close()
    await flush(); root.remove(); await flush()
    expect(c.connected).toBe(false)
    expect(() => c.showModal()).toThrow(/disposed/)
  })
  it("preserves a reentrant inline reopen and prevents reopening during disposal", () => {
    for (const name of names) Reflect.deleteProperty(proto, name)
    const c = enhance(); c.show()
    c.dialog.addEventListener("close", () => c.show(), { once: true })
    c.close()
    expect(c.mode).toBe("inline")
    let blocked = false
    c.dialog.addEventListener("close", () => { try { c.show() } catch { blocked = true } }, { once: true })
    c.dispose()
    expect(blocked).toBe(true)
    expect(c.dialog.open).toBe(false)
  })
  it("does not invent a transition completion after a cancelled native opening", () => {
    const c = enhance()
    vi.spyOn(c.dialog, "showModal").mockImplementation(() => {
      if (c.dialog.dispatchEvent(new Event("beforetoggle", { cancelable: true }))) c.dialog.open = true
    })
    c.dialog.addEventListener("beforetoggle", event => event.preventDefault())
    expect(c.showModal()).toBe("closed")
  })
})

describe("Native backdrop policy shared with Modal", () => {
  function pointer(c: ModalController, type: string, x: number, init: { id?: number; primary?: boolean; button?: number } = {}) {
    const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: x, button: init.button ?? 0 })
    Object.defineProperties(e, { pointerId: { value: init.id ?? 1 }, isPrimary: { value: init.primary ?? true } })
    c.dialog.dispatchEvent(e); return e
  }
  function setup(backdropDismiss = true) {
    const c = enhance({ backdropDismiss }); c.showModal()
    vi.spyOn(c.dialog, "getBoundingClientRect").mockReturnValue({ left: 10, top: 10, right: 100, bottom: 100 } as DOMRect)
    return c
  }
  it("preserves padding, inside-outside drag, secondary and mismatched pointers", async () => {
    const c = setup()
    pointer(c, "pointerdown", 11); pointer(c, "pointerup", 11)
    pointer(c, "pointerdown", 11); pointer(c, "pointerup", 0)
    pointer(c, "pointerdown", 0, { button: 2 }); pointer(c, "pointerup", 0)
    pointer(c, "pointerdown", 0); pointer(c, "pointerup", 0, { id: 2 })
    await tick(); expect(c.dialog.open).toBe(true)
  })
  it("dismisses only eligible opt-in outside pointer activation", async () => {
    const c = setup()
    pointer(c, "pointerdown", 0); pointer(c, "pointerup", 0)
    await tick(); expect(c.dialog.open).toBe(false)
    const off = setup(false)
    pointer(off, "pointerdown", 0); pointer(off, "pointerup", 0)
    await tick(); expect(off.dialog.open).toBe(true)
  })
  it("respects pointer and custom request cancellation", async () => {
    const c = setup()
    pointer(c, "pointerdown", 0); pointer(c, "pointerup", 0).preventDefault()
    await tick(); expect(c.dialog.open).toBe(true)
    c.dialog.addEventListener("mui:native-dialog-backdrop", event => event.preventDefault())
    pointer(c, "pointerdown", 0); pointer(c, "pointerup", 0)
    await tick(); expect(c.dialog.open).toBe(true)
  })
  it("cancels late backdrop work across close/reopen and removal", async () => {
    const c = setup()
    pointer(c, "pointerdown", 0); pointer(c, "pointerup", 0); c.close(); c.showModal()
    await tick(); expect(c.dialog.open).toBe(true)
    pointer(c, "pointerdown", 0); pointer(c, "pointerup", 0); c.dialog.parentElement!.remove()
    await flush(); const html = c.dialog.outerHTML
    await tick()
    expect(c.connected).toBe(false)
    expect(c.dialog.outerHTML).toBe(html)
  })
})

describe("Explicit native template ownership", () => {
  it("owns independent clones with text-only values and no implicit decisions", () => {
    const { o } = owner(); const source = template(); const html = source.innerHTML
    const a = o.create(source, { title: "<b>Literal</b>", content: "New text" })
    const b = o.create(source, { mode: "modeless" })
    expect(source.innerHTML).toBe(html)
    expect(a.dialog.querySelector("h2")!.textContent).toBe("<b>Literal</b>")
    expect(a.dialog.querySelector("h2 b")).toBeNull()
    expect(b.mode).toBe("modeless")
    expect(a.dialog.querySelectorAll("button")).toHaveLength(2)
    expect(o.modals).toHaveLength(2)
  })
  it("preserves closed clone handles for reopen until explicit disposal", () => {
    const { o } = owner(); const c = o.create(template())
    c.close(); expect(o.modals).toContain(c)
    c.showModal(); c.dispose(); c.dispose()
    expect(c.dialog.isConnected).toBe(false)
    expect(o.modals).toHaveLength(0)
  })
  it("destroyAll is scoped and reverse-owned, not a page-wide closer", () => {
    const { o } = owner(); const a = o.create(template()); const b = o.create(template())
    const independent = enhance(); independent.showModal()
    const order: string[] = []
    a.dialog.addEventListener("mui:native-dialog-dispose", () => order.push("a"))
    b.dialog.addEventListener("mui:native-dialog-dispose", () => order.push("b"))
    o.destroyAll()
    expect(order).toEqual(["b", "a"])
    expect(independent.dialog.open).toBe(true)
  })
  it("tears down retained clones by current opening order, not original creation order", () => {
    const { o } = owner(); const a = o.create(template()); a.close(); const b = o.create(template()); b.close()
    b.showModal(); a.showModal()
    const order: string[] = []
    a.dialog.addEventListener("mui:native-dialog-dispose", () => order.push("a"))
    b.dialog.addEventListener("mui:native-dialog-dispose", () => order.push("b"))
    o.destroyAll()
    expect(order).toEqual(["a", "b"])
  })
  it("cleans externally removed clones/roots and cannot create from a disconnected owner", async () => {
    const { o, root } = owner(); const c = o.create(template())
    root.remove(); await flush()
    expect(o.modals).toHaveLength(0)
    expect(c.connected).toBe(false)
    expect(() => o.create(template())).toThrow(/unavailable/)
  })
  it("blocks reentrant creation during collection teardown", () => {
    const { o } = owner(); const source = template(); const c = o.create(source)
    let blocked = false
    c.dialog.addEventListener("mui:native-dialog-dispose", () => { try { o.create(source) } catch { blocked = true } })
    o.dispose()
    expect(blocked).toBe(true)
    expect(o.modals).toHaveLength(0)
  })
  it("registers before native focus can dispose the opening owner", () => {
    const { o } = owner()
    vi.spyOn(proto, "showModal").mockImplementation(function (this: HTMLDialogElement) { this.open = true; o.dispose() })
    expect(() => o.create(template())).toThrow(/interrupted/)
    expect(o.modals).toHaveLength(0)
  })
  it("cleans failed modal creation without silently opening modeless content", () => {
    Reflect.deleteProperty(proto, "showModal")
    const { o, root } = owner()
    expect(() => o.create(template())).toThrow(/unavailable/)
    expect(o.modals).toHaveLength(0)
    expect(root.querySelector("dialog")).toBeNull()
    expect(o.create(template(), { mode: "modeless" }).mode).toBe("modeless")
  })
  it("rejects duplicate IDs, rich replacements and executable template elements", () => {
    const { o } = owner(); const source = template(); source.content.querySelector("h2")!.id = "unique"
    o.create(source); expect(() => o.create(source)).toThrow(/unique/)
    const rich = template(); rich.content.querySelector("p")!.append(document.createElement("input"))
    expect(() => o.create(rich, { content: "No" })).toThrow(/text-only/)
    for (const tag of ["script", "style", "iframe", "object", "embed"]) {
      const t = template(); t.content.querySelector("dialog")!.append(document.createElement(tag))
      expect(() => o.create(t)).toThrow(/executable/)
    }
  })
  it("rejects false mode names, detached owners and unapproved props", () => {
    expect(() => createModalOwner(document.createElement("div"))).toThrow(/connected/)
    const { o } = owner()
    expect(() => o.create(template(), { mode: "inline" as never })).toThrow(/explicitly/)
    expect(() => o.create(template(), { render: () => "html" } as never)).toThrow(/framework/)
  })
  it("ships composed external CSS with no application scroll-lock selectors or transition machinery", () => {
    const css = readFileSync(resolve("src", "components", "modal", "modal.css"), "utf8")
    const build = readFileSync(resolve("scripts", "build.mjs"), "utf8")
    expect(build).toContain('name === "dialog" || name === "modal"')
    expect(css).toContain("data-modal-placement")
    expect(css).toContain("data-modal-backdrop")
    expect(css).toContain("forced-colors")
    expect(css).toContain("prefers-reduced-motion")
    expect(css).toContain("@media print")
    expect(css).not.toContain(":has(")
    expect(css).not.toContain("@keyframes")
  })
})
