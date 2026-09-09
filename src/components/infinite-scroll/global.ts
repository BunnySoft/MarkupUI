import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIInfiniteScroll?: typeof api }
if (target.MarkupUIInfiniteScroll !== undefined) throw new Error("MarkupUIInfiniteScroll is already defined; no API was replaced.")
target.MarkupUIInfiniteScroll = api
