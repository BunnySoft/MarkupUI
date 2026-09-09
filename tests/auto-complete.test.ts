import { afterEach, describe, expect, it, vi } from "vitest"
import { createAutoComplete } from "../src/components/auto-complete/index.js"
import type { AutoCompleteLoader, AutoCompleteOptions, AutoCompleteSuggestion } from "../src/components/auto-complete/index.js"
import { createInput } from "../src/components/input/index.js"
import { createForm } from "../src/components/form/index.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(options: AutoCompleteOptions = {}) {
  document.body.innerHTML = `<form id="form"><label for="city">City</label><div class="mui-input" data-input id="root">
    <input id="city" data-input-control name="a.b[0]" list="cities" value="Paris" required maxlength="80" aria-describedby="help count">
    <span id="count" data-input-count></span><button type="button" data-input-clear hidden>Clear</button></div>
    <button name="intent" value="save">Save</button></form><datalist id="cities"><option value="Paris" label="France"></option><option value="Tokyo"></option><template><span>Fallback template</span></template></datalist>
    <p id="help">Help</p><p id="status">Original status</p><p id="feedback" hidden></p><button id="outside" type="button">Outside</button>`
  const input = document.querySelector<HTMLInputElement>("#city")!, list = document.querySelector<HTMLDataListElement>("#cities")!
  const status = document.querySelector<HTMLElement>("#status")!, form = document.querySelector("form")!
  const original = [...list.childNodes]
  const helper = createAutoComplete(input, { debounce: 0, status, ...options }); helpers.push(helper)
  return { helper, input, list, original, status, form }
}
function deferred() {
  let resolve!: (items: readonly (string | AutoCompleteSuggestion)[]) => void, reject!: (reason: unknown) => void
  const promise = new Promise<readonly (string | AutoCompleteSuggestion)[]>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
afterEach(() => { helpers.splice(0).reverse().forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("native association, static fallback and ownership", () => {
  it("preserves native controls, listeners, defaults, labels, free text and original datalist nodes", async () => {
    const { helper, input, list, original, form } = fixture(), label = input.labels![0], listener = vi.fn()
    input.addEventListener("input", listener); input.focus(); input.setSelectionRange(1, 3)
    expect((await helper.query()).status).toBe("skipped")
    expect([...list.childNodes]).toEqual(original); expect(input.labels![0]).toBe(label)
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3])
    input.value = "Unlisted"; helper.refresh()
    expect(form.checkValidity()).toBe(true); expect(new FormData(form).get("a.b[0]")).toBe("Unlisted")
    input.dispatchEvent(new Event("input", { bubbles: true })); expect(listener).toHaveBeenCalledOnce()
    expect(input.defaultValue).toBe("Paris"); expect(input.getAttribute("aria-describedby")).toBe("help count")
    expect(input.hasAttribute("aria-expanded")).toBe(false); expect(input.hasAttribute("role")).toBe(false)
  })
  it("restores actual authored options and template nodes, including their listeners", () => {
    const { helper, list, original } = fixture(), listener = vi.fn()
    original[0]!.addEventListener("original", listener)
    helper.setSuggestions(["London"]); expect(list.options[0]!.value).toBe("London")
    helper.disconnect(); expect([...list.childNodes]).toEqual(original)
    list.firstChild!.dispatchEvent(new Event("original")); expect(listener).toHaveBeenCalledOnce()
  })
  it("requires explicit unique list association and rejects replacement ARIA semantics", () => {
    const { helper, input, list } = fixture(); helper.disconnect()
    input.removeAttribute("list"); expect(() => createAutoComplete(input)).toThrow("association")
    input.setAttribute("list", list.id); input.setAttribute("aria-expanded", "false")
    expect(() => createAutoComplete(input)).toThrow("native semantics")
  })
  it("allows native static sharing but refuses a competing managed writer and detects later consumers", async () => {
    const { helper, input, list, original, form } = fixture()
    helper.setSuggestions(["Managed"])
    const other = document.createElement("input"); other.setAttribute("list", list.id); form.append(other)
    await flush()
    expect(helper.connected).toBe(false); expect([...list.childNodes]).toEqual(original)
    expect(other.list).toBe(list); expect(input.list).toBe(list)
    expect(() => createAutoComplete(input)).toThrow("one connected input")
  })
  it("rejects duplicate owners across module copies and releases on disposal", async () => {
    const { helper, input } = fixture()
    expect(() => createAutoComplete(input)).toThrow("owner")
    vi.resetModules(); const other = await import("../src/components/auto-complete/index.js")
    expect(() => other.createAutoComplete(input)).toThrow("owner")
    helper.disconnect(); helpers.push(other.createAutoComplete(input))
  })
  it.each(["id", "association", "remove", "type"])("disconnects on changed %s without rewriting native association", async mode => {
    const { helper, input, list } = fixture(); helper.setSuggestions(["Managed"])
    if (mode === "id") list.id = "changed"
    if (mode === "association") input.setAttribute("list", "elsewhere")
    if (mode === "remove") input.remove()
    if (mode === "type") input.type = "password"
    await flush(); expect(helper.connected).toBe(false)
    if (mode === "association") expect(input.getAttribute("list")).toBe("elsewhere")
  })
  it("preserves externally changed generated options and status instead of rolling them back", async () => {
    const { helper, list, status } = fixture()
    helper.setSuggestions(["Generated"]); list.options[0]!.label = "Application label"
    status.textContent = "Application status"; status.setAttribute("data-auto-complete-state", "external")
    await flush(); expect(helper.connected).toBe(false)
    expect(list.options[0]!.label).toBe("Application label")
    expect(status.textContent).toBe("Application status"); expect(status.dataset.autoCompleteState).toBe("external")
  })
  it.each(["input", "refresh"])("detects competing option edits before same-task %s can overwrite snapshots", async mode => {
    const load = vi.fn(() => ["Server"]), { helper, list, input } = fixture({ load })
    helper.setSuggestions(["Managed"]); list.options[0]!.label = "Application edit"
    if (mode === "input") { input.value = "Changed"; input.dispatchEvent(new Event("input", { bubbles: true })) }
    else helper.refresh()
    await flush()
    expect(helper.connected).toBe(false); expect(load).not.toHaveBeenCalled()
    expect(list.options[0]!.label).toBe("Application edit")
  })
  it("adopts edited authored fallback content without inventing new options", async () => {
    const { helper, list } = fixture()
    list.options[0]!.value = "Updated fallback"; await flush()
    helper.setSuggestions(["Generated"]); helper.refresh()
    expect(list.options[0]!.value).toBe("Updated fallback")
  })
})

describe("strict bounded suggestion data", () => {
  it("writes safe native values/labels/disabled attributes and keeps them distinct", () => {
    const { helper, list, input } = fixture()
    helper.setSuggestions([{ value: "<img src=x>", label: "Shown label", disabled: true }])
    expect(list.options[0]!.value).toBe("<img src=x>"); expect(list.options[0]!.label).toBe("Shown label")
    expect(list.options[0]!.disabled).toBe(true); expect(list.querySelector("img")).toBeNull()
    expect(input.value).toBe("Paris")
  })
  it.each([null, ["same", "same"], [1], [null], [{}], [{ value: "" }], [{ value: "x", label: 3 }], [{ value: "x", disabled: "yes" }], [{ value: "x", children: [] }], [Array(1)], Array(1), ["x".repeat(2049)]].map((value, index) => ({ value, index })))("rejects invalid results atomically (case $index)", ({ value }) => {
    const { helper, list, original } = fixture()
    expect(() => helper.setSuggestions(value as never)).toThrow()
    expect([...list.childNodes]).toEqual(original)
  })
  it("rejects oversized arrays without truncation or partial replacement", () => {
    const { helper, list, original } = fixture({ maxResults: 2 })
    expect(() => helper.setSuggestions(["a", "b", "c"])).toThrow("at most 2")
    expect([...list.childNodes]).toEqual(original)
  })
  it.each([{ maxResults: 0 }, { maxResults: 101 }, { debounce: -1 }, { debounce: 1001 }, { minLength: 0.5 }, { load: 3 }, { unknown: true }])("rejects invalid configuration %j", value => {
    const { helper, input } = fixture(); helper.disconnect()
    expect(() => createAutoComplete(input, value as AutoCompleteOptions)).toThrow()
  })
  it("empty results do not create selectable empty/loading/error pseudo-options", async () => {
    const { helper, list, input, status } = fixture({ load: () => [] })
    expect((await helper.query()).status).toBe("updated"); expect(helper.state).toBe("empty")
    expect(list.options).toHaveLength(0); expect(input.value).toBe("Paris")
    expect(status.textContent).toContain("free text"); expect(status.hasAttribute("role")).toBe(false)
  })
})

describe("composition, debouncing and honest native events", () => {
  it("debounces input bursts and does not issue a duplicate query for same-value change", async () => {
    const load = vi.fn(() => ["Result"]), { input } = fixture({ load, debounce: 5 })
    for (const value of ["a", "ab", "abc"]) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })) }
    input.dispatchEvent(new Event("change", { bubbles: true }))
    await flush(); expect(load).toHaveBeenCalledOnce(); expect(load.mock.calls[0]![0]).toBe("abc")
  })
  it("holds queries during IME and coalesces compositionend plus final input", async () => {
    const load = vi.fn(() => ["東京"]), { input, helper } = fixture({ load })
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    input.value = "東"; input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    await flush(); expect(load).not.toHaveBeenCalled(); expect((await helper.query()).status).toBe("skipped")
    input.value = "東京"; input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: false }))
    await flush(); expect(load).toHaveBeenCalledOnce()
  })
  it("leaves Enter/modified keys, focus/blur and typed matching values completely native", async () => {
    const { input, helper } = fixture({ load: () => ["Paris"] }), select = vi.fn(), results = vi.fn()
    input.addEventListener("mui:select", select); input.addEventListener("mui:auto-complete-results", results)
    for (const ctrlKey of [false, true]) {
      const event = new KeyboardEvent("keydown", { key: "Enter", ctrlKey, bubbles: true, cancelable: true })
      input.dispatchEvent(event); expect(event.defaultPrevented).toBe(false)
    }
    input.focus(); input.blur(); expect(results).not.toHaveBeenCalled()
    const result = await helper.query(); expect(result.status).toBe("updated")
    expect(select).not.toHaveBeenCalled(); expect(results).toHaveBeenCalledOnce(); expect(input.value).toBe("Paris")
    expect((results.mock.calls[0]![0] as CustomEvent).detail.query).toBe("Paris")
  })
  it("silently sets suggestions without synthetic field events, value changes or selection notification", () => {
    const { helper, input } = fixture(), listener = vi.fn()
    for (const type of ["input", "change", "mui:auto-complete-results", "mui:select"]) input.addEventListener(type, listener)
    helper.setSuggestions(["New"]); expect(listener).not.toHaveBeenCalled(); expect(input.value).toBe("Paris")
  })
})

describe("async freshness, explicit failure and availability", () => {
  it.each(["input", "silent", "refresh", "disabled", "readonly", "remove", "dispose", "options"])("prevents stale %s results from replacing current suggestions", async mode => {
    const pending = deferred(), { helper, input, list, original } = fixture({ load: () => pending.promise, debounce: 1000 })
    const promise = helper.query(); await Promise.resolve()
    if (mode === "input") { input.value = "Other"; input.dispatchEvent(new Event("input", { bubbles: true })) }
    if (mode === "silent") input.value = "Silent write"
    if (mode === "refresh") helper.refresh()
    if (mode === "disabled") input.disabled = true
    if (mode === "readonly") input.readOnly = true
    if (mode === "remove") input.remove()
    if (mode === "dispose") helper.disconnect()
    if (mode === "options") list.options[0]!.label = "Author changed"
    pending.resolve(["Stale"])
    expect((await promise).status).toBe("aborted")
    expect([...list.childNodes]).toEqual(original); expect(list.options[0]!.value).toBe("Paris")
  })
  it("aborts an ignoring loader promptly, and guards rapid query order", async () => {
    const first = deferred(), second = deferred(), load = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const { helper, list } = fixture({ load })
    const one = helper.query(); await Promise.resolve(); const two = helper.query(); await Promise.resolve()
    expect((await one).status).toBe("aborted")
    second.resolve(["Newest"]); expect((await two).status).toBe("updated")
    first.resolve(["Old"]); await flush(); expect(list.options[0]!.value).toBe("Newest")
  })
  it.each(["setter", "query", "dispose"])("cannot write after synchronous abort transfers ownership (%s)", async mode => {
    const { helper, input, list } = fixture({ load: (_, { signal }) => new Promise(() => {
      signal.addEventListener("abort", () => {
        helper.disconnect()
        const replacement = createAutoComplete(input); helpers.push(replacement)
        replacement.setSuggestions(["New owner"])
      })
    }) })
    const pending = helper.query(); await Promise.resolve()
    if (mode === "setter") expect(() => helper.setSuggestions(["Old owner"])).toThrow("superseded")
    if (mode === "query") expect((await helper.query()).status).toBe("aborted")
    if (mode === "dispose") helper.disconnect()
    expect((await pending).status).toBe("aborted"); await flush()
    expect(list.options[0]!.value).toBe("New owner")
  })
  it("returns a live freshness flag without polling or overwriting a direct value write", async () => {
    const { helper, input } = fixture({ load: () => ["New"] }), result = await helper.query()
    expect(result.current).toBe(true); input.value = "Changed silently"
    expect(result.current).toBe(false); expect(input.value).toBe("Changed silently")
  })
  it("skips below minLength and disabled/readonly/hidden/fieldset-ineligible queries", async () => {
    const load = vi.fn(() => []), { helper, input, form } = fixture({ load, minLength: 6 })
    expect((await helper.query()).status).toBe("skipped"); input.value = "Longer"
    input.disabled = true; expect((await helper.query()).status).toBe("skipped")
    input.disabled = false; input.readOnly = true; expect((await helper.query()).status).toBe("skipped")
    input.readOnly = false; form.hidden = true; expect((await helper.query()).status).toBe("skipped")
    form.hidden = false; const fieldset = document.createElement("fieldset"); fieldset.disabled = true; form.append(fieldset); fieldset.append(input)
    expect((await helper.query()).status).toBe("skipped")
    const legend = document.createElement("legend"); legend.append(input); fieldset.prepend(legend)
    expect((await helper.query()).status).toBe("updated"); expect(load).toHaveBeenCalledOnce()
  })
  it.each(["throw", "reject", "malformed", "unexpected-abort"])("surfaces %s as a rejected query and error event, never success", async mode => {
    const load: AutoCompleteLoader = () => {
      if (mode === "throw") throw new Error("Broken")
      if (mode === "reject") return Promise.reject(new Error("Broken"))
      if (mode === "unexpected-abort") return Promise.reject(new DOMException("Unexpected", "AbortError"))
      return false as never
    }
    const { helper, input, list } = fixture({ load }), errors = vi.fn(); input.addEventListener("mui:auto-complete-error", errors)
    await expect(helper.query()).rejects.toThrow()
    expect(errors).toHaveBeenCalledOnce(); expect(helper.state).toBe("error"); expect(list.options[0]!.value).toBe("Paris")
  })
  it("consumes expected abort but surfaces unexpected late rejection after disposal", async () => {
    const pending = deferred(), { helper, input } = fixture({ load: () => pending.promise }), errors = vi.fn()
    input.addEventListener("mui:auto-complete-error", errors)
    const query = helper.query(); await Promise.resolve(); helper.disconnect()
    expect((await query).status).toBe("aborted")
    pending.reject(new Error("Late unexpected error")); await flush(); expect(errors).toHaveBeenCalledOnce()
  })
  it("expected AbortSignal rejection returns aborted without an error event", async () => {
    const { helper, input } = fixture({ load: (_, { signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new DOMException("Cancelled", "AbortError")))) })
    const errors = vi.fn(); input.addEventListener("mui:auto-complete-error", errors)
    const query = helper.query(); await Promise.resolve(); helper.refresh()
    expect((await query).status).toBe("aborted"); await flush(); expect(errors).not.toHaveBeenCalled()
  })
})

describe("native reset and concrete Input/Form composition", () => {
  it("preserves external form association, native submission/submitter/required and reset defaults", async () => {
    const { helper, input, form, list, original } = fixture()
    input.setAttribute("form", "form"); document.body.append(input); helper.refresh()
    helper.setSuggestions(["Other"]); input.value = "Unlisted"
    expect(new FormData(form, form.querySelector<HTMLButtonElement>('button[name="intent"]')!).get("intent")).toBe("save")
    expect(new FormData(form).get("a.b[0]")).toBe("Unlisted"); expect(input.validity.valid).toBe(true)
    form.reset(); await flush()
    expect(input.value).toBe("Paris"); expect([...list.childNodes]).toEqual(original)
  })
  it("cancelled reset preserves settled options, status and edited value", async () => {
    const { helper, form, input, list, status } = fixture()
    input.value = "Changed"; helper.setSuggestions(["Managed"])
    const text = status.textContent
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(input.value).toBe("Changed"); expect(list.options[0]!.value).toBe("Managed"); expect(status.textContent).toBe(text)
  })
  it("native reset aborts pending work, but cannot cancel a newer immediate post-reset query", async () => {
    const pending = deferred(), { helper, form, list } = fixture({ load: () => pending.promise })
    const old = helper.query(); await Promise.resolve(); form.reset()
    expect((await old).status).toBe("aborted")
    const fresh = helper.query(); await flush(); pending.resolve(["Fresh reset"])
    expect((await fresh).status).toBe("updated"); expect(list.options[0]!.value).toBe("Fresh reset")
  })
  it("reset ends old composition even after a newer query generation, without suppressing future input", async () => {
    const load = vi.fn(() => ["Result"]), { helper, form, input } = fixture({ load })
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    form.reset(); await helper.query(); await flush()
    input.value = "After reset"; input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: false }))
    await flush(); expect(load).toHaveBeenCalledOnce()
  })
  it("Input-first reset observers cannot leave the suggestion coordinator composing forever", async () => {
    const { helper, form, input } = fixture(); helper.disconnect()
    const entry = createInput(document.querySelector("#root")!); helpers.push(entry)
    const load = vi.fn(() => ["Result"]), next = createAutoComplete(input, { load, debounce: 0 }); helpers.push(next)
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    input.value = "Composing"; input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    form.reset(); await flush()
    input.value = "After"; input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: false }))
    await flush(); expect(load).toHaveBeenCalledOnce()
  })
  it("old reset cleanup does not terminate a genuinely newer composition session", async () => {
    const load = vi.fn(() => []), { helper, input, form } = fixture({ load })
    form.reset(); input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    await flush(); expect((await helper.query()).status).toBe("skipped"); expect(load).not.toHaveBeenCalled()
  })
  it.each(["auto-first", "input-first"])("reuses Input clear and Form feedback without ARIA collisions (%s disposal)", async order => {
    const { helper, input, form, list, original } = fixture({ load: () => ["Queried"] })
    const entry = createInput(document.querySelector("#root")!)
    const coordinator = createForm(form, { items: [{ key: "city", controls: [input], feedback: document.querySelector("#feedback")!, validator: () => ({ message: "App check" }) }] })
    helpers.push(entry, coordinator)
    await helper.query(); await coordinator.validate()
    expect(input.getAttribute("aria-describedby")).toBe("help count feedback")
    expect(entry.clear()).toBe(true); await flush()
    expect(input.value).toBe(""); expect(input.validity.valueMissing).toBe(true)
    expect(input.getAttribute("aria-describedby")).toBe("help count"); expect([...list.childNodes]).toEqual(original)
    entry.setValue("Silent"); helper.refresh(); coordinator.refresh()
    if (order === "auto-first") { helper.disconnect(); entry.disconnect() } else { entry.disconnect(); helper.disconnect() }
    coordinator.disconnect()
    expect(input.value).toBe("Silent"); expect(input.defaultValue).toBe("Paris"); expect(input.getAttribute("aria-describedby")).toBe("help count")
  })
  it("cleanup is idempotent, removes scheduled work, and never steals outside focus", async () => {
    const load = vi.fn(() => []), { helper, input } = fixture({ load, debounce: 5 })
    input.dispatchEvent(new Event("input", { bubbles: true })); document.querySelector<HTMLButtonElement>("#outside")!.focus()
    helper.disconnect(); helper.disconnect(); await flush()
    expect(load).not.toHaveBeenCalled(); expect(document.activeElement?.id).toBe("outside")
    await expect(helper.query()).rejects.toThrow("disconnected")
  })
})
