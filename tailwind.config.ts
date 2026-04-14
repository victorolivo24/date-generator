import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "mu-blue": "#00467F",
        "mu-green": "#8BBF3F",
        "mu-purple": "#9370DB",
        "mu-cream": "#F4F0E8",
        "mu-navy": "#062B49",
      },
      boxShadow: {
        varsity: "0 18px 45px rgba(4, 24, 42, 0.25)",
      },
      backgroundImage: {
        "campus-grid":
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
