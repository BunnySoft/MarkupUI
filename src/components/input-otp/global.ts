import * as inputOtp from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIInputOtp?: typeof inputOtp }
if (target.MarkupUIInputOtp !== undefined) throw new Error("MarkupUIInputOtp is already defined; no API was replaced.")
target.MarkupUIInputOtp = inputOtp

