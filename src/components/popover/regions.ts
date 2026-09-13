import { ViewElement } from "../../core/index.js"

export class PopoverTrigger extends ViewElement {
  public static readonly tag = "m-popover-trigger"
  public static readonly observedAttributes: string[] = []
}

export class PopoverContent extends ViewElement {
  public static readonly tag = "m-popover-content"
  public static readonly observedAttributes: string[] = []
}
