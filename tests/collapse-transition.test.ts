import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createCollapseTransition } from "../src/components/collapse-transition/index.js"
import type { CollapseTransitionController, CollapseTransitionOptions } from "../src/components/collapse-transition/index.js"

const controllers: CollapseTransitionController[] = []
const animations: FakeAnimation[] = []
const proto = HTMLElement.prototype
const css = readFileSync(resolve("src", "components", "collapse-transition", "collapse-transition.css"), "utf8")
let inertDescriptor: PropertyDescriptor | undefined
let animateDescriptor: PropertyDescriptor | undefined
let reduced: MediaQueryList
let printing: MediaQueryList
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve() }
class FakeAnimation {
  playState: AnimationPlayState = "running"
  finished: Promise<Animation>
  resolve!: (value: Animation) => void
  reject!: (error: unknown) => void
  constructor(readonly frames: Keyframe[], readonly options: KeyframeAnimationOptions) {
    this.finished = new Promise<Animation>((yes, no) => { this.resolve = yes; this.reject = no })
  }
  finish() { this.playState = "finished"; this.resolve(this as unknown as Animation) }
  cancel() { this.playState = "idle"; this.reject(new DOMException("Cancelled", "AbortError")) }
}
function query(media: string) {
  const target = new EventTarget() as EventTarget & { matches: boolean; media: string }
  target.matches = false; target.media = media
  return target as unknown as MediaQueryList
}
function fixture(hidden = false) {
  const host = document.createElement("div")
  host.innerHTML = `<button type="button" data-trigger>Toggle</button><div class="mui-collapse-transition"${hidden ? " hidden" : ""}><div data-collapse-transition-content><h3>Preserved heading</h3><form><label>Reference<input required name="reference"></label><button>Submit</button></form><a href="#target">Link</a></div></div>`
  document.body.append(host)
  const root = host.querySelector<HTMLDivElement>(".mui-collapse-transition")!
  Object.defineProperty(root, "offsetHeight", { configurable: true, get: () => root.hidden ? 0 : 100 })
  Object.defineProperty(root.firstElementChild, "offsetHeight", { configurable: true, value: 100 })
  return root
}
function enhance(options: CollapseTransitionOptions = {}, root = fixture()) {
  const c = createCollapseTransition(root, options); controllers.push(c); return c
}
beforeEach(() => {
  inertDescriptor = Object.getOwnPropertyDescriptor(proto, "inert")
  animateDescriptor = Object.getOwnPropertyDescriptor(proto, "animate")
  Object.defineProperty(proto, "inert", { configurable: true, get() { return this.hasAttribute("inert") }, set(value) { this.toggleAttribute("inert", value) } })
  Object.defineProperty(proto, "animate", { configurable: true, value(frames: Keyframe[], options: KeyframeAnimationOptions) {
    const animation = new FakeAnimation(frames, options); animations.push(animation); return animation
  } })
  reduced = query("(prefers-reduced-motion: reduce)"); printing = query("print")
  vi.stubGlobal("matchMedia", (name: string) => name === "print" ? printing : reduced)
  const style = document.createElement("style"); style.dataset.transitionTest = ""; style.textContent = css; document.head.append(style)
})
afterEach(() => {
  document.querySelector<HTMLInputElement>("input")?.blur()
  for (const c of controllers.splice(0)) { if (c.element.contains(document.activeElement)) (document.activeElement as HTMLElement).blur(); c.dispose() }
  animations.length = 0
  document.body.replaceChildren(); document.head.querySelector("[data-transition-test]")?.remove()
  vi.restoreAllMocks(); vi.unstubAllGlobals()
  for (const [name, descriptor] of [["inert", inertDescriptor], ["animate", animateDescriptor]] as const) {
    if (descriptor) Object.defineProperty(proto, name, descriptor)
    else Reflect.deleteProperty(proto, name)
  }
})

describe("Native Collapse Transition", () => {
  it("packages separately and does not register tags or make Collapse depend on it", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    expect(pkg.exports["./collapse-transition"].import).toBe("./dist/markup-ui-collapse-transition.js")
    expect(pkg.exports["./collapse-transition/style.css"]).toBe("./dist/markup-ui-collapse-transition.css")
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("mui-collapse-transition")).toBeUndefined()
    expect(readFileSync(resolve("src", "components", "collapse", "collapse.ts"), "utf8")).not.toContain("collapse-transition")
  })
  it("honors authored initial hidden/open state without hooks or remounting", () => {
    const root = fixture(true); const html = root.innerHTML; const hook = vi.fn()
    const c = enhance({ onEnter: hook, onAfterLeave: hook }, root)
    expect(c.state).toBe("closed"); expect(c.show).toBe(false)
    expect(root.innerHTML).toBe(html); expect(hook).not.toHaveBeenCalled()
    expect(animations).toHaveLength(0)
  })
  it("animates measured height while inert, then releases geometry/overflow to intrinsic layout", async () => {
    const root = fixture(true); const c = enhance({}, root); const style = root.style.cssText
    const done = c.setShow(true)
    expect(c.state).toBe("opening"); expect(root.hidden).toBe(false); expect(root.hasAttribute("inert")).toBe(true)
    expect(animations[0]!.frames).toEqual([
      { height: "0px", offset: 0, easing: "cubic-bezier(.4, 0, .2, 1)" },
      { opacity: 0, offset: 0, easing: "cubic-bezier(.4, 0, 1, 1)" },
      { height: "100px", opacity: 1, offset: 1 },
    ])
    expect(animations[0]!.options.duration).toBe(300)
    expect(animations[0]!.options.easing).toBe("linear")
    expect(animations[0]!.options.fill).toBe("both")
    animations[0]!.finish(); await expect(done).resolves.toBe(true)
    expect(c.state).toBe("open"); expect(root.hasAttribute("inert")).toBe(false)
    expect(root.hasAttribute("data-collapse-transition-active")).toBe(false); expect(root.style.cssText).toBe(style)
  })
  it("hides only after closing motion and never lets child transition events finish the parent", async () => {
    const root = fixture(); const c = enhance({}, root); const done = c.setShow(false)
    root.firstElementChild!.dispatchEvent(new Event("transitionend", { bubbles: true }))
    root.dispatchEvent(new Event("transitionend"))
    await flush()
    expect(c.state).toBe("closing"); expect(root.hidden).toBe(false)
    animations[0]!.finish(); await done
    expect(root.hidden).toBe(true); expect(c.state).toBe("closed"); expect(root.hasAttribute("inert")).toBe(false)
  })
  it("uses the source leave-opacity easing in the same owned height animation", async () => {
    const root = fixture(); const c = enhance({}, root); const done = c.setShow(false)
    expect(animations).toHaveLength(1)
    expect(animations[0]!.frames[1]).toEqual({ opacity: 1, offset: 0, easing: "cubic-bezier(0, 0, .2, 1)" })
    expect(animations[0]!.frames[2]).toEqual({ height: "0px", opacity: 0, offset: 1 })
    c.finish(); await done
    expect(root.style.opacity).toBe("")
  })
  it.each([0, .6])("preserves authored opacity %s through opening, closing and disposal", async value => {
    const root = fixture(true); root.style.opacity = String(value); root.style.color = "red"
    const authored = root.style.cssText; const c = enhance({}, root)
    const open = c.setShow(true)
    expect(animations[0]!.frames[2]?.opacity).toBe(value)
    c.finish(); await open
    expect(root.style.cssText).toBe(authored)
    const close = c.setShow(false)
    expect(animations[1]!.frames[1]?.opacity).toBe(value)
    c.finish(); await close; c.dispose()
    expect(root.style.cssText).toBe(authored)
  })
  it("releases opacity to a later author style instead of retaining its sampled endpoint", async () => {
    const root = fixture(true); root.style.opacity = ".6"
    const c = enhance({}, root); const open = c.setShow(true)
    expect(animations[0]!.frames[2]?.opacity).toBe(.6)
    root.style.opacity = ".3"
    c.finish(); await open
    expect(root.style.opacity).toBe("0.3")
    expect(root.hasAttribute("inert")).toBe(false)
  })
  it.each(["zero", "reduced", "no-animation", "no-inert", "no-media", "print"])("uses safe immediate fallback for %s", async kind => {
    if (kind === "reduced") Object.defineProperty(reduced, "matches", { value: true })
    if (kind === "print") Object.defineProperty(printing, "matches", { value: true })
    if (kind === "no-animation") Reflect.deleteProperty(proto, "animate")
    if (kind === "no-inert") Reflect.deleteProperty(proto, "inert")
    if (kind === "no-media") vi.stubGlobal("matchMedia", undefined)
    const root = fixture(); const after = vi.fn(); const c = enhance({ duration: kind === "zero" ? 0 : 100, onAfterLeave: after }, root)
    await expect(c.setShow(false)).resolves.toBe(true)
    expect(root.hidden).toBe(true); expect(root.hasAttribute("inert")).toBe(false)
    expect(animations).toHaveLength(0); expect(after).toHaveBeenCalledTimes(1)
  })
  it("makes initial appearance explicit and defers hooks until the controller exists", async () => {
    const root = fixture(true); const enter = vi.fn(); const c = enhance({ show: true, appear: true, onEnter: enter }, root)
    expect(enter).not.toHaveBeenCalled()
    await flush(); expect(enter).toHaveBeenCalledTimes(1)
    animations[0]!.finish(); await c.finished
    expect(root.hidden).toBe(false)
    c.dispose(); expect(root.hidden).toBe(true)
  })
  it("skips appear clipping when authored content already has focus", async () => {
    const root = fixture(); root.querySelector("input")!.focus()
    const c = enhance({ appear: true }, root); await c.finished
    expect(animations).toHaveLength(0); expect(root.contains(document.activeElement)).toBe(true)
  })
  it("preserves native controls, values, heading levels and listeners", async () => {
    const root = fixture(); const input = root.querySelector("input")!; const heading = root.querySelector("h3")!
    const clicked = vi.fn(); heading.addEventListener("click", clicked); input.value = "retained"
    const c = enhance({ duration: 0 }, root); await c.setShow(false); await c.setShow(true); heading.click()
    expect(root.querySelector("input")).toBe(input); expect(input.value).toBe("retained")
    expect(root.querySelector("h3")).toBe(heading); expect(clicked).toHaveBeenCalledTimes(1)
    expect(root.querySelector("form")!.checkValidity()).toBe(true)
    expect(root.hasAttribute("role")).toBe(false); expect(root.hasAttribute("aria-expanded")).toBe(false)
  })
  it.each([-1, Infinity, NaN, 0.5, 10001, null, "300"])("rejects invalid duration %s", value => {
    expect(() => enhance({ duration: value as number })).toThrow()
  })
  it("rejects arbitrary/unstable wrappers and framework options", () => {
    const root = fixture()
    expect(() => enhance({ displayDirective: "if" } as never, root)).toThrow()
    expect(() => enhance({ width: true } as never, root)).toThrow()
    expect(() => enhance({ horizontal: true } as never, root)).toThrow()
    root.style.paddingTop = "10px"; expect(() => enhance({}, root)).toThrow(/unstyled/)
    root.style.paddingTop = ""; root.append(document.createElement("div"))
    expect(() => enhance({}, root)).toThrow(/one direct/)
  })
  it("rejects duplicate ownership but allows fresh ownership after disposal", () => {
    const c = enhance(); expect(() => enhance({}, c.element)).toThrow(/owner/)
    c.dispose(); const next = enhance({}, c.element); c.dispose()
    expect(next.connected).toBe(true)
  })
  it("restores original author hidden/inert and preserves later styles/attribute writes", async () => {
    const root = fixture(true); root.setAttribute("inert", ""); root.style.color = "red"; root.style.overflow = "visible"
    const c = enhance({ show: true }, root)
    const done = c.setShow(false); root.setAttribute("inert", ""); root.style.color = "blue"
    animations[0]!.finish(); await done; c.dispose()
    expect(root.hidden).toBe(true); expect(root.hasAttribute("inert")).toBe(true)
    expect(root.style.color).toBe("blue"); expect(root.style.overflow).toBe("visible")
  })
})

describe("Interruption, hooks and focus ownership", () => {
  it("returns the same in-flight request for the same target without duplicate hooks", async () => {
    const hook = vi.fn(); const c = enhance({ onLeave: hook })
    const first = c.setShow(false); expect(c.setShow(false)).toBe(first)
    expect(animations).toHaveLength(1); expect(hook).toHaveBeenCalledTimes(1)
    c.finish(); await first; await expect(c.setShow(false)).resolves.toBe(true)
    expect(hook).toHaveBeenCalledTimes(1)
  })
  it("reverses safely and ignores old expected AbortError completions", async () => {
    const root = fixture(); const afterLeave = vi.fn(); const c = enhance({ onAfterLeave: afterLeave }, root)
    const hide = c.setShow(false)
    const open = c.setShow(true)
    await expect(hide).resolves.toBe(false)
    if (c.animation) c.finish()
    await expect(open).resolves.toBe(true); await flush()
    expect(root.hidden).toBe(false); expect(c.lastError).toBeNull(); expect(afterLeave).not.toHaveBeenCalled()
  })
  it("samples both height and opacity before cancelling a reversed effect", async () => {
    const root = fixture(); root.style.opacity = ".6"
    const c = enhance({}, root); const close = c.setShow(false)
    let sampling = true
    const originalStyle = window.getComputedStyle.bind(window)
    vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => new Proxy(originalStyle(element, pseudo), {
      get(target, name) {
        if (element === root && sampling && name === "height") return "40px"
        if (element === root && sampling && name === "opacity") return "0.35"
        return Reflect.get(target, name, target)
      },
    }))
    const cancel = animations[0]!.cancel.bind(animations[0])
    vi.spyOn(animations[0]!, "cancel").mockImplementation(() => { sampling = false; cancel() })
    const open = c.setShow(true)
    expect(animations[1]!.frames[0]?.height).toBe("40px")
    expect(animations[1]!.frames[1]?.opacity).toBe(.35)
    expect(animations[1]!.frames[2]?.opacity).toBe(.6)
    await expect(close).resolves.toBe(false)
    c.finish(); await expect(open).resolves.toBe(true)
    expect(root.style.opacity).toBe("0.6")
  })
  it("cancel settles the target safely without successful after hooks", async () => {
    const after = vi.fn(); const cancel = vi.fn(); const root = fixture(); const c = enhance({ onAfterLeave: after, onCancel: cancel }, root)
    const done = c.setShow(false); c.cancel()
    await expect(done).resolves.toBe(false)
    expect(root.hidden).toBe(true); expect(after).not.toHaveBeenCalled(); expect(cancel).toHaveBeenCalledTimes(1)
    expect(root.hasAttribute("inert")).toBe(false)
  })
  it("finishes queued appearance with ordered enter/after-enter hooks and no animation", async () => {
    const calls: string[] = []
    const c = enhance({ show: true, appear: true, onEnter: () => { calls.push("enter") }, onAfterEnter: () => { calls.push("after") } }, fixture(true))
    await c.finish(); await flush()
    expect(calls).toEqual(["enter", "after"])
    expect(animations).toHaveLength(0)
  })
  it("keeps leave/after-leave order when focus evacuation reentrantly finishes", async () => {
    const calls: string[] = []
    const root = fixture(); const target = root.parentElement!.querySelector<HTMLButtonElement>("[data-trigger]")!
    const c = enhance({ focusTarget: target, onLeave: () => { calls.push("leave") }, onAfterLeave: () => { calls.push("after") } }, root)
    root.querySelector("input")!.focus()
    target.addEventListener("focus", () => { void c.finish() })
    await expect(c.setShow(false)).resolves.toBe(true)
    expect(calls).toEqual(["leave", "after"]); expect(animations).toHaveLength(0)
  })
  it("releases motion if the clipping marker is removed while animating", async () => {
    const root = fixture(); root.addEventListener("mui:collapse-transition-error", e => e.preventDefault())
    const c = enhance({}, root); const done = c.setShow(false)
    root.removeAttribute("data-collapse-transition-active")
    await expect(done).rejects.toThrow(/clipping/)
    expect(c.state).toBe("open"); expect(root.hasAttribute("inert")).toBe(false)
    expect(root.hasAttribute("data-collapse-transition-active")).toBe(false)
  })
  it("revalidates clipping after a synchronous start hook", async () => {
    const root = fixture(); root.addEventListener("mui:collapse-transition-error", e => e.preventDefault())
    const c = enhance({ onLeave: () => root.removeAttribute("data-collapse-transition-active") }, root)
    await expect(c.setShow(false)).rejects.toThrow(/clipping/)
    expect(animations).toHaveLength(0); expect(root.hasAttribute("inert")).toBe(false)
  })
  it("handles direct native animation cancellation narrowly", async () => {
    const c = enhance(); const done = c.setShow(false)
    c.animation!.cancel(); await expect(done).resolves.toBe(false)
    expect(c.state).toBe("closed"); expect(c.lastError).toBeNull()
  })
  it("surfaces unexpected animation rejection and leaves visible content unclipped", async () => {
    const root = fixture(); root.addEventListener("mui:collapse-transition-error", event => event.preventDefault())
    const c = enhance({}, root); const done = c.setShow(false); const failure = new Error("Unexpected")
    animations[0]!.reject(failure)
    await expect(done).rejects.toBe(failure)
    expect(c.state).toBe("open"); expect(root.hasAttribute("inert")).toBe(false)
    expect(root.hasAttribute("data-collapse-transition-active")).toBe(false)
  })
  it("does not swallow a plain error merely named AbortError", async () => {
    const root = fixture(); root.addEventListener("mui:collapse-transition-error", e => e.preventDefault())
    const c = enhance({}, root); const done = c.setShow(false); const error = new Error("Not a native cancellation"); error.name = "AbortError"
    animations[0]!.reject(error); await expect(done).rejects.toBe(error)
    expect(c.lastError).toBe(error)
  })
  it("guards reentrant start hooks and after hooks from stale hiding", async () => {
    const c = enhance({ onLeave: event => { void event.controller.setShow(true) } })
    await expect(c.setShow(false)).resolves.toBe(false)
    if (c.animation) c.finish()
    await c.finished
    expect(c.element.hidden).toBe(false)
    const root = fixture(true)
    const d = enhance({ duration: 0, onAfterEnter: event => { void event.controller.setShow(false) } }, root)
    await d.setShow(true); expect(root.hidden).toBe(true)
  })
  it("surfaces synchronous/async hook errors without corrupting newer state", async () => {
    const root = fixture(); const errors: CustomEvent[] = []
    root.addEventListener("mui:collapse-transition-error", e => { e.preventDefault(); errors.push(e as CustomEvent) })
    const c = enhance({ onLeave: () => { throw new Error("Hook failed") } }, root)
    await expect(c.setShow(false)).rejects.toThrow("Hook failed"); expect(c.state).toBe("open")
    c.dispose()
    const d = enhance({ duration: 0, onAfterLeave: async () => { throw new Error("Late hook") } }, root)
    await d.setShow(false); await d.setShow(true); await flush()
    expect(root.hidden).toBe(false); expect(errors.some(event => event.detail.error.message === "Late hook")).toBe(true)
  })
  it("refuses to hide focused content without an explicit working target", async () => {
    const root = fixture(); root.addEventListener("mui:collapse-transition-error", e => e.preventDefault())
    root.querySelector("input")!.focus(); const c = enhance({}, root)
    await expect(c.setShow(false)).rejects.toThrow(/focus/)
    expect(root.hidden).toBe(false); expect(root.contains(document.activeElement)).toBe(true)
  })
  it("moves focused content only to the configured target before inert/hide", async () => {
    const root = fixture(); const target = root.parentElement!.querySelector<HTMLButtonElement>("[data-trigger]")!
    const c = enhance({ focusTarget: target }, root); root.querySelector("input")!.focus()
    const done = c.setShow(false)
    expect(document.activeElement).toBe(target); expect(root.hasAttribute("inert")).toBe(true)
    c.finish(); await done; expect(document.activeElement).toBe(target)
  })
  it("requires safe focus before disposal can restore an originally hidden region", async () => {
    const root = fixture(true); const c = enhance({ show: true, duration: 0 }, root)
    root.querySelector("input")!.focus()
    expect(() => c.dispose()).toThrow(/focus/)
    expect(c.connected).toBe(true); expect(root.hidden).toBe(false)
    root.querySelector("input")!.blur(); c.dispose(); expect(root.hidden).toBe(true)
  })
  it("blocks reentrant opening during disposal focus evacuation", () => {
    const root = fixture(true); const target = root.parentElement!.querySelector<HTMLButtonElement>("[data-trigger]")!
    const c = enhance({ show: true, duration: 0, focusTarget: target }, root)
    root.querySelector("input")!.focus(); let blocked = false
    target.addEventListener("focus", () => { try { c.setShow(false) } catch { blocked = true } })
    c.dispose(); expect(blocked).toBe(true); expect(root.hidden).toBe(true); expect(c.connected).toBe(false)
  })
  it("settles on preference/print changes and honors native finish", async () => {
    const c = enhance(); const first = c.setShow(false)
    Object.defineProperty(reduced, "matches", { configurable: true, value: true }); reduced.dispatchEvent(new Event("change"))
    await expect(first).resolves.toBe(true); expect(c.element.hidden).toBe(true)
    Object.defineProperty(reduced, "matches", { configurable: true, value: false })
    const second = c.setShow(true); window.dispatchEvent(new Event("beforeprint"))
    await expect(second).resolves.toBe(true); expect(c.state).toBe("open")
  })
  it("releases to the latest intrinsic content size without a resize or per-frame engine", async () => {
    const root = fixture(true); const c = enhance({}, root); const inner = root.firstElementChild!
    const done = c.setShow(true); inner.append(document.createElement("p"))
    Object.defineProperty(inner, "offsetHeight", { configurable: true, value: 300 })
    await flush(); expect(animations).toHaveLength(1)
    c.finish(); await done
    expect(root.style.height).toBe(""); expect(root.hasAttribute("inert")).toBe(false)
  })
  it("disposes removed/reparented roots and ignores their late completion", async () => {
    const root = fixture(); const c = enhance({}, root); const done = c.setShow(false)
    const host = document.createElement("div"); document.body.append(host); host.append(root); await flush()
    host.remove(); await flush()
    expect(c.connected).toBe(false); await expect(done).resolves.toBe(false)
    const html = root.outerHTML; animations[0]!.finish(); await flush(); expect(root.outerHTML).toBe(html)
  })
  it("treats same-task removal before attribute observer delivery as disposal, not animation failure", async () => {
    const root = fixture(); const c = enhance({}, root); const done = c.setShow(false)
    root.remove()
    await expect(done).resolves.toBe(false)
    expect(c.connected).toBe(false); expect(c.lastError).toBeNull()
  })
})
