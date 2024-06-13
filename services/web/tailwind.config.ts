import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        customFont: ["Noto Sans JP"]
      },
      colors: {
        github: {
          500: "#333"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
