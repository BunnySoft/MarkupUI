import type { TreeItem } from "./tree-element.js"

export interface TreeParts {
  item: HTMLLIElement
  row: HTMLDivElement
  label: HTMLElement
  check?: HTMLInputElement
  branch?: HTMLDetailsElement
  authored?: boolean
}

/** One Web anatomy for authored nodes and loaded data. Existing live state stays native. */
export function renderNode(doc: Document, data: TreeItem, settings: { selectable: boolean; checkable: boolean; disabled: boolean }, parts?: TreeParts, host?: HTMLElement): TreeParts {
  if (!parts) {
    const item = doc.createElement("li"), row = doc.createElement("div"), label = doc.createElement("span")
    row.dataset.treeRow = ""; row.append(label); (host ?? item).prepend(row)
    parts = { item, row, label }
  }
  const { item, row } = parts, container = host ?? item
  item.dataset.treeKey = data.value; item.toggleAttribute("data-tree-disabled", !!data.disabled)
  item.toggleAttribute("data-tree-group", !!data.group)
  const tag = data.href != null ? "a" : settings.selectable && !data.group ? "button" : "span"
  if (parts.label.localName !== tag) {
    const label = doc.createElement(tag)
    if (tag === "button") {
      (label as HTMLButtonElement).type = "button"; label.dataset.treeSelect = ""
      label.setAttribute("aria-pressed", parts.label.getAttribute("aria-pressed") ?? "false")
    }
    label.append(...parts.label.childNodes); parts.label.replaceWith(label); parts.label = label
  }
  parts.label.dataset.treeLabel = ""
  if (data.href != null) {
    if (!["http:", "https:", "mailto:", "tel:"].includes(new URL(data.href, doc.baseURI).protocol)) throw new TypeError("Unsafe Tree link.")
    parts.label.setAttribute("href", data.href)
  }
  if (!parts.authored && parts.label.textContent !== data.title) parts.label.textContent = data.title
  if (settings.checkable && !parts.check) {
    const wrapper = doc.createElement("label"), check = doc.createElement("input")
    check.type = "checkbox"; check.dataset.treeCheck = ""; check.defaultChecked = !!data.checked
    wrapper.append(check, doc.createElement("span")); row.prepend(wrapper); parts.check = check
  }
  if (parts.check) {
    const wrapper = parts.check.parentElement!
    if (!settings.checkable) wrapper.remove()
    else if (wrapper.parentElement !== row) row.prepend(wrapper)
    parts.check.name = data.name ?? ""; parts.check.value = data.value
    parts.check.disabled = !!data.disabled || settings.disabled
    const text = `Include ${data.title}`
    if (parts.check.nextSibling!.textContent !== text) parts.check.nextSibling!.textContent = text
  }
  if ((data.children || data.lazy) && !parts.branch) {
    const branch = doc.createElement("details"), summary = doc.createElement("summary"), list = doc.createElement("ul")
    branch.dataset.treeBranch = ""; branch.toggleAttribute("data-tree-lazy", !!data.lazy); branch.open = !!data.expanded
    list.dataset.treeList = ""; branch.append(summary, list); container.append(branch); parts.branch = branch
  }
  if (parts.branch) {
    const text = `Contents ${data.title}`
    if (parts.branch.firstElementChild!.textContent !== text) parts.branch.firstElementChild!.textContent = text
  }
  return parts
}
