import { env } from "../env";

export const getSessionCookieName = () =>
  `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-cookie`;
