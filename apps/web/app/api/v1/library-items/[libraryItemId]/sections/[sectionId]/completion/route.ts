import { type NextRequest } from "next/server";
import {
  assertSameOrigin,
  currentIdentity,
  ok,
  problem,
  requestId,
  service,
} from "../../../../../../../../server/runtime";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ libraryItemId: string; sectionId: string }> },
) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    const identity = await currentIdentity();
    const { libraryItemId, sectionId } = await context.params;
    return ok(
      await service.completeSection(
        identity.userId,
        libraryItemId,
        sectionId,
        correlationId,
      ),
      200,
      correlationId,
    );
  } catch (error) {
    return problem(error, correlationId);
  }
}
