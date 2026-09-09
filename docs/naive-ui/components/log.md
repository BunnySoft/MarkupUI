# Log

**🟢 Verified retained plain-log scope.** Native pre/code, actual retained line/Text nodes,
explicit append/replace/retention limits, display trimming, selection-safe updates and
conditional follow-tail. No terminal emulator, highlighter, autolinks, network producer,
clipboard, hidden store or virtual-window claim.

[Canonical API/ownership/acceptance](../../components/log.md) ·
[Native Code](../../components/code.md) · [Separate Virtual List](../../components/virtual-list.md).
This implementation reuses Code's external CSS. It intentionally keeps all bounded retained
records selectable/findable/printable instead of duplicating Virtual List's window engine.

**Delivery phase:** P5. **Task state:** 🟢 Verified retained native scope.
**Next:** Infinite Scroll, then Popselect and Split. P5 remains incomplete.

1. [x] **Build a readable fallback.** Passive labelled pre/code with literal authored text;
   enhanced records are concrete native spans with stable keys and Text nodes.
2. [x] **Specify append/clear behavior.** LF normalization, partial CR settlement, whole-line
   retention, explicit replace/clear generations and native selection protection.
3. [x] **Gate virtual rendering.** No Log virtualization. Declare and measure 10,000 actual
   mounted line spans and bounded retained characters, rather than count one giant text node.
4. [x] **Test streaming conditions.** Local burst/scroll/follow/selection/clear/resize/
   teardown tests, browser acceptance, declarations/build/budgets and unchanged prior assets.

### Native primitives and fallback

Keep native pre/code, normal browser selection/find/scroll, decorative empty line-number
markers and outside application controls. Only append/replace/trim/loading state is owned.
Scroll observation is passive; ResizeObserver is scoped to the viewport, with explicit
refresh fallback. No frame/timer/wheel/data-loader loop or highlighter configuration.
Disconnect leaves current native text readable instead of restoring stale source data.

## Reference and review boundary

- [Live official page](https://www.naiveui.com/en-US/os-theme/components/log), rendered
  Naive UI 2.45.3 on 2026-09-09 despite HTTP 404.
- [Pinned API][api], [Log source/interfaces][log], [line rendering/trim][line],
  [loading source][loader], [public exports][exports], [public types][public].
- [Catalog](../index.md) · [Architecture](../architecture.md).

Revision **42a52e6436b38bed456fee19eb0b89cdcd00fcc2**.
Source log splitting uses LF, uses truthy log before lines, and trims each displayed line.
Markdown lines defaults to undefined while source defaults to []; an empty log string falls
back to lines in source. The native target rejects simultaneous text/lines and defines empty
text as one empty appendable record. CRLF/lone CR normalize explicitly; raw normalized
retained text is separate from optional per-line display trimming.

Source uses Code, a custom Scrollbar, reactive per-line components, injected highlighter
state and loading animation. The native target takes no syntax-engine path, and never writes
log data through innerHTML. Wheel-at-boundary retry and implicit require-more loading are
omitted; one native edge event only reports a real observed boundary transition.

**All 21 original section/member/kind/API-line identities remain in order**:
14 original table rows + seven original inline fields.
`API:Lnn` means the pinned [API][api] URL plus `#Lnn`.
Source-only entries below are explicit supplements, not invented original API.
Verified means the stated native adaptation, never framework/highlighter parity.
**21 original identities + 25 source-only supplements = 46 rows:
19 adapted native capabilities + 27 intentional omissions; zero unresolved.**

<!-- BEGIN PINNED API INVENTORY -->

### Log Props

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `font-size` · API:L60 | Prop | External --mui-log-font-size, default .875rem; native scalable font, no numeric prop bridge. | 🟢 Verified |
| `hljs` · API:L61 | Prop | No external syntax engine, adapter, grammar or engine-object promise. | ⏭️ Intentionally omitted |
| `language` · API:L62 | Prop | Always literal text; no language detection or unsafe fallback renderer. | ⏭️ Intentionally omitted |
| `line-height` · API:L63 | Prop | External --mui-log-line-height, default 1.25; actual native block metrics. | 🟢 Verified |
| `lines` · API:L64 | Prop | Initial lines/setLines, explicit strings without CR/LF; replacement creates a new generation. | 🟢 Verified |
| `loading` · API:L65 | Prop | Owned aria-busy plus optional authored loading text; readable content remains. | 🟢 Verified |
| `log` · API:L66 | Prop | Authored literal code text or initial text/setText/append, with explicit normalization/retention. | 🟢 Verified |
| `rows` · API:L67 | Prop | External --mui-log-rows (15 default) or --mui-log-height; no hidden virtual row count. | 🟢 Verified |
| `spin-props` · API:L68 | Prop | Native loading text; no spinner/theme/prop forwarding. | ⏭️ Intentionally omitted |
| `trim` · API:L69 | Prop | Display-only String.trim per LF record; raw normalized retained text remains accessible. | 🟢 Verified |
| `on-require-more` · API:L70 | Callback | No loading/retry/backpressure protocol or repeated wheel-at-edge trigger; application owns production. | ⏭️ Intentionally omitted |
| `on-reach-top` · API:L71 | Callback | mui:log-edge position=top, observed native transition with 1px rounding tolerance. | 🟢 Verified |
| `on-reach-bottom` · API:L72 | Callback | mui:log-edge position=bottom, native transition within nearBottom tolerance. | 🟢 Verified |

### Log Methods

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `scrollTo` · API:L78 | Method | One finite top or top/bottom position, optional silent; native vertical scrolling, no focus or horizontal reset. | 🟢 Verified |

### Log Props: spin-props inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `spin-props.strokeWidth?` · API:L68 | Inline record field | No spinner. | ⏭️ Intentionally omitted |
| `spin-props.stroke?` · API:L68 | Inline record field | No spinner. | ⏭️ Intentionally omitted |
| `spin-props.scale?` · API:L68 | Inline record field | No spinner. | ⏭️ Intentionally omitted |
| `spin-props.radius?` · API:L68 | Inline record field | No spinner. | ⏭️ Intentionally omitted |

### Log Methods: scrollTo inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `scrollTo.top?` · API:L78 | Inline record field | Finite CSS-pixel top, native clamping; mutually exclusive with position. | 🟢 Verified |
| `scrollTo.position?` · API:L78 | Inline record field | Exact top/bottom, no implicit target or line-key overload. | 🟢 Verified |
| `scrollTo.silent?` · API:L78 | Inline record field | Suppress owned edge notifications for the resulting native scroll target; not a global event mute. | 🟢 Verified |

### Source-only public exports

These identities are explicit [index.ts][exports]/[public-types.ts][public] evidence.

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `NLog` · exports | Component export | createLog on a native pre/code owner; no custom element or Vue registration. | 🟢 Verified |
| `logProps` · exports | Props record | No runtime Vue prop schema. | ⏭️ Intentionally omitted |
| `LogInst` · exports | Interface | Independently typed LogController; retains scroll intent and adds explicit native buffer operations. | 🟢 Verified |
| `LogProps` · exports | Type alias | No ExtractPublicPropTypes compatibility alias. | ⏭️ Intentionally omitted |
| `LogSpinProps` · public | Type alias | Opaque SharedSpinProps excluded; original four inline members remain separately recorded. | ⏭️ Intentionally omitted |

### Source-only Log props, methods and injection

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `offsetTop` · Log.tsx | Prop | No configurable top threshold; native boundary has 1px rounding tolerance. | ⏭️ Intentionally omitted |
| `offsetBottom` · Log.tsx | Prop | Explicit nearBottom 0..256 CSS pixels (default 4), shared by edge/follow observation. | 🟢 Verified |
| `scrollToTop` · Log.tsx | Deprecated method | Use scrollTo({position:top}); legacy alias not exported. | ⏭️ Intentionally omitted |
| `scrollToBottom` · Log.tsx | Deprecated method | Use scrollTo({position:bottom}); legacy alias not exported. | ⏭️ Intentionally omitted |
| `LogInst.scrollTo({silent?,position})` · Log.tsx | Overload | Discriminated top/bottom position overload. | 🟢 Verified |
| `LogInst.scrollTo({silent?,top})` · Log.tsx | Overload | Discriminated finite top overload. | 🟢 Verified |
| `on-require-more.from` · Log.tsx | Parameter | No transport/require-more callback contract. | ⏭️ Intentionally omitted |
| `theme` · Log.tsx useTheme.props | Prop | Native external CSS, no theme object/provider. | ⏭️ Intentionally omitted |
| `themeOverrides` · Log.tsx useTheme.props | Prop | No theme object merging. | ⏭️ Intentionally omitted |
| `builtinThemeOverrides` · Log.tsx useTheme.props | Prop | No private theme override schema. | ⏭️ Intentionally omitted |
| `LogInjection` · Log.tsx | Interface | No injected shared log/provider state. | ⏭️ Intentionally omitted |
| `LogInjection.trimRef` · Log.tsx | Record field | Direct native owner trim flag; no reactive Ref alias. | ⏭️ Intentionally omitted |
| `LogInjection.languageRef` · Log.tsx | Record field | No language/highlighter provider. | ⏭️ Intentionally omitted |
| `LogInjection.highlightRef` · Log.tsx | Record field | No highlight mode. | ⏭️ Intentionally omitted |
| `LogInjection.mergedHljsRef` · Log.tsx | Record field | No external engine or merged provider. | ⏭️ Intentionally omitted |

### Source-only line/loader companions

Private companion identities are not promoted into public runtime exports.

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `LogLine` · LogLine.tsx | Private component | No child component constructor/provider; concrete native spans only. | ⏭️ Intentionally omitted |
| `LogLine.line` · LogLine.tsx | Prop | Literal native record text; normalized retained source and display trim are distinct. | 🟢 Verified |
| `LogLoader` · LogLoader.tsx | Private component | Optional authored loading text, not a custom loading component. | ⏭️ Intentionally omitted |
| `LogLoader.clsPrefix` · LogLoader.tsx | Prop | Scoped external CSS, no class-prefix provider. | ⏭️ Intentionally omitted |
| `LogLoader.spinProps` · LogLoader.tsx | Prop | No spinner dependency/forwarding. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

Follow, append, flush, stable generated keys, retention/character limits and native-selection
guards are explicit **target extensions**, not added Naive UI props. See the canonical
document for every retained API, omitted boundary and measured actual-DOM acceptance.

[api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md
[log]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/src/Log.tsx
[line]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/src/LogLine.tsx
[loader]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/src/LogLoader.tsx
[exports]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/index.ts
[public]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/src/public-types.ts
