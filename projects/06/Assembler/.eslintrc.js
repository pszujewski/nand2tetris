module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', "mocha"],
    rules: {
      "mocha/no-exclusive-tests": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
    extends: ['plugin:@typescript-eslint/recommended', "prettier"],
  }