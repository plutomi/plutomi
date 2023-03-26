import axios from "axios";

export type Result = {
  name: string;
  y?: string;
};

export const api = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  },
});

console.log("yea");
