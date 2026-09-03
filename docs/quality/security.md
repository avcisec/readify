# Security baseline

Security focuses on realistic boundaries: accounts, untrusted user content, provider calls, sensitive learning data, and operational access.

## Application controls

- Validate at the system boundary with allowlisted schemas, lengths, ranges, encodings, and normalized identifiers.
- Authentication establishes identity; every command/query separately enforces resource-level authorization and tenant ownership.
- Use secure, HTTP-only, same-site sessions; protect state changes from CSRF where the chosen auth transport requires it.
- Apply rate/concurrency/quota limits to login, import, lookup, AI, export, and retry endpoints; limits must fail clearly.
- Escape untrusted content on output and sanitize any permitted rich text. Never execute document macros, scripts, or active EPUB/HTML content.

Pasted text is untrusted even though it is not a file upload. Accept it as bounded plain text only, discard clipboard markup, normalize line endings deliberately, preserve intended paragraph breaks, and escape it in every rendered context. Never interpret pasted HTML, Markdown, URLs, or template syntax as executable or trusted content.

## Untrusted file pipeline

PDF, EPUB, Markdown, subtitle, audio, and archive contents are hostile input.

1. Stream uploads to quarantine with server-side byte limits and generated object names.
2. Verify declared extension, detected MIME/signature, container structure, compression ratio, entry count/path traversal, and supported encoding.
3. Reject encrypted/unsupported or malformed inputs with a safe error; do not expose parser internals.
4. Parse in a non-privileged, resource-limited process/container without cloud metadata or broad network access.
5. Bound CPU, memory, pages, duration, recursion, decompressed bytes, and wall time.
6. Malware scanning is defense in depth, not a substitute for isolation and validation.
7. Serve artifacts as non-executable attachments or narrowly allowlisted media types through authorized, short-lived URLs.

## Secrets and sensitive data

Secrets come from environment/secret management, never source, images, logs, test fixtures, or client bundles. Rotate leaked credentials and preserve an audit trail. Logs exclude tokens, cookies, raw document/audio content, private URLs, full provider prompts/responses, and unnecessary personal data. Stable hashes/IDs used for correlation must not enable cross-account existence probing.

## Dependencies and providers

Lock dependencies, review update diffs, run vulnerability/secret scanning in CI once manifests exist, and define patch ownership. External calls use allowlisted endpoints, TLS verification, deadlines, bounded retries/circuit behavior, response size/schema validation, and SSRF-safe URL handling. Provider failure degrades safely and never bypasses authorization.

Non-production identity outboxes, proof-capture tooling, fixture meaning catalogs, and authentication test helpers must fail startup when production configuration is selected. Tests must prove this guard; environment naming alone is not an authorization control.

## Release security

Preview uses synthetic/sanitized data and production-like security defaults. Production requires least-privilege identities, encrypted transport/storage, protected admin/replay actions, audit events, backup/restore tests, and an incident path. Threat-model any new public sharing, payment, voice cloning, or cross-user cache behavior before implementation.
