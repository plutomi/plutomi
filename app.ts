import * as dotenv from "dotenv";
const resultDotEnv = dotenv.config({
  path: `./.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

import * as Auth from "./Controllers/Auth";
import helmet from "helmet";
import express from "express";
import cors from "cors";
const morgan = require("morgan");
import withCleanOrgId from "./middleware/withCleanOrgId";
import timeout from "connect-timeout";
import { API_URL, WEBSITE_URL } from "./Config";
const cookieParser = require("cookie-parser");

const app = express();
app.use(timeout("5s"));

app.use(
  cors({
    credentials: true,
    origin: WEBSITE_URL,
  })
);

const morganSettings =
  process.env.NODE_ENV === "development" ? "dev" : "combined";

app.use(morgan(morganSettings));
app.use(express.json());
app.use(helmet());
app.set("trust proxy", 1);
app.use(haltOnTimedout);
app.use(withCleanOrgId); // If the route has an :orgId, normalize it
app.use(cookieParser({}));
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

app.post("/request-login-link", Auth.RequestLoginLink);
app.get("/login", Auth.Login);
// Catch timeouts
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}
app.listen(4000, () => {
  console.log(`Server running on http://localhost:${4000}`);
});
