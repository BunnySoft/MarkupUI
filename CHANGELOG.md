# Changelog

## Unreleased

- Unified Cascader through one internal path/defaults/validation controller. Portable
  `m-cascader` accepts bounded typed or JSON options and lazy data; the Web renderer owns
  labelled native dependent selects and form submission. Explicit partial paths,
  leaf/any selection, independent defaults/reset, cancellation and reconnect remain.
  Removed the public factory and nonfunctional hover-trigger API; user changes bubble
  as `m:cascader-change`. No Tree/Select registration dependency or payload ceiling increase.

- Standardized the Web base on `ViewElement`, removed `MElement` and duplicate component
  aliases, and retained independently selectable families with shared-core delivery.
- Added optional ECharts-backed Chart with Bar, Line/Area, Pie/Doughnut and Scatter,
  ECharts-shaped configuration, five data-source forms, SVG/Canvas renderers and a
  native data-table alternative. ECharts is supplied explicitly by the application using
  `configureChartEngine(echarts)`, not bundled or automatically downloaded. The lightweight
  adapter has no vendor declaration dependency; demo-only vendor assets stay out of the package.
- Added explicit scalar/model binding with safe paths and lifecycle cleanup. Structural
  templates and item scopes are not implemented.
- Added native semantic owners for portable labels, disclosure and phrasing primitives;
  repaired selected-module demos and removed obsolete migration showcases.
- Restricted HTML insertion and remote markup loading with explicit trust options,
  bounded responses, cancellation and fail-closed Trusted Types behavior.
- Hardened the optional DataGrid and Rating plugins: stable native controls and focus,
  authored-content preservation, bounded data/properties, live updates and reconnect
  cleanup. Rating programmatic writes are silent; user changes emit `m:change`.
  Added an interactive plugin demo and three-engine keyboard workflows.
- Corrected `m.version` to match the package version in source, ESM and classic builds.
- Added reproducible, dependency-inclusive size reports and a pre-optimization baseline
  without changing payload ceilings. Dynamic Tags now imports collection mechanics
  directly, avoiding unintended Dynamic Input registration and constructor bundling.
- Unified Dynamic Tags element behavior with its internal controller, including native
  forms, exact duplicate policy, IME/stale draft protection and resource cleanup.
  Portable form examples use only `m-*` components; `name`, `maxlength` and `editor-label`
  map to renderer-owned controls. Removed the public Tags factory and `getTags()`/`add()`;
  use `values`, `draft`/`commit()` and stable-key `removeTag()`. Changes bubble as
  `m:change`; clear emits one change per removed tag. No compatibility aliases.
  This capability reconciliation increases Tags gzip size slightly; ceilings are unchanged.
- Renamed Affix offsets to `insetTop` / `insetBottom` and `inset-top` / `inset-bottom`
  to avoid overriding native DOM geometry. No compatibility aliases are provided.
- Unified Dynamic Input row transactions through its existing internal controller.
  Added `m-dynamic-input-template` for portable multi-field rows, default field
  `name`/`field-label`, and synchronous Web `initializeRow`/`connectRow` hooks.
  Removed the public factory and lossy `getValues()`/`getRows()` APIs; use `rows`,
  `add(index?)`, `move(key, index)` and `removeRow(key)`. Native `remove()` removes
  the host. Structural changes bubble as `m:change`; field edits/reset remain native.
  Inherited disabling preserves authored flags, and generated row keys are not reused
  across reconnect. These collection fixes also apply to Dynamic Tags.
- Unified Calendar day/month selection through one internal behavior owner, retaining
  bounded validation, synchronous annotations/policy, native keyboard/focus, adopted
  content and reconnect cleanup. Portable `m-calendar` maps to a native Web table/buttons;
  no native anatomy is required in public markup. Removed the public Calendar factory
  and old change event; selection emits `m:change`, with panel changes emitted first.
  Silent `configure`, explicit defaults/reset, bounds and navigation share that owner.
- Removed native date-input dependence from Calendar's shared Gregorian date parser.
  Heatmap uses the same strict parser, and `buildHeatmap(options)` no longer accepts an
  unused Document argument. Updated callers without a compatibility overload; Heatmap's
  separate element/controller reconciliation remains pending. Payload ceilings are unchanged.
- Fixed Tree controller races: queued selection clicks no longer overwrite newer
  explicit selection writes or interrupt independent lazy loads. Failed loads now
  reject even when failure cleanup also throws, retaining both errors.
- Unified Tree/TreeNode interactions through the existing controller. Portable nodes
  map to native lists, separate buttons/links and disclosure, and labelled form checks.
  Multiple selection, check strategies, disabled barriers, keyboard/typeahead, native
  defaults/reset, bounded lazy data, cancellation/disposal and reconnect share one owner.
  Removed the public Tree factory/parser exports and old element value/check helpers;
  use `selectedKeys`, `checkedKeys`, `expandedKeys`, `check`, `expand` and `reveal`.
  Controller events now bubble from the canonical element as `m:tree-*`.
  Raw size decreases but gzip grows slightly; no payload ceilings are raised.
- Added packed-consumer checks, three-engine browser checks, dependency audit gates and
  Windows/Linux/macOS CI configuration. Development requires Node 22.12+ in the 22.x
  line or Node 24+, with pnpm 10.28.0.
- Production approval remains pending: remote CI evidence, human accessibility/device
  acceptance, Chart budget approval and binding release scope are open. Non-Web renderer
  mappings remain design contracts, not delivered implementations.

## 0.13.0

- Replaced the former public prefix with `m-*` Custom Elements, `.m-*` classes,
  `--m-*` variables, `m:*` events, `data-m-*` attributes and `M*`/`m` JavaScript names.
- Removed old-prefix compatibility aliases as an intentional breaking 0.x change.
- Added the platform-neutral component-model and Web-renderer architecture requirements.
- Migrated Button as the first component with platform metadata and direct `m-button`
  / `m-button-group` Web rendering.

## 0.12.0

- Completed the declared dependency-free native migration across all 96 catalog scopes,
  with explicit retained behavior and intentional omission records.
- Added native form, selection, feedback, collection, temporal, motion, data-display, and
  specialized helpers across the previous Web API.
- Completed the Naive UI 2.45.3 default-theme audit for all 96 scopes, aligning feasible
  geometry, typography, palettes, states, media behavior, and component-owned defaults.
- Added per-component audit reports, standalone demos, API/source trackers, and regression
  coverage; the integrated suite now contains 3,773 passing tests.
- Fixed shared Input forced-color and print wrapper states and raised only its CSS gzip
  ceiling from 1,750 to 1,800 bytes.

## 0.11.0

- Redesigned `m-button` around Naive UI's button metrics and interaction model.
- Added semantic types, hierarchy variants, dashed/ghost/text styles, sizes, round/circle/block
  shapes, loading, and stable pseudo-border transitions.
- Raised the core gzip budget from 14 KB to 15 KB for the complete button system.

## 0.10.0

- Added a complete visual design-system pass with typography, density, semantic color, focus,
  elevation, interaction, and motion tokens.
- Improved hover, active, focus-visible, disabled, validation, overlay, and reduced-motion states.
- Refined light and dark themes and fixed stale custom-theme tokens.
- Raised the enforced core budget from 13 KB to 14 KB gzip for the visual-system quality increase.

## 0.9.1

- Split the built-in component catalog into focused content, form, foundation, navigation,
  overlay, dynamic-content, style, and registry modules.
- Preserved public APIs, behavior, component manifests, and bundle budgets.

## 0.9.0

- Added the optional widgets plugin.
- Added breadcrumb, timeline, input number, color picker, rating, carousel, transfer, and cascader.
- Kept the core bundle unchanged and added a separate widgets size budget.

## 0.8.0

- Added stable built-in and advanced component manifests.
- Added enforced gzip size budgets and a generated distribution manifest.
- Added dynamic attribute reflection for buttons, steps, descriptions, and scoped themes.
- Improved native modal close lifecycle and keyboard navigation for tabs and menus.
- Expanded accessibility and compatibility coverage.

## 0.7.0

- Added the optional advanced plugin with data grid, date/time inputs, upload, and virtual list.

## 0.6.0

- Added menu, pagination, steps, tree, list, descriptions, and statistics.

## 0.5.0

- Added forms, validation, checked binding, radio groups, slider, and autocomplete.

## 0.4.0

- Added drawer, tooltip, popover, loading, message, and notification support.

## 0.3.0

- Added the public component base, compound card/dialog anatomy, and common display components.

## 0.2.0

- Rebuilt MarkupUI as dependency-free, browser-native Web Components.
