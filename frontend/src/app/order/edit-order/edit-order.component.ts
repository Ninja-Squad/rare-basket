import {
  Component,
  ElementRef,
  inject,
  OnInit,
  output,
  input,
  DestroyRef,
  ChangeDetectionStrategy,
  signal,
  viewChildren,
  afterNextRender,
  ChangeDetectorRef
} from '@angular/core';
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
  accessionNumber: string;
  taxon: string;
  url: string | null;
  quantity: number | null;
  unit: string;
}

@Component({
  selector: 'rb-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrl: './edit-order.component.scss',
  imports: [FormRoot, FormField, TranslateDirective, TranslatePipe, ValidationSignalErrorsComponent, FaIconComponent],
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

  readonly formValue = signal({
    items: [] as Array<ItemFormValue>
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
    afterNextRender(() => this.nameInputs().at(0)?.nativeElement?.focus());
  }

  ngOnInit() {
    const items = this.order().items.map(orderItem => this.createItemValue(orderItem.accession, orderItem.quantity, orderItem.unit));

    // add item right away if there is none
    if (this.order().items.length === 0) {
      items.push(this.createBlankItemValue());
    }

    this.formValue.set({ items });
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
        // this shouldn't be necessary, but it is actually
        this.cdRef.markForCheck();
      });
  }

  private isBlank(value: ItemFormValue) {
    return !value.name?.trim() && !value.accessionNumber?.trim() && !value.taxon?.trim() && value.quantity == null && !value.unit?.trim();
  }
}
