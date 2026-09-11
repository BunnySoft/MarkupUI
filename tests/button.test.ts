import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { execFileSync } from "node:child_process"
import {
  MButton,
  MButtonGroup,
  buttonDefinition,
  buttonGroupDefinition,
  registerButton,
} from "../src/components/button/index.js"
import { registerElements } from "../src/components/elements.js"
import { installActions, registerAction } from "../src/actions/index.js"

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("audited Button styles", () => {
  const css = readFileSync("src/components/button/button.css", "utf8")
  const legacy = readFileSync("src/components/styles.css", "utf8")
  const normalizeCSS = (value: string) => value.replace(/\s+/g, "")
    .replace(/\[([\w-]+)="([\w-]+)"\]/g, "[$1=$2]").replace(/;}/g, "}")
  const containsCSS = (value: string) => expect(normalizeCSS(css)).toContain(normalizeCSS(value))

  it("keeps the accepted Button-only packaging transform within the unchanged distribution ceiling", () => {
    // esbuild needs Node's typed-array realm, not jsdom's mixed globals.
    const built = execFileSync(process.execPath, ["-e", `
      const fs = require("node:fs"), { transformSync } = require("esbuild");
      process.stdout.write(transformSync(fs.readFileSync(process.argv[1], "utf8"), {
        loader: "css", minifyWhitespace: true, minifySyntax: false, legalComments: "none"
      }).code);
    `, "src\\components\\button\\button.css"], { encoding: "utf8" })
    expect(gzipSync(built, { level: 9 }).length).toBeLessThanOrEqual(2500)
  })

  it("uses overlay borders instead of adding border width to native button geometry", () => {
    containsCSS("border: 0;")
    containsCSS('[data-m-button-control]::after {')
    containsCSS("border: 1px solid var(--_m-button-current-border")
    containsCSS("height: var(--m-button-height, 34px)")
    containsCSS("line-height: 1;")
    containsCSS("font-weight: 400;")
    containsCSS('[strong] > [data-m-button-control] { font-weight: 500; }')
    containsCSS('height: auto; padding: 0; border-radius: 0; }')
  })

  it("matches pinned size, round-padding and icon metrics without changing native control types", () => {
    for (const [size, height, padding, font, icon] of [
      ["tiny", 22, 6, 12, 14], ["small", 28, 10, 14, 18],
      ["medium", 34, 14, 14, 18], ["large", 40, 18, 15, 20],
    ]) {
      containsCSS(`[size="${size}"] { --m-button-height: ${height}px; --m-button-padding: ${padding}px; --m-button-font-size: ${font}px; --m-button-icon-size: ${icon}px; }`)
    }
    containsCSS("calc(var(--m-button-padding, 14px) + 4px)")
    containsCSS("var(--m-button-icon-gap, 6px)")
    containsCSS('[data-m-button-spinner] > svg')
    for (const type of ["primary", "text", "tertiary", "error"]) {
      const element = button(`<m-button type="${type}"><button type="reset">Action</button></m-button>`)
      expect((element.control as HTMLButtonElement).type).toBe("reset")
    }
  })

  it("uses Button-specific reference colors without changing the document palette", () => {
    const themes = JSON.parse(readFileSync("src/theme/presets.json", "utf8"))
    expect(themes.light["button-text-color"]).toBe("#333639")
    expect(themes.light["button-border-color"]).toBe("#e0e0e6")
    expect(themes.light["text-primary"]).toBe("#18181b")
    expect(themes.light["bg-page"]).toBe("#f6f7f9")
    expect(themes.dark["button-text-color"]).toBe("rgba(255, 255, 255, .82)")
    containsCSS("light-dark(#fff, #000)")
    containsCSS("--_m-button-opacity: .38")
    containsCSS("rgba(46, 51, 56, .05)")
    containsCSS("rgba(255, 255, 255, .12)")
    containsCSS("r g b / .16")
    expect(normalizeCSS(css)).not.toContain("var(--m-text-primary")
    expect(legacy).toContain("--m-button-text-color:#333639;--m-button-border-color:#e0e0e6")
  })

  describe("Button motion ownership", () => {
    function animation(name: string, target: Element) {
      let resolve!: () => void
      const finished = new Promise<void>(done => { resolve = done })
      const value = {
        animationName: name, effect: { target }, currentTime: 200,
        playState: "running", finished, onfinish: null as (() => void) | null,
        oncancel: null as (() => void) | null,
        play: vi.fn(), cancel: vi.fn(),
      }
      value.cancel.mockImplementation(() => { value.playState = "idle" })
      return { value, resolve }
    }

    it("restarts only its own wave and leaves native activation and author animations intact", () => {
      const element = button('<m-button type="primary"><button type="button">Save</button></m-button>')
      const control = element.control!
      const wave = animation("m-button-wave", control).value
      const author = animation("author-pulse", control).value
      Object.defineProperty(control, "getAnimations", { value: vi.fn(() => [author, wave]) })
      const click = vi.fn()
      control.addEventListener("click", click)
      element.click()
      expect(click).toHaveBeenCalledOnce()
      expect(wave.currentTime).toBe(0)
      expect(wave.play).toHaveBeenCalledOnce()
      expect(control.hasAttribute("data-m-button-wave")).toBe(true)
      wave.currentTime = 300
      element.click()
      expect(wave.currentTime).toBe(0)
      expect(wave.play).toHaveBeenCalledTimes(2)
      expect(author.cancel).not.toHaveBeenCalled()
      wave.playState = "finished"
      wave.onfinish?.()
      expect(control.hasAttribute("data-m-button-wave")).toBe(false)
      expect(wave.cancel).toHaveBeenCalledOnce()
    })

    it("suppresses waves for disabled, loading, text, soft and reduced-motion controls", () => {
      for (const attrs of ["disabled", "loading", "text", 'type="text"', "secondary", "tertiary", "quaternary"]) {
        const element = button(`<m-button ${attrs}>Save</m-button>`)
        const wave = animation("m-button-wave", element.control!).value
        Object.defineProperty(element.control!, "getAnimations", { value: () => [wave] })
        element.click()
        expect(wave.play).not.toHaveBeenCalled()
      }
      vi.stubGlobal("matchMedia", () => ({ matches: true }))
      const element = button()
      const wave = animation("m-button-wave", element.control!).value
      Object.defineProperty(element.control!, "getAnimations", { value: () => [wave] })
      element.click()
      expect(wave.play).not.toHaveBeenCalled()
    })

    it("cleans wave state on detach and control replacement without stale callback effects", async () => {
      const element = button()
      const control = element.control!
      const wave = animation("m-button-wave", control).value
      Object.defineProperty(control, "getAnimations", { value: () => [wave] })
      element.click()
      const oldFinish = wave.onfinish
      element.remove()
      expect(control.hasAttribute("data-m-button-wave")).toBe(false)
      expect(wave.cancel).toHaveBeenCalledOnce()
      oldFinish?.()
      expect(wave.cancel).toHaveBeenCalledOnce()
      document.body.append(element)
      element.click()
      const next = document.createElement("button")
      next.type = "button"
      element.replaceChildren(next)
      await Promise.resolve()
      expect(element.control).toBe(next)
      expect(control.hasAttribute("data-m-button-wave")).toBe(false)
      expect(wave.cancel).toHaveBeenCalledTimes(2)
    })

    function insertionFixture(withStyle = false, svg = false, cssWidth = "18px") {
      const computed = { animationName: "none", display: "inline-flex", width: cssWidth }
      vi.spyOn(window, "getComputedStyle").mockReturnValue(computed as CSSStyleDeclaration)
      const element = button()
      const icon = svg
        ? document.createElementNS("http://www.w3.org/2000/svg", "svg")
        : document.createElement("span")
      icon.dataset.mButtonIcon = ""
      icon.textContent = "+"
      if (withStyle) icon.style.cssText = "color: purple; transform: rotate(10deg)"
      Object.defineProperty(icon, "getClientRects", { configurable: true, value: () => [{}] })
      const width = animation("m-button-enter-width", icon)
      const alpha = animation("m-button-enter-alpha", icon)
      Object.defineProperty(icon, "getAnimations", {
        value: () => icon.hasAttribute("data-m-button-enter") ? [width.value, alpha.value] : [],
      })
      return { element, icon, width, alpha, computed }
    }

    it("animates inserted icons without replacing nodes, listeners or author styles", async () => {
      const { element, icon, width, alpha } = insertionFixture(true)
      const style = icon.getAttribute("style")
      const click = vi.fn()
      icon.addEventListener("click", click)
      element.control!.append(icon)
      await Promise.resolve()
      expect(icon.parentNode).toBe(element.control)
      expect(icon.style.getPropertyValue("--_m-button-enter-width")).toBe("18px")
      expect(icon.style.transform).toBe("rotate(10deg)")
      width.resolve()
      alpha.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(icon.hasAttribute("data-m-button-enter")).toBe(false)
      expect(icon.getAttribute("style")).toBe(style)
      icon.click()
      expect(click).toHaveBeenCalledOnce()
    })

    it("cancels insertion on detach and restores an originally absent style attribute", async () => {
      const { element, icon, width, alpha } = insertionFixture()
      element.control!.append(icon)
      await Promise.resolve()
      expect(icon.hasAttribute("data-m-button-enter")).toBe(true)
      element.remove()
      expect(width.value.cancel).toHaveBeenCalledOnce()
      expect(alpha.value.cancel).toHaveBeenCalledOnce()
      expect(icon.hasAttribute("style")).toBe(false)
      expect(icon.hasAttribute("data-m-button-enter")).toBe(false)
      document.body.append(element)
      expect(icon.parentNode).toBe(element.control)
      expect(icon.hasAttribute("data-m-button-enter")).toBe(false)
    })

    it.each([false, true])("uses fractional untransformed CSS width for SVG=%s and restores author sizing", async svg => {
      const { element, icon, width, alpha } = insertionFixture(true, svg, "18.375px")
      icon.style.cssText = "width: 18.375px; max-width: 18.375px; padding: 1.5px; border: 1px solid; transform: scale(2)"
      const original = icon.getAttribute("style")
      if (!svg) Object.defineProperty(icon, "offsetWidth", { value: 23 })
      else expect("offsetWidth" in icon).toBe(false)
      Object.defineProperty(icon, "getBoundingClientRect", { value: () => ({ width: 46.75 }) })
      element.control!.append(icon)
      await Promise.resolve()
      expect(icon.style.getPropertyValue("--_m-button-enter-width")).toBe("18.375px")
      expect(icon.hasAttribute("data-m-button-enter")).toBe(true)
      expect(icon.parentNode).toBe(element.control)
      width.resolve()
      alpha.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(icon.getAttribute("style")).toBe(original)
      expect(icon.hasAttribute("data-m-button-enter")).toBe(false)
    })

    it.each(["hidden", "no-box", "auto", "zero"])("does not measure an unavailable icon layout: %s", async mode => {
      const { element, icon, computed } = insertionFixture(false, true)
      if (mode === "hidden") computed.display = "none"
      if (mode === "no-box") Object.defineProperty(icon, "getClientRects", { value: () => [] })
      if (mode === "auto") computed.width = "auto"
      if (mode === "zero") computed.width = "0px"
      element.control!.append(icon)
      await Promise.resolve()
      expect(icon.hasAttribute("data-m-button-enter")).toBe(false)
      expect(icon.hasAttribute("style")).toBe(false)
    })

    it("does not replace an author's animation with an insertion effect", async () => {
      const element = button()
      const icon = document.createElement("span")
      icon.dataset.mButtonIcon = ""
      const author = animation("author-pulse", icon).value
      Object.defineProperty(icon, "getAnimations", { value: () => [author] })
      element.control!.append(icon)
      await Promise.resolve()
      expect(icon.hasAttribute("data-m-button-enter")).toBe(false)
      expect(icon.hasAttribute("style")).toBe(false)
      expect(author.cancel).not.toHaveBeenCalled()
    })
  })

  it("keeps disabled colors static and loading appearance independent from native disabled ownership", () => {
    containsCSS(':is(:not(:disabled, [aria-disabled="true"]), [aria-busy="true"])')
    containsCSS('[loading]:not([disabled]) > [data-m-button-control] { opacity: 1; cursor: wait;')
    containsCSS("var(--_m-button-bg-disabled)")
    containsCSS("var(--_m-button-label-disabled)")
    containsCSS("border-color .3s cubic-bezier(.4, 0, .2, 1)")
    containsCSS("@media (forced-colors: active)")
    containsCSS("@media (prefers-reduced-motion: reduce)")
    containsCSS(":focus-visible { outline: 2px solid Highlight")
  })

  it("isolates native hosts from later legacy soft-state declarations and joins only compatible borders", () => {
    containsCSS(`m-button${"[data-m-button]".repeat(4)} {`)
    containsCSS("all: unset")
    expect(normalizeCSS(css)).not.toContain("margin-inline-start:-1px")
    containsCSS("var(--_m-button-joined-width, 1px)")
    containsCSS("var(--_m-button-joined-offset, 0px)")
    for (const type of ["primary", "info", "success", "warning", "error"]) {
      containsCSS(`m-button[ghost]:is([type="${type}"], [variant="${type}"]) + :is([type="${type}"], [variant="${type}"])`)
    }
    containsCSS('m-button:is(:not([type], [variant]), [type="default"], [variant="default"]) + :is(:not([type], [variant]), [type="default"], [variant="default"])')
  })
})

function button(markup = "<m-button>Action</m-button>"): MButton {
  document.body.innerHTML = markup
  const element = document.querySelector("m-button")
  if (!(element instanceof MButton)) throw new Error("Button was not upgraded")
  return element
}

describe("standalone Button", () => {
  it("publishes platform definitions and registers primary names", () => {
    expect(buttonDefinition).toEqual({
      type: "Button",
      web: { primary: "m-button" },
      capabilities: ["button.activation", "button.form", "button.link", "button.loading", "button.icon"],
    })
    expect(buttonGroupDefinition.web).toEqual({ primary: "m-button-group" })
    const definitions = new Map<string, CustomElementConstructor>()
    const registry = {
      get: (name: string) => definitions.get(name),
      define: (name: string, constructor: CustomElementConstructor) => { definitions.set(name, constructor) },
    }
    registerButton(registry)
    expect(definitions.get("m-button")).toBe(MButton)
    expect(definitions.get("m-button-group")).toBe(MButtonGroup)
  })

  it("uses the primary Button renderer without a compatibility alias", () => {
    const primary = button('<m-button type="primary">Primary</m-button>')
    expect(primary.control?.textContent).toBe("Primary")
    expect(primary.type).toBe("primary")
  })

  it("adopts native buttons and preserves child identities and listeners", () => {
    const element = document.createElement("m-button") as MButton
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
    const element = document.createElement("m-button") as MButton
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
    const element = button('<form><input name="title" required><m-button type="primary"><button name="action" value="save">Save</button></m-button></form>')
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
    const element = button('<form id="editor"><input name="title" value="A"></form><m-button attr-type="submit" form="editor" name="action" value="save" formaction="/save" formmethod="post" formenctype="text/plain" formtarget="result" formnovalidate>Save</m-button>')
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
    const element = button('<form><input value="initial"><m-button attr-type="button"><button type="reset">Reset</button></m-button></form>')
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
    const element = button('<m-button disabled><button type="button"><span>Save</span></button></m-button>')
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
    const element = button('<m-button loading><button disabled aria-busy="false" aria-disabled="true" tabindex="2">Save</button></m-button>')
    const native = element.control as HTMLButtonElement
    const spinner = native.querySelector("[data-m-button-spinner]")
    expect(spinner?.getAttribute("aria-hidden")).toBe("true")
    expect(native.getAttribute("aria-busy")).toBe("true")
    element.remove()
    document.body.append(element)
    expect(native.querySelectorAll("[data-m-button-spinner]")).toHaveLength(1)
    element.loading = false
    expect(native.disabled).toBe(true)
    expect(native.getAttribute("aria-busy")).toBe("false")
    expect(native.getAttribute("aria-disabled")).toBe("true")
    expect(native.querySelector("[data-m-button-spinner]")).toBeNull()
  })

  it("restores authored labels and focus order when overrides are removed", () => {
    const element = button('<m-button aria-label="Save document" aria-describedby="help" focusable="false"><button type="button" aria-label="Save" tabindex="3">S</button></m-button>')
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
    const element = button('<m-button loading attr-type="submit" aria-label="Override"><button type="reset" aria-label="Initial">Save</button></m-button>')
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
    const element = button('<form><fieldset disabled><m-button attr-type="submit">Save</m-button></fieldset></form>')
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
    const element = button('<m-button><a href="#destination" target="_blank" rel="noopener" download="file">Open</a></m-button>')
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
    const element = button('<m-button disabled><a href="#target" role="button">Open</a></m-button>')
    const native = element.control!
    expect(native.getAttribute("role")).toBe("button")
    native.setAttribute("role", "menuitem")
    await Promise.resolve()
    element.disabled = false
    expect(native.getAttribute("role")).toBe("menuitem")
    expect(native.getAttribute("href")).toBe("#target")
  })

  it("preserves icon and text nodes and labels during repeated loading", () => {
    const element = button('<m-button icon-placement="right" aria-label="Add"><button type="button"><span data-m-button-icon aria-hidden="true">+</span><strong>Add</strong></button></m-button>')
    const icon = element.querySelector("[data-m-button-icon]")!
    const label = element.querySelector("strong")!
    for (let i = 0; i < 3; i++) {
      element.loading = true
      expect(element.querySelectorAll("[data-m-button-spinner]")).toHaveLength(1)
      expect(element.control!.getAttribute("aria-busy")).toBe("true")
      element.loading = false
    }
    expect(element.querySelector("[data-m-button-icon]")).toBe(icon)
    expect(element.querySelector("strong")).toBe(label)
    expect(element.control!.getAttribute("aria-label")).toBe("Add")
    expect(element.control!.hasAttribute("aria-busy")).toBe(false)
  })

  it("uses an owned native SVG for the measured loading arc without changing the accessible name", () => {
    const element = button("<m-button loading>Save</m-button>")
    const spinner = element.querySelector("[data-m-button-spinner]")!
    const svg = spinner.querySelector("svg")!
    expect(spinner.getAttribute("aria-hidden")).toBe("true")
    expect(svg.getAttribute("focusable")).toBe("false")
    expect(svg.querySelector("circle")?.getAttribute("stroke-dasharray")).toBe("283.5%")
    expect(svg.querySelector("animateTransform")?.getAttribute("values")).toBe("0;270;720")
    expect(svg.querySelector("animate")?.getAttribute("values")).toBe("283.5%;71%;283.5%")
    expect(svg.querySelector("animate")?.getAttribute("dur")).toBe("1.6s")
    expect(element.control?.textContent).toBe("Save")
    element.setAttribute("aria-label", "Save document")
    expect(element.querySelectorAll("[data-m-button-spinner]")).toHaveLength(1)
    expect(element.querySelector("[data-m-button-spinner] svg")).toBe(svg)
  })

  it("derives icon-only spacing from live content without wrapping or replacing authored nodes", async () => {
    const element = button('<m-button circle icon-placement="right" aria-label="Add"><span data-m-button-icon>+</span></m-button>')
    const control = element.control!
    const icon = control.firstChild
    expect(control.hasAttribute("data-m-button-icon-only")).toBe(true)
    const label = document.createTextNode("Save")
    control.append(label)
    await Promise.resolve()
    expect(control.hasAttribute("data-m-button-icon-only")).toBe(false)
    label.nodeValue = ""
    await Promise.resolve()
    expect(control.hasAttribute("data-m-button-icon-only")).toBe(true)
    expect(control.firstChild).toBe(icon)
    expect(control.lastChild).toBe(label)
    element.loading = true
    expect(control.hasAttribute("data-m-button-icon-only")).toBe(true)
    const replacement = document.createElement("button")
    replacement.textContent = "New"
    element.replaceChildren(replacement)
    await Promise.resolve()
    expect(control.hasAttribute("data-m-button-icon-only")).toBe(false)
  })

  it("pauses native loading motion for reduced motion and releases its listener on detach or completion", () => {
    const query = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    vi.stubGlobal("matchMedia", vi.fn(() => query))
    const element = button("<m-button loading>Save</m-button>")
    const svg = element.querySelector("svg")!
    const pause = vi.fn(), resume = vi.fn(), seek = vi.fn()
    Object.assign(svg, { pauseAnimations: pause, unpauseAnimations: resume, setCurrentTime: seek })
    const changed = query.addEventListener.mock.calls[0]![1] as () => void
    query.matches = true
    changed()
    expect(pause).toHaveBeenCalledOnce()
    expect(seek).toHaveBeenCalledWith(.8)
    query.matches = false
    changed()
    expect(resume).toHaveBeenCalledOnce()
    element.setAttribute("aria-label", "Save document")
    expect(query.addEventListener).toHaveBeenCalledOnce()
    element.remove()
    expect(query.removeEventListener).toHaveBeenCalledWith("change", changed)
    resume.mockClear()
    changed()
    expect(resume).not.toHaveBeenCalled()
    document.body.append(element)
    expect(element.querySelector("svg")).toBe(svg)
    expect(query.addEventListener).toHaveBeenCalledTimes(2)
    element.loading = false
    expect(query.removeEventListener).toHaveBeenCalledTimes(2)
    expect(element.querySelector("svg")).toBeNull()
  })

  it("cleans up observers and capture listeners while disconnected", async () => {
    const element = button('<m-button disabled>Save</m-button>')
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
    const element = button('<m-button loading aria-label="Override"><button type="reset" aria-label="Original">Old</button></m-button>')
    const old = element.control as HTMLButtonElement
    const next = document.createElement("button")
    next.type = "button"
    next.textContent = "New"
    element.replaceChildren(next)
    await Promise.resolve()
    expect(element.control).toBe(next)
    expect(old.disabled).toBe(false)
    expect(old.getAttribute("aria-label")).toBe("Original")
    expect(old.querySelector("[data-m-button-spinner]")).toBeNull()
    expect(old.hasAttribute("data-m-button-control")).toBe(false)
    expect(next.disabled).toBe(true)
    expect(next.getAttribute("aria-label")).toBe("Override")
  })

  it("upgrades pre-definition properties for Button and ButtonGroup", () => {
    document.body.innerHTML = '<test-late-button>Late</test-late-button><test-late-button-group></test-late-button-group>'
    const element = document.querySelector("test-late-button") as MButton
    Object.assign(element, { loading: true, attrType: "submit", type: "info", size: "large", iconPlacement: "right", focusable: false, bordered: false, round: true, secondary: true })
    const group = document.querySelector("test-late-button-group") as MButtonGroup
    Object.assign(group, { size: "small", vertical: true })
    customElements.define("test-late-button", class extends MButton {})
    customElements.define("test-late-button-group", class extends MButtonGroup {})
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
    button('<m-button-group size="small" vertical aria-label="Actions"><m-button>One</m-button><m-button size="large">Two</m-button></m-button-group>')
    const group = document.querySelector("m-button-group") as MButtonGroup
    const children = [...group.children]
    expect(group.getAttribute("role")).toBe("group")
    expect(group.getAttribute("aria-label")).toBe("Actions")
    group.vertical = false
    group.size = "large"
    group.remove()
    document.body.append(group)
    expect([...group.children]).toEqual(children)
    expect((children[0] as MButton).control?.tabIndex).toBe(0)
    expect(group.hasAttribute("tabindex")).toBe(false)
  })

  it("supports registration idempotence and rejects either legacy definition atomically", () => {
    expect(() => registerButton()).not.toThrow()
    for (const conflict of ["m-button", "m-button-group"]) {
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
    expect(customElements.get("m-button")).toBe(MButton)
    expect(customElements.get("m-button-group")).toBe(MButtonGroup)
    const element = button('<m-button m-action="button.save">Save</m-button>')
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
