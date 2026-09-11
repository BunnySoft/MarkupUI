export { MAvatar } from "./avatar.js"
export { MAvatarGroup } from "./group.js"

import { MAvatar } from "./avatar.js"
import { MAvatarGroup } from "./group.js"

export function registerAvatar(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  for (const [name, constructor] of [
    ["m-avatar", MAvatar],
    ["m-avatar-group", MAvatarGroup],
  ] as const) {
    const existing = registry.get(name)
    if (existing && existing !== constructor) {
      throw new Error(`'${name}' is already defined. Load the Avatar component before the legacy MarkupUI bundle.`)
    }
  }
  if (!registry.get("m-avatar")) registry.define("m-avatar", MAvatar)
  if (!registry.get("m-avatar-group")) registry.define("m-avatar-group", MAvatarGroup)
}

if (typeof customElements !== "undefined") registerAvatar()
