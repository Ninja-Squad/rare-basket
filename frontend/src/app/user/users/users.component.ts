import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../../shared/user.model';
import { Page } from '../../shared/page.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { faPlus, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService } from '../../shared/confirmation.service';
import { merge, Subject } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { PaginationComponent } from '../../rb-ngb/pagination/pagination.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rb-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  imports: [TranslateModule, FaIconComponent, RouterLink, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent {
  private userService = inject(UserService);
  private translateService = inject(TranslateService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  readonly users: Signal<Page<User> | undefined>;

  readonly userIcon = faUser;
  readonly createUserIcon = faPlus;
  readonly deleteUserIcon = faTrash;

  private reloadPage$ = new Subject<number>();

  constructor() {
    const route = inject(ActivatedRoute);
    const navigationPage$ = route.queryParamMap.pipe(map(params => +(params.get('page') || 0)));
    this.users = toSignal(merge(navigationPage$, this.reloadPage$).pipe(switchMap(page => this.userService.list(page))));
  }

  permissions(user: User) {
    return user.permissions
      .map(p => this.translateService.instant(`enums.permission.${p}`))
      .sort()
      .join(', ');
  }

  deleteUser(user: User) {
    const page = this.users()!;
    this.confirmationService
      .confirm({ messageKey: 'user.users.delete-confirmation' })
      .pipe(
        switchMap(() => this.userService.delete(user.id)),
        tap(() => this.toastService.success('user.users.deleted', { name: user.name }))
      )
      .subscribe(() => this.reloadPage$.next(page.number));
  }
}
