require("dotenv").config();
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
import withCleanOrgId from "./middleware/withCleanOrgId";
import methodNotAllowed from "./middleware/methodNotAllowed";
import withAuth from "./middleware/withAuth";
import routeNotFound from "./middleware/routeNotFound";
import { sessionSettings } from "./Config";
const PORT = process.env.EXPRESS_PORT;
const WEBSITE_URL = process.env.WEBSITE_URL;
const app = express();
app.use(
  cors({
    credentials: true, // Access-Control-Allow-Credentials
    origin: WEBSITE_URL, // Only allow browser requests from our site: https://plutomi.com
  })
);
app.use(express.json());
app.use(helmet());
app.set("trust proxy", 1);
app.use(sessionSettings); // Adds req.session to each route, if applicable
app.use(withCleanOrgId); // If the route has an :orgId, normalize it
/**
 ****************************************************************************
 * All /public routes return publicly available information about the entity
 ****************************************************************************
 */
app.route("/public/:orgId").get(PublicInfo.getOrgInfo).all(methodNotAllowed);

app
  .route("/public/:orgId/openings")
  .get(PublicInfo.getOrgOpenings)
  .all(methodNotAllowed);

app
  .route("/public/:orgId/openings/:openingId") // TODO get stages in opening
  .get(PublicInfo.getOpeningInfo)
  .all(methodNotAllowed);

app
  .route("/public/:orgId/stages/:stageId")
  .get(PublicInfo.getStageInfo)
  .all(methodNotAllowed);

app
  .route("/public/:orgId/stages/:stageId/questions")
  .get(PublicInfo.getStageQuestions)
  .all(methodNotAllowed);

/**
 ****************************************************************************
 * Orgs
 ****************************************************************************
 */
app.route("/orgs").post([withAuth], Orgs.create).all(methodNotAllowed);

app
  .route("/orgs/:orgId")
  .get([withAuth], Orgs.get)
  .delete([withAuth], Orgs.deleteOrg)
  .all(methodNotAllowed);

app.route("/orgs/:orgId").get([withAuth], Orgs.users).all(methodNotAllowed);

/**
 ****************************************************************************
 * Openings
 ****************************************************************************
 */
app
  .route("/openings")
  .get([withAuth], Openings.getAllOpenings)
  .post([withAuth], Openings.createOpeningController) // TODO fix name
  .all(methodNotAllowed);

app
  .route("/openings/:openingId")
  .get([withAuth], Openings.getOpeningById)
  .delete([withAuth], Openings.deleteOpeningController) // TODO fix name
  .put([withAuth], Openings.updateOpeningController) // TODO fix name
  .all(methodNotAllowed);

app
  .route("/openings/:openingId/applicants")
  .get([withAuth], Openings.getApplicants)
  .all(methodNotAllowed);

app
  .route("/openings/:openingId/stages")
  .get([withAuth], Openings.getStages)
  .all(methodNotAllowed);

/**
 ****************************************************************************
 * Stages
 ****************************************************************************
 */
app.route("/stages").post([withAuth], Stages.create).all(methodNotAllowed);

app
  .route("/stages/:stageId")
  .get([withAuth], Stages.getStageInfo)
  .delete([withAuth], Stages.deleteStage)
  .put([withAuth], Stages.update)
  .all(methodNotAllowed);

app
  .route("/stages/:stageId/applicants")
  .get([withAuth], Stages.getApplicantsInStage)
  .all(methodNotAllowed);

app
  .route("/stages/:stageId/questions")
  .get([withAuth], Stages.getQuestionsInStage)
  .all(methodNotAllowed);

/**
 ****************************************************************************
 * Questions
 ****************************************************************************
 */

app
  .route("/questions")
  .post([withAuth], Questions.create)
  .all(methodNotAllowed);

app
  .route("/questions/:questionId")
  .delete([withAuth], Questions.deleteQuestion)
  .put([withAuth], Questions.update)
  .all(methodNotAllowed);

/**
 ****************************************************************************
 * Applicants
 ****************************************************************************
 */

app.route("/applicants").post(Applicants.create).all(methodNotAllowed);

app
  .route("/applicants/:applicantId")
  .get([withAuth], Applicants.get)
  .delete([withAuth], Applicants.remove)
  .put([withAuth], Applicants.update)
  .all(methodNotAllowed);

app
  .route("/applicants/:applicantId/answer")
  .post(Applicants.answer)
  .all(methodNotAllowed);

/**
 ****************************************************************************
 * Auth
 ****************************************************************************
 */
app
  .route("/auth/login")
  .get(Auth.login)
  .post(Auth.createLoginLinks)
  .all(methodNotAllowed);

app.route("/auth/logout").post([withAuth], Auth.logout).all(methodNotAllowed);

/**
 ****************************************************************************
 * Users
 ****************************************************************************
 */

app.route("/users/self").get([withAuth], Users.self).all(methodNotAllowed);

app
  .route("/users/:userId")
  .get([withAuth], Users.getById)
  .put([withAuth], Users.update)
  .all(methodNotAllowed);

app
  .route("/users/:userId/invites")
  .get([withAuth], Users.getInvites)
  .all(methodNotAllowed);

/**
 ****************************************************************************
 * Invites
 ****************************************************************************
 */

app.route("/invites").post([withAuth], Invites.create).all(methodNotAllowed);

app
  .route("/invites/:inviteId")
  .post([withAuth], Invites.accept)
  .delete([withAuth], Invites.reject)
  .all(methodNotAllowed);

/**
 * *------------------------ DO NOT TOUCH BELOW THIS LINE ---------------------------*
 ****************************************************************************
 * Catch alls for wrong methods and 404s on API routes that do not exist
 ****************************************************************************
 */
const endpoints = listEndpoints(app);
app.set("endpoints", endpoints);
app.route("/").get(metadata).all(methodNotAllowed);
app.all("*", routeNotFound);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
