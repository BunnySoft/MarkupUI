type Override = { original: string | null; applied: string | null }
const labels = ["aria-label", "aria-labelledby", "aria-describedby"] as const

export interface TagCloseDetail { originalEvent: MouseEvent }

export class MuiTag extends HTMLElement {
  public static get observedAttributes(): string[] {
    return ["checkable", "checked", "closable", "disabled", "close-label", ...labels]
  }

  private content: HTMLSpanElement | undefined
  private toggleButton: HTMLButtonElement | undefined
  private generatedToggle: HTMLButtonElement | undefined
  private closeButton: HTMLButtonElement | undefined
  private readonly overrides = new Map<string, Override>()
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["checkable", "checked", "closable", "disabled", "closeLabel", "triggerClickOnClose", "bordered", "round", "strong", "size", "type"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiTag = ""
    this.addEventListener("click", this.guardActivation, true)
    this.addEventListener("auxclick", this.guardActivation, true)
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.toggleButton?.removeEventListener("click", this.onToggle)
    this.closeButton?.removeEventListener("click", this.onClose)
    this.removeEventListener("click", this.guardActivation, true)
    this.removeEventListener("auxclick", this.guardActivation, true)
  }

  public attributeChangedCallback(): void { if (this.isConnected) this.synchronize() }
  public get control(): HTMLButtonElement | null { return this.toggleButton ?? null }
  public get contentElement(): HTMLSpanElement | null { return this.content ?? null }
  public override click(): void {
    if (this.isConnected) this.synchronize()
    if (this.disabled) return
    if (this.checkable) this.toggleButton?.click()
    else super.click()
  }
  public override focus(options?: FocusOptions): void {
    if (this.disabled || this.toggleButton?.matches(":disabled")) return
    if (this.checkable) this.toggleButton?.focus(options)
    else super.focus(options)
  }
  public override blur(): void {
    if (this.checkable) this.toggleButton?.blur()
    else super.blur()
  }
  public get checkable(): boolean { return this.hasAttribute("checkable") }
  public set checkable(value: boolean) { this.toggleAttribute("checkable", value) }
  public get checked(): boolean { return this.hasAttribute("checked") }
  public set checked(value: boolean) { this.toggleAttribute("checked", value) }
  public get closable(): boolean { return this.hasAttribute("closable") }
  public set closable(value: boolean) { this.toggleAttribute("closable", value) }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.toggleAttribute("disabled", value) }
  public get closeLabel(): string { return this.getAttribute("close-label")?.trim() || "Remove tag" }
  public set closeLabel(value: string) { this.setAttribute("close-label", value) }
  public get triggerClickOnClose(): boolean { return this.hasAttribute("trigger-click-on-close") }
  public set triggerClickOnClose(value: boolean) { this.toggleAttribute("trigger-click-on-close", value) }
  public get bordered(): boolean { return this.getAttribute("bordered") !== "false" }
  public set bordered(value: boolean) { this.setAttribute("bordered", String(value)) }
  public get round(): boolean { return this.hasAttribute("round") }
  public set round(value: boolean) { this.toggleAttribute("round", value) }
  public get strong(): boolean { return this.hasAttribute("strong") }
  public set strong(value: boolean) { this.toggleAttribute("strong", value) }
  public get size(): string { return this.getAttribute("size") ?? "medium" }
  public set size(value: string) { this.setAttribute("size", value) }
  public get type(): string { return this.getAttribute("type") ?? "default" }
  public set type(value: string) { this.setAttribute("type", value) }

  private synchronize(): void {
    this.observer?.disconnect()
    const authored = [...this.children].find((node): node is HTMLButtonElement =>
      node instanceof HTMLButtonElement && node !== this.generatedToggle && node !== this.closeButton)
    if (this.checkable && [...this.querySelectorAll(
      'button,a[href],input,select,textarea,summary,audio[controls],video[controls],[contenteditable]:not([contenteditable="false"]),[tabindex]:not([tabindex="-1"]),[role="button"],[role="checkbox"],[role="switch"],[role="link"]',
    )].some((node) => node !== authored && node !== this.generatedToggle && node !== this.closeButton)) {
      throw new Error("Checkable Tag labels must be noninteractive. Use at most one direct authored button; keep other controls outside the Tag.")
    }
    let toggle = authored ?? (this.checkable && this.generatedToggle?.parentNode === this ? this.generatedToggle : undefined)
    if (this.checkable && !toggle) {
      toggle = this.ownerDocument.createElement("button")
      toggle.type = "button"
      this.generatedToggle = toggle
      this.prepend(toggle)
    }
    if (toggle !== this.toggleButton) {
      this.toggleButton?.removeEventListener("click", this.onToggle)
      for (const name of this.overrides.keys()) this.manage(name, undefined)
      this.toggleButton?.removeAttribute("data-mui-tag-toggle")
      const old = this.toggleButton
      if (old && old !== authored && old.parentNode === this) {
        for (const node of [...old.childNodes]) this.insertBefore(node, old)
        old.remove()
        if (old === this.generatedToggle) this.generatedToggle = undefined
      }
      this.toggleButton = toggle
    }
    if (!this.closable || this.checkable) {
      this.closeButton?.removeEventListener("click", this.onClose)
      this.closeButton?.remove()
      this.closeButton = undefined
    }

    const root = toggle ?? authored ?? this
    if (!this.content || !this.contains(this.content)) {
      this.content = root.querySelector<HTMLSpanElement>(":scope > span[data-mui-tag-content]") ?? this.ownerDocument.createElement("span")
      this.content.dataset.muiTagContent = ""
    }
    if (this.content.parentNode !== root) root.prepend(this.content)
    const parents = root === this ? [this] : [this, root]
    for (const parent of parents) {
      for (const node of [...parent.childNodes]) {
        if (node === root || node === this.content || node === this.closeButton) continue
        if (node instanceof Element && node.matches("template,script,style")) continue
        this.content.append(node)
      }
    }
    if (toggle) {
      toggle.toggleAttribute("data-mui-tag-toggle", this.checkable)
      this.manage("type", this.checkable ? "button" : undefined)
      this.manage("aria-pressed", this.checkable ? String(this.checked) : undefined)
      this.manage("disabled", this.disabled ? "" : undefined)
      this.manage("tabindex", this.disabled || toggle.disabled ? "-1" : undefined)
      this.manage("aria-disabled", this.disabled || toggle.disabled ? "true" : undefined)
      for (const name of labels) this.manage(name, this.getAttribute(name) ?? undefined)
      toggle.addEventListener("click", this.onToggle)
    }
    if (this.closable && !this.checkable) {
      if (!this.closeButton) {
        this.closeButton = this.ownerDocument.createElement("button")
        this.closeButton.type = "button"
        this.closeButton.dataset.muiTagClose = ""
        this.closeButton.dataset.muiClose = ""
        const icon = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg")
        icon.setAttribute("aria-hidden", "true")
        icon.setAttribute("viewBox", "0 0 12 12")
        icon.setAttribute("focusable", "false")
        const path = this.ownerDocument.createElementNS(icon.namespaceURI, "path")
        path.setAttribute("d", "M2.5 2.5l7 7m0-7-7 7")
        path.setAttribute("fill", "none")
        path.setAttribute("stroke", "currentColor")
        path.setAttribute("stroke-linecap", "round")
        icon.append(path)
        this.closeButton.append(icon)
      }
      this.closeButton.setAttribute("aria-label", this.closeLabel)
      this.closeButton.disabled = this.disabled
      if (this.closeButton.parentNode !== this) this.append(this.closeButton)
      this.closeButton.addEventListener("click", this.onClose)
    }
    if (this.isConnected) this.observer?.observe(this, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["type", "disabled", "tabindex", "aria-pressed", "aria-disabled", ...labels],
    })
  }

  private readonly guardActivation = (event: Event): void => {
    if (this.disabled || (this.checkable && this.toggleButton?.matches(":disabled"))
      || (event.target instanceof Node && this.closeButton?.contains(event.target) && this.closeButton.matches(":disabled"))) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  private readonly onToggle = (event: MouseEvent): void => {
    if (!this.checkable || this.disabled || event.defaultPrevented || this.toggleButton?.matches(":disabled")) return
    this.checked = !this.checked
    this.dispatchEvent(new CustomEvent<boolean>("mui:change", { bubbles: true, detail: this.checked }))
  }

  private readonly onClose = (event: MouseEvent): void => {
    if (!this.triggerClickOnClose) event.stopPropagation()
    if (this.disabled || this.closeButton?.matches(":disabled")) return
    this.dispatchEvent(new CustomEvent<TagCloseDetail>("mui:close", {
      bubbles: true, cancelable: true, detail: { originalEvent: event },
    }))
  }

  private manage(name: string, value: string | null | undefined): void {
    const control = this.toggleButton!
    const current = control.getAttribute(name)
    let override = this.overrides.get(name)
    if (override && current !== override.applied) override.original = current
    if (value === undefined) {
      if (!override) return
      value = override.original
      this.overrides.delete(name)
    } else {
      if (!override) {
        override = { original: current, applied: value }
        this.overrides.set(name, override)
      }
      override.applied = value
    }
    if (value === null) control.removeAttribute(name)
    else if (current !== value) control.setAttribute(name, value)
  }
}
