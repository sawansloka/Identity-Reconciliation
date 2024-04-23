import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderModuleService } from './order.service';
import { OrderDto } from './order.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderModuleService) { }

  @Post('/contact/identify')
  @ApiOperation({ summary: 'Create or List an contact by taking email or phoneNumber from body' })
  @ApiResponse({ status: 200, description: 'The contact has been displayed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request properties' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() order: OrderDto) {
    order.phoneNumber = Number(order.phoneNumber);
    return await this.orderService.create(order);
  }

  @Get('/lists')
  @ApiOperation({ summary: 'Get List of all orders' })
  @ApiResponse({ status: 200, description: 'The listed orders has been displayed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request properties' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getList() {
    return await this.orderService.getList();
  }
}
