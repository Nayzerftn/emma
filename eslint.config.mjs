import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Contenu français : les apostrophes droites sont volontaires.
      "react/no-unescaped-entities": "off",
      // Règle RC du React Compiler : faux positifs sur la synchro scroll/route
      // (masthead transparent→solide, fermeture du menu au changement de page).
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
