# 5. Structural binding delivery plan

Status: **Web templates, reusable sources, paired IDs, scoped actions, portable ListTemplate and If implemented; broader release acceptance open.**
Prepared September 29, 2026 against `2384748`. This records the scope review requested
after the session handoff. It does not claim a release-scope reduction or delivered
collection API. Subsequent user direction makes byte budgets advisory and adjustable;
the [size policy](../architecture/07-modules.md#size-policy) records that decision.
Implementation and file edits proceed without per-file confirmation.

## Implementation checkpoint

The first-five workstream adds Box-owned `m-if` using the existing state reconciler,
strict conditions, nested scope preservation and explicit `focus-target` policy.
No component/state runtime dependency or extra entry is introduced. Native chrome
captured before binding is adopted by Box primitives, including labels and disclosure.
The [portable condition contract](03-templates.md#portable-conditions) supersedes the
generic-condition gap in the historical checkpoints below. Current verification and
remaining human/resource gates are tracked in the
[first-five checkpoint](../architecture/09-production.md#first-five-checkpoint).

### Scoped Action Checkpoint (Historical)

September 29 UTC scoped-action extension: `m-arg-*` reads typed values from an explicit
live binding at activation. `Binding.read` resolves current item/parent/root/key/index
data, rejects disposed/foreign/retiring ownership and does not expose a new write API.
App installs actions with its existing binding; direct installations must pass one
explicitly. Literal `m-param-*` remains separate, nested action roots execute once,
and sync/async exceptions use one error path. See the
[action contract](06-actions.md) and [evidence](../architecture/09-production.md#scoped-action-checkpoint).
Verification passed 5,383 integrated tests in 152 files, 408 focused tests, build,
packed consumption and all twelve three-engine/two-layout ESM/classic combinations.
App also releases a newly created binding if action installation fails during setup.
Generic portable conditions and broader resource acceptance remain open.

### Paired ID Checkpoint (Historical)

September 29 paired-ID extension: one-way application IDs and label/ARIA references
are validated against the next surviving tree. Root-level pairs and repeated native/
portable content share the same checks; arbitrary IDs are not generated or rewritten.
Text only removes a target when a write will actually replace its content, and unowned
external text directives cannot hide collisions. Root subscription changes preserve
unchanged drafts. See the [paired-ID contract](03-templates.md#paired-ids) and
[paired-ID evidence](../architecture/09-production.md#paired-id-checkpoint).
Verification passed 5,340 integrated tests, 302 focused tests, typecheck/build,
packed consumers and three-engine/two-layout ESM/classic workflows.
Scoped actions were outside that checkpoint and are implemented above.
Generic portable conditions and broader resource acceptance remain open.

### Reusable Source Checkpoint (Historical)

September 29 source extension: `data-template="#id"` resolves a unique inert definition
inside the explicit binding root; `data-template="name"` resolves the supplied
`BindingOptions.templates` Map. Native definitions are Web-only; both native structural
placements and portable List regions reuse them. Definitions remain unchanged, nested
graphs are preflighted, cycles/expansion are bounded, and changed expanded content
replaces affected placements through existing focus/lifecycle rules.
See the [source contract](03-templates.md#referenced-and-programmatic-sources).
The [source checkpoint](../architecture/09-production.md#reusable-template-source-checkpoint)
records 5,285 integrated tests, 247 focused tests, browser/package checks and measured costs.
Paired IDs were outside that milestone. Generic portable conditions, scoped action
arguments and broader resource acceptance remain open; neither extension closes release gates.

### Portable List Checkpoint (Historical)

September 29, 2026: List now includes `m-list-template`, with one ListItem source root,
an explicit `data-each` store route and required stable key. State recognizes this
declared source through an ordinary native accessor, not runtime metadata or component
registration. List owns inert capture and native `ul`/`li` semantics; the existing
binder alone owns generated placement, scopes and model listeners.

| Boundary | Implemented | Still required |
| --- | --- | --- |
| B1/B5 portable region | One direct ListTemplate; source capture, nested scopes, native semantics, live demo and generated API; authored List remains supported. | Broader retained-family and non-Web renderer acceptance. |
| Store and delivery | One explicitly bound store; computed `items`; authored-item methods reject template mode. Ordinary List still depends only on core; state does not import component runtimes. | No new keyed collection mutation API or item-scoped action arguments is claimed. |
| B4 focus/lifecycle | Explicit `focus-on-remove` targets a surviving list; Web callback takes precedence; nested removed targets are excluded. Stop/rebind and App reconnect retain instances. Native blur/change cannot write a retiring key. | Real IME, device and screen-reader acceptance; broader retained-memory measurements. |
| B6 evidence | Focused/full tests, selected ESM/classic browsers, packed consumption, demo screenshots and dependency-inclusive sizes are recorded separately. | Independent security/performance review, remote CI and release authorization. |

See the [portable checkpoint](../architecture/09-production.md#portable-list-template-checkpoint)
for completed checks and exact measurements. Referenced/programmatic template sources,
paired bound IDs and generic portable conditions were outside that bounded milestone.
The 1,000-item bound remains an input contract, not a performance approval.

### Inline Web checkpoint (historical)

September 29, 2026: `bind` now connects the internal scopes to actual native-template
instances. This is B2/B3 plus the initial Web lifecycle/focus work in B4, not closure of
the portable B1/B5/B6 release contract.

| Boundary | Implemented | Still required |
| --- | --- | --- |
| B2 scopes/subscriptions/models | Nested live item/parent/root/index/key paths; current-key event writes; internal whole-store observation; read-only preparation cache. | Independent security and broader performance acceptance. |
| B3 inline Web templates | Strict Boolean conditions, complete key/source/value preflight, stable nodes, nested templates and failure cleanup. | Referenced/programmatic sources; paired bound-ID policy. |
| B4 Web lifecycle | Retained instances across stop/rebind/App reconnect; source removal; explicit focus fallback; focus/selection/draft preservation and reentrant update bounds. | Portable consumer focus API and actual IME/device/screen-reader checks. |
| Ownership | Sources and instance roots stay with their original parent; extracted scoped descendants cannot become implicit root models. External ownership transfer is rejected. | Approval for any future integration with independently moving consumers. |
| B5 portable consumer | No List/ListItem API is added. Native templates are explicitly a Web adapter. | Portable region authoring, semantics, demo and acceptance. |

The [implemented Web contract](03-templates.md) defines focus callback shape, ID
restrictions, initialization and error limits. The optional state entry now includes
the renderer; it remains independent of core/components. Size recommendations remain
advisory, with actual dependency-inclusive overages recorded rather than hidden by
packaging changes.

Verification evidence is recorded in the
[Web template checkpoint](../architecture/09-production.md#web-template-checkpoint).

## Scope foundation checkpoint (historical)

September 29, 2026, uncommitted work after the size-policy checkpoint:

| Boundary | Implemented | Still required |
| --- | --- | --- |
| B2 data scopes | Internal `src/state/scope.ts` resolves root/item/parent/index/key contexts; conditional contexts retain the nearest item level. Root dollar-prefixed paths remain literal. | Associate scopes with actual template instances and their subscription lifecycle. No public scope API is exported. |
| B2 writes | Resolve every enclosing key against current store data before `store.set`; protect key paths and ancestors, reject missing/ambiguous keys and disposed contexts. | Wire model events to these routes during template creation, refresh and removal. |
| Collection preparation | Dense plain arrays of at most 1,000 records; complete own-data validation and unique string/safe-integer keys. Number/string keys are distinct; records retain identity. | DOM reconciliation, focus/selection preservation and measured large-list performance. |
| Shared data validation | Scalar binding and internal scopes use `src/state/data.ts`; hidden symbol members are rejected alongside accessors and executable values. | Independent security review; this is not a general-purpose hostile-object sandbox. |
| B3-B6 delivery | No template rendering, browser fixture or portable consumer is added by this checkpoint. | Inline Web adapter, subscriptions, stop/rebind, portable List/ListItem, browser and resource acceptance. |

Scope disposal here only invalidates data access for the scope and its descendants.
It does not dispose DOM, observers or subscriptions, which this module does not own.
Array `length` is read-only for scope models; explicit collection replacement remains
available. This avoids truncating a keyed collection through a scalar model.
At this historical checkpoint, collection resolution validated live data on each access rather than caching a
possibly stale array index. Renderer integration must measure repeated resolution costs;
the 1,000-item input bound is not a performance acceptance claim.

At this historical checkpoint, `bind` still rejected `data-if` and `data-each`; prefix
syntax was internal-only and B2 was partially complete. Scope code was not imported by
the state bundle. These earlier measurements cover only the shared validator change,
not the subsequently implemented template runtime.

Verification: 5,175/5,175 integrated tests, 123/123 final focused tests, build and packed
consumer passed locally. State gzip is 2,610 ESM / 2,818 classic bytes; recommendations
and S0 are unchanged. See the
[recorded checkpoint](../architecture/09-production.md#internal-scope-foundation-checkpoint)
for dependency-inclusive measurements, evidence files and remaining acceptance boundaries.

## Verified starting point (historical)

| Surface | Current implementation | Consequence |
| --- | --- | --- |
| `src/state/binding.ts` | Scalar/model directives, one explicit store per root, refresh and disposal; structural directives throw. | Templates need an instance lifecycle, not just two additional attribute handlers. |
| `src/state/path.ts` | Safe own-property dot paths, including array indices. | Reuse validation; an array index alone cannot identify a writable keyed item after reorder. |
| `src/state/index.ts` | Synchronous notifications for ancestor/descendant paths. | Nested collection writes and reentrant notifications need explicit tests. No store transaction or DOM rollback exists. |
| `src/components/foundation.ts` | App binds once, refreshes on child mutations, disposes on disconnect and rebinds on reconnect. | Generated mutations must settle without observer loops or duplicate instances on rebind. |
| `src/components/avatar/group.ts` | AvatarGroup moves avatars between direct children and its overflow container. | A binder cannot independently assume those nodes stay in a single sibling region. |
| `src/components/dynamic-input/dynamic-input-element.ts` | Portable template region delegates to an existing keyed collection controller. | Do not introduce a second row owner or silently replace that controller. |
| `src/components/list/list.ts` | Existing authored ListItem composition and computed `items`; no data-template API. | A candidate with fewer placement conflicts, not an approved template consumer. |

The worktree was clean at inspection. Binding, state-path and root-lifecycle fixtures
passed **60/60 tests in three files** on the local Windows environment. This is a new
focused baseline, not a rerun of the full suite or browser matrix.

Existing distribution bytes were measured with level-9 gzip and their SHA-256 hashes
matched `.vite/size/root-lifecycle.json` during the initial read-only scope review:

| Runtime | Current gzip bytes | Recommendation | Distance below recommendation |
| --- | ---: | ---: | ---: |
| State ESM | 2,581 | 4,000 | 1,419 |
| State classic | 2,792 | 4,000 | 1,208 |

The root also depends on state and has a 15,000-byte dependency-inclusive recommendation.
These values do not constrain the template contract. Measure complete costs and adjust
recommendations when useful; do not remove behavior or split packaging merely to fit.

## Original first contract (historical)

These are the original working rules. The current checkpoint and Web contract above
identify implemented syntax and the remaining portable/source milestones.

| Area | Proposed rule |
| --- | --- |
| Conditions | Boolean only; false removes/disposes the instance. Reject missing, null and non-Boolean values. Use visibility binding for retained hidden content. |
| Collections | Dense plain-data arrays, initially at most 1,000 items per region; empty array is valid. Reject sparse arrays, non-arrays and oversized input before tree mutation. The bound needs acceptance measurements. |
| Keys | Required own-data path relative to each record. Nonempty strings or safe integers; no index fallback. Numeric and string keys remain distinct. Validate the entire key set for duplicates before mutation. |
| Instance shape | One element root, with whitespace/comments permitted around it. Reject extra element roots and non-whitespace sibling text. Nested structural templates are allowed. |
| Sources | Inline sources first. Referenced IDs and programmatically supplied templates stay outside the first implementation milestone, not silently removed from release scope. No document-wide lookup or remote template loading. |
| Ownership | The binder owns each generated instance and its placement; a consumer owns its semantic UI. No competing text owner, overlapping binder or independent child-reordering controller in the same region. |
| Updates | Whole-array replacement and existing store-path writes. Same key retains the instance and updates item/index context; different key creates a new instance. No new public insert/move/delete store API. |
| Initialization | Upgrade selected elements and prepare properties while detached where possible. Resolve native model owners only when available; attachment failure must release everything attached by that attempt. |
| Disposal | Release child scopes, subscriptions and model listeners idempotently. Structural removal removes owned instances; ordinary root disposal preserves current DOM, as `Binding` already promises. |
| Rebind | Rebinding the same root must recognize and reconcile retained generated instances without cloning duplicates or turning former item paths into root paths. Specify internal ownership bookkeeping before implementation. |
| Errors | Invalid shape/keys/directives leave the previous region intact. A store notification error does not roll back `MStore.state`; corrected data can retry. Do not promise rollback of arbitrary component setters. |

Do not reinterpret unrelated scalar bindings or add a generic property engine. Keep
implementation in `src/state`, with a small internal scope/template module only where
the actual complexity warrants it. Consumer behavior stays in its existing family.

### Scope and writable routes

Recommended template-instance paths use explicit `$root`, `$item`, `$index`, `$key`
and `$parent` prefixes. Unprefixed paths continue to mean root-store paths, preserving
existing scalar meaning; context prefixes are interpreted only inside template instances.
The root binding retains ordinary store paths, including existing `$`-prefixed keys.
`$parent` refers to the enclosing repeated-item scope; conditions do not add item scopes.
Missing parent context is an error, not an implicit root fallback.

`$index` and `$key` are read-only. `$item.field` is writable only when its collection
has an explicit store-owned route. At event time, resolve every enclosing stable key
against the current collection, then write through `store.set` using the current path.
Never capture an insertion-time index, mutate an arbitrary item reference or recreate
an item that has been removed. A missing/ambiguous key rejects the write.

Reject model writes to the item's key path or an ancestor containing it; key changes
must be explicit collection updates. Scope replacement must retarget subscriptions
even when the array length, element type and key order do not change. Item/parent/root
path combinations need tests with nested collections and immutable record replacement.
Named action arguments remain unchanged in this milestone; item-scoped actions would
need their own contract rather than borrowing DOM ancestry.

### Focus, IDs and lifecycle

For surviving instances, preserve node identity, active native control, selection and
uncommitted editing state during reorder. Prove this in the existing three-engine
browser harness, including IME-related event sequences; actual IME/device acceptance
remains a separate human gate.

Before removing a focused instance, the owning application/consumer must provide a
focus policy. Recommend a direct Web adapter option that receives removal context and
returns a surviving focus target, with no DOM mutation during preparation. Do not guess
the next arbitrary focusable node. A focused removal without a valid policy should fail
before tree mutation. Finalize the option shape and portable consumer policy with their implementation.
If focus is outside the region, leave it alone.

Reject fixed authored IDs in repeated content, including nested inert sources. Do not
silently rewrite `id`, `for` or ARIA references. Prefer wrapping labels and explicit names;
any data-bound IDs need uniqueness checks and correctly paired references before insert.
Renderer-generated IDs remain the component's responsibility.

Binder moves must not dispose surviving scopes, but that alone does not prove native
resources survive a DOM move. Browser tests must cover native drafts and component
disconnect/reconnect behavior. Root disposal must not restore stale application values.
Document ownership transfer of externally moved nodes and repeated stop/rebind before
declaring App lifecycle acceptance.

## Original implementation decisions (historical)

| Decision | Working direction | Remaining implementation detail |
| --- | --- | --- |
| Portable template authoring | Treat native `template` only as an explicitly Web-specific adapter for early fixtures. Define a portable template region for the proving consumer, backed by inert native content in its renderer. | Choose the element/region name, inert initialization and source ownership. Do not claim native-only fixtures close portable acceptance, or add `m-template` implicitly. |
| Proving collection consumer | Use List/ListItem as the first implementation target: retain computed `items` and authored composition, and use the shared binder for its new data region. Keep AvatarGroup overflow integration outside this first milestone. | Specify collection property, item region, writable route and focus policy together while implementing. This does not claim the API is already shipped. |
| Initial scope and delivery | Implement inline templates first; keep the binder in optional state and measure both formats. | Size is advisory and adjustable. Introduce another selected entry only for a demonstrated ownership/loading need, not because a byte recommendation is exceeded. |

At the initial review, the next step was the first Web adapter milestone.
That adapter and the portable consumers are now implemented; do not restart this plan.
The current implementation checkpoint and remaining acceptance checklist govern next work.
No full-catalog dependency, component metadata lookup, new framework or non-Web renderer
is part of this proposal.

## Implementation order and estimate

Engineering estimates below are **remaining person-days at the initial scope review**,
assuming an engineer familiar with this repository and an eight-hour day. They have not
been re-estimated after the completed implementation milestones above and are not a
current remaining-work estimate.
They include focused tests and documentation, not external review waiting time or
independent real-device/security reviews. They refine only the structural-binding task;
the other release workstreams have not been re-estimated.

| Step | Bounded deliverable | Person-days | Exit evidence |
| --- | --- | ---: | --- |
| B1 | Finalize the portable region and focus API while preparing implementation. | 1 | Recorded contracts and dependency/measurement plan; no byte-fit gate. |
| B2 | Internal scope resolution and stable writable routes using existing store paths. | 2-3 | Nested parent/root/item tests; reorder/removal write tests; scalar regression. |
| B3 | One-root conditions and keyed reconciliation, including error preparation and disposal. | 2-3 | Identity, full-key validation, nested updates, failure cleanup and reentrancy tests. |
| B4 | Refresh/App lifecycle and focus integration. | 1-2 | Mutation settling, repeated rebind, external DOM ownership and native-model tests. |
| B5 | Portable List/ListItem consumer and its demo/API documentation. | 2-3 | Portable source plus renderer semantics, real composition and focus evidence. |
| B6 | Browser/distribution acceptance and release-work-order update. | 2-3 | Three engines/two layouts, packed types/imports, full suite and size report. |
| Total | Structural binding only | **10-15** | No release-ready claim until all applicable gates pass. |

The earlier rough estimate was 8-15 person-days. Source inspection raises the lower
bound to account for rebind ownership and portable authoring. Size-fitting work is
not included or required. A consumer redesign requires re-estimation, not automatic use
of the upper bound as a commitment.

## Acceptance checklist

Checked items record the bounded local implementation and evidence linked above,
not independent review or release approval.

- [x] Final implemented scope, portable consumer and delivery contract recorded.
- [x] Unsafe paths/data and invalid conditions, arrays, keys, roots and references fail
  without attaching leaked listeners or partially replacing a valid region.
- [x] Reorder and same-key record replacement preserve nodes and route later edits to
  the current item, including nested keyed parents; removed keys cannot receive writes.
- [x] Scalar/model behavior remains intact; no root-path reinterpretation, event
  feedback loop, unrelated-descendant write or hidden document-wide activation.
- [x] Refresh, source removal, root stop/rebind, App reconnect and failed initialization
  leave one owner per region and no stale subscriptions, resources or generated copies.
- [x] Browser evidence covers focus/selection/drafts, native controls and portable
  composition. Screen-reader/real-device acceptance is tracked separately, not inferred.
- [x] Both formats and the packed consumer pass; report complete costs and any adjusted
  size recommendations. Measure selected dependencies, never just an entry file.
- [x] Record startup, reorder/update and repeated mount/unmount observations for
  0, 1, 100 and 1,000 items.
- [ ] Approve representative workload/performance targets and complete final-paint,
  process-memory and real-device measurements.
- [ ] Complete human accessibility/input-mode acceptance, independent security review,
  clean cross-platform CI and release approval.

## References

- [Binding language](01-language.md)
- [Scopes](02-scopes.md)
- [Templates](03-templates.md)
- [Element integration](04-integration.md)
- [Production work order](../architecture/09-production.md#work-order)
- [Source ownership](../architecture/06-source.md)
- [Core and component delivery](../architecture/07-modules.md)
