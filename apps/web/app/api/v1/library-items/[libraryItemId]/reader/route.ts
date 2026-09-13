import { type NextRequest } from "next/server";
import {
  currentIdentity,
  ok,
  problem,
  requestId,
  service,
} from "../../../../../../server/runtime";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ libraryItemId: string }> },
) {
  const correlationId = requestId(request);
  try {
    const identity = await currentIdentity();
    const { libraryItemId } = await context.params;
    const sectionId =
      request.nextUrl.searchParams.get("sectionId") ?? undefined;
    const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
    return ok(
      await service.getReader(
        identity.userId,
        libraryItemId,
        sectionId,
        cursor,
      ),
      200,
      correlationId,
    );
  } catch (error) {
    return problem(error, correlationId);
  }
}
