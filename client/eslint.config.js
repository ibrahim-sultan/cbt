import js from '@eslint/js';
import react from 'eslint-plugin-react';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: 'readonly', document: 'readonly', localStorage: 'readonly', fetch: 'readonly', alert: 'readonly', setInterval: 'readonly', clearInterval: 'readonly' }
    },
    plugins: { react },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': 'off'
    },
    settings: { react: { version: 'detect' } }
  },
  {
    files: ['src/**/*.test.{js,jsx}'],
    languageOptions: {
      globals: { test: 'readonly', expect: 'readonly', describe: 'readonly', document: 'readonly' }
    }
  },
  {
    files: ['src/**/*.jsx'],
    languageOptions: {
      globals: { FormData: 'readonly', URLSearchParams: 'readonly', Blob: 'readonly', URL: 'readonly' }
    }
  }
];
