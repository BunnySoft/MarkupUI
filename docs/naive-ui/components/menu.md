# Menu

**🟢 Verified for retained native navigation/disclosure scope, not an ARIA menubar.**
All **48 original public owner/name/source identities** remain. Eight explicit source-only
supplements make **56 tracker rows: 36 Verified adapted targets, 20 intentional omissions**.

## Baseline and delivered boundary

Historical [navigation.ts](../../../src/components/navigation.ts) remains the legacy flat
mui-menu/mui-menu-item controller, including its old role/selection behavior. The new
[Menu helper](../../../src/components/menu/menu.ts) instead adopts a named native nav,
lists, href links, typed buttons and details/summary branches.

- **HTML:** authored navigation hierarchy, groups/dividers, string keys, native disclosure
  state and meaningful labels/icons/extras; no replacement nodes or option renderer.
- **JS:** native selection/current-choice and expanded/default keys, root accordion,
  overall disclosure collapse, vertical/horizontal shortcuts and ownership-aware refresh.
- **CSS:** independent external logical indentation, wrapping, compact/inverted/current
  presentation, hidden safety, motion/forced-colors/print treatment.
- **Evidence:** [native API/loading/limits/acceptance](../../components/menu.md),
  [demo](../../../demo/components/menu.html), [Menu tests](../../../tests/menu.test.ts),
  [shared keyboard regressions](../../../tests/dropdown.test.ts).

Dropdown's [scoped keyboard primitive](../../../src/components/dropdown/keyboard.ts) is
reused without roving tabindex writes; ordinary navigation Tab order remains. Menu/menubar/
menuitem roles are not assigned. Popup command menus remain the separate Dropdown scope.

## Upstream implementation evidence

Pinned [Menu state/expansion/showOption](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/src/Menu.tsx#L52-L354)
and [option/instance interfaces](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/src/interface.ts)
were read with the public Markdown. Upstream merges controlled/default props, uses a tree
model and renderer, coordinates collapsed state with Layout Sider, and packs horizontal
overflow. Its accordion logic targets first-level keys; showOption expands ancestors.

The native target keeps useful navigation/state behavior but deliberately uses in-flow
horizontal details, an actual overall disclosure instead of an icon rail, and CSS wrapping
instead of overflow packing. Those are explicit adaptations, not framework/renderer parity.

## Migration steps

**Delivery phase:** P3 — navigation. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native actions and Dropdown's scoped keyboard primitive.
**Next task:** Tabs, then Collapse and remaining P3; P3 is not complete.

1. [x] **Define keyed item anatomy.** Preserve native links/buttons/summary and map groups,
   dividers, disabled/inert and text/icon/extra records to authored structure.
2. [x] **Complete retained keyboard behavior.** Native navigation keeps all Tab stops;
   optional level shortcuts/typeahead/logical direction and safe collapse focus are accepted.
3. [x] **Stage nested display.** Native expanded/default keys, root accordion, showOption,
   overall collapse and in-flow horizontal layout accepted; popup/icon-rail modes excluded.
4. [x] **Verify item mutations.** Reorder/removal/disabled focus, live refresh, native state
   persistence, no fake user notifications and preserved route semantics verified.

### Native primitives and fallback

Native nav/lists/links/details/summary remain usable without scripting. The optional helper
adds state/shortcuts, not required route access or a hidden option tree. No ARIA command-menu
role is used with incomplete keyboard behavior. No positioning engine is needed for this
retained in-flow scope; Dropdown/Popover forwarding, renderer/theme provider and automatic
overflow are explicit omissions.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/menu)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **48 local rows + 8 source-only additions + 0 inherited = 56**.
Reference-style links preserve each original identity. **ADAPTED** means the linked native
scope has evidence, not identical Vue props/defaults/numeric option objects or callbacks.
Referenced [Dropdown](dropdown.md) props remain a composition reference, not inherited support.

### Menu Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`accordion`][a31] | Prop | ADAPTED root-level native disclosure exclusivity. | 🟢 Verified | Scoped native names/open-mutation fallback; nested flags remain independent. |
| [`children-field`][a32] | Prop | No object-field alias. | ⏭️ Intentionally omitted | Authored hierarchy, not option-tree lookup. |
| [`collapsed-icon-size`][a33] | Prop | No icon-only collapsed rail. | ⏭️ Intentionally omitted | Meaningful native overall summary; ordinary icon CSS instead. |
| [`collapsed-width`][a34] | Prop | ADAPTED external overall-disclosure width token. | 🟢 Verified | Not upstream icon-rail geometry; labels remain available. |
| [`collapsed`][a35] | Prop | ADAPTED actual optional overall details closed state. | 🟢 Verified | Both native layouts supported; not vertical-only width collapse or provider state. |
| [`default-expand-all`][a36] | Prop | ADAPTED one-time expansion of eligible branches. | 🟢 Verified | Contradictory root accordion requests reject; no async default watcher. |
| [`default-expanded-keys`][a37] | Prop | ADAPTED one-time string branch defaults. | 🟢 Verified | Explicit live keys win; absent options preserve authored open. |
| [`default-value`][a38] | Prop | ADAPTED one-time native leaf default. | 🟢 Verified | Live value wins; refresh/reconnect never replay it. |
| [`disabled-field`][a39] | Prop | No option-field alias. | ⏭️ Intentionally omitted | Native disabled buttons and inert/hidden availability. |
| [`dropdown-placement`][a40] | Prop | No popup horizontal submenu positioning. | ⏭️ Intentionally omitted | Horizontal details expand in flow; popup commands use Dropdown. |
| [`dropdown-props`][a41] | Prop | No Dropdown prop forwarding. | ⏭️ Intentionally omitted | No mandatory popup/controller/theme dependency. |
| [`expanded-keys`][a42] | Prop | ADAPTED actual native branch open keys. | 🟢 Verified | Validated unique strings; native toggle events, not controlled Vue state. |
| [`expand-icon`][a43] | Prop | ADAPTED native summary marker/authored decoration. | 🟢 Verified | No VNode render callback or injected icon. |
| [`icon-size`][a44] | Prop | ADAPTED external icon-size token. | 🟢 Verified | Authored native icon content, no Icon component dependency. |
| [`indent`][a45] | Prop | ADAPTED CSS logical branch indentation. | 🟢 Verified | No measured inline style generator. |
| [`inverted`][a46] | Prop | ADAPTED inverted CSS class/tokens. | 🟢 Verified | External presentation and forced colors. |
| [`key-field`][a47] | Prop | No object key-field alias. | ⏭️ Intentionally omitted | Explicit string data-menu-key only. |
| [`label-field`][a48] | Prop | No object label-field alias. | ⏭️ Intentionally omitted | Native text/ARIA/data-menu-label policy. |
| [`options`][a49] | Prop | ADAPTED native authored keyed hierarchy. | 🟢 Verified | No duplicate option tree, constructor or renderer. |
| [`node-props`][a50] | Prop | No attribute-generator function. | ⏭️ Intentionally omitted | Author native attributes directly. |
| [`mode`][a51] | Prop | ADAPTED vertical/horizontal in-flow navigation. | 🟢 Verified | Logical shortcuts and CSS wrapping; no fake menubar roles. |
| [`render-extra`][a52] | Prop | ADAPTED authored extra content. | 🟢 Verified | No VNode callback or generated node. |
| [`render-icon`][a53] | Prop | ADAPTED authored icons. | 🟢 Verified | Native labels and explicit decoration semantics. |
| [`render-label`][a54] | Prop | ADAPTED native label/markup. | 🟢 Verified | Original nodes/listeners preserved; no unsafe HTML parsing. |
| [`responsive`][a55] | Prop | No automatic overflow packing. | ⏭️ Intentionally omitted | CSS wrapping is layout, not a controlled collapse callback. |
| [`root-indent`][a56] | Prop | ADAPTED CSS logical root padding. | 🟢 Verified | Separate root/branch tokens; no source default parity. |
| [`value`][a57] | Prop | ADAPTED string/null visual leaf value. | 🟢 Verified | Silent setter; no aria-selected/checked or route/aria-current rewrite. |
| [`watch-props`][a58] | Prop | No framework default watching. | ⏭️ Intentionally omitted | Defaults consumed once; native state and explicit setters thereafter. |
| [`on-update:expanded-keys`][a59] | Callback | ADAPTED native disclosure toggle observation. | 🟢 Verified | Read actual expandedKeys; native events also occur for programmatic changes, not fabricated user callbacks. |
| [`on-update:value`][a60] | Callback | ADAPTED mui:menu-select native leaf notification. | 🟢 Verified | String/DOM/path detail after cancellation checks; no raw option callback array. |

### MenuOption Properties

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`children?`][a66] | Record field | ADAPTED details/summary and nested native list. | 🟢 Verified | Stable authored hierarchy, no tree renderer. |
| [`disabled?`][a67] | Record field | ADAPTED native disabled buttons/inert branches. | 🟢 Verified | Inert uses native accessibility exclusion; no fake disabled live link. |
| [`extra?`][a68] | Record field | ADAPTED authored extra span/content. | 🟢 Verified | Explicit typeahead label when visual extras affect textContent. |
| [`icon?`][a69] | Record field | ADAPTED authored decorative icon. | 🟢 Verified | No icon/VNode function or hidden duplicate label. |
| [`key`][a70] | Record field | ADAPTED unique nonempty string data-menu-key. | 🟢 Verified | Numeric/object coercion and generated keys excluded. |
| [`label`][a71] | Record field | ADAPTED native text/ARIA/search-label metadata. | 🟢 Verified | Accessible names remain authored. |
| [`show?`][a72] | Record field | ADAPTED native hidden/inert/CSS availability. | 🟢 Verified | Hidden rules respected; refresh repairs unavailable focus. |

### MenuGroupOption Properties

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`children`][a78] | Record field | ADAPTED native grouped lists. | 🟢 Verified | Group labels are not action/focus targets. |
| [`key`][a79] | Record field | ADAPTED unique string group identity. | 🟢 Verified | Structure only, not a selectable value. |
| [`label`][a80] | Record field | ADAPTED explicit native group name/label. | 🟢 Verified | No label renderer or automatic naming. |
| [`show?`][a81] | Record field | ADAPTED native hidden group. | 🟢 Verified | Descendant availability follows native ancestors. |
| [`type`][a82] | Record field | ADAPTED named ul/ol[data-menu-group]. | 🟢 Verified | Native list semantics, not an option discriminator object. |

### MenuDividerOption Properties

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`key`][a88] | Record field | ADAPTED unique string divider identity. | 🟢 Verified | Nonselectable, not a generated node key. |
| [`props`][a89] | Record field | No HTMLAttributes object forwarding. | ⏭️ Intentionally omitted | Ordinary native attributes/classes instead. |
| [`show?`][a90] | Record field | ADAPTED native hidden. | 🟢 Verified | No focusable invisible separator. |
| [`type`][a91] | Record field | ADAPTED noninteractive li[data-menu-divider]. | 🟢 Verified | External border/spacing, no action behavior. |

### Menu Methods

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`deriveResponsiveState`][a97] | Method | No overflow-pack recalculation. | ⏭️ Intentionally omitted | Native CSS wraps; refresh updates bindings, not a packing algorithm. |
| [`showOption`][a98] | Method | ADAPTED reveal by existing string key/current leaf. | 🟢 Verified | Expand native ancestors, no route/selection/target-focus change; numeric input excluded. |

### Source-only supplements — eight explicit groups

These additions record source findings without changing or dropping original public rows.
They are not an exhaustive promise of private framework-member compatibility.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`disabled`, `show`][s111] | Source-only root props | No extra JS root visibility/disabled prop layer. | ⏭️ Intentionally omitted | Native hidden/inert and explicit disclosure instead. |
| [`onUpdateValue`, `onUpdateExpandedKeys`, `onSelect`, `onOpenNamesChange`, `onExpandedNamesChange`][s120] | Source-only callback aliases | No alias/array compatibility. | ⏭️ Intentionally omitted | Native toggle and explicit leaf notification are independent contracts. |
| [`items`, `expandedNames`, `defaultExpandedNames`][s140] | Source-only deprecated state group | No old option/default aliases. | ⏭️ Intentionally omitted | Authored hierarchy and validated native setters. |
| [`Key`, `MenuOptionSharedPart`, `MenuRenderOption`, `name/title/titleExtra` fallbacks][types] | Source-only type/record differences | No numeric/optional key, arbitrary prop index or renderer/deprecated-field forwarding. | ⏭️ Intentionally omitted | Required string/native anatomy; name fallback also appears in Menu.tsx tree lookup. |
| [`MenuSetupProps`, `MenuProps`, `MenuInst`, update callback types][s150] | Source-only framework type group | No extracted Vue instance/prop aliases. | ⏭️ Intentionally omitted | Native controller/options/selection types are explicit. |
| [`useTheme.props`, `useConfig`, `useThemeClass`, `cssVars`][s53] | Source-only theme/style group | No provider or CSS-in-JS renderer. | ⏭️ Intentionally omitted | External CSS/tokens; style computation at source line 356 onward. |
| [`layoutSiderInjectionKey` / merged collapsed state][s172] | Source-only layout coordination | No implicit Layout Sider coupling. | ⏭️ Intentionally omitted | Authored native overall disclosure, independent mode/state. |
| [`VOverflow`, `VResizeObserver` / responsive packing][s650] | Source-only overflow engine | No automatic hidden overflow bucket. | ⏭️ Intentionally omitted | In-flow wrapping keeps destinations accessible. |

[a31]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L31
[a32]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L32
[a33]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L33
[a34]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L34
[a35]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L35
[a36]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L36
[a37]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L37
[a38]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L38
[a39]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L39
[a40]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L40
[a41]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L41
[a42]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L42
[a43]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L43
[a44]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L44
[a45]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L45
[a46]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L46
[a47]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L47
[a48]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L48
[a49]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L49
[a50]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L50
[a51]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L51
[a52]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L52
[a53]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L53
[a54]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L54
[a55]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L55
[a56]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L56
[a57]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L57
[a58]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L58
[a59]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L59
[a60]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L60
[a66]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L66
[a67]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L67
[a68]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L68
[a69]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L69
[a70]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L70
[a71]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L71
[a72]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L72
[a78]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L78
[a79]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L79
[a80]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L80
[a81]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L81
[a82]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L82
[a88]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L88
[a89]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L89
[a90]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L90
[a91]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L91
[a97]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L97
[a98]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L98
[s111]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/src/Menu.tsx#L111-L115
[s120]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/src/Menu.tsx#L120-L145
[s140]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/src/Menu.tsx#L140-L147
[types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/src/interface.ts#L4-L89
[s150]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/src/Menu.tsx#L150-L152
[s53]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/src/Menu.tsx#L53
[s172]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/src/Menu.tsx#L172-L187
[s650]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/src/Menu.tsx#L650-L666

<!-- END PINNED API INVENTORY -->
