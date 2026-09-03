import { type NextRequest } from "next/server";
import { AppError } from "@readify/platform";
import { learningProfileSchema } from "@readify/contracts";
import {
  assertSameOrigin,
  currentIdentity,
  ok,
  problem,
  requestId,
  service,
  validatedBody,
} from "../../../../../server/runtime";

export async function GET(request: NextRequest) {
  const correlationId = requestId(request);
  try {
    const identity = await currentIdentity();
    const profile = await service.getProfile(identity.userId);
    if (!profile) throw new AppError("profile_not_created", 404);
    return ok(profile, 200, correlationId);
  } catch (error) {
    return problem(error, correlationId);
  }
}

export async function PUT(request: NextRequest) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    const identity = await currentIdentity();
    const body = await validatedBody(request, learningProfileSchema);
    return ok(
      await service.putProfile(
        identity.userId,
        body.targetLanguage,
        body.startingLevel,
      ),
      200,
      correlationId,
    );
  } catch (error) {
    return problem(error, correlationId);
  }
}
