import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { emailLinkSessionSchema } from "@readify/contracts";
import {
  SESSION_COOKIE,
  assertSameOrigin,
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
    const body = await validatedBody(request, emailLinkSessionSchema);
    const result = await service.consumeEmailProof(body.proof);
    const appEnvironment = process.env.APP_ENV ?? "local";
    (await cookies()).set(SESSION_COOKIE, result.sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure:
        request.nextUrl.protocol === "https:" ||
        appEnvironment === "preview" ||
        appEnvironment === "production",
      path: "/",
      maxAge: 30 * 86_400,
    });
    return ok(
      { returnPath: result.returnPath, user: { email: result.identity.email } },
      201,
      correlationId,
    );
  } catch (error) {
    return problem(error, correlationId);
  }
}
