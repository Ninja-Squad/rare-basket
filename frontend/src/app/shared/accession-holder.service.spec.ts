import { TestBed } from '@angular/core/testing';

import { AccessionHolderService } from './accession-holder.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AccessionHolder } from './user.model';

describe('AccessionHolderService', () => {
  let service: AccessionHolderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AccessionHolderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should list accession holders', () => {
    let actual: Array<AccessionHolder> = null;

    service.list().subscribe(accessionHolders => (actual = accessionHolders));

    const expected = [] as Array<AccessionHolder>;
    http.expectOne({ method: 'GET', url: '/api/accession-holders' }).flush(expected);
    expect(actual).toBe(expected);
  });

  it('should delete', () => {
    let done = false;

    service.delete(42).subscribe(() => (done = true));

    http.expectOne({ method: 'DELETE', url: '/api/accession-holders/42' }).flush(null);
    expect(done).toBe(true);
  });
});
