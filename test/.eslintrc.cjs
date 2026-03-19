module.exports = {
  extends: '../.eslintrc.cjs',
  // Allow describe and it
  env: { mocha: true },
  rules: {
    // Allow assert style expressions. i.e. expect(true).to.be.true
    'no-unused-expressions': 'off',

    // It is common for tests to stub out method.

    // Return types are defined by the source code. Allows for quick overwrites.
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Mocked out the methods that shouldn't do anything in the tests.
    '@typescript-eslint/no-empty-function': 'off',
    // Easily return a promise in a mocked method.
    '@typescript-eslint/require-await': 'off',
    header: 'off',
    // Test helpers need dynamic typing for mocks
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // Salesforce field names use underscores
    camelcase: 'off',
    // Dynamic imports in smoke test
    'no-await-in-loop': 'off',
    // Test diagnostics
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'prefer-arrow-callback': 'off',
    'unicorn/numeric-separators-style': 'off',
  },
};
