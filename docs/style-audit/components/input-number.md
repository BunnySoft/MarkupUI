# Input Number default-style audit

## Scope and provenance

**Coordinated integration complete:** the isolated release build and **99 combined
Input Number/Pagination tests** passed, including all **42 Input Number tests**.
Final CSS is **3,064 raw / 999 gzip bytes**. Actual emitted CSS, without a global
box-sizing reset, kept a full-width root at **360px** and capped a 1000px authored
nonshrinking input at **124px** inside a padded **160px** root.

Audited **2026-09-10** from observed MarkupUI **`64ed80b`**. Changes are confined to
optional Input Number CSS, targeted tests and documentation. The numeric helper,
its native stepping probe, Input, shared helpers/themes and generated assets are unchanged.
No text proxy, numeric parser, formatter, binding or template API was introduced.

Rendered reference: **Naive UI 2.45.3 / Vue 3.5.30**, pinned source
[`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number).
Inspected InputNumber's `styles/light.ts`, `src/styles/input-number.cssr.ts` and render
anatomy, plus its Input peer's light/dark styles. The reference uses a text input and
internal icon buttons; the retained helper uses the actual authored number input.

Chromium **151.0.7922.174**, isolated contexts, **1000×1200** viewport, separate pages
on owned loopback **54702** and 360px fields. Fixtures use quantity 2, bounds 0–10,
step .5, “Quantity” placeholder, `$`/`USD` affixes, and independently authored 18px
plus/minus strokes. Clear uses a separate authored 16px cross. No vendor SVG paths,
customer data or service calls.

Private evidence lives in session
`99fde562-4396-4c35-9601-b00d03e1c14e\files\input-number-audit-private`: authored fixture
pages/cases/server, `before.css`, `measurements.json`, six reference/before/after
light/dark PNGs, and `budgets.mjs`/`budgets.json`. Hover/focus measurements settled after
reference transitions. Shared preview/release infrastructure was not used.

## Obtained geometry

| Metric | Before | Reference = after |
| --- | ---: | ---: |
| Tiny row / native field height | 31.333 / 23.333 | 22 / 22 |
| Small row / native field height | 31.333 / 30.333 | 28 / 28 |
| Medium row / native field height | 41.333 / 41.333 | 34 / 34 |
| Large row / native field height | 52.333 / 52.333 | 40 / 40 |
| Tiny / small / medium / large font | 12 / 14 / 16 / 18 | 12 / 14 / 14 / 15 |
| Default medium native control width | 269.333 | 300 |
| Default medium control left edge | 0 | 12 |
| Default medium minus / plus left edges | 275.333 / 320.667 | 316 / 334 |
| Authored icon action boxes | 39.333×31.333 | 18×18 |
| Both-side placement control left edge / width | 45.333 / 269.333 | 34 / 296 |

The new shared frame removes the old independent button boxes without replacing the
native field. Sizes use private defaults; the existing public sizing tokens remain
author-owned. Action dimensions above are for the fixture's explicit 18px icons:
arbitrary text-button labels remain intrinsic and no artwork renderer is added.

The native input retains inherited 1.5 line-height (21px at medium), versus the reference
text input's 34px line box. Chromium centers the native numeric text within the matching
34px field height; no native caret/selection engine is substituted to force text-input
implementation details.

## Paint

| Default role | Before | After / reference palette |
| --- | --- | --- |
| Light text | `#17212b` | `#333639` |
| Dark text | Same light default | White 82% |
| Light field boundary | `#687787` around input only | `#e0e0e6` shared inset frame |
| Dark background | White native field | White 10% shared field |
| Light disabled field background | White | `#fafafc` |
| Dark disabled field background | White | White 6% |
| Disabled native/action text | `#64707a` / inherited + .6 opacity | `#c2c2c2` / white 38% |
| Ordinary hover/focus boundary | No hover; blue outline | `#36ad6a` light / `#7fe7c4` dark |
| Ordinary focus outside frame | Solid blue outline | 2px primary-20% ring / 8px primary-30% glow |
| Dark focused background | White | Primary at 10% |

These are local preset roles, not aliases for unmigrated shared neutrals. Public
`--mui-number-*` tokens remain the customization boundary; no mandatory Input or
theme-provider dependency was added.

The field boundary is an **inset box-shadow**, not the reference's separate border
elements. Border rasterization can differ at fractional browser scaling; screenshots
are not claimed byte-identical. The ordinary medium dark focus measurement was:
`#7fe7c4` inset 1px, `rgba(99,226,183,.3)` 8px outer glow, and
`rgba(99,226,183,.1)` background.

## Explicit retained presentation differences

- **Affix spacing:** authored siblings use 4px gaps. The reference adds 10px slot
  margins near steppers. With `$`/`USD`, native control width is **257.5729px** versus
  reference **251.5729px**. Both-side affixes start the native field at **45.5521px**
  versus **51.5521px**, with widths **253.5729 / 241.5729px**. Authors who need those
  slot margins can add 6px to their explicitly identified prefix/suffix nodes; the
  helper does not infer or render slots from arbitrary children.
- **Status stays border-only:** success/warning/error select the frame color. They do
  not import Input's separate status-specific hover/caret/focus palette. The ordinary
  focus token/ring remains available in every status. This is a retained presentation
  boundary, not a limitation of browser color rendering.
- **Borderless focus remains visible**, unlike the reference's fully suppressed
  borderless focus paint.
- **Clear remains a real discoverable action** when the helper allows it, rather than
  mounting its content only on hover. Its DOM order is authored and never CSS-reordered.
- **Artwork remains authored.** The fixture's independent strokes establish icon box
  geometry, not identical Naive plus/minus/cross silhouettes.

## Native numeric boundaries and validation

The number input keeps **`appearance:auto`** and its native spinner. No spin-button
pseudo-element suppression exists. A real click at the original input's upper native
spinner hit target changed **2→2.5**, independently of the custom increment button.
The browser may show that spinner only on hover/focus and reserve internal editing
space; Naive's text input does not have this native UI. It is deliberately not hidden.

Native locale/invalid drafts, numeric precision and selection API limits remain:
no currency/locale formatting, last-valid-value buffer, precision rounding or caret shim.
`selectionStart` remained null and `setSelectionRange` raised native InvalidStateError.
Keyboard select-all/replacement still used the real number editor.

- `pnpm test -- tests\input-number.test.ts`: **42/42 passed**, all 37 original native
  tests plus five CSS regressions. No unrelated selectors/full suite.
- Custom increment **9.5→10** emitted exactly one input/change pair, disabled its
  boundary button and returned focus to the original input. A second step was a no-op
  with no events. The DOM still contained exactly **18 inputs**: no stepping probe.
- With value-attribute base **.15**, step **.2** and current **.3**, native stepping
  produced **.35**, retaining the original default and exposing the prior step mismatch.
- Actual typing `-` preserved `{ text:"", value:null, empty:false, badInput:true }`.
  Custom steppers disabled without dimming the focused field or removing its focus ring.
  Continuing to `-1` preserved the native out-of-range number.
- Clearing a bad draft preserved native blur-change ordering, then exactly the helper's
  input/change/clear sequence and focus recovery. `step=any` retained InvalidStateError.
- Native reset restored changed default **4**; readonly **7** remained successful in
  FormData, disabled values were absent. First-legend exemption and inherited fieldset
  disabling remained native.
- All eight author tokens were exercised: **18px font, 20px leading inset, 7px radius**,
  exact text/background/border/disabled colors and an authored blue focus glow.
- **Forced colors:** explicit CanvasText field boundaries and Highlight field/action
  focus remained visible with native number appearance. Disabled actions used system
  GrayText at opacity **1**; a disabled stepper did not disable the field's focus paint.
- Print retained the native field and hid custom actions. Reduced motion had no
  animations and 0s transitions. RTL at 360px/200% CSS zoom had equal **345px**
  scroll/client widths. JavaScript-disabled ArrowUp changed **.1→.2**, submitted .2,
  reset to .1, and kept enhancement-only buttons hidden.

These are Chromium observations, not all-engine, physical high-contrast, OS locale,
IME, browser-chrome zoom or assistive-technology certification.

### Sizing review follow-up

The padded root now explicitly uses `box-sizing:border-box`, and the original number
control's `max-inline-size:100%` guard is restored. A private probe on port **54325**
used no global `*` sizing reset; host containers retained computed `content-box`.

| Authored case | Prior styles simulated | Corrected |
| --- | ---: | ---: |
| Root `width:360px` | 380px outer width | 360px |
| Root `width:100%`, 360px host | 380px outer width | 360px |
| Root `width:100%`, 160px host | 180px outer width | 160px |
| 180px host, public padding 28px/font 18px | 216px outer width | 180px |
| Nonshrinking 1000px input, 160px host with 28px leading padding | 1000px input | 124px input |

The final row demonstrates why the native max-inline-size guard is not redundant for
supported authored overrides. Both host and root scroll/client widths stayed bounded.
At a 360px viewport with RTL and 200% CSS zoom, page scroll/client widths were both
**360px**. Forced-color focus retained a solid outline and native number appearance.
The native value remained `"2"` throughout. Evidence: `sizing-correction.json` beside
the original audit artifacts; existing fixture bundles were served without a build.

## Exact isolated budgets

Existing recipes: ES2022 minified ESM `index.ts` / IIFE `global.ts`, source maps enabled,
no legal comments; CSS copied verbatim; gzip level **9**.

| Asset | Raw bytes | Gzip bytes | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-input-number.js` | 7,320 | 2,859 | 3,500 |
| `markup-ui-input-number.global.js` | 7,495 | 2,932 | 3,500 |
| `markup-ui-input-number.css` | 3,064 | 999 | 1,000 |

The CSS is equivalently whitespace-compacted with short component-private names and
no trailing line ending. Independent declaration ordering, optional color slash spaces,
and an omitted zero shadow spread provide compression without removing any behavior.
Normalized CRLF checkout is also **3,064 / 999**, leaving **1 gzip byte**.
Enhanced totals are **3,858 ESM / 3,931 classic gzip bytes**.
No ceilings were relaxed. Input/shared helpers, JavaScript, dependencies, scripts and
generated assets were not edited. Full build, commit and push remain parent-owned.
