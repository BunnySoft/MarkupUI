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
| Auto Complete | `AutoComplete` | [Demo and API](../../demo/components/auto-complete.html) |
| Cascader | `Cascader` | [Demo and API](../../demo/components/cascader.html) |
| Color Picker | `ColorPicker` | Contract pending |
| Checkbox | `Checkbox`, `CheckboxGroup`; native checkedness, labels, forms and computed selection | [Demo and API](../../demo/components/checkbox.html) |
| Date Picker | `DatePicker` | [Demo and API](../../demo/components/date-picker.html) |
| Dynamic Input | `DynamicInput` | [Demo and API](../../demo/components/dynamic-input.html) |
| Dynamic Tags | `DynamicTags` | [Demo and API](../../demo/components/dynamic-tags.html) |
| Form | `Form`, `FormItem`, `FormItemGi` | [Demo and API](../../demo/components/form.html) |
| Input | `Input`, `Textarea`, `InputGroup`, `InputGroupLabel`; native editing/form owners | [Demo and API](../../demo/components/input.html) |
| Input Number | `InputNumber`; nullable live number, native drafts/defaults/stepping, labels and forms | [Demo and API](../../demo/components/input-number.html) |
| Input OTP | `InputOtp` | [Demo and API](../../demo/components/input-otp.html) |
| Mention | `Mention` | Contract pending |
| Radio | `Radio`, `RadioGroup`, `RadioButton`; native exclusivity, labels, forms and computed selection | [Demo and API](../../demo/components/radio.html) |
| Rate | `Rate` | [Demo and API](../../demo/components/rate.html) |
| Select | `Select`; native single/multiple selection, options/defaults, labels and forms | [Demo and API](../../demo/components/select.html) |
| Slider | `Slider` | [Demo and API](../../demo/components/slider.html) |
| Switch | `Switch`; binary native checked/default state, loading, labels and forms | [Demo and API](../../demo/components/switch.html) |
| Time Picker | `TimePicker` | [Demo and API](../../demo/components/time-picker.html) |
| Transfer | `Transfer` | Contract pending |
| Tree Select | `TreeSelect` | [Demo and API](../../demo/components/tree-select.html) |
| Upload | `Upload`, `UploadTrigger`, `UploadDragger` | [Demo and API](../../demo/components/upload.html) |

## Data Display (19)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Calendar | `Calendar` | [Demo and API](../../demo/components/calendar.html) |
| Countdown | `Countdown` | Contract pending |
| Code | `Code` | [Demo and API](../../demo/components/code.html) |
| Data Table | `DataTable` | [Demo and API](../../demo/components/data-table.html) |
| Descriptions | `Descriptions`, `DescriptionItem` | [Demo and API](../../demo/components/descriptions.html) |
| Empty | `Empty`; readable fallback text, optional icons, size variants and adopted regions | [Demo and API](../../demo/components/empty.html) |
| Image | `Image` and preview/group composition | [Demo and API](../../demo/components/image.html) |
| List | `List`, `ListItem` | [Demo and API](../../demo/components/list.html) |
| Log | `Log` | Contract pending |
| Number Animation | `NumberAnimation` | Contract pending |
| Statistic | `Statistic` | [Demo and API](../../demo/components/statistic.html) |
| Table | `Table` | [Demo and API](../../demo/components/table.html) |
| Thing | `Thing` and named regions | Contract pending |
| Time | `Time` | Contract pending |
| Timeline | `Timeline`, `TimelineItem` | [Demo and API](../../demo/components/timeline.html) |
| Tree | `Tree`, `TreeNode` | [Demo and API](../../demo/components/tree.html) |
| Infinite Scroll | `InfiniteScroll` | [Demo and API](../../demo/components/infinite-scroll.html) |
| Highlight | `Highlight` | Contract pending |
| Heatmap | `Heatmap` | Contract pending |

## Navigation (9)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Affix | `Affix` | [Demo and API](../../demo/components/affix.html) |
| Anchor | `Anchor`, `AnchorLink` | [Demo and API](../../demo/components/anchor.html) |
| Back Top | `BackTop` | [Demo and API](../../demo/components/back-top.html) |
| Breadcrumb | `Breadcrumb`, `BreadcrumbItem` | [Demo and API](../../demo/components/breadcrumb.html) |
| Loading Bar | `LoadingBar` | [Demo and API](../../demo/components/loading-bar.html) |
| Menu | `Menu`, `MenuItem` and hierarchy | [Demo and API](../../demo/components/menu.html) |
| Pagination | `Pagination` | [Demo and API](../../demo/components/pagination.html) |
| Steps | `Steps`, `Step` | [Demo and API](../../demo/components/steps.html) |
| Tabs | `Tabs`, `Tab`, `TabPane` | [Demo and API](../../demo/components/tabs.html) |

## Feedback (16)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Alert | `Alert`; notice types, safe title fallback, semantic SVG icons, adopted regions and cancellable close intent | [Demo and API](../../demo/components/alert.html) |
| Badge | `Badge`; passive counts, caps, dot/processing indicators, placements and native targets | [Demo and API](../../demo/components/badge.html) |
| Dialog | `Dialog` | [Demo and API](../../demo/components/dialog.html) |
| Drawer | `Drawer`, `DrawerContent` | [Demo and API](../../demo/components/drawer.html) |
| Marquee | `Marquee` | Contract pending |
| Message | `Message` service/control | [Demo and API](../../demo/components/message.html) |
| Modal | `Modal` | [Demo and API](../../demo/components/modal.html) |
| Notification | `Notification` | [Demo and API](../../demo/components/notification.html) |
| Popconfirm | `Popconfirm` | [Demo and API](../../demo/components/popconfirm.html) |
| Popover | `Popover`, `PopoverTrigger`, `PopoverContent`; direct trigger/panel adoption, 12 directional placements, hover/focus/click/manual modes, collision flipping | [Demo and API](../../demo/components/popover.html) |
| Popselect | `Popselect` | [Demo and API](../../demo/components/popselect.html) |
| Progress | `Progress` | [Demo and API](../../demo/components/progress.html) |
| Result | `Result` and named regions | [Demo and API](../../demo/components/result.html) |
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
| Virtual List | `VirtualList` | [Demo and API](../../demo/components/virtual-list.html) |

## Non-element surfaces

Host configuration, theme/style resources and plain services belong to their architecture
or styling contracts, not artificial UI wrappers. Native scrolling, authored content and
caller-supplied resources remain composition mechanisms where no separate element is selected.

## References

- [Previous implementation inventory](../archive/architecture/03-inventory.md)
- [Previous implementation guides](../archive/components/README.md)
- [Pinned API comparison](../archive/naive/index.md)
