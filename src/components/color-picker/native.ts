export interface ColorPickerNative {
  control: HTMLInputElement
  hex: HTMLInputElement
  entry: HTMLElement
  output: HTMLElement
  apply: HTMLButtonElement
  revert: HTMLButtonElement
  clear: HTMLButtonElement
  alpha: HTMLInputElement
  mode: HTMLSelectElement
  submission: HTMLInputElement
}

/** Concrete Web mapping, shared by the element and explicit native interoperability entry. */
export function mapColorPicker(root: HTMLElement): ColorPickerNative {
  const document = root.ownerDocument, view = document.defaultView!
  const own = (node: Element) => node.closest("[data-color-picker], m-color-picker") === root
  function find(marker: string) {
    const nodes = [...root.querySelectorAll<HTMLElement>(`[${marker}]`)].filter(own)
    if (nodes.length > 1) throw new TypeError(`Author at most one ${marker}.`)
    return nodes[0] ?? null
  }
  const marked = new Map(["control", "hex", "entry", "output", "apply", "revert", "clear", "alpha", "mode", "value"].map(part => [part, find(`data-color-${part}`)]))
  const inputParts = ["control", "hex", "alpha", "value"]
  for (const [part, node] of marked) if (node && (inputParts.includes(part) ? !(node instanceof view.HTMLInputElement)
    : ["apply", "revert", "clear"].includes(part) ? !(node instanceof view.HTMLButtonElement)
    : part === "mode" ? !(node instanceof view.HTMLSelectElement) : false)) throw new TypeError(`Invalid native ColorPicker ${part}.`)
  const existing = marked.get("control") ?? [...root.querySelectorAll<HTMLInputElement>('input[type="color"]')].find(own)
  if (existing && (!(existing instanceof view.HTMLInputElement) || existing.type !== "color")) throw new TypeError("Use a native color control.")
  const nodes = [...marked.values()].filter(Boolean)
  if (new Set(nodes).size !== nodes.length) throw new TypeError("ColorPicker native parts must be distinct.")
  root.setAttribute("data-color-picker", "")
  function create<K extends keyof HTMLElementTagNameMap>(part: string, tag: K, parent: HTMLElement = root): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag)
    node.setAttribute(`data-color-${part}`, "")
    node.setAttribute("data-color-generated", "")
    parent.append(node)
    return node
  }
  function labelled<T extends HTMLInputElement | HTMLSelectElement>(node: T, text: string): T {
    const label = document.createElement("label")
    if (node.hasAttribute("data-color-alpha")) { label.setAttribute("data-color-alpha-label", ""); label.hidden = true }
    label.append(document.createTextNode(text), node)
    root.append(label)
    return node
  }
  const control = existing instanceof view.HTMLInputElement ? existing : labelled(create("control", "input"), "Color")
  control.setAttribute("data-color-control", "")
  control.type = "color"
  const entry = marked.get("entry") ?? create("entry", "div")
  if (!marked.get("entry")) entry.hidden = true
  const hex = marked.get("hex") as HTMLInputElement | null ?? create("hex", "input", entry)
  if (!marked.get("hex")) {
    hex.type = "text"; hex.disabled = true
    const label = document.createElement("label"); label.append("Color draft", hex); entry.append(label)
  }
  function button(part: string, text: string): HTMLButtonElement {
    const authored = marked.get(part) as HTMLButtonElement | null
    if (authored) return authored
    const node = create(part, "button", part === "clear" ? root : entry)
    node.type = "button"; node.textContent = text; node.hidden = true
    return node
  }
  const output = marked.get("output") ?? create("output", "span")
  if (!marked.get("output")) output.hidden = true
  const alpha = marked.get("alpha") as HTMLInputElement | null ?? labelled(create("alpha", "input"), "Alpha (0-1)")
  if (!marked.get("alpha")) { alpha.type = "range"; alpha.min = "0"; alpha.max = "1"; alpha.step = "0.001"; alpha.value = "1"; alpha.hidden = true }
  const mode = marked.get("mode") as HTMLSelectElement | null ?? labelled(create("mode", "select"), "Color mode")
  const submission = marked.get("value") as HTMLInputElement | null ?? create("value", "input")
  if (!marked.get("value")) submission.type = "hidden"
  if (submission.hasAttribute("data-color-generated")) control.after(submission)
  return { control, hex, entry, output, alpha, mode, submission, apply: button("apply", "Apply"), revert: button("revert", "Restore draft"), clear: button("clear", "Clear") }
}
