/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",      // All JS/TS files in src
    "./public/index.html",             // Main HTML file
    './node_modules/@rewind-ui/core/dist/theme/styles/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [
     require('@tailwindcss/typography'),
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('@tailwindcss/forms')({
      strategy: 'class' // only generate classes
    })
  ],
}