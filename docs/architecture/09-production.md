# 9. Production readiness

Status: release blocked. A shared ViewElement base and successful build do not establish
production readiness. Every supported family needs evidence for its declared contract.

## Release gates

- [ ] Clean, reproducible install, typecheck, build and full test suite on supported Node
  versions. No unexplained failures, unhandled errors or skipped acceptance tests.
- [ ] Every shipped family has an approved contract and matching implementation, generated
  API documentation and working examples. Experimental or deferred features are identified.
- [ ] Deliver and validate [Chart (`m-chart`)](../elements/contracts/chart.md) with an optional
  Apache ECharts Web renderer, ECharts-shaped declarative configuration, all first-batch
  chart types and all five data-source forms. Chart is required before release, not deferred.
- [ ] Keyboard, native labels/forms, focus recovery and screen-reader behavior are verified.
  Include disabled/readonly states, IME, RTL, reduced motion, forced colors and zoom.
- [ ] Representative workflows pass in Chromium, Firefox and WebKit on desktop and mobile
  layouts. Record actual browser versions and evidence; JSDOM is not browser acceptance.
- [ ] Lifecycle tests cover pre-upgrade writes, reconnect, cancellation, stale async work
  and release of listeners, observers, timers and resources without losing authored state.
- [ ] Security review covers HTML/URL handling, dynamic content, unsafe sinks and applicable
  CSP behavior. Dependency audit findings are triaged; zero runtime dependencies is not a
  substitute for review.
- [ ] An actual packed package installs in a clean consumer. Exports, declarations, assets,
  ESM/classic loading and shared-core identity work without repository-only files.
- [ ] Existing dependency-inclusive payload budgets pass; large-data interactions and
  repeated mount/unmount workflows have measured performance and memory results.
- [ ] CI enforces automated gates. Release notes describe breaking changes, supported
  environments, capability limitations and migration steps. Publishing is a separate,
  explicitly approved action.

## Current evidence

The September 22, 2026 post-ViewElement-migration run recorded 4,303 passing and 225 failing
tests. Typecheck, build and 63 focused migration/distribution tests passed. Browser
verification was unavailable. This is a baseline, not a release approval or a current
passing-suite claim.

The first hardening change restores Input's authored native labels and uses ESM
consistently in its demo. All 78 Input tests pass, including two new demo acceptance
tests. The prior run had 52 Input failures. Browser acceptance remains outstanding.

Failure clusters include Input, InputNumber, Select, Slider, Pagination, Layout, Grid,
FloatButton, List, Table and Thing, plus delivery assertions in Dropdown and Flex.
Determine whether each failure is a product defect, invalid example or stale assertion
against its contract before changing it. Do not weaken validation or raise budgets merely
to make the suite green.

## Work order

1. Restore native-control correctness and valid examples, starting with Input, then
   InputNumber, Select, Slider and Pagination. Add regressions for the actual defect.
2. Resolve the remaining layout, semantic-content and delivery failures. Audit Box
   primitives used in place of native labels, buttons, headings and disclosures.
3. Audit retained foundation/dynamic elements and optional plugins beyond base-class
   inheritance: properties, lifecycle, events and ownership.
4. Implement the required [Chart contract](../elements/contracts/chart.md): Bar, Line/Area,
   Pie/Doughnut and Scatter; property assignment, scoped binding, JSON attributes, nested
   JSON and remote JSON. Deliver the binding integration and optional ECharts packaging
   without making either a prerequisite for unrelated components.
5. Complete browser/accessibility acceptance and security/performance reviews, with
   explicit supported environments and documented capability fallbacks.
6. Verify the packed consumer experience, enforce CI gates and reconcile the component
   inventory before proposing a release.

Finish and record each bounded change before starting the next. Existing failures remain
release blockers even when unrelated to the latest change.

## References

- [Element contract authority](../elements/01-contract.md)
- [Component acceptance workflow](../elements/04-development.md)
- [Selected-file delivery](07-modules.md)
