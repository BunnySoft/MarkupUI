import { MElement } from "../core/element.js"
import { MApp, MField, MSemantic, MTheme } from "./foundation.js"
import { MAutocomplete, MSlider } from "./forms.js"
import { MAccordionItem, MInclude } from "./dynamic.js"
import { MSteps, MStatistic, MTree, MTreeNode } from "./navigation.js"
import { MProgress } from "./content.js"
import { builtInStyles } from "./styles.js"

const definitions: ReadonlyArray<readonly [string, CustomElementConstructor]> = [
  ["m-app", MApp],
  ["m-theme", MTheme],
  ["m-header", class extends MSemantic { public override connectedCallback(): void { this.setAttribute("data-role", "banner"); super.connectedCallback() } }],
  ["m-main", class extends MSemantic { public override connectedCallback(): void { this.setAttribute("data-role", "main"); super.connectedCallback() } }],
  ["m-section", class extends MSemantic {}],
  ["m-field", MField],
  ["m-stack", class extends MElement {}],
  ["m-row", class extends MElement {}],
  ["m-wrap", class extends MElement {}],
  ["m-center", class extends MElement {}],
  ["m-spacer", class extends MElement { public connectedCallback(): void { this.style.flex = "1" } }],
  ["m-progress", MProgress],
  ["m-option", class extends MElement {}],
  ["m-autocomplete", MAutocomplete],
  ["m-slider", MSlider],
  ["m-accordion", class extends MElement {}],
  ["m-accordion-item", MAccordionItem],
  ["m-steps", MSteps],
  ["m-step", class extends MElement {}],
  ["m-statistic", MStatistic],
  ["m-tree", MTree],
  ["m-tree-node", MTreeNode],
  ["m-notification", class extends MElement {}],
  ["m-include", MInclude],
]

export const builtInElementNames: readonly string[] = definitions.map(([name]) => name)

export function registerElements(registry: CustomElementRegistry = customElements): void {
  for (const [name, constructor] of definitions) {
    registerElement(name, constructor, registry)
  }
}

export function registerElement(
  name: string,
  constructor: CustomElementConstructor,
  registry: CustomElementRegistry = customElements,
): void {
  if (!name.startsWith("m-")) {
    throw new Error("Use a 'm-' element name.")
  }
  if (!registry.get(name)) registry.define(name, constructor)
}

export function installStyles(document: Document = globalThis.document): void {
  if (document.getElementById("m-styles")) return
  const style = document.createElement("style")
  style.id = "m-styles"
  style.textContent = builtInStyles
  document.head.append(style)
}
