import express from "express";
import { env } from "./env";

const app = express();

app.get("/", async (req, res) => {
  res.send("Express + TypeScript Server");
});

app.listen(env.PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${env.PORT}`);
});
