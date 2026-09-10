# Steps default-style audit

**2026-09-10 — integrated retained-native correction.** Only Steps CSS, its style/
controller tests and canonical/audit documentation changed. Controller implementation,
shared helpers, menus, tabs, generated files and demos are unchanged. No full build,
commit, dependency installation or renderer/binding expansion.

## Reference and isolated method

Reference commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
Inspected Steps/Step rendering, status precedence, horizontal/vertical/bottom cssr
rules and light/dark/size themes.

Private `.steps-audit` pages bundled existing **Naive UI 2.45.3 / Vue 3.5.30** and,
separately, the unchanged `createSteps` source using existing esbuild. Both used
640px stages, equivalent 14px/1.6 application typography and matching light/dark
backgrounds. Private Chromium contexts avoided shared pages. The fixture/server
were cleaned up afterward.

The comparison aligned **explicit per-item statuses** rather than silently changing
native completion semantics. Cases included medium/small horizontal, medium/small
vertical, bottom, vertical-over-bottom, all four statuses, current error and current
wait. A separate unset case measured the deliberate semantic difference.

## Matched role/typography scope

Across the nine aligned-status cases, **28 items × two themes = 56 comparisons**
matched title font size/line height/weight/color, description font size/line height/
top margin/color, marker-to-source-indicator-border color and connector color/
terminal absence. **This is not a whole-node or full-layout geometry match.**

| Property | Before, 14px fixture | Corrected |
| --- | --- | --- |
| Medium title | 14.7px / 23.52px, weight 700 | **16px / 16px, weight 500** |
| Small title | 14.7px | **14px / 14px, weight 500** |
| Optional glyph | 17.5px, inherited line height | **18px medium / 14px small**, line-height 1 |
| Description top margin | 4.8px | **12px horizontal/bottom; 8px explicit vertical** |
| Connector stroke | 2px | **1px CSS border** |
| Vertical gap | 24px | **16px** |
| Horizontal item sizing | Mandatory 11rem basis | Flexible equal shares; original end clearance retained |

No native heading level, visible status Text node, numbering or control semantics
were replaced to obtain these values.

## Correct status colors

| Role | Light | Dark |
| --- | --- | --- |
| Waiting title/description/marker | `#c2c2c2` | white `.38` |
| Processing title | `#1f2225` | white `.9` |
| Processing description | `#333639` | white `.82` |
| Processing/finished marker | `#18a058` | `#63e2b7` |
| Finished title/description | `#c2c2c2` | white `.38` |
| Error title/description/marker | `#d03050` | `#e88080` |
| Finished connector | Primary | Primary |
| Other connectors | `#c2c2c2` | white `.38` |

Before, title/description/glyph generally inherited `#21334d`; marker overrides
used unrelated blue/green/red values and connectors stayed `#a4b4c7` regardless
of finish status. The corrected private state defaults use normal primary/error
common roles, **not** Timeline's supplementary colors.

Public marker/color/line overrides stay first priority. Finish/error rules now
write private state values instead of masking an inherited public marker override.
Required status words and native action labels keep readable body text rather
than inheriting muted description styling.

## Genuine native geometry and state differences

The existing target deliberately uses real ordered-list numbering, optional flat
authored glyphs, visible status words and a current-position outline. Naive renders
numbered/check/error circles, places its connector within the title structure and
omits the target's extra status/action row. No circle/counter renderer was added.

At 640px, the three-item medium sample measured:

| Measurement | Naive | Native |
| --- | --- | --- |
| First item width | 213.333px | 184px, after native list framing/gaps |
| First item height | 56.396px | 73.896px, including status words |
| First node | 28×28px generated indicator | Authored bullet glyph about 7.313×18px |
| First title x/y | 37 / 6px | 48.313 / 11.333px |
| Horizontal connector | Title-integrated flexible line | Fixed 16px inter-item stub |

The native root keeps its ordinary decimal-list indentation and 24px horizontal
gap. Its 12px item-end clearance prevents long label ink entering the stub area.
Vertical rails likewise follow the native ordinal-column/inter-item model:
the first native item was about **69.896px** high versus **60.396px** in Naive,
and the native connector spans the 16px gap rather than Naive's indicator-to-item
line. These differences are reported, not concealed by an empty status row,
generated node wrapper or application normalization in the paired comparison.

Source indicator sizes are 28/22px, while source icon slots are 18/14px. The native
flat glyph typography matches the latter scale; it does **not** claim the former
circle geometry/background. In particular, processing marker color matches the
source circle's border/accent role, not its contrasting filled-circle index ink.

With current unset, Naive derives process for every item; native Steps remains
unset/waiting. Earlier items are not implicitly completed. Explicit current and
explicit status remain independent, including current-wait/current-error cases.
Native narrow stacking and logical icon-content placement are retained rather
than adding a source-responsive or chronology engine.

## Author and native-control evidence

- Purple marker, teal connector, navy text, orange current cue and 30px gap
  overrides remained effective after a later package stylesheet. Finish/error
  styles no longer masked the public marker value.
- Native Enter emitted one request for step 1 while current remained 2: requesting
  did **not** advance progress. The application's explicit acceptance later set
  current to 4. A disabled action emitted no additional request.
- Explicit statuses remained **wait/process/finish/error** after that move;
  moving current did not invent earlier completion.
- Hiding the current last item and refreshing removed the new terminal connector
  and retained the controller's documented current recovery.
- A nested small/light list under a vertical/dark item reset to a 14px title,
  light primary marker and its own horizontal direction.
- Native RTL retained DOM order `0/1/2`, with item x positions about
  **424/216/8px** and the same 24px gap. Forced colors gave matching system-black
  ordinal markers and connectors.
- At 360px the native list stacked and omitted connectors; print remained block
  layout with no connectors. Existing tests retain native forms, focus recovery,
  cancellation, Text-node identity, bounds, ownership and no wizard behavior.

## Dark-print regression follow-up

The initial palette correction left explicit descendant title/description/marker
colors tied to dark private variables while print changed only root text to black.
That was a regression, not an accepted native limitation.

Print now shares the forced-colors **public text/marker/line resets**, and the
list selects `color-scheme:light` only in print. The latter also prevents inherited
`color-scheme:dark` from making `CanvasText` white on paper. The now-redundant direct
root `color:black` was removed; no screen palette or controller behavior changed.

An actual Chromium print probe used all four explicit states under both a dark
theme and inherited dark color scheme. **All 20 default color checks**—title,
description, visible status text, actual `::marker` and authored glyph across
wait/process/finish/error—computed to **rgb(0,0,0)**. Status words stayed visible
and connectors remained suppressed. An authored list retained maroon text and
purple ordinal/glyph markers. Dark forced-colors screen output still used readable
system white, and leaving print/forced colors restored the original dark palette.

The resets and scoped print scheme remain ordinary-priority CSS, so deliberate
author colors/schemes retain ownership of their own contrast. The probe used a
private `.steps-print-audit` fixture/context and was cleaned up.

## Validation and accounting

`node node_modules\vitest\vitest.mjs run tests\steps.test.ts tests\steps-style.test.ts`
→ **49 passed** (43 controller tests + six style tests).

| CSS source | Raw bytes | gzip level 9 |
| --- | ---: | ---: |
| Original checked-out CRLF form | 3,626 | 1,081 |
| Original Git/LF fixture snapshot | 3,572 | 1,076 |
| Initial corrected candidate | 4,294 | 1,248 |
| Including dark-print correction | 4,292 | 1,250 |

The strict **1,250 gzip-byte ceiling is unchanged**, with **zero bytes headroom**.
Existing esbuild whitespace compaction and private aliases keep the maintained
stylesheet within budget; no builder or runtime formatting step was added.
Controller/entry sources have no delta. Full distribution/manifest/build
verification was subsequently completed by the coordinator: `pnpm build` and all **49
Steps tests** passed. Final CSS is **4,292 raw / 1,250 gzip bytes**; LF and CRLF variants
both remain within the unchanged ceiling.

The coordinator also checked actual emitted CSS under an inherited dark document scheme:
all **20 title/description/status/glyph/ordinal color readings** across wait/process/finish/
error printed black, with status words still visible. No controller behavior changed.

## Remaining limits

No generated circles/checkmarks, hidden status-word substitution, source title-line
renderer, implicit completion, whole-row click handler, roving keyboard model or
business validation was added. Marker shape, current outline, native list framing,
connector geometry and status-word height are explicit retained differences.
The audit covers Chromium and the stated properties, not full pixel/framework/
all-browser/AT parity.
