import { type NextRequest } from "next/server";
import { readerPositionSchema } from "@readify/contracts";
import {
  assertSameOrigin,
  currentIdentity,
  ok,
  problem,
  requestId,
  service,
  validatedBody,
} from "../../../../../../server/runtime";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ libraryItemId: string }> },
) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    const identity = await currentIdentity();
    const { libraryItemId } = await context.params;
    const body = await validatedBody(request, readerPositionSchema);
    return ok(
      await service.saveReaderPosition(identity.userId, libraryItemId, {
        sourceRevisionId: body.sourceRevisionId,
        ...body.anchor,
      }),
      200,
      correlationId,
    );
  } catch (error) {
    return problem(error, correlationId);
  }
}
