export interface AutoCompleteSuggestion {
  readonly value: string
  readonly label?: string
  readonly disabled?: boolean
}
export interface AutoCompleteLoadContext { readonly input: HTMLInputElement; readonly signal: AbortSignal }
export type AutoCompleteLoader = (query: string, context: AutoCompleteLoadContext) =>
  readonly (string | AutoCompleteSuggestion)[] | Promise<readonly (string | AutoCompleteSuggestion)[]>
export type AutoCompleteState = "idle" | "waiting" | "loading" | "ready" | "empty" | "error"
export interface AutoCompleteSettings {
  load?: AutoCompleteLoader | undefined
  maxResults?: number
  minLength?: number
  debounce?: number
  clearable?: boolean
}
export interface AutoCompleteOptions extends AutoCompleteSettings {
  status?: HTMLElement
  clear?: HTMLButtonElement
}
export interface AutoCompleteQueryResult {
  readonly status: "updated" | "skipped" | "aborted"
  readonly query: string
  readonly count: number
  readonly current: boolean
}

export function autoCompleteSettings(options: AutoCompleteSettings = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["load", "maxResults", "minLength", "debounce", "clearable"].includes(key))
    || options.load !== undefined && typeof options.load !== "function"
    || [options.maxResults, options.minLength, options.debounce].some(value => value !== undefined && typeof value !== "number")
    || options.clearable !== undefined && typeof options.clearable !== "boolean") throw new TypeError("Unsupported Auto Complete options.")
  const maxResults = options.maxResults ?? 20, minLength = options.minLength ?? 1, debounce = options.debounce ?? 150
  if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 100
    || !Number.isInteger(minLength) || minLength < 0 || minLength > 1000
    || !Number.isInteger(debounce) || debounce < 0 || debounce > 1000) throw new TypeError("Use maxResults 1-100, minLength 0-1000 and debounce 0-1000 milliseconds.")
  return Object.freeze({ load: options.load, maxResults, minLength, debounce, clearable: options.clearable ?? false })
}

export function autoCompleteSuggestions(values: readonly (string | AutoCompleteSuggestion)[], limit = Infinity): readonly AutoCompleteSuggestion[] {
  if (!Array.isArray(values) || values.length > limit) throw new TypeError(`Supply an array of at most ${limit} suggestions.`)
  const seen = new Set<string>()
  return Object.freeze(Array.from(values, value => {
    const item = typeof value === "string" ? { value } : value
    if (!item || typeof item !== "object" || Array.isArray(item)
      || Object.keys(item).some(key => !["value", "label", "disabled"].includes(key))
      || typeof item.value !== "string" || !item.value.length || item.value.length > 2048 || seen.has(item.value)
      || item.label !== undefined && (typeof item.label !== "string" || item.label.length > 2048)
      || item.disabled !== undefined && typeof item.disabled !== "boolean") throw new TypeError("Suggestions need unique nonempty string values (up to 2048 characters), optional string labels and boolean disabled.")
    seen.add(item.value)
    return Object.freeze({ value: item.value, ...(item.label !== undefined ? { label: item.label } : {}),
      ...(item.disabled !== undefined ? { disabled: item.disabled } : {}) })
  }))
}
