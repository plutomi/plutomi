require("dotenv").config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import * as Middleware from "./newMiddleware";
import * as PublicInfo from "./APIControllers/PublicInfo";
import * as Auth from "./APIControllers/auth";
import { info } from "./APIControllers/APIInfo";
import listEndpoints from "express-list-endpoints";
import { ironSession } from "iron-session/express";
import * as Users from "./APIControllers/Users";
import UsersService from "./Adapters/UsersService";
const port = process.env.EXPRESS_PORT;
const app = express();
console.log("Get url user self", UsersService.getSelfURL());
app.use(cors());
app.use(express.json());
app.use(helmet());
app.set("trust proxy", 1);

const session = ironSession({
  cookieName: "test",
  password:
    "UnhandledPromiseRejectionWarning: Error: iron-session: Bad usage. Password must be at least 32 characters long.",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
});

app.route("/session").get(Auth.session, [session]);
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
  .get([session], Auth.login)
  .post(Auth.createLoginLinks)
  .all(Middleware.methodNotAllowed);

app
  .route("/users/self")
  .get([session], Users.self)
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
