import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { createMarquee } from "../src/components/marquee/index.js"
import type { MarqueeController, MarqueeOptions } from "../src/components/marquee/index.js"

const helpers: MarqueeController[] = []
let reduce: EventTarget & { matches: boolean }, forced: EventTarget & { matches: boolean }, print: EventTarget & { matches: boolean }
let hidden = false, sheet: HTMLStyleElement, animations: FakeAnimation[] = []
class FakeAnimation {
  onfinish: (() => void) | null = null
  oncancel: (() => void) | null = null
  cancel = vi.fn(() => this.oncancel?.())
  constructor(readonly frames: Keyframe[], readonly options: KeyframeAnimationOptions) { animations.push(this) }
  finish() { this.onfinish?.() }
}
class Resize {
  static instances: Resize[] = []
  observe = vi.fn()
  disconnect = vi.fn()
  constructor(readonly callback: ResizeObserverCallback) { Resize.instances.push(this) }
  emit() { this.callback([], {} as ResizeObserver) }
}
function fixture(options: MarqueeOptions = {}, bind = true) {
  const form = document.createElement("form")
  form.innerHTML = `<section class="mui-marquee" data-marquee aria-label="Local announcement">
    <div data-marquee-viewport tabindex="0" aria-label="Scrollable announcement">
      <div data-marquee-content><strong>Original announcement.</strong> All of this text remains one original readable sequence.</div>
    </div>
    <div data-marquee-controls hidden><button type="button" data-marquee-toggle><span data-marquee-label>Play authored motion</span></button></div>
    <p data-marquee-status>Static native fallback.</p>
    </section><label>Native field<input name="title" value="kept"></label><button type="button" data-outside>Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-marquee]")!, viewport = root.querySelector<HTMLElement>("[data-marquee-viewport]")!,
    content = root.querySelector<HTMLElement>("[data-marquee-content]")!, button = root.querySelector<HTMLButtonElement>("[data-marquee-toggle]")!
  let width = 400, natural = 800, height = 40
  Object.defineProperties(viewport, { clientWidth: { get: () => width }, clientHeight: { get: () => height } })
  Object.defineProperties(content, {
    offsetWidth: { get: () => natural },
    offsetLeft: { get: () => getComputedStyle(viewport).direction === "rtl" ? width - natural : 0 },
    offsetParent: { get: () => viewport },
  })
  const animate = vi.fn((frames: Keyframe[], options: KeyframeAnimationOptions) => new FakeAnimation(frames, options) as unknown as Animation)
  content.animate = animate as unknown as typeof content.animate
  const helper = bind ? createMarquee(root, options) : null
  if (helper) helpers.push(helper)
  return { helper: helper!, root, viewport, content, button, animate, form, outside: form.querySelector<HTMLButtonElement>("[data-outside]")!,
    resize(w: number, n = natural, h = height) { width = w; natural = n; height = h; Resize.instances.at(-1)?.emit() },
  }
}
beforeEach(() => {
  hidden = false; animations = []; Resize.instances = []
  reduce = Object.assign(new EventTarget(), { matches: false }); forced = Object.assign(new EventTarget(), { matches: false }); print = Object.assign(new EventTarget(), { matches: false })
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden)
  vi.stubGlobal("matchMedia", (query: string) => query.includes("reduced") ? reduce : query.includes("forced") ? forced : print)
  vi.stubGlobal("ResizeObserver", Resize)
  sheet = document.createElement("style"); sheet.textContent = readFileSync(join("src", "components", "marquee", "marquee.css"), "utf8"); document.head.append(sheet)
})
afterEach(() => {
  helpers.splice(0).forEach(helper => helper.disconnect()); sheet.remove(); document.body.replaceChildren()
  vi.restoreAllMocks(); vi.unstubAllGlobals()
})

describe("Marquee native static content and measurement", () => {
  it("keeps one original noninteractive track and defaults to a readable static view", () => {
    const { helper, content, viewport, button } = fixture()
    expect(helper.state.active).toBe(false); expect(helper.state.phase).toBe("static")
    expect(animations).toHaveLength(0); expect(content.parentElement).toBe(viewport)
    expect(content.querySelectorAll("strong")).toHaveLength(1)
    expect(button.textContent).toBe("Play motion"); expect(viewport.tabIndex).toBe(0)
    expect(getComputedStyle(viewport).overflowX).toBe("auto")
  })
  it("derives actual overflow duration in layout CSS pixels and never clones content", () => {
    const { helper, content, viewport } = fixture({ active: true, speed: 50 }), nodes = [...content.childNodes]
    expect(helper.state.distance).toBe(400); expect(helper.state.duration).toBe(8000)
    expect(animations[0]!.frames).toEqual([{ transform: "translateX(0px)" }, { transform: "translateX(-400px)" }])
    expect(animations[0]!.options).toMatchObject({ duration: 8000, direction: "alternate", iterations: 1, easing: "linear" })
    expect([...content.childNodes]).toEqual(nodes); expect(viewport.children).toHaveLength(1)
  })
  it("supports right/RTL traversal without reordering DOM or using visual rectangles", () => {
    const { helper, viewport, content } = fixture()
    viewport.style.direction = "rtl"; content.getBoundingClientRect = () => new DOMRect(0, 0, 1600, 80)
    helper.play()
    expect(animations.at(-1)!.frames).toEqual([{ transform: "translateX(400px)" }, { transform: "translateX(0px)" }])
    helper.set({ direction: "right" })
    expect(animations.at(-1)!.frames).toEqual([{ transform: "translateX(0px)" }, { transform: "translateX(400px)" }])
    expect(helper.state.duration).toBeCloseTo(400 / 48 * 1000)
  })
  it("uses finite passes/initial delay or explicit native infinite alternate traversal", () => {
    const { helper } = fixture({ active: true, speed: 100, iterations: 3, delay: 250 })
    expect(animations[0]!.options).toMatchObject({ iterations: 3, delay: 250, duration: 4000 })
    helper.set({ iterations: "infinite" }); expect(animations.at(-1)!.options.iterations).toBe(Infinity)
  })
  it("skips fitting, zero-size and overly rapid short travel without polling", () => {
    const { helper, resize } = fixture({ active: true })
    resize(900); expect(helper.state.phase).toBe("static"); expect(helper.state.pauseReasons).toContain("fits")
    resize(0); expect(helper.state.pauseReasons).toContain("zero-size")
    resize(795, 800); helper.set({ speed: 1000 })
    expect(helper.state.pauseReasons).toContain("short-travel")
    resize(400); expect(helper.state.phase).toBe("running")
  })
  it("does not restart a healthy animation on a same-size/height-only observer delivery", () => {
    const { resize, animate } = fixture({ active: true })
    resize(400, 800, 50); expect(animate).toHaveBeenCalledOnce()
    resize(400, 800, 40); expect(animate).toHaveBeenCalledOnce()
  })
  it("restarts only on real resize/content changes and guards old native completions", async () => {
    const { helper, resize, content } = fixture({ active: true })
    const previous = animations[0]!, stale = previous.onfinish!
    resize(500); expect(previous.cancel).toHaveBeenCalledOnce(); expect(helper.state.distance).toBe(300)
    stale(); expect(helper.state.phase).toBe("running")
    content.append(document.createTextNode(" New native text.")); await Promise.resolve()
    expect(animations.length).toBe(3); expect(helper.state.phase).toBe("running")
  })
})

describe("Marquee explicit pause, reading and media policy", () => {
  it("requires only native button click once, does not submit, and preserves control focus", () => {
    const { helper, button, form } = fixture(), submit = vi.fn()
    form.addEventListener("submit", event => { event.preventDefault(); submit() })
    button.focus(); button.click()
    expect(helper.state.active).toBe(true); expect(helper.state.phase).toBe("running")
    expect(document.activeElement).toBe(button); expect(submit).not.toHaveBeenCalled()
    button.click(); expect(helper.state.active).toBe(false); expect(helper.state.phase).toBe("static")
  })
  it("stops when the real pause control becomes disabled or hidden without owning those changes", async () => {
    const { helper, button, root } = fixture({ active: true })
    button.disabled = true; await Promise.resolve()
    expect(helper.state.pauseReasons).toContain("control-unavailable"); expect(helper.state.phase).toBe("static")
    helper.refresh(); expect(button.disabled).toBe(true)
    button.disabled = false; await Promise.resolve(); expect(helper.state.phase).toBe("running")
    const controls = root.querySelector<HTMLElement>("[data-marquee-controls]")!
    controls.hidden = true; await Promise.resolve()
    expect(helper.state.phase).toBe("static"); expect(controls.hidden).toBe(true)
    helper.disconnect(); expect(controls.hidden).toBe(true)
  })
  it("respects disabled fieldset ancestry and initially disabled pause controls", async () => {
    const setup = fixture({}, false); setup.button.disabled = true
    const helper = createMarquee(setup.root, { active: true }); helpers.push(helper)
    expect(helper.state.phase).toBe("static"); expect(animations).toHaveLength(0)
    setup.button.disabled = false; await Promise.resolve()
    const fieldset = document.createElement("fieldset"); setup.form.prepend(fieldset); fieldset.append(setup.root)
    fieldset.disabled = true; await Promise.resolve()
    expect(helper.state.pauseReasons).toContain("control-unavailable")
    expect(helper.state.active).toBe(true); expect(helper.state.phase).toBe("static")
  })
  it("stops when only the pause control is inside a closed native disclosure", async () => {
    const { helper, root } = fixture({ active: true }), details = document.createElement("details")
    details.append(document.createElement("summary")); root.append(details)
    details.append(root.querySelector("[data-marquee-controls]")!); await Promise.resolve()
    expect(helper.state.phase).toBe("static"); expect(helper.state.pauseReasons).toContain("control-unavailable")
    details.open = true; await Promise.resolve(); expect(helper.state.phase).toBe("running")
  })
  it("cancels transform into native static scrolling for hover and restarts on leave", () => {
    const { helper, viewport, root } = fixture({ active: true })
    const original = animations[0]!
    viewport.dispatchEvent(new Event("pointerenter"))
    expect(original.cancel).toHaveBeenCalledOnce(); expect(root.hasAttribute("data-marquee-running")).toBe(false)
    expect(getComputedStyle(viewport).overflowX).toBe("auto"); expect(helper.state.pauseReasons).toContain("hover")
    viewport.dispatchEvent(new Event("pointerleave")); expect(helper.state.phase).toBe("running")
  })
  it("never overrides explicit user pause when temporary pause reasons clear", () => {
    const { helper, viewport } = fixture({ active: true })
    viewport.dispatchEvent(new Event("pointerenter")); helper.pause()
    viewport.dispatchEvent(new Event("pointerleave"))
    hidden = true; document.dispatchEvent(new Event("visibilitychange"))
    hidden = false; document.dispatchEvent(new Event("visibilitychange"))
    expect(helper.state.active).toBe(false); expect(helper.state.phase).toBe("static")
    expect(animations).toHaveLength(1)
  })
  it("stops/reveals on viewport focus and does not steal native form focus", () => {
    const { helper, viewport, outside, form } = fixture({ active: true })
    viewport.focus(); expect(helper.state.pauseReasons).toContain("focus"); expect(helper.state.phase).toBe("static")
    expect(document.activeElement).toBe(viewport)
    outside.focus(); expect(helper.state.phase).toBe("running"); expect(document.activeElement).toBe(outside)
    expect([...new FormData(form)]).toEqual([["title", "kept"]])
  })
  it("preserves native selected text and original listeners without changing content", () => {
    const { helper, content } = fixture({ active: true }), strong = content.querySelector("strong")!, called = vi.fn()
    strong.addEventListener("probe", called)
    const range = document.createRange(); range.selectNodeContents(strong)
    document.getSelection()!.removeAllRanges(); document.getSelection()!.addRange(range)
    document.dispatchEvent(new Event("selectionchange"))
    const selection = document.getSelection()!.toString()
    expect(helper.state.phase).toBe("static"); expect(helper.state.pauseReasons).toContain("selection")
    helper.refresh(); expect(document.getSelection()!.toString()).toBe(selection)
    strong.dispatchEvent(new Event("probe")); expect(called).toHaveBeenCalledOnce()
    document.getSelection()!.removeAllRanges(); document.dispatchEvent(new Event("selectionchange"))
    expect(helper.state.phase).toBe("running")
  })
  it.each(["reduce", "forced", "print", "hidden"])("uses static presentation for %s without changing user intent", which => {
    const { helper } = fixture({ active: true })
    if (which === "hidden") { hidden = true; document.dispatchEvent(new Event("visibilitychange")) }
    else { const media = which === "reduce" ? reduce : which === "forced" ? forced : print; media.matches = true; media.dispatchEvent(new Event("change")) }
    expect(helper.state.phase).toBe("static"); expect(helper.state.active).toBe(true)
    expect(animations[0]!.cancel).toHaveBeenCalledOnce()
  })
  it("honors already-current reduced motion before a delayed media event", () => {
    const { helper } = fixture()
    reduce.matches = true; helper.play()
    expect(helper.state.pauseReasons).toContain("reduced-motion"); expect(animations).toHaveLength(0)
  })
  it("shows no dead motion controls when animation or media support is unavailable", () => {
    const setup = fixture({}, false)
    setup.content.animate = undefined as never
    const helper = createMarquee(setup.root, { active: true }); helpers.push(helper)
    expect(helper.state.supported).toBe(false); expect(helper.state.phase).toBe("static")
    expect(setup.root.querySelector("[data-marquee-controls]")!.hasAttribute("hidden")).toBe(true)
  })
})

describe("Marquee ownership, failure and finish", () => {
  it.each([{ speed: 0 }, { speed: NaN }, { speed: 1001 }, { delay: -1 }, { delay: 60001 },
    { iterations: 0 }, { iterations: 101 }, { iterations: 1.5 }, { direction: "up" }, { active: "yes" },
    { autoFill: true }, { playLabel: "" }])("rejects invalid settings before cancelling a valid run", options => {
    const { helper } = fixture({ active: true }), current = animations[0]!
    expect(() => helper.set(options as MarqueeOptions)).toThrow()
    expect(current.cancel).not.toHaveBeenCalled(); expect(helper.state.phase).toBe("running")
  })
  it("rejects interactive/oversized content before exposing enhancement", () => {
    const setup = fixture({}, false); setup.content.append(document.createElement("button"))
    expect(() => createMarquee(setup.root)).toThrow(/noninteractive/)
    expect(setup.root.querySelector("[data-marquee-controls]")!.hasAttribute("hidden")).toBe(true)
    const tooLong = fixture({}, false); tooLong.content.textContent = "x".repeat(16385)
    expect(() => createMarquee(tooLong.root)).toThrow(/16,384/)
  })
  it("keeps newly authored controls reachable in static error fallback instead of deleting them", async () => {
    const { helper, content, root } = fixture({ active: true })
    const input = document.createElement("input"); input.name = "late"; input.value = "kept"; content.append(input)
    await Promise.resolve()
    expect(helper.state.phase).toBe("error"); expect(root.hasAttribute("data-marquee-running")).toBe(false)
    expect(content.contains(input)).toBe(true); expect(input.value).toBe("kept")
  })
  it("rejects conflicting transforms/bad layout geometry and leaves original styles intact", () => {
    const { helper, content } = fixture()
    content.style.transform = "rotate(10deg)"
    expect(() => helper.play()).toThrow(/untransformed/)
    expect(helper.state.phase).toBe("error")
  })
  it("finishes once, restores static full content and allows explicit replay", () => {
    const { helper, root } = fixture({ active: true }), finished = vi.fn()
    root.addEventListener("mui:marquee-finish", finished)
    const original = animations[0]!, callback = original.onfinish!
    original.finish(); callback()
    expect(finished).toHaveBeenCalledOnce(); expect(helper.state.phase).toBe("finished"); expect(helper.state.active).toBe(false)
    expect(root.hasAttribute("data-marquee-running")).toBe(false)
    helper.play(); expect(helper.state.phase).toBe("running"); expect(animations).toHaveLength(2)
  })
  it("reports falsy native animation errors and safely reenters from a finish listener", () => {
    const { helper, content, root } = fixture(), error = vi.fn(), original = content.animate
    root.addEventListener("mui:marquee-error", error)
    content.animate = () => { throw 0 }
    let caught: unknown
    try { helper.play() } catch (value) { caught = value }
    expect(caught).toBe(0); expect(error).toHaveBeenCalledOnce(); expect(helper.state.phase).toBe("error")
    content.animate = original; helper.play()
    const stale = animations.at(-1)!.onfinish!
    root.addEventListener("mui:marquee-finish", () => helper.play(), { once: true })
    stale(); expect(helper.state.phase).toBe("running")
    const latest = animations.at(-1)!
    stale(); expect(latest.cancel).not.toHaveBeenCalled()
  })
  it("treats external native cancellation as a persistent stop", () => {
    const { helper, viewport } = fixture({ active: true })
    animations[0]!.cancel()
    expect(helper.state.active).toBe(false); expect(helper.state.pauseReasons).toContain("cancelled")
    viewport.dispatchEvent(new Event("pointerleave")); expect(animations).toHaveLength(1)
  })
  it("does not leave motion alive if a native animation factory disposes reentrantly", () => {
    const { helper, content } = fixture()
    content.animate = ((frames: Keyframe[], options: KeyframeAnimationOptions) => {
      helper.disconnect(); return new FakeAnimation(frames, options) as unknown as Animation
    }) as typeof content.animate
    helper.play()
    expect(helper.connected).toBe(false); expect(animations.at(-1)!.cancel).toHaveBeenCalledOnce()
  })
  it("preserves author state and nodes on dispose and safely ignores stale callbacks", () => {
    const { helper, content, root, button } = fixture({ active: true })
    const nodes = [...content.childNodes], stale = animations[0]!.onfinish!
    button.setAttribute("aria-label", "Author replacement label")
    helper.disconnect(); helper.disconnect(); stale()
    expect([...content.childNodes]).toEqual(nodes); expect(root.hasAttribute("data-marquee-running")).toBe(false)
    expect(button.getAttribute("aria-label")).toBe("Author replacement label")
    expect(button.textContent).toBe("Play authored motion")
    expect(root.querySelector("[data-marquee-controls]")!.hasAttribute("hidden")).toBe(true)
    expect(Resize.instances[0]!.disconnect).toHaveBeenCalled()
  })
  it("auto-disconnects removed owners and supports explicit rebinding", async () => {
    const { helper, root, form } = fixture({ active: true })
    root.remove(); await Promise.resolve(); expect(helper.connected).toBe(false)
    form.prepend(root); const next = createMarquee(root); helpers.push(next)
    expect(next.connected).toBe(true); expect(next.state.phase).toBe("static")
  })
})
