# Popconfirm default-style audit

**2026-09-10 — shared surface and local layout integrated;
native paint/artwork and authored-title boundaries remain explicit.**
No controller/state implementation, generated output, full build, commit or push was
performed by this component task.

## Reference, shared approval and private fixture

- Official reference: <https://www.naiveui.com/en-US/os-theme/components/popconfirm>.
- Naive UI **2.45.3**, source commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; Vue **3.5.30**.
  Inspected Popconfirm, PopconfirmPanel, theme variables and body/icon/action CSS.
- Source Popconfirm passes its **unchanged Popover peer theme** to NPopover. A private
  candidate removing only `.mui-popconfirm` from the accepted surface exclusion passed
  **12 exact light/dark checks** for padding, border width, radius, text, fill and shadow.
  That proposal was reported before any base edit.
- The **parent** then applied the base selector, guard tests and Popover documentation
  updates. This task did not edit those four shared files. Subsequent tests/rendering
  consume the actual approved main-worktree base, not a substituted candidate.
- Private fixture:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\popconfirm-audit`.
  Run `node build.mjs`, then `node server.mjs`; dedicated port **4201**.
  Existing reference dependencies and esbuild remain outside production dependencies.
- `/reference.html` uses actual NPopconfirm/NConfigProvider/NGlobalStyle, default icon
  and localized Cancel/Confirm controls. `/markup.html` uses authored native dialog,
  description, decisions and required status regions. `dark`, `no-icon`, `case=rich`,
  `case=title`, `before` and `inline-icon` select comparison cases.
- `before.css` reconstructs the pre-audit Popover and Popconfirm sources from **d1837d5**.
  Use `?before&inline-icon` for the original inline-icon anatomy. The aligned after case
  deliberately uses an **authored** `[data-popconfirm-body]` wrapper; no runtime wrapping
  is implied or hidden in the measurement.
- The fixture generates theme CSS using the existing canonical preset generator, solely
  into its private directory. This supplies genuine shared warning/error colors for
  light/dark checks without inventing another palette.
- Chromium **151.0.7922.174**, Windows, **1000×800 CSS pixels**, DPR 1; fresh private
  contexts, closed after each investigation. The trigger is **(400,320), 120×32px**.
  Native `placement:top, gap:10` aligns the comparison with the reference; native API
  defaults remain bottom/8px. Reference transitions settle for 220–300ms before readings.

`measure.js` records surface/body/icon/action/button geometry and paint. Reference,
original, proposed-surface and final light/dark screenshots, plus authored-title screenshots,
remain beside the fixture. They show both the corrected layout and the **remaining
browser-native button appearance**, not a claim of whole-image pixel identity.

## Measured corrections

**224 comparisons passed** across plain/strong descriptions × icon shown/hidden × light/dark:
panel size and surface values, body/action sizes and text metrics, individual button
sizes/font family/font size, and visible icon size/color/spacing. Button paint, leading and authored-title styles
were recorded separately rather than counted as matches.

| Case | Reference / native after | Native before | Correction |
| --- | --- | --- | --- |
| Default icon confirmation | **195.625×74.390625px** | 201.625×114.78125px with inline icon | Approved shared surface plus authored aligned row and local spacing |
| No-icon confirmation | **166.40625×74.390625px** | Old padding/margins/control metrics | Hidden icon removes its geometry; actions set the intrinsic width |
| Surface padding / radius / border | **8px 14px / 3px / 0px** | 16px / 8px / 1px | Parent-approved Popover surface reuse |
| Light text / fill | **#333639 / #fff** | #18202c / #fff | Shared Popover roles, no local copy |
| Dark text / fill | **white .82 / #48484e** | #18202c / #fff | Shared Popover dark roles |
| Shadow | **Pinned three-layer light/dark overlay shadows** | Single 0 4px 16px black .133 | Shared Popover shadow |
| Body row | **167.625×22.390625px** in default case | Inline icon content height 28.390625px, 8px paragraph margins | Optional centered flex wrapper; description itself stays normal block/inline flow |
| Icon | **22×22px**, 8px inline-end spacing | Inline host 22×19px, inherited 14px type | 22px icon type/line box with non-hidden inline-flex rendering |
| Icon color | **#f0a020 light / #f2c97d dark** | #8a4b00 in both themes | Shared warning role behind author override |
| Body/action gap | **8px** | 16px | Local action margin corrected |
| Cancel / Confirm boxes | **60.90625×28 / 69.5×28px** | 56.90625×28.390625 / 65.5×28.390625px | Native minimum height and padding corrected |
| Native button leading | **22.4px** with 14px text | 22.4px | Inheritance retained for safe wrapping; reference uses 14px leading |
| Error feedback | Shared error color, **#d03050** observed in light mode | #a51f2b | Semantic error role; this status region is a native safety adaptation |

Native controls have 8px horizontal padding plus their browser border, rather than
Naive Button's 10px padding and overlay border. Their outer boxes and font family/size match
in the recorded Chromium setup without copying a Button palette.

Existing inline-icon markup remains supported: its after panel measured
**195.625×80.390625px**. It does not receive invisible DOM restructuring to claim the
aligned-row height. The canonical documentation shows the optional wrapper explicitly.

## Palette ownership and local implementation

Only `src/components/popconfirm/popconfirm.css` changes component implementation.
The palette is **not duplicated**: surface geometry/text/background/shadow come from the
parent-approved base rule. The local file declares no surface fill, shadow or radius.
Icon/error roles use existing `--mui-color-warning` and `--mui-color-error`, with existing
component overrides taking precedence. Full dark semantic values require the shared
theme stylesheet or theme application, not merely an unthemed local color guess.

The old per-panel `--mui-popover-max-width:26rem` default masked ancestor values.
The local skin now consumes that public token with a 26rem fallback and the existing
available-width constraint. Print resets the higher-specificity max width.

The optional body wrapper is passive author markup, not a new renderer/template API.
Description content is **not** turned into a flex container: inline text and strong/link
markup keep their whitespace and flow. Body, icon and action display rules exclude hidden
elements. Native buttons retain their paint and semantics; minimum height, not fixed height,
permits longer labels to wrap.

The canonical local CSS uses the existing esbuild whitespace-only normalization to fit
the unchanged composed ceiling. There is no shared build modification or budget increase.
Parent-owned base/guard/test/documentation changes remain separate from these local files.

## Confirmation and asynchronous safety

All controller and ownership-state code remains unchanged. Actual Chromium checks confirmed:

- Native opening retained focus on the **Review** invoker; no new autofocus or focus trap.
- Pending positive work set `aria-busy=true`, disabled both decisions and showed the
  authored pending status. A duplicate activation did not add another callback.
- Fulfilled `false` kept the panel open and restored focus to Confirm. An author's
  same-value disabled write on Cancel was preserved rather than undone.
- Rejection kept the panel open, revealed the literal error alert and emitted
  `{ action:"positive", stale:false }`; it did not imply confirmation.
- Escape during one pending attempt followed by reopen/new pending work stayed safe:
  the older fulfilled `true` neither closed the new panel nor unlocked its controls.
- A negative callback returning false kept the panel open.
- Accepted work closed the current panel without stealing focus from an unrelated
  **outside** button selected before resolution.
- An enclosing native form recorded **zero submissions** across those decision actions.

These are local Promise simulations, not real requests or destructive operations.
The pre-existing task-delayed admission, foreign-write tracking, cancellation/epoch checks,
error reporting and fallback behavior were not weakened to match upstream visuals.

Additional browser checks observed an inherited **180px** max-width and authored icon color
**rgb(1,2,3)**, hidden body/icon/action wrappers all staying `display:none`, logical 8px icon
spacing under RTL, CanvasText/no-shadow forced colors and static/block unrestricted-width
closed print content. At **320×640**, a long positive label expanded its button to about
**276×48.79px**; client/scroll heights both measured **45px**, without clipped text.

## Validation and payloads

- `pnpm test -- tests\popconfirm.test.ts`: **45 tests passed**, including all 40 existing
  native/state cases, four style regressions and one authored-wrapper/node-identity check.
- Isolated production-equivalent ESM/classic: **6250/6500** and **6323/6500 gzip bytes**,
  unchanged. Complete composed CSS: **1247/1250 gzip bytes** with actual checkout line
  endings and the approved **955-byte** base. There are only **3 bytes of CSS headroom**.
- Scoped whitespace validation passed. Parent owns the final combined build, commit and
  publication. No local full build, generated-adapter edit, commit or push was performed.

## Explicit remaining differences

1. Native action **paint** remains browser-owned. In the fixture both native buttons used
   light ButtonFace `rgb(240,240,240)` or dark `rgb(107,107,107)`, native 2px borders and
   square corners. Reference Confirm uses green `#18a058` / mint `#63e2b7`, and reference
   buttons have 3px corners, overlay borders and tighter leading. Native inherited leading
   is deliberately retained so wrapped labels do not overflow. No Button dependency, wave or loading
   renderer was introduced; authors can style their native controls explicitly.
2. The warning SVG is authored fixture artwork, not copied/injected upstream artwork.
   Box size, color and spacing match; exact glyph rasterization is not claimed. Icons
   remain optional and decorative, with the textual question carrying meaning.
3. **There is no pinned Popconfirm title prop.** Authored title examples were compared:
   reference native h2 was **21px/33.6px**, with 17.43px block margins; the existing compact
   native Popover h2 remained **15.4px/24.64px**, margin 0 0 8px. That shared heading rule
   was not rewritten here. Titles remain authored and can be styled explicitly.
4. Arbitrary wrappers, long/localized labels, inline icons and application typography can
   alter geometry. The exact comparisons cover the documented aligned row and short
   controls; native wrapping/minimum height is retained for safety.
5. Native 8px default gap, opt-in inset indicator, bounded width/scrolling, native
   dismissal/focus behavior and optional opacity-only animation remain as documented.
   Reference external arrows/transition behavior are not copied.
6. Native pending/error/completion regions and admission locking are stronger retained
   safety behavior, not upstream UI-state parity. Application work is not cancelled by
   UI dismissal. Theme-specific contrast, all browsers, physical touch and screen-reader
   speech require downstream validation.

The coordinator's isolated release `pnpm build` and all **233 popup-family tests**
passed: 45 Popconfirm, 58 Popover, 46 Tooltip, 49 Dropdown and 35 Popselect.
Final composed CSS is **1,247/1,250 gzip bytes**, with the **955-byte Popover base**.
The approved shared guard and local corrections are integrated together; no runtime
controller or ceiling changed.
