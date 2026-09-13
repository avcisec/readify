import { type NextRequest } from "next/server";
import {
  assertSameOrigin,
  currentIdentity,
  noContent,
  ok,
  problem,
  requestId,
  service,
} from "../../../../../server/runtime";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ libraryItemId: string }> },
) {
  const correlationId = requestId(request);
  try {
    const identity = await currentIdentity();
    const { libraryItemId } = await context.params;
    return ok(
      await service.getLibraryItem(identity.userId, libraryItemId),
      200,
      correlationId,
    );
  } catch (error) {
    return problem(error, correlationId);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ libraryItemId: string }> },
) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    const identity = await currentIdentity();
    const { libraryItemId } = await context.params;
    await service.deleteLibraryItem(
      identity.userId,
      libraryItemId,
      correlationId,
    );
    return noContent(correlationId);
  } catch (error) {
    return problem(error, correlationId);
  }
}
