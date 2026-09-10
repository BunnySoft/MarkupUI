# Statistic default-style audit

**2026-09-10 — corrected and rendered-verified for the enhanced/native scope below.**
No shared source, generated adapter, dependency, build ceiling or legacy implementation
was changed. Binding/templates and Number Animation remain outside this task.

## Reference and reproducibility

- [Official Statistic documentation](https://www.naiveui.com/en-US/os-theme/components/statistic).
- Naive UI **2.45.3**, pinned commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected `src/statistic/src/Statistic.tsx`, Statistic CSS, light/dark themes,
  common font/leading defaults and common light/dark text roles.
- Rendered existing isolated **naive-ui@2.45.3 / vue@3.5.30**, not website/demo CSS.
  Reference uses `NStatistic`, `NConfigProvider` with default light or `darkTheme`,
  and `NGlobalStyle`. No Statistic size enum or title prop exists: the title is `label`,
  and size is typography/theme CSS.
- Before source: MarkupUI `66e529aef6876e9a31b12e068e82f80897675310`, Statistic only.
  Before CSS/controller are separate preserved fixtures, not mixed with corrected code.
- Private fixture directory:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\statistic`.
  `build.mjs` uses the repository's existing esbuild and writes only fixture assets;
  `node server.mjs` serves a fixed allowlist on `http://127.0.0.1:4199`.
  The server is stopped after verification. No shared fixture server was changed.
- `reference.html` / `markup.html`; `?dark` selects dark.
  Markup `?before` selects the baseline. `?core` / `?core&reverse` add captured
  canonical core/themes CSS in either order. `?shared` and `?authored` are explicitly
  labeled typography/token overrides, not reference defaults.
- **Private browser contexts**, closed in `finally`; no shared active page used.
  Chromium **151.0.7922.174**, Windows fonts, **700×1400 viewport, DPR 1**.
  The fixture supplies equal 24px insets, 360px metric width, case labels and canvas
  colors; it does not claim to audit Global Style or unrelated page defaults.
- `measure.js` records actual host/region rectangles, visible **text-node** glyph Ranges,
  computed color, family, weight, size, leading, margins, display, transitions and
  tabular typography. Measuring an enclosing native slot `div` as a glyph would
  incorrectly include the block wrapper; text-node Ranges avoid that artifact.
- `measurements.json` contains **18 document runs**: before/reference/after, both
  core orders, shared typography and local overrides, each in light/dark.
  `native-checks.json` records node/visibility, role precedence and reduced-motion checks.
  PNGs retain before/reference/after for both themes and the authored-override variants.

## Measured mismatches and corrections

Normal/default content is label **Revenue**, value **123**, within a 360px-wide metric.
Coordinates are relative to the metric host. Numbers below are CSS pixels.

| Property / case | Before enhanced Statistic | Pinned reference and after | Result |
| --- | --- | --- | --- |
| Value size / weight | 28px / 700 | **24px / 400** | Fixed; no invented size prop |
| Label size / leading | 14px / 22.4px | Same default | Preserved; shared/local overrides verified |
| Value leading | 30.8px from 1.1 | 38.4px from 1.6 | Fixed |
| Default metric height | 57.1875 | **64.78125** | Fixed |
| Label box / glyph | 360×22.390625; 52.484375×19 | Same geometry | Paint corrected below |
| `123` glyph box | 48.328125×37 at (0,22.390625) | **38.8125×32 at (0,29.390625)** | Fixed font weight/size/baseline |
| Display layout | Wrapping flex row, baseline alignment, gap 4 | Block line box containing inline affixes/value | Fixed native inline layout |
| Prefix/suffix spacing | Flex gap only between present items | Prefix end margin 4; suffix start margin 4 | Fixed, including missing-value cases |
| Value-only host height | 30.796875 | **42.390625** | Restored persistent 4px row margin |
| Label-only host height | 22.390625 | **26.390625** | Retained empty passive display container |
| Completely empty host height | 0 | **4** | Correct spacing without fabricated text/semantics |
| Explicit empty value + label | 26.390625 | Same | Literal empty override preserved |
| Color transition | None | 0.3s cubic-bezier(.4,0,.2,1) on label/value/affixes | Fixed; reduced motion disables it |
| Native slot visibility | Prop override hides owned wrapper | Same, including computed `display:none` | Inline slot rule explicitly excludes hidden wrappers |

For value 0, prefix `$`, suffix `USD`, both affixes with `12,345.60`, `tabular-nums`,
authored label/default slots, suffix-only and both-affixes-without-value, after host,
visible region, glyph, typography and margin measurements also match.
Tabular typography is still opt-in and performs no numeric conversion.

### Paint and shared roles

| Role | Before standalone light/dark | After/reference light | After/reference dark |
| --- | --- | --- | --- |
| Label | `#636366` in both | `#767c82` | `rgba(255,255,255,.52)` |
| Value / prefix / suffix | `#333639` in both | `#333639` | `rgba(255,255,255,.82)` |

These are Naive `textColor3` and `textColor2`. The legacy `--mui-text-primary` /
`--mui-text-secondary` roles do **not** carry those defaults, so blindly reusing them
made even light styling drift when aggregate themes were loaded.

The correction keeps theme-boundary fallbacks local and reuses shared typography where
semantically correct: `--mui-font-family`, `--mui-font-size`, `--mui-line-height`, and
an optional `--mui-font-weight` override. Local Statistic tokens take precedence.
Each color role is independent: changing value color no longer implicitly recolors affixes.

**Shared work needed:** none to make this component correct. Future palette consolidation
would need accurately defined textColor2/textColor3 roles with the values above; it must
not silently alias the existing legacy primary/secondary colors. No shared declarations
or generated theme adapters were edited.

### Actual rendered equality

All **130 after/reference case comparisons** across the two themes, both core stylesheet
orders and shared/local overrides returned **zero differences** in the measured fields.
Absent/hidden and empty regions are normalized as having no visible glyphs; their host
spacing is still measured, not ignored.

Complete controlled default fixture screenshots are **byte-identical**:

| Theme | SHA-256, identical reference and after PNG |
| --- | --- |
| Light | `81bbcb05b3b572a760484f3e9f5fb7edca7d744a923ed11f2e04b5d402de2f04` |
| Dark | `799a58b863a56d183328cc21a851a63584cd36407660375cbc7e32b15bae7b52` |

This statement is bounded to the listed fixtures, fonts, browser and viewport, not an
all-content, all-browser or API-parity certification.

## Authored tokens and native checks

- **Shared overrides:** 18px shared font size, monospace, 600 weight and line-height 2
  match corresponding Naive common overrides. Label is 18px/36px; value remains
  24px/48px; the default metric is **360×88**. Shared size correctly affects the
  label without replacing Statistic's separate 24px value default.
- **Local overrides over shared:** serif family, 16px/500 label, 32px/400 value,
  line-height 1.5, gap 8, unit margins 6 and four distinct role colors match reference
  theme overrides plus explicitly authored reference family/spacing CSS.
  Metric is **360×80**; label glyph 55.984375×17 at (0,3); `123` glyph 48×36 at (0,38).
  In the both-affixes case, prefix starts at x=0, `12,345.60` at x=22 and suffix at x=156.
- Authored local/shared styles survive value, affix, tabular and reconnect updates;
  the controller writes no inline styles or runtime theme objects.
- In dark, explicit `--mui-statistic-value-color:rgb(1,2,3)` changes only the value.
  Prefix/suffix stay white/.82 and label white/.52, even when legacy shared primary/
  secondary colors are deliberately set to magenta/cyan.
- Nested explicit light restores label `rgb(118,124,130)` and value `rgb(51,54,57)`.
  Enhanced and native static definition-list examples both measure **64.78125px** high.
- Attribute overrides hide authored label/value slot wrappers with computed `display:none`;
  removing overrides restores the **same original node**. Native ARIA, headings, links,
  listeners and forms retain existing tested ownership.
- Reduced-motion emulation reports **0s** transition duration on label and value.
  No count animation, timer, formatter or automatic announcement was added.

## Validation and integration gate

- `pnpm exec vitest run tests\statistic.test.ts`: **23/23 passed**.
  Added passive empty-container spacing, authored-token preservation and external CSS
  regressions. All existing literal values, zero/empty/missing precedence, native actions,
  node restoration, hidden/ARIA, inert templates, namespace property and lifecycle tests pass.
- Production-equivalent isolated esbuild: minified ES2022 ESM/IIFE, legal comments removed,
  source map reference retained; CSS copied unminified. Level-9 gzip:
  **ESM 1,520 / 2,000**, **classic 1,729 / 2,000**, **CSS 753 / 1,500 bytes**.
  No ceiling was relaxed and no runtime dependency added.
- Owned-file `git diff --check` passes. No full build, declaration emission, generated
  adapter update, commit or push was run here. The parent owns integrated build/suite,
  final manifest verification and release operations.

### Coordinated integration

The coordinator's `pnpm build` and **55 combined Spin/Statistic tests** passed,
including all **23 Statistic tests**. Final manifest gzip is **1,520 ESM /
1,729 classic / 753 CSS bytes**, below unchanged ceilings. Declaration/distribution
and budget gates are complete.

## Remaining native / legacy limits

- Legacy aggregate Statistic remains unchanged: old flattened DOM/text and old styling
  do not acquire these defaults. Enhanced-before-legacy registration rules still apply.
- No parser, rounding/locale engine, Number Animation integration, Vue slot/VNode renderer,
  binding/template feature or automatic accessibility role/live announcement.
- Label is a label region, not an inferred heading or fabricated `title` API.
  Native authored headings/actions keep their own semantics and browser styles.
- Static HTML preserves literal whitespace between inline spans; author adjacent spans
  when matching reference affix margins without extra text spaces.
- SVG/image affixes retain the existing native 1em sizing convenience; this is not a
  complete emulation of every upstream Icon component or arbitrary slot renderer.
- Arbitrary block slot content, unbreakable strings, custom fonts, forced colors,
  every clipping/wrapping context and all assistive technologies are outside screenshot
  equality. Normal native layout replaces the former automatic flex wrapping.

See the [component guide](../../components/statistic.md) for the retained API and native
content/announcement responsibilities.
