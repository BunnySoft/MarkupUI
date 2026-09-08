import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mountExample } from "../demo/components/discrete.js"
import { createMessageOwner } from "../src/components/message/index.js"
import { createNativeDialog } from "../src/components/dialog/native.js"

const scopes: Awaited<ReturnType<typeof mountExample>>[] = []
const otherOwners: { dispose(): void }[] = []
const prototype = HTMLDialogElement.prototype
const descriptors = new Map<string, PropertyDescriptor | undefined>()
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve() }
function fixture() {
  const parsed = new DOMParser().parseFromString(readFileSync(resolve("demo", "components", "discrete.html"), "utf8"), "text/html")
  const root = document.importNode(parsed.querySelector("#discrete-example")!, true) as HTMLElement
  root.id = "test-discrete-example"
  root.querySelector<HTMLElement>("[data-enhanced-controls]")!.hidden = false
  document.body.append(root)
  return root
}
async function mount(root = fixture(), selected = ["message", "loadingBar"]) {
  const scope = await mountExample(root, selected); scopes.push(scope); return scope
}
beforeEach(() => {
  for (const name of ["show", "showModal", "close"]) descriptors.set(name, Object.getOwnPropertyDescriptor(prototype, name))
  for (const name of ["show", "showModal"]) Object.defineProperty(prototype, name, { configurable: true, value(this: HTMLDialogElement) { this.open = true } })
  Object.defineProperty(prototype, "close", { configurable: true, value(this: HTMLDialogElement, result?: string) {
    if (!this.open) return
    if (result !== undefined) this.returnValue = result
    this.open = false; this.dispatchEvent(new Event("close"))
  } })
})
afterEach(() => {
  for (const scope of scopes.splice(0)) scope.dispose()
  for (const owner of otherOwners.splice(0)) owner.dispose()
  document.body.replaceChildren()
  vi.restoreAllMocks()
  for (const name of ["show", "showModal", "close"]) {
    const descriptor = descriptors.get(name)
    if (descriptor) Object.defineProperty(prototype, name, descriptor)
    else Reflect.deleteProperty(prototype, name)
  }
})

describe("Discrete capability as native application composition", () => {
  it("adds no library factory/export/bundle/budget or hidden application", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    const manifest = JSON.parse(readFileSync(resolve("dist", "manifest.json"), "utf8"))
    expect(pkg.exports["./discrete"]).toBeUndefined()
    expect(existsSync(resolve("src", "components", "discrete"))).toBe(false)
    expect(existsSync(resolve("dist", "markup-ui-discrete.js"))).toBe(false)
    expect(Object.keys(manifest.bundles).some(key => key.includes("discrete"))).toBe(false)
    const source = readFileSync(resolve("demo", "components", "discrete.js"), "utf8")
    expect(source).not.toMatch(/^import\s/m)
    expect(source).not.toContain("createDiscreteApi")
    expect(source).not.toContain("createApp")
    expect(source).not.toContain("style.textContent")
    expect(pkg.dependencies).toEqual({})
  })
  it("selects only Message and Loading Bar, preserving unused native roots", async () => {
    const root = fixture()
    const untouched = root.querySelector("[data-example-notification]")!.innerHTML
    const scope = await mount(root)
    expect(Object.keys(scope.services).sort()).toEqual(["loadingBar", "message"])
    const h = scope.postMessage()
    scope.services.loadingBar!.start(); scope.services.loadingBar!.setProgress(40)
    expect(h.element.textContent).toContain("Explicitly selected")
    expect(scope.services.loadingBar!.value).toBe(40)
    expect(root.querySelector("[data-example-notification]")!.innerHTML).toBe(untouched)
    expect(root.querySelector("dialog")).toBeNull()
    expect(document.querySelector("[data-v-app], [inert]")).toBeNull()
    scope.dispose()
    expect(scope.cleanupComplete).toBe(true); expect(h.closed).toBe(true)
    expect(root.querySelector("progress")!.value).toBe(25)
  })
  it("permits an empty selection without loading owners or changing authored progress", async () => {
    const root = fixture(); const before = root.innerHTML
    const scope = await mount(root, [])
    expect(scope.services).toEqual({})
    expect(root.innerHTML).toBe(before)
    scope.dispose(); expect(root.innerHTML).toBe(before)
  })
  it("rejects unknown/duplicate selection without altering root contents", async () => {
    const root = fixture(); const before = root.innerHTML
    await expect(mountExample(root, ["message", "message"])).rejects.toThrow(/unique/)
    await expect(mountExample(root, ["unknown"])).rejects.toThrow(/known/)
    expect(root.innerHTML).toBe(before)
  })
  it("does not duplicate ownership or damage the original scope on repeated mount", async () => {
    const root = fixture(); const first = await mount(root)
    const existing = first.postMessage()
    await expect(mountExample(root, ["message"])).rejects.toThrow(/setup failed/)
    expect(existing.closed).toBe(false)
    first.dispose()
    const second = await mount(root)
    expect(second.services.message!.connected).toBe(true)
    first.dispose(); expect(second.services.message!.connected).toBe(true)
  })
  it("uses independent scopes without singleton state, global style edits or legacy overlay clearing", async () => {
    const a = await mount(fixture(), ["message"]); const b = await mount(fixture(), ["notification"])
    const msg = a.postMessage(); const card = b.postNotification()
    const before = document.body.style.cssText
    a.dispose()
    expect(msg.closed).toBe(true); expect(card.closed).toBe(false)
    expect(b.services.notification!.connected).toBe(true)
    expect(document.body.style.cssText).toBe(before)
  })
  it("composes all five services with native template identity and modal-local feedback", async () => {
    const root = fixture(); const originalTemplate = root.querySelector<HTMLTemplateElement>("[data-example-modal-template]")!.innerHTML
    const scope = await mount(root, ["message", "notification", "loadingBar", "dialog", "modal"])
    expect(Object.keys(scope.services)).toHaveLength(5)
    const modal = scope.openModal()
    expect(modal.mode).toBe("modal")
    const inside = scope.insideMessage!.info("Inside")
    const card = scope.insideNotification!.success({ content: "Inside notification" })
    expect(modal.dialog.contains(inside.element)).toBe(true)
    expect(modal.dialog.contains(card.element)).toBe(true)
    expect(root.querySelector<HTMLTemplateElement>("[data-example-modal-template]")!.innerHTML).toBe(originalTemplate)
    modal.close("native")
    expect(scope.openModal()).toBe(modal)
    scope.dispose()
    expect(inside.closed).toBe(true); expect(card.closed).toBe(true)
    expect(root.querySelector("dialog")).toBeNull()
  })
  it("authors initial modal focus on an always-visible heading for Modal-only selection", async () => {
    const scope = await mount(fixture(), ["modal"])
    const modal = scope.openModal()
    expect(modal.dialog.querySelector("[autofocus]")).toBe(modal.dialog.querySelector("h2"))
    expect(modal.dialog.querySelector<HTMLButtonElement>("[data-inside-message-button]")!.hidden).toBe(true)
    expect(modal.dialog.querySelector<HTMLButtonElement>("[data-inside-notification-button]")!.hidden).toBe(true)
    expect(modal.dialog.querySelector("h2")!.hidden).toBe(false)
  })
  it("uses existing Dialog pending semantics and resolves only its local work after teardown", async () => {
    const scope = await mount(fixture(), ["dialog", "modal", "message", "notification", "loadingBar"])
    scope.openModal()
    const dialog = scope.openDialog()
    dialog.dialog.querySelector<HTMLButtonElement>('[data-dialog-action="positive"]')!.click()
    await new Promise(resolve => setTimeout(resolve, 10)); await flush()
    expect(dialog.pending).toBe("positive"); expect(scope.pendingCount).toBe(1)
    scope.services.loadingBar!.start()
    const notification = scope.postNotification()
    const pendingClose = notification.requestClose(); await flush()
    expect(scope.pendingCount).toBe(2)
    scope.dispose()
    expect(scope.pendingCount).toBe(0)
    await expect(pendingClose).resolves.toBe(false)
    expect(dialog.connected).toBe(false)
    expect(scope.services.loadingBar!.connected).toBe(false)
    const html = dialog.dialog.outerHTML
    scope.resolveDecisions(true); await flush()
    expect(dialog.dialog.outerHTML).toBe(html)
  })
  it("disposes selected child confirmation before its workspace and leaves unowned native surfaces intact", async () => {
    const root = fixture(); const scope = await mount(root, ["dialog", "modal", "message"])
    const modal = scope.openModal(); const dialog = scope.openDialog()
    const unowned = document.createElement("dialog"); unowned.setAttribute("aria-label", "Unowned")
    document.body.append(unowned)
    const other = createNativeDialog(unowned); otherOwners.push(other); other.showModal()
    const order: string[] = []
    dialog.dialog.addEventListener("mui:native-dialog-dispose", () => order.push("dialog"))
    modal.dialog.addEventListener("mui:native-dialog-dispose", () => order.push("modal"))
    scope.dispose()
    expect(order).toEqual(["dialog", "modal"])
    expect(unowned.open).toBe(true)
  })
  it("rolls back already-created owners on later setup failure without touching an unowned owner", async () => {
    const root = fixture(); const node = root.querySelector<HTMLElement>("[data-example-message]")!
    const unowned = createMessageOwner(node); otherOwners.push(unowned)
    const existing = unowned.create("Unowned existing message", { duration: 0 })
    let failure: any
    try { await mountExample(root, ["modal", "dialog", "loadingBar", "message"]) } catch (error) { failure = error }
    expect(failure).toBeInstanceOf(AggregateError)
    expect(failure.scope.cleanupComplete).toBe(true)
    expect(failure.scope.services.loadingBar.connected).toBe(false)
    expect(root.querySelector("progress")!.value).toBe(25)
    expect(unowned.connected).toBe(true); expect(existing.closed).toBe(false)
  })
  it("reports partial disposal errors, continues other cleanup and retains retryable failed cleanup", async () => {
    const root = fixture(); const scope = await mount(root, ["message", "notification", "loadingBar"])
    const msg = scope.postMessage(); const notification = scope.postNotification()
    scope.services.loadingBar!.start()
    const original = scope.services.message!.dispose
    scope.services.message!.dispose = () => { throw new Error("Simulated teardown failure") }
    expect(() => scope.dispose()).toThrow(AggregateError)
    expect(scope.disposed).toBe(true); expect(scope.cleanupComplete).toBe(false)
    expect(notification.closed).toBe(true); expect(scope.services.loadingBar!.connected).toBe(false)
    expect(msg.closed).toBe(false)
    scope.services.message!.dispose = original
    scope.dispose()
    expect(scope.cleanupComplete).toBe(true); expect(msg.closed).toBe(true)
  })
  it("cleans a failed modal-local feedback composition rather than leaving a stray top layer", async () => {
    const root = fixture()
    root.querySelector<HTMLTemplateElement>("[data-example-modal-template]")!.content.querySelector("[data-inside-notification]")!.classList.remove("mui-notification-host")
    const scope = await mount(root, ["modal", "message", "notification"])
    expect(() => scope.openModal()).toThrow(AggregateError)
    expect(root.querySelector("dialog")).toBeNull()
    expect(scope.insideMessage!.connected).toBe(false)
    scope.dispose()
  })
  it("surfaces stale/disposed handle errors rather than remounting an implicit app", async () => {
    const scope = await mount(fixture(), ["message", "loadingBar"])
    const message = scope.postMessage()
    scope.dispose()
    expect(() => scope.postMessage()).toThrow(/disposed/)
    expect(() => message.update({ content: "Late" })).toThrow()
    expect(() => scope.services.loadingBar!.start()).toThrow(/Connect/)
    expect(document.querySelector("[data-v-app]")).toBeNull()
  })
})
