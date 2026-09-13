import { ViewElement } from "../../core/index.js"

export class TooltipTrigger extends ViewElement {
  public static readonly tag = "m-tooltip-trigger"
  public static readonly observedAttributes: string[] = []
}

export class TooltipContent extends ViewElement {
  public static readonly tag = "m-tooltip-content"
  public static readonly observedAttributes: string[] = []
}
