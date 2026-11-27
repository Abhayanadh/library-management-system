/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        vvitu: {
          navy: "#0B1F3A",
          "navy-light": "#143159",
          "navy-dark": "#071426",
          gold: "#C89D3C",
          "gold-light": "#E5C46D",
          "gold-dark": "#A47D24",
          cream: "#F8F7F4",
        },
      },
    },
  },
  plugins: [],
};
