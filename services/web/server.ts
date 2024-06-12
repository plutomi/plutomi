import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import express from "express";
import * as build from "./build/index.js";
import { env } from "utils/env.js";

const app = express();
app.use(express.static("public"));
app.set("trust proxy", true);

const redirectToDocs = [
  "/api",
  "/api/",
  "/api/docs",
  "/api/docs/",
  "/api/documentation"
];
app.use(async (req, res, next) => {
  if (redirectToDocs.includes(req.path)) {
    return res.redirect(308, `${env.BASE_WEB_URL}/docs/api`);
  }
  next();
});

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

const server = app.listen(3000, "0.0.0.0", () => {
  if (process.env.NODE_ENV === "development") {
    // @ts-expect-error - testing remix
    broadcastDevReady(build);
  }
  console.log("Remix listening on http://localhost:3000");
});

const gracefulShutdown = async () => {
  server.close(() => {
    console.log("HTTP server closed.", new Date().toISOString());
  });

  // Wait for existing connections to close
  await new Promise((resolve) => setTimeout(resolve, 8000));
  console.log(
    "Finished all requests, shutting down.",
    new Date().toISOString()
  );
  process.exit(0); // Exit cleanly
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
