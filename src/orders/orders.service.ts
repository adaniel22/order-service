import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { OrderItem } from './entities/order-item.entity';
import { ClientProxy } from '@nestjs/microservices';

export interface CatalogProduct {
  id: string;
  name: string;
  price: string;
}
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: EntityRepository<Order>,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) {}
  async create(createOrderDto: CreateOrderDto) {
    const em = this.orderRepository.getEntityManager();

    const order = new Order();
    let total = 0;

    for (const itemDto of createOrderDto.items) {
      const product = await this.fetchProduct(itemDto.productId);

      const orderItem = new OrderItem();
      orderItem.productId = product.id;
      orderItem.productName = product.name;
      orderItem.unitPrice = product.price;
      orderItem.quantity = itemDto.quantity;
      orderItem.order = order;

      order.items.add(orderItem);
      total += Number(product.price) * itemDto.quantity;
    }
    order.totalAmount = total.toFixed(2);

    order.totalAmount = total.toFixed(2);

    await em.persist(order).flush();

    this.natsClient.emit('order_created', {
      orderId: order.id,
      totalAmount: order.totalAmount,
      itemCount: order.items.count(),
      createdAt: order.createdAt,
    });

    return order;
  }

  async findAll() {
    return await this.orderRepository.findAll();
  }

  async findOne(id: string) {
    return await this.orderRepository.findOne({ id });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepository.findOne({ id });
    if (!order) {
      throw new NotFoundException(`Order not found`);
    }
    this.orderRepository.assign(order, updateOrderDto);
    await this.orderRepository.getEntityManager().flush();
    return order;
  }

  async remove(id: string) {
    const order = await this.orderRepository.findOne({ id });
    if (!order) {
      throw new NotFoundException(`Order not found`);
    }
    return await this.orderRepository.getEntityManager().remove(order).flush();
  }

  private async fetchProduct(productId: string): Promise<CatalogProduct> {
    const catalogUrl = this.config.get<string>('CATALOG_SERVICE_URL');
    const url = `${catalogUrl}/products/${productId}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<CatalogProduct>(url),
      );
      return response.data;
    } catch {
      throw new NotFoundException(
        `A(z) ${productId} azonosítójú termék nem található`,
      );
    }
  }
}
