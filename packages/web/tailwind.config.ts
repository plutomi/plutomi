import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  corePlugins: {
    // Tailwind <-> Mantine compatability https://github.com/orgs/mantinedev/discussions/1672#discussioncomment-5922089
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
