import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ZodType } from "zod";
import {
  AppError,
  DEFAULT_LOCAL_DATABASE_URL,
  ReadifyService,
  loadEnvironment,
} from "@readify/platform";

declare global {
  var readifyService: ReadifyService | undefined;
  var readifyLatestProof: string | undefined;
  var readifyRateLimits:
    Map<string, { count: number; resetAt: number }> | undefined;
}

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_LOCAL_DATABASE_URL;
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = databaseUrl;
loadEnvironment(process.env);
export const service = globalThis.readifyService ?? new ReadifyService();
if (process.env.NODE_ENV !== "production") globalThis.readifyService = service;

export const SESSION_COOKIE =
  process.env.SESSION_COOKIE_NAME ?? "readify_session";
export const MAX_JSON_BYTES = 512 * 1024;

export function requestId(request: NextRequest): string {
  const candidate = request.headers.get("x-request-id");
  return candidate && /^[a-zA-Z0-9._-]{1,100}$/u.test(candidate)
    ? candidate
    : `req_${randomUUID().replaceAll("-", "")}`;
}

export async function jsonBody<T>(request: NextRequest): Promise<T> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_JSON_BYTES)
    throw new AppError("request_body_too_large", 413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_JSON_BYTES)
    throw new AppError("request_body_too_large", 413);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new AppError("malformed_json", 400);
  }
}

export async function validatedBody<T>(
  request: NextRequest,
  schema: ZodType<T>,
): Promise<T> {
  const parsed = schema.safeParse(await jsonBody<unknown>(request));
  if (!parsed.success) {
    const fieldErrors = parsed.error.issues.slice(0, 10).map((issue) => ({
      field: issue.path.join(".") || "body",
      code: issue.code,
    }));
    throw new AppError("invalid_request", 422, { fieldErrors });
  }
  return parsed.data;
}

export async function currentIdentity() {
  const store = await cookies();
  return service.authenticate(store.get(SESSION_COOKIE)?.value);
}

export async function currentToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export function ok(
  body: unknown,
  status = 200,
  correlationId = `req_${randomUUID().replaceAll("-", "")}`,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "X-Request-Id": correlationId },
  });
}

export function noContent(correlationId: string): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: { "X-Request-Id": correlationId },
  });
}

export function problem(error: unknown, correlationId: string): NextResponse {
  const appError =
    error instanceof AppError ? error : new AppError("internal_error", 500);
  const body = {
    type: `urn:readify:problem:${appError.code}`,
    title: appError.code,
    status: appError.status,
    code: appError.code,
    referenceId: correlationId,
    ...appError.metadata,
  };
  return NextResponse.json(body, {
    status: appError.status,
    headers: {
      "Content-Type": "application/problem+json",
      "X-Request-Id": correlationId,
    },
  });
}

export function requireIdempotency(request: NextRequest): string {
  const key = request.headers.get("idempotency-key");
  if (!key) throw new AppError("idempotency_key_required", 400);
  return key;
}

export function enforceRateLimit(
  request: NextRequest,
  scope: string,
  limit: number,
  windowMs = 60_000,
): void {
  const now = Date.now();
  const store =
    globalThis.readifyRateLimits ??
    new Map<string, { count: number; resetAt: number }>();
  globalThis.readifyRateLimits = store;
  if (store.size > 10_000)
    for (const [key, value] of store)
      if (value.resetAt <= now) store.delete(key);
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",", 1)[0]
    ?.trim();
  const key = `${scope}:${forwarded ?? "direct"}`;
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= limit)
    throw new AppError("rate_limited", 429, {
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    });
  current.count += 1;
}

export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new AppError("invalid_origin", 403);
  }
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");
  if (!host || originUrl.host !== host || originUrl.protocol !== `${protocol}:`)
    throw new AppError("invalid_origin", 403);
}
