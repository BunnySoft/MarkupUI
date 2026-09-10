# Legacy Transfer: explicit native replacement

**Resolved deprecated-API lane / verified native replacement.** Use the already
shipped [Transfer helper](transfer.md), not NLegacyTransfer, legacy option objects,
Vue callbacks/providers or a second selection engine. The
[HTML](../../demo/components/legacy-transfer.html), [CSS](../../demo/components/legacy-transfer.css),
[application JS](../../demo/components/legacy-transfer.js) and
[tests](../../tests/legacy-transfer.test.ts) form a working migration recipe.

There is **no new library runtime, export, dependency, distribution asset or budget**.
The application imports createTransfer from the existing markup-ui-transfer.js
and explicitly links markup-ui-transfer.css. Package consumers use
`@dataengine/markup-ui/transfer` and `@dataengine/markup-ui/transfer/style.css`.
The demo's connectExample function/window diagnostic handle is local wiring, not a
new public factory or compatibility alias.

## Model conversion is explicit

**Every option physically in Target is a member.** Native option.selected and
selectedOptions describe staging highlights, not the membership array.
The example starts with Core and Reader as members, neither highlighted, while
Alpha is highlighted in Source. Highlighting Alpha does not grant membership.

The application authors labelled native multiple selects with direct plain-text
options. Neither staging select is named or required. It supplies native headings,
filter labels/placeholders, buttons and actual options before connecting the helper:

```js
import { createTransfer } from "@dataengine/markup-ui/transfer"
const transfer = createTransfer(document.querySelector("[data-transfer]"))
// Root data-transfer-name="reviewers[]" reserves one native FormData key.
transfer.value // All target members, not target.selectedOptions.
```

Old options arrays are **not** accepted by createTransfer. Choose canonical native
string identifiers and author real options; option text/label and disabled state
replace the useful data fields, not the old object ABI. Native keys must be unique,
nonempty strings up to 256 units; labels up to 1,024 units and at most 2,000 options
across both panes. No optgroup/renderer/virtualized data model is added.

Legacy OptionValue permits numbers and strings, which can distinguish 1 from "1".
Blindly calling String on both loses that distinction. If such data exists, the
application must choose explicit collision-free identifiers and translate all
membership/default keys consistently before authoring native nodes. No automatic
coercion, duplicate-last-wins map or missing-option renderer is supplied here.

## Property/event/slot migration

| Legacy surface | Native replacement / limitation |
| --- | --- |
| default-value | Initial target DOM or explicit defaultValue; later setDefaultValue changes future reset membership, not current values. |
| value | Read transfer.value; setValue sets exact target membership/order silently. Null means empty only when item locks permit it. No controlled Vue model. |
| disabled | Native fieldset or pane disabling. The source Markdown says true, but source prop default is undefined and delegates to useFormItem; neither is copied as an implicit native default. |
| filterable | Author optional labelled native search inputs. The helper applies literal case-insensitive native-label matching. |
| filter | Callback/filter data-shape contract omitted. No arbitrary synchronous/async predicate or renderer hook. |
| options / option label/value/disabled | Original option nodes with explicit string keys, literal labels and native locks; no legacy array adapter. |
| size | Existing root data-transfer-size=small/medium/large CSS. Native select.size is a separate visible-row setting, not the old widget size. |
| source/target titles | Authored h2/labels/legend; no locale provider or empty-string fallback to provider text. |
| source/target filter placeholders | Native placeholder attributes on the actual labelled inputs. |
| on-update:value | Listen on the native Transfer root for mui:transfer-change; payload and trigger policy differ explicitly below. |
| virtual-scroll | Omitted. All bounded native options stay mounted; no VirtualList/Scrollbar renderer. |

The pinned Legacy Transfer exposes **no public slots** in its Markdown or root
rendering. Internal Button icon slots and the list's provider-supplied renderEmpty
callback are not public legacy slot promises. Native headings, status and options
are explicit anatomy, not a slot/render adapter.

## Staging, locks, filter scope and order

Native Ctrl/Shift/arrows/typeahead own staging. User move buttons act on highlighted,
enabled, matching, non-hidden options. Bulk buttons act on all enabled matching
options. Filtering hides options but leaves membership and highlights unchanged;
clearing highlights never removes members.

Disabled **options** lock membership. Core stays in Target even when unhighlighted,
filtered out or bulk removal is requested. A locked Source option cannot be added.
Even programmatic setters enforce item locks; changing a lock/data is an explicit
application DOM update followed by refresh. This is not legacy controlled-value
mutation that silently bypasses native locks.

Disabled **panes/fieldset** instead make the unit's user actions and automatic
serialization inactive. Membership remains in the DOM. Existing programmatic
membership methods may still update otherwise disabled panes, but not bypass item locks.

The native helper appends moved items **in origin DOM order**, not argument order.
Returning items appends them to Source rather than restoring a global original-data
sort. setValue explicitly sets target order. The source legacy handler instead
prepends checked source keys to existing membership and clears staging; that ordering/
clearing algorithm is intentionally not retained. Native moved options keep selected
and defaultSelected flags, labels and listeners.

## Defaults, reset and events

Membership defaults and native staging defaults are separate:

- Initial target members Core/Reader are the captured membership default.
- Alpha's authored selected attribute sets its defaultSelected staging flag.
- The example can set exact current order Core/Beta/Alpha without changing defaults.
- Another action changes future reset membership to Core/Gamma without changing current membership.
- Native Reset then restores surviving membership defaults, native option/filter
  defaults and unrelated form fields. Locked membership takes precedence; missing
  default data is reported, never recreated.

Reset settlement and user action cancellation are owned by the existing helper,
not a recreated legacy watcher. The local demo uses one cancelable post-reset task
only to refresh its diagnostic snapshot; there is no polling/application scheduler.

Listen **directly on the data-transfer root**: the helper's custom events do not
bubble. A user move emits one mui:transfer-change with `{value,moved,to,event}` after
click dispatch settles. Native staging emits mui:transfer-stage; it is not a
membership update. Programmatic setValue/move/filter/default/reset/refresh operations
do not emit a user-move event. mui:transfer-error surfaces helper errors.

This is not the legacy value-only callback array, onUpdateValue/onChange aliases,
FormItem trigger sequence or provider propagation. The demo attaches no duplicate
Enter/Space handler; real native buttons activate once. User movement focuses the
destination list before the initiating action may disable. Programmatic operations
preserve outside focus.

## Real FormData ownership, not named highlights

The helper exclusively owns `reviewers[]` through root data-transfer-name and the
native formdata event. Source/Target and filters are unnamed; Project and Application
note remain ordinary named native fields. No hidden input/proxy is created.

`new FormData(form).getAll("reviewers[]")` returns every current target key,
including locked, filtered-out and unhighlighted members. A disabled unit returns
no membership entries. A named native multi-select would submit selected options,
which is the **wrong membership model**; naming the staging lists is rejected.

Do not assign the reserved key to another native control, helper or external
formdata listener. The local preview checks native form validity, constructs real
FormData and checks that the resulting membership agrees with the current target
(or is empty when disabled). A mismatch surfaces an error, not guessed selectedOptions.
It neither submits nor sends data to a backend.

Native FormDataEvent support is required for automatic name ownership. This demo
reports failure and keeps static lists/hidden enhancement controls when it is absent.
A different application may deliberately omit the automatic name and use the
existing appendTo method, with its own lifetime/name/validation policy; this demo
does not silently switch serialization modes.

Installed jsdom does not emit formdata from the native constructor. Tests therefore
use an explicit event harness for the existing listener and assert that the demo
reports a constructor mismatch rather than faking success. Actual Chromium
constructor-event behavior is separately verified.

## No-JS and disconnect are intentionally limited

Without JS, the original lists and native highlights are readable/usable, but there
is **no membership movement, filter, membership reset or membership serialization**.
Related controls/filter groups stay hidden. Only the unrelated named native fields
enter FormData; no submit button is authored.

Disconnect retains current native list membership/order/highlights and releases
movement, filter ownership, membership reset, validity gating and formdata writing.
The local application cancels its snapshot task/listeners, hides enhancement UI,
clears its old preview and moves focus to the visible Project input if a control
being hidden was focused. Outside focus is otherwise preserved.
Call the demo's disconnect before removing/reusing its application scope.
Subsequent serialization of retained native membership is an application-owned
lifetime decision, not selectedOptions automatically becoming a membership field.

Existing widgets-plugin MuiTransfer is a different legacy MarkupUI control, not
NLegacyTransfer. It coexists without changing the native selects/options or wire
membership here. Modern Transfer source/reference/acceptance and all legacy
core/plugin code are unchanged.

## Acceptance and catalog boundary

The [tracker](../naive-ui/components/legacy-transfer.md) preserves all 16 original
identities and adds three grouped types/exports, seven source behaviors/aliases and
three inherited themes: **29 rows = 15 verified native replacements + 14 omissions**.
Four resolution tasks close, not deprecated API/renderer/virtualization compatibility.

**80 tests passed**: 12 migration wiring + 41 unchanged modern Transfer + 27 native/
legacy, via `pnpm test -- tests\legacy-transfer.test.ts tests\transfer.test.ts tests\native.test.ts`.
`pnpm build` passed declarations and all existing ceilings; **1,316 distribution
files byte-matched**. No source/package/build/P0 foundation row changed.

Dedicated Chromium evidence:

- Home/Shift+ArrowDown staged Alpha/Beta while native FormData still contained only
  Core/Reader. Native Add emitted one move, preserved the Alpha node and focused Target.
- Clearing target highlights then filtering to Beta kept Core/Reader/Alpha hidden
  but still serialized all four members. Remove-all moved only matching Beta.
- Programmatic exact order and future defaults were silent; reset produced Core/Gamma,
  restored Alpha's source staging and native fields/filters, without another move event.
- Disabled fieldset preserved Core/Gamma membership but removed membership wire entries;
  re-enabling restored serialization. Disconnect kept nodes/current members, focused
  Project before hiding controls and released all membership FormData entries.
- Native AX retained named listboxes/options/disabled locks/searchboxes and real buttons.
  RTL preserved source/target DOM order and wire values. At 360px/200% zoom the layout
  stacked within a 345px page width. Forced colors/print preserved data; native select
  printing is not an all-options print export.
- Existing size CSS produced 2.4/5.6/9.6px native select padding for small/medium/large.
  A strict self-hosted CSP allowed actual moves and FormData preview with no injected
  styles/errors. Missing FormDataEvent produced a visible static fallback.
- JavaScript-disabled lists still allowed native highlighting, but FormData contained
  only Project/Note and all enhancement controls remained hidden. Legacy widget
  registration preserved native select/option identity and current membership serialization.

No all-browser/AT, numeric legacy-key ABI, controlled model, callback-array or full
virtualized renderer parity is claimed.

Reused helper ESM/classic/CSS: **5,986 / 6,125 / 493 gzip** under unchanged
**8,000 / 8,000 / 1,250** ceilings. Local HTML/CSS/JS add **1,843 / 498 / 1,613 gzip**
(**3,954** total); complete ESM example **10,433 gzip bytes**. No new library asset.

This closes the last catalog route: **96 scopes resolved / 384 component-resolution
tasks accepted**, with implemented/adapted/excluded distinctions preserved. It does
not mean every Naive UI feature is implemented or all repository work is complete.
Broad **P0-01–P0-09 foundations remain pending/partial and parent-owned**, including
legacy CSS extraction, aggregate auto-install and inline-theme compatibility follow-through.
No foundation edit is started here.
