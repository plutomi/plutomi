/* eslint-disable no-console */
import { apiEnvSchema } from "@plutomi/env";

const parsed = apiEnvSchema.safeParse(process.env);

if (!parsed.success) {
  parsed.error.issues.forEach((issue) => {
    console.error("\n❌ Invalid environment variable in API:");
    console.error(issue);
  });

  process.exit(1);
}

// Actual variables used in the infra package and passed on to others when deploying
export const env = parsed.data;
