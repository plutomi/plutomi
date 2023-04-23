import { allEnvVariablesSchema, parseEnv } from "@plutomi/env";
import * as dotenv from "dotenv";

dotenv.config();

export const env = parseEnv({
  envSchema: allEnvVariablesSchema.pick({
    PORT: true,
    NODE_ENV: true,
    NEXT_PUBLIC_BASE_URL: true
  }),
  label: "API"
});
