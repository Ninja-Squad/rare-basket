import { TestBed } from '@angular/core/testing';

import { EditDocumentComponent } from './edit-document.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ALL_DOCUMENT_TYPES, DetailedOrder, Document, DocumentCommand } from '../order.model';
import { ComponentTester } from 'ngx-speculoos';
import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';
import { provideRouter } from '@angular/router';

@Component({
  template:
    '<rb-edit-document [order]="order()" [uploadProgress]="progress()" (saved)="saved.set($event)" (cancelled)="cancelled.set(true)" />',
  imports: [EditDocumentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly order = signal({
    documents: []
  } as DetailedOrder);
  readonly progress = signal<number | null>(null);
  readonly cancelled = signal(false);
  readonly saved = signal<DocumentCommand | null>(null);
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get editDocumentComponent(): EditDocumentComponent {
    return this.component(EditDocumentComponent);
  }

  get type() {
    return this.select('#document-type');
  }

  get description() {
    return this.input('#document-description');
  }

  get file() {
    return this.input('#document-file');
  }

  get onDeliveryForm() {
    return this.input('#on-delivery-form');
  }

  get errors() {
    return this.elements('.invalid-feedback div');
  }

  get saveButton() {
    return this.button('#document-save-button');
  }

  get cancelButton() {
    return this.button('#document-cancel-button');
  }

  get progressBar(): NgbProgressbar | null {
    return this.debugElement.query(By.directive(NgbProgressbar))?.componentInstance ?? null;
  }
}

describe('EditDocumentComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting()]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new TestComponentTester();
    await tester.stable();
  });

  it('should display an empty form', () => {
    expect(tester.type).toHaveSelectedLabel('');
    expect(tester.type.optionLabels.length).toBe(ALL_DOCUMENT_TYPES.length + 1);
    expect(tester.type.optionLabels).toContain('Facture');
    expect(tester.description).toHaveValue('');
    expect(tester.onDeliveryForm).not.toBeChecked();

    [tester.type, tester.description, tester.file, tester.saveButton, tester.cancelButton].forEach(e => expect(e.disabled).toBe(false));

    expect(tester.progressBar).toBeNull();
  });

  it('should filter out unique document types if they are present in the order', async () => {
    expect(tester.type.optionLabels.length).toBe(ALL_DOCUMENT_TYPES.length + 1);
    expect(tester.type.optionLabels).toContain('Facture');

    tester.componentInstance.order.update(order => ({
      ...order,
      documents: [
        {
          type: 'INVOICE'
        } as Document
      ]
    }));
    await tester.stable();

    expect(tester.type.optionLabels.length).toBe(ALL_DOCUMENT_TYPES.length);
    expect(tester.type.optionLabels).not.toContain('Facture');
  });

  it('should validate', async () => {
    await tester.saveButton.click();

    expect(tester.componentInstance.saved()).toBeNull();
    expect(tester.errors.length).toBe(2); // type, file

    await tester.type.selectLabel('Autre');
    expect(tester.errors.length).toBe(2); // description, file

    await tester.type.selectLabel('Facture');
    expect(tester.errors.length).toBe(1); // file

    let mockFile = { name: 'foo.exe', size: 11 * 1024 * 1024 };
    let selectedFile = mockFile as File;
    let fileList = {
      item: (index: number) => [selectedFile][index] ?? null
    } as unknown as FileList;
    tester.editDocumentComponent.fileChanged(fileList);
    await tester.stable();

    expect(tester.testElement).toContainText(`Le fichier doit avoir l'une des extensions suivantes\u00a0: .pdf, .txt, .eml, .pst, .ost`);
    expect(tester.errors.length).toBe(1); // file invalid

    mockFile = { ...mockFile, name: 'foo.pdf' };
    selectedFile = mockFile as File;
    fileList = {
      item: (index: number) => [selectedFile][index] ?? null
    } as unknown as FileList;

    tester.editDocumentComponent.fileChanged(fileList);
    await tester.stable();

    expect(tester.testElement).toContainText('Le fichier est trop volumineux. Il ne doit pas dépasser 10\u00a0MB');
    expect(tester.errors.length).toBe(1); // file size invalid
  });

  it('should disable everything and display progress bar when uploading', async () => {
    tester.componentInstance.progress.set(0.1);
    await tester.stable();

    [tester.type, tester.description, tester.file, tester.onDeliveryForm, tester.saveButton].forEach(e => expect(e.disabled).toBe(true));

    expect(tester.progressBar).not.toBeNull();
    expect(tester.progressBar.getPercentValue()).toBe(10);
    expect(tester.progressBar.animated).toBe(false);
    expect(tester.progressBar.striped).toBe(false);

    tester.componentInstance.progress.set(1);
    await tester.stable();

    expect(tester.progressBar.getPercentValue()).toBe(100);
    expect(tester.progressBar.animated).toBe(true);
    expect(tester.progressBar.striped).toBe(true);

    tester.componentInstance.progress.set(null);
    await tester.stable();

    [tester.type, tester.description, tester.file, tester.saveButton].forEach(e => expect(e.disabled).toBe(false));
  });

  it('should save', async () => {
    await tester.type.selectLabel('Autre');
    await tester.description.fillWith('desc');
    await tester.onDeliveryForm.check();

    const selectedFile = { name: 'foo.txt', size: 100 } as File;
    const fileList = {
      item: (index: number) => [selectedFile][index] ?? null
    } as unknown as FileList;
    tester.editDocumentComponent.fileChanged(fileList);
    await tester.stable();

    await tester.saveButton.click();
    const expectedCommand: DocumentCommand = {
      file: selectedFile,
      document: {
        type: 'OTHER',
        description: 'desc',
        onDeliveryForm: true
      }
    };
    expect(tester.componentInstance.saved()).toEqual(expectedCommand);
  });

  it('should cancel', async () => {
    await tester.cancelButton.click();
    expect(tester.componentInstance.cancelled()).toBe(true);
  });

  it('should drag and drop file on input', async () => {
    await tester.file.dispatchEvent(new DragEvent('dragenter'));
    expect(tester.file).toHaveClass('highlighted');

    await tester.file.dispatchEvent(new DragEvent('dragexit'));
    expect(tester.file).not.toHaveClass('highlighted');

    await tester.file.dispatchEvent(new DragEvent('dragenter'));
    expect(tester.file).toHaveClass('highlighted');

    await tester.file.dispatchEvent(new DragEvent('dragleave'));
    expect(tester.file).not.toHaveClass('highlighted');

    // quite hard to test drop event
  });

  it('should change on delivery form value depending on document type unless dirty', async () => {
    await tester.type.selectValue('MTA');
    expect(tester.onDeliveryForm).toBeChecked();

    await tester.type.selectLabel('Courriel');
    expect(tester.onDeliveryForm).not.toBeChecked();

    await tester.onDeliveryForm.check();
    await tester.onDeliveryForm.uncheck();

    await tester.type.selectValue('MTA');
    expect(tester.onDeliveryForm).not.toBeChecked();
  });
});
