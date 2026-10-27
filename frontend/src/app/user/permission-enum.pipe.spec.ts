import { describe, expect, test } from 'vitest';
import { testEnumPipe } from '../shared/base-enum-pipe-test';
import { PermissionEnumPipe } from './permission-enum.pipe';

describe('PermissionEnumPipe', () => {
  test('should translate permissions', () => {
    expect.hasAssertions();
    testEnumPipe(PermissionEnumPipe, {
      ORDER_MANAGEMENT: 'Gestion des commandes',
      ADMINISTRATION: 'Administration'
    });
  });
});
