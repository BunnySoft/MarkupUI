import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { InputNumber, registerInputNumber } from "../src/components/input-number/index.js"
import { ViewElement } from "../src/core/index.js"
import { bind, createStore } from "../src/state/index.js"

const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "quantity-root") {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "input-number.html"), "utf8"), "text/html")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const root = document.getElementById(id) as InputNumber
  root.refresh()
  return { root, control: root.native,
    up: root.querySelector<HTMLButtonElement>("[data-number-increment]")!,
    down: root.querySelector<HTMLButtonElement>("[data-number-decrement]")!,
    clear: root.querySelector<HTMLButtonElement>("[data-number-clear]")!,
    form: document.getElementById("numbers") as HTMLFormElement }
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Input Number stylesheet and delivery", () => {
  const css = readFileSync(join("src", "components", "input-number", "input-number.css"), "utf8")
  it("retains private defaults, native spinners and forced-color boundaries", () => {
    expect(css).not.toMatch(/--m-number-[\w-]+\s*:/)
    for (const height of [22, 28, 34, 40]) expect(css).toMatch(new RegExp(`--_n-h:\\s*${height}px`))
    expect(css).toMatch(/data-m-theme="?dark"?/)
    expect(css).not.toContain("var(--m-text-primary")
    expect(css).not.toMatch(/appearance\s*:|spin-button|[;{]\s*order\s*:|position:\s*absolute|pointer-events:\s*none/)
    expect(css).toMatch(/\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/)
    expect(css).toContain(":has([data-number-control]:disabled)")
    expect(css).not.toContain(":has(:disabled)")
    expect(css).toMatch(/outline:\s*1px solid CanvasText/)
    expect(css).toMatch(/outline:\s*2px solid Highlight/)
    expect(css).toMatch(/color:\s*GrayText;\s*opacity:\s*1/)
    expect(css).toMatch(/button:focus-visible\s*\{[^}]*outline:/)
    expect(css).toMatch(/\.m-input-number\s*\{[^}]*box-sizing:\s*border-box/)
    expect(css).toMatch(/\[data-number-control\]\s*\{[^}]*max-inline-size:\s*100%/)
    expect(css).toContain("[size=tiny]"); expect(css).not.toContain("[data-size")
  })
  it("registers only one own-tag ViewElement, with explicit conflicts and no factory", async () => {
    expect(new InputNumber()).toBeInstanceOf(ViewElement)
    expect(Object.getOwnPropertyDescriptor(InputNumber, "tag")?.value).toBe("m-input-number")
    expect(customElements.get(InputNumber.tag)).toBe(InputNumber)
    const registry = new Map<string, CustomElementConstructor>()
    const define = vi.fn((name, value) => registry.set(name, value))
    const get = (name: string) => registry.get(name)
    registerInputNumber({ get, define }); registerInputNumber({ get, define })
    expect(define).toHaveBeenCalledTimes(1)
    registry.set(InputNumber.tag, class extends HTMLElement {})
    expect(() => registerInputNumber({ get, define })).toThrow("different")
    expect((await import("../src/components/input-number/index.js"))).not.toHaveProperty("createInputNumber")
    expect("select" in new InputNumber()).toBe(false)
    expect("setSelectionRange" in new InputNumber()).toBe(false)
  })
  it("uses the modern demo/API scaffolding and exact approved budgets", () => {
    const { root } = fixture()
    expect(root.localName).toBe("m-input-number")
    expect(document.querySelector("main[data-demo-page].component-docs")).not.toBeNull()
    expect(document.querySelectorAll("[data-demo-example]")).toHaveLength(4)
    expect(document.getElementById("input-number-api")).not.toBeNull()
    expect(document.querySelector('details.component-setup a[href="../setup.html"]')).not.toBeNull()
    const build = readFileSync(join("scripts", "build.mjs"), "utf8")
    expect(build).toContain('["input-number", 5_500]')
    for (const file of ["js", "global.js"]) expect(build).toContain(`"markup-ui-input-number.${file}": 4_000`)
    expect(build).toContain('"markup-ui-input-number.css": 1_000')
  })
})

describe("native owner and public accessors", () => {
  it("retains authored control, listeners, labels, defaults and no inserted probe", () => {
    const { root, control } = fixture()
    const count = document.querySelectorAll("input").length, label = control.labels![0], listener = vi.fn()
    control.value = "0.25"; const before = control.outerHTML
    control.addEventListener("input", listener)
    root.refresh(); root.state
    expect(root.native).toBe(control); expect(control.outerHTML).toBe(before)
    expect(control.labels![0]).toBe(label); expect(root.defaultValue).toBe("0.1")
    expect(root.value).toBe(.25); expect(document.querySelectorAll("input")).toHaveLength(count)
    expect(root.hasAttribute("role")).toBe(false); expect(control.hasAttribute("aria-valuenow")).toBe(false)
    control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(listener).toHaveBeenCalledTimes(1)
  })
  it.each(["text", "range", "hidden"])("rejects a %s owner", type => {
    const { root, control } = fixture(); control.type = type
    expect(() => root.refresh()).toThrow("number")
  })
  it("rejects invalid anatomy and recovers explicitly", () => {
    const { root, control, up } = fixture()
    up.type = "submit"; expect(() => root.refresh()).toThrow("type=button")
    up.type = "button"; control.labels![0]!.remove()
    expect(() => root.refresh()).toThrow("labelled")
    control.setAttribute("aria-label", "Quantity"); root.refresh()
    const duplicate = control.cloneNode(); root.append(duplicate)
    expect(() => root.refresh()).toThrow("one")
    duplicate.remove(); root.refresh(); expect(root.error).toBeNull()
    root.setAttribute("tabindex", "0"); expect(() => root.refresh()).toThrow("light-DOM")
    root.removeAttribute("tabindex")
  })
  it("rejects another native owner before changing its attributes", () => {
    const { root, control } = fixture()
    const other = new InputNumber()
    other.setAttribute("name", "replacement")
    other.append(control)
    expect(() => other.native).toThrow("unowned")
    expect(control.name).toBe("quantity")
    root.append(control)
  })
  it("documents native absence without fabricating defaults", () => {
    const root = new InputNumber()
    expect(root.value).toBeNull(); expect(root.text).toBe("")
    for (const key of ["defaultValue", "name", "placeholder", "min", "max", "step"] as const) expect(root[key]).toBe("")
    expect(root.size).toBe("medium"); expect(root.status).toBeNull()
    for (const key of ["disabled", "readOnly", "required", "round", "borderless"] as const) expect(root[key]).toBe(false)
    expect(root.form).toBeNull(); expect(root.error).toBeNull()
    expect(() => root.state).toThrow("disconnected")
  })
  it.each(["1", NaN, Infinity, -Infinity, undefined, true])("rejects invalid value %j atomically", value => {
    const { root } = fixture()
    expect(() => { root.value = value as number }).toThrow("finite")
    expect(root.value).toBe(.1)
  })
  it("validates every public setter before materialization or mutation", () => {
    const root = new InputNumber()
    for (const key of ["defaultValue", "min", "max", "step", "name", "placeholder"]) expect(() => Reflect.set(root, key, 2)).toThrow()
    for (const key of ["disabled", "readOnly", "required", "round", "borderless"]) expect(() => Reflect.set(root, key, "false")).toThrow()
    expect(() => { root.size = "huge" as never }).toThrow()
    expect(() => { root.status = "neutral" as never }).toThrow()
    expect(() => root.setCustomValidity(null as never)).toThrow()
    expect(root.children).toHaveLength(0); expect(root.attributes).toHaveLength(0)
  })
  it("forwards host attributes after early materialization without replay on reconnect", async () => {
    const root = new InputNumber(), control = root.native
    root.setAttribute("aria-label", "Early"); root.setAttribute("value", "2")
    root.setAttribute("min", "1"); root.setAttribute("required", "")
    expect(control.defaultValue).toBe("2"); expect(control.value).toBe("2"); expect(root.required).toBe(true)
    root.value = 4; root.setAttribute("value", "3")
    expect(root.value).toBe(4); expect(root.defaultValue).toBe("3")
    document.body.append(root); await flush(); root.remove(); root.value = 5
    document.body.append(root); await flush()
    expect(root.native).toBe(control); expect(root.value).toBe(5); expect(root.defaultValue).toBe("3")
    root.removeAttribute("required"); root.removeAttribute("min")
    expect(root.required).toBe(false); expect(root.min).toBe("")
  })
  it("replays pre-upgrade-style own properties before initialization", async () => {
    const root = new InputNumber()
    root.innerHTML = '<input type="number" value="2" aria-label="Pending">'
    for (const [name, value] of Object.entries({ value: 7, defaultValue: "3", min: "1", size: "large", disabled: false })) {
      Object.defineProperty(root, name, { configurable: true, writable: true, value })
    }
    document.body.append(root); await flush()
    expect(root.value).toBe(7); expect(root.defaultValue).toBe("3"); expect(root.min).toBe("1")
    expect(root.size).toBe("large"); expect(Object.hasOwn(root, "value")).toBe(false)
  })
  it("transfers pending native writes to a late authored owner, retaining its reset default", async () => {
    const root = new InputNumber()
    root.setAttribute("aria-label", "Late")
    root.value = 7; root.min = "1"; root.disabled = false; root.name = "late"
    const generated = root.native, authored = document.createElement("input")
    authored.type = "number"; authored.defaultValue = "2"; authored.disabled = true
    root.append(authored); document.body.append(root); await flush()
    expect(root.native).toBe(authored); expect(generated.isConnected).toBe(false)
    expect(root.value).toBe(7); expect(root.defaultValue).toBe("2")
    expect(root.disabled).toBe(false); expect(root.min).toBe("1"); expect(root.name).toBe("late")
    expect(root.querySelectorAll("input")).toHaveLength(1)
  })
  it("transfers pending default and dirty state independently", () => {
    const root = new InputNumber(); root.defaultValue = "3"; root.value = null
    const authored = document.createElement("input")
    authored.type = "number"; authored.defaultValue = "2"; root.append(authored)
    expect(root.native.defaultValue).toBe("3"); expect(root.value).toBeNull()
  })
})

describe("native values, constraints and actions", () => {
  it("keeps null, validity and native reset string distinct", () => {
    const { root } = fixture()
    root.value = null
    expect(root.state).toMatchObject({ value: null, text: "", empty: true, badInput: false, valid: false, valueMissing: true })
    root.value = 0
    expect(root.state).toMatchObject({ value: 0, empty: false, valueMissing: false })
    expect(root.defaultValue).toBe("0.1")
  })
  it("never rounds or clamps finite live values", () => {
    const { root, control } = fixture()
    root.value = 2; expect(root.state.rangeOverflow).toBe(true)
    control.dispatchEvent(new Event("input", { bubbles: true })); expect(root.value).toBe(2)
    root.value = .15; expect(root.state.stepMismatch).toBe(true)
    control.dispatchEvent(new Event("change", { bubbles: true })); expect(root.value).toBe(.15)
    root.min = ""; root.max = ""; root.value = 1e308; expect(root.value).toBe(1e308)
  })
  it("keeps native property writes, default writes and refresh silent", () => {
    const { root, control } = fixture(), events = vi.fn()
    control.addEventListener("input", events); control.addEventListener("change", events)
    root.value = .4; root.defaultValue = "0.2"; control.value = "0.7"; root.refresh()
    expect(root.value).toBe(.7); expect(events).not.toHaveBeenCalled()
    expect(Object.hasOwn(control, "value")).toBe(false)
  })
  it("uses native decimal stepping and alignment", () => {
    const { root } = fixture()
    expect(root.stepUp()).toBe(true); expect(root.text).toBe("0.2")
    root.stepUp(); expect(root.text).toBe("0.3")
    root.stepDown(); expect(root.text).toBe("0.2")
    root.value = .15; root.stepUp(); expect(root.value).toBe(.2)
    root.value = .15; root.stepDown(); expect(root.value).toBe(.1)
    root.value = null; root.stepUp(); expect(root.value).toBe(.1)
  })
  it("copies the value attribute as native step-grid base", () => {
    const { root } = fixture("grid-root")
    root.value = .3; expect(root.state.stepMismatch).toBe(true)
    root.stepUp(); expect(root.value).toBe(.35)
    root.defaultValue = "0.1"; root.value = .3; root.stepUp(); expect(root.value).toBe(.5)
  })
  it("preserves text and event counts at numeric no-op limits", () => {
    const { root, control, up } = fixture(), events = vi.fn()
    control.value = "1.00"; root.refresh(); control.addEventListener("change", events)
    expect(up.disabled).toBe(true); expect(root.stepUp()).toBe(false)
    expect(control.value).toBe("1.00"); expect(events).not.toHaveBeenCalled()
  })
  it("surfaces native any-step errors", () => {
    const { root, up, down } = fixture("any-root")
    expect(root.state.stepError).toContain("InvalidStateError")
    expect(up.disabled).toBe(true); expect(down.disabled).toBe(true)
    expect(() => root.stepUp()).toThrow(); expect(root.value).toBe(2.5)
  })
  it("leaves malformed and contradictory constraints to the browser", () => {
    const { root, up, down } = fixture()
    root.min = "invalid"; root.max = "invalid"; root.step = "-2"; root.defaultValue = "0"
    root.value = 2; root.stepUp(); expect(root.value).toBe(3)
    root.min = "5"; root.max = "1"
    expect(up.disabled).toBe(true); expect(down.disabled).toBe(true); expect(root.stepUp()).toBe(false)
  })
  it("protects composing native drafts, including late adoption", () => {
    const { root, control, up } = fixture()
    control.dispatchEvent(new CompositionEvent("compositionstart"))
    expect(up.disabled).toBe(true); expect(root.stepUp()).toBe(false); expect(root.clear()).toBe(false)
    expect(() => { root.value = .2 }).toThrow("composing"); expect(root.value).toBe(.1)
    control.dispatchEvent(new CompositionEvent("compositionend")); expect(up.disabled).toBe(false)
  })
  it("delegates validity and focus to the real owner", () => {
    const { root, control } = fixture(), invalid = vi.fn()
    control.addEventListener("invalid", invalid)
    root.setCustomValidity("Explain"); expect(root.checkValidity()).toBe(false)
    expect(root.validationMessage).toBe("Explain"); expect(invalid).toHaveBeenCalledOnce()
    root.setCustomValidity(""); expect(root.reportValidity()).toBe(true)
    root.focus(); expect(document.activeElement).toBe(control); root.blur(); expect(document.activeElement).not.toBe(control)
  })
  it("emits input/change once for real step intent and no legacy event", async () => {
    const { up, control } = fixture(), events: string[] = []
    for (const type of ["input", "change", "m:change"]) control.addEventListener(type, event => {
      events.push(type); expect(event.target).toBe(control); expect(event.composed).toBe(type === "input")
    })
    up.click(); await flush()
    expect(events).toEqual(["input", "change"]); expect(control.value).toBe("0.2"); expect(control.defaultValue).toBe("0.1")
  })
  it("honors late click cancellation without submitting", async () => {
    const { root, up, control, form } = fixture(), submit = vi.fn()
    form.addEventListener("submit", submit); root.addEventListener("click", e => e.preventDefault(), { once: true })
    up.click(); await flush(); expect(control.value).toBe("0.1"); expect(submit).not.toHaveBeenCalled()
  })
  it("returns focus when the active action becomes unavailable", async () => {
    const { root, control, up } = fixture()
    root.value = .9; up.focus(); up.click(); await flush()
    expect(root.value).toBe(1); expect(up.disabled).toBe(true); expect(document.activeElement).toBe(control)
  })
  it("clears with exact event order/detail and focus before hiding", async () => {
    const { root, clear, control } = fixture(), events: string[] = []
    for (const type of ["input", "change", "m:input-number-clear"]) control.addEventListener(type, event => {
      events.push(type)
      if (event instanceof CustomEvent) expect(event.detail).toEqual({ previous: { value: .1, text: "0.1", badInput: false } })
    })
    clear.focus(); clear.click(); await flush()
    expect(root.value).toBeNull(); expect(clear.hidden).toBe(true); expect(document.activeElement).toBe(control)
    expect(events).toEqual(["input", "change", "m:input-number-clear"]); expect(root.clear()).toBe(false)
  })
})

describe("native forms, leases and lifecycle", () => {
  it("blocks readonly/disabled actions but permits silent assignments", () => {
    const { root, up } = fixture()
    root.readOnly = true; expect(up.disabled).toBe(true)
    expect(root.stepUp()).toBe(false); expect(root.clear()).toBe(false); root.value = .4; expect(root.value).toBe(.4)
    root.readOnly = false; root.disabled = true
    expect(root.stepDown()).toBe(false); root.value = .5; expect(root.value).toBe(.5)
  })
  it("retains native fieldset disabling and first-legend exception", async () => {
    const { root, control, up } = fixture("grid-root"), fieldset = document.getElementById("grid-fieldset") as HTMLFieldSetElement
    fieldset.disabled = true; await flush(); expect(up.disabled).toBe(true); expect(control.disabled).toBe(false)
    fieldset.querySelector("legend")!.append(root); await flush()
    expect(control.matches(":disabled")).toBe(false); expect(up.disabled).toBe(false); expect(root.stepUp()).toBe(true)
  })
  it("resets current defaults and honors canceled reset without notifications", async () => {
    const { root, control, form } = fixture(), event = vi.fn()
    root.value = .7; root.defaultValue = "0.4"; control.addEventListener("change", event)
    form.reset(); await flush(); expect(root.value).toBe(.4)
    root.value = .8; form.addEventListener("reset", e => e.preventDefault(), { once: true })
    form.reset(); await flush(); expect(root.value).toBe(.8); expect(event).not.toHaveBeenCalled()
  })
  it("retains composition through canceled reset but releases it after native reset", async () => {
    const { root, control, form } = fixture()
    control.dispatchEvent(new CompositionEvent("compositionstart"))
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush(); expect(() => { root.value = .3 }).toThrow("composing")
    form.reset(); await flush(); root.value = .3; expect(root.value).toBe(.3)
  })
  it("uses actual external form association and current IDs", async () => {
    const { root, control, form } = fixture("external-root")
    root.value = 14; form.reset(); await flush(); expect(root.value).toBe(14)
    const other = document.getElementById("other-numbers") as HTMLFormElement
    other.id = "renamed"; control.setAttribute("form", other.id); expect(root.form).toBe(other)
    other.reset(); await flush(); expect(root.value).toBe(10)
  })
  it("submits only native strings, including readonly but excluding disabled", () => {
    const { root, form } = fixture()
    root.value = .3; root.readOnly = true; expect(new FormData(form).getAll("quantity")).toEqual(["0.3"])
    root.disabled = true; expect(new FormData(form).has("quantity")).toBe(false)
  })
  it("preserves same-value and later author overrides of action leases", async () => {
    const { root, up, clear } = fixture()
    root.value = 1; up.disabled = true; clear.hidden = true; await flush()
    root.value = .5; root.remove()
    expect(up.disabled).toBe(true); expect(clear.hidden).toBe(true)
    expect(root.value).toBe(.5); expect(root.defaultValue).toBe("0.1")
    document.body.append(root); await flush(); expect(up.disabled).toBe(true); expect(clear.hidden).toBe(true)
  })
  it("drops queued actions on disconnect and reconnects without duplicates", async () => {
    const { root, control, up } = fixture(), events = vi.fn(), parent = root.parentNode!
    control.addEventListener("change", events); up.click(); root.remove()
    expect(up.hidden).toBe(true); root.value = .5; expect(root.stepUp()).toBe(false)
    parent.appendChild(root); await flush()
    expect(root.native).toBe(control); expect(root.value).toBe(.5); expect(events).not.toHaveBeenCalled()
    up.click(); await flush(); expect(root.value).toBe(.6); expect(events).toHaveBeenCalledOnce()
  })
  it("drops stale actions on reset and removed buttons", async () => {
    const { root, up, form } = fixture()
    root.value = .5; up.click(); form.reset(); await flush(); expect(root.value).toBe(.1)
    up.click(); up.remove(); await flush(); expect(root.value).toBe(.1)
  })
  it("does not reinterpret a queued action when the author changes its role", async () => {
    const { root, up, down } = fixture()
    up.click()
    up.removeAttribute("data-number-increment"); down.removeAttribute("data-number-decrement")
    up.setAttribute("data-number-decrement", ""); down.setAttribute("data-number-increment", "")
    await flush(); expect(root.value).toBe(.1)
  })
  it("cancels clear if focus synchronously disconnects and reconnects the owner", () => {
    const { root, clear, control } = fixture(), parent = root.parentNode!, events = vi.fn()
    clear.focus()
    control.addEventListener("focus", () => { root.remove(); parent.appendChild(root) }, { once: true })
    control.addEventListener("change", events)
    expect(root.clear()).toBe(false); expect(root.value).toBe(.1); expect(events).not.toHaveBeenCalled()
  })
  it("does not notify a new lifecycle when boundary focus reconnects during stepping", () => {
    const { root, up, control } = fixture(), parent = root.parentNode!, events = vi.fn()
    root.value = .9; up.focus()
    control.addEventListener("focus", () => { root.remove(); parent.appendChild(root) }, { once: true })
    control.addEventListener("change", events)
    expect(root.stepUp()).toBe(true); expect(root.value).toBe(1); expect(events).not.toHaveBeenCalled()
  })
  it("does not apply a pending generated live value after reset", async () => {
    const { form } = fixture(), root = new InputNumber()
    root.setAttribute("aria-label", "Pending"); form.append(root); root.value = 7
    form.reset(); await flush()
    const authored = document.createElement("input"); authored.type = "number"; authored.defaultValue = "2"
    root.append(authored); root.refresh(); expect(root.value).toBe(2)
  })
  it("binds number/null through native events and ignores unrelated descendant inputs", () => {
    const { root, control } = fixture(), store = createStore({ quantity: .4 })
    root.setAttribute("m-bind", "quantity")
    const dispose = bind(root, store)
    expect(root.value).toBe(.4)
    control.value = ""; control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(store.get("quantity")).toBeNull()
    const setter = vi.spyOn(root, "value", "set")
    store.set("quantity", null); expect(setter).not.toHaveBeenCalled()
    store.set("quantity", .8); expect(root.value).toBe(.8)
    root.dispatchEvent(new CustomEvent("m:change", { detail: 2 })); expect(store.get("quantity")).toBe(.8)
    const inner = new InputNumber(); inner.setAttribute("aria-label", "Independent"); root.prepend(inner)
    control.value = "0.6"; inner.native.dispatchEvent(new Event("input", { bubbles: true }))
    expect(store.get("quantity")).toBe(.8)
    dispose()
  })
})
