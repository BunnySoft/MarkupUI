import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createNotificationOwner } from "../src/components/notification/index.js"
import type { NotificationOwner, NotificationOwnerOptions } from "../src/components/notification/index.js"
import { createMessageOwner } from "../src/components/message/index.js"
import { showNotification, clearOverlays } from "../src/overlay/index.js"
import { createFeedbackAttributes } from "../src/components/feedback/attributes.js"

const owners: { dispose(): void }[] = []
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve() }
const advance = async (ms: number) => { vi.advanceTimersByTime(ms); await flush() }
function deferred() {
  let resolve!: (value: unknown) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<unknown>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function fixture(policy: "polite" | "assertive" | "off" = "polite") {
  const root = document.createElement("div")
  root.className = "mui-feedback-host mui-notification-host"
  root.innerHTML = `<div class="mui-feedback-list" data-notification-items></div><p class="mui-feedback-announcer" data-notification-announcer role="${policy === "assertive" ? "alert" : "status"}" aria-atomic="true"${policy === "off" ? ' aria-live="off"' : ""}></p>`
  document.body.append(root)
  return root
}
function owner(options: NotificationOwnerOptions = {}, root = fixture()) {
  const o = createNotificationOwner(root, options); owners.push(o); return o
}
function template() {
  const t = document.createElement("template")
  t.innerHTML = '<article class="mui-notification" aria-label="Project activity"><span data-notification-avatar aria-hidden="true">AB</span><header data-notification-header><strong data-notification-kind></strong><h3 data-notification-title>Authored level three</h3></header><button type="button" data-notification-close aria-label="Dismiss">×</button><p data-notification-description></p><p data-notification-content>Authored content</p><small data-notification-meta></small><p data-notification-action-text></p><div data-notification-actions><a href="#details">Details</a><form><label>Reference<input required></label><button type="submit">Use locally</button></form></div><p data-notification-pending hidden>Waiting…</p><p data-notification-error hidden>Close failed.</p></article>'
  return t
}
const close = (element: HTMLElement) => element.querySelector<HTMLButtonElement>("[data-notification-close]")!
beforeEach(() => { vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] }) })
afterEach(() => {
  for (const o of owners.splice(0)) o.dispose()
  clearOverlays()
  document.body.replaceChildren()
  vi.useRealTimers(); vi.restoreAllMocks()
})

describe("Native Notification content and semantic policy", () => {
  it("ships optional feedback-only ESM/classic/composed CSS without OS/overlay dependencies", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    const source = readFileSync(resolve("src", "components", "notification", "notification.ts"), "utf8")
    expect(pkg.exports["./notification"].import).toBe("./dist/markup-ui-notification.js")
    expect(pkg.exports["./notification/style.css"]).toBe("./dist/markup-ui-notification.css")
    expect(pkg.dependencies).toEqual({})
    expect(source).not.toContain("innerHTML")
    expect(source).not.toMatch(/from ".*(?:message|modal|dialog|popover|overlay)/)
    expect(customElements.get("mui-notification")).toBeUndefined()
  })
  it.each(["create", "info", "success", "warning", "error"] as const)("retains %s text and visible kind without inferred heading levels or clickable cards", method => {
    const root = fixture(); const o = owner({}, root)
    const h = o[method]({ title: "Literal <b>title</b>", description: "Description", content: "<script>text</script>\nSecond line", meta: "Meta", action: "Action text" })
    expect(h.element.localName).toBe("article")
    expect(h.element.querySelector("h1,h2,h3,[role=heading],script,b")).toBeNull()
    expect(h.element.querySelector("[data-notification-title]")!.textContent).toBe("Literal <b>title</b>")
    expect(h.element.querySelector("[data-notification-action-text]")!.textContent).toBe("Action text")
    expect(h.element.querySelectorAll("button")).toHaveLength(1)
    expect(h.element.getAttribute("role")).toBeNull()
    expect(root.querySelectorAll('[role="status"]')).toHaveLength(1)
    expect(h.element.querySelector("[role=status],[role=alert],[aria-live]")).toBeNull()
  })
  it.each(["polite", "assertive", "off"] as const)("honors one authored %s owner policy, never per-card alerts", policy => {
    const root = fixture(policy); const o = owner({}, root); o.error({ content: "Visible error words" })
    expect(o.announcement).toBe(policy)
    expect(root.querySelector("[data-notification-announcer]")!.textContent).toBe(policy === "off" ? "" : "Error: Visible error words")
    expect(root.querySelector(".mui-notification [role=alert]")).toBeNull()
  })
  it("preserves authored heading level/name, avatar, native actions/forms and their listeners across updates", () => {
    const t = template(); const original = t.innerHTML; const h = owner({ template: t }).create({ meta: "New meta" })
    const heading = h.element.querySelector("h3")!; const avatar = h.element.querySelector("[data-notification-avatar]")!
    const input = h.element.querySelector("input")!; input.value = "Kept"
    const form = h.element.querySelector("form")!; const listener = vi.fn((e: Event) => e.preventDefault()); form.addEventListener("submit", listener)
    h.update({ title: "Updated heading", description: "Updated description", action: "Different plain action text" })
    expect(h.element.querySelector("h3")).toBe(heading); expect(h.element.querySelector("[data-notification-avatar]")).toBe(avatar)
    expect(h.element.querySelector("input")).toBe(input); expect(input.value).toBe("Kept")
    expect(h.element.getAttribute("aria-label")).toBe("Project activity")
    expect(form.checkValidity()).toBe(true); form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    expect(listener).toHaveBeenCalledTimes(1); expect(t.innerHTML).toBe(original)
  })
  it("does not steal focus or mutate unrelated native form/disabled state", () => {
    const outside = document.createElement("input"); document.body.append(outside); outside.focus()
    const h = owner().info({ content: "Information" })
    expect(document.activeElement).toBe(outside); expect(outside.disabled).toBe(false)
    expect(document.querySelector("dialog,[inert],[aria-modal]")).toBeNull()
    expect(close(h.element).type).toBe("button")
  })
  it("requires readable content and rejects render/avatar/style bags or invalid types", () => {
    const o = owner()
    for (const config of [{}, { content: "  " }, { title: () => "VNode" }, { content: "x", avatar: () => "avatar" }, { content: "x", style: {} }, { content: "x", type: "loading" }, { content: "x", closable: null }]) {
      expect(() => o.create(config as never)).toThrow()
    }
    expect(o.notifications).toHaveLength(0)
  })
  it.each([-1, NaN, Infinity, 0.5, 3_600_001, null, "100"])("rejects duration %s without inserting or changing live state", value => {
    const o = owner()
    expect(() => o.create({ content: "Bad", duration: value as number })).toThrow()
    expect(o.notifications).toHaveLength(0)
  })
  it.each([0, -1, 51, 1.5, null])("rejects capacity %s", value => {
    expect(() => owner({ max: value as number })).toThrow()
  })
  it("rejects unnamed templates, duplicate IDs, inferred modal/live/autofocus and nested action controls", () => {
    const t = template(); t.content.querySelector("h3")!.id = "unique"
    const o = owner({ template: t }); o.create({}); expect(() => o.create({})).toThrow(/unique/)
    for (const fault of ["name", "script", "autofocus", "live", "modal", "link", "submit"]) {
      const t = template(); const article = t.content.querySelector("article")!
      if (fault === "name") article.removeAttribute("aria-label")
      if (fault === "script") article.append(document.createElement("script"))
      if (fault === "autofocus") article.querySelector("input")!.autofocus = true
      if (fault === "live") article.setAttribute("role", "alert")
      if (fault === "modal") article.setAttribute("aria-modal", "true")
      if (fault === "submit") article.querySelector<HTMLButtonElement>("[data-notification-close]")!.type = "submit"
      if (fault === "link") { const a = document.createElement("a"); article.append(a); a.append(article.querySelector("button")!) }
      expect(() => owner({ template: t }).create({})).toThrow()
    }
  })
  it("preserves heading references and refuses hiding the focused region/control", () => {
    const t = template(); const article = t.content.querySelector("article")!; const title = t.content.querySelector("h3")!
    title.id = "named-title"; article.removeAttribute("aria-label"); article.setAttribute("aria-labelledby", title.id)
    const h = owner({ template: t }).create({})
    expect(() => h.update({ title: "" })).toThrow(/heading/)
    close(h.element).focus()
    expect(() => h.update({ closable: false })).toThrow(/focus/)
    expect(close(h.element).hidden).toBe(false)
  })
})

describe("Expiry, capacity and owner lifetime", () => {
  it("is persistent by default, with focus-protected optional deadlines and remaining hover time", async () => {
    const o = owner({ keepAliveOnHover: true })
    const sticky = o.info({ content: "Persistent" }); const timed = o.info({ content: "Timed", duration: 100 })
    await advance(30); timed.element.dispatchEvent(new MouseEvent("mouseenter"))
    await advance(500); expect(timed.closed).toBe(false); expect(timed.remaining).toBeCloseTo(70)
    close(timed.element).focus(); timed.element.dispatchEvent(new MouseEvent("mouseleave"))
    await advance(100); expect(timed.closed).toBe(false)
    close(timed.element).blur(); await flush(); await advance(70)
    expect(timed.closed).toBe(true); expect(sticky.closed).toBe(false)
  })
  it("restarts updates and rejects invalid updates atomically", async () => {
    const h = owner().create({ title: "Original", duration: 100 })
    await advance(60); expect(() => h.update({ content: "Bad", duration: -1 })).toThrow()
    expect(h.content).toBe("")
    h.update({ content: "Refreshed" }); await advance(60); expect(h.closed).toBe(false)
    await advance(40); expect(h.closed).toBe(true)
  })
  it("rejects overflow without evicting focused or pending cards", () => {
    const root = fixture(); const o = owner({ max: 1 }, root); const h = o.create({ content: "One" })
    close(h.element).focus(); const html = root.innerHTML
    expect(() => o.create({ content: "Overflow" })).toThrow(/capacity/)
    expect(root.innerHTML).toBe(html); expect(document.activeElement).toBe(close(h.element))
    h.destroy(); expect(o.create({ content: "Available" }).closed).toBe(false)
  })
  it("reserves in-flight capacity and invalidates constructor-time clear", () => {
    let service: NotificationOwner | undefined; let behavior = "capacity"; let entered = false; let blocked = false
    customElements.define("notification-owner-probe", class extends HTMLElement {
      constructor() {
        super()
        if (service && !entered) {
          entered = true
          if (behavior === "clear") service.destroyAll()
          else try { service.create({ content: "Nested" }) } catch { blocked = true }
        }
      }
    })
    const t = template(); t.content.querySelector("article")!.append(document.createElement("notification-owner-probe"))
    service = owner({ max: 1, template: t }); service.create({}); expect(blocked).toBe(true); expect(service.notifications).toHaveLength(1)
    service.destroyAll(); entered = false; behavior = "clear"
    expect(() => service!.create({})).toThrow(/interrupted/); expect(service.notifications).toHaveLength(0)
    expect(service.create({}).closed).toBe(false)
  })
  it("keeps owners independent and legacy output/clear unchanged", () => {
    const a = owner(); const b = owner(); const h = a.info({ content: "New" }); b.info({ content: "Other" })
    const legacy = showNotification({ title: "Legacy", content: "<b>text</b>", duration: 0 })
    expect(legacy.element.outerHTML).toBe('<mui-notification type="default" role="status"><strong>Legacy</strong><span>&lt;b&gt;text&lt;/b&gt;</span></mui-notification>')
    clearOverlays(); expect(h.closed).toBe(false)
    a.destroyAll(); expect(b.notifications).toHaveLength(1)
  })
  it("shares feedback root ownership with Message and preserves recreated owners", () => {
    const root = fixture(); const a = owner({}, root)
    expect(() => owner({}, root)).toThrow()
    a.dispose()
    root.classList.add("mui-message-host")
    root.innerHTML = '<ol data-message-items></ol><p data-message-announcer role="status" aria-atomic="true"></p>'
    const message = createMessageOwner(root); owners.push(message)
    message.create("Different consumer")
    a.dispose(); expect(message.messages).toHaveLength(1)
  })
  it("cleans removal/reparenting clocks without deleting moved author nodes", async () => {
    const root = fixture(); const o = owner({}, root); const h = o.info({ content: "Move", duration: 30 })
    const other = document.createElement("div"); document.body.append(other); other.append(h.element)
    await flush(); expect(h.closed).toBe(true); expect(h.element.parentElement).toBe(other)
    const html = other.innerHTML; await advance(100); expect(other.innerHTML).toBe(html)
    o.info({ content: "Remove" }); const ancestor = document.createElement("div"); document.body.append(ancestor); ancestor.append(root)
    await flush(); ancestor.remove(); await flush(); expect(o.connected).toBe(false)
  })
  it("preserves author announcer replacement and suppresses automatic fallback focus", async () => {
    const root = fixture(); const fallback = document.createElement("button"); document.body.append(fallback)
    root.addEventListener("mui:notification-error", e => e.preventDefault())
    const o = owner({ focusFallback: fallback }, root); const h = o.info({ content: "Current" }); close(h.element).focus()
    root.querySelector("[data-notification-announcer]")!.textContent = "Author replacement"
    await flush()
    expect(o.connected).toBe(false); expect(document.activeElement).not.toBe(fallback)
    expect(root.querySelector("[data-notification-announcer]")!.textContent).toBe("Author replacement")
  })
})

describe("Guarded Notification close decisions", () => {
  it.each([undefined, true, "accepted"])("closes for a successful %s result", async result => {
    const callback = vi.fn(() => result); const h = owner().create({ content: "Close", onClose: callback })
    await expect(h.requestClose()).resolves.toBe(true)
    expect(h.closed).toBe(true); expect(callback).toHaveBeenCalledTimes(1)
  })
  it.each([false, Promise.resolve(false)])("retains false decisions and suspends expiry until explicit update", async value => {
    const h = owner().create({ content: "Keep", duration: 10, onClose: () => value })
    await expect(h.requestClose()).resolves.toBe(false)
    await advance(100); expect(h.closed).toBe(false); expect(h.pending).toBe(false)
    h.update({ onClose: undefined, duration: 10 }); await advance(10); expect(h.closed).toBe(true)
  })
  it.each(["throw", "reject"])("surfaces %s, keeps content and exposes a rejecting lastClose promise", async kind => {
    const failure = new Error("Local failure")
    const root = fixture(); const o = owner({}, root)
    const errors: CustomEvent[] = []; root.addEventListener("mui:notification-error", e => errors.push(e as CustomEvent))
    const h = o.create({ content: "Failure", duration: 10, onClose: () => { if (kind === "throw") throw failure; return Promise.reject(failure) } })
    await expect(h.requestClose()).rejects.toBe(failure)
    await advance(100)
    expect(h.closed).toBe(false); expect(h.pending).toBe(false); expect(h.lastError).toBe(failure)
    expect(h.element.querySelector<HTMLElement>("[data-notification-error]")!.hidden).toBe(false)
    expect(errors[0]!.detail.stale).toBe(false)
  })
  it("blocks duplicate close requests, suspends expiry, and disables only the close button", async () => {
    const task = deferred(); const cb = vi.fn(() => task.promise)
    const h = owner({ template: template() }).create({ duration: 10, onClose: cb })
    const first = h.requestClose(); expect(h.requestClose()).toBe(first)
    await flush(); expect(cb).toHaveBeenCalledTimes(1)
    expect(h.pending).toBe(true); expect(close(h.element).disabled).toBe(true)
    expect(h.element.querySelector("input")!.disabled).toBe(false)
    expect(h.element.getAttribute("aria-busy")).toBe("true")
    await advance(100); expect(h.closed).toBe(false)
    task.resolve(true); await expect(first).resolves.toBe(true); expect(h.closed).toBe(true)
  })
  it("preserves native disabled/busy author updates, including identical writes", async () => {
    const task = deferred(); const h = owner().create({ content: "State", onClose: () => task.promise })
    h.element.setAttribute("aria-busy", "false")
    const promise = h.requestClose(); await flush()
    close(h.element).setAttribute("disabled", ""); h.element.setAttribute("aria-busy", "true")
    task.resolve(false); await promise
    expect(close(h.element).disabled).toBe(true); expect(h.element.getAttribute("aria-busy")).toBe("true")
  })
  it.each(["update", "destroy", "dispose", "remove"])("invalidates late acceptance after %s", async action => {
    const task = deferred(); const o = owner(); const h = o.create({ content: "Old", onClose: () => task.promise })
    const promise = h.requestClose(); await flush()
    if (action === "update") h.update({ content: "New", duration: 0 })
    if (action === "destroy") h.destroy()
    if (action === "dispose") o.dispose()
    if (action === "remove") h.element.remove()
    await flush(); const html = h.element.outerHTML
    task.resolve(true); await expect(promise).resolves.toBe(false)
    expect(h.element.outerHTML).toBe(html)
    if (action === "update") expect(h.closed).toBe(false)
  })
  it("reports stale rejection without repainting or poisoning updated state", async () => {
    const root = fixture(); const task = deferred(); const o = owner({}, root)
    const errors: CustomEvent[] = []; root.addEventListener("mui:notification-error", e => { e.preventDefault(); errors.push(e as CustomEvent) })
    const h = o.create({ content: "Old", onClose: () => task.promise }); const promise = h.requestClose(); await flush()
    h.update({ content: "New" }); const html = root.innerHTML
    task.reject(new Error("Stale")); await expect(promise).rejects.toThrow("Stale")
    expect(root.innerHTML).toBe(html); expect(h.lastError).toBeNull(); expect(errors[0]!.detail.stale).toBe(true)
  })
  it("rechecks focus reentrancy and never steals focus from an authored action", async () => {
    const task = deferred(); const h = owner({ template: template() }).create({ onClose: () => task.promise })
    close(h.element).focus(); const promise = h.requestClose(); await flush()
    const input = h.element.querySelector("input")!; input.focus()
    task.resolve(false); await promise
    expect(document.activeElement).toBe(input)
    h.update({ onClose: () => h.update({ title: "New state" }) })
    await expect(h.requestClose()).resolves.toBe(false); expect(h.title).toBe("New state")
  })
  it("bypasses close decisions only for explicit destroy and expiry, with explicit fallback focus", async () => {
    const fallback = document.createElement("button"); document.body.append(fallback)
    const cb = vi.fn(() => false); const o = owner({ focusFallback: fallback })
    const h = o.create({ content: "Explicit", onClose: cb }); close(h.element).focus(); h.destroy()
    expect(document.activeElement).toBe(fallback); expect(cb).not.toHaveBeenCalled()
    const timed = o.create({ content: "Timed", duration: 10, onClose: cb }); await advance(10)
    expect(timed.closed).toBe(true); expect(cb).not.toHaveBeenCalled()
  })
  it("respects later click preventDefault and does not duplicate native action forms", async () => {
    const root = fixture(); const cb = vi.fn()
    const h = owner({ template: template() }, root).create({ onClose: cb })
    root.addEventListener("click", e => e.preventDefault())
    close(h.element).click(); await advance(0); expect(cb).not.toHaveBeenCalled()
    expect(h.element.querySelector("form")!.checkValidity()).toBe(false)
    expect(h.element.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))).toBe(true)
  })
  it("rejects a close callback returning its own close promise instead of hanging", async () => {
    const h = owner().create({ content: "Cycle", onClose: () => h.requestClose() })
    await expect(h.requestClose()).rejects.toThrow(/own close/)
    expect(h.pending).toBe(false); expect(h.closed).toBe(false)
  })
  it("blocks reentrant creation/updates during teardown and clears pending resources", async () => {
    const root = fixture(); const o = owner({}, root); const task = deferred()
    const a = o.create({ content: "A", onClose: () => task.promise }); const b = o.create({ content: "B" })
    const promise = a.requestClose(); await flush()
    let blocked = 0
    root.addEventListener("mui:notification-remove", () => {
      try { o.create({ content: "No" }) } catch { blocked++ }
      try { b.update({ content: "No" }) } catch { blocked++ }
    })
    o.destroyAll(); expect(blocked).toBe(4)
    task.resolve(true); await expect(promise).resolves.toBe(false)
    expect(o.notifications).toHaveLength(0)
  })
  it("has a reusable pending-attribute ledger that preserves unrelated state", () => {
    const button = document.createElement("button"); document.body.append(button)
    const attrs = createFeedbackAttributes(document)
    button.style.color = "red"; attrs.set(button, "disabled", "")
    button.setAttribute("disabled", ""); attrs.restore()
    expect(button.disabled).toBe(true); expect(button.style.color).toBe("red")
  })
  it("does not let an old attribute restoration overwrite a reentrant pending operation", async () => {
    let handle: ReturnType<NotificationOwner["create"]> | undefined
    let reacted = false
    const second = deferred()
    customElements.define("notification-pending-reentry", class extends HTMLParagraphElement {
      static get observedAttributes() { return ["hidden"] }
      attributeChangedCallback(_name: string, before: string | null, after: string | null) {
        if (handle && !reacted && before === null && after !== null) {
          reacted = true
          handle.update({ content: "New operation", onClose: () => second.promise })
          void handle.requestClose()
        }
      }
    }, { extends: "p" })
    const t = template()
    const pending = document.createElement("p", { is: "notification-pending-reentry" })
    pending.dataset.notificationPending = ""; pending.hidden = true; pending.textContent = "Waiting"
    t.content.querySelector("[data-notification-pending]")!.replaceWith(pending)
    handle = owner({ template: t }).create({ duration: 20, onClose: () => false })
    await expect(handle.requestClose()).resolves.toBe(false)
    expect(handle.pending).toBe(true)
    expect(close(handle.element).disabled).toBe(true)
    expect(handle.element.getAttribute("aria-busy")).toBe("true")
    await advance(100); expect(handle.closed).toBe(false)
    second.resolve(true); await expect(handle.lastClose).resolves.toBe(true)
  })
  it("does not restart expiry when reentrant painting supersedes an update", async () => {
    let handle: ReturnType<NotificationOwner["create"]> | undefined
    let reacted = false
    const decision = deferred()
    customElements.define("notification-title-reentry", class extends HTMLHeadingElement {
      static get observedAttributes() { return ["hidden"] }
      attributeChangedCallback(_name: string, before: string | null, after: string | null) {
        if (handle && !reacted && before === null && after !== null) {
          reacted = true
          handle.update({ title: "New title", onClose: () => decision.promise })
          void handle.requestClose()
        }
      }
    }, { extends: "h3" })
    const t = template()
    const title = document.createElement("h3", { is: "notification-title-reentry" })
    title.dataset.notificationTitle = ""; title.textContent = "Initial title"
    t.content.querySelector("[data-notification-title]")!.replaceWith(title)
    handle = owner({ template: t }).create({ duration: 20 })
    expect(() => handle!.update({ title: "" })).toThrow(/interrupted/)
    expect(handle.pending).toBe(true); expect(handle.remaining).toBe(0)
    await advance(100); expect(handle.closed).toBe(false)
    decision.resolve(false); await expect(handle.lastClose).resolves.toBe(false)
  })
  it("ships rich external CSS and shared safe placement with no transition/OS API", () => {
    const css = readFileSync(resolve("src", "components", "notification", "notification.css"), "utf8")
    const build = readFileSync(resolve("scripts", "build.mjs"), "utf8")
    expect(build).toContain('name === "message" || name === "notification"')
    expect(css).toContain("data-notification-avatar")
    expect(css).toContain("white-space: pre-wrap")
    expect(css).toContain("forced-colors")
    expect(css).toContain("prefers-reduced-motion")
    expect(css).not.toContain("@keyframes")
  })
})
