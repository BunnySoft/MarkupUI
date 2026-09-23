import type { ChartOption } from "./options.js"

export interface ChartRenderer {
  setOption(option: ChartOption, settings: { notMerge: boolean; lazyUpdate: boolean }): void
  resize(): void
  dispose(): void
  on(name: string, handler: (event: unknown) => void): void
}

/** Application-supplied ECharts API; no vendor declaration dependency. */
export interface ChartEngine {
  init(element: HTMLElement, theme: "light" | "dark", options: { renderer: "svg" | "canvas" }): ChartRenderer
}

let engine: ChartEngine | undefined

/**
 * Supply ECharts with the application's selected modules already registered.
 * Affects future instances only. After late setup, call refresh() on failed charts.
 */
export function configureChartEngine(value: ChartEngine): void {
  if (!value || typeof value.init !== "function") throw new TypeError("Chart engine must provide an init() function.")
  engine = value
}

export function createChartRenderer(element: HTMLElement, theme: "light" | "dark", renderer: "svg" | "canvas"): ChartRenderer {
  if (!engine) throw new Error("Chart requires ECharts. Call configureChartEngine(echarts) before rendering.")
  return engine.init(element, theme, { renderer })
}
