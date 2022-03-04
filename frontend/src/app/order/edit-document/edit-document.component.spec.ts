import { TestBed } from '@angular/core/testing';

import { EditDocumentComponent } from './edit-document.component';
import { Component } from '@angular/core';
import { ALL_DOCUMENT_TYPES, DetailedOrder, Document, DocumentCommand } from '../order.model';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { DocumentTypeEnumPipe } from '../document-type-enum.pipe';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RbNgbTestingModule } from '../../rb-ngb/rb-ngb-testing.module';

@Component({
  template:
    '<rb-edit-document [order]="order" [uploadProgress]="progress" (saved)="saved = $event" (cancelled)="cancelled = true"></rb-edit-document>'
})
class TestComponent {
  order = {
    documents: []
  } as DetailedOrder;
  progress: number | null = null;
  cancelled = false;
  saved: DocumentCommand = null;
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

  get customFileInput() {
    return this.element('.custom-file');
  }
}

describe('EditDocumentComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule, FontAwesomeModule, ReactiveFormsModule, RbNgbTestingModule, ValdemortModule],
      declarations: [TestComponent, EditDocumentComponent, DocumentTypeEnumPipe, ValidationDefaultsComponent]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    jasmine.addMatchers(speculoosMatchers);
    tester = new TestComponentTester();
    tester.detectChanges();
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

  it('should filter out unique document types if they are present in the order', () => {
    expect(tester.type.optionLabels.length).toBe(ALL_DOCUMENT_TYPES.length + 1);
    expect(tester.type.optionLabels).toContain('Facture');

    tester.componentInstance.order = {
      ...tester.componentInstance.order,
      documents: [
        {
          type: 'INVOICE'
        } as Document
      ]
    };
    tester.detectChanges();

    expect(tester.type.optionLabels.length).toBe(ALL_DOCUMENT_TYPES.length);
    expect(tester.type.optionLabels).not.toContain('Facture');
  });

  it('should validate', () => {
    tester.saveButton.click();

    expect(tester.componentInstance.saved).toBeNull();
    expect(tester.errors.length).toBe(2); // type, file

    tester.type.selectLabel('Autre');
    expect(tester.errors.length).toBe(2); // description, file

    tester.type.selectLabel('Facture');
    expect(tester.errors.length).toBe(1); // file

    const mockFile = { name: 'foo.exe', size: 11 * 1024 * 1024 };
    const selectedFile = mockFile as File;
    spyOnProperty(tester.editDocumentComponent, 'selectedFile', 'get').and.returnValue(selectedFile);
    tester.detectChanges();

    expect(tester.testElement).toContainText(`Le fichier doit avoir l'une des extensions suivantes\u00a0: .pdf, .txt, .eml, .pst, .ost`);
    expect(tester.errors.length).toBe(1); // file invalid

    mockFile.name = 'foo.pdf';
    tester.detectChanges();

    expect(tester.testElement).toContainText('Le fichier est trop volumineux. Il ne doit pas dépasser 10\u00a0MB');
    expect(tester.errors.length).toBe(1); // file size invalid
  });

  it('should disable everything and display progress bar when uploading', () => {
    tester.componentInstance.progress = 0.1;
    tester.detectChanges();

    [tester.type, tester.description, tester.file, tester.onDeliveryForm, tester.saveButton].forEach(e => expect(e.disabled).toBe(true));

    expect(tester.progressBar).not.toBeNull();
    expect(tester.progressBar.getPercentValue()).toBe(10);
    expect(tester.progressBar.animated).toBe(false);
    expect(tester.progressBar.striped).toBe(false);

    tester.componentInstance.progress = 1;
    tester.detectChanges();

    expect(tester.progressBar.getPercentValue()).toBe(100);
    expect(tester.progressBar.animated).toBe(true);
    expect(tester.progressBar.striped).toBe(true);

    tester.componentInstance.progress = null;
    tester.detectChanges();

    [tester.type, tester.description, tester.file, tester.saveButton].forEach(e => expect(e.disabled).toBe(false));
  });

  it('should save', () => {
    tester.type.selectLabel('Autre');
    tester.description.fillWith('desc');
    tester.onDeliveryForm.check();

    const selectedFile = { name: 'foo.txt', size: 100 } as File;
    spyOnProperty(tester.editDocumentComponent, 'selectedFile', 'get').and.returnValue(selectedFile);

    tester.saveButton.click();
    const expectedCommand: DocumentCommand = {
      file: selectedFile,
      document: {
        type: 'OTHER',
        description: 'desc',
        onDeliveryForm: true
      }
    };
    expect(tester.componentInstance.saved).toEqual(expectedCommand);
  });

  it('should cancel', () => {
    tester.cancelButton.click();
    expect(tester.componentInstance.cancelled).toBe(true);
  });

  it('should display label based on selected file', () => {
    expect(tester.customFileInput).toContainText('Choisissez ou déposez un fichier');

    const selectedFile = { name: 'foo.txt' } as File;
    spyOnProperty(tester.editDocumentComponent, 'selectedFile', 'get').and.returnValue(selectedFile);

    tester.detectChanges();

    expect(tester.customFileInput).toContainText('foo.txt');
  });

  it('should drag and drop file on input', () => {
    const fileLabel = tester.customFileInput.element('label');

    tester.customFileInput.dispatchEvent(new DragEvent('dragenter'));
    expect(fileLabel).toHaveClass('highlighted');

    tester.customFileInput.dispatchEvent(new DragEvent('dragexit'));
    expect(fileLabel).not.toHaveClass('highlighted');

    tester.customFileInput.dispatchEvent(new DragEvent('dragenter'));
    expect(fileLabel).toHaveClass('highlighted');

    tester.customFileInput.dispatchEvent(new DragEvent('dragleave'));
    expect(fileLabel).not.toHaveClass('highlighted');

    // quite hard to test drop event
  });

  it('should change on delivery form value depending on document type unless dirty', () => {
    tester.type.selectValue('MTA');
    expect(tester.onDeliveryForm).toBeChecked();

    tester.type.selectLabel('Courriel');
    expect(tester.onDeliveryForm).not.toBeChecked();

    tester.onDeliveryForm.check();
    tester.onDeliveryForm.uncheck();

    tester.type.selectValue('MTA');
    expect(tester.onDeliveryForm).not.toBeChecked();
  });
});
