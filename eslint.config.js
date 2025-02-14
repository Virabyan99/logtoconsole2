// eslint.config.js
import eslintPluginEslintComments from "eslint-plugin-eslint-comments";

export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    plugins: {
      eslintComments: eslintPluginEslintComments
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["error", "double"]
    }
  }
];
