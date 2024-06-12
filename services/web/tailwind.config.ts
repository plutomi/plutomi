import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        github: {
          500: "#333"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
