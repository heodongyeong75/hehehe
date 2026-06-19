import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0d0d0f",
        panel: "#161618",
        panel2: "#1f1f23",
        border: "#2a2a30",
        accent: "#7c5cff",
        muted: "#8a8a93",
      },
    },
  },
  plugins: [],
};
export default config;
