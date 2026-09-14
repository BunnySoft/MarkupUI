import {
  Avatar, AvatarGroup, AvatarPlaceholder, AvatarFallback,
  registerAvatar,
} from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIAvatar?: typeof import("./index.js") }
if (target.MarkupUIAvatar !== undefined) throw new Error("MarkupUIAvatar is already defined.")
target.MarkupUIAvatar = {
  Avatar, AvatarGroup, AvatarPlaceholder, AvatarFallback,
  registerAvatar,
}
