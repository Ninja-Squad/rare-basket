import { animate, state, style, transition, trigger } from '@angular/animations';

/**
 * Animation triggered when the billing address is shown/hidden
 */
export const billingAddressAnimation = trigger('showHide', [
  state(
    'show',
    style({
      height: '*',
      opacity: 1
    })
  ),
  state(
    'hide',
    style({
      height: 0,
      opacity: 0
    })
  ),
  transition('show => hide', [animate('500ms ease-out')]),
  transition('hide => show', [animate('500ms ease-in')])
]);
