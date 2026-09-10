# List / ListItem default-style audit

**2026-09-10 — presentation-only correction for the retained native list composition.**
No data binding, item templates, repeater, renderer, controller, registration or runtime
dependency was implemented. The library payload remains **CSS only**.

## Reference and reproducibility

- [Official List page](https://www.naiveui.com/en-US/os-theme/components/list).
- Rendered **naive-ui@2.45.3 / vue@3.5.30**, pinned source commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected `List.tsx`, `ListItem.tsx`, List CSS and light/dark themes, common
  fontSize/textColor2/cardColor/dividerColor/hoverColor/borderRadius roles.
- Before CSS: MarkupUI `082dad182a6155f4963dae8318125836ff155a4e`.
- Private fixtures/evidence:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\list`.
  Existing esbuild bundles only the Vue reference; native examples link the stylesheet.
  Fixture scripts construct known test examples, not a shipped list-data API.
- `node server.mjs` serves a fixed asset allowlist at `http://127.0.0.1:4205`.
  Server is stopped after verification; no shared server/build file was changed.
- `reference.html` / `markup.html`; `?dark` selects actual dark theme.
  Native `?before` selects the baseline. `?core` / `?core&reverse` test canonical
  CSS/themes in both orders. `?shared` / `?authored` are labeled override cases.
- Reference uses `NList`, `NListItem`, `NConfigProvider`, `NGlobalStyle`.
  Native uses an external shell/header/footer and real `ul > li`, with explicit
  **`data-markerless role="list"` for the Naive-equivalent visual comparison**.
  Default native markers are not removed by this audit.
- Chromium **151.0.7922.174**, Windows fonts, **740×2000 viewport, DPR 1**;
  hover runs use 740×1600. Fixture supplies equal 24px insets, 500px list width,
  canvas colors and literal content. Private contexts are closed in `finally`;
  shared active pages are never used.
- Finite paint transitions are settled before static capture. `measurements.json`
  contains **18 document runs / 17 cases**. `hover-measurements.json` records
  first/middle/last-item hover; `native-checks.json` records JavaScript-disabled behavior.
  Before/reference/after full PNGs and bounded comparison crops are retained.

## Corrected typography, spacing and boundaries

Default example: three items, `Item 1` through `Item 3`, at 500px width.
All dimensions are CSS pixels.

| Property / case | Before native | Reference and corrected native | Result |
| --- | --- | --- | --- |
| Default body | Inherited fixture 14px, 1.5 leading | 14px, **22.4px leading** | Correct common defaults |
| Plain default padding | 12px 16px | **12px 0** | Removed unsolicited inline inset |
| Bordered or hoverable padding | 12px 16px | **12px 20px** | Corrected items/header/footer together |
| Default three-item height | 137 | **139.171875** | Corrected leading and zero-layout dividers |
| Bordered three-item height | 139 | **141.171875** | Same 1px enclosing border |
| Header/items/footer height | 229 | **232.953125** | Correct boundary accounting |
| Bordered header/items/footer height | 231 | **234.953125** | Fixed |
| Header only / footer only | 46 each, including orphan border | **46.390625**, no orphan separator | Fixed sparse compositions |
| Header + footer, no items | 92 | **93.78125**, one header boundary | Fixed |
| Empty | 0 | Same | No placeholder or fabricated item |
| Divider opt-out with header/footer | 227 | **232.953125**, same height as divider-on | Decorative separators no longer change layout |
| Default first glyph origin | (16,13) | **(0,13)** | Fixed inline padding |
| Item box | 45px content/padding plus real borders | **46.390625px**, no layout border | Matches absolute reference divider anatomy |
| Radius | 6px outer, no hover-item radius | **3px** outer / hoverable item | Fixed |
| Prefix/suffix spacing | Single 12px row gap | **20px end/start margins** | Matches independent slot spacing |
| Prefix + suffix without main | One gap | **40px total between affixes** | Suffix starts at x=60.03125 after 20.03125px prefix |

The source places a 1px absolute divider inside each item. Native now uses an empty,
pointer-passive `::after` decoration instead of a real top border. Visible following
items, or a visible footer after the list, enable the line. Hiding those regions removes
the appropriate divider without changing any list node or row height.

The header separator is independent of `show-divider`, but exists only when visible
items/footer follow it. The final item/footer boundary is an **item divider** and follows
`data-show-divider="false"`; a standalone footer has no border. This corrects the earlier
claim that header and footer separators were both independent.

## Light/dark paint and hover

| Role | Before standalone | Corrected/reference light | Corrected/reference dark |
| --- | --- | --- | --- |
| Text | `#18181b` in both themes | `#333639` | `rgba(255,255,255,.82)` |
| Surface | White in both | White | `#18181c` |
| Border/divider | `#e4e4e7` | `#efeff5` | `rgba(255,255,255,.09)` |
| Hover | `#f3f4f6` | `#f3f3f5` | `rgba(255,255,255,.09)` |

Dark divider/hover colors are alpha paints over the actual list surface, not
Descriptions' precomposited border color or a generic legacy muted background.
Hoverable items have 3px corners and suppress **their own bottom divider** while hovered;
the preceding item's boundary remains visible.

Body/item/divider paints use the reference's **0.3s cubic-bezier(.4,0,.2,1)** transitions.
Native reduced-motion mode disables them. Hover remains gated to hover-capable devices,
an intentional native adaptation.

**No shared source change was needed.** Shared font-size/family/line-height are reused;
local palette defaults avoid mismatched legacy generic text/surface/border roles.
Local public paint/typography/padding tokens win over inherited theme/preset fallbacks.
Automatic modal/popover provider context remains outside the CSS-only contract.

## Actual rendered equality, with the size boundary explicit

Seventeen cases cover default/bordered, full header/footer, sparse/empty regions,
divider off, hoverable/bordered-hoverable, prefix/main/suffix, missing main, and the
retained small/large native density extensions.

- **138 of 170 normalized after/reference case comparisons match**, including
  box/glyph geometry, type, colors, padding, corners and visible divider paint.
  The other **32** are exclusively the four known small/large density cases across
  default/core/shared modes; they are listed, not hidden, in the JSON evidence.
- **26/26 default-density crop pairs are byte-identical**: 13 markerless-equivalent
  cases in both themes. Representative default crop hashes:

| Theme | Identical reference/after SHA-256 |
| --- | --- |
| Light | `4d260676b35f666e093e68d0b0aa955b5cc47f6302a2a05ecc331b1ee860b3c8` |
| Dark | `1facede00863ca6018a1ccd799be41bd892001522558b58701d739708a6e63b0` |

- All **24 hover comparisons match**: two themes, default/local overrides, bordered
  and unbordered hoverable lists, first/middle/last items. Four default middle-hover
  crop pairs are also byte-identical.
- A real source divider `div` and an empty CSS pseudo-element are intentionally
  different DOM anatomy. Normalization compares visible divider paint rather than
  falsely requiring the same node or an invisible divider's computed content string.

### Retained size adaptation — not upstream parity

Pinned List declares `size` but never consumes it in render/theme/CSS. Actual reference
small/medium/large are therefore the same. Native small **8px/12px** and large
**16px/20px** padding remain deliberate density conveniences; medium uses the corrected
0px/20px inline rule according to bordered/hoverable state.

At default typography, native small three-item height is **115.171875** and large
**163.171875**, versus **139.171875** for either reference prop value. These are
documented adaptations, not unfinished default fixes. Omit `data-size` for the normal
Naive-equivalent density, or provide explicit padding tokens.

## Shared/local overrides and native verification

- Shared **18px monospace / line-height 2** matches Naive common overrides for
  default-density cases; the existing native density distinction remains.
- Local **20px serif / line-height 1.5**, 4px/10px padding, 8px affix margins/radius
  and independent text/surface/border/hover colors override shared/preset values.
  Source comparison uses matching theme overrides plus explicit source padding/font
  CSS because List exposes no runtime padding prop.
  All 17 local-override cases match, including sizes; three plain items measure
  **500×114**. Neither style nor content is overwritten by a controller.
- JavaScript-disabled Chromium retained real `ol`/`li`, decimal markers, `start=3`,
  `li value=8`, external header/footer and no synthetic list constructor.
  Passive items stayed `cursor:auto`; the explicit row-action button was `pointer`.
- Divider off kept the native form-list height **188.5625px** unchanged.
  Hiding the final item/footer removed the remaining last divider; hiding all items
  then left the header with a **0px** border. Original nodes and field focus survived.
  Chromium checks live sibling-selector behavior; jsdom unit checks alone cannot
  establish those rendered `:has()` updates.
- Native reset restored **Original**, required validation blocked empty submission,
  and the real form submitted **`?name=NoJS`** with page scripts disabled.
- Root/divider transition durations were **0s** under reduced motion. Divider paint
  remained black in tested forced-colors and print modes. Templates stayed inert.

## Validation and integration gate

- `pnpm exec vitest run tests\list.test.ts`: **13/13 passed**. Tests retain list structure,
  markers, native actions/forms, hidden/templates, nesting and wrapping coverage, with
  updated zero-layout divider/size expectations and new type/token/budget regressions.
- CSS **6,575 raw / 1,424 level-9 gzip bytes**, below the unchanged **1,500-byte**
  ceiling. Component JS and runtime dependencies remain **zero**.
- Owned-file diff check passes. No shared/index/generated files, dependency manifests,
  full build, commit, push or cross-agent broadcasts were changed/run.
  Parent owns final integration/manifest validation.

### Coordinated release integration

The coordinator's isolated release `pnpm build` and all **13 List tests** passed.
Built CSS remains **1,424 gzip bytes**, within the unchanged 1,500-byte ceiling.
Unfinished unrelated work is excluded. No binding, template or repeater feature is
included; this completes presentation-only integration.

## Explicit native / legacy limits

- Native markers stay visible by default. The pixel evidence uses explicitly authored
  markerless lists; it is not a claim that an ordinary marked `ol` looks like Naive's
  markerless `ul`. Native order/numbering and `display:list-item` remain intact.
- Headers/footers remain outside the real list, unlike upstream header/footer `div`
  children inside `ul`. No invalid list children or `display:contents` workaround.
- Native small/large density, wrapping safeguards, hover-device gating, passive item
  semantics and explicit row-action controls remain intentional adaptations.
- Legacy `mui-list` / `mui-list-item`, framework injection, automatic modal/popover
  theming, arbitrary rich slot sizing, narrow overflow and all-browser/AT behavior
  are not claimed by the bounded screenshot comparisons.
- Divider filtering uses modern sibling `:has()` selectors and native `hidden`;
  unrelated application `display:none` rules are not a visibility parser.
- **No data binding, item template, repeater, virtualizer or runtime rendering feature**
  was introduced or started.

See the [canonical List guide](../../components/list.md) for retained markup and API.
