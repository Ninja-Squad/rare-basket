import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { NgbDatepicker, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { ComponentTester } from 'ngx-speculoos';
import { DatepickerContainerComponent } from './datepicker-container.component';
import { provideI18nTesting } from '../i18n/mock-18n.spec';
import { provideNgbDatepickerServices } from './datepicker-providers';

@Component({
  template: `
    <rb-datepicker-container class="foo">
      <input class="form-control" [formControl]="dateCtrl" ngbDatepicker />
    </rb-datepicker-container>
  `,
  imports: [DatepickerContainerComponent, NgbInputDatepicker, ReactiveFormsModule]
})
class TestComponent {
  dateCtrl = new FormControl(null as string);
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get dateInput() {
    return this.input('input');
  }

  get toggleButton() {
    return this.button('button.btn-outline-secondary');
  }

  get datepicker() {
    return this.element(NgbDatepicker);
  }

  get container() {
    return this.element(DatepickerContainerComponent);
  }
}

describe('DatepickerContainerComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), provideNgbDatepickerServices()]
    });

    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should display a toggle button, an input, and toggle the datepicker', () => {
    expect(tester.dateInput).not.toBeNull();
    expect(tester.toggleButton).not.toBeNull();
    expect(tester.datepicker).toBeNull();

    tester.toggleButton.click();

    expect(tester.datepicker).not.toBeNull();

    tester.toggleButton.click();

    expect(tester.datepicker).toBeNull();
  });

  it('should have the input-group class in addition to its original class', () => {
    expect(tester.container).toHaveClass('input-group');
    expect(tester.container).toHaveClass('foo');
  });
});
