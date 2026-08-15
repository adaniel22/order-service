import { Migration } from '@mikro-orm/migrations';

export class Migration20260815115611 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "order_item" ("id" varchar(255) not null, "product_id" varchar(255) not null, "product_name" varchar(255) not null, "unit_price" numeric(10,2) not null, "quantity" int not null, "order_id" varchar(255) not null, "created_at" timestamptz not null, constraint "order_item_pkey" primary key ("id"));`,
    );

    this.addSql(
      `alter table "order_item" add constraint "order_item_order_id_foreign" foreign key ("order_id") references "order" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "order_item" cascade;`);
  }
}
