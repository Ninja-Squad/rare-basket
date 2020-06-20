import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ALL_DOCUMENT_TYPES,
  DetailedOrder,
  DocumentCommand,
  DocumentType,
  isDocumentTypeUnique,
  ON_DELIVERY_FORM_BY_DEFAULT_DOCUMENT_TYPES
} from '../order.model';
import { faFileUpload } from '@fortawesome/free-solid-svg-icons';

const validExtensions = ['.pdf', '.txt', '.eml', '.pst', '.ost'];
const maxFileSize = 10 * 1024 * 1024; // 10 MB

@Component({
  selector: 'rb-edit-document',
  templateUrl: './edit-document.component.html',
  styleUrls: ['./edit-document.component.scss']
})
export class EditDocumentComponent implements OnChanges {
  form: FormGroup;

  @ViewChild('fileInput')
  fileInput: ElementRef<HTMLInputElement>;

  @Input()
  order: DetailedOrder;

  @Input()
  uploadProgress: number;

  @Output()
  readonly cancelled = new EventEmitter<void>();

  @Output()
  readonly saved = new EventEmitter<DocumentCommand>();

  highlightFileInput = false;
  documentTypes: Array<DocumentType>;
  saveIcon = faFileUpload;

  constructor(fb: FormBuilder) {
    const typeControl = fb.control(null, Validators.required);
    const descriptionControl = fb.control('');
    const onDeliveryFormControl = fb.control(false);

    this.form = fb.group({
      type: typeControl,
      description: descriptionControl,
      onDeliveryForm: onDeliveryFormControl
    });

    typeControl.valueChanges.subscribe((newType: DocumentType) => {
      descriptionControl.setValidators(newType === 'OTHER' ? Validators.required : []);
      descriptionControl.updateValueAndValidity();

      // only change the on delivery form value if the user hasn't played with the control yet
      if (!onDeliveryFormControl.dirty) {
        onDeliveryFormControl.setValue(ON_DELIVERY_FORM_BY_DEFAULT_DOCUMENT_TYPES.includes(newType));
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
    this.fileInput.nativeElement.files = event.dataTransfer.files;
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
    const command = { file: this.selectedFile, document };
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
