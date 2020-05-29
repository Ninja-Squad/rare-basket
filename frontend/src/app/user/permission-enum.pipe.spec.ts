import { PermissionEnumPipe } from './permission-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe.spec';

describe('PermissionEnumPipe', () => {
  it('should translate permissions', () => {
    testEnumPipe(ts => new PermissionEnumPipe(ts), {
      ORDER_MANAGEMENT: 'Gestion des commandes',
      ADMINISTRATION: 'Administration'
    });
  });
});
