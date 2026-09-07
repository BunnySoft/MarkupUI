import {
  installActions,
  invokeAction,
  registerAction,
} from "../actions/index.js"
import {
  builtInElementNames,
  installStyles,
  registerElement,
  registerElements,
} from "../components/elements.js"
import { MuiElement } from "./element.js"
import { installPlugin, isPluginInstalled, type MuiPlugin } from "./plugin.js"
import { clearOverlays, showMessage, showNotification } from "../overlay/index.js"
import {
  extendQuery,
  MuiQuery,
  query,
  setHtml,
} from "../query/index.js"
import { isSafeUri, sanitizeHtml } from "../security/index.js"
import { bind, createStore, MuiStore } from "../state/index.js"
import { theme } from "../theme/index.js"

export interface MarkupUIApi {
  (target: string | Element | Iterable<Element>): MuiQuery
  readonly version: string
  readonly fn: typeof MuiQuery.prototype
  readonly query: typeof query
  readonly use: (plugin: MuiPlugin<MarkupUIApi>) => MarkupUIApi
  readonly plugins: {
    readonly installed: typeof isPluginInstalled
  }
  readonly elements: {
    readonly Base: typeof MuiElement
    readonly names: readonly string[]
    readonly register: typeof registerElement
    readonly registerAll: typeof registerElements
    readonly installStyles: typeof installStyles
  }
  readonly actions: {
    readonly register: typeof registerAction
    readonly invoke: typeof invokeAction
    readonly install: typeof installActions
  }
  readonly state: {
    readonly create: typeof createStore
    readonly bind: typeof bind
    readonly Store: typeof MuiStore
  }
  readonly theme: typeof theme
  readonly message: {
    readonly show: typeof showMessage
    readonly clear: typeof clearOverlays
  }
  readonly notification: {
    readonly show: typeof showNotification
    readonly clear: typeof clearOverlays
  }
  readonly html: {
    readonly sanitize: typeof sanitizeHtml
    readonly set: typeof setHtml
    readonly isSafeUri: typeof isSafeUri
  }
  readonly queryExtensions: {
    readonly register: typeof extendQuery
  }
}

const callable = (target: string | Element | Iterable<Element>): MuiQuery => query(target)

export const mui = Object.assign(callable, {
  version: "0.11.0",
  fn: MuiQuery.prototype,
  query,
  use(plugin: MuiPlugin<MarkupUIApi>): MarkupUIApi {
    installPlugin(plugin, mui)
    return mui
  },
  plugins: {
    installed: isPluginInstalled,
  },
  elements: {
    Base: MuiElement,
    names: builtInElementNames,
    register: registerElement,
    registerAll: registerElements,
    installStyles,
  },
  actions: {
    register: registerAction,
    invoke: invokeAction,
    install: installActions,
  },
  state: {
    create: createStore,
    bind,
    Store: MuiStore,
  },
  theme,
  message: {
    show: showMessage,
    clear: clearOverlays,
  },
  notification: {
    show: showNotification,
    clear: clearOverlays,
  },
  html: {
    sanitize: sanitizeHtml,
    set: setHtml,
    isSafeUri,
  },
  queryExtensions: {
    register: extendQuery,
  },
}) satisfies MarkupUIApi
