import { Locator, locators } from 'vitest/browser';

locators.extend({
  // Not recommended by vitest, but can be really useful as a transition helper
  getByCss(selector: string) {
    return selector;
  }
});

declare module 'vitest/browser' {
  interface LocatorSelectors {
    // If the custom method returns a string, it will be converted into a locator.
    // If it returns anything else, then it will be returned as usual.
    getByCss(selector: string): Locator;
  }
}
