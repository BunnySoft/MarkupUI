/** Private light-DOM adoption mechanics, not a property dispatcher. */
export class NativeOwner<T extends HTMLElement> {
  public element: T | null = null
  private generated: T | null = null
  private observer: MutationObserver | undefined
  private readonly forwarded = new Set<string>()

  public constructor(private readonly host: HTMLElement, private readonly refresh: () => void, private readonly tag: string) {}

  public disconnect(): void { this.observer?.disconnect() }

  public attribute(name: string, value: string | null): string | null {
    return value ?? this.element?.getAttribute(name) ?? this.host.querySelector(`:scope > :is(${this.tag})`)?.getAttribute(name) ?? null
  }

  public forward(name: string): void {
    this.forwarded.add(name)
    if (this.element) {
      const value = this.host.getAttribute(name)
      if (value === null) this.element.removeAttribute(name)
      else this.element.setAttribute(name, value)
    }
  }

  public synchronize(tag: string, part: string): T {
    this.disconnect()
    try {
      if (this.element?.parentNode !== this.host) this.element = null
      const nodes = [...this.host.childNodes]
      const significant = nodes.filter(node => node.nodeType !== 8 && (node.nodeType !== 3 || node.textContent?.trim()))
      const heading = /^h[1-6]$/
      const accepts = (node: Node): node is HTMLElement => node instanceof HTMLElement
        && (node.localName === tag || heading.test(tag) && heading.test(node.localName))
      let obsolete: T | null = null
      const late = significant.filter(node => node !== this.element)
      if (this.element === this.generated && this.element && late.length === 1 && accepts(late[0]!)
        && ![...this.element.childNodes].some(node => node.nodeType !== 8 && (node.nodeType !== 3 || node.textContent?.trim()))) {
        obsolete = this.element
        this.element = late[0] as T
        this.generated = null
      }
      const candidate = significant.length === 1 && accepts(significant[0]!) ? significant[0] : null
      if (!this.element && candidate && (candidate.localName === tag || heading.test(tag) && heading.test(candidate.localName))) {
        this.element = candidate as T
        this.generated = null
      }
      const content = this.element
        ? [...this.element.childNodes, ...significant.filter(node => node !== this.element && node !== obsolete)]
        : nodes
      if ((tag === "ul" || tag === "ol") && content.some(node =>
        node.nodeType === 1 ? (node as Element).localName !== "li" : node.nodeType !== 8 && !!node.textContent?.trim())) {
        throw new TypeError("Typography lists require native li children; nest lists inside an li.")
      }
      if ((tag === "p" || heading.test(tag)) && content.some(node => node.nodeType === 1
        && (node as Element).matches("p,h1,h2,h3,h4,h5,h6,ul,ol,blockquote,m-p,m-heading,m-ul,m-ol,m-blockquote"))) {
        throw new TypeError("Paragraph and Heading content must be phrasing, not nested block owners.")
      }
      if (tag === "a" && content.some(node => node.nodeType === 1 && ((node as Element).matches("a,m-link")
        || (node as Element).querySelector("a,m-link")))) throw new TypeError("Link content cannot contain nested anchors.")
      const active = this.host.ownerDocument.activeElement as HTMLElement | null
      const selection = this.host.ownerDocument.getSelection()
      const anchor = selection?.anchorNode
      const focus = selection?.focusNode
      const anchorOffset = selection?.anchorOffset ?? 0
      const focusOffset = selection?.focusOffset ?? 0
      let moved = false
      const move = (parent: HTMLElement, node: Node, before: Node | null = null) => {
        moved = true
        if ("moveBefore" in parent && parent.isConnected && node.isConnected && node.parentNode) {
          (parent as HTMLElement & { moveBefore(node: Node, before: Node | null): void }).moveBefore(node, before)
        } else parent.insertBefore(node, before)
      }
      if (!this.element || this.element.localName !== tag) {
        const previous = this.element
        const shell = this.host.ownerDocument.createElement(tag) as T
        if (previous) for (const attribute of previous.attributes) shell.setAttribute(attribute.name, attribute.value)
        this.host.insertBefore(shell, previous ?? this.host.firstChild)
        if (previous) {
          for (const node of [...previous.childNodes]) move(shell, node)
          previous.remove()
        }
        this.element = shell
        this.generated = shell
      }
      const owner = this.element
      if (obsolete) {
        const first = owner.firstChild
        for (const node of [...obsolete.childNodes]) move(owner, node, first)
        obsolete.remove()
      }
      const before = [...this.host.childNodes].slice(0, [...this.host.childNodes].indexOf(owner))
      const first = owner.firstChild
      for (const node of before) move(owner, node, first)
      for (const node of [...this.host.childNodes]) if (node !== owner) move(owner, node)
      owner.dataset.part = part
      for (const name of this.forwarded) this.forward(name)
      if (moved) {
        if (active && owner.contains(active) && this.host.ownerDocument.activeElement !== active) active.focus({ preventScroll: true })
        if (selection && anchor && focus && owner.contains(anchor) && owner.contains(focus)) {
          selection.setBaseAndExtent(anchor, anchorOffset, focus, focusOffset)
        }
      }
      return owner
    } finally {
      if (this.host.isConnected) {
        this.observer ??= new MutationObserver(this.refresh)
        this.observer.observe(this.host, { childList: true, subtree: true })
      }
    }
  }
}
