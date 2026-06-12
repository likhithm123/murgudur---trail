import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151412",
        ivory: "#f7f2e8",
        pearl: "#e5d9c8",
        pine: "#173b33",
        clay: "#9b4d34",
        brass: "#ad8544",
        mist: "#d7e2de"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(21,20,18,.12)"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
