# Date Picker default-style audit

**2026-09-11 — native trigger defaults aligned; platform calendar topology retained.**
This audit changes only Date Picker CSS, its existing style fixture and Date Picker
documentation. Controller code, demos, dependencies, generated files and shared styles
are unchanged. No commit or full build was made.

## Reference and method

Compared Naive UI **2.45.3** at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`. Date Picker renders Naive Input as its
trigger, so the pinned Date Picker styles, Input theme/common tokens and light/dark common
roles are the controllable reference. The custom calendar panels are not a native popup
styling target.

Chromium loaded a private synthetic fieldset directly with the maintained source CSS.
Small, medium, large and disabled native date fields were measured in light, dark, print
and forced-colors media. No native picker was opened and no browser artifact was committed.

## Corrected defaults

| Role | Before | After / pinned trigger role |
| --- | --- | --- |
| Small / medium / large height | UA/inherited sizing | **28 / 34 / 40px** |
| Small / medium / large type | 14 / 16 / 18px at a 16px root | **14 / 14 / 15px** |
| Inline padding | `.5rem` | **10 / 12 / 14px** |
| Radius | `.25rem` | **3px** |
| Light text / surface / border | FieldText / Field / GrayText | **#333639 / #fff / #e0e0e6** |
| Dark text / surface / border | UA-dependent | **white-.82 / white-.1 / transparent** |
| Disabled light | UA-dependent | **#c2c2c2 / #fafafc**, opacity 1 |
| Disabled dark | UA-dependent | **white-.38 / white-.06**, opacity 1 |
| Hover/focus border | UA-dependent | Primary-hover **#36ad6a / #7fe7c4** |

The root now owns the source font/line-height scale and native color scheme. Pair spacing
uses a public fallback rather than overwriting an inherited value. Local
`--mui-date-picker-*` hooks cover font family/size/line-height, height, padding, gap,
radius, normal/focus/disabled text, surfaces and border. Shared font and primary-hover
hooks remain usable. Public tokens are never assigned as defaults.

## Browser measurements

Chromium measured the exact **28 / 34 / 40px** heights, **14 / 14 / 15px** type,
**10 / 12 / 14px** padding, 3px radius and opacity 1. Medium light computed
`rgb(51,54,57)`, white and `rgb(224,224,230)`; medium dark computed white at .82,
white at .1 and transparent border. Disabled computed the source light/dark roles above.

Dark print switched to the light native scheme and palette; disabled text resolved to the
system GrayText role without opacity fading. Forced colors applies Canvas/CanvasText to
enabled and disabled fields, then GrayText to disabled fields/actions. The disabled field
selector is repeated deliberately so its higher-specificity normal background cannot win
inside forced-colors.

## Retained differences

- The original `date`, `month`, `week` and `datetime-local` controls, labels, values,
  defaults, constraints and FormData topology remain untouched.
- Native segmented editing, locale presentation, picker artwork and popup remain
  browser/OS owned. No `appearance`, pseudo-element artwork, absolute overlay or popup CSS
  is added.
- The source focus tint/glow, clear icon, formatted placeholder, calendar grid, range
  separator and panel actions are not recreated. Highlight focus-visible outline remains.
- The optional clear action stays a visibly labelled authored button; output remains plain
  readable text. Neither is disguised as source trigger chrome.
- Native validity and actual `:disabled` eligibility remain authoritative. Readonly,
  attribute-only disabled substitutes and validity-color hacks are not introduced.

## Validation and budget

The two Date Picker fixtures pass individually:

- `tests\date-picker.test.ts`: **76 tests**
- `tests\date-picker.styles.test.ts`: **6 tests**

The style fixture checks reference density/palette, public-token fallback ownership,
unchanged native topology, actual disabled eligibility, print and forced-colors behavior.

| Date Picker CSS | Raw bytes | gzip level 9 | Existing ceiling |
| --- | ---: | ---: | ---: |
| Before | 963 | 418 | 1,000 |
| After | 3,129 | 897 | 1,000 |

Date Picker CSS is copied byte-for-byte by `scripts/build.mjs`, so the maintained source
measurement is the emitted asset measurement. No ceiling changed. Scoped diff whitespace
checks pass.

Changed files:

- `src\components\date-picker\date-picker.css`
- `tests\date-picker.styles.test.ts`
- `docs\components\date-picker.md`
- `docs\naive-ui\components\date-picker.md`
- `docs\style-audit\components\date-picker.md`

There are no Date Picker blockers. Full-repository tests/build and generated `dist` output
remain intentionally outside this component-only pass.
