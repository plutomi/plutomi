const depEnv = process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT;

export const baseAPIUrl = depEnv
  ? `http://${depEnv}-plutomi-api.internal:8080`
  : `http://localhost:8080`;
