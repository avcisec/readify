import { type NextRequest } from "next/server";
import {
  assertSameOrigin,
  currentIdentity,
  ok,
  problem,
  requestId,
  requireIdempotency,
  service,
} from "../../../../../../server/runtime";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ stateChangeId: string }> },
) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    const identity = await currentIdentity();
    const { stateChangeId } = await context.params;
    return ok(
      await service.undoVocabularyChange(
        identity.userId,
        stateChangeId,
        requireIdempotency(request),
        correlationId,
      ),
      200,
      correlationId,
    );
  } catch (error) {
    return problem(error, correlationId);
  }
}
