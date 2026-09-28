import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DynamicInput, DynamicInputTemplate, registerDynamicInput } from "../src/components/dynamic-input/index.js"
import { createDynamicInput } from "../src/components/dynamic-input/dynamic-input.js"
import type { DynamicInputOptions } from "../src/components/dynamic-input/dynamic-input.js"
import { Input } from "../src/components/input/index.js"
import "../src/components/box/index.js"
import "../src/components/form/index.js"
import "../src/components/button/index.js"
import "../src/components/radio/index.js"
import "../src/components/checkbox/index.js"
import { ViewElement } from "../src/core/index.js"
import { createInput } from "../src/components/native-input.js"
import { coordinateForm as createForm } from "../src/components/form/controller.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 20))
const actions = `<div><button type="button" data-dynamic-action="up" hidden>Up</button><button type="button" data-dynamic-action="down" hidden>Down</button><button type="button" data-dynamic-action="add" hidden>Add after</button><button type="button" data-dynamic-action="remove" hidden>Remove</button></div>`
function row(key?: string, value = "") {
  return `<div data-dynamic-row ${key ? `data-dynamic-key="${key}"` : ""}><label>Entry <span class="m-input" data-input><input data-input-control name="items[]" value="${value}" aria-describedby="shared-help"></span></label>${actions}</div>`
}
function fixture(options: DynamicInputOptions = {}, count = 2) {
  document.body.innerHTML = `<form id="form"><fieldset data-dynamic-input id="collection"><legend>Entries</legend><div data-dynamic-rows>${Array.from({ length: count }, (_, i) => row(`seed-${i}`, `value-${i}`)).join("")}</div><template data-dynamic-template>${row()}</template><button type="button" data-dynamic-add hidden>Add entry</button></fieldset><button name="intent" value="save">Submit</button></form><p id="shared-help">Shared help</p><button type="button" id="outside">Outside</button>`
  const root = document.querySelector<HTMLFieldSetElement>("#collection")!, form = document.querySelector("form")!
  const container = root.querySelector<HTMLElement>("[data-dynamic-rows]")!, template = root.querySelector<HTMLTemplateElement>("template")!
  const add = root.querySelector<HTMLButtonElement>("[data-dynamic-add]")!
  const helper = createDynamicInput(root, options); helpers.push(helper)
  return { root, form, container, template, add, helper }
}
const control = (row: HTMLElement) => row.querySelector<HTMLInputElement>("input")!
const action = (row: HTMLElement, name: string) => row.querySelector<HTMLButtonElement>(`[data-dynamic-action="${name}"]`)!
afterEach(() => { helpers.splice(0).reverse().forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("authored anatomy, bounded keys and native state", () => {
  it("keeps existing row/input/label/listener identities, current/default values and literal names", () => {
    const { helper, form } = fixture()
    const first = helper.rows[0]!, input = control(first.element), label = input.labels![0], listener = vi.fn()
    input.addEventListener("input", listener); input.value = "edited"
    helper.add()
    expect(helper.rows[0]).toBe(first); expect(control(first.element)).toBe(input)
    expect(input.labels![0]).toBe(label); expect(input.value).toBe("edited"); expect(input.defaultValue).toBe("value-0")
    input.dispatchEvent(new Event("input", { bubbles: true })); expect(listener).toHaveBeenCalledOnce()
    expect(new FormData(form).getAll("items[]")).toEqual(["edited", "value-1", ""])
  })
  it("supports empty min=0 without automatic allocation, bounded insertion and no key reuse", () => {
    const initialize = vi.fn(), { helper } = fixture({ min: 0, max: 2, initialize }, 0)
    expect(helper.rows).toHaveLength(0)
    const first = helper.add()!, second = helper.add()!
    expect(first.key).not.toBe(second.key); expect(helper.add()).toBeNull(); expect(initialize).toHaveBeenCalledTimes(2)
    expect(helper.remove(first.key)).toBe(true); expect(helper.add()!.key).not.toBe(first.key)
  })
  it.each([{ min: -1 }, { min: 3, max: 2 }, { max: 101 }, { max: 0 }, { min: 1.5 }, { min: null }, { max: "4" }, { unknown: true }])("rejects invalid bounds/options %j without native mutation", options => {
    const { helper, root } = fixture(); helper.disconnect(); const html = root.innerHTML
    expect(() => createDynamicInput(root, options as DynamicInputOptions)).toThrow()
    expect(root.innerHTML).toBe(html)
  })
  it("rejects initial count outside bounds without creating/removing rows", () => {
    const { helper, root } = fixture(); helper.disconnect(); const html = root.innerHTML
    expect(() => createDynamicInput(root, { min: 3, max: 4 })).toThrow("bounds")
    expect(root.innerHTML).toBe(html)
  })
  it("setBounds is atomic, never allocates/trims, and synchronizes native action disabling", () => {
    const { helper, add } = fixture()
    helper.setBounds(2, 2)
    expect(add.disabled).toBe(true); expect(action(helper.rows[0]!.element, "remove").disabled).toBe(true)
    expect(helper.add()).toBeNull(); expect(helper.remove(helper.rows[0]!.key)).toBe(false)
    expect(() => helper.setBounds(3, 4)).toThrow(); expect(helper.min).toBe(2); expect(helper.max).toBe(2)
    helper.setBounds(0, 4); expect(add.disabled).toBe(false); expect(helper.rows).toHaveLength(2)
  })
  it("rejects invalid insertion/move indices and unknown keys without mutation", () => {
    const { helper } = fixture(), before = [...helper.rows]
    for (const index of [-1, 5, 0.5, NaN]) expect(() => helper.add(index)).toThrow()
    expect(() => helper.remove("missing")).toThrow("key")
    expect(() => helper.move(before[0]!.key, 2)).toThrow()
    expect(helper.move(before[0]!.key, 0)).toBe(false); expect(helper.rows).toEqual(before)
  })
  it("requires stable unique keys and rejects competing module owners", async () => {
    const { helper, root } = fixture()
    expect(() => createDynamicInput(root)).toThrow("owner")
    vi.resetModules(); const other = await import("../src/components/dynamic-input/dynamic-input.js")
    expect(() => other.createDynamicInput(root)).toThrow("owner")
    helper.disconnect()
    root.querySelectorAll("[data-dynamic-row]")[1]!.setAttribute("data-dynamic-key", "seed-0")
    expect(() => createDynamicInput(root)).toThrow("unique")
  })
  it("rejects unowned rows on refresh without adopting or deleting them", () => {
    const { helper, container } = fixture(), extra = document.createElement("div")
    extra.setAttribute("data-dynamic-row", ""); extra.setAttribute("data-dynamic-key", "external"); container.append(extra)
    expect(() => helper.refresh()).toThrow("unowned"); expect(helper.connected).toBe(false)
    expect(extra.parentElement).toBe(container)
  })
  it("does not resurrect externally removed rows and releases owned resources", async () => {
    const cleanup = vi.fn(), { helper } = fixture({ connect: (_, context) => context.onCleanup(cleanup) })
    const row = helper.rows[0]!.element; row.remove(); await flush()
    expect(helper.connected).toBe(false); expect(row.isConnected).toBe(false); expect(cleanup).toHaveBeenCalledTimes(2)
  })
  it("can refresh external reordering of exactly the current owned rows", () => {
    const { helper, container } = fixture(), first = helper.rows[0]!, second = helper.rows[1]!
    container.insertBefore(second.element, first.element); helper.refresh()
    expect(helper.rows).toEqual([second, first])
    expect(action(second.element, "up").disabled).toBe(true)
  })
})

describe("template identity, ID references and explicit initialization", () => {
  it("rejects template IDs before insertion rather than cloning duplicate labels", () => {
    const { helper, template, container } = fixture()
    template.content.querySelector("input")!.id = "duplicate"
    expect(() => helper.add()).toThrow("no IDs")
    expect(container.children).toHaveLength(2)
  })
  it("supports explicit unique initialized IDs/internal references and preserves unrelated external references", () => {
    const { helper } = fixture({ initialize: (row, { key }) => {
      const input = control(row), label = row.querySelector("label")!
      input.id = `field-${key}`; label.htmlFor = input.id
      const link = document.createElement("a"); link.href = `#${input.id}`; link.textContent = "Field"; row.append(link)
    } })
    const row = helper.add()!, input = control(row.element)
    expect(input.labels![0]!.htmlFor).toBe(input.id)
    expect(input.getAttribute("aria-describedby")).toBe("shared-help")
    expect(input.name).toBe("items[]")
    expect(row.element.querySelector("a")!.getAttribute("href")).toBe(`#${input.id}`)
  })
  it("rejects initialized duplicate/dangling IDs atomically and cleans registered resources", () => {
    const cleanup = vi.fn(), { helper } = fixture({ initialize: (row, context) => {
      context.onCleanup(cleanup); control(row).id = "shared-help"
    } })
    expect(() => helper.add()).toThrow("unique"); expect(helper.rows).toHaveLength(2); expect(cleanup).toHaveBeenCalledOnce()
  })
  it("rejects unresolved ID references without remapping them", () => {
    const { helper } = fixture({ initialize: row => control(row).setAttribute("aria-labelledby", "not-created") })
    expect(() => helper.add()).toThrow("references"); expect(helper.rows).toHaveLength(2)
  })
  it("rejects invalid template roots/action buttons and visible dead no-JS actions", () => {
    const { helper, root, template } = fixture(); helper.disconnect()
    root.querySelector<HTMLButtonElement>("[data-dynamic-add]")!.hidden = false
    expect(() => createDynamicInput(root)).toThrow("hidden")
    root.querySelector<HTMLButtonElement>("[data-dynamic-add]")!.hidden = true
    template.content.append(document.createElement("div"))
    expect(() => createDynamicInput(root)).toThrow("exactly one")
  })
  it("rejects new autofocus and checked radios before they alter outside native state", () => {
    const { helper, template } = fixture()
    template.content.querySelector("input")!.setAttribute("autofocus", "")
    expect(() => helper.add()).toThrow("autofocus")
    expect(helper.rows).toHaveLength(2)
    template.content.querySelector("input")!.removeAttribute("autofocus")
    const input = template.content.querySelector("input")!; input.type = "radio"; input.checked = true
    input.defaultChecked = true
    expect(() => helper.add()).toThrow("unchecked"); expect(helper.rows).toHaveLength(2)
  })
  it("keeps unchecked cloned radio names in their actual native group, without hidden proxies", () => {
    const { helper, template, form } = fixture()
    const prototype = template.content.querySelector("input")!; prototype.type = "radio"; prototype.name = "group"; prototype.value = "new"
    const first = control(helper.rows[0]!.element); first.type = "radio"; first.name = "group"; first.checked = true
    const added = helper.add()!, radio = control(added.element)
    expect(first.checked).toBe(true); expect(radio.checked).toBe(false); expect(radio.name).toBe("group")
    radio.click(); expect(first.checked).toBe(false); expect(new FormData(form).getAll("group")).toEqual(["new"])
  })
  it("rejects a checked radio row root before it can uncheck an unowned native peer", () => {
    const { helper, template, form } = fixture()
    const peer = document.createElement("input"); peer.type = "radio"; peer.name = "outside-group"; peer.checked = true; form.append(peer)
    const prototype = document.createElement("input"); prototype.type = "radio"; prototype.name = "outside-group"
    prototype.setAttribute("data-dynamic-row", ""); prototype.defaultChecked = true
    template.content.replaceChildren(prototype)
    expect(() => helper.add()).toThrow("unchecked")
    expect(peer.checked).toBe(true); expect(helper.rows).toHaveLength(2)
  })
})

describe("hooks, explicit cleanup ownership and error boundaries", () => {
  it("runs initialize detached/connect attached, registers resources once and disposes in reverse order", () => {
    const calls: string[] = [], { helper } = fixture({
      initialize: (row, context) => { expect(row.isConnected).toBe(false); calls.push("initialize"); context.onCleanup(() => { calls.push("init-clean") }) },
      connect: (row, context) => { expect(row.isConnected).toBe(true); calls.push("connect"); context.onCleanup(() => { calls.push("connect-clean") }) },
    }, 0)
    const added = helper.add()!; helper.move(added.key, 0); helper.remove(added.key)
    expect(calls).toEqual(["initialize", "connect", "connect-clean", "init-clean"])
  })
  it("preserves connect-hook disabled/hidden decisions for initial and added action controls", async () => {
    const { helper } = fixture({ connect: row => {
      action(row, "remove").disabled = true
      action(row, "down").hidden = true
    } })
    helper.add(); await flush(); helper.refresh()
    for (const row of helper.rows) {
      expect(action(row.element, "remove").disabled).toBe(true)
      expect(action(row.element, "down").hidden).toBe(true)
    }
  })
  it("rejects action-node replacement during connect rather than keeping stale leases", () => {
    const { helper, container } = fixture({ connect: row => {
      const old = action(row, "remove"), replacement = old.cloneNode(true)
      old.replaceWith(replacement)
    } }, 0)
    expect(() => helper.add()).toThrow("original action")
    expect(helper.rows).toHaveLength(0); expect(container.children).toHaveLength(0)
  })
  it("releases every row action lease even when cleanup removes all row children", () => {
    const detached: HTMLButtonElement[] = []
    const { helper } = fixture({ connect: (row, { onCleanup }) => {
      onCleanup(() => { detached.push(...row.querySelectorAll<HTMLButtonElement>("[data-dynamic-action]")); row.replaceChildren() })
    } }, 1)
    helper.remove(helper.rows[0]!.key)
    expect(detached.every(button => button.hidden)).toBe(true)
    detached.forEach(button => button.setAttribute("hidden", "external"))
    helper.add(); helper.setBounds(0, 1); helper.refresh()
    expect(detached.every(button => button.getAttribute("hidden") === "external")).toBe(true)
  })
  it("releases detached action leases during a failed-add rollback", () => {
    const detached: HTMLButtonElement[] = []
    const { helper } = fixture({ connect: (row, { onCleanup }) => {
      onCleanup(() => { detached.push(...row.querySelectorAll<HTMLButtonElement>("[data-dynamic-action]")); row.replaceChildren() })
      throw new Error("Connect failed")
    } }, 0)
    expect(() => helper.add()).toThrow("Connect failed")
    detached.forEach(button => button.setAttribute("hidden", "external"))
    helper.refresh()
    expect(detached.every(button => button.getAttribute("hidden") === "external")).toBe(true)
  })
  it.each(["initialize", "connect"])("rolls back failed %s and reports no committed collection event", hook => {
    const cleanup = vi.fn(), options: DynamicInputOptions = {}
    options[hook as "initialize" | "connect"] = (_, context) => { context.onCleanup(cleanup); throw new Error("Expected hook failure") }
    const { helper, root, container } = fixture(options, 0), changed = vi.fn(), errors = vi.fn()
    root.addEventListener("m:dynamic-input-change", changed); root.addEventListener("m:dynamic-input-error", errors)
    expect(() => helper.add()).toThrow("Expected hook failure")
    expect(helper.rows).toHaveLength(0); expect(container.children).toHaveLength(0); expect(cleanup).toHaveBeenCalledOnce()
    expect(changed).not.toHaveBeenCalled(); expect((errors.mock.calls[0]![0] as CustomEvent).detail.committed).toBe(false)
  })
  it("rolls back only its created row even if a failed connect hook reparents it", () => {
    const { helper } = fixture({ connect: row => { document.body.append(row); throw new Error("Moved draft") } }, 0)
    expect(() => helper.add()).toThrow(); expect(document.querySelectorAll("[data-dynamic-row]")).toHaveLength(0)
  })
  it("cleans initial resources and restores hidden actions if later initial connection fails", () => {
    const { helper, root } = fixture(); helper.disconnect(); const cleanup = vi.fn()
    expect(() => createDynamicInput(root, { connect: (_, { index, onCleanup }) => {
      onCleanup(cleanup); if (index === 1) throw new Error("Second failed")
    } })).toThrow("Second failed")
    expect(cleanup).toHaveBeenCalledTimes(2)
    expect([...root.querySelectorAll<HTMLButtonElement>("button")].every(button => button.hidden)).toBe(true)
    helpers.push(createDynamicInput(root))
  })
  it("rejects lifecycle reentrancy without leaving a partial added row", () => {
    let nested: (() => void) | null = null
    const { helper } = fixture({ connect: () => { nested?.() } })
    nested = () => { helper.add() }
    expect(() => helper.add()).toThrow("reenter"); expect(helper.rows).toHaveLength(2)
  })
  it("attempts all cleanup and distinguishes committed removal from a resource failure", () => {
    const cleaned = vi.fn(), { helper, root } = fixture({ connect: (_, { onCleanup }) => {
      onCleanup(cleaned); onCleanup(() => { throw new Error("Cleanup failed") })
    } }, 1), changed = vi.fn(), errors = vi.fn()
    root.addEventListener("m:dynamic-input-change", changed); root.addEventListener("m:dynamic-input-error", errors)
    expect(() => helper.remove(helper.rows[0]!.key)).toThrow("Row removed")
    expect(helper.rows).toHaveLength(0); expect(cleaned).toHaveBeenCalledOnce(); expect(changed).toHaveBeenCalledOnce()
    expect((errors.mock.calls[0]![0] as CustomEvent).detail.committed).toBe(true)
  })
  it("keeps current edited rows on disconnect and cleans row helpers without resurrecting deletions", () => {
    const cleanup = vi.fn(), { helper, container } = fixture({ connect: (_, context) => context.onCleanup(cleanup) })
    helper.remove(helper.rows[0]!.key)
    const remaining = helper.rows[0]!, input = control(remaining.element); input.value = "edited"
    helper.disconnect(); helper.disconnect()
    expect(container.children).toHaveLength(1); expect(input.value).toBe("edited"); expect(cleanup).toHaveBeenCalledTimes(2)
    expect(action(remaining.element, "remove").hidden).toBe(true)
  })
  it("surfaces unexpected asynchronous hook returns/rejections without success-shaped DOM", async () => {
    const { helper, root } = fixture({ initialize: (() => Promise.reject(new Error("Late hook failure"))) as never }, 0)
    const errors = vi.fn(); root.addEventListener("m:dynamic-input-error", errors)
    expect(() => helper.add()).toThrow("synchronous"); await flush()
    expect(helper.rows).toHaveLength(0); expect(errors.mock.calls.some(call => (call[0] as CustomEvent).detail.error.message === "Late hook failure")).toBe(true)
  })
})

describe("native focus, reorder, actions and no-JS restoration", () => {
  it("reorders the original focused input with selection and FormData order preserved", () => {
    const { helper, container, form } = fixture()
    const row = helper.rows[0]!, input = control(row.element), event = vi.fn()
    Object.defineProperty(container, "moveBefore", { value: undefined, configurable: true })
    input.value = "edited text"; input.addEventListener("input", event); input.focus(); input.setSelectionRange(2, 6)
    helper.move(row.key, 1)
    expect(helper.rows[1]).toBe(row); expect(document.activeElement).toBe(input)
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 6]); expect(event).not.toHaveBeenCalled()
    expect(new FormData(form).getAll("items[]")).toEqual(["value-1", "edited text"])
    expect(input.defaultValue).toBe("value-0")
  })
  it("uses native moveBefore when available, not a clone/recreation path", () => {
    const { helper, container } = fixture()
    const mover = vi.fn((row: Node, before: Node | null) => container.insertBefore(row, before))
    Object.defineProperty(container, "moveBefore", { value: mover, configurable: true })
    const original = helper.rows[0]!
    helper.move(original.key, 1); expect(mover).toHaveBeenCalledOnce(); expect(helper.rows[1]).toBe(original)
  })
  it("guards synchronous blur-style reentrancy during DOM relocation", () => {
    const { helper, container } = fixture()
    const first = helper.rows[0]!, second = helper.rows[1]!, input = control(first.element), blocked = vi.fn()
    input.addEventListener("blur", () => {
      expect(() => helper.remove(second.key)).toThrow("reenter"); blocked()
    })
    Object.defineProperty(container, "moveBefore", { value: (node: Node, before: Node | null) => {
      input.dispatchEvent(new FocusEvent("blur"))
      container.insertBefore(node, before)
    }, configurable: true })
    helper.move(first.key, 1)
    expect(blocked).toHaveBeenCalledOnce(); expect(helper.rows).toEqual([second, first])
    expect([...container.children]).toEqual([second.element, first.element])
  })
  it("withdraws ownership rather than publishing stale rows after direct external mutation during a move", () => {
    const { helper, container, root } = fixture()
    const first = helper.rows[0]!, second = helper.rows[1]!, changed = vi.fn()
    root.addEventListener("m:dynamic-input-change", changed)
    Object.defineProperty(container, "moveBefore", { value: (node: Node, before: Node | null) => {
      second.element.remove(); container.insertBefore(node, before)
    }, configurable: true })
    expect(() => helper.move(first.key, 1)).toThrow("Row count")
    expect(helper.connected).toBe(false); expect(changed).not.toHaveBeenCalled()
    expect([...container.children]).toEqual([first.element])
  })
  it("programmatic adds/moves/removes do not steal outside or another row's focus", () => {
    const { helper } = fixture(), outside = document.querySelector<HTMLButtonElement>("#outside")!
    outside.focus(); const added = helper.add()!; helper.move(added.key, 0); helper.remove(added.key)
    expect(document.activeElement).toBe(outside)
    const first = helper.rows[0]!, focused = control(first.element); focused.focus()
    helper.remove(helper.rows[1]!.key); expect(document.activeElement).toBe(focused)
  })
  it("user add focuses the new field even when the add button becomes disabled at max", async () => {
    const { helper, add } = fixture({ max: 3 })
    add.focus(); add.click(); await flush()
    expect(helper.rows).toHaveLength(3); expect(document.activeElement).toBe(control(helper.rows[2]!.element))
    expect(add.disabled).toBe(true)
  })
  it("removing a focused row recovers to next/previous row or add when empty", async () => {
    const { helper, add } = fixture()
    const first = helper.rows[0]!, next = helper.rows[1]!
    action(first.element, "remove").focus(); action(first.element, "remove").click(); await flush()
    expect(document.activeElement).toBe(control(next.element))
    control(next.element).focus(); helper.remove(next.key)
    expect(document.activeElement).toBe(add)
  })
  it("moving an action to a disabled boundary recovers into its own row", async () => {
    const { helper, container } = fixture()
    Object.defineProperty(container, "moveBefore", { value: undefined, configurable: true })
    const row = helper.rows[0]!, down = action(row.element, "down")
    down.focus(); down.click(); await flush()
    expect(helper.rows[1]).toBe(row); expect(down.disabled).toBe(true); expect(document.activeElement).toBe(control(row.element))
  })
  it("respects cancelled click, changed action intent and native disabled fieldsets", async () => {
    const { helper, root, add } = fixture()
    add.addEventListener("click", event => event.preventDefault(), { once: true }); add.click(); await flush()
    expect(helper.rows).toHaveLength(2)
    const remove = action(helper.rows[0]!.element, "remove")
    remove.click(); remove.setAttribute("data-dynamic-action", "custom"); await flush()
    expect(helper.rows).toHaveLength(2)
    // The invalid action withdraws enhancement, rather than deleting anything.
    expect(helper.connected).toBe(false)
    remove.setAttribute("data-dynamic-action", "remove")
    const again = createDynamicInput(root); helpers.push(again)
    root.disabled = true; add.click(); await flush(); expect(again.rows).toHaveLength(2)
    expect(again.add()).not.toBeNull() // explicit programmatic transactions remain available
  })
  it("restores action attributes in either refresh/dispose timing and preserves external overrides", async () => {
    const { helper, add } = fixture()
    helper.add(); await flush(); helper.refresh(); helper.disconnect()
    expect(add.hidden).toBe(true)
    const next = createDynamicInput(document.querySelector("#collection")!); helpers.push(next)
    add.hidden = true; add.disabled = true; await flush(); next.disconnect()
    expect(add.hidden).toBe(true); expect(add.disabled).toBe(true)
  })
})

describe("Dynamic Input default styles", () => {
  const css = readFileSync(resolve("src", "components", "dynamic-input", "dynamic-input.css"), "utf8")

  it("keeps the Dynamic Input stylesheet within its unchanged ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
  })

  it("matches retained row and action alignment defaults", () => {
    expect(css).toContain("gap: 10px")
    expect(css).toContain("align-items: end")
    expect(css).toContain("gap: 20px")
    expect(css).toContain("min-block-size: 34px")
  })

  it("does not override Input-owned composed controls", () => {
    expect(css).toContain(":not([data-input-control])")
    expect(css).not.toContain(":is(input, select, textarea) {")
  })

  it("keeps native labels, responsive stacking and media behavior", () => {
    expect(css).not.toContain("font-size: 0")
    expect(css).toContain("@media (max-width: 30rem)")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("@media print")
  })
})

describe("reset, nested scopes and explicit Form/Input resources", () => {
  it("native reset affects current fields, never the row set or deleted data", async () => {
    const { helper, form } = fixture()
    helper.remove(helper.rows[0]!.key); const retained = helper.rows[0]!, added = helper.add()!
    control(retained.element).value = "edited"; control(added.element).value = "new edited"
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(control(added.element).value).toBe("new edited")
    form.reset(); await flush()
    expect(helper.rows).toEqual([retained, added]); expect(control(retained.element).value).toBe("value-1"); expect(control(added.element).value).toBe("")
  })
  it("does not capture a nested repeater's add/remove actions", async () => {
    const { helper } = fixture()
    const nested = document.createElement("section"); nested.setAttribute("data-dynamic-input", "")
    nested.innerHTML = `<div data-dynamic-rows>${row("inner", "inside")}</div><template data-dynamic-template>${row()}</template><button type="button" data-dynamic-add hidden>Inner add</button>`
    helper.rows[0]!.element.append(nested); helper.refresh()
    const inner = createDynamicInput(nested); helpers.push(inner)
    nested.querySelector<HTMLButtonElement>("[data-dynamic-add]")!.click(); await flush()
    expect(inner.rows).toHaveLength(2); expect(helper.rows).toHaveLength(2)
    action(inner.rows[0]!.element, "remove").click(); await flush()
    expect(inner.rows).toHaveLength(1); expect(helper.rows).toHaveLength(2)
  })
  it("uses explicit connected-row Input cleanup and Form refresh without replacing fields", async () => {
    let resources = 0
    const { helper, form, root } = fixture({ connect: (row, { onCleanup }) => {
      const entry = createInput(row.querySelector("[data-input]")!); resources++
      onCleanup(() => { entry.disconnect(); resources-- })
    } })
    const coordinator = createForm(form, { items: [] }); helpers.push(coordinator)
    root.addEventListener("m:dynamic-input-change", () => coordinator.refresh())
    const added = helper.add()!, input = control(added.element); input.required = true
    expect((await coordinator.validate()).status).toBe("invalid")
    input.value = "valid"; expect((await coordinator.validate()).status).toBe("valid")
    helper.move(added.key, 0); expect(control(helper.rows[0]!.element)).toBe(input); expect(resources).toBe(3)
    helper.remove(added.key); expect(resources).toBe(2)
    helper.disconnect(); expect(resources).toBe(0); expect(form.querySelectorAll('input[name="items[]"]')).toHaveLength(2)
  })
})

describe("canonical DynamicInput ViewElement", () => {
  it("maps an all-m-* multi-field template to native submission, reset, focus and surviving identity", async () => {
    document.body.innerHTML = `<m-form><m-dynamic-input min="1" max="3">
      <m-dynamic-input-template>
        <m-label>Title <m-input name="titles[]" value="A, B" required></m-input></m-label>
        <m-label>Note <m-textarea name="notes[]" value="Default"></m-textarea></m-label>
      </m-dynamic-input-template>
    </m-dynamic-input><m-button attr-type="submit">Save</m-button><m-button attr-type="reset">Reset</m-button></m-form>`
    const el = document.querySelector<DynamicInput>("m-dynamic-input")!
    await flush()
    expect(el.connected).toBe(true)
    expect(el.querySelector("m-input")).toBeInstanceOf(Input)
    const form = document.querySelector("form")!, first = el.rows[0]!, input = control(first.element)
    expect(new FormData(form).getAll("titles[]")).toEqual(["A, B"])
    expect(new FormData(form).getAll("notes[]")).toEqual(["Default"])
    expect(input.labels![0]!.textContent).toBe("Title ")
    const changed = vi.fn()
    input.addEventListener("input", changed)
    input.value = "Edited, intact"
    input.focus(); input.setSelectionRange(2, 5)
    const second = el.add()!
    el.move(first.key, 1)
    expect(el.rows).toEqual([second, first])
    expect(document.activeElement).toBe(input)
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 5])
    expect(new FormData(form).getAll("titles[]")).toEqual(["A, B", "Edited, intact"])
    input.dispatchEvent(new Event("input", { bubbles: true }))
    expect(changed).toHaveBeenCalledOnce()
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); expect(input.value).toBe("Edited, intact")
    form.reset(); expect(input.value).toBe("A, B")
    el.removeRow(second.key)
    expect(new FormData(form).getAll("titles[]")).toEqual(["A, B"])
    expect(el.querySelector("m-dynamic-input-template")!.querySelectorAll("input,textarea")).toHaveLength(0)
    const add = el.querySelector<HTMLButtonElement>("[data-dynamic-add]")!
    add.focus(); add.click(); await flush()
    expect(document.activeElement).toBe(control(el.rows[1]!.element))
    expect(el.error).toBeNull()
  })
  it("focuses a click-added field when the browser leaves body active, without stealing outside focus", async () => {
    const { helper, add } = fixture()
    expect(document.activeElement).toBe(document.body)
    add.click(); await flush()
    expect(document.activeElement).toBe(control(helper.rows[2]!.element))
    const outside = document.querySelector<HTMLButtonElement>("#outside")!
    outside.focus(); add.click(); await flush()
    expect(document.activeElement).toBe(outside)
  })

  it("exposes detached initialization and connected cleanup with atomic rollback", () => {
    const el = new DynamicInput(), cleaned = vi.fn(), connected = vi.fn()
    el.initializeRow = (row, context) => {
      expect(row.isConnected).toBe(false)
      context.onCleanup(cleaned)
      control(row).id = `input-${context.key}`
    }
    el.connectRow = (row, context) => {
      expect(row.isConnected).toBe(true)
      context.onCleanup(connected)
    }
    document.body.append(el)
    const first = el.add()!
    expect(control(first.element).id).toBe(`input-${first.key}`)
    el.initializeRow = (row, context) => {
      context.onCleanup(cleaned)
      control(row).id = control(first.element).id
    }
    expect(() => el.add()).toThrow("unique")
    expect(el.rows).toEqual([first])
    expect(cleaned).toHaveBeenCalledOnce()
    el.removeRow(first.key)
    expect(cleaned).toHaveBeenCalledTimes(2)
    expect(connected).toHaveBeenCalledOnce()
  })

  it("materializes portable checkbox/radio owners before validation, rejecting checked radios atomically", () => {
    const form = document.createElement("form"), peer = document.createElement("input"), el = new DynamicInput()
    peer.type = "radio"; peer.name = "choice"; peer.checked = true
    el.innerHTML = `<m-dynamic-input-template><m-checkbox name="enabled" checked value="yes">Enabled</m-checkbox><m-radio name="choice" value="new">Choice</m-radio></m-dynamic-input-template>`
    form.append(peer, el); document.body.append(form)
    const first = el.add()!
    expect(new FormData(form).getAll("enabled")).toEqual(["yes"])
    expect(peer.checked).toBe(true)
    el.querySelector<DynamicInputTemplate>("m-dynamic-input-template")!.native.content.querySelector("m-radio")!.setAttribute("checked", "")
    expect(() => el.add()).toThrow("unchecked")
    expect(el.rows).toEqual([first])
    expect(peer.checked).toBe(true)
  })

  it("preserves native removal, draft/defaults, cleanups and stable keys across reconnect", async () => {
    const el = new DynamicInput(), connect = vi.fn(), cleanup = vi.fn()
    el.connectRow = (_, context) => { connect(); context.onCleanup(cleanup) }
    document.body.append(el)
    const first = el.add()!, removed = el.add()!, input = control(first.element)
    el.removeRow(removed.key)
    input.value = "Kept"
    el.remove()
    expect(el.isConnected).toBe(false)
    expect(el.connected).toBe(false)
    expect(cleanup).toHaveBeenCalledTimes(2)
    document.body.append(el); await flush()
    expect(el.rows[0]!.element).toBe(first.element)
    expect(input.value).toBe("Kept")
    expect(connect).toHaveBeenCalledTimes(3)
    expect(el.add()!.key).not.toBe(removed.key)
    expect(el.querySelectorAll(".m-dynamic-input__controls")).toHaveLength(1)
    expect(el.querySelectorAll("[data-dynamic-add]")).toHaveLength(1)
  })

  it("keeps disabled flags and nested ownership through inherited disabling", async () => {
    const el = new DynamicInput()
    document.body.append(el)
    const row = el.add()!, locked = control(row.element)
    locked.disabled = true
    const nested = new DynamicInput()
    row.element.append(nested)
    const inner = nested.add()!, input = control(inner.element)
    await flush()
    el.disabled = true
    expect(input.matches(":disabled")).toBe(true)
    expect(input.disabled).toBe(false)
    el.disabled = false
    expect(locked.disabled).toBe(true)
    expect(input.matches(":disabled")).toBe(false)
    action(inner.element, "add").click(); await flush()
    expect(nested.rows).toHaveLength(2)
    expect(el.rows).toHaveLength(1)
    expect(el.connected).toBe(true)
  })

  it("preflights scalar bounds without allocating, truncating or reflecting a rejected write", () => {
    const el = new DynamicInput()
    document.body.append(el); el.add(); el.add()
    expect(() => { el.max = 1 }).toThrow()
    expect(el.hasAttribute("max")).toBe(false)
    expect(() => { el.min = 3 }).toThrow()
    expect(el.hasAttribute("min")).toBe(false)
    el.min = 2; el.max = 2
    expect(el.rows).toHaveLength(2)
    expect(el.add()).toBeNull()
    expect(() => { el.max = 101 }).toThrow()
  })

  it("replays genuine pre-upgrade configuration and Web hooks", () => {
    const el = document.createElement("m-dynamic-input") as DynamicInput
    const hook = vi.fn()
    Object.defineProperty(el, "min", { configurable: true, value: 2 })
    Object.defineProperty(el, "name", { configurable: true, value: "entries[]" })
    Object.defineProperty(el, "initializeRow", { configurable: true, value: hook })
    document.body.append(el); el.refresh()
    expect(el.rows).toHaveLength(2)
    expect(hook).toHaveBeenCalledTimes(2)
    expect(control(el.rows[0]!.element).name).toBe("entries[]")
    expect(Object.hasOwn(el, "min")).toBe(false)
  })

  it("uses direct DOM construction and rejects invalid template IDs/autofocus before insertion", () => {
    const el = new DynamicInput()
    vi.spyOn(Element.prototype, "innerHTML", "set").mockImplementation(() => { throw new Error("HTML sink") })
    document.body.append(el); el.add()
    const template = el.querySelector("template")!
    template.content.querySelector("input")!.id = "duplicate"
    expect(() => el.add()).toThrow("no IDs")
    expect(el.rows).toHaveLength(1)
  })

  it("documents public preview authoring entirely with m-* elements", () => {
    const html = readFileSync(resolve("demo/components/dynamic-input.html"), "utf8")
    const page = new DOMParser().parseFromString(html, "text/html")
    for (const preview of page.querySelectorAll("[data-demo-preview]")) {
      expect([...preview.querySelectorAll("*")].filter(node => !node.localName.startsWith("m-")).map(node => node.localName)).toEqual([])
    }
  })

  it("registers only its own ViewElement and rejects conflicting definitions", () => {
    expect(DynamicInput.prototype).toBeInstanceOf(ViewElement)
    expect(customElements.get("m-dynamic-input")).toBe(DynamicInput)
    expect(DynamicInput.tag).toBe("m-dynamic-input")
    const define = vi.fn()
    registerDynamicInput({ get: () => undefined, define })
    expect(define.mock.calls.map(call => call[0])).toEqual(["m-dynamic-input-template", "m-dynamic-input"])
    expect(customElements.get(DynamicInputTemplate.tag)).toBe(DynamicInputTemplate)
    expect(() => registerDynamicInput({ get: () => HTMLElement, define })).toThrow("different")
  })

  it("exposes canonical observedAttributes and default property values", () => {
    expect(DynamicInput.observedAttributes).toEqual(["min", "max", "disabled", "name", "field-label"])
    const dynamicInput = new DynamicInput()
    expect(dynamicInput.min).toBe(0)
    expect(dynamicInput.max).toBe(20)
    expect(dynamicInput.disabled).toBe(false)
  })

  it("reflects properties to attributes and validates bounds", () => {
    const dynamicInput = new DynamicInput()
    dynamicInput.min = 2
    expect(dynamicInput.getAttribute("min")).toBe("2")
    expect(dynamicInput.min).toBe(2)

    dynamicInput.max = 10
    expect(dynamicInput.getAttribute("max")).toBe("10")
    expect(dynamicInput.max).toBe(10)

    dynamicInput.disabled = true
    expect(dynamicInput.hasAttribute("disabled")).toBe(true)
    expect(dynamicInput.disabled).toBe(true)

    dynamicInput.disabled = false
    expect(dynamicInput.hasAttribute("disabled")).toBe(false)
    expect(dynamicInput.disabled).toBe(false)

    dynamicInput.setAttribute("min", "4")
    expect(dynamicInput.min).toBe(4)

    dynamicInput.setAttribute("max", "12")
    expect(dynamicInput.max).toBe(12)

    dynamicInput.setAttribute("disabled", "")
    expect(dynamicInput.disabled).toBe(true)

    expect(() => { (dynamicInput as any).min = -1 }).toThrow(RangeError)
    expect(() => { (dynamicInput as any).max = 0 }).toThrow(RangeError)
  })

  it("generates default container, template, and add button when connected empty", () => {
    const dynamicInput = new DynamicInput()
    document.body.append(dynamicInput)
    dynamicInput.refresh()

    expect(dynamicInput.classList.contains("m-dynamic-input")).toBe(true)
    expect(dynamicInput.querySelector("[data-dynamic-rows]")).not.toBeNull()
    expect(dynamicInput.querySelector("template[data-dynamic-template]")).not.toBeNull()
    const addBtn = dynamicInput.querySelector<HTMLButtonElement>("[data-dynamic-add]")
    expect(addBtn).not.toBeNull()
    expect(addBtn?.disabled).toBe(false)
  })

  it("adopts authored template, rows, and buttons", () => {
    const el = document.createElement("m-dynamic-input") as DynamicInput
    el.innerHTML = `
      <div class="m-dynamic-input__rows" data-dynamic-rows>
        <div class="m-dynamic-input__row" data-dynamic-row data-dynamic-key="row-1">
          <input value="Initial row">
          <button type="button" data-dynamic-action="remove" hidden>Remove</button>
        </div>
      </div>
      <template data-dynamic-template>
        <div class="m-dynamic-input__row" data-dynamic-row>
          <input value="">
          <button type="button" data-dynamic-action="remove" hidden>Remove</button>
        </div>
      </template>
      <button type="button" data-dynamic-add hidden>Add row</button>
    `
    document.body.append(el)
    el.refresh()

    expect(el.rows).toHaveLength(1)
    expect(control(el.rows[0]!.element).value).toBe("Initial row")
    const removeBtn = el.querySelector<HTMLButtonElement>("[data-dynamic-action=remove]")!
    expect(removeBtn.hidden).toBe(false)
  })

  it("emits structural snapshots, leaving field changes as native events", () => {
    const el = new DynamicInput()
    document.body.append(el)
    const listener = vi.fn()
    el.addEventListener("m:change", listener)

    const row = el.add()
    expect(row).not.toBeNull()
    expect(el.rows).toHaveLength(1)
    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0][0].detail).toEqual({ type: "add", row, index: 0, previousIndex: null, rows: [row] })
    expect(listener.mock.calls[0][0].bubbles).toBe(true)

    const input = control(row!.element)
    input.value = "Updated item"
    input.dispatchEvent(new Event("change", { bubbles: true }))

    expect(listener).toHaveBeenCalledOnce()
    expect(input.value).toBe("Updated item")
  })

  it("respects max limit and disables add button", () => {
    const el = new DynamicInput()
    el.max = 2
    document.body.append(el)

    expect(el.add()).not.toBeNull()
    expect(el.add()).not.toBeNull()
    expect(el.rows).toHaveLength(2)

    expect(el.add()).toBeNull()
    expect(el.rows).toHaveLength(2)

    const addBtn = el.querySelector<HTMLButtonElement>("[data-dynamic-add]")!
    expect(addBtn.disabled).toBe(true)
  })

  it("respects min limit and disables remove button", () => {
    const el = new DynamicInput()
    el.min = 1
    document.body.append(el)
    el.refresh()

    // Because min=1, connectedCallback ensured 1 row exists
    expect(el.rows).toHaveLength(1)
    const row = el.rows[0]!

    // Cannot remove below min of 1
    expect(el.removeRow(row.key)).toBe(false)
    expect(el.rows).toHaveLength(1)

    const removeBtn = action(row.element, "remove")
    expect(removeBtn.disabled).toBe(true)

    // Increase row count then remove
    el.add()
    expect(el.rows).toHaveLength(2)
    expect(removeBtn.disabled).toBe(false)

    expect(el.removeRow(row.key)).toBe(true)
    expect(el.rows).toHaveLength(1)
  })

  it("moves rows and emits m:change", () => {
    const el = new DynamicInput()
    document.body.append(el)

    const row1 = el.add()!
    const row2 = el.add()!
    control(row1.element).value = "First"
    control(row2.element).value = "Second"

    const listener = vi.fn()
    el.addEventListener("m:change", listener)

    expect(el.move(row1.key, 1)).toBe(true)
    expect(el.rows).toEqual([row2, row1])
    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0][0].detail).toEqual({ type: "move", row: row1, index: 1, previousIndex: 0, rows: [row2, row1] })

    // Boundary check
    expect(() => el.move(row1.key, 5)).toThrow(RangeError)
    expect(el.move(row1.key, 1)).toBe(false)
  })

  it("handles cancellable button click delegations for add, remove, and move", async () => {
    const el = new DynamicInput()
    document.body.append(el)
    el.refresh()

    const addBtn = el.querySelector<HTMLButtonElement>("[data-dynamic-add]")!
    addBtn.click()
    await flush()
    expect(el.rows).toHaveLength(1)

    const row1 = el.rows[0]!
    const rowAddBtn = action(row1.element, "add")
    rowAddBtn.click()
    await flush()
    expect(el.rows).toHaveLength(2)

    const row2 = el.rows[1]!
    control(row1.element).value = "Alpha"
    control(row2.element).value = "Beta"

    const upBtn = action(row2.element, "up")
    upBtn.click()
    await flush()
    expect(el.rows).toEqual([row2, row1])

    const downBtn = action(el.rows[0]!.element, "down")
    downBtn.click()
    await flush()
    expect(el.rows).toEqual([row1, row2])

    const removeBtn = action(el.rows[1]!.element, "remove")
    removeBtn.addEventListener("click", event => event.preventDefault(), { once: true })
    removeBtn.click()
    await flush()
    expect(el.rows).toHaveLength(2)
    removeBtn.click()
    await flush()
    expect(el.rows).toEqual([row1])
  })

  it("handles disabled state across buttons and controls", () => {
    const el = new DynamicInput()
    document.body.append(el)
    el.add()

    el.disabled = true
    const addBtn = el.querySelector<HTMLButtonElement>("[data-dynamic-add]")!
    const input = el.querySelector<HTMLInputElement>("input")!
    expect(addBtn.matches(":disabled")).toBe(true)
    expect(input.matches(":disabled")).toBe(true)
    expect(input.disabled).toBe(false)

    // Clicking disabled button should not add row
    addBtn.click()
    expect(el.rows).toHaveLength(1)

    el.disabled = false
    expect(addBtn.disabled).toBe(false)
    expect(input.disabled).toBe(false)
  })

  it("upgrades properties assigned before connection", () => {
    const unmounted = document.createElement("m-dynamic-input") as DynamicInput
    unmounted.min = 2
    unmounted.max = 6
    unmounted.disabled = true
    document.body.append(unmounted)
    unmounted.refresh()

    expect(unmounted.min).toBe(2)
    expect(unmounted.max).toBe(6)
    expect(unmounted.disabled).toBe(true)
    expect(unmounted.rows).toHaveLength(2)
  })

  it("delegates focus and blur to the input elements", () => {
    const el = new DynamicInput()
    document.body.append(el)
    const row = el.add()!
    const input = control(row.element)
    const focusSpy = vi.spyOn(input, "focus")
    const blurSpy = vi.spyOn(input, "blur")

    el.focus()
    expect(focusSpy).toHaveBeenCalledOnce()

    input.focus()
    el.blur()
    expect(blurSpy).toHaveBeenCalledOnce()
  })

  it("can focus immediately after insertion, before the deferred initial render", () => {
    const el = new DynamicInput()
    el.min = 1
    document.body.append(el)
    el.focus()
    expect(el.connected).toBe(true)
    expect(document.activeElement).toBe(control(el.rows[0]!.element))
  })
})

