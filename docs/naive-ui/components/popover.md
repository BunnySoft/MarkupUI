# Popover

**🟢 Verified — retained native nonmodal scope, not framework API parity.**
All original named rows and source identities remain below: **38 public rows + 11 explicit
source-only supplements = 49 tracker rows; 28 Verified adapted targets, 21 omissions.**

## Baseline and delivered boundary

Historical [B1: overlays.ts](../../../src/components/overlays.ts) and
[B2: position.ts](../../../src/core/position.ts) remain unchanged. They supply only the old
core controller, not this enhanced scope.

- **HTML:** authored native button/link/control and `.mui-popover[popover]`, explicit content
  semantics, native close actions and optional header/footer.
- **JS:** optional [createPopover](../../../src/components/popover/popover.ts) with native
  visibility, local hover/focus delays, immutable ID ownership, cleanup and
  [small local positioning](../../../src/components/popover/position.ts).
- **CSS:** [external surface/indicator/print/motion rules](../../../src/components/popover/popover.css).
- **Evidence:** [loading/API/acceptance record](../../components/popover.md),
  [native demo](../../../demo/components/popover.html), [52 focused tests](../../../tests/popover.test.ts).

Native click commands own activation; native auto popovers own light-dismiss, Escape,
top-layer ordering and Tab behavior. This is nonmodal: no invented trap, role or inert
application. Hover includes native focus, retains interactive panel content and bridges the
gap with a departure delay. Manual trigger and native manual popover are distinct.
Nested panels remain inside their parent in the DOM; portalled nesting is rejected.
No nodes are created/replaced, no registration occurs, and legacy/helper loading order has
no tag conflict. Binding the same anatomy inside legacy mui-popover is rejected.

## Upstream implementation evidence

Pinned [Popover state/triggers](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L269-L446)
and [body behavior](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/PopoverBody.tsx#L142-L320)
were the original targeted evidence. The 2026-09-08 migration also read the pinned public
Markdown and [prop/state/trigger implementation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L113-L480).
The native design deliberately replaces Vue state merging, trigger-VNode rewriting,
positioning/directive dependencies and renderer lifetime with authored nodes and browser
state. This is a retained-scope review, not an exhaustive upstream implementation audit.

## Migration steps

**Delivery phase:** P3 — floating foundations. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** narrow P0 native lifecycle/loading/event contracts; existing P1 controls.
**Next task:** Tooltip, as a separate component/commit. Overall P3 remains in progress.

1. [x] **Specify visibility state.** Actual native show state, cancel/coalesced toggle,
   explicit initial opening, disabled behavior and four trigger modes documented/tested.
2. [x] **Own dismissal locally.** Native auto/manual ownership, DOM nesting and per-instance
   hover/focus timers verified; no duplicate click/keydown/document-dismiss handlers.
3. [x] **Separate positioning/CSS.** Independently detected anchors plus explicit local
   flip/clamp fallback, visual viewport/RTL/scroll/resize and restorable writes accepted.
4. [x] **Verify floating boundaries.** Focus/pointer/native forms, clipping/nesting/reopen,
   unsupported static content, reconnect/disposal and legacy coexistence accepted within
   the linked Chromium/testing boundary.

### Native primitives and fallback

Native Popover and CSS anchors are detected independently. Unsupported native show/hide
methods produce readable static content (popover attribute temporarily removed/restored).
No-JS native click commands remain functional; hover/focus/manual application triggers need
JS, or an authored inline/details alternative. No Shadow DOM, renderer, provider,
positioning polyfill, inline CSS text or framework-style prop passthrough is introduced.
Dynamic CSSOM geometry and browser-specific capability limits are explicit in the record.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/popover)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**. Reference-style links below preserve each
original row's immutable source/line identity and owner heading. No public row was removed,
renamed, merged or counted as a source-only addition.

**ADAPTED** means the linked native contract has evidence; it does not mean the upstream
prop/default/callback is accepted verbatim. CSS substitutions are author-owned presentation,
not style-object passthrough. Omitted rows receive no implementation credit.

### Popover Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`animated`][api29] | Prop | ADAPTED opt-in `.mui-popover--animated`. | 🟢 Verified | External opacity entrance; reduced motion; no leave scheduler or upstream default parity. |
| [`arrow-point-to-center`][api30] | Prop | No exact trigger-center arrow tether. | ⏭️ Intentionally omitted | Decorative side indicator only; no offset/pointing solver. |
| [`arrow-class`][api31] | Prop | ADAPTED author panel class styling `::before`. | 🟢 Verified | No generated arrow node; CSS selector rather than prop forwarding. |
| [`arrow-style`][api32] | Prop | ADAPTED external indicator CSS. | 🟢 Verified | No string/object style passthrough; noninteractive inset presentation. |
| [`arrow-wrapper-class`][api33] | Prop | No generated arrow wrapper. | ⏭️ Intentionally omitted | Style the authored panel; no imaginary wrapper API. |
| [`arrow-wrapper-style`][api34] | Prop | No generated arrow wrapper/style object. | ⏭️ Intentionally omitted | External panel CSS is the simpler alternative. |
| [`content-class`][api35] | Prop | ADAPTED authored content classes. | 🟢 Verified | Original content nodes and listeners retained. |
| [`content-style`][api36] | Prop | ADAPTED external content stylesheet. | 🟢 Verified | No inline style-object API or content rewriting. |
| [`delay`][api37] | Prop | ADAPTED immutable `delay` option, 100ms default. | 🟢 Verified | Hover opening timer; cancellation on leave/close/dispose tested. |
| [`disabled`][api38] | Prop | ADAPTED live controller.disabled and native disabled/inert/hidden availability. | 🟢 Verified | Closes immediately, rejects native opening; does not disable unrelated native actions. |
| [`display-directive`][api39] | Prop | No framework if/show directive. | ⏭️ Intentionally omitted | Native visibility preserves nodes; no render/unmount emulation. |
| [`duration`][api40] | Prop | ADAPTED hover/focus departure delay, 100ms default. | 🟢 Verified | Separate from animation; interactive gap/focus retention tested. |
| [`flip`][api41] | Prop | ADAPTED opposite-side flip option. | 🟢 Verified | Viewport clamp, explicit no-flip path and edge evidence; not general collision middleware. |
| [`footer-class`][api42] | Prop | ADAPTED authored footer classes. | 🟢 Verified | Original footer controls preserve native actions/form semantics. |
| [`footer-style`][api43] | Prop | ADAPTED external footer CSS. | 🟢 Verified | No runtime style object or provider. |
| [`header-class`][api44] | Prop | ADAPTED authored header classes. | 🟢 Verified | Authored heading/name remains explicit. |
| [`header-style`][api45] | Prop | ADAPTED external header CSS. | 🟢 Verified | No runtime style object or provider. |
| [`keep-alive-on-hover`][api46] | Prop | ADAPTED always retain interactive panel hover/focus. | 🟢 Verified | Retained true behavior only; false/early-dismiss option not exposed. |
| [`overlap`][api47] | Prop | No overlapping-trigger placement mode. | ⏭️ Intentionally omitted | Nonnegative gap, bounded viewport positioning instead. |
| [`placement`][api48] | Prop | ADAPTED twelve positions, bottom default. | 🟢 Verified | RTL horizontal start/end, native anchors or explicit fallback; vertical writing excluded. |
| [`raw`][api49] | Prop | ADAPTED `.mui-popover--raw`. | 🟢 Verified | Removes default surface decoration, not placement/overflow safety. |
| [`scrollable`][api50] | Prop | ADAPTED native outer-panel overflow with maximum available height. | 🟢 Verified | Author inner scroller for independently fixed header/footer; no scrollbar runtime. |
| [`show-arrow`][api51] | Prop | ADAPTED opt-in `.mui-popover--arrow`. | 🟢 Verified | Decorative inset indicator, hidden after collision shifting; no default/tether parity. |
| [`show`][api52] | Prop | ADAPTED actual controller.show plus explicit open/close/setShow. | 🟢 Verified | Native cancel/toggle/coalescing; not a controlled Vue prop. |
| [`to`][api53] | Prop | No teleport/portal target. | ⏭️ Intentionally omitted | Nodes remain authored; native top layer escapes overflow without reparenting. |
| [`trigger`][api54] | Prop | ADAPTED click/hover/focus/manual setup option. | 🟢 Verified | Native button click commands, focusable native links/controls; no double activation or fake spans. |
| [`width`][api55] | Prop | ADAPTED external CSS width/max-width. | 🟢 Verified | Responsive available viewport constraint; automatic trigger-width matching excluded. |
| [`x`][api56] | Prop | No arbitrary/virtual-anchor coordinates. | ⏭️ Intentionally omitted | Real native trigger geometry; no pointer/context-menu positioning API. |
| [`y`][api57] | Prop | No arbitrary/virtual-anchor coordinates. | ⏭️ Intentionally omitted | Real native trigger geometry and finite computed writes only. |
| [`z-index`][api58] | Prop | No overlay z-index arbitration. | ⏭️ Intentionally omitted | Native top-layer order and auto/manual ownership. |
| [`on-clickoutside`][api59] | Callback | No synthesized outside-click reason callback. | ⏭️ Intentionally omitted | Native dismissal/toggle does not guarantee a distinct cause; no duplicated document listener. |
| [`on-update:show`][api60] | Callback | ADAPTED native panel beforetoggle/toggle events. | 🟢 Verified | Actual async/coalesced state, author-cancelable opening; no callback-array alias. |

### Popover Slots

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`trigger`][api66] | Slot | ADAPTED explicitly supplied native trigger node. | 🟢 Verified | No cloned VNode, span or synthesized keyboard semantics. |
| [`footer`][api67] | Slot | ADAPTED authored footer content. | 🟢 Verified | Stable nodes/listeners and native controls. |
| [`header`][api68] | Slot | ADAPTED authored header/heading. | 🟢 Verified | Author labels and ARIA semantics, no invented role. |
| [`default`][api69] | Slot | ADAPTED authored panel children. | 🟢 Verified | Free native content; no text/HTML template parser. |

### Popover Methods

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`setShow`][api75] | Method | ADAPTED controller.setShow(boolean), returns actual state. | 🟢 Verified | Native requests/events, explicitly not upstream silent uncontrolled-state behavior. |
| [`syncPosition`][api76] | Method | ADAPTED controller.syncPosition(), boolean result. | 🟢 Verified | Local update for an open panel; closes invalid/fully clipped geometry. |

### Source-only supplements — not additional public Markdown rows

These implementation identifiers were discovered during the targeted migration review.
They are explicitly additional scope dispositions; they do not rewrite the 38-row original
documentation inventory or pretend every private upstream member is a public API.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`defaultShow`][src118] | Source-only prop | No initial auto-open configuration. | ⏭️ Intentionally omitted | Connect closed; application deliberately calls open. |
| [`getDisabled`][src144] | Source-only callback | No callback/polling disabled getter. | ⏭️ Intentionally omitted | Boolean controller.disabled and actual native availability instead. |
| [`onUpdateShow`][src184] | Source-only callback alias | No callback aliases/arrays. | ⏭️ Intentionally omitted | Subscribe to native toggle instead. |
| [`onShow`][src200] | Source-only deprecated callback | No deprecated callback alias. | ⏭️ Intentionally omitted | Native toggle notifications; no upstream implementation-bug parity. |
| [`onHide`][src203] | Source-only deprecated callback | No deprecated callback alias. | ⏭️ Intentionally omitted | Native toggle notifications. |
| [`arrow`][src206] | Source-only deprecated prop | No old arrow prop alias. | ⏭️ Intentionally omitted | Opt-in external decorative indicator class. |
| [`minWidth`][src210] | Source-only deprecated prop | No deprecated JS width prop. | ⏭️ Intentionally omitted | Ordinary author CSS, subject to available viewport limits. |
| [`maxWidth`][src211] | Source-only deprecated prop | No deprecated JS width prop. | ⏭️ Intentionally omitted | External max-width token/CSS instead. |
| [`internalDeactivateImmediately`, `internalSyncTargetWithParent`, `internalInheritedEventHandlers`, `internalTrapFocus`, `internalExtraClass`, `internalOnAfterLeave`, `internalRenderBody`][src188] | Source-only grouped internal hooks | No framework coordination/trap/render/transition plumbing. | ⏭️ Intentionally omitted | Native nonmodal state and DOM nesting; final two hooks at lines 217–218. |
| [`useTheme.props` / `ThemeProps`][src215] | Source-only theme group | No theme/provider injection. | ⏭️ Intentionally omitted | External author classes/tokens and system colors. |
| [`PopoverProps`, `PopoverInternalProps`, `PopoverSlots`][src221] | Source-only Vue type group | No Vue prop/VNode/slot type aliases. | ⏭️ Intentionally omitted | Explicit native controller/options/placement types are independent contracts. |

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
[api75]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L75
[api76]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L76
[src118]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L118
[src144]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L144
[src184]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L184
[src200]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L200
[src203]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L203
[src206]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L206
[src210]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L210
[src211]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L211
[src188]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L188-L218
[src215]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L215
[src221]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L221-L229

<!-- END PINNED API INVENTORY -->
