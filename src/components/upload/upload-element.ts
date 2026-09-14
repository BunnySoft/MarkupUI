import { ViewElement } from "../../core/index.js"

export interface UploadChangeDetail {
  readonly fileList: readonly File[]
}

/**
 * File upload component supporting file triggers, drag and drop, and file list display.
 * @region {"name":"trigger","element":"m-upload-trigger","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"dragger","element":"m-upload-dragger","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"fileList","element":"m-upload-file-list","accepts":["content","items"],"min":0,"max":1}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"fileList":"Array"}}
 */
export class Upload extends ViewElement {
  public static readonly tag = "m-upload"
  public static readonly observedAttributes = ["action", "accept", "multiple", "disabled", "name", "directory"]

  private upgraded = false
  private createdInput = false
  private inputElement: HTMLInputElement | null = null
  private filesList: File[] = []

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-upload")
    this.dataset.part = "upload"
    this.ensureInput()
    this.syncInputAttributes()
  }

  public disconnectedCallback(): void {
    if (this.inputElement) {
      this.inputElement.removeEventListener("change", this.handleInputChange)
    }
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    this.syncInputAttributes()
  }

  public get action(): string {
    return this.getAttribute("action") ?? ""
  }
  public set action(value: string) {
    this.setStringAttribute("action", value)
  }

  public get accept(): string {
    return this.getAttribute("accept") ?? ""
  }
  public set accept(value: string) {
    this.setStringAttribute("accept", value)
  }

  public get multiple(): boolean {
    return this.hasAttribute("multiple")
  }
  public set multiple(value: boolean) {
    this.setBooleanAttribute("multiple", value)
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
  }

  public get name(): string {
    return this.getAttribute("name") ?? ""
  }
  public set name(value: string) {
    this.setStringAttribute("name", value)
  }

  public get directory(): boolean {
    return this.hasAttribute("directory")
  }
  public set directory(value: boolean) {
    this.setBooleanAttribute("directory", value)
  }

  public get fileList(): readonly File[] {
    return Object.freeze([...this.filesList])
  }

  public get files(): readonly File[] {
    return Object.freeze([...this.filesList])
  }

  public openFileChooser(): void {
    if (this.disabled) return
    const input = this.ensureInput()
    input.click()
  }

  public handleDroppedFiles(files: FileList | readonly File[]): void {
    if (this.disabled) return
    const fileArray = Array.from(files)
    if (!this.multiple && fileArray.length > 1) {
      fileArray.length = 1
    }
    const input = this.ensureInput()
    try {
      if (typeof DataTransfer !== "undefined") {
        const transfer = new DataTransfer()
        fileArray.forEach(f => transfer.items.add(f))
        input.files = transfer.files
      }
    } catch {
      // DataTransfer may be unsupported in non-browser environments
    }
    this.filesList = fileArray
    this.updateFileListElement()
    this.emit<UploadChangeDetail>("m:change", { fileList: fileArray })
  }

  public clear(): void {
    if (this.inputElement) {
      this.inputElement.value = ""
    }
    this.filesList = []
    this.updateFileListElement()
  }

  private ensureInput(): HTMLInputElement {
    if (this.inputElement && this.contains(this.inputElement)) return this.inputElement
    let input = this.querySelector<HTMLInputElement>("input[type='file']")
    if (!input) {
      input = this.ownerDocument.createElement("input")
      input.type = "file"
      input.tabIndex = -1
      input.style.position = "absolute"
      input.style.width = "0"
      input.style.height = "0"
      input.style.opacity = "0"
      input.style.overflow = "hidden"
      input.style.pointerEvents = "none"
      input.dataset.part = "input"
      this.append(input)
      this.createdInput = true
    }
    this.inputElement = input
    input.addEventListener("change", this.handleInputChange)
    return input
  }

  private syncInputAttributes(): void {
    const input = this.inputElement ?? this.ensureInput()
    if (this.hasAttribute("accept")) {
      input.accept = this.accept
    } else if (this.createdInput) {
      input.removeAttribute("accept")
    }
    if (this.hasAttribute("multiple")) {
      input.multiple = this.multiple
    } else if (this.createdInput) {
      input.multiple = false
    }
    if (this.hasAttribute("disabled")) {
      input.disabled = this.disabled
    } else if (this.createdInput) {
      input.disabled = false
    }
    if (this.hasAttribute("name")) {
      input.name = this.name
    } else if (this.createdInput) {
      input.removeAttribute("name")
    }
    if (this.directory) {
      input.setAttribute("webkitdirectory", "")
      input.setAttribute("directory", "")
    } else if (this.createdInput) {
      input.removeAttribute("webkitdirectory")
      input.removeAttribute("directory")
    }
  }

  private readonly handleInputChange = (): void => {
    const files = this.inputElement?.files ? Array.from(this.inputElement.files) : []
    this.filesList = files
    this.updateFileListElement()
    this.emit<UploadChangeDetail>("m:change", { fileList: files })
  }

  private updateFileListElement(): void {
    const list = this.querySelector<UploadFileList>("m-upload-file-list")
    if (list) {
      list.renderFiles(this.filesList)
    }
  }
}

/**
 * Trigger area that opens the file chooser.
 * @region {"name":"action","accepts":["controls","content","button"],"min":0,"max":null}
 */
export class UploadTrigger extends ViewElement {
  public static readonly tag = "m-upload-trigger"
  public static readonly observedAttributes: string[] = []

  public connectedCallback(): void {
    this.upgradeProperties()
    this.dataset.part = "trigger"
    this.addEventListener("click", this.handleClick)
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.handleClick)
  }

  private readonly handleClick = (event: MouseEvent): void => {
    const upload = this.closest<Upload>("m-upload")
    if (!upload || upload.disabled) return
    if (event.target instanceof HTMLInputElement && event.target.type === "file") return
    upload.openFileChooser()
  }
}

/**
 * Drag and drop area for file upload.
 * @region {"name":"content","accepts":["content","text","controls"],"min":0,"max":null}
 */
export class UploadDragger extends ViewElement {
  public static readonly tag = "m-upload-dragger"
  public static readonly observedAttributes: string[] = []

  public connectedCallback(): void {
    this.upgradeProperties()
    this.dataset.part = "dragger"
    this.addEventListener("click", this.handleClick)
    this.addEventListener("dragover", this.handleDragOver)
    this.addEventListener("dragleave", this.handleDragLeave)
    this.addEventListener("drop", this.handleDrop)
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.handleClick)
    this.removeEventListener("dragover", this.handleDragOver)
    this.removeEventListener("dragleave", this.handleDragLeave)
    this.removeEventListener("drop", this.handleDrop)
  }

  private readonly handleClick = (event: MouseEvent): void => {
    const upload = this.closest<Upload>("m-upload")
    if (!upload || upload.disabled) return
    if (event.target instanceof HTMLInputElement && event.target.type === "file") return
    upload.openFileChooser()
  }

  private readonly handleDragOver = (event: DragEvent): void => {
    event.preventDefault()
    const upload = this.closest<Upload>("m-upload")
    if (upload?.disabled) return
    this.dataset.dragover = "true"
  }

  private readonly handleDragLeave = (_event: DragEvent): void => {
    delete this.dataset.dragover
  }

  private readonly handleDrop = (event: DragEvent): void => {
    event.preventDefault()
    delete this.dataset.dragover
    const upload = this.closest<Upload>("m-upload")
    if (!upload || upload.disabled) return
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      upload.handleDroppedFiles(files)
    }
  }
}

/**
 * Container displaying the list of selected files.
 * @region {"name":"items","accepts":["content","items"],"min":0,"max":null}
 */
export class UploadFileList extends ViewElement {
  public static readonly tag = "m-upload-file-list"
  public static readonly observedAttributes: string[] = []

  public connectedCallback(): void {
    this.upgradeProperties()
    this.dataset.part = "file-list"
    const upload = this.closest<Upload>("m-upload")
    if (upload) {
      this.renderFiles(upload.fileList)
    }
  }

  public renderFiles(files: readonly File[]): void {
    this.replaceChildren(
      ...files.map(file => {
        const item = this.ownerDocument.createElement("div")
        item.dataset.part = "file-item"
        item.textContent = `${file.name} (${file.size} bytes)`
        return item
      })
    )
  }
}
