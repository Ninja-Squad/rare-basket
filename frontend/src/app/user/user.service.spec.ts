import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Page } from '../shared/page.model';
import { User } from '../shared/user.model';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should list users', () => {
    let actual: Page<User> = null;

    service.list(0).subscribe(users => (actual = users));

    const expected = { totalElements: 0 } as Page<User>;
    http.expectOne({ method: 'GET', url: '/api/users?page=0' }).flush(expected);
    expect(actual).toBe(expected);
  });
});
