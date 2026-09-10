import { type NextRequest } from "next/server";
import {
  assertSameOrigin,
  currentIdentity,
  enforceRateLimit,
  ok,
  problem,
  requestId,
  requireIdempotency,
  service,
} from "../../../../../server/runtime";
import { AppError, extractFile, maxUploadBytes } from "@readify/platform";

function hasExpectedSignature(source: "pdf" | "epub", bytes: Buffer): boolean {
  if (source === "pdf") return bytes.subarray(0, 5).toString() === "%PDF-";
  return bytes.subarray(0, 2).toString("ascii") === "PK";
}

export async function POST(request: NextRequest) {
  const correlationId = requestId(request);
  try {
    assertSameOrigin(request);
    enforceRateLimit(request, "file_import", 10);
    const identity = await currentIdentity();
    const form = await request.formData();
    const source = form.get("source");
    const file = form.get("file");
    if (source !== "pdf" && source !== "epub")
      throw new AppError("unsupported_file_type", 422);
    if (!(file instanceof File)) throw new AppError("file_required", 422);
    if (file.size > maxUploadBytes()) throw new AppError("file_too_large", 422);
    const extension = file.name.toLocaleLowerCase().split(".").at(-1);
    const bytes = Buffer.from(await file.arrayBuffer());
    if (extension !== source || !hasExpectedSignature(source, bytes))
      throw new AppError("unsupported_file_type", 422);
    let chapters;
    try {
      chapters = await extractFile(bytes, source);
    } catch (error) {
      const code = error instanceof Error ? error.message : "file_parse_failed";
      if (
        code === "file_too_large" ||
        code === "file_no_extractable_text" ||
        code === "file_drm_unsupported"
      )
        throw new AppError(code, 422);
      throw new AppError("file_parse_failed", 422);
    }
    const result = await service.createFileImport(
      identity.userId,
      source,
      chapters,
      requireIdempotency(request),
      correlationId,
    );
    return ok(result.body, result.status, correlationId);
  } catch (error) {
    return problem(error, correlationId);
  }
}
