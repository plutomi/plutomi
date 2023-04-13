/* eslint no-console: 0 */

import express from "express";
import next from "next";
import compression from "compression";
import path from "path";
import env from "./env";

const dev = env.NODE_ENV !== "production";

const dir = path.join(__dirname, "../web");
const webApp = next({ dev, dir });
const nextHandler = webApp.getRequestHandler();

(async () => {
  try {
    // NextJS App
    await webApp.prepare();
  } catch (error) {
    console.error("Error preparing NextJS app:", error);
    process.exit(1);
  }

  const server = express();
  server.set("trust proxy", true);
  server.use(express.json());
  server.use(compression());

  server.get("/api*", (req, res) => {
    res.status(200).json({ message: "Saul Goodman" });
  });

  // NextJS App
  server.get("/*", (req, res) => nextHandler(req, res));

  // Listen for errors
  server.on("error", (err) => {
    console.error("Server error:", err);
  });

  server.listen(env.PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${env.PORT}`);
  });
})().catch((error) => {
  console.error("Error initializing server:", error);
  process.exit(1);
});
