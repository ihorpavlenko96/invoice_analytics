/**
 * Jest configuration for client integration tests.
 *
 * Goals:
 * - Run React 19 + TypeScript tests in a jsdom environment.
 * - Transform TS/TSX via ts-jest to CommonJS so `jest.mock()` works reliably
 *   for all modules (including ESM-published packages like @clerk/clerk-react
 *   and MSW v2). This keeps the test harness simple and predictable — we can
 *   revisit Jest's experimental ESM mode once it stabilises.
 * - Provide alias + static-asset stubs so component imports don't break.
 *
 * Uses the `.cjs` extension so Jest can load this config directly without a
 * TypeScript loader, even though the surrounding package is `"type": "module"`.
 */

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: '.',
  roots: ['<rootDir>/src'],

  // Match collocated specs (e.g. `foo.spec.tsx` next to source) and shared harness specs.
  testMatch: ['<rootDir>/src/**/*.spec.(ts|tsx)'],

  // Setup lifecycle.
  // - setupFiles: runs BEFORE the test framework is installed. Good for env/polyfills.
  // - setupFilesAfterEnv: runs AFTER the test framework is installed.
  //   Good for jest-dom matchers and MSW server lifecycle hooks.
  setupFiles: ['<rootDir>/src/test-utils/jest.polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setupTests.ts'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // ts-jest (CJS) with the dedicated test tsconfig.
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
        isolatedModules: true,
        diagnostics: {
          // Allow JS transforms without requiring full TS compilation of dep code.
          ignoreCodes: ['TS151001'],
        },
      },
    ],
  },

  // Default Jest skips node_modules for transforms. MSW v2, Clerk and a few of
  // their dependencies publish ESM only, so we opt them in to ts-jest's pipeline.
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|@bundled-es-modules|@clerk|@tanstack|uuid|until-async|strict-event-emitter|tough-cookie|headers-polyfill)/)',
  ],

  moduleNameMapper: {
    // Path alias used in the app (matches Vite's `@/` convention if adopted later).
    '^@/(.*)$': '<rootDir>/src/$1',

    // Strip the ESM `.js` suffix some packages use in their published output.
    '^(\\.{1,2}/.*)\\.js$': '$1',

    // Stub out CSS/SCSS modules so component imports don't break.
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Stub static assets so importing images/fonts in components doesn't fail.
    '\\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot)$':
      '<rootDir>/src/test-utils/fileMock.ts',
  },

  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
};

module.exports = config;
