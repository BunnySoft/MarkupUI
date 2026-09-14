# Default theme and style audit

> **Historical reference.** Preserved from the previous documentation layout. This page is not the current design or a completion claim for the ViewElement rewrite.

**Status: complete for all 96 catalog scopes.** This visual-default pass follows the
native migration; completion does not claim full Naive UI pixel or API parity.

**Reviewed and integrated: 96/96 scopes.** Final classifications are 2 Fixed, 6 Matched,
3 Matched with remaining differences, 79 Fixed with remaining differences, 1 Remaining
and 5 Not applicable. Remaining native, legacy, renderer and motion differences are
documented in the component reports rather than counted as unfinished audits.

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

Component links lead to the existing scope inventory and completed style report. Every
catalog scope has rendered/source evidence or an explicit not-applicable classification.
Shared theme changes, builds and the final integration commit were coordinated centrally.

Yellow statuses describe accepted, concrete differences rather than incomplete review.
They form an optional follow-up backlog only after separating deliberate native
architecture boundaries from actionable parity work. Button's icon swap/exit transition
remains an accepted payload-boundary difference until a separate scope and budget are
approved.

## Remaining-difference triage

**2026-09-11 — all 83 yellow scopes reviewed.** Eighty-two contain only accepted native,
platform, renderer, provider, accessibility or payload boundaries. One actionable
shared-owner follow-up was identified and completed:

| Priority | Owner | Completed follow-up |
| --- | --- | --- |
| Medium | Input | Forced-color disabled wrapper borders now use GrayText. Printed focused status wrappers reset text, surface, boundary and glow. Shared Input regression coverage verifies both states. |

No actionable parity follow-up remains from this triage. The former Select note about a
pending Popselect guard was also stale: Popselect is complete against the released Select
baseline with no remaining shared dependency.

| Component | Status | Style report |
| --- | --- | --- |
| [Affix](../naive/components/affix.md) | 🟡 Remaining | [Native sticky reviewed; fixed positioning and flow differences](components/affix.md) |
| [Alert](../naive/components/alert.md) | 🟢 Fixed / 🟡 Remaining | [Geometry, severity palettes and SVG limits](components/alert.md) |
| [Anchor](../naive/components/anchor.md) | 🟢 Fixed / 🟡 Remaining | [Link/rail styling with native navigation and local-indicator limits](components/anchor.md) |
| [Auto Complete](../naive/components/auto-complete.md) | 🟢 Fixed / 🟡 Remaining | [Standalone field metrics/themes/focus, separate Input print follow-up and native datalist limits](components/auto-complete.md) |
| [Avatar](../naive/components/avatar.md) | 🟢 Fixed | [Defaults including text fit; architectural boundaries](components/avatar.md) |
| [Back Top](../naive/components/back-top.md) | 🟢 Fixed / 🟡 Remaining | [Control/icon metrics, shadows and native scroll/visibility limits](components/back-top.md) |
| [Badge](../naive/components/badge.md) | 🟢 Fixed / 🟡 Remaining | [Numeric cells, palette, wave and legacy limits](components/badge.md) |
| [Breadcrumb](../naive/components/breadcrumb.md) | 🟢 Fixed / 🟡 Remaining | [Text states, separator spacing and native current-page limits](components/breadcrumb.md) |
| [Button](../naive/components/button.md) | 🟢 Fixed / 🟡 Remaining | [Defaults, wave/insertion and blocked swap/exit motion](components/button.md) |
| [Calendar](../naive/components/calendar.md) | 🟢 Fixed / 🟡 Remaining | [Typography, light/dark cells, Today/selection states and retained native table topology](components/calendar.md) |
| [Card](../naive/components/card.md) | 🟢 Fixed / 🟡 Remaining | [Native regions, theme scope and legacy boundary](components/card.md) |
| [Carousel](../naive/components/carousel.md) | 🟢 Fixed / 🟡 Remaining | [28px labelled controls, light/dark/current states and retained native scroll-snap topology](components/carousel.md) |
| [Cascader](../naive/components/cascader.md) | 🟢 Fixed / 🟡 Remaining | [Native trigger density/theme roles with preserved paths/forms and popup-renderer limits](components/cascader.md) |
| [Checkbox](../naive/components/checkbox.md) | 🟢 Fixed / 🟡 Remaining | [Box/label metrics, theme accents and retained native skin](components/checkbox.md) |
| [Code](../naive/components/code.md) | 🟢 Fixed / 🟡 Remaining | [Plain typography, gutters and authored token limits](components/code.md) |
| [Collapse Transition](../naive/components/collapse-transition.md) | 🟢 Fixed / 🟡 Remaining | [Height/fade curves and native scheduling/geometry limits](components/collapse-transition.md) |
| [Collapse](../naive/components/collapse.md) | 🟢 Fixed / 🟡 Remaining | [Disclosure spacing, hidden boundaries and native marker/motion limits](components/collapse.md) |
| [Color Picker](../naive/components/color-picker.md) | 🟢 Fixed / 🟡 Remaining | [Native trigger sizes/themes, standalone draft fields and retained chooser/dialog limits](components/color-picker.md) |
| [Config Provider](../naive/components/config-provider.md) | ⏭️ Not applicable | [No visual component: native ancestry, cascade and application CSS remain the mechanism](components/config-provider.md) |
| [Countdown](../naive/components/countdown.md) | 🟢 Matched | [Reference inherits text; optional CSS only adds tabular numerals, unit flow and focus](components/countdown.md) |
| [Data Table](../naive/components/data-table.md) | 🟢 Fixed / 🟡 Remaining | [Native density/sort/selection paint and explicit renderer/width limits](components/data-table.md) |
| [Date Picker](../naive/components/date-picker.md) | 🟢 Fixed / 🟡 Remaining | [Reference trigger sizing/palette with native picker and labelled clear action](components/date-picker.md) |
| [Descriptions](../naive/components/descriptions.md) | 🟢 Fixed / 🟡 Remaining | [Density, text roles and retained grid/table differences](components/descriptions.md) |
| [Dialog](../naive/components/dialog.md) | 🟢 Fixed / 🟡 Remaining | [Surface/action styling with protected modality, load order and native limits](components/dialog.md) |
| [Discrete API](../naive/components/discrete.md) | ⏭️ Not applicable | [No aggregate visual component; selected native services retain independent styles](components/discrete.md) |
| [Divider](../naive/components/divider.md) | 🟢 Fixed / 🟡 Remaining | [Rule geometry, colors and native orientation limits](components/divider.md) |
| [Drawer](../naive/components/drawer.md) | 🟢 Fixed / 🟡 Remaining | [Edge geometry, theme surfaces and protected native modes/scrolling](components/drawer.md) |
| [Dropdown](../naive/components/dropdown.md) | 🟢 Fixed / 🟡 Remaining | [Shared popup surface, density/state palette and authored-column limits](components/dropdown.md) |
| [Dynamic Input](../naive/components/dynamic-input.md) | 🟢 Fixed / 🟡 Remaining | [Row/action spacing, Input-owned fields, labelled controls and native renderer limits](components/dynamic-input.md) |
| [Dynamic Tags](../naive/components/dynamic-tags.md) | 🟢 Fixed / 🟡 Remaining | [Tag/Input density, semantic palettes, labelled native actions and retained string ownership](components/dynamic-tags.md) |
| [Element](../naive/components/element.md) | ⏭️ Not applicable | [Native authoring and application CSS retain visual ownership](components/element.md) |
| [Ellipsis](../naive/components/ellipsis.md) | 🟢 Fixed / 🟡 Remaining | [Inline clipping defaults and native disclosure limits](components/ellipsis.md) |
| [Empty](../naive/components/empty.md) | 🟢 Fixed / 🟡 Remaining | [Content spacing, muted roles and original illustration](components/empty.md) |
| [Equation](../naive/components/equation.md) | ⏭️ Not applicable | [Native MathML versus external KaTeX rendering ownership](components/equation.md) |
| [Flex](../naive/components/flex.md) | 🟢 Matched / 🟡 Remaining | [Default layout matches; intrinsic sizing and RTL boundaries](components/flex.md) |
| [Float Button](../naive/components/float-button.md) | 🟢 Fixed / 🟡 Remaining | [Action metrics, shadows and native joined-group/dock limits](components/float-button.md) |
| [Form](../naive/components/form.md) | 🟢 Fixed / 🟡 Remaining | [Reference label/feedback defaults with native fieldset and Input ownership](components/form.md) |
| [Global Style](../naive/components/global-style.md) | 🟢 Fixed / 🟡 Remaining | [Body defaults and opt-in shared-preset boundaries](components/global-style.md) |
| [Gradient Text](../naive/components/gradient-text.md) | 🟢 Fixed / 🟡 Remaining | [Paint metrics, theme stops and safe compositing limits](components/gradient-text.md) |
| [Grid](../naive/components/grid.md) | 🟢 Matched / 🟡 Remaining | [Retained tracks match; responsive/offset algorithm limits](components/grid.md) |
| [Heatmap](../naive/components/heatmap.md) | 🟢 Fixed / 🟡 Remaining | [Reference color/spacing defaults with native table targets and accessible detail](components/heatmap.md) |
| [Highlight](../naive/components/highlight.md) | 🟢 Fixed | [Native mark defaults, print contrast and retained helper scope](components/highlight.md) |
| [Icon](../naive/components/icon.md) | 🟢 Fixed / 🟡 Remaining | [Inline metrics, theme depth and native SVG paint limits](components/icon.md) |
| [Image](../naive/components/image.md) | 🟢 Fixed / 🟡 Remaining | [Preview fitting, chrome and native toolbar limits](components/image.md) |
| [Infinite Scroll](../naive/components/infinite-scroll.md) | 🟢 Matched | [Unpainted native scrolling surface with opt-in geometry and sentinel behavior](components/infinite-scroll.md) |
| [Input Number](../naive/components/input-number.md) | 🟢 Fixed / 🟡 Remaining | [Field/stepper styling, bounded sizing and native numeric limits](components/input-number.md) |
| [Input OTP](../naive/components/input-otp.md) | 🟢 Fixed / 🟡 Remaining | [Single-field sizing/palette, completed shared Input media follow-up and native cell limits](components/input-otp.md) |
| [Input](../naive/components/input.md) | 🟢 Fixed / 🟡 Remaining | [Native field geometry, theme states and textarea/icon limits](components/input.md) |
| [Layout](../naive/components/layout.md) | 🟢 Fixed / 🟡 Remaining | [Region palettes, author tokens and native scrolling limits](components/layout.md) |
| [Legacy Grid](../naive/components/legacy-grid.md) | 🟢 Matched | [Selected grid/flex/space geometry with native topology differences](components/legacy-grid.md) |
| [Legacy Transfer](../naive/components/legacy-transfer.md) | 🟢 Fixed / 🟡 Remaining | [Native listbox density with labelled actions and retained form semantics](components/legacy-transfer.md) |
| [List](../naive/components/list.md) | 🟢 Fixed / 🟡 Remaining | [Presentation only; marker and density adaptations](components/list.md) |
| [Loading Bar](../naive/components/loading-bar.md) | 🟢 Fixed / 🟡 Remaining | [Thin rail, readable fixed status and retained native progress/timing policies](components/loading-bar.md) |
| [Log](../naive/components/log.md) | 🟢 Fixed / 🟡 Remaining | [Viewport/wrap/gutter defaults, print contrast and retained native record/scroll limits](components/log.md) |
| [Marquee](../naive/components/marquee.md) | 🟢 Fixed / 🟡 Remaining | [Track sizing/whitespace/media defaults with native motion limits](components/marquee.md) |
| [Mention](../naive/components/mention.md) | 🟢 Fixed / 🟡 Remaining | [Input ownership, control/menu density and adjacent native panel limits](components/mention.md) |
| [Menu](../naive/components/menu.md) | 🟢 Fixed / 🟡 Remaining | [Row density, inert-state paint and native branch/collapse limits](components/menu.md) |
| [Message](../naive/components/message.md) | 🟢 Fixed / 🟡 Remaining | [Reference card density/palette with native kind, close and action semantics](components/message.md) |
| [Modal](../naive/components/modal.md) | 🟢 Fixed / 🟡 Remaining | [Raw/Card/Dialog surfaces, protected modality and retained native controls](components/modal.md) |
| [Notification](../naive/components/notification.md) | 🟢 Fixed / 🟡 Remaining | [Reference card metrics/palette with native semantic and close-control differences](components/notification.md) |
| [Number Animation](../naive/components/number-animation.md) | 🟢 Matched | [Inherited text with optional numeric readability and focus additions](components/number-animation.md) |
| [Page Header](../naive/components/page-header.md) | 🟢 Fixed / 🟡 Remaining | [Header metrics, back control and authored/narrow-layout limits](components/page-header.md) |
| [Pagination](../naive/components/pagination.md) | 🟢 Fixed / 🟡 Remaining | [Page/auxiliary controls, print readability and native renderer limits](components/pagination.md) |
| [Popconfirm](../naive/components/popconfirm.md) | 🟢 Fixed / 🟡 Remaining | [Shared surface, local layout and native action-paint limits](components/popconfirm.md) |
| [Popover](../naive/components/popover.md) | 🟢 Fixed / 🟡 Remaining | [Standalone surface, protected consumers and native popup limits](components/popover.md) |
| [Popselect](../naive/components/popselect.md) | 🟢 Fixed / 🟡 Remaining | [Reference popup density/themes with native selection and explicit Done semantics](components/popselect.md) |
| [Progress](../naive/components/progress.md) | 🟢 Fixed / 🟡 Remaining | [Native rails, ring geometry, motion and indicator limits](components/progress.md) |
| [QR Code](../naive/components/qr-code.md) | ⏭️ Not applicable | [No encoded/rendered component; native text/link handoff remains application-owned](components/qr-code.md) |
| [Radio](../naive/components/radio.md) | 🟢 Fixed / 🟡 Remaining | [Circle/button metrics, high-contrast protection and native skin limits](components/radio.md) |
| [Rate](../naive/components/rate.md) | 🟢 Fixed / 🟡 Remaining | [Glyph palette/sizing with retained native choices and artwork limits](components/rate.md) |
| [Result](../naive/components/result.md) | 🟢 Fixed / 🟡 Remaining | [Region spacing, title roles and authored artwork limits](components/result.md) |
| [Scrollbar](../naive/components/scrollbar.md) | 🟢 Fixed / 🟡 Remaining | [Opt-in native thumb palette and OS/browser geometry limits](components/scrollbar.md) |
| [Select](../naive/components/select.md) | 🟢 Fixed / 🟡 Remaining | [Native field metrics, theme states and popup/list geometry limits](components/select.md) |
| [Skeleton](../naive/components/skeleton.md) | 🟢 Fixed / 🟡 Remaining | [Animated endpoints and retained shape/repeat limits](components/skeleton.md) |
| [Slider](../naive/components/slider.md) | 🟢 Fixed / 🟡 Remaining | [Native range footprint/accents and retained track/readout limits](components/slider.md) |
| [Space](../naive/components/space.md) | 🟢 Matched / 🟡 Remaining | [Default layout matches; intrinsic nowrap limits](components/space.md) |
| [Spin](../naive/components/spin.md) | 🟢 Fixed / 🟡 Remaining | [SVG motion, theme dimming and native interaction limits](components/spin.md) |
| [Split](../naive/components/split.md) | 🟢 Fixed / 🟡 Remaining | [Reference handle palette/easing with accessible native separator geometry](components/split.md) |
| [Statistic](../naive/components/statistic.md) | 🟢 Fixed / 🟡 Remaining | [Inline value geometry, text roles and native limits](components/statistic.md) |
| [Steps](../naive/components/steps.md) | 🟢 Fixed / 🟡 Remaining | [Status roles, typography, print contrast and native marker/layout limits](components/steps.md) |
| [Switch](../naive/components/switch.md) | 🟢 Fixed / 🟡 Remaining | [Rail/thumb metrics, theme paint and retained native-content limits](components/switch.md) |
| [Table](../naive/components/table.md) | 🟢 Fixed / 🟡 Remaining | [Typography, palette and native collapsed-border limits](components/table.md) |
| [Tabs](../naive/components/tabs.md) | 🟢 Fixed / 🟡 Remaining | [Variants, placement spacing and native indicator/motion limits](components/tabs.md) |
| [Tag](../naive/components/tag.md) | 🟢 Fixed / 🟡 Remaining | [Sizing, palettes, close states and native limits](components/tag.md) |
| [Thing](../naive/components/thing.md) | 🟢 Fixed / 🟡 Remaining | [Typography, indentation and authored composition limits](components/thing.md) |
| [Time Picker](../naive/components/time-picker.md) | 🟢 Fixed / 🟡 Remaining | [Reference trigger density with native platform picker and labelled clear action](components/time-picker.md) |
| [Time](../naive/components/time.md) | 🟢 Matched | [Inherited text with optional numeric readability and focus additions](components/time.md) |
| [Timeline](../naive/components/timeline.md) | 🟢 Fixed / 🟡 Remaining | [Node/rail alignment, supplementary colors and native RTL/dash limits](components/timeline.md) |
| [Tooltip](../naive/components/tooltip.md) | 🟢 Fixed / 🟡 Remaining | [Shared dark surface, typography and native tooltip limits](components/tooltip.md) |
| [Transfer](../naive/components/transfer.md) | 🟢 Fixed / 🟡 Remaining | [Pane/control roles, protected media contrast and native list/membership limits](components/transfer.md) |
| [Tree Select](../naive/components/tree-select.md) | 🟢 Fixed / 🟡 Remaining | [Native field sizes/theme roles and retained listbox/path-label limits](components/tree-select.md) |
| [Tree](../naive/components/tree.md) | 🟢 Fixed / 🟡 Remaining | [Native row styling, high-contrast checks and disclosure/marker limits](components/tree.md) |
| [Typography](../naive/components/typography.md) | 🟢 Fixed / 🟡 Remaining | [Text, headings, code and native presentation limits](components/typography.md) |
| [Upload](../naive/components/upload.md) | 🟢 Fixed / 🟡 Remaining | [Drop/row/progress styling, protected disabled contrast and native picker/layout limits](components/upload.md) |
| [Virtual List](../naive/components/virtual-list.md) | 🟢 Matched | [Component-neutral fixed geometry with native scrollbar ownership](components/virtual-list.md) |
| [Watermark](../naive/components/watermark.md) | 🟢 Fixed / 🟡 Remaining | [Matched overlay mechanics with safer native ownership and retained tile defaults](components/watermark.md) |

## Current documentation

[Read the current design](../../styling/README.md).
