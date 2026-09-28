import { ViewElement } from "../../core/index.js"
import type { Tree } from "./tree-element.js"
import { renderNode } from "./web.js"
import type { TreeParts } from "./web.js"

/** A portable outline node. Native list, disclosure and form controls are Web-owned. */
export class TreeNode extends ViewElement {
  public static readonly tag = "m-tree-node"
  public static get observedAttributes(): string[] {
    return ["value", "title", "disabled", "expanded", "checked", "selected", "name", "lazy", "href", "group"]
  }
  #upgraded = false
  #parts: TreeParts | undefined
  #owner: Tree | null = null

  public connectedCallback(): void {
    if (!this.#upgraded) { this.#upgraded = true; this.upgradeProperties() }
    this.#owner = this.#tree
    this.#owner?.refresh()
  }
  public disconnectedCallback(): void { this.#owner?.refresh(); this.#owner = null }
  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after) return
    const tree = this.#tree
    if (name === "checked" && this.#parts?.check) {
      this.#parts.check.defaultChecked = after !== null
      tree?.refresh()
    } else if (["expanded", "selected"].includes(name)) {
      if (name === "expanded") this.expanded = after !== null
      if (name === "selected") this.selected = after !== null
    } else {
      if (name === "lazy") this.#parts?.branch?.toggleAttribute("data-tree-lazy", after !== null)
      tree?.refresh()
    }
  }
  get #tree(): Tree | null {
    const tree = this.closest<Tree>("m-tree")
    return typeof tree?.refresh === "function" ? tree : null
  }
  public get value(): string { return this.getAttribute("value") ?? "" }
  public set value(value: string) { this.setStringAttribute("value", value) }
  public override get title(): string { return this.getAttribute("title") ?? "" }
  public override set title(value: string) { this.setStringAttribute("title", value) }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get lazy(): boolean { return this.hasAttribute("lazy") }
  public set lazy(value: boolean) { this.setBooleanAttribute("lazy", value) }
  public get group(): boolean { return this.hasAttribute("group") }
  public set group(value: boolean) { this.setBooleanAttribute("group", value) }
  public get href(): string | null { return this.getAttribute("href") }
  public set href(value: string | null) { this.setStringAttribute("href", value) }
  /** Literal native checkbox name; an empty name does not submit. */
  public get name(): string { return this.getAttribute("name") ?? "" }
  public set name(value: string) { this.setStringAttribute("name", value) }
  public get expanded(): boolean { return this.#parts?.branch?.open ?? this.hasAttribute("expanded") }
  public set expanded(value: boolean) {
    this.#flag(value)
    if (this.#tree?.connected) this.#tree.expandedKeys = this.#keys(this.#tree.expandedKeys, value)
    else { this.toggleAttribute("expanded", value); if (this.#parts?.branch) this.#parts.branch.open = value }
  }
  public get checked(): boolean { return this.#parts?.check?.checked ?? this.hasAttribute("checked") }
  /** Native reset default. The checked attribute configures this value, not dirty checkedness. */
  public get defaultChecked(): boolean { return this.#parts?.check?.defaultChecked ?? this.hasAttribute("checked") }
  public set defaultChecked(value: boolean) {
    this.#flag(value)
    if (this.#parts?.check) { this.#parts.check.defaultChecked = value; this.#tree?.refresh() }
    else this.setBooleanAttribute("checked", value)
  }
  public set checked(value: boolean) {
    this.#flag(value)
    if (this.#tree?.connected) this.#tree.check(this.value, value)
    else { this.toggleAttribute("checked", value); if (this.#parts?.check) this.#parts.check.checked = value }
  }
  public get selected(): boolean { return this.#parts?.label.getAttribute("aria-pressed") === "true" || !this.#parts && this.hasAttribute("selected") }
  public set selected(value: boolean) {
    this.#flag(value)
    if (this.#tree?.connected) this.#tree.selectedKeys = value && !this.#tree.multiple ? [this.value] : this.#keys(this.#tree.selectedKeys, value)
    else { this.toggleAttribute("selected", value); this.#parts?.label.setAttribute("aria-pressed", String(value)) }
  }
  public get indeterminate(): boolean { return this.#parts?.check?.indeterminate ?? false }
  public override focus(options?: FocusOptions): void {
    const parts = this.#parts
    const target = parts?.label.localName === "span" ? parts.branch?.firstElementChild as HTMLElement : parts?.label
    target?.focus(options)
  }
  #flag(value: boolean): void { if (typeof value !== "boolean") throw new TypeError("Tree node flags must be boolean.") }
  #keys(keys: readonly string[], include: boolean): string[] { return [...keys.filter(key => key !== this.value), ...include ? [this.value] : []] }

  /** @internal Web renderer; never owns selection, cascading or event handling. */
  public render(tree: Tree): HTMLLIElement {
    if (!this.#upgraded) { this.#upgraded = true; this.upgradeProperties() }
    const children = [...this.children].filter(node => node.localName === "m-tree-node") as TreeNode[]
    const content = [...this.childNodes].filter(node => node !== this.#parts?.row && node !== this.#parts?.branch
      && !(node instanceof this.ownerDocument.defaultView!.Element && ["m-tree-node", "li", "m-tree"].includes(node.localName))
      && (node.nodeType !== 3 || !!node.textContent?.trim()))
    const first = !this.#parts
    this.#parts = renderNode(this.ownerDocument, {
      value: this.value, title: this.title || this.value, name: this.name, disabled: this.disabled,
      href: this.href, group: this.group,
      checked: this.hasAttribute("checked"), expanded: this.expanded, lazy: this.lazy,
      ...(children.length ? { children: [] } : {}),
    }, tree, this.#parts, this)
    this.#parts.item.dataset.treeHost = ""
    if (first && this.hasAttribute("selected") && this.#parts.label.hasAttribute("data-tree-select")) this.#parts.label.setAttribute("aria-pressed", "true")
    if (content.length) {
      if (!this.#parts.authored) this.#parts.label.replaceChildren()
      this.#parts.label.append(...content); this.#parts.authored = true
    }
    for (const child of children) this.#parts.branch!.lastElementChild!.append(child)
    return this.#parts.item
  }
}
