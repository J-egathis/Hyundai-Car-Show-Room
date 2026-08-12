const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    path.join(__dirname, '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        carbon: '#0D0D0D',
        titanium: '#3A3D42',
        xenon: '#E8ECF1',
        ignition: '#F5A623',
      },
    },
  },
  plugins: [],
};
