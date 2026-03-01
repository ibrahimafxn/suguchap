import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { Shop, ShopSchema } from './shop.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { Order, OrderSchema } from '../orders/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [SellerController],
  providers: [SellerService],
})
export class SellerModule {}
