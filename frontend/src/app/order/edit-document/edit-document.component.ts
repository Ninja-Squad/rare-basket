import {
  Component,
  ElementRef,
  inject,
  output,
  input,
  effect,
  computed,
  signal,
  ChangeDetectionStrategy,
  viewChild,
  afterNextRender
} from '@angular/core';
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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ValidationErrorsComponent,
    FormControlValidationDirective,
    NgbProgressbar,
    FaIconComponent,
    DecimalPipe,
    DocumentTypeEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDocumentComponent {
  form = inject(NonNullableFormBuilder).group({
    type: [null as DocumentType | null, Validators.required],
    description: '',
    onDeliveryForm: false
  });

  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly order = input.required<DetailedOrder>();
  readonly uploadProgress = input.required<number | null>();

  readonly cancelled = output<void>();
  readonly saved = output<DocumentCommand>();
  readonly maxFileSizeInMB = maxFileSize / (1024 * 1024);
  readonly fileAccept = validExtensions.join(',');
  readonly acceptedExtensions = validExtensions.join(', ');
  readonly selectedFile = signal<File | null>(null);

  readonly highlightFileInput = signal(false);
  readonly documentTypes = computed(() =>
    ALL_DOCUMENT_TYPES.filter(
      documentType => !isDocumentTypeUnique(documentType) || !this.order().documents.some(doc => doc.type === documentType)
    )
  );
  readonly saveIcon = faFileUpload;

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

    effect(() => {
      if (this.uploadProgress() !== null) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });

    afterNextRender(() => {
      this.fileInput().nativeElement.files?.item(0);
    });
  }

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
    return !this.selectedFile || !this.selectedFileValid() || !this.selectedFileSizeValid();
  }

  save() {
    if (!this.form.valid || this.hasFileError()) {
      return;
    }

    const document = this.form.value;
    const command: DocumentCommand = {
      file: this.selectedFile()!,
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
