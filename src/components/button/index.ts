export { MuiButton } from "./button.js"
export { MuiButtonGroup } from "./group.js"

import { MuiButton } from "./button.js"
import { MuiButtonGroup } from "./group.js"

export function registerButton(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  for (const [name, constructor] of [
    ["mui-button", MuiButton],
    ["mui-button-group", MuiButtonGroup],
  ] as const) {
    const existing = registry.get(name)
    if (existing && existing !== constructor) {
      throw new Error(`'${name}' is already defined. Load the Button component before the legacy MarkupUI bundle.`)
    }
  }
  if (!registry.get("mui-button")) registry.define("mui-button", MuiButton)
  if (!registry.get("mui-button-group")) registry.define("mui-button-group", MuiButtonGroup)
}

if (typeof customElements !== "undefined") registerButton()
