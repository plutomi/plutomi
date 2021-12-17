import * as dotenv from "dotenv";
const resultDotEnv = dotenv.config({
  path: __dirname + `/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

import express from "express";
import helmet from "helmet";
import cors from "cors";
import { metadata } from "./controllers/Metadata";
import listEndpoints from "express-list-endpoints";
import * as PublicInfo from "./controllers/PublicInfo";
import * as Auth from "./controllers/Auth";
import * as Users from "./controllers/Users";
import * as Invites from "./controllers/Invites";
import * as Orgs from "./controllers/Orgs";
import * as Questions from "./controllers/Questions";
import * as Stages from "./controllers/Stages";
import * as Openings from "./controllers/Openings";
import * as Applicants from "./controllers/Applicants";
import * as Emails from "./controllers/Emails";
import withCleanOrgId from "./middleware/withCleanOrgId";
import withAuth from "./middleware/withAuth";
import routeNotFound from "./middleware/routeNotFound";
import { sessionSettings } from "./Config";
const timeout = require("connect-timeout");
const PORT = parseInt(process.env.EXPRESS_PORT) || 4000;
const app = express();
app.use(timeout("5s"));
app.use(
  cors({
    credentials: true,
    origin: process.env.WEBSITE_URL,
  })
);
app.use(express.json());
app.use(helmet());
app.set("trust proxy", 1);
app.use(sessionSettings); // Adds req.session to each route, if applicable
app.use(withCleanOrgId); // If the route has an :orgId, normalize it
app.use(haltOnTimedout);

// Public info
app.get("/public/:orgId", PublicInfo.getOrgInfo);
app.get("/public/:orgId/openings", PublicInfo.getOrgOpenings);
app.get("/public/:orgId/openings/:openingId", PublicInfo.getOpeningInfo); // TODO get stages in opening
app.get("/public/:orgId/stages/:stageId", PublicInfo.getStageInfo);
app.get(
  "/public/:orgId/stages/:stageId/questions",
  PublicInfo.getStageQuestions
);

// Orgs
app.post("/orgs", [withAuth], Orgs.create);
app.get("/orgs/:orgId", [withAuth], Orgs.get);
app.delete("/orgs/:orgId", [withAuth], Orgs.deleteOrg);
// app.get("/orgs/:orgId/invites").get([withAuth], ) // TODO - Get all invites for org

app.get("/openings", [withAuth], Openings.getAllOpenings);
app.post("/openings", [withAuth], Openings.createOpeningController); // TODO fix name

app.get("/openings/:openingId", [withAuth], Openings.getOpeningById);
app.delete(
  "/openings/:openingId",
  [withAuth],
  Openings.deleteOpeningController // TODO name
);
// Openings
app.put("/openings/:openingId", [withAuth], Openings.updateOpeningController);
app.get("/openings/:openingId/applicants", [withAuth], Openings.getApplicants);
app.get("/openings/:openingId/stages", [withAuth], Openings.getStages);

// Stages
app.post("/stages", [withAuth], Stages.create);
app.get("/stages/:stageId", [withAuth], Stages.getStageInfo);
app.delete("/stages/:stageId", [withAuth], Stages.deleteStage);
app.put("/stages/:stageId", [withAuth], Stages.update);

// Questions
app.get("/stages/:stageId/questions", [withAuth], Stages.getQuestionsInStage);
app.post("/questions", [withAuth], Questions.create);
app.delete("/questions/:questionId", [withAuth], Questions.deleteQuestion);
app.put("/questions/:questionId", [withAuth], Questions.update);

// Applicants
app.post("/applicants", Applicants.create);
app.get("/applicants/:applicantId", [withAuth], Applicants.get);
app.put("/applicants/:applicantId", [withAuth], Applicants.update);
app.delete("/applicants/:applicantId", [withAuth], Applicants.remove);
app.post("/applicants/:applicantId/answer", Applicants.answer);
app.get("/stages/:stageId/applicants", [withAuth], Stages.getApplicantsInStage);

// Auth
app.get("/auth/login", Auth.login);
app.post("/auth/login", Auth.createLoginLinks);
app.post("/auth/logout", [withAuth], Auth.logout);

// Users
app.get("/orgs/:orgId/users", [withAuth], Orgs.users);
app.get("/users/self", [withAuth], Users.self);
app.get("/users/:userId", [withAuth], Users.getById);
app.put("/users/:userId", [withAuth], Users.update);

// Invites
app.get("/users/:userId/invites", [withAuth], Users.getInvites);
app.post("/invites", [withAuth], Invites.create);
app.post("/invites/:inviteId", [withAuth], Invites.accept);
app.delete("/invites/:inviteId", [withAuth], Invites.reject);

// Misc
app.get("/unsubscribe/:hash", Emails.unsubscribe);
// ------------------------ DO NOT TOUCH BELOW THIS LINE ---------------------------
const endpoints = listEndpoints(app);
app.set("endpoints", endpoints);
app.get("/", metadata);
app.all("*", routeNotFound);

// Catch timeouts
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
