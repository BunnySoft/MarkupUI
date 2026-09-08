import { ownedWrites } from "../popover/position.js"

export interface MenuEntry {
  element: HTMLElement
  label: string
}

export function menuEntryAvailable(element: HTMLElement, menu: HTMLElement): boolean {
  const view = menu.ownerDocument.defaultView!
  if (!element.isConnected || element.matches(":disabled") || element.closest("[hidden], [inert]")) return false
  for (let node: HTMLElement | null = element; node && node !== menu; node = node.parentElement) {
    const style = view.getComputedStyle(node)
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
  }
  return true
}

/** Scoped roving/typeahead only: no popovers, activation, roles or application selection. */
export function createMenuKeyboard(menu: HTMLElement, duration = 500) {
  const view = menu.ownerDocument.defaultView!
  const writes = ownedWrites()
  let entries: MenuEntry[] = []
  let current: HTMLElement | null = null
  let buffer = ""
  let timer = 0
  const normalize = (text: string) => text.normalize("NFKC").toLowerCase()
  const available = () => entries.filter(entry => menuEntryAvailable(entry.element, menu))
  function remember(element: HTMLElement | null) {
    current = element
    for (const entry of entries) writes.attr(entry.element, "tabindex", entry.element === current ? "0" : "-1")
  }
  function clear() {
    view.clearTimeout(timer)
    timer = 0
    buffer = ""
  }
  function focus(target: HTMLElement | "first" | "last") {
    const candidates = available()
    const element = target === "first" ? candidates[0]?.element
      : target === "last" ? candidates.at(-1)?.element : candidates.find(entry => entry.element === target)?.element
    if (!element) return false
    remember(element)
    element.focus()
    return true
  }
  return {
    get current() { return current },
    get available() { return available().map(entry => entry.element) },
    refresh(next: MenuEntry[]) {
      clear()
      writes.restore()
      entries = next
      const candidates = available()
      remember(candidates.some(entry => entry.element === current) ? current : candidates[0]?.element ?? null)
    },
    remember(element: HTMLElement) {
      if (entries.some(entry => entry.element === element) && menuEntryAvailable(element, menu)) remember(element)
    },
    focus,
    handle(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.altKey || event.ctrlKey || event.metaKey) return false
      if (!entries.some(entry => entry.element === event.target)) return false
      const candidates = available()
      if (!candidates.length) return false
      const index = candidates.findIndex(entry => entry.element === current)
      let target: HTMLElement | undefined
      if (!event.shiftKey && event.key === "ArrowDown") target = candidates[(index + 1) % candidates.length]?.element
      else if (!event.shiftKey && event.key === "ArrowUp") target = candidates[index < 0 ? candidates.length - 1 : (index - 1 + candidates.length) % candidates.length]?.element
      else if (!event.shiftKey && event.key === "Home") target = candidates[0]?.element
      else if (!event.shiftKey && event.key === "End") target = candidates.at(-1)?.element
      else if (event.key.length === 1 && event.key !== " ") {
        view.clearTimeout(timer)
        buffer = (buffer + normalize(event.key)).slice(-32)
        timer = view.setTimeout(clear, duration)
        const repeated = [...buffer].every(letter => letter === buffer[0])
        const query = repeated ? buffer[0]! : buffer
        const start = query.length === 1 ? index + 1 : Math.max(0, index)
        for (let offset = 0; offset < candidates.length; offset++) {
          const entry = candidates[(start + offset) % candidates.length]!
          if (normalize(entry.label).startsWith(query)) { target = entry.element; break }
        }
        event.preventDefault()
        if (target) focus(target)
        return true
      } else return false
      event.preventDefault()
      clear()
      if (target) focus(target)
      return true
    },
    suspend() { clear(); remember(null) },
    clear,
    disconnect() { clear(); writes.restore(); entries = []; current = null },
  }
}
