# MarkupUI session handoff

Snapshot: September 30, 2026, Asia/Shanghai. Verification below was recorded
September 29, 2026 UTC during the same local session.
Workspace: `D:\repos\MarkupUI`; Windows / PowerShell / Node 22.12.0.
Base HEAD before this checkpoint commit: `2384748`.

The user authorized updating documentation and committing the accumulated implementation,
tests, demos and size-policy changes. This handoff accompanies that local commit; use
`git log -1` for its revision. No push or publication is authorized.
This snapshot is not architecture authority or production release approval.

## Start here

Read `AGENTS.md`, then:

1. [Source ownership](docs/architecture/06-source.md).
2. [Core and component delivery](docs/architecture/07-modules.md).
3. [Relevant element contracts](docs/elements/README.md).
4. [Component development](docs/elements/04-development.md).
5. [Current release work order](docs/architecture/09-production.md#work-order).
6. [First-five evidence](docs/architecture/09-production.md#first-five-checkpoint).
7. [Binding delivery status](docs/binding/05-delivery-plan.md#implementation-checkpoint).

## Current progress

The first five requested workstreams have bounded implementation and local verification.
Their remaining release gates are not automatically approved by passing local tests.

| Workstream | Completed | Remaining |
| --- | --- | --- |
| Portable conditions | Box-owned `If` / `m-if`, nested scopes, strict Boolean paths, exact root-local `focus-target`, models/actions/IDs, cleanup/rebind and demo. | No non-Web renderer or platform-neutral reusable definition is delivered. |
| Binding performance/resources | Repeated 0/1/100/1000-row measurements, batched fallback moves and Chromium forced-GC lifecycle checks. | Representative workload/latency targets, final-paint and process-memory/device measurements. |
| Retained root/plugin contracts | Bounded review of 15 root and 3 plugin tags; role/Spacer and captured primitive ownership fixes. | Full-family contract approval. |
| Interaction/accessibility | Three-engine keyboard, labels/forms, focus, synthetic composition, RTL, emulated forced colors and text scaling. | Real devices, screen readers, real IME, actual browser/OS zoom and high contrast. |
| Security and Chart | Plain-data boundary hardening, stale callback guard, dependency audit, SVG/canvas and engine-inclusive resource measurements. | Independent security review and approved Chart payload/performance targets. |
| Clean CI | Existing Windows/Linux/macOS x Node 22/24 workflow configuration retained. | Actual clean matrix results for the committed revision. |
| Release | Current scope, evidence and limitations documented. | Remaining gates, final rerun and explicit release authorization. |

There is no pending generic-condition implementation task. Portable ListTemplate,
reusable Web sources, paired IDs and scoped actions are also implemented.
S0-S6 size optimization is complete; do not restart it as unfinished extraction work.
Historical milestones remain in the production page, with their original measurements
and failures, rather than being repeated here as current status.

## Implementation map

- `src/state/{binding,scope,templates,ids,data,changes}.ts`: one binding/reconciliation
  owner for scalar/models, strict conditions, stable-key collections, nested current-key
  writes, reusable Web sources, paired IDs and lifecycle. Store notifications snapshot
  subscriptions. No generic property engine or runtime metadata is introduced.
- `src/components/list/template.ts`: portable inert source and native list chrome.
  List imports only core; state owns generated instances. `focus-on-remove` opts into
  surviving-list focus. Template-mode collections change through the bound store.
- `src/components/box/if.ts`: portable one-root condition source, using ordinary
  `.native` access and type-only recognition from state. False destroys the instance;
  true recreates it. Explicit Web `focusFallback` takes precedence over `focus-target`.
- Box `native-content.ts` and `primitives.ts`: adopt captured native shells/summary
  rather than nesting labels or disclosures. An actual browser label-click failure
  drove this fix; preserve the regression.
- `src/actions/index.ts`: typed `m-arg-*` reads from an explicit live binding.
  Literal `m-param-*`, nested event ownership, sync/async errors and App initialization
  cleanup are covered. Actions remain in the optional root facade.
- Root and plugin owners: authored roles/data-role and Spacer flex survive reconnect;
  DataGrid/Chart reject accessor/symbol/custom-prototype arrays before iteration.
  Chart projects own cells only and rejects stale renderer selection callbacks.
- `scripts/size-policy.mjs` and existing build/report/tests: size overages warn,
  while invalid measurements and functional failures remain errors.
- `scripts/browser-acceptance.mjs`, `browser-templates.mjs`, existing browser/package
  harnesses, and new binding/condition/list tests provide reproducible local coverage.

Read the [template contract](docs/binding/03-templates.md) and
[action contract](docs/binding/06-actions.md) before extending them. Native source
descendants may briefly connect before capture. Plain-data validation is not a sandbox
for hostile Proxies or modified built-ins. No atomic DOM rollback or general async
action cancellation is promised.

## Recorded verification

| Check | Result |
| --- | --- |
| Typecheck/build | Passed; nine advisory size warnings, no new runtime entry/dependency. |
| Focused suite | 589/589 in 18 files, including 46 portable-condition cases. |
| Full suite | 5447/5447 in 153 files, two workers, 280.42 seconds; no failures/skips/todos. |
| Packed consumer | 96 JS entries / 2372 files; strict NodeNext and modular/aggregate workflows without installed ECharts. |
| New browser acceptance | 12 condition/resource combinations, six plugin/Chart checks and six actual Box demo checks passed. |
| Existing browser regressions | Three engines/two layouts; template/source/ID/action/root/aggregate/Form/primitive/plugin/Chart/HTML-policy checks passed. |
| Audit | Zero advisories across 167 reported dependencies; not an independent security audit. |
| Integrity | 296/296 asset hashes, 251 documentation links/anchors and whitespace checks passed at the implementation checkpoint. |

Browsers: Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6.
Viewports: 1280x900 and 375x812. Screenshots were inspected. The 588 catalog checks
remain the earlier retained-root result; no new full catalog sweep is claimed.
The in-app browser failed to connect on environment metadata; repository Playwright
provided this evidence. Mobile-sized headless windows are not physical devices.

The first full run passed 5446/5447 because the old root CSS hash rejected the intentional
Spacer rule. The corrected test asserts that exact rule and checks all remaining CSS
against the original hash; the final full rerun above passed. Preserve initial failures.

This closing documentation pass does not change runtime/build/test code or rerun the
full suite/browser matrix. It verified 301 local links/anchors across 22 changed Markdown
files, saved passing test/browser/audit evidence, all 296 current asset hashes, frozen S0
and `git diff --check` using the repository's normal line-ending settings.

### Resource observations

Five repetitions per template configuration showed WebKit 1000-row reorder medians
improving from 1298-1338 to 267-297 ms for native conditions and from 1503-1688 to
282-385 ms for portable conditions. The existing fallback path batches contiguous
moves while retaining already-positioned nodes and preferring native `moveBefore`.
These large updates still are not frame-budget operations.

Chromium 30 x 100-row mount/toggle/dispose cycles retained 196 nodes and 45 listeners
before/after in both layouts; used heap changed by +15,112 / +3,004 bytes after forced GC.
This does not establish general leak freedom or process-memory acceptance.

At 10000 Chart rows, SVG state-ready medians were 342.8-706 ms and synchronous refresh
151.2-292 ms; canvas was 43-222 ms and 24.4-93 ms. These are not final-paint or completed
progressive-rendering times. Disposal emptied renderer DOM; tables stayed at most
50 rows; SVG geometry and canvas pixels were nonblank.

### Dependency-inclusive sizes

Gzip bytes, deduplicated required files; CSS is separate:

| Selection | ESM | Classic |
| --- | ---: | ---: |
| State | 9083 | 9285 |
| Box including core | 4161 | 4345 |
| Bound If/Box plus state, before content | 13244 | 13630 |
| Conditional editor: Box/Input/Button/state | 23110 | 23762 |
| Minified root including core/state | 19156 | 19060 |
| Chart including core/adapter, excluding engine | 9174 | 9614 |
| Chart plus demo-selected ECharts 6.1.0 | 212835 | 213452 |
| Aggregate including core/adapter, excluding state/root/engine | 315370 | 313757 |

Separate CSS: Box 763, conditional selection 5020, Chart 403, root 1685, aggregate
63354 bytes. The selected demo engine alone costs 203661/203838 bytes.
Fifteen of 296 asset hashes changed against the scoped-action checkpoint; 281,
all numeric recommendations and frozen S0 were unchanged.
The current catalog is 89 selectable families / 205 tags.

## Evidence and reproduction

Generated evidence is local and ignored, not guaranteed in a fresh checkout:

- `.vite/size/first-five-{focused,full-tests,final,audit,integrity}.json`
- `.vite/package/first-five-results.json`
- `.vite/browser/first-five-final/acceptance.json` and screenshots
- `.vite/browser/first-five-regression/` for the original browser harness
- `.vite/browser/first-five/acceptance.json` for before-batching measurements
- `.vite/size/first-five-full-tests-initial.json` and
  `first-five-review-regressions.json` retain the initial failures.

Reports record pre-commit HEAD `2384748` because the tested implementation was then
uncommitted. That field is not proof that the old committed revision contains the new
behavior. The asset hashes and this closing commit identify the implementation checkpoint.

Run verification sequentially, choosing fresh output paths to preserve existing evidence:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node scripts/build.mjs
node node_modules/vitest/vitest.mjs run --maxWorkers=2 --reporter=default --reporter=json --outputFile=.vite/size/next-full-tests.json
node scripts/package-check.mjs
node scripts/browser-acceptance.mjs --output=.vite/browser/next-acceptance
node scripts/browser-check.mjs --page=plugins --output=.vite/browser/next-regression
node scripts/size-report.mjs --output .vite/size/next-final.json
pnpm audit --json
git diff --check
```

The size command uses frozen S0 by default; a local prior report may be selected with
`--baseline` for an incremental comparison. Do not use `--write-baseline`.
The package check writes `.vite/package/results.json`; preserve earlier evidence first.
Never overlap builds with distribution-reading tests, package checks or browsers.
Never edit source/tests during a full suite.

At the implementation checkpoint, verification processes had exited and the preexisting
preview server was left running at
`http://localhost:57912/demo/components/box.html#condition-heading`.
Recheck its port/process before relying on it in a later session.

## Boundaries and next session

- Use portable `m-*` authoring; native HTML belongs to the Web renderer or an explicit
  interoperability example. Non-Web renderers are not delivered.
- Preserve small core and independently selectable families/state/plugins. Aggregate
  is optional; do not introduce a mandatory aggregate or byte-budget-only shared chunk.
- Keep code in existing `src` owners, with direct typed properties and ordinary methods.
  API JSON is demo-only, not a runtime dependency.
- Byte recommendations are adjustable, not hard gates. Report complete dependency
  costs and warnings; never remove required behavior just to fit a recommendation.
- Frozen S0 SHA-256:
  `8362ea61301dc94271bd06aabb281ebbcd54256ac1f9133e60397b1d8e646094`.
- Preserve unrelated worktree changes. Current authorization covers this local closing
  commit only, not future commits, pushing or publication.

Next inspect `git status` and the closing commit, then use the production
[work order](docs/architecture/09-production.md#work-order). Prioritize agreed production
workloads and remaining resource measurements, full-family contract approval, real
assistive-technology/device acceptance, independent security review and clean CI.
Do not redo implemented portable conditions or infer human/independent approval from
local automation. Obtain explicit release authorization after the remaining gates.
