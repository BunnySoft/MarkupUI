import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import { createTransfer, transferOptions } from "./transfer.js"
import type { TransferController, TransferOption, TransferSide, TransferState } from "./transfer.js"

export interface TransferChangeDetail {
  readonly value: readonly string[]
}
export interface TransferStageDetail {
  readonly side: TransferSide
  readonly selected: readonly string[]
}

/**
 * Target membership and native highlights are distinct; both use the existing Transfer owner.
 * @region {"name":"content","accepts":["content","native options","native Transfer fieldset"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"readonly string[]"}}
 * @event {"name":"Stage","web":"m:stage","bubbles":true,"cancelable":false,"composed":false,"detail":{"side":"TransferSide","selected":"readonly string[]"}}
 * @event {"name":"Error","web":"m:error","bubbles":true,"cancelable":false,"composed":false,"detail":{"error":"unknown"}}
 */
export class Transfer extends ViewElement {
  public static readonly tag = "m-transfer"
  public static readonly observedAttributes = ["source-title", "target-title", "disabled", "name", "required"]
  private controller: TransferController | undefined
  private root: HTMLFieldSetElement | undefined
  private initialized = false
  private data: readonly TransferOption[] = Object.freeze([])
  private suppliedData = false
  private projectedData: readonly TransferOption[] | undefined
  private pendingValue: readonly string[] | undefined
  private pendingDefaults: readonly string[] | undefined
  private retainedDefaults: readonly string[] = Object.freeze([])
  private readonly disabledWrites = ownedWrites()
  private readonly requiredWrites = ownedWrites()
  private readonly nameWrites = ownedWrites()

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "transfer"
    this.prepare()
    this.syncSettings()
    this.projectOptions()
    this.root!.addEventListener("m:transfer-change", this.onChange)
    this.root!.addEventListener("m:transfer-stage", this.onStage)
    this.root!.addEventListener("m:transfer-error", this.onError)
    if (this.controller) this.controller.connect()
    else this.controller = createTransfer(this.root!, {
      ...(this.pendingValue === undefined ? {} : { value: this.pendingValue }),
      ...(this.pendingDefaults === undefined ? {} : { defaultValue: this.pendingDefaults }),
    })
    if (this.pendingDefaults !== undefined) this.controller.setDefaultValue(this.pendingDefaults)
    if (this.pendingValue !== undefined) this.controller.setValue(this.pendingValue)
    this.pendingValue = this.pendingDefaults = undefined
  }

  public disconnectedCallback(): void {
    if (this.controller?.connected) this.retainedDefaults = this.controller.state.defaultValue
    this.controller?.disconnect()
    this.root?.removeEventListener("m:transfer-change", this.onChange)
    this.root?.removeEventListener("m:transfer-stage", this.onStage)
    this.root?.removeEventListener("m:transfer-error", this.onError)
    this.disabledWrites.restore()
    this.requiredWrites.restore()
    this.nameWrites.restore()
  }

  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || !this.initialized || !this.isConnected) return
    if (name === "name" && this.controller?.connected) {
      throw new Error("Disconnect Transfer before changing its membership field name.")
    }
    this.syncSettings()
    this.controller?.refresh()
  }

  public get sourceTitle(): string { return this.getAttribute("source-title") ?? "" }
  public set sourceTitle(value: string | null) { this.setStringAttribute("source-title", value) }
  public get targetTitle(): string { return this.getAttribute("target-title") ?? "" }
  public set targetTitle(value: string | null) { this.setStringAttribute("target-title", value) }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get required(): boolean { return this.hasAttribute("required") }
  public set required(value: boolean) { this.setBooleanAttribute("required", value) }
  /** Optional membership submission name, not a name for native staged selection. Change while disconnected. */
  public get name(): string | null { return this.getAttribute("name") }
  public set name(value: string | null) {
    if (value !== null && (typeof value !== "string" || !value || value.length > 128)) throw new TypeError("Invalid Transfer membership field name.")
    if (this.controller?.connected && value !== this.name) throw new Error("Disconnect Transfer before changing its membership field name.")
    this.setStringAttribute("name", value)
  }

  /** Property-only data; updates retain surviving native option identities and membership.
   * @default []
   */
  public get options(): readonly TransferOption[] { return this.data }
  public set options(value: readonly TransferOption[]) {
    const next = transferOptions(value)
    this.data = next
    this.suppliedData = true
    if (this.initialized && this.isConnected) {
      this.projectOptions()
      this.active.refresh()
    }
  }

  /** Ordered target membership, never the highlighted options. Programmatic writes are silent. */
  public get value(): readonly string[] {
    if (this.pendingValue !== undefined) return this.pendingValue
    if (this.controller?.connected) return this.controller.value
    return Object.freeze([...this.root?.querySelector<HTMLSelectElement>("select[data-transfer-target]")?.options ?? []].map(option => option.value))
  }
  public set value(value: readonly string[]) {
    const keys = this.keys(value)
    if (this.controller?.connected) this.controller.setValue(keys)
    else this.pendingValue = keys
  }

  /** Reset target, independent of native defaultSelected highlight flags.
   * @default []
   */
  public get defaultValue(): readonly string[] {
    return this.pendingDefaults ?? (this.controller?.connected ? this.controller.state.defaultValue : this.retainedDefaults)
  }
  public set defaultValue(value: readonly string[]) {
    const keys = this.keys(value)
    if (this.controller?.connected) this.controller.setDefaultValue(keys)
    else this.pendingDefaults = keys
  }
  /** Web interoperability: stable semantic owner; available after initial rendering. */
  public get native(): HTMLFieldSetElement | null { return this.root ?? null }
  /** Immutable live membership/staging/validation snapshot; requires connection. */
  public get state(): TransferState { return this.active.state }

  public moveToTarget(keys?: readonly string[]): number { return this.move("target", keys) }
  public moveToSource(keys?: readonly string[]): number { return this.move("source", keys) }
  public moveAllToTarget(): number { return this.move("target", undefined, true) }
  public moveAllToSource(): number { return this.move("source", undefined, true) }
  public selectAll(side: TransferSide): void { this.active.selectAll(side) }
  public clearSelection(side: TransferSide): void { this.active.clearSelection(side) }
  public setFilter(side: TransferSide, value: string): void { this.active.setFilter(side, value) }
  public appendTo(data: FormData, name?: string): number { return this.active.appendTo(data, name) }
  public reset(): void { this.active.reset() }
  public refresh(): void {
    if (!this.isConnected) throw new Error("Connect Transfer before refreshing.")
    this.prepare()
    this.syncSettings()
    this.projectOptions()
    this.active.refresh()
  }

  private get active(): TransferController {
    if (!this.controller?.connected) throw new Error("Transfer is not connected.")
    return this.controller
  }
  private keys(value: readonly string[]): readonly string[] {
    if (!Array.isArray(value) || value.length > 2000
      || [...value].some(key => typeof key !== "string" || !key || key.length > 256)
      || new Set(value).size !== value.length) throw new TypeError("Use unique nonempty Transfer keys.")
    return Object.freeze([...value])
  }
  private move(to: TransferSide, keys?: readonly string[], all = false): number {
    const controller = this.active
    if (controller.state.disabled) return 0
    const count = all ? controller.moveAll(to) : keys === undefined ? controller.moveSelected(to) : controller.move(keys, to)
    if (count) this.emit<TransferChangeDetail>("m:change", { value: controller.value })
    return count
  }
  private readonly onChange = (event: Event): void => {
    if (event.target !== this.root) return
    this.emit<TransferChangeDetail>("m:change", { value: this.active.value })
  }
  private readonly onStage = (event: Event): void => {
    if (event.target !== this.root) return
    const detail = (event as CustomEvent<TransferStageDetail>).detail
    this.emit<TransferStageDetail>("m:stage", { side: detail.side, selected: detail.selected })
  }
  private readonly onError = (event: Event): void => {
    if (event.target === this.root) this.emit("m:error", (event as CustomEvent<{ error: unknown }>).detail)
  }

  private prepare(): void {
    if (this.querySelectorAll(":scope > fieldset[data-transfer]").length > 1) throw new TypeError("Transfer accepts one native fieldset.")
    if (this.root?.parentElement === this) return
    if (this.controller) throw new Error("Transfer native owner was replaced; reconnect the original owner.")
    const roots = [...this.querySelectorAll<HTMLFieldSetElement>(":scope > fieldset[data-transfer]")]
    if (roots.length > 1) throw new TypeError("Transfer accepts one native fieldset.")
    if (roots[0]) {
      this.root = roots[0]
      return
    }
    const root = this.ownerDocument.createElement("fieldset")
    root.className = "m-transfer"
    root.dataset.transfer = ""
    root.dataset.part = "transfer"
    root.dataset.state = "generated"
    const legend = this.ownerDocument.createElement("legend")
    legend.textContent = "Transfer"
    const columns = this.ownerDocument.createElement("div")
    columns.dataset.transferColumns = ""
    const pane = (side: TransferSide, title: string) => {
      const container = this.ownerDocument.createElement("div")
      container.dataset.transferPane = ""
      const heading = this.ownerDocument.createElement("h3")
      heading.dataset.transferTitle = side
      heading.textContent = title
      const filterLabel = this.ownerDocument.createElement("label")
      filterLabel.append(`Filter ${side}`)
      const filter = this.ownerDocument.createElement("input")
      filter.type = "search"
      filter.dataset.transferFilter = side
      filterLabel.append(filter)
      const label = this.ownerDocument.createElement("label")
      const labelText = this.ownerDocument.createElement("span")
      labelText.dataset.transferTitle = side
      labelText.textContent = title
      label.append(labelText)
      const select = this.ownerDocument.createElement("select")
      select.multiple = true
      select.size = 6
      select.setAttribute(`data-transfer-${side}`, "")
      label.append(select)
      const count = this.ownerDocument.createElement("p")
      count.dataset.transferCount = side
      container.append(heading, filterLabel, label, count)
      return { container, select }
    }
    const source = pane("source", this.sourceTitle || "Source")
    const target = pane("target", this.targetTitle || "Target")
    const actions = this.ownerDocument.createElement("div")
    actions.dataset.transferActions = ""
    for (const [name, label] of [["add", "Move selected to target"], ["remove", "Move selected to source"],
      ["add-all", "Move all to target"], ["remove-all", "Move all to source"]]) {
      const button = this.ownerDocument.createElement("button")
      button.type = "button"
      button.dataset.transferAction = name
      button.textContent = label!
      button.hidden = true
      actions.append(button)
    }
    const options = [...this.children].filter((node): node is HTMLOptionElement => node instanceof HTMLOptionElement)
    source.select.append(...options)
    const status = this.ownerDocument.createElement("p")
    status.dataset.transferStatus = ""
    columns.append(source.container, actions, target.container)
    root.append(legend, columns, status)
    this.root = root
    this.append(root)
  }

  private projectOptions(): void {
    if (!this.suppliedData || this.projectedData === this.data) return
    const list = (side: TransferSide) => {
      const controls = [...this.root!.querySelectorAll<HTMLSelectElement>(`select[data-transfer-${side}]`)]
        .filter(control => control.closest("[data-transfer]") === this.root)
      if (controls.length !== 1) throw new TypeError("Transfer needs two owned native lists.")
      return controls[0]!
    }
    const source = list("source"), target = list("target")
    const existing = new Map([...source.options, ...target.options].map(option => [option.value, option]))
    const members = new Set(this.controller ? [...target.options].map(option => option.value) : this.pendingValue ?? this.pendingDefaults ?? [])
    const surviving = new Set(this.data.map(option => option.value))
    for (const option of existing.values()) if (!surviving.has(option.value)) option.remove()
    for (const item of this.data) {
      let option = existing.get(item.value)
      if (!option) {
        option = this.ownerDocument.createElement("option")
        option.value = item.value
        ;(members.has(item.value) ? target : source).append(option)
      }
      if (option.label !== item.label) {
        option.label = item.label
        option.textContent = item.label
      }
      option.disabled = item.disabled ?? false
    }
    this.projectedData = this.data
  }
  private syncSettings(): void {
    if (!this.root) return
    if (this.disabled) this.disabledWrites.attr(this.root, "disabled", "")
    else this.disabledWrites.restore()
    if (this.hasAttribute("required")) this.requiredWrites.attr(this.root, "data-transfer-required", "")
    else this.requiredWrites.restore()
    if (this.name !== null) this.nameWrites.attr(this.root, "data-transfer-name", this.name)
    else this.nameWrites.restore()
    for (const [side, title] of [["source", this.sourceTitle], ["target", this.targetTitle]]) {
      const text = title || (side === "source" ? "Source" : "Target")
      for (const heading of this.root.querySelectorAll<HTMLElement>(`[data-transfer-title="${side}"]`)) {
        if (heading.closest("[data-transfer]") === this.root && heading.textContent !== text) heading.textContent = text
      }
    }
  }
}
