import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createDynamicTags } from "../src/components/dynamic-tags/index.js"
import type { DynamicTagsOptions } from "../src/components/dynamic-tags/index.js"
import { createDynamicInput } from "../src/components/dynamic-input/index.js"
import { createForm } from "../src/components/form/index.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 25))
const row = (key?: string, value = "") => `<li data-dynamic-row ${key ? `data-dynamic-key="${key}"` : ""}><input type="text" readonly data-tags-value name="tags[]" value="${value}" aria-label="Tag"><button type="button" data-dynamic-action="remove" hidden>Remove</button></li>`
function fixture(options: DynamicTagsOptions = {}, values = ["alpha", "beta"]) {
  document.body.innerHTML = `<form id="form"><fieldset data-dynamic-tags data-dynamic-input id="tags"><legend>Tags</legend>
    <ul data-dynamic-rows>${values.map((value, index) => row(`seed-${index}`, value)).join("")}</ul>
    <template data-dynamic-template>${row()}</template>
    <div data-tags-entry hidden><label for="draft">New tag</label><input id="draft" type="text" data-tags-editor maxlength="32" aria-describedby="help"><button type="button" data-dynamic-add hidden>Add</button></div>
    <p data-tags-status>Original status</p></fieldset><button name="intent" value="submit">Submit</button></form>
    <p id="help">Help</p><p id="feedback" hidden></p><button type="button" id="outside">Outside</button>`
  const root = document.querySelector<HTMLFieldSetElement>("#tags")!, form = document.querySelector("form")!
  const editor = document.querySelector<HTMLInputElement>("#draft")!, add = root.querySelector<HTMLButtonElement>("[data-dynamic-add]")!
  const entry = root.querySelector<HTMLElement>("[data-tags-entry]")!, status = root.querySelector<HTMLElement>("[data-tags-status]")!
  const template = root.querySelector<HTMLTemplateElement>("template")!
  const helper = createDynamicTags(root, options); helpers.push(helper)
  return { root, form, editor, add, entry, status, template, helper }
}
afterEach(() => { helpers.splice(0).reverse().forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("default styles", () => {
  const css = readFileSync(resolve("src", "components", "dynamic-tags", "dynamic-tags.css"), "utf8")

  it("uses the reference tag size scale and wrapping rhythm within budget", () => {
    expect(css).toContain("--_mui-tags-height: 28px")
    expect(css).toContain("--_mui-tags-height: 22px")
    expect(css).toContain("--_mui-tags-height: 34px")
    expect(css).toContain("gap: 4px 8px")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1500)
  })

  it("keeps native tag values compact without hiding labelled actions", () => {
    expect(css).toContain("field-sizing: content")
    expect(css).toContain("block-size: calc(var(--_mui-tags-height) - 6px)")
    expect(css).not.toMatch(/text-indent:\s*-\d|font-size:\s*0/)
  })

  it("provides semantic light-dark palettes and forced-color controls", () => {
    expect(css).toContain("--mui-tags-background: light-dark(rgba(32, 128, 240, .1), rgba(112, 192, 232, .16))")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("background: ButtonFace")
  })

  it("prints committed native values without enhancement controls", () => {
    expect(css).toContain("@media print")
    expect(css).toMatch(/\.mui-dynamic-tags__entry,\s*\n\s*\.mui-dynamic-tags__tag button,\s*\n\s*\.mui-dynamic-tags__status/)
  })
})

describe("real native tag values and inherited collection ownership", () => {
  it("keeps original tags/readonly fields/listeners/defaults and submits exactly one native value per tag", () => {
    const { helper, editor, form } = fixture()
    const initial = helper.tags[0]!, input = initial.control, listener = vi.fn()
    input.addEventListener("focus", listener); input.focus()
    editor.value = "gamma"; expect(helper.commit().status).toBe("added")
    expect(helper.tags[0]).toBe(initial); expect(initial.control).toBe(input); expect(listener).toHaveBeenCalledOnce()
    expect(input.defaultValue).toBe("alpha"); expect(input.readOnly).toBe(true); expect(editor.hasAttribute("name")).toBe(false)
    expect(new FormData(form).getAll("tags[]")).toEqual(["alpha", "beta", "gamma"])
    expect(form.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
  })
  it("preserves strings, whitespace, case and comma paste as one tag without an object model", () => {
    const { helper, editor } = fixture()
    editor.value = "  MiXeD,tag  "; helper.commit()
    expect(helper.values).toEqual(["alpha", "beta", "  MiXeD,tag  "])
    expect(helper.tags[2]!.control.defaultValue).toBe("  MiXeD,tag  ")
  })
  it("stores markup-looking tags only as native input values", () => {
    const { helper, editor, root } = fixture()
    editor.value = "<img src=x>"; helper.commit()
    expect(helper.values[2]).toBe("<img src=x>"); expect(root.querySelector("img")).toBeNull()
  })
  it("allows duplicate strings by default with different keys and precise key removal", () => {
    const { helper, editor, form } = fixture()
    editor.value = "alpha"; helper.commit()
    const original = helper.tags[0]!, duplicate = helper.tags[2]!
    expect(original.key).not.toBe(duplicate.key)
    helper.remove(duplicate.key)
    expect(helper.tags[0]).toBe(original); expect(new FormData(form).getAll("tags[]")).toEqual(["alpha", "beta"])
  })
  it("can reject exact duplicates without trimming other meaningful tags or dropping the draft", () => {
    const { helper, editor, status } = fixture({ duplicates: "reject" })
    editor.value = "alpha"; expect(helper.commit()).toEqual({ status: "rejected", reason: "duplicate" })
    expect(editor.value).toBe("alpha"); expect(status.textContent).toContain("already exists")
    editor.value = " alpha "; expect(helper.commit().status).toBe("added")
    expect(helper.values[2]).toBe(" alpha ")
  })
  it("refuses initial duplicate data under reject policy before exposing dead actions", () => {
    const { helper, root } = fixture({}, ["same", "same"]); helper.disconnect()
    expect(() => createDynamicTags(root, { duplicates: "reject" })).toThrow("duplicate")
    expect(root.querySelector<HTMLElement>("[data-tags-entry]")!.hidden).toBe(true)
  })
  it("reuses Dynamic Input ownership, including cross-module duplicates, without importing Tag", async () => {
    const { helper, root } = fixture()
    expect(() => createDynamicInput(root)).toThrow("owner")
    expect(() => createDynamicTags(root)).toThrow()
    vi.resetModules(); const other = await import("../src/components/dynamic-tags/index.js")
    expect(() => other.createDynamicTags(root)).toThrow()
    helper.disconnect(); helpers.push(other.createDynamicTags(root))
  })
  it("never creates a Tag custom-element registration or checkable/selected ARIA state", () => {
    const before = customElements.get("mui-tag"), { root } = fixture()
    expect(customElements.get("mui-tag")).toBe(before)
    expect(root.querySelectorAll("[aria-checked],[aria-pressed],[role=button]")).toHaveLength(0)
  })
  it.each([{ max: 0 }, { max: 101 }, { max: null }, { duplicates: null }, { create: 1 }, { connect: true }, { value: [] }])("rejects unsupported configuration %j", options => {
    const { helper, root } = fixture(); helper.disconnect()
    expect(() => createDynamicTags(root, options as DynamicTagsOptions)).toThrow()
  })
  it("requires an unnamed bounded editor and real visible readonly tag fields", () => {
    const { helper, root, editor } = fixture(); helper.disconnect()
    editor.name = "draft"; expect(() => createDynamicTags(root)).toThrow("unnamed"); editor.removeAttribute("name")
    root.querySelector<HTMLInputElement>("[data-tags-value]")!.type = "hidden"
    expect(() => createDynamicTags(root)).toThrow("readonly named text")
  })
  it("rejects interactive chip roots, extra hidden proxies and replaced canonical fields", async () => {
    const { helper, root } = fixture()
    const first = helper.tags[0]!.element
    first.setAttribute("role", "button"); await flush()
    expect(helper.connected).toBe(false)
    first.removeAttribute("role")
    const proxy = document.createElement("input"); proxy.type = "hidden"; proxy.name = "proxy"; first.append(proxy)
    expect(() => createDynamicTags(root)).toThrow("proxy")
  })
})

describe("commit policy, callbacks and draft safety", () => {
  it.each(["", " ", "   ", "x".repeat(33)])("rejects blank/overlong draft without mutation (%s)", value => {
    const { helper, editor } = fixture()
    editor.value = value; const result = helper.commit()
    expect(result.status).toBe("rejected"); expect(editor.value).toBe(value); expect(helper.values).toEqual(["alpha", "beta"])
  })
  it("respects native editor validity and external custom messages without taking ownership", () => {
    const { helper, editor } = fixture()
    editor.value = "gamma"; editor.setCustomValidity("Application constraint")
    expect(helper.commit()).toEqual({ status: "rejected", reason: "invalid" }); expect(editor.value).toBe("gamma")
    helper.refresh(); helper.disconnect(); expect(editor.validationMessage).toBe("Application constraint")
  })
  it("supports an explicit synchronous string derivation, with duplicate checking on its result", () => {
    const { helper, editor } = fixture({ create: value => value.toUpperCase(), duplicates: "reject" })
    editor.value = "gamma"; helper.commit(); expect(helper.values[2]).toBe("GAMMA")
    editor.value = "gamma"; expect(helper.commit().status).toBe("rejected"); expect(editor.value).toBe("gamma")
  })
  it.each([{ label: "label", value: "value" }, 12, null, ["value"], "line\nbreak"].map(result => ({ result })))("rejects object/nonstring/multiline creation results atomically", ({ result }) => {
    const { helper, editor } = fixture({ create: (() => result) as never })
    editor.value = "draft"
    if (typeof result === "string") expect(helper.commit().status).toBe("rejected")
    else expect(() => helper.commit()).toThrow()
    expect(editor.value).toBe("draft"); expect(helper.tags).toHaveLength(2)
  })
  it("propagates synchronous and asynchronous creator errors without clearing drafts", async () => {
    const { helper, editor, root } = fixture({ create: (() => Promise.reject(new Error("Late callback failure"))) as never })
    const errors = vi.fn(); root.addEventListener("mui:dynamic-tags-error", errors)
    editor.value = "draft"; expect(() => helper.commit()).toThrow("strings"); await flush()
    expect(editor.value).toBe("draft"); expect(helper.tags).toHaveLength(2)
    expect(errors.mock.calls.some(call => (call[0] as CustomEvent).detail.error.message === "Late callback failure")).toBe(true)
  })
  it("rejects creator reentrancy and preserves the original native draft", () => {
    let reenter = () => {}
    const { helper, editor } = fixture({ create: value => { reenter(); return value } })
    reenter = () => { helper.commit() }
    editor.value = "draft"; expect(() => helper.commit()).toThrow("reenter")
    expect(editor.value).toBe("draft"); expect(helper.tags).toHaveLength(2)
  })
  it("does not overwrite a draft changed by a callback, including silent value writes", () => {
    let change = () => {}
    const { helper, editor } = fixture({ create: value => { change(); return value } })
    change = () => { editor.value = "new draft" }
    editor.value = "old draft"
    expect(helper.commit()).toEqual({ status: "rejected", reason: "stale" })
    expect(editor.value).toBe("new draft"); expect(helper.tags).toHaveLength(2)
  })
  it("uses registered collection cleanup on failed connection without losing the draft", () => {
    const cleaned = vi.fn()
    const { helper, editor } = fixture({ connect: (_, context) => {
      context.onCleanup(cleaned); if (context.key.startsWith("row-")) throw new Error("Connect failed")
    } })
    editor.value = "draft"; expect(() => helper.commit()).toThrow("Connect failed")
    expect(editor.value).toBe("draft"); expect(helper.tags).toHaveLength(2); expect(cleaned).toHaveBeenCalledOnce()
  })
  it("preserves removed tag descriptors even when cleanup detaches value/action children", () => {
    const { helper, root } = fixture({ connect: (row, context) => context.onCleanup(() => { row.replaceChildren() }) })
    const changed = vi.fn(); root.addEventListener("mui:dynamic-tags-change", changed)
    const first = helper.tags[0]!
    helper.remove(first.key)
    expect(changed).toHaveBeenCalledOnce(); expect((changed.mock.calls[0]![0] as CustomEvent).detail.tag.control).toBe(first.control)
    expect(helper.values).toEqual(["beta"])
  })
  it("keeps both owners usable if removal cleanup attempts reentrant wrapper disposal", () => {
    let dispose = () => {}
    const { helper, root } = fixture({ connect: (_, context) => context.onCleanup(() => dispose()) })
    dispose = () => helper.disconnect()
    expect(() => helper.remove(helper.tags[0]!.key)).toThrow("Row removed")
    expect(helper.connected).toBe(true); expect(helper.values).toEqual(["beta"])
    helper.disconnect()
    expect(helper.connected).toBe(false)
    helpers.push(createDynamicTags(root))
  })
  it("a refused teardown during a delegated native remove does not strand the base owner", async () => {
    let dispose = () => {}
    const { helper, root } = fixture({ connect: (_, context) => context.onCleanup(() => dispose()) })
    dispose = () => helper.disconnect()
    helper.tags[0]!.element.querySelector<HTMLButtonElement>("button")!.click(); await flush()
    expect(helper.connected).toBe(true); expect(helper.values).toEqual(["beta"])
    helper.disconnect(); helpers.push(createDynamicTags(root))
  })
})

describe("native editor keys, composition and focus", () => {
  it("commits once through the native button while suppressing the reused raw add handler", async () => {
    const { helper, editor, add, root } = fixture()
    const changed = vi.fn(); root.addEventListener("mui:dynamic-tags-change", changed)
    editor.value = "gamma"; add.focus(); add.click(); await flush()
    expect(helper.values).toEqual(["alpha", "beta", "gamma"]); expect(changed).toHaveBeenCalledOnce()
    expect(editor.value).toBe(""); expect(document.activeElement).toBe(editor)
  })
  it("reserves Enter without implicit form submission; repeat/modified Enter do not create tags", async () => {
    const { helper, editor, form } = fixture(), submitted = vi.fn(); form.addEventListener("submit", submitted)
    editor.value = "gamma"
    for (const data of [{ repeat: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { metaKey: true }]) {
      const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, ...data })
      editor.dispatchEvent(event); expect(event.defaultPrevented).toBe(true)
    }
    await flush(); expect(helper.tags).toHaveLength(2)
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }); editor.dispatchEvent(enter); await flush()
    expect(enter.defaultPrevented).toBe(true); expect(helper.tags).toHaveLength(3); expect(submitted).not.toHaveBeenCalled()
  })
  it("does not add during composition or its same-turn completion Enter", async () => {
    const { helper, editor } = fixture()
    editor.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); editor.value = "東京"
    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true, cancelable: true }))
    editor.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))
    await flush(); expect(helper.tags).toHaveLength(2); expect(editor.value).toBe("東京")
    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })); await flush()
    expect(helper.values[2]).toBe("東京")
  })
  it("Escape cancels pending commit but preserves draft; blur and Backspace have no destructive shortcuts", async () => {
    const { helper, editor } = fixture()
    editor.value = "kept"
    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))
    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))
    editor.dispatchEvent(new FocusEvent("blur")); editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }))
    await flush(); expect(editor.value).toBe("kept"); expect(helper.tags).toHaveLength(2)
  })
  it("preserves draft and editor focus at maximum, and does not call creation when capacity is exhausted", async () => {
    const create = vi.fn(value => value), { helper, editor, add } = fixture({ max: 3, create })
    editor.value = "third"; editor.focus(); helper.commit(); expect(add.disabled).toBe(true); expect(document.activeElement).toBe(editor)
    editor.value = "kept at max"; expect(helper.commit()).toEqual({ status: "rejected", reason: "max" })
    expect(editor.value).toBe("kept at max"); expect(create).toHaveBeenCalledOnce()
  })
  it("keeps editor focus after button commit reaches max, without stealing outside command focus", async () => {
    const { helper, editor, add } = fixture({ max: 3 })
    editor.value = "third"; add.focus(); add.click(); await flush(); expect(document.activeElement).toBe(editor)
    helper.remove(helper.tags[2]!.key)
    const outside = document.querySelector<HTMLButtonElement>("#outside")!; outside.focus(); editor.value = "fourth"; helper.commit()
    expect(document.activeElement).toBe(outside)
  })
  it("coalesces rapid commit requests and preserves newer eventful or silent drafts", async () => {
    const { helper, editor, add } = fixture()
    editor.value = "one"; add.click(); add.click(); await flush()
    expect(helper.values).toEqual(["alpha", "beta", "one"])
    editor.value = "old"; add.click(); editor.value = "new"; await flush()
    expect(helper.tags).toHaveLength(3); expect(editor.value).toBe("new")
  })
})

describe("native forms, refresh, reset and lifecycle", () => {
  it("keeps direct native assignments/defaults and refresh silent, without replacing existing tag nodes", async () => {
    const { helper, editor, root } = fixture(), changed = vi.fn(); root.addEventListener("mui:dynamic-tags-change", changed)
    const tag = helper.tags[0]!
    tag.control.value = "renamed"; editor.value = "draft"; helper.refresh(); await flush()
    expect(helper.tags[0]).toBe(tag); expect(helper.values[0]).toBe("renamed"); expect(tag.control.defaultValue).toBe("alpha")
    expect(changed).not.toHaveBeenCalled()
  })
  it("native reset affects draft and current tag defaults, not the initial list; cancelled reset stays cancelled", async () => {
    const { helper, editor, form } = fixture()
    helper.remove(helper.tags[0]!.key); editor.value = "created"; helper.commit()
    const created = helper.tags[1]!; created.control.value = "edited"; editor.value = "draft"
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(created.control.value).toBe("edited"); expect(editor.value).toBe("draft")
    form.reset(); await flush()
    expect(helper.values).toEqual(["beta", "created"]); expect(editor.value).toBe("")
  })
  it("never clears an intervening reset-restored draft during collection change notification", async () => {
    const { helper, editor, root, form } = fixture()
    editor.defaultValue = "draft"; editor.value = "draft"
    root.addEventListener("mui:dynamic-input-change", () => form.reset(), { once: true })
    expect(helper.commit().status).toBe("added"); await flush()
    expect(helper.values).toEqual(["alpha", "beta", "draft"]); expect(editor.value).toBe("draft")
  })
  it("cancelled reset retains a still-current queued commit while accepted reset cancels old intent", async () => {
    const { helper, editor, form } = fixture()
    editor.value = "kept intent"
    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(helper.values).toEqual(["alpha", "beta", "kept intent"])
    editor.value = "old intent"; editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))
    form.reset(); await flush(); expect(helper.tags).toHaveLength(3)
  })
  it("reset/refresh/disposal invalidate pending Enter, and reset does not leave IME stuck", async () => {
    const { helper, editor, form } = fixture()
    editor.value = "pending"; editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })); form.reset(); await flush()
    expect(helper.tags).toHaveLength(2)
    editor.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); form.reset(); helper.refresh(); await flush()
    editor.value = "after reset"; expect(helper.commit().status).toBe("added")
  })
  it("honors disabled/readonly native editor and native FormData successful-control filtering", () => {
    const { helper, editor, root, form } = fixture()
    editor.value = "kept"; editor.readOnly = true
    expect(helper.commit()).toEqual({ status: "rejected", reason: "unavailable" })
    editor.readOnly = false; root.disabled = true
    expect(helper.commit().status).toBe("rejected"); expect(new FormData(form).getAll("tags[]")).toEqual([])
    root.disabled = false; expect(new FormData(form).getAll("tags[]")).toEqual(["alpha", "beta"])
  })
  it("uses native validity even when the editor is unnamed, and never sets Form custom validity", async () => {
    const { helper, editor, form } = fixture()
    editor.pattern = "[A-Z]+"
    editor.value = "lower"; expect(helper.commit()).toEqual({ status: "rejected", reason: "invalid" })
    editor.value = "UPPER"; helper.commit()
    expect(new FormData(form, form.querySelector<HTMLButtonElement>('button[name="intent"]')!).getAll("tags[]")).toEqual(["alpha", "beta", "UPPER"])
    const set = vi.spyOn(editor, "setCustomValidity"), validation = createForm(form, { items: [{ key: "tags", controls: [editor], feedback: document.querySelector("#feedback")! }] })
    helpers.push(validation); await validation.validate(); helper.refresh(); validation.refresh()
    expect(set).not.toHaveBeenCalled(); expect(editor.getAttribute("aria-describedby")).toBe("help")
  })
  it.each(["tags-first", "form-first"])("keeps description tokens and current list/draft on %s teardown", async order => {
    const { helper, editor, form, entry, add } = fixture()
    const validation = createForm(form, { items: [{ key: "tags", controls: [editor], feedback: document.querySelector("#feedback")!, validator: () => ({ message: "Custom check" }) }] }); helpers.push(validation)
    await validation.validate(); expect(editor.getAttribute("aria-describedby")).toBe("help feedback")
    editor.value = "draft"
    if (order === "tags-first") { helper.disconnect(); validation.disconnect() } else { validation.disconnect(); helper.disconnect() }
    expect(editor.getAttribute("aria-describedby")).toBe("help"); expect(editor.value).toBe("draft")
    expect(entry.hidden).toBe(true); expect(add.hidden).toBe(true)
    expect(helper.values).toEqual(["alpha", "beta"])
  })
  it("preserves external status/visibility overrides and releases duplicate-owner guards", () => {
    const { helper, entry, status, root } = fixture()
    status.textContent = "Application text"; helper.disconnect()
    expect(status.textContent).toBe("Application text"); expect(entry.hidden).toBe(true)
    helpers.push(createDynamicTags(root))
  })
  it("supports bounded max changes without truncation or draft loss", () => {
    const { helper, editor } = fixture()
    editor.value = "kept"; expect(() => helper.setMax(1)).toThrow()
    expect(helper.max).toBe(20); expect(editor.value).toBe("kept")
    helper.setMax(2); expect(helper.commit().status).toBe("rejected"); expect(helper.values).toEqual(["alpha", "beta"])
  })
  it("does not capture a nested tag editor's commits/removals", async () => {
    const { helper } = fixture()
    const root = document.createElement("fieldset")
    root.setAttribute("data-dynamic-tags", ""); root.setAttribute("data-dynamic-input", "")
    root.innerHTML = `<legend>Nested tags</legend><ul data-dynamic-rows>${row("nested", "inside")}</ul><template data-dynamic-template>${row()}</template>
      <div data-tags-entry hidden><label>Nested draft <input type="text" data-tags-editor maxlength="32"></label><button type="button" data-dynamic-add hidden>Nested add</button></div>`
    helper.tags[0]!.element.append(root); helper.refresh()
    const nested = createDynamicTags(root); helpers.push(nested)
    nested.editor.value = "inner"; root.querySelector<HTMLButtonElement>("[data-dynamic-add]")!.click(); await flush()
    expect(nested.values).toEqual(["inside", "inner"]); expect(helper.values).toEqual(["alpha", "beta"])
    nested.tags[0]!.element.querySelector<HTMLButtonElement>("button")!.click(); await flush()
    expect(nested.values).toEqual(["inner"]); expect(helper.tags).toHaveLength(2)
  })
  it("withdraws both owners when status is moved under a live region", async () => {
    const { helper, status, entry } = fixture()
    const live = document.createElement("div"); live.setAttribute("role", "status")
    status.parentElement!.append(live); live.append(status); await flush()
    expect(helper.connected).toBe(false); expect(entry.hidden).toBe(true)
  })
  it("reports invalid externally authored reset defaults without silently normalizing them", async () => {
    const { helper, form, editor } = fixture()
    const tag = helper.tags[0]!
    tag.control.value = "kept current"; tag.control.defaultValue = ""; editor.value = "draft"
    form.reset(); await flush()
    expect(helper.connected).toBe(false); expect(tag.control.value).toBe("")
    expect(form.querySelectorAll('[data-tags-value]')).toHaveLength(2)
  })
})
