import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createInput } from "../src/components/input/index.js"
import type { InputController, InputOptions } from "../src/components/input/index.js"

const helpers: InputController[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "title-root", options: InputOptions = {}) {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "input.html"), "utf8"), "text/html")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const root = document.getElementById(id)!
  const control = root.querySelector<HTMLInputElement | HTMLTextAreaElement>("[data-input-control]")!
  const helper = createInput(root, options)
  helpers.push(helper)
  return { root, control, helper,
    clear: root.querySelector<HTMLButtonElement>("[data-input-clear]")!,
    reveal: root.querySelector<HTMLButtonElement>("[data-input-reveal]")!,
    count: root.querySelector<HTMLElement>("[data-input-count]")!,
    form: document.getElementById("entry") as HTMLFormElement }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("authored Input ownership", () => {
  it("preserves node/listeners, attributes, defaults and editing state", () => {
    const { root, control, helper } = fixture()
    helper.disconnect()
    control.value = "Before enhancement"
    control.setSelectionRange(2, 6, "backward")
    const listener = vi.fn(); control.addEventListener("input", listener)
    const copy = control.outerHTML
    const next = createInput(root); helpers.push(next)
    expect(control.outerHTML).toBe(copy)
    expect(next.control).toBe(control)
    expect(control.value).toBe("Before enhancement")
    expect(control.defaultValue).toBe("Native draft")
    expect([control.selectionStart, control.selectionEnd, control.selectionDirection]).toEqual([2, 6, "backward"])
    control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(listener).toHaveBeenCalledTimes(1)
    expect(root.hasAttribute("tabindex")).toBe(false)
    expect(root.querySelectorAll("input,textarea")).toHaveLength(1)
  })
  it("rejects a second root owner and permits explicit recreation after disposal", () => {
    const { root, helper } = fixture()
    expect(() => createInput(root)).toThrow("owner")
    helper.disconnect(); helper.disconnect()
    helpers.push(createInput(root))
  })
  it("does not register or upgrade legacy elements", () => {
    const before = customElements.get("mui-input")
    fixture()
    expect(customElements.get("mui-input")).toBe(before)
  })
  it("guards root ownership across separately loaded module copies", async () => {
    const { root, helper } = fixture()
    vi.resetModules()
    const separate = await import("../src/components/input/index.js")
    expect(() => separate.createInput(root)).toThrow("owner")
    helper.disconnect()
    helpers.push(separate.createInput(root))
  })
  it.each(["file", "date", "color", "number", "checkbox", "range", "hidden"])("rejects %s helpers before mutation", type => {
    const { root, control, helper } = fixture()
    helper.disconnect(); (control as HTMLInputElement).type = type
    const before = root.outerHTML
    expect(() => createInput(root)).toThrow("only")
    expect(root.outerHTML).toBe(before)
  })
  it.each(["text", "search", "email", "tel", "url", "password"])("accepts native %s without changing type", type => {
    const { root, control, helper } = fixture()
    helper.disconnect(); (control as HTMLInputElement).type = type
    helpers.push(createInput(root))
    expect((control as HTMLInputElement).type).toBe(type)
  })
  it("rejects unlabelled, duplicate, unsafe actions and unsupported options", () => {
    const { root, control, helper, clear } = fixture()
    helper.disconnect()
    expect(() => createInput(root, { allowInput: () => false } as InputOptions)).toThrow("options")
    clear.type = "submit"
    expect(() => createInput(root)).toThrow()
    clear.type = "button"
    root.append(control.cloneNode())
    expect(() => createInput(root)).toThrow("one")
    root.lastChild!.remove()
    document.querySelector('label[for="title"]')!.remove()
    expect(() => createInput(root)).toThrow("named")
  })
  it("rejects interactive decorations inside labels", () => {
    const { root, helper } = fixture()
    helper.disconnect()
    const label = document.createElement("label")
    root.replaceWith(label); label.append(root)
    expect(() => createInput(root)).toThrow()
  })
  it("rejects reveal on non-password and unsafe count regions", () => {
    const { root, control, helper } = fixture("secret-root")
    helper.disconnect(); (control as HTMLInputElement).type = "text"
    expect(() => createInput(root)).toThrow("password")
    ;(control as HTMLInputElement).type = "password"
    const span = document.createElement("span"); span.dataset.inputCount = ""; span.setAttribute("aria-live", "polite"); root.append(span)
    expect(() => createInput(root)).toThrow("text-only")
  })
})

describe("native value, count and notification contract", () => {
  it("keeps .value and defaultValue separate; direct assignment requires refresh", async () => {
    const { control, count, helper } = fixture()
    const listener = vi.fn(); control.addEventListener("input", listener)
    const initial = count.textContent
    control.value = "Silent"
    await flush()
    expect(count.textContent).toBe(initial)
    helper.refresh()
    expect(count.textContent).toBe("6 / 24")
    helper.setValue("New")
    expect(count.textContent).toBe("3 / 24")
    expect(control.defaultValue).toBe("Native draft")
    expect(listener).not.toHaveBeenCalled()
  })
  it("counts UTF-16 rather than graphemes without changing maxlength", () => {
    const { helper, count, control } = fixture()
    helper.setValue("😀e\u0301")
    expect(count.textContent).toBe("4 / 24")
    expect(control.maxLength).toBe(24)
  })
  it("localizes count as plain text with current maximum", async () => {
    const { count, control } = fixture("notes-root", { formatCount: ({ length, maxLength }) => `<${length}> of ${maxLength}` })
    expect(count.children).toHaveLength(0)
    control.maxLength = 10
    await flush()
    expect(count.textContent).toBe("<16> of 10")
    expect(count.children).toHaveLength(0)
  })
  it("emits only requested input/change, once each, on an actual programmatic change", () => {
    const { helper, control } = fixture()
    const events: string[] = []
    for (const type of ["input", "change", "mui:input-clear"]) control.addEventListener(type, () => events.push(type))
    helper.setValue("New", { emit: true })
    helper.setValue("New", { emit: true })
    expect(events).toEqual(["input", "change"])
  })
  it("clear preserves focus/default/name and sends input, change, then clear once", async () => {
    const { helper, control, clear, count } = fixture()
    const events: string[] = []
    for (const type of ["input", "change", "mui:input-clear"]) control.addEventListener(type, () => events.push(type))
    clear.focus(); clear.click(); await flush()
    expect(control.value).toBe("")
    expect(control.defaultValue).toBe("Native draft")
    expect(control.name).toBe("title")
    expect(count.textContent).toBe("0 / 24")
    expect(clear.hidden).toBe(true)
    expect(document.activeElement).toBe(control)
    expect(events).toEqual(["input", "change", "mui:input-clear"])
    expect(helper.clear()).toBe(false)
    expect(control.validity.valueMissing).toBe(true)
  })
  it("does not synthesize extra events for ordinary input/change or composition", () => {
    const { control, helper, count } = fixture()
    const listener = vi.fn(); control.addEventListener("input", listener)
    control.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    control.value = "日本"
    control.setSelectionRange(1, 1)
    control.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true, data: "本" }))
    expect(helper.clear()).toBe(false)
    expect(() => helper.setValue("Overwrite")).toThrow("composing")
    expect(control.value).toBe("日本")
    expect(control.selectionStart).toBe(1)
    control.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    expect(listener).toHaveBeenCalledTimes(1)
    expect(count.textContent).toBe("2 / 24")
  })
  it("honors late click cancellation and does not submit", async () => {
    const { root, control, clear, form } = fixture()
    const submit = vi.fn(); form.addEventListener("submit", submit)
    root.addEventListener("click", event => event.preventDefault(), { once: true })
    clear.click(); await flush()
    expect(control.value).toBe("Native draft")
    expect(submit).not.toHaveBeenCalled()
  })
  it("stops clearing if an author focus listener disconnects during focus recovery", () => {
    const { control, clear, helper } = fixture()
    clear.focus()
    control.addEventListener("focus", () => helper.disconnect(), { once: true })
    expect(helper.clear()).toBe(false)
    expect(control.value).toBe("Native draft")
    expect(clear.hidden).toBe(true)
  })
})

describe("native form and lifetime behavior", () => {
  it("updates after native reset, including changed defaultValue, without user events", async () => {
    const { helper, control, count, form } = fixture()
    helper.setValue("Changed")
    control.defaultValue = "Future default"
    const input = vi.fn(); control.addEventListener("input", input)
    form.reset(); await flush()
    expect(control.value).toBe("Future default")
    expect(count.textContent).toBe("14 / 24")
    expect(input).not.toHaveBeenCalled()
  })
  it("does not reset a cancelled form", async () => {
    const { helper, control, count, form } = fixture()
    helper.setValue("Keep")
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush()
    expect(control.value).toBe("Keep")
    expect(count.textContent).toBe("4 / 24")
  })
  it("follows live native form association, even a form id change", async () => {
    const { helper, control, count, form } = fixture("external-root")
    helper.setValue("Changed")
    form.reset(); await flush()
    expect(control.value).toBe("Changed")
    const other = document.getElementById("other") as HTMLFormElement
    other.reset(); await flush()
    expect(control.value).toBe("Other default")
    other.id = "new-other"; control.setAttribute("form", "new-other")
    helper.setValue("Again"); other.reset(); await flush()
    expect(count.textContent).toBe("13")
  })
  it("submits only actual named controls, with readonly included and disabled excluded", async () => {
    const { form } = fixture()
    const fieldset = document.getElementById("controls-fieldset") as HTMLFieldSetElement
    fieldset.disabled = true; await flush()
    const data = new FormData(form)
    expect(data.getAll("title")).toEqual(["Native draft"])
    expect(data.get("read")).toBe("Copy this")
    expect(data.has("field")).toBe(false)
    expect(data.has("secret")).toBe(false)
    expect(data.has("external")).toBe(false)
    expect(data.get("token")).toBe("local-only")
  })
  it("reflects readonly and inherited disabled without modifying control attributes", async () => {
    const { control, clear, helper } = fixture("field-root")
    const fieldset = document.getElementById("controls-fieldset") as HTMLFieldSetElement
    fieldset.disabled = true; await flush()
    expect(clear.disabled).toBe(true)
    expect(control.hasAttribute("disabled")).toBe(false)
    expect(helper.clear()).toBe(false)
    fieldset.disabled = false; control.readOnly = true; await flush()
    expect(clear.disabled).toBe(true)
    control.readOnly = false; await flush()
    expect(clear.disabled).toBe(false)
  })
  it("honors the first-legend fieldset exception and reparenting", async () => {
    const { root, control, clear } = fixture("field-root")
    const fieldset = document.getElementById("controls-fieldset") as HTMLFieldSetElement
    fieldset.querySelector("legend")!.append(root)
    fieldset.disabled = true; await flush()
    expect(control.matches(":disabled")).toBe(false)
    expect(clear.disabled).toBe(false)
    fieldset.append(root); await flush()
    expect(clear.disabled).toBe(true)
  })
  it("preserves author action hidden/disabled writes, including same-value overrides", async () => {
    const { helper, control, clear } = fixture()
    control.readOnly = true; await flush()
    clear.disabled = true
    clear.hidden = true
    control.readOnly = false; await flush()
    expect(clear.disabled).toBe(true)
    expect(clear.hidden).toBe(true)
    helper.disconnect()
    expect(clear.disabled).toBe(true)
    expect(clear.hidden).toBe(true)
  })
  it("restores decoration state only, leaves edited values and author ARIA alone", () => {
    const { helper, root, control, count, clear } = fixture()
    helper.setValue("Keep edits")
    control.setAttribute("aria-invalid", "true")
    helper.disconnect()
    expect(control.value).toBe("Keep edits")
    expect(control.getAttribute("aria-invalid")).toBe("true")
    expect(clear.hidden).toBe(true)
    expect(count.textContent).toBe("Count available with JavaScript")
    expect(root.querySelectorAll("input")).toHaveLength(1)
    expect(() => helper.setValue("Later")).toThrow("disconnected")
  })
})

describe("password reveal safety", () => {
  it("retains selection/value, exposes pressed state, masks on second click", async () => {
    const { control, reveal } = fixture("secret-root")
    control.focus(); control.setSelectionRange(1, 4, "backward")
    reveal.click(); await flush()
    expect(control.type).toBe("text")
    expect([control.selectionStart, control.selectionEnd]).toEqual([1, 4])
    expect(control.value).toBe("dummy-only")
    expect(reveal.getAttribute("aria-pressed")).toBe("true")
    reveal.click(); await flush()
    expect(control.type).toBe("password")
  })
  it.each(["pointercancel", "blur", "pagehide", "beforeprint", "Escape", "readonly", "disabled", "remove", "disconnect", "hidden"])("masks on %s", async reason => {
    const { control, root, reveal, helper } = fixture("secret-root")
    reveal.click(); await flush()
    expect(control.type).toBe("text")
    if (reason === "pointercancel") root.dispatchEvent(new Event("pointercancel"))
    if (reason === "blur") window.dispatchEvent(new Event("blur"))
    if (reason === "pagehide" || reason === "beforeprint") window.dispatchEvent(new Event(reason))
    if (reason === "Escape") root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    if (reason === "readonly") control.readOnly = true
    if (reason === "disabled") control.disabled = true
    if (reason === "remove") root.remove()
    if (reason === "disconnect") helper.disconnect()
    if (reason === "hidden") root.hidden = true
    await flush()
    expect(control.type).toBe("password")
  })
  it("does not reveal from a stale click after blur or disconnect", async () => {
    const { reveal, control, helper } = fixture("secret-root")
    reveal.click(); window.dispatchEvent(new Event("blur")); await flush()
    expect(control.type).toBe("password")
    reveal.click(); helper.disconnect(); await flush()
    expect(control.type).toBe("password")
  })
  it("does not change a revealed type during composition but disables actions", async () => {
    const { reveal, control } = fixture("secret-root")
    reveal.click(); await flush()
    control.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    control.value = "日本"
    control.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    expect(control.type).toBe("text")
    expect(reveal.disabled).toBe(true)
    expect(control.value).toBe("日本")
    control.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    expect(reveal.disabled).toBe(false)
  })
  it("masks on focus leaving the root and native reset", async () => {
    const { reveal, control, root, form } = fixture("secret-root")
    reveal.click(); await flush()
    root.dispatchEvent(new FocusEvent("focusout", { relatedTarget: document.body }))
    expect(control.type).toBe("password")
    reveal.click(); await flush()
    form.reset(); await flush()
    expect(control.type).toBe("password")
  })
  it("does not clobber an author's type or pressed state at disconnect", async () => {
    const { reveal, control, helper } = fixture("secret-root")
    reveal.click(); await flush()
    ;(control as HTMLInputElement).type = "search"
    reveal.setAttribute("aria-pressed", "mixed")
    helper.disconnect()
    expect(control.type).toBe("search")
    expect(reveal.getAttribute("aria-pressed")).toBe("mixed")
  })
  it("suspends an externally unsupported type and restores only owned state", async () => {
    const { control, helper } = fixture("secret-root")
    ;(control as HTMLInputElement).type = "date"; await flush()
    expect(helper.connected).toBe(false)
    expect(control.type).toBe("date")
  })
})
