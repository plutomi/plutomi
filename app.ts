require("dotenv").config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import * as Middleware from "./newMiddleware";
import * as PublicInfo from "./Controllers/PublicInfo";
import * as Auth from "./Controllers/Auth";
import metadata from "./Controllers/Metadata";
import listEndpoints from "express-list-endpoints";
import * as Users from "./Controllers/Users";
import { sessionSettings } from "./Config";
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

// Adds req.session to routes
app.use(sessionSettings);

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

app
  .route("/users/:userId")
  .get([Middleware.withAuth], Users.getById)
  .put([Middleware.withAuth], Users.update)
  .all(Middleware.methodNotAllowed);
/**
 * ------------------------ DO NOT TOUCH BELOW THIS LINE ---------------------------
 * Catch alls for wrong methods and 404s on API routes that do not exist
 */
const endpoints = listEndpoints(app);
app.set("endpoints", endpoints);
// Healthcheck & Basic metadata about the API
app.route("/").get(metadata).all(Middleware.methodNotAllowed);
app.all("*", Middleware.routeNotFound);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
