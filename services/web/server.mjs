import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true }
        })
      );

const remixHandler = createRequestHandler({
  // @ts-ignore
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : // @ts-ignore - bleep bloop
      await import("./build/server/index.js")
});

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

app.set("trust proxy", true);

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
}

// Everything else (like favicon.ico) is cached for 12 hours
app.use(express.static("build/client", { maxAge: "12h" }));

app.use(morgan("tiny"));

app.get("/health", (req, res) => {
  res.send("OK");
});

// handle SSR requests
app.all("*", remixHandler);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("Shutting down server...");

  // Close server and give ongoing requests 5 seconds to complete
  server.close((err) => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }
    console.log("Server shut down gracefully.");
    process.exit(0);
  });

  // Force exit if still not shut down after 5 seconds
  setTimeout(() => {
    console.error("Forcing server shutdown...");
    process.exit(1);
  }, 5000);
};

// Listen for termination signals
process.on("SIGINT", shutdown); // Handle Ctrl+C
process.on("SIGTERM", shutdown); // Handle termination signals from orchestration tools like Docker
