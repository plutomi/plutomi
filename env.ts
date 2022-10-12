import setEnv from '@americanairlines/simple-env';

export const env = setEnv({
  required: {
    nodeEnv: 'NODE_ENV',
    deploymentEnvironment: 'DEPLOYMENT_ENVIRONMENT',
  },
  optional: {
    anOptionalSecret: 'AN_OPTIONAL_SECRET',
  },
});
