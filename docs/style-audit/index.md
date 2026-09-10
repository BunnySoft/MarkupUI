# Default theme and style audit

**Status: in progress.** This is a new visual-default pass after the native migration,
not a claim that the earlier functional acceptance established Naive UI visual parity.

**Reviewed and integrated: 65/96 scopes.** The other **31** are not yet accepted in this
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

Release builds isolate ready changes from unfinished agent work. Button's wave and
insertion are integrated; its icon swap/exit transition remains an explicit budget blocker.

| Component | Status | Style report |
| --- | --- | --- |
| [Affix](../naive-ui/components/affix.md) | 🟡 Remaining | [Native sticky reviewed; fixed positioning and flow differences](components/affix.md) |
| [Alert](../naive-ui/components/alert.md) | 🟢 Fixed / 🟡 Remaining | [Geometry, severity palettes and SVG limits](components/alert.md) |
| [Anchor](../naive-ui/components/anchor.md) | 🟢 Fixed / 🟡 Remaining | [Link/rail styling with native navigation and local-indicator limits](components/anchor.md) |
| [Auto Complete](../naive-ui/components/auto-complete.md) | 🟠 Reviewing | — |
| [Avatar](../naive-ui/components/avatar.md) | 🟢 Fixed | [Defaults including text fit; architectural boundaries](components/avatar.md) |
| [Back Top](../naive-ui/components/back-top.md) | 🟢 Fixed / 🟡 Remaining | [Control/icon metrics, shadows and native scroll/visibility limits](components/back-top.md) |
| [Badge](../naive-ui/components/badge.md) | 🟢 Fixed / 🟡 Remaining | [Numeric cells, palette, wave and legacy limits](components/badge.md) |
| [Breadcrumb](../naive-ui/components/breadcrumb.md) | 🟢 Fixed / 🟡 Remaining | [Text states, separator spacing and native current-page limits](components/breadcrumb.md) |
| [Button](../naive-ui/components/button.md) | 🟢 Fixed / 🟡 Remaining | [Defaults, wave/insertion and blocked swap/exit motion](components/button.md) |
| [Calendar](../naive-ui/components/calendar.md) | ⚪ Pending | — |
| [Card](../naive-ui/components/card.md) | 🟢 Fixed / 🟡 Remaining | [Native regions, theme scope and legacy boundary](components/card.md) |
| [Carousel](../naive-ui/components/carousel.md) | ⚪ Pending | — |
| [Cascader](../naive-ui/components/cascader.md) | 🟢 Fixed / 🟡 Remaining | [Native trigger density/theme roles with preserved paths/forms and popup-renderer limits](components/cascader.md) |
| [Checkbox](../naive-ui/components/checkbox.md) | 🟢 Fixed / 🟡 Remaining | [Box/label metrics, theme accents and retained native skin](components/checkbox.md) |
| [Code](../naive-ui/components/code.md) | 🟢 Fixed / 🟡 Remaining | [Plain typography, gutters and authored token limits](components/code.md) |
| [Collapse Transition](../naive-ui/components/collapse-transition.md) | 🟢 Fixed / 🟡 Remaining | [Height/fade curves and native scheduling/geometry limits](components/collapse-transition.md) |
| [Collapse](../naive-ui/components/collapse.md) | 🟢 Fixed / 🟡 Remaining | [Disclosure spacing, hidden boundaries and native marker/motion limits](components/collapse.md) |
| [Color Picker](../naive-ui/components/color-picker.md) | ⚪ Pending | — |
| [Config Provider](../naive-ui/components/config-provider.md) | ⚪ Pending | — |
| [Countdown](../naive-ui/components/countdown.md) | ⚪ Pending | — |
| [Data Table](../naive-ui/components/data-table.md) | 🟢 Fixed / 🟡 Remaining | [Native density/sort/selection paint and explicit renderer/width limits](components/data-table.md) |
| [Date Picker](../naive-ui/components/date-picker.md) | 🟠 Reviewing | — |
| [Descriptions](../naive-ui/components/descriptions.md) | 🟢 Fixed / 🟡 Remaining | [Density, text roles and retained grid/table differences](components/descriptions.md) |
| [Dialog](../naive-ui/components/dialog.md) | 🟢 Fixed / 🟡 Remaining | [Surface/action styling with protected modality, load order and native limits](components/dialog.md) |
| [Discrete API](../naive-ui/components/discrete.md) | ⚪ Pending | — |
| [Divider](../naive-ui/components/divider.md) | 🟢 Fixed / 🟡 Remaining | [Rule geometry, colors and native orientation limits](components/divider.md) |
| [Drawer](../naive-ui/components/drawer.md) | 🟢 Fixed / 🟡 Remaining | [Edge geometry, theme surfaces and protected native modes/scrolling](components/drawer.md) |
| [Dropdown](../naive-ui/components/dropdown.md) | 🟢 Fixed / 🟡 Remaining | [Shared popup surface, density/state palette and authored-column limits](components/dropdown.md) |
| [Dynamic Input](../naive-ui/components/dynamic-input.md) | ⚪ Pending | — |
| [Dynamic Tags](../naive-ui/components/dynamic-tags.md) | ⚪ Pending | — |
| [Element](../naive-ui/components/element.md) | ⚪ Pending | — |
| [Ellipsis](../naive-ui/components/ellipsis.md) | 🟢 Fixed / 🟡 Remaining | [Inline clipping defaults and native disclosure limits](components/ellipsis.md) |
| [Empty](../naive-ui/components/empty.md) | 🟢 Fixed / 🟡 Remaining | [Content spacing, muted roles and original illustration](components/empty.md) |
| [Equation](../naive-ui/components/equation.md) | ⚪ Pending | — |
| [Flex](../naive-ui/components/flex.md) | 🟢 Matched / 🟡 Remaining | [Default layout matches; intrinsic sizing and RTL boundaries](components/flex.md) |
| [Float Button](../naive-ui/components/float-button.md) | 🟢 Fixed / 🟡 Remaining | [Action metrics, shadows and native joined-group/dock limits](components/float-button.md) |
| [Form](../naive-ui/components/form.md) | 🟠 Reviewing | — |
| [Global Style](../naive-ui/components/global-style.md) | 🟢 Fixed / 🟡 Remaining | [Body defaults and opt-in shared-preset boundaries](components/global-style.md) |
| [Gradient Text](../naive-ui/components/gradient-text.md) | 🟢 Fixed / 🟡 Remaining | [Paint metrics, theme stops and safe compositing limits](components/gradient-text.md) |
| [Grid](../naive-ui/components/grid.md) | 🟢 Matched / 🟡 Remaining | [Retained tracks match; responsive/offset algorithm limits](components/grid.md) |
| [Heatmap](../naive-ui/components/heatmap.md) | ⚪ Pending | — |
| [Highlight](../naive-ui/components/highlight.md) | 🟢 Fixed | [Native mark defaults, print contrast and retained helper scope](components/highlight.md) |
| [Icon](../naive-ui/components/icon.md) | 🟢 Fixed / 🟡 Remaining | [Inline metrics, theme depth and native SVG paint limits](components/icon.md) |
| [Image](../naive-ui/components/image.md) | 🟢 Fixed / 🟡 Remaining | [Preview fitting, chrome and native toolbar limits](components/image.md) |
| [Infinite Scroll](../naive-ui/components/infinite-scroll.md) | ⚪ Pending | — |
| [Input Number](../naive-ui/components/input-number.md) | 🟢 Fixed / 🟡 Remaining | [Field/stepper styling, bounded sizing and native numeric limits](components/input-number.md) |
| [Input OTP](../naive-ui/components/input-otp.md) | 🟠 Reviewing | — |
| [Input](../naive-ui/components/input.md) | 🟢 Fixed / 🟡 Remaining | [Native field geometry, theme states and textarea/icon limits](components/input.md) |
| [Layout](../naive-ui/components/layout.md) | 🟢 Fixed / 🟡 Remaining | [Region palettes, author tokens and native scrolling limits](components/layout.md) |
| [Legacy Grid](../naive-ui/components/legacy-grid.md) | ⚪ Pending | — |
| [Legacy Transfer](../naive-ui/components/legacy-transfer.md) | ⚪ Pending | — |
| [List](../naive-ui/components/list.md) | 🟢 Fixed / 🟡 Remaining | [Presentation only; marker and density adaptations](components/list.md) |
| [Loading Bar](../naive-ui/components/loading-bar.md) | 🟢 Fixed / 🟡 Remaining | [Thin rail, readable fixed status and retained native progress/timing policies](components/loading-bar.md) |
| [Log](../naive-ui/components/log.md) | 🟢 Fixed / 🟡 Remaining | [Viewport/wrap/gutter defaults, print contrast and retained native record/scroll limits](components/log.md) |
| [Marquee](../naive-ui/components/marquee.md) | ⚪ Pending | — |
| [Mention](../naive-ui/components/mention.md) | ⚪ Pending | — |
| [Menu](../naive-ui/components/menu.md) | 🟢 Fixed / 🟡 Remaining | [Row density, inert-state paint and native branch/collapse limits](components/menu.md) |
| [Message](../naive-ui/components/message.md) | 🟠 Reviewing | — |
| [Modal](../naive-ui/components/modal.md) | 🟢 Fixed / 🟡 Remaining | [Raw/Card/Dialog surfaces, protected modality and retained native controls](components/modal.md) |
| [Notification](../naive-ui/components/notification.md) | ⚪ Pending | — |
| [Number Animation](../naive-ui/components/number-animation.md) | ⚪ Pending | — |
| [Page Header](../naive-ui/components/page-header.md) | 🟢 Fixed / 🟡 Remaining | [Header metrics, back control and authored/narrow-layout limits](components/page-header.md) |
| [Pagination](../naive-ui/components/pagination.md) | 🟢 Fixed / 🟡 Remaining | [Page/auxiliary controls, print readability and native renderer limits](components/pagination.md) |
| [Popconfirm](../naive-ui/components/popconfirm.md) | 🟢 Fixed / 🟡 Remaining | [Shared surface, local layout and native action-paint limits](components/popconfirm.md) |
| [Popover](../naive-ui/components/popover.md) | 🟢 Fixed / 🟡 Remaining | [Standalone surface, protected consumers and native popup limits](components/popover.md) |
| [Popselect](../naive-ui/components/popselect.md) | 🟠 Reviewing | — |
| [Progress](../naive-ui/components/progress.md) | 🟢 Fixed / 🟡 Remaining | [Native rails, ring geometry, motion and indicator limits](components/progress.md) |
| [QR Code](../naive-ui/components/qr-code.md) | ⚪ Pending | — |
| [Radio](../naive-ui/components/radio.md) | 🟢 Fixed / 🟡 Remaining | [Circle/button metrics, high-contrast protection and native skin limits](components/radio.md) |
| [Rate](../naive-ui/components/rate.md) | 🟢 Fixed / 🟡 Remaining | [Glyph palette/sizing with retained native choices and artwork limits](components/rate.md) |
| [Result](../naive-ui/components/result.md) | 🟢 Fixed / 🟡 Remaining | [Region spacing, title roles and authored artwork limits](components/result.md) |
| [Scrollbar](../naive-ui/components/scrollbar.md) | 🟢 Fixed / 🟡 Remaining | [Opt-in native thumb palette and OS/browser geometry limits](components/scrollbar.md) |
| [Select](../naive-ui/components/select.md) | 🟢 Fixed / 🟡 Remaining | [Native field metrics, theme states and popup/list geometry limits](components/select.md) |
| [Skeleton](../naive-ui/components/skeleton.md) | 🟢 Fixed / 🟡 Remaining | [Animated endpoints and retained shape/repeat limits](components/skeleton.md) |
| [Slider](../naive-ui/components/slider.md) | 🟢 Fixed / 🟡 Remaining | [Native range footprint/accents and retained track/readout limits](components/slider.md) |
| [Space](../naive-ui/components/space.md) | 🟢 Matched / 🟡 Remaining | [Default layout matches; intrinsic nowrap limits](components/space.md) |
| [Spin](../naive-ui/components/spin.md) | 🟢 Fixed / 🟡 Remaining | [SVG motion, theme dimming and native interaction limits](components/spin.md) |
| [Split](../naive-ui/components/split.md) | ⚪ Pending | — |
| [Statistic](../naive-ui/components/statistic.md) | 🟢 Fixed / 🟡 Remaining | [Inline value geometry, text roles and native limits](components/statistic.md) |
| [Steps](../naive-ui/components/steps.md) | 🟢 Fixed / 🟡 Remaining | [Status roles, typography, print contrast and native marker/layout limits](components/steps.md) |
| [Switch](../naive-ui/components/switch.md) | 🟢 Fixed / 🟡 Remaining | [Rail/thumb metrics, theme paint and retained native-content limits](components/switch.md) |
| [Table](../naive-ui/components/table.md) | 🟢 Fixed / 🟡 Remaining | [Typography, palette and native collapsed-border limits](components/table.md) |
| [Tabs](../naive-ui/components/tabs.md) | 🟢 Fixed / 🟡 Remaining | [Variants, placement spacing and native indicator/motion limits](components/tabs.md) |
| [Tag](../naive-ui/components/tag.md) | 🟢 Fixed / 🟡 Remaining | [Sizing, palettes, close states and native limits](components/tag.md) |
| [Thing](../naive-ui/components/thing.md) | 🟢 Fixed / 🟡 Remaining | [Typography, indentation and authored composition limits](components/thing.md) |
| [Time Picker](../naive-ui/components/time-picker.md) | ⚪ Pending | — |
| [Time](../naive-ui/components/time.md) | ⚪ Pending | — |
| [Timeline](../naive-ui/components/timeline.md) | 🟢 Fixed / 🟡 Remaining | [Node/rail alignment, supplementary colors and native RTL/dash limits](components/timeline.md) |
| [Tooltip](../naive-ui/components/tooltip.md) | 🟢 Fixed / 🟡 Remaining | [Shared dark surface, typography and native tooltip limits](components/tooltip.md) |
| [Transfer](../naive-ui/components/transfer.md) | 🟢 Fixed / 🟡 Remaining | [Pane/control roles, protected media contrast and native list/membership limits](components/transfer.md) |
| [Tree Select](../naive-ui/components/tree-select.md) | 🟠 Reviewing | — |
| [Tree](../naive-ui/components/tree.md) | 🟢 Fixed / 🟡 Remaining | [Native row styling, high-contrast checks and disclosure/marker limits](components/tree.md) |
| [Typography](../naive-ui/components/typography.md) | 🟢 Fixed / 🟡 Remaining | [Text, headings, code and native presentation limits](components/typography.md) |
| [Upload](../naive-ui/components/upload.md) | 🟢 Fixed / 🟡 Remaining | [Drop/row/progress styling, protected disabled contrast and native picker/layout limits](components/upload.md) |
| [Virtual List](../naive-ui/components/virtual-list.md) | ⚪ Pending | — |
| [Watermark](../naive-ui/components/watermark.md) | ⚪ Pending | — |
