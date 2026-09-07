# MarkupUI component migration architecture

**Status: proposal, not an implemented API.** This plan uses Naive UI as a feature and
interaction reference, not as a framework, dependency, source-code transplant, or promise of
one-to-one compatibility. Start with the [component index](index.md) for individual trackers.

Reference snapshot: Naive UI 2.45.3, commit
[`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
MarkupUI baseline: commit `5dcb190`, package version 0.11.0. Research date: 2026-09-07.
Upstream documentation and implementation observations are separate evidence; undocumented
internals are not public contracts.

The [master migration plan](migration-plan.md) records later implementations and commits.
Avatar, Button and Card now have standalone external-CSS entries; their accepted component
records take precedence over prospective examples here. The baseline table below describes
the unchanged legacy aggregate, not the complete current set of optional components.

## 1. Non-negotiable constraints

| Concern | Decision |
| --- | --- |
| Runtime dependencies | None, including optional MarkupUI modules. No framework, positioning, date, validation, rendering, or styling library is required at runtime. |
| Authoring model | Ordinary HTML, separate CSS files, and ordinary JavaScript. TypeScript remains an internal development tool; consumers do not need a compiler or package manager. |
| Structure | Semantic native elements and light DOM; authored children remain inspectable and styleable. No virtual DOM, JSX, or required Shadow DOM. |
| Behavior | Small custom-element controllers and explicit APIs. No expression evaluator, reactive rendering framework, or mandatory application store. |
| Presentation | External CSS, CSS custom properties, and state attributes. No handwritten CSS strings embedded in component JavaScript. |
| Loading | A small default distribution and explicitly chosen optional components. Browsing the catalog must not imply importing the whole catalog. |
| Compatibility | Preserve existing `mui-*` names and supported behaviors. Any incompatible API or distribution change requires an explicit migration path and appropriate release version. |
| Safety | Untrusted text stays text. No executable HTML attributes, arbitrary string evaluation, or unsanitized rich-content insertion. |
| Reference use | Summarize upstream behaviors independently and cite their provenance. No requirement to reproduce every Naive UI prop or framework-specific abstraction. |

Zero dependencies means zero **runtime** dependencies. The existing TypeScript, esbuild, and
Vitest development tools can remain; neither their existence nor a developer lockfile means
consumers must use a bundler.

### Native-platform-first implementation

Modern browser facilities are the first implementation choice, not an afterthought. Prefer
one native primitive plus a small custom-element controller over reimplementing the primitive.
Use a `template` only when it removes duplication or preserves authored structure; simple
static content does not need a template or a controller.

| Browser facility | Preferred use | Boundary |
| --- | --- | --- |
| Custom Elements | Reusable behavior with lifecycle callbacks and documented properties/attributes. | Light DOM by default; adoption and reconnection must preserve authored nodes and values. |
| `template` / `HTMLTemplateElement` | Inert authored anatomy and reusable rows/items cloned with `document.importNode(template.content, true)` into the host document. | No interpolation language or evaluator; set text/properties on identified nodes and maintain unique IDs and label references. |
| Native controls, `details` / `summary` | Forms and basic disclosure with browser keyboard/interaction semantics. | Enhance instead of replacing; do not add custom keyboard handlers that duplicate native behavior. |
| `dialog` | Modal focus, top-layer display, native cancellation and form submission where applicable. | Component code still defines naming, close policy, restoration and nested ownership. |
| Popover API | Nonmodal top-layer surfaces and built-in light dismissal where supported. | It does not automatically supply menu/listbox roles, keyboard navigation or anchor positioning. |
| CSS anchor positioning | Position floating content with fewer measurement listeners. | Adopt only within the documented browser support target; use the small local positioning helper when necessary. |
| CSS Flexbox/Grid, logical properties, container queries and `:has()` | Layout, direction, responsive composition and state-dependent presentation. | Avoid JavaScript layout/state mirrors when CSS suffices; evaluate support for the chosen selectors/features. |
| `ResizeObserver`, `IntersectionObserver` | Observe actual size/visibility for justified positioning, lazy work and virtual windows. | Disconnect observers on disposal; do not replace native image lazy loading when it already meets the requirement. |
| `AbortController` and native events | Dispose listener groups and cancel explicitly owned async work. | Recreate aborted controllers on reconnection and distinguish cancellation from failure. |
| `Intl`, native date/time controls and `input[type=color]` | Small formatting and input baselines. | Document platform-specific presentation and value semantics instead of promising full custom-picker parity. |
| `ElementInternals` | Optional form-associated behavior only where a native child control cannot provide it. | Account for labels, validity, reset, state restoration and duplicate submissions; not a mandatory base-class dependency. |
| Shadow DOM and native `slot` | An exception when real isolation/projection has a concrete benefit. | Not the default: evaluate light-DOM styling, forms, accessibility and theming costs first. A `slot` in light DOM is not native projection. |

Document a browser support target before selecting a less widely available feature. Detect
capabilities and choose a small, usable fallback or reduce the feature scope. Do not accumulate
polyfill dependencies to imitate every browser feature. Native support can remove code, but
does not by itself prove complete accessibility or upstream feature parity.

## 2. What exists and what must change

The source already uses native custom elements and has no runtime package dependencies. That
is a useful base, not evidence of complete separation or Naive UI parity.

| Current evidence | Consequence for the plan |
| --- | --- |
| [Element registry](../../src/components/elements.ts) contains native controllers alongside styling-only element classes. | Classify each feature individually; registration is not implementation completeness. |
| [Core styles](../../src/components/styles.ts) and both [advanced](../../src/plugins/advanced.ts) and [widgets](../../src/plugins/widgets.ts) modules contain CSS in TypeScript. | Extract authored CSS into separate source files before substantial catalog expansion. |
| [Default entry](../../src/index.ts) automatically installs styles and registers all core elements. | Keep this convenience entry compatible; design separate explicit-registration and external-CSS entries rather than silently changing it. |
| [Form controls](../../src/components/forms.ts) often generate or replace native children on connection. | Add an authored-native-child enhancement path; do not destroy author markup, labels, event listeners, or pre-upgrade values. |
| [Content components](../../src/components/content.ts) include minimal avatar, progress, and button behavior. | Record supported slices rather than treating matching component names as parity. |
| [Overlay controllers](../../src/components/overlays.ts) already use native dialog and a local floating-position helper. | Reuse and harden these concepts; test lifecycle, nesting, focus, scroll, and clipping before sharing them across more controls. |
| [Theme API](../../src/theme/index.ts) stores global registrations and writes CSS properties inline. | Keep existing calls compatible, but provide stylesheet-based themes and explicit per-root configuration for the separated path. |
| [Build script](../../scripts/build.mjs) enforces compressed JavaScript budgets. | Do not relax limits merely to fit more components; account separately for extracted CSS and total loaded assets. |
| [Native tests](../../tests/native.test.ts) cover representative behaviors. | A passing existing test does not verify all properties, keyboard paths, or browser interactions of a component. |

This documentation change does not perform these refactors.

## 3. HTML, CSS, and JavaScript responsibilities

### HTML owns structure and content

Prefer native elements inside custom-element wrappers: `button`, `input`, `select`, `label`,
`fieldset`, `table`, `details`, `summary`, `dialog`, and ordinary links. A custom tag name does
not confer native semantics or form behavior.

Use explicit child anatomy for compound widgets, following existing card and dialog children.
For repeated custom content, allow an authored `template` whose nodes are cloned and updated
locally. No template language or general-purpose rendering engine is needed. Light-DOM child
conventions are not native Shadow DOM slots: each component must document which children it
recognizes and how they are preserved.

Native authored controls must remain useful when JavaScript is unavailable. Complex optional
widgets may provide a simpler static list/table/input fallback instead of pretending their full
interaction works without JavaScript.

### CSS owns presentation

Each component's source stylesheet describes layout, appearance, focus-visible states,
disabled/loading states, reduced motion, and logical directions. Shared tokens belong in a
small base stylesheet; component selectors are scoped to their component roots.

Use classes or attributes for finite states and CSS properties for configurable values.
Avoid assigning fixed visual styles in controllers. Numeric layout measurements required by
positioning, resizing, or virtualization are a documented exception: isolate such writes to a
small adapter and assess their Content Security Policy implications. A strict-CSP baseline
cannot assume inline theme tokens or style injection are allowed.

Named light/dark themes should work with a root selector and external CSS. Existing
`mui.theme.register` remains an optional programmatic convenience, not the required styling
path. Use inherited `dir` and CSS logical properties; do not promise complete RTL coverage
without component-specific interaction checks.

### JavaScript owns behavior

A controller adopts authored nodes, wires listeners, updates the smallest necessary DOM
surface, and exposes methods/properties. It does not regenerate the entire subtree for every
value change. Ordinary query selectors, event listeners, and direct assignments are sufficient
for consumers.

Connection must be idempotent. Disconnection must release listeners, observers, timers,
requests, and overlay registrations; reconnection must restore functioning behavior.
Initialization must also work when nodes arrive after the host is connected or properties
were assigned before custom-element definition.

## 4. Proposed source and distribution boundaries

These paths are a target design, not current exports:

```text
src/
  core/                 lifecycle and narrowly shared behavior
  styles/               base rules and theme stylesheets
  components/
    avatar/
      avatar.ts         controller, no embedded CSS
      avatar.css        component presentation
    button/
      button.ts
      button.css
  optional/             independently imported heavier controllers/styles
demo/
  components/
    avatar.html         authored structure and example content
    avatar.js           explicit example behavior, when needed
    avatar.css          example-specific layout, when needed
```

Source TypeScript produces plain JavaScript. A proposed external-CSS consumption example:

```html
<!-- Proposed distribution; these separate CSS/explicit-registration paths do not exist yet. -->
<link rel="stylesheet" href="./vendor/markup-ui.css">
<link rel="stylesheet" href="./app.css">
<script defer src="./vendor/markup-ui.classic.js"></script>
<script defer src="./app.js"></script>
```

Plan both a classic-script distribution with the existing global API convention and ES-module
entries. Neither mode should require a CDN fetch, dynamic remote dependency, or consumer
build step. Optional classic-script entry points must be explicit rather than assuming that
every optional ES-module bundle works as a classic script.

The current automatic style-installing entry is a compatibility distribution. Any generated
style-injection adapter for it must be derived from the same CSS source; it must not become
a second maintained stylesheet. The external-CSS distribution is the target for classic web
separation and CSP-sensitive applications.

## 5. Public API mapping rules

| Upstream surface | Proposed MarkupUI rule |
| --- | --- |
| Simple string/number prop | A documented kebab-case HTML attribute, with a typed JS property where live updates are useful. Specify parsing, bounds, and reflection rather than implicitly coercing. |
| Boolean prop | HTML presence semantics: `disabled="false"` is still present. Typed property setters add/remove the attribute. |
| Array/object prop | A JS property with a documented shape; use native child markup for the simple declarative case. Do not encode functions or large datasets in attributes. |
| Controlled value and default value | Start with native current-value/default-value semantics. Programmatic assignment is normally silent; user interaction emits events. Explicit controlled behavior, if needed, must have a documented contract rather than inheriting Vue's `undefined` rules. |
| Callback or `on-update:*` prop | A DOM event for notification. Use documented typed details and normal `addEventListener`; reserve function-valued properties for contracts that actually need a return value or Promise. |
| Cancelable action callback | Define a cancelable before-event or explicit async hook. Specify cancellation, errors, pending UI, concurrency, and completion separately. |
| VNode/render callback/slot | Authored DOM children, a native `template`, or a narrowly specified DOM hook; no Vue VNodes, JSX, component constructors, or general renderer. |
| Theme override | External CSS custom properties and scoped classes/selectors. Do not mirror an upstream theme-object dependency graph. |
| Provider/injection API | Native inheritance where possible (`lang`, `dir`, CSS); otherwise explicit scoped configuration and document/root-owned services with disposal. |
| Framework router prop | Native `href`, links, and events. Application router integration remains application code. |
| Third-party renderer integration | Omit from the dependency-free component contract, or accept already-authored content. No implicit import of KaTeX, a syntax highlighter, or an icon library. |

Retain current `mui:input` and `mui:change` conventions and existing detail shapes where
supported. Do not introduce a new generic event shape globally without migration planning.
Specify whether native child events also bubble; adapters must not process both a native
event and its custom equivalent as two user changes.

For forms, prefer retaining a real named native control. Document label association,
validation, disabled-fieldset behavior, submission, reset, and default values. Consider
`ElementInternals` only when a component cannot preserve native form semantics directly;
do not submit both an internal control and a form-associated host value.

## 6. Shared behavior before feature expansion

| Foundation | Required design work | Main consumers |
| --- | --- | --- |
| Lifecycle and attribute updates | Adopt rather than replace authored nodes; reflect documented attributes; preserve pre-upgrade values; reconnect without duplicate events. | All interactive components |
| Focus and keyboard | Native behavior first; scoped roving focus/typeahead when required; preserve focus across DOM updates. | Menu, tabs, tree, listbox, grid |
| Floating surfaces | Native Popover/anchor positioning when supported, small local fallback where needed; viewport/clipping, scroll and resize updates, escape and outside-click ownership. | Tooltip, popover, select, pickers |
| Modal surfaces | Native dialog/top layer, accessible naming, focus restoration, cancel policy, nested ownership and cleanup. | Dialog, drawer, modal, image preview |
| Form integration | Consistent value/default contracts, labels, validity and reset; explicit async validation without adopting a schema library. | Inputs, selection, form |
| Collection identity | Stable user-supplied keys, no selection-by-index after reorder; documented async loading and error state. | Tree, table, transfer, cascader |
| Virtual windows | A bounded-DOM primitive with explicit sizing, scrolling and focus semantics; variable heights are separately scoped. | Virtual list and opt-in large collections |
| Locale and direction | Native `Intl`, explicit locale data, documented date-value semantics and logical CSS. | Date/time, calendar, pagination |

Reuse current helpers where suitable, but do not build all foundations into a mandatory
application runtime. Each helper needs at least one concrete consumer before abstraction.

## 7. Catalog disposition and delivery order

The inventory is a comparison and planning surface, not a commitment to ship 96 components in
the core or to copy every upstream behavior. The [migration plan](migration-plan.md) is the
task-level roadmap and status dashboard; the same phase numbering is used below.

| Stage | Deliverable | Exit criterion |
| --- | --- | --- |
| 0. Contracts and separation | CSS extraction design, compatibility entries, native-child conventions, lifecycle/event/form contracts, per-feature inventory. | Agreed examples run as plain HTML/CSS/JS in the proposed distribution design; API decisions are recorded, not inferred from names. |
| 1. Pilot components | Complete Avatar, Button and Card using the separated pattern. | Each retained pilot feature has an implementation, example, and relevant evidence. |
| 2. Primitives and layout | Tags, typography, layout and common display/feedback. | Native/CSS-first implementations without unnecessary controllers or optional imports. |
| 3. Interaction foundations | Harden focus, popover/dialog behavior, tabs, menu and navigation. | Browser interaction cases cover keyboard, focus, cancellation, nested widgets and reconnects. |
| 4. Forms and selection | Native inputs, groups, validation and optional enhanced entry. | Consistent value, label, submission, reset and event behavior. |
| 5. Opt-in collections | Tree, cascader, transfer, richer table, virtualization and async loading. | Stable-key, large-list, accessibility and cancellation contracts are met with bounded rendering costs. |
| 6. Specialized additions and exclusions | Advanced date/time, upload lifecycle, richer carousel, utilities and explicit scope exclusions. | Independent entry points and size budgets; no runtime dependencies; omissions are not counted as implemented. |

Native/CSS-only solutions come before new custom elements. A complex feature can remain
**Not reviewed** or be **Intentionally omitted** rather than forcing an oversized replacement.
For example, QR encoding is not supplied by a native browser API; a dependency-free encoder
would require its own optional scope and correctness work. Math typesetting and programming
language parsing must not sneak external engines into the default library.

Current enforced gzip limits are 15,000 bytes for `markup-ui.min.js`, 3,000 for the advanced
bundle, and 4,000 for widgets. These are ceilings, not additional space available for new work.
Once CSS is separate, track both per-asset size and the total JS+CSS for equivalent examples.
Moving bytes from JS to CSS is not itself a payload reduction. New optional modules need
individual proposed budgets and must stay out of the default dependency graph.

## 8. Migration tracking and evidence

Track **documentation coverage**, **source inspection**, and **implementation progress**
separately. A documented upstream prop can have a complete inventory entry while its
MarkupUI equivalent remains undecided.

| Status | Meaning |
| --- | --- |
| Not reviewed | The item is inventoried but its target behavior or baseline has not been fully assessed. |
| Planned | A proposed mapping and acceptance scope exist; this does not claim implementation. |
| In progress | An identified implementation change is actively underway; link it. |
| Implemented | The agreed target behavior exists with a source/commit reference, but acceptance evidence is incomplete. |
| Verified | Target behavior has the required evidence, including real-browser interaction where relevant. This is not a blanket claim of Naive UI parity. |
| Intentionally omitted | The item is deliberately outside scope, with a recorded reason and alternative when appropriate. |

Every property, callback, slot, method, and companion API item must be separately identifiable.
Inherited API references must point to the referenced tracker; do not silently drop inherited
surfaces or count a link as an independently audited implementation.

A useful tracker row records the upstream owner/name, proposed HTML/JS/CSS equivalent,
status, current baseline evidence, and remaining acceptance work. Keep callbacks requiring
return values distinct from fire-and-forget events. Preserve deprecated names in the
inventory with a disposition so their disappearance cannot be mistaken for migration.

Component-level status summarizes accepted scope, not just the highest-completed row.
Avoid percentage completion until the denominator and exclusions are fixed. In particular,
an existing `mui-avatar` does not mean every Avatar or AvatarGroup property is implemented.
Update the component page and index in the same implementation change.

## 9. Acceptance checklist for retained features

1. Document a classic HTML/CSS/JS example and, where useful, a plain ES-module equivalent;
   mark proposed paths until the exports exist.
2. Cover initial markup, live attribute updates, JS property updates, pre-upgrade values,
   removal/reconnection, and authored-child preservation.
3. Exercise native labels, form submission/reset/validity where relevant; distinguish
   disabled, readonly, loading, empty, and error states.
4. Cover keyboard and pointer use, accessible names/roles/states, focus entry/exit and
   restoration, reduced motion, and direction-sensitive interactions.
5. For async features, test out-of-order results, cancellation, errors, disposal and loading
   state; never substitute success-shaped defaults for failures.
6. For HTML-bearing features, preserve safe-text defaults and use the existing sanitization
   boundary only for explicitly requested rich HTML.
7. Check external-CSS mode, no unexpected network loads or runtime dependencies, default
   bundle isolation, and agreed combined payload budgets.
8. Keep browser-native layout/focus behavior under browser acceptance evidence. The current
   jsdom suite cannot establish positioning, native dialog, or accessibility conformance.

Use the existing `pnpm check` and native test suite during implementation for the behavior they
cover. No new runner or dependency is introduced by this documentation plan. A browser-based
acceptance setup, if needed later, is a separate implementation decision, not something these
tracker files claim already exists.
