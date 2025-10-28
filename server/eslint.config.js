import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { process: 'readonly', console: 'readonly' }
    },
    rules: { 'no-unused-vars': 'off' }
  },
  {
    files: ['src/**/*.test.js', 'src/**/__tests__/**/*.js'],
    languageOptions: {
      globals: { test: 'readonly', expect: 'readonly', describe: 'readonly', it: 'readonly', beforeAll: 'readonly', afterAll: 'readonly' }
    }
  }
];
