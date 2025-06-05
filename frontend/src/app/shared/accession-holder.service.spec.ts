import { TestBed } from '@angular/core/testing';

import { AccessionHolderService } from './accession-holder.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AccessionHolder, AccessionHolderCommand } from './user.model';
import { provideHttpClient } from '@angular/common/http';

describe('AccessionHolderService', () => {
  let service: AccessionHolderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AccessionHolderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should list accession holders', () => {
    let actual: Array<AccessionHolder> | undefined;

    service.list().subscribe(accessionHolders => (actual = accessionHolders));

    const expected = [] as Array<AccessionHolder>;
    http.expectOne({ method: 'GET', url: 'api/accession-holders' }).flush(expected);
    expect(actual).toBe(expected);
  });

  it('should get', () => {
    let actual: AccessionHolder | undefined;

    service.get(42).subscribe(accessionHolder => (actual = accessionHolder));

    const expected = { id: 42 } as AccessionHolder;
    http.expectOne({ method: 'GET', url: 'api/accession-holders/42' }).flush(expected);
    expect(actual).toBe(expected);
  });

  it('should create', () => {
    let actual: AccessionHolder | undefined;

    const command = { name: 'foo' } as AccessionHolderCommand;
    service.create(command).subscribe(accessionHolder => (actual = accessionHolder));

    const expected = { id: 42 } as AccessionHolder;
    const testRequest = http.expectOne({ method: 'POST', url: 'api/accession-holders' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(expected);
    expect(actual).toBe(expected);
  });

  it('should update', () => {
    let done = false;

    const command = { name: 'foo' } as AccessionHolderCommand;
    service.update(42, command).subscribe(() => (done = true));

    const testRequest = http.expectOne({ method: 'PUT', url: 'api/accession-holders/42' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(null);
    expect(done).toBe(true);
  });

  it('should delete', () => {
    let done = false;

    service.delete(42).subscribe(() => (done = true));

    http.expectOne({ method: 'DELETE', url: 'api/accession-holders/42' }).flush(null);
    expect(done).toBe(true);
  });
});
