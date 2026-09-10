# Page Header visual-default audit

Date: 2026-09-10. Scope: CSS-only authored regions, typography, spacing, back-control
appearance and native RTL. No generated headings, navigation, controls or component dependencies.

## Actual reference and fixtures

- Pinned Naive UI: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Rendered `naive-ui@2.45.3`, `vue@3.5.30`, `NPageHeader` in explicit light/default
  and dark providers; RTL uses the actual `unstablePageHeaderRtl` reference style.
- Inspected PageHeader props/rendering, common/light/dark theme values, CSSR and RTL CSSR.
- Chromium private contexts, 900×2400 viewport, device scale 1, matching system font and
  surrounding 14px/1.6 text. Normal examples are 640px wide; compact/narrow cases are 360/280px.
- Eighteen cases per theme: full composition; title/subtitle combinations; authored and
  stock-reference back icons; text back label; avatar; extra combinations; header/content/
  footer-only and no-main compositions; empty root; compact, narrow and 20px/1.8 parent context.
- Header navigation is identical **authored native breadcrumb markup** in both fixtures.
  No Breadcrumb styling/runtime is imported or inferred by Page Header.
- Avatar and ordinary back SVGs are identical original author artwork supplied through
  reference slots. A separate stock-back reference case checks its real 22px box without
  copying that asset into the native implementation.
- Session `files/page-header-style-audit` retains fixtures, stylesheet snapshots,
  computed measurements and before/reference/after screenshots.

Seventeen non-stress cases match the captured root/visible-region geometry, typography
and colors in both themes and RTL. Invisible helper-wrapper allocation need not match:
the native composition keeps its lead/titles wrappers and wrapping policy.

## Measured geometry and typography

Values below are at the normal fixture font/context unless stated otherwise.

| Measurement | Before | Reference / after |
| --- | ---: | ---: |
| Title font size / weight | 20px / 600 | 18px / 500 |
| Title/subtitle row height | 28.391px | 27px |
| Subtitle box height | 22.391px | 21px |
| Back SVG control width × height | 32×28px | 22×22px |
| Avatar x in full row | 44px | 38px |
| Title x in full row | 96px | 90px |
| Subtitle x in full row | 197.266px | 182.734px |
| Text back label box | 84.672×36.391px | 104.75×33px |
| Compact 360px composition height | 78.391px | 40px |
| Header-only total occupied height | 22.391px | 42.391px |
| Full composition under 20px/1.8 parent | 208px | 186.375px |

Corrections:

- Root flow is block-based, with 20px header-end/content/footer margins. Adjacent margins
  collapse rather than double when the main row is absent. Header-only retains its trailing
  20px space; content/footer-only start at zero.
- Main/content/footer have the actual 14px font role. Main uses line-height 1.5; header
  and content/footer retain the surrounding line-height behavior. In the 20px parent case,
  header text remains 20px while content/footer are 14px with 25.188px line boxes.
- Title/subtitle align centrally, not on mismatched baselines. Title is 18px/500;
  subtitle remains 14px.
- Back has a 16px logical end margin, avatar 12px and title/subtitle separation 16px.
  The previous uniform lead gap misplaced the avatar/title after a padded back control.
- Back is borderless/unpadded with a 22px font. Authored em SVGs respond naturally;
  fixed 40px avatar artwork remains untouched.
- Main has no forced horizontal gap; remaining space puts extra content at logical end.
  Its 16px row gap and shrinkable 12rem lead basis retain native wrapping without the old
  over-eager extra-row break at 360px.

## Palette and back states

| Role | Before light/dark | Reference / after light | Reference / after dark |
| --- | --- | --- | --- |
| Title | inherited page color | `#1f2225` | white `.9` |
| Subtitle | `#57575c` | `#767c82` | white `.52` |
| Back normal | inherited page color | `#333639` | white `.82` |
| Back hover | `#175fbb` | `#36ad6a` | `#7fe7c4` |
| Back pressed | `#104b95` | `#0c7a43` | `#5acea7` |

Back hover/pressed values were measured with real pointer states. Native transitions
remain immediate; reference color transitions were allowed to settle.
Correct shared font-size and light primary interaction roles are reused, while local
title/subtitle/back defaults avoid incorrect legacy text-role substitution. No shared
theme source was edited. Plain header/content/footer/extra color stays inherited.

## Fixed-origin screenshot checks

Each selected fixture was isolated at the same origin, without changing its content or
Page Header styles. Every changed RGB channel counts; no tolerance was used.

| Case | Image dimensions | Light differing pixels | Dark differing pixels |
| --- | --- | ---: | ---: |
| Full, including authored back/avatar/breadcrumb | 640×168 | 0 | 0 |
| Title + subtitle | 640×27 | 0 | 0 |
| Text back label | 640×33 | 0 | 0 |
| Avatar + title | 640×40 | 0 | 0 |
| Extra + title | 640×27 | 0 | 0 |
| Header only | 640×43 | 0 | 0 |
| Header + content + footer | 640×108 | 0 | 0 |
| Compact full main row | 360×40 | 0 | 0 |
| Authored font context | 640×187 | 0 | 0 |

These eighteen comparisons use matching authored SVGs. They do not claim that native
Page Header generates or duplicates Naive UI's stock back artwork.

## Native wrapping, ownership and author checks

- The 280px stress case deliberately differs: upstream scroll width is 724px; native
  remains 280px wide with all title text visible. Native height is 325px rather than
  upstream's overflowing 165px content height. Large labels/assets need author sizing;
  compact nowrap parity is not imposed at the expense of readable controls/headings.
- At 480/320/280px viewports, document width matched the viewport. The tested narrow
  title had 208.063/208.063/240px available width and remained unclipped.
- Native back stays a named button/link, not the source's clickable div. Enter and Space
  each invoked one authored back click without submitting the surrounding form.
  Native submit fired once, reset restored the original value, and disabled stayed disabled.
- An authored breadcrumb link navigated to its actual hash. Nav name/current-item state,
  H1 tag and original nodes were preserved; no role/heading-level/navigation behavior was inferred.
- Author overrides produced 30px region margins, a 24px/700 title, 16px body, 15px subtitle,
  main line-height 2, independently authored colors and a 28px back SVG inside a 36px
  padded control with 5px radius. The original 40px avatar markup/size remained intact.
- Hidden/inert preceding regions left first visible content at y=0. No empty-node renderer
  or `:empty` removal was added.
- Later legacy CSS left all captured fields unchanged in both themes. Native RTL matched
  logical placements without rewriting DOM order or mirroring caller artwork.
- Print retained the full 135px stress-title text with visible overflow. Forced colors/
  reduced motion retained a focused 2px outline, no animation and a 0s transition.

Native action-group wrapping and helper flex bases are deliberate adaptations. Breadcrumb,
Avatar or Button **component** styling is not bundled through those slots. See
[Page Header](../../components/page-header.md) for all author tokens and semantic boundaries.

## Validation and limits

- `pnpm test -- tests\page-header.test.ts`: **15 tests passed**.
- Isolated stylesheet copy, gzip level 9: **1,092 / unchanged 1,500 bytes**.
- Component JavaScript, runtime dependencies, generated controls and asset loaders: **0**.
- The coordinator's isolated release `pnpm build` and all **15 Page Header tests**
  passed. Final CSS remains **1,092 gzip bytes**; unfinished unrelated work is excluded.
  No shared source or generated adapter was edited.
- Chromium only. No arbitrary-slot/widget, stock-artwork, spoken accessibility or
  all-browser pixel certification. Application contrast, destinations, callbacks and
  asset responsiveness remain caller responsibilities.
