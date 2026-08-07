import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {},
  },
  // Allow Jest globals (`describe`, `it`, `expect`, `jest`, ...) inside
  // spec files and the shared test harness without importing them.
  {
    files: ['**/*.spec.{ts,tsx}', 'src/test-utils/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      // Mocks frequently accept an intentionally-unused parameter to match
      // the real signature (e.g. BroadcastChannel#postMessage). Relax the
      // unused-args rule where a leading underscore marks the intent.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
