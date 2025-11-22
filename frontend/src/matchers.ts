import { Assertion, expect } from 'vitest';
import { TestElement } from 'ngx-speculoos';

function speculoos<T extends TestElement>(testElement: T): Assertion<Element> {
  return expect(testElement.nativeElement);
}

expect.speculoos = speculoos;
