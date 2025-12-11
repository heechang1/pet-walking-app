/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: "#A8DED0",
        orange: "#F6C28B",
        ivory: "#FFFDF8",
        pink: "#FBD3D3",
      },
    },
  },
  plugins: [],
};



