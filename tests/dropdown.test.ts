import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createDropdown } from "../src/components/dropdown/controller.js"
import { createMenuKeyboard } from "../src/components/dropdown/keyboard.js"
import type { DropdownController, DropdownOptions } from "../src/components/dropdown/controller.js"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownGroup, DropdownDivider, registerDropdown } from "../src/components/dropdown/index.js"
import * as dropdownApi from "../src/components/dropdown/index.js"
import { ViewElement } from "../src/core/index.js"
import { createContext, runInContext } from "node:vm"

describe("audited Dropdown styles", () => {
  const css = readFileSync("src/components/dropdown/dropdown.css", "utf8")

  it("uses measured menu density without forcing fixed-height or flex-split labels", () => {
    expect(css).toMatch(/padding:var\(--m-popover-padding,\s*4px 0\)/)
    expect(css).toContain("min-height:var(--_dd-h, 34px)")
    expect(css).toContain("--_dd-h: 28px")
    expect(css).toContain("--_dd-h: 40px")
    expect(css).toContain("--_dd-h: 46px")
    expect(css).toContain("display:block")
    expect(css).toContain("white-space:normal")
    expect(css).not.toContain("font-weight:600")
  })

  it("matches theme-state roles while keeping disabled selections unpainted", () => {
    expect(css).toContain("light-dark(#f3f3f5, #ffffff17)")
    expect(css).toContain("var(--_dd-alpha, 10%)")
    expect(css).toContain("--_dd-alpha: 15%")
    expect(css).toContain("--_dd-opacity: .38")
    expect(css).toContain("m-dropdown-item>:is(button,a)[data-state~=selected]:not(:disabled,[aria-disabled=true])")
    expect(css).toContain("m-dropdown-item>:is(button,a):not(:disabled,[aria-disabled=true]):is(:hover,:focus)")
    expect(css.indexOf("m-dropdown-item>:is(button,a)[data-state~=selected]"))
      .toBeGreaterThan(css.indexOf("m-dropdown-item>:is(button,a):not(:disabled,[aria-disabled=true]):is(:hover,:focus)"))
    expect(css).toContain("var(--m-color-primary-suppl, #2a947d)")
    expect(css).not.toContain("--_dd-line")
  })

  it("preserves inherited public overrides and logical label placement", () => {
    expect(css).not.toMatch(/(?:^|[;{])\s*--m-(?:dropdown|popover)-[\w-]+\s*:/m)
    expect(css).toContain("var(--m-dropdown-item-padding,")
    expect(css).toContain("var(--m-dropdown-hover,")
    expect(css).toContain("var(--m-dropdown-selected,")
    expect(css).toContain(":is(button,a):dir(rtl)")
    expect(css).toContain("padding-inline:calc(")
    expect(css).toContain("float:inline-end")
  })

  it("retains hidden, focus, forced-colors and print safety", () => {
    expect(css).toContain("[hidden]{display:none!important}")
    expect(css).toContain(":focus-visible{outline:2px solid currentColor")
    expect(css).toContain("@media(forced-colors:active)")
    expect(css).toContain("@media print")
    expect(css).toContain("color:#000!important;background:transparent!important")
  })
})

const controllers: DropdownController[] = []
const matches = HTMLElement.prototype.matches
let opened: WeakSet<HTMLElement>
let sequence = 0
const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, right: left + width, bottom: top + height, width, height, x: left, y: top, toJSON() {} }) as DOMRect
function nativeToggle(panel: HTMLElement, show: boolean) {
  if (opened.has(panel) === show) return
  const event = Object.assign(new Event("beforetoggle", { cancelable: show }), {
    oldState: show ? "closed" : "open", newState: show ? "open" : "closed",
  })
  if (!panel.dispatchEvent(event)) return
  if (show) opened.add(panel)
  else opened.delete(panel)
  panel.dispatchEvent(new Event("toggle"))
}
function nodes() {
  const id = `dropdown-${sequence++}`
  const trigger = document.createElement("button")
  trigger.type = "button"
  trigger.textContent = "Actions"
  trigger.setAttribute("popovertarget", id)
  const menu = document.createElement("ul")
  menu.id = id
  menu.className = "m-popover m-dropdown"
  menu.setAttribute("data-dropdown-menu", "")
  menu.setAttribute("popover", "auto")
  menu.setAttribute("aria-label", "Local actions")
  menu.innerHTML = `
    <li><button type="button" data-dropdown-item data-dropdown-key="edit">Edit</button></li>
    <li><button type="button" data-dropdown-item data-dropdown-key="disabled" disabled>Disabled</button></li>
    <li><a href="#destination" data-dropdown-item data-dropdown-key="preview">Preview</a></li>
    <li data-dropdown-divider></li>
    <li><span id="${id}-group" data-dropdown-group-label>Group</span><ul data-dropdown-group aria-labelledby="${id}-group">
      <li><button type="button" data-dropdown-item data-dropdown-key="print">Print</button></li>
      <li><button type="button" data-dropdown-item data-dropdown-key="profile">Profile</button></li>
    </ul></li>
    <li><button type="button" data-dropdown-item data-dropdown-key="more" popovertarget="${id}-child">More</button>
      <ul class="m-popover m-dropdown" data-dropdown-menu id="${id}-child" popover="auto" aria-label="More actions">
        <li><button type="button" data-dropdown-item data-dropdown-key="rename">Rename</button></li>
        <li><a href="#destination" data-dropdown-item data-dropdown-key="separate" target="_blank">Separate</a></li>
      </ul>
    </li>`
  trigger.getBoundingClientRect = () => rect(200, 200, 100, 30)
  for (const element of [menu, ...menu.querySelectorAll<HTMLElement>("*")]) {
    element.getBoundingClientRect = () => rect(200, 250, 250, element.hasAttribute("data-dropdown-menu") ? 220 : 30)
  }
  document.body.append(trigger, menu)
  const item = (key: string) => menu.querySelector<HTMLElement>(`[data-dropdown-key="${key}"]`)!
  return {
    trigger, menu, item,
    edit: item("edit") as HTMLButtonElement, preview: item("preview") as HTMLAnchorElement,
    more: item("more") as HTMLButtonElement, child: menu.querySelector<HTMLElement>("[data-dropdown-menu]")!,
  }
}
function bind(options: DropdownOptions = {}) {
  const pair = nodes()
  const controller = createDropdown(pair.trigger, pair.menu, options)
  controllers.push(controller)
  return { ...pair, controller }
}
function canonical(options: Partial<Pick<Dropdown, "value" | "disabled" | "placement" | "submenuDelay" | "submenuDuration" | "typeaheadDuration">> = {}, connect = true) {
  const root = document.createElement("m-dropdown") as Dropdown
  root.innerHTML = `<m-dropdown-trigger><button type="button">Actions</button></m-dropdown-trigger>
    <m-dropdown-menu label="Local actions" animated>
      <m-dropdown-item key="edit"><button type="button">Edit</button></m-dropdown-item>
      <m-dropdown-item key="disabled" disabled><button type="button">Disabled</button></m-dropdown-item>
      <m-dropdown-item key="blocked-link" disabled><a href="#blocked-destination">Blocked destination</a></m-dropdown-item>
      <m-dropdown-item key="preview"><a href="#destination">Preview</a></m-dropdown-item>
      <m-dropdown-divider></m-dropdown-divider>
      <m-dropdown-group label="Group">
        <m-dropdown-item key="print"><button type="button">Print</button></m-dropdown-item>
        <m-dropdown-item key="profile"><button type="button">Profile</button></m-dropdown-item>
      </m-dropdown-group>
      <m-dropdown-item key="more"><button type="button">More <span slot="suffix" aria-hidden="true">›</span></button>
        <m-dropdown-menu label="More actions">
          <m-dropdown-item key="rename"><button type="button">Rename</button></m-dropdown-item>
          <m-dropdown-item key="external"><a href="#destination" target="_blank">External</a></m-dropdown-item>
        </m-dropdown-menu>
      </m-dropdown-item>
    </m-dropdown-menu>`
  Object.assign(root, options)
  const trigger = root.querySelector<HTMLButtonElement>("m-dropdown-trigger > button")!
  const menu = root.querySelector<DropdownMenu>(":scope > m-dropdown-menu")!
  function measure(element: HTMLElement) {
    element.getBoundingClientRect = () => rect(200, 250, 250, element.localName === "m-dropdown-menu" ? 220 : 30)
  }
  root.querySelectorAll<HTMLElement>("*").forEach(measure)
  trigger.getBoundingClientRect = () => rect(200, 200, 100, 30)
  const item = (key: string) => root.querySelector<DropdownItem>(`m-dropdown-item[key="${key}"]`)!
  const action = (key: string) => item(key).querySelector<HTMLButtonElement | HTMLAnchorElement>(":scope > button,:scope > a")!
  if (connect) document.body.append(root)
  return { root, trigger, menu, item, action, measure, child: item("more").querySelector<DropdownMenu>("m-dropdown-menu")! }
}
function key(node: HTMLElement, key: string, extra: KeyboardEventInit = {}, type = "keydown") {
  const event = new KeyboardEvent(type, { key, bubbles: true, cancelable: true, ...extra })
  node.dispatchEvent(event)
  return event
}
function pointer(node: HTMLElement, type: string, relatedTarget: EventTarget | null = null) {
  node.dispatchEvent(Object.assign(new Event(type), { relatedTarget, pointerType: "mouse" }))
}
async function flush() {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
  for (let index = 0; index < 4; index++) await Promise.resolve()
}
beforeEach(() => {
  opened = new WeakSet()
  vi.spyOn(HTMLElement.prototype, "matches").mockImplementation(function (selector) {
    return selector === ":popover-open" ? opened.has(this) : matches.call(this, selector)
  })
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} })
  Object.defineProperty(HTMLElement.prototype, "showPopover", { configurable: true, value() { nativeToggle(this, true) } })
  Object.defineProperty(HTMLElement.prototype, "hidePopover", { configurable: true, value() { nativeToggle(this, false) } })
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(800)
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(600)
})
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  document.body.replaceChildren()
  delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover
  delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("direct Dropdown family", () => {
  it("exports only six own-tag ViewElements and atomic registration", () => {
    expect(Object.keys(dropdownApi).sort()).toEqual(["Dropdown", "DropdownDivider", "DropdownGroup", "DropdownItem", "DropdownMenu", "DropdownTrigger", "registerDropdown"])
    for (const type of [Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownGroup, DropdownDivider]) {
      expect(ViewElement.prototype.isPrototypeOf(type.prototype)).toBe(true)
      expect(Object.hasOwn(type, "tag")).toBe(true)
      expect(customElements.get(type.tag)).toBe(type)
      expect("meta" in type).toBe(false)
    }
    const define = vi.fn()
    expect(() => registerDropdown({ get: name => name === "m-dropdown" ? class extends HTMLElement {} : undefined, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerDropdown()).not.toThrow()
  })

  it("validates direct defaults, choices, durations and leaf values before mutation", () => {
    const detached = document.createElement("m-dropdown") as Dropdown
    expect(detached.value).toBeNull()
    expect(detached.disabled).toBe(false)
    expect(detached.placement).toBe("bottom")
    expect([detached.submenuDelay, detached.submenuDuration, detached.typeaheadDuration]).toEqual([100, 150, 500])
    expect(detached.state).toBe("disconnected")
    for (const property of ["submenuDelay", "submenuDuration", "typeaheadDuration"]) {
      for (const value of [-1, 60001, NaN, Infinity, "100"]) expect(() => Reflect.set(detached, property, value)).toThrow(RangeError)
    }
    expect(() => Reflect.set(detached, "disabled", "false")).toThrow(RangeError)
    expect(() => Reflect.set(detached, "placement", "diagonal")).toThrow(RangeError)
    expect(() => Reflect.set(detached, "value", 1)).toThrow(RangeError)
    const { root } = canonical({ value: "preview" })
    expect(root.state).toBe("closed")
    expect(root.value).toBe("preview")
    expect(() => { root.value = "more" }).toThrow("leaf")
    expect(() => { root.value = "missing" }).toThrow("leaf")
    expect(root.value).toBe("preview")
    root.value = null
    expect(root.hasAttribute("value")).toBe(false)
    root.select("edit")
    expect(root.value).toBe("edit")
    expect(root.show).toBe(false)
  })

  it("preserves authored nodes and gives native controls/menu regions the only semantic owners", () => {
    const { root, trigger, menu, item, action } = canonical({}, false)
    const original = action("edit"), text = original.firstChild
    const clicked = vi.fn()
    original.addEventListener("click", clicked)
    document.body.append(root)
    expect(root.state).toBe("closed")
    expect(action("edit")).toBe(original)
    expect(original.firstChild).toBe(text)
    expect(menu.getAttribute("role")).toBe("menu")
    expect(menu.getAttribute("aria-label")).toBe("Local actions")
    expect(trigger.getAttribute("popovertarget")).toBe(menu.id)
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu")
    expect(item("edit").getAttribute("role")).toBe("none")
    expect(item("edit").hasAttribute("tabindex")).toBe(false)
    expect(original.getAttribute("role")).toBe("menuitem")
    expect(root.querySelector("m-dropdown-group")!.getAttribute("role")).toBe("group")
    expect(root.querySelector("m-dropdown-divider")!.getAttribute("role")).toBe("separator")
    expect(root.querySelector("m-dropdown-trigger")!.hasAttribute("tabindex")).toBe(false)
    root.open()
    original.click()
    expect(clicked).toHaveBeenCalledOnce()
  })

  it("supports arrows, Home/End, typeahead, submenu Escape and native Tab departure", async () => {
    const { root, trigger, menu, child, action } = canonical()
    key(trigger, "ArrowDown")
    expect(root.show).toBe(true)
    expect(document.activeElement).toBe(action("edit"))
    key(action("edit"), "ArrowDown")
    expect(document.activeElement).toBe(action("preview"))
    key(action("preview"), "p")
    expect(document.activeElement).toBe(action("print"))
    key(action("print"), "End")
    expect(document.activeElement).toBe(action("more"))
    key(action("more"), "ArrowRight")
    expect(opened.has(child)).toBe(true)
    expect(document.activeElement).toBe(action("rename"))
    key(action("rename"), "Escape")
    expect(opened.has(child)).toBe(false)
    expect(opened.has(menu)).toBe(true)
    expect(document.activeElement).toBe(action("more"))
    key(action("more"), "Home")
    expect(document.activeElement).toBe(action("edit"))
    const outside = document.createElement("button")
    document.body.append(outside)
    expect(key(action("edit"), "Tab").defaultPrevented).toBe(false)
    outside.focus()
    await flush()
    expect(root.show).toBe(false)
    expect(document.activeElement).toBe(outside)
  })

  it("blocks disabled destinations and authored callbacks without replacing anchors, then restores them", async () => {
    const { root, item, action } = canonical()
    const anchor = action("blocked-link") as HTMLAnchorElement
    const invoked = vi.fn()
    anchor.addEventListener("click", invoked)
    expect(anchor.hasAttribute("href")).toBe(false)
    expect(anchor.getAttribute("aria-disabled")).toBe("true")
    anchor.click()
    expect(invoked).not.toHaveBeenCalled()
    root.value = "blocked-link"
    expect(item("blocked-link").selected).toBe(true)
    item("blocked-link").disabled = false
    expect(anchor.getAttribute("href")).toBe("#blocked-destination")
    await flush()
    root.open()
    anchor.click()
    await flush()
    expect(invoked).toHaveBeenCalledOnce()
    expect(root.value).toBe("blocked-link")
    expect(action("blocked-link")).toBe(anchor)
  })

  it("reflects accepted selection after native actions and closure, without stale attribute replay", async () => {
    const { root, action, item } = canonical({ value: "preview" })
    const order: string[] = []
    action("edit").addEventListener("click", () => order.push("native"))
    root.addEventListener("m:selection-requested", event => {
      const selected = event as CustomEvent
      order.push("selection")
      expect(root.show).toBe(false)
      expect(root.value).toBe("edit")
      expect(selected.detail).toMatchObject({ key: "edit", item: item("edit"), path: ["edit"], source: "native" })
      expect(selected.bubbles).toBe(true)
      expect(selected.cancelable || selected.composed).toBe(false)
      expect(Object.isFrozen(selected.detail.path)).toBe(true)
    })
    root.open()
    action("edit").click()
    expect(order).toEqual(["native"])
    await flush()
    expect(order).toEqual(["native", "selection"])
    expect(root.getAttribute("value")).toBe("edit")
    root.submenuDelay = 10
    root.typeaheadDuration = 200
    root.placement = "top-end"
    expect(root.value).toBe("edit")
    root.value = "preview"
    expect(order).toHaveLength(2)
  })

  it("honors late canceled/modified/native external-link activations", async () => {
    const { root, action } = canonical()
    const selected = vi.fn()
    root.addEventListener("m:selection-requested", selected)
    root.open()
    root.addEventListener("click", event => event.preventDefault(), { once: true })
    action("edit").click()
    await flush()
    expect(root.show).toBe(true)
    expect(root.value).toBeNull()
    action("preview").dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }))
    action("external").dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    await flush()
    expect(selected).not.toHaveBeenCalled()
  })

  it("reports actual root opening and disabled closure with explicit reasons", () => {
    const { root, trigger } = canonical()
    const changed = vi.fn()
    root.addEventListener("m:open-changed", changed)
    expect(root.open()).toBe(true)
    expect(changed.mock.calls[0]![0].detail).toEqual({ show: true, reason: "api" })
    root.disabled = true
    expect(root.state).toBe("disabled")
    expect(root.show).toBe(false)
    expect(trigger.disabled).toBe(true)
    expect(changed.mock.calls.at(-1)![0].detail).toEqual({ show: false, reason: "disabled" })
    expect(root.open()).toBe(false)
    root.disabled = false
    expect(trigger.disabled).toBe(false)
    expect(root.show).toBe(false)
  })

  it("revalidates late nodes, retains keyed value and native controls, and clears removed selections", async () => {
    const { root, menu, action, item, measure } = canonical({ value: "preview" })
    const original = action("preview")
    root.open()
    const added = document.createElement("m-dropdown-item") as DropdownItem
    added.key = "late"
    menu.append(added)
    await flush()
    expect(root.state).toBe("pending")
    menu.showPopover()
    expect(opened.has(menu)).toBe(false)
    added.innerHTML = "<button type=button>Late action</button>"
    added.querySelectorAll<HTMLElement>("*").forEach(measure)
    await flush()
    expect(root.state).toBe("closed")
    expect(root.value).toBe("preview")
    expect(action("preview")).toBe(original)
    item("preview").remove()
    await flush()
    expect(root.value).toBeNull()
    root.open()
    added.querySelector("button")!.click()
    await flush()
    expect(root.value).toBe("late")
  })

  it("recovers focus after content refresh without overwriting closing-listener focus", async () => {
    const { root, trigger, item, action } = canonical()
    root.open()
    action("preview").focus()
    item("preview").hidden = true
    await flush()
    expect(root.show).toBe(false)
    expect(document.activeElement).toBe(trigger)
    const outside = document.createElement("button")
    document.body.append(outside)
    root.querySelector("m-dropdown-menu")!.addEventListener("beforetoggle", event => {
      if ((event as ToggleEvent).newState === "closed") outside.focus()
    })
    root.open()
    root.refresh()
    expect(document.activeElement).toBe(outside)
  })

  it("cleans up and reconnects without duplicate controls or stale selection callbacks", async () => {
    const { root, trigger, menu, action } = canonical({ value: "preview" })
    const original = action("edit")
    const selected = vi.fn()
    root.addEventListener("m:selection-requested", selected)
    root.open()
    original.click()
    root.remove()
    await flush()
    expect(root.state).toBe("disconnected")
    expect(trigger.hasAttribute("popovertarget")).toBe(false)
    expect(menu.hasAttribute("role")).toBe(false)
    expect(selected).not.toHaveBeenCalled()
    document.body.append(root)
    expect(root.value).toBe("preview")
    expect(action("edit")).toBe(original)
    root.open()
    original.click()
    await flush()
    expect(selected).toHaveBeenCalledOnce()
    expect(root.querySelectorAll("m-dropdown-trigger > button")).toHaveLength(1)
  })

  it("recovers focus after native disabling already blurred an action", async () => {
    const { root, trigger, action } = canonical()
    vi.spyOn(document, "hasFocus").mockReturnValue(true)
    root.open()
    ;(action("edit") as HTMLButtonElement).disabled = true
    action("edit").blur()
    await flush()
    expect(root.show).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it("defers reentrant refresh during native opening without stale active state", async () => {
    const { root, menu, action } = canonical()
    menu.addEventListener("beforetoggle", event => {
      if ((event as ToggleEvent).newState === "open") root.refresh()
    }, { once: true })
    expect(root.open()).toBe(false)
    await flush()
    expect(root.state).toBe("closed")
    expect(root.open()).toBe(true)
    expect(document.activeElement).toBe(action("edit"))
  })

  it("preserves inline native fallback while still blocking disabled destinations and root commands", async () => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover
    const { root, menu, action } = canonical()
    expect(root.state).toBe("inline")
    expect(root.open()).toBe(false)
    expect(menu.hasAttribute("role") || menu.hasAttribute("popover")).toBe(false)
    expect(action("preview").getAttribute("href")).toBe("#destination")
    const invoked = vi.fn()
    action("edit").addEventListener("click", invoked)
    root.disabled = true
    action("edit").click()
    await flush()
    expect(invoked).not.toHaveBeenCalled()
    expect(root.value).toBeNull()
  })

  it("rejects duplicate keys, arbitrary widgets and invalid native controls with visible error state", async () => {
    const { root, trigger, action, item } = canonical()
    const errors = vi.fn()
    root.addEventListener("m:error", errors)
    expect(() => { item("edit").key = "preview" }).toThrow("unique")
    item("edit").setAttribute("key", "preview")
    expect(() => root.refresh()).toThrow("unique")
    root.querySelector("m-dropdown-item")!.setAttribute("key", "edit")
    root.refresh()
    trigger.type = "submit"
    expect(() => root.refresh()).toThrow("type=button")
    trigger.type = "button"
    root.refresh()
    action("edit").setAttribute("type", "submit")
    await flush()
    expect(root.state).toBe("invalid")
    expect(errors).toHaveBeenCalled()
    action("edit").setAttribute("type", "button")
    await flush()
    expect(root.state).toBe("closed")
    action("edit").innerHTML = "<x-interactive>Bad</x-interactive>"
    expect(() => root.refresh()).toThrow("widgets")
    expect(root.state).toBe("invalid")
  })

  it("upgrades own properties before native binding and preserves independent tree ownership", async () => {
    const first = canonical({}, false)
    Object.defineProperty(first.root, "value", { configurable: true, value: "preview" })
    Object.defineProperty(first.root, "submenuDelay", { configurable: true, value: 12 })
    document.body.append(first.root)
    await flush()
    expect(first.root.value).toBe("preview")
    expect(first.root.submenuDelay).toBe(12)
    expect(Object.hasOwn(first.root, "value")).toBe(false)
    const second = canonical()
    first.root.open()
    second.root.open()
    first.root.remove()
    expect(second.root.show).toBe(true)
    expect(second.action("edit").getAttribute("role")).toBe("menuitem")
  })
})

describe("Dropdown shared-core distribution", () => {
  it("requires core, registers only its own family and keeps exact base identity", () => {
    const script = readFileSync("dist\\markup-ui-dropdown.global.js", "utf8")
    const define = vi.fn()
    expect(() => runInContext(script, createContext({ HTMLElement, customElements: { get: vi.fn(), define } }))).toThrow("Load compatible markup-ui-core.global.js")
    expect(define).not.toHaveBeenCalled()
    const entries = new Map<string, unknown>()
    const context = createContext({ HTMLElement, customElements: {
      get: (name: string) => entries.get(name), define: (name: string, constructor: unknown) => entries.set(name, constructor),
    } })
    runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
    runInContext(script, context)
    expect([...entries.keys()]).toEqual(["m-dropdown-trigger", "m-dropdown-menu", "m-dropdown-item", "m-dropdown-group", "m-dropdown-divider", "m-dropdown"])
    expect(runInContext("Object.keys(MarkupUIDropdown).sort()", context)).toEqual(Object.keys(dropdownApi).sort())
    expect(runInContext("Object.values(MarkupUIDropdown).filter(value => Object.hasOwn(value, 'tag')).every(type => MarkupUICore.ViewElement.prototype.isPrototypeOf(type.prototype))", context)).toBe(true)
    expect(() => runInContext(script, context)).toThrow("already defined")
    expect(readFileSync("dist\\markup-ui-dropdown.js", "utf8")).toContain("./markup-ui-core.js")
    for (const name of ["m-avatar", "m-card", "m-carousel", "m-collapse", "m-divider"]) expect(script).not.toContain(`"${name}"`)
    const build = readFileSync("scripts\\build.mjs", "utf8")
    expect(build).toContain('["dropdown", 14_000]')
    expect(build).toContain('"markup-ui-dropdown.js": 13_000')
    expect(build).toContain('"markup-ui-dropdown.global.js": 13_000')
    expect(build).toContain('"markup-ui-dropdown.css": 1_850')
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    const cssBytes = manifest.bundles["markup-ui-dropdown.css"].gzipBytes
    expect(cssBytes).toBeLessThanOrEqual(1_850)
    for (const [mode, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      const payload = manifest.componentPayloads.dropdown[mode]
      const core = `markup-ui-core${suffix}`
      expect(payload.gzipBytes).toBeLessThanOrEqual(13_000)
      expect(payload.dependencies).toEqual([core])
      expect(payload.runtimeBudget).toBe(14_000)
      expect(payload.runtimeGzipBytes).toBe(payload.gzipBytes + manifest.bundles[core].gzipBytes)
      expect(payload.runtimeGzipBytes).toBeLessThanOrEqual(14_000)
      expect(payload.totalGzipBytes).toBe(payload.runtimeGzipBytes + cssBytes)
    }
  })
})

describe("authored menu semantics and validation", () => {
  it("enhances native lists with owned roles/tabindex/haspopup and restores original nodes/listeners/attributes", () => {
    const { trigger, menu, edit } = nodes()
    edit.setAttribute("tabindex", "2")
    edit.setAttribute("data-dropdown-selected", "author")
    trigger.setAttribute("aria-describedby", "author-help")
    const child = edit.firstChild
    const action = vi.fn()
    edit.addEventListener("click", action)
    const controller = createDropdown(trigger, menu)
    controllers.push(controller)
    expect(menu.getAttribute("role")).toBe("menu")
    expect(menu.getAttribute("tabindex")).toBe("-1")
    expect(edit.getAttribute("role")).toBe("menuitem")
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu")
    expect(menu.querySelector("[data-dropdown-group]")!.getAttribute("role")).toBe("group")
    expect(menu.querySelector("[data-dropdown-divider]")!.getAttribute("role")).toBe("separator")
    controller.disconnect()
    expect(menu.hasAttribute("role")).toBe(false)
    expect(edit.getAttribute("tabindex")).toBe("2")
    expect(edit.getAttribute("data-dropdown-selected")).toBe("author")
    expect(trigger.getAttribute("aria-describedby")).toBe("author-help")
    expect(trigger.hasAttribute("aria-haspopup")).toBe(false)
    expect(edit.firstChild).toBe(child)
    edit.click()
    expect(action).toHaveBeenCalledOnce()
  })
  it("preserves author edits to managed tabindex and selection attributes on disposal", () => {
    const { edit, controller } = bind()
    edit.setAttribute("tabindex", "7")
    edit.setAttribute("data-dropdown-selected", "external")
    controller.disconnect()
    expect(edit.getAttribute("tabindex")).toBe("7")
    expect(edit.getAttribute("data-dropdown-selected")).toBe("external")
  })
  it("uses string leaf values silently and never creates aria-selected/checked on command menuitems", () => {
    const { menu, edit, controller } = bind({ value: "preview" })
    const selected = vi.fn()
    menu.addEventListener("m:dropdown-select", selected)
    expect(controller.value).toBe("preview")
    controller.value = "edit"
    expect(edit.hasAttribute("data-dropdown-selected")).toBe(true)
    expect(edit.hasAttribute("aria-selected") || edit.hasAttribute("aria-checked")).toBe(false)
    expect(selected).not.toHaveBeenCalled()
    expect(() => { controller.value = "more" }).toThrow("leaf")
    expect(() => { controller.value = 1 as unknown as string }).toThrow("string")
    expect(() => { controller.value = "missing" }).toThrow()
    controller.value = null
    expect(edit.hasAttribute("data-dropdown-selected")).toBe(false)
  })
  it.each([{ options: [] }, { keyboard: false }, { trigger: "hover" }, { raw: true }, { typeaheadDuration: NaN }, { submenuDelay: -1 }, { submenuDuration: Infinity }])("rejects unsupported or invalid options %j", options => {
    const { trigger, menu } = nodes()
    expect(() => createDropdown(trigger, menu, options as DropdownOptions)).toThrow()
  })
  it("rejects invalid initial values, duplicate keys and unrelated submenu targets", () => {
    const { trigger, menu, edit, more } = nodes()
    expect(() => createDropdown(trigger, menu, { value: 2 } as unknown as DropdownOptions)).toThrow("string")
    expect(() => createDropdown(trigger, menu, { value: "missing" })).toThrow("leaf")
    expect(menu.hasAttribute("role")).toBe(false)
    edit.setAttribute("data-dropdown-key", "preview")
    expect(() => createDropdown(trigger, menu)).toThrow("unique string keys")
    edit.setAttribute("data-dropdown-key", "edit")
    more.setAttribute("popovertarget", "unknown")
    expect(() => createDropdown(trigger, menu)).toThrow("submenu")
  })
  it.each([
    "<input>", "<label for='outside'>Forward action</label>", "<button type='button'>Nested action</button>",
    "<span role='button'>Fake action</span>", "<span tabindex='0'>Focus target</span>",
    "<span contenteditable>Editor</span>", "<x-widget></x-widget>", "<svg><a href='#'>SVG link</a></svg>",
    "<m-checkbox>Interactive checkbox</m-checkbox>",
    "<m-radio>Radio</m-radio>", "<m-radio-button>RadioButton</m-radio-button>", "<m-radio-group>Group</m-radio-group>", "<m-select>Select</m-select>",
  ])("rejects interactive/custom menuitem descendants %s", markup => {
    const { trigger, menu, edit } = nodes()
    edit.innerHTML = `Edit ${markup}`
    expect(() => createDropdown(trigger, menu)).toThrow()
  })
  it("requires named menu/group lists, safe native button types and no aria-disabled live links", () => {
    const { trigger, menu, edit, preview } = nodes()
    edit.type = "submit"
    expect(() => createDropdown(trigger, menu)).toThrow("type=button")
    edit.type = "button"
    preview.setAttribute("aria-disabled", "true")
    expect(() => createDropdown(trigger, menu)).toThrow("Disable native buttons")
    preview.removeAttribute("aria-disabled")
    menu.removeAttribute("aria-label")
    expect(() => createDropdown(trigger, menu)).toThrow("accessible name")
  })
  it("refuses empty/all-disabled menus rather than inventing a focusable option", () => {
    const { trigger, menu } = nodes()
    for (const item of menu.querySelectorAll("[data-dropdown-item]")) item.parentElement!.hidden = true
    const controller = createDropdown(trigger, menu)
    controllers.push(controller)
    expect(controller.open()).toBe(false)
    menu.showPopover()
    expect(controller.show).toBe(false)
  })
})

describe("complete retained scoped menu keyboard behavior", () => {
  it("opens with trigger ArrowDown/Up and focuses first/last without synthesizing Enter/Space", () => {
    const { trigger, menu, edit, more, controller } = bind()
    expect(key(trigger, "ArrowDown").defaultPrevented).toBe(true)
    expect(controller.show).toBe(true)
    expect(document.activeElement).toBe(edit)
    controller.close()
    key(trigger, "ArrowUp")
    expect(document.activeElement).toBe(more)
    controller.close()
    key(trigger, "Enter")
    key(trigger, " ")
    expect(controller.show).toBe(false)
    expect(menu.getAttribute("role")).toBe("menu")
  })
  it("moves Up/Down/Home/End, wraps and skips disabled items, separators and group labels", () => {
    const { edit, preview, more, item, controller } = bind()
    controller.open()
    key(edit, "ArrowDown")
    expect(document.activeElement).toBe(preview)
    key(preview, "ArrowDown")
    expect(document.activeElement).toBe(item("print"))
    key(item("print"), "End")
    expect(document.activeElement).toBe(more)
    key(more, "ArrowDown")
    expect(document.activeElement).toBe(edit)
    key(edit, "ArrowUp")
    expect(document.activeElement).toBe(more)
    key(more, "Home")
    expect(document.activeElement).toBe(edit)
  })
  it("supports case-insensitive prefix typeahead and repeated-character cycling", () => {
    const { edit, preview, item, controller } = bind()
    controller.open()
    key(edit, "p")
    expect(document.activeElement).toBe(preview)
    key(preview, "P", { shiftKey: true })
    expect(document.activeElement).toBe(item("print"))
    key(item("print"), "p")
    expect(document.activeElement).toBe(item("profile"))
    controller.close()
    controller.open()
    key(edit, "p")
    key(preview, "r")
    key(preview, "o")
    expect(document.activeElement).toBe(item("profile"))
  })
  it("uses explicit typeahead labels, times out search and ignores IME/Alt/Ctrl/Meta shortcuts", async () => {
    const pair = nodes()
    pair.edit.textContent = "✎ Edit"
    pair.edit.setAttribute("data-dropdown-label", "Edit")
    const controller = createDropdown(pair.trigger, pair.menu, { typeaheadDuration: 15 })
    controllers.push(controller)
    controller.open()
    key(pair.edit, "p", { isComposing: true })
    key(pair.edit, "p", { ctrlKey: true })
    key(pair.edit, "p", { metaKey: true })
    key(pair.edit, "p", { altKey: true })
    expect(document.activeElement).toBe(pair.edit)
    key(pair.edit, "p")
    await new Promise(resolve => setTimeout(resolve, 25))
    key(pair.preview, "e")
    expect(document.activeElement).toBe(pair.edit)
  })
  it("lets native buttons own Enter/Space and adds exactly one missing anchor Space activation", async () => {
    const { edit, preview, menu, controller } = bind()
    const editClick = vi.fn()
    const linkClick = vi.fn()
    const selections = vi.fn()
    edit.addEventListener("click", editClick)
    preview.addEventListener("click", linkClick)
    menu.addEventListener("m:dropdown-select", selections)
    controller.open()
    key(edit, "Enter")
    key(edit, " ")
    key(edit, " ", {}, "keyup")
    await flush()
    expect(editClick).not.toHaveBeenCalled()
    preview.focus()
    expect(key(preview, " ").defaultPrevented).toBe(true)
    key(preview, " ", { repeat: true })
    key(preview, " ", {}, "keyup")
    await flush()
    expect(linkClick).toHaveBeenCalledOnce()
    expect(selections).toHaveBeenCalledOnce()
    expect(controller.value).toBe("preview")
    expect(controller.show).toBe(false)
  })
  it("opens submenus on logical arrows, returns on opposite arrow/Escape and preserves parent focus", () => {
    const { more, child, item, menu, controller } = bind()
    controller.open()
    more.focus()
    expect(opened.has(child)).toBe(false)
    key(more, "ArrowRight")
    expect(opened.has(child)).toBe(true)
    expect(document.activeElement).toBe(item("rename"))
    key(item("rename"), "ArrowLeft")
    expect(opened.has(child)).toBe(false)
    expect(document.activeElement).toBe(more)
    key(more, "ArrowRight")
    key(item("rename"), "Escape")
    expect(opened.has(child)).toBe(false)
    expect(opened.has(menu)).toBe(true)
    expect(document.activeElement).toBe(more)
    key(more, "Escape")
    expect(controller.show).toBe(false)
  })
  it("reverses logical submenu arrows in RTL without reversing Up/Down", () => {
    const pair = nodes()
    pair.menu.dir = "rtl"
    pair.more.style.direction = "rtl"
    pair.more.getBoundingClientRect = () => rect(350, 250, 100, 30)
    pair.item("rename").style.direction = "rtl"
    const controller = createDropdown(pair.trigger, pair.menu)
    controllers.push(controller)
    controller.open()
    pair.more.focus()
    key(pair.more, "ArrowLeft")
    expect(opened.has(pair.child)).toBe(true)
    expect(pair.child.dataset.popoverPlacement).toContain("left")
    key(pair.item("rename"), "ArrowRight")
    expect(opened.has(pair.child)).toBe(false)
    expect(document.activeElement).toBe(pair.more)
  })
  it("lets Tab leave without preventing default and preserves the native destination on closure", async () => {
    const { edit, controller } = bind()
    const outside = document.createElement("button")
    document.body.append(outside)
    controller.open()
    const event = key(edit, "Tab")
    expect(event.defaultPrevented).toBe(false)
    outside.focus()
    await flush()
    expect(controller.show).toBe(false)
    expect(document.activeElement).toBe(outside)
  })
  it("restores roving state when a later handler cancels Tab", async () => {
    const { menu, preview, controller } = bind()
    controller.open()
    preview.focus()
    menu.addEventListener("keydown", event => { if ((event as KeyboardEvent).key === "Tab") event.preventDefault() })
    key(preview, "Tab")
    await flush()
    expect(controller.show).toBe(true)
    expect(document.activeElement).toBe(preview)
    expect(preview.tabIndex).toBe(0)
  })
  it("provides a reusable keyboard primitive with correct no-current ArrowUp and disposal", () => {
    const { menu, edit, preview } = nodes()
    const keyboard = createMenuKeyboard(menu)
    keyboard.refresh([{ element: edit, label: "Edit" }, { element: preview, label: "Preview" }])
    keyboard.suspend()
    keyboard.handle(new KeyboardEvent("keydown", { key: "ArrowUp" }))
    const event = new KeyboardEvent("keydown", { key: "ArrowUp", cancelable: true })
    Object.defineProperty(event, "target", { value: edit })
    keyboard.handle(event)
    expect(keyboard.current).toBe(preview)
    keyboard.disconnect()
    expect(edit.hasAttribute("tabindex")).toBe(false)
    expect(preview.hasAttribute("tabindex")).toBe(false)
  })
  it("keeps default roving behavior while ignoring content hidden by native details", () => {
    const { menu, edit, preview } = nodes()
    const details = document.createElement("details")
    const summary = document.createElement("summary")
    summary.textContent = "Disclosure"
    details.append(summary, preview)
    menu.append(details)
    const keyboard = createMenuKeyboard(menu)
    keyboard.refresh([{ element: edit, label: "Edit" }, { element: preview, label: "Preview" }])
    expect(keyboard.available).toEqual([edit])
    expect(edit.tabIndex).toBe(0)
    details.open = true
    expect(keyboard.available).toEqual([edit, preview])
    keyboard.disconnect()
  })
})

describe("native selection, submenu intent and lifetime", () => {
  it("notifies only accepted leaf actions with string key, DOM item and owned key path", async () => {
    const { more, item, menu, controller } = bind()
    const selections: unknown[] = []
    menu.addEventListener("m:dropdown-select", event => selections.push((event as CustomEvent).detail))
    controller.open()
    more.focus()
    key(more, "ArrowRight")
    ;(item("rename") as HTMLButtonElement).click()
    await flush()
    expect(selections).toHaveLength(1)
    expect(selections[0]).toMatchObject({ key: "rename", item: item("rename"), path: ["more", "rename"] })
    expect(controller.value).toBe("rename")
    expect(controller.show).toBe(false)
  })
  it("honors late defaultPrevented and ignores modified/download/external-target selection without blocking navigation", async () => {
    const { edit, preview, item, menu, controller } = bind()
    const select = vi.fn()
    menu.addEventListener("m:dropdown-select", select)
    controller.open()
    edit.addEventListener("click", event => event.preventDefault())
    edit.click()
    preview.dispatchEvent(new MouseEvent("click", { ctrlKey: true, bubbles: true, cancelable: true }))
    ;(item("separate") as HTMLAnchorElement).dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    await flush()
    expect(select).not.toHaveBeenCalled()
    expect(controller.show).toBe(true)
    const event = new MouseEvent("click", { metaKey: true, cancelable: true, bubbles: true })
    preview.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
  it("does not submit an enclosing form through menu decisions", async () => {
    const { trigger, menu, edit, controller } = bind()
    const form = document.createElement("form")
    const submit = vi.fn((event: Event) => event.preventDefault())
    form.addEventListener("submit", submit)
    document.body.append(form)
    form.append(trigger, menu)
    controller.open()
    edit.click()
    await flush()
    expect(submit).not.toHaveBeenCalled()
  })
  it("delays pointer submenu opening without focus theft and retains travel into the panel", async () => {
    const { more, child, controller } = bind({ submenuDelay: 10, submenuDuration: 30 })
    controller.open()
    const focused = document.activeElement
    pointer(more, "pointerenter")
    await new Promise(resolve => setTimeout(resolve, 15))
    expect(opened.has(child)).toBe(true)
    expect(document.activeElement).toBe(focused)
    pointer(more, "pointerleave")
    pointer(child, "pointerenter")
    await new Promise(resolve => setTimeout(resolve, 40))
    expect(opened.has(child)).toBe(true)
    pointer(child, "pointerleave")
    await new Promise(resolve => setTimeout(resolve, 40))
    expect(opened.has(child)).toBe(false)
    pointer(more, "pointerenter")
    await new Promise(resolve => setTimeout(resolve, 15))
    key(focused as HTMLElement, "Escape")
    expect(opened.has(child)).toBe(false)
    expect(controller.show).toBe(true)
    expect(document.activeElement).toBe(focused)
  })
  it("does not replace a keyboard-focused submenu merely by hovering a sibling", async () => {
    const pair = nodes()
    const li = document.createElement("li")
    li.innerHTML = `<button type="button" data-dropdown-item data-dropdown-key="peer" popovertarget="${pair.menu.id}-peer">Peer</button>
      <ul class="m-popover m-dropdown" data-dropdown-menu popover="auto" aria-label="Peer menu" id="${pair.menu.id}-peer">
        <li><button type="button" data-dropdown-item data-dropdown-key="peer-leaf">Peer leaf</button></li></ul>`
    pair.menu.append(li)
    for (const element of li.querySelectorAll<HTMLElement>("*")) element.getBoundingClientRect = () => rect(300, 250, 100, 60)
    const controller = createDropdown(pair.trigger, pair.menu, { submenuDelay: 5 })
    controllers.push(controller)
    controller.open()
    pair.more.focus()
    key(pair.more, "ArrowRight")
    pointer(li.querySelector("button")!, "pointerenter")
    await new Promise(resolve => setTimeout(resolve, 15))
    expect(document.activeElement).toBe(pair.item("rename"))
    expect(opened.has(pair.child)).toBe(true)
    expect(opened.has(li.querySelector("[data-dropdown-menu]")! as HTMLElement)).toBe(false)
  })
  it("cancels pending pointer openings, selection tasks and typeahead on hide/disconnect/rebind", async () => {
    const { more, child, edit, menu, controller } = bind({ submenuDelay: 20 })
    const select = vi.fn()
    menu.addEventListener("m:dropdown-select", select)
    controller.open()
    pointer(more, "pointerenter")
    edit.click()
    controller.close()
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(opened.has(child)).toBe(false)
    expect(select).not.toHaveBeenCalled()
    controller.open()
    key(edit, "p")
    controller.disconnect()
    controller.connect()
    controller.open()
    expect(document.activeElement).toBe(edit)
  })
  it("auto-refresh closes and rebinds changed items, preserves identity/value and recovers removed focus", async () => {
    const { menu, item, controller, trigger } = bind({ value: "preview" })
    const preview = item("preview")
    controller.open()
    preview.focus()
    preview.parentElement!.hidden = true
    await flush()
    expect(controller.connected).toBe(true)
    expect(controller.show).toBe(false)
    expect(controller.value).toBe("preview")
    expect(item("preview")).toBe(preview)
    expect(document.activeElement).toBe(trigger)
    preview.parentElement!.remove()
    await flush()
    expect(controller.value).toBeNull()
    expect(menu.getAttribute("role")).toBe("menu")
  })
  it("returns focus when native disabling has already blurred a focused menuitem", async () => {
    const { edit, trigger, controller } = bind()
    vi.spyOn(document, "hasFocus").mockReturnValue(true)
    controller.open()
    edit.disabled = true
    edit.blur()
    await flush()
    expect(controller.connected).toBe(true)
    expect(controller.show).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })
  it("refresh and selection closure do not overwrite authored closing-listener focus", async () => {
    const { menu, edit, controller } = bind()
    const outside = document.createElement("button")
    document.body.append(outside)
    menu.addEventListener("beforetoggle", event => { if ((event as ToggleEvent).newState === "closed") outside.focus() })
    controller.open()
    controller.refresh()
    expect(document.activeElement).toBe(outside)
    controller.open()
    edit.click()
    await flush()
    expect(document.activeElement).toBe(outside)
  })
  it("rejects invalid dynamic items with an explicit error and no partial active tree", async () => {
    const { menu, edit, controller } = bind()
    const errors = vi.fn()
    menu.addEventListener("m:dropdown-error", errors)
    controller.open()
    edit.type = "submit"
    await flush()
    expect(controller.connected).toBe(false)
    expect(controller.show).toBe(false)
    expect(menu.hasAttribute("role")).toBe(false)
    expect(errors).toHaveBeenCalledOnce()
    expect(() => controller.refresh()).toThrow("Connect")
  })
  it("fully disposes a removed open tree and preserves unrelated author attributes", async () => {
    const { menu, trigger, edit, controller } = bind()
    controller.open()
    menu.remove()
    await flush()
    expect(controller.connected).toBe(false)
    expect(trigger.hasAttribute("aria-haspopup")).toBe(false)
    expect(edit.hasAttribute("tabindex")).toBe(false)
    expect(menu.hasAttribute("style")).toBe(false)
  })
  it("cancels native opening when a callback disconnects, without stale roving writes", () => {
    const { trigger, menu, edit } = nodes()
    let controller!: DropdownController
    menu.addEventListener("beforetoggle", event => {
      if ((event as ToggleEvent).newState === "open") controller.disconnect()
    })
    controller = createDropdown(trigger, menu)
    controllers.push(controller)
    expect(controller.open()).toBe(false)
    expect(controller.connected).toBe(false)
    expect(opened.has(menu)).toBe(false)
    expect(edit.hasAttribute("tabindex") || edit.hasAttribute("role")).toBe(false)
    controller.disconnect()
    expect(edit.hasAttribute("tabindex")).toBe(false)
  })
  it("does not notify selection after a closing callback disconnects the binding", async () => {
    const { menu, edit, controller } = bind()
    const selected = vi.fn()
    menu.addEventListener("m:dropdown-select", selected)
    menu.addEventListener("beforetoggle", event => {
      if ((event as ToggleEvent).newState === "closed") controller.disconnect()
    })
    controller.open()
    edit.click()
    await flush()
    expect(controller.connected).toBe(false)
    expect(selected).not.toHaveBeenCalled()
  })
  it("defers refresh during opening callbacks and cancels the old native opening", async () => {
    const { menu, edit, controller } = bind()
    const refresh = (event: Event) => {
      if ((event as ToggleEvent).newState === "open") controller.refresh()
    }
    menu.addEventListener("beforetoggle", refresh)
    expect(controller.open()).toBe(false)
    await flush()
    expect(controller.connected).toBe(true)
    expect(controller.show).toBe(false)
    menu.removeEventListener("beforetoggle", refresh)
    expect(controller.open()).toBe(true)
    expect(document.activeElement).toBe(edit)
  })
  it("keeps independent trees and duplicate ownership explicit", () => {
    const first = bind()
    const second = bind()
    expect(() => createDropdown(first.trigger, first.menu)).toThrow()
    first.controller.open()
    second.controller.open()
    first.controller.disconnect()
    expect(second.controller.connected).toBe(true)
    expect(second.controller.show).toBe(true)
  })
})

describe("native list fallback and distribution", () => {
  it("keeps native destinations and Tab order without menu roles when Popover is unavailable", async () => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover
    const { menu, child, edit, preview, controller } = bind()
    expect(controller.inline).toBe(true)
    expect(controller.open()).toBe(false)
    expect(menu.hasAttribute("popover") || child.hasAttribute("popover")).toBe(false)
    expect(menu.hasAttribute("role") || edit.hasAttribute("role") || edit.hasAttribute("tabindex")).toBe(false)
    expect(preview.getAttribute("href")).toBe("#destination")
    edit.click()
    await flush()
    expect(controller.value).toBe("edit")
    expect(menu.hidden).toBe(false)
    controller.disconnect()
    expect(menu.getAttribute("popover")).toBe("auto")
  })
  it("composes maintained CSS, keeps keyboard reusable and exports no registration/provider engine", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./dropdown"].import).toBe("./dist/markup-ui-dropdown.js")
    expect(readFileSync("scripts/build.mjs", "utf8")).toContain('name === "dropdown"')
    const source = readFileSync("src\\components\\dropdown\\controller.ts", "utf8")
    const keyboard = readFileSync("src/components/dropdown/keyboard.ts", "utf8")
    const css = readFileSync("src/components/dropdown/dropdown.css", "utf8")
    expect(source).toContain("createPopover")
    expect(source).not.toContain("createPopoverPositioner")
    expect(source).not.toContain("innerHTML")
    expect(source).not.toContain("customElements")
    expect(keyboard).not.toContain("createPopover(")
    expect(css).not.toContain("@import")
    expect(css).toContain("forced-colors")
  })
})
