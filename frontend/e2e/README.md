# E2E tests using Playwright

Run `pnpm e2e` to run the tests

Arguments can be passed to the last command. See details at https://playwright.dev/docs/test-cli.

In particular:

- to run a single test file: `pnpm e2e e2e/the-test-file.spec.ts`
- to run with just chromium: `pnpm e2e --project=chromium`
- to run with headed browsers (i.e. visible windows): `pnpm e2e --headed`
- to run just one test, in chromium only, in headed mode: `pnpm e2e e2e/the-test-file.spec.ts --project=chromium --headed`
- to run step by step: `pnpm e2e e2e/the-test-file.spec.ts --project=chromium --debug`

To be able to skip some parts in debug mode, add `await page.pause();` to the test, where you want to pause.

