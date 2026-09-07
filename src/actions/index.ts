import type { MuiStore } from "../state/index.js"

export interface ActionContext {
  readonly element: Element
  readonly event: Event
  readonly store?: MuiStore
  readonly parameters: Readonly<Record<string, string>>
}

export type MuiAction = (context: ActionContext) => void | Promise<void>

const actions = new Map<string, MuiAction>()

export function registerAction(name: string, action: MuiAction): void {
  if (!name.trim()) throw new Error("Action name is required.")
  actions.set(name, action)
}

export function invokeAction(name: string, context: ActionContext): Promise<void> {
  const action = actions.get(name)
  if (action === undefined) return Promise.reject(new Error(`Unknown action '${name}'.`))
  return Promise.resolve(action(context))
}

export function installActions(root: ParentNode, store?: MuiStore): () => void {
  const listener = (event: Event) => {
    const target = event.target instanceof Element
      ? event.target.closest("[mui-action]")
      : null
    if (target === null || !root.contains(target)) return
    const name = target.getAttribute("mui-action")
    if (!name) return
    const parameters = Object.fromEntries(
      [...target.attributes]
        .filter((attribute) => attribute.name.startsWith("mui-param-"))
        .map((attribute) => [attribute.name.slice(10), attribute.value]),
    )
    const context: ActionContext = {
      element: target,
      event,
      parameters,
      ...(store === undefined ? {} : { store }),
    }
    void invokeAction(name, context)
      .catch((error: unknown) => {
        target.dispatchEvent(new CustomEvent("mui:error", {
          bubbles: true,
          detail: error,
        }))
      })
  }
  root.addEventListener("click", listener)
  return () => root.removeEventListener("click", listener)
}

registerAction("open", ({ parameters }) => {
  const target = parameters["target"] ? document.querySelector(parameters["target"]) : null
  const method = target === null ? undefined : Reflect.get(target, "open")
  if (typeof method === "function") Reflect.apply(method, target, [])
})

registerAction("close", ({ element, parameters }) => {
  const target = parameters["target"]
    ? document.querySelector(parameters["target"])
    : element.closest("mui-dialog,mui-drawer")
  const method = target === null ? undefined : Reflect.get(target, "close")
  if (typeof method === "function") Reflect.apply(method, target, [])
})

registerAction("validate", ({ element }) => {
  const form = element.closest("mui-form")
  const method = form === null ? undefined : Reflect.get(form, "validate")
  if (typeof method === "function") Reflect.apply(method, form, [])
})
