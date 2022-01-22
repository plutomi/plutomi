import * as dotenv from "dotenv";
const resultDotEnv = dotenv.config({
  path: `./.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

import * as Auth from "./Controllers/Auth";
import * as Users from "./Controllers/Users";
import * as Orgs from "./Controllers/Orgs";
import * as Openings from "./Controllers/Openings";
import * as Stages from "./Controllers/Stages";
import * as PublicInfo from "./Controllers/PublicInfo";
import * as Invites from "./Controllers/Invites";
import withHasOrg from "./middleware/withHasOrg";
import withSameOrg from "./middleware/withSameOrg";
import helmet from "helmet";
import * as Jest from "./Controllers/jest-setup";
import express from "express";
import cors from "cors";
const morgan = require("morgan");
import withCleanOrgId from "./middleware/withCleanOrgId";
import timeout from "connect-timeout";
import { COOKIE_SETTINGS, WEBSITE_URL } from "./Config";
import withSession from "./middleware/withSession";
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
app.use(withCleanOrgId);
app.use(cookieParser(["sessionpw1"], COOKIE_SETTINGS));

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

if (process.env.NODE_ENV === "development") {
  app.post("/jest-setup", Jest.setup);
}

app.post("/request-login-link", Auth.RequestLoginLink);
app.get("/login", Auth.Login);
app.post("/logout", withSession, Auth.Logout);

app.get("/users", [withSession, withHasOrg], Users.GetUsersInOrg);
app.get("/users/self", withSession, Users.Self);
app.get("/users/:userId", withSession, Users.GetUserById);
app.put("/users/:userId", withSession, Users.UpdateUser);

app.get("/orgs", [withSession, withHasOrg], Orgs.GetOrgInfo);
app.post("/orgs", withSession, Orgs.CreateAndJoinOrg);
app.delete("/orgs", [withSession, withHasOrg], Orgs.DeleteOrg);
app.post("/openings", [withSession, withHasOrg], Openings.CreateOpening);
app.get("/openings", [withSession, withHasOrg], Openings.GetOpeningsInOrg);
app.get(
  "/openings/:openingId",
  [withSession, withHasOrg],
  Openings.GetOpeningById
);
app.delete(
  "/openings/:openingId",
  [withSession, withHasOrg],
  Openings.DeleteOpening
);
app.put(
  "/openings/:openingId",
  [withSession, withHasOrg],
  Openings.UpdateOpening
);

app.post("/stages", [withSession, withHasOrg], Stages.CreateStage);
app.delete(
  "/openings/:openingId/stages/:stageId",
  [withSession, withHasOrg],
  Stages.DeleteStage
);
app.get(
  "/openings/:openingId/stages/:stageId",
  [withSession, withHasOrg],
  Stages.GetStageById
);
app.put(
  "/openings/:openingId/stages/:stageId",
  [withSession, withHasOrg],
  Stages.UpdateStage
);

app.get(
  "/openings/:openingId/stages",
  [withSession, withHasOrg],
  Stages.GetStagesInOpening
);

app.get("/public/orgs/:orgId", withCleanOrgId, PublicInfo.GetPublicOrgInfo);
app.get(
  "/public/orgs/:orgId/openings",
  withCleanOrgId,
  PublicInfo.GetPublicOpeningsInOrg
);

app.get(
  "/public/orgs/:orgId/openings/:openingId",
  withCleanOrgId,
  PublicInfo.GetPublicOpeningInfo
);

app.post("/invites", [withSession, withHasOrg], Invites.CreateInvites);
app.get("/invites", [withSession], Invites.GetUserInvites);
app.get(
  "/orgs/:orgId/invites",
  [withCleanOrgId, withSession, withHasOrg, withSameOrg],
  Invites.GetOrgInvites
);

app.post("/invites/:inviteId", [withSession], Invites.AcceptInvite);

app.delete("/invites/:inviteId", [withSession], Invites.RejectInvite);

// Catch timeouts // TODO make this into its own middleware
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}
app.listen(4000, () => {
  console.log(`Server running on http://localhost:${4000}`);
});
