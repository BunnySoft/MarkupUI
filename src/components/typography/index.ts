export { Typography, Text, Paragraph, Heading, Link, Blockquote, UnorderedList, OrderedList } from "./typography.js"
export type { TextType, HeadingPrefix, OrderedListType } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { Typography, Text, Paragraph, Heading, Link, Blockquote, UnorderedList, OrderedList } from "./typography.js"

export function registerTypography(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Typography, Text, Paragraph, Heading, Link, Blockquote, UnorderedList, OrderedList], registry)
}

if (typeof customElements !== "undefined") registerTypography()
