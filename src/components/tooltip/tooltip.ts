import { createPopoverController } from "../popover/popover.js"
import { isIconElement } from "../icon/model.js"
import { isTypographyInline } from "../typography/model.js"
import { isSpaceElement } from "../space/model.js"
import { isFlexElement } from "../flex/model.js"
import { isGridElement } from "../grid/model.js"
import type { PopoverController, PopoverOptions } from "../popover/popover.js"

export type TooltipOptions = Omit<PopoverOptions, "trigger">
export type TooltipController = PopoverController

const interactive = "a, area, label, button, input, select, textarea, summary, details, iframe, object, embed, audio[controls], video[controls], [tabindex], [autofocus], [contenteditable]:not([contenteditable=false])"
const attributes = ["role", "href", "tabindex", "autofocus", "contenteditable", "controls", "aria-hidden", "class"]

export function createTooltip(trigger: HTMLElement, panel: HTMLElement, options: TooltipOptions = {}): TooltipController {
  const document = trigger?.ownerDocument
  const view = document?.defaultView
  if (!view || !(trigger instanceof view.HTMLElement) || !(panel instanceof view.HTMLElement)
    || trigger.ownerDocument !== panel.ownerDocument) throw new TypeError("Tooltip needs native nodes sharing a document.")
  if ("trigger" in options) throw new TypeError("Tooltip always supports hover/focus.")
  let suppressed = false
  let core: PopoverController
  function validate() {
    if (trigger.matches(":disabled") || trigger.tabIndex < 0) {
      throw new TypeError("Tooltip needs a keyboard-reachable trigger; disabled needs a native alternative.")
    }
    if (!panel.classList.contains("m-tooltip") || panel.getAttribute("role") !== "tooltip"
      || panel.getAttribute("popover") !== "manual" || panel.getAttribute("aria-hidden") === "true"
      || trigger.contains(panel) || panel.isContentEditable || !panel.textContent?.trim()) {
      throw new TypeError("Tooltip needs separate nonempty .m-tooltip[role=tooltip][popover=manual].")
    }
    for (const node of [panel, ...panel.querySelectorAll("*")]) {
      const role = node === panel ? null : node.getAttribute("role")
      if (node.matches(interactive) || (role && !["img", "none", "presentation"].includes(role))
        || node.localName.includes("-") && !isIconElement(node) && !isTypographyInline(node) && !isSpaceElement(node) && !isFlexElement(node) && !isGridElement(node) || node.shadowRoot || ["script", "style", "slot"].includes(node.localName)) {
        throw new TypeError("Tooltip content must be noninteractive; use Popover.")
      }
    }
    if (trigger.closest("m-tooltip")) throw new TypeError("No Tooltip inside legacy m-tooltip.")
  }
  function connect() {
    suppressed = false
    const previous = trigger.getAttribute("aria-describedby")
    const tokens = previous?.split(/\s+/).filter(Boolean) ?? []
    const id = panel.id
    const added = !tokens.includes(id)
    if (added) trigger.setAttribute("aria-describedby", [...tokens, id].join(" "))
    const reset = (event: Event) => {
      if (event.type !== "pointerenter" || (event as PointerEvent).pointerType !== "touch") suppressed = false
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (core.show) event.preventDefault()
      suppressed = true
      core.close()
    }
    const before = (event: Event) => {
      if (event.target !== panel || (event as ToggleEvent).newState !== "open") return
      try { validate() } catch (error) {
        event.preventDefault()
        core.disconnect()
        panel.dispatchEvent(new view!.CustomEvent("m:tooltip-error", { detail: { error } }))
        return
      }
      if (suppressed) event.preventDefault()
    }
    trigger.addEventListener("pointerenter", reset)
    trigger.addEventListener("focusin", reset)
    panel.addEventListener("beforetoggle", before)
    document!.addEventListener("keydown", escape)
    return () => {
      trigger.removeEventListener("pointerenter", reset)
      trigger.removeEventListener("focusin", reset)
      panel.removeEventListener("beforetoggle", before)
      document!.removeEventListener("keydown", escape)
      if (!added) return
      const current = trigger.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? []
      if (!current.includes(id)) return
      const remaining = current.filter(token => token !== id)
      if (remaining.join(" ") === tokens.join(" ") && previous !== null) trigger.setAttribute("aria-describedby", previous)
      else if (remaining.length) trigger.setAttribute("aria-describedby", remaining.join(" "))
      else trigger.removeAttribute("aria-describedby")
    }
  }
  core = createPopoverController(trigger, panel, { ...options, trigger: "hover", placement: options.placement ?? "top" }, {
    validate, connect, attributes, errorEvent: "m:tooltip-error",
  })
  return {
    get supported() { return core.supported },
    get connected() { return core.connected },
    get show() { return core.show },
    get disabled() { return core.disabled },
    set disabled(value) { core.disabled = value },
    open() { suppressed = false; return core.open() },
    close() { suppressed = true; core.close() },
    setShow(show) {
      if (typeof show !== "boolean") throw new TypeError("setShow requires a boolean.")
      suppressed = !show
      return core.setShow(show)
    },
    syncPosition: () => core.syncPosition(),
    connect: () => core.connect(),
    disconnect: () => core.disconnect(),
  }
}
