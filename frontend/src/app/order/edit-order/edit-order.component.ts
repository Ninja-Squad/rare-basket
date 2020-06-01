import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { Order, OrderCommand } from '../order.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export interface FormValue {
  items: Array<{
    name: string;
    identifier: string;
    quantity: number | null;
    unit: string | null;
  }>;
}

@Component({
  selector: 'rb-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.scss']
})
export class EditOrderComponent implements OnInit, AfterViewInit {
  @Input()
  order: Order;

  @Output()
  readonly saved = new EventEmitter<OrderCommand>();

  @Output()
  readonly cancelled = new EventEmitter<void>();

  @ViewChildren('name')
  nameInputs: QueryList<ElementRef<HTMLInputElement>>;

  form: FormGroup;

  deleteIcon = faTrash;
  addItemIcon = faPlus;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      items: this.fb.array(
        this.order.items.map(orderItem =>
          this.createItemGroup(orderItem.accession.name, orderItem.accession.identifier, orderItem.quantity, orderItem.unit)
        )
      )
    });

    // add item right away if there is none
    if (this.order.items.length === 0) {
      this.addItem();
    }
  }

  ngAfterViewInit(): void {
    this.nameInputs.first?.nativeElement?.focus();
  }

  get itemGroups(): FormArray {
    return this.form.get('items') as FormArray;
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const command: OrderCommand = {
      items: (this.form.value as FormValue).items.map(item => ({
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

  private createItemGroup(name: string, identifier: string, quantity: number | null, unit: string | null): FormGroup {
    return this.fb.group({
      name: [name, Validators.required],
      identifier: [identifier, Validators.required],
      quantity: [quantity, Validators.min(1)],
      unit
    });
  }
}
