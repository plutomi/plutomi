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

// Return an org's public info
api
  .route("/public/:orgId")
  .get([Middleware.cleanOrgId], publicInfo.getOrgInfo)
  .all(Middleware.methodNotAllowed);

// Return all public openings for an org
api
  .route("/public/:orgId/openings")
  .get([Middleware.cleanOrgId], publicInfo.getOrgOpenings)
  .all(Middleware.methodNotAllowed);

  // Return public info for an opening
api
  .route("/public/:orgId/openings/:openingId")
  .get([Middleware.cleanOrgId], publicInfo.getSingleOrgOpening)
  .all(Middleware.methodNotAllowed);

// Catch all other routes
api.all("*", Middleware.routeNotFound);
api.listen(port, () => {
  console.log(`Server running on ${port}.`);
});
