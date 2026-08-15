import { Component, inject, output, input, DestroyRef, ChangeDetectionStrategy, linkedSignal, afterNextRender } from '@angular/core';
import { Order, OrderCommand, OrderItemCommand } from '../order.model';
import { applyEach, form, FormField, FormRoot, min, required } from '@angular/forms/signals';
import { faFileCsv, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ModalService } from '../../rb-ngb/modal.service';
import { CsvModalComponent } from '../csv-modal/csv-modal.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Accession } from '../../basket/basket.model';

interface ItemFormValue {
  name: string;
  identifier: string | null;
  // Signal-form text fields are string-valued: nullable API values are represented as `''` in the form model.
  accessionNumber: string;
  // Signal-form text fields are string-valued: nullable API values are represented as `''` in the form model.
  taxon: string;
  url: string | null;
  quantity: number | null;
  // Signal-form text fields are string-valued: nullable API values are represented as `''` in the form model.
  unit: string;
}

@Component({
  selector: 'rb-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrl: './edit-order.component.scss',
  imports: [FormRoot, FormField, TranslateDirective, TranslatePipe, ValidationSignalErrorsComponent, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditOrderComponent {
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly order = input.required<Order>();

  readonly saved = output<OrderCommand>();
  readonly cancelled = output<void>();

  readonly formValue = linkedSignal(() => {
    const items = this.order().items.map(orderItem => this.createItemValue(orderItem.accession, orderItem.quantity, orderItem.unit));
    return {
      items: items.length > 0 ? items : [this.createBlankItemValue()]
    };
  });
  readonly form = form(
    this.formValue,
    f => {
      applyEach(f.items, item => {
        required(item.name);
        required(item.taxon);
        min(item.quantity, 1);
      });
    },
    {
      submission: {
        action: async () => {
          await this.save();
          return undefined;
        }
      }
    }
  );

  readonly deleteIcon = faTrash;
  readonly addItemIcon = faPlus;
  readonly csvIcon = faFileCsv;

  constructor() {
    afterNextRender(() => this.form.items[0]?.name().focusBoundControl());
  }

  async save(): Promise<void> {
    const command: OrderCommand = {
      items: this.formValue().items.map(item => ({
        accession: {
          name: item.name,
          identifier: item.identifier,
          accessionNumber: item.accessionNumber || null,
          taxon: item.taxon,
          url: item.url
        },
        quantity: item.quantity,
        unit: item.unit || null
      }))
    };

    this.saved.emit(command);
  }

  addItem() {
    this.formValue.update(value => ({
      items: [...value.items, this.createBlankItemValue()]
    }));
  }

  delete(index: number) {
    this.formValue.update(value => ({
      items: value.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  cancel() {
    this.cancelled.emit(undefined);
  }

  private createBlankItemValue() {
    return this.createItemValue(
      {
        name: '',
        identifier: null,
        accessionNumber: '',
        taxon: '',
        url: null
      },
      null,
      null
    );
  }

  private createItemValue(accession: Accession, quantity: number | null, unit: string | null): ItemFormValue {
    return {
      name: accession.name,
      identifier: accession.identifier,
      accessionNumber: accession.accessionNumber ?? '',
      taxon: accession.taxon ?? '',
      url: accession.url,
      quantity,
      unit: unit ?? ''
    };
  }

  openCsvModal() {
    this.modalService
      .open(CsvModalComponent, { size: 'lg' })
      .result.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items: Array<OrderItemCommand>) => {
        // if the last item is blank, remove it. This happens, for example, when we create an order
        // from scratch, and immediately open this component with an empty order item
        const currentItems = this.formValue().items;
        if (currentItems.length > 0) {
          const lastIndex = currentItems.length - 1;
          const lastItemValue = currentItems[lastIndex];
          if (this.isBlank(lastItemValue)) {
            this.delete(lastIndex);
          }
        }
        this.formValue.update(value => ({
          items: [...value.items, ...items.map(item => this.createItemValue(item.accession, item.quantity, item.unit))]
        }));
      });
  }

  private isBlank(value: ItemFormValue) {
    return !value.name?.trim() && !value.accessionNumber?.trim() && !value.taxon?.trim() && value.quantity == null && !value.unit?.trim();
  }
}
