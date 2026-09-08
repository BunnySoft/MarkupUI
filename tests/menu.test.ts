import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createMenu } from "../src/components/menu/index.js"
import type { MenuController, MenuOptions } from "../src/components/menu/index.js"
import { createMenuKeyboard, menuEntryAvailable } from "../src/components/dropdown/keyboard.js"

const controllers: MenuController[] = []
let sequence = 0
function nodes() {
  const root = document.createElement("nav")
  root.className = "mui-menu"
  root.setAttribute("data-menu", "")
  root.setAttribute("aria-label", "Local navigation")
  root.innerHTML = `
    <details data-menu-collapse open><summary id="summary-${sequence}">Navigation</summary>
      <ul data-menu-list>
        <li><a data-menu-item data-menu-key="home" href="#home" aria-current="page">Home</a></li>
        <li><details data-menu-branch data-menu-key="guide"><summary>Guide</summary><ul data-menu-list>
          <li><a data-menu-item data-menu-key="install" href="#install">Installation</a></li>
          <li><details data-menu-branch data-menu-key="advanced"><summary>Advanced</summary><ul data-menu-list>
            <li><a data-menu-item data-menu-key="performance" href="#performance">Performance</a></li>
          </ul></details></li>
        </ul></details></li>
        <li data-menu-divider data-menu-key="divider"></li>
        <li><span id="group-${sequence}" data-menu-group-label>Group</span><ul data-menu-group data-menu-key="group" aria-labelledby="group-${sequence}">
          <li><details data-menu-branch data-menu-key="settings"><summary>Settings</summary><ul data-menu-list>
            <li><a data-menu-item data-menu-key="profile" href="#profile">Profile</a></li>
          </ul></details></li>
          <li><button type="button" data-menu-item data-menu-key="preview">Preview locally</button></li>
          <li><button type="button" data-menu-item data-menu-key="disabled" disabled>Disabled</button></li>
        </ul></li>
      </ul>
    </details>`
  sequence++
  document.body.append(root)
  const node = (key: string) => root.querySelector<HTMLElement>(`[data-menu-key="${key}"]`)!
  const branch = (key: string) => node(key) as HTMLDetailsElement
  const summary = (key: string) => branch(key).firstElementChild as HTMLElement
  return { root, node, branch, summary, fold: root.querySelector<HTMLDetailsElement>("[data-menu-collapse]")! }
}
function bind(options: MenuOptions = {}) {
  const pair = nodes()
  const controller = createMenu(pair.root, options)
  controllers.push(controller)
  return { ...pair, controller }
}
function key(node: HTMLElement, key: string, extra: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra })
  node.dispatchEvent(event)
  return event
}
async function flush() {
  for (let index = 0; index < 3; index++) await new Promise(resolve => setTimeout(resolve, 0))
}
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("native navigation, defaults and state", () => {
  it("preserves native semantics, every Tab stop and authored aria-current/listeners/templates", async () => {
    const { root, node } = nodes()
    const home = node("home")
    home.setAttribute("tabindex", "3")
    const label = home.firstChild
    const template = document.createElement("template")
    template.innerHTML = "<a data-menu-item data-menu-key='inert-template' href='#inert'>Not instantiated</a>"
    root.querySelector("[data-menu-list]")!.append(template)
    const native = vi.fn()
    home.addEventListener("click", native)
    const controller = createMenu(root, { defaultValue: "home" })
    controllers.push(controller)
    expect(root.localName).toBe("nav")
    expect(root.querySelector("[role=menu], [role=menubar], [role=menuitem], [aria-selected]")).toBeNull()
    expect(home.tabIndex).toBe(3)
    expect(node("preview").hasAttribute("tabindex")).toBe(false)
    controller.value = "preview"
    expect(home.getAttribute("aria-current")).toBe("page")
    expect(node("preview").hasAttribute("data-menu-selected")).toBe(true)
    controller.disconnect()
    home.click()
    await flush()
    expect(native).toHaveBeenCalledOnce()
    expect(home.firstChild).toBe(label)
    expect(home.getAttribute("tabindex")).toBe("3")
    expect(node("preview").hasAttribute("data-menu-selected")).toBe(false)
    expect(template.content.querySelector("a")).not.toBeNull()
  })
  it("adopts authored open defaults, applies explicit defaults once and preserves native state on disposal", async () => {
    const pair = nodes()
    pair.branch("guide").open = true
    const controller = createMenu(pair.root, { defaultValue: "home" })
    controllers.push(controller)
    expect(controller.expandedKeys).toEqual(["guide"])
    controller.expandedKeys = ["guide", "advanced"]
    controller.collapsed = true
    await flush()
    controller.disconnect()
    expect(pair.branch("advanced").open).toBe(true)
    expect(pair.fold.open).toBe(false)
    controller.connect()
    expect(controller.expandedKeys).toEqual(["guide", "advanced"])
    expect(controller.collapsed).toBe(true)
  })
  it("defines live/default precedence without generating selection or synthetic expansion callbacks", async () => {
    const { root, controller } = bind({ value: "preview", defaultValue: "home", expandedKeys: ["settings"], defaultExpandedKeys: ["guide"] })
    const selected = vi.fn(), expanded = vi.fn()
    root.addEventListener("mui:menu-select", selected)
    root.addEventListener("mui:change:expanded-keys", expanded)
    expect(controller.value).toBe("preview")
    expect(controller.expandedKeys).toEqual(["settings"])
    controller.value = "home"
    controller.expandedKeys = ["guide"]
    await flush()
    expect(selected).not.toHaveBeenCalled()
    expect(expanded).not.toHaveBeenCalled()
  })
  it("expands all eligible native branches and validates accordion/default conflicts", () => {
    const pair = nodes()
    const controller = createMenu(pair.root, { defaultExpandAll: true })
    controllers.push(controller)
    expect(controller.expandedKeys).toEqual(["guide", "advanced", "settings"])
    controller.disconnect()
    expect(() => createMenu(pair.root, { defaultExpandAll: true, accordion: true })).toThrow("one expanded root")
  })
  it("supports explicit root-level accordion without collapsing independent nested branches", async () => {
    const { controller, branch, summary } = bind({ accordion: true, defaultExpandedKeys: ["guide", "advanced"] })
    expect(controller.expandedKeys).toEqual(["guide", "advanced"])
    summary("settings").click()
    await flush()
    expect(branch("guide").open).toBe(false)
    expect(branch("settings").open).toBe(true)
    expect(branch("advanced").open).toBe(true)
    expect(() => { controller.expandedKeys = ["guide", "settings"] }).toThrow("one expanded root")
    controller.accordion = false
    controller.expandedKeys = ["guide", "settings", "advanced"]
    expect(controller.expandedKeys).toEqual(["guide", "advanced", "settings"])
  })
  it("reveals an option without routing, selecting it or focusing that destination", async () => {
    const { controller, node, fold } = bind({ defaultValue: "home", collapsed: true })
    const outside = document.createElement("button")
    document.body.append(outside)
    outside.focus()
    expect(controller.showOption("performance")).toBe(true)
    await flush()
    expect(controller.expandedKeys).toEqual(["guide", "advanced"])
    expect(fold.open).toBe(true)
    expect(controller.value).toBe("home")
    expect(document.activeElement).toBe(outside)
    node("performance").hidden = true
    await flush()
    expect(controller.showOption("performance")).toBe(false)
    expect(() => controller.showOption("missing")).toThrow("existing string")
  })
  it("requires an actual overall disclosure for collapsed and keeps layout mode separate", async () => {
    const { controller, fold } = bind()
    controller.mode = "horizontal"
    controller.collapsed = true
    await flush()
    expect(fold.open).toBe(false)
    expect(controller.collapsed).toBe(true)
    controller.mode = "vertical"
    expect(controller.collapsed).toBe(true)
    expect(() => { controller.mode = "bad" as never }).toThrow("vertical or horizontal")
    controller.disconnect()
    const pair = nodes()
    const list = pair.fold.querySelector("[data-menu-list]")!
    pair.root.append(list)
    pair.fold.remove()
    const fixed = createMenu(pair.root)
    controllers.push(fixed)
    expect(fixed.collapsible).toBe(false)
    expect(() => { fixed.collapsed = true }).toThrow("disclosure")
  })
  it.each([{ options: [] }, { responsive: true }, { dropdownProps: {} }, { typeaheadDuration: NaN }, { accordion: "true" }, { value: 1 }])("rejects unsupported or invalid options %j", options => {
    const { root } = nodes()
    expect(() => createMenu(root, options as MenuOptions)).toThrow()
  })
  it("validates keys, required anatomy, native controls and role distinctions", () => {
    const { root, node, branch } = nodes()
    node("home").setAttribute("data-menu-key", "preview")
    expect(() => createMenu(root)).toThrow("unique")
    node("preview").setAttribute("data-menu-key", "home")
    root.setAttribute("role", "menubar")
    expect(() => createMenu(root)).toThrow("navigation")
    root.removeAttribute("role")
    branch("guide").setAttribute("name", "foreign-group")
    expect(() => createMenu(root)).toThrow("unnamed details")
  })
  it("rejects active aria-disabled links, nested actions and inert expansion requests", () => {
    const { root, node, branch } = nodes()
    node("home").setAttribute("aria-disabled", "true")
    expect(() => createMenu(root)).toThrow("native labels")
    node("home").removeAttribute("aria-disabled")
    node("home").innerHTML = "<label for='external'>Forwarded control</label>"
    expect(() => createMenu(root)).toThrow("nested")
    node("home").textContent = "Home"
    branch("guide").setAttribute("inert", "")
    const controller = createMenu(root)
    controllers.push(controller)
    expect(controller.showOption("install")).toBe(false)
    expect(() => { controller.expandedKeys = ["guide"] }).toThrow("hidden or inert")
  })
})

describe("shared keyboard shortcuts without roving navigation Tab stops", () => {
  it("moves among the current level, skipping group labels, dividers and disabled controls", () => {
    const { node, summary } = bind()
    node("home").focus()
    key(node("home"), "ArrowDown")
    expect(document.activeElement).toBe(summary("guide"))
    key(summary("guide"), "ArrowDown")
    expect(document.activeElement).toBe(summary("settings"))
    key(summary("settings"), "ArrowDown")
    expect(document.activeElement).toBe(node("preview"))
    key(node("preview"), "ArrowDown")
    expect(document.activeElement).toBe(node("home"))
    key(node("home"), "End")
    expect(document.activeElement).toBe(node("preview"))
    key(node("preview"), "Home")
    expect(document.activeElement).toBe(node("home"))
    expect(node("home").hasAttribute("tabindex")).toBe(false)
  })
  it("expands/enters with logical forward and collapses/returns with backward or Escape", async () => {
    const { node, branch, summary, controller, fold } = bind()
    summary("guide").focus()
    key(summary("guide"), "ArrowRight")
    expect(branch("guide").open).toBe(true)
    expect(document.activeElement).toBe(node("install"))
    key(node("install"), "ArrowDown")
    expect(document.activeElement).toBe(summary("advanced"))
    key(summary("advanced"), "ArrowRight")
    expect(document.activeElement).toBe(node("performance"))
    key(node("performance"), "Escape")
    expect(branch("advanced").open).toBe(false)
    expect(document.activeElement).toBe(summary("advanced"))
    key(summary("advanced"), "ArrowLeft")
    expect(branch("guide").open).toBe(false)
    expect(document.activeElement).toBe(summary("guide"))
    key(summary("guide"), "Escape")
    expect(controller.collapsed).toBe(true)
    expect(document.activeElement).toBe(fold.firstElementChild)
    await flush()
  })
  it("uses horizontal logical movement and vertical branch entry without changing DOM order", () => {
    const { node, summary, controller, root } = bind({ mode: "horizontal" })
    const order = [...root.querySelectorAll("[data-menu-key]")].map(node => node.getAttribute("data-menu-key"))
    node("home").focus()
    key(node("home"), "ArrowRight")
    expect(document.activeElement).toBe(summary("guide"))
    key(summary("guide"), "ArrowDown")
    expect(document.activeElement).toBe(node("install"))
    key(node("install"), "ArrowLeft")
    expect(document.activeElement).toBe(summary("guide"))
    controller.mode = "vertical"
    expect([...root.querySelectorAll("[data-menu-key]")].map(node => node.getAttribute("data-menu-key"))).toEqual(order)
  })
  it("supports RTL arrows and typeahead while ignoring composition/modifier shortcuts", () => {
    const { node, summary } = bind({ mode: "horizontal" })
    node("home").style.direction = "rtl"
    summary("guide").style.direction = "rtl"
    node("install").style.direction = "rtl"
    node("home").focus()
    key(node("home"), "ArrowLeft")
    expect(document.activeElement).toBe(summary("guide"))
    key(summary("guide"), "ArrowDown")
    expect(document.activeElement).toBe(node("install"))
    key(node("install"), "ArrowRight")
    expect(document.activeElement).toBe(summary("guide"))
    key(summary("guide"), "p", { ctrlKey: true })
    key(summary("guide"), "p", { isComposing: true })
    expect(document.activeElement).toBe(summary("guide"))
    key(summary("guide"), "p")
    expect(document.activeElement).toBe(node("preview"))
  })
  it("preserves native Tab/Enter/Space behavior rather than synthesizing menuitem activation", async () => {
    const { node, summary, branch } = bind()
    const clicked = vi.fn()
    node("preview").addEventListener("click", clicked)
    node("preview").focus()
    expect(key(node("preview"), "Tab").defaultPrevented).toBe(false)
    expect(key(node("home"), " ").defaultPrevented).toBe(false)
    key(node("preview"), "Enter")
    key(node("preview"), " ")
    await flush()
    expect(clicked).not.toHaveBeenCalled()
    summary("guide").click()
    await flush()
    expect(branch("guide").open).toBe(true)
  })
  it("opens an overall disclosure from ArrowDown/Up and closes it with Escape", async () => {
    const { fold, node, controller } = bind({ collapsed: true })
    const summary = fold.firstElementChild as HTMLElement
    summary.focus()
    key(summary, "ArrowDown")
    expect(controller.collapsed).toBe(false)
    expect(document.activeElement).toBe(node("home"))
    controller.collapsed = true
    summary.focus()
    key(summary, "ArrowUp")
    expect(document.activeElement).toBe(node("preview"))
    summary.focus()
    key(summary, "Escape")
    expect(controller.collapsed).toBe(true)
    await flush()
  })
  it("repairs focus hidden by programmatic expansion or overall collapse without fake user events", async () => {
    const { node, summary, fold, controller } = bind({ expandedKeys: ["guide"] })
    node("install").focus()
    controller.expandedKeys = []
    await flush()
    expect(document.activeElement).toBe(summary("guide"))
    controller.collapsed = true
    await flush()
    expect(document.activeElement).toBe(fold.firstElementChild)
  })
  it("extends the existing primitive with nonroving mode and native closed-details availability", () => {
    const { root, branch, node, summary } = nodes()
    const keyboard = createMenuKeyboard(root, 500, false)
    keyboard.refresh([{ element: node("home"), label: "Home" }, { element: summary("guide"), label: "Guide" }, { element: node("install"), label: "Installation" }])
    expect(menuEntryAvailable(summary("guide"), root)).toBe(true)
    expect(menuEntryAvailable(node("install"), root)).toBe(false)
    branch("guide").open = true
    expect(menuEntryAvailable(node("install"), root)).toBe(true)
    keyboard.focus(node("install"))
    expect(node("install").hasAttribute("tabindex")).toBe(false)
    keyboard.disconnect()
  })
})

describe("native selection, refresh and cleanup", () => {
  it("notifies only accepted unmodified native leaf actions with string/DOM/path detail", async () => {
    const { root, controller, node } = bind()
    const selections: unknown[] = []
    root.addEventListener("mui:menu-select", event => selections.push((event as CustomEvent).detail))
    controller.showOption("performance")
    node("performance").click()
    await flush()
    expect(selections).toHaveLength(1)
    expect(selections[0]).toMatchObject({ key: "performance", item: node("performance"), path: ["guide", "advanced", "performance"] })
    expect(controller.value).toBe("performance")
    expect(node("home").getAttribute("aria-current")).toBe("page")
  })
  it("honors delegated defaultPrevented and modifier/target links without routing or fake selection", async () => {
    const { root, node, controller } = bind()
    const selected = vi.fn()
    root.addEventListener("mui:menu-select", selected)
    root.addEventListener("click", event => event.preventDefault())
    node("preview").click()
    node("home").dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true, cancelable: true }))
    await flush()
    expect(selected).not.toHaveBeenCalled()
    expect(controller.value).toBeNull()
  })
  it("does not submit surrounding forms through native type=button actions", async () => {
    const { root, node } = bind()
    const form = document.createElement("form")
    document.body.append(form)
    form.append(root)
    const submit = vi.fn((event: Event) => event.preventDefault())
    form.addEventListener("submit", submit)
    node("preview").click()
    await flush()
    expect(submit).not.toHaveBeenCalled()
  })
  it("refresh preserves native open state, nodes and surviving value without replaying defaults", async () => {
    const { root, controller, branch, node } = bind({ defaultValue: "home", defaultExpandedKeys: ["guide"] })
    controller.value = "preview"
    branch("advanced").open = true
    const preview = node("preview")
    preview.textContent = "Updated preview"
    await flush()
    expect(controller.value).toBe("preview")
    expect(controller.expandedKeys).toEqual(["guide", "advanced"])
    expect(node("preview")).toBe(preview)
    root.setAttribute("data-menu-mode", "horizontal")
    controller.refresh()
    expect(controller.mode).toBe("horizontal")
  })
  it("preserves the keyboard position of a still-focused item through explicit and automatic refresh", async () => {
    const { node, summary, controller } = bind()
    node("preview").focus()
    controller.refresh()
    key(node("preview"), "ArrowUp")
    expect(document.activeElement).toBe(summary("settings"))
    node("preview").focus()
    node("home").textContent = "Updated home"
    await flush()
    key(node("preview"), "ArrowDown")
    expect(document.activeElement).toBe(node("home"))
  })
  it("preserves an accepted leaf click across routine refresh but revalidates key and node identity", async () => {
    const { root, node, controller } = bind()
    const events: unknown[] = []
    root.addEventListener("mui:menu-select", event => events.push((event as CustomEvent).detail))
    node("preview").addEventListener("click", () => { node("preview").textContent = "Updated by action" })
    node("preview").click()
    await flush()
    expect(controller.value).toBe("preview")
    expect(events).toHaveLength(1)
    const link = node("home") as HTMLAnchorElement
    const retarget = () => { link.target = "_blank" }
    link.addEventListener("click", retarget)
    link.click()
    await flush()
    expect(events).toHaveLength(1)
    link.removeEventListener("click", retarget)
    link.removeAttribute("target")
    await flush()
    node("home").addEventListener("click", () => { node("home").setAttribute("data-menu-key", "new-home") })
    node("home").click()
    await flush()
    expect(events).toHaveLength(1)
  })
  it("recovers disabled/removed focused items to a safe surviving control and clears removed value", async () => {
    vi.spyOn(document, "hasFocus").mockReturnValue(true)
    const { controller, node, summary } = bind({ value: "install", expandedKeys: ["guide"] })
    node("install").focus()
    node("install").remove()
    await flush()
    expect(controller.value).toBeNull()
    expect(document.activeElement).toBe(summary("guide"))
    node("preview").focus()
    ;(node("preview") as HTMLButtonElement).disabled = true
    node("preview").blur()
    await flush()
    expect(document.activeElement?.localName).toBe("summary")
  })
  it("does not restore stale navigation focus after an outside pointer interaction", async () => {
    vi.spyOn(document, "hasFocus").mockReturnValue(true)
    const { node, controller, branch } = bind({ expandedKeys: ["guide"] })
    node("install").focus()
    document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }))
    node("install").blur()
    branch("guide").open = false
    await flush()
    expect(document.activeElement).toBe(document.body)
    expect(controller.connected).toBe(true)
  })
  it("restores owned decoration/names while preserving native open, current-route and foreign marker state", async () => {
    const { root, controller, branch, node } = bind({ accordion: true, expandedKeys: ["guide"] })
    node("home").setAttribute("data-menu-selected", "author")
    branch("advanced").open = true
    await flush()
    controller.disconnect()
    expect(root.hasAttribute("data-menu-mode")).toBe(false)
    expect(node("home").getAttribute("data-menu-selected")).toBe("author")
    expect(node("home").getAttribute("aria-current")).toBe("page")
    expect(branch("guide").hasAttribute("name")).toBe(false)
    expect(branch("advanced").open).toBe(true)
  })
  it("releases removed roots and pending selection tasks without modifying detached UI later", async () => {
    const { root, controller, node } = bind()
    const selected = vi.fn()
    root.addEventListener("mui:menu-select", selected)
    node("preview").click()
    root.remove()
    await flush()
    expect(controller.connected).toBe(false)
    expect(selected).not.toHaveBeenCalled()
    expect(root.hasAttribute("data-menu-mode")).toBe(false)
  })
  it("rejects invalid live native actions and duplicate controller ownership explicitly", async () => {
    const { root, controller, node } = bind()
    expect(() => createMenu(root)).toThrow("active controller")
    const errors = vi.fn()
    root.addEventListener("mui:menu-error", errors)
    ;(node("preview") as HTMLButtonElement).type = "submit"
    await flush()
    expect(controller.connected).toBe(false)
    expect(errors).toHaveBeenCalledOnce()
  })
  it("does not release a replacement controller when old disposal is repeated", () => {
    const { root, controller } = bind()
    controller.disconnect()
    const replacement = createMenu(root)
    controllers.push(replacement)
    controller.disconnect()
    expect(() => createMenu(root)).toThrow("active controller")
    expect(replacement.connected).toBe(true)
  })
  it("keeps independent nested navigation roots isolated", async () => {
    const first = bind()
    const second = bind()
    first.root.append(second.root)
    await flush()
    second.node("preview").click()
    await flush()
    expect(second.controller.value).toBe("preview")
    expect(first.controller.value).toBeNull()
    first.controller.disconnect()
    expect(second.controller.connected).toBe(true)
  })
  it("ships external CSS and reuses the existing primitive without importing a Popup engine", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./menu"].import).toBe("./dist/markup-ui-menu.js")
    const source = readFileSync("src/components/menu/menu.ts", "utf8")
    const css = readFileSync("src/components/menu/menu.css", "utf8")
    expect(source).toContain("createMenuKeyboard")
    expect(source).not.toContain("createPopover(")
    expect(source).not.toContain("innerHTML")
    expect(source).not.toContain("customElements")
    expect(css).toContain("flex-wrap: wrap")
    expect(css).toContain("[hidden]")
    expect(css).toContain("forced-colors")
    expect(css).toContain("@media print")
  })
})
