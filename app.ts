import * as dotenv from 'dotenv';
import helmet from 'helmet';
import express, { Response } from 'express';
import cors from 'cors';
import timeout from 'connect-timeout';
import * as Auth from './Controllers/Auth';
import * as Users from './Controllers/Users';
import * as Orgs from './Controllers/Orgs';
import * as Openings from './Controllers/Openings';
import * as Stages from './Controllers/Stages';
import * as PublicInfo from './Controllers/PublicInfo';
import * as Invites from './Controllers/Invites';
import * as Applicants from './Controllers/Applicants';
import * as Questions from './Controllers/Questions';
import * as Webhooks from './Controllers/Webhooks';
import withHasOrg from './middleware/withHasOrg';
import withSameOrg from './middleware/withSameOrg';
import * as Jest from './Controllers/jest-setup';
import withCleanOrgId from './middleware/withCleanOrgId';
import withCleanQuestionId from './middleware/withCleanQuestionId';
import { COOKIE_SETTINGS, EXPRESS_PORT, WEBSITE_URL } from './Config';
import withSession from './middleware/withSession';

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

app.post('/request-login-link', Auth.RequestLoginLink);
app.get('/login', Auth.Login);
app.post('/logout', withSession, Auth.Logout);

app.get('/users', [withSession, withHasOrg], Users.GetUsersInOrg);
app.get('/users/self', withSession, Users.Self);
app.get('/users/:userId', withSession, Users.GetUserById);
app.put('/users/:userId', withSession, Users.UpdateUser);

app.get('/orgs', [withSession, withHasOrg], Orgs.GetOrgInfo);
app.post('/orgs', withSession, Orgs.CreateAndJoinOrg);
app.delete('/orgs', [withSession, withHasOrg], Orgs.DeleteOrg);
app.post('/openings', [withSession, withHasOrg], Openings.CreateOpening);
app.get('/openings', [withSession, withHasOrg], Openings.GetOpeningsInOrg);
app.get('/openings/:openingId', [withSession, withHasOrg], Openings.GetOpeningById);
app.delete('/openings/:openingId', [withSession, withHasOrg], Openings.DeleteOpening);
app.put('/openings/:openingId', [withSession, withHasOrg], Openings.UpdateOpening);

app.post('/stages', [withSession, withHasOrg], Stages.CreateStage);
app.delete('/openings/:openingId/stages/:stageId', [withSession, withHasOrg], Stages.DeleteStage);

app.post(
  '/openings/:openingId/stages/:stageId/questions',
  [withSession, withHasOrg],
  Questions.AddQuestionToStage,
);
app.get('/openings/:openingId/stages/:stageId', [withSession, withHasOrg], Stages.GetStageById);
app.put('/openings/:openingId/stages/:stageId', [withSession, withHasOrg], Stages.UpdateStage);

app.delete(
  '/openings/:openingId/stages/:stageId/questions/:questionId',
  [withSession, withHasOrg],
  Questions.DeleteQuestionFromStage,
);

app.get('/openings/:openingId/stages', [withSession, withHasOrg], Stages.GetStagesInOpening);

app.get('/public/orgs/:orgId', PublicInfo.GetPublicOrgInfo);
app.get('/public/orgs/:orgId/openings', PublicInfo.GetPublicOpeningsInOrg);

app.get('/public/orgs/:orgId/openings/:openingId', PublicInfo.GetPublicOpeningInfo);

app.post('/invites', [withSession, withHasOrg], Invites.CreateInvites);
app.get('/invites', [withSession], Invites.GetUserInvites);
app.get('/orgs/:orgId/invites', [withSession, withHasOrg, withSameOrg], Invites.GetOrgInvites);
app.delete(
  '/orgs/:orgId/users/:userId',
  [withSession, withHasOrg, withSameOrg],
  Users.RemoveUserFromOrg,
);

// As an org, cancel invite (if sent by mistake or whatever)
app.post(
  '/orgs/:orgId/invites/cancel',
  [withSession, withHasOrg, withSameOrg],
  Invites.CancelInvite,
);
// As a user, reject an invite
app.delete('/invites/:inviteId', [withSession], Invites.RejectInvite);

app.post('/invites/:inviteId', [withSession], Invites.AcceptInvite);

app.post('/applicants', Applicants.CreateApplicants);
app.get(
  '/openings/:openingId/stages/:stageId/applicants',
  [withSession, withHasOrg],
  Applicants.GetApplicantsInStage,
);
app.get(
  '/openings/:openingId/stages/:stageId/questions',
  [withSession, withHasOrg],
  Questions.GetQuestionsInStage,
);

app.get('/applicants/:applicantId', [withSession, withHasOrg], Applicants.GetApplicantById);

app.post('/questions', [withSession, withHasOrg], Questions.CreateQuestions);
app.get('/questions', [withSession, withHasOrg], Questions.GetQuestionsInOrg);
app.delete('/questions/:questionId', [withSession, withHasOrg], Questions.DeleteQuestionFromOrg);
app.put('/questions/:questionId', [withSession, withHasOrg], Questions.UpdateQuestion);
app.get('/questions/:questionId', [withSession, withHasOrg], Questions.GetQuestionInfo);

function healthcheck(req, res: Response) {
  return res.status(200).json({ message: "It's all good man!" });
}

app.get('/', healthcheck);

app.post('/webhooks', [withSession, withHasOrg], Webhooks.CreateWebhook);
app.get('/webhooks', [withSession, withHasOrg], Webhooks.GetWebhooksInOrg);
app.delete('/webhooks/:webhookId', [withSession, withHasOrg], Webhooks.DeleteWebhookFromOrg);
app.get('/webhooks/:webhookId', [withSession, withHasOrg], Webhooks.GetWebhookById);
app.put('/webhooks/:webhookId', [withSession, withHasOrg], Webhooks.UpdateWebhook);

// Catch timeouts // TODO make this into its own middleware
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}
app.listen(EXPRESS_PORT, () => {
  console.log(`Server running on http://localhost:${EXPRESS_PORT}`);
});
