import { binding, choice, fail, identifier, keys, object, resolve, snapshot } from "./data.js"
import type { Binding, Json, JsonObject } from "./data.js"

export const A2UI_CATALOG_ID = "urn:markup-ui:a2ui:minimal:1"
const alignments = ["start", "center", "end", "stretch"] as const
const justifications = ["start", "center", "end", "spaceBetween", "spaceAround", "spaceEvenly"] as const

interface Base { id: string }
interface Text extends Base { component: "Text"; text: string | Binding; variant: "body" | "caption" }
interface Button extends Base {
  component: "Button"
  child: string
  variant: "default" | "primary" | "borderless"
  event: { name: string; context: JsonObject; userMessage?: string | Binding }
}
interface Layout extends Base {
  component: "Row" | "Column"
  children: string[]
  align: typeof alignments[number]
  justify: typeof justifications[number]
}
export type Component = Text | Button | Layout

function dynamicString(value: Json | undefined): string | Binding {
  return typeof value === "string" ? value : binding(object(value))
}

function context(value: Json | undefined): JsonObject {
  const result = value === undefined ? {} : object(value)
  for (const item of Object.values(result)) {
    if (item === null) fail("literal action context values cannot be null.")
    if (typeof item !== "object" || Array.isArray(item)) continue
    if (Object.hasOwn(item, "@path")) binding(item)
    else if (Object.keys(item).some(key => /^@([^@]|$)/u.test(key))) fail("renderer function calls and reserved context fields are unsupported.")
  }
  return result
}

function component(value: Json): Component {
  const source = object(value)
  const id = identifier(source.id)
  const common = ["id", "component", "@catalogId"]
  if (source["@catalogId"] !== undefined && source["@catalogId"] !== A2UI_CATALOG_ID) fail("unsupported component catalog.")
  switch (source.component) {
    case "Text":
      keys(source, [...common, "text", "variant"], ["id", "component", "text"])
      return { id, component: "Text", text: dynamicString(source.text), variant: choice(source.variant, ["body", "caption"], "body") }
    case "Button": {
      keys(source, [...common, "child", "variant", "action"], ["id", "component", "child", "action"])
      const action = object(source.action)
      keys(action, ["event"], ["event"])
      const event = object(action.event)
      keys(event, ["name", "context", "userMessage"], ["name"])
      return {
        id, component: "Button", child: identifier(source.child),
        variant: choice(source.variant, ["default", "primary", "borderless"], "default"),
        event: {
          name: identifier(event.name), context: context(event.context),
          ...(event.userMessage === undefined ? {} : { userMessage: dynamicString(event.userMessage) }),
        },
      }
    }
    case "Row":
    case "Column":
      keys(source, [...common, "children", "align", "justify"], ["id", "component", "children"])
      if (!Array.isArray(source.children)) fail("only static child ID arrays are supported.")
      return {
        id, component: source.component, children: source.children.map(identifier),
        align: choice(source.align, alignments, "stretch"),
        justify: choice(source.justify, justifications, "start"),
      }
    default: return fail("unsupported component.")
  }
}

export function components(value: Json | undefined, current = new Map<string, Component>()): Map<string, Component> {
  if (!Array.isArray(value) || !value.length || value.length > 256) fail("components must contain 1 to 256 definitions.")
  const next = new Map(current)
  const ids = new Set<string>()
  for (const item of value) {
    const definition = component(item)
    if (ids.has(definition.id)) fail("duplicate component ID in a message.")
    ids.add(definition.id)
    next.set(definition.id, definition)
  }
  if (next.size > 256) fail("surface exceeds 256 component definitions.")
  return next
}

export function children(definition: Component): string[] {
  return definition.component === "Text" ? [] : definition.component === "Button" ? [definition.child] : definition.children
}

export function text(value: string | Binding, model: Json): string {
  const result = resolve(value, model)
  if (result === undefined || result === null) return ""
  if (typeof result !== "string") fail("text binding must resolve to a string.")
  return result
}

/** Validate the entire candidate graph, including unreachable streamed definitions. */
export function validate(definitions: Map<string, Component>, model: Json): boolean {
  const parents = new Set<string>()
  for (const definition of definitions.values()) {
    if (definition.component === "Text") text(definition.text, model)
    if (definition.component === "Button" && definition.event.userMessage !== undefined) text(definition.event.userMessage, model)
    for (const child of children(definition)) {
      if (child === "root" || parents.has(child)) fail("components must have one parent; root cannot be a child.")
      parents.add(child)
      if (definition.component === "Button" && definitions.has(child) && definitions.get(child)!.component !== "Text") {
        fail("Button child must be Text.")
      }
    }
  }
  const visiting = new Set<string>()
  function visit(id: string, depth: number): boolean {
    if (depth > 32 || visiting.has(id)) fail("cyclic or excessive component tree.")
    const definition = definitions.get(id)
    if (!definition) return false
    visiting.add(id)
    let complete = true
    for (const child of children(definition)) if (!visit(child, depth + 1)) complete = false
    visiting.delete(id)
    return complete
  }
  const ready = visit("root", 0)
  for (const id of definitions.keys()) visit(id, 0)
  return ready
}

export function message(input: unknown): { kind: string; body: JsonObject; surfaceId: string } {
  const source = object(snapshot(input))
  const kinds = ["createSurface", "updateComponents", "updateDataModel", "deleteSurface"]
  if (source.version !== "1.0") fail('only version "1.0" is supported.')
  const kind = Object.keys(source).find(key => kinds.includes(key))
  if (!kind || Object.keys(source).length !== 2) fail("expected exactly one supported message.")
  keys(source, ["version", kind], ["version", kind])
  const body = object(source[kind])
  const surfaceId = identifier(body.surfaceId)
  switch (kind) {
    case "createSurface":
      keys(body, ["surfaceId", "catalogId", "components", "dataModel", "sendDataModel"], ["surfaceId"])
      if (body.catalogId !== undefined && body.catalogId !== A2UI_CATALOG_ID) fail("unsupported catalog; negotiate the MarkupUI minimal catalog.")
      if (body.sendDataModel !== undefined && body.sendDataModel !== false) fail("sendDataModel is unsupported.")
      if (body.dataModel !== undefined) object(body.dataModel)
      break
    case "updateComponents": keys(body, ["surfaceId", "components"], ["surfaceId", "components"]); break
    case "updateDataModel": keys(body, ["surfaceId", "path", "value"], ["surfaceId", "value"]); break
    case "deleteSurface": keys(body, ["surfaceId"], ["surfaceId"]); break
  }
  return { kind, body, surfaceId }
}
