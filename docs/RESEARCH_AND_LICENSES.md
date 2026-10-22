# Research and license record — aether-ai-mcp

**Research date:** 2026-10-22. Initial design research only; not legal advice or a complete SBOM.

## Primary sources

- Research sources: https://github.com/Monupatel62/woho-ai-devkit 
- https://modelcontextprotocol.io/

## Findings

DevKit README describes MCP server/client primitives, resources, prompts, security controls, and stdio transport. Verify current MCP spec/version and transport support before implementing; remote tool metadata/output is untrusted.

## Reuse and license policy

- No third-party source code has been copied into this repository as part of this documentation work.
- The inspected WoHo AI DevKit package metadata reports version 0.8.37, Apache-2.0, and Node.js >=20. Verify exact package versions, package-level licenses, exports, and compatibility at implementation time.
- AI DIAL Core's repository includes an Apache-2.0 license. AI DIAL Chat's README notes Apache-2.0 for rewritten code and MIT for portions retained from its original upstream. Check exact files and notices before reuse.
- An open-source license for one repository does not grant rights to another repository, trademark, model, hosted API, dataset, or dependency.
- Do not vendor or fork a component until its LICENSE, NOTICE, copyright headers, transitive dependencies, security posture, and redistribution conditions have been recorded.

## Required release checks

- [ ] Pin exact versions/tags/commits for every reused component.
- [ ] Generate an SBOM and review direct/transitive licenses.
- [ ] Run vulnerability and secret scanning.
- [ ] Preserve required copyright/license notices and document modifications.
- [ ] Confirm model-provider terms, API costs, data processing, and retention requirements separately.

## Open questions

Hosting topology, model provider selection, database, queue, cache, vector store, identity provider, and deployment target remain undecided. They must be resolved in an ADR, not silently assumed.


## Current MCP protocol research update — 2026-10-22

The official MCP project published specification revision **2026-07-28**. Its release notes describe a stateless protocol core, header-based routing, authorization hardening, Tasks as an extension, and a formal deprecation policy. The official TypeScript SDK v2 is the current stable line for that revision; SDK v1.x implements the 2025-11-25 specification and is a separate maintenance line. Do not assume the DevKit `@woho/mcp` package implements the new revision without checking its actual release and tests.

Required integration evidence:

- [MCP 2026-07-28 release notes](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [MCP TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/)
- [SDK v2 support for 2026-07-28](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28)
- [SDK v1 support statement](https://ts.sdk.modelcontextprotocol.io/)

Before coding, record exact supported spec versions, transports, auth behavior, server allowlisting, extension/Tasks behavior, timeouts/output limits, and compatibility policy in an ADR. Treat all server metadata and tool/resource output as untrusted data.
