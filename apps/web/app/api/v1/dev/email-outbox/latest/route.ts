import { type NextRequest } from "next/server";
import { ok, problem, requestId } from "../../../../../../server/runtime";
import { AppError } from "@readify/platform";

export async function GET(request: NextRequest) {
  const correlationId = requestId(request);
  try {
    if ((process.env.APP_ENV ?? "local") === "production")
      throw new AppError("not_found", 404);
    if (!globalThis.readifyLatestProof) throw new AppError("outbox_empty", 404);
    return ok({ proof: globalThis.readifyLatestProof }, 200, correlationId);
  } catch (error) {
    return problem(error, correlationId);
  }
}
