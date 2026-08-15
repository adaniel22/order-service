import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OrderItem } from './entities/order-item.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [MikroOrmModule.forFeature([Order, OrderItem]), HttpModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
