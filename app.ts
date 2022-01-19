import * as dotenv from "dotenv";
const resultDotEnv = dotenv.config({
  path: `/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

import express from "express";

const app = express();

// // Public info
// TODO based on how questionnaire is setup
// app.get("/public/:orgId/stages/:stageId", PublicInfo.getStageInfo);
// app.get(
//   "/public/:orgId/stages/:stageId/questions",
//   PublicInfo.getStageQuestions
// );

// Questions
// TODO rework to use question sets #401 https://github.com/plutomi/plutomi/issues/401
// app.get("/stages/:stageId/questions", Stages.getQuestionsInStage);
// app.post("/questions", Questions.create);
// app.delete("/questions/:questionId", Questions.deleteQuestion);
// app.put("/questions/:questionId", Questions.update);

// TODO rework to add applicant login
// https://github.com/plutomi/plutomi/issues/467
// app.get("/applicants/:applicantId", Applicants.get);
// app.put("/applicants/:applicantId", Applicants.update);
// app.delete("/applicants/:applicantId", Applicants.remove);
// app.post("/applicants/:applicantId/answer", Applicants.answer);
