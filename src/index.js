const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const ALLOWED_CAPABILITIES = new Set(["tools/list", "tools/call", "resources/list", "resources/read", "prompts/list", "prompts/get"]);
export class McpBoundaryError extends Error {
  constructor(code) { super("MCP request rejected"); this.name = "McpBoundaryError"; this.code = code; }
}

export function createMcpRegistry({ serverAllowlist, authorize, transport, timeoutMs = 10_000, maxRequestBytes = 32_768, maxResponseBytes = 131_072 } = {}) {
  if (!Array.isArray(serverAllowlist) || serverAllowlist.length === 0 || serverAllowlist.some((url) => !isAllowedUrl(url))) throw new TypeError("explicit HTTPS server allowlist is required");
  if (typeof authorize !== "function" || typeof transport !== "function") throw new TypeError("authorization and transport adapters are required");
  for (const [name, value] of Object.entries({ timeoutMs, maxRequestBytes, maxResponseBytes })) if (!Number.isSafeInteger(value) || value < 1) throw new TypeError(name + " must be positive");
  if (timeoutMs > 120_000 || maxRequestBytes > 1_048_576 || maxResponseBytes > 4_194_304) throw new TypeError("configured limit exceeds maximum");
  const allowed = new Set(serverAllowlist.map((url) => new URL(url).origin + new URL(url).pathname.replace(/\/$/, "")));
  return Object.freeze({
    async invoke({ principal, serverUrl, capability, payload, signal } = {}) {
      if (!principal || !ID.test(principal.id ?? "") || !ID.test(principal.tenantId ?? "")) throw new McpBoundaryError("unauthenticated");
      if (!isAllowedUrl(serverUrl) || !allowed.has(new URL(serverUrl).origin + new URL(serverUrl).pathname.replace(/\/$/, ""))) throw new McpBoundaryError("server_not_allowed");
      if (!ALLOWED_CAPABILITIES.has(capability)) throw new McpBoundaryError("capability_not_allowed");
      if (signal?.aborted) throw new McpBoundaryError("aborted");
      let bytes;
      try { bytes = Buffer.byteLength(JSON.stringify(payload)); } catch { throw new McpBoundaryError("invalid_request"); }
      if (bytes > maxRequestBytes) throw new McpBoundaryError("request_too_large");
      let permitted = false;
      try { permitted = await authorize({ principal, serverUrl, capability }) === true; } catch { throw new McpBoundaryError("authorization_unavailable"); }
      if (!permitted) throw new McpBoundaryError("forbidden");
      const controller = new AbortController();
      const abort = () => controller.abort();
      signal?.addEventListener("abort", abort, { once: true });
      const timer = setTimeout(abort, timeoutMs);
      try {
        const result = await Promise.race([
          Promise.resolve().then(() => transport({ serverUrl, capability, payload, principal: { id: principal.id, tenantId: principal.tenantId }, signal: controller.signal })),
          new Promise((_, reject) => {
            const rejectAbort = () => reject(new McpBoundaryError(signal?.aborted ? "aborted" : "timeout"));
            if (controller.signal.aborted) rejectAbort(); else controller.signal.addEventListener("abort", rejectAbort, { once: true });
          })
        ]);
        let responseBytes;
        try { responseBytes = Buffer.byteLength(JSON.stringify(result)); } catch { throw new McpBoundaryError("invalid_response"); }
        if (responseBytes > maxResponseBytes) throw new McpBoundaryError("response_too_large");
        if (!result || typeof result !== "object" || Array.isArray(result)) throw new McpBoundaryError("invalid_response");
        return Object.freeze({ serverUrl, capability, result });
      } catch (error) {
        if (error instanceof McpBoundaryError) throw error;
        if (controller.signal.aborted) throw new McpBoundaryError(signal?.aborted ? "aborted" : "timeout");
        throw new McpBoundaryError("transport_failed");
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
      }
    }
  });
}
function isAllowedUrl(value) {
  if (typeof value !== "string") return false;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && !url.hash; }
  catch { return false; }
}
