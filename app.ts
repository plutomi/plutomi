import * as dotenv from 'dotenv';
import helmet from 'helmet';
import express, { Response } from 'express';
import cors from 'cors';
import timeout from 'connect-timeout';
import withHasOrg from './middleware/withHasOrg';
import withSameOrg from './middleware/withSameOrg';
import * as Jest from './Controllers/jest-setup';
import withCleanOrgId from './middleware/withCleanOrgId';
import withCleanQuestionId from './middleware/withCleanQuestionId';
import { COOKIE_SETTINGS, EXPRESS_PORT, WEBSITE_URL } from './Config';
import withSession from './middleware/withSession';
import API from './Controllers';

const resultDotEnv = dotenv.config({
  path: `./.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

app.use(timeout('5s'));

app.use(
  cors({
    credentials: true,
    origin: WEBSITE_URL,
  }),
);

const morganSettings = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';

app.use(express.json());
app.use(helmet());
app.set('trust proxy', 1);
// TODO
// eslint-disable-next-line @typescript-eslint/no-use-before-define
app.use(haltOnTimedout);
app.use(withCleanOrgId);
app.use(withCleanQuestionId);
app.use(morgan(morganSettings));
const sessionSecrets = [process.env.SESSION_SIGNATURE_SECRET_1];
app.use(cookieParser(sessionSecrets, COOKIE_SETTINGS));

// // Public info
// TODO based on how new questions are setup
// app.get("/public/:orgId/stages/:stageId", PublicInfo.getStageInfo);
// app.get(
//   "/public/:orgId/stages/:stageId/questions",
//   PublicInfo.getStageQuestions
// );

// TODO rework to add applicant login
// https://github.com/plutomi/plutomi/issues/467
// app.get("/applicants/:applicantId", Applicants.get);
// app.put("/applicants/:applicantId", Applicants.update);
// app.delete("/applicants/:applicantId", Applicants.remove);
// app.post("/applicants/:applicantId/answer", Applicants.answer);

if (process.env.NODE_ENV === 'development') {
  app.post('/jest-setup', Jest.setup);
}

app.post('/request-login-link', API.Auth.requestLoginLink);
app.get('/login', API.Auth.login);
app.post('/logout', withSession, API.Auth.logout);

app.get('/users', [withSession, withHasOrg], API.Users.getUsersInOrg);
app.get('/users/self', withSession, API.Users.self);
app.get('/users/:userId', withSession, API.Users.getUser);
app.put('/users/:userId', withSession, API.Users.updateUser);

app.get('/orgs', [withSession, withHasOrg], API.Orgs.getOrg);
app.post('/orgs', withSession, API.Orgs.createAndJoinOrg);
app.delete('/orgs', [withSession, withHasOrg], API.Orgs.leaveAndDeleteOrg);

app.post('/openings', [withSession, withHasOrg], API.Openings.createOpening);
app.get('/openings', [withSession, withHasOrg], API.Openings.getOpeningsInOrg);
app.get('/openings/:openingId', [withSession, withHasOrg], API.Openings.getOpening);
app.delete('/openings/:openingId', [withSession, withHasOrg], API.Openings.deleteOpening);
app.put('/openings/:openingId', [withSession, withHasOrg], API.Openings.updateOpening);

app.post('/stages', [withSession, withHasOrg], API.Stages.createStage);
app.delete('/openings/:openingId/stages/:stageId', [withSession, withHasOrg], API.Stages.getStage);
app.post(
  '/openings/:openingId/stages/:stageId/questions',
  [withSession, withHasOrg],
  API.Questions.addQuestionToStage,
);

app.get('/openings/:openingId/stages/:stageId', [withSession, withHasOrg], API.Stages.getStage);
app.put('/openings/:openingId/stages/:stageId', [withSession, withHasOrg], API.Stages.updateStage);

app.delete(
  '/openings/:openingId/stages/:stageId/questions/:questionId',
  [withSession, withHasOrg],
  API.Questions.deleteQuestionFromStage,
);

app.get('/openings/:openingId/stages', [withSession, withHasOrg], API.Stages.getStagesInOpening);

app.get('/public/orgs/:orgId', API.PublicInfo.getOrg);
app.get('/public/orgs/:orgId/openings', API.PublicInfo.getOpeningsInOrg);
app.get('/public/orgs/:orgId/openings/:openingId', API.PublicInfo.getOpening);

app.post('/invites', [withSession, withHasOrg], API.Invites.createInvite);
app.get('/invites', [withSession], API.Invites.getInvitesForUser);
app.get(
  '/orgs/:orgId/invites',
  [withSession, withHasOrg, withSameOrg],
  API.Invites.getInvitesForOrg,
);
app.delete(
  '/orgs/:orgId/users/:userId',
  [withSession, withHasOrg, withSameOrg],
  API.Users.removeUserFromOrg,
);

// As an org, cancel invite (if sent by mistake or whatever)
app.post(
  '/orgs/:orgId/invites/cancel',
  [withSession, withHasOrg, withSameOrg],
  API.Invites.cancelInvite,
);
// As a user, reject an invite
app.delete('/invites/:inviteId', [withSession], API.Invites.rejectInvite);
app.post('/invites/:inviteId', [withSession], API.Invites.acceptInvite);

app.post('/applicants', API.Applicants.createApplicant);
app.get(
  '/openings/:openingId/stages/:stageId/applicants',
  [withSession, withHasOrg],
  API.Applicants.getApplicantsInStage,
);
app.get(
  '/openings/:openingId/stages/:stageId/questions',
  [withSession, withHasOrg],
  API.Questions.getQuestionsInStage,
);

app.get('/applicants/:applicantId', [withSession, withHasOrg], API.Applicants.getApplicantById);

app.post('/questions', [withSession, withHasOrg], API.Questions.createQuestion);
app.get('/questions', [withSession, withHasOrg], API.Questions.getQuestionsInOrg);
app.delete(
  '/questions/:questionId',
  [withSession, withHasOrg],
  API.Questions.deleteQuestionFromOrg,
);
app.put('/questions/:questionId', [withSession, withHasOrg], API.Questions.updateQuestion);
app.get('/questions/:questionId', [withSession, withHasOrg], API.Questions.getQuestion);

app.post('/webhooks', [withSession, withHasOrg], API.Webhooks.createWebhook);
app.get('/webhooks', [withSession, withHasOrg], API.Webhooks.getWebhooksInOrg);
app.delete('/webhooks/:webhookId', [withSession, withHasOrg], API.Webhooks.deleteWebhook);
app.get('/webhooks/:webhookId', [withSession, withHasOrg], API.Webhooks.getWebhook);
app.put('/webhooks/:webhookId', [withSession, withHasOrg], API.Webhooks.updateWebhook);

function healthcheck(req, res: Response) {
  return res.status(200).json({ message: "It's all good man!" });
}

app.get('/', healthcheck);

// Catch timeouts // TODO make this into its own middleware
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}
app.listen(EXPRESS_PORT, () => {
  console.log(`Server running on http://localhost:${EXPRESS_PORT}`);
});
