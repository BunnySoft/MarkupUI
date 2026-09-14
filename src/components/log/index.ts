export { Log, MLog, createLog, MAX_LOG_LINES, MAX_LOG_CHARACTERS, MAX_LOG_LINE_LENGTH } from "./log.js"
export type { LogOptions, LogLine, LogState, LogUpdate, LogScrollOptions, LogController } from "./log.js"

import { Log } from "./log.js"
import { ViewElement } from "../../core/index.js"

export function registerLog(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Log], registry)
}

if (typeof customElements !== "undefined") registerLog()

