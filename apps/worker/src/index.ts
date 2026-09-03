import { createServer } from "node:http";
import {
  DEFAULT_LOCAL_DATABASE_URL,
  ReadifyService,
  createLanguageAnalyzer,
  loadEnvironment,
  logEvent,
} from "@readify/platform";

if (!process.env.DATABASE_URL)
  process.env.DATABASE_URL = DEFAULT_LOCAL_DATABASE_URL;
const environment = loadEnvironment(process.env);
const service = new ReadifyService(
  undefined,
  undefined,
  undefined,
  undefined,
  createLanguageAnalyzer(environment),
);
let stopping = false;

const health = createServer(async (request, response) => {
  if (request.url === "/health/live") {
    response
      .writeHead(200, { "content-type": "application/json" })
      .end('{"status":"live"}');
    return;
  }
  if (request.url === "/health/ready") {
    const ready = await service.ready();
    response
      .writeHead(ready ? 200 : 503, { "content-type": "application/json" })
      .end(JSON.stringify({ status: ready ? "ready" : "not_ready" }));
    return;
  }
  response.writeHead(404).end();
});

health.listen(
  Number(process.env.WORKER_HEALTH_PORT ?? 3001),
  process.env.WORKER_HEALTH_HOST ?? "0.0.0.0",
  () => {
    logEvent({
      correlationId: "process",
      event: "worker.started",
      outcome: "ready",
    });
  },
);

async function loop(): Promise<void> {
  while (!stopping) {
    const worked = await service.claimAndRunOne();
    if (!worked) await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

function requestShutdown(): void {
  if (stopping) return;
  stopping = true;
  health.close();
}

process.on("SIGINT", requestShutdown);
process.on("SIGTERM", requestShutdown);
void (async () => {
  try {
    await loop();
  } catch {
    logEvent({
      correlationId: "process",
      event: "worker.stopped",
      outcome: "worker_loop_failed",
    });
    process.exitCode = 1;
  } finally {
    stopping = true;
    health.close();
    await service.close();
  }
})();
