import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const defaultPort = 3000;
const desiredDomain = "plutomi.com";
const deploymentEnvironments = ["prod", "stage", "dev"] as const;
const nodeEnv = ["development", "production"] as const;

/**
 * All environment variables in the app. Each package then Picks the ones it needs.
 * The reason we do this is so that we can have a single source of truth for all env vars, and that
 * place is in infra package when things get built / deployed.
 */
export const sharedEnvSchema = z
  .object({
    PORT: z.coerce
      .number()
      .int()
      .positive()
      .gte(1024)
      .lte(65535)
      .default(defaultPort),
    NODE_ENV: z.enum(nodeEnv),
    DEPLOYMENT_ENVIRONMENT: z.enum(deploymentEnvironments)
  })
  .transform((env) => {
    const isLocal = env.NODE_ENV === "development";
    const DOMAIN = isLocal ? "localhost" : desiredDomain;
    const BASE_URL = `http${isLocal ? "" : "s"}://${DOMAIN}`;
    const API_URL = `${BASE_URL}/api`;

    return { ...env, BASE_URL, DOMAIN, API_URL };
  });
