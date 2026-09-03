import { type NextRequest } from "next/server";
import {
  currentIdentity,
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
