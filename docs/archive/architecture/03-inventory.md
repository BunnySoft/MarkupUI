# 6. Reference inventory

> **Historical reference.** Preserved from the previous documentation layout. This page is not the current design or a completion claim for the ViewElement rewrite.

Use the [element catalog](../../elements/02-catalog.md) for the active rewrite. This appendix
retains the complete upstream coverage reference without making it part of the main reading path.

The pinned Naive UI 2.45.3 menu contains exactly **96 routes in nine categories**. One
route may own companion controls such as AvatarGroup, TabPane or FormItem. The MarkupUI
column records the current retained counterpart or approved replacement direction; it does
not claim complete API parity.

| Category | Routes |
| --- | ---: |
| Common | 15 |
| Data Input | 21 |
| Data Display | 21 |
| Navigation | 9 |
| Feedback | 16 |
| Layout | 6 |
| Utility | 4 |
| Config | 3 |
| Deprecated | 1 |
| **Total** | **96** |

## Common controls (15)

| Naive UI route | MarkupUI control or replacement | Current form | Contract |
| --- | --- | --- | --- |
| [Avatar](../components/avatar.md) | `Avatar`, `AvatarGroup` | Historical Avatar implementation | [Current demo and API](../../../demo/components/avatar.html) |
| [Button](../components/button.md) | `Button`, `ButtonGroup` | Historical Button implementation | [Current demo and API](../../../demo/components/button.html) |
| [Card](../components/card.md) | `Card` plus six named regions | Historical Card implementation | [Current demo and API](../../../demo/components/card.html) |
| [Carousel](../components/carousel.md) | `Carousel`, `CarouselItem` plus viewport/controls/readout | Historical native scroll-snap implementation | [Current demo and API](../../../demo/components/carousel.html) |
| [Collapse](../components/collapse.md) | `Collapse`, `CollapseItem` and named regions | Historical native disclosure helper | [Current demo and API](../../../demo/components/collapse.html) |
| [Divider](../components/divider.md) | `Divider` | Historical CSS-only separator | [Current demo and API](../../../demo/components/divider.html) |
| [Dropdown](../components/dropdown.md) | `Dropdown` and trigger/menu/item/group/divider classes | Historical native command-menu helper | [Current demo and API](../../../demo/components/dropdown.html) |
| [Ellipsis](../components/ellipsis.md) | `Ellipsis` | Native CSS truncation/disclosure composition | Backlog |
| [Gradient Text](../components/gradient-text.md) | `GradientText` | Native text with CSS and readable fallback | Backlog |
| [Icon](../components/icon.md) | `Icon`, `IconWrapper` | Authored icon content and CSS; no asset runtime | Backlog |
| [Page Header](../components/page-header.md) | `PageHeader` and named regions | Authored compound content with CSS | Backlog |
| [Tag](../components/tag.md) | `Tag` | Standalone Web control | Backlog |
| [Typography](../components/typography.md) | Text, paragraph, heading, list, quote and code controls | Native semantic text plus scoped CSS | Backlog |
| [Watermark](../components/watermark.md) | `Watermark` | Canvas tile and overlay helper | Backlog |
| [Float Button](../components/float-button.md) | `FloatButton`, `FloatButtonGroup` | Native actions and optional popover group | Backlog |

## Data Input controls (21)

| Naive UI route | MarkupUI control or replacement | Current form | Contract |
| --- | --- | --- | --- |
| [Auto Complete](../components/auto-complete.md) | `AutoComplete` | Native input/datalist plus bounded loader | Backlog |
| [Cascader](../components/cascader.md) | `Cascader` | Native dependent-select path control | Backlog |
| [Color Picker](../components/color-picker.md) | `ColorPicker` | Native color input and guarded text editing | Backlog |
| [Checkbox](../components/checkbox.md) | `Checkbox`, `CheckboxGroup` | Native checkbox and group helper | Backlog |
| [Date Picker](../components/date-picker.md) | `DatePicker` | Native date/month/datetime fields and range coordination | Backlog |
| [Dynamic Input](../components/dynamic-input.md) | `DynamicInput` | Authored keyed rows and native templates | Backlog |
| [Dynamic Tags](../components/dynamic-tags.md) | `DynamicTags` | Native committed tags and draft editor | Backlog |
| [Form](../components/form.md) | `Form`, `FormItem`, `FormItemGi` | Native forms, constraints, feedback and grid coordination | Backlog |
| [Input](../components/input.md) | `Input`, `Textarea`, `InputGroup`, `InputGroupLabel` | Native fields with optional helpers | Backlog |
| [Input Number](../components/input-number.md) | `InputNumber` | Native number field with guarded stepping | Backlog |
| [Input OTP](../components/input-otp.md) | `InputOtp` | One native field with completion metadata | Backlog |
| [Mention](../components/mention.md) | `Mention` | Native editor with caret-aware suggestions | Backlog |
| [Radio](../components/radio.md) | `Radio`, `RadioGroup`, `RadioButton` | Native exclusive controls and group helper | Backlog |
| [Rate](../components/rate.md) | `Rate` | Bounded native radio scoring control | Backlog |
| [Select](../components/select.md) | `Select` | Native select/options/groups and literal filtering | Backlog |
| [Slider](../components/slider.md) | `Slider` | Native range and paired-range composition | Backlog |
| [Switch](../components/switch.md) | `Switch` | Native binary control with loading behavior | Backlog |
| [Time Picker](../components/time-picker.md) | `TimePicker` | Native time fields and range coordination | Backlog |
| [Transfer](../components/transfer.md) | `Transfer` | Native option membership and movement | Backlog |
| [Tree Select](../components/tree-select.md) | `TreeSelect` | Path-aware native selection composition | Backlog |
| [Upload](../components/upload.md) | `Upload`, `UploadTrigger`, `UploadDragger` | Native file queue and caller-owned transport | Backlog |

## Data Display controls (21)

| Naive UI route | MarkupUI control or replacement | Current form | Contract |
| --- | --- | --- | --- |
| [Calendar](../components/calendar.md) | `Calendar` | Native Gregorian table and roving date buttons | Backlog |
| [Countdown](../components/countdown.md) | `Countdown` | Monotonic remaining-duration text | Backlog |
| [Code](../components/code.md) | `Code` | Native pre/code and authored line content | Backlog |
| [Data Table](../components/data-table.md) | `DataTable` | Native table with sort/filter/page/selection helpers | Backlog |
| [Descriptions](../components/descriptions.md) | `Descriptions`, `DescriptionItem` | Native terms/definitions and grid spans | Backlog |
| [Empty](../components/empty.md) | `Empty` | Standalone Web control with named content | Backlog |
| [Equation](../components/equation.md) | Native MathML and authored explanations | Intentional replacement; no Equation parser/control | Alternative |
| [Image](../components/image.md) | `Image` and preview/group composition | Native responsive image and bounded preview | Backlog |
| [List](../components/list.md) | `List`, `ListItem` | Native list content and CSS | Backlog |
| [Log](../components/log.md) | `Log` | Bounded native retained-text view | Backlog |
| [Number Animation](../components/number-animation.md) | `NumberAnimation` | Finite interpolation and native formatted text | Backlog |
| [QR Code](../components/qr-code.md) | Native link/text or caller-supplied image | Intentional replacement; no QR encoder/control | Alternative |
| [Statistic](../components/statistic.md) | `Statistic` | Standalone passive value control | Backlog |
| [Table](../components/table.md) | `Table` | Native table styling and semantics | Backlog |
| [Thing](../components/thing.md) | `Thing` and named regions | Native compound-content composition | Backlog |
| [Time](../components/time.md) | `Time` | Native time/text formatting owner | Backlog |
| [Timeline](../components/timeline.md) | `Timeline`, `TimelineItem` | Native list/time/marker composition | Backlog |
| [Tree](../components/tree.md) | `Tree`, `TreeNode` | Native hierarchy, selection, checking and loading | Backlog |
| [Infinite Scroll](../components/infinite-scroll.md) | `InfiniteScroll` | Native sentinel and guarded loading permission | Backlog |
| [Highlight](../components/highlight.md) | `Highlight` | Literal matching helper and native mark content | Backlog |
| [Heatmap](../components/heatmap.md) | `Heatmap` | Bounded calendar table and value bands | Backlog |

## Navigation controls (9)

| Naive UI route | MarkupUI control or replacement | Current form | Contract |
| --- | --- | --- | --- |
| [Affix](../components/affix.md) | `Affix` | Native sticky positioning | Backlog |
| [Anchor](../components/anchor.md) | `Anchor`, `AnchorLink` | Native fragments and scrollspy | Backlog |
| [Back Top](../components/back-top.md) | `BackTop` | Native link/button and scroll threshold | Backlog |
| [Breadcrumb](../components/breadcrumb.md) | `Breadcrumb`, `BreadcrumbItem` | Native navigation/current/separator semantics | Backlog |
| [Loading Bar](../components/loading-bar.md) | `LoadingBar` | Root-owned progress lifecycle | Backlog |
| [Menu](../components/menu.md) | `Menu`, `MenuItem` and hierarchy | Native navigation/disclosure behavior | Backlog |
| [Pagination](../components/pagination.md) | `Pagination` | Native bounded paging controls | Backlog |
| [Steps](../components/steps.md) | `Steps`, `Step` | Native progress summary and selection intent | Backlog |
| [Tabs](../components/tabs.md) | `Tabs`, `Tab`, `TabPane` | Authored tab/panel composition | Backlog |

## Feedback controls (16)

| Naive UI route | MarkupUI control or replacement | Current form | Contract |
| --- | --- | --- | --- |
| [Alert](../components/alert.md) | `Alert` | Standalone notice with close intent | Backlog |
| [Badge](../components/badge.md) | `Badge` | Standalone target/indicator composition | Backlog |
| [Dialog](../components/dialog.md) | `Dialog` | Native dialog, forms and explicit lifetime owner | Backlog |
| [Drawer](../components/drawer.md) | `Drawer`, `DrawerContent` | Native edge-panel composition | Backlog |
| [Marquee](../components/marquee.md) | `Marquee` | Single-track native motion with static fallback | Backlog |
| [Message](../components/message.md) | `Message` service/control | Bounded root-owned feedback | Backlog |
| [Modal](../components/modal.md) | `Modal` | Generic native top-layer composition | Backlog |
| [Notification](../components/notification.md) | `Notification` | Root-owned cards and guarded close | Backlog |
| [Popconfirm](../components/popconfirm.md) | `Popconfirm` | Native confirmation actions over Popover | Backlog |
| [Popover](../components/popover.md) | `Popover` | Native top layer and positioning helper | Backlog |
| [Popselect](../components/popselect.md) | `Popselect` | Composed Popover and Select | Backlog |
| [Progress](../components/progress.md) | `Progress` | Native/SVG progress presentation | Backlog |
| [Result](../components/result.md) | `Result` and named regions | Native outcome composition | Backlog |
| [Skeleton](../components/skeleton.md) | `Skeleton` | Standalone decorative loading placeholder | Backlog |
| [Spin](../components/spin.md) | `Spin` | Standalone loading indicator/wrapper | Backlog |
| [Tooltip](../components/tooltip.md) | `Tooltip` | Native descriptive overlay over shared positioning | Backlog |

## Layout controls (6)

| Naive UI route | MarkupUI control or replacement | Current form | Contract |
| --- | --- | --- | --- |
| [Flex](../components/flex.md) | `Flex` | Native flex/gap layout | Backlog |
| [Layout](../components/layout.md) | Layout, header, main, section and sider controls | Native layout/disclosure/scrolling composition | Backlog |
| [Legacy Grid](../components/legacy-grid.md) | `Grid`, `Flex` and `Space` | Intentional replacement; no deprecated Row/Col facade | Alternative |
| [Grid](../components/grid.md) | `Grid`, `GridItem` | Native CSS grid | Backlog |
| [Space](../components/space.md) | `Space` | Authored item grouping and CSS gap | Backlog |
| [Split](../components/split.md) | `Split` and pane/separator regions | Native two-pane grid and adjustable separator | Backlog |

## Utility controls and APIs (4)

| Naive UI route | MarkupUI control or replacement | Current form | Contract |
| --- | --- | --- | --- |
| [Collapse Transition](../components/collapse-transition.md) | `CollapseTransition` | Optional native height/visibility motion owner | Backlog |
| [Discrete API](../components/discrete.md) | Explicit composition of Dialog, Message, Notification and LoadingBar owners | No generic Discrete control/runtime | Alternative |
| [Scrollbar](../components/scrollbar.md) | Native scrolling and standards CSS | Intentional replacement; no custom Scrollbar control | Alternative |
| [Virtual List](../components/virtual-list.md) | `VirtualList` | Fixed-height native windowing helper | Backlog |

## Config surfaces (3)

| Naive UI route | MarkupUI control or replacement | Current form | Contract |
| --- | --- | --- | --- |
| [Config Provider](../components/config-provider.md) | Host configuration and native theme resources | Explicit composition; no provider control/runtime | Alternative |
| [Element](../components/element.md) | Web `ViewElement` plus authored semantic child controls | No generic public Element wrapper | Architecture |
| [Global Style](../components/global-style.md) | Web global-style resource | Opt-in stylesheet; no logical control | Render profile |

## Deprecated controls (1)

| Naive UI route | MarkupUI control or replacement | Current form | Contract |
| --- | --- | --- | --- |
| [Legacy Transfer](../components/legacy-transfer.md) | Current `Transfer` | Intentional replacement; no deprecated facade | Alternative |

## Current documentation

[Read the current design](../../architecture/README.md).
