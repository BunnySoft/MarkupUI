export { MuiAvatar } from "./avatar.js"
export { MuiAvatarGroup } from "./group.js"

import { MuiAvatar } from "./avatar.js"
import { MuiAvatarGroup } from "./group.js"

export function registerAvatar(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  for (const [name, constructor] of [
    ["mui-avatar", MuiAvatar],
    ["mui-avatar-group", MuiAvatarGroup],
  ] as const) {
    const existing = registry.get(name)
    if (existing && existing !== constructor) {
      throw new Error(`'${name}' is already defined. Load the Avatar component before the legacy MarkupUI bundle.`)
    }
  }
  if (!registry.get("mui-avatar")) registry.define("mui-avatar", MuiAvatar)
  if (!registry.get("mui-avatar-group")) registry.define("mui-avatar-group", MuiAvatarGroup)
}

if (typeof customElements !== "undefined") registerAvatar()
