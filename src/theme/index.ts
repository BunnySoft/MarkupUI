import { builtInThemeTokens } from "./presets.js"
import { slateThemeTokens, slateDarkThemeTokens } from "./slate.js"

export type ThemeTokens = Readonly<Record<string, string>>
export { slateThemeTokens, slateDarkThemeTokens } from "./slate.js"

const themes = new Map<string, ThemeTokens>()
const subscribers = new Set<(name: string) => void>()
const applied = new WeakMap<HTMLElement, () => void>()

/** Release only the inline values and theme marker still owned by this application. */
export function clearTheme(root: HTMLElement): void {
  applied.get(root)?.()
  applied.delete(root)
}

function applyTokens(name: string, root: HTMLElement): void {
  const tokens = themes.get(name)
  if (tokens === undefined) throw new Error(`Unknown MarkupUI theme '${name}'.`)
  clearTheme(root)
  const previousName = root.getAttribute("data-m-theme")
  root.dataset.mTheme = name
  const restore: Array<() => void> = []
  for (const [key, value] of Object.entries(tokens)) {
    const property = `--m-${key}`
    const previous = root.style.getPropertyValue(property)
    const priority = root.style.getPropertyPriority(property)
    root.style.setProperty(property, value)
    const written = root.style.getPropertyValue(property)
    restore.push(() => {
      if (root.style.getPropertyValue(property) === written && !root.style.getPropertyPriority(property)) {
        root.style.setProperty(property, previous, priority)
      }
    })
  }
  applied.set(root, () => {
    restore.forEach(release => release())
    if (root.dataset.mTheme === name) {
      if (previousName === null) root.removeAttribute("data-m-theme")
      else root.setAttribute("data-m-theme", previousName)
    }
  })
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

