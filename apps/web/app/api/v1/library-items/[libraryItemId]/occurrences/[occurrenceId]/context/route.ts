import { type NextRequest } from "next/server";
import {
  currentIdentity,
  enforceRateLimit,
  ok,
  problem,
  requestId,
  service,
} from "../../../../../../../../server/runtime";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ libraryItemId: string; occurrenceId: string }> },
) {
  const correlationId = requestId(request);
  try {
    enforceRateLimit(request, "occurrence_context", 120);
    const identity = await currentIdentity();
    const { libraryItemId, occurrenceId } = await context.params;
    return ok(
      await service.getOccurrenceContext(
        identity.userId,
        libraryItemId,
        occurrenceId,
      ),
      200,
      correlationId,
    );
  } catch (error) {
    return problem(error, correlationId);
  }
}
