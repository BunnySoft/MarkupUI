import { ViewElement } from "../../core/index.js"
import { NativeOwner } from "./native-owner.js"
import { headingPrefixes, orderedListTypes, textDepths, textTypes } from "./model.js"
import type { HeadingPrefix, OrderedListType, TextType } from "./model.js"

function depth(value: number | null): void {
  if (value !== null && (!Number.isInteger(value) || value < 1 || value > 3)) throw new RangeError("Text depth must be 1, 2, 3 or null.")
}
function level(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 6) throw new RangeError("Heading level must be an integer from 1 to 6.")
  return value
}
function start(value: number | null): number | null {
  if (value !== null && (!Number.isInteger(value) || value < -2147483648 || value > 2147483647)) throw new RangeError("List start must be a signed 32-bit integer or null.")
  return value
}

/**
 * Rich-document styling scope; authored native content retains its semantics.
 * @region {"name":"content","accepts":["native document","Typography family"],"min":0,"max":null}
 */
export class Typography extends ViewElement {
  public static readonly tag = "m-typography"
  public static readonly observedAttributes = []
  public connectedCallback(): void { this.upgradeProperties() }
}

/**
 * Passive inline presentation. Author strong/em/del/code for native meaning.
 * @region {"name":"content","accepts":["phrasing"],"min":0,"max":null}
 */
export class Text extends ViewElement {
  public static readonly tag = "m-text"
  public static readonly observedAttributes = ["type", "depth", "strong", "italic", "underline"]
  private initialized = false
  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.validate()
  }
  public attributeChangedCallback(): void { if (this.initialized) this.validate() }
  public get type(): TextType { return this.choiceAttribute("type", textTypes, "default") }
  public set type(value: TextType) { this.setChoiceAttribute("type", value, textTypes) }
  /** @integer
   * @min 1
   * @max 3
   */
  public get depth(): number | null {
    const value = this.choiceAttribute("depth", textDepths, null)
    return value === null ? null : Number(value)
  }
  public set depth(value: number | null) { depth(value); this.setStringAttribute("depth", value === null ? null : String(value)) }
  public get strong(): boolean { return this.hasAttribute("strong") }
  public set strong(value: boolean) { this.setBooleanAttribute("strong", value) }
  public get italic(): boolean { return this.hasAttribute("italic") }
  public set italic(value: boolean) { this.setBooleanAttribute("italic", value) }
  public get underline(): boolean { return this.hasAttribute("underline") }
  public set underline(value: boolean) { this.setBooleanAttribute("underline", value) }
  private validate(): void { void this.type; void this.depth }
}

/** @region {"name":"content","accepts":["native p","phrasing"],"min":0,"max":1} */
export class Paragraph extends ViewElement {
  public static readonly tag = "m-p"
  public static readonly observedAttributes = ["type", "depth"]
  private initialized = false
  private readonly owner = new NativeOwner<HTMLParagraphElement>(this, () => this.render(), "p")
  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }
  public disconnectedCallback(): void { this.owner.disconnect() }
  public attributeChangedCallback(): void { if (this.initialized && this.isConnected) this.render() }
  public get native(): HTMLParagraphElement | null { return this.owner.element }
  public get type(): TextType { return this.choiceAttribute("type", textTypes, "default") }
  public set type(value: TextType) { this.setChoiceAttribute("type", value, textTypes) }
  /** @integer
   * @min 1
   * @max 3
   */
  public get depth(): number | null {
    const value = this.choiceAttribute("depth", textDepths, null)
    return value === null ? null : Number(value)
  }
  public set depth(value: number | null) { depth(value); this.setStringAttribute("depth", value === null ? null : String(value)) }
  private render(): void {
    const type = this.type, depth = this.depth
    const owner = this.owner.synchronize("p", "paragraph")
    owner.dataset.type = type
    if (depth === null) delete owner.dataset.depth
    else owner.dataset.depth = String(depth)
  }
}

/**
 * A native h1–h6 owns heading semantics. Changing level replaces its shell, not its contents.
 * @region {"name":"content","accepts":["native heading","phrasing"],"min":0,"max":1}
 */
export class Heading extends ViewElement {
  public static readonly tag = "m-heading"
  public static readonly observedAttributes = ["level", "type", "prefix", "align-text"]
  private initialized = false
  private readonly owner = new NativeOwner<HTMLHeadingElement>(this, () => this.render(), "h1,h2,h3,h4,h5,h6")
  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }
  public disconnectedCallback(): void { this.owner.disconnect() }
  public attributeChangedCallback(): void { if (this.initialized && this.isConnected) this.render() }
  public get native(): HTMLHeadingElement | null { return this.owner.element }
  /** @integer
   * @min 1
   * @max 6
   */
  public get level(): number { return level(this.numberAttribute("level", 2)) }
  public set level(value: number) { level(value); this.setStringAttribute("level", String(value)) }
  public get type(): TextType { return this.choiceAttribute("type", textTypes, "default") }
  public set type(value: TextType) { this.setChoiceAttribute("type", value, textTypes) }
  public override get prefix(): HeadingPrefix | null { return this.choiceAttribute("prefix", headingPrefixes, null) }
  public override set prefix(value: HeadingPrefix | null) { this.setNullableChoiceAttribute("prefix", value, headingPrefixes) }
  public get alignText(): boolean { return this.hasAttribute("align-text") }
  public set alignText(value: boolean) { this.setBooleanAttribute("align-text", value) }
  private render(): void {
    const level = this.level, type = this.type, prefix = this.prefix
    const owner = this.owner.synchronize(`h${level}`, "heading")
    owner.dataset.type = type
    if (prefix === null) delete owner.dataset.prefix
    else owner.dataset.prefix = prefix
    owner.toggleAttribute("data-align-text", this.alignText)
  }
}

/**
 * Native anchor navigation, download and focus; no synthesized activation.
 * @region {"name":"content","accepts":["native a","phrasing"],"min":0,"max":1}
 */
export class Link extends ViewElement {
  public static readonly tag = "m-link"
  public static readonly observedAttributes = ["href", "target", "rel", "download", "hreflang"]
  private initialized = false
  private readonly owner = new NativeOwner<HTMLAnchorElement>(this, () => this.render(), "a")
  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }
  public disconnectedCallback(): void { this.owner.disconnect() }
  public attributeChangedCallback(name: string): void { this.owner.forward(name) }
  public get native(): HTMLAnchorElement | null { return this.owner.element }
  public get href(): string | null { return this.owner.attribute("href", this.getAttribute("href")) }
  public set href(value: string | null) { this.setStringAttribute("href", value); this.owner.forward("href") }
  public get target(): string | null { return this.owner.attribute("target", this.getAttribute("target")) }
  public set target(value: string | null) { this.setStringAttribute("target", value); this.owner.forward("target") }
  public get rel(): string | null { return this.owner.attribute("rel", this.getAttribute("rel")) }
  public set rel(value: string | null) { this.setStringAttribute("rel", value); this.owner.forward("rel") }
  public get download(): string | null { return this.owner.attribute("download", this.getAttribute("download")) }
  public set download(value: string | null) { this.setStringAttribute("download", value); this.owner.forward("download") }
  public get hreflang(): string | null { return this.owner.attribute("hreflang", this.getAttribute("hreflang")) }
  public set hreflang(value: string | null) { this.setStringAttribute("hreflang", value); this.owner.forward("hreflang") }
  public override focus(options?: FocusOptions): void { this.native?.focus(options) }
  public override blur(): void { this.native?.blur() }
  private render(): void { this.owner.synchronize("a", "link") }
}

/** @region {"name":"content","accepts":["native blockquote","flow"],"min":0,"max":1} */
export class Blockquote extends ViewElement {
  public static readonly tag = "m-blockquote"
  public static readonly observedAttributes = ["cite", "align-text"]
  private initialized = false
  private readonly owner = new NativeOwner<HTMLQuoteElement>(this, () => this.render(), "blockquote")
  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }
  public disconnectedCallback(): void { this.owner.disconnect() }
  public attributeChangedCallback(name: string): void {
    if (name === "cite") this.owner.forward(name)
    if (this.initialized && this.isConnected) this.render()
  }
  public get native(): HTMLQuoteElement | null { return this.owner.element }
  public get cite(): string | null { return this.owner.attribute("cite", this.getAttribute("cite")) }
  public set cite(value: string | null) { this.setStringAttribute("cite", value); this.owner.forward("cite") }
  public get alignText(): boolean { return this.hasAttribute("align-text") }
  public set alignText(value: boolean) { this.setBooleanAttribute("align-text", value) }
  private render(): void { this.owner.synchronize("blockquote", "blockquote").toggleAttribute("data-align-text", this.alignText) }
}

/** @region {"name":"items","accepts":["native ul","native li"],"min":0,"max":null} */
export class UnorderedList extends ViewElement {
  public static readonly tag = "m-ul"
  public static readonly observedAttributes = ["align-text"]
  private initialized = false
  private readonly owner = new NativeOwner<HTMLUListElement>(this, () => this.render(), "ul")
  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }
  public disconnectedCallback(): void { this.owner.disconnect() }
  public attributeChangedCallback(): void { if (this.initialized && this.isConnected) this.render() }
  public get native(): HTMLUListElement | null { return this.owner.element }
  public get alignText(): boolean { return this.hasAttribute("align-text") }
  public set alignText(value: boolean) { this.setBooleanAttribute("align-text", value) }
  private render(): void { this.owner.synchronize("ul", "unordered-list").toggleAttribute("data-align-text", this.alignText) }
}

/** @region {"name":"items","accepts":["native ol","native li"],"min":0,"max":null} */
export class OrderedList extends ViewElement {
  public static readonly tag = "m-ol"
  public static readonly observedAttributes = ["start", "reversed", "type", "align-text"]
  private initialized = false
  private readonly owner = new NativeOwner<HTMLOListElement>(this, () => this.render(), "ol")
  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }
  public disconnectedCallback(): void { this.owner.disconnect() }
  public attributeChangedCallback(name: string): void {
    if (name === "start") void this.start
    if (name === "type") void this.type
    if (name !== "align-text") this.owner.forward(name)
    if (this.initialized && this.isConnected) this.render()
  }
  public get native(): HTMLOListElement | null { return this.owner.element }
  /** Null leaves the native implicit start (including reversed counting).
   * @integer
   * @min -2147483648
   * @max 2147483647
   */
  public get start(): number | null {
    const value = this.numberAttribute("start", null)
    const native = this.owner.attribute("start", null)
    if (value !== null) return start(value)
    if (native !== null && (!native.trim() || !Number.isFinite(Number(native)))) throw new RangeError("Invalid native list start.")
    return start(native === null ? null : Number(native))
  }
  public set start(value: number | null) { start(value); this.setStringAttribute("start", value === null ? null : String(value)); this.owner.forward("start") }
  public get reversed(): boolean { return this.hasAttribute("reversed") || this.owner.attribute("reversed", null) !== null }
  public set reversed(value: boolean) { this.setBooleanAttribute("reversed", value); this.owner.forward("reversed") }
  public get type(): OrderedListType | null {
    const value = this.choiceAttribute("type", orderedListTypes, null)
    if (value !== null) return value
    const native = this.owner.attribute("type", null)
    if (native !== null && !orderedListTypes.includes(native as OrderedListType)) throw new RangeError("Invalid native list type.")
    return native as OrderedListType | null
  }
  public set type(value: OrderedListType | null) { this.setNullableChoiceAttribute("type", value, orderedListTypes); this.owner.forward("type") }
  public get alignText(): boolean { return this.hasAttribute("align-text") }
  public set alignText(value: boolean) { this.setBooleanAttribute("align-text", value) }
  private render(): void {
    void this.start; void this.type
    this.owner.synchronize("ol", "ordered-list").toggleAttribute("data-align-text", this.alignText)
  }
}
