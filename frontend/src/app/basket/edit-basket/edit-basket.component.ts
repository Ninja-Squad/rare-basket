import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ALL_CUSTOMER_TYPES, Basket, BasketCommand } from '../basket.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faCheck, faSeedling, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService } from '../../shared/confirmation.service';

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
  seedIcon = faSeedling;
  saveIcon = faCheck;

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
            quantity: [item.quantity, [Validators.required, Validators.min(1)]]
          })
        )
      )
    });
  }

  deleteItemAt(index: number) {
    this.confirmationService
      .confirm({ message: 'Voulez-vous vraiment supprimer cette accession de votre commande\u00a0?' })
      .subscribe(() => this.items.removeAt(index));
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const command: BasketCommand = { ...this.form.value, complete: true };
    this.basketSaved.emit(command);
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }
}
