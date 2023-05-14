/* eslint-disable import/first */
/* eslint no-console: 0 */
// import compression from "compression"; // TODO: Add compression back in
import * as dotenv from "dotenv";

dotenv.config();
import express from "express";
import next from "next";
import path from "path";
import cors from "cors";
import { env } from "./utils";
import API from "./controllers";

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
  // server.use(compression());
  server.use(cors());

  // All routes are handled here
  server.use("/api", API);

  // NextJS App
  server.all("*", async (req, res) => nextHandler(req, res));

  server.on("error", (err) => {
    console.error("Server error:", err);
  });

  server.listen(env.PORT, () => {
    console.log(`[server]: Server is running at ${env.NEXT_PUBLIC_BASE_URL}`);
  });
})().catch((error) => {
  console.error("Error initializing server:", error);
  process.exit(1);
});
