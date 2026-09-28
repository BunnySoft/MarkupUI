# 5. Complete MarkupUI element directory

This directory lists the current Web registration surface: **89 selectable families**
with **203 distinct tags**, plus **15 root-facade tags** and **3 optional plugin tags**.
Family tags are checked against source-generated `demo/api` data by
`tests/element-directory.test.ts`. Property/method documentation belongs in the linked
demo/API pages, not duplicated here.

All public authoring uses logical `m-*` elements. Web renderers own native semantics;
a tag is not necessarily a one-to-one HTML replacement. SwiftUI, Flutter and CLI
mappings are design contracts, not delivered renderers. Directory presence is not
production approval; see the [release gates](../architecture/09-production.md).

## Selectable families

Load only the families and their declared dependencies that the application needs.
Companion/configuration tags belong to the same family, not separate delivery units.

| Family / demo and API | Registered tags |
| --- | --- |
| [affix](../../demo/components/affix.html) | `m-affix` |
| [alert](../../demo/components/alert.html) | `m-alert` |
| [anchor](../../demo/components/anchor.html) | `m-anchor`, `m-anchor-link` |
| [auto-complete](../../demo/components/auto-complete.html) | `m-auto-complete` |
| [avatar](../../demo/components/avatar.html) | `m-avatar-placeholder`, `m-avatar-fallback`, `m-avatar`, `m-avatar-group` |
| [back-top](../../demo/components/back-top.html) | `m-back-top` |
| [badge](../../demo/components/badge.html) | `m-badge` |
| [box](../../demo/components/box.html) | `m-box`, `m-div`, `m-span`, `m-label`, `m-footer`, `m-article`, `m-strong`, `m-em`, `m-small`, `m-pre`, `m-details`, `m-summary` |
| [breadcrumb](../../demo/components/breadcrumb.html) | `m-breadcrumb`, `m-breadcrumb-item` |
| [button](../../demo/components/button.html) | `m-button`, `m-button-group` |
| [calendar](../../demo/components/calendar.html) | `m-calendar` |
| [card](../../demo/components/card.html) | `m-card`, `m-card-cover`, `m-card-header`, `m-card-header-extra`, `m-card-content`, `m-card-footer`, `m-card-action` |
| [carousel](../../demo/components/carousel.html) | `m-carousel`, `m-carousel-viewport`, `m-carousel-item`, `m-carousel-controls`, `m-carousel-readout` |
| [cascader](../../demo/components/cascader.html) | `m-cascader` |
| [chart](../../demo/components/chart.html) | `m-chart`, `m-chart-title`, `m-chart-tooltip`, `m-chart-legend`, `m-chart-x-axis`, `m-chart-y-axis`, `m-chart-encode`, `m-chart-label`, `m-chart-series`, `m-chart-dataset` |
| [checkbox](../../demo/components/checkbox.html) | `m-checkbox`, `m-checkbox-group` |
| [code](../../demo/components/code.html) | `m-code` |
| [collapse-transition](../../demo/components/collapse-transition.html) | `m-collapse-transition` |
| [collapse](../../demo/components/collapse.html) | `m-collapse`, `m-collapse-item`, `m-collapse-header`, `m-collapse-header-extra`, `m-collapse-content` |
| [color-picker](../../demo/components/color-picker.html) | `m-color-picker` |
| [countdown](../../demo/components/countdown.html) | `m-countdown` |
| [data-table](../../demo/components/data-table.html) | `m-data-table` |
| [date-picker](../../demo/components/date-picker.html) | `m-date-picker` |
| [descriptions](../../demo/components/descriptions.html) | `m-descriptions`, `m-description-item` |
| [dialog](../../demo/components/dialog.html) | `m-dialog`, `m-dialog-header`, `m-dialog-body`, `m-dialog-footer`, `m-dialog-action` |
| [divider](../../demo/components/divider.html) | `m-divider` |
| [drawer](../../demo/components/drawer.html) | `m-drawer`, `m-drawer-content`, `m-drawer-header`, `m-drawer-body`, `m-drawer-footer` |
| [dropdown](../../demo/components/dropdown.html) | `m-dropdown`, `m-dropdown-trigger`, `m-dropdown-menu`, `m-dropdown-item`, `m-dropdown-group`, `m-dropdown-divider` |
| [dynamic-input](../../demo/components/dynamic-input.html) | `m-dynamic-input-template`, `m-dynamic-input` |
| [dynamic-tags](../../demo/components/dynamic-tags.html) | `m-dynamic-tags` |
| [ellipsis](../../demo/components/ellipsis.html) | `m-ellipsis` |
| [empty](../../demo/components/empty.html) | `m-empty` |
| [flex](../../demo/components/flex.html) | `m-flex` |
| [float-button](../../demo/components/float-button.html) | `m-float-button`, `m-float-button-group` |
| [form](../../demo/components/form.html) | `m-form`, `m-form-item`, `m-form-item-gi` |
| [gradient-text](../../demo/components/gradient-text.html) | `m-gradient-text` |
| [grid](../../demo/components/grid.html) | `m-grid`, `m-grid-item` |
| [heatmap](../../demo/components/heatmap.html) | `m-heatmap` |
| [highlight](../../demo/components/highlight.html) | `m-highlight` |
| [icon](../../demo/components/icon.html) | `m-icon`, `m-icon-wrapper` |
| [image](../../demo/components/image.html) | `m-image-group`, `m-image` |
| [infinite-scroll](../../demo/components/infinite-scroll.html) | `m-infinite-scroll` |
| [input-number](../../demo/components/input-number.html) | `m-input-number` |
| [input-otp](../../demo/components/input-otp.html) | `m-input-otp` |
| [input](../../demo/components/input.html) | `m-input`, `m-textarea`, `m-input-group`, `m-input-group-label` |
| [layout](../../demo/components/layout.html) | `m-layout`, `m-layout-header`, `m-layout-content`, `m-layout-footer`, `m-layout-sider` |
| [list](../../demo/components/list.html) | `m-list-item`, `m-list` |
| [loading-bar](../../demo/components/loading-bar.html) | `m-loading-bar` |
| [log](../../demo/components/log.html) | `m-log` |
| [marquee](../../demo/components/marquee.html) | `m-marquee` |
| [mention](../../demo/components/mention.html) | `m-mention` |
| [menu](../../demo/components/menu.html) | `m-menu-item`, `m-menu-group`, `m-menu-divider`, `m-submenu`, `m-menu` |
| [message](../../demo/components/message.html) | `m-message-container`, `m-message` |
| [modal](../../demo/components/modal.html) | `m-modal`, `m-modal-header`, `m-modal-body`, `m-modal-footer`, `m-modal-action` |
| [notification](../../demo/components/notification.html) | `m-notification-container`, `m-notification` |
| [number-animation](../../demo/components/number-animation.html) | `m-number-animation` |
| [page-header](../../demo/components/page-header.html) | `m-page-header` |
| [pagination](../../demo/components/pagination.html) | `m-pagination` |
| [popconfirm](../../demo/components/popconfirm.html) | `m-popconfirm`, `m-popconfirm-trigger`, `m-popconfirm-panel` |
| [popover](../../demo/components/popover.html) | `m-popover`, `m-popover-trigger`, `m-popover-content` |
| [popselect](../../demo/components/popselect.html) | `m-popselect`, `m-popselect-trigger`, `m-popselect-panel` |
| [progress](../../demo/components/progress.html) | `m-progress` |
| [radio](../../demo/components/radio.html) | `m-radio-group`, `m-radio`, `m-radio-button` |
| [rate](../../demo/components/rate.html) | `m-rate` |
| [result](../../demo/components/result.html) | `m-result-header`, `m-result-content`, `m-result-footer`, `m-result` |
| [select](../../demo/components/select.html) | `m-select` |
| [skeleton](../../demo/components/skeleton.html) | `m-skeleton` |
| [slider](../../demo/components/slider.html) | `m-slider` |
| [space](../../demo/components/space.html) | `m-space` |
| [spin](../../demo/components/spin.html) | `m-spin` |
| [split](../../demo/components/split.html) | `m-split`, `m-split-pane` |
| [statistic](../../demo/components/statistic.html) | `m-statistic` |
| [steps](../../demo/components/steps.html) | `m-steps`, `m-step` |
| [switch](../../demo/components/switch.html) | `m-switch` |
| [table](../../demo/components/table.html) | `m-table` |
| [tabs](../../demo/components/tabs.html) | `m-tab`, `m-tab-pane`, `m-tabs` |
| [tag](../../demo/components/tag.html) | `m-tag` |
| [thing](../../demo/components/thing.html) | `m-thing`, `m-thing-avatar`, `m-thing-header`, `m-thing-content`, `m-thing-footer`, `m-thing-action` |
| [time-picker](../../demo/components/time-picker.html) | `m-time-picker` |
| [time](../../demo/components/time.html) | `m-time` |
| [timeline](../../demo/components/timeline.html) | `m-timeline-item`, `m-timeline` |
| [tooltip](../../demo/components/tooltip.html) | `m-tooltip-trigger`, `m-tooltip-content`, `m-tooltip` |
| [transfer](../../demo/components/transfer.html) | `m-transfer` |
| [tree-select](../../demo/components/tree-select.html) | `m-tree-select` |
| [tree](../../demo/components/tree.html) | `m-tree`, `m-tree-node` |
| [typography](../../demo/components/typography.html) | `m-typography`, `m-text`, `m-p`, `m-heading`, `m-link`, `m-blockquote`, `m-ul`, `m-ol` |
| [upload](../../demo/components/upload.html) | `m-upload`, `m-upload-trigger`, `m-upload-dragger`, `m-upload-file-list` |
| [virtual-list](../../demo/components/virtual-list.html) | `m-virtual-list` |
| [watermark](../../demo/components/watermark.html) | `m-watermark` |

Chart implements Bar, Line/Area, Pie/Doughnut and Scatter with direct property, scoped
binding, JSON attribute, nested JSON script and remote JSON sources. Its
[contract](contracts/chart.md) retains outstanding release acceptance and budget gates.
Log is a bounded mounted passive log, not a virtualized terminal.

## Optional root facade

These retained foundation/dynamic tags are registered by the optional root, not by core
or selectable families. See [source ownership](../architecture/06-source.md) and
[delivery](../architecture/07-modules.md). They still require their own contract review.

| Entry | Registered tags |
| --- | --- |
| root | `m-app`, `m-theme`, `m-header`, `m-main`, `m-section`, `m-field`, `m-stack`, `m-row`, `m-wrap`, `m-center`, `m-spacer`, `m-option`, `m-accordion`, `m-accordion-item`, `m-include` |

`m-option` is not a replacement for the native options owned by Select. Some families
also parse inert option configuration without registering an independent option renderer.

## Optional plugins

Plugins do not replace or register competing copies of selected families.

| Entry | Registered tags |
| --- | --- |
| advanced | `m-data-grid`, `m-data-column` |
| widgets | `m-rating` |
