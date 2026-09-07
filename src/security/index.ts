export interface HtmlPolicy {
  readonly allowStyle?: boolean
  readonly allowedOrigins?: readonly string[]
}

const blockedElements = new Set([
  "script", "style", "iframe", "object", "embed", "base", "meta", "link",
])
const uriAttributes = new Set(["href", "src", "srcdoc", "action", "formaction", "poster"])

export function isSafeUri(value: string, policy: HtmlPolicy = {}): boolean {
  const text = value.trim()
  if (text === "" || text.startsWith("#")) return true
  try {
    const url = new URL(text, globalThis.location?.href ?? "http://localhost/")
    if (!["http:", "https:"].includes(url.protocol)) return false
    const allowed = policy.allowedOrigins
    return allowed === undefined
      ? url.origin === (globalThis.location?.origin ?? url.origin)
      : allowed.includes(url.origin)
  } catch {
    return false
  }
}

export function sanitizeHtml(
  html: string,
  document: Document = globalThis.document,
  policy: HtmlPolicy = {},
): DocumentFragment {
  const template = document.createElement("template")
  template.innerHTML = html
  const elements = [...template.content.querySelectorAll("*")]
  for (const element of elements) {
    if (blockedElements.has(element.localName)) {
      element.remove()
      continue
    }
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase()
      if (name.startsWith("on") || (name === "style" && policy.allowStyle !== true)) {
        element.removeAttribute(attribute.name)
        continue
      }
      if (uriAttributes.has(name) && !isSafeUri(attribute.value, policy)) {
        element.removeAttribute(attribute.name)
      }
    }
  }
  return template.content
}
