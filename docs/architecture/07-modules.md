# 7. Small core and selectable components

**Implemented for the shared core, all seven initial families, Icon, Typography, Space, Flex, Input, Checkbox, Radio, Switch, InputNumber, Select, Form, Grid, Layout and Tag, with explicit payload ceilings.
The rollout continues component-by-component.**
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
User-approved ceilings are 4,000 gzip bytes for each JS format and 5,500 for combined
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

Tag and its canonical `Tag` class (aliased as `MTag`) select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-tag.global.js`, with `markup-ui-tag.css`. The legacy aggregate no longer defines
`MTag` in `src/components/content.ts`. Checkable mode wraps or adopts native buttons with `aria-pressed`;
closable emits `m:close` intent without removing content.

Tag's measured-budget ceilings are **3,500 gzip bytes per JS format**, **4,500 for
core-inclusive runtime**, and the existing **2,500 CSS**. Current measured ESM/classic family
costs are 2,348/2,514 bytes, core-inclusive runtime costs are 3,330/3,553 bytes, and CSS is
2,273 bytes (5,603/5,826 including CSS). All budget checks remain fail-fast.

## Badge delivery

Badge and its canonical `Badge` class (aliased as `MBadge`) select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-badge.global.js`, with `markup-ui-badge.css`. The legacy aggregate no longer defines
`m-badge` in `src/components/elements.ts`. Badge formats passive counts, caps, dot/processing
indicators, and logical placements over native target elements.

Badge's measured-budget ceilings are **2,500 gzip bytes per JS format**, **3,500 for
core-inclusive runtime**, and the existing **2,000 CSS**. Current measured ESM/classic family
costs are 1,501/1,676 bytes, core-inclusive runtime costs are 2,484/2,716 bytes, and CSS is
1,273 bytes (3,757/3,989 including CSS). All budget checks remain fail-fast.

## Empty delivery

Empty and its canonical `Empty` class (aliased as `MEmpty`) select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-empty.global.js`, with `markup-ui-empty.css`. The legacy aggregate no longer defines
`m-empty` in `src/components/elements.ts`. Empty generates readable fallback text and decorative
vector illustrations while adopting authored icon, description, and recovery controls.

Empty's measured-budget ceilings are **2,500 gzip bytes per JS format**, **3,500 for
core-inclusive runtime**, and the existing **1,500 CSS**. Current measured ESM/classic family
costs are 1,622/1,803 bytes, core-inclusive runtime costs are 2,605/2,843 bytes, and CSS is
842 bytes (3,447/3,685 including CSS). All budget checks remain fail-fast.

## Spin delivery

Spin and its canonical `Spin` class (aliased as `MSpin`) select core plus one family entry and CSS.
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

Skeleton and its canonical `Skeleton` class (aliased as `MSkeleton`) select core plus one family entry and CSS.
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

Alert and its canonical `Alert` class (aliased as `MAlert`) select core plus one family entry and CSS.
ESM imports `markup-ui-core.js`; classic order is `markup-ui-core.global.js`, then
`markup-ui-alert.global.js`, with `markup-ui-alert.css`. The legacy aggregate no longer defines
`m-alert` in `src/components/elements.ts`. Alert provides semantic notice types, safe title fallback,
decorative vector icons, adopted content regions, and cancellable close intent without automatic removal.

Alert's measured-budget ceilings are **2,500 gzip bytes per JS format**, **3,500 for
core-inclusive runtime**, and the existing **2,000 CSS**. Current measured ESM/classic family
costs are 2,229/2,412 bytes, core-inclusive runtime costs are 3,212/3,452 bytes, and CSS is
1,689 bytes (4,901/5,141 including CSS). All budget checks remain fail-fast.

## References

- [Plugin support source](../../src/core/plugin.ts)
- [Component registration entry](../../src/components/avatar/index.ts)
- [Build configuration](../../scripts/build.mjs)
