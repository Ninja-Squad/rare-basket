import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { GrcService } from './grc.service';
import { Grc, GrcCommand } from './user.model';

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

  it('should get', () => {
    let actual: Grc = null;

    service.get(42).subscribe(grc => (actual = grc));

    const expected = { id: 42 } as Grc;
    http.expectOne({ method: 'GET', url: '/api/grcs/42' }).flush(expected);
    expect(actual).toBe(expected);
  });

  it('should create', () => {
    let actual: Grc = null;

    const command = { name: 'foo' } as GrcCommand;
    service.create(command).subscribe(grc => (actual = grc));

    const expected = { id: 42 } as Grc;
    const testRequest = http.expectOne({ method: 'POST', url: '/api/grcs' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(expected);
    expect(actual).toBe(expected);
  });

  it('should update', () => {
    let done = false;

    const command = { name: 'foo' } as GrcCommand;
    service.update(42, command).subscribe(() => (done = true));

    const testRequest = http.expectOne({ method: 'PUT', url: '/api/grcs/42' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(null);
    expect(done).toBe(true);
  });

  it('should delete', () => {
    let done = false;

    service.delete(42).subscribe(() => (done = true));

    http.expectOne({ method: 'DELETE', url: '/api/grcs/42' }).flush(null);
    expect(done).toBe(true);
  });
});
