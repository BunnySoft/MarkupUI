import * as statistic from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIStatistic?: typeof statistic }
if (target.MarkupUIStatistic !== undefined) throw new Error("MarkupUIStatistic is already defined.")
target.MarkupUIStatistic = statistic
