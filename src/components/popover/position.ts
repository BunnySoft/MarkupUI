export type PopoverPlacement = "top" | "bottom" | "left" | "right"
  | "top-start" | "top-end" | "bottom-start" | "bottom-end"
  | "left-start" | "left-end" | "right-start" | "right-end"

export interface PlacementOptions {
  placement: PopoverPlacement
  gap: number
  margin: number
  flip: boolean
  positioning: "auto" | "fallback"
}

/** Restores only values still owned by this controller, never an entire style/attribute. */
export function ownedWrites() {
  const undo = new Map<string, () => void>()
  const values = new Map<string, string | null>()
  const ids = new Map<Element, number>()
  function key(element: Element, name: string): string {
    if (!ids.has(element)) ids.set(element, ids.size)
    return `${ids.get(element)}:${name}`
  }
  return {
    attr(element: Element, name: string, value: string | null) {
      const id = key(element, name)
      if (!undo.has(id)) {
        const previous = element.getAttribute(name)
        undo.set(id, () => {
          if (element.getAttribute(name) !== values.get(id)) return
          if (previous === null) element.removeAttribute(name)
          else element.setAttribute(name, previous)
        })
      }
      values.set(id, value)
      if (value === null) element.removeAttribute(name)
      else element.setAttribute(name, value)
    },
    style(element: HTMLElement, name: string, value: string) {
      const id = key(element, `style:${name}`)
      if (!undo.has(id)) {
        const previous = element.style.getPropertyValue(name)
        const priority = element.style.getPropertyPriority(name)
        const hadStyle = element.hasAttribute("style")
        undo.set(id, () => {
          if (element.style.getPropertyValue(name) !== values.get(id) || element.style.getPropertyPriority(name)) return
          if (previous) element.style.setProperty(name, previous, priority)
          else element.style.removeProperty(name)
          if (!hadStyle && !element.getAttribute("style")) element.removeAttribute("style")
        })
      }
      element.style.setProperty(name, value)
      values.set(id, element.style.getPropertyValue(name))
    },
    restore() {
      for (const restore of [...undo.values()].reverse()) restore()
      undo.clear()
      values.clear()
      ids.clear()
    },
  }
}

let anchorSequence = 0

export function createPopoverPositioner(trigger: HTMLElement, panel: HTMLElement, options: PlacementOptions) {
  const view = trigger.ownerDocument.defaultView!
  const writes = ownedWrites()
  const anchorName = `--mui-popover-${++anchorSequence}-${Math.random().toString(36).slice(2)}`
  const css = view.CSS
  const anchors = options.positioning === "auto"
    && !!css?.supports("anchor-name", anchorName)
    && css.supports("position-anchor", anchorName)
    && css.supports("left", "calc(anchor(left) + 1px)")
    && css.supports("top", "calc(anchor(top) + 1px)")
  let named = false

  return {
    update(): boolean {
      const viewport = view.visualViewport
      const x = viewport?.offsetLeft ?? 0
      const y = viewport?.offsetTop ?? 0
      const width = viewport?.width ?? trigger.ownerDocument.documentElement.clientWidth
      const height = viewport?.height ?? trigger.ownerDocument.documentElement.clientHeight
      const a = trigger.getBoundingClientRect()
      if (![x, y, width, height, a.left, a.top, a.width, a.height].every(Number.isFinite)
        || width <= 0 || height <= 0 || a.width <= 0 || a.height <= 0) return false
      let clipLeft = x, clipTop = y, clipRight = x + width, clipBottom = y + height
      for (let parent = trigger.parentElement; parent; parent = parent.parentElement) {
        const style = view.getComputedStyle(parent)
        const rect = parent.getBoundingClientRect()
        if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
          clipLeft = Math.max(clipLeft, rect.left)
          clipRight = Math.min(clipRight, rect.right)
        }
        if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
          clipTop = Math.max(clipTop, rect.top)
          clipBottom = Math.min(clipBottom, rect.bottom)
        }
      }
      if (a.right <= clipLeft || a.left >= clipRight || a.bottom <= clipTop || a.top >= clipBottom) return false
      const margin = Math.min(options.margin, width / 2, height / 2)
      writes.style(panel, "--mui-popover-available-width", `${Math.max(1, width - margin * 2)}px`)
      writes.style(panel, "--mui-popover-available-height", `${Math.max(1, height - margin * 2)}px`)
      const p = panel.getBoundingClientRect()
      if (![p.width, p.height].every(Number.isFinite) || p.width <= 0 || p.height <= 0) return false
      const [requested = "bottom", alignment] = options.placement.split("-")
      let side = requested
      const room: Record<string, number> = {
        top: a.top - y - margin,
        bottom: y + height - a.bottom - margin,
        left: a.left - x - margin,
        right: x + width - a.right - margin,
      }
      const opposite: Record<string, string> = { top: "bottom", bottom: "top", left: "right", right: "left" }
      const other = opposite[side]!
      const needed = (side === "top" || side === "bottom" ? p.height : p.width) + options.gap
      if (options.flip && room[side]! < needed && room[other]! > room[side]!) side = other
      const vertical = side === "top" || side === "bottom"
      const rtl = view.getComputedStyle(trigger).direction === "rtl"
      let left = a.left + (a.width - p.width) / 2
      let top = a.top + (a.height - p.height) / 2
      if (vertical) {
        top = side === "top" ? a.top - p.height - options.gap : a.bottom + options.gap
        if (alignment) left = (alignment === "start") !== rtl ? a.left : a.right - p.width
      } else {
        left = side === "left" ? a.left - p.width - options.gap : a.right + options.gap
        if (alignment) top = alignment === "start" ? a.top : a.bottom - p.height
      }
      const desiredLeft = left, desiredTop = top
      left = Math.max(x + margin, Math.min(left, x + width - p.width - margin))
      top = Math.max(y + margin, Math.min(top, y + height - p.height - margin))
      // Anchor expressions are used only without collision shifting or a zoomed visual viewport.
      const useAnchor = anchors && (viewport?.scale ?? 1) === 1 && left === desiredLeft && top === desiredTop
      if (useAnchor && !named) {
        const names = view.getComputedStyle(trigger).getPropertyValue("anchor-name").trim()
        writes.style(trigger, "anchor-name", names && names !== "none" ? `${names}, ${anchorName}` : anchorName)
        named = true
      }
      writes.style(panel, "position-anchor", useAnchor ? anchorName : "auto")
      writes.style(panel, "left", useAnchor ? `calc(anchor(left) + ${left - a.left}px)` : `${left}px`)
      writes.style(panel, "top", useAnchor ? `calc(anchor(top) + ${top - a.top}px)` : `${top}px`)
      writes.attr(panel, "data-popover-positioning", useAnchor ? "anchor" : "fallback")
      writes.attr(panel, "data-popover-placement", `${side}${alignment ? `-${alignment}` : ""}`)
      // A clamped/overlapping arrow must not imply that it still points at the trigger.
      writes.attr(panel, "data-popover-arrow", left === desiredLeft && top === desiredTop ? "visible" : "hidden")
      return true
    },
    clear() {
      writes.restore()
      named = false
    },
  }
}
