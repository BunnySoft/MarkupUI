# Card default-style audit

## Pinned demo parity page — 2026-09-11

The runnable Card page now mirrors all thirteen pinned Naive UI 2.45.3 demos in source
order: Basic, Size, Cover, Hoverable, Slots, Border, Segmented, Closable, No title,
Content Scroll, Loading, Custom and Embedded. Each case has an icon-only MarkupUI code
control and highlighted authored HTML.

The page exposes the retained native replacements directly:

- Vue Card slots/render props become authored light-DOM Card regions;
- the remote cover is a deterministic local SVG;
- loading uses local CSS skeletons rather than an `NSkeleton` renderer;
- Switch, Tabs and Button are independent MarkupUI/native compositions;
- style-object props become external CSS classes;
- content scrolling remains native overflow;
- close intent updates an inline native status instead of invoking an overlay service.

The proposed documentation direction is to prefer concise passive `mui-card-*` light-DOM
parts while retaining semantic native marked regions. Shadow DOM is not needed for Card
slot-like syntax; scoped data templates remain a separate proposed binding feature.

Chromium 152 confirmed the Basic Card matches the rendered reference at **300×112.19px**
with 3px corners, `#333639` text and a white surface. The page uses the same two-column
case layout at the tested desktop width; close, loading/content replacement, Tabs and
native content scrolling work with zero console errors.

**2026-09-10 — native defaults fixed; legacy and rendering boundaries remain explicit.**
This visual pass does not replace the historical native-migration acceptance record.

## Reference and rendered evidence

- Official reference: <https://www.naiveui.com/en-US/os-theme/components/card>.
- Naive UI **2.45.3**, source commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; Vue **3.5.30**.
  Inspected Card light/dark/common themes, Card CSS/rendering and close-control anatomy.
- Reference-only fixture:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference`.
  Existing dependencies stayed outside the repository; no dependency changes or
  upstream icon assets were added to MarkupUI.
- Rebuild there with `npm run build`; serve with `node server.mjs` on port **4190**.
  The existing server was restarted attached as `card-reference` to expose Card routes.
  Existing Avatar and Button routes remain available.
- `/card-reference.html` renders default `NCard` under `NConfigProvider` and
  `NGlobalStyle`; `/card-markup.html` uses standalone Card plus opt-in Global Style.
  `?dark` selects explicit dark themes. Markup `?before` reconstructs controller/CSS
  from **391449b**. `?core` loads Card before the aggregate; `&reverse` reverses
  external CSS order. `?core&legacy` uses the actual basic legacy controller.
- Chromium **151.0.7922.174**, Windows, **1000×1250 CSS pixels**, DPR 1,
  360px-wide cards, identical labels, system fonts, separate documents.
  Waited **450ms** after render before reading default styles: initial transition
  values are not accepted as endpoints.
- `card-cases.js` defines **14 cases**; `card-measure.js` records host/region/title/
  close geometry and computed styles. `card-verify.js` contains the Playwright
  comparison function (invoke its function body with a browser runner).
  **1,752 selected computed-style/geometry comparisons passed**, across standalone,
  standalone+core and reversed CSS order, each light/dark, against isolated Naive.
  Eleven documents include reference, before, after and actual legacy observations.
- `card-audit-measurements.json` preserves those results beside the fixture.
  Full-page `card-reference-light.png`, `card-markup-light.png`,
  `card-reference-dark.png`, and `card-markup-dark.png` were captured and visually
  inspected. These are session evidence, not shipped assets or an automated
  pixel-difference threshold. The close mark retains the raster boundary below.

## Measured differences and corrections

All implementation changes are in `src/components/card/card.css`, except replacing
the font-dependent multiplication character with an empty decorative span in
`card.ts`; CSS draws its two rounded strokes. No template or binding feature was added.

| Case | Naive / actual native after | Native before | Correction |
| --- | --- | --- | --- |
| Default title+content | **360×112.1875px** | 360×149.1875px | Asymmetric header padding and no duplicated content top padding |
| Content only | **360×64.390625px** | 360×72.390625px | First visible content uses 20px vertical, 24px horizontal |
| Small / medium / large / huge height | **85.984375 / 112.1875 / 124.1875 / 136.1875px** | 113.984375 / 149.1875 / 181.1875 / 216.390625px | Header top/horizontal/bottom: 12/16/12, 19/24/20, 23/32/24, 27/40/28px |
| Medium header/content/footer/action padding | **19px 24px 20px / 0 24px 20px / 0 24px 20px / 20px 24px** | 24px on every edge of every region | Region-specific rhythm |
| Full regions height | **216.96875px** | 289.96875px | Footer/action start-aligned block flow, not flex-end |
| Full / soft segmented height | **259.96875px** | 292.96875px | Correct top padding plus 1px separators; soft content/footer inset 24px |
| Borderless height | **110.1875px**, no border | 149.1875px with transparent layout border | Remove physical border, not just its color |
| Cover + full regions height | **256.96875px** | 329.96875px | Same region corrections; cover remains full width |
| Radius / title weight | **3px / 500** | 8px / 600 | Local Card geometry; huge title corrected 20→18px |
| Light body / heading / border | **#333639 / #1f2225 / #efeff5** | Body/heading #333639 standalone or #18181b with core; border #e0e0e6 standalone or #e4e4e7 with core | Separate Card roles, not unequal legacy generic fallbacks |
| Dark surface / body / heading / border | **#18181c / white .82 / white .9 / white .09** | #1c1c1f / #fafafa / #fafafa / #3f3f46 | Scoped dark defaults with nested-light reset |
| Light action / embedded surface | **#fafafc / #fafafc** | Standalone #fafafc / #f5f5f7; with core both #f3f4f6 | Correct local action and embedded roles |
| Dark action / embedded surface | **white .06 / #18181c** | Both #27272a | Separate action overlay from embedded surface |
| Hover border / shadow | **Unchanged divider color; three-layer shadow** | Recolored border; single 0 4px 16px shadow | Light layers alpha .08/.06/.04; dark .24/.18/.12; exact endpoint match |
| Close layout / state paint | **18×18 / 22×22px**, 8px after extra | 28×28px, no dedicated extra-to-close margin | Decorative two-stroke mark and expanded background pseudo-element |
| Close hover / pressed background | **Light black .09/.13; dark white .12/.08** | Generic hover fill and fixed #e5e5eb pressed | Pointer-hover and mouse-down endpoints measured |
| Theme/state transitions | **.3s cubic-bezier(.4,0,.2,1)** | Host .2s default easing; no region/close color transitions | Local easing; reduced-motion disables host, regions and close paint/control |

The three shadow layers are `0 1px 2px -2px`, `0 3px 6px`, `0 5px 12px 4px`.
Font family, default body size **14px**, and line-height **22.4px** already matched
the isolated reference and remain unchanged by default.

## Shared theme versus component ownership

The equivalent shared roles are **font size**, **line height**, **focus ring**, and
**primary color for fragment targeting**. The existing `--mui-font-size`,
`--mui-line-height`, `--mui-focus-ring`, and `--mui-color-primary` tokens are consumed
behind public Card overrides. Font family inherits. Geometry and easing are local.

The legacy generic palette is not a matching Card palette. Reusing its names merely
because they sound similar would make standalone, core, and dark Card differ again,
or require recoloring unaudited components. This pass therefore keeps Card palette
defaults private and attribute-scoped; it adds **no global color role or preset**.
Canonical `src/theme/presets.json`, generated `presets.ts`, canonical aggregate CSS,
and generated `styles.ts` are unchanged. No baseline hashes were updated.

Card CSS never writes a public `--mui-card-*` value. Authored Card tokens inherit
through theme boundaries and win over defaults. The old implicit generic color
aliases are deliberately removed; applications wanting them can author, for example,
`--mui-card-background: var(--mui-bg-surface)` and
`--mui-card-color: var(--mui-text-primary)` on their theme scope. This is an explicit
application palette decision, not a silent component override of shared colors.

Browser checks confirmed `theme.apply("dark", section)` retains its generic
`--mui-bg-surface: #1c1c1f`, while default Card paints #18181c. Nested explicit light
Card resets to white/#333639. An inherited authored foreground `rgb(4,5,6)` and
per-card background `rgb(7,8,9)` win; radius 11px, padding 10px, Card font 15px over
shared font 17px, and shared line-height 2 produce **15px / 30px**. Authors can
register the same public Card tokens through the existing theme API.

## Regression checks, budgets and boundaries

- `pnpm build`: successful, existing declarations/distributions and budget gates.
- `pnpm test -- tests\card.test.ts tests\legacy-styles.test.ts tests\global-style.test.ts`:
  **52 tests passed** (30 Card, 9 legacy/theme, 13 Global Style).
  Five focused style regressions cover shared-token precedence, local palette,
  nested-theme resets, region geometry and font-independent close/reduced-motion CSS.
- Chromium native keyboard: Enter and Space emitted **two close intents**, **zero
  form submissions**; Card remained connected. Shared focus ring remained visible.
- Hidden header plus inert template leaves first content at **20px 24px**, no divider.
  A medium Card nested in huge retains **19px 24px 20px** header padding.
  RTL moves close to logical end. Reduced-motion checked on host, header, close and
  close pseudo-element after correcting selector specificity.
- Gzip: Card ESM **1,754/3,000**, classic **1,962/3,000**, CSS **2,154/2,500**.
  Core remains **14,996/15,000** and Button CSS **2,497/2,500**.
  No ceiling was relaxed and no unrelated compression was performed.

**Remaining / intentional boundaries:**

1. The actual **basic aggregate-only legacy Card is not visually upgraded** here:
   reference title+content 112.1875px versus legacy 95.78125px; legacy uses 12px regions,
   8px radius, generic palette, default separators and no generated native close.
   It also lacks this entry's size/region behavior. Use the documented optional Card
   entry **before core**, with Card CSS. That integration matches in both CSS orders.
   Expanding the separate legacy implementation is not disguised as native parity.
2. The independently drawn close mark is not the upstream SVG path. Layout, color,
   state surface and approximate silhouette match; exact stroke rasterization is
   not claimed. Native close stays keyboard-focusable by default, unlike the
   reference's default `tabindex=-1`; this existing accessibility choice is retained.
3. Native scrolling, authored content, modal/popover context colors, arbitrary rich
   header wrapping and application-defined themes are not a Vue behavior clone.
   Markup's soft action segmentation is an extension; upstream action segmentation
   is Boolean. It is not counted as a matching upstream feature.
4. Dark **page** color/label styling differs because the generic Global Style theme
   is outside Card scope; opaque Card surface and translucent Card action are
   measured separately. No full-page pixel-identity claim.
5. Chromium evidence only; no Safari/Firefox, screen-reader, touch-device or forced
   colors certification. No loading renderer, template system or data binding.

Card review stops here. The next component is selected separately.
