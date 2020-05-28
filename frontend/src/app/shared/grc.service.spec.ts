import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { GrcService } from './grc.service';
import { Grc } from './user.model';

describe('GrcService', () => {
  let service: GrcService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(GrcService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should list grcs', () => {
    let actual: Array<Grc> = null;

    service.list().subscribe(grcs => (actual = grcs));

    const expected = [] as Array<Grc>;
    http.expectOne({ method: 'GET', url: '/api/grcs' }).flush(expected);
    expect(actual).toBe(expected);
  });
});
