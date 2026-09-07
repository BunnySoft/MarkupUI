export type ThemeTokens = Readonly<Record<string, string>>

const themes = new Map<string, ThemeTokens>()
const subscribers = new Set<(name: string) => void>()
const appliedKeys = new WeakMap<HTMLElement, Set<string>>()

function applyTokens(name: string, root: HTMLElement): void {
  const tokens = themes.get(name)
  if (tokens === undefined) throw new Error(`Unknown MarkupUI theme '${name}'.`)
  root.dataset.muiTheme = name
  appliedKeys.get(root)?.forEach((key) => root.style.removeProperty(`--mui-${key}`))
  const keys = new Set<string>()
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--mui-${key}`, value)
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
    localStorage.setItem("mui-theme", name)
    subscribers.forEach((subscriber) => subscriber(name))
    root.dispatchEvent(new CustomEvent("mui:themechange", { detail: { name } }))
  },
  apply(name: string, root: HTMLElement): void {
    applyTokens(name, root)
  },
  current(root: HTMLElement = document.documentElement): string {
    return root.dataset.muiTheme ?? ""
  },
  subscribe(subscriber: (name: string) => void): () => void {
    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  },
}

theme.register("light", {
  "color-primary": "#18a058",
  "color-primary-hover": "#36ad6a",
  "color-primary-pressed": "#0c7a43",
  "color-primary-soft": "#e7f5ee",
  "color-primary-contrast": "#ffffff",
  "color-info": "#2080f0",
  "color-info-hover": "#4098fc",
  "color-info-pressed": "#1060c9",
  "color-success": "#18a058",
  "color-success-hover": "#36ad6a",
  "color-success-pressed": "#0c7a43",
  "color-warning": "#f0a020",
  "color-warning-hover": "#fcb040",
  "color-warning-pressed": "#c97c10",
  "color-error": "#d03050",
  "color-error-hover": "#de576d",
  "color-error-pressed": "#ab1f3f",
  "button-text-color": "rgba(0, 0, 0, .82)",
  "button-border-color": "rgba(0, 0, 0, .24)",
  "bg-page": "#f6f7f9",
  "bg-surface": "#ffffff",
  "bg-elevated": "#ffffff",
  "bg-muted": "#f3f4f6",
  "bg-hover": "#f0fdf4",
  "text-primary": "#18181b",
  "text-secondary": "#52525b",
  "text-tertiary": "#71717a",
  "border": "#e4e4e7",
  "border-hover": "#a1a1aa",
  "focus-ring": "rgb(16 185 129 / .22)",
  "shadow-color": "rgb(24 24 27 / .1)",
})

theme.register("dark", {
  "color-primary": "#63e2b7",
  "color-primary-hover": "#7fe7c4",
  "color-primary-pressed": "#5acea7",
  "color-primary-soft": "#0d2e25",
  "color-primary-contrast": "#0b0b0c",
  "color-info": "#70c0e8",
  "color-info-hover": "#8acbec",
  "color-info-pressed": "#66afd3",
  "color-success": "#63e2b7",
  "color-success-hover": "#7fe7c4",
  "color-success-pressed": "#5acea7",
  "color-warning": "#f2c97d",
  "color-warning-hover": "#f5d599",
  "color-warning-pressed": "#e6c260",
  "color-error": "#e88080",
  "color-error-hover": "#e98b8b",
  "color-error-pressed": "#e57272",
  "button-text-color": "rgba(255, 255, 255, .82)",
  "button-border-color": "rgba(255, 255, 255, .24)",
  "bg-page": "#111113",
  "bg-surface": "#1c1c1f",
  "bg-elevated": "#252529",
  "bg-muted": "#27272a",
  "bg-hover": "#203b33",
  "text-primary": "#fafafa",
  "text-secondary": "#d4d4d8",
  "text-tertiary": "#a1a1aa",
  "border": "#3f3f46",
  "border-hover": "#71717a",
  "focus-ring": "rgb(52 211 153 / .25)",
  "shadow-color": "rgb(0 0 0 / .35)",
})
