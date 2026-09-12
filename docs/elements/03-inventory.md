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
| Ellipsis | `Ellipsis` | Contract pending |
| Gradient Text | `GradientText` | Contract pending |
| Icon | `Icon`, `IconWrapper` | [Demo and API](../../demo/components/icon.html) |
| Page Header | `PageHeader` and named regions | Contract pending |
| Tag | `Tag` | Contract pending |
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
| Form | `Form`, `FormItem`, `FormItemGi` | Contract pending |
| Input | `Input`, `Textarea`, `InputGroup`, `InputGroupLabel`; native editing/form owners | [Demo and API](../../demo/components/input.html) |
| Input Number | `InputNumber` | Contract pending |
| Input OTP | `InputOtp` | Contract pending |
| Mention | `Mention` | Contract pending |
| Radio | `Radio`, `RadioGroup`, `RadioButton` | Contract pending |
| Rate | `Rate` | Contract pending |
| Select | `Select` | Contract pending |
| Slider | `Slider` | Contract pending |
| Switch | `Switch` | Contract pending |
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
| Descriptions | `Descriptions`, `DescriptionItem` | Contract pending |
| Empty | `Empty` | Contract pending |
| Image | `Image` and preview/group composition | Contract pending |
| List | `List`, `ListItem` | Contract pending |
| Log | `Log` | Contract pending |
| Number Animation | `NumberAnimation` | Contract pending |
| Statistic | `Statistic` | Contract pending |
| Table | `Table` | Contract pending |
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
| Breadcrumb | `Breadcrumb`, `BreadcrumbItem` | Contract pending |
| Loading Bar | `LoadingBar` | Contract pending |
| Menu | `Menu`, `MenuItem` and hierarchy | Contract pending |
| Pagination | `Pagination` | Contract pending |
| Steps | `Steps`, `Step` | Contract pending |
| Tabs | `Tabs`, `Tab`, `TabPane` | Contract pending |

## Feedback (16)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Alert | `Alert` | Contract pending |
| Badge | `Badge` | Contract pending |
| Dialog | `Dialog` | Contract pending |
| Drawer | `Drawer`, `DrawerContent` | Contract pending |
| Marquee | `Marquee` | Contract pending |
| Message | `Message` service/control | Contract pending |
| Modal | `Modal` | Contract pending |
| Notification | `Notification` | Contract pending |
| Popconfirm | `Popconfirm` | Contract pending |
| Popover | `Popover` | Contract pending |
| Popselect | `Popselect` | Contract pending |
| Progress | `Progress` | Contract pending |
| Result | `Result` and named regions | Contract pending |
| Skeleton | `Skeleton` | Contract pending |
| Spin | `Spin` | Contract pending |
| Tooltip | `Tooltip` | Contract pending |

## Layout (5)

| Family | Elements / scope | Contract |
| --- | --- | --- |
| Flex | `Flex` | [Demo and API](../../demo/components/flex.html) |
| Layout | Layout, header, main, section and sider elements | Contract pending |
| Grid | `Grid`, `GridItem` | Contract pending |
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
