import { env } from "../env";

export const getCookieName = () =>
  `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-cookie`;
