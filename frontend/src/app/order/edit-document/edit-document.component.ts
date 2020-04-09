import { Component, ElementRef, EventEmitter, Inject, Input, LOCALE_ID, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ALL_DOCUMENT_TYPES, DocumentCommand, DocumentType } from '../order.model';
import { faFileUpload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rb-edit-document',
  templateUrl: './edit-document.component.html',
  styleUrls: ['./edit-document.component.scss']
})
export class EditDocumentComponent implements OnChanges {
  form: FormGroup;

  documentTypes = ALL_DOCUMENT_TYPES;

  @ViewChild('fileInput')
  fileInput: ElementRef<HTMLInputElement>;

  @Input()
  uploadProgress: number;

  @Output()
  readonly cancelled = new EventEmitter<void>();

  @Output()
  readonly saved = new EventEmitter<DocumentCommand>();

  highlightFileInput = false;

  saveIcon = faFileUpload;

  constructor(fb: FormBuilder, @Inject(LOCALE_ID) public locale: string) {
    const typeControl = fb.control(null, Validators.required);
    const descriptionControl = fb.control('');
    this.form = fb.group({
      type: typeControl,
      description: descriptionControl
    });

    typeControl.valueChanges.subscribe((newType: DocumentType) => {
      descriptionControl.setValidators(newType === 'OTHER' ? Validators.required : []);
      descriptionControl.updateValueAndValidity();
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

  save() {
    if (this.form.invalid || !this.selectedFile) {
      return;
    }

    const document = this.form.value;
    const command = { file: this.selectedFile, document };
    this.saved.emit(command);
  }

  cancel() {
    this.cancelled.emit(undefined);
  }

  get selectedFile(): File | null {
    return this.fileInput?.nativeElement?.files?.item(0) ?? null;
  }
}
