/** @type {import('tailwindcss').Config} */
const { join } = require("path");

module.exports = {
  content: [
    join(__dirname, "./app/**/*.{js,ts,jsx,tsx}"),
    join(__dirname, "./pages/**/*.{js,ts,jsx,tsx}"),
    join(__dirname, "./components/**/*.{js,ts,jsx,tsx}")
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
