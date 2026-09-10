# Slider default-style audit

## Scope and provenance

Audited **2026-09-11** from observed MarkupUI **`67aee79`**. Only optional Slider CSS,
targeted tests and documentation changed. The existing native range inputs, plain-text
formatter and independent two-track pair helper are untouched. No custom thumb/rail
pseudo-elements, fake slider roles, hidden controls, drag engine, binding or range renderer.

Rendered reference: **Naive UI 2.45.3 / Vue 3.5.30**, pinned source
[`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider).
Inspected `styles/light.ts`, `styles/dark.ts`, `styles/_common.ts` and
`src/styles/index.cssr.ts`. The reference has a 4px rail, 18px white handle and dedicated
marks/tooltip layers; those are not the retained native rendering model.

Chromium **151.0.7922.174**, isolated browser contexts, **1000×1200** viewport and
separate reference/native pages on private loopback **58126**. Fixtures use 360px and
180px widths, values 0/25/50/100, bounds 0–100/step 5, Low/Middle/High marks, and
“50 percent” formatting. Vertical length is 192px; pair defaults are [20,80].
Reference and native pair layouts are deliberately contrasted, not claimed equivalent.

Private artifacts: session
`99fde562-4396-4c35-9601-b00d03e1c14e\files\slider-audit-private`, containing authored
fixture pages/cases/server, `before.css`, `measurements.json`, six reference/before/after
light/dark PNGs, two hovered reference-tooltip PNGs, and isolated budget scripts/results.
Reference transitions settled before measurements. Pixel samples were obtained from
actual screenshots rather than inferred from native pseudo-element computed styles.

## Geometry and typography fixes

| Case | Before | After | Reference |
| --- | ---: | ---: | ---: |
| Ordinary 360px control box | 360×16 | 360×18 | Component 360×18 |
| Ordinary wrapper height | 32 | 18 | 18 |
| Native input block margins | 8px each | 0 | 0 |
| Native datalist input height | 22 | **22 retained** | Drawn component 18 |
| Datalist + readout + static scale wrapper | 99 | 80 | Different mark/tooltip structure |
| Formatted-readout wrapper | 64 | 47 | Component 18 + floating tooltip |
| Readout font / line box | 16 / 24 | 14 / 21 | Tooltip font 14 |
| Static scale font | 14 | 14 | Mark font 14 |
| Native vertical control | 32×192 | **32×192 retained** | Component 18×192 |
| Native vertical wrapper height | 208 | 192 | 192 |

The minimum block size raises a plain range to the reference component footprint,
without forcing a smaller height onto native datalist ticks. There is no new size prop
or replacement-thumb geometry. Full inline sizing, author direction and vertical length
remain native CSS. The pair keeps its labelled fieldset and two separate tracks.

Both root types now use border-box sizing. An explicitly full-width pair measured
**360px in a 360px content-box host**, without a global sizing reset. Pair padding is
12px with a 3px boundary radius; individual range controls retain their original
border-box/full-inline-size behavior.

## Paint fixes and native limits

Text/readout defaults are now **#333639** in light and white **82%** in dark, rather than
the old fixed #17212b. The pair boundary uses local reference neutral roles, not legacy
shared text/border aliases. The native accent changes from blue #075eae to light primary
**#18a058** and dark **supplementary primary #2a947d**. The latter follows Slider's
actual dark fill role, not ordinary dark primary #63e2b7.

The public accent/focus/color/border/length tokens remain authoritative. In a dark
fixture, authored purple accent, blue focus, dark text, red fieldset boundary and
**256px** vertical length all computed as specified.

Actual middle-slider screenshot samples:

| Pixel location | Reference light | Native after light | Reference dark | Native after dark |
| --- | --- | --- | --- | --- |
| Filled rail | 24,160,88 | **24,160,88** | 42,148,125 | **42,148,125** |
| Unfilled rail | 219,219,223 | **59,59,59** | 63,63,67 | **59,59,59** |
| Thumb center | 255,255,255 | **24,160,88** | 255,255,255 | **42,148,125** |
| Disabled fill | 138,207,170 | **203,203,203** | 25,66,60 | **117,117,117** |
| Disabled thumb center | 255,255,255 | **203,203,203** | 107,107,109 | **117,117,117** |

These are RGB samples at the tested viewport, with forced colors off. In this Chromium
run the remaining native rail stayed #3b3b3b even under the explicit light scheme.
The green filled rail is corrected; native track thickness, thumb color/shape, endpoint
insets and disabled/hover treatment are **not exact reference paint**.

The stylesheet does not independently recolor or resize a native thumb to fake Naive's
white 18px shadowed handle. It does not add .5/.38 wrapper opacity on top of native
disabled paint. Native keyboard focus retains a visible full-control outline, rather
than pretending to reproduce the reference's handle-only focus styling.

## Marks, tooltip labels and pair boundaries

- Native datalist ticks remain native ticks, not the reference's 8px circular mark dots.
  The three visible scale labels remain authored flex content. Their positioning is
  not a renderer for arbitrary mark-value coordinates.
- A native ArrowRight with marks 0/50/100 and step 5 moved **50→55**, proving that marks
  do not become a hidden selectable-value set or step="mark" implementation.
- Hovering the reference formatted handle rendered a real **85.8125×33px** tooltip:
  14px text, white on black 85% in light; white 82% on **#48484e** in dark.
  The retained output is instead persistent **360×21px** non-live plain text in document
  flow. It has no popup background, portal, positioning or tooltip lifecycle.
- Native output and DOM `aria-valuetext` both updated to **“55 percent”**. The same
  Chromium accessibility-tree probe still reported numeric `valuetext: "55"`, despite
  the correct DOM attribute. Formatted speech is not certified; no duplicate role or
  proxy handle was added as a workaround.
- The pair remains two independently named tracks. Its legend, labels and readouts
  necessarily differ from the reference one-track/two-handle renderer. Crossing is
  allowed and the tuple is never silently sorted or used to rewrite endpoint bounds.

## Native and safety verification

- `pnpm test -- tests\slider.test.ts`: **42/42 passed** (37 original native cases and
  five CSS regressions). No unrelated selectors/full suite.
- Native midpoint remained **50** with absent value/defaultValue `""`. ArrowRight
  changed 50→55 with one trusted input/change pair on the original input. Home/End
  reached 0/100; a real mouse drag reached **80**.
- Native sanitization gave 53→55, 999→100, and retained **12.345** with step=any.
  Vertical ArrowUp changed 50→55; reversed native ArrowLeft changed 25→30.
- Crossed pair **[90,10]** stayed unordered and submitted two native strings in endpoint
  order. After [65,75], native reset immediately restored **[20,80] before helper refresh**
  with min/max/default attributes unchanged. One keyboard commit emitted one deferred,
  nonbubbling pair notification.
- Disabled pair fields still accepted explicit programmatic [30,70], but were absent
  from FormData. Fieldset disabling and its first-legend exemption remained native.
- **Forced colors:** all controls retained native appearance, auto accent, opacity 1,
  nonzero visible dimensions and a solid Highlight focus outline. No value/bound/step
  changes occurred when media switched.
- **Print:** native ranges and already-visible outputs remained present, with owned
  content using a light system canvas: black text on white. Originally hidden no-JS
  readouts stayed hidden. Normal disabled paint was not additionally faded.
- **Reduced motion:** no declared animations and 0s transitions; values and bounds stayed
  unchanged. RTL at 360px/200% CSS zoom had equal **345px scroll/client widths**.
- A JavaScript-disabled two-track form allowed native crossing [100,80], submitted both
  original values, reset to [20,80], and never exposed stale hidden readouts.

These are Chromium and browser-tree observations, not all-engine, native-theme pixel,
physical high-contrast/printer, browser-chrome-zoom, OS animation or AT speech certification.

## Exact isolated budgets

Existing ES2022 minified ESM/IIFE recipes, source maps enabled, no legal comments;
CSS copied verbatim; gzip level **9**.

| Asset | Raw bytes | Gzip bytes | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-slider.js` | 6,493 | 2,612 | 3,500 |
| `markup-ui-slider.global.js` | 6,650 | 2,680 | 3,500 |
| `markup-ui-slider.css` | 2,480 | 854 | 1,000 |

Readable source CSS is already CRLF; normalized CRLF checkout is also **2,480 / 854**,
leaving **146 gzip bytes**. Enhanced totals are **3,466 ESM / 3,534 classic gzip bytes**.
JavaScript, shared helpers/themes, dependencies, scripts and generated assets are
unchanged. No full build, commit or push; release integration remains parent-owned.

## Coordinated release integration

The coordinator's isolated release build and **80 Slider/Rate tests** passed,
including all **42 Slider tests**. Final Slider CSS is **854/1,000 gzip bytes**.
Native range controls, pair ordering, value/formatting helpers and their documented
browser-paint boundaries remain unchanged.
