# Anchor / AnchorLink default-style audit

**2026-09-10 — corrected presentation; native scroll and indicator limits remain explicit.**
Only Anchor CSS/tests/documentation changed. The Anchor controller, `scroll.ts`,
Back Top and shared helpers are untouched. No moving-marker renderer, generated TOC,
native-click interception or router was added.

## Reference and reproducibility

- [Official Anchor page](https://www.naiveui.com/en-US/os-theme/components/anchor).
- Rendered **naive-ui@2.45.3 / vue@3.5.30**, pinned source commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected `AnchorAdapter.tsx`, `BaseAnchor.tsx`, `Link.tsx`, CSS, light/dark/common
  themes and source offset utilities.
- Native baseline: MarkupUI `53bba54d493ff46079e9d832f1739ac7990923d6`.
- Private fixtures/evidence:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\anchor`.
  Existing esbuild bundles the pinned Vue reference and isolated native helper.
  `node server.mjs` serves a fixed allowlist at `http://127.0.0.1:4211`; stopped after
  validation. No shared source/build/server file was edited.
- Routes `reference.html` / `markup.html`; modifiers `nested`, `block`, `no-rail`,
  `no-background`, `long`, `dark`, `custom`, `local`, native `before`, `core`, `reverse`.
  Real source `NAnchor` / `NAnchorLink` and native `nav > ul > li > a` share actual
  section targets in a 240px-high element scrollport.
- Chromium **151.0.7922.174**, Windows fonts, **820×700 viewport, DPR approximately 1**.
  TOC width 240px; fixture-controlled canvas and section positions.
  Separate private contexts are closed in `finally`; shared active pages are untouched.
- `visual-measurements.json`: **80 snapshots**, ten variant pairs and four scroll states.
  `interaction-colors.json` covers active/hover/pressed and core-order probes.
  `native-checks.json` / `no-js-link.json` record URL/history/focus/root ownership.
  Before data and actual nested-active screenshots are retained.

## Corrected default list/link/rail presentation

| Property / case | Before native | Source and corrected native where stated |
| --- | --- | --- |
| Link type | 14px / 22.4px leading | **13px / 19.5px** |
| Default three-link height | 105.5625px | **71.5px** |
| Default first glyph origin | Approximately (13.1979,7.7292) | **(20,.6667)** |
| “Overview” glyph | 56.9896×18.6667 | **52.9167×17.3333** |
| Successive rail-link origins | y≈7.7292 / 42.9167 / 78.1042 | **y≈.6667 / 26.6667 / 52.6667** |
| Link separation | Padding-created rows, no source gap | **6.5px gap**, half the 13px link size |
| Nested indentation | 1rem | **16px**, independent of root-rem changes |
| Four-link nested rail TOC height | Four padded rows | **97.5px** |
| Nested glyph origin | Padded legacy anatomy | **(36,52.6667)** in the measured rail case |
| Default rail | 2px gray border on each link, nested fragments | **4px continuous root rail** with transparent inactive link borders |
| No-rail first glyph x | Legacy link padding | **4px**, matching the source's residual inset |
| Block link padding / corners | Legacy .4rem/.7rem padding, 4px corners | **2px/8px**, **3px corners** |
| Hover treatment | Underline | Source-style hover color, **no added underline** |

The native rail is a continuous root border. Link negative start margins let the
top-level active border overlap it without shifting glyphs. This keeps the existing
link-owned marker model; it does **not** implement source marker coordinates.

## Light/dark and interaction colors

| Role | Before | Corrected/source light | Corrected/source dark |
| --- | --- | --- | --- |
| Link text | `#283343` | `#333639` | white/.82 |
| Rail | `#c4cbd5` | `#dbdbdf` | white/.2 |
| Active text/marker | `#155cb0` | `#18a058` | `#63e2b7` |
| Hover/focus text | Inherited/underline | `#36ad6a` | `#7fe7c4` |
| Pressed text | No matching role | `#0c7a43` | `#5acea7` |
| Active fill | Opaque `#e9f1ff` | Primary at **15% alpha** | Primary at **15% alpha** |

The active marker retains its active color while hover/pressed text changes, matching
the source's separate rail/text roles. Color, border and background transitions are
0.3s with the pinned easing; reduced motion disables them. Native focus-visible outlines
remain an intentional accessibility cue rather than copying the source's removed outline.

Shared primary/hover/pressed tokens are reused. Native CSS color mixing derives the
15%-alpha fill from the shared primary, so a brand override does not leave a stale
default-green background. Local text, active, hover, pressed, rail, padding, indentation
and size tokens remain authoritative.

**No shared-token source changes required.** Legacy generic text/rail colors are not
equivalent; local fallbacks provide the pinned roles without rewriting other components.

## Actual evidence — and why this is not whole-component pixel parity

- All **144 paired link samples** matched font family, size, leading and text color.
  **136 glyph rectangles matched**; the eight differences are the known nested-block
  placement and long-title wrapping cases below, each observed at four scroll positions.
- Default, nested rail, no-rail and no-background glyph positions match. The default
  continuous rail's 4px width and full-height extent match.
- Active/hover/pressed text colors match in light, dark, shared-brand and local-override
  cases. Native core CSS/theme ordering preserved the checked interaction colors.
- Shared-brand customization used 16px monospace links and brand primary/hover/pressed
  colors. Local overrides used 6px rail width, 20px padding/indentation, independent
  active/hover/pressed colors and a 20%-alpha background. Measured rail-mode glyphs and
  type/color values matched their corresponding reference overrides.

**Indicator and wrapper differences are deliberately retained and visible in screenshots:**

1. Source owns a measured root rail bar. At the nested active link it is
   **(0,52), 4×20px**. Native colors that link's own border at
   **(16,52), 4×19.5px**. It does not move a shared bar back to x=0.
2. Source measures a rounded background slot at **(2,52), 240×20px**.
   Native paints the actual nested link at **(16,52), 224×19.5px**, with its own corners.
   Source uses rounded rail/backplate ends; a native root border has square rail ends.
3. Native default link boxes include the padding/marker region (240px wide at x=0);
   source title anchors begin at x=20 and are 220px wide. Glyph equality is not a claim
   that click boxes or background ownership are identical.
4. Flat block glyphs match, but native root height is **78.5px vs 82.5px** because the
   source retains a final 4px wrapper margin. In nested block mode, the nested glyph
   appears at **(24,57.6667)** natively versus **(16,51.6667)** in source.
5. Source block active background belongs to a wrapper that can include descendant
   links. Native active fill remains on the selected native link only.
6. Source titles are single-line ellipsized with generated title attributes.
   Native long text wraps without a renderer/tooltip; the long-title glyph box and
   total navigation height therefore differ.
7. Native no-background explicitly suppresses its fill in block mode as well; source
   show-background governs its separate rail-mode slot rather than all block backgrounds.

No screenshot equality headline hides these differences. CSS fixes the density and roles;
the native per-link indicator remains a distinct, non-measured representation.

## Native URL, history, focus and target ownership

The controller/shared scroll utility are unchanged; rendered checks verify those contracts:

- Explicit `scrollTo("#s2", { behavior:"instant" })` moved only the selected reader to
  **scrollTop=260**, preserving **scrollLeft=120** and window scroll **(0,0)**.
- Document URL and all original href strings stayed unchanged. Focus remained on the
  previously focused `#s1` link even while current location became `#s2`.
  Exactly one managed `aria-current="location"` remained; original link nodes survived.
- Actual native clicks changed hashes to **#s1**, then **#s4**; browser Back returned
  to **#s1**. No helper click interception, history patch or synthetic target focus.
- A newly authored nested navigation under outer block/no-rail/no-background restored
  its own **4px rail**, `0 16px` padding and normal active tint. Mode presets did not leak.
- Print produced black active-link text and transparent background; native focus and
  forced-color cues remain independent of source indicator rendering.
- With page JavaScript disabled, a real anchor still rendered at **13px**, with a
  **4px rail**, no generated current marker, and navigated to `#notes`.
  The authored 8px target scroll margin landed at approximately **8.1667px** after
  browser scroll rounding.

Native section sorting, gaps, bottom-visible-target fallback, encoded-ID resolution,
explicit root validation and ownership restoration are existing tested policies.
They are not converted into source `scrollIntoView`, current-hash or measured-bar behavior.

## Validation and payload

- `pnpm exec vitest run tests\anchor.test.ts`: **37/37 passed**.
  Added audited CSS/budget/reduced-motion checks and authored-style/href/focus preservation.
- Controller, entrypoints, **`scroll.ts` and Back Top are unchanged**, verified with
  scoped `git diff --exit-code`. No shared helpers were edited.
- Production-equivalent isolated esbuild, original minification/ES2022/source-map-reference
  options and level-9 gzip:

| Asset | Raw bytes | Gzip bytes | Existing ceiling |
| --- | ---: | ---: | ---: |
| Anchor ESM | 10,411 | 3,991 | 4,500 |
| Anchor classic | 10,571 | 4,060 | 4,500 |
| Anchor CSS | 3,450 | 996 | 1,000 |

Rules were compacted to preserve the existing CSS ceiling; no budget or dependency was
relaxed. No full build, generated/index edit, commit, push or broadcasts were performed.
Parent owns final integrated build/manifest checks.

## Coordinated release integration

The coordinator's isolated release `pnpm build` and all **37 Anchor tests** passed.
Final CSS is **996/1,000 gzip bytes**. Controller, shared scrolling utility and Back Top
remain unchanged. Native link-local indicators and the documented geometry differences
are retained; no measured-marker renderer is included.

## Remaining limits

Native fragment navigation, explicit-root scrolling and actual focus/history ownership
are retained. No source router/scroll interception, Affix/Scrollbar dependency, measured
indicator animation, generated title/TOC or renderer was added. Logical RTL presentation,
wrapping, arbitrary author positioning, browser/AT differences and mixed nested-wrapper
layouts are outside the bounded equality checks. Modern CSS color mixing is used for tint.

Private contexts and dedicated fixture server are closed after verification. See the
[canonical guide](../../components/anchor.md) for the retained API and scroll policies.
