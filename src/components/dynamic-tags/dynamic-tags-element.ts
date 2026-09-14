import { ViewElement } from "../../core/index.js"

export type DynamicTagsSize = "small" | "medium" | "large"
export const dynamicTagsSizes: readonly DynamicTagsSize[] = ["small", "medium", "large"] as const

/**
 * A component for editing and managing a dynamic list of tags.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"Array"}}
 */
export class DynamicTags extends ViewElement {
  public static readonly tag = "m-dynamic-tags"
  public static get observedAttributes(): string[] {
    return ["max", "disabled", "size"]
  }

  private upgraded = false
  private listElement: HTMLUListElement | undefined
  private entryElement: HTMLElement | undefined
  private editorInput: HTMLInputElement | undefined
  private addButton: HTMLButtonElement | undefined
  private observer: MutationObserver | undefined

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-dynamic-tags")
    this.dataset.mDynamicTags = ""
    this.dataset.size = this.size
    this.render()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (!this.isConnected) return
    if (name === "size") {
      this.dataset.size = this.size
    } else if (name === "disabled") {
      this.syncDisabled()
    } else if (name === "max") {
      this.syncMax()
    }
  }

  public get max(): number {
    return this.numberAttribute("max", 20)
  }

  public set max(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
      throw new RangeError("Invalid max.")
    }
    this.setAttribute("max", String(Math.round(value)))
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }

  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
  }

  public get size(): DynamicTagsSize {
    return this.choiceAttribute("size", dynamicTagsSizes, "medium")
  }

  public set size(value: DynamicTagsSize) {
    this.setChoiceAttribute("size", value, dynamicTagsSizes)
  }

  public override focus(options?: FocusOptions): void {
    this.editorInput?.focus(options)
  }

  public override blur(): void {
    this.editorInput?.blur()
  }

  public getTags(): string[] {
    const inputs = [...this.querySelectorAll<HTMLInputElement>(".m-dynamic-tags__value")]
      .filter(input => (input.closest("m-dynamic-tags") as Element | null) === (this as Element))
    return inputs.map(input => input.value)
  }

  public add(tag: string): boolean {
    if (this.disabled) return false
    const trimmed = tag.trim()
    if (!trimmed) return false
    const current = this.getTags()
    if (current.length >= this.max) return false

    this.ensureStructure()
    const li = this.createTagItem(trimmed)
    this.listElement?.append(li)
    this.syncMax()
    this.emitChange()
    return true
  }

  public removeTag(target: number | string): boolean {
    if (this.disabled) return false
    const items = [...(this.listElement?.children ?? [])].filter((el): el is HTMLElement =>
      el.matches(".m-dynamic-tags__tag, [data-dynamic-row]"))
    let itemToRemove: HTMLElement | undefined
    if (typeof target === "number") {
      itemToRemove = items[target]
    } else {
      itemToRemove = items.find(item => {
        const input = item.querySelector<HTMLInputElement>(".m-dynamic-tags__value")
        return input?.value === target
      })
    }
    if (!itemToRemove) return false
    itemToRemove.remove()
    this.syncMax()
    this.emitChange()
    return true
  }

  public clear(): void {
    if (this.disabled) return
    if (this.listElement) {
      this.listElement.replaceChildren()
    }
    this.syncMax()
    this.emitChange()
  }

  private emitChange(): void {
    const value = this.getTags()
    this.emit<{ value: string[] }>("m:change", { value }, { bubbles: true, cancelable: false, composed: false })
  }

  private ensureStructure(): void {
    if (!this.listElement || !this.contains(this.listElement)) {
      let list = this.querySelector<HTMLUListElement>(".m-dynamic-tags__list, [data-dynamic-rows]")
      if (!list) {
        list = this.ownerDocument.createElement("ul")
        list.className = "m-dynamic-tags__list"
        list.setAttribute("data-dynamic-rows", "")
        this.prepend(list)
      }
      this.listElement = list
    }

    if (!this.entryElement || !this.contains(this.entryElement)) {
      let entry = this.querySelector<HTMLElement>(".m-dynamic-tags__entry, [data-tags-entry]")
      if (!entry) {
        entry = this.ownerDocument.createElement("div")
        entry.className = "m-dynamic-tags__entry"
        entry.setAttribute("data-tags-entry", "")

        const input = this.ownerDocument.createElement("input")
        input.type = "text"
        input.className = "m-dynamic-tags__editor"
        input.setAttribute("data-tags-editor", "")
        input.setAttribute("aria-label", "New tag")
        input.placeholder = "New tag"

        const button = this.ownerDocument.createElement("button")
        button.type = "button"
        button.className = "m-dynamic-tags__add"
        button.setAttribute("data-dynamic-add", "")
        button.textContent = "Add"

        entry.append(input, button)
        this.append(entry)
      }
      this.entryElement = entry
      this.editorInput = entry.querySelector<HTMLInputElement>("input") ?? undefined
      this.addButton = entry.querySelector<HTMLButtonElement>("button") ?? undefined

      this.editorInput?.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.isComposing && !e.repeat) {
          e.preventDefault()
          const val = this.editorInput?.value ?? ""
          if (this.add(val)) {
            if (this.editorInput) this.editorInput.value = ""
          }
        }
      })

      this.addButton?.addEventListener("click", (e: MouseEvent) => {
        e.preventDefault()
        const val = this.editorInput?.value ?? ""
        if (this.add(val)) {
          if (this.editorInput) this.editorInput.value = ""
          this.editorInput?.focus()
        }
      })
    }
  }

  private createTagItem(text: string): HTMLLIElement {
    const li = this.ownerDocument.createElement("li")
    li.className = "m-dynamic-tags__tag"
    li.setAttribute("data-dynamic-row", "")

    const input = this.ownerDocument.createElement("input")
    input.type = "text"
    input.readOnly = true
    input.className = "m-dynamic-tags__value"
    input.setAttribute("data-tags-value", "")
    input.value = text
    input.setAttribute("aria-label", "Tag")

    const removeBtn = this.ownerDocument.createElement("button")
    removeBtn.type = "button"
    removeBtn.setAttribute("data-dynamic-action", "remove")
    removeBtn.setAttribute("aria-label", `Remove ${text}`)
    removeBtn.textContent = "×"
    if (this.disabled) removeBtn.disabled = true

    removeBtn.addEventListener("click", (e: MouseEvent) => {
      e.preventDefault()
      if (this.disabled) return
      li.remove()
      this.syncMax()
      this.emitChange()
    })

    li.append(input, removeBtn)
    return li
  }

  private syncDisabled(): void {
    const isDisabled = this.disabled
    if (this.editorInput) this.editorInput.disabled = isDisabled
    if (this.addButton) this.addButton.disabled = isDisabled
    const removeButtons = this.querySelectorAll<HTMLButtonElement>("[data-dynamic-action='remove'], .m-dynamic-tags__tag button")
    for (const btn of removeButtons) {
      btn.disabled = isDisabled
    }
  }

  private syncMax(): void {
    const atMax = this.getTags().length >= this.max
    if (this.addButton && !this.disabled) {
      this.addButton.disabled = atMax
    }
    if (this.editorInput && !this.disabled) {
      this.editorInput.disabled = atMax
    }
  }

  private render(): void {
    this.ensureStructure()
    this.syncDisabled()
    this.syncMax()

    // Bind any existing remove buttons in authored tags
    const items = [...(this.listElement?.children ?? [])].filter((el): el is HTMLElement =>
      el.matches(".m-dynamic-tags__tag, [data-dynamic-row]"))
    for (const item of items) {
      const btn = item.querySelector<HTMLButtonElement>("button[data-dynamic-action='remove'], button")
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = ""
        btn.addEventListener("click", (e: MouseEvent) => {
          e.preventDefault()
          if (this.disabled) return
          item.remove()
          this.syncMax()
          this.emitChange()
        })
      }
    }
  }
}
