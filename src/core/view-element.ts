import type { ViewStyle } from "./style.js"

export abstract class ViewElement extends HTMLElement {
  public static readonly layoutAttributes: readonly string[] = [
    "display",
    "direction",
    "align",
    "justify",
    "wrap",
    "gap",
    "padding",
    "margin",
    "width",
    "height",
    "background",
    "border",
    "border-radius",
  ]

  public static register(
    elements: readonly (CustomElementConstructor & { readonly tag: string })[],
    registry: Pick<CustomElementRegistry, "get" | "define"> = customElements,
  ): void {
    const names = new Set<string>()
    const entries = elements.map(constructor => {
      const name: unknown = Object.getOwnPropertyDescriptor(constructor, "tag")?.value
      if (typeof name !== "string" || !/^m-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
        throw new TypeError("Registration requires an own m-* tag.")
      }
      if (!ViewElement.prototype.isPrototypeOf(constructor.prototype)) throw new TypeError("Registered elements must extend ViewElement.")
      if (names.has(name)) throw new TypeError(`Duplicate element ${name}.`)
      const existing = registry.get(name)
      if (existing && existing !== constructor) throw new Error(`'${name}' is already defined by a different implementation.`)
      names.add(name)
      return { name, constructor }
    })
    for (const { name, constructor } of entries) {
      if (!registry.get(name)) registry.define(name, constructor)
    }
  }

  protected upgradeProperties(): void {
    const seen = new Set<string>()
    let prototype: object | null = Object.getPrototypeOf(this)
    while (prototype && prototype !== ViewElement.prototype) {
      for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(prototype))) {
        if (seen.has(name)) continue
        seen.add(name)
        const own = Object.getOwnPropertyDescriptor(this, name)
        if (!own || !descriptor.get) continue
        if (!descriptor.set) throw new TypeError(`Cannot assign read-only property ${name} before upgrade.`)
        const value: unknown = Reflect.get(this, name)
        if (!Reflect.deleteProperty(this, name)) throw new TypeError(`Cannot remove own property ${name} during upgrade.`)
        try {
          descriptor.set.call(this, value)
        } catch (error) {
          Object.defineProperty(this, name, own)
          throw error
        }
      }
      prototype = Object.getPrototypeOf(prototype)
    }
  }

  protected setStringAttribute(name: string, value: string | null): void {
    if (value !== null && typeof value !== "string") throw new RangeError(`Invalid ${name}.`)
    if (value === null) this.removeAttribute(name)
    else this.setAttribute(name, value)
  }

  protected booleanAttribute(name: string, defaultValue: boolean): boolean {
    const value = this.getAttribute(name)
    if (value === null) return defaultValue
    if (value === "" || value === "true") return true
    if (value === "false") return false
    throw new RangeError(`Invalid boolean ${name}.`)
  }

  protected setBooleanAttribute(name: string, value: boolean, presence = true): void {
    if (typeof value !== "boolean") throw new RangeError(`Invalid boolean ${name}.`)
    if (presence) this.toggleAttribute(name, value)
    else this.setAttribute(name, String(value))
  }

  protected choiceAttribute<T extends string>(name: string, choices: readonly T[], defaultValue: T): T
  protected choiceAttribute<T extends string>(name: string, choices: readonly T[], defaultValue: null): T | null
  protected choiceAttribute<T extends string>(name: string, choices: readonly T[], defaultValue: T | null): T | null {
    const value = this.getAttribute(name)
    if (value === null) return defaultValue
    for (const choice of choices) if (choice === value) return choice
    throw new RangeError(`Invalid ${name}.`)
  }

  protected setChoiceAttribute<T extends string>(name: string, value: T, choices: readonly T[]): void {
    if (!choices.includes(value)) throw new RangeError(`Invalid ${name}.`)
    this.setAttribute(name, value)
  }

  protected setNullableChoiceAttribute<T extends string>(name: string, value: T | null, choices: readonly T[]): void {
    if (value === null) this.removeAttribute(name)
    else this.setChoiceAttribute(name, value, choices)
  }

  protected numberAttribute(name: string, defaultValue: null): number | null
  protected numberAttribute(name: string, defaultValue: number): number
  protected numberAttribute(name: string, defaultValue: number | null): number | null {
    const value = this.getAttribute(name)
    if (value === null) return defaultValue
    const number = Number(value)
    if (!value.trim() || !Number.isFinite(number)) throw new RangeError(`Invalid number ${name}.`)
    return number
  }

  protected emit<T>(name: string, detail: T, options: Omit<CustomEventInit<T>, "detail"> = {}): boolean {
    return this.dispatchEvent(new CustomEvent(name, { bubbles: true, ...options, detail }))
  }

  /**
   * Synchronize an individual layout attribute to element style.
   * Returns true if the attribute was recognized and handled as a layout attribute.
   */
  protected syncLayoutStyle(name: string, value: string | null): boolean {
    const s = this.style as unknown as Record<string, string>
    const px = (v: string | null) => (v && /^\d+$/.test(v) ? `${v}px` : (v ?? ""))
    if (name === "gap" || name === "padding" || name === "margin" || name === "width" || name === "height") {
      s[name] = px(value)
      return true
    }
    if (name === "border-radius") { s.borderRadius = px(value); return true }
    if (name === "direction") { s.flexDirection = value ?? ""; return true }
    if (name === "align") { s.alignItems = value ?? ""; return true }
    if (name === "justify") { s.justifyContent = value ?? ""; return true }
    if (name === "wrap") { s.flexWrap = value === "" || value === "true" || value === "wrap" ? "wrap" : (value ?? ""); return true }
    if (name === "display" || name === "background" || name === "border") { s[name] = value ?? ""; return true }
    return false
  }

  /**
   * Synchronize all recognized layout attributes currently present on this element.
   */
  protected syncAllLayoutStyles(): void {
    for (const attr of ViewElement.layoutAttributes) {
      this.syncLayoutStyle(attr, this.getAttribute(attr))
    }
  }

  /**
   * Returns a typed snapshot of the active layout style properties.
   */
  public get viewStyle(): ViewStyle {
    const o: Record<string, string | boolean | null> = {}
    for (const a of ViewElement.layoutAttributes) o[a === "border-radius" ? "borderRadius" : a] = this.getAttribute(a)
    o.wrap = this.hasAttribute("wrap")
    return o as ViewStyle
  }

  /**
   * Apply a typed ViewStyle object to this element, updating both attributes and styles.
   */
  public set viewStyle(style: ViewStyle) {
    if (!style || typeof style !== "object") return
    for (const [k, v] of Object.entries(style)) {
      const a = k === "borderRadius" ? "border-radius" : k
      if (ViewElement.layoutAttributes.includes(a)) {
        if (typeof v === "boolean") this.setBooleanAttribute(a, v)
        else this.setStringAttribute(a, v === null || v === undefined ? null : String(v))
      }
    }
    this.syncAllLayoutStyles()
  }

  /**
   * Semantic class token accessor.
   */
  public get classTokens(): readonly string[] {
    return Object.freeze([...this.classList])
  }

  public set classTokens(tokens: readonly string[] | string) {
    this.className = typeof tokens === "string" ? tokens : Array.isArray(tokens) ? tokens.filter(Boolean).join(" ") : ""
  }
}
