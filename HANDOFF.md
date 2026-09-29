# MarkupUI session handoff

Snapshot: September 29, 2026, Asia/Shanghai.
Workspace: `D:\repos\MarkupUI`; Windows / PowerShell / Node 22.12.0.
Base HEAD before the session-closing commit:
`d986aa6` (`docs: record completed size-optimization acceptance`).

This is a session snapshot, not the architecture authority or release approval.
Recheck the worktree and current documentation before continuing. The user requested
this handoff and an end to the current session; no further implementation is underway.
The user subsequently authorized committing all current changes before ending the
session. This handoff accompanies that local closing commit; use `git log -1` for
its revision. No push or publication was requested.

## Start here

Read `AGENTS.md`, then:

1. [Source ownership](docs/architecture/06-source.md).
2. [Core and component delivery](docs/architecture/07-modules.md).
3. [Relevant element contracts](docs/elements/README.md).
4. [Component development](docs/elements/04-development.md).
5. [Current tasks, evidence and release gates](docs/architecture/09-production.md).
6. [Completed optimization record](docs/architecture/10-size-optimization.md).
7. [Root lifecycle behavior](docs/api/01-core.md#optional-root-lifecycle).

## Nonnegotiable boundaries

- Public portable authoring uses `m-*`, including primitive HTML-equivalent elements.
  Native HTML semantics and controls belong to the Web renderer. Explicitly identified
  Web interoperability/fallback examples are exceptions, not the portable contract.
- Keep the small core, independently selected families and optional state/plugins.
  The aggregate is optional; selected components must not depend on it.
- Keep implementation in existing `src` owners. Use direct typed properties and
  ordinary methods, not runtime metadata lookup, decorators or a generic property engine.
- Generated API JSON is demo-only. Do not introduce compatibility aliases or restore
  removed public factories without an explicit contract change.
- Do not raise existing payload ceilings or rewrite the frozen S0 baseline.
- Preserve all existing worktree changes. Do not commit, push or publish without
  authorization. No production readiness is claimed.
- Active docs are authoritative; `docs/archive` is historical reference.

## Completed work

### Size optimization

S0-S6 are complete: reproducible measurement, registration dependency cleanup,
canonical behavior reconciliation, component-local simplification, sharing evaluation,
optional full-catalog delivery and local integrated acceptance.

S4 evaluated six sharing candidates and rejected them because cold single-component
budgets failed. This is a completed decision, not unfinished extraction work.

The catalog has 89 selectable families / 203 tags. ESM and classic are alternative
formats. Gzip measurements:

| Selection | ESM bytes | Classic bytes |
| --- | ---: | ---: |
| All modular families and required runtime files | 413,512 | 427,022 |
| Cumulative modular saving against S0 | 553 | 533 |
| Optional full catalog, including core and Chart adapter | 314,066 | 312,492 |

Aggregate CSS is separately 63,150 gzip bytes. The aggregate saves 24.05% / 26.82%
against loading all modular families, not against a small selection.
Application-supplied ECharts is excluded and remains an additional application cost.
Existing budgets pass; strict S0 `--check-regressions` is not claimed to pass because
intentional export removals and capability-related growth are recorded.

Recent commits:

- `d986aa6`: completed optimization acceptance record.
- `99ab5a6`: optional full-catalog distributions.
- `ec9cae4`: Tree Select reset reconciliation no longer discards a later clear action.

### Subsequent root fixes (included in the closing commit)

- Theme: clearing `name` releases owned tokens/marker; restores earlier values and
  priorities while preserving later application writes. Unknown themes validate
  before cleanup. Disconnect retains presentation; reconnect reconciles the name.
- Field: a real native label tracks late/replaced controls and ID/type changes,
  excludes nested Fields and disconnects its observer. No implicit family registration
  or overwrite of authored accessible names.
- AccordionItem: live `open`/`title` properties, stable native chrome and authored
  children, removable activation listener and correct reconnect behavior.
- App: pre-upgrade store assignment survives; bindings/actions share the same store.
  Acquired/assigned stores conflict with inline JSON; disconnect before replacing an
  active store.
- Root CSS: removed duplicate migrated-family styles. Root retains its own elements,
  shared tokens/layout utilities and scoped feedback styling. Selected families
  still need their own CSS.

Complete minified root runtime is 12,361 / 12,271 gzip bytes, below the unchanged
15,000-byte ceiling. External root CSS is 1,678 bytes. Only three root JS files and
root CSS changed among 296 measured files since S6; core, state, selected-family and
full-catalog assets remain byte-identical.

## Verification already recorded

September 29, 2026 local checkpoint:

| Check | Result |
| --- | --- |
| Typecheck/build | Passed; existing ceilings unchanged. |
| Integrated tests | 5,103/5,103 in 146 files, two workers; no failures, skips or todos. |
| Catalog | 588/588 checks, 98 pages. |
| Browser workflows | Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6; 1280x900 and 375x812. Root ESM/classic passed all six combinations. |
| Packed consumer | 96 JS entries / 2,344 files; strict NodeNext and modular/aggregate imports passed without ECharts installed. |
| Visual review | Desktop/mobile screenshots inspected in the implementation session. |

Local generated evidence (ignored files, not guaranteed in a fresh checkout):

- `.vite/root-lifecycle-tests.json`
- `.vite/root-lifecycle-tests-initial.json`
- `.vite/browser/results.json`
- `.vite/browser/catalog-results.json`
- `.vite/package/results.json`
- `.vite/size/root-lifecycle.json`
- `.vite/size/s6-final.json`

The initial root run passed 5,102/5,103: an obsolete Avatar assertion required
duplicate root CSS. It was corrected to check source/published Avatar defaults and
absence from root; the final full run passed. No failing runtime test was waived.

The browser skill setup failed because Node REPL lacked `sandboxPolicy`; the existing
repository Playwright harness completed the checks. Headless mobile-sized viewports
do not establish real-device or screen-reader acceptance.

The final documentation-only turn checked 14 added local links/Markdown anchors,
confirmed all 296 current measured asset hashes against the root report, and passed
`git diff --check`. It did not rerun the full suite or browser matrix.

To reproduce after implementation changes, run sequentially:

```powershell
node scripts/build.mjs
node node_modules/vitest/vitest.mjs run --maxWorkers=2 --reporter=default --reporter=json --outputFile=.vite/root-lifecycle-tests.json
node scripts/package-check.mjs
node scripts/browser-check.mjs --catalog
node scripts/size-report.mjs --output .vite/size/root-lifecycle.json
git diff --check
```

Do not run builds or the heavy browser matrix concurrently with the full suite.
Review evidence before overwriting it. No needed tool session or dev server is running.

## Changes included in the closing commit

Before this handoff, `git status --short` showed 22 tracked modifications and one
new test. The user authorized committing these changes together with this handoff.
No push is authorized; recheck `git status` before starting new work.

Runtime/build-test changes:

- `src/components/foundation.ts`
- `src/components/dynamic.ts`
- `src/components/styles.css`
- `src/components/styles.ts` (generated by build; do not hand-edit)
- `src/theme/index.ts`
- `scripts/browser-check.mjs`
- `tests/avatar.test.ts`
- `tests/native.test.ts`
- `tests/styles.test.ts`
- `tests/root-lifecycle.test.ts` (new, 18 tests)

Documentation changes:

- `CHANGELOG.md`
- `docs/README.md`
- `docs/api/01-core.md`
- `docs/architecture/README.md`
- `docs/architecture/04-rewrite.md`
- `docs/architecture/06-source.md`
- `docs/architecture/07-modules.md`
- `docs/architecture/09-production.md`
- `docs/architecture/10-size-optimization.md`
- `docs/binding/01-language.md`
- `docs/elements/README.md`
- `docs/elements/contracts/chart.md`
- `docs/styling/01-design.md`

This session additionally creates `HANDOFF.md`.
The documentation now distinguishes current implementation, recorded local acceptance
and remaining release work. It preserves S0/S6 historical measurements, records root
fixes/style ownership, corrects stale early-batch/browser status and removes the
obsolete claim that ViewElement owns runtime metadata access.

## Remaining release work

Production release remains blocked:

1. Resolve structural-binding scope and contract. Scalar/model binding is implemented;
   `data-if`/`data-each` explicitly reject use. Conditional/keyed templates, item/parent
   scopes, writable keyed routes and a proving collection consumer are not implemented.
   Template lookup, focus policy and consumer API need decisions. AvatarGroup is only
   a candidate, not an approved consumer.
2. Review remaining root/plugin/family contracts and portable-authoring/lifecycle
   acceptance. The four root fixes and DataGrid/Rating baselines do not approve every
   retained surface.
3. Complete real screen-reader/device/input-mode checks, including IME, RTL, forced
   colors and zoom.
4. Complete independent security/performance reviews and broader large-data, update,
   repeated lifecycle and memory acceptance.
5. Close Chart accessibility/resource acceptance and approve engine-inclusive payload
   and performance budgets. First-batch types, five source forms and selectable
   browser delivery are implemented; engine externalization is not budget approval.
6. Obtain actual clean Windows/Linux/macOS x Node 22/24 CI evidence. Workflow
   configuration and local Windows tests do not prove this matrix.
7. After remaining changes, rerun automated gates, reconcile release notes and obtain
   explicit release authorization. Pushing and publishing remain separate actions.

Non-Web renderers are not delivered; portable authoring does not imply otherwise.
No overall completion percentage or production-ready claim is justified.

## Recommended next session

First inspect `git status` and the session-closing commit; do not redo S0-S6 or discard
the root fixes. Use the production work order, starting with an explicit
structural-binding scope/contract decision. Read the binding design pages and current
`src/state/binding.ts` before implementing templates. Record each bounded change and
its evidence separately. The current commit authorization does not authorize future
commits, pushing or releasing.
