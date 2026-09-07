import type { ProgressPaint } from "./values.js"

const namespace = "http://www.w3.org/2000/svg"
export interface Ring {
  group: SVGGElement
  rail: SVGCircleElement
  fill: SVGCircleElement
  gradient: SVGLinearGradientElement
  stops: SVGStopElement[]
}

export function createGraphic(document: Document): { svg: SVGSVGElement; defs: SVGDefsElement } {
  const svg = document.createElementNS(namespace, "svg")
  svg.setAttribute("aria-hidden", "true")
  svg.setAttribute("focusable", "false")
  const defs = document.createElementNS(namespace, "defs")
  svg.append(defs)
  return { svg, defs }
}

export function createRing(document: Document, id: string): Ring {
  const group = document.createElementNS(namespace, "g")
  group.setAttribute("data-mui-progress-ring", "")
  const rail = document.createElementNS(namespace, "circle")
  const fill = document.createElementNS(namespace, "circle")
  for (const node of [rail, fill]) {
    node.setAttribute("fill", "none")
    node.setAttribute("pathLength", "100")
    node.setAttribute("stroke-linecap", "round")
    node.setAttribute("stroke", "currentColor")
  }
  rail.setAttribute("data-mui-progress-rail", "")
  fill.setAttribute("data-mui-progress-fill", "")
  group.append(rail, fill)
  const gradient = document.createElementNS(namespace, "linearGradient")
  gradient.id = id
  gradient.setAttribute("x1", "0%")
  gradient.setAttribute("y1", "100%")
  gradient.setAttribute("x2", "100%")
  gradient.setAttribute("y2", "0%")
  const stops = [document.createElementNS(namespace, "stop"), document.createElementNS(namespace, "stop")]
  stops[0]!.setAttribute("offset", "0%")
  stops[1]!.setAttribute("offset", "100%")
  gradient.append(...stops)
  return { group, rail, fill, gradient, stops }
}

export function updateRing(ring: Ring, options: {
  center: number; radius: number; strokeWidth: number; gap: number; gapOffset: number; offset: number;
  value: number | null; color: ProgressPaint | undefined; railColor: string | undefined
}): void {
  const { center, radius, strokeWidth, gap, gapOffset, offset, value, color, railColor } = options
  const arc = 100 * (1 - gap / 360)
  const start = (gap === 0 ? -90 : 90 + gap / 2) + gapOffset % 360
  for (const node of [ring.rail, ring.fill]) {
    node.setAttribute("cx", String(center))
    node.setAttribute("cy", String(center))
    node.setAttribute("r", String(radius))
    node.setAttribute("stroke-width", String(strokeWidth))
  }
  ring.rail.setAttribute("transform", `rotate(${start} ${center} ${center})`)
  ring.fill.setAttribute("transform", `rotate(${start + offset % 360} ${center} ${center})`)
  ring.rail.setAttribute("stroke-dasharray", `${arc} 100`)
  ring.fill.setAttribute("stroke-dasharray", `${arc * (value === null ? .25 : value / 100)} 100`)
  ring.rail.setAttribute("visibility", arc === 0 ? "hidden" : "visible")
  ring.fill.setAttribute("visibility", value === 0 || arc === 0 ? "hidden" : "visible")
  ring.fill.toggleAttribute("data-mui-progress-indeterminate-fill", value === null)
  if (railColor) ring.rail.setAttribute("color", railColor)
  else ring.rail.removeAttribute("color")
  if (color && typeof color === "object") {
    ring.stops[0]!.setAttribute("stop-color", color.stops[0])
    ring.stops[1]!.setAttribute("stop-color", color.stops[1])
    ring.fill.setAttribute("stroke", `url(#${ring.gradient.id})`)
    ring.fill.removeAttribute("color")
  } else {
    ring.fill.setAttribute("stroke", "currentColor")
    if (color) ring.fill.setAttribute("color", color)
    else ring.fill.removeAttribute("color")
  }
}
