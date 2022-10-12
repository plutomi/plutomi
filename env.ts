import setEnv from '@americanairlines/simple-env';

export const env = setEnv({
  required: {
    nodeEnv: 'NODE_ENV',
    websiteUrl: 'NEXT_PUBLIC_WEBSITE_URL', 
    deploymentEnvironment: 'NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT',
    commitsToken: 'COMMITS_TOKEN',
    loginLinksPassword: 'LOGIN_LINKS_PASSWORD',
    acmCertificateId: 'ACM_CERTIFICATE_ID',
    hostedZoneId: 'HOSTED_ZONE_ID',
    sessionSignatureSecret1: 'SESSION_SIGNATURE_SECRET_1',
  },
  optional: {},
});
