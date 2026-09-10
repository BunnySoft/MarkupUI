# Popselect default-style audit

**2026-09-11 — shared region surface and scoped native-field presentation corrected.**
Platform option/group/selection rendering remains intentionally native. Local source is
ready for parent integration; no full build, commit or push was performed here.

## Released dependency and approved shared scope

- Official reference: <https://www.naiveui.com/en-US/os-theme/components/popselect>.
- Naive UI **2.45.3**, pinned source
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; Vue **3.5.30**.
  Read Popselect, PopselectPanel, its Popover/InternalSelectMenu peers and theme roles.
- Select was concurrently owned by another audit. Initial investigation used release
  `3801ef2`; **final acceptance was refreshed to released
  `78d2dda786ac8873812fae514219c68df4bde2d6`** after the parent integrated Select's audit.
  No Select draft was edited or treated as final.
- The fixture's esbuild loader reads Select TypeScript from that git revision, and its
  composed CSS reads Select CSS from the same revision. A private Vitest pre-loader applies
  the same freeze when running Popselect tests. Current Popselect code and the actual
  parent-approved Popover base are used.
- A private proposed base release passed **10 light/dark outer-surface comparisons** before
  any shared edit. The parent then changed the base guard to exclude only Tooltip and
  updated its tests/prose plus the Tooltip assertion. This task did not edit those five
  parent-owned files. Final checks use the actual approved base.
- Only `src/components/popselect/popselect.css`, Popselect tests, canonical documentation
  and this report are owned by this task. No controller, Select source or shared runtime changed.

## Private reproduction

Fixture:
`C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\popselect-audit`.

Run `node build.mjs` and `node server.mjs` there; dedicated port **4203**. The build is
component-only and writes outside the repository distribution. Existing dependencies are
reused; no packages were installed. `before.css` freezes all three old CSS layers at the
released revision.

- `/reference.html`: actual NPopselect/NConfigProvider/NGlobalStyle with selected Alpha,
  an optgroup and disabled Locked.
- `/markup.html`: original native labelled select, named region, Clear, Done and stable
  trigger/readout anatomy. Query `dark`, `size=small|medium|large`, `multiple`, `closed`
  and `before` select the cases.
- `/no-js.html`: static native form/inline-list baseline without enhancement scripts.
- Chromium **152.0.0.0**, Windows, requested **1000×800** CSS viewport and DPR about 1;
  additional **320×640**, forced-color, print and explicit CSS-zoom handoff checks.
  Every investigation used a private context and closed it afterward.
- `measure.js` records outer chrome, native controls/options and actual source menu rows.
  Reference/current/proposed/after light/dark screenshots remain beside the fixture and
  were visually inspected.

**36 final comparisons passed:** five outer-surface values plus CSS field typography for
three sizes in light/dark. This deliberately does **not** count native option heights,
selected checkmarks or overall region size as source-menu parity.

## Measured corrections and retained model

| Case | Native before | Native after / source comparison |
| --- | --- | --- |
| Medium named region, Select 78d2dda | About **160.59×254.73px** before local/shared changes | **147.26×253.40px**; source custom menu is **96.22×144px**, not the same anatomy |
| Outer surface | 16px padding, visible border, 8px radius, single shadow | Approved Popover **8px 14px**, no border, **3px**, exact source light/dark shadow/text/fill |
| Native control medium, Select 78d2dda | **127.26×99.67px**, 14px/21px system-ui, 0 12px padding | **119.26×115.67px**, **14px/21px** inherited family, transparent enabled fill and deliberate 8px consumer frame padding |
| Light text | Released Select already supplies #333639 | **#333639**, also respecting the region's inherited/custom text role |
| Dark text/control | Released Select supplies white .82 and a white .1 control fill | **white .82**, transparent enabled control revealing **#48484e** region; disabled Select paint remains intact |
| Small/medium/large field typography | 14px / 14px / 18px consumer defaults with Select 78d2dda | **14px/21px, 14px/21px, 15px/22.5px**, matching source option CSS font values |
| Size override precedence | Size classes assigned public font/pad defaults on the root | Private fallbacks; inherited author values now win |
| Focus outline | Initial old baseline had a fixed blue fallback | Final acceptance reuses released Select's focus/status colors, including **#7fe7c4** dark focus; no local color override |

The native medium option row measures about **19.67px**, versus the source rendered row
at **34px**. Source small/medium/large rows are 28/34/40px; native list rows remain platform
layout. Optgroup is a native bold group, not a generated muted menu header.

Selected and disabled appearances also remain native: inactive selected Alpha used system
gray backgrounds, while source selected rows use primary-colored text/checkmarks.
Disabled options retain native GrayText and keyboard skipping. No option or optgroup CSS
renderer, selected-row reconstruction, checkmark injection, menu or combobox role was added.

## Theme and ownership design

Normal region paint comes from the parent-approved Popover base. The local layer only
adapts the native Select context: inherited region color/font family, scoped font sizes
and transparent enabled-control background. Released Select owns focus/status and disabled
paint. It contains no copied
Popup shadow or light/dark palette table.

Public `--mui-select-color`, background, font, pad and focus tokens remain first in their
fallback chains. A small-size root with ancestor overrides rendered **20px font, 3px
padding, rgb(1,2,3) text and rgb(220,230,240) background**. Private size defaults do not mask
those author values.
An explicitly large inner Select yields 15px when the Popselect root has no size override;
an explicit small Popselect yields 14px, and public `--mui-select-font:20px` wins over both.
The consumer's 4/8/12px frame-padding choices are retained deliberately rather than
mistaking native listbox density for the reference's rendered option heights.

The original native control, option/optgroup nodes, labels, Clear/Done actions and readout
remain in place. The extra controls and explicit region padding are retained for usability;
they are not removed to force the custom menu's smaller bounding box.
An ordinary wrapper around the Select root also retained readable white-.82 label, control
and Clear text in dark mode. The pre-existing direct-child grid layout rule is unchanged;
only the typography/color context applies through such wrappers.

Trigger and Done geometry remains the prior authored native-button treatment. In this
fixture the stable Choose values trigger measured about **112.5×38.40px** versus the
reference's author-supplied plain button at **104.21×21.33px**. NPopselect does not generate
a default trigger skin or replace its slot label; this is not a component trigger-parity claim.

## Native behavior checks

- Click opened a named **region**, kept focus on the trigger, and introduced no haspopup
  claim. Tab entered the actual select; ArrowDown selected Beta and kept the popup open.
- Done closed, retained Beta, and restored the opener. The readout and FormData reflected
  the real selection.
- Programmatic selection of disabled Locked was silent and remained in value, while
  native FormData excluded it. Reset restored Alpha and the readout.
- Multiple value `[alpha, locked]` serialized only Alpha; programmatic clear produced `[]`
  without closing the popup.
- Disabling the actual select closed/gated the disclosure and removed it from FormData
  without discarding selection.
- Disconnect retained every original option node, removed the added popover attribute and
  restored hidden enhancement controls.
- At **320×640**, the panel remained within the viewport. Dark select focus showed a
  **2px #7fe7c4 outline** after the Select release refresh. Forced colors produced system
  text on Canvas; disabled controls retained the released Select's disabled/system paint.
- Closed print content was static/block and Done was hidden.
- CSS zoom 2 still caused the intentional **error + inline handoff**, preserving Beta.
  The existing unsupported-geometry guard was not removed to improve a screenshot.
- A JavaScript-disabled private context kept native choices visible; Beta serialized
  through FormData while trigger/Done remained hidden and no popover attribute existed.

## Validation and payloads

- Existing Vitest runner with private
  `vitest.config.mjs` frozen-Select loader: **40 Popselect tests passed**, including all
  35 native/form/ownership regressions plus five focused style/budget checks. The ordinary
  current-Select run passed the same 40 tests.
- Isolated runtime with released Select: ESM **26,654 raw / 9,380 gzip / 10,000 ceiling**;
  classic **26,943 raw / 9,507 gzip / 10,000 ceiling**, unchanged.
- Composed CSS with released Select **78d2dda**: **7,384 raw / 2,092 gzip / 2,500 ceiling**;
  approved base **2,540 raw / 939 gzip**, released Select **3,163 raw / 980 gzip**, and the
  Popselect-local layer **1,679 raw / 585 gzip**.
  The git-object Select CSS snapshot uses its released line endings, so its composition
  can differ by a few gzip bytes from a Windows checkout. No ceiling was changed.
- Scoped whitespace checks passed. No full distribution build, generated-adapter edit,
  commit or push was performed. The existing demo required no change. Integration was
  verified against the currently present parent-owned Popover guard and released Select;
  this task did not modify either dependency.

**Blockers: none.**

## Remaining limits

1. Native option/group/selected/disabled rendering is not the custom InternalSelectMenu.
   Row heights, checks, grouping, scrolling and platform selection paint deliberately differ.
2. Labels, Clear, Done and outside readout remain visible/owned according to the native
   contract. Single native navigation does not auto-close after each value change.
3. Final results use released Select **78d2dda**, not the earlier 3801 baseline or an
   in-progress draft. Subsequent dependency changes require a fresh integration pass.
4. No source huge size, renderer callbacks, virtualization, search/combobox/menu engine,
   templates or binding feature was added.
5. Existing native placement, CSS-zoom rejection, popup/inline fallback and CSP boundaries
   remain. Chromium evidence is not universal browser, physical-touch or screen-reader
   speech certification; custom theme contrast remains an application responsibility.

Popselect-local source is complete against the parent-owned shared release and frozen Select baseline.
