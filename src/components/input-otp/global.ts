import { createInputOtp } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIInputOtp?: { createInputOtp: typeof createInputOtp } }
if (target.MarkupUIInputOtp !== undefined) throw new Error("MarkupUIInputOtp is already defined; no API was replaced.")
target.MarkupUIInputOtp = { createInputOtp }
