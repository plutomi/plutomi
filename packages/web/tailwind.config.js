/** @type {import('tailwindcss').Config} */

const path = require("path");

module.exports = {
  content: [
    path.join(__dirname, "./pages/**/*.{js,ts,jsx,tsx}"),
    path.join(__dirname, "./components/**/*.{js,ts,jsx,tsx}")
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
