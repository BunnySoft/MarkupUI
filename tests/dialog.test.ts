import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createDialog, createDialogOwner, createNativeDialog } from "../src/components/dialog/index.js"
import type { DialogController, DialogOptions, DialogOwner, NativeDialogController } from "../src/components/dialog/index.js"

const handles: (NativeDialogController | DialogOwner)[] = []
const proto = HTMLDialogElement.prototype
const names = ["showModal", "show", "close", "requestClose"] as const
const descriptors = new Map<string, PropertyDescriptor | undefined>()
const tick = async () => { await new Promise(resolve => setTimeout(resolve, 5)) }
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() }
function deferred() {
  let resolve!: (value: unknown) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<unknown>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function fixture() {
  const root = document.createElement("div")
  root.innerHTML = `<button id="opener">Open</button><dialog class="mui-native-dialog mui-dialog" aria-labelledby="title" aria-describedby="content"><header data-dialog-header><span data-dialog-icon aria-hidden="true">!</span><h2 id="title" data-dialog-title>Review</h2><button type="button" data-dialog-action="close">Close</button></header><div id="content" data-dialog-content>Review this change.</div><p hidden role="alert" data-dialog-error>Action failed. Try again.</p><p hidden role="status" data-dialog-pending>Working…</p><footer data-dialog-actions><button type="button" data-dialog-action="negative">Cancel</button><button type="button" data-dialog-action="positive">Confirm</button></footer><form method="dialog"><label>Name <input name="name" required></label><button value="saved">Save form</button></form></dialog>`
  document.body.append(root)
  return root.querySelector("dialog")!
}
function enhance(options: DialogOptions = {}, dialog = fixture()): DialogController {
  const controller = createDialog(dialog, options)
  handles.push(controller)
  return controller
}
function button(controller: DialogController, action = "positive") {
  return controller.dialog.querySelector<HTMLButtonElement>(`[data-dialog-action="${action}"]`)!
}
async function act(controller: DialogController, action = "positive") { button(controller, action).click(); await tick() }
beforeEach(() => {
  for (const name of names) descriptors.set(name, Object.getOwnPropertyDescriptor(proto, name))
  for (const name of ["showModal", "show"]) Object.defineProperty(proto, name, {
    configurable: true, value(this: HTMLDialogElement) { this.open = true },
  })
  Object.defineProperty(proto, "close", {
    configurable: true, value(this: HTMLDialogElement, value?: string) {
      if (!this.open) return
      if (value !== undefined) this.returnValue = value
      this.open = false
      this.dispatchEvent(new Event("close"))
    },
  })
  Reflect.deleteProperty(proto, "requestClose")
})
afterEach(() => {
  for (const handle of handles.splice(0)) handle.dispose()
  document.body.replaceChildren()
  vi.restoreAllMocks()
  for (const name of names) {
    const descriptor = descriptors.get(name)
    if (descriptor) Object.defineProperty(proto, name, descriptor)
    else Reflect.deleteProperty(proto, name)
  }
})

describe("Dialog native lifetime", () => {
  it("ships optional dependency-free exports without registering legacy tags", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    expect(pkg.exports["./dialog"].import).toBe("./dist/markup-ui-dialog.js")
    expect(pkg.exports["./dialog/style.css"]).toBe("./dist/markup-ui-dialog.css")
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("mui-dialog")).toBeUndefined()
  })
  it("retains authored native nodes, roles, descriptions and form values", () => {
    const dialog = fixture()
    dialog.setAttribute("role", "alertdialog")
    const html = dialog.innerHTML
    const c = enhance({}, dialog)
    expect(c.mode).toBe("closed")
    c.showModal()
    expect(c.mode).toBe("modal")
    expect(dialog.innerHTML).toBe(html)
    expect(dialog.hasAttribute("aria-modal")).toBe(false)
    expect(dialog.getAttribute("role")).toBe("alertdialog")
    expect(dialog.style.cssText).toBe("")
    c.close("done")
    expect(dialog.returnValue).toBe("done")
  })
  it("supports modeless opening and requires closing before changing native mode", () => {
    const c = enhance()
    expect(c.show()).toBe("modeless")
    expect(c.showModal()).toBe("modeless")
    c.close()
    expect(c.showModal()).toBe("modal")
  })
  it("adopts an initially open native modeless baseline", () => {
    const dialog = fixture(); dialog.open = true
    const c = enhance({}, dialog)
    expect(c.mode).toBe("modeless")
    c.dispose()
    expect(dialog.open).toBe(false)
    expect(dialog.isConnected).toBe(true)
  })
  it.each(["aria-modal", "unnamed", "closedby", "role"])("rejects misleading %s anatomy", kind => {
    const dialog = fixture()
    if (kind === "aria-modal") dialog.setAttribute(kind, "false")
    if (kind === "unnamed") dialog.removeAttribute("aria-labelledby")
    if (kind === "closedby") dialog.setAttribute(kind, "any")
    if (kind === "role") dialog.setAttribute(kind, "button")
    expect(() => enhance({}, dialog)).toThrow()
  })
  it("refuses duplicate owners and permits a fresh owner after dispose", () => {
    const c = enhance()
    expect(() => createNativeDialog(c.dialog)).toThrow(/owner/)
    c.dispose()
    const next = enhance({}, c.dialog)
    next.showModal()
    c.dispose()
    expect(next.dialog.open).toBe(true)
  })
  it("validates callback, policy, opener and return-value types", () => {
    expect(() => enhance({ onClose: true as never })).toThrow()
    expect(() => enhance({ backdropDismiss: "yes" as never })).toThrow()
    const c = enhance()
    expect(() => c.showModal(button(c))).toThrow()
    c.show()
    expect(() => c.close(1 as never)).toThrow()
    expect(() => c.requestClose(1 as never)).toThrow()
  })
  it("preserves native cancellation and close return values", () => {
    const c = enhance()
    c.showModal()
    const cancel = vi.fn((event: Event) => event.preventDefault())
    c.dialog.addEventListener("cancel", cancel)
    c.requestClose("cancelled")
    expect(cancel).toHaveBeenCalledTimes(1)
    expect(c.dialog.open).toBe(true)
    c.dialog.removeEventListener("cancel", cancel)
    const close = vi.fn()
    c.dialog.addEventListener("close", close)
    c.requestClose("accepted")
    expect(c.dialog.returnValue).toBe("accepted")
    expect(close).toHaveBeenCalledTimes(1)
  })
  it("uses exact native requestClose capability rather than double-dispatch", () => {
    const c = enhance()
    c.showModal()
    const request = vi.fn()
    Object.defineProperty(c.dialog, "requestClose", { value: request })
    c.requestClose("native")
    expect(request).toHaveBeenCalledExactlyOnceWith("native")
  })
  it("distinguishes disallowed platform cancel from an explicit request", () => {
    const c = enhance({ closeOnEsc: false })
    c.showModal()
    expect(c.dialog.dispatchEvent(new Event("cancel", { cancelable: true }))).toBe(false)
    c.requestClose("explicit")
    expect(c.dialog.open).toBe(false)
  })
  it("does not route Escape/platform cancellation to the close-button callback", () => {
    const onClose = vi.fn()
    const c = enhance({ onClose })
    c.showModal(); c.requestClose()
    expect(onClose).not.toHaveBeenCalled()
  })
  it("falls back to genuine modeless show when modal is absent", () => {
    Reflect.deleteProperty(proto, "showModal")
    const c = enhance()
    expect(c.showModal()).toBe("modeless")
    expect(c.dialog.open).toBe(true)
    expect(c.dialog.hasAttribute("aria-modal")).toBe(false)
  })
  it("falls back to usable inline open/close when all native methods are absent", () => {
    for (const name of names) Reflect.deleteProperty(proto, name)
    const c = enhance()
    expect(c.showModal()).toBe("inline")
    expect(c.dialog.hasAttribute("data-native-dialog-inline")).toBe(true)
    const close = vi.fn()
    c.dialog.addEventListener("close", close)
    c.close("inline")
    expect(c.dialog.open).toBe(false)
    expect(c.dialog.returnValue).toBe("inline")
    expect(c.dialog.hasAttribute("data-native-dialog-inline")).toBe(false)
    expect(close).toHaveBeenCalledTimes(1)
  })
  it("does not suppress native modal failures as false success", () => {
    const c = enhance()
    vi.spyOn(c.dialog, "showModal").mockImplementation(() => { throw new Error("unavailable") })
    expect(() => c.showModal()).toThrow("unavailable")
    expect(c.mode).toBe("closed")
  })
  it("does not open hidden/inert author content or mutate its visibility", () => {
    const c = enhance(); c.dialog.hidden = true
    expect(() => c.showModal()).toThrow(/hidden/)
    c.dispose()
    expect(c.dialog.hidden).toBe(true)
  })
  it("restores an explicit connected opener only when focus is otherwise unowned", () => {
    const c = enhance()
    const opener = document.querySelector<HTMLButtonElement>("#opener")!
    c.showModal(opener); button(c).focus(); c.close()
    expect(document.activeElement).toBe(opener)
  })
  it("does not steal focus from another surface or a removed trigger", () => {
    const c = enhance(); const opener = document.querySelector<HTMLButtonElement>("#opener")!
    c.showModal(opener)
    const other = document.createElement("button"); document.body.append(other); other.focus()
    c.close()
    expect(document.activeElement).toBe(other)
    c.showModal(opener); opener.remove(); button(c).focus(); c.close()
    expect(document.activeElement).not.toBe(opener)
  })
  it("cleans up ancestor removal and makes disposal terminal", async () => {
    const c = enhance(); c.showModal()
    c.dialog.parentElement!.remove()
    await flush()
    expect(c.connected).toBe(false)
    expect(c.dialog.open).toBe(false)
    expect(() => c.show()).toThrow(/disposed/)
  })
  it("keeps a synchronously reopened inline session after close dispatch", () => {
    for (const name of names) Reflect.deleteProperty(proto, name)
    const c = enhance(); c.showModal()
    c.dialog.addEventListener("close", () => c.showModal(), { once: true })
    c.close()
    expect(c.dialog.open).toBe(true)
    expect(c.mode).toBe("inline")
    expect(c.dialog.hasAttribute("data-native-dialog-inline")).toBe(true)
  })
  it("enters terminal disposal before close/focus handlers can reopen it", () => {
    for (const name of names) Reflect.deleteProperty(proto, name)
    const c = enhance()
    const opener = document.querySelector<HTMLButtonElement>("#opener")!
    c.showModal(opener); button(c).focus()
    let rejected = false
    opener.addEventListener("focus", () => {
      try { c.showModal() } catch { rejected = true }
    }, { once: true })
    c.dispose()
    expect(rejected).toBe(true)
    expect(c.dialog.open).toBe(false)
    expect(c.connected).toBe(false)
  })
  it("updates ancestry even when close consumes synchronous reparent records", async () => {
    const c = enhance(); c.showModal()
    const target = document.createElement("div"); document.body.append(target)
    target.append(c.dialog); c.close(); await flush()
    target.remove(); await flush()
    expect(c.connected).toBe(false)
  })
  it("does not claim modal opening if a native beforetoggle handler cancels it", () => {
    const c = enhance()
    vi.spyOn(c.dialog, "showModal").mockImplementation(() => {
      const event = new Event("beforetoggle", { cancelable: true })
      if (c.dialog.dispatchEvent(event)) c.dialog.open = true
    })
    c.dialog.addEventListener("beforetoggle", event => event.preventDefault())
    expect(c.showModal()).toBe("closed")
    expect(c.dialog.open).toBe(false)
  })
  it("keeps one native owner across independently evaluated bundles", () => {
    const c = enhance()
    expect((c.dialog as unknown as Record<symbol, unknown>)[Symbol.for("markupui.native-dialog.owner")]).toBeTruthy()
    c.dispose()
    expect((c.dialog as unknown as Record<symbol, unknown>)[Symbol.for("markupui.native-dialog.owner")]).toBeUndefined()
  })
  it("requires both primary pointer endpoints outside and honors late cancellation", async () => {
    const c = enhance({ backdropDismiss: true }); c.showModal()
    vi.spyOn(c.dialog, "getBoundingClientRect").mockReturnValue({ left: 10, top: 10, right: 100, bottom: 100 } as DOMRect)
    function pointer(type: string, x: number) {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: x, button: 0 })
      Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true } })
      c.dialog.dispatchEvent(event)
      return event
    }
    pointer("pointerdown", 11); pointer("pointerup", 0); await tick()
    expect(c.dialog.open).toBe(true)
    pointer("pointerdown", 0); const cancelled = pointer("pointerup", 0); cancelled.preventDefault(); await tick()
    expect(c.dialog.open).toBe(true)
    pointer("pointerdown", 0); pointer("pointerup", 0); await tick()
    expect(c.dialog.open).toBe(false)
  })
})

describe("Dialog guarded native decisions", () => {
  it.each(["positive", "negative", "close"])("closes on void from %s and preserves the action returnValue", async action => {
    const callback = vi.fn()
    const c = enhance({ onPositiveClick: callback, onNegativeClick: callback, onClose: callback })
    c.showModal(); await act(c, action)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(c.dialog.returnValue).toBe(action)
    expect(c.mode).toBe("closed")
  })
  it.each([false, Promise.resolve(false)])("retains the opening on false results", async result => {
    const c = enhance({ onPositiveClick: () => result })
    c.showModal(); await act(c)
    expect(c.dialog.open).toBe(true)
    expect(c.pending).toBeNull()
    expect(button(c).disabled).toBe(false)
  })
  it("guards duplicate async actions and marks only owned buttons busy", async () => {
    const task = deferred(); const callback = vi.fn(() => task.promise)
    const c = enhance({ onPositiveClick: callback })
    c.showModal(); button(c).click(); button(c).click(); await tick()
    expect(callback).toHaveBeenCalledTimes(1)
    expect(c.pending).toBe("positive")
    expect(c.dialog.getAttribute("aria-busy")).toBe("true")
    expect(button(c, "negative").disabled).toBe(true)
    expect(c.dialog.querySelector("input")!.disabled).toBe(false)
    expect(c.dialog.querySelector("form button")!.hasAttribute("disabled")).toBe(false)
    task.resolve(true); await flush()
    expect(c.dialog.open).toBe(false)
    expect(c.dialog.hasAttribute("aria-busy")).toBe(false)
  })
  it.each(["throw", "reject"])("surfaces %s without closing or swallowing lastAction rejection", async kind => {
    const failure = new Error("local failure")
    const c = enhance({ onPositiveClick: () => { if (kind === "throw") throw failure; return Promise.reject(failure) } })
    const error = vi.fn()
    c.dialog.addEventListener("mui:dialog-error", error)
    c.showModal(); await act(c)
    await expect(c.lastAction).rejects.toBe(failure)
    expect(c.dialog.open).toBe(true)
    expect(c.dialog.querySelector<HTMLElement>("[data-dialog-error]")!.hidden).toBe(false)
    expect(c.pending).toBeNull()
    expect(error.mock.calls[0]![0].detail).toEqual({ action: "positive", error: failure, stale: false })
  })
  it.each(["close", "native", "dispose", "remove", "reparent"])("ignores async completion after %s and reopen/removal", async method => {
    const task = deferred(); const c = enhance({ onPositiveClick: () => task.promise })
    c.showModal(); await act(c)
    if (method === "close") { c.close(); c.showModal() }
    if (method === "native") { c.dialog.close(); c.dialog.showModal() }
    if (method === "dispose") c.dispose()
    if (method === "remove") c.dialog.parentElement!.remove()
    if (method === "reparent") document.body.append(c.dialog)
    await flush()
    const open = c.dialog.open
    const html = c.dialog.outerHTML
    task.resolve(true); await flush()
    expect(c.dialog.open).toBe(open)
    expect(c.dialog.outerHTML).toBe(html)
    expect(c.pending).toBeNull()
  })
  it("reports stale rejection without changing the reopened DOM", async () => {
    const task = deferred(); const c = enhance({ onPositiveClick: () => task.promise })
    const errors = vi.fn(); c.dialog.addEventListener("mui:dialog-error", errors)
    c.showModal(); await act(c); c.close(); c.showModal()
    const html = c.dialog.outerHTML
    task.reject(new Error("late")); await flush()
    expect(c.dialog.outerHTML).toBe(html)
    expect(errors.mock.calls[0]![0].detail.stale).toBe(true)
  })
  it.each(["resolve", "reject"])("rechecks after focus reentrancy on %s", async outcome => {
    const task = deferred(); const c = enhance({ onPositiveClick: () => task.promise })
    c.showModal(); button(c).focus(); await act(c)
    c.dialog.querySelector("input")!.focus()
    button(c).addEventListener("focus", () => { c.close(); c.showModal() }, { once: true })
    if (outcome === "resolve") task.resolve(true)
    else task.reject(new Error("old session"))
    await flush()
    expect(c.dialog.open).toBe(true)
    expect(c.dialog.querySelector<HTMLElement>("[data-dialog-error]")!.hidden).toBe(true)
  })
  it("ignores delayed close events from an earlier native opening", async () => {
    const c = enhance(); c.showModal(); c.close(); c.showModal()
    c.dialog.dispatchEvent(new Event("close"))
    expect(c.dialog.open).toBe(true)
    expect(c.mode).toBe("modal")
  })
  it("respects a later bubbling author's preventDefault before invoking a callback", async () => {
    const callback = vi.fn(); const c = enhance({ onPositiveClick: callback })
    c.dialog.parentElement!.addEventListener("click", event => event.preventDefault())
    c.showModal(); await act(c)
    expect(callback).not.toHaveBeenCalled()
    expect(c.dialog.open).toBe(true)
  })
  it("restores only owned attributes, preserving identical author disabled writes", async () => {
    const task = deferred(); const c = enhance({ onPositiveClick: () => task.promise })
    c.dialog.setAttribute("aria-busy", "false")
    button(c, "negative").disabled = true
    c.showModal(); await act(c)
    button(c).setAttribute("disabled", "")
    c.dialog.setAttribute("aria-busy", "mixed")
    task.resolve(false); await flush()
    expect(button(c).disabled).toBe(true)
    expect(button(c, "negative").disabled).toBe(true)
    expect(button(c, "close").disabled).toBe(false)
    expect(c.dialog.getAttribute("aria-busy")).toBe("mixed")
  })
  it("does not observe, submit, validate or prevent default on native method=dialog forms", () => {
    const callback = vi.fn(); const c = enhance({ onPositiveClick: callback })
    c.showModal()
    const form = c.dialog.querySelector("form")!
    expect(form.checkValidity()).toBe(false)
    const event = new Event("submit", { bubbles: true, cancelable: true })
    expect(form.dispatchEvent(event)).toBe(true)
    expect(callback).not.toHaveBeenCalled()
    expect(form.method).toBe("dialog")
    expect(form.querySelector("button")!.type).toBe("submit")
    expect(c.dialog.querySelector("input")!.required).toBe(true)
  })
  it("rejects submit/native-command controls marked as asynchronous decisions", () => {
    for (const kind of ["submit", "commandfor"]) {
      const dialog = fixture(); const control = dialog.querySelector("button")!
      if (kind === "submit") control.type = "submit"
      else control.setAttribute("commandfor", "target")
      expect(() => enhance({}, dialog)).toThrow(/type=button/)
    }
  })
  it("rejects missing, nested or empty failure/status regions", () => {
    const dialog = fixture(); dialog.querySelector("[data-dialog-error]")!.remove()
    expect(() => enhance({}, dialog)).toThrow(/regions/)
  })
  it("disposes changed action/status anatomy before late completion can update it", async () => {
    const task = deferred(); const c = enhance({ onPositiveClick: () => task.promise })
    c.showModal(); await act(c)
    const error = c.dialog.querySelector<HTMLElement>("[data-dialog-error]")!
    error.remove(); await flush()
    expect(c.connected).toBe(false)
    const html = error.outerHTML
    task.reject(new Error("late")); await flush()
    expect(error.outerHTML).toBe(html)
  })
  it("does not handle another nested dialog's action", async () => {
    const outer = enhance()
    const inner = fixture(); outer.dialog.append(inner)
    inner.removeAttribute("aria-labelledby"); inner.setAttribute("aria-label", "Inner")
    const callback = vi.fn(() => false); const c = enhance({ onPositiveClick: callback }, inner)
    outer.showModal(); c.showModal(); await act(c)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(outer.pending).toBeNull()
    expect(outer.dialog.open).toBe(true)
  })
})

describe("Explicit template owners and CSS", () => {
  function template() {
    const node = document.createElement("template")
    const dialog = fixture(); dialog.removeAttribute("aria-labelledby"); dialog.setAttribute("aria-label", "Template review")
    dialog.removeAttribute("aria-describedby")
    dialog.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"))
    node.content.append(dialog)
    return node
  }
  function owner() {
    const root = document.createElement("div"); document.body.append(root)
    const result = createDialogOwner(root); handles.push(result); return result
  }
  it("creates independent template clones with literal text, no generated decisions", () => {
    const source = template(); const original = source.innerHTML; const a = owner(); const b = owner()
    const first = a.create(source, { title: "<b>Text</b>", type: "warning" })
    const second = b.create(source, { modal: false })
    expect(first.dialog.querySelector("[data-dialog-title]")!.textContent).toBe("<b>Text</b>")
    expect(first.dialog.querySelector("[data-dialog-title] b")).toBeNull()
    expect(first.dialog.dataset.dialogType).toBe("warning")
    expect(second.mode).toBe("modeless")
    expect(source.innerHTML).toBe(original)
    a.destroyAll()
    expect(first.dialog.isConnected).toBe(false)
    expect(second.dialog.open).toBe(true)
    expect(a.dialogs).toHaveLength(0)
  })
  it("retains closed clone handles for explicit reopen until destroy/dispose", () => {
    const a = owner(); const c = a.create(template())
    c.close(); expect(a.dialogs).toHaveLength(1)
    c.showModal(); c.dispose(); c.dispose()
    expect(a.dialogs).toHaveLength(0)
    expect(c.dialog.isConnected).toBe(false)
  })
  it("removes externally disposed/removed clones from their owner's collection", async () => {
    const a = owner(); const c = a.create(template())
    c.dialog.remove(); await flush()
    expect(a.dialogs).toHaveLength(0)
    expect(c.connected).toBe(false)
  })
  it("blocks reentrant creation during owner disposal", () => {
    const a = owner(); const source = template(); const c = a.create(source)
    let rejected = false
    c.dialog.addEventListener("mui:native-dialog-dispose", () => {
      try { a.create(source) } catch { rejected = true }
    })
    a.dispose()
    expect(rejected).toBe(true)
    expect(a.dialogs).toHaveLength(0)
  })
  it("registers the clone before native opening can reentrantly dispose its owner", () => {
    const a = owner()
    vi.spyOn(proto, "showModal").mockImplementation(function (this: HTMLDialogElement) {
      this.open = true
      a.dispose()
    })
    expect(() => a.create(template())).toThrow(/interrupted/)
    expect(a.dialogs).toHaveLength(0)
    expect(document.querySelector("dialog[open]")).toBeNull()
  })
  it("rejects duplicate IDs, rich control replacement, invalid options and reused disposed owners", () => {
    const a = owner(); const source = template()
    source.content.querySelector("dialog")!.id = "unique-dialog"
    a.create(source)
    expect(() => a.create(source)).toThrow(/unique/)
    const rich = template(); rich.content.querySelector("[data-dialog-content]")!.append(document.createElement("input"))
    expect(() => a.create(rich, { content: "Replacement" })).toThrow(/text-only/)
    expect(() => a.create(template(), { type: "bad" as never })).toThrow(/type/)
    a.dispose()
    expect(() => a.create(template())).toThrow(/unavailable/)
  })
  it("rejects executable, embedded and style elements in cloned templates", () => {
    const a = owner()
    for (const tag of ["script", "style", "iframe", "object", "embed"]) {
      const source = template(); source.content.querySelector("dialog")!.append(document.createElement(tag))
      expect(() => a.create(source)).toThrow(/executable/)
    }
    expect(a.dialogs).toHaveLength(0)
  })
  it("ships external native viewport/scroll and decorative type/accessibility styles without injection", () => {
    const css = readFileSync(resolve("src", "components", "dialog", "dialog.css"), "utf8")
    const native = readFileSync(resolve("src", "components", "dialog", "native.css"), "utf8")
    expect(css).toContain("forced-colors")
    expect(css).toContain("prefers-reduced-motion")
    expect(css).toContain("flex-wrap: wrap")
    expect(native).toContain("max-block-size: calc(100% - 2rem)")
    expect(native).toContain("overflow: auto")
    expect(native).toContain("@media print")
    expect(css + native).not.toContain("@import")
  })
})
