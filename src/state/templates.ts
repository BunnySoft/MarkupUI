import type { MStore } from "./index.js"
import { BindingScope, type ItemKey } from "./scope.js"
import { pathParts } from "./path.js"
import type { ListTemplate } from "../components/list/template.js"
import type { If } from "../components/box/if.js"
import { BindingIds } from "./ids.js"

export interface BindingOptions {
  /** Web-only inert sources, explicitly supplied by name; #id references stay root-local. */
  templates?: ReadonlyMap<string, HTMLTemplateElement>
  /** Web-only, side-effect-free policy for removing the currently focused instance. */
  focusFallback?(context: { active: Element; removed: readonly Element[] }): HTMLElement
}

interface Instance { element: Element }
interface Region {
  signature: string
  instances: Map<ItemKey, Instance>
  parent: Node
  portable?: ListTemplate | If | undefined
}
interface Plan { source: HTMLTemplateElement; region: Region }

// Retain DOM identity across stop/rebind without retaining stores or active scopes.
const retained = new WeakMap<Node, Map<HTMLTemplateElement, Region>>()
const owners = new WeakMap<Element, { root: Node; source: HTMLTemplateElement }>()
const members = new WeakMap<Element, { root: Node; instance: Element }>()
const structural = (element: Element) => element.hasAttribute("data-if") || element.hasAttribute("data-each")
const list = (element: Element): element is ListTemplate => element.localName === "m-list-template"
const portable = (element: Element): element is ListTemplate | If => list(element) || element.localName === "m-if"

function portableSource(element: ListTemplate | If): HTMLTemplateElement {
  if (list(element) && (!element.hasAttribute("data-each") || element.hasAttribute("data-if"))) {
    throw new TypeError("ListTemplate requires data-each and does not accept data-if.")
  }
  if (!list(element) && (!element.hasAttribute("data-if") || element.hasAttribute("data-each") || element.hasAttribute("data-each-key"))) {
    throw new TypeError("If requires data-if and does not accept data-each or data-each-key.")
  }
  pathParts(element.getAttribute(list(element) ? "data-each" : "data-if")!)
  if (list(element)) pathParts(element.getAttribute("data-each-key") ?? "")
  else if (element.focusTarget !== null && (!element.focusTarget || /\s/.test(element.focusTarget))) {
    throw new TypeError("focus-target requires one nonempty ID.")
  }
  if ([...element.attributes].some(attr => /^(data-bind-|data-model-)/.test(attr.name))) {
    throw new TypeError("A structural source cannot also have scalar bindings.")
  }
  if (!("native" in element)) throw new TypeError("Register the selected List or Box family before binding.")
  return element.native
}

function portableProbe(element: Element, document: Document): ListTemplate | If {
  const parent = document.createElement(list(element) ? "m-list" : "div")
  const probe = document.importNode(element, true) as ListTemplate | If
  parent.append(probe)
  document.defaultView?.customElements.upgrade(parent)
  return probe
}

function shape(source: HTMLTemplateElement): Element {
  if (source.content.children.length !== 1 || [...source.content.childNodes]
    .some(node => node.nodeType !== Node.COMMENT_NODE && node.nodeType !== Node.ELEMENT_NODE && node.textContent?.trim())) {
    throw new TypeError("Structural templates require one element root.")
  }
  const element = source.content.firstElementChild!
  if (element instanceof HTMLTemplateElement) throw new TypeError("An instance root cannot itself be a template.")
  return element
}

function syntax(element: Element): void {
  if (!structural(element)) {
    if (element.hasAttribute("data-each-key")) throw new TypeError("data-each-key requires data-each.")
    if (element.hasAttribute("data-template")) throw new TypeError("data-template requires a structural source.")
    return
  }
  if (!(element instanceof HTMLTemplateElement)) throw new TypeError("Structural directives require a Web template.")
  if (element.hasAttribute("data-if") === element.hasAttribute("data-each")) throw new TypeError("Use one structural directive per template.")
  pathParts(element.getAttribute("data-if") ?? element.getAttribute("data-each")!)
  if (element.hasAttribute("data-each")) pathParts(element.getAttribute("data-each-key") ?? "")
  else if (element.hasAttribute("data-each-key")) throw new TypeError("data-each-key requires data-each.")
  if ([...element.attributes].some(attr => /^(data-bind-|data-model-)/.test(attr.name))) {
    throw new TypeError("A structural source cannot also have scalar bindings.")
  }
}

const hasContent = (parent: ParentNode) => [...parent.childNodes].some(node =>
  node.nodeType === Node.ELEMENT_NODE || node.nodeType !== Node.COMMENT_NODE && node.textContent?.trim())

/** Resolve only explicit sources; never search the document or generated instance IDs. */
function sourceResolver(root: Node & ParentNode, options: BindingOptions) {
  let references = 0
  const ids = new Map<string, Element[]>()
  for (const element of [...(root instanceof Element && root.hasAttribute("id") ? [root] : []), ...root.querySelectorAll("[id]")]) {
    let generated = false
    for (let node: Element | null = element; node; node = node.parentElement) {
      if (owners.has(node) || members.has(node)) { generated = true; break }
      if (node === root) break
    }
    if (!generated) ids.set(element.id, [...ids.get(element.id) ?? [], element])
  }
  const definition = (reference: string): HTMLTemplateElement => {
    if (!reference || /\s/.test(reference)) throw new TypeError("Template references require a nonempty ID or name.")
    let source: unknown
    if (reference.startsWith("#")) {
      const matches = ids.get(reference.slice(1)) ?? []
      if (matches.length !== 1) throw new TypeError("Template ID must resolve uniquely inside the binding root.")
      source = matches[0]
    } else source = options.templates?.get(reference)
    if (!(source instanceof HTMLTemplateElement) || structural(source) || source.hasAttribute("data-template")
      || [...source.attributes].some(attr => /^(data-bind-|data-model-|data-each-key$)/.test(attr.name))) {
      throw new TypeError("Template references require an inert HTMLTemplateElement definition.")
    }
    return source
  }
  const expand = (source: HTMLTemplateElement, placement: Element = source, chain: HTMLTemplateElement[] = []): HTMLTemplateElement => {
    const copy = source.cloneNode(true) as HTMLTemplateElement
    const reference = placement.getAttribute("data-template")
    if (reference !== null) {
      const target = list(placement) ? copy.content.firstElementChild! : copy.content
      if (hasContent(target)) throw new TypeError("A referenced template cannot also have inline content.")
      const origin = definition(reference)
      if (chain.includes(origin) || chain.length >= 32) throw new TypeError("Template reference cycle or depth exceeds 32.")
      if (++references > 1000) throw new TypeError("Template source expansion exceeds 1,000 references.")
      const resolved = expand(origin, origin, [...chain, origin])
      shape(resolved)
      if (list(placement) && resolved.content.firstElementChild?.localName !== "m-list-item") {
        throw new TypeError("ListTemplate requires exactly one ListItem root.")
      }
      target.replaceChildren(resolved.content)
      copy.removeAttribute("data-template")
      return copy
    }
    const visit = (parent: ParentNode) => {
      for (const element of parent.children) {
        if (portable(element)) {
          // Use the binding document's registry, not the inert template document.
          const document = root instanceof Document ? root : root.ownerDocument!
          const probe = portableProbe(element, document)
          const native = portableSource(probe)
          const resolved = expand(native, probe, chain)
          native.content.replaceChildren(resolved.content)
          probe.removeAttribute("data-template")
          shape(native)
          element.replaceWith(probe)
        } else if (element instanceof HTMLTemplateElement) {
          syntax(element)
          const resolved = expand(element, element, chain)
          element.content.replaceChildren(resolved.content)
          element.removeAttribute("data-template")
          if (structural(element)) shape(element)
        } else {
          syntax(element)
          visit(element)
        }
      }
    }
    visit(copy.content)
    return copy
  }
  return (source: HTMLTemplateElement, placement: Element = source) => {
    references = 0
    return expand(source, placement)
  }
}

function restoreFocus(active: Element | null, selection: { start: number | null; end: number | null; direction: "forward" | "backward" | "none" | null; value: string } | null): void {
  if (!(active instanceof HTMLElement) || !active.isConnected) return
  const document = active.ownerDocument
  if (document.activeElement === document.body) active.focus({ preventScroll: true })
  if (document.activeElement === active && selection && selection.start !== null && selection.end !== null
    && (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) && active.value === selection.value) {
    active.setSelectionRange(selection.start, selection.end, selection.direction ?? undefined)
  }
}

/** Web placement ownership; scalar directives and their listeners remain in binding.ts. */
export class TemplateTree {
  private readonly regions: Map<HTMLTemplateElement, Region>
  private readonly scopes = new Map<Instance, BindingScope>()
  private readonly contexts = new Map<Element, BindingScope>()
  private readonly rootScope: BindingScope
  private readonly document: Document
  private removing = new Set<Element>()
  private identifiers = false
  public constructor(private readonly root: Node & ParentNode, store: MStore, private readonly options: BindingOptions) {
    this.regions = retained.get(root) ?? new Map()
    retained.set(root, this.regions)
    this.rootScope = new BindingScope(store)
    this.document = root instanceof Document ? root : root.ownerDocument!
  }

  public get active(): boolean { return this.regions.size > 0 || this.identifiers }

  public read(element: Element, path: string): unknown {
    const scope = this.contexts.get(element)
    if (!scope || !this.owns(element)) throw new TypeError("Element is outside the active binding ownership.")
    return scope.readCurrent(path)
  }

  public owns(element: Element): boolean {
    if (element !== this.root && !this.root.contains(element)) return false
    if ([...this.removing].some(removed => removed.contains(element))) return false
    const member = members.get(element)
    if (member && (member.root !== this.root || !member.instance.contains(element))) return false
    for (let node: Element | null = element; node; node = node.parentElement) {
      const owner = owners.get(node)
      if (owner && (owner.root !== this.root || !this.root.contains(owner.source) || node.parentNode !== owner.source.parentNode)) return false
      if (node === this.root) break
    }
    return true
  }

  public dispose(): void {
    this.rootScope.dispose()
    this.scopes.clear()
    this.contexts.clear()
  }

  public prepare(visit: (element: Element, scope?: BindingScope) => boolean | void, validate: (element: Element) => void): (connected: () => void) => void {
    return this.rootScope.prepare(() => this.plan(visit, validate))
  }

  private plan(visit: (element: Element, scope?: BindingScope) => boolean | void, validate: (element: Element) => void): (connected: () => void) => void {
    const plans: Plan[] = []
    const seen = new Set<HTMLTemplateElement>()
    const nextScopes = new Map<Instance, BindingScope>()
    const removed = new Set<Element>()
    const created: Element[] = []
    const assignments = new Map<Element, Element>()
    const sources = new Map<HTMLTemplateElement, ListTemplate | If>()
    const content = new Map<HTMLTemplateElement, HTMLTemplateElement>()
    const visited: Array<{ element: Element; scope: BindingScope | undefined }> = []
    const resolve = sourceResolver(this.root, this.options)
    const ids = new BindingIds(this.root)
    const checkSource = (parent: ParentNode, repeated: boolean) => {
      for (const element of parent.children) {
        if (portable(element)) {
          // Validate a detached copy without consuming an enclosing inert source.
          const probe = portableProbe(element, this.document)
          const source = portableSource(probe)
          shape(source)
          checkSource(source.content, repeated || list(element))
          if (repeated && element.hasAttribute("id")) throw new TypeError("Repeated templates cannot contain authored IDs.")
          continue
        }
        syntax(element)
        if (structural(element)) shape(element as HTMLTemplateElement)
        if (repeated && (element.hasAttribute("id") || element.hasAttribute("data-model-id"))) {
          throw new TypeError("Repeated templates cannot contain authored IDs or ID models.")
        }
        if (element instanceof HTMLTemplateElement) {
          checkSource(element.content, repeated || element.hasAttribute("data-each"))
        } else {
          if ([...element.attributes].some(attr => /^(data-bind-|data-model-)/.test(attr.name))) {
            const probe = this.document.importNode(element, true)
            this.document.defaultView?.customElements.upgrade(probe)
            validate(probe)
          }
          if (element.hasAttribute("data-bind-text") && [...element.querySelectorAll("*")]
            .some(child => [...child.attributes].some(attr => /^(data-bind-|data-model-|data-if$|data-each$)/.test(attr.name)))) {
            throw new TypeError("Text binding cannot own a bound subtree.")
          }
          checkSource(element, repeated)
        }
      }
    }
    const walk = (element: Element, scope?: BindingScope, instanceRoot = false, instance?: Element) => {
      const owner = owners.get(element)
      if (owner && !instanceRoot) {
        if (owner.root !== this.root) throw new TypeError("Generated instances belong to another binding root.")
        return
      }
      const member = members.get(element)
      if (member && (member.root !== this.root || member.instance !== instance)) {
        throw new TypeError("A scoped node was moved outside its owned instance.")
      }
      if (instance) assignments.set(element, instance)
      if (portable(element)) {
        const source = portableSource(element)
        const known = new Set([...this.regions.get(source)?.instances.values() ?? []].map(instance => instance.element))
        if ([...source.parentElement!.children].some(child => child !== source && !known.has(child))) {
          throw new TypeError("Portable template region contains unowned content.")
        }
        sources.set(source, element)
        content.set(source, resolve(source, element))
        walk(source, scope, false, instance)
        return
      }
      syntax(element)
      if (structural(element)) {
        const source = element as HTMLTemplateElement
        if (source === this.root || !source.parentNode) throw new TypeError("A structural source requires a parent inside the binding root.")
        seen.add(source)
        const each = source.getAttribute("data-each")
        const resolved = content.get(source) ?? resolve(source)
        shape(resolved)
        checkSource(resolved.content, each !== null)
        const signature = JSON.stringify([source.getAttribute("data-if"), each, source.getAttribute("data-each-key"), resolved.innerHTML])
        const previous = this.regions.get(source)
        if (previous && previous.parent !== source.parentNode) throw new TypeError("Structural source was moved outside its owned region.")
        const current = signature === previous?.signature ? previous : undefined
        const context = scope ?? this.rootScope
        let keys: Iterable<ItemKey>
        if (each !== null) keys = context.collection(each, source.getAttribute("data-each-key")!).keys()
        else {
          const value = context.read(source.getAttribute("data-if")!)
          if (typeof value !== "boolean") throw new TypeError("Conditional templates require Boolean values.")
          keys = value ? [0] : []
        }
        const instances = new Map<ItemKey, Instance>()
        for (const key of keys) {
          let instance = current?.instances.get(key)
          if (instance && instance.element.parentNode !== source.parentNode) {
            throw new TypeError("Generated instance was moved outside its owned region.")
          }
          if (!instance) {
            const element = this.document.importNode(shape(resolved), true)
            this.document.defaultView?.customElements.upgrade(element)
            instance = { element }
            created.push(element)
          }
          const childScope = this.scopes.get(instance) ?? (each !== null
            ? context.each(each, source.getAttribute("data-each-key")!, key) : context.template())
          nextScopes.set(instance, childScope)
          instances.set(key, instance)
          walk(instance.element, childScope, true, instance.element)
        }
        const surviving = new Set(instances.values())
        if (previous) for (const instance of previous.instances.values()) {
          if (!surviving.has(instance)) removed.add(instance.element)
        }
        plans.push({ source, region: { signature, instances, parent: source.parentNode, portable: sources.get(source) } })
        return
      }
      ids.visit(element, scope ?? this.rootScope)
      visited.push({ element, scope })
      if (!(element instanceof HTMLTemplateElement)) for (const child of [...element.children]) walk(child, scope, false, instance)
    }
    if (this.root instanceof Element) walk(this.root)
    else for (const element of [...this.root.children]) walk(element)
    for (const [source, region] of this.regions) if (!seen.has(source)) {
      for (const instance of region.instances.values()) removed.add(instance.element)
    }
    // Paired roots prepare scalar writes together, including text that retires an ID target.
    for (const { element, scope } of visited) {
      if (visit(element, scope ?? (ids.active ? this.rootScope : undefined))) ids.replaceContent(element)
    }
    ids.validate(removed)
    const active = this.document.activeElement
    const field = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement ? active : null
    const selection = field ? { start: field.selectionStart, end: field.selectionEnd, direction: field.selectionDirection, value: field.value } : null
    let fallback: HTMLElement | undefined
    let portableFocus = false
    if (active && [...removed].some(element => element.contains(active))) {
      if (this.options.focusFallback) fallback = this.options.focusFallback({ active, removed: [...removed] })
      else {
        // Inner regions are planned first; an explicit conditional target takes precedence.
        for (const region of this.regions.values()) {
          const host = region.portable
          if (!host || ![...region.instances.values()].some(instance => instance.element.contains(active))) continue
          if (!list(host) && host.focusTarget !== null) {
            const id = host.focusTarget
            const matches = [...(this.root instanceof HTMLElement && this.root.id === id ? [this.root] : []),
              ...this.root.querySelectorAll<HTMLElement>("[id]")].filter(element => element.id === id
                && ![...removed].some(removed => removed.contains(element)))
            if (!id || /\s/.test(id) || matches.length !== 1) throw new TypeError("focus-target must resolve uniquely to a surviving owner inside the binding root.")
            fallback = matches[0]
            portableFocus = true
            break
          }
          if (list(host) && host.focusOnRemove && ![...removed].some(element => element.contains(host.itemsContainer))) {
            fallback = host.itemsContainer
            break
          }
        }
      }
      if (!(fallback instanceof HTMLElement) || !fallback.isConnected || [...removed].some(element => element.contains(fallback!))
        || fallback.closest("[hidden],[inert]") || fallback.matches(":disabled,[disabled],input[type=hidden]")
        || !fallback.matches("button,input,select,textarea,a[href],[tabindex],[contenteditable=true]")
          && !(portableFocus && fallback.focus !== HTMLElement.prototype.focus)) {
        throw new TypeError("Removing a focused instance requires a valid focusFallback.")
      }
    }
    const commit = (connected: () => void) => {
      if (fallback) {
        fallback.focus({ preventScroll: true })
        const focused = this.document.activeElement
        if (!focused || [...removed].some(element => element.contains(focused))
          || focused !== fallback && !(portableFocus && fallback.contains(focused))) {
          throw new TypeError("focusFallback target could not receive focus.")
        }
      }
      try {
        for (const { source, region } of plans) {
          const parent = source.parentNode!
          const move = (parent as Element & { moveBefore?: (node: Node, before: Node) => void }).moveBefore
          let before: Node = source
          let pending: DocumentFragment | undefined
          let anchor: Node = source
          const flush = () => {
            if (pending) { parent.insertBefore(pending, anchor); pending = undefined }
          }
          for (const instance of [...region.instances.values()].reverse()) {
            const element = instance.element
            // A pending run will precede anchor. Keep its existing predecessor in place.
            if (element.nextSibling === (pending ? anchor : before) && element.parentNode === parent) {
              flush()
            } else if (move && element.isConnected && parent.isConnected) {
              flush()
              move.call(parent, element, before)
            } else {
              if (!pending) { pending = this.document.createDocumentFragment(); anchor = before }
              pending.prepend(element)
            }
            before = element
          }
          flush()
        }
        connected()
      } catch (error) {
        for (const element of created) element.remove()
        restoreFocus(active, selection)
        throw error
      }
      for (const element of removed) { owners.delete(element); element.remove() }
      for (const [instance, scope] of this.scopes) if (!nextScopes.has(instance)) scope.dispose()
      this.scopes.clear()
      nextScopes.forEach((scope, instance) => this.scopes.set(instance, scope))
      this.regions.clear()
      for (const { source, region } of plans) {
        this.regions.set(source, region)
        for (const instance of region.instances.values()) owners.set(instance.element, { root: this.root, source })
      }
      assignments.forEach((instance, element) => members.set(element, { root: this.root, instance }))
      this.contexts.clear()
      for (const { element, scope } of visited) this.contexts.set(element, scope ?? this.rootScope)
      this.identifiers = ids.active
      restoreFocus(active, selection)
    }
    return connected => {
      // Native blur/change can fire while focus leaves rows already removed from the store.
      this.removing = removed
      try { commit(connected) } finally { this.removing.clear() }
    }
  }
}
