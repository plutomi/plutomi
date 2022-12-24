import * as e from 'env-var';
import { DOMAIN_NAME } from './Config';

// These is a deps of the other env vars
const NODE_ENV = e.get('NODE_ENV').required().asEnum(['production', 'development']);
const NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT = e
  .get('NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT')
  .asEnum(['prod', 'stage', 'dev']);

const IS_PROD = NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'prod';
const IS_STAGE = NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === 'stage';
const IS_LIVE = IS_PROD || IS_STAGE;

const env = e.from(process.env, {
  asEmail: (value, requiredDomain) => {
    const split = String(value).split('@');
    // Validating email addresses is hard.
    if (split.length !== 2) {
      throw new Error('must contain exactly one "@"');
    }
    if (requiredDomain && split[1] !== requiredDomain) {
      throw new Error(`must end with @${requiredDomain}`);
    }
    return value;
  },
  asPort: (value): number => {
    if (value !== '3000') {
      throw new Error(
        `port must be set to '3000', you will have to change it in multiple places if you decide to use another value!`,
      );
    }
    return Number(value);
  },
  asDomain: (value) => {
    if (IS_LIVE && value !== DOMAIN_NAME) {
      throw new Error(`domain must be '${DOMAIN_NAME}' in a live environment`);
    }
  },
});

const PORT = env.get('PORT').default(3000).required().asPort();

const NEXT_PUBLIC_WEBSITE_URL = env
  .get('NEXT_PUBLIC_WEBSITE_URL')
  .default(`http://localhost:${PORT}`)
  .required(IS_LIVE)
  .asDomain();
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
  .required(IS_LIVE)
  .example('af409ft9-3u66-1ew8-33n9-5d3jn142x70c');

const HOSTED_ZONE_ID = env
  .get('HOSTED_ZONE_ID')
  .required(IS_LIVE)
  .example('F2938137XC4J29KLUTXE')
  .asString();

// TODO: Replace with next auth
const LOGIN_LINKS_PASSWORD = env.get('LOGIN_LINKS_PASSWORD').required().asString();
const SESSION_SIGNATURE_SECRET_1 = env.get('SESSION_SIGNATURE_SECRET_1').required().asString();

export const envVars = {
  NODE_ENV,
  PORT,
  NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT,
  IS_PROD,
  IS_STAGE,
  IS_LIVE,
  NEXT_PUBLIC_WEBSITE_URL,
  COMMITS_TOKEN,
  MONGO_URL,
  ACM_CERTIFICATE_ID,
  HOSTED_ZONE_ID,
  LOGIN_LINKS_PASSWORD,
  SESSION_SIGNATURE_SECRET_1,
};
