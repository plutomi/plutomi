import { apiEnvSchema, parseEnv, SchemaEnvironment } from "@plutomi/env";

export const env = parseEnv({
  envSchema: apiEnvSchema,
  schemaEnvironment: SchemaEnvironment.API
});

let x = undefined;

console.log(x);
