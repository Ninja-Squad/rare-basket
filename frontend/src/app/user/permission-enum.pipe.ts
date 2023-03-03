import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from '../shared/base-enum-pipe';
import { Permission } from '../shared/user.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'permissionEnum',
  standalone: true
})
export class PermissionEnumPipe extends BaseEnumPipe<Permission> implements PipeTransform {
  constructor(translateService: TranslateService) {
    super(translateService, 'permission');
  }
}
