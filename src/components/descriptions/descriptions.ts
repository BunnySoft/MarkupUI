import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import { descriptionsLabelPlacements, descriptionsSizes, positiveInteger } from "./model.js"
import type { DescriptionsLabelPlacement, DescriptionsSize } from "./model.js"

/**
 * A descriptions list displaying multiple fields in groups.
 * @region {"name":"content","accepts":["DescriptionItem","dl groups","native flow"],"min":0,"max":null}
 */
export class Descriptions extends ViewElement {
  public static readonly tag = "m-descriptions"
  public static readonly observedAttributes = ["title", "bordered", "column", "columns", "size", "label-placement"]

  private generatedHeader: HTMLElement | undefined
  private observer: MutationObserver | undefined
  private initialized = false
  private readonly writes = ownedWrites()

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.observer ??= new MutationObserver(() => this.render())
    this.render()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.writes.restore()
  }

  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) this.render()
  }

  /**
   * Title text for the descriptions group.
   */
  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(value: string | null | undefined) {
    if (value != null && typeof value !== "string") throw new RangeError("Invalid title.")
    this.setStringAttribute("title", value ?? null)
  }

  /**
   * Whether to show borders around the descriptions list and between items.
   */
  public get bordered(): boolean {
    return this.hasAttribute("bordered")
  }
  public set bordered(value: boolean) {
    this.setBooleanAttribute("bordered", value)
  }

  /**
   * The number of columns in the descriptions grid. Default is 3.
   * @min 1
   * @integer
   */
  public get column(): number {
    const attr = this.getAttribute("column") ?? this.getAttribute("columns")
    if (attr === null) return 3
    const number = Number(attr)
    if (!attr.trim() || !Number.isFinite(number)) throw new RangeError("Invalid number column.")
    return positiveInteger(number, "column")
  }
  public set column(value: number) {
    positiveInteger(value, "column")
    this.setAttribute("column", String(value))
  }

  /**
   * Density size variant of the descriptions list. Default is "medium".
   */
  public get size(): DescriptionsSize {
    return this.choiceAttribute("size", descriptionsSizes, "medium")
  }
  public set size(value: DescriptionsSize) {
    this.setChoiceAttribute("size", value, descriptionsSizes)
  }

  /**
   * Placement of the label relative to the content ("top" or "left"). Default is "top".
   */
  public get labelPlacement(): DescriptionsLabelPlacement {
    return this.choiceAttribute("label-placement", descriptionsLabelPlacements, "top")
  }
  public set labelPlacement(value: DescriptionsLabelPlacement) {
    this.setChoiceAttribute("label-placement", value, descriptionsLabelPlacements)
  }

  private render(): void {
    this.observer?.disconnect()
    const column = this.column
    this.writes.restore()
    if (this.hasAttribute("column") || this.hasAttribute("columns")) {
      this.writes.style(this, "--_m-descriptions-columns", String(column))
    }

    const title = this.getAttribute("title")
    const authoredHeader = [...this.children].find(
      child => child !== this.generatedHeader && (
        child.localName === "header" ||
        (child.hasAttribute("data-part") && child.getAttribute("data-part") === "header") ||
        child.classList.contains("m-descriptions-header")
      )
    )

    if (authoredHeader) {
      this.generatedHeader?.remove()
      this.generatedHeader = undefined
    } else if (title) {
      if (!this.generatedHeader) {
        this.generatedHeader = this.ownerDocument.createElement("div")
        this.generatedHeader.className = "m-descriptions-header"
        this.generatedHeader.dataset.part = "header"
      }
      if (this.generatedHeader.textContent !== title) {
        this.generatedHeader.textContent = title
      }
      if (this.generatedHeader.parentElement !== this) {
        this.prepend(this.generatedHeader)
      }
    } else {
      this.generatedHeader?.remove()
      this.generatedHeader = undefined
    }

    if (this.isConnected) {
      this.observer?.observe(this, { childList: true })
    }
  }
}

export { Descriptions as MDescriptions }
