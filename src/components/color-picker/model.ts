export const colorModes = ["hex", "rgb", "hsl"] as const
export type ColorMode = typeof colorModes[number]

/** Internal eight-bit sRGB and thousandth-resolution alpha, never a public value wrapper. */
export interface Color { r: number; g: number; b: number; a: number }
export interface ColorPickerOptions {
  value?: string
  defaultValue?: string
  modes?: readonly ColorMode[]
  mode?: ColorMode
  showAlpha?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  form?: string | null
}
export interface ColorPickerSettings {
  modes: readonly ColorMode[]
  mode: ColorMode
  showAlpha: boolean
  disabled: boolean
  readOnly: boolean
  required: boolean
  name: string
  form: string | null
}

const decimal = "(?:\\d+(?:\\.\\d{1,3})?|\\.\\d{1,3})"
const rgb = new RegExp(`^(rgb|rgba)\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*(${decimal}))?\\s*\\)$`, "i")
const hsl = new RegExp(`^(hsl|hsla)\\(\\s*(${decimal})(?:deg)?\\s*,\\s*(${decimal})%\\s*,\\s*(${decimal})%(?:\\s*,\\s*(${decimal}))?\\s*\\)$`, "i")
export const round = (value: number): number => Math.round(value * 1000) / 1000
function bounded(value: string, max: number): number {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > max) throw new RangeError(`Color channel must be between 0 and ${max}.`)
  return number
}

export function parseColor(value: unknown): Color | null {
  if (typeof value !== "string") throw new TypeError("Color value must be a string.")
  if (value === "") return null
  if (value.trim() !== value || /[\r\n]/.test(value)) throw new TypeError("Color syntax cannot contain surrounding whitespace or line breaks.")
  const hex = /^#([\da-f]{6})([\da-f]{2})?$/i.exec(value)
  if (hex) return {
    r: parseInt(hex[1]!.slice(0, 2), 16), g: parseInt(hex[1]!.slice(2, 4), 16), b: parseInt(hex[1]!.slice(4, 6), 16),
    a: hex[2] ? round(parseInt(hex[2], 16) / 255) : 1,
  }
  const channels = rgb.exec(value)
  if (channels) {
    if ((channels[1]!.toLowerCase() === "rgba") !== (channels[5] !== undefined)) throw new TypeError("Use rgb(r,g,b) or rgba(r,g,b,a).")
    return { r: bounded(channels[2]!, 255), g: bounded(channels[3]!, 255), b: bounded(channels[4]!, 255), a: channels[5] === undefined ? 1 : bounded(channels[5], 1) }
  }
  const polar = hsl.exec(value)
  if (polar) {
    if ((polar[1]!.toLowerCase() === "hsla") !== (polar[5] !== undefined)) throw new TypeError("Use hsl(h,s%,l%) or hsla(h,s%,l%,a).")
    const h = bounded(polar[2]!, 360) / 60, s = bounded(polar[3]!, 100) / 100, l = bounded(polar[4]!, 100) / 100
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(h % 2 - 1)), m = l - c / 2
    const [r, g, b] = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x]
    return { r: Math.round((r! + m) * 255), g: Math.round((g! + m) * 255), b: Math.round((b! + m) * 255), a: polar[5] === undefined ? 1 : bounded(polar[5], 1) }
  }
  throw new TypeError("Use #RRGGBB, #RRGGBBAA, rgb/rgba integer channels or comma-separated hsl/hsla; no other CSS color syntax is supported.")
}

export function rgbHex(color: Color): string {
  return "#" + [color.r, color.g, color.b].map(channel => channel.toString(16).padStart(2, "0")).join("")
}
export function serializeColor(color: Color | null): string {
  return !color ? "" : color.a === 1 ? rgbHex(color) : `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}
export function formatColor(color: Color | null, mode: ColorMode): string {
  if (!color) return ""
  if (mode === "hex") return rgbHex(color)
  if (mode === "rgb") return color.a === 1 ? `rgb(${color.r}, ${color.g}, ${color.b})` : serializeColor(color)
  const r = color.r / 255, g = color.g / 255, b = color.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min, l = (max + min) / 2
  const h = !delta ? 0 : ((max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4) * 60)
  const s = !delta ? 0 : delta / (1 - Math.abs(2 * l - 1))
  const fields = `${round(h)}, ${round(s * 100)}%, ${round(l * 100)}%`
  return color.a === 1 ? `hsl(${fields})` : `hsla(${fields}, ${color.a})`
}
export function validateSettings(options: ColorPickerOptions, before: ColorPickerSettings): ColorPickerSettings {
  if (!options || typeof options !== "object" || Array.isArray(options)) throw new TypeError("Use a ColorPicker settings record.")
  const modes = options.modes === undefined ? before.modes : options.modes
  if (!Array.isArray(modes) || !modes.length || modes.some(mode => !colorModes.includes(mode)) || new Set(modes).size !== modes.length) throw new TypeError("modes must be a nonempty, unique selection of hex, rgb and hsl.")
  const mode = options.mode === undefined ? (modes.includes(before.mode) ? before.mode : modes[0]!) : options.mode
  if (!modes.includes(mode)) throw new TypeError("mode must belong to modes.")
  for (const key of ["showAlpha", "disabled", "readOnly", "required"] as const) if (options[key] !== undefined && typeof options[key] !== "boolean") throw new TypeError(`${key} must be boolean.`)
  if (options.name !== undefined && typeof options.name !== "string" || options.form !== undefined && options.form !== null && typeof options.form !== "string") throw new TypeError("name/form must be strings (form may be null).")
  return { modes: Object.freeze([...modes]), mode, showAlpha: options.showAlpha ?? before.showAlpha, disabled: options.disabled ?? before.disabled,
    readOnly: options.readOnly ?? before.readOnly, required: options.required ?? before.required, name: options.name ?? before.name, form: options.form === undefined ? before.form : options.form }
}
