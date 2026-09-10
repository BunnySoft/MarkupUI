# Timeline default-style audit

**2026-09-10 — integrated defaults fixed; native limits documented.** Only Timeline CSS, tests and its two
documentation files changed. No shared source, generated output, demo, dependency,
full build or commit changed.

## Reference and isolated method

Pinned source: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`. Reviewed Timeline/
TimelineItem, cssr layout rules, size constants and light/dark themes. Dark Timeline
explicitly consumes **supplementary** semantic colors.

Private `.timeline-audit` pages bundled existing **Naive UI 2.45.3 / Vue 3.5.30**
using existing esbuild. Actual NConfigProvider/NGlobalStyle/NTimeline/NTimelineItem
were compared with markerless native lists and authored body/title/content/footer/
marker regions. Matching application typography and light/dark body backgrounds
controlled appearance. Reference transitions settled before measurement.

Fresh private Chromium contexts never touched shared pages. Fixture files and
the local server were cleaned up after verification.

## Matched scope

Nine cases contained **30 items**, each measured in light and dark LTR:
default, large, right placement, horizontal, horizontal large, 24px authored SVG
icons, all five types, custom marker color and mixed missing-title/time content.

**60 item comparisons matched exactly** in item/title/content/footer/node
rectangles, font size/line height/weight/colors and marker border color/width.
**60 connector slots matched**: 42 visible bounds/colors within 0.02px, plus
18 terminal absences. Native dash painting is not equated with the source gradient.
RTL remains a separately measured logical-placement adaptation below.

## Before → reference-correct metrics

| Role | Before | After / reference |
| --- | --- | --- |
| Content font / line height in fixture | 14px / 21px | **14px / 17.5px** |
| Medium title | 16px / 24px, weight 600 | **14px / 17.5px, weight 500** |
| Large title | 18px / 27px, weight 600 | **16px / 20px, weight 500** |
| Title bottom / large top margin | 4px / 0 | **6px / −2px** |
| Metadata container | Inherited 14px / 21px | **12px / 15px** |
| Metadata top margin | 8px | **6px** |
| Vertical gap | 24px medium / 32px large padding | **20px body end margin**, either size |
| Last-item height floor | Extra minimum height | Authored content/margins determine height |
| Medium / large marker top | 3.5px / 3.5px | **1.75px / 3px** |
| Default marker | rem-based 14px | **14px**, both sizes |
| Horizontal basis | 256px (16rem) | **Intrinsic auto** |
| Horizontal end spacing | 24/32px | **40px**, either size |

For the fully populated three-item sample:

- Medium heights changed **102/102/78px → 82/82/62px**.
- Large heights changed **113/113/81px → 82.5/82.5/62.5px**.
- Medium title/content/meta y starts were **0 / 23.5 / 47px**.
- In 640px, the body began at x=**26px** and was **614px** wide.
- Content-only first/last events with explicit empty metadata matched
  **37.5px / 23.5px**, including native empty-margin behavior.
- Horizontal items changed **256×104px → 117.765625×88px** for the audited strings.
  Body y=26px; node y=1.75px.

Body margins, instead of item padding/floors, retain normal empty-footer margin
collapse and useful spacing even without authored metadata. The precise
content-only fixture explicitly authored the source-equivalent empty footer.
No footer or date is generated.

## Correct color roles

| Role | Before | After light | After dark |
| --- | --- | --- | --- |
| Title / body | `#18181b` fallback | `#1f2225` / `#333639` | white `.9` / `.82` |
| Metadata | `#52525b` | `#767c82` | white `.52` |
| Neutral marker | `#71717a` | `#767c82` | white `.52` |
| Rail | General border / `#d4d4d8` | `#dbdbdf` | white `.2` |
| Information | `#0369a1` | `#2080f0` | **#3889c5** |
| Success | `#15803d` | `#18a058` | **#2a947d** |
| Warning | `#a16207` | `#f0a020` | **#f08a00** |
| Error | `#b91c1c` | `#d03050` | **#d03a52** |

Private dark defaults use supplementary colors. Light boundaries clear private
values with `initial`, restoring light fallbacks under dark ancestors. Per-item
public color stays first priority and affects only circle/icon, not text or rail.
Wrong-role legacy text/border fallbacks are removed. No global palette is modified;
an application may map the correct shared supplementary token to the per-item hook.

## Logical direction and genuine differences

The native `"right"` placement is **logical inline-end**. At 640px in RTL:

| First marker | Pinned source x | Native x |
| --- | ---: | ---: |
| Default vertical | 12px | 626px |
| Right placement | 626px | 0px |
| Horizontal | 586px | 626px |

This retains the native logical-side/DOM-order contract, not a chronology reversal.
No physical-offset workaround is added.

Source dashed rails use gradients/Houdini transitions; native rails use dashed
borders. Bounds/colors match, dash segments and animation do not. Source divs
versus native list markers/headings/dates, visible-sibling `:has()` boundaries and
optional authored regions likewise remain intentionally distinct contracts.

## Author/native regressions

- Nested light reset dark info **#3889c5 → #2080f0**; nested medium stayed column,
  14px icon and 14px title under a large parent.
- Public tokens gave a **24px purple marker**, **20px navy title**, **18px body**,
  **12px olive metadata**, **30px** body end margin and a **teal rail**.
- Wrong shared normal-info, border and primary-text red tokens did not replace
  supplementary defaults. Shared font-size correctly changed body sizing only.
- Author tokens before a later package stylesheet remained effective. Custom
  marker cases also matched source without recoloring event text.
- Hiding the final item removed the new terminal connector and body end margin.
- A 200px width token retained **200px outer items**. In a 280px native scrolling
  region, content was **604px** wide; focusing the last action scrolled to **291px**
  with no library focus/scroll handler.
- Forced colors restored system marker color. Print stacked horizontal items,
  expanded scrolling and removed connector content.
- Existing tests preserve list-item semantics under native column flex, chronology,
  time attributes, forms/listeners, hidden/templates and visible status words.

## Validation and strict budget

`node node_modules\vitest\vitest.mjs run tests\timeline.test.ts`
→ **16 passed**: 12 existing tests updated for corrected presets plus four
budget/theme/geometry/author regressions.

| Source CSS | Raw bytes | gzip level 9 |
| --- | ---: | ---: |
| Before | 6,259 | 1,320 |
| After | 6,891 | 1,471 |

The **1,500 gzip-byte ceiling is unchanged**, leaving **29 bytes**. Compact
one-rule-per-line authored CSS fits the complete native/hidden/media contract;
no generator, minifier build step, dependency or budget relaxation was added.
The existing build still copies this one source.

The coordinator's isolated release `pnpm build` and **47 combined Highlight/Timeline
tests** passed, including all **16 Timeline tests**. Built CSS remains **1,471 gzip
bytes**. No shared source or generated adapter was edited.

## Scope boundary

No date formatter, sorting, icon renderer, layout measurement engine, theme watcher,
callback wrapper or chronology controller is added. Arbitrary authored paragraph/
control margins are not normalized to string-prop anatomy. Without `:has()`, the
readable marker-only fallback remains.

Only Chromium was rendered. Results establish measured LTR defaults and documented
native differences, not all-browser/content or full framework/pixel/AT parity.
