# Icon / IconWrapper default-style audit

**Integrated defaults fixed, 2026-09-10.** CSS-only corrections; no runtime, icon package, copied artwork,
shared palette edit, generated adapter, global index edit, full build or commit.

## Reference and fixture

- Official page: <https://www.naiveui.com/en-US/os-theme/components/icon>.
- Source/runtime: **Naive UI 2.45.3**, commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`, with the existing **Vue 3.5.30** fixture dependency.
- Inspected `src/icon/src/Icon.ts`, Icon CSS/light/dark themes, common light/dark values,
  and IconWrapper props/CSS/themes. The public Icon props are color, depth, size and component:
  **there is no semantic type or rotation prop** in this baseline.
- Private fixture:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\icon-style`.
  Run `node build.mjs`; it bundles only the private reference and copies current Icon CSS.
  `node server.mjs` serves an explicit asset allowlist on an available loopback port.
  Active attached session: **`icon-style-preview`**, **http://127.0.0.1:60791**.
- Routes: `/reference.html`, `/native.html`, `/native.html?before`, and `?dark` variants.
  `measure.js` returns actual computed properties and boxes; `window.setDepth(n)` exercises
  live depth changes. No shared reference server was modified.
- Reference uses `NConfigProvider theme=null` + `NGlobalStyle` for light and actual
  `darkTheme` for dark. Markup uses its documented opt-in Global Style/themes path.
  Same Chromium **151.0.7922.174**, Windows fonts, **1000×1400 CSS pixels, DPR 1**,
  inline `Text [icon] Text` rows, and a locally authored rectangle—not upstream artwork.
- Twenty-two cases cover wrapper/direct SVG, native i/span glyphs, five depths, custom size
  and color, SVG color attributes, fixed/omitted paint, rotation and IconWrapper.
  Separate browser contexts/pages isolate the libraries and concurrent agents' work.

## Differences and measured results

Fix file: `src/components/icon/icon.css`. “Relative top” is the icon/wrapper top minus its
adjacent text span's top in the controlled inline row.

| Case | Naive expected | Native before | Native after / status |
| --- | --- | --- | --- |
| Default inline box | inline-block, position relative, centered text, 1em square | Neutral wrappers inline-flex, position static | inline-block/relative/center; **fixed** |
| Default size/leading | 14×14px and 14px line-height under reference globals | Already 14×14 and 14px | **Matched**, retained inherited 1em behavior |
| SVG inline alignment | baseline; relative top **1px** | −.125em vertical-align = −1.75px; relative top **2.75px** | baseline, relative top **1px**; **fixed** |
| Glyph alignment | Reference i root relative top **3px** | Native i root **4.75px** | **3px**; **fixed** |
| Native i font style | Italic from native i semantics | Forced normal | Explicit reset removed; i now italic. Span/direct SVG retain their native inherited style; **fixed without forcing an i renderer** |
| No-depth color | Inherits document text | Inherits document text | **Correct policy retained**; differing body palette is not an Icon defect |
| Light depths 1–5 | Base color black; SVG alpha **.82/.72/.38/.24/.18** | Inherited body color; whole-graphic alpha **1/.8/.6/.4/.2** | Base black; effective single-SVG alpha **.82/.72/.38/.24/.18**; **fixed**, retained opacity anatomy explained below |
| Dark depths 1–5 | Base color white; SVG alpha **.9/.82/.52/.38/.28** | Inherited body color; same old light values | Base white; effective alpha **.9/.82/.52/.38/.28**; **fixed** |
| Depth transitions | Color/opacity .3s cubic-bezier(.4,0,.2,1) | None | Same duration/easing and measured opacity trajectory; **fixed** |
| Wrapper geometry | 24×24px, 6px radius, no border, inline-flex | 24×24, 6px, layout border 1px transparent | 24×24, 6px, border 0; **fixed border model** |
| Wrapper inline alignment | Baseline; relative top **−4px** | middle; relative top **−.5px** | Baseline, **−4px**; **fixed** |
| Wrapper light colors | Primary `rgb(24,160,88)`, white icon | Matched | **Matched**, token overrides retained |
| Wrapper dark colors | Primary `rgb(99,226,183)`, black icon | Primary matched, icon remained white | Black icon; **fixed** |
| Wrapper transitions | Color/background .3s reference easing | None | Same computed transitions; **fixed** |
| Rotation | Author CSS transform; no rotation prop | Author CSS already retained | 45° matrix `(.707107,.707107,−.707107,.707107,0,0)` matches; **retained** |
| Forced colors / reduced motion | Native safety adaptation | Depth opacity restored, wrapper edge | Full depth opacity and 1px system edge remain; newly added transitions are disabled immediately; **retained/improved** |

Across all 22 cases, light and dark comparisons had **no differences in the measured
display/position, dimensions, inline relative top, vertical alignment, line-height,
background, radius or graphic dimensions**. This is not a blanket font/paint/DOM equivalence
claim: native tag selection and safe paint differences below remain deliberate.

For live depth 1→5, both rendered implementations measured effective opacity:

| Relative transition time | Source | Native |
| --- | ---: | ---: |
| 0ms | .82 | .82 |
| 150ms | .323641 | .323641 |
| 299ms | .180004 | .180004 |

Both report **300ms, cubic-bezier(.4,0,.2,1)**. The source animates its SVG descendant; native
animates its retained whole-graphic opacity, so the ordinary single-asset visual result agrees.

## Author overrides and native safety

- A direct SVG `color="#a04080"` remained `rgb(160,64,128)` and its exact outerHTML was
  unchanged. Fixed artwork remained `rgb(232,93,74)`; no fill, stroke or stroke-width rule
  was introduced.
- Overrides rendered correctly: `--mui-icon-size:31.25px`, explicit `--mui-icon-color`
  `rgb(1,2,3)`, and `--mui-icon-depth-3:.37`. Nested explicit light inside dark produced
  black/.38 rather than retaining the outer dark defaults.
- Native viewBox, preserveAspectRatio, title/description, IDs, transforms and node/listener
  identity remain untouched. An unclassified SVG stayed **70×30px**.
- A nested SVG retained its **12×6 user-unit** viewport within a 40-unit outer viewBox.
  At the outer 14px icon size it correctly rendered **4.2×2.1px**; it was not reset to 1em.
  A stroke-only path retained `fill:none`, stroke `rgb(18,52,86)` and its authored 2-unit stroke.
- No roles, labels, tabindex, form types, click handlers or asset-loading behavior are added.
  Native reset restored `initial`; a native submitter still contributed `action=save`.
  Both buttons retained their actual types and individual Tab stops.
- Forced colors immediately produced depth opacity **1**, no transition and a **1px**
  system wrapper edge. The stylesheet does not set `forced-color-adjust`; the SVG's
  browser-provided adjustment remains native. Reduced motion reports `transition:none`.
- Colour/rotation styling is CSS, not an invented `data-type`/rotate API. HTML button type
  remains a form action. Explicit author box-sizing, font/color and transform declarations
  continue to follow the cascade.

## Explicit retained differences

1. **Paint safety:** Naive sets broad `fill:currentColor` and descendant SVG dimensions.
   Native does neither. An SVG with omitted fill keeps native black, rather than being
   silently recolored; theme-adaptive assets should explicitly use currentColor. Nested SVG
   viewports and fixed/multicolor/stroke instructions are preserved.
2. **Depth anatomy:** native depth still attenuates the whole SVG/image/glyph composition,
   preserving the existing native feature. Naive attenuates SVG descendants only, not text
   glyphs or images. Additional opacity on a wrapped SVG is composed rather than overwritten.
   Complex overlapping/multiple assets are not certified as the same compositing model.
3. **Native tags:** the reference always emits i; native spans/direct SVGs need not inherit
   i's italic text semantics. Native border-box normalization and non-shrinking graphic
   sizing are retained for opted-in assets/actions; the ordinary borderless dimensions agree
   despite those computed layout choices. Constrained flex layouts are not blanket parity.
4. **Document palette:** source no-depth light color is `rgb(51,54,57)` and dark is white/.82;
   the current Markup themes supply `rgb(24,24,27)` and `rgb(250,250,250)` to inherited text.
   No shared/body palette changes or demo masking were made to erase that known distinction.
5. There is no component-constructor adapter, icon package, arbitrary renderer or automatic
   accessibility owner. These are native-scope boundaries, not claims of full Naive API parity.

## Validation and handoff

- `pnpm test tests\icon.test.ts --reporter=dot`: **14 tests passed**.
  Coverage includes native SVG/DOM/paint preservation, unrelated/nested SVG, semantics,
  native actions/forms, exact depth token values, geometry rules, rotation ownership,
  media adaptations and the unchanged CSS budget.
- Private reference build only: **Icon CSS 830 gzip bytes**, formerly **609**, under the
  existing **1,000-byte ceiling**. No stylesheet minification workaround is required.
- `git diff --check` passed for the owned changes.
- Source-ready files: `src/components/icon/icon.css`, `tests/icon.test.ts`,
  `docs/components/icon.md`, `docs/naive-ui/components/icon.md`, and this report.
- **No shared CSS/theme, index, generated adapters, builder, root demo, package changes,
  full build, commit, push or sibling broadcast.** Parent owns integration and final build.

The coordinator subsequently ran the isolated release `pnpm build` and all **14 Icon
tests** successfully. Final CSS is **830 gzip bytes**, within the unchanged 1,000-byte
ceiling. Unfinished unrelated work is excluded; integration is complete.
