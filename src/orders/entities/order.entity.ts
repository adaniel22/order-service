import {
  Collection,
  Entity,
  OneToMany,
  Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order {
  @PrimaryKey()
  id: string = randomUUID();

  @Property()
  status: string & Opt = 'pending';

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @OneToMany(() => OrderItem, (item) => item.order)
  items = new Collection<OrderItem>(this);
}
