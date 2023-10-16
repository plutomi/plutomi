import axios from "axios";

export const API = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? // In production, reach out to our Rust / Go / whatever API
        `http://${
          process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT as string
        }-plutomi-api.internal/api`
      : // Locally, reach out to our local API
        "http://localhost:8080/api"
});
