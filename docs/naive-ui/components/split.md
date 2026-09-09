# Split

**🟢 Verified retained native two-pane resize scope.** Original named regions in CSS grid,
one owned separator, pointer capture and equivalent keyboard bounds. Ratios and explicit
decimal pixel sizes remain distinct; desired/default values survive responsive clamping.
No layout provider, drag package, generic panel renderer or body interaction override.

[Canonical anatomy/API/acceptance](../../components/split.md).
**Delivery phase:** P5. **Task state:** 🟢 Verified retained scope.
The [master phase audit](../migration-plan.md) covers all ten P5-assigned inventories.
No next component is implemented here.

1. [x] **Specify panel anatomy.** Preserve two named pane subtrees, primary size ownership,
   explicit separator name/controls/orientation and static no-JS layout.
2. [x] **Implement input parity.** Pointer capture and physical Arrow/Home/End/Shift steps
   use identical resolved bounds and preserve the current ratio/pixel mode.
3. [x] **Isolate measured layout.** Only numeric grid geometry tokens change; native
   client/border/padding/gap/scale measurements and explicit infeasible fallback.
4. [x] **Verify cancellation.** Final pointerup, cancel/lost/Escape, resize/disable/teardown,
   nested ownership, hidden form fields, print, zoom and actual Chromium drag evidence.

### Native primitives and fallback

Native sections/controls/templates stay in place. Only the separator gets pointer
capture/touch-action/user-select rules. Collapsed subpixel/zero panes are hidden/inert,
not disabled form fields. Explicit reveal precedes application validation. Impossible
bounds expose uncollapsed stacked content with native scrolling. Static no-JS layout
keeps both panes visible and hides the nonfunctional handle.

## Pinned evidence and boundary

- [API][api], [implementation/props/slots][source], [exports][exports],
  [update-size type][types].
- [Official route](https://www.naiveui.com/en-US/os-theme/components/split) is a convenience
  link, not a claim of live framework/pixel parity.
- [Catalog](../index.md) · [Architecture](../architecture.md).

Revision **42a52e6436b38bed456fee19eb0b89cdcd00fcc2**, Naive UI 2.45.3.
Source uses flex, mouse document listeners, a body cursor write and reactive controlled/
default state. Its ratio basis subtracts the trigger; pixel input is parsed through depx.
The native target uses grid content-box space minus the handle **and both gaps**, accounts
for root padding/borders/scale, and preserves desired size independently of effective layout.
It uses pointer capture and a named keyboard separator instead of reproducing mouse-only
or global-body behavior.

Markdown default-size is typed number but its description/source also permit pixel strings.
Source SplitOnUpdateSize uses string & number; the target deliberately uses a meaningful
number-or-px union rather than exporting that intersection alias.

**All 19 original section/member/kind/API-line identities remain in order.**
`API:Lnn` means the pinned [API][api] URL plus `#Lnn`.
Ten explicit source-only supplements give **29 rows: 19 native adaptations + ten intentional
omissions, zero unresolved**. Verified is the stated native subset, not framework compatibility.

<!-- BEGIN PINNED API INVENTORY -->

### Split Props

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `default-size` · API:L24 | Prop | defaultSize ratio/decimal px plus explicit setDefaultSize/reset; independent of current size. | 🟢 Verified |
| `direction` · API:L25 | Prop | Horizontal side-by-side / vertical top-bottom native tracks; separator orientation is perpendicular. | 🟢 Verified |
| `disabled` · API:L26 | Prop | Disables resize interaction, retains handle/value/layout and native pane fields. | 🟢 Verified |
| `max` · API:L27 | Prop | Ratio/decimal px upper bound resolved against current usable space, clipped to available length. | 🟢 Verified |
| `min` · API:L28 | Prop | Ratio/decimal px lower bound; impossible mixed/responsive ranges suspend explicitly. | 🟢 Verified |
| `pane1-class` · API:L29 | Prop | Original native pane/inner-content classes remain authored. | 🟢 Verified |
| `pane1-style` · API:L30 | Prop | External native CSS, no object bridge; owned outer geometry stays unpadded/borderless, decoration goes inside. | 🟢 Verified |
| `pane2-class` · API:L31 | Prop | Original second-pane classes. | 🟢 Verified |
| `pane2-style` · API:L32 | Prop | External inner-content/pane presentation within the explicit geometry contract. | 🟢 Verified |
| `resize-trigger-size` · API:L33 | Prop | resizeTriggerSize 1..64 CSS pixels, default 12 rather than source 3; isolated numeric geometry token. | 🟢 Verified |
| `size` · API:L34 | Prop | Silent current requested ratio/px value, separately reported effective pixel/ratio state. | 🟢 Verified |
| `watch-props` · API:L35 | Prop | No reactive prop watcher; future defaults change only through explicit setDefaultSize/reset. | ⏭️ Intentionally omitted |
| `on-drag-start` · API:L36 | Callback | mui:split-drag-start after successful owned capture, with pointer ID/state/event. | 🟢 Verified |
| `on-drag-move` · API:L37 | Callback | mui:split-drag-move per processed/coalesced sample, not every physical event. | 🟢 Verified |
| `on-drag-end` · API:L38 | Callback | mui:split-drag-end with actual terminal event/cancel reason and final state. | 🟢 Verified |
| `on-update:size` · API:L39 | Callback | mui:split-change for user pointer/keyboard/cancel updates; programmatic size setters silent. | 🟢 Verified |

### Split Slots

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `1` · API:L45 | Slot | Original first named native region, no renderer. | 🟢 Verified |
| `2` · API:L46 | Slot | Original second named native region, no renderer. | 🟢 Verified |
| `resize-trigger` · API:L47 | Slot | Named separator with optional noninteractive decorative native content; no arbitrary interactive renderer. | 🟢 Verified |

### Source-only exports, defaults and theme declarations

These entries are explicit [source][source]/[export][exports]/[type][types] supplements,
not extra original Markdown API rows.

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `NSplit` · exports | Component export | createSplit on native authored panes; no custom-element registration. | 🟢 Verified |
| `splitProps` · exports | Props record | No Vue prop schema. | ⏭️ Intentionally omitted |
| `SplitProps` · exports | Type alias | Independently typed native options, no ExtractPublicPropTypes alias. | ⏭️ Intentionally omitted |
| `SplitSlots` · exports | Interface | Authored native children, no VNode slot-function interface. | ⏭️ Intentionally omitted |
| `SplitOnUpdateSize` · types.ts | Type alias | Source string & number intersection alias is not exported; native event uses SplitSize union. | ⏭️ Intentionally omitted |
| `onUpdateSize` · Split.tsx | Callback alias | No callback-prop alias; native custom event is explicit. | ⏭️ Intentionally omitted |
| `default` · SplitSlots | Slot declaration | Source declares but does not render this slot; no invented default-slot behavior. | ⏭️ Intentionally omitted |
| `theme` · source useTheme.props | Prop | External native CSS, no theme provider. | ⏭️ Intentionally omitted |
| `themeOverrides` · source useTheme.props | Prop | No theme-object merging. | ⏭️ Intentionally omitted |
| `builtinThemeOverrides` · source useTheme.props | Prop | No private theme override object. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

Keyboard steps, pointer-cancel rollback, safe pane reveal, suspension and print lifecycle
are explicit target extensions. See the canonical document for limits and measured evidence.

[api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md
[source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/src/Split.tsx
[exports]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/index.ts
[types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/src/types.ts
