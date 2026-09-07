export abstract class MuiElement extends HTMLElement {
  protected emit(name: string, detail?: unknown): void {
    this.dispatchEvent(new CustomEvent(`mui:${name}`, {
      bubbles: true,
      detail,
    }))
  }

  protected numberAttribute(name: string, fallback: number): number {
    const attribute = this.getAttribute(name)
    if (attribute === null || attribute.trim() === "") return fallback
    const value = Number(attribute)
    return Number.isFinite(value) ? value : fallback
  }
}
