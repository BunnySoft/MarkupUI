# 9. Production readiness

Status: release blocked. A shared ViewElement base and successful build do not establish
production readiness. Every supported family needs evidence for its declared contract.

## Release gates

- [ ] Clean, reproducible install, typecheck, build and full test suite on supported Node
  versions. No unexplained failures, unhandled errors or skipped acceptance tests.
- [ ] Every shipped family has an approved contract and matching implementation, generated
  API documentation and working examples. Experimental or deferred features are identified.
- [ ] Public examples use the cross-platform `m-*` vocabulary. Native HTML is confined to
  the Web renderer and explicitly Web-specific interoperability/fallback examples.
  Primitive renderers provide real semantics; renaming tags or forwarding clicks is not
  sufficient. Tests validate both portable source markup and platform output.
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
- [ ] CI enforces automated gates. Release notes describe API changes, supported
  environments and capability limitations. No legacy migration or compatibility code
  is required for this development-stage library. Publishing is a separate,
  explicitly approved action.

## Current evidence

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

1. Finish the portable primitive contracts and renderers, starting with labels, disclosure
   and semantic structure. Keep `m-*` public authoring and validate native Web output.
   Do not substitute HTML just to satisfy a test's hard-coded tag expectation.
2. Audit remaining examples and tests for platform leakage. Keep native-interoperability
   tests separate from portable acceptance, preserving labels, forms, focus and semantics.
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
