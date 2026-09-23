import { sanitizeHtml, type HtmlPolicy } from "../security/index.js"
import { requestHtml } from "../security/request.js"

export class MQuery {
  private controller: AbortController | undefined
  public constructor(private readonly elements: readonly Element[]) {}

  public each(callback: (element: Element, index: number) => void): this {
    this.elements.forEach(callback)
    return this
  }

  public first(): Element | undefined {
    return this.elements[0]
  }

  public toArray(): Element[] {
    return [...this.elements]
  }

  public on(type: string, listener: EventListener): this {
    this.elements.forEach((element) => element.addEventListener(type, listener))
    return this
  }

  public addClass(...names: string[]): this {
    this.elements.forEach((element) => element.classList.add(...names))
    return this
  }

  public removeClass(...names: string[]): this {
    this.elements.forEach((element) => element.classList.remove(...names))
    return this
  }

  public text(value?: string): string | this {
    if (value === undefined) return this.elements[0]?.textContent ?? ""
    this.elements.forEach((element) => { element.textContent = value })
    return this
  }

  public async load(url: string, policy?: HtmlPolicy): Promise<this> {
    this.cancelLoad()
    const document = this.elements[0]?.ownerDocument
    if (!document) return this
    const controller = this.controller = new AbortController()
    try {
      const html = await requestHtml(url, document, policy, controller.signal)
      if (this.controller === controller) this.elements.forEach(element => {
        element.replaceChildren(sanitizeHtml(html, element.ownerDocument, policy))
      })
      return this
    } finally { if (this.controller === controller) this.controller = undefined }
  }

  public cancelLoad(): this { this.controller?.abort(); this.controller = undefined; return this }
}

export function query(target: string | Element | Iterable<Element>): MQuery {
  return new MQuery(
    typeof target === "string"
      ? [...document.querySelectorAll(target)]
      : target instanceof Element
        ? [target]
        : [...target],
  )
}

export type MQueryMethod = (this: MQuery, ...args: unknown[]) => unknown

export function extendQuery(name: string, method: MQueryMethod): void {
  if (!name.trim()) throw new Error("Query extension name is required.")
  if (name in MQuery.prototype) {
    throw new Error(`MQuery method '${name}' is already registered.`)
  }
  Object.defineProperty(MQuery.prototype, name, {
    configurable: false,
    enumerable: false,
    value: method,
    writable: false,
  })
}

export function setHtml(target: Element, html: string, policy?: HtmlPolicy): void {
  target.replaceChildren(sanitizeHtml(html, target.ownerDocument, policy))
}
