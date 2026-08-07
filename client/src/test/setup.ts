/**
 * Global Jest test setup.
 *
 * This file is executed once per test suite (after the test framework has been
 * installed in the environment) via `setupFilesAfterEnv` in jest.config.ts.
 */

// Extend Jest's `expect` with DOM-specific matchers such as toBeInTheDocument(),
// toHaveValue(), toBeDisabled(), etc.
import '@testing-library/jest-dom';
