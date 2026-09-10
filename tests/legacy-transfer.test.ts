import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { connectExample } from "../demo/components/legacy-transfer.js"

const html = readFileSync(resolve("demo", "components", "legacy-transfer.html"), "utf8")
const connections: ReturnType<typeof connectExample>[] = []
const wait = () => new Promise(resolve => setTimeout(resolve, 25))
function fixture(bind = true) {
  const parsed = new DOMParser().parseFromString(html, "text/html")
  document.body.append(document.importNode(parsed.querySelector("#legacy-transfer-example")!, true))
  const root = document.querySelector<HTMLElement>("#legacy-transfer-example")!, form = root.querySelector<HTMLFormElement>("form")!
  const connection = bind ? connectExample(root) : null
  if (connection) connections.push(connection)
  const transfer = connection?.transfer
  const item = (key: string) => [...root.querySelectorAll<HTMLOptionElement>("option")].find(option => option.value === key)!
  const click = (selector: string) => root.querySelector<HTMLButtonElement>(selector)!.click()
  return { root, form, connection: connection!, transfer: transfer!, item, click }
}
function formData(form: HTMLFormElement) {
  const data = new FormData(form)
  form.dispatchEvent(new FormDataEvent("formdata", { formData: data }))
  return data
}
beforeEach(() => {
  vi.stubGlobal("FormDataEvent", class extends Event {
    formData: FormData
    constructor(type: string, init: { formData: FormData }) { super(type); this.formData = init.formData }
  })
})
afterEach(() => {
  connections.splice(0).forEach(connection => connection.disconnect())
  document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals()
})

describe("Legacy Transfer explicit replacement using the shipped helper", () => {
  it("loads existing ESM/CSS only, with no deprecated export, source or distribution", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8")), manifest = JSON.parse(readFileSync(resolve("dist", "manifest.json"), "utf8"))
    const script = readFileSync(resolve("demo", "components", "legacy-transfer.js"), "utf8")
    expect(script).toContain('import { createTransfer } from "../../dist/markup-ui-transfer.js"')
    expect(html).toContain("../../dist/markup-ui-transfer.css")
    expect(pkg.exports["./transfer"].import).toBe("./dist/markup-ui-transfer.js")
    expect(pkg.exports["./legacy-transfer"]).toBeUndefined()
    expect(pkg.dependencies).toEqual({})
    expect(existsSync(resolve("src", "components", "legacy-transfer"))).toBe(false)
    expect(Object.keys(manifest.bundles).some(name => name.includes("legacy-transfer"))).toBe(false)
    expect(script).not.toMatch(/innerHTML|createElement|fetch\(|localStorage|setInterval|requestAnimationFrame/)
  })
  it("keeps an honest static no-JS anatomy with no named staging or visible dead controls", () => {
    const { root, form } = fixture(false)
    const selects = [...root.querySelectorAll("select")]
    expect(selects).toHaveLength(2)
    expect(selects.every(select => select.multiple && !select.name && !select.required && select.labels!.length > 0)).toBe(true)
    expect([...root.querySelectorAll<HTMLElement>("[data-demo-enhanced], [data-transfer-action]")].every(node => node.hidden)).toBe(true)
    expect(new FormData(form).has("reviewers[]")).toBe(false)
    expect(root.querySelector('input[type="hidden"], button[type="submit"], [role="listbox"]')).toBeNull()
  })
  it("separates captured target/default membership from native source highlights", () => {
    const { transfer } = fixture()
    expect(transfer.value).toEqual(["core", "reader"])
    expect(transfer.state.defaultValue).toEqual(["core", "reader"])
    expect(transfer.state.stagedSource).toEqual(["alpha"])
    expect(transfer.state.stagedTarget).toEqual([])
  })
  it("moves original options in origin order and preserves labels/listeners without outside focus changes", () => {
    const { root, transfer, item } = fixture(), alpha = item("alpha"), listener = vi.fn()
    alpha.addEventListener("author-probe", listener)
    const input = root.querySelector<HTMLInputElement>("#project-name")!; input.focus()
    transfer.move(["gamma", "alpha"], "target")
    expect(transfer.value).toEqual(["core", "reader", "alpha", "gamma"])
    expect(item("alpha")).toBe(alpha); expect(alpha.parentElement).toBe(transfer.target)
    alpha.dispatchEvent(new Event("author-probe")); expect(listener).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(input)
  })
  it("filters labels without removing hidden membership/highlights or bypassing locks", () => {
    const { transfer, item } = fixture()
    item("beta").selected = true; transfer.setFilter("source", "Beta")
    expect(item("alpha").hidden).toBe(true); expect(item("alpha").selected).toBe(true)
    transfer.moveSelected("target")
    expect(transfer.value).toEqual(["core", "reader", "beta"])
    transfer.setFilter("target", "Beta"); transfer.moveAll("source")
    expect(transfer.value).toEqual(["core", "reader"])
    expect(() => transfer.move(["core"], "source")).toThrow()
    expect(() => transfer.move(["locked-source"], "target")).toThrow()
  })
  it("delivers one native-helper membership event after a real button action and focuses the destination", async () => {
    const { root, transfer, click } = fixture(), movement = vi.fn()
    root.querySelector("[data-transfer]")!.addEventListener("mui:transfer-change", movement)
    await wait()
    click('[data-transfer-action="add"]'); await wait()
    expect(transfer.value).toEqual(["core", "reader", "alpha"])
    expect(movement).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(transfer.target)
    click('[data-transfer-action="clear-target"]'); await wait()
    expect(transfer.value).toEqual(["core", "reader", "alpha"])
    expect(transfer.state.stagedTarget).toEqual([])
  })
  it("serializes all target members, including locked/hidden/unhighlighted, through the owned formdata event", () => {
    const { transfer, form, root } = fixture()
    transfer.setFilter("target", "no matches")
    expect(transfer.target.selectedOptions).toHaveLength(0)
    expect(formData(form).getAll("reviewers[]")).toEqual(["core", "reader"])
    expect(formData(form).get("project")).toBe("Local project")
    expect(root.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
    expect(() => transfer.appendTo(formData(form), "reviewers[]")).toThrow()
  })
  it("distinguishes native pane disabling from locked member options", () => {
    const { click, transfer, form } = fixture()
    click("#disable-membership")
    expect(transfer.state.disabled).toBe(true); expect(transfer.value).toEqual(["core", "reader"])
    expect(formData(form).getAll("reviewers[]")).toEqual([])
    click("#disable-membership")
    expect(formData(form).getAll("reviewers[]")).toEqual(["core", "reader"])
  })
  it("sets exact order silently and changes future reset membership without immediately changing current values", async () => {
    const { root, click, transfer, item } = fixture(), movement = vi.fn()
    root.querySelector("[data-transfer]")!.addEventListener("mui:transfer-change", movement)
    click("#set-value"); expect(transfer.value).toEqual(["core", "beta", "alpha"])
    click("#set-defaults"); expect(transfer.value).toEqual(["core", "beta", "alpha"])
    expect(transfer.state.defaultValue).toEqual(["core", "gamma"])
    click("#reset-membership"); await wait()
    expect(transfer.value).toEqual(["core", "gamma"])
    expect(item("alpha").defaultSelected).toBe(true); expect(item("alpha").selected).toBe(true)
    expect(transfer.state.stagedSource).toEqual(["alpha"])
    expect(movement).not.toHaveBeenCalled()
  })
  it("resets native field/filter defaults and restores captured initial membership", async () => {
    const { root, transfer, click } = fixture()
    transfer.move(["beta"], "target"); transfer.setFilter("source", "Gamma")
    root.querySelector<HTMLInputElement>("#project-name")!.value = "Edited"
    click("#reset-membership"); await wait()
    expect(transfer.value).toEqual(["core", "reader"])
    expect(root.querySelector<HTMLInputElement>("#project-name")!.value).toBe("Local project")
    expect(root.querySelector<HTMLInputElement>("#source-filter")!.value).toBe("")
  })
  it("hands off current native membership and releases serialization/default-reset/listeners with safe focus", async () => {
    const { root, transfer, connection, form } = fixture()
    transfer.move(["beta"], "target")
    const members = [...transfer.target.options], button = root.querySelector<HTMLButtonElement>("#disconnect")!
    button.focus(); button.click()
    expect(transfer.connected).toBe(false); expect(document.activeElement).toBe(root.querySelector("#project-name"))
    expect([...transfer.target.options]).toEqual(members)
    expect(formData(form).has("reviewers[]")).toBe(false)
    form.reset(); await wait(); expect([...transfer.target.options]).toEqual(members)
    expect([...root.querySelectorAll<HTMLElement>("[data-demo-enhanced], [data-transfer-action]")].every(node => node.hidden)).toBe(true)
    connection.disconnect()
  })
  it("surfaces actual FormData failure in jsdom instead of pretending highlighted options are membership", () => {
    const { root, click } = fixture()
    click("#preview")
    expect(root.querySelector("#demo-events")!.textContent).toContain("Native FormData membership did not match")
    expect(root.querySelector("#formdata-preview")!.textContent).toContain("No membership submission")
  })
})
