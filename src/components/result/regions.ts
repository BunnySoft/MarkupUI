import { ViewElement } from "../../core/index.js"

/**
 * Header region of a Result component.
 * @region {"name":"title","accepts":["heading","text"],"min":0,"max":1}
 * @region {"name":"description","accepts":["text","paragraph"],"min":0,"max":1}
 */
export class ResultHeader extends ViewElement {
  public static readonly tag = "m-result-header"
}

/**
 * Content body region of a Result component.
 * @region {"name":"content","accepts":["content","controls","text"],"min":0,"max":null}
 */
export class ResultContent extends ViewElement {
  public static readonly tag = "m-result-content"
}

/**
 * Footer action region of a Result component.
 * @region {"name":"footer","accepts":["actions","links","buttons"],"min":0,"max":null}
 */
export class ResultFooter extends ViewElement {
  public static readonly tag = "m-result-footer"
}
