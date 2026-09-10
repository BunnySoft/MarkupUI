# Layout default-style audit

**2026-09-10 — integrated defaults fixed; native limits documented.** Scope: Layout CSS, its tests and its
two documentation files. No shared source, other component, generated output, root
demo, dependency, full build or commit changed. Previously accepted audit files
remain frozen.

## Pinned source and isolated rendering

Reference commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
Inspected Layout/Content/Header/Footer/Sider implementations, their `*.cssr.ts`
styles, light/dark Layout themes and common body/card/action/divider/inverted values.

Private `.layout-audit` pages used existing **Naive UI 2.45.3 / Vue 3.5.30**,
bundled with existing esbuild. Reference Siders were placed inside valid NLayout
hasSider owners. Native pages loaded the actual Layout source CSS with equivalent
14px/1.6 application typography, 640px stages and 24px sample content. The row
compositions and native scroll specimen had authored 120px heights. Reference
transitions settled for 400ms before measurement.

Fresh private Chromium contexts never touched shared pages or sibling fixtures.
The fixture and local server were cleaned up after testing.

## Comparison scope and result

**24 specimens × light/dark × LTR/RTL = 96 scoped comparisons**, all matching the
checked values after the fix:

- Layout/Content, each plain and embedded.
- Header/Footer/Sider, each plain, bordered, inverted and inverted+bordered.
- Start/end row shells and their Sider/Content regions.
- Explicit native scrolling region.
- Collapsed width/palette only.

Compared foreground/background, visible border color and outer width; outer
height was compared for all **23 non-collapsed** specimens. The native details
summary is real authored content, so collapsed height is **not** included in a
false source-height parity claim. Neither Sider border painting anatomy nor
scrollbar-wrapper structure is claimed identical.

## Measured before → reference-correct roles

Before values are standalone source defaults: the old asset did not respond to
the light/dark marker. Existing shared-token applications could supply other old
colors, but those token roles were not equivalent to Naive's region theme.

| Role | Before | After light | After dark |
| --- | --- | --- | --- |
| Normal foreground | `#18181b` | `#333639` | white `.82` |
| Layout / Content background | `#fff` | `#fff` | `#101014` |
| Embedded background | `#f3f4f6` | `#fafafc` | `#101014` |
| Header / Sider background | `#fff` | `#fff` | `#18181c` |
| Footer background | `#fff` | `#fafafc` | `#18181c` |
| Normal border | `#e4e4e7` | `#efeff5` | white `.09` |
| Inverted background | `#18181b` | `#001428` | `#18181c` |
| Inverted foreground | `#fafafa` | `#fff` | white `.82` |
| Inverted border | `#52525b` | `#001428` | white `.09` |

Dark inverted regions intentionally use the same palette as their normal
Header/Footer/Sider counterparts. Light inverted borders intentionally match
the inverted background, as in the reference; no invented contrast border is added.

## Implementation and author ownership

Theme boundaries define only private `--_mui-layout-*` values. Every region resets
its private body/text/border selection, then Header/Sider, Footer and inverted
variants select their correct role. Public local tokens remain the first override.

This also fixes a directly coupled author-ownership problem: the old inverted
rule **defined public** `--mui-layout-background/color/border-color` on the element,
masking the application's inherited values. With ivory/purple/teal on an ancestor:

| Inverted bordered Header | Background | Text | Border |
| --- | --- | --- | --- |
| Before | `#18181b` | `#fafafa` | `#52525b` |
| After | ivory | purple | teal |

Inverted defaults are now private, not author-token writes. A dedicated embedded
background remains ahead of the generic background override; the generic token
now also applies when no embedded-specific override exists.

Incorrect shared fallbacks (`--mui-text-primary`, `--mui-bg-surface`,
`--mui-bg-muted`, `--mui-border`) are removed rather than globally changed. Their
meanings cannot simultaneously represent body/card/action/inverted surfaces or
textColor2/dividerColor. Existing applications wanting a custom shared palette can
map it deliberately to public Layout tokens. No core/preset migration is needed.

## Native dimensions and scrolling

- Default Sider width **272px**, collapsed width **48px**: unchanged and matching.
- At **640×120px**, Sider remained **272×120px**, Content **368×120px**.
- Plain sample regions were **24px** high; bordered Header/Footer **25px**.
- Custom width tokens produced a **210px** Sider, **430px** Content and **64px**
  closed native details. These author dimensions remained effective.
- The reference native scroll container and explicit native `.mui-layout-scroll`
  both had **120px client height / 500px scroll height**, and accepted scrollTop 80.
  Native `scrollTo` to 90 emitted a real scroll event.
- Source uses an internal `overflow-x:hidden; overflow-y:auto` scroll container
  within an overflow-hidden Layout wrapper. Target retains explicit opt-in
  `overflow:auto` on the actual native element, including horizontal scrolling.
  No hidden source wrapper or custom scrollbar is inserted.
- Native Sider borders consume one inline pixel: sample content was **271px**
  wide versus **272px** inside Naive's overlay-painted border, while both outer
  Siders remained 272px. This printable-border adaptation is unchanged.
- Logical RTL borders remain author-oriented. The start-side native Sider uses
  an inner left border in RTL; the pinned source overlay was at x=271px on its
  physical right. Border colors and outer dimensions match, not every painted edge.

## Regression evidence

- Nested dark/light Footers resolved to **#18181c / #fafafc**. Normal Content
  inside an inverted Header reset to **#fff / #333639**, without private palette leakage.
- Wrong-role shared tokens set to red did not recolor Layout. Explicit Layout
  tokens produced ivory/purple/teal; embedded-specific mintcream won over ivory.
- Ordinary author rules before a later package stylesheet retained navy/white/gold
  on an inverted bordered Header.
- Native details kept its original navigation node and width behavior. Closed
  navigation rejected focus; application-directed focus handoff to summary before
  closing remained valid. Summary text/wrapping determines native collapsed height,
  unlike the reference's compressed/transformed-content model.
- Forced colors restored system black/white text/background and readable borders.
  Print expanded the explicit scroll region from 120px to its **500px** content
  height with overflow visible.
- Existing tests preserve landmarks, forms, native listeners, scoped scrolling,
  hidden/templates, absolute-position author constraints, native row/column
  composition and no reverse-order or transition machinery.

## Tests and budget

`node node_modules\vitest\vitest.mjs run tests\layout.test.ts`
→ **16 passed** (11 existing plus five palette/author/budget regressions).
The old `order:` substring guard was narrowed to the actual CSS property so
private `--_mui-layout-border:` declarations cannot trigger a false ordering failure.

| CSS source | Raw bytes | gzip level 9 |
| --- | ---: | ---: |
| Before | 3,637 | 874 |
| After | 4,930 | 1,051 |

The strict **1,500 gzip-byte ceiling is unchanged**, leaving **449 bytes**.
No JS or core bytes added. The coordinator's isolated release build and all **16
Layout tests** passed; built CSS is **1,051 gzip bytes**. This snapshot uses the
released baseline plus ready changes, excluding unfinished Button motion.

## Honest remaining differences

Source internal relative-position/overflow wrappers, default scrollbar containment,
overlay Sider borders, collapse transforms/width transitions, generated triggers,
controlled state and transition callbacks remain outside the retained native model.
Native regions/disclosures, explicit scroll classes and author-established containing
blocks remain intentional alternatives. No provider watcher, body/color-scheme
policy or global font styling is added.

Only Chromium was rendered. Results establish the stated color and outer-dimension
defaults, not complete pixel, framework, all-browser or accessibility-tool parity.
