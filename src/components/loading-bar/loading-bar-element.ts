import { ViewElement } from "../../core/index.js"

export const loadingBarStatuses = ["loading", "error", "finish", "none"] as const
export type LoadingBarStatus = (typeof loadingBarStatuses)[number]

export interface LoadingBarChangeDetail {
  status: LoadingBarStatus
}

/**
 * A global or local progress bar indicating page navigation or asynchronous task status.
 * @region {"name":"content","accepts":["flow","phrasing"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"status":"string"}}
 * @states loading error finish none
 */
export class LoadingBar extends ViewElement {
  public static readonly tag = "m-loading-bar"
  public static get observedAttributes(): string[] {
    return ["status", "loading"]
  }

  private upgraded = false
  private ready = false
  private syncing = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-loading-bar")
    this.dataset.part = "loading-bar"
    this.dataset.mLoadingBar = ""
    this.setAttribute("data-loading-bar", "")
    this.render()
    this.ready = true
  }

  public disconnectedCallback(): void {
    this.ready = false
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.syncing) return
    this.syncing = true
    try {
      if (name === "status") {
        try {
          const s = this.status
          if (s === "loading" && !this.loading) {
            this.setBooleanAttribute("loading", true)
          } else if (s !== "loading" && this.loading) {
            this.setBooleanAttribute("loading", false)
          }
        } catch {
          // Invalid status attribute throws on property access
        }
      } else if (name === "loading") {
        try {
          const l = this.loading
          if (l && this.status !== "loading") {
            this.setChoiceAttribute("status", "loading", loadingBarStatuses)
          } else if (!l && this.status === "loading") {
            this.setChoiceAttribute("status", "none", loadingBarStatuses)
          }
        } catch {
          // Invalid loading attribute throws on property access
        }
      }
      try {
        this.render()
      } catch {
        // Invalid attributes do not render state updates
      }
      if (this.isConnected && this.ready) {
        try {
          this.emit<LoadingBarChangeDetail>("m:change", { status: this.status }, { bubbles: true, cancelable: false, composed: false })
        } catch {
          // Suppress change event for invalid status
        }
      }
    } finally {
      this.syncing = false
    }
  }

  public get status(): LoadingBarStatus {
    return this.choiceAttribute("status", loadingBarStatuses, "none")
  }

  public set status(value: LoadingBarStatus) {
    this.setChoiceAttribute("status", value, loadingBarStatuses)
  }

  public get loading(): boolean {
    return this.booleanAttribute("loading", false)
  }

  public set loading(value: boolean) {
    this.setBooleanAttribute("loading", value)
  }

  public start(): void {
    this.status = "loading"
  }

  public finish(): void {
    this.status = "finish"
  }

  public error(): void {
    this.status = "error"
  }

  private render(): void {
    let currentStatus: LoadingBarStatus
    try {
      currentStatus = this.status
    } catch {
      return
    }

    let progress = this.querySelector<HTMLProgressElement>(":scope > progress")
    if (!progress) {
      progress = this.ownerDocument.createElement("progress")
      progress.max = 100
      this.append(progress)
    }
    if (!progress.hasAttribute("aria-label") && !progress.hasAttribute("aria-labelledby")) {
      progress.setAttribute("aria-label", "Loading")
    }

    switch (currentStatus) {
      case "loading":
        this.setAttribute("data-loading-bar-state", "loading")
        progress.removeAttribute("value")
        progress.setAttribute("aria-valuetext", "Loading")
        break
      case "finish":
        this.setAttribute("data-loading-bar-state", "success")
        progress.value = progress.max || 100
        progress.setAttribute("aria-valuetext", "Completed")
        break
      case "error":
        this.setAttribute("data-loading-bar-state", "error")
        progress.setAttribute("aria-valuetext", "Failed")
        break
      case "none":
      default:
        this.setAttribute("data-loading-bar-state", "idle")
        progress.removeAttribute("value")
        progress.setAttribute("aria-valuetext", "Not loading")
        break
    }

    const statusTextNode = this.querySelector<HTMLElement>("[data-loading-bar-status]")
    if (statusTextNode) {
      const label = currentStatus === "loading" ? "Loading"
        : currentStatus === "finish" ? "Completed"
        : currentStatus === "error" ? "Failed" : "Not loading"
      statusTextNode.textContent = label
    }
  }
}

export const MLoadingBar = LoadingBar
