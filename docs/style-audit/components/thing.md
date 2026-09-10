# Thing default-style audit

**2026-09-10 — corrected and rendered-verified for the retained CSS-only composition.**
Thing still ships **zero component JavaScript**: no registration, renderer, dependency,
measurement, binding/template facility or new size/align prop.

## Reference and reproducibility

- [Official Thing documentation](https://www.naiveui.com/en-US/os-theme/components/thing).
- Rendered **naive-ui@2.45.3 / vue@3.5.30**, matching pinned Naive source commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected `Thing.tsx`, Thing CSS/light/dark themes, common textColor1/textColor2,
  fontSize and fontWeightStrong. The source's indented/unindented wrapper branches
  explain its different header/content margin behavior.
- Before CSS: MarkupUI `9013bad5a9dc5fef57c90ea253b472af4c1a46b4`.
- Private fixtures/evidence:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\thing`.
  `build.mjs` uses existing repository esbuild only for the isolated Vue reference.
  Native Thing merely links the component CSS. Captured core/themes/global CSS are
  fixtures, not modifications to shared sources.
- `node server.mjs` serves an explicit asset allowlist at `http://127.0.0.1:4201`.
  It is stopped after verification. No shared server/build file was edited.
- Routes: `reference.html`, `markup.html`; `?dark` selects actual dark theme.
  Native `?before` selects baseline CSS; `?core` / `?core&reverse` test canonical
  styles/themes in both orders. `?shared` and `?authored` are labeled overrides.
- Reference uses `NThing`, `NConfigProvider`, `NGlobalStyle`. Native uses ordinary
  article/header/h3/paragraph/div/SVG regions. Fixture canvases, 24px inset, 360px
  Thing width and text are equal; no website demo styling or Avatar dependency.
- **Private contexts**, closed in `finally`; shared active pages never used.
  Chromium **151.0.7922.174**, Windows fonts, **750×2000 viewport, DPR 1**.
  Finite color transitions are finished before static capture. This avoids confusing
  a partially inherited color transition after stylesheet loading with a palette mismatch.
- `measurements.json` contains **18 document runs**. `measure.js` records host/region
  boxes, actual visible text-node glyph Ranges, size/weight/leading/family and colors.
  `native-checks.json` records a separate JavaScript-disabled browser check.
  Before/reference/after PNGs persist for both themes.

## Before / after geometry and typography

Default case: title **Title**, description **Description**, content **Content**.
“All regions” also includes **Extra**, **Footer**, **Action**. Coordinates below are
relative to the Thing root; dimensions are CSS pixels.

| Property / variant | Before native | Reference and corrected native | Result |
| --- | --- | --- | --- |
| Body type | Inherited size, 1.5 leading; 14px/21px in fixture | Shared/default 14px, **22.4px leading** | Fixed |
| Title type | 18px / 600 / 27px leading | **16px / 500 / 25.6px** | Fixed |
| Title glyph | 35.40625×24 at (0,1) | **31.46875×21 at (0,2)** | Fixed |
| Title wrapper width | Expanded to 360px | Intrinsic **31.46875px** | Fixed native flex sizing |
| Default root | 360×85 | **360×86.375** | Fixed |
| Default description top | 31 | **29.59375** | Fixed |
| Default content top | 64 | **63.984375** | Fixed |
| All-regions root | 360×151 | **360×155.15625** | Fixed |
| Title-only root | 360×27 | **360×29.59375** | Header's 4px bottom margin retained |
| Header-extra-only root | 360×21; extra pushed to end | **360×26.390625**; extra starts at inline-start | Fixed |
| Description/content/footer/action alone | 21px tall | **22.390625px** tall | Fixed; no phantom preceding row margin |
| Empty root | 0px tall | Same | Preserved |
| Avatar inset / gap | Top 0 / 12px gap | **Top 2 / 12px gap** | Fixed vertical offset |
| Default 34px avatar | Authored width 34 | Same; leading text starts at **x=46** | Preserved width, corrected vertical placement |
| 64×100 avatar, unindented | Capped to 48px width; root 174px tall | Authored 64×100; content y=114, root **205.171875px** | Removed invented 48px maximum |
| 64×100 avatar, indented | Root 174px tall, later rows displaced | Root **155.15625px**; content (76,63.984375) | Avatar spans the body tracks |
| Indented title + content + 34px avatar | Root 67px tall | **59.984375px**; content (46,37.59375) | Fixed header-only collapsed-margin equivalent |
| Indented 64×240 avatar | Capped media; root 279px tall | Root **242px**, content y=63.984375, footer y=98.375, action y=132.765625 | Final flexible track absorbs excess height |
| Action/header-extra gap | Default .5rem | **0**; explicit spacing remains available | Removed unsolicited spacing |

The grid retains the native DOM instead of moving an avatar between upstream-style
wrappers. Three intrinsic body tracks followed by a flexible final track prevent an
oversized spanning avatar from distributing extra height between text rows.
Region margins, rather than a universal row gap, preserve sparse cases.
Header-only indentation compensates for the reference's collapsed margins; the
compensation is clamped so a row gap below the header gap cannot become negative.

## Light/dark paint and shared roles

| Role | Before standalone light and dark | After/reference light | After/reference dark |
| --- | --- | --- | --- |
| Body / description / header-extra / footer / action | `#18181b` | `#333639` | `rgba(255,255,255,.82)` |
| Title | Inherited `#18181b` | `#1f2225` | `rgba(255,255,255,.9)` |

Root/title now have matching **0.3s cubic-bezier(.4,0,.2,1)** color transitions;
reduced motion disables them. The description's optional local color token remains.

Body and title are independent roles. `--mui-thing-color` does not implicitly recolor
the title; its own token remains authoritative. Explicit nested light resets the
dark fallback roles without installing a runtime provider.

**Shared sources were not changed.** Shared font-size/family/line-height and optional
font-weight-strong overrides are reused where their meanings match. The legacy
`--mui-text-primary` palette is not Naive textColor2/textColor1 and is no longer
silently used for both roles. Future shared-palette consolidation would need those
accurate body/title roles; it is not required for the local correction.

## Rendered evidence and authored-token precedence

All **160 after/reference comparisons** match across 16 cases, light/dark, both core
stylesheet orders, shared typography and local overrides. The matrix includes sparse
regions, title/extra-only, standard avatars, both indentation modes, 64×100 media and
the 64×240 avatar taller than the complete text body.

Complete controlled default fixture PNGs are **byte-identical**:

| Theme | Identical reference/after SHA-256 |
| --- | --- |
| Light | `2c9a9db6d9edca70888df325923202586f927c99551a67c5b7f1aa337c529709` |
| Dark | `b7e791c8dccd9e6cf5e4690635a9aa7e98185557bb6a0bf92f96e04880292e27` |

This is a bounded fixture/browser/font result, not unrestricted Vue or pixel parity.

- **Shared:** 18px monospace, line-height 2, strong weight 600 matches Naive common
  overrides. Title stays 16px/600/32px, body becomes 18px/36px, default root **360×120**.
- **Local over shared:** 20px serif body, 24px/700 title, 1.5 leading, 20px column gap,
  16px row margins, 6px header gap, and independent body/title/description colors match
  corresponding reference theme overrides plus explicit reference CSS size/spacing.
  Default root **360×118**; title glyph 47.5625×26 at (0,5), description top 42,
  content top 88. These are CSS overrides, not an invented Thing size prop.
- Public tokens are no longer assigned defaults on every root. That old pattern
  erased inherited author overrides. A nested Thing now inherits an authored **20px**
  row margin, and its own **8px** override wins; nested content remains full-width.
  Indentation still does not leak into nested roots.
- Component CSS remains low-specificity and never changes nodes, attributes, listeners,
  heading levels, accessible names or native form ownership.

## Native verification and budget

- `pnpm exec vitest run tests\thing.test.ts`: **14/14 passed**. Existing native anatomy,
  forms, validation, reset/disabled behavior, node identity, sparse regions, hidden/template
  handling, lists and wrapping tests remain; added default/token and gzip regressions.
  Tests intentionally reflect inherited-author-token precedence rather than the removed
  public-token reset behavior.
- **JavaScript-disabled Chromium:** authored page script did not execute, no
  `mui-thing` constructor existed, and the Thing still rendered as a grid. Hiding the
  real avatar moved indented content x=46→0 despite an inert avatar-class template.
  Restoring it retained every original node and focused Save button.
- Native required validation blocked the empty submission. An external form-associated
  action submitted **`?value=NoJS`** without any library or page script.
- Reduced motion computed **0s** root/title transitions.
- CSS is **3,968 raw / 999 level-9 gzip bytes**, below the unchanged **1,000-byte**
  ceiling; component JS remains **0 bytes**. Both LF and CRLF inputs measured 999 gzip
  bytes. Equivalent rule compaction was needed to retain the full correction within
  this existing ceiling; no feature was moved into JavaScript or shared CSS.
- Owned-file diff check passes. No full build, generated adapter/index update,
  commit or push was run. Parent owns integrated build/suite and final manifest checks.

### Coordinated release integration

The coordinator's isolated release build and all **14 Thing tests** passed.
Built CSS remains **999 gzip bytes**, within the unchanged 1,000-byte ceiling.
The release snapshot uses the published baseline plus ready changes, excluding
unfinished Button motion; no budget relaxation or unrelated source edit was needed.

## Explicit native and legacy limits

- There is no new legacy/core Thing definition or renderer. Existing aggregate/widgets
  behavior and source files remain untouched.
- The authored root/lead structure intentionally differs from upstream conditional
  wrappers. In particular, native description-only content is not suppressed just
  because an unindented avatar exists without a header. Empty/hidden intermediate
  authored wrappers and arbitrary block slot content may not reproduce every upstream
  conditional-wrapper/margin-collapse combination; omit unused regions for precise spacing.
- Single named regions in documented DOM order are the retained composition. Duplicate
  or arbitrarily reordered body regions are not an upstream slot-rendering contract.
- Header/actions retain native wrapping and long-text safety adaptations. Those are not
  a claim to reproduce upstream nowrap/overflow behavior at every narrow width.
- Oversized media needs appropriate author constraints for available inline space.
  The upstream Thing itself does not impose a 48px avatar maximum.
- Modern CSS Grid, logical properties, `:where()` and `:has()` are used; missing `:has()`
  support loses the header-only indentation margin compensation. All-browser/AT,
  arbitrary custom CSS, zoom and forced-color combinations are not certified here.
- No framework theme objects, render callbacks, runtime style forwarding, data binding,
  template evaluation or automatic accessibility announcements are introduced.

See the [canonical Thing guide](../../components/thing.md) for the retained anatomy/API.
