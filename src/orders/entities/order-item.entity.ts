import { Entity, ManyToOne, Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryKey()
  id: string = randomUUID();

  @Property()
  productId!: string;

  @Property()
  productName!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: string;

  @Property()
  quantity!: number;

  @ManyToOne(() => Order, { hidden: true })
  order!: Order;

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();
}
