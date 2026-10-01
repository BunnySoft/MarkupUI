import { afterEach, describe, expect, it } from "vitest"
import { List, ListItem, ListTemplate, registerList } from "../src/components/list/index.js"
import { Input } from "../src/components/input/index.js"
import { Card } from "../src/components/card/index.js"
import { Collapse } from "../src/components/collapse/index.js"
import { bind, createStore, type Binding } from "../src/state/index.js"
import { App } from "../src/components/foundation.js"
import { readFileSync } from "node:fs"

let stop: Binding | undefined
afterEach(() => { stop?.(); stop = undefined; document.body.replaceChildren() })

function fixture(content = '<m-list-item><m-input data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input></m-list-item>') {
  const list = document.createElement("m-list") as List
  list.innerHTML = `<m-list-template data-each="rows" data-each-key="id" label="Tasks">${content}</m-list-template>`
  document.body.append(list)
  const state = createStore({ rows: [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }] })
  return { list, region: list.itemTemplate!, state }
}

describe("portable List template", () => {
  it("registers the selected region atomically without a store", () => {
    expect(customElements.get("m-list-template")).toBe(ListTemplate)
    const names: string[] = []
    expect(() => registerList({
      get: name => name === "m-list-template" ? class extends HTMLElement {} : undefined,
      define: name => { names.push(name) },
    })).toThrow("different implementation")
    expect(names).toEqual([])
  })

  it("captures authored content inertly without selecting or creating state", async () => {
    const { list, region } = fixture()
    await Promise.resolve()
    expect(list.items).toHaveLength(0)
    expect(list.querySelector("m-input")).toBeNull()
    expect(region.native.content.querySelector("m-input")).not.toBeNull()
    expect(region.itemsContainer.children).toHaveLength(1)
    expect(list.hasAttribute("role")).toBe(false)
  })

  it("creates native ul/li semantics with a single item owner and no duplicate source fields", () => {
    const { list, region, state } = fixture()
    stop = bind(list, state)
    expect(list.itemsContainer).toBe(region.itemsContainer)
    expect(region.itemsContainer.localName).toBe("ul")
    expect(region.itemsContainer.getAttribute("role")).toBe("list")
    expect(region.itemsContainer.getAttribute("aria-label")).toBe("Tasks")
    expect(list.items).toHaveLength(2)
    for (const item of list.items) {
      expect(item).toBeInstanceOf(ListItem)
      expect(item.parentElement?.localName).toBe("li")
      expect(item.hasAttribute("role")).toBe(false)
    }
    expect(list.querySelectorAll("input")).toHaveLength(2)
    expect(list.querySelector<Input>("m-input")!.value).toBe("Alpha")
  })

  it("keeps headers and footers outside the semantic list and only submits live fields", () => {
    const { list, state } = fixture('<m-list-item><m-input name="task" data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input></m-list-item>')
    const header = document.createElement("m-box"), footer = document.createElement("m-box")
    header.dataset.part = "header"
    footer.dataset.part = "footer"
    list.prepend(header)
    list.append(footer)
    const form = document.createElement("form")
    form.append(list)
    document.body.append(form)
    stop = bind(list, state)
    expect(list.header).toBe(header)
    expect(list.footer).toBe(footer)
    expect(list.itemsContainer!.contains(header)).toBe(false)
    expect(list.itemsContainer!.contains(footer)).toBe(false)
    expect(new FormData(form).getAll("task")).toEqual(["Alpha", "Beta"])
  })

  it("keeps List and state independently selected and includes the region in the catalog", () => {
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    expect(manifest.componentPayloads.list.esm.dependencies).toEqual(["markup-ui-core.js"])
    expect(manifest.componentPayloads.list.classic.dependencies).toEqual(["markup-ui-core.global.js"])
    expect(manifest.entryPayloads.all.tags).toContain("m-list-template")
    expect(manifest.entryPayloads.all.tags).toHaveLength(205)
    const listMap = JSON.parse(readFileSync("dist/markup-ui-list.js.map", "utf8"))
    const stateMap = JSON.parse(readFileSync("dist/markup-ui-state.js.map", "utf8"))
    expect(listMap.sources.some((source: string) => source.includes("/state/"))).toBe(false)
    expect(stateMap.sources.some((source: string) => source.includes("/components/") || source.includes("/core/"))).toBe(false)
  })

  it("keeps nodes and native drafts during reorder and writes to the current stable key", () => {
    const { list, state } = fixture()
    stop = bind(list, state)
    const item = list.items[0]!
    const input = item.querySelector<Input>("m-input")!
    const field = input.native!
    field.focus()
    field.value = "Draft"
    field.setSelectionRange(1, 3)
    state.set("rows", [...state.get<any[]>("rows")].reverse())
    expect(list.items[1]).toBe(item)
    expect(document.activeElement).toBe(field)
    expect(field.value).toBe("Draft")
    expect([field.selectionStart, field.selectionEnd]).toEqual([1, 3])
    field.dispatchEvent(new Event("input", { bubbles: true }))
    expect(state.get("rows.1.name")).toBe("Draft")
    expect(state.get("rows.0.name")).toBe("Beta")
  })

  it("reuses captured Card chrome and surviving close owners through keyed reorder and rebind", () => {
    const { list, state } = fixture('<m-list-item><m-card title="Source title" closable data-bind-title="$item.name">Body</m-card></m-list-item>')
    stop = bind(list, state)
    const cards = [...list.querySelectorAll<Card>("m-card")]
    const close = cards.map(card => card.querySelector<HTMLButtonElement>("button[data-part=close]")!)
    for (const card of cards) {
      expect(card.querySelectorAll("[data-part=header]")).toHaveLength(1)
      expect(card.querySelectorAll("[data-part=title]")).toHaveLength(1)
      expect(card.querySelectorAll("[data-part=content]")).toHaveLength(1)
      expect(card.querySelectorAll("button[data-part=close]")).toHaveLength(1)
    }
    expect(cards.map(card => card.querySelector("[data-part=title]")!.textContent)).toEqual(["Alpha", "Beta"])
    state.set("rows", [...state.get<{ id: string; name: string }[]>("rows")].reverse())
    expect([...list.querySelectorAll("m-card")]).toEqual([...cards].reverse())
    stop()
    stop = bind(list, state)
    expect(cards.map(card => card.querySelector("button[data-part=close]"))).toEqual(close)
    state.set("rows.0.name", "Changed")
    expect(cards[1]!.querySelector("[data-part=title]")!.textContent).toBe("Changed")
    for (const card of cards) expect(card.querySelectorAll("button[data-part=close]")).toHaveLength(1)
  })

  it("adopts captured Collapse owners and retains native drafts through keyed reorder and rebind", () => {
    const { list, state, region } = fixture('<m-list-item><m-collapse><m-collapse-item key="one"><m-collapse-header>Section</m-collapse-header><m-collapse-content><input value="Source"></m-collapse-content></m-collapse-item></m-collapse></m-list-item>')
    list.querySelector<Collapse>("m-collapse")!.expand("one")
    expect(region.native.content.querySelector("details[open]")).not.toBeNull()
    stop = bind(list, state)
    const groups = [...list.querySelectorAll<Collapse>("m-collapse")]
    const owners = groups.map(group => group.querySelector("details")!)
    const fields = groups.map(group => group.querySelector("input")!)
    for (const group of groups) {
      expect(group.state).toBe("ready")
      expect(group.expandedKeys).toEqual(["one"])
      expect(group.querySelectorAll("summary")).toHaveLength(1)
    }
    fields[0]!.value = "Retained draft"
    state.set("rows", [...state.get<{ id: string; name: string }[]>("rows")].reverse())
    expect([...list.querySelectorAll("m-collapse")]).toEqual([...groups].reverse())
    stop()
    stop = bind(list, state)
    expect(groups.map(group => group.querySelector("details"))).toEqual(owners)
    expect(groups.map(group => group.querySelector("input"))).toEqual(fields)
    expect(fields[0]!.value).toBe("Retained draft")
    groups[0]!.collapse("one")
    expect(groups[1]!.expandedKeys).toEqual(["one"])
  })

  it("requires an explicit focus policy and can focus the surviving list", () => {
    const { list, state, region } = fixture()
    stop = bind(list, state)
    list.querySelector<Input>("m-input")!.focus()
    expect(() => state.set("rows", [])).toThrow("focusFallback")
    expect(list.items).toHaveLength(2)
    region.focusOnRemove = true
    stop.refresh()
    expect(list.items).toHaveLength(0)
    expect(document.activeElement).toBe(region.itemsContainer)
    expect(region.itemsContainer.tabIndex).toBe(-1)
  })

  it("honors an application focus callback before the region policy", () => {
    const { list, state, region } = fixture()
    const fallback = document.createElement("button")
    document.body.append(fallback)
    region.focusOnRemove = true
    stop = bind(list, state, { focusFallback: () => fallback })
    list.querySelector<Input>("m-input")!.focus()
    state.set("rows", [])
    expect(document.activeElement).toBe(fallback)
  })

  it("ignores blur-triggered change while the focused row is being retired", () => {
    const { list, state, region } = fixture()
    region.native.content.querySelector("m-input")!.setAttribute("data-model-event", "input change")
    region.focusOnRemove = true
    stop = bind(list, state)
    const field = list.querySelector<Input>("m-input")!.native!
    field.addEventListener("blur", () => {
      field.value = "Late blur"
      field.dispatchEvent(new Event("change", { bubbles: true }))
    })
    field.focus()
    state.set("rows", [])
    expect(state.get("rows")).toEqual([])
    expect(document.activeElement).toBe(region.itemsContainer)
  })

  it("does not replace an invalid explicit callback with the region policy", () => {
    const { list, state, region } = fixture()
    region.focusOnRemove = true
    stop = bind(list, state, { focusFallback: () => undefined as unknown as HTMLElement })
    list.querySelector<Input>("m-input")!.focus()
    expect(() => state.set("rows", [])).toThrow("focusFallback")
    expect(list.items).toHaveLength(2)
  })

  it("captures incrementally authored children until the source is prepared", async () => {
    const list = document.createElement("m-list") as List
    const region = document.createElement("m-list-template") as ListTemplate
    region.setAttribute("data-each", "rows")
    region.setAttribute("data-each-key", "id")
    list.append(region)
    document.body.append(list)
    await Promise.resolve()
    const item = document.createElement("m-list-item")
    item.setAttribute("data-bind-text", "$item.name")
    region.append(item)
    await Promise.resolve()
    stop = bind(list, createStore({ rows: [{ id: "a", name: "Late source" }] }))
    expect(list.items.map(item => item.textContent)).toEqual(["Late source"])
    region.append(document.createElement("m-list-item"))
    expect(() => stop!.refresh()).toThrow("ownership changed")
  })

  it("chooses a surviving outer list when an inner focus target is also removed", () => {
    const { list, state, region } = fixture(`<m-list-item><m-list>
      <m-list-template data-each="$item.children" data-each-key="id" focus-on-remove>
        <m-list-item><m-input data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input></m-list-item>
      </m-list-template>
    </m-list></m-list-item>`)
    region.focusOnRemove = true
    state.set("rows", [{ id: "a", name: "Parent", children: [{ id: "c", name: "Child" }] }])
    stop = bind(list, state)
    list.querySelector<Input>("m-input")!.focus()
    state.set("rows", [])
    expect(document.activeElement).toBe(region.itemsContainer)
    expect(list.items).toHaveLength(0)
  })

  it("preserves instances across stop/rebind with another store and reconnect", () => {
    const { list, state, region } = fixture()
    stop = bind(list, state)
    const items = [...list.items]
    const native = region.native
    stop()
    list.remove()
    document.body.append(list)
    stop = bind(list, createStore({ rows: [{ id: "b", name: "B2" }, { id: "a", name: "A2" }] }))
    expect(list.items).toEqual(items.reverse())
    expect(region.native).toBe(native)
    expect(list.querySelector<Input>("m-input")!.value).toBe("B2")
  })

  it("rejects DOM mutation APIs for store-owned items", () => {
    const { list, state } = fixture()
    stop = bind(list, state)
    expect(() => list.appendItem("Extra")).toThrow("store collection")
    expect(() => list.removeItem(list.items[0]!)).toThrow("store collection")
    expect(list.items).toHaveLength(2)
  })

  it.each([
    "",
    "<m-list-item>A</m-list-item><m-list-item>B</m-list-item>",
    "text<m-list-item>A</m-list-item>",
    "<m-box>A</m-box>",
    '<m-list-item id="fixed">A</m-list-item>',
    '<m-list-item data-model-id="$key" data-model-event="change">A</m-list-item>',
  ])("rejects malformed or unsafe repeated content: %s", content => {
    const { list, state } = fixture(content)
    expect(() => bind(list, state)).toThrow()
    expect(list.items).toHaveLength(0)
  })

  it("validates all keys before replacing an existing region and can retry", () => {
    const { list, state } = fixture()
    stop = bind(list, state)
    const items = list.items
    expect(() => state.set("rows", [{ id: "a", name: "One" }, { id: "a", name: "Two" }])).toThrow()
    expect(list.items).toEqual(items)
    state.set("rows", [{ id: "a", name: "Updated" }])
    expect(list.items).toEqual([items[0]])
  })

  it.each(["data-if", "data-bind-text"])("rejects competing %s ownership on the portable source", attribute => {
    const { list, state, region } = fixture()
    region.setAttribute(attribute, "rows")
    expect(() => bind(list, state)).toThrow()
  })

  it("rejects mixing authored items or a second region into the template list", () => {
    const { list, state } = fixture()
    list.append(document.createElement("m-list-item"))
    expect(() => bind(list, state)).toThrow("exclusive item region")
  })

  it("rejects source and instance ownership transfer", () => {
    const { list, state, region } = fixture()
    stop = bind(list, state)
    list.append(list.items[0]!.parentElement!)
    expect(() => stop!.refresh()).toThrow("owned region")
    region.append(region.native)
    expect(() => stop!.refresh()).toThrow("ownership changed")
  })

  it("rejects unowned content inserted into the renderer's item region", () => {
    const { list, state, region } = fixture()
    stop = bind(list, state)
    const extra = document.createElement("li")
    region.itemsContainer.append(extra)
    expect(() => stop!.refresh()).toThrow("unowned content")
    extra.remove()
    stop.refresh()
    expect(list.items).toHaveLength(2)
  })

  it("supports nested portable regions and current parent-key model paths", async () => {
    const { list, state } = fixture(`<m-list-item>
      <m-list><m-list-template data-each="$item.children" data-each-key="id">
        <m-list-item><m-input data-model-value="$parent.name" data-model-event="input" data-model-target="native"></m-input>
        <m-input data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input></m-list-item>
      </m-list-template></m-list>
    </m-list-item>`)
    state.set("rows", [
      { id: "a", name: "Alpha", children: [{ id: "c", name: "Child" }] },
      { id: "b", name: "Beta", children: [] },
    ])
    await Promise.resolve()
    stop = bind(list, state)
    const inputs = [...list.querySelectorAll<Input>("m-input")]
    expect(inputs.map(input => input.value)).toEqual(["Alpha", "Child"])
    state.set("rows", [...state.get<any[]>("rows")].reverse())
    inputs[0]!.native!.value = "Edited parent"
    inputs[0]!.native!.dispatchEvent(new Event("input", { bubbles: true }))
    inputs[1]!.native!.value = "Edited child"
    inputs[1]!.native!.dispatchEvent(new Event("input", { bubbles: true }))
    expect(state.get("rows.1.name")).toBe("Edited parent")
    expect(state.get("rows.1.children.0.name")).toBe("Edited child")
    expect(list.items).toHaveLength(2)
    expect(list.items[1]!.querySelector<List>("m-list")!.items).toHaveLength(1)
  })

  it("preserves authored nested lists inside a generated item", () => {
    const { list, state } = fixture('<m-list-item><m-list><m-list-item>Nested</m-list-item></m-list></m-list-item>')
    stop = bind(list, state)
    expect(list.items).toHaveLength(2)
    expect(list.items[0]!.querySelector<List>("m-list")!.items).toHaveLength(1)
  })

  it("settles App mutations and retains one set of instances across App reconnect", async () => {
    if (!customElements.get("m-app")) customElements.define("m-app", App)
    const { list, state } = fixture()
    const app = document.createElement("m-app") as App
    app.store = state
    app.append(list)
    document.body.append(app)
    await new Promise(resolve => setTimeout(resolve, 0))
    const items = list.items
    expect(items).toHaveLength(2)
    state.set("rows", [...state.get<any[]>("rows")].reverse())
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(list.items).toEqual([...items].reverse())
    app.remove()
    document.body.append(app)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(list.items).toEqual([...items].reverse())
    app.remove()
  })

  it("updates the native label and forwards focus and blur", () => {
    const { region } = fixture()
    region.label = "Renamed tasks"
    region.focus()
    expect(region.itemsContainer.getAttribute("aria-label")).toBe("Renamed tasks")
    expect(document.activeElement).toBe(region.itemsContainer)
    region.blur()
    expect(document.activeElement).not.toBe(region.itemsContainer)
    region.label = null
    expect(region.itemsContainer.hasAttribute("aria-label")).toBe(false)
  })
})
