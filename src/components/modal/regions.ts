import { ViewElement } from "../../core/index.js"

export class ModalHeader extends ViewElement {
  public static readonly tag = "m-modal-header"
  public static readonly observedAttributes: string[] = []

  public connectedCallback(): void {
    if (!this.hasAttribute("data-modal-header")) {
      this.setAttribute("data-modal-header", "")
    }
  }
}

export class ModalBody extends ViewElement {
  public static readonly tag = "m-modal-body"
  public static readonly observedAttributes: string[] = []

  public connectedCallback(): void {
    if (!this.hasAttribute("data-modal-content")) {
      this.setAttribute("data-modal-content", "")
    }
  }
}

export class ModalFooter extends ViewElement {
  public static readonly tag = "m-modal-footer"
  public static readonly observedAttributes: string[] = []

  public connectedCallback(): void {
    if (!this.hasAttribute("data-modal-footer")) {
      this.setAttribute("data-modal-footer", "")
    }
  }
}

export class ModalAction extends ViewElement {
  public static readonly tag = "m-modal-action"
  public static readonly observedAttributes: string[] = []

  public connectedCallback(): void {
    if (!this.hasAttribute("data-modal-action")) {
      this.setAttribute("data-modal-action", "")
    }
  }
}
