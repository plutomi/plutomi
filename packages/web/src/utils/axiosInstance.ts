import axios from "axios";

export const API = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? // In production, reach out to our Rust / Go / whatever API
        `${
          process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT as string
        }.api.internal`
      : // Locally, reach out to our local API
        "http://localhost:8000/api"
});
