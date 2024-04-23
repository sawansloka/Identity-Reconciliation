import { Module } from '@nestjs/common';
import { OrderModuleService } from './order.service';
import { OrderController } from './order.controller';
import { OrderServiceModule } from 'src/service/order/order.module';

@Module({
  imports: [OrderServiceModule],
  controllers: [OrderController],
  providers: [OrderModuleService],
})
export class OrderModule { }
