/**
 * Early Jest polyfills that must run before any module that touches them
 * (MSW v2, React 19, Clerk, etc.) is imported. Loaded via `setupFiles`
 * so it executes before the test framework and before `setupTests.ts`.
 *
 * jsdom omits a number of globals that modern browser-targeted packages
 * assume exist. Adding them here keeps individual tests free of boilerplate.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = globalThis as any;

// TextEncoder / TextDecoder — required by MSW v2 and several WHATWG
// primitives polyfilled below. jsdom only ships these in newer versions.
import { TextEncoder, TextDecoder } from 'util';

if (typeof globalAny.TextEncoder === 'undefined') {
  globalAny.TextEncoder = TextEncoder;
}
if (typeof globalAny.TextDecoder === 'undefined') {
  globalAny.TextDecoder = TextDecoder;
}

// fetch / Request / Response / Headers — MSW v2 patches these, but the
// underlying implementations must exist first. `whatwg-fetch` registers
// browser-spec globals against `globalThis` when imported for side effects.
import 'whatwg-fetch';

// BroadcastChannel is used by MSW's internals in some environments; jsdom
// does not implement it. A minimal no-op shim is enough for tests.
if (typeof globalAny.BroadcastChannel === 'undefined') {
  class BroadcastChannelShim {
    name: string;
    onmessage: ((ev: MessageEvent) => void) | null = null;
    constructor(name: string) {
      this.name = name;
    }
    postMessage(_message: unknown): void {}
    close(): void {}
    addEventListener(): void {}
    removeEventListener(): void {}
    dispatchEvent(): boolean {
      return true;
    }
  }
  globalAny.BroadcastChannel = BroadcastChannelShim;
}

// Default API base URL. Application code reads `import.meta.env.VITE_API_URL`,
// but during tests we also expose it via process.env as a convenient default
// that MSW handlers / axios base URL overrides can rely on.
process.env.VITE_API_URL = process.env.VITE_API_URL ?? 'http://localhost';
process.env.VITE_CLERK_PUBLISHABLE_KEY =
  process.env.VITE_CLERK_PUBLISHABLE_KEY ?? 'pk_test_integration-tests';
