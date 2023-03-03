import { NgbConfig } from '@ng-bootstrap/ng-bootstrap';

/**
 * Provider function for unit tests, which disables animations in ng-bootstrap.
 */
export const provideDisabledNgbAnimation = () => {
  return [{ provide: NgbConfig, useValue: { animation: false } as NgbConfig }];
};
