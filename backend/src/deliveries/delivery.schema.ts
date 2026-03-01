import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DeliveryStatus } from '../common/types/enums';

export type DeliveryDocument = Delivery & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true },
})
export class Delivery {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  courier_id!: Types.ObjectId;

  @Prop({ type: String, enum: DeliveryStatus, default: DeliveryStatus.ASSIGNEE })
  status!: DeliveryStatus;

  @Prop({ type: Number })
  distance_km?: number | null;

  @Prop({ type: Number })
  eta_minutes?: number | null;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);

DeliverySchema.virtual('id').get(function (this: DeliveryDocument) {
  return this._id.toString();
});
