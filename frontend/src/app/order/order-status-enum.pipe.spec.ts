import { OrderStatusEnumPipe } from './order-status-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe.spec';
import { OrderStatus } from './order.model';

describe('OrderStatusEnumPipe', () => {
  it('should translate order statuses', () => {
    testEnumPipe<OrderStatus>(ts => new OrderStatusEnumPipe(ts), {
      DRAFT: 'En cours',
      FINALIZED: 'Finalisée',
      CANCELLED: 'Annulée'
    });
  });
});
