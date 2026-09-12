import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import { createDropdown } from "./controller.js"
import type { DropdownController } from "./controller.js"
import { menuEntryAvailable } from "./keyboard.js"
import { DropdownTrigger, DropdownMenu, DropdownItem, DropdownGroup, DropdownDivider, prepareItem, prepareGroup, prepareMenuSurface } from "./regions.js"
import { dropdownPlacements } from "./model.js"
import type { DropdownPlacement, DropdownOpenReason, DropdownSelectionDetail, DropdownOpenChangedDetail, DropdownErrorDetail } from "./model.js"

let sequence = 0

/**
 * Authored native actions and owned submenu regions, without a second focus owner.
 * @region {"name":"trigger","element":"m-dropdown-trigger","accepts":["native button"],"min":1,"max":1}
 * @region {"name":"menu","element":"m-dropdown-menu","accepts":["DropdownItem","DropdownGroup","DropdownDivider"],"min":1,"max":1}
 */
export class Dropdown extends ViewElement {
  public static readonly tag = "m-dropdown"
  public static readonly observedAttributes = ["value", "disabled", "placement", "submenu-delay", "submenu-duration", "typeahead-duration"]
  private controller: DropdownController | undefined
  private trigger: HTMLButtonElement | undefined
  private menu: DropdownMenu | undefined
  private observer: MutationObserver | undefined
  private bindings = ownedWrites()
  private disabling = ownedWrites()
  private initialized = false
  private reflecting = false
  private failed = false
  private lastShow = false
  private intent: DropdownOpenReason | undefined
  private reason: DropdownOpenReason = "native"

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "dropdown"
    this.addEventListener("click", this.blockDisabled, true)
    this.addEventListener("beforetoggle", this.guardOpening, true)
    this.addEventListener("m:popover-error", this.popoverError, true)
    this.observer ??= new MutationObserver(records => {
      if (records.some(record => {
        const target = record.target instanceof Element ? record.target : record.target.parentElement
        return target?.closest("m-dropdown") === this && !(target === this && record.type === "attributes" && Dropdown.observedAttributes.includes(record.attributeName!))
      })) this.synchronize()
    })
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.unlistenMenu()
    this.controller?.disconnect()
    this.bindings.restore()
    this.disabling.restore()
    this.removeEventListener("click", this.blockDisabled, true)
    this.removeEventListener("beforetoggle", this.guardOpening, true)
    this.removeEventListener("m:popover-error", this.popoverError, true)
    this.lastShow = false
    this.dataset.state = "disconnected"
  }

  public attributeChangedCallback(name: string): void {
    if (!this.initialized || !this.isConnected || this.reflecting) return
    try {
      if (name === "value" && this.controller?.connected) this.controller.value = this.value
      else if (name === "disabled" && this.controller?.connected) {
        this.intent = "disabled"
        this.controller.disabled = this.disabled
        this.applyDisabled()
        this.updateState()
      } else this.synchronize()
    } catch (error) { this.fail(error) }
    finally { this.intent = undefined }
  }

  public get value(): string | null { return this.getAttribute("value") }
  public set value(value: string | null) {
    if (this.controller?.connected) this.controller.value = value
    else this.setStringAttribute("value", value)
  }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get placement(): DropdownPlacement { return this.choiceAttribute("placement", dropdownPlacements, "bottom") }
  public set placement(value: DropdownPlacement) { this.setChoiceAttribute("placement", value, dropdownPlacements) }
  /** @min 0
   * @max 60000
   */
  public get submenuDelay(): number { return this.timing(this.numberAttribute("submenu-delay", 100)) }
  public set submenuDelay(value: number) { this.setAttribute("submenu-delay", String(this.timing(value))) }
  /** @min 0
   * @max 60000
   */
  public get submenuDuration(): number { return this.timing(this.numberAttribute("submenu-duration", 150)) }
  public set submenuDuration(value: number) { this.setAttribute("submenu-duration", String(this.timing(value))) }
  /** @min 0
   * @max 60000
   */
  public get typeaheadDuration(): number { return this.timing(this.numberAttribute("typeahead-duration", 500)) }
  public set typeaheadDuration(value: number) { this.setAttribute("typeahead-duration", String(this.timing(value))) }
  public get show(): boolean { return this.controller?.show ?? false }
  public get state(): "disconnected" | "pending" | "invalid" | "disabled" | "inline" | "open" | "closed" {
    if (!this.isConnected) return "disconnected"
    if (this.failed) return "invalid"
    if (!this.controller?.connected) return "pending"
    if (this.disabled) return "disabled"
    if (this.controller.inline) return "inline"
    return this.show ? "open" : "closed"
  }
  public get items(): readonly DropdownItem[] {
    return Object.freeze([...this.querySelectorAll<DropdownItem>("m-dropdown-item")].filter(item => item.closest("m-dropdown") === this))
  }

  public open(): boolean {
    this.intent = "api"
    try { return this.ready().open() } finally { this.intent = undefined; this.updateState() }
  }
  public close(): void {
    this.intent = "api"
    try { this.controller?.close() } finally { this.intent = undefined; this.updateState() }
  }
  public toggle(): boolean { if (this.show) { this.close(); return false } return this.open() }
  public select(key: string): void {
    this.ready()
    if (typeof key !== "string") throw new RangeError("Select requires a string leaf key.")
    this.value = key
    this.close()
  }
  public refresh(): void {
    if (!this.isConnected) throw new Error("Connect Dropdown before refreshing.")
    this.synchronize(true)
  }
  public syncPosition(): boolean { return this.ready().syncPosition() }

  private timing(value: number): number {
    if (!Number.isFinite(value) || value < 0 || value > 60000) throw new RangeError("Dropdown timing must be finite between 0 and 60000.")
    return value
  }
  private ready(): DropdownController {
    if (!this.controller?.connected) throw new Error("Dropdown is not ready.")
    return this.controller
  }
  private reflectValue(value: string | null): void {
    this.reflecting = true
    try { this.setStringAttribute("value", value) } finally { this.reflecting = false }
    this.updateState()
  }
  private updateState(): void {
    this.dataset.state = this.state
    for (const item of this.items) item.dataset.state = [item.key === this.value ? "selected" : "", item.disabled ? "disabled" : ""].filter(Boolean).join(" ")
  }
  private applyDisabled(): void {
    this.disabling.restore()
    if (this.trigger && this.disabled) this.disabling.attr(this.trigger, "disabled", "")
  }
  private fail(error: unknown): void {
    this.controller?.disconnect()
    this.failed = true
    this.updateState()
    this.emit<DropdownErrorDetail>("m:error", { error })
  }
  private unlistenMenu(): void {
    this.menu?.removeEventListener("beforetoggle", this.beforeToggle)
    this.menu?.removeEventListener("toggle", this.toggled)
  }
  private readonly beforeToggle = (event: Event): void => {
    if (event.target === this.menu) this.reason = this.intent ?? "native"
  }
  private readonly toggled = (event: Event): void => {
    if (!this.isConnected || event.target !== this.menu) return
    this.updateState()
    if (this.show === this.lastShow) return
    this.lastShow = this.show
    this.emit<DropdownOpenChangedDetail>("m:open-changed", { show: this.show, reason: this.reason })
  }
  private readonly popoverError = (event: Event): void => {
    if (event.target instanceof Element && event.target.closest("m-dropdown") === this) this.fail((event as CustomEvent<DropdownErrorDetail>).detail.error)
  }
  private readonly blockDisabled = (event: MouseEvent): void => {
    if ((this.disabled || !this.controller?.connected) && event.target instanceof Element && event.target.closest("m-dropdown") === this && event.target.closest("button,a")) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }
  private readonly guardOpening = (event: Event): void => {
    if (event.target instanceof DropdownMenu && event.target.closest("m-dropdown") === this
      && (event as ToggleEvent).newState === "open" && (this.disabled || !this.controller?.connected)) event.preventDefault()
  }
  private synchronize(strict = false): void {
    if (!this.isConnected) return
    this.observer?.disconnect()
    this.intent = "refresh"
    const oldTrigger = this.trigger, oldMenu = this.menu
    const remembered = this.controller?.focusedElement
    const focused = !!oldMenu?.contains(this.ownerDocument.activeElement) || !!(this.show && this.ownerDocument.activeElement === this.ownerDocument.body
      && remembered && !menuEntryAvailable(remembered, remembered.closest<HTMLElement>("m-dropdown-menu") ?? oldMenu!))
    try {
      if (this.getRootNode() !== this.ownerDocument) throw new TypeError("Dropdown requires connected light DOM.")
      const config = { placement: this.placement, submenuDelay: this.submenuDelay, submenuDuration: this.submenuDuration, typeaheadDuration: this.typeaheadDuration }
      this.controller?.close()
      this.bindings.restore()
      this.disabling.restore()
      const children = [...this.children].filter(node => !node.matches("template,script,style"))
      const region = children.find((node): node is DropdownTrigger => node instanceof DropdownTrigger)
      const menu = children.find((node): node is DropdownMenu => node instanceof DropdownMenu)
      if (!region || !menu) {
        this.controller?.disconnect()
        this.failed = false
        if (strict) throw new TypeError("Dropdown needs one trigger and one menu region.")
        return
      }
      if (children.length !== 2 || region.children.length !== 1 || !(region.firstElementChild instanceof HTMLButtonElement)) throw new TypeError("Author one direct native type=button inside DropdownTrigger and one root menu.")
      const trigger = region.firstElementChild
      if (!(trigger.textContent?.trim() || trigger.getAttribute("aria-label")?.trim() || trigger.getAttribute("aria-labelledby")?.trim())
        || trigger.querySelector("button,a,input,select,textarea,label,[tabindex],[contenteditable],m-button")) throw new TypeError("Dropdown trigger needs a noninteractive native label.")
      if ([...trigger.querySelectorAll("*")].some(node => node.localName.includes("-") || node.shadowRoot || ["script", "style", "slot"].includes(node.localName)
        || node.hasAttribute("role") && !["none", "presentation", "img"].includes(node.getAttribute("role")!))) throw new TypeError("Dropdown trigger content must be passive native markup.")
      const prepareMenu = (panel: DropdownMenu, invoker: HTMLButtonElement): boolean => {
        prepareMenuSurface(panel)
        void panel.size
        if (!panel.id) do { panel.id = `m-dropdown-menu-${++sequence}` } while (this.ownerDocument.getElementById(panel.id) && this.ownerDocument.getElementById(panel.id) !== panel)
        if (panel.hasAttribute("popover") && panel.getAttribute("popover") !== "auto") throw new TypeError("Dropdown menus use popover=auto.")
        if (invoker.hasAttribute("popovertarget") && invoker.getAttribute("popovertarget") !== panel.id) throw new TypeError("Dropdown popovertarget must match its owned menu.")
        this.bindings.attr(panel, "popover", "auto")
        this.bindings.attr(invoker, "popovertarget", panel.id)
        const walk = (container: DropdownMenu | DropdownGroup): boolean => {
          const label = container instanceof DropdownGroup ? prepareGroup(container) : undefined
          for (const node of container.children) {
            if (node === label || node instanceof HTMLTemplateElement) continue
            if (node instanceof DropdownGroup) { if (!walk(node)) return false; continue }
            if (node instanceof DropdownDivider) continue
            if (!(node instanceof DropdownItem)) throw new TypeError("Menus contain only DropdownItem, DropdownGroup, DropdownDivider or inert templates.")
            if (!node.key.trim()) return false
            const action = prepareItem(node)
            const submenus = [...node.children].filter((child): child is DropdownMenu => child instanceof DropdownMenu)
            if (!action && node.children.length === 0) return false
            if (!action || submenus.length > 1 || [...node.children].some(child => child !== action && child !== submenus[0] && !(child instanceof HTMLTemplateElement))) throw new TypeError("DropdownItem needs one native action and at most one submenu.")
            if (!(node.label?.trim() || action.getAttribute("aria-label")?.trim() || action.getAttribute("aria-labelledby")?.trim() || action.textContent?.trim())) return false
            if (submenus[0]) {
              if (!(action instanceof HTMLButtonElement)) throw new TypeError("Submenu owners must be native buttons.")
              if (!prepareMenu(submenus[0], action)) return false
            }
          }
          return true
        }
        return walk(panel)
      }
      if (!prepareMenu(menu, trigger)) {
        this.controller?.disconnect()
        this.failed = false
        if (strict) throw new TypeError("Dropdown items need a key and a labelled native action.")
        return
      }
      this.unlistenMenu()
      this.trigger = trigger
      this.menu = menu
      menu.addEventListener("beforetoggle", this.beforeToggle)
      menu.addEventListener("toggle", this.toggled)
      this.applyDisabled()
      if (this.controller?.connected && oldTrigger === trigger && oldMenu === menu) this.controller.configure(config)
      else {
        this.controller?.disconnect()
        this.controller = createDropdown(trigger, menu, {
          ...config, disabled: this.disabled, value: this.value,
          onValue: value => this.reflectValue(value),
          onSelect: detail => this.emit<DropdownSelectionDetail>("m:selection-requested", {
            key: detail.key, item: detail.item.parentElement as DropdownItem, path: Object.freeze([...detail.path]), source: "native", originalEvent: detail.event,
          }),
          onError: error => {
            if (this.controller && !this.controller.connected) this.failed = true
            this.updateState()
            this.emit<DropdownErrorDetail>("m:error", { error })
          },
        })
      }
      this.failed = false
      if (focused && (this.ownerDocument.activeElement === this.ownerDocument.body || oldMenu?.contains(this.ownerDocument.activeElement))
        && this.ownerDocument.hasFocus() && !trigger.disabled && !trigger.closest("[hidden],[inert]") && trigger.getBoundingClientRect().width > 0) trigger.focus({ preventScroll: true })
    } catch (error) {
      this.fail(error)
      if (strict) throw error
    } finally {
      this.intent = undefined
      this.updateState()
      if (this.isConnected) this.observer?.observe(this, { childList: true, subtree: true, characterData: true, attributes: true,
        attributeFilter: ["key", "label", "disabled", "href", "target", "download", "aria-label", "aria-labelledby", "type", "role", "contenteditable", "hidden", "inert", "id", "dir", "popover", "popovertarget"] })
    }
  }
}
