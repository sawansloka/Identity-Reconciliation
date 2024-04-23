import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrderDto } from '../../module/order/order.dto';
import { Order } from '../../service/order/order.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LinkPrecedence } from 'src/enum';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly contactRepository: Repository<Order>,
    ) { }

    // Create a new order
    async createOrder(
        orderBody: OrderDto,
        linkPrecedence: LinkPrecedence,
        linkedId?: number,
    ): Promise<Order> {
        const order: Order = {
            email: orderBody.email || null,
            phoneNumber: orderBody.phoneNumber || null,
            linkPrecedence: linkPrecedence,
            linkedId: linkedId || null
        }
        return this.contactRepository.save(order);
    }

    // Find orders based on search parameters
    async find(searchParams: any): Promise<Order[]> {
        return this.contactRepository.find({
            where: searchParams,
            order: {
                createdAt: 'DESC'
            }
        })
    }

    // Find a single order based on search parameters
    async findOne(searchParams: any): Promise<Order> {
        return this.contactRepository.findOne({
            where: searchParams,
            order: {
            }
        })
    }

    // Update the link precedence of an order
    async updateLinkPrecedence(order: Order): Promise<Order> {
        return this.contactRepository.save(order);
    }

    // Find all orders
    async findAll() {
        return this.contactRepository.find({
            where: { deletedAt: null }
        })
    }
}

