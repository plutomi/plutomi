import helmet from 'helmet';
import express, { Handler } from 'express';
import cors from 'cors';
import timeout from 'connect-timeout';
import withCleanOrgId from './middleware/withCleanOrgId';
import withCleanQuestionId from './middleware/withCleanQuestionId';
import withCleanWebhookId from './middleware/withCleanWebhookId';
import { COOKIE_SETTINGS, EXPRESS_PORT, WEBSITE_URL } from './Config';
import next from 'next';
import { openings } from './routes/openings';
import { orgs } from './routes/orgs';
import { questions } from './routes/questions';
import { webhooks } from './routes/webhooks';
import { users } from './routes/users';
import { stages } from './routes/stages';
import { invites } from './routes/invites';
import { publicInfo } from './routes/public';
import { auth } from './routes/auth';
import { applicants } from './routes/applicants';
import API from './Controllers';
import { env } from './env';
import type { MongoDriver } from '@mikro-orm/mongodb'; // or any other SQL driver package
import { MikroORM } from '@mikro-orm/core';
import mikroOrmOptions from './mikro-orm.config';
import { User } from './entities/User';
import { withEntityManager } from './middleware/withEntityManager';
import { initializeDb } from './utils/initializeDb';

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const morganSettings = env.nodeEnv === 'development' ? 'dev' : 'combined';
const sessionSecrets = [env.sessionSignatureSecret1];
const dev = env.nodeEnv !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(async () => {
    const server = express();
    await initializeDb();
    server.use(helmet());
    server.use(timeout('5s'));
    server.use(
      cors({
        credentials: true,
        origin: WEBSITE_URL,
      }),
    );

    server.set('trust proxy', 1);

    // TODO
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    server.use(API.Misc.haltOnTimeout);
    server.use('/api', [
      morgan(morganSettings),
      cookieParser(sessionSecrets, COOKIE_SETTINGS),
      express.json(),
      withCleanOrgId, // TODO make these all one middleware
      withCleanQuestionId,
      withCleanWebhookId,
      withEntityManager,
    ]);

    if (env.nodeEnv === 'development') {
      server.post('/jest-setup', API.Misc.jestSetup);
    }

    server.get('/api', API.Misc.healthCheck);

    // Routers
    server.use('/api/openings', openings);
    server.use('/api/orgs', orgs);
    server.use('/api/questions', questions);
    server.use('/api/webhooks', webhooks);
    server.use('/api/users', users);
    server.use('/api/stages', stages);
    server.use('/api/invites', invites);
    server.use('/api/public', publicInfo);
    server.use('/api/auth', auth);
    server.use('/api/applicants', applicants);

    // Nextjs
    server.get('/*', (req, res) => {
      return handle(req, res);
    });

    server.listen(EXPRESS_PORT, () => {
      console.log(`Server running on http://localhost:${EXPRESS_PORT}`);
    });
  })
  .catch((error) => {
    console.error(`App crashed`, error);
  });
