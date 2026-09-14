import { ViewElement } from "../../core/index.js"

const orientations = ["horizontal", "vertical"] as const
const placements = ["start", "center", "end"] as const
export type DividerOrientation = typeof orientations[number]
export type DividerTitlePlacement = typeof placements[number]

/**
 * A rule with independent authored title content, never a focusable splitter.
 * @region {"name":"title","accepts":["text","noninteractive heading"],"min":0,"max":1}
 * @states titled decorative
 */
export class Divider extends ViewElement {
  public static readonly tag = "m-divider"
  public static readonly observedAttributes = ["orientation", "dashed", "title-placement", "semantic", "label"]
  private rule: HTMLHRElement | undefined
  private titleContent: HTMLDivElement | undefined
  private tail: HTMLSpanElement | undefined
  private observer: MutationObserver | undefined
  private initialized = false

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "divider"
    this.observer ??= new MutationObserver(() => this.render())
    this.render()
  }

  public disconnectedCallback(): void { this.observer?.disconnect() }
  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) this.render()
  }

  public get orientation(): DividerOrientation { return this.choiceAttribute("orientation", orientations, "horizontal") }
  public set orientation(value: DividerOrientation) { this.setChoiceAttribute("orientation", value, orientations) }
  public get dashed(): boolean { return this.hasAttribute("dashed") }
  public set dashed(value: boolean) { this.setBooleanAttribute("dashed", value) }
  public get titlePlacement(): DividerTitlePlacement { return this.choiceAttribute("title-placement", placements, "center") }
  public set titlePlacement(value: DividerTitlePlacement) { this.setChoiceAttribute("title-placement", value, placements) }
  public get semantic(): boolean { return this.booleanAttribute("semantic", true) }
  public set semantic(value: boolean) { this.setBooleanAttribute("semantic", value, false) }
  public get label(): string | null { return this.getAttribute("label") }
  public set label(value: string | null) { this.setStringAttribute("label", value) }

  private render(): void {
    if (!this.isConnected) return
    const orientation = this.orientation, semantic = this.semantic, label = this.label
    void this.titlePlacement
    this.observer?.disconnect()
    if (!this.rule) {
      this.rule = this.ownerDocument.createElement("hr")
      this.rule.dataset.part = "rule"
      this.tail = this.ownerDocument.createElement("span")
      this.tail.dataset.part = "tail"
      this.tail.setAttribute("aria-hidden", "true")
    }
    if (this.titleContent?.parentElement !== this) {
      this.titleContent = this.ownerDocument.createElement("div")
      this.titleContent.dataset.part = "title"
    }
    const before: Node[] = [], after: Node[] = []
    let seenTitle = false
    for (const node of this.childNodes) {
      if (node === this.titleContent) { seenTitle = true; continue }
      if (node === this.rule || node === this.tail || node instanceof Element && node.matches("template,script,style")) continue
      ;(seenTitle ? after : before).push(node)
    }
    if (before.length) this.titleContent.prepend(...before)
    if (after.length) this.titleContent.append(...after)
    if (this.firstChild !== this.rule) this.prepend(this.rule)
    if (this.rule.nextSibling !== this.titleContent) this.rule.after(this.titleContent)
    if (this.titleContent.nextSibling !== this.tail) this.titleContent.after(this.tail!)

    const titled = [...this.titleContent.childNodes].some(node =>
      node.nodeType === Node.TEXT_NODE ? Boolean(node.textContent?.trim())
        : node instanceof Element && !node.matches("template,script,style"))
    this.dataset.state = [titled ? "titled" : "", semantic ? "" : "decorative"].filter(Boolean).join(" ")
    this.rule.setAttribute("aria-orientation", orientation)
    if (semantic) this.rule.removeAttribute("aria-hidden")
    else this.rule.setAttribute("aria-hidden", "true")
    if (label === null) this.rule.removeAttribute("aria-label")
    else this.rule.setAttribute("aria-label", label)
    this.observer?.observe(this, { childList: true, subtree: true, characterData: true })
  }
}
