require("dotenv").config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import * as Middleware from "./newMiddleware";
import * as publicInfo from "./Controllers/publicInfo";
const port = process.env.EXPRESS_PORT;
const api = express();

// Set some middleware
api.use(cors());
api.use(express.json());
api.use(helmet());
api.use(Middleware.cleanOrgId);

// Return an org's public info
api
  .route("/public/:orgId")
  .get(publicInfo.getOrgInfo)
  .all(Middleware.methodNotAllowed);

// Return public openings for an org
api
  .route("/public/:orgId/openings")
  .get(publicInfo.getOrgOpenings)
  .all(Middleware.methodNotAllowed);

// Catch all other routes
api.all("*", Middleware.routeNotFound);
api.listen(port, () => {
  console.log(`Server running on ${port}.`);
});
