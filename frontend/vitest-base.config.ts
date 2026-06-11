import { defineConfig } from 'vitest/config';

const timeout = process.env.CI ? 5000 : 2000;

export default defineConfig({
  test: {
    expect: {
      poll: {
        interval: 5
      }
    },
    browser: {
      screenshotFailures: false
    },
    testTimeout: timeout,
    hookTimeout: timeout
  }
});
