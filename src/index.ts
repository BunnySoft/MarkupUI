export {
  installActions,
  invokeAction,
  registerAction,
  type ActionContext,
  type MuiAction,
} from "./actions/index.js"
export {
  builtInElementNames,
  installStyles,
  registerElement,
  registerElements,
} from "./components/elements.js"
export { mui, type MarkupUIApi } from "./core/api.js"
export { MuiElement } from "./core/element.js"
export { positionFloating, type FloatingPlacement } from "./core/position.js"
export {
  installPlugin,
  isPluginInstalled,
  type MuiPlugin,
} from "./core/plugin.js"
export {
  extendQuery,
  MuiQuery,
  query,
  setHtml,
  type MuiQueryMethod,
} from "./query/index.js"
export {
  clearOverlays,
  showMessage,
  showNotification,
  type MessageOptions,
  type NotificationOptions,
  type OverlayHandle,
} from "./overlay/index.js"
export {
  isSafeUri,
  sanitizeHtml,
  type HtmlPolicy,
} from "./security/index.js"
export {
  bind,
  createStore,
  MuiStore,
  type StateSubscriber,
  type StateValue,
} from "./state/index.js"
export { theme, type ThemeTokens } from "./theme/index.js"

import { installStyles, registerElements } from "./components/elements.js"

export function registerMarkupUI(): void {
  installStyles()
  registerElements()
}

if (typeof window !== "undefined" && typeof customElements !== "undefined") {
  registerMarkupUI()
}
