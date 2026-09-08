# Collapse and CollapseItem: native disclosures

**🟢 Verified for the retained native details/summary scope.**
CSS-only authored disclosures are the baseline. An optional small helper adds string-key
aggregation, root-scoped exclusive groups, disabled activation and explicit native-event
notifications. It does not render, measure heights or replace native disclosure semantics.

## Loading and native markup

| Asset / export | Purpose |
| --- | --- |
| `@dataengine/markup-ui/collapse/style.css` | Independent `dist/markup-ui-collapse.css`; usable without JS |
| `@dataengine/markup-ui/collapse` | `createCollapse` and controller/options/name/event-detail types |
| `dist/markup-ui-collapse.js` | Standalone ESM helper |
| `dist/markup-ui-collapse.global.js` | Classic `window.MarkupUICollapse.createCollapse`; refuses namespace replacement |
| `demo/components/collapse.*` | Native HTML, separate JS and CSS; no backend actions |

```html
<link rel="stylesheet" href="./vendor/markup-ui-collapse.css">
<script defer src="./vendor/markup-ui-collapse.global.js"></script>
<script defer src="./collapse-setup.js"></script>

<div class="mui-collapse" data-collapse id="sections">
  <div class="mui-collapse-row">
    <details data-collapse-item data-collapse-key="overview" open>
      <summary>Overview</summary>
      <div data-collapse-content><p>Original content and native controls remain.</p></div>
    </details>
    <div data-collapse-extra><button type="button">Independent extra action</button></div>
  </div>
  <details data-collapse-item data-collapse-key="advanced" data-collapse-disabled>
    <summary>Advanced settings are temporarily unavailable</summary>
    <div data-collapse-content><p>The label stays readable; no inert summary is generated.</p></div>
  </details>
</div>
```

```js
// collapse-setup.js; alternatively import { createCollapse } from "@dataengine/markup-ui/collapse".
const collapse = window.MarkupUICollapse.createCollapse(document.querySelector("#sections"), {
  accordion: true
})
collapse.expandedNames = "overview"
collapse.setDisabled("advanced", false)
collapse.disconnect()
```

The optional helper requires a connected light-DOM div/section.mui-collapse[data-collapse].
Each owned item is a native details[data-collapse-item] with a unique nonempty **string**
data-collapse-key, first meaningful noninteractive summary, and one distinct direct
data-collapse-content region. Keys are not the native `name` attribute and are never generated
or numerically coerced. A nested group has its own data-collapse root; bare nested items in
the same group are rejected to prevent parent/child exclusive-name collisions.

No custom element is registered. Existing legacy mui-accordion-item remains unchanged and
must not share this anatomy. Core/helper loading order has no fake enhanced-before-legacy
rule. Use one helper entry/copy per group rather than binding duplicate ESM/classic instances.

Native summary owns role, keyboard and expanded state. The helper never adds role=button,
aria-expanded, tabindex or synthesized Enter/Space/click toggling. Inert/hidden summaries,
authored aria-expanded/aria-disabled or conflicting widget roles are rejected; the helper's
disabled marker is the explicit contract. Decorative custom arrows require aria-hidden=true.
Content, title nodes, native controls, listeners and inert templates remain untouched.
Templates can be instantiated by application code; no expression or rendering engine exists.

## Native names and group state

**Native details.name exclusivity is document-scoped**, not component-scoped. For a no-JS
exclusive group, authors must choose unique names across the document, including nested
groups. Browsers without native name support show independent disclosures instead.
The demo uses separate author names for primary/nested/separate groups.

While connected, the helper owns managed name values:

- accordion=true uses a unique per-controller native name where supported.
- accordion=false temporarily removes authored names, so this group is actually independent.
- A small native-open mutation fallback enforces exclusivity even if the name property is
  unavailable; it follows the latest actual open mutation and does not measure layout.
- Native names are not temporarily restored during routine refresh/live mode changes.
  Per-item ownership transfers handle moved disabled items without releasing destination
  state or misclassifying another helper's aria-disabled as authored metadata.

On ownership release, prior authored names are restored only if still owned. That restoration
can re-enable the author's document-wide native grouping and consequently close panels.
The application remains responsible for safe author names after disposal; the helper cannot
promise that reintroducing conflicting original names has no native side effects.

| API | Contract |
| --- | --- |
| `connected`, `nativeExclusive` | Helper lifetime and presence of native details.name support; the latter is not all-browser certification |
| `expandedNames` | Getter always returns a fresh string array of actual owned open items |
| `expandedNames = string \| string[] \| null` | Validated native open request; null means none; accordion permits at most one |
| `accordion` | Live boolean; enabling normalizes existing opens to one and establishes scoped names |
| `setDisabled(name, boolean)` | Update the item's activation-disabled marker and owned summary aria-disabled |
| `refresh()` | Revalidate/rebind authored items while preserving native state, valid queued header clicks and ownership |
| `connect()`, `disconnect()` | Idempotent explicit lifetime; reconnect after reinsertion |

Initial expandedNames overrides defaultExpandedNames. Defaults are consumed only once;
without them, authored open state is adopted. Refresh/reconnect does not replay defaults.
The native getter is not a controlled Vue prop that continuously locks user changes.
Unknown keys, duplicate keys/names, numeric names, wrong flags or unsupported options throw.
An empty group is valid and returns an empty actual array.

**Open and disabled-marker configuration persist.** They are real browser/application state,
not temporary rendering to roll back. Disconnect removes helper-specific name/ARIA/root
decoration and listeners, but does not explicitly undo the user's/native open choices or
the caller's setDisabled configuration. The native name-restoration caveat above still applies.

## Disabled activation, native events and extra actions

data-collapse-disabled blocks **user activation** of the native summary. Capture click
prevention also blocks clicks generated by native Enter/Space. It does not use inert,
hide the label, remove the summary from Tab order, or freeze content controls.
The helper supplies aria-disabled=true only alongside real activation prevention.
Preserved author click listeners still run and can observe defaultPrevented.

Like the inspected source's disabled-header policy, an explicit application request to set
open/expandedNames may still open or close a disabled item. Disabling an already open item
does not destroy/hide its content. Direct native property changes remain authoritative.
If the application wants the whole subtree unavailable, that is a separate authored native
policy—not an automatically generated inert summary.

**Without JS, disabled-marker enforcement is unavailable.** The recommended markup omits
aria-disabled, so unsupported helper behavior is not falsely announced. Native disclosures
remain readable and usable rather than hidden dead controls. Do not depend on CSS or
aria-disabled alone to block keyboard activation.

Notifications are explicit adaptations:

- `mui:collapse-header-click`: after an accepted primary summary click completes native
  dispatch, detail `{ name: string, expanded: boolean, item, event: MouseEvent }`.
  Later target/delegated preventDefault is honored. Disabled headers do not notify.
  Expanded is actual state when the queued notification runs; rapid clicks can share a final
  state. It is not a synchronous Vue requested-state callback.
- `mui:collapse-change`: mirrors each owned native toggle with
  `{ expandedNames: string[], name, expanded, item, event }`. Native toggle is asynchronous/
  coalesced and also fires for programmatic open changes. Exclusive transitions may produce
  more than one native notification with the same final group snapshot.
- `mui:collapse-error`: `{ error }` for failed automatic revalidation. Explicit invalid
  refresh throws after cleanup. No successful empty value masks invalid anatomy.

No custom event pretends to be user-only when it reflects native programmatic toggling.
Property assignment does not fabricate a header-click event. No callback arrays, controlled
state merge, random source names or renderer-prop objects are forwarded.

Header-extra content lives in a **sibling outside details/summary**, normally a second grid
column of `.mui-collapse-row`. This trades full-row content width for safe, nonoverlapping
native anatomy. Extra actions never toggle a header through this helper. A direct extra
button or descendant button needs an explicit button/submit/reset type; intentional form
submission remains native. Buttons inside summary labels are rejected, not event-stopped
after creating invalid nested interaction.
Configurable main/arrow/extra trigger-area arrays are omitted: summary activates the native
disclosure, extra siblings act independently.

## Focus, mutation and teardown

The helper adopts focus already inside content at connection. Closing content by native,
exclusive or programmatic state changes repairs still-owned focus to the visible summary.
Nested descendants count for parent visibility recovery but not for parent header events.
Unrelated outside focus is preserved; outside pointer/focus interaction clears the group's
focus claim. Native Tab excludes closed content automatically; there is no focus trap.

Structural/key/title/disabled changes refresh bindings without replacing nodes or replaying
defaults. A valid pending header notification survives routine refresh only for the same
item/summary/key. Removed or transferred nodes cannot notify through the previous group.
Moved helper-owned disabled items are handed off before destination validation; old
controller disposal cannot remove the destination's disabled state.

Root removal disconnects automatically. Explicit teardown is still the normal application
contract. Disconnect cancels tasks, observers and listeners; restoration affects only owned
attributes, not original text/content/listeners/templates. A disposed controller cannot
release a replacement group's claim. Invalid extra/summary/item structures fail clearly.

Native name, summary ARIA and item-marker mutation ownership is explicit: use the controller
or refresh after structural changes rather than competing with helper-managed ARIA/names.
Restoring authored names on item removal/disposal can re-enable native author grouping as
described above; it is not an application-wide exclusivity service.

## External CSS and retained limits

CSS controls borders, spacing, logical flow, focus, disabled presentation and optional icons.
The default keeps the native summary marker. For an authored custom arrow, use
data-collapse-custom-arrow on the item and a decorative data-collapse-arrow element with
data-collapse-title. Group data-collapse-arrow-placement left/right controls custom-arrow
order, including RTL; native marker positioning otherwise remains browser-owned.
`.mui-collapse-arrow-rotate` and `.mui-collapse--arrow-motion` opt into a small arrow rotation,
not panel-height animation. Reduced motion disables it; forced colors use system colors.

There is **no height measurement, ResizeObserver animation, CSS-in-JS, provider, renderer,
mandatory CollapseTransition or transition library**. The independent CollapseTransition
route remains later work. Print uses ink-friendly summary/content presentation and native
open state; it does not force closed content to print or claim that every browser prints it.
No-JS independent/exclusive-native disclosure and plain content are the baseline.

## Acceptance — 2026-09-08

- **60 targeted tests pass:** 33 Collapse, 27 native/legacy
  (`npm exec vitest run -- tests\collapse.test.ts tests\native.test.ts`).
- `npm run build` passes TypeScript/declarations, independent CSS/ESM/classic exports and
  all current budgets. Core/plugins and previous optional bundles are unchanged.
- Chromium primary acceptance: native pointer/Enter/Space, nested and independent exclusive
  groups, disabled activation with readable focusable labels, explicit programmatic override,
  extra actions/forms, preserved native input/text nodes, closed-content Tab and focus repair.
- Review fixes cover nested extra boundaries, disabled ownership transfer, preexisting focus
  at setup and direct extra-button type validation. Chromium also verifies transfer/disposal
  ownership, namespace stability on refresh/mode changes, narrow/RTL/zoom, reduced arrow
  motion and native print summaries.

- Additional Chromium evidence verifies a named/focusable disabled summary in the accessibility
  tree, forced colors, helper-only/classic/ESM across realms, both legacy load orders,
  fallback exclusivity without the native name property, no-JS ordinary disclosure/links
  and explicit absence of disabled-marker enforcement without the helper.
- Audit preserves all 27 original owner/name/source identities and resolves 33 rows
  (19 adapted targets, 14 omissions). The 96-route inventory totals 3,274 rows and 164/384
  accepted tasks, with 12 Planned P3 routes. All 284 relative file links in changed docs
  resolve. These counts are not full source parity; CollapseTransition remains separate.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Collapse ESM | 10,187 | 3,784 | 4,000 |
| Collapse classic | 10,353 | 3,855 | 4,000 |
| Collapse CSS | 2,723 | 819 | 1,000 |
| Core minified, unchanged | 62,558 | 14,611 | 15,000 unchanged |
| Advanced, unchanged | 6,554 | 2,181 | 3,000 unchanged |
| Widgets, unchanged | 10,858 | 2,779 | 4,000 unchanged |

CSS-only native disclosure costs **819 gzip bytes**. One helper format plus CSS is
**4,603 ESM** or **4,674 classic**. All previous optional bundles/ceilings remain unchanged.
Use one helper distribution/copy per document for cross-group item handoff; disconnect
before moving ownership across documents or separately loaded module copies.

No universal
exclusive-name, closed-content printing, all-browser or assistive-technology certification
is claimed. P3 remains in progress. **Next: Anchor, then Back Top.**
