import type { ViewStyle } from "./style.js"

const layoutMap: Record<string, string> = { direction: "flex-direction", align: "align-items", justify: "justify-content", wrap: "flex-wrap" }

export abstract class ViewElement extends HTMLElement {
  public static readonly layoutAttributes: readonly string[] = Object.freeze(
    "display direction align justify wrap gap padding margin width height background border border-radius".split(" "),
  )

  public static register(
    elements: readonly (CustomElementConstructor & { readonly tag: string })[],
    registry: Pick<CustomElementRegistry, "get" | "define"> = customElements,
  ): void {
    const entries = new Map<string, CustomElementConstructor>()
    for (const constructor of elements) {
      const name: unknown = Object.getOwnPropertyDescriptor(constructor, "tag")?.value
      if (typeof name !== "string" || !/^m-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
        throw new TypeError("Registration requires an own m-* tag.")
      }
      if (!ViewElement.prototype.isPrototypeOf(constructor.prototype)) throw new TypeError("Registered elements must extend ViewElement.")
      if (entries.has(name)) throw new TypeError(`Duplicate element ${name}.`)
      const existing = registry.get(name)
      if (existing && existing !== constructor) throw new Error(`'${name}' is already defined by a different implementation.`)
      entries.set(name, constructor)
    }
    for (const [name, constructor] of entries) {
      if (!registry.get(name)) registry.define(name, constructor)
    }
  }

  protected upgradeProperties(): void {
    const seen = new Set<string>()
    let prototype: object | null = Object.getPrototypeOf(this)
    while (prototype && prototype !== HTMLElement.prototype) {
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
      if (prototype === ViewElement.prototype) break
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
    if (choices.includes(value as T)) return value as T
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
  protected syncLayoutStyle(n: string, v: string | null): boolean {
    if (!ViewElement.layoutAttributes.includes(n)) return false
    let value = v ?? ""
    if (/^(gap|padding|margin|width|height|border-radius)$/.test(n) && /^\d+$/.test(value)) value += "px"
    if (n === "wrap" && (v === "" || v === "true")) value = "wrap"
    this.style.setProperty(layoutMap[n] ?? n, value)
    return true
  }

  /**
   * Synchronize all recognized layout attributes currently present on this element.
   */
  protected syncAllLayoutStyles(): void {
    for (const a of ViewElement.layoutAttributes) this.syncLayoutStyle(a, this.getAttribute(a))
  }

  /**
   * Returns a detached snapshot of inline presentation, never component behavior attributes.
   */
  public get viewStyle(): ViewStyle {
    return Object.fromEntries(ViewElement.layoutAttributes.map(a => [
      a === "border-radius" ? "borderRadius" : a, this.style.getPropertyValue(layoutMap[a] ?? a) || null,
    ])) as ViewStyle
  }

  /**
   * Apply only supplied presentation styles without writing component behavior attributes.
   */
  public set viewStyle(style: ViewStyle) {
    if (!style || typeof style !== "object" || Array.isArray(style)) throw new TypeError("ViewStyle requires a style object.")
    const updates: [string, string][] = []
    for (const [k, v] of Object.entries(style)) {
      const a = k === "borderRadius" ? "border-radius" : k
      if (k === "border-radius" || !ViewElement.layoutAttributes.includes(a)) throw new TypeError(`Unknown ViewStyle property: ${k}.`)
      const length = /^(gap|padding|margin|width|height|border-radius)$/.test(a)
      let value: string
      if (v == null) value = ""
      else if (typeof v === "boolean" && a === "wrap") value = v ? "wrap" : "nowrap"
      else if (typeof v === "number" && length && Number.isFinite(v)) value = `${v}px`
      else if (typeof v === "string") value = length && /^\d+$/.test(v) ? `${v}px` : v
      else throw new TypeError(`Invalid ViewStyle value for ${k}.`)
      updates.push([layoutMap[a] ?? a, value])
    }
    for (const [property, value] of updates) this.style.setProperty(property, value)
  }

  /**
   * Semantic class token accessor.
   */
  public get classTokens(): readonly string[] {
    return Object.freeze([...this.classList])
  }

  public set classTokens(t: readonly string[] | string) {
    this.className = typeof t === "string" ? t : Array.isArray(t) ? t.filter(Boolean).join(" ") : ""
  }
}
