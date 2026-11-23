import { Box, Span } from "../components/box/index.js"
import { Button } from "../components/button/index.js"
import { fail, resolve, snapshot, update } from "./a2ui/data.js"
import { children, components, message, text, validate } from "./a2ui/model.js"
import type { Json, JsonObject } from "./a2ui/data.js"
import type { Component } from "./a2ui/model.js"

export { A2UI_CATALOG_ID } from "./a2ui/model.js"
export type { Json as A2UIJson } from "./a2ui/data.js"

export interface A2UIAction {
  version: "1.0"
  action: {
    name: string
    surfaceId: string
    sourceComponentId: string
    timestamp: string
    context: JsonObject
    userMessage?: string
  }
}
export interface A2UIOptions { onAction: (message: A2UIAction) => void }
export interface A2UIRenderer {
  receive(message: unknown): void
  getSurface(surfaceId: string): HTMLElement | undefined
  dispose(): void
}
interface Rendered {
  component: Component["component"]
  element: Box | Span | Button
  content?: globalThis.Text
  listener?: EventListener
}
interface Surface {
  host: Box
  definitions: Map<string, Component>
  model: Json
  rendered: Map<string, Rendered>
  ready: boolean
}

const justifications = {
  start: "start", center: "center", end: "end",
  spaceBetween: "space-between", spaceAround: "space-around", spaceEvenly: "space-evenly",
} as const

function reconcile(parent: Node, desired: readonly Node[]): void {
  const keep = new Set(desired)
  for (const child of [...parent.childNodes]) if (!keep.has(child)) parent.removeChild(child)
  desired.forEach((child, index) => {
    if (parent.childNodes[index] !== child) parent.insertBefore(child, parent.childNodes[index] ?? null)
  })
}

function release(record: Rendered): void {
  if (record.listener) record.element.removeEventListener("click", record.listener)
  record.element.remove()
}

/** Optional Web renderer. The host owns transport, authorization and error reporting. */
export function createA2UIRenderer(container: HTMLElement, options: A2UIOptions): A2UIRenderer {
  if (!(container instanceof HTMLElement) || container.ownerDocument !== document) fail("container must belong to the current document.")
  if (typeof options?.onAction !== "function") fail("onAction is required.")
  const surfaces = new Map<string, Surface>()
  const usedIds = new Set<string>()
  let disposed = false

  function render(surfaceId: string, surface: Surface): void {
    surface.host.setAttribute("aria-busy", String(!surface.ready))
    if (!surface.ready) return
    const active = document.activeElement
    const hadFocus = active instanceof HTMLElement && surface.host.contains(active)
    const retained = new Set<string>()

    function materialize(id: string): Box | Span | Button {
      retained.add(id)
      const definition = surface.definitions.get(id)!
      let record = surface.rendered.get(id)
      if (record && record.component !== definition.component) {
        release(record)
        surface.rendered.delete(id)
        record = undefined
      }
      if (!record) {
        const element = definition.component === "Text" ? new Span() : definition.component === "Button" ? new Button() : new Box()
        record = { component: definition.component, element }
        element.dataset.a2uiComponent = id
        if (element instanceof Span) {
          record.content = document.createTextNode("")
          element.append(record.content)
        }
        if (element instanceof Button) {
          record.listener = event => {
            if (disposed || !surface.ready || !element.isConnected || surfaces.get(surfaceId) !== surface || !surface.host.contains(element)
              || event.defaultPrevented || !element.control || !event.composedPath().includes(element.control)) return
            const current = surface.definitions.get(id)
            if (current?.component !== "Button") return
            const context: JsonObject = {}
            for (const [key, value] of Object.entries(current.event.context)) context[key] = snapshot(resolve(value, surface.model) ?? null)
            options.onAction({
              version: "1.0",
              action: {
                name: current.event.name, surfaceId, sourceComponentId: id,
                timestamp: new Date().toISOString(), context,
                ...(current.event.userMessage === undefined ? {} : { userMessage: text(current.event.userMessage, surface.model) }),
              },
            })
          }
          element.addEventListener("click", record.listener)
        }
        surface.rendered.set(id, record)
      }
      const element = record.element
      if (definition.component === "Text") {
        const value = text(definition.text, surface.model)
        if (record.content!.data !== value) record.content!.data = value
        element.className = `m-a2ui-text m-a2ui-${definition.variant}`
        element.style.fontSize = definition.variant === "caption" ? "0.8em" : ""
      } else if (definition.component === "Button" && element instanceof Button) {
        element.type = definition.variant === "primary" ? "primary" : "default"
        element.appearance = definition.variant === "borderless" ? "text" : "default"
        reconcile(element.control ?? element, [materialize(definition.child)])
      } else if (element instanceof Box && (definition.component === "Row" || definition.component === "Column")) {
        element.className = definition.component === "Row" ? "m-a2ui-row" : "m-a2ui-column"
        element.display = "flex"
        element.direction = definition.component === "Row" ? "row" : "column"
        element.justify = justifications[definition.justify]
        element.align = definition.align
        element.gap = "8"
        element.width = "100%"
        reconcile(element, children(definition).map(materialize))
      }
      return element
    }

    reconcile(surface.host, [materialize("root")])
    for (const [id, record] of surface.rendered) if (!retained.has(id)) {
      release(record)
      surface.rendered.delete(id)
    }
    if (hadFocus && document.activeElement !== active) {
      if (surface.host.contains(active)) active.focus({ preventScroll: true })
      else surface.host.focus({ preventScroll: true })
    }
  }

  function remove(surface: Surface): void {
    for (const record of surface.rendered.values()) release(record)
    surface.rendered.clear()
    surface.host.remove()
  }

  return {
    receive(input) {
      if (disposed) fail("renderer is disposed.")
      const { kind, body, surfaceId } = message(input)
      if (kind === "createSurface") {
        if (usedIds.has(surfaceId)) fail("surface IDs cannot be reused during a renderer's lifetime.")
        if (surfaces.size >= 16 || usedIds.size >= 1_024) fail("renderer exceeds its surface limit.")
        const definitions = body.components === undefined ? new Map<string, Component>() : components(body.components)
        const model = body.dataModel ?? {}
        const ready = validate(definitions, model)
        const host = new Box()
        host.className = "m-a2ui-surface"
        host.tabIndex = -1
        const surface: Surface = { host, definitions, model, ready, rendered: new Map() }
        surfaces.set(surfaceId, surface)
        usedIds.add(surfaceId)
        container.append(host)
        render(surfaceId, surface)
        return
      }
      const surface = surfaces.get(surfaceId)
      if (!surface) fail("unknown surface.")
      if (kind === "deleteSurface") {
        remove(surface)
        surfaces.delete(surfaceId)
        return
      }
      const definitions = kind === "updateComponents" ? components(body.components, surface.definitions) : surface.definitions
      const model = kind === "updateDataModel" ? update(surface.model, body.path, body.value!) : surface.model
      const ready = validate(definitions, model)
      surface.definitions = definitions
      surface.model = model
      surface.ready = ready
      render(surfaceId, surface)
    },
    getSurface(surfaceId) { return surfaces.get(surfaceId)?.host },
    dispose() {
      for (const surface of surfaces.values()) remove(surface)
      surfaces.clear()
      usedIds.clear()
      disposed = true
    },
  }
}
