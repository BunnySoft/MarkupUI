export { Image, MImage } from "./image.js"
export { ImageGroup, MImageGroup } from "./group.js"
export { imageFits } from "./model.js"
export type { ImageObjectFit, ImageLoadDetail, ImageErrorDetail } from "./model.js"
export { createImagePreview, createImage } from "./preview.js"
export type { ImagePreviewController, ImagePreviewDetail } from "./preview.js"

import { Image } from "./image.js"
import { ImageGroup } from "./group.js"
import { ViewElement } from "../../core/index.js"

export function registerImage(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Image, ImageGroup], registry)
}

if (typeof customElements !== "undefined") registerImage()

