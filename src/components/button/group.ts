export class MuiButtonGroup extends HTMLElement {
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["size", "vertical"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiButtonGroup = ""
    if (!this.hasAttribute("role")) this.setAttribute("role", "group")
  }

  public get size(): string { return this.getAttribute("size") ?? "" }
  public set size(value: string) { this.setAttribute("size", value) }
  public get vertical(): boolean { return this.hasAttribute("vertical") }
  public set vertical(value: boolean) { this.toggleAttribute("vertical", value) }
}
