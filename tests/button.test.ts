import { afterEach, describe, expect, it, vi } from "vitest"
import { MuiButton, MuiButtonGroup, registerButton } from "../src/components/button/index.js"
import { registerElements } from "../src/components/elements.js"
import { installActions, registerAction } from "../src/actions/index.js"

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

function button(markup = "<mui-button>Action</mui-button>"): MuiButton {
  document.body.innerHTML = markup
  const element = document.querySelector("mui-button")
  if (!(element instanceof MuiButton)) throw new Error("Button was not upgraded")
  return element
}

describe("standalone Button", () => {
  it("adopts native buttons and preserves child identities and listeners", () => {
    const element = document.createElement("mui-button") as MuiButton
    const native = document.createElement("button")
    native.type = "button"
    const label = document.createElement("strong")
    label.textContent = "Save"
    native.append(label)
    const clicked = vi.fn()
    label.addEventListener("click", clicked)
    element.append(native)
    document.body.append(element)
    label.click()
    expect(clicked).toHaveBeenCalledOnce()
    expect(element.control).toBe(native)
    expect(native.firstChild).toBe(label)
    expect(element.hasAttribute("role")).toBe(false)
    expect(element.tabIndex).toBe(-1)
  })

  it("generates a type=button control without cloning authored content", () => {
    const element = document.createElement("mui-button") as MuiButton
    const label = document.createTextNode("Save")
    element.append(label)
    document.body.append(element)
    expect(element.control).toBeInstanceOf(HTMLButtonElement)
    expect(element.control?.getAttribute("type")).toBe("button")
    expect(element.control?.firstChild).toBe(label)
    expect(element.querySelectorAll("button")).toHaveLength(1)
  })

  it("adopts late parser content and native controls without nesting buttons", async () => {
    const element = button()
    const native = document.createElement("button")
    native.type = "reset"
    native.textContent = "Late"
    element.append(native)
    await Promise.resolve()
    expect(element.control).toBe(native)
    expect(native.textContent).toBe("ActionLate")
    expect(native.type).toBe("reset")
    expect(element.querySelectorAll("button")).toHaveLength(1)
    element.append(" appended")
    await Promise.resolve()
    expect(native.textContent).toBe("ActionLate appended")
  })

  it("preserves native default submit, validation, submitter and form data semantics", () => {
    const element = button('<form><input name="title" required><mui-button type="primary"><button name="action" value="save">Save</button></mui-button></form>')
    const form = document.querySelector("form")!
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault())
    form.addEventListener("submit", submit)
    element.click()
    expect(submit).not.toHaveBeenCalled()
    document.querySelector("input")!.value = "A"
    element.click()
    expect(submit).toHaveBeenCalledOnce()
    expect(submit.mock.calls[0]![0].submitter).toBe(element.control)
    expect((element.control as HTMLButtonElement).type).toBe("submit")
    expect(new FormData(form, element.control as HTMLButtonElement).get("action")).toBe("save")
  })

  it("forwards generated form attributes and uses a real external form owner", () => {
    const element = button('<form id="editor"><input name="title" value="A"></form><mui-button attr-type="submit" form="editor" name="action" value="save" formaction="/save" formmethod="post" formenctype="text/plain" formtarget="result" formnovalidate>Save</mui-button>')
    const native = element.control as HTMLButtonElement
    const form = document.querySelector("form")!
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault())
    form.addEventListener("submit", submit)
    expect(native.form).toBe(form)
    for (const name of ["name", "value", "formaction", "formmethod", "formenctype", "formtarget", "formnovalidate"]) {
      expect(native.getAttribute(name)).toBe(element.getAttribute(name))
    }
    element.click()
    expect(submit).toHaveBeenCalledOnce()
    expect(submit.mock.calls[0]![0].submitter).toBe(native)
    element.setAttribute("value", "publish")
    expect(native.value).toBe("publish")
  })

  it("resets native forms and restores authored type after removing an override", () => {
    const element = button('<form><input value="initial"><mui-button attr-type="button"><button type="reset">Reset</button></mui-button></form>')
    const input = document.querySelector("input")!
    input.value = "changed"
    element.click()
    expect(input.value).toBe("changed")
    element.removeAttribute("attr-type")
    element.click()
    expect(input.value).toBe("initial")
    element.attrType = "invalid"
    expect((element.control as HTMLButtonElement).type).toBe("button")
  })

  it("does not synthesize keyboard activation or cancel native key defaults", () => {
    const element = button()
    const click = vi.fn()
    element.addEventListener("click", click)
    for (const key of ["Enter", " "]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
      element.control!.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(click).not.toHaveBeenCalled()
    element.click()
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.calls[0]![0].target).toBe(element.control)
  })

  it("blocks disabled native, host, synthetic and descendant activation", () => {
    const element = button('<mui-button disabled><button type="button"><span>Save</span></button></mui-button>')
    const nativeClick = vi.fn()
    const hostClick = vi.fn()
    element.control!.addEventListener("click", nativeClick)
    element.addEventListener("click", hostClick)
    element.click()
    element.control!.click()
    const event = new MouseEvent("click", { bubbles: true, cancelable: true })
    element.querySelector("span")!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(nativeClick).not.toHaveBeenCalled()
    expect(hostClick).not.toHaveBeenCalled()
    element.disabled = false
    element.click()
    expect(nativeClick).toHaveBeenCalledOnce()
    expect(hostClick).toHaveBeenCalledOnce()
  })

  it("preserves authored disabled and ARIA states through loading and reconnect", () => {
    const element = button('<mui-button loading><button disabled aria-busy="false" aria-disabled="true" tabindex="2">Save</button></mui-button>')
    const native = element.control as HTMLButtonElement
    const spinner = native.querySelector("[data-mui-button-spinner]")
    expect(spinner?.getAttribute("aria-hidden")).toBe("true")
    expect(native.getAttribute("aria-busy")).toBe("true")
    element.remove()
    document.body.append(element)
    expect(native.querySelectorAll("[data-mui-button-spinner]")).toHaveLength(1)
    element.loading = false
    expect(native.disabled).toBe(true)
    expect(native.getAttribute("aria-busy")).toBe("false")
    expect(native.getAttribute("aria-disabled")).toBe("true")
    expect(native.querySelector("[data-mui-button-spinner]")).toBeNull()
  })

  it("restores authored labels and focus order when overrides are removed", () => {
    const element = button('<mui-button aria-label="Save document" aria-describedby="help" focusable="false"><button type="button" aria-label="Save" tabindex="3">S</button></mui-button>')
    const native = element.control!
    expect(native.getAttribute("aria-label")).toBe("Save document")
    expect(native.getAttribute("aria-describedby")).toBe("help")
    expect(native.tabIndex).toBe(-1)
    element.removeAttribute("aria-label")
    element.removeAttribute("aria-describedby")
    element.focusable = true
    expect(native.getAttribute("aria-label")).toBe("Save")
    expect(native.hasAttribute("aria-describedby")).toBe(false)
    expect(native.tabIndex).toBe(3)
  })

  it("delegates focus and blur without making the wrapper another tab stop", () => {
    const element = button()
    element.focus()
    expect(document.activeElement).toBe(element.control)
    element.blur()
    expect(document.activeElement).not.toBe(element.control)
    element.disabled = true
    element.focus()
    expect(document.activeElement).not.toBe(element.control)
    expect(element.hasAttribute("tabindex")).toBe(false)
  })

  it("retains live native attribute edits under temporary host overrides", async () => {
    const element = button('<mui-button loading attr-type="submit" aria-label="Override"><button type="reset" aria-label="Initial">Save</button></mui-button>')
    const native = element.control as HTMLButtonElement
    native.setAttribute("aria-label", "Updated")
    native.type = "button"
    native.removeAttribute("disabled")
    await Promise.resolve()
    expect(native.disabled).toBe(true)
    expect(native.type).toBe("submit")
    element.removeAttribute("attr-type")
    element.removeAttribute("aria-label")
    element.loading = false
    expect(native.type).toBe("button")
    expect(native.getAttribute("aria-label")).toBe("Updated")
    expect(native.disabled).toBe(false)
  })

  it("observes authored native disabled changes", async () => {
    const element = button()
    const native = element.control as HTMLButtonElement
    native.disabled = true
    await Promise.resolve()
    expect(native.getAttribute("aria-disabled")).toBe("true")
    native.disabled = false
    await Promise.resolve()
    expect(native.hasAttribute("aria-disabled")).toBe(false)
    expect(native.hasAttribute("tabindex")).toBe(false)
  })

  it("respects disabled fieldsets without implementing form association on the host", () => {
    const element = button('<form><fieldset disabled><mui-button attr-type="submit">Save</mui-button></fieldset></form>')
    const submit = vi.fn((event: Event) => event.preventDefault())
    document.querySelector("form")!.addEventListener("submit", submit)
    element.click()
    expect(submit).not.toHaveBeenCalled()
    expect(element.control!.hasAttribute("tabindex")).toBe(false)
    expect(element.control!.hasAttribute("aria-disabled")).toBe(false)
    document.querySelector("fieldset")!.disabled = false
    element.click()
    expect(submit).toHaveBeenCalledOnce()
  })

  it("uses authored anchors with native link attributes and suppresses disabled navigation", async () => {
    const element = button('<mui-button><a href="#destination" target="_blank" rel="noopener" download="file">Open</a></mui-button>')
    const native = element.control as HTMLAnchorElement
    expect(native.tagName).toBe("A")
    expect(native.target).toBe("_blank")
    expect(native.rel).toBe("noopener")
    expect(native.download).toBe("file")
    element.loading = true
    expect(native.hasAttribute("href")).toBe(false)
    expect(native.tabIndex).toBe(-1)
    expect(native.getAttribute("aria-disabled")).toBe("true")
    expect(native.getAttribute("role")).toBe("link")
    const aux = new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 })
    native.dispatchEvent(aux)
    expect(aux.defaultPrevented).toBe(true)
    native.href = "#updated"
    await Promise.resolve()
    expect(native.hasAttribute("href")).toBe(false)
    element.loading = false
    expect(native.getAttribute("href")).toBe("#updated")
    expect(native.hasAttribute("tabindex")).toBe(false)
    expect(native.hasAttribute("aria-disabled")).toBe(false)
    expect(native.hasAttribute("role")).toBe(false)
  })

  it("retains an authored link role while removing and restoring href", async () => {
    const element = button('<mui-button disabled><a href="#target" role="button">Open</a></mui-button>')
    const native = element.control!
    expect(native.getAttribute("role")).toBe("button")
    native.setAttribute("role", "menuitem")
    await Promise.resolve()
    element.disabled = false
    expect(native.getAttribute("role")).toBe("menuitem")
    expect(native.getAttribute("href")).toBe("#target")
  })

  it("preserves icon and text nodes and labels during repeated loading", () => {
    const element = button('<mui-button icon-placement="right" aria-label="Add"><button type="button"><span data-mui-button-icon aria-hidden="true">+</span><strong>Add</strong></button></mui-button>')
    const icon = element.querySelector("[data-mui-button-icon]")!
    const label = element.querySelector("strong")!
    for (let i = 0; i < 3; i++) {
      element.loading = true
      expect(element.querySelectorAll("[data-mui-button-spinner]")).toHaveLength(1)
      expect(element.control!.getAttribute("aria-busy")).toBe("true")
      element.loading = false
    }
    expect(element.querySelector("[data-mui-button-icon]")).toBe(icon)
    expect(element.querySelector("strong")).toBe(label)
    expect(element.control!.getAttribute("aria-label")).toBe("Add")
    expect(element.control!.hasAttribute("aria-busy")).toBe(false)
  })

  it("cleans up observers and capture listeners while disconnected", async () => {
    const element = button('<mui-button disabled>Save</mui-button>')
    const native = element.control as HTMLButtonElement
    element.remove()
    native.disabled = false
    const detached = new MouseEvent("click", { bubbles: true, cancelable: true })
    native.dispatchEvent(detached)
    await Promise.resolve()
    expect(detached.defaultPrevented).toBe(false)
    expect(native.disabled).toBe(false)
    document.body.append(element)
    expect(native.disabled).toBe(true)
    element.disabled = false
    const click = vi.fn()
    element.addEventListener("click", click)
    element.click()
    expect(click).toHaveBeenCalledOnce()
    expect(native.disabled).toBe(false)
  })

  it("replaces the native control and restores the old control's authored attributes", async () => {
    const element = button('<mui-button loading aria-label="Override"><button type="reset" aria-label="Original">Old</button></mui-button>')
    const old = element.control as HTMLButtonElement
    const next = document.createElement("button")
    next.type = "button"
    next.textContent = "New"
    element.replaceChildren(next)
    await Promise.resolve()
    expect(element.control).toBe(next)
    expect(old.disabled).toBe(false)
    expect(old.getAttribute("aria-label")).toBe("Original")
    expect(old.querySelector("[data-mui-button-spinner]")).toBeNull()
    expect(old.hasAttribute("data-mui-button-control")).toBe(false)
    expect(next.disabled).toBe(true)
    expect(next.getAttribute("aria-label")).toBe("Override")
  })

  it("upgrades pre-definition properties for Button and ButtonGroup", () => {
    document.body.innerHTML = '<test-late-button>Late</test-late-button><test-late-button-group></test-late-button-group>'
    const element = document.querySelector("test-late-button") as MuiButton
    Object.assign(element, { loading: true, attrType: "submit", type: "info", size: "large", iconPlacement: "right", focusable: false, bordered: false, round: true, secondary: true })
    const group = document.querySelector("test-late-button-group") as MuiButtonGroup
    Object.assign(group, { size: "small", vertical: true })
    customElements.define("test-late-button", class extends MuiButton {})
    customElements.define("test-late-button-group", class extends MuiButtonGroup {})
    expect(element.loading).toBe(true)
    expect(element.control?.getAttribute("type")).toBe("submit")
    expect(element.control?.getAttribute("tabindex")).toBe("-1")
    for (const [name, value] of [["type", "info"], ["size", "large"], ["icon-placement", "right"], ["bordered", "false"]]) {
      expect(element.getAttribute(name!)).toBe(value)
    }
    expect(element.round).toBe(true)
    expect(element.secondary).toBe(true)
    expect(group.size).toBe("small")
    expect(group.vertical).toBe(true)
  })

  it("reflects retained visual properties without injecting styles or shadow DOM", () => {
    const element = button()
    for (const name of ["block", "circle", "round", "strong", "secondary", "tertiary", "quaternary", "ghost", "dashed", "text"] as const) {
      element[name] = true
      expect(element.hasAttribute(name)).toBe(true)
      element[name] = false
      expect(element.hasAttribute(name)).toBe(false)
    }
    element.variant = "primary"
    expect(element.getAttribute("variant")).toBe("primary")
    expect(element.shadowRoot).toBeNull()
    expect(document.querySelector("style")).toBeNull()
  })

  it("preserves group content and native individual tab stops", () => {
    button('<mui-button-group size="small" vertical aria-label="Actions"><mui-button>One</mui-button><mui-button size="large">Two</mui-button></mui-button-group>')
    const group = document.querySelector("mui-button-group") as MuiButtonGroup
    const children = [...group.children]
    expect(group.getAttribute("role")).toBe("group")
    expect(group.getAttribute("aria-label")).toBe("Actions")
    group.vertical = false
    group.size = "large"
    group.remove()
    document.body.append(group)
    expect([...group.children]).toEqual(children)
    expect((children[0] as MuiButton).control?.tabIndex).toBe(0)
    expect(group.hasAttribute("tabindex")).toBe(false)
  })

  it("supports registration idempotence and rejects either legacy definition atomically", () => {
    expect(() => registerButton()).not.toThrow()
    for (const conflict of ["mui-button", "mui-button-group"]) {
      const define = vi.fn()
      expect(() => registerButton({
        get: (name) => name === conflict ? class extends HTMLElement {} : undefined,
        define,
      })).toThrow("before the legacy MarkupUI bundle")
      expect(define).not.toHaveBeenCalled()
    }
  })

  it("retains rich definitions when registering the aggregate and invokes delegated actions once", async () => {
    registerElements(customElements)
    expect(customElements.get("mui-button")).toBe(MuiButton)
    expect(customElements.get("mui-button-group")).toBe(MuiButtonGroup)
    const element = button('<mui-button mui-action="button.save">Save</mui-button>')
    const action = vi.fn()
    registerAction("button.save", action)
    const dispose = installActions(document.body)
    element.click()
    await Promise.resolve()
    expect(action).toHaveBeenCalledOnce()
    element.loading = true
    element.click()
    await Promise.resolve()
    expect(action).toHaveBeenCalledOnce()
    dispose()
  })
})
