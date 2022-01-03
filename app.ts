import * as dotenv from "dotenv";
const resultDotEnv = dotenv.config({
  path: `/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

import express from "express";
import * as PublicInfo from "./controllers/PublicInfo";
import * as Users from "./controllers/Users";
import * as Invites from "./controllers/Invites";
import * as Orgs from "./controllers/Orgs";
import * as Questions from "./controllers/Questions";
import * as Stages from "./controllers/Stages";
import * as Openings from "./controllers/Openings";
import * as Applicants from "./controllers/Applicants";
import withAuth from "./middleware/withAuth";
const app = express();

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
// app.get("/openings/:openingId/applicants", [withAuth], Openings.getApplicants);
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
app.get(
  `/openings/:openingId/stages/:stageId/applicants`,
  [withAuth],
  Stages.getApplicantsInStage
);

// Users
app.get("/orgs/:orgId/users", [withAuth], Orgs.users);

// Invites
app.get("/users/:userId/invites", [withAuth], Users.getInvites);
app.post("/invites", [withAuth], Invites.create);
app.post("/invites/:inviteId", [withAuth], Invites.accept);
app.delete("/invites/:inviteId", [withAuth], Invites.reject);
