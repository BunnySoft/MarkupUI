import { afterEach, describe, expect, it, vi } from "vitest"
import { createTransfer } from "../src/components/transfer/index.js"
import type { TransferController, TransferOptions } from "../src/components/transfer/index.js"
import { createSelect } from "../src/components/select/index.js"
import { createForm } from "../src/components/form/index.js"

const helpers: TransferController[] = []
const wait = () => new Promise(resolve => setTimeout(resolve, 20))
function eventSupport() {
  vi.stubGlobal("FormDataEvent", class extends Event {
    formData: FormData
    constructor(type: string, init: { formData: FormData }) { super(type); this.formData = init.formData }
  })
}
function option(key: string, extra = "") { return `<option value="${key}" ${extra}>Item ${key}</option>` }
function fixture(options: TransferOptions = {}, config: { target?: string; source?: string } = {}) {
  const form = document.createElement("form")
  const buttons = ["add", "remove", "add-all", "remove-all", "select-source", "select-target", "clear-source", "clear-target"]
  form.innerHTML = `<fieldset class="mui-transfer" data-transfer><legend>Members</legend><div data-transfer-columns><div data-transfer-pane><label>Source filter<input type="search" data-transfer-filter="source"></label><label>Source<select data-transfer-source multiple size="6">${config.source ?? option("a") + option("b") + option("c")}</select></label><p data-transfer-count="source"></p></div><div data-transfer-actions>${buttons.map(name => `<button type="button" data-transfer-action="${name}" hidden>${name}</button>`).join("")}</div><div data-transfer-pane><label>Target filter<input type="search" data-transfer-filter="target"></label><label>Target<select data-transfer-target multiple size="6">${config.target ?? option("fixed", "disabled") + option("z")}</select></label><p data-transfer-count="target"></p></div></div><p data-transfer-status></p></fieldset><button type="button" id="outside">Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLFieldSetElement>("[data-transfer]")!, source = root.querySelector<HTMLSelectElement>("[data-transfer-source]")!, target = root.querySelector<HTMLSelectElement>("[data-transfer-target]")!
  const helper = createTransfer(root, options); helpers.push(helper)
  const item = (key: string) => [...source.options, ...target.options].find(option => option.value === key)!
  const action = (name: string) => root.querySelector<HTMLButtonElement>(`[data-transfer-action="${name}"]`)!
  return { form, root, source, target, helper, item, action }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe("native membership versus staging", () => {
  it("reads membership from target location, not selectedOptions or staged highlights", () => {
    const { helper, source, target, item } = fixture()
    item("a").selected = true; item("fixed").selected = true
    source.dispatchEvent(new Event("change", { bubbles: true })); target.dispatchEvent(new Event("change", { bubbles: true }))
    expect(helper.value).toEqual(["fixed", "z"])
    expect(helper.state.stagedSource).toEqual(["a"]); expect(helper.state.stagedTarget).toEqual(["fixed"])
  })
  it("moves actual option nodes/listeners, preserves native labels, names and staging", () => {
    const { helper, source, target, item } = fixture(), a = item("a"), listener = vi.fn(), sourceLabel = source.labels![0]
    a.selected = true; a.addEventListener("custom", listener)
    helper.move(["a"], "target"); expect(target.lastElementChild).toBe(a); expect(a.selected).toBe(true)
    a.dispatchEvent(new Event("custom")); expect(listener).toHaveBeenCalledOnce()
    expect(source.labels![0]).toBe(sourceLabel); expect(source.name).toBe(""); expect(target.name).toBe("")
  })
  it("appends batch moves in origin order, not arbitrary argument order", () => {
    const { helper } = fixture()
    helper.move(["c", "a"], "target"); expect(helper.value).toEqual(["fixed", "z", "a", "c"])
    helper.move(["c", "a"], "source"); expect(helper.state.source).toEqual(["b", "a", "c"])
  })
  it("sets exact target order while retaining source order and immutable keys", () => {
    const { helper, target } = fixture()
    helper.setValue(["z", "fixed", "b"]); expect(helper.value).toEqual(["z", "fixed", "b"])
    const before = [...target.children], append = vi.spyOn(target, "append")
    helper.setValue(["z", "fixed", "b"]); expect([...target.children]).toEqual(before); expect(append).not.toHaveBeenCalled()
  })
  it("validates duplicate/unknown/numeric/locked keys before any partial movement", () => {
    const { helper } = fixture(), before = helper.state
    for (const values of [["a", "a"], ["missing"], [1], ["a"]]) expect(() => helper.setValue(values as never)).toThrow()
    expect(() => helper.move(["a", "fixed"], "target")).toThrow()
    expect(() => helper.move(["a", "unknown"], "target")).toThrow()
    expect(helper.state.value).toEqual(before.value); expect(helper.state.source).toEqual(before.source)
  })
  it("allows null empty membership only when no locked member must be removed", () => {
    const { helper } = fixture({}, { target: option("z") })
    helper.setValue(null); expect(helper.value).toEqual([]); expect(helper.state.source).toEqual(["a", "b", "c", "z"])
  })
  it("ignores locked selected options in UI/bulk movement", async () => {
    const { helper, item, target, action } = fixture()
    item("fixed").selected = true; item("z").selected = true
    target.dispatchEvent(new Event("change", { bubbles: true })); action("remove").click(); await wait()
    expect(helper.value).toEqual(["fixed"]); expect(item("fixed").parentElement).toBe(target)
    expect(action("remove-all").disabled).toBe(true)
  })
  it("supports caller DOM data replacement and removes vanished defaults without resurrection", () => {
    const { helper, item, source } = fixture()
    item("z").remove(); const newItem = document.createElement("option"); newItem.value = "new"; newItem.textContent = "New"
    source.append(newItem); helper.refresh()
    expect(helper.value).toEqual(["fixed"]); expect(helper.state.missingDefaults).toEqual(["z"])
    helper.move(["new"], "target"); expect(helper.value).toEqual(["fixed", "new"])
  })
  it("rejects duplicate source/target keys and bounded dataset violations", () => {
    expect(() => fixture({}, { target: option("a") })).toThrow("unique")
    expect(() => fixture({}, { source: Array.from({ length: 2001 }, (_, i) => option(`n${i}`)).join(""), target: "" })).toThrow("2000")
  })
})

describe("filtering and bulk scope", () => {
  it("keeps hidden staging and membership, but move-selected operates only on matching unhidden options", () => {
    const { helper, item } = fixture()
    item("a").selected = true; item("b").selected = true
    helper.setFilter("source", "Item b")
    expect(item("a").hidden).toBe(true); expect(item("a").selected).toBe(true)
    helper.moveSelected("target")
    expect(helper.value).toEqual(["fixed", "z", "b"]); expect(helper.state.stagedSource).toEqual(["a"])
  })
  it("stages matching enabled options without clearing hidden highlights", () => {
    const { helper, item } = fixture()
    item("a").selected = true; helper.setFilter("source", "Item b"); helper.selectAll("source")
    expect(helper.state.stagedSource).toEqual(["a", "b"])
    helper.clearSelection("source"); expect(helper.state.stagedSource).toEqual([])
  })
  it("bulk removes only matching unlocked targets and preserves hidden target membership", () => {
    const { helper, item } = fixture()
    helper.move(["a", "b"], "target"); helper.setFilter("target", "Item a")
    expect(item("b").hidden).toBe(true)
    helper.moveAll("source"); expect(helper.value).toEqual(["fixed", "z", "b"])
  })
  it("refreshes labels/filter matches and treats unsafe-looking text literally", () => {
    const { helper, item } = fixture()
    item("a").textContent = "<img src=x>"; helper.setFilter("source", "<img"); helper.refresh()
    expect(item("a").hidden).toBe(false); expect(item("b").hidden).toBe(true)
    expect(item("a").querySelector("img")).toBeNull()
  })
  it("preserves native filter composition and native defaults after reset", async () => {
    const { helper, root, form } = fixture()
    const filter = root.querySelector<HTMLInputElement>('[data-transfer-filter="source"]')!
    filter.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); filter.value = "draft"
    expect(() => helper.setFilter("source", "replace")).toThrow("composing")
    form.reset(); await wait(); helper.setFilter("source", "Item b")
    expect(filter.value).toBe("Item b")
  })
})

describe("membership serialization and validation", () => {
  it("does not serialize highlighted staging as membership and explicitly appends all target members", () => {
    const { helper, form, item } = fixture()
    item("a").selected = true; item("z").selected = false
    const data = new FormData(form)
    expect([...data]).toEqual([])
    expect(helper.appendTo(data, "members[]")).toBe(2)
    expect(data.getAll("members[]")).toEqual(["fixed", "z"])
  })
  it("includes hidden and locked target members independently of staging", () => {
    const { helper, form } = fixture()
    helper.setFilter("target", "no matches")
    const data = new FormData(form); helper.appendTo(data, "members")
    expect(data.getAll("members")).toEqual(["fixed", "z"])
  })
  it("gates required membership on a real unnamed native control, not a required highlight", () => {
    const { helper, form, source, item } = fixture({ required: true }, { target: "" })
    expect(source.required).toBe(false); expect(source.validity.customError).toBe(true); expect(form.checkValidity()).toBe(false)
    item("a").selected = true; expect(form.checkValidity()).toBe(false)
    helper.move(["a"], "target"); helper.clearSelection("target")
    expect(form.checkValidity()).toBe(true)
  })
  it("composes with existing Native Form validation", async () => {
    const { helper, form, source, target } = fixture({ required: true }, { target: "" })
    const validation = createForm(form, { items: [{ key: "members", controls: [source, target] }] })
    expect((await validation.validate()).status).toBe("invalid")
    helper.move(["a"], "target"); expect((await validation.validate()).status).toBe("valid")
    validation.disconnect()
  })
  it("rejects named or required staging lists without silently removing their attributes", () => {
    const { helper, root, source } = fixture(); helper.disconnect(); source.name = "members"
    expect(() => createTransfer(root)).toThrow("unnamed"); expect(source.name).toBe("members")
    source.name = ""; source.required = true
    expect(() => createTransfer(root)).toThrow("non-required"); expect(source.required).toBe(true)
  })
  it("never overwrites a conflicting FormData field or appends a partial duplicate payload", () => {
    const { helper } = fixture(), data = new FormData(); data.append("members", "other")
    expect(() => helper.appendTo(data, "members")).toThrow("already exists")
    expect(data.getAll("members")).toEqual(["other"])
  })
  it("requires real formdata capability for automatic mode rather than silently omitting membership", () => {
    expect(() => fixture({ name: "members" })).toThrow("formdata")
  })
  it("owns one formdata name per form and rejects conflicts with native fields/other transfers", () => {
    eventSupport()
    const a = fixture({ name: "members" }), b = fixture()
    b.helper.disconnect(); a.form.append(b.root)
    expect(() => createTransfer(b.root, { name: "members" })).toThrow("owner")
    const input = document.createElement("input"); input.name = "members"; a.form.append(input)
    expect(() => a.helper.refresh()).toThrow("conflicts")
  })
  it("appends a complete membership payload through its owned formdata handler", () => {
    eventSupport()
    const { form, helper, item } = fixture({ name: "members[]" })
    item("a").selected = true; helper.setFilter("target", "none")
    const data = new FormData(form)
    form.dispatchEvent(new FormDataEvent("formdata", { formData: data }))
    expect(data.getAll("members[]")).toEqual(["fixed", "z"])
  })
  it("omits the component when either native pane is disabled, preserving DOM membership", () => {
    const { helper, target } = fixture()
    target.disabled = true; helper.refresh()
    const data = new FormData(); expect(helper.appendTo(data, "members")).toBe(0)
    expect(helper.value).toEqual(["fixed", "z"]); expect(helper.state.disabled).toBe(true)
  })
  it("respects external native form association and native fieldset disabling", async () => {
    const { helper, source, target, form, root, action, item } = fixture()
    form.id = "external"; source.setAttribute("form", form.id); target.setAttribute("form", form.id); document.body.append(root)
    helper.refresh(); item("a").selected = true; source.dispatchEvent(new Event("change", { bubbles: true }))
    expect(action("add").disabled).toBe(false)
    root.disabled = true; await wait(); expect(helper.state.disabled).toBe(true)
    root.disabled = false; await wait(); expect(action("add").disabled).toBe(false)
  })
})

describe("defaults, focus and notifications", () => {
  it("restores captured membership defaults separately from native defaultSelected staging", async () => {
    const { helper, item, form } = fixture()
    item("a").defaultSelected = true
    helper.move(["a"], "target"); helper.move(["z"], "source")
    form.reset(); expect(helper.state.pending).toBe(true); expect(form.checkValidity()).toBe(false)
    await wait(); expect(helper.value).toEqual(["fixed", "z"])
    expect(helper.state.stagedSource).toEqual(["a"]); expect(helper.state.stagedTarget).toEqual([])
  })
  it("keeps current membership, staging and filters on cancelled reset", async () => {
    const { helper, form, item } = fixture()
    helper.move(["a"], "target"); item("a").selected = true; helper.setFilter("target", "Item a")
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await wait()
    expect(helper.value).toEqual(["fixed", "z", "a"]); expect(helper.state.stagedTarget).toEqual(["a"])
  })
  it("lets explicit later membership/staging APIs settle then supersede pending reset", async () => {
    const { helper, form } = fixture()
    helper.move(["a"], "target"); form.reset(); helper.setValue(["fixed", "b"])
    await wait(); expect(helper.value).toEqual(["fixed", "b"]); expect(helper.state.pending).toBe(false)
  })
  it("does not resurrect missing defaults and preserves locked members added after binding", async () => {
    const { helper, item, target, form } = fixture()
    item("z").remove()
    const locked = document.createElement("option"); locked.value = "new-lock"; locked.textContent = "New lock"; locked.disabled = true; target.append(locked)
    helper.refresh(); form.reset(); await wait()
    expect(helper.value).toEqual(["fixed", "new-lock"]); expect(helper.state.missingDefaults).toEqual(["z"])
  })
  it("keeps user movement focus in destination while programmatic moves leave outside focus alone", async () => {
    const { helper, item, source, target, action, form } = fixture()
    item("a").selected = true; source.dispatchEvent(new Event("change", { bubbles: true })); action("add").focus(); action("add").click(); await wait()
    expect(document.activeElement).toBe(target)
    form.querySelector<HTMLButtonElement>("#outside")!.focus(); helper.move(["b"], "target")
    expect(document.activeElement!.id).toBe("outside")
  })
  it("emits membership once for user transfer, staging separately, and no setter/filter/reset change", async () => {
    const { helper, root, item, source, action, form } = fixture(), changed = vi.fn(), staged = vi.fn()
    root.addEventListener("mui:transfer-change", changed); root.addEventListener("mui:transfer-stage", staged)
    helper.setValue(["fixed", "a"]); helper.setFilter("source", ""); form.reset(); await wait()
    expect(changed).not.toHaveBeenCalled()
    item("a").selected = true; source.dispatchEvent(new Event("change", { bubbles: true }))
    expect(staged).toHaveBeenCalledOnce(); expect(changed).not.toHaveBeenCalled()
    action("add").click(); await wait(); expect(changed).toHaveBeenCalledOnce()
  })
  it("settles an accepted click before subsequent filtering or membership serialization", async () => {
    const { helper, item, source, action } = fixture()
    item("a").selected = true; source.dispatchEvent(new Event("change", { bubbles: true }))
    action("add").click(); await Promise.resolve()
    helper.setFilter("target", "none")
    const data = new FormData(); helper.appendTo(data, "members")
    expect(data.getAll("members")).toEqual(["fixed", "z", "a"])
  })
  it("honors cancelled clicks and ignores hidden/disabled actions", async () => {
    const { root, helper, item, source, action } = fixture()
    item("a").selected = true; source.dispatchEvent(new Event("change", { bubbles: true }))
    root.addEventListener("click", event => event.preventDefault(), { once: true }); action("add").click(); await wait()
    expect(helper.value).toEqual(["fixed", "z"])
    action("add").hidden = true; helper.refresh(); action("add").click(); await wait()
    expect(helper.value).toEqual(["fixed", "z"])
  })
})

describe("ownership, teardown and failure", () => {
  it("enforces one owner across module copies and competing Native Select helpers", async () => {
    const { helper, root, source } = fixture()
    vi.resetModules(); const other = await import("../src/components/transfer/index.js")
    expect(() => other.createTransfer(root)).toThrow("unowned")
    const pane = source.parentElement!.parentElement!; pane.classList.add("mui-select"); pane.setAttribute("data-select", ""); source.setAttribute("data-select-control", "")
    expect(() => createSelect(pane)).toThrow("owner")
    helper.disconnect()
  })
  it("keeps nested/independent roots separate with explicit form association", () => {
    const a = fixture(), b = fixture(); b.form.id = "nested"
    b.source.setAttribute("form", "nested"); b.target.setAttribute("form", "nested"); a.root.append(b.root)
    a.helper.refresh(); b.helper.refresh(); a.helper.move(["a"], "target")
    expect(b.helper.value).toEqual(["fixed", "z"])
  })
  it("preserves current membership, staging and option identity on disconnect rather than reverting defaults", () => {
    const { helper, item, target, source, action } = fixture(), a = item("a")
    a.selected = true; helper.move(["a"], "target"); item("z").remove(); helper.setFilter("target", "none")
    helper.disconnect()
    expect([...target.options].map(option => option.value)).toEqual(["fixed", "a"])
    expect(target.options[1]).toBe(a); expect(a.selected).toBe(true); expect(a.hidden).toBe(false)
    expect([...source.options, ...target.options].some(option => option.value === "z")).toBe(false)
    expect(action("add").hidden).toBe(true)
    expect(() => helper.moveAll("target")).toThrow("disconnected")
  })
  it("restores only owned action/option attributes, preserving external overrides", () => {
    const { helper, action, item } = fixture()
    helper.setFilter("source", "none")
    item("a").hidden = true; action("add").disabled = true; helper.refresh(); helper.disconnect()
    expect(item("a").hidden).toBe(true); expect(action("add").disabled).toBe(true)
  })
  it("does not mutate native DOM on failed initial key validation", () => {
    const { helper, root, source } = fixture(); helper.disconnect(); source.options[1]!.value = "a"
    const before = root.innerHTML; expect(() => createTransfer(root)).toThrow("unique"); expect(root.innerHTML).toBe(before)
  })
  it("gates invalid refreshed data and prevents partial membership moves until repaired", () => {
    const { helper, item, form, source } = fixture()
    item("b").value = "a"; expect(() => helper.refresh()).toThrow("unique")
    expect(form.checkValidity()).toBe(false); expect(() => helper.move(["c"], "target")).toThrow("unique")
    source.options[1]!.value = "b"; helper.refresh(); expect(helper.state.valid).toBe(true)
  })
  it("rejects a changed action type instead of submitting old membership as a move", () => {
    const { helper, action, form } = fixture()
    action("add").type = "submit"
    expect(() => helper.refresh()).toThrow("anatomy")
    expect(form.checkValidity()).toBe(false)
    const event = new Event("submit", { cancelable: true, bubbles: true }); form.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
  it("stops stale work when a focus callback disconnects during a user move", async () => {
    const { helper, target, source, item, action } = fixture()
    target.addEventListener("focus", () => helper.disconnect(), { once: true })
    item("a").selected = true; source.dispatchEvent(new Event("change", { bubbles: true })); action("add").click(); await wait()
    expect(helper.connected).toBe(false); expect([...target.options].map(option => option.value)).toEqual(["fixed", "z", "a"])
  })
})
