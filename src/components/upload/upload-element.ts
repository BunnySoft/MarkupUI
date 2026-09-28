import { ViewElement } from "../../core/index.js"
import { createUpload, uploadSettings } from "./upload.js"
import type { UploadController, UploadFile, UploadOptions, UploadSelection, UploadState } from "./upload.js"

/**
 * Bounded file selection and explicit application-supplied transport.
 * @region {"name":"trigger","element":"m-upload-trigger","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"dragger","element":"m-upload-dragger","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"fileList","element":"m-upload-file-list","accepts":["content","items"],"min":0,"max":1}
 * @event {"name":"Change","web":"m:upload-change","bubbles":true,"cancelable":false,"composed":false,"detail":{"reason":"string","files":"readonly UploadFile[]","state":"UploadState"}}
 * @event {"name":"Progress","web":"m:upload-progress","bubbles":true,"cancelable":false,"composed":false,"detail":{"file":"File","loaded":"number","total":"number | null"}}
 * @event {"name":"Error","web":"m:upload-error","bubbles":true,"cancelable":false,"composed":false,"detail":{"error":"unknown","phase":"string"}}
 */
export class Upload extends ViewElement {
  public static readonly tag = "m-upload"
  public static readonly observedAttributes = ["accept", "multiple", "disabled", "name", "directory", "label"]
  #upgraded = false
  #initialized = false
  #controller: UploadController | null = null
  #options: UploadOptions = Object.freeze({})
  #scope: HTMLElement | null = null
  #input: HTMLInputElement | null = null
  #fields: HTMLFieldSetElement | null = null
  #caption: HTMLElement | null = null
  #readout: HTMLElement | null = null
  #error: unknown = null
  #waiting = false
  #generated = false

  public connectedCallback(): void {
    if (!this.#upgraded) { this.#upgraded = true; this.upgradeProperties() }
    this.#render()
    this.#sync()
    this.addEventListener("click", this.#trigger)
    this.#connect()
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.#trigger)
    this.#controller?.disconnect()
  }

  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || !this.#input) return
    this.#sync(name)
  }

  public get accept(): string { return this.getAttribute("accept") ?? "" }
  public set accept(value: string) { this.setStringAttribute("accept", value) }
  public get multiple(): boolean { return this.hasAttribute("multiple") }
  public set multiple(value: boolean) { this.setBooleanAttribute("multiple", value) }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get name(): string { return this.getAttribute("name") ?? "" }
  public set name(value: string) { this.setStringAttribute("name", value) }
  public get directory(): boolean { return this.hasAttribute("directory") }
  public set directory(value: boolean) { this.setBooleanAttribute("directory", value) }
  public get label(): string { return this.getAttribute("label") ?? "Files" }
  public set label(value: string) { this.setStringAttribute("label", value) }

  /** Full configuration replacement, allowed only when idle. Does not resend existing files. */
  public get options(): Readonly<UploadOptions> { return this.#options }
  public set options(value: UploadOptions) {
    uploadSettings(value)
    const next = Object.freeze({ ...value })
    if (this.#controller?.state.active) throw new Error("Wait for Upload to become idle before configuring it.")
    if (this.#controller?.connected) this.#controller.configure(next)
    this.#options = next
  }

  /** Web-only native file/form owner, also available without queue enhancement. */
  public get native(): HTMLInputElement | null { return this.#input }
  public get files(): readonly UploadFile[] { return this.#controller?.files ?? Object.freeze([]) }
  /** Null means enhancement is unavailable; use the visible native chooser. */
  public get state(): UploadState | null { return this.#controller?.state ?? null }
  public get enhancementError(): unknown { return this.#error }
  public addFiles(files: readonly File[] | FileList, mode?: "append" | "replace"): UploadSelection { return this.#live().add(files, mode) }
  public start(id?: string): void { this.#live().start(id) }
  public retry(id: string): void { this.#live().retry(id) }
  public cancel(id?: string): void { this.#live().cancel(id) }
  public removeFile(id: string): void { this.#live().remove(id) }
  public clear(): void { this.#live().clear() }
  public refresh(): UploadSelection | null { return this.#live().refresh() }
  public whenIdle(): Promise<void> { return this.#controller?.whenIdle() ?? Promise.resolve() }
  public override focus(options?: FocusOptions): void { this.#input?.focus(options) }
  public openFileChooser(): void {
    if (this.isConnected && this.#input && !this.#input.matches(":disabled") && !this.closest("[hidden],[inert]")
      && !this.#controller?.state.disabled) this.#input.click()
  }

  #live(): UploadController {
    if (!this.isConnected || !this.#controller?.connected) throw new Error("Upload enhancement is unavailable or waiting for a transport to settle.")
    return this.#controller
  }

  #connect(): void {
    if (!this.isConnected || this.#waiting || this.#controller?.connected) return
    if (this.#controller?.state.active) {
      this.#waiting = true
      void this.#controller.whenIdle().then(() => { this.#waiting = false; this.#connect() })
      return
    }
    try {
      this.#controller = createUpload(this.#scope!, this.#options, this, !this.#initialized)
      this.#initialized = true
      this.#error = null
    } catch (error) {
      this.#controller = null
      this.#error = error
      this.#readout!.textContent = "Queue unavailable. Use the file chooser for native form submission."
      this.emit("m:upload-error", Object.freeze({ error, phase: "enhancement" }))
    }
  }

  #sync(changed?: string): void {
    const input = this.#input!
    for (const name of ["accept", "name", "multiple", "disabled"]) {
      if (!this.#generated && !this.hasAttribute(name) && name !== changed) continue
      const value = this.getAttribute(name)
      if (value === null) input.removeAttribute(name)
      else input.setAttribute(name, value)
    }
    if (this.#generated || this.hasAttribute("directory") || changed === "directory") {
      input.toggleAttribute("webkitdirectory", this.directory)
      input.toggleAttribute("directory", this.directory)
    }
    this.#fields!.disabled = this.disabled
    this.#caption!.textContent = this.label
    this.#scope!.setAttribute("aria-label", this.label)
    if (this.#controller?.connected) this.#controller.refresh()
  }

  #render(): void {
    if (this.#scope) return
    const doc = this.ownerDocument
    const make = <K extends keyof HTMLElementTagNameMap>(tag: K, part: string) => {
      const node = doc.createElement(tag)
      node.setAttribute(`data-upload-${part}`, "")
      return node
    }
    const own = (selector: string) => [...this.querySelectorAll<HTMLElement>(selector)].filter(node => node.closest("m-upload") === this)
    const region = (tag: string) => {
      const nodes = own(tag)
      if (nodes.length > 1) throw new TypeError(`Use at most one ${tag}.`)
      return nodes[0]
    }
    const trigger = region("m-upload-trigger"), dragger = region("m-upload-dragger"), fileList = region("m-upload-file-list")
    const inputs = own('input[type="file"]') as HTMLInputElement[]
    if (inputs.length > 1) throw new TypeError("Use one Upload file input.")
    this.#generated = !inputs.length
    const input = this.#input = inputs[0] ?? doc.createElement("input")
    input.type = "file"; input.setAttribute("data-upload-input", "")
    const scope = this.#scope = doc.createElement("section")
    scope.className = "m-upload"; scope.setAttribute("data-upload", ""); scope.tabIndex = -1
    const fields = this.#fields = make("fieldset", "fields")
    this.#caption = doc.createElement("legend")
    fields.append(this.#caption, ...this.childNodes)
    scope.append(fields); this.append(scope)
    if (!input.parentNode) fields.append(input)
    if (!input.labels?.length && !input.hasAttribute("aria-label") && !input.hasAttribute("aria-labelledby")) {
      const label = doc.createElement("label")
      label.append(doc.createTextNode("Choose files "))
      input.before(label); label.append(input)
    }
    if (trigger && !trigger.querySelector("button,m-button")) {
      const button = doc.createElement("button"); button.type = "button"
      button.append(...trigger.childNodes)
      if (!button.textContent?.trim()) button.textContent = "Choose files"
      trigger.append(button)
    }
    if (dragger) { dragger.setAttribute("data-upload-drop", ""); dragger.hidden = true }
    const list = make("ul", "list"); list.hidden = true
    ;(fileList ?? fields).append(list)
    const controls = make("div", "actions"); controls.hidden = true
    const buttons = (parent: HTMLElement, actions: readonly string[]) => {
      for (const action of actions) {
        const button = doc.createElement("button")
        button.type = "button"; button.dataset.uploadAction = action
        button.textContent = action[0]!.toUpperCase() + action.slice(1)
        parent.append(button)
      }
    }
    buttons(controls, ["start", "cancel", "clear"])
    const template = make("template", "row"), row = doc.createElement("li")
    row.append(make("span", "name"), make("span", "size"), make("span", "status"), make("progress", "progress"))
    const actions = make("div", "row-actions")
    buttons(actions, ["start", "cancel", "retry", "remove"]); row.append(actions); template.content.append(row)
    this.#readout = make("p", "status")
    fields.append(controls, template, this.#readout)
  }

  readonly #trigger = (event: MouseEvent): void => {
    const target = event.target as Element
    const button = target.closest?.("button")
    if (!button || button.closest("m-upload") !== this || !button.closest("m-upload-trigger")
      || button.matches(":disabled") || button.getAttribute("aria-disabled") === "true") return
    queueMicrotask(() => { if (!event.defaultPrevented && this.contains(button)) this.openFileChooser() })
  }
}

/** Optional content mapped to a native chooser button. */
export class UploadTrigger extends ViewElement {
  public static readonly tag = "m-upload-trigger"
}
/** Passive flat-file drop region; selection belongs to Upload. */
export class UploadDragger extends ViewElement {
  public static readonly tag = "m-upload-dragger"
}
/** Authored content surrounding the renderer-owned native queue. */
export class UploadFileList extends ViewElement {
  public static readonly tag = "m-upload-file-list"
}
