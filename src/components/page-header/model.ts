export interface PageHeaderBackDetail {
  originalEvent: MouseEvent
}

export const pageHeaderRegions = [
  "header",
  "avatar",
  "title",
  "subtitle",
  "extra",
  "content",
  "footer",
  "back",
] as const

export type PageHeaderRegion = (typeof pageHeaderRegions)[number]

export function isPageHeaderElement(element: Element): boolean {
  return element.localName === "m-page-header"
}
