---
name: check-console-integrity
description: Audit Google Cloud Console link integrity in this repository and produce an evidence-backed remediation plan. Use when asked to inspect, validate, investigate, or review URLs opened in Google Cloud Console; detect stale or invalid Console routes and retired services; compare link builders with API resources, Git history, issues, and tests; or repeat a Console integrity investigation without modifying application code.
---

# Check Console Integrity

Audit Console links reproducibly. Keep the audit read-only unless the user separately asks to implement the remediation plan.

## Workflow

1. Read the applicable `AGENTS.md` files and inspect `git status`. Preserve unrelated and concurrent changes.
2. Inventory every Console URL, including untracked source files:

   ```sh
   python3 .agents/skills/check-console-integrity/scripts/inventory_console_urls.py . --format json
   ```

   Use `--format tsv` for a compact, line-oriented view. Record production and test counts separately.
3. Trace each production URL to its user-facing action and data source. Confirm which API field supplies every project, location, resource type, and resource identifier segment.
4. Check local integrity:
   - Parse fixed examples with a structured URL parser where practical.
   - Verify path shape, query separators, parameter names, and percent-encoding.
   - Distinguish display names, resource IDs, numeric IDs, emails, and fully qualified resource names.
   - Check global, regional, generation, format, and resource-type variants independently.
   - Compare related URL builders and expected URLs in tests for inconsistent conventions.
5. Inspect `git blame`, focused file history, upstream diffs, and relevant repository issues or pull requests. Treat an historical fix as evidence, not proof that a current Console route remains valid.
6. Validate current behavior against primary Google Cloud documentation. Follow project instructions about terminal-first research; use web search only when command-line sources are insufficient. Prefer current official Google sources and record the access date.
7. Check service lifecycle separately from URL syntax. Identify shut-down services, end-of-sale restrictions, renamed products, and project- or organization-dependent availability.
8. Assess regression coverage for every confirmed mismatch and every URL builder that has changed previously.
9. Re-run the inventory before reporting if files changed concurrently during the audit.

## Evidence Rules

- Do not treat an HTTP success, login redirect, or generic Console shell as proof that a deep link opens the intended resource.
- Do not mark a route invalid only because an unauthenticated request cannot reach its content.
- Prefer, in order: current official product documentation, verified authenticated Console behavior supplied by the user, current repository behavior and tests, repository issue/history evidence, and third-party examples.
- Label findings as `confirmed`, `probable`, `conditional`, or `unverified`. State what evidence would resolve anything below `confirmed`.
- Separate route defects from unavailable or retired services. A syntactically valid link to a shut-down product is still an integrity finding.
- If network access or authentication is unavailable, continue the local audit and report the external-validation gap explicitly.

## Report Format

Respond in the user's language and include:

1. Scope and inventory counts.
2. Findings ordered by impact, with confidence, clickable file/line references, expected behavior, and evidence.
3. Conditional availability and lifecycle concerns.
4. URL builders checked without a detected issue.
5. Missing or weak regression tests.
6. A prioritized, implementation-ready remediation and test plan.

Do not edit application files, open issues, or post comments as part of the default audit.
