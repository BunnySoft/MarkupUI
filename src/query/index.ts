import { isSafeUri, sanitizeHtml, type HtmlPolicy } from "../security/index.js"

export class MuiQuery {
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
    if (!isSafeUri(url, policy)) throw new Error(`URL '${url}' is not allowed.`)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Request failed with HTTP ${response.status}.`)
    const html = await response.text()
    this.elements.forEach((element) => {
      element.replaceChildren(sanitizeHtml(html, element.ownerDocument, policy))
    })
    return this
  }
}

export function query(target: string | Element | Iterable<Element>): MuiQuery {
  return new MuiQuery(
    typeof target === "string"
      ? [...document.querySelectorAll(target)]
      : target instanceof Element
        ? [target]
        : [...target],
  )
}

export type MuiQueryMethod = (this: MuiQuery, ...args: unknown[]) => unknown

export function extendQuery(name: string, method: MuiQueryMethod): void {
  if (!name.trim()) throw new Error("Query extension name is required.")
  if (name in MuiQuery.prototype) {
    throw new Error(`MuiQuery method '${name}' is already registered.`)
  }
  Object.defineProperty(MuiQuery.prototype, name, {
    configurable: false,
    enumerable: false,
    value: method,
    writable: false,
  })
}

export function setHtml(target: Element, html: string, policy?: HtmlPolicy): void {
  target.replaceChildren(sanitizeHtml(html, target.ownerDocument, policy))
}
