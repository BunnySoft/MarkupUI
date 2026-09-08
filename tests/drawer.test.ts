import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createDrawer, createDrawerOwner } from "../src/components/drawer/index.js"
import { createModal } from "../src/components/modal/index.js"
import { createNativeDialog } from "../src/components/dialog/native.js"
import type { DrawerController, DrawerOptions } from "../src/components/drawer/index.js"

const handles: { dispose(): void }[] = []
const proto = HTMLDialogElement.prototype
const names = ["showModal", "show", "close", "requestClose"] as const
const descriptors = new Map<string, PropertyDescriptor | undefined>()
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() }
const tick = async () => { await new Promise(resolve => setTimeout(resolve, 5)) }
function fixture() {
  const host = document.createElement("div")
  host.innerHTML = `<button data-opener type="button">Open</button><dialog class="mui-native-dialog mui-drawer" aria-label="Drawer details"><form class="mui-drawer-content" method="dialog"><header data-drawer-header><h3 data-drawer-title>Authored level three</h3></header><div data-drawer-body tabindex="0" aria-label="Details"><div data-drawer-body-content><label>Reference <input required name="reference"></label><p>Details</p></div></div><footer data-drawer-footer><button value="saved">Save</button><button value="closed" formnovalidate>Close</button><button value="cancelled" formnovalidate>Cancel</button></footer></form></dialog>`
  document.body.append(host)
  return host.querySelector("dialog")!
}
function enhance(options: DrawerOptions = {}, dialog = fixture()) {
  const c = createDrawer(dialog, options); handles.push(c); return c
}
function template() {
  const t = document.createElement("template"); t.content.append(fixture()); return t
}
function owner() {
  const root = document.createElement("div"); document.body.append(root)
  const o = createDrawerOwner(root); handles.push(o); return { root, o }
}
beforeEach(() => {
  for (const name of names) descriptors.set(name, Object.getOwnPropertyDescriptor(proto, name))
  for (const name of ["showModal", "show"]) Object.defineProperty(proto, name, {
    configurable: true, value(this: HTMLDialogElement) { this.open = true },
  })
  Object.defineProperty(proto, "close", { configurable: true, value(this: HTMLDialogElement, result?: string) {
    if (!this.open) return
    if (result !== undefined) this.returnValue = result
    this.open = false; this.dispatchEvent(new Event("close"))
  } })
  Reflect.deleteProperty(proto, "requestClose")
})
afterEach(() => {
  for (const handle of handles.splice(0)) handle.dispose()
  document.body.replaceChildren(); document.body.removeAttribute("style")
  vi.restoreAllMocks()
  for (const name of names) {
    const descriptor = descriptors.get(name)
    if (descriptor) Object.defineProperty(proto, name, descriptor)
    else Reflect.deleteProperty(proto, name)
  }
})

describe("Drawer and CSS-only DrawerContent", () => {
  it("ships optional native lifetime without Modal presentation, decisions or runtime dependencies", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    const source = readFileSync(resolve("src", "components", "drawer", "drawer.ts"), "utf8")
    expect(pkg.exports["./drawer"].import).toBe("./dist/markup-ui-drawer.js")
    expect(pkg.exports["./drawer/style.css"]).toBe("./dist/markup-ui-drawer.css")
    expect(pkg.dependencies).toEqual({})
    expect(source).toContain("../modal/modal.js")
    expect(source).not.toContain("dialog/dialog.js")
    expect(customElements.get("mui-drawer")).toBeUndefined()
    expect(customElements.get("mui-drawer-content")).toBeUndefined()
  })
  it("retains authored header/body/footer, heading level, listeners, descriptions and form values", () => {
    const d = fixture(); const heading = d.querySelector("h3")!; heading.id = "title"
    d.removeAttribute("aria-label"); d.setAttribute("aria-labelledby", heading.id)
    const body = d.querySelector("[data-drawer-body]")!; body.id = "description"
    d.setAttribute("aria-describedby", body.id)
    const html = d.innerHTML; const c = enhance({}, d)
    const clicked = vi.fn(); heading.addEventListener("click", clicked)
    c.showModal(); heading.click()
    expect(d.innerHTML).toBe(html)
    expect(d.querySelector("h3")).toBe(heading)
    expect(clicked).toHaveBeenCalledTimes(1)
    expect(d.querySelector("[role=heading], [aria-level], [role=complementary]")).toBeNull()
    expect(d.hasAttribute("aria-modal")).toBe(false)
    expect(d.style.cssText).toBe("")
  })
  it.each(["left", "right", "top", "bottom", "inline-start", "inline-end"])("accepts explicit %s placement without style writes", placement => {
    const d = fixture(); d.setAttribute("data-drawer-placement", placement)
    const c = enhance({}, d); c.showModal()
    expect(c.mode).toBe("modal")
    expect(d.getAttribute("data-drawer-placement")).toBe(placement)
    expect(d.style.cssText).toBe("")
  })
  it("rejects invalid/missing native anatomy and duplicate companion regions", () => {
    for (const fault of ["class", "body", "duplicate", "placement"]) {
      const d = fixture()
      if (fault === "class") d.classList.remove("mui-drawer")
      if (fault === "body") d.querySelector("[data-drawer-body]")!.remove()
      if (fault === "duplicate") d.firstElementChild!.append(d.querySelector("header")!.cloneNode(true))
      if (fault === "placement") d.setAttribute("data-drawer-placement", "center")
      expect(() => enhance({}, d)).toThrow()
    }
  })
  it("checks changed anatomy before reopening but always permits closure/disposal", () => {
    const c = enhance(); c.showModal()
    c.dialog.querySelector("[data-drawer-body]")!.remove()
    c.close()
    expect(c.dialog.open).toBe(false)
    expect(() => c.showModal()).toThrow(/DrawerContent/)
    c.dispose()
  })
  it("requires strict modal support and explicit modeless/inline fallback", () => {
    Reflect.deleteProperty(proto, "showModal")
    const c = enhance()
    expect(() => c.showModal()).toThrow(/unavailable/)
    expect(c.dialog.open).toBe(false)
    expect(c.show()).toBe("modeless")
    expect(() => c.showModal()).toThrow()
    c.close()
    Reflect.deleteProperty(proto, "show")
    expect(c.show()).toBe("inline")
    expect(c.dialog.hasAttribute("data-native-dialog-inline")).toBe(true)
  })
  it("requires close before switching modes and preserves native returnValue/forms", () => {
    const c = enhance(); c.showModal()
    expect(() => c.show()).toThrow(/Close/)
    const input = c.dialog.querySelector("input")!; input.value = "kept"
    c.close("saved"); expect(c.dialog.returnValue).toBe("saved")
    c.show(); expect(input.value).toBe("kept")
    expect(c.dialog.returnValue).toBe("")
    expect(() => c.showModal()).toThrow(/Close/)
  })
  it("supports authored native forms without submit/type/validation interception", () => {
    const c = enhance(); c.showModal()
    const form = c.dialog.querySelector("form")!
    expect(form.method).toBe("dialog")
    expect(form.checkValidity()).toBe(false)
    expect(form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))).toBe(true)
    expect(form.querySelector("button")!.type).toBe("submit")
    expect(form.querySelector("input")!.disabled).toBe(false)
    expect(c.dialog.hasAttribute("aria-busy")).toBe(false)
  })
  it("authors the demo default submitter as validated Save, with a separate native close form", () => {
    const root = document.createElement("div")
    root.innerHTML = readFileSync(resolve("demo", "components", "drawer.html"), "utf8")
    document.body.append(root)
    const form = root.querySelector<HTMLFormElement>("#native-form")!
    const controls = [...root.querySelectorAll<HTMLButtonElement>('button')].filter(button => button.form === form && button.type === "submit")
    expect(controls[0]!.id).toBe("save")
    expect(controls[0]!.formNoValidate).toBe(false)
    expect(root.querySelector<HTMLButtonElement>("#close")!.form).not.toBe(form)
    expect(form.checkValidity()).toBe(false)
  })
  it.each(["resizable", "width", "minWidth", "height", "blockScroll", "trapFocus", "onClose"])("rejects unsupported %s option forwarding", key => {
    expect(() => enhance({ [key]: true } as DrawerOptions)).toThrow()
  })
  it("retains cancel veto, Escape policy and explicit returnValue", () => {
    const c = enhance({ closeOnEsc: false }); c.showModal()
    expect(c.dialog.dispatchEvent(new Event("cancel", { cancelable: true }))).toBe(false)
    const veto = (event: Event) => event.preventDefault()
    c.dialog.addEventListener("cancel", veto); c.requestClose("vetoed")
    expect(c.dialog.open).toBe(true)
    c.dialog.removeEventListener("cancel", veto); c.requestClose("explicit")
    expect(c.dialog.returnValue).toBe("explicit")
    expect(c.dialog.open).toBe(false)
  })
  it("uses native requestClose once when available", () => {
    const c = enhance(); c.showModal()
    const request = vi.fn(); Object.defineProperty(c.dialog, "requestClose", { value: request })
    c.requestClose("native"); expect(request).toHaveBeenCalledExactlyOnceWith("native")
  })
  it("shares ownership with native Dialog and Modal without duplicate adoption", () => {
    const c = enhance()
    expect(() => createModal(c.dialog)).toThrow(/owner/)
    expect(() => createNativeDialog(c.dialog)).toThrow(/owner/)
    c.dispose()
    const next = createModal(c.dialog); handles.push(next); next.showModal(); c.dispose()
    expect(next.dialog.open).toBe(true)
  })
  it("does not modify body scrolling/cursor, author styles or background ARIA", () => {
    document.body.style.cssText = "overflow:scroll;cursor:crosshair;padding-right:9px"
    const c = enhance(); c.showModal()
    document.body.style.paddingRight = "13px"; c.dispose()
    expect(document.body.style.overflow).toBe("scroll")
    expect(document.body.style.cursor).toBe("crosshair")
    expect(document.body.style.paddingRight).toBe("13px")
    expect(document.querySelector("[inert], [aria-hidden=true]")).toBeNull()
  })
  it("preserves nested independent native modals and skips removed opener restoration", () => {
    const c = enhance(); const opener = c.dialog.parentElement!.querySelector<HTMLButtonElement>("[data-opener]")!
    c.showModal(opener)
    const child = document.createElement("dialog"); child.setAttribute("aria-label", "Nested")
    c.dialog.querySelector("[data-drawer-body]")!.append(child)
    const nested = createModal(child); handles.push(nested); nested.showModal(); nested.close()
    expect(c.dialog.open).toBe(true)
    opener.remove(); c.dialog.querySelector("input")!.focus(); c.close()
    expect(document.activeElement).not.toBe(opener)
  })
  it("invalidates direct native close/reopen and releases reparented removal", async () => {
    const c = enhance(); c.showModal(); const old = c.generation
    c.dialog.close(); c.dialog.showModal(); await flush()
    expect(c.generation).toBeGreaterThan(old)
    c.dialog.dispatchEvent(new Event("close")); expect(c.dialog.open).toBe(true)
    const host = document.createElement("div"); document.body.append(host); host.append(c.dialog); c.close()
    await flush(); host.remove(); await flush()
    expect(c.connected).toBe(false)
  })
  it("supports caller-owned async close checks without closing a new opening", async () => {
    const c = enhance(); c.showModal(); const generation = c.generation
    let complete!: () => void
    const task = new Promise<void>(resolve => { complete = resolve }).then(() => {
      if (c.connected && c.mode !== "closed" && c.generation === generation) c.close("checked")
    })
    c.close(); c.showModal(); complete(); await task
    expect(c.dialog.open).toBe(true)
  })
})

describe("Drawer backdrop and template owners", () => {
  function pointer(c: DrawerController, type: string, x: number) {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: x, button: 0 })
    Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true } })
    c.dialog.dispatchEvent(event); return event
  }
  it("keeps padding/inside-outside drags, respects veto and dismisses genuine outside activation", async () => {
    const c = enhance({ backdropDismiss: true }); c.showModal()
    vi.spyOn(c.dialog, "getBoundingClientRect").mockReturnValue({ left: 10, top: 10, right: 100, bottom: 100 } as DOMRect)
    pointer(c, "pointerdown", 11); pointer(c, "pointerup", 11)
    pointer(c, "pointerdown", 11); pointer(c, "pointerup", 0)
    await tick(); expect(c.dialog.open).toBe(true)
    pointer(c, "pointerdown", 0); pointer(c, "pointerup", 0).preventDefault()
    await tick(); expect(c.dialog.open).toBe(true)
    pointer(c, "pointerdown", 0); pointer(c, "pointerup", 0)
    await tick(); expect(c.dialog.open).toBe(false)
  })
  it("clears delayed backdrop work across reopen and removal", async () => {
    const c = enhance({ backdropDismiss: true }); c.showModal()
    vi.spyOn(c.dialog, "getBoundingClientRect").mockReturnValue({ left: 10, top: 10, right: 100, bottom: 100 } as DOMRect)
    pointer(c, "pointerdown", 0); pointer(c, "pointerup", 0); c.close(); c.showModal()
    await tick(); expect(c.dialog.open).toBe(true)
    pointer(c, "pointerdown", 0); pointer(c, "pointerup", 0); c.dialog.parentElement!.remove()
    await flush(); const html = c.dialog.outerHTML; await tick()
    expect(c.connected).toBe(false); expect(c.dialog.outerHTML).toBe(html)
  })
  it("preserves original templates and exposes only owned Drawer handles", () => {
    const { o } = owner(); const t = template(); const html = t.innerHTML
    const a = o.create(t); const b = o.create(t, { mode: "modeless" })
    expect(t.innerHTML).toBe(html); expect(o.drawers).toEqual([a, b])
    a.close(); expect(o.drawers).toContain(a)
    a.showModal(); a.dispose(); expect(o.drawers).toEqual([b])
  })
  it("keeps latest opening/focus order rather than creation order on destruction", () => {
    const { o } = owner(); const a = o.create(template()); a.close(); const b = o.create(template()); b.close()
    b.showModal(); a.showModal()
    const order: string[] = []
    a.dialog.addEventListener("mui:native-dialog-dispose", () => order.push("a"))
    b.dialog.addEventListener("mui:native-dialog-dispose", () => order.push("b"))
    o.destroyAll(); expect(order).toEqual(["a", "b"]); expect(o.drawers).toHaveLength(0)
  })
  it("guards reentrant creation and native focus-triggered owner disposal", () => {
    const { o } = owner(); const c = o.create(template()); let blocked = false
    c.dialog.addEventListener("mui:native-dialog-dispose", () => { try { o.create(template()) } catch { blocked = true } })
    o.dispose(); expect(blocked).toBe(true)
    const other = owner().o
    vi.spyOn(proto, "showModal").mockImplementation(function (this: HTMLDialogElement) { this.open = true; other.dispose() })
    expect(() => other.create(template())).toThrow(/interrupted/)
    expect(other.drawers).toHaveLength(0)
  })
  it("cleans up failed unsupported modality and external owner removal", async () => {
    const { o, root } = owner()
    Reflect.deleteProperty(proto, "showModal")
    expect(() => o.create(template())).toThrow(/unavailable/)
    expect(root.querySelector("dialog")).toBeNull()
    const c = o.create(template(), { mode: "modeless" }); root.remove(); await flush()
    expect(c.connected).toBe(false); expect(o.drawers).toHaveLength(0)
  })
  it("rejects duplicate IDs, invalid anatomy and executable/template option forwarding", () => {
    const { o } = owner(); const t = template(); t.content.querySelector("h3")!.id = "unique"
    o.create(t); expect(() => o.create(t)).toThrow(/unique/)
    const bad = template(); bad.content.querySelector("[data-drawer-body]")!.remove()
    expect(() => o.create(bad)).toThrow(/DrawerContent/)
    const executable = template(); executable.content.querySelector("[data-drawer-body]")!.append(document.createElement("script"))
    expect(() => o.create(executable)).toThrow(/executable/)
    expect(() => o.create(template(), { title: "Text" } as never)).toThrow(/text/)
  })
  it("ships native edge/body CSS without custom resizer, scroll-lock or animation dependencies", () => {
    const css = readFileSync(resolve("src", "components", "drawer", "drawer.css"), "utf8")
    for (const name of ["left", "right", "top", "bottom", "inline-start", "inline-end"]) expect(css).toContain(name)
    expect(css).toContain("height: min(var(--mui-drawer-height")
    expect(css).toContain("dialog.mui-native-dialog.mui-drawer")
    expect(css).toContain("[data-drawer-body]")
    expect(css).toContain("min-block-size: 3rem")
    expect(css).toContain("(max-height: 20rem)")
    expect(css).toContain("overflow: auto")
    expect(css).toContain("forced-colors")
    expect(css).toContain("prefers-reduced-motion")
    expect(css).toContain("@media print")
    expect(css).not.toContain(":has(")
    expect(css).not.toContain("resize:")
    expect(css).not.toContain("@keyframes")
  })
})
