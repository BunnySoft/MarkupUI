import type { PlatformComponentDefinition } from "../../platform/component.js"

export const buttonDefinition = {
  type: "Button",
  web: {
    primary: "m-button",
  },
  capabilities: [
    "button.activation",
    "button.form",
    "button.link",
    "button.loading",
    "button.icon",
  ],
} as const satisfies PlatformComponentDefinition

export const buttonGroupDefinition = {
  type: "ButtonGroup",
  web: {
    primary: "m-button-group",
  },
  capabilities: ["button-group.horizontal", "button-group.vertical"],
} as const satisfies PlatformComponentDefinition
