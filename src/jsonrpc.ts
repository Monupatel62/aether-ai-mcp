export type JsonRpcId = string | number;

export interface JsonRpcRequest {
  readonly jsonrpc: "2.0";
  readonly id: JsonRpcId;
  readonly method: string;
  readonly params?: Readonly<Record<string, unknown>> | readonly unknown[];
}

export interface JsonRpcSuccess {
  readonly jsonrpc: "2.0";
  readonly id: JsonRpcId;
  readonly result: unknown;
}

export interface JsonRpcFailure {
  readonly jsonrpc: "2.0";
  readonly id: JsonRpcId | null;
  readonly error: { readonly code: number; readonly message: string; readonly data?: unknown };
}

export type JsonRpcIssueCode = "invalid_shape" | "invalid_version" | "invalid_id" | "invalid_method" | "invalid_params" | "oversized_message";

export interface JsonRpcIssue {
  readonly code: JsonRpcIssueCode;
  readonly path: string;
}

export interface JsonRpcLimits {
  readonly maxMessageBytes?: number;
  readonly maxMethodChars?: number;
  readonly maxIdChars?: number;
}

/** Validates JSON-RPC request envelopes received from an untrusted MCP peer. */
export function validateJsonRpcRequest(value: unknown, limits: JsonRpcLimits = {}): readonly JsonRpcIssue[] {
  const maxMessageBytes = limits.maxMessageBytes ?? 1024 * 1024;
  const maxMethodChars = limits.maxMethodChars ?? 256;
  const maxIdChars = limits.maxIdChars ?? 128;
  if (!Number.isInteger(maxMessageBytes) || maxMessageBytes < 1 || maxMessageBytes > 10 * 1024 * 1024) {
    throw new RangeError("maxMessageBytes must be between 1 and 10485760.");
  }
  if (!Number.isInteger(maxMethodChars) || maxMethodChars < 1 || maxMethodChars > 1024) {
    throw new RangeError("maxMethodChars must be between 1 and 1024.");
  }
  if (!Number.isInteger(maxIdChars) || maxIdChars < 1 || maxIdChars > 1024) {
    throw new RangeError("maxIdChars must be between 1 and 1024.");
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [{ code: "invalid_shape", path: "/" }];
  const request = value as Record<string, unknown>;
  const issues: JsonRpcIssue[] = [];
  if (new TextEncoder().encode(JSON.stringify(value)).byteLength > maxMessageBytes) issues.push({ code: "oversized_message", path: "/" });
  if (request.jsonrpc !== "2.0") issues.push({ code: "invalid_version", path: "/jsonrpc" });
  if (!(typeof request.id === "string" && request.id.length > 0 && request.id.length <= maxIdChars) &&
      !(typeof request.id === "number" && Number.isSafeInteger(request.id) && request.id >= 0)) {
    issues.push({ code: "invalid_id", path: "/id" });
  }
  if (typeof request.method !== "string" || request.method.length < 1 || request.method.length > maxMethodChars ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(request.method)) {
    issues.push({ code: "invalid_method", path: "/method" });
  }
  if (request.params !== undefined &&
      (request.params === null || typeof request.params !== "object")) {
    issues.push({ code: "invalid_params", path: "/params" });
  }
  return issues;
}

/** Validate response shape and correlate it to the request without trusting remote result content. */
export function validateJsonRpcResponse(value: unknown, expectedId: JsonRpcId, maxMessageBytes = 1024 * 1024): boolean {
  if (!Number.isInteger(maxMessageBytes) || maxMessageBytes < 1 || maxMessageBytes > 10 * 1024 * 1024) {
    throw new RangeError("maxMessageBytes must be between 1 and 10485760.");
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  if (new TextEncoder().encode(JSON.stringify(value)).byteLength > maxMessageBytes) return false;
  const response = value as Record<string, unknown>;
  if (response.jsonrpc !== "2.0" || response.id !== expectedId) return false;
  const hasResult = Object.prototype.hasOwnProperty.call(response, "result");
  const hasError = Object.prototype.hasOwnProperty.call(response, "error");
  if (hasResult === hasError) return false;
  if (hasError) {
    const error = response.error;
    return error !== null && typeof error === "object" &&
      Number.isInteger((error as Record<string, unknown>).code) &&
      typeof (error as Record<string, unknown>).message === "string";
  }
  return true;
}
