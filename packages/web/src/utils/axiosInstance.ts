import axios from "axios";
import { env } from "./env";

export const API = axios.create({
  baseURL: env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api"
});
