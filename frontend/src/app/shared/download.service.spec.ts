import { TestBed } from '@angular/core/testing';

import { DownloadService } from './download.service';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

describe('DownloadService', () => {
  let service: DownloadService;

  beforeEach(() => {
    service = TestBed.inject(DownloadService);
  });

  it('should extract the file name from the response', () => {
    const blob = new Blob();
    const response = new HttpResponse<Blob>({
      body: blob,
      headers: new HttpHeaders().append('Content-Disposition', 'attachment: filename="test.xlsx"')
    });

    const result = service.getResponseAttachment(response, 'foo.xlsx');

    expect(result.blob).toBe(blob);
    expect(result.name).toBe('test.xlsx');
  });

  it('should use the default file name if not present in the response', () => {
    const blob = new Blob();
    const response = new HttpResponse<Blob>({
      body: blob
    });

    const result = service.getResponseAttachment(response, 'foo.xlsx');

    expect(result.blob).toBe(blob);
    expect(result.name).toBe('foo.xlsx');
  });
});
