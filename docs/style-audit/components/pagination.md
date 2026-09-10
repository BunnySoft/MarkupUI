# Pagination native-control style audit

**Status:** integrated native-control styling; Chromium comparison,
2026-09-10–11. The bounded renderer, templates, state, native focus/forms and event/ownership
code remain unchanged. No binding, route, peer renderer or omitted API was added.

## Reference and evidence

- Pinned commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [Pagination](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/Pagination.tsx),
  [CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/styles/index.cssr.ts),
  [light theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/styles/light.ts),
  [dark theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/styles/dark.ts),
  [size constants](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/styles/_common.ts).
- Actual reference: installed `naive-ui@2.45.3` / `vue@3.5.30`, configured light/dark.
  Target uses current CSS with the existing compiled native Pagination helper.
- Private session fixture `files\style-reference\pagination-audit`, port **4224**:
  case/source/build/server files, `before.json`, expanded final `after.json`,
  `boundaries.json` and `{reference,before,after,legacy}-{light,dark}-ltr.png`.
  Fixture responses explicitly use UTF-8 so authored ellipsis text is not misdecoded.
- Fresh isolated Chromium contexts closed in `finally`; final 800×1500 viewport,
  requested DPR 1, 14px/1.6 inherited system font. This browser allocated a declared
  1px border as approximately .666667 computed CSS pixels.
- Final **15 cases × two themes × four render variants = 120 captured conditions**.
  Cases cover first/middle/last, disabled, small/large, gaps, simple, picker/jumper,
  combined/small/large/disabled auxiliary controls and authored palette overrides.

## Corrected defaults

| Area | Before | Reference / corrected |
| --- | --- | --- |
| Small / medium / large page size | 1.9 / 2.25 / 2.75rem | **22 / 28 / 34px** |
| Small / medium / large font | 14 / 16 / 18px at 16px root | **12 / 14 / 14px** |
| Gap / radius | 6.4px / 4.8px | **8px / 3px** |
| Page padding | .3rem .6rem | **0 4px** |
| Ordinary page border/background | Visible gray / white | **Transparent / transparent** |
| Current page | Bold filled blue-tinted badge | **Normal weight, primary text/border, transparent surface** |
| Dark active border | Inherited opaque border | **Primary at .52 alpha** |
| Previous/next | Same generic page treatment | **Outlined neutral controls, zero inner padding** |
| Disabled | Whole-control opacity .55 | **Opacity 1, source disabled text/surface treatment** |
| Jump input | 96px, browser inset frame, variable height | **60px; matching 22/28/34px heights and theme face** |
| Public size override | Could lose to size-class custom-property writes | **Public token wins over private presets** |

Light base text/border are `#333639` / `#e0e0e6`; dark uses white .82 / .24.
Disabled active/navigation controls use `#fafafc` in light and white .06 in dark,
with `#c2c2c2` / white .38 text. Disabled non-current page surfaces remain transparent.

All **28 corresponding current-page boxes** matched width/height, foreground/background,
radius, font/weight and opacity. Border colors match numerically; native CSS `color-mix()`
serializes differently from source `rgba()`, including the .52 dark active-border alpha.

Passive page hover/press colors matched source primary-hover/primary-pressed values.
Current-page color/border, previous/next neutral treatment and disabled appearance remain
unchanged by passive hover styling. No native disabled control becomes hover-active.
Source color transitions are not reproduced; native state styles update immediately.

## Auxiliary controls and retained layout/artwork limits

- Quick jump matches the 60px width and all three heights. Light face/border and dark
  white-.1 face/transparent border match source peer defaults. Disabled native controls
  match the disabled foreground/background treatment.
- A medium native select measured **96.666672px**, versus **97.145836px** for the source's
  custom selection wrapper with the same option text. Closed-face height is 28px in both.
  Native selected text, arrow space, popup, option styling and OS behavior are not a custom
  Select/Popselect renderer.
- The native quick jumper stays `input[type=number]`, including native spinners/validation.
  Source uses its Input peer. Padding belongs to the native input here, versus internal
  source wrappers/border layers; wrapper border declarations are not directly comparable.
- Simple mode preserves the authored Go control, labels/count and DOM order. Only the page
  region is hidden by the existing helper. This is intentionally not the source's
  previous/input/count/next-only visual arrangement.
- Previous/next SVGs and gap text are authored fixture/template artwork. No automatic icon,
  ellipsis-to-double-arrow swap, RTL glyph mirroring or omitted-range hover menu is added.
- The existing bounded page window, gap targets, zero-result policy and optional control
  presence remain native-helper contracts, not exact source-renderer symmetry.
- Wrapping remains enabled for native controls at narrow widths; source normally uses nowrap.

Final settled target measurements were identical with later legacy CSS/aggregate loading.
Unrelated inputs/selects in author content are not given the new auxiliary face rules;
those rules are scoped to the explicit size/jump markers.

## Native state, focus and form verification

`boundaries.json` records:

- Native Space selected page 2 with one request and one change; focus stayed on the current
  keyed button. Shrinking a focused window to two pages removed the old node and recovered
  focus to the new current page.
- A size change to 20 was accepted; a canceled change to 50 restored the native select to
  20 without changing accepted state.
- Fractional draft 2.5 failed native step validity with no page change. Plain Enter with 4
  selected page 4 and suppressed implicit form submission; an unrelated submit button
  submitted the enclosing form normally.
- Simple state kept page/input value 4 and count 5 with its existing Go button.
- A trillion-page configuration rendered only nine page/gap controls. Empty results retained
  one disabled current page while leaving size selection enabled.
- Author overrides beat the small class: 40×40px current control, 17px text and supplied
  purple foreground/background/border palette.
- Narrow 360px RTL layout wrapped without document overflow. Native DOM/Tab order remained.
- Forced colors retained a system current-page border. A discovered dark-current print
  color override was fixed; final print is black text on white rather than pale green.
- With JavaScript disabled, two authored fallback links remained usable, navigation reached
  `#two`, and enhancement-only controls stayed hidden. No routing/binding code was added.

Native select/menu appearance, independent icon contours, number spinners, source versus
native simple layout, browser input feedback, platform font/rasterization and arbitrary
custom themes remain explicit limits. These checks are Chromium, not all-browser or
screen-reader certification.

## Validation and integration gate

- `pnpm test -- tests\pagination.test.ts tests\pagination.styles.test.ts`:
  **57 tests passed** (53 existing state/native tests, four new style regressions).
- Controller/model/templates, shared helpers, package exports and dependencies are unchanged.
- Exact isolated build options with gzip level 9:
  **5,011 ESM / 5,080 classic / 1,220 CSS bytes**, below unchanged
  **5,500 / 5,500 / 1,250** ceilings.
- No shared/index/generated edits, new binding/template/omitted API, full build, commit or push.
  Parent's isolated pipeline owns final release/manifest acceptance.

## Coordinated release integration

The isolated release build and **99 combined Input Number/Pagination tests** passed,
including all **57 Pagination tests**. Parent review extended the print reset to the
root labels and newly styled native input/select auxiliaries, not just page buttons.
Actual emitted dark-theme CSS printed count text and enabled/disabled auxiliary controls
as **black text on white**, preserving their content.

Final Pagination CSS is **1,228/1,250 gzip bytes**. Controller, model and templates
remain unchanged; native popup/artwork and page-window limits are still explicit.
