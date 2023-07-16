import { NodeEnvironment } from "@plutomi/env";
import { env } from "../env";

export const getSessionCookieName = () =>
  `${env.NODE_ENV !== NodeEnvironment.PRODUCTION ? "dev-" : ""}plutomi-session`;
