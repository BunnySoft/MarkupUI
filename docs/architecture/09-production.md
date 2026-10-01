# 9. Production readiness

Status: release blocked. A shared ViewElement base and successful build do not establish
production readiness. Every supported family needs evidence for its declared contract.

Current development priority remains functionality, coherent public APIs and architecture
first. On October 1 the user resumed the full session backlog and selected library-functional
acceptance. All 89 finite family reviews and the scoped implementation/consumer work are
complete. Production performance, real-device and publication approval are outside that
explicitly selected scope, not erased from release gates. Canonical elements and justified
native-Web interoperability retain one existing behavior owner, not a new controller framework.

Payload budgets are now adjustable recommendations under the
[September 29 size policy](07-modules.md#size-policy), not mandatory release thresholds.
Historical checkpoints below retain their original hard-budget results. Measurement
integrity, behavior, dependency boundaries and performance acceptance remain required.

## Task summary

Documentation reconciled October 1, 2026, Asia/Shanghai; earlier checkpoints retain
their original verification dates. After the local gates passed, the user explicitly
authorized a local closing commit of the completed work. Push, publication and release
approval remain unauthorized. See the [handoff](../../HANDOFF.md)
for implementation owners and reproduction commands.

| Workstream | Status | Remaining boundary |
| --- | --- | --- |
| Size recommendation policy | Implemented and locally verified | Exceeding an adjustable recommendation warns; measurement integrity and functional gates still fail on errors. |
| Size optimization S0-S6 | Complete | Six sharing experiments were rejected on cold-load budgets; this is the completed S4 decision, not deferred extraction work. |
| Selectable/full-catalog delivery | Implemented and locally verified | 89 families / 205 tags; the aggregate remains optional and ECharts application-supplied. |
| Retained root fixes | Implemented and locally verified | Root roles/Spacer and all 15 root / 3 plugin surfaces received a bounded review; blanket family contract approval remains open. |
| Binding and templates | Implemented and locally verified | Scalar/models, Web conditions/keyed DOM, portable ListTemplate/If, reusable Web sources, paired IDs and scoped actions work. Broader resource acceptance remains pending. |
| Portable authoring and lifecycle | Partially accepted | Reconciled families and root fixtures use `m-*` with renderer-owned HTML; full retained-surface approval is still open. Non-Web renderers are not delivered. |
| Browser and packed-consumer gates | Passed locally | Three engines/two layouts and isolated package consumption do not prove real-device, screen-reader or clean remote CI acceptance. |
| Chart | Implemented; release acceptance open | Accessibility/resource acceptance and engine-inclusive payload/performance approval remain. |
| Security and performance | Targeted checks recorded; review open | Independent review and broader large-data/update/memory acceptance remain. |
| Remote CI and release | Blocked | Obtain clean Windows/Linux/macOS x Node 22/24 results, rerun gates after remaining changes, reconcile release notes and obtain release authorization. |

### October 1 confirmed backlog closure

The user resumed the 122-task session backlog and explicitly selected existing library-level
function/API/architecture workflows instead of production workload/performance targets.
Five distinct candidates/fixes were added during closure; all 127 tasks are complete within
that confirmed scope. All 89 family review results are retained separately; finite static
review is not matching full dynamic coverage or blanket public-contract approval.
Three synchronous read-only scopes and the main session completed the remaining reviews,
without treating unavailable historical reports or test-coverage gaps as proven results/bugs.

Image fallback leaves configured src intact and exposes actual resource addresses through
events; private Thing marker reassignment is not a promised public region contract.
Those two candidates were excluded, not repaired by inventing new behavior.
NumberAnimation's reproducible stale timing was corrected under the explicitly approved
play-replay/resume/pause/reset contract: reconnect restarts and idle pause is inert.
The existing demo, generated API, packed declarations and fixture reflect that decision.
TreeSelect multiple value/default and Chart encode/direct-series sparse arrays now fail
before mutation. The three original regression failures remain available; no new test
file/project, controller framework, compatibility alias or production dependency was added.

Final TypeScript/build/API and 384 cases in 10 existing changed/direct-consumer fixtures
passed with four workers: `.vite/size/all-task-final-integrated-20261001.json`.
The actual offline-installed package passed strict NodeNext and modular/optional-aggregate
consumers with 96 JS entries / 2,384 files and no installed ECharts:
`.vite/package/results.json`. Its previous report remains
`.vite/package/before-all-task-closure-20261001.json`.

The existing browser harness passed Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6
in desktop/mobile-sized layouts. Each template/ListTemplate/source/paired-ID/scoped-action
matrix records 12 ESM/classic runs; six combined Chart/Form/plugin/root/aggregate/HTML-policy
workflow runs and six NumberAnimation demo checks passed. Results/screenshots are in
`.vite/browser/all-task-functional-20261001/`. This is neither a full-suite nor an 89-page
catalog sweep; incidental performance observations do not define accepted production targets.

The complete aggregate measures 333,023 / 331,539 gzip bytes including dependencies,
above the unchanged 315,000 recommendation. Overages warn and remain recorded; S0 and
Git configuration/newline policy are unchanged. No subsequent commit/push/publication occurred.
This completion resolves the user-selected development task list, not the independent
production release gates below.

### Subsequent local release-gate checkpoint

After the 127-task library-functional closure, the user selected local-release-gates.
The first complete suite recorded 5,752 passes and one failure: an obsolete Slider demo
consumer assertion required four m-slider elements with authored native inputs.
The existing fixture now distinguishes five portable single/range configurations from
the separate native-Web interoperability section, checking labels and readout ownership
without forcing renderer-owned input markup into portable examples. No runtime or demo
feature was removed or changed, and no test file/project was added.

The related fixtures passed 198 cases. The second complete suite passed 5,754 cases in
153 files, four workers, zero failures/pending, in 171.41 seconds:
`.vite/size/local-release-full-suite-verified-20261001.json`. Initial failures remain
in `.vite/size/local-release-full-suite-20261001.json`; focused follow-up is
`.vite/size/local-release-slider-consumer-20261001.json`.

Seven direct development dependencies agree across manifest, lockfile and installed tree;
there are zero mandatory runtime dependencies. No install/restore or lockfile change occurred.
The existing measurement reporter verified 296 runtime/CSS file measurements, JS hash/
metafile integrity, bytes/gzip and dependency closure:
`.vite/size/local-release-integrity-20261001.json`. Its 61 overages remain advisory;
recommendations and frozen S0 are unchanged. The seven changed Markdown files passed 171
inline local target/active-anchor checks in
`.vite/size/local-release-consistency-20261001.json`; external links and archived anchors
were not checked. Current packed evidence remains valid because shipped runtime/package
outputs did not change during this follow-up.

The three gate tasks plus one distinct consumer correction complete all 131 pre-commit
verification tasks. The user subsequently authorized committing the completed work locally.
This checkout-level Windows / Node 22.12.0 result is not a clean-install matrix,
independent security/dependency-advisory review, real-device acceptance or release approval.
The release gates below remain independent. Pre-closing HEAD was abbd4a7; the new local
commit does not authorize or perform a push/publication.

The portable List checkpoint below extends the Web-template and data-only foundations.
The 588 passing catalog checks remain the retained-root browser checkpoint; the template
work adds targeted three-engine template/root workflows, not a new full catalog run. Older checkpoints
retain their original counts and limitations; they are not current failures or blanket
approvals. The detailed [work order](#work-order) tracks the remaining release tasks.

## Release gates

- [ ] Clean, reproducible install, typecheck, build and full test suite on supported Node
  versions. No unexplained failures, unhandled errors or skipped acceptance tests.
- [ ] Every shipped family has an approved contract and matching implementation, generated
  API documentation and working examples. Experimental or deferred features are identified.
- [ ] Resolve structural-binding release scope explicitly, then implement and validate
  the agreed contract or obtain an explicit scope decision. Scalar/model binding alone
  does not complete the planned template runtime.
- [ ] Public examples use the cross-platform `m-*` vocabulary. Native HTML is confined to
  the Web renderer and explicitly Web-specific interoperability/fallback examples.
  Primitive renderers provide real semantics; renaming tags or forwarding clicks is not
  sufficient. Tests validate both portable source markup and platform output.
- [ ] Deliver and validate [Chart (`m-chart`)](../elements/contracts/chart.md) with an optional
  Apache ECharts Web renderer, ECharts-shaped declarative configuration, all first-batch
  chart types and all five data-source forms. Chart is required before release, not deferred.
- [ ] Keyboard, native labels/forms, focus recovery and screen-reader behavior are verified.
  Include disabled/readonly states, IME, RTL, reduced motion, forced colors and zoom.
- [x] Representative workflows pass in Chromium, Firefox and WebKit on desktop and mobile
  layouts. Record actual browser versions and evidence; JSDOM is not browser acceptance.
- [ ] Lifecycle tests cover pre-upgrade writes, reconnect, cancellation, stale async work
  and release of listeners, observers, timers and resources without losing authored state.
- [ ] Security review covers HTML/URL handling, dynamic content, unsafe sinks and applicable
  CSP behavior. Dependency audit findings are triaged; zero runtime dependencies is not a
  substitute for review.
- [x] An actual packed package installs in a clean consumer. Exports, declarations, assets,
  ESM/classic loading and shared-core identity work without repository-only files.
- [ ] Dependency-inclusive payload measurements and recommendation changes are reviewed; large-data interactions and
  repeated mount/unmount workflows have measured performance and memory results.
- [ ] CI enforces automated gates. Release notes describe API changes, supported
  environments and capability limitations. No legacy migration or compatibility code
  is required for this development-stage library. Publishing is a separate,
  explicitly approved action.

## Current evidence

### First Five Checkpoint

September 29, 2026 UTC, local Windows / Node 22.12.0. The user authorized the first
five remaining workstreams, not publication or external acceptance. The bounded results
below distinguish implementation from release approval.

| Workstream | Completed in this checkpoint | Still open |
| --- | --- | --- |
| Portable conditions | Box-owned `If` / `m-if`, strict paths/shape, nested scopes, reusable Web sources, focus targets, models/actions/IDs, cleanup/rebind and live demo/API. | Non-Web renderers and platform-neutral reusable definitions are not supplied. |
| Binding resources | Repeated 0/1/100/1000-row measurements; reproduced WebKit slow reorder and batched contiguous fallback moves; Chromium forced-GC cycles. | Agreed production workloads/targets, final-paint latency, process-memory/device acceptance. |
| Retained contracts | Reviewed the 15 root tags and 3 plugin tags; fixed role/Spacer ownership and captured Box primitive chrome. | Formal full-family contract approval, not inferred from this bounded review. |
| Interaction acceptance | Native labels/forms, keyboard, nested editing, focus, synthetic composition events, RTL, emulated forced colors and body-text scaling across three engines. | Real IME, physical devices, screen readers, actual browser/OS zoom and high-contrast configurations. |
| Security and Chart | Plain-array/member hardening, own-cell projection, stale renderer guards, existing HTML/transport regressions, dependency audit and engine-inclusive measurements. | Independent threat-model review, dependency review and approved Chart performance/payload targets. |

If selects Box plus optional state, not root or the aggregate. State uses only a
type-level component import and the ordinary native accessor. There is one reconciliation
owner. `focus-target` resolves an exact surviving root-local ID; forwarded focus must
also stay outside retiring content. See the
[condition contract](../binding/03-templates.md#portable-conditions).
NativeContent adopts captured renderer shells, and Details adopts its captured summary.
The real browser fixture initially exposed nested labels and failed label activation;
the fix and regression preserve one semantic owner.

The fallback placement path now collects contiguous moves in a DocumentFragment,
flushing at an already-positioned predecessor. Existing nodes in the correct position
are not moved. Native state-preserving `moveBefore` remains preferred when available.
Tests cover all 24 four-item permutations, mixed insertion/removal, native drafts/focus
and scoped writes. This is an update to the existing owner, not a second collection engine.

| Verification | Result |
| --- | --- |
| Typecheck/build | Passed; no new distribution entry or runtime dependency. |
| Focused suite | 589/589 in 18 files, including 46 portable-condition cases. |
| Full suite | 5447/5447 in 153 files, two workers, 280.42 seconds; no failures, skips or todos. |
| Package | 96 JS entries / 2,372 files; strict NodeNext and modular/aggregate conditional workflows passed without ECharts installed. |
| New browsers | 12 ESM/classic condition/resource combinations, six plugin/Chart checks and six actual Box demo checks passed. |
| Existing browsers | Original template/source/ID/action/root/aggregate/Form/primitive/plugin/Chart/HTML-policy workflows passed in all three engines and both layouts. No new full catalog sweep is claimed. |
| Dependency audit | `pnpm audit --json` returned no advisories across 167 reported dependencies; not an independent source audit. |

Browser versions: Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6; viewports
1280x900 and 375x812. Host: Windows 10.0.26200, AMD EPYC 7763, 16 logical CPUs and
approximately 64 GiB memory. Browser resource runs were separate from build/test processes.
The in-app browser could not connect because of environment metadata; repository
Playwright supplied the browser evidence. Screenshots were inspected.

#### Resource Observations

Each template configuration has five measured repetitions, with native labels, bound IDs
and models inside native or portable conditions. The table reports the range of per-
configuration medians, not a percentile over a production population:

| Operation | Before batching | Final |
| --- | ---: | ---: |
| WebKit, 1000 rows, native conditional reorder | 1298-1338 ms | 267-297 ms |
| WebKit, 1000 rows, portable conditional reorder | 1503-1688 ms | 282-385 ms |
| All engines, 100 rows, native conditional reorder | Not compared | 13.8-21 ms |
| All engines, 100 rows, portable conditional reorder | Not compared | 12.7-22 ms |
| All engines, 1000 rows, native conditional reorder | Not compared | 136.3-297 ms |
| All engines, 1000 rows, portable conditional reorder | Not compared | 147.4-385 ms |

These repeated results identify and improve the fallback-placement bottleneck, but do
not retroactively replace the earlier single-run 1082 ms evidence. Even the improved
large-list updates are not frame-budget operations. Performance target approval remains
open; no threshold was invented to declare release acceptance.

September 30 Chromium follow-up added double-animation-frame completion observations
without replacing the synchronous measurements. Across desktop/mobile-sized layouts and
ESM/classic delivery, five-repetition median 100-row reorder was 12.7-14.3 ms
synchronously and 33.0-33.5 ms through the second animation frame. At 1000 rows,
native-condition reorder was 124.5-137.8 ms synchronously and 148.4-155.6 ms through
the second frame; portable-condition reorder was 134.1-137.6 ms synchronously and
153.2-158.9 ms through the second frame. These headless frame observations are not
physical-device final-presentation measurements and do not establish an approved target.

Chromium performed 30 create/toggle/dispose/remove cycles with 100 rows per cycle at
each layout, with forced GC before/after. Both runs retained 196 DOM nodes and 45 event
listeners: delta zero. Used JS heap changed by +15,112 and +3,004 bytes. This is not a
leak-free guarantee or a measurement of renderer/process memory.

The subsequent September 30 resource matrix covers all three engines, both layouts
and ESM/classic delivery: 12 configurations with 40 samples each (480 total), five
repetitions for each native/portable condition and 0/1/100/1000-row combination.
Each sample retains synchronous mount/reorder/update/rebind/remove timings and adds
the duration through the second animation-frame callback. The harness validates
sample cardinality, finite nonnegative durations and frame duration >= synchronous
duration; it does not impose an unapproved performance threshold.

Ranges of the four layout/delivery configuration medians for 1000-row reorder:

| Engine | Native synchronous | Native second frame | Portable synchronous | Portable second frame |
| --- | ---: | ---: | ---: | ---: |
| Chromium | 134.5-177.2 ms | 155.1-199.6 ms | 141.6-147.5 ms | 153.1-173.4 ms |
| Firefox | 171-179 ms | 227-236 ms | 184-197 ms | 234-269 ms |
| WebKit | 277-302 ms | 356-379 ms | 291-318 ms | 378-408 ms |

This matrix also samples the CDP-listed processes belonging to its own Chromium
instance through Windows `Get-Process`: browser, renderer, GPU and network service.
Working set and private bytes are recorded per process and summed at 0/10/20/30
100-row create/toggle/dispose/remove cycles, after forced GC. These are post-disposal
snapshots, not peak live-workload measurements. Lifecycle sampling uses the classic
setup left by the preceding resource configurations.

| Layout | Final node/listener delta | Used heap delta | Summed working-set delta | Summed private-byte delta |
| --- | --- | ---: | ---: | ---: |
| Desktop | 0 / 0 | +18,276 bytes | -1,384,448 bytes | -1,462,272 bytes |
| Mobile-sized | 0 / 0 | +17,364 bytes | -1,003,520 bytes | -180,224 bytes |

Desktop's intermediate 10-cycle snapshot reported 815 nodes versus 196 at baseline;
the 20/30-cycle snapshots returned to 196. All snapshots reported 45 listeners.
This intermediate observation is retained rather than hidden or labeled leak-free.
Process IDs/types remain in the report so changed process populations are visible.
Summed working sets can double-count shared pages; process totals include browser
services and allocations unrelated to binding. Falling totals do not prove absence
of leaks, and forced GC does not require OS allocators to release memory.
Firefox/WebKit memory entries explicitly report unavailable; other operating systems,
peak memory, real-device presentation and production targets remain unaccepted.
Conditions, plugin, Chart and Box demo checks also passed in this run; it is not a
new full catalog sweep or a final full-suite/packed-consumer rerun.

Chart samples cover SVG/canvas, 1/100/1000/10000 rows and three repetitions. At 10000
rows, per-layout/engine medians were: SVG state-ready 342.8-706 ms and synchronous
refresh 151.2-292 ms; canvas state-ready 43-222 ms and refresh 24.4-93 ms.
These do **not** measure completed progressive rendering or final paint. Each disposal
left no renderer DOM; accessible tables stayed bounded to 50 rows. Actual canvas pixel
checks and SVG geometry were nonblank. Screen-reader comprehension remains unverified.

#### Retained-Surface Review

| Surface | Review result |
| --- | --- |
| App, Theme, Field | Existing explicit store/theme/label ownership and cleanup retained; conditional App reconnect tested. |
| Header, Main, Section | Default roles no longer overwrite authored roles or data-role choices on reconnect; no new native landmark renderer is claimed. |
| Stack, Row, Wrap, Center, Spacer | Passive layout; Spacer default moved from destructive inline assignment to CSS. |
| Option, Accordion | Remain inert configuration / passive grouping, not native option or exclusivity engines. |
| AccordionItem, Include | Existing native activation, disconnect cleanup, abort and stale-response guards retained and regressed. |
| DataGrid, DataColumn, Rating | Bounded Web contracts reviewed; array preflight hardened; native sort/score, disabled behavior and repeated reconnect verified. |
| Box primitives | Captured Label/Details/content owners are reused instead of nested on instantiation. |

DataGrid and Chart reject own array accessors, hidden symbols and custom array
prototypes before iteration. Chart dimensions also reject holes/unsafe names, and table
projection reads own cells only. These boundaries do not sandbox hostile Proxies or
modified built-ins. Disposed/replaced Chart instances cannot emit current selection.
The [security boundary](../security/README.md) retains explicit trust for templates,
portable included markup and direct Chart options.

#### Payload and Evidence

Gzip bytes, including deduplicated required dependencies:

| Selection | ESM | Classic |
| --- | ---: | ---: |
| State | 9,083 | 9,285 |
| Box including core | 4,161 | 4,345 |
| Bound If / Box plus state, before content families | 13,244 | 13,630 |
| Conditional editor: Box/Input/Button/state and dependencies | 23,110 | 23,762 |
| Minified root including core/state | 19,156 | 19,060 |
| Chart including core/adapter, excluding engine | 9,174 | 9,614 |
| Chart plus the demo's selected ECharts 6.1.0 engine | 212,835 | 213,452 |
| Aggregate including core/Chart adapter, not state/root/engine | 315,370 | 313,757 |

Separate CSS: Box 763 bytes, conditional editor selection 5,020, Chart 403, root
1,685 and aggregate 63,354. The editor selection is not the entire multi-example Box
documentation page. The demo engine costs 203,661/203,838 bytes; other engine selections
require their own measurement.

Fifteen of 296 measured assets changed versus `scoped-actions-final.json`; 281 hashes
are unchanged. No numeric recommendation changed. Nine recommendations warn, including
Box and aggregate growth, without failing the build. Frozen S0 remains
`8362ea61301dc94271bd06aabb281ebbcd54256ac1f9133e60397b1d8e646094`.
All 296 asset hashes and 251 local documentation links/anchors passed verification;
`git diff --check` passed.

Evidence:

- `.vite/size/first-five-{focused,full-tests,final,audit}.json`
- `.vite/size/first-five-integrity.json`
- `.vite/package/first-five-results.json`
- `.vite/browser/first-five-final/acceptance.json` and screenshots
- `.vite/browser/binding-final-paint/acceptance.json` for the Chromium
  double-animation-frame follow-up
- `.vite/browser/binding-resource-matrix-20260930/acceptance.json` for the subsequent
  three-engine frame observations and Windows Chromium process-memory checkpoints
- `.vite/browser/first-five-regression/` for the existing browser harness
- `.vite/browser/first-five/acceptance.json` retains the before-batching comparison;
  `first-five-batching-check` retains the intermediate WebKit confirmation.
- `.vite/size/first-five-review-regressions.json` retains 15 failing review regressions
  before fixes; `first-five-review-fixed.json` and `first-five-primitive-regressions.json`
  retain intermediate passing checks. `first-five-initial` browser output records the
  nested-label failure, not current acceptance.
- `first-five-full-tests-initial.json` retains the first integrated result: 5446/5447
  passed, with the old root CSS hash rejecting the intentional Spacer declaration.
  The corrected fixture verifies that exact added rule and retains the original hash
  for all remaining root CSS. `first-five-style-regression.json` records the focused retry.

Human acceptance still needs a recorded device/OS/browser/assistive-technology matrix,
real composition while reordering/removing a field, spoken label/state verification,
keyboard recovery, zoom/high-contrast inspection and readable Chart alternatives.
The release owner must define representative workload/latency/resource targets and
obtain an independent security review. Clean remote CI and release authorization were
not part of these first five tasks and remain open.

### Initial-family Behavior Review

September 30, 2026 UTC, Windows / Node 22.12.0. This is a bounded, family-by-family
review, not blanket approval of all 89 families or real-device accessibility.

| Family | Bounded result | Still open |
| --- | --- | --- |
| Avatar / AvatarGroup | Source/demo review covered defaults, resource fallback, content/name ownership, sizing, overflow, pre-upgrade values and reconnect; 39 existing cases passed, with no confirmed new discrepancy. | Real assistive-technology/device acceptance and formal release approval. |
| Button / ButtonGroup | Fixed duplicate native owners and icon regions before node adoption; existing single-owner, form, disabled/loading, forwarding, motion and grouping behavior retained. | Real assistive-technology/device acceptance and full release gates. |
| Card and its six regions | Fixed duplicate captured headers/content/titles/close controls inside portable conditions and ListTemplate; authored markers, keyed identity and documented duplicate-region preservation remain intact. | Remaining family review, real assistive-technology/device acceptance and formal release approval. |
| Carousel and its four companion regions | Automatic commands now recheck current safety conditions before native scrolling, including pending reconfiguration/media/resize paths; manual navigation and quiet nearest-item settling remain intact. | Real assistive-technology/device acceptance and formal release approval. |

Button previously nested additional direct buttons/anchors inside its selected owner
and accepted more than one decorative icon region despite the documented maximum.
Preflight now rejects more than one authored direct button/anchor or icon region
before moving content or disconnecting its observer. A generated button is excluded
from the authored-owner count, preserving late adoption of one native control.
Correction of invalid content permits normal initialization and a single activation;
no new public API, dependency, runtime entry or generic property engine is introduced.

Seven regressions were first recorded failing: four native-owner combinations and
three host/native/mixed icon placements. After correction, typecheck/build and the
Button, Button-distribution, Button-demo, aggregate-distribution, Form and Avatar
fixtures passed 274/274 cases using two workers. The existing browser harness records
all seven rejection/node-preservation/recovery cases across three engines and both
layouts (42 checks); the selected Button catalog page passed 6/6 checks. Existing
template/root/aggregate/Form/plugin/Chart workflows also ran in that harness.
This is not a new full catalog sweep or final full-suite/packed-consumer acceptance.

Button-only checkpoint gzip bytes, compared with the saved first-five checkpoint:

| Selection | Previous ESM / classic | Button-only checkpoint ESM / classic |
| --- | --- | --- |
| Button entry | 3,836 / 3,920 | 3,933 / 4,014 |
| Button including core | 5,259 / 5,392 | 5,356 / 5,486 |
| Aggregate including core/Chart adapter | 315,370 / 313,757 | 315,416 / 313,796 |

Button CSS remains 2,472 gzip bytes. No dependency file or recommendation changed;
nine existing recommendations warned, including aggregate ESM at 416 bytes over
its recommendation at this checkpoint. Frozen S0 is unchanged. The size report recorded
work while it was uncommitted, based on `bffc769`; that historical revision field alone
does not identify the new runtime. The follow-up commit accompanying the handoff
identifies the source checkpoint; pushing/publication remain unauthorized.

Card's standalone fixture initially passed 31 cases, but new portable-condition cases
exposed duplicated generated headers and close controls after source capture. Card
now adopts only its own marked chrome on a rendered Card host before property replay.
Private native nodes use `data-part` and the `generated` token in `data-state`, not
component-prefixed markers or production API metadata. Plain authored markers remain
application-owned, and an initial bound `closable=false` removes captured close controls.
The documented preservation of duplicate authored regions is unchanged.

Conditional tests cover generated/authored headers, repeated destroy/recreate, native
close cleanup and authored-marker preservation; ListTemplate tests cover keyed reorder,
title updates and stop/rebind with surviving close-control identity. After final marker
alignment, typecheck/build and ten existing fixtures passed 418/418 cases with two
workers. Three engines, two layouts, ESM/classic and generated/authored headers passed
24 configurations / 72 native keyboard-close and focus-return cycles. Actual packed
consumption passed 96 JS entries / 2,372 files, strict NodeNext and modular/aggregate
runtime loading without ECharts installed. This is not a final full-suite or full-catalog
release acceptance.

Final Card entry gzip is 1,961 / 2,052 bytes, including core 3,384 / 3,524
(ESM / classic), +151 / +150 versus the Button-only checkpoint. CSS remains 2,126.
Final aggregate including core/Chart adapter is 315,545 / 313,925 bytes. Dependency
graphs, public exports, recommendations and frozen S0 are unchanged; nine recommendations
warn, including aggregate ESM at +545 bytes. All 296 measured asset hashes are checked
by the fresh size report.

The first Card browser run retained an additional 619 nodes at the final desktop
memory checkpoint, with no added listeners. That report is preserved. The harness now
also records three fixed second-animation-frame/GC follow-up snapshots without
overwriting the raw 0/10/20/30-cycle checkpoints. A fresh Chromium follow-up observed
the same +619-node intermediate count at cycle 20 and baseline again at cycle 30 and
all follow-up passes. In the final three-engine run, both Chromium layouts retained
199 nodes / 47 listeners throughout the checkpoints and follow-up passes, with final
node/listener deltas zero and used-heap deltas +14,892 / +6,072 bytes. Different fixture
selections prevent treating earlier baselines as directly comparable. These observations
do not establish leak freedom or close the production resource/device gate.

Evidence:

- `.vite/size/avatar-contract-20260930.json`
- `.vite/size/button-contract-initial-20260930.json`
- `.vite/size/button-contract-regressions-20260930.json`
- `.vite/size/button-contract-focused-20260930.json`
- `.vite/size/button-contract-final-20260930.json`
- `.vite/browser/button-contract-20260930/button-contract-results.json`
- `.vite/browser/button-contract-20260930/catalog-results.json`
- `.vite/size/card-contract-20260930.json`
- `.vite/size/card-condition-initial-20260930.json`
- `.vite/size/card-source-focused-20260930.json`
- `.vite/size/initial-family-contract-verified-20260930.json`
- `.vite/size/initial-family-contract-verified-20260930-size.json`
- `.vite/browser/card-contract-20260930/acceptance.json` preserves the +619-node result
- `.vite/browser/card-contract-memory-followup-20260930/acceptance.json`
- `.vite/browser/initial-family-verified-20260930/acceptance.json`
- `.vite/package/initial-family-verified-20260930.json`; preceding reports remain in
  `pre-initial-family-20260930.json` and `pre-card-marker-20260930.json`

### Bounded API Owner Implementation and Integration

The user-confirmed one-contract/one-owner direction now includes TimePicker, InputOTP,
Mention, AutoComplete, Rate and Slider in addition to Transfer. Elements map direct
typed configuration and renderer-owned native structure to their existing concrete
behavior owners; justified native-Web enhancement entries reuse those owners.
No generic controller base, property engine, compatibility layer, mandatory aggregate
or new runtime entry is introduced.

Capabilities are retained rather than selecting the smaller implementation: native
live/default/dirty state, forms and reset, unavailable defaults, identity/ARIA/listeners,
schema choices, IME/paste/caret where applicable, async/stale cancellation, readonly and
fieldset behavior, count/half rating and single/pair ranges remain supported.
TimePicker/InputOTP/Mention/AutoComplete live values no longer read a separate stale
host cache. Their current demos/source API explicitly record empty/default/attribute
rules, accepted events and intentional canonical event/schema changes.
Generated Slider single default remains zero; authored native midpoint is preserved.
Generated pair uses 0/100 or explicit initial native defaults. Rate keeps null distinct
from actual zero and does not silently truncate fractional scales.

The four remaining bounded API candidates also received closure. DynamicInput's custom
names are not overwritten: titles[]/notes[] remain distinct native FormData keys without
the default generated-field marker. Runtime was not changed for that excluded candidate.
FloatButton/Group no longer swallow enumeration synchronization exceptions; the existing
Custom Element error channel is observable, last valid presentation survives invalid
markup and correction/removal restores it. Collapse's sparse key input now fails before
mutation, and already-rendered native source clones adopt their existing marked structure
and public regions with one controller, preserving expansion/key/default semantics.

Each implementation agent used bounded existing fixtures and relevant type/build/API
checks. Some initially built isolated validation directories. After all changes,
the combined source passed TypeScript, the full distribution/API build and 17 existing
changed/direct-consumer fixtures: 1,054 cases with four workers, recorded in
`.vite/size/api-owner-integrated-20260930.json`. This is not a full test-suite, catalog,
multi-engine/performance run, real-device acceptance or approved release.
A PowerShell FileSystem provider-initialization warning was observed at command startup;
the required Node commands completed successfully and the shell exited zero.

DatePicker and ColorPicker initially returned **feature-contract blockers** without edits.
The user subsequently chose retain-full for both, resolving the missing scope decisions.
DatePicker now shares its existing owner across native date/month/week/datetime profiles
and the approved bounded year integer/quarter YYYY-Q1..Q4 mappings, retaining all public
modes and ranges. Empty native/range values and invalid user drafts are explicit; defaults
and markup differ from live values, and initialized schema changes use configure.
ColorPicker now implements the actual bounded HEX/RGB/HSL/alpha contract with local passive
parsing/serialization and native fallback controls, not dataset markers or browser-specific
alpha support. Its current demo defines canonical value, representation, supported syntax,
precision/rounding and draft/default/form/lifecycle behavior.

Both retained contracts passed bounded agent checks and real single-page functional
browser checks. The combined revision then passed TypeScript, full distribution/API
rebuild and 19 existing changed/direct-consumer fixtures: 1,301 cases, four workers,
in `.vite/size/retain-full-api-integrated-20260930.json`. This closes the implementation
scope blockers, not the deferred performance, full-catalog, real-device or release gates.

The canonical API consumer closure uses the existing packed-package harness, not a
new project or framework. Its strict NodeNext consumer now uses the nine public APIs
and exported value/default/state/schema types rather than merely importing entry
names. Both selected-entry and optional-aggregate runtime consumers exercise their
native owners, value/default separation, Transfer reconnect/reset, OTP completion,
Rate null, Slider tuples, retained DatePicker year/quarter/range and ColorPicker alpha/
representation, plus the presentation/behavior boundary.
The offline-installed package passed with 96 JS entries and 2,384 files, without
installed ECharts, in `.vite/package/results.json`; the preceding report is retained
in `.vite/package/before-canonical-consumer-20261001.json`.
Initial consumer errors (Mention's prefix property and OTP's real completion
transition) were corrected in the harness without changing the functional contracts.
The three existing API-index/element-directory/aggregate fixtures also passed 165
cases in `.vite/size/canonical-api-consumer-20261001.json`; the central API summaries
now match the current demos and source. This completes the confirmed bounded
architecture/delivery work, not the deferred release scope.

Accurate dependency-inclusive reporting retains advisory warnings; recommendations,
frozen S0 and Git settings/newline policy remain unchanged. No subsequent commit, push
or publication is authorized.

### Shared Presentation API Boundary

The next user-confirmed architecture/API correction separates `ViewStyle` from
component behavior. The previous Web getter read layout-named HTML attributes and
its setter wrote them, so flex row/column presentation could invalidate Carousel's
horizontal/vertical direction and style gap could alter slide spacing.
The corrected base reads inline CSS and writes only supplied declarations.
Numbers map to pixels, wrap false maps to nowrap, and null clears only that style.
Unknown keys/invalid primitives/nonfinite values fail before style mutation.
Only the typed borderRadius spelling is accepted in the descriptor.

Box/Div retain their own explicit layout-attribute API. Each callback maps only its
changed declaration, including detached writes; reconnect does not replay all
attributes over later application styles. Core accessor replay includes source-defined
shared properties such as viewStyle/classTokens and stops before HTMLElement.
No new property engine, prefix DSL, provider, alias or runtime entry is added.

The initial bounded regression run failed 11 cases, preserving the attribute/style
conflict and invalid-input behavior. Final typecheck/build and seven existing affected
fixtures pass 287 cases, including a real Carousel element's direction/gap isolation,
Box reconnect/detached mapping and inherited property replay. This is not performance
approval, a full-suite/browser matrix or blanket family acceptance.

Core measures 1,571 / 1,622 gzip bytes, Box core-inclusive 4,306 / 4,490 and Transfer
core-inclusive 10,339 / 10,536 (ESM / classic). Accurate shared dependency accounting
exposes new advisory overages; recommendations, runtime exports and frozen S0 remain
unchanged. No functionality is cut or artificially split to suppress warnings.
Git configuration/newline policy is unchanged; no further commit or push is made.

Evidence:

- `.vite/size/view-style-boundary-initial-20260930.json`
- `.vite/size/view-style-boundary-focused-20260930.json`
- `.vite/size/view-style-boundary-verified-20260930.json`
- `.vite/size/view-style-boundary-final-20260930.json`
- `.vite/size/view-style-boundary-size-20260930.json`

### Transfer API and Owner Unification

User-confirmed architecture direction: one logical family contract and one behavior
owner, with multiple justified entry points. Transfer is the bounded implementation
sample. `transfer-element.ts` now maps public properties/data and native fieldset
structure to the existing `transfer.ts` controller. The separate options-button-list
implementation and element-side membership/filter algorithms are removed.
`createTransfer` remains an explicit native-Web interoperability entry to that same
owner, not an independent implementation or a compatibility alias.

`value` consistently reads/writes ordered target membership in both data and authored
native paths. Highlight staging remains separate. Native options survive data updates;
defaults, vanished-default reporting, locks, order, filtering, native validity,
membership FormData and disabled/ancestor-fieldset semantics remain supported.
The same owner reconnects with its defaults and nodes rather than recreating a new
independent model. No new runtime entry, framework layer or property metadata engine
is introduced.

API additions expose existing owner capabilities: property-only `defaultValue`,
membership `name`, `required`, readonly `state` and Web-only `native`, plus reset,
filter/staging and explicit FormData methods. Membership name changes require
disconnection. Public value assignment is silent; successful public movement methods
keep their state-notification `m:change` contract. Native user actions follow accepted
click microtasks, while highlights emit `m:stage` without changing membership.
Programmatic moves retain staging, and disabled uses the fieldset rather than
overwriting individual native control flags.

Initial focused execution passed 51/55 existing cases. Four expectations needed
alignment with the confirmed richer owner semantics: observed name/required attrs,
retained highlight flags, accepted asynchronous user clicks and effective inherited
disabledness. The first related-fixture run also recorded a transform failure caused
by adding await to an existing non-async caller; that caller was corrected. Preserve
both initial reports. Final typecheck/build and five existing related fixtures passed
239/239, including six element regression cases. A single actual Chromium demo smoke
checked data initialization, a native user move, actual value assignment, reconnect
identity, disabled state and native-Web interoperability. No performance workload,
full suite or multi-engine acceptance matrix was run.

Transfer entry gzip is 8,767 / 8,915 and core-inclusive 10,190 / 10,387
(ESM / classic); CSS is 1,217. Existing runtime recommendations warn at +190 / +387,
without new boundaries or functionality cuts. Runtime exports/dependency files,
recommendations and frozen S0 are unchanged; the required broader public declaration
surface intentionally includes the new typed capabilities. No commit/push is made
for this subsequent Transfer implementation.

Evidence:

- `.vite/size/transfer-owner-initial-20260930.json`
- `.vite/size/transfer-owner-focused-20260930.json`
- `.vite/size/transfer-owner-final-20260930.json` retains the non-async caller failure
- `.vite/size/transfer-owner-final-retry-20260930.json`
- `.vite/size/transfer-owner-verified-20260930.json`
- `.vite/size/transfer-owner-verified-size-20260930.json`

### Carousel Safety Follow-up

The preceding resource/API/Button/Card checkpoint was committed locally as `abbd4a7`,
without pushing. The subsequent Carousel changes remain uncommitted.

Four new regressions reproduced unsafe completion of a pending automatic target when
autoplay was disabled, reduced motion activated, the rotation control became hidden
during reconfiguration, or looping was disabled at the final item. The existing
controller now applies its existing pause reasons/cancellation path before scrolling
any automatic command. No new option, dependency, registration, wrapper layer or
production API metadata is introduced.

Cancellation stops at the current native position; the browser may quietly settle
to the nearest item, which can differ from the previous index. It must not force an
unsafe automatic destination or report that canceled move as an autoplay change.
Manual pending moves still complete normally, including instant reduced-motion
realignment. Four partial-position LTR/RTL cases cover quiet nearest-item settlement.

Typecheck/build passed, the existing Carousel fixture passed 83/83 cases, and the
Carousel/demo-index/aggregate-distribution run passed 244/244 with two workers.
Focused browser checks passed 12 engine/layout/delivery configurations and 60 cases
(48 automatic, 12 manual), using actual native scrolling and browser media emulation.
Media cases withhold scrollend to deterministically exercise the existing debounce
fallback; positions and query matches are not mocked.

Initial broad browser checks failed because the test incorrectly required the final
index to stay unchanged and could miss a pending media transition. Preserve those
results and the raw diagnostic snapshots. The corrected assertions verify current
native position, quiet nearest-item settlement, emitted events and pending-target
coverage rather than inventing an index-stability guarantee.

Use `node scripts/browser-check.mjs --carousel-only` for this bounded check.
`--browser=chromium`, `firefox` or `webkit` selects one engine. This path avoids the
unrelated template/Form/plugin/Chart workflows and is not a full catalog sweep.
No full suite or packed-consumer rerun is claimed for this Carousel follow-up.

Carousel entry gzip is 6,914 / 6,977 bytes; including core 8,337 / 8,449
(ESM / classic), +17 / +13 versus `abbd4a7`'s saved checkpoint. CSS remains 1,059.
Aggregate including core/Chart adapter is 315,557 / 313,939 bytes.
Exports, dependency graphs, recommendations and frozen S0 are unchanged; nine
recommendations warn, including aggregate ESM +557 bytes.

Evidence:

- `.vite/size/carousel-autoplay-initial-20260930.json` retains four failures / one manual pass
- `.vite/size/carousel-autoplay-focused-20260930.json`
- `.vite/size/carousel-contract-final-20260930.json`
- `.vite/size/carousel-contract-size-20260930.json`
- `.vite/browser/carousel-contract-20260930/catalog-results.json` retains the initial browser failures
- `.vite/browser/carousel-focused-diagnostic-20260930/carousel-contract-results.json`
- `.vite/browser/carousel-focused-{chromium,firefox,webkit}-20260930/carousel-contract-results.json`

### Component Documentation Consistency Follow-up

September 30, 2026 UTC, Windows / Node 22.12.0. Structural checks cover all 89
selectable families / 205 tags, their directory/demo links, optional root/plugin
separation and inventory-declared companion names. Inventory now explicitly includes
ListTemplate and UploadFileList. These checks do not approve all family behavior,
portable semantics, accessibility or lifecycle contracts.

The API extractor previously used TypeScript symbol documentation, which inherited
browser DOM descriptions for overridden names. ListItem.prefix was incorrectly
described as a read-only namespace prefix; Card.title and other title accessors
received the generic browser tooltip description. The extractor now reads getter
JSDoc from component source only, preserving declarations inherited from component
base classes while stopping browser documentation leakage.

The original and corrected extractors were compared over all families in the existing
build order: 18 incorrect descriptions across 16 families changed; every other API
field is identical. An initial alphabetically ordered comparison changed TypeScript
union/enum presentation order, so it was not used as a contract-equivalence result.
The report preserves that initial failure and the successful build-order comparison.
Runtime sources, distribution assets, payload recommendations and frozen S0 are unchanged.

The new regression was first reproduced failing in the existing demo-index fixture.
After the fix, the demo-index, element-directory and native-demo fixtures passed
195/195 cases using two workers, and typecheck passed. No new test file/project was
created; existing inherited Input descriptions and source-authored ListTemplate
descriptions remain covered. This is focused documentation/structure evidence,
not a new full-suite, packed-consumer or full browser-catalog acceptance.

Evidence:

- `.vite/size/contract-docs-initial-20260930.json`
- `.vite/size/component-contract-focused-20260930.json`
- `.vite/size/component-contract-api-20260930.json`

### Scoped Action Checkpoint

September 29, 2026 UTC, local Windows / Node 22.12.0; the Asia/Shanghai session
continued past midnight. Typed `m-arg-*` values now use an explicitly supplied live
`Binding`, with current-key reads through the existing scope owner. App wires that
connection on initialization/reconnect and releases a newly created binding if action
installation fails. Actions remain in the optional root facade;
core, state, selected families and the full catalog do not import the registry.
The [action contract](../binding/06-actions.md) records literal parameters, typed
arguments, event ownership, invalid/disposed reads and async limitations.

| Check | Local result |
| --- | --- |
| Typecheck/build | Passed. No new entry, mandatory dependency or component registration. |
| Focused tests | 408/408 in ten files, including 43 action/read cases. |
| Integrated tests | 5,383/5,383 in 152 files, two workers, 281.87 seconds; no failures, skips or todos. The earlier 5,382-test run is retained separately. |
| Packed consumer | 96 JS entries / 2,368 files; strict NodeNext, modular/aggregate imports, explicit binding reads and root action invocation passed without ECharts installed. |
| Browser | Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 at 1280x900 and 375x812; all 12 ESM/classic combinations passed. Native Enter/Space activation, disabled buttons, typed/literal arguments, current-key reorder/edit/removal, focus fallback, ten App reconnects and error dispatch passed. Existing template/root checks and the actual List demo also passed. |

| Selection | ESM gzip bytes | Classic gzip bytes |
| --- | ---: | ---: |
| State | 8,746 | 8,952 |
| Ordinary List including core | 3,790 | 3,912 |
| Bound List including core/state, before content families | 12,536 | 12,864 |
| Paired List plus Box/Input and their dependencies/state, without named actions | 20,868 | 21,520 |
| Minified root including core/state, not List | 18,804 | 18,713 |
| Scoped-action List + Box + Input + Button + root, all required runtime files | 33,339 | 33,729 |
| Aggregate including core/Chart adapter, not root/state/actions | 314,836 | 313,267 |

The scoped-action composition deduplicates core, state, List, Box, Input,
native-input, Button and the minified root. Its selected CSS costs 6,886 bytes
(List/Box/Input/Button); root styling is already embedded in the root runtime.
The separately available root CSS is unchanged at 1,678 bytes. Demo documentation,
Typography and other page-wide selections are not part of that composition total.
Ordinary List CSS stays 1,878 bytes and aggregate CSS stays 63,345.

Only five of 296 measured files change against the paired-ID checkpoint: state grows
152/145 gzip bytes, minified root entries grow 278/282, and unminified root ESM grows
371. Complete minified root therefore grows 430/427 through its combined dependencies.
All other 291 asset hashes, including every component, core and all CSS, remain unchanged.
The advanced/widgets entries also remain byte-identical; their dependency-inclusive
costs grow through the root/state they already require. Four recommendations warn:
state +4,746/+4,952 and root +3,804/+3,713. Recommendations and frozen S0 are unchanged.

For 0/1/100/1,000 native action rows, ten event activations after reorder read current
keys/indices without duplicate callbacks. At 1,000 rows, ten activations took
15.1-25 ms across the twelve runs. Existing 1,000-row paired-ID samples ranged
80.8-151 ms mount, 64-832 ms reorder, 32.8-52 ms update and 423.9-732 ms for ten
stop/rebind cycles. These are single-run observations, not controlled comparisons,
approved targets or retained-memory evidence. The earlier 1,082 ms reorder remains
an unresolved performance observation, not disproved by this run.

Desktop/mobile screenshots were inspected without observed overlap or page overflow.
Evidence: `.vite/size/scoped-actions-{focused,full-tests,final}.json`,
`.vite/package/scoped-actions-results.json`, and
`.vite/browser/scoped-actions/scoped-actions-results.json`. The same browser directory
contains the template/root regression results and `*-scoped-actions-*.png` /
`*-list-template-demo.png` screenshots. Its separate output directory preserves the
previous checkpoint's browser evidence.
The in-app browser connection failed on missing environment metadata; the repository
Playwright harness provided this evidence. The first focused action run had one test
setup failure because its App subclass was not registered; the corrected final
focused run has no failures.
The first full run passed 5,382 tests, then a new focused regression exposed leaked
binding ownership when App action installation failed. The failure is retained in
`scoped-actions-cleanup-regression.json`; the earlier full run is
`scoped-actions-full-tests-pre-cleanup.json`. Cleanup was fixed without weakening the
test. An intermediate focused run overlapped a rebuild and could not read the
temporarily absent manifest; `scoped-actions-focused-build-overlap.json` retains that
failure. The final 408-test focused run was sequential after build and passed.

Generic portable conditions, broad resource/security/accessibility acceptance, clean
remote CI and release authorization remain open. No new release approval is implied.

### Paired ID Checkpoint

September 29, 2026, local Windows / Node 22.12.0. Application-provided one-way IDs
and label/ARIA references now have next-surviving-tree preflight in optional state.
The [paired-ID contract](../binding/03-templates.md#paired-ids) defines exact strings,
HTML whitespace, root boundaries, replacement, subscriptions and non-atomic limitations.

| Check | Local result |
| --- | --- |
| Typecheck/build | Passed. No new distribution entry, component runtime import or mandatory dependency. |
| Focused tests | 302/302 in ten files, including 55 paired-ID cases. |
| Integrated tests | 5,340/5,340 in 151 files, two workers, 312.61 seconds; no failures, skips or todos. |
| Packed consumer | 96 JS entries / 2,368 files. Strict NodeNext, modular/aggregate imports, portable paired label/control association and stop/rebind passed without ECharts installed. |
| Browser | Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 at 1280x900 and 375x812; all 12 ESM/classic combinations passed. Label clicks/native focus, description targets, edits, reorder/drafts, swaps, duplicate rejection, root text safety and rebind are covered. Existing template/root flows and actual List demos also passed. |

| Selection | ESM gzip bytes | Classic gzip bytes |
| --- | ---: | ---: |
| List entry | 2,367 | 2,440 |
| Ordinary List including core | 3,790 | 3,912 |
| State | 8,594 | 8,807 |
| Bound List including core/state, before content families | 12,384 | 12,719 |
| Paired List plus Box/Input and their dependencies, including state | 20,716 | 21,375 |
| Minified root including core/state, not List | 18,374 | 18,286 |
| Aggregate including core/Chart adapter, not state | 314,836 | 313,267 |

List CSS is 1,878 bytes; List + Box + Input CSS is 4,414; aggregate CSS is 63,345.
Against the reusable-source checkpoint, only state ESM/classic changed among 296
measured files, growing 1,108/1,115 gzip bytes. All 294 other hashes, including core,
every component, root entry and stylesheet, are unchanged. Root's complete cost grows
through its state dependency. No recommendation or frozen S0 value changed.
Four manifest recommendations warn: state +4,594/+4,807 and root +3,374/+3,286.

ID preflight excludes only genuinely retiring content, not unchanged text children or
text directives outside the bound root. Root scalar bindings prepare together when ID
relationships are present; adding/removing that ownership rewires subscriptions while
preserving unchanged drafts. Invalid next states preserve prior rendered pairs, but do
not roll back store data or arbitrary component side effects. Intermediate DOM writes
are not atomic; component observers still own native association updates. No new
component forwarding, static-reference audit or automatic ID allocation is claimed.

Native paired label/input samples at 0, 1, 100 and 1,000 items retained identity and
associations across ten stop/rebind cycles. At 1,000 items, mount ranged 74-147 ms,
reorder 70.8-1,082 ms, update 34.1-71 ms and ten stop/rebind cycles 428.3-839 ms.
These single-run observations are not controlled benchmarks. The worst reorder exceeds
one second and remains a performance issue for broader resource acceptance, not an
approved interaction target. Retained-memory, real-device and screen-reader review
remain open. Desktop/mobile screenshots were inspected without observed overlap or
page overflow.

Evidence: `.vite/size/binding-ids-focused.json`,
`.vite/size/binding-ids-full-tests.json`, `.vite/size/binding-ids-final.json`,
`.vite/browser/binding-ids-results.json`, `.vite/browser/*-paired-ids-*.png` and
`.vite/browser/*-list-template-demo.png`, plus `.vite/package/binding-ids-results.json`.
The in-app browser execution tool was
unavailable; the repository Playwright harness supplied this evidence.
The first browser fixture clicked stretched label-host whitespace; targeting its
native label text fixed the fixture, without changing Label behavior.
The initial full run overlapped source/test edits and used cached pre-fix modules;
its 21 failures are retained in `binding-ids-full-tests-initial.json`, not accepted.
A subsequent focused run exposed earlier error timing for ordinary, nonpaired text
binding; the planner was scoped correctly and the original regression test now passes.
That initial focused result is retained as `binding-ids-focused-initial.json`.
At that checkpoint, scoped actions were pending; they are implemented above.
Generic portable conditions, broader resource/security/accessibility acceptance and
release authorization remain open.

### Reusable Template Source Checkpoint

September 29, 2026, local Windows / Node 22.12.0. Root-local ID definitions and explicit
programmatic template Maps now supply both native structural placements and List regions.
Source objects are native Web templates, not portable definitions or store data.
The [contract](../binding/03-templates.md#referenced-and-programmatic-sources) specifies
lookup boundaries, source immutability, nested expansion, replacement and failure behavior.

| Check | Local result |
| --- | --- |
| Typecheck/build | Passed; state remains independent of component/core runtimes, ordinary List still imports only core. No new entry or mandatory dependency. |
| Focused tests | 247/247 in nine files, including 35 source-reference cases. |
| Integrated tests | 5,285/5,285 in 150 files, two workers, 283.56 seconds; no failures, skips or todos. |
| Browser | Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6; 1280x900 and 375x812; ESM/classic reference/Map editing, reorder, drafts, invalid source recovery, replacement focus and rebind passed. Existing template/root flows and both live List demos also passed. |
| Packed consumer | 96 JS entries / 2,364 files; strict NodeNext and modular/aggregate inline/referenced/programmatic workflows passed without ECharts installed. |

| Selection | ESM gzip bytes | Classic gzip bytes |
| --- | ---: | ---: |
| List entry | 2,367 | 2,440 |
| Ordinary List including core | 3,790 | 3,912 |
| State | 7,486 | 7,692 |
| Bound List including core/state, before content families | 11,276 | 11,604 |
| Minified root including core/state, not List | 17,266 | 17,171 |
| Aggregate including core/Chart adapter, not state | 314,836 | 313,267 |

List CSS remains 1,878 bytes; aggregate CSS remains 63,345. Against the portable List
checkpoint, six of 296 files changed: List/state/aggregate JS in both formats. The other
290 hashes, including core, Input and every stylesheet, are unchanged. State grows
709/712 bytes, List 12/13 and aggregate entries 19/15. Recommendations and frozen S0
are unchanged. Four manifest overages warn: state +3,486/+3,692 and root +2,266/+2,171.

Nested source validation rejects missing/ambiguous definitions, incompatible roots,
mixed inline/reference content, repeated IDs, cycles, more than 32 reference hops and
more than 1,000 reference expansions per placement source. Source updates preserve
rendered instances on validation failure; valid changed expanded content replaces
the enclosing placement using the existing focus policy. Original definitions are
not consumed. The new attribute cannot be assigned through scalar attribute binding.

Desktop/mobile screenshots were inspected without observed overlap or page overflow.
Repeated text-only inline List measurements ranged from 30-83 ms mount, 16.4-219 ms
reorder, 10.4-24 ms update and 145.8-229.3 ms for ten stop/rebind cycles at 1,000 items.
These single-run observations are not a controlled comparison or approval of large-data
performance; referenced-source timing and retained-memory acceptance remain open.

Evidence: `.vite/size/template-sources-focused.json`,
`.vite/size/template-sources-full-tests.json`, `.vite/size/template-sources-final.json`,
`.vite/browser/template-sources-results.json`, `.vite/browser/template-sources-list-results.json`,
`.vite/browser/*-template-sources-*.png`, `.vite/browser/*-list-source-demo.png`,
and `.vite/package/template-sources-results.json`.
The in-app browser connection failed on environment metadata; the repository Playwright
harness provided browser evidence. An initial harness launch found duplicate inserted
script/demo blocks; those were removed before the successful matrix and full test run.
Paired IDs were outside this source checkpoint and are covered above. Generic portable
conditions, scoped actions, non-Web adapters and broader security/accessibility/resource
acceptance remain open. No release approval is implied.

### Portable List Template Checkpoint

September 29, 2026, local Windows / Node 22.12.0. `m-list-template` is the first
portable collection-region consumer of the existing binder, not a separate collection
controller. Public markup uses List/ListItem/Input/Box; the Web renderer owns native
`ul`/`li` and input controls. Ordinary List remains independent of state.

| Check | Local result |
| --- | --- |
| Typecheck/build | Passed. 89 families / 204 tags; ListTemplate is exported by selected ESM/classic and the optional aggregate. |
| Focused tests | 212/212 in eight files, including 30 ListTemplate cases and the element directory. |
| Integrated tests | 5,250/5,250 in 149 files, two workers; zero failures, skips or todos. |
| Browser | Passed Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at 1280x900 and 375x812. Native/portable template and root ESM/classic flows, plus the actual List demo, passed all six combinations. |
| Packed consumer | 96 JS entries / 2,364 files. Strict NodeNext, modular/aggregate imports and portable keyed editing/focus passed without ECharts installed. |

Current measured gzip costs, each runtime dependency counted once:

| Selection | ESM bytes | Classic bytes |
| --- | ---: | ---: |
| List entry only | 2,355 | 2,427 |
| Ordinary List including core | 3,778 | 3,899 |
| Optional state | 6,777 | 6,980 |
| Bound List including core/state, before content families | 10,555 | 10,879 |
| Complete minified root including core/state, not List | 16,557 | 16,459 |
| Optional aggregate including core/Chart adapter, not state | 314,817 | 313,252 |

List CSS is separately 1,878 bytes; aggregate CSS is 63,345. Additional content families
such as Input/Box and the application-supplied ECharts engine remain additional costs.
The state recommendations warn at +2,777/+2,980 and root at +1,557/+1,459.
List's source-style test also warns above its older 1,800-byte recommendation.
No recommendation or frozen S0 value changed; no artificial chunk was introduced.
Compared with the inline-Web checkpoint, only eight of 296 measured runtime/style
files changed: List, state and aggregate JS in both formats, plus List/aggregate CSS.
The other 288 hashes, including core and Input, are unchanged. List entry growth is
889/876 bytes, state growth is 389/384, and aggregate entry growth is 751/760.
Recommendations are byte-for-byte unchanged against that checkpoint.

Focused behavior includes native semantic owners and form submission without inert
source fields, nested current-key writes, retained drafts, source/key preflight,
exclusive region ownership, incremental capture, App reconnect and removal focus.
Native blur/change events emitted while focus leaves a retiring row cannot write that
removed key. An invalid explicit focus callback still fails; it is not silently
replaced by the region policy. Nested policies choose only a surviving list.

Observed synchronous timings across twelve format/engine/layout samples, using
text-only portable ListItem instances:

| Items | Mount ms | Reorder ms | One item update ms | Ten stop/rebind cycles ms |
| --- | ---: | ---: | ---: | ---: |
| 0 | 0-0.5 | 0-1 | 0 | 0.7-2 |
| 1 | 0-1 | 0-1 | 0-1 | 1-4 |
| 100 | 4.5-10 | 2-6 | 1-2 | 13-19 |
| 1,000 | 29.6-60 | 17.7-155 | 9.7-21 | 129.7-164 |

These are single-run observations, not approved performance targets. The slowest
1,000-item reorder still needs workflow-level review; input-rich large lists and retained
memory are not covered by this text-only timing sample. Desktop/mobile screenshots were
inspected; no overlap or horizontal overflow was observed in the checked workflows.

Evidence paths:

- `.vite/size/list-templates-focused.json`
- `.vite/size/list-templates-full-tests.json`
- `.vite/size/list-templates-full-tests-initial.json`
- `.vite/size/list-templates-final.json`
- `.vite/browser/list-templates-results.json`
- `.vite/browser/*-list-templates-*.png`
- `.vite/browser/*-list-template-demo.png`
- `.vite/package/results.json`

The initial full run exposed a duplicate test import and a directory/API tag-order
mismatch. Duplicate inserted test/style blocks were removed, the directory was corrected,
and the affected checks were rerun. That initial failed run is preserved, not waived.
The in-app browser connection remained unavailable because of its environment metadata;
the existing repository Playwright harness supplied the recorded browser evidence.

Source descendants can briefly connect during parsing/upgrade before inert capture;
this is not an arbitrary-constructor sandbox. Referenced/programmatic sources, paired
bound IDs, generic portable conditionals, real IME/device/screen-reader evidence,
independent security review and broader memory/performance acceptance remain open.
Headless layouts and single-run timings do not approve production performance or accessibility.

### Web template checkpoint

September 29, 2026, local Windows / Node 22.12.0. Inline native templates are an
explicitly Web-only adapter, not completion of the portable List/ListItem milestone.

| Check | Local result |
| --- | --- |
| Typecheck/build | Passed. No component/core dependency or public runtime export name added; `BindingOptions` is a type-only state export. |
| Focused tests | 168/168 in five files, including 45 new inline-template cases. |
| Integrated tests | 5,220/5,220 in 148 files, one worker; zero failures, skips or todos. |
| Packed consumer | 96 JS entries / 2,360 files; strict NodeNext declarations including `BindingOptions`, modular/aggregate imports and actual keyed editing/rebind passed without ECharts installed. |
| Browser | Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6; 1280x900 and 375x812. Template and root ESM/classic passed in all six engine/layout combinations. |
| State gzip | 6,388 ESM / 6,596 classic bytes. Original 4,000-byte recommendations warn at +2,388/+2,596; unchanged S0. |
| Complete minified root gzip | 16,168 ESM / 16,075 classic bytes including core/state. Original 15,000-byte recommendations warn at +1,168/+1,075. |
| Runtime isolation | Only the two state bundles differ among 296 assets versus the scope-foundation report; the other 294 hashes are unchanged. Each state format grows by 3,778 gzip bytes. |

Browser fixtures cover nested key reorder and writes, selected Input native ownership,
focus/selection/drafts, composition-event sequences, duplicate-key rejection, source
conditions, explicit focus fallback and retained root instances. The insertion fallback
is exercised even on engines supporting state-preserving DOM moves. Desktop/mobile
screenshots were inspected. Synthetic composition events do not establish actual IME,
screen-reader or real-device acceptance.

Observed synchronous timings across the twelve format/engine/layout samples:

| Items | Mount ms | Reorder ms | One item update ms | Ten stop/rebind cycles ms |
| --- | ---: | ---: | ---: | ---: |
| 0 | 0-1 | 0-1 | 0 | 0-3 |
| 1 | 0-1 | 0-1 | 0-1 | 0.7-3 |
| 100 | 2.4-10 | 1-6 | 0.7-3 | 13.8-32 |
| 1,000 | 19-57 | 8-19 | 6-18 | 116.1-257 |

These are single-run local observations for plain native-input lists, not approved
latency targets, memory measurements or bounds for arbitrarily nested/component-heavy
content. Collection key validation is cached only within read-only preparation.

Evidence: `.vite/size/templates-full-tests.json`, `.vite/size/templates-focused.json`,
`.vite/size/templates-final.json`, `.vite/package/results.json`,
`.vite/browser/templates-results.json` and screenshots matching `*-templates-*.png`.
The browser skill connection again failed
with missing `sandboxPolicy`; the existing repository Playwright harness ran the checks
through `node scripts/browser-check.mjs --templates`.

The [Web contract](../binding/03-templates.md) records strict values, ID restrictions,
source/instance placement ownership, stop/rebind and callback/error limits. The state
observer is internal; there is no public empty-path subscription, store transaction,
scope export or component registration dependency. Referenced/programmatic sources,
portable consumer integration, independent security/performance review and release
authorization remain open.

### Internal scope foundation checkpoint

Historical data-only checkpoint, September 29, 2026, local Windows / Node 22.12.0:

| Check | Local result |
| --- | --- |
| Typecheck/build | Passed; no public export, component dependency, size recommendation or S0 baseline changed. |
| Integrated tests | 5,175/5,175 passed in 147 files with one worker; zero failures, skips or todos. |
| Final focused tests | 123/123 in four files after the final build, including 62 internal-scope cases and scalar/App regressions. |
| Packed consumer | 96 JavaScript entries / 2,352 files; strict NodeNext types and modular/aggregate imports passed without ECharts installed. |
| State payload | 2,610 ESM / 2,818 classic gzip bytes, up 29/26 from the advisory checkpoint. The 4,000-byte recommendations remain unchanged. |
| Complete minified root runtime | 12,390 ESM / 12,297 classic gzip bytes including core/state; the 15,000-byte recommendation remains unchanged. |
| Runtime isolation | Only the two state bundles changed among 296 measured runtime assets; the other 294 hashes match the advisory checkpoint. |

`src/state/scope.ts` is an internal data-only foundation, not imported by the public state
bundle. It validates complete bounded key sets, resolves nested current-key write routes,
protects identity and disposal, and rejects accessor paths. Model writes cannot change
array length; collection replacement remains explicit. The measured state increase is
the shared plain-data validator extraction and symbol-member rejection, **not** the cost
of the pending template renderer. Eight additional declaration/JavaScript/map files come
from the two internal source modules; they add no public entry or selected dependency.

`bind` still rejects structural directives. No DOM reconciliation, subscription retargeting,
focus policy, stop/rebind integration or portable List consumer is claimed. Browser,
real-device, screen-reader, independent security/performance and remote CI gates remain open.

Evidence: `.vite/size/scope-foundation-full-tests.json`,
`.vite/size/scope-foundation-final-tests.json`, `.vite/size/scope-foundation-final.json`
and `.vite/package/results.json`. The initial 119-case run is retained in
`.vite/size/scope-foundation-tests.json`; the previous package result is retained in
`.vite/size/pre-scope-package.json`. Current size reporting passes with zero exceeded
recommendations; the five recommendation differences against frozen S0 are unchanged.

### Advisory size policy checkpoint

September 29, 2026, local Windows / Node 22.12.0:

| Check | Local result |
| --- | --- |
| Typecheck/build | Passed; size recommendations warn rather than fail. No numeric recommendation changed in this checkpoint. |
| Integrated tests | 5,112/5,112 passed in 146 files with one worker; zero failures, skips or todos. |
| Packed consumer | 96 JavaScript entries / 2,344 files; strict NodeNext types and modular/aggregate imports passed. |
| Size report | Passed; actual bytes, dependency closures and baseline differences retained. No current recommendation exceeded. |
| Runtime integrity | All 296 measured asset hashes match the retained-root report; no runtime source or JS/CSS output changed. |

Build manifests and size reports now identify `budgetPolicy: "advisory"` and expose
structured `sizeWarnings`. The 113 formerly blocking JS/CSS size assertions report
recommendations instead; functional assertions and measurement-integrity checks remain.
Regression fixtures prove that exceeded file/CSS/component/root recommendations and
adjusted recommendation values do not fail default reporting. Explicit
`--check-regressions` still rejects byte/export changes when requested.
The sharing diagnostic reports savings and recommendation overages separately; it
does not automatically approve/reject an architectural change from a size threshold.

The initial two-worker run passed 5,109/5,112 with three five-second timeouts: the new
multi-file evidence fixture and two existing classic distribution cases. The new
fixture now copies its files concurrently and has an explicit 15-second integration
timeout. Existing distribution timeouts were not increased. All 34 tests in the three
affected files passed a single-worker rerun, followed by the complete passing run above.
No functional assertion was removed to clear a timeout. Two-worker timing stability
and clean remote CI are not established by the final single-worker result.

Evidence: `.vite/size/advisory-tests.json` (initial),
`.vite/size/advisory-recheck.json`, `.vite/size/advisory-tests-final.json`,
`.vite/size/advisory-final.json`, and `.vite/package/results.json`.
The previous package report is retained in `.vite/size/pre-advisory-package.json`.
S0 and prior runtime/browser evidence remain unchanged. No browser/device,
screen-reader, independent security/performance or remote CI acceptance is added.
This historical checkpoint predates the internal scope/path implementation; structural
directives remain disabled. The
[working delivery plan](../binding/05-delivery-plan.md) records source review,
the subsequent internal foundation, List/ListItem as the first consumer target and
remaining implementation work.

### Retained root lifecycle checkpoint

September 29, 2026, Windows / Node 22.12.0:

| Check | Local result |
| --- | --- |
| Typecheck/build | Passed; all existing ceilings unchanged. |
| Integrated tests | 5,103/5,103 passed across 146 files with two workers; zero failures, skips or todos. |
| Packed consumer | 96 JavaScript entries / 2,344 files; strict NodeNext types and modular/aggregate runtime imports passed without installed ECharts. |
| Browser catalog | 588/588 checks across 98 pages, three engines and two viewport sizes. |
| Root interactions | ESM and classic passed in all six engine/layout combinations. |

Theme now releases its own tokens/marker when `name` is removed, restoring earlier
inline values and priorities without erasing later application writes. Field uses a
real native label, tracks late/replaced controls and IDs, and excludes nested Fields.
AccordionItem synchronizes live `open`/`title`, retains authored nodes and releases
activation listeners on disconnect. App preserves pre-upgrade store assignment,
rejects conflicting state owners and requires disconnection before store replacement.
The [root lifecycle guide](../api/01-core.md#optional-root-lifecycle) records the precise
baseline and limits; these fixes do not approve every retained root contract.

Portable fixtures use `m-*` authoring; native labels, controls, buttons and content
containers remain Web-renderer responsibilities. Both served ESM and classic root
formats pass real label focus/checkbox activation, disabled behavior, Enter/Space
disclosure, live title/open changes, late control adoption, store/action identity,
reconnect cleanup and theme `!important` restoration in Chromium 153.0.8010.12,
Firefox 155.0 and WebKit 26.6 at 1280x900 and 375x812. The repeated catalog passed
588/588 checks across 98 pages. Desktop/mobile root screenshots were inspected;
headless viewport coverage is not real-device or screen-reader acceptance.

Root styling no longer duplicates migrated component-family rules. Selected families
require their own CSS; root retains shared tokens/layout utilities, its own elements
and scoped feedback-service styling. Complete root runtime is 12,361 gzip bytes ESM /
12,271 classic, below the unchanged 15,000-byte ceiling. External root CSS is 1,678
bytes. Only the three root JavaScript files and root CSS differ among the 296 measured
files from S6; core, state, selected families and both full-catalog distributions remain
byte-identical. No existing budget or frozen S0 baseline changed.

Browser evidence is in `.vite/browser/results.json` and
`.vite/browser/catalog-results.json`; `.vite/size/root-lifecycle.json` records costs.
The final integrated report is `.vite/root-lifecycle-tests.json`; package evidence is
`.vite/package/results.json`. The first full run's 5,102/5,103 result is retained in
`.vite/root-lifecycle-tests-initial.json`: an obsolete Avatar test required duplicate
root styling. Its correction keeps all default-style assertions against the family's
source and published CSS, adds an absence assertion for root, and passes the final
integrated run. No failing runtime test was waived.

Reproduce with `node scripts/build.mjs`, then
`node node_modules/vitest/vitest.mjs run --maxWorkers=2 --reporter=default --reporter=json --outputFile=.vite/root-lifecycle-tests.json`,
`node scripts/package-check.mjs`, `node scripts/browser-check.mjs --catalog`, and
`node scripts/size-report.mjs --output .vite/size/root-lifecycle.json`.
Do not rebuild or run the heavy browser matrix concurrently with the full tests.

Structural binding scope, remaining contract review, clean remote CI, human input/
accessibility checks, independent security/performance review and Chart engine-inclusive
budget approval remain release blockers.

### Size optimization checkpoint

September 29, 2026, Windows / Node 22.12.0, source checkpoint `99ab5a6`
including the Tree Select reset correction `ec9cae4`:

| Check | Local result |
| --- | --- |
| Typecheck/build | Passed with the original component/root/plugin ceilings unchanged. New aggregate-only ceilings account for its complete runtime and CSS. |
| Integrated tests | 5,085/5,085 passed across 145 files after the reset correction; zero failures, skips or todo tests. |
| Packed consumer | 96 JavaScript entries, 2,344 files; strict NodeNext types and separate modular/aggregate runtime imports pass without installed ECharts. |
| Browser catalog | 588/588 checks across 98 pages, three engines and desktop/mobile-sized viewports. |
| Browser interactions | Changed S2/S3 families and existing Chart, primitive, Form, plugin, Virtual List and HTML-policy workflows pass. Both aggregate formats pass real forms/reset, sorting, keyboard selection, reconnect and external-engine rendering in all six engine/layout combinations. |
| Catalog/aggregate | 89 independently selectable families / 203 tags, with an optional namespace-based full entry; no mandatory aggregate dependency. |
| Modular runtime gzip | All 94 selected runtime files total 413,512 bytes ESM / 427,022 classic. Cumulative S0 savings are only 553/533 bytes. |
| Optional full runtime gzip | 314,066 bytes ESM / 312,492 classic, including core and Chart adapter. Full component CSS is separately 63,150 bytes. |

Browser evidence completed September 28, 2026 UTC: Chromium 153.0.8010.12,
Firefox 155.0 and WebKit 26.6 at 1280x900 and 375x812. The first matrix's
586/588 result exposed a genuine Tree Select reset/clear race. Deterministic
source/distribution regressions and the passing final matrix supersede that failure;
it was not waived or hidden by increasing a timeout. Final aggregate and corrected
Tree Select/Dropdown screenshots were inspected.

This work preserves portable `m-*` authoring for the reconciled contracts and
renderer-owned native HTML, with explicitly marked Web interoperability examples.
It does not certify every retained root contract, all input modes or non-Web targets.
The clean remote install/OS/Node matrix, human accessibility and real-device checks,
structural binding scope, remaining retained-root contracts, independent security and
performance review, and Chart engine-inclusive release-budget approval remain open.
No new audit or remote CI result is claimed by this checkpoint.

Evidence is retained locally in `.vite/size/s6-tests.json`,
`.vite/size/s6-final.json`, `.vite/package/results.json`,
`.vite/browser/results.json` and `.vite/browser/catalog-results.json`.
The [optimization record](10-size-optimization.md) owns the detailed comparisons,
commands, limitations and per-task evidence.
Repeating the build at this source checkpoint reproduces all 296 measured file hashes,
raw/gzip costs, exports and budgets exactly.

### Earlier release checkpoint

September 23, 2026, Windows / Node 22.12.0 / pnpm 10.28.0:

| Check | Result at that checkpoint |
| --- | --- |
| Frozen install | Passed in the existing workspace; not a clean remote-machine install. |
| Typecheck/build | Passed; Chart adapter/runtime ceilings reduced, all other existing ceilings unchanged. |
| Integrated tests | 4,837 passed across 131 files; zero failed or skipped. |
| Packed consumer | 95 JavaScript entries, 2,327 files; strict NodeNext types and runtime imports passed without ECharts installed. No vendor assets ship in the package. |
| Browser catalog | Previous integrated baseline: 588/588 startup checks (98 pages). External-engine change: Chart 6/6 checks across three engines and two viewport sizes. |
| Browser workflows | Chart, portable primitives, Form, DataGrid, Rating, Virtual List and restricted HTML checks passed in all six engine/layout combinations. Chromium also verified fail-closed Trusted Types enforcement. |
| Dependency audit | 167 locked dependencies; zero reported advisories. |
| Element directory | 89 families / 202 tags, plus 15 root and 3 plugin tags; source-data consistency tests passed. |
| Root runtime gzip | 14,940 bytes minified ESM / 14,848 classic, each below the unchanged 15,000 ceiling. |
| Optional plugin gzip | Advanced JS/CSS 2,363/458 bytes; Widgets JS/CSS 1,498/420 bytes. Existing ceilings unchanged. |
| Chart runtime gzip | 9,079 bytes ESM / 9,522 classic including core and adapter; CSS 403 bytes. Excludes required application-supplied ECharts. Adapter alone: 258/497 bytes. |
| Demo-only engine gzip | Selected ECharts 6.1.0: 203,661 bytes ESM / 203,838 classic. Combined example runtime: 212,740/213,360 bytes, excluding CSS. Externalization does not remove the engine download. |

Browsers were Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at 1280x900 and
375x812. The local reports are `.vite/production-tests.json`,
`.vite/package/results.json`, `.vite/browser/results.json` and
`.vite/browser/catalog-results.json`, with browser screenshots in `.vite/browser`.
These are generated evidence, not shipped runtime files. CI is configured but no
remote matrix result has been recorded for this revision. Headless engines with
mobile-sized viewports are not real mobile-device or screen-reader acceptance.

Chart now requires explicit `configureChartEngine(echarts)` setup. Its published adapter
contains no ECharts/zrender source or vendor type imports. Three-engine checks cover ESM
and classic missing-engine errors without automatic downloads, late configuration/refresh
recovery with real SVG geometry, and disposal. Existing six-example SVG/Canvas, data-source,
theme, resize and interaction checks still pass. Demo engines and licenses are generated
separately under `demo/vendor`. Reduced package-owned ceilings are 1,000 gzip bytes per
adapter and 15,000 for core+Chart+adapter; wrapper/CSS and unrelated budgets are unchanged.
Engine-inclusive release budget approval remains open.

The Form workflow now verifies asynchronous invalid/valid feedback in portable
containers, native FormData including external associated controls and the submitter,
disabled-fieldset/legend and readonly behavior, Switch keyboard activation, default
reset and cancelled reset in all three engines and both layouts. Screenshots were
checked at mobile and desktop sizes. These are Web interoperability tests, not proof
of non-Web form renderers or real-device accessibility.

Scalar binding also rejects unsupported structural directives added after initial
binding and revalidates text ownership when bound descendants are added, before reusing
cached scalar directives. Focused regressions cover rejection without attaching new
subscriptions and successful refresh after the conflicting markup is removed.

The root API now reports package version `0.13.0` consistently in source, unminified
and minified ESM, classic scripts and the build manifest. Distribution regressions
compare those values with `package.json`.

### Retained plugin checkpoint

The September 23 DataGrid hardening passes build, 67 focused tests and Chromium,
Firefox and WebKit workflows in both layouts. Native sort buttons keep their identity,
focus and accessible names; authored content survives updates, column changes and
reconnection. Plain bounded rows and safe unique columns are validated before visible
mutation. Pre-upgrade rows and disconnected listener/observer cleanup are covered.
The [optional plugin demo](../../demo/components/plugins.html) records the exact baseline
and limitations. Advanced JS is 2,363 gzip bytes, below its unchanged 3,000-byte ceiling.
The new demo passed six startup checks and is included in the full catalog and integrated
suite above. This does not close root/plugin contract approval or screen-reader acceptance.

Rating's follow-up passes build, 73 combined plugin/root/style tests and the same six
browser/layout combinations. It retains native button identity, silent programmatic
writes and user-only change notifications, bounded integer values, live maximum/disabled
updates and reconnect cleanup. It is explicitly a non-form button group, not a native
radio/form replacement. Mobile and desktop screenshots were checked. Widgets JS/CSS
measure 1,498/420 gzip bytes against unchanged 4,000/1,500 ceilings. The plugin demo
documents these limits and the separate Rate family.

## Earlier checkpoints

The following records describe earlier revisions, not the latest gate status above.
Their test counts and open issues must not be treated as current failures or approvals.

The September 22, 2026 post-ViewElement-migration run recorded 4,303 passing and 225 failing
tests. Typecheck, build and 63 focused migration/distribution tests passed. Browser
verification was unavailable. This is a baseline, not a release approval or a current
passing-suite claim.

The first hardening change restores Input's authored native labels and uses ESM
consistently in its demo. All 78 Input tests pass, including two new demo acceptance
tests. The prior run had 52 Input failures. Browser acceptance remains outstanding.

The September 22, 2026 hardening run on Windows / Node 22.12.0 passed all 4,582 tests
with two Vitest workers, no failed or skipped tests. Source typecheck and build passed.
Control and native-interoperability examples were repaired; both runtime formats now
enforce exact dependency-inclusive budgets without the former 200-byte classic allowance.
This run precedes the portable-heading/container correction and is not cross-platform
or browser acceptance. Browser automation failed before connection.

Native-only test expectations also exposed an architectural regression: generic containers
and headings had been changed to HTML instead of using Box and Heading. Portable examples
must use the existing `m-box` and `m-heading` renderers. Explicit Web interop fixtures remain
useful but do not satisfy portable authoring acceptance.

The portable primitive implementation now gives Label a real native label, Details/Summary
native disclosure owners, and Footer/Article/Strong/Em/Small/Pre fixed semantic owners.
Portable Grid and Layout examples use the disclosure renderer. Focused tests cover
association, cancellation, disabled behavior, live state, late content and reconnect.
The [Box demo/API](../../demo/components/box.html) records ownership and limitations;
browser keyboard and assistive-technology verification is still outstanding.

The September 22, 2026 scalar-binding hardening run on Windows / Node 22.12.0 passed
all 4,638 tests across 123 files, with zero failed or skipped tests, after a successful
build. State now rejects unsafe paths and delivers explicit `data-bind-*` / `data-model-*`
channels without old syntax aliases or component-tag inference. The optional state entry
is shared by the root facade; selected components remain independent. App reconnect and
removed-node cleanup are covered. Template/item scopes, Chart integration and browser
acceptance remain outstanding. This evidence does not approve a production release.

September 23, 2026 Chart baseline: build and all 4,694 tests across 127 files passed.
The optional renderer, five source forms, first-batch chart types, demos and generated API
are implemented. Headless Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 passed
desktop/mobile-sized Chart and portable primitive workflows. The
[Chart contract](../elements/contracts/chart.md#8-recorded-verification) records exact
scope and performance observations. Full-family browser and screen-reader acceptance
remain open. Dependency audit remediation, isolated consumer declaration validation and
approval of the new Chart budgets are still release blockers.

The isolated packed consumer now passes all 95 JavaScript entry imports, all package
export asset checks and strict NodeNext declaration checking without repository type
dependencies or skipLibCheck. `pnpm test:package` creates the tarball and consumer
evidence. It exposed Affix's illegal nullable override of native `offsetTop`; Affix now
uses `insetTop` / `insetBottom` and `inset-top` / `inset-bottom`, without a compatibility
layer or TypeScript suppression. Focused Affix/distribution tests (25) and build passed.
Packing no longer unexpectedly runs a prepare build; `prepack` owns the normal package
build, while verification explicitly packs the already-built files with scripts disabled.

Dependency audit remediation on September 23, 2026 pins ECharts 6.1.0 and Vitest 4.1.11.
The registry audit reports zero advisories after these updates. Build and three-engine
Chart browser regression passed without increasing any payload ceiling. The first
Vitest 4 full run passed 4,693 tests; one source-documentation extraction test exceeded
the default five-second timeout under concurrent browser work. Its complete 70-test Log
fixture passed on isolated rerun; that compiler-based test now has an explicit 15-second
limit. A final integrated full-suite run is still required.

The public component alias cleanup removes 53 duplicate names and the alternate
`m-autocomplete` registration. Canonical `AutoComplete` / `m-auto-complete` and all
other unprefixed classes are the only component API. Callers, classic exports, tests,
active documentation and obsolete aggregate selectors were updated together. Build and
the isolated 95-entry consumer check passed, including a new forbidden-alias assertion.
The affected 49-file run passed 2,103 tests with one expected CSS-baseline mismatch from
removing the old selector; the updated CSS baseline and absence assertion passed in the
complete 10-test stylesheet fixture. The final integrated run remains pending.

Form feedback now accepts plain portable `m-span` / `m-box` containers alongside its
native text containers. It still rejects child renderers, interactive/live feedback and
unstable IDs. Build and all 75 Form tests pass, including validation, restoration and
reconnect with both portable tags. Browser-wide demo repairs remain in progress.

The September 23 catalog repair passes all 594 startup checks: 99 pages in Chromium
153.0.8010.12, Firefox 155.0 and WebKit 26.6 at desktop/mobile-sized viewports. Checks
require rendered API documentation, registered public elements and no unexpected local
resource or page errors. Hidden Mention option configuration and the single intentional
Image fallback 404 are explicit exceptions. Chart/primitive workflows and Virtual List
scroll-to-end/height changes pass. Virtual List now establishes block geometry and its
demo waits for loaded styles before strict geometry validation. The targeted three-file
regression passed 248 tests; the preceding seven-file run passed 397 with one stale
classic-script expectation, subsequently corrected in the passing Log fixture.
Evidence is generated under `.vite/browser` and `.vite/demo-repair-regression.json`.
Catalog startup coverage is not full interaction or assistive-technology acceptance.

CI is now configured for Windows/Linux/macOS with Node 22.12 and 24, frozen pnpm
10.28.0 installs, full tests, payload gates and isolated packed consumers. Separate
Linux jobs enforce the three-engine catalog and dependency audit, with retained failure
reports/screenshots. Tests no longer use 114 Windows-only filesystem path literals.
Local frozen installation and the 95-entry packed consumer passed. The integrated
Windows run passed 4,795 tests with one obsolete FloatButton demo-dependency assertion;
the corrected assertion now checks actual component dependency manifests and all 29
FloatButton tests pass. A final integrated run and actual remote CI matrix evidence
remain required; configuring a workflow is not proof that other operating systems passed.

The restricted HTML/remote-loading hardening passes 59 focused security/root tests.
All three browser engines pass HTML filtering checks in both layouts, and Chromium
confirms string HTML fails closed under enforced Trusted Types. Include and Query use
bounded, credential-free, redirect-rejecting requests; cancellation and latest-request
ownership prevent stale writes. The root remains under its unchanged 15,000-byte
runtime ceiling: 14,916 gzip bytes for minified ESM and 14,825 for classic.
See [security boundaries](../security/README.md) for the restricted HTML subset,
explicit trust options and limitations. This is not an independent security audit.

The old aggregate showcase and public migration pages are removed. The current demo
catalog contains 97 pages in eight groups. Native Grid and Transfer interoperability
coverage remains in test-only fixtures; obsolete presentation-parity checks were removed,
not retained as a compatibility product. Foundations now loads only Card when requested.
The seven-file cleanup regression passes 290 tests. Strict runtime trust-option checks
also pass; current root totals are 14,924 ESM / 14,831 classic gzip bytes, still below
the unchanged ceiling. The final 97-page catalog and integrated suite remain pending.

## Work order

The [JavaScript size optimization plan](10-size-optimization.md) is complete through
S6 local integrated acceptance: canonical behavior reconciliation, measured sharing
decisions and optional full-catalog delivery. The release blockers below remain open
independently and define the next work, not unfinished optimization tasks.

1. Close binding resource acceptance and record approval of the implemented release scope. Scalar/model
   binding, nested item scopes, current-key writes, conditional/keyed DOM, portable
   ListTemplate and focus/rebind are implemented and locally tested.
   Root-local/programmatic Web sources, paired IDs and generic portable conditions are
   implemented; broader resource acceptance remains pending. Scoped actions now read
   through the explicit live binding. Define representative workload/latency/resource
   targets and complete final-paint and process-memory/device measurements.
   September 30 evidence adds three-engine second-animation-frame observations and
   Windows Chromium post-disposal process snapshots, not final physical presentation,
   peak-memory or cross-engine/platform resource approval.
   Generic portable conditions are implemented, not the next missing feature;
   do not silently mark broader acceptance complete.
   The [structural delivery plan](../binding/05-delivery-plan.md) records the
   September 29 source review, internal foundation, inline Web and portable List milestones,
   payload measurements and the historical initial 10-15 person-day estimate.
   This is not an updated remaining-work estimate or overall release acceptance.
   The first-five checkpoint adds portable If and repeated fallback-placement/resource
   evidence; it does not approve production performance or human interaction gates.
2. Review retained root foundation/dynamic elements and optional plugins beyond shared
   inheritance: properties, pre-upgrade values, lifecycle, events and ownership.
   DataGrid and Rating have documented, browser-verified baselines. The retained-root
   checkpoint above closes the four identified Theme, Field, AccordionItem and App
   lifecycle gaps, including selected-style ownership. The first-five checkpoint reviews
   all retained root/plugin tags and fixes further role/Spacer/primitive ownership.
   Obtain contract approval; these corrections alone do not close this gate.
   Continue family contract review and separate native Web examples from portable
   authoring acceptance. A passing startup catalog does not settle these contracts.
3. Expand representative interaction acceptance beyond Chart, primitives, Form and
   Virtual List. Run real screen-reader/device/input-mode checks, including IME, RTL,
   forced colors and zoom; preserve focus, native forms and authored state.
4. Complete security/performance review across the supported surfaces. Review Chart's
   renderer-inclusive payload recommendations and approve measured performance targets.
   Adjust size recommendations when required behavior justifies growth. Current local observations are not
   performance approvals or an independent security assessment.
5. Obtain actual Windows/Linux/macOS and Node 22/24 CI evidence from clean machines.
   Current local tests and packed-consumer checks do not prove this matrix.
6. Re-run the automated gates after remaining implementation work, reconcile release
   notes and obtain release approval. Publishing and pushing require authorization.

Finish and record each bounded change before starting the next. Existing failures remain
release blockers even when unrelated to the latest change.

## References

- [Element contract authority](../elements/01-contract.md)
- [Component acceptance workflow](../elements/04-development.md)
- [Selected-file delivery](07-modules.md)
