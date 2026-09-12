import { createServer } from "node:http";
import { detectDevice } from "./detect-device.mjs";

const host = "127.0.0.1";
const port = Number(process.env.DEVICE_BRIDGE_PORT || 4123);
let cache = null;
let cachedAt = 0;

const server = createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") { response.writeHead(405); response.end(JSON.stringify({ error: "Method Not Allowed" })); return; }
  if (request.url === "/health") { response.end(JSON.stringify({ ok: true })); return; }
  if (request.url !== "/device") { response.writeHead(404); response.end(JSON.stringify({ error: "Not Found" })); return; }
  try {
    if (!cache || Date.now() - cachedAt > 2000) { cache = await detectDevice(); cachedAt = Date.now(); }
    response.end(JSON.stringify(cache));
  } catch {
    response.writeHead(500); response.end(JSON.stringify({ error: "端末検出に失敗しました。" }));
  }
});

server.listen(port, host, () => {
  console.log(`端末ブリッジを http://${host}:${port} で起動しました。`);
});
