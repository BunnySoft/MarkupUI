# Transfer: native membership, not selectedOptions

**🟢 Verified retained native scope.** Two labelled unnamed multi-selects, original option
nodes, native staging highlights and small stable-key membership operations. No renderer,
provider, drag framework, Select/Virtual List runtime or synthetic form controls.

**Style audit (2026-09-11):** corrected controllable pane, heading, count, filter and
disabled colors/typography while retaining native multi-selects and original options.
The [rendered audit](../style-audit/components/transfer.md) documents substantial remaining
native-list/layout differences from the modern reference. No data binding, templates,
row renderer or membership/state algorithm was added or changed.

**Every option physically in Target is a member.** `selectedOptions`/option.selected
only describes highlighted **staging**, never all target membership.

## Loading and native anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/transfer` | createTransfer and controller/state/options/side types |
| `dist/markup-ui-transfer.js` | Independent ESM |
| `dist/markup-ui-transfer.global.js` | Classic MarkupUITransfer; rejects namespace replacement |
| `@dataengine/markup-ui/transfer/style.css` | External dist/markup-ui-transfer.css |
| [Demo](../../demo/components/transfer.html) | Separate local HTML/CSS/JS and actual membership FormData |
| [Reference](../naive-ui/components/transfer.md) | Every original identity and explicit source supplements |

The helper registers no custom element. Existing widgets-plugin MuiTransfer and all
other bundles remain unchanged. This does not reproduce Naive UI's deprecated Legacy Transfer.

```html
<form>
  <fieldset class="mui-transfer" data-transfer
            data-transfer-name="members[]" data-transfer-required>
    <legend>Membership</legend>
    <div data-transfer-columns>
      <section data-transfer-pane>
        <label>Highlight additions
          <select data-transfer-source multiple size="6">
            <option value="alpha">Alpha</option>
            <option value="beta">Beta</option>
          </select>
        </label>
        <output data-transfer-count="source"></output>
      </section>
      <div data-transfer-actions>
        <button type="button" data-transfer-action="add" hidden>Add highlighted matches</button>
        <button type="button" data-transfer-action="remove" hidden>Remove highlighted matches</button>
      </div>
      <section data-transfer-pane>
        <label>Highlight removals
          <select data-transfer-target multiple size="6">
            <option value="core" disabled>Core (locked member)</option>
          </select>
        </label>
        <output data-transfer-count="target"></output>
      </section>
    </div>
    <p data-transfer-status></p>
  </fieldset>
</form>
```

```js
import { createTransfer } from "@dataengine/markup-ui/transfer"
const transfer = createTransfer(document.querySelector("[data-transfer]"))
transfer.value // ["core"], although no target option is highlighted.
transfer.move(["alpha"], "target") // Silent programmatic membership move.
```

Author one source and target select, both native multiple mode, with real native labels.
**Neither may have a nonempty name or required attribute**: those would describe staging,
not membership. These attributes are rejected, never silently removed.
Keep both controls in one fixed native form owner; explicit external `form` association
is supported. Direct plain-text options need globally unique explicit nonempty string
values (<=256 chars) and nonempty labels (<=1,024 chars), with **2,000 total options** maximum.
No optgroups, customized controls, duplicate keys, object/numeric coercion or options renderer.

The source/target nodes, labels, names, current/defaultSelected flags and option listeners
are preserved. One native option moves; no parallel copy is inserted into the other pane.
The shared Native Select ownership guard prevents a competing owner from filtering/
mutating these same staging controls; no Select helper is automatically instantiated.

## Membership, staging, locks and ordering

| Concept | Source of truth |
| --- | --- |
| Membership/value | All target option values, in target DOM order |
| Available source | All source option values, in source DOM order |
| Staging | Native option.selected flags independently in each pane |
| Item lock | Native option.disabled |
| Membership defaults | Captured initial target keys, or explicit defaultValue |
| Staging defaults | Native option.defaultSelected; never rewritten by membership moves |

Native Ctrl/Shift/arrows/typeahead remain native. Changing highlights does not move
membership or submit staged values. Moved options retain staging flags and listeners.

Moves append to the destination **in origin DOM order**, regardless of argument order.
Unmoved options keep their order. Returning an item appends it to Source rather than
inventing a global original-source sort order. `setValue(keys)` sets the exact target
membership/order; removed target items append to Source in their prior target order.
An unchanged value/order causes no needless native node moves.

Locked options cannot change membership through UI or setters. Bulk removal skips locked
members, including locked options that remain highlighted in native selectedOptions.
Reordering an already-target locked item is not removing its membership.
To change a lock or data externally, the application owns the actual native option and
must refresh after its explicit DOM update.

Either disabled native pane disables the Transfer unit's actions/serialization; DOM
membership remains intact. Native fieldset disabling (including legend exceptions)
remains browser-owned. Programmatic membership methods may update otherwise disabled
panes, but still cannot bypass item locks.

## Filtering and bulk scope

Optional labelled text/search inputs use `data-transfer-filter="source"` or `"target"`.
Their native placeholders/default values/names remain authored. Filtering is a
case-insensitive literal native-label match, not a callback/data renderer.

Filtering changes option.hidden only. Membership and selected staging flags never change:

- Move-selected uses **highlighted, enabled, matching, non-hidden** items.
- Move-all uses **enabled, matching, non-hidden** items, regardless of highlights.
- Select-all highlights matching enabled items without clearing hidden highlights.
- Clear-staging clears highlights, including hidden/locked ones, without changing membership.
- Arbitrary author CSS hiding is not a membership policy. Use the native hidden attribute
  to exclude an item from matched bulk actions. CSS-hidden target members still serialize.

The optional action names are `add-all`, `remove-all`, `select-source`, `select-target`,
`clear-source`, `clear-target`; `add` and `remove` are required. Labels are authored and
must make matched/staged scope clear. Pending filter IME drafts are not replaced or applied
until composition settles. Reset restores native filter defaults independently.

## Explicit native membership serialization

`data-transfer-name` (or options.name) reserves **one exclusive FormData key**. With a
native form owner, the helper attaches a formdata listener and appends every current target
member under that name, including locked or filtered-out target items. It does not name the
staging selects, delete another field or create hidden proxies.

```js
const data = new FormData(form)
data.getAll("members[]") // Every target member, not only highlighted target options.
```

Automatic mode requires native FormDataEvent support. If unavailable, initialization
rejects that mode instead of silently omitting membership; omit the configured name and
use explicit `appendTo(data, name)` in application code. Installed jsdom does not generate
native formdata automatically; its tests use the explicit method/event harness, while
Chromium acceptance exercises the real constructor event.

Without an automatic name:

```js
if (!transfer.state.valid) return
const data = new FormData(form) // Staging lists are unnamed and contribute nothing.
transfer.appendTo(data, "members[]")
```

`appendTo` validates before appending, returns the count appended, and refuses an existing
same-name entry. Native controls/other Transfer owners may not claim the reserved name.
Filters or unrelated named form controls remain ordinary native data, but cannot use the
membership name. This prevents internal/native name conflicts and duplicate membership
entries. External formdata code must also honor this exclusive-writer contract.

The formdata event is not cancelable. A collision from arbitrary external event code is
reported and membership is not appended/overwritten; the helper cannot prevent another
listener from later violating ownership. Direct FormData construction never validates
on its own. Ordinary submission uses the real native membership gate and a submit guard;
native form.submit() bypasses validation/events by design and is not patched.

If either pane is disabled, serialization appends nothing, like an inactive component.
This is distinct from a disabled **option**, which locks an existing member but does not
remove that membership from the logical wire value.

## Required membership and reset

Use `data-transfer-required` or `required:true` for **at least one target member**.
Staging highlights cannot satisfy it. A real custom-validity message is applied to an
available native staging control; unnamed controls still participate in native validation.
Existing application custom errors take precedence and are conditionally restored.
Native Form integration reads these real validity states without a proxy/provider.

`defaultValue` captures initial membership independently of defaultSelected.
`setDefaultValue` changes the future membership reset target without changing current
membership. `value`/setValue changes current membership only. Null is explicit empty;
all non-null keys must be known unique native strings.

On uncancelled native reset:

1. A temporary native validity gate prevents submission during membership settlement.
2. Membership returns to surviving default keys in captured order.
3. Locked current membership takes precedence: locked items are not moved merely to
   satisfy an old default. Missing default keys are reported, never resurrected.
4. Native defaultSelected flags restore staging for each item in its settled pane; filter
   inputs use native reset defaults. No membership-change notification is emitted.

Cancelled reset retains membership, staging and filter drafts. Later explicit APIs settle/
supersede pending reset safely. Mutation/serialization during active reset dispatch is
rejected; wait for settlement or use the explicit APIs afterward. A disabled locked target
can satisfy required membership because it is still a real member, even with zero highlights.

## API, focus and lifecycle

| API | Contract |
| --- | --- |
| source, target | Original native multi-selects |
| value, state | Native target membership plus staging/count/default/disabled/valid observations |
| setValue(keys|null) | Silent exact target membership/order; validates all keys/locks first |
| move(keys,to) | Silent validated batch, origin order, no outside-focus stealing |
| moveSelected(to), moveAll(to) | Silent matched-scope operations |
| selectAll(side), clearSelection(side) | Silent native staging operations |
| setFilter(side,string) | Silent native filter update; composing draft replacement rejected |
| appendTo(data,name?) | Validated explicit membership serialization |
| refresh() | Validate current native data/labels/ownership and recompute state silently |
| disconnect() | Cancel work, release serialization/ownership and retain current DOM membership |

User actions are deferred until click dispatch settles so cancellation is honored.
One mui:transfer-change reports `{value,moved,to,event}` after real membership movement.
Native staging change emits a separate mui:transfer-stage; it is not membership change.
Programmatic methods/filter/default/reset/refresh do not emit user movement.

After a user move, focus goes to the logical destination list before the initiating action
can disable. Programmatic moves leave outside focus alone. If a focused owned action must
disable/hide, focus moves to its relevant native list where available. Whole-widget
hidden/inert/disabling still requires the application to choose an outside focus destination.

Keys/counts/structure/names/locks are validated before movement. Source data updates are
application-owned native DOM operations; there is no loader, renderer or async data store.
Refresh releases removed-option ownership and adopts only valid unowned additions.
Reentrant mutation is rejected, and disconnect interrupts stale work. Native event-listener
exceptions and unrelated application effects retain normal browser semantics.

Ownership is scoped across module copies and nested roots. Observation is scoped to the
widget, its native form's reserved-name boundary and shallow ancestors; no per-frame polling.
Current membership/order/highlights survive disconnect. Removed data is not recreated.
Filter/action attributes restore only when owned; source/target counts become final static
membership counts, not stale initial counts or live staging promises.

Automatic membership serialization, required gating and membership reset are released on
disconnect. The app may read target.options for subsequent serialization, but must own that
new lifetime explicitly. The demo hides submission/move enhancement controls after handoff.
Without JS it exposes static native lists/highlights only and does not claim transfer or
membership submission.

## External native presentation

The root keeps its fieldset/legend semantics without adding a second default fieldset
border around the pane frames. Panes have a 1px border and 3px corners; their surface is
white in light mode and `rgba(255,255,255,.1)` in explicit dark mode. The pinned dark
Transfer uses this translucent surface, **not** the generic opaque Card surface.
An ancestor/root `data-mui-theme="dark"` also selects a native dark color scheme;
explicit nested `"light"` restores light.

Direct authored pane headings (`h1`–`h6`) retain their chosen semantic level. Default
title type is 16px/400, small 14px, large 16px, with 1.5 leading and 44px/50px minimum
header space. No heading is generated. Header paint remains transparent over the pane;
the source's declared header-color theme value is not treated as a painted background.

| Public CSS token | Meaning / fallback |
| --- | --- |
| `--mui-transfer-font-size`, `--mui-transfer-font-family`, `--mui-transfer-line-height` | Local overrides over shared size-role/family/leading defaults; body sizes 14/14/15px, leading 1.6 |
| `--mui-transfer-color`, `--mui-transfer-title-color`, `--mui-transfer-count-color` | Item/body, title and count roles; light `#333639` / `#1f2225` / `#767c82`, dark white-.82 / .9 / .52 |
| `--mui-transfer-disabled-color` | Light `#c2c2c2`, dark white-.38; actual disabled controls/options and their pane heading/count |
| `--mui-transfer-background`, `--mui-transfer-border-color`, `--mui-transfer-radius` | Pane surface/frame; light `#fff` / `#e0e0e6`, dark white-.1 / transparent, 3px corners |
| `--mui-transfer-title-size`, `--mui-transfer-title-weight`, `--mui-transfer-header-height` | Authored heading presentation overrides |
| `--mui-transfer-count-size` | 12px small/medium, 14px large |
| `--mui-transfer-gap` | Native pane/action grid gap, default 16px |
| `--mui-transfer-list-padding` | Native listbox padding override; retained small/medium/large defaults .15rem/.35rem/.6rem |
| `--mui-transfer-filter-height` | 28px minimum native filter height |
| `--mui-transfer-control-background`, `--mui-transfer-control-border` | Native filter/action surfaces; light white / `#e0e0e6`, dark white-.1 / white-.24 |

Local tokens win over private presets. `data-transfer-size` selects native small/medium/large
type/spacing without parsing data or replacing options. Native action buttons retain
visible labels, explicit types and disabled behavior; they are not the source's compact
header buttons or per-item remove icons.

List height and option layout remain controlled by native `select[multiple][size]`,
the platform and author CSS. There is no forced 300px viewport or simulated 34px/40px
option-row renderer. Selected-option highlights remain **native staging**, with no CSS
attempt to turn them into membership checkboxes. Native selected/disabled/scrollbar skins
can differ by browser even when controllable colors match.

Forced colors use unfaded `GrayText` for disabled actions, controls and affected pane
headings/counts. Print switches only private palette defaults to a light scheme with
readable text and white pane/control surfaces; disabled actions also lose the opacity
fade. Explicit public color/background/border tokens still win in print. These media
rules do not change option selection, membership, names or native disabled state.

The native layout keeps separate panels, a middle action column, visible control labels,
counts below the lists and optional status text. The source has adjoining panels,
header counters/actions, custom filters/checkboxes and immediate membership changes.
These differences are intentional; no pixel-parity claim is made for the whole widget.

## Four accepted steps

1. [x] Read pinned API/controller/data/interface/exports and live reference; preserve every original identity.
2. [x] Native stable-key membership/staging, lock, filter, order and form ownership contracts.
3. [x] Captured membership/defaultSelected reset, focus-safe actions and non-resurrecting handoff.
4. [x] Targeted regressions, build/budgets and actual Chromium acceptance.

**Next: Data Table.** Reuse only concrete native ownership/selection concepts; table row
selection, ordering and serialization need their own acceptance. Log, Infinite Scroll,
Popselect and Split remain separate P5 routes.

## Measured acceptance — 2026-09-09

`pnpm exec vitest run tests\transfer.test.ts tests\select.test.ts tests\form.test.ts
tests\native.test.ts`: **161 tests passed** (41 Transfer, 40 Select, 53 Form, 27 existing
native/legacy). `pnpm build` passed declarations, independent assets and every budget.
No dependencies or mandatory helper runtimes were added.

Chromium **151.0.7922.174**, dedicated local Transfer demo tab, with the live 2.45.3
reference in a separate tab. Other user/demo tabs were not altered. Demo assets and
coexistence imports were local; no application HTTP/data service is built in.

| Actual browser case | Result |
| --- | --- |
| Native semantics | Two native listboxes with labelled pending additions/removals; locked options exposed as disabled |
| Initial membership versus staging | Source Alpha highlighted, Target had zero highlights; real FormData still contained Core and Reader |
| Native keyboard | ArrowDown + Shift+ArrowDown staged Bravo/Charlie; two staging notifications, zero membership notifications |
| User batch add | Same options appended to Target in source order; membership Core/Reader/Bravo/Charlie; one change event; focus on Target |
| Filtered target | Charlie filter hid other targets but FormData still contained all four members |
| Matched bulk removal | Only Charlie moved back; hidden Bravo and locked Core remained members |
| Reset | Pending reset was natively invalid, then membership Core/Reader and default Alpha staging restored |
| Cancelled reset | Core/Reader/Alpha current membership remained |
| Locked clear | Removing all eligible targets left Core; FormData still submitted Core |
| Required membership | Highlighted Alpha with empty Target remained invalid; unhighlighted target Alpha satisfied required and serialized |
| Name collision | Conflicting native fixtureMembers[] rejected; form invalid; existing foreign value preserved without duplicate membership append |
| Disabled unit | Membership remained Alpha; only unrelated native fields serialized while disabled |
| Nested owners | Parent Core/Reader and nested Core/Reader/Alpha serialized under separate owned names |
| 500-option fixture | 500 original nodes moved, source 0/target 500, identity retained, exactly 500 FormData membership entries |
| Local scale timing | 4.0ms bind / 3.6ms move-all in that fixture; observations, not an SLA |
| Handoff | Core/Alpha membership and option identity preserved; removed Reader not restored; filter-hidden state released; automatic serialization stopped |
| 320px / RTL / 200% CSS zoom | 305px document scroll width; no horizontal overflow; controller remained connected |
| Forced colors / reduced motion | Native media matched; no custom motion engine |
| No JavaScript | Static Core/Reader membership readable, Bravo could be highlighted; actions/submission hidden and FormData empty |
| Classic/ESM/legacy coexistence | Namespace replacement rejected; optional ESM registered nothing; legacy constructor unchanged and returned ["old"] |

Browser review fixed action settlement to a microtask so accepted clicks commit before
subsequent filtering/serialization, and removed demo IDs that shadowed native form.reset/
submit methods. Unit regressions cover canceled clicks, reentrant disconnect, source
replacement, bounds, native ownership conflicts, externally overridden attributes and
the distinction between native formdata support and a test-harness event.
This is not all-browser/assistive-technology or framework-renderer parity.

### Payload and preservation

| Asset | Bytes | gzip bytes | gzip ceiling |
| --- | ---: | ---: | ---: |
| Transfer ESM | 17,241 | 5,986 | 8,000 |
| Transfer classic | 17,527 | 6,125 | 8,000 |
| Transfer CSS | 1,304 | 493 | 1,250 |
| Existing core | 62,558 | 14,611 | 15,000 |
| Existing advanced | 6,554 | 2,181 | 3,000 |
| Existing widgets | 10,858 | 2,779 | 4,000 |

Combined optional payload: **6,479 gzip bytes ESM + CSS**, or **6,618 classic + CSS**.
All **184 prior top-level dist JS/CSS assets byte-match** the pre-Transfer build, with
sorted filename/content SHA-256 aggregate unchanged:
`b48750a1e97bd4cecb30a729ef00a2a16f3ec9ab323df7a011e33b2e2c2568b6`.
No prior source or ceiling changed; generated dist files follow existing ignore policy.

Reference audit: **32 original identities + 20 source supplements = 52 rows: 28 adapted,
24 omitted**. Catalog **3,789 rows / 300 accepted tasks / 75 accepted pages**. P5 remains
active with **Data Table, Log, Infinite Scroll, Popselect and Split** unfinished.
All **493 scoped Transfer/reference/index/master relative links** resolve. P4's 984 rows
remain unchanged: 478 adapted and 506 omitted.
