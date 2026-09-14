import { ViewElement } from "../../core/index.js"
import { boxDisplays, boxDirections, boxAlignments, boxJustifications } from "./model.js"
import type { BoxDisplay, BoxDirection, BoxAlign, BoxJustify } from "./model.js"

/**
 * Universal layout box and container component supporting declarative layout attributes.
 * @region {"name":"content","accepts":["flow content","text","components"],"min":0,"max":null}
 */
export class Box extends ViewElement {
  public static readonly tag: string = "m-box"
  public static get observedAttributes(): string[] {
    return [
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
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.syncStyles()
  }

  public disconnectedCallback(): void {
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    this.syncStyles()
  }

  public get display(): BoxDisplay | null {
    return this.choiceAttribute("display", boxDisplays, null)
  }
  public set display(val: BoxDisplay | null) {
    this.setNullableChoiceAttribute("display", val, boxDisplays)
  }

  public get direction(): BoxDirection | null {
    return this.choiceAttribute("direction", boxDirections, null)
  }
  public set direction(val: BoxDirection | null) {
    this.setNullableChoiceAttribute("direction", val, boxDirections)
  }

  public get align(): BoxAlign | null {
    return this.choiceAttribute("align", boxAlignments, null)
  }
  public set align(val: BoxAlign | null) {
    this.setNullableChoiceAttribute("align", val, boxAlignments)
  }

  public get justify(): BoxJustify | null {
    return this.choiceAttribute("justify", boxJustifications, null)
  }
  public set justify(val: BoxJustify | null) {
    this.setNullableChoiceAttribute("justify", val, boxJustifications)
  }

  public get wrap(): boolean {
    return this.hasAttribute("wrap")
  }
  public set wrap(val: boolean) {
    this.setBooleanAttribute("wrap", val)
  }

  public get gap(): string | null {
    return this.getAttribute("gap")
  }
  public set gap(val: string | null) {
    this.setStringAttribute("gap", val)
  }

  public get padding(): string | null {
    return this.getAttribute("padding")
  }
  public set padding(val: string | null) {
    this.setStringAttribute("padding", val)
  }

  public get margin(): string | null {
    return this.getAttribute("margin")
  }
  public set margin(val: string | null) {
    this.setStringAttribute("margin", val)
  }

  public get width(): string | null {
    return this.getAttribute("width")
  }
  public set width(val: string | null) {
    this.setStringAttribute("width", val)
  }

  public get height(): string | null {
    return this.getAttribute("height")
  }
  public set height(val: string | null) {
    this.setStringAttribute("height", val)
  }

  public get background(): string | null {
    return this.getAttribute("background")
  }
  public set background(val: string | null) {
    this.setStringAttribute("background", val)
  }

  public get border(): string | null {
    return this.getAttribute("border")
  }
  public set border(val: string | null) {
    this.setStringAttribute("border", val)
  }

  public get borderRadius(): string | null {
    return this.getAttribute("border-radius")
  }
  public set borderRadius(val: string | null) {
    this.setStringAttribute("border-radius", val)
  }

  private syncStyles(): void {
    this.syncAllLayoutStyles()
  }
}

/**
 * Direct div alias for Box.
 * @region {"name":"content","accepts":["flow content","text","components"],"min":0,"max":null}
 */
export class Div extends Box {
  public static override readonly tag: string = "m-div"
}
