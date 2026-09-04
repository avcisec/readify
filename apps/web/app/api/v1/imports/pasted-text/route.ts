import { type NextRequest } from "next/server";
import { pastedTextImportSchema } from "@readify/contracts";
import {
  assertSameOrigin,
  currentIdentity,
  enforceRateLimit,
  ok,
  problem,
  requestId,
  requireIdempotency,
  service,
  validatedBody,
} from "../../../../../server/runtime";

export async function POST(request: NextRequest) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    enforceRateLimit(request, "pasted_import", 20);
    const identity = await currentIdentity();
    const body = await validatedBody(request, pastedTextImportSchema);
    const result = await service.createPastedImport(
      identity.userId,
      body.text,
      requireIdempotency(request),
      correlationId,
    );
    return ok(result.body, result.status, correlationId);
  } catch (error) {
    return problem(error, correlationId);
  }
}
