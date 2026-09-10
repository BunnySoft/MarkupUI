# Tabs, Tab and TabPane: authored panels with guarded selection

**🟢 Verified for the retained paired native-tabs scope, not Vue API parity.**
The helper owns one tablist/tab/tabpanel relationship and native hidden state over existing
buttons and pane nodes. It does not generate tabs, destroy panes, render VNodes or install
a provider. Automatic/manual keyboard activation and asynchronous leave guards are explicit.

## Default-style audit — 2026-09-10

The [isolated rendered audit](../style-audit/components/tabs.md) corrects the default
bar/line/card/segment typography, small/medium/large tab metrics, palette, hover,
selected treatment and unboxed pane spacing. Controller/keyboard/guard code is unchanged.
**52 targeted tests pass**: 43 controller cases plus nine CSS regressions.

Forty top-placement bar/line/card/default comparisons matched the checked geometry/
text properties in light/dark × LTR/RTL. Twelve Segment comparisons matched geometry
and enabled-tab styles, with the explicitly retained disabled-color distinction.
The placement follow-up also matched pane/tab padding in **120 non-top reference
cases**, including RTL start/end and all three vertical-card densities. Indicator
rounding/baseline and card-edge limits remain documented.
CSS is **7,344 raw / 1,750 gzip bytes**, at the unchanged **1,750-byte ceiling**.
The coordinator's isolated release build and all **52 Tabs tests** pass;
no shared source or generated adapter changed.

## Loading and anatomy

| Export / asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/tabs` | `createTabs`, native controller/options/guard/change/activation/placement types |
| `dist/markup-ui-tabs.js` | Independent ESM helper |
| `dist/markup-ui-tabs.global.js` | Classic `window.MarkupUITabs.createTabs`, with a collision error rather than API replacement |
| `@dataengine/markup-ui/tabs/style.css` | Independent external `dist/markup-ui-tabs.css` |
| `demo/components/tabs.*` | Separate native HTML/CSS/JS and an authored pair template; local guards only |

```html
<link rel="stylesheet" href="./vendor/markup-ui-tabs.css">
<script defer src="./vendor/markup-ui-tabs.global.js"></script>
<script defer src="./tabs-setup.js"></script>

<div class="mui-tabs" data-tabs data-tabs-type="line" data-tabs-placement="top" id="views">
  <div data-tabs-bar>
    <span data-tabs-prefix>Local views</span>
    <div data-tabs-list aria-label="Document views">
      <button type="button" data-tabs-tab data-tabs-key="one" data-tabs-target="pane-one" id="tab-one">One</button>
      <button type="button" data-tabs-tab data-tabs-key="two" data-tabs-target="pane-two" id="tab-two">Two</button>
    </div>
    <span data-tabs-suffix>Authored extra content</span>
  </div>
  <div data-tabs-panels>
    <section data-tabs-pane id="pane-one"><h2>One</h2><input value="Preserved state"></section>
    <section data-tabs-pane id="pane-two"><h2>Two</h2><p>Another authored view.</p></section>
  </div>
  <div data-tabs-messages>
    <p data-tabs-empty hidden>No available views.</p>
    <p data-tabs-status role="status" hidden>Checking whether the view can change.</p>
    <p data-tabs-error role="alert" hidden>The view change failed. Try again.</p>
  </div>
</div>
```

```js
// tabs-setup.js; alternatively import { createTabs } from "@dataengine/markup-ui/tabs".
const tabs = window.MarkupUITabs.createTabs(document.querySelector("#views"), {
  activation: "manual",
  beforeLeave(next, previous) { return Promise.resolve(true) }
})
// Direct controlled override, deliberately silent and guard-bypassing:
tabs.value = "two"
// Guarded programmatic request, also silent:
await tabs.select("one")
tabs.disconnect()
```

Setup requires connected same-document light DOM, exactly one named div[data-tabs-list]
directly inside a direct data-tabs-bar, a direct data-tabs-panels wrapper, and a direct
data-tabs-messages region. Bar precedes panes, and panes precede messages in DOM order.
Each native **type=button** tab has a unique authored ID, nonempty string data-tabs-key,
label and data-tabs-target pointing to exactly one unique direct section/div/article pane.
All owned panes pair one-to-one in the same authored order; no orphan, duplicate or
ambiguous association is accepted. A pane may mirror data-tabs-key, but it must agree.

Tab labels cannot contain nested interactive controls, custom/shadow widgets or competing
popover/command/autofocus behavior. Fragment anchors are not tab triggers in this retained
scope; use native links outside the tablist for navigation. Existing pane content can contain
normal links, inputs, forms and nested tabsets. Nested tabsets must be inside an owned pane
and retain independent actions/state; parents track only their containing pane's focus safety.

Empty/status/error regions are distinct authored nonempty messages, initially hidden, outside
panes/list. They make no-available and guard-pending/failure states usable without generated
text. The helper never copies arbitrary Error.message into HTML.
Pane state is preserved; optional application templates may be instantiated before binding.
No JSX/VDOM/template evaluator or hidden duplicate pane is created.

The documented Tab/TabPane companions map to the **paired tab button and pane**. A label-only
Tab widget without a corresponding pane, lazy render/unmount directives and VNode tab-props
forwarding are excluded. No custom element is registered; legacy mui-tabs/mui-tab stay
unchanged, and binding inside that legacy anatomy is rejected. There is no fictitious
enhanced-before-core rule.

## Roles, ownership and fallback

With enhancement, the list becomes role=tablist with explicit orientation and tabindex=-1.
Tabs become role=tab with aria-controls/aria-selected and one roving tab stop; panes become
role=tabpanel, are labelled by their tab ID, and have a native tabindex=0 entry point.
An existing compatible labelledby list is preserved and extended with the tab ID. Conflicting
authored associations/roles fail validation instead of silently describing a different pane.

Inactive panes use **native hidden**, not zero-size/focusable styling or DOM removal.
Inputs, listeners, headings and application state remain on the same nodes.
Hidden does not disable form controls: inactive panes still participate in native form data
and validation. Applications must choose appropriate form/disabled/reveal policy; this helper
does not rewrite native validation or submission. Tab/add/close controls themselves never
submit an enclosing form.

Disconnect restores only still-owned roles, tabindex, ARIA, hidden and root state markers.
IDs and native label/content nodes are never generated or rewritten. Logical inner selection
and roving state survive an outer inactive pane, so nested tabs work when revealed again.
Required IDs/keys/pairs changed by the application are revalidated during refresh; old guard
results cannot target a replacement pair.

**No JS:** markup starts without helper roles or hidden panes, so all titled panels are
readable in DOM order. Native pane links/controls remain native. The tab-label buttons do
not pretend to switch without the helper; authors may provide ordinary fragment links
outside the tablist if needed. Initial hidden panes are rejected by setup so the retained
baseline is explicit. Using existing ARIA tab roles without JS is an author choice, not a
claim that those roles alone supply keyboard behavior.

## State, activation and events

Options are value/defaultValue (string keys), activation (`"automatic"` default or `"manual"`),
placement (top default or authored placement), centerActiveTab (false), and beforeLeave.
Unknown options, numeric keys, bad mode/placement/guard types and missing anatomy throw.

Initial value takes precedence over defaultValue; absent both, the first available tab is
selected. Disabled/hidden tabs are excluded. Null is valid only when no available tab exists:
all panels are hidden and the authored empty region becomes visible/focusable.
Re-enabling an available tab selects a suitable fallback silently. Defaults are not replayed
on refresh/reconnect. Direct hidden/type/disabled changes to tabs are observed.

| API | Contract |
| --- | --- |
| `connected`, `value` | Lifecycle and current string key, or null only for the empty state |
| `value = key` | Immediate, validated, guard-bypassing **silent** application override; supersedes pending work |
| `select(key)` | Guarded programmatic request; returns Promise<boolean>, no user change event |
| `pending` | Current requested key or null; old pane remains selected while awaiting a guard |
| `lastRequest` | Published promise for the most recent valid request; false on veto/supersession, rejected on guard failure |
| `activation`, `placement` | Validated live policies; changing activation cancels pending guard state |
| `scrollToCurrentTab()` | Native nearest/optional axis-centered scrollIntoView, boolean availability result |
| `refresh()`, `connect()`, `disconnect()` | Explicit validated lifecycle over existing nodes |

User activation emits `mui:tabs-change` with `{ value, previous, tab, panel, event }` only
after the same live request commits a different value. Native button clicks are admitted
in a later task, honoring synchronous target/delegated defaultPrevented and modified-click
policy. A newer explicit value/selection supersedes an earlier queued click.
There is no callback-array alias, fabricated native click or user event for defaults,
programmatic selection, structural recovery or appearance changes.

Managed role/selected/controls/labelledby/tabindex/pane-hidden fields belong to this controller
while connected. Do not compete with them directly; change authored keys/targets/native tab
disabled/hidden state and call refresh for immediate reconciliation. Hidden on a pane is
not a second application visibility API. Unrelated attributes/listeners remain untouched.

## Keyboard and layout

Horizontal lists use logical Left/Right (RTL-aware); vertical placements use Up/Down.
Home/End select the first/last available focus target and navigation wraps, skipping disabled/
hidden tabs. Automatic activation requests selection on these keyboard movements; manual
activation moves focus only until native Enter/Space/click. Native/programmatic focus alone
does not independently call the guard, avoiding double invocation on pointer focus plus click.

Tab/Shift+Tab are not trapped. The normal example moves from the tab strip into the selected
panel; any authored prefix/suffix/action controls participate in their actual DOM order.
Pane controls then follow normal browser navigation. Enter/Space on native tab buttons
activate once; there is no synthesized key-to-click layer. IME/composing/229 and modified
navigation shortcuts are ignored. Tabs do not acquire menu typeahead behavior.

Roving focus is local and coupled to selection/guard state. The broader menu primitive was
not imported merely for similarity: its typeahead and outside-hidden availability policy
are inappropriate for inactive nested tabsets. Only the existing tiny owned-attribute
utility is reused; no popup/menu engine or positioning dependency is bundled.

Placements top/bottom/left/right/start/end control CSS Grid; start/end follow RTL, while
physical left/right remain physical. Side placements use vertical tablist orientation.
**Logical DOM order remains tablist before panes**, including visually bottom/right layouts,
so relationships and sequential focus order stay consistent. This explicit visual placement
is not undocumented DOM reversal or node movement. Segment appearance is permitted with
the retained placements, not a claim of upstream's exact restriction.

bar/line/card/segment are authored data-tabs-type styles; small/default medium/large are CSS
classes. External tokens cover pane padding, tab padding, indicator width, strip padding,
justify-content, colors and vertical strip height. Prefix/suffix/pane-wrapper/tab classes are
ordinary authored classes. The indicator is a per-selected-tab pseudo-element, not measured
width/position animation. Optional opacity entrance, reduced motion, forced colors and print
are external CSS. State/variant selectors do not style nested tabsets as though they were
the parent's tabs.

Overflow is native tab-strip scrolling; focus makes tabs discoverable. Optional centering
and scrollToCurrentTab use the browser's scrolling API on the appropriate axis and can
scroll ancestors/page as that native API specifies. No scroll-button generator, automatic
overflow packing or syncBarPosition no-op is shipped. CSS is self-contained, with no runtime
relative imports or style text; geometry is not measured/written by the controller.
Centering follows accepted guarded activation or the explicit scrolling method; direct value
overrides do not force a scroll.

### Corrected default appearance and bounded visual differences

With no type attribute, the stylesheet uses **bar**, matching the reference default.
Small/medium tabs use 14px text and large tabs 16px, all at 1.5 line height.
Bar/line/card active weight is 400; Segment active weight is 500.

| Top-placement type | Small / medium / large padding | Gap |
| --- | --- | --- |
| bar | `4px 0` / `6px 0` / `10px 0` | 36px |
| line | `6px 0` / `10px 0` / `14px 0` | 36px |
| card | `8px 16px` / `10px 20px` / `12px 24px` | 4px |
| segment | `4px 0` / `6px 0` / `8px 0` | 0, equal-width tabs in a 3px-padded rail |

Panes default to transparent/unbordered, with 8/12/16px padding by size on the edge
next to the strip: top, bottom, physical left/right, or logical start/end.
Start/end swap under RTL; physical left/right do not. Vertical card padding is
`8px 12px` / `10px 16px` / `12px 20px` for small/medium/large.
There is no extra root grid gap or forced first-child margin reset. Pane content
keeps its application typography/margins; size classes no longer scale all pane text.

Select `data-mui-theme="light|dark"` on the root or an ancestor. Private defaults
use title-role tab text, body-role pane text, divider-role borders and correct
card/segment surfaces. Shared `--mui-color-primary` is consumed only for its
correct active/hover brand role; it does not recolor Segment's neutral selection.
The application still owns document background and `color-scheme`.

Existing public padding/color/background/indicator tokens remain authoritative.
`--mui-tabs-hover` and `--mui-tabs-disabled` additionally customize those states.
Small/large/type defaults are private rather than writes to the public padding token.
Public `--mui-tabs-pane-padding` and `--mui-tabs-tab-padding` override every
placement/size recipe. A just-disabled selected tab can exist until the controller's
observer refresh; disabled foreground wins immediately, and the controller then
selects an available pair. Direct assignment of a disabled selection is rejected.

This is not a complete placement/artwork renderer:

- The native line indicator is per-tab and measured 1px above the source's
  border-overlapping line; bar geometry matches within ordinary pixel rounding.
- Segment paints the selected button instead of a measured moving capsule.
  Its native disabled button stays visibly muted; the pinned Segment CSS leaves
  disabled text at the ordinary tab color.
- Card corner/open-border orientation and continuous gap/baseline artwork remain
  simplified. The vertical line strip still retains the native block-end baseline;
  its sampled outer height differs by the rendered border thickness, not by
  incorrect pane padding or tab density.
- Native scrollbar dimensions, clipping and per-tab indicators are not the
  source scroll-mask/buttons/measured-motion system. These differences are not
  claims that equivalent artwork is impossible with additional application CSS.

## Leave guards and races

`beforeLeave(nextKey, previousKeyOrNull)` accepts a boolean or Promise/thenable of boolean.
True commits, false keeps the old pane, and rejection/throw/invalid return keeps the old
pane and reports failure. This deliberately validates the documented boolean contract rather
than accepting arbitrary truthy objects. No guard means allow. Initial/recovered selection
and direct value overrides bypass the hook.

The request promise is published **before calling application code**. A guard may redirect
to another guarded key without overwriting the newer lastRequest. Reentering its own pending
target from inside the guard is rejected rather than creating a self-dependent Promise.
Repeated external requests for the same pending target share its promise; requesting the
already-selected old tab cancels a pending departure.

Each request tracks sequence, binding lifetime, key and exact tab/pane nodes/IDs. New requests,
direct overrides, disposal and invalid/replaced/unavailable associations supersede old work.
Harmless label refresh may preserve a valid request. A stale true result resolves false
without selecting or focusing; a stale rejection remains an explicit diagnostic but never
reveals error UI in a new session.

Failures emit `mui:tabs-error` with `{ error, value, previous, stale }` and leave lastRequest
rejected. Current failures reveal the authored alert; pending requests expose authored status
and aria-busy without disabling all tabs, allowing newer requests. Diagnostic error events
may arrive on the original root after disposal; applications should inspect stale before
changing their own UI. Guard cancellation does **not** abort external work or undo side effects.

Focus is not blindly restored on resolution. If the old pane still owned focus, hiding it
repairs focus to the new tab/empty region; unrelated outside focus is preserved. Parent
visibility recovery includes focused nested descendants without capturing their tab actions.
Post-focus/commit identity checks prevent disposed/superseded bindings from notifying.

## Add/close intents and refresh

An authored named type=button[data-tabs-add] outside the tablist emits mui:tabs-add with the
native event. A separately labelled type=button[data-tabs-close="key"] outside the tablist,
or Delete on an available closable tab, emits mui:tabs-close with its captured key/tab/pane/
event. Mark a tab or its pane data-tabs-closable to enable Delete; an associated external
close control also establishes closability. Disabled tabs do not issue close intent.

Controls are siblings/auxiliary actions, **never buttons nested inside a tab button** or
extra action roles inside the tablist. Intents work independently of CSS card appearance,
deliberately adapting the source's card-only rendered controls. The helper never creates,
removes or closes application data. Close admission captures the original pair/association;
retargeting a close button before its queued task cannot close a different pane.
Add/close does not implicitly run the leave guard; the application owns removal policy.

The demo application clones an authored native template on add and removes the requested
pair on close, then refreshes. Refresh validates every pair/order, preserves surviving keys
and original pane nodes, and silently selects a suitable next/previous available neighbor
after active removal/disabling. Focus recovery includes pane controls and nested tabsets.
Do not replace only half a pair or leave stale external close references.

Root/structural observers, queued admissions and transient UI are cleaned on disconnect;
root removal also disconnects. Refresh failures restore readable authored panes and report
an error rather than claiming a partial binding. IDs are never helper-generated. Full CSS/
default/native-state compatibility is limited to the declared anatomy and styles, not a
universal renderer or arbitrary framework mutation protocol.

## Original acceptance — 2026-09-08 (historical)

- **69 targeted tests pass:** 42 Tabs plus 27 native/legacy cases
  (`npm exec vitest run -- tests\tabs.test.ts tests\native.test.ts`).
- `npm run build` passes TypeScript/declarations, independent ESM/classic/CSS exports and
  all old/new bundle gates. No core/plugin/shared keyboard or positioning source changed.
- Chromium primary checks cover actual roles/hidden panes, automatic/manual arrows,
  Home/End/disabled skip, native Enter/Space once, Tab into pane, nested independence,
  preserved input/node state, false/rejected guards, add-template/Delete intent, neighbor
  recovery and native form safety.
- Read-only review found reentrant promise bookkeeping, stale queued override/close targets
  and nested-pane focus recovery defects. Each was fixed with targeted regressions; actual
  Chromium also confirmed the new guard handle, explicit override priority, captured close
  target and nested focus recovery paths.

- Further Chromium checks verify all six placements and physical/logical RTL positioning
  with unchanged logical DOM order, isolated nested card/segment styling, reduced motion,
  forced colors, print-readable inactive panes, CSS 2x zoom, standalone/classic/ESM across
  realms, both legacy load orders and readable no-JS parent/nested panes.
- Chromium's accessibility tree confirms selected tab and named tabpanel semantics; the
  all-disabled state exposes authored empty content and namespace collisions preserve the
  original API. Test-created frames/contexts were removed; the existing demo server was reused.
- Audit preserves 44 original owner/name/source identities and resolves 50 tracker rows
  (40 adapted targets, 10 omissions). Across 96 routes, totals are 3,268 rows and 160/384
  accepted tasks, with 13 Planned P3 routes. All 278 relative file links in changed docs
  resolve; inventory coverage is not upstream feature parity.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Tabs ESM | 14,507 | 5,325 | 6,000 |
| Tabs classic | 14,664 | 5,393 | 6,000 |
| Tabs CSS | 5,258 | 1,338 | 1,750 |
| Core minified, unchanged | 62,558 | 14,611 | 15,000 unchanged |
| Advanced, unchanged | 6,554 | 2,181 | 3,000 unchanged |
| Widgets, unchanged | 10,858 | 2,779 | 4,000 unchanged |

At original delivery, one JS format plus CSS was **6,663 gzip bytes ESM** or **6,731 classic**.
Previous optional bundles/ceilings remain unchanged; no shared keyboard or popup engine was
modified or bundled as a dependency. These are historical delivery measurements,
not evidence that the current integrated build has already passed.

No all-browser,
screen-reader, physical touch/zoom or universal AT certification is claimed.
P3 remains in progress. **Next: Collapse, then the remaining P3 inventory.**
