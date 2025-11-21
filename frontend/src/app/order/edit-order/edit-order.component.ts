import {
  Component,
  ElementRef,
  inject,
  OnInit,
  output,
  input,
  DestroyRef,
  ChangeDetectionStrategy,
  viewChildren,
  afterNextRender,
  ChangeDetectorRef
} from '@angular/core';
import { Order, OrderCommand, OrderItemCommand } from '../order.model';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { faFileCsv, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ModalService } from '../../rb-ngb/modal.service';
import { CsvModalComponent } from '../csv-modal/csv-modal.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Accession } from '../../basket/basket.model';

interface ItemFormValue {
  name: string;
  identifier: string | null;
  accessionNumber: string | null;
  taxon: string | null;
  url: string | null;
  quantity: number | null;
  unit: string | null;
}

@Component({
  selector: 'rb-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrl: './edit-order.component.scss',
  imports: [ReactiveFormsModule, TranslateModule, FormControlValidationDirective, ValidationErrorsComponent, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditOrderComponent implements OnInit {
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdRef = inject(ChangeDetectorRef);

  readonly order = input.required<Order>();

  readonly saved = output<OrderCommand>();
  readonly cancelled = output<void>();

  readonly nameInputs = viewChildren<ElementRef<HTMLInputElement>>('name');

  private readonly fb = inject(NonNullableFormBuilder);
  readonly itemGroups = this.fb.array<
    FormGroup<{
      name: FormControl<string>;
      identifier: FormControl<string | null>;
      accessionNumber: FormControl<string | null>;
      taxon: FormControl<string | null>;
      url: FormControl<string | null>;
      quantity: FormControl<number | null>;
      unit: FormControl<string | null>;
    }>
  >([]);

  readonly form = this.fb.group({
    items: this.itemGroups
  });

  readonly deleteIcon = faTrash;
  readonly addItemIcon = faPlus;
  readonly csvIcon = faFileCsv;

  constructor() {
    afterNextRender(() => this.nameInputs().at(0)?.nativeElement?.focus());
  }

  ngOnInit() {
    this.order().items.forEach(orderItem =>
      this.itemGroups.push(this.createItemGroup(orderItem.accession, orderItem.quantity, orderItem.unit))
    );

    // add item right away if there is none
    if (this.order().items.length === 0) {
      this.addItem();
    }
  }

  save() {
    if (!this.form.valid) {
      return;
    }

    const command: OrderCommand = {
      items: this.form.getRawValue().items.map(item => ({
        accession: {
          name: item.name,
          identifier: item.identifier,
          accessionNumber: item.accessionNumber || null,
          taxon: item.taxon,
          url: item.url
        },
        quantity: item.quantity,
        unit: item.unit
      }))
    };

    this.saved.emit(command);
  }

  addItem() {
    this.itemGroups.push(
      this.createItemGroup(
        {
          name: '',
          identifier: null,
          accessionNumber: '',
          taxon: '',
          url: null
        },
        null,
        null
      )
    );
  }

  delete(index: number) {
    this.itemGroups.removeAt(index);
  }

  cancel() {
    this.cancelled.emit(undefined);
  }

  private createItemGroup(accession: Accession, quantity: number | null, unit: string | null) {
    return this.fb.group({
      name: [accession.name, Validators.required],
      identifier: [accession.identifier],
      accessionNumber: [accession.accessionNumber],
      taxon: [accession.taxon, Validators.required],
      url: [accession.url],
      quantity: [quantity, Validators.min(1)],
      unit
    });
  }

  openCsvModal() {
    this.modalService
      .open(CsvModalComponent, { size: 'lg' })
      .result.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items: Array<OrderItemCommand>) => {
        // if the last item is blank, remove it. This happens, for example, when we create an order
        // from scratch, and immediately open this component with an empty order item
        if (this.itemGroups.length > 0) {
          const lastIndex = this.itemGroups.length - 1;
          const lastItemValue = this.itemGroups.controls[lastIndex].getRawValue();
          if (this.isBlank(lastItemValue)) {
            this.delete(lastIndex);
          }
        }
        items.forEach(item => {
          this.itemGroups.push(this.createItemGroup(item.accession, item.quantity, item.unit));
        });
        // this shouldn't be necessary, but it is actually
        this.cdRef.markForCheck();
      });
  }

  private isBlank(value: ItemFormValue) {
    return !value.name?.trim() && !value.accessionNumber?.trim() && !value.taxon?.trim() && value.quantity == null && !value.unit?.trim();
  }
}
