require("dotenv").config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import * as Middleware from "./newMiddleware";
import * as PublicInfo from "./APIControllers/PublicInfo";
import * as Auth from "./APIControllers/auth";
import { info } from "./APIControllers/APIInfo";
import listEndpoints from "express-list-endpoints";

const port = process.env.EXPRESS_PORT;
const app = express();
// Set some middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Return an org's public info
app
  .route("/public/:orgId")
  .get([Middleware.cleanOrgId], PublicInfo.getOrgInfo)
  .all(Middleware.methodNotAllowed);

// Return all public openings for an org
app
  .route("/public/:orgId/openings")
  .get([Middleware.cleanOrgId], PublicInfo.getOrgOpenings)
  .all(Middleware.methodNotAllowed);

// Return public info for an opening
app
  .route("/public/:orgId/openings/:openingId")
  .get([Middleware.cleanOrgId], PublicInfo.getSingleOrgOpening)
  .all(Middleware.methodNotAllowed);

app
  .route("/auth/login")
  .get(Auth.login)
  .post(Auth.createLoginLinks)
  .all(Middleware.methodNotAllowed);

// DO NOT TOUCH :)
const endpoints = listEndpoints(app);
app.set("endpoints", endpoints);
// Healthcheck & Info
app.route("/").get(info).all(Middleware.methodNotAllowed);

// Catch all other routes
app.all("*", Middleware.routeNotFound);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
