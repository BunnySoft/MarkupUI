import { afterEach, describe, expect, it } from "vitest"
import { bind, createStore, type Binding, type BindingOptions } from "../src/state/index.js"
import { List } from "../src/components/list/index.js"
import { Input } from "../src/components/input/index.js"

const bindings: Binding[] = []
afterEach(() => { bindings.splice(0).forEach(stop => stop()); document.body.replaceChildren() })
const rows = [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }]
const field = '<input data-model-value="$item.name" data-model-event="input">'
const anchor = '<template data-each="rows" data-each-key="id" data-template="#row"></template>'
function template(markup: string) {
  const source = document.createElement("template")
  source.innerHTML = markup
  return source
}
function setup(markup: string, options?: BindingOptions) {
  document.body.innerHTML = markup
  const store = createStore({ rows: structuredClone(rows), show: false })
  const stop = bind(document.body, store, options)
  bindings.push(stop)
  return { store, stop }
}

describe("explicit template sources", () => {
  it("copies a forward ID definition for independent keyed placements without consuming it", () => {
    const { store } = setup(`${anchor}${anchor}<template id="row">${field}</template>`)
    const definition = document.getElementById("row") as HTMLTemplateElement
    const original = definition.content.firstElementChild
    const fields = [...document.querySelectorAll("input")]
    expect(fields.map(node => node.value)).toEqual(["Alpha", "Beta", "Alpha", "Beta"])
    store.set("rows", structuredClone(rows).reverse())
    expect([...document.querySelectorAll("input")]).toEqual([fields[1], fields[0], fields[3], fields[2]])
    fields[0]!.value = "Edited"
    fields[0]!.dispatchEvent(new Event("input"))
    expect(store.get("rows.1.name")).toBe("Edited")
    expect(fields[2]!.value).toBe("Edited")
    expect(definition.content.firstElementChild).toBe(original)
    expect((original as HTMLInputElement).value).toBe("")
  })

  it("uses an explicit Map without DOM lookup, and retains identity across new-store rebind", () => {
    const source = template(field)
    const options = { templates: new Map([["row", source]]) }
    const { stop } = setup(anchor.replace("#row", "row"), options)
    const input = document.querySelector("input")
    stop()
    const next = createStore({ rows: [{ id: "a", name: "New" }] })
    bindings.push(bind(document.body, next, options))
    expect(document.querySelector("input")).toBe(input)
    expect(input!.value).toBe("New")
    expect(source.isConnected).toBe(false)
  })

  it("refreshes changed definitions and disables models from replaced instances", () => {
    const source = template(field)
    const sources = new Map([["row", source]])
    const { stop, store } = setup(anchor.replace("#row", "row"), { templates: sources })
    const old = document.querySelector("input")!
    source.content.firstElementChild!.setAttribute("title", "Changed")
    stop.refresh()
    expect(document.querySelector("input")).not.toBe(old)
    expect(document.querySelector("input")!.title).toBe("Changed")
    old.value = "Stale"
    old.dispatchEvent(new Event("input"))
    expect(store.get("rows.0.name")).toBe("Alpha")
    sources.set("row", template('<span data-bind-text="$item.name"></span>'))
    stop.refresh()
    expect([...document.querySelectorAll("span")].map(node => node.textContent)).toEqual(["Alpha", "Beta"])
  })

  it("preflights invalid replacements without changing existing instances, then recovers", () => {
    const source = template(field)
    const { stop } = setup(anchor.replace("#row", "row"), { templates: new Map([["row", source]]) })
    const before = [...document.querySelectorAll("input")]
    source.innerHTML = '<span id="fixed"></span>'
    expect(() => stop.refresh()).toThrow("IDs")
    expect([...document.querySelectorAll("input")]).toEqual(before)
    source.innerHTML = field
    stop.refresh()
    expect([...document.querySelectorAll("input")]).toEqual(before)
  })

  it("does not look outside the explicit root, including shadow roots", () => {
    document.body.innerHTML = `<template id="row">${field}</template><div></div>`
    const root = document.querySelector("div")!
    root.innerHTML = anchor
    expect(() => bind(root, createStore({ rows }))).toThrow("inside the binding root")
    const shadow = root.attachShadow({ mode: "open" })
    shadow.innerHTML = anchor
    expect(() => bind(shadow, createStore({ rows }))).toThrow("inside the binding root")
    shadow.append(template(field))
    shadow.querySelectorAll("template")[1]!.id = "row"
    bindings.push(bind(shadow, createStore({ rows })))
    expect(shadow.querySelectorAll("input")).toHaveLength(2)
  })

  it("resolves IDs literally rather than parsing CSS selectors", () => {
    setup(`${anchor.replace("#row", "#row:[]")}<template id="row:[]">${field}</template>`)
    expect(document.querySelectorAll("input")).toHaveLength(2)
  })

  it.each([
    `${anchor}<template id="row">${field}</template><div id="row"></div>`,
    `${anchor}<div id="row"></div>`,
    anchor,
    anchor.replace("#row", ""),
    anchor.replace("#row", " row "),
    `${anchor.replace("></template>", "><span></span></template>")}<template id="row">${field}</template>`,
    `${anchor}<template id="row" data-if="show"><span></span></template>`,
    `${anchor}<template id="row"><span></span><span></span></template>`,
    `${anchor}<template id="row"><template><span></span></template></template>`,
    '<div data-template="#row"></div>',
    '<template data-template="#row"></template>',
    '<span data-bind-attr-data-template="show"></span>',
  ])("rejects invalid source declarations: %s", markup => {
    document.body.innerHTML = markup
    expect(() => bind(document.body, createStore({ rows: [], show: false }))).toThrow()
    expect(document.querySelector("input")).toBeNull()
  })

  it.each([null, {}, "<span></span>", () => template(field)])("rejects non-template programmatic values %j", value => {
    document.body.innerHTML = anchor.replace("#row", "row")
    expect(() => bind(document.body, createStore({ rows }), {
      templates: new Map([["row", value]]) as BindingOptions["templates"],
    })).toThrow("HTMLTemplateElement")
  })

  it("validates cycles even in inactive and empty regions", () => {
    document.body.innerHTML = '<template data-if="show" data-template="#a"></template><template id="a"><div><template data-each="rows" data-each-key="id" data-template="#b"></template></div></template><template id="b"><section><template data-if="show" data-template="#a"></template></section></template>'
    expect(() => bind(document.body, createStore({ show: false, rows: [] }))).toThrow("cycle")
    expect(document.querySelector("section")).toBeNull()
  })

  it("bounds programmatic reference depth and accepts 32 acyclic references", () => {
    const sources = new Map<string, HTMLTemplateElement>()
    for (let index = 0; index < 33; index++) sources.set(`s${index}`, template(
      index === 32 ? "<span></span>" : `<div><template data-if="$root.show" data-template="s${index + 1}"></template></div>`))
    document.body.innerHTML = '<template data-if="show" data-template="s0"></template>'
    expect(() => bind(document.body, createStore({ show: false }), { templates: sources })).toThrow("depth")
    document.body.firstElementChild!.setAttribute("data-template", "s1")
    bindings.push(bind(document.body, createStore({ show: false }), { templates: sources }))
  })

  it("updates nested definition dependencies, scoped parents, and root data", () => {
    const { store, stop } = setup('<template data-each="rows" data-each-key="id" data-template="#row"></template><template id="row"><section><template data-if="$root.show" data-template="#child"></template></section></template><template id="child"><span data-bind-text="$item.name"></span></template>')
    store.set("show", true)
    expect([...document.querySelectorAll("span")].map(node => node.textContent)).toEqual(["Alpha", "Beta"])
    const before = document.querySelector("section")
    const child = document.getElementById("child") as HTMLTemplateElement
    child.content.firstElementChild!.setAttribute("title", "New source")
    stop.refresh()
    expect(document.querySelector("section")).not.toBe(before)
    expect(document.querySelector("span")!.title).toBe("New source")
  })

  it("bounds acyclic exponential expansion before creating instances", () => {
    const sources = new Map<string, HTMLTemplateElement>()
    for (let index = 0; index < 11; index++) sources.set(`s${index}`, template(index === 10 ? "<span></span>"
      : `<div>${`<template data-if="$root.show" data-template="s${index + 1}"></template>`.repeat(2)}</div>`))
    document.body.innerHTML = '<template data-if="show" data-template="s0"></template>'
    expect(() => bind(document.body, createStore({ show: false }), { templates: sources })).toThrow("1,000 references")
    expect(document.querySelector("div")).toBeNull()
  })

  it("requires focus fallback when a changed definition replaces an active instance", () => {
    const source = template(field)
    const { stop } = setup(`<button id="fallback">Focus</button>${anchor.replace("#row", "row")}`, {
      templates: new Map([["row", source]]),
      focusFallback: () => document.getElementById("fallback") as HTMLButtonElement,
    })
    const old = document.querySelector("input")!
    old.focus()
    source.content.firstElementChild!.setAttribute("title", "Updated")
    stop.refresh()
    expect(document.activeElement!.id).toBe("fallback")
    expect(old.isConnected).toBe(false)
  })

  it("rejects missing definitions, recovers, and disposes removed placement models", () => {
    const { stop, store } = setup(`${anchor}<template id="row">${field}</template>`)
    const definition = document.getElementById("row")!
    const input = document.querySelector("input")!
    definition.remove()
    expect(() => stop.refresh()).toThrow("inside the binding root")
    expect(document.querySelector("input")).toBe(input)
    document.body.append(definition)
    stop.refresh()
    expect(document.querySelector("input")).toBe(input)
    document.querySelector("[data-each]")!.remove()
    stop.refresh()
    input.value = "Stale"
    input.dispatchEvent(new Event("input"))
    expect(store.get("rows.0.name")).toBe("Alpha")
    expect(document.querySelector("input")).toBeNull()
  })

  it("keeps programmatic and ID namespaces separate", () => {
    const { stop } = setup(`${anchor}<template id="row"><span>Local</span></template>`, {
      templates: new Map([["row", template("<span>Explicit</span>")]]),
    })
    expect(document.querySelector("span")!.textContent).toBe("Local")
    document.querySelector("[data-each]")!.setAttribute("data-template", "row")
    stop.refresh()
    expect(document.querySelector("span")!.textContent).toBe("Explicit")
  })

  it("rejects IDs and invalid bindings inside inactive referenced descendants", () => {
    document.body.innerHTML = `${anchor}<template id="row"><div><template data-if="$root.show" data-template="#inner"></template></div></template><template id="inner"><span id="fixed"></span></template>`
    expect(() => bind(document.body, createStore({ rows: [], show: false }))).toThrow("IDs")
    ;(document.getElementById("inner") as HTMLTemplateElement).innerHTML = '<span data-bind-onclick="$item.name"></span>'
    expect(() => bind(document.body, createStore({ rows: [], show: false }))).toThrow()
  })

  it("does not use IDs in generated conditional instances as definitions", () => {
    document.body.innerHTML = '<template data-if="show"><div><template id="row"><span></span></template></div></template>'
    const store = createStore({ show: true, rows })
    const stop = bind(document.body, store)
    bindings.push(stop)
    document.body.insertAdjacentHTML("beforeend", anchor)
    expect(() => stop.refresh()).toThrow("inside the binding root")
  })

  it("keeps List semantics and focus policy with a referenced m-* item source", () => {
    const { store, stop } = setup(`<m-list><m-list-template data-each="rows" data-each-key="id" data-template="#row" focus-on-remove></m-list-template></m-list><template id="row"><m-list-item><m-input data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input></m-list-item></template>`)
    const list = document.querySelector<List>(List.tag)!
    expect(list.items).toHaveLength(2)
    expect(list.items[0]!.parentElement!.localName).toBe("li")
    const field = list.querySelector<Input>(Input.tag)!
    field.focus()
    store.set("rows", [])
    expect(document.activeElement).toBe(list.itemsContainer)
    expect(list.itemTemplate!.native.content.querySelector("m-list-item")).toBeNull()
    stop.refresh()
    expect(list.items).toHaveLength(0)
  })

  it("resolves nested portable regions without consuming their definitions", () => {
    setup('<template data-each="rows" data-each-key="id" data-template="#row"></template><template id="row"><m-list><m-list-template data-each="$root.rows" data-each-key="id" data-template="#item"></m-list-template></m-list></template><template id="item"><m-list-item><span data-bind-text="$parent.name"></span></m-list-item></template>')
    expect([...document.querySelectorAll("span")].map(node => node.textContent)).toEqual(["Alpha", "Alpha", "Beta", "Beta"])
    expect((document.getElementById("row") as HTMLTemplateElement).content.querySelector("m-list-template")!.hasAttribute("data-template")).toBe(true)
  })

  it.each(["<span></span>", "<m-list-item></m-list-item><m-list-item></m-list-item>"])("rejects incompatible portable definitions: %s", content => {
    document.body.innerHTML = '<m-list><m-list-template data-each="rows" data-each-key="id" data-template="row"></m-list-template></m-list>'
    expect(() => bind(document.body, createStore({ rows: [] }), { templates: new Map([["row", template(content)]]) })).toThrow()
  })
})
