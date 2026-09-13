import { MElement } from "../core/element.js"
import { MApp, MField, MGrid, MSemantic, MTheme } from "./foundation.js"
import { MAutocomplete, MSlider } from "./forms.js"
import { MAccordionItem, MInclude } from "./dynamic.js"
import { MDialog, MDrawer, MPopover, MTooltip } from "./overlays.js"
import { MMenu, MMenuItem, MPagination, MSteps, MTabs, MTab, MDescriptions, MDescriptionItem, MStatistic, MTree, MTreeNode } from "./navigation.js"
import { MEmpty, MLayout, MProgress, MSkeleton, MTag } from "./content.js"
import { builtInStyles } from "./styles.js"

const definitions: ReadonlyArray<readonly [string, CustomElementConstructor]> = [
  ["m-app", MApp],
  ["m-theme", MTheme],
  ["m-header", class extends MSemantic { public override connectedCallback(): void { this.setAttribute("data-role", "banner"); super.connectedCallback() } }],
  ["m-main", class extends MSemantic { public override connectedCallback(): void { this.setAttribute("data-role", "main"); super.connectedCallback() } }],
  ["m-section", class extends MSemantic {}],
  ["m-field", MField],
  ["m-stack", class extends MLayout {}],
  ["m-row", class extends MLayout {}],
  ["m-wrap", class extends MLayout {}],
  ["m-center", class extends MLayout {}],
  ["m-spacer", class extends MLayout { public override connectedCallback(): void { super.connectedCallback(); this.style.flex = "1" } }],
  ["m-alert", class extends MElement {}],
  ["m-badge", class extends MElement {}],
  ["m-tag", MTag],
  ["m-progress", MProgress],
  ["m-skeleton", MSkeleton],
  ["m-empty", MEmpty],
  ["m-spin", class extends MElement { public connectedCallback(): void { this.setAttribute("role", "status"); this.setAttribute("aria-label", this.getAttribute("label") ?? "Loading") } }],
  ["m-option", class extends MElement {}],
  ["m-autocomplete", MAutocomplete],
  ["m-slider", MSlider],
  ["m-grid", MGrid],
  ["m-tabs", MTabs],
  ["m-tab", MTab],
  ["m-accordion", class extends MElement {}],
  ["m-accordion-item", MAccordionItem],
  ["m-menu", MMenu],
  ["m-menu-item", MMenuItem],
  ["m-pagination", MPagination],
  ["m-steps", MSteps],
  ["m-step", class extends MElement {}],
  ["m-list", class extends MElement { public connectedCallback(): void { this.setAttribute("role", "list") } }],
  ["m-list-item", class extends MElement { public connectedCallback(): void { this.setAttribute("role", "listitem") } }],
  ["m-descriptions", MDescriptions],
  ["m-description-item", MDescriptionItem],
  ["m-statistic", MStatistic],
  ["m-tree", MTree],
  ["m-tree-node", MTreeNode],
  ["m-dialog", MDialog],
  ["m-dialog-header", class extends MElement {}],
  ["m-dialog-content", class extends MElement {}],
  ["m-dialog-footer", class extends MElement {}],
  ["m-drawer", MDrawer],
  ["m-drawer-header", class extends MElement {}],
  ["m-drawer-content", class extends MElement {}],
  ["m-drawer-footer", class extends MElement {}],
  ["m-tooltip", MTooltip],
  ["m-popover", MPopover],
  ["m-popover-trigger", class extends MElement {}],
  ["m-popover-content", class extends MElement {}],
  ["m-message", class extends MElement {}],
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
