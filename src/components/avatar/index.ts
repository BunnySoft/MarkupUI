export { Avatar, AvatarPlaceholder, AvatarFallback } from "./avatar.js"
export type { AvatarLoadDetail, AvatarErrorDetail } from "./avatar.js"
export { AvatarGroup } from "./group.js"
export type { AvatarSize, AvatarShape, AvatarImageFit, AvatarState, AvatarLoading } from "./model.js"

import { Avatar, AvatarPlaceholder, AvatarFallback } from "./avatar.js"
import { AvatarGroup } from "./group.js"
import { ViewElement } from "../../core/index.js"

export function registerAvatar(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Avatar, AvatarGroup, AvatarPlaceholder, AvatarFallback], registry)
}

if (typeof customElements !== "undefined") registerAvatar()
