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
const PORT = process.env.EXPRESS_PORT;
const WEBSITE_URL = process.env.WEBSITE_URL;
const app = express();
app.use(
  cors({
    credentials: true,
    origin: WEBSITE_URL,
  })
);
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
app.use(session);

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
  .get(Auth.login) // Log a user in
  .post(Auth.createLoginLinks) // Creat login links for the user
  .all(Middleware.methodNotAllowed);

// Log out a user. Session is needed to log out obviously
app
  .route("/auth/logout")
  .post([Middleware.withAuth], Auth.logout)
  .all(Middleware.methodNotAllowed);

// Return information about the current logged in user
app
  .route("/users/self")
  .get([Middleware.withAuth], Users.self)
  .all(Middleware.methodNotAllowed);

/**
 * ------------------------ DO NOT TOUCH BELOW THIS LINE ---------------------------
 * Catch alls for wrong methods and 404s on API routes that do not exist
 */
const endpoints = listEndpoints(app);
app.set("endpoints", endpoints);
// Healthcheck & Info
app.route("/").get(info).all(Middleware.methodNotAllowed);

// Catch all other routes
app.all("*", Middleware.routeNotFound);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
