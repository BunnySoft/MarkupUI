import { Card, CardAction, CardContent, CardCover, CardFooter, CardHeader, CardHeaderExtra, registerCard } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICard?: typeof import("./index.js") }
if (target.MarkupUICard !== undefined) throw new Error("MarkupUICard is already defined.")
target.MarkupUICard = { Card, CardAction, CardContent, CardCover, CardFooter, CardHeader, CardHeaderExtra, registerCard }
