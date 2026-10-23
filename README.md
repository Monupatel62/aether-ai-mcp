# aether-ai-mcp

> **Status: Initial JSON-RPC envelope validation utilities are in review.** No MCP transport, server registry, credential management, or production deployment is implemented.

## Purpose

Model Context Protocol client/server integration, tool/resource discovery, transport management, and policy-safe invocation.

## Responsibility boundary

Protocol adapter; never treats remote tool descriptions as trusted instructions.

## Dependencies

aether-ai-tools, aether-ai-security, and aether-ai-observability.

## Project rules

- No implementation starts until the documentation and cross-repository contracts are reviewed.
- Do not commit secrets, API keys, user data, or production credentials.
- Public interfaces, security decisions, and non-obvious implementation choices must be documented.

## Initial implementation

The draft package validates bounded JSON-RPC 2.0 request envelopes and correlates responses by request ID, with payload size limits. Remote result and description content remains untrusted. This does not implement the MCP transport lifecycle, protocol-version negotiation, server allowlists, authentication, credential storage, tool execution, or policy checks.

## Documentation

- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture and connections](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan and acceptance criteria](docs/IMPLEMENTATION_PLAN.md)
- [Research and license notes](docs/RESEARCH_AND_LICENSES.md)
- [Repository-specific technical design and test plan](docs/TECHNICAL_DESIGN.md)
- [Repository-specific security review checklist](docs/SECURITY_REVIEW.md)
- [Engineering and commenting standard](docs/ENGINEERING_STANDARD.md)
- [Work log and decisions](docs/WORKLOG.md)
- [Master 33-repository catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
- [Continuity handoff for new chats](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/WORK_HANDOFF.md)

## Before coding

Read the project specification, architecture, contracts, implementation plan, and work log. Update the docs in the same change whenever behavior, an API contract, a dependency, or a security boundary changes.
