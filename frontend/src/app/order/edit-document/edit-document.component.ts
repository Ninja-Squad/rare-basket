import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { ValidationErrorsComponent } from 'ngx-valdemort';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

const validExtensions = ['.pdf', '.txt', '.eml', '.pst', '.ost'];
const maxFileSize = 10 * 1024 * 1024; // 10 MB

@Component({
  selector: 'rb-edit-document',
  templateUrl: './edit-document.component.html',
  styleUrl: './edit-document.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ValidationErrorsComponent,
    FormControlValidationDirective,
    NgbProgressbar,
    FontAwesomeModule,
    DecimalPipe,
    DocumentTypeEnumPipe
  ]
})
export class EditDocumentComponent implements OnChanges {
  form = inject(NonNullableFormBuilder).group({
    type: [null as DocumentType | null, Validators.required],
    description: '',
    onDeliveryForm: false
  });

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input({ required: true }) order!: DetailedOrder;

  @Input({ required: true }) uploadProgress: number | null = null;

  @Output() readonly cancelled = new EventEmitter<void>();

  @Output() readonly saved = new EventEmitter<DocumentCommand>();

  highlightFileInput = false;
  documentTypes: Array<DocumentType> | null = null;
  saveIcon = faFileUpload;

  constructor() {
    const descriptionControl = this.form.controls.description;
    const onDeliveryFormControl = this.form.controls.onDeliveryForm;
    this.form.controls.type.valueChanges.subscribe((newType: DocumentType | null) => {
      descriptionControl.setValidators(newType === 'OTHER' ? Validators.required : []);
      descriptionControl.updateValueAndValidity();

      // only change the on delivery form value if the user hasn't played with the control yet
      if (!onDeliveryFormControl.dirty) {
        onDeliveryFormControl.setValue(ON_DELIVERY_FORM_BY_DEFAULT_DOCUMENT_TYPES.includes(newType!));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.uploadProgress) {
      if (this.uploadProgress !== null) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }

    if (changes.order) {
      this.documentTypes = ALL_DOCUMENT_TYPES.filter(
        documentType => !isDocumentTypeUnique(documentType) || !this.order.documents.some(doc => doc.type === documentType)
      );
    }
  }

  fileDropped(event: DragEvent) {
    event.preventDefault();
    if (this.uploadProgress) {
      return;
    }
    this.fileInput.nativeElement.files = event.dataTransfer!.files;
  }

  fileChanged() {
    // do nothing: the event is just there to trick Angular into detecting changes
  }

  hasFileError() {
    return !this.selectedFile || !this.selectedFileValid() || !this.selectedFileSizeValid();
  }

  save() {
    if (this.form.invalid || this.hasFileError()) {
      return;
    }

    const document = this.form.value;
    const command: DocumentCommand = {
      file: this.selectedFile!,
      document: {
        type: document.type!,
        description: document.description!,
        onDeliveryForm: document.onDeliveryForm!
      }
    };
    this.saved.emit(command);
  }

  cancel() {
    this.cancelled.emit(undefined);
  }

  selectedFileValid() {
    if (!this.selectedFile) {
      return true;
    }

    const lowercaseName = this.selectedFile.name.toLowerCase();
    return validExtensions.some(extension => lowercaseName.endsWith(extension));
  }

  selectedFileSizeValid() {
    if (!this.selectedFile) {
      return true;
    }

    return this.selectedFile.size <= maxFileSize;
  }

  get maxFileSizeInMB() {
    return maxFileSize / (1024 * 1024);
  }

  get fileAccept() {
    return validExtensions.join(',');
  }

  get acceptedExtensions() {
    return validExtensions.join(', ');
  }

  get selectedFile(): File | null {
    return this.fileInput?.nativeElement?.files?.item(0) ?? null;
  }
}
