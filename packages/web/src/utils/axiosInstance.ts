import axios from "axios";

export const API = axios.create({
  // This will always be localhost, even in stage or prod. Its internal for the web app
  // Then the web app will reach out to our real API written in whatever
  baseURL: "http://localhost:3000/api"
});
