import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from '../shared/base-enum-pipe';
import { Permission } from '../shared/user.model';

@Pipe({
  name: 'permissionEnum'
})
export class PermissionEnumPipe extends BaseEnumPipe<Permission> implements PipeTransform {
  constructor() {
    super('permission');
  }
}
