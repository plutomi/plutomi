require('dotenv').config();
import * as e from 'env-var';

const NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT = e
  .get('NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT')
  .asEnum(['prod', 'stage', 'dev']);

const NODE_ENV = e
  .get('NODE_ENV')
  .required()
  .asEnum(NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'dev' ? ['development'] : ['production']);

const env = e.from(
  {
    // https://github.com/evanshortiss/env-var/issues/162
    PORT: process.env.PORT,
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
    COMMITS_TOKEN: process.env.COMMITS_TOKEN,
    MONGO_URL: process.env.MONGO_URL,
    SESSION_SIGNATURE_SECRET_1: process.env.SESSION_SIGNATURE_SECRET_1,
    ACM_CERTIFICATE_ID: process.env.ACM_CERTIFICATE_ID,
    HOSTED_ZONE_ID: process.env.HOSTED_ZONE_ID,
    LOGIN_LINKS_SECRET: process.env.LOGIN_LINKS_SECRET,
  },
  {
    asPort: (value) => {
      if (value !== '3000') {
        throw new Error(
          `port must be set to '3000',\\ you will have to change it in multiple places if you decide to use another value!`,
        );
      }
      return value;
    },
    // ! TODO enable this again, but will have a dependency loop since config has the domain while env pulls it,
    // but config depends on .env :T
    // asDomain: (value) => {
    //   if (
    //     (NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'stage' ||
    //       NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'prod') &&
    //     value !== DOMAIN_NAME
    //   ) {
    //     throw new Error(`domain must be '${DOMAIN_NAME}' in a live environment`);
    //   }
    //   return value;
    // },
  },
);

const PORT = env.get('PORT').default(3000).required().asPort();

const NEXT_PUBLIC_WEBSITE_URL = env
  .get('NEXT_PUBLIC_WEBSITE_URL')
  .default(`http://localhost:${PORT}`)
  .required(
    NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'stage' || NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'prod',
  );
// .asDomain();
const COMMITS_TOKEN = env
  .get('COMMITS_TOKEN')
  .required()
  .example('ghp_M9nsjS3hsXush1dls')
  .asString();
const MONGO_URL = env
  .get('MONGO_URL')
  .required()
  .example(
    'mongodb+srv://USERNAME:PASSWORD@CLUSTER_NAME.abcdef.mongodb.net/DBNAME?retryWrites=true&w=majority',
  )
  .asString();
const ACM_CERTIFICATE_ID = env
  .get('ACM_CERTIFICATE_ID')
  .required(
    NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'stage' || NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'prod',
  )
  .example('af409ft9-3u66-1ew8-33n9-5d3jn142x70c')
  .asString();

const HOSTED_ZONE_ID = env
  .get('HOSTED_ZONE_ID')
  .required(
    NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'stage' || NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'prod',
  )
  .example('F2938137XC4J29KLUTXE')
  .asString();

// TODO: Replace with next auth
const LOGIN_LINKS_SECRET = env.get('LOGIN_LINKS_SECRET').required().asString();
const SESSION_SIGNATURE_SECRET_1 = env.get('SESSION_SIGNATURE_SECRET_1').required().asString();

export const envVars = {
  NODE_ENV,
  PORT,
  NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT,
  NEXT_PUBLIC_WEBSITE_URL,
  COMMITS_TOKEN,
  MONGO_URL,
  ACM_CERTIFICATE_ID,
  HOSTED_ZONE_ID,
  LOGIN_LINKS_SECRET,
  SESSION_SIGNATURE_SECRET_1,
};
