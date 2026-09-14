import * as thing from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIThing?: typeof thing }
if (target.MarkupUIThing !== undefined) throw new Error("MarkupUIThing is already defined.")
target.MarkupUIThing = thing
