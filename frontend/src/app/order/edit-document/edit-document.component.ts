import { Component, ElementRef, output, input, computed, signal, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { disabled, form, FormField, FormRoot, required } from '@angular/forms/signals';
import {
  ALL_DOCUMENT_TYPES,
  DetailedOrder,
  DocumentCommand,
  DocumentType,
  isDocumentTypeUnique,
  ON_DELIVERY_FORM_BY_DEFAULT_DOCUMENT_TYPES
} from '../order.model';
import { faFileUpload } from '@fortawesome/free-solid-svg-icons';
import { DocumentTypeEnumPipe } from '../document-type-enum.pipe';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import { ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { DecimalPipe } from '@angular/common';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

const validExtensions = ['.pdf', '.txt', '.eml', '.pst', '.ost'];
const maxFileSize = 10 * 1024 * 1024; // 10 MB

@Component({
  selector: 'rb-edit-document',
  templateUrl: './edit-document.component.html',
  styleUrl: './edit-document.component.scss',
  imports: [
    FormRoot,
    FormField,
    TranslateDirective,
    TranslatePipe,
    ValidationSignalErrorsComponent,
    NgbProgressbar,
    FaIconComponent,
    DecimalPipe,
    DocumentTypeEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDocumentComponent {
  readonly formValue = signal({
    type: '' as DocumentType | '',
    description: '',
    onDeliveryForm: false
  });
  readonly form = form(
    this.formValue,
    f => {
      required(f.type);
      required(f.description, { when: ({ valueOf }) => valueOf(f.type) === 'OTHER' });
      disabled(f, { when: () => this.uploadProgress() !== null });
    },
    {
      submission: {
        action: async () => {
          await this.save();
          return undefined;
        },
        onInvalid: () => this.submitted.set(true)
      }
    }
  );

  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly order = input.required<DetailedOrder>();
  readonly uploadProgress = input.required<number | null>();

  readonly cancelled = output<void>();
  readonly saved = output<DocumentCommand>();
  readonly maxFileSizeInMB = maxFileSize / (1024 * 1024);
  readonly fileAccept = validExtensions.join(',');
  readonly acceptedExtensions = validExtensions.join(', ');
  readonly selectedFile = signal<File | null>(null);
  readonly submitted = signal(false);

  readonly highlightFileInput = signal(false);
  readonly documentTypes = computed(() =>
    ALL_DOCUMENT_TYPES.filter(
      documentType => !isDocumentTypeUnique(documentType) || !this.order().documents.some(doc => doc.type === documentType)
    )
  );
  readonly saveIcon = faFileUpload;

  fileDropped(event: DragEvent) {
    event.preventDefault();
    if (this.uploadProgress()) {
      return;
    }
    this.fileInput().nativeElement.files = event.dataTransfer!.files;
    this.fileChanged(this.fileInput().nativeElement.files);
  }

  fileChanged(files: FileList | null) {
    this.selectedFile.set(files?.item(0) ?? null);
  }

  hasFileError() {
    return !this.selectedFile() || !this.selectedFileValid() || !this.selectedFileSizeValid();
  }

  async save(): Promise<void> {
    this.submitted.set(true);
    if (this.hasFileError()) {
      return;
    }

    const document = this.formValue();
    const command: DocumentCommand = {
      file: this.selectedFile()!,
      document: {
        type: document.type as DocumentType,
        description: document.description,
        onDeliveryForm: document.onDeliveryForm
      }
    };
    this.saved.emit(command);
  }

  documentTypeChanged() {
    const newType = this.form.type().value();

    // only change the on delivery form value if the user hasn't played with the control yet
    if (!this.form.onDeliveryForm().dirty()) {
      this.formValue.update(value => ({
        ...value,
        onDeliveryForm: ON_DELIVERY_FORM_BY_DEFAULT_DOCUMENT_TYPES.includes(newType as DocumentType)
      }));
    }
  }

  cancel() {
    this.cancelled.emit(undefined);
  }

  selectedFileValid() {
    const selectedFile = this.selectedFile();
    if (!selectedFile) {
      return true;
    }

    const lowercaseName = selectedFile.name.toLowerCase();
    return validExtensions.some(extension => lowercaseName.endsWith(extension));
  }

  selectedFileSizeValid() {
    const selectedFile = this.selectedFile();
    if (!selectedFile) {
      return true;
    }

    return selectedFile.size <= maxFileSize;
  }
}
