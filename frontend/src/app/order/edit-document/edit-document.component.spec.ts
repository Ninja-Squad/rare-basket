import { TestBed } from '@angular/core/testing';

import { EditDocumentComponent } from './edit-document.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ALL_DOCUMENT_TYPES, DetailedOrder, Document, DocumentCommand } from '../order.model';
import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { provideRouter } from '@angular/router';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { provideRbSignalFormsConfig } from '../../signal-forms';

@Component({
  template:
    '<rb-edit-document [order]="order()" [uploadProgress]="progress()" (saved)="saved.set($event)" (cancelled)="cancelled.set(true)" />',
  imports: [EditDocumentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly order = signal({
    documents: [] as Array<Document>
  } as DetailedOrder);
  readonly progress = signal<number | null>(null);
  readonly cancelled = signal(false);
  readonly saved = signal<DocumentCommand | null>(null);
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly type = this.root.getByCss('#document-type');
  readonly description = this.root.getByCss('#document-description');
  readonly file = this.root.getByCss('#document-file');
  readonly onDeliveryForm = this.root.getByCss('#on-delivery-form');
  readonly errors = this.root.getByCss('.invalid-feedback div');
  readonly saveButton = this.root.getByCss('#document-save-button');
  readonly cancelButton = this.root.getByCss('#document-cancel-button');

  get editDocumentComponent(): EditDocumentComponent {
    return this.fixture.debugElement.query(By.directive(EditDocumentComponent)).componentInstance;
  }

  get progressBar(): NgbProgressbar | null {
    return this.fixture.debugElement.query(By.directive(NgbProgressbar))?.componentInstance ?? null;
  }

  optionLabels(selectLocator: typeof this.type) {
    const select = selectLocator.element() as HTMLSelectElement;
    return Array.from(select.options).map(option => option.textContent ?? '');
  }
}

describe('EditDocumentComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting(), provideRbSignalFormsConfig()]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new TestComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display an empty form', async () => {
    await expect.element(tester.type).toHaveDisplayValue('');
    expect(tester.optionLabels(tester.type).length).toBe(ALL_DOCUMENT_TYPES.length + 1);
    expect(tester.optionLabels(tester.type)).toContain('Facture');
    await expect.element(tester.description).toHaveDisplayValue('');
    await expect.element(tester.onDeliveryForm).not.toBeChecked();

    [tester.type, tester.description, tester.file, tester.saveButton, tester.cancelButton].forEach(
      async locator => await expect.element(locator).not.toBeDisabled()
    );

    expect(tester.progressBar).toBeNull();
  });

  test('should filter out unique document types if they are present in the order', async () => {
    expect(tester.optionLabels(tester.type).length).toBe(ALL_DOCUMENT_TYPES.length + 1);
    expect(tester.optionLabels(tester.type)).toContain('Facture');

    tester.fixture.componentInstance.order.update(order => ({
      ...order,
      documents: [
        {
          type: 'INVOICE'
        } as Document
      ]
    }));
    await tester.fixture.whenStable();

    expect(tester.optionLabels(tester.type).length).toBe(ALL_DOCUMENT_TYPES.length);
    expect(tester.optionLabels(tester.type)).not.toContain('Facture');
  });

  test('should validate', async () => {
    await tester.saveButton.click();

    expect(tester.fixture.componentInstance.saved()).toBeNull();
    await expect.element(tester.errors).toHaveLength(2); // type, file
    await expect.element(tester.type).toHaveClass('is-invalid');
    await expect.element(tester.description).not.toHaveClass('is-invalid');

    await tester.type.selectOptions('Autre');
    await expect.element(tester.errors).toHaveLength(2); // description, file
    await expect.element(tester.type).not.toHaveClass('is-invalid');
    await expect.element(tester.description).toHaveClass('is-invalid');

    await tester.type.selectOptions('Facture');
    await expect.element(tester.errors).toHaveLength(1); // file
    await expect.element(tester.type).not.toHaveClass('is-invalid');
    await expect.element(tester.description).not.toHaveClass('is-invalid');

    let mockFile = { name: 'foo.exe', size: 11 * 1024 * 1024 };
    let selectedFile = mockFile as File;
    let fileList = {
      item: (index: number) => [selectedFile][index] ?? null
    } as unknown as FileList;
    tester.editDocumentComponent.fileChanged(fileList);
    await tester.fixture.whenStable();

    await expect
      .element(tester.root)
      .toHaveTextContent(/Le fichier doit avoir l'une des extensions suivantes\s*:\s*\.pdf, \.txt, \.eml, \.pst, \.ost/);
    await expect.element(tester.errors).toHaveLength(1); // file invalid

    mockFile = { ...mockFile, name: 'foo.pdf' };
    selectedFile = mockFile as File;
    fileList = {
      item: (index: number) => [selectedFile][index] ?? null
    } as unknown as FileList;

    tester.editDocumentComponent.fileChanged(fileList);
    await tester.fixture.whenStable();

    await expect.element(tester.root).toHaveTextContent(/Le fichier est trop volumineux\. Il ne doit pas dépasser 10\s*MB/);
    await expect.element(tester.errors).toHaveLength(1); // file size invalid
  });

  test('should not save a valid document type without a file', async () => {
    await tester.type.selectOptions('Facture');
    await tester.saveButton.click();

    expect(tester.fixture.componentInstance.saved()).toBeNull();
    await expect.element(tester.errors).toHaveLength(1); // file
    await expect.element(tester.root).toHaveTextContent(/Le fichier est obligatoire/);
  });

  test('should disable everything and display progress bar when uploading', async () => {
    tester.fixture.componentInstance.progress.set(0.1);
    await tester.fixture.whenStable();

    [tester.type, tester.description, tester.file, tester.onDeliveryForm, tester.saveButton].forEach(
      async locator => await expect.element(locator).toBeDisabled()
    );

    expect(tester.progressBar).not.toBeNull();
    expect(tester.progressBar!.getPercentValue()).toBe(10);
    expect(tester.progressBar!.animated).toBe(false);
    expect(tester.progressBar!.striped).toBe(false);

    tester.fixture.componentInstance.progress.set(1);
    await tester.fixture.whenStable();

    expect(tester.progressBar!.getPercentValue()).toBe(100);
    expect(tester.progressBar!.animated).toBe(true);
    expect(tester.progressBar!.striped).toBe(true);

    tester.fixture.componentInstance.progress.set(null);
    await tester.fixture.whenStable();

    [tester.type, tester.description, tester.file, tester.saveButton].forEach(
      async locator => await expect.element(locator).not.toBeDisabled()
    );
  });

  test('should save', async () => {
    await tester.type.selectOptions('Autre');
    await tester.description.fill('desc');
    await tester.onDeliveryForm.click();

    const selectedFile = { name: 'foo.txt', size: 100 } as File;
    const fileList = {
      item: (index: number) => [selectedFile][index] ?? null
    } as unknown as FileList;
    tester.editDocumentComponent.fileChanged(fileList);
    await tester.fixture.whenStable();

    await tester.saveButton.click();
    const expectedCommand: DocumentCommand = {
      file: selectedFile,
      document: {
        type: 'OTHER',
        description: 'desc',
        onDeliveryForm: true
      }
    };
    expect(tester.fixture.componentInstance.saved()).toEqual(expectedCommand);
  });

  test('should cancel', async () => {
    await tester.cancelButton.click();
    expect(tester.fixture.componentInstance.cancelled()).toBe(true);
  });

  test('should drag and drop file on input', async () => {
    tester.file.element().dispatchEvent(new DragEvent('dragenter'));
    await expect.element(tester.file).toHaveClass('highlighted');

    tester.file.element().dispatchEvent(new DragEvent('dragexit'));
    await expect.element(tester.file).not.toHaveClass('highlighted');

    tester.file.element().dispatchEvent(new DragEvent('dragenter'));
    await expect.element(tester.file).toHaveClass('highlighted');

    tester.file.element().dispatchEvent(new DragEvent('dragleave'));
    await expect.element(tester.file).not.toHaveClass('highlighted');

    // quite hard to test drop event
  });

  test('should change on delivery form value depending on document type unless dirty', async () => {
    await tester.type.selectOptions('MTA');
    await expect.element(tester.onDeliveryForm).toBeChecked();

    await tester.type.selectOptions('Courriel');
    await expect.element(tester.onDeliveryForm).not.toBeChecked();

    await tester.onDeliveryForm.click();
    await tester.onDeliveryForm.click();

    await tester.type.selectOptions('MTA');
    await expect.element(tester.onDeliveryForm).not.toBeChecked();
  });
});
