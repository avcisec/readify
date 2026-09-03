import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  assertSameOrigin,
  currentIdentity,
  currentToken,
  noContent,
  ok,
  problem,
  requestId,
  service,
} from "../../../../server/runtime";

export async function GET(request: NextRequest) {
  const correlationId = requestId(request);
  try {
    return ok({ user: await currentIdentity() }, 200, correlationId);
  } catch (error) {
    return problem(error, correlationId);
  }
}

export async function DELETE(request: NextRequest) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    const token = await currentToken();
    if (token) await service.signOut(token);
    (await cookies()).delete(SESSION_COOKIE);
    return noContent(correlationId);
  } catch (error) {
    return problem(error, correlationId);
  }
}
