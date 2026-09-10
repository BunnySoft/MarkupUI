# Ellipsis visual-default audit

Date: 2026-09-10. Scope: CSS-only passive clipping and the retained native
details/summary alternative. No tooltip runtime, binder, generated content or shared edits.

## Actual reference rendering

- Pinned Naive UI: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Rendered `naive-ui@2.45.3`, `vue@3.5.30`, using `NEllipsis` and initial
  `NPerformantEllipsis` under light/default and dark providers.
- Inspected both implementations and CSSR. Ellipsis has no own typography/palette
  theme variables; its theme peers configure Tooltip, which remains out of native scope.
- Passive reference cases retain the upstream default tooltip setting, without opening
  an overlay. Expansion cases disable Tooltip to isolate text expansion itself.
- Chromium private contexts, 900×2200 viewport, device scale 1, 260px wrappers, matching
  system font and surrounding 14px/1.6 text. Light/dark foreground/background are explicit
  fixture page styles, not styles injected by native Ellipsis.
- Sixteen cases per theme: short/long/inline single-line; two/three-line and short
  multiline; inline multiline; rich phrasing; bounded unbroken text; empty text; inherited
  author typography; both PerformantEllipsis forms; multiline/single-line expansion.
- Session `files/ellipsis-style-audit` retains source fixtures, CSS snapshots,
  raw measurements and before/reference/after screenshots.

Thirteen ordinary passive cases match captured reference box/clipping/text metrics in
both themes and RTL. The unbroken-word case and two native disclosures are explicitly
different, rather than excluded without explanation.

## Corrected defaults

The old implementation forced every passive preview into block layout. Corrected
single-line previews use inline-block and bottom alignment; clamped multiline previews
use an inline box and baseline alignment. Original text and phrasing nodes are unchanged.

| Measurement, 260px wrapper | Before | Reference / after |
| --- | ---: | ---: |
| Short preview width | 260px | 105.734px |
| Inline short row height | 67.172px | 22.391px |
| Inline short preview x | 0 | 43.969px |
| Inline limited row height | 67.172px | 22.391px |
| Two-line clipped box height | 44.781px | 44.781px |
| Two-line surrounding line-box height | 44.781px | 51.172px |
| Short multiline width | 260px | 105.734px |
| Inline multiline row height | 89.563px | 51.172px |
| Three-line clipped box height | 67.172px | 67.172px |
| Empty preview width | 260px | 0 |

The multiline line-box increase is expected baseline participation, not an extra clamp
line. Chromium reports clamped inline boxes as `inline-block` and block boxes as
`flow-root`; the stylesheet uses the underlying `-webkit-inline-box` / `-webkit-box`
forms required by the retained clamp mechanism.

No font size/family, line height, color or direction was added. The authored 18px/1.8
case retained 64.781px for its two-line preview, matching reference in both themes.
Block presentation remains available through ordinary author CSS; direct native summary
previews intentionally keep their former block layout.

## Screenshot evidence

Only the selected fixture wrapper was made visible for each comparison, fixing its origin
so intentional differences elsewhere could not alter fractional vertical alignment.

| Panel | Dimensions | Light differing RGB pixels | Dark differing RGB pixels |
| --- | --- | ---: | ---: |
| Short single-line | 260×23 | 0 | 0 |
| Inline limited single-line | 260×23 | 0 | 0 |
| Two-line clamp | 260×52 | 0 | 0 |
| Inline two-line clamp | 260×52 | 0 | 0 |
| Rich phrasing | 260×52 | 0 | 0 |
| Initial PerformantEllipsis multiline | 260×52 | 0 | 0 |

Any changed RGB channel counts, with no tolerance. These twelve comparisons establish
the tested steady-state text/clipping subset, not tooltip or remount lifecycle parity.

## Native disclosure and retained differences

The actual native summary, marker, visible hint and one-copy preview remain the disclosure
contract. Scoped block-preview rules have deliberately low specificity so safety guards,
open state, print and explicit hidden/template protection can still win.

- Closed native multiline preview remains 44.781px high; its marker/hint make the whole
  disclosure 89.828px instead of the upstream text-span line box's 51.172px.
- Upstream and native multiline expansion both expose a 111.953px full-text preview.
  Native total height is 157px because its control/hint remain present.
- The pinned upstream single-line click path clears `text-overflow` but retains nowrap/
  hidden overflow: 22.391px high with 983px scroll width in a 260px box. Native details
  deliberately fully wraps the original text to 111.953px. That is not click parity.
- A bounded unbreakable word is horizontally clipped by upstream: 22.391px high,
  1,629px scroll width. Native `overflow-wrap:anywhere` keeps it within 260px and two
  visible lines (44.781px). This pre-existing safe native policy was retained.
- Native hint/keyboard activation are always available, not conditioned on overflow.
  No hover promotion, Tooltip props/slot runtime, portal or geometry observer was added.

Native Enter, Space and pointer activation produced open/closed/open states and one
toggle each. The same original text node remained, there was exactly one preview,
and expanded Selection text equaled the original preview text. The summary's accessibility
snapshot included the full original text and visible hint; speech timing is not certified.

## Author, safety and fallback verification

- A 180px width, 20px font, 32px inherited line height, three-line token and authored color
  produced a 96px preview with the requested RGB foreground.
- `0`, `-1`, `2.5`, `NaN` and `none` clamp values showed the full 320px authored example;
  no parser coerced them into a valid clamp or rewrote the text.
- A late native button inside a closed disclosure preview changed it to inline,
  visible overflow and no clamp. Removing the button restored clamp 2 while retaining
  the original text node. The new disclosure selectors do not defeat this guard.
- Explicit hidden and template previews remained `display:none` while open.
- Print exposed the full 111.953px preview even in a still-closed details, removed clamp,
  used block display and hid the hint. No open attribute was fabricated.
- Forced colors/reduced motion retained a focused 2px outline, no animation and a 0s
  transition. No marker-hiding/generated-arrow stylesheet was introduced.
- Removing the clamp CSSSupportsRule simulated no line-clamp support: full 111.953px
  text and visible overflow. Removing the safety-support group similarly restored
  normally wrapped full single-line-source text. These are Chromium simulations, not
  other-engine certification.
- Loading the legacy core stylesheet afterward changed none of the captured fields
  in either theme. No shared source or registration was touched.

Native controls still belong outside preview/summary content. The guard is defensive,
not validation of arbitrary custom widgets, shadow roots or external author clipping.
See [Ellipsis](../../components/ellipsis.md) for the retained content and author contract.

## Validation and boundaries

- `pnpm test -- tests\ellipsis.test.ts`: **12 tests passed**.
- Isolated stylesheet copy, gzip level 9: **788 / unchanged 1,500 bytes**.
- Component JavaScript and runtime dependencies remain **0**.
- The coordinator's isolated release `pnpm build` and all **12 Ellipsis tests** passed;
  built CSS remains **788 gzip bytes**. Unfinished unrelated work is excluded.
  No shared source or generated adapter was edited.
- Native short-text sizing, inline baseline geometry and clipping defaults are corrected;
  safe long-word wrapping and accessible disclosure remain intentional adaptations.
- Only Chromium was tested. Other engines/fonts, arbitrary author layouts, assistive
  technology speech and the omitted default-on tooltip require separate consideration.
