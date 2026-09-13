# Element contracts

Element Contracts define the latest public properties, content and behavior for the
ViewElement rewrite. They are design requirements, not a claim that every API is delivered.
Pending contracts identify unresolved decisions. For implemented components, the catalog
links to the demo page containing current API tables, examples and behavior.

## Reading order

1. [Contract model](01-contract.md): shared terminology, structure and rules.
2. [Initial catalog](02-catalog.md): the first seven component families and their contracts.
3. [Full inventory](03-inventory.md): every retained UI family and the non-element boundary.
4. [Component development guide](04-development.md): implement, document and validate one family end-to-end.

The [rewrite plan](../architecture/04-rewrite.md) covers the complete inventory.
Web/native mapping belongs in [Architecture](../architecture/README.md);
[Binding](../binding/README.md) and [Styling](../styling/README.md) own their shared rules.
Individual contracts should not repeat those guides. Move completed planning contracts
to the archive rather than maintaining duplicate component API/usage pages.

## Status

Separate a defined or approved contract from implemented and validated code.
All seven initial families use the thin shared core and source-generated demo API data.
Avatar, Button, Card, Carousel, Collapse, Divider and Dropdown are implemented with
approved payload ceilings.
Icon/IconWrapper, Typography, Space, Flex, Input, Checkbox, Radio, Switch, InputNumber and Select also follow this pattern; the inventory links to their current demo/API pages.
Input retains one actual native input/textarea as the editing, validation, focus and form owner.
Checkbox retains native checkbox/label and fieldset/legend owners; CheckboxGroup value is
computed live selection, not configured state with an empty-array default.
Radio/RadioButton retain actual radio/label owners; RadioGroup validates one complete native
name/form group and computes current string/null selection without an exclusivity or keyboard engine.
Switch retains one binary native checkbox with the sole switch role, silent programmatic writes,
native defaults/forms and reversible loading; no async checked-update or readonly API is invented.
InputNumber retains one native number owner, nullable numeric value versus exposed/default strings,
native constraint/step-grid interpretation and reversible optional native step/clear buttons.
It imports only core, with approved 4,000-byte per-format JS and 5,500-byte combined-runtime
ceilings; CSS retains its 1,000-byte ceiling.
Select retains one native select with original options/optgroups, live string/null/array
selection, option defaults, native keyboard/forms and optional literal list-filter/clear helpers.
It shares internal native-selection mechanics with the existing TreeSelect/Popselect consumers;
those consumers are not migrated or registered by Select. Each Select JS ceiling remains
4,000 bytes and CSS remains 1,000; the core-inclusive runtime ceiling is 8,000.
Grid/GridItem use native CSS tracks and original children, with typed columns, gaps,
item alignment and optional absolute column span/start. Responsiveness, rows, flow and
visual order remain authored Web CSS; there is no relative-offset packing engine.
See the [Grid demo/API](../../demo/components/grid.html). FormItemGi remains independent.
The initial batch establishes the pattern; the remaining inventory requires its own
contracts and dependency-aware implementation sequence.

Form/FormItem/FormItemGi are implemented with a [native-owner demo/API](../../demo/components/form.html)
and explicitly accounted shared-core delivery.
The implementation retains native association, submission/reset and the existing abortable
validation/feedback coordinator. FormItem is a native label/control/fieldset layout and
mapping boundary, not a schema or a second validation engine.

Layout/LayoutHeader/LayoutContent/LayoutFooter/LayoutSider use native flex shells, borders,
sidebar placement, embedded backgrounds, positioning and original children, backed by
native CSS layout, scrolling and details disclosure.
See the [Layout demo/API](../../demo/components/layout.html).

Tag/MTag uses direct properties, checkable native toggle buttons with aria-pressed,
closable intent without automatic removal, sizes, types, rounded and borderless styling,
and original phrasing content.
See the [Tag demo/API](../../demo/components/tag.html).

Badge/MBadge uses direct properties, passive counts, caps, overflow suffixes,
dot and processing indicators, logical placements, tabular digit cell formatting,
and original target content, backed by external CSS positioning and theme tokens.
See the [Badge demo/API](../../demo/components/badge.html).

Empty/MEmpty uses direct properties, readable fallback text, original decorative vector
illustrations, size variants, and adopted regions for custom icons, descriptions, and
recovery actions, leaving interactive headings, forms, and announcements native.
See the [Empty demo/API](../../demo/components/empty.html).

Spin/MSpin uses direct properties, customizable size presets or numeric dimensions,
delay cancellation, original SVG geometry, wrapped content adoption, and adopted regions
for custom icons and descriptions, leaving focus and wrapped interaction native.
See the [Spin demo/API](../../demo/components/spin.html).

Skeleton/MSkeleton uses direct properties, placeholder shapes, bounded repetition,
size presets, dimension normalization, and inert decorative bar generation, leaving
application busy state and loading transitions native.
See the [Skeleton demo/API](../../demo/components/skeleton.html).

Popover/PopoverTrigger/PopoverContent use direct properties, 12 directional placements,
click/hover/focus/manual modes, collision flipping, arrow decoration, and adopted regions
for trigger and panel content, backed by the browser top-layer Popover API and anchored positioning.
See the [Popover demo/API](../../demo/components/popover.html).

## References

- [Previous implementation guides](../archive/components/README.md)
- [Pinned API comparisons](../archive/naive/index.md)
- [Visual comparison records](../archive/styling/index.md)
