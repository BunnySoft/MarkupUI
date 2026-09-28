import { afterEach, describe, expect, it, vi } from "vitest"
import { TreeSelect } from "../src/components/tree-select/index.js"

const items = () => [{ value: "docs", label: "Documents", children: [
  { value: "readme", label: "README" }, { value: "notes", label: "Notes" },
] }, { value: "other", label: "Other" }]
const wait = () => new Promise(resolve => setTimeout(resolve, 25))
function fixture(multiple = false) {
  const element = new TreeSelect(), form = document.createElement("form")
  element.multiple = multiple; element.filterable = multiple; element.options = items()
  element.name = "files"; element.required = true; element.clearable = true
  form.append(element); document.body.append(form)
  return { element, form, control: element.native! }
}
afterEach(() => document.body.replaceChildren())

describe("portable Tree Select mapping", () => {
  it("maps portable data to native paths and never invents unknown choices", () => {
    const { element, control, form } = fixture()
    element.value = "readme"
    expect(element.state.paths).toEqual([["docs", "readme"]])
    expect(control.selectedOptions[0]!.textContent).toBe("Documents / README")
    expect(new FormData(form).getAll("files")).toEqual(["readme"])
    expect(() => { element.value = "unknown" }).toThrow()
    expect(element.value).toBe("readme")
    expect([...control.options].some(option => option.value === "unknown")).toBe(false)
  })
  it("exposes independent multiple values without cascading checks", () => {
    const { element, form } = fixture(true)
    element.value = ["readme", "docs"]
    expect(element.value).toEqual(["docs", "readme"])
    expect(new FormData(form).getAll("files")).toEqual(["docs", "readme"])
    expect(() => { element.value = "readme" }).toThrow()
    expect(() => { element.value = ["readme", "readme"] }).toThrow()
  })
  it("preserves authored nodes, native identity, current/default values and unavailable defaults on reconnect", async () => {
    const { element, control, form } = fixture(true)
    const content = document.createElement("m-span"), listener = vi.fn()
    content.textContent = "Help"; content.addEventListener("custom", listener); element.prepend(content)
    element.defaultValue = ["readme", "notes"]; element.value = ["other"]
    element.options = [items()[0]!, { value: "other", label: "Other" }]
    element.options = [{ value: "notes", label: "Notes" }, { value: "other", label: "Other" }]
    expect(element.state.unavailableDefaultKeys).toEqual(["readme"])
    element.remove(); form.append(element)
    expect(element.native).toBe(control); expect(element.value).toEqual(["other"])
    expect(element.state.unavailableDefaultKeys).toEqual(["readme"])
    expect(element.contains(content)).toBe(true); content.dispatchEvent(new Event("custom")); expect(listener).toHaveBeenCalledOnce()
    form.reset(); await wait(); expect(element.value).toEqual(["notes"])
  })
  it("does not retain source-derived disabled flags as permanent option overrides on reconnect", () => {
    const { element } = fixture()
    element.options = [{ value: "readme", label: "README", disabled: true }]
    element.remove()
    element.options = [{ value: "readme", label: "README" }]
    document.body.append(element)
    element.value = "readme"
    expect(element.value).toBe("readme")
  })
  it("keeps explicit native disabled overrides through reconnect", () => {
    const { element, control, form } = fixture()
    control.querySelector<HTMLOptionElement>('option[value="notes"]')!.disabled = true
    element.refresh(); element.remove(); form.append(element)
    expect(() => { element.value = "notes" }).toThrow()
  })
  it("honors cancellation, native focus, disabled submission and silent writes", async () => {
    const { element, control, form } = fixture()
    const listener = vi.fn(); element.addEventListener("m:tree-select-change", listener)
    element.defaultValue = "readme"; element.value = "notes"
    element.focus(); expect(document.activeElement).toBe(control)
    const clear = element.querySelector<HTMLButtonElement>("[data-tree-select-clear]")!
    clear.addEventListener("click", event => event.preventDefault(), { once: true }); clear.click()
    await wait(); expect(element.value).toBe("notes")
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset()
    await wait(); expect(element.value).toBe("notes"); expect(listener).not.toHaveBeenCalled()
    element.disabled = true; expect(new FormData(form).getAll("files")).toEqual([])
    expect(element.clear()).toBe(false)
    element.disabled = false; expect(element.clear()).toBe(true)
    expect(element.value).toBeNull(); expect(form.checkValidity()).toBe(false)
    expect(listener).toHaveBeenCalledOnce()
  })
  it("retains selected nonmatches and filter drafts across scalar presentation writes", () => {
    const { element, control } = fixture(true)
    element.value = ["readme"]; element.setFilter("Other")
    element.label = "Files"
    expect(control.selectedOptions[0]!.hidden).toBe(false)
    expect(element.querySelector<HTMLInputElement>("[data-select-filter]")!.value).toBe("Other")
    expect(element.value).toEqual(["readme"])
  })
  it("validates options atomically, including bounds and unsupported lazy data", () => {
    const { element, control } = fixture()
    element.value = "readme"
    const options = element.options, option = control.selectedOptions[0]
    for (const data of [[{ value: "a", label: "A", lazy: true }], [{ value: "a", label: "" }],
      [{ value: "a", label: "A" }, { value: "a", label: "B" }]]) expect(() => { element.options = data }).toThrow()
    expect(element.options).toBe(options); expect(element.value).toBe("readme"); expect(control.selectedOptions[0]).toBe(option)
  })
  it("accepts JSON data, multiple/default keys regardless of initial attribute order", () => {
    const holder = document.createElement("div")
    holder.innerHTML = `<m-tree-select value='["readme"]' default-value='["notes"]' multiple options='${JSON.stringify(items())}'></m-tree-select>`
    document.body.append(holder)
    const element = holder.firstElementChild as TreeSelect
    expect(element.value).toEqual(["readme"]); expect(element.defaultValue).toEqual(["notes"])
  })
})
