import { webEnvSchema, parseEnv, SchemaEnvironment } from "@plutomi/env";

export const env = parseEnv({
  envSchema: webEnvSchema,
  schemaEnvironment: SchemaEnvironment.WEB,
  // When building, NextJS will throw an error if we don't have these env vars set.
  shouldThrow: false
});
