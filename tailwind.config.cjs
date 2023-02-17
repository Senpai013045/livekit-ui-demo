/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "ui-primary": "#014EA2",
        "ui-secondary": "#05028F",
        "ui-light": "#FFFFFF",
        "ui-dark": "#000000",
        "ui-danger": "#F31816",
        "ui-dark-gray": "#252525",
        "ui-light-gray": "#777",
      },
    },
  },
  plugins: [],
};
