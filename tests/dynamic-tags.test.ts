import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DynamicTags, registerDynamicTags, dynamicTagsSizes } from "../src/components/dynamic-tags/index.js"
import type { DynamicTagsSize } from "../src/components/dynamic-tags/index.js"
import { createDynamicTags } from "../src/components/dynamic-tags/dynamic-tags.js"
import type { DynamicTagsOptions } from "../src/components/dynamic-tags/dynamic-tags.js"
import { ViewElement } from "../src/core/index.js"
import { createDynamicInput } from "../src/components/dynamic-input/dynamic-input.js"
import { coordinateForm as createForm } from "../src/components/form/controller.js"
import { Form } from "../src/components/form/index.js"
import { Button } from "../src/components/button/index.js"

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
    expect(css).toContain("--_m-tags-height: 28px")
    expect(css).toContain("--_m-tags-height: 22px")
    expect(css).toContain("--_m-tags-height: 34px")
    expect(css).toContain("gap: 4px 8px")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1500)
  })

  it("keeps native tag values compact without hiding labelled actions", () => {
    expect(css).toContain("field-sizing: content")
    expect(css).toContain("block-size: calc(var(--_m-tags-height) - 6px)")
    expect(css).not.toMatch(/text-indent:\s*-\d|font-size:\s*0/)
  })

  it("provides semantic light-dark palettes and forced-color controls", () => {
    expect(css).toContain("--m-tags-background: light-dark(rgba(32, 128, 240, .1), rgba(112, 192, 232, .16))")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("background: ButtonFace")
  })

  it("prints committed native values without enhancement controls", () => {
    expect(css).toContain("@media print")
    expect(css).toMatch(/\.m-dynamic-tags__entry,\s*\n\s*\.m-dynamic-tags__tag button,\s*\n\s*\.m-dynamic-tags__status/)
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
    vi.resetModules(); const other = await import("../src/components/dynamic-tags/dynamic-tags.js")
    expect(() => other.createDynamicTags(root)).toThrow()
    helper.disconnect(); helpers.push(other.createDynamicTags(root))
  })
  it("never creates a Tag custom-element registration or checkable/selected ARIA state", () => {
    const before = customElements.get("m-tag"), { root } = fixture()
    expect(customElements.get("m-tag")).toBe(before)
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
    const errors = vi.fn(); root.addEventListener("m:dynamic-tags-error", errors)
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
    const changed = vi.fn(); root.addEventListener("m:change", changed)
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
    const changed = vi.fn(); root.addEventListener("m:change", changed)
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
    const { helper, editor, root } = fixture(), changed = vi.fn(); root.addEventListener("m:change", changed)
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
    root.addEventListener("m:dynamic-input-change", () => form.reset(), { once: true })
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

describe("canonical DynamicTags ViewElement", () => {
  const add = (tags: DynamicTags, value: string) => { tags.draft = value; return tags.commit().status === "added" }
  it("registers only its own canonical tag through shared ViewElement with explicit attributes", () => {
    expect(DynamicTags.tag).toBe("m-dynamic-tags")
    expect(DynamicTags.prototype instanceof ViewElement).toBe(true)
    expect(customElements.get("m-dynamic-tags")).toBe(DynamicTags)
    expect(DynamicTags.observedAttributes).toEqual(["max", "disabled", "size", "duplicates", "name", "maxlength", "editor-label"])

    const define = vi.fn()
    registerDynamicTags({ get: () => undefined, define })
    expect(define.mock.calls.map(call => call[0])).toEqual(["m-dynamic-tags"])
    expect(() => registerDynamicTags({ get: () => HTMLElement as any, define })).toThrow("different implementation")
  })

  it("exposes default properties and reflects attribute changes", () => {
    const tags = new DynamicTags()
    expect(tags.max).toBe(20)
    expect(tags.disabled).toBe(false)
    expect(tags.size).toBe("medium")

    tags.max = 10
    expect(tags.max).toBe(10)
    expect(tags.getAttribute("max")).toBe("10")

    tags.disabled = true
    expect(tags.disabled).toBe(true)
    expect(tags.hasAttribute("disabled")).toBe(true)

    tags.size = "small"
    expect(tags.size).toBe("small")
    expect(tags.getAttribute("size")).toBe("small")

    tags.size = "large"
    expect(tags.size).toBe("large")
    expect(tags.getAttribute("size")).toBe("large")

    expect(() => { tags.max = 0 }).toThrow(RangeError)
    expect(() => { tags.max = -1 }).toThrow(RangeError)
    expect(() => { (tags as any).size = "huge" }).toThrow(RangeError)
  })

  it("upgrades properties assigned before connection", () => {
    const tags = document.createElement("m-dynamic-tags") as DynamicTags
    tags.max = 5
    tags.disabled = true
    tags.size = "small"
    document.body.append(tags)

    expect(tags.max).toBe(5)
    expect(tags.disabled).toBe(true)
    expect(tags.size).toBe("small")
    expect(tags.getAttribute("max")).toBe("5")
    expect(tags.hasAttribute("disabled")).toBe(true)
    expect(tags.getAttribute("size")).toBe("small")
    expect(tags.classList.contains("m-dynamic-tags")).toBe(true)
  })

  it("generates DOM structure, supports adding and removing tags, and emits m:change", () => {
    const tags = new DynamicTags()
    document.body.append(tags)

    expect(tags.querySelector(".m-dynamic-tags__list")).not.toBeNull()
    expect(tags.querySelector(".m-dynamic-tags__entry")).not.toBeNull()
    expect(tags.values).toEqual([])

    const changeSpy = vi.fn()
    tags.addEventListener("m:change", changeSpy)

    expect(add(tags, "alpha")).toBe(true)
    expect(tags.values).toEqual(["alpha"])
    expect(changeSpy).toHaveBeenCalledOnce()
    expect(changeSpy.mock.calls[0][0].detail).toMatchObject({ value: ["alpha"], type: "add" })

    expect(add(tags, "beta")).toBe(true)
    expect(tags.values).toEqual(["alpha", "beta"])
    expect(changeSpy).toHaveBeenCalledTimes(2)
    expect(changeSpy.mock.calls[1][0].detail).toMatchObject({ value: ["alpha", "beta"] })

    // Ignore blank tag
    expect(add(tags, "  ")).toBe(false)
    expect(changeSpy).toHaveBeenCalledTimes(2)

    expect(tags.removeTag(tags.tags[0]!.key)).toBe(true)
    expect(tags.values).toEqual(["beta"])
    expect(changeSpy).toHaveBeenCalledTimes(3)
    expect(changeSpy.mock.calls[2][0].detail).toMatchObject({ value: ["beta"], type: "remove" })

    expect(tags.removeTag(tags.tags[0]!.key)).toBe(true)
    expect(tags.values).toEqual([])
    expect(changeSpy).toHaveBeenCalledTimes(4)
    expect(changeSpy.mock.calls[3][0].detail).toMatchObject({ value: [] })

    // Remove non-existent
    expect(() => tags.removeTag("nonexistent")).toThrow(RangeError)
  })

  it("handles remove button clicks inside tags", async () => {
    const tags = new DynamicTags()
    document.body.append(tags)
    add(tags, "tag-1")
    add(tags, "tag-2")

    const changeSpy = vi.fn()
    tags.addEventListener("m:change", changeSpy)

    const removeBtn = tags.querySelector<HTMLButtonElement>(".m-dynamic-tags__tag button")!
    expect(removeBtn).not.toBeNull()
    removeBtn.click()
    await flush()

    expect(tags.values).toEqual(["tag-2"])
    expect(changeSpy).toHaveBeenCalledOnce()
    expect(changeSpy.mock.calls[0][0].detail).toMatchObject({ value: ["tag-2"] })
  })

  it("enforces max limit", () => {
    const tags = new DynamicTags()
    tags.max = 2
    document.body.append(tags)

    expect(add(tags, "first")).toBe(true)
    expect(add(tags, "second")).toBe(true)
    expect(add(tags, "third")).toBe(false)
    expect(tags.values).toEqual(["first", "second"])
    expect(tags.editor!.matches(":disabled")).toBe(false)

    const addBtn = tags.querySelector<HTMLButtonElement>("[data-dynamic-add]")!
    expect(addBtn.disabled).toBe(true)

    tags.removeTag(tags.tags[0]!.key)
    expect(addBtn.disabled).toBe(false)
    expect(add(tags, "third")).toBe(true)
    expect(tags.values).toEqual(["second", "third"])
  })

  it("enforces disabled state on inputs and buttons", () => {
    const tags = new DynamicTags()
    document.body.append(tags)
    add(tags, "item")

    tags.disabled = true
    expect(add(tags, "blocked")).toBe(false)
    expect(tags.removeTag(tags.tags[0]!.key)).toBe(false)
    expect(tags.values).toEqual(["item"])

    const editor = tags.querySelector<HTMLInputElement>("[data-tags-editor]")!
    const addBtn = tags.querySelector<HTMLButtonElement>("[data-dynamic-add]")!
    const removeBtn = tags.querySelector<HTMLButtonElement>("[data-dynamic-action='remove']")!
    expect(editor.matches(":disabled")).toBe(true)
    expect(addBtn.matches(":disabled")).toBe(true)
    expect(removeBtn.matches(":disabled")).toBe(true)

    tags.disabled = false
    expect(editor.disabled).toBe(false)
    expect(addBtn.disabled).toBe(false)
    expect(removeBtn.disabled).toBe(false)
  })

  it("handles clear() method", () => {
    const tags = new DynamicTags()
    document.body.append(tags)
    add(tags, "one")
    add(tags, "two")

    const changeSpy = vi.fn()
    tags.addEventListener("m:change", changeSpy)

    tags.clear()
    expect(tags.values).toEqual([])
    expect(changeSpy).toHaveBeenCalledTimes(2)
    expect(changeSpy.mock.calls[1][0].detail).toMatchObject({ value: [] })
  })

  it("delegates focus and blur to the editor input", () => {
    const tags = new DynamicTags()
    document.body.append(tags)
    const editor = tags.querySelector<HTMLInputElement>("[data-tags-editor]")!
    const focusSpy = vi.spyOn(editor, "focus")
    const blurSpy = vi.spyOn(editor, "blur")

    tags.focus()
    expect(focusSpy).toHaveBeenCalledOnce()

    tags.blur()
    expect(blurSpy).toHaveBeenCalledOnce()
  })

  it("supports keyboard Enter and button click to add tags from editor input", async () => {
    const tags = new DynamicTags()
    document.body.append(tags)
    const editor = tags.querySelector<HTMLInputElement>("[data-tags-editor]")!
    const addBtn = tags.querySelector<HTMLButtonElement>("[data-dynamic-add]")!

    editor.value = "from-enter"
    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))
    await flush()
    expect(tags.values).toEqual(["from-enter"])
    expect(editor.value).toBe("")

    editor.value = "from-click"
    addBtn.click()
    await flush()
    expect(tags.values).toEqual(["from-enter", "from-click"])
    expect(editor.value).toBe("")
  })

  it("adopts authored tag rows in markup", async () => {
    document.body.innerHTML = `
      <m-dynamic-tags id="authored-tags">
        <ul class="m-dynamic-tags__list" data-dynamic-rows>
          <li class="m-dynamic-tags__tag" data-dynamic-row data-dynamic-key="seed-1">
            <input class="m-dynamic-tags__value" data-tags-value type="text" readonly name="tags[]" value="seed1">
            <button type="button" data-dynamic-action="remove" hidden>Remove</button>
          </li>
          <li class="m-dynamic-tags__tag" data-dynamic-row data-dynamic-key="seed-2">
            <input class="m-dynamic-tags__value" data-tags-value type="text" readonly name="tags[]" value="seed2">
            <button type="button" data-dynamic-action="remove" hidden>Remove</button>
          </li>
        </ul>
      </m-dynamic-tags>
    `
    const tags = document.querySelector<DynamicTags>("#authored-tags")!
    expect(tags.values).toEqual(["seed1", "seed2"])

    const changeSpy = vi.fn()
    tags.addEventListener("m:change", changeSpy)
    const firstRemoveBtn = tags.querySelector<HTMLButtonElement>(".m-dynamic-tags__tag button")!
    firstRemoveBtn.click()
    await flush()
    expect(tags.values).toEqual(["seed2"])
    expect(changeSpy).toHaveBeenCalledOnce()
  })

  it("replays own pre-upgrade properties before creating controls or invoking hooks", () => {
    const tags = new DynamicTags(), create = vi.fn(value => value.toUpperCase())
    for (const [key, value] of Object.entries({ max: 3, duplicates: "reject", size: "small", draft: "seed", createTag: create })) {
      Object.defineProperty(tags, key, { configurable: true, writable: true, value })
    }
    document.body.append(tags)
    expect(tags.draft).toBe("seed")
    expect(tags.commit().status).toBe("added")
    expect(tags.values).toEqual(["SEED"])
    expect(create).toHaveBeenCalledOnce()
    expect(tags.getAttribute("max")).toBe("3")
    expect(tags.dataset.size).toBe("small")
    expect(Object.hasOwn(tags, "draft")).toBe(false)
  })

  it("retains native values, successful controls and current defaults through reset", async () => {
    const form = document.createElement("form"), tags = new DynamicTags()
    form.append(tags); document.body.append(form)
    add(tags, "  MiXeD,tag  ")
    expect(new FormData(form).getAll("tags[]")).toEqual(["  MiXeD,tag  "])
    const first = tags.tags[0]!, input = first.control
    expect(input.defaultValue).toBe("  MiXeD,tag  ")
    input.value = "changed"; tags.draft = "unsubmitted"
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush()
    expect(input.value).toBe("changed"); expect(tags.draft).toBe("unsubmitted")
    form.reset(); await flush()
    expect(tags.tags[0]).toBe(first)
    expect(tags.values).toEqual(["  MiXeD,tag  "]); expect(tags.draft).toBe("")
    tags.disabled = true
    expect(new FormData(form).getAll("tags[]")).toEqual([])
    tags.disabled = false
    expect(new FormData(form).getAll("tags[]")).toEqual(["  MiXeD,tag  "])
  })

  it("updates policy and max without replacing nodes or silently dropping duplicates", () => {
    const tags = new DynamicTags(); document.body.append(tags)
    add(tags, "same"); add(tags, "same")
    const first = tags.tags[0]!
    expect(() => { tags.duplicates = "reject" }).toThrow(RangeError)
    expect(tags.duplicates).toBe("allow")
    expect(() => { tags.max = 1 }).toThrow(RangeError)
    expect(tags.max).toBe(20)
    for (const max of [1.5, 101, NaN, Infinity]) expect(() => { tags.max = max }).toThrow(RangeError)
    tags.removeTag(tags.tags[1]!.key)
    tags.duplicates = "reject"
    tags.draft = "same"
    expect(tags.commit()).toEqual({ status: "rejected", reason: "duplicate" })
    tags.setAttribute("duplicates", "allow")
    expect(tags.commit().status).toBe("added")
    tags.setAttribute("max", "2")
    tags.draft = "kept"
    expect(tags.commit()).toEqual({ status: "rejected", reason: "max" })
    expect(tags.editor!.disabled).toBe(false)
    expect(tags.tags[0]).toBe(first)
  })

  it("runs cleanup for rollback, removal and reconnect through the same resource owner", () => {
    const tags = new DynamicTags(), cleaned = vi.fn(), connected = vi.fn()
    tags.connectTag = (row, context) => {
      connected(row)
      context.onCleanup(cleaned)
      if (row.querySelector<HTMLInputElement>("input")!.value === "fail") throw new Error("Connection failed")
    }
    document.body.append(tags)
    add(tags, "kept")
    tags.draft = "fail"
    expect(() => tags.commit()).toThrow("Connection failed")
    expect(tags.values).toEqual(["kept"]); expect(tags.draft).toBe("fail")
    expect(cleaned).toHaveBeenCalledOnce()
    const control = tags.tags[0]!.control, fieldset = tags.querySelector("fieldset"), editor = tags.editor
    tags.remove()
    expect(tags.connected).toBe(false); expect(cleaned).toHaveBeenCalledTimes(2)
    document.body.append(tags)
    expect(tags.connected).toBe(true)
    expect(tags.tags[0]!.control).toBe(control); expect(tags.editor).toBe(editor)
    expect(tags.querySelector("fieldset")).toBe(fieldset)
    expect(tags.draft).toBe("fail")
    expect(connected).toHaveBeenCalledTimes(3)
    tags.removeTag(tags.tags[0]!.key)
    expect(cleaned).toHaveBeenCalledTimes(3)
  })

  it("does not overwrite authored disabled flags, ancestors or nested ownership", async () => {
    const tags = new DynamicTags(), nested = new DynamicTags()
    tags.innerHTML = `<fieldset disabled><ul data-dynamic-rows>${row("seed", "alpha")}</ul></fieldset>`
    const ancestor = tags.firstElementChild!, control = tags.querySelector<HTMLInputElement>("input")!
    document.body.append(tags)
    tags.tags[0]!.element.append(nested)
    await flush()
    expect(tags.tags[0]!.control).toBe(control)
    expect(control.closest("fieldset")).toBe(ancestor)
    tags.disabled = true; tags.disabled = false
    expect(control.matches(":disabled")).toBe(true)
    expect(ancestor.hasAttribute("disabled")).toBe(true)
    expect(tags.values).toEqual(["alpha"]); expect(nested.values).toEqual([])
    expect(nested.editor!.matches(":disabled")).toBe(true)
    tags.remove()
  })

  it("retains IME, stale intent, Escape and disconnect cancellation on the element", async () => {
    const tags = new DynamicTags(); document.body.append(tags)
    const editor = tags.editor!, enter = () => editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))
    tags.draft = "composing"
    editor.dispatchEvent(new CompositionEvent("compositionstart")); enter()
    editor.dispatchEvent(new CompositionEvent("compositionend")); enter()
    await flush(); expect(tags.values).toEqual([])
    enter(); tags.draft = "newer"; await flush()
    expect(tags.values).toEqual([]); expect(tags.draft).toBe("newer")
    enter(); editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", cancelable: true }))
    await flush(); expect(tags.values).toEqual([])
    enter(); tags.remove(); document.body.append(tags)
    await flush(); expect(tags.values).toEqual([])
    const changed = vi.fn(); tags.addEventListener("m:change", changed)
    enter(); await flush(); expect(changed).toHaveBeenCalledOnce()
    expect(tags.values).toEqual(["newer"])
  })

  it("preserves native validity and external focus, and reports nonstring/async hooks", async () => {
    const tags = new DynamicTags(), outside = document.createElement("button")
    document.body.append(tags, outside)
    tags.draft = "draft"; tags.editor!.setCustomValidity("Application rule")
    expect(tags.commit()).toEqual({ status: "rejected", reason: "invalid" })
    expect(tags.draft).toBe("draft")
    tags.editor!.setCustomValidity("")
    outside.focus()
    expect(tags.commit().status).toBe("added")
    expect(document.activeElement).toBe(outside)
    tags.createTag = (() => Promise.reject(new Error("Late failure"))) as never
    const failed = vi.fn(); tags.addEventListener("m:dynamic-tags-error", failed)
    tags.draft = "kept"; expect(() => tags.commit()).toThrow("strings")
    await flush()
    expect(tags.values).toEqual(["draft"]); expect(tags.draft).toBe("kept")
    expect(failed.mock.calls.some(([event]) => event.detail.error.message === "Late failure")).toBe(true)
    tags.createTag = value => { tags.commit(); return value }
    expect(() => tags.commit()).toThrow("reenter")
  })

  it("emits one documented bubbling change and nonbubbling rejection from the owner", () => {
    const tags = new DynamicTags(); document.body.append(tags)
    const changed = vi.fn(), rejected = vi.fn()
    document.body.addEventListener("m:change", changed, { once: true })
    tags.addEventListener("m:dynamic-tags-reject", rejected)
    add(tags, "seed")
    const event = changed.mock.calls[0]![0] as CustomEvent
    expect(event.target).toBe(tags)
    expect(event.bubbles).toBe(true); expect(event.cancelable).toBe(false); expect(event.composed).toBe(false)
    expect(event.detail).toEqual({ type: "add", tag: tags.tags[0], value: ["seed"] })
    add(tags, "")
    expect(rejected.mock.calls[0]![0].bubbles).toBe(false)
  })

  it("builds a working form entirely from m-* authoring with native owners isolated inside", async () => {
    const authored = `<m-form id="portable-form"><m-dynamic-tags id="portable-tags" name="topics" maxlength="8" editor-label="New topic"></m-dynamic-tags>
      <m-button id="portable-submit" attr-type="submit">Submit</m-button><m-button id="portable-reset" attr-type="reset">Reset</m-button></m-form>`
    expect(authored).not.toMatch(/<(?:form|input|button|fieldset|template|ul|li)\b/)
    document.body.innerHTML = authored
    await flush()
    const form = document.querySelector<Form>("#portable-form")!, tags = document.querySelector<DynamicTags>("#portable-tags")!
    const submit = document.querySelector<Button>("#portable-submit")!, reset = document.querySelector<Button>("#portable-reset")!
    expect(form).toBeInstanceOf(Form); expect(submit).toBeInstanceOf(Button)
    expect(tags.editor!.form).toBe(form.native)
    expect(tags.editor!.getAttribute("aria-label")).toBe("New topic")
    expect(tags.editor!.maxLength).toBe(8)
    expect(tags.editor!.hasAttribute("name")).toBe(false)
    tags.draft = "alpha"; tags.commit()
    const submitted = vi.fn((event: Event) => event.preventDefault())
    form.addEventListener("submit", submitted)
    submit.click()
    expect(submitted).toHaveBeenCalledOnce()
    expect(new FormData(form.native).getAll("topics")).toEqual(["alpha"])
    tags.draft = "toolong!!"
    expect(tags.commit()).toEqual({ status: "rejected", reason: "invalid" })
    reset.click(); await flush()
    expect(tags.draft).toBe("")
    expect(tags.values).toEqual(["alpha"])
    tags.name = "labels"
    tags.maxLength = 12
    tags.editorLabel = "Add label"
    tags.draft = "longer label"; tags.commit()
    expect(new FormData(form.native).getAll("labels")).toEqual(["alpha", "longer label"])
    expect(new FormData(form.native).has("topics")).toBe(false)
    expect(tags.editor!.getAttribute("aria-label")).toBe("Add label")
    expect(() => { tags.maxLength = 3 }).toThrow(RangeError)
    expect(tags.maxLength).toBe(12)
    expect(() => { tags.name = "" }).toThrow()
    expect(() => { tags.editorLabel = " " }).toThrow()
  })

  it("keeps every demo's authored preview content in the m-* vocabulary", () => {
    const template = document.createElement("template")
    template.innerHTML = readFileSync(resolve("demo/components/dynamic-tags.html"), "utf8")
    const content = [...template.content.querySelectorAll("[data-demo-preview] *")]
    expect(content.length).toBeGreaterThan(0)
    expect(content.filter(node => !node.localName.startsWith("m-")).map(node => node.outerHTML)).toEqual([])
  })

  it("generates native owners without HTML parsing sinks", () => {
    const setter = vi.spyOn(Element.prototype, "innerHTML", "set").mockImplementation(() => { throw new Error("HTML sink blocked") })
    const tags = new DynamicTags()
    document.body.append(tags)
    expect(add(tags, "<script>text</script>")).toBe(true)
    expect(tags.values).toEqual(["<script>text</script>"])
    expect(tags.querySelector("script")).toBeNull()
    expect(setter).not.toHaveBeenCalled()
    setter.mockRestore()
  })

  it("refuses reentrant bounds or policy changes before reflecting attributes", () => {
    const tags = new DynamicTags(); document.body.append(tags)
    tags.draft = "draft"
    for (const change of [() => { tags.max = 4 }, () => { tags.maxLength = 32 }, () => { tags.duplicates = "reject" }]) {
      tags.createTag = value => { change(); return value }
      expect(() => tags.commit()).toThrow("reenter")
      expect(tags.max).toBe(20); expect(tags.maxLength).toBe(128); expect(tags.duplicates).toBe("allow")
      expect(tags.values).toEqual([])
    }
  })

  it("recovers editor focus when a native click leaves body active, but not external focus", async () => {
    const tags = new DynamicTags(), outside = document.createElement("button")
    document.body.append(tags, outside)
    tags.draft = "first"
    const button = tags.querySelector<HTMLButtonElement>("[data-dynamic-add]")!
    expect(document.activeElement).toBe(document.body)
    button.click(); await flush()
    expect(document.activeElement).toBe(tags.editor)
    expect(tags.tags[0]!.element.querySelector("button")!.getAttribute("aria-label")).toBe("Remove first")
    expect(tags.tags[0]!.control.size).toBe(5)
    outside.focus(); tags.draft = "second"; button.click(); await flush()
    expect(document.activeElement).toBe(outside)
    expect(tags.values).toEqual(["first", "second"])
  })
})
