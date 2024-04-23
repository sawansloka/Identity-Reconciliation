import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.schema';
import { OrderService } from './order.service';

@Module({
    imports: [TypeOrmModule.forFeature([Order])],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderServiceModule { }
