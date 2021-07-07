const colors = require('tailwindcss/colors'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  // Default theme: https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js#L7
  theme: {
    extend: {
      colors: {
        primary: colors.indigo, // primary theme color
        secondary: colors.yellow, // secondary theme color
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('nightwind')],
};
