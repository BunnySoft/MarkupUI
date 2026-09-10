# Code visual-default audit

Date: 2026-09-10. Scope: native plain `pre`/`code`, optional authored physical lines and
four authored token roles. No syntax dependency, language parser, code renderer,
clipboard implementation, shared source edit or generated output.

## Rendered reference and scope

- Pinned Naive UI: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Actually rendered `naive-ui@2.45.3` / `vue@3.5.30`, `NCode` under light/default and
  dark `NConfigProvider`. **No hljs object or syntax engine was supplied.**
- Inspected Code's public/native boundaries, `Code.tsx`, CSSR, theme palettes and
  common monospace stack.
- Fourteen cases per theme: plain, tabs, scrolling, wrapping, plain-prop numbering,
  authored-slot numbering, 12 lines, terminal CRLF, wrapped numbering, plain inline,
  inline preserved whitespace, authored token spans, 18px font override and empty code.
- Chromium private contexts, 900×2400 viewport, device scale 1, 360px examples and
  surrounding 14px/1.6 system text. Plain code inherits an explicitly matched page
  foreground: `#333639` in light, white `.82` in dark. These are fixture page colors,
  not colors automatically supplied by plain Code.
- Session `files/code-style-audit` contains fixture sources, raw measurements,
  stylesheet snapshots and screenshots. Dependencies are reused only in the fixture.

The reference's plain `code`-prop mount clears its initially rendered line-number
column when it creates its plain `pre`. That behavior was observed, not hidden by a
highlighter. A second reference case uses the existing default slot with an authored
`pre` and code prop for its counter generator; this retains the actual upstream number
column. Token comparisons similarly use safely authored slot spans, not a lexer.

## Actual corrections and measurements

| Measurement | Before | Reference / after |
| --- | ---: | ---: |
| Plain two-line block height | 78.781px | 44.781px |
| Plain content start x/y | 17px / 17px | 0 / 0 |
| Plain content width | 326px | 360px |
| Wrapped example height | 123.563px | 67.172px |
| Wrapped numbered example height | 145.953px | 89.563px |
| Empty block height | 34px | 0 |
| Inline simple example width | 133.531px | 123.156px |
| Tab size | 4 | 8 |
| Font size at a 20px root | 17.5px | 14px |
| Line height with surrounding multiplier 2 | 22.4px | 28px |

Removed the unrequested inline chip/block panel: default padding, border width and radius
are zero and background is transparent. Optional background/padding remain author-owned;
the existing border-color token paints an inset frame without shifting content. Nested code
does not paint the frame twice.

The default stack now matches `v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace`.
Only correct font roles are reused: `--mui-typography-mono-font` and `--mui-font-size`,
behind Code-specific overrides. No generic text-color role is substituted for plain
inheritance. A custom parent color `rgb(12,34,56)` was inherited by both implementations.

Wrapping now uses the actual `pre-wrap` / `word-break: break-all` combination. Horizontal
scrolling remains on the native pre; the reference fixture supplies an external overflow
wrapper because upstream Code does not own that native scrolling container.

## Numbering geometry and retained differences

| LTR source start | Before, including panel inset | Reference authored-slot path | After |
| --- | ---: | ---: | ---: |
| One-digit numbers | 47.781px | 19.703px | 19.688px |
| Two-digit numbers | 47.781px | 27.406px | 27.391px |

Native `ch` metrics differ by 1/64px from the reference's intrinsic pre width, but the
fixed-origin numbered comparison rendered identically in the tested browser/font.
Number colors match `#767c82` in light and white `.52` in dark.

CSS structural selectors choose 1/2/3/4ch from the count of authored physical-line
elements, plus a fixed 12px separation. Thresholds 9/10/99/100/999/1000 were rendered.
There is no string inspection, wrapper generation or JS measurement. An explicit
`--mui-code-gutter` overrides the automatic choice. Files above 9,999 lines need a
sufficient authored width; engines without the selector support retain a 3ch fallback.

Intentional boundaries:

- Native authored counters remain available even though the pinned plain-prop fallback
  removes its column. No renderer is implemented to imitate or fix upstream's lifecycle.
- Number nodes remain empty and decorative. Upstream's numbers are real text in a
  separate pre; native counters keep DOM/source selection free of number characters.
- A terminal CRLF retains a final empty authored physical line: native height 67.172px
  versus reference 44.781px for the two-lines-plus-terminal-CRLF case.
- Native numbered source fills the available code box; upstream's flex child pre can
  shrink to its intrinsic text width. Visible source starts and line metrics, not those
  differing structural box widths, are the parity target.
- RTL source positions match within 1/64px. Native counters keep a logical-start 12px
  gap; upstream retains physical right padding, placing that padding at the outer edge
  in RTL. That counter-placement difference is not presented as pixel parity.

## Four authored token colors

| Role | Before in both themes | Reference / after light | Reference / after dark |
| --- | --- | --- | --- |
| keyword | `#6d28d9` | `#a626a4` | `#c678dd` |
| string | `#166534` | `#50a14f` | `#98c379` |
| number | `#9f1239` | `#986801` | `#d19a66` |
| comment | `#52525b` | `#a0a1a7` | `#5c6370` |

Comments retain italic styling. These are only the four existing application-authored
roles, not a migrated highlighter API or complete syntax theme. Class boundaries and
escaping remain application-owned. Token contrast, especially comments, is not an
accessibility certification; author colors can supply stronger contrast when needed.

`data-mui-theme="dark"` changes only token/number defaults. Nested light resets them,
but plain text still inherits its surrounding page color, as upstream plain Code does.
No automatic panel, page foreground/background or native-control color scheme is added.

## Screenshot verification

For each comparison, only the selected fixture wrapper was made visible, keeping its
origin constant to avoid fractional vertical shifts from deliberate terminal-line
differences elsewhere in the matrix. Code styling/content were otherwise unchanged.

| Panel | Image dimensions | Light differing RGB pixels | Dark differing RGB pixels |
| --- | --- | ---: | ---: |
| Plain | 360×45 | 0 | 0 |
| Wrapped | 360×68 | 0 | 0 |
| Authored-slot numbered | 360×68 | 0 | 0 |
| Authored tokens | 360×38 | 0 | 0 |

Every changed RGB channel counts, without tolerance. This establishes the tested native
subset, not universal Code parity: inline preserved whitespace remains 99.859px wide in
the dedicated native case versus 76.984px with upstream's collapsed inline whitespace.
Full-matrix images intentionally still show that and the numbering/terminal-line differences.

## Author and native behavior checks

- Later Typography and core CSS, including inside `.mui-typography`, left all measured
  fields unchanged in both themes. Explicit inline display prevents a generic typography
  chip rule from turning Code into an inline-block.
- Author overrides produced an 18px Courier New font, 36px lines, 2-space tabs, 12px
  padding, 96px block height, authored foreground/background and a 1px inset frame.
  All four token colors and the number color were independently overridden.
- A 5ch gutter override produced a 50.484px source start at the tested font size.
- Three physical lines, including the final empty line, each measured 36px under the
  explicit line-height override. Modern `1lh` follows actual inherited height; the
  previous unitless/1.6 calculation remains as an older-engine fallback.
- DOM text, Range text and Selection text exactly preserved `first\r\nsecond\r\n`.
  No digits were selected; wrap/number switches retained the same nodes.
- Native ArrowRight moved a focused scrolling pre by 40px, retaining its 2px outline.
- Print hid numbers, cleared gutter padding, enabled wrapping and exposed overflow.
  Forced colors rendered all four token roles in the same readable system text color.

See [Code](../../components/code.md) for source ownership and the complete author contract.

## Validation and limits

- `pnpm test -- tests\code.test.ts`: **14 tests passed**.
- Code CSS: **1,325 / unchanged 1,500 gzip bytes**, gzip level 9.
- Existing derived Log CSS (`Code CSS + Log CSS`) was checked in memory:
  **1,563 / 1,750 gzip bytes**. No shared output or source was generated/changed.
- Component/demo JavaScript and runtime dependencies remain **0**.
- The coordinator's isolated release build passed, using the released baseline plus
  ready changes and excluding unfinished Button motion work. All **89 Code/Log/Grid
  tests** passed (14/59/16). Final Code/derived Log CSS remains **1,325/1,563 gzip bytes**;
  package declaration and budget gates pass without relaxing any ceiling.
- No trim/URI decode, grammar selection, highlighter object, copied renderer or clipboard
  feature. Theme transitions remain immediate rather than upstream color tweening.
- Chromium only. Fonts/device scaling, old-engine fallbacks, real clipboard conversion,
  screen-reader speech and arbitrary application token markup require downstream checks.
