import express from "express";
import { env } from "./env";
import next from "next";

const dev = env.NODE_ENV !== "production";
const webApp = next({ dev, dir: "../web" });
const nextHandler = webApp.getRequestHandler();

(async () => {
  try {
    await webApp.prepare();
  } catch (error) {
    console.error("Error preparing NextJS app:");
    console.error(error);
    process.exit(1);
  }

  const server = express();

  console.log(`NODE ENV: ${env.PORT}`);

  server.set("trust proxy", true);
  server.use(express.json());

  server.get("/api/health", async (req, res) => {
    console.log("API ROUTE");

    res.send("aaaaaaaaaaaa");
    return;
  });

  // NextJS App
  server.get("/*", (req, res) => {
    console.log("NEXT PAGE");
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
