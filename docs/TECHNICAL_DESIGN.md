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


## Current protocol compatibility requirement

The official MCP specification revision `2026-07-28` is published. It introduces a stateless protocol core, header-based routing, authorization hardening, and Tasks as an extension. The official TypeScript SDK v2 implements this revision; SDK v1.x targets the 2025-11-25 specification and remains a separate maintenance line. Therefore, the MCP adapter must declare the supported protocol era/version and not infer compatibility from a package name.

Before implementation, compare the actual `@woho/mcp` package exports/version against these official sources and create a tested compatibility matrix: supported spec revision, stdio/HTTP transports, authorization behavior, capability discovery, Tasks/long-running behavior, cancellation, reconnect/fallback, and deprecation handling. Any legacy support must be explicit and covered by contract tests.

Sources: [MCP 2026-07-28 release](https://blog.modelcontextprotocol.io/posts/2026-07-28/), [TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/), [v2 migration guide](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28), [v1 support statement](https://ts.sdk.modelcontextprotocol.io/).

## Aether/DevKit compatibility gate

The inspected `@woho/mcp 0.6.28` manifest exposes one ESM entry and declares no external MCP SDK dependency. Its source defines generic tool/resource/prompt interfaces, a JSON-RPC-like transport contract, protocol-version configuration, limits/allowlists, and stdio transport. These primitives are useful, but they do not by themselves prove full conformance to official MCP revision `2026-07-28`.

Before implementation, follow the [master DevKit compatibility review](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/DEVKIT_COMPATIBILITY_REVIEW.md) and add a protocol conformance harness. Keep Aether's MCP adapter behind the Aether tool registry; the registry enforces authorization/approval, while MCP handles protocol/transport. Do not make `aether-ai-tools` import `aether-ai-mcp`.
