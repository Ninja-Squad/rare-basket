import { describe, it } from 'vitest';
import { OrderStatusEnumPipe } from './order-status-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe-test';

describe('OrderStatusEnumPipe', () => {
  it('should translate order statuses', () => {
    testEnumPipe(OrderStatusEnumPipe, {
      DRAFT: 'En cours',
      FINALIZED: 'Finalisée',
      CANCELLED: 'Annulée'
    });
  });
});
