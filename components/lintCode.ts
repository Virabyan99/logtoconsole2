import { Linter } from "eslint-linter-browserify";

const linter = new Linter();

// ✅ Correct Flat Config Format
const eslintConfig: Linter.Config = {
  languageOptions: {
    ecmaVersion: 2021, // ✅ Change from "latest" (string) to 2021 (number)
    sourceType: "module"
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"]
  }
};

const lintCode = (code: string) => {
  const messages = linter.verify(code, eslintConfig); // ✅ Now correctly typed!

  return messages.map((msg) => ({
    index: msg.column - 1,
    length: msg.endColumn ? msg.endColumn - msg.column : 2,
    message: msg.message,
  }));
};

export default lintCode;
