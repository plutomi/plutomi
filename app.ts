import * as dotenv from "dotenv";
const resultDotEnv = dotenv.config({
  path: `/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

import express from "express";
import * as PublicInfo from "./controllers/PublicInfo";
import * as Questions from "./controllers/Questions";
import * as Stages from "./controllers/Stages";
import * as Openings from "./controllers/Openings";
import * as Applicants from "./controllers/Applicants";
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

// app.get("/openings/:openingId/applicants",  Openings.getApplicants); // TODO should this be added?
app.put("/stages/:stageId", Stages.update);

// Questions
app.get("/stages/:stageId/questions", Stages.getQuestionsInStage);
app.post("/questions", Questions.create);
app.delete("/questions/:questionId", Questions.deleteQuestion);
app.put("/questions/:questionId", Questions.update);

// Applicants
app.post("/applicants", Applicants.create);
app.get("/applicants/:applicantId", Applicants.get);
app.put("/applicants/:applicantId", Applicants.update);
app.delete("/applicants/:applicantId", Applicants.remove);
app.post("/applicants/:applicantId/answer", Applicants.answer);
app.get(
  `/openings/:openingId/stages/:stageId/applicants`,

  Stages.getApplicantsInStage
);
