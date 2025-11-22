import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    expect: {
      poll: {
        interval: 5
      }
    },
    testTimeout: 2000,
    hookTimeout: 2000
  }
});
