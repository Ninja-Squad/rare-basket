import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

/**
 * Service used to trigger the download of a blob contained in an HTTP response.
 */
@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  /**
   * Triggers the download of the blob contained in the given response, using the file name
   * present in the 'Content-Disposition' header if present, or the given default file name
   * if absent or if it can't be obtained.
   * It consists in creating a link, setting its href and download attributes, clicking the link,
   * then revoking the URL created from the blob to make it eligible to garbage collection.
   */
  download(response: HttpResponse<Blob>, defaultFileName: string) {
    const file = this.getResponseAttachment(response, defaultFileName);
    const downloadUrl = URL.createObjectURL(file.blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.name;
    link.click();

    URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Function that can be used when a request is made to download a file as a blob,
   * in order to not only get the blob, but also its suggested file name present in the
   * 'Content-Disposition' header.
   * If the name can't be found for whatever reason, the given default name is returned instead.
   *
   * This method if public for testing, but should generally not be used.
   */
  getResponseAttachment(response: HttpResponse<Blob>, defaultFileName: string): { blob: Blob; name: string } {
    const headerName = 'Content-Disposition';
    let name = defaultFileName;
    if (response.headers.has(headerName)) {
      const headerValue = response.headers.get(headerName)!;
      const extraction = /.*filename="(.*)".*/g.exec(headerValue)!;
      if (extraction.length === 2) {
        name = extraction[1];
      }
    }

    return { blob: response.body!, name };
  }
}
