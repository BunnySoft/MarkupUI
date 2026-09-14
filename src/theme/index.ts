import { builtInThemeTokens } from "./presets.js"
import { slateThemeTokens, slateDarkThemeTokens } from "./slate.js"

export type ThemeTokens = Readonly<Record<string, string>>
export { slateThemeTokens, slateDarkThemeTokens } from "./slate.js"

const themes = new Map<string, ThemeTokens>()
const subscribers = new Set<(name: string) => void>()
const appliedKeys = new WeakMap<HTMLElement, Set<string>>()

function applyTokens(name: string, root: HTMLElement): void {
  const tokens = themes.get(name)
  if (tokens === undefined) throw new Error(`Unknown MarkupUI theme '${name}'.`)
  root.dataset.mTheme = name
  appliedKeys.get(root)?.forEach((key) => root.style.removeProperty(`--m-${key}`))
  const keys = new Set<string>()
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--m-${key}`, value)
    keys.add(key)
  }
  appliedKeys.set(root, keys)
}

export const theme = {
  register(name: string, tokens: ThemeTokens): void {
    themes.set(name, tokens)
  },
  set(name: string, root: HTMLElement = document.documentElement): void {
    applyTokens(name, root)
    localStorage.setItem("m-theme", name)
    subscribers.forEach((subscriber) => subscriber(name))
    root.dispatchEvent(new CustomEvent("m:themechange", { detail: { name } }))
  },
  apply(name: string, root: HTMLElement): void {
    applyTokens(name, root)
  },
  current(root: HTMLElement = document.documentElement): string {
    return root.dataset.mTheme ?? ""
  },
  subscribe(subscriber: (name: string) => void): () => void {
    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  },
}

theme.register("light", builtInThemeTokens.light)

theme.register("dark", builtInThemeTokens.dark)

theme.register("slate", slateThemeTokens)

theme.register("slate-dark", slateDarkThemeTokens)

