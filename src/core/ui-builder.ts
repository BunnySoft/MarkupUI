import type { ViewElement, ViewStyle } from "./index.js"

export type UIChild = Node | string | number | ElementBuilder<ViewElement>

/** Construction helpers around one real element, not a virtual view description. */
export class ElementBuilder<T extends ViewElement> {
  public constructor(protected readonly element: T, children: readonly UIChild[] = []) {
    const nodes = children.map(child => {
      if (child instanceof ElementBuilder) return child.build()
      if (child instanceof Node) return child
      if (typeof child === "string" || typeof child === "number" && Number.isFinite(child)) {
        return element.ownerDocument.createTextNode(String(child))
      }
      throw new TypeError("UI children must be nodes, builders, strings or finite numbers.")
    })
    element.append(...nodes)
  }

  public build(): T { return this.element }

  /** Append to an existing mount point; never replace its other children. */
  public mount(target: Element | string): T {
    const parent = typeof target === "string"
      ? this.element.ownerDocument.querySelector(target)
      : target
    if (!(parent instanceof Element)) throw new TypeError("UI mount target must be an existing element.")
    parent.append(this.element)
    return this.element
  }

  public id(value: string): this { this.element.id = value; return this }
  public className(value: string): this { this.element.className = value; return this }
  public on(type: string, listener: EventListener, options?: AddEventListenerOptions | boolean): this {
    this.element.addEventListener(type, listener, options)
    return this
  }

  public style(value: ViewStyle): this { this.element.viewStyle = value; return this }
  public display(value: NonNullable<ViewStyle["display"]>): this { return this.style({ display: value }) }
  public direction(value: NonNullable<ViewStyle["direction"]>): this { return this.style({ direction: value }) }
  public align(value: NonNullable<ViewStyle["align"]>): this { return this.style({ align: value }) }
  public justify(value: NonNullable<ViewStyle["justify"]>): this { return this.style({ justify: value }) }
  public gap(value: NonNullable<ViewStyle["gap"]>): this { return this.style({ gap: value }) }
  public padding(value: NonNullable<ViewStyle["padding"]>): this { return this.style({ padding: value }) }
  public width(value: NonNullable<ViewStyle["width"]>): this { return this.style({ width: value }) }
}
