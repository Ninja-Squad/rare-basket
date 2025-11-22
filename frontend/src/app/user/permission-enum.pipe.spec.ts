import { describe, it } from 'vitest';
import { PermissionEnumPipe } from './permission-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe-test';

describe('PermissionEnumPipe', () => {
  it('should translate permissions', () => {
    testEnumPipe(PermissionEnumPipe, {
      ORDER_MANAGEMENT: 'Gestion des commandes',
      ADMINISTRATION: 'Administration'
    });
  });
});
