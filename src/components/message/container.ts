import { ViewElement } from "../../core/index.js"
import { messagePlacements } from "./model.js"
import type { MessagePlacement } from "./model.js"
import type { Message } from "./message-element.js"

export { messagePlacements } from "./model.js"
export type { MessagePlacement } from "./model.js"

/**
 * A container for positioning and displaying message notices.
 */
export class MessageContainer extends ViewElement {
  public static readonly tag = "m-message-container"
  public static get observedAttributes(): string[] {
    return ["placement"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-feedback-host", "m-feedback-host--fixed", "m-message-host")
    this.dataset.feedbackPlacement = this.placement
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "region")
      this.setAttribute("aria-label", "Messages")
    }
  }

  public attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (!this.isConnected) return
    if (name === "placement") {
      this.dataset.feedbackPlacement = this.placement
    }
  }

  public get placement(): MessagePlacement {
    return this.choiceAttribute("placement", messagePlacements, "top")
  }
  public set placement(value: MessagePlacement) {
    this.setChoiceAttribute("placement", value, messagePlacements)
  }

  public get messages(): Message[] {
    return [...this.querySelectorAll<Message>(":scope > m-message")]
  }

  public add(message: Message): void {
    this.append(message)
  }

  public destroyAll(): void {
    for (const msg of this.messages) {
      msg.close()
    }
  }
}

export const MMessageContainer = MessageContainer
