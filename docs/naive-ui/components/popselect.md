# Popselect

**🟢 Verified retained native selection-disclosure scope.** Composes existing Popover
visibility/positioning and native Select ownership; no duplicate popup/option renderer.
The target is a named region containing a labelled native list select, **not an ARIA
combobox, menu or listbox-shaped panel**. Values change immediately; Done/dismissal does
not commit or roll back a second selection model.

[Canonical anatomy/API/evidence](../../components/popselect.md) ·
[Popover contract](../../components/popover.md) · [Select contract](../../components/select.md).

**Delivery phase:** P5. **Task state:** 🟢 Verified retained scope.
**Next:** Split. P5 remains incomplete.

1. [x] **Resolve option records.** Original native select/options/optgroups and strict
   strings/defaultSelected/disabled semantics; no new option data model.
2. [x] **Specify selected state.** Single string/null and multiple string arrays, immediate
   values, silent setters and bounded literal readout.
3. [x] **Compose navigation/dismissal.** Reuse native click Popover and native list keyboard;
   no closing on the first arrow/change, explicit Done and no dismissal rollback.
4. [x] **Test composed behavior.** Native forms/quiet validation/reveal, defaults/refresh,
   ownership, nesting, focus, geometry, fallback, tests/build/budgets/browser evidence.

### Native primitives and fallback

Author choices inline, with no initial popover attribute, plus hidden enhancement trigger/
Done buttons. Binding composes one Select and one click Popover; unsupported APIs retain
inline controls. Disconnect removes only owned enhancement state and exposes current
choices inline. No field names/defaults/values are replaced or serialized through proxies.

## Reference and review boundary

- [Pinned Popselect API][api], [controller/props/slots][source], [panel selection][panel],
  [instance/injection][interface], [exports][exports], [size type][public].
- [Inherited Popover API][popover-api] and [Select option/group API][select-api].
- [Official route](https://www.naiveui.com/en-US/os-theme/components/popselect) is a
  convenience link; immutable source, not live-site visual parity, is the review authority.
- [Catalog](../index.md) · [Architecture](../architecture.md).

Revision **42a52e6436b38bed456fee19eb0b89cdcd00fcc2**. Source defaults to hover/bottom,
uses a reactive tree/menu renderer, prevents menu mousedown focus changes and closes single
selection on toggle. Source-only cancelable can clear a repeated single choice; multiple
values are controlled arrays. This target instead uses click disclosure, native list
selection/focus and explicit Done/dismissal, with no cancellation snapshot.

Source explicitly omits showArrow/arrow from Popover base props despite the generic
Markdown inheritance link. The original inherited show-arrow row is preserved below as
an omission, not erased. Source size type also contains huge, absent from public Markdown;
the target supports only its documented small/medium/large CSS vocabulary.

**All 56 original identities remain in order: 13 local + 43 inherited rows.**
`Popselect:Lnn`, `Popover:Lnn` and `Select:Lnn` mean their respective exact pinned API URL
below plus `#Lnn`. Source-only supplements are explicitly separated. Verified means only
the stated native adaptation, not framework/renderer/controlled-prop compatibility.
**56 original + 23 source-only supplements = 79 rows: 38 adapted + 41 omitted, zero unresolved.**

<!-- BEGIN PINNED API INVENTORY -->

### Popselect Props

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `multiple` · Popselect:L21 | Prop | Native select.multiple, captured per owner; mode changes require rebind. | 🟢 Verified |
| `node-props` · Popselect:L22 | Prop | No option-object attribute factory. | ⏭️ Intentionally omitted |
| `options` · Popselect:L23 | Prop | Original authored options/optgroups; no node replacement/renderer. | 🟢 Verified |
| `render-label` · Popselect:L24 | Prop | No VNode label callback; literal native labels are tracked separately. | ⏭️ Intentionally omitted |
| `scrollable` · Popselect:L25 | Prop | Native list scrolling and bounded Popover overflow; no custom scrollbar. | 🟢 Verified |
| `scrollbar-props` · Popselect:L26 | Prop | No ScrollbarProps forwarding. | ⏭️ Intentionally omitted |
| `size` · Popselect:L27 | Prop | External small/medium/large native Select presentation. | 🟢 Verified |
| `value` · Popselect:L28 | Prop | Native string/null or DOM-order strings[]; no numeric coercion/model callback. | 🟢 Verified |
| `virtual-scroll` · Popselect:L29 | Prop | At most 2,000 native options; no virtual window. | ⏭️ Intentionally omitted |
| `on-update:value` · Popselect:L30 | Callback | Original native input/change, plus Select's explicit user-clear notifications; setters silent. | 🟢 Verified |

### Popselect Slots

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `header` · Popselect:L40 | Slot | Authored header/label/help inside the named region. | 🟢 Verified |
| `action` · Popselect:L41 | Slot | Original native footer/Done/clear/actions; no renderer. | 🟢 Verified |
| `empty` · Popselect:L42 | Slot | Authored data-select-empty content; no synthetic fallback option. | 🟢 Verified |

### Popselect inherited Popover Props

Each original inherited identity remains. Only the following declared native subset is
accepted; the generic source link is not blanket prop forwarding.

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `animated` · Popover:L29 | Prop | Existing opt-in mui-popover--animated CSS; reduced-motion respected, no leave scheduler. | 🟢 Verified |
| `arrow-point-to-center` · Popover:L30 | Prop | No exact arrow tether. | ⏭️ Intentionally omitted |
| `arrow-class` · Popover:L31 | Prop | No generated arrow element. | ⏭️ Intentionally omitted |
| `arrow-style` · Popover:L32 | Prop | No arrow style-object API. | ⏭️ Intentionally omitted |
| `arrow-wrapper-class` · Popover:L33 | Prop | No arrow wrapper. | ⏭️ Intentionally omitted |
| `arrow-wrapper-style` · Popover:L34 | Prop | No arrow-wrapper style bridge. | ⏭️ Intentionally omitted |
| `content-class` · Popover:L35 | Prop | Authored panel/content classes retained. | 🟢 Verified |
| `content-style` · Popover:L36 | Prop | External CSS/native authored attributes; no style-object forwarding. | 🟢 Verified |
| `delay` · Popover:L37 | Prop | Click-only selection disclosure, no hover delay. | ⏭️ Intentionally omitted |
| `disabled` · Popover:L38 | Prop | Native select/trigger/fieldset disabling gates/closes the composed Popover; does not silently disable form fields. | 🟢 Verified |
| `display-directive` · Popover:L39 | Prop | No if/show renderer directive; original native nodes remain. | ⏭️ Intentionally omitted |
| `duration` · Popover:L40 | Prop | No hover/focus departure scheduler. | ⏭️ Intentionally omitted |
| `flip` · Popover:L41 | Prop | Existing Popover collision flip. | 🟢 Verified |
| `footer-class` · Popover:L42 | Prop | Original footer classes. | 🟢 Verified |
| `footer-style` · Popover:L43 | Prop | External footer CSS, not object forwarding. | 🟢 Verified |
| `header-class` · Popover:L44 | Prop | Original header classes. | 🟢 Verified |
| `header-style` · Popover:L45 | Prop | External header CSS. | 🟢 Verified |
| `keep-alive-on-hover` · Popover:L46 | Prop | No hover selection mode. | ⏭️ Intentionally omitted |
| `overlap` · Popover:L47 | Prop | No overlap geometry mode. | ⏭️ Intentionally omitted |
| `placement` · Popover:L48 | Prop | Existing twelve Popover placements; bottom-start target default. | 🟢 Verified |
| `raw` · Popover:L49 | Prop | Existing authored mui-popover--raw surface class. | 🟢 Verified |
| `scrollable` · Popover:L50 | Prop | Existing native outer panel overflow, independent of native select scroll. | 🟢 Verified |
| `show-arrow` · Popover:L51 | Prop | Source Popselect explicitly excludes showArrow/arrow; no target arrow feature claim. | ⏭️ Intentionally omitted |
| `show` · Popover:L52 | Prop | Actual native show/open/close/setShow, not a parallel controlled desired state. | 🟢 Verified |
| `to` · Popover:L53 | Prop | No portal/reparenting; native top layer preserves DOM ancestry. | ⏭️ Intentionally omitted |
| `trigger` · Popover:L54 | Prop | Original native type=button popovertarget click/keyboard activation; hover/focus modes excluded. | 🟢 Verified |
| `width` · Popover:L55 | Prop | External panel sizing within base available geometry, not automatic trigger-width matching. | 🟢 Verified |
| `x` · Popover:L56 | Prop | No coordinate anchor API. | ⏭️ Intentionally omitted |
| `y` · Popover:L57 | Prop | No coordinate anchor API. | ⏭️ Intentionally omitted |
| `z-index` · Popover:L58 | Prop | Native top-layer ordering, no z-index arbitration. | ⏭️ Intentionally omitted |
| `on-clickoutside` · Popover:L59 | Callback | No fabricated dismissal reason; native toggle cannot identify every cause. | ⏭️ Intentionally omitted |
| `on-update:show` · Popover:L60 | Callback | Native beforetoggle/toggle, including programmatic changes and coalescing. | 🟢 Verified |

### Popselect inherited SelectOption Properties

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `class` · Select:L94 | Record field | Original native option classes, platform styling limits. | 🟢 Verified |
| `disabled` · Select:L95 | Record field | Native option.disabled; selection and successful FormData remain distinct. | 🟢 Verified |
| `label` · Select:L96 | Record field | Literal native option label/text, not a function renderer. | 🟢 Verified |
| `render` · Select:L97 | Record field | No VNode option rendering. | ⏭️ Intentionally omitted |
| `style` · Select:L98 | Record field | Authored/native option styling retained, browser-dependent; no object bridge. | 🟢 Verified |
| `value` · Select:L99 | Record field | Explicit unique native string, including empty string; no numeric/object conversion. | 🟢 Verified |

### Popselect inherited SelectGroupOption Properties

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `children` · Select:L105 | Record field | One native optgroup level with original option children. | 🟢 Verified |
| `label` · Select:L106 | Record field | Native nonempty optgroup.label text. | 🟢 Verified |
| `key` · Select:L107 | Record field | No group-key record model; native DOM identity remains authored. | ⏭️ Intentionally omitted |
| `render` · Select:L108 | Record field | No group renderer callback. | ⏭️ Intentionally omitted |
| `type` · Select:L109 | Record field | Actual native optgroup anatomy, not a generated type record. | 🟢 Verified |

### Source-only public types, instance methods and trigger slot

These are explicit [exports][exports], [interface][interface] and [controller][source]
supplements, not additional original Markdown rows.

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `NPopselect` · exports | Component export | createPopselect on native authored anatomy, no registration. | 🟢 Verified |
| `popselectProps` · exports | Props record | No Vue prop schema. | ⏭️ Intentionally omitted |
| `PopselectProps` · exports | Type alias | No ExtractPublicPropTypes compatibility alias. | ⏭️ Intentionally omitted |
| `PopselectSlots` · exports | Interface | Native authored regions, not VNode slot functions. | ⏭️ Intentionally omitted |
| `PopselectInst` · interface | Type alias | Independently typed native controller; source alias to PopoverInst recorded. | 🟢 Verified |
| `PopselectSize` · public-types.ts | Type alias | Source includes huge; huge/type compatibility alias intentionally excluded. | ⏭️ Intentionally omitted |
| `syncPosition` · source/interface | Method | Delegates to existing Popover positioner. | 🟢 Verified |
| `setShow` · source/interface | Method | Requests actual native visibility, no silent controlled-state model. | 🟢 Verified |
| `default` · source slots | Slot | Original stable native trigger button content. | 🟢 Verified |

### Source-only panel props and theme/injection

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `cancelable` · PopselectPanel.tsx | Prop | No repeat-option toggle-to-null; explicit native clear is the alternative. | ⏭️ Intentionally omitted |
| `showCheckmark` · PopselectPanel.tsx | Prop | Native platform selection presentation, no custom checkmark switch. | ⏭️ Intentionally omitted |
| `onUpdateValue` · PopselectPanel.tsx | Callback alias | Native events, no callback-prop alias. | ⏭️ Intentionally omitted |
| `onChange` · PopselectPanel.tsx | Deprecated callback | No deprecated callback alias. | ⏭️ Intentionally omitted |
| `onMouseenter` · PopselectPanel.tsx | Callback | Native authored listeners remain; no forwarded callback-prop API. | ⏭️ Intentionally omitted |
| `onMouseleave` · PopselectPanel.tsx | Callback | Native authored listeners remain; no forwarded callback-prop API. | ⏭️ Intentionally omitted |
| `theme` · source useTheme.props | Prop | External CSS only, no theme provider. | ⏭️ Intentionally omitted |
| `themeOverrides` · source useTheme.props | Prop | No theme object merging. | ⏭️ Intentionally omitted |
| `builtinThemeOverrides` · source useTheme.props | Prop | No builtin theme override object. | ⏭️ Intentionally omitted |
| `PopselectInjection` · interface | Interface | No injected shared selection/visibility model. | ⏭️ Intentionally omitted |
| `PopselectInjection.props` · interface | Record field | No provider prop bridge. | ⏭️ Intentionally omitted |
| `PopselectInjection.mergedThemeRef` · interface | Record field | No reactive theme ref. | ⏭️ Intentionally omitted |
| `PopselectInjection.setShow` · interface | Record field | Direct controller composition, not injected descendant APIs. | ⏭️ Intentionally omitted |
| `PopselectInjection.syncPosition` · interface | Record field | Direct Popover delegation, not an injection contract. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

See [canonical documentation](../../components/popselect.md) for exact bounded/native
contracts, required-hidden-field reveal policy and measured evidence.

[api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popselect/demos/enUS/index.demo-entry.md
[popover-api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md
[select-api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/select/demos/enUS/index.demo-entry.md
[source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popselect/src/Popselect.tsx
[panel]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popselect/src/PopselectPanel.tsx
[interface]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popselect/src/interface.ts
[exports]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popselect/index.ts
[public]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popselect/src/public-types.ts
