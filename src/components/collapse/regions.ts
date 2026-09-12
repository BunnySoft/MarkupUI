import { ViewElement } from "../../core/index.js"

export class CollapseHeader extends ViewElement {
  public static readonly tag = "m-collapse-header"
  public static readonly observedAttributes: string[] = []
}

export class CollapseHeaderExtra extends ViewElement {
  public static readonly tag = "m-collapse-header-extra"
  public static readonly observedAttributes: string[] = []
}

export class CollapseContent extends ViewElement {
  public static readonly tag = "m-collapse-content"
  public static readonly observedAttributes: string[] = []
}
