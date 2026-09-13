# Implemented APIs

This section describes the APIs implemented by the current rewrite, not every component
in the target inventory.

1. [Core and ViewElement](01-core.md): direct DOM access, registration and small typed helpers.
2. [Avatar demo and API](../../demo/components/avatar.html): examples, required files, reflected API tables and behavior.
3. [Button demo and API](../../demo/components/button.html): accepted native Button/ButtonGroup behavior, required files and generated API.
4. [Card demo and API](../../demo/components/card.html): named regions, finite segmentation, native close intent and required files.
5. [Carousel demo and API](../../demo/components/carousel.html): native paging, settled identity, safe autoplay, lifecycle and required files.
6. [Collapse demo and API](../../demo/components/collapse.html): accepted keyed native disclosures and named regions.
7. [Divider demo and API](../../demo/components/divider.html): independent title content, native rule semantics and selected-file loading.
8. [Dropdown demo and API](../../demo/components/dropdown.html): native command/navigation hierarchy and canonical regions.
9. [Icon demo and API](../../demo/components/icon.html): passive authored graphics, typed sizing, theme depth and IconWrapper.
10. [Typography demo and API](../../demo/components/typography.html): typed text presentation, rich documents and native heading/paragraph/link/list/quote owners.
11. [Space demo and API](../../demo/components/space.html): typed spacing, alignment and wrapping of author-owned native content.
12. [Flex demo and API](../../demo/components/flex.html): native flex alignment, visual reversal and typed gaps without generated items.
13. [Input demo and API](../../demo/components/input.html): Input, Textarea, InputGroup and InputGroupLabel; native editing/defaults/forms, clear/reveal/count and lifecycle.
14. [Checkbox demo and API](../../demo/components/checkbox.html): Checkbox and CheckboxGroup; native checked/default/mixed state, labels, form ownership and live selection constraints.
15. [Radio demo and API](../../demo/components/radio.html): Radio, RadioGroup and RadioButton; native exclusivity, checked/default state, forms and computed group selection.
16. [Switch demo and API](../../demo/components/switch.html): one binary native owner, checked/default state, focus-safe loading, forms, labels and lifecycle.
17. [InputNumber demo and API](../../demo/components/input-number.html): nullable numeric value, native drafts/default strings, constraints, step/clear intent, forms and lifecycle.
18. [Select demo and API](../../demo/components/select.html): native string/null/array selection, option defaults, lists, forms, literal filtering and lifecycle.
19. [Form demo and API](../../demo/components/form.html): native form association, submission/reset, item layout and abortable validation.
20. [Grid demo and API](../../demo/components/grid.html): native CSS tracks, gaps, item alignment, optional column span/start and original children.
21. [Layout demo and API](../../demo/components/layout.html): Layout, LayoutHeader, LayoutContent, LayoutFooter and LayoutSider; native flex shells, borders, sidebar placement, embedded and positioning properties, native scrolling and details disclosure.
22. [Tag demo and API](../../demo/components/tag.html): Tag; checkable toggle button, closable intent, native content, sizes and types.
23. [Badge demo and API](../../demo/components/badge.html): Badge; passive counts, caps, dot/processing indicators, placements and native targets.
24. [Empty demo and API](../../demo/components/empty.html): Empty; readable fallback text, optional icons, size variants and adopted regions.
25. [Spin demo and API](../../demo/components/spin.html): Spin; customizable size, delay, stroke, wrapped content adoption, custom icons and descriptions.
26. [Skeleton demo and API](../../demo/components/skeleton.html): Skeleton; placeholder shapes, repeated bar groups, text and dimension normalization.
27. [Popover demo and API](../../demo/components/popover.html): Popover, PopoverTrigger, PopoverContent; direct trigger/panel adoption, 12 directional placements, hover/focus/click/manual modes, collision flipping.
28. [Tooltip demo and API](../../demo/components/tooltip.html): Tooltip, TooltipTrigger, TooltipContent; noninteractive contextual descriptions, text attribute, 12 directional placements, hover/focus triggering, collision flipping.
29. [Alert demo and API](../../demo/components/alert.html): Alert; notice types, safe title fallback, semantic SVG icons, adopted regions and cancellable close intent.
30. [List demo and API](../../demo/components/list.html): List and ListItem; bordered, size variants, hoverable/clickable items, prefix/suffix and native list semantics.
31. [Table demo and API](../../demo/components/table.html): Table; bordered/striped/single-line table presentations and native table markup.
32. [Descriptions demo and API](../../demo/components/descriptions.html): Descriptions and DescriptionItem; bordered, column count, responsive grid and label placement.
33. [Breadcrumb demo and API](../../demo/components/breadcrumb.html): Breadcrumb and BreadcrumbItem; navigation landmark, customizable separators, items and link semantics.
34. [Page Header demo and API](../../demo/components/page-header.html): Page Header; page title, subtitle, back action, extra and content regions.
35. [Ellipsis demo and API](../../demo/components/ellipsis.html): Ellipsis; direct text truncation, line-clamping, click-to-expand disclosure and tooltip.
36. [Tabs demo and API](../../demo/components/tabs.html): Tabs, Tab, TabPane; line/card/segment styles, placements, panel disclosure, and keyboard navigation.
37. [Menu demo and API](../../demo/components/menu.html): Menu, MenuItem, MenuGroup, MenuDivider, Submenu; vertical and horizontal navigation, selection, groups, and keyboard shortcuts.
38. [Pagination demo and API](../../demo/components/pagination.html): Pagination; page navigation, page size configuration, item counting, and windowed page slots.
39. [Dialog demo and API](../../demo/components/dialog.html): Dialog, DialogHeader, DialogBody, DialogFooter, DialogAction; modal and modeless dialogs, types, safe actions, and cancellation.
40. [Modal demo and API](../../demo/components/modal.html): Modal, ModalHeader, ModalBody, ModalFooter, ModalAction; modal dialogs, backdrop masking, custom widths, and escape cancellation.
41. [Drawer demo and API](../../demo/components/drawer.html): Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter; sliding side sheets, placements, custom dimensions, and dismiss controls.
42. [Popconfirm demo and API](../../demo/components/popconfirm.html): Popconfirm, PopconfirmTrigger, PopconfirmPanel; confirmation popover, custom action labels, and cancellation events.
43. [Message demo and API](../../demo/components/message.html): Message, MessageContainer; global feedback messages, status types, auto-dismiss timers, and placement control.
44. [Notification demo and API](../../demo/components/notification.html): Notification, NotificationContainer; passive floating notifications, descriptions, auto-dismiss timers, and placements.

Implemented component pages under `demo/components` are the end-user reference. Do not
maintain a second Markdown copy of their API tables or usage examples.

## Select only what you use

| Need | Load |
| --- | --- |
| Author a component or inspect the Web base | `@dataengine/markup-ui/core` |
| Use Avatar | `@dataengine/markup-ui/avatar` and its CSS; ESM imports core automatically. |
| Use Button/ButtonGroup | `@dataengine/markup-ui/button` and its CSS; ESM imports core automatically. |
| Use Card and its regions | `@dataengine/markup-ui/card` and its CSS; ESM imports core automatically. |
| Use Carousel and its regions/items | `@dataengine/markup-ui/carousel` and its CSS; ESM imports core automatically. |
| Use Collapse and its regions/items | `@dataengine/markup-ui/collapse` and its CSS; ESM imports core automatically. |
| Use Divider | `@dataengine/markup-ui/divider` and its CSS; ESM imports core automatically. |
| Use Dropdown and its regions | `@dataengine/markup-ui/dropdown` and its composed CSS; ESM imports core automatically. |
| Use Icon/IconWrapper | `@dataengine/markup-ui/icon` and its CSS; ESM imports core automatically. |
| Use Typography and its seven companions | `@dataengine/markup-ui/typography` and its CSS; ESM imports core automatically. Import `Text as TypographyText` when native DOM Text is also needed. |
| Use Space | `@dataengine/markup-ui/space` and its CSS; ESM imports core automatically. |
| Use Flex | `@dataengine/markup-ui/flex` and its CSS; ESM imports core automatically. |
| Use Grid/GridItem | `@dataengine/markup-ui/grid` and its CSS; ESM imports only core. Public exports are `Grid`, `GridItem`, `registerGrid`, `GridAlign` and `GridJustify`. Classic order is `markup-ui-core.global.js`, then `markup-ui-grid.global.js`. |
| Use Layout and its four companion regions | `@dataengine/markup-ui/layout` and its CSS; ESM imports only core. Public exports are `Layout`, `LayoutHeader`, `LayoutContent`, `LayoutFooter`, `LayoutSider`, `registerLayout`, `isLayoutElement`, `layoutPositions` and `siderSides`. Classic order is `markup-ui-core.global.js`, then `markup-ui-layout.global.js`. |
| Use Input/Textarea and groups | `@dataengine/markup-ui/input` and its CSS; ESM imports core and internal native-field mechanics automatically. Public exports are the four classes, `registerInput`, `InputType`, `InputSize`, `InputStatus` and `InputCount`. |
| Use Checkbox/CheckboxGroup | `@dataengine/markup-ui/checkbox` and its CSS; ESM imports only core. Public exports are the two classes, `registerCheckbox`, `CheckboxSize`, `CheckboxStatus`, `CheckboxGroupOptions` and `CheckboxGroupChange`. |
| Use Radio/RadioGroup/RadioButton | `@dataengine/markup-ui/radio` and its CSS; ESM imports core and internal native-radio mechanics. Public exports are the three classes, `registerRadio`, `RadioSize`, `RadioStatus` and `RadioGroupChange`. |
| Use Switch | `@dataengine/markup-ui/switch` and its CSS; ESM imports only core. Public exports are `Switch`, `registerSwitch`, `SwitchSize` and `SwitchStatus`. |
| Use InputNumber | `@dataengine/markup-ui/input-number` and its CSS; ESM imports only core. Public exports are `InputNumber`, `registerInputNumber`, `InputNumberState`, `InputNumberSize` and `InputNumberStatus`. |
| Use Select | `@dataengine/markup-ui/select` and its CSS; ESM imports core and internal native-select mechanics. Public exports are `Select`, `registerSelect`, `SelectValue`, `SelectSize` and `SelectStatus`. |
| Use Tag | `@dataengine/markup-ui/tag` and its CSS; ESM imports only core. Public exports are `Tag`, `MTag`, `registerTag`, `TagSize`, `TagType` and `TagCloseDetail`. Classic order is `markup-ui-core.global.js`, then `markup-ui-tag.global.js`. |
| Use Badge | `@dataengine/markup-ui/badge` and its CSS; ESM imports only core. Public exports are `Badge`, `MBadge`, `registerBadge`, `BadgePlacement` and `BadgeType`. Classic order is `markup-ui-core.global.js`, then `markup-ui-badge.global.js`. |
| Use Empty | `@dataengine/markup-ui/empty` and its CSS; ESM imports only core. Public exports are `Empty`, `MEmpty`, `registerEmpty`, `emptySizes` and `EmptySize`. Classic order is `markup-ui-core.global.js`, then `markup-ui-empty.global.js`. |
| Use Spin | `@dataengine/markup-ui/spin` and its CSS; ESM imports only core. Public exports are `Spin`, `MSpin`, `registerSpin`, `spinSizes`, `SpinPresetSize`, `SpinSize` and `SpinValidationError`. Classic order is `markup-ui-core.global.js`, then `markup-ui-spin.global.js`. |
| Use Skeleton | `@dataengine/markup-ui/skeleton` and its CSS; ESM imports only core. Public exports are `Skeleton`, `MSkeleton`, `registerSkeleton`, `skeletonSizes`, `SkeletonPresetSize`, `SkeletonSize` and `SkeletonValidationError`. Classic order is `markup-ui-core.global.js`, then `markup-ui-skeleton.global.js`. |
| Use Popover and its regions | `@dataengine/markup-ui/popover` and its CSS; ESM imports only core. Public exports are `Popover`, `PopoverTrigger`, `PopoverContent`, `registerPopover`, `createPopover`, `createPopoverPositioner`, `createPopoverController`, `PopoverController`, `PopoverOptions`, `PopoverPlacement`, `PopoverTriggerMode`, `popoverPlacements` and `popoverTriggers`. Classic order is `markup-ui-core.global.js`, then `markup-ui-popover.global.js`. |
| Use Tooltip and its regions | `@dataengine/markup-ui/tooltip` and its CSS; ESM imports only core. Public exports are `Tooltip`, `TooltipTrigger`, `TooltipContent`, `registerTooltip`, `createTooltip`, `TooltipController`, `TooltipOptions`, `TooltipPlacement`, `tooltipPlacements` and `isTooltipElement`. Classic order is `markup-ui-core.global.js`, then `markup-ui-tooltip.global.js`. |
| Use Alert | `@dataengine/markup-ui/alert` and its CSS; ESM imports only core. Public exports are `Alert`, `MAlert`, `registerAlert`, `alertTypes`, `AlertType` and `AlertCloseDetail`. Classic order is `markup-ui-core.global.js`, then `markup-ui-alert.global.js`. |
| Use classic scripts | Core first, then the selected component scripts and CSS. |

No jQuery dependency, query wrapper, state/binding runtime or all-components bundle is
required for the direct ViewElement component families. The new binding/template runtime remains a separate planned feature.
Choose one core format/version for the application; do not mix independently loaded ESM
and classic cores.

Input classic scripts require `markup-ui-core.global.js`, then
`markup-ui-native-input.global.js`, then `markup-ui-input.global.js`. The dependency is
internal shared mechanics, not the former public `createInput` helper. The manifest includes
all runtime dependencies and CSS; selecting Input does not select Button, Icon, Typography,
the aggregate or a form/binding engine.

Checkbox classic loading is `markup-ui-core.global.js` then `markup-ui-checkbox.global.js`.
There is no native-input dependency or public `createCheckboxGroup` controller. The aggregate
no longer competes for `m-checkbox`; select the canonical Checkbox family explicitly.
The optional state bridge keeps Checkbox's existing boolean `m-bind` on `checked`;
`value` is now explicitly the native submission string. CheckboxGroup's `value` is a live
DOM-order selection, including prechecked and disabled members, rather than a stored default.

Radio classic loading is `markup-ui-core.global.js`, `markup-ui-native-radio.global.js`,
then `markup-ui-radio.global.js`. The native-radio dependency is private, registers no
elements, and is also used by unmigrated Rate (which does not require core). There is no
public `createRadioGroup` helper or text-input dependency. The aggregate no longer
registers legacy `m-radio`/`m-radio-group`; select the canonical family explicitly.
The optional bridge keeps Radio/RadioButton boolean `m-bind` on `checked`, explicit
submission-string binding on `value`, and RadioGroup's computed string/null selection.

Switch classic loading is `markup-ui-core.global.js`, then `markup-ui-switch.global.js`.
There is no public `createSwitch` helper, competing aggregate registration or native-input/
native-radio dependency. Select the canonical family explicitly. The optional state bridge
keeps boolean `m-bind` on `checked`, with explicit `m-bind-property="value"` for the native
submission string. Loading is an explicit flag, not a promise or checked-update guard.

InputNumber classic loading is `markup-ui-core.global.js`, then
`markup-ui-input-number.global.js`. The archived `createInputNumber` controller and widgets
registration are removed. Explicitly select this family; it does not require another
component/native engine. The optional state bridge uses number/null `value` and native
input/change events, skipping equal-value writes so a browser-owned bad-input draft survives.

Select classic loading is `markup-ui-core.global.js`, `markup-ui-native-select.global.js`,
then `markup-ui-select.global.js`. The internal dependency also serves existing TreeSelect/
Popselect compositions without importing Select registration. The public factory/controller
and aggregate `MSelect` are removed; native `option`/`optgroup` replace the old cloning
`m-option` path. Optional binding uses string/null/array `value` and only the owned native
input/change events, avoiding equal-value feedback writes. Reset defaults remain native
`option.defaultSelected`, not a fabricated Select `defaultValue`.

Tag classic loading is `markup-ui-core.global.js`, then `markup-ui-tag.global.js`.
There is no controller helper, competing aggregate registration or extra native engine.
Checkable tags wrap or adopt a native button toggle; closable tags emit cancelable `m:close`
intent without removing content. Authored phrasing content, icons and avatars are preserved.

## References

- [Source pattern](../architecture/06-source.md)
- [Modular delivery](../architecture/07-modules.md)
