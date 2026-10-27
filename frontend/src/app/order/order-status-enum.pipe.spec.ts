import { describe, expect, test } from 'vitest';
import { testEnumPipe } from '../shared/base-enum-pipe-test';
import { OrderStatusEnumPipe } from './order-status-enum.pipe';

describe('OrderStatusEnumPipe', () => {
  test('should translate order statuses', () => {
    expect.hasAssertions();
    testEnumPipe(OrderStatusEnumPipe, {
      DRAFT: 'En cours',
      FINALIZED: 'Finalisée',
      CANCELLED: 'Annulée'
    });
  });
});
