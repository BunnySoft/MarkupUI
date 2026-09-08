# Tooltip

**🟢 Verified for the retained native noninteractive description scope.**
The original **36 inherited Popover rows** remain, with their original owner/name/source
identities. Seven explicitly source-only supplements bring this tracker to **43 rows:
21 Verified adapted targets, 22 intentional omissions**. Inheritance is not blanket parity.

## Baseline and delivered boundary

Historical [overlays.ts](../../../src/components/overlays.ts) remains the old core text
tooltip implementation. The new [Tooltip helper](../../../src/components/tooltip/tooltip.ts)
uses [Popover's side-effect-free controller](../../../src/components/popover/popover.ts)
and [positioning](../../../src/components/popover/position.ts), not copied floating machinery.

- **HTML:** a meaningful keyboard-reachable native trigger and short authored
  `.mui-popover.mui-tooltip[role=tooltip][popover=manual]` content with a unique ID.
- **JS:** description token ownership, hover **and** focus, Escape suppression/reentry,
  validation rejecting interactive content, and shared delays/placement/lifecycle.
- **CSS:** external Tooltip presentation composed with maintained Popover CSS at build time;
  no runtime source-relative imports, style strings or hidden runtime dependencies.
- **Evidence:** [native API/loading/limits/acceptance](../../components/tooltip.md),
  [authored demo](../../../demo/components/tooltip.html), [tests](../../../tests/tooltip.test.ts)
  and [shared regressions](../../../tests/popover.test.ts).

Important instructions stay visible. Rich actions, label-forwarded activation and keyboard
scroll regions do not belong in this tooltip. No expanded/controls/haspopup state, trap,
generated tooltip name, fake tab stop, source/invoker relationship or speech guarantee is added.

## Upstream implementation evidence

The pinned [Tooltip API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip/demos/enUS/index.demo-entry.md)
delegates props/slots to Popover. The actual implementation is
[`Tooltip.ts`, not TSX](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip/src/Tooltip.ts#L13-L72):
it spreads Popover base props, forwards slots/methods, and changes theme/extra classes.
The original shared [Popover state/trigger review](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L269-L446)
is retained as provenance, not proof of descriptive accessibility.

The 2026-09-08 migration reviewed these actual sources and selected narrower native Tooltip
semantics. Upstream's ability to forward click/manual triggers, interactive slots, focus traps,
renderer and provider hooks is not an instruction to reproduce them.

## Migration steps

**Delivery phase:** P3 — descriptive overlays. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** accepted Popover positioning/lifecycle and explicit native description ownership.
**Next task:** Popconfirm, separately; overall P3 remains in progress.

1. [x] **Keep essential text accessible.** Meaningful native actions and visible essential
   help; description tokens and original content preserved without automatic names.
2. [x] **Coordinate pointer/focus state.** Shared delays/gap retention, immediate native
   focus, Escape suppression/reentry and noninteractive Tab behavior accepted.
3. [x] **Resolve inherited props/slots.** All 36 original inherited identities have explicit
   Tooltip-specific dispositions; seven source-only additions are marked separately.
4. [x] **Test description lifetimes.** Disabled-trigger alternatives, interactive rejection,
   nested/peer ownership, removal/reconnect, fallback and shared ancestor cleanup accepted.

### Native primitives and fallback

Native **manual** popovers avoid unexpected auto-popover peer dismissal. Tooltip supplies
its own explicitly scoped Escape handling and describedby ownership, while shared machinery
owns actual visibility, delays and native anchors/measured fallback. No unsupported hint mode
is silently used. Missing native show/hide yields the original visible static description,
not a hidden/focusable polyfill. Without JS in supporting browsers, tooltip activation is an
enhancement; visible essential help and native actions remain the fallback.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/tooltip)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **0 local table rows + 7 source-only supplements + 36 inherited rows = 43**.
Reference-style definitions preserve the original immutable link/line identities.
**ADAPTED** identifies the native contract proved by the acceptance record, not an upstream
prop/default/Vue callback alias. Omitted items receive no implementation credit.

### Tooltip inherited Popover Props

Inherited from [Popover Props](popover.md#popover-props), but each disposition below is based
on noninteractive Tooltip semantics, not copied from Popover's accepted status.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`animated`][api29] | Prop | ADAPTED opt-in `.mui-popover--animated`. | 🟢 Verified | Included external animation; reduced motion; no leave scheduler/default parity. |
| [`arrow-point-to-center`][api30] | Prop | No exact trigger-center tether. | ⏭️ Intentionally omitted | Decorative inset side indicator only. |
| [`arrow-class`][api31] | Prop | ADAPTED authored class styling the shared indicator pseudo-element. | 🟢 Verified | No generated arrow node or class prop forwarding. |
| [`arrow-style`][api32] | Prop | ADAPTED external indicator CSS. | 🟢 Verified | No runtime string/object style API. |
| [`arrow-wrapper-class`][api33] | Prop | No generated arrow wrapper. | ⏭️ Intentionally omitted | Author panel CSS instead. |
| [`arrow-wrapper-style`][api34] | Prop | No arrow-wrapper style object. | ⏭️ Intentionally omitted | No wrapper or style forwarding. |
| [`content-class`][api35] | Prop | ADAPTED authored descriptive content classes. | 🟢 Verified | Original short text/formatting nodes preserved. |
| [`content-style`][api36] | Prop | ADAPTED external descriptive content CSS. | 🟢 Verified | No CSS-in-JS or HTML string construction. |
| [`delay`][api37] | Prop | ADAPTED 100ms hover opening option. | 🟢 Verified | Shared cancellation; focus opens immediately without transfer. |
| [`disabled`][api38] | Prop | ADAPTED live controller.disabled. | 🟢 Verified | Stops Tooltip, not the native action; initially disabled controls require explicit accessible alternatives. |
| [`display-directive`][api39] | Prop | No framework if/show renderer. | ⏭️ Intentionally omitted | Native visibility retains original nodes. |
| [`duration`][api40] | Prop | ADAPTED 100ms departure delay. | 🟢 Verified | Gap/focus retention and pending cancellation; not animation duration. |
| [`flip`][api41] | Prop | ADAPTED shared opposite-side flip. | 🟢 Verified | Actual native anchor/fallback edge evidence; bounded viewport, not generic middleware. |
| [`footer-class`][api42] | Prop | No dedicated rich footer API. | ⏭️ Intentionally omitted | Short description; action/footer components belong in Popover. |
| [`footer-style`][api43] | Prop | No dedicated footer-style forwarding. | ⏭️ Intentionally omitted | Style ordinary descriptive text, not a compound action surface. |
| [`header-class`][api44] | Prop | No dedicated header API. | ⏭️ Intentionally omitted | Tooltip is descriptive text, not a named dialog/card. |
| [`header-style`][api45] | Prop | No dedicated header-style forwarding. | ⏭️ Intentionally omitted | External text styling remains available without this API. |
| [`keep-alive-on-hover`][api46] | Prop | ADAPTED always retain pointer/focus engagement. | 🟢 Verified | Pointer can travel onto the description; false/early-dismiss option excluded. |
| [`overlap`][api47] | Prop | No trigger-overlap positioning mode. | ⏭️ Intentionally omitted | Nonnegative gap and shared clamp instead. |
| [`placement`][api48] | Prop | ADAPTED twelve placements, top default. | 🟢 Verified | Shared RTL, scroll/resize, native anchors and finite fallback. |
| [`raw`][api49] | Prop | ADAPTED `.mui-popover--raw`. | 🟢 Verified | Shared external decoration reduction, not interactive/raw-renderer content. |
| [`scrollable`][api50] | Prop | No focusable/scrollable Tooltip surface. | ⏭️ Intentionally omitted | Short fitting text only; CSS clips overflow. Long content belongs inline/details/Popover. |
| [`show-arrow`][api51] | Prop | ADAPTED opt-in shared indicator class. | 🟢 Verified | Noninteractive inset indicator, suppressed after collision shifting. |
| [`show`][api52] | Prop | ADAPTED actual show getter and imperative open/close/setShow. | 🟢 Verified | Native cancel/coalesced toggle, not controlled/default-show state. |
| [`to`][api53] | Prop | No teleport/portal target. | ⏭️ Intentionally omitted | Authored DOM ancestry retained; top layer supplies visual escape. |
| [`trigger`][api54] | Prop | ADAPTED always hover AND keyboard focus, with imperative requests. | 🟢 Verified | Click, focus-only and manual-only trigger options rejected; no double native actions. |
| [`width`][api55] | Prop | ADAPTED external width/max-width. | 🟢 Verified | Short descriptions bounded by viewport; automatic trigger-width matching excluded. |
| [`x`][api56] | Prop | No arbitrary/virtual-anchor coordinates. | ⏭️ Intentionally omitted | Actual native trigger geometry only. |
| [`y`][api57] | Prop | No arbitrary/virtual-anchor coordinates. | ⏭️ Intentionally omitted | Shared viewport-relative positioning only. |
| [`z-index`][api58] | Prop | No top-layer ordering service. | ⏭️ Intentionally omitted | Native manual popovers; no global provider. |
| [`on-clickoutside`][api59] | Callback | No outside-click reason callback. | ⏭️ Intentionally omitted | Departure/Escape own Tooltip dismissal, not duplicated document click handlers. |
| [`on-update:show`][api60] | Callback | ADAPTED native beforetoggle/toggle observation. | 🟢 Verified | Actual cancel/coalesced events; no callback array, reason or silent-state parity. |

### Tooltip inherited Popover Slots

Inherited from [Popover Slots](popover.md#popover-slots). Only descriptive authored structure
is retained; Popup slots do not make actions appropriate inside role=tooltip.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`trigger`][api66] | Slot | ADAPTED explicit keyboard-reachable native trigger. | 🟢 Verified | Meaningful author name; no fake span, tab stop or invoker/expanded state. |
| [`footer`][api67] | Slot | No rich footer slot. | ⏭️ Intentionally omitted | Use Popover for action/compound content. |
| [`header`][api68] | Slot | No named header slot. | ⏭️ Intentionally omitted | No generated Tooltip name; author short text semantics remain explicit. |
| [`default`][api69] | Slot | ADAPTED authored noninteractive description. | 🟢 Verified | Native role/ID and stable nodes; interactive/autofocus/label/custom-widget content rejected. |

### Source-only supplements — additions, not inherited Markdown rows

The API Markdown does not list Tooltip methods/types, although its implementation forwards
two methods and aliases types. These additional identities are explicit; they do not silently
expand the original inherited documentation denominator.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`TooltipInst`][src13] | Source-only instance alias | No Vue instance alias. | ⏭️ Intentionally omitted | Native TooltipController has its own explicit contract. |
| [`TooltipProps`][src20] | Source-only Vue prop type | No framework prop type. | ⏭️ Intentionally omitted | Native TooltipOptions deliberately excludes trigger modes. |
| [`TooltipSlots`][src22] | Source-only VNode slot type | No framework slot type. | ⏭️ Intentionally omitted | Explicit authored DOM instead. |
| [`syncPosition`][src41] | Source-only forwarded method | ADAPTED explicit shared controller method. | 🟢 Verified | Boolean actual result; open geometry updates and teardown tested. |
| [`setShow`][src44] | Source-only forwarded method | ADAPTED native visibility request. | 🟢 Verified | Suppression-aware imperative request; native events are not silent Vue updates. |
| [`popoverBaseProps` source-only extras][src16] | Source-only inherited implementation group | No defaultShow/getDisabled/callback aliases/deprecated widths/arrow/private trap/renderer plumbing. | ⏭️ Intentionally omitted | Original 36 public inherited rows remain separate; [Popover source supplements](popover.md#source-only-supplements--not-additional-public-markdown-rows) retain individual source findings. |
| [`useTheme.props`, `useConfig`, `mergedTheme`, `builtinThemeOverrides`, `internalExtraClass`][src17] | Source-only theme/config group | No provider/theme or framework class forwarding. | ⏭️ Intentionally omitted | Composed external CSS/custom properties; final runtime forwarding at lines 64–67. |

[api29]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L29
[api30]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L30
[api31]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L31
[api32]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L32
[api33]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L33
[api34]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L34
[api35]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L35
[api36]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L36
[api37]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L37
[api38]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L38
[api39]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L39
[api40]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L40
[api41]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L41
[api42]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L42
[api43]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L43
[api44]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L44
[api45]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L45
[api46]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L46
[api47]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L47
[api48]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L48
[api49]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L49
[api50]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L50
[api51]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L51
[api52]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L52
[api53]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L53
[api54]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L54
[api55]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L55
[api56]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L56
[api57]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L57
[api58]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L58
[api59]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L59
[api60]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L60
[api66]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L66
[api67]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L67
[api68]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L68
[api69]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L69
[src13]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip/src/Tooltip.ts#L13
[src20]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip/src/Tooltip.ts#L20
[src22]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip/src/Tooltip.ts#L22
[src41]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip/src/Tooltip.ts#L41-L43
[src44]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip/src/Tooltip.ts#L44-L46
[src16]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip/src/Tooltip.ts#L16
[src17]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tooltip/src/Tooltip.ts#L17-L68

<!-- END PINNED API INVENTORY -->
