import { type NextRequest } from "next/server";
import { emailLinkRequestSchema } from "@readify/contracts";
import {
  assertSameOrigin,
  enforceRateLimit,
  ok,
  problem,
  requestId,
  service,
  validatedBody,
} from "../../../../../server/runtime";

export async function POST(request: NextRequest) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    enforceRateLimit(request, "auth_email_link", 30);
    const body = await validatedBody(request, emailLinkRequestSchema);
    const result = await service.requestEmailProof(body.email, body.returnPath);
    if ((process.env.APP_ENV ?? "local") !== "production")
      globalThis.readifyLatestProof = result.proof;
    return ok({ accepted: true }, 202, correlationId);
  } catch (error) {
    return problem(error, correlationId);
  }
}
