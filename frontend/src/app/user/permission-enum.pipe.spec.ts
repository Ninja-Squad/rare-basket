import { PermissionEnumPipe } from './permission-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe.spec';

describe('PermissionEnumPipe', () => {
  it('should translate permissions', () => {
    testEnumPipe(PermissionEnumPipe, {
      ORDER_MANAGEMENT: 'Gestion des commandes',
      ADMINISTRATION: 'Administration'
    });
  });
});
