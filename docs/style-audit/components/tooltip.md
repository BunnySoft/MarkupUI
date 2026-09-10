# Tooltip default-style audit

**2026-09-10 — ordinary skin, inherited overrides and base-order resilience fixed.**
Native description semantics, inset arrows, clipping and motion limitations remain explicit.
Integrated by the coordinator; component and shared-helper boundaries are preserved.

## Reference and isolated reproduction

- Official reference: <https://www.naiveui.com/en-US/os-theme/components/tooltip>.
- Naive UI **2.45.3**, source commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; Vue **3.5.30**.
  Inspected Tooltip implementation, light/dark/common theme values and inherited
  Popover presentation. The Tooltip light theme composites black .85 over white,
  yielding **#262626**. Dark mode uses the common Popover surface/text/shadow roles.
- Private fixture:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\tooltip-audit`.
  Existing dependencies remain outside the repository; no installation or production
  dependency changes.
- Run `node build.mjs`, then `node server.mjs` there; dedicated port **4197**.
  The fixture builds production-equivalent Tooltip ESM/classic bundles and a complete
  base-plus-skin stylesheet outside the distribution. `before.css` combines the accepted
  Popover base with Tooltip CSS from **c962674**.
- `/reference.html` renders actual NTooltip/NConfigProvider/NGlobalStyle.
  `/markup.html` renders authored native Tooltip anatomy and the existing helper.
  Options include `open`, `dark`, `case=custom|rich|font|raw|long`, and placements.
  Native `before`, `gap=10`, `arrow`, `animated`, `fallback`, `separate` and `reverse`
  select old styling, comparison geometry and stylesheet ordering.
- Chromium **151.0.7922.174**, Windows, **1000×800 CSS pixels**, DPR 1.
  All browser work used fresh private contexts, closed after each investigation.
  Trigger rect **(400,320), 120×32px**; identical `Tooltip content` and system fonts.
  Upstream transitions settled for 220–300ms before endpoint measurements.
- `measure.js` records geometry, typography, paint, width/overflow and arrow properties.
  Before/after screenshots remain beside the fixture and were visually inspected.
  No full-page pixel-identity or external-arrow raster-equivalence claim is made.

**288 comparisons passed** for default text, authored alternate surface, strong text and
shared typography, each light/dark, across composed CSS and both separate base/skin orders.
Eight presentation values plus width/height were exact; x/y used a **1/64px** tolerance,
with maximum observed native/reference position difference **0.0078125px**.
Native `gap:10` matched the reference arrow-body spacing for this comparison only;
the retained native default gap remains 8px.

## Measured differences and fixes

| Case | Reference / native after | Native before | Correction |
| --- | --- | --- | --- |
| Default box | **121.296875×38.390625px** | 119.296875×39px | Correct padding, border and leading |
| Padding | **8px 14px** | 8px 12px | Local fallback corrected |
| Border / radius | **0px / 3px** | 1px / 4.8px | Borderless skin and local corner default |
| Light text / fill | **#fff / #262626** | #fff / #202630 | Correct inverted light-theme surface |
| Dark text / fill | **white .82 / #48484e** | #fff / #202630 | Reuse existing matching dark overlay roles |
| Font / line-height | **14px / 22.4px** | 14px / 21px | Shared font-size and line-height roles, defaults 14px/1.6 |
| Light shadow | **0 3px 6px -4px black .12; 0 6px 16px black .08; 0 9px 28px 8px black .05** | Single 0 4px 16px black .133 | Correct three-layer endpoint |
| Dark shadow | **0 3px 6px -4px black .24; 0 6px 12px black .16; 0 9px 18px 8px black .10** | Same single light shadow | Reuse base dark shadow |
| Authored white surface | **#fff fill / #333639 text**, 12px 18px padding, 7px radius; **129.296875×46.390625px** | Inherited overrides ignored; old default 119.296875×39px | Remove public-variable default assignments from Tooltip |
| Strong text | **124.609375×38.390625px** | Ordinary skin metrics differed | Preserve authored strong markup and corrected surrounding skin |
| Shared typography override | **18px / 36px**, **147.953125×52px** | Tooltip fixed its rem size and 1.5 leading | Consume `--mui-font-size` and `--mui-line-height`; matches common reference theme overrides |

Only `src/components/tooltip/tooltip.css` changes implementation. The Tooltip controller,
Popover base/guard, shared positioning/semantics helpers and other consumer sources are
unchanged. Four focused style regressions were added to the Tooltip test file.

## Theme ownership and composed ordering

The accepted Popover guard intentionally excludes `.mui-tooltip`; the new Tooltip skin
does not depend on ordinary Popover's corrected surface rule applying to it. Instead it
consumes public family overrides first, then the composed base's matching private dark
overlay variables, then Tooltip's light defaults.

This is a genuine role match: the pinned Tooltip dark theme uses `popoverColor`,
`textColor2` and `boxShadow2`. Those are the same dark roles already represented by the
base. No shared preset, base declaration or duplicate dark-theme state was introduced.
The internal variables are not exported as new author APIs.

The old assignments of `--mui-popover-padding`, color/background/radius/max-width on
every Tooltip panel masked ancestor values. Removing those assignments fixes an actual
rendered cascade defect: the private fixture's paired white-surface overrides now work in
both themes and every stylesheet order. Inline panel values also win and survive teardown.

`.mui-popover.mui-tooltip` and the non-raw geometry selector outrank the generic base.
Print overrides use matching specificity, so a later separate base stylesheet cannot
restore clipping, limited width or a dark shadow during print. Raw panels are deliberately
excluded from ordinary padding, radius and shadow declarations.

**Inversion is not a new feature.** The pinned source and actual `NTooltip.props` both
confirm that there is no `inverted` Tooltip prop. Its light default is already dark.
The alternate light-surface case uses real upstream theme overrides versus public native
foreground/background tokens, not a fabricated inversion flag.

## Native state and accessibility checks

- Native focus opened the description **without moving focus**. Existing
  `aria-describedby="existing panel"` remained; no `aria-expanded` or `aria-controls`
  appeared on the trigger.
- Escape closed while focus stayed on the trigger. Fresh pointer reentry reopened it.
  Tab reached the next native button and the Tooltip closed after departure; the panel
  did not become a keyboard stop.
- A native submit trigger submitted its enclosing form **exactly once**. No click or
  Enter/Space handler was added by this CSS-only change.
- A nested explicit light scope inside dark reset the surface to **#262626**.
  Per-panel foreground **rgb(1,2,3)** remained authoritative.
- Disconnect removed only the owned description token, leaving `existing`, and preserved
  the authored color variable.
- An ancestor max-width override produced an actual **180px** panel while retaining
  `overflow:clip` and no tabindex. Disabling the helper closed the panel without disabling
  the trigger or removing its description association.
- Forced colors produced **CanvasText on Canvas**, no shadow and a **1px outline**.
  The outline is visual chrome, not a focusable element or scroll container.
- Closed print content was **static/block**, black on transparent, with visible overflow,
  no width cap and no shadow, including reversed base order.

## Validation and budgets

- `pnpm test -- tests\tooltip.test.ts tests\popover.test.ts`: **103 tests passed**
  (46 Tooltip, 57 Popover), including all existing semantics/lifecycle cases.
- Isolated production-equivalent builds: ESM **4882/5000**, classic **4953/5000 gzip bytes**,
  unchanged. Complete composed CSS **1210/1250 gzip bytes**; previously **1136** with the
  newly accepted Popover base.
- No ceiling was relaxed. No shared file, generated adapter, index, demo or binding file
  was edited. Parent owns final full build, commit and publishing.

## Retained differences and limits

1. Native Tooltip remains **hover plus keyboard focus**, descriptive-only and noninteractive.
   It does not expose inherited source click/manual-only modes or interactive body slots.
   Essential help remains visible outside the Tooltip.
2. The native indicator stays an **opt-in inset currentColor triangle**, nominal .45rem
   and 55% opacity, clipped safely and suppressed after collision shifting. Reference
   defaults to an external, opaque surface-colored arrow: an 8.46875px square before
   rotation/clipping. Exact external tethering and arrow-center placement are not claimed.
3. Native gap remains **8px**, versus reference 10px with arrow / 6px without.
   Shared anchor/fallback, conservative flip/clamp and subpixel rounding are unchanged.
4. Raw mode retains the native contract: no padding/radius/shadow but an opaque skin.
   Reference raw is transparent and retains its theme shadow. The raw content dimensions
   are **93.296875×22.390625px** after corrected leading, but full raw paint parity is not claimed.
5. Native **20rem maximum width and overflow clipping** remain intentional for short,
   noninteractive descriptions. Long content, custom scrollbars and exact source
   overflow behavior are outside this contract.
6. Native animation is still opt-in 100ms opacity-only. Reference opacity/scale entry/exit
   and surface transitions are not added; no leave scheduler or shared helper was changed.
7. CSS cannot demote an open manual popover from the native top layer for printing.
   Close it before printing when normal-flow positioning matters.
8. Chromium evidence is not all-browser, screen-reader speech, physical touch/pinch or
   application-specific contrast certification. Pair custom foreground and background.

The coordinator's isolated release `pnpm build` and all **103 Tooltip/Popover tests**
passed. Final composed CSS remains **1,210/1,250 gzip bytes**, with unchanged
ESM/classic budgets. Unfinished unrelated work is excluded; integration is complete.

The subsequent shared Popconfirm guard change reduces composed Tooltip CSS to **1,202
gzip bytes**. Its skin is still excluded from ordinary Popover surface defaults; all
46 Tooltip tests passed within the **233-test** popup-family integration batch.
