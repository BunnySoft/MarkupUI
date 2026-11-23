import { ElementBuilder, type UIChild } from "../../core/ui-builder.js"
import { Heading, Link } from "./index.js"

export class HeadingBuilder extends ElementBuilder<Heading> {
  public level(value: number): this { this.element.level = value; return this }
}

export class LinkBuilder extends ElementBuilder<Link> {
  public href(value: string | null): this { this.element.href = value; return this }
  public target(value: string | null): this { this.element.target = value; return this }
  public rel(value: string | null): this { this.element.rel = value; return this }
}

export function heading(...children: UIChild[]): HeadingBuilder {
  return new HeadingBuilder(new Heading(), children)
}

export function link(...children: UIChild[]): LinkBuilder {
  return new LinkBuilder(new Link(), children)
}
