# 3. Element inventory

The current rewrite covers **87 retained UI component families**. Companion and
region classes belong to their family's contract; this is not a count of individual classes.
Every visual target uses `ViewElement` with direct typed property and method behavior.

A contract link records a design page, not completed implementation. The initial seven
families establish the pattern; the remaining contracts must be defined before implementation.

## Common (15)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Avatar | `Avatar`, `AvatarGroup` | [Demo and API](../../demo/components/avatar.html) |
| Button | `Button`, `ButtonGroup` | [Demo and API](../../demo/components/button.html) |
| Card | `Card` plus six named regions | [Demo and API](../../demo/components/card.html) |
| Carousel | `Carousel`, `CarouselViewport`, `CarouselItem`, `CarouselControls`, `CarouselReadout` | [Demo and API](../../demo/components/carousel.html) |
| Collapse | `Collapse`, `CollapseItem`, `CollapseHeader`, `CollapseHeaderExtra`, `CollapseContent` | [Demo and API](../../demo/components/collapse.html) |
| Divider | `Divider`; primary content supplies an independent title fragment | [Demo and API](../../demo/components/divider.html) |
| Dropdown | `Dropdown`, `DropdownTrigger`, `DropdownMenu`, `DropdownItem`, `DropdownGroup`, `DropdownDivider` | [Demo and API](../../demo/components/dropdown.html) |
| Ellipsis | `Ellipsis` | [Demo and API](../../demo/components/ellipsis.html) |
| Gradient Text | `GradientText` | Contract pending |
| Icon | `Icon`, `IconWrapper` | [Demo and API](../../demo/components/icon.html) |
| Page Header | `PageHeader` and named regions | [Demo and API](../../demo/components/page-header.html) |
| Tag | `Tag`; checkable toggle button, closable intent, native content, sizes and types | [Demo and API](../../demo/components/tag.html) |
| Typography | `Typography`, `Text`, `Paragraph`, `Heading`, `Link`, `Blockquote`, `UnorderedList`, `OrderedList`; native importance/deletion/code and list items | [Demo and API](../../demo/components/typography.html) |
| Watermark | `Watermark` | Contract pending |
| Float Button | `FloatButton`, `FloatButtonGroup` | Contract pending |

## Data Input (21)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Auto Complete | `AutoComplete` | Contract pending |
| Cascader | `Cascader` | Contract pending |
| Color Picker | `ColorPicker` | Contract pending |
| Checkbox | `Checkbox`, `CheckboxGroup`; native checkedness, labels, forms and computed selection | [Demo and API](../../demo/components/checkbox.html) |
| Date Picker | `DatePicker` | Contract pending |
| Dynamic Input | `DynamicInput` | Contract pending |
| Dynamic Tags | `DynamicTags` | Contract pending |
| Form | `Form`, `FormItem`, `FormItemGi` | [Demo and API](../../demo/components/form.html) |
| Input | `Input`, `Textarea`, `InputGroup`, `InputGroupLabel`; native editing/form owners | [Demo and API](../../demo/components/input.html) |
| Input Number | `InputNumber`; nullable live number, native drafts/defaults/stepping, labels and forms | [Demo and API](../../demo/components/input-number.html) |
| Input OTP | `InputOtp` | Contract pending |
| Mention | `Mention` | Contract pending |
| Radio | `Radio`, `RadioGroup`, `RadioButton`; native exclusivity, labels, forms and computed selection | [Demo and API](../../demo/components/radio.html) |
| Rate | `Rate` | Contract pending |
| Select | `Select`; native single/multiple selection, options/defaults, labels and forms | [Demo and API](../../demo/components/select.html) |
| Slider | `Slider` | Contract pending |
| Switch | `Switch`; binary native checked/default state, loading, labels and forms | [Demo and API](../../demo/components/switch.html) |
| Time Picker | `TimePicker` | Contract pending |
| Transfer | `Transfer` | Contract pending |
| Tree Select | `TreeSelect` | Contract pending |
| Upload | `Upload`, `UploadTrigger`, `UploadDragger` | Contract pending |

## Data Display (19)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Calendar | `Calendar` | Contract pending |
| Countdown | `Countdown` | Contract pending |
| Code | `Code` | Contract pending |
| Data Table | `DataTable` | Contract pending |
| Descriptions | `Descriptions`, `DescriptionItem` | [Demo and API](../../demo/components/descriptions.html) |
| Empty | `Empty`; readable fallback text, optional icons, size variants and adopted regions | [Demo and API](../../demo/components/empty.html) |
| Image | `Image` and preview/group composition | Contract pending |
| List | `List`, `ListItem` | [Demo and API](../../demo/components/list.html) |
| Log | `Log` | Contract pending |
| Number Animation | `NumberAnimation` | Contract pending |
| Statistic | `Statistic` | Contract pending |
| Table | `Table` | [Demo and API](../../demo/components/table.html) |
| Thing | `Thing` and named regions | Contract pending |
| Time | `Time` | Contract pending |
| Timeline | `Timeline`, `TimelineItem` | Contract pending |
| Tree | `Tree`, `TreeNode` | Contract pending |
| Infinite Scroll | `InfiniteScroll` | Contract pending |
| Highlight | `Highlight` | Contract pending |
| Heatmap | `Heatmap` | Contract pending |

## Navigation (9)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Affix | `Affix` | Contract pending |
| Anchor | `Anchor`, `AnchorLink` | Contract pending |
| Back Top | `BackTop` | Contract pending |
| Breadcrumb | `Breadcrumb`, `BreadcrumbItem` | [Demo and API](../../demo/components/breadcrumb.html) |
| Loading Bar | `LoadingBar` | Contract pending |
| Menu | `Menu`, `MenuItem` and hierarchy | [Demo and API](../../demo/components/menu.html) |
| Pagination | `Pagination` | [Demo and API](../../demo/components/pagination.html) |
| Steps | `Steps`, `Step` | Contract pending |
| Tabs | `Tabs`, `Tab`, `TabPane` | [Demo and API](../../demo/components/tabs.html) |

## Feedback (16)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Alert | `Alert`; notice types, safe title fallback, semantic SVG icons, adopted regions and cancellable close intent | [Demo and API](../../demo/components/alert.html) |
| Badge | `Badge`; passive counts, caps, dot/processing indicators, placements and native targets | [Demo and API](../../demo/components/badge.html) |
| Dialog | `Dialog` | [Demo and API](../../demo/components/dialog.html) |
| Drawer | `Drawer`, `DrawerContent` | Contract pending |
| Marquee | `Marquee` | Contract pending |
| Message | `Message` service/control | Contract pending |
| Modal | `Modal` | Contract pending |
| Notification | `Notification` | Contract pending |
| Popconfirm | `Popconfirm` | Contract pending |
| Popover | `Popover`, `PopoverTrigger`, `PopoverContent`; direct trigger/panel adoption, 12 directional placements, hover/focus/click/manual modes, collision flipping | [Demo and API](../../demo/components/popover.html) |
| Popselect | `Popselect` | Contract pending |
| Progress | `Progress` | Contract pending |
| Result | `Result` and named regions | Contract pending |
| Skeleton | `Skeleton`; placeholder shapes, repeated bar groups, text and dimension normalization | [Demo and API](../../demo/components/skeleton.html) |
| Spin | `Spin`; customizable size, delay, stroke, wrapped content adoption, custom icons and descriptions | [Demo and API](../../demo/components/spin.html) |
| Tooltip | `Tooltip`, `TooltipTrigger`, `TooltipContent`; noninteractive contextual descriptions, text attribute, 12 directional placements, hover/focus triggering, collision flipping | [Demo and API](../../demo/components/tooltip.html) |

## Layout (5)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Flex | `Flex` | [Demo and API](../../demo/components/flex.html) |
| Layout | `Layout`, `LayoutHeader`, `LayoutContent`, `LayoutFooter`, `LayoutSider`; native flex shells, borders, sidebar placement and positioning | [Demo and API](../../demo/components/layout.html) |
| Grid | `Grid`, `GridItem`; native tracks, original children and optional absolute placement | [Demo and API](../../demo/components/grid.html) |
| Space | `Space` | [Demo and API](../../demo/components/space.html) |
| Split | `Split` and pane/separator regions | Contract pending |

## Utility (2)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Collapse Transition | `CollapseTransition` | Contract pending |
| Virtual List | `VirtualList` | Contract pending |

## Non-element surfaces

Host configuration, theme/style resources and plain services belong to their architecture
or styling contracts, not artificial UI wrappers. Native scrolling, authored content and
caller-supplied resources remain composition mechanisms where no separate element is selected.

## References

- [Previous implementation inventory](../archive/architecture/03-inventory.md)
- [Previous implementation guides](../archive/components/README.md)
- [Pinned API comparison](../archive/naive/index.md)
