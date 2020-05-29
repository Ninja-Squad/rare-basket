import { TestBed } from '@angular/core/testing';

import { UsersComponent } from './users.component';
import { ComponentTester, fakeRoute, speculoosMatchers, TestButton } from 'ngx-speculoos';
import { By } from '@angular/platform-browser';
import { PaginationComponent } from '../../rb-ngb/pagination/pagination.component';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { RbNgbModule } from '../../rb-ngb/rb-ngb.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { UserService } from '../user.service';
import { Page } from '../../shared/page.model';
import { User } from '../../shared/user.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmationService } from '../../shared/confirmation.service';

class UsersComponentTester extends ComponentTester<UsersComponent> {
  constructor() {
    super(UsersComponent);
  }

  get users() {
    return this.elements('.user');
  }

  get paginationComponent(): PaginationComponent | null {
    return this.debugElement.query(By.directive(PaginationComponent))?.componentInstance ?? null;
  }

  get createLink() {
    return this.element('#create-user');
  }

  get deleteButtons() {
    return this.elements('.delete-user-button') as Array<TestButton>;
  }
}

describe('UsersComponent', () => {
  let tester: UsersComponentTester;
  let userService: jasmine.SpyObj<UserService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  beforeEach(() => {
    const route = fakeRoute({
      queryParams: of({ page: '1' })
    });

    userService = jasmine.createSpyObj<UserService>('UserService', ['list', 'delete']);
    confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);

    TestBed.configureTestingModule({
      imports: [I18nTestingModule, FontAwesomeModule, RbNgbModule, RouterTestingModule],
      declarations: [UsersComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: UserService, useValue: userService },
        { provide: ConfirmationService, useValue: confirmationService }
      ]
    });

    jasmine.addMatchers(speculoosMatchers);
    tester = new UsersComponentTester();
  });

  it('should not display anything until users are available', () => {
    userService.list.and.returnValue(EMPTY);
    tester.detectChanges();

    expect(tester.users.length).toBe(0);
    expect(tester.paginationComponent).toBeNull();
    expect(tester.createLink).toBeNull();
  });

  it('should display users', () => {
    const users: Page<User> = {
      totalPages: 2,
      totalElements: 22,
      size: 20,
      number: 1,
      content: [
        {
          id: 1,
          name: 'admin',
          permissions: ['ADMINISTRATION']
        },
        {
          id: 2,
          name: 'John',
          permissions: ['ADMINISTRATION', 'ORDER_MANAGEMENT']
        }
      ] as Array<User>
    };

    userService.list.and.returnValue(of(users));
    tester.detectChanges();

    expect(tester.users.length).toBe(2);
    expect(tester.users[0]).toContainText('admin');
    expect(tester.users[0]).toContainText('Administration');
    expect(tester.users[1]).toContainText('John');
    expect(tester.users[1]).toContainText('Administration, Gestion des commandes');
    expect(tester.paginationComponent.navigate).toBe(true);
    expect(tester.createLink).not.toBeNull();
  });

  it('should delete after confirmation and reload', () => {
    const users: Page<User> = {
      totalPages: 2,
      totalElements: 22,
      size: 20,
      number: 1,
      content: [
        {
          id: 1,
          name: 'admin',
          permissions: ['ADMINISTRATION']
        },
        {
          id: 2,
          name: 'John',
          permissions: ['ADMINISTRATION']
        }
      ] as Array<User>
    };

    userService.list.and.returnValues(of(users), of({ ...users, totalElements: 21, content: [users.content[1]] }));
    tester.detectChanges();

    confirmationService.confirm.and.returnValue(of(undefined));
    userService.delete.and.returnValue(of(undefined));

    tester.deleteButtons[0].click();

    expect(tester.users.length).toBe(1);
    expect(userService.delete).toHaveBeenCalledWith(1);
  });
});
