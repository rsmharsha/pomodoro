import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "dist/**", "build/**"],
  },
  ...coreWebVitals,
  ...typescript,
  {
    // Tailwind config loads plugins via require() — that's the canonical pattern
    // and the file isn't ESM-ready, so allow it here.
    files: ["tailwind.config.ts", "tailwind.config.js", "postcss.config.{js,cjs,mjs}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default config;
