# Default theme and style audit

**Status: in progress.** This is a new visual-default pass after the native migration,
not a claim that the earlier functional acceptance established Naive UI visual parity.

**Reviewed and integrated: 12/96 scopes.** The other **84** are not yet accepted in this
pass. Reviewed includes explicitly documented remaining native, legacy and motion
differences; reviewed scopes do not imply complete pixel/API parity.

The comparison starts with Naive UI's **default light theme**, default component props
and only the content/values needed to render a useful example. The reference version,
fixture conditions and measured values are recorded in each report. Dark-mode and
author-override behavior are regression concerns where relevant.

## Review contract

Compare rendered geometry and computed presentation alongside pinned source tokens:
font family/size/weight/line-height, dimensions/padding/gaps, borders/radii, foreground/
background colors, shadows and relevant default states. Isolate each library's CSS and
keep viewport, browser, fonts and content comparable. A customized documentation demo
is not evidence of a default.

Each component report lists the Naive expectation, previous MarkupUI value, actual fix,
affected file and resulting measurement. Fix feasible mismatches in the active native
implementation and relevant legacy presentation rather than masking them in demo CSS.
Generated compatibility adapters are regenerated from their canonical sources.

Runtime dependencies remain zero. Reference-only Naive UI/Vue fixtures live outside the
repository. Native picker rendering, deliberately different markup or omitted runtime
features may limit equivalence; record a specific remaining difference instead of
claiming a match or silently skipping the component.

## Status legend

| Status | Meaning |
| --- | --- |
| ⚪ Pending | Not yet reviewed in this visual pass. |
| 🟠 Reviewing | Source and rendered comparison in progress. |
| 🟢 Matched | Reviewed defaults already match the documented baseline. |
| 🟢 Fixed | Identified default-style differences corrected and compared again. |
| 🟡 Remaining | A concrete difference remains; rationale and follow-through are explicit. |
| ⏭️ Not applicable | No corresponding implemented visual component; exclusion/recipe reviewed explicitly. |

## Queue

Component links lead to the existing scope inventory. A style-report link is added when
that component's review is available. Avatar and Button were reviewed first. The remaining
audit now uses parallel component-owned work, with shared theme changes, builds and commits
coordinated centrally. Reviewing does not mean matched; each component still needs its own
rendered evidence and acceptance report.

| Component | Status | Style report |
| --- | --- | --- |
| [Affix](../naive-ui/components/affix.md) | ⚪ Pending | — |
| [Alert](../naive-ui/components/alert.md) | 🟢 Fixed / 🟡 Remaining | [Geometry, severity palettes and SVG limits](components/alert.md) |
| [Anchor](../naive-ui/components/anchor.md) | ⚪ Pending | — |
| [Auto Complete](../naive-ui/components/auto-complete.md) | ⚪ Pending | — |
| [Avatar](../naive-ui/components/avatar.md) | 🟢 Fixed | [Defaults including text fit; architectural boundaries](components/avatar.md) |
| [Back Top](../naive-ui/components/back-top.md) | ⚪ Pending | — |
| [Badge](../naive-ui/components/badge.md) | 🟢 Fixed / 🟡 Remaining | [Numeric cells, palette, wave and legacy limits](components/badge.md) |
| [Breadcrumb](../naive-ui/components/breadcrumb.md) | ⚪ Pending | — |
| [Button](../naive-ui/components/button.md) | 🟢 Fixed / 🟡 Remaining | [Defaults, state endpoints and remaining motion](components/button.md) |
| [Calendar](../naive-ui/components/calendar.md) | ⚪ Pending | — |
| [Card](../naive-ui/components/card.md) | 🟢 Fixed / 🟡 Remaining | [Native regions, theme scope and legacy boundary](components/card.md) |
| [Carousel](../naive-ui/components/carousel.md) | ⚪ Pending | — |
| [Cascader](../naive-ui/components/cascader.md) | ⚪ Pending | — |
| [Checkbox](../naive-ui/components/checkbox.md) | ⚪ Pending | — |
| [Code](../naive-ui/components/code.md) | ⚪ Pending | — |
| [Collapse Transition](../naive-ui/components/collapse-transition.md) | ⚪ Pending | — |
| [Collapse](../naive-ui/components/collapse.md) | ⚪ Pending | — |
| [Color Picker](../naive-ui/components/color-picker.md) | ⚪ Pending | — |
| [Config Provider](../naive-ui/components/config-provider.md) | ⚪ Pending | — |
| [Countdown](../naive-ui/components/countdown.md) | ⚪ Pending | — |
| [Data Table](../naive-ui/components/data-table.md) | ⚪ Pending | — |
| [Date Picker](../naive-ui/components/date-picker.md) | ⚪ Pending | — |
| [Descriptions](../naive-ui/components/descriptions.md) | ⚪ Pending | — |
| [Dialog](../naive-ui/components/dialog.md) | ⚪ Pending | — |
| [Discrete API](../naive-ui/components/discrete.md) | ⚪ Pending | — |
| [Divider](../naive-ui/components/divider.md) | 🟢 Fixed / 🟡 Remaining | [Rule geometry, colors and native orientation limits](components/divider.md) |
| [Drawer](../naive-ui/components/drawer.md) | ⚪ Pending | — |
| [Dropdown](../naive-ui/components/dropdown.md) | ⚪ Pending | — |
| [Dynamic Input](../naive-ui/components/dynamic-input.md) | ⚪ Pending | — |
| [Dynamic Tags](../naive-ui/components/dynamic-tags.md) | ⚪ Pending | — |
| [Element](../naive-ui/components/element.md) | ⚪ Pending | — |
| [Ellipsis](../naive-ui/components/ellipsis.md) | ⚪ Pending | — |
| [Empty](../naive-ui/components/empty.md) | 🟢 Fixed / 🟡 Remaining | [Content spacing, muted roles and original illustration](components/empty.md) |
| [Equation](../naive-ui/components/equation.md) | ⚪ Pending | — |
| [Flex](../naive-ui/components/flex.md) | ⚪ Pending | — |
| [Float Button](../naive-ui/components/float-button.md) | ⚪ Pending | — |
| [Form](../naive-ui/components/form.md) | ⚪ Pending | — |
| [Global Style](../naive-ui/components/global-style.md) | 🟢 Fixed / 🟡 Remaining | [Body defaults and opt-in shared-preset boundaries](components/global-style.md) |
| [Gradient Text](../naive-ui/components/gradient-text.md) | ⚪ Pending | — |
| [Grid](../naive-ui/components/grid.md) | ⚪ Pending | — |
| [Heatmap](../naive-ui/components/heatmap.md) | ⚪ Pending | — |
| [Highlight](../naive-ui/components/highlight.md) | ⚪ Pending | — |
| [Icon](../naive-ui/components/icon.md) | ⚪ Pending | — |
| [Image](../naive-ui/components/image.md) | 🟠 Reviewing | — |
| [Infinite Scroll](../naive-ui/components/infinite-scroll.md) | ⚪ Pending | — |
| [Input Number](../naive-ui/components/input-number.md) | ⚪ Pending | — |
| [Input OTP](../naive-ui/components/input-otp.md) | ⚪ Pending | — |
| [Input](../naive-ui/components/input.md) | ⚪ Pending | — |
| [Layout](../naive-ui/components/layout.md) | ⚪ Pending | — |
| [Legacy Grid](../naive-ui/components/legacy-grid.md) | ⚪ Pending | — |
| [Legacy Transfer](../naive-ui/components/legacy-transfer.md) | ⚪ Pending | — |
| [List](../naive-ui/components/list.md) | ⚪ Pending | — |
| [Loading Bar](../naive-ui/components/loading-bar.md) | ⚪ Pending | — |
| [Log](../naive-ui/components/log.md) | ⚪ Pending | — |
| [Marquee](../naive-ui/components/marquee.md) | ⚪ Pending | — |
| [Mention](../naive-ui/components/mention.md) | ⚪ Pending | — |
| [Menu](../naive-ui/components/menu.md) | ⚪ Pending | — |
| [Message](../naive-ui/components/message.md) | ⚪ Pending | — |
| [Modal](../naive-ui/components/modal.md) | ⚪ Pending | — |
| [Notification](../naive-ui/components/notification.md) | ⚪ Pending | — |
| [Number Animation](../naive-ui/components/number-animation.md) | ⚪ Pending | — |
| [Page Header](../naive-ui/components/page-header.md) | ⚪ Pending | — |
| [Pagination](../naive-ui/components/pagination.md) | ⚪ Pending | — |
| [Popconfirm](../naive-ui/components/popconfirm.md) | ⚪ Pending | — |
| [Popover](../naive-ui/components/popover.md) | ⚪ Pending | — |
| [Popselect](../naive-ui/components/popselect.md) | ⚪ Pending | — |
| [Progress](../naive-ui/components/progress.md) | ⚪ Pending | — |
| [QR Code](../naive-ui/components/qr-code.md) | ⚪ Pending | — |
| [Radio](../naive-ui/components/radio.md) | ⚪ Pending | — |
| [Rate](../naive-ui/components/rate.md) | ⚪ Pending | — |
| [Result](../naive-ui/components/result.md) | 🟠 Reviewing | — |
| [Scrollbar](../naive-ui/components/scrollbar.md) | ⚪ Pending | — |
| [Select](../naive-ui/components/select.md) | ⚪ Pending | — |
| [Skeleton](../naive-ui/components/skeleton.md) | 🟢 Fixed / 🟡 Remaining | [Animated endpoints and retained shape/repeat limits](components/skeleton.md) |
| [Slider](../naive-ui/components/slider.md) | ⚪ Pending | — |
| [Space](../naive-ui/components/space.md) | 🟢 Matched / 🟡 Remaining | [Default layout matches; intrinsic nowrap limits](components/space.md) |
| [Spin](../naive-ui/components/spin.md) | ⚪ Pending | — |
| [Split](../naive-ui/components/split.md) | ⚪ Pending | — |
| [Statistic](../naive-ui/components/statistic.md) | 🟠 Reviewing | — |
| [Steps](../naive-ui/components/steps.md) | ⚪ Pending | — |
| [Switch](../naive-ui/components/switch.md) | ⚪ Pending | — |
| [Table](../naive-ui/components/table.md) | ⚪ Pending | — |
| [Tabs](../naive-ui/components/tabs.md) | ⚪ Pending | — |
| [Tag](../naive-ui/components/tag.md) | 🟢 Fixed / 🟡 Remaining | [Sizing, palettes, close states and native limits](components/tag.md) |
| [Thing](../naive-ui/components/thing.md) | ⚪ Pending | — |
| [Time Picker](../naive-ui/components/time-picker.md) | ⚪ Pending | — |
| [Time](../naive-ui/components/time.md) | ⚪ Pending | — |
| [Timeline](../naive-ui/components/timeline.md) | ⚪ Pending | — |
| [Tooltip](../naive-ui/components/tooltip.md) | ⚪ Pending | — |
| [Transfer](../naive-ui/components/transfer.md) | ⚪ Pending | — |
| [Tree Select](../naive-ui/components/tree-select.md) | ⚪ Pending | — |
| [Tree](../naive-ui/components/tree.md) | ⚪ Pending | — |
| [Typography](../naive-ui/components/typography.md) | 🟢 Fixed / 🟡 Remaining | [Text, headings, code and native presentation limits](components/typography.md) |
| [Upload](../naive-ui/components/upload.md) | ⚪ Pending | — |
| [Virtual List](../naive-ui/components/virtual-list.md) | ⚪ Pending | — |
| [Watermark](../naive-ui/components/watermark.md) | ⚪ Pending | — |
