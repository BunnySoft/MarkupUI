export { MButton } from "./button.js"
export { MButtonGroup } from "./group.js"
export { buttonDefinition, buttonGroupDefinition } from "./model.js"

import { MButton } from "./button.js"
import { MButtonGroup } from "./group.js"
import { buttonDefinition, buttonGroupDefinition } from "./model.js"

export function registerButton(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const registrations = [
    ["m-button", MButton, buttonDefinition.type],
    ["m-button-group", MButtonGroup, buttonGroupDefinition.type],
  ] as const
  for (const [name, constructor, type] of registrations) {
    const existing = registry.get(name)
    if (existing && existing !== constructor) {
      throw new Error(
        `'${name}' is already defined with a different ${type} renderer. `
        + `Load the primary ${type} component before the legacy MarkupUI bundle.`,
      )
    }
  }
  for (const [name, constructor] of registrations) {
    if (!registry.get(name)) registry.define(name, constructor)
  }
}

if (typeof customElements !== "undefined") registerButton()
