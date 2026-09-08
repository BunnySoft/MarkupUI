# Dropdown

**🟢 Verified for the retained native command-menu scope.**
All **69 original identities** remain: 35 public table rows, three existing declarations/
exclusions and 31 inherited Popover rows. Six explicit source-only supplements make
**75 rows: 42 Verified adapted targets, 33 intentional omissions**.

## Baseline and delivery

Historical [navigation.ts](../../../src/components/navigation.ts) and
[overlays.ts](../../../src/components/overlays.ts) remain legacy baselines, not this migration.
The new [Dropdown controller](../../../src/components/dropdown/dropdown.ts) adopts native
lists/buttons/links and reuses Popover. Its [scoped keyboard primitive](../../../src/components/dropdown/keyboard.ts)
owns only roving/typeahead and is reusable by the next Menu consumer, not a menu framework.

- **HTML:** authored UL/OL/li action lists, string keys, groups/dividers and native nested
  popovertarget submenus. Menu roles are added only for supported enhancement.
- **JS:** complete retained scoped keyboard/activation, pointer submenu intent, selection
  notification, refresh/lifecycle ownership and native hierarchy dismissal.
- **CSS:** complete external Dropdown CSS, composed from maintained Popover styles.
- **Evidence:** [loading/API/limits/acceptance](../../components/dropdown.md),
  [native demo](../../../demo/components/dropdown.html),
  [Dropdown tests](../../../tests/dropdown.test.ts), [shared clipping regression](../../../tests/popover.test.ts).

Native href/target/defaultPrevented semantics and native button types remain authoritative.
No provider, option renderer, positioning/menu package, data-tree copy, router or CSS-in-JS
is introduced. Unsupported/no-JS behavior is an ordinary navigable list/disclosure, not a
menu role lacking keyboard support.

## Upstream implementation evidence

Pinned [Dropdown state/keyboard/value](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/src/Dropdown.tsx#L69-L339),
[option/submenu behavior](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/src/DropdownOption.tsx#L92-L223),
[interface aliases](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/src/interface.ts)
and public Markdown were reviewed during this migration. The original shared
[Popover review](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L269-L446)
remains provenance.

Upstream uses tree/renderer/injection/keyboard dependencies and floating VNodes. Native
authored hierarchy replaces those, with explicit keyboard and callback-shape differences.
This is a retained-scope review, not an exhaustive compatibility promise.

## Migration steps

**Delivery phase:** P3 — interactions. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** accepted Popover behavior; this component supplies the first scoped
roving/typeahead primitive for Menu rather than assuming legacy Menu is already complete.
**Next task:** Menu, separately. Overall P3 remains in progress.

1. [x] **Define option anatomy.** Native command/link items, string identity, named groups,
   separators, authored labels/icons and explicit renderer exclusions accepted.
2. [x] **Compose floating behavior.** Reuse native Popover/positioning/CSS without raw or
   unrestricted prop forwarding; fix the concrete deep top-layer clipping boundary.
3. [x] **Add hierarchical navigation.** First/last entry, arrows/Home/End/typeahead, native
   activation, logical submenu arrows, child-first Escape, Tab and pointer intent accepted.
4. [x] **Verify ownership boundaries.** Native modifiers/cancellation/forms, selection,
   reentrant disposal, refresh/hidden/disabled changes, fallback and cleanup have evidence.

### Native primitives and fallback

Native auto popovers retain top-layer/peer/ancestor ownership. A small controller supplies
scoped command-menu behavior; plain HTML lists retain native destinations when enhancement
is absent. Only missing anchor Space activation is bridged; native buttons/Enter are not
double-synthesized. No Shadow DOM, teleport, option renderer or app store is used.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/dropdown)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **35 local rows + 3 original supplements + 6 source-only additions + 31 inherited = 75**.
Reference definitions preserve original owner/name/source-line identities.
**ADAPTED** means the linked native contract has evidence, not identical Vue props, numeric
keys/raw option objects, defaults or callbacks. Omitted rows receive no implementation credit.

### Dropdown Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`animated`][d28] | Prop | ADAPTED optional shared appearance class. | 🟢 Verified | External CSS/reduced motion, not a transition engine/default prop. |
| [`inverted`][d29] | Prop | ADAPTED `.mui-dropdown--inverted` and inherited CSS tokens. | 🟢 Verified | No provider/theme injection. |
| [`children-field`][d30] | Prop | No object-field alias. | ⏭️ Intentionally omitted | Authored nested lists define hierarchy. |
| [`keyboard`][d31] | Prop | ADAPTED complete retained menu keyboard, always enabled with menu roles. | 🟢 Verified | keyboard=false rejected; ordinary list fallback has no fake menu semantics. |
| [`key-field`][d32] | Prop | No object-field alias. | ⏭️ Intentionally omitted | Explicit string data-dropdown-key. |
| [`label-field`][d33] | Prop | No object-field alias. | ⏭️ Intentionally omitted | Authored text/ARIA or explicit typeahead label metadata. |
| [`node-props`][d34] | Prop | No option-to-HTML-attributes generator. | ⏭️ Intentionally omitted | Native attributes/classes remain authored. |
| [`menu-props`][d35] | Prop | No menu attribute generator/raw option callback. | ⏭️ Intentionally omitted | Named native menu lists and direct CSS/ARIA instead. |
| [`options`][d36] | Prop | ADAPTED authored item/group/divider/submenu schema. | 🟢 Verified | No duplicate option array/tree; refresh rebuilds bindings, not nodes. |
| [`render-icon`][d37] | Prop | ADAPTED authored icon markup. | 🟢 Verified | No VNode callback or icon dependency. |
| [`render-label`][d38] | Prop | ADAPTED authored native label content. | 🟢 Verified | Explicit text-search policy; no HTML string parser. |
| [`render-option`][d39] | Prop | No whole-option VNode renderer. | ⏭️ Intentionally omitted | One native action per menuitem; arbitrary widgets rejected. |
| [`size`][d40] | Prop | ADAPTED small/default medium/large/huge CSS classes. | 🟢 Verified | Tokens cascade to submenus; no JS prop/style forwarding. |
| [`on-clickoutside`][d41] | Callback | No outside-reason callback. | ⏭️ Intentionally omitted | Native dismissal, not a duplicated global click engine. |
| [`on-select`][d42] | Callback | ADAPTED mui:dropdown-select DOM notification. | 🟢 Verified | String key, DOM item/path/native event after accepted leaf activation; not raw option/numeric callback parity. |

### DropdownOption Type

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`children?`][d50] | Record field | ADAPTED native nested submenu lists/invokers. | 🟢 Verified | Authored DOM ancestry, native top layer and logical arrows. |
| [`disabled?`][d51] | Record field | ADAPTED native disabled buttons. | 🟢 Verified | Skip navigation/activation; aria-disabled live links rejected rather than stripping href. |
| [`icon?`][d52] | Record field | ADAPTED authored decorative markup. | 🟢 Verified | Explicit search label for complex icons; no renderer. |
| [`key?`][d53] | Record field | ADAPTED required unique string item key. | 🟢 Verified | No numeric/object coercion or generated identity. |
| [`label?`][d54] | Record field | ADAPTED native text/ARIA/data-dropdown-label. | 🟢 Verified | Explicit typeahead input and retained original nodes. |
| [`props?`][d55] | Record field | No HTMLAttributes object passthrough. | ⏭️ Intentionally omitted | Author validated native attributes on the item. |
| [`show?`][d56] | Record field | ADAPTED native hidden and refresh policy. | 🟢 Verified | Hidden styles respected; skip unavailable entries and recover lost focus. |

### DropdownDividerOption Type

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`key?`][d62] | Record field | ADAPTED optional authored ID, not a selectable key. | 🟢 Verified | No divider option-record identity service. |
| [`show?`][d63] | Record field | ADAPTED native hidden. | 🟢 Verified | No focus/selection on separators. |
| [`type`][d64] | Record field | ADAPTED li[data-dropdown-divider]. | 🟢 Verified | Owned separator role and external CSS. |

### DropdownGroupOption Type

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`children?`][d70] | Record field | ADAPTED authored grouped native items. | 🟢 Verified | No second data tree; DOM order determines navigation. |
| [`icon?`][d71] | Record field | ADAPTED authored group-label icon. | 🟢 Verified | Noninteractive decoration and explicit ARIA. |
| [`label?`][d72] | Record field | ADAPTED explicit group name/visible label. | 🟢 Verified | Group headers never become roving targets. |
| [`key?`][d73] | Record field | ADAPTED optional native ID. | 🟢 Verified | Groups are not selectable value keys. |
| [`show?`][d74] | Record field | ADAPTED native hidden ancestor. | 🟢 Verified | Group descendants skipped; close-and-refresh lifecycle documented. |
| [`type`][d75] | Record field | ADAPTED named ul/ol[data-dropdown-group]. | 🟢 Verified | Owned group role and native li structure. |

### DropdownRenderOption Type

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`key?`][d81] | Record field | No render-option record identity. | ⏭️ Intentionally omitted | Use ordinary group/separator or a real action item. |
| [`render?`][d82] | Record field | No arbitrary VNode/widget renderer. | ⏭️ Intentionally omitted | Inputs and nested interactive roots are not menuitems. |
| [`show?`][d83] | Record field | No render-option visibility API. | ⏭️ Intentionally omitted | Native hidden exists without reproducing this record type. |
| [`type`][d84] | Record field | No render sentinel record. | ⏭️ Intentionally omitted | Static native presentation is not a render-option engine. |

### Inherited exclusion

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`raw`][d44] | Excluded prop | Explicitly unavailable upstream and not a Dropdown option. | ⏭️ Intentionally omitted | No implementation credit; author CSS remains separate. |

### Dropdown Props: render-option inline fields

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`render-option.node`][d39] | Inline record field | No VNode argument. | ⏭️ Intentionally omitted | Native DOM item references are a different notification contract. |
| [`render-option.option`][d39] | Inline record field | No raw renderer option argument. | ⏭️ Intentionally omitted | String/native item identity instead of object forwarding. |

### Dropdown inherited Popover Props

Inherited from [Popover Props](popover.md#popover-props), excluding raw as the original page
specifies. Local/native Dropdown semantics are reviewed independently below.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`animated`][p29] | Prop | ADAPTED optional shared appearance CSS. | 🟢 Verified | Original inherited row retained separately from local override. |
| [`arrow-point-to-center`][p30] | Prop | No exact trigger-center tether. | ⏭️ Intentionally omitted | Decorative shared inset indicator only. |
| [`arrow-class`][p31] | Prop | ADAPTED author class styling shared pseudo-element. | 🟢 Verified | No generated arrow node. |
| [`arrow-style`][p32] | Prop | ADAPTED external arrow CSS. | 🟢 Verified | No style-object passthrough. |
| [`arrow-wrapper-class`][p33] | Prop | No arrow wrapper. | ⏭️ Intentionally omitted | Author surface CSS instead. |
| [`arrow-wrapper-style`][p34] | Prop | No wrapper-style forwarding. | ⏭️ Intentionally omitted | No invented wrapper API. |
| [`content-class`][p35] | Prop | ADAPTED authored menu/item classes. | 🟢 Verified | Retained native hierarchy and CSS ownership. |
| [`content-style`][p36] | Prop | ADAPTED external content CSS. | 🟢 Verified | No inline CSS string/object renderer. |
| [`delay`][p37] | Prop | ADAPTED submenuDelay pointer intent, 100ms default. | 🟢 Verified | Root hover excluded; submenu timing is explicitly different. |
| [`disabled`][p38] | Prop | ADAPTED live root controller.disabled. | 🟢 Verified | Closes/refuses menus without overwriting native item state. |
| [`display-directive`][p39] | Prop | No framework if/show renderer. | ⏭️ Intentionally omitted | Native visibility keeps original nodes. |
| [`duration`][p40] | Prop | ADAPTED submenuDuration gap delay, 150ms default. | 🟢 Verified | Not an animation duration or root hover prop. |
| [`flip`][p41] | Prop | ADAPTED shared viewport flip/clamp. | 🟢 Verified | Native anchors and explicit local fallback. |
| [`footer-class`][p42] | Prop | No compound footer API. | ⏭️ Intentionally omitted | Groups/items, not a rich Popover footer. |
| [`footer-style`][p43] | Prop | No footer-style forwarding. | ⏭️ Intentionally omitted | External native list styling instead. |
| [`header-class`][p44] | Prop | No compound header API. | ⏭️ Intentionally omitted | Named menu/group labels have their own native contract. |
| [`header-style`][p45] | Prop | No header-style forwarding. | ⏭️ Intentionally omitted | No fake header region renderer. |
| [`keep-alive-on-hover`][p46] | Prop | ADAPTED submenu pointer/focus retention. | 🟢 Verified | No early-dismiss false mode; focused sibling is not replaced by hover. |
| [`overlap`][p47] | Prop | No trigger-overlap mode. | ⏭️ Intentionally omitted | Explicit gap and viewport boundary instead. |
| [`placement`][p48] | Prop | ADAPTED root placement and logical child placement. | 🟢 Verified | Twelve root positions; child inline-end/flip; refresh after direction changes. |
| [`scrollable`][p50] | Prop | ADAPTED native menu overflow. | 🟢 Verified | Keyboard navigation and explicit container tabindex prevent accidental Tab stops. |
| [`show-arrow`][p51] | Prop | ADAPTED opt-in shared indicator class. | 🟢 Verified | Not a generated submenu icon or source default parity. |
| [`show`][p52] | Prop | ADAPTED actual native show and explicit controller requests. | 🟢 Verified | Cancel/coalesced native events; no controlled/default framework state. |
| [`to`][p53] | Prop | No teleport/portal target. | ⏭️ Intentionally omitted | Authored nested DOM and native top layer. |
| [`trigger`][p54] | Prop | ADAPTED native click/keyboard menu button plus imperative open. | 🟢 Verified | Root hover/focus/manual-only modes excluded; native click commands are not duplicated. |
| [`width`][p55] | Prop | ADAPTED external width/max-width. | 🟢 Verified | Viewport safety; no automatic trigger-width mode. |
| [`x`][p56] | Prop | No virtual/manual x anchor. | ⏭️ Intentionally omitted | Real trigger geometry only. |
| [`y`][p57] | Prop | No virtual/manual y anchor. | ⏭️ Intentionally omitted | No context-menu coordinate framework. |
| [`z-index`][p58] | Prop | No global top-layer order service. | ⏭️ Intentionally omitted | Native auto-popover hierarchy. |
| [`on-clickoutside`][p59] | Callback | No invented outside-reason callback. | ⏭️ Intentionally omitted | Original inherited identity retained despite local duplicate. |
| [`on-update:show`][p60] | Callback | ADAPTED native beforetoggle/toggle observation. | 🟢 Verified | No callback arrays/silent setter parity. |

### Source-only supplements — six explicit additions

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`value`][s106] | Source-only prop | ADAPTED string/null visual leaf choice. | 🟢 Verified | Silent owned marker; no numeric/branch/check-state parity. |
| [`default`][s493] | Source-only trigger slot | ADAPTED explicit native trigger argument. | 🟢 Verified | Source default slot supplies Popover trigger, not rendered menu content. |
| [`DropdownProps`, `DropdownInjection`, context keys][s48] | Source-only Vue type/injection group | No extracted-prop/provider aliases. | ⏭️ Intentionally omitted | DropdownProps is at line 119; native controller is independent. |
| [`DropdownSize`][size1] | Source-only type alias | No additional JS size-option type. | ⏭️ Intentionally omitted | Four CSS sizes are verified in the original size row. |
| [`DropdownOption` aliases, `NodeProps`, `DropdownMenuProps`, `OnUpdateValue`, `RenderIcon`, `RenderLabel`, `RenderOption`][interfaces] | Source-only interface/helper group | No Menu/VNode/tree/attribute-generator aliases. | ⏭️ Intentionally omitted | Original fields retained; native events use explicit string/DOM shapes. |
| [`popoverBaseProps` extras, `useTheme.props`][s114] | Source-only private/theme group | No defaultShow/deprecated/internal render/trap/theme forwarding. | ⏭️ Intentionally omitted | Original inherited public rows remain separate; no provider or CSS-in-JS. |

[d28]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L28
[d29]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L29
[d30]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L30
[d31]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L31
[d32]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L32
[d33]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L33
[d34]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L34
[d35]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L35
[d36]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L36
[d37]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L37
[d38]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L38
[d39]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L39
[d40]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L40
[d41]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L41
[d42]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L42
[d44]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L44
[d50]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L50
[d51]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L51
[d52]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L52
[d53]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L53
[d54]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L54
[d55]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L55
[d56]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L56
[d62]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L62
[d63]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L63
[d64]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L64
[d70]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L70
[d71]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L71
[d72]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L72
[d73]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L73
[d74]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L74
[d75]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L75
[d81]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L81
[d82]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L82
[d83]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L83
[d84]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/demos/enUS/index.demo-entry.md#L84
[p29]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L29
[p30]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L30
[p31]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L31
[p32]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L32
[p33]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L33
[p34]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L34
[p35]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L35
[p36]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L36
[p37]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L37
[p38]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L38
[p39]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L39
[p40]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L40
[p41]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L41
[p42]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L42
[p43]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L43
[p44]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L44
[p45]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L45
[p46]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L46
[p47]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L47
[p48]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L48
[p50]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L50
[p51]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L51
[p52]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L52
[p53]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L53
[p54]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L54
[p55]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L55
[p56]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L56
[p57]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L57
[p58]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L58
[p59]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L59
[p60]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L60
[s106]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/src/Dropdown.tsx#L106
[s493]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/src/Dropdown.tsx#L493
[s48]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/src/Dropdown.tsx#L48-L68
[size1]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/src/public-types.ts#L1
[interfaces]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/src/interface.ts#L12-L79
[s114]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dropdown/src/Dropdown.tsx#L114-L116

<!-- END PINNED API INVENTORY -->
