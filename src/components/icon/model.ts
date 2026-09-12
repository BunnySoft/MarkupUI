export function isIconElement(element: Element): boolean {
  return element.localName === "m-icon" || element.localName === "m-icon-wrapper"
}
