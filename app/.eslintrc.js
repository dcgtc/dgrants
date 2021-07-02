module.exports = {
  extends: '../.eslintrc',
  parserOptions: {
    project: './tsconfig.json',
    parser: '@typescript-eslint/parser',
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        mocha: true,
      },
    },
  ],
};
