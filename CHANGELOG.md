# Changelog

## Unreleased

Local verification for the accumulated binding/first-five checkpoint passed 5447 tests
in 153 files, packed consumption and three-engine/two-layout browser workflows.
See [production evidence](docs/architecture/09-production.md#first-five-checkpoint)
for measured costs and remaining release gates. This is not a published release or
human accessibility, independent security or clean cross-platform CI approval.

- Added Box-owned `If` / `m-if`, using the existing optional state runtime for strict
  conditions, nested scopes, reusable Web sources and retained stop/rebind ownership.
  Literal `focus-target` selects a surviving native or portable focus owner.
  Box primitives adopt captured native chrome, preventing nested labels/disclosures
  when a connected source is later instantiated.
- Batched contiguous keyed moves in the fallback placement path, reducing repeated
  live insertions while retaining already-positioned nodes and native `moveBefore`
  where available. Repeated WebKit 1000-row fixtures show materially faster reorder;
  focus, drafts and current-key writes remain covered by the browser matrix.
- Preserved application roles and Spacer flex styles across retained-root reconnect.
  Hardened DataGrid/Chart arrays and dimensions against accessors, hidden symbols and
  custom array prototypes; Chart table projection does not expose inherited cells.
  Disposed/replaced Chart renderer callbacks no longer emit selection.
- Added repeated template/Chart resource measurements, forced-GC observations and
  portable keyboard/form/RTL/forced-colors/text-scaling browser fixtures. These are
  local evidence, not real-device, screen-reader, independent security or performance
  approval. Advisory size recommendations and frozen S0 remain unchanged.

- Added typed `m-arg-*` action arguments through an explicitly supplied live `Binding`,
  with current-key item/parent/root reads and App reconnect integration. State exposes
  scoped reads without importing actions or components; named actions remain in the
  optional root facade. Nested action roots execute once, and synchronous exceptions
  now use the same Promise/`m:error` path as async failures. Fixed truncated literal
  `m-param-*` names. App releases its new binding when action installation fails.
  The List task example removes the selected row by stable key.

- Added one-way paired ID bindings for native and portable template content and
  root-level bindings. Preflight rejects duplicate IDs and dangling/cross-root
  label/ARIA references before bound scalar writes; keyed reorders and stop/rebind
  preserve instances. IDs remain application-supplied, fixed repeated IDs and
  two-way identifier/label-target models are rejected, and no atomic DOM transaction
  or new component forwarding is claimed. The List task demo now uses actual labels
  and paired descriptions.

- Payload budgets are now adjustable size recommendations. Builds, component size
  checks and default reports warn on overages instead of failing; manifests/reports
  retain exact measurements and structured warnings. Measurement integrity and
  functional checks remain strict, as does explicitly requested baseline regression
  checking. Frozen S0 measurements and existing numeric recommendations are unchanged.

- Added inline Web `data-if`/stable-key `data-each` templates in the optional state
  binder, with nested item/parent/root paths, current-key model writes, strict
  preparation, retained nodes on stop/rebind and explicit focus fallback. Reorders
  retain native editing state; failed setup releases new listeners/instances.
  Reusable Web sources use root-local `data-template="#id"` references or an explicit
  `BindingOptions.templates` Map for `data-template="name"`. Definitions remain inert
  and unchanged; invalid, cyclic or oversized reference graphs fail before insertion.
  Source changes use existing replacement/focus rules, including portable List regions.
  Shared binding validation also rejects hidden symbol members without invoking accessors.
- Store notifications snapshot subscription callbacks so additions during notification
  do not loop; stale disposal cannot remove a later subscription owner.
- Added portable `m-list-template` authoring inside List, backed by inert source content
  and native `ul`/`li` owners. Optional state reuses its keyed reconciliation and current-key
  model routes; ordinary List still imports only core. `focus-on-remove` opts into
  focusing a surviving list, with explicit Web callbacks taking precedence. Template
  collections are changed through the bound store, not List's authored-item methods.

- Fixed retained root lifecycle behavior: Theme restores owned tokens/marker when its
  name is cleared; Field uses a real native label and tracks late/replaced controls
  without overwriting authored accessible names. Portable `m-*` authoring is retained.
- Added live `open`/`title` synchronization and disconnect/reconnect listener cleanup
  to AccordionItem without replacing authored content.
- App preserves pre-upgrade store assignment and shares that owner across bindings
  and actions. Explicit/acquired stores conflict with inline JSON state; disconnect
  before replacing an active store.
- Removed duplicate migrated-family styles from root. Selected families require their
  own CSS even when root is loaded; root retains its elements, shared tokens/layout
  utilities and scoped feedback styling. Existing payload ceilings are unchanged.

- Added optional all-components ESM/classic distributions and complete component CSS.
  All 89 families keep collision-free namespaces and the existing shared core/Chart
  adapter identity. ECharts, root foundation and plugins remain separate. Full and
  selected entries reject incompatible mixing explicitly. New measured aggregate-only
  gates do not raise any existing per-component ceiling.

- Dropdown now maps portable trigger/item content into stable native actions. `href`,
  `target` and `download` map navigation semantics without native authoring. Native
  adoption remains an explicit Web escape. One element observer owns canonical menu
  refreshes; passive-content and timing checks are shared locally. Existing payload
  ceilings, keyboard behavior, cancellation and native fallback are retained.

- Unified Data Table behind bounded immutable records and one transactional controller.
  Portable `m-data-table` supplies labelled columns/data without native table authoring.
  Sorting, filtering, pagination, summaries and scoped selection share prepare-before-commit
  semantics; keyed updates retain surviving native rows, edits, focus and form defaults.
  Removed the public factory and inert pagination flag. Native reset waits for browser
  default restoration, and reconnect retains the original reset configuration.

- Unified Tree Select behind bounded typed/JSON hierarchy data and one native-selection
  controller. Removed the hidden native-tree render/parse round trip, public factory,
  inert `checkable` and competing scalar selection path. Portable `m-tree-select` now
  supports single/multiple values, groups, leaf/any policy, filtering, independent
  defaults, missing-default diagnostics and native submission/reset. Reconnect preserves
  controls and surviving options. Native selection/clear events originate from the host.
  Deferred reset reconciliation no longer discards a later clear action; cancellation,
  later explicit writes and reverse reset ordering retain their original protections.

- Replaced Heatmap's empty grid renderer with the canonical date/value controller.
  Typed or JSON `data`/`settings` on `m-heatmap` now provide bounded calendar data,
  missing/zero distinctions, numeric bands, palettes, locale, loading, keyboard
  inspection and persistent details. Removed arbitrary `rows`/`columns` and the
  public factory; retained the pure model utilities. Day identity/focus survives
  updates and inspection state survives reconnect. Fixed repeated date-font scaling.

- Unified Upload's native FileList, queue and transport behind `m-upload`. Portable
  trigger/drop/list regions map to labelled native controls, progress and actions.
  Explicit typed transport configuration, bounded selection, cancellation/retry,
  native submission/reset and delayed reconnect are retained. Removed the public
  factory, inert `action`, duplicate `fileList` and fake dropped-file cache.
  Unsupported FileList synchronization keeps the visible native chooser usable.

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
- Added explicit scalar/model binding with safe paths and lifecycle cleanup; the
  subsequent inline Web template work is tracked above.
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
  unused Document argument. Updated callers without a compatibility overload; the complete
  Heatmap element/controller reconciliation is recorded above. Payload ceilings are unchanged.
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
  acceptance, remaining family/root/plugin contract review, independent security/
  performance review, Chart engine-inclusive budget approval and binding release scope
  are open. Non-Web renderer mappings remain design contracts, not delivered implementations.

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
