const colors = require('tailwindcss/colors'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  // Default theme: https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js#L7
  theme: {
    fontFamily: {
      sans: ['"Source Code Pro"', 'monospace']
    },
    fontSize: {
      sm: ['100%', '170%'],
      md: ['110%', '170%'],
      lg: ['120%', '170%'],
      xl: ['130%', '170%'],
      xxl: ['140%', '170%'],
      headline: ['150%', '170%'],
    },
    colors: {
      'transparent':'transparent',
      'white': '#ffffff',
      'teal': '#02E2AC',
      'pink': '#F3587D',
      'grey-100': '#E2E0E7',
      'grey-200': '#C4C1CF',
      'grey-300': '#A7A2B6',
      'grey-400': '#757087',
      'grey-500': '#0E0333'
    },

    boxShadow: {
        light: '0px 0px 40px 0px rgba(14, 3, 51, .1)',
        none: 'none',
      },

    nightwind: {
      // Keys specify light-mode colors, and values are overrides for Nightwind to replace them with
      colors: {
        white: 'gray.900',
        gray: {
          50: 'gray.800',
        },
      },
    },
  },
  variants: {
    extend: {
      display: ["group-hover"],
    },
  },
  plugins: [require('@tailwindcss/forms'), require('nightwind')],
};




