import { webEnvSchema, parseEnv, SchemaEnvironment } from "@plutomi/env";

export const env = parseEnv({
  envSchema: webEnvSchema,
  schemaEnvironment: SchemaEnvironment.WEB,
  // NextJS requires env vars to them to be there at build time. By not throwing,
  // we can have PRs against the main branch without having to add the env vars to the repo.
  shouldThrow: false
});
