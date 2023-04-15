/* eslint-disable no-console */

import { z } from "zod";

const schema = z.object({
  DEPLOYMENT_ENVIRONMENT: z.enum(["prod", "stage", "dev"]),
  DOMAIN: z.string().url()
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  parsed.error.issues.forEach((issue) => {
    console.error("\n❌ Invalid environment variable:");
    console.error(issue);
  });

  process.exit(1);
}

export const env = parsed.data;
export type EnvironmentVariables = typeof env;
