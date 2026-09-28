import { afterEach, describe, expect, it, vi } from "vitest"
import { Cascader } from "../src/components/cascader/index.js"
import type { CascaderItem, CascaderLoadResult } from "../src/components/cascader/index.js"

const wait = () => new Promise(resolve => setTimeout(resolve, 20))
const data = (): CascaderItem[] => [
  { value: "eu", label: "Europe", children: [{ value: "fr", label: "France", children: [{ value: "paris", label: "Paris" }, { value: "lyon", label: "Lyon" }] }] },
  { value: "us", label: "United States", children: [{ value: "nyc", label: "New York" }] },
  { value: "island", label: "Island" }, { value: "lazy", label: "Remote", lazy: true },
  { value: "blocked", label: "Disabled", disabled: true },
]
function fixture(defaultValue?: string) {
  const form = document.createElement("form"), element = new Cascader()
  element.options = data(); element.name = "path"; element.clearable = true; element.required = true
  if (defaultValue) element.defaultValue = defaultValue
  form.append(element); document.body.append(form)
  const change = (index: number, value: string) => {
    element.controls[index]!.value = value; element.controls[index]!.dispatchEvent(new Event("change", { bubbles: true }))
  }
  return { form, element, change }
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("portable Cascader integration", () => {
  it("keeps partial paths explicit and uses only native form/focus owners", () => {
    const { element, form, change } = fixture()
    expect(element.path).toEqual([]); expect(element.value).toBeNull()
    expect(element.hasAttribute("role")).toBe(false); expect(element.hasAttribute("tabindex")).toBe(false)
    expect(element.querySelector("fieldset > legend")?.textContent).toBe("Location")
    change(0, "eu")
    expect(element.path).toEqual(["eu"]); expect(element.value).toBeNull()
    expect(element.controls[1]?.value).toBe(""); expect(form.checkValidity()).toBe(false)
    change(1, "fr"); change(2, "paris")
    expect(element.value).toBe("paris"); expect(form.checkValidity()).toBe(true)
    expect(new FormData(form).getAll("path")).toEqual(["eu", "fr", "paris"])
    change(0, "us")
    expect(element.path).toEqual(["us"]); expect(element.controls[2]?.disabled).toBe(true)
  })
  it("retains default descendants and current path through reconnect and native reset", async () => {
    const { element, form } = fixture("paris")
    const controls = [...element.controls], labels = controls.map(control => control.labels![0])
    element.value = "nyc"; element.remove(); form.append(element)
    expect(element.value).toBe("nyc"); expect(element.defaultValue).toBe("paris")
    expect(element.controls).toEqual(controls)
    expect(element.controls.map(control => control.labels![0])).toEqual(labels)
    form.reset(); expect(element.state.pending).toBe(true); await wait()
    expect(element.value).toBe("paris")
    element.value = "nyc"; form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await wait()
    expect(element.value).toBe("nyc")
  })
  it("does not replay removed or unloaded keys after a detached data edit", async () => {
    const { element, form } = fixture("paris")
    element.value = "nyc"; element.remove()
    element.options = [{ value: "other", label: "Other" }]
    form.append(element)
    expect(element.connected).toBe(true); expect(element.value).toBeNull(); expect(element.state.defaultValid).toBe(false)
    form.reset(); await wait()
    expect(form.checkValidity()).toBe(false)
    element.defaultValue = "other"; element.value = "other"
    expect(form.checkValidity()).toBe(true)
  })
  it("uses JSON attributes without HTML parsing or live Tree registration", () => {
    const element = new Cascader()
    element.setAttribute("options", JSON.stringify([{ value: "literal", label: "<img src=x>" }]))
    document.body.append(element)
    expect(element.controls[0]?.options[1]?.textContent).toBe("<img src=x>")
    expect(element.querySelector("img")).toBeNull()
    expect(customElements.get("m-tree")).toBeUndefined()
    expect(customElements.get("m-select")).toBeUndefined()
  })
  it("keeps immutable data, scalar control identity and native disabled overrides", () => {
    const values = data(), { element } = fixture("paris"), controls = [...element.controls]
    element.options = values; values[0]!.label = "Changed outside"
    expect(element.options[0]?.label).toBe("Europe")
    expect(Object.isFrozen(element.options[0]?.children)).toBe(true)
    const option = controls[2]!.selectedOptions[0]
    element.separator = " > "; element.showPath = false; element.label = "Destination"; element.name = "places"; element.placeholder = "Select"
    expect(element.controls).toEqual(controls); expect(controls[2]!.selectedOptions[0]).toBe(option)
    expect(element.querySelector("[data-cascader-path]")?.textContent).toBe("Paris")
    controls[1]!.disabled = true; element.refresh(); element.disabled = true; element.disabled = false
    expect(controls[1]!.disabled).toBe(true); expect(controls[0]!.matches(":disabled")).toBe(false)
  })
  it("validates data and key writes before touching the live selection", () => {
    const { element } = fixture("paris"), before = element.options, controls = [...element.controls]
    for (const value of [null, {}, Array(1), [{ value: "x", label: "X" }, { value: "x", label: "Y" }],
      [{ value: "x", label: "X", disabled: "false" }], [{ value: "x", label: "X", children: null }]]) {
      expect(() => { element.options = value as never }).toThrow()
      expect(element.options).toBe(before); expect(element.controls).toEqual(controls)
      expect(element.value).toBe("paris")
    }
    expect(() => { element.value = "eu" }).toThrow()
    expect(() => { element.path = ["fr"] }).toThrow()
    expect(() => { element.path = ["blocked"] }).toThrow()
    expect(element.value).toBe("paris")
    element.selection = "any"; element.value = "eu"; expect(element.state.complete).toBe(true)
  })
  it("clears replaced empty data and preserves authored siblings", () => {
    const { element } = fixture("paris"), sibling = document.createElement("m-p"), listener = vi.fn()
    sibling.textContent = "Original"; sibling.addEventListener("click", listener); element.append(sibling)
    const controls = [...element.controls]
    element.options = []
    expect(element.path).toEqual([]); expect(element.controls).toEqual(controls)
    expect(element.controls[0]?.options).toHaveLength(1)
    expect(element.lastElementChild).toBe(sibling); sibling.click(); expect(listener).toHaveBeenCalledOnce()
  })
  it("emits one bubbling event for changes, respects canceled clear and superseding writes", async () => {
    const { element, form, change } = fixture(), listener = vi.fn()
    form.addEventListener("m:cascader-change", listener)
    element.value = "paris"; element.refresh(); expect(listener).not.toHaveBeenCalled()
    change(0, "us"); expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0]![0].target).toBe(element)
    const clear = element.querySelector<HTMLButtonElement>("[data-cascader-clear]")!
    form.addEventListener("click", event => event.preventDefault(), { once: true })
    clear.click(); await wait(); expect(element.path).toEqual(["us"])
    clear.click(); element.value = "paris"; await wait(); expect(element.value).toBe("paris")
    element.disabled = true; expect(element.clear()).toBe(false)
  })
  it("keeps pending data loads through presentation changes and maps results inside the transaction", async () => {
    const { element } = fixture()
    let finish!: (result: CascaderLoadResult) => void, signal!: AbortSignal
    element.load = (_, context) => { signal = context.signal; return new Promise(resolve => { finish = resolve }) }
    element.path = ["lazy"]; const pending = element.loadChildren()
    element.separator = " > "; element.label = "Place"; element.showPath = false; element.clearable = false
    expect(signal.aborted).toBe(false)
    finish({ nodes: [{ value: "child", label: "Child" }] })
    expect(await pending).toBe(true); expect(element.path).toEqual(["lazy"]); expect(element.value).toBeNull()
    element.value = "child"; expect(element.path).toEqual(["lazy", "child"])
  })
  it("aborts disabled/replaced/disconnected loads and disposes late results exactly once", async () => {
    const { element, form } = fixture()
    let finish!: (result: CascaderLoadResult) => void, signal!: AbortSignal
    const dispose = vi.fn()
    element.load = (_, context) => { signal = context.signal; return new Promise(resolve => { finish = resolve }) }
    element.path = ["lazy"]; const pending = element.loadChildren()
    element.disabled = true
    expect(await pending).toBe(false); expect(signal.aborted).toBe(true)
    finish({ nodes: [{ value: "late", label: "Late" }], dispose }); await wait()
    expect(dispose).toHaveBeenCalledOnce()
    element.disabled = false
    element.load = () => ({ nodes: [{ value: "child", label: "Child" }], dispose })
    await element.loadChildren(); element.value = "child"; element.remove(); form.append(element)
    expect(element.path).toEqual(["lazy"]); expect(dispose).toHaveBeenCalledTimes(2)
    expect(element.value).toBeNull()
  })
  it("rejects malformed lazy data and keeps failure settlement and cleanup", async () => {
    const { element } = fixture(), dispose = vi.fn()
    element.path = ["lazy"]
    element.load = () => ({ nodes: [{ value: "eu", label: "Duplicate" }], dispose })
    await expect(element.loadChildren()).rejects.toThrow("unique")
    expect(dispose).toHaveBeenCalledOnce(); expect(element.state.pending).toBe(false)
    let reject!: (error: Error) => void
    element.load = () => new Promise((_, fail) => { reject = fail })
    const pending = element.loadChildren().catch(error => error)
    await wait()
    reject(new Error("Rejected")); element.querySelector("[data-cascader]")!.setAttribute("role", "tree")
    expect(await pending).toBeInstanceOf(AggregateError)
  })
})
