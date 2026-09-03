import { type NextRequest } from "next/server";
import { vocabularyChangeSchema } from "@readify/contracts";
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
} from "../../../../server/runtime";

export async function POST(request: NextRequest) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    enforceRateLimit(request, "vocabulary_change", 60);
    const identity = await currentIdentity();
    const body = await validatedBody(request, vocabularyChangeSchema);
    return ok(
      await service.changeVocabularyState(
        identity.userId,
        body.occurrenceId,
        body.state,
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
