import { createSlider, createSliderPair } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISlider?: { createSlider: typeof createSlider; createSliderPair: typeof createSliderPair } }
if (target.MarkupUISlider !== undefined) throw new Error("MarkupUISlider is already defined; no API was replaced.")
target.MarkupUISlider = { createSlider, createSliderPair }
