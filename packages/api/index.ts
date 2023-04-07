import express from "express";
import { env } from "./env";
import next from "next";
import compression from "compression";
import path from "path";

const dev = env.NODE_ENV !== "production";
const webApp = next({ dev, dir: path.resolve(__dirname, "../../web") });
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

  server.get("/api*", async (req, res) => {
    res.status(200).json({ message: "Saul Goodman" });
    return;
  });

  // NextJS App
  server.get("/*", (req, res) => {
    return nextHandler(req, res);
  });

  // Listen for errors
  server.on("error", (err) => {
    console.error("Server error:", err);
  });

  server.listen(env.PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${env.PORT}`);
  });
})();
