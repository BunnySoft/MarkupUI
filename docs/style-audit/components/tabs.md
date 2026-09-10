# Tabs default-style audit

**2026-09-10 — integrated after placement and disabled-state corrections.** Changed only
Tabs CSS, its controller/CSS tests and canonical/audit documentation. Controller,
entries, Menu, Dropdown, shared helpers, generated assets and demo files are
unchanged. No dependency installation, full build or commit.

## Reference and isolated method

Reference commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`. Inspected Tabs/TabPane,
the main/RTL cssr rules, size constants and light/dark themes.

Private `.tabs-audit` pages bundled existing **Naive UI 2.45.3 / Vue 3.5.30** and,
separately, the unchanged source `createTabs` helper with existing esbuild.
Reference RTL used the actual `unstableTabsRtl` provider; native RTL used document
direction and the existing controller. Fresh browser contexts avoided shared pages.
The fixture and server were cleaned up after verification.

Both sides had 640px stages, matching application typography/backdrops and a 24px
native pane-content sample. Real source tabs were selected by `data-name`:
Segment contains an additional empty internal capsule tab that is **not** a public
tab and was excluded. Reference transitions settled before measurement.

## Corrected defaults

| Property | Before | After / reference |
| --- | --- | --- |
| Default type | Generic native button presentation | Bar defaults |
| Default tab font / line height | 14px / 22.4px | 14px / 21px |
| Active bar/line/card weight | 700 | 400 |
| Active Segment weight | 700 | 500 |
| Default bar padding | 10.4px 14.4px | 6px 0 |
| Default active foreground | `#185cbd` | `#18a058` light / `#63e2b7` dark |
| Ordinary tab foreground | `#18202c` | `#1f2225` / white `.9` |
| Pane foreground | Same generic root text | `#333639` / white `.82` |
| Disabled presentation | Entire button opacity .5 | Explicit disabled text, normal opacity |
| Disabled text | Faded inherited color | `#c2c2c2` / white `.38` |
| Pane | 16px padding, visible border, white fill | 8/12/16px adjacent-edge padding, no default border, transparent |
| Root inter-region gap | 8px | No extra gap |
| Pane first-child margin | Forced to zero | Native/author margin retained |
| Indicator | 3.2px and present on all types | 2px line/bar; no extra card/segment underline |
| Segment | Narrow natural tabs | Equal-width tabs, 3px rail padding/corners |

Top-padding recipes now match all three retained sizes:

| Type | Small | Medium | Large | Gap |
| --- | --- | --- | --- | --- |
| Bar | 4px 0 | 6px 0 | 10px 0 | 36px |
| Line | 6px 0 | 10px 0 | 14px 0 | 36px |
| Card | 8px 16px | 10px 20px | 12px 24px | 4px |
| Segment | 4px 0 | 6px 0 | 8px 0 | 0 |

Card idle background is `#f7f7fa` light / white `.04` dark; selected card is
transparent unless authored otherwise. Segment rail is `#f7f7fa` light / white
`.1` dark; selected fill is white light / white `.1` dark. Divider borders are
`#efeff5` / white `.09`. Pane and ordinary tab colors remain separate roles.

## Measured matched scope

- Default plus bar/line/card × small/medium/large = ten top cases, each in
  light/dark × LTR/RTL: **40 matching case comparisons**.
- Segment × three sizes × both themes/directions: **12 cases matched geometry
  and enabled-tab styling**, with the disabled foreground difference below.
- Checked tab x/y/width/height, font/line height/weight/padding/color/opacity,
  pane padding/color/background/border and content position. Numeric tolerance:
  **0.03px**, accounting for renderer rounding.
- Enabled hover colors matched all four types in both themes: primary for
  bar/line, title text for card, body text for Segment.
- Default medium bar tab height changed approximately **44.521px → 33px**.
  Medium line tabs are 41px; medium Segment tabs 33px inside a 39px rail.
  One-pixel card borders were renderer-quantized to about .667 CSS px in this
  browser; comparisons used actual measured values, not an invented integer total.

## Explicit indicator and placement limits

No measured-width/moving-indicator engine was introduced. At the audited medium
size in light LTR:

| Indicator | Source x/y/width/height | Native x/y/width/height |
| --- | --- | --- |
| Bar | 0 / 31 / 57 / 2 | 0 / 31 / 56.9896 / 2 |
| Line | 0 / 40 / 57 / 2 | 0 / 39 / 56.9896 / 2 |
| Segment selected fill | 3 / 3 / 211 / 33 | 3 / 3 / 211.3333 / 33 |

Source rounds and moves an independent bar/capsule; native paints the selected
tab. The line overlap is 1px different, and fractional capsule width differs.
Card baseline/pad joins, orientation-specific corners/open edges and source
overflow masks are not reconstructed.

### Placement follow-up: corrected, not waived

The initial candidate incorrectly kept top pane padding in non-top layouts and
used generic vertical padding for cards. Those were existing supported surfaces,
not renderer limitations, and are now fixed with private CSS recipes.

Actual reference measurements covered **line/card × bottom/left/right/start/end ×
small/medium/large × light/dark × LTR/RTL = 120 cases**. Every pane padding and tab
padding/height matched; the matrix includes **48 vertical-card cases**.

| Medium pane | LTR source = native | RTL source = native |
| --- | --- | --- |
| bottom | `0 0 12px` | `0 0 12px` |
| left | `0 0 0 12px` | `0 0 0 12px` |
| right | `0 12px 0 0` | `0 12px 0 0` |
| start | `0 0 0 12px` | `0 12px 0 0` |
| end | `0 12px 0 0` | `0 0 0 12px` |

Small/large use 8/16px on the same edge. Vertical-card tab padding is now
**8px 12px / 10px 16px / 12px 20px**. The medium three-tab card strip changed
**123px → 135px**, matching source; small/large strips measured **123/156px**.

Public pane/tab padding overrides were additionally verified on all 30 native
case roots in both directions: **5px 9px** pane / **7px 13px** tab remained after
reinserting package CSS later.

The vertical line strip still has its native block-end baseline, so its outer
height differed by the sampled border thickness (**127.667px versus 127px** at
medium). Pane padding and individual tab heights match; this remaining baseline/
indicator artwork difference is not conflated with the corrected padding.

## Disabled Segment and semantic ownership

Pinned Segment CSS leaves disabled text at ordinary title color (`#1f2225` /
white `.9`), despite having a disabled theme token. The native disabled button
uses the common disabled text (`#c2c2c2` / white `.38`) for a visible unavailable
cue. Geometry and real disabled behavior are preserved; this color difference is
not counted as full Segment pixel parity.

No disabled overlay, pointer-only disabling, fake button, new event or automatic
panel renderer is added. Existing paired native-button semantics remain authoritative.

## Author and live-controller regressions

- All 42 pre-existing controller tests passed, including guards/races,
  native keyboard, disabled skipping, nested ownership and restoration.
- Real browser ArrowRight selected/focused the next LTR tab, then skipped disabled
  and wrapped. Manual mode moved focus without selection; Enter committed once.
  RTL ArrowLeft and vertical ArrowDown used their existing logical policies.
- Tab left the strip for the active native tabpanel. An edited input retained its
  exact node/value across hidden pane switches.
- Explicit public values retained teal selection, navy hover, gray disabled text,
  **7px 13px** tab padding, **9px** pane padding, ivory pane fill and a **20px**
  indicator after a later package stylesheet.
- An authored first-child **11px** margin remained; the old reset no longer erases it.
- A nested default bar inside a large card reset to **14px**, **36px gap** and its
  own indicator, without inheriting the parent's card appearance.
- A 100px native strip had **310px** content; explicit native scrolling reached
  approximately **94.667px**. Native scrollbar dimensions/ancestor scrolling are
  intentionally not source scroll-mask/button geometry.
- Reduced motion disabled the optional entrance; print showed all three retained
  panes. The existing forced-color CSS remains present.

Private defaults prevent type/size recipes from overwriting public padding.
Shared `--mui-color-primary` is used only for the correct brand role. Segment
selection stays neutral. No generic shared surface/text palette is substituted
for distinct card, Segment, pane or disabled roles.

### Selected plus disabled

The existing controller rejects initial/direct disabled selection, but disabling
the selected native button creates a synchronous transient state until its
MutationObserver refresh. A new controller regression verifies this exact interval.
Regular and forced-color selected foreground rules now exclude `:disabled`.

In Chromium, the transient button still had `aria-selected="true"` and controller
value `"one"`, but immediately used authored disabled color **rgb(1,2,3)** rather
than active red. Assigning `"one"` threw **RangeError**. After refresh, value was
`"two"`, the old tab was unselected and its pane hidden. Vertical keyboard movement
also remained functional. No controller implementation change was needed.

## Tests and budget

`node node_modules\vitest\vitest.mjs run tests\tabs.test.ts tests\tabs-style.test.ts`
→ **52 passed** (43 controller tests + nine CSS tests).

| CSS source | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 5,258 | 1,338 | 1,750 |
| Initial audit candidate | 7,402 | 1,726 | 1,750 |
| Corrected placements/cascade | 7,344 | 1,750 | 1,750 |

**At the ceiling, zero gzip bytes headroom; no relaxation or semantic cuts.**
Existing esbuild `minifyWhitespace` produced the equivalent compact source;
new private aliases were shortened, with public tokens unchanged. The checked-in
CRLF source measures 1,750 gzip bytes; equivalent LF esbuild output measures
1,745. Formatting is stable on another whitespace-only transform. No builder or
runtime formatting step was added. Controller/entries remain unchanged, so there
is no JS source delta or new shared-helper dependency.

The coordinator's isolated release `pnpm build` and all **52 Tabs tests** passed
(43 controller/native cases and nine style regressions). Built CSS is **7,344 raw /
1,750 gzip bytes**, exactly at the unchanged ceiling; both LF and CRLF budgets were
checked. No shared source or generated adapter was edited.

## Remaining scope

Measured moving bars/capsules, source panel slide/height transitions, lazy/unmount
rendering, automatic overflow packing/buttons and framework props remain omitted.
The retained optional 100ms opacity entrance, native scrolling and static per-tab
indicator are explicit alternatives. Non-top visual limits are listed above.
Only Chromium was rendered; no universal pixel/framework/browser/AT parity is claimed.
