import { TestBed } from '@angular/core/testing';

import { UsersComponent } from './users.component';
import { ComponentTester, createMock, stubRoute, TestButton } from 'ngx-speculoos';
import { PaginationComponent } from '../../rb-ngb/pagination/pagination.component';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { UserService } from '../user.service';
import { Page } from '../../shared/page.model';
import { User } from '../../shared/user.model';
import { ConfirmationService } from '../../shared/confirmation.service';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class UsersComponentTester extends ComponentTester<UsersComponent> {
  constructor() {
    super(UsersComponent);
  }

  get users() {
    return this.elements('.user');
  }

  get paginationComponent(): PaginationComponent | null {
    return this.component(PaginationComponent);
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
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    const route = stubRoute({
      queryParams: { page: '1' }
    });

    userService = createMock(UserService);
    confirmationService = createMock(ConfirmationService);
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: UserService, useValue: userService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: ToastService, useValue: toastService }
      ]
    });
  });

  it('should not display anything until users are available', () => {
    userService.list.and.returnValue(EMPTY);
    tester = new UsersComponentTester();
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
    tester = new UsersComponentTester();
    tester.detectChanges();

    expect(tester.users.length).toBe(2);
    expect(tester.users[0]).toContainText('admin');
    expect(tester.users[0]).toContainText('Administration');
    expect(tester.users[1]).toContainText('John');
    expect(tester.users[1]).toContainText('Administration, Gestion des commandes');
    expect(tester.paginationComponent!.navigate()).toBe(true);
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
    tester = new UsersComponentTester();
    tester.detectChanges();

    confirmationService.confirm.and.returnValue(of(undefined));
    userService.delete.and.returnValue(of(undefined));

    tester.deleteButtons[0].click();

    expect(tester.users.length).toBe(1);
    expect(userService.delete).toHaveBeenCalledWith(1);
    expect(toastService.success).toHaveBeenCalled();
  });
});
