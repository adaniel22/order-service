import { Entity, Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

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
}
