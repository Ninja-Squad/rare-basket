import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DatepickerContainerComponent } from './datepicker-container.component';
import { provideI18nTesting } from '../i18n/mock-18n';
import { provideNgbDatepickerServices } from './datepicker-providers';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { form, FormField, FormRoot } from '@angular/forms/signals';

@Component({
  template: `
    <form [formRoot]="form">
      <rb-datepicker-container class="foo">
        <input class="form-control" [formField]="form.date" ngbDatepicker />
      </rb-datepicker-container>
    </form>
  `,
  imports: [DatepickerContainerComponent, NgbInputDatepicker, FormRoot, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly formValue = signal({ date: null as string | null });
  readonly form = form(this.formValue);
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly dateInput = this.root.getByCss('input');
  readonly toggleButton = this.root.getByCss('button.btn-outline-secondary');
  readonly datepicker = page.getByCss('ngb-datepicker');
  readonly container = this.root.getByCss('rb-datepicker-container');
}

describe('DatepickerContainerComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), provideNgbDatepickerServices()]
    });

    tester = new TestComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display a toggle button, an input, and toggle the datepicker', async () => {
    await expect.element(tester.dateInput).toBeInTheDocument();
    await expect.element(tester.toggleButton).toBeInTheDocument();
    await expect.element(tester.datepicker).not.toBeInTheDocument();

    await tester.toggleButton.click();

    await expect.element(tester.datepicker).toBeInTheDocument();

    await tester.toggleButton.click();

    await expect.element(tester.datepicker).not.toBeInTheDocument();
  });

  test('should have the input-group class in addition to its original class', async () => {
    await expect.element(tester.container).toHaveClass('input-group');
    await expect.element(tester.container).toHaveClass('foo');
  });
});
