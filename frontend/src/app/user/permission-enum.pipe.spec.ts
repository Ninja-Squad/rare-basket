import { PermissionEnumPipe } from './permission-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe-test';
import { describe, expect, test } from 'vitest';

describe('PermissionEnumPipe', () => {
  test('should translate permissions', () => {
    expect.hasAssertions();
    testEnumPipe(PermissionEnumPipe, {
      ORDER_MANAGEMENT: 'Gestion des commandes',
      ADMINISTRATION: 'Administration'
    });
  });
});
