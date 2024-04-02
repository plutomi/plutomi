import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import express from "express";
import * as build from "./build/index.js";

const app = express();
app.use(express.static("public"));
app.set("trust proxy", true);

// app.use((req, res, next) => {
//   if (req.url === "/api" || req.url === "/api/" || req.url === "/api/docs") {
//     // todo improve this just testing nginx conf
//     return res.redirect(302, "/docs/api");
//   }
//   next();
// });

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
