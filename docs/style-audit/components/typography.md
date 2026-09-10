# Typography default-style audit

**2026-09-10 — integrated defaults fixed; documented limits remain.** Changes are limited to Typography CSS,
its tests and its two documentation files. No shared palette/core/plugin/generated
changes, dependency installation, full build or commit. Completed Global Style files
remain untouched by this audit.

## Pinned reference and measured scope

Reference commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
Owners inspected: `src/typography/src/{text,create-header,a,p,blockquote,ul,ol,li,hr}`,
their `styles/*.cssr.ts`, Typography `styles/{_common,light,dark}.ts`, and common
light/dark theme values.

The private `.typography-audit` fixture bundled existing **Naive UI 2.45.3 / Vue
3.5.30** with existing esbuild. It used isolated local pages and fresh Chromium
contexts, never a shared current page or another agent's fixture. Each reference
mounted NConfigProvider/NGlobalStyle and native Typography primitives without demo
styles. Reference transitions were allowed to settle for 400ms.

Candidate comparison used the same 14px/1.6 application body font and matching
background, but **only Typography source CSS**, not demo or shared component CSS.
The `.mui-typography` scope and the individual native-class path were measured
separately. This controls the ambient document font without falsely claiming that
Typography installs a global font. Private fixture files/server were cleaned up.

**39 specimens × 2 themes**: six headings, default Text, three depths, four semantic
types, strong/italic/underline/deletion, plain/typed inline code, paragraph, anchor,
quote, unordered/ordered lists and list items, rule, H1/H3 bars, aligned H2 bar,
aligned quote, nested first/last paragraphs/quotes and a boundary list.

The final prose comparison had **zero mismatches** in the measured properties:
family, size, weight, line height, foreground/background, block/start margins,
padding, display, border width/radius, visible border colors, text-decoration line,
and heading-bar width/start/block offsets/background. The individual-class
comparison likewise matched its 12 checked font/color/spacing/display/radius
properties for all 39 specimens in both themes. This is not a screenshot-wide or
all-state pixel-equivalence claim.

## Before → reference-matching defaults

| Role | Before | After / rendered reference |
| --- | --- | --- |
| Prose size / line height | 16px / 25.6px | 14px / 22.4px |
| H1–H6 scale | 36/28/24/20/17.6/16px | 30/22/18/16/16/16px |
| Heading and strong weight | 700 | 500 |
| Heading line-height factor | 1.25 | 1.6 |
| Heading spacing | 1.25em / .5em | 28px / 20px (H1–H3), 28px / 18px (H4–H6) |
| First-child heading | Only direct prose child trimmed | Individual/nested heading trimmed too |
| Text / heading light color | `#242426` for both | `#333639` / `#1f2225` |
| Depths 1/2/3 light | `#242426` / `#57575c` / `#76767c` | `#1f2225` / `#333639` / `#767c82` |
| Dark text / heading / depth 3 | Same light fallbacks | white `.82` / `.9` / `.52` |
| Info/success/warning/error light | `#175fbb` / `#127542` / `#8a5500` / `#aa203d` | `#2080f0` / `#18a058` / `#f0a020` / `#d03050` |
| Info/success/warning/error dark | Same light fallbacks | `#70c0e8` / `#63e2b7` / `#f2c97d` / `#e88080` |
| Link, idle and hover | Blue, darker on hover | Primary `#18a058` light / `#63e2b7` dark; unchanged on hover |
| Inline-code family | ui-monospace/SFMono-Regular/Consolas | v-mono/SFMono-Regular/Menlo/Consolas/Courier/monospace |
| Inline-code box | Inline, `.05em .3em`, 3px radius, visible border | Inline-block, `.05em .35em 0`, 2px radius, transparent 1px border |
| Inline-code font / line height | 14.4px / 23.04px in old prose | 12.6px / 17.64px |
| Code background | `#f1f1f5` | `#f4f4f8` light / white `.12` dark |
| Typed heading | Both text and bar colored | Only bar semantic; heading keeps primary text role |
| Prefix space / width | 1rem / 3px for all | 16px / 4px (H1–H2); 12px / 3px (H3–H6) |
| Prefix block inset | `.1em` | 0, full heading box height |
| List indent | 1.5em → 24px | 2em → 28px |
| List-item margin | `.25em` top and bottom | `.25em` top, 0 bottom |
| Quote spacing / border | 1em; `#d0d0d8` | 12px; `#e0e0e6` light / white `.24` dark |
| Rule spacing / color | 1.5em; `#d0d0d8` | 12px; `#efeff5` light / white `.09` dark |

Paragraphs use 16px block margins. First/last paragraphs, lists and quotes now have
the same boundary margin trimming as the reference. Inline code retains its own
foreground even with depth/type attributes; native hidden code remains hidden.

## Theme integration without a shared palette migration

`data-mui-theme="light|dark"` defines only private `--_mui-typography-*` defaults.
Public `--mui-typography-*` author overrides remain first. Semantic colors and
links next consume existing **normal** `--mui-color-*` tokens, then local reference
fallbacks. Typography does **not** use the supplementary semantic colors required
by some other components.

Text depths, code background, quote border and rule color deliberately avoid
legacy shared primary-text/surface/border roles: their values are not equivalent.
No shared source edit or core-byte increase is needed. Explicit nested light/dark
scopes reset private defaults, but intentionally do not erase inherited public
author or shared-preset overrides. The stylesheet does not set body background,
change `color-scheme` or watch system preference.

## Author/native regression measurements

- Nested dark → light scope: text white/.82 → `#333639`; links `#63e2b7` → `#18a058`.
- Public typography font tokens: Georgia **18px**, line height **31.5px**; headings
  keep their level-specific sizes unless their corresponding size token is changed.
- An unrelated `--mui-text-primary: red` did not recolor Typography body text.
  Shared `--mui-color-info: purple` did recolor semantic text; local
  `--mui-typography-info: teal` then won over that shared override.
- Body/heading/code/bar overrides produced maroon/navy/green/orange respectively;
  code background became ivory, H1 **41px/800**, paragraph margins **23px**.
  Explicit bar color won even on a typed heading.
- Ordinary author H1 rules still won after reinserting package CSS later:
  **47px**, fuchsia, **17px** start margin. Explicit semantic-text author selector
  likewise retained its orange foreground.
- Authored link hover token became teal. Default link hover matched reference primary.
- RTL retained logical layout: aligned H2 bar at **right −16px**, quote right
  padding **12px**, list right padding **28px**. Source uses physical-left decorations;
  this is an intentional native adaptation, not a claim of identical RTL output.
- Hidden inline code computed `display:none`; implicit `pre code` remained inline
  without the inline-code box. Combined code/depth/type retained reference code text.
- Forced colors restored system black text despite author colors. No transitions/
  animations were introduced. Native semantics, placeholder anchors, link metadata,
  lists, selection, hidden headings and untouched outside text remain covered by tests.

## Validation and budget

`node node_modules\vitest\vitest.mjs run tests\typography.test.ts`
→ **16 passed** (10 existing native-contract tests plus six style/budget regressions).
The CSSOM harness does not fully implement nested `:not(:where(pre code))`; its
block-code exclusion is source-guarded and the actual computed display was verified
in Chromium, not falsely inferred from that harness.

Source CSS, gzip level 9:

| | Raw | gzip | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 7,649 | 1,423 | 2,500 |
| After | 11,357 | 1,875 | 2,500 |

**625 gzip bytes headroom**, no budget relaxation and no JS asset. Full distribution
copy/manifest/budget verification is **pending the coordinated build**. No generated
files were manually updated and no full build was run for this audit.

### Coordinated integration

The coordinator's `pnpm build` completed successfully. All **16 Typography tests**
passed in the combined **135-test** Card/Alert/Tag/Global Style/Typography/legacy/theme/
browser batch. Built CSS is **11,357 raw / 1,875 gzip bytes**, below the unchanged
2,500-byte ceiling. This resolves the isolated audit's pending distribution gate above.

## Remaining differences and deliberately partial API

This remains native HTML/CSS, not a Vue Typography replacement. The prior tag/as,
theme/provider/router and runtime omissions remain. The local semantic-type set
still excludes source Text's additional `primary`; arbitrary prefix strings are
not supported. Native markup, rather than data flags, supplies code/deletion tags.

Naive transitions remain omitted. Link/underline offset stays `.12em` (**1.68px**
at 14px), versus reference `auto`; the explicit 2px focus-visible outline stays.
Logical RTL decorations and overflow wrapping remain intentional adaptations.
No system-theme automation, body/background palette, browser-wide font installation,
syntax highlighting or block-code styling is added. Only Chromium was rendered;
no all-browser, all-accessibility-tool or full pixel-parity claim is made.
