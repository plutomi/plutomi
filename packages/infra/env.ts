import * as dotenv from "dotenv";
import { allEnvVariablesSchema, parseEnv } from "@plutomi/env";

dotenv.config();

export const env = parseEnv({
  envSchema: allEnvVariablesSchema,
  label: "INFRA"
});
