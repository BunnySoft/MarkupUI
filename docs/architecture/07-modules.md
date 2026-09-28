# 7. Small core and selectable components

**Implemented for the shared core and 89 selectable families, with explicit payload
ceilings. Chart's new ceilings remain provisional pending release approval.**
Follow the useful jQuery/plugin pattern: load one small core, then only the features the
application needs. This is a packaging and extension pattern, not a dependency on jQuery.

## Delivery units

| Unit | Includes | Must not include |
| --- | --- | --- |
| Shared core | Thin `ViewElement`, native conversion helpers and registration support. | Metadata engines, every component, optional binding/query engines or unrelated feature services. |
| Component/plugin | Direct properties/methods, companions and required local helpers. | A private copy of the shared core or the all-components bundle. |
| Component CSS | Styles needed by the selected component. | Unrelated component styles. |
| Optional subsystem | Binding, query or other features explicitly selected by the application. | Hidden automatic activation across the whole document. |
| Aggregate bundle | An optional convenience composition. | A prerequisite for using individual components. |

Source remains in the [existing areas](06-source.md). The build packages the common runtime
once instead of embedding its implementation into every component output.

## Loading behavior

| Format | Consumer experience |
| --- | --- |
| ESM | Import the chosen component entry; it imports the shared core and only declared dependencies. A consumer bundler is not required for served browser modules. |
| Classic scripts | Load core first, then selected component/plugin scripts in dependency order, plus their CSS. |
| Aggregate | Choose it deliberately when its included features are wanted; modular loading must remain available. |

Core alone must not register every UI component. A component entry registers only its own
family and extends the core through its public registration/plugin APIs where needed.
Do not require an optional query wrapper merely to use a Custom Element.

Dependencies must be explicit. For example, a menu component may need positioning behavior,
but that must not pull in an entire feedback/navigation catalog. Document the required
files and ordering in the component's API page.

## Shared identity and errors

Components in one application must share the same `ViewElement` implementation.
Do not ship independent runtime copies behind apparently identical imports.
An incompatible duplicate registration must fail rather than silently replace an element.

Classic modules report a missing required core/dependency clearly. They must not silently
load the aggregate bundle as a fallback. Do not mix incompatible aggregate/modular copies
or ESM/classic versions of the same component in one page.

## Payload accounting

The optional root facade now shares the same core as selected components. Its ESM files
import `markup-ui-core.js` and `markup-ui-state.js`; classic loading is
`markup-ui-core.global.js`, `markup-ui-state.global.js`, then `markup-ui.global.js`.
Neither root format embeds another base implementation or private binding owner.
`dist/manifest.json` records these root and optional plugin costs in `entryPayloads`,
including runtime dependencies and CSS. The existing 15,000-byte minified-root ceiling
also gates core-inclusive minified ESM and classic runtime; no ceiling is increased.

The optional `advanced` plugin retains only `m-data-grid`/`m-data-column`, and `widgets`
retains only `m-rating`. They extend the supplied API's `ViewElement` base and register
atomically. Date Picker, Time Picker, Upload, Virtual List, Breadcrumb, Timeline,
Color Picker, Transfer and Cascader must be selected through their canonical family
entries and CSS; plugins no longer register or style competing copies.

| Measurement | Count |
| --- | --- |
| First selected component | Shared core, that component, required dependencies and selected CSS. |
| Additional component | Only files not already loaded, plus that component's CSS/dependencies. |
| Aggregate comparison | Its complete runtime and style cost, not only its entry file. |

Splitting files can make the first load slightly larger because separate files compress
less efficiently. The benefit is amortizing common runtime cost across components and
avoiding unused features. Do not claim a saving by excluding required dependency bytes.

The build manifest and API documentation must agree on dependency files and total costs.
Keep approved budgets unless a measured change is explicitly accepted.
Both ESM and classic builds enforce the exact manifest runtime ceiling, without a
format-specific allowance. Distribution tests independently gzip the shipped files and
sum their dependencies; source-only measurements are not release evidence.

The optional `@dataengine/markup-ui/state` entry provides the store and scalar/model
binder without core, components, query or the aggregate. Served ESM is
`markup-ui-state.js`; classic scripts expose `MarkupUIState` from
`markup-ui-state.global.js`. Each format has a 4,000-byte gzip ceiling. The root facade
reuses this entry, and its existing dependency-inclusive 15,000-byte ceiling is unchanged.

The implemented entries are `@dataengine/markup-ui/core`, `@dataengine/markup-ui/avatar`,
`@dataengine/markup-ui/button`, `@dataengine/markup-ui/card`, `@dataengine/markup-ui/carousel`,
`@dataengine/markup-ui/collapse`, `@dataengine/markup-ui/divider`, `@dataengine/markup-ui/dropdown`,
`@dataengine/markup-ui/icon`, `@dataengine/markup-ui/typography`, `@dataengine/markup-ui/space`, `@dataengine/markup-ui/flex`, `@dataengine/markup-ui/input`, `@dataengine/markup-ui/checkbox`, `@dataengine/markup-ui/radio`, `@dataengine/markup-ui/switch`, `@dataengine/markup-ui/input-number`, `@dataengine/markup-ui/select`, `@dataengine/markup-ui/form`, `@dataengine/markup-ui/grid`, `@dataengine/markup-ui/layout`, `@dataengine/markup-ui/tag`, `@dataengine/markup-ui/badge`, `@dataengine/markup-ui/empty`, `@dataengine/markup-ui/spin` and `@dataengine/markup-ui/skeleton`.
ESM uses `markup-ui-core.js`; classic scripts load `markup-ui-core.global.js` before
`markup-ui-avatar.global.js`, `markup-ui-button.global.js`, `markup-ui-card.global.js`,
`markup-ui-carousel.global.js`, `markup-ui-collapse.global.js`, `markup-ui-divider.global.js`,
`markup-ui-dropdown.global.js`, `markup-ui-icon.global.js`, `markup-ui-typography.global.js`, `markup-ui-space.global.js`, `markup-ui-flex.global.js`, `markup-ui-grid.global.js`, `markup-ui-layout.global.js`, `markup-ui-tag.global.js`, `markup-ui-badge.global.js`, `markup-ui-empty.global.js`, `markup-ui-spin.global.js` or `markup-ui-skeleton.global.js`.
See the [API guide](../api/README.md) for exact exports and usage.

Input additionally imports `markup-ui-native-input.js`, the internal native-field mechanics
also used by unmigrated control compositions. Classic loading is core, then
`markup-ui-native-input.global.js`, then `markup-ui-input.global.js`; the native dependency
uses a private symbol, not a second public Input helper API. It registers no elements and
includes no other component or core copy. Input's manifest accounts for all three files:
the Input ESM/classic ceilings remain 4,000 gzip bytes each, shared native mechanics have
4,000-byte ceilings, CSS retains 1,800 bytes, and the new combined-runtime ceiling is 7,500.
The retained `.m-input` CSS skin is also used by unmigrated native controls; do not import
Input registration just to access their internal helper. The aggregate no longer registers
legacy `m-input`/`m-textarea` or styles their native fields.

Checkbox imports only core. Classic loading is `markup-ui-core.global.js` then
`markup-ui-checkbox.global.js`, plus `markup-ui-checkbox.css`. The two own-tag classes
share one family entry and the existing native checkbox CSS hooks; there is no additional
native-control chunk, text-input engine or helper registration. Each JS ceiling remains
3,500 gzip bytes and CSS remains 1,000; combined core-plus-family runtime has a 4,750-byte
ceiling in either format. CSS distribution trims whitespace only. The manifest counts both
runtime files plus CSS. Radio/Switch are not selected by this entry.

Radio imports core and the internal `markup-ui-native-radio.js`. Classic loading is core,
`markup-ui-native-radio.global.js`, then `markup-ui-radio.global.js`, with Radio CSS.
Radio, RadioGroup and RadioButton are the only registered constructors. The existing native
group validator/controller is shared with unmigrated Rate; it registers nothing and the
former public group-helper API is removed. Rate imports only this internal dependency,
not Radio registration or core. Its classic demo loads native-radio before Rate.

Radio retains the 3,000-byte gzip ceiling for each JS file and the 1,250-byte CSS ceiling.
The shared native-radio files have measured 2,000-byte ceilings; combined core-plus-native
plus Radio runtime has a 5,500-byte ceiling in either format. Rate retains its 4,000-byte
per-file ceilings and has a new 5,000-byte dependency-inclusive ceiling. The manifest
counts every required runtime file and CSS. Radio CSS whitespace is trimmed; canonical
size/status attributes replace archived data-size/data-status configuration without changing
the native colors, dimensions or four-pixel button seams.

Switch imports only core. Classic loading is core then `markup-ui-switch.global.js`, with
Switch CSS. The entry registers only Switch, reusing its native loading mechanics rather
than importing Input/Radio or a second controller. Existing per-file gzip ceilings stay
3,500 bytes for each JS format and 1,250 for CSS. The manifest counts core plus Switch
runtime and CSS; combined runtime has a 4,500-byte ceiling in either format. CheckboxGroup
excludes Switch-owned native controls, and the aggregate no longer registers or styles the
legacy MSwitch. Select Switch explicitly in applications that previously used that entry.

InputNumber imports only core. Classic loading is `markup-ui-core.global.js` followed by
`markup-ui-input-number.global.js`, with `markup-ui-input-number.css`. The entry registers
only `m-input-number` and exports `InputNumber`/`registerInputNumber`; it replaces both the
public factory and widgets-plugin constructor. No native-input/native-radio chunk or other
component constructors are required. The manifest lists exactly core plus family per format.
Current ceilings are 4,000 gzip bytes for each JS format and 6,000 for combined
core-plus-family runtime; CSS stays at 1,000. No other ceiling is increased.

Select imports core and `markup-ui-native-select.js`. Classic order is core,
`markup-ui-native-select.global.js`, then `markup-ui-select.global.js`, with Select CSS.
Only `Select`/`registerSelect` are public runtime exports; only `m-select` is registered.
The internal native dependency has two real existing consumers, TreeSelect and Popselect,
which now import that dependency rather than the obsolete public Select helper. It contains
no registrations or core copy. Their classic scripts load native-select first; their ESM
entries import it automatically. Neither consumer requires core or Select registration.

Select keeps the existing 4,000-byte per-format JS ceilings and 1,000-byte CSS ceiling.
The native-select files have 4,000-byte ceilings, retaining the old native helper budget;
Select's new combined core-plus-native-plus-family runtime ceiling is 8,000. The manifest
counts all three runtime files and CSS. TreeSelect/Popselect retain every existing per-file
JS/CSS ceiling, with new dependency-inclusive runtime ceilings of 10,500/11,000 respectively.
These new totals account for separate-file gzip overhead rather than hiding the shared cost.
No sibling ceiling, including InputNumber's tight 3,998-byte classic/1,000-byte CSS outputs,
is changed.

## Chart delivery

Chart selects core, the small `markup-ui-chart-renderer.js` adapter and the family entry,
plus CSS. No ECharts implementation or declarations ship in MarkupUI. The application
explicitly supplies an ECharts engine through `configureChartEngine(echarts)` exported
from `@dataengine/markup-ui/chart`. For served ESM, the adapter file also exposes this
function so setup can precede Chart registration. Classic order is core, adapter,
explicit engine configuration, then Chart. Load the application's engine before configuring
it; MarkupUI does not discover global engines or fetch a CDN fallback.

The application chooses either full ECharts or registered selected modules. The tested demo
engine is ECharts 6.1.0; see the [Chart setup](../../demo/components/chart.html#required-files)
for module requirements. The repository build generates demo-only vendor assets and licenses
outside `dist`; neither they nor ECharts are mandatory package dependencies.

Chart's reduced provisional ceilings are 12,000 gzip bytes per wrapper, 1,000 per adapter,
15,000 for core+wrapper+adapter, and 1,500 for CSS. The manifest's `externalDependencies`
explicitly records the engine as application-supplied and excluded from payload byte totals.
Complete application cost still includes the selected ECharts engine; externalization does
not eliminate its download. Engine-inclusive performance/payload approval remains a release gate.

## Form delivery

Form selects only core plus the family entry; the existing validation coordinator stays
inside that entry. ESM imports `markup-ui-core.js`. Classic order is
`markup-ui-core.global.js`, then `markup-ui-form.global.js`, with `markup-ui-form.css`.
The three registered classes are Form, FormItem and FormItemGi. FormItemGi uses the existing
`.m-form-grid` CSS semantics, not Grid registration. Demo Input/Switch assets are additional
example selections, not Form dependencies.

The approved Form ceilings are **7,000 gzip bytes per JavaScript format**, **8,250 including
shared core**, and **1,250 for CSS**. Current measured ESM/classic family costs are 6,376/6,547,
core-inclusive runtime costs are 7,359/7,587, and CSS is 1,152.
The coordinator remains inside the family rather than being split solely to fit a per-file gate.
Budget failures stop the build before its delivery manifest is written.

## Grid delivery

Grid/GridItem select core plus one family entry and CSS. ESM imports `markup-ui-core.js`;
classic order is `markup-ui-core.global.js`, then `markup-ui-grid.global.js`, with
`markup-ui-grid.css`. No Grid constructor is bundled in passive Collapse/Dropdown/Tooltip
consumers: they import only the pure tag predicate. FormItemGi has no Grid dependency.
The legacy aggregate no longer registers MGrid; its showcase selects the canonical family.
Pending Layout aliases and native `.m-grid` CSS consumers are retained.

Grid's new measured-budget ceilings are **1,750 gzip bytes per JS format**, **3,000 for
core-inclusive runtime**, and the existing **1,500 CSS**. Output is 1,449/1,555
family bytes, 2,432/2,595 core-inclusive bytes, and 613 CSS bytes (3,045/3,208 including CSS).
Passive Grid support increased Tooltip classic output to **5,014 bytes**, exceeding its
5,000-byte limit by 14; its authorized ceiling is now **5,100**. Tooltip ESM remains
4,941 against 5,000, with no extra runtime dependency. All other existing budgets stay
unchanged. The failed budget run wrote no delivery manifest; budget checks remain fail-fast.

## Layout delivery

Layout and its four companion regions (`LayoutHeader`, `LayoutContent`, `LayoutFooter`, `LayoutSider`)
select core plus one family entry and CSS. ESM imports `markup-ui-core.js`; classic order is
`markup-ui-core.global.js`, then `markup-ui-layout.global.js`, with `markup-ui-layout.css`.
The legacy aggregate no longer defines `MLayout` in `src/components/content.ts`.
Authored landmarks and native `.m-layout*` CSS consumers remain fully supported.

Layout's measured-budget ceilings are **2,000 gzip bytes per JS format**, **3,000 for
core-inclusive runtime**, and the existing **1,500 CSS**. Current measured ESM/classic family
costs are 1,294/1,459 bytes, core-inclusive runtime costs are 2,277/2,499 bytes, and CSS is
1,180 bytes (3,457/3,679 including CSS). All budget checks remain fail-fast.

## Tag delivery

Tag and its canonical `Tag` class select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-tag.global.js`, with `markup-ui-tag.css`. The legacy aggregate no longer defines
`MTag` in `src/components/content.ts`. Checkable mode wraps or adopts native buttons with `aria-pressed`;
closable emits `m:close` intent without removing content.

Tag's measured-budget ceilings are **3,500 gzip bytes per JS format**, **4,500 for
core-inclusive runtime**, and the existing **2,500 CSS**. Current measured ESM/classic family
costs are 2,348/2,514 bytes, core-inclusive runtime costs are 3,330/3,553 bytes, and CSS is
2,273 bytes (5,603/5,826 including CSS). All budget checks remain fail-fast.

## Badge delivery

Badge and its canonical `Badge` class select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-badge.global.js`, with `markup-ui-badge.css`. The legacy aggregate no longer defines
`m-badge` in `src/components/elements.ts`. Badge formats passive counts, caps, dot/processing
indicators, and logical placements over native target elements.

Badge's measured-budget ceilings are **2,500 gzip bytes per JS format**, **3,500 for
core-inclusive runtime**, and the existing **2,000 CSS**. Current measured ESM/classic family
costs are 1,501/1,676 bytes, core-inclusive runtime costs are 2,484/2,716 bytes, and CSS is
1,273 bytes (3,757/3,989 including CSS). All budget checks remain fail-fast.

## Empty delivery

Empty and its canonical `Empty` class select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-empty.global.js`, with `markup-ui-empty.css`. The legacy aggregate no longer defines
`m-empty` in `src/components/elements.ts`. Empty generates readable fallback text and decorative
vector illustrations while adopting authored icon, description, and recovery controls.

Empty's measured-budget ceilings are **2,500 gzip bytes per JS format**, **3,500 for
core-inclusive runtime**, and the existing **1,500 CSS**. Current measured ESM/classic family
costs are 1,622/1,803 bytes, core-inclusive runtime costs are 2,605/2,843 bytes, and CSS is
842 bytes (3,447/3,685 including CSS). All budget checks remain fail-fast.

## Spin delivery

Spin and its canonical `Spin` class select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-spin.global.js`, with `markup-ui-spin.css`. The legacy aggregate no longer defines
`m-spin` in `src/components/elements.ts`. Spin provides customizable size presets or numeric
dimensions, delay cancellation, original SVG geometry, wrapped content adoption, and adopted
regions for custom icons and descriptions.

Spin's measured-budget ceilings are **3,500 gzip bytes per JS format**, **4,500 for
core-inclusive runtime**, and the existing **2,000 CSS**. Current measured ESM/classic family
costs are 3,019/3,187 bytes, core-inclusive runtime costs are 4,002/4,227 bytes, and CSS is
1,183 bytes (5,185/5,410 including CSS). All budget checks remain fail-fast.

## Skeleton delivery

Skeleton and its canonical `Skeleton` class select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-skeleton.global.js`, with `markup-ui-skeleton.css`. The legacy aggregate no longer defines
`m-skeleton` in `src/components/elements.ts`. Skeleton provides customizable dimensions, bounded
repetition, size presets, shape variants, and inert decorative placeholder generation.

Skeleton's measured-budget ceilings are **2,500 gzip bytes per JS format**, **3,500 for
core-inclusive runtime**, and the existing **1,500 CSS**. Current measured ESM/classic family
costs are 1,743/1,911 bytes, core-inclusive runtime costs are 2,506/2,670 bytes, and CSS is
912 bytes (3,418/3,582 including CSS). All budget checks remain fail-fast.

## Popover delivery

Popover and its companion regions (`PopoverTrigger`, `PopoverContent`) select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-popover.global.js`, with `markup-ui-popover.css`. The legacy aggregate no longer defines
`m-popover` in `src/components/elements.ts`. Popover provides 12 directional placements,
click/hover/focus/manual modes, collision flipping, arrow decoration, and adopted regions for trigger and panel content.

Popover's measured-budget ceilings are **5,750 gzip bytes for ESM**, **6,000 for Classic**,
**7,000 for core-inclusive runtime**, and the existing **1,000 CSS**. Current measured ESM/classic family
costs are 5,379/5,551 bytes, core-inclusive runtime costs are 6,362/6,591 bytes, and CSS is
958 bytes (7,320/7,549 including CSS). All budget checks remain fail-fast.

## Tooltip delivery

Tooltip and its companion regions (`TooltipTrigger`, `TooltipContent`) select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-tooltip.global.js`, with `markup-ui-tooltip.css`. The legacy aggregate no longer defines
`m-tooltip` in `src/components/elements.ts`. Tooltip provides noninteractive contextual descriptions,
text attribute, 12 directional placements, hover/focus triggering, collision flipping, arrow decoration, and adopted regions for trigger and panel content.

Tooltip's measured-budget ceilings are **7,000 gzip bytes per JS format**, **8,000 for
core-inclusive runtime**, and the existing **1,250 CSS**. Current measured ESM/classic family
costs are 6,537/6,722 bytes, core-inclusive runtime costs are 7,520/7,762 bytes, and CSS is
1,206 bytes (8,726/8,968 including CSS). All budget checks remain fail-fast.

## Alert delivery

Alert and its canonical `Alert` class select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-alert.global.js`, with `markup-ui-alert.css`. The legacy aggregate no longer defines
`m-alert` in `src/components/elements.ts`. Alert provides semantic notice types, safe title fallback,
decorative vector icons, adopted content regions, and cancellable close intent without automatic removal.

Alert's measured-budget ceilings are **2,500 gzip bytes per JS format**, **3,500 for
core-inclusive runtime**, and the existing **2,000 CSS**. Current measured ESM/classic family
costs are 2,229/2,412 bytes, core-inclusive runtime costs are 3,212/3,452 bytes, and CSS is
1,689 bytes (4,901/5,141 including CSS). All budget checks remain fail-fast.

## Dynamic Tags delivery

Dynamic Tags selects core plus its own family entry and CSS. Its helper imports
collection mechanics and types directly from `dynamic-input/dynamic-input.ts`, not
Dynamic Input's registering entry. Loading Tags alone does not register
`m-dynamic-input` or bundle its element class. Selecting both families in either order
retains each family's canonical constructor and their common core.

S2 unifies Tags through its internal controller and removes the public
`createDynamicTags` export. The element exposes draft/commit, values/stable keys,
duplicate policy and Web lifecycle hooks. Form examples are entirely `m-*` authored;
Form and Button are extra demo selections, not Tags dependencies.

After Input reconciliation, Dynamic Tags measures 10,979/11,125 entry gzip bytes and
12,402/12,597 including core (ESM/classic); CSS is 1,178 bytes. The initial Tags
reconciliation added 597/591 JS gzip bytes relative to S1 to close the element's
capability and portable-configuration gaps. Input's shared-controller corrections
add another 21/16 bytes. These are not size savings. S0 remains the frozen comparison
baseline. No runtime dependency file or ceiling changed; core and unrelated families
remain unchanged.

## Dynamic Input delivery

Dynamic Input selects core plus one family entry and CSS, registering only
`m-dynamic-input` and `m-dynamic-input-template`. The element delegates row transactions
to its internal controller; the public factory is removed. The template region maps
portable `m-*` field content to an inert native Web template. Default fields need no
other component. For custom templates, load the selected field families before Dynamic
Input initializes; their normal dependencies remain explicit application selections.
The demo's Box/Input/Form/Button assets are not hidden Input dependencies.

ESM/classic entries measure 7,361/7,515 gzip bytes, or 8,784/8,987 including core.
CSS is 818 bytes. Compared with the pre-Input state, JS grows 118/126 gzip bytes while
raw entries shrink 414/415 bytes. The unchanged 9,000-byte combined ceiling passes,
with only thirteen classic bytes of headroom. No shared extraction, budget increase or
optional aggregate is included in this task.

## Tree delivery

Tree selects core plus one family entry and CSS. Runtime exports are `Tree`,
`TreeNode` and `registerTree`; no public controller/factory or parser helper is
required. Registration checks the entire family before defining `m-tree-node`
and `m-tree`. Public markup remains nested `m-*` elements; Web rendering owns
the named native section, ul/li, details/summary, links/buttons and labelled checks.
Lazy loading accepts bounded `TreeItem` data and synchronous disposal, not native
HTML authoring. Native descriptors remain an explicit Web inspection surface.

ESM entry/runtime gzip costs are 10,352/11,775 bytes; classic costs are
10,515/11,987. CSS costs 1,186 bytes. The unchanged 12,000-byte runtime ceiling
leaves only 13 classic bytes of headroom. This reconciliation increases Tree's
gzip size by 216/201 bytes from the preflight state, despite reducing raw bytes.
The shared hierarchy parser changes also affect Cascader/Tree Select output,
but neither family imports Tree's controller, elements or registration. No extra
mandatory JS file is emitted. See [the measured record](10-size-optimization.md).

## Calendar delivery

Calendar selects core plus one family entry and CSS, registering only `m-calendar`.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js` then
`markup-ui-calendar.global.js`. Public runtime exports are `Calendar`, `calendarModes`
and `registerCalendar`; the public factory is removed. The internal controller owns
both day and month selection, bounded preparation, keyboard navigation and cleanup.
Portable markup needs no native table/template or additional component; those are Web
renderer details. Box/Button/Typography on the demo are extra example selections.

ESM/classic entries measure 8,931/9,097 gzip bytes, or 10,354/10,569 including core.
This saves 120/111 gzip bytes relative to the pre-Calendar state. CSS grows from
1,237 to 1,249 bytes, leaving one byte under its unchanged 1,250-byte ceiling.
The 10,500-byte entry and 11,000-byte runtime ceilings are unchanged. No additional
dependency is emitted and neither Date Picker nor Popover registration is imported.

Calendar date validation now round-trips its existing native UTC Gregorian carrier
without requiring native date-input support. The shared utility also reduces Heatmap's
entry to 8,041/8,193 gzip bytes (9,464/9,665 with core).
`buildHeatmap(options)` drops its unused Document argument; no compatibility overload
is retained. This narrow shared-utility change does not complete Heatmap's S2 work.

## Reproducible size reports

After `pnpm build`, run `pnpm size:report` (or `node scripts/size-report.mjs`).
The build retains esbuild metafiles and output hashes in `.vite/size/build.json`;
the report is written to `.vite/size/report.json`. Neither file is published.
The report checks the manifest and output hashes before measuring actual bytes and
level-9 gzip per file. Stale or missing evidence requires a rebuild.

`docs/architecture/size-baseline.json` is the S0 pre-optimization baseline.
`pnpm size:report --check-regressions` also rejects raw/gzip increases or changed ESM
export names relative to it. The default command reports changes without rejecting
growth within existing ceilings; raising/removing an existing ceiling is still rejected.
Only an intentional baseline capture uses `--write-baseline`; do not use it to clear a
regression. `--baseline <file>` and `--output <file>` allow separate experiments.

Each cost has an exact, deduplicated file list. Component costs distinguish entry-only
from complete transitive runtime and separate CSS. Selections cover Grid, Dropdown,
dynamic collections, hierarchy, floating controls and all 89 families. Root/plugins
are separate optional costs; unminified root assets are explicitly marked.
ESM imports and classic bridge inputs verify component dependencies. The two optional
plugins also account for their caller-supplied root API dependency.

The report ranks entry gzip and component-owned raw source contributions, and lists
repeated retained source contributions from metafiles. These raw attributions are
diagnostics, not removable gzip bytes. ESM export changes are flagged as potentially
non-equivalent comparisons; unchanged names do not prove behavior equivalence.
Chart's required application-owned engine remains outside library totals, with the
built demo engine measured separately as one concrete selection, not a universal cost.

## References

- [Plugin support source](../../src/core/plugin.ts)
- [Component registration entry](../../src/components/avatar/index.ts)
- [Build configuration](../../scripts/build.mjs)
