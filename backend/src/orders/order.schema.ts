import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus, PaymentMethod } from '../common/types/enums';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id!: Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity!: number;

  @Prop({ type: Number, required: true })
  price_estimated!: number;

  @Prop({ type: Number })
  price_real?: number | null;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true },
})
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Market', required: true })
  market_id!: Types.ObjectId;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.NOUVELLE })
  status!: OrderStatus;

  @Prop({ type: String, enum: PaymentMethod, default: PaymentMethod.MOBILE_MONEY })
  payment_method!: PaymentMethod;

  @Prop({ type: String })
  cancel_reason?: string | null;

  @Prop({ type: String })
  failed_reason?: string | null;

  @Prop({ type: Number, required: true })
  price_estimated_total!: number;

  @Prop({ type: Number })
  price_real_total?: number | null;

  @Prop({ type: String, required: true })
  delivery_address!: string;

  @Prop({ type: String, required: true })
  delivery_city!: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items!: OrderItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.virtual('id').get(function (this: OrderDocument) {
  return this._id.toString();
});
