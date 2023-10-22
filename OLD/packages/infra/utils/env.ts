import {
  parseEnv,
  SchemaEnvironment,
  allEnvVariablesSchema
} from "@plutomi/env";

export const env = parseEnv({
  envSchema: allEnvVariablesSchema,
  schemaEnvironment: SchemaEnvironment.INFRA
});
