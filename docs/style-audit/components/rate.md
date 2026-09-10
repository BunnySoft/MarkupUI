# Rate native-control style audit

**Status:** integrated native-control styling; Chromium comparison,
2026-09-11. Real radio choices, visible numeric labels, checked/default/value/form semantics,
explicit clear and static readonly policy remain. No renderer, binding or API was added.

## Reference and evidence

- Pinned commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [Rate](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/src/Rate.tsx),
  [CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/src/styles/index.cssr.ts),
  [light](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/styles/light.ts)
  / [dark theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/styles/dark.ts).
- Actual reference: installed `naive-ui@2.45.3` / `vue@3.5.30`, light/dark configuration.
  Source readonly is used as the noninteractive palette comparison: source Rate has no
  equivalent native disabled-fieldset API.
- Private fixture `files\style-reference\rate-audit`, port **4225**: case/source/build/server
  files, `before.json`, final expanded `after.json`, `boundaries.json` and
  `{reference,before,after,legacy}-{light,dark}-ltr.png`. Responses explicitly use UTF-8.
- Isolated Chromium contexts closed in `finally`; 800×1900 viewport, requested DPR 1.
- Ten cases × two themes × four variants = **80 final captured conditions**, covering
  integer/empty/sizes, Unicode and SVG halves, disabled, custom SVG, overrides and readonly.

## Corrected controllable defaults

| Area | Before | Reference / corrected |
| --- | --- | --- |
| Small / medium / large glyph size | 18 / 24 / 32px at 16px root | **16 / 20 / 24px** |
| Active light color | Brown `#9c5700` | **Gold `#ffcc33`** |
| Active dark color | Same brown | **Gold `#ccaa33`** |
| Inactive light color | `#687787` | **`#dbdbdf`** |
| Inactive dark color | Same opaque gray | **White .2** |
| Native choice gap | 8px | **6px** |
| Authored SVG baseline | Could add extra inline line-box height | **Block SVG, one-em box** |
| Disabled hover | Could light all stars as a false higher score | **No hover fill from disabled inputs/fieldsets** |
| Public size override | Could lose to data-size preset writes | **Public token wins over private size presets** |

Base five-glyph color sequences matched source in both themes for default, empty, small,
large, disabled/noninteractive, custom SVG and override cases. Corrected native measurements
were identical with later legacy CSS/aggregate loading.

The checked and cumulative-checked rules intentionally still color a disabled selected
rating. Only hover-origin styling requires an enabled native input. This keeps a locked
score readable without pretending that hovering can change it.

## Artwork, spacing and state boundaries

- The fieldset, native radios, numeric labels, chip padding and clear/readout are retained.
  Their total layout is not the source's 5×20px star strip. Six pixels is the inter-choice
  gap; actual star-to-star distances also include native controls and labels.
- No SVG star is generated or substituted for authored text. In this system font a 20px
  Unicode star measured about 16.667px wide, with an 8.333px half-fill. Source default SVG
  is 20px wide with 10px half-fill.
- The controlled authored SVG case matched a **20×20px** glyph and **10×20px** half-fill.
  The old native SVG half box was 12×26px, including the old 24px size and baseline gap.
- Multi-character readonly artwork was preserved: `★★★` remained one span, measuring about
  49.99px at the corrected font size. It was not forced into a one-em box or parsed into
  generated stars. Static text “3.5 out of 5” remains the meaningful readonly value.
- Native half scores remain six visible radio choices for count three, not three stars
  with invisible half-hit zones. RTL retains ascending DOM values and logical-start half
  paint; it does not clone the source's physical-left hit calculation.
- Hover remains emphasis, not numeric preview: hovering score one while three is checked
  leaves three native cumulative glyphs colored, whereas source previews one. Source also
  scales hovered items to 1.05; the native choices add no scale/animation or hover callback.
- Re-activating a selected radio does not clear it. The separate native Clear action still
  means null/no successful rating control, distinct from an explicit zero radio.
- Arbitrary authored SVG fills, Unicode shapes/fonts, hover artwork and platform radio
  chrome are not certified as identical source pixels.

## Real native behavior, high contrast and print

`boundaries.json` records:

- ArrowRight moved score 3→4; subsequent Space on that selected radio caused no second
  commit. One Radio aggregate change occurred and native FormData contained `"4"`.
- Clear produced null, one `mui:rate-clear`, no extra Radio change, no submitted rating,
  and focus returned to a real radio before the clear button hid.
- Native reset restored score 3 and its unchanged defaultChecked baseline.
- A 2.5 half score submitted native `"2.5"` with all six half-step inputs retained.
- Disabled fieldset score 3 remained checked, was excluded from FormData and could not
  be cleared. Hovering its last choice retained exactly the existing three colored glyphs.
  An individually disabled hovered choice also produced no false cumulative preview.
- Public size/color overrides beat the small preset: 30px glyph font and supplied purple.
  Static readonly artwork retained zero controls.
- High contrast made both base and half decoration use system text color. Numeric labels
  and actual radios stayed visible; no hidden selection proxy was introduced.
- Print retained checked state and native auto accents, used black current-color decoration,
  readable text/borders, and hid Clear. Disabled labels retained platform GrayText.
  Decorative color distinctions may collapse; exact scores still come from labels/checked
  controls rather than color alone.
- RTL values remained `0.5,1,1.5,2,2.5,3`, and the native half fill aligned to the logical
  right side in that context.
- With JavaScript disabled, native arrows selected 2.5, Clear stayed hidden, reset returned
  to 1.5 and native GET submission reached `/markup?half=2.5`.

These are Chromium/system-font observations, not all-browser, physical-touch,
screen-reader speech or arbitrary artwork contrast certification.

## Validation and integration gate

- `pnpm test -- tests\rate.test.ts tests\rate.styles.test.ts`: **38 tests passed**.
  Four new stylesheet tests cover private size presets/artwork width, source colors/gap,
  disabled hover versus checked state, and decorative clipping/print/high contrast.
- Rate/Radio controllers, checked/value/event/form semantics, shared helpers and templates
  were not modified.
- Exact isolated level-9 ESM/classic/CSS: **3,904 / 3,976 / 1,243 gzip bytes**, within
  unchanged **4,000 / 4,000 / 1,500** ceilings.
- No shared/index/generated edits, renderer/binding/new API, full build, commit or push.
  Parent's isolated pipeline owns final release validation.

The coordinator's isolated release build and **80 Slider/Rate tests** passed,
including all **38 Rate tests**. Final Rate CSS is **1,243/1,500 gzip bytes**.
Native choices, authored artwork, Radio integration and checked/form behavior are
unchanged; no renderer or binding feature is included.
