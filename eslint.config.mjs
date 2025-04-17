// eslint.config.mjs (frontend)
import js from "@eslint/js";
import react from "eslint-plugin-react";
import babelParser from "@babel/eslint-parser";
import globalsPkg from "globals";

const { browser: browserGlobals } = globalsPkg;

export default [
  {
    files: ["**/*.{js,jsx}"],
    ignores: ["node_modules"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      // 1) Use the actual imported object for parser
      parser: babelParser,

      // 2) Babel parser options
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },

      // 3) Merge in browser globals
      globals: {
        ...browserGlobals,
      },
    },

    // ESLint’s recommended core rules
    ...js.configs.recommended,

    // React plugin
    plugins: {
      react,
    },

    // Apply recommended React rules
    rules: {
      ...react.configs.recommended.rules,
      "react/react-in-jsx-scope": "off"
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
