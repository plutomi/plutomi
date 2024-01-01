import { env } from "../env";

export const getSessionCookieName = () =>
  `${env.NEXT_PUBLIC_ENVIRONMENT}-plutomi-session`;
