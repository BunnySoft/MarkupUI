import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createMention } from "../src/components/mention/index.js"
import type { MentionOption, MentionOptions } from "../src/components/mention/index.js"
import { createInput } from "../src/components/input/index.js"
import { createForm } from "../src/components/form/index.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 20))
function fixture(options: Partial<MentionOptions> = {}, type = "textarea") {
  document.body.innerHTML = `<form id="form"><div class="mui-input" data-input id="root"><label for="editor">Message</label>
    ${type === "textarea" ? '<textarea id="editor" data-input-control name="text.body" maxlength="100" aria-describedby="help count">Hello </textarea>' : '<input id="editor" data-input-control type="text" name="text.body" value="Hello " maxlength="100" aria-describedby="help count">'}
    <span id="count" data-input-count></span></div><p id="help">Help</p><p id="feedback" hidden></p>
    <section id="panel" aria-label="Mention choices" hidden><ul data-mention-options></ul><p data-mention-status>Original status</p></section>
    <button name="intent" value="save">Submit</button></form><button id="outside" type="button">Outside</button>`
  const control = document.querySelector<HTMLInputElement | HTMLTextAreaElement>("#editor")!, panel = document.querySelector<HTMLElement>("#panel")!
  const helper = createMention(control, { panel, options: [{ value: "alice", label: "alice label" }, { value: "alex" }], debounce: 0, ...options }); helpers.push(helper)
  const form = document.querySelector("form")!, list = panel.querySelector<HTMLElement>("[data-mention-options]")!
  return { control, panel, helper, form, list }
}
function caret(control: HTMLInputElement | HTMLTextAreaElement, text: string, start = text.length, end = start) {
  control.value = text; control.focus(); control.setSelectionRange(start, end)
}
function deferred() {
  let resolve!: (options: readonly MentionOption[]) => void, reject!: (reason: unknown) => void
  const promise = new Promise<readonly MentionOption[]>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
afterEach(() => { helpers.splice(0).reverse().forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("default styles", () => {
  const css = readFileSync(resolve("src", "components", "mention", "mention.css"), "utf8")

  it("uses the reference control scale and option density within budget", () => {
    expect(css).toContain("--_mui-mention-height: 28px")
    expect(css).toContain("--_mui-mention-height: 34px")
    expect(css).toContain("--_mui-mention-height: 40px")
    expect(css).toContain("block-size: var(--_mui-mention-height)")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1250)
  })

  it("leaves composed Input controls to their owning stylesheet", () => {
    expect(css).toContain(".mui-mention__editor:not([data-input-control])")
    expect(css).not.toMatch(/\.mui-mention__editor\s*\{/)
  })

  it("uses explicit light-dark popup states and forced-color roles", () => {
    expect(css).toContain("light-dark(#f3f3f5, rgba(255, 255, 255, .09))")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("background: Highlight")
  })

  it("removes transient suggestions from print", () => {
    expect(css).toContain("@media print")
    expect(css).toMatch(/@media print \{\s*\.mui-mention__panel \{\s*display: none/)
  })
})

describe("bounded prefix/caret contexts", () => {
  it.each([
    ["Hi @al", 6, "@", "al", 3],
    ["mail@example", 12, "@", "example", 4],
    ["@@al", 4, "@", "al", 1],
    ["before #do", 10, "#", "do", 7],
    ["😀 @al trailing", 6, "@", "al", 3],
    ["@abcDEF", 4, "@", "abc", 0],
  ])("detects original code-unit token context in %s", (text, end, prefix, query, start) => {
    const { control, helper } = fixture({ prefix: ["@", "#"] })
    caret(control, text, end)
    expect(helper.context).toEqual({ prefix, query, start, end })
  })
  it.each(["", "ordinary text", "@", "@a next", "@a\nnext", "@a\rnext"])("does not search missing/empty/separated context %j", async text => {
    const load = vi.fn(() => []), { control, helper } = fixture({ options: undefined, load })
    caret(control, text); expect((await helper.query()).status).toBe("skipped"); expect(load).not.toHaveBeenCalled()
  })
  it("supports explicit prefix-only queries, BMP prefixes and alternate separators without rewriting source", async () => {
    const { control, helper } = fixture({ prefix: "＠", separator: ";", minQueryLength: 0 })
    caret(control, "text;＠")
    expect(helper.context?.query).toBe(""); expect((await helper.query()).count).toBe(2)
    expect(helper.select("alex")).toBe(true); expect(control.value).toBe("text;＠alex;")
  })
  it("rejects selected ranges and caret splits inside surrogate pairs", () => {
    const { control, helper } = fixture()
    caret(control, "@alice", 1, 3); expect(helper.context).toBeNull()
    caret(control, "@😀", 2); expect(helper.context).toBeNull()
  })
  it("bounds queries and preserves Unicode query text without normalization", () => {
    const { control, helper } = fixture({ maxQueryLength: 4 })
    caret(control, "@abcde"); expect(helper.context).toBeNull()
    caret(control, "@e\u0301"); expect(helper.context?.query).toBe("e\u0301")
  })
  it.each([{ prefix: "" }, { prefix: "😀" }, { prefix: ["@", "@"] }, { prefix: [" "] }, { prefix: [] }, { separator: "@" },
    { separator: "\n" }, { separator: null }, { maxResults: 101 }, { debounce: -1 }, { minQueryLength: 3, maxQueryLength: 2 }, { maxQueryLength: 257 }])("rejects invalid configuration %j", options => {
    const { helper, control, panel } = fixture(); helper.disconnect()
    expect(() => createMention(control, { panel, ...options } as MentionOptions)).toThrow()
  })
})

describe("safe option data and explicit filtering", () => {
  it("uses case-sensitive startsWith on plain label/value for static options", async () => {
    const { control, helper } = fixture()
    caret(control, "@al"); expect((await helper.query()).count).toBe(2)
    caret(control, "@AL"); expect((await helper.query()).count).toBe(0)
  })
  it("uses plain button labels but inserts only the option value", async () => {
    const { control, helper, list } = fixture({ options: [{ value: "alice", label: "<Alice>", class: "custom-choice" }], filter: () => true })
    caret(control, "@al"); await helper.query()
    expect(list.querySelector("button")!.textContent).toBe("<Alice>"); expect(list.querySelector("alice")).toBeNull()
    expect(list.querySelector("button")!.classList.contains("custom-choice")).toBe(true)
    helper.select("alice"); expect(control.value).toBe("@alice ")
  })
  it.each([null, [null], [{ value: "x" }, { value: "x" }], [{ value: 1 }], [{ value: "a b" }], [{ value: "@name" }],
    [{ value: "\uD800" }], [{ value: "\t" }], [{ value: "ok", label: () => "render" }], [{ value: "ok", style: "color:red" }], Array(1)].map(value => ({ value })))("rejects malformed/ambiguous option records atomically", ({ value }) => {
    const { helper, list } = fixture()
    expect(() => helper.setOptions(value as never)).toThrow(); expect(list.children).toHaveLength(0)
  })
  it("rejects excess results and nonboolean filters as errors, never silently truncating", async () => {
    const { helper, control } = fixture({ maxResults: 2, filter: (() => "true") as never })
    expect(() => helper.setOptions([{ value: "a" }, { value: "b" }, { value: "c" }])).toThrow("at most")
    caret(control, "@al"); await expect(helper.query()).rejects.toThrow("boolean")
  })
  it("reads option fields once before freezing their normalized values", async () => {
    let reads = 0
    const { helper, control } = fixture({ options: [{ get value() { reads++; return reads === 1 ? "alice" : "bad\nvalue" } }] })
    caret(control, "@al"); await helper.query(); helper.select("alice")
    expect(reads).toBe(1); expect(control.value).toBe("@alice ")
  })
})

describe("native insertion, ownership and ordinary keyboard", () => {
  it.each(["textarea", "input"])("preserves surrounding text/defaults/identity and emits exactly one input for %s", async type => {
    const { control, helper, form } = fixture({}, type), original = control, label = control.labels![0], input = vi.fn(), change = vi.fn()
    control.addEventListener("input", input); control.addEventListener("change", change)
    caret(control, "Before @al untouched", 10); await helper.query()
    expect(helper.select("alice")).toBe(true)
    expect(control).toBe(original); expect(control.labels![0]).toBe(label)
    expect(control.value).toBe("Before @alice untouched"); expect(control.defaultValue).toBe("Hello ")
    expect(control.selectionStart).toBe(14); expect(control.selectionEnd).toBe(14)
    expect(input).toHaveBeenCalledOnce(); expect(change).not.toHaveBeenCalled()
    expect((input.mock.calls[0]![0] as InputEvent).inputType).toBe("insertReplacementText")
    expect(new FormData(form).getAll("text.body")).toEqual(["Before @alice untouched"])
  })
  it("replaces only the prefix-to-caret fragment and does not erase text to the right", async () => {
    const { control, helper } = fixture()
    caret(control, "@alTAIL", 3); await helper.query(); helper.select("alice")
    expect(control.value).toBe("@alice TAIL")
  })
  it("does not truncate an insertion that would exceed native maxlength", async () => {
    const { control, helper, panel } = fixture()
    control.maxLength = 4; caret(control, "@al"); await helper.query()
    expect(helper.select("alice")).toBe(false); expect(control.value).toBe("@al"); expect(panel.hidden).toBe(false)
    expect(panel.textContent).toContain("maxlength")
  })
  it("does not intercept ordinary editor Enter, Tab or arrow keys", () => {
    const { control } = fixture()
    for (const key of ["Enter", "Tab", "ArrowLeft", "ArrowRight", "ArrowDown"]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }); control.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
  })
  it("keeps pointer blur into a native candidate until click and returns the editor caret", async () => {
    const { control, helper, list } = fixture()
    caret(control, "@al"); await helper.query()
    const choice = list.querySelector<HTMLButtonElement>("button")!; choice.focus(); await Promise.resolve()
    expect(helper.context?.query).toBe("al")
    choice.click(); await flush()
    expect(control.value).toBe("@alice "); expect(document.activeElement).toBe(control)
  })
  it("does not dismiss a known candidate destination while native focus is temporarily BODY", async () => {
    const { control, helper, list, panel } = fixture()
    caret(control, "@al"); await helper.query()
    const choice = list.querySelector<HTMLButtonElement>("button")!
    control.blur()
    control.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: choice }))
    await Promise.resolve()
    expect(panel.hidden).toBe(false)
    choice.focus(); choice.click(); await flush()
    expect(control.value).toBe("@alice ")
  })
  it("Escape closes focused candidates without leaving invisible focus or reopening on selectionchange", async () => {
    const { control, helper, panel, list } = fixture()
    caret(control, "@al"); await helper.query()
    const choice = list.querySelector<HTMLButtonElement>("button")!; choice.focus()
    choice.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))
    document.dispatchEvent(new Event("selectionchange")); await flush()
    expect(panel.hidden).toBe(true); expect(document.activeElement).toBe(control); expect(control.value).toBe("@al")
  })
  it("does not select disabled choices or insert after focus leaves the interaction", async () => {
    const { control, helper } = fixture({ options: [{ value: "alice", disabled: true }] })
    caret(control, "@al"); await helper.query(); expect(helper.select("alice")).toBe(false)
    helper.setOptions([{ value: "alice" }]); await helper.query()
    document.querySelector<HTMLButtonElement>("#outside")!.focus()
    expect(helper.select("alice")).toBe(false); expect(control.value).toBe("@al")
  })
  it("rechecks caret/text after reentrant focus handlers before changing the editor", async () => {
    const { control, helper, list } = fixture()
    caret(control, "@al"); await helper.query(); list.querySelector<HTMLButtonElement>("button")!.focus()
    control.addEventListener("focus", () => { control.value = "new text"; control.setSelectionRange(0, 0) }, { once: true })
    expect(helper.select("alice")).toBe(false); expect(control.value).toBe("new text")
  })
  it("shares native Input/Form tokens and validity without hidden fields or fake textarea roles", async () => {
    const { helper, control, form } = fixture()
    const entry = createInput(document.querySelector("#root")!), validation = createForm(form, { items: [{ key: "body", controls: [control], feedback: document.querySelector("#feedback")! }] })
    helpers.push(entry, validation)
    control.setCustomValidity("External error")
    caret(control, "@al"); await helper.query(); helper.select("alice")
    expect(control.validationMessage).toBe("External error"); expect(control.hasAttribute("role")).toBe(false)
    expect(control.getAttribute("aria-describedby")).toBe("help count")
    expect(form.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
    expect(document.querySelector("#count")!.textContent).toContain("7")
  })
})

describe("async context generations, composition and resets", () => {
  it.each(["caret", "text", "prefix", "range", "readonly", "disabled", "refresh", "remove", "dispose"])("aborts stale %s results without changing text or focus", async mode => {
    const pending = deferred(), { control, helper, panel } = fixture({ options: undefined, load: () => pending.promise, prefix: ["@", "#"] })
    caret(control, "@al #do", 3); const query = helper.query(); await Promise.resolve()
    if (mode === "caret") control.setSelectionRange(7, 7)
    if (mode === "text") control.value = "@new"
    if (mode === "prefix") { control.value = "#al #do"; control.setSelectionRange(3, 3) }
    if (mode === "range") control.setSelectionRange(1, 3)
    if (mode === "readonly") control.readOnly = true
    if (mode === "disabled") control.disabled = true
    if (mode === "refresh") helper.refresh()
    if (mode === "remove") control.remove()
    if (mode === "dispose") helper.disconnect()
    const text = control.value; pending.resolve([{ value: "alice" }])
    expect((await query).status).toBe("aborted"); expect(control.value).toBe(text); expect(panel.hidden).toBe(true)
  })
  it("moving the caret without editing invalidates even a never-settling loader", async () => {
    const { control, helper } = fixture({ options: undefined, load: () => new Promise(() => {}), debounce: 1000 })
    caret(control, "@al @bo", 3); const query = helper.query(); await Promise.resolve()
    control.setSelectionRange(7, 7); document.dispatchEvent(new Event("selectionchange"))
    expect((await query).status).toBe("aborted")
  })
  it("latest request wins and late unexpected rejection remains explicit", async () => {
    const first = deferred(), second = deferred(), load = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const { control, helper, list } = fixture({ options: undefined, load }), errors = vi.fn(); control.addEventListener("mui:mention-error", errors)
    caret(control, "@al"); const old = helper.query(); await Promise.resolve()
    caret(control, "@bo"); const fresh = helper.query(); await Promise.resolve()
    expect((await old).status).toBe("aborted"); second.resolve([{ value: "bob" }]); expect((await fresh).status).toBe("updated")
    first.reject(new Error("Late search failure")); await flush()
    expect(list.querySelector("button")!.textContent).toBe("bob"); expect(errors).toHaveBeenCalledOnce()
  })
  it("expected abort is not success/error, while uncancelled rejection rejects explicitly", async () => {
    const { control, helper } = fixture({ options: undefined, load: ({ signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new DOMException("Cancelled", "AbortError")))) })
    const errors = vi.fn(); control.addEventListener("mui:mention-error", errors)
    caret(control, "@al"); const result = helper.query(); await Promise.resolve(); helper.close()
    expect((await result).status).toBe("aborted"); await flush(); expect(errors).not.toHaveBeenCalled()
  })
  it("rejects bad loader returns and unexpected failures without logging or overwriting text", async () => {
    const { control, helper } = fixture({ options: undefined, load: (() => Promise.reject(new Error("Unavailable"))) as never })
    caret(control, "@al"); await expect(helper.query()).rejects.toThrow("Unavailable"); expect(control.value).toBe("@al")
  })
  it("does not query during composition and resumes only after the final native value", async () => {
    const load = vi.fn(() => []), { control, helper } = fixture({ options: undefined, load })
    caret(control, "@al")
    control.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    control.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    expect((await helper.query()).status).toBe("skipped"); expect(load).not.toHaveBeenCalled()
    control.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    control.dispatchEvent(new InputEvent("input", { bubbles: true })); await flush()
    expect(load).toHaveBeenCalledOnce()
  })
  it("reset cancels old work but preserves native values/cancellation and an immediate fresh query", async () => {
    const load = vi.fn(() => []), { control, helper, form } = fixture({ options: undefined, load })
    control.defaultValue = "@al"; control.value = "@al"; control.focus(); control.setSelectionRange(3, 3)
    const old = helper.query(); form.reset(); expect((await old).status).toBe("aborted")
    control.setSelectionRange(3, 3); const fresh = await helper.query(); expect(fresh.status).toBe("updated"); expect(fresh.current).toBe(true)
    control.value = "edited"; form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(control.value).toBe("edited"); expect(control.defaultValue).toBe("@al")
  })
  it("does not start a loader from reentrant abort handlers inside reset", async () => {
    let helperRef: ReturnType<typeof createMention>
    const load = vi.fn(({ signal }: { signal: AbortSignal }) => new Promise<readonly MentionOption[]>(() => {
      signal.addEventListener("abort", () => { void helperRef.query() })
    }))
    const { control, helper, form } = fixture({ options: undefined, load }); helperRef = helper
    control.defaultValue = "@al"; caret(control, "@al"); const query = helper.query(); await Promise.resolve()
    form.reset(); expect((await query).status).toBe("aborted"); await flush()
    expect(load).toHaveBeenCalledOnce()
  })
  it("rebases the reset caret when abort callbacks query/refresh during dispatch", async () => {
    let afterAbort = () => {}
    const load = vi.fn(({ signal }: { signal: AbortSignal }) => new Promise<readonly MentionOption[]>(() => signal.addEventListener("abort", () => afterAbort())))
    const { control, helper, form, panel } = fixture({ options: undefined, load })
    afterAbort = () => { void helper.query(); helper.refresh() }
    control.defaultValue = "@bob"; caret(control, "@a", 2)
    const query = helper.query(); await Promise.resolve(); form.reset()
    expect((await query).status).toBe("aborted"); await Promise.resolve()
    document.dispatchEvent(new Event("selectionchange")); await flush()
    expect(load).toHaveBeenCalledOnce(); expect(panel.hidden).toBe(true); expect(control.value).toBe("@bob")
  })
})

describe("owned panel lifetime and native boundaries", () => {
  it("rejects status role/label proxies and inaccessible panels rather than editing their names", () => {
    const { helper, control, panel } = fixture(); helper.disconnect()
    const status = panel.querySelector<HTMLElement>("[data-mention-status]")!
    status.setAttribute("role", "button")
    expect(() => createMention(control, { panel })).toThrow("nonlive")
    status.removeAttribute("role"); panel.setAttribute("aria-hidden", "true")
    expect(() => createMention(control, { panel })).toThrow("panel")
  })
  it("refuses duplicate owners and restores initial panel/status without changing the native field", async () => {
    const { helper, control, panel } = fixture(), before = control.outerHTML
    expect(() => createMention(control, { panel })).toThrow("owner")
    caret(control, "@al"); await helper.query(); helper.disconnect(); helper.disconnect()
    expect(panel.hidden).toBe(true); expect(panel.querySelector("[data-mention-status]")!.textContent).toBe("Original status")
    expect(control.outerHTML).toBe(before); expect(control.value).toBe("@al")
  })
  it("does not overwrite externally changed candidate markup or status during disposal", async () => {
    const { helper, control, list, panel } = fixture()
    caret(control, "@al"); await helper.query()
    list.querySelector("button")!.textContent = "Application replacement"
    panel.querySelector("[data-mention-status]")!.textContent = "Application status"
    helper.disconnect()
    expect(list.textContent).toContain("Application replacement"); expect(panel.textContent).toContain("Application status")
  })
  it("releases ownership before abort callbacks initialize a replacement", async () => {
    let replace = () => {}
    let replacement: ReturnType<typeof createMention> | null = null
    const { helper, control, panel } = fixture({ options: undefined, load: ({ signal }) => new Promise(() => signal.addEventListener("abort", () => replace())) })
    replace = () => { replacement = createMention(control, { panel }); helpers.push(replacement) }
    caret(control, "@al"); const query = helper.query(); await Promise.resolve()
    helper.disconnect(); expect((await query).status).toBe("aborted")
    expect(replacement).not.toBeNull()
  })
  it("respects external form association, readonly/fieldset disabling and first-legend eligibility", async () => {
    const { control, helper, form } = fixture({}, "input")
    control.setAttribute("form", form.id); document.body.append(control)
    caret(control, "@al"); await helper.query(); helper.select("alice")
    expect(new FormData(form).get("text.body")).toBe("@alice ")
    const fieldset = document.createElement("fieldset"); fieldset.disabled = true; document.body.append(fieldset); fieldset.append(control)
    caret(control, "@al"); expect((await helper.query()).status).toBe("skipped")
    const legend = document.createElement("legend"); fieldset.append(legend); legend.append(control)
    control.focus(); expect((await helper.query()).status).toBe("updated")
  })
})
