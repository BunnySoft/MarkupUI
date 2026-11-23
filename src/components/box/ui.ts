import { ElementBuilder, type UIChild } from "../../core/ui-builder.js"
import { Box, Span } from "./index.js"

export class SpanBuilder extends ElementBuilder<Span> {
  public color(value: string | null): this { this.element.color = value; return this }
  public weight(value: string | null): this { this.element.weight = value; return this }
}

export function box(...children: UIChild[]): ElementBuilder<Box> {
  return new ElementBuilder(new Box(), children)
}

export function span(...children: UIChild[]): SpanBuilder {
  return new SpanBuilder(new Span(), children)
}
