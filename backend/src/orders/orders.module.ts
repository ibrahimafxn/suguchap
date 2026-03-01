import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './order.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { Market, MarketSchema } from '../markets/market.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Market.name, schema: MarketSchema },
    ]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService, MongooseModule],
})
export class OrdersModule {}
