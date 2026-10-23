import test from "node:test";
import assert from "node:assert/strict";
import { createMcpRegistry } from "../src/index.js";

const serverUrl = "https://mcp.example.com/v1";
function registry(overrides = {}) {
  return createMcpRegistry({ serverAllowlist: [serverUrl], authorize: async () => true, transport: async () => ({ content: [] }), timeoutMs: 30, ...overrides });
}

test("invokes only allowlisted servers and capabilities", async () => {
  const result = await registry().invoke({ principal: { id: "u1", tenantId: "t1" }, serverUrl, capability: "tools/list", payload: {} });
  assert.deepEqual(result.result, { content: [] });
  await assert.rejects(registry().invoke({ principal: { id: "u1", tenantId: "t1" }, serverUrl: "https://other.test", capability: "tools/list", payload: {} }), (e) => e.code === "server_not_allowed");
  await assert.rejects(registry().invoke({ principal: { id: "u1", tenantId: "t1" }, serverUrl, capability: "admin/delete", payload: {} }), (e) => e.code === "capability_not_allowed");
});

test("fails closed when authorization denies or is unavailable", async () => {
  await assert.rejects(registry({ authorize: async () => false }).invoke({ principal: { id: "u1", tenantId: "t1" }, serverUrl, capability: "tools/call", payload: {} }), (e) => e.code === "forbidden");
  await assert.rejects(registry({ authorize: async () => { throw Error("private detail"); } }).invoke({ principal: { id: "u1", tenantId: "t1" }, serverUrl, capability: "tools/call", payload: {} }), (e) => e.code === "authorization_unavailable");
});

test("rejects insecure allowlists and oversized payloads", async () => {
  assert.throws(() => registry({ serverAllowlist: ["http://insecure.test"] }), /HTTPS/);
  assert.throws(() => registry({ serverAllowlist: ["https://127.0.0.1"] }), /HTTPS/);
  assert.throws(() => registry({ serverAllowlist: ["https://localhost"] }), /HTTPS/);
  assert.throws(() => registry({ serverAllowlist: ["https://public.example.com/path?token=abc"] }), /HTTPS/);
  await assert.rejects(registry({ maxRequestBytes: 8 }).invoke({ principal: { id: "u1", tenantId: "t1" }, serverUrl, capability: "tools/call", payload: { input: "far too long" } }), (e) => e.code === "request_too_large");
});

test("normalizes transport errors and bounds hanging requests", async () => {
  await assert.rejects(registry({ transport: async () => { throw Error("secret"); } }).invoke({ principal: { id: "u1", tenantId: "t1" }, serverUrl, capability: "tools/call", payload: {} }), (e) => e.code === "transport_failed" && !e.message.includes("secret"));
  await assert.rejects(registry({ transport: () => new Promise(() => {}), timeoutMs: 5 }).invoke({ principal: { id: "u1", tenantId: "t1" }, serverUrl, capability: "tools/call", payload: {} }), (e) => e.code === "timeout");
});
