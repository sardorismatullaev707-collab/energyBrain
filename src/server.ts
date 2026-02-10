/**
 * Simple web server for demo site
 * Serves static files and provides /api/simulate endpoint
 */

import { createServer } from "http";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { runSimulationAPI } from "./api.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // CORS headers for API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // API endpoint
  if (req.url === "/api/simulate") {
    try {
      console.log("⏳ Running simulation...");
      const data = await runSimulationAPI();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
      console.log("✅ Simulation complete");
    } catch (error) {
      console.error("❌ Simulation error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Simulation failed" }));
    }
    return;
  }

  // Serve static files
  let filePath = join(__dirname, "../web", req.url === "/" ? "index.html" : req.url || "");

  try {
    const content = await readFile(filePath);
    const ext = filePath.substring(filePath.lastIndexOf("."));
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      res.writeHead(404);
      res.end("404 Not Found");
    } else {
      res.writeHead(500);
      res.end("500 Internal Server Error");
    }
  }
});

server.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🌐 EnergyBrain Demo Server");
  console.log("=".repeat(60));
  console.log(`\n📡 Server running at: http://localhost:${PORT}`);
  console.log(`\n🚀 Open in browser to see live demo`);
  console.log(`📊 Using real OPSD data (24h simulation)`);
  console.log(`\n` + "=".repeat(60) + "\n");
});
