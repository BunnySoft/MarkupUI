import * as slider from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISlider?: typeof slider }
if (target.MarkupUISlider !== undefined) throw new Error("MarkupUISlider is already defined; no API was replaced.")
target.MarkupUISlider = slider

