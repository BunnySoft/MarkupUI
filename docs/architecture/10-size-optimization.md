# 10. JavaScript size optimization plan

Status: S0-S6 complete. Final local integrated acceptance verified September 29, 2026;
the scoped records below retain their original dates and limitations.
This completes the optimization workstream, not production-release approval.
Plan recorded September 23, 2026.
Implementation baseline: `cb00af1` on `main`, package version `0.13.0`.
Complete and record each bounded task before claiming integrated acceptance.

## Post-plan status

September 29, 2026: the subsequent retained-root lifecycle checkpoint fixes Theme,
Field, AccordionItem and App and removes duplicated component-family styles from root.
It passes 5,103 tests in 146 files, 588 catalog checks and the 96-entry packed consumer.
Complete minified root runtime is now 12,361 ESM / 12,271 classic gzip bytes; external
root CSS is 1,678 bytes. The existing 15,000-byte runtime ceiling is unchanged.

This follow-up changes only three root JavaScript files and root CSS among the 296
measured files. Core, state, selected families and full-catalog assets remain identical
to S6. The S0 baseline and S6 measurements below remain historical comparison points;
the root cleanup is not an additional saving in the all-family totals. See
[the retained-root evidence](09-production.md#retained-root-lifecycle-checkpoint)
for the latest local verification and [the task summary](09-production.md#task-summary)
for still-open production work. No new remote CI or release approval is implied.

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

S0-S6 are complete; this checklist records the accepted scope. Size measurements
alone were not treated as acceptance.

### S0. Reproducible size reporting

- [x] Add a tracked report command using build manifests and esbuild metafiles.
- [x] Measure minified bytes, gzip bytes, entry-only cost and the complete transitive
  dependency closure for ESM and classic. Keep CSS and external engines separate.
- [x] Report all-family totals, largest own implementations, repeated source contributions,
  and representative selections: one small component, one complex component, related
  families together, and the whole catalog. Keep exact file lists with each total.
- [x] Capture a baseline before changing behavior. Preserve exports in equivalent build
  comparisons; label export-removal experiments as diagnostics only.
- [x] Retain existing per-file and combined ceilings and add regression reporting.
  Do not import a measurement tool or its metadata into production.

### S1. Remove unintended registration dependencies

- [x] Change Dynamic Tags' helper import from `../dynamic-input/index.js` to the actual
  helper owner. Import types from their owner as well.
- [x] Verify importing Dynamic Tags no longer registers or bundles the Dynamic Input class,
  while the existing helper behavior remains intact.
- [x] Audit other cross-family `index.js` imports for the same problem. Change only proven
  helper/registration boundary mistakes, not legitimate component compositions.
- [x] Cover isolated ESM/classic registration, import order, source maps and affected
  behavior. Record the measured saving and commit this bounded fix separately.

### S2. Unify each component's behavior implementation

Priority order:

1. Dynamic Tags and its Dynamic Input relationship.
2. Calendar.
3. Tree and Cascader, checking Tree Select's shared contracts.
4. Upload.
5. Data Table and Heatmap, explicitly closing the element/controller capability gaps.

For each family:

- [x] Inventory the element API, standalone factory API, demo behavior and tests. List
  required features, duplicate behavior and capabilities present on only one path.
- [x] Settle one canonical element contract. Required sorting, selection, validation,
  asynchronous behavior or accessibility must not disappear as a size optimization.
- [x] Keep one implementation of state transitions, validation, rendering, interaction
  and cleanup. Use direct element methods or a narrow internal controller as appropriate.
- [x] Remove superseded public factories/aliases only after their required behavior has a
  canonical owner. Update exports, internal callers, demos and generated API together.
- [x] Keep genuine optional advanced capabilities out of a basic entry only when their
  independent contract justifies that split. Do not move mandatory bytes off the ledger.
- [x] Verify behavior and publish before/after sizes, including dependencies. Commit each
  completed family separately; do not combine the entire list into one rewrite.

### S3. Simplify component-local mechanics

Apply within the S2 family work where relevant, then inspect remaining large families,
particularly Dropdown. Button and Dropdown did not shrink in the export-only experiment,
so removing helper exports is not their solution.

- [x] Remove duplicate setter/attribute-callback update paths. Calendar now uses one
  controller transaction with guarded reflection; inspect the remaining families.
- [x] Create stable DOM once where appropriate and update affected regions instead of
  rebuilding entire controls. Preserve authored nodes, listeners, selection and focus.
- [x] Consolidate repeated action handling where event delegation is semantically correct.
  Dynamic Tags has separate generated/authored removal handlers to review. Preserve
  nested ownership, composed-event behavior and disconnect/reconnect cleanup.
- [x] Remove redundant state caches, repeated validation paths and unnecessary public
  synonyms. Upload's `files` and `fileList` getters are one concrete API-review candidate.
- [x] Review internal names, constants and diagnostic text only after structural savings.
  Do not mangle public/reflected properties or replace helpful errors with opaque failures.
- [x] Measure rather than assume smaller source means smaller gzip or faster execution.
  Do not optimize by removing security, accessibility, cancellation or ownership checks.

### S4. Share proven reusable code at delivery boundaries

- [x] Re-measure duplication after S1-S3; removed implementations may change the best
  sharing boundaries.
- [x] Evaluate the existing popover controller, owned-write helper, hierarchy operations,
  native dialog behavior and dynamic collection mechanics as actual shared responsibilities.
- [x] Use narrow distribution entries in existing source areas. Do not make a simple
  layout component load the whole positioning or popover implementation for one utility.
- [x] Compare single-component and related-group closures in both formats before accepting
  an extraction. Explain any cold-load increase; all existing ceilings must still pass.
- [x] Update manifest dependencies, classic ordering, ESM imports, demos, consumer tests
  and documentation together. Shared chunks must not register unrelated elements.
- [x] Reject automatic chunk proliferation or budget-only extraction without a demonstrated
  ownership boundary and meaningful overall benefit.

### S5. Add an optional all-components distribution

- [x] Define explicit full-entry names and a public export organization without collisions.
  Do not rename the existing root facade into an apparent all-components product.
- [x] Build from source so shared implementations are emitted once. Cover all 89 families;
  root foundation elements/plugins are separate selections unless explicitly added and
  accounted for. Keep ECharts external and CSS costs explicit.
- [x] Deliver and document ESM and classic loading, declarations and package exports.
  State whether core/adapter assets are external or included and measure the full closure.
- [x] Settle mixing with selected entries explicitly: preserve constructor/core identity
  where supported, and reject incompatible combinations clearly without silently replacing
  registrations. Do not create competing bases or engine configuration owners.
- [x] Add a measured full-runtime ceiling without raising any existing ceiling.
  The preliminary 282.28 KiB source experiment is a reference, not a correctness guarantee.
- [x] Test registration completeness, absence of vendor code, isolated packed consumers,
  shared identity rules and actual browser workflows.
- [x] Keep single-component loading independent of this entry.

### S6. Integrated acceptance and evidence

- [x] Run typecheck/build and all payload gates, the complete suite, isolated packed
  consumers, and the three-engine desktop/mobile catalog after the implementation settles.
- [x] Run focused interactions for each changed family, not just page startup. Inspect
  screenshots where DOM/rendering changed and check focus, events, reconnect and cleanup.
- [x] Record final raw/gzip comparisons for components, representative groups, all modular
  files and the optional full bundle using the same baseline definitions.
- [x] Reconcile architecture, demo/API, changelog and release evidence. List remaining
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

### S0 - September 24, 2026

| Field | Evidence |
| --- | --- |
| Scope | Reproducible measurement only; no component behavior, public exports or budget changes. |
| Implementation | `scripts/build.mjs` retains hashed esbuild evidence outside `dist`; `scripts/size-report.mjs` measures actual files, checks transitive dependencies and produces entry/group/source-attribution reports. `size-baseline.json` captures the unchanged implementation before S1. |
| Size | ESM remains 1,240,182 raw / 414,065 gzip bytes; classic remains 1,266,374 / 427,555 across 89 families and 94 unique files per format. Every entry and dependency-inclusive cost has zero delta. CSS, root/plugins and required ECharts remain separate. Demo-selected ECharts is 594,547 / 203,661 ESM and 594,949 / 203,838 classic bytes. |
| Verification | `node node_modules/typescript/bin/tsc --noEmit`; `node scripts/build.mjs`; `node scripts/size-report.mjs --write-baseline`; `node scripts/size-report.mjs --check-regressions`; `node node_modules/vitest/vitest.mjs run tests/size-report.test.ts tests/core-distribution.test.ts tests/chart-distribution.test.ts`: 21 passing in 3 files. Final report fixture rerun: 8 passing, including failing growth/export/budget cases. `node scripts/package-check.mjs`: 95 entries / 2,327 files, strict NodeNext and runtime imports passed without installed ECharts. |
| Limits | Raw source attribution is not gzip savings. Export-name comparison is not behavioral equivalence. Full browser/production acceptance is not claimed for this tooling-only task. |
| Commit | `ee1c8c4` - `build: add reproducible size reporting`. |

### S1 - September 24, 2026

| Field | Evidence |
| --- | --- |
| Scope | Remove Dynamic Tags' unintended Dynamic Input element registration/bundling. Existing Tags element/helper contracts, native forms, validation, whitespace, duplicate policy and resource cleanup retained. |
| Implementation | Runtime and type imports now point to `dynamic-input/dynamic-input.ts`. No public exports removed. TypeScript import/export audit found only Popselect's type-only Select barrel reference remaining across family entries; no other runtime boundary mistake was changed. |
| Verification | `node node_modules/typescript/bin/tsc --noEmit`; `node scripts/build.mjs`; `node scripts/size-report.mjs --check-regressions`; `node node_modules/vitest/vitest.mjs run tests/dynamic-tags-distribution.test.ts tests/dynamic-tags.test.ts tests/dynamic-input.test.ts tests/size-report.test.ts tests/core-distribution.test.ts tests/chart-distribution.test.ts`: 169 passing in 6 files. Isolated ESM/classic checks exercise both import orders, Tags-only registration, shipped helper behavior and sourcemap/metafile/declaration boundaries. |
| Integrated suite | `node node_modules/vitest/vitest.mjs run --maxWorkers=4`: 4,854 passing in 133 files, no failures/skips. `pnpm size:report --check-regressions` also passed through the package command. |
| Browser/consumer | `node scripts/package-check.mjs`: 95 entries / 2,327 files, strict NodeNext and runtime imports passed without installed ECharts. `node scripts/browser-check.mjs --catalog --page=dynamic-tags`: 6/6 scoped catalog checks plus existing Chart/Form/plugin/security workflows, Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 at 1280x900 and 375x812. Added Enter/button commit, removal, focus and registration assertions; desktop/mobile screenshots inspected. |
| Limits | This is an import-boundary fix, not S2 behavior unification. The all-catalog browser matrix and separate production-readiness gates remain open. No budget increases, cold-load penalties, export removals or hidden dependency files. |
| Commit | `7f1fb6b` - `fix: isolate Dynamic Tags helper imports`. |

Measured bytes below are raw / gzip, with each selected dependency counted once.
Only the two Dynamic Tags browser bundles changed hashes. CSS is unchanged at
1,148 gzip bytes and is excluded from these JavaScript totals.

| Selection | ESM before | ESM after | Classic before | Classic after |
| --- | ---: | ---: | ---: | ---: |
| Dynamic Tags entry | 39,093 / 11,699 | 32,230 / 10,361 | 39,323 / 11,845 | 32,562 / 10,518 |
| Dynamic Tags + core | 42,605 / 13,122 | 35,742 / 11,784 | 42,959 / 13,317 | 36,198 / 11,990 |
| Dynamic Input + Tags + core | 64,786 / 20,365 | 57,923 / 19,027 | 65,474 / 20,706 | 58,713 / 19,379 |
| All 89 families | 1,240,182 / 414,065 | 1,233,319 / 412,727 | 1,266,374 / 427,555 | 1,259,613 / 426,228 |

### S2 - Dynamic Tags contract decisions, September 28, 2026

Inventory found two separate implementations: the element owned simple trimmed
add/remove/clear and presentation; the factory owned native values/defaults, stable keys,
duplicate/validity checks, synchronous creation/resources, rollback, IME, stale intents,
reset cancellation and cleanup. Dynamic Input's controller already supplied the shared
collection behavior. Only Tags is reconciled here; Input's separate element remains open.

| Classification | Decision |
| --- | --- |
| Keep | Bounds, disabled/size, focus, authored-node identity, synchronous hooks, resource cleanup, native forms/defaults, validity, IME, reset cancellation, duplicate policy and precise stable-key removal. |
| Rename | `getTags()` becomes `values`; `add(text)` becomes `draft = text; commit()` with an explicit added/rejected result; `removeTag(index or value)` becomes `removeTag(key)`. Whitespace/case/comma are retained, not normalized. |
| Render-profile mapping | Public composition uses `m-form`, `m-dynamic-tags` and `m-button`. Tags maps name/maxlength/editor-label to native owners. Native authored anatomy, editor access and createTag/connectTag callbacks are optional Web-specific interoperability, not the portable vocabulary. |
| Remove | Public `createDynamicTags`, factory Options/Controller exports, duplicate element-side row mutations/listeners, and `m:dynamic-tags-change`. One controller emits bubbling `m:change {value,type,tag}`; error/rejection events retain their names and nonbubbling flags. |
| Correct | Max is integer 1-100 and never truncates rows. At capacity only Add is disabled. A native fieldset preserves descendants' authored disabled flags. Clear commits/removes each snapshot key through the collection, emits per removal and stops on cleanup errors. WebKit click focus and generated value sizing are covered. Renderer construction uses direct DOM creation, without HTML parsing sinks. |
| Defer | Dynamic Input element unification, other S2 families, shared delivery extraction, full bundle and non-Web renderers. No final size-optimization or production acceptance claim. |

The family has one behavioral owner, but closing the former element capability gap and
adding portable configuration costs **597 ESM / 591 classic gzip bytes relative to S1**.
This is a contract reconciliation, not a successful shrink result. Continue S3/S4
measurements without discarding these capabilities or resetting the S0 baseline.
Default size reporting explicitly flags the removed export and CSS growth; strict
equivalence reporting is not expected to pass. Existing build ceilings do pass.

Measured bytes are raw / gzip; core is counted once, CSS and the application-supplied
Chart engine remain separate.

| Selection | S1 ESM | S2 ESM | S1 classic | S2 classic |
| --- | ---: | ---: | ---: | ---: |
| Dynamic Tags entry | 32,230 / 10,361 | 34,620 / 10,958 | 32,562 / 10,518 | 34,951 / 11,109 |
| Tags + core | 35,742 / 11,784 | 38,132 / 12,381 | 36,198 / 11,990 | 38,587 / 12,581 |
| Input + Tags + core | 57,923 / 19,027 | 60,313 / 19,624 | 58,713 / 19,379 | 61,102 / 19,970 |
| All 89 families / 94 files | 1,233,319 / 412,727 | 1,235,709 / 413,324 | 1,259,613 / 426,228 | 1,262,002 / 426,819 |

Tags CSS grows from 1,148 to 1,178 gzip bytes, below the unchanged 1,500 ceiling.
Only Tags' two JS formats and CSS change; core, Input, other families and dependency
closures are unchanged. The example's optional Form/Button files are not Tags dependencies.

| Field | Verification evidence |
| --- | --- |
| Scope | Tags contract reconciliation only, including its reuse of Input collection mechanics. No Input class rewrite, extra dependency, raised ceiling or optional full bundle. |
| Type/build | `node node_modules/typescript/bin/tsc --noEmit`; `node scripts/build.mjs`: passed, including generated API and existing payload gates. |
| Focused behavior | `node node_modules/vitest/vitest.mjs run tests/dynamic-tags.test.ts tests/dynamic-input.test.ts`: 152 passing in 2 files. Covers all-m-* composition, native submission/reset, bounds/policy, authored nodes, pre-upgrade properties, hooks/rollback, IME, focus, reconnect, generated accessible names and blocked HTML parsing sinks. |
| Integrated suite | `node node_modules/vitest/vitest.mjs run --maxWorkers=4`: 4,867 passing in 133 files, zero failures/skips. Includes nine Tags distribution checks for isolated ESM/classic loading, import order, public exports and preserved helper ownership. |
| Browser | `node scripts/browser-check.mjs --catalog --page=dynamic-tags`: 6/6 scoped catalog checks plus the script's existing workflows, Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at 1280x900 / 375x812. Enter/button commits, removal, focus, portable form submission/reset and duplicate rejection pass; desktop/mobile screenshots inspected. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,327 files, packed strict NodeNext types and runtime imports passed without installed ECharts. |
| Size | `node scripts/size-report.mjs --output .vite/size/s2-tags.json`: measured results above; default diagnostics flag export/CSS changes. S0 baseline unchanged. |
| Limits | JS is larger than S1; unification closes element capability gaps but is not a shrink result. Native references/callbacks remain explicit Web-only escape hatches. All-catalog browser, non-Web renderers and separate production-readiness gates remain open. |
| Commit | `03b1cd6` - `refactor: unify Dynamic Tags element behavior`. |

### S2 - Dynamic Input contract decisions, September 28, 2026

Input previously had an element-side row engine and a separate controller with stronger
transactions, ownership, action cancellation, focus and cleanup. The element now delegates
to that existing controller. Renderer code owns only template/default-field mapping and
the native disabled fieldset; no distribution extraction is included.

| Classification | Decision |
| --- | --- |
| Keep | Stable-key add/remove/move, literal native names and defaults, focus/selection, validation, authored identity/listeners, action cancellation, synchronous hooks, cleanup and reconnect. |
| Rename | `getRows()` becomes `rows` descriptors; row removal becomes `removeRow(key)`, leaving native `remove()` intact. `add(index?)` returns a descriptor; `move(key,index)` accepts only stable keys. |
| Render-profile mapping | `m-dynamic-input-template` is the portable row-content region, mapped to an inert native template. Default `name`/`field-label` map to a generated native field. Custom templates compose selected `m-*` fields and labels; native anatomy, row references and `initializeRow`/`connectRow` are explicit Web interoperability. |
| Remove | Public factory/Options/Controller exports, duplicate element-side mutation/event engine, `syncActions()` and lossy comma-flattening `getValues()`. No compatibility aliases. |
| Events | Structural transactions emit bubbling `m:change {type,row,index,previousIndex,rows}`. Field edits and resets retain native events. The shared controller retains its private nonbubbling collection notification for Tags, without an element-side event bridge. |
| Correct | Bounds are integer `0 <= min <= max <= 100`, max at least 1. Generated initial rows use controller transactions up to min; later bounds never allocate or truncate. Inherited fieldset disabling preserves own disabled flags; explicit programmatic transactions remain available. Selected native field owners materialize detached before validation/insertion. Generated keys are not reused after reconnect. Click-add focus handles WebKit's active-body behavior without stealing outside focus. Whole-family registration rejects constructor conflicts without partially registering the template. |
| Defer | Other S2 families, further S3 simplification, shared delivery, optional full bundle, non-Web renderers and independent production-readiness gates. |

Measured bytes are raw / gzip. This task reduces Input's raw entry bytes but adds
**118 ESM / 126 classic gzip bytes** relative to the pre-Input state. Shared collection
corrections add **21 / 16 gzip bytes** to Tags. This is capability reconciliation, not
a gzip saving. S0 remains frozen; default reporting flags export changes and growth,
while all unchanged build ceilings pass.

| Selection | Before ESM | After ESM | Before classic | After classic |
| --- | ---: | ---: | ---: | ---: |
| Dynamic Input entry | 22,181 / 7,243 | 21,767 / 7,361 | 22,515 / 7,389 | 22,100 / 7,515 |
| Input + core | 25,693 / 8,666 | 25,279 / 8,784 | 26,151 / 8,861 | 25,736 / 8,987 |
| Dynamic Tags entry | 34,620 / 10,958 | 34,731 / 10,979 | 34,951 / 11,109 | 35,062 / 11,125 |
| Tags + core | 38,132 / 12,381 | 38,243 / 12,402 | 38,587 / 12,581 | 38,698 / 12,597 |
| Input + Tags + core | 60,313 / 19,624 | 60,010 / 19,763 | 61,102 / 19,970 | 60,798 / 20,112 |
| All 89 families / 94 files | 1,235,709 / 413,324 | 1,235,406 / 413,463 | 1,262,002 / 426,819 | 1,261,698 / 426,961 |

Input CSS grows from 780 to 818 gzip bytes, below its unchanged 1,000 ceiling.
Tags CSS stays at 1,178 bytes. Core, unrelated families, dependency lists and external
ECharts accounting are unchanged. Input's classic combined runtime has only **13 bytes**
of headroom under 9,000; do not raise this ceiling or hide mandatory bytes elsewhere.
The all-modular cumulative saving from S0 is only 602 ESM / 594 classic gzip bytes.

| Field | Verification evidence |
| --- | --- |
| Type/build | `node node_modules/typescript/bin/tsc --noEmit`; `node scripts/build.mjs`: passed, including generated API and unchanged payload gates. |
| Focused behavior | `node node_modules/vitest/vitest.mjs run tests/dynamic-input.test.ts tests/dynamic-tags.test.ts --maxWorkers=1`: 163 passing in 2 files, including focus immediately after host insertion. |
| Integrated suite | `node node_modules/vitest/vitest.mjs run --maxWorkers=1`: 4,879 passing / 4,880 tests in 133 files, no skips or assertion failures; one unchanged Chart distribution test exceeded the default 5-second timeout. `node node_modules/vitest/vitest.mjs run tests/chart-distribution.test.ts --maxWorkers=1`: 3/3 passed with the original timeout. Earlier four-worker attempts had additional timing failures and directory order/count mismatches, which were corrected. A zero-failure single full run is not claimed. |
| Distribution | Eleven Input/Tags distribution fixtures passed in the integrated run: ESM/classic import orders, whole-family conflict rejection, source/declaration boundaries, canonical exports and core-only dependencies. The packed consumer also passed. |
| Browser | `node scripts/browser-check.mjs --catalog --page=dynamic-input` and `node scripts/browser-check.mjs --catalog --page=dynamic-tags`: 6/6 each in Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at 1280x900 / 375x812. Input add/move/remove, focus, disabled, portable multi-field submission/reset and reconnect passed, as did Tags workflows and the script's existing checks. Desktop/mobile screenshots inspected; scoped catalog results retained separately under `.vite/browser`. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,327 files, packed strict NodeNext types and runtime imports passed without installed ECharts. |
| Size | `node scripts/size-report.mjs --output .vite/size/s2-input.json`: measured results above. Pre-Input report is `.vite/size/pre-input.json`; S0 baseline unchanged. |
| Limits | Gzip grows, despite raw reduction. No all-catalog, non-Web, zero-failure single-run CI or production acceptance claim. The unchanged-timeout Chart recheck passed after the integrated timeout. Custom field families must load before collection initialization. Template rendering is not binding-plugin structural-template support. |
| Commit | `59d9d65` - `refactor: unify Dynamic Input element behavior`. |

### S2 - Calendar contract decisions, September 28, 2026

Calendar previously had separate element and factory renderers. The element supplied
day/month selection and local-date defaults; the factory supplied bounded preparation,
strict anatomy, day policy/annotations, validation rollback, keyboard/focus and cleanup.
The canonical element now delegates both views to that existing controller. There is no
second state-transition engine or new shared delivery file.

| Classification | Decision |
| --- | --- |
| Keep | Day/month selection, independent panel/today, bounds, first weekday/locale, disabled/native fieldset behavior, synchronous day policy/annotations, defaults/reset, pre-upgrade properties, authored identity, keyboard/focus and reconnect cleanup. |
| Render-profile mapping | Public examples use only `m-*` elements. `m-calendar` creates a named Web group with one captioned native table, action buttons, cell template and readouts. Native table/template adoption and callbacks remain explicit Web-only interoperability, not required portable authoring. No named form proxy or native form-reset behavior is invented. |
| Canonical API | Silent properties and atomic `configure(settings)` share validation and commit. `select`, `show`, month/year navigation, `today`, `reset`, `refresh`, state/error and focus delegate to the same owner. `todayValue` maps to `today`; `defaultValue` maps to `default-value`. |
| Remove | Public `createCalendar`, factory Options/Controller exports, duplicate element renderer/listeners and `m:calendar-change`. The public runtime exports are Calendar, calendarModes and registerCalendar. No compatibility aliases. |
| Events | Selection changes bubble as `m:change {value,previousValue,year,month,date,reason}`; month values have null date. Panel changes emit first as `m:calendar-panel-change`; reentrant writes suppress stale selection events. Failed user updates retain the previous view and emit `m:calendar-error`. |
| Correct | Year view uses 12 month cells and three-column navigation; month view retains 42 day cells. A month is available when it overlaps min/max; day hooks do not search or annotate month cells. Mode changes retain original value precision. Parsed attribute order, initialization reentry, authored action flags, stable table/cell identity and external focus are covered. |
| Date boundary | The existing native UTC Gregorian carrier now validates canonical dates by round-trip, rejecting normalization without requiring native date-input support. This fixes the observed Windows WebKit text-input fallback. Dates remain strings, not timestamps. Heatmap shares this utility and now takes `buildHeatmap(options)`, with actual callers updated and no unused Document parameter/overload. |
| Defer | Heatmap element/controller reconciliation, Tree/Cascader/Tree Select, Upload, Data Table, remaining S3, shared delivery, full bundle and independent production gates. |

Measured bytes are raw / gzip. Calendar itself saves **120 ESM / 111 classic gzip
bytes**; the shared date-utility change saves Heatmap another **389 / 390**.
The combined reduction from the pre-Calendar state is **509 / 501 gzip bytes**.
The S0 cumulative modular saving is **1,111 / 1,095 gzip bytes**; this is still small.
Removing factory exports is contract reconciliation, not proof of equivalent behavior
from export names alone. S0 remains frozen.

| Selection | Before ESM | After ESM | Before classic | After classic |
| --- | ---: | ---: | ---: | ---: |
| Calendar entry | 25,560 / 9,051 | 25,375 / 8,931 | 25,883 / 9,208 | 25,697 / 9,097 |
| Calendar + core | 29,072 / 10,474 | 28,887 / 10,354 | 29,519 / 10,680 | 29,333 / 10,569 |
| Heatmap entry | 22,443 / 8,430 | 21,406 / 8,041 | 22,764 / 8,583 | 21,727 / 8,193 |
| Heatmap + core | 25,955 / 9,853 | 24,918 / 9,464 | 26,400 / 10,055 | 25,363 / 9,665 |
| All 89 families / 94 files | 1,235,406 / 413,463 | 1,234,184 / 412,954 | 1,261,698 / 426,961 | 1,260,475 / 426,460 |

Only Calendar/Heatmap's two JS formats and Calendar CSS change hashes in the size
report. Core, other families, dependency lists and application-supplied ECharts are
unchanged. Calendar CSS changes from 4,513 / 1,237 to 4,552 / 1,249 bytes,
leaving **one gzip byte** under the unchanged 1,250-byte ceiling. Heatmap CSS remains
7,123 / 1,672. No ceiling is raised and no mandatory bytes move into another file.

| Field | Verification evidence |
| --- | --- |
| Type/build | `node node_modules/typescript/bin/tsc --noEmit`; `node scripts/build.mjs`: passed, including generated API and unchanged payload gates. |
| Focused/distribution | `node node_modules/vitest/vitest.mjs run tests/calendar-distribution.test.ts tests/calendar.test.ts tests/heatmap.test.ts tests/date-picker.test.ts tests/date-picker.styles.test.ts tests/native.test.ts tests/core-distribution.test.ts tests/element-directory.test.ts tests/size-report.test.ts --maxWorkers=1`: 319/319 passed in 9 files. Five Calendar distribution fixtures cover isolated ESM/classic upgrade, constructor conflicts, canonical exports, core-only dependencies, source/declaration boundaries and portable demo/API. |
| Timing limit | The first focused run overlapped browser work: 318/319 passed, with the unchanged size-report test exceeding its default 5-second timeout. The same full focused command passed after browser completion, without changing timeouts. The entire repository suite was not rerun for this bounded task; the earlier Input integrated limitation remains recorded above. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,327 files, packed strict NodeNext types and runtime imports passed without installed ECharts. |
| Browser | `node scripts/browser-check.mjs --catalog --page=calendar` and `--page=heatmap`: 6/6 each in Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at 1280x900 / 375x812, plus the script's Chart/Form/plugin/security checks. Calendar covers native keyboard selection, navigation, clearing, bounds/policy, reset/disabled, naming, reconnect identity and overflow; desktop/mobile screenshots inspected. Heatmap checks the exported data builder, leap dates, year boundaries, invalid dates and zero/null/missing distinctions, not completion of its currently limited element demo. Scoped results retained separately under `.vite/browser`. |
| Size | `node scripts/size-report.mjs --output .vite/size/s2-calendar.json`; compared with `.vite/size/pre-calendar.json`. Default S0 diagnostics still flag export changes and prior growth; strict equivalence is not claimed. |
| Limits | No all-catalog, full-suite, non-Web, human accessibility/device or production acceptance claim. Native references/callbacks remain Web-only. Remaining family reconciliation and S3-S6 are open. |
| Commit | `e914f5c` - `refactor: unify Calendar element behavior`. |

### S2 - Tree preflight, September 28, 2026

This is a bounded controller correctness prerequisite, **not completed Tree
reconciliation**. Inventory confirmed that replacing the factory with the current
element would discard required behavior:

| Surface | Existing capability and reconciliation requirement |
| --- | --- |
| Tree/TreeNode elements | Portable nested nodes, single value, checks/cascade, expanded/disabled state and block-line presentation. They independently implement selection, cascade and keyboard behavior. Generated hosts/rows introduce extra focus targets and do not reuse the controller's native list/disclosure semantics. |
| Tree controller | Native list/details/button/link/checkbox owners; independent multiple selection/checks; all/parent/child reporting and mixed state; disabled barriers; native names/defaults/reset; typeahead/focus recovery; bounded lazy insertion, abort/dispose and ownership checks. Preserve these capabilities in the canonical element rather than deleting their exports first. |
| Cascader | Its element has a separate dependent-select implementation and eagerly chooses first children. The controller retains explicit partial paths, leaf/any policy, native defaults/reset reconstruction, validity gates and async cancellation. Its reconciliation is a separate bounded task after Tree. |
| Tree Select | It and Cascader import `tree/hierarchy.ts`, not Tree registration/controller. Passive hierarchy input is distinct from a live Tree; preserve native selection ownership and do not silently turn passive data into an active Tree. |
| Public mapping | Retain `m-tree`/`m-tree-node` as public authoring. Native lists, items, disclosure and controls must be generated/adopted within the Web renderer. Resolve node ownership, live/default keys, multiple selection, lazy data mapping and event details before replacing the element. Do not require native HTML or add a compatibility adapter to reach controller-only features. |

Two reproduced controller defects are fixed before that integration:

- A queued selection click could overwrite a newer `setSelectedKeys` write. Explicit
  validated writes now invalidate older selection intents independently of load generations.
  Rejected writes do not cancel a valid click; later clicks and consecutive multiple
  selections still work. A write from a selection listener supersedes remaining queued clicks.
- If a loader rejected and failure cleanup discovered invalid anatomy, deleting its job
  before cleanup could leave the returned Promise permanently pending. Rejection now runs
  in `finally`; an `AggregateError` retains the loader and cleanup failures.

Only Tree's ESM/classic JS hashes change. This fix costs **48 / 59 gzip bytes**; it is
not a shrink result. Exports, dependency lists, all CSS, Cascader, Tree Select and
application-supplied ECharts are unchanged. Existing ceilings and S0 remain untouched.

| Selection (raw / gzip bytes) | Before ESM | After ESM | Before classic | After classic |
| --- | ---: | ---: | ---: | ---: |
| Tree entry | 32,651 / 10,088 | 32,762 / 10,136 | 32,966 / 10,255 | 33,077 / 10,314 |
| Tree + core | 36,163 / 11,511 | 36,274 / 11,559 | 36,602 / 11,727 | 36,713 / 11,786 |
| Tree + Cascader + Tree Select closure | 98,107 / 32,494 | 98,218 / 32,542 | 99,688 / 33,229 | 99,799 / 33,288 |
| All 89 families / 94 files | 1,234,184 / 412,954 | 1,234,295 / 413,002 | 1,260,475 / 426,460 | 1,260,586 / 426,519 |

Tree CSS remains 3,890 / 1,131 bytes. The unchanged 12,000-byte runtime ceiling
has 214 classic gzip bytes of headroom, which constrains the pending unification.
The S0 cumulative modular saving is now 1,063 ESM / 1,036 classic gzip bytes.

| Field | Verification evidence |
| --- | --- |
| Scope | Two Tree controller race fixes and the family capability inventory. No element/renderer replacement or public API removal. |
| Reproduction | New source tests failed before the fix: a queued click replaced newer explicit keys; a rejected loader plus invalid anatomy left the returned Promise unsettled. |
| Type/build | `node node_modules/typescript/bin/tsc --noEmit`; `node scripts/build.mjs`: passed with unchanged payload ceilings. |
| Behavior/distribution | `node node_modules/vitest/vitest.mjs run tests/tree-distribution.test.ts tests/tree.test.ts tests/cascader.test.ts tests/cascader.styles.test.ts tests/tree-select.test.ts tests/size-report.test.ts --maxWorkers=1`: 179/179 passed in 6 files. Six added source regressions cover stale/valid/later clicks, listener writes, failure settlement and independent loads. Three distribution checks cover isolated ESM/classic behavior, shared core identity and unchanged passive hierarchy boundaries. The classic fixture uses its own realm's Promise to reproduce the same loader/observer ordering as ESM. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,327 files, packed strict NodeNext types and runtime imports passed without installed ECharts. |
| Size | `node scripts/size-report.mjs --output .vite/size/s2-tree-preflight.json`, compared with `.vite/size/pre-tree.json`: only Tree's two runtime files change. S0 is unchanged. |
| Limits | No full-suite or real-browser rerun for this controller-only prerequisite; no rendered DOM/CSS changed. Full `m-*` native-owner mapping, Tree/Cascader unification and their browser interaction acceptance remain open. |
| Commit | `b6c62f5` - `fix: settle Tree loads and supersede stale selections`. |

### S2 - Tree contract decisions, September 28, 2026

The canonical `Tree`/`TreeNode` now delegate to one internal controller.
The competing element selection, cascade, synthetic node-event and keyboard
engines are removed. The following decisions reconcile the preflight inventory:

| Classification | Decision |
| --- | --- |
| Keep | Single/multiple selection independent of checks, cancellation, cascade barriers, all/parent/child reporting, mixed state, native names/defaults/reset, disclosure, keyboard/typeahead/focus, bounded lazy loading, abort/disposal, ownership and fail-closed anatomy validation. |
| Public mapping | Author `m-tree` and nested `m-tree-node`; the Web renderer creates a named section and native ul/li, details/summary, buttons/links and labelled checkboxes. Native li contains the original node host, never the other way around at the list boundary. Authored phrasing, listeners and native control identity survive updates. Nested Trees and transferred nodes retain separate owners. |
| Canonical API | `selectedKeys`, `checkedKeys` and `expandedKeys` are silent key-array writes; `check(key, boolean)`, `expand`, `reveal`, `refresh` and native-target `focus(options)` delegate to the controller. `getCheckedData` and `getIndeterminateData` expose snapshots; native descriptors are explicit Web interoperability. `multiple`, `cancelable`, `checkStrategy`, `disabled`, `checkable`, `selectable`, `cascade` and `blockLine` update the same owner. |
| Defaults | Initial node `selected`, `checked` and `expanded` attributes, native `defaultChecked` and initial-only `defaultExpandAll` replace factory default-key options. Initial key writes can override authored state without overwriting native reset defaults. Generated native state survives reconnect directly, not through stale cached key arrays. Only checkboxes participate in form reset. Detached attribute edits and deletion of selected/expanded nodes are covered. |
| Loading | `load` returns bounded `TreeItem` data and optional synchronous disposal, not authored native HTML. `web.ts` renders both authored nodes and loaded data through one anatomy. Data conversion happens inside the existing load transaction, preserving rejection ordering. Loaded rows remain independently selectable/checkable, update with flags, and are removed/disposed on disconnect. Bounds, unsafe-link rejection, abort signals, late disposal and the preflight race fixes remain. |
| Remove | Public `createTree`, factory Options/Controller and parser helper exports; element `value`, key-method synonyms and synthetic `m:node-*`/`m:select`/`m:check` events. Public runtime exports are only `Tree`, `TreeNode` and `registerTree`. No compatibility aliases or new mandatory runtime entry. |
| Events | The same controller emits bubbling `m:tree-select`, `m:tree-check`, `m:tree-expand`, `m:tree-load` and `m:tree-error` from the element. Native field events remain native; programmatic state writes are silent. |
| Simplification | Internal fields use real private members. Per-element attribute indexes replace repeated array searches and share release logic. Mapped labels retain their live selection across reconnect; borrowed native fixtures still restore owned attributes. Key validation is shared, redundant internal factory-option checks/default caches are removed, and diagnostics remain descriptive. Demo-only API extraction omits `@internal` renderer methods. |
| Defer | Cascader's separate reconciliation, Tree Select's element/controller gap, remaining S2/S3 work, shared delivery/full bundle and independent production gates. Passive hierarchy consumers still do not import Tree registration or its controller. |

This task reduces Tree raw bytes by **321 ESM / 326 classic**, but adds
**216 / 201 gzip bytes** relative to preflight. The shared parser changes save
76 / 75 gzip bytes across Cascader and Tree Select combined; the related-family
and all-modular totals therefore grow by **140 / 126 gzip bytes**. This is
capability reconciliation, not a gzip saving. S0 remains frozen; cumulative
modular savings from S0 are now only **923 / 910 gzip bytes**.

| Selection (raw / gzip bytes) | Before ESM | After ESM | Before classic | After classic |
| --- | ---: | ---: | ---: | ---: |
| Tree entry | 32,762 / 10,136 | 32,441 / 10,352 | 33,077 / 10,314 | 32,751 / 10,515 |
| Tree + core | 36,274 / 11,559 | 35,953 / 11,775 | 36,713 / 11,786 | 36,387 / 11,987 |
| Tree + Cascader + Tree Select | 98,218 / 32,542 | 97,739 / 32,682 | 99,799 / 33,288 | 99,315 / 33,414 |
| All 89 families / 94 files | 1,234,295 / 413,002 | 1,233,816 / 413,142 | 1,260,586 / 426,519 | 1,260,102 / 426,645 |

Only these three families' JS files and Tree CSS change hashes. Dependency
lists, core, unrelated families and application-supplied ECharts are unchanged.
Tree CSS changes from 3,890 / 1,131 to 4,045 / 1,186 bytes, below 1,250.
Tree's classic core-inclusive runtime has **13 bytes** of headroom under 12,000.
No ceiling is raised and no mandatory bytes move off the selected-file ledger.

| Field | Verification evidence |
| --- | --- |
| Type/build | `node node_modules/typescript/bin/tsc --noEmit`; `node scripts/build.mjs`: passed, including generated API and unchanged payload gates. |
| Focused/distribution | `node node_modules/vitest/vitest.mjs run tests/tree.test.ts tests/tree-element.test.ts tests/tree-distribution.test.ts tests/cascader.test.ts tests/cascader.styles.test.ts tests/tree-select.test.ts tests/native.test.ts tests/element-directory.test.ts tests/core-distribution.test.ts tests/size-report.test.ts --maxWorkers=1`: 256/256 passed in 10 files. Covers native mapping, authored identity, defaults/reset, detached edits/removal, ownership transfer, independent selection/checks, focus, lazy cancellation/disposal, ESM/classic upgrade and passive hierarchy boundaries. |
| Integrated suite | `node node_modules/vitest/vitest.mjs run --maxWorkers=1`: 4,948/4,948 tests passed in 136 files, no failures/skips, 568.22 seconds. This final Tree-state run also covers the shared parser and demo-only API extraction changes. It does not retroactively change the earlier Input/Calendar timing records. |
| Timing | The initial focused run passed 252/253 tests; one size-report test containing five CLI invocations exceeded its default 5-second timeout, including on isolated rerun. Determinism and the three independent regression-rejection cases now have separate fixtures; assertions, reporter behavior and the default timeout are unchanged. The full focused command then passed. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,331 packed files; strict NodeNext types and runtime imports passed without installed ECharts. The extra four files are Tree's new source-layout renderer JS/declaration outputs and their maps, not extra mandatory runtime entries. |
| Browser | `node scripts/browser-check.mjs --catalog --page=tree`: 6/6 in Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at 1280x900 / 375x812, plus the script's existing Chart/Form/plugin/security checks. Selection cancellation/native Enter, arrow navigation, cascade/mixed reporting, submission/reset, reconnect identity, detached selected-node removal, lazy selection and isolated registration passed. Desktop/mobile screenshots inspected; scoped results retained at `.vite/browser/s2-tree-results.json`. |
| Size | `node scripts/size-report.mjs --output .vite/size/s2-tree.json`, compared with `.vite/size/s2-tree-preflight.json`. Default S0 diagnostics report changed exports and growth; strict equivalence is not claimed. |
| Limits | No all-catalog, non-Web, human accessibility/device or production acceptance claim. Cascader/Tree Select browser interaction is not covered by the Tree run. Native descriptors and callbacks remain explicit Web interoperability. Remaining S2 and S3-S6 are open. |

### Cascader pre-integration inventory

Re-reading `cascader-element.ts`, `cascader.ts`, the current demo and the native
fixtures confirms that this is still an implementation gap, not a completed family:

- The current element's untyped `options` renderer eagerly selects first children,
  replaces its content and captures a mutable loop level in change listeners.
  Its empty-data path leaves stale controls, while its fallback is a free-text input.
  These are not the controller's hierarchical-selection semantics.
- Keep the controller's explicit partial path, terminal leaf/any policy, independent
  current/default values, native dependent-select identity, reset reconstruction,
  validity gates, cancellation, bounded loading and cleanup. Expose them through the
  canonical element, with typed options and Web-owned source/column rendering.
- Do not use an active `m-tree` as passive Cascader data or make Tree registration a
  dependency. Cascader and Tree Select currently share only `tree/hierarchy.ts` at
  runtime; native-selection and hierarchy ownership must remain separate.
- Reconcile the unused hover trigger and string-or-array value surface explicitly.
  Preserve a real partial path rather than joining it into a string, automatically
  completing it, or retaining an alias to the competing element implementation.
- Update the currently empty demo to exercise actual options, partial selection,
  clearing, disabled behavior, submission/reset and lazy loading using `m-*`
  authoring. Its present controls and documentation are not acceptance evidence.

No Cascader implementation/export change was included in the Tree task.

### S2 - Cascader reconciliation, September 28, 2026

`Cascader` now delegates to its existing internal controller; the competing dependent
select implementation and public factory exports are removed. Typed immutable options
and JSON attributes replace untyped data. The Web renderer owns the native fieldset,
legend, labelled columns, source and clear action. Public examples require only `m-*`
authoring. Native controls/descriptors remain explicitly Web-specific inspection/hooks.

Partial paths never automatically select descendants. Leaf/any selection, native
validity and names, independent live/default paths, reset reconstruction, clear
cancellation, focus recovery, ownership and cleanup are retained. Loaded results are
bounded data (200 nodes per batch, 2,000 total, eight levels), mapped through the same
passive renderer as initial options, with abort and synchronous disposal. Tree and
Select registration remain independent. Scalar presentation updates preserve native
controls and pending loads; disabling cancels a pending load.

Controller cleanup now settles rejected loads even when failure cleanup also throws.
Explicit writes supersede queued clear actions. Attribute reflection skips identical
writes so upgrading markup with `value` before `options` cannot consume queued
initialization callbacks before its data is ready. Per-element attribute indexing,
shared ancestor-path traversal and removing redundant column containers reduce
duplicate work without relaxing validation. The unused hover trigger is removed.

This is capability reconciliation, not a gzip saving. Only Cascader runtime/CSS hashes
change from the completed Tree state. S0 stays frozen, ECharts remains external and
no ceiling increases. Cumulative S0 savings are now 724 ESM / 716 classic gzip bytes.

| Selection (raw / gzip bytes) | Before ESM | After ESM | Before classic | After classic |
| --- | ---: | ---: | ---: | ---: |
| Cascader entry | 30,668 / 10,163 | 30,864 / 10,362 | 30,991 / 10,333 | 31,185 / 10,527 |
| Cascader + core | 34,180 / 11,586 | 34,376 / 11,785 | 34,627 / 11,805 | 34,821 / 11,999 |
| Tree + Cascader + Tree Select | 97,739 / 32,682 | 97,935 / 32,881 | 99,315 / 33,414 | 99,509 / 33,608 |
| All 89 families / 94 files | 1,233,816 / 413,142 | 1,234,012 / 413,341 | 1,260,102 / 426,645 | 1,260,296 / 426,839 |

Cascader CSS changes from 3,177 / 932 to 3,393 / 1,002 bytes. Its classic
core-inclusive runtime has one byte of headroom under the unchanged 12,000 ceiling.

| Field | Verification evidence |
| --- | --- |
| Type/build | `node node_modules/typescript/bin/tsc --noEmit`; `node scripts/build.mjs`: passed, including generated API and existing payload gates. Early builds correctly rejected 12,002/12,005/12,022-byte runtimes before local simplification; budgets were not changed. |
| Source | `node node_modules/vitest/vitest.mjs run tests/cascader.test.ts tests/cascader-element.test.ts tests/cascader.styles.test.ts --maxWorkers=1`: 71/71 passed after the final source changes. |
| Distribution | `node node_modules/vitest/vitest.mjs run tests/cascader-distribution.test.ts --maxWorkers=1`: 4/4 passed, including ESM/classic pre-upgrade properties, attribute ordering, native reset, exports, shared core identity, independent registration and declarations/API. |
| Final focused suite | `node node_modules/vitest/vitest.mjs run tests/cascader.test.ts tests/cascader-element.test.ts tests/cascader-distribution.test.ts tests/cascader.styles.test.ts tests/tree.test.ts tests/tree-distribution.test.ts tests/tree-select.test.ts tests/native.test.ts tests/element-directory.test.ts tests/core-distribution.test.ts tests/size-report.test.ts --maxWorkers=1`: 252/252 passed in 11 files. |
| Integrated suite | `node node_modules/vitest/vitest.mjs run --maxWorkers=1`: 4,962/4,963 passed in 138 files, 505.35 seconds. The unchanged Thing API extraction fixture exceeded its default 5-second timeout (5,329 ms). `node node_modules/vitest/vitest.mjs run tests/thing.test.ts --maxWorkers=1` then passed 20/20 in isolation. No timeout or assertion was changed; this is not a clean full-suite acceptance claim. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,335 packed files; strict NodeNext types and runtime imports passed without installed ECharts. Four new source-layout passive-renderer JS/declaration/map files are not additional runtime dependencies. |
| Browser | `node scripts/browser-check.mjs --catalog --page=cascader`: 6/6 in Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at 1280x900 / 375x812, plus existing Chart/Form/plugin/security checks. Covers partial and complete selection, submission/reset, clear, reconnect identity, lazy data selection and registration isolation. Desktop/mobile screenshots inspected. The initial run exposed the attribute-order upgrade bug and an overly strict label-text locator; both were corrected before the passing run. |
| Size | `node scripts/size-report.mjs --output .vite/size/s2-cascader.json`, compared with `.vite/size/s2-tree.json`. Default S0 diagnostics still flag intentional export changes and growth; strict equivalence is not claimed. |
| Limits | No all-catalog, non-Web, human accessibility/device or production acceptance claim. Tree Select's separate element/controller gap, Upload, Data Table, Heatmap and S3-S6 remain open. |
| Commit | `ce69b0d` - `refactor: unify Cascader element behavior`. |

### Next S2 family - Upload inventory

This inventory is not implementation or acceptance evidence:

- The current element maintains a second `File[]` cache, exposes duplicate `files` and
  `fileList` getters, truncates multi-file drops in single mode, and can report selected
  files even when native FileList assignment fails. Its hidden chooser, trigger forwarding
  and independent drag handlers do not expose the controller's complete native contract.
  The existing `action` attribute does not implement a transport.
- The controller already owns bounded all-or-nothing selection, actual FileList
  synchronization and form submission, stable file IDs, append/replace, concurrent
  explicit transports, progress, cancellation, retry, reset, focus and cleanup.
  Move required behavior behind `m-upload`; do not remove it as redundant factory code.
- Keep native chooser fallback when DataTransfer/FileList assignment is unsupported.
  Map trigger, dragger, list and native progress/actions within the Web renderer while
  preserving authored `m-*` content and listeners. Never require native templates,
  input, ul/li or button markup to access queue behavior.
- Cancellation does not settle a transport. An ignored-abort job retains its concurrency
  slot and ownership until it settles. Reconnection must not steal that owner or
  automatically resend retained native files. Test disconnect-before-start, delayed
  settlement, canceled reset and stale progress/completion through the element.
- Resolve one canonical file snapshot API and event contract, remove inert action and
  duplicate aliases, and update source callers, generated API, demo and package exports
  together. Explicit transport policy must remain application supplied.
- Current Upload entry gzip is 8,993/9,152 ESM/classic; core-inclusive costs are
  10,416/10,624 under 11,000, and CSS is 1,212 bytes. Preserve these ceilings and account
  for all renderer/queue code. Run source, distribution, FileList/form and three-engine
  interaction checks before calling the family complete.

### S2 - Upload reconciliation, September 28, 2026

The canonical element now delegates to the existing FileList/queue controller. Its
portable regions map to a native fieldset, labelled visible chooser, real trigger
button, passive drop area, native list/progress and queue actions. Author content
and native chooser identity survive updates/reconnect. No native template or list
markup is needed to use the advanced queue.

One immutable `files` descriptor snapshot replaces the competing File array cache
and `fileList` alias. `options` supplies explicit transport, limits, selection mode,
concurrency and synchronous notifications; replacing it is allowed only while idle
and cannot invalidate current files or resend existing ones. The inert `action`,
public factory/controller exports and competing dropped-file method are removed.
The controller emits the same change/progress/error events from the host.

Ignored-abort requests keep their slots and ownership until actual settlement.
Reconnection waits for that settlement and never automatically resends retained
native files. Unsupported synchronization leaves the visible native chooser and
FormData intact, hides enhancement controls and reports an enhancement error,
without fabricating queue membership. Native reset/cancelled reset, disabled
fieldset, focused actions and guarded callbacks are covered.

Upload's attribute-only lease map replaces its unused style-write dependency and
the unused job-invocation flag is removed. These local simplifications keep the
complete implementation within unchanged budgets; no bytes move into a new entry.
This is capability reconciliation, not a gzip saving.

| Selection (raw / gzip bytes) | Before ESM | After ESM | Before classic | After classic |
| --- | ---: | ---: | ---: | ---: |
| Upload entry | 25,792 / 8,993 | 25,799 / 9,366 | 26,122 / 9,152 | 26,125 / 9,525 |
| Upload + core | 29,304 / 10,416 | 29,311 / 10,789 | 29,758 / 10,624 | 29,761 / 10,997 |
| All 89 families / 94 files | 1,234,012 / 413,341 | 1,234,019 / 413,714 | 1,260,296 / 426,839 | 1,260,299 / 427,212 |

Only Upload JS/CSS hashes change. S0 stays frozen, with cumulative modular savings
now 351/343 gzip bytes. Classic Upload has three bytes under the unchanged 11,000
runtime ceiling. The initial 11,159-byte build failed correctly before simplification.
CSS changes from 4,483 / 1,212 to 4,575 / 1,236 raw/gzip bytes, below 1,250.

| Field | Verification evidence |
| --- | --- |
| Type/build | `node node_modules/typescript/bin/tsc --noEmit`; `node scripts/build.mjs`: final build passes type generation, generated API and unchanged payload gates. |
| Focused/distribution | `node node_modules/vitest/vitest.mjs run tests/upload.test.ts tests/upload-distribution.test.ts tests/native.test.ts tests/element-directory.test.ts tests/core-distribution.test.ts tests/size-report.test.ts --maxWorkers=1`: 146/146 passed in 6 files. Includes the original controller safety tests and new canonical mapping, reconfiguration, native submission/reset, delayed settlement, reconnect, fallback and isolated ESM/classic pre-upgrade tests. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,335 packed files, strict NodeNext types and runtime imports passed without installed ECharts. |
| Browser | `node scripts/browser-check.mjs --catalog --page=upload`: 6/6 in Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6, desktop/mobile, plus existing Chart/Form/plugin/security workflows. Real chooser selection, keyboard trigger, progress, cancel/retry, reconnect, portable form submission/reset and flat-file drop pass. Screenshot review exposed the default inline drop-region layout; its block mapping was corrected. |
| Size | `node scripts/size-report.mjs --output .vite/size/s2-upload.json`, compared with `.vite/size/s2-cascader.json`. No baseline overwrite or ceiling increase. |
| Limits | No new full-suite, all-catalog or production acceptance claim. Data Table, Heatmap, Tree Select and S3-S6 remain open. |
| Commit | `f5b43ef` - `refactor: unify Upload element queue behavior`. |

### S2 - Heatmap reconciliation, September 28, 2026

Heatmap's previous element generated an unrelated empty row/column grid. It now
delegates to the same bounded date/domain model and calendar controller as the
advanced path. Typed or JSON `data` and `settings` replace arbitrary `rows`/`columns`.
The renderer owns the native captioned table, seven weekday rows, complete cell
template, legend and persistent detail/status text. All portable examples author
only `m-*` content; no native template or table is required.

The public factory/controller exports and unused generic change event are removed.
Pure model utilities remain meaningful public non-element operations. Date-only
validation, 366-record/range bounds, missing-versus-zero semantics, deterministic
domains/thresholds/clamping, locale, optional leading dates, explicit palettes,
labels, loading and synchronous descriptions remain. The existing controller owns
all focus/navigation, exploration, guarded updates and cleanup; surviving day
buttons and focus remain stable. The semantic table, settings and current inspection
date survive reconnect. Invalid data/settings leave the committed view unchanged.
Preparation guards also cover disconnected writes and first-connection callbacks,
before the controller has been assigned, rather than only live controller updates.

Real screenshots exposed a pre-existing selector collision: both the day button
and its time child matched the small-date font rule. Date selectors now explicitly
target native time, and browsers verify the button remains 12px. Value text stays
unbroken inside the horizontally scrollable table, including the missing marker.
CSS shrinks by four gzip bytes; no ceiling changes.

| Selection (raw / gzip bytes) | Before ESM | After ESM | Before classic | After classic |
| --- | ---: | ---: | ---: | ---: |
| Heatmap entry | 21,406 / 8,041 | 22,230 / 8,347 | 21,727 / 8,193 | 22,550 / 8,500 |
| Heatmap + core | 24,918 / 9,464 | 25,742 / 9,770 | 25,363 / 9,665 | 26,186 / 9,972 |
| All 89 families / 94 files | 1,234,019 / 413,714 | 1,234,843 / 414,020 | 1,260,299 / 427,212 | 1,261,122 / 427,519 |

Only Heatmap JS/CSS hashes change. CSS is 7,101 raw / 1,668 gzip bytes, previously
7,123 / 1,672. This closes a capability gap; it is not a gzip saving. Cumulative
S0 modular savings are now just 45 ESM / 36 classic gzip bytes.

| Field | Verification evidence |
| --- | --- |
| Type/build | `node scripts/build.mjs` passes TypeScript/declarations, generated API and unchanged payload gates. |
| Focused/distribution | `node node_modules/vitest/vitest.mjs run tests/heatmap.test.ts tests/heatmap-distribution.test.ts tests/calendar.test.ts tests/native.test.ts tests/element-directory.test.ts tests/core-distribution.test.ts tests/size-report.test.ts --maxWorkers=1`: 232/232 in 7 files. Covers data bounds, atomic failures, callback reentry/disconnect, authored content, native form neutrality, typed/JSON/pre-upgrade data, stable controls, reconnect and ESM/classic shared identity. |
| Preparation regression | After adding the offline/initialization guard, `node node_modules/vitest/vitest.mjs run tests/heatmap.test.ts tests/heatmap-distribution.test.ts --maxWorkers=1`: 77/77 in 2 files after rebuilding. Includes reentrant pre-upgrade descriptions in both distributions. |
| Integrated suite | With source and distribution held stable, `node node_modules/vitest/vitest.mjs run --maxWorkers=1`: 4,985/4,985 passed in 140 files, 489.16 seconds. An earlier run overlapped rebuilding and read stale/missing distribution files; that invalid run is superseded by this clean acceptance, not treated as a Radio regression. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,335 packed files, strict NodeNext types and runtime imports passed without installed ECharts; rerun after the final preparation guard passed. |
| Browser | `node scripts/browser-check.mjs --catalog --page=heatmap`: 6/6 on Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6, desktop/mobile, plus existing baseline workflows. Checks actual missing/zero cells, Enter/arrow/Ctrl+End navigation, stable focus, live settings/data, clamping, reconnect and 366-day rendering; rerun after the final preparation guard passed. Screenshots inspected; local evidence is `.vite/browser/s2-heatmap-results.json`. |
| Size | `node scripts/size-report.mjs --output .vite/size/s2-heatmap.json`, compared with `.vite/size/s2-upload.json`; S0 unchanged. |
| Limits | Data Table, Tree Select and S3-S6 remain open. No all-catalog or separate production-readiness acceptance claim. |
| Commit | `e1f2387` - `refactor: unify Heatmap element calendar behavior`. |

### S2 - Tree Select reconciliation, September 28, 2026

The canonical element now delegates to the native-selection controller using bounded
immutable hierarchy data. It no longer fabricates choices for unknown values, reduces
multiple selections to one string, or owns a competing clear/event engine. The inert
`checkable` flag and public factory/controller exports are removed. Typed or JSON
`options`, independent `value`/`defaultValue`, and typed/JSON path `settings` expose the
required behavior through `m-tree-select`; no native HTML authoring is needed.

The first integration retained a hidden native tree and parsed it back into hierarchy
data. Its ESM closure exceeded 13,000 bytes (13,368 initially; 13,205 after small local
simplifications). That round trip is now removed, not moved to a hidden dependency:
one bounded data validator supplies the controller directly. Tree Select no longer
bundles `tree/hierarchy.ts` or `tree/source.ts`. Cascader and Tree are unchanged.
Native-source mutation fixtures were replaced by canonical data-update fixtures;
arbitrary authored native hierarchies are no longer a public input path.

Native select semantics, full-path labels, nonselectable groups, leaf/any selection,
literal filtering, composition, selected nonmatches, current/default independence,
unavailable defaults, custom validity, native forms/reset, clear cancellation and
cleanup remain. Data updates retain surviving native options and listeners. Reconnect
preserves controls/defaults and does not convert ancestor-derived disabled state into
an explicit permanent option override. Native option corruption still gates submission
until repaired; successful recovery now clears the stale error. Mode/path settings
require disconnection, matching the native controller's fixed-mode ownership contract.

| Selection (raw / gzip bytes) | Before ESM | After ESM | Before classic | After classic |
| --- | ---: | ---: | ---: | ---: |
| Tree Select entry | 21,748 / 7,139 | 18,276 / 6,288 | 22,287 / 7,375 | 18,815 / 6,525 |
| Tree Select + core + native-select | 34,630 / 12,167 | 31,158 / 11,316 | 35,573 / 12,566 | 32,101 / 11,716 |
| All 89 families / 94 files | 1,234,843 / 414,020 | 1,231,371 / 413,169 | 1,261,122 / 427,519 | 1,257,650 / 426,669 |

CSS changes from 3,308 / 840 to 3,098 / 802 raw/gzip bytes after removing obsolete
native-source indentation. Only Tree Select JS/CSS hashes change. No ceilings or
required dependency files change. Cumulative S0 modular savings are 896/886 gzip bytes.

| Field | Verification evidence |
| --- | --- |
| Type/build | `node node_modules/typescript/bin/tsc --noEmit`; `node scripts/build.mjs`: passed, including generated API and unchanged payload gates. |
| Focused/distribution | `node node_modules/vitest/vitest.mjs run tests/tree-select.test.ts tests/tree-select-element.test.ts tests/tree-select-distribution.test.ts tests/select.test.ts tests/popselect.test.ts tests/native.test.ts tests/element-directory.test.ts tests/core-distribution.test.ts tests/size-report.test.ts --maxWorkers=1`: 224/224 in 9 files. Includes ESM/classic pre-upgrade arrays, shared base, dependency closure, data snapshots, host events, native forms/reset, tamper recovery, bounded inputs and reconnect. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,335 packed files; strict NodeNext types and runtime imports pass without installed ECharts. |
| Browser | `node scripts/browser-check.mjs --catalog --page=tree-select`: 6/6 in Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at desktop/mobile viewports. Native choice, submit/reset, keyboard clear/focus, multiple filtering, disabled state and data/reconnect identity pass. Screenshots inspected; local evidence is `.vite/browser/s2-tree-select-results.json`. |
| Size | `node scripts/size-report.mjs --output .vite/size/s2-tree-select.json`, compared with `.vite/size/s2-heatmap.json`. S0 remains frozen. |
| Limits | Data Table and remaining S3-S6 work remain open. No new full-suite/all-catalog or separate production-readiness acceptance claim. |
| Commit | `3ce5ad2` - `refactor: unify Tree Select around bounded hierarchy data`. |

### Data Table integration experiment - not accepted

A local prototype mapped bounded typed columns/rows onto the existing native
controller, including sorting/filtering, paging, scoped named checks, summaries,
native defaults/reset and keyed row updates. It removed the public factory and
the inert element pagination flag. The existing 71 source tests passed after
canonical fixture updates, but that does not establish full acceptance.

The first build failed at 10,250 ESM entry gzip bytes against its unchanged 9,000
per-file ceiling; the stricter 10,000 core-inclusive ceiling leaves less room.
Consolidating duplicated initial/runtime anatomy checks produced an in-memory
10,080-byte ESM diagnostic, still well above the allowed closure. No ceiling was
changed, no checks were removed to force a pass, and no mandatory bytes were
moved to another entry.

The experiment was mechanically reversed only for its four Data Table files,
restoring the prior source/tests. A generated local patch is retained at
`.vite/size/data-table-integration-prototype.patch`, based on `f5b43ef`; it is
ignored diagnostic work, not a published or accepted implementation. Its row
rollback, schema replacement, callback/reconnect/defaults paths still need dedicated
element/distribution/browser tests even after a smaller design is established.

Next Data Table work must simplify the combined renderer/controller structure
before integrating it under the existing ceilings. Do not reapply the prototype
and call the family complete merely because its focused tests pass.

### S2 - Data Table reconciliation

The rejected prototype above is superseded, not reapplied. `m-data-table` now accepts
bounded immutable typed/JSON records and labelled columns. One internal controller
computes filters, stable sort, pages and synchronous summaries before DOM mutation;
callbacks consume records rather than native rows. The renderer passes explicit native
references to that owner, eliminating the prototype's native-row parsing/rollback work.
The public factory and inert `pagination` flag are removed.

Sorting, literal/custom filtering, summaries, page/filtered/all selection, disabled
protection, hidden successful controls, native defaults/reset, cancellation, callback
reentry/disconnect and tamper checks remain. Keyed updates retain surviving rows, unchanged
cell edits/listeners and focus. Reconnect preserves reset defaults and clamps retained
pages after offline data shrink. Schema replacement is disconnected-only. Portable demo
examples use `m-*`; the renderer owns all table/control HTML.

The browser checks exposed reset ordering: microtasks can precede native form restoration.
Reset now uses a tracked next-task callback canceled on disconnect. Final validation also
rejects sparse schema arrays and unsupported schema/column/summary/sort fields.

| Selection (raw / gzip bytes) | Before ESM | After ESM | Before classic | After classic |
| --- | ---: | ---: | ---: | ---: |
| Data Table entry | 23,662 / 7,949 | 22,922 / 8,239 | 23,989 / 8,099 | 23,250 / 8,407 |
| Data Table + core | 27,174 / 9,372 | 26,434 / 9,662 | 27,625 / 9,571 | 26,886 / 9,879 |
| All 89 families / 94 files | 1,231,371 / 413,169 | 1,230,631 / 413,459 | 1,257,650 / 426,669 | 1,256,911 / 426,977 |

CSS remains 12,313 raw / 2,188 gzip bytes. No dependency or ceiling changes.
Cumulative S0 savings are 606/578 gzip bytes; closing capability gaps is not claimed as
a large modular size reduction.

| Field | Verification evidence |
| --- | --- |
| Type/build | `node scripts/build.mjs`: TypeScript, declarations, API generation and unchanged payload gates pass. |
| Focused/distribution | `node node_modules/vitest/vitest.mjs run tests/data-table.test.ts tests/data-table-distribution.test.ts tests/native.test.ts tests/element-directory.test.ts tests/core-distribution.test.ts tests/size-report.test.ts --maxWorkers=1`: 137/137 in 6 files. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,335 files; strict NodeNext types and packed runtime imports pass without installed ECharts. |
| Browser | `node scripts/browser-check.mjs --catalog --page=data-table`, 6/6 in Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6, desktop/mobile; keyboard sorting, paging, checks, actual submission/reset, filtering, data updates and reconnect. Screenshots inspected. Rerun after final validation changes also passes 6/6. |
| Size | `.vite/size/s2-data-table.json`, compared with `.vite/size/s2-tree-select.json`; S0 remains frozen. |
| Limits | S3-S6 and separate production-readiness gates remain open. No new full-suite or all-catalog acceptance claim. |
| Commit | `4b593b8` - `refactor: unify Data Table around transactional records`. |

### S3 - Local mechanics and Dropdown

S2 already removed duplicate engines/setter paths, stale caches, aliases and repeated
DOM reconstruction in the listed families. Tags/Input retain distinct authored/generated
action handling where ownership differs; forcing one handler would lose those boundaries.
Calendar/Tree/Data Table preparation guards and Upload's ignored-abort ownership remain
required checks, not candidates for deletion. These families retain one behavior owner.

Dropdown now maps text and passive `m-*` content to stable native trigger/actions.
`href`, `target` and `download` map navigation; unsafe URI schemes are rejected.
Submenus remain separate from their buttons. Native action adoption remains an explicit
Web escape, with one clearly marked demo. Original labels/listeners, disabled destinations,
native activation/default cancellation, keyboard/typeahead, submenu focus and reconnect
are retained. The canonical element alone observes menu mutations; the controller no longer
duplicates that observer. Passive-content and timing checks are shared locally, and
reconfiguration reuses the already validated direct element properties.

| Selection (raw / gzip bytes) | Before ESM | After ESM | Before classic | After classic |
| --- | ---: | ---: | ---: | ---: |
| Dropdown entry | 40,998 / 12,627 | 41,812 / 12,906 | 41,112 / 12,716 | 41,930 / 12,990 |
| Dropdown + core | 44,510 / 14,050 | 45,324 / 14,329 | 44,748 / 14,188 | 45,566 / 14,462 |
| All 89 families / 94 files | 1,230,631 / 413,459 | 1,231,445 / 413,738 | 1,256,911 / 426,977 | 1,257,729 / 427,251 |

CSS remains 5,816 / 1,804 raw/gzip bytes. This closes a portable-authoring gap rather
than claiming a gzip saving. Initial oversized builds were rejected by the unchanged
13,000-byte entry gate; no budget or dependency changes were made.

| Field | Verification evidence |
| --- | --- |
| Build | `node scripts/build.mjs`: passes all existing gates and generated API/declarations. |
| Focused | `node node_modules/vitest/vitest.mjs run tests/dropdown.test.ts tests/demo-index.test.ts tests/popover.test.ts tests/core-distribution.test.ts tests/size-report.test.ts --maxWorkers=1`: 235/235 in 5 files. |
| Consumer | `node scripts/package-check.mjs`: 95 JS entries / 2,335 files; strict NodeNext and packed runtime checks pass. |
| Browser | `node scripts/browser-check.mjs --catalog --page=dropdown`: 6/6 in three engines and both viewport sizes. Exercises real mapped controls, disabled-item skipping, submenu arrows/Escape, selection, late items and reconnect. Initial sequencing failures were fixed by waiting for actual native focus. Screenshot review then exposed a real WebKit mobile nested-anchor offset bug: submenu geometry could be above the viewport despite successful focus. Nested menus now use the existing measured positioning path. The final rerun adds viewport geometry assertions and passes 6/6; corrected screenshots inspected. |
| Final focused rerun | The focused command above plus `tests/size-sharing.test.ts`: 236/236 in 6 files after the nested-positioning fix. |
| Size | `.vite/size/s3-dropdown.json`; S0 remains frozen. |
| Limits | Full integrated acceptance and optional aggregate delivery remain S5-S6 work. |
| Commit | `9cca697` - `refactor: map Dropdown actions and consolidate canonical refresh`. |

### S4 - Explicit sharing evaluation

`node scripts/size-sharing.mjs` repeats six bounded extraction experiments in both
formats, using the production shared-core bridges, source-map comments, preserved public
exports and level-9 gzip. It writes only ignored diagnostic evidence; it never changes
source, `dist`, manifests or S0. `scripts/build-boundaries.mjs` is a tooling extraction
of the unchanged build plugin, not a production dependency.

Repeated-source counts after S3 are position/owned writes 28, popover controller 5,
hierarchy 2, dialog native 3, and dynamic collection 2. The report also compares
Grid, Dropdown, floating controls, hierarchy, collections and dialog groups, with each
shared dependency counted once.

| Candidate | Combined ESM gzip delta | Combined classic gzip delta | Single-consumer increase ESM / classic | Decision |
| --- | ---: | ---: | --- | --- |
| Owned writes only | -6,244 | -5,661 | 164..211 / 414..464 | Reject: Grid/Flex/Dropdown and other classic ceilings fail. |
| Full positioning | -9,937 | -9,216 | 308..1,340 / 563..1,611 | Reject: simple layouts would load positioning; many ceilings fail. |
| Popover controller | -10,302 | -10,027 | 617..1,796 / 867..2,037 | Reject: every consumer exceeds its runtime ceiling. |
| Hierarchy | -701 | -370 | 524..565 / 818..852 | Reject: Tree and Cascader exceed their ceilings. |
| Native dialog | -2,578 | -2,271 | 488..841 / 741..1,103 | Reject: classic Dialog exceeds 8,500. |
| Dynamic collections | -4,016 | -3,761 | 443..1,173 / 677..1,418 | Reject: Input and Tags exceed their ceilings. |

These are independent experiments, not additive savings or shipped costs. The
evaluation deliberately accepts no new modular runtime entry. Consequently there are
no new manifest dependencies, classic ordering requirements, package exports or demo
loading changes to reconcile. Existing source ownership, five shared boundaries and
all ceilings remain intact. The optional S5 aggregate can deduplicate these owners
inside one file without penalizing existing cold selected-component loads.

`tests/size-sharing.test.ts` verifies all 12 reports, preserved outputs and the frozen
baseline. It passed in the final 236-test focused run alongside Dropdown/core/size
checks. Evidence: `.vite/size/sharing.json`; it must be regenerated after later changes.

Commit: `9e82f95` - `build: evaluate explicit sharing against cold-load budgets`.

### S5 - Optional full-catalog distribution, September 28, 2026 (UTC)

`src/all.ts` composes all 89 existing family entries through collision-free namespaces,
without moving or duplicating their implementations. The public entries are
`@dataengine/markup-ui/all`, `./all/classic.js` and `./all/style.css`; ESM declarations
retain the same namespaces, such as `all.dataTable.DataTable`. Classic exposes
`MarkupUIAll`. The existing root facade keeps its name and separate purpose.

Source bundling emits shared local mechanics once inside the aggregate. Core and the
Chart adapter stay external, preserving the sole base class and engine configuration
owner. Native field helpers are included, not additional aggregate dependencies.
Root foundation, state/query, plugins, themes and ECharts remain separate selections.
Selected entries never import the aggregate, and no existing ceiling is increased.

Mixing the aggregate with selected families or another full runtime is explicitly
unsupported. A static preflight rejects any occupied catalog tag before registering
anything. Build tooling obtains the 203 tags from TypeScript source declarations,
not generated demo metadata. Selected entries now consistently call the existing strict
registration API rather than silently skipping foreign constructors. Importing the
same ESM URL still uses normal module caching.

| Selection | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| Aggregate ESM entry | 1,137,969 | 312,385 |
| Aggregate ESM + core + Chart adapter | 1,141,872 | 314,066 |
| Aggregate classic entry | 1,128,402 | 310,523 |
| Aggregate classic + core + Chart adapter | 1,132,907 | 312,492 |
| Complete aggregate component CSS | 418,612 | 63,150 |

The new aggregate-only JS entry/runtime ceiling is 315,000 gzip bytes per format;
CSS has a separate 64,000-byte ceiling. Initial provisional 300,000/60,000 gates
failed and were replaced with these measured new-entry gates, not changes to existing
component budgets. The complete runtime saves 99,446 ESM / 114,530 classic gzip bytes
(24.05% / 26.82%) versus selecting the current entire modular catalog.
This is not a recommendation to load the catalog for a small component selection.

The initial 15-file focused run passes 791/791 tests, including 93 aggregate delivery
tests. Coverage includes every family's classic mixing in both orders, atomic rejection,
ESM loading orders/cache identity, namespace/tag completeness, shared core/adapter/root
identity, source-map boundaries and packed type/asset exports. Ownership-copy tests now
import isolated passive controllers rather than resetting registered constructor graphs;
the competing-owner checks remain intact. Discrete fixtures import Message's passive
owner instead of mixing source registration with their built demo entry.

`node scripts/package-check.mjs` passes 96 JS entries / 2,344 packed files, strict
NodeNext checking and separate modular/aggregate runtime processes without installed
ECharts. After the reset correction below, the final three-file Tree Select/aggregate/core
distribution run passes 106/106. `node scripts/browser-check.mjs --catalog` passes
588/588 catalog checks and all six engine/layout workflows, including both aggregate
formats. Final integrated evidence is recorded in S6. The aggregate browser
fixture uses portable `m-*` controls and real renderer-owned FormData/reset, Data Table
sorting/reconnect, Dropdown keyboard selection and application-supplied Chart rendering
in both ESM and classic modes.

Commit: `99ab5a6` - `build: add optional full-catalog distributions`.

### Integrated Tree Select reset correction

The first complete catalog run passed 586/588 checks and exposed a real Chromium
reset/clear race, not a test timeout to waive. A delayed reset refresh incremented
the action generation and discarded a newer clear click. A deterministic source
regression reproduced the failure. Deferred reconciliation now preserves that
generation; the reset event itself still invalidates older actions. Canceled clears,
later explicit writes, reverse reset ordering and disconnect protections remain.

Three new source regressions and both distribution formats cover this ordering.
The four-file Tree Select/Select/Popselect run passes 161/161; the three-file
distribution rerun passes 106/106. A local Chromium reproducer passes 12 consecutive
reset/keyboard-clear sequences, followed by the clean 588/588 catalog run.
Browser failures now retain stack traces and screenshots instead of only messages.
Commit: `ec9cae4` - `fix: preserve Tree Select actions after native reset`.

Tree Select entries are now 18,285 / 6,299 ESM and 18,824 / 6,534 classic raw/gzip
bytes; full closures are 31,167 / 11,327 and 32,110 / 11,725. This adds 11/9 gzip
bytes to its earlier record. CSS and dependencies are unchanged; every existing
ceiling still passes. S5's measurements above include this correction.

### S6 - Integrated acceptance, September 29, 2026

S0-S6 are complete on Windows / Node 22.12.0 at source checkpoint `99ab5a6`.
The final suite held source and distribution stable after the Tree Select correction.
The repeated build then produced identical measured assets, not a different untested
runtime. S0 remains frozen.

| Check | Final evidence |
| --- | --- |
| Type/build | `node scripts/build.mjs` passes TypeScript/declarations, generated API and every payload gate. A repeated build matches all 296 measured file hashes, raw/gzip costs, exports and budgets against `.vite/size/s6-before-rebuild.json`. |
| Integrated suite | `node node_modules/vitest/vitest.mjs run --maxWorkers=1 --reporter=default --reporter=json --outputFile=.vite/size/s6-tests.json`: 5,085/5,085 passed in 145 files; zero failed, skipped or todo tests. |
| Packed consumer | `node scripts/package-check.mjs`: 96 JS entries / 2,344 files; strict NodeNext declarations, exports/assets and isolated modular/aggregate runtime processes pass without installed ECharts. |
| Browser matrix | `node scripts/browser-check.mjs --catalog`: 588/588 across 98 pages in Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at 1280x900 and 375x812; all six workflow combinations pass, including ESM and classic aggregates. |
| Changed-family interactions | Tags/Input, Calendar, Tree/Cascader/Tree Select, Upload, Heatmap, Data Table and Dropdown exercise actual native controls, keyboard/focus, updates, forms/reset, cancellation and reconnect as applicable. Source/distribution tests retain pre-upgrade, ownership and cleanup assertions. |
| Visual review | Final aggregate desktop/mobile screenshots, corrected Tree Select clear state and WebKit mobile submenu bounds were inspected. Earlier family records retain their scoped screenshot evidence. |
| Reconciliation | Architecture/source/delivery, demo setup/generated API, changelog and production evidence agree. Full/catalog imports remain optional and portable authoring stays `m-*`; native HTML is a renderer concern or explicit Web escape. |

The earlier 5,082-test success preceded the reset correction; it is superseded by
the 5,085-test result above. The first aggregate integration run's obsolete fixture
failures and the initial 586/588 browser result are not treated as passing acceptance.
The final reports are `.vite/size/s6-tests.json`, `.vite/size/s6-final.json`,
`.vite/package/results.json`, `.vite/browser/results.json` and
`.vite/browser/catalog-results.json`; these are generated evidence, not runtime assets.

Human accessibility/real-device/input-mode acceptance, non-Web renderers, structural
binding scope, remaining retained-root contracts, independent security/performance
review, Chart release-budget approval and clean remote CI remain separate gates in
[production readiness](09-production.md). No pushing, publishing or production approval
is implied by this completed workstream.

#### Final measurements

`node scripts/size-report.mjs --output .vite/size/s6-final.json` measures the actual
final files against the unchanged S0 baseline. All pairs below are minified raw /
level-9 gzip bytes; `->` means S0 to final. CSS, source maps, declarations and the
application-owned engine are not hidden inside these JavaScript figures.

| Family entry | ESM S0 -> final | Classic S0 -> final |
| --- | --- | --- |
| Dynamic Tags | 39,093 / 11,699 -> 34,702 / 10,968 | 39,323 / 11,845 -> 35,033 / 11,112 |
| Dynamic Input | 22,181 / 7,243 -> 21,767 / 7,361 | 22,515 / 7,389 -> 22,100 / 7,515 |
| Calendar | 25,560 / 9,051 -> 25,375 / 8,931 | 25,883 / 9,208 -> 25,697 / 9,097 |
| Tree | 32,651 / 10,088 -> 32,441 / 10,352 | 32,966 / 10,255 -> 32,751 / 10,515 |
| Cascader | 30,746 / 10,199 -> 30,864 / 10,362 | 31,069 / 10,367 -> 31,185 / 10,527 |
| Upload | 25,792 / 8,993 -> 25,799 / 9,366 | 26,122 / 9,152 -> 26,125 / 9,525 |
| Heatmap | 22,443 / 8,430 -> 22,230 / 8,347 | 22,764 / 8,583 -> 22,550 / 8,500 |
| Tree Select | 21,828 / 7,179 -> 18,285 / 6,299 | 22,367 / 7,416 -> 18,824 / 6,534 |
| Data Table | 23,662 / 7,949 -> 22,922 / 8,239 | 23,989 / 8,099 -> 23,250 / 8,407 |
| Dropdown | 40,998 / 12,627 -> 41,812 / 12,906 | 41,112 / 12,716 -> 41,930 / 12,990 |

| Complete family runtime | ESM S0 -> final | Classic S0 -> final |
| --- | --- | --- |
| Dynamic Tags | 42,605 / 13,122 -> 38,214 / 12,391 | 42,959 / 13,317 -> 38,669 / 12,584 |
| Dynamic Input | 25,693 / 8,666 -> 25,279 / 8,784 | 26,151 / 8,861 -> 25,736 / 8,987 |
| Calendar | 29,072 / 10,474 -> 28,887 / 10,354 | 29,519 / 10,680 -> 29,333 / 10,569 |
| Tree | 36,163 / 11,511 -> 35,953 / 11,775 | 36,602 / 11,727 -> 36,387 / 11,987 |
| Cascader | 34,258 / 11,622 -> 34,376 / 11,785 | 34,705 / 11,839 -> 34,821 / 11,999 |
| Upload | 29,304 / 10,416 -> 29,311 / 10,789 | 29,758 / 10,624 -> 29,761 / 10,997 |
| Heatmap | 25,955 / 9,853 -> 25,742 / 9,770 | 26,400 / 10,055 -> 26,186 / 9,972 |
| Tree Select | 34,710 / 12,207 -> 31,167 / 11,327 | 35,653 / 12,607 -> 32,110 / 11,725 |
| Data Table | 27,174 / 9,372 -> 26,434 / 9,662 | 27,625 / 9,571 -> 26,886 / 9,879 |
| Dropdown | 44,510 / 14,050 -> 45,324 / 14,329 | 44,748 / 14,188 -> 45,566 / 14,462 |

Dependencies are counted once per selection, including native-select for Tree Select.
The other changed S2/S3 families still need only core plus their local entry.

| Representative selection | ESM S0 -> final | Classic S0 -> final |
| --- | --- | --- |
| Grid + core | 8,048 / 2,872 -> 8,048 / 2,872 | 8,283 / 2,999 -> 8,283 / 2,999 |
| Dynamic Input + Tags + core | 64,786 / 20,365 -> 59,981 / 19,752 | 65,474 / 20,706 -> 60,769 / 20,099 |
| Tree + Cascader + Tree Select + dependencies | 98,107 / 32,494 -> 94,472 / 32,041 | 99,688 / 33,229 -> 96,046 / 32,767 |
| Popover + Tooltip + Dropdown + core | 79,164 / 26,009 -> 79,978 / 26,288 | 79,923 / 26,462 -> 80,741 / 26,736 |
| All modular families, 94 files | 1,240,182 / 414,065 -> 1,230,874 / 413,512 | 1,266,374 / 427,555 -> 1,257,163 / 427,022 |
| Optional aggregate + dependencies, 3 files | New: 1,141,872 / 314,066 | New: 1,132,907 / 312,492 |

The cumulative modular saving is only 553 ESM / 533 classic gzip bytes, despite
9,308 / 9,211 fewer raw bytes. Required capability/portability fixes account for
the documented increases; this is not a large single-component size reduction.
The aggregate saves 24.05% / 26.82% against the final all-modular selection, but remains
optional. Existing tight ceilings remain: one byte for Cascader classic runtime and
Calendar CSS, three bytes for Upload classic runtime, thirteen for Input/Tree classic.

All modular CSS is 418,524 raw / 101,131 gzip bytes across 89 files, compared with
417,965 / 100,944 at S0. The aggregate stylesheet is 418,612 / 63,150; its raw size
includes separators and its gzip cost benefits from compression across one file.
Per-family CSS costs remain in the family records and the final report.
The demo's selected application-owned ECharts engine is separately 594,547 / 203,661
ESM or 594,949 / 203,838 classic. Actual applications must account for their engine
selection; the optional bundle does not eliminate that cost.

The report deliberately flags removed factory exports and capability-related growth.
No claim is made that strict `--check-regressions` against the old API passes.
Existing budget checks do pass; S0 was not rewritten to hide API or payload changes.
