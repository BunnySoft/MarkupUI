# 10. JavaScript size optimization plan

Status: planned, not implemented. Recorded September 23, 2026.
Implementation baseline: `cb00af1` on `main`, package version `0.13.0`.
The next thread should follow this plan one bounded task at a time.

## Objective and constraints

Make each element's implementation as small as practical while preserving its required
behavior, then reduce duplication across components and offer an optional full bundle.
File splitting alone is not an implementation optimization.

- Use the canonical cross-platform `m-*` contract. Native DOM is a Web-renderer concern.
- Keep one behavior implementation per component. A `ViewElement` may call an internal
  controller when that removes real complexity; simple elements need no controller layer.
- Reconcile element classes and standalone `createXxx` APIs against the actual contract.
  Do not retain competing behavior implementations or publish unnecessary factory APIs.
  Equally, do not discard required functionality just because it currently lives only in
  a factory. Native interoperability, when required, must reuse the same behavior owner.
- The library is in development staging: change canonical APIs and callers together,
  without compatibility aliases, migration layers or legacy adapters.
- Preserve validation, security, accessibility, focus, native forms, authored content,
  cancellation, resource cleanup, pre-upgrade properties and documented events.
- Keep direct typed properties and ordinary methods. No metadata/property engine,
  decorators, virtual DOM or speculative universal controller framework.
- Keep source ownership under the existing `src` areas. Changing packaging is not a reason
  to move component implementations into a parallel source tree.
- Small core and independently selectable components remain mandatory. The full bundle
  is optional; unrelated components must never depend on it.
- ECharts remains explicitly application-supplied. Exclude it from MarkupUI measurements,
  but state its separate required cost for applications that use Chart.
- Do not raise existing payload ceilings. Report individual, dependency-inclusive and
  combined costs; do not hide bytes in another required file.

Read [source ownership](06-source.md), [module delivery](07-modules.md), the relevant
[element contract/demo](../elements/README.md) and the
[development guide](../elements/04-development.md) before each source or packaging change.

## Measured baseline

Environment: Windows, Node 22.12.0, existing repository esbuild toolchain.
Byte measurements use minified JavaScript and gzip level 9; 1 KiB = 1,024 bytes.
CSS, source maps, declaration files, root facade, optional plugins and ECharts are excluded
from the following all-component totals. ESM and classic are alternatives, not additive.
Dependencies are counted once within a selected set.

| Current delivery | Components | Unique JS files | Minified bytes | Gzip bytes |
| --- | ---: | ---: | ---: | ---: |
| All selected ESM families | 89 | 94 | 1,240,182 | 414,065 (404.36 KiB) |
| All selected classic families | 89 | 94 | 1,266,374 | 427,555 (417.53 KiB) |

`markup-ui.min.js` is the optional root facade, not an all-components bundle.

### Packaging experiments

These were in-memory diagnostic builds, not shipped or behavior-validated products.
Aggregate experiments retained every entry's exports through separate namespaces;
source experiments used the same 89 families and five shared entries.

| Experiment | Gzip bytes | Difference from current ESM total |
| --- | ---: | ---: |
| Rebundle existing published ESM into one file | 298,151 (291.16 KiB) | -28.0% |
| Bundle from source into one file | 289,050 (282.28 KiB) | -30.2% |
| Source multi-entry build with automatic shared chunks | 379,921 (371.02 KiB), 120 files | -8.2% |

These compare delivery strategies, not proven reductions in required behavior.
Automatic splitting increased some cold single-component costs: Dropdown went from
14,050 to 16,314 gzip bytes including dependencies, and Grid from 2,872 to 4,200.
Do not adopt automatic splitting just because the all-components sum is smaller.
Neither 282 KiB nor an arbitrary smaller number is an approved release ceiling.

The module-contribution audit found repeated output from:

| Source responsibility | Number of component bundles |
| --- | ---: |
| `popover/position.ts`, including `ownedWrites` | 29 |
| `popover/popover.ts` controller | 5 |
| `tree/hierarchy.ts` | 3 |
| `dialog/native.ts` | 3 |
| `dynamic-input/dynamic-input.ts` | 2 |

The 29 copies do not mean 29 full positioning engines: different consumers retain
different exports. Summing each repeated source's emitted bytes beyond its largest copy
gave 115,598 uncompressed bytes. This is a diagnostic estimate, not removable gzip bytes.

### Per-component export experiments

Each pair used the same explicit shared-runtime boundaries. The first column preserved
all exports; the second preserved element classes and registration but omitted standalone
helper exports. These are fresh source builds without source maps, so their numbers differ
slightly from published files. They are NOT functionally equivalent optimization results.

| Family | All exports gzip bytes | Element exports only gzip bytes |
| --- | ---: | ---: |
| Calendar | 9,021 | 2,267 |
| Tree | 10,057 | 2,749 |
| Upload | 8,964 | 1,558 |
| Dynamic Tags | 11,673 | 3,150 |
| Dynamic Input | 7,218 | 2,076 |
| Heatmap | 8,403 | 853 |
| Data Table | 7,922 | 835 |
| Cascader | 10,170 | 1,657 |
| Dropdown | 12,599 | 12,600 |
| Button | 3,807 | 3,807 |

Calendar, Tree, Upload and Dynamic Tags have element implementations that do not delegate
to their separately exported factories. Some behavior overlaps; some does not.
Data Table's element currently mainly synchronizes presentation, while its factory owns
sorting/filtering/pagination behavior. Its 835-byte result is not a complete Data Table.
Heatmap's small element result likewise does not establish full feature coverage.
These gaps require contract reconciliation, not blind deletion of factory code.

Local diagnostic scripts/results lived under ignored `.vite/size-audit*` and
`.vite/element-cost-audit*`. They may not exist in a fresh checkout. This document records
their relevant evidence; task S0 must make repeatable reporting part of tracked tooling.

## Execution order

All tasks below remain open. Do not mark a task complete on size measurements alone.

### S0. Reproducible size reporting

- [ ] Add a tracked report command using build manifests and esbuild metafiles.
- [ ] Measure minified bytes, gzip bytes, entry-only cost and the complete transitive
  dependency closure for ESM and classic. Keep CSS and external engines separate.
- [ ] Report all-family totals, largest own implementations, repeated source contributions,
  and representative selections: one small component, one complex component, related
  families together, and the whole catalog. Keep exact file lists with each total.
- [ ] Capture a baseline before changing behavior. Preserve exports in equivalent build
  comparisons; label export-removal experiments as diagnostics only.
- [ ] Retain existing per-file and combined ceilings and add regression reporting.
  Do not import a measurement tool or its metadata into production.

### S1. Remove unintended registration dependencies

- [ ] Change Dynamic Tags' helper import from `../dynamic-input/index.js` to the actual
  helper owner. Import types from their owner as well.
- [ ] Verify importing Dynamic Tags no longer registers or bundles the Dynamic Input class,
  while the existing helper behavior remains intact.
- [ ] Audit other cross-family `index.js` imports for the same problem. Change only proven
  helper/registration boundary mistakes, not legitimate component compositions.
- [ ] Cover isolated ESM/classic registration, import order, source maps and affected
  behavior. Record the measured saving and commit this bounded fix separately.

### S2. Unify each component's behavior implementation

Priority order:

1. Dynamic Tags and its Dynamic Input relationship.
2. Calendar.
3. Tree and Cascader, checking Tree Select's shared contracts.
4. Upload.
5. Data Table and Heatmap, explicitly closing the element/controller capability gaps.

For each family:

- [ ] Inventory the element API, standalone factory API, demo behavior and tests. List
  required features, duplicate behavior and capabilities present on only one path.
- [ ] Settle one canonical element contract. Required sorting, selection, validation,
  asynchronous behavior or accessibility must not disappear as a size optimization.
- [ ] Keep one implementation of state transitions, validation, rendering, interaction
  and cleanup. Use direct element methods or a narrow internal controller as appropriate.
- [ ] Remove superseded public factories/aliases only after their required behavior has a
  canonical owner. Update exports, internal callers, demos and generated API together.
- [ ] Keep genuine optional advanced capabilities out of a basic entry only when their
  independent contract justifies that split. Do not move mandatory bytes off the ledger.
- [ ] Verify behavior and publish before/after sizes, including dependencies. Commit each
  completed family separately; do not combine the entire list into one rewrite.

### S3. Simplify component-local mechanics

Apply within the S2 family work where relevant, then inspect remaining large families,
particularly Dropdown. Button and Dropdown did not shrink in the export-only experiment,
so removing helper exports is not their solution.

- [ ] Remove duplicate setter/attribute-callback update paths. Calendar currently renders
  from both paths; ensure each change has one well-defined update owner.
- [ ] Create stable DOM once where appropriate and update affected regions instead of
  rebuilding entire controls. Preserve authored nodes, listeners, selection and focus.
- [ ] Consolidate repeated action handling where event delegation is semantically correct.
  Dynamic Tags has separate generated/authored removal handlers to review. Preserve
  nested ownership, composed-event behavior and disconnect/reconnect cleanup.
- [ ] Remove redundant state caches, repeated validation paths and unnecessary public
  synonyms. Upload's `files` and `fileList` getters are one concrete API-review candidate.
- [ ] Review internal names, constants and diagnostic text only after structural savings.
  Do not mangle public/reflected properties or replace helpful errors with opaque failures.
- [ ] Measure rather than assume smaller source means smaller gzip or faster execution.
  Do not optimize by removing security, accessibility, cancellation or ownership checks.

### S4. Share proven reusable code at delivery boundaries

- [ ] Re-measure duplication after S1-S3; removed implementations may change the best
  sharing boundaries.
- [ ] Evaluate the existing popover controller, owned-write helper, hierarchy operations,
  native dialog behavior and dynamic collection mechanics as actual shared responsibilities.
- [ ] Use narrow distribution entries in existing source areas. Do not make a simple
  layout component load the whole positioning or popover implementation for one utility.
- [ ] Compare single-component and related-group closures in both formats before accepting
  an extraction. Explain any cold-load increase; all existing ceilings must still pass.
- [ ] Update manifest dependencies, classic ordering, ESM imports, demos, consumer tests
  and documentation together. Shared chunks must not register unrelated elements.
- [ ] Reject automatic chunk proliferation or budget-only extraction without a demonstrated
  ownership boundary and meaningful overall benefit.

### S5. Add an optional all-components distribution

- [ ] Define explicit full-entry names and a public export organization without collisions.
  Do not rename the existing root facade into an apparent all-components product.
- [ ] Build from source so shared implementations are emitted once. Cover all 89 families;
  root foundation elements/plugins are separate selections unless explicitly added and
  accounted for. Keep ECharts external and CSS costs explicit.
- [ ] Deliver and document ESM and classic loading, declarations and package exports.
  State whether core/adapter assets are external or included and measure the full closure.
- [ ] Settle mixing with selected entries explicitly: preserve constructor/core identity
  where supported, and reject incompatible combinations clearly without silently replacing
  registrations. Do not create competing bases or engine configuration owners.
- [ ] Add a measured full-runtime ceiling without raising any existing ceiling.
  The preliminary 282.28 KiB source experiment is a reference, not a correctness guarantee.
- [ ] Test registration completeness, absence of vendor code, isolated packed consumers,
  shared identity rules and actual browser workflows.
- [ ] Keep single-component loading independent of this entry.

### S6. Integrated acceptance and evidence

- [ ] Run typecheck/build and all payload gates, the complete suite, isolated packed
  consumers, and the three-engine desktop/mobile catalog after the implementation settles.
- [ ] Run focused interactions for each changed family, not just page startup. Inspect
  screenshots where DOM/rendering changed and check focus, events, reconnect and cleanup.
- [ ] Record final raw/gzip comparisons for components, representative groups, all modular
  files and the optional full bundle using the same baseline definitions.
- [ ] Reconcile architecture, demo/API, changelog and release evidence. List remaining
  performance/accessibility/platform gates honestly.

Optimization does not close the separate binding, retained-root, real-device/accessibility
or clean CI matrix blockers in [production readiness](09-production.md).

## Per-task completion record

Append a short record after each completed task or family:

| Field | Required evidence |
| --- | --- |
| Scope | Task ID, family and canonical behavior retained or corrected. |
| Implementation | One behavior owner; removed duplicates and changed exports/callers. |
| Size | Before/after entry gzip and dependency-inclusive ESM/classic costs; raw bytes separately. |
| Verification | Exact commands, passing counts and relevant browser/consumer results. |
| Limits | Remaining gaps and any explicitly justified loading tradeoff. |
| Commit | Commit ID for the completed, verified task. |

Commit each completed task separately as requested. Do not push automatically in the next
thread unless the user requests it. The push accompanying this plan is a handoff operation,
not standing authorization for future pushes.

## Next-thread starting point

1. Read this plan and repository instructions; inspect `git status` and the latest history.
2. Confirm the Chart external-engine baseline and current distribution measurements.
3. Start S0, then S1. No optimization source changes have been implemented by this plan.
4. Proceed family by family through S2/S3 before selecting final shared-bundle boundaries.
5. Avoid repeatedly running the entire suite during small edits: use focused checks per
   task and the integrated gates at packaging milestones and final acceptance.

Reference baseline verification at `cb00af1`: build passed; 4,837 tests across 131 files,
zero failures/skips; 95 packed JavaScript entries across 2,327 files passed strict NodeNext
and runtime imports without ECharts installed. Chart and existing browser workflows passed
in Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at 1280x900 and 375x812.
The latest scoped Chart catalog run was 6/6; the earlier full-catalog baseline was 588/588.
These results do not validate future changes or establish full production readiness.
