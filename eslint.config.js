import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginTs from "@typescript-eslint/eslint-plugin";
import parserTs from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // JS y JSX
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: { js },
    extends: ["js/recommended"],
  },

  // TS y TSX
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        project: "./tsconfig.json", // asegúrate de tener este archivo
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": pluginTs,
    },
    rules: {
      // Puedes personalizar tus reglas aquí
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // React (aplica a JSX y TSX)
  pluginReact.configs.flat.recommended,
]);
