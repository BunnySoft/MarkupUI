# Float Button

**Plan: 🟢 Verified for retained native FloatButton/FloatButtonGroup and popover scope; seven explicit alias/theme omissions.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) retains its legacy Button.
The accepted floating actions/groups are native HTML and external CSS, not another button
engine or a dependency on the Button runtime.

- **HTML:** real buttons/links, named groups and native popovertarget/popover commands.
- **JS:** none in the component; optional application action/form/toggle feedback only.
- **CSS:** fixed/relative/absolute logical placement, safe-area-aware dock, shapes and static unsupported-popover fallback.
- **Placement:** [float-button.css](../../../src/components/float-button/float-button.css), stylesheet export and [native demo](../../../demo/components/float-button.html).

## Acceptance and gaps

The [canonical acceptance record](../../components/float-button.md) reports 552 passing tests
(12 FloatButton cases), build/budget gates and Chromium actions/forms/popover dismissal/
reopen/Tab/placement/narrow/short-viewport/RTL/zoom/print/coexistence/no-JS evidence.
CSS is 1,340 gzip bytes and component JS is zero. Fixed-dock geometry, static fallback,
hover-mode exclusion and native asynchronous toggle timing are explicit; global P3,
actual mobile keyboard/notch hardware and all-browser parity are not certified.

## Migration steps

**Delivery phase:** P2 — CSS placement; P3 for group disclosure. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P1 Button and P3 focus ownership for expandable groups in the [master plan](../migration-plan.md).
**Next task:** Image (P2/P6), the only remaining Planned P2-assigned route. Whole P2/P3 are not complete.

1. [x] **Reuse native actions.** Native button/link names, activation, disabled/form semantics and authored description/icon content.
2. [x] **Resolve group anatomy.** Original group order/labels and native popover disclosure; no fake menu arrow-key model.
3. [x] **Implement placement CSS.** Logical fixed/relative/absolute modes, bounded safe-area dock and static fallback without measurements.
4. [x] **Verify obstruction and focus.** Native dismissal/reopen/Tab, form access, narrow/short viewport/RTL/zoom/print verified; no animation or mobile-hardware certification.

### Native primitives and fallback

- **Native path:** real buttons/links and ordinary groups, with relative/absolute/fixed CSS. No sticky preset or hidden button engine.
- **Small enhancement:** native popover commands handle disclosure and dismissal; guarded CSS leaves a visible static action group when unsupported. No controller, anchor-positioning dependency, VDOM/provider or global overlay state.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/float-button)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **20 original local table rows + 9 explicit source-only supplements + 0 inherited rows = 29 tracker rows**.
All original owner/pinned identities remain: **22 Verified ADAPTED targets and 7 Intentionally
omitted entries**. Hover-only opening, controlled/uncontrolled state and synchronous boolean
callback parity are additional exclusions within the adapted native disclosure rows.
The companion source is in the separate
[float-button-group directory](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button-group/src/FloatButtonGroup.tsx).
Source props use width=40, minHeight=40 and no bottom default, despite the public table's
bottom=40/width=undefined entries. Badge/Tooltip demos compose separate components, not props.


### FloatButton Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L24) | Prop | --mui-float-block-end CSS length/auto. | 🟢 Verified ADAPTED target | Source has no bottom default; native dock offsets are explicit, not an automatic 40px placement. |
| [`height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L25) | Prop | --mui-float-height minimum block size, default 2.5rem. | 🟢 Verified ADAPTED target | Source applies minHeight; native descriptions can grow. Fixed popover trigger has a separately explicit shared size. |
| [`left`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L26) | Prop | --mui-float-inline-start CSS length/auto. | 🟢 Verified ADAPTED target | Logical axis, no numeric/style-object parser or forced physical direction. |
| [`menu-trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L27) | Prop | Native click/keyboard popovertarget command. | 🟢 Verified ADAPTED click path | Hover-only opening is excluded; no controller or hover-dependent access. Unsupported engines retain static actions. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L28) | Prop | Fixed default or data-position relative/absolute. | 🟢 Verified ADAPTED target | Native containing-block rules; fixed popover dock is not a universal anchored/transform-aware positioning engine. |
| [`right`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L29) | Prop | --mui-float-inline-end CSS length/auto. | 🟢 Verified ADAPTED target | Logical RTL placement and safe-area clearances checked; no callback measurement. |
| [`shape`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L30) | Prop | Circle default or data-shape square; direct group owns shape when grouped. | 🟢 Verified ADAPTED target | Native action surfaces without provider injection or clipped focus. |
| [`show-menu`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L31) | Prop | Native showPopover/hidePopover/togglePopover and :popover-open state. | 🟢 Verified ADAPTED target | Closed panels remain hidden; no framework controlled/uncontrolled property bridge or native open-attribute fiction. |
| [`top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L32) | Prop | --mui-float-block-start CSS length/auto. | 🟢 Verified ADAPTED target | Native offset/containing-block behavior; no geometry parser. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L33) | Prop | Visual data-type default/primary, separate from native button type. | 🟢 Verified ADAPTED target | Native submit/reset/button semantics remain; no type=primary misuse or generated controls. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L34) | Prop | --mui-float-width CSS length; source-aligned default 2.5rem. | 🟢 Verified ADAPTED target | 40px source default reconciled despite public table undefined; larger authored lengths supported without JS conversion. |
| [`on-update:show-menu`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L35) | Callback | Native panel toggle listener and oldState/newState. | 🟢 Verified ADAPTED notification | Asynchronous/coalescing native timing, not synchronous boolean callback parity or an installed event alias. |

### FloatButtonGroup Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L41) | Prop | Group --mui-float-block-end CSS length/auto. | 🟢 Verified ADAPTED target | Authored group offset; grouped child actions stay relative. |
| [`left`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L42) | Prop | Group --mui-float-inline-start CSS length/auto. | 🟢 Verified ADAPTED target | Logical axis without DOM reversal or measurement. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L43) | Prop | Native fixed/default or data-position relative/absolute. | 🟢 Verified ADAPTED target | Named static form group and contained RTL absolute group checked; group positioning does not reorder children. |
| [`right`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L44) | Prop | Group --mui-float-inline-end CSS length/auto. | 🟢 Verified ADAPTED target | Logical end offset with containing-block constraints. |
| [`shape`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L45) | Prop | Circle/default or data-shape square, authoritative for direct actions. | 🟢 Verified ADAPTED target | Native group surface/separators, hidden/template-safe order and visible focus; not source pixel parity. |
| [`top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L46) | Prop | Group --mui-float-block-start CSS length/auto. | 🟢 Verified ADAPTED target | Native offset value; no source style-object/number forwarding. |

### FloatButton Slots

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L52) | Slot | Authored .mui-float-description inside the native action. | 🟢 Verified ADAPTED target | Visible labels/phrasing content and native names remain; no VNode slot renderer. |
| [`menu`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L53) | Slot | Separate native popover/static group, outside the trigger button. | 🟢 Verified ADAPTED target | Native Tab/Escape/light dismiss/commands, static fallback and preserved nodes; not an ARIA menu or universal anchored popup. |

### Explicit source-only supplements

The two default slots and callback alias/array surface are absent from the public tables.
Each owner's mixed-in theme props is accounted for separately. Tooltip/Badge wrappers in
demos are compositions, not additional FloatButton props or dependencies.

| Source item · identity | Kind | Native disposition | Status | Boundary |
| --- | --- | --- | --- | --- |
| [`FloatButton.default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/src/FloatButton.tsx) | Source-only slot | Native icon/text children of the actual button/link. | 🟢 Verified ADAPTED target | Original SVG namespace/decoration/names; no generated icon or button engine. |
| [`FloatButtonGroup.default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button-group/src/FloatButtonGroup.tsx) | Source-only slot | Ordered native child actions. | 🟢 Verified ADAPTED target | Group semantics, form controls and template/hidden handling remain author-owned. |
| [`onUpdateShowMenu / onUpdate:showMenu array aliases`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/src/FloatButton.tsx) | Source-only callback alias/group | No dual-property/array dispatch bridge. | ⏭️ Intentionally omitted | Native toggle listeners have their own asynchronous/coalescing event contract. |
| [`FloatButton.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/src/FloatButton.tsx) | Source-only mixed-in prop | External CSS only. | ⏭️ Intentionally omitted | No runtime theme/provider object. |
| [`FloatButton.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/src/FloatButton.tsx) | Source-only mixed-in prop | CSS cascade/tokens, not object merging. | ⏭️ Intentionally omitted | No CSS-in-JS/style-object bridge. |
| [`FloatButton.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/src/FloatButton.tsx) | Source-only mixed-in prop | No built-in override object. | ⏭️ Intentionally omitted | Zero runtime dependencies. |
| [`FloatButtonGroup.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button-group/src/FloatButtonGroup.tsx) | Source-only mixed-in prop | External group CSS only. | ⏭️ Intentionally omitted | No injected runtime theme/provider. |
| [`FloatButtonGroup.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button-group/src/FloatButtonGroup.tsx) | Source-only mixed-in prop | Native CSS overrides, not object merging. | ⏭️ Intentionally omitted | Group shape is CSS, not a provider/ref adapter. |
| [`FloatButtonGroup.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button-group/src/FloatButtonGroup.tsx) | Source-only mixed-in prop | No built-in override object. | ⏭️ Intentionally omitted | No animation or custom popup dependency. |

<!-- END PINNED API INVENTORY -->
