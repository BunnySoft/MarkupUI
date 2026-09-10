# Popover default-style audit

**2026-09-10 — standalone surface fixed; native placement/arrow/motion boundaries remain.**
Integrated by the coordinator. No shared palette or floating-helper modification was made.

## Reference and isolated fixture

- Official reference: <https://www.naiveui.com/en-US/os-theme/components/popover>.
- Naive UI **2.45.3**, source commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; Vue **3.5.30**.
  Inspected Popover/PopoverBody, common/light/dark theme values and arrow/placement CSS.
- Private fixture:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\popover-audit`.
  Existing Naive/Vue dependencies are resolved outside the repository. No install,
  production dependency or copied upstream asset was introduced.
- In that directory, run `node build.mjs`, then `node server.mjs`; dedicated port **4196**.
  Builds use existing esbuild with production entry names/options, in the private fixture,
  not the repository distribution. `before.css` is reconstructed from **5a189fd**.
- `/reference.html` renders NPopover under NConfigProvider/NGlobalStyle.
  `/markup.html` renders a native Popover with its existing helper.
  Query options: `open`, `dark`, `placement=top-start` (all twelve placements),
  `trigger=click|hover|focus|manual`, `case=raw|regions|long|scroll`.
  Markup additionally accepts `before`, `fallback`, `gap=10`, `arrow`, `animated`
  and `derived=tooltip|popconfirm|dropdown|popselect`.
  `/no-script.html` is a static authored native click example.
- Chromium **151.0.7922.174**, Windows, **1000×800 CSS pixels**, DPR 1.
  A fresh private browser context was used and closed for every investigation.
  Trigger rect **(400,320), 120×32px**, identical `Popover content` text and system fonts.
  Upstream entrance transitions were allowed 220–450ms to settle before endpoint reads.
- `measure.js` records boxes, typography, paint, overflow and arrow geometry.
  `reference-light.png`, `reference-dark.png`, `markup-light.png`, and
  `markup-dark.png` retain isolated screenshots beside the fixture. Component paint
  was inspected separately from the surrounding page theme.

**528 comparisons passed** across 12 placements × light/dark × native anchor/fallback
paths: seven presentation fields, width/height, and x/y positions. The position tolerance
was **1/64px**, with maximum observed difference **0.0078125px**. Width, height and paint
comparisons were exact. For this placement comparison, native `gap:10` deliberately matches
the reference's default arrow spacing; it does **not** redefine native defaults.

## Measured corrections

| Property/case | Reference / native after | Native before | Scope |
| --- | --- | --- | --- |
| Default content box | **130.015625×38.390625px** | 136.015625×56.390625px | Corrected standalone padding and border geometry |
| Padding | **8px 14px** | 16px all sides | Local default; public padding override wins |
| Border | **No visible or layout-consuming border** | 1px solid #8b929e | Standalone border width now 0; authored color remains available |
| Radius | **3px** | 8px | Local default; public radius override wins |
| Light foreground / surface | **#333639 / #fff** | #18202c / #fff | Foreground corrected |
| Dark foreground / surface | **white .82 / #48484e** | #18202c / #fff | Explicit scoped dark defaults |
| Light shadow | **0 3px 6px -4px black .12; 0 6px 16px black .08; 0 9px 28px 8px black .05** | Single 0 4px 16px black .133 | Three-layer endpoint matches |
| Dark shadow | **0 3px 6px -4px black .24; 0 6px 12px black .16; 0 9px 18px 8px black .10** | Same single light shadow | Separate measured dark geometry and opacity |
| Typeface / size / leading | **System family / 14px / 22.4px** under the common document baseline | Same | Already matched; inheritance retained |
| Top placement with aligned 10px gap | Reference **(394.9921875,271.609375)**; native **(394.984375,271.609375)** | Wider/taller native panel | Native layout rounding remains below 1/64px; helper untouched |

Implementation is confined to canonical `src/components/popover/popover.css`. The native
controller, positioner, exports, trigger defaults, geometry ownership and lifecycle are
unchanged. Four source-style regressions were added to the existing Popover tests.

## Isolation, author overrides and payload constraints

The shared surface uses a low-specificity `:where(:not(...))` guard. It excludes
`.mui-tooltip`. Popselect panels remain in their authored boundary, including in the
top layer, and now share the verified surface too. Popconfirm was
also excluded in the initial audit below; its later comparison verified that it uses
the same Popover theme, so it now shares the corrected surface instead of duplicating it.
Dropdown subsequently verified the same normal surface roles and opted into this base
as well, while retaining its local density/state rules.

Before/after rendered consumer checks cover light/dark surface geometry, padding, border,
radius, color, background, font, line-height, shadow and overflow. The retained inset-arrow
polygons were additionally checked on all four sides; their computed geometry, opacity
and color remained unchanged in the protected Tooltip skin.

The generic shared palette is not a matching Popover palette. No shared role or preset was
added. Private defaults reset at explicit light boundaries and apply the dark palette only
on screen. Public `--mui-popover-padding`, `--mui-popover-radius`, `--mui-popover-color`,
`--mui-popover-background`, border color and max-width remain author-owned. Inline or
ordinary author CSS can still customize shadows and typography. No public override
variable is assigned a default on the component.

Observed author overrides included inherited foreground **rgb(1,2,3)** and per-panel
background **rgb(4,5,6)**, padding **12px 20px** and radius **9px**. Native focus transfer
into an authored input remained open; Escape closed click/hover/focus panels. No role or
focus trap appeared, and disconnect removed owned positioning metadata.

The canonical CSS uses compact, standards-equivalent formatting to respect both its own
ceiling and the tighter composed Popconfirm ceiling. Redundant native block-display and
Popover fixed-position defaults were removed; the browser still supplies native fixed
positioning. The bottom inset-arrow offsets are shared rather than repeated, while other
sides retain their existing geometry. Important print insets are retained. No unrelated
compression, budget relaxation or generated-adapter edit was performed.

## Validation and budgets

- Targeted runner:
  `pnpm test -- tests\popover.test.ts tests\tooltip.test.ts tests\popconfirm.test.ts tests\dropdown.test.ts tests\popselect.test.ts`.
  **223 tests passed**: 57 Popover, 42 Tooltip, 40 Popconfirm, 49 Dropdown, 35 Popselect.
- Isolated production-equivalent Popover ESM/classic: **3927/4000** and **3997/4000 gzip**,
  unchanged. The classic entry has only **3 bytes** headroom.
- Canonical Popover CSS: **961/1000 gzip**. Composed CSS: Tooltip **1136/1250**,
  Popconfirm **1246/1250**, Dropdown **1584/1750**, Popselect **1803/2500**.
  These include the actual source-file line endings and production concatenation order.
  Popconfirm has only **4 bytes** headroom; do not assume cosmetic edits are budget-free.
- Scoped whitespace checks passed. Parent owns full distribution build/integration,
  commit and publishing; no such operation was run by this task.

Additional browser checks retained native click/Enter, hover delay and focus opening,
focus within authored content, Escape closure, disabled/lifecycle unit coverage, author
theme overrides and collision behavior. A bottom-end trigger near the viewport edge
flipped to **top-end**, selected **fallback**, and hid the misleading clamped indicator.
Reduced motion removed the optional entrance animation. Forced colors produced a 1px
CanvasText border with no shadow; print exposed content with dark text on a light surface.
In a JavaScript-disabled private context, the static native click fixture opened normally
and Escape closed it; enhanced placement was not claimed for that fallback.

## Explicit remaining differences

1. **Trigger/placement defaults:** native click, bottom, 8px gap and opt-in indicator remain
   intentional. Reference defaults are hover, top and an external arrow; its body spacing
   is 10px with arrow and 6px without. Authors can configure native gaps/placements, but
   the source reference's defaults were not silently substituted into the shared helper.
2. **Arrow:** native is an opt-in, noninteractive **inset** triangle, nominal .45rem
   (**7.1875px measured**) at 55% currentColor. The reference uses a rotated surface-colored
   square (about 11.9766px transformed bounds), externally clipped to a 6px arrow.
   Native scroll safety and collision suppression are retained; exact tethering, outside
   arrow paint, arrow-center offsets and pointer behavior are not claimed.
3. **Raw mode:** both text boxes measure **102.015625×22.390625px**, but native raw retains
   its fill and removes shadow; reference raw is transparent and retains its shadow.
   This preserves the documented native raw contract, not upstream raw parity.
4. **Header/footer:** authored native flow is not a slot-wrapper renderer. With simple
   header/body/footer text, reference is **130.015625×117.171875px** with per-region padding
   and dividers; native is **130.015625×95.171875px**, using outer padding and its existing
   footer margin. No DOM wrapping, automatic separators, template or binding API was added.
5. **Width/overflow/type:** the native 24rem max-width and viewport caps are intentional.
   The repeated long-content fixture is **384×329.46875px** natively versus
   **1000×127.953125px** in the reference. Native scrollbars replace custom scrollbars.
   Typography inherits the author document; Naive fixes its component font size, so
   differently styled host documents are not covered by the 14px baseline match.
6. **Motion/positioning:** native animation remains opt-in 100ms opacity .65→1, without
   scale or leave scheduling. Reference uses 150ms opacity/scale .85→1 plus 300ms surface
   transitions. Anchor/fallback rounding, conservative clipping/flip rules, no overlap
   API and no arbitrary virtual anchors remain as documented.
7. **Print:** closed content is exposed in normal flow. An open native top-layer popover
   can still compute as absolute during print despite CSS requesting static positioning;
   close it before printing when in-flow placement is required. No shared print handler
   was added. Screen-only private dark defaults avoid a white-on-white print regression.
8. Chromium evidence is not Safari/Firefox, screen-reader speech or physical-touch/pinch
   certification. Page-background differences outside the panel are not component parity.

The coordinator's isolated release `pnpm build` and all **223 Popover/Tooltip/
Popconfirm/Dropdown/Popselect tests** passed. Final manifest CSS remains
**961/1,136/1,246/1,584/1,803 gzip bytes** respectively, within unchanged ceilings.
Unfinished unrelated work is excluded from the release snapshot; integration is complete.

## Shared surface follow-up: Popconfirm and Dropdown

The later Popconfirm and Dropdown audits verified their Popover peer surface roles before
opting into the same rule. Their exclusions were removed in coordinated releases;
Tooltip and Popselect skin boundaries remain. The isolated release build and **237
popup-family tests** passed after the latest shared/local integration. Current CSS gzip values are
**947 Popover / 1,196 Tooltip / 1,241 Popconfirm / 1,744 Dropdown / 1,791 Popselect**,
all within unchanged ceilings. These supersede the initial integration sizes above.
