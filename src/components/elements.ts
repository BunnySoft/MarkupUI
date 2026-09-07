import { MuiElement } from "../core/element.js"
import { MuiApp, MuiField, MuiGrid, MuiHeading, MuiLink, MuiSemantic, MuiTheme } from "./foundation.js"
import { MuiAutocomplete, MuiCheckbox, MuiForm, MuiFormItem, MuiInput, MuiRadio, MuiRadioGroup, MuiSelect, MuiSlider, MuiSwitch, MuiTextarea } from "./forms.js"
import { MuiAccordionItem, MuiInclude } from "./dynamic.js"
import { MuiDialog, MuiDrawer, MuiPopover, MuiTooltip } from "./overlays.js"
import { MuiMenu, MuiMenuItem, MuiPagination, MuiSteps, MuiTabs, MuiTab, MuiDescriptions, MuiDescriptionItem, MuiStatistic, MuiTree, MuiTreeNode } from "./navigation.js"
import { MuiAvatar, MuiButton, MuiCard, MuiEmpty, MuiLayout, MuiProgress, MuiSkeleton, MuiTag } from "./content.js"
import { builtInStyles } from "./styles.js"

const definitions: ReadonlyArray<readonly [string, CustomElementConstructor]> = [
  ["mui-app", MuiApp],
  ["mui-theme", MuiTheme],
  ["mui-header", class extends MuiSemantic { public override connectedCallback(): void { this.setAttribute("data-role", "banner"); super.connectedCallback() } }],
  ["mui-main", class extends MuiSemantic { public override connectedCallback(): void { this.setAttribute("data-role", "main"); super.connectedCallback() } }],
  ["mui-section", class extends MuiSemantic {}],
  ["mui-heading", MuiHeading],
  ["mui-text", class extends MuiElement {}],
  ["mui-strong", class extends MuiElement {}],
  ["mui-code", class extends MuiElement {}],
  ["mui-link", MuiLink],
  ["mui-field", MuiField],
  ["mui-stack", class extends MuiLayout {}],
  ["mui-row", class extends MuiLayout {}],
  ["mui-wrap", class extends MuiLayout {}],
  ["mui-center", class extends MuiLayout {}],
  ["mui-spacer", class extends MuiLayout { public override connectedCallback(): void { super.connectedCallback(); this.style.flex = "1" } }],
  ["mui-card", MuiCard],
  ["mui-card-header", class extends MuiElement {}],
  ["mui-card-content", class extends MuiElement {}],
  ["mui-card-footer", class extends MuiElement {}],
  ["mui-alert", class extends MuiElement {}],
  ["mui-badge", class extends MuiElement {}],
  ["mui-tag", MuiTag],
  ["mui-divider", class extends MuiElement { public connectedCallback(): void { this.setAttribute("role", "separator"); this.setAttribute("aria-orientation", this.hasAttribute("vertical") ? "vertical" : "horizontal") } }],
  ["mui-progress", MuiProgress],
  ["mui-skeleton", MuiSkeleton],
  ["mui-avatar", MuiAvatar],
  ["mui-empty", MuiEmpty],
  ["mui-spin", class extends MuiElement { public connectedCallback(): void { this.setAttribute("role", "status"); this.setAttribute("aria-label", this.getAttribute("label") ?? "Loading") } }],
  ["mui-button", MuiButton],
  ["mui-button-group", class extends MuiElement { public connectedCallback(): void { this.setAttribute("role", "group") } }],
  ["mui-input", MuiInput],
  ["mui-textarea", MuiTextarea],
  ["mui-option", class extends MuiElement {}],
  ["mui-select", MuiSelect],
  ["mui-autocomplete", MuiAutocomplete],
  ["mui-slider", MuiSlider],
  ["mui-checkbox", MuiCheckbox],
  ["mui-radio", MuiRadio],
  ["mui-radio-group", MuiRadioGroup],
  ["mui-switch", MuiSwitch],
  ["mui-form-item", MuiFormItem],
  ["mui-form", MuiForm],
  ["mui-grid", MuiGrid],
  ["mui-tabs", MuiTabs],
  ["mui-tab", MuiTab],
  ["mui-accordion", class extends MuiElement {}],
  ["mui-accordion-item", MuiAccordionItem],
  ["mui-menu", MuiMenu],
  ["mui-menu-item", MuiMenuItem],
  ["mui-pagination", MuiPagination],
  ["mui-steps", MuiSteps],
  ["mui-step", class extends MuiElement {}],
  ["mui-list", class extends MuiElement { public connectedCallback(): void { this.setAttribute("role", "list") } }],
  ["mui-list-item", class extends MuiElement { public connectedCallback(): void { this.setAttribute("role", "listitem") } }],
  ["mui-descriptions", MuiDescriptions],
  ["mui-description-item", MuiDescriptionItem],
  ["mui-statistic", MuiStatistic],
  ["mui-tree", MuiTree],
  ["mui-tree-node", MuiTreeNode],
  ["mui-dialog", MuiDialog],
  ["mui-dialog-header", class extends MuiElement {}],
  ["mui-dialog-content", class extends MuiElement {}],
  ["mui-dialog-footer", class extends MuiElement {}],
  ["mui-drawer", MuiDrawer],
  ["mui-drawer-header", class extends MuiElement {}],
  ["mui-drawer-content", class extends MuiElement {}],
  ["mui-drawer-footer", class extends MuiElement {}],
  ["mui-tooltip", MuiTooltip],
  ["mui-popover", MuiPopover],
  ["mui-popover-trigger", class extends MuiElement {}],
  ["mui-popover-content", class extends MuiElement {}],
  ["mui-message", class extends MuiElement {}],
  ["mui-notification", class extends MuiElement {}],
  ["mui-include", MuiInclude],
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
  if (!name.startsWith("mui-")) {
    throw new Error("Use a 'mui-' element name.")
  }
  if (!registry.get(name)) registry.define(name, constructor)
}

export function installStyles(document: Document = globalThis.document): void {
  if (document.getElementById("mui-styles")) return
  const style = document.createElement("style")
  style.id = "mui-styles"
  style.textContent = builtInStyles
  document.head.append(style)
}
