import { ViewElement } from "../../core/index.js"

export class DialogHeader extends ViewElement {
  public static readonly tag = "m-dialog-header"

  public connectedCallback(): void {
    this.setAttribute("data-dialog-header", "")
    this.dataset.part = "header"
  }
}

export class DialogBody extends ViewElement {
  public static readonly tag = "m-dialog-body"

  public connectedCallback(): void {
    this.setAttribute("data-dialog-content", "")
    this.dataset.part = "body"
  }
}

export class DialogFooter extends ViewElement {
  public static readonly tag = "m-dialog-footer"

  public connectedCallback(): void {
    this.setAttribute("data-dialog-actions", "")
    this.dataset.part = "footer"
  }
}

export class DialogAction extends ViewElement {
  public static readonly tag = "m-dialog-action"

  public connectedCallback(): void {
    this.dataset.part = "action"
  }
}
