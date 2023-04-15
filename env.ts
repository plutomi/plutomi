/* eslint no-console: 0 */

import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const defaultDomain = "plutomi.com";
const defaultNodeEnvs: readonly ["development", "production"] = [
  "development",
  "production"
];
const deploymentEnvironments: readonly [string, ...string[]] = [
  "prod",
  "stage",
  "dev"
];

/**
 * Shared environment variables across API, Infra, and Web
 */
export const sharedEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().gte(1024).lte(65535).default(3000),
  NODE_ENV: z.enum(defaultNodeEnvs),
  DOMAIN: z.literal(defaultDomain).default(defaultDomain),
  DEPLOYMENT_ENVIRONMENT: z.enum(deploymentEnvironments),
  NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT: z.enum(deploymentEnvironments)
});
