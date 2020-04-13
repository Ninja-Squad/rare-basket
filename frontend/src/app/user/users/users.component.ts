import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../../shared/user.model';
import { Page } from '../../shared/page.model';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { faPlus, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rb-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: Page<User>;

  userIcon = faUser;
  createUserIcon = faPlus;

  constructor(private route: ActivatedRoute, private userService: UserService, private translateService: TranslateService) {}

  ngOnInit() {
    this.route.queryParamMap
      .pipe(
        map(params => +(params.get('page') || 0)),
        switchMap(page => this.userService.list(page))
      )
      .subscribe(users => (this.users = users));
  }

  permissions(user: User) {
    return user.permissions
      .map(p => this.translateService.instant(`enums.permission.${p}`))
      .sort()
      .join(', ');
  }
}
