import { remix } from "@remix-run/dev";
import MillionLint from "@million/lint";
import { defineConfig } from "vite";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  plugins: [MillionLint.vite(), remix()]
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
};