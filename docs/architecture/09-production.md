# 9. Production readiness

**The agreed development and local verification work is complete.**
Implementation checkpoint: `d2bd145`, October 1, 2026. It was committed locally;
no push or publication was performed. This is not production-release approval.

Outstanding release work is recorded once in the
[handoff's future-work list](../../HANDOFF.md#future-work). It is retained for later
reference, not an instruction to reopen completed work or start another acceptance sweep.

## Task summary

| Area | Current result | Boundary |
| --- | --- | --- |
| Source and delivery | Small shared core, selectable families/state/plugins and optional aggregate. | No mandatory aggregate, duplicate core or production metadata engine. |
| Component contracts | All 89 families received finite source/demo/existing-fixture review; scoped fixes are delivered. | Finite review is not exhaustive interaction coverage or formal approval of every contract. |
| Canonical owners | Transfer, TimePicker, InputOTP, Mention, AutoComplete, Rate, Slider, DatePicker and ColorPicker share their existing behavior owners. | Native-Web enhancement entries are interoperability, not competing logical APIs. |
| Binding and authoring | Scalar/model binding, nested scopes, conditional/keyed DOM, If/ListTemplate, reusable sources, paired IDs and scoped actions are implemented. | Do not list these as missing features. Non-Web renderers are not delivered. |
| Presentation and lifecycle | viewStyle is independent inline CSS; ownership, cancellation, reconnect, animation and sparse-input corrections are delivered. | Current source and demos define the contracts. |
| S0-S6 optimization | Complete; dependency-inclusive measurements and advisory size reporting are retained. | Frozen S0 is unchanged; do not cut functionality to fit byte recommendations. |
| Local gates | Type/build/API, full existing tests, actual packed consumption and representative browser workflows passed. | Evidence is for this Windows / Node 22.12.0 checkout, not a clean multi-OS/Node matrix. |
| Production release | Not requested or approved. | See the future-work list; do not infer approval from local automation. |

## Release gates

- [x] Current local type/build/API and complete existing test suite.
- [x] Actual packed strict NodeNext and modular/optional-aggregate consumption.
- [x] Representative Chromium/Firefox/WebKit workflows in two viewport layouts.
- [x] Shipped-file measurement/dependency integrity and direct dependency consistency.
- [ ] Approved release scope and matching public contracts/examples/lifecycle evidence.
- [ ] Clean supported-OS/Node CI for the intended committed revision.
- [ ] Real-device, screen-reader, IME and OS/browser-setting acceptance.
- [ ] Independent security review and current dependency-advisory triage.
- [ ] Agreed production performance/resource acceptance, including Chart's engine.
- [ ] Final revision checks, release notes and explicit push/publication authorization.

These are separate release boundaries. A mobile-sized headless viewport is not a
physical phone; a passing functional test does not establish an unmeasured latency,
memory or accessibility target. Adjustable size recommendations are not hard gates.

## Current evidence

| Check | Latest result |
| --- | --- |
| Full suite | 5,754 / 5,754 cases in 153 files; four workers; zero failures/pending. |
| Packed consumer | 96 JS entries / 2,384 files; strict NodeNext and modular/aggregate runtime passed, without installed ECharts. |
| Browser workflows | Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6; 1280x900 and 375x812 viewports. Template/ListTemplate/source/paired-ID/action matrices each have 12 ESM/classic runs; combined workflows and NumberAnimation demo each have six engine/layout runs. |
| Integrity | 296 runtime/CSS measurements, JS hash/metafile checks, byte/gzip totals and dependency closures verified. |
| Dependencies/docs | Seven direct development dependencies agree with lock/install state; zero mandatory runtime dependencies. Seven changed Markdown files passed 171 inline local target/active-anchor checks. |
| Aggregate payload | 333,023 / 331,539 gzip bytes including dependencies, ESM/classic. Above the unchanged 315,000 recommendation; 61 measurement recommendations warn. |

The first full run had one outdated Slider demo assertion. Its existing fixture was
corrected to distinguish portable single/range configuration from native-Web examples;
runtime and demo functionality were not reduced. Initial failures and verified reports
remain separate. External links, archived anchors and a fresh dependency-advisory audit
were not part of the latest local consistency check.

The [handoff](../../HANDOFF.md#evidence-and-reproduction) lists current evidence paths
and reproduction commands. Generated `.vite`, `dist` and `demo/api` outputs are local;
they are not guaranteed in a fresh checkout.

## Checkpoint links

These short landmarks preserve existing documentation links. Detailed chronology,
historical sizes and raw-failure context belong to the archive, not the current task list.

### First Five Checkpoint

Portable If, fallback placement/resource observations, retained-root ownership,
representative interaction and Chart/data hardening are implemented.
[Historical record](../archive/architecture/07-production-checkpoints.md#first-five-checkpoint).

### Scoped Action Checkpoint

Actions read typed arguments through the explicit live binding and keep literal parameters
distinct. [Contract](../binding/06-actions.md);
[historical record](../archive/architecture/07-production-checkpoints.md#scoped-action-checkpoint).

### Paired ID Checkpoint

Template instances retain scoped native ID/IDREF associations.
[Contract](../binding/03-templates.md#paired-ids);
[historical record](../archive/architecture/07-production-checkpoints.md#paired-id-checkpoint).

### Reusable Template Source Checkpoint

Referenced root-local and programmatic Web sources are implemented.
[Contract](../binding/03-templates.md#referenced-and-programmatic-sources);
[historical record](../archive/architecture/07-production-checkpoints.md#reusable-template-source-checkpoint).

### Portable List Template Checkpoint

ListTemplate provides the portable inert source while the optional state owner reconciles
instances. [Delivery plan](../binding/05-delivery-plan.md);
[historical record](../archive/architecture/07-production-checkpoints.md#portable-list-template-checkpoint).

### Web template checkpoint

Conditional/keyed Web templates, nested current-key scopes and explicit cleanup are delivered.
[Contract](../binding/03-templates.md);
[historical record](../archive/architecture/07-production-checkpoints.md#web-template-checkpoint).

### Internal scope foundation checkpoint

The binding's scope/data/change foundations are implemented, not pending generic-engine work.
[Delivery plan](../binding/05-delivery-plan.md);
[historical record](../archive/architecture/07-production-checkpoints.md#internal-scope-foundation-checkpoint).

### Retained root lifecycle checkpoint

Theme, Field, AccordionItem and App have the retained local lifecycle baseline.
[Current guide](../api/01-core.md#optional-root-lifecycle);
[historical record](../archive/architecture/07-production-checkpoints.md#retained-root-lifecycle-checkpoint).

## Work order

No further implementation or acceptance sweep is scheduled by this checkpoint.
When release work is explicitly requested, select an item from the
[future-work list](../../HANDOFF.md#future-work), confirm its scope/environment and
reuse existing evidence before adding measurements or changing code.
Do not restart S0-S6, implemented templates or the completed family review as missing work.
Only rerun gates relevant to subsequent changes; obtain explicit push/publication approval.

## References

- [Source ownership](06-source.md) and [selected delivery](07-modules.md): current implementation boundaries.
- [Element contracts](../elements/01-contract.md) and [development workflow](../elements/04-development.md): acceptance rules.
- [S0-S6 record](10-size-optimization.md): completed optimization decisions.
- [Production checkpoint archive](../archive/architecture/07-production-checkpoints.md): previous measurements and scoped conclusions, not implementation authority.
