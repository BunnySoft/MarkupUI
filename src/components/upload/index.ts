export { Upload, UploadDragger, UploadTrigger, UploadFileList } from "./upload-element.js"
export type { UploadChangeDetail } from "./upload-element.js"
export { createUpload } from "./upload.js"
export type { UploadOptions, UploadTransport, UploadContext, UploadResponse, UploadStatus, UploadFile, UploadState, UploadChange, UploadSelection, UploadRejection, UploadController } from "./upload.js"

import { Upload, UploadDragger, UploadTrigger, UploadFileList } from "./upload-element.js"
import { ViewElement } from "../../core/index.js"

export function registerUpload(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Upload, UploadDragger, UploadTrigger, UploadFileList], registry)
}

if (typeof customElements !== "undefined") registerUpload()

