/* eslint-disable @angular-eslint/no-host-metadata-property */
import { Component, ContentChild } from '@angular/core';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

/**
 * Component used to simplify the markup of a datepicker in a popup. It wraps the input which has the
 * ngbDatepicker directive, and prepends the toggle button to it.
 *
 * Example usage:
 *
 * <rb-datepicker-container>
 *   <input class="form-control" formControlName="date" ngbDatepicker />
 * </rb-datepicker-container>
 */
@Component({
  selector: 'rb-datepicker-container',
  templateUrl: './datepicker-container.component.html',
  host: {
    class: 'input-group'
  }
})
export class DatepickerContainerComponent {
  @ContentChild(NgbInputDatepicker)
  datePicker: NgbInputDatepicker;
  dateIcon = faCalendarAlt;

  toggle() {
    this.datePicker.toggle();
  }
}
