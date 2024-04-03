import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import express from "express";
import * as build from "./build/index.js";

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
    // TODO do the same thing in API - only thing used in the web app is the first one since /api/ trailing slash gets stopped at Traefik
    // TODO use .env
    return res.redirect(301, "https://plutomi.com/docs/api");
  }
  next();
});

app.get("/health", async (req, res) => {
  res.json({ status: "ok" });
  return;
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
  console.log("Closing server gracefully.", new Date().toISOString());
  server.close(() => {
    console.log("HTTP server closed.", new Date().toISOString());
  });

  // Delay for 3 seconds to allow for cleanup

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
