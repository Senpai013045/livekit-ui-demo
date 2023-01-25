/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        //skype UI
        "skype-dark": "#1e1e1e",
        "skype-dark-overlay": "#252526",
        "skype-light": "#f3f2f1",
        "skype-red": "#d13438",
      },
    },
  },
  plugins: [],
};
