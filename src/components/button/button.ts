import { ViewElement } from "../../core/index.js"
import {
  buttonTypes, buttonSizes, buttonAppearances, buttonShapes, buttonAttrTypes,
  iconPlacements, formMethods, formEncTypes,
} from "./model.js"
import type {
  ButtonType, ButtonSize, ButtonAppearance, ButtonShape, ButtonAttrType,
  ButtonIconPlacement, ButtonFormMethod, ButtonFormEncType,
} from "./model.js"

type Control = HTMLButtonElement | HTMLAnchorElement
type IconElement = HTMLElement | SVGElement
type Override = { original: string | null; applied: string | null }

const forwarded = [
  "name", "value", "form", "formaction", "formmethod", "formenctype", "formtarget", "formnovalidate",
  "aria-label", "aria-labelledby", "aria-describedby", "aria-controls", "aria-expanded", "aria-pressed",
] as const
/**
 * A light-DOM wrapper; the native button or anchor owns interaction and semantics.
 * @region {"name":"content","accepts":["text","phrasing"],"min":0,"max":1}
 * @region {"name":"icon","accepts":["icon"],"min":0,"max":1}
 * @states disabled loading
 */
export class Button extends ViewElement {
  public static readonly tag = "m-button"
  public static get observedAttributes(): string[] {
    return ["disabled", "loading", "attr-type", "type", "appearance", "shape", "size",
      "icon-placement", "focusable", "bordered", "block", "strong", "label", ...forwarded]
  }

  private nativeControl: Control | null = null
  private generatedControl: HTMLButtonElement | null = null
  private spinner: HTMLSpanElement | null = null
  private readonly overrides = new Map<string, Override>()
  private observer: MutationObserver | undefined
  private motion: MediaQueryList | undefined
  private upgraded = false
  private wave: Animation | undefined
  private readonly acceptedClicks = new WeakSet<Event>()
  private ready = false
  private readonly entering = new Map<IconElement, { animations: Animation[]; hadStyle: boolean; width: string; original: string; priority: string }>()
  private readonly icons = new Set<IconElement>()

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "button"
    this.addEventListener("click", this.onActivation, true)
    this.addEventListener("auxclick", this.onActivation, true)
    this.addEventListener("click", this.onWave)
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
    this.ready = true
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.removeEventListener("click", this.onActivation, true)
    this.removeEventListener("auxclick", this.onActivation, true)
    this.removeEventListener("click", this.onWave)
    this.stopWave()
    this.ready = false
    this.stopEntries()
    this.stopMotion()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public get control(): Control | null { return this.nativeControl }
  public override click(): void {
    if (this.isConnected) this.synchronize()
    if (!this.blocked) this.nativeControl?.click()
  }
  public override focus(options?: FocusOptions): void {
    if (!this.blocked) this.nativeControl?.focus(options)
  }
  public override blur(): void { this.nativeControl?.blur() }

  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }

  public get loading(): boolean { return this.hasAttribute("loading") }
  public set loading(value: boolean) { this.setBooleanAttribute("loading", value) }

  public get attrType(): ButtonAttrType { return this.choiceAttribute("attr-type", buttonAttrTypes, "button") }
  public set attrType(value: ButtonAttrType) { this.setChoiceAttribute("attr-type", value, buttonAttrTypes) }

  public get type(): ButtonType { return this.choiceAttribute("type", buttonTypes, "default") }
  public set type(value: ButtonType) { this.setChoiceAttribute("type", value, buttonTypes) }

  public get appearance(): ButtonAppearance { return this.choiceAttribute("appearance", buttonAppearances, "default") }
  public set appearance(value: ButtonAppearance) { this.setChoiceAttribute("appearance", value, buttonAppearances) }

  public get shape(): ButtonShape { return this.choiceAttribute("shape", buttonShapes, "rectangular") }
  public set shape(value: ButtonShape) { this.setChoiceAttribute("shape", value, buttonShapes) }

  public get size(): ButtonSize { return this.choiceAttribute("size", buttonSizes, "medium") }
  public set size(value: ButtonSize) { this.setChoiceAttribute("size", value, buttonSizes) }

  public get iconPlacement(): ButtonIconPlacement { return this.choiceAttribute("icon-placement", iconPlacements, "left") }
  public set iconPlacement(value: ButtonIconPlacement) { this.setChoiceAttribute("icon-placement", value, iconPlacements) }

  public get focusable(): boolean { return this.booleanAttribute("focusable", true) }
  public set focusable(value: boolean) { this.setBooleanAttribute("focusable", value, false) }

  public get bordered(): boolean { return this.booleanAttribute("bordered", true) }
  public set bordered(value: boolean) { this.setBooleanAttribute("bordered", value, false) }

  public get block(): boolean { return this.hasAttribute("block") }
  public set block(value: boolean) { this.setBooleanAttribute("block", value) }

  public get strong(): boolean { return this.hasAttribute("strong") }
  public set strong(value: boolean) { this.setBooleanAttribute("strong", value) }

  public get label(): string | null { return this.getAttribute("label") }
  public set label(value: string | null) { this.setStringAttribute("label", value) }

  public get name(): string | null { return this.getAttribute("name") }
  public set name(value: string | null) { this.setStringAttribute("name", value) }

  public get value(): string | null { return this.getAttribute("value") }
  public set value(value: string | null) { this.setStringAttribute("value", value) }

  public get form(): string | null { return this.getAttribute("form") }
  public set form(value: string | null) { this.setStringAttribute("form", value) }

  public get formAction(): string | null { return this.getAttribute("formaction") }
  public set formAction(value: string | null) { this.setStringAttribute("formaction", value) }

  public get formMethod(): ButtonFormMethod | null {
    return this.choiceAttribute("formmethod", formMethods, null)
  }
  public set formMethod(value: ButtonFormMethod | null) { this.setNullableChoiceAttribute("formmethod", value, formMethods) }

  public get formEnctype(): ButtonFormEncType | null {
    return this.choiceAttribute("formenctype", formEncTypes, null)
  }
  public set formEnctype(value: ButtonFormEncType | null) { this.setNullableChoiceAttribute("formenctype", value, formEncTypes) }

  public get formTarget(): string | null { return this.getAttribute("formtarget") }
  public set formTarget(value: string | null) { this.setStringAttribute("formtarget", value) }

  public get formNoValidate(): boolean { return this.hasAttribute("formnovalidate") }
  public set formNoValidate(value: boolean) { this.setBooleanAttribute("formnovalidate", value) }

  private get blocked(): boolean {
    return this.disabled || this.loading || Boolean(this.nativeControl?.matches(":disabled"))
  }

  private readonly onActivation = (event: Event): void => {
    if (this.blocked) {
      event.preventDefault()
      event.stopImmediatePropagation()
    } else if (event.type === "click") this.acceptedClicks.add(event)
  }

  private readonly onWave = (event: Event): void => {
    const control = this.nativeControl
    if (!this.acceptedClicks.delete(event) || !this.isConnected || !control
      || !event.composedPath().includes(control)
      || ["text", "secondary", "tertiary", "quaternary"].includes(this.appearance)
      || this.ownerDocument.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    this.setState(control, "wave", true)
    const wave = control.getAnimations?.({ subtree: true }).find(animation =>
      "animationName" in animation && animation.animationName === "m-button-wave"
      && (animation.effect as KeyframeEffect | null)?.target === control)
    if (!wave) {
      this.setState(control, "wave", false)
      return
    }
    this.wave = wave
    wave.onfinish = wave.oncancel = () => {
      if (this.wave === wave && (wave.playState === "finished" || wave.playState === "idle")) this.stopWave()
    }
    wave.currentTime = 0
    wave.play()
  }

  private stopWave(): void {
    const wave = this.wave
    this.wave = undefined
    wave?.cancel()
    if (this.nativeControl) this.setState(this.nativeControl, "wave", false)
  }

  private synchronize(): void {
    void this.attrType
    void this.type
    void this.appearance
    void this.shape
    void this.size
    void this.iconPlacement
    void this.focusable
    void this.bordered
    void this.formMethod
    void this.formEnctype
    this.observer?.disconnect()
    let control = [...this.querySelectorAll<Control>(":scope > button, :scope > a")]
      .find(candidate => candidate !== this.generatedControl)
      ?? this.querySelector<Control>(":scope > button")
    if (!control) {
      control = this.ownerDocument.createElement("button")
      control.type = "button"
      this.generatedControl = control
      this.append(control)
    }
    if (control !== this.nativeControl) {
      this.restoreControl()
      if (this.generatedControl && this.generatedControl !== control && this.generatedControl.parentNode === this) {
        control.prepend(...this.generatedControl.childNodes)
        this.generatedControl.remove()
        this.generatedControl = null
      }
      this.nativeControl = control
      this.manage("data-part", "control")
    }
    // Move, never clone, authored nodes; this also handles children arriving during HTML parsing.
    for (const node of [...this.childNodes]) {
      if (node !== control) control.append(node)
    }
    for (const name of forwarded) {
      if (control instanceof HTMLButtonElement || name.startsWith("aria-")) {
        this.manage(name, (name === "aria-label" ? this.label ?? this.getAttribute(name) : this.getAttribute(name)) ?? undefined)
      }
    }
    if (control instanceof HTMLButtonElement) {
      this.manage("type", this.hasAttribute("attr-type")
        ? this.attrType
        : undefined)
      this.manage("disabled", this.disabled || this.loading ? "" : undefined)
    } else {
      const role = this.overrides.get("role")
      const authoredRole = role && control.getAttribute("role") === role.applied
        ? role.original
        : control.getAttribute("role")
      this.manage("role", this.disabled || this.loading ? authoredRole ?? "link" : undefined)
      this.manage("href", this.disabled || this.loading ? null : undefined)
    }
    // Fieldset disabling is owned by the browser, including restoration when it changes.
    const disabled = this.disabled || this.loading || (control instanceof HTMLButtonElement && control.disabled)
    this.manage("tabindex", disabled || !this.focusable ? "-1" : undefined)
    this.manage("aria-disabled", disabled ? "true" : undefined)
    this.manage("aria-busy", this.loading ? "true" : undefined)
    const createdSpinner = this.loading && !this.spinner
    if (this.loading) {
      if (!this.spinner) {
        this.spinner = this.ownerDocument.createElement("span")
        this.spinner.dataset.part = "spinner"
        this.spinner.setAttribute("aria-hidden", "true")
        const svg = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.setAttribute("width", "100%")
        svg.setAttribute("height", "100%")
        svg.setAttribute("focusable", "false")
        const circle = this.ownerDocument.createElementNS(svg.namespaceURI, "circle")
        for (const [name, value] of Object.entries({
          cx: "50%", cy: "50%", r: "45%", fill: "none", "stroke-linecap": "round",
          "stroke-dasharray": "283.5%", "stroke-dashoffset": "71%", "transform-origin": "50% 50%",
        })) circle.setAttribute(name, value)
        // Compose the two reference angular tracks into one native rotation.
        for (const [tag, attribute, values] of [
          ["animateTransform", "transform", "0;270;720"],
          ["animate", "stroke-dashoffset", "283.5%;71%;283.5%"],
        ]) {
          const animation = this.ownerDocument.createElementNS(svg.namespaceURI, tag!)
          animation.setAttribute("attributeName", attribute!)
          animation.setAttribute("values", values!)
          animation.setAttribute("dur", "1.6s")
          animation.setAttribute("repeatCount", "indefinite")
          if (tag === "animateTransform") animation.setAttribute("type", "rotate")
          circle.append(animation)
        }
        svg.append(circle)
        this.spinner.append(svg)
      }
      if (this.spinner.parentNode !== control) control.prepend(this.spinner)
      if (!this.motion) {
        this.motion = this.ownerDocument.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)")
        this.motion?.addEventListener("change", this.synchronizeMotion)
      }
      this.synchronizeMotion()
    } else {
      if (this.spinner) this.finishEntry(this.spinner)
      this.stopMotion()
      this.spinner?.remove()
      this.spinner = null
    }
    const hasContent = [...control.childNodes].some(node => node.nodeType === Node.TEXT_NODE
      ? Boolean(node.textContent?.trim())
      : node instanceof Element && !node.matches("[data-part=icon], [data-part=spinner]"))
    this.setState(control, "icon-only", !hasContent)
    const icons = [...control.querySelectorAll<IconElement>(":scope > [data-part=icon]")]
    for (const icon of this.icons) if (!icons.includes(icon)) this.finishEntry(icon)
    if (this.ready) {
      for (const icon of icons) if (!this.icons.has(icon) && !this.loading) this.enterIcon(icon)
      if (createdSpinner && this.spinner && !icons.length) this.enterIcon(this.spinner)
    }
    this.icons.clear()
    icons.forEach(icon => this.icons.add(icon))
    if (this.isConnected) {
      this.observer?.observe(this, {
        subtree: true, childList: true, characterData: true, attributes: true,
        attributeFilter: [...forwarded, "disabled", "type", "tabindex", "aria-disabled", "aria-busy", "href", "role", "data-part"],
      })
    }
  }

  private enterIcon(element: IconElement): void {
    if (this.ownerDocument.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      || (element.getAnimations?.().length ?? 0) > 0) return
    const style = getComputedStyle(element)
    const width = Number.parseFloat(style.width)
    // Resolved CSS width shares max-width's box model, without transforms or integer rounding.
    if (style.animationName !== "none" || style.display === "none" || !element.getClientRects().length
      || !style.width.endsWith("px") || !Number.isFinite(width) || width <= 0) return
    const record = {
      animations: [] as Animation[], hadStyle: element.hasAttribute("style"), width: style.width,
      original: element.style.getPropertyValue("--_m-button-enter-width"),
      priority: element.style.getPropertyPriority("--_m-button-enter-width"),
    }
    this.entering.set(element, record)
    element.style.setProperty("--_m-button-enter-width", record.width)
    this.setState(element, "enter", true)
    const animations = element.getAnimations?.().filter(animation =>
      "animationName" in animation && String(animation.animationName).startsWith("m-button-enter-")) ?? []
    if (!animations.length) {
      this.finishEntry(element)
      return
    }
    record.animations = animations
    const done = () => {
      if (this.entering.get(element) === record) this.finishEntry(element)
    }
    void Promise.all(animations.map(animation => animation.finished)).then(done, done)
  }

  private finishEntry(element: IconElement): void {
    const record = this.entering.get(element)
    this.entering.delete(element)
    record?.animations.forEach(animation => animation.cancel())
    this.setState(element, "enter", false)
    if (record && element.style.getPropertyValue("--_m-button-enter-width") === record.width) {
      element.style.setProperty("--_m-button-enter-width", record.original, record.priority)
      if (!record.hadStyle && !element.getAttribute("style")) element.removeAttribute("style")
    }
  }

  private stopEntries(): void {
    for (const element of this.entering.keys()) this.finishEntry(element)
    this.icons.clear()
  }

  private readonly synchronizeMotion = (): void => {
    if (!this.isConnected) return
    const svg = this.spinner?.firstElementChild as SVGSVGElement | null
    if (this.motion?.matches) {
      svg?.pauseAnimations?.()
      svg?.setCurrentTime?.(.8)
    } else svg?.unpauseAnimations?.()
  }

  private stopMotion(): void {
    this.motion?.removeEventListener("change", this.synchronizeMotion)
    this.motion = undefined
    const svg = this.spinner?.firstElementChild as SVGSVGElement | null
    svg?.pauseAnimations?.()
  }

  private manage(name: string, value: string | null | undefined): void {
    const control = this.nativeControl!
    const current = control.getAttribute(name)
    let override = this.overrides.get(name)
    if (override && current !== override.applied) override.original = current
    if (value === undefined) {
      if (!override) return
      this.write(control, name, override.original)
      this.overrides.delete(name)
    } else {
      if (!override) {
        override = { original: current, applied: value }
        this.overrides.set(name, override)
      }
      override.applied = value
      this.write(control, name, value)
    }
  }

  private write(control: Control, name: string, value: string | null): void {
    if (value === null) control.removeAttribute(name)
    else if (control.getAttribute(name) !== value) control.setAttribute(name, value)
  }

  private setState(element: Element, state: string, active: boolean): void {
    const states = new Set((element.getAttribute("data-state") ?? "").split(/\s+/).filter(Boolean))
    if (active) states.add(state)
    else states.delete(state)
    if (states.size) element.setAttribute("data-state", [...states].join(" "))
    else element.removeAttribute("data-state")
  }

  private restoreControl(): void {
    this.stopEntries()
    this.stopWave()
    this.stopMotion()
    if (this.nativeControl) {
      for (const name of this.overrides.keys()) this.manage(name, undefined)
      this.setState(this.nativeControl, "icon-only", false)
    }
    this.spinner?.remove()
    this.spinner = null
  }
}
