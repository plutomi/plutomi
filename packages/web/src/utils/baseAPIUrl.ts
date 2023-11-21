export const baseAPIUrl =
  process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "production"
    ? `http://production-plutomi-api.internal:8080`
    : process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "staging"
    ? `http://staging-plutomi-api.internal:8080`
    : "http://0.0.0.0.:8080";
