import { readTreeHierarchy, treeLabel } from "./hierarchy.js"
import type { TreeHierarchy, TreeNode } from "./hierarchy.js"

export type TreeCheckStrategy = "all" | "parent" | "child"
export interface TreeLoadResult { nodes: readonly HTMLLIElement[]; dispose?: () => void }
export interface TreeOptions {
  multiple?: boolean
  cascade?: boolean
  cancelable?: boolean
  checkStrategy?: TreeCheckStrategy
  defaultExpandAll?: boolean
  defaultExpandedKeys?: readonly string[]
  expandedKeys?: readonly string[]
  defaultSelectedKeys?: readonly string[]
  selectedKeys?: readonly string[]
  defaultCheckedKeys?: readonly string[]
  checkedKeys?: readonly string[]
  load?: (node: TreeNode, context: { signal: AbortSignal }) => TreeLoadResult | Promise<TreeLoadResult>
}
export interface TreeData { readonly keys: readonly string[]; readonly nodes: readonly TreeNode[] }
export interface TreeController {
  readonly connected: boolean
  readonly error: unknown
  readonly nodes: readonly TreeNode[]
  readonly selectedKeys: readonly string[]
  readonly expandedKeys: readonly string[]
  readonly loadingKeys: readonly string[]
  getCheckedData(strategy?: TreeCheckStrategy): TreeData
  getIndeterminateData(): TreeData
  setSelectedKeys(keys: readonly string[]): void
  setCheckedKeys(keys: readonly string[]): void
  setExpandedKeys(keys: readonly string[]): void
  expand(key: string): Promise<boolean>
  reveal(key: string): void
  refresh(): void
  disconnect(): void
}
interface Lease { element: HTMLElement; name: string; before: string | null; last: string | null }
interface Mixed { control: HTMLInputElement; before: boolean; last: boolean }
interface Load { node: TreeNode; generation: number; abort: AbortController; resolve(value: boolean): void; reject(error: unknown): void; promise: Promise<boolean> }
const owner = Symbol.for("markup-ui.tree.owner"), checkOwner = Symbol.for("markup-ui.checkbox-group.owner")
type Owned = Element & { [owner]?: object; [checkOwner]?: object }

export function createTree(root: HTMLElement, options: TreeOptions = {}): TreeController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement)) throw new TypeError("Tree requires native markup.")
  if ((root as Owned)[owner]) throw new Error("Tree already has an owner.")
  const allowed = ["multiple", "cascade", "cancelable", "checkStrategy", "defaultExpandAll", "defaultExpandedKeys",
    "expandedKeys", "defaultSelectedKeys", "selectedKeys", "defaultCheckedKeys", "checkedKeys", "load"]
  if (!options || typeof options !== "object" || Array.isArray(options) || Object.keys(options).some(key => !allowed.includes(key))
    || ["multiple", "cascade", "cancelable", "defaultExpandAll"].some(key => {
      const value = options[key as keyof TreeOptions]; return value !== undefined && typeof value !== "boolean"
    }) || options.load !== undefined && typeof options.load !== "function") throw new TypeError("Unsupported Tree options.")
  const multiple = options.multiple ?? false, cascade = options.cascade ?? false, cancelable = options.cancelable ?? true
  const strategy = options.checkStrategy === undefined ? "all" : options.checkStrategy, loader = options.load
  if (!["all", "parent", "child"].includes(strategy)) throw new TypeError("checkStrategy is all, parent or child.")
  const token = {}, leases: Lease[] = [], mixed = new Map<HTMLInputElement, Mixed>(), owned = new Set<HTMLElement>()
  const knownOpen = new Map<HTMLDetailsElement, boolean>(), jobs = new Map<string, Load>()
  const loaded = new Set<{ result: TreeLoadResult; branch: HTMLDetailsElement }>()
  let index: TreeHierarchy = readTreeHierarchy(root), connected = true, busy = false, generation = 0, error: unknown = null
  let visible: TreeNode[] = [], unknown = new Set<TreeNode>(), lastFocused: TreeNode | null = null
  let buffer = "", typedAt = 0, recovery = false
  const timers = new Set<number>()
  const own = (element: Element) => element.closest("[data-tree]") === root
  function live() { if (!connected) throw new Error("Tree is disconnected.") }
  function guard() {
    live(); if (busy) throw new Error("Tree hooks may not reenter mutation APIs; disconnect is allowed.")
    const changes = relevant(observer.takeRecords())
    if (changes.length) { mark(changes); refresh() }
  }
  function report(cause: unknown) {
    error = cause
    root.dispatchEvent(new view!.CustomEvent("mui:tree-error", { detail: { error: cause } }))
  }
  function attr(element: HTMLElement, name: string, value: string | null) {
    let lease = leases.find(item => item.element === element && item.name === name)
    if (!lease) { lease = { element, name, before: element.getAttribute(name), last: element.getAttribute(name) }; leases.push(lease) }
    else if (element.getAttribute(name) !== lease.last) lease.before = element.getAttribute(name)
    if (value === null) element.removeAttribute(name)
    else element.setAttribute(name, value)
    lease.last = value
  }
  function restore(lease: Lease) {
    if (lease.element.getAttribute(lease.name) === lease.last) {
      if (lease.before === null) lease.element.removeAttribute(lease.name)
      else lease.element.setAttribute(lease.name, lease.before)
    }
  }
  function base(element: HTMLElement, name: string) {
    const lease = leases.find(item => item.element === element && item.name === name)
    return lease ? lease.before : element.getAttribute(name)
  }
  function hint(element: HTMLElement, disabled: boolean) { attr(element, "aria-disabled", disabled ? "true" : base(element, "aria-disabled")) }
  function nodeDisabled(node: TreeNode) { return node.element.hasAttribute("data-tree-disabled") || root.hasAttribute("data-tree-disabled") || base(node.label, "aria-disabled") === "true" }
  function barrier(node: TreeNode) { return nodeDisabled(node) || !!node.checkbox && (node.checkbox.matches(":disabled") || base(node.checkbox, "aria-disabled") === "true") }
  function usable(node: TreeNode) { return !nodeDisabled(node) && !!node.target && !node.target.matches(":disabled") }
  function display(element: HTMLElement) {
    if (!element.isConnected || element.closest("[hidden],[inert]")) return false
    for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
      if (parent.localName === "details" && !(parent as HTMLDetailsElement).open && !parent.firstElementChild?.contains(element)) return false
      const style = view!.getComputedStyle(parent)
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
    }
    return true
  }
  function visibility() { visible = index.nodes.filter(node => usable(node) && display(node.target!)) }
  function focus(element: HTMLElement | null) {
    if (element && connected && display(element)) { element.focus({ preventScroll: true }); live() }
  }
  function recover() {
    if (recovery || !lastFocused) return
    const active = document!.activeElement
    const current = index.byKey.get(lastFocused.key)
    if (current?.element === lastFocused.element && active instanceof view!.HTMLElement
      && current.element.contains(active) && display(active)) return
    if (active !== document!.body && !(active && lastFocused.element.contains(active))) return
    recovery = true
    try {
      let parent: TreeNode | null = lastFocused
      while (parent) {
        const candidate = index.byKey.get(parent.key)
        if (candidate?.element === parent.element && visible.includes(candidate)) { focus(candidate.target); return }
        parent = parent.parent
      }
      focus(visible[0]?.target ?? root)
    } finally { recovery = false }
  }
  function keyNodes(keys: readonly string[], predicate: (node: TreeNode) => boolean) {
    if (!Array.isArray(keys) || keys.some(key => typeof key !== "string") || new Set(keys).size !== keys.length) throw new TypeError("Tree keys must be unique native strings; numbers are not coerced.")
    return keys.map(key => {
      const node = index.byKey.get(key)
      if (!node || !predicate(node)) throw new RangeError(`Unknown or unavailable Tree key: ${key}.`)
      return node
    })
  }
  function select(keys: readonly string[]) {
    const selected = new Set(keyNodes(keys, node => node.label.hasAttribute("data-tree-select")))
    if (!multiple && selected.size > 1) throw new RangeError("Single selection allows at most one key.")
    for (const node of index.nodes) if (node.label.hasAttribute("data-tree-select")) attr(node.label, "aria-pressed", String(selected.has(node)))
  }
  function derive(write = true) {
    unknown = new Set()
    const stats = new Map<TreeNode, { count: number; all: boolean; any: boolean; unknown: boolean }>()
    for (let i = index.nodes.length - 1; i >= 0; i--) {
      const node = index.nodes[i]!
      const children = node.children.map(child => stats.get(child)!)
      const count = children.reduce((sum, child) => sum + child.count, 0)
      const unloaded = !!node.branch?.hasAttribute("data-tree-lazy") || children.some(child => child.unknown)
      if (barrier(node)) { stats.set(node, { count: 0, all: true, any: false, unknown: false }); continue }
      if (unloaded) unknown.add(node)
      const checkbox = node.checkbox
      let checked = checkbox?.checked ?? false, partial = checkbox?.indeterminate ?? false
      if (cascade && checkbox) {
        if (count || unloaded) {
          checked = !!count && children.every(child => child.all) && !unloaded
          partial = children.some(child => child.any) && !checked
        } else partial = false
        if (write) {
          checkbox.checked = checked; checkbox.indeterminate = partial
          const lease = mixed.get(checkbox); if (lease) lease.last = partial
        }
      }
      stats.set(node, checkbox
        ? { count: 1, all: checked && !partial, any: checked || partial, unknown: unloaded }
        : { count, all: children.every(child => child.all), any: children.some(child => child.any), unknown: unloaded })
    }
    if (write) for (const node of index.nodes) {
      for (const target of [node.target, node.summary]) if (target) hint(target, nodeDisabled(node))
      if (node.checkbox) hint(node.checkbox, nodeDisabled(node) || cascade && unknown.has(node))
    }
  }
  function propagate(node: TreeNode, value: boolean) {
    const stack = [node]
    while (stack.length) {
      const current = stack.pop()!
      if (barrier(current)) continue
      if (current.checkbox) { current.checkbox.checked = value; current.checkbox.indeterminate = false }
      if (cascade) stack.push(...current.children)
    }
  }
  function checks(keys: readonly string[]) {
    const wanted = keyNodes(keys, node => !!node.checkbox && !barrier(node) && !(cascade && unknown.has(node)))
    for (const node of index.nodes) if (node.checkbox && !barrier(node)) { node.checkbox.checked = false; node.checkbox.indeterminate = false }
    for (const node of wanted) propagate(node, true)
    derive()
  }
  function data(nodes: readonly TreeNode[]): TreeData { return Object.freeze({ keys: Object.freeze(nodes.map(node => node.key)), nodes: Object.freeze([...nodes]) }) }
  function getCheckedData(mode: TreeCheckStrategy = strategy): TreeData {
    if (!["all", "parent", "child"].includes(mode)) throw new TypeError("Unknown check strategy.")
    let nodes = index.nodes.filter(node => node.checkbox?.checked)
    if (cascade && mode !== "all") nodes = nodes.filter(node => {
      if (mode === "parent") {
        for (let parent = node.parent; parent; parent = parent.parent) {
          if (barrier(parent) || barrier(node)) break
          if (parent.checkbox?.checked) return false
        }
        return true
      }
      if (barrier(node)) return true
      const stack = [...node.children]
      while (stack.length) { const child = stack.pop()!; if (barrier(child)) continue; if (child.checkbox) return false; stack.push(...child.children) }
      return true
    })
    return data(nodes)
  }
  function releaseResult(result: TreeLoadResult) {
    const cleanup = result?.dispose
    if (typeof cleanup !== "function") return
    const returned: unknown = cleanup()
    if (returned && typeof (returned as Promise<unknown>).then === "function") {
      void Promise.resolve(returned).catch(() => {})
      throw new TypeError("Loaded-node disposal must be synchronous.")
    }
  }
  function abortJobs(branch?: HTMLDetailsElement) {
    for (const [key, job] of jobs) if (!branch || branch.contains(job.node.element) || branch === job.node.branch) {
      const wasConnected = connected
      jobs.delete(key); job.abort.abort(); job.resolve(false)
      if (wasConnected && !connected) throw new Error("Tree disconnected during load cancellation.")
      if (connected) attr(job.node.branch!, "aria-busy", null)
    }
  }
  function claim(next: TreeHierarchy) {
    const candidates = new Set<HTMLElement>([root])
    for (const node of next.nodes) for (const element of [node.element, node.label, node.checkbox, node.branch, node.summary]) if (element) {
      if ((element as Owned)[owner] && (element as Owned)[owner] !== token
        || element === node.checkbox && (element as Owned)[checkOwner] && (element as Owned)[checkOwner] !== token) throw new Error("Tree node/checkbox already has another owner.")
      candidates.add(element)
    }
    for (const element of owned) if (!candidates.has(element)) {
      for (let i = leases.length - 1; i >= 0; i--) if (leases[i]!.element === element) { restore(leases[i]!); leases.splice(i, 1) }
      if (element instanceof view!.HTMLInputElement) {
        const lease = mixed.get(element)
        if (lease && element.indeterminate === lease.last) element.indeterminate = lease.before
        mixed.delete(element)
      }
      if (element instanceof view!.HTMLDetailsElement) knownOpen.delete(element)
      if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
      if ((element as Owned)[checkOwner] === token) delete (element as Owned)[checkOwner]
      owned.delete(element)
    }
    for (const element of candidates) { (element as Owned)[owner] = token; owned.add(element) }
    for (const node of next.nodes) {
      if (node.checkbox) {
        (node.checkbox as Owned)[checkOwner] = token
        if (!mixed.has(node.checkbox)) mixed.set(node.checkbox, { control: node.checkbox, before: node.checkbox.indeterminate, last: node.checkbox.indeterminate })
      }
      if (node.branch && !knownOpen.has(node.branch)) knownOpen.set(node.branch, node.branch.open)
    }
    index = next
  }
  function rebuild() { claim(readTreeHierarchy(root)); derive(); visibility(); recover() }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["data-tree", "role", "data-tree-key", "data-tree-lazy", "data-tree-disabled", "data-tree-group", "data-tree-label", "data-tree-select",
        "data-tree-check", "data-tree-row", "data-tree-branch", "data-tree-list", "type", "name", "value", "checked", "disabled",
        "hidden", "inert", "class", "style", "id", "for", "aria-label", "aria-labelledby", "aria-pressed", "aria-disabled", "open"] })
    for (let parent = root.parentElement; parent; parent = parent.parentElement) observer.observe(parent, { childList: true, attributes: true, attributeFilter: ["hidden", "inert", "class", "style", "disabled", "open"] })
  }
  function mark(records: MutationRecord[]) {
    for (const record of records) if (record.type === "attributes") {
      const lease = leases.find(lease => lease.element === record.target && lease.name === record.attributeName)
      if (lease) lease.before = lease.last = lease.element.getAttribute(lease.name)
    }
  }
  function relevant(records: MutationRecord[]) {
    return records.filter(record => record.target === root || (root.contains(record.target)
      ? !(record.target instanceof view!.Element) || own(record.target)
      : record.type === "attributes" || [...record.removedNodes].some(node => node === root || node.contains(root))))
  }
  const observer = new view.MutationObserver(records => {
    const changes = relevant(records); if (!changes.length || !connected) return
    mark(changes)
    if (changes.every(record => record.type === "attributes" && record.attributeName === "open")) {
      try { run(() => { for (const job of jobs.values()) if (!display(job.node.summary!)) abortJobs(job.node.branch!); for (const node of index.nodes) if (node.branch && !node.branch.open) abortJobs(node.branch); visibility(); recover() }) } catch { /* Reported by run. */ }
    } else { try { refresh() } catch { /* Reported by refresh. */ } }
  })
  function run<T>(action: () => T): T {
    guard(); mark(relevant(observer.takeRecords())); observer.disconnect(); busy = true
    try { const value = action(); live(); return value }
    catch (cause) {
      try { disconnect() } catch (cleanup) { cause = new AggregateError([cause, cleanup], "Tree operation and cleanup failed.") }
      report(cause); throw cause
    }
    finally { busy = false; observe() }
  }
  function refresh() {
    run(() => {
      generation++; abortJobs()
      for (const entry of loaded) if (!root.contains(entry.branch)) {
        loaded.delete(entry)
        for (const node of entry.result.nodes) node.remove()
        releaseResult(entry.result); live()
      }
      rebuild()
      for (const node of index.nodes) if (node.branch) knownOpen.set(node.branch, node.branch.open)
    })
  }
  function later(action: () => void) {
    const current = generation, id = view!.setTimeout(() => { timers.delete(id); if (connected && generation === current) action() }, 0)
    timers.add(id)
  }
  function notify(type: string, detail: object) { if (connected) root.dispatchEvent(new view!.CustomEvent(`mui:tree-${type}`, { detail })) }
  function setExpanded(keys: readonly string[]) {
    const targets = new Set(keyNodes(keys, node => !!node.branch))
    run(() => {
      for (const node of index.nodes) if (node.branch) {
        const open = targets.has(node)
        if (!open && node.branch.contains(document!.activeElement) && !node.summary!.contains(document!.activeElement)) focus(node.target)
        node.branch.open = open; knownOpen.set(node.branch, open)
        if (!open) abortJobs(node.branch)
      }
      visibility(); recover()
    })
  }
  function load(node: TreeNode): Promise<boolean> {
    if (!node.branch?.hasAttribute("data-tree-lazy")) return Promise.resolve(true)
    if (!loader) { const cause = new Error("No Tree loader was supplied."); report(cause); return Promise.reject(cause) }
    const existing = jobs.get(node.key); if (existing) return existing.promise
    if (jobs.size >= 8) { const cause = new RangeError("At most eight Tree loads may be pending."); report(cause); return Promise.reject(cause) }
    const abort = new view!.AbortController()
    let resolve!: Load["resolve"], reject!: Load["reject"]
    const promise = new Promise<boolean>((yes, no) => { resolve = yes; reject = no })
    const job: Load = { node, generation, abort, resolve, reject, promise }; jobs.set(node.key, job)
    const valid = () => connected && jobs.get(node.key) === job && generation === job.generation
      && index.byKey.get(node.key)?.element === node.element && node.element.isConnected
      && node.branch!.open && display(node.summary!) && !abort.signal.aborted
    function failure(cause: unknown) {
      if (jobs.get(node.key) !== job) return
      jobs.delete(node.key)
      if (connected) { run(() => { attr(node.branch!, "aria-busy", null) }); report(cause) }
      reject(cause)
    }
    try {
      run(() => attr(node.branch!, "aria-busy", "true"))
      busy = true
      let result: TreeLoadResult | Promise<TreeLoadResult>
      try { result = loader(node, { signal: abort.signal }) } finally { busy = false }
      Promise.resolve(result).then(value => {
        if (!valid()) { try { releaseResult(value) } catch (cause) { report(cause) }; if (jobs.get(node.key) === job) { abortJobs(node.branch!); }; return }
        let inserted = false
        try {
          if (!value || !Array.isArray(value.nodes) || value.nodes.length > 200
            || value.dispose !== undefined && typeof value.dispose !== "function") throw new TypeError("Load returns {nodes: fresh native li[], dispose?}, at most 200 roots.")
          const batch: TreeLoadResult = { nodes: Object.freeze([...value.nodes]), ...(value.dispose ? { dispose: value.dispose } : {}) }
          const seen = new Set<Element>(), ids = new Set<string>()
          for (const li of batch.nodes) {
            if (!(li instanceof view!.HTMLLIElement) || li.ownerDocument !== document || li.parentNode || li.isConnected || (li as Owned)[owner]) throw new TypeError("Lazy nodes must be fresh detached unowned native li elements.")
            for (const element of [li, ...li.querySelectorAll("*")]) {
              if (seen.has(element) || seen.size >= 4000 || element.localName.includes("-")
                || element.matches("script,style,link,iframe,object,embed,[is]")) throw new TypeError("Lazy results must contain at most 4000 safe native elements, with no reused nodes.")
              seen.add(element)
              if (element.id) { if (ids.has(element.id) || document!.getElementById(element.id)) throw new TypeError("Lazy row IDs must be unique."); ids.add(element.id) }
            }
          }
          const preview = readTreeHierarchy(root, { list: node.list!, nodes: batch.nodes })
          for (const next of preview.nodes) for (const element of [next.element, next.label, next.checkbox, next.branch, next.summary]) if (element
            && ((element as Owned)[owner] && (element as Owned)[owner] !== token
              || element === next.checkbox && (element as Owned)[checkOwner] && (element as Owned)[checkOwner] !== token)) throw new Error("Lazy node/checkbox already has another owner.")
          const oldCount = index.nodes.length
          if (preview.nodes.length - oldCount > 200) throw new RangeError("A lazy result may add at most 200 tree nodes.")
          run(() => {
            if (!valid()) throw new Error("Tree load was superseded.")
            node.list!.append(...batch.nodes); inserted = true
            attr(node.branch!, "data-tree-lazy", null)
            loaded.add({ result: batch, branch: node.branch! })
            claim(preview); derive(); visibility(); recover()
            attr(node.branch!, "aria-busy", null)
          })
          jobs.delete(node.key); resolve(true); notify("load", { key: node.key, node: index.byKey.get(node.key), nodes: batch.nodes })
        } catch (cause) {
          if (!inserted) { try { releaseResult(value) } catch (cleanup) { cause = new AggregateError([cause, cleanup]) } }
          failure(cause)
        }
      }, failure).catch(failure)
    } catch (cause) { failure(cause) }
    return promise
  }
  function expand(key: string) {
    guard()
    const node = keyNodes([key], node => !!node.branch && !nodeDisabled(node))[0]!
    setExpanded([...new Set([...controller.expandedKeys, key])])
    return load(node)
  }
  function reveal(key: string) {
    guard(); const node = keyNodes([key], () => true)[0]!
    const keys = new Set(controller.expandedKeys)
    for (let parent = node.parent; parent; parent = parent.parent) if (parent.branch) keys.add(parent.key)
    setExpanded([...keys]); node.target?.scrollIntoView?.({ block: "nearest" })
  }
  function eventNode(target: EventTarget | null) {
    if (!(target instanceof view!.Element) || !own(target)) return null
    const element = target.closest("[data-tree-key]")
    const node = element ? index.byKey.get(element.getAttribute("data-tree-key")!) : null
    return node?.element === element ? node : null
  }
  function click(event: MouseEvent) {
    try { guard() } catch { return }
    const node = eventNode(event.target); if (!node) return
    const target = event.target as Element
    const check = target === node.checkbox || !!target.closest("label")?.contains(node.checkbox)
    if ((check && (barrier(node) || cascade && unknown.has(node)))
      || (nodeDisabled(node) || node.label.matches(":disabled")) && node.label.contains(target)
      || nodeDisabled(node) && node.summary?.contains(target)) { event.preventDefault(); return }
    if (!node.label.hasAttribute("data-tree-select") || !node.label.contains(target) || event.button || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    later(() => {
      if (event.defaultPrevented || index.byKey.get(node.key)?.element !== node.element) return
      try {
        const keys = new Set(controller.selectedKeys), had = keys.has(node.key)
        if (had && cancelable) keys.delete(node.key)
        else { if (!multiple) keys.clear(); keys.add(node.key) }
        controller.setSelectedKeys([...keys])
        if (!had || cancelable) notify("select", { key: node.key, selectedKeys: controller.selectedKeys, node, event })
      } catch { /* Direct setter reports runtime errors. */ }
    })
  }
  function change(event: Event) {
    try { guard() } catch { return }
    const node = eventNode(event.target)
    if (!node || event.target !== node.checkbox) return
    try {
      run(() => { propagate(node, node.checkbox!.checked); derive() })
      notify("check", { key: node.key, ...getCheckedData(), indeterminateKeys: controller.getIndeterminateData().keys, node, event })
    } catch { /* Reported by run. */ }
  }
  function toggle(event: Event) {
    const node = eventNode(event.target)
    if (!node?.branch || event.target !== node.branch || knownOpen.get(node.branch) === node.branch.open) return
    const open = node.branch.open
    knownOpen.set(node.branch, open)
    try {
      run(() => { if (!open) abortJobs(node.branch!); visibility(); recover() })
      notify("expand", { key: node.key, expandedKeys: controller.expandedKeys, node, event })
      if (open && connected && node.branch.open && node.branch.hasAttribute("data-tree-lazy")) void load(node).catch(() => {})
    } catch { /* Reported by run. */ }
  }
  function keydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return
    try { guard() } catch { return }
    const node = eventNode(event.target)
    if (!node || !usable(node) || event.target !== node.target && event.target !== node.summary) return
    const position = visible.indexOf(node)
    if (position < 0) return
    let next: TreeNode | undefined
    if (event.key === "ArrowDown") next = visible[position + 1]
    else if (event.key === "ArrowUp") next = visible[position - 1]
    else if (event.key === "Home") next = visible[0]
    else if (event.key === "End") next = visible.at(-1)
    else if (event.key === "ArrowLeft") {
      if (node.branch?.open) { event.preventDefault(); controller.setExpandedKeys(controller.expandedKeys.filter(key => key !== node.key)); notify("expand", { key: node.key, expandedKeys: controller.expandedKeys, node, event }); return }
      let parent = node.parent; while (parent && !visible.includes(parent)) parent = parent.parent
      next = parent ?? undefined
    } else if (event.key === "ArrowRight") {
      if (node.branch && !node.branch.open) {
        event.preventDefault(); void expand(node.key).catch(() => {})
        notify("expand", { key: node.key, expandedKeys: controller.expandedKeys, node, event }); return
      }
      next = visible.find(candidate => candidate.parent === node)
    } else if (event.key.length === 1 && event.key !== " ") {
      const now = Date.now(), character = event.key.toLocaleLowerCase()
      buffer = now - typedAt > 700 ? character : (buffer + character).slice(-128); typedAt = now
      const search = [...buffer].every(value => value === character) ? character : buffer
      const rotated = [...visible.slice(position + 1), ...visible.slice(0, position + 1)]
      next = rotated.find(candidate => treeLabel(candidate).toLocaleLowerCase().startsWith(search))
    } else return
    if (next || ["ArrowDown", "ArrowUp", "Home", "End", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault(); focus(next?.target ?? null)
    }
  }
  function focused(event: Event) { const node = eventNode(event.target); if (node) lastFocused = node }
  function reset(event: Event) {
    if (!(event.target instanceof view!.HTMLFormElement) || !index.nodes.some(node => node.checkbox?.form === event.target)) return
    later(() => { if (!event.defaultPrevented) { try { run(() => { derive(); visibility() }) } catch { /* Reported. */ } } })
  }
  function disconnect() {
    if (!connected) return
    const active = document!.activeElement
    const retiring = [...loaded].flatMap(entry => [...entry.result.nodes])
    const removed = (element: Element | null) => !!element && retiring.some(node => node.contains(element))
    let destination: HTMLElement | null = null
    if (removed(active)) {
      for (let node = lastFocused; node && !destination; node = node.parent) {
        destination = [node.target, node.summary].find(element => element && !removed(element) && !element.matches(":disabled") && display(element)) ?? null
      }
      destination ??= visible.map(node => node.target).find(element => element && !removed(element)) ?? null
      if (!destination && base(root, "tabindex") !== null) destination = root
    }
    connected = false; generation++; observer.disconnect(); abortJobs()
    destination?.focus({ preventScroll: true })
    for (const timer of timers) view!.clearTimeout(timer); timers.clear()
    root.removeEventListener("click", click); root.removeEventListener("change", change)
    root.removeEventListener("toggle", toggle, true); root.removeEventListener("keydown", keydown)
    root.removeEventListener("focusin", focused); document!.removeEventListener("reset", reset, true)
    const errors: unknown[] = []
    for (const entry of loaded) {
      for (const node of entry.result.nodes) node.remove()
      try { releaseResult(entry.result) } catch (cause) { errors.push(cause) }
    }
    loaded.clear()
    for (const lease of leases) restore(lease)
    for (const lease of mixed.values()) if (lease.control.indeterminate === lease.last) lease.control.indeterminate = lease.before
    for (const element of owned) {
      if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
      if ((element as Owned)[checkOwner] === token) delete (element as Owned)[checkOwner]
    }
    owned.clear()
    leases.length = 0; mixed.clear(); knownOpen.clear(); unknown.clear(); visible = []; lastFocused = null
    index = { nodes: Object.freeze([]), byKey: new Map() }
    if (errors.length) { const cause = new AggregateError(errors, "Tree load cleanup failed."); report(cause); throw cause }
  }
  const controller: TreeController = {
    get connected() { return connected }, get error() { return error }, get nodes() { return index.nodes },
    get selectedKeys() { return index.nodes.filter(node => node.label.hasAttribute("data-tree-select") && node.label.getAttribute("aria-pressed") === "true").map(node => node.key) },
    get expandedKeys() { return index.nodes.filter(node => node.branch?.open).map(node => node.key) },
    get loadingKeys() { return [...jobs.keys()] },
    getCheckedData, getIndeterminateData: () => data(index.nodes.filter(node => node.checkbox?.indeterminate)),
    setSelectedKeys(keys) { guard(); keyNodes(keys, node => node.label.hasAttribute("data-tree-select")); if (!multiple && keys.length > 1) throw new RangeError("Single selection allows at most one key."); run(() => select(keys)) },
    setCheckedKeys(keys) { guard(); keyNodes(keys, node => !!node.checkbox && !barrier(node) && !(cascade && unknown.has(node))); run(() => checks(keys)) },
    setExpandedKeys(keys) { guard(); setExpanded(keys) }, expand, reveal, refresh, disconnect,
  }
  try {
    derive(false)
    for (const keys of [options.selectedKeys, options.defaultSelectedKeys]) if (keys !== undefined) {
      keyNodes(keys, node => node.label.hasAttribute("data-tree-select"))
      if (!multiple && keys.length > 1) throw new RangeError("Single selection allows at most one key.")
    }
    for (const keys of [options.checkedKeys, options.defaultCheckedKeys]) if (keys !== undefined) keyNodes(keys, node => !!node.checkbox && !barrier(node) && !(cascade && unknown.has(node)))
    for (const keys of [options.expandedKeys, options.defaultExpandedKeys]) if (keys !== undefined) keyNodes(keys, node => !!node.branch)
    run(() => {
      claim(index)
      if (!root.hasAttribute("tabindex")) attr(root, "tabindex", "-1")
      derive()
      const selected = options.selectedKeys ?? options.defaultSelectedKeys
      if (selected !== undefined) select(selected)
      else if (!multiple && controller.selectedKeys.length > 1) throw new RangeError("Multiple authored selections need multiple mode.")
      if (options.defaultCheckedKeys !== undefined) {
        checks(options.defaultCheckedKeys)
        for (const node of index.nodes) if (node.checkbox && !barrier(node)) node.checkbox.defaultChecked = node.checkbox.checked
      }
      if (options.checkedKeys !== undefined) checks(options.checkedKeys)
      const expanded = options.expandedKeys ?? options.defaultExpandedKeys
      const initial = expanded !== undefined ? new Set(keyNodes(expanded, node => !!node.branch)) : null
      for (const node of index.nodes) if (node.branch) {
        if (initial) node.branch.open = initial.has(node)
        else if (options.defaultExpandAll && !node.branch.hasAttribute("data-tree-lazy") && !nodeDisabled(node)) node.branch.open = true
        knownOpen.set(node.branch, node.branch.open)
      }
      visibility()
    })
    root.addEventListener("click", click); root.addEventListener("change", change)
    root.addEventListener("toggle", toggle, true); root.addEventListener("keydown", keydown)
    root.addEventListener("focusin", focused); document.addEventListener("reset", reset, true)
    observe()
  } catch (cause) { disconnect(); throw cause }
  return controller
}
