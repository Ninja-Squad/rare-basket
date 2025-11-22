import { Type } from '@angular/core';
import { vi } from 'vitest';
import { MockedFunction } from '@vitest/spy';

function collectMethodNames(proto: unknown): Array<string> {
  if (!proto || proto === Object.prototype) {
    return [];
  }
  const methodNames: Array<string> = [];
  for (const key of Object.getOwnPropertyNames(proto)) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key);
    if (descriptor && typeof descriptor.value === 'function' && key !== 'constructor') {
      methodNames.push(key);
    }
  }
  return [...methodNames, ...collectMethodNames(Object.getPrototypeOf(proto))];
}

// stolen from vitest's own code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Procedure = (...args: Array<any>) => any;
type Methods<T> = keyof { [K in keyof T as T[K] extends Procedure ? K : never]: T[K] };
// inspired by vitest's MockedObject<T>
export type MockObject<T> = T & { [K in Methods<T>]: T[K] extends Procedure ? MockedFunction<T[K]> : T[K] };

/**
 * Creates a mock object for a class where all the methods of the class (and of its superclasses) are mocks.
 * @param type the type to mock (usually a service class)
 */
export function createMock<T>(type: Type<T>): MockObject<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fakeObject: any = {};
  for (const method of collectMethodNames(type.prototype)) {
    fakeObject[method] = vi.fn().mockName(type.name + '.' + method);
  }
  return fakeObject;
}
