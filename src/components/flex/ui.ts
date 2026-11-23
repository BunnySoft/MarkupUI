import { ElementBuilder, type UIChild } from "../../core/ui-builder.js"
import { Flex } from "./index.js"

export class FlexBuilder extends ElementBuilder<Flex> {
  public vertical(value = true): this { this.element.vertical = value; return this }
  public wrap(value = true): this { this.element.wrap = value; return this }
}

export function flex(...children: UIChild[]): FlexBuilder {
  return new FlexBuilder(new Flex(), children)
}
