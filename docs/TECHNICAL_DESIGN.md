# Technical design — aether-ai-mcp

**Status:** design proposal; not implemented.

## Role

MCP adapter manages protocol compatibility, transport lifecycle, capability discovery, and safe invocation; it does not grant a remote server trust.

## Proposed internal structure

Pin supported MCP specification version and transport matrix in an ADR. Define server registry/allowlist, handshake, capability snapshot, authentication/credential handling, request timeout, output-size limit, cancellation, reconnection policy, and stable error mapping. Treat descriptions/resources/results as untrusted content.

## Connections and ownership

MCP client/server wrappers may use compatible @woho/mcp primitives. Remote tool definitions become aether-ai-tools manifests only after policy and schema checks. Tool calls carry tenant scope and audit correlation IDs.

## Failure cases to design explicitly

- Invalid or unauthorized input.
- Dependency unavailable or responds with malformed/partial data.
- Timeout, cancellation, duplicate delivery/request, and retry exhaustion.
- Tenant or permission mismatch.
- Sensitive data accidentally entering logs or client-visible errors.

## Verification plan

Protocol conformance tests, bad/unknown server tests, auth failures, timeout/cancel, oversized output, prompt-injection payloads, capability changes, reconnect, and credential redaction.

## Open decisions

- Final language/framework and packaging model.
- Runtime deployment boundary (repository does not imply a separate service).
- Selected dependency versions and license review.
- Production observability/retention limits and release criteria.

## Change-comment policy

When implementation begins, explain security invariants, state transitions, retry/idempotency constraints, and non-obvious integration behavior in comments. Keep the comment standard at [the project-wide guide](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/ENGINEERING_AND_COMMENTING_STANDARD.md).

## Related docs

- [Project specification](PROJECT_SPEC.md)
- [Architecture](ARCHITECTURE.md)
- [Dependencies and contracts](DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](IMPLEMENTATION_PLAN.md)
- [Research and licenses](RESEARCH_AND_LICENSES.md)
- [Work log](WORKLOG.md)
- [Master repository spec](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/repositories/aether-ai-mcp.md)
