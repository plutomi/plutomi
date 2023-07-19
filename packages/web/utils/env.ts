import {
  webEnvSchema,
  parseEnv,
  SchemaEnvironment,
  DeploymentEnvironment
} from "@plutomi/env";

export const env = parseEnv({
  envSchema: webEnvSchema,
  schemaEnvironment: SchemaEnvironment.WEB,
  /**
   * NextJS requires env vars to be there at build time. By not throwing,
   * we can have PRs against the main branch without having to add the env vars to the repo.
   * We should throw while deploying to production, though.
   */
  shouldThrow:
    process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT ===
      DeploymentEnvironment.Production || process.env.NODE_ENV === "production"
});
