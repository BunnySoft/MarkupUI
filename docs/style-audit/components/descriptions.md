# Descriptions default-style audit

**2026-09-10 — corrected within the retained native `dl`/`dt`/`dd` scope.**
The typography/paint corrections are verified against actual rendered Naive UI.
Native equal-width grid allocation, independent group outlines and whole-group spans
remain explicit adaptations, **not** an implementation of the upstream table algorithm.
Component JavaScript remains **zero bytes**.

## Reference and reproducibility

- [Official Descriptions page](https://www.naiveui.com/en-US/os-theme/components/descriptions).
- **naive-ui@2.45.3 / vue@3.5.30**, pinned source commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected `Descriptions.tsx`, companion item source, CSS, light/dark themes,
  `_common.ts` padding presets, and shared font/text/surface/divider roles.
- Before stylesheet: MarkupUI `86bf99b0fe2a652872310a6079038174fe650a26`.
- Private fixture/evidence directory:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\descriptions`.
  Existing esbuild bundles only the Vue reference; native code links the CSS.
  `node server.mjs` serves a fixed asset allowlist on `http://127.0.0.1:4203`;
  server is stopped after verification. No shared fixture/build file was edited.
- Routes `reference.html` / `markup.html`; `?dark` selects actual dark theme.
  Native `?before` selects captured baseline CSS. `?core` / `?core&reverse` test
  captured canonical CSS/themes in both orders. `?shared` / `?authored` are labeled
  shared typography and local override comparisons, not defaults.
- Reference: `NDescriptions`, `NDescriptionsItem`, `NConfigProvider`, `NGlobalStyle`.
  Native: valid grouped definition-list markup with authored decorative separators.
  Fixture supplies equal canvas colors, 24px inset, **600px list width**, text and
  external case labels. No demo-site CSS or document-theme parity claim.
- Chromium **151.0.7922.174**, Windows system fonts, **840×2000 viewport, DPR 1**.
  All pages use private contexts, closed in `finally`. Finite transitions are settled
  before measurement; shared active browser pages are never used.
- `measurements.json` preserves **18 document runs** covering 16 cases, each term/value
  glyph and cell box, type, colors, padding, alignment, borders and frame differences.
  `styleDifferences` and `geometryDifferences` are separate: a color/style match must
  not conceal a table/grid geometry difference. `native-checks.json` records the
  JavaScript-disabled verification.

Cases include default/small/large, bordered sizes, left placement, bordered left,
physical center/right alignment, one/two/three columns, mixed spans, an incomplete
last row and unequal text lengths. Before/reference/after full-page PNGs and cropped
unbordered-case PNGs are retained.

## Corrected defaults and measurements

Balanced examples have six `Label` / `Value` pairs in three columns, unless labeled
otherwise. All dimensions are CSS pixels.

| Property / case | Before native | Corrected native | Reference |
| --- | --- | --- | --- |
| Default top-label list height | 196 | **101.5625** | 101.5625 |
| Small unbordered height | 164 | **97.5625** | 97.5625 |
| Large unbordered height | 228 | **112** | 112 |
| Unbordered left height | 148 | **56.78125** | 56.78125 |
| Large unbordered left height | 164 | **64** | 64 |
| Default columns | 189.328125px tracks with 16px column gaps | **200px**, no column gap | 200px for balanced text |
| Default first label glyph origin | (16,13) | **(0,1)** | (0,1) |
| Default first value glyph origin | (16,58) | **(0,23.390625)** | (0,23.390625) |
| Default top term weight | 600 | **500** | 500 |
| Bordered term weight | 600 | **400** | 400 |
| Small / medium / large font size | Inherited 14px throughout fixture | **14 / 14 / 15px** | Same |
| Leading | 1.5; 21px at default | **1.6; 22.4px**, large 24px | Same |
| Unbordered padding | Size padding on every term and value | **0**; 8/12/16px inter-row gaps | Zero term padding; non-final value rows have 8/12/16px bottom padding |
| Bordered padding, small | 8px 12px at 16px rem base | **8px 12px**, independent of rem | Same |
| Bordered padding, medium | 12px 16px at 16px rem base | **12px 16px** | Same |
| Bordered padding, large | 16px 20px | **16px 24px** | Same |
| Corner radius | 4px per group | **3px per group** | 3px on the outer table frame |
| Unbordered group background | White surface even in dark | **Transparent** | Transparent |
| Unbordered left label/value | Fixed 1:2 tracks, often wrapping short labels | **Inline label + inline-block value** | Same flow |
| Separator | .25em leading padding | **2px leading / 8px trailing margins** | Same |

Row gaps intentionally replace upstream bottom padding on non-final table rows.
Text and next-row positions match without a last-row parser; native value boxes
remain 22.390625px tall instead of the reference's first-row 34.390625px box.

### Important live-source distinction: left labels

At the pinned version, the stylesheet contains `.n-descriptions-table-row__label`,
but rendered unbordered-left markup uses `.n-descriptions-table-content__label`.
The intended 500 weight, textColor1 and 14px margin in that unused rule do **not**
apply. This was verified in the rendered document, not inferred from token names.

The actual left label inherits **400 / textColor2**, has no extra 14px margin,
and places the default value at **x=45.703125**. Native now matches those live
metrics rather than copying declarations that never match the reference DOM.
Its explicit local label color/weight overrides still work.

## Light and dark paint

| Role | Before standalone | Corrected/reference light | Corrected/reference dark |
| --- | --- | --- | --- |
| Top/bordered term text | `#18181b` | `#1f2225` | white/.9 |
| Value and unbordered inline-label text | `#18181b` | `#333639` | white/.82 |
| Bordered value surface | `#fff` in both themes | `#fff` | `#18181c` |
| Bordered term background | `#f3f4f6` | `#fafafc` | `#26262a` |
| Border | `#e4e4e7` | `#efeff5` | `#2d2d30` |

Dark background/border values are the actual card/header/divider composites, not
the legacy generic surface/border palette. Local theme-boundary fallbacks work
without aggregate CSS; explicit nested light resets the dark roles.

**Shared changes needed:** none for these local corrections. Existing shared font
family/leading, optional strong weight, and small/medium/large font-size roles are
used where their meanings match. Future shared palette consolidation would need
accurate textColor1/textColor2, card, header and composited divider roles; generic
legacy primary/surface/border tokens cannot silently substitute for them.

## Exact matches and explicit remaining geometry differences

Font family, size, weight, leading, text color and term/value background comparisons
returned **zero style differences** across all 160 after/reference case combinations:
light/dark, both core stylesheet orders, shared typography and local overrides.

Seven controlled unbordered cases have **byte-identical reference/after PNG crops in
both themes**: default, small, large, left, large-left, one column and two columns.
Representative default crop SHA-256:

| Theme | Identical reference/after hash |
| --- | --- |
| Light | `a0c17c43a151c51fae198e28723ce093f125a6871b003031ceff8ea2a87fb315` |
| Dark | `5381a04f86ddb568fb764c1220b5a30df47ff40709c54c3255f25dc12b8b2f6d` |

**The entire gallery is not pixel-identical.** Retained differences are measured:

- Two bordered rows retain independent outlines: medium native height
  **191.5625 vs 190.5625**, small **159.5625 vs 158.5625**, large **230 vs 229**.
  Adjacent group borders do not collapse, and each group has its own corners.
- Bordered medium label x positions are **17 / 217 / 417** natively versus
  **17 / 217.3125 / 417.625** in the auto-layout reference table.
  Bordered-left native height is **96.78125 vs 95.78125** and retains the documented
  local 1:2 label/value tracks, not global table subcolumns.
- Unequal text gives reference label x positions **0 / 83.1875 / 280.71875**,
  while native equal tracks remain **0 / 200 / 400**.
- In the mixed-span example the second reference group begins at **x=300**;
  the native two-track span starts at **x=200**. Native spans cover the whole pair.
- Incomplete rows do not automatically expand the last native group. Matching
  visible text positions for a short label is not proof that the empty cell area matches.
- Even balanced shared monospace overrides expose table rounding: second/third
  reference values at **199.984375 / 399.96875**, native at **200 / 400**.
- Variable-height terms/definitions are paired locally, not synchronized as separate
  table header/value rows across every column.

These are the retained definition-list/grid boundaries, not hidden failures in
`styleDifferences`. No table roles, cell-packing runtime or template parser was added.

## Authored overrides and native verification

- Shared role font sizes **13/16/18px**, monospace, line-height 2 and strong weight
  600 match corresponding reference common styles. Bordered and live inline-left
  labels correctly keep their 400 defaults unless locally overridden.
- Local **20px serif / 1.5**, label weight 700, independent text/header/surface/border
  colors, 8px radius and bordered **4px 10px** padding override the shared/preset
  values. Reference uses matching theme overrides plus explicit CSS for its otherwise
  unmatched inline-label selector. Native borders/track allocation remain as above.
- JavaScript-disabled Chromium preserved valid `dl > div > dt + dd`, an external
  heading, original nodes/focus and no table/grid roles or custom constructor.
- Live left placement showed the authored separator; adding bordered hid it.
  Inline local alignment **center** won over `data-label-align="right"`.
  Two 240px tracks plus a two-column span produced a **480px** group.
  A local 20px font and 4px padding survived the large-size preset.
- Native reset restored **Original**, required validation blocked empty submission,
  and a real form submitted **`?name=NoJS`** with page scripts disabled.
- Reduced-motion emulation reports **0s** cell transitions. A CSSOM regression checks
  that the reduced-motion query is top-level, not accidentally nested inside print.

## Validation and integration gate

- `pnpm exec vitest run tests\descriptions.test.ts`: **14/14 passed**, covering existing
  native content/forms/hidden/templates/spans/nesting plus default style, local priority,
  top-level reduced-motion and budget assertions.
- CSS **6,993 raw / 1,272 level-9 gzip bytes**, under the unchanged **1,500-byte**
  ceiling. Component JavaScript and runtime dependencies remain **zero**.
- Owned-file diff check passes. No shared/index/generated files, package dependencies,
  full build, commit or push were changed/run. Parent owns integration and manifest gates.

### Coordinated release integration

The coordinator's isolated release `pnpm build` and all **14 Descriptions tests**
passed. Final CSS remains **1,272 gzip bytes**, below the unchanged 1,500-byte ceiling.
Unfinished unrelated work is excluded; integration is complete.

## Remaining scope limits

- Legacy `mui-descriptions` / `mui-description-item` remain unchanged.
- No automatic final-span expansion, table intrinsic-width distribution, shared
  border frame, synchronized header rows, column/span parser or renderer.
- Top/left/alignment/size are native CSS switches. Unknown size/placement values retain
  the documented native fallback rather than reproducing every invalid upstream prop.
- Optional upstream title/header styling stays an author-owned heading outside the
  `dl`; no generated heading or automatic ARIA association is introduced.
- Modal/Popover-specific theme composites require explicit local overrides; no runtime
  provider-context detection is installed.
- Logical RTL placement, rich controls, long text safety, hidden-until-found, custom
  constraints and all-browser/assistive-technology behavior are not covered by the
  limited screenshot equality claim. Preserve positive, bounded column/span values
  and appropriate label-width constraints at every breakpoint.

See the [component guide](../../components/descriptions.md) for the retained API.
