import { databaseEnvSchema, parseEnv, SchemaEnvironment } from "@plutomi/env";

export const env = parseEnv({
  envSchema: databaseEnvSchema,
  schemaEnvironment: SchemaEnvironment.DATABASE
});
