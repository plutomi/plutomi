/* eslint-disable import/first */
/* eslint no-console: 0 */
// import compression from "compression"; // TODO: Add compression back in
import * as dotenv from "dotenv";

dotenv.config();

import express, { type RequestHandler } from "express";
import cors from "cors";
import { mw as requestIpMiddleware } from "request-ip";
import { connectToDatabase, getDatabaseName } from "@plutomi/database";
import { env, nextHandler, webApp } from "./utils";
import API from "./controllers";

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

  try {
    const { client, items, database } = await connectToDatabase({
      databaseName: getDatabaseName()
    });

    const includeMongo: RequestHandler = (req, _res, next) => {
      req.client = client;
      req.items = items;
      req.database = database;
      next();
    };

    server.use(includeMongo);
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }

  server.use(express.json());
  // server.use(compression());
  server.use(cors());
  server.use(requestIpMiddleware());

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
