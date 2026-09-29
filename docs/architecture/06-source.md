# 6. Source layout and ownership

**Implementation rule for contributors and AI agents:** follow the existing source layout.
Do not create a parallel component tree or move working logic merely to change bundle output.
Use the [component development guide](../elements/04-development.md) for the end-to-end workflow.

## Source areas

| Location | Responsibility |
| --- | --- |
| `src/core` | Public facade, `ViewElement`, plugin support and genuinely shared Web utilities. |
| `src/platform` | Platform-neutral types and contracts; not an execution engine for element properties. |
| `src/components` | Component families, their public elements, styling and local implementation details. |
| `src/actions` | Named action registration and invocation. |
| `src/state` | Explicit state and binding services; not private stores copied into each component. |
| `src/theme` | Theme data and resource application. |
| `src/security` | Shared HTML/URI policy and sanitization. |
| `src/overlay` | Shared overlay/feedback services. |
| `src/query` | Optional query helpers and their extensions; components must not require them. |
| `src/plugins` | Optional feature/plugin entries. |
| `src/index.ts`, `src/global.ts` | Package entry/facade code, not a home for component implementations. |

Keep TypeScript source in `src` and generated JavaScript/declarations/assets in `dist`.
Relative TypeScript imports use `.js` specifiers, following the existing NodeNext setup.
Follow surrounding formatting and reuse existing owners/helpers before adding another layer.

`ViewElement` is the sole Web base, including the optional root facade and its retained
foundation/dynamic elements. `src/core/element.ts` and the unreferenced aggregate
`content.ts`, `forms.ts`, `navigation.ts` and `overlays.ts` implementations are removed.
The root exports `ViewElement` and exposes it as `m.elements.Base`; it does not provide
an `MElement` compatibility alias. Optional plugins keep only their distinct retained
tags and do not redefine selected component families.

## Component-family pattern

Avatar is the first proving family. The same responsibilities apply to later components:

| File | Owns |
| --- | --- |
| `avatar.ts` | `Avatar`, direct accessors, resource behavior, rendering and lifecycle. Small named region classes may stay here. |
| `group.ts` | AvatarGroup's direct properties and grouping behavior. |
| `avatar.css` | Component presentation and private-part/state selectors. |
| `model.ts` | Reused types and value constants; no handwritten parallel element definition. |
| `index.ts` | Public exports and registration for this family only. |
| `global.ts` | Thin classic-script entry using the same implementation. |

The corresponding `demo/components` HTML/CSS/JS files own component examples and end-user
documentation. `scripts/component-api.mjs` extracts source information into generated
`demo/api` JSON; `demo/component-api.js` renders it. Neither is part of the library bundles.
Do not duplicate this information in component Markdown APIs.

Add files for real boundaries, not to satisfy a template. A complex reusable controller
may remain separate; a small region does not automatically need its own file.
Do not create provider, source, adapter and manager layers around every element.

Input's four public classes live in `src/components/input/input.ts`. The internal
`src/components/native-input.ts` owns shared clear/reveal/count, native-event and cleanup
mechanics used by Input and unmigrated native-control compositions. It has no registration
or public package helper export; selected builds account for its shared dependency explicitly.
Input's source-declared native-field base shares real editing mechanics and direct accessors.
The documentation extractor follows that source inheritance up to (but not through)
`ViewElement`, so each concrete class documents its complete API without runtime reflection.

Checkbox's direct native checkbox API lives in `src/components/checkbox/checkbox.ts`;
`group.ts` owns the native fieldset's computed selection, constraints and lifecycle.
The former public group helper is replaced, not wrapped or duplicated. Its native ownership
symbol remains a concrete boundary with DataTable and Tree selection. Checkbox does not import the
text-specific `native-input.ts` engine; no hypothetical Radio/Switch sharing chunk is emitted.

Radio and RadioButton's direct native accessors live in `src/components/radio/radio.ts`;
`group.ts` owns the canonical fieldset wrapper and lifecycle. The internal
`src/components/native-radio.ts` retains actual native group validation/ownership also used
by unmigrated Rate. It has no registration constructors, text-input code or public helper
package export. Selected Radio and Rate entries share this dependency explicitly.

Switch's direct native accessors and existing reversible loading mechanics live together in
`src/components/switch/switch.ts`. Its native checkbox owns the sole switch role and form/
focus behavior; authored controls and content survive lifecycle changes. There is no
separate helper facade, async request engine or speculative shared native-control bundle.

InputNumber's direct accessors and retained native stepping/action leases live together in
`src/components/input-number/input-number.ts`. The real number input owns drafts, numeric
and string state, native defaults, validity and forms. Its detached probe uses native
stepping with the actual value-attribute grid base. The former factory and widgets-plugin
registration are removed; no Input/Radio engine or additional shared chunk is imported.

Select's canonical native-owner API lives in `src/components/select/select.ts`. The internal
`src/components/native-select.ts` retains actual option validation, silent value writes,
literal filtering, clear actions and native lifecycle mechanics already used by both
TreeSelect and Popselect. This is a real existing consumer boundary, not a budget-only
split: neither consumer imports Select registration or core. Its classic symbol is private;
there is no public `createSelect`/`SelectController` facade. Select does not clone native
options or retain the aggregate's legacy `MSelect` registration. The root facade retains
`m-option`; some families parse inert option configuration. Select owns native options,
not an `m-option` renderer.

Form's native-owner API lives in `src/components/form/form.ts`, with FormItem
and FormItemGi in `item.ts`. `controller.ts` retains the existing explicit native-field
validation coordinator, including snapshots, abortable local validators and reversible
feedback. It is bundled into Form, not emitted as a budget-only shared dependency.
`FormLayout` only shares the family's two presentation accessors; it is not a provider.
The old aggregate MForm/MFormItem classes and public factory are removed. Native labels,
legends, controls and forms remain the semantic owners; see the [demo/API](../../demo/components/form.html).

Grid's direct layout properties live in `src/components/grid/grid.ts`; `item.ts` owns the
optional column span/start. Its pure `model.ts` tag predicate permits passive composition
without importing constructors or registration. Both elements reuse reversible style writes
and never inspect, measure or replace children. Existing native `.m-grid` CSS consumers remain
supported; competing aggregate implementations and Layout aliases are removed.
See the [Grid demo/API](../../demo/components/grid.html) for the native CSS scope.

Layout's direct shell properties live in `src/components/layout/layout.ts`; `regions.ts`
owns `LayoutHeader`, `LayoutContent`, `LayoutFooter` and `LayoutSider`. Its pure `model.ts`
tag predicate defines the five layout tags without importing constructors or registration.
Layout elements use native CSS flex shells, borders, sidebar placement, embedded backgrounds
and positioning without measuring children or creating synthetic landmarks. Competing aggregate
`MLayout` is removed from `content.ts`. See the [Layout demo/API](../../demo/components/layout.html).

Tag's direct properties and checkable/closable mechanics live in `src/components/tag/tag.ts`,
with pure types and detail contracts in `model.ts`. Tag extends `ViewElement` and registers
only `m-tag`, adopting native buttons for checkable or closable mode while leaving passive tags
noninteractive. Competing aggregate `MTag` is removed from `content.ts` and `elements.ts`.
See the [Tag demo/API](../../demo/components/tag.html).

Badge's direct properties and indicator mechanics live in `src/components/badge/badge.ts`,
with pure types in `model.ts`. Badge extends `ViewElement` and registers only `m-badge`,
formatting passive counts, caps, overflow suffixes, dot/processing indicators and logical
placements while preserving authored target nodes, listeners, focus and native form behavior.
The legacy aggregate `["m-badge", class extends MElement {}]` is removed from `elements.ts`.
See the [Badge demo/API](../../demo/components/badge.html).

Empty's direct properties and fallback mechanics live in `src/components/empty/empty.ts`,
with pure types in `model.ts`. Empty extends `ViewElement` and registers only `m-empty`,
generating readable fallback text and decorative vector illustrations while adopting
authored icon, description and extra regions.
The legacy aggregate `MEmpty` is removed from `content.ts` and `elements.ts`.
See the [Empty demo/API](../../demo/components/empty.html).

Spin's direct properties and timing mechanics live in `src/components/spin/spin.ts`,
with pure types in `model.ts`. Spin extends `ViewElement` and registers only `m-spin`,
providing customizable sizes, delay cancellation, stroke geometry, wrapped content adoption,
and custom icon and description slotting.
The legacy aggregate `["m-spin", ...]` is removed from `elements.ts`.
See the [Spin demo/API](../../demo/components/spin.html).

Skeleton's direct properties and bar group generation live in `src/components/skeleton/skeleton.ts`,
with pure types in `model.ts`. Skeleton extends `ViewElement` and registers only `m-skeleton`,
providing placeholder shapes, bounded repetition, size presets, dimension normalization,
and inert decorative bar generation.
The legacy aggregate `MSkeleton` is removed from `content.ts` and `elements.ts`.
See the [Skeleton demo/API](../../demo/components/skeleton.html).

Popover's direct properties and floating content mechanics live in `src/components/popover/popover-element.ts`,
with pure types in `model.ts` and companion regions `PopoverTrigger` and `PopoverContent` in `regions.ts`.
Popover extends `ViewElement` and registers `m-popover`, `m-popover-trigger`, and `m-popover-content`,
providing 12 directional placements, click/hover/focus/manual modes, collision flipping, arrow decoration,
and direct trigger/panel adoption while preserving existing `createPopover` and positioning exports.
The legacy aggregate `MPopover` is removed from `overlays.ts` and `elements.ts`.
See the [Popover demo/API](../../demo/components/popover.html).

Tooltip's direct properties and contextual description mechanics live in `src/components/tooltip/tooltip-element.ts`,
with pure types in `model.ts` and companion regions `TooltipTrigger` and `TooltipContent` in `regions.ts`.
Tooltip extends `ViewElement` and registers `m-tooltip`, `m-tooltip-trigger`, and `m-tooltip-content`,
providing 12 directional placements, text attribute, hover/focus triggering, collision flipping, arrow decoration,
and direct trigger/panel adoption while preserving existing `createTooltip` exports.
The legacy aggregate `MTooltip` is removed from `overlays.ts` and `elements.ts`.
See the [Tooltip demo/API](../../demo/components/tooltip.html).

Alert's direct properties and notice mechanics live in `src/components/alert/alert.ts`,
with pure types and detail contracts in `model.ts`.
Alert extends `ViewElement` and registers only `m-alert`,
providing notice types, safe title fallback, semantic SVG icons, adopted regions,
and cancellable close intent while preserving native content, action nodes and listeners.
The legacy aggregate `["m-alert", ...]` is removed from `elements.ts`.
See the [Alert demo/API](../../demo/components/alert.html).

## Shared-runtime boundary

Box's `if.ts` owns `If` / `m-if`: inert conditional source capture and the literal
focus-target API. The existing `src/state/templates.ts` alone owns condition evaluation,
scopes, placement and cleanup. State accesses the ordinary native accessor through a
type-only import; Box never imports state. `native-content.ts` adopts cloned primitive
chrome captured by a template so Label and Details retain one native semantic owner.

Dynamic Tags' element in `dynamic-tags/dynamic-tags-element.ts` now owns only direct
properties and native renderer construction. Its internal `dynamic-tags.ts` owns tag
policy, draft transactions, events and lifecycle; it delegates collection mutation to
`dynamic-input/dynamic-input.ts`. There is no public Tags factory or second element-side
add/remove engine. Portable compositions use `m-dynamic-tags`, `m-form` and `m-button`;
the renderer creates their native owners. Native anatomy and resource callbacks are
explicit Web-only escape hatches, not required authoring. Dynamic Input now uses that
same collection controller through its own canonical element and template mapping.

Chart lives in `src/components/chart`: `chart.ts` owns the Web renderer lifecycle and
native data alternative, `config.ts` the concrete option elements, `dataset.ts` sources
and cancellation, `data.ts` bounded validation/table conversion, `options.ts` the explicit
ECharts mapping, and `renderer.ts` the explicit application-supplied engine adapter.
The build emits that small adapter separately without vendor code or vendor types.
`configureChartEngine(echarts)` supplies the engine; there is no implicit global lookup
or download. The demo owns selected vendor registration in `demo/chart-engine.js`, built
with licenses under ignored `demo/vendor`, outside the published package. Manifest Chart
costs cover MarkupUI assets and explicitly exclude the required application-owned engine.
Neither state binding nor ECharts is added to core or unrelated components.

Dynamic Input's `dynamic-input-element.ts` owns the canonical element and
`DynamicInputTemplate` region. It maps portable templates and default fields into Web
owners, delegating all row transactions to the existing `dynamic-input.ts` controller.
The public factory is removed; Dynamic Tags still imports the controller directly from
its source owner without registering Input. The controller owns stable keys, bounds,
transactions, action leases, focus and resource cleanup. Native-field materialization
uses the selected components' direct `native` accessors, with no runtime constructor
imports, generic property engine or new distribution dependency.

`src/core/view-element.ts` owns common Web mechanics. Component files own direct typed
properties and ordinary method calls. They use small native conversion helpers where useful,
not a metadata lookup or generic property dispatcher.

Calendar's `calendar-element.ts` owns direct properties and the `m-calendar` Web
mapping; `calendar.ts` is the single internal month/year behavior owner.
It retains the controller's bounded preparation/commit, keyboard, focus, native
anatomy validation and cleanup. The public factory and duplicate element renderer
are removed. `date.ts` validates canonical date-only values by round-tripping its
existing native UTC Gregorian carrier, without depending on Date Picker registration
or native date-input support. Heatmap keeps using this same date utility;
`buildHeatmap(options)` no longer takes an unused Document argument. Its actual
callers change together, without reconciling Heatmap's element/controller here.
The carrier is never the public value/instant model.

Tree's `tree-element.ts` and `tree-node.ts` own direct properties and portable
`m-tree`/`m-tree-node` mapping. `web.ts` constructs the same native node anatomy
for authored hosts and bounded lazy data. `tree.ts` is the sole selection, cascade,
disclosure, keyboard, async and cleanup owner. The public factory and duplicate
element interaction engines are removed. Native list items contain the original
node hosts; hosts are never direct children of native lists. `hierarchy.ts` recognizes
that explicit mapping without importing constructors. Cascader continues to use the
passive hierarchy parser without loading Tree registration. Tree Select's later
reconciliation replaces its native-tree round trip with bounded data.
Controller attributes are indexed per element and restored through one cleanup path;
there is no production metadata engine or additional shared-runtime entry.

Documentation tooling reads types, recognized accessor patterns and documentation comments.
It does not import UI modules, construct elements or execute getters. Keep defaults and
validation in the implementation; tooling must not invent values it cannot infer.

Cascader's `cascader-element.ts` maps typed options and the portable host into a native
fieldset and labelled dependent selects. `cascader.ts` is its only path, defaults,
validation, async and cleanup owner; its factory is internal. Passive data validation
and rendering live in `tree/source.ts`, without Tree registration or a new delivery
entry. Loaded data uses this same mapping, not a parallel native-DOM loader API.

Upload's `upload-element.ts` maps `m-upload` and its three content regions into native
fieldset, chooser, queue and actions. The existing `upload.ts` is the sole FileList,
selection, transport, progress, cancellation and reset owner. No public factory,
duplicate file cache or implicit HTTP transport remains. Attribute-only leases stay
local; Upload no longer bundles unused positioning/style-write mechanics.

Heatmap's `heatmap-element.ts` maps typed date/value data and settings to a native
captioned table, cell template, legend and detail/status regions. `heatmap.ts` owns
all calendar rendering, focus/navigation, exploration, palette leases and cleanup;
`model.ts` remains the bounded pure date/domain model. Arbitrary empty row/column
rendering and the public factory are removed. Calendar's date utility is passive,
not a Calendar element or registration dependency.

Tree Select's `tree-select-element.ts` owns direct properties and native-select chrome.
`tree-select.ts` validates bounded hierarchy data and owns projection, live/default
selection, native validity, notifications and lifecycle, reusing `native-select.ts`
for native field/filter behavior. There is no hidden native hierarchy, Tree parser,
Tree registration or public factory. Immutable data updates retain surviving options;
reconnect retains unavailable defaults and distinguishes explicit option disables
from ancestor-derived disabled state.

DOM operations belong in the Web base or component implementation, not documentation
tooling. Keep component-specific resources, focus, accessibility and cleanup with the
component. A shared helper needs a demonstrated common responsibility.

Data Table's `data-table-element.ts` validates typed/JSON column definitions and records,
constructs native controls and retains keyed rows. `data-table.ts` is the sole sorting,
filtering, paging, summary, selection and reset owner. It receives explicit renderer
references and immutable records; callbacks never need native rows. Preparation completes
before row/state mutation, without a second staged-DOM rollback engine or public factory.

Dropdown's `regions.ts` maps portable labels and destinations onto stable native actions,
retaining explicit native adoption. `dropdown.ts` owns the canonical tree's sole mutation
observer. `controller.ts` retains keyboard/submenu/selection lifecycle and a native-only
internal observer for independent Web-controller fixtures. Shared passive-content and
timing validation stays local to Dropdown; there is no additional production entry.

## Entry and packaging rules

The optional root's `foundation.ts` owns Theme token-scope cleanup, Field's generated
native label and local control observer, and App's explicit store/binding/action lifecycle.
`dynamic.ts` owns AccordionItem's retained native button/content and removable activation
listener. They do not import selected control constructors or register component families.
`theme/index.ts` records reversible inline token/marker writes, shared by the service and
Theme element. Root `styles.css` owns only retained root elements, shared tokens/layout
utilities and scoped feedback-service presentation; migrated family styles remain with
their selected component files.

Follow the [small-core/plugin delivery model](07-modules.md).
Thin core entry files may be added within the existing core area when shared distribution
requires them. They re-export shared code; they do not duplicate it or relocate component logic.

The shared runtime's thin entries are `src/core/index.ts` and `src/core/global.ts`.
Component entries must not import the all-components entry to obtain the base class.
Registration uses the shared runtime and only the component's own family. Classic entries
must not define a separate copy of the core or replace an already loaded core.

Shared source files do not automatically produce shared bundles. Implement that boundary
in `scripts/build.mjs` and the package exports, then account for the actual dependency files.

`src/all.ts` is the optional full-catalog entry, not a second component implementation.
It re-exports each of the 89 existing family entries through a distinct camel-case namespace.
The build deduplicates their source inside one ESM/classic file, keeping core and the Chart
adapter external to preserve their identities. Native field helpers are internal to this
aggregate. Selected family entries never import `all.ts`. Static registration preflight
is emitted by the build; generated API JSON is not loaded by production code.
The shared-core boundary is implemented across the 89 selectable families listed in the
[element directory](../elements/05-element-index.md). Required dependencies and costs are
recorded per family in the build manifest; shared delivery is not production acceptance.

## Change checklist

1. Read the current contract and identify the existing source owner.
2. Keep the family structure and implement one canonical API.
3. Update the entry points, assets, examples and API documentation together.
4. Extend the existing focused fixtures and validate the affected build outputs.
5. Confirm that selecting this component does not pull in unrelated components.

## References

- [ViewElement source](../../src/core/view-element.ts)
- [Documentation extractor](../../scripts/component-api.mjs)
- [Avatar source family](../../src/components/avatar/)
- [Build configuration](../../scripts/build.mjs)
