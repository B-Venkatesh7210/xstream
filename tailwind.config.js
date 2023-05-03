/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./helpers/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkRed: "#3C0303",
        lightRed: "#730404",
        bgComponent: "rgba(115, 4, 4, 0.16)",
        darkGrey: "#343434",
        lightGrey: "#575353",
        textfield: "#070404"
      },
      fontFamily: {
        dieNasty: ["Die Nasty", "sans-serif"],
        spotify: ["Spotify", "sans-serif"],
      },
    },
  },
  plugins: [],
};
