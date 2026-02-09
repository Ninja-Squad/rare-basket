import { OrderStatusEnumPipe } from './order-status-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe-test';
import { describe, test } from 'vitest';

describe('OrderStatusEnumPipe', () => {
  test('should translate order statuses', () => {
    testEnumPipe(OrderStatusEnumPipe, {
      DRAFT: 'En cours',
      FINALIZED: 'Finalisée',
      CANCELLED: 'Annulée'
    });
  });
});
