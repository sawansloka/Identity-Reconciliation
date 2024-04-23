import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContactResponseDto, OrderDto } from './order.dto';
import { Order } from '../../service/order/order.schema';
import { OrderService } from 'src/service/order/order.service';
import { LinkPrecedence } from 'src/enum';

@Injectable()
export class OrderModuleService {
  constructor(
    private readonly orderService: OrderService
  ) { }

  async create(order: OrderDto) {
    const { email, phoneNumber } = order;

    // Check if either email or phoneNumber is provided
    if (!email && !phoneNumber) {
      throw new HttpException('Either email or phoneNumber must be provided', HttpStatus.BAD_REQUEST);
    }

    let orderDetailEmail: Order[] = [];
    let orderDetailPhoneNumber: Order[] = [];

    // Fetch orders based on email and phoneNumber
    if (order.email) {
      const searchParams: any = { email: order.email, deletedAt: null };
      orderDetailEmail = await this.orderService.find(searchParams);
    }
    if (order.phoneNumber) {
      const searchParams: any = { phoneNumber: order.phoneNumber, deletedAt: null };
      orderDetailPhoneNumber = await this.orderService.find(searchParams);
    }

    // Initialize sets to store unique emails, phone numbers, and ids
    const emails: Set<string> = new Set();
    const phoneNumbers: Set<string> = new Set();
    const ids: Set<number> = new Set();

    // If no existing orders found, create a primary order
    if (!orderDetailEmail?.length && !orderDetailPhoneNumber?.length) {
      return this.createContact(order);
    }
    // If only phoneNumber exists, create a secondary order
    else if (!orderDetailEmail?.length && orderDetailPhoneNumber?.length && order.email && order.phoneNumber) {
      await this.createSecondaryContact(orderDetailPhoneNumber[0], order, emails, phoneNumbers, ids);
    }
    // If only email exists, create a secondary order
    else if (orderDetailEmail?.length && !orderDetailPhoneNumber?.length && order.email && order.phoneNumber) {
      await this.createSecondaryContact(orderDetailEmail[0], order, emails, phoneNumbers, ids);
    }

    // Add existing orders' data to sets
    orderDetailEmail && orderDetailEmail.forEach(async order => {
      await this.addSetData(emails, phoneNumbers, ids, order.email?.toString(), order.phoneNumber?.toString(), order.linkPrecedence === LinkPrecedence.SECONDARY ? order.id : null);
    });

    orderDetailPhoneNumber && orderDetailPhoneNumber.forEach(async order => {
      await this.addSetData(emails, phoneNumbers, ids, order.email?.toString(), order.phoneNumber?.toString(), order.linkPrecedence === LinkPrecedence.SECONDARY ? order.id : null);
    });

    // If email exists but phoneNumber is missing, fetch orders by email and update sets
    if (order.email && !order.phoneNumber) {
      let promises = [];
      orderDetailEmail && orderDetailEmail.forEach(order => {
        const searchParams: any = { phoneNumber: order.phoneNumber, deletedAt: null };
        promises.push(this.orderService.find(searchParams))
      })
      promises = await Promise.all(promises);
      promises[0].forEach(async order =>
        await this.addSetData(emails, phoneNumbers, ids, order.email?.toString(), order.phoneNumber?.toString(), order.linkPrecedence === LinkPrecedence.SECONDARY ? order.id : null)
      )
    }

    // If phoneNumber exists but email is missing, fetch orders by phoneNumber and update sets
    if (!order.email && order.phoneNumber) {
      let promises = [];
      orderDetailPhoneNumber && orderDetailPhoneNumber.forEach(order => {
        const searchParams: any = { email: order.email, deletedAt: null };
        promises.push(this.orderService.find(searchParams))
      })
      promises = await Promise.all(promises);
      promises[0].forEach(async order => await this.addSetData(emails, phoneNumbers, ids, order.email?.toString(), order.phoneNumber?.toString(), order.linkPrecedence === LinkPrecedence.SECONDARY ? order.id : null))
    }

    const emailArray = Array.from(emails);
    const phoneNumberArray = Array.from(phoneNumbers);

    // If there are multiple phone numbers, emails, and no linked ids, update the last secondary order
    if (phoneNumbers.size > 1 && emails.size > 1 && !ids.size) {
      const searchParams: any = { email: emailArray[emails.size - 2], phoneNumber: phoneNumberArray[phoneNumbers.size - 1] };
      const checkPrimaryOrder = await this.orderService.findOne(searchParams);
      if (!checkPrimaryOrder) {
        const lastOrder = orderDetailEmail[phoneNumbers.size - 2];
        const updateOrder = orderDetailPhoneNumber[phoneNumbers.size - 2];
        updateOrder.linkedId = lastOrder.id;
        updateOrder.linkPrecedence = LinkPrecedence.SECONDARY;
        ids.add(updateOrder.id)
        await this.orderService.updateLinkPrecedence(updateOrder);
      }
    }

    // Return the contact details
    return {
      contact: new ContactResponseDto(
        1,
        emailArray,
        phoneNumberArray,
        Array.from(ids)
      )
    }
  }

  // Create a primary order
  async createContact(order: OrderDto) {
    const newOrder = await this.orderService.createOrder(order, LinkPrecedence.PRIMARY);
    return {
      contact: new ContactResponseDto(
        1,
        [newOrder.email],
        [newOrder.phoneNumber.toString()],
        []
      )
    };
  }

  // Create a secondary order
  async createSecondaryContact(existingOrder: Order, newOrder: OrderDto, emails: Set<string>, phoneNumbers: Set<string>, ids: Set<number>) {
    const linkedId = existingOrder.id;
    const createdOrder = await this.orderService.createOrder(newOrder, LinkPrecedence.SECONDARY, linkedId);
    await this.addSetData(emails, phoneNumbers, ids, createdOrder.email?.toString(), createdOrder.phoneNumber?.toString(), createdOrder.linkPrecedence === LinkPrecedence.SECONDARY ? createdOrder.id : null);
  }

  // Add data to sets
  async addSetData(emails: Set<string>, phoneNumbers: Set<string>, ids: Set<number>, email: string, phoneNumber: string, linkedId: number) {
    emails.add(email);
    phoneNumbers.add(phoneNumber);
    if (linkedId) ids.add(linkedId)
  }

  // Get the list of orders
  async getList() {
    return await this.orderService.findAll();
  }
}
