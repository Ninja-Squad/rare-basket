import { FormControlValidationDirective } from './form-control-validation.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

@Component({
  template: `
    <form [formGroup]="personForm" (ngSubmit)="submit()">
      <div class="form-group">
        <input class="form-control" id="lastName" formControlName="lastName" />
      </div>
      <button id="save">Save</button>
    </form>
  `,
  imports: [ReactiveFormsModule, FormControlValidationDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormComponent {
  personForm = new FormGroup({
    lastName: new FormControl('', Validators.required)
  });
  submit() {
    // do nothing
  }
}

class FormComponentTester {
  readonly fixture = TestBed.createComponent(FormComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly lastName = this.root.getByCss('#lastName');
  readonly save = this.root.getByCss('#save');

  async dispatch(locator: ReturnType<typeof this.root.getByCss>, type: string) {
    locator.element().dispatchEvent(new Event(type));
    await this.fixture.whenStable();
  }
}

describe('FormControlValidationDirective', () => {
  let tester: FormComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({});

    tester = new FormComponentTester();
    await tester.fixture.whenStable();
  });

  test('should add the is-invalid CSS class when touched', async () => {
    await expect.element(tester.lastName).not.toHaveClass('is-invalid');

    await tester.dispatch(tester.lastName, 'blur');

    await expect.element(tester.lastName).toHaveClass('is-invalid');
  });

  test('should add the is-invalid CSS class when enclosing form is submitted', async () => {
    await expect.element(tester.lastName).not.toHaveClass('is-invalid');

    await tester.save.click();

    await expect.element(tester.lastName).toHaveClass('is-invalid');
  });
});
