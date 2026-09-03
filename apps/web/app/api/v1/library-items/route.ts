import { type NextRequest } from "next/server";
import {
  currentIdentity,
  ok,
  problem,
  requestId,
  service,
} from "../../../../server/runtime";

export async function GET(request: NextRequest) {
  const correlationId = requestId(request);
  try {
    const identity = await currentIdentity();
    return ok(await service.listLibrary(identity.userId), 200, correlationId);
  } catch (error) {
    return problem(error, correlationId);
  }
}
