type Control = HTMLButtonElement | HTMLAnchorElement
type Override = { original: string | null; applied: string | null }

const forwarded = [
  "name", "value", "form", "formaction", "formmethod", "formenctype", "formtarget", "formnovalidate",
  "aria-label", "aria-labelledby", "aria-describedby", "aria-controls", "aria-expanded", "aria-pressed",
] as const
const properties = [
  "disabled", "loading", "attrType", "type", "variant", "size", "iconPlacement", "focusable", "bordered",
  "block", "circle", "round", "strong", "secondary", "tertiary", "quaternary", "ghost", "dashed", "text",
]

/** A light-DOM wrapper; the child button or anchor owns interaction and semantics. */
export class MuiButton extends HTMLElement {
  public static get observedAttributes(): string[] {
    return ["disabled", "loading", "attr-type", "focusable", ...forwarded]
  }

  private nativeControl: Control | null = null
  private generatedControl: HTMLButtonElement | null = null
  private spinner: HTMLSpanElement | null = null
  private readonly overrides = new Map<string, Override>()
  private observer: MutationObserver | undefined
  private motion: MediaQueryList | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of properties) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiButton = ""
    this.addEventListener("click", this.onActivation, true)
    this.addEventListener("auxclick", this.onActivation, true)
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.removeEventListener("click", this.onActivation, true)
    this.removeEventListener("auxclick", this.onActivation, true)
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
  public set disabled(value: boolean) { this.toggleAttribute("disabled", value) }
  public get loading(): boolean { return this.hasAttribute("loading") }
  public set loading(value: boolean) { this.toggleAttribute("loading", value) }
  public get attrType(): string { return this.getAttribute("attr-type") ?? "button" }
  public set attrType(value: string) { this.setAttribute("attr-type", value) }
  public get type(): string { return this.getAttribute("type") ?? "default" }
  public set type(value: string) { this.setAttribute("type", value) }
  public get variant(): string { return this.getAttribute("variant") ?? "default" }
  public set variant(value: string) { this.setAttribute("variant", value) }
  public get size(): string { return this.getAttribute("size") ?? "medium" }
  public set size(value: string) { this.setAttribute("size", value) }
  public get iconPlacement(): string { return this.getAttribute("icon-placement") ?? "left" }
  public set iconPlacement(value: string) { this.setAttribute("icon-placement", value) }
  public get focusable(): boolean { return this.getAttribute("focusable") !== "false" }
  public set focusable(value: boolean) { this.setAttribute("focusable", String(value)) }
  public get bordered(): boolean { return this.getAttribute("bordered") !== "false" }
  public set bordered(value: boolean) { this.setAttribute("bordered", String(value)) }
  public get block(): boolean { return this.hasAttribute("block") }
  public set block(value: boolean) { this.toggleAttribute("block", value) }
  public get circle(): boolean { return this.hasAttribute("circle") }
  public set circle(value: boolean) { this.toggleAttribute("circle", value) }
  public get round(): boolean { return this.hasAttribute("round") }
  public set round(value: boolean) { this.toggleAttribute("round", value) }
  public get strong(): boolean { return this.hasAttribute("strong") }
  public set strong(value: boolean) { this.toggleAttribute("strong", value) }
  public get secondary(): boolean { return this.hasAttribute("secondary") }
  public set secondary(value: boolean) { this.toggleAttribute("secondary", value) }
  public get tertiary(): boolean { return this.hasAttribute("tertiary") }
  public set tertiary(value: boolean) { this.toggleAttribute("tertiary", value) }
  public get quaternary(): boolean { return this.hasAttribute("quaternary") }
  public set quaternary(value: boolean) { this.toggleAttribute("quaternary", value) }
  public get ghost(): boolean { return this.hasAttribute("ghost") }
  public set ghost(value: boolean) { this.toggleAttribute("ghost", value) }
  public get dashed(): boolean { return this.hasAttribute("dashed") }
  public set dashed(value: boolean) { this.toggleAttribute("dashed", value) }
  public get text(): boolean { return this.hasAttribute("text") }
  public set text(value: boolean) { this.toggleAttribute("text", value) }

  private get blocked(): boolean {
    return this.disabled || this.loading || Boolean(this.nativeControl?.matches(":disabled"))
  }

  private readonly onActivation = (event: Event): void => {
    if (this.blocked) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  private synchronize(): void {
    this.observer?.disconnect()
    let control = this.querySelector<Control>(":scope > button:not([data-mui-button-generated]), :scope > a")
      ?? this.querySelector<Control>(":scope > button")
    if (!control) {
      control = this.ownerDocument.createElement("button")
      control.type = "button"
      control.dataset.muiButtonGenerated = ""
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
      control.dataset.muiButtonControl = ""
    }
    // Move, never clone, authored nodes; this also handles children arriving during HTML parsing.
    for (const node of [...this.childNodes]) {
      if (node !== control) control.append(node)
    }
    for (const name of forwarded) {
      if (control instanceof HTMLButtonElement || name.startsWith("aria-")) {
        this.manage(name, this.getAttribute(name) ?? undefined)
      }
    }
    if (control instanceof HTMLButtonElement) {
      this.manage("type", this.hasAttribute("attr-type")
        ? (["submit", "reset"].includes(this.attrType) ? this.attrType : "button")
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
    if (this.loading) {
      if (!this.spinner) {
        this.spinner = this.ownerDocument.createElement("span")
        this.spinner.dataset.muiButtonSpinner = ""
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
      this.stopMotion()
      this.spinner?.remove()
      this.spinner = null
    }
    const hasContent = [...control.childNodes].some(node => node.nodeType === Node.TEXT_NODE
      ? Boolean(node.textContent?.trim())
      : node instanceof Element && !node.matches("[data-mui-button-icon], [data-mui-button-spinner]"))
    control.toggleAttribute("data-mui-button-icon-only", !hasContent)
    if (this.isConnected) {
      this.observer?.observe(this, {
        subtree: true, childList: true, characterData: true, attributes: true,
        attributeFilter: [...forwarded, "disabled", "type", "tabindex", "aria-disabled", "aria-busy", "href", "role"],
      })
    }
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

  private restoreControl(): void {
    this.stopMotion()
    if (this.nativeControl) {
      for (const name of this.overrides.keys()) this.manage(name, undefined)
      this.nativeControl.removeAttribute("data-mui-button-control")
      this.nativeControl.removeAttribute("data-mui-button-icon-only")
    }
    this.spinner?.remove()
    this.spinner = null
  }
}
