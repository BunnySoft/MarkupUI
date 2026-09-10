# Switch default-style audit

## Scope and provenance

Audited **2026-09-10** from MarkupUI **`bf72543`**. Only optional Switch CSS, targeted
tests and documentation changed. The same original `input[type=checkbox][role=switch]`
continues to own checkedness, labels, keyboard, forms and focus. The existing loading
helper is unchanged; no replacement controls, binding or template layer.

Rendered reference: **Naive UI 2.45.3 / Vue 3.5.30**, pinned source
[`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch).
Inspected `styles/light.ts`, `styles/dark.ts`, `styles/_common.ts` and
`src/styles/index.cssr.ts`. In particular, rendered Switch disabled rail opacity is
**.5 in both themes**; the common dark opacity value is not used by that CSS rule.

Chromium **151.0.7922.174**, isolated contexts, **1000×1000** viewport, separate
reference/native pages on private loopback **53117**, 360px fixture columns and
white / `#101014` canvases. Fixtures use “Email alerts”, On/Off state text, independently
authored +/− symbols, and “Working…” loading text. Reference captions are external;
native captions are real labels. No customer data or network service.

Evidence is under session
`99fde562-4396-4c35-9601-b00d03e1c14e\files\switch-audit-private`: authored fixture
pages/cases/server, `before.css`, `measurements.json`, six light/dark reference/before/
after PNGs, and isolated `budgets.mjs`/`budgets.json`. Reference transitions settled
before measurements. Screenshots and thumb pixel bounds were actually obtained.

## Obtained geometry

| Metric | Before | Reference = after |
| --- | ---: | ---: |
| Small rail | 36×20 | 32×18 |
| Medium rail | 44×24 | 40×22 |
| Large rail | 52×28 | 48×26 |
| Small / medium / large thumb image | 14 / 18 / 22 | 14 / 18 / 22 |
| Small / medium / large caption font | 14 / 16 / 18 | 14 / 14 / 14 |
| Small / medium / large caption gap | 7 / 8 / 9 | 8 / 8 / 8 |

The reference thumb sits 2px from the default rail edges. The old gradient used the
padding box, adding the input border to its horizontal inset. The corrected gradient
uses **`background-origin:border-box`**, a 2px unchecked inset and
`calc(100% - 2px)` checked positioning. Its vertical placement is centered: default
rail/thumb differences give a 2px inset. RTL reverses those logical positions.

The native gradient has no thumb DOM rectangle. Its **image dimensions and painted
pixels**, not an invented element, are measured. Dark medium screenshots are 40×23
raster crops because of fractional layout edges:

| Near-white thumb pixels (all RGB channels ≥250) | Reference | Before | After |
| --- | --- | --- | --- |
| Off horizontal bounds | x=3…18 | x=3…19 | x=2…19 |
| On horizontal bounds | x=21…36 | x=24…40 | x=20…37 |
| Medium vertical bounds | y=3…19 | y=4…20 | y=3…19 |

These threshold bounds are not the nominal geometric diameter. Different edge
antialiasing and the reference's knob shadows explain residual white-pixel differences:
reference medium off has **218** near-white pixels versus **226** after.
The original outer width/height and border-origin displacement are fixed.

## Paint and remaining skin boundaries

| Role | Before | After / reference |
| --- | --- | --- |
| Unchecked light rail | `#687787` | Black 14% |
| Unchecked dark rail | `#687787` | White 20% |
| Checked light rail | `#075eae` | `#18a058` |
| Checked dark rail | `#075eae` | **`#2a947d`** |
| Normal disabled input opacity | .65 | **.5 in both schemes** |
| Light focus | Blue outline/border | 2px ring, primary 20% |
| Dark focus | Same blue outline/border | 8px glow, primary 30% |

The dark active Switch rail uses upstream **supplementary primary**, not ordinary
primary `#63e2b7`. The light active rail and focus roles reuse the correct shared primary;
the dark supplementary value is local because the shared palette has no matching role.
`--mui-switch-active` remains the public override. Local neutral text fallbacks avoid
legacy shared-role mismatches; the original `system-ui,sans-serif` font stack is retained.

Actual dark screenshot samples confirm:

- Off rail: reference and after **RGB 63,63,67**, versus before **104,119,135**.
- On rail: reference and after **42,148,125**, versus before **7,94,174**.
- Disabled on rail: reference and after **29,82,72**, versus before **10,66,120**.
- Disabled thumb center: reference and after **136,136,138**, versus before **171,171,173**.

The transparent border remains available for authored status and visible dashed loading
paint, without adding a default colored outline. Round rails keep a clamped pill radius;
`data-square` uses a 3px rail radius.
Settled hover left the default rail/knob paint unchanged in both implementations;
the reference's pressed rubber-band behavior is outside the retained scope.

**Not claimed as exact parity:**

- The retained single-image thumb does not reproduce the reference knob's drop/inset
  shadows. The gradient is a flat, independently authored circle, not copied
  vendor artwork. The square thumb remains flat/sharp rather than a separate 3px-rounded
  knob. No pseudo-control or hidden native input was introduced to mask this boundary.
- On/Off text and +/− icons remain adjacent authored, aria-hidden content. They are not
  inserted inside a void input or measured into a generated rail. The reference On/Off
  case widens to **57.8229px**; the native rail stays **40px** with external state text.
- Loading retains a visible dashed boundary and authored “Working…” indicator, not
  the reference spinner inside the knob. It does not dim the input or change native
  disabled state. Rubber-band pressing, thumb-slot rendering and transition engines
  remain omitted.
- Native disabled caption dimming is retained using its explicit label token. The
  external reference fixture caption is not owned/dimmed by NSwitch itself.

## Author and native-policy verification

Public tokens are never assigned by size/square/status defaults. A small dark field
with authored overrides measured **64×32px**, **24×24px** thumb image, **18px** font
and **5px** radius, with exact authored rail/active/text/disabled/border/focus colors.
A thumb-color override directly on the square input remained effective, and an explicit
thumb-image token won over the square gradient.

- `pnpm test -- tests\switch.test.ts`: **44/44 passed**, comprising all 39 original native
  tests plus five CSS regressions.
- Real Space emitted exactly native `input`, then `change`, retaining the original
  input and role. Loading cancelled the next native toggle without losing focus,
  changing checkedness, setting native disabled, or dropping its successful form value.
- Silent checked updates, changed defaultChecked/submission defaultValue, native reset
  and cancelled label activation passed. Reset retained loading; no fabricated events.
  Explicit mixed-state refresh still rejected the invalid binary state while the same
  control fell back to native appearance. First-legend disabling stayed native.
- The Chromium accessibility tree retained one role **switch**, named **“Email alerts”**,
  focused/focusable and busy while checked changed **true→false**. ARIA-disabled was
  reported while native `.disabled` stayed false. This is browser-tree evidence, not
  screen-reader speech certification.
- **Forced colors and print:** all checked/unchecked, enabled/busy, explicitly disabled
  and fieldset-disabled cases in both themes restored `appearance:auto`, `opacity:1`,
  no custom background image or shadow, auto accent and visible **15.75px** native
  controls. Keyboard focus retained a solid Highlight outline. Returning to normal
  themes restored disabled opacity **.5**, not compounded system-disabled fading.
- **Reduced motion:** both reduce and no-preference contexts reported **0s transitions,
  no animation name and zero Web Animations**. Instant state updates remain the retained
  policy; no transition, loading spinner or gesture semantics were removed for bytes.
- RTL checked/off positions were **2px / calc(100% − 2px)**. At 360px and 200% CSS zoom,
  scroll/client width both measured **345px**. A JavaScript-disabled context retained
  native Space, state-text selection, reset, hidden loading text and FormData.

No all-engine, OS animation, physical high-contrast-system or assistive-technology
certification is inferred from these Chromium emulation and browser-tree checks.

## Exact isolated budgets

Existing ES2022 minified ESM/IIFE recipes, source maps, no legal comments; CSS copied
verbatim; gzip level **9**. No scripts or ceilings changed.

| Asset | Raw bytes | Gzip bytes | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-switch.js` | 5,513 | 2,268 | 3,500 |
| `markup-ui-switch.global.js` | 5,673 | 2,343 | 3,500 |
| `markup-ui-switch.css`, working LF | 4,188 | 1,243 | 1,250 |
| Same CSS, normalized CRLF checkout | 4,189 | 1,246 | 1,250 |

CSS compaction uses installed esbuild whitespace formatting, short component-private
`--_sw-*` names, and removal of optional comma/declaration-colon whitespace. Required
calculation whitespace and all native/loading/hidden/forced-colors/motion policies remain.
CRLF headroom is **4 gzip bytes**. Enhanced totals are **3,511 ESM / 3,586 classic**
working-tree gzip bytes, or **3,514 / 3,589** with CRLF. JavaScript is unchanged.
No full build, dependency change, shared/generated-file update, commit or push.

## Coordinated release integration

The coordinator's isolated release `pnpm build` and all **44 Switch tests** passed.
Final CSS is **4,189 raw / 1,246 gzip bytes**, within the unchanged 1,250-byte ceiling.
Native helper JavaScript is unchanged; gradient-thumb and external-content boundaries
remain explicit. Unfinished unrelated work is excluded from the release.
