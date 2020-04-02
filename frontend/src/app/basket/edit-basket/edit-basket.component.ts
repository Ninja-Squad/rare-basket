import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Accession, ALL_CUSTOMER_TYPES, Basket, BasketCommand, CustomerType } from '../basket.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService } from '../../shared/confirmation.service';

interface FormValue {
  customer: {
    name: string;
    email: string;
    address: string;
    type: CustomerType;
  };
  rationale: string;
  items: Array<{
    accession: Accession;
    quantity: number;
  }>;
}

@Component({
  selector: 'rb-edit-basket',
  templateUrl: './edit-basket.component.html',
  styleUrls: ['./edit-basket.component.scss']
})
export class EditBasketComponent implements OnInit {
  @Input() basket: Basket;

  @Output() readonly basketSaved = new EventEmitter<BasketCommand>();

  customerTypes = ALL_CUSTOMER_TYPES;
  form: FormGroup;

  deleteIcon = faTrash;
  saveIcon = faCheck;

  quantityDisplayed = false;

  constructor(private fb: FormBuilder, private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    const customer = this.basket.customer;
    this.form = this.fb.group({
      customer: this.fb.group({
        name: [customer?.name ?? null, Validators.required],
        email: [customer?.email ?? null, [Validators.required, Validators.email]],
        address: [customer?.address ?? null, Validators.required],
        type: [customer?.type ?? null, Validators.required]
      }),
      rationale: [this.basket.rationale],
      items: this.fb.array(
        this.basket.items.map(item =>
          this.fb.group({
            accession: item.accession,
            quantity: item.quantity
          })
        )
      )
    });
    this.quantityDisplayed = this.shouldDisplayQuantity();
  }

  deleteItemAt(index: number) {
    this.confirmationService
      .confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' })
      .subscribe(() => {
        this.items.removeAt(index);
        this.quantityDisplayed = this.shouldDisplayQuantity();
      });
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const command: BasketCommand = { ...(this.form.value as FormValue), complete: true };
    this.basketSaved.emit(command);
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  private shouldDisplayQuantity(): boolean {
    return (this.form.value as FormValue).items.some(item => item.quantity);
  }
}
