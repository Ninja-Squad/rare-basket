import { TestBed } from '@angular/core/testing';

import { UsersComponent } from './users.component';
import { createMock, MockObject } from '../../../test/mock';
import { stubRoute } from '../../../test/route-stub';
import { PaginationComponent } from '../../rb-ngb/pagination/pagination.component';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { UserService } from '../user.service';
import { Page } from '../../shared/page.model';
import { User } from '../../shared/user.model';
import { ConfirmationService } from '../../shared/confirmation.service';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, test } from 'vitest';

class UsersComponentTester {
  readonly fixture = TestBed.createComponent(UsersComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly users = this.root.getByCss('.user');
  readonly createLink = this.root.getByCss('#create-user');
  readonly deleteButtons = this.root.getByCss('.delete-user-button');

  get paginationComponent(): PaginationComponent | null {
    return this.fixture.debugElement.query(By.directive(PaginationComponent))?.componentInstance ?? null;
  }
}

describe('UsersComponent', () => {
  let tester: UsersComponentTester;
  let userService: MockObject<UserService>;
  let confirmationService: MockObject<ConfirmationService>;
  let toastService: MockObject<ToastService>;

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

  test('should not display anything until users are available', async () => {
    userService.list.mockReturnValue(EMPTY);
    tester = new UsersComponentTester();

    await expect.element(tester.users).toHaveLength(0);
    expect(tester.paginationComponent).toBeNull();
    await expect.element(tester.createLink).not.toBeInTheDocument();
  });

  test('should display users', async () => {
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

    userService.list.mockReturnValue(of(users));
    tester = new UsersComponentTester();

    await expect.element(tester.users).toHaveLength(2);
    await expect.element(tester.users.nth(0)).toHaveTextContent('admin');
    await expect.element(tester.users.nth(0)).toHaveTextContent('Administration');
    await expect.element(tester.users.nth(1)).toHaveTextContent('John');
    await expect.element(tester.users.nth(1)).toHaveTextContent('Administration, Gestion des commandes');
    expect(tester.paginationComponent!.navigate()).toBe(true);
    await expect.element(tester.createLink).toBeInTheDocument();
  });

  test('should delete after confirmation and reload', async () => {
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

    userService.list.mockReturnValueOnce(of(users)).mockReturnValueOnce(of({ ...users, totalElements: 21, content: [users.content[1]] }));
    tester = new UsersComponentTester();

    confirmationService.confirm.mockReturnValue(of(undefined));
    userService.delete.mockReturnValue(of(undefined));

    await tester.deleteButtons.nth(0).click();

    await expect.element(tester.users).toHaveLength(1);
    expect(userService.delete).toHaveBeenCalledWith(1);
    expect(toastService.success).toHaveBeenCalled();
  });
});
