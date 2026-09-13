import { ViewElement } from "../../core/index.js"

/**
 * A content pane within a Split container.
 * @region {"name":"content","accepts":["native flow","text","components"],"min":0,"max":null}
 */
export class SplitPane extends ViewElement {
  public static readonly tag = "m-split-pane"

  private initialized = false

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "pane"
  }
}
