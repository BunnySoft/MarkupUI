import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"
import { createTransfer, Transfer, MTransfer, registerTransfer } from "../src/components/transfer/index.js"
import * as transferApi from "../src/components/transfer/index.js"
import type { TransferController, TransferOptions, TransferChangeDetail } from "../src/components/transfer/index.js"
import { createSelect } from "../src/components/native-select.js"
import { coordinateForm as createForm } from "../src/components/form/controller.js"
import { ViewElement } from "../src/core/index.js"

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
  form.innerHTML = `<fieldset class="m-transfer" data-transfer><legend>Members</legend><div data-transfer-columns><div data-transfer-pane><label>Source filter<input type="search" data-transfer-filter="source"></label><label>Source<select data-transfer-source multiple size="6">${config.source ?? option("a") + option("b") + option("c")}</select></label><p data-transfer-count="source"></p></div><div data-transfer-actions>${buttons.map(name => `<button type="button" data-transfer-action="${name}" hidden>${name}</button>`).join("")}</div><div data-transfer-pane><label>Target filter<input type="search" data-transfer-filter="target"></label><label>Target<select data-transfer-target multiple size="6">${config.target ?? option("fixed", "disabled") + option("z")}</select></label><p data-transfer-count="target"></p></div></div><p data-transfer-status></p></fieldset><button type="button" id="outside">Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLFieldSetElement>("[data-transfer]")!, source = root.querySelector<HTMLSelectElement>("[data-transfer-source]")!, target = root.querySelector<HTMLSelectElement>("[data-transfer-target]")!
  const helper = createTransfer(root, options); helpers.push(helper)
  const item = (key: string) => [...source.options, ...target.options].find(option => option.value === key)!
  const action = (name: string) => root.querySelector<HTMLButtonElement>(`[data-transfer-action="${name}"]`)!
  return { form, root, source, target, helper, item, action }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe("native membership versus staging", () => {
  it("keeps controlled typography/palette corrections within budget without replacing native option skins", () => {
    const css = readFileSync(join("src", "components", "transfer", "transfer.css"), "utf8")
    expect(css).toContain("var(--m-font-size-medium,14px)")
    expect(css).toContain("var(--m-font-size-large,15px)")
    expect(css).toContain("--_m-transfer-title-size: 16px")
    expect(css).toContain("--_m-transfer-title-size: 14px")
    expect(css).toContain("--_m-transfer-extra-size: 14px")
    expect(css).toContain("var(--m-transfer-list-padding,var(--_m-transfer-list-padding))")
    expect(css).toContain("rgba(255,255,255,.1)")
    expect(css).toContain("--_m-transfer-border: transparent")
    expect(css).toContain("var(--m-transfer-filter-height,28px)")
    expect(css).toContain("var(--m-transfer-title-weight,400)")
    expect(css).toContain(":has(>select:disabled,>label>select:disabled)")
    expect(css).toContain("color-scheme:var(--_m-transfer-scheme,light)")
    expect(css).not.toContain("option:checked")
    expect(css).not.toMatch(/appearance:\s*none/)
    expect(css).not.toMatch(/height:\s*300px/)
    expect(css).not.toContain("content:")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1250)
  })
  it("resets media defaults without overwriting public author tokens or fading forced-color disabled content", () => {
    const css = readFileSync(join("src", "components", "transfer", "transfer.css"), "utf8")
    const element = document.createElement("style")
    element.textContent = css
    document.head.append(element)
    try {
      const media = [...element.sheet!.cssRules]
        .filter(rule => rule.type === CSSRule.MEDIA_RULE) as CSSMediaRule[]
      const print = media.find(rule => rule.media.mediaText === "print")!
      const defaults = [...print.cssRules].find(rule => (rule as CSSStyleRule).selectorText === ".m-transfer") as CSSStyleRule
      expect(defaults.style.getPropertyValue("--_m-transfer-scheme").trim()).toBe("light")
      for (const role of ["color", "title", "extra", "panel", "border", "control", "control-border"]) {
        expect(defaults.style.getPropertyValue(`--_m-transfer-${role}`).trim()).toBe("initial")
      }
      expect(defaults.style.getPropertyValue("--_m-transfer-disabled").trim()).toBe("GrayText")
      expect(Array.from({ length: defaults.style.length }, (_, i) => defaults.style[i])
        .every(name => name.startsWith("--_m-transfer-"))).toBe(true)
      const forced = media.find(rule => rule.media.mediaText.replace(/\s/g, "") === "(forced-colors:active)")!
      const disabled = [...forced.cssRules].find(rule => (rule as CSSStyleRule).style.color === "GrayText") as CSSStyleRule
      expect(disabled.selectorText).toContain("[data-transfer-action]")
      expect(disabled.selectorText).toContain("[data-transfer-count]")
      expect(disabled.selectorText).toContain(":has(>select:disabled")
      const combined = media.find(rule => rule.media.mediaText.replace(/\s/g, "") === "print,(forced-colors:active)")!
      expect((combined.cssRules[0] as CSSStyleRule).style.opacity).toBe("1")
    } finally { element.remove() }
  })
  it("preserves authored styles, native options and staged flags through styled moves and filters", () => {
    const { root, helper, item, source, target } = fixture()
    const css = readFileSync(join("src", "components", "transfer", "transfer.css"), "utf8")
    const style = document.createElement("style")
    style.textContent = css
    document.head.append(style)
    try {
      root.style.cssText = "--m-transfer-font-size:17px;--m-transfer-title-size:20px;--m-transfer-background:rgb(1,2,3);--m-transfer-list-padding:7px"
      const authored = root.getAttribute("style"), a = item("a"), fixed = item("fixed")
      a.selected = true
      root.dataset.transferSize = "large"
      helper.move(["a"], "target")
      helper.setFilter("target", "Item a")
      expect(item("a")).toBe(a)
      expect(a.parentElement).toBe(target)
      expect(a.selected).toBe(true)
      expect(item("fixed")).toBe(fixed)
      expect(fixed.disabled).toBe(true)
      expect(helper.value).toEqual(["fixed", "z", "a"])
      expect(source.name).toBe("")
      expect(target.name).toBe("")
      expect(root.getAttribute("style")).toBe(authored)
    } finally { style.remove() }
  })
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
    root.addEventListener("m:transfer-change", changed); root.addEventListener("m:transfer-stage", staged)
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
    const pane = source.parentElement!.parentElement!; pane.classList.add("m-select"); pane.setAttribute("data-select", ""); source.setAttribute("data-select-control", "")
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

describe("canonical Transfer ViewElement", () => {
  it("exports canonical own-tag ViewElement and registers m-transfer", () => {
    expect(transferApi.Transfer).toBe(Transfer)
    expect(transferApi.MTransfer).toBe(MTransfer)
    expect(MTransfer).toBe(Transfer)
    expect(transferApi.createTransfer).toBe(createTransfer)
    expect(typeof transferApi.registerTransfer).toBe("function")
    expect(Object.hasOwn(Transfer, "tag")).toBe(true)
    expect(Transfer.tag).toBe("m-transfer")
    expect(ViewElement.prototype.isPrototypeOf(Transfer.prototype)).toBe(true)
    expect(customElements.get("m-transfer")).toBe(Transfer)
    expect(Transfer.observedAttributes).toEqual(["source-title", "target-title", "disabled"])

    const define = vi.fn()
    expect(() => registerTransfer({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerTransfer()).not.toThrow()
  })

  it("handles sourceTitle, targetTitle, and disabled properties, attributes, and validation", () => {
    const element = new Transfer()
    expect(element.sourceTitle).toBe("")
    expect(element.targetTitle).toBe("")
    expect(element.disabled).toBe(false)

    // Valid property values
    element.sourceTitle = "Available"
    expect(element.sourceTitle).toBe("Available")
    expect(element.getAttribute("source-title")).toBe("Available")

    element.targetTitle = "Selected"
    expect(element.targetTitle).toBe("Selected")
    expect(element.getAttribute("target-title")).toBe("Selected")

    element.disabled = true
    expect(element.disabled).toBe(true)
    expect(element.hasAttribute("disabled")).toBe(true)

    // Setting null / false removes attribute
    element.sourceTitle = null
    expect(element.sourceTitle).toBe("")
    expect(element.hasAttribute("source-title")).toBe(false)

    element.targetTitle = null
    expect(element.targetTitle).toBe("")
    expect(element.hasAttribute("target-title")).toBe(false)

    element.disabled = false
    expect(element.disabled).toBe(false)
    expect(element.hasAttribute("disabled")).toBe(false)

    // Attribute changes reflect to properties
    element.setAttribute("source-title", "Left")
    expect(element.sourceTitle).toBe("Left")
    element.removeAttribute("source-title")
    expect(element.sourceTitle).toBe("")

    element.setAttribute("target-title", "Right")
    expect(element.targetTitle).toBe("Right")
    element.removeAttribute("target-title")
    expect(element.targetTitle).toBe("")

    element.setAttribute("disabled", "")
    expect(element.disabled).toBe(true)
    element.removeAttribute("disabled")
    expect(element.disabled).toBe(false)

    // Invalid property assignments throw RangeError
    expect(() => { (element as any).sourceTitle = 123 }).toThrow(RangeError)
    expect(() => { (element as any).targetTitle = 456 }).toThrow(RangeError)
    expect(() => { (element as any).disabled = "invalid" }).toThrow(RangeError)
  })

  it("replays pre-upgrade properties upon connection", () => {
    const element = document.createElement("m-transfer") as Transfer
    Object.defineProperty(element, "sourceTitle", { configurable: true, value: "Pre Source" })
    Object.defineProperty(element, "targetTitle", { configurable: true, value: "Pre Target" })
    Object.defineProperty(element, "disabled", { configurable: true, value: true })
    document.body.append(element)

    expect(element.sourceTitle).toBe("Pre Source")
    expect(element.targetTitle).toBe("Pre Target")
    expect(element.disabled).toBe(true)
    expect(element.getAttribute("source-title")).toBe("Pre Source")
    expect(element.getAttribute("target-title")).toBe("Pre Target")
    expect(element.hasAttribute("disabled")).toBe(true)
  })

  it("renders default double-column structure and synchronizes titles", () => {
    const element = document.createElement("m-transfer") as Transfer
    element.sourceTitle = "Source List"
    element.targetTitle = "Target List"
    document.body.append(element)

    const sourceTitle = element.querySelector("[data-transfer-title='source']")
    const targetTitle = element.querySelector("[data-transfer-title='target']")
    expect(sourceTitle?.textContent).toBe("Source List")
    expect(targetTitle?.textContent).toBe("Target List")

    element.sourceTitle = "New Source"
    element.targetTitle = "New Target"
    expect(sourceTitle?.textContent).toBe("New Source")
    expect(targetTitle?.textContent).toBe("New Target")
  })

  it("moves items between panes and emits m:change event with target values", () => {
    const element = document.createElement("m-transfer") as Transfer
    element.innerHTML = `
      <option value="1">Item 1</option>
      <option value="2">Item 2</option>
      <option value="3">Item 3</option>
    `
    document.body.append(element)

    const sourceSelect = element.querySelector<HTMLSelectElement>("select[data-transfer-source]")!
    const targetSelect = element.querySelector<HTMLSelectElement>("select[data-transfer-target]")!
    expect(sourceSelect.options).toHaveLength(3)
    expect(targetSelect.options).toHaveLength(0)

    const change = vi.fn()
    element.addEventListener("m:change", change)

    // Select items 1 and 2, moveToTarget
    sourceSelect.options[0]!.selected = true
    sourceSelect.options[1]!.selected = true
    element.moveToTarget()

    expect(sourceSelect.options).toHaveLength(1)
    expect(targetSelect.options).toHaveLength(2)
    expect([...targetSelect.options].map(o => o.value)).toEqual(["1", "2"])
    expect(change).toHaveBeenCalledTimes(1)
    const event1 = change.mock.calls[0]![0] as CustomEvent<TransferChangeDetail>
    expect(event1.detail).toEqual({ value: ["1", "2"] })
    expect(event1.bubbles).toBe(true)
    expect(event1.cancelable).toBe(false)
    expect(event1.composed).toBe(false)

    // Select item 1 in target, moveToSource
    targetSelect.options[0]!.selected = true
    element.moveToSource()

    expect(sourceSelect.options).toHaveLength(2)
    expect(targetSelect.options).toHaveLength(1)
    expect([...targetSelect.options].map(o => o.value)).toEqual(["2"])
    expect(change).toHaveBeenCalledTimes(2)
    const event2 = change.mock.calls[1]![0] as CustomEvent<TransferChangeDetail>
    expect(event2.detail).toEqual({ value: ["2"] })

    // moveAllToTarget
    element.moveAllToTarget()
    expect(sourceSelect.options).toHaveLength(0)
    expect(targetSelect.options).toHaveLength(3)
    expect([...targetSelect.options].map(o => o.value)).toEqual(["2", "3", "1"])
    expect(change).toHaveBeenCalledTimes(3)

    // moveAllToSource
    element.moveAllToSource()
    expect(sourceSelect.options).toHaveLength(3)
    expect(targetSelect.options).toHaveLength(0)
    expect(change).toHaveBeenCalledTimes(4)
    expect(change.mock.calls[3]![0].detail).toEqual({ value: [] })
  })

  it("triggers moves via action buttons in the DOM", () => {
    const element = document.createElement("m-transfer") as Transfer
    element.innerHTML = `
      <option value="a">A</option>
      <option value="b">B</option>
    `
    document.body.append(element)

    const sourceSelect = element.querySelector<HTMLSelectElement>("select[data-transfer-source]")!
    const targetSelect = element.querySelector<HTMLSelectElement>("select[data-transfer-target]")!
    const addAllBtn = element.querySelector<HTMLButtonElement>("button[data-transfer-action='add-all']")!
    const removeAllBtn = element.querySelector<HTMLButtonElement>("button[data-transfer-action='remove-all']")!

    addAllBtn.click()
    expect(targetSelect.options).toHaveLength(2)
    expect(sourceSelect.options).toHaveLength(0)

    removeAllBtn.click()
    expect(sourceSelect.options).toHaveLength(2)
    expect(targetSelect.options).toHaveLength(0)
  })

  it("filters items based on filter input", () => {
    const element = document.createElement("m-transfer") as Transfer
    element.innerHTML = `
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
    `
    document.body.append(element)

    const sourceSelect = element.querySelector<HTMLSelectElement>("select[data-transfer-source]")!
    const filterInput = element.querySelector<HTMLInputElement>("input[data-transfer-filter='source']")!

    filterInput.value = "app"
    filterInput.dispatchEvent(new Event("input", { bubbles: true }))

    expect(sourceSelect.options[0]!.hidden).toBe(false)
    expect(sourceSelect.options[1]!.hidden).toBe(true)

    filterInput.value = ""
    filterInput.dispatchEvent(new Event("input", { bubbles: true }))

    expect(sourceSelect.options[0]!.hidden).toBe(false)
    expect(sourceSelect.options[1]!.hidden).toBe(false)
  })

  it("disables internal controls and blocks moves when disabled is true", () => {
    const element = document.createElement("m-transfer") as Transfer
    element.innerHTML = `<option value="1">Item 1</option>`
    element.disabled = true
    document.body.append(element)

    const sourceSelect = element.querySelector<HTMLSelectElement>("select[data-transfer-source]")!
    const targetSelect = element.querySelector<HTMLSelectElement>("select[data-transfer-target]")!
    const addBtn = element.querySelector<HTMLButtonElement>("button[data-transfer-action='add']")!

    expect(sourceSelect.disabled).toBe(true)
    expect(targetSelect.disabled).toBe(true)
    expect(addBtn.disabled).toBe(true)

    const change = vi.fn()
    element.addEventListener("m:change", change)

    sourceSelect.options[0]!.selected = true
    addBtn.click()
    element.moveToTarget()

    expect(sourceSelect.options).toHaveLength(1)
    expect(targetSelect.options).toHaveLength(0)
    expect(change).not.toHaveBeenCalled()

    // Enable again
    element.disabled = false
    expect(sourceSelect.disabled).toBe(false)
    expect(targetSelect.disabled).toBe(false)
    expect(addBtn.disabled).toBe(false)

    element.moveToTarget()
    expect(targetSelect.options).toHaveLength(1)
    expect(change).toHaveBeenCalledTimes(1)
  })

  it("exposes MarkupUITransfer global", async () => {
    await import("../src/components/transfer/global.js")
    const globalApi = (globalThis as any).MarkupUITransfer
    expect(globalApi).toBeDefined()
    expect(globalApi.Transfer.tag).toBe("m-transfer")
    expect(globalApi.MTransfer).toBe(globalApi.Transfer)
    expect(typeof globalApi.createTransfer).toBe("function")
    expect(typeof globalApi.registerTransfer).toBe("function")
  })

  it("renders API documentation in demo element", async () => {
    const { renderComponentApi } = await import("../demo/component-api.js")
    const docs = JSON.parse(readFileSync(join("demo", "api", "transfer.json"), "utf8"))
    const container = document.createElement("div")
    renderComponentApi(container, docs.elements)
    expect(container.textContent).toContain("Transfer")
    expect(container.textContent).toContain("m-transfer")
    expect(container.textContent).toContain("source-title")
    expect(container.textContent).toContain("target-title")
    expect(container.textContent).toContain("m:change")
  })

  it("validates demo page structure and links", () => {
    const demoHtml = readFileSync(join("demo", "components", "transfer.html"), "utf8")
    expect(demoHtml).toContain("data-demo-page")
    expect(demoHtml).toContain('class="component-docs"')
    expect(demoHtml).toContain("<h1>Transfer</h1>")
    expect(demoHtml).toContain('href="#basic-heading"')
    expect(demoHtml).toContain('href="#required-files"')
    expect(demoHtml).toContain('href="#api-heading"')
    expect(demoHtml).toContain('id="required-files"')
    expect(demoHtml).toContain("data-demo-preview")
    expect(demoHtml).toContain('id="transfer-api"')
  })
})

