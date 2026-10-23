import { describe, expect, it } from "vitest";
import { validateJsonRpcRequest, validateJsonRpcResponse } from "../src/index.js";

describe("JSON-RPC envelope validation", () => {
  it("accepts a bounded JSON-RPC request", () => {
    expect(validateJsonRpcRequest({ jsonrpc: "2.0", id: "req-1", method: "tools/list", params: {} })).toEqual([]);
  });

  it("rejects invalid protocol version, IDs, methods, and params", () => {
    const issues = validateJsonRpcRequest({ jsonrpc: "1.0", id: {}, method: "bad method", params: "string" });
    const codes = issues.map(issue => issue.code);
    expect(codes).toContain("invalid_version");
    expect(codes).toContain("invalid_id");
    expect(codes).toContain("invalid_method");
    expect(codes).toContain("invalid_params");
  });

  it("rejects oversized messages", () => {
    expect(validateJsonRpcRequest({ jsonrpc: "2.0", id: 1, method: "tools/list", params: { text: "x".repeat(200) } }, { maxMessageBytes: 100 }).map(x => x.code))
      .toContain("oversized_message");
  });

  it("correlates responses and rejects ambiguous result/error payloads", () => {
    expect(validateJsonRpcResponse({ jsonrpc: "2.0", id: "req-1", result: { tools: [] } }, "req-1")).toBe(true);
    expect(validateJsonRpcResponse({ jsonrpc: "2.0", id: "other", result: {} }, "req-1")).toBe(false);
    expect(validateJsonRpcResponse({ jsonrpc: "2.0", id: "req-1", result: {}, error: { code: -1, message: "bad" } }, "req-1")).toBe(false);
    expect(validateJsonRpcResponse({ jsonrpc: "2.0", id: "req-1", error: { code: -1, message: "remote error" } }, "req-1")).toBe(true);
  });
});
