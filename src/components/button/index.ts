export { Button } from "./button.js"
export { ButtonGroup } from "./group.js"
export type {
  ButtonType, ButtonSize, ButtonAppearance, ButtonShape, ButtonAttrType,
  ButtonIconPlacement, ButtonFormMethod, ButtonFormEncType,
} from "./model.js"

import { Button } from "./button.js"
import { ButtonGroup } from "./group.js"
import { ViewElement } from "../../core/index.js"

export function registerButton(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Button, ButtonGroup], registry)
}

if (typeof customElements !== "undefined") registerButton()
