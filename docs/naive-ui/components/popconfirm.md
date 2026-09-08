# Popconfirm

**🟢 Verified for the retained native nonmodal confirmation scope.**
All **44 original identities** remain: 10 local public rows and 34 inherited Popover rows.
Eight explicit source-only supplements make **52 tracker rows: 30 Verified adapted targets,
22 intentional omissions**. This is not framework or inherited API parity.

## Baseline and delivery

Historical [overlays.ts](../../../src/components/overlays.ts) has no confirmation
orchestration and remains unchanged. The optional
[Popconfirm adapter](../../../src/components/popconfirm/popconfirm.ts) reuses public,
side-effect-free [Popover behavior](../../../src/components/popover/popover.ts) without adding
confirmation logic to the nearly full shared bundle. Local
[attribute ownership](../../../src/components/popconfirm/state.ts) protects pending state.

- **HTML:** explicitly named/described nonmodal role=dialog, native type=button trigger and
  two separately named decisions, authored content/icon/wrappers/status/error text.
- **JS:** native action admission after event dispatch, false/fulfilled/rejected results,
  pending locks, observable errors and opening/action identity guards.
- **CSS:** complete external CSS composed from maintained Popover rules and local action styles.
- **Evidence:** [loading/API/limits/acceptance](../../components/popconfirm.md),
  [native local-only demo](../../../demo/components/popconfirm.html),
  [40 focused tests](../../../tests/popconfirm.test.ts).

Native auto popover owns click/Tab/Escape/outside/ancestor behavior; no modal trap,
aria-modal=true, fake menu role, provider or renderer is added. Callback failure is not
confirmation. Late outcomes cannot overwrite new or detached UI, but dismissal does not
cancel external application side effects.

## Upstream implementation evidence

The original shared [Popover review](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L269-L446)
remains provenance. The migration additionally read pinned
[Popconfirm action handling](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/Popconfirm.tsx#L69-L96),
[panel composition/localization](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/PopconfirmPanel.tsx#L10-L153)
and [instance/injection types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/interface.ts#L8-L17).

Upstream returns exactly false to retain visibility and otherwise closes after Promise
fulfillment. Its panel creates Button/VNode/localized content and supports null action text.
The native target instead preserves authored labels/buttons and explicitly adds pending,
rejection and stale-result safeguards. Upstream's renderer or error-handling gaps are not
requirements to reproduce.

## Migration steps

**Delivery phase:** P3 — confirmation interactions. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native P1 button semantics and accepted P3 Popover lifecycle/positioning.
**Next task:** Dropdown; global P3 remains incomplete.

1. [x] **Author confirmation anatomy.** Named/described nonmodal panel, safe native decisions
   and stable authored content/icon/action/status regions accepted.
2. [x] **Resolve action ownership.** Task-deferred defaultPrevented admission, pending locks,
   exact false/other fulfillment and explicit rejection channels accepted.
3. [x] **Compose Popover behavior.** Native visibility/placement/dismissal and composed CSS
   reused without changing shared source, bytes or prior ceilings.
4. [x] **Test cancellation races.** Hide/reopen/dispose, overlapping operations, foreign
   disabled writes, native focus, errors, nested surfaces and inline fallback verified.

### Native primitives and fallback

Authored native button commands and Popover API remain preferred. Missing native show/hide
exposes original inline content; hooks, pending/error and completion feedback still function
without claiming a popup opened or closed. No positioning polyfill, Button package, provider,
style-text injection or Shadow DOM projection is introduced. No-JS callbacks are explicitly
unavailable; the demo performs no backend/destructive operation.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/popconfirm)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **10 local table rows + 8 source-only supplements + 34 inherited rows = 52**.
Reference definitions preserve every original owner/name/source-line identity.
**ADAPTED** means the documented native scope has evidence, not that a Vue prop, default,
callback-array alias or renderer contract exists. Omitted rows receive no implementation credit.
Referenced [Button](button.md) props remain composition, not automatic Button API inheritance.

### Popconfirm Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`negative-button-props`][pop22] | Prop | No unrestricted Button prop object. | ⏭️ Intentionally omitted | Author native negative button attributes/classes; no Button/VNode dependency. |
| [`negative-text`][pop23] | Prop | ADAPTED authored negative text/name. | 🟢 Verified | Label nodes/listeners preserved; default locale generation and null/removal are excluded. |
| [`positive-button-props`][pop24] | Prop | No unrestricted Button prop object. | ⏭️ Intentionally omitted | Native positive button composition; commands/submit types rejected. |
| [`positive-text`][pop25] | Prop | ADAPTED authored positive text/name. | 🟢 Verified | No string-to-HTML renderer, implicit translation or null/removal. |
| [`show-icon`][pop26] | Prop | ADAPTED optional authored icon and ordinary hidden/CSS. | 🟢 Verified | No generated warning asset or live framework prop forwarding. |
| [`on-positive-click`][pop27] | Callback | ADAPTED onPositive(MouseEvent), exact false/other fulfilled/Promise semantics. | 🟢 Verified | Task admission, pending lock, rejected lastAction/error event/authored error and stale UI guards. |
| [`on-negative-click`][pop28] | Callback | ADAPTED onNegative(MouseEvent), same outcome contract. | 🟢 Verified | False can keep open; negative is not an invented close/cancel event. |

### Popconfirm Slots

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`action`][pop36] | Slot | ADAPTED authored native action markup/wrappers. | 🟢 Verified | Distinct positive/negative typed buttons required; no VNode slot renderer. |
| [`default`][pop37] | Slot | ADAPTED stable authored description/content and status regions. | 🟢 Verified | Explicit native name/description and error/busy/completion text. |
| [`icon`][pop38] | Slot | ADAPTED authored decorative icon/content. | 🟢 Verified | Native hidden/ARIA and external CSS; no icon package or copied artwork. |

### Popconfirm inherited Popover Props

Inherited from [Popover Props](popover.md#popover-props), with confirmation-specific
retained scope rather than blanket forwarding.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`animated`][api29] | Prop | ADAPTED optional shared appearance class. | 🟢 Verified | External CSS and reduced motion; no leave scheduler/default parity. |
| [`arrow-point-to-center`][api30] | Prop | No exact trigger-center tether. | ⏭️ Intentionally omitted | Decorative inset indicator only. |
| [`arrow-class`][api31] | Prop | ADAPTED authored class styling shared indicator pseudo-element. | 🟢 Verified | No generated arrow node or class forwarding. |
| [`arrow-style`][api32] | Prop | ADAPTED external indicator CSS. | 🟢 Verified | No style-object API. |
| [`arrow-wrapper-class`][api33] | Prop | No generated arrow wrapper. | ⏭️ Intentionally omitted | External panel CSS instead. |
| [`arrow-wrapper-style`][api34] | Prop | No arrow-wrapper style forwarding. | ⏭️ Intentionally omitted | No imaginary wrapper API. |
| [`content-class`][api35] | Prop | ADAPTED authored content classes. | 🟢 Verified | Native description/control nodes remain stable. |
| [`content-style`][api36] | Prop | ADAPTED external content CSS. | 🟢 Verified | No inline style strings or rendering provider. |
| [`delay`][api37] | Prop | No hover opening delay. | ⏭️ Intentionally omitted | Explicit click/manual confirmation; action admission task is not this hover API. |
| [`disabled`][api38] | Prop | ADAPTED live controller.disabled. | 🟢 Verified | Invalidates queued/pending UI and closes/refuses native opening, without disabling unrelated native actions. |
| [`display-directive`][api39] | Prop | No framework if/show rendering. | ⏭️ Intentionally omitted | Native visibility preserves original nodes. |
| [`duration`][api40] | Prop | No hover departure delay. | ⏭️ Intentionally omitted | Native explicit confirmation dismissal, not transient hover state. |
| [`flip`][api41] | Prop | ADAPTED shared opposite-side flip option. | 🟢 Verified | Native anchor/fallback, viewport clamp and edge tests. |
| [`footer-class`][api42] | Prop | ADAPTED authored footer/action classes. | 🟢 Verified | Native custom action wrappers, not a renderer. |
| [`footer-style`][api43] | Prop | ADAPTED external footer/action CSS. | 🟢 Verified | No style-object forwarding. |
| [`header-class`][api44] | Prop | ADAPTED authored named heading/header classes. | 🟢 Verified | Explicit role/name contract; no generated label. |
| [`header-style`][api45] | Prop | ADAPTED external header CSS. | 🟢 Verified | Shared external stylesheet composition. |
| [`keep-alive-on-hover`][api46] | Prop | No hover lifetime mode. | ⏭️ Intentionally omitted | Explicit click/manual native auto-popover state remains until a decision/dismissal. |
| [`overlap`][api47] | Prop | No overlapping-trigger placement mode. | ⏭️ Intentionally omitted | Nonnegative gap and viewport constraints. |
| [`placement`][api48] | Prop | ADAPTED twelve shared placements, bottom default. | 🟢 Verified | RTL, scroll/resize, anchor/fallback and visual viewport evidence. |
| [`raw`][api49] | Prop | ADAPTED shared raw-surface class. | 🟢 Verified | CSS decoration reduction, not bypassing safe anatomy or action validation. |
| [`scrollable`][api50] | Prop | ADAPTED native outer-panel overflow and available height. | 🟢 Verified | Interactive nonmodal content can scroll; no virtual scrollbar/runtime. |
| [`show-arrow`][api51] | Prop | ADAPTED opt-in shared indicator class. | 🟢 Verified | Inset decorative marker hidden after collision shifting. |
| [`show`][api52] | Prop | ADAPTED actual native show plus explicit open/close/setShow. | 🟢 Verified | No controlled/default-show or automatic positive callback; inline fallback is separately flagged. |
| [`to`][api53] | Prop | No teleport/portal container. | ⏭️ Intentionally omitted | Authored ancestry and native top layer; portalled nesting rejected. |
| [`trigger`][api54] | Prop | ADAPTED click default or explicit manual requests. | 🟢 Verified | Native button activation; no hover/focus mode, duplicate key handler or intercepted link action. |
| [`width`][api55] | Prop | ADAPTED external width/max-width. | 🟢 Verified | Viewport constraints; automatic trigger-width matching excluded. |
| [`x`][api56] | Prop | No arbitrary/virtual-anchor x coordinate. | ⏭️ Intentionally omitted | Real native trigger geometry only. |
| [`y`][api57] | Prop | No arbitrary/virtual-anchor y coordinate. | ⏭️ Intentionally omitted | Shared viewport-relative measurement only. |
| [`z-index`][api58] | Prop | No global overlay order service. | ⏭️ Intentionally omitted | Native auto top-layer arbitration. |
| [`on-clickoutside`][api59] | Callback | No synthesized outside-click reason callback. | ⏭️ Intentionally omitted | Native dismissal invalidates UI, not external work or a fabricated negative decision. |
| [`on-update:show`][api60] | Callback | ADAPTED native beforetoggle/toggle observation. | 🟢 Verified | Cancelable opening/async coalesced state, not silent Vue callback-array parity. |

### Popconfirm inherited Popover Methods

Inherited from [Popover Methods](popover.md#popover-methods).

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`setShow`][api75] | Method | ADAPTED boolean native visibility request. | 🟢 Verified | Programmatic requests never invoke confirmation hooks; native events remain. |
| [`syncPosition`][api76] | Method | ADAPTED shared update with boolean result. | 🟢 Verified | No copied positioning engine or polling loop. |

### Source-only supplements — explicit additions

These findings are additional implementation/type dispositions, not replacements for any
original public or inherited row. Grouped private/theme additions are not public promises.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`trigger`][source50] | Source-only slot | ADAPTED explicit native button trigger argument. | 🟢 Verified | Source slot omitted from local Markdown; native command/defaultPrevented behavior accepted. |
| [`PopconfirmInst`][instance8] | Source-only instance alias | No Vue instance alias. | ⏭️ Intentionally omitted | Explicit native controller/lastAction/pending contract instead. |
| [`PopconfirmProps`, `PopconfirmSetupProps`][source42] | Source-only prop type group | No Vue extracted-prop aliases. | ⏭️ Intentionally omitted | Native PopconfirmOptions are deliberately narrower. |
| [`PopconfirmSlots`][source46] | Source-only VNode type | No VNode slot type. | ⏭️ Intentionally omitted | Authored DOM and separately tracked source trigger slot. |
| [`PopconfirmInjection`, `popconfirmInjectionKey`][instance10] | Source-only injection group | No provider/injection state. | ⏭️ Intentionally omitted | Explicit local controller ownership. |
| [`useTheme.props`, `useConfig`, `useLocale`, `localeRef`, `cssVars`, `themeClass`][panel33] | Source-only theme/locale group | No injected theme/locale/style renderer. | ⏭️ Intentionally omitted | External CSS and authored localized labels; theme spread also at Popconfirm.tsx line 20. |
| [`popoverBaseProps` source-only extras][source21] | Source-only inherited implementation group | No defaultShow/getDisabled/deprecated aliases/private render/trap plumbing. | ⏭️ Intentionally omitted | Original 34 inherited documentation rows remain separate; [Popover supplements](popover.md#source-only-supplements--not-additional-public-markdown-rows) preserve earlier findings. |
| [`panelProps`, `panelPropKeys`][panel10] | Source-only internal view-key group | No framework panel/render prop filtering. | ⏭️ Intentionally omitted | Native immutable anatomy validation, not component-prop forwarding. |

[pop22]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md#L22
[pop23]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md#L23
[pop24]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md#L24
[pop25]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md#L25
[pop26]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md#L26
[pop27]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md#L27
[pop28]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md#L28
[pop36]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md#L36
[pop37]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md#L37
[pop38]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/demos/enUS/index.demo-entry.md#L38
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
[api75]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L75
[api76]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L76
[source50]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/Popconfirm.tsx#L50
[instance8]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/interface.ts#L8
[source42]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/Popconfirm.tsx#L42-L44
[source46]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/Popconfirm.tsx#L46-L51
[instance10]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/interface.ts#L10-L17
[panel33]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/PopconfirmPanel.tsx#L33-L73
[source21]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/Popconfirm.tsx#L21
[panel10]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popconfirm/src/PopconfirmPanel.tsx#L10-L27

<!-- END PINNED API INVENTORY -->
