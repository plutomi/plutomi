require("dotenv").config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import metadata from "./Controllers/Metadata";
import listEndpoints from "express-list-endpoints";
import * as Middleware from "./newMiddleware";
import * as PublicInfo from "./Controllers/PublicInfo";
import * as Auth from "./Controllers/Auth";
import * as Users from "./Controllers/API/Users";
import * as Invites from "./Controllers/API/Invites";
import * as Orgs from "./Controllers/Orgs";
import * as Questions from "./Controllers/Questions";
import * as Stages from "./Controllers/Stages";
import * as Openings from "./Controllers/Openings";
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
  .route("/public/:orgId/openings/:openingId") // TODO get stages in opening
  .get([Middleware.cleanOrgId], PublicInfo.getOpeningInfo)
  .all(Middleware.methodNotAllowed);

app
  .route("/public/:orgId/stages/:stageId")
  .get([Middleware.cleanOrgId], PublicInfo.getStageInfo)
  .all(Middleware.methodNotAllowed);

app
  .route("/public/:orgId/stages/:stageId/questions")
  .get([Middleware.cleanOrgId], PublicInfo.getStageQuestions)
  .all(Middleware.methodNotAllowed);

app
  .route("/questions")
  .post([Middleware.withAuth], Questions.create)
  .all(Middleware.methodNotAllowed);

app
  .route("/questions/:questionId")
  .delete([Middleware.withAuth], Questions.deleteQuestion)
  .put([Middleware.withAuth], Questions.update)
  .all(Middleware.methodNotAllowed);

app
  .route("/stages")
  .post([Middleware.withAuth], Stages.create)
  .all(Middleware.methodNotAllowed);

app
  .route("/stages/:stageId")
  .get([Middleware.withAuth], Stages.getStageInfo)
  .delete([Middleware.withAuth], Stages.deleteStage)
  .put([Middleware.withAuth], Stages.update)
  .all(Middleware.methodNotAllowed);

app
  .route("/stages/:stageId/applicants")
  .get([Middleware.withAuth], Stages.getApplicantsInStage)
  .all(Middleware.methodNotAllowed);

app
  .route("/stages/:stageId/questions")
  .get([Middleware.withAuth], Stages.getQuestionsInStage)
  .all(Middleware.methodNotAllowed);

app
  .route("/openings")
  .get([Middleware.withAuth], Openings.getAllOpenings)
  .post([Middleware.withAuth], Openings.createOpeningController) // TODO fix name
  .all(Middleware.methodNotAllowed);

app
  .route("/openings/:openingId")
  .get([Middleware.withAuth], Openings.getOpeningById)
  .delete(Openings.deleteOpeningController) // TODO fix name
  .put(Openings.updateOpeningController) // TODO fix name
  .all(Middleware.methodNotAllowed);
app
  .route("/auth/login")
  .get(Auth.login) // Log a user in
  .post(Auth.createLoginLinks) // Create login links for the user
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

app
  .route("/users/:userId/invites")
  .get([Middleware.withAuth], Users.getInvites)
  .all(Middleware.methodNotAllowed);

app
  .route("/invites")
  .post([Middleware.withAuth], Invites.create)
  .all(Middleware.methodNotAllowed);

app
  .route("/invites/:inviteId")
  .post([Middleware.withAuth], Invites.accept)
  .put([Middleware.withAuth], Invites.reject)
  .all(Middleware.methodNotAllowed);

app
  .route("/orgs")
  .post([Middleware.withAuth], Orgs.create)
  .all(Middleware.methodNotAllowed);

app
  .route("/orgs/:orgId")
  .get([Middleware.withAuth, Middleware.cleanOrgId], Orgs.get)
  .delete([Middleware.withAuth, Middleware.cleanOrgId], Orgs.deleteOrg)
  .all(Middleware.methodNotAllowed);

app
  .route("/orgs/:orgId")
  .get([Middleware.withAuth, Middleware.cleanOrgId], Orgs.users)
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
