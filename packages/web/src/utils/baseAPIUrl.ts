export const baseAPIUrl =
  process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "production"
    ? `https://api.plutomi.com`
    : process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "staging"
    ? "https://staging-api.plutomi.com"
    : "http://localhost:8080";
