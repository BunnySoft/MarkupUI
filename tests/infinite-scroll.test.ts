import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createInfiniteScroll } from "../src/components/infinite-scroll/index.js"
import type { InfiniteScrollContext, InfiniteScrollController, InfiniteScrollOptions, InfiniteScrollResult } from "../src/components/infinite-scroll/index.js"

describe("Infinite Scroll default styles", () => {
  const css = readFileSync(resolve("src", "components", "infinite-scroll", "infinite-scroll.css"), "utf8")

  it("keeps native scrolling and sentinel geometry within the unchanged ceiling", () => {
    expect(css).toContain("overflow: auto")
    expect(css).toContain("max-block-size: var(--mui-infinite-scroll-height, none)")
    expect(css).toContain("block-size: 1px")
    expect(css).toContain("inline-size: 100%")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
  })

  it("does not impose component paint, spacing, viewport height or status styling", () => {
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:color|background(?:-[\w-]+)?|font(?:-[\w-]+)?|padding(?:-[\w-]+)?|margin(?:-[\w-]+)?|border(?:-[\w-]+)?|cursor)\s*:/m)
    expect(css).not.toContain("20rem")
    expect(css).not.toContain("[data-infinite-message")
  })

  it("retains visible focus and static reduced-motion and print behavior", () => {
    expect(css).toContain(":focus-visible")
    expect(css).toContain("@media (prefers-reduced-motion: reduce)")
    expect(css).toContain("@media print")
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:animation|transition)(?:-[\w-]+)?\s*:/m)
  })
})

class Observer {
  static instances: Observer[] = []
  readonly root: Element | Document | null
  readonly rootMargin: string
  readonly thresholds = [0]
  readonly delay = 0
  readonly trackVisibility = false
  readonly scrollMargin = "0px"
  target: Element | null = null
  disconnect = vi.fn()
  unobserve = vi.fn()
  takeRecords = () => [] as IntersectionObserverEntry[]
  constructor(readonly callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
    this.root = options.root ?? null; this.rootMargin = options.rootMargin ?? ""
    Observer.instances.push(this)
  }
  observe(target: Element) { this.target = target }
  enter(value = true, height = 100) {
    const rect = new DOMRect(0, 0, 200, height)
    this.callback([{ target: this.target!, isIntersecting: value, intersectionRatio: value ? 1 : 0,
      time: 0, rootBounds: rect, boundingClientRect: rect, intersectionRect: rect }], this)
  }
}
const controllers: InfiniteScrollController[] = []
const turn = () => new Promise(resolve => setTimeout(resolve, 0))
function deferred<T>() {
  let resolve!: (result: T) => void, reject!: (error: unknown) => void
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail })
  return { promise, resolve, reject }
}
function fixture(input: Partial<InfiniteScrollOptions> = {}, setup?: (root: HTMLElement) => void) {
  if (!Object.prototype.hasOwnProperty.call(window, "IntersectionObserver")) vi.stubGlobal("IntersectionObserver", Observer)
  const form = document.createElement("form")
  form.innerHTML = `<section class="mui-infinite-scroll" data-infinite-scroll><h2 id="title">Feed</h2>
    <div data-viewport role="region" tabindex="0" aria-labelledby="title" style="overflow-y:auto;height:80px">
      <ul data-infinite-content><li><label>Existing note<input name="note" value="draft"></label><button type="button" data-item-action>Item action</button></li><template><li>Inert template</li></template></ul><div data-infinite-sentinel aria-hidden="true"></div>
    </div><button type="button" data-infinite-load hidden>Load more or retry</button>
    ${["loading", "cancelling", "error", "finished", "disabled", "paused"].map(name => `<p data-infinite-message="${name}" hidden>${name} information</p>`).join("")}
    <a href="#footer">Static fallback</a></section><footer id="footer"><button type="button">Footer action</button></footer>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-infinite-scroll]")!, viewport = root.querySelector<HTMLElement>("[data-viewport]")!
  const content = root.querySelector<HTMLElement>("[data-infinite-content]")!, sentinel = root.querySelector<HTMLElement>("[data-infinite-sentinel]")!, button = root.querySelector<HTMLButtonElement>("[data-infinite-load]")!
  setup?.(root)
  let count = 0
  const load = vi.fn((_context: InfiniteScrollContext): InfiniteScrollResult | Promise<InfiniteScrollResult> => ({
    added: 1, hasMore: true, commit: () => { const item = document.createElement("li"); item.textContent = `Added ${++count}`; content.append(item) },
  }))
  const helper = createInfiniteScroll(root, { scrollRoot: viewport, load, ...input }); controllers.push(helper)
  const io = () => Observer.instances.at(-1)!
  const message = (phase: string) => root.querySelector<HTMLElement>(`[data-infinite-message="${phase}"]`)!
  return { helper, root, viewport, content, sentinel, button, form, load, io, message }
}
afterEach(() => {
  controllers.splice(0).forEach(helper => helper.disconnect())
  document.body.replaceChildren(); Observer.instances = []; vi.restoreAllMocks(); vi.unstubAllGlobals()
})

describe("native content, roots and manual behavior", () => {
  it("preserves native item nodes, edits, listeners, labels, templates and form fields", async () => {
    const { helper, content, form, root } = fixture({ automatic: false }), item = content.firstElementChild!, field = content.querySelector("input")!, listener = vi.fn()
    item.addEventListener("example", listener); field.value = "current edit"
    const submit = vi.fn(); form.addEventListener("submit", submit)
    expect((await helper.load()).status).toBe("loaded")
    expect(content.firstElementChild).toBe(item); expect(field.value).toBe("current edit"); item.dispatchEvent(new Event("example"))
    expect(listener).toHaveBeenCalledOnce(); expect([...new FormData(form)]).toEqual([["note", "current edit"]])
    expect(content.querySelector("template")!.content.querySelector("li")!.textContent).toBe("Inert template")
    expect(root.querySelector("[data-infinite-load]")!.getAttribute("type")).toBe("button"); expect(submit).not.toHaveBeenCalled()
  })
  it("uses the exact native root and bottom-only pixel threshold, without a wheel handler", async () => {
    const { io, viewport, load } = fixture({ distance: 75.5 })
    expect(io().root).toBe(viewport); expect(io().rootMargin).toBe("0px 0px 75.5px 0px")
    viewport.dispatchEvent(new WheelEvent("wheel", { deltaY: 100, bubbles: true })); await turn()
    expect(load).not.toHaveBeenCalled()
  })
  it("supports the page root explicitly with null", () => {
    const { helper, io } = fixture({ scrollRoot: null })
    expect(helper.scrollRoot).toBeNull(); expect(io().root).toBeNull()
  })
  it("works manually without IntersectionObserver or a polyfill", async () => {
    vi.stubGlobal("IntersectionObserver", undefined)
    const { helper, button, load } = fixture()
    expect(helper.state.supported).toBe(false); expect(helper.state.pauseReason).toBe("unsupported")
    button.click(); await turn(); expect(load).toHaveBeenCalledOnce(); expect(helper.state.lastAdded).toBe(1)
  })
  it("cancels native manual clicks after dispatch and never submits a surrounding form", async () => {
    const { button, form, load } = fixture()
    const submit = vi.fn(); form.addEventListener("submit", submit)
    button.addEventListener("click", event => event.preventDefault(), { once: true }); button.click(); await turn()
    expect(load).not.toHaveBeenCalled()
    button.click(); await turn(); expect(load).toHaveBeenCalledOnce(); expect(submit).not.toHaveBeenCalled()
  })
  it("keeps a busy manual button focusable without disabling application controls", async () => {
    const task = deferred<InfiniteScrollResult>(), { helper, button, content, message } = fixture({ load: () => task.promise })
    button.focus(); const promise = helper.load(); await turn()
    expect(button.disabled).toBe(false); expect(button.getAttribute("aria-disabled")).toBe("true")
    expect(document.activeElement).toBe(button); expect(content.querySelector("input")!.disabled).toBe(false)
    expect(content.getAttribute("aria-busy")).toBe("true"); expect(message("loading").hidden).toBe(false)
    task.resolve({ added: 0, hasMore: false }); await promise
    expect(document.activeElement).toBe(button); expect(message("finished").hidden).toBe(false)
  })
  it("does not assign scrolling coordinates or move outside focus", async () => {
    const { helper, viewport, form } = fixture({ automatic: false }), outside = form.querySelector<HTMLElement>("footer button")!
    viewport.scrollTop = 12; viewport.scrollLeft = 8; outside.focus(); await helper.load()
    expect(viewport.scrollTop).toBe(12); expect(viewport.scrollLeft).toBe(8); expect(document.activeElement).toBe(outside)
  })
  it.each([{ distance: -1 }, { distance: Infinity }, { distance: 4097 }, { distance: "2" }, { automaticLimit: -1 }, { automaticLimit: 21 }, { automaticLimit: 1.5 }, { disabled: null }, { hasMore: "yes" }, { automatic: 1 }, { remote: true }])("rejects invalid settings %j", input => {
    expect(() => fixture(input as never)).toThrow()
  })
  it("rejects foreign, non-ancestor or non-native-scroll roots atomically", () => {
    const { helper, viewport } = fixture(), other = document.createElement("div")
    document.body.append(other)
    expect(() => helper.set({ scrollRoot: other })).toThrow("scrollRoot")
    expect(() => helper.set({ scrollRoot: document.createElement("div") })).toThrow()
    expect(() => helper.set({ scrollRoot: window as never })).toThrow()
    viewport.style.overflowY = "visible"; expect(() => helper.refresh()).toThrow("overflow")
  })
  it("rejects invalid/duplicate sentinel, button, message and content ownership", () => {
    expect(() => fixture({}, root => { root.querySelector("[data-infinite-sentinel]")!.textContent = "not empty" })).toThrow()
    expect(() => fixture({}, root => { root.querySelector("[data-infinite-load]")!.setAttribute("type", "submit") })).toThrow()
    expect(() => fixture({}, root => { root.querySelector('[data-infinite-message="error"]')!.append(document.createElement("b")) })).toThrow()
    const { root } = fixture(); expect(() => createInfiniteScroll(root, { load: () => ({ added: 0, hasMore: false }) })).toThrow("unowned")
  })
})

describe("bounded observer enhancement", () => {
  it("performs only one automatic load for a persistently visible underfilled sentinel", async () => {
    const { io, helper, load } = fixture()
    io().enter(); io().enter(); await turn(); io().enter(); await turn()
    expect(load).toHaveBeenCalledOnce(); expect(helper.state.pauseReason).toBe("entry"); expect(helper.state.automaticUsed).toBe(1)
  })
  it("does not trigger on a zero-area scroll root", async () => {
    const { io, load } = fixture()
    io().enter(true, 0); await turn(); expect(load).not.toHaveBeenCalled()
  })
  it("rearms on exit/reentry but bounds all automatic loads per reset, protecting the footer", async () => {
    const { helper, io, load, button } = fixture({ automaticLimit: 2 })
    for (let i = 0; i < 8; i++) { io().enter(false); io().enter(true); await turn() }
    expect(load).toHaveBeenCalledTimes(2); expect(helper.state.pauseReason).toBe("limit")
    button.click(); await turn(); expect(load).toHaveBeenCalledTimes(3); expect(helper.state.automaticUsed).toBe(2)
  })
  it("applies the hard automatic budget even when a caller falsely reports growth", async () => {
    const load = vi.fn(() => ({ added: 1, hasMore: true, commit: () => {} }))
    const { io, helper } = fixture({ load, automaticLimit: 3 })
    for (let i = 0; i < 20; i++) { io().enter(false); io().enter(true); await turn() }
    expect(load).toHaveBeenCalledTimes(3); expect(helper.state.automaticUsed).toBe(3)
  })
  it("pauses no-progress results across further intersections and allows explicit retry", async () => {
    let progress = false
    const load = vi.fn(() => ({ added: progress ? 1 : 0, hasMore: true, commit: () => {} }))
    const { helper, io, button } = fixture({ load })
    const old = io(); old.enter(); await turn()
    expect(helper.state.pauseReason).toBe("no-progress")
    old.enter(false); old.enter(true); await turn(); expect(load).toHaveBeenCalledOnce()
    progress = true; button.click(); await turn(); expect(load).toHaveBeenCalledTimes(2)
    io().enter(true); await turn(); expect(load).toHaveBeenCalledTimes(2)
    io().enter(false); io().enter(true); await turn(); expect(load).toHaveBeenCalledTimes(3)
  })
  it("zero automatic budget and manual-only mode still offer real manual loading", async () => {
    const { helper, io, load } = fixture({ automaticLimit: 0 })
    io().enter(); await turn(); expect(load).not.toHaveBeenCalled()
    await helper.load(); expect(load).toHaveBeenCalledOnce()
    helper.set({ automatic: false }); expect(helper.state.pauseReason).toBe("manual")
    await helper.load(); expect(load).toHaveBeenCalledTimes(2)
  })
  it("finishes explicitly, retains items and refuses more loads until explicit reset", async () => {
    const { helper, io, button, content, message } = fixture({ load: () => ({ added: 0, hasMore: false }) }), first = content.firstElementChild
    io().enter(); await turn(); expect(helper.state.phase).toBe("finished")
    expect(message("finished").hidden).toBe(false); expect(button.getAttribute("aria-disabled")).toBe("true"); expect(content.firstElementChild).toBe(first)
    await expect(helper.load()).rejects.toThrow("finished")
    helper.reset(); expect(helper.state.hasMore).toBe(true); expect(helper.state.automaticUsed).toBe(0)
  })
  it("does not renew entry permission or automatic budget merely on refresh", async () => {
    const { helper, io, load } = fixture()
    io().enter(); await turn()
    helper.refresh(); io().enter(); await turn()
    expect(load).toHaveBeenCalledOnce(); expect(helper.state.automaticUsed).toBe(1)
  })
})

describe("completion, failures and guarded application commit", () => {
  it("coalesces one pending promise and commits only a current validated result", async () => {
    const task = deferred<InfiniteScrollResult>(), contexts: InfiniteScrollContext[] = [], commit = vi.fn()
    const { helper } = fixture({ load: context => { contexts.push(context); return task.promise } })
    const first = helper.load(), second = helper.load()
    expect(first).toBe(second); await turn(); expect(contexts).toHaveLength(1); expect(contexts[0]!.isCurrent()).toBe(true)
    task.resolve({ added: 2, hasMore: true, commit }); expect(await first).toEqual({ status: "loaded", added: 2, hasMore: true })
    expect(commit).toHaveBeenCalledOnce(); expect(contexts[0]!.isCurrent()).toBe(false)
  })
  it.each([undefined, {}, { added: -1, hasMore: true }, { added: NaN, hasMore: true }, { added: 1, hasMore: "yes" }, { added: 1, hasMore: true }, { added: 0, hasMore: true, more: true }])("rejects incomplete/invalid completion %j, rather than assuming more", async result => {
    const commit = vi.fn()
    const value = result && typeof result === "object" && "added" in result && result.added !== 1 ? { ...result, commit } : result
    const { helper, message } = fixture({ load: () => value as never })
    const outcome = await helper.load(); expect(outcome.status).toBe("error"); expect(helper.state.phase).toBe("error")
    expect(message("error").hidden).toBe(false); expect(commit).not.toHaveBeenCalled()
  })
  it("surfaces rejection once, halts auto retries and supports a deliberate manual retry", async () => {
    const error = new Error("local failure"), load = vi.fn().mockRejectedValueOnce(error).mockResolvedValue({ added: 1, hasMore: true, commit: () => {} })
    const { helper, root, io, button } = fixture({ load }), listener = vi.fn()
    root.addEventListener("mui:infinite-error", listener)
    const outcome = await helper.load(); expect(outcome).toEqual({ status: "error", error }); expect(helper.error).toBe(error)
    io().enter(); await turn(); expect(load).toHaveBeenCalledOnce(); expect(listener).toHaveBeenCalledOnce()
    button.click(); await turn(); expect(load).toHaveBeenCalledTimes(2); expect(helper.error).toBeNull()
    io().enter(true); await turn(); expect(load).toHaveBeenCalledTimes(2)
  })
  it("does not mistake throw null for the absence of an error", async () => {
    const { helper } = fixture({ load: () => { throw null } })
    expect(await helper.load()).toEqual({ status: "error", error: null }); expect(helper.state.phase).toBe("error")
  })
  it("copies completion values before an application commit mutates its result object", async () => {
    const result: InfiniteScrollResult = { added: 1, hasMore: false, commit: () => { result.added = 99; result.hasMore = true } }
    const { helper } = fixture({ load: () => result })
    expect(await helper.load()).toEqual({ status: "loaded", added: 1, hasMore: false })
    expect(helper.state.lastAdded).toBe(1); expect(helper.state.phase).toBe("finished")
  })
  it("reports throwing/async commits without claiming application side effects were rolled back", async () => {
    const failure = new Error("commit failed"), first = fixture({ load: () => ({ added: 1, hasMore: true, commit: () => { throw failure } }) })
    expect(await first.helper.load()).toEqual({ status: "error", error: failure })
    const second = fixture({ load: () => ({ added: 1, hasMore: true, commit: async () => {} }) })
    const outcome = await second.helper.load(); expect(outcome.status).toBe("error"); expect(String(second.helper.error)).toContain("synchronous")
  })
  it("rejects commit reentrancy, but allows disconnect to revoke its result", async () => {
    let action = () => {}
    const { helper } = fixture({ load: () => ({ added: 1, hasMore: true, commit: () => action() }) })
    action = () => helper.reset(); expect((await helper.load()).status).toBe("error")
    action = () => helper.disconnect(); expect((await helper.load()).status).toBe("aborted"); expect(helper.connected).toBe(false)
  })
  it("allows the loader to reset its generation before returning without committing stale work", async () => {
    let reset = () => {}; const commit = vi.fn()
    const { helper } = fixture({ load: () => { reset(); return { added: 1, hasMore: true, commit } } })
    reset = () => helper.reset()
    expect((await helper.load()).status).toBe("aborted"); expect(commit).not.toHaveBeenCalled()
  })
  it("does not emit an old error after a state listener resets the failed generation", async () => {
    const { helper, root } = fixture({ load: () => { throw new Error("old") } }), errors = vi.fn()
    root.addEventListener("mui:infinite-error", errors)
    root.addEventListener("mui:infinite-state", event => { if ((event as CustomEvent).detail.phase === "error") helper.reset() })
    expect((await helper.load()).status).toBe("error")
    expect(helper.error).toBeNull(); expect(errors).not.toHaveBeenCalled()
  })
})

describe("cancellation, native constraints and ownership races", () => {
  it("serializes even a noncooperative aborted loader until it actually settles", async () => {
    const task = deferred<InfiniteScrollResult>(), commit = vi.fn(), contexts: InfiniteScrollContext[] = []
    const load = vi.fn((context: InfiniteScrollContext) => { contexts.push(context); return task.promise })
    const { helper, message } = fixture({ load })
    const promise = helper.load(); await turn(); helper.set({ disabled: true })
    expect(contexts[0]!.signal.aborted).toBe(true); expect(message("cancelling").hidden).toBe(false)
    helper.set({ disabled: false }); await expect(helper.load()).rejects.toThrow("settle")
    expect(load).toHaveBeenCalledOnce()
    task.resolve({ added: 1, hasMore: false, commit })
    expect((await promise).status).toBe("aborted"); expect(commit).not.toHaveBeenCalled(); expect(helper.state.hasMore).toBe(true)
    expect(helper.state.pending).toBe(false)
  })
  it("ignores stale rejection for new state while returning an explicit aborted cause", async () => {
    const task = deferred<InfiniteScrollResult>(), error = new Error("old request")
    const { helper, root } = fixture({ load: () => task.promise }), errors = vi.fn()
    root.addEventListener("mui:infinite-error", errors)
    const promise = helper.load(); await turn(); helper.reset({ hasMore: false }); task.reject(error)
    const outcome = await promise
    expect(outcome.status).toBe("aborted"); expect(outcome).toHaveProperty("cause", error)
    expect(helper.state.phase).toBe("finished"); expect(helper.error).toBeNull(); expect(errors).not.toHaveBeenCalled()
  })
  it("handles cooperative AbortSignal rejection and prevents a stale commit after root change", async () => {
    let signal: AbortSignal | undefined
    const { helper, io } = fixture({ load: context => {
      signal = context.signal
      return new Promise((_, reject) => context.signal.addEventListener("abort", () => reject(context.signal.reason), { once: true }))
    } })
    const oldObserver = io(), promise = helper.load(); await turn()
    helper.set({ scrollRoot: null }); expect(signal!.aborted).toBe(true)
    expect((await promise).status).toBe("aborted"); expect(oldObserver.disconnect).toHaveBeenCalled()
    expect(io().root).toBeNull()
  })
  it("ignores callbacks from old observer/root generations", async () => {
    const { helper, io, load } = fixture(), old = io()
    helper.set({ scrollRoot: null, distance: 25 }); old.enter(); await turn(); expect(load).not.toHaveBeenCalled()
    io().enter(); await turn(); expect(load).toHaveBeenCalledOnce()
  })
  it("invalid setting/reset inputs do not abort a healthy pending request", async () => {
    const task = deferred<InfiniteScrollResult>(); let context!: InfiniteScrollContext
    const { helper } = fixture({ load: value => { context = value; return task.promise } })
    const promise = helper.load(); await turn(); const generation = helper.state.generation
    expect(() => helper.set({ distance: -1 })).toThrow()
    expect(() => helper.reset({ hasMore: undefined })).toThrow()
    expect(context.signal.aborted).toBe(false); expect(helper.state.generation).toBe(generation)
    task.resolve({ added: 0, hasMore: false }); expect((await promise).status).toBe("loaded")
  })
  it("can cancel before the queued loader starts through a loading-state listener", async () => {
    const { helper, root, load } = fixture()
    root.addEventListener("mui:infinite-state", event => { if ((event as CustomEvent).detail.phase === "loading") helper.set({ disabled: true }) })
    expect((await helper.load()).status).toBe("aborted"); expect(load).not.toHaveBeenCalled()
  })
  it.each(["disabled", "hidden", "inert"])("honors native %s cancellation without changing native fields", async attribute => {
    const task = deferred<InfiniteScrollResult>(); let context!: InfiniteScrollContext
    const { helper, root, button } = fixture({ load: value => { context = value; return task.promise } })
    const promise = helper.load(); await turn()
    if (attribute === "disabled") button.disabled = true
    else root.setAttribute(attribute, "")
    await turn(); expect(context.signal.aborted).toBe(true)
    task.resolve({ added: 1, hasMore: true, commit: () => { throw new Error("must not run") } })
    expect((await promise).status).toBe("aborted"); expect(helper.state.phase).toBe("disabled")
  })
  it("respects disabled fieldsets and restores eligibility without removing their attributes", async () => {
    const { helper, root, button, load } = fixture(), fieldset = document.createElement("fieldset")
    root.before(fieldset); fieldset.append(root); fieldset.disabled = true; helper.refresh()
    await expect(helper.load()).rejects.toThrow("disabled"); expect(load).not.toHaveBeenCalled(); expect(button.matches(":disabled")).toBe(true)
    fieldset.disabled = false; await turn(); await helper.load(); expect(load).toHaveBeenCalledOnce()
  })
  it("does not automatically load when the manual control's ancestor is hidden", async () => {
    const { helper, root, button, io, load } = fixture(), controls = document.createElement("div")
    button.before(controls); controls.append(button); controls.hidden = true; helper.refresh()
    io().enter(); await turn(); expect(load).not.toHaveBeenCalled(); expect(helper.state.disabled).toBe(true)
    controls.hidden = false; await turn(); await helper.load(); expect(load).toHaveBeenCalledOnce(); expect(root.contains(button)).toBe(true)
  })
  it("revokes an owner moved into a shadow root before stale data can commit", async () => {
    const task = deferred<InfiniteScrollResult>(), commit = vi.fn()
    const { helper, root } = fixture({ load: () => task.promise }), host = document.createElement("div")
    document.body.append(host); const shadow = host.attachShadow({ mode: "open" })
    const promise = helper.load(); await turn(); shadow.append(root); await turn()
    task.resolve({ added: 1, hasMore: true, commit })
    expect((await promise).status).toBe("aborted"); expect(helper.connected).toBe(false); expect(commit).not.toHaveBeenCalled()
  })
  it("disposes on host removal and releases stale results without resurrecting content", async () => {
    const task = deferred<InfiniteScrollResult>(), commit = vi.fn()
    const { helper, root, content } = fixture({ load: () => task.promise })
    const promise = helper.load(); await turn(); root.remove(); await turn()
    expect(helper.connected).toBe(false); task.resolve({ added: 1, hasMore: true, commit })
    expect((await promise).status).toBe("aborted"); expect(commit).not.toHaveBeenCalled(); expect(content.isConnected).toBe(false)
  })
  it("preserves externally overridden attributes, original controls and items on handoff", async () => {
    const { helper, content, button } = fixture({ automatic: false }), items = [...content.children]
    content.setAttribute("aria-busy", "application"); button.setAttribute("aria-disabled", "application")
    helper.disconnect()
    expect(content.getAttribute("aria-busy")).toBe("application"); expect(button.getAttribute("aria-disabled")).toBe("application")
    expect(button.hidden).toBe(true); expect([...content.children]).toEqual(items)
    await expect(helper.load()).rejects.toThrow("disconnected")
  })
  it("keeps nested owners independent and releases one without stopping the other", async () => {
    const outer = fixture(), inner = fixture()
    outer.content.append(inner.root); outer.helper.refresh()
    await inner.helper.load(); expect(inner.load).toHaveBeenCalledOnce(); expect(outer.load).not.toHaveBeenCalled()
    inner.helper.disconnect(); await outer.helper.load(); expect(outer.load).toHaveBeenCalledOnce(); expect(outer.helper.connected).toBe(true)
  })
  it("fails changed helper anatomy explicitly instead of adopting a replacement sentinel", async () => {
    const { helper, sentinel, root, load } = fixture(), errors = vi.fn()
    root.addEventListener("mui:infinite-error", errors)
    sentinel.replaceWith(sentinel.cloneNode())
    await turn(); expect(helper.state.phase).toBe("error"); expect(errors).toHaveBeenCalled()
    await expect(helper.load()).rejects.toThrow(); expect(load).not.toHaveBeenCalled()
  })
})
