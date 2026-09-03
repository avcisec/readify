import { type NextRequest } from "next/server";
import { processingRetrySchema } from "@readify/contracts";
import {
  assertSameOrigin,
  currentIdentity,
  ok,
  problem,
  requestId,
  requireIdempotency,
  service,
  validatedBody,
} from "../../../../../../server/runtime";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ libraryItemId: string }> },
) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    const identity = await currentIdentity();
    const { libraryItemId } = await context.params;
    const body = await validatedBody(request, processingRetrySchema);
    return ok(
      await service.retryCapability(
        identity.userId,
        libraryItemId,
        body.capability,
        requireIdempotency(request),
        correlationId,
      ),
      202,
      correlationId,
    );
  } catch (error) {
    return problem(error, correlationId);
  }
}
