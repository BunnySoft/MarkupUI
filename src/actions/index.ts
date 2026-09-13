import type { MStore } from "../state/index.js"

export interface ActionContext {
  readonly element: Element
  readonly event: Event
  readonly store?: MStore
  readonly parameters: Readonly<Record<string, string>>
}

export type MAction = (context: ActionContext) => void | Promise<void>

const actions = new Map<string, MAction>()

export function registerAction(name: string, action: MAction): void {
  if (!name.trim()) throw new Error("Action name is required.")
  actions.set(name, action)
}

export function invokeAction(name: string, context: ActionContext): Promise<void> {
  const action = actions.get(name)
  if (action === undefined) return Promise.reject(new Error(`Unknown action '${name}'.`))
  return Promise.resolve(action(context))
}

export function installActions(root: ParentNode, store?: MStore): () => void {
  const listener = (event: Event) => {
    const target = event.target instanceof Element
      ? event.target.closest("[m-action]")
      : null
    if (target === null || !root.contains(target)) return
    const name = target.getAttribute("m-action")
    if (!name) return
    const parameters = Object.fromEntries(
      [...target.attributes]
        .filter((attribute) => attribute.name.startsWith("m-param-"))
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
        target.dispatchEvent(new CustomEvent("m:error", {
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
    : element.closest("m-dialog,m-drawer")
  const method = target === null ? undefined : Reflect.get(target, "close")
  if (typeof method === "function") Reflect.apply(method, target, [])
})

registerAction("validate", async ({ element }) => {
  const form = element.closest("m-form")
  const method = form === null ? undefined : Reflect.get(form, "validate")
  if (typeof method === "function") await Reflect.apply(method, form, [])
})
