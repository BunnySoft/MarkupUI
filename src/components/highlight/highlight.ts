export interface HighlightRange {
  readonly start: number
  readonly end: number
}

export interface HighlightMatchOptions {
  readonly caseSensitive?: boolean
}

export interface HighlightOptions extends HighlightMatchOptions {
  readonly highlightClass?: string
}

export const HIGHLIGHT_LIMITS = Object.freeze({
  textLength: 65_536,
  patternCount: 64,
  patternCharacters: 4_096,
  work: 16_777_216,
  matches: 4_096,
  classLength: 256,
})

function validateOptions(options: HighlightOptions, rendering: boolean): void {
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("Highlight options must be an object.")
  }
  for (const key of Object.keys(options)) {
    if (key !== "caseSensitive" && !(rendering && key === "highlightClass")) {
      throw new TypeError(`Unsupported Highlight option: ${key}.`)
    }
  }
  if (options.caseSensitive !== undefined && typeof options.caseSensitive !== "boolean") {
    throw new TypeError("caseSensitive must be a boolean.")
  }
  if (rendering && options.highlightClass !== undefined) {
    if (typeof options.highlightClass !== "string") {
      throw new TypeError("highlightClass must be a string.")
    }
    if (options.highlightClass.length > HIGHLIGHT_LIMITS.classLength) {
      throw new RangeError("highlightClass exceeds 256 UTF-16 code units.")
    }
  }
}

function escapeLiteral(pattern: string): string {
  let result = ""
  for (const character of pattern) {
    if ("\\^$.*+?()[]{}|".includes(character)) result += "\\"
    result += character
  }
  return result
}

export function findHighlightRanges(
  text = "",
  patterns: readonly string[] = [],
  options: HighlightMatchOptions = {},
): HighlightRange[] {
  validateOptions(options, false)
  if (typeof text !== "string") throw new TypeError("Highlight text must be a string.")
  if (text.length > HIGHLIGHT_LIMITS.textLength) {
    throw new RangeError("Highlight text exceeds 65536 UTF-16 code units.")
  }
  if (!Array.isArray(patterns)) throw new TypeError("Highlight patterns must be an array of strings.")
  if (patterns.length > HIGHLIGHT_LIMITS.patternCount) {
    throw new RangeError("Highlight supports at most 64 input patterns.")
  }
  const unique = new Set<string>()
  let characters = 0
  for (const pattern of patterns) {
    if (typeof pattern !== "string") throw new TypeError("Each Highlight pattern must be a string.")
    if (pattern.length === 0 || unique.has(pattern)) continue
    characters += pattern.length
    if (characters > HIGHLIGHT_LIMITS.patternCharacters) {
      throw new RangeError("Distinct Highlight patterns exceed 4096 UTF-16 code units.")
    }
    unique.add(pattern)
  }
  // Bound literal-alternation work as well as output node count before touching the DOM.
  if (text.length * characters > HIGHLIGHT_LIMITS.work) {
    throw new RangeError("Highlight text × distinct pattern length exceeds the matching work limit.")
  }
  if (text.length === 0 || unique.size === 0) return []
  const expression = new RegExp(
    `(?:${[...unique].map(escapeLiteral).join("|")})`,
    options.caseSensitive ? "gu" : "giu",
  )
  const ranges: HighlightRange[] = []
  for (const match of text.matchAll(expression)) {
    if (ranges.length === HIGHLIGHT_LIMITS.matches) {
      throw new RangeError("Highlight exceeds 4096 matches.")
    }
    ranges.push({ start: match.index, end: match.index + match[0].length })
  }
  return ranges
}

export function highlightText(
  target: HTMLSpanElement,
  text = "",
  patterns: readonly string[] = [],
  options: HighlightOptions = {},
): HighlightRange[] {
  if (!target || target.localName !== "span" || target.namespaceURI !== "http://www.w3.org/1999/xhtml") {
    throw new TypeError("Highlight requires a dedicated native HTML span text surface.")
  }
  validateOptions(options, true)
  const ranges = findHighlightRanges(text, patterns, { caseSensitive: options.caseSensitive ?? false })
  const document = target.ownerDocument
  const fragment = document.createDocumentFragment()
  const className = options.highlightClass
    ? `mui-highlight-mark ${options.highlightClass}`
    : "mui-highlight-mark"
  let cursor = 0
  for (const { start, end } of ranges) {
    if (start > cursor) fragment.append(document.createTextNode(text.slice(cursor, start)))
    const mark = document.createElementNS("http://www.w3.org/1999/xhtml", "mark")
    mark.className = className
    mark.append(document.createTextNode(text.slice(start, end)))
    fragment.append(mark)
    cursor = end
  }
  if (cursor < text.length) fragment.append(document.createTextNode(text.slice(cursor)))
  target.replaceChildren(fragment)
  return ranges
}
