# Legacy Transfer

**Resolved deprecated-API lane / verified native replacement.** Existing native
Transfer supplies explicit membership/staging/lock/filter/form ownership, not a
resurrected constructor, legacy object ABI, provider or virtual renderer.

## Baseline and resolution

Use the unchanged [native helper](../../../src/components/transfer/transfer.ts) and
[CSS](../../../src/components/transfer/transfer.css), with their
[accepted modern contract](../../components/transfer.md). The
[canonical migration](../../components/legacy-transfer.md),
[local HTML](../../../demo/components/legacy-transfer.html),
[CSS](../../../demo/components/legacy-transfer.css), [application JS](../../../demo/components/legacy-transfer.js)
and [tests](../../../tests/legacy-transfer.test.ts) add no library runtime/export.
Existing widgets-plugin MuiTransfer remains separate from the deprecated source API.

Reviewed pinned [props/model/callbacks](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/Transfer.tsx#L26-L220),
[rendering](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/Transfer.tsx#L299-L407),
[data/staging](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/use-transfer-data.ts),
[interfaces](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/interface.ts)
and [public exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/index.ts#L1-L6).
The root exposes no public slots; internal icon slots/provider renderEmpty do not
become public native APIs. Native option nodes replace data/rendering machinery.

## Migration steps

**Delivery lane:** deferred/exclusions — deprecated Transfer API.
**Task state:** resolved migration / 🟢 Verified native replacement.
**Prerequisites:** accepted native Transfer; broad P0 foundation rows stay unchanged.
**Next:** catalog resolution audit complete; parent-owned foundations remain separately pending.

1. [x] **Retain the inventory.** All original props/callback/option fields and explicit
   source/type/theme additions have precise native mapping or omission.
2. [x] **Map semantics.** Target membership versus staging, strict string keys,
   locks/filter scope/order/default/reset and actual exclusive FormData ownership.
3. [x] **Reuse, not duplicate.** Existing helper/CSS only; local application wiring,
   no deprecated alias/export, renderer, numeric/object adapter or dependency.
4. [x] **Verify the replacement.** Native actions/keyboard/labels/focus/forms/disabled/
   filtering/reset/no-JS/CSP/coexistence, targeted tests/build and final catalog audit.

### Native primitives and fallback

Two real labelled unnamed multi-selects hold original options; native highlights
stage moves, while all target options are membership. Explicitly reserved formdata
ownership writes membership, not selectedOptions or hidden proxies. Real buttons,
search inputs, fieldset disabling and native reset remain visible contracts.
Without JS/required native formdata support, only static lists/highlights remain:
move/filter/membership-reset/serialization controls stay hidden. Disconnect retains
current nodes but releases the enhanced lifetime. No public legacy slot is invented.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/legacy-transfer)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **16 original rows + three grouped type/export supplements + seven
source supplements + three inherited theme rows = 29 rows**.
Every original section/member/source identity remains.
**15 verified native replacements + 14 omissions; zero unresolved.**
These are explicit target capabilities, not deprecated prop/callback/data-shape parity.

### Transfer Props

| Upstream item · source | Kind | Native replacement / explicit omission | Status |
| --- | --- | --- | --- |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L28) | Prop | Initial target membership or explicit defaultValue; setDefaultValue changes future native membership reset, separately from defaultSelected staging. Strict string keys. | 🟢 Verified |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L29) | Prop | Native fieldset/pane disabling suppresses user moves/wire values without deleting membership. Source Markdown true conflicts with source undefined/form-provider fallback; no implicit true default copied. | 🟢 Verified |
| [`filterable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L30) | Prop | Author optional labelled source/target search controls; native literal label matching, no legacy Boolean prop/parser. | 🟢 Verified |
| [`filter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L31) | Prop | No pattern/option/from callback or renderer predicate pipeline. Use the explicitly bounded native label filter. | ⏭️ Intentionally omitted |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L32) | Prop | Original bounded plain native option nodes, not an accepted legacy object array. Application authors/updates data then refreshes. | 🟢 Verified |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L33) | Prop | Existing data-transfer-size small/medium/large CSS; native select.size is distinct. No provider item-height/theme parity. | 🟢 Verified |
| [`source-filter-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L34) | Prop | Authored placeholder on the labelled native source search input. | 🟢 Verified |
| [`source-title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L35) | Prop | Original source heading/label; no locale-provider fallback. | 🟢 Verified |
| [`target-filter-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L36) | Prop | Authored placeholder on the labelled native target search input. | 🟢 Verified |
| [`target-title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L37) | Prop | Original target heading/label; no renderer or source empty-string fallback. | 🟢 Verified |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L38) | Prop | All target keys in DOM order, not highlights. setValue sets exact validated order silently; no controlled Vue model or implicit numeric coercion. | 🟢 Verified |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L39) | Callback | Root-local non-bubbling mui:transfer-change after a user move, with value/moved/to/event detail; programmatic/reset operations are silent. Not the legacy callback-array ABI. | 🟢 Verified |
| [`virtual-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L40) | Prop | No virtualized item/Scrollbar renderer; all at-most-2,000 native options remain mounted. | ⏭️ Intentionally omitted |

### TransferOption Type

| Upstream item · source | Kind | Native replacement / explicit omission | Status |
| --- | --- | --- | --- |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L46) | Record field | Literal native option text/label with bounded length; no VNode label. | 🟢 Verified |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L47) | Record field | Unique nonempty native string key. Old numeric/string identifiers require explicit collision-free application conversion before authoring. | 🟢 Verified |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L48) | Record field | Native option.disabled locks membership, including setters. Locked target keys still serialize when the unit is enabled. | 🟢 Verified |

### Explicit grouped types/exports

| Upstream item · source | Kind | Native replacement / explicit omission | Status |
| --- | --- | --- | --- |
| [`NLegacyTransfer / legacyTransferProps / LegacyTransferProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/index.ts#L2-L6) | Source type/export group | No deprecated component, prop object/type alias or compatibility namespace. Use existing modern Transfer exports explicitly. | ⏭️ Intentionally omitted |
| [`LegacyTransferOption / Option / OptionValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/interface.ts#L6-L11) | Source type/export group | No legacy object/numeric union export or adapter; explicit native nodes/string identifiers. Public alias is linked in the source index. | ⏭️ Intentionally omitted |
| [`Filter / OnUpdateValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/interface.ts#L19-L43) | Source type group | No legacy filter/callback signatures; native filter and root-local event detail are distinct contracts. | ⏭️ Intentionally omitted |

### Explicit source aliases and behavior supplements

| Upstream item · source | Kind | Native replacement / explicit omission | Status |
| --- | --- | --- | --- |
| [`onUpdateValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/Transfer.tsx#L62) | Source alias | No duplicate callback alias/array invocation; one native movement event. | ⏭️ Intentionally omitted |
| [`onChange`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/Transfer.tsx#L63-L79) | Deprecated source alias | No deprecated callback warning/alias pipeline. | ⏭️ Intentionally omitted |
| [`srcCheckedValues / tgtCheckedValues`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/use-transfer-data.ts#L71-L74) | Source behavior | Native staging flags separate from target membership; clear staging/filtering do not remove membership. | 🟢 Verified |
| [`controlled map / option projection`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/use-transfer-data.ts#L18-L35) | Source behavior | No reactive object map, duplicate-last-wins projection or missing-value renderer. Native keys/data validate before movement. | ⏭️ Intentionally omitted |
| [`prepend checked keys / clear staging`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/Transfer.tsx#L194-L205) | Source behavior | Source prepend-and-clear algorithm omitted; native moves append in origin order and preserve selected/defaultSelected flags. | ⏭️ Intentionally omitted |
| [`FormItem update triggers / provider context`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/Transfer.tsx#L123-L139) | Source behavior | No provider-trigger cascade. Real native validity/formdata ownership is explicit, not a compatibility bridge. | ⏭️ Intentionally omitted |
| [`virtual list / provider renderEmpty`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/TransferList.tsx#L55-L173) | Source behavior | No internal VirtualList/Scrollbar/empty VNode renderer. Not a public legacy slot; native lists/count/status are authored anatomy. | ⏭️ Intentionally omitted |

### Explicit source-inherited theme props

The [source spread](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/src/Transfer.tsx#L27-L30)
adds these three inherited identities.

| Upstream item · source | Kind | Native replacement / explicit omission | Status |
| --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L170) | Inherited source prop | No provider/theme graph; explicitly load existing native Transfer CSS. | ⏭️ Intentionally omitted |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L171) | Inherited source prop | No CSS-in-JS peer override merge. | ⏭️ Intentionally omitted |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L172) | Inherited source prop | No internal theme precedence; parent-owned P0/legacy exceptions remain separate. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

## Evidence and final catalog boundary

**80 tests passed** (12 migration wiring + 41 modern Transfer + 27 native/legacy),
declarations/build and all ceilings; **1,316 distributions byte-matched**. Complete
local ESM example **10,433 gzip bytes**, including unchanged Transfer ESM/CSS;
demo-only HTML/CSS/JS **3,954**. No source/package/build/P0 edits.

Chromium verified real keyboard staging, one user move, exact target ordering,
locked/filtered/unhighlighted membership in native FormData, disabled suppression,
defaults/reset, native focus/AX, size/RTL/narrow/zoom/media, strict CSP, no-JS/missing
FormDataEvent limitations and legacy-widget coexistence. Disconnect preserves current
nodes while releasing membership serialization. No broad legacy/virtualization/AT parity.

**All 96 catalog scopes now have accepted resolutions and 384 component tasks are
accepted**, not all Naive UI features implemented. Native adaptations and explicit
omissions remain distinct. **P0-01–P0-09 broader foundations remain pending/partial,
parent-owned and untouched.** No foundation work is started here.
