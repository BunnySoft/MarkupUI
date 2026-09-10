# Popselect: a native selection disclosure

**🟢 Verified retained scope.** Composes the existing [Popover](popover.md) and
[Select](select.md) helpers around original native controls. This is a named nonmodal
region containing a native list select, **not an ARIA combobox/menu or an option renderer**.

**Default-style audit: 🟢 region/chrome and field typography corrected / 🟡 platform
option-rendering differences retained.** See the [rendered report](../style-audit/components/popselect.md)
for the frozen Select baseline, shared surface release and native form/focus evidence.

## Loading and anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/popselect` | createPopselect, options/controller types and existing SelectValue |
| `dist/markup-ui-popselect.js` | Independent ESM, including the concrete Popover/Select helpers |
| `dist/markup-ui-popselect.global.js` | MarkupUIPopselect namespace; replacement rejected |
| `@dataengine/markup-ui/popselect/style.css` | Composed external Popover + Select + small scoped layout CSS |
| [Local demo](../../demo/components/popselect.html) | Separate HTML/CSS/JS, native single/multiple/nested choices and explicit Form gate |
| [Complete reference](../naive-ui/components/popselect.md) | Every original/local/inherited identity plus explicit source supplements |

```html
<section class="mui-popselect" data-popselect>
  <p>
    <button type="button" data-popselect-trigger popovertarget="choices-panel"
            aria-describedby="chosen-values" hidden>Choose values</button>
    <span id="chosen-values" data-popselect-value hidden>Alpha</span>
  </p>
  <div class="mui-popover" id="choices-panel" data-popselect-panel
       role="region" aria-labelledby="choices-heading">
    <header><h2 id="choices-heading">Available values</h2></header>
    <div class="mui-select" data-select>
      <label for="choices">Values</label>
      <select data-select-control id="choices" name="choices" size="5">
        <option value="alpha" selected>Alpha</option>
        <optgroup label="Other values"><option value="beta">Beta</option></optgroup>
      </select>
      <button type="button" data-select-clear hidden>Clear values</button>
      <p data-select-empty hidden>No options available.</p>
    </div>
    <footer><button type="button" data-popselect-done popovertarget="choices-panel"
                    popovertargetaction="hide" hidden>Done (close)</button></footer>
  </div>
</section>
```

```js
import { createPopselect } from "@dataengine/markup-ui/popselect"
const choices = createPopselect(document.querySelector("[data-popselect]"), {
  placement: "bottom-start"
})
choices.setValue("beta") // Silent current value; defaults stay native.
```

Author choices **inline with no initial popover attribute**. Trigger/Done buttons start
hidden; an optional dynamic readout should also start hidden so no-JS edits do not leave a
misleading stale summary. Binding adds the native auto-popover attribute and reveals
enhancement controls only when supported. No-JS/unsupported paths retain usable inline
native lists, not a hidden select behind a fake control.

The host is a connected light-DOM div/section with .mui-popselect/data-popselect. It contains
one original trigger, one named region panel, one .mui-select[data-select] root/control and
one Done button. Panel IDs/targets are fixed and uniquely validated by Popover. Field roots
remain outside labels/buttons/links, with no replacement role/tabindex. Every select has a
real native label. Nested Popselect roots have separate ownership; their panels stay inside
the containing parent panel, never portalled elsewhere.

The trigger's stable text describes the action. No aria-haspopup is added or accepted:
the controlled target is a **region**, not the inner listbox and not a menu/dialog. Popover
owns aria-controls/aria-expanded, with native asynchronous toggle settlement. The select
keeps its own implicit listbox semantics; no combobox role/activedescendant/roving model.

## Useful native subset and bounds

Both modes use a native list select with **explicit size 2..20**. Native dropdown size 0/1
and a second platform popup inside the disclosure are excluded. Native single/multiple
keyboard, typeahead, focus and internal scrolling remain authoritative.

At most **2,000 original options**, explicit unique string values <=256 characters,
nonempty plain labels <=1,024 characters, and one native optgroup level. Group labels are
nonempty and <=1,024 characters. Empty-string keys are supported; number/object coercion,
rich option children, generated options, renderer callbacks and virtualization are not.
The bound is on options, not arbitrary authored header/footer DOM. No virtual-DOM metric
is claimed for the platform's own select implementation.

Options/optgroups/classes/labels/names/defaults and their original listeners remain. The
application edits native options then calls refresh; existing option identity/selectedness
is not reconstructed from a stale snapshot. Native insertion/removal may reconcile single
selectedness; removed keys are never regenerated. Mode changes invalidate the old owner:
disconnect, change multiple/size and bind a new owner deliberately.

External Select search/filter regions are omitted from this Popselect subset. Native
typeahead is not claimed to be a searchable combobox. Header/action/empty content stays
authored; the existing data-select-empty mechanism indicates zero available options.

## Value, defaults, clear and notification policy

| Mode/action | Meaning |
| --- | --- |
| Single value | Native selected string, including `""`; null only when selectedIndex is -1 |
| Multiple value | DOM-order array of selected native strings; empty is `[]` |
| setValue(string/null) | Single mode; known native string or genuine no selection |
| setValue(strings[]) | Multiple mode; known unique strings only; null/scalars/numbers reject |
| clear() | Silent programmatic no-selection (`null` or `[]`), including disabled selected options |
| Native Clear button | Existing Select user-like clear: input, change, mui:select-clear; no duplicate Popselect change event |
| Defaults/reset | Native option.defaultSelected/selected attributes, not a parallel defaultValue model |

Programmatic setters, clear(), refresh and native reset emit **no value-change notification**.
The authored Select clear button follows its established contract: one synthetic input,
one change and mui:select-clear after a real clear; canceled/no-op actions do nothing.
It focuses the actual select before hiding a focused clear button. Those synthetic events
are not trusted browser typing. Real native editing keeps its original input/change events.

Selected disabled options or disabled-group descendants remain in value/readout.
Programmatic setters may select them, and clear removes all selected flags when requested;
they are not Transfer-style protected members. Native FormData excludes disabled selections
and disabled controls/fieldsets. **Current selection is not identical to successful form
submission.** Native required validity also is not an application business-value validator.

A first empty-value option in this list mode is an actual empty-string option, not a
dropdown placeholder-label option. Do not use data-select-placeholder in a list. The helper
never converts `""` to null or creates hidden unchecked/empty values.

Reset settlement occurs in a task **after** the native default action; canceled resets
retain current values. It refreshes current flags/readout without opening a popup. External
form association is supported. Readout/value snapshots read actual option.selected flags,
including reset/no-selection transitions; no cached collection becomes a second value model.
The existing Select source and its budgets were not changed.

Optional data-popselect-value is a plain span/p outside panel/trigger/labels, with no live
region or role. It shows up to three native labels, plus (+N), or emptyText (default
“None selected”, nonempty <=256 characters). textContent only; no render callback or HTML.
The trigger label remains stable. Readout visibility is restored on disconnect.

## Deliberate interaction and close policy

**Values are immediate in both modes. There is no staging/commit/cancel snapshot.**

- Arrows, typeahead, pointer selection and native select Enter do **not** cause a wrapper
  close. Native single-listbox arrows change value; closing on every change would prevent
  navigation after the first key.
- Enter/Space on the native trigger activates its popovertarget once. Modified/canceled
  native trigger actions retain browser behavior; the wrapper adds no activation handler.
- Done is a real native hide-command button. Trigger toggle, Escape and outside dismissal
  use native auto-popover behavior. Closing never undoes selected flags.
- Enter on the select is not an alias for Done. It retains native form behavior, including
  possible form submission. The demo intercepts its application's submit path explicitly.
- Opening/reveal do not automatically focus. Native Tab enters the labelled select;
  no keyboard trap or custom typeahead/selection engine is installed.

The native browser usually returns focus on dismissal. For composed nested cases where
native close leaves body focus or a still-focused now-hidden owned control, the wrapper
recovers the enabled, readable opener after toggle settlement. It does not overwrite an
outside focus destination. Local focus-loss bookkeeping is cleared on reopening/disposal;
it is not a fabricated outside-click/Escape reason event or a global popup stack.

Native beforetoggle cancellation and coalesced toggle events are preserved. show reads
actual :popover-open, not a queued desired flag. Programmatic visibility calls still emit
native toggle events; there is no promise of silent framework show updates.

## Required hidden fields: explicit validation/reveal

**A closed popover does not unmount, disable or exclude its named select.** It still
serializes and participates in required validation, and a hidden invalid field may be
unfocusable. No proxy input, custom required gate or silent field disabling is introduced.

The helper registers **no invalid listener that opens a popup**. checkValidity and the
existing native [Form](form.md) validate path remain quiet: they do not steal another
popup's focus/visibility. A deliberate application validation action chooses when to reveal.

The demo authors novalidate and a JS-enabled submit button. Its application handler:

1. Prevents default and awaits quiet Form validation; discards stale results.
2. Identifies the **first** invalid native control and its Popselect owner.
3. Explicitly reveals any owned ancestor panels in outer-to-inner order. Native
   scrollIntoView brings each trigger into a visible position where necessary.
4. Calls reveal(), then explicitly focuses and reports validity on that one control.
5. Constructs native FormData only for a valid result.

```js
const result = await nativeForm.validate()
if (!result.current) return
if (result.status === "invalid") {
  // Resolve the first issue/owner; reveal ancestors explicitly when nested.
  choices.trigger.scrollIntoView({ block: "nearest", behavior: "instant" })
  if (!choices.reveal()) return showApplicationError()
  choices.control.focus()
  choices.control.reportValidity()
} else if (result.status === "valid") {
  const data = new FormData(formElement)
  // Application owns persistence.
}
```

Opening an auto-popover **may dismiss unrelated native peers**. That is an explicit
reveal action, not a side effect of quiet validation. Do not open every invalid auto panel
and then call whole-form reportValidity: peer dismissal can hide an earlier invalid field.

reveal() returns whether this owner's control is in a revealed readable context, without
focusing. Unsupported Popover APIs can return true for inline controls; open()/show remain
false. A clipped/disabled trigger or closed ancestor may prevent opening. Invalid
anatomy/unsupported CSS layout throws and hands off inline instead.

Disabling the opener is **not** disabling its named select. If an enabled required select
is invalid but its opener cannot be used, re-enable/reveal its context or explicitly
disconnect to inline choices before reporting validity. Do not solve this by removing
required/name or silently disabling the field.

## Ownership, refresh and lifetime

One Popselect owns the composition, one Select owns the original control. Cross-copy
Popselect and native Select ownership are guarded. Never separately bind a Popover/Select
to those same nodes; no broader promise of cross-bundle arbitration for arbitrary base
Popover instances is invented.

Native control/trigger/fieldset disabling and hidden/inert ancestry synchronize Popover
availability and close it when necessary. The wrapper mirrors unavailable state with
owned trigger aria-disabled; it does not change native select/trigger disabled flags.
Changing those owned advisory attributes is not a substitute for native disabling.

Options/default/label/form/size/anatomy mutations refresh the native data/readout; native
events update immediately. A scoped observer and short reset/focus-settlement tasks are
cleaned up on disconnect. Existing Popover owns all active visibility/positioning work;
Select owns its own native selection/clear/default handling.

Malformed external anatomy/options/mode changes emit mui:popselect-error and release
enhancement to static native choices without repairing/resurrecting data. Invalid
setValue arguments reject without erasing a healthy selection or disconnecting that owner.
Fix invalid data/context and rebind explicitly.

Disconnect is idempotent: closes/disconnects Popover, disconnects Select, restores owned
attributes, removes the added popover attribute and leaves current native choices inline.
Original option nodes/listeners/current selection/defaultSelected remain. Owned
trigger/Done/readout visibility returns to authored fallback. The application chooses a
focus destination when ending the whole enhancement lifetime; the demo does so explicitly.

Nested owners retain separate lifetimes. Disconnect child owners explicitly when disposing
an entire parent subtree; the demo tears them down in reverse order. No global provider,
row renderer, Tag or Virtual List runtime is required.

## Placement, CSS and layout limits

Options: placement (default bottom-start), gap/margin, flip and positioning=auto/fallback.
These are a narrow immutable snapshot delegated to existing Popover; no hover/focus trigger,
delay/duration, portal, coordinate, arrow-wrapper or z-index API is forwarded.

All surfaces/fonts/sizes/native overflow/RTL/focus/forced-colors/print are external CSS.
data-size=small/medium/large supplies Popselect-local field typography **14/14/15px** and
frame padding **4/8/12px**, behind public Select overrides; source huge is explicitly omitted.
These sizes do not replace native option row layout or the authored HTML `size` count.
The native platform controls option/checkmark rendering. Existing raw
and opt-in animated Popover classes retain their declared contracts; no leave scheduler.

The parent-coordinated Popover guard release supplies the normal region's light/dark
surface, radius and shadow. Popselect does not duplicate that palette. Its scoped Select
context inherits region text/font family and uses a transparent native-control background
by default, avoiding dark-on-dark labels and a permanently white control inside dark chrome.
The actual label, listbox, Clear and Done controls remain visible and owned by the native
model; they are not hidden to resemble a rendered option menu.

`--mui-select-color`, `--mui-select-background`, `--mui-select-font`, `--mui-select-pad`
and `--mui-select-focus` remain author overrides. Size variants set private fallbacks rather
than masking inherited public font/padding tokens; an explicitly sized inner Select is
also respected when the Popselect root has no size override. Native focus and validation
colors come from the released Select stylesheet without a local outline-color override.
Disabled control paint remains Select-owned. Forced colors and print restore Canvas
backgrounds. No option/optgroup/selected-row renderer or
combobox/menu semantics are added. Trigger and Done retain their existing native button
presentation and stable labels.

Only the existing Popover's isolated CSSOM geometry writes are used. No duplicate
positioner or CSS-in-JS surface engine is added. Native top-layer panels retain their DOM
ancestry; settled geometry uses base anchors or measured fallback/clipping/flip.

**CSS zoom on the trigger/panel ancestor context is unsupported by the reused positioner.**
It is detected and rejected with a readable inline handoff, not compensated by a second
geometry engine or allowed to draw an oversized offscreen popup. Scoped style/class checks
only enforce that guard; they do not calculate placement. This differs from native browser/
visual-viewport zoom, whose delegated bounded path is exercised below.

Inline/no-JS/error/unsupported fallbacks fit their parent width, including nested panels.
Print exposes native choices in normal flow and hides enhancement actions. No-JS fields
remain editable/resettable; the demo's disabled hidden submit button avoids an unbound
application validation action. Native selection/find/printing remains platform-owned.

## API

| API | Contract |
| --- | --- |
| trigger, panel, control | Original native nodes |
| supported, connected, error | Native Popover capability, enhancement lifetime and latest failure |
| value, show | Native current selected values and actual popup visibility |
| setValue(value), clear() | Silent native current-value operations; never defaults or popup staging |
| open(), close(), setShow(boolean) | Delegate actual native visibility; not silent controlled props |
| reveal() | Explicit readable-control reveal for application validation, without autofocus |
| syncPosition() | Delegate to the existing positioner |
| refresh() | Reconcile valid native data/availability/readout without rewriting selected defaults |
| disconnect() | End enhancement and expose current native inline choices |

After disconnect, use control for native values; controller value/refresh/setters require
an active owner. Select error events/Popover errors become the Popselect error handoff.
No duplicate custom value/show event is synthesized.

## Complete mappings and four accepted steps

[Reference tracker](../naive-ui/components/popselect.md): **56 original identities
(13 local + 43 inherited) + 23 source-only supplements = 79 rows:
38 adapted native capabilities + 41 intentional omissions**.

Retained: native multiple/value/options/groups/disabled/defaults; native scrolling/size;
authored header/action/empty/trigger regions and classes; external style/width/raw/animation
adaptations; click/native show/toggle/placement/flip; option/group string labels/values,
native optgroup type/children; narrow NPopselect/PopselectInst and setShow/syncPosition.

Individually omitted: node-props/render-label/option/group renderer functions; virtual-scroll;
scrollbar forwarding; arrow-center/arrow/wrapper APIs (source itself omits showArrow/arrow);
hover/focus delay/duration/retention; overlap/to/x/y/z-index; display directives and
outside-click reason; group-key records; huge/type/props/slot-function compatibility aliases;
source cancelable/showCheckmark/onUpdateValue/onChange/mouse callback props; theme props and
every recorded PopselectInjection member. Empty/null/string/array differences and all
inherited source rows remain explicit, not hidden under a generic “Popover supported” claim.

1. [x] Read pinned controller/panel/exports/types and preserve all original/inherited identities.
2. [x] Compose actual native selection/defaults/readout without a renderer or second value model.
3. [x] Specify deliberate close/focus and explicit hidden-field validation/fallback ownership.
4. [x] Targeted tests, build/budgets and actual Chromium selection/forms/placement acceptance.

**Next: Split. P5 remains incomplete.** No Split implementation is included in this commit.

## Measured acceptance — 2026-09-10

`pnpm exec vitest run tests\popselect.test.ts tests\popover.test.ts tests\select.test.ts
tests\form.test.ts`: **181 passed** (35 Popselect, 53 Popover, 40 Select, 53 Form).
`pnpm build` passed declarations, composed assets and all budgets. No dependency was installed.

Chromium **151.0.7922.174**, dedicated local Popselect tab. Other user/demo tabs were not
altered. The pinned GitHub APIs/source/types are the reference authority.

| Actual browser acceptance | Result |
| --- | --- |
| Native popup semantics | Named region containing native labelled listboxes; no haspopup/combobox/menu claims; settled aria-expanded=true |
| Native opening | Click/Enter/modified native click worked once; prevented click did not open |
| Single navigation | Tab reached work-select; arrows selected Hybrid then Remote and stayed open; native select Enter stayed open |
| Explicit closure | Done returned to opener; Escape/outside preserved current values, not defaults |
| Multiple | Chat/SMS selected immediately and serialized; Escape did not revert |
| Nested Escape/focus | Child closed first and returned to its opener with Verbose retained; second Escape closed parent and returned to parent opener |
| Quiet validation | Work mode invalid/closed while peer remained open; Form.validate returned invalid without moving peer focus |
| Explicit reveal | Submit gate opened only first invalid owner, dismissed its native peer, focused work-select and reported its native error |
| Closed FormData | Work mode and enabled selected channels serialized while closed; disabled selected archive stayed in value but not FormData |
| Defaults/clear | User Clear set genuine null without closing and kept Office defaultSelected; reset restored Office/Email/Archive and readout quietly |
| Native fieldset | Disabling closed/gated choices, preserved values and excluded channel/detail fields; first-legend control stayed usable |
| 2,000-option fixture | All 2,000 original option nodes retained; four exact selected keys; readout “Choice 1, Choice 2, Choice 3 (+1)”; observed bind 14.0ms, not an SLA |
| 320px popup | 305px document; open panel right edge 297px within viewport |
| Visual-viewport zoom 2 | Delegated fallback open at x=80/right=423/bottom=442 within 640x450 CSS viewport |
| CSS zoom 2 | Explicit error/inline handoff preserved selection; final narrow RTL fallback document width 305px, not the earlier oversized popup |
| Print/media | Static visible panel/select for print; forced-colors/reduced-motion matched |
| Partial Popover APIs | supported=false, inline choices usable, trigger hidden; Hybrid value/readout updated |
| No JavaScript | All three panels inline; trigger/Done/dynamic readouts hidden; Hybrid serialized; native reset restored Office; 305px document |
| Handoff | Current Remote value/defaults/option identity retained; added popover attribute removed and dynamic readout returned to hidden fallback |
| Coexistence | Original options survived later core/advanced/widgets; no mui-popselect registration; classic/ESM ownership and namespace replacement rejected |

Review fixed native reset task timing, direct native selected-flag readout, nested close
focus fixup and safe CSS-zoom/inline-width boundaries. JSDOM's disabled-option FormData and
cached selectedOptions limitations are not mistaken for browser behavior; native Chromium
submission/selection was measured separately. No all-engine, screen-reader speech,
browser-toolbar zoom, renderer, full framework or pixel-parity certification.

### Payload and preservation

gzip uses build level 9.

| Asset | Bytes | gzip bytes | gzip ceiling |
| --- | ---: | ---: | ---: |
| Popselect ESM (including composed helpers) | 26,654 | 9,380 | 10,000 |
| Popselect classic | 26,943 | 9,507 | 10,000 |
| Composed Popselect CSS | 6,297 | 1,674 | 2,500 |
| Existing core | 62,558 | 14,611 | 15,000 |
| Existing advanced | 6,554 | 2,181 | 3,000 |
| Existing widgets | 10,858 | 2,779 | 4,000 |

Combined ESM + CSS: **11,054 gzip bytes**; classic + CSS: **11,181**.
All **196 previous top-level JS/CSS assets byte-match**, including near-full Popover and
native Select; no prior source/ceiling changed. Sorted filename + NUL + content SHA-256:
`fb41f5557f7786f12a0405952540ac88645cb590736f0b09ff2df6a0c990a5f3`.
Generated dist follows the existing ignore policy.
All **521 scoped Popselect/reference/index/master relative links** resolve.

Catalog: **3,905 rows / 316 of 384 tasks / 79 accepted pages / 68 unchecked**.
P5: **817 rows = 330 adapted + 468 omitted + 19 unresolved**, nine of ten routes accepted.
Remaining **Split: 19 rows / 19 unresolved**.
