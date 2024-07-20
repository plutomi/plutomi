import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { installGlobals } from "@remix-run/node";
import path from "path";

installGlobals();

export default defineConfig({
  plugins: [remix()],
  server: {
    port: 3000
  },

  resolve: {
    alias: {
      "~/components": path.resolve(__dirname, "./app/components"),
      "~/hooks": path.resolve(__dirname, "./app/hooks")
    }
  }
});
