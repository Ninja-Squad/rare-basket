import { TestBed } from '@angular/core/testing';

import { ExportOrdersComponent } from './export-orders.component';
import { createMock, MockObject } from '../../../test/mock';
import { OrderService } from '../order.service';
import { DownloadService } from '../../shared/download.service';
import { HttpResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { provideNgbDatepickerServices } from '../../rb-ngb/datepicker-providers';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

class ExportOrdersComponentTester {
  readonly fixture = TestBed.createComponent(ExportOrdersComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly from = this.root.getByCss('#from');
  readonly to = this.root.getByCss('#to');
  readonly exportButton = this.root.getByCss('#export-button');
  readonly exportSpinner = this.root.getByCss('#export-spinner');
  readonly errors = this.root.getByCss('.invalid-feedback div');

  get componentInstance() {
    return this.fixture.componentInstance;
  }
}

describe('ExportOrdersComponent', () => {
  let tester: ExportOrdersComponentTester;
  let orderService: MockObject<OrderService>;
  let downloadService: MockObject<DownloadService>;

  beforeEach(async () => {
    orderService = createMock(OrderService);
    downloadService = createMock(DownloadService);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        provideNgbDatepickerServices(),
        { provide: OrderService, useValue: orderService },
        { provide: DownloadService, useValue: downloadService }
      ]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new ExportOrdersComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display a form with pre-filled dates', async () => {
    const currentYear = new Date().getFullYear();
    await expect.element(tester.from).toHaveValue(`01/01/${currentYear}`);
    expect((tester.to.element() as HTMLInputElement).value).toMatch(/\d\d\/\d\d\/\d\d\d\d/);
  });

  test('should do nothing if invalid', async () => {
    await tester.to.fill('01/01/2019');
    await tester.exportButton.click();

    await expect.element(tester.errors).toHaveLength(1);
    await expect.element(tester.root).toHaveTextContent('La plage de dates est invalide');

    await tester.to.fill('');
    await tester.from.fill('');
    // required errors are not displayed because it messes up the layout, but the form should be invalid
    expect(tester.componentInstance.form().invalid()).toBe(true);

    expect(orderService.exportReport).not.toHaveBeenCalled();
  });

  test('should export', async () => {
    await tester.from.fill('01/01/2020');
    await tester.to.fill('01/04/2020');

    const response = new HttpResponse<Blob>();
    const responseSubject = new Subject<HttpResponse<Blob>>();
    orderService.exportReport.mockReturnValue(responseSubject);

    await tester.exportButton.click();

    await expect.element(tester.exportSpinner).toBeInTheDocument();

    responseSubject.next(response);
    responseSubject.complete();
    await tester.fixture.whenStable();

    await expect.element(tester.exportSpinner).not.toBeInTheDocument();
    expect(orderService.exportReport).toHaveBeenCalledWith('2020-01-01', '2020-04-01');
    expect(downloadService.download).toHaveBeenCalledWith(response, 'orders.csv');
  });
});
