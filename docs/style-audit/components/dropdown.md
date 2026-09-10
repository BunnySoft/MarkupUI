# Dropdown default-style audit

**2026-09-11 — normal surfaces, density and retained state colors corrected.**
Renderer-specific icon/suffix columns, native focus outlines and artwork remain explicit
limits. Shared surface and local style corrections are integrated by the coordinator.

## Reference and coordinated scope

- Official reference: <https://www.naiveui.com/en-US/os-theme/components/dropdown>.
- Naive UI **2.45.3**, source commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; Vue **3.5.30**.
  Inspected Dropdown, DropdownMenu/Option/GroupHeader, common/light/dark themes and CSS.
- A private candidate removing only `.mui-dropdown` from the Popover surface exclusion
  passed **10 light/dark checks** for menu fill, border, radius, shadow and option text.
  The proposal was reported before any shared edit. The **parent** applied the base guard,
  tests and Popover prose changes. This task leaves those four files untouched.
- All final rendering uses the **actual approved base**, not a private substitution.
  Normal Dropdown surface roles genuinely match Popover. Menu density, state colors and
  inverted appearance remain local; no broad palette or positioning helper was copied.
- Only Dropdown CSS, its tests, canonical documentation and this report are owned here.
  `dropdown.ts` and the shared keyboard primitive are unchanged.

## Private reproduction and evidence

Fixture:
`C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\dropdown-audit`.

Run `node build.mjs`, then `node server.mjs`; dedicated port **4202**.
Existing dependencies stay outside the repository. Builds are component-only,
production-equivalent esbuild outputs in the fixture, not a full repository build.
`before.css` reconstructs both CSS layers from **3724495**.

- `/reference.html` renders NDropdown with actual options.
- `/markup.html` renders authored native lists and the existing controller.
- Options: `size=small|medium|large|huge`, `dark`, `inverted`, `value=preview|locked`,
  `case=complex|icons`, plus native `before`, `rest`, `reverse` and `rtl`.
- `rest` returns native focus to the trigger for resting-paint comparisons. Native
  opening still normally focuses the first enabled menuitem; that behavior was not removed.
- Chromium **151.0.7922.174**, Windows, requested viewport **1000×800**, DPR approximately
  1, visual viewport scale 1. All work used fresh private contexts, closed afterward.
  Native `gap:6` matches the reference no-arrow spacing for comparison; API default remains 8px.
- `measure.js` records sizes, typography, opacity and paint. A one-pixel canvas normalizes
  equivalent CSS `rgba()` / `color-mix()` output to RGBA samples; it is not a screenshot
  similarity threshold. Geometry comparisons allow .02px for renderer quantization.
- Reference/native before/after, complex, inverted and authored-icon screenshots remain
  beside the fixture and were visually inspected. No whole-image pixel-identity claim.

**280 comparisons passed:** four sizes across normal/inverted light/dark themes; resting,
hover, selected and disabled-selected paint; group label metrics and divider colors.
Menu size, item height/font and state-paint width were compared for the plain three-row
fixture. Complex-menu widths and artwork columns were recorded as limits, not counted as matches.

## Measured fixes

| Case | Reference / native after | Native before | Correction |
| --- | --- | --- | --- |
| Medium three-row menu | **77.5729×110px** | About 87.6771×130.8854px | 4px 0 menu padding, 34px rows, 14px type |
| Small / medium / large / huge height | **92 / 110 / 128 / 146px** | Old rem padding/font scaling | Minimum row heights 28/34/40/46px |
| Row font / line-height | **14/28, 14/34, 15/40, 16/46px** | Medium 16/25.6px plus padding | Correct local size presets |
| Surface | **3px radius, no border, pinned light/dark shadow** | 8px radius, border, single shadow | Parent-approved Popover reuse |
| Normal light / dark surface | **#fff / #48484e** | #fff in both | Shared surface role |
| Normal light / dark text | **#333639 / white .82** | #18202c in both | Shared text role |
| Hover/focus fill | **#f3f3f5 / white .09** | #e8edf6 in both | Local state role |
| Selected fill/text | **Primary at .10/.15 alpha; primary text** | #dce8ff and weight 600 | Shared semantic primary plus proper alpha; no synthetic bold weight |
| Disabled-selected | **No selected fill; .5/.38 opacity** | Selected fill/bold still applied; .5 both modes | Restrict active styling to enabled controls |
| Inverted light / dark surface | **#001428 / #48484e** | #202630 | Local inverted fallback plus matching base dark surface |
| Inverted rest / active text | **#bbb / #fff** | #fff throughout | Correct state text |
| Inverted hover/active fill | **#18a058 / #2a947d** | #3b4556 / #365685 | Primary / supplementary-primary roles |
| Group labels | **13px / 34px**, normal #767c82 or white .52; inverted #aaa | Smaller bold inherited-color labels | Correct size, leading and muted colors |
| Divider | **1px, margin 4px 0; #efeff5 or white .09** | Border-color divider with .3rem margins | Measured divider behavior, including inverted mode |

The pinned theme declares an inverted divider token, but the rendered reference uses the
normal light/dark divider colors in inverted menus too. The implementation follows that
rendered evidence, not the unused-token guess.

## Native representation and theme ownership

Native buttons/anchors are the visible inset controls: 4px outer margins and adjusted
padding put text at the same default leading/trailing positions. Their boxes are 8px
narrower than Naive's full-width option bodies, matching Naive's inset state-paint bounds.
This preserves native activation and avoids a new interactive paint wrapper.

Labels use normal block/inline text flow, not flex-split anonymous label fragments.
Minimum heights allow wrapping. Public `--mui-dropdown-item-padding`,
`--mui-dropdown-font-size`, `--mui-dropdown-hover`, `--mui-dropdown-selected`, and
Popover palette/corner/border overrides continue to work from ancestors. Size/inversion
defaults are private and do not mask public variables.

Normal surfaces reuse the released base. Inverted dark fill reuses the same base variable.
State hues use existing primary roles; dark inverted supplementary-primary has a narrow
fallback rather than changing shared presets. The local color-scheme and modern CSS color
functions handle light/dark state variants. No global palette, Menu CSS or helper changed.

The canonical local stylesheet uses existing esbuild whitespace-only normalization to
meet the composed ceiling. No safety/ownership logic or keyboard feature was removed for size.

## Interaction and integration checks

- First entry remained **Edit**; ArrowDown skipped disabled Locked and reached **Print**.
  End reached More; logical forward opened its submenu and focused Rename.
- Escape closed the child and restored More. Typeahead `p` found Preview; Enter emitted
  exactly one Preview selection and closed the menu.
- Tab reached an outside native button and closed the root without a trap.
- RTL logical forward used **ArrowLeft**. Item padding mirrored to 0 10px 0 12px and
  group leading padding moved to the right.
- Dark inverted submenus inherited the **#48484e** surface. A later separate Popover
  stylesheet did not undo the skin.
- Authored ancestor padding **7px**, font **18px** and hover **rgb(1,2,3)** were observed
  in an open submenu.
- Forced colors retained a visible 2px Highlight outline. Closed print content was block,
  black on transparent. Hidden/inert, native activation, reentrancy and ownership cases
  remain covered by the existing controller tests.

## Validation and budgets

- `pnpm test -- tests\dropdown.test.ts`: **53 passed**, including all 49 existing keyboard/
  lifecycle cases and four focused style regressions.
- Isolated ESM/classic: **8767/9000** and **8840/9000 gzip bytes**, unchanged.
- Complete CSS: **1744/1750 gzip bytes**, including the actual **947-byte** approved base.
  Only **6 bytes** of stylesheet headroom remain. No ceiling was raised.
- Parent owns combined integration, shared-file staging, full build and publication.

## Remaining limits

1. **Authored columns/artwork:** no renderer-generated icon placeholders or sibling-wide
   submenu-arrow column is added. The complex group/submenu example has matching **255px**
   height, but native width **77.5729px** versus reference **93.5729px**. An authored-icon
   example has matching 16px artwork/color, but native width **77.5729px** versus reference
   **99.5729px**. Authors retain their icons/suffixes and can supply deliberate spacing.
2. **Hit boxes/focus:** native actions themselves are inset, while Naive's wrapper remains
   full-width. Native focus-visible outlines remain; they are not hidden for screenshot parity.
3. **Value ancestry:** the existing value marker selects a leaf. Reference ancestor
   child-active text coloring is not synthesized. No new tree-state or option renderer API.
4. **Motion/placement:** native submenu intent, conservative anchor/fallback placement,
   default gap, clipping bounds and optional opacity entrance remain; source scale/leave
   transitions, safe-area pointer routing and virtual anchors are not copied.
5. **Theme/browser scope:** semantic dark colors require the existing shared theme tokens.
   `light-dark()`, `color-mix()` and logical selectors target the tested modern engine;
   author color overrides can replace state fills. No all-browser, physical-touch or
   screen-reader speech certification is claimed.
6. Close an open native top-layer menu before printing when in-flow positioning matters.
   Longer labels, custom typography and arbitrary artwork remain application acceptance concerns.

The coordinator's isolated release build and all **237 popup-family tests** passed:
53 Dropdown, 58 Popover, 46 Tooltip, 45 Popconfirm and 35 Popselect. Final composed
Dropdown CSS is **1,744/1,750 gzip bytes**, including the **947-byte shared base**.
Controller and shared runtime are unchanged; the source-renderer limits above remain.
