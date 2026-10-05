import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2] || 4185);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Use a local port between 1024 and 65535");
const mime = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".mp3": "audio/mpeg", ".pdf": "application/pdf" };
const publicDirectories = new Set(["assets", "data", "styles", "music", "videos", "tournaments", "about", "contact", "privacy"]);
const publicFiles = new Set(["index.html", "robots.txt", "sitemap.xml", "favicon.ico"]);
const server = http.createServer((request, response) => {
  try {
    const relative = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname).replace(/^\/+/, "");
    const segments = relative.split("/");
    const filename = path.resolve(root, (!relative || relative.endsWith("/")) ? `${relative}index.html` : relative);
    if (segments.some(part => part.startsWith(".") || part.includes("\\")) ||
        (relative && !publicDirectories.has(segments[0]) && !publicFiles.has(relative)) ||
        !filename.startsWith(root + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      response.writeHead(404); response.end("Not found"); return;
    }
    const type = mime[path.extname(filename)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": /^(?:text\/|application\/json)/.test(type) ? `${type}; charset=utf-8` : type, "Cache-Control": "no-store" });
    fs.createReadStream(filename).pipe(response);
  } catch (_error) { response.writeHead(400); response.end("Invalid request"); }
});
server.on("error", error => { console.error(`Review server could not start: ${error.message}. Choose another local port: node tools/serve-review.mjs 4186`); process.exitCode = 1; });
server.listen(port, "127.0.0.1", () => {
  console.log(`Website task review: http://127.0.0.1:${port}/tournaments/`);
  console.log(`Serving only this isolated checkout: ${root}`);
  console.log("Leave this window open while reviewing. Press Ctrl+C to stop. Nothing is published.");
});
