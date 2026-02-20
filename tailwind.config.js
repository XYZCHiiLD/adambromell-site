/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ribbon-red': '#C5003E',
        'deep-blue': '#003D6A',
        'piquant-green': '#00A878',
        'flax': '#EDD382',
        'sandstorm': '#F4C95D',
        'allure': '#E63946',
        'cloud-dancer': '#F0EEE4',
      },
    },
  },
  plugins: [],
}
