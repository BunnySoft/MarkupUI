import { afterEach, describe, expect, it } from "vitest"
import { bind, createStore, type Binding } from "../src/state/index.js"
import { Label } from "../src/components/box/index.js"
import { Input } from "../src/components/input/index.js"
import { List } from "../src/components/list/index.js"

const bindings: Binding[] = []
afterEach(() => { bindings.splice(0).forEach(stop => stop()); document.body.replaceChildren() })
const rows = () => [
  { key: "a", field: "field-a", label: "label-a", help: "help-a", name: "Alpha" },
  { key: "b", field: "field-b", label: "label-b", help: "help-b", name: "Beta" },
]
const content = '<div><label data-bind-html-for="$item.field" data-bind-text="$item.name"></label><input data-bind-id="$item.field" data-model-value="$item.name" data-model-event="input" data-bind-attr-aria-describedby="$item.help"><span data-bind-attr-id="$item.help">Help</span></div>'
const each = (body = content) => `<template data-each="rows" data-each-key="key">${body}</template>`
function setup(markup = each(), values: Record<string, unknown> = { rows: rows() }) {
  document.body.innerHTML = markup
  const store = createStore(values)
  const stop = bind(document.body, store)
  bindings.push(stop)
  return { store, stop }
}

describe("paired bound IDs", () => {
  it("pairs native labels and descriptions before insertion without changing inert sources", () => {
    setup()
    const [first, second] = [...document.querySelectorAll("input")]
    expect(first!.id).toBe("field-a")
    expect(second!.id).toBe("field-b")
    expect([...document.querySelectorAll("label")].map(label => label.control)).toEqual([first, second])
    expect(first!.getAttribute("aria-describedby")).toBe("help-a")
    expect(document.getElementById("help-a")!.textContent).toBe("Help")
    expect(document.querySelector("template")!.content.querySelector("input")!.hasAttribute("id")).toBe(false)
  })

  it("retains IDs, label targets, focus and drafts through reorder and same-root rebind", () => {
    const { store, stop } = setup()
    const [first, second] = [...document.querySelectorAll("input")]
    first!.focus()
    first!.value = "Draft"
    first!.setSelectionRange(1, 3)
    store.set("rows", rows().reverse())
    expect([...document.querySelectorAll("input")]).toEqual([second, first])
    expect([...document.querySelectorAll("label")].map(label => label.control)).toEqual([second, first])
    expect(document.activeElement).toBe(first)
    expect(first!.value).toBe("Draft")
    expect([first!.selectionStart, first!.selectionEnd]).toEqual([1, 3])
    stop()
    bindings.push(bind(document.body, createStore({ rows: rows().reverse() })))
    expect(document.getElementById("field-a")).toBe(first)
  })

  it("updates ID/reference pairs and permits a complete ID swap without replacing nodes", () => {
    const { store } = setup()
    const fields = [...document.querySelectorAll("input")]
    const next = rows()
    next[0]!.field = "field-b"
    next[1]!.field = "field-a"
    store.set("rows", next)
    expect([...document.querySelectorAll("input")]).toEqual(fields)
    expect(fields.map(field => field.id)).toEqual(["field-b", "field-a"])
    expect([...document.querySelectorAll("label")].map(label => label.control)).toEqual(fields)
  })

  it("permits replacement to reuse the retiring instance's IDs", () => {
    const { store } = setup()
    const old = document.getElementById("field-a")
    const next = rows()
    next[0]!.key = "new-key"
    store.set("rows", next)
    expect(document.getElementById("field-a")).not.toBe(old)
    expect(document.querySelectorAll("#field-a")).toHaveLength(1)
    expect(document.querySelector("label")!.control).toBe(document.getElementById("field-a"))
  })

  it.each([undefined, null, "", " ", "two ids", " trailing ", 1, false, {}, []])("rejects invalid ID %j before changing DOM", value => {
    const { store } = setup()
    const before = [...document.querySelectorAll("input")]
    const next = rows()
    ;(next[1] as any).field = value
    expect(() => store.set("rows", next)).toThrow()
    expect([...document.querySelectorAll("input")]).toEqual(before)
    expect(before.map(field => field.id)).toEqual(["field-a", "field-b"])
  })

  it("rejects duplicate IDs across instances, including references, before scalar writes", () => {
    const { store } = setup()
    const next = rows()
    next[1]!.field = "field-a"
    next[0]!.name = "Must not render"
    expect(() => store.set("rows", next)).toThrow("unique")
    expect(document.querySelector("label")!.textContent).toBe("Alpha")
    expect(document.querySelector("input")!.value).toBe("Alpha")
  })

  it("rejects collisions outside the binding root but leaves unrelated duplicate IDs alone", () => {
    document.body.innerHTML = '<span id="field-a"></span><span id="unrelated"></span><span id="unrelated"></span><main></main>'
    const root = document.querySelector("main")!
    root.innerHTML = each()
    const store = createStore({ rows: rows() })
    expect(() => bind(root, store)).toThrow("unique")
    document.getElementById("field-a")!.remove()
    bindings.push(bind(root, store))
    expect(root.querySelectorAll("input")).toHaveLength(2)
  })

  it("detects collisions between independent bound roots", () => {
    document.body.innerHTML = "<main></main><aside></aside>"
    const [a, b] = [...document.body.children]
    a!.innerHTML = each()
    b!.innerHTML = each()
    bindings.push(bind(a!, createStore({ rows: rows() })))
    expect(() => bind(b!, createStore({ rows: rows() }))).toThrow("unique")
    expect(b!.querySelector("input")).toBeNull()
  })

  it("uses the actual shadow tree for uniqueness and root-local relationship targets", () => {
    document.body.innerHTML = '<span id="field-a"></span><div></div>'
    const shadow = document.querySelector("div")!.attachShadow({ mode: "open" })
    shadow.innerHTML = each()
    bindings.push(bind(shadow, createStore({ rows: rows() })))
    expect(shadow.querySelector("label")!.control).toBe(shadow.getElementById("field-a"))
  })

  it("rejects missing and cross-root reference targets before committing changes", () => {
    document.body.innerHTML = '<span id="outside-help"></span><main><span id="help">Help</span><input data-bind-attr-aria-describedby="reference"></main>'
    const root = document.querySelector("main")!
    const store = createStore({ reference: "help" })
    bindings.push(bind(root, store))
    const field = root.querySelector("input")!
    expect(() => store.set("reference", "outside-help")).toThrow("inside the binding root")
    expect(field.getAttribute("aria-describedby")).toBe("help")
    expect(() => store.set("reference", "missing")).toThrow("surviving target")
  })

  it("rejects dangling references when their target condition is removed", () => {
    const { store } = setup('<input data-bind-attr-aria-describedby="help"><template data-if="show"><span data-bind-id="$root.help">Help</span></template>', { show: true, help: "help" })
    const before = document.getElementById("help")
    expect(() => store.set("show", false)).toThrow("surviving target")
    expect(document.getElementById("help")).toBe(before)
  })

  it("does not count targets that a text binding will remove", () => {
    document.body.innerHTML = '<div data-bind-text="text"><span id="gone"></span></div><input data-bind-attr-aria-describedby="help">'
    expect(() => bind(document.body, createStore({ text: "Replace", help: "gone" }))).toThrow("surviving target")
    expect(document.getElementById("gone")).not.toBeNull()
  })

  it("does not discard collisions under an unowned external text directive", () => {
    document.body.innerHTML = '<aside data-bind-text="unbound"><span id="field-a">Outside</span></aside><main></main>'
    const root = document.querySelector("main")!
    root.innerHTML = each()
    expect(() => bind(root, createStore({ rows: rows() }))).toThrow("unique")
  })

  it("keeps unchanged text descendants in the uniqueness index", () => {
    document.body.innerHTML = '<div data-bind-text="text"><span id="same">Same</span></div><input data-bind-id="id">'
    expect(() => bind(document.body, createStore({ text: "Same", id: "same" }))).toThrow("unique")
    expect(document.querySelector("input")!.id).toBe("")
  })

  it("keeps unchanged text descendants available as relationship targets", () => {
    const { store, stop } = setup('<div data-bind-id="container" data-bind-text="text"><span id="child">Same</span></div><input data-bind-attr-aria-describedby="reference">',
      { container: "container", text: "Same", reference: "child" })
    const child = document.getElementById("child")!
    child.textContent = "External draft"
    stop.refresh()
    expect(document.getElementById("child")).toBe(child)
    expect(() => store.set("text", "Replacement")).toThrow("surviving target")
    expect(child.textContent).toBe("External draft")
  })

  it("preflights later root text writes that would destroy an existing relationship", () => {
    const { store } = setup('<div data-bind-text="text"><span id="child">Same</span></div><input data-bind-attr-aria-describedby="reference">',
      { text: "Same", reference: "child" })
    expect(() => store.set("text", "Replacement")).toThrow("surviving target")
    expect(document.getElementById("child")!.textContent).toBe("Same")
  })

  it("rewires scalar subscriptions when root ID ownership is added or removed", () => {
    const { store, stop } = setup('<span data-bind-text="text"></span><input><textarea data-model-value="draft" data-model-event="input"></textarea>',
      { text: "Same", field: "field", draft: "Original" })
    const field = document.querySelector("input")!
    const draft = document.querySelector("textarea")!
    draft.value = "Uncommitted draft"
    field.setAttribute("data-bind-id", "field")
    stop.refresh()
    expect(draft.value).toBe("Uncommitted draft")
    store.set("text", "Paired")
    expect(document.querySelector("span")!.textContent).toBe("Paired")
    field.removeAttribute("data-bind-id")
    stop.refresh()
    expect(draft.value).toBe("Uncommitted draft")
    store.set("text", "Unpaired")
    expect(document.querySelector("span")!.textContent).toBe("Unpaired")
    draft.dispatchEvent(new Event("input"))
    expect(store.get("draft")).toBe("Uncommitted draft")
  })

  it("validates root-level updates even without structural regions", () => {
    const { store } = setup('<label data-bind-attr-for="field">Name</label><input data-bind-id="field"><span id="taken"></span>', { field: "available" })
    expect(document.querySelector("label")!.control).toBe(document.querySelector("input"))
    expect(() => store.set("field", "taken")).toThrow("unique")
    expect(document.querySelector("input")!.id).toBe("available")
    store.set("field", "renamed")
    expect(document.querySelector("label")!.control).toBe(document.getElementById("renamed"))
  })

  it("supports multiple paired ARIA targets and removes nullable references", () => {
    const { store } = setup('<span id="a">A</span><span id="b">B</span><input data-bind-attr-aria-labelledby="labels" data-bind-attr-aria-describedby="help">', { labels: "a b", help: "b" })
    expect(document.querySelector("input")!.getAttribute("aria-labelledby")).toBe("a b")
    store.set("help", null)
    expect(document.querySelector("input")!.hasAttribute("aria-describedby")).toBe(false)
    expect(() => store.set("labels", "a a")).toThrow("reference list")
  })

  it.each(["for", "aria-activedescendant", "aria-details", "aria-errormessage"])("rejects multiple targets for %s", attribute => {
    document.body.innerHTML = `<input id="a"><input id="b"><label data-bind-attr-${attribute}="target"></label>`
    expect(() => bind(document.body, createStore({ target: "a b" }))).toThrow("reference list")
  })

  it.each([" field ", "\tfield", "field\n"])("rejects whitespace around an exact label target %j", target => {
    document.body.innerHTML = '<label data-bind-attr-for="target">Name</label><input id="field">'
    expect(() => bindings.push(bind(document.body, createStore({ target })))).toThrow("reference list")
  })

  it.each(["a\u00a0b", "a\u000bb"])("does not treat non-HTML whitespace as an IDREF separator %j", target => {
    document.body.innerHTML = '<span id="a">A</span><span id="b">B</span><input data-bind-attr-aria-describedby="target">'
    expect(() => bindings.push(bind(document.body, createStore({ target })))).toThrow("reference list")
  })

  it("accepts HTML whitespace in multiple-target ARIA references", () => {
    setup('<span id="a">A</span><span id="b">B</span><input data-bind-attr-aria-describedby="target">', { target: " a\t\nb " })
    expect(document.querySelector("input")!.getAttribute("aria-describedby")).toBe(" a\t\nb ")
  })

  it.each([
    '<label data-bind-html-for="field" data-bind-attr-for="field"></label><input data-bind-id="field">',
    '<span data-bind-attr-for="field"></span><input data-bind-id="field">',
    '<label data-bind-html-for="field"></label><span data-bind-id="field"></span>',
    '<label data-bind-html-for="field"></label><input type="hidden" data-bind-id="field">',
    '<input data-model-id="field" data-model-event="input">',
    '<label data-model-html-for="field" data-model-event="change"></label><input id="field">',
    '<m-label data-model-html-for="field" data-model-event="change"></m-label><input id="field">',
  ])("rejects competing or ineligible ID ownership: %s", markup => {
    document.body.innerHTML = markup
    expect(() => bind(document.body, createStore({ field: "field" }))).toThrow()
  })

  it("pairs portable fields and labels in a referenced List source", async () => {
    document.body.innerHTML = '<m-list><m-list-template data-each="rows" data-each-key="key" data-template="#row"></m-list-template></m-list><template id="row"><m-list-item><m-label data-bind-html-for="$item.field" data-bind-text="$item.name"></m-label><m-input data-bind-id="$item.field" data-model-value="$item.name" data-model-event="input" data-model-target="native" data-bind-attr-aria-describedby="$item.help"></m-input><m-span data-bind-id="$item.help">Help</m-span></m-list-item></template>'
    const store = createStore({ rows: rows() })
    bindings.push(bind(document.body, store))
    await Promise.resolve()
    const list = document.querySelector<List>(List.tag)!
    const labels = [...list.querySelectorAll<Label>(Label.tag)]
    const fields = [...list.querySelectorAll<Input>(Input.tag)]
    expect(labels.map(label => label.control)).toEqual(fields.map(field => field.native))
    expect(fields[0]!.native!.getAttribute("aria-describedby")).toBe("help-a")
    store.set("rows", rows().reverse())
    await Promise.resolve()
    expect(labels[0]!.control).toBe(fields[0]!.native)
    labels[0]!.focus()
    expect(document.activeElement).toBe(fields[0]!.native)
  })

  it("preflights ID collisions between nested and outer instances", () => {
    document.body.innerHTML = each('<div data-bind-id="$item.field"><template data-if="$root.show"><span data-bind-id="$item.field"></span></template></div>')
    expect(() => bind(document.body, createStore({ rows: rows(), show: true }))).toThrow("unique")
    expect(document.querySelector("div")).toBeNull()
  })

  it("restores owned IDs and references on refresh without overwriting model drafts", () => {
    const { stop } = setup()
    const field = document.querySelector("input")!
    field.id = "outside-write"
    field.value = "Draft"
    field.setAttribute("aria-describedby", "missing")
    document.querySelector("label")!.htmlFor = "missing"
    stop.refresh()
    expect(field.id).toBe("field-a")
    expect(field.value).toBe("Draft")
    expect(field.getAttribute("aria-describedby")).toBe("help-a")
    expect(document.querySelector("label")!.control).toBe(field)
  })

  it("does not partially update root-level pairs when one ID in a batch is invalid", () => {
    const { store } = setup('<input data-bind-id="pair.a"><input data-bind-id="pair.b">', { pair: { a: "a", b: "b" } })
    expect(() => store.set("pair", { a: "changed", b: "changed" })).toThrow("unique")
    expect([...document.querySelectorAll("input")].map(field => field.id)).toEqual(["a", "b"])
  })

  it("rejects a portable label referring to a non-control native owner", () => {
    document.body.innerHTML = '<m-label data-bind-html-for="target">Name</m-label><m-article data-bind-id="target"></m-article>'
    expect(() => bind(document.body, createStore({ target: "article" }))).toThrow("eligible")
  })

  it.each(["aria-labelledby", "aria-describedby", "aria-controls", "aria-owns", "aria-flowto"])("validates all targets of %s", attribute => {
    const { store } = setup(`<span id="a">A</span><span id="b">B</span><input data-bind-attr-${attribute}="targets">`, { targets: "a b" })
    const field = document.querySelector("input")!
    expect(field.getAttribute(attribute)).toBe("a b")
    expect(() => store.set("targets", "a missing")).toThrow("surviving target")
    expect(field.getAttribute(attribute)).toBe("a b")
    store.set("targets", null)
    expect(field.hasAttribute(attribute)).toBe(false)
  })
})
