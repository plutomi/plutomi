const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderWidth: {
        oneFive: '1.5px',
      },
    },
    colors: {
      active: {
        light: colors.blueGray[50],
        dark: colors.orange[500],
      },
      homepageGradient: '#fffdfa',
      disabled: colors.gray[400],
      light: colors.blueGray[500],
      normal: colors.blueGray[600],
      dark: colors.blueGray[900],
      transparent: 'transparent',
      current: 'currentColor',
      'blue-gray': colors.blueGray,
      'cool-gray': colors.coolGray,
      gray: colors.gray,
      'true-gray': colors.trueGray,
      'warm-gray': colors.warmGray,
      red: colors.red,
      orange: colors.orange,
      amber: colors.amber,
      yellow: colors.yellow,
      lime: colors.lime,
      green: colors.green,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      sky: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      fuchsia: colors.fuchsia,
      pink: colors.pink,
      rose: colors.rose,
      white: colors.white,
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    // ...

    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
