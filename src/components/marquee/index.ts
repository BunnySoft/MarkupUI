export { Marquee, registerMarquee } from "./marquee-element.js"
export { createMarquee } from "./marquee.js"
export type { MarqueeSettings, MarqueeOptions, MarqueeState, MarqueeController } from "./marquee.js"

import { registerMarquee } from "./marquee-element.js"

if (typeof customElements !== "undefined") {
  registerMarquee()
}
