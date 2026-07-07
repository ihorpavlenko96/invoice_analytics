import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    // CSS modules and style imports are proxied so class names resolve to themselves
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Binary/static assets are mapped to a simple stub module
    '\\.(jpg|jpeg|png|gif|svg|ico|webp)$': '<rootDir>/src/test/__mocks__/fileMock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          // Required for JSX transformation in test files
          jsx: 'react-jsx',
          // Allow default imports from CommonJS modules (e.g. axios, jest-dom)
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          // Relax strict checks that are not relevant during testing
          noUnusedLocals: false,
          noUnusedParameters: false,
          // ts-jest needs to emit for transformation
          noEmit: false,
          // Use node module resolution instead of bundler (Jest runs in Node)
          moduleResolution: 'node',
          // Disallow .ts extensions in imports — jest resolves them automatically
          allowImportingTsExtensions: false,
        },
      },
    ],
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
};

export default config;
