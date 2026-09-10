import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMessageOwner } from "../src/components/message/index.js"
import type { MessageOwner, MessageOwnerOptions, MessageType } from "../src/components/message/index.js"
import { createFeedbackExpiry } from "../src/components/feedback/expiry.js"
import { showMessage, clearOverlays } from "../src/overlay/index.js"

const owners: MessageOwner[] = []
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() }
const messageCSS = () => readFileSync(resolve("src", "components", "message", "message.css"), "utf8")
  .replace(/\s+/g, " ").replace(/\s*([{};,])\s*/g, "$1").replace(/:\s+/g, ":")
  .replace(/\[([\w-]+)="([\w-]+)"\]/g, "[$1=$2]").replace(/;}/g, "}")
  .replace(/@media\s+\(/g, "@media(").trim()
async function advance(ms: number) { vi.advanceTimersByTime(ms); await flush() }
function fixture() {
  const root = document.createElement("div")
  root.className = "mui-feedback-host mui-message-host"
  root.innerHTML = '<ol class="mui-feedback-list" data-message-items aria-label="Messages"></ol><p class="mui-feedback-announcer" data-message-announcer role="status" aria-atomic="true"></p>'
  document.body.append(root)
  return root
}
function owner(options: MessageOwnerOptions = {}, root = fixture()) {
  const result = createMessageOwner(root, options); owners.push(result); return result
}
function template() {
  const t = document.createElement("template")
  t.innerHTML = '<li class="mui-message"><span data-message-icon aria-hidden="true">◆</span><strong data-message-kind></strong><span data-message-content></span><button type="button" data-message-close aria-label="Dismiss">×</button><p data-message-error hidden>Close failed.</p><div data-message-actions><form><label>Reference <input required></label><button type="submit">Save locally</button></form></div></li>'
  return t
}
const close = (element: HTMLElement) => element.querySelector<HTMLButtonElement>("[data-message-close]")!
beforeEach(() => { vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] }) })
afterEach(() => {
  for (const o of owners.splice(0)) o.dispose()
  clearOverlays()
  document.body.replaceChildren()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("Root-owned native Message", () => {
  it("ships separate ESM/classic/CSS with no overlay/VDOM/runtime dependency", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    const source = readFileSync(resolve("src", "components", "message", "message.ts"), "utf8")
    expect(pkg.exports["./message"].import).toBe("./dist/markup-ui-message.js")
    expect(pkg.exports["./message/style.css"]).toBe("./dist/markup-ui-message.css")
    expect(pkg.dependencies).toEqual({})
    expect(source).not.toContain("innerHTML")
    expect(source).not.toMatch(/from ".*(?:modal|popover|dialog|overlay)/)
    expect(customElements.get("mui-message")).toBeUndefined()
  })
  it.each(["default", "info", "success", "warning", "error", "loading"] as MessageType[])("renders literal %s content and visible semantic words without item live regions", type => {
    const root = fixture(); const o = owner({}, root)
    const message = type === "default" ? o.create("<img onerror=bad>") : o[type]("<img onerror=bad>")
    expect(message.type).toBe(type)
    expect(message.element.localName).toBe("li")
    expect(message.element.querySelector("[data-message-content]")!.textContent).toBe("<img onerror=bad>")
    expect(message.element.querySelector("img")).toBeNull()
    expect(message.element.querySelector("[data-message-kind]")!.textContent).not.toBe("")
    expect(message.element.querySelector('[role="alert"],[role="status"],[aria-live]')).toBeNull()
    expect(root.querySelectorAll('[role="status"]')).toHaveLength(1)
    expect(root.querySelector("[data-message-announcer]")!.textContent).toContain("<img onerror=bad>")
  })
  it("does not steal focus, disable outside fields, inert content or create dialogs", () => {
    const input = document.createElement("input"); document.body.append(input); input.focus()
    const o = owner({ closable: true }); const h = o.info("Hi")
    expect(document.activeElement).toBe(input)
    expect(input.disabled).toBe(false)
    expect(document.querySelector("dialog,[inert],[aria-modal]")).toBeNull()
    expect(close(h.element).type).toBe("button")
    expect(close(h.element).hidden).toBe(false)
  })
  it("defaults to 3000ms while loading defaults to persistent", async () => {
    const o = owner(); const normal = o.create("Normal"); const loading = o.loading("Loading")
    expect(normal.duration).toBe(3000); expect(loading.duration).toBe(0)
    await advance(2999); expect(normal.closed).toBe(false)
    await advance(1); expect(normal.closed).toBe(true); expect(loading.closed).toBe(false)
  })
  it("accepts persistent zero and explicit loading deadlines", async () => {
    const o = owner({ duration: 20 })
    const persistent = o.info("Persistent", { duration: 0 })
    const loading = o.loading("Explicit short loading", { duration: 10 })
    await advance(25)
    expect(persistent.closed).toBe(false); expect(loading.closed).toBe(true)
  })
  it.each([-1, NaN, Infinity, 0.5, 3_600_001, null, "3000"])("rejects invalid duration %s before insertion", value => {
    const o = owner()
    expect(() => o.create("Bad", { duration: value as number })).toThrow()
    expect(o.messages).toHaveLength(0)
    expect(() => owner({ duration: value as number })).toThrow()
  })
  it.each([0, -1, 1.5, 51, null, Infinity])("rejects invalid max %s", value => {
    expect(() => owner({ max: value as number })).toThrow()
  })
  it("rejects empty/nontext content, unknown fields, callbacks and flags", () => {
    const o = owner()
    for (const text of ["", "  ", null, 12, () => "VNode"]) expect(() => o.create(text as string)).toThrow()
    for (const config of [{ type: "bad" }, { closable: null }, { showIcon: 1 }, { onClose: "bad" }, { render: () => "VNode" }, { style: {} }, { spinProps: {} }]) {
      expect(() => o.create("Bad", config as never)).toThrow()
    }
    expect(o.messages).toHaveLength(0)
  })
  it("bounds capacity without eviction, queued DOM or success-shaped dropping", () => {
    const root = fixture(); const o = owner({ max: 1, closable: true }, root)
    const first = o.create("First", { duration: 0 }); close(first.element).focus()
    const before = root.innerHTML
    expect(() => o.error("Overflow")).toThrow(/capacity/)
    expect(root.innerHTML).toBe(before)
    expect(first.closed).toBe(false)
    expect(document.activeElement).toBe(close(first.element))
    first.destroy(); expect(o.success("Room available").closed).toBe(false)
  })
  it("reserves capacity during reentrant template import and releases failed reservations", () => {
    let service: MessageOwner | undefined
    let nested = false
    let blocked = false
    customElements.define("message-capacity-probe", class extends HTMLElement {
      constructor() {
        super()
        if (service && !nested) {
          nested = true
          try { service.create("Nested") } catch { blocked = true }
        }
      }
    })
    const t = template(); t.content.querySelector("li")!.append(document.createElement("message-capacity-probe"))
    service = owner({ max: 1, template: t })
    service.create("Outer")
    expect(blocked).toBe(true); expect(service.messages).toHaveLength(1)
    service.destroyAll()
    expect(service.create("Released").closed).toBe(false)
  })
  it("invalidates an in-flight template creation when its constructor clears the owner", () => {
    let service: MessageOwner | undefined
    let cleared = false
    customElements.define("message-clear-probe", class extends HTMLElement {
      constructor() {
        super()
        if (service && !cleared) { cleared = true; service.destroyAll() }
      }
    })
    const t = template(); t.content.querySelector("li")!.append(document.createElement("message-clear-probe"))
    service = owner({ template: t })
    expect(() => service!.create("Interrupted")).toThrow(/interrupted/)
    expect(service.messages).toHaveLength(0)
    expect(service.create("After clear").closed).toBe(false)
  })
  it("returns readonly snapshots and keeps independent owners isolated", () => {
    const a = owner(); const b = owner()
    const h = a.create("A"); b.create("B")
    const snapshot = a.messages as unknown as unknown[]; snapshot.length = 0
    expect(a.messages).toHaveLength(1)
    a.destroyAll(); expect(h.closed).toBe(true); expect(b.messages).toHaveLength(1)
  })
  it("refuses duplicate roots across independently evaluated feedback consumers", () => {
    const root = fixture(); const a = owner({}, root)
    expect(() => owner({}, root)).toThrow()
    expect(a.create("Original owner is intact").closed).toBe(false)
    a.dispose(); const b = owner({}, root); b.create("New owner"); a.dispose()
    expect(b.messages).toHaveLength(1)
  })
  it("requires dedicated empty items and one nonnested atomic polite announcer", () => {
    for (const fault of ["items", "atomic", "host-live", "extra-live", "existing"]) {
      const root = fixture()
      if (fault === "items") root.querySelector("ol")!.remove()
      if (fault === "atomic") root.querySelector("p")!.removeAttribute("aria-atomic")
      if (fault === "host-live") root.setAttribute("aria-live", "polite")
      if (fault === "extra-live") { const live = document.createElement("output"); root.append(live) }
      if (fault === "existing") root.querySelector("ol")!.append(document.createElement("li"))
      expect(() => owner({}, root)).toThrow()
    }
  })
  it("preserves formatting whitespace in empty authored host regions", () => {
    const root = fixture()
    root.querySelector("ol")!.append(document.createTextNode("\n  "))
    root.querySelector("p")!.append(document.createTextNode("\n"))
    const html = root.innerHTML
    const o = owner({}, root); o.create("Owned"); o.dispose()
    expect(root.innerHTML).toBe(html)
  })
})

describe("Reusable expiry, updates and focus protection", () => {
  it("pauses only remaining time on hover and resumes instead of resetting", async () => {
    const o = owner({ keepAliveOnHover: true }); const h = o.create("Hover", { duration: 100 })
    await advance(40); h.element.dispatchEvent(new MouseEvent("mouseenter"))
    expect(h.paused).toBe(true); expect(h.remaining).toBeCloseTo(60)
    await advance(1000); expect(h.closed).toBe(false)
    h.element.dispatchEvent(new MouseEvent("mouseleave")); await advance(59)
    expect(h.closed).toBe(false); await advance(1); expect(h.closed).toBe(true)
  })
  it("expires during hover when opt-in is false", async () => {
    const h = owner().info("Not protected by hover", { duration: 10 })
    h.element.dispatchEvent(new MouseEvent("mouseenter"))
    await advance(10); expect(h.closed).toBe(true)
  })
  it("always pauses for keyboard focus, including authored controls", async () => {
    const o = owner({ template: template(), keepAliveOnHover: false })
    const h = o.info("Focus", { duration: 100 })
    await advance(30); h.element.querySelector("input")!.focus()
    expect(h.paused).toBe(true)
    await advance(500); expect(h.closed).toBe(false)
    h.element.querySelector("input")!.blur(); await flush()
    await advance(69); expect(h.closed).toBe(false)
    await advance(1); expect(h.closed).toBe(true)
  })
  it("retains independent hover and focus holds", async () => {
    const h = owner({ closable: true, keepAliveOnHover: true }).info("Two holds", { duration: 20 })
    close(h.element).focus(); h.element.dispatchEvent(new MouseEvent("mouseenter"))
    close(h.element).blur(); await flush(); await advance(30)
    expect(h.closed).toBe(false)
    h.element.dispatchEvent(new MouseEvent("mouseleave")); await advance(20)
    expect(h.closed).toBe(true)
  })
  it("restarts updates with fresh deadlines and preserves loading persistence unless explicitly changed", async () => {
    const o = owner(); const h = o.loading("Working")
    h.update({ type: "success", content: "Done" }); expect(h.duration).toBe(0)
    h.update({ duration: 100 }); await advance(70)
    h.update({ content: "Refreshed" }); await advance(40)
    expect(h.closed).toBe(false)
    await advance(60); expect(h.closed).toBe(true)
  })
  it("keeps focused updates alive and rejects hiding the focused close control atomically", async () => {
    const h = owner({ closable: true }).info("Focus", { duration: 10 })
    close(h.element).focus(); h.update({ content: "Updated" })
    expect(() => h.update({ closable: false, content: "Must not apply" })).toThrow(/focus/)
    expect(h.content).toBe("Updated"); expect(close(h.element).hidden).toBe(false)
    await advance(30); expect(h.closed).toBe(false)
  })
  it("preserves native action nodes/listeners/form validation and author disabled/style updates", () => {
    const h = owner({ template: template(), closable: true }).create("Before")
    const input = h.element.querySelector("input")!; const form = h.element.querySelector("form")!
    input.value = "retained"
    const listener = vi.fn((event: Event) => event.preventDefault()); form.addEventListener("submit", listener)
    close(h.element).disabled = true; close(h.element).style.color = "red"
    h.update({ content: "After", type: "success" })
    expect(h.element.querySelector("input")).toBe(input); expect(input.value).toBe("retained")
    expect(form.checkValidity()).toBe(true)
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    expect(listener).toHaveBeenCalledTimes(1)
    expect(close(h.element).disabled).toBe(true); expect(close(h.element).style.color).toBe("red")
  })
  it("does not allow malformed updates to change text or restart the timer", async () => {
    const h = owner().create("Original", { duration: 100 })
    await advance(60)
    expect(() => h.update({ duration: -1, content: "Bad" })).toThrow()
    expect(h.content).toBe("Original"); await advance(40); expect(h.closed).toBe(true)
  })
  it("never applies an old expiry to a recreated message", async () => {
    const o = owner({ max: 1 }); const old = o.create("Same text", { duration: 50 })
    await advance(20); old.destroy()
    const next = o.create("Same text", { duration: 100 })
    await advance(50); expect(next.closed).toBe(false)
    old.destroy(); expect(next.closed).toBe(false)
    await advance(50); expect(next.closed).toBe(true)
  })
  it("can reuse the expiry clock without Message semantics", async () => {
    const element = document.createElement("div"); document.body.append(element)
    const expired = vi.fn(); const clock = createFeedbackExpiry(element, expired)
    clock.restart(10, false); await advance(10); expect(expired).toHaveBeenCalledTimes(1)
    element.dispatchEvent(new MouseEvent("mouseenter")); element.dispatchEvent(new MouseEvent("mouseleave"))
    await advance(0); expect(expired).toHaveBeenCalledTimes(1)
    clock.restart(10, false); clock.dispose(); await advance(20); expect(expired).toHaveBeenCalledTimes(1)
  })
})

describe("Explicit close, callback errors and teardown", () => {
  it("calls onClose only for the explicit close button and ignores false as a veto", async () => {
    const callback = vi.fn(() => false)
    const o = owner({ closable: true }); const h = o.create("Close", { onClose: callback, duration: 0 })
    close(h.element).click(); close(h.element).click(); await advance(0)
    expect(callback).toHaveBeenCalledTimes(1); expect(h.closed).toBe(true)
    o.create("Destroy", { onClose: callback }).destroy()
    const timed = o.create("Expiry", { onClose: callback, duration: 1 }); await advance(1)
    expect(timed.closed).toBe(true); expect(callback).toHaveBeenCalledTimes(1)
  })
  it("respects later preventDefault and does not submit an enclosing native form", async () => {
    const root = fixture(); const o = owner({ closable: true }, root)
    const callback = vi.fn(); const h = o.create("Vetoed", { onClose: callback })
    root.addEventListener("click", event => event.preventDefault())
    close(h.element).click(); await advance(0)
    expect(callback).not.toHaveBeenCalled(); expect(h.closed).toBe(false)
    expect(close(h.element).type).toBe("button")
  })
  it("surfaces synchronous callback failure and retains the item until update/retry", async () => {
    const root = fixture(); const o = owner({ closable: true }, root); const failure = new Error("Local failure")
    const errors: CustomEvent[] = []; root.addEventListener("mui:message-error", e => errors.push(e as CustomEvent))
    const h = o.error("Try closing", { duration: 10, onClose: () => { throw failure } })
    close(h.element).click(); await advance(0); await advance(100)
    expect(h.closed).toBe(false); expect(h.lastError).toBe(failure)
    expect(h.element.querySelector<HTMLElement>("[data-message-error]")!.hidden).toBe(false)
    expect(errors[0]!.detail.stale).toBe(false)
    h.update({ onClose: undefined, duration: 0 }); close(h.element).click(); await advance(0)
    expect(h.closed).toBe(true)
  })
  it("does not await async onClose but reports late rejection without changing the next message", async () => {
    const root = fixture(); const o = owner({ max: 1, closable: true }, root)
    const errors: CustomEvent[] = []; root.addEventListener("mui:message-error", e => { e.preventDefault(); errors.push(e as CustomEvent) })
    let reject!: (reason: unknown) => void
    const old = o.create("Old", { onClose: () => new Promise<void>((_, no) => { reject = no }), duration: 0 })
    close(old.element).click(); await advance(0); expect(old.closed).toBe(true)
    const next = o.create("New", { duration: 0 }); const html = root.innerHTML
    reject(new Error("Late")); await flush()
    expect(root.innerHTML).toBe(html); expect(next.closed).toBe(false)
    expect(errors[0]!.detail.stale).toBe(true); expect(errors[0]!.detail.handle).toBe(old)
  })
  it("reports unhandled stale callback failures to the console rather than swallowing them", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    const h = owner({ closable: true }).create("Async", { onClose: async () => { throw new Error("Unhandled") } })
    close(h.element).click(); await advance(0); await flush()
    expect(log).toHaveBeenCalled()
  })
  it("does not close a reentrantly updated handle or repaint after reentrant destroy", async () => {
    const root = fixture(); const o = owner({ closable: true }, root)
    root.addEventListener("mui:message-error", event => event.preventDefault())
    const h = o.create("Old", { duration: 0, onClose: () => h.update({ content: "Replacement" }) })
    close(h.element).click(); await advance(0); expect(h.closed).toBe(false); expect(h.content).toBe("Replacement")
    h.update({ onClose: () => { h.destroy(); throw new Error("After destruction") } })
    close(h.element).click(); await advance(0)
    expect(h.closed).toBe(true); expect(o.messages).toHaveLength(0)
  })
  it("moves focus only on explicit removal to an explicitly supplied fallback", async () => {
    const target = document.createElement("button"); document.body.append(target)
    const o = owner({ closable: true, focusFallback: target })
    const h = o.info("Focused", { duration: 10 }); close(h.element).focus()
    await advance(100); expect(h.closed).toBe(false)
    h.destroy(); expect(document.activeElement).toBe(target)
    target.focus(); o.create("Unfocused").destroy(); expect(document.activeElement).toBe(target)
  })
  it("does not focus a removed fallback or steal focus from another active control", () => {
    const target = document.createElement("button"); document.body.append(target)
    const o = owner({ closable: true, focusFallback: target }); const h = o.create("No target")
    close(h.element).focus(); target.remove(); h.destroy()
    expect(document.activeElement).not.toBe(target)
  })
  it("blocks reentrant creation during bulk and terminal teardown", () => {
    const root = fixture(); const o = owner({}, root); o.create("One")
    let rejected = 0
    root.addEventListener("mui:message-remove", () => { try { o.create("Reentrant") } catch { rejected++ } })
    o.destroyAll(); expect(rejected).toBe(1); expect(o.messages).toHaveLength(0)
    o.create("Two"); o.dispose(); expect(rejected).toBe(2); expect(o.connected).toBe(false)
  })
  it("cleans ancestor removal and reparented roots without stale expiry changes", async () => {
    const root = fixture(); const o = owner({}, root); const h = o.create("Timed", { duration: 20 })
    const parent = document.createElement("div"); document.body.append(parent); parent.append(root); await flush()
    parent.remove(); await flush()
    expect(o.connected).toBe(false); expect(h.closed).toBe(true)
    const html = root.outerHTML; await advance(100); expect(root.outerHTML).toBe(html)
    expect(() => h.update({ content: "Late" })).toThrow()
  })
  it("releases moved nodes without removing them from an author's new location", async () => {
    const o = owner(); const h = o.create("Transferred", { duration: 20 })
    const other = document.createElement("div"); document.body.append(other); other.append(h.element)
    await flush(); expect(h.closed).toBe(true); expect(h.element.parentElement).toBe(other)
    const html = other.innerHTML; await advance(100); h.destroy(); expect(other.innerHTML).toBe(html)
  })
  it("preserves replacement author content in the announcer on disposal", async () => {
    const root = fixture(); const o = owner({}, root); o.create("Before")
    root.addEventListener("mui:message-error", event => event.preventDefault())
    root.querySelector("[data-message-announcer]")!.textContent = "Author replacement"
    await flush(); expect(o.connected).toBe(false)
    expect(root.querySelector("[data-message-announcer]")!.textContent).toBe("Author replacement")
  })
  it("does not invoke fallback focus during automatic anatomy teardown", async () => {
    const root = fixture(); const fallback = document.createElement("button"); document.body.append(fallback)
    const o = owner({ closable: true, focusFallback: fallback }, root)
    const h = o.create("Focused"); close(h.element).focus()
    root.addEventListener("mui:message-error", event => event.preventDefault())
    root.querySelector("[data-message-announcer]")!.textContent = "Author replacement"
    await flush()
    expect(o.connected).toBe(false); expect(document.activeElement).not.toBe(fallback)
  })
  it("detects marker reassignment instead of appending to a stale native list", async () => {
    const root = fixture(); const o = owner({}, root); o.create("Existing")
    root.addEventListener("mui:message-error", event => event.preventDefault())
    root.querySelector("[data-message-items]")!.removeAttribute("data-message-items")
    const replacement = document.createElement("ol"); replacement.dataset.messageItems = ""; root.append(replacement)
    await flush(); expect(o.connected).toBe(false); expect(replacement.children).toHaveLength(0)
  })
})

describe("Templates, semantics and legacy compatibility", () => {
  it("clones a trusted inert template without moving its source or generating business actions", () => {
    const source = template(); const html = source.innerHTML
    const o = owner({ template: source, closable: true }); const h = o.create("Literal", { showIcon: false })
    expect(source.innerHTML).toBe(html)
    expect(h.element.querySelectorAll("button")).toHaveLength(2)
    expect(h.element.querySelector<HTMLElement>("[data-message-icon]")!.hidden).toBe(true)
    expect(h.element.querySelector("[data-message-icon]")!.textContent).toBe("◆")
  })
  it("rejects duplicate template IDs and malformed/live/executable/autofocus content", () => {
    const t = template(); t.content.querySelector("li")!.id = "unique-message"
    const o = owner({ template: t }); o.create("One")
    expect(() => o.create("Two")).toThrow(/unique/)
    for (const kind of ["script", "style", "dialog", "output", "autofocus", "root-autofocus", "close-submit", "region"]) {
      const source = template()
      if (kind === "autofocus") source.content.querySelector("input")!.autofocus = true
      else if (kind === "root-autofocus") source.content.querySelector("li")!.setAttribute("autofocus", "")
      else if (kind === "close-submit") source.content.querySelector<HTMLButtonElement>("[data-message-close]")!.type = "submit"
      else if (kind === "region") source.content.querySelector("[data-message-content]")!.append(document.createElement("input"))
      else source.content.querySelector("li")!.append(document.createElement(kind))
      expect(() => owner({ template: source }).create("Invalid")).toThrow()
    }
  })
  it("retains legacy safe-text output and keeps legacy clear separate", () => {
    const o = owner(); const h = o.info("Enhanced", { duration: 0 })
    const legacy = showMessage("Legacy <b>text</b>", { type: "success", duration: 0 })
    expect(legacy.element.outerHTML).toBe('<mui-message type="success" role="status">Legacy &lt;b&gt;text&lt;/b&gt;</mui-message>')
    expect(legacy.element.parentElement!.getAttribute("aria-live")).toBe("polite")
    clearOverlays(); expect(h.closed).toBe(false)
    o.destroyAll(); expect(h.closed).toBe(true)
  })
  it("composes reusable external placement CSS with no animation or browser Notification APIs", () => {
    const css = readFileSync(resolve("src", "components", "feedback", "feedback.css"), "utf8")
    const message = readFileSync(resolve("src", "components", "message", "message.css"), "utf8")
    for (const position of ["top-left", "top-right", "bottom", "bottom-left", "bottom-right"]) expect(css).toContain(position)
    expect(css).toContain("calc(100% - 2rem)")
    expect(css).toContain("pointer-events: none")
    expect(message).toContain("forced-colors")
    expect(message).toContain("prefers-reduced-motion")
    expect(css + message).not.toContain("@keyframes")
  })
  it("retains visible kind/content rows while applying measured intrinsic toast geometry", () => {
    const css = messageCSS()
    expect(css).toContain("inline-size:max-content")
    expect(css).toContain("max-inline-size:min(var(--mui-feedback-width,720px),100%)")
    expect(css).toContain("padding:10px 20px;border:0;border-radius:3px")
    expect(css).toContain("[data-message-kind]{grid-column:2;grid-row:1}")
    expect(css).toContain("[data-message-content]{grid-column:2;grid-row:2;min-inline-size:0}")
    expect(css).toContain("inline-size:20px;block-size:20px;margin-inline-end:10px")
    expect(css).toContain("grid-template-columns:auto minmax(0,1fr) auto")
    expect(css).toMatch(/\.mui-message-host\s*>\s*\.mui-feedback-list\{grid-template-columns:minmax\(0,1fr\)\}/)
  })
  it("uses semantic icon roles and correct light/dark surfaces without assigning public overrides", () => {
    const css = messageCSS()
    expect(css).toContain("light-dark(#fff,#48484e)")
    expect(css).toContain("light-dark(#333639,#ffffffd1)")
    for (const name of ["info", "success", "warning", "error", "primary"]) expect(css).toContain(`--mui-color-${name},`)
    expect(css).toContain("var(--mui-message-accent,var(--_message-accent))")
    expect(css).not.toMatch(/--mui-message-(?:accent|color|background):/)
    expect(css).not.toMatch(/--mui-(?:text-primary|text-secondary|bg-surface|border),/)
  })
  it("scopes fixed placement overrides to Message and preserves scrolling, pointer and print policies", () => {
    const css = messageCSS()
    expect(css).toContain(".mui-message-host.mui-feedback-host--fixed{top:max(12px,env(safe-area-inset-top))")
    expect(css).toContain("width:min(var(--mui-feedback-width,720px),calc(100% - 2rem))")
    expect(css).toContain("max-height:min(calc(100% - 2rem),calc(100% - max(12px,env(safe-area-inset-top)) - max(12px,env(safe-area-inset-bottom))))")
    expect(css).toContain("z-index:var(--mui-feedback-z-index,6000)")
    expect(css).toContain("justify-items:left")
    expect(css).toContain("justify-items:right")
    expect(css).not.toMatch(/(?:^|})\.mui-feedback-(?:host|list)[{:.]/)
    expect(css).toContain(".mui-message-host.mui-feedback-host--fixed{position:static;width:auto;max-height:none;margin:0;overflow:visible}")
  })
  it("preserves native close targets, actions/error feedback and accessible media policies", () => {
    const css = messageCSS()
    expect(css).toContain("min-inline-size:2.5rem;min-block-size:2.5rem")
    expect(css).toContain("[data-message-close]:enabled:hover")
    expect(css).toContain("[data-message-close]:disabled{opacity:.5;cursor:not-allowed}")
    expect(css).toContain("[data-message-actions]{grid-column:1 / -1;display:flex;flex-wrap:wrap")
    expect(css).toContain("border-inline-start:.25rem solid var(--mui-message-accent,var(--_message-accent))")
    expect(css).toContain("outline-offset:-2px")
    expect(css).toContain("@media(prefers-reduced-motion:reduce){.mui-message{animation:none;transition:none}}")
    expect(css).toContain("border:1px solid CanvasText;box-shadow:none")
    expect(css).toContain("[data-message-error]{border-color:CanvasText}")
    expect(css).toContain("box-shadow:none;break-inside:avoid")
    expect(css).toContain("@media(max-width:24rem){.mui-message{padding-inline:12px}")
    expect(css).toContain("[data-message-content]{grid-column:1 / -1}")
    expect(css).toContain("[data-message-close]{grid-row:3;margin-inline-start:6px}")
  })
  it("keeps the unchanged exact composed CSS gzip ceiling without altering shared feedback", () => {
    const base = readFileSync(resolve("src", "components", "feedback", "feedback.css"), "utf8")
    const css = readFileSync(resolve("src", "components", "message", "message.css"), "utf8")
    expect(gzipSync(`${base}\n${css}`, { level: 9 }).length).toBeLessThanOrEqual(1750)
  })
})
