export type FloatingPlacement = "top" | "right" | "bottom" | "left"

export function positionFloating(
  anchor: Element,
  panel: HTMLElement,
  placement: FloatingPlacement = "bottom",
  offset = 8,
): void {
  const anchorRect = anchor.getBoundingClientRect()
  const panelRect = panel.getBoundingClientRect()
  let left = anchorRect.left + (anchorRect.width - panelRect.width) / 2
  let top = anchorRect.bottom + offset

  if (placement === "top") top = anchorRect.top - panelRect.height - offset
  if (placement === "left") {
    left = anchorRect.left - panelRect.width - offset
    top = anchorRect.top + (anchorRect.height - panelRect.height) / 2
  }
  if (placement === "right") {
    left = anchorRect.right + offset
    top = anchorRect.top + (anchorRect.height - panelRect.height) / 2
  }

  const margin = 8
  left = Math.max(margin, Math.min(left, window.innerWidth - panelRect.width - margin))
  top = Math.max(margin, Math.min(top, window.innerHeight - panelRect.height - margin))
  panel.style.position = "fixed"
  panel.style.left = `${left}px`
  panel.style.top = `${top}px`
}
