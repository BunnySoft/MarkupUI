# Menu visual-default audit

Date: 2026-09-10. Scope: Menu-owned external CSS and focused tests/documentation.
The native navigation/controller contract remains unchanged.

**Coordinated integration complete:** the isolated release build and all **40 Menu
tests** passed. CSS remains **1,246/1,250 gzip bytes**. The coordinator also checked
emitted CSS in Chromium: self-inert links/summaries and rows under nested inert branches
had **.45 opacity**, while inert containers, live siblings and unrelated controls stayed
at **1**. Shared controller/keyboard/ownership code is unchanged.

## Dependency boundary

Reported before edits:

| Existing dependency | Retained use |
| --- | --- |
| `src/components/dropdown/keyboard.ts` | `createMenuKeyboard`, `menuEntryAvailable`, nonroving native navigation |
| `src/components/popover/position.ts` | `ownedWrites`, ownership-safe attribute restoration only |

No Menu controller code, Dropdown source, keyboard/floating helper, shared stylesheet or
generated adapter was edited. No shared change was required. Both existing primitives
remain bundled into the standalone Menu outputs; no popup engine is introduced.

## Actually rendered reference

- Naive UI source `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- `naive-ui@2.45.3`, `vue@3.5.30`, real `NMenu` under explicit light/default and dark
  providers. Menu theme, item/group CSS and padding/icon calculations were inspected.
- Chromium private contexts, 900×3200 viewport, device scale 1, 240px vertical menus,
  640px horizontal menus and a 260px overflow case.
- Twelve cases per theme: icon-rich/plain selected/disabled rows, expanded/deep branches,
  root/nested groups, horizontal root/branch, narrow horizontal overflow, collapsed,
  inverted, compact native presentation and custom root/branch indentation.
- Compact reference uses an explicit 34px item-height/24px-indent override; it is not
  presented as an upstream compact prop.
- Session `files/menu-style-audit` contains fixtures, CSS snapshots, production-named
  isolated bundles, raw measurements and screenshots.

Native fixtures use the real Menu controller, native buttons/details, original authored
SVGs and explicit text/key metadata. No option-tree renderer is added to the package.

## Corrections and measured geometry

| Measurement | Before | Reference / corrected native |
| --- | ---: | ---: |
| Three-row vertical height | 127.708px | 150px |
| Leaf row height | 36.792px | 42px |
| First row top | 8.667px | 6px |
| Plain root label start | 18.26px | 32px |
| Root icon-label start | 43.854px | 64px |
| Deep selected leaf start | 58.26px | 96px |
| Root group icon-label start | 43.854px | 80px |
| Group menu height | 210.344px | 247px |
| Compact recipe height | 108.521px | 126px |
| Flat horizontal height | 54.125px | 42px |
| Disabled opacity | `.55` | `.45` |
| Selected weight | 700 | 400 in the default font context |

Removed the unrequested white panel/border. Default root is transparent. A native 8px
inline inset supplies the reference's highlight inset without a generated background
element; control hit/focus boxes are therefore narrower than upstream's outer item boxes.
Default row radius is 3px and vertical row spacing is 6px.

Text is 14px/1.75 on leaves. Icons now have a 24px slot, 20px visible font-sized graphic
and 8px following gap. Native summaries keep a marker and a row-height line box rather
than replacing their disclosure semantics with a framework arrow.

CSS computes 32px root/branch indentation and half-step group indentation from authored
lists. Root group label/children start at 32/48px; a nested group under the first branch
starts at 48/64px; ordinary nested levels start at 64/96px. Group labels are 36px high
at `.93em`, and dividers use the reference's 6px vertical/18px outer-edge spacing.

The native control can wrap and grow beyond its minimum height. No JS measurement,
depth-attribute writer, string splitter or clipped invisible focus target is introduced.

## Palette/state checks

| Role | Corrected light | Corrected dark |
| --- | --- | --- |
| Normal text | `#333639` | white `.82` |
| Normal icon | `#1f2225` | white `.9` |
| Group/extra text | `#767c82` | white `.52` |
| Selected text/icon | `#18a058` | `#63e2b7` |
| Selected fill | matching green at approximately `.1` | matching green at approximately `.15` |
| Vertical hover fill | `#f3f3f5` | white `.09` |
| Horizontal hover text/icon | `#36ad6a` | `#7fe7c4` |

Real pointer checks verified normal/selected hover in both modes and themes. Selected
hover retains its selected fill/color; horizontal rows have no fill. Alpha colors use
compact 8-bit CSS notation. Local `color-scheme`/`light-dark()` styles only this navigation;
shared native keyboard/visibility behavior is not reimplemented.

Plain vertical screenshots (240×150) had **zero differing pixels** in light and dark.
Icon-rich, grouped and compact comparisons each retained **154 differing pixels**, caused
by the extra-label representation: native `.25em` spacing versus an upstream inserted
space. Horizontal third-item x differed by about **0.323px** for the same reason.
No blanket pixel-parity claim is made.

## Explicit native limitations

- **Selection:** the selected leaf is colored; upstream active-path ancestor tint is not
  inferred. Native aria-current remains author route state and retains its underline.
- **Branches:** native markers stay at logical start instead of an end-aligned generated
  chevron. Their text baseline/line box can differ slightly from upstream's grid row.
- **Horizontal branches:** expanded content remains in flow. The example is 140px high
  versus upstream's 42px bar with popup children; its native branch header is 44px with
  the retained line-box/border combination. There is no floating submenu implementation.
- **Overflow:** the 260px native example wraps all labels into 126px of content. Upstream's
  same bar remains 42px and clips/shrinks labels. No automatic “more” packing is claimed.
- **Collapse:** upstream retains icon rows with 24px collapsed icons and hidden labels;
  native collapse closes the real list and leaves one named summary (54px overall in
  this fixture). It is not an icon rail, tooltip or collapsed-popup renderer.
- **Inverted:** `.mui-menu--inverted` is now an explicit dark-palette native skin on
  `#202630`, not Naive UI's distinct inverted text/solid-selection palette.
- **Hit areas:** normal native rows begin 8px inside the root; upstream's decorative
  inset belongs to a full-width clickable row.
- **Author geometry:** changing outer padding changes the indent coordinate system.
  At default padding, root text start is 32px; generally it is authored inline padding
  plus `root-indent - 8px`. Explicit root widths should use authored border-box sizing.
- **Icon overrides:** an explicit icon-size token sizes both native slot and graphic,
  rather than reserving an upstream collapsed-icon maximum.

These boundaries retain useful native navigation without importing the omitted renderer,
hover popup, icon rail, active-path projection or overflow model.

## Real keyboard, ownership and author verification

- Down moved Alpha→Beta, the next Down wrapped past disabled back to Alpha; typeahead
  selected Beta. Enter/Space produced two native clicks and two selection notifications.
- Tab advanced Alpha→Beta then left that menu, skipping disabled. No tabindex attributes
  or menuitem/menubar roles were written.
- Forward entered Guide→Installation, then Advanced→Performance; Escape returned to
  Advanced and backward closed/returned to Guide.
- Horizontal Right in LTR and Left in RTL both moved Alpha→Beta.
- Overall summary Down opened its list and entered Alpha; programmatic collapse repaired
  focus to that summary. `showOption` opened a collapsed list while preserving outside focus.
- Native href Enter navigation changed the hash and selected the leaf without rewriting
  author aria-current. The controller/keyboard code was unchanged.
- Inert rows dim both when inert themselves and beneath inert branches. Parent review
  corrected a selector that missed self-inert links/summaries and also affected unrelated
  disabled buttons. The disabled/inert rule is now nested inside the existing item/summary
  row rule, not applied to whole containers.
- Author font 18px, 50px rows, 24px root indent, 28px icons and independent normal/hover/
  selected background colors were honored; original nodes remained.
- Later legacy CSS changed none of the captured normal fields. At 360/280px viewports,
  document width stayed within the viewport and all overflow-menu labels remained visible.
- Print switches this menu to a light scheme, keeps group labels readable and renders
  rows/icons in black with transparent fills. Forced colors retained system text/selection
  indication. Scrolling is instant; no animation is supplied.

## Validation and budgets

| Asset | Isolated gzip bytes | Unchanged ceiling |
| --- | ---: | ---: |
| Menu ESM | 5,815 | 6,000 |
| Menu classic | 5,883 | 6,000 |
| Menu CSS (direct gzip check after self-inert correction) | 1,246 | 1,250 |

- `pnpm test -- tests\menu.test.ts`: **40 tests passed**.
- CSS is compact to preserve the hard ceiling, with **4 bytes spare**. A focused
  gzip regression guards the source-copy distribution. No budget was relaxed.
- Modern CSS nesting, `light-dark()` and structural selectors are required for the
  enhanced appearance; no runtime polyfill was introduced. Native HTML remains the
  fallback, not an older-engine visual-parity promise.
- Full builds/releases remain coordinator-owned. No shared, generated, index, root-demo
  or commit/push operation was performed by this audit.
- Chromium only; no all-browser, speech, arbitrary-widget or universal native-slot
  certification. See [Menu](../../components/menu.md) for retained state/lifecycle contracts.

### Parent-review correction: self-inert rows

The isolated `files/menu-inert-correction` fixture/evidence tests self-inert anchors,
self-inert summaries, two nested inert branches, and a leaf that is both self- and
ancestor-inert. Both themes measured row opacity/effective opacity **.45**, with
**not-allowed** cursor. Before the correction, self-inert rows were opacity 1.

All details/container elements, unrelated disabled/inert buttons, and live sibling rows
remained opacity **1**. Native focus calls and real pointer clicks on six inert rows were
blocked, with no navigation or disclosure toggle. Tab skipped the inert rows while
reaching the live child of a self-inert summary, the next live row and the outside control.
Enter/Space activated that live child once each. Current-source tests also verify that the
unchanged availability/selection helper rejects self-inert and inherited-inert targets.

This correction changed no controller/shared helper and ran no build or commit. CSS size
was measured directly with the existing gzip method; prior JS bundle measurements above
were not rebuilt.
