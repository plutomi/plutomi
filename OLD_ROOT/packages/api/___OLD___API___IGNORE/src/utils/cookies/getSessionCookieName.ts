import { env } from "../env";

export const getSessionCookieName = () =>
  `${env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-plutomi-session`;
