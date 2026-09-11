import type { PlatformComponentDefinition } from "../../platform/component.js"

export const cardDefinition = {
  type: "Card",
  web: {
    primary: "m-card",
  },
  capabilities: [
    "card.content",
    "card.title",
    "card.close",
    "card.segmented",
    "card.scrollable",
  ],
} as const satisfies PlatformComponentDefinition

export const cardCoverDefinition = {
  type: "CardCover",
  web: {
    primary: "m-card-cover",
  },
  capabilities: ["card-region.cover"],
} as const satisfies PlatformComponentDefinition

export const cardHeaderDefinition = {
  type: "CardHeader",
  web: {
    primary: "m-card-header",
  },
  capabilities: ["card-region.header"],
} as const satisfies PlatformComponentDefinition

export const cardHeaderExtraDefinition = {
  type: "CardHeaderExtra",
  web: {
    primary: "m-card-header-extra",
  },
  capabilities: ["card-region.header-extra"],
} as const satisfies PlatformComponentDefinition

export const cardContentDefinition = {
  type: "CardContent",
  web: {
    primary: "m-card-content",
  },
  capabilities: ["card-region.content"],
} as const satisfies PlatformComponentDefinition

export const cardFooterDefinition = {
  type: "CardFooter",
  web: {
    primary: "m-card-footer",
  },
  capabilities: ["card-region.footer"],
} as const satisfies PlatformComponentDefinition

export const cardActionDefinition = {
  type: "CardAction",
  web: {
    primary: "m-card-action",
  },
  capabilities: ["card-region.action"],
} as const satisfies PlatformComponentDefinition
