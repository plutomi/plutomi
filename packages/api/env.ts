import { apiEnvSchema, parseEnv, SchemaEnvironment } from "@plutomi/env";

export const env = parseEnv({
  envSchema: apiEnvSchema,
  schemaEnvironment: SchemaEnvironment.API
});
