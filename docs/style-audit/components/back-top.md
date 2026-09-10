# Back Top default-style audit

**2026-09-10 — corrected CSS defaults; retained native helper/controller unchanged.**
This audit fixes presentation without introducing the omitted icon/portal/visibility
renderer or changing explicit root, scroll, native link, focus, disabled or attribute ownership.

## Reference and reproducibility

- [Official Back Top page](https://www.naiveui.com/en-US/os-theme/components/back-top).
- **naive-ui@2.45.3 / vue@3.5.30**, pinned source commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected `BackTop.tsx`, `BackTopIcon.tsx`, component CSS/light/dark/common themes,
  internal BaseIcon styles, primary hover/pressed and popover-color common roles.
- Native baseline: MarkupUI `468401ede7462107463341fd6acc4a2ee9c75003`.
- Private fixture/evidence:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\back-top`.
  Existing esbuild bundles the reference and isolated native helper without writing `dist`.
  `node server.mjs` serves a fixed allowlist at `http://127.0.0.1:4209`; it is stopped
  after verification. No shared build/server/source was edited.
- Reference uses real `NBackTop`, `NConfigProvider`, `NGlobalStyle`, automatic threshold
  activation and the actual default stock icon. Native uses an authored typed button,
  explicit fixed class, accessible label and explicitly authored matching SVG.
  **The SVG is a private comparison asset, not a new shipped/injected library icon.**
- The native action is explicitly authored under `body` for the reference's default
  teleport-location equivalent. No automatic relocation is added to the helper.
- Routes: `reference.html` / `markup.html`; modifiers `dark`, `custom`, `rem`, `text`,
  `element`, `rtl`, native `before`, `core` and `core&reverse`.
  `element` supplies an actual scroll element to the native helper and an explicit
  corresponding reference target. `text` compares an authored “Top” slot instead of SVG.
- Chromium **151.0.7922.174**, Windows fonts, **740×800 viewport**, requested DPR 1,
  reported approximately 1. The measured usable viewport with scrollbars was
  **724.666687×784.666687**, while integer client dimensions rounded to 725×785.
  Thus integer-client subtraction can report 40.333px for an actual CSS **40px** inset.
  `viewport-and-before.json` records exact viewport and computed inset values.
- Private contexts are closed in `finally`. All settled rest/hover/pressed measurements
  finish finite paint/enter transitions; transient visibility animation is not presented
  as native parity.

## Before / after presentation

The baseline native fixture already authored a 26px SVG, but lacked the new opt-in icon
box styling. Its old padding, border and baseline expanded the nominal 44px control.

| Property | Before native | Corrected native and reference |
| --- | --- | --- |
| Control box, this capture | 44.916668×47.75 | **44×44** |
| Icon wrapper | 26×28.833334, inherited 14px/17.5px type | **26×26**, 26px/26px |
| SVG origin inside control | Approximately (9.4584,9.4583) | **(9,9)** |
| Padding | 8.8px | **0** |
| Border | Authored 1px border, computed .666667px in this environment | **0** |
| Radius | 50%, producing an ellipse when content expanded | **22px** at default diameter |
| Text leading | 17.5px | **22.4px**, inherited document typography |
| Rest shadow | 0 2.4px 9.6px rgba(0,0,0,.133) | **0 2px 8px rgba(0,0,0,.12)** |
| Hover/pressed shadow | Unchanged from rest | **0 2px 12px rgba(0,0,0,.18)** |
| Fixed offsets | 2.5rem | **40px**, retaining native safe-area minimums |
| Root-rem change | Size and offsets were rem-dependent | 20px root-rem case still measures **44px / 40px**, matching reference |

Default native radius is derived from the selected minimum size, preserving round small/
large native presets. Public size/radius tokens override private preset values rather than
being overwritten by size classes. These native minimum-size/shape conveniences are not
new upstream props.

### Actual colors and icon behavior

| State / role | Before native | Reference and corrected light | Reference and corrected dark |
| --- | --- | --- | --- |
| Surface | White in both themes | White | `#48484e` |
| Text / normal icon | `#173b68` | `#333639` | `rgba(255,255,255,.82)` |
| Hover surface | `#eef4fc` | Unchanged white | Unchanged `#48484e` |
| Hover icon | Unchanged blue | `#36ad6a` | `#7fe7c4` |
| Pressed icon | Unchanged blue | `#0c7a43` | `#5acea7` |

Source changes shadow and **icon** color, not default surface or text color, on hover/
press. Corrected CSS follows that distinction. Native disabled/aria-disabled controls
retain their disabled appearance and do not receive hover/pressed emphasis.

`mui-back-top-icon` only sizes/tints an authored SVG wrapper. No icon DOM, path, accessible
name or renderer is supplied by the helper. The canonical guide gives an authored
illustration; arbitrary arrows/text/images are not claimed to share the stock glyph's shape.

## Rendered evidence and author overrides

- `visual-measurements.json` records **30 matched state comparisons**:
  rest/hover/pressed across default light/dark, local overrides, changed root-rem,
  text-only content and explicit element roots. Geometry, SVG boxes, typography,
  colors, padding, borders and shadows match for the controlled content.
- **Six rest/hover/pressed crop pairs are byte-identical** in light/dark, including
  the shadow area. This is conditional on the explicitly authored matching SVG;
  it is not an automatic-icon or unrestricted API-parity claim.
- Local overrides matched a **60px** control, **30px** icon, 8px radius, 16px/20px offsets,
  separate text/icon/hover/pressed colors and all three shadow values. Text-only
  content also matches without being replaced by a generated icon.
- `viewport-and-before.json` verifies unchanged dark results with canonical CSS/themes
  in either order. It also records the deliberate RTL difference: source physical-right
  x=640.666687 versus native logical-inline-end **x=40** in this viewport.
- Native shared `--mui-color-primary-hover:rgb(11,22,33)` was rendered as that icon
  color; local `--mui-back-top-icon-hover-color:rgb(44,55,66)` then won.
  The pressed role uses the corresponding shared primary-pressed token.
- Text/popover surface defaults use local fallbacks because generic legacy palette
  roles are not equivalent. **No shared-token edits are required.**

The default fixed class, safe-area behavior and local z-index remain native choices.
The source's body scroll-lock compensation, teleport and fixed-height behavior are not
silently reproduced by the new CSS.

## Visibility and scroll-state presentation

`visibility-traces.json` compares page and element roots:

- Scroll 0 and a request for 179px (platform-rounded to 179.333328px) remain hidden;
  **180px is visible**, and 220px remains visible.
- Returning below 180 hides both when no native focus is held. The ordinary automatic
  threshold notifications were `[true,false]` in each implementation.
- Source removes/recreates its visible node and uses scale/fade enter/leave rendering.
  Native retains the authored action and changes its owned display marker. Only
  settled visibility is equivalent; no enter/leave renderer was added.
- Native forced-show assignments remain silent by the existing helper contract.
  The rendered source emitted additional controlled-show updates in this fixture.
  Callback semantics are therefore not claimed to be identical.

`native-checks.json` verifies ownership under actual interaction:

- With an explicit reader at top=220/left=120, clicking the native button under
  reduced motion returned **only that reader to top=0**, kept **left=120** and left
  window scroll at (0,0).
- Action/SVG node identity and focus survived. The focused control stayed visible
  with threshold=false and even after `show=false`; blur then hid it.
- Author `hidden` remained true and won over helper visibility.
- A disabled action retained normal icon color, `not-allowed` cursor and .6 opacity;
  clicking it left scrollTop=220 unchanged.
- Forced colors restored a visible system-color border and removed shadows; print
  hid the navigation action. Reduced motion also disables the new paint transitions.
- `no-js-link.json`: an authored native fragment link remained **44×44** with a 26px
  SVG box, navigated to `#page-top` and scrolled to zero with page scripts disabled.
  The separate JS-only button remained author-hidden.

The existing 42 behavior tests continue to cover late cancellation, explicit roots,
horizontal/RTL scrolling, native keyboard clicks, focus retention, disabled/fieldset state,
refresh/disconnect races, native fragment ownership and conditional marker restoration.

## Validation and payload

- `pnpm exec vitest run tests\back-top.test.ts`: **44/44 passed**.
  Added external style/budget/reduced-motion checks and authored icon/style preservation.
- Controller, entry and classic namespace source are unchanged. No renderer,
  data-binding/template feature or runtime dependency was introduced.
- Production-equivalent isolated esbuild with original targets/minification/source-map
  reference and level-9 gzip:

| Asset | Raw bytes | Gzip bytes | Existing ceiling |
| --- | ---: | ---: | ---: |
| Back Top ESM | 8,069 | 3,212 | 3,500 |
| Back Top classic | 8,232 | 3,281 | 3,500 |
| Back Top CSS | 3,392 | 994 | 1,000 |

CSS rules were compacted to keep the correction within the existing 1,000-byte ceiling;
no ceiling, shared source or generated adapter was changed.
No full build, commit, push or broadcasts were performed. Parent owns integrated
declarations/manifest/suite validation.

## Coordinated release integration

The coordinator scoped icon viewport sizing to **direct child SVGs**, so nested authored
SVG viewports are not reset. With a 26px outer SVG and a nested 12-by-6 viewport in a
24-unit viewBox, the actual release rendered **13-by-6.5px** inner bounds as authored.

The isolated release `pnpm build` and all **44 Back Top tests** passed. Final CSS is
**996 gzip bytes**, below the unchanged 1,000-byte ceiling; runtime/helper code is
unchanged. This supersedes the isolated CSS estimate above.

## Remaining native / legacy limits

- No stock SVG asset, icon renderer, portal/teleport, target inference or visibility
  transition renderer is added. The native action and its content remain authored.
- Native anchors retain URL/history/default focus behavior and have no helper click
  listener. Typed buttons use explicit native root scrolling and cancellation ownership.
- Focus-held visibility, disabled semantics, reduced-motion scrolling and native print/
  focus cues intentionally differ from the source's generic clickable div.
- Fixed placement is opt-in and logical in RTL, uses safe-area minimums and a local
  layer, and remains constrained by authored ancestors/transforms. No body lock or
  pinch-viewport positioning compensation is promised.
- Small/large/square classes and flexible minimum sizing remain native conveniences;
  oversized/tall custom content, arbitrary SVG artwork and unequal dimensions are
  not covered by the default-icon equality claim.
- Optional paint/size overrides are CSS, not source theme-object or renderer APIs.
  Custom hover-background styling remains an explicit native override.
- All-browser, screen-reader, physical pinch and every application clipping/stacking
  context are not certified by the bounded comparisons.

Evidence is retained under session `files\style-reference\back-top`:
`visual-measurements.json`, `viewport-and-before.json`, `visibility-traces.json`,
`native-checks.json`, `no-js-link.json`, and captured PNGs. Private contexts and the
dedicated fixture server are closed after verification.
