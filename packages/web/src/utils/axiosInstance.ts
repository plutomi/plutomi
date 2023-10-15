import axios from "axios";

export const API = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? // In production, reach out to our Rust / Go / whatever API
        "internal.api"
      : // Locally, reach out to our local API
        "http://localhost:8000/api"
});
