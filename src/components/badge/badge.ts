import { ViewElement } from "../../core/index.js"
import { badgePlacements, badgeTypes } from "./model.js"
import type { BadgePlacement, BadgeType } from "./model.js"

export type { BadgePlacement, BadgeType } from "./model.js"

function numeric(value: string | null): number | undefined {
  if (value === null || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) return undefined
  const result = Number(value)
  return Number.isFinite(result) ? result : undefined
}

/**
 * A badge for displaying counts, status dots, or custom value indicators over target elements.
 */
export class Badge extends ViewElement {
  public static readonly tag = "m-badge"
  public static get observedAttributes(): string[] {
    return ["value", "max", "dot", "show", "show-zero", "processing", "type", "placement", "decorative"]
  }

  private badge: HTMLSpanElement | undefined
  private numberContent: HTMLSpanElement | undefined
  private customContent: HTMLSpanElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mBadge = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void { this.observer?.disconnect() }
  public attributeChangedCallback(): void { if (this.isConnected) this.synchronize() }

  public get indicator(): HTMLSpanElement | null { return this.badge ?? null }
  public get value(): string | undefined {
    const value = this.getAttribute("value")
    if (value === null) return undefined
    return value
  }
  public set value(value: string | number | null | undefined) {
    if (value == null || (typeof value === "number" && !Number.isFinite(value))) this.removeAttribute("value")
    else this.setAttribute("value", String(value))
  }
  /** @min 0 */
  public get max(): number | undefined {
    const raw = this.getAttribute("max")
    const max = numeric(raw)
    return max !== undefined && max >= 0 ? max : undefined
  }
  public set max(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value) || value < 0) this.removeAttribute("max")
    else this.setAttribute("max", String(value))
  }
  public get dot(): boolean { return this.hasAttribute("dot") }
  public set dot(value: boolean) { this.setBooleanAttribute("dot", value) }
  public get show(): boolean { return this.booleanAttribute("show", true) }
  public set show(value: boolean) { this.setBooleanAttribute("show", value, false) }
  public get showZero(): boolean { return this.hasAttribute("show-zero") }
  public set showZero(value: boolean) { this.setBooleanAttribute("show-zero", value) }
  public get processing(): boolean { return this.hasAttribute("processing") }
  public set processing(value: boolean) { this.setBooleanAttribute("processing", value) }
  public get type(): BadgeType { return this.choiceAttribute("type", badgeTypes, "default") }
  public set type(value: BadgeType) { this.setChoiceAttribute("type", value, badgeTypes) }
  public get placement(): BadgePlacement { return this.choiceAttribute("placement", badgePlacements, "top-end") }
  public set placement(value: BadgePlacement) { this.setChoiceAttribute("placement", value, badgePlacements) }
  public get decorative(): boolean { return this.hasAttribute("decorative") }
  public set decorative(value: boolean) { this.setBooleanAttribute("decorative", value) }

  private synchronize(): void {
    this.observer?.disconnect()
    if (this.badge?.parentNode !== this) {
      this.badge = this.ownerDocument.createElement("span")
      this.badge.dataset.mBadgeIndicator = ""
      this.numberContent = this.ownerDocument.createElement("span")
      this.numberContent.dataset.mBadgeNumber = ""
      this.customContent = this.ownerDocument.createElement("span")
      this.customContent.dataset.mBadgeCustom = ""
      this.badge.append(this.numberContent, this.customContent)
      this.append(this.badge)
    }
    const badge = this.badge
    const number = this.numberContent!
    const custom = this.customContent!
    for (const element of [...custom.children]) {
      if (!element.hasAttribute("data-m-badge-value")) this.insertBefore(element, badge)
    }
    for (const element of [...this.children]) {
      if (element !== badge && element.hasAttribute("data-m-badge-value") && !element.matches("template,script,style")) custom.append(element)
    }
    const attached = [...this.childNodes].some((node) => {
      if (node === badge) return false
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof Element && !node.matches("template,script,style")
    })
    this.dataset.mBadgeMode = attached ? "attached" : "standalone"

    const value = this.value
    const count = numeric(value ?? null)
    const max = this.max
    const text = count !== undefined && max !== undefined && count > max ? `${max}+` : value ?? ""
    const useDigitCells = count !== undefined && /^\d+\+?$/.test(text)
    if (number.textContent !== text || useDigitCells !== (number.childElementCount > 0)) {
      if (useDigitCells) {
        number.replaceChildren(...[...text].map((character) => {
          const digit = this.ownerDocument.createElement("span")
          digit.dataset.mBadgeDigit = ""
          digit.textContent = character
          return digit
        }))
      } else number.textContent = text
    }
    const authoredValue = custom.hasChildNodes()
    number.hidden = this.dot || authoredValue
    custom.hidden = this.dot
    const hasValue = value !== undefined && Boolean(value.trim())
      && (count === undefined || count > 0 || this.showZero)
    badge.hidden = !this.show || !(this.dot || authoredValue || hasValue)
    this.dataset.mBadgeState = badge.hidden ? "hidden" : this.dot ? "dot" : "value"
    if (this.decorative) badge.setAttribute("aria-hidden", "true")
    else badge.removeAttribute("aria-hidden")

    if (this.isConnected) this.observer?.observe(this, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["data-m-badge-value"],
    })
  }
}

export { Badge as MBadge }
