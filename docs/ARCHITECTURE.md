# Architecture: aether-ai-mcp

**Status:** proposed design, not implemented.

## Role in the system

MCP is a protocol adapter for remote-server registration, supported-version/transport handling, capability discovery, authentication integration, and translating MCP definitions and responses into Aether-owned contracts. A successful handshake or advertised capability is not a trust grant.

## Dependencies and ownership

MCP consumes the public, protocol-neutral manifest and invocation contract from `aether-ai-tools`, shared policy/authentication contracts from `aether-ai-security` and `aether-ai-auth`, and approved telemetry conventions from `aether-ai-observability`.

Tools owns tool permission/risk evaluation, approval semantics, execution isolation, output caps and egress policy. MCP must not duplicate or bypass those controls. A composition root registers MCP-backed tools through the public Tools contract; Tools does not import MCP. Cache may be used only through an approved abstraction if later justified, and never as the authority for current permissions or revocation.

## Registration and capability flow

1. Accept server registration only through an authenticated administrative boundary and explicit server allowlist.
2. Store a stable server ID, approved transport/endpoint, supported protocol/SDK version, credential reference, owner, allowed capability scope and review state.
3. Validate network destination through the Tools-owned egress policy, including resolved IPv4/IPv6 addresses and each redirect/connection; reject loopback, link-local, private, metadata and other prohibited targets unless a documented exception is approved.
4. Establish the supported protocol/transport handshake without treating it as evidence that remote descriptions, annotations, prompts, resources or tool results are safe.
5. Snapshot discovered capabilities. Any change is treated as new untrusted input and revalidated; a changed server cannot silently acquire more scope.
6. Disable a server by preventing new invocations, stopping/draining active work per the selected contract, revoking its credential reference, and recording an audited outcome.

## Invocation lifecycle

1. Receive an invocation request with a stable server/tool ID and correlation context.
2. Confirm the target is registered and currently enabled; match it to the current capability snapshot and explicit allowlist.
3. Validate request/response schemas, version, nesting/size bounds, timeout, concurrency and cancellation semantics.
4. Resolve caller and tenant/resource scope from trusted auth context. Client or remote-server metadata cannot grant role, tenant or approval.
5. Hand the invocation to Tools for current authorization, risk classification, approval checks, egress/isolation enforcement and execution. If these controls cannot be established, fail closed.
6. Send only server-specific, narrowly scoped credentials using the approved credential boundary. Never forward a user token or unrelated secret to another server by default.
7. Validate and bound responses, preserve remote provenance, and treat all returned text and structured content as untrusted data, never as system instructions or executable code.
8. Map failures into stable Aether error categories without exposing raw upstream error text or credentials. Distinguish authentication/policy denial, protocol error, timeout, cancellation, remote failure, malformed response and uncertain side-effect outcome.
9. Retry only when the operation contract allows it. Do not blindly replay a non-idempotent side effect after timeout/reconnect or an ambiguous remote result.

## Security and privacy boundaries

- Authentication and authorization remain transport-appropriate and current; discovery/enqueue-time checks are not enough for delayed side effects.
- Keep raw credentials out of registration metadata, event payloads, logs, traces and client-visible errors.
- Emit structured lifecycle telemetry with approved correlation IDs, server/tool identifiers, outcome category and timing. Do not log full input/output by default.
- Tenant membership/role-grant ownership remains unresolved in ADR-0021. Do not create a local authority or infer it from a dependency list.
- The protocol/SDK/transport matrix must be explicitly versioned and contract-tested; package names alone do not establish conformance.

## Failure behavior

Document and test unknown/unapproved server, changed capability/schema, expired or revoked credentials, cross-tenant invocation, blocked DNS/IP/redirect, prompt-injection text in metadata/results, malformed response, oversized output, timeout, cancellation, reconnect, retry exhaustion, ambiguous side effect, audit failure and denied access after revocation.

## Proposed deployment shape

This repository does not itself imply a separate service. Choose the runtime boundary and pinned MCP SDK/revision only after the architecture and licensing review. No SDK, transport matrix or credential integration is selected by this draft.

## Related documentation

- [Project specification](PROJECT_SPEC.md)
- [Architecture and connections](ARCHITECTURE.md)
- [Dependencies and contracts](DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](IMPLEMENTATION_PLAN.md)
- [Research and licenses](RESEARCH_AND_LICENSES.md)
- [Work log](WORKLOG.md)
- [Repository specification](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/repositories/aether-ai-mcp.md)
