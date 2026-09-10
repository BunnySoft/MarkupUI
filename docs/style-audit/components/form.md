# Form default-style audit

**2026-09-11 — Form-owned label and validation defaults fixed; native ownership retained.**
Changed only Form CSS, its existing test fixture and Form documentation. Form JavaScript,
the demo, Input and other components, shared files, generated files, dependencies and
ceilings are unchanged. No full build or commit.

## Reference and method

Compared Naive UI **2.45.3** at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`. Source-reviewed
`styles/_common.ts`, `styles/light.ts`, `styles/dark.ts`,
`src/styles/form.cssr.ts` and `src/styles/form-item.cssr.ts`.

The source uses generated FormItem label/blank/feedback wrappers, provider inheritance,
measured auto label widths and transitions. MarkupUI retains authored native labels,
legends, fields and optional plain feedback nodes. The comparison therefore targets only
Form-owned geometry and validation paint; it does not make Form a control theme provider.

An isolated Chromium **152.0.7977.83** fixture loaded the current Form and Input source
styles at 1000×900. It checked computed geometry/paint, hidden-to-visible feedback,
Input composition, author overrides, dark theme, print and forced colors. This was not a
side-by-side vendor screenshot run or cross-engine/media certification.

## Corrected defaults

| Role | Pinned and MarkupUI default |
| --- | --- |
| Label height, small / medium / large | 24 / 26 / 28px |
| Top label font | 13 / 14 / 14px |
| Left label font | 14 / 14 / 15px |
| Blank/control-row minimum | 28 / 34 / 40px |
| Feedback height | 24 / 24 / 26px |
| Feedback font | 13 / 14 / 14px |
| Label weight | 400 |
| Inline item separation | 18px |

Top labels use `0 0 6px 2px` logical-equivalent padding and logical-start alignment.
Left labels use 12px inline-end padding and logical-end alignment above the retained
40rem responsive boundary. The fixed 10rem label column remains a native adaptation;
source auto measurement is not ported.

Light label/feedback/error/warning colors are `#1f2225`, `#767c82`, `#d03050` and
`#f0a020`. Dark equivalents are white `.9`, white `.52`, `#e88080` and `#f2c97d`.
Required marks use the error role and are nonselectable. Feedback padding is applied only
when text exists. A mapped hidden feedback surface reserves the same total height on
non-fieldset items so validation does not shift later content.

Chromium measured the medium top label at **26px / 14px / weight 400**, with 6px
block-end and 2px inline-start padding. The left label used the default **160px** column,
34px row height, logical-end alignment and 12px inline-end padding. Revealing populated
feedback kept the complete item at **84px** before and after; the feedback itself was
24px. A fieldset intentionally grew by 24px instead of receiving hidden reserve padding.

## Ownership and retained differences

- Form never styles descendant input/select/textarea elements. Blank-height presentation
  excludes a composed `.mui-input`, so an independently sized Input root stays authoritative.
  The composed small Input measured **28px** inside a medium Form item.
- Public `--mui-form-*` geometry and color tokens are only consumed, never assigned by
  package size, status or theme selectors. Inherited author overrides therefore win.
- Actual label/for, fieldset/legend, DOM order, accessible names, native constraints and
  feedback text ownership are unchanged. CSS generates no marks, labels or messages.
- Native fieldsets are excluded from the left-label grid and hidden-feedback reservation;
  their authored padding and feedback expansion remain fieldset-owned.
- Inline layout keeps the existing wrapping adaptation rather than Naive's nonwrapping
  inline-flex/margin topology. Grid spans and the 40rem stack remain MarkupUI adaptations.
- Pending keeps the existing dotted logical border. Forced colors use CanvasText, print
  selects the light scheme, hidden nodes stay hidden and Form adds no motion.
- No Schema rules, VNode feedback, provider sizing, label measurement, control styling,
  automatic required mark or transition was added.

## Validation and budget

Five stylesheet-contract checks were added to the existing `tests\form.test.ts` for
author-token precedence/theme media, exact size inheritance and Input exclusion,
feedback reservation/visibility, authored flow/fieldset layout, pending/forced-color/
motion behavior and the unchanged package ceiling.

`pnpm exec vitest run tests\form.test.ts` → **58/58 passed**.

The browser fixture measured light label/feedback as `rgb(31, 34, 37)` /
`rgb(118, 124, 130)`, dark as white `.9` / `.52`, exact authored label color
`rgb(1, 2, 3)`, light print schemes and CanvasText for label/feedback in forced colors.

| Form CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 2,360 | 701 | 1,250 |
| After | 4,656 | 1,199 | 1,250 |

The before row is the CRLF checkout represented by the historical Form acceptance record.
The after row measures the current source bytes with Node gzip level 9. No ceiling or
dependency changed. The existing test was run individually; no full build was run because
this scoped audit must not update `dist`.
