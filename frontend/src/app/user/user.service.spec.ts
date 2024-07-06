import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Page } from '../shared/page.model';
import { User, UserCommand } from '../shared/user.model';
import { provideHttpClient } from '@angular/common/http';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should list users', () => {
    let actual: Page<User> | null = null;

    service.list(0).subscribe(users => (actual = users));

    const expected = { totalElements: 0 } as Page<User>;
    http.expectOne({ method: 'GET', url: 'api/users?page=0' }).flush(expected);
    expect(actual!).toBe(expected);
  });

  it('should get', () => {
    let actual: User | null = null;

    service.get(42).subscribe(user => (actual = user));

    const expected = { id: 42 } as User;
    http.expectOne({ method: 'GET', url: 'api/users/42' }).flush(expected);
    expect(actual!).toBe(expected);
  });

  it('should create', () => {
    let actual: User | null = null;

    const command = { name: 'foo' } as UserCommand;
    service.create(command).subscribe(user => (actual = user));

    const expected = { id: 42 } as User;
    const testRequest = http.expectOne({ method: 'POST', url: 'api/users' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(expected);
    expect(actual!).toBe(expected);
  });

  it('should update', () => {
    let done = false;

    const command = { name: 'foo' } as UserCommand;
    service.update(42, command).subscribe(() => (done = true));

    const testRequest = http.expectOne({ method: 'PUT', url: 'api/users/42' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(null);
    expect(done).toBe(true);
  });

  it('should delete', () => {
    let done = false;

    service.delete(42).subscribe(() => (done = true));

    http.expectOne({ method: 'DELETE', url: 'api/users/42' }).flush(null);
    expect(done).toBe(true);
  });
});
