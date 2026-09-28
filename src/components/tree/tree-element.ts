import { ViewElement } from "../../core/index.js"
import { TreeNode } from "./tree-node.js"
import { createTree, validateTreeKeys } from "./tree.js"
import type { TreeBehavior, TreeCheckStrategy, TreeController, TreeData, TreeOptions } from "./tree.js"
import type { TreeNode as HierarchyNode } from "./hierarchy.js"
import { renderNode } from "./web.js"
import type { TreeParts } from "./web.js"

export interface TreeItem {
  value: string
  title: string
  children?: readonly TreeItem[]
  disabled?: boolean
  checked?: boolean
  expanded?: boolean
  lazy?: boolean
  name?: string
  href?: string | null
  group?: boolean
}
export interface TreeLoadResult { nodes: readonly TreeItem[]; dispose?: () => void }
export type TreeLoader = (node: HierarchyNode, context: { signal: AbortSignal }) => TreeLoadResult | Promise<TreeLoadResult>

/**
 * Portable nodes backed by one native outline controller.
 * @region {"name":"nodes","accepts":["TreeNode"],"min":0,"max":null}
 * @event {"name":"Select","web":"m:tree-select","bubbles":true,"cancelable":false,"composed":false,"detail":{"key":"string","selectedKeys":"readonly string[]"}}
 * @event {"name":"Check","web":"m:tree-check","bubbles":true,"cancelable":false,"composed":false,"detail":{"key":"string","keys":"readonly string[]","indeterminateKeys":"readonly string[]"}}
 * @event {"name":"Expand","web":"m:tree-expand","bubbles":true,"cancelable":false,"composed":false,"detail":{"key":"string","expandedKeys":"readonly string[]"}}
 * @event {"name":"Load","web":"m:tree-load","bubbles":true,"cancelable":false,"composed":false,"detail":{"key":"string"}}
 * @event {"name":"Error","web":"m:tree-error","bubbles":true,"cancelable":false,"composed":false,"detail":{"error":"unknown"}}
 */
export class Tree extends ViewElement {
  public static readonly tag = "m-tree"
  public static get observedAttributes(): string[] {
    return ["checkable", "selectable", "cascade", "multiple", "cancelable", "check-strategy", "block-line", "disabled", "aria-label", "aria-labelledby"]
  }
  #controller: TreeController<TreeLoadResult> | undefined
  #root: HTMLElement | undefined
  #upgraded = false
  #rendering = false
  #options: TreeOptions<TreeLoadResult> = {}
  #loader: TreeLoader | undefined
  #loaded = new Map<HTMLLIElement, { data: TreeItem; parts: TreeParts }>()

  public connectedCallback(): void {
    if (!this.#upgraded) { this.#upgraded = true; this.upgradeProperties() }
    if (!this.#root) {
      this.#root = this.ownerDocument.createElement("section")
      this.#root.className = "m-tree"; this.#root.dataset.tree = ""
      const list = this.ownerDocument.createElement("ul"); list.dataset.treeList = ""
      this.#root.append(list); this.append(this.#root)
    }
    this.#render()
    this.#controller = createTree(this.#root, { defaultExpandAll: !this.#controller && this.defaultExpandAll, ...this.#options, ...this.#behavior() },
      () => this.#render(), this, result => this.#renderItems(result))
    this.#options = {}
  }
  public disconnectedCallback(): void {
    this.#controller?.disconnect()
  }
  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || this.#rendering || !this.connected) return
    try { this.#controller!.configure(this.#behavior()) }
    catch (error) {
      this.#rendering = true
      try { this.setStringAttribute(name, before) } finally { this.#rendering = false }
      throw error
    }
  }
  public get checkable(): boolean { return this.hasAttribute("checkable") }
  public set checkable(value: boolean) { this.setBooleanAttribute("checkable", value) }
  public get selectable(): boolean { return this.hasAttribute("selectable") }
  public set selectable(value: boolean) { this.setBooleanAttribute("selectable", value) }
  public get cascade(): boolean { return this.hasAttribute("cascade") }
  public set cascade(value: boolean) { this.setBooleanAttribute("cascade", value) }
  public get multiple(): boolean { return this.hasAttribute("multiple") }
  public set multiple(value: boolean) {
    if (!value && this.selectedKeys.length > 1) throw new RangeError("Clear multiple selections first.")
    this.setBooleanAttribute("multiple", value)
  }
  public get cancelable(): boolean { return this.booleanAttribute("cancelable", true) }
  public set cancelable(value: boolean) { this.setBooleanAttribute("cancelable", value, false) }
  public get checkStrategy(): TreeCheckStrategy { return this.choiceAttribute("check-strategy", ["all", "parent", "child"], "all") }
  public set checkStrategy(value: TreeCheckStrategy) { this.setChoiceAttribute("check-strategy", value, ["all", "parent", "child"]) }
  public get blockLine(): boolean { return this.hasAttribute("block-line") }
  public set blockLine(value: boolean) { this.setBooleanAttribute("block-line", value) }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  /** Initial expansion of loaded, enabled branches; later writes do not change live disclosure. */
  public get defaultExpandAll(): boolean { return this.hasAttribute("default-expand-all") }
  public set defaultExpandAll(value: boolean) { this.setBooleanAttribute("default-expand-all", value) }
  public get selectedKeys(): readonly string[] { return this.connected ? this.#controller!.selectedKeys : this.#options.selectedKeys ?? [] }
  public set selectedKeys(keys: readonly string[]) { validateTreeKeys(keys); if (this.connected) this.#controller!.setSelectedKeys(keys); else this.#options.selectedKeys = [...keys] }
  public get checkedKeys(): readonly string[] { return this.connected ? this.getCheckedData().keys : this.#options.checkedKeys ?? [] }
  public set checkedKeys(keys: readonly string[]) { validateTreeKeys(keys); if (this.connected) this.#controller!.setCheckedKeys(keys); else this.#options.checkedKeys = [...keys] }
  public get expandedKeys(): readonly string[] { return this.connected ? this.#controller!.expandedKeys : this.#options.expandedKeys ?? [] }
  public set expandedKeys(keys: readonly string[]) { validateTreeKeys(keys); if (this.connected) this.#controller!.setExpandedKeys(keys); else this.#options.expandedKeys = [...keys] }
  public get load(): TreeLoader | undefined { return this.#loader }
  public set load(value: TreeLoader | undefined) {
    if (value !== undefined && typeof value !== "function") throw new TypeError("Tree load must be a function.")
    this.#loader = value
    if (this.connected) this.#controller!.configure(this.#behavior())
  }
  public get connected(): boolean { return this.#controller?.connected ?? false }
  public get error(): unknown { return this.#controller?.error ?? null }
  /** Web descriptors with the actual native owners. */
  public get nodes(): readonly HierarchyNode[] { return this.#controller?.nodes ?? [] }
  public get loadingKeys(): readonly string[] { return this.#controller?.loadingKeys ?? [] }
  public getCheckedData(strategy?: TreeCheckStrategy): TreeData { return this.#requireController().getCheckedData(strategy) }
  public getIndeterminateData(): TreeData { return this.#requireController().getIndeterminateData() }
  public expand(key: string): Promise<boolean> { return this.#requireController().expand(key) }
  public reveal(key: string): void { this.#requireController().reveal(key) }
  /** Set one node's check state, including its enabled descendants when cascading. */
  public check(key: string, value: boolean): void { this.#requireController().setNodeChecked(key, value) }
  public refresh(): void { if (this.connected && !this.#rendering) this.#controller!.sync() }
  public override focus(options?: FocusOptions): void { this.#requireController().focus(options) }
  #requireController(): TreeController<TreeLoadResult> { if (!this.connected) throw new Error("Tree is disconnected."); return this.#controller! }
  #behavior(): TreeBehavior<TreeLoadResult> {
    return { multiple: this.multiple, cascade: this.cascade, cancelable: this.cancelable, checkStrategy: this.checkStrategy,
      load: this.#loader }
  }
  #render(): void {
    if (this.#rendering) return
    this.#rendering = true
    try {
      const root = this.#root!
      root.setAttribute("aria-label", this.getAttribute("aria-label") ?? "Tree")
      const labelledby = this.getAttribute("aria-labelledby")
      if (labelledby === null) root.removeAttribute("aria-labelledby"); else root.setAttribute("aria-labelledby", labelledby)
      root.toggleAttribute("data-tree-block-labels", this.blockLine)
      root.toggleAttribute("data-tree-disabled", this.disabled)
      for (const child of [...this.children]) if (child.localName === "m-tree-node") root.firstElementChild!.append(child)
      for (const item of root.querySelectorAll("[data-tree-host]:empty")) if (item.closest("[data-tree]") === root) item.remove()
      const hosts = [...this.querySelectorAll<TreeNode>("m-tree-node")].filter(host => host.closest("m-tree") === this)
      if (hosts.length > 2000) throw new RangeError("Tree supports at most 2000 nodes.")
      for (const host of hosts) {
        const item = host.render(this)
        if (host.parentElement !== item) { host.replaceWith(item); item.append(host) }
      }
      for (const { data, parts } of this.#loaded.values()) renderNode(this.ownerDocument, data, this, parts)
    } finally { this.#rendering = false }
  }
  #renderItems(result: TreeLoadResult) {
    let count = 0
    const entries: TreeParts[] = []
    const dispose = () => {
      for (const parts of entries) this.#loaded.delete(parts.item)
      return result?.dispose?.()
    }
    const render = (items: readonly TreeItem[], depth: number): HTMLLIElement[] => {
      if (!Array.isArray(items) || depth > 64) throw new TypeError("Load returns a bounded TreeItem array.")
      return [...items].map(item => {
        if (++count > 200 || !item || typeof item.value !== "string" || !item.value || typeof item.title !== "string" || !item.title.trim()) throw new TypeError("Loaded items require value/title, at most 200 nodes.")
        if (["disabled", "checked", "expanded", "lazy", "group"].some(key => {
          const value = item[key as keyof TreeItem]; return value !== undefined && typeof value !== "boolean"
        }) || item.name !== undefined && typeof item.name !== "string"
          || item.href != null && typeof item.href !== "string") throw new TypeError("Invalid loaded node properties.")
        const data = { ...item }, parts = renderNode(this.ownerDocument, data, this)
        entries.push(parts); this.#loaded.set(parts.item, { data, parts })
        if (parts.branch) parts.branch.lastElementChild!.append(...render(item.children ?? [], depth + 1))
        return parts.item
      })
    }
    try {
      if (result?.dispose !== undefined && typeof result.dispose !== "function") throw new TypeError("Dispose must be synchronous.")
      return { nodes: render(result.nodes, 1), dispose }
    } catch (error) {
      for (const parts of entries) this.#loaded.delete(parts.item)
      throw error
    }
  }
}

export function registerTree(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([TreeNode, Tree], registry)
}
if (typeof customElements !== "undefined") registerTree()
