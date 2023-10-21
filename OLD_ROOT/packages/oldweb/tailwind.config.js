/** @type {import('tailwindcss').Config} */

const path = require("path");

module.exports = {
  content: [
    path.join(__dirname, "./src/pages/**/*.{js,ts,jsx,tsx}"),
    path.join(__dirname, "./src/components/**/*.{js,ts,jsx,tsx}")
  ],
  theme: {
    extend: {
      scale: {
        102: "1.02"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
