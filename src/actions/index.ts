import type { Binding, MStore } from "../state/index.js"

export interface ActionContext {
  readonly element: Element
  readonly event: Event
  readonly store?: MStore
  readonly parameters: Readonly<Record<string, string>>
  readonly arguments: Readonly<Record<string, unknown>>
}

export type MAction = (context: ActionContext) => void | Promise<void>

const actions = new Map<string, MAction>()
const roots = new WeakSet<ParentNode>()
const eventOwners = new WeakMap<Event, ParentNode>()

export function registerAction(name: string, action: MAction): void {
  if (!name.trim()) throw new Error("Action name is required.")
  actions.set(name, action)
}

export async function invokeAction(name: string, context: ActionContext): Promise<void> {
  const action = actions.get(name)
  if (action === undefined) throw new Error(`Unknown action '${name}'.`)
  await action(context)
}

/** Scoped m-arg-* paths require an explicitly supplied live Binding, not just a store. */
export function installActions(root: ParentNode, source?: MStore | Binding): () => void {
  if (roots.has(root)) throw new Error("Actions are already installed on this root.")
  const binding = typeof source === "function" ? source : undefined
  const store = typeof source === "function" ? source.store : source
  // Capture fixes ownership for this dispatch even if its action disposes the installation.
  const capture = (event: Event) => { eventOwners.set(event, root) }
  const listener = (event: Event) => {
    const path = event.composedPath()
    if (eventOwners.get(event) !== root) return
    const target = path.slice(0, path.indexOf(root) + 1)
      .find((node): node is Element => node instanceof Element && node.hasAttribute("m-action"))
    if (!target || !root.contains(target)) return
    const name = target.getAttribute("m-action")
    if (!name) return
    const report = (error: unknown) => {
      target.dispatchEvent(new CustomEvent("m:error", { bubbles: true, detail: error }))
    }
    try {
      const attributes = [...target.attributes]
      const parameters = Object.fromEntries(attributes
        .filter(attribute => attribute.name.startsWith("m-param-"))
        .map(attribute => [attribute.name.slice(8), attribute.value]))
      const args = attributes.filter(attribute => attribute.name.startsWith("m-arg-"))
      if (args.length && !binding) throw new TypeError("Scoped action arguments require an explicit Binding.")
      const values = Object.fromEntries(args.map(attribute => {
        const key = attribute.name.slice(6)
        if (!/^[a-z][a-z0-9]*(?:-[a-z][a-z0-9]*)*$/.test(key) || ["constructor", "prototype"].includes(key)) {
          throw new TypeError("Invalid action argument name.")
        }
        return [key, binding!.read(target, attribute.value)]
      }))
      void invokeAction(name, {
        element: target,
        event,
        parameters: Object.freeze(parameters),
        arguments: Object.freeze(values),
        ...(store === undefined ? {} : { store }),
      })
        .catch(report)
    } catch (error) { report(error) }
  }
  roots.add(root)
  root.addEventListener("click", capture, true)
  root.addEventListener("click", listener)
  let disposed = false
  return () => {
    if (disposed) return
    disposed = true
    roots.delete(root)
    root.removeEventListener("click", capture, true)
    root.removeEventListener("click", listener)
  }
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
