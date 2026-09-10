# Radio default-style audit

## Scope and provenance

Audited **2026-09-10**, starting from observed MarkupUI **`8508842`**. Changes are
limited to optional Radio CSS, Radio-specific tests and documentation. The original
native group helper is unchanged. There is no replacement input, hidden native control,
role-based radio, synthetic arrow handler, binding or template layer.

Reference: rendered **Naive UI 2.45.3 / Vue 3.5.30**, source
[`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio).
Inspected `styles/light.ts`, `styles/dark.ts`, `styles/_common.ts`,
`src/styles/radio.cssr.ts` and `src/styles/radio-group.cssr.ts`.
Reference checked cases explicitly set `checked` or group `value`; this audit measures
default styles, not framework uncontrolled-state parity.

Chromium **151.0.7922.174**, private contexts, **1000×1200** viewport, separate
reference/native pages on owned loopback **51394**. The fixture uses 360px columns,
the same inherited system font stack, light white/dark `#101014` canvases, “Planning
summary”, a multiline accessibility-review label, and Daily/Weekly/Monthly options.
Native groups keep a real “Summary frequency” legend. No customer data or service calls.

Private evidence is in session
`99fde562-4396-4c35-9601-b00d03e1c14e\files\radio-audit-private`: authored fixture
pages/cases/server, `before.css`, `measurements.json`, six reference/before/after
light/dark PNGs, and `budgets.mjs`/`budgets.json`. Reference transitions were allowed
to settle before state measurements. No shared fixture or release worktree was used.

## Geometry and typography

All values are measured CSS pixels in this browser environment. Checked/unchecked
ordinary radios share the same geometry in both schemes.

| Metric | Before | Reference = after |
| --- | ---: | ---: |
| Small circle / font | 16 / 14 | 14 / 14 |
| Medium circle / font | 18 / 16 | 16 / 14 |
| Large circle / font | 22 / 18 | 18 / 15 |
| Small row height / circle top | 21 / 2.667 | 22.3958 / 4.1979 |
| Medium row height / circle top | 24 / 2.667 | 22.3958 / 3.1979 |
| Large row height / circle top | 27 / 2.667 | 24 / 3 |
| Small / medium / large text inset | 23 / 26 / 31 | 22 / 24 / 26 |
| Medium “Planning summary” total width | 156.6771 | 146.34375 |
| Long label at 360px, height | 48 | 44.7917 |
| Small / medium / large button height | 30.333 / 41.333 / 52.333 | 28 / 34 / 40 |

The ordinary label's 8px gap and trailing 8px produce the same visible text spacing
as the reference text wrapper's horizontal padding. `vertical-align:top` prevents
surplus inline native-control baseline space. Group size defaults inherit, while an
explicit medium child in a small group measures **16px**, between two **14px** peers.

RadioButton geometry is deliberately bounded, not fully identical:

- Medium “Daily” is **83.8333px** wide versus reference **59.1667px** because the
  retained native **16px circle + 8px gap** remains visible, plus differing edge borders.
- Labels retain normal **400** weight with no underline, instead of the old selected
  **650** weight/underline. Default button height, font, horizontal padding and palette
  align; native circles and authored wrapping do not disappear to meet upstream width.
- Every native segment has a 3px radius and 4px sibling gap. Naive's first/last corner
  rules, one-pixel generated splitters and border-priority logic are not reproduced.
- Ordinary native groups retain their real fieldset/legend: **69.4583px** high versus
  the reference bare group's **22.3958px** (old native group **80.6667px**). Button groups
  likewise include the native semantic envelope; the medium fieldset is **81.0625px**.

## Paint fixes and explicit native limits

| Authored role | Before | After / reference |
| --- | --- | --- |
| Ordinary light label | `#17212b` | `#333639` |
| Ordinary dark label | Light default | White 82% |
| Disabled label, light / dark | `#64707a` | `#c2c2c2` / white 38% |
| Native accent, light / dark | `#075eae` | `#18a058` / `#63e2b7` |
| Ordinary focus outer ring | Solid blue, 3px offset | 2px, primary 20% light / 30% dark |
| Selected light button | Blue border / pale blue fill | Primary border/text, white fill |
| Selected dark button | Same light defaults | Primary border/fill, black text |
| Disabled button whole-label opacity, normal themes | 1 | .5 light / .38 dark |
| Button focus ring | Double solid outlines | 2px at primary 30% |

Button hover text is primary in both schemes; dark unselected buttons also gain the
reference primary inset boundary. Neutral fallbacks are local, not incorrectly borrowed
from legacy shared text roles. Correct shared semantic primary/warning/error colors are
reused. No palette file changed. Public tokens are never assigned by default selectors.
Forced colors explicitly restores disabled RadioButton label opacity to **1**, avoiding
compounded fading of the native system-disabled control and text.

Native `appearance:auto` remains. Actual **16×17 screenshot crops** (fractional edges
around nominal 16px controls) show the limits that computed native background styles
cannot reveal:

- The checked dot contains exact primary **RGB 24,160,88** in light and **99,226,183**
  in dark. At this rasterization, reference crops contain **36** solid primary pixels,
  versus **54** native pixels: dot/ring geometry is not claimed identical.
- Dark unchecked interior is the page **16,16,20** in the reference, but native
  **59,59,59**. Native hover edges stay browser-gray instead of using the reference's
  fully authored green circular boundary.
- Light disabled fill is reference **250,250,252**, native **248,248,248**; disabled
  dot samples are reference **224,224,230**, native **209,209,209**.
- Dark disabled fill is reference **30,30,33**, native **59,59,59**; disabled dot
  samples are reference **83,83,86**, native **117,117,117**.

Browser dot strokes, unchecked/disabled surfaces and focus-ring outline geometry are
retained native-skin boundaries. No vendor SVG or hidden replacement circle was added.
RadioButton's visible native circle has the same native-skin limitations even though
the surrounding button palette is authored.

All ten public tokens were exercised on a dark small selected button: **20px font,
24px circle, 10px vertical padding**, exact authored label/disabled/accent/focus/border/
background/active colors. Checked text remains readable if `:has()` rules are removed:
fallback primary text stays on the transparent dark surface; enhanced black text is
used only with the enhanced primary-filled parent. This was a simulated CSS fallback,
not an unsupported-engine compatibility claim.

## Native validation

- `pnpm test -- tests\radio.test.ts`: **46/46 passed** (41 original native cases plus
  five CSS regressions). No unrelated selectors/full suite.
- Real ArrowRight selected and focused Weekly, unchecking Daily, and emitted exactly
  `input:Weekly`, `change:Weekly`, then one existing group notification. Space on the
  same selection added no events. Arrows skipped the disabled last peer and wrapped.
- Cancelled label activation restored the prior selection. RadioButton arrows selected
  Weekly while all native circles stayed visible and focused normally.
- Native FormData submitted Weekly; reset restored Daily; silent clear respected native
  required validity. Disabled selected Monthly stayed in helper state but not FormData.
  The first-legend radio remained enabled when the fieldset was disabled.
- Forced colors retained native appearance/auto accent and a solid system focus outline;
  print retained visible native radios. At 360px and 200% CSS zoom in RTL, scroll/client
  widths both measured **345px**.
- Follow-up on private port **63214**, without rebuilding fixture bundles: checked and
  unchecked RadioButton labels with explicit or fieldset disabling all measured opacity
  **1** in forced colors, in both schemes. Native `appearance`, accent and forced-color
  adjustment stayed `auto`; author 22px sizing and disabled-color tokens survived.
  Enabled native radio focus retained its solid system outline, and normal-theme opacity
  returned to **.5/.38** afterward. Evidence: `forced-colors.json` beside the audit files.
- A JavaScript-disabled context exercised visible RadioButton arrows/reset and separate
  same-name groups with distinct form owners; choosing Weekly did not uncheck Other.
- Existing jsdom radio-grouping/cancelled-click limitations remain documented in the
  component contract; no production workaround was added.

No cross-engine, OS-native-theme, browser-chrome-zoom or assistive-technology certification.

## Exact isolated budgets

Existing recipes only: minified ES2022 ESM `index.ts` / IIFE `global.ts`, source maps,
no legal comments; CSS copied verbatim; gzip level **9**.

| Asset | Raw bytes | Gzip bytes | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-radio.js` | 4,143 | 1,751 | 3,000 |
| `markup-ui-radio.global.js` | 4,300 | 1,819 | 3,000 |
| `markup-ui-radio.css`, working LF | 4,554 | 1,234 | 1,250 |
| Same CSS, normalized CRLF checkout | 4,555 | 1,236 | 1,250 |

Source CSS was equivalently whitespace-compacted by installed esbuild
(`minifyWhitespace:true`, `minifySyntax:false`), without changing build scripts.
CRLF CSS headroom is **14 gzip bytes**. One helper plus CSS is **2,985 ESM / 3,053
classic** working-tree gzip bytes, or **2,987 / 3,055** with CRLF. JavaScript is unchanged.
No dependencies, shared styles, generated outputs or ceilings changed. Full release
build, commit and push remain parent-owned.

## Coordinated release integration

The coordinator's isolated release `pnpm build` and **192 Dialog/Modal/Drawer/Radio
tests** passed, including all **46 Radio tests**. Final CSS is **4,555 raw / 1,236
gzip bytes**, within the unchanged 1,250-byte ceiling.

Actual emitted Radio CSS was also exercised in Chromium: checked and unchecked disabled
RadioButton labels changed from **.38 opacity to 1** under forced colors, then restored
to **.38** afterward. Native input appearance remained **auto** throughout.
