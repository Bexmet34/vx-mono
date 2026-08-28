import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-empty": ["warn", { "allowEmptyCatch": true }],
      "no-useless-escape": "warn",
      "no-prototype-builtins": "warn",
      "no-misleading-character-class": "warn"
    }
  }
];
