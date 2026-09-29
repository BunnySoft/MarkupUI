import type { BindingScope } from "./scope.js"

const references = ["aria-labelledby", "aria-describedby", "aria-controls", "aria-owns", "aria-flowto",
  "aria-details", "aria-errormessage", "aria-activedescendant"] as const
const single = new Set(["for", "aria-activedescendant", "aria-details", "aria-errormessage"])
const labelable = "button,input:not([type=hidden]),meter,output,progress,select,textarea"
const bindingNames = new Set(["data-bind-id", "data-bind-attr-id", "data-bind-html-for",
  "data-bind-attr-for", ...references.map(attribute => `data-bind-attr-${attribute}`)])
export const isIdBinding = (name: string): boolean => bindingNames.has(name)

function tokens(value: unknown, attribute: string): string[] {
  if (attribute !== "id" && value == null) return []
  if (typeof value !== "string" || !value.trim()) throw new TypeError("Bound IDs and ID references require nonempty strings.")
  const result = value.split(/[ \t\n\r\f]+/).filter(Boolean)
  if ((attribute === "id" || single.has(attribute)) && (result.length !== 1 || value !== result[0])
    || result.some(id => /\s/.test(id)) || new Set(result).size !== result.length) {
    throw new TypeError("Invalid bound ID or ID reference list.")
  }
  return result
}

/** Validate explicit ID relationships against the next tree, without rewriting application IDs. */
export class BindingIds {
  private readonly rendered = new Set<Element>()
  private readonly replaced = new Set<Element>()
  private readonly ids = new Map<Element, string>()
  private readonly links: Array<{ element: Element; attribute: string; ids: string[] }> = []

  public constructor(private readonly root: Node & ParentNode) {}

  public get active(): boolean { return this.ids.size > 0 || this.links.length > 0 }

  public replaceContent(element: Element): void { this.replaced.add(element) }

  public visit(element: Element, scope: BindingScope): void {
    this.rendered.add(element)
    if (![...element.attributes].some(attribute => isIdBinding(attribute.name))) return
    const id = element.getAttribute("data-bind-id") ?? element.getAttribute("data-bind-attr-id")
    if (id !== null) this.ids.set(element, tokens(scope.read(id), "id")[0]!)
    for (const attribute of ["for", ...references]) {
      const path = attribute === "for"
        ? element.getAttribute("data-bind-html-for") ?? element.getAttribute("data-bind-attr-for")
        : element.getAttribute(`data-bind-attr-${attribute}`)
      if (path !== null) this.links.push({ element, attribute, ids: tokens(scope.read(path), attribute) })
    }
  }

  public validate(removed: ReadonlySet<Element>): void {
    if (!this.active) return
    const tree = this.root.getRootNode() as Node & ParentNode
    const candidates = new Set([...tree.querySelectorAll("[id]"), ...this.rendered])
    if (tree instanceof Element) candidates.add(tree)
    const surviving = (element: Element) => {
      for (let node: Element | null = element; node; node = node.parentElement) {
        if (removed.has(node) || node !== element && this.replaced.has(node)) return false
      }
      return true
    }
    const index = new Map<string, Element[]>()
    for (const element of candidates) {
      if (!surviving(element)) continue
      const id = this.ids.get(element) ?? element.getAttribute("id")
      if (id) index.set(id, [...index.get(id) ?? [], element])
    }
    for (const [element, id] of this.ids) {
      if (!surviving(element) || index.get(id)?.length !== 1) throw new TypeError(`Bound ID is not unique in the DOM tree: ${id}`)
    }
    for (const { element, attribute, ids } of this.links) for (const id of ids) {
      const targets = index.get(id) ?? []
      const target = targets[0]
      if (targets.length !== 1 || !target || !this.rendered.has(target)) {
        throw new TypeError(`Bound ID reference requires one surviving target inside the binding root: ${id}`)
      }
      if (attribute === "for") {
        const native = element.localName === "m-label" && "native" in target ? target.native : target
        if (!element.matches("label,m-label") || native != null && (!(native instanceof Element) || !native.matches(labelable))) {
          throw new TypeError("Bound label references require an eligible native control or a portable field.")
        }
      }
    }
  }
}
