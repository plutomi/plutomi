import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import express from "express";
import * as build from "./build/index.js";
import { env } from "./app/utils/env.js";

const PORT = 3000;
const app = express();

app.use(express.static("public"));
app.set("trust proxy", true);

app.use(async (req, res, next) => {
  if (req.path === "/api/" || req.path === "/api") {
    res.redirect(`${env.BASE_WEB_URL}/docs/api?from=web`);
    return;
  }
  next();
});

// Pod health check
// TODO: Only return health check for internally accessible requests
// everything else redirect to app
app.get("/health", async (req, res) => {
  return res.json({ status: "ok" });
});

app.all(
  "*",
  createRequestHandler({
    // @ts-expect-error - testing remix
    build
  })
);

const server = app.listen(PORT, "0.0.0.0", () => {
  if (process.env.NODE_ENV === "development") {
    // @ts-expect-error - testing remix
    broadcastDevReady(build);
  }
  console.log(`Remix listening on http://localhost:${PORT}`);
});

const gracefulShutdown = async () => {
  server.close(() => {
    console.log("HTTP server closed.", new Date().toISOString());
  });

  // Wait for existing connections to close
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log(
    "Finished all requests, shutting down.",
    new Date().toISOString()
  );
  process.exit(0); // Exit cleanly
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
