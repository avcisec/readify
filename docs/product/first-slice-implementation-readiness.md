# First-slice implementation readiness

- Status: Ready for implementation planning; production provider/launch decisions deferred
- Decision date: 2026-09-01
- Applies to: [Pasted-text Reader learning loop](../product-specs/pasted-text-reader-learning-loop.md)
- Architecture owner: [Pasted-text slice contracts](../architecture/pasted-text-slice-contracts.md)

This register distinguishes what is required to implement and deterministically verify the first vertical slice from what is required to expose it to real users in production. Fixture-backed acceptance is not a production-launch claim.

## Blocker test

A decision blocks first-slice implementation only when code or acceptance evidence cannot be produced without it. A production vendor, commercial license, public support promise, or measured launch quota is deferred when the accepted port, non-production adapter, fixture, and failure behavior let the slice be implemented and verified honestly.

## Decision summary

| Listed decision | Implementation-blocking? | Slice decision | Deferred until |
| --- | --- | --- | --- |
| Managed passwordless identity/email provider | **No** | Implement the provider-neutral Identity contract plus deterministic local/test delivery; no vendor SDK | Real-email preview or production launch |
| Licensed deterministic French-to-Turkish meaning source | **No** | Implement the meaning port plus the approved fixture catalog and `unavailable` behavior; no external dictionary | Production vocabulary-help rollout beyond fixtures |
| Production character limit and counting rule | **Partly** | Scalar counting/normalization and a 50,000-scalar slice limit are required; calling that value the final production quota is not | Production capacity/cost acceptance |
| Supported browser/assistive-technology matrix | **Partly** | A bounded implementation verification baseline is required; a public launch support matrix is not | Public launch/support commitment |
| Approved public-domain French fixture | **Yes, resolved** | Use the repository-authored CC0 fixture and deterministic fake meanings | Replace only through an approved fixture change |

No unresolved implementation blocker remains. The first executable implementation plan may proceed without Clerk, Lexicala, paid credentials, vendor terms, or a public browser-support promise.

## 1. Managed passwordless identity/email provider

### Challenge result

The product behavior—request link, neutral confirmation, consume a one-time proof, establish/revoke a session, preserve a safe return path, and authorize private resources—must be implemented. A particular managed provider is not required to implement or verify that behavior because the architecture already owns a provider-neutral Identity boundary.

### Slice decision

- Implement an Identity port with application-owned internal user IDs and no provider SDK types outside adapters.
- Provide an in-process/local outbox adapter for development and a deterministic fake for tests. Both enforce one-time proof, expiry, neutral request response, safe relative return paths, and redaction.
- Preview may use the fake/outbox only when access is restricted and all accounts/content are synthetic. The configuration must fail closed in production.
- E2E consumes the captured test proof through the same public application flow; it does not add an authentication bypass.

### Deferred decision and candidates

Select a managed identity and real email-delivery arrangement before a preview with real email recipients or production. Clerk, Supabase Auth plus production SMTP, and Stytch remain candidates, not architecture decisions. Current research is retained only to shorten that later decision: [Clerk pricing](https://clerk.com/pricing), [Supabase passwordless](https://supabase.com/docs/guides/auth/auth-email-passwordless), [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Stytch pricing](https://stytch.com/pricing).

That later selection requires product/finance and privacy/legal approval of unit economics, DPA/subprocessors/transfers, retention, deletion/export, deliverability, expiry/recovery, and incident operation. It does not block the executable slice plan.

## 2. Deterministic French-to-Turkish meaning source

### Challenge result

The Reader/context/vocabulary contracts, provenance, independently degradable failure, and deterministic selection behavior must be implemented. A licensed production dictionary is not required to verify them because the approved fixture supplies owned meanings and the product explicitly supports `meaning unavailable` without blocking vocabulary state.

### Slice decision

- Implement the provider-neutral meaning port and a fixture-backed non-production adapter for `aller`, `choisir`, `manger`, and `parler`.
- Return bounded provenance identifying the repository fixture and selector version.
- Return `unavailable` for entries outside the fixture; never call AI or a hidden secondary source.
- Do not send pasted text, source sentences, account IDs, or document IDs outside the process.
- Prevent the fixture adapter from being enabled in production.

### Deferred decision and candidates

Select and license a production French→Turkish source before claiming general production word help. Candidates remain a Lexicala API/direct dataset and a pinned Wiktionary/Wiktextract dataset. Lexicala documents the language pair and structured data, while Kaikki labels non-English extracts as work in progress with possible errors/omissions. [Lexicala dictionaries](https://lexicala.com/dictionaries/), [Lexicala API](https://api.lexicala.com/documentation/), [Kaikki data](https://kaikki.org/).

The later decision requires product-quality and legal/licensing approval of coverage, sense policy, attribution, display/cache/storage rights, updates, cost/rate limits, privacy, and termination. It does not block implementation or deterministic acceptance.

## 3. Character limit and counting rule

### Challenge result

The counting rule and a concrete boundary are required because the textarea counter, server validation, duplicate identity, offsets, and boundary tests must agree. Evidence that 50,000 is the final production quota is not required to implement the slice.

### Slice decision

Use a 50,000-scalar **slice implementation and acceptance limit**, not an approved forever-production quota:

1. cap the complete HTTP JSON body at 512 KiB before parsing;
2. require well-formed Unicode and reject unpaired surrogates;
3. normalize CRLF/lone CR to LF and remove only complete outer whitespace-only lines;
4. preserve internal characters and count Unicode scalar values, including LF and combining marks;
5. use the same scalar convention for title truncation and text offsets;
6. enforce the same shared policy on browser and authoritative server; do not use JavaScript UTF-16 `.length`.

UTF-16 units were rejected because supplementary characters count twice. Grapheme clusters were rejected because Unicode/runtime segmentation versions add needless cross-runtime policy for a safety quota. UTF-8 bytes remain a transport bound, not user-facing character semantics.

Before production launch, validate the numeric quota using measured request size, database growth, worker duration, Reader performance, and cost. Raising it is a normal product/config release; lowering it after real use requires explicit user-impact planning.

## 4. Browser and assistive-technology coverage

### Challenge result

Semantic implementation and some representative accessibility evidence are required. A promise to support current/previous versions across four desktop browsers and two mobile AT stacks is a launch/support policy and is not necessary to begin or complete deterministic slice implementation.

### Slice verification baseline

- Target WCAG 2.2 Level AA without making a conformance claim before evidence exists. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- Automate affected critical paths on Chromium, Firefox, and WebKit engines.
- Automate the complete keyboard flow, visible focus, escaped markup, zoom/reflow, reduced-motion behavior, and static/runtime accessibility checks.
- Before slice acceptance, manually smoke the critical loop with **one available primary desktop combination**: NVDA+Firefox on Windows or VoiceOver+Safari on macOS. Record exact versions and defects.
- Use responsive browser tests for mobile Import/Reader structure. Defer mandatory VoiceOver+iOS and TalkBack+Android release smokes until public mobile launch or a specific device-support commitment.

The eventual public browser/OS/AT matrix, support window, real-device budget, and exception policy remain production-launch decisions. A defect found on a supported standards-based browser is still actionable; deferral is not permission to build Chromium-only semantics.

## 5. Approved French acceptance fixture

### Challenge result

This decision truly blocks deterministic acceptance because normalization, safe rendering, Unicode offsets, repeated lemma state, and exact meaning outcomes need redistributable stable input. It is resolved.

Use the repository-authored [French Reader acceptance text](fixtures/french-reader-acceptance.txt) and [fixture manifest](fixtures/README.md). It contains no copied passage and is dedicated under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) to the extent rights exist. Its Turkish meanings are contract-test data, not evidence of production dictionary quality.

## Readiness conclusion

Implementation can start with no external account, network call, paid credential, or production license. The active implementation plan must:

- keep non-production adapters impossible to enable in production;
- treat fixture-backed meaning coverage and captured email as test/preview evidence only;
- retain provider ports, provenance, failure behavior, and security boundaries;
- list real identity/email, licensed meanings, final production quota, and public browser/AT support as production rollout gates rather than implementation blockers.
