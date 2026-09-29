import { ViewElement } from "../core/index.js"
import { App, Field, Semantic, Theme } from "./foundation.js"
import { AccordionItem, Include } from "./dynamic.js"
import { builtInStyles } from "./styles.js"

const definitions = [
  App,
  Theme,
  class Header extends Semantic { public static readonly tag = "m-header"; public override connectedCallback(): void { if (!this.hasAttribute("data-role")) this.setAttribute("data-role", "banner"); super.connectedCallback() } },
  class Main extends Semantic { public static readonly tag = "m-main"; public override connectedCallback(): void { if (!this.hasAttribute("data-role")) this.setAttribute("data-role", "main"); super.connectedCallback() } },
  class Section extends Semantic { public static readonly tag = "m-section" },
  Field,
  class Stack extends ViewElement { public static readonly tag = "m-stack" },
  class Row extends ViewElement { public static readonly tag = "m-row" },
  class Wrap extends ViewElement { public static readonly tag = "m-wrap" },
  class Center extends ViewElement { public static readonly tag = "m-center" },
  class Spacer extends ViewElement { public static readonly tag = "m-spacer" },
  class Option extends ViewElement { public static readonly tag = "m-option" },
  class Accordion extends ViewElement { public static readonly tag = "m-accordion" },
  AccordionItem,
  Include,
]

export const builtInElementNames: readonly string[] = definitions.map(constructor => constructor.tag)

export function registerElements(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register(definitions, registry)
}

export function registerElement(
  name: string,
  constructor: CustomElementConstructor & { readonly tag: string },
  registry: Pick<CustomElementRegistry, "get" | "define"> = customElements,
): void {
  if (name !== constructor.tag) {
    throw new TypeError("Use the element's own m-* tag.")
  }
  ViewElement.register([constructor], registry)
}

export function installStyles(document: Document = globalThis.document): void {
  if (document.getElementById("m-styles")) return
  const style = document.createElement("style")
  style.id = "m-styles"
  style.textContent = builtInStyles
  document.head.append(style)
}
