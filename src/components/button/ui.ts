import { ElementBuilder, type UIChild } from "../../core/ui-builder.js"
import { Button } from "./index.js"
import type { ButtonType, ButtonAppearance, ButtonSize } from "./model.js"

export class ButtonBuilder extends ElementBuilder<Button> {
  public type(value: ButtonType): this { this.element.type = value; return this }
  public appearance(value: ButtonAppearance): this { this.element.appearance = value; return this }
  public size(value: ButtonSize): this { this.element.size = value; return this }
  public disabled(value = true): this { this.element.disabled = value; return this }
  public loading(value = true): this { this.element.loading = value; return this }
}

export function button(...children: UIChild[]): ButtonBuilder {
  return new ButtonBuilder(new Button(), children)
}
