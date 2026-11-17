import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        mono: {
          canvas: "#0A0A0B",
          surface: "#111113",
          elevated: "#18181B",
          hover: "#222226",
          line: "rgba(255, 255, 255, 0.08)",
          lineStrong: "rgba(255, 255, 255, 0.16)",
          ink: "#FAFAFA",
          muted: "#A1A1AA",
          dim: "#71717A",
        },
      },
    },
  },
  plugins: [],
};

export default config;
