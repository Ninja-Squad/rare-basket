import 'vitest';
import { TestElement } from 'ngx-speculoos';
import { Assertion } from '@vitest/expect';

declare module 'vitest' {
  interface ExpectStatic {
    speculoos: <T extends TestElement>(testElement: T) => Assertion<Element>;
  }
}
