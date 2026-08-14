import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: EntityRepository<Order>,
  ) {}
  async create(createOrderDto: CreateOrderDto) {
    const order = this.orderRepository.create(createOrderDto);
    await this.orderRepository.getEntityManager().persist(order).flush();
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
}
