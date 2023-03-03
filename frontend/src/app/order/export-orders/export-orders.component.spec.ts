import { TestBed } from '@angular/core/testing';

import { ExportOrdersComponent } from './export-orders.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { OrderService } from '../order.service';
import { DownloadService } from '../../shared/download.service';
import { HttpResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';
import { provideNgbDatepickerServices } from '../../rb-ngb/datepicker-providers';

class ExportOrdersComponentTester extends ComponentTester<ExportOrdersComponent> {
  constructor() {
    super(ExportOrdersComponent);
  }

  get from() {
    return this.input('#from');
  }

  get to() {
    return this.input('#to');
  }

  get exportButton() {
    return this.button('#export-button');
  }

  get exportSpinner() {
    return this.element('#export-spinner');
  }

  get errors() {
    return this.elements('.invalid-feedback div');
  }
}

describe('ExportOrdersComponent', () => {
  let tester: ExportOrdersComponentTester;
  let orderService: jasmine.SpyObj<OrderService>;
  let downloadService: jasmine.SpyObj<DownloadService>;

  beforeEach(() => {
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
    tester.detectChanges();
  });

  it('should display a form with pre-filled dates', () => {
    const currentYear = new Date().getFullYear();
    expect(tester.from).toHaveValue(`01/01/${currentYear}`);
    expect(tester.to.value).toMatch(/\d\d\/\d\d\/\d\d\d\d/);
  });

  it('should do nothing if invalid', () => {
    tester.to.fillWith('01/01/2019');
    tester.exportButton.click();

    expect(tester.errors.length).toBe(1);
    expect(tester.testElement).toContainText('La plage de dates est invalide');

    tester.to.fillWith('');
    tester.from.fillWith('');
    // required errors are not displayed because it messes up the layout, but the form should be invalid
    expect(tester.componentInstance.form.invalid).toBe(true);

    expect(orderService.exportReport).not.toHaveBeenCalled();
  });

  it('should export', () => {
    tester.from.fillWith('01/01/2020');
    tester.to.fillWith('01/04/2020');

    const response = new HttpResponse<Blob>();
    const responseSubject = new Subject<HttpResponse<Blob>>();
    orderService.exportReport.and.returnValue(responseSubject);

    tester.exportButton.click();

    expect(tester.exportSpinner).not.toBeNull();

    responseSubject.next(response);
    responseSubject.complete();
    tester.detectChanges();

    expect(tester.exportSpinner).toBeNull();
    expect(orderService.exportReport).toHaveBeenCalledWith('2020-01-01', '2020-04-01');
    expect(downloadService.download).toHaveBeenCalledWith(response, 'orders.csv');
  });
});
