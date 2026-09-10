# Cascader style audit

**Integrated - native trigger roles corrected; renderer differences retained.**
This is a CSS-only audit of the existing dependent-select implementation, not a new
binding/template, row renderer, selection engine or floating Cascader.

## Reference and evidence

- Rendered `naive-ui@2.45.3` / `vue@3.5.30`, pinned source
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Reviewed Cascader/CascaderOption, menu CSS and light/dark themes, plus the actual
  InternalSelection trigger styles. Native baseline is `5f108479364122c2963776d48b43217277ed8b26`.
- Private fixture directory:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\cascader`.
  `build.mjs`, `fixture.js`, `measure.mjs` and `verify.mjs` use existing esbuild and
  session-only Playwright Core. No repository dependencies or shared server files change.
- Private Chrome **151.0.7922.174**, Windows system fonts, **1100x800**, DPR 1.
  Local bundles are injected into private pages; no server or shared browser tab is used.
  All contexts/browsers close in `finally`.
- Meaningful Europe/France/Paris, US/New York, Island, remote and restricted branches:
  10 passive source nodes and three labelled native `path[]` selects, actual source
  `NCascader` options, fieldset/legend, path/status and Clear button.
- `before.json`, `after.json`, `verification.json`, `budgets.json` and before/after,
  dark-print, authored-print, forced-disabled and narrow-RTL PNGs retain evidence.
  Sixteen before/after cases cover both themes and small/medium/large, empty, disabled,
  open, multiple and remote-loading source variants. Multiple is reference-only scope.

## Measured controllable corrections

| Role | Before native | After native / actual reference |
| --- | --- | --- |
| Small/medium/large trigger height | 29.78125 / 36.1875 / 44.1875px | **28 / 34 / 40px** |
| Small/medium/large font | Inherited 16px throughout | **14 / 14 / 15px**, weight 400 |
| Radius / padding | Square; .15/.35/.6rem padding | **3px**, 0 12px; native arrow space stays platform-owned |
| Normal light text | Black | **#333639** |
| Normal dark text / surface | White text on a white native control | **white-.82 / white-.1**, native dark scheme |
| Light border / surface | Browser gray / white | **#e0e0e6 / white** |
| Dark border | Browser gray | **Transparent**, matching the actual trigger border |
| Disabled light text / surface | Inherited black / white, UA opacity | **#c2c2c2 / #fafafc**, opacity 1 |
| Disabled dark text / surface | Inherited white / white, UA opacity | **white-.38 / white-.06**, opacity 1 |
| Dark hover border | Browser default | **#7fe7c4**, measured against source state-border |
| Label/column flow | Inline labels cause control wrapping | Original labels stack above full-width native fields |
| Inherited public gap | Overwritten by root default | Public value wins; .75rem is only a fallback |

**56 exact computed role comparisons** pass: height, font size, weight, foreground,
surface, border and radius across small/medium/large/disabled in both themes.
Native single-select text still computes platform `line-height: normal`, while the
reference has 1.5 leading. Minimum heights match, but OS glyph/arrow rasterization and
the control's internal text inset are not claimed to be identical.

The full native fieldset changed from **696x253.75** to **696x222.640625** in the medium
fixture. Its three controls are **215.65625px** wide. The reference trigger is **560x34**
and contains the complete path. These are intentional, visibly different topologies,
not a whole-widget pixel-parity result.

## Panel, option, path and state boundaries

- The actual open source menu is **542x224.390625**, with columns **180/181/181px**
  including divider borders. It uses white light / **#48484e dark** and the source
  three-layer shadow. Native has no floating menu surface on which to apply those
  roles: dependent selects and the readable disclosure remain in document flow.
- Reference default option rows are **34px**, 14px type, with branch arrows, check
  affordances, pending-row fills and disabled text. A completed default single path
  shows a checked Paris box but still ordinary `textColor2` on that label; it is not
  universally primary-colored. No checked-option tint or custom row geometry is added.
- Source default `checkStrategy="all"` displays checks even in the single-value case.
  Native default strict-leaf completion, option locks and actual single selects are
  retained. Multiple checking/tags and group/optgroup rendering are not added.
- Reference empty trigger placeholder is **#c2c2c2** in light. Native's first enabled
  empty option remains normal option text, not a faux placeholder state or `:invalid`
  color hack; required/custom-validity ownership is unchanged.
- Remote reference loading was actually triggered with `remote` and `onLoad`: a
  **16x16** animated loading icon replaces the remote branch arrow. Native pending load
  instead keeps real ancestor controls, `aria-busy="true"`, the remote path and
  **"Loading choices..."** status (the helper uses the ellipsis character). Strict-leaf
  submission remains invalid. No spinner or fake popup column is introduced.
- Native path remains plain `Europe / France / Paris`; labels/source summaries,
  fieldset/legend, reserved status space and typed Clear button remain visible.
  Source clear icon, active-trigger tint/focus glow, floating transitions, ellipsis,
  filtered/virtual option rendering and popup width/scroll behavior remain omitted.

## Author, media and native ownership

Local public `--mui-cascader-*` tokens now use fallbacks, never public default assignments.
Font family and hover color reuse the applicable shared roles; size-specific shared
font hooks retain their 14/14/15px fallbacks. Generic shared text/surface/border/line-height
roles are not substituted for different measured trigger roles.
**No shared token or Popover/Select/Tree source change is needed.**

Private browser assertions cover:

- Shared 17px/monospace/hover color and inherited 23px gap; local 19px/serif, 48px height,
  7px radius, 2px 17px padding and independent normal/disabled/focus colors win.
- Dark print uses light native scheme, **#333639** path/status/control text and white
  control surfaces. Disabled fields/options/Clear use **GrayText**, without opacity
  fading. Print resets private defaults, so explicit author colors and dimensions survive.
- Forced colors uses native Canvas/CanvasText and **GrayText at opacity 1** for disabled
  controls/options/Clear. Measured against a live system-color probe, not assumed RGB.
  A real disabled fieldset's first-legend select stays enabled; its following select
  receives the system-disabled role. No `aria-disabled` substitute or pointer blocking.
- Optional `.mui-select` wrappers and `data-select-control` attributes work with current
  unchanged Select CSS loaded before or after Cascader CSS, including large type/height
  and print colors. No second Select controller is bound.
- Native ArrowDown changed Europe to the incomplete US prefix, then chose New York in
  the child; native validity was false until completion. Reset restored Paris with the
  same select, label and cached option nodes/default flags. Actual FormData returned
  three `path[]` entries: `eu`, `fr`, `paris`; disabling the fieldset returned none.
- Clear returned focus to the surviving root control. Media switches and author styles
  preserved original nodes/options/defaults. Reduced motion has no native animation.
- At **360px RTL**, document scroll/client widths are both 360; controls wrap within
  x=39.25..320.75. JavaScript-disabled fallback keeps 10 readable source nodes, working
  native disclosure, disabled named fields and empty FormData.

The existing legacy widgets Cascader, source Tree reader, controller projection/cache,
keys, strict terminal/path contract, loading/reset/default algorithms, forms and teardown
are untouched. Native popup appearance and assistive technology/browser engines beyond
this Chromium run are not certified by this audit.

## Focused validation and handoff

`pnpm exec vitest run tests\cascader.test.ts tests\cascader.styles.test.ts`:
**53 passed** (47 existing native behavior cases + 6 style/media/budget regressions).
No full build was run; full declarations/release integration remain parent-owned.

| Isolated asset | Bytes | gzip | Existing ceiling |
| --- | ---: | ---: | ---: |
| Cascader CSS | 3,293 | **934** | 1,250 |
| Cascader ESM | 25,601 | **8,832** | 10,000 |
| Cascader classic | 25,887 | **8,970** | 10,000 |

CSS uses exact maintained bytes, not a relaxed/minified-budget proxy; ESM/classic use
the existing minified es2022/source-map build options and gzip level 9.
Combined CSS + ESM/classic: **9,766 / 9,904 gzip bytes**.

Changed files are only Cascader CSS, `tests/cascader.styles.test.ts`, the canonical and
reference Cascader docs, and this report. No controller, shared source, generated asset,
index, build configuration, commit or push is included.

## Integration

The isolated release build and all **53 Cascader tests** passed. Actual emitted
CSS is **3293 raw / 934 gzip bytes** under the unchanged **1250-byte ceiling**;
ESM/classic remain **8832/8970 gzip bytes**, each under 10000.
No shared stylesheet or controller change was needed. The retained dependent-select
layout, native popup rendering and explicit source-renderer limits above remain.
