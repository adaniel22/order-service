import { Migration } from '@mikro-orm/migrations';

export class Migration20260814130104 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "order" ("id" varchar(255) not null, "status" varchar(255) not null default 'pending', "total_amount" numeric(10,2) not null, "created_at" timestamptz not null, constraint "order_pkey" primary key ("id"));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "order" cascade;`);
  }
}
