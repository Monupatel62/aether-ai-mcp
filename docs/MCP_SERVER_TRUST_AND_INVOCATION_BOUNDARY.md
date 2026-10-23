# MCP Server Trust and Invocation Boundary

**Status:** proposed design contract only. This document does not claim that runtime enforcement or tests exist.

## Purpose and ownership

The MCP component owns protocol compatibility, remote-server lifecycle, capability discovery, transport/authentication integration, and conversion of remote MCP definitions into validated Aether tool manifests.

The Tools component owns tool policy evaluation and execution isolation. MCP MUST consume the approved Tools contract; it MUST NOT implement a parallel sandbox or weaken the Tools policy. Security owns shared policy primitives, and Observability owns approved telemetry conventions. This document does not settle tenant-membership ownership; ADR-0021 remains unresolved.

## Trust model

Treat the remote server, its advertised capabilities, tool names/descriptions, resource contents, prompts, annotations, and returned values as untrusted—even after a successful handshake. Discovery is descriptive, not authorization. A server's claim that an operation is safe does not make it safe.

A server registration is not permission for every principal or tenant to invoke every capability. Each invocation must carry the authenticated caller context and tenant/resource scope required by the approved authorization contract. The execution boundary must re-check current authorization before side effects; queued or retried work must not rely solely on authorization observed at discovery or enqueue time.

## Registration and capability lifecycle

1. Accept registrations only through an authenticated administrative path and an explicit server allowlist.
2. Record a stable server identity, approved endpoint/transport, protocol and SDK compatibility, credential reference, permitted capability scope, owner, review status, and audit metadata.
3. Validate transport configuration before connecting. For network transports, use the Tools-owned egress policy; reject loopback, link-local, private, metadata-service, and otherwise disallowed destinations unless an explicitly reviewed deployment policy permits them. Validate resolved addresses and every redirect/connection target to resist DNS rebinding and redirect-based SSRF.
4. Pin supported protocol/SDK versions and transport modes. A handshake is not proof that the server is trustworthy or compatible with all Aether features.
5. Treat capability changes as a new untrusted snapshot. Revalidate schemas and policy; do not silently expand granted permissions when tools appear, disappear, or change.
6. Disable a server by preventing new calls, cancelling or draining active work according to documented semantics, revoking its credential access, and recording the outcome.

## Credentials and authorization

- Keep secrets in the approved secret-management boundary; store references, not raw credentials, in server configuration.
- Scope credentials to one server and the minimum required operations. Never forward a user token or provider secret to a different server by default.
- Apply transport-appropriate OAuth/token validation, audience and scope checks, expiry handling, and revocation behavior from the shared Auth contract.
- Do not treat prompts, user-interface confirmations, MCP metadata, or a tool description as authorization.
- High-impact operations require explicit policy/approval rules defined by the owning policy contract. The MCP adapter must preserve that decision and must not bypass it.
- Fail closed when authentication, authorization, policy, revocation state, or required egress decisions cannot be established.

## Invocation and result handling

Before invocation, validate the requested tool against the current capability snapshot, schema, caller scope, policy decision, and resource limits. Apply bounded execution time, input/output size, concurrency, and retry budgets. Support cancellation and distinguish timeout, cancellation, policy denial, protocol failure, remote failure, and partial result.

Validate returned content against expected shape and configured limits. Remote text and structured content remain untrusted data and must not be promoted to system instructions or executed as code. Any transformation into an Aether tool manifest must preserve provenance and must not elevate the remote server's authority.

Retries are allowed only where the operation's semantics permit them. Do not automatically retry non-idempotent side effects without an explicit idempotency contract. Avoid duplicate side effects after reconnects and uncertain outcomes.

## Audit and privacy

Emit structured lifecycle events for registration changes, connection/authentication outcomes, capability changes, policy decisions, invocation start/end, cancellation, and failures. Include correlation/run ID, server identity, tool identifier, outcome category, and timing where approved. Redact credentials, authorization headers, secrets, and sensitive payloads by default. Logs must not contain full tool input/output unless a separately approved data-handling policy explicitly allows it.

## Required acceptance evidence before production

These are proposed tests, not tests already implemented or passed.

| Area | Acceptance case |
|---|---|
| Registration | Unknown or unapproved server is rejected |
| Network boundary | Private/metadata target, redirect to blocked target, and DNS rebinding attempt are denied |
| Credentials | Credential for server A is never sent to server B; expired/revoked credentials fail closed |
| Discovery | Capability/schema mutation does not silently grant new permissions |
| Authorization | Cross-tenant and unauthorized resource calls are denied at invocation time |
| Input/output | Invalid schema, malformed response, oversized output, and excessive nesting are rejected or bounded |
| Untrusted content | Prompt-injection text in descriptions/resources/results is treated as data |
| Reliability | Timeout, cancellation, reconnect, retry exhaustion, and dependency outage have stable outcomes |
| Side effects | Non-idempotent operation is not blindly retried after an ambiguous response |
| Observability | Secrets and sensitive content are absent from default logs |
| Revocation | Queued work rechecks current authorization and revocation before side effects |
| Protocol | Contract suite covers the explicitly selected MCP spec/SDK and transport matrix |

Release evidence must identify the exact SDK/spec versions, enabled transports, test results, reviewed egress policy, and unresolved risks. A passing protocol-conformance test alone does not prove tenant isolation, safe egress, or authorization correctness.

## Related contracts

- [Tools sandbox and egress specification](https://github.com/Monupatel62/aether-ai-tools/blob/main/docs/TOOL_SANDBOX_AND_EGRESS_SPEC.md) — execution isolation and egress enforcement owner.
- [Auth session and token revocation contract](https://github.com/Monupatel62/aether-ai-auth/blob/main/docs/SESSION_AND_TOKEN_REVOCATION_CONTRACT.md) — proposed identity/token revocation behavior.
- [Cache revocation consistency](https://github.com/Monupatel62/aether-ai-cache/blob/main/docs/REVOCATION_CACHE_CONSISTENCY.md) — proposed cache consistency requirements.
- [MCP technical design](TECHNICAL_DESIGN.md) — protocol compatibility and open decisions.
- [Security review checklist](SECURITY_REVIEW.md) — repository-level verification checklist.

## Open decisions

- Exact supported MCP protocol revision, SDK version, and transport matrix.
- Production egress policy and exception approval path.
- Credential storage/rotation integration and revocation propagation SLO.
- Output limits, timeout budgets, and concurrency defaults.
- Approval requirements for high-impact operations.
- Tenant-membership authority and role-grant ownership (ADR-0021); do not infer ownership here.
