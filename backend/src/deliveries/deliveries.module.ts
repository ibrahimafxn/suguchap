import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Delivery, DeliverySchema } from './delivery.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Delivery.name, schema: DeliverySchema }])],
  providers: [],
  controllers: [],
  exports: [MongooseModule],
})
export class DeliveriesModule {}
