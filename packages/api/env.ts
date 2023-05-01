import * as dotenv from "dotenv";
import { apiEnvSchema, parseEnv, SchemaEnvironment } from "@plutomi/env";

dotenv.config();

export const env = parseEnv({
  envSchema: apiEnvSchema,
  schemaEnvironment: SchemaEnvironment.API
});

console.log(`IN ENV API`, env);
