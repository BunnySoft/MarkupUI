import { ViewElement } from "../../core/index.js"
import { createDynamicTags } from "./dynamic-tags.js"
import type { DynamicTag, DynamicTagsCommitResult, DynamicTagsController, DynamicTagsOptions } from "./dynamic-tags.js"

export type DynamicTagsSize = "small" | "medium" | "large"
export const dynamicTagsSizes: readonly DynamicTagsSize[] = ["small", "medium", "large"] as const

/**
 * String tags backed by native readonly fields and one collection controller.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"readonly string[]","type":"string","tag":"DynamicTag"}}
 * @event {"name":"Reject","web":"m:dynamic-tags-reject","bubbles":false,"cancelable":false,"composed":false,"detail":{"reason":"DynamicTagsRejection","message":"string"}}
 * @event {"name":"Error","web":"m:dynamic-tags-error","bubbles":false,"cancelable":false,"composed":false,"detail":{"error":"unknown","committed":"boolean"}}
 */
export class DynamicTags extends ViewElement {
  public static readonly tag = "m-dynamic-tags"
  public static get observedAttributes(): string[] { return ["max", "disabled", "size", "duplicates", "name", "maxlength", "editor-label"] }

  private upgraded = false
  private controller: DynamicTagsController | undefined
  private fieldset: HTMLFieldSetElement | undefined
  private pendingDraft: string | undefined
  private creator: DynamicTagsOptions["create"]
  private connector: DynamicTagsOptions["connect"]
  private template: HTMLTemplateElement | undefined

  public connectedCallback(): void {
    if (!this.upgraded) { this.upgraded = true; this.upgradeProperties() }
    this.classList.add("m-dynamic-tags")
    this.dataset.dynamicTags = ""
    this.dataset.dynamicInput = ""
    this.dataset.size = this.size
    this.ensureStructure()
    this.fieldset!.disabled = this.disabled
    const editor = this.own<HTMLInputElement>("[data-tags-editor]")!
    if (this.hasAttribute("maxlength")) editor.maxLength = this.maxLength
    if (this.hasAttribute("editor-label")) editor.setAttribute("aria-label", this.editorLabel)
    if (this.hasAttribute("name")) this.syncName()
    this.controller = createDynamicTags(this, {
      max: this.max, duplicates: this.duplicates,
      create: value => this.creator ? this.creator(value) : value,
      connect: (row, context) => { this.renderTag(row); return this.connector?.(row, context) },
    })
    if (this.pendingDraft !== undefined) {
      this.controller.editor.value = this.pendingDraft
      this.pendingDraft = undefined
    }
  }

  public disconnectedCallback(): void {
    this.controller?.disconnect()
  }

  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || !this.controller?.connected) return
    if (name === "size") this.dataset.size = this.size
    else if (name === "disabled") this.fieldset!.disabled = this.disabled
    else if (name === "max" && this.controller.max !== this.max) this.controller.setMax(this.max)
    else if (name === "duplicates" && this.controller.duplicates !== this.duplicates) this.controller.setDuplicates(this.duplicates)
    else if (name === "maxlength" && this.controller.maxLength !== this.maxLength) this.controller.setMaxLength(this.maxLength)
    else if (name === "editor-label") this.controller.editor.setAttribute("aria-label", this.editorLabel)
    else if (name === "name") this.syncName()
  }

  /** @min 1 @max 100 @integer */
  public get max(): number {
    const value = this.numberAttribute("max", 20)
    this.validateMax(value)
    return value
  }
  public set max(value: number) {
    this.validateMax(value)
    if (this.controller?.connected) this.controller.setMax(value)
    this.setAttribute("max", String(value))
  }
  private validateMax(value: number): void {
    if (!Number.isInteger(value) || value < 1 || value > 100 || value < this.tags.length) throw new RangeError("Use max 1-100 containing the current tags.")
  }

  public get duplicates(): "allow" | "reject" { return this.choiceAttribute("duplicates", ["allow", "reject"], "allow") }
  public set duplicates(value: "allow" | "reject") {
    if (value === "reject" && new Set(this.values).size !== this.values.length) throw new RangeError("Current tags contain duplicates.")
    if (this.controller?.connected) this.controller.setDuplicates(value)
    this.setChoiceAttribute("duplicates", value, ["allow", "reject"])
  }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get size(): DynamicTagsSize { return this.choiceAttribute("size", dynamicTagsSizes, "medium") }
  public set size(value: DynamicTagsSize) { this.setChoiceAttribute("size", value, dynamicTagsSizes) }

  /** Submission name for generated values; explicit writes also rename adopted values. */
  public get name(): string {
    const name = this.getAttribute("name") ?? "tags[]"
    if (!name) throw new TypeError("Use a nonempty tag field name.")
    return name
  }
  public set name(value: string) {
    if (typeof value !== "string" || !value) throw new TypeError("Use a nonempty tag field name.")
    this.setAttribute("name", value)
  }
  /** Generated-editor bound; adopted Web editors retain their bound when the attribute is absent.
   * @min 1 @max 2048 @integer
   */
  public get maxLength(): number {
    const value = this.hasAttribute("maxlength") ? this.numberAttribute("maxlength", 128) : this.controller?.maxLength ?? 128
    if (!Number.isInteger(value) || value < 1 || value > 2048) throw new RangeError("Use maxlength 1-2048.")
    return value
  }
  public set maxLength(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 2048 || this.values.some(tag => tag.length > value)) throw new RangeError("Use maxlength 1-2048 containing current tags.")
    if (this.controller?.connected) this.controller.setMaxLength(value)
    this.setAttribute("maxlength", String(value))
  }
  public get editorLabel(): string {
    const value = this.getAttribute("editor-label") ?? "New tag"
    if (!value.trim()) throw new TypeError("Use a nonblank editor label.")
    return value
  }
  public set editorLabel(value: string) {
    if (typeof value !== "string" || !value.trim()) throw new TypeError("Use a nonblank editor label.")
    this.setAttribute("editor-label", value)
  }
  private syncName(): void {
    const name = this.name
    for (const control of this.querySelectorAll<HTMLInputElement>("[data-tags-value]")) {
      if (control.closest("[data-dynamic-input]") === this) control.name = name
    }
    this.template!.content.querySelector<HTMLInputElement>("[data-tags-value]")!.name = name
  }

  /** Web callback: synchronous string derivation, applied to future commits. */
  public get createTag(): DynamicTagsOptions["create"] { return this.creator }
  public set createTag(value: DynamicTagsOptions["create"]) {
    if (value !== undefined && typeof value !== "function") throw new TypeError("createTag must be a synchronous function.")
    this.creator = value
  }
  /** Web resource hook for newly connected rows; register disposal with context.onCleanup. */
  public get connectTag(): DynamicTagsOptions["connect"] { return this.connector }
  public set connectTag(value: DynamicTagsOptions["connect"]) {
    if (value !== undefined && typeof value !== "function") throw new TypeError("connectTag must be a synchronous function.")
    this.connector = value
  }

  /** Web interoperability only: native editor, null before first connection. */
  public get editor(): HTMLInputElement | null { return this.controller?.editor ?? null }
  public get draft(): string { return this.pendingDraft ?? this.editor?.value ?? "" }
  public set draft(value: string) {
    if (typeof value !== "string" || /[\r\n]/.test(value)) throw new TypeError("Use a single-line string draft.")
    if (this.editor) this.editor.value = value
    else this.pendingDraft = value
  }
  public get tags(): readonly DynamicTag[] { return this.controller?.tags ?? [] }
  public get values(): readonly string[] { return this.controller?.values ?? [] }
  public get connected(): boolean { return this.controller?.connected ?? false }
  public get error(): unknown { return this.controller?.error ?? null }

  public commit(): DynamicTagsCommitResult { return this.requireController().commit() }
  /** Remove precisely one stable key, including when strings are identical. */
  public removeTag(key: string): boolean { return this.requireController().remove(key) }
  /** Each committed removal emits its own change and runs its own resource cleanup. */
  public clear(): void {
    const controller = this.requireController()
    for (const tag of controller.tags) if (controller.tags.some(current => current.key === tag.key)) controller.remove(tag.key)
  }
  public refresh(): void {
    this.requireController().refresh()
    for (const tag of this.tags) this.renderTag(tag.element)
  }
  public override focus(options?: FocusOptions): void { this.editor?.focus(options) }
  public override blur(): void { this.editor?.blur() }

  private requireController(): DynamicTagsController {
    if (!this.controller?.connected) throw new Error("Dynamic Tags is disconnected.")
    return this.controller
  }

  private own<T extends HTMLElement>(selector: string): T | null {
    return [...this.querySelectorAll<T>(selector)].find(node => node.closest("m-dynamic-tags, [data-dynamic-input]") === this) ?? null
  }

  private renderTag(row: HTMLElement): void {
    const button = row.querySelector<HTMLButtonElement>(":scope > [data-tags-remove]")
    const control = row.querySelector<HTMLInputElement>(":scope > [data-tags-value]")
    if (button && control) {
      button.setAttribute("aria-label", `Remove ${control.value}`)
      control.size = Math.min(24, Math.max(2, control.value.length))
    }
  }

  private ensureStructure(): void {
    if (this.fieldset) return
    const document = this.ownerDocument
    let list = this.own("[data-dynamic-rows]")
    if (!list) {
      list = document.createElement("ul")
      list.className = "m-dynamic-tags__list"
      list.dataset.dynamicRows = ""
      this.prepend(list)
    }
    let template = this.own<HTMLTemplateElement>("[data-dynamic-template]")
    if (!template) {
      template = document.createElement("template")
      template.dataset.dynamicTemplate = ""
      const row = document.createElement("li")
      row.className = "m-dynamic-tags__tag"
      row.dataset.dynamicRow = ""
      const control = document.createElement("input")
      Object.assign(control, { className: "m-dynamic-tags__value", type: "text", readOnly: true, name: "tags[]" })
      control.dataset.tagsValue = ""
      control.setAttribute("aria-label", "Tag")
      const remove = document.createElement("button")
      Object.assign(remove, { type: "button", hidden: true, textContent: "\u00d7" })
      remove.dataset.dynamicAction = "remove"
      remove.dataset.tagsRemove = ""
      row.append(control, remove)
      template.content.append(row)
      this.append(template)
    }
    this.template = template
    let entry = this.own("[data-tags-entry]")
    if (!entry) {
      entry = document.createElement("div")
      entry.className = "m-dynamic-tags__entry"
      entry.dataset.tagsEntry = ""
      entry.hidden = true
      const input = document.createElement("input")
      Object.assign(input, { className: "m-dynamic-tags__editor", type: "text", maxLength: 128, placeholder: "New tag" })
      input.dataset.tagsEditor = ""
      input.setAttribute("aria-label", "New tag")
      const add = document.createElement("button")
      Object.assign(add, { className: "m-dynamic-tags__add", type: "button", hidden: true, textContent: "Add" })
      add.dataset.dynamicAdd = ""
      entry.append(input, add)
      this.append(entry)
    }
    // Native fieldset disabling leaves each authored control's own flags intact.
    const fieldset = document.createElement("fieldset")
    fieldset.className = "m-dynamic-tags__controls"
    fieldset.append(...this.childNodes)
    this.append(fieldset)
    this.fieldset = fieldset
  }
}
