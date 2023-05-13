import { webEnvSchema, parseEnv, SchemaEnvironment } from "@plutomi/env";

export const env = parseEnv({
  envSchema: webEnvSchema,
  schemaEnvironment: SchemaEnvironment.WEB
});
