# FloatButton / FloatButtonGroup default-style audit

**Status:** integrated CSS-only defaults fixed; Chromium comparison,
2026-09-10. No controller/provider, hover-opening menu engine, generated close icon or
framework state adapter was added. Native actions and browser popover composition remain.

## Reference and evidence

- Pinned commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [FloatButton](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/src/FloatButton.tsx),
  [button CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/src/styles/index.cssr.ts),
  [light](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/styles/light.ts)
  / [dark theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/styles/dark.ts),
  [group](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button-group/src/FloatButtonGroup.tsx),
  [group CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button-group/src/styles/index.cssr.ts).
- Rendered reference: installed `naive-ui@2.45.3` / `vue@3.5.30`, light/dark providers.
  Target is literal native HTML and the current external stylesheet, with no browser script.
- Private session fixture `files\style-reference\float-button-audit`, port **4220**:
  case/source/build/server files, `before.json`, `after.json`, `boundaries.json`, and
  `{reference,before,after,legacy}-{light,dark}-{ltr,rtl}.png` where captured.
  Before captures are LTR; reference/corrected/legacy captures cover both directions.
  No DataEngine artifacts were written.
- Isolated Chromium contexts closed in `finally`; main viewport 760×1750, DPR 1,
  14px/1.6 inherited system font, fixed-size inline SVG content.
- 13 variants cover default/square/primary, descriptions, dimensions, fixed-auto,
  logical absolute end placement, circle/square/primary groups and authored overrides.
  The 52 corrected cases have matching reference and legacy matrices; original LTR
  baseline adds 26 cases (**182 distinct captured render conditions**).

## Corrections observed in actual rendering

| Area | Before | Reference / corrected |
| --- | --- | --- |
| Default action | 40px only at 16px root | **40px preset**, independent of root font |
| Default icon | 20px | **18px** |
| Description | 10.5px / 13.125px | **12px / 14px** |
| “Save” action height | 45.125px | **40px** |
| Action padding | 4px plus 1px border | **2px 4px**, no border |
| Circle / square radius | 999px / 6px | **4096px / 3px** |
| Light default text | `#18181b` | **`#333639`** |
| Dark surface / text | White / `#18181b` | **`#48484e` / white .82** |
| Primary background | Hardcoded `#075985` | **Shared primary: `#18a058` light / `#63e2b7` dark** |
| Dark primary text | White | **Black** |
| Base shadow | Black .133, 8px blur | **Black .16 light / .12 dark, 8px blur** |
| Hover/pressed shadow | Same shadow plus brightness filter | **Black .24 light / .18 dark, 12px blur** |
| Two-button square group | 50×90px outlined/padded wrapper | **40×81px shared shadowed surface** |
| Authored primary background | Overwritten by primary declaration | **Author token wins** |

All **52 outer action/group bounds** and **68 icon bounds** matched the reference
width/height/x/y within .02px. This includes both LTR and RTL logical-placement fixtures.
All corrected target measurements were identical after later legacy CSS loading.

The target applies body padding to the native action itself; source applies it to an inner
body div. Matching icon/description placement does not imply identical internal DOM or
root padding declarations.

### What the pinned hover render actually does

The standalone reference's `__fill` element measured **0×0**, even though its computed
hover/pressed color changed. Only the shadow visibly changed. The corrected standalone
native action matches that observed result without a fill renderer or whole-action filter.

Square-group reference fills measured **32×32**, inset by 4px. Those are not reproduced
as new internal layers: the native joined group retains its whole-control brightness
feedback. Group hover footprint and transition timing therefore remain explicit differences.

## Group and placement boundaries

- Square separators remain on the following **visible native sibling**, whereas source
  uses the preceding button's bottom border. Native first/last action boxes allocate the
  separator differently, but total group bounds and all icon positions match. Hidden
  controls/templates still produce no leading separator.
- Square child corners follow the native group radius rather than source's per-edge
  4px first/last treatment. Focus is never clipped by the group.
- Native primary children retain a filled primary surface. The reference clears their
  square-group background; light primary text is white over the light group surface at
  rest. That contrast loss is not transplanted into native actions.
- Insets remain auto until authored; no bottom=40 safe-corner default is invented.
  Fixed/relative/absolute modes remain native CSS. Logical start/end are the retained RTL
  adaptation, not a claim that source physical `left`/`right` props switch meanings.
- The equivalent end-placement fixture maps source `right=24` in LTR and `left=24` in RTL
  to the same native inline-end intent. Both implementations measured x=406 / x=314.
- The native fixed-corner popover dock is still not the source's trigger-anchored menu
  engine. No collision/flip, hover opening, body/close-icon animation or callback-array
  compatibility was added. Native z-index 10 and no-transition styling remain adaptations.

## Native interactions, accessibility and author overrides

`boundaries.json` records:

- Enter then Space produced exactly two native clicks. Required validation blocked an
  empty submission; one valid submit occurred, reset restored “Original”, and disabled
  controls remained disabled. No custom-element definition or menu/menuitem roles appeared.
- Closed native popovers had `display:none`. Space opened the panel; at 320×240 it fit
  within the viewport at x=48, y=16, width=256, height=156 and scrolled natively.
- Tab skipped the disabled action and reached Close. Escape closed the panel and returned
  focus to the trigger; native toggle events reported closed→open and open→closed.
- With JavaScript disabled, native popovers opened/closed in both LTR and RTL. A 256px
  panel measured x=48 in LTR and x=16 in RTL. Native reset and GET submission to
  `/markup?project=NoJS` still worked.
- Author tokens rendered a 60×52px action with 24px icon and custom purple background,
  even with primary styling. A 20px root font left default dimensions at 40×40.
- Dark primary text is correctly black, but its native focus ring independently used
  the visible info color `(112,192,232)` at 2px instead of becoming black on the dark page.
- Forced-color testing caught a grouped hover filter overriding the reset. The final
  forced-color rule suppresses it; resulting filter is none with system black/white colors.

Links, accessible names, form types, disabled fieldsets, DOM order, authored nodes/listeners,
native popover timing and static fallback remain application/browser-owned. No focus trap,
manual aria-expanded synchronization or keyboard handler was introduced.

## Scope limits and validation

- Independent native structure, grouped hover/primary/corner treatment, fixed-dock menu
  layout, native semantics and immediate state changes are not full source/pixel parity.
- Source and target were compared in Chromium; browser UI zoom, touch/safe-area hardware,
  arbitrary transformed containing blocks and screen-reader speech remain downstream checks.
- `pnpm test -- tests\float-button.test.ts`: **15 tests passed**, including new source-size,
  palette/author-priority and separator-minimum checks. Existing native/fallback tests remain.
- Runtime JS **0 bytes**, no dependencies. The maintained CSS uses compact rule-oriented
  formatting to retain the complete native fallback within the existing budget—not a changed
  build recipe or relaxed ceiling.
- CSS: **1,484 / 1,500 gzip bytes at level 9**. Only 16 bytes remain; parent's isolated
  integration/build is the final manifest gate.
- No shared/theme/index/generated edits, full build, commit or push. Neutral palettes are
  component-local; semantic primary/info colors use existing theme tokens. No common
  source change is required.

The coordinator's isolated release `pnpm build` and all **15 Float Button tests**
passed. Final CSS is **1,484 gzip bytes**, below the unchanged 1,500-byte ceiling.
Unfinished unrelated work is excluded; integration is complete.
