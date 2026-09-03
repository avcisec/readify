import { service } from "../../../server/runtime";

export async function GET() {
  const ready = await service.ready();
  return Response.json(
    { status: ready ? "ready" : "not_ready" },
    { status: ready ? 200 : 503 },
  );
}
