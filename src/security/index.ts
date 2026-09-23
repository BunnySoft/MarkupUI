export interface HtmlPolicy {
  /** Permit portable elements only for application-authored markup from a trusted source. */
  readonly allowMarkupUI?: boolean
  readonly allowStyle?: boolean
  readonly allowedOrigins?: readonly string[]
}

const htmlElements = new Set(("a abbr address article aside b bdi bdo blockquote br button caption cite code col colgroup "
  + "data dd del details dfn dialog div dl dt em fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr "
  + "i img input ins kbd label legend li main mark meter nav ol optgroup option output p pre progress q rp rt ruby "
  + "s samp section select small span strong sub summary sup table tbody td template textarea tfoot th thead time tr u ul var wbr").split(" "))
const uriAttributes = new Set(["href", "src", "action", "formaction", "poster", "cite", "background", "longdesc"])
const blockedAttributes = new Set(["srcdoc", "srcset", "imagesrcset", "ping", "is", "shadowrootmode", "shadowrootdelegatesfocus", "shadowrootclonable", "shadowrootserializable"])

export function isSafeUri(value: string, policy: HtmlPolicy = {}, base = globalThis.location?.href ?? "http://localhost/"): boolean {
  const text = value.trim()
  if (text === "" || text.startsWith("#")) return true
  try {
    const url = new URL(text, base)
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return false
    const allowed = policy.allowedOrigins
    return allowed === undefined
      ? url.origin === new URL(base).origin
      : Array.isArray(allowed) && allowed.includes(url.origin)
  } catch {
    return false
  }
}

export function sanitizeHtml(
  html: string,
  document: Document = globalThis.document,
  policy: HtmlPolicy = {},
): DocumentFragment {
  if (typeof html !== "string" || html.length > 1_048_576) throw new TypeError("HTML must be a string of at most 1048576 characters.")
  const template = document.createElement("template")
  template.innerHTML = html
  const pending = [template.content]
  const form = document.createElement("form")
  const allowed = { ...policy, allowedOrigins: policy.allowedOrigins ?? [document.location?.origin ?? new URL(document.baseURI).origin] }
  while (pending.length) {
    for (const element of pending.pop()!.querySelectorAll("*")) {
      if (element.namespaceURI !== "http://www.w3.org/1999/xhtml" || element.hasAttribute("is")
        || !htmlElements.has(element.localName) && !(policy.allowMarkupUI === true && /^m-[a-z][a-z0-9-]*$/.test(element.localName))) {
        element.remove()
        continue
      }
      if (element.localName === "template") pending.push((element as HTMLTemplateElement).content)
      for (const attribute of [...element.attributes]) {
        const name = attribute.name.toLowerCase()
        if (name.startsWith("on") || name.includes(":") || blockedAttributes.has(name)
          || name === "style" && policy.allowStyle !== true
          || (name === "id" || name === "name") && (attribute.value in document || attribute.value in form)
          || uriAttributes.has(name) && !isSafeUri(attribute.value, allowed, document.baseURI)) {
          element.removeAttribute(attribute.name)
        }
      }
    }
  }
  return template.content
}
