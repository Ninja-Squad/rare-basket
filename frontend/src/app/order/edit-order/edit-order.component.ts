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
  afterNextRender
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

interface ItemFormValue {
  name: string;
  identifier: string;
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
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  readonly order = input.required<Order>();

  readonly saved = output<OrderCommand>();
  readonly cancelled = output<void>();

  readonly nameInputs = viewChildren<ElementRef<HTMLInputElement>>('name');

  private fb = inject(NonNullableFormBuilder);
  readonly itemGroups = this.fb.array<
    FormGroup<{
      name: FormControl<string>;
      identifier: FormControl<string>;
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
      this.itemGroups.push(
        this.createItemGroup(orderItem.accession.name, orderItem.accession.identifier, orderItem.quantity, orderItem.unit)
      )
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
          identifier: item.identifier
        },
        quantity: item.quantity,
        unit: item.unit
      }))
    };

    this.saved.emit(command);
  }

  addItem() {
    this.itemGroups.push(this.createItemGroup('', '', null, null));
  }

  delete(index: number) {
    this.itemGroups.removeAt(index);
  }

  cancel() {
    this.cancelled.emit(undefined);
  }

  private createItemGroup(name: string, identifier: string, quantity: number | null, unit: string | null) {
    return this.fb.group({
      name: [name, Validators.required],
      identifier: [identifier, Validators.required],
      quantity: [quantity, Validators.min(1)],
      unit
    });
  }

  openCsvModal() {
    this.modalService
      .open(CsvModalComponent)
      .result.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items: Array<OrderItemCommand>) => {
        // if the last item is blank, remove it. This happens, for example, when we create an order
        // from scratch, and immediately open this component with an empty order item
        if (this.itemGroups.length > 0) {
          const lastIndex = this.itemGroups.length - 1;
          const lastItemValue = this.itemGroups.controls[lastIndex].value;
          if (this.isBlank(lastItemValue)) {
            this.delete(lastIndex);
          }
        }
        items.forEach(item => {
          this.itemGroups.push(this.createItemGroup(item.accession.name, item.accession.identifier, item.quantity, item.unit));
        });
      });
  }

  private isBlank(value: Partial<ItemFormValue>) {
    return !value.name?.trim() && !value.identifier?.trim() && !value.quantity && !value.unit?.trim();
  }
}
