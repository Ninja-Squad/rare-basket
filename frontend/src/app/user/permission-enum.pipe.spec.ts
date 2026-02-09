import { PermissionEnumPipe } from './permission-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe-test';
import { describe, test } from 'vitest';

describe('PermissionEnumPipe', () => {
  test('should translate permissions', () => {
    testEnumPipe(PermissionEnumPipe, {
      ORDER_MANAGEMENT: 'Gestion des commandes',
      ADMINISTRATION: 'Administration'
    });
  });
});
